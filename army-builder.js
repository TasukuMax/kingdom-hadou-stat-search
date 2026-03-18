const ARMY_BUILDER_DEFAULT_RARITIES = RARITY_DEFS.map((row) => row.key);
const ARMY_BUILDER_ROW_KEYS = BUILDER_ROW_DEFS.map((row) => row.key);
const ARMY_BUILDER_LIMITS = {
  commanderSeeds: 14,
  vicePool: 12,
  aidePool: 9,
  vicePairKeep: 24,
  keepUnitsPerCommander: 10,
  genericUnitPool: 54,
  armyBeamWidth: 80,
  finalArmies: 3,
  reserveCount: 8
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

const ARMY_GUIDE_DATA = buildArmyGuideMaps();
const ARMY_CHARACTER_META_BY_ID = new Map(
  preparedCharacters.map((character) => [character.id, deriveArmyCharacterMeta(character)])
);

let lastArmyPlannerResult = null;
let activeArmyAlternativeIndex = 0;

function clampArmyScore(value) {
  return Math.max(0, Math.min(100, value));
}

function sumArmyValues(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

function averageArmyValues(values) {
  return values.length ? sumArmyValues(values) / values.length : 0;
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

  if (slotKey === "commander") {
    const stored = meta.slotScores.commander;
    const commanderBias = concept.commanderTypeBias?.[meta.character.type] ?? 0;
    return clampArmyScore(
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
  }

  if (slotKey.startsWith("vice")) {
    const stored = meta.slotScores.vice;
    return clampArmyScore(
      (stored ?? 0) * 0.34 +
        getArmyConceptAffinity(meta, concept) * 0.22 +
        meta.groupScores.offense * 0.14 +
        meta.groupScores.control * 0.14 +
        meta.chainPotential * 0.08 +
        rarityBase * 0.03 +
        tenpuRatio * 0.05 +
        guideBonus
    );
  }

  const stored = meta.slotScores.aide;
  const srAideBonus = meta.character.rarity === "SR" ? 4 : 0;
  return clampArmyScore(
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
        let score =
          (meta.character.rarity === "SSR" ? 100 : 84) * 0.4 +
          (meta.character.tenpu / 900) * 100 * 0.6;
        if (slotKey.startsWith("aide") && meta.character.rarity === "SR") {
          score += 4;
        }
        return score;
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

function chooseArmyRowAssignment(units, concept) {
  const target = concept.rowTarget ?? { front: 2, middle: 2, back: 1 };
  let best = null;

  function walk(index, counts, currentScore, rows) {
    if (index === units.length) {
      const valid = ARMY_BUILDER_ROW_KEYS.every((rowKey) => (counts[rowKey] ?? 0) === (target[rowKey] ?? 0));
      if (!valid) {
        return;
      }

      if (!best || currentScore > best.score) {
        best = {
          score: currentScore,
          rows: [...rows]
        };
      }
      return;
    }

    for (const rowKey of ARMY_BUILDER_ROW_KEYS) {
      if ((counts[rowKey] ?? 0) >= (target[rowKey] ?? 0)) {
        continue;
      }

      counts[rowKey] = (counts[rowKey] ?? 0) + 1;
      rows.push(rowKey);
      walk(index + 1, counts, currentScore + (units[index].rowScores[rowKey] ?? 0), rows);
      rows.pop();
      counts[rowKey] -= 1;
    }
  }

  walk(0, { front: 0, middle: 0, back: 0 }, 0, []);

  if (best) {
    return best;
  }

  return {
    score: sumArmyValues(units.map((unit) => unit.rowScores[unit.defaultRow] ?? 0)),
    rows: units.map((unit) => unit.defaultRow)
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

function buildArmyStates(unitPool, concept, seedMeta, seedUnits) {
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
      .map((state) => evaluateArmyComposition(state.units, concept, seedMeta)),
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

function buildFallbackArmyVariant(allowedMetas, concept, seedMeta, seedSlots, variantIndex) {
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

  return evaluateArmyComposition(units, concept, seedMeta);
}

function buildFallbackArmies(allowedMetas, concept, seedMeta, seedSlots) {
  const variants = [];
  const signatures = new Set();

  for (let variantIndex = 0; variantIndex < 4; variantIndex += 1) {
    const army = buildFallbackArmyVariant(allowedMetas, concept, seedMeta, seedSlots, variantIndex);
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
  const selectedRarities = readCheckedValuesIn(elements.armyRarityFilters, "army-rarity");
  const seedCharacter = characterByName[elements.armySeedCharacter.value] ?? null;
  const seedMeta = getArmyMeta(seedCharacter);
  const seedSlots = resolveArmySeedSlots(seedCharacter, elements.armySeedMode.value);
  const allowedMetas = preparedCharacters
    .filter(
      (character) =>
        selectedRarities.includes(character.rarity) || (seedCharacter && character.id === seedCharacter.id)
    )
    .map((character) => getArmyMeta(character));

  if (allowedMetas.length < 25) {
    return {
      validation: `選択中のレアリティでは ${allowedMetas.length} 体しか使えません。25体以上を確保してください。`,
      summary: formatSummaryText(
        [
          `コンセプト: ${concept.label}`,
          selectedRarities.length ? `レアリティ: ${selectedRarities.join(" / ")}` : ""
        ].filter(Boolean),
        "条件を調整してください。"
      ),
      armies: [],
      reserveSuggestions: []
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
  let armies = buildArmyStates(unitPool, concept, seedMeta, seedUnits);

  if (!armies.length) {
    armies = buildFallbackArmies(allowedMetas, concept, seedMeta, seedSlots);
  }

  if (seedMeta) {
    armies = armies.filter((army) => armyContainsSeed(army, seedMeta));

    if (!armies.length) {
      const retrySeedSlotGroups =
        elements.armySeedMode.value === "best"
          ? [["commander"], ["vice"], ["aide"]]
          : [seedSlots];

      for (const retrySeedSlots of retrySeedSlotGroups) {
        armies = buildFallbackArmies(allowedMetas, concept, seedMeta, retrySeedSlots).filter((army) =>
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
          seedCharacter ? `固定武将: ${seedCharacter.name}` : "",
          seedSlots.length
            ? `固定役割: ${ARMY_SEED_MODE_DEFS.find((row) => row.key === elements.armySeedMode.value)?.label}`
            : ""
        ].filter(Boolean),
        "軍勢自動編成"
      ),
      armies: [],
      reserveSuggestions: []
    };
  }

  const bestArmy = armies[0];

  return {
    validation: "",
    concept,
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
        `レアリティ: ${selectedRarities.join(" / ")}`
      ].filter(Boolean),
      "軍勢自動編成"
    ),
    armies,
    reserveSuggestions: buildArmyReserveSuggestions(bestArmy, allowedMetas, concept)
  };
}

function renderArmyOverviewCards(army, result) {
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
    ? army.satisfiedRules.map((rule) => `${rule.tag} ${rule.count}/${rule.minUnits}`).join(" / ")
    : "主な役割を採点中";

  const missingText = army.missingRules.length
    ? army.missingRules.map((rule) => `${rule.tag} ${rule.count}/${rule.minUnits}`).join(" / ")
    : "不足役割は大きくありません";

  const cards = [
    {
      title: "総合スコア",
      body: `上位 ${activeArmyAlternativeIndex + 1} 位の軍勢です。`,
      detail: `総合 ${army.total.toFixed(1)} / 100`,
      extra: `軍勢総合 ${army.scoreBreakdown.armyPowerScore.toFixed(1)} | 主将品質 ${army.scoreBreakdown.commanderQualityScore.toFixed(1)}`
    },
    {
      title: "推奨陣形と列配分",
      body: `${army.formation.name} を推奨します。`,
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

function renderArmyUnitCard(unit, unitIndex, armyIndex) {
  const slotMarkup = unit.unitMembers
    .map((member) => {
      const chainText = member.chainStats ? `連鎖率 ${formatPercent(member.chainStats.rate)}` : "";
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
            <span>${escapeHtml(member.meta.roleTags.filter((tag) => tag.startsWith("role.") || tag.startsWith("support.") || tag.startsWith("def.") || tag.startsWith("control.")).slice(0, 4).join(" / ") || "汎用")}</span>
          </div>
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
          <p>${escapeHtml(builderRowLabelFor(unit.assignedRow))} / 主将 ${escapeHtml(unit.commander.name)}</p>
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
  return `
    <article class="quick-card">
      <span class="status-pill ${index === activeArmyAlternativeIndex ? "is-live" : "is-next"}">候補 ${index + 1}</span>
      <h3>総合 ${army.total.toFixed(1)}</h3>
      <p>${escapeHtml(army.summaryParts.join(" | "))}</p>
      <ul>
        <li><span>主将</span><span>${escapeHtml(commanderNames)}</span></li>
        <li><span>不足役割</span><span>${escapeHtml(army.missingRules.map((rule) => rule.tag).join(" / ") || "大きな不足なし")}</span></li>
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

  elements.builderRow.value = unit.assignedRow;
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
  elements.armySummary.textContent = plannerResult.summary;
  elements.armyValidation.textContent = plannerResult.validation;
  elements.armyValidation.hidden = !plannerResult.validation;
  elements.armyTopCount.textContent = `${plannerResult.armies.length}件`;

  if (!plannerResult.armies.length) {
    elements.armyOverviewGrid.innerHTML = renderEmptyState(
      plannerResult.validation || "条件に合う軍勢がありません。"
    );
    elements.armyUnitGrid.innerHTML = "";
    elements.armyAlternativeGrid.innerHTML = "";
    elements.armyReserveGrid.innerHTML = "";
    return;
  }

  const activeArmy = plannerResult.armies[activeArmyAlternativeIndex] ?? plannerResult.armies[0];
  elements.armyOverviewGrid.innerHTML = renderArmyOverviewCards(activeArmy, plannerResult);
  elements.armyUnitGrid.innerHTML = activeArmy.units
    .map((unit, unitIndex) => renderArmyUnitCard(unit, unitIndex, activeArmyAlternativeIndex))
    .join("");
  elements.armyAlternativeGrid.innerHTML = plannerResult.armies
    .map((army, index) => renderArmyAlternativeCard(army, index))
    .join("");
  elements.armyReserveGrid.innerHTML = plannerResult.reserveSuggestions.length
    ? plannerResult.reserveSuggestions.map((entry) => renderArmyReserveCard(entry)).join("")
    : renderEmptyState("差し替え候補はありません。");
}

function resetArmyPlanner() {
  if (!elements.armyView) {
    return;
  }

  elements.armySeedCharacter.value = "";
  elements.armySeedMode.value = "best";
  elements.armyConcept.value = "balanced";
  renderCheckboxGroup(elements.armyRarityFilters, RARITY_DEFS, "army-rarity", ARMY_BUILDER_DEFAULT_RARITIES);
  lastArmyPlannerResult = null;
  activeArmyAlternativeIndex = 0;
  renderArmyPlanner(buildArmyPlannerResult());
}

function bindArmyPlannerEvents() {
  if (!elements.armyView) {
    return;
  }

  elements.armyBuildButton?.addEventListener("click", () => {
    renderArmyPlanner(buildArmyPlannerResult());
  });
  elements.armyResetButton?.addEventListener("click", resetArmyPlanner);
  elements.armySeedCharacter?.addEventListener("change", () => renderArmyPlanner(buildArmyPlannerResult()));
  elements.armySeedMode?.addEventListener("change", () => renderArmyPlanner(buildArmyPlannerResult()));
  elements.armyConcept?.addEventListener("change", () => renderArmyPlanner(buildArmyPlannerResult()));
  elements.armyRarityFilters?.addEventListener("change", () => renderArmyPlanner(buildArmyPlannerResult()));
  elements.armyView.addEventListener("click", (event) => {
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
      renderArmyPlanner(buildArmyPlannerResult());
    }
  });
}

function populateArmyPlannerControls() {
  if (!elements.armyView) {
    return;
  }

  populateCharacterSelect(elements.armySeedCharacter, "固定しない");
  populateSimpleSelect(elements.armySeedMode, ARMY_SEED_MODE_DEFS, "best");
  populateSimpleSelect(elements.armyConcept, ARMY_CONCEPT_DEFS, "balanced");
  renderCheckboxGroup(elements.armyRarityFilters, RARITY_DEFS, "army-rarity", ARMY_BUILDER_DEFAULT_RARITIES);
}

function renderArmyPlannerIdleState() {
  if (!elements.armyView) {
    return;
  }

  elements.armySummary.textContent =
    "検索条件: 軸にする武将、固定役割、軍勢コンセプトを選ぶと 25 体軍勢を自動編成します。";
  elements.armyValidation.hidden = true;
  elements.armyValidation.textContent = "";
  elements.armyTopCount.textContent = "未計算";
  elements.armyOverviewGrid.innerHTML = renderEmptyState(
    "軍勢自動編成を実行すると、ここに総評とおすすめ陣形を表示します。"
  );
  elements.armyUnitGrid.innerHTML = "";
  elements.armyAlternativeGrid.innerHTML = "";
  elements.armyReserveGrid.innerHTML = "";
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
