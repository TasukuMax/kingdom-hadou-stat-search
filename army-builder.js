const ARMY_BUILDER_DEFAULT_RARITIES = RARITY_DEFS.map((row) => row.key);
const ARMY_BUILDER_ROW_KEYS = BUILDER_ROW_DEFS.map((row) => row.key);
const ARMY_POWER_BUILDER_CONFIG = S3_POWER_BUILDER_CONFIG ?? SEASON3.powerBuilderConfig ?? {};
const ARMY_SEARCH_CONFIG = ARMY_POWER_BUILDER_CONFIG.search ?? {};
const ARMY_BUILDER_GATES = ARMY_POWER_BUILDER_CONFIG.gates ?? {};
const ARMY_SLOT_SUITABILITY_FLOORS = ARMY_POWER_BUILDER_CONFIG.slotSuitabilityFloors ?? {
  commander: 0.7,
  vice: 0.65,
  aide: 0.55
};
const ARMY_SUPPORT_TOOL_CATALOG = S3_TOOL_CATALOG ?? SEASON3.toolCatalog ?? [];
const ARMY_SUPPORT_TOOL_NAME_MAP = Object.fromEntries(
  ARMY_SUPPORT_TOOL_CATALOG.map((entry) => [entry.key, entry.name])
);
const ARMY_BUILDER_LIMITS = {
  commanderSeeds: Math.max(ARMY_SEARCH_CONFIG.commanderSeeds ?? 12, 12),
  vicePool: 12,
  aidePool: 9,
  vicePairKeep: 24,
  keepUnitsPerCommander: 10,
  genericUnitPool: Math.max((ARMY_SEARCH_CONFIG.unitBeamWidth ?? 50) + 4, 54),
  armyBeamWidth: Math.max(ARMY_SEARCH_CONFIG.armyBeamWidth ?? 120, 80),
  finalArmies: 3,
  reserveCount: 8
};
const ARMY_FORMATION_RECOMMENDATION_BY_CONCEPT = {
  balanced: "basic",
  siege: "suikou",
  counter: "kakuyoku",
  debuff: "sakubou",
  defense: "kakuyoku"
};

const ARMY_SLOT_ROLE_CONDITION = {
  commander: "main",
  vice1: "vice",
  vice2: "vice",
  aide1: "aide",
  aide2: "aide"
};

const ARMY_SLOT_WEIGHT = {
  commander: 1.26,
  vice1: 1.05,
  vice2: 1,
  aide1: 0.78,
  aide2: 0.74
};

const ARMY_BASE_ROW_SCORE = {
  front: 48,
  middle: 46,
  back: 46
};

const ARMY_STAT_MAX_BY_KEY = STAT_DEFS.reduce((result, stat) => {
  result[stat.key] = Math.max(...preparedCharacters.map((character) => character[stat.key] ?? 0), 1);
  return result;
}, {});

const ARMY_UNIT_WEIGHT_MAP = SEASON3.builderWeights?.unitWeights ?? {};
const ARMY_ARMY_WEIGHT_MAP = SEASON3.builderWeights?.armyWeights ?? {};
const ARMY_PENALTY_MAP = SEASON3.builderWeights?.penalties ?? {};
const ARMY_ROSTER_STORAGE_KEY = "kh-army-roster-v4";
const ARMY_INVESTMENT_MULTIPLIER_OVERRIDES = ARMY_POWER_BUILDER_CONFIG.investmentTierMultipliers ?? {};
const ARMY_INVESTMENT_TIER_DEFS = [
  { key: "trained", label: "仕上がり", multiplier: ARMY_INVESTMENT_MULTIPLIER_OVERRIDES.trained ?? 1 },
  { key: "usable", label: "実戦投入", multiplier: ARMY_INVESTMENT_MULTIPLIER_OVERRIDES.usable ?? 0.78 },
  { key: "untrained", label: "未育成", multiplier: ARMY_INVESTMENT_MULTIPLIER_OVERRIDES.untrained ?? 0.45 }
];
const ARMY_EQUIPMENT_FIT_DEFS = [
  { key: "none", label: "装備なし", multiplier: 1 },
  { key: "matched", label: "適正装備あり", multiplier: 1.04 },
  { key: "mismatched", label: "装備はあるが噛み合い薄", multiplier: 0.96 }
];
const ARMY_INVESTMENT_MULTIPLIERS = Object.fromEntries(
  ARMY_INVESTMENT_TIER_DEFS.map((entry) => [entry.key, entry.multiplier])
);
const ARMY_EQUIPMENT_MULTIPLIERS = Object.fromEntries(
  ARMY_EQUIPMENT_FIT_DEFS.map((entry) => [entry.key, entry.multiplier])
);
const ARMY_MAX_CURRENT_MULTIPLIER = ARMY_INVESTMENT_MULTIPLIERS.trained * ARMY_EQUIPMENT_MULTIPLIERS.matched;
const ARMY_POWER_STAT_WEIGHTS = [1.18, 1.04, 0.9, 0.78];
const ARMY_POWER_SLOT_MULTIPLIERS = {
  commander: 1.08,
  vice1: 1.03,
  vice2: 1,
  aide1: 0.96,
  aide2: 0.94
};
const ARMY_RARITY_POWER_BONUS = {
  SSR: 420,
  SR: 280
};
const ARMY_CHAIN_POWER_BONUS = {
  早い: 90,
  普通: 70,
  遅い: 48
};
const ARMY_ROLE_TAG_LABELS = {
  "role.frontline-anchor": "前列耐久",
  "role.burst-commander": "主将火力",
  "role.disruptor": "妨害",
  "role.counter-enabler": "反撃支援",
  "role.flex-support": "補佐支援",
  "role.siege-breaker": "対物主軸",
  "siege.structure-damage-up": "対物補助",
  "tempo.attack-speed-up": "攻速上昇",
  "tempo.attack-speed-down": "攻速低下",
  "control.buff-strip": "強化解除",
  "control.fear": "恐怖",
  "control.dot": "継続削り",
  "support.heal": "回復",
  "support.cleanse": "弱化解除",
  "def.damage-cut": "被ダメ軽減",
  "def.debuff-immunity": "デバフ無効",
  "obj.gathering": "調達"
};
const ARMY_FEATURE_POWER_BONUS = {
  対物: 110,
  反撃: 92,
  被ダメ軽減: 84,
  回復: 80,
  弱化効果付与: 76,
  強化効果付与: 72,
  強化解除: 68,
  弱化解除: 64,
  攻速上昇: 58,
  攻速低下: 58,
  継続削り: 54,
  堅固: 50,
  デバフ無効: 48,
  会心: 44,
  調達: 20
};

const ARMY_GUIDE_DATA = buildArmyGuideMaps();
const ARMY_CHARACTER_META_BY_ID = new Map(
  preparedCharacters.map((character) => [character.id, deriveArmyCharacterMeta(character)])
);

let lastArmyPlannerResult = null;
let activeArmyAlternativeIndex = 0;
let armyRebuildTimer = null;
let armyRosterState = loadArmyRosterState();

function clampArmyScore(value) {
  return Math.max(0, Math.min(100, value));
}

function sumArmyValues(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

function averageArmyValues(values) {
  return values.length ? sumArmyValues(values) / values.length : 0;
}

function sanitizeArmyTierKey(value, definitions, fallback) {
  return definitions.some((entry) => entry.key === value) ? value : fallback;
}

function createEmptyArmyRosterState() {
  return {
    profiles: {},
    defaultInvestmentTier: "usable",
    defaultEquipmentFit: "none",
    ownedCount: 0
  };
}

function hydrateArmyRosterState(state) {
  const next = {
    profiles: {},
    defaultInvestmentTier: sanitizeArmyTierKey(
      state?.defaultInvestmentTier,
      ARMY_INVESTMENT_TIER_DEFS,
      "usable"
    ),
    defaultEquipmentFit: sanitizeArmyTierKey(
      state?.defaultEquipmentFit,
      ARMY_EQUIPMENT_FIT_DEFS,
      "none"
    ),
    ownedCount: 0
  };

  for (const character of preparedCharacters) {
    const raw = state?.profiles?.[character.id];
    if (!raw) {
      continue;
    }

    next.profiles[character.id] = {
      owned: Boolean(raw.owned),
      investmentTier: sanitizeArmyTierKey(
        raw.investmentTier,
        ARMY_INVESTMENT_TIER_DEFS,
        next.defaultInvestmentTier
      ),
      equipmentFit: sanitizeArmyTierKey(
        raw.equipmentFit,
        ARMY_EQUIPMENT_FIT_DEFS,
        next.defaultEquipmentFit
      )
    };

    if (next.profiles[character.id].owned) {
      next.ownedCount += 1;
    }
  }

  return next;
}

function loadArmyRosterState() {
  try {
    const raw = window.localStorage.getItem(ARMY_ROSTER_STORAGE_KEY);
    if (!raw) {
      return createEmptyArmyRosterState();
    }

    return hydrateArmyRosterState(JSON.parse(raw));
  } catch (error) {
    return createEmptyArmyRosterState();
  }
}

function saveArmyRosterState() {
  armyRosterState = hydrateArmyRosterState(armyRosterState);
  try {
    window.localStorage.setItem(ARMY_ROSTER_STORAGE_KEY, JSON.stringify(armyRosterState));
  } catch (error) {
    // Ignore storage failures so the planner remains usable in private mode.
  }
}

function getArmyRosterProfile(characterId) {
  return (
    armyRosterState.profiles?.[characterId] ?? {
      owned: false,
      investmentTier: armyRosterState.defaultInvestmentTier,
      equipmentFit: armyRosterState.defaultEquipmentFit
    }
  );
}

function hasArmyRosterSelection() {
  return (armyRosterState.ownedCount ?? 0) > 0;
}

function isArmyCharacterOwned(characterId) {
  return Boolean(getArmyRosterProfile(characterId).owned);
}

function patchArmyRosterProfile(characterId, patch) {
  const current = getArmyRosterProfile(characterId);
  armyRosterState.profiles[characterId] = {
    ...current,
    ...patch,
    investmentTier: sanitizeArmyTierKey(
      patch?.investmentTier ?? current.investmentTier,
      ARMY_INVESTMENT_TIER_DEFS,
      armyRosterState.defaultInvestmentTier
    ),
    equipmentFit: sanitizeArmyTierKey(
      patch?.equipmentFit ?? current.equipmentFit,
      ARMY_EQUIPMENT_FIT_DEFS,
      armyRosterState.defaultEquipmentFit
    ),
    owned: patch?.owned ?? current.owned
  };
  saveArmyRosterState();
}

function setArmyRosterOwned(characterId, owned) {
  patchArmyRosterProfile(characterId, {
    owned,
    investmentTier: getArmyRosterProfile(characterId).investmentTier || armyRosterState.defaultInvestmentTier,
    equipmentFit: getArmyRosterProfile(characterId).equipmentFit || armyRosterState.defaultEquipmentFit
  });
}

function setArmyRosterDefaults(nextDefaults) {
  armyRosterState.defaultInvestmentTier = sanitizeArmyTierKey(
    nextDefaults.defaultInvestmentTier ?? armyRosterState.defaultInvestmentTier,
    ARMY_INVESTMENT_TIER_DEFS,
    "usable"
  );
  armyRosterState.defaultEquipmentFit = sanitizeArmyTierKey(
    nextDefaults.defaultEquipmentFit ?? armyRosterState.defaultEquipmentFit,
    ARMY_EQUIPMENT_FIT_DEFS,
    "none"
  );
  saveArmyRosterState();
}

function setArmyRosterBatchByRarity(rarity) {
  for (const character of preparedCharacters.filter((entry) => entry.rarity === rarity)) {
    const profile = getArmyRosterProfile(character.id);
    armyRosterState.profiles[character.id] = {
      owned: true,
      investmentTier: profile.investmentTier || armyRosterState.defaultInvestmentTier,
      equipmentFit: profile.equipmentFit || armyRosterState.defaultEquipmentFit
    };
  }
  saveArmyRosterState();
}

function clearArmyRosterSelection() {
  armyRosterState.profiles = {};
  saveArmyRosterState();
}

function getOwnedArmyCharacters() {
  return preparedCharacters.filter((character) => isArmyCharacterOwned(character.id)).sort(compareCharactersBase);
}

function getArmyAvailabilityProfile(characterOrMeta) {
  const character = getArmyMeta(characterOrMeta)?.character ?? characterOrMeta;
  const usingRoster = hasArmyRosterSelection();
  const profile = getArmyRosterProfile(character.id);
  const investmentTier = usingRoster ? profile.investmentTier : "trained";
  const equipmentFit = usingRoster ? profile.equipmentFit : "none";
  const currentMultiplier = usingRoster
    ? (ARMY_INVESTMENT_MULTIPLIERS[investmentTier] ?? 1) * (ARMY_EQUIPMENT_MULTIPLIERS[equipmentFit] ?? 1)
    : ARMY_MAX_CURRENT_MULTIPLIER;
  const normalizedMultiplier = usingRoster ? currentMultiplier / ARMY_MAX_CURRENT_MULTIPLIER : 1;
  const potentialMultiplier = ARMY_MAX_CURRENT_MULTIPLIER;

  return {
    owned: usingRoster ? Boolean(profile.owned) : true,
    usingRoster,
    investmentTier,
    equipmentFit,
    currentMultiplier,
    normalizedMultiplier,
    currentReadinessScore: clampArmyScore(normalizedMultiplier * 100),
    potentialMultiplier
  };
}

function formatArmyEstimateNumber(value) {
  return `${Math.round(value).toLocaleString("ja-JP")}`;
}

function getArmyProfileLabel(definitions, key) {
  return definitions.find((entry) => entry.key === key)?.label ?? "-";
}

function armyRoleTagLabel(tag) {
  return ARMY_ROLE_TAG_LABELS[tag] ?? tag;
}

function renderArmySelectOptions(definitions, selectedKey) {
  return definitions
    .map(
      (entry) =>
        `<option value="${escapeHtml(entry.key)}"${entry.key === selectedKey ? " selected" : ""}>${escapeHtml(
          entry.label
        )}</option>`
    )
    .join("");
}

function normalizeArmyStat(character, statKey) {
  const maxValue = ARMY_STAT_MAX_BY_KEY[statKey] ?? 1;
  return clampArmyScore(((character[statKey] ?? 0) / maxValue) * 100);
}

function keepTopArmyEntries(entries, limit, scoreKey = "score") {
  return [...entries]
    .sort((left, right) => {
      const scoreDiff = (right[scoreKey] ?? right.total ?? 0) - (left[scoreKey] ?? left.total ?? 0);
      if (scoreDiff) {
        return scoreDiff;
      }

      return (right.tieBreaker ?? 0) - (left.tieBreaker ?? 0);
    })
    .slice(0, limit);
}

function countArmySetOverlap(leftSet, rightSet) {
  let overlap = 0;
  for (const value of leftSet) {
    if (rightSet.has(value)) {
      overlap += 1;
    }
  }
  return overlap;
}

function pickDiverseArmyUnits(candidates, limit) {
  const pool = keepTopArmyEntries(candidates, Math.max(limit * 6, limit), "total");
  const selected = [];

  while (pool.length && selected.length < limit) {
    let bestIndex = 0;
    let bestScore = -Infinity;

    pool.forEach((candidate, index) => {
      const overlapPenalty = averageArmyValues(
        selected.map((picked) => countArmySetOverlap(candidate.memberIds, picked.memberIds) * 4.2)
      );
      const sameCommanderPenalty = selected.filter((picked) => picked.commander.id === candidate.commander.id).length * 4;
      const score = candidate.total - overlapPenalty - sameCommanderPenalty + candidate.tieBreaker * 0.04;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    selected.push(pool.splice(bestIndex, 1)[0]);
  }

  return selected.sort((left, right) => right.total - left.total || right.tieBreaker - left.tieBreaker);
}

function buildArmyGuidePairKey(leftId, rightId) {
  const [minId, maxId] = leftId < rightId ? [leftId, rightId] : [rightId, leftId];
  return `${minId}:${maxId}`;
}

function buildArmyGuideMaps() {
  const pairScores = new Map();
  const slotScores = new Map();

  for (const character of preparedCharacters) {
    const placements = character.guide?.latestFormation?.placements ?? [];
    if (!placements.length) {
      continue;
    }

    const mapped = placements
      .map((placement) => {
        const target = characterByName[placement.name];
        if (!target) {
          return null;
        }

        return {
          slot: placement.slot,
          character: target
        };
      })
      .filter(Boolean);

    for (let index = 0; index < mapped.length; index += 1) {
      for (let inner = index + 1; inner < mapped.length; inner += 1) {
        const key = buildArmyGuidePairKey(mapped[index].character.id, mapped[inner].character.id);
        pairScores.set(key, (pairScores.get(key) ?? 0) + 1);
      }
    }

    const commanderPlacement = mapped.find((row) => row.slot === "主将");
    if (!commanderPlacement) {
      continue;
    }

    for (const placement of mapped) {
      if (placement.character.id === commanderPlacement.character.id) {
        continue;
      }

      const key = `${commanderPlacement.character.id}:${placement.slot}:${placement.character.id}`;
      slotScores.set(key, (slotScores.get(key) ?? 0) + 1);
    }
  }

  return { pairScores, slotScores };
}

function getArmyGuidePairScore(leftCharacter, rightCharacter) {
  if (!leftCharacter || !rightCharacter) {
    return 0;
  }

  return ARMY_GUIDE_DATA.pairScores.get(buildArmyGuidePairKey(leftCharacter.id, rightCharacter.id)) ?? 0;
}

function getArmyGuideSlotScore(commander, slotLabel, targetCharacter) {
  if (!commander || !targetCharacter) {
    return 0;
  }

  return ARMY_GUIDE_DATA.slotScores.get(`${commander.id}:${slotLabel}:${targetCharacter.id}`) ?? 0;
}

function normalizeChainRate(rate) {
  if (rate == null) {
    return 0;
  }

  return clampArmyScore(((rate - 20) / 12) * 100);
}

function getArmyRoleTags(character) {
  const tags = new Set(character.season3?.tags ?? []);
  const featureSet = new Set(character.featureTags);
  const battleTags = new Set(character.battleArtMeta?.tags ?? []);
  const topStats = [character.top1?.key, character.top2?.key];

  if (featureSet.has("対物")) {
    tags.add("role.siege-breaker");
    tags.add("siege.structure-damage-up");
  }

  if (featureSet.has("反撃") || battleTags.has("反撃")) {
    tags.add("role.counter-enabler");
  }

  if (
    featureSet.has("被ダメ軽減") ||
    featureSet.has("堅固") ||
    featureSet.has("回復") ||
    featureSet.has("弱化解除") ||
    featureSet.has("デバフ無効") ||
    character.type === "護" ||
    topStats.includes("defense")
  ) {
    tags.add("role.frontline-anchor");
  }

  if (
    featureSet.has("弱化効果付与") ||
    featureSet.has("攻速低下") ||
    featureSet.has("強化解除") ||
    featureSet.has("継続削り") ||
    character.type === "妨" ||
    character.top1?.key === "strategy"
  ) {
    tags.add("role.disruptor");
  }

  if (
    featureSet.has("強化効果付与") ||
    featureSet.has("回復") ||
    featureSet.has("弱化解除") ||
    featureSet.has("デバフ無効") ||
    character.guideSlot === "補佐" ||
    character.type === "援"
  ) {
    tags.add("role.flex-support");
  }

  if (
    ["attack", "war", "defense"].includes(character.top1?.key) ||
    character.guideSlot === "主将" ||
    character.type === "闘"
  ) {
    tags.add("role.burst-commander");
  }

  if (featureSet.has("攻速上昇") || battleTags.has("攻速上昇")) {
    tags.add("tempo.attack-speed-up");
  }
  if (featureSet.has("攻速低下") || battleTags.has("攻速低下")) {
    tags.add("tempo.attack-speed-down");
  }
  if (featureSet.has("強化解除")) {
    tags.add("control.buff-strip");
  }
  if (featureSet.has("継続削り")) {
    tags.add("control.dot");
  }
  if (character.battleArtText.includes("恐怖")) {
    tags.add("control.fear");
  }
  if (featureSet.has("回復") || battleTags.has("回復")) {
    tags.add("support.heal");
  }
  if (featureSet.has("弱化解除")) {
    tags.add("support.cleanse");
  }
  if (featureSet.has("被ダメ軽減")) {
    tags.add("def.damage-cut");
  }
  if (featureSet.has("デバフ無効")) {
    tags.add("def.debuff-immunity");
  }
  if (featureSet.has("調達") || character.objectiveTags.includes("gathering")) {
    tags.add("obj.gathering");
  }

  return [...tags];
}

function getArmyFeatureGroupScore(character, groupKey) {
  const featureWeights = ARMY_FEATURE_GROUP_WEIGHTS[groupKey] ?? {};
  const featureTotal = Object.entries(featureWeights).reduce((sum, [featureKey, weight]) => {
    return sum + (character.featureTags.includes(featureKey) ? weight : 0);
  }, 0);
  const maxFeatureTotal = Math.max(sumArmyValues(Object.values(featureWeights)), 1);

  const attackScore = normalizeArmyStat(character, "attack");
  const defenseScore = normalizeArmyStat(character, "defense");
  const warScore = normalizeArmyStat(character, "war");
  const strategyScore = normalizeArmyStat(character, "strategy");
  const battleTags = new Set(character.battleArtMeta?.tags ?? []);

  const featureRatio = (featureTotal / maxFeatureTotal) * 100;

  if (groupKey === "offense") {
    return clampArmyScore(
      featureRatio * 0.46 +
        attackScore * 0.28 +
        warScore * 0.18 +
        (battleTags.has("ダメージ") ? 8 : 0)
    );
  }

  if (groupKey === "defense") {
    return clampArmyScore(
      featureRatio * 0.5 +
        defenseScore * 0.3 +
        warScore * 0.12 +
        (battleTags.has("堅固") ? 8 : 0)
    );
  }

  if (groupKey === "control") {
    return clampArmyScore(
      featureRatio * 0.48 +
        strategyScore * 0.3 +
        warScore * 0.08 +
        (battleTags.has("弱化") ? 10 : 0)
    );
  }

  return clampArmyScore(
    featureRatio * 0.5 +
      strategyScore * 0.2 +
      defenseScore * 0.14 +
      (battleTags.has("回復") ? 10 : 0)
  );
}

function getArmyChainPotential(character) {
  return clampArmyScore(40 + character.personalities.length * 8);
}

function getArmyObjectiveFallbackScores(character, roleTags) {
  const offenseScore = getArmyFeatureGroupScore(character, "offense");
  const defenseScore = getArmyFeatureGroupScore(character, "defense");
  const controlScore = getArmyFeatureGroupScore(character, "control");
  const supportScore = getArmyFeatureGroupScore(character, "support");
  const pairScore = averageArmyValues([character.top1?.value ?? 0, character.top2?.value ?? 0]);
  const normalizedPairScore = clampArmyScore(
    (pairScore / averageArmyValues(Object.values(ARMY_STAT_MAX_BY_KEY))) * 100
  );
  const counterScore = roleTags.includes("role.counter-enabler") ? 100 : defenseScore * 0.35;
  const structureScore = roleTags.includes("role.siege-breaker")
    ? clampArmyScore(offenseScore * 0.45 + 55)
    : offenseScore * 0.38;

  return {
    pvp: clampArmyScore(
      offenseScore * 0.24 +
        defenseScore * 0.12 +
        controlScore * 0.22 +
        supportScore * 0.08 +
        counterScore * 0.12 +
        normalizedPairScore * 0.1 +
        getArmyChainPotential(character) * 0.12
    ),
    siege: clampArmyScore(
      structureScore * 0.36 +
        offenseScore * 0.18 +
        supportScore * 0.08 +
        defenseScore * 0.12 +
        normalizedPairScore * 0.14 +
        (roleTags.includes("tempo.attack-speed-up") ? 12 : 0)
    ),
    defense: clampArmyScore(
      defenseScore * 0.34 +
        supportScore * 0.18 +
        counterScore * 0.14 +
        controlScore * 0.1 +
        normalizedPairScore * 0.08 +
        (roleTags.includes("role.frontline-anchor") ? 16 : 0)
    ),
    gathering: character.featureTags.includes("調達") || roleTags.includes("obj.gathering") ? 100 : 16
  };
}

function getArmyRowScores(character, roleTags) {
  const scores = { ...ARMY_BASE_ROW_SCORE };
  const rowBoosts = new Set(character.battleArtMeta?.rowBoosts ?? []);
  const conditionSet = new Set(character.conditionKeys);

  for (const rowKey of ARMY_BUILDER_ROW_KEYS) {
    if (conditionSet.has(rowKey)) {
      scores[rowKey] += 18;
    }
    if (rowBoosts.has(rowKey)) {
      scores[rowKey] += 12;
    }
  }

  if (roleTags.includes("role.frontline-anchor")) {
    scores.front += 18;
    scores.middle += 8;
  }
  if (roleTags.includes("role.disruptor")) {
    scores.middle += 16;
    scores.back += 10;
  }
  if (roleTags.includes("role.flex-support")) {
    scores.back += 18;
    scores.middle += 8;
  }
  if (roleTags.includes("role.siege-breaker")) {
    scores.front += 8;
    scores.middle += 12;
  }
  if (character.type === "闘") {
    scores.front += 10;
  }
  if (character.type === "護") {
    scores.front += 12;
    scores.middle += 6;
  }
  if (character.type === "妨") {
    scores.middle += 10;
    scores.back += 6;
  }
  if (character.type === "援") {
    scores.back += 12;
  }

  return Object.fromEntries(
    Object.entries(scores).map(([rowKey, value]) => [rowKey, clampArmyScore(value)])
  );
}

function deriveArmyCharacterMeta(character) {
  const roleTags = getArmyRoleTags(character);
  const fallbackObjectiveScores = getArmyObjectiveFallbackScores(character, roleTags);
  const rowScores = getArmyRowScores(character, roleTags);

  return {
    character,
    roleTags,
    roleTagSet: new Set(roleTags),
    rowScores,
    groupScores: {
      offense: getArmyFeatureGroupScore(character, "offense"),
      defense: getArmyFeatureGroupScore(character, "defense"),
      control: getArmyFeatureGroupScore(character, "control"),
      support: getArmyFeatureGroupScore(character, "support")
    },
    objectiveScores: {
      pvp: character.season3?.objectiveScores?.pvp ?? fallbackObjectiveScores.pvp,
      siege: character.season3?.objectiveScores?.siege ?? fallbackObjectiveScores.siege,
      defense: character.season3?.objectiveScores?.defense ?? fallbackObjectiveScores.defense,
      gathering: character.season3?.objectiveScores?.gathering ?? fallbackObjectiveScores.gathering
    },
    slotScores: {
      commander: character.season3?.commanderScore ?? null,
      vice: character.season3?.viceScore ?? null,
      aide: character.season3?.aideScore ?? null
    },
    chainPotential: getArmyChainPotential(character)
  };
}

function getArmyMeta(characterOrMeta) {
  if (!characterOrMeta) {
    return null;
  }

  if (characterOrMeta.character) {
    return characterOrMeta;
  }

  return ARMY_CHARACTER_META_BY_ID.get(characterOrMeta.id) ?? null;
}

function getArmyAllowedMetas(selectedRarities, seedCharacter) {
  const usingRoster = hasArmyRosterSelection();
  const baseCharacters = usingRoster ? getOwnedArmyCharacters() : preparedCharacters;
  const allowedCharacters = baseCharacters.filter(
    (character) =>
      selectedRarities.includes(character.rarity) || (seedCharacter && character.id === seedCharacter.id)
  );

  return {
    usingRoster,
    ownedCount: armyRosterState.ownedCount ?? 0,
    allowedCharacters,
    allowedMetas: allowedCharacters.map((character) => getArmyMeta(character))
  };
}

function getArmyCharacterPotentialPower(characterOrMeta) {
  const character = getArmyMeta(characterOrMeta)?.character ?? characterOrMeta;
  const weightedStats = (character.rankedStats ?? []).reduce((sum, stat, index) => {
    return sum + (stat.value ?? 0) * (ARMY_POWER_STAT_WEIGHTS[index] ?? 0.72);
  }, 0);
  const featureBonus = sumArmyValues(
    uniqueValues(character.featureTags ?? [])
      .slice(0, 6)
      .map((featureKey) => ARMY_FEATURE_POWER_BONUS[featureKey] ?? 0)
  );
  const guideBonus =
    character.guideSlot === "主将" ? 96 : character.guideSlot === "副将" ? 68 : character.guideSlot === "補佐" ? 52 : 24;
  const typeBonus =
    character.type === "闘" ? 64 : character.type === "護" ? 58 : character.type === "妨" ? 54 : character.type === "援" ? 48 : 0;
  const chainBonus = ARMY_CHAIN_POWER_BONUS[character.battleArtMeta?.chainOrder ?? "普通"] ?? 60;
  const rarityBonus = ARMY_RARITY_POWER_BONUS[character.rarity] ?? 240;
  const potentialBase =
    (weightedStats + featureBonus * 0.62 + guideBonus + typeBonus + chainBonus + rarityBonus + character.tenpu * 1.26) * 1.18;

  return Math.round(potentialBase);
}

function getArmyCharacterPowerSnapshot(characterOrMeta) {
  const character = getArmyMeta(characterOrMeta)?.character ?? characterOrMeta;
  const availability = getArmyAvailabilityProfile(character);
  const basePotential = getArmyCharacterPotentialPower(character);
  const current = Math.round(basePotential * (availability.currentMultiplier / availability.potentialMultiplier));
  const potential = Math.round(basePotential);

  return {
    current,
    potential,
    growth: Math.max(0, potential - current),
    completeness: potential ? clampArmyScore((current / potential) * 100) : 0,
    availability
  };
}

function getArmyGrowthPriority(member, unit) {
  const snapshot = getArmyCharacterPowerSnapshot(member.meta);
  const slotWeight = ARMY_SLOT_WEIGHT[member.slotKey] ?? 1;
  return {
    id: member.meta.character.id,
    name: member.meta.character.name,
    slotLabel: member.label,
    unitLabel: `第${unit.index + 1}部隊`,
    growth: Math.round(snapshot.growth * slotWeight),
    current: snapshot.current,
    potential: snapshot.potential
  };
}

function getArmyUnitPowerEstimate(unit) {
  const memberSnapshots = unit.unitMembers.map((member) => {
    const snapshot = getArmyCharacterPowerSnapshot(member.meta);
    const slotMultiplier = ARMY_POWER_SLOT_MULTIPLIERS[member.slotKey] ?? 1;
    return {
      ...member,
      snapshot,
      slotMultiplier
    };
  });
  const synergyMultiplier =
    1 +
    ((unit.synergyScore ?? 50) - 50) * 0.0016 +
    ((unit.scoreBreakdown?.objectiveFitScore ?? 50) - 50) * 0.0012 +
    (((unit.rowScores?.[unit.assignedRow ?? unit.defaultRow] ?? 50) - 50) * 0.0008);
  const current = Math.round(
    sumArmyValues(memberSnapshots.map((entry) => entry.snapshot.current * entry.slotMultiplier)) * synergyMultiplier
  );
  const potential = Math.round(
    sumArmyValues(memberSnapshots.map((entry) => entry.snapshot.potential * entry.slotMultiplier)) * synergyMultiplier
  );

  return {
    current,
    potential,
    growth: Math.max(0, potential - current),
    completeness: potential ? clampArmyScore((current / potential) * 100) : 0,
    members: memberSnapshots
  };
}

function getArmyFormationPowerMultiplier(army) {
  const stats = army?.formation?.activeBonus?.stats ?? {};
  const statImpact =
    (stats.attack ?? 0) * 0.0026 +
    (stats.defense ?? 0) * 0.0018 +
    (stats.war ?? 0) * 0.0022 +
    (stats.strategy ?? 0) * 0.0021;
  const fitImpact = Math.max(0, (army?.scoreBreakdown?.formationFitScore ?? 50) - 50) * 0.0007;
  return 1 + Math.min(0.16, statImpact + fitImpact);
}

function getArmyPowerEstimate(army) {
  const formationMultiplier = getArmyFormationPowerMultiplier(army);
  const units = army.units.map((unit, index) => {
    const baseEstimate = getArmyUnitPowerEstimate(unit);
    const current = Math.round(baseEstimate.current * formationMultiplier);
    const potential = Math.round(baseEstimate.potential * formationMultiplier);

    return {
      ...unit,
      index,
      powerEstimate: {
        ...baseEstimate,
        current,
        potential,
        growth: Math.max(0, potential - current),
        formationMultiplier
      }
    };
  });
  const current = Math.round(sumArmyValues(units.map((unit) => unit.powerEstimate.current)));
  const potential = Math.round(sumArmyValues(units.map((unit) => unit.powerEstimate.potential)));
  const growthTargets = keepTopArmyEntries(
    units.flatMap((unit) => unit.unitMembers.map((member) => getArmyGrowthPriority(member, unit))),
    5,
    "growth"
  );

  return {
    current,
    potential,
    growth: Math.max(0, potential - current),
    completeness: potential ? clampArmyScore((current / potential) * 100) : 0,
    units,
    growthTargets,
    formationMultiplier
  };
}

function renderArmyRosterSummaryCards() {
  if (!elements.armyRosterSummaryGrid) {
    return;
  }

  const ownedCharacters = getOwnedArmyCharacters();
  const usingRoster = ownedCharacters.length > 0;
  const tierCounts = {
    trained: 0,
    usable: 0,
    untrained: 0
  };
  const equipmentCounts = {
    matched: 0,
    none: 0,
    mismatched: 0
  };
  const completeness = ownedCharacters.map((character) => getArmyCharacterPowerSnapshot(character).completeness);

  for (const character of ownedCharacters) {
    const profile = getArmyRosterProfile(character.id);
    tierCounts[profile.investmentTier] = (tierCounts[profile.investmentTier] ?? 0) + 1;
    equipmentCounts[profile.equipmentFit] = (equipmentCounts[profile.equipmentFit] ?? 0) + 1;
  }

  const cards = [
    {
      title: "手持ち選択",
      body: usingRoster ? `${ownedCharacters.length} 体を編成対象にしています。` : "未入力なら全武将から仮組みします。",
      detail: usingRoster ? `SSR/SR 合計 ${ownedCharacters.length} / 25 体以上で軍勢生成` : "手持ち入力なし"
    },
    {
      title: "育成段階",
      body: `仕上がり ${tierCounts.trained} / 実戦投入 ${tierCounts.usable} / 未育成 ${tierCounts.untrained}`,
      detail: usingRoster ? `平均完成度 ${averageArmyValues(completeness).toFixed(1)} / 100` : "未入力"
    },
    {
      title: "装備状態",
      body: `適正装備 ${equipmentCounts.matched} / 装備なし ${equipmentCounts.none} / 噛み合い薄 ${equipmentCounts.mismatched}`,
      detail: `新規選択の初期値: ${getArmyProfileLabel(
        ARMY_INVESTMENT_TIER_DEFS,
        armyRosterState.defaultInvestmentTier
      )} / ${getArmyProfileLabel(ARMY_EQUIPMENT_FIT_DEFS, armyRosterState.defaultEquipmentFit)}`
    }
  ];

  elements.armyRosterSummaryGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="army-summary-card">
          <strong>${escapeHtml(card.title)}</strong>
          <p class="field-note">${escapeHtml(card.body)}</p>
          <p class="toolbar-summary">${escapeHtml(card.detail)}</p>
        </article>
      `
    )
    .join("");
}

function renderArmyRosterGrid() {
  if (!elements.armyRosterGrid) {
    return;
  }

  const keyword = normalizeSearchText(elements.armyRosterSearch?.value ?? "");
  const filtered = preparedCharacters.filter((character) => !keyword || character.searchText.includes(keyword));

  if (!filtered.length) {
    elements.armyRosterGrid.innerHTML = renderEmptyState("検索に一致する武将がいません。");
    return;
  }

  elements.armyRosterGrid.innerHTML = filtered
    .map((character) => {
      const profile = getArmyRosterProfile(character.id);
      const snapshot = getArmyCharacterPowerSnapshot(character);
      const isOwned = profile.owned;
      const chips = [
        `${character.rarity} / ${character.type || "-"}`,
        `${character.top1?.label ?? "-"}1位`,
        isOwned ? getArmyProfileLabel(ARMY_INVESTMENT_TIER_DEFS, profile.investmentTier) : "",
        isOwned ? getArmyProfileLabel(ARMY_EQUIPMENT_FIT_DEFS, profile.equipmentFit) : ""
      ].filter(Boolean);

      return `
        <button
          class="army-roster-card ${isOwned ? "is-owned" : ""}"
          type="button"
          data-army-roster-toggle="${character.id}"
          aria-pressed="${isOwned ? "true" : "false"}"
        >
          <div class="army-roster-head">
            <img src="${escapeHtml(character.imageUrl)}" alt="${escapeHtml(character.name)}" loading="lazy" />
            <div class="army-roster-main">
              <h3>${escapeHtml(character.name)}</h3>
              <p>${escapeHtml(character.rarity)} / ${escapeHtml(character.type || "-")} / 天賦 ${escapeHtml(
                character.tenpu
              )}</p>
              <div class="army-roster-chip-list">
                ${chips.map((chip) => `<span class="army-roster-chip">${escapeHtml(chip)}</span>`).join("")}
              </div>
            </div>
          </div>
          <div class="army-roster-foot">
            <span>${isOwned ? "推定現在値" : "最大見込み"}</span>
            <span>${formatArmyEstimateNumber(isOwned ? snapshot.current : snapshot.potential)}</span>
          </div>
        </button>
      `;
    })
    .join("");
}

function renderArmyOwnedSettings() {
  if (!elements.armyOwnedSettings) {
    return;
  }

  const ownedCharacters = getOwnedArmyCharacters();
  if (!ownedCharacters.length) {
    elements.armyOwnedSettings.innerHTML = renderEmptyState(
      "手持ち武将を選ぶと、ここで育成段階と装備状態を個別入力できます。"
    );
    return;
  }

  elements.armyOwnedSettings.innerHTML = ownedCharacters
    .map((character) => {
      const profile = getArmyRosterProfile(character.id);
      const snapshot = getArmyCharacterPowerSnapshot(character);
      return `
        <article class="army-owned-card">
          <div class="army-owned-head">
            <img src="${escapeHtml(character.imageUrl)}" alt="${escapeHtml(character.name)}" loading="lazy" />
            <div class="army-owned-main">
              <h3>${escapeHtml(character.name)}</h3>
              <p>${escapeHtml(character.rarity)} / ${escapeHtml(character.type || "-")} / 天賦 ${escapeHtml(
                character.tenpu
              )}</p>
              <div class="army-roster-chip-list">
                <span class="army-roster-chip">${escapeHtml(character.top1?.label ?? "-")}1位</span>
                <span class="army-roster-chip">${escapeHtml(character.top2?.label ?? "-")}2位</span>
                ${character.featureTags
                  .slice(0, 2)
                  .map((tag) => `<span class="army-roster-chip">${escapeHtml(tag)}</span>`)
                  .join("")}
              </div>
            </div>
            <button class="mini-button" type="button" data-army-roster-remove="${character.id}">外す</button>
          </div>
          <div class="army-profile-grid">
            <label class="field">
              <span>育成段階</span>
              <select data-army-profile-id="${character.id}" data-army-profile-field="investmentTier">
                ${renderArmySelectOptions(ARMY_INVESTMENT_TIER_DEFS, profile.investmentTier)}
              </select>
            </label>
            <label class="field">
              <span>装備状態</span>
              <select data-army-profile-id="${character.id}" data-army-profile-field="equipmentFit">
                ${renderArmySelectOptions(ARMY_EQUIPMENT_FIT_DEFS, profile.equipmentFit)}
              </select>
            </label>
          </div>
          <p class="field-note army-inline-note">
            推定現在戦力 ${formatArmyEstimateNumber(snapshot.current)} / 最大見込み ${formatArmyEstimateNumber(
              snapshot.potential
            )} / 伸び幅 ${formatArmyEstimateNumber(snapshot.growth)}
          </p>
        </article>
      `;
    })
    .join("");
}

function renderArmyRosterUi() {
  renderArmyRosterSummaryCards();
  renderArmyRosterGrid();
  renderArmyOwnedSettings();
}

function scheduleArmyPlannerRebuild(immediate = false) {
  if (armyRebuildTimer) {
    window.clearTimeout(armyRebuildTimer);
    armyRebuildTimer = null;
  }

  const rerender = () => renderArmyPlanner(buildArmyPlannerResult());
  if (immediate) {
    rerender();
    return;
  }

  armyRebuildTimer = window.setTimeout(rerender, 120);
}

function getArmyMixedObjectiveScore(meta, objectiveMix) {
  return Object.entries(objectiveMix).reduce((sum, [objectiveKey, weight]) => {
    return sum + (meta.objectiveScores[objectiveKey] ?? 0) * weight;
  }, 0);
}

function getArmyConceptAffinity(meta, concept) {
  const featureScore = sumArmyValues(
    Object.entries(concept.featureWeights ?? {}).map(([featureKey, weight]) =>
      meta.character.featureTags.includes(featureKey) ? weight : 0
    )
  );
  const featureMax = Math.max(sumArmyValues(Object.values(concept.featureWeights ?? {})), 1);
  const tagScore = sumArmyValues(
    Object.entries(concept.tagWeights ?? {}).map(([tagKey, weight]) =>
      meta.roleTagSet.has(tagKey) ? weight : 0
    )
  );
  const tagMax = Math.max(sumArmyValues(Object.values(concept.tagWeights ?? {})), 1);

  return clampArmyScore(
    getArmyMixedObjectiveScore(meta, concept.objectiveMix) * 0.46 +
      (featureScore / featureMax) * 100 * 0.28 +
      (tagScore / tagMax) * 100 * 0.26
  );
}

function getArmySlotBaseScore(meta, slotKey, concept) {
  const rarityBase = meta.character.rarity === "SSR" ? 100 : 86;
  const tenpuRatio = (meta.character.tenpu / 900) * 100;
  const guideBonus =
    (slotKey === "commander" && meta.character.guideSlot === "主将") ||
    (slotKey.startsWith("vice") && meta.character.guideSlot === "副将") ||
    (slotKey.startsWith("aide") && meta.character.guideSlot === "補佐")
      ? 12
      : 0;
  const availability = getArmyAvailabilityProfile(meta);
  let rawScore = 0;

  if (slotKey === "commander") {
    const stored = meta.slotScores.commander;
    const commanderBias = concept.commanderTypeBias?.[meta.character.type] ?? 0;
    rawScore = clampArmyScore(
      (stored ?? 0) * 0.42 +
        getArmyConceptAffinity(meta, concept) * 0.2 +
        meta.groupScores.offense * 0.12 +
        meta.groupScores.defense * 0.12 +
        meta.groupScores.control * 0.06 +
        rarityBase * 0.03 +
        tenpuRatio * 0.05 +
        commanderBias +
        guideBonus
    );
    return clampArmyScore(rawScore * availability.normalizedMultiplier);
  }

  if (slotKey.startsWith("vice")) {
    const stored = meta.slotScores.vice;
    rawScore = clampArmyScore(
      (stored ?? 0) * 0.34 +
        getArmyConceptAffinity(meta, concept) * 0.22 +
        meta.groupScores.offense * 0.14 +
        meta.groupScores.control * 0.14 +
        meta.chainPotential * 0.08 +
        rarityBase * 0.03 +
        tenpuRatio * 0.05 +
        guideBonus
    );
    return clampArmyScore(rawScore * availability.normalizedMultiplier);
  }

  const stored = meta.slotScores.aide;
  const srAideBonus = meta.character.rarity === "SR" ? 4 : 0;
  rawScore = clampArmyScore(
    (stored ?? 0) * 0.34 +
      getArmyConceptAffinity(meta, concept) * 0.18 +
      meta.groupScores.support * 0.2 +
      meta.groupScores.defense * 0.1 +
      meta.groupScores.control * 0.08 +
      rarityBase * 0.03 +
      tenpuRatio * 0.03 +
      guideBonus +
      srAideBonus
  );
  return clampArmyScore(rawScore * availability.normalizedMultiplier);
}

function getArmyTacticSupportScore(commanderMeta, partnerMeta, desiredSlot) {
  const commanderType = commanderMeta.character.battleArtMeta?.type ?? "";
  const partnerBattleTags = new Set(partnerMeta.character.battleArtMeta?.tags ?? []);
  const partnerRoleTags = partnerMeta.roleTagSet;
  const sharedEnemyScope = (partnerMeta.character.battleArtMeta?.enemyScopes ?? []).some((scope) =>
    (commanderMeta.character.battleArtMeta?.enemyScopes ?? []).includes(scope)
  );
  const hasSameTypeSupport = commanderType && partnerBattleTags.has(`${commanderType}上昇`);
  const weakIntoDamage =
    partnerBattleTags.has("弱化") &&
    (commanderMeta.character.battleArtMeta?.tags ?? []).includes("ダメージ");
  const rowSupport = desiredSlot.startsWith("vice")
    ? partnerMeta.character.battleArtMeta?.rowBoosts.length ?? 0
    : 0;

  return clampArmyScore(
    (sharedEnemyScope ? 28 : 0) +
      (hasSameTypeSupport ? 24 : 0) +
      (weakIntoDamage ? 18 : 0) +
      rowSupport * 8 +
      (partnerRoleTags.has("role.flex-support") ? 10 : 0)
  );
}

function getArmyGuideBonus(commanderMeta, targetMeta, slotLabel) {
  const pairBonus = getArmyGuidePairScore(commanderMeta.character, targetMeta.character) * 10;
  const slotBonus = getArmyGuideSlotScore(commanderMeta.character, slotLabel, targetMeta.character) * 18;
  return clampArmyScore(pairBonus + slotBonus);
}

function getArmyViceFitness(commanderMeta, viceMeta, concept, slotKey) {
  const chainStats = getChainStats(commanderMeta.character, viceMeta.character);
  const chainScore = normalizeChainRate(chainStats.rate);
  const guideBonus = getArmyGuideBonus(
    commanderMeta,
    viceMeta,
    slotKey === "vice1" ? "副将1" : "副将2"
  );
  const supportScore = getArmyTacticSupportScore(commanderMeta, viceMeta, slotKey);

  return {
    score: clampArmyScore(
      getArmySlotBaseScore(viceMeta, slotKey, concept) * 0.44 +
        chainScore * 0.24 +
        getArmyConceptAffinity(viceMeta, concept) * 0.16 +
        guideBonus * 0.08 +
        supportScore * 0.08
    ),
    chainStats,
    guideBonus,
    supportScore
  };
}

function getArmyNewRoleCount(existingTags, incomingTags) {
  return incomingTags.filter((tag) => !existingTags.has(tag)).length;
}

function getArmyAideFitness(unitCore, aideMeta, concept, slotKey) {
  const unitTags = new Set(unitCore.flatMap((meta) => meta.roleTags));
  const newRoleCount = getArmyNewRoleCount(unitTags, aideMeta.roleTags);
  const guideBonus = getArmyGuideBonus(unitCore[0], aideMeta, slotKey === "aide1" ? "補佐1" : "補佐2");
  const duplicateSkills = unitCore.reduce((count, meta) => {
    const overlap = meta.character.skills.filter((skill) => aideMeta.character.skills.includes(skill)).length;
    return count + overlap;
  }, 0);
  const supportMatch = clampArmyScore(
    (aideMeta.roleTagSet.has("role.flex-support") ? 26 : 0) +
      (aideMeta.roleTagSet.has("support.heal") ? 22 : 0) +
      (aideMeta.roleTagSet.has("support.cleanse") ? 18 : 0) +
      (aideMeta.roleTagSet.has("def.damage-cut") ? 14 : 0) +
      newRoleCount * 8 -
      duplicateSkills * 5
  );

  return {
    score: clampArmyScore(
      getArmySlotBaseScore(aideMeta, slotKey, concept) * 0.48 +
        getArmyConceptAffinity(aideMeta, concept) * 0.18 +
        supportMatch * 0.24 +
        guideBonus * 0.1
    ),
    guideBonus,
    duplicateSkills,
    supportMatch
  };
}

function getArmyActiveSkillRatio(character, slotKey, rowKey) {
  const roleCondition = ARMY_SLOT_ROLE_CONDITION[slotKey];
  const skillRecords = character.skillRecords ?? [];
  if (!skillRecords.length) {
    return 72;
  }

  let activeCount = 0;

  for (const skill of skillRecords) {
    const rowConditions = skill.conditions.filter((conditionKey) =>
      ["front", "middle", "back"].includes(conditionKey)
    );
    const roleConditions = skill.conditions.filter((conditionKey) =>
      ["main", "vice", "aide"].includes(conditionKey)
    );
    const rowOk = !rowConditions.length || rowConditions.includes(rowKey);
    const roleOk = !roleConditions.length || roleConditions.includes(roleCondition);

    if (rowOk && roleOk) {
      activeCount += 1;
    }
  }

  return (activeCount / skillRecords.length) * 100;
}

function getArmyTempoOrderValue(character, concept) {
  const order = character.battleArtMeta?.chainOrder ?? "普通";
  return clampArmyScore((concept.orderWeights?.[order] ?? 0.72) * 100);
}

function chooseBestViceOrder(commanderMeta, viceMetaA, viceMetaB, concept) {
  const first = {
    vice1: getArmyViceFitness(commanderMeta, viceMetaA, concept, "vice1"),
    vice2: getArmyViceFitness(commanderMeta, viceMetaB, concept, "vice2")
  };
  const second = {
    vice1: getArmyViceFitness(commanderMeta, viceMetaB, concept, "vice1"),
    vice2: getArmyViceFitness(commanderMeta, viceMetaA, concept, "vice2")
  };

  const firstTempo =
    getArmyTempoOrderValue(viceMetaA.character, concept) * 0.52 +
    getArmyTempoOrderValue(viceMetaB.character, concept) * 0.48;
  const secondTempo =
    getArmyTempoOrderValue(viceMetaB.character, concept) * 0.52 +
    getArmyTempoOrderValue(viceMetaA.character, concept) * 0.48;

  const firstTotal = first.vice1.score + first.vice2.score + firstTempo * 0.1;
  const secondTotal = second.vice1.score + second.vice2.score + secondTempo * 0.1;

  if (secondTotal > firstTotal) {
    return {
      vice1: viceMetaB,
      vice2: viceMetaA,
      vice1Fitness: second.vice1,
      vice2Fitness: second.vice2
    };
  }

  return {
    vice1: viceMetaA,
    vice2: viceMetaB,
    vice1Fitness: first.vice1,
    vice2Fitness: first.vice2
  };
}

function getArmyUnitRowScores(unitMembers, concept) {
  const scores = {};

  for (const rowKey of ARMY_BUILDER_ROW_KEYS) {
    let total = 0;

    for (const member of unitMembers) {
      const rowPreference = member.meta.rowScores[rowKey] ?? 50;
      const activation = getArmyActiveSkillRatio(member.meta.character, member.slotKey, rowKey);
      const rowBoost = (member.meta.character.battleArtMeta?.rowBoosts ?? []).includes(rowKey) ? 12 : 0;
      total +=
        (rowPreference * 0.52 + activation * 0.4 + rowBoost) * (ARMY_SLOT_WEIGHT[member.slotKey] ?? 1);
    }

    const rowNeed = concept.rowTarget?.[rowKey] ?? 0;
    scores[rowKey] = clampArmyScore(total / 5 + rowNeed * 4);
  }

  return scores;
}

function getArmyPracticalityScore(memberMetas, slotDetails) {
  return clampArmyScore(
    averageArmyValues(
      memberMetas.map((meta, index) => {
        const slotKey = slotDetails[index];
        const availability = getArmyAvailabilityProfile(meta);
        let score =
          (meta.character.rarity === "SSR" ? 100 : 84) * 0.4 +
          (meta.character.tenpu / 900) * 100 * 0.6;
        if (slotKey.startsWith("aide") && meta.character.rarity === "SR") {
          score += 4;
        }
        return score * availability.normalizedMultiplier;
      })
    )
  );
}

function buildArmyUnitCandidate(commanderMeta, viceMetaA, viceMetaB, aideMetaA, aideMetaB, concept) {
  const viceOrder = chooseBestViceOrder(commanderMeta, viceMetaA, viceMetaB, concept);
  const unitCore = [commanderMeta, viceOrder.vice1, viceOrder.vice2];
  const aide1Fitness = getArmyAideFitness(unitCore, aideMetaA, concept, "aide1");
  const aide2Fitness = getArmyAideFitness(unitCore, aideMetaB, concept, "aide2");
  const aides =
    aide2Fitness.score > aide1Fitness.score
      ? [
          { meta: aideMetaB, slotKey: "aide1", fitness: getArmyAideFitness(unitCore, aideMetaB, concept, "aide1") },
          { meta: aideMetaA, slotKey: "aide2", fitness: getArmyAideFitness(unitCore, aideMetaA, concept, "aide2") }
        ]
      : [
          { meta: aideMetaA, slotKey: "aide1", fitness: aide1Fitness },
          { meta: aideMetaB, slotKey: "aide2", fitness: aide2Fitness }
        ];

  const unitMembers = [
    {
      slotKey: "commander",
      label: "主将",
      meta: commanderMeta,
      slotBaseScore: getArmySlotBaseScore(commanderMeta, "commander", concept)
    },
    {
      slotKey: "vice1",
      label: "副将1",
      meta: viceOrder.vice1,
      slotBaseScore: viceOrder.vice1Fitness.score,
      chainStats: viceOrder.vice1Fitness.chainStats
    },
    {
      slotKey: "vice2",
      label: "副将2",
      meta: viceOrder.vice2,
      slotBaseScore: viceOrder.vice2Fitness.score,
      chainStats: viceOrder.vice2Fitness.chainStats
    },
    {
      slotKey: aides[0].slotKey,
      label: aides[0].slotKey === "aide1" ? "補佐1" : "補佐2",
      meta: aides[0].meta,
      slotBaseScore: aides[0].fitness.score
    },
    {
      slotKey: aides[1].slotKey,
      label: aides[1].slotKey === "aide1" ? "補佐1" : "補佐2",
      meta: aides[1].meta,
      slotBaseScore: aides[1].fitness.score
    }
  ];

  const memberIds = unitMembers.map((member) => member.meta.character.id);
  if (new Set(memberIds).size !== unitMembers.length) {
    return null;
  }

  const slotFitScore = clampArmyScore(
    averageArmyValues(unitMembers.map((member) => member.slotBaseScore))
  );
  const objectiveFitScore = clampArmyScore(
    averageArmyValues(unitMembers.map((member) => getArmyConceptAffinity(member.meta, concept)))
  );
  const chainScores = unitMembers
    .filter((member) => member.chainStats)
    .map((member) => normalizeChainRate(member.chainStats.rate));
  const guideBonusScore = clampArmyScore(
    averageArmyValues([
      getArmyGuideBonus(commanderMeta, viceOrder.vice1, "副将1"),
      getArmyGuideBonus(commanderMeta, viceOrder.vice2, "副将2"),
      getArmyGuideBonus(commanderMeta, aides[0].meta, aides[0].slotKey === "aide1" ? "補佐1" : "補佐2"),
      getArmyGuideBonus(commanderMeta, aides[1].meta, aides[1].slotKey === "aide1" ? "補佐1" : "補佐2")
    ])
  );
  const roleBreadthScore = clampArmyScore(
    new Set(unitMembers.flatMap((member) => member.meta.roleTags)).size * 8
  );
  const synergyScore = clampArmyScore(
    averageArmyValues(chainScores) * 0.44 +
      guideBonusScore * 0.2 +
      roleBreadthScore * 0.18 +
      averageArmyValues([
        getArmyTacticSupportScore(commanderMeta, viceOrder.vice1, "vice1"),
        getArmyTacticSupportScore(commanderMeta, viceOrder.vice2, "vice2"),
        aides[0].fitness.supportMatch,
        aides[1].fitness.supportMatch
      ]) *
        0.18
  );
  const tempoScore = clampArmyScore(
    getArmyTempoOrderValue(commanderMeta.character, concept) * 0.46 +
      getArmyTempoOrderValue(viceOrder.vice1.character, concept) * 0.28 +
      getArmyTempoOrderValue(viceOrder.vice2.character, concept) * 0.26
  );
  const pressureScore = clampArmyScore(
    commanderMeta.groupScores.offense * 0.42 +
      viceOrder.vice1.groupScores.offense * 0.22 +
      viceOrder.vice2.groupScores.offense * 0.22 +
      averageArmyValues(unitMembers.map((member) => member.meta.objectiveScores[concept.primaryObjective] ?? 0)) * 0.14
  );
  const sustainScore = clampArmyScore(
    averageArmyValues(unitMembers.map((member) => member.meta.groupScores.defense)) * 0.48 +
      averageArmyValues(
        unitMembers.map((member) =>
          member.meta.roleTagSet.has("support.heal") || member.meta.roleTagSet.has("support.cleanse") ? 100 : 36
        )
      ) *
        0.18 +
      averageArmyValues(
        unitMembers.map((member) => (member.meta.roleTagSet.has("role.frontline-anchor") ? 100 : 40))
      ) *
        0.34
  );
  const utilityScore = clampArmyScore(
    averageArmyValues(unitMembers.map((member) => member.meta.groupScores.control)) * 0.48 +
      averageArmyValues(unitMembers.map((member) => member.meta.groupScores.support)) * 0.36 +
      averageArmyValues(
        unitMembers.map((member) =>
          member.meta.roleTagSet.has("control.buff-strip") || member.meta.roleTagSet.has("control.fear") ? 100 : 34
        )
      ) *
        0.16
  );
  const investmentScore = getArmyPracticalityScore(
    unitMembers.map((member) => member.meta),
    unitMembers.map((member) => member.slotKey)
  );

  const unitWeights =
    ARMY_UNIT_WEIGHT_MAP[concept.primaryObjective] ??
    ARMY_UNIT_WEIGHT_MAP.pvp ?? {
      slotFitScore: 0.18,
      objectiveFitScore: 0.18,
      synergyScore: 0.18,
      tempoScore: 0.16,
      pressureScore: 0.12,
      sustainScore: 0.1,
      utilityScore: 0.04,
      investmentScore: 0.04
    };

  const scoreBreakdown = {
    slotFitScore,
    objectiveFitScore,
    synergyScore,
    tempoScore,
    pressureScore,
    sustainScore,
    utilityScore,
    investmentScore
  };

  const total = clampArmyScore(
    Object.entries(scoreBreakdown).reduce((sum, [scoreKey, scoreValue]) => {
      return sum + scoreValue * (unitWeights[scoreKey] ?? 0);
    }, 0)
  );
  const rowScores = getArmyUnitRowScores(unitMembers, concept);
  const defaultRow = keepTopArmyEntries(
    ARMY_BUILDER_ROW_KEYS.map((rowKey) => ({ rowKey, score: rowScores[rowKey] })),
    1
  )[0].rowKey;
  const highTags = uniqueValues(
    unitMembers.flatMap((member) =>
      member.meta.character.featureTags.filter((featureKey) => concept.featureWeights?.[featureKey] >= 10)
    )
  );
  const roleTags = uniqueValues(unitMembers.flatMap((member) => member.meta.roleTags));
  const chainSummary = unitMembers
    .filter((member) => member.chainStats)
    .map((member) => `${member.label}${formatPercent(member.chainStats.rate)}`)
    .join(" / ");

  const reasons = [
    `${commanderMeta.character.name}を主将にした時の主将適性が高い`,
    chainSummary ? `副将連鎖率は ${chainSummary}` : "",
    highTags.length ? `コンセプト一致タグ: ${highTags.slice(0, 4).join(" / ")}` : "",
    guideBonusScore >= 36 ? "GameWith のおすすめ編成に近い組み合わせが含まれる" : "",
    roleTags.includes("role.flex-support") ? "補佐が支援役を埋めて、技能条件が崩れにくい" : ""
  ].filter(Boolean);

  const warnings = [
    averageArmyValues(chainScores) < 40 ? "副将連鎖率は高めではない" : "",
    !roleTags.includes("role.frontline-anchor") ? "前列維持役が薄い" : "",
    !roleTags.includes("role.flex-support") ? "補佐の支援色は弱め" : ""
  ].filter(Boolean);

  return {
    signature: [
      commanderMeta.character.id,
      ...[viceOrder.vice1.character.id, viceOrder.vice2.character.id].sort((left, right) => left - right),
      ...[aides[0].meta.character.id, aides[1].meta.character.id].sort((left, right) => left - right)
    ].join(":"),
    total,
    tieBreaker: synergyScore + objectiveFitScore,
    commander: commanderMeta.character,
    unitMembers,
    memberIds: new Set(memberIds),
    rowScores,
    defaultRow,
    scoreBreakdown,
    chainAverage: averageArmyValues(chainScores),
    synergyScore,
    sustainScore,
    guideBonusScore,
    reasons: reasons.slice(0, 4),
    warnings: warnings.slice(0, 3),
    roleTags,
    highTags
  };
}

function getArmyCommanderPool(allowedMetas, concept, seedMeta, seedSlots) {
  const basePool = keepTopArmyEntries(
    allowedMetas.map((meta) => ({
      meta,
      score: getArmySlotBaseScore(meta, "commander", concept) + getArmyConceptAffinity(meta, concept) * 0.22
    })),
    ARMY_BUILDER_LIMITS.commanderSeeds
  ).map((entry) => entry.meta);

  if (
    seedMeta &&
    seedSlots.includes("commander") &&
    !basePool.some((meta) => meta.character.id === seedMeta.character.id)
  ) {
    basePool.push(seedMeta);
  }

  return uniqueValues(basePool);
}

function buildVicePairs(commanderMeta, allowedMetas, concept, forcedViceMeta) {
  const vicePool = keepTopArmyEntries(
    allowedMetas
      .filter((meta) => meta.character.id !== commanderMeta.character.id)
      .filter((meta) => !forcedViceMeta || meta.character.id !== forcedViceMeta.character.id)
      .map((meta) => ({
        meta,
        score:
          getArmyViceFitness(commanderMeta, meta, concept, "vice1").score +
          getArmyViceFitness(commanderMeta, meta, concept, "vice2").score
      })),
    ARMY_BUILDER_LIMITS.vicePool
  ).map((entry) => entry.meta);

  const pairs = [];

  if (forcedViceMeta) {
    for (const meta of vicePool) {
      if (meta.character.id === forcedViceMeta.character.id) {
        continue;
      }
      pairs.push([forcedViceMeta, meta]);
    }
  } else {
    for (let index = 0; index < vicePool.length; index += 1) {
      for (let inner = index + 1; inner < vicePool.length; inner += 1) {
        pairs.push([vicePool[index], vicePool[inner]]);
      }
    }
  }

  return keepTopArmyEntries(
    pairs.map(([leftMeta, rightMeta]) => ({
      pair: [leftMeta, rightMeta],
      score:
        getArmyViceFitness(commanderMeta, leftMeta, concept, "vice1").score +
        getArmyViceFitness(commanderMeta, rightMeta, concept, "vice2").score +
        getArmyGuidePairScore(leftMeta.character, rightMeta.character) * 10
    })),
    ARMY_BUILDER_LIMITS.vicePairKeep
  ).map((entry) => entry.pair);
}

function buildAidePairs(commanderMeta, vicePair, allowedMetas, concept, forcedAideMeta) {
  const core = [commanderMeta, ...vicePair];
  const aidePool = keepTopArmyEntries(
    allowedMetas
      .filter((meta) => !core.some((coreMeta) => coreMeta.character.id === meta.character.id))
      .filter((meta) => !forcedAideMeta || meta.character.id !== forcedAideMeta.character.id)
      .map((meta) => ({
        meta,
        score:
          getArmyAideFitness(core, meta, concept, "aide1").score +
          getArmyAideFitness(core, meta, concept, "aide2").score
      })),
    ARMY_BUILDER_LIMITS.aidePool
  ).map((entry) => entry.meta);

  const pairs = [];

  if (forcedAideMeta) {
    for (const meta of aidePool) {
      if (meta.character.id === forcedAideMeta.character.id) {
        continue;
      }
      pairs.push([forcedAideMeta, meta]);
    }
  } else {
    for (let index = 0; index < aidePool.length; index += 1) {
      for (let inner = index + 1; inner < aidePool.length; inner += 1) {
        pairs.push([aidePool[index], aidePool[inner]]);
      }
    }
  }

  return pairs;
}

function buildUnitCandidatesForCommander(commanderMeta, allowedMetas, concept, options = {}) {
  const forcedViceMeta = options.forcedViceMeta ?? null;
  const forcedAideMeta = options.forcedAideMeta ?? null;
  const vicePairs = buildVicePairs(commanderMeta, allowedMetas, concept, forcedViceMeta);
  const candidates = [];
  const signatureSet = new Set();

  for (const vicePair of vicePairs) {
    const aidePairs = buildAidePairs(commanderMeta, vicePair, allowedMetas, concept, forcedAideMeta);

    for (const aidePair of aidePairs) {
      const candidate = buildArmyUnitCandidate(
        commanderMeta,
        vicePair[0],
        vicePair[1],
        aidePair[0],
        aidePair[1],
        concept
      );

      if (!candidate || signatureSet.has(candidate.signature)) {
        continue;
      }

      signatureSet.add(candidate.signature);
      candidates.push(candidate);
    }
  }

  return pickDiverseArmyUnits(candidates, ARMY_BUILDER_LIMITS.keepUnitsPerCommander);
}

function resolveArmySeedSlots(seedCharacter, modeKey) {
  if (!seedCharacter) {
    return [];
  }

  if (modeKey === "best") {
    return ["commander", "vice", "aide"];
  }

  return [modeKey];
}

function buildSeedUnitCandidates(seedMeta, seedSlots, allowedMetas, commanderPool, concept) {
  if (!seedMeta || !seedSlots.length) {
    return [];
  }

  const candidates = [];

  if (seedSlots.includes("commander")) {
    candidates.push(...buildUnitCandidatesForCommander(seedMeta, allowedMetas, concept));
  }

  if (seedSlots.includes("vice")) {
    for (const commanderMeta of commanderPool.filter((meta) => meta.character.id !== seedMeta.character.id)) {
      candidates.push(
        ...buildUnitCandidatesForCommander(commanderMeta, allowedMetas, concept, {
          forcedViceMeta: seedMeta
        })
      );
    }
  }

  if (seedSlots.includes("aide")) {
    for (const commanderMeta of commanderPool.filter((meta) => meta.character.id !== seedMeta.character.id)) {
      candidates.push(
        ...buildUnitCandidatesForCommander(commanderMeta, allowedMetas, concept, {
          forcedAideMeta: seedMeta
        })
      );
    }
  }

  return pickDiverseArmyUnits(
    candidates.filter((candidate) => candidate.memberIds.has(seedMeta.character.id)),
    Math.min(ARMY_BUILDER_LIMITS.genericUnitPool, 24)
  );
}

function buildGenericUnitCandidates(allowedMetas, commanderPool, concept) {
  const unitCandidates = [];
  const signatureSet = new Set();

  for (const commanderMeta of commanderPool) {
    for (const candidate of buildUnitCandidatesForCommander(commanderMeta, allowedMetas, concept)) {
      if (signatureSet.has(candidate.signature)) {
        continue;
      }
      signatureSet.add(candidate.signature);
      unitCandidates.push(candidate);
    }
  }

  return pickDiverseArmyUnits(unitCandidates, ARMY_BUILDER_LIMITS.genericUnitPool);
}

function sanitizeArmyFormationChoiceKey(value) {
  return ARMY_FORMATION_SELECT_DEFS.some((entry) => entry.key === value) ? value : "auto";
}

function getConceptRecommendedFormationKey(concept) {
  return ARMY_FORMATION_RECOMMENDATION_BY_CONCEPT[concept?.key] ?? "basic";
}

function getArmyFormationBonusValue(stats = {}) {
  return (
    (stats.attack ?? 0) * 1 +
    (stats.defense ?? 0) * 0.86 +
    (stats.war ?? 0) * 0.94 +
    (stats.strategy ?? 0) * 0.92
  );
}

function formatArmyFormationBonusSummary(bonus) {
  if (!bonus) {
    return "発動条件は未達です。";
  }

  const statMap = {
    attack: "攻撃",
    defense: "防御",
    war: "戦威",
    strategy: "策略"
  };
  const statText = Object.entries(bonus.stats ?? {})
    .map(([statKey, value]) => `${statMap[statKey] ?? statKey}+${value}%`)
    .join(" / ");

  return `${bonus.type}タイプ${bonus.minUnits}部隊以上: ${statText}`;
}

function getArmyFormationActiveBonus(units, formation) {
  const typeCounts = units.reduce((result, unit) => {
    const typeKey = unit.commander.type || "-";
    result[typeKey] = (result[typeKey] ?? 0) + 1;
    return result;
  }, {});

  const activeBonuses = (formation.bonuses ?? [])
    .map((bonus) => ({
      ...bonus,
      count: typeCounts[bonus.type] ?? 0,
      value: getArmyFormationBonusValue(bonus.stats)
    }))
    .filter((bonus) => bonus.count >= bonus.minUnits)
    .sort((left, right) => right.value - left.value);

  return activeBonuses[0] ?? null;
}

function getArmyFormationSlotTempoBias(slotKey, formation) {
  const baseSecond = getFormationSlotBaseSecond(formation, slotKey);
  return clampArmyScore(((60 - baseSecond) / 40) * 100) / 100;
}

function getArmyFormationPressureBias(concept) {
  const biasMap = {
    balanced: 0.56,
    siege: 0.82,
    counter: 0.34,
    debuff: 0.78,
    defense: 0.28
  };
  return biasMap[concept?.key] ?? 0.5;
}

function getArmyFormationPlacementScore(unit, slot, formation, concept) {
  const rowScore = unit.rowScores[slot.rowKey] ?? unit.rowScores[unit.defaultRow] ?? 50;
  const tempoBias = getArmyFormationSlotTempoBias(slot.key, formation);
  const pressureProfile = clampArmyScore(
    (unit.scoreBreakdown?.pressureScore ?? 50) * 0.58 + (unit.scoreBreakdown?.tempoScore ?? 50) * 0.42
  );
  const stabilityProfile = clampArmyScore(
    (unit.scoreBreakdown?.sustainScore ?? 50) * 0.62 + (unit.scoreBreakdown?.utilityScore ?? 50) * 0.38
  );
  const pressureBias = getArmyFormationPressureBias(concept);
  const slotFitScore = clampArmyScore(
    pressureProfile * tempoBias * pressureBias +
      stabilityProfile * (1 - tempoBias) * (1 - pressureBias) +
      pressureProfile * (1 - pressureBias) * 0.18 +
      stabilityProfile * pressureBias * 0.12
  );
  const orderLabel = unit.commander.battleArtMeta?.chainOrder ?? "普通";
  const orderBonus = clampArmyScore((concept.orderWeights?.[orderLabel] ?? 0.72) * 100);

  return clampArmyScore(rowScore * 0.68 + slotFitScore * 0.22 + orderBonus * 0.1);
}

function chooseArmyFormationAssignment(units, concept, formation) {
  let best = null;

  function walk(index, remainingSlots, currentScore, slotKeys) {
    if (index === units.length) {
      if (!best || currentScore > best.score) {
        best = {
          score: currentScore,
          slotKeys: [...slotKeys]
        };
      }
      return;
    }

    for (let slotIndex = 0; slotIndex < remainingSlots.length; slotIndex += 1) {
      const slot = remainingSlots[slotIndex];
      const placementScore = getArmyFormationPlacementScore(units[index], slot, formation, concept);
      const nextSlots = [...remainingSlots.slice(0, slotIndex), ...remainingSlots.slice(slotIndex + 1)];
      slotKeys.push(slot.key);
      walk(index + 1, nextSlots, currentScore + placementScore, slotKeys);
      slotKeys.pop();
    }
  }

  walk(0, formation.slots, 0, []);

  if (best) {
    return {
      score: best.score,
      slotKeys: best.slotKeys,
      rows: best.slotKeys.map((slotKey) => getFormationSlotMeta(formation, slotKey).rowKey)
    };
  }

  const fallbackSlotKeys = formation.slots.map((slot) => slot.key);
  return {
    score: sumArmyValues(
      fallbackSlotKeys.map((slotKey, index) => {
        const slot = getFormationSlotMeta(formation, slotKey);
        return units[index]?.rowScores?.[slot.rowKey] ?? 50;
      })
    ),
    slotKeys: fallbackSlotKeys,
    rows: fallbackSlotKeys.map((slotKey) => getFormationSlotMeta(formation, slotKey).rowKey)
  };
}

function getArmyRuleCoverage(units, concept) {
  const unitTagSets = units.map((unit) => new Set(unit.roleTags));
  const requiredRules = [
    ...(S3_ROLE_BUCKETS[concept.primaryObjective]?.required ?? []),
    ...(concept.required ?? [])
  ];
  const preferredRules = [
    ...(S3_ROLE_BUCKETS[concept.primaryObjective]?.preferred ?? []),
    ...(concept.preferred ?? [])
  ];

  const evaluated = [];

  for (const rule of [...requiredRules, ...preferredRules]) {
    const count = unitTagSets.filter((tagSet) => tagSet.has(rule.tag)).length;
    const ratio = Math.min(1, count / Math.max(rule.minUnits ?? 1, 1));
    evaluated.push({
      ...rule,
      count,
      ratio,
      isRequired: requiredRules.includes(rule)
    });
  }

  return evaluated;
}

function evaluateArmyComposition(units, concept, seedMeta) {
  const rowAssignment = chooseArmyRowAssignment(units, concept);
  const augmentedUnits = units.map((unit, index) => ({
    ...unit,
    assignedRow: rowAssignment.rows[index] ?? unit.defaultRow
  }));
  const ruleCoverage = getArmyRuleCoverage(augmentedUnits, concept);
  const rowCounts = ARMY_BUILDER_ROW_KEYS.reduce((result, rowKey) => {
    result[rowKey] = augmentedUnits.filter((unit) => unit.assignedRow === rowKey).length;
    return result;
  }, {});
  const roleCoverageScore = clampArmyScore(
    averageArmyValues(
      ruleCoverage.map((rule) => rule.ratio * 100 * Math.max(rule.weight ?? 1, 0.4))
    )
  );
  const commanderQualityScore = clampArmyScore(
    averageArmyValues(
      augmentedUnits.map((unit) => getArmySlotBaseScore(getArmyMeta(unit.commander), "commander", concept))
    )
  );
  const synergyCoverageScore = clampArmyScore(
    averageArmyValues(augmentedUnits.map((unit) => unit.chainAverage)) * 0.42 +
      averageArmyValues(augmentedUnits.map((unit) => unit.synergyScore)) * 0.58
  );
  const stabilityScore = clampArmyScore(
    averageArmyValues(augmentedUnits.map((unit) => unit.sustainScore)) * 0.62 +
      averageArmyValues(augmentedUnits.map((unit) => unit.rowScores[unit.assignedRow] ?? 0)) * 0.38
  );
  const objectivePurityScore = clampArmyScore(
    averageArmyValues(
      augmentedUnits.map((unit) => unit.scoreBreakdown.objectiveFitScore)
    ) *
      0.62 +
      roleCoverageScore * 0.38
  );
  const investmentEfficiencyScore = clampArmyScore(
    averageArmyValues(augmentedUnits.map((unit) => unit.scoreBreakdown.investmentScore))
  );
  const armyPowerScore = clampArmyScore(averageArmyValues(augmentedUnits.map((unit) => unit.total)));

  const penalties = {};
  const commanderTypeCounts = augmentedUnits.reduce((result, unit) => {
    const typeKey = unit.commander.type || "-";
    result[typeKey] = (result[typeKey] ?? 0) + 1;
    return result;
  }, {});
  const maxCommanderTypeCount = Math.max(...Object.values(commanderTypeCounts), 0);
  const lowAideUnits = augmentedUnits.filter((unit) => {
    const aides = unit.unitMembers.filter((member) => member.slotKey.startsWith("aide"));
    return averageArmyValues(aides.map((member) => member.slotBaseScore)) < 56;
  }).length;

  if (rowCounts.front < (concept.rowTarget?.front ?? 0)) {
    penalties.missingFrontline = ARMY_PENALTY_MAP.missingFrontline ?? 15;
  }
  if (
    concept.primaryObjective === "pvp" &&
    !augmentedUnits.some((unit) => unit.roleTags.includes("role.disruptor"))
  ) {
    penalties.missingControlInPvp = ARMY_PENALTY_MAP.missingControlInPvp ?? 10;
  }
  if (
    concept.primaryObjective === "siege" &&
    augmentedUnits.filter((unit) => unit.roleTags.includes("role.siege-breaker")).length < 2
  ) {
    penalties.missingSiegeCore = ARMY_PENALTY_MAP.missingSiegeCore ?? 14;
  }
  if (maxCommanderTypeCount >= 4 || lowAideUnits >= 3) {
    penalties.duplicateWeaknessCluster = ARMY_PENALTY_MAP.duplicateWeaknessCluster ?? 8;
  }
  if (lowAideUnits >= 2) {
    penalties.badAideUsage = Math.round((ARMY_PENALTY_MAP.badAideUsage ?? 12) * (lowAideUnits / 3));
  }

  const armyWeights =
    ARMY_ARMY_WEIGHT_MAP[concept.primaryObjective] ??
    ARMY_ARMY_WEIGHT_MAP.pvp ?? {
      armyPowerScore: 0.24,
      roleCoverageScore: 0.18,
      commanderQualityScore: 0.16,
      synergyCoverageScore: 0.14,
      stabilityScore: 0.12,
      objectivePurityScore: 0.08,
      investmentEfficiencyScore: 0.08
    };

  const scoreBreakdown = {
    armyPowerScore,
    roleCoverageScore,
    commanderQualityScore,
    synergyCoverageScore,
    stabilityScore,
    objectivePurityScore,
    investmentEfficiencyScore
  };

  const total = clampArmyScore(
    Object.entries(scoreBreakdown).reduce((sum, [scoreKey, value]) => {
      return sum + value * (armyWeights[scoreKey] ?? 0);
    }, 0) - sumArmyValues(Object.values(penalties)) * 0.42
  );

  const missingRules = ruleCoverage
    .filter((rule) => rule.ratio < 1)
    .sort((left, right) => left.ratio - right.ratio)
    .slice(0, 4);
  const satisfiedRules = ruleCoverage
    .filter((rule) => rule.ratio >= 1)
    .sort((left, right) => (right.weight ?? 0) - (left.weight ?? 0))
    .slice(0, 4);

  return {
    total,
    tieBreaker: commanderQualityScore + synergyCoverageScore,
    concept,
    units: augmentedUnits,
    rowCounts,
    rowAssignmentScore: rowAssignment.score,
    ruleCoverage,
    missingRules,
    satisfiedRules,
    penalties,
    scoreBreakdown,
    summaryParts: [
      `${concept.label}`,
      `列配分: 前列${rowCounts.front} / 中列${rowCounts.middle} / 後列${rowCounts.back}`,
      seedMeta ? `固定武将: ${seedMeta.character.name}` : "完全自動編成",
      `推奨陣形: ${concept.recommendedFormation}`
    ],
    improvementTips: [
      missingRules[0] ? `${missingRules[0].tag} を埋める武将へ差し替える` : "",
      rowCounts.front < (concept.rowTarget?.front ?? 0) ? "前列向きの主将を増やす" : "",
      lowAideUnits >= 2 ? "補佐枠を支援寄りの武将へ差し替える" : ""
    ].filter(Boolean),
    formation: {
      name: concept.recommendedFormation,
      reason: concept.formationReason
    }
  };
}

function evaluateArmyCompositionForFormation(units, concept, seedMeta, formation) {
  const formationAssignment = chooseArmyFormationAssignment(units, concept, formation);
  const augmentedUnits = units.map((unit, index) => {
    const assignedSlot = getFormationSlotMeta(formation, formationAssignment.slotKeys[index] ?? formation.slots[index]?.key);
    return {
      ...unit,
      assignedFormationSlot: assignedSlot,
      assignedRow: assignedSlot.rowKey
    };
  });
  const ruleCoverage = getArmyRuleCoverage(augmentedUnits, concept);
  const rowCounts = ARMY_BUILDER_ROW_KEYS.reduce((result, rowKey) => {
    result[rowKey] = augmentedUnits.filter((unit) => unit.assignedRow === rowKey).length;
    return result;
  }, {});
  const roleCoverageScore = clampArmyScore(
    averageArmyValues(
      ruleCoverage.map((rule) => rule.ratio * 100 * Math.max(rule.weight ?? 1, 0.4))
    )
  );
  const commanderQualityScore = clampArmyScore(
    averageArmyValues(
      augmentedUnits.map((unit) => getArmySlotBaseScore(getArmyMeta(unit.commander), "commander", concept))
    )
  );
  const synergyCoverageScore = clampArmyScore(
    averageArmyValues(augmentedUnits.map((unit) => unit.chainAverage)) * 0.42 +
      averageArmyValues(augmentedUnits.map((unit) => unit.synergyScore)) * 0.58
  );
  const stabilityScore = clampArmyScore(
    averageArmyValues(augmentedUnits.map((unit) => unit.sustainScore)) * 0.62 +
      averageArmyValues(augmentedUnits.map((unit) => unit.rowScores[unit.assignedRow] ?? 0)) * 0.38
  );
  const objectivePurityScore = clampArmyScore(
    averageArmyValues(
      augmentedUnits.map((unit) => unit.scoreBreakdown.objectiveFitScore)
    ) *
      0.62 +
      roleCoverageScore * 0.38
  );
  const investmentEfficiencyScore = clampArmyScore(
    averageArmyValues(augmentedUnits.map((unit) => unit.scoreBreakdown.investmentScore))
  );
  const armyPowerScore = clampArmyScore(averageArmyValues(augmentedUnits.map((unit) => unit.total)));
  const activeFormationBonus = getArmyFormationActiveBonus(augmentedUnits, formation);
  const formationPlacementScore = clampArmyScore(formationAssignment.score / Math.max(augmentedUnits.length, 1));
  const formationBonusScore = activeFormationBonus ? clampArmyScore(58 + activeFormationBonus.value * 0.72) : 32;
  const formationRecommendationScore =
    formation.key === getConceptRecommendedFormationKey(concept)
      ? 100
      : clampArmyScore(70 - Math.abs(formationPlacementScore - 60) * 0.2);
  const formationFitScore = clampArmyScore(
    formationPlacementScore * 0.48 + formationBonusScore * 0.34 + formationRecommendationScore * 0.18
  );

  const penalties = {};
  const commanderTypeCounts = augmentedUnits.reduce((result, unit) => {
    const typeKey = unit.commander.type || "-";
    result[typeKey] = (result[typeKey] ?? 0) + 1;
    return result;
  }, {});
  const maxCommanderTypeCount = Math.max(...Object.values(commanderTypeCounts), 0);
  const lowAideUnits = augmentedUnits.filter((unit) => {
    const aides = unit.unitMembers.filter((member) => member.slotKey.startsWith("aide"));
    return averageArmyValues(aides.map((member) => member.slotBaseScore)) < 56;
  }).length;

  if (rowCounts.front < (concept.rowTarget?.front ?? 0)) {
    penalties.missingFrontline = ARMY_PENALTY_MAP.missingFrontline ?? 15;
  }
  if (
    concept.primaryObjective === "pvp" &&
    !augmentedUnits.some((unit) => unit.roleTags.includes("role.disruptor"))
  ) {
    penalties.missingControlInPvp = ARMY_PENALTY_MAP.missingControlInPvp ?? 10;
  }
  if (
    concept.primaryObjective === "siege" &&
    augmentedUnits.filter((unit) => unit.roleTags.includes("role.siege-breaker")).length < 2
  ) {
    penalties.missingSiegeCore = ARMY_PENALTY_MAP.missingSiegeCore ?? 14;
  }
  if (maxCommanderTypeCount >= 4 || lowAideUnits >= 3) {
    penalties.duplicateWeaknessCluster = ARMY_PENALTY_MAP.duplicateWeaknessCluster ?? 8;
  }
  if (lowAideUnits >= 2) {
    penalties.badAideUsage = Math.round((ARMY_PENALTY_MAP.badAideUsage ?? 12) * (lowAideUnits / 3));
  }
  const rowDelta = ARMY_BUILDER_ROW_KEYS.reduce((sum, rowKey) => {
    return sum + Math.abs((rowCounts[rowKey] ?? 0) - (concept.rowTarget?.[rowKey] ?? 0));
  }, 0);
  if (rowDelta >= 2) {
    penalties.rowMismatch = Math.round(rowDelta * 2.5);
  }

  const armyWeights =
    ARMY_ARMY_WEIGHT_MAP[concept.primaryObjective] ??
    ARMY_ARMY_WEIGHT_MAP.pvp ?? {
      armyPowerScore: 0.24,
      roleCoverageScore: 0.18,
      commanderQualityScore: 0.16,
      synergyCoverageScore: 0.14,
      stabilityScore: 0.12,
      formationFitScore: 0.08,
      objectivePurityScore: 0.08,
      investmentEfficiencyScore: 0.06
    };

  const scoreBreakdown = {
    armyPowerScore,
    roleCoverageScore,
    commanderQualityScore,
    synergyCoverageScore,
    stabilityScore,
    formationFitScore,
    objectivePurityScore,
    investmentEfficiencyScore
  };

  const total = clampArmyScore(
    Object.entries(scoreBreakdown).reduce((sum, [scoreKey, value]) => {
      return sum + value * (armyWeights[scoreKey] ?? 0);
    }, 0) - sumArmyValues(Object.values(penalties)) * 0.42
  );

  const missingRules = ruleCoverage
    .filter((rule) => rule.ratio < 1)
    .sort((left, right) => left.ratio - right.ratio)
    .slice(0, 4);
  const satisfiedRules = ruleCoverage
    .filter((rule) => rule.ratio >= 1)
    .sort((left, right) => (right.weight ?? 0) - (left.weight ?? 0))
    .slice(0, 4);

  return {
    total,
    tieBreaker: commanderQualityScore + synergyCoverageScore,
    concept,
    units: augmentedUnits,
    rowCounts,
    formationAssignmentScore: formationAssignment.score,
    ruleCoverage,
    missingRules,
    satisfiedRules,
    penalties,
    scoreBreakdown,
    summaryParts: [
      `${concept.label}`,
      `陣形 ${formation.label}`,
      `前${rowCounts.front} / 中${rowCounts.middle} / 後${rowCounts.back}`,
      seedMeta ? `固定武将 ${seedMeta.character.name}` : "固定武将なし",
      `陣効果: ${formatArmyFormationBonusSummary(activeFormationBonus)}`
    ],
    improvementTips: [
      missingRules[0] ? `${armyRoleTagLabel(missingRules[0].tag)} を埋める武将へ差し替える` : "",
      rowCounts.front < (concept.rowTarget?.front ?? 0) ? "前列向きの主将を増やす" : "",
      lowAideUnits >= 2 ? "補佐枠を支援寄りの武将へ差し替える" : "",
      !activeFormationBonus ? "陣効果が未発動なのでタイプ構成を寄せる" : ""
    ].filter(Boolean),
    formation: {
      key: formation.key,
      name: formation.label,
      reason: `${formation.description} / ${formation.sourceSummary} / ${formatArmyFormationBonusSummary(activeFormationBonus)}`,
      sourceSummary: formation.sourceSummary,
      timings: formation.timings,
      activeBonus: activeFormationBonus,
      slotAssignments: augmentedUnits.map((unit) => unit.assignedFormationSlot)
    }
  };
}

function evaluateArmyComposition(units, concept, seedMeta, formationChoiceKey = "auto") {
  const choiceKey = sanitizeArmyFormationChoiceKey(formationChoiceKey);
  const formations =
    choiceKey === "auto" ? FORMATION_DEFS : [FORMATION_MAP[choiceKey] ?? FORMATION_DEFS[0]];

  return keepTopArmyEntries(
    formations.map((formation) => evaluateArmyCompositionForFormation(units, concept, seedMeta, formation)),
    1,
    "total"
  )[0];
}

function buildArmyStates(unitPool, concept, seedMeta, seedUnits, formationChoiceKey = "auto") {
  const initialUnits = seedUnits?.length ? seedUnits : unitPool.slice(0, ARMY_BUILDER_LIMITS.commanderSeeds);
  let states = initialUnits.map((unit) => ({
    units: [unit],
    usedIds: new Set(unit.memberIds),
    score: unit.total,
    tieBreaker: unit.tieBreaker
  }));

  for (let unitIndex = 1; unitIndex < 5; unitIndex += 1) {
    const nextStates = [];

    for (const state of states) {
      for (const candidate of unitPool) {
        if ([...candidate.memberIds].some((characterId) => state.usedIds.has(characterId))) {
          continue;
        }

        const nextUsedIds = new Set(state.usedIds);
        candidate.memberIds.forEach((characterId) => nextUsedIds.add(characterId));
        const nextUnits = [...state.units, candidate];
        const projectedScore =
          averageArmyValues(nextUnits.map((unit) => unit.total)) +
          averageArmyValues(nextUnits.map((unit) => unit.synergyScore)) * 0.08;

        nextStates.push({
          units: nextUnits,
          usedIds: nextUsedIds,
          score: projectedScore,
          tieBreaker: state.tieBreaker + candidate.tieBreaker
        });
      }
    }

    states = keepTopArmyEntries(nextStates, ARMY_BUILDER_LIMITS.armyBeamWidth, "score");
    if (!states.length) {
      break;
    }
  }

  return keepTopArmyEntries(
    states
      .filter((state) => state.units.length === 5 && state.usedIds.size === 25)
      .map((state) => evaluateArmyComposition(state.units, concept, seedMeta, formationChoiceKey)),
    ARMY_BUILDER_LIMITS.finalArmies,
    "total"
  );
}

function buildArmyReserveSuggestions(bestArmy, allowedMetas, concept) {
  const usedIds = new Set(bestArmy.units.flatMap((unit) => [...unit.memberIds]));
  const missingTags = bestArmy.missingRules.map((rule) => rule.tag);
  const commanders = bestArmy.units.map((unit) => getArmyMeta(unit.commander));

  return keepTopArmyEntries(
    allowedMetas
      .filter((meta) => !usedIds.has(meta.character.id))
      .map((meta) => {
        const missingCoverage = meta.roleTags.filter((tag) => missingTags.includes(tag)).length;
        const commanderFit = Math.max(
          ...commanders.map(
            (commanderMeta) =>
              getArmyViceFitness(commanderMeta, meta, concept, "vice1").score * 0.55 +
              getArmyGuideBonus(commanderMeta, meta, "副将1") * 0.15
          ),
          0
        );
        const maxSlotScore = Math.max(
          getArmySlotBaseScore(meta, "commander", concept),
          getArmySlotBaseScore(meta, "vice1", concept),
          getArmySlotBaseScore(meta, "aide1", concept)
        );

        return {
          meta,
          score: clampArmyScore(
            getArmyConceptAffinity(meta, concept) * 0.4 +
              maxSlotScore * 0.26 +
              commanderFit * 0.16 +
              missingCoverage * 18
          ),
          reasons: [
            missingCoverage
              ? `不足役割 ${missingTags.filter((tag) => meta.roleTagSet.has(tag)).join(" / ")} を補える`
              : "",
            meta.character.featureTags.some((featureKey) => concept.featureWeights?.[featureKey] >= 10)
              ? `コンセプト一致タグ: ${meta.character.featureTags
                  .filter((featureKey) => concept.featureWeights?.[featureKey] >= 10)
                  .slice(0, 3)
                  .join(" / ")}`
              : "",
            meta.character.guideSlot ? `${meta.character.guideSlot}向きで採用しやすい` : ""
          ].filter(Boolean)
        };
      }),
    ARMY_BUILDER_LIMITS.reserveCount,
    "score"
  );
}

function getArmySlotSuitabilityFloorScore(slotKey) {
  return (ARMY_SLOT_SUITABILITY_FLOORS[slotKey] ?? 0.6) * 100;
}

function getArmySlotSuitabilityEntries(meta, concept) {
  return [
    { key: "commander", label: "主将", score: getArmySlotBaseScore(meta, "commander", concept) },
    {
      key: "vice",
      label: "副将",
      score: Math.max(getArmySlotBaseScore(meta, "vice1", concept), getArmySlotBaseScore(meta, "vice2", concept))
    },
    {
      key: "aide",
      label: "補佐",
      score: Math.max(getArmySlotBaseScore(meta, "aide1", concept), getArmySlotBaseScore(meta, "aide2", concept))
    }
  ]
    .map((entry) => ({ ...entry, floor: getArmySlotSuitabilityFloorScore(entry.key) }))
    .sort((left, right) => right.score - left.score);
}

function getArmyBestSlotMatch(meta, concept) {
  return getArmySlotSuitabilityEntries(meta, concept)[0];
}

function formatArmyScoreDelta(value) {
  const numeric = Number(value ?? 0);
  return `${numeric > 0 ? "+" : ""}${numeric.toFixed(1)}`;
}

function buildArmyFormationAlternatives(bestArmy, concept, seedMeta) {
  const basePower = getArmyPowerEstimate(bestArmy);

  return FORMATION_DEFS.map((formation) => {
    const candidate =
      bestArmy.formation?.key === formation.key
        ? bestArmy
        : evaluateArmyCompositionForFormation(bestArmy.units, concept, seedMeta, formation);
    const powerEstimate = bestArmy.formation?.key === formation.key ? basePower : getArmyPowerEstimate(candidate);

    return {
      key: formation.key,
      label: formation.label,
      total: candidate.total,
      delta: candidate.total - bestArmy.total,
      currentPower: powerEstimate.current,
      powerDelta: powerEstimate.current - basePower.current,
      rowText: `前${candidate.rowCounts.front} / 中${candidate.rowCounts.middle} / 後${candidate.rowCounts.back}`,
      activeBonusText: formatArmyFormationBonusSummary(candidate.formation?.activeBonus),
      timingText: formatFormationTiming(formation),
      isCurrent: bestArmy.formation?.key === formation.key
    };
  }).sort((left, right) => right.total - left.total);
}

function getArmyCandidateCountBySlot(allowedMetas, concept, slotKey) {
  return allowedMetas.filter((meta) => {
    return getArmyBestSlotMatch(meta, concept)?.key === slotKey || getArmyBestSlotMatch(meta, concept)?.score >= getArmySlotSuitabilityFloorScore(slotKey);
  }).length;
}

function getArmyResultConfidence(bestArmy, allowedMetas, usingRoster, ownedCount, concept) {
  const minOwnedHeroes = ARMY_BUILDER_GATES.minOwnedHeroes ?? 30;
  const minAvailableHeroes = ARMY_BUILDER_GATES.minAvailableHeroes ?? 25;
  const minCommanderCandidates = ARMY_BUILDER_GATES.minCommanderCandidates ?? 5;
  const commanderCandidates = allowedMetas.filter(
    (meta) => getArmySlotBaseScore(meta, "commander", concept) >= getArmySlotSuitabilityFloorScore("commander")
  ).length;
  const checks = [
    {
      ok: !usingRoster || ownedCount >= minOwnedHeroes,
      text: usingRoster ? `手持ち ${ownedCount}/${minOwnedHeroes}` : "全武将モード"
    },
    {
      ok: allowedMetas.length >= minAvailableHeroes,
      text: `候補 ${allowedMetas.length}/${minAvailableHeroes}`
    },
    {
      ok: commanderCandidates >= minCommanderCandidates,
      text: `主将候補 ${commanderCandidates}/${minCommanderCandidates}`
    }
  ];

  let score = 82;
  score -= bestArmy.missingRules.length * 12;
  score -= Object.keys(bestArmy.penalties ?? {}).length * 6;
  score -= checks.filter((entry) => !entry.ok).length * 10;
  score += Math.max(0, bestArmy.total - 72) * 0.6;
  score = clampArmyScore(score);

  return {
    score,
    level: score >= 75 ? "高" : score >= 55 ? "中" : "低",
    reasons: [
      checks.map((entry) => `${entry.ok ? "通過" : "注意"}: ${entry.text}`).join(" / "),
      bestArmy.missingRules.length
        ? `不足役割: ${bestArmy.missingRules.map((rule) => armyRoleTagLabel(rule.tag)).join(" / ")}`
        : "不足役割は小さい",
      Object.keys(bestArmy.penalties ?? {}).length
        ? `減点: ${Object.keys(bestArmy.penalties).join(" / ")}`
        : "大きな減点なし"
    ]
  };
}

function buildArmyRoleAudit(bestArmy, allowedMetas, concept, usingRoster, ownedCount, formationAlternatives) {
  const missingText = bestArmy.missingRules.length
    ? bestArmy.missingRules.map((rule) => `${armyRoleTagLabel(rule.tag)} ${rule.count}/${rule.minUnits}`).join(" / ")
    : "不足役割は大きくありません";
  const satisfiedText = bestArmy.satisfiedRules.length
    ? bestArmy.satisfiedRules.map((rule) => `${armyRoleTagLabel(rule.tag)} ${rule.count}/${rule.minUnits}`).join(" / ")
    : "主要役割を採点中";
  const crowdedRoles = Object.entries(
    bestArmy.units.reduce((result, unit) => {
      unit.roleTags
        .filter((tag) => tag.startsWith("role.") || tag.startsWith("support.") || tag.startsWith("def.") || tag.startsWith("control."))
        .forEach((tag) => {
          result[tag] = (result[tag] ?? 0) + 1;
        });
      return result;
    }, {})
  )
    .filter(([, count]) => count >= 3)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([tag, count]) => `${armyRoleTagLabel(tag)} ${count}部隊`)
    .join(" / ");
  const commanderCandidates = allowedMetas.filter(
    (meta) => getArmySlotBaseScore(meta, "commander", concept) >= getArmySlotSuitabilityFloorScore("commander")
  ).length;
  const viceCandidates = getArmyCandidateCountBySlot(allowedMetas, concept, "vice");
  const aideCandidates = getArmyCandidateCountBySlot(allowedMetas, concept, "aide");
  const secondFormation = formationAlternatives.find((entry) => !entry.isCurrent);
  const confidence = getArmyResultConfidence(bestArmy, allowedMetas, usingRoster, ownedCount, concept);
  const toolNames = [
    "missing-role-checker",
    "formation-auto-picker",
    "slot-suitability-finder",
    "army-score-explainer"
  ].map((key) => ARMY_SUPPORT_TOOL_NAME_MAP[key] ?? key);

  return {
    confidence,
    cards: [
      {
        title: "役割不足",
        body: bestArmy.missingRules.length ? "不足役割があります。" : "必須役割は概ね充足しています。",
        detail: missingText,
        extra: crowdedRoles ? `重なり: ${crowdedRoles}` : `充足: ${satisfiedText}`
      },
      {
        title: "採用基準",
        body: "support-spec の手持ち数とスロット適性基準を確認しています。",
        detail: `主将候補 ${commanderCandidates} / 副将候補 ${viceCandidates} / 補佐候補 ${aideCandidates}`,
        extra: [
          usingRoster ? `手持ち ${ownedCount}/${ARMY_BUILDER_GATES.minOwnedHeroes ?? 30}` : "全武将モード",
          `候補 ${allowedMetas.length}/${ARMY_BUILDER_GATES.minAvailableHeroes ?? 25}`,
          `下限 主将${Math.round(getArmySlotSuitabilityFloorScore("commander"))} / 副将${Math.round(
            getArmySlotSuitabilityFloorScore("vice")
          )} / 補佐${Math.round(getArmySlotSuitabilityFloorScore("aide"))}`
        ].join(" | ")
      },
      {
        title: "陣形比較",
        body: `${formationAlternatives[0]?.label ?? bestArmy.formation?.name ?? "現陣形"} を最上位と判定しています。`,
        detail: secondFormation
          ? `次点 ${secondFormation.label} ${formatArmyScoreDelta(secondFormation.delta)} / 戦力差 ${formatArmyEstimateNumber(
              Math.abs(secondFormation.powerDelta)
            )}`
          : "比較できる別陣形はありません。",
        extra: `${formationAlternatives[0]?.activeBonusText ?? bestArmy.formation?.reason ?? "-"} / ${
          formationAlternatives[0]?.rowText ?? "-"
        }`
      },
      {
        title: "提案信頼度",
        body: `信頼度 ${confidence.level} (${confidence.score.toFixed(0)} / 100)`,
        detail: confidence.reasons.join(" / "),
        extra: `参照ロジック: ${toolNames.join(" / ")}`
      }
    ]
  };
}

function buildArmyCommanderShortlist(allowedMetas, concept, bestArmy, seedMeta) {
  const activeCommanderMap = new Map(bestArmy.units.map((unit, index) => [unit.commander.id, index]));
  const topCandidates = keepTopArmyEntries(
    allowedMetas.map((meta) => ({
      meta,
      score: clampArmyScore(
        getArmySlotBaseScore(meta, "commander", concept) * 0.56 +
          getArmyConceptAffinity(meta, concept) * 0.18 +
          (meta.objectiveScores?.[concept.primaryObjective] ?? 0) * 0.16 +
          meta.chainPotential * 0.1 +
          (activeCommanderMap.has(meta.character.id) ? 4 : 0) +
          (seedMeta?.character.id === meta.character.id ? 12 : 0)
      )
    })),
    6,
    "score"
  );

  return topCandidates.map((entry, index) => {
    const slotEntries = getArmySlotSuitabilityEntries(entry.meta, concept);
    const bestVicePair = buildVicePairs(entry.meta, allowedMetas, concept, null)[0] ?? [];
    const vicePairText = bestVicePair.length ? bestVicePair.map((meta) => meta.character.name).join(" / ") : "候補不足";
    const viceChainText = bestVicePair.length
      ? bestVicePair
          .map((meta) => `${meta.character.name} ${formatPercent(getChainStats(entry.meta.character, meta.character).rate)}`)
          .join(" / ")
      : "連鎖候補不足";

    return {
      rank: index + 1,
      meta: entry.meta,
      score: entry.score,
      commanderScore: getArmySlotBaseScore(entry.meta, "commander", concept),
      bestSlot: slotEntries[0],
      vicePairText,
      viceChainText,
      usageText: activeCommanderMap.has(entry.meta.character.id)
        ? `現編成: 第${activeCommanderMap.get(entry.meta.character.id) + 1}部隊 主将`
        : "現編成外",
      featureText:
        entry.meta.character.featureTags
          .filter((featureKey) => concept.featureWeights?.[featureKey] >= 10)
          .slice(0, 3)
          .join(" / ") || "主要一致タグなし"
    };
  });
}

function buildArmyViceShortlist(bestArmy, allowedMetas, concept, seedMeta) {
  const focusUnit =
    (seedMeta && bestArmy.units.find((unit) => unit.commander.id === seedMeta.character.id)) ?? bestArmy.units[0] ?? null;
  if (!focusUnit) {
    return {
      commanderMeta: null,
      entries: []
    };
  }

  const commanderMeta = getArmyMeta(focusUnit.commander);
  const usedIds = new Set(bestArmy.units.flatMap((unit) => [...unit.memberIds]));
  const pairs = buildVicePairs(commanderMeta, allowedMetas, concept, null).slice(0, 6);

  return {
    commanderMeta,
    entries: pairs.map((pair, index) => {
      const vice1Fitness = getArmyViceFitness(commanderMeta, pair[0], concept, "vice1");
      const vice2Fitness = getArmyViceFitness(commanderMeta, pair[1], concept, "vice2");
      const chainAverage = averageArmyValues([vice1Fitness.chainStats?.rate ?? 0, vice2Fitness.chainStats?.rate ?? 0]);
      const usedCount = pair.filter((meta) => usedIds.has(meta.character.id)).length;

      return {
        rank: index + 1,
        pair,
        score: clampArmyScore(
          vice1Fitness.score * 0.36 +
            vice2Fitness.score * 0.32 +
            normalizeChainRate(chainAverage) * 0.18 +
            getArmyGuidePairScore(pair[0].character, pair[1].character) * 14 +
            averageArmyValues([
              getArmyConceptAffinity(pair[0], concept),
              getArmyConceptAffinity(pair[1], concept)
            ]) *
              0.14
        ),
        chainAverage,
        supportText: uniqueValues(
          pair.flatMap((meta) =>
            meta.roleTags
              .filter(
                (tag) =>
                  tag.startsWith("role.") ||
                  tag.startsWith("support.") ||
                  tag.startsWith("control.") ||
                  tag.startsWith("tempo.")
              )
              .map((tag) => armyRoleTagLabel(tag))
          )
        )
          .slice(0, 4)
          .join(" / "),
        usageText: usedCount === 2 ? "両方採用中" : usedCount === 1 ? "片方採用中" : "ベンチ候補",
        viceChainText: [vice1Fitness, vice2Fitness]
          .map((fitness, pairIndex) => `${pair[pairIndex].character.name} ${formatPercent(fitness.chainStats?.rate ?? 0)}`)
          .join(" / ")
      };
    })
  };
}

function buildArmySwapSuggestions(bestArmy, allowedMetas, concept) {
  const usedIds = new Set(bestArmy.units.flatMap((unit) => [...unit.memberIds]));
  const benchMetas = allowedMetas.filter((meta) => !usedIds.has(meta.character.id));
  const suggestions = [];

  for (const [unitIndex, unit] of bestArmy.units.entries()) {
    const commanderMeta = getArmyMeta(unit.commander);
    const unitMemberIds = new Set(unit.unitMembers.map((member) => member.meta.character.id));

    for (const member of unit.unitMembers.filter((entry) => entry.slotKey !== "commander")) {
      const candidatePool = keepTopArmyEntries(
        benchMetas
          .filter((meta) => !unitMemberIds.has(meta.character.id))
          .map((meta) => {
            if (member.slotKey.startsWith("vice")) {
              const fitness = getArmyViceFitness(commanderMeta, meta, concept, member.slotKey);
              const scoreDelta = fitness.score - member.slotBaseScore;
              const chainDelta = (fitness.chainStats?.rate ?? 0) - (member.chainStats?.rate ?? 0);
              const roleGain = getArmyNewRoleCount(new Set(unit.roleTags), meta.roleTags);

              return {
                unitIndex,
                slotLabel: member.label,
                outgoing: member.meta,
                incoming: meta,
                score: scoreDelta + roleGain * 3.6 + Math.max(0, chainDelta) * 0.16,
                scoreDelta,
                chainDelta,
                roleGain,
                detailText: chainDelta
                  ? `連鎖 ${formatPercent(member.chainStats?.rate ?? 0)} → ${formatPercent(fitness.chainStats?.rate ?? 0)}`
                  : "連鎖率の変化は小さい"
              };
            }

            const remainingCore = unit.unitMembers
              .filter((entry) => entry.slotKey !== member.slotKey && !entry.slotKey.startsWith("aide"))
              .map((entry) => entry.meta);
            const fitness = getArmyAideFitness(remainingCore, meta, concept, member.slotKey);
            const scoreDelta = fitness.score - member.slotBaseScore;
            const roleGain = getArmyNewRoleCount(new Set(remainingCore.flatMap((entry) => entry.roleTags)), meta.roleTags);

            return {
              unitIndex,
              slotLabel: member.label,
              outgoing: member.meta,
              incoming: meta,
              score: scoreDelta + roleGain * 4.2 + Math.max(0, getArmyConceptAffinity(meta, concept) - getArmyConceptAffinity(member.meta, concept)) * 0.1,
              scoreDelta,
              chainDelta: 0,
              roleGain,
              detailText: `支援補完 ${fitness.supportMatch.toFixed(1)} / 役割増 ${roleGain}`
            };
          }),
        2,
        "score"
      );

      candidatePool
        .filter((entry) => entry.score > 1.4 || entry.roleGain > 0)
        .forEach((entry) => suggestions.push(entry));
    }
  }

  return keepTopArmyEntries(suggestions, 8, "score");
}

function buildArmyExclusionReasons(bestArmy, allowedMetas, concept, commanderShortlist) {
  const usedIds = new Set(bestArmy.units.flatMap((unit) => [...unit.memberIds]));
  const commanderRankMap = new Map(commanderShortlist.map((entry) => [entry.meta.character.id, entry.rank]));
  const excludedMetas = keepTopArmyEntries(
    allowedMetas
      .filter((meta) => !usedIds.has(meta.character.id))
      .map((meta) => ({
        meta,
        score:
          getArmyBestSlotMatch(meta, concept)?.score * 0.54 +
          getArmyConceptAffinity(meta, concept) * 0.26 +
          (meta.objectiveScores?.[concept.primaryObjective] ?? 0) * 0.2
      })),
    8,
    "score"
  ).map((entry) => entry.meta);

  return excludedMetas.map((meta) => {
    const bestSlot = getArmyBestSlotMatch(meta, concept);
    const overlapLabels = uniqueValues(
      bestArmy.units.flatMap((unit) =>
        unit.roleTags
          .filter((tag) => meta.roleTagSet.has(tag) && tag.startsWith("role."))
          .map((tag) => armyRoleTagLabel(tag))
      )
    ).slice(0, 3);
    const reasons = [];

    if (bestSlot.score < bestSlot.floor) {
      reasons.push(`${bestSlot.label}適性 ${bestSlot.score.toFixed(1)} が基準 ${bestSlot.floor.toFixed(0)} に届かない`);
    }
    if (overlapLabels.length >= 2) {
      reasons.push(`役割が現軍勢と重複 (${overlapLabels.join(" / ")})`);
    }
    if (bestSlot.key === "commander" && commanderRankMap.has(meta.character.id)) {
      reasons.push(`主将候補順位 ${commanderRankMap.get(meta.character.id)} 位止まり`);
    }
    if (bestSlot.key === "vice") {
      const bestViceFit = Math.max(
        ...bestArmy.units.map((unit) => getArmyViceFitness(getArmyMeta(unit.commander), meta, concept, "vice1").score),
        0
      );
      if (bestViceFit < getArmySlotSuitabilityFloorScore("vice")) {
        reasons.push("副将候補としての連鎖・支援が薄い");
      }
    }
    if (bestSlot.key === "aide") {
      const bestAideFit = Math.max(
        ...bestArmy.units.map((unit) => {
          const core = unit.unitMembers.filter((member) => !member.slotKey.startsWith("aide")).map((member) => member.meta);
          return getArmyAideFitness(core, meta, concept, "aide1").score;
        }),
        0
      );
      if (bestAideFit < getArmySlotSuitabilityFloorScore("aide")) {
        reasons.push("補佐候補でも支援補完が薄い");
      }
    }
    if (!reasons.length && bestArmy.missingRules.length && !bestArmy.missingRules.some((rule) => meta.roleTagSet.has(rule.tag))) {
      reasons.push("不足役割を直接埋めないため優先度が下がった");
    }
    if (!reasons.length) {
      reasons.push("25体重複なし条件で上位候補に一歩届かなかった");
    }

    return {
      meta,
      bestSlot,
      overlapLabels,
      reasons: reasons.slice(0, 3)
    };
  });
}

function getFallbackCommanderScore(meta, concept, variantIndex) {
  const variantBias =
    variantIndex === 1
      ? meta.groupScores.defense * 0.12 + meta.groupScores.control * 0.12
      : variantIndex === 2
        ? meta.chainPotential * 0.1 + meta.groupScores.support * 0.08
        : meta.groupScores.offense * 0.08;

  return (
    getArmySlotBaseScore(meta, "commander", concept) +
    getArmyConceptAffinity(meta, concept) * 0.16 +
    variantBias
  );
}

function selectFallbackCommanders(allowedMetas, concept, seedMeta, variantIndex) {
  const sorted = [...allowedMetas].sort((left, right) => {
    return getFallbackCommanderScore(right, concept, variantIndex) - getFallbackCommanderScore(left, concept, variantIndex);
  });
  const selected = [];

  if (seedMeta) {
    selected.push(seedMeta);
  }

  while (selected.length < 5) {
    let best = null;
    let bestScore = -Infinity;

    for (const meta of sorted) {
      if (selected.some((picked) => picked.character.id === meta.character.id)) {
        continue;
      }

      const sameTypeCount = selected.filter((picked) => picked.character.type === meta.character.type).length;
      const sameRoleCount = selected.filter((picked) =>
        picked.roleTags.some((tag) => meta.roleTagSet.has(tag) && tag.startsWith("role."))
      ).length;
      const score = getFallbackCommanderScore(meta, concept, variantIndex) - sameTypeCount * 6 - sameRoleCount * 2.5;

      if (score > bestScore) {
        best = meta;
        bestScore = score;
      }
    }

    if (!best) {
      break;
    }

    selected.push(best);
  }

  return selected.slice(0, 5);
}

function getFallbackCommanderCandidates(allowedMetas, concept, seedMeta, seedSlots, variantIndex) {
  const sorted = [...allowedMetas].sort((left, right) => {
    return getFallbackCommanderScore(right, concept, variantIndex) - getFallbackCommanderScore(left, concept, variantIndex);
  });

  if (seedMeta && seedSlots.includes("commander")) {
    return [seedMeta].concat(sorted.filter((meta) => meta.character.id !== seedMeta.character.id));
  }

  return sorted;
}

function getFallbackSeedPlacement(seedMeta, seedSlots, commanders, concept) {
  if (!seedMeta || !seedSlots.length) {
    return {
      role: null,
      targetCommanderId: null,
      commanders
    };
  }

  const allowedRoles = [...seedSlots];
  const commanderScore = allowedRoles.includes("commander")
    ? getArmySlotBaseScore(seedMeta, "commander", concept)
    : -1;
  const aideScore = allowedRoles.includes("aide") ? getArmySlotBaseScore(seedMeta, "aide1", concept) : -1;
  let bestVice = { commanderId: null, score: -1 };

  if (allowedRoles.includes("vice")) {
    for (const commanderMeta of commanders.filter((meta) => meta.character.id !== seedMeta.character.id)) {
      const viceScore = getArmyViceFitness(commanderMeta, seedMeta, concept, "vice1").score;
      if (viceScore > bestVice.score) {
        bestVice = { commanderId: commanderMeta.character.id, score: viceScore };
      }
    }
  }

  let role = null;
  if (commanderScore >= bestVice.score && commanderScore >= aideScore) {
    role = commanderScore >= 0 ? "commander" : null;
  } else if (bestVice.score >= aideScore) {
    role = bestVice.score >= 0 ? "vice" : null;
  } else {
    role = aideScore >= 0 ? "aide" : null;
  }

  const nextCommanders = [...commanders];
  if (role === "commander" && !nextCommanders.some((meta) => meta.character.id === seedMeta.character.id)) {
    nextCommanders[nextCommanders.length - 1] = seedMeta;
  }

  return {
    role,
    targetCommanderId: role === "vice" ? bestVice.commanderId : role === "aide" ? nextCommanders[0]?.character.id ?? null : null,
    commanders: nextCommanders
  };
}

function buildFallbackArmyVariant(allowedMetas, concept, seedMeta, seedSlots, variantIndex, formationChoiceKey = "auto") {
  const commanderCandidates = getFallbackCommanderCandidates(
    allowedMetas,
    concept,
    seedMeta,
    seedSlots,
    variantIndex
  );
  const seedPlacement = getFallbackSeedPlacement(
    seedMeta,
    seedSlots,
    commanderCandidates.slice(0, 6),
    concept
  );
  const units = [];
  const usedIds = new Set();
  let seedPlaced = !seedMeta;

  for (const commanderMeta of commanderCandidates) {
    if (units.length >= 5) {
      break;
    }
    if (usedIds.has(commanderMeta.character.id)) {
      continue;
    }

    const remainingMetas = allowedMetas.filter(
      (meta) =>
        !usedIds.has(meta.character.id) ||
        meta.character.id === commanderMeta.character.id ||
        (!seedPlaced && seedMeta && meta.character.id === seedMeta.character.id)
    );
    const options = {};

    if (
      seedMeta &&
      seedPlacement.role === "vice" &&
      !seedPlaced &&
      commanderMeta.character.id !== seedMeta.character.id &&
      (seedPlacement.targetCommanderId === commanderMeta.character.id || units.length >= 4)
    ) {
      options.forcedViceMeta = seedMeta;
    }

    if (
      seedMeta &&
      seedPlacement.role === "aide" &&
      !seedPlaced &&
      commanderMeta.character.id !== seedMeta.character.id &&
      (seedPlacement.targetCommanderId === commanderMeta.character.id || units.length >= 4)
    ) {
      options.forcedAideMeta = seedMeta;
    }

    const candidates = buildUnitCandidatesForCommander(commanderMeta, remainingMetas, concept, options);
    const chosen = candidates[0] ?? null;

    if (!chosen) {
      continue;
    }

    units.push(chosen);
    chosen.memberIds.forEach((characterId) => usedIds.add(characterId));
    if (seedMeta && chosen.memberIds.has(seedMeta.character.id)) {
      seedPlaced = true;
    }
  }

  if (units.length !== 5 || usedIds.size !== 25 || (seedMeta && !seedPlaced)) {
    return null;
  }

  return evaluateArmyComposition(units, concept, seedMeta, formationChoiceKey);
}

function buildFallbackArmies(allowedMetas, concept, seedMeta, seedSlots, formationChoiceKey = "auto") {
  const variants = [];
  const signatures = new Set();

  for (let variantIndex = 0; variantIndex < 4; variantIndex += 1) {
    const army = buildFallbackArmyVariant(allowedMetas, concept, seedMeta, seedSlots, variantIndex, formationChoiceKey);
    if (!army) {
      continue;
    }

    const signature = army.units.map((unit) => unit.commander.id).sort((left, right) => left - right).join(":");
    if (signatures.has(signature)) {
      continue;
    }

    signatures.add(signature);
    variants.push(army);
  }

  return keepTopArmyEntries(variants, ARMY_BUILDER_LIMITS.finalArmies, "total");
}

function armyContainsSeed(army, seedMeta) {
  if (!seedMeta) {
    return true;
  }

  return army.units.some((unit) =>
    unit.unitMembers.some((member) => member.meta.character.id === seedMeta.character.id)
  );
}

function buildArmyPlannerResult() {
  if (!elements.armyView) {
    return null;
  }

  const concept = ARMY_CONCEPT_MAP[elements.armyConcept.value] ?? ARMY_CONCEPT_DEFS[0];
  const formationChoiceKey = sanitizeArmyFormationChoiceKey(elements.armyFormation?.value ?? "auto");
  const selectedRarities = readCheckedValuesIn(elements.armyRarityFilters, "army-rarity");
  const seedCharacter = characterByName[elements.armySeedCharacter.value] ?? null;
  const seedMeta = getArmyMeta(seedCharacter);
  const seedSlots = resolveArmySeedSlots(seedCharacter, elements.armySeedMode.value);
  const { usingRoster, ownedCount, allowedMetas } = getArmyAllowedMetas(selectedRarities, seedCharacter);

  if (usingRoster && seedCharacter && !isArmyCharacterOwned(seedCharacter.id)) {
    return {
      validation: `軸武将の ${seedCharacter.name} が手持ちに入っていません。先に手持ちへ追加してください。`,
      summary: formatSummaryText(
        [`コンセプト: ${concept.label}`, `手持ち: ${ownedCount}体`, `レアリティ: ${selectedRarities.join(" / ")}`].filter(
          Boolean
        ),
        "軍勢自動編成"
      ),
      armies: [],
      reserveSuggestions: [],
      usingRoster,
      ownedCount,
      allowedCount: allowedMetas.length
    };
  }

  if (usingRoster && ownedCount < 25) {
    return {
      validation: `手持ちが ${ownedCount} 体です。5部隊編成には 25 体以上必要です。`,
      summary: formatSummaryText(
        [`コンセプト: ${concept.label}`, `手持ち: ${ownedCount}体`].filter(Boolean),
        "まずは 25 体以上を選択してください。"
      ),
      armies: [],
      reserveSuggestions: [],
      usingRoster,
      ownedCount,
      allowedCount: allowedMetas.length
    };
  }

  if (allowedMetas.length < 25) {
    return {
      validation: usingRoster
        ? `手持ち ${ownedCount} 体のうち、この条件で使えるのは ${allowedMetas.length} 体です。レアリティ条件を広げてください。`
        : `選択中のレアリティでは ${allowedMetas.length} 体しか使えません。25体以上を確保してください。`,
      summary: formatSummaryText(
        [
          `コンセプト: ${concept.label}`,
          usingRoster ? `手持ち: ${ownedCount}体` : "",
          selectedRarities.length ? `レアリティ: ${selectedRarities.join(" / ")}` : ""
        ].filter(Boolean),
        "条件を調整してください。"
      ),
      armies: [],
      reserveSuggestions: [],
      usingRoster,
      ownedCount,
      allowedCount: allowedMetas.length
    };
  }

  const commanderPool = getArmyCommanderPool(allowedMetas, concept, seedMeta, seedSlots);
  const genericUnits = buildGenericUnitCandidates(allowedMetas, commanderPool, concept);
  const seedUnits = buildSeedUnitCandidates(seedMeta, seedSlots, allowedMetas, commanderPool, concept);
  const unitPool = keepTopArmyEntries(
    [...genericUnits, ...seedUnits],
    Math.max(ARMY_BUILDER_LIMITS.genericUnitPool, seedUnits.length + 12),
    "total"
  );
  let armies = buildArmyStates(unitPool, concept, seedMeta, seedUnits, formationChoiceKey);

  if (!armies.length) {
    armies = buildFallbackArmies(allowedMetas, concept, seedMeta, seedSlots, formationChoiceKey);
  }

  if (seedMeta) {
    armies = armies.filter((army) => armyContainsSeed(army, seedMeta));

    if (!armies.length) {
      const retrySeedSlotGroups =
        elements.armySeedMode.value === "best"
          ? [["commander"], ["vice"], ["aide"]]
          : [seedSlots];

      for (const retrySeedSlots of retrySeedSlotGroups) {
        armies = buildFallbackArmies(allowedMetas, concept, seedMeta, retrySeedSlots, formationChoiceKey).filter((army) =>
          armyContainsSeed(army, seedMeta)
        );
        if (armies.length) {
          break;
        }
      }
    }
  }

  if (!armies.length) {
    return {
      validation: "条件に合う 25 体軍勢を組めませんでした。レアリティ条件を広げるか、固定役割を最適配置に戻してください。",
      summary: formatSummaryText(
        [
          `コンセプト: ${concept.label}`,
          usingRoster ? `手持ち: ${ownedCount}体` : "",
          seedCharacter ? `固定武将: ${seedCharacter.name}` : "",
          seedSlots.length
            ? `固定役割: ${ARMY_SEED_MODE_DEFS.find((row) => row.key === elements.armySeedMode.value)?.label}`
            : ""
        ].filter(Boolean),
        "軍勢自動編成"
      ),
      armies: [],
      reserveSuggestions: [],
      usingRoster,
      ownedCount,
      allowedCount: allowedMetas.length
    };
  }

  const bestArmy = armies[0];
  const formationAlternatives = buildArmyFormationAlternatives(bestArmy, concept, seedMeta);
  const roleAudit = buildArmyRoleAudit(bestArmy, allowedMetas, concept, usingRoster, ownedCount, formationAlternatives);
  const commanderShortlist = buildArmyCommanderShortlist(allowedMetas, concept, bestArmy, seedMeta);
  const viceShortlist = buildArmyViceShortlist(bestArmy, allowedMetas, concept, seedMeta);
  const swapSuggestions = buildArmySwapSuggestions(bestArmy, allowedMetas, concept);
  const exclusionReasons = buildArmyExclusionReasons(bestArmy, allowedMetas, concept, commanderShortlist);

  return {
    validation: "",
    concept,
    formationChoiceKey,
    selectedRarities,
    seedCharacter,
    seedSlots,
    summary: formatSummaryText(
      [
        `コンセプト: ${concept.label}`,
        seedCharacter ? `固定武将: ${seedCharacter.name}` : "完全自動編成",
        seedCharacter
          ? `固定役割: ${ARMY_SEED_MODE_DEFS.find((row) => row.key === elements.armySeedMode.value)?.label ?? "最適配置"}`
          : "",
        usingRoster ? `手持ち: ${ownedCount}体` : "全武将モード",
        `レアリティ: ${selectedRarities.join(" / ")}`
      ].filter(Boolean),
      "軍勢自動編成"
    ),
    armies,
    auditCards: roleAudit.cards,
    confidence: roleAudit.confidence,
    formationAlternatives,
    commanderShortlist,
    viceShortlist,
    swapSuggestions,
    reserveSuggestions: buildArmyReserveSuggestions(bestArmy, allowedMetas, concept),
    exclusionReasons,
    usingRoster,
    ownedCount,
    allowedCount: allowedMetas.length
  };
}

function renderArmyFormationInfoCards(result, activeArmy) {
  if (!elements.armyFormationInfoGrid) {
    return;
  }

  const selectedKey = sanitizeArmyFormationChoiceKey(elements.armyFormation?.value ?? result?.formationChoiceKey ?? "auto");
  const effectiveFormationKey = activeArmy?.formation?.key ?? getConceptRecommendedFormationKey(result?.concept ?? ARMY_CONCEPT_DEFS[0]);

  elements.armyFormationInfoGrid.innerHTML = ARMY_FORMATION_SELECT_DEFS.map((entry) => {
    if (entry.key === "auto") {
      const autoLabel = FORMATION_MAP[effectiveFormationKey]?.label ?? "自動選択";
      return `
        <button
          class="formation-card ${selectedKey === "auto" ? "is-active" : ""}"
          type="button"
          data-army-formation-select="auto"
          aria-pressed="${selectedKey === "auto" ? "true" : "false"}"
        >
          <strong>自動選択</strong>
          <p>${escapeHtml(autoLabel)} を優先候補として採点します。</p>
          <p class="field-note">手持ち、固定武将、コンセプトに応じて最終陣形が変わります。</p>
        </button>
      `;
    }

    const formation = FORMATION_MAP[entry.key];
    const isCurrent = activeArmy?.formation?.key === entry.key;
    return `
      <button
        class="formation-card ${selectedKey === entry.key ? "is-active" : ""}"
        type="button"
        data-army-formation-select="${escapeHtml(entry.key)}"
        aria-pressed="${selectedKey === entry.key ? "true" : "false"}"
      >
        <strong>${escapeHtml(formation.label)}</strong>
        <p>${escapeHtml(formation.description)}</p>
        <p class="field-note">${escapeHtml(formation.sourceSummary)}</p>
        <p class="field-note">${escapeHtml(formatFormationTiming(formation))}${isCurrent ? " / 現在採用" : ""}</p>
      </button>
    `;
  }).join("");
}

function renderArmyOverviewCards(army, result, powerEstimate) {
  const fixedSummary = result.seedCharacter
    ? `${result.seedCharacter.name}は ${army.units
        .flatMap((unit, unitIndex) =>
          unit.unitMembers
            .filter((member) => member.meta.character.id === result.seedCharacter.id)
            .map((member) => `第${unitIndex + 1}部隊 ${member.label}`)
        )
        .join(" / ")}`
    : "固定武将なしで最良候補を抽出";

  const coverageText = army.satisfiedRules.length
    ? army.satisfiedRules.map((rule) => `${armyRoleTagLabel(rule.tag)} ${rule.count}/${rule.minUnits}`).join(" / ")
    : "主な役割を採点中";

  const missingText = army.missingRules.length
    ? army.missingRules.map((rule) => `${armyRoleTagLabel(rule.tag)} ${rule.count}/${rule.minUnits}`).join(" / ")
    : "不足役割は大きくありません";
  const growthText = powerEstimate.growthTargets.length
    ? powerEstimate.growthTargets
        .slice(0, 3)
        .map((entry) => `${entry.name} (${entry.unitLabel} ${entry.slotLabel})`)
        .join(" / ")
    : "大きな伸びしろはありません";

  const cards = [
    {
      title: "推定現在戦力",
      body: result.usingRoster
        ? "手持ち入力の育成段階と装備状態を反映した簡易推定です。"
        : "手持ち未入力のため、公開データ基準の完成想定で表示しています。",
      detail: `現在 ${formatArmyEstimateNumber(powerEstimate.current)} / 最大見込み ${formatArmyEstimateNumber(
        powerEstimate.potential
      )}`,
      extra: `完成度 ${powerEstimate.completeness.toFixed(1)} / 100 | 陣補正 x${powerEstimate.formationMultiplier.toFixed(3)}`
    },
    {
      title: "伸びしろ",
      body: `この軍勢はあと ${formatArmyEstimateNumber(powerEstimate.growth)} 伸びる見込みです。`,
      detail: growthText,
      extra: "伸び幅が大きい武将から順に、今週の育成候補として見てください。"
    },
    {
      title: "総合スコア",
      body: `上位 ${activeArmyAlternativeIndex + 1} 位の軍勢です。`,
      detail: `総合 ${army.total.toFixed(1)} / 100`,
      extra: `軍勢総合 ${army.scoreBreakdown.armyPowerScore.toFixed(1)} | 主将品質 ${army.scoreBreakdown.commanderQualityScore.toFixed(1)}`
    },
    {
      title: "推奨陣形と列配分",
      body: `${army.formation.name} を採用しています。`,
      detail: `前列 ${army.rowCounts.front} / 中列 ${army.rowCounts.middle} / 後列 ${army.rowCounts.back}`,
      extra: army.formation.reason
    },
    {
      title: "役割充足",
      body: coverageText,
      detail: `不足: ${missingText}`,
      extra: `役割充足 ${army.scoreBreakdown.roleCoverageScore.toFixed(1)}`
    },
    {
      title: "連鎖と安定性",
      body: "副将連鎖・継戦力・列適性をまとめた評価です。",
      detail: `相性 ${army.scoreBreakdown.synergyCoverageScore.toFixed(1)} | 安定性 ${army.scoreBreakdown.stabilityScore.toFixed(1)}`,
      extra: army.improvementTips[0] ?? "大きな欠点はありません。"
    },
    {
      title: "固定武将の扱い",
      body: fixedSummary,
      detail: `別案 ${result.armies.length} 件`,
      extra: result.seedCharacter
        ? "固定武将は 25 体の重複なし編成の中で最も噛み合う枠に置いています。"
        : "固定武将なしのため、全体スコア優先で組んでいます。"
    }
  ];

  return cards
    .map(
      (card) => `
        <article class="army-summary-card">
          <h3>${escapeHtml(card.title)}</h3>
          <p class="field-note">${escapeHtml(card.body)}</p>
          <p class="toolbar-summary">${escapeHtml(card.detail)}</p>
          <p class="field-note">${escapeHtml(card.extra)}</p>
        </article>
      `
    )
    .join("");
}

function renderArmyAuditCards(cards = []) {
  if (!cards.length) {
    return renderEmptyState("軍勢を生成すると、ここに support-spec ベースの診断を表示します。");
  }

  return cards
    .map(
      (card) => `
        <article class="army-summary-card">
          <h3>${escapeHtml(card.title)}</h3>
          <p class="field-note">${escapeHtml(card.body)}</p>
          <p class="toolbar-summary">${escapeHtml(card.detail)}</p>
          <p class="field-note">${escapeHtml(card.extra)}</p>
        </article>
      `
    )
    .join("");
}

function renderArmyCommanderShortlistCard(entry) {
  return `
    <article class="quick-card">
      <span class="status-pill ${entry.rank <= 3 ? "is-live" : "is-next"}">主将候補 ${entry.rank}</span>
      <h3>${escapeHtml(entry.meta.character.name)}</h3>
      <p>${escapeHtml(entry.meta.character.rarity)} / ${escapeHtml(entry.meta.character.type || "-")} / 天賦 ${entry.meta.character.tenpu}</p>
      <ul>
        <li><span>主将適性</span><span>${entry.commanderScore.toFixed(1)} / 100</span></li>
        <li><span>最適役割</span><span>${escapeHtml(`${entry.bestSlot.label} ${entry.bestSlot.score.toFixed(1)}`)}</span></li>
        <li><span>推奨副将</span><span>${escapeHtml(entry.vicePairText)}</span></li>
        <li><span>副将連鎖</span><span>${escapeHtml(entry.viceChainText)}</span></li>
        <li><span>一致タグ</span><span>${escapeHtml(entry.featureText)}</span></li>
        <li><span>状況</span><span>${escapeHtml(entry.usageText)}</span></li>
      </ul>
      <div class="card-actions">
        <button class="mini-button" type="button" data-army-use-seed="${escapeHtml(entry.meta.character.name)}">この武将を軸に再編成</button>
      </div>
    </article>
  `;
}

function renderArmyViceShortlistCard(commanderMeta, entry) {
  return `
    <article class="quick-card">
      <span class="status-pill ${entry.rank <= 2 ? "is-live" : "is-plan"}">副将候補 ${entry.rank}</span>
      <h3>${escapeHtml(entry.pair.map((meta) => meta.character.name).join(" + "))}</h3>
      <p>${escapeHtml(commanderMeta.character.name)} の副将ペア候補です。</p>
      <ul>
        <li><span>平均連鎖</span><span>${escapeHtml(formatPercent(entry.chainAverage))}</span></li>
        <li><span>連鎖内訳</span><span>${escapeHtml(entry.viceChainText)}</span></li>
        <li><span>役割補完</span><span>${escapeHtml(entry.supportText || "汎用")}</span></li>
        <li><span>総合評価</span><span>${entry.score.toFixed(1)} / 100</span></li>
        <li><span>状況</span><span>${escapeHtml(entry.usageText)}</span></li>
      </ul>
    </article>
  `;
}

function renderArmySwapSuggestionCard(entry) {
  return `
    <article class="quick-card">
      <span class="status-pill ${entry.score >= 4 ? "is-live" : "is-next"}">改善 ${escapeHtml(formatArmyScoreDelta(entry.score))}</span>
      <h3>第${entry.unitIndex + 1}部隊 ${escapeHtml(entry.slotLabel)}</h3>
      <p>${escapeHtml(`${entry.outgoing.character.name} → ${entry.incoming.character.name}`)}</p>
      <ul>
        <li><span>枠評価差</span><span>${escapeHtml(formatArmyScoreDelta(entry.scoreDelta))}</span></li>
        <li><span>役割増分</span><span>${escapeHtml(String(entry.roleGain))}</span></li>
        <li><span>補足</span><span>${escapeHtml(entry.detailText)}</span></li>
        <li><span>特徴</span><span>${escapeHtml(entry.incoming.character.featureTags.slice(0, 4).join(" / ") || "主要タグなし")}</span></li>
      </ul>
      <div class="card-actions">
        <button class="mini-button" type="button" data-army-use-seed="${escapeHtml(entry.incoming.character.name)}">この武将を軸に再編成</button>
      </div>
    </article>
  `;
}

function renderArmyExcludedReasonCard(entry) {
  return `
    <article class="quick-card">
      <span class="status-pill is-plan">落選理由</span>
      <h3>${escapeHtml(entry.meta.character.name)}</h3>
      <p>${escapeHtml(entry.meta.character.rarity)} / ${escapeHtml(entry.meta.character.type || "-")} / 天賦 ${entry.meta.character.tenpu}</p>
      <ul>
        <li><span>最適役割</span><span>${escapeHtml(`${entry.bestSlot.label} ${entry.bestSlot.score.toFixed(1)}`)}</span></li>
        <li><span>基準</span><span>${escapeHtml(`${entry.bestSlot.floor.toFixed(0)} 以上`)}</span></li>
        <li><span>重複役割</span><span>${escapeHtml(entry.overlapLabels.join(" / ") || "大きな重複なし")}</span></li>
        <li><span>理由</span><span>${escapeHtml(entry.reasons.join(" / "))}</span></li>
      </ul>
      <div class="card-actions">
        <button class="mini-button" type="button" data-army-use-seed="${escapeHtml(entry.meta.character.name)}">この武将を軸に再編成</button>
      </div>
    </article>
  `;
}

function renderArmyUnitCard(unit, unitIndex, armyIndex, unitPowerEstimate) {
  const slotMarkup = unit.unitMembers
    .map((member) => {
      const chainText = member.chainStats ? `連鎖率 ${formatPercent(member.chainStats.rate)}` : "";
      const snapshot = unitPowerEstimate.members.find((entry) => entry.meta.character.id === member.meta.character.id)?.snapshot;
      return `
        <div class="army-slot-item">
          <div class="army-role-line">
            <span><strong>${escapeHtml(member.label)}</strong>${escapeHtml(member.meta.character.name)}</span>
            <span>${escapeHtml(member.meta.character.rarity)} / ${escapeHtml(member.meta.character.type || "-")}</span>
          </div>
          <div class="army-list-row">
            <span>特徴</span>
            <span>${escapeHtml(member.meta.character.featureTags.slice(0, 4).join(" / ") || "主要タグなし")}</span>
          </div>
          <div class="army-list-row">
            <span>役割</span>
            <span>${escapeHtml(
              member.meta.roleTags
                .filter(
                  (tag) =>
                    tag.startsWith("role.") ||
                    tag.startsWith("support.") ||
                    tag.startsWith("def.") ||
                    tag.startsWith("control.") ||
                    tag.startsWith("tempo.") ||
                    tag.startsWith("siege.")
                )
                .slice(0, 4)
                .map(armyRoleTagLabel)
                .join(" / ") || "汎用"
            )}</span>
          </div>
          ${
            snapshot
              ? `<div class="army-list-row"><span>推定戦力</span><span>${escapeHtml(
                  `${formatArmyEstimateNumber(snapshot.current)} → ${formatArmyEstimateNumber(snapshot.potential)}`
                )}</span></div>`
              : ""
          }
          ${
            chainText
              ? `<div class="army-list-row"><span>副将連鎖</span><span>${escapeHtml(chainText)}</span></div>`
              : ""
          }
        </div>
      `;
    })
    .join("");

  return `
    <article class="army-unit-card">
      <div class="army-unit-head">
        <div>
          <h3>第${unitIndex + 1}部隊</h3>
          <p>${escapeHtml(unit.assignedFormationSlot?.label || "-")} / ${escapeHtml(builderRowLabelFor(unit.assignedRow))} / 主将 ${escapeHtml(unit.commander.name)}</p>
        </div>
        <span class="count-pill">${unit.total.toFixed(1)}</span>
      </div>
      <div class="army-score-line">
        <span>評価</span>
        <span>
          主将適性 ${unit.scoreBreakdown.slotFitScore.toFixed(1)} |
          相性 ${unit.scoreBreakdown.synergyScore.toFixed(1)} |
          継戦 ${unit.scoreBreakdown.sustainScore.toFixed(1)}
        </span>
      </div>
      <div class="army-power-line">
        <span>推定部隊戦力</span>
        <span>
          現在 ${formatArmyEstimateNumber(unitPowerEstimate.current)} / 最大見込み ${formatArmyEstimateNumber(
            unitPowerEstimate.potential
          )} / 伸び幅 ${formatArmyEstimateNumber(unitPowerEstimate.growth)}
        </span>
      </div>
      <div class="army-slot-list">${slotMarkup}</div>
      <div class="army-explanation">
        <div class="army-note-list">
          ${unit.reasons.map((reason) => `<div class="army-list-row"><span>採用理由</span><span>${escapeHtml(reason)}</span></div>`).join("")}
          ${unit.warnings.map((warning) => `<div class="army-list-row"><span>注意点</span><span>${escapeHtml(warning)}</span></div>`).join("")}
        </div>
      </div>
      <div class="card-actions">
        <button class="mini-button" type="button" data-open-army-unit-builder="${armyIndex}:${unitIndex}">この部隊を編成ツールで開く</button>
      </div>
    </article>
  `;
}

function renderArmyAlternativeCard(army, index) {
  const commanderNames = army.units.map((unit) => unit.commander.name).join(" / ");
  const powerEstimate = getArmyPowerEstimate(army);
  return `
    <article class="quick-card">
      <span class="status-pill ${index === activeArmyAlternativeIndex ? "is-live" : "is-next"}">候補 ${index + 1}</span>
      <h3>総合 ${army.total.toFixed(1)}</h3>
      <p>${escapeHtml(army.summaryParts.join(" | "))}</p>
      <ul>
        <li><span>主将</span><span>${escapeHtml(commanderNames)}</span></li>
        <li><span>推定戦力</span><span>${escapeHtml(formatArmyEstimateNumber(powerEstimate.current))}</span></li>
        <li><span>陣形</span><span>${escapeHtml(army.formation.name)}</span></li>
        <li><span>不足役割</span><span>${escapeHtml(army.missingRules.map((rule) => armyRoleTagLabel(rule.tag)).join(" / ") || "大きな不足なし")}</span></li>
        <li><span>ペナルティ</span><span>${escapeHtml(Object.keys(army.penalties).join(" / ") || "なし")}</span></li>
      </ul>
      <div class="card-actions">
        <button class="mini-button" type="button" data-army-alternative-index="${index}">この案を表示</button>
      </div>
    </article>
  `;
}

function renderArmyReserveCard(entry) {
  return `
    <article class="quick-card">
      <span class="status-pill is-plan">予備候補</span>
      <h3>${escapeHtml(entry.meta.character.name)}</h3>
      <p>${escapeHtml(entry.meta.character.rarity)} / ${escapeHtml(entry.meta.character.type || "-")} / 天賦 ${entry.meta.character.tenpu}</p>
      <ul>
        ${entry.reasons.map((reason) => `<li><span>理由</span><span>${escapeHtml(reason)}</span></li>`).join("")}
      </ul>
      <div class="card-actions">
        <button class="mini-button" type="button" data-army-use-seed="${escapeHtml(entry.meta.character.name)}">この武将を軸に再編成</button>
      </div>
    </article>
  `;
}

function openArmyUnitInBuilder(armyIndex, unitIndex) {
  const army = lastArmyPlannerResult?.armies?.[armyIndex];
  const unit = army?.units?.[unitIndex];
  if (!unit) {
    return;
  }

  if (elements.builderFormation) {
    elements.builderFormation.value = army.formation?.key ?? FORMATION_DEFS[0].key;
  }
  if (typeof populateBuilderFormationSlotOptions === "function") {
    populateBuilderFormationSlotOptions();
  }
  if (typeof populateBuilderTargetSlotOptions === "function") {
    populateBuilderTargetSlotOptions();
  }
  if (elements.builderFormationSlot) {
    elements.builderFormationSlot.value = unit.assignedFormationSlot?.key ?? FORMATION_DEFS[0].slots[0].key;
  }
  if (elements.builderTargetSlot) {
    elements.builderTargetSlot.value = unit.assignedFormationSlot?.key ?? FORMATION_DEFS[0].slots[0].key;
  }
  if (elements.builderPreviewSecond && army.formation?.key && unit.assignedFormationSlot?.key) {
    const formation = FORMATION_MAP[army.formation.key];
    const baseSecond = getFormationSlotBaseSecond(formation, unit.assignedFormationSlot.key);
    const triggerSeconds = unit.unitMembers
      .filter((member) => member.slotKey === "commander" || member.slotKey === "vice1" || member.slotKey === "vice2")
      .map((member) => {
        const orderScore = TACTIC_ORDER_SCORES[member.slotKey]?.[member.meta.character.battleArtMeta?.chainOrder ?? "普通"] ?? 4;
        return baseSecond + (BUILDER_CHAIN_SECOND_OFFSETS[orderScore] ?? 0);
      });
    elements.builderPreviewSecond.value = `${Math.min(60, Math.min(...triggerSeconds))}`;
  }
  unit.unitMembers.forEach((member) => {
    const input =
      member.slotKey === "commander"
        ? elements.builderCommander
        : member.slotKey === "vice1"
          ? elements.builderVice1
          : member.slotKey === "vice2"
            ? elements.builderVice2
            : member.slotKey === "aide1"
              ? elements.builderAide1
              : elements.builderAide2;

    if (input) {
      input.value = member.meta.character.name;
    }
  });

  if (elements.builderVice1Enabled) {
    elements.builderVice1Enabled.checked = true;
  }
  if (elements.builderVice2Enabled) {
    elements.builderVice2Enabled.checked = true;
  }
  if (elements.builderPreviewSecond && typeof buildBuilderState === "function") {
    const builderState = buildBuilderState();
    const firstWindowSecond = Math.min(
      ...builderState.timelineEntries.flatMap((entry) => entry.windows.map((window) => window.startSecond)),
      Number(elements.builderPreviewSecond.value || 20)
    );
    elements.builderPreviewSecond.value = `${Math.min(60, firstWindowSecond)}`;
  }

  setActiveView("builder", { scrollToNav: true });
  renderBuilderView();
}

function renderArmyPlanner(result = null) {
  if (!elements.armyView) {
    return;
  }

  if (result) {
    lastArmyPlannerResult = result;
    activeArmyAlternativeIndex = 0;
  } else if (!lastArmyPlannerResult) {
    lastArmyPlannerResult = buildArmyPlannerResult();
  }

  const plannerResult = result ?? lastArmyPlannerResult;
  renderArmyRosterUi();
  renderArmyFormationInfoCards(
    {
      concept: ARMY_CONCEPT_MAP[elements.armyConcept?.value] ?? ARMY_CONCEPT_DEFS[0],
      formationChoiceKey: sanitizeArmyFormationChoiceKey(elements.armyFormation?.value ?? "auto")
    },
    null
  );
  elements.armySummary.textContent = plannerResult.summary;
  elements.armyValidation.textContent = plannerResult.validation;
  elements.armyValidation.hidden = !plannerResult.validation;
  elements.armyTopCount.textContent = `${plannerResult.armies.length}件`;

  if (!plannerResult.armies.length) {
    renderArmyFormationInfoCards(plannerResult, null);
    elements.armyOverviewGrid.innerHTML = renderEmptyState(
      plannerResult.validation || "条件に合う軍勢がありません。"
    );
    if (elements.armyAuditGrid) {
      elements.armyAuditGrid.innerHTML = renderEmptyState("軍勢が生成されると、ここに診断を表示します。");
    }
    elements.armyUnitGrid.innerHTML = "";
    if (elements.armyCommanderGrid) {
      elements.armyCommanderGrid.innerHTML = "";
    }
    if (elements.armyViceGrid) {
      elements.armyViceGrid.innerHTML = "";
    }
    elements.armyAlternativeGrid.innerHTML = "";
    if (elements.armySwapGrid) {
      elements.armySwapGrid.innerHTML = "";
    }
    elements.armyReserveGrid.innerHTML = "";
    if (elements.armyExcludedGrid) {
      elements.armyExcludedGrid.innerHTML = "";
    }
    return;
  }

  const activeArmy = plannerResult.armies[activeArmyAlternativeIndex] ?? plannerResult.armies[0];
  const powerEstimate = getArmyPowerEstimate(activeArmy);
  renderArmyFormationInfoCards(plannerResult, activeArmy);
  elements.armyOverviewGrid.innerHTML = renderArmyOverviewCards(activeArmy, plannerResult, powerEstimate);
  if (elements.armyAuditGrid) {
    elements.armyAuditGrid.innerHTML = renderArmyAuditCards(plannerResult.auditCards ?? []);
  }
  elements.armyUnitGrid.innerHTML = powerEstimate.units
    .map((unit, unitIndex) => renderArmyUnitCard(unit, unitIndex, activeArmyAlternativeIndex, unit.powerEstimate))
    .join("");
  if (elements.armyCommanderGrid) {
    elements.armyCommanderGrid.innerHTML = (plannerResult.commanderShortlist ?? []).length
      ? plannerResult.commanderShortlist.map((entry) => renderArmyCommanderShortlistCard(entry)).join("")
      : renderEmptyState("主将候補はまだ出せません。");
  }
  if (elements.armyViceGrid) {
    elements.armyViceGrid.innerHTML = (plannerResult.viceShortlist?.entries ?? []).length
      ? plannerResult.viceShortlist.entries
          .map((entry) => renderArmyViceShortlistCard(plannerResult.viceShortlist.commanderMeta, entry))
          .join("")
      : renderEmptyState("副将候補はまだ出せません。");
  }
  elements.armyAlternativeGrid.innerHTML = plannerResult.armies
    .map((army, index) => renderArmyAlternativeCard(army, index))
    .join("");
  if (elements.armySwapGrid) {
    elements.armySwapGrid.innerHTML = (plannerResult.swapSuggestions ?? []).length
      ? plannerResult.swapSuggestions.map((entry) => renderArmySwapSuggestionCard(entry)).join("")
      : renderEmptyState("1枠差し替えで大きく伸びる候補はありません。");
  }
  elements.armyReserveGrid.innerHTML = plannerResult.reserveSuggestions.length
    ? plannerResult.reserveSuggestions.map((entry) => renderArmyReserveCard(entry)).join("")
    : renderEmptyState("差し替え候補はありません。");
  if (elements.armyExcludedGrid) {
    elements.armyExcludedGrid.innerHTML = (plannerResult.exclusionReasons ?? []).length
      ? plannerResult.exclusionReasons.map((entry) => renderArmyExcludedReasonCard(entry)).join("")
      : renderEmptyState("非採用理由を出せる候補はありません。");
  }
}

function resetArmyPlanner() {
  if (!elements.armyView) {
    return;
  }

  elements.armySeedCharacter.value = "";
  elements.armySeedMode.value = "best";
  elements.armyConcept.value = "balanced";
  if (elements.armyFormation) {
    elements.armyFormation.value = "auto";
  }
  if (elements.armyRosterSearch) {
    elements.armyRosterSearch.value = "";
  }
  renderCheckboxGroup(elements.armyRarityFilters, RARITY_DEFS, "army-rarity", ARMY_BUILDER_DEFAULT_RARITIES);
  lastArmyPlannerResult = null;
  activeArmyAlternativeIndex = 0;
  renderArmyRosterUi();
  renderArmyPlanner(buildArmyPlannerResult());
}

function bindArmyPlannerEvents() {
  if (!elements.armyView) {
    return;
  }

  elements.armyBuildButton?.addEventListener("click", () => {
    scheduleArmyPlannerRebuild(true);
  });
  elements.armyResetButton?.addEventListener("click", resetArmyPlanner);
  elements.armySeedCharacter?.addEventListener("change", () => scheduleArmyPlannerRebuild(true));
  elements.armySeedMode?.addEventListener("change", () => scheduleArmyPlannerRebuild(true));
  elements.armyConcept?.addEventListener("change", () => scheduleArmyPlannerRebuild(true));
  elements.armyFormation?.addEventListener("change", () => scheduleArmyPlannerRebuild(true));
  elements.armyRarityFilters?.addEventListener("change", () => scheduleArmyPlannerRebuild(true));
  elements.armyRosterSearch?.addEventListener("input", renderArmyRosterGrid);
  elements.armyDefaultInvestment?.addEventListener("change", () => {
    setArmyRosterDefaults({ defaultInvestmentTier: elements.armyDefaultInvestment.value });
    renderArmyRosterUi();
  });
  elements.armyDefaultEquipment?.addEventListener("change", () => {
    setArmyRosterDefaults({ defaultEquipmentFit: elements.armyDefaultEquipment.value });
    renderArmyRosterUi();
  });
  elements.armySelectAllSsrButton?.addEventListener("click", () => {
    setArmyRosterBatchByRarity("SSR");
    renderArmyRosterUi();
    scheduleArmyPlannerRebuild();
  });
  elements.armySelectAllSrButton?.addEventListener("click", () => {
    setArmyRosterBatchByRarity("SR");
    renderArmyRosterUi();
    scheduleArmyPlannerRebuild();
  });
  elements.armyClearRosterButton?.addEventListener("click", () => {
    clearArmyRosterSelection();
    renderArmyRosterUi();
    scheduleArmyPlannerRebuild(true);
  });
  elements.armyView.addEventListener("click", (event) => {
    const rosterButton = event.target.closest("[data-army-roster-toggle]");
    if (rosterButton) {
      const characterId = Number(rosterButton.dataset.armyRosterToggle);
      setArmyRosterOwned(characterId, !isArmyCharacterOwned(characterId));
      renderArmyRosterUi();
      scheduleArmyPlannerRebuild();
      return;
    }

    const removeOwnedButton = event.target.closest("[data-army-roster-remove]");
    if (removeOwnedButton) {
      setArmyRosterOwned(Number(removeOwnedButton.dataset.armyRosterRemove), false);
      renderArmyRosterUi();
      scheduleArmyPlannerRebuild();
      return;
    }

    const builderButton = event.target.closest("[data-open-army-unit-builder]");
    if (builderButton) {
      const [armyIndex, unitIndex] = builderButton.dataset.openArmyUnitBuilder
        .split(":")
        .map((value) => Number(value));
      openArmyUnitInBuilder(armyIndex, unitIndex);
      return;
    }

    const alternativeButton = event.target.closest("[data-army-alternative-index]");
    if (alternativeButton) {
      activeArmyAlternativeIndex = Number(alternativeButton.dataset.armyAlternativeIndex) || 0;
      renderArmyPlanner();
      return;
    }

    const seedButton = event.target.closest("[data-army-use-seed]");
    if (seedButton) {
      elements.armySeedCharacter.value = seedButton.dataset.armyUseSeed;
      scheduleArmyPlannerRebuild(true);
      return;
    }

    const formationButton = event.target.closest("[data-army-formation-select]");
    if (formationButton && elements.armyFormation) {
      elements.armyFormation.value = formationButton.dataset.armyFormationSelect;
      scheduleArmyPlannerRebuild(true);
    }
  });
  elements.armyView.addEventListener("change", (event) => {
    const profileField = event.target.closest("[data-army-profile-id]");
    if (!profileField) {
      return;
    }

    patchArmyRosterProfile(Number(profileField.dataset.armyProfileId), {
      [profileField.dataset.armyProfileField]: profileField.value
    });
    renderArmyRosterUi();
    scheduleArmyPlannerRebuild();
  });
}

function populateArmyPlannerControls() {
  if (!elements.armyView) {
    return;
  }

  populateCharacterSelect(elements.armySeedCharacter, "固定しない");
  populateSimpleSelect(elements.armySeedMode, ARMY_SEED_MODE_DEFS, "best");
  populateSimpleSelect(elements.armyConcept, ARMY_CONCEPT_DEFS, "balanced");
  populateSimpleSelect(elements.armyFormation, ARMY_FORMATION_SELECT_DEFS, "auto");
  populateSimpleSelect(elements.armyDefaultInvestment, ARMY_INVESTMENT_TIER_DEFS, armyRosterState.defaultInvestmentTier);
  populateSimpleSelect(elements.armyDefaultEquipment, ARMY_EQUIPMENT_FIT_DEFS, armyRosterState.defaultEquipmentFit);
  renderCheckboxGroup(elements.armyRarityFilters, RARITY_DEFS, "army-rarity", ARMY_BUILDER_DEFAULT_RARITIES);
  renderArmyRosterUi();
}

function renderArmyPlannerIdleState() {
  if (!elements.armyView) {
    return;
  }

  elements.armySummary.textContent =
    "検索条件: 手持ちを選び、軸武将・固定役割・軍勢コンセプトを決めると 25 体軍勢を自動編成します。";
  elements.armyValidation.hidden = true;
  elements.armyValidation.textContent = "";
  elements.armyTopCount.textContent = "未計算";
  renderArmyRosterUi();
  elements.armyOverviewGrid.innerHTML = renderEmptyState(
    "軍勢自動編成を実行すると、ここに総評とおすすめ陣形を表示します。"
  );
  if (elements.armyAuditGrid) {
    elements.armyAuditGrid.innerHTML = renderEmptyState("ここに役割不足、採用基準、陣形比較、信頼度を表示します。");
  }
  elements.armyUnitGrid.innerHTML = "";
  if (elements.armyCommanderGrid) {
    elements.armyCommanderGrid.innerHTML = "";
  }
  if (elements.armyViceGrid) {
    elements.armyViceGrid.innerHTML = "";
  }
  elements.armyAlternativeGrid.innerHTML = "";
  if (elements.armySwapGrid) {
    elements.armySwapGrid.innerHTML = "";
  }
  elements.armyReserveGrid.innerHTML = "";
  if (elements.armyExcludedGrid) {
    elements.armyExcludedGrid.innerHTML = "";
  }
}

function ensureArmyPlannerRendered() {
  if (!elements.armyView || elements.armyView.hidden || lastArmyPlannerResult) {
    return;
  }

  renderArmyPlanner(buildArmyPlannerResult());
}

function bootArmyPlanner() {
  if (!elements.armyView) {
    return;
  }

  populateArmyPlannerControls();
  bindArmyPlannerEvents();
  renderArmyPlannerIdleState();

  document
    .querySelectorAll('[data-view-tab="army"], [data-switch-view="army"]')
    .forEach((button) => button.addEventListener("click", () => window.setTimeout(ensureArmyPlannerRendered, 0)));

  if (!elements.armyView.hidden) {
    ensureArmyPlannerRendered();
  }
}

bootArmyPlanner();
