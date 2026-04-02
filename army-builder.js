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
  commanderSeeds: Math.max(ARMY_SEARCH_CONFIG.commanderSeeds ?? 12, 18),
  commanderPreviewPool: 24,
  commanderShortlist: 15,
  commanderPreviewVicePool: 8,
  commanderPreviewAidePool: 6,
  commanderPreviewVicePairKeep: 14,
  commanderPreviewUnits: 3,
  vicePool: 12,
  aidePool: 9,
  vicePairKeep: 24,
  keepUnitsPerCommander: 10,
  genericUnitPool: Math.max((ARMY_SEARCH_CONFIG.unitBeamWidth ?? 50) + 4, 54),
  armyBeamWidth: Math.max(ARMY_SEARCH_CONFIG.armyBeamWidth ?? 120, 80),
  finalArmies: 3,
  reserveCount: 8,
  localSearchArmies: 3,
  localSearchUnitPool: 18,
  localSearchCommanderPool: 6,
  localSearchAidePairs: 10
};
const ARMY_TIMELINE_DEFAULT_SECOND = 20;
const ARMY_TIMELINE_MAX_SECOND = 60;
const ARMY_FORMATION_RECOMMENDATION_BY_CONCEPT = {
  balanced: "kakuyoku",
  siege: "suikou",
  counter: "kakuyoku",
  debuff: "sakubou",
  opener: "sakubou",
  defense: "kakuyoku",
  growth: "houjin",
  meta: "kakuyoku",
  powermax: "houjin"
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
const ARMY_POWER_IMPORT_STORAGE_KEY = "kh-army-power-import-v1";
const ARMY_IMAGE_IMPORT_HEADERS = ["武将名", "戦力", "攻撃", "防御", "戦威", "策略", "魅力", "レベル", "天賦", "秘伝"];
const ARMY_IMAGE_IMPORT_REQUIRED_FIELDS = ["name", "power", "attack", "defense", "war", "strategy"];
const ARMY_IMAGE_IMPORT_FIELD_DEFS = [
  { key: "name", label: "武将名", type: "text" },
  { key: "power", label: "戦力", type: "number" },
  { key: "attack", label: "攻撃", type: "number" },
  { key: "defense", label: "防御", type: "number" },
  { key: "war", label: "戦威", type: "number" },
  { key: "strategy", label: "策略", type: "number" },
  { key: "charm", label: "魅力", type: "number" },
  { key: "level", label: "Lv", type: "number" },
  { key: "tenpu", label: "天賦", type: "number" },
  { key: "secret", label: "秘伝", type: "number" }
];
const ARMY_REGRESSION_FEATURE_LABELS = {
  soldier: "兵力",
  attack: "攻撃",
  defense: "防御",
  war: "戦威",
  strategy: "策略",
  charm: "魅力",
  level: "Lv",
  tenpu: "天賦",
  secret: "秘伝"
};
const ARMY_OBSERVED_POWER_HYPOTHESIS_DEFS = [
  {
    key: "stats4",
    label: "4戦闘ステ",
    description: "攻撃・防御・戦威・策略だけで説明する最も単純な仮説です。",
    featureKeys: ["attack", "defense", "war", "strategy"]
  },
  {
    key: "stats4-level",
    label: "4戦闘ステ + Lv",
    description: "表示ステータスに加えて、レベルの独立寄与が残るとみなす仮説です。",
    featureKeys: ["attack", "defense", "war", "strategy", "level"]
  },
  {
    key: "stats4-tenpu",
    label: "4戦闘ステ + 天賦",
    description: "天賦が隠れた兵力差や育成差の代理になっている可能性をみます。",
    featureKeys: ["attack", "defense", "war", "strategy", "tenpu"]
  },
  {
    key: "stats4-level-secret",
    label: "4戦闘ステ + Lv + 秘伝",
    description: "従来のCSV補完と同じ、現在値向けの基準仮説です。",
    featureKeys: ["attack", "defense", "war", "strategy", "level", "secret"]
  },
  {
    key: "stats4-level-tenpu-secret",
    label: "4戦闘ステ + Lv + 天賦 + 秘伝",
    description: "天賦を加え、Lv/秘伝も別枠で評価する仮説です。",
    featureKeys: ["attack", "defense", "war", "strategy", "level", "tenpu", "secret"]
  },
  {
    key: "stats4-level-tenpu-charm-secret",
    label: "4戦闘ステ + Lv + 天賦 + 魅力 + 秘伝",
    description: "魅力も独立項にして、実測の改善があるかを検証する仮説です。",
    featureKeys: ["attack", "defense", "war", "strategy", "level", "tenpu", "charm", "secret"]
  }
];
const HERO_POWER_HYPOTHESIS_DEFS = [
  {
    key: "stats4",
    label: "仮説A: 4戦闘ステ",
    description: "攻撃・防御・戦威・策略だけで表示戦力を説明できるとみる仮説です。",
    featureKeys: ["attack", "defense", "war", "strategy"]
  },
  {
    key: "stats4-level",
    label: "仮説B: 4戦闘ステ + Lv",
    description: "レベルに独立加点が残っている可能性を検証します。",
    featureKeys: ["attack", "defense", "war", "strategy", "level"]
  },
  {
    key: "stats4-tenpu",
    label: "仮説C: 4戦闘ステ + 天賦",
    description: "天賦が見えない兵力差や育成差の代理になっているとみる仮説です。",
    featureKeys: ["attack", "defense", "war", "strategy", "tenpu"]
  },
  {
    key: "stats4-level-tenpu",
    label: "仮説D: 4戦闘ステ + Lv + 天賦",
    description: "Lv と天賦がどちらも別枠で残るかを検証します。",
    featureKeys: ["attack", "defense", "war", "strategy", "level", "tenpu"]
  },
  {
    key: "stats4-level-tenpu-charm",
    label: "仮説E: 4戦闘ステ + Lv + 天賦 + 魅力",
    description: "魅力を足すことで精度が上がるかを最後に確認する仮説です。",
    featureKeys: ["attack", "defense", "war", "strategy", "level", "tenpu", "charm"]
  }
];
const HERO_POWER_RESEARCH_SAMPLE_ROWS = [
  {
    key: "sample-ouki",
    name: "王騎",
    source: "ユーザー提供画像",
    power: 4476,
    attack: 704,
    defense: 700,
    war: 622,
    strategy: 571,
    charm: 672,
    level: 36,
    tenpu: 900
  },
  {
    key: "sample-tou",
    name: "騰",
    source: "ユーザー提供画像",
    power: 4170,
    attack: 575,
    defense: 646,
    war: 669,
    strategy: 494,
    charm: 497,
    level: 32,
    tenpu: 900
  },
  {
    key: "sample-rokoumi",
    name: "録嗚未",
    source: "ユーザー提供画像",
    power: 3996,
    attack: 666,
    defense: 644,
    war: 482,
    strategy: 380,
    charm: 454,
    level: 32,
    tenpu: 850
  },
  {
    key: "sample-rankai",
    name: "ランカイ",
    source: "ユーザー提供画像",
    power: 3979,
    attack: 696,
    defense: 688,
    war: 464,
    strategy: 86,
    charm: 157,
    level: 32,
    tenpu: 850
  },
  {
    key: "sample-shin",
    name: "信",
    source: "ユーザー提供画像",
    power: 3879,
    attack: 667,
    defense: 520,
    war: 596,
    strategy: 278,
    charm: 498,
    level: 32,
    tenpu: 850
  },
  {
    key: "sample-eisei",
    name: "嬴政",
    source: "ユーザー提供画像",
    power: 3762,
    attack: 475,
    defense: 477,
    war: 561,
    strategy: 626,
    charm: 661,
    level: 32,
    tenpu: 900
  },
  {
    key: "sample-tajifu",
    name: "タジフ",
    source: "ユーザー提供画像",
    power: 3743,
    attack: 675,
    defense: 533,
    war: 480,
    strategy: 288,
    charm: 360,
    level: 32,
    tenpu: 850
  },
  {
    key: "sample-kanou",
    name: "干央",
    source: "ユーザー提供画像",
    power: 3538,
    attack: 575,
    defense: 580,
    war: 446,
    strategy: 338,
    charm: 403,
    level: 28,
    tenpu: 800
  },
  {
    key: "sample-hyou",
    name: "漂",
    source: "ユーザー提供画像",
    power: 3528,
    attack: 456,
    defense: 591,
    war: 455,
    strategy: 513,
    charm: 532,
    level: 32,
    tenpu: 850
  },
  {
    key: "sample-doukin",
    name: "同金",
    source: "ユーザー提供画像",
    power: 3498,
    attack: 557,
    defense: 565,
    war: 475,
    strategy: 358,
    charm: 388,
    level: 32,
    tenpu: 800
  }
];
HERO_POWER_RESEARCH_SAMPLE_ROWS.unshift(
  {
    key: "sample-yotanwa",
    name: "楊端和",
    source: "ユーザー画像 / 2026-03-24 同時刻",
    investmentSource: "same-time-images",
    power: 3127,
    attack: 450,
    defense: 529,
    war: 424,
    strategy: 360,
    charm: 442,
    level: 33,
    tenpu: 900,
    starBonuses: {
      attack: 291,
      defense: 294,
      war: 285,
      strategy: 242,
      charm: 297
    },
    nextStarBonuses: {
      attack: 58,
      defense: 59,
      war: 57,
      strategy: 48,
      charm: 59
    },
    rendanSkill: "枢機",
    rendanBonuses: {
      attack: 17,
      defense: 67,
      war: 0,
      strategy: 0,
      charm: 0
    },
    nextRendanBonuses: {
      attack: 16,
      defense: 16,
      war: 16,
      strategy: 14,
      charm: 17
    }
  },
  {
    key: "sample-shunmen",
    name: "シュンメン",
    source: "ユーザー画像 / 2026-03-24 同時刻",
    investmentSource: "same-time-images",
    power: 3172,
    attack: 561,
    defense: 417,
    war: 435,
    strategy: 338,
    charm: 405,
    level: 33,
    tenpu: 850,
    starBonuses: {
      attack: 352,
      defense: 276,
      war: 288,
      strategy: 224,
      charm: 268
    },
    starStatus: "max",
    rendanSkill: "攻陣",
    rendanBonuses: {
      attack: 30,
      defense: 0,
      war: 0,
      strategy: 0,
      charm: 0
    },
    nextRendanBonuses: {
      attack: 15,
      defense: 12,
      war: 13,
      strategy: 10,
      charm: 12
    }
  },
  {
    key: "sample-genpou",
    name: "玄峰",
    source: "ユーザー画像 / 2026-03-24 同時刻",
    investmentSource: "same-time-images",
    power: 3121,
    attack: 322,
    defense: 404,
    war: 473,
    strategy: 526,
    charm: 305,
    level: 33,
    tenpu: 800,
    starBonuses: {
      attack: 212,
      defense: 266,
      war: 311,
      strategy: 326,
      charm: 201
    },
    starStatus: "max",
    rendanSkill: "栄兵",
    rendanBonuses: {
      attack: 0,
      defense: 0,
      war: 0,
      strategy: 30,
      charm: 0
    },
    nextRendanBonuses: {
      attack: 10,
      defense: 12,
      war: 14,
      strategy: 15,
      charm: 9
    }
  },
  {
    key: "sample-shoukaku",
    name: "尚鹿",
    source: "ユーザー画像 / 2026-03-24 同時刻",
    investmentSource: "same-time-images",
    power: 2512,
    attack: 393,
    defense: 376,
    war: 382,
    strategy: 323,
    charm: 409,
    level: 18,
    tenpu: 800,
    starBonuses: {
      attack: 281,
      defense: 269,
      war: 273,
      strategy: 231,
      charm: 292
    },
    starStatus: "max",
    rendanSkill: "奮戦",
    rendanBonuses: {
      attack: 0,
      defense: 0,
      war: 0,
      strategy: 0,
      charm: 0
    },
    nextRendanBonuses: {
      attack: 13,
      defense: 12,
      war: 13,
      strategy: 11,
      charm: 13
    }
  },
  {
    key: "sample-bajio",
    name: "バジオウ",
    source: "ユーザー画像 / 2026-03-24 同時刻",
    investmentSource: "same-time-images",
    power: 2653,
    attack: 442,
    defense: 398,
    war: 382,
    strategy: 249,
    charm: 390,
    level: 27,
    tenpu: 900,
    starBonuses: {
      attack: 282,
      defense: 267,
      war: 261,
      strategy: 153,
      charm: 257
    },
    nextStarBonuses: {
      attack: 56,
      defense: 54,
      war: 53,
      strategy: 31,
      charm: 51
    },
    rendanSkill: "扶助",
    rendanBonuses: {
      attack: 0,
      defense: 0,
      war: 0,
      strategy: 0,
      charm: 0
    },
    nextRendanBonuses: {
      attack: 16,
      defense: 15,
      war: 15,
      strategy: 9,
      charm: 15
    }
  }
);
const HERO_POWER_RESEARCH_DETAILED_ROWS = HERO_POWER_RESEARCH_SAMPLE_ROWS.filter(
  (row) => row?.investmentSource === "same-time-images"
);
const HERO_POWER_RESEARCH_PRESET_DEFS = [
  { key: "custom", label: "手入力" },
  ...HERO_POWER_RESEARCH_SAMPLE_ROWS.map((row) => ({
    key: row.key,
    label: `${row.name} / Lv${row.level} / 天賦${row.tenpu}`
  }))
];
const HERO_POWER_RESEARCH_DEFAULTS = {
  attack: HERO_POWER_RESEARCH_SAMPLE_ROWS[0]?.attack ?? 700,
  defense: HERO_POWER_RESEARCH_SAMPLE_ROWS[0]?.defense ?? 700,
  war: HERO_POWER_RESEARCH_SAMPLE_ROWS[0]?.war ?? 600,
  strategy: HERO_POWER_RESEARCH_SAMPLE_ROWS[0]?.strategy ?? 500,
  charm: HERO_POWER_RESEARCH_SAMPLE_ROWS[0]?.charm ?? 600,
  level: HERO_POWER_RESEARCH_SAMPLE_ROWS[0]?.level ?? 32,
  tenpu: HERO_POWER_RESEARCH_SAMPLE_ROWS[0]?.tenpu ?? 850
};
const HERO_POWER_BREAKDOWN_STAT_KEYS = ["attack", "defense", "war", "strategy", "charm"];
const HERO_POWER_DELTA_FEATURE_KEYS = ["attack", "defense", "war", "strategy"];
const HERO_POWER_STAR_STEP_RATIO_ANALYSIS = (() => {
  const ratioRows = [];
  HERO_POWER_RESEARCH_DETAILED_ROWS.forEach((row) => {
    const current = row?.starBonuses ?? null;
    const next = row?.nextStarBonuses ?? null;
    if (!current || !next) {
      return;
    }

    HERO_POWER_BREAKDOWN_STAT_KEYS.forEach((statKey) => {
      const currentValue = Number(current?.[statKey] ?? 0);
      const nextValue = Number(next?.[statKey] ?? 0);
      if (currentValue > 0 && nextValue > 0) {
        ratioRows.push({
          statKey,
          ratio: nextValue / currentValue,
          roundedFromFifth: Math.round(currentValue / 5)
        });
      }
    });
  });

  if (!ratioRows.length) {
    return null;
  }

  const ratios = ratioRows.map((row) => row.ratio);
  return {
    sampleCount: ratioRows.length,
    meanRatio: averageArmyValues(ratios),
    minRatio: Math.min(...ratios),
    maxRatio: Math.max(...ratios)
  };
})();
const ARMY_IMAGE_OCR_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
const ARMY_IMAGE_OCR_LANGUAGE_CANDIDATES = ["jpn+eng", "jpn"];
const ARMY_INVESTMENT_MULTIPLIER_OVERRIDES = ARMY_POWER_BUILDER_CONFIG.investmentTierMultipliers ?? {};
const ARMY_INVESTMENT_TIER_DEFS = [
  { key: "trained", label: "仕上がり", multiplier: ARMY_INVESTMENT_MULTIPLIER_OVERRIDES.trained ?? 1 },
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
const ARMY_SHARE_TIER_CODES = {
  trained: "t",
  untrained: "n"
};
const ARMY_SHARE_TIER_KEYS = {
  ...Object.fromEntries(Object.entries(ARMY_SHARE_TIER_CODES).map(([key, value]) => [value, key])),
  u: "untrained"
};
const ARMY_SHARE_EQUIPMENT_CODES = {
  none: "n",
  matched: "m",
  mismatched: "x"
};
const ARMY_SHARE_EQUIPMENT_KEYS = Object.fromEntries(
  Object.entries(ARMY_SHARE_EQUIPMENT_CODES).map(([key, value]) => [value, key])
);
const ARMY_POWER_STAT_WEIGHTS = [1.18, 1.04, 0.9, 0.78];
const ARMY_POWER_MODE_DEFS = [
  { key: "standard", label: "標準推定" },
  { key: "observed", label: "CSV実測優先" }
];
const ARMY_POWER_SLOT_MULTIPLIERS = {
  commander: 0.4,
  vice1: 0.2,
  vice2: 0.2,
  aide1: 0.1,
  aide2: 0.1
};
const ARMY_S3_POWER_SAMPLE_ROWS = [
  { key: "wangyi-commander", source: "video", power: 5107, soldier: 3000, attack: 220, defense: 216, war: 161, strategy: 137 },
  { key: "shin-commander", source: "video", power: 5302, soldier: 3000, attack: 237, defense: 189, war: 219, strategy: 109 },
  { key: "shin-vice1", source: "video", power: 2246, soldier: 3000, attack: 98, defense: 78, war: 91, strategy: 44 },
  { key: "shoubunkun-commander", source: "video", power: 4908, soldier: 3000, attack: 174, defense: 186, war: 188, strategy: 219 },
  { key: "shoubunkun-vice1", source: "video", power: 2118, soldier: 3000, attack: 88, defense: 94, war: 94, strategy: 110 },
  { key: "sample-16051", source: "image", power: 16051, soldier: 3690, attack: 495, defense: 530, war: 460, strategy: 545 },
  { key: "sample-25689", source: "image", power: 25689, soldier: 3090, attack: 1449, defense: 802, war: 788, strategy: 615 },
  { key: "sample-21746", source: "image", power: 21746, soldier: 3000, attack: 1306, defense: 677, war: 671, strategy: 509 },
  { key: "sample-23190", source: "image", power: 23190, soldier: 3000, attack: 1356, defense: 757, war: 784, strategy: 498 },
  { key: "sample-20699", source: "image", power: 20699, soldier: 3300, attack: 642, defense: 975, war: 625, strategy: 561 },
  { key: "sample-28268", source: "image", power: 28268, soldier: 3300, attack: 1393, defense: 812, war: 909, strategy: 818 },
  { key: "sample-23402", source: "image", power: 23402, soldier: 3090, attack: 1326, defense: 679, war: 755, strategy: 613 },
  { key: "sample-14621", source: "image", power: 14621, soldier: 3000, attack: 569, defense: 676, war: 468, strategy: 445 },
  { key: "sample-14631", source: "image", power: 14631, soldier: 3180, attack: 467, defense: 675, war: 455, strategy: 498 },
  { key: "sample-13545", source: "image", power: 13545, soldier: 3000, attack: 514, defense: 690, war: 422, strategy: 307 },
  { key: "sample-20677", source: "image", power: 20677, soldier: 3180, attack: 1074, defense: 660, war: 614, strategy: 486 },
  { key: "sample-15813", source: "image", power: 15813, soldier: 3000, attack: 922, defense: 486, war: 547, strategy: 321 },
  { key: "sample-24673", source: "image", power: 24673, soldier: 3090, attack: 1378, defense: 761, war: 766, strategy: 614 },
  { key: "sample-24098", source: "image", power: 24098, soldier: 3090, attack: 1267, defense: 751, war: 897, strategy: 659 },
  { key: "sample-21033", source: "image", power: 21033, soldier: 3000, attack: 1051, defense: 753, war: 714, strategy: 713 },
  { key: "sample-23507", source: "image", power: 23507, soldier: 3090, attack: 1270, defense: 680, war: 828, strategy: 641 },
  { key: "sample-20919", source: "image", power: 20919, soldier: 3090, attack: 1172, defense: 639, war: 705, strategy: 459 },
  { key: "sample-20208", source: "image", power: 20208, soldier: 3090, attack: 836, defense: 761, war: 904, strategy: 472 }
];
const ARMY_S3_POWER_CALC_DEFAULTS = {
  soldier: 3000,
  attack: 800,
  defense: 700,
  war: 700,
  strategy: 500,
  soldierBuff: 0,
  attackBuff: 0,
  defenseBuff: 0,
  warBuff: 0,
  strategyBuff: 0
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
const ARMY_SCORE_AXIS_LABELS = {
  powerCurrent: "現在戦力",
  powerPotential: "最大見込み戦力",
  burst20s: "20秒火力",
  sustain40s: "40秒継戦",
  siegeDps: "攻城DPS",
  ehp: "耐久期待値",
  controlUptime: "妨害維持",
  cleanseCoverage: "解除厚み",
  formationFit: "陣形適合",
  metaPrior: "世間採用寄り",
  roleCoverage: "役割充足",
  investmentEfficiency: "育成効率"
};
const ARMY_SCORE_AXIS_KEYS = Object.keys(ARMY_SCORE_AXIS_LABELS);
const ARMY_AXIS_WEIGHT_PRESETS = {
  balanced: {
    powerCurrent: 0.08,
    powerPotential: 0.05,
    burst20s: 0.17,
    sustain40s: 0.13,
    siegeDps: 0.02,
    ehp: 0.13,
    controlUptime: 0.14,
    cleanseCoverage: 0.08,
    formationFit: 0.08,
    metaPrior: 0.05,
    roleCoverage: 0.05,
    investmentEfficiency: 0.02
  },
  powermax: {
    powerCurrent: 0.34,
    powerPotential: 0.14,
    burst20s: 0.08,
    sustain40s: 0.06,
    siegeDps: 0.03,
    ehp: 0.06,
    controlUptime: 0.05,
    cleanseCoverage: 0.03,
    formationFit: 0.09,
    metaPrior: 0.04,
    roleCoverage: 0.05,
    investmentEfficiency: 0.03
  },
  counter: {
    powerCurrent: 0.12,
    powerPotential: 0.31,
    burst20s: 0.07,
    sustain40s: 0.07,
    siegeDps: 0.03,
    ehp: 0.08,
    controlUptime: 0.05,
    cleanseCoverage: 0.03,
    formationFit: 0.09,
    metaPrior: 0.03,
    roleCoverage: 0.06,
    investmentEfficiency: 0.06
  },
  siege: {
    powerCurrent: 0.06,
    powerPotential: 0.08,
    burst20s: 0.16,
    sustain40s: 0.07,
    siegeDps: 0.25,
    ehp: 0.06,
    controlUptime: 0.05,
    cleanseCoverage: 0.03,
    formationFit: 0.09,
    metaPrior: 0.04,
    roleCoverage: 0.07,
    investmentEfficiency: 0.04
  },
  debuff: {
    powerCurrent: 0.05,
    powerPotential: 0.05,
    burst20s: 0.15,
    sustain40s: 0.07,
    siegeDps: 0.02,
    ehp: 0.06,
    controlUptime: 0.25,
    cleanseCoverage: 0.05,
    formationFit: 0.11,
    metaPrior: 0.05,
    roleCoverage: 0.1,
    investmentEfficiency: 0.04
  },
  defense: {
    powerCurrent: 0.06,
    powerPotential: 0.05,
    burst20s: 0.05,
    sustain40s: 0.16,
    siegeDps: 0.01,
    ehp: 0.2,
    controlUptime: 0.07,
    cleanseCoverage: 0.12,
    formationFit: 0.1,
    metaPrior: 0.04,
    roleCoverage: 0.09,
    investmentEfficiency: 0.05
  },
  growth: {
    powerCurrent: 0.04,
    powerPotential: 0.18,
    burst20s: 0.08,
    sustain40s: 0.08,
    siegeDps: 0.04,
    ehp: 0.07,
    controlUptime: 0.07,
    cleanseCoverage: 0.07,
    formationFit: 0.08,
    metaPrior: 0.03,
    roleCoverage: 0.08,
    investmentEfficiency: 0.18
  },
  meta: {
    powerCurrent: 0.05,
    powerPotential: 0.05,
    burst20s: 0.12,
    sustain40s: 0.1,
    siegeDps: 0.03,
    ehp: 0.1,
    controlUptime: 0.1,
    cleanseCoverage: 0.08,
    formationFit: 0.1,
    metaPrior: 0.13,
    roleCoverage: 0.1,
    investmentEfficiency: 0.04
  }
};
const ARMY_META_PRIOR_FACTORS = {
  sourceTrust: 0.92,
  recency: 0.88,
  softCap: 0.15
};
const ARMY_OBSERVED_PROFILE_LABELS = {
  support: "支援",
  pressure: "圧力",
  frontline: "前線",
  disruptor: "妨害",
  late: "後半"
};
const ARMY_VIDEO_SKILL_PACKAGE_DEFS = [
  { key: "troop", label: "兵力", pattern: /(兵力).*(上昇|増加|アップ|プラス)|兵力プラ/u },
  { key: "burst", label: "火力", pattern: /(攻撃|会心|攻撃速度|与ダメージ|戦法威力|威力|破城).*(上昇|増加|アップ)|会心発生|攻撃速度/u },
  { key: "support", label: "支援", pattern: /(味方|自部隊|同列|縦列|横列).*(上昇|回復|付与|強化)|支援/u },
  { key: "control", label: "妨害", pattern: /(不利な状態変化|弱化|恐怖|混乱|沈黙|封印|攻撃速度低下|防御低下|通常攻撃).*(低下|停止|止)|攻撃速度低下/u },
  { key: "cleanse", label: "解除", pattern: /(弱化解除|解除|浄化|回復)/u },
  { key: "durable", label: "耐久", pattern: /(ダメージカット|被ダメージ|防御).*(上昇|低下)|耐性|反撃/u }
];
const ARMY_SEASON_FOCUS_DEFS = [{ key: "s3", label: "S3環境" }];
const ARMY_SEASON_FOCUS_RULES = {
  common: {
    label: "共通補助",
    summary: "S3の主将軸を保ったまま、seasonを問わず崩れにくい連鎖・役割・配置を補助参照します。",
    objectiveBlend: 0.54,
    slotStoredWeight: 0.72,
    formationBias: { basic: 2, kakuyoku: 1 },
    profileDelta: {
      support: [0, 0.1],
      pressure: [0, 0.1],
      frontline: [0, 0.1],
      disruptor: [0, 0.1],
      late: [0, 0.1]
    },
    axisDelta: {
      burst20s: [0, 4],
      sustain40s: [0, 4],
      controlUptime: [0, 4],
      siegeDps: [0, 4],
      cleanseCoverage: [0, 4]
    }
  },
  s2: {
    label: "S2補助",
    summary: "S3を主軸にしつつ、S2で重かった初動20秒・陣形相性・対基本陣を補助参照します。",
    objectiveBlend: 0.28,
    slotStoredWeight: 0.34,
    formationBias: { suikou: 4, houjin: 4, sakubou: 3, basic: 1, kakuyoku: 1 },
    profileDelta: {
      support: [0, 0.15],
      pressure: [0.25, 0.45],
      frontline: [0.05, 0.15],
      disruptor: [0.12, 0.28],
      late: [-0.05, 0.08]
    },
    axisDelta: {
      burst20s: [10, 16],
      sustain40s: [-2, 4],
      controlUptime: [4, 10],
      siegeDps: [4, 10],
      cleanseCoverage: [-4, 0]
    }
  },
  s3: {
    label: "S3主軸",
    summary: "主将中心で組み、支援・妨害・継戦の密度を高めるSeason 3前提の見方です。",
    objectiveBlend: 0.9,
    slotStoredWeight: 1,
    formationBias: { basic: -6, sakubou: 4, kakuyoku: 3, suikou: 1, houjin: 1 },
    profileDelta: {
      support: [0.12, 0.28],
      pressure: [0, 0.15],
      frontline: [0.05, 0.18],
      disruptor: [0.25, 0.45],
      late: [0.05, 0.15]
    },
    axisDelta: {
      burst20s: [2, 8],
      sustain40s: [6, 12],
      controlUptime: [10, 18],
      siegeDps: [-4, 4],
      cleanseCoverage: [4, 10]
    }
  }
};
const ARMY_S3_INTERNAL_REFERENCE_BY_CONCEPT = {
  balanced: {
    commonWeight: 0.18,
    s2Weight: 0.06,
    objectiveBlend: 0.88,
    slotStoredWeight: 0.97,
    summary: "S3専用です。共通土台を重めに、S2の初動20秒と陣形速度は軽く補助参照します。"
  },
  powermax: {
    commonWeight: 0.12,
    s2Weight: 0.1,
    objectiveBlend: 0.9,
    slotStoredWeight: 0.99,
    summary: "S3専用です。現在戦力と完成済み火力を主軸に、S2の初動圧も少しだけ補助参照します。"
  },
  siege: {
    commonWeight: 0.12,
    s2Weight: 0.12,
    objectiveBlend: 0.86,
    slotStoredWeight: 0.95,
    summary: "S3専用です。攻城では共通土台に加えて、S2の初動20秒と陣形速度を少し強めに補助参照します。"
  },
  counter: {
    commonWeight: 0.18,
    s2Weight: 0.08,
    objectiveBlend: 0.88,
    slotStoredWeight: 0.97,
    summary: "S3専用です。共通土台を重めにしつつ、S2の初動応酬は軽く参照します。"
  },
  debuff: {
    commonWeight: 0.17,
    s2Weight: 0.04,
    objectiveBlend: 0.92,
    slotStoredWeight: 1,
    summary: "S3専用です。妨害密度と継続支援を最重視し、S2知見は最低限だけ使います。"
  },
  opener: {
    commonWeight: 0.16,
    s2Weight: 0.12,
    objectiveBlend: 0.93,
    slotStoredWeight: 1,
    summary: "S3専用です。初動20秒の先手、支援/妨害の重なり、速い順の主導権を重視します。"
  },
  defense: {
    commonWeight: 0.2,
    s2Weight: 0.03,
    objectiveBlend: 0.9,
    slotStoredWeight: 0.99,
    summary: "S3専用です。どのseasonでも崩れにくい耐久土台を重視し、S2知見は薄く参照します。"
  },
  growth: {
    commonWeight: 0.2,
    s2Weight: 0.02,
    objectiveBlend: 0.84,
    slotStoredWeight: 0.93,
    summary: "S3専用です。将来性は共通土台重視で見て、S2知見はほぼ参考止まりにします。"
  },
  meta: {
    commonWeight: 0.16,
    s2Weight: 0.06,
    objectiveBlend: 0.9,
    slotStoredWeight: 0.98,
    summary: "S3専用です。環境適応はS3主将軸を基準に、共通土台とS2速度感を少しだけ参照します。"
  }
};
const ARMY_OBSERVED_FORMATION_FOCUS_TEXT = {
  basic: "中央を中核にして、左右へ圧力と補助を散らす並びが多めです。",
  suikou: "1st/3rd/5thで攻め筋を作り、2nd/4thの支援や妨害で道を開く並びが多めです。",
  kakuyoku: "支援2枚で前列の圧力役を支え、5thで締める並びが多めです。",
  houjin: "中央寄せの火力に支援を添え、遅め枠で押し込みを完成させる並びが多めです。",
  sakubou: "妨害3〜4枚に支援1枚を混ぜ、初動20秒で相手を止める並びが多めです。"
};
const ARMY_OBSERVED_FORMATION_SLOT_PROFILES = {
  basic: {
    first: { support: 1, pressure: 0.82, frontline: 0.92, disruptor: 0.78, late: 0.74 },
    second: { support: 1, pressure: 0.72, frontline: 0.55, disruptor: 0.7, late: 0.38 },
    third: { support: 0.78, pressure: 0.88, frontline: 0.64, disruptor: 0.82, late: 0.44 },
    fourth: { support: 0.42, pressure: 1, frontline: 0.7, disruptor: 0.62, late: 0.48 },
    fifth: { support: 0.42, pressure: 0.78, frontline: 0.88, disruptor: 0.4, late: 1 }
  },
  suikou: {
    first: { support: 0.42, pressure: 1, frontline: 0.86, disruptor: 0.58, late: 0.34 },
    second: { support: 0.62, pressure: 0.72, frontline: 0.54, disruptor: 0.96, late: 0.28 },
    third: { support: 0.36, pressure: 0.92, frontline: 0.88, disruptor: 0.42, late: 0.62 },
    fourth: { support: 0.94, pressure: 0.56, frontline: 0.46, disruptor: 0.84, late: 0.36 },
    fifth: { support: 0.34, pressure: 0.84, frontline: 0.98, disruptor: 0.4, late: 1 }
  },
  kakuyoku: {
    first: { support: 1, pressure: 0.64, frontline: 0.58, disruptor: 0.66, late: 0.36 },
    second: { support: 0.4, pressure: 0.98, frontline: 0.88, disruptor: 0.46, late: 0.44 },
    third: { support: 0.94, pressure: 0.72, frontline: 0.56, disruptor: 0.7, late: 0.42 },
    fourth: { support: 0.34, pressure: 0.94, frontline: 0.86, disruptor: 0.48, late: 0.56 },
    fifth: { support: 0.28, pressure: 0.82, frontline: 0.92, disruptor: 0.32, late: 1 }
  },
  houjin: {
    first: { support: 0.74, pressure: 0.78, frontline: 0.52, disruptor: 0.62, late: 0.42 },
    second: { support: 0.88, pressure: 0.72, frontline: 0.46, disruptor: 0.68, late: 0.5 },
    third: { support: 0.52, pressure: 1, frontline: 0.78, disruptor: 0.42, late: 0.62 },
    fourth: { support: 0.44, pressure: 0.86, frontline: 0.64, disruptor: 0.48, late: 0.88 },
    fifth: { support: 0.58, pressure: 0.74, frontline: 0.58, disruptor: 0.56, late: 0.98 }
  },
  sakubou: {
    first: { support: 0.36, pressure: 0.72, frontline: 0.44, disruptor: 1, late: 0.38 },
    second: { support: 0.44, pressure: 0.64, frontline: 0.42, disruptor: 0.94, late: 0.4 },
    third: { support: 1, pressure: 0.48, frontline: 0.38, disruptor: 0.66, late: 0.5 },
    fourth: { support: 0.34, pressure: 0.54, frontline: 0.38, disruptor: 0.94, late: 0.44 },
    fifth: { support: 0.42, pressure: 0.56, frontline: 0.38, disruptor: 0.92, late: 0.52 }
  }
};
const ARMY_OBSERVED_PATTERN_TARGETS = {
  generic: {
    support: [0.8, 2],
    pressure: [2, 3.8],
    frontline: [0.7, 1.9],
    disruptor: [0.3, 1.6],
    late: [0.8, 2.2]
  },
  basic: {
    support: [1, 2],
    pressure: [2.4, 4.1],
    frontline: [0.9, 2],
    disruptor: [0.2, 1.5],
    late: [0.9, 2.2]
  },
  suikou: {
    support: [0.5, 1.3],
    pressure: [2.5, 4.2],
    frontline: [1, 2.2],
    disruptor: [0.3, 1.5],
    late: [0.8, 1.9]
  },
  kakuyoku: {
    support: [1.4, 2.5],
    pressure: [1.8, 3.5],
    frontline: [0.8, 2],
    disruptor: [0.2, 1.2],
    late: [0.9, 2.2]
  },
  houjin: {
    support: [0.8, 1.8],
    pressure: [1.8, 3.4],
    frontline: [0.5, 1.4],
    disruptor: [0.2, 1.3],
    late: [0.9, 2.2]
  },
  sakubou: {
    support: [0.6, 1.5],
    pressure: [0.8, 2.4],
    frontline: [0.2, 1],
    disruptor: [1.7, 3.6],
    late: [0.4, 1.4]
  }
};
const ARMY_COMMUNITY_FORMATION_GUIDES = {
  generic: {
    focusText: "主将軸と役割代用を優先し、陣形を無理に押し込んでいないかを見ます。",
    sourceText: "GameWith優先 / 主将基準 / 役割代用 / 陣形は成立する時だけ使う",
    fallbackFormationKey: "basic",
    profileTargets: {
      support: [0.8, 1.9],
      pressure: [1.8, 3.6],
      frontline: [0.7, 1.8],
      disruptor: [0.2, 1.4],
      late: [0.8, 2.1]
    },
    axisTargets: {
      burst20s: [46, 82],
      sustain40s: [46, 82],
      controlUptime: [36, 74],
      siegeDps: [24, 78],
      cleanseCoverage: [0, 40]
    }
  },
  basic: {
    focusText: "基本陣は迷った時の基準。主将と役割が自然に噛み合う時を優先します。",
    sourceText: "GameWithの基本陣=バランス型を基準に、主将起点の自然さを重視",
    fallbackFormationKey: "basic",
    profileTargets: {
      support: [0.9, 2.1],
      pressure: [2.0, 3.7],
      frontline: [0.8, 1.9],
      disruptor: [0.3, 1.5],
      late: [0.9, 2.2]
    },
    axisTargets: {
      burst20s: [48, 80],
      sustain40s: [48, 84],
      controlUptime: [40, 72],
      siegeDps: [28, 72],
      cleanseCoverage: [4, 42]
    }
  },
  suikou: {
    focusText: "錐行陣は1st/3rd/5thの攻め筋に、2nd/4thの支援や妨害で橋を掛けられる時だけ自然です。",
    sourceText: "GameWithの通常攻撃火力特化と、実例画像の攻め3枚+橋渡しパターンを反映",
    fallbackFormationKey: "basic",
    profileTargets: {
      support: [0.5, 1.3],
      pressure: [2.5, 4.2],
      frontline: [1.0, 2.2],
      disruptor: [0.3, 1.5],
      late: [0.8, 1.9]
    },
    axisTargets: {
      burst20s: [58, 100],
      sustain40s: [36, 70],
      controlUptime: [26, 60],
      siegeDps: [48, 100],
      cleanseCoverage: [0, 26]
    }
  },
  kakuyoku: {
    focusText: "鶴翼陣は支援2枚で前列の圧力役を支え、5thで締める形を優先して見ます。",
    sourceText: "GameWithの耐久特化と、実例画像の支援2枚+前圧3枚パターンを反映",
    fallbackFormationKey: "basic",
    profileTargets: {
      support: [1.4, 2.5],
      pressure: [1.8, 3.5],
      frontline: [0.8, 2.0],
      disruptor: [0.2, 1.1],
      late: [0.9, 2.2]
    },
    axisTargets: {
      burst20s: [40, 78],
      sustain40s: [58, 100],
      controlUptime: [30, 66],
      siegeDps: [18, 54],
      cleanseCoverage: [12, 56]
    }
  },
  houjin: {
    focusText: "方陣は戦法火力と中核支援がある時に自然。中央の遅さを支えられる形を見ます。",
    sourceText: "GameWithの戦法火力特化と、noteの方陣=押し込み評価を反映",
    fallbackFormationKey: "basic",
    profileTargets: {
      support: [0.8, 1.8],
      pressure: [2.0, 3.5],
      frontline: [0.6, 1.5],
      disruptor: [0.2, 1.2],
      late: [0.8, 2.0]
    },
    axisTargets: {
      burst20s: [56, 96],
      sustain40s: [38, 74],
      controlUptime: [34, 72],
      siegeDps: [24, 66],
      cleanseCoverage: [0, 30]
    }
  },
  sakubou: {
    focusText: "策謀陣は妨害3〜4枚に支援1枚を添えられる時だけ強い前提で評価し、不足時は無理押しを下げます。",
    sourceText: "GameWithの策略重視と、実例画像の妨害寄せ編成を反映",
    fallbackFormationKey: "basic",
    profileTargets: {
      support: [0.6, 1.5],
      pressure: [0.8, 2.4],
      frontline: [0.2, 1.0],
      disruptor: [1.7, 3.6],
      late: [0.4, 1.5]
    },
    axisTargets: {
      burst20s: [44, 84],
      sustain40s: [36, 70],
      controlUptime: [58, 100],
      siegeDps: [18, 54],
      cleanseCoverage: [0, 28]
    }
  }
};
const ARMY_COMMUNITY_CONCEPT_FORMATION_BONUS = {
  balanced: { kakuyoku: 6, houjin: 4, sakubou: 3, suikou: 2, basic: -18 },
  powermax: { houjin: 7, kakuyoku: 4, suikou: 3, sakubou: 1, basic: -24 },
  siege: { suikou: 8, houjin: 5, kakuyoku: 2, basic: -24 },
  counter: { kakuyoku: 7, houjin: 3, sakubou: 2, basic: -18 },
  debuff: { sakubou: 9, houjin: 3, kakuyoku: 2, basic: -20 },
  defense: { kakuyoku: 8, houjin: 4, sakubou: 2, basic: -20 },
  growth: { houjin: 6, kakuyoku: 4, suikou: 2, basic: -18 },
  meta: { kakuyoku: 6, houjin: 5, sakubou: 4, suikou: 2, basic: -22 }
};
const ARMY_EXPERT_TEMPLATE_LABELS = {
  "balanced-hybrid": "汎用混成型",
  "support-engine": "支援主将型",
  "utility-net": "妨害支援型",
  "assault-shell": "突撃主将型",
  "guarded-burst": "盾付き突撃型",
  "siege-burst": "攻城混成型",
  "fortress-wall": "防衛壁型"
};
const ARMY_EXPERT_TEMPLATE_FAMILY_MAP = {
  "balanced-hybrid": "hybrid",
  "support-engine": "support",
  "utility-net": "support",
  "assault-shell": "assault",
  "guarded-burst": "assault",
  "siege-burst": "siege",
  "fortress-wall": "defense"
};
const ARMY_TIMELINE_WINDOWS = {
  burst: 20,
  sustain: 40,
  full: 60
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
const ARMY_IMPORTED_NAME_ALIAS_MAP = new Map([
  ["録鳴未", "録嗚未"],
  ["緑鳴未", "録嗚未"],
  ["ろくおみ", "録嗚未"],
  ["ひょうこう", "麃公"],
  ["きょうかい", "羌瘣"],
  ["ようたんわ", "楊端和"],
  ["えいせい", "嬴政"],
  ["かりょうてん", "河了貂"],
  ["おうき", "王騎"],
  ["とう", "騰"],
  ["しん", "信"]
]);
const ARMY_IMPORTED_CHARACTER_NAME_INDEX = buildArmyImportedCharacterNameIndex();

let lastArmyPlannerResult = null;
let activeArmyAlternativeIndex = 0;
let activeArmyUnitIndex = 0;
let activeArmyPreviewSecond = ARMY_TIMELINE_DEFAULT_SECOND;
let activeArmyPreviewGroupId = null;
let activeArmyTargetSlotKey = null;
let armyRebuildTimer = null;
let armyRosterState = loadArmyRosterState();
let armyObservedPowerState = loadArmyPowerImportState();
let armyImageImportState = createEmptyArmyImageImportState();
let armyPowerReferenceCache = null;
let armySelectedCommanderIds = [];
let armyCommanderSelectionCache = null;
let armyOcrLibraryPromise = null;
let armyOcrWorkerPromise = null;
let armyPlannerBusy = false;
let armyQuickEditCharacterId = null;
let armyRosterLongPressTimer = null;
let armyRosterLongPressConsumedId = null;
let armyCommanderPrefetchTimer = null;
let armyCommanderPrefetchKey = "";

function clampArmyScore(value) {
  return Math.max(0, Math.min(100, value));
}

function sumArmyValues(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

function averageArmyValues(values) {
  return values.length ? sumArmyValues(values) / values.length : 0;
}

function setArmyPlannerBusy(nextBusy) {
  armyPlannerBusy = Boolean(nextBusy);
  if (elements.armyFinalizeButton) {
    elements.armyFinalizeButton.disabled = armyPlannerBusy;
    elements.armyFinalizeButton.textContent = armyPlannerBusy ? "編成中..." : "副将・補佐を組む";
  }
  if (elements.armyAutoSelectCommandersButton) {
    elements.armyAutoSelectCommandersButton.disabled = armyPlannerBusy;
  }
  renderArmyPlannerFloatingUi(lastArmyPlannerResult);
}

function clearArmyCommanderPrefetchTimer() {
  if (armyCommanderPrefetchTimer) {
    window.clearTimeout(armyCommanderPrefetchTimer);
    armyCommanderPrefetchTimer = null;
  }
}

function scheduleArmyCommanderPrefetch(context = null, selectedCommanderIds = null) {
  clearArmyCommanderPrefetchTimer();
  const plannerContext = context ?? getArmyPlannerContext();
  const normalizedIds = sanitizeArmySelectedCommanderIds(
    selectedCommanderIds ?? armySelectedCommanderIds,
    plannerContext.allowedMetas
  );
  if (normalizedIds.length < 5) {
    armyCommanderPrefetchKey = "";
    return;
  }

  const cacheKey = buildArmyCommanderSelectionCacheKey(plannerContext, normalizedIds);
  if (armyCommanderPrefetchKey === cacheKey && readArmyCommanderSelectionCache(plannerContext, normalizedIds).length) {
    return;
  }

  armyCommanderPrefetchKey = cacheKey;
  const runPrefetch = () => {
    armyCommanderPrefetchTimer = null;
    const latestContext = context ?? getArmyPlannerContext();
    const latestIds = sanitizeArmySelectedCommanderIds(
      selectedCommanderIds ?? armySelectedCommanderIds,
      latestContext.allowedMetas
    );
    if (latestIds.length < 5 || armyPlannerBusy) {
      return;
    }
    if (readArmyCommanderSelectionCache(latestContext, latestIds).length) {
      return;
    }
    const selectedCommanderMetas = latestIds
      .map((characterId) => ARMY_CHARACTER_META_BY_ID.get(characterId))
      .filter(Boolean);
    if (selectedCommanderMetas.length < 5) {
      return;
    }
    buildArmiesForSelectedCommanders(
      selectedCommanderMetas,
      latestContext.allowedMetas,
      latestContext.concept,
      latestContext.seedMeta,
      latestContext.seedSlots,
      latestContext.formationChoiceKey,
      latestContext,
      latestIds
    );
  };
  armyCommanderPrefetchTimer = window.setTimeout(runPrefetch, 1200);
}

function ensureArmyPlannerFloatingUi() {
  if (!elements.armyView) {
    return null;
  }

  let shell = elements.armyView.querySelector("#armyFloatingShell");
  if (!shell) {
    shell = document.createElement("div");
    shell.id = "armyFloatingShell";
    shell.className = "army-floating-shell";
    shell.innerHTML = `
      <section class="army-quick-editor" id="armyQuickEditor" hidden></section>
      <section class="army-floating-dock" id="armyFloatingDock"></section>
    `;
    elements.armyView.appendChild(shell);
  }
  return shell;
}

function closeArmyQuickEditor() {
  armyQuickEditCharacterId = null;
  renderArmyPlannerFloatingUi(lastArmyPlannerResult);
}

function openArmyQuickEditor(characterId) {
  const numericCharacterId = Number(characterId);
  if (!Number.isFinite(numericCharacterId)) {
    return;
  }
  armyQuickEditCharacterId = numericCharacterId;
  renderArmyPlannerFloatingUi(lastArmyPlannerResult);
}

function clearArmyRosterLongPressTimer() {
  if (armyRosterLongPressTimer) {
    window.clearTimeout(armyRosterLongPressTimer);
    armyRosterLongPressTimer = null;
  }
}

function renderArmyPlannerFloatingUi(plannerResult = null) {
  const shell = ensureArmyPlannerFloatingUi();
  if (!shell) {
    return;
  }

  const dock = shell.querySelector("#armyFloatingDock");
  const quickEditor = shell.querySelector("#armyQuickEditor");
  const selectedMetas = armySelectedCommanderIds
    .map((characterId) => ARMY_CHARACTER_META_BY_ID.get(characterId))
    .filter(Boolean);
  const commanderText = selectedMetas.length
    ? selectedMetas.map((meta) => meta.character.name).join(" / ")
    : "まだ主将を選んでいません";
  const canFinalize = armySelectedCommanderIds.length >= 5 && !armyPlannerBusy;

  if (dock) {
    dock.innerHTML = `
      <div class="army-floating-dock__summary">
        <strong>主将 ${selectedMetas.length} / 5</strong>
        <span>${escapeHtml(commanderText)}</span>
        <small class="army-floating-dock__hint">武将カード長押しで個別設定</small>
      </div>
      <div class="army-floating-dock__actions">
        <button class="mini-button" type="button" data-army-dock-action="auto" ${armyPlannerBusy ? "disabled" : ""}>おすすめ5人</button>
        <button class="primary-button" type="button" data-army-dock-action="finalize" ${canFinalize ? "" : "disabled"}>${
          armyPlannerBusy ? "編成中..." : "副将・補佐を組む"
        }</button>
      </div>
    `;
  }

  if (!quickEditor) {
    return;
  }

  const character = preparedCharacters.find((entry) => entry.id === armyQuickEditCharacterId) ?? null;
  if (!character) {
    quickEditor.hidden = true;
    quickEditor.innerHTML = "";
    return;
  }

  const profile = getArmyRosterProfile(character.id);
  const isOwned = profile.owned;
  const isReady = isArmyCharacterReady(character.id);
  const isSelectedCommander = armySelectedCommanderIds.includes(character.id);
  const snapshot = getArmyCharacterPowerSnapshot(character);

  quickEditor.hidden = false;
  quickEditor.innerHTML = `
    <div class="army-quick-editor__head">
      <div>
        <strong>${escapeHtml(character.name)}</strong>
        <p>${escapeHtml(character.rarity)} / ${escapeHtml(character.type || "-")} / 天賦 ${escapeHtml(character.tenpu)}</p>
      </div>
      <button class="mini-button" type="button" data-army-quick-close="1">閉じる</button>
    </div>
    <div class="army-quick-editor__meta">
      <span class="status-pill ${isReady ? "is-live" : isOwned ? "is-next" : "is-plan"}">${escapeHtml(
        isReady ? "仕上がり" : isOwned ? "未育成" : "未登録"
      )}</span>
      <span class="status-pill is-plan">戦力目安 ${escapeHtml(formatArmyEstimateNumber(snapshot.current))}</span>
    </div>
    <div class="army-quick-editor__fields">
      <label class="field">
        <span>育成</span>
        <select data-army-profile-id="${character.id}" data-army-profile-field="investmentTier">
          ${renderArmySelectOptions(ARMY_INVESTMENT_TIER_DEFS, profile.investmentTier)}
        </select>
      </label>
      <label class="field">
        <span>装備</span>
        <select data-army-profile-id="${character.id}" data-army-profile-field="equipmentFit">
          ${renderArmySelectOptions(ARMY_EQUIPMENT_FIT_DEFS, profile.equipmentFit)}
        </select>
      </label>
    </div>
    <div class="army-quick-editor__actions">
      <button class="mini-button" type="button" data-army-quick-owned="${character.id}">${escapeHtml(
        isOwned ? "手持ちから外す" : "手持ちに入れる"
      )}</button>
      <button class="mini-button" type="button" data-army-quick-commander="${character.id}" ${
        isReady ? "" : "disabled"
      }>${escapeHtml(isSelectedCommander ? "主将から外す" : "主将に入れる")}</button>
    </div>
    <p class="field-note">カード長押しでもこの編集を開けます。主将選択や育成段階の調整を、下まで移動せずに行えます。</p>
  `;
}

function normalizeArmyWeightMap(weightMap = {}, fallback = {}) {
  const merged = { ...fallback, ...weightMap };
  const total = Math.max(sumArmyValues(Object.values(merged)), 1);
  return Object.fromEntries(Object.entries(merged).map(([key, value]) => [key, value / total]));
}

function getArmyAxisWeights(concept) {
  return normalizeArmyWeightMap(
    concept?.axisWeights ?? ARMY_AXIS_WEIGHT_PRESETS[concept?.key] ?? ARMY_AXIS_WEIGHT_PRESETS.balanced,
    ARMY_AXIS_WEIGHT_PRESETS.balanced
  );
}

function scoreArmyAxes(scoreAxes = {}, weightMap = {}) {
  return clampArmyScore(
    Object.entries(weightMap).reduce((sum, [axisKey, weight]) => {
      return sum + (scoreAxes[axisKey] ?? 0) * weight;
    }, 0)
  );
}

function formatArmyAxisText(scoreAxes = {}, concept, limit = 4) {
  const weightMap = getArmyAxisWeights(concept);
  return Object.entries(weightMap)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([axisKey]) => `${ARMY_SCORE_AXIS_LABELS[axisKey] ?? axisKey} ${(scoreAxes[axisKey] ?? 0).toFixed(1)}`)
    .join(" / ");
}

function getArmyTopAxisEntries(scoreAxes = {}, concept, limit = 4) {
  const weightMap = getArmyAxisWeights(concept);
  return Object.entries(weightMap)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([axisKey, weight]) => ({
      key: axisKey,
      label: ARMY_SCORE_AXIS_LABELS[axisKey] ?? axisKey,
      weight,
      value: scoreAxes[axisKey] ?? 0
    }));
}

function sanitizeArmyTierKey(value, definitions, fallback) {
  if (
    value === "usable" &&
    definitions === ARMY_INVESTMENT_TIER_DEFS &&
    !definitions.some((entry) => entry.key === "usable")
  ) {
    return "untrained";
  }
  return definitions.some((entry) => entry.key === value) ? value : fallback;
}

function sanitizeArmyPowerMode(value) {
  return ARMY_POWER_MODE_DEFS.some((entry) => entry.key === value) ? value : "standard";
}

function sanitizeArmySeasonFocusKey(value) {
  return ARMY_SEASON_FOCUS_DEFS.some((entry) => entry.key === value) ? value : "s3";
}

function getArmySelectedSeasonFocusKey() {
  return "s3";
}

function getArmySeasonFocusConceptKey(concept = null) {
  if (typeof concept === "string" && concept) {
    return concept;
  }
  if (concept?.key) {
    return concept.key;
  }
  return elements.armyConcept?.value ?? "balanced";
}

function blendArmySeasonFocusValue(primaryValue = 0, referenceValue = 0, referenceWeight = 0) {
  const safeWeight = Math.min(Math.max(Number(referenceWeight) || 0, 0), 0.45);
  return primaryValue * (1 - safeWeight) + referenceValue * safeWeight;
}

function blendArmySeasonFocusRange(primaryRange = [0, 0], referenceRange = [0, 0], referenceWeight = 0) {
  return [
    blendArmySeasonFocusValue(primaryRange[0] ?? 0, referenceRange[0] ?? 0, referenceWeight),
    blendArmySeasonFocusValue(primaryRange[1] ?? 0, referenceRange[1] ?? 0, referenceWeight)
  ];
}

function normalizeArmySeasonReferenceMix(referenceMix = {}) {
  const entries = Object.entries(referenceMix)
    .map(([key, weight]) => [key, Math.min(Math.max(Number(weight) || 0, 0), 0.25)])
    .filter(([key, weight]) => weight > 0 && key !== "s3" && ARMY_SEASON_FOCUS_RULES[key]);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  if (total <= 0.45) {
    return entries;
  }
  const scale = 0.45 / total;
  return entries.map(([key, weight]) => [key, weight * scale]);
}

function blendArmySeasonFocusMixValue(primaryValue = 0, referenceEntries = []) {
  const totalWeight = referenceEntries.reduce((sum, [, weight]) => sum + weight, 0);
  return referenceEntries.reduce(
    (sum, [value, weight]) => sum + value * weight,
    primaryValue * Math.max(0, 1 - totalWeight)
  );
}

function blendArmySeasonFocusMixRange(primaryRange = [0, 0], referenceEntries = []) {
  return [
    blendArmySeasonFocusMixValue(
      primaryRange[0] ?? 0,
      referenceEntries.map(([range, weight]) => [range?.[0] ?? 0, weight])
    ),
    blendArmySeasonFocusMixValue(
      primaryRange[1] ?? 0,
      referenceEntries.map(([range, weight]) => [range?.[1] ?? 0, weight])
    )
  ];
}

function buildArmySeasonFocusConfig(primaryKey = "s3", referenceKey = null, referenceWeight = 0, overrides = {}) {
  const primary = ARMY_SEASON_FOCUS_RULES[primaryKey] ?? ARMY_SEASON_FOCUS_RULES.s3;
  const reference = referenceKey ? ARMY_SEASON_FOCUS_RULES[referenceKey] ?? primary : primary;
  const safeWeight = Math.min(Math.max(Number(referenceWeight) || 0, 0), 0.45);

  if (!referenceKey || referenceKey === primaryKey || safeWeight <= 0) {
    return {
      ...primary,
      key: overrides.key ?? primaryKey,
      baseKey: primaryKey,
      referenceKey: null,
      referenceWeight: 0,
      mode: overrides.mode ?? "primary"
    };
  }

  const formationBias = {};
  new Set([...Object.keys(primary.formationBias ?? {}), ...Object.keys(reference.formationBias ?? {})]).forEach((key) => {
    formationBias[key] = blendArmySeasonFocusValue(primary.formationBias?.[key] ?? 0, reference.formationBias?.[key] ?? 0, safeWeight);
  });

  const profileDelta = {};
  new Set([...Object.keys(primary.profileDelta ?? {}), ...Object.keys(reference.profileDelta ?? {})]).forEach((key) => {
    profileDelta[key] = blendArmySeasonFocusRange(primary.profileDelta?.[key] ?? [0, 0], reference.profileDelta?.[key] ?? [0, 0], safeWeight);
  });

  const axisDelta = {};
  new Set([...Object.keys(primary.axisDelta ?? {}), ...Object.keys(reference.axisDelta ?? {})]).forEach((key) => {
    axisDelta[key] = blendArmySeasonFocusRange(primary.axisDelta?.[key] ?? [0, 0], reference.axisDelta?.[key] ?? [0, 0], safeWeight);
  });

  return {
    ...primary,
    key: overrides.key ?? referenceKey,
    baseKey: primaryKey,
    referenceKey,
    referenceWeight: safeWeight,
    mode: overrides.mode ?? "reference",
    label: overrides.label ?? primary.label,
    summary: overrides.summary ?? primary.summary,
    objectiveBlend: blendArmySeasonFocusValue(primary.objectiveBlend ?? 0, reference.objectiveBlend ?? 0, safeWeight),
    slotStoredWeight: blendArmySeasonFocusValue(primary.slotStoredWeight ?? 0, reference.slotStoredWeight ?? 0, safeWeight),
    formationBias,
    profileDelta,
    axisDelta
  };
}

function buildArmySeasonFocusConfigFromMix(primaryKey = "s3", referenceMix = {}, overrides = {}) {
  const primary = ARMY_SEASON_FOCUS_RULES[primaryKey] ?? ARMY_SEASON_FOCUS_RULES.s3;
  const normalizedMix = normalizeArmySeasonReferenceMix(referenceMix);
  const referenceRules = normalizedMix.map(([key, weight]) => [ARMY_SEASON_FOCUS_RULES[key] ?? primary, weight]);
  const referenceMixMap = Object.fromEntries(normalizedMix);
  const totalReferenceWeight = normalizedMix.reduce((sum, [, weight]) => sum + weight, 0);
  const formationBias = {};
  const profileDelta = {};
  const axisDelta = {};
  const formationKeys = new Set([
    ...Object.keys(primary.formationBias ?? {}),
    ...referenceRules.flatMap(([rule]) => Object.keys(rule.formationBias ?? {}))
  ]);
  const profileKeys = new Set([
    ...Object.keys(primary.profileDelta ?? {}),
    ...referenceRules.flatMap(([rule]) => Object.keys(rule.profileDelta ?? {}))
  ]);
  const axisKeys = new Set([
    ...Object.keys(primary.axisDelta ?? {}),
    ...referenceRules.flatMap(([rule]) => Object.keys(rule.axisDelta ?? {}))
  ]);

  formationKeys.forEach((key) => {
    formationBias[key] = blendArmySeasonFocusMixValue(
      primary.formationBias?.[key] ?? 0,
      referenceRules.map(([rule, weight]) => [rule.formationBias?.[key] ?? 0, weight])
    );
  });
  profileKeys.forEach((key) => {
    profileDelta[key] = blendArmySeasonFocusMixRange(
      primary.profileDelta?.[key] ?? [0, 0],
      referenceRules.map(([rule, weight]) => [rule.profileDelta?.[key] ?? [0, 0], weight])
    );
  });
  axisKeys.forEach((key) => {
    axisDelta[key] = blendArmySeasonFocusMixRange(
      primary.axisDelta?.[key] ?? [0, 0],
      referenceRules.map(([rule, weight]) => [rule.axisDelta?.[key] ?? [0, 0], weight])
    );
  });

  return {
    ...primary,
    key: overrides.key ?? "s3",
    baseKey: primaryKey,
    referenceKey: null,
    referenceWeight: totalReferenceWeight,
    referenceMix: referenceMixMap,
    mode: overrides.mode ?? "s3-fixed",
      label: overrides.label ?? "S3環境",
    summary: overrides.summary ?? primary.summary,
    objectiveBlend:
      overrides.objectiveBlend ??
      blendArmySeasonFocusMixValue(
        primary.objectiveBlend ?? 0,
        referenceRules.map(([rule, weight]) => [rule.objectiveBlend ?? 0, weight])
      ),
    slotStoredWeight:
      overrides.slotStoredWeight ??
      blendArmySeasonFocusMixValue(
        primary.slotStoredWeight ?? 1,
        referenceRules.map(([rule, weight]) => [rule.slotStoredWeight ?? 1, weight])
      ),
    formationBias,
    profileDelta,
    axisDelta
  };
}

function getArmyS3InternalReferencePreset(concept = null) {
  const conceptKey = getArmySeasonFocusConceptKey(concept);
  return ARMY_S3_INTERNAL_REFERENCE_BY_CONCEPT[conceptKey] ?? ARMY_S3_INTERNAL_REFERENCE_BY_CONCEPT.balanced;
}

function getArmySeasonFocusConfig(seasonFocusKey = getArmySelectedSeasonFocusKey(), concept = null) {
  const preset = getArmyS3InternalReferencePreset(concept);
  return buildArmySeasonFocusConfigFromMix(
    "s3",
    {
      common: preset.commonWeight,
      s2: preset.s2Weight
    },
    {
      key: "s3",
      label: "S3専用",
      summary: preset.summary,
      objectiveBlend: preset.objectiveBlend,
      slotStoredWeight: preset.slotStoredWeight,
      mode: "s3-fixed"
    }
  );
}

function invalidateArmyPowerCaches() {
  armyPowerReferenceCache = null;
}

function buildArmyImportedCharacterNameIndex() {
  const index = new Map();
  preparedCharacters.forEach((character) => {
    const normalized = normalizeArmyImportedName(character.name);
    if (!normalized) {
      return;
    }

    const bucket = index.get(normalized) ?? [];
    bucket.push(character);
    index.set(normalized, bucket);
  });
  return index;
}

function normalizeArmyImportedName(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ 　・,、。．.=＝+＋/／'"`’‘“”()（）[\]【】]/gu, "")
    .trim();
}

function buildArmyNameBigrams(value) {
  const text = normalizeArmyImportedName(value);
  if (!text) {
    return [];
  }

  if (text.length <= 1) {
    return [text];
  }

  const grams = [];
  for (let index = 0; index < text.length - 1; index += 1) {
    grams.push(text.slice(index, index + 2));
  }
  return grams;
}

function scoreArmyNameSimilarity(left, right) {
  const leftGrams = buildArmyNameBigrams(left);
  const rightGrams = buildArmyNameBigrams(right);
  if (!leftGrams.length || !rightGrams.length) {
    return 0;
  }

  const rightSet = new Set(rightGrams);
  let overlap = 0;
  leftGrams.forEach((gram) => {
    if (rightSet.has(gram)) {
      overlap += 1;
    }
  });

  return overlap / Math.max(leftGrams.length, rightGrams.length);
}

function resolveArmyImportedCharacter(name) {
  const normalized = normalizeArmyImportedName(name);
  if (!normalized) {
    return null;
  }

  const directHit = ARMY_IMPORTED_CHARACTER_NAME_INDEX.get(normalized);
  if (directHit?.length === 1) {
    return directHit[0];
  }

  const aliasTarget = ARMY_IMPORTED_NAME_ALIAS_MAP.get(normalized) ?? ARMY_IMPORTED_NAME_ALIAS_MAP.get(name);
  if (aliasTarget) {
    const aliasHit = ARMY_IMPORTED_CHARACTER_NAME_INDEX.get(normalizeArmyImportedName(aliasTarget));
    if (aliasHit?.length) {
      return aliasHit[0];
    }
  }

  let best = null;
  ARMY_IMPORTED_CHARACTER_NAME_INDEX.forEach((characters, candidateName) => {
    const score = scoreArmyNameSimilarity(normalized, candidateName);
    if (score < 0.5) {
      return;
    }

    const candidate = characters[0];
    const firstMatches = normalized[0] === candidateName[0];
    const lastMatches = normalized.at(-1) === candidateName.at(-1);
    if (!firstMatches || !lastMatches) {
      return;
    }

    if (!best || score > best.score) {
      best = { candidate, score };
    }
  });

  return best?.candidate ?? null;
}

function createEmptyArmyImageImportFields() {
  return {
    name: "",
    power: null,
    attack: null,
    defense: null,
    war: null,
    strategy: null,
    charm: null,
    level: null,
    tenpu: null,
    secret: 0
  };
}

function createEmptyArmyImageImportState() {
  return {
    file: null,
    fileName: "",
    previewUrl: "",
    busy: false,
    status: "まだ画像は選択されていません。",
    error: "",
    rawText: "",
    confidence: null,
    parsed: null,
    suggestions: []
  };
}

function revokeArmyImageImportPreviewUrl() {
  if (!armyImageImportState.previewUrl) {
    return;
  }
  URL.revokeObjectURL(armyImageImportState.previewUrl);
  armyImageImportState.previewUrl = "";
}

function clearArmyImageImportState() {
  revokeArmyImageImportPreviewUrl();
  armyImageImportState = createEmptyArmyImageImportState();
}

function extractArmyOcrNumbers(text) {
  return Array.from(String(text ?? "").matchAll(/\d[\d,]*/gu), (match) => parseArmyImportNumber(match[0])).filter(
    (value) => value != null
  );
}

function escapeArmyRegExp(value) {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildArmyOcrNameFragments(text) {
  const lines = String(text ?? "")
    .split(/\r?\n/gu)
    .map((line) => normalizeArmyImportedName(line).replace(/\d+/gu, ""))
    .filter(Boolean);
  const fragments = new Set();
  lines.forEach((line) => {
    const tokens = line.split(/[ 　/／|｜:：]+/gu).filter(Boolean);
    if (!tokens.length) {
      tokens.push(line);
    }
    tokens.forEach((token) => {
      if (!token || token.length > 8) {
        return;
      }
      if (/(戦力|攻撃|防御|戦威|策略|魅力|天賦|秘伝|lv|レベル)/iu.test(token)) {
        return;
      }
      fragments.add(token);
    });
  });
  return [...fragments];
}

function buildArmyOcrCharacterSuggestions(text, limit = 5) {
  const normalizedText = normalizeArmyImportedName(text);
  if (!normalizedText) {
    return [];
  }

  const suggestions = [];
  const seen = new Set();

  preparedCharacters
    .slice()
    .sort((left, right) => right.name.length - left.name.length)
    .forEach((character) => {
      const normalizedName = normalizeArmyImportedName(character.name);
      if (normalizedName && normalizedText.includes(normalizedName) && !seen.has(character.name)) {
        suggestions.push({ character, score: 1.5 });
        seen.add(character.name);
      }
    });

  const fragments = buildArmyOcrNameFragments(text);
  fragments.forEach((fragment) => {
    preparedCharacters.forEach((character) => {
      if (seen.has(character.name)) {
        return;
      }
      const score = scoreArmyNameSimilarity(fragment, character.name);
      if (score < 0.45) {
        return;
      }
      suggestions.push({ character, score });
      seen.add(character.name);
    });
  });

  return suggestions
    .sort((left, right) => right.score - left.score || left.character.name.length - right.character.name.length)
    .slice(0, limit);
}

function detectArmyOcrCharacter(text) {
  const suggestions = buildArmyOcrCharacterSuggestions(text, 5);
  const best = suggestions[0] ?? null;
  const matchedCharacter = best && best.score >= 0.68 ? best.character : null;
  return {
    character: matchedCharacter,
    suggestions: suggestions.map((entry) => entry.character.name)
  };
}

function extractArmyOcrNumber(text, labels, options = {}) {
  const labelPatterns = Array.isArray(labels) ? labels : [labels];
  const escaped = labelPatterns.map(escapeArmyRegExp).join("|");
  const minDigits = options.minDigits ?? 1;
  const candidates = [];
  const patterns = [
    new RegExp(`(?:${escaped})[^\\d]{0,10}\\+?([\\d,]{${minDigits},})`, "iu"),
    new RegExp(`(?:${escaped})\\s*[:：/／|｜]?\\s*([\\d,]{${minDigits},})`, "iu")
  ];
  patterns.forEach((pattern) => {
    const match = pattern.exec(text);
    if (match?.[1]) {
      const parsed = parseArmyImportNumber(match[1]);
      if (parsed != null) {
        candidates.push(parsed);
      }
    }
  });
  return candidates[0] ?? null;
}

function parseArmyImageOcrText(rawText, confidence = null) {
  const normalizedText = String(rawText ?? "")
    .normalize("NFKC")
    .replace(/\u3000/gu, " ")
    .replace(/[“”]/gu, '"');
  const fields = createEmptyArmyImageImportFields();
  const nameDetection = detectArmyOcrCharacter(normalizedText);
  fields.name = nameDetection.character?.name ?? "";
  fields.power = extractArmyOcrNumber(normalizedText, ["戦力", "戦闘力"], { minDigits: 3 });
  fields.attack = extractArmyOcrNumber(normalizedText, ["攻撃"], { minDigits: 2 });
  fields.defense = extractArmyOcrNumber(normalizedText, ["防御"], { minDigits: 2 });
  fields.war = extractArmyOcrNumber(normalizedText, ["戦威"], { minDigits: 2 });
  fields.strategy = extractArmyOcrNumber(normalizedText, ["策略"], { minDigits: 2 });
  fields.charm = extractArmyOcrNumber(normalizedText, ["魅力"], { minDigits: 2 });
  fields.level = extractArmyOcrNumber(normalizedText, ["Lv", "レベル"], { minDigits: 1 });
  fields.tenpu = extractArmyOcrNumber(normalizedText, ["天賦"], { minDigits: 2 });
  fields.secret = extractArmyOcrNumber(normalizedText, ["秘伝"], { minDigits: 1 }) ?? 0;
  const readyCount = ARMY_IMAGE_IMPORT_REQUIRED_FIELDS.filter((key) => fields[key] !== null && fields[key] !== "").length;
  return {
    fields,
    confidence,
    suggestions: nameDetection.suggestions,
    readyCount
  };
}

function countArmyImageImportReadyFields(parsed = null) {
  return ARMY_IMAGE_IMPORT_REQUIRED_FIELDS.filter((key) => parsed?.fields?.[key] != null && parsed?.fields?.[key] !== "").length;
}

function canApplyArmyImageImport() {
  return countArmyImageImportReadyFields(armyImageImportState.parsed) === ARMY_IMAGE_IMPORT_REQUIRED_FIELDS.length;
}

function setArmyImageImportFile(file) {
  revokeArmyImageImportPreviewUrl();
  armyImageImportState.file = file ?? null;
  armyImageImportState.fileName = file?.name ?? "";
  armyImageImportState.previewUrl = file ? URL.createObjectURL(file) : "";
  armyImageImportState.busy = false;
  armyImageImportState.error = "";
  armyImageImportState.rawText = "";
  armyImageImportState.confidence = null;
  armyImageImportState.parsed = null;
  armyImageImportState.suggestions = [];
  armyImageImportState.status = file
    ? `${file.name} を選択しました。画像を解析するとOCR結果を確認できます。`
    : "まだ画像は選択されていません。";
}

function updateArmyImageImportField(key, value) {
  if (!armyImageImportState.parsed?.fields || !Object.prototype.hasOwnProperty.call(armyImageImportState.parsed.fields, key)) {
    return;
  }
  const fieldDef = ARMY_IMAGE_IMPORT_FIELD_DEFS.find((entry) => entry.key === key);
  armyImageImportState.parsed.fields[key] =
    fieldDef?.type === "number" ? parseArmyImportNumber(value) : String(value ?? "").trim();
  renderArmyImageImportUi();
}

function escapeArmyCsvCell(value) {
  const text = String(value ?? "");
  if (!/[",\r\n]/u.test(text)) {
    return text;
  }
  return `"${text.replace(/"/gu, '""')}"`;
}

function buildArmyObservedPowerCsvText(rowsById = {}) {
  const rows = Object.values(rowsById)
    .filter((row) => row?.name)
    .sort((left, right) => String(left.name).localeCompare(String(right.name), "ja"));
  const lines = [ARMY_IMAGE_IMPORT_HEADERS.join(",")];
  rows.forEach((row) => {
    const values = [
      row.name,
      row.power,
      row.attack,
      row.defense,
      row.war,
      row.strategy,
      row.charm,
      row.level,
      row.tenpu,
      row.secret
    ];
    lines.push(values.map(escapeArmyCsvCell).join(","));
  });
  return lines.join("\n");
}

async function loadArmyOcrLibrary() {
  if (window.Tesseract) {
    return window.Tesseract;
  }
  if (!armyOcrLibraryPromise) {
    armyOcrLibraryPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = ARMY_IMAGE_OCR_SCRIPT_URL;
      script.async = true;
      script.onload = () => {
        if (window.Tesseract) {
          resolve(window.Tesseract);
          return;
        }
        reject(new Error("army-ocr-library-unavailable"));
      };
      script.onerror = () => reject(new Error("army-ocr-library-load-failed"));
      document.head.appendChild(script);
    }).catch((error) => {
      armyOcrLibraryPromise = null;
      throw error;
    });
  }
  return armyOcrLibraryPromise;
}

async function getArmyOcrWorker() {
  if (!armyOcrWorkerPromise) {
    armyOcrWorkerPromise = (async () => {
      const tesseract = await loadArmyOcrLibrary();
      let lastError = null;
      for (const language of ARMY_IMAGE_OCR_LANGUAGE_CANDIDATES) {
        try {
          return await tesseract.createWorker(language);
        } catch (error) {
          lastError = error;
        }
      }
      throw lastError ?? new Error("army-ocr-worker-init-failed");
    })().catch((error) => {
      armyOcrWorkerPromise = null;
      throw error;
    });
  }
  return armyOcrWorkerPromise;
}

function readArmyImageFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("army-ocr-file-read-failed"));
    reader.readAsDataURL(file);
  });
}

function loadArmyImageElement(sourceUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("army-ocr-image-load-failed"));
    image.src = sourceUrl;
  });
}

async function preprocessArmyOcrImage(file) {
  const sourceUrl = await readArmyImageFileAsDataUrl(file);
  const image = await loadArmyImageElement(sourceUrl);
  const scale = Math.min(1, 1800 / Math.max(image.width, image.height, 1));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("army-ocr-canvas-unavailable");
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let index = 0; index < data.length; index += 4) {
    const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    const boosted = Math.max(0, Math.min(255, (gray - 128) * 1.55 + 128));
    const output = boosted > 188 ? 255 : boosted < 76 ? 0 : Math.round(boosted);
    data[index] = output;
    data[index + 1] = output;
    data[index + 2] = output;
  }
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

async function runArmyImageOcr() {
  if (!armyImageImportState.file) {
    throw new Error("army-ocr-file-missing");
  }
  armyImageImportState.busy = true;
  armyImageImportState.error = "";
  armyImageImportState.status = "画像を解析しています。初回はOCR辞書の読み込みで少し時間がかかります。";
  renderArmyImageImportUi();

  try {
    const worker = await getArmyOcrWorker();
    const processedSource = await preprocessArmyOcrImage(armyImageImportState.file);
    const processedResult = await worker.recognize(processedSource);
    let bestResult = {
      text: String(processedResult?.data?.text || ""),
      confidence: Number(processedResult?.data?.confidence || 0)
    };
    let parsed = parseArmyImageOcrText(bestResult.text, bestResult.confidence);

    if (parsed.readyCount < 4 && armyImageImportState.previewUrl) {
      const rawResult = await worker.recognize(armyImageImportState.previewUrl);
      const rawCandidate = {
        text: String(rawResult?.data?.text || ""),
        confidence: Number(rawResult?.data?.confidence || 0)
      };
      const rawParsed = parseArmyImageOcrText(rawCandidate.text, rawCandidate.confidence);
      if (rawParsed.readyCount > parsed.readyCount) {
        bestResult = rawCandidate;
        parsed = rawParsed;
      }
    }

    armyImageImportState.rawText = bestResult.text;
    armyImageImportState.confidence = bestResult.confidence;
    armyImageImportState.parsed = parsed;
    armyImageImportState.suggestions = parsed.suggestions ?? [];
    armyImageImportState.status = parsed.readyCount
      ? `OCRが完了しました。必須 ${parsed.readyCount}/${ARMY_IMAGE_IMPORT_REQUIRED_FIELDS.length} 項目を抽出しています。`
      : "OCRは完了しましたが、数値の抽出が足りません。画像を変えるか、結果を手で補正してください。";
  } catch (error) {
    armyImageImportState.error = error.message;
    armyImageImportState.status =
      error.message === "army-ocr-file-missing"
        ? "画像を選択してから解析してください。"
        : "OCRの読み取りに失敗しました。能力画面の画像を選び直して再度試してください。";
  } finally {
    armyImageImportState.busy = false;
    renderArmyImageImportUi();
  }
}

function applyArmyImageImportFields() {
  const fields = armyImageImportState.parsed?.fields;
  if (!fields) {
    throw new Error("army-ocr-fields-missing");
  }
  const character = resolveArmyImportedCharacter(fields.name);
  if (!character) {
    throw new Error("army-ocr-character-mismatch");
  }
  const missingField = ARMY_IMAGE_IMPORT_REQUIRED_FIELDS.find((key) => fields[key] == null || fields[key] === "");
  if (missingField) {
    throw new Error("army-ocr-required-fields-missing");
  }

  const nextRows = { ...(armyObservedPowerState.rowsById ?? {}) };
  nextRows[character.id] = {
    name: character.name,
    power: Math.round(Number(fields.power)),
    attack: Number(fields.attack),
    defense: Number(fields.defense),
    war: Number(fields.war),
    strategy: Number(fields.strategy),
    charm: fields.charm,
    level: fields.level,
    tenpu: fields.tenpu,
    secret: fields.secret ?? 0
  };
  const nextText = buildArmyObservedPowerCsvText(nextRows);
  if (elements.armyPowerImportInput) {
    elements.armyPowerImportInput.value = nextText;
  }
  applyArmyObservedPowerImport(nextText, { showToast: false });
  armyImageImportState.status = `${character.name} のOCR結果を手持ち実測へ反映しました。`;
  renderArmyImageImportUi();
}

function renderArmyImageImportUi() {
  if (!elements.armyImageImportStatus) {
    return;
  }

  const hasFile = Boolean(armyImageImportState.file);
  const parsed = armyImageImportState.parsed;
  elements.armyImageImportStatus.textContent = armyImageImportState.status;
  if (elements.armyImageImportButton) {
    elements.armyImageImportButton.disabled = !hasFile || armyImageImportState.busy;
  }
  if (elements.armyImageImportApplyButton) {
    elements.armyImageImportApplyButton.disabled = !canApplyArmyImageImport() || armyImageImportState.busy;
  }
  if (elements.armyImageImportClearButton) {
    elements.armyImageImportClearButton.disabled = !hasFile && !parsed && !armyImageImportState.rawText;
  }

  if (elements.armyImageImportPreview) {
    elements.armyImageImportPreview.innerHTML = hasFile
      ? `
          <div class="army-image-import__meta">
            <span>${escapeHtml(armyImageImportState.fileName || "選択中")}</span>
          </div>
          <img src="${escapeHtml(armyImageImportState.previewUrl)}" alt="OCR読み取り対象の画像">
        `
      : '<div class="army-image-import__empty"><p>ここに選択した画像のプレビューを表示します。</p></div>';
  }

  if (!elements.armyImageImportResult) {
    return;
  }

  if (!parsed) {
    const statusLabel = armyImageImportState.busy ? "OCR準備中" : "未解析";
    elements.armyImageImportResult.innerHTML = `
      <div class="army-image-import__result-head">
        <strong>OCR抽出結果</strong>
        <span class="toolbar-summary">${escapeHtml(statusLabel)}</span>
      </div>
      <div class="army-image-import__empty">
        <p>画像を解析すると、ここに武将名とステータスの候補を表示します。</p>
      </div>
    `;
    return;
  }

  const fieldsMarkup = ARMY_IMAGE_IMPORT_FIELD_DEFS.map((field) => {
    const value = parsed.fields[field.key];
    return `
      <label>
        <span>${escapeHtml(field.label)}</span>
        <input
          type="${escapeHtml(field.type)}"
          value="${escapeHtml(value ?? "")}"
          data-army-image-field="${escapeHtml(field.key)}"
          ${field.type === "number" ? 'inputmode="numeric"' : ""}
        >
      </label>
    `;
  }).join("");
  const suggestionsMarkup =
    parsed.suggestions?.length && !resolveArmyImportedCharacter(parsed.fields.name)
      ? `
          <div class="army-image-import__raw">
            <strong>武将名候補</strong>
            <div class="army-image-import__suggestions">
              ${parsed.suggestions
                .map(
                  (name) =>
                    `<button type="button" data-army-image-suggest="${escapeHtml(name)}">${escapeHtml(name)}</button>`
                )
                .join("")}
            </div>
          </div>
        `
      : "";
  const rawTextMarkup = armyImageImportState.rawText
    ? `
        <details class="army-image-import__raw">
          <summary>OCRテキストを確認</summary>
          <pre>${escapeHtml(armyImageImportState.rawText)}</pre>
        </details>
      `
    : "";
  elements.armyImageImportResult.innerHTML = `
    <div class="army-image-import__result-head">
      <strong>OCR抽出結果</strong>
      <span class="toolbar-summary">必須 ${countArmyImageImportReadyFields(parsed)}/${ARMY_IMAGE_IMPORT_REQUIRED_FIELDS.length}${
        armyImageImportState.confidence != null ? ` / 信頼度目安 ${Math.round(armyImageImportState.confidence)}%` : ""
      }</span>
    </div>
    <div class="army-image-import__field-grid">${fieldsMarkup}</div>
    ${suggestionsMarkup}
    ${rawTextMarkup}
  `;
}

function parseArmyDelimitedLine(line, delimiter) {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (!quoted && char === delimiter) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function normalizeArmyImportHeader(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ 　・,、。．.=＝+＋/／'"`’‘“”()（）[\]【】_-]/gu, "");
}

function parseArmyImportNumber(value) {
  if (value == null || value === "") {
    return null;
  }

  const normalized = String(value).normalize("NFKC").replace(/[,\s]/gu, "");
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

function resolveArmyImportColumnIndex(headers, aliases) {
  const normalizedAliases = aliases.map(normalizeArmyImportHeader);
  return headers.findIndex((header) => normalizedAliases.includes(normalizeArmyImportHeader(header)));
}

function fitArmyRidgeRegression(features, targets, lambda = 4) {
  if (!features.length || features.length !== targets.length) {
    return null;
  }

  const dimension = features[0].length;
  if (!dimension) {
    return null;
  }

  const means = Array.from({ length: dimension }, (_, index) =>
    averageArmyValues(features.map((row) => row[index] ?? 0))
  );
  const stds = Array.from({ length: dimension }, (_, index) => {
    const variance = averageArmyValues(features.map((row) => ((row[index] ?? 0) - means[index]) ** 2));
    return Math.sqrt(variance) || 1;
  });
  const standardized = features.map((row) => row.map((value, index) => ((value ?? 0) - means[index]) / stds[index]));
  const size = dimension + 1;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));
  const vector = Array(size).fill(0);

  standardized.forEach((row, rowIndex) => {
    const augmented = [1, ...row];
    for (let leftIndex = 0; leftIndex < size; leftIndex += 1) {
      vector[leftIndex] += augmented[leftIndex] * targets[rowIndex];
      for (let rightIndex = 0; rightIndex < size; rightIndex += 1) {
        matrix[leftIndex][rightIndex] += augmented[leftIndex] * augmented[rightIndex];
      }
    }
  });

  for (let index = 1; index < size; index += 1) {
    matrix[index][index] += lambda;
  }

  for (let pivotIndex = 0; pivotIndex < size; pivotIndex += 1) {
    let swapIndex = pivotIndex;
    for (let rowIndex = pivotIndex + 1; rowIndex < size; rowIndex += 1) {
      if (Math.abs(matrix[rowIndex][pivotIndex]) > Math.abs(matrix[swapIndex][pivotIndex])) {
        swapIndex = rowIndex;
      }
    }

    if (swapIndex !== pivotIndex) {
      [matrix[pivotIndex], matrix[swapIndex]] = [matrix[swapIndex], matrix[pivotIndex]];
      [vector[pivotIndex], vector[swapIndex]] = [vector[swapIndex], vector[pivotIndex]];
    }

    const pivotValue = matrix[pivotIndex][pivotIndex];
    if (!Number.isFinite(pivotValue) || Math.abs(pivotValue) < 1e-9) {
      return null;
    }

    for (let columnIndex = pivotIndex; columnIndex < size; columnIndex += 1) {
      matrix[pivotIndex][columnIndex] /= pivotValue;
    }
    vector[pivotIndex] /= pivotValue;

    for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
      if (rowIndex === pivotIndex) {
        continue;
      }
      const factor = matrix[rowIndex][pivotIndex];
      if (!factor) {
        continue;
      }

      for (let columnIndex = pivotIndex; columnIndex < size; columnIndex += 1) {
        matrix[rowIndex][columnIndex] -= factor * matrix[pivotIndex][columnIndex];
      }
      vector[rowIndex] -= factor * vector[pivotIndex];
    }
  }

  const standardizedCoefficients = vector.slice(1);
  const coefficients = standardizedCoefficients.map((value, index) => value / stds[index]);
  const intercept = vector[0] - sumArmyValues(means.map((value, index) => value * coefficients[index]));

  return {
    intercept,
    coefficients
  };
}

function getArmyRegressionFeatureLabel(featureKey) {
  return ARMY_REGRESSION_FEATURE_LABELS[featureKey] ?? featureKey;
}

function buildArmyRegressionFeatureRows(rows, featureKeys, targetKey = "power") {
  return rows.filter((row) =>
    Number.isFinite(Number(row?.[targetKey])) &&
    featureKeys.every((featureKey) => Number.isFinite(Number(row?.[featureKey])))
  );
}

function predictArmyRegressionModel(model, row) {
  if (!model) {
    return null;
  }

  const featureKeys = Array.isArray(model.featureKeys) ? model.featureKeys : [];
  if (!featureKeys.length) {
    return null;
  }

  const values = featureKeys.map((featureKey) => Number(row?.[featureKey]));
  if (values.some((value) => !Number.isFinite(value))) {
    return null;
  }

  return Math.round(
    Number(model.intercept ?? 0) +
      sumArmyValues(values.map((value, index) => value * Number(model.coefficients?.[featureKeys[index]] ?? 0)))
  );
}

function compareArmyRegressionModels(left, right) {
  const leftHoldout = Number.isFinite(Number(left?.holdoutMae)) ? Number(left.holdoutMae) : Number.POSITIVE_INFINITY;
  const rightHoldout = Number.isFinite(Number(right?.holdoutMae)) ? Number(right.holdoutMae) : Number.POSITIVE_INFINITY;
  if (leftHoldout !== rightHoldout) {
    return leftHoldout - rightHoldout;
  }

  const leftMae = Number.isFinite(Number(left?.mae)) ? Number(left.mae) : Number.POSITIVE_INFINITY;
  const rightMae = Number.isFinite(Number(right?.mae)) ? Number(right.mae) : Number.POSITIVE_INFINITY;
  if (leftMae !== rightMae) {
    return leftMae - rightMae;
  }

  const leftFeatureCount = Array.isArray(left?.featureKeys) ? left.featureKeys.length : Number.POSITIVE_INFINITY;
  const rightFeatureCount = Array.isArray(right?.featureKeys) ? right.featureKeys.length : Number.POSITIVE_INFINITY;
  if (leftFeatureCount !== rightFeatureCount) {
    return leftFeatureCount - rightFeatureCount;
  }

  return String(left?.label ?? "").localeCompare(String(right?.label ?? ""), "ja");
}

function buildArmyRegressionModel(rows, definition, options = {}) {
  const featureKeys = [...(definition?.featureKeys ?? [])];
  const targetKey = options.targetKey ?? "power";
  const lambda = Number.isFinite(Number(options.lambda)) ? Number(options.lambda) : 0;
  const modeledRows = buildArmyRegressionFeatureRows(rows, featureKeys, targetKey);
  const minRows = Math.max(options.minRows ?? 8, featureKeys.length + 2);
  if (!featureKeys.length || modeledRows.length < minRows) {
    return null;
  }

  const features = modeledRows.map((row) => featureKeys.map((featureKey) => Number(row[featureKey])));
  const targets = modeledRows.map((row) => Number(row[targetKey]));
  const fitted = fitArmyRidgeRegression(features, targets, lambda);
  if (!fitted) {
    return null;
  }

  const coefficientMap = Object.fromEntries(
    featureKeys.map((featureKey, index) => [featureKey, fitted.coefficients[index]])
  );
  const baseModel = {
    key: definition?.key ?? featureKeys.join("-"),
    label:
      definition?.label ??
      featureKeys.map((featureKey) => getArmyRegressionFeatureLabel(featureKey)).join(" + "),
    description: definition?.description ?? "",
    featureKeys,
    intercept: fitted.intercept,
    coefficients: coefficientMap
  };
  const predictions = modeledRows.map((row) => predictArmyRegressionModel(baseModel, row));
  const meanTarget = averageArmyValues(targets);
  const ssResidual = sumArmyValues(targets.map((value, index) => (value - predictions[index]) ** 2));
  const ssTotal = sumArmyValues(targets.map((value) => (value - meanTarget) ** 2));
  const holdoutErrors = [];

  modeledRows.forEach((row, rowIndex) => {
    const trainRows = modeledRows.filter((_, index) => index !== rowIndex);
    if (trainRows.length < Math.max(6, featureKeys.length + 1)) {
      return;
    }

    const trainFeatures = trainRows.map((entry) => featureKeys.map((featureKey) => Number(entry[featureKey])));
    const trainTargets = trainRows.map((entry) => Number(entry[targetKey]));
    const holdoutFit = fitArmyRidgeRegression(trainFeatures, trainTargets, lambda);
    if (!holdoutFit) {
      return;
    }

    const holdoutModel = {
      featureKeys,
      intercept: holdoutFit.intercept,
      coefficients: Object.fromEntries(
        featureKeys.map((featureKey, index) => [featureKey, holdoutFit.coefficients[index]])
      )
    };
    const prediction = predictArmyRegressionModel(holdoutModel, row);
    if (prediction == null) {
      return;
    }
    holdoutErrors.push(Math.abs(prediction - Number(row[targetKey])));
  });

  return {
    ...baseModel,
    sampleCount: modeledRows.length,
    mae: averageArmyValues(targets.map((value, index) => Math.abs(value - predictions[index]))),
    holdoutMae: holdoutErrors.length ? averageArmyValues(holdoutErrors) : null,
    rSquared: ssTotal ? 1 - ssResidual / ssTotal : 0
  };
}

function formatArmyRegressionFormula(model) {
  if (!model) {
    return "";
  }

  const featureKeys = Array.isArray(model.featureKeys) ? model.featureKeys : [];
  if (!featureKeys.length) {
    return "";
  }

  const parts = featureKeys.map((featureKey) => {
    const coefficient = Number(model.coefficients?.[featureKey] ?? 0);
    return `${coefficient.toFixed(2)}×${getArmyRegressionFeatureLabel(featureKey)}`;
  });
  const intercept = Number(model.intercept ?? 0);
  const interceptText = `${intercept >= 0 ? "+" : "-"} ${Math.abs(intercept).toFixed(1)}`;
  return `戦力 ≒ ${parts.join(" + ")} ${interceptText}`;
}

function buildArmyS3UnitPowerModel(samples = []) {
  const modeledRows = samples.filter((row) =>
    [row?.power, row?.soldier, row?.attack, row?.defense, row?.war, row?.strategy].every((value) => Number.isFinite(Number(value)))
  );
  if (modeledRows.length < 8) {
    return null;
  }

  const features = modeledRows.map((row) => [row.soldier, row.attack, row.defense, row.war, row.strategy]);
  const targets = modeledRows.map((row) => row.power);
  const fitted = fitArmyRidgeRegression(features, targets, 0);
  if (!fitted) {
    return null;
  }

  const predictions = features.map(
    (featureRow) => fitted.intercept + sumArmyValues(featureRow.map((value, index) => value * fitted.coefficients[index]))
  );
  const meanTarget = averageArmyValues(targets);
  const ssResidual = sumArmyValues(targets.map((value, index) => (value - predictions[index]) ** 2));
  const ssTotal = sumArmyValues(targets.map((value) => (value - meanTarget) ** 2));

  return {
    intercept: fitted.intercept,
    coefficients: {
      soldier: fitted.coefficients[0],
      attack: fitted.coefficients[1],
      defense: fitted.coefficients[2],
      war: fitted.coefficients[3],
      strategy: fitted.coefficients[4]
    },
    sampleCount: modeledRows.length,
    mae: averageArmyValues(targets.map((value, index) => Math.abs(value - predictions[index]))),
    rSquared: ssTotal ? 1 - ssResidual / ssTotal : 0
  };
}

const ARMY_S3_UNIT_POWER_MODEL = buildArmyS3UnitPowerModel(ARMY_S3_POWER_SAMPLE_ROWS);

function readArmyNumericValue(value, fallback = 0) {
  const numeric = Number(value ?? fallback);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function applyArmyPercentBuff(baseValue, percentValue) {
  return Math.max(0, readArmyNumericValue(baseValue) * (1 + readArmyNumericValue(percentValue) / 100));
}

function estimateArmyS3UnitPower(stats = {}, model = ARMY_S3_UNIT_POWER_MODEL) {
  if (!model) {
    return 0;
  }

  const soldier = readArmyNumericValue(stats.soldier);
  const attack = readArmyNumericValue(stats.attack);
  const defense = readArmyNumericValue(stats.defense);
  const war = readArmyNumericValue(stats.war);
  const strategy = readArmyNumericValue(stats.strategy);
  const raw =
    model.intercept +
    soldier * model.coefficients.soldier +
    attack * model.coefficients.attack +
    defense * model.coefficients.defense +
    war * model.coefficients.war +
    strategy * model.coefficients.strategy;
  return Math.max(0, Math.round(raw));
}

function getArmyS3PowerModelSummaryText(model = ARMY_S3_UNIT_POWER_MODEL) {
  if (!model) {
    return "シーズン3資料が足りないため、式をまだ作れていません。";
  }

  const soldierOffset = model.coefficients.soldier * 3000 + model.intercept;
  const offsetText = `${soldierOffset >= 0 ? "+" : "-"} ${Math.abs(soldierOffset).toFixed(0)}`;
  return `推定戦力 ≒ ${model.coefficients.attack.toFixed(2)}×攻撃 + ${model.coefficients.defense.toFixed(2)}×防御 + ${model.coefficients.war.toFixed(2)}×戦威 + ${model.coefficients.strategy.toFixed(2)}×策略 + ${model.coefficients.soldier.toFixed(2)}×(兵力-3000) ${offsetText}`;
}

function buildArmyS3PowerCalcState() {
  return {
    soldier: readArmyNumericValue(elements.powerCalcSoldier?.value, ARMY_S3_POWER_CALC_DEFAULTS.soldier),
    attack: readArmyNumericValue(elements.powerCalcAttack?.value, ARMY_S3_POWER_CALC_DEFAULTS.attack),
    defense: readArmyNumericValue(elements.powerCalcDefense?.value, ARMY_S3_POWER_CALC_DEFAULTS.defense),
    war: readArmyNumericValue(elements.powerCalcWar?.value, ARMY_S3_POWER_CALC_DEFAULTS.war),
    strategy: readArmyNumericValue(elements.powerCalcStrategy?.value, ARMY_S3_POWER_CALC_DEFAULTS.strategy),
    soldierBuff: readArmyNumericValue(elements.powerCalcSoldierBuff?.value, 0),
    attackBuff: readArmyNumericValue(elements.powerCalcAttackBuff?.value, 0),
    defenseBuff: readArmyNumericValue(elements.powerCalcDefenseBuff?.value, 0),
    warBuff: readArmyNumericValue(elements.powerCalcWarBuff?.value, 0),
    strategyBuff: readArmyNumericValue(elements.powerCalcStrategyBuff?.value, 0)
  };
}

function resetArmyS3PowerCalcInputs() {
  if (!elements.powerCalcSoldier) {
    return;
  }

  Object.entries({
    powerCalcSoldier: ARMY_S3_POWER_CALC_DEFAULTS.soldier,
    powerCalcAttack: ARMY_S3_POWER_CALC_DEFAULTS.attack,
    powerCalcDefense: ARMY_S3_POWER_CALC_DEFAULTS.defense,
    powerCalcWar: ARMY_S3_POWER_CALC_DEFAULTS.war,
    powerCalcStrategy: ARMY_S3_POWER_CALC_DEFAULTS.strategy,
    powerCalcSoldierBuff: ARMY_S3_POWER_CALC_DEFAULTS.soldierBuff,
    powerCalcAttackBuff: ARMY_S3_POWER_CALC_DEFAULTS.attackBuff,
    powerCalcDefenseBuff: ARMY_S3_POWER_CALC_DEFAULTS.defenseBuff,
    powerCalcWarBuff: ARMY_S3_POWER_CALC_DEFAULTS.warBuff,
    powerCalcStrategyBuff: ARMY_S3_POWER_CALC_DEFAULTS.strategyBuff
  }).forEach(([key, value]) => {
    if (elements[key]) {
      elements[key].value = `${value}`;
    }
  });
}

function renderArmyS3PowerCalculator() {
  if (!elements.powerCalcSummaryGrid) {
    return;
  }

  const state = buildArmyS3PowerCalcState();
  const adjustedStats = {
    soldier: Math.round(applyArmyPercentBuff(state.soldier, state.soldierBuff)),
    attack: Math.round(applyArmyPercentBuff(state.attack, state.attackBuff)),
    defense: Math.round(applyArmyPercentBuff(state.defense, state.defenseBuff)),
    war: Math.round(applyArmyPercentBuff(state.war, state.warBuff)),
    strategy: Math.round(applyArmyPercentBuff(state.strategy, state.strategyBuff))
  };
  const estimatedPower = estimateArmyS3UnitPower(adjustedStats);
  const model = ARMY_S3_UNIT_POWER_MODEL;
  const cards = [
    {
      title: "推定部隊戦力",
      body: formatArmyEstimateNumber(estimatedPower),
      detail: model ? `平均誤差 ±${Math.round(model.mae)}` : "モデル未作成"
    },
    {
      title: "補正後ステータス",
      body: `兵力 ${formatArmyEstimateNumber(adjustedStats.soldier)}`,
      detail: `攻撃 ${formatArmyEstimateNumber(adjustedStats.attack)} / 防御 ${formatArmyEstimateNumber(adjustedStats.defense)} / 戦威 ${formatArmyEstimateNumber(adjustedStats.war)} / 策略 ${formatArmyEstimateNumber(adjustedStats.strategy)}`
    },
    {
      title: "補正差分",
      body: `兵力 ${formatArmyEstimateNumber(adjustedStats.soldier - state.soldier)}`,
      detail: `攻撃 ${formatArmyEstimateNumber(adjustedStats.attack - state.attack)} / 防御 ${formatArmyEstimateNumber(adjustedStats.defense - state.defense)} / 戦威 ${formatArmyEstimateNumber(adjustedStats.war - state.war)} / 策略 ${formatArmyEstimateNumber(adjustedStats.strategy - state.strategy)}`
    }
  ];

  elements.powerCalcSummaryGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="army-summary-card">
          <h3>${escapeHtml(card.title)}</h3>
          <p class="toolbar-summary">${escapeHtml(card.body)}</p>
          <p class="field-note">${escapeHtml(card.detail)}</p>
        </article>
      `
    )
    .join("");

  if (elements.powerCalcFormula) {
    elements.powerCalcFormula.textContent = getArmyS3PowerModelSummaryText(model);
  }
  if (elements.powerCalcSampleMeta) {
    elements.powerCalcSampleMeta.textContent = model
      ? `シーズン3サンプル ${model.sampleCount}件 / 決定係数 ${model.rSquared.toFixed(3)} / 兵力3000〜3690帯の部隊比較向け`
      : "シーズン3サンプルが不足しています。";
  }
}

const HERO_POWER_RESEARCH_MODELS = HERO_POWER_HYPOTHESIS_DEFS.map((definition) =>
  buildArmyRegressionModel(HERO_POWER_RESEARCH_SAMPLE_ROWS, definition, {
    targetKey: "power",
    lambda: 0,
    minRows: Math.max(8, definition.featureKeys.length + 2)
  })
)
  .filter(Boolean)
  .sort(compareArmyRegressionModels);

function findHeroPowerResearchSample(sampleKey) {
  return HERO_POWER_RESEARCH_SAMPLE_ROWS.find((row) => row.key === sampleKey) ?? null;
}

function readHeroPowerResearchNumber(input, fallback = 0) {
  return readArmyNumericValue(input?.value, fallback);
}

function buildHeroPowerResearchState() {
  return {
    attack: readHeroPowerResearchNumber(elements.heroPowerAttack, HERO_POWER_RESEARCH_DEFAULTS.attack),
    defense: readHeroPowerResearchNumber(elements.heroPowerDefense, HERO_POWER_RESEARCH_DEFAULTS.defense),
    war: readHeroPowerResearchNumber(elements.heroPowerWar, HERO_POWER_RESEARCH_DEFAULTS.war),
    strategy: readHeroPowerResearchNumber(elements.heroPowerStrategy, HERO_POWER_RESEARCH_DEFAULTS.strategy),
    charm: readHeroPowerResearchNumber(elements.heroPowerCharm, HERO_POWER_RESEARCH_DEFAULTS.charm),
    level: readHeroPowerResearchNumber(elements.heroPowerLevel, HERO_POWER_RESEARCH_DEFAULTS.level),
    tenpu: readHeroPowerResearchNumber(elements.heroPowerTenpu, HERO_POWER_RESEARCH_DEFAULTS.tenpu)
  };
}

function applyHeroPowerResearchValues(values = {}, options = {}) {
  const fieldMap = {
    heroPowerAttack: values.attack,
    heroPowerDefense: values.defense,
    heroPowerWar: values.war,
    heroPowerStrategy: values.strategy,
    heroPowerCharm: values.charm,
    heroPowerLevel: values.level,
    heroPowerTenpu: values.tenpu
  };
  Object.entries(fieldMap).forEach(([key, value]) => {
    if (elements[key] && value != null) {
      elements[key].value = `${value}`;
    }
  });
  if (elements.heroPowerPreset && options.presetKey) {
    elements.heroPowerPreset.value = options.presetKey;
  }
}

function applyHeroPowerResearchPreset(sampleKey) {
  if (!sampleKey || sampleKey === "custom") {
    return;
  }

  const sample = findHeroPowerResearchSample(sampleKey);
  if (!sample) {
    return;
  }

  applyHeroPowerResearchValues(sample, { presetKey: sample.key });
}

function resetHeroPowerResearchInputs() {
  const defaultSample = HERO_POWER_RESEARCH_SAMPLE_ROWS[0] ?? HERO_POWER_RESEARCH_DEFAULTS;
  applyHeroPowerResearchValues(defaultSample, {
    presetKey: defaultSample.key ?? "custom"
  });
}

function getHeroPowerSelectedSample() {
  const sampleKey = elements.heroPowerPreset?.value ?? "";
  return findHeroPowerResearchSample(sampleKey);
}

function hasHeroPowerInvestmentData(sample) {
  return Boolean(sample?.starBonuses && sample?.rendanBonuses);
}

function normalizeHeroPowerInvestmentBundle(bundle = {}) {
  return Object.fromEntries(
    HERO_POWER_BREAKDOWN_STAT_KEYS.map((statKey) => [statKey, readArmyNumericValue(bundle?.[statKey], 0)])
  );
}

function sumHeroPowerInvestmentBundle(bundle = {}) {
  return sumArmyValues(
    HERO_POWER_BREAKDOWN_STAT_KEYS.map((statKey) => readArmyNumericValue(bundle?.[statKey], 0))
  );
}

function formatHeroPowerInvestmentBundle(bundle = {}, options = {}) {
  const includeCharm = options.includeCharm !== false;
  const statKeys = includeCharm ? HERO_POWER_BREAKDOWN_STAT_KEYS : HERO_POWER_DELTA_FEATURE_KEYS;
  return statKeys
    .map((statKey) => `${getArmyRegressionFeatureLabel(statKey)}${formatArmyEstimateNumber(readArmyNumericValue(bundle?.[statKey], 0))}`)
    .join(" / ");
}

function deriveHeroPowerBaseBundle(sample) {
  if (!hasHeroPowerInvestmentData(sample)) {
    return null;
  }

  const starBonuses = normalizeHeroPowerInvestmentBundle(sample.starBonuses);
  const rendanBonuses = normalizeHeroPowerInvestmentBundle(sample.rendanBonuses);
  return {
    attack: readArmyNumericValue(sample.attack) - starBonuses.attack - rendanBonuses.attack,
    defense: readArmyNumericValue(sample.defense) - starBonuses.defense - rendanBonuses.defense,
    war: readArmyNumericValue(sample.war) - starBonuses.war - rendanBonuses.war,
    strategy: readArmyNumericValue(sample.strategy) - starBonuses.strategy - rendanBonuses.strategy,
    charm: readArmyNumericValue(sample.charm) - starBonuses.charm - rendanBonuses.charm
  };
}

function getHeroPowerDeltaModel(models = HERO_POWER_RESEARCH_MODELS) {
  return models.find((model) => model.key === "stats4") ?? models[0] ?? null;
}

function estimateHeroPowerBundleDeltaPower(bundle = {}, model = getHeroPowerDeltaModel()) {
  if (!model) {
    return null;
  }

  const coefficientKeys = HERO_POWER_DELTA_FEATURE_KEYS.filter((featureKey) =>
    Number.isFinite(Number(model.coefficients?.[featureKey]))
  );
  if (!coefficientKeys.length) {
    return null;
  }

  const rawDelta = sumArmyValues(
    coefficientKeys.map(
      (featureKey) =>
        readArmyNumericValue(bundle?.[featureKey], 0) * Number(model.coefficients?.[featureKey] ?? 0)
    )
  );
  return Math.max(0, Math.round(rawDelta));
}

function buildHeroPowerInvestmentConclusion(sample, model = getHeroPowerDeltaModel()) {
  if (!hasHeroPowerInvestmentData(sample)) {
    const names = HERO_POWER_RESEARCH_DETAILED_ROWS.map((row) => row.name).join(" / ");
    return `同時刻画像付きサンプルのみ、将星と練達の分解を表示しています。現状は ${names} に対応しています。`;
  }

  const starBonuses = normalizeHeroPowerInvestmentBundle(sample.starBonuses);
  const rendanBonuses = normalizeHeroPowerInvestmentBundle(sample.rendanBonuses);
  const nextStarBonuses = sample.nextStarBonuses ? normalizeHeroPowerInvestmentBundle(sample.nextStarBonuses) : null;
  const nextRendanBonuses = sample.nextRendanBonuses ? normalizeHeroPowerInvestmentBundle(sample.nextRendanBonuses) : null;
  const ratioText =
    HERO_POWER_STAR_STEP_RATIO_ANALYSIS
      ? `今回の非最大サンプル ${HERO_POWER_STAR_STEP_RATIO_ANALYSIS.sampleCount}項目では、次将星 / 現将星 = ${HERO_POWER_STAR_STEP_RATIO_ANALYSIS.meanRatio.toFixed(3)} 前後でした`
      : "次将星の倍率はまだ十分に検証できていません";
  const starText = nextStarBonuses
    ? `将星画面の緑値は白値の約20%で、${sample.name}では次将星で${formatHeroPowerInvestmentBundle(nextStarBonuses)}と伸びます`
    : `${sample.name}の将星は最大まで進んでいるため、次将星プレビューはありません`;
  const rendanText = nextRendanBonuses
    ? `練達画面では「白値 - 緑値」で現在補正を戻せます。${sample.rendanSkill}の次回プレビューは${formatHeroPowerInvestmentBundle(
        nextRendanBonuses
      )}です`
    : "練達プレビューは未登録です";
  const deltaModelText = model
    ? `戦力増分の試算には${getArmyRegressionFeatureLabel("attack")}〜${getArmyRegressionFeatureLabel("strategy")}の近似係数を使っています`
    : "戦力増分モデルはまだ構築中です";
  return `表示ステータス = 基礎値 + 将星補正 + 練達補正 と読むのが最も自然です。${starText}。${ratioText}。${rendanText}。${deltaModelText}。`;
}

function renderHeroPowerInvestmentBreakdown(sample = getHeroPowerSelectedSample(), models = HERO_POWER_RESEARCH_MODELS) {
  if (!elements.heroPowerInvestmentGrid) {
    return;
  }

  if (!hasHeroPowerInvestmentData(sample)) {
    elements.heroPowerInvestmentGrid.innerHTML = renderEmptyState(
      "同時刻画像付きサンプルを選ぶと、将星と練達を分解して基礎値まで逆算します。"
    );
    if (elements.heroPowerInvestmentConclusion) {
      elements.heroPowerInvestmentConclusion.textContent = buildHeroPowerInvestmentConclusion(null, getHeroPowerDeltaModel(models));
    }
    return;
  }

  const baseBundle = deriveHeroPowerBaseBundle(sample);
  const starBonuses = normalizeHeroPowerInvestmentBundle(sample.starBonuses);
  const rendanBonuses = normalizeHeroPowerInvestmentBundle(sample.rendanBonuses);
  const nextStarBonuses = sample.nextStarBonuses ? normalizeHeroPowerInvestmentBundle(sample.nextStarBonuses) : null;
  const nextRendanBonuses = sample.nextRendanBonuses ? normalizeHeroPowerInvestmentBundle(sample.nextRendanBonuses) : null;
  const deltaModel = getHeroPowerDeltaModel(models);
  const nextStarDelta = estimateHeroPowerBundleDeltaPower(nextStarBonuses, deltaModel);
  const nextRendanDelta = estimateHeroPowerBundleDeltaPower(nextRendanBonuses, deltaModel);
  const currentStarSum = sumHeroPowerInvestmentBundle(starBonuses);
  const currentRendanSum = sumHeroPowerInvestmentBundle(rendanBonuses);
  const currentBaseSum = sumHeroPowerInvestmentBundle(baseBundle);
  const ratioSummary = nextStarBonuses
    ? HERO_POWER_DELTA_FEATURE_KEYS.map((statKey) => {
        const currentValue = readArmyNumericValue(starBonuses?.[statKey], 0);
        const nextValue = readArmyNumericValue(nextStarBonuses?.[statKey], 0);
        return currentValue > 0 ? `${getArmyRegressionFeatureLabel(statKey)} ${nextValue}/${currentValue}` : null;
      })
        .filter(Boolean)
        .join(" / ")
    : "将星最大";
  const cards = [
    {
      title: "基礎値の逆算",
      body: formatHeroPowerInvestmentBundle(baseBundle),
      detail: `表示値 ${formatHeroPowerInvestmentBundle({
        attack: sample.attack,
        defense: sample.defense,
        war: sample.war,
        strategy: sample.strategy,
        charm: sample.charm
      })} から、将星 ${formatArmyEstimateNumber(currentStarSum)} と練達 ${formatArmyEstimateNumber(currentRendanSum)} を引いた推定基礎値です`
    },
    {
      title: "現在の投資内訳",
      body: `将星 ${formatArmyEstimateNumber(currentStarSum)} / 練達 ${formatArmyEstimateNumber(currentRendanSum)}`,
      detail: `将星 ${formatHeroPowerInvestmentBundle(starBonuses)} / 練達 ${formatHeroPowerInvestmentBundle(rendanBonuses)} / 基礎値合計 ${formatArmyEstimateNumber(currentBaseSum)}`
    },
    {
      title: nextStarBonuses ? "次の将星プレビュー" : "将星の状態",
      body: nextStarBonuses ? `+${formatArmyEstimateNumber(nextStarDelta ?? 0)} 戦力前後` : "最大まで到達",
      detail: nextStarBonuses
        ? `${formatHeroPowerInvestmentBundle(nextStarBonuses)} / 緑値は白値の約20% (${ratioSummary})`
        : "将星画面の白値が現在補正そのものと読めます"
    },
    {
      title: "次の練達プレビュー",
      body: nextRendanBonuses ? `+${formatArmyEstimateNumber(nextRendanDelta ?? 0)} 戦力前後` : "未登録",
      detail: nextRendanBonuses
        ? `${sample.rendanSkill} / ${formatHeroPowerInvestmentBundle(nextRendanBonuses)} / 白値 - 緑値 = 現在補正`
        : "練達画像が不足しています"
    }
  ];

  elements.heroPowerInvestmentGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="army-summary-card">
          <h3>${escapeHtml(card.title)}</h3>
          <p class="toolbar-summary">${escapeHtml(card.body)}</p>
          <p class="field-note">${escapeHtml(card.detail)}</p>
        </article>
      `
    )
    .join("");

  if (elements.heroPowerInvestmentConclusion) {
    elements.heroPowerInvestmentConclusion.textContent = buildHeroPowerInvestmentConclusion(sample, deltaModel);
  }
}

function buildHeroPowerResearchConclusion(models = HERO_POWER_RESEARCH_MODELS) {
  const best = models[0] ?? null;
  const second = models[1] ?? null;
  if (!best) {
    return "研究用サンプルが不足しているため、仮説比較をまだ出せません。";
  }

  const charmModel = models.find((model) => model.key === "stats4-level-tenpu-charm") ?? null;
  const readableModel = getHeroPowerDeltaModel(models);
  const bestReading = best.featureKeys.map((featureKey) => getArmyRegressionFeatureLabel(featureKey)).join(" + ");
  const comparisonText =
    second && Number.isFinite(Number(best.holdoutMae)) && Number.isFinite(Number(second.holdoutMae))
      ? `次点の${second.label}よりLOO誤差が${(second.holdoutMae - best.holdoutMae).toFixed(1)}小さい`
      : "他仮説より安定している";
  const charmText =
    charmModel && Number.isFinite(Number(charmModel.holdoutMae)) && Number.isFinite(Number(best.holdoutMae))
      ? `魅力を足した仮説はLOO誤差${charmModel.holdoutMae.toFixed(1)}で、最有力仮説より${(charmModel.holdoutMae - best.holdoutMae).toFixed(1)}悪化しているため`
      : "魅力を足した改善は今のサンプルでは限定的なため";
  const readableText =
    readableModel && readableModel.key !== best.key
      ? `人が追いやすい増分近似としては${readableModel.label}も有効で、将星や練達の一段分を戦力へ換算する目安に使えます`
      : "";
  return `${best.label}が最も安定しました。${comparisonText}ため、現時点では「${bestReading}」で読むのが自然です。同時刻画像の分解では「表示ステータス = 基礎値 + 将星補正 + 練達補正」と読むのが最も素直です。${charmText}、魅力の独立寄与は弱いか、未表示の兵力/将星/練達に埋もれている可能性があります。${readableText}${readableText ? "。" : ""}`.trim();
}

function renderHeroPowerResearch() {
  if (!elements.heroPowerSummaryGrid || !elements.heroPowerHypothesisGrid) {
    return;
  }

  if (!HERO_POWER_RESEARCH_MODELS.length) {
    elements.heroPowerSummaryGrid.innerHTML = renderEmptyState("武将戦力の研究サンプルがまだ不足しています。");
    elements.heroPowerHypothesisGrid.innerHTML = "";
    if (elements.heroPowerInvestmentGrid) {
      elements.heroPowerInvestmentGrid.innerHTML = "";
    }
    if (elements.heroPowerConclusion) {
      elements.heroPowerConclusion.textContent = "";
    }
    if (elements.heroPowerInvestmentConclusion) {
      elements.heroPowerInvestmentConclusion.textContent = "";
    }
    if (elements.heroPowerResearchMeta) {
      elements.heroPowerResearchMeta.textContent = "";
    }
    return;
  }

  const state = buildHeroPowerResearchState();
  const bestModel = HERO_POWER_RESEARCH_MODELS[0];
  const secondModel = HERO_POWER_RESEARCH_MODELS[1] ?? null;
  const estimatedPower = predictArmyRegressionModel(bestModel, state);
  const residuals = HERO_POWER_RESEARCH_SAMPLE_ROWS.map((row) => {
    const predicted = predictArmyRegressionModel(bestModel, row);
    return {
      name: row.name,
      actual: row.power,
      predicted,
      diff: predicted == null ? null : predicted - row.power
    };
  })
    .filter((row) => row.diff != null)
    .sort((left, right) => Math.abs(right.diff) - Math.abs(left.diff));
  const cards = [
    {
      title: "入力中の推定戦力",
      body: estimatedPower != null ? formatArmyEstimateNumber(estimatedPower) : "入力不足",
      detail: `${bestModel.label} / LOO ${Number(bestModel.holdoutMae ?? 0).toFixed(1)} / R² ${bestModel.rSquared.toFixed(3)}`
    },
    {
      title: "最有力仮説",
      body: bestModel.label,
      detail: secondModel
        ? `次点 ${secondModel.label} より検証誤差 ${(Number(secondModel.holdoutMae ?? 0) - Number(bestModel.holdoutMae ?? 0)).toFixed(1)} 改善`
        : `検証誤差 ${Number(bestModel.holdoutMae ?? 0).toFixed(1)}`
    },
    {
      title: "誤差が大きい武将",
      body: residuals
        .slice(0, 3)
        .map((row) => `${row.name} ${row.diff >= 0 ? "+" : ""}${row.diff}`)
        .join(" / "),
      detail: "未表示の最大兵力、将星、練達差が残差として残っている可能性があります。"
    }
  ];

  elements.heroPowerSummaryGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="army-summary-card">
          <h3>${escapeHtml(card.title)}</h3>
          <p class="toolbar-summary">${escapeHtml(card.body)}</p>
          <p class="field-note">${escapeHtml(card.detail)}</p>
        </article>
      `
    )
    .join("");

  elements.heroPowerHypothesisGrid.innerHTML = HERO_POWER_RESEARCH_MODELS.map(
    (model, index) => `
      <article class="army-summary-card">
        <h3>${escapeHtml(`${index + 1}位 ${model.label}`)}</h3>
        <p class="toolbar-summary">${escapeHtml(
          `LOO ${Number(model.holdoutMae ?? 0).toFixed(1)} / MAE ${model.mae.toFixed(1)} / R² ${model.rSquared.toFixed(3)}`
        )}</p>
        <p class="field-note">${escapeHtml(formatArmyRegressionFormula(model))}</p>
        <p class="field-note">${escapeHtml(model.description || "サンプル画像からの仮説です。")}</p>
      </article>
    `
  ).join("");

  renderHeroPowerInvestmentBreakdown(getHeroPowerSelectedSample(), HERO_POWER_RESEARCH_MODELS);

  if (elements.heroPowerConclusion) {
    elements.heroPowerConclusion.textContent = buildHeroPowerResearchConclusion();
  }
  if (elements.heroPowerResearchMeta) {
    elements.heroPowerResearchMeta.textContent =
      `研究サンプル ${HERO_POWER_RESEARCH_SAMPLE_ROWS.length}件、うち同時刻で将星と練達まで追えた詳細サンプル ${HERO_POWER_RESEARCH_DETAILED_ROWS.length}件。GameWith の「戦力は最大兵力と各ステータスから算出」を前提に、提供画像の数値で仮説比較しています。未表示の最大兵力は残差に残るため、これは公開式ではなく検証用の近似です。`;
  }
}

function createEmptyArmyPowerImportState() {
  return {
    mode: "standard",
    rawText: "",
    importedAt: "",
    rowCount: 0,
    matchedCount: 0,
    unmatchedRows: [],
    rowsById: {},
    model: null
  };
}

function hydrateArmyRegressionModel(rawModel, hypothesisDefs = ARMY_OBSERVED_POWER_HYPOTHESIS_DEFS) {
  if (!rawModel) {
    return null;
  }

  const fallbackDefinition =
    hypothesisDefs.find((definition) => definition.key === rawModel?.key) ?? hypothesisDefs[0] ?? null;
  const normalizeSingleModel = (entry, fallback = fallbackDefinition) => {
    if (!entry || !Number.isFinite(Number(entry.intercept))) {
      return null;
    }

    const featureKeys = Array.isArray(entry.featureKeys) && entry.featureKeys.length
      ? entry.featureKeys.filter((featureKey) => Object.prototype.hasOwnProperty.call(ARMY_REGRESSION_FEATURE_LABELS, featureKey))
      : [...(fallback?.featureKeys ?? ["attack", "defense", "war", "strategy", "level", "secret"])];
    if (!featureKeys.length) {
      return null;
    }

    return {
      key: String(entry.key ?? fallback?.key ?? featureKeys.join("-")),
      label:
        String(entry.label ?? fallback?.label ?? featureKeys.map((featureKey) => getArmyRegressionFeatureLabel(featureKey)).join(" + ")),
      description: String(entry.description ?? fallback?.description ?? ""),
      featureKeys,
      intercept: Number(entry.intercept),
      coefficients: Object.fromEntries(
        featureKeys.map((featureKey) => [featureKey, Number(entry.coefficients?.[featureKey] ?? 0)])
      ),
      rSquared: Number(entry.rSquared ?? 0),
      mae: Number(entry.mae ?? 0),
      holdoutMae: Number(entry.holdoutMae ?? entry.validationMae ?? 0),
      sampleCount: Number(entry.sampleCount ?? 0)
    };
  };

  const hypotheses = Array.isArray(rawModel.hypotheses)
    ? rawModel.hypotheses
        .map((entry) =>
          normalizeSingleModel(entry, hypothesisDefs.find((definition) => definition.key === entry?.key) ?? fallbackDefinition)
        )
        .filter(Boolean)
        .sort(compareArmyRegressionModels)
    : [];
  const normalizedPrimary = normalizeSingleModel(rawModel, fallbackDefinition);
  if (!normalizedPrimary && !hypotheses.length) {
    return null;
  }

  const normalizedHypotheses = hypotheses.length
    ? hypotheses
    : normalizedPrimary
      ? [normalizedPrimary]
      : [];
  const best = normalizedHypotheses[0] ?? normalizedPrimary;
  return best
    ? {
        ...best,
        hypotheses: normalizedHypotheses
      }
    : null;
}

function hydrateArmyPowerImportState(state) {
  const next = createEmptyArmyPowerImportState();
  next.mode = sanitizeArmyPowerMode(state?.mode);
  next.rawText = String(state?.rawText ?? "");
  next.importedAt = typeof state?.importedAt === "string" ? state.importedAt : "";
  next.unmatchedRows = Array.isArray(state?.unmatchedRows)
    ? state.unmatchedRows
        .map((entry) => String(entry ?? "").trim())
        .filter(Boolean)
        .slice(0, 24)
    : [];

  preparedCharacters.forEach((character) => {
    const rawRow = state?.rowsById?.[character.id];
    if (!rawRow) {
      return;
    }

    const nextRow = {
      name: String(rawRow.name ?? character.name),
      power: parseArmyImportNumber(rawRow.power),
      attack: parseArmyImportNumber(rawRow.attack),
      defense: parseArmyImportNumber(rawRow.defense),
      war: parseArmyImportNumber(rawRow.war),
      strategy: parseArmyImportNumber(rawRow.strategy),
      charm: parseArmyImportNumber(rawRow.charm),
      level: parseArmyImportNumber(rawRow.level),
      tenpu: parseArmyImportNumber(rawRow.tenpu),
      secret: parseArmyImportNumber(rawRow.secret),
      predictedPower: parseArmyImportNumber(rawRow.predictedPower)
    };

    if (nextRow.power == null && nextRow.predictedPower == null) {
      return;
    }

    next.rowsById[character.id] = nextRow;
  });

  next.rowCount = Number.isFinite(Number(state?.rowCount)) ? Number(state.rowCount) : Object.keys(next.rowsById).length;
  next.matchedCount = Object.keys(next.rowsById).length;

  next.model = hydrateArmyRegressionModel(state?.model, ARMY_OBSERVED_POWER_HYPOTHESIS_DEFS);

  if (!next.matchedCount) {
    next.mode = "standard";
  }

  return next;
}

function loadArmyPowerImportState() {
  try {
    const raw = window.localStorage.getItem(ARMY_POWER_IMPORT_STORAGE_KEY);
    if (!raw) {
      return createEmptyArmyPowerImportState();
    }

    return hydrateArmyPowerImportState(JSON.parse(raw));
  } catch (error) {
    return createEmptyArmyPowerImportState();
  }
}

function saveArmyPowerImportState() {
  armyObservedPowerState = hydrateArmyPowerImportState(armyObservedPowerState);
  invalidateArmyPowerCaches();
  try {
    window.localStorage.setItem(ARMY_POWER_IMPORT_STORAGE_KEY, JSON.stringify(armyObservedPowerState));
  } catch (error) {
    // Ignore storage failures so the planner remains usable in private mode.
  }
  window.KH_APP_API?.updateBackupMeta?.();
}

function exportArmyPowerImportState() {
  return hydrateArmyPowerImportState(armyObservedPowerState);
}

function buildArmyObservedPowerModel(rows) {
  const hypotheses = ARMY_OBSERVED_POWER_HYPOTHESIS_DEFS.map((definition) =>
    buildArmyRegressionModel(rows, definition, {
      targetKey: "power",
      lambda: 2,
      minRows: Math.max(8, definition.featureKeys.length + 2)
    })
  )
    .filter(Boolean)
    .sort(compareArmyRegressionModels);
  if (!hypotheses.length) {
    return null;
  }

  return {
    ...hypotheses[0],
    hypotheses
  };
}

function predictArmyObservedPower(model, row) {
  if (!model) {
    return null;
  }

  const hypotheses = Array.isArray(model.hypotheses) && model.hypotheses.length ? model.hypotheses : [model];
  for (const hypothesis of hypotheses) {
    const prediction = predictArmyRegressionModel(hypothesis, row);
    if (prediction != null) {
      return prediction;
    }
  }
  return null;
}

function parseArmyObservedPowerText(text) {
  const normalizedText = String(text ?? "").trim();
  if (!normalizedText) {
    return {
      rawText: "",
      rowCount: 0,
      matchedCount: 0,
      unmatchedRows: [],
      rowsById: {},
      model: null
    };
  }

  const lines = normalizedText
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("army-import-too-short");
  }

  const delimiter =
    (lines[0].match(/\t/g) ?? []).length > (lines[0].match(/,/g) ?? []).length ? "\t" : ",";
  const headers = parseArmyDelimitedLine(lines[0], delimiter);
  const columnIndex = {
    name: resolveArmyImportColumnIndex(headers, ["武将名", "名前", "武将", "name", "character"]),
    power: resolveArmyImportColumnIndex(headers, ["戦力", "power"]),
    attack: resolveArmyImportColumnIndex(headers, ["攻撃", "attack"]),
    defense: resolveArmyImportColumnIndex(headers, ["防御", "defense"]),
    war: resolveArmyImportColumnIndex(headers, ["戦威", "war"]),
    strategy: resolveArmyImportColumnIndex(headers, ["策略", "strategy"]),
    charm: resolveArmyImportColumnIndex(headers, ["魅力", "charm"]),
    level: resolveArmyImportColumnIndex(headers, ["レベル", "lv", "level"]),
    tenpu: resolveArmyImportColumnIndex(headers, ["天賦", "tenpu"]),
    secret: resolveArmyImportColumnIndex(headers, ["秘伝", "秘伝lv", "秘伝レベル", "secret", "secretlevel"])
  };

  if (
    columnIndex.name < 0 ||
    columnIndex.attack < 0 ||
    columnIndex.defense < 0 ||
    columnIndex.war < 0 ||
    columnIndex.strategy < 0
  ) {
    throw new Error("army-import-header-mismatch");
  }

  const parsedRows = lines.slice(1).map((line) => {
    const cells = parseArmyDelimitedLine(line, delimiter);
    return {
      name: cells[columnIndex.name] ?? "",
      power: columnIndex.power >= 0 ? parseArmyImportNumber(cells[columnIndex.power]) : null,
      attack: parseArmyImportNumber(cells[columnIndex.attack]),
      defense: parseArmyImportNumber(cells[columnIndex.defense]),
      war: parseArmyImportNumber(cells[columnIndex.war]),
      strategy: parseArmyImportNumber(cells[columnIndex.strategy]),
      charm: columnIndex.charm >= 0 ? parseArmyImportNumber(cells[columnIndex.charm]) : null,
      level: columnIndex.level >= 0 ? parseArmyImportNumber(cells[columnIndex.level]) : null,
      tenpu: columnIndex.tenpu >= 0 ? parseArmyImportNumber(cells[columnIndex.tenpu]) : null,
      secret: columnIndex.secret >= 0 ? parseArmyImportNumber(cells[columnIndex.secret]) : 0
    };
  });

  const model = buildArmyObservedPowerModel(parsedRows);
  const rowsById = {};
  const unmatchedRows = [];

  parsedRows.forEach((row) => {
    const character = resolveArmyImportedCharacter(row.name);
    if (!character) {
      unmatchedRows.push(row.name);
      return;
    }

    const predictedPower = row.power ?? predictArmyObservedPower(model, row);
    if (predictedPower == null) {
      unmatchedRows.push(row.name);
      return;
    }

    rowsById[character.id] = {
      ...row,
      name: character.name,
      power: row.power != null ? Math.round(row.power) : Math.round(predictedPower),
      predictedPower: model ? Math.round(predictedPower) : null
    };
  });

  return {
    rawText: normalizedText,
    rowCount: parsedRows.length,
    matchedCount: Object.keys(rowsById).length,
    unmatchedRows,
    rowsById,
    model
  };
}

function isArmyObservedPowerModeEnabled() {
  return armyObservedPowerState.mode === "observed" && (armyObservedPowerState.matchedCount ?? 0) > 0;
}

function getArmyObservedPowerRow(characterOrMeta) {
  const character = getArmyMeta(characterOrMeta)?.character ?? characterOrMeta;
  return armyObservedPowerState.rowsById?.[character.id] ?? null;
}

function getArmyObservedPowerModelInsightText(model) {
  if (!model) {
    return "戦力列付きの行が8体以上あると、複数仮説から安定した式を選べます。";
  }

  const featureLabels = model.featureKeys.map((featureKey) => getArmyRegressionFeatureLabel(featureKey));
  const includesTenpu = model.featureKeys.includes("tenpu");
  const includesCharm = model.featureKeys.includes("charm");
  const includesSecret = model.featureKeys.includes("secret");
  const holdoutText = Number.isFinite(Number(model.holdoutMae))
    ? `検証誤差 ${model.holdoutMae.toFixed(1)}`
    : "検証誤差は未算出";
  return `${model.label} を採用。使った項目: ${featureLabels.join(" / ")}。${holdoutText}。${
    includesTenpu && !includesCharm
      ? "天賦を足すと安定し、魅力は今回は採用されませんでした。"
      : includesCharm
        ? "魅力まで含めた方が安定したCSVです。"
        : includesSecret
          ? "Lvや秘伝込みの現在値補完に寄せた式です。"
          : "表示4ステータスだけで説明しやすいCSVです。"
  }`;
}

function getArmyPowerModelSummaryText() {
  if (!armyObservedPowerState.model) {
    return "係数を出すには、戦力列付きの行を8体以上読み込んでください。";
  }

  return `${armyObservedPowerState.model.label}: ${formatArmyRegressionFormula(armyObservedPowerState.model)}`;
}

function createEmptyArmyRosterState() {
  return {
    profiles: {},
    defaultInvestmentTier: "trained",
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
      "trained"
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
  invalidateArmyPowerCaches();
  try {
    window.localStorage.setItem(ARMY_ROSTER_STORAGE_KEY, JSON.stringify(armyRosterState));
  } catch (error) {
    // Ignore storage failures so the planner remains usable in private mode.
  }
  window.KH_APP_API?.updateBackupMeta?.();
}

function exportArmyRosterState() {
  return {
    version: 2,
    roster: hydrateArmyRosterState(armyRosterState),
    powerImport: exportArmyPowerImportState()
  };
}

function serializeArmyRosterForShare() {
  const entries = Object.entries(armyRosterState.profiles ?? {})
    .filter(([, profile]) => profile?.owned)
    .map(([id, profile]) => [
      Number(id),
      ARMY_SHARE_TIER_CODES[profile.investmentTier] ?? ARMY_SHARE_TIER_CODES.untrained,
      ARMY_SHARE_EQUIPMENT_CODES[profile.equipmentFit] ?? ARMY_SHARE_EQUIPMENT_CODES.none
    ]);

  if (
    !entries.length &&
    armyRosterState.defaultInvestmentTier === "trained" &&
    armyRosterState.defaultEquipmentFit === "none"
  ) {
    return undefined;
  }

  return {
    d: [
      ARMY_SHARE_TIER_CODES[armyRosterState.defaultInvestmentTier] ?? ARMY_SHARE_TIER_CODES.untrained,
      ARMY_SHARE_EQUIPMENT_CODES[armyRosterState.defaultEquipmentFit] ?? ARMY_SHARE_EQUIPMENT_CODES.none
    ],
    p: entries
  };
}

function importArmyRosterState(state, options = {}) {
  const isBundle = Boolean(state?.roster || state?.powerImport || Number(state?.version) >= 2);
  armyRosterState = isBundle
    ? hydrateArmyRosterState(state?.roster ?? null)
    : state
      ? hydrateArmyRosterState(state)
      : createEmptyArmyRosterState();
  armyObservedPowerState = isBundle
    ? hydrateArmyPowerImportState(state?.powerImport ?? null)
    : state
      ? hydrateArmyPowerImportState(armyObservedPowerState)
      : createEmptyArmyPowerImportState();
  saveArmyRosterState();
  saveArmyPowerImportState();
  renderArmyRosterUi();
  renderArmyPowerImportUi();

  if (options.rerender !== false) {
    lastArmyPlannerResult = null;
    activeArmyAlternativeIndex = 0;
    renderArmyPlanner(buildArmyPlannerResult());
  }
}

function importArmyRosterShareState(state, options = {}) {
  if (!state) {
    importArmyRosterState(null, options);
    return;
  }

  const nextState = createEmptyArmyRosterState();
  nextState.defaultInvestmentTier = ARMY_SHARE_TIER_KEYS[state.d?.[0]] ?? "untrained";
  nextState.defaultEquipmentFit = ARMY_SHARE_EQUIPMENT_KEYS[state.d?.[1]] ?? "none";

  for (const entry of state.p ?? []) {
    const [characterId, tierCode, equipmentCode] = entry;
    nextState.profiles[characterId] = {
      owned: true,
      investmentTier: ARMY_SHARE_TIER_KEYS[tierCode] ?? nextState.defaultInvestmentTier,
      equipmentFit: ARMY_SHARE_EQUIPMENT_KEYS[equipmentCode] ?? nextState.defaultEquipmentFit
    };
  }

  importArmyRosterState(nextState, options);
}

function setArmyObservedPowerMode(mode, options = {}) {
  armyObservedPowerState.mode = sanitizeArmyPowerMode(mode);
  if (armyObservedPowerState.mode === "observed" && !armyObservedPowerState.matchedCount) {
    armyObservedPowerState.mode = "standard";
  }
  saveArmyPowerImportState();
  renderArmyPowerImportUi();

  if (options.rerender !== false) {
    lastArmyPlannerResult = null;
    activeArmyAlternativeIndex = 0;
    renderArmyPlanner(buildArmyPlannerResult());
  }
}

function applyArmyObservedPowerImport(text, options = {}) {
  const parsed = parseArmyObservedPowerText(text);
  const nextState = createEmptyArmyPowerImportState();
  nextState.mode = parsed.matchedCount ? "observed" : "standard";
  nextState.rawText = parsed.rawText;
  nextState.importedAt = parsed.matchedCount ? new Date().toISOString() : "";
  nextState.rowCount = parsed.rowCount;
  nextState.matchedCount = parsed.matchedCount;
  nextState.unmatchedRows = parsed.unmatchedRows;
  nextState.rowsById = parsed.rowsById;
  nextState.model = parsed.model;
  armyObservedPowerState = hydrateArmyPowerImportState(nextState);

  Object.keys(parsed.rowsById).forEach((characterId) => {
    const current = getArmyRosterProfile(Number(characterId));
    armyRosterState.profiles[characterId] = {
      owned: true,
      investmentTier: current.investmentTier || armyRosterState.defaultInvestmentTier,
      equipmentFit: current.equipmentFit || armyRosterState.defaultEquipmentFit
    };
  });

  saveArmyRosterState();
  saveArmyPowerImportState();
  renderArmyPowerImportUi();
  renderArmyRosterUi();

  if (options.rerender !== false) {
    lastArmyPlannerResult = null;
    activeArmyAlternativeIndex = 0;
    renderArmyPlanner(buildArmyPlannerResult());
  }

  if (options.showToast !== false) {
    const unmatchedText = parsed.unmatchedRows.length ? ` / 未一致 ${parsed.unmatchedRows.length}体` : "";
    window.KH_APP_API?.showStatusToast?.(
      `CSV実測を反映しました。一致 ${parsed.matchedCount}/${parsed.rowCount} 体${unmatchedText}`
    );
  }
}

function clearArmyObservedPowerImport(options = {}) {
  armyObservedPowerState = createEmptyArmyPowerImportState();
  saveArmyPowerImportState();
  renderArmyPowerImportUi();
  renderArmyRosterUi();

  if (options.rerender !== false) {
    lastArmyPlannerResult = null;
    activeArmyAlternativeIndex = 0;
    renderArmyPlanner(buildArmyPlannerResult());
  }
}

function renderArmyPowerImportUi() {
  if (!elements.armyPowerImportSummaryGrid) {
    renderArmyImageImportUi();
    return;
  }

  if (elements.armyPowerMode) {
    elements.armyPowerMode.value = sanitizeArmyPowerMode(armyObservedPowerState.mode);
  }
  if (elements.armyPowerImportInput && document.activeElement !== elements.armyPowerImportInput) {
    elements.armyPowerImportInput.value = armyObservedPowerState.rawText ?? "";
  }
  renderArmyImageImportUi();

  const cards = [];
  const statusBody = armyObservedPowerState.matchedCount
    ? `${armyObservedPowerState.matchedCount}体の実測値を手持ちへ反映しています。`
    : "まだCSVは反映されていません。標準推定のまま使えます。";
  const statusDetail = armyObservedPowerState.matchedCount
    ? `一致 ${armyObservedPowerState.matchedCount}/${armyObservedPowerState.rowCount} 体`
    : "未読込";
  const statusExtra = armyObservedPowerState.unmatchedRows?.length
    ? `未一致: ${armyObservedPowerState.unmatchedRows.slice(0, 4).join(" / ")}${
        armyObservedPowerState.unmatchedRows.length > 4 ? " ほか" : ""
      }`
    : armyObservedPowerState.matchedCount
      ? `読込日時 ${new Date(armyObservedPowerState.importedAt).toLocaleString("ja-JP")}`
      : "CSVを反映すると、この画面の戦力集計と25体編成が実測優先になります。";
  cards.push({
    title: "CSV実測の状態",
    body: statusBody,
    detail: statusDetail,
    extra: statusExtra
  });

  cards.push({
    title: "現在の集計モード",
    body:
      sanitizeArmyPowerMode(armyObservedPowerState.mode) === "observed"
        ? "貼り付けた現在値の戦力を優先し、部隊内の主将40/副将20/補佐10で集計します。"
        : "公開データベースの適性・育成段階・装備状態から簡易推定します。",
    detail: ARMY_POWER_MODE_DEFS.find((entry) => entry.key === sanitizeArmyPowerMode(armyObservedPowerState.mode))?.label ?? "標準推定",
    extra:
      sanitizeArmyPowerMode(armyObservedPowerState.mode) === "observed"
        ? "共有リンクではモードだけ同期し、CSV本文は含みません。"
        : "CSVを反映すると、このモードを切り替えて比較できます。"
  });

  cards.push({
    title: "推定式",
    body: armyObservedPowerState.model
      ? `回帰サンプル ${armyObservedPowerState.model.sampleCount}体 / R² ${armyObservedPowerState.model.rSquared.toFixed(
          3
        )} / MAE ${armyObservedPowerState.model.mae.toFixed(1)}${
          Number.isFinite(Number(armyObservedPowerState.model.holdoutMae))
            ? ` / LOO ${armyObservedPowerState.model.holdoutMae.toFixed(1)}`
            : ""
        }`
      : "戦力列を含む行が8体以上ある時だけ係数を計算します。",
    detail: getArmyPowerModelSummaryText(),
    extra: getArmyObservedPowerModelInsightText(armyObservedPowerState.model)
  });

  elements.armyPowerImportSummaryGrid.innerHTML = cards
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

function cycleArmyRosterQuickState(characterId) {
  const current = getArmyRosterProfile(characterId);

  if (!current.owned) {
    patchArmyRosterProfile(characterId, {
      owned: true,
      investmentTier: "trained",
      equipmentFit: current.equipmentFit || armyRosterState.defaultEquipmentFit
    });
    return;
  }

  if (current.investmentTier === "trained") {
    patchArmyRosterProfile(characterId, {
      owned: true,
      investmentTier: "untrained",
      equipmentFit: current.equipmentFit || armyRosterState.defaultEquipmentFit
    });
    return;
  }

  patchArmyRosterProfile(characterId, {
    owned: false,
    investmentTier: armyRosterState.defaultInvestmentTier,
    equipmentFit: current.equipmentFit || armyRosterState.defaultEquipmentFit
  });
}

function setArmyRosterDefaults(nextDefaults) {
  armyRosterState.defaultInvestmentTier = sanitizeArmyTierKey(
    nextDefaults.defaultInvestmentTier ?? armyRosterState.defaultInvestmentTier,
    ARMY_INVESTMENT_TIER_DEFS,
    "untrained"
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
      investmentTier: "trained",
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

function isArmyCharacterReady(characterId) {
  const profile = getArmyRosterProfile(characterId);
  return Boolean(profile.owned) && profile.investmentTier === "trained";
}

function getReadyArmyCharacters() {
  return preparedCharacters.filter((character) => isArmyCharacterReady(character.id)).sort(compareCharactersBase);
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
  const vicePairScores = new Map();
  const aidePairScores = new Map();
  const templateScores = new Map();

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

    const templateKey = buildArmyGuideTemplateKeyFromMembers(
      mapped.map((placement) => ({
        slotKey: normalizeArmyGuideSlotKey(placement.slot),
        character: placement.character
      }))
    );
    templateScores.set(templateKey, (templateScores.get(templateKey) ?? 0) + 1);

    const commanderPlacement = mapped.find((row) => row.slot === "主将");
    if (!commanderPlacement) {
      continue;
    }

    const vicePair = mapped.filter((placement) => placement.slot === "副将1" || placement.slot === "副将2");
    if (vicePair.length >= 2) {
      const key = buildArmyGuideMemberGroupKey(
        commanderPlacement.character.id,
        vicePair.map((placement) => placement.character.id)
      );
      vicePairScores.set(key, (vicePairScores.get(key) ?? 0) + 1);
    }

    const aidePair = mapped.filter((placement) => placement.slot === "補佐1" || placement.slot === "補佐2");
    if (aidePair.length >= 2) {
      const key = buildArmyGuideMemberGroupKey(
        commanderPlacement.character.id,
        aidePair.map((placement) => placement.character.id)
      );
      aidePairScores.set(key, (aidePairScores.get(key) ?? 0) + 1);
    }

    for (const placement of mapped) {
      if (placement.character.id === commanderPlacement.character.id) {
        continue;
      }

      const key = `${commanderPlacement.character.id}:${placement.slot}:${placement.character.id}`;
      slotScores.set(key, (slotScores.get(key) ?? 0) + 1);
    }
  }

  return { pairScores, slotScores, vicePairScores, aidePairScores, templateScores };
}

function normalizeArmyGuideSlotKey(slotKey) {
  const normalized = String(slotKey ?? "");
  if (normalized === "主将" || normalized === "commander") {
    return "commander";
  }
  if (normalized === "副将1" || normalized === "vice1") {
    return "vice1";
  }
  if (normalized === "副将2" || normalized === "vice2") {
    return "vice2";
  }
  if (normalized === "補佐1" || normalized === "aide1") {
    return "aide1";
  }
  if (normalized === "補佐2" || normalized === "aide2") {
    return "aide2";
  }
  return normalized;
}

function buildArmyGuideMemberGroupKey(commanderId, memberIds = []) {
  return `${commanderId}:${[...memberIds].sort((left, right) => left - right).join("-")}`;
}

function buildArmyGuideTemplateKeyFromMembers(unitMembers = []) {
  const summary = {
    burst: 0,
    frontline: 0,
    support: 0,
    disruptor: 0,
    siege: 0,
    heal: 0,
    cleanse: 0,
    counter: 0,
    slotCounts: { commander: 0, vice: 0, aide: 0 },
    typeCounts: {}
  };

  unitMembers.forEach((member) => {
    const slotKey = normalizeArmyGuideSlotKey(member.slotKey ?? member.slot ?? member.label);
    const slotFamily = slotKey.startsWith("vice") ? "vice" : slotKey.startsWith("aide") ? "aide" : "commander";
    const character = member.character ?? member.meta?.character ?? null;
    const roleTags = member.roleTags ?? member.meta?.roleTags ?? (character ? getArmyRoleTags(character) : []);

    summary.slotCounts[slotFamily] = (summary.slotCounts[slotFamily] ?? 0) + 1;

    if (roleTags.includes("role.burst-commander")) {
      summary.burst += 1;
    }
    if (roleTags.includes("role.frontline-anchor")) {
      summary.frontline += 1;
    }
    if (roleTags.includes("role.flex-support")) {
      summary.support += 1;
    }
    if (roleTags.includes("role.disruptor")) {
      summary.disruptor += 1;
    }
    if (roleTags.includes("role.siege-breaker")) {
      summary.siege += 1;
    }
    if (roleTags.includes("support.heal")) {
      summary.heal += 1;
    }
    if (roleTags.includes("support.cleanse")) {
      summary.cleanse += 1;
    }
    if (roleTags.includes("role.counter-enabler")) {
      summary.counter += 1;
    }

    if (character?.type) {
      summary.typeCounts[character.type] = (summary.typeCounts[character.type] ?? 0) + 1;
    }
  });

  return [
    `cmd:${summary.slotCounts.commander ?? 0}`,
    `vice:${summary.slotCounts.vice ?? 0}`,
    `aide:${summary.slotCounts.aide ?? 0}`,
    `burst:${Math.min(summary.burst, 3)}`,
    `front:${Math.min(summary.frontline, 3)}`,
    `support:${Math.min(summary.support, 3)}`,
    `disrupt:${Math.min(summary.disruptor, 3)}`,
    `siege:${Math.min(summary.siege, 3)}`,
    `heal:${Math.min(summary.heal, 2)}`,
    `cleanse:${Math.min(summary.cleanse, 2)}`,
    `counter:${Math.min(summary.counter, 2)}`,
    ...Object.keys(summary.typeCounts)
      .sort()
      .map((typeKey) => `type-${typeKey}:${summary.typeCounts[typeKey]}`)
  ].join("|");
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

function getArmyGuideVicePairScore(commander, viceA, viceB) {
  if (!commander || !viceA || !viceB) {
    return 0;
  }

  return ARMY_GUIDE_DATA.vicePairScores.get(
    buildArmyGuideMemberGroupKey(commander.id, [viceA.id, viceB.id])
  ) ?? 0;
}

function getArmyGuideAidePairScore(commander, aideA, aideB) {
  if (!commander || !aideA || !aideB) {
    return 0;
  }

  return ARMY_GUIDE_DATA.aidePairScores.get(
    buildArmyGuideMemberGroupKey(commander.id, [aideA.id, aideB.id])
  ) ?? 0;
}

function getArmyGuideTemplateScore(unitMembers = []) {
  if (!unitMembers.length) {
    return 0;
  }

  return ARMY_GUIDE_DATA.templateScores.get(buildArmyGuideTemplateKeyFromMembers(unitMembers)) ?? 0;
}

function summarizeArmyUnitPattern(unitMembers = []) {
  const summary = {
    burst: 0,
    frontline: 0,
    support: 0,
    disruptor: 0,
    siege: 0,
    heal: 0,
    cleanse: 0,
    counter: 0,
    utilityAides: 0,
    burstAides: 0,
    slotCounts: { commander: 0, vice: 0, aide: 0 },
    typeCounts: {}
  };

  unitMembers.forEach((member) => {
    const roleSet = member.meta?.roleTagSet ?? new Set(member.roleTags ?? []);
    const slotKey = normalizeArmyGuideSlotKey(member.slotKey ?? member.slot ?? member.label);
    const slotFamily = slotKey.startsWith("vice") ? "vice" : slotKey.startsWith("aide") ? "aide" : "commander";
    const character = member.meta?.character ?? member.character ?? null;
    const isUtilityMember =
      roleSet.has("role.flex-support") ||
      roleSet.has("role.frontline-anchor") ||
      roleSet.has("role.disruptor") ||
      roleSet.has("support.heal") ||
      roleSet.has("support.cleanse") ||
      roleSet.has("def.damage-cut") ||
      roleSet.has("def.debuff-immunity");

    summary.slotCounts[slotFamily] = (summary.slotCounts[slotFamily] ?? 0) + 1;

    if (roleSet.has("role.burst-commander")) {
      summary.burst += 1;
      if (slotFamily === "aide") {
        summary.burstAides += 1;
      }
    }
    if (roleSet.has("role.frontline-anchor")) {
      summary.frontline += 1;
    }
    if (roleSet.has("role.flex-support")) {
      summary.support += 1;
    }
    if (roleSet.has("role.disruptor")) {
      summary.disruptor += 1;
    }
    if (roleSet.has("role.siege-breaker")) {
      summary.siege += 1;
    }
    if (roleSet.has("support.heal")) {
      summary.heal += 1;
    }
    if (roleSet.has("support.cleanse")) {
      summary.cleanse += 1;
    }
    if (roleSet.has("role.counter-enabler")) {
      summary.counter += 1;
    }
    if (slotFamily === "aide" && isUtilityMember) {
      summary.utilityAides += 1;
    }
    if (character?.type) {
      summary.typeCounts[character.type] = (summary.typeCounts[character.type] ?? 0) + 1;
    }
  });

  summary.uniqueTypes = Object.keys(summary.typeCounts).length;
  summary.maxTypeCount = Math.max(...Object.values(summary.typeCounts), 0);
  return summary;
}

function getArmyGuideClusterScore(unitMembers = []) {
  if (!unitMembers.length) {
    return 0;
  }

  const commander = unitMembers.find((member) => normalizeArmyGuideSlotKey(member.slotKey) === "commander");
  const viceMembers = unitMembers.filter((member) => normalizeArmyGuideSlotKey(member.slotKey).startsWith("vice"));
  const aideMembers = unitMembers.filter((member) => normalizeArmyGuideSlotKey(member.slotKey).startsWith("aide"));
  const guideTemplateScore = getArmyGuideTemplateScore(unitMembers);
  const vicePairScore =
    commander && viceMembers.length >= 2
      ? getArmyGuideVicePairScore(commander.meta.character, viceMembers[0].meta.character, viceMembers[1].meta.character)
      : 0;
  const aidePairScore =
    commander && aideMembers.length >= 2
      ? getArmyGuideAidePairScore(commander.meta.character, aideMembers[0].meta.character, aideMembers[1].meta.character)
      : 0;

  return clampArmyScore(vicePairScore * 28 + aidePairScore * 24 + guideTemplateScore * 16);
}

function getArmyCommanderPatternFlags(commanderMeta) {
  const roleSet = commanderMeta?.roleTagSet ?? new Set();
  const commander = commanderMeta?.character ?? null;
  return {
    support: roleSet.has("role.flex-support") || commander?.type === "援",
    frontline: roleSet.has("role.frontline-anchor") || commander?.type === "護",
    burst: roleSet.has("role.burst-commander") || commander?.type === "闘",
    siege: roleSet.has("role.siege-breaker"),
    disruptor: roleSet.has("role.disruptor") || commander?.type === "妨"
  };
}

function getArmyExpertBasePatternScore(summary, commanderMeta, concept) {
  const commanderFlags = getArmyCommanderPatternFlags(commanderMeta);
  const sustainTools = summary.heal + summary.cleanse;
  const hasAnchor = summary.frontline >= 1;
  const hasSupport = summary.support >= 1;
  const hasUtility = summary.disruptor >= 1 || sustainTools >= 1;
  const hasPressure = summary.burst >= 1 || summary.siege >= 1;

  let score = 18;
  score += hasAnchor ? 8 : 0;
  score += hasSupport ? 8 : -4;
  score += hasUtility ? 8 : 0;
  score += hasPressure ? 8 : -6;
  score += summary.utilityAides >= 1 ? 8 : -4;
  score += summary.utilityAides >= 2 ? 4 : 0;
  score += summary.uniqueTypes >= 3 ? 8 : summary.uniqueTypes === 2 ? 3 : 0;
  score += summary.maxTypeCount <= 3 ? 6 : 0;
  score += summary.burst >= 1 && summary.burst <= 3 ? 6 : summary.burst === 4 ? 2 : 0;
  score -= Math.max(0, summary.maxTypeCount - 3) * 7;
  score -= summary.burstAides >= 2 ? 8 : 0;
  score += commanderFlags.support && summary.support >= 2 ? 10 : 0;
  score += commanderFlags.frontline && summary.frontline >= 2 ? 10 : 0;
  score += commanderFlags.burst && summary.burst >= 2 ? 10 : 0;
  score += commanderFlags.siege && summary.siege >= 1 ? 8 : 0;
  score += commanderFlags.disruptor && summary.disruptor >= 1 ? 8 : 0;

  if (concept?.primaryObjective === "pvp") {
    score += summary.disruptor >= 1 ? 8 : -4;
    score += hasAnchor ? 6 : -4;
    score += hasSupport ? 4 : 0;
    score += sustainTools >= 1 ? 4 : 0;
  } else if (concept?.primaryObjective === "siege") {
    score += summary.siege >= 1 ? 10 : -8;
    score += hasSupport ? 5 : 0;
    score += summary.burst >= 2 ? 5 : 0;
  } else if (concept?.primaryObjective === "defense") {
    score += summary.frontline >= 2 ? 12 : hasAnchor ? 6 : -8;
    score += sustainTools >= 1 ? 10 : -2;
    score += hasSupport ? 6 : 0;
  } else if (concept?.primaryObjective === "gathering") {
    score += hasSupport ? 8 : 0;
    score += hasAnchor ? 4 : 0;
  } else {
    score += hasAnchor && hasSupport && hasPressure ? 8 : 0;
  }

  return clampArmyScore(score);
}

function getArmyExpertUnitPatternMatch(unitMembers = [], concept) {
  if (!unitMembers.length) {
    return {
      key: "balanced-hybrid",
      label: ARMY_EXPERT_TEMPLATE_LABELS["balanced-hybrid"],
      family: ARMY_EXPERT_TEMPLATE_FAMILY_MAP["balanced-hybrid"],
      score: 0,
      summary: summarizeArmyUnitPattern([])
    };
  }

  const summary = summarizeArmyUnitPattern(unitMembers);
  const commanderMeta =
    unitMembers.find((member) => normalizeArmyGuideSlotKey(member.slotKey) === "commander")?.meta ?? unitMembers[0]?.meta ?? null;
  const commanderFlags = getArmyCommanderPatternFlags(commanderMeta);
  const sustainTools = summary.heal + summary.cleanse;
  const genericScore = getArmyExpertBasePatternScore(summary, commanderMeta, concept);

  const candidates = [
    {
      key: "balanced-hybrid",
      label: ARMY_EXPERT_TEMPLATE_LABELS["balanced-hybrid"],
      family: ARMY_EXPERT_TEMPLATE_FAMILY_MAP["balanced-hybrid"],
      score: genericScore
    },
    {
      key: "support-engine",
      label: ARMY_EXPERT_TEMPLATE_LABELS["support-engine"],
      family: ARMY_EXPERT_TEMPLATE_FAMILY_MAP["support-engine"],
      score: clampArmyScore(
        18 +
          (commanderFlags.support ? 24 : commanderFlags.disruptor ? 8 : -10) +
          (summary.support >= 2 ? 18 : summary.support === 1 ? 8 : -10) +
          (summary.utilityAides >= 1 ? 12 : -8) +
          (summary.disruptor >= 1 ? 10 : 0) +
          (summary.burst >= 1 ? 8 : -4) +
          (sustainTools >= 1 ? 6 : 0) +
          (summary.uniqueTypes >= 3 ? 6 : 0) +
          (summary.maxTypeCount <= 3 ? 5 : -4) +
          (summary.frontline >= 1 ? 4 : 0) +
          (concept?.primaryObjective === "siege" && summary.siege >= 1 ? 8 : 0) -
          (concept?.primaryObjective === "defense" && summary.frontline === 0 ? 8 : 0)
      )
    },
    {
      key: "utility-net",
      label: ARMY_EXPERT_TEMPLATE_LABELS["utility-net"],
      family: ARMY_EXPERT_TEMPLATE_FAMILY_MAP["utility-net"],
      score: clampArmyScore(
        16 +
          (commanderFlags.support || commanderFlags.disruptor || commanderFlags.frontline ? 18 : -8) +
          (summary.support >= 2 ? 14 : summary.support === 1 ? 6 : -8) +
          (summary.disruptor >= 1 ? 12 : -2) +
          (summary.utilityAides >= 2 ? 14 : summary.utilityAides >= 1 ? 8 : -8) +
          (sustainTools >= 1 ? 8 : 0) +
          (summary.burst >= 1 ? 4 : 0) +
          (summary.maxTypeCount <= 3 ? 4 : -4)
      )
    },
    {
      key: "assault-shell",
      label: ARMY_EXPERT_TEMPLATE_LABELS["assault-shell"],
      family: ARMY_EXPERT_TEMPLATE_FAMILY_MAP["assault-shell"],
      score: clampArmyScore(
        18 +
          (commanderFlags.burst ? 22 : commanderFlags.support ? 4 : -8) +
          (summary.burst >= 2 ? 18 : summary.burst === 1 ? 8 : -12) +
          (summary.support >= 1 ? 10 : -8) +
          (summary.frontline >= 1 ? 8 : 0) +
          (summary.utilityAides >= 1 ? 8 : -6) +
          (summary.disruptor >= 1 ? 6 : 0) +
          (summary.siege >= 1 ? 4 : 0) +
          (summary.uniqueTypes >= 3 ? 6 : 0) +
          (summary.maxTypeCount <= 3 ? 5 : -6) +
          (concept?.primaryObjective === "pvp" && summary.frontline >= 1 && summary.support >= 1 ? 6 : 0) -
          (concept?.primaryObjective === "defense" && summary.frontline === 0 ? 6 : 0)
      )
    },
    {
      key: "guarded-burst",
      label: ARMY_EXPERT_TEMPLATE_LABELS["guarded-burst"],
      family: ARMY_EXPERT_TEMPLATE_FAMILY_MAP["guarded-burst"],
      score: clampArmyScore(
        18 +
          (commanderFlags.burst ? 18 : -6) +
          (summary.burst >= 1 ? 10 : -12) +
          (summary.frontline >= 2 ? 18 : summary.frontline === 1 ? 8 : -8) +
          (summary.support >= 1 ? 8 : -8) +
          (summary.utilityAides >= 1 ? 6 : 0) +
          (sustainTools >= 1 ? 6 : 0) +
          (summary.maxTypeCount <= 3 ? 4 : -4) +
          (concept?.primaryObjective === "pvp" ? 8 : 0) +
          (concept?.primaryObjective === "siege" ? 2 : 0)
      )
    },
    {
      key: "siege-burst",
      label: ARMY_EXPERT_TEMPLATE_LABELS["siege-burst"],
      family: ARMY_EXPERT_TEMPLATE_FAMILY_MAP["siege-burst"],
      score: clampArmyScore(
        18 +
          (commanderFlags.burst || commanderFlags.siege ? 18 : -8) +
          (summary.siege >= 1 ? 22 : -12) +
          (summary.support >= 1 ? 10 : -6) +
          (summary.burst >= 2 ? 10 : summary.burst === 1 ? 4 : -8) +
          (summary.utilityAides >= 1 ? 10 : -8) +
          (summary.frontline >= 1 ? 4 : 0) +
          (summary.uniqueTypes >= 3 ? 6 : 0) +
          (concept?.primaryObjective === "siege" ? 10 : 0)
      )
    },
    {
      key: "fortress-wall",
      label: ARMY_EXPERT_TEMPLATE_LABELS["fortress-wall"],
      family: ARMY_EXPERT_TEMPLATE_FAMILY_MAP["fortress-wall"],
      score: clampArmyScore(
        18 +
          (commanderFlags.frontline ? 22 : -8) +
          (summary.frontline >= 3 ? 20 : summary.frontline === 2 ? 12 : -10) +
          (summary.support >= 1 ? 10 : -8) +
          (sustainTools >= 1 ? 12 : 0) +
          (summary.utilityAides >= 1 ? 6 : 0) +
          (summary.disruptor >= 1 ? 4 : 0) +
          (summary.maxTypeCount <= 3 ? 4 : -4) +
          (summary.burst <= 2 ? 6 : 0) +
          (concept?.primaryObjective === "defense" ? 10 : 0) -
          (concept?.primaryObjective === "siege" ? 8 : 0)
      )
    }
  ];

  const best = candidates.reduce((currentBest, candidate) => {
    if (!currentBest) {
      return candidate;
    }
    return candidate.score > currentBest.score ? candidate : currentBest;
  }, null);

  return {
    ...(best ?? candidates[0]),
    score: clampArmyScore(best?.score ?? genericScore),
    summary
  };
}

function getArmyExpertUnitPatternScore(unitMembers = [], concept) {
  return getArmyExpertUnitPatternMatch(unitMembers, concept).score;
}

function getArmyExpertCoverageScore(units = [], concept) {
  if (!units.length) {
    return 0;
  }

  const patternEntries = units.map((unit) => unit.expertPattern ?? getArmyExpertUnitPatternMatch(unit.unitMembers, concept));
  const roleCount = (tag) => units.filter((unit) => unit.roleTags.includes(tag)).length;
  const selfSufficientUnits = patternEntries.filter((pattern) => (pattern.score ?? 0) >= 58).length;
  const familyCounts = patternEntries.reduce((result, pattern) => {
    const family = pattern.family ?? "hybrid";
    result[family] = (result[family] ?? 0) + 1;
    return result;
  }, {});
  const uniqueTemplateCount = new Set(patternEntries.map((pattern) => pattern.key)).size;
  const maxFamilyCount = Math.max(...Object.values(familyCounts), 0);
  let score =
    averageArmyValues(patternEntries.map((pattern) => pattern.score ?? 0)) * 0.62 +
    averageArmyValues(units.map((unit) => unit.guideClusterScore ?? 0)) * 0.14 +
    (selfSufficientUnits / Math.max(units.length, 1)) * 100 * 0.12 +
    (uniqueTemplateCount / Math.max(units.length, 1)) * 100 * 0.12;

  if (concept?.primaryObjective === "pvp") {
    score += (familyCounts.support ?? 0) >= 1 ? 8 : -6;
    score += (familyCounts.assault ?? 0) >= 2 ? 10 : (familyCounts.assault ?? 0) >= 1 ? 4 : -6;
    score += (familyCounts.defense ?? 0) >= 1 ? 8 : 0;
    score += roleCount("role.frontline-anchor") >= 2 ? 8 : 0;
    score += roleCount("role.flex-support") >= 2 ? 8 : 0;
    score += roleCount("role.disruptor") >= 2 ? 10 : roleCount("role.disruptor") >= 1 ? 4 : 0;
  } else if (concept?.primaryObjective === "siege") {
    score += (familyCounts.siege ?? 0) >= 1 ? 12 : -10;
    score += (familyCounts.support ?? 0) >= 1 ? 8 : 0;
    score += (familyCounts.assault ?? 0) >= 1 ? 6 : 0;
    score += roleCount("role.siege-breaker") >= 2 ? 10 : roleCount("role.siege-breaker") >= 1 ? 4 : 0;
    score += roleCount("role.flex-support") >= 2 ? 6 : 0;
  } else if (concept?.primaryObjective === "defense") {
    score += (familyCounts.defense ?? 0) >= 1 ? 12 : -10;
    score += (familyCounts.support ?? 0) >= 1 ? 8 : 0;
    score += (familyCounts.assault ?? 0) >= 1 ? 4 : 0;
    score += roleCount("role.frontline-anchor") >= 3 ? 10 : roleCount("role.frontline-anchor") >= 2 ? 6 : 0;
    score += roleCount("support.cleanse") >= 1 || roleCount("support.heal") >= 1 ? 8 : 0;
  } else {
    score += (familyCounts.support ?? 0) >= 1 ? 6 : 0;
    score += (familyCounts.assault ?? 0) >= 1 ? 6 : 0;
  }

  score -= Math.max(0, maxFamilyCount - 3) * 5;
  return clampArmyScore(score);
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

const ARMY_ROW_TEXT_RULES = {
  front: [
    { pattern: /(軍勢の)?前列で使うのがおすすめ|前列に配置して使うのがおすすめ/u, score: 24, reason: "前列推奨" },
    { pattern: /前列[^。]*軍勢全体|前列[^。]*全体に付与/u, score: 30, reason: "前列で全体化" },
    { pattern: /前列[^。]*(威力上昇|効果上昇|追加効果|兵力回復|付与)/u, score: 22, reason: "前列で効果増" }
  ],
  middle: [
    { pattern: /(軍勢の)?中列で使うのがおすすめ|中列に配置して使うのがおすすめ/u, score: 24, reason: "中列推奨" },
    { pattern: /中列[^。]*軍勢全体|中列[^。]*全体に付与/u, score: 28, reason: "中列で全体化" },
    { pattern: /中列[^。]*(威力上昇|効果上昇|追加効果|兵力回復|付与)/u, score: 22, reason: "中列で効果増" }
  ],
  back: [
    { pattern: /(軍勢の)?後列で使うのがおすすめ|後列に配置して使うのがおすすめ/u, score: 24, reason: "後列推奨" },
    { pattern: /後列[^。]*軍勢全体|後列[^。]*全体に付与/u, score: 28, reason: "後列で全体化" },
    { pattern: /後列[^。]*(威力上昇|効果上昇|追加効果|兵力回復|付与)/u, score: 22, reason: "後列で効果増" }
  ]
};

function createArmyPositionProfile() {
  return {
    scores: { front: 0, middle: 0, back: 0 },
    reasons: { front: [], middle: [], back: [] },
    dominantRow: "",
    dominantScore: 0,
    dominantGap: 0,
    focusText: "",
    summaryText: ""
  };
}

function getArmyRowTextRules() {
  if (getArmyRowTextRules.cache) {
    return getArmyRowTextRules.cache;
  }

  getArmyRowTextRules.cache = {
    front: [
      { pattern: /(軍勢の)?前列で使うのがおすすめ|前列に配置して使うのがおすすめ/u, score: 24, reason: "前列推奨" },
      { pattern: /前列[^。]*軍勢全体|前列[^。]*全体に付与/u, score: 30, reason: "前列で全体化" },
      { pattern: /前列[^。]*(威力上昇|効果上昇|追加効果|兵力回復|付与)/u, score: 22, reason: "前列で効果増" }
    ],
    middle: [
      { pattern: /(軍勢の)?中列で使うのがおすすめ|中列に配置して使うのがおすすめ/u, score: 24, reason: "中列推奨" },
      { pattern: /中列[^。]*軍勢全体|中列[^。]*全体に付与/u, score: 28, reason: "中列で全体化" },
      { pattern: /中列[^。]*(威力上昇|効果上昇|追加効果|兵力回復|付与)/u, score: 22, reason: "中列で効果増" }
    ],
    back: [
      { pattern: /(軍勢の)?後列で使うのがおすすめ|後列に配置して使うのがおすすめ/u, score: 24, reason: "後列推奨" },
      { pattern: /後列[^。]*軍勢全体|後列[^。]*全体に付与/u, score: 28, reason: "後列で全体化" },
      { pattern: /後列[^。]*(威力上昇|効果上昇|追加効果|兵力回復|付与)/u, score: 22, reason: "後列で効果増" }
    ]
  };

  return getArmyRowTextRules.cache;
}

function addArmyPositionSignal(profile, rowKey, score, reason) {
  if (!profile?.scores || !ARMY_BUILDER_ROW_KEYS.includes(rowKey) || !Number.isFinite(score) || score <= 0) {
    return;
  }

  profile.scores[rowKey] += score;
  if (reason && !profile.reasons[rowKey].includes(reason)) {
    profile.reasons[rowKey].push(reason);
  }
}

function applyArmyExplicitPositionGuideSignals(profile, referenceText) {
  const text = `${referenceText ?? ""}`;
  if (!text) {
    return;
  }

  const explicitRules = [
    {
      rowKey: "front",
      score: 26,
      reason: "前列推奨",
      patterns: [/軍勢の前列で使うのがおすすめ/u, /陣形の前列で使うのがおすすめ/u, /前列で使うのがおすすめ/u]
    },
    {
      rowKey: "middle",
      score: 24,
      reason: "中列推奨",
      patterns: [/軍勢の中列で使うのがおすすめ/u, /陣形の中列で使うのがおすすめ/u, /中列で使うのがおすすめ/u]
    },
    {
      rowKey: "back",
      score: 24,
      reason: "後列推奨",
      patterns: [/軍勢の後列で使うのがおすすめ/u, /陣形の後列で使うのがおすすめ/u, /後列で使うのがおすすめ/u]
    }
  ];

  explicitRules.forEach((rule) => {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      addArmyPositionSignal(profile, rule.rowKey, rule.score, rule.reason);
    }
  });

  const rowConditionRules = [
    { rowKey: "front", label: "前列" },
    { rowKey: "middle", label: "中列" },
    { rowKey: "back", label: "後列" }
  ];

  rowConditionRules.forEach(({ rowKey, label }) => {
    if (new RegExp(`${label}にいる場合[^。]*?(軍勢全体|全体に付与)`, "u").test(text)) {
      addArmyPositionSignal(profile, rowKey, 34, `${label}で全体化`);
    }
    if (new RegExp(`${label}にいる場合[^。]*?(効果上昇|威力上昇|効果最大)`, "u").test(text)) {
      addArmyPositionSignal(profile, rowKey, 20, `${label}条件強化`);
    }
    if (new RegExp(`${label}[^。]*?(攻撃|防御|戦威|策略|会心|対物|回復|反撃)`, "u").test(text)) {
      addArmyPositionSignal(profile, rowKey, 8, `${label}条件技能`);
    }
  });
}

function finalizeArmyPositionProfile(profile) {
  const ranked = [...ARMY_BUILDER_ROW_KEYS]
    .map((rowKey) => ({ rowKey, score: profile.scores[rowKey] ?? 0 }))
    .sort((left, right) => right.score - left.score);
  const top = ranked[0] ?? { rowKey: "", score: 0 };
  const second = ranked[1] ?? { score: 0 };
  const topReason = top.rowKey ? profile.reasons[top.rowKey]?.[0] ?? "" : "";

  profile.dominantRow = top.score > 0 ? top.rowKey : "";
  profile.dominantScore = top.score;
  profile.dominantGap = top.score - (second.score ?? 0);
  profile.focusText =
    profile.dominantRow && profile.dominantScore >= 14
      ? `${builderRowLabelFor(profile.dominantRow)}寄り${topReason ? ` / ${topReason}` : ""}`
      : "";
  profile.summaryText =
    ranked
      .filter((entry) => entry.score >= 12)
      .map((entry) => {
        const reason = profile.reasons[entry.rowKey]?.[0] ?? "";
        return `${builderRowLabelFor(entry.rowKey)} ${Math.round(entry.score)}${reason ? ` (${reason})` : ""}`;
      })
      .slice(0, 2)
      .join(" / ") || "";
  return profile;
}

function getArmyCharacterPositionProfile(character) {
  if (!character) {
    return createArmyPositionProfile();
  }

  if (character.armyPositionProfile) {
    return character.armyPositionProfile;
  }

  const profile = createArmyPositionProfile();
  const guideText = [
    ...(character.guide?.evaluationPoints ?? []),
    ...(character.guide?.latestFormation?.focusTitles ?? [])
  ].join(" ");
  const tacticText = [character.battleArtText ?? "", ...(character.battleArtEffects ?? [])].join(" ");
  const referenceText = [
    guideText,
    tacticText,
    character.season3?.roleSummary ?? "",
    ...(character.season3?.strengths ?? []),
    ...(character.season3?.bestUseCases ?? [])
  ]
    .filter(Boolean)
    .join(" ");
  const rowTextRules = getArmyRowTextRules();

  for (const rowKey of ARMY_BUILDER_ROW_KEYS) {
    for (const rule of rowTextRules[rowKey] ?? []) {
      if (rule.pattern.test(referenceText)) {
        addArmyPositionSignal(profile, rowKey, rule.score, rule.reason);
      }
    }
  }

  applyArmyExplicitPositionGuideSignals(profile, referenceText);

  for (const rowKey of character.battleArtMeta?.rowBoosts ?? []) {
    addArmyPositionSignal(profile, rowKey, 12, `${builderRowLabelFor(rowKey)}条件の戦法`);
  }

  for (const rowKey of character.conditionKeys ?? []) {
    if (ARMY_BUILDER_ROW_KEYS.includes(rowKey)) {
      addArmyPositionSignal(profile, rowKey, 10, `${builderRowLabelFor(rowKey)}条件の技能`);
    }
  }

  if (/横列の味方を強化/u.test(referenceText) && /前列/u.test(referenceText)) {
    addArmyPositionSignal(profile, "front", 8, "前列横列支援");
  }
  if (/横列の味方を強化/u.test(referenceText) && /中列/u.test(referenceText)) {
    addArmyPositionSignal(profile, "middle", 8, "中列横列支援");
  }
  if (/縦列の味方を強化/u.test(referenceText) && /中列/u.test(referenceText)) {
    addArmyPositionSignal(profile, "middle", 8, "中列縦列支援");
  }
  if (/後列[^。]*(威力上昇|効果上昇)/u.test(tacticText) && character.type === "援") {
    addArmyPositionSignal(profile, "back", 8, "後列支援火力");
  }

  character.armyPositionProfile = finalizeArmyPositionProfile(profile);
  return character.armyPositionProfile;
}

function getArmyDominantRowInfo(rowScores = {}, fallbackRow = "") {
  const ranked = [...ARMY_BUILDER_ROW_KEYS]
    .map((rowKey) => ({ rowKey, score: rowScores?.[rowKey] ?? 0 }))
    .sort((left, right) => right.score - left.score);
  const top = ranked[0] ?? { rowKey: fallbackRow || "middle", score: rowScores?.[fallbackRow] ?? 0 };
  const second = ranked[1] ?? { score: 0 };
  return {
    rowKey: top.rowKey || fallbackRow || "middle",
    score: top.score ?? 0,
    gap: (top.score ?? 0) - (second.score ?? 0)
  };
}

function getArmyRowScores(character, roleTags) {
  const scores = { ...ARMY_BASE_ROW_SCORE };
  const rowBoosts = new Set(character.battleArtMeta?.rowBoosts ?? []);
  const conditionSet = new Set(character.conditionKeys);
  const positionProfile = getArmyCharacterPositionProfile(character);

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

  for (const rowKey of ARMY_BUILDER_ROW_KEYS) {
    scores[rowKey] += positionProfile.scores[rowKey] ?? 0;
  }

  if (positionProfile.dominantRow && positionProfile.dominantScore >= 20 && positionProfile.dominantGap >= 8) {
    for (const rowKey of ARMY_BUILDER_ROW_KEYS) {
      if (rowKey === positionProfile.dominantRow) {
        continue;
      }
      scores[rowKey] -= positionProfile.dominantScore >= 32 ? 8 : 4;
    }
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
    positionProfile: getArmyCharacterPositionProfile(character),
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
  const ownedCharacters = usingRoster ? getOwnedArmyCharacters() : preparedCharacters;
  const readyCharacters = usingRoster ? getReadyArmyCharacters() : preparedCharacters;
  const allowedCharacters = readyCharacters.filter(
    (character) =>
      selectedRarities.includes(character.rarity) || (seedCharacter && character.id === seedCharacter.id)
  );

  return {
    usingRoster,
    ownedCount: usingRoster ? ownedCharacters.length : preparedCharacters.length,
    readyCount: usingRoster ? readyCharacters.length : preparedCharacters.length,
    allowedCharacters,
    allowedMetas: allowedCharacters.map((character) => getArmyMeta(character))
  };
}

function getArmyUnitWeights(concept) {
  const fallback = {
    slotFitScore: 0.16,
    objectiveFitScore: 0.16,
    synergyScore: 0.18,
    tempoScore: 0.14,
    pressureScore: 0.1,
    sustainScore: 0.09,
    utilityScore: 0.03,
    investmentScore: 0.02,
    powerScore: 0.12
  };
  const baseWeights = {
    ...(ARMY_UNIT_WEIGHT_MAP[concept.primaryObjective] ?? ARMY_UNIT_WEIGHT_MAP.pvp ?? fallback)
  };

  if (concept.key === "powermax") {
    Object.assign(baseWeights, {
      slotFitScore: 0.12,
      objectiveFitScore: 0.08,
      synergyScore: 0.16,
      tempoScore: 0.08,
      pressureScore: 0.08,
      sustainScore: 0.07,
      utilityScore: 0.02,
      investmentScore: 0.01,
      powerScore: 0.38
    });
  } else if (concept.key === "opener") {
    Object.assign(baseWeights, {
      slotFitScore: 0.15,
      objectiveFitScore: 0.12,
      synergyScore: 0.18,
      tempoScore: 0.2,
      pressureScore: 0.12,
      sustainScore: 0.07,
      utilityScore: 0.08,
      investmentScore: 0.01,
      powerScore: 0.07
    });
  } else {
    baseWeights.powerScore = baseWeights.powerScore ?? fallback.powerScore;
  }

  const totalWeight = Math.max(sumArmyValues(Object.values(baseWeights)), 1);
  return Object.fromEntries(Object.entries(baseWeights).map(([key, value]) => [key, value / totalWeight]));
}

function getArmyCompositionWeights(concept, withFormation = false) {
  const fallback = withFormation
    ? {
        armyPowerScore: 0.24,
        roleCoverageScore: 0.18,
        commanderQualityScore: 0.16,
        synergyCoverageScore: 0.14,
        stabilityScore: 0.12,
        formationFitScore: 0.08,
        objectivePurityScore: 0.08,
        investmentEfficiencyScore: 0.06
      }
    : {
        armyPowerScore: 0.24,
        roleCoverageScore: 0.18,
        commanderQualityScore: 0.16,
        synergyCoverageScore: 0.14,
        stabilityScore: 0.12,
        objectivePurityScore: 0.08,
        investmentEfficiencyScore: 0.08
      };
  const baseWeights = {
    ...(ARMY_ARMY_WEIGHT_MAP[concept.primaryObjective] ?? ARMY_ARMY_WEIGHT_MAP.pvp ?? fallback)
  };

  if (concept.key === "powermax") {
    baseWeights.armyPowerScore = (baseWeights.armyPowerScore ?? fallback.armyPowerScore) + 0.2;
    baseWeights.roleCoverageScore = (baseWeights.roleCoverageScore ?? fallback.roleCoverageScore) * 0.72;
    baseWeights.commanderQualityScore = (baseWeights.commanderQualityScore ?? fallback.commanderQualityScore) * 0.84;
    baseWeights.synergyCoverageScore = (baseWeights.synergyCoverageScore ?? fallback.synergyCoverageScore) * 0.86;
    baseWeights.stabilityScore = (baseWeights.stabilityScore ?? fallback.stabilityScore) * 0.86;
    if (withFormation) {
      baseWeights.formationFitScore = (baseWeights.formationFitScore ?? fallback.formationFitScore) * 0.8;
    }
    baseWeights.objectivePurityScore = (baseWeights.objectivePurityScore ?? fallback.objectivePurityScore) * 0.65;
    baseWeights.investmentEfficiencyScore =
      (baseWeights.investmentEfficiencyScore ?? fallback.investmentEfficiencyScore) * 0.72;
  } else if (concept.key === "opener") {
    baseWeights.armyPowerScore = (baseWeights.armyPowerScore ?? fallback.armyPowerScore) * 0.78;
    baseWeights.roleCoverageScore = (baseWeights.roleCoverageScore ?? fallback.roleCoverageScore) * 0.94;
    baseWeights.commanderQualityScore = (baseWeights.commanderQualityScore ?? fallback.commanderQualityScore) * 1.08;
    baseWeights.synergyCoverageScore = (baseWeights.synergyCoverageScore ?? fallback.synergyCoverageScore) * 1.16;
    baseWeights.stabilityScore = (baseWeights.stabilityScore ?? fallback.stabilityScore) * 0.78;
    if (withFormation) {
      baseWeights.formationFitScore = (baseWeights.formationFitScore ?? fallback.formationFitScore) * 1.24;
    }
    baseWeights.objectivePurityScore = (baseWeights.objectivePurityScore ?? fallback.objectivePurityScore) * 1.26;
    baseWeights.investmentEfficiencyScore =
      (baseWeights.investmentEfficiencyScore ?? fallback.investmentEfficiencyScore) * 0.68;
  }

  const totalWeight = Math.max(sumArmyValues(Object.values(baseWeights)), 1);
  return Object.fromEntries(Object.entries(baseWeights).map(([key, value]) => [key, value / totalWeight]));
}

function getArmyReferenceUnitPower() {
  if (armyPowerReferenceCache) {
    return armyPowerReferenceCache;
  }

  const sourceCharacters = hasArmyRosterSelection() ? getReadyArmyCharacters() : preparedCharacters;
  const topPowers = sourceCharacters
    .map((character) => getArmyCharacterPowerSnapshot(character).current)
    .sort((left, right) => right - left)
    .slice(0, 5);
  const orderedWeights = [0.4, 0.2, 0.2, 0.1, 0.1];
  armyPowerReferenceCache = Math.max(
    1,
    sumArmyValues(orderedWeights.map((weight, index) => (topPowers[index] ?? topPowers[0] ?? 1) * weight))
  );
  return armyPowerReferenceCache;
}

function getArmyObservedPowerValue(characterOrMeta) {
  const row = getArmyObservedPowerRow(characterOrMeta);
  return row?.power ?? row?.predictedPower ?? null;
}

function getArmyCharacterPotentialPower(characterOrMeta) {
  const character = getArmyMeta(characterOrMeta)?.character ?? characterOrMeta;
  const observedPower = getArmyObservedPowerValue(character);
  if (isArmyObservedPowerModeEnabled() && observedPower != null) {
    return Math.round(observedPower);
  }

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
  const observedRow = getArmyObservedPowerRow(character);
  if (isArmyObservedPowerModeEnabled() && (observedRow?.power != null || observedRow?.predictedPower != null)) {
    const current = Math.round(observedRow.power ?? observedRow.predictedPower ?? 0);
    return {
      current,
      potential: current,
      growth: 0,
      completeness: current ? 100 : 0,
      availability: {
        ...availability,
        currentReadinessScore: 100
      },
      source: observedRow?.power != null ? "observed" : "modeled",
      observedRow
    };
  }

  const basePotential = getArmyCharacterPotentialPower(character);
  const current = Math.round(basePotential * (availability.currentMultiplier / availability.potentialMultiplier));
  const potential = Math.round(basePotential);

  return {
    current,
    potential,
    growth: Math.max(0, potential - current),
    completeness: potential ? clampArmyScore((current / potential) * 100) : 0,
    availability,
    source: "estimated",
    observedRow
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

function getActiveArmyPlannerSelection() {
  if (!lastArmyPlannerResult?.armies?.length) {
    return null;
  }

  const plannerResult = lastArmyPlannerResult;
  const activeArmy = plannerResult.armies[activeArmyAlternativeIndex] ?? plannerResult.armies[0];
  if (!activeArmy) {
    return null;
  }

  return {
    plannerResult,
    activeArmy,
    powerEstimate: getArmyPowerEstimate(activeArmy),
    concept: plannerResult.concept ?? ARMY_CONCEPT_MAP[elements.armyConcept?.value] ?? ARMY_CONCEPT_DEFS[0]
  };
}

function syncArmyShareButtons(enabled) {
  if (elements.armyExportImageButton) {
    elements.armyExportImageButton.disabled = !enabled;
  }
  if (elements.armyShareImageButton) {
    elements.armyShareImageButton.disabled = !enabled;
  }
}

function buildArmyShareCardSvg(selection) {
  const width = 1200;
  const height = 720;
  const currentDate = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  const conceptLabel = selection.concept?.label ?? "バランス";
  const formationLabel = selection.activeArmy.formation?.name ?? "自動選択";
  const powerModeLabel =
    sanitizeArmyPowerMode(elements.armyPowerMode?.value ?? "standard") === "observed" ? "CSV実測優先" : "標準推定";
  const topAxes = getArmyTopAxisEntries(selection.activeArmy.scoreAxes, selection.concept, 5);
  const boardCells = [
    { x: 726, y: 162, label: "1st", unit: selection.powerEstimate.units[0] },
    { x: 582, y: 286, label: "2nd", unit: selection.powerEstimate.units[1] },
    { x: 726, y: 286, label: "3rd", unit: selection.powerEstimate.units[2] },
    { x: 870, y: 286, label: "4th", unit: selection.powerEstimate.units[3] },
    { x: 726, y: 410, label: "5th", unit: selection.powerEstimate.units[4] }
  ];
  const commanderLine = selection.activeArmy.units.map((unit) => unit.commander.name).join(" / ");
  const growthLine = selection.powerEstimate.growthTargets.length
    ? selection.powerEstimate.growthTargets
        .slice(0, 3)
        .map((entry) => `${entry.name}(${entry.unitLabel})`)
        .join(" / ")
    : "大きな育成優先候補はありません";
  const axisMarkup = topAxes
    .map((entry, index) => {
      const barWidth = Math.max(8, Math.min(280, (entry.value / 100) * 280));
      const y = 196 + index * 62;
      return `
        <text x="56" y="${y}" fill="#fff4dc" font-size="18" font-weight="700">${escapeHtml(entry.label)}</text>
        <rect x="56" y="${y + 14}" width="280" height="14" rx="7" fill="rgba(255,255,255,0.12)" />
        <rect x="56" y="${y + 14}" width="${barWidth}" height="14" rx="7" fill="${
          index === 0 ? "#e2b763" : "#8fb4c8"
        }" />
        <text x="346" y="${y + 26}" fill="#fff7ea" font-size="16" text-anchor="end">${escapeHtml(
          entry.value.toFixed(1)
        )}</text>
      `;
    })
    .join("");
  const boardMarkup = boardCells
    .map(({ x, y, label, unit }) => {
      if (!unit) {
        return `
          <rect x="${x}" y="${y}" width="126" height="92" rx="20" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
          <text x="${x + 63}" y="${y + 32}" fill="rgba(255,244,220,0.72)" font-size="16" font-weight="700" text-anchor="middle">${label}</text>
          <text x="${x + 63}" y="${y + 58}" fill="rgba(255,244,220,0.52)" font-size="14" text-anchor="middle">未配置</text>
        `;
      }

      const rowLabel = builderRowLabelFor(unit.assignedRow ?? unit.defaultRow);
      const commander = unit.commander?.name ?? unit.unitMembers?.[0]?.meta?.character?.name ?? "-";
      return `
        <rect x="${x}" y="${y}" width="126" height="92" rx="20" fill="rgba(27,52,84,0.78)" stroke="rgba(255,236,197,0.16)" />
        <text x="${x + 14}" y="${y + 24}" fill="#e7c988" font-size="14" font-weight="700">${label}</text>
        <text x="${x + 14}" y="${y + 49}" fill="#fff7ea" font-size="22" font-weight="800">${escapeHtml(commander)}</text>
        <text x="${x + 14}" y="${y + 72}" fill="rgba(255,244,220,0.82)" font-size="14">${escapeHtml(
          `${rowLabel} / ${formatArmyEstimateNumber(unit.powerEstimate.current)}`
        )}</text>
      `;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="キングダム覇道 軍勢共有カード">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#17110d" />
      <stop offset="50%" stop-color="#241912" />
      <stop offset="100%" stop-color="#34241a" />
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,252,246,0.16)" />
      <stop offset="100%" stop-color="rgba(255,252,246,0.08)" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  <circle cx="1020" cy="90" r="180" fill="rgba(226,183,99,0.10)" />
  <circle cx="180" cy="620" r="220" fill="rgba(54,90,116,0.16)" />
  <rect x="28" y="28" width="${width - 56}" height="${height - 56}" rx="30" fill="rgba(255,255,255,0.03)" stroke="rgba(255,236,197,0.12)" />

  <text x="56" y="84" fill="#e7c988" font-size="18" font-weight="700" letter-spacing="0.08em">KINGDOM HADOU AUTO ARMY</text>
  <text x="56" y="136" fill="#fff7ea" font-size="42" font-weight="800">軍勢共有カード</text>
  <text x="56" y="166" fill="rgba(255,244,220,0.78)" font-size="18">${escapeHtml(
    `${conceptLabel} / ${formationLabel} / ${powerModeLabel} / ${currentDate}`
  )}</text>

  <rect x="44" y="194" width="322" height="134" rx="24" fill="url(#panel)" stroke="rgba(255,236,197,0.12)" />
  <text x="68" y="232" fill="#fff4dc" font-size="18">現在戦力</text>
  <text x="68" y="282" fill="#fff7ea" font-size="38" font-weight="800">${escapeHtml(
    formatArmyEstimateNumber(selection.powerEstimate.current)
  )}</text>
  <text x="68" y="314" fill="rgba(255,244,220,0.74)" font-size="18">${escapeHtml(
    `最大見込み ${formatArmyEstimateNumber(selection.powerEstimate.potential)} / 総合 ${selection.activeArmy.total.toFixed(1)}`
  )}</text>

  <rect x="384" y="194" width="140" height="134" rx="24" fill="url(#panel)" stroke="rgba(255,236,197,0.12)" />
  <text x="406" y="232" fill="#fff4dc" font-size="18">候補</text>
  <text x="406" y="286" fill="#fff7ea" font-size="42" font-weight="800">${activeArmyAlternativeIndex + 1}</text>
  <text x="406" y="314" fill="rgba(255,244,220,0.74)" font-size="16">${escapeHtml(
    `${selection.plannerResult.armies.length}案中`
  )}</text>

  <text x="56" y="368" fill="#fff4dc" font-size="20" font-weight="700">主要評価軸</text>
  ${axisMarkup}

  <rect x="556" y="128" width="594" height="400" rx="28" fill="url(#panel)" stroke="rgba(255,236,197,0.12)" />
  <text x="582" y="170" fill="#fff4dc" font-size="22" font-weight="700">基本陣イメージ（十字）</text>
  <text x="582" y="198" fill="rgba(255,244,220,0.72)" font-size="16">今見ている案の5部隊主将を配置しています</text>
  <rect x="582" y="162" width="414" height="340" rx="28" fill="rgba(16,13,11,0.22)" stroke="rgba(255,236,197,0.08)" />
  <path d="M726 154 L726 510 M654 286 L942 286" stroke="rgba(255,236,197,0.08)" stroke-width="2" />
  ${boardMarkup}

  <rect x="44" y="560" width="1106" height="116" rx="24" fill="url(#panel)" stroke="rgba(255,236,197,0.12)" />
  <text x="68" y="598" fill="#fff4dc" font-size="18" font-weight="700">主将ライン</text>
  <text x="68" y="628" fill="#fff7ea" font-size="20">${escapeHtml(commanderLine)}</text>
  <text x="68" y="658" fill="rgba(255,244,220,0.74)" font-size="16">${escapeHtml(
    `育成優先: ${growthLine}`
  )}</text>
</svg>`;
}

function renderArmyShareImageBlob(svgMarkup, width, height) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    image.onload = () => {
      try {
        const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1));
        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("army-share-canvas-unavailable");
        }
        context.scale(scale, scale);
        context.drawImage(image, 0, 0, width, height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(svgUrl);
          if (blob) {
            resolve(blob);
            return;
          }
          reject(new Error("army-share-blob-failed"));
        }, "image/png");
      } catch (error) {
        URL.revokeObjectURL(svgUrl);
        reject(error);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error("army-share-image-load-failed"));
    };
    image.src = svgUrl;
  });
}

async function createArmyShareImageAsset() {
  const selection = getActiveArmyPlannerSelection();
  if (!selection) {
    throw new Error("army-share-no-selection");
  }

  const svgMarkup = buildArmyShareCardSvg(selection);
  const width = 1200;
  const height = 720;
  const blob = await renderArmyShareImageBlob(svgMarkup, width, height);
  const filename = `kingdom-hadou-army-${selection.concept?.key ?? "balanced"}-${new Date()
    .toISOString()
    .slice(0, 10)}.png`;
  return {
    selection,
    blob,
    filename
  };
}

async function exportArmyShareImage() {
  const asset = await createArmyShareImageAsset();
  const download = window.KH_APP_API?.downloadBlobFile ?? downloadBlobFile;
  download(asset.filename, asset.blob);
  window.KH_APP_API?.showStatusToast?.("軍勢カード画像を書き出しました。");
}

async function shareArmyShareImage() {
  const asset = await createArmyShareImageAsset();
  const file = new File([asset.blob], asset.filename, { type: "image/png" });
  const shareData = {
    files: [file],
    title: "キングダム覇道 軍勢共有カード",
    text: `${asset.selection.concept?.label ?? "バランス"} / ${asset.selection.activeArmy.formation?.name ?? "自動選択"}`
  };

  let canShareFiles = Boolean(navigator.share);
  if (canShareFiles && navigator.canShare) {
    try {
      canShareFiles = navigator.canShare({ files: [file] });
    } catch (error) {
      canShareFiles = false;
    }
  }

  if (canShareFiles) {
    await navigator.share(shareData);
    window.KH_APP_API?.showStatusToast?.("軍勢カード画像を共有しました。");
    return;
  }

  const download = window.KH_APP_API?.downloadBlobFile ?? downloadBlobFile;
  download(asset.filename, asset.blob);
  window.KH_APP_API?.showStatusToast?.("画像共有に未対応のため、PNGを書き出しました。");
}

function renderArmyRosterSummaryCards() {
  if (!elements.armyRosterSummaryGrid) {
    return;
  }

  const ownedCharacters = getOwnedArmyCharacters();
  const readyCharacters = getReadyArmyCharacters();
  const usingRoster = ownedCharacters.length > 0;
  const tierCounts = {
    trained: 0,
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
      detail: usingRoster
        ? `仕上がり ${readyCharacters.length} / 登録 ${ownedCharacters.length} / 25 体以上で軍勢生成`
        : "手持ち入力なし"
    },
    {
      title: "育成段階",
      body: `仕上がり ${tierCounts.trained} / 未育成 ${tierCounts.untrained}`,
      detail: usingRoster
        ? `編成候補は仕上がりのみ / 平均完成度 ${averageArmyValues(completeness).toFixed(1)} / 100`
        : "未入力"
    },
    {
      title: "装備状態",
      body: `適正装備 ${equipmentCounts.matched} / 装備なし ${equipmentCounts.none} / 噛み合い薄 ${equipmentCounts.mismatched}`,
      detail: `新規選択の初期値: ${getArmyProfileLabel(
        ARMY_INVESTMENT_TIER_DEFS,
        armyRosterState.defaultInvestmentTier
      )} / ${getArmyProfileLabel(ARMY_EQUIPMENT_FIT_DEFS, armyRosterState.defaultEquipmentFit)}`
    },
    {
      title: "CSV実測戦力",
      body: armyObservedPowerState.matchedCount
        ? `${armyObservedPowerState.matchedCount} 体の現在値を戦力集計へ使えます。`
        : "まだ実測CSVは未入力です。必要なら現在値を貼り付けて戦力最大編成に切り替えられます。",
      detail: armyObservedPowerState.matchedCount
        ? `一致 ${armyObservedPowerState.matchedCount}/${armyObservedPowerState.rowCount} / モード ${
            ARMY_POWER_MODE_DEFS.find((entry) => entry.key === sanitizeArmyPowerMode(armyObservedPowerState.mode))?.label ?? "標準推定"
          }`
        : "CSV未読込",
      extra: armyObservedPowerState.model
        ? `R^2 ${armyObservedPowerState.model.rSquared.toFixed(3)} / MAE ${armyObservedPowerState.model.mae.toFixed(1)}`
        : "戦力列付きの行が8体以上あると推定式を計算します。"
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

  const keyword = elements.armyRosterSearch?.value ?? "";
  const filtered = preparedCharacters.filter((character) => !keyword || keywordMatches(character.searchText, keyword));

  if (!filtered.length) {
    elements.armyRosterGrid.innerHTML = renderEmptyState("検索に一致する武将がいません。");
    return;
  }

  elements.armyRosterGrid.innerHTML = filtered
    .map((character) => {
      const profile = getArmyRosterProfile(character.id);
      const isOwned = profile.owned;
      const statusLabel = isOwned
        ? getArmyProfileLabel(ARMY_INVESTMENT_TIER_DEFS, profile.investmentTier)
        : "未選択";
      const stateClass = isOwned ? `is-tier-${profile.investmentTier}` : "is-tier-unselected";

      return `
        <button
          class="army-roster-card ${isOwned ? "is-owned" : ""} ${stateClass}"
          type="button"
          data-army-roster-toggle="${character.id}"
          aria-pressed="${isOwned ? "true" : "false"}"
          aria-label="${escapeHtml(`${character.name} ${statusLabel}`)}"
          title="${escapeHtml(`${character.name} / ${statusLabel}`)}"
        >
          <img src="${escapeHtml(character.imageUrl)}" alt="${escapeHtml(character.name)}" loading="lazy" />
          <span class="army-roster-rarity-badge">${escapeHtml(character.rarity)}</span>
          <span class="army-roster-state-badge">${escapeHtml(statusLabel)}</span>
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
      "手持ち武将を選ぶと、ここで仕上がり / 未育成 と装備状態を個別入力できます。"
    );
    return;
  }

  elements.armyOwnedSettings.innerHTML = ownedCharacters
    .map((character) => {
      const profile = getArmyRosterProfile(character.id);
      const snapshot = getArmyCharacterPowerSnapshot(character);
      const observedRow = getArmyObservedPowerRow(character);
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
            ${
              observedRow
                ? `CSV現在値 ${formatArmyEstimateNumber(observedRow.power ?? observedRow.predictedPower ?? 0)} / Lv ${
                    observedRow.level ?? "-"
                  } / 秘伝 ${observedRow.secret ?? 0}`
                : `推定現在戦力 ${formatArmyEstimateNumber(snapshot.current)} / 最大見込み ${formatArmyEstimateNumber(
                    snapshot.potential
                  )} / 伸び幅 ${formatArmyEstimateNumber(snapshot.growth)}`
            }
          </p>
        </article>
      `;
    })
    .join("");
}

function renderArmyRosterUi() {
  renderArmyPowerImportUi();
  renderArmyRosterSummaryCards();
  renderArmyRosterGrid();
  renderArmyOwnedSettings();
  renderArmyPlannerFloatingUi(lastArmyPlannerResult);
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

  armyRebuildTimer = window.setTimeout(rerender, 180);
}

function getArmyMixedObjectiveScore(meta, objectiveMix, concept = null) {
  const seasonFocus = getArmySeasonFocusConfig("s3", concept);
  const fallbackScores = getArmyObjectiveFallbackScores(meta.character, meta.roleTags);
  return Object.entries(objectiveMix).reduce((sum, [objectiveKey, weight]) => {
    const seasonValue = meta.character.season3?.objectiveScores?.[objectiveKey];
    const fallbackValue = fallbackScores[objectiveKey] ?? meta.objectiveScores[objectiveKey] ?? 0;
    const blend = seasonValue == null ? 0 : seasonFocus.objectiveBlend ?? 0.54;
    const value = seasonValue == null ? fallbackValue : seasonValue * blend + fallbackValue * (1 - blend);
    return sum + value * weight;
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
    getArmyMixedObjectiveScore(meta, concept.objectiveMix, concept) * 0.46 +
      (featureScore / featureMax) * 100 * 0.28 +
      (tagScore / tagMax) * 100 * 0.26
  );
}

function getArmySlotBaseScore(meta, slotKey, concept) {
  const seasonFocus = getArmySeasonFocusConfig("s3", concept);
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
    const storedWeight = stored == null ? 0 : 0.42 * (seasonFocus.slotStoredWeight ?? 1);
    const commanderBias = concept.commanderTypeBias?.[meta.character.type] ?? 0;
    const positionPotential = getArmySlotPositionPotential(meta, slotKey);
    rawScore = clampArmyScore(
      (stored ?? 0) * storedWeight +
        getArmyConceptAffinity(meta, concept) * 0.2 +
        positionPotential.score * 0.12 +
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
    const storedWeight = stored == null ? 0 : 0.34 * (seasonFocus.slotStoredWeight ?? 1);
    const positionPotential = getArmySlotPositionPotential(meta, slotKey);
    rawScore = clampArmyScore(
      (stored ?? 0) * storedWeight +
        getArmyConceptAffinity(meta, concept) * 0.22 +
        positionPotential.score * 0.1 +
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
  const storedWeight = stored == null ? 0 : 0.34 * (seasonFocus.slotStoredWeight ?? 1);
  const srAideBonus = meta.character.rarity === "SR" ? 4 : 0;
  const powerSnapshot = getArmyCharacterPowerSnapshot(meta);
  const powerNowScore = clampArmyScore(
    (powerSnapshot.current / Math.max(getArmyReferenceUnitPower() * 0.3, 1)) * 100
  );
  const skillActivation = getArmyActiveSkillRatio(
    meta.character,
    "aide1",
    meta.positionProfile?.dominantRow ?? "middle"
  );
  const nonTacticScore = clampArmyScore(
    meta.groupScores.support * 0.34 +
      meta.groupScores.defense * 0.22 +
      meta.groupScores.control * 0.14 +
      powerNowScore * 0.18 +
      skillActivation * 0.12
  );
  rawScore = clampArmyScore(
    (stored ?? 0) * Math.min(storedWeight, 0.24) +
      getArmyConceptAffinity(meta, concept) * 0.08 +
      nonTacticScore * 0.42 +
      powerNowScore * 0.1 +
      skillActivation * 0.08 +
      rarityBase * 0.03 +
      tenpuRatio * 0.05 +
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

function getArmyManualGuidePairBonus(leftCharacter, rightCharacter) {
  if (!leftCharacter || !rightCharacter) {
    return 0;
  }

  const names = new Set([leftCharacter.name, rightCharacter.name]);
  let bonus = 0;

  if (names.has("桓騎") && (names.has("李牧") || names.has("王翦"))) {
    bonus += 0.9;
  }
  if (names.has("張唐") && (names.has("汗明") || names.has("臨武君"))) {
    bonus += 0.8;
  }
  if (names.has("張唐") && names.has("信(臨時千人将)")) {
    bonus += 0.7;
  }

  return bonus;
}

function getArmyManualGuideSlotBonus(commander, slotLabel, targetCharacter) {
  if (!commander || !targetCharacter) {
    return 0;
  }

  const slotKey = normalizeArmyGuideSlotKey(slotLabel);
  let bonus = 0;

  if (targetCharacter.name === "桓騎" && slotKey.startsWith("vice") && ["李牧", "王翦"].includes(commander.name)) {
    bonus += 1.4;
  }
  if (targetCharacter.name === "張唐" && slotKey.startsWith("vice") && ["汗明", "臨武君"].includes(commander.name)) {
    bonus += 1.25;
  }
  if (targetCharacter.name === "張唐" && slotKey.startsWith("aide") && commander.name === "信(臨時千人将)") {
    bonus += 1.1;
  }

  return bonus;
}

function getArmyGuideBonus(commanderMeta, targetMeta, slotLabel) {
  const pairBonus =
    (getArmyGuidePairScore(commanderMeta.character, targetMeta.character) +
      getArmyManualGuidePairBonus(commanderMeta.character, targetMeta.character)) *
    10;
  const slotBonus =
    (getArmyGuideSlotScore(commanderMeta.character, slotLabel, targetMeta.character) +
      getArmyManualGuideSlotBonus(commanderMeta.character, slotLabel, targetMeta.character)) *
    18;
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
  const positionPotential = getArmySlotPositionPotential(viceMeta, slotKey);

  return {
    score: clampArmyScore(
      getArmySlotBaseScore(viceMeta, slotKey, concept) * 0.44 +
        chainScore * 0.24 +
        getArmyConceptAffinity(viceMeta, concept) * 0.16 +
        positionPotential.score * 0.08 +
        guideBonus * 0.04 +
        supportScore * 0.12
    ),
    chainStats,
    guideBonus,
    supportScore,
    positionPotential
  };
}

function getArmyNewRoleCount(existingTags, incomingTags) {
  return incomingTags.filter((tag) => !existingTags.has(tag)).length;
}

function getArmySkillTextBlob(skill) {
  return [skill?.name, skill?.summary, skill?.initialEffect, skill?.maxEffect].filter(Boolean).join(" ");
}

function getArmyCharacterSkillCorpus(character) {
  return [
    character?.battleArtText,
    character?.battleArtMeta?.name,
    ...(character?.battleArtMeta?.tags ?? []),
    ...(character?.featureTags ?? []),
    ...(character?.personalities ?? []),
    ...(character?.skillRecords ?? []).flatMap((skill) => [
      skill?.name,
      skill?.summary,
      skill?.initialEffect,
      skill?.maxEffect
    ])
  ]
    .filter(Boolean)
    .join(" ");
}

function getArmyVideoPackageLabel(packageKey) {
  return ARMY_VIDEO_SKILL_PACKAGE_DEFS.find((entry) => entry.key === packageKey)?.label ?? packageKey;
}

function getArmyCharacterVideoPackages(character, roleTags = getArmyRoleTags(character)) {
  const corpus = getArmyCharacterSkillCorpus(character);
  const roleSet = new Set(roleTags);
  const packages = new Set();

  ARMY_VIDEO_SKILL_PACKAGE_DEFS.forEach((entry) => {
    if (entry.pattern.test(corpus)) {
      packages.add(entry.key);
    }
  });

  if (
    roleSet.has("role.burst-commander") ||
    roleSet.has("role.siege-breaker") ||
    roleSet.has("tempo.attack-speed-up")
  ) {
    packages.add("burst");
  }
  if (
    roleSet.has("role.flex-support") ||
    roleSet.has("support.heal") ||
    roleSet.has("support.cleanse")
  ) {
    packages.add("support");
  }
  if (
    roleSet.has("role.disruptor") ||
    roleSet.has("control.fear") ||
    roleSet.has("control.buff-strip") ||
    roleSet.has("control.dot") ||
    roleSet.has("tempo.attack-speed-down")
  ) {
    packages.add("control");
  }
  if (roleSet.has("support.cleanse")) {
    packages.add("cleanse");
  }
  if (
    roleSet.has("role.frontline-anchor") ||
    roleSet.has("def.damage-cut") ||
    roleSet.has("def.debuff-immunity") ||
    roleSet.has("support.heal")
  ) {
    packages.add("durable");
  }

  return [...packages];
}

function getArmyUnitVideoTheoryProfile(unitMembers, commanderMeta, concept) {
  const seasonFocus = getArmySeasonFocusConfig("s3", concept);
  const s2ReferencePriority = seasonFocus.referenceMix?.s2 ?? 0;
  const commonReferencePriority = seasonFocus.referenceMix?.common ?? 0;
  const s3Priority = Math.max(0.55, 1 - s2ReferencePriority - commonReferencePriority);
  const memberProfiles = unitMembers.map((member) => ({
    ...member,
    chainStats:
      member.chainStats ??
      (member.slotKey.startsWith("vice") ? getChainStats(commanderMeta.character, member.meta.character) : null),
    videoPackages: getArmyCharacterVideoPackages(member.meta.character, member.meta.roleTags)
  }));
  const viceProfiles = memberProfiles.filter((member) => member.slotKey.startsWith("vice"));
  const aideProfiles = memberProfiles.filter((member) => member.slotKey.startsWith("aide"));
  const commanderPackages = new Set(
    memberProfiles.find((member) => member.slotKey === "commander")?.videoPackages ?? []
  );
  const packageCounts = memberProfiles.reduce((result, member) => {
    member.videoPackages.forEach((packageKey) => {
      result[packageKey] = (result[packageKey] ?? 0) + 1;
    });
    return result;
  }, {});
  const packageKeys = Object.keys(packageCounts).sort((left, right) => {
    return (packageCounts[right] ?? 0) - (packageCounts[left] ?? 0);
  });
  const packageSet = new Set(packageKeys);
  const chainRateScore = clampArmyScore(
    averageArmyValues(viceProfiles.map((member) => normalizeChainRate(member.chainStats?.rate)))
  );
  const personalityScore = clampArmyScore(
    averageArmyValues(
      viceProfiles.map((member) =>
        clampArmyScore((member.chainStats?.shared?.length ?? 0) * 24 + (member.chainStats?.bonus ?? 0) * 1.2)
      )
    )
  );
  const linkScore = clampArmyScore(
    averageArmyValues([
      ...viceProfiles.map((member) => getArmyTacticSupportScore(commanderMeta, member.meta, member.slotKey)),
      ...aideProfiles.map((member) => member.slotBaseScore ?? 50)
    ])
  );
  const commanderOverlap = clampArmyScore(
    averageArmyValues(
      memberProfiles
        .filter((member) => member.slotKey !== "commander")
        .map((member) => {
          const sharedCount = member.videoPackages.filter((packageKey) => commanderPackages.has(packageKey)).length;
          if (!commanderPackages.size) {
            return sharedCount ? 100 : 54;
          }
          return (sharedCount / commanderPackages.size) * 100;
        })
    )
  );

  let commanderPlanScore = clampArmyScore(34 + commanderOverlap * 0.5 + linkScore * 0.2);
  if (commanderPackages.has("burst")) {
    commanderPlanScore += (packageSet.has("support") ? 14 : 0) + (packageSet.has("control") ? 10 : 0) + (packageSet.has("troop") ? 8 : 0);
  }
  if (commanderPackages.has("control")) {
    commanderPlanScore += (packageSet.has("burst") ? 14 : 0) + (packageSet.has("support") ? 10 : 0);
  }
  if (commanderPackages.has("support")) {
    commanderPlanScore += (packageSet.has("burst") ? 12 : 0) + (packageSet.has("durable") ? 10 : 0);
  }
  commanderPlanScore = clampArmyScore(commanderPlanScore);

  let packageScore = 28;
  packageScore += packageSet.has("burst") ? 18 : 0;
  packageScore += packageSet.has("support") ? 18 : 0;
  packageScore += packageSet.has("durable") ? 14 : 0;
  packageScore += packageSet.has("control") ? 12 : 0;
  packageScore += packageSet.has("troop") ? 10 : 0;
  packageScore += packageSet.has("cleanse") ? 8 : 0;
  packageScore += packageSet.has("burst") && packageSet.has("support") ? 8 : 0;
  packageScore += packageSet.has("control") && packageSet.has("support") ? 6 : 0;
  packageScore += Math.min(packageCounts.support ?? 0, 2) * (4 + s3Priority * 2 + commonReferencePriority * 1);
  packageScore += Math.min(packageCounts.control ?? 0, 2) * (3 + s3Priority * 3 + s2ReferencePriority * 1);
  packageScore += Math.min(packageCounts.durable ?? 0, 2) * (2 + s3Priority * 2);
  packageScore += Math.min(packageCounts.burst ?? 0, 2) * (2 + s2ReferencePriority * 4 + commonReferencePriority * 1);
  packageScore += packageSet.has("troop") ? s2ReferencePriority * 8 : 0;
  packageScore = clampArmyScore(packageScore);
  const densityScore = clampArmyScore(
    Math.min(packageCounts.support ?? 0, 2) * 18 +
      Math.min(packageCounts.control ?? 0, 2) * 18 +
      Math.min(packageCounts.durable ?? 0, 2) * 14 +
      Math.min(
        aideProfiles.filter((member) =>
          member.videoPackages.some((packageKey) =>
            ["support", "control", "durable", "cleanse", "troop"].includes(packageKey)
          )
        ).length,
        2
      ) *
        12 +
      (packageSet.has("cleanse") ? 8 : 0) +
      (packageSet.has("support") && packageSet.has("control") ? 8 : 0)
  );

  const openerScore = clampArmyScore(
    getArmyTempoOrderValue(commanderMeta.character, concept) * 0.4 +
      averageArmyValues(viceProfiles.map((member) => getArmyTempoOrderValue(member.meta.character, concept))) * 0.26 +
      chainRateScore * 0.18 +
      (packageSet.has("control") ? 10 : 0) +
      (packageSet.has("burst") ? 10 : 0) +
      (packageSet.has("troop") ? s2ReferencePriority * 8 : 0)
  );

  const weights = {
    commander: 0.24 - s2ReferencePriority * 0.02,
    chain: 0.13 + commonReferencePriority * 0.02 + s2ReferencePriority * 0.01,
    personality: 0.08,
    link: 0.14 - s2ReferencePriority * 0.02,
    package: 0.18,
    opener: 0.11 + s2ReferencePriority * 0.05 + commonReferencePriority * 0.01,
    density: 0.12 + s3Priority * 0.02
  };
  const score = clampArmyScore(
    commanderPlanScore * weights.commander +
      chainRateScore * weights.chain +
      personalityScore * weights.personality +
      linkScore * weights.link +
      packageScore * weights.package +
      openerScore * weights.opener +
      densityScore * weights.density
  );
  const focusTags = [
    commanderPlanScore >= 62 ? "主将中心" : "",
    chainRateScore >= 58 ? "連鎖" : "",
    packageScore >= 62 ? "技能噛み合い" : "",
    densityScore >= 60 ? "S3密度" : "",
    openerScore >= 60 ? "初動" : ""
  ].filter(Boolean);
  const warnings = [
    commanderPlanScore < 54 ? "主将起点が弱め" : "",
    chainRateScore < 50 ? "副将連鎖が弱め" : "",
    !packageSet.has("support") ? "支援不足" : "",
    !packageSet.has("burst") ? "火力不足" : "",
    densityScore < 56 ? "支援/妨害/継戦が薄い" : "",
    s2ReferencePriority >= 0.12 && openerScore < 56 ? "S2参照だと初動20秒が弱め" : "",
    s3Priority >= 0.72 && !packageSet.has("control") ? "S3向け妨害密度が不足" : ""
  ].filter(Boolean);

  return {
    score,
    packages: packageKeys,
    commanderPackages: [...commanderPackages],
    focusText: focusTags.join(" / ") || "主将起点は弱め",
    summaryText: `${commanderMeta.character.name}起点 / 連鎖 ${chainRateScore.toFixed(0)} / S3密度 ${densityScore.toFixed(0)}`,
    warningText: warnings.join(" / "),
    packageText: packageKeys.length
      ? packageKeys.map((packageKey) => `${getArmyVideoPackageLabel(packageKey)}x${packageCounts[packageKey]}`).join(" / ")
      : "汎用寄り",
    chainRateScore,
    commanderPlanScore,
    openerScore,
    densityScore
  };
}

function getArmySkillOverlapImpact(unitCore, aideMeta) {
  const coreSkillMap = new Map();
  unitCore.forEach((meta) => {
    (meta.character.skillRecords ?? []).forEach((skill) => {
      coreSkillMap.set(skill.name, getArmySkillTextBlob(skill));
    });
  });

  const overlaps = (aideMeta.character.skillRecords ?? []).filter((skill) => coreSkillMap.has(skill.name));
  let positive = 0;
  let negative = 0;

  overlaps.forEach((skill) => {
    const text = `${coreSkillMap.get(skill.name) ?? ""} ${getArmySkillTextBlob(skill)}`;
    if (/(被ダメ|軽減|回復|弱化解除|強化解除|恐怖|攻速|対物|反撃|デバフ無効|堅固)/u.test(text)) {
      positive += 12;
      return;
    }
    if (/(攻撃|防御|戦威|策略).*(上昇|増加)|会心/u.test(text)) {
      positive += 6;
      return;
    }
    negative += 4;
  });

  return {
    count: overlaps.length,
    positive,
    negative,
    net: positive - negative
  };
}

function getArmyAideFitness(unitCore, aideMeta, concept, slotKey) {
  const unitTags = new Set(unitCore.flatMap((meta) => meta.roleTags));
  const newRoleCount = getArmyNewRoleCount(unitTags, aideMeta.roleTags);
  const guideBonus = getArmyGuideBonus(unitCore[0], aideMeta, slotKey === "aide1" ? "補佐1" : "補佐2");
  const duplicateSkills = getArmySkillOverlapImpact(unitCore, aideMeta);
  const powerSnapshot = getArmyCharacterPowerSnapshot(aideMeta);
  const powerNowScore = clampArmyScore(
    (powerSnapshot.current / Math.max(getArmyReferenceUnitPower() * 0.3, 1)) * 100
  );
  const skillActivation = getArmyActiveSkillRatio(
    aideMeta.character,
    slotKey,
    aideMeta.positionProfile?.dominantRow ?? unitCore[0]?.positionProfile?.dominantRow ?? "middle"
  );
  const nonTacticValue = clampArmyScore(
    powerNowScore * 0.4 +
      skillActivation * 0.24 +
      aideMeta.groupScores.support * 0.2 +
      aideMeta.groupScores.defense * 0.1 +
      aideMeta.groupScores.control * 0.06
  );
  const supportMatch = clampArmyScore(
    (aideMeta.roleTagSet.has("role.flex-support") ? 26 : 0) +
      (aideMeta.roleTagSet.has("support.heal") ? 22 : 0) +
      (aideMeta.roleTagSet.has("support.cleanse") ? 18 : 0) +
      (aideMeta.roleTagSet.has("def.damage-cut") ? 14 : 0) +
      newRoleCount * 8 +
      duplicateSkills.net
  );

  return {
    score: clampArmyScore(
      getArmySlotBaseScore(aideMeta, slotKey, concept) * 0.38 +
        getArmyConceptAffinity(aideMeta, concept) * 0.08 +
        supportMatch * 0.2 +
        nonTacticValue * 0.22 +
        powerNowScore * 0.08 +
        skillActivation * 0.04 +
        guideBonus * 0.04
    ),
    guideBonus,
    duplicateSkills,
    supportMatch,
    powerNowScore,
    skillActivation,
    nonTacticValue
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

function getArmySlotPositionPotential(meta, slotKey, preferredRow = "") {
  const rowKey = preferredRow || meta.positionProfile?.dominantRow || "middle";
  const rowScore = meta.rowScores?.[rowKey] ?? 50;
  const activation = getArmyActiveSkillRatio(meta.character, slotKey, rowKey);
  const text = [
    meta.character.battleArtText ?? "",
    ...(meta.character.battleArtEffects ?? []),
    ...(meta.character.guide?.evaluationPoints ?? []),
    ...(meta.character.guide?.latestFormation?.focusTitles ?? [])
  ]
    .filter(Boolean)
    .join(" ");
  const rowLabel = builderRowLabelFor(rowKey);
  let specialBonus = 0;

  if (!slotKey.startsWith("aide") && new RegExp(`${rowLabel}にいる場合[^。]*?(軍勢全体|全体に付与)`, "u").test(text)) {
    specialBonus += 12;
  }
  if (new RegExp(`${rowLabel}にいる場合[^。]*?(効果上昇|威力上昇|効果最大)`, "u").test(text)) {
    specialBonus += slotKey.startsWith("aide") ? 4 : 8;
  }

  return {
    rowKey,
    rowScore,
    activation,
    score: clampArmyScore(rowScore * 0.58 + activation * 0.32 + specialBonus)
  };
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

function getArmyTimelineCoverage(effect, fromSecond, toSecond) {
  return Math.max(0, Math.min(effect.endSecond, toSecond) - Math.max(effect.startSecond, fromSecond));
}

function getArmyDefaultFormationContext(unit, concept) {
  const formation = FORMATION_MAP[getConceptRecommendedFormationKey(concept)] ?? FORMATION_DEFS[0];
  const preferred = keepTopArmyEntries(
    formation.slots.map((slot) => ({
      slotKey: slot.key,
      score:
        (unit.rowScores?.[slot.rowKey] ?? unit.rowScores?.[unit.defaultRow] ?? 50) * 0.76 +
        getArmyFormationSlotTempoBias(slot.key, formation) * 24
    })),
    1
  )[0];

  return {
    formation,
    formationSlotKey: preferred?.slotKey ?? formation.slots[0]?.key ?? "first"
  };
}

function buildArmyUnitTimelineEntries(unit, formation, formationSlotKey) {
  return unit.unitMembers
    .filter((member) => ["commander", "vice1", "vice2"].includes(member.slotKey))
    .map((member) => {
      const character = member.meta.character;
      const orderScore =
        TACTIC_ORDER_SCORES[member.slotKey]?.[character.battleArtMeta?.chainOrder ?? "普通"] ?? 4;
      const entry = {
        key: member.slotKey,
        label: member.label,
        character,
        chainStats: member.chainStats,
        orderScore
      };

      return {
        ...entry,
        ...buildBuilderTimelineWindows(entry, formation, formationSlotKey)
      };
    });
}

function clampArmyTimelinePreviewSecond(value) {
  const maxSecond = Number.isFinite(ARMY_TIMELINE_MAX_SECOND) ? ARMY_TIMELINE_MAX_SECOND : 60;
  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : ARMY_TIMELINE_DEFAULT_SECOND;
  return Math.max(0, Math.min(maxSecond, safeValue));
}

function getArmyDefaultTimelineTargetSlotKey(formation) {
  return formation?.slots?.[2]?.key ?? formation?.slots?.[0]?.key ?? "third";
}

function resetArmyBattlePreviewState() {
  activeArmyUnitIndex = 0;
  activeArmyPreviewSecond = clampArmyTimelinePreviewSecond(ARMY_TIMELINE_DEFAULT_SECOND);
  activeArmyPreviewGroupId = null;
  activeArmyTargetSlotKey = null;
}

function buildArmyTimelineTriggerGroups(timelineEntries, formation, formationSlotKey, targetSlotKey) {
  const sourceOrderMap = {
    commander: 0,
    vice1: 1,
    vice2: 2
  };

  return timelineEntries
    .flatMap((entry) => {
      const triggerSeconds = uniqueValues(entry.windows.map((effect) => effect.startSecond)).sort((left, right) => left - right);
      return triggerSeconds.map((triggerSecond, cycleIndex) => {
        const effects = entry.windows
          .filter((effect) => effect.startSecond === triggerSecond)
          .map((effect) => ({
            ...effect,
            clippedStart: Math.max(0, Math.min(ARMY_TIMELINE_MAX_SECOND, effect.startSecond)),
            clippedEnd: Math.max(0, Math.min(ARMY_TIMELINE_MAX_SECOND, effect.endSecond)),
            targetSlotKeys: resolveBuilderEffectTargetSlots(effect, formation, formationSlotKey, targetSlotKey)
          }))
          .filter((effect) => effect.clippedEnd > effect.clippedStart)
          .sort(compareBuilderEffects);

        if (!effects.length) {
          return null;
        }

        const startSecond = effects[0].clippedStart;
        const endSecond = effects.reduce((maxSecond, effect) => Math.max(maxSecond, effect.clippedEnd), startSecond);
        const tone = getBuilderTimelinePrimaryTone(effects);
        const targetLabels = uniqueValues(
          effects.flatMap((effect) => effect.targetSlotKeys.map((slotKey) => formationSlotLabelFor(slotKey)))
        );

        return {
          id: `army-trigger-${entry.key}-${entry.character.id}-${triggerSecond}-${cycleIndex}`,
          entryKey: entry.key,
          sourceLabel: entry.label,
          characterName: entry.character.name,
          battleArtName: entry.character.battleArtName || entry.character.name,
          battleArtType: entry.character.battleArtMeta?.type || "",
          activationRate: getBuilderActivationRateForEntry(entry),
          triggerSecond,
          previewSecond: clampArmyTimelinePreviewSecond(triggerSecond),
          startSecond,
          endSecond,
          estimated: effects.some((effect) => effect.estimated),
          tone,
          effectCount: effects.length,
          effects,
          targetLabels,
          summaryText: uniqueValues(effects.map((effect) => effect.shortLabel)).join(" / "),
          sortOrder:
            triggerSecond * 10 +
            (sourceOrderMap[entry.key] ?? 9) +
            (effects[0].side === "enemy" ? 0.1 : 0)
        };
      });
    })
    .filter(Boolean)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.characterName.localeCompare(right.characterName, "ja"));
}

function pickArmyTimelineSelectedGroup(timelineGroups, previewSecond) {
  if (!timelineGroups.length) {
    return null;
  }

  const explicitGroup = timelineGroups.find((group) => group.id === activeArmyPreviewGroupId);
  if (explicitGroup) {
    return explicitGroup;
  }

  const activeGroups = timelineGroups
    .filter(
      (group) =>
        previewSecond >= group.startSecond &&
        (previewSecond < group.endSecond ||
          (group.endSecond === ARMY_TIMELINE_MAX_SECOND && previewSecond === ARMY_TIMELINE_MAX_SECOND))
    )
    .sort((left, right) => left.triggerSecond - right.triggerSecond || right.effectCount - left.effectCount);
  if (activeGroups.length) {
    return activeGroups[0];
  }

  const futureGroup = timelineGroups.find((group) => group.triggerSecond >= previewSecond);
  return futureGroup ?? timelineGroups[timelineGroups.length - 1];
}

function getArmyTimelineGroupMetaLabel(group) {
  return [
    `${group.triggerSecond}秒`,
    group.sourceLabel === "主将" ? "100%" : formatPercent(group.activationRate),
    group.estimated ? "推定含む" : "確定"
  ].join(" / ");
}

function getArmyTimelineEffectBadgeLabel(effect) {
  if (effect.kind === "damage") {
    return "ダメ";
  }
  if (effect.kind === "debuff") {
    return "弱化";
  }
  if (effect.kind === "heal") {
    return "回復";
  }
  if (effect.kind === "utility") {
    return "補助";
  }
  return "強化";
}

function formatArmyTimelineEffectSummary(effect) {
  const percentMatch = `${effect.text ?? ""}`.match(/(-?\d+(?:\.\d+)?)\s*[％%]/u);
  const percentText = percentMatch ? `${percentMatch[1]}%` : "";
  const durationText = effect.kind === "damage" ? "即時" : `${Math.max(1, effect.clippedEnd - effect.clippedStart)}秒`;
  const targetText = effect.targetSlotKeys?.length
    ? effect.targetSlotKeys.map((slotKey) => formationSlotLabelFor(slotKey)).join(" / ")
    : getBuilderEffectScopeLabel(effect);

  return {
    badge: getArmyTimelineEffectBadgeLabel(effect),
    main: [effect.shortLabel, percentText, durationText].filter(Boolean).join(" "),
    sub: `${effect.side === "ally" ? "味方" : "敵"} / ${getBuilderEffectScopeLabel(effect)} / ${targetText}`,
    raw: effect.text
  };
}

function renderArmyTimelineLikeReference(state) {
  if (!state.commander) {
    return renderEmptyState("主将を選ぶと、戦法の流れをここに表示します。");
  }

  if (!state.timelineGroups.length) {
    return renderEmptyState("戦法を表示できる武将がまだ選ばれていません。");
  }

  const axisMarkup = Array.from(
    { length: ARMY_TIMELINE_MAX_SECOND / 10 + 1 },
    (_, index) => `<span>${index * 10}s</span>`
  ).join("");

  const rowMarkup = state.timelineGroups
    .map((group) => {
      const isSelected = state.selectedGroup?.id === group.id;
      const isCurrent =
        state.previewSecond >= group.startSecond &&
        (state.previewSecond < group.endSecond ||
          (group.endSecond === ARMY_TIMELINE_MAX_SECOND && state.previewSecond === ARMY_TIMELINE_MAX_SECOND));
      const barMarkup = group.effects
        .map(
          (effect, index) => `
            <button
              type="button"
              class="army-ref-track-bar tone-${escapeHtml(effect.tone || "utility")} ${effect.estimated ? "is-estimated" : ""}"
              style="--start:${effect.clippedStart}; --end:${effect.clippedEnd}; --lane:${index}"
              title="${escapeHtml(`${effect.shortLabel} / ${effect.text}`)}"
              data-army-preview-second="${group.previewSecond}"
              data-army-select-group="${escapeHtml(group.id)}"
            >
              <span class="army-ref-track-bar-label">${escapeHtml(effect.shortLabel)}</span>
              <small>${escapeHtml(formatArmyTimelineEffectSummary(effect).badge)}</small>
            </button>
          `
        )
        .join("");
      const noteMarkup = group.effects
        .map((effect) => {
          const summary = formatArmyTimelineEffectSummary(effect);
          return `
            <span class="army-ref-note tone-${escapeHtml(effect.tone || "utility")}">
              <strong>${escapeHtml(summary.main)}</strong>
              <small>${escapeHtml(summary.sub)}</small>
            </span>
          `;
        })
        .join("");

      return `
        <button
          type="button"
          class="army-ref-row ${isSelected ? "is-selected" : ""} ${isCurrent ? "is-current" : ""}"
          data-army-preview-second="${group.previewSecond}"
          data-army-select-group="${escapeHtml(group.id)}"
        >
          <div class="army-ref-row-head">
            <div class="army-ref-row-title">
              <div class="army-ref-source-line">
                <span class="army-ref-source-badge">${escapeHtml(group.sourceLabel)}</span>
                ${group.battleArtType ? `<span class="army-ref-type-chip">${escapeHtml(group.battleArtType)}</span>` : ""}
                <span class="army-ref-meta-text">${escapeHtml(group.characterName)}</span>
              </div>
              <strong class="army-ref-tactic-name">${escapeHtml(group.battleArtName)}</strong>
            </div>
            <div class="army-ref-row-meta">
              <span>${escapeHtml(getArmyTimelineGroupMetaLabel(group))}</span>
              <span>${escapeHtml(group.targetLabels.join(" / ") || "対象なし")}</span>
            </div>
          </div>
          <div class="army-ref-track" style="--lanes:${Math.max(group.effects.length, 1)}">
            ${barMarkup}
            <div class="army-ref-now" style="--at:${state.previewSecond}"></div>
          </div>
          <div class="army-ref-row-notes">${noteMarkup}</div>
        </button>
      `;
    })
    .join("");

  return `
    <div class="army-ref-shell">
      <div class="army-ref-axis">${axisMarkup}</div>
      <div class="army-ref-list">${rowMarkup}</div>
    </div>
  `;
}

function renderArmyBattleBoardPanel(title, caption, cells, side) {
  return `
    <article class="army-ref-faction ${side === "ally" ? "is-ally" : "is-enemy"}">
      <div class="army-ref-faction-head">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(caption)}</span>
      </div>
      <div class="army-ref-grid">
        ${cells
          .map((cell) => {
            const classes = [
              "army-ref-cell",
              cell.occupied ? "is-occupied" : "is-empty",
              cell.isSelf ? "is-self" : "",
              cell.isTarget ? "is-target" : "",
              cell.effectSummary ? `tone-${cell.tone || "utility"}` : ""
            ]
              .filter(Boolean)
              .join(" ");

            return `
              <div class="${classes}">
                ${
                  side === "enemy" && cell.slotKey
                    ? `<button type="button" data-army-target-slot="${escapeHtml(cell.slotKey)}" aria-label="${escapeHtml(`${cell.slotLabel}を基準敵にする`)}"></button>`
                    : ""
                }
                ${
                  cell.occupied
                    ? `
                      <div class="army-ref-cell-slot">${escapeHtml(cell.slotLabel)}</div>
                      <div class="army-ref-cell-title">${escapeHtml(cell.displayTitle || cell.slotLabel || "")}</div>
                      <div class="army-ref-cell-note">${escapeHtml(cell.displayNote || cell.rowLabel || "")}</div>
                      <div class="army-ref-cell-effect">${escapeHtml(cell.effectSummary || "効果なし")}</div>
                    `
                    : `<div class="army-ref-cell-empty">空き</div>`
                }
              </div>
            `;
          })
          .join("")}
      </div>
    </article>
  `;
}

function renderArmyBoardLikeReference(state) {
  const selectedGroup = state.selectedGroup;
  const headTitle = selectedGroup
    ? `${selectedGroup.characterName}「${selectedGroup.battleArtName}」`
    : `${state.previewSecond}秒時点`;
  const headMeta = selectedGroup
    ? `${selectedGroup.triggerSecond}秒発動 / 基準敵 ${formationSlotLabelFor(state.targetSlotKey)}`
    : `基準敵 ${formationSlotLabelFor(state.targetSlotKey)}`;

  return `
    <div class="army-ref-board-shell">
      <div class="army-ref-board-head">
        <strong>${escapeHtml(headTitle)}</strong>
        <span>${escapeHtml(headMeta)}</span>
      </div>
      <div class="army-ref-board-duo">
        ${renderArmyBattleBoardPanel("味方", "戦法対象マス", state.boardCells.allyCells, "ally")}
        ${renderArmyBattleBoardPanel("敵", "敵マスを押して単体対象を変更", state.boardCells.enemyCells, "enemy")}
      </div>
    </div>
  `;
}

function renderArmyEffectsLikeReference(state) {
  if (!state.selectedGroup) {
    return renderEmptyState("タイムライン行を選ぶと、ここに戦法と継続効果を表示します。");
  }

  const selectedItems = state.selectedGroup.effects
    .map((effect) => {
      const summary = formatArmyTimelineEffectSummary(effect);
      return `
        <article class="army-ref-summary-item tone-${escapeHtml(effect.tone || "utility")}">
          <div class="army-ref-summary-item-head">
            <span class="army-ref-summary-badge">${escapeHtml(summary.badge)}</span>
            <strong>${escapeHtml(summary.main)}</strong>
          </div>
          <div class="army-ref-summary-sub">${escapeHtml(summary.sub)}</div>
          <div class="army-ref-summary-raw">${escapeHtml(summary.raw)}</div>
        </article>
      `;
    })
    .join("");

  const activeItems = state.activeEffects.length
    ? state.activeEffects
        .map((effect) => `
          <span class="army-ref-current-chip tone-${escapeHtml(effect.tone || "utility")}">
            <strong>${escapeHtml(effect.characterName)}</strong>
            <small>${escapeHtml(`${effect.shortLabel} / ${effect.startSecond}～${effect.endSecond}秒`)}</small>
          </span>
        `)
        .join("")
    : `<p class="field-note">${escapeHtml(`${state.previewSecond}秒時点で残っている効果はありません。`)}</p>`;

  return `
    <div class="army-ref-detail-shell">
      <div class="army-ref-detail-head">
        <div>
          <div class="army-ref-detail-kicker">${escapeHtml(`${state.selectedGroup.characterName}の戦法`)}</div>
          <strong class="army-ref-detail-title">${escapeHtml(`「${state.selectedGroup.battleArtName}」`)}</strong>
        </div>
        <div class="army-ref-row-meta">
          <span>${escapeHtml(getArmyTimelineGroupMetaLabel(state.selectedGroup))}</span>
          <span>${escapeHtml(state.selectedGroup.summaryText || "効果あり")}</span>
        </div>
      </div>
      <div class="army-ref-summary-list">${selectedItems}</div>
      <div class="army-ref-current-shell">
        <div class="army-ref-current-head">
          <strong>${escapeHtml(`${state.previewSecond}秒時点の継続効果 ${state.activeEffects.length}件`)}</strong>
          <span>${escapeHtml(`基準敵 ${formationSlotLabelFor(state.targetSlotKey)}`)}</span>
        </div>
        <div class="army-ref-current-list">${activeItems}</div>
      </div>
    </div>
  `;
}

function renderArmyBattleLegend() {
  return `
    <span class="legend-chip"><span class="legend-swatch is-buff"></span>味方強化</span>
    <span class="legend-chip"><span class="legend-swatch is-debuff"></span>敵弱化 / ダメージ</span>
    <span class="legend-chip"><span class="legend-swatch is-heal"></span>回復</span>
    <span class="legend-chip"><span class="legend-swatch is-utility"></span>補助 / 解除</span>
  `;
}

function buildArmyBattlePreviewState(army, unit) {
  if (
    !army ||
    !unit ||
    typeof resolveBuilderEffectTargetSlots !== "function" ||
    typeof buildBuilderBoardSnapshot !== "function"
  ) {
    return null;
  }

  const formation = FORMATION_MAP[army.formation?.key] ?? army.formation ?? FORMATION_DEFS[0];
  const formationSlotKey =
    unit.assignedFormationSlot?.key ?? army.units?.[0]?.assignedFormationSlot?.key ?? formation.slots?.[0]?.key;
  const formationSlot = getFormationSlotMeta(formation, formationSlotKey);
  const validTargetSlotKey = formation.slots.some((slot) => slot.key === activeArmyTargetSlotKey)
    ? activeArmyTargetSlotKey
    : getArmyDefaultTimelineTargetSlotKey(formation);
  const previewSecond = clampArmyTimelinePreviewSecond(activeArmyPreviewSecond);
  const timelineEntries = buildArmyUnitTimelineEntries(unit, formation, formationSlot.key);
  const timelineWindows = timelineEntries.flatMap((entry) => entry.windows).sort(compareBuilderEffects);
  const timelineGroups = buildArmyTimelineTriggerGroups(timelineEntries, formation, formationSlot.key, validTargetSlotKey);
  const activeEffects = timelineWindows
    .filter(
      (effect) =>
        previewSecond >= Math.max(0, Math.min(ARMY_TIMELINE_MAX_SECOND, effect.startSecond)) &&
        (previewSecond < Math.max(0, Math.min(ARMY_TIMELINE_MAX_SECOND, effect.endSecond)) ||
          (Math.max(0, Math.min(ARMY_TIMELINE_MAX_SECOND, effect.endSecond)) === ARMY_TIMELINE_MAX_SECOND &&
            previewSecond === ARMY_TIMELINE_MAX_SECOND))
    )
    .map((effect) => ({
      ...effect,
      clippedStart: Math.max(0, Math.min(ARMY_TIMELINE_MAX_SECOND, effect.startSecond)),
      clippedEnd: Math.max(0, Math.min(ARMY_TIMELINE_MAX_SECOND, effect.endSecond)),
      targetSlotKeys: resolveBuilderEffectTargetSlots(effect, formation, formationSlot.key, validTargetSlotKey)
    }))
    .sort(compareBuilderEffects);
  const selectedGroup = pickArmyTimelineSelectedGroup(timelineGroups, previewSecond);
  activeArmyPreviewGroupId = selectedGroup?.id ?? null;
  const boardEffects = selectedGroup?.effects?.length ? selectedGroup.effects : activeEffects;

  activeArmyTargetSlotKey = validTargetSlotKey;

  return {
    commander: unit.commander,
    formation,
    formationSlot,
    targetSlotKey: validTargetSlotKey,
    previewSecond,
    timelineEntries,
    timelineGroups,
    selectedGroup,
    activeEffects,
    boardCells: buildBuilderBoardSnapshot({
      formation,
      formationSlot,
      targetSlotKey: validTargetSlotKey,
      commander: unit.commander,
      activeEffects: boardEffects
    })
  };
}

function renderArmyBattlePreviewEmptyState(timelineMessage, boardMessage, effectMessage, countLabel = "戦法待ち") {
  if (elements.armyTimelineCount) {
    elements.armyTimelineCount.textContent = countLabel;
  }
  if (elements.armyBoardLegend) {
    elements.armyBoardLegend.innerHTML = "";
  }
  if (elements.armyTimeline) {
    elements.armyTimeline.innerHTML = renderEmptyState(timelineMessage);
  }
  if (elements.armyBoardGrid) {
    elements.armyBoardGrid.innerHTML = renderEmptyState(boardMessage);
  }
  if (elements.armyActiveEffects) {
    elements.armyActiveEffects.innerHTML = renderEmptyState(effectMessage);
  }
}

function renderArmyBattlePreviewPanel(activeArmy, powerEstimate = null) {
  if (!elements.armyTimeline || !elements.armyBoardGrid || !elements.armyActiveEffects) {
    return;
  }

  const unitList = activeArmy?.units?.length ? activeArmy.units : powerEstimate?.units ?? [];
  if (!activeArmy || !unitList.length) {
    renderArmyBattlePreviewEmptyState(
      "部隊が決まると、ここに0〜50秒の戦法タイムラインを表示します。",
      "部隊が決まると、ここに味方盤面と敵盤面を表示します。",
      "部隊が決まると、ここに継続中のバフ / デバフを表示します。"
    );
    return;
  }

  activeArmyUnitIndex = Math.max(0, Math.min(unitList.length - 1, Number(activeArmyUnitIndex) || 0));
  const activeUnit = unitList[activeArmyUnitIndex] ?? unitList[0];
  const state = buildArmyBattlePreviewState(activeArmy, activeUnit);

  if (!state) {
    renderArmyBattlePreviewEmptyState(
      "戦法タイムラインを作れませんでした。",
      "盤面を作れませんでした。",
      "継続効果を作れませんでした。",
      "表示失敗"
    );
    return;
  }

  if (elements.armyTimelineCount) {
    const countText = state.selectedGroup
      ? `${activeUnit.commander.name} / ${state.selectedGroup.triggerSecond}秒`
      : `${activeUnit.commander.name} / ${state.previewSecond}秒`;
    elements.armyTimelineCount.textContent = countText;
  }
  if (elements.armyBoardLegend) {
    elements.armyBoardLegend.innerHTML = renderArmyBattleLegend();
  }
  elements.armyTimeline.innerHTML = renderArmyTimelineLikeReference(state);
  elements.armyBoardGrid.innerHTML = renderArmyBoardLikeReference(state);
  elements.armyActiveEffects.innerHTML = renderArmyEffectsLikeReference(state);
}

function getArmyUnitMetaPriorScore(unit, concept, formation) {
  const commanderMeta = getArmyMeta(unit.commander);
  const viceMembers = unit.unitMembers.filter((member) => member.slotKey.startsWith("vice"));
  const aideMembers = unit.unitMembers.filter((member) => member.slotKey.startsWith("aide"));
  const guideAverage = averageArmyValues([
    ...viceMembers.map((member) =>
      getArmyGuideBonus(commanderMeta, member.meta, member.slotKey === "vice1" ? "副将1" : "副将2")
    ),
    ...aideMembers.map((member) =>
      getArmyGuideBonus(commanderMeta, member.meta, member.slotKey === "aide1" ? "補佐1" : "補佐2")
    )
  ]);
  const pairAverage = averageArmyValues(
    viceMembers.map((member) => getArmyGuidePairScore(commanderMeta.character, member.meta.character) * 18)
  );
  const guideClusterScore = unit.guideClusterScore ?? getArmyGuideClusterScore(unit.unitMembers);
  const expertPattern = unit.expertPattern ?? getArmyExpertUnitPatternMatch(unit.unitMembers, concept);
  const expertPatternScore = unit.expertPatternScore ?? expertPattern.score;
  const videoTheoryScore = unit.videoTheory?.score ?? 50;
  const objectiveMatch =
    averageArmyValues(unit.unitMembers.map((member) => member.meta.objectiveScores?.[concept.primaryObjective] ?? 50)) / 100;
  const formationMatch = formation.key === getConceptRecommendedFormationKey(concept) ? 1 : 0.82;

  return clampArmyScore(
    (guideAverage * 0.32 +
      pairAverage * 0.1 +
      guideClusterScore * 0.2 +
      expertPatternScore * 0.18 +
      videoTheoryScore * 0.2) *
      ARMY_META_PRIOR_FACTORS.sourceTrust *
      ARMY_META_PRIOR_FACTORS.recency *
      formationMatch *
      (0.55 + objectiveMatch * 0.45)
  );
}

function buildArmyUnitScoreAxes(unit, concept, formation, formationSlotKey) {
  const timelineEntries = buildArmyUnitTimelineEntries(unit, formation, formationSlotKey);
  const windows = timelineEntries.flatMap((entry) => entry.windows);
  const targetSlotKey = formation.slots[2]?.key ?? formation.slots[0]?.key ?? "third";
  const triggerSeconds = timelineEntries.flatMap((entry) => entry.triggerSeconds);
  const earlyTriggerScore = triggerSeconds.length
    ? clampArmyScore(
        averageArmyValues(
          triggerSeconds.map((second) =>
            clampArmyScore(((ARMY_TIMELINE_WINDOWS.burst - Math.min(ARMY_TIMELINE_WINDOWS.burst, second)) / ARMY_TIMELINE_WINDOWS.burst) * 100)
          )
        )
      )
    : 42;

  let enemyDamage20 = 0;
  let allyBurst20 = 0;
  let allySustain40 = 0;
  let control40 = 0;
  let control20 = 0;
  let cleanse40 = 0;
  let heal40 = 0;
  let ehp40 = 0;
  let siege40 = 0;

  windows.forEach((effect) => {
    const coverage20 = getArmyTimelineCoverage(effect, 0, ARMY_TIMELINE_WINDOWS.burst);
    const coverage40 = getArmyTimelineCoverage(effect, 0, ARMY_TIMELINE_WINDOWS.sustain);
    const slotCount = resolveBuilderEffectTargetSlots(effect, formation, formationSlotKey, targetSlotKey).length;
    const scopeFactor = 0.84 + Math.min(0.42, slotCount * 0.08);
    const rateFactor = effect.activationRate ?? 1;
    const text = effect.text ?? "";

    if (effect.side === "enemy") {
      if (effect.kind === "damage") {
        enemyDamage20 += coverage20 * rateFactor * scopeFactor;
        siege40 += /対物/u.test(text) ? coverage40 * rateFactor * scopeFactor * 1.24 : 0;
      }
      if (effect.kind === "debuff" || /(恐怖|攻速低下|強化解除|弱化|病毒)/u.test(text)) {
        const controlBoost = /恐怖|強化解除/u.test(text) ? 1.24 : 1;
        control40 += coverage40 * rateFactor * scopeFactor * controlBoost;
        control20 += coverage20 * rateFactor * scopeFactor * controlBoost;
      }
      if (/対物/u.test(text)) {
        siege40 += coverage40 * rateFactor * scopeFactor;
      }
      return;
    }

    if (/(攻撃|戦威|会心|攻速上昇|強化効果付与|連撃|対物)/u.test(text)) {
      allyBurst20 += coverage20 * rateFactor * scopeFactor;
      if (/対物/u.test(text)) {
        siege40 += coverage40 * rateFactor * scopeFactor * 0.82;
      }
    }
    if (/(防御|被ダメ|軽減|堅固|悠然|無効)/u.test(text) || effect.kind === "utility") {
      allySustain40 += coverage40 * rateFactor * scopeFactor;
      ehp40 += coverage40 * rateFactor * scopeFactor * 1.12;
    }
    if (effect.kind === "heal" || /回復/u.test(text)) {
      heal40 += coverage40 * rateFactor * scopeFactor;
      allySustain40 += coverage40 * rateFactor * scopeFactor * 0.9;
      ehp40 += coverage40 * rateFactor * scopeFactor * 1.28;
    }
    if (/弱化解除/u.test(text)) {
      cleanse40 += coverage40 * rateFactor * scopeFactor * 1.18;
    }
  });

  if (unit.roleTags.includes("role.siege-breaker")) {
    siege40 += 9;
  }
  if (unit.roleTags.includes("siege.structure-damage-up")) {
    siege40 += 12;
  }
  if (unit.roleTags.includes("role.frontline-anchor")) {
    ehp40 += 12;
  }
  if (unit.roleTags.includes("def.damage-cut")) {
    ehp40 += 10;
  }
  if (unit.roleTags.includes("support.cleanse")) {
    cleanse40 += 14;
  }
  if (unit.roleTags.includes("support.heal")) {
    heal40 += 10;
    ehp40 += 8;
  }
  if (unit.roleTags.includes("role.disruptor")) {
    control40 += 10;
    control20 += 8;
  }

  const formationFit = clampArmyScore(
    (unit.rowScores?.[getFormationSlotMeta(formation, formationSlotKey)?.rowKey ?? unit.defaultRow] ?? unit.rowScores?.[unit.defaultRow] ?? 50) * 0.72 +
      getArmyFormationSlotTempoBias(formationSlotKey, formation) * 22 +
      earlyTriggerScore * 0.06
  );
  const unitPowerEstimate = getArmyUnitPowerEstimate(unit);
  const powerCurrent = clampArmyScore((unitPowerEstimate.current / Math.max(getArmyReferenceUnitPower(), 1)) * 100);
  const powerPotential = clampArmyScore((unitPowerEstimate.potential / Math.max(getArmyReferenceUnitPower(), 1)) * 100);
  const roleCoverage = clampArmyScore(new Set(unit.roleTags).size * 7.6);
  const investmentEfficiency = clampArmyScore(
    (unit.scoreBreakdown?.investmentScore ?? 50) * 0.62 +
      (unitPowerEstimate.potential
        ? clampArmyScore((unitPowerEstimate.growth / Math.max(unitPowerEstimate.potential, 1)) * 220)
        : 0) *
        0.38
  );

  return {
    powerCurrent,
    powerPotential,
    burst20s: clampArmyScore(enemyDamage20 * 7.2 + allyBurst20 * 4.4 + earlyTriggerScore * 0.28),
    sustain40s: clampArmyScore(allySustain40 * 3.2 + heal40 * 3.6 + formationFit * 0.16),
    siegeDps: clampArmyScore(siege40 * 4.8 + allyBurst20 * 1.2 + earlyTriggerScore * 0.12),
    ehp: clampArmyScore(ehp40 * 3.8 + formationFit * 0.18),
    controlUptime: clampArmyScore(control40 * 4.1 + control20 * 1.8 + earlyTriggerScore * 0.12),
    cleanseCoverage: clampArmyScore(cleanse40 * 5.6 + heal40 * 1.4),
    formationFit,
    metaPrior: getArmyUnitMetaPriorScore(unit, concept, formation),
    roleCoverage,
    investmentEfficiency
  };
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
  const guideClusterScore = getArmyGuideClusterScore(unitMembers);
  const expertPattern = getArmyExpertUnitPatternMatch(unitMembers, concept);
  const expertPatternScore = expertPattern.score;
  const roleBreadthScore = clampArmyScore(
    new Set(unitMembers.flatMap((member) => member.meta.roleTags)).size * 8
  );
  const videoTheory = getArmyUnitVideoTheoryProfile(unitMembers, commanderMeta, concept);
  const synergyScore = clampArmyScore(
    averageArmyValues(chainScores) * 0.28 +
      guideBonusScore * 0.12 +
      guideClusterScore * 0.1 +
      expertPatternScore * 0.1 +
      roleBreadthScore * 0.12 +
      averageArmyValues([
        getArmyTacticSupportScore(commanderMeta, viceOrder.vice1, "vice1"),
        getArmyTacticSupportScore(commanderMeta, viceOrder.vice2, "vice2"),
        aides[0].fitness.supportMatch,
        aides[1].fitness.supportMatch
      ]) *
        0.1 +
      videoTheory.score * 0.18
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
  const weightedPower = sumArmyValues(
    unitMembers.map((member) => getArmyCharacterPowerSnapshot(member.meta).current * (ARMY_POWER_SLOT_MULTIPLIERS[member.slotKey] ?? 0))
  );
  const powerScore = clampArmyScore((weightedPower / getArmyReferenceUnitPower()) * 100);
  const scoreBreakdown = {
    slotFitScore,
    objectiveFitScore,
    synergyScore,
    tempoScore,
    pressureScore,
    sustainScore,
    utilityScore,
    investmentScore,
    powerScore,
    guideClusterScore,
    expertPatternScore,
    videoTheoryScore: videoTheory.score
  };
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
  const defaultFormationContext = getArmyDefaultFormationContext({ rowScores, defaultRow }, concept);
  const scoreAxes = buildArmyUnitScoreAxes(
    {
      commander: commanderMeta.character,
      unitMembers,
      rowScores,
      defaultRow,
      scoreBreakdown,
      roleTags,
      guideClusterScore,
      expertPatternScore,
      expertPattern,
      videoTheory
    },
    concept,
    defaultFormationContext.formation,
    defaultFormationContext.formationSlotKey
  );
  const total = scoreArmyAxes(scoreAxes, getArmyAxisWeights(concept));
  const topAxes = getArmyTopAxisEntries(scoreAxes, concept, 3);

  const reasons = [
    commanderMeta.positionProfile?.focusText ? `配置適性: ${commanderMeta.positionProfile.focusText}` : "",
    `${commanderMeta.character.name}を主将にした時の主将適性が高い`,
    chainSummary ? `副将連鎖率は ${chainSummary}` : "",
    topAxes.length ? `重視軸: ${topAxes.map((entry) => `${entry.label} ${entry.value.toFixed(1)}`).join(" / ")}` : "",
    powerScore >= 82 || scoreAxes.powerCurrent >= 82 ? `戦力寄与が高く、5人合計の部隊戦力が伸びやすい` : "",
    scoreAxes.burst20s >= 68 ? "前半20秒の戦法火力が出やすい" : "",
    scoreAxes.controlUptime >= 66 ? "妨害や強化解除を早い時間帯に通しやすい" : "",
    videoTheory.focusText ? `動画傾向: ${videoTheory.focusText}` : "",
    videoTheory.packageText ? `技能束ね: ${videoTheory.packageText}` : "",
    expertPatternScore >= 62 ? `猛者編成で多い ${expertPattern.label} に近い` : "",
    highTags.length ? `コンセプト一致タグ: ${highTags.slice(0, 4).join(" / ")}` : "",
    guideClusterScore >= 40 ? "おすすめ編成でよく見る副将ペア / 補佐ペアに近い" : guideBonusScore >= 36 ? "GameWith のおすすめ編成に近い組み合わせが含まれる" : "",
    roleTags.includes("role.flex-support") ? "補佐が支援役を埋めて、技能条件が崩れにくい" : ""
  ].filter(Boolean);

  const warnings = [
    averageArmyValues(chainScores) < 40 ? "副将連鎖率は高めではない" : "",
    !roleTags.includes("role.frontline-anchor") ? "前列維持役が薄い" : "",
    !roleTags.includes("role.flex-support") ? "補佐の支援色は弱め" : "",
    videoTheory.warningText || "",
    expertPatternScore < 42 ? "部隊タイプが曖昧で、猛者編成の型に寄り切れていない" : "",
    scoreAxes.cleanseCoverage < 38 && concept.key === "defense" ? "防衛安定向けとしては弱化解除が不足しやすい" : "",
    scoreAxes.formationFit < 48 ? "おすすめ陣形に置いても列適性が伸び切りにくい" : ""
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
    scoreAxes,
    chainAverage: averageArmyValues(chainScores),
    synergyScore,
    sustainScore,
    guideBonusScore,
    guideClusterScore,
    expertPatternScore,
    expertPattern,
    videoTheory,
    reasons: reasons.slice(0, 6),
    warnings: warnings.slice(0, 4),
    roleTags,
    highTags,
    preferredAxisText: formatArmyAxisText(scoreAxes, concept, 3)
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

  const rankedPairs = keepTopArmyEntries(
    pairs.map(([leftMeta, rightMeta]) => ({
      pair: [leftMeta, rightMeta],
      score:
        getArmyViceFitness(commanderMeta, leftMeta, concept, "vice1").score +
        getArmyViceFitness(commanderMeta, rightMeta, concept, "vice2").score +
        getArmyGuidePairScore(leftMeta.character, rightMeta.character) * 10
    })),
    ARMY_BUILDER_LIMITS.vicePairKeep
  ).map((entry) => entry.pair);

  if (rankedPairs.length) {
    return rankedPairs;
  }

  const emergencyPool = keepTopArmyEntries(
    allowedMetas
      .filter((meta) => meta.character.id !== commanderMeta.character.id)
      .filter((meta) => !forcedViceMeta || meta.character.id !== forcedViceMeta.character.id)
      .map((meta) => ({
        meta,
        score:
          getArmyViceFitness(commanderMeta, meta, concept, "vice1").score +
          getArmyViceFitness(commanderMeta, meta, concept, "vice2").score
      })),
    4,
    "score"
  ).map((entry) => entry.meta);

  if (forcedViceMeta) {
    const partner = emergencyPool.find((meta) => meta.character.id !== forcedViceMeta.character.id);
    return partner ? [[forcedViceMeta, partner]] : [];
  }

  return emergencyPool.length >= 2 ? [[emergencyPool[0], emergencyPool[1]]] : [];
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

  if (pairs.length) {
    return pairs;
  }

  const emergencyPool = keepTopArmyEntries(
    allowedMetas
      .filter((meta) => !core.some((coreMeta) => coreMeta.character.id === meta.character.id))
      .filter((meta) => !forcedAideMeta || meta.character.id !== forcedAideMeta.character.id)
      .map((meta) => ({
        meta,
        score:
          getArmyAideFitness(core, meta, concept, "aide1").score +
          getArmyAideFitness(core, meta, concept, "aide2").score
      })),
    4,
    "score"
  ).map((entry) => entry.meta);

  if (forcedAideMeta) {
    const partner = emergencyPool.find((meta) => meta.character.id !== forcedAideMeta.character.id);
    return partner ? [[forcedAideMeta, partner]] : [];
  }

  return emergencyPool.length >= 2 ? [[emergencyPool[0], emergencyPool[1]]] : [];
}

function buildEmergencyUnitCandidatesForCommander(commanderMeta, allowedMetas, concept, options = {}) {
  const forcedViceMeta = options.forcedViceMeta ?? null;
  const forcedAideMeta = options.forcedAideMeta ?? null;
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
    6,
    "score"
  ).map((entry) => entry.meta);

  let vicePair = [];
  if (forcedViceMeta) {
    const partner = vicePool.find((meta) => meta.character.id !== forcedViceMeta.character.id);
    vicePair = partner ? [forcedViceMeta, partner] : [];
  } else if (vicePool.length >= 2) {
    vicePair = [vicePool[0], vicePool[1]];
  }
  if (vicePair.length !== 2) {
    return [];
  }

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
    6,
    "score"
  ).map((entry) => entry.meta);

  let aidePair = [];
  if (forcedAideMeta) {
    const partner = aidePool.find((meta) => meta.character.id !== forcedAideMeta.character.id);
    aidePair = partner ? [forcedAideMeta, partner] : [];
  } else if (aidePool.length >= 2) {
    aidePair = [aidePool[0], aidePool[1]];
  }
  if (aidePair.length !== 2) {
    return [];
  }

  const candidate = buildArmyUnitCandidate(
    commanderMeta,
    vicePair[0],
    vicePair[1],
    aidePair[0],
    aidePair[1],
    concept
  );

  return candidate ? [candidate] : [];
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

  const ranked = pickDiverseArmyUnits(candidates, ARMY_BUILDER_LIMITS.keepUnitsPerCommander);
  if (ranked.length) {
    return ranked;
  }

  return buildEmergencyUnitCandidatesForCommander(commanderMeta, allowedMetas, concept, options);
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

function withArmyBuilderLimitOverrides(overrides = {}, callback = () => null) {
  const previous = {};
  Object.entries(overrides).forEach(([key, value]) => {
    previous[key] = ARMY_BUILDER_LIMITS[key];
    ARMY_BUILDER_LIMITS[key] = value;
  });

  try {
    return callback();
  } finally {
    Object.entries(previous).forEach(([key, value]) => {
      ARMY_BUILDER_LIMITS[key] = value;
    });
  }
}

function sanitizeArmySelectedCommanderIds(ids = [], allowedMetas = []) {
  const allowedIdSet = new Set(allowedMetas.map((meta) => meta.character.id));
  return uniqueValues(
    ids
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && allowedIdSet.has(value))
  ).slice(0, 5);
}

function setArmySelectedCommanderIds(ids = [], allowedMetas = null) {
  const allowedPool = allowedMetas ?? preparedCharacters.map((character) => getArmyMeta(character));
  armySelectedCommanderIds = sanitizeArmySelectedCommanderIds(ids, allowedPool);
  if (armySelectedCommanderIds.length < 5) {
    clearArmyCommanderPrefetchTimer();
    armyCommanderPrefetchKey = "";
  }
  return armySelectedCommanderIds;
}

function toggleArmyCommanderSelection(commanderId) {
  const numericCommanderId = Number(commanderId);
  if (!Number.isFinite(numericCommanderId)) {
    return false;
  }

  if (armySelectedCommanderIds.includes(numericCommanderId)) {
    armySelectedCommanderIds = armySelectedCommanderIds.filter((value) => value !== numericCommanderId);
  } else if (armySelectedCommanderIds.length < 5) {
    armySelectedCommanderIds = [...armySelectedCommanderIds, numericCommanderId];
  } else {
    window.KH_APP_API?.showStatusToast?.("主将は5体までです。先に1体外してください。");
    return false;
  }

  lastArmyPlannerResult = null;
  activeArmyAlternativeIndex = 0;
  renderArmyPlanner(buildArmyCommanderPreviewResult());
  scheduleArmyCommanderPrefetch();
  return true;
}

function getArmySelectedCommanderMetas(allowedMetas = []) {
  const selectedIds = sanitizeArmySelectedCommanderIds(armySelectedCommanderIds, allowedMetas);
  armySelectedCommanderIds = selectedIds;
  return selectedIds.map((characterId) => ARMY_CHARACTER_META_BY_ID.get(characterId)).filter(Boolean);
}

function getArmyQuickCommanderSelectionScore(meta, concept, seedMeta = null) {
  const commanderScore = getArmySlotBaseScore(meta, "commander", concept);
  const objectiveScore = meta.objectiveScores?.[concept.primaryObjective] ?? 0;
  const conceptAffinity = getArmyConceptAffinity(meta, concept);
  const powerSnapshot = getArmyCharacterPowerSnapshot(meta);
  const powerNowScore = clampArmyScore(
    (powerSnapshot.current / Math.max(getArmyReferenceUnitPower() * 0.38, 1)) * 100
  );
  return clampArmyScore(
    commanderScore * 0.38 +
      conceptAffinity * 0.18 +
      objectiveScore * 0.16 +
      meta.chainPotential * 0.1 +
      powerNowScore * 0.14 +
      (seedMeta?.character.id === meta.character.id ? 12 : 0)
  );
}

function buildArmyCommanderFastAutoEntries(allowedMetas, concept, seedMeta = null, preferredCommanderIds = []) {
  const preferredIdSet = new Set(preferredCommanderIds.map((value) => Number(value)).filter(Number.isFinite));
  const pressureHeavyConcept =
    concept?.primaryObjective === "pvp" || ["balanced", "meta", "opener", "debuff"].includes(concept?.key);
  return allowedMetas
    .map((meta) => {
      const commanderScore = getArmySlotBaseScore(meta, "commander", concept);
      const objectiveScore = meta.objectiveScores?.[concept.primaryObjective] ?? 0;
      const conceptAffinity = getArmyConceptAffinity(meta, concept);
      const powerSnapshot = getArmyCharacterPowerSnapshot(meta);
      const powerNowScore = clampArmyScore(
        (powerSnapshot.current / Math.max(getArmyReferenceUnitPower() * 0.38, 1)) * 100
      );
      const positionBiasScore = clampArmyScore(
        (meta.positionProfile?.dominantScore ?? 0) * 2.2 + Math.max(0, meta.positionProfile?.dominantGap ?? 0) * 2.8
      );
      const burstAxis = clampArmyScore(
        meta.groupScores.offense * 0.68 + objectiveScore * 0.18 + commanderScore * 0.14
      );
      const controlAxis = clampArmyScore(
        meta.groupScores.control * 0.64 + meta.groupScores.support * 0.22 + commanderScore * 0.14
      );
      const sustainAxis = clampArmyScore(
        meta.groupScores.defense * 0.72 + meta.groupScores.support * 0.1 + commanderScore * 0.18
      );
      const flexibilityScore = clampArmyScore(
        44 +
          uniqueValues(
            (meta.roleTags ?? []).filter(
              (tag) =>
                tag.startsWith("role.") || tag.startsWith("support.") || tag.startsWith("control.") || tag.startsWith("def.")
            )
          ).length *
            9
      );
      const depthScore = clampArmyScore(
        meta.chainPotential * 0.38 +
          conceptAffinity * 0.28 +
          objectiveScore * 0.18 +
          sustainAxis * 0.16
      );
      const defaultRowInfo = getArmyDominantRowInfo(meta.rowScores, meta.positionProfile?.dominantRow || "middle");
      const shellScore = clampArmyScore(
        pressureHeavyConcept
          ? commanderScore * 0.3 +
              objectiveScore * 0.14 +
              conceptAffinity * 0.14 +
              powerNowScore * 0.1 +
              burstAxis * 0.24 +
              controlAxis * 0.08
          : commanderScore * 0.42 +
              objectiveScore * 0.18 +
              conceptAffinity * 0.18 +
              powerNowScore * 0.12 +
              burstAxis * 0.1
      );
      return {
        meta,
        score: clampArmyScore(
          pressureHeavyConcept
            ? shellScore * 0.32 +
                burstAxis * 0.28 +
                controlAxis * 0.12 +
                sustainAxis * 0.04 +
                flexibilityScore * 0.08 +
                depthScore * 0.04 +
                positionBiasScore * 0.04 +
                powerNowScore * 0.04 +
                (preferredIdSet.has(meta.character.id) ? 8 : 0) +
                (seedMeta?.character.id === meta.character.id ? 12 : 0)
            : shellScore * 0.38 +
                burstAxis * 0.18 +
                controlAxis * 0.14 +
                sustainAxis * 0.08 +
                flexibilityScore * 0.08 +
                depthScore * 0.06 +
                positionBiasScore * 0.04 +
                powerNowScore * 0.04 +
                (preferredIdSet.has(meta.character.id) ? 8 : 0) +
                (seedMeta?.character.id === meta.character.id ? 12 : 0)
        ),
        buildScore: shellScore,
        flexibilityScore,
        depthScore,
        bestUnit: {
          memberIds: new Set([meta.character.id]),
          roleTags: [...(meta.roleTags ?? [])],
          rowScores: { ...(meta.rowScores ?? {}) },
          defaultRow: defaultRowInfo.rowKey,
          scoreAxes: {
            burst20s: burstAxis,
            controlUptime: controlAxis,
            sustain40s: sustainAxis
          }
        }
      };
    })
    .sort((left, right) => right.score - left.score);
}

function getArmyPlannerContext(options = {}) {
  const concept = ARMY_CONCEPT_MAP[elements.armyConcept?.value] ?? ARMY_CONCEPT_DEFS[0];
  const seasonFocusKey = getArmySelectedSeasonFocusKey();
  const formationChoiceKey = sanitizeArmyFormationChoiceKey(elements.armyFormation?.value ?? "auto");
  const selectedRarities = readCheckedValuesIn(elements.armyRarityFilters, "army-rarity");
  const seedCharacter = characterByName[elements.armySeedCharacter?.value] ?? null;
  const seedMeta = getArmyMeta(seedCharacter);
  const seedSlots = resolveArmySeedSlots(seedCharacter, elements.armySeedMode?.value ?? "best");
  const { usingRoster, ownedCount, readyCount, allowedMetas } = getArmyAllowedMetas(selectedRarities, seedCharacter);
  const selectedCommanderIds = options.ignoreCommanderSelection
    ? []
    : sanitizeArmySelectedCommanderIds(armySelectedCommanderIds, allowedMetas);

  if (!options.ignoreCommanderSelection) {
    armySelectedCommanderIds = selectedCommanderIds;
  }

  return {
    concept,
    seasonFocusKey,
    formationChoiceKey,
    selectedRarities,
    seedCharacter,
    seedMeta,
    seedSlots,
    usingRoster,
    ownedCount,
    readyCount,
    allowedMetas,
    selectedCommanderIds
  };
}

function buildArmyCommanderPoolEntries(context = null, selectedIds = []) {
  const plannerContext = context ?? getArmyPlannerContext();
  const selectedIdSet = new Set(
    sanitizeArmySelectedCommanderIds(selectedIds, plannerContext.allowedMetas).map((value) => Number(value))
  );
  const sourceCharacters = plannerContext.usingRoster ? getOwnedArmyCharacters() : preparedCharacters;
  const filteredCharacters = sourceCharacters.filter(
    (character) =>
      plannerContext.selectedRarities.includes(character.rarity) ||
      selectedIdSet.has(character.id) ||
      plannerContext.seedCharacter?.id === character.id
  );

  return filteredCharacters
    .map((character) => {
      const meta = getArmyMeta(character);
      const profile = getArmyRosterProfile(character.id);
      const snapshot = getArmyCharacterPowerSnapshot(character);
      const isSelected = selectedIdSet.has(character.id);
      const isReady = plannerContext.usingRoster ? isArmyCharacterReady(character.id) : true;
      const quickScore = getArmyQuickCommanderSelectionScore(meta, plannerContext.concept, plannerContext.seedMeta);
      return {
        mode: "pool",
        meta,
        profile,
        isSelected,
        isReady,
        power: snapshot.current,
        quickScore
      };
    })
    .sort(
      (left, right) =>
        Number(right.isSelected) - Number(left.isSelected) ||
        Number(right.isReady) - Number(left.isReady) ||
        (right.quickScore ?? 0) - (left.quickScore ?? 0) ||
        right.power - left.power ||
        left.meta.character.name.localeCompare(right.meta.character.name, "ja")
    );
}

function buildArmyCommanderPreviewResult(context = null) {
  const plannerContext = context ?? getArmyPlannerContext();
  const {
    concept,
    seasonFocusKey,
    formationChoiceKey,
    selectedRarities,
    seedCharacter,
    seedMeta,
    usingRoster,
    ownedCount,
    readyCount,
    allowedMetas,
    selectedCommanderIds
  } = plannerContext;
  let validation = "";
  if (seedCharacter && usingRoster && !isArmyCharacterOwned(seedCharacter.id)) {
    validation = `固定候補の ${seedCharacter.name} が手持ちに入っていません。先に手持ちへ追加してください。`;
  } else if (seedCharacter && usingRoster && !isArmyCharacterReady(seedCharacter.id)) {
    validation = `固定候補の ${seedCharacter.name} は未育成です。仕上がりにしてから主将候補へ入れてください。`;
  } else if (usingRoster && readyCount === 0) {
    validation = "仕上がりの武将がまだいません。手持ち一覧で仕上がりへ切り替えてください。";
  } else if (!allowedMetas.length) {
    validation = usingRoster
      ? "仕上がり武将の中で、この条件に合う候補がいません。レアリティか固定候補を見直してください。"
      : "この条件では主将候補が出ません。";
  } else if (selectedCommanderIds.length < 5) {
    validation = `主将を ${selectedCommanderIds.length} / 5 体まで絞ると5部隊を確定します。副将候補は下に先出ししています。`;
  }

  return {
    validation,
    concept,
    seasonFocusKey,
    formationChoiceKey,
    selectedRarities,
    seedCharacter,
    seedMeta,
    usingRoster,
    ownedCount,
    readyCount,
    allowedCount: allowedMetas.length,
    selectedCommanderIds,
    commanderShortlist: buildArmyCommanderPoolEntries(plannerContext, selectedCommanderIds),
    viceShortlist: { commanderMeta: null, entries: [] },
    armies: [],
    reserveSuggestions: [],
    swapSuggestions: [],
    exclusionReasons: [],
    formationAlternatives: [],
    auditCards: [],
    confidence: null,
    summary: formatSummaryText(
      [
        `最適化方針: ${concept.label}`,
        usingRoster ? `仕上がり: ${readyCount}体 / 登録 ${ownedCount}体` : "全武将モード",
        `レアリティ: ${selectedRarities.join(" / ")}`,
        `主将選択: ${selectedCommanderIds.length} / 5`
      ].filter(Boolean),
      "主将候補の提示"
    )
  };
}

function buildArmyStatesFromCommanderGroups(commanderMetas, allowedMetas, concept, seedMeta, formationChoiceKey = "auto") {
  const candidateGroups = commanderMetas
    .map((commanderMeta) => ({
      commanderMeta,
      candidates: buildUnitCandidatesForCommander(commanderMeta, allowedMetas, concept)
    }))
    .filter((entry) => entry.candidates.length)
    .sort((left, right) => left.candidates.length - right.candidates.length);

  if (candidateGroups.length !== commanderMetas.length) {
    return [];
  }

  let states = [{ units: [], usedIds: new Set(), score: 0, tieBreaker: 0 }];

  for (const group of candidateGroups) {
    const nextStates = [];

    for (const state of states) {
      for (const candidate of group.candidates) {
        if ([...candidate.memberIds].some((characterId) => state.usedIds.has(characterId))) {
          continue;
        }

        const nextUsedIds = new Set(state.usedIds);
        candidate.memberIds.forEach((characterId) => nextUsedIds.add(characterId));
        const nextUnits = [...state.units, candidate];
        const projectedScore =
          averageArmyValues(nextUnits.map((unit) => unit.total)) +
          averageArmyValues(nextUnits.map((unit) => unit.synergyScore)) * 0.05 +
          averageArmyValues(nextUnits.map((unit) => unit.scoreAxes?.formationFit ?? 0)) * 0.03 +
          averageArmyValues(nextUnits.map((unit) => unit.scoreAxes?.roleCoverage ?? 0)) * 0.02;

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
      return [];
    }
  }

  const staticResults = keepTopArmyEntries(
    states
      .filter((state) => state.units.length === commanderMetas.length && state.usedIds.size === commanderMetas.length * 5)
      .map((state) => evaluateArmyComposition(state.units, concept, seedMeta, formationChoiceKey)),
    ARMY_BUILDER_LIMITS.finalArmies,
    "total"
  );
  if (staticResults.length) {
    return staticResults;
  }

  return buildArmyStatesFromCommanderGroupsDynamic(commanderMetas, allowedMetas, concept, seedMeta, formationChoiceKey);
}

function buildArmyStatesFromCommanderGroupsDynamic(
  commanderMetas,
  allowedMetas,
  concept,
  seedMeta,
  formationChoiceKey = "auto"
) {
  const overrideConfig = {
    vicePool: Math.max(ARMY_BUILDER_LIMITS.vicePool, 18),
    aidePool: Math.max(ARMY_BUILDER_LIMITS.aidePool, 14),
    vicePairKeep: Math.max(ARMY_BUILDER_LIMITS.vicePairKeep, 54),
    keepUnitsPerCommander: Math.max(ARMY_BUILDER_LIMITS.keepUnitsPerCommander, 24)
  };
  const orderedCommanderMetas = commanderMetas
    .map((commanderMeta) => ({
      commanderMeta,
      candidateCount: withArmyBuilderLimitOverrides(overrideConfig, () =>
        buildUnitCandidatesForCommander(commanderMeta, allowedMetas, concept).length
      )
    }))
    .sort((left, right) => left.candidateCount - right.candidateCount)
    .map((entry) => entry.commanderMeta);

  const results = [];
  const signatureSet = new Set();
  const maxResults = Math.max(ARMY_BUILDER_LIMITS.finalArmies * 2, 6);

  const search = (index, remainingMetas, pickedUnits) => {
    if (results.length >= maxResults) {
      return;
    }
    if (index >= orderedCommanderMetas.length) {
      if (pickedUnits.length !== orderedCommanderMetas.length) {
        return;
      }
      const army = evaluateArmyComposition(pickedUnits, concept, seedMeta, formationChoiceKey);
      const signature = buildArmyCompositionSignature(army);
      if (!signature || signatureSet.has(signature)) {
        return;
      }
      signatureSet.add(signature);
      results.push(army);
      return;
    }

    const commanderMeta = orderedCommanderMetas[index];
    if (!remainingMetas.some((meta) => meta.character.id === commanderMeta.character.id)) {
      return;
    }

    const candidates = withArmyBuilderLimitOverrides(overrideConfig, () =>
      buildUnitCandidatesForCommander(commanderMeta, remainingMetas, concept)
    ).slice(0, 12);

    for (const candidate of candidates) {
      const nextRemainingMetas = remainingMetas.filter((meta) => !candidate.memberIds.has(meta.character.id));
      search(index + 1, nextRemainingMetas, [...pickedUnits, candidate]);
      if (results.length >= maxResults) {
        return;
      }
    }
  };

  search(0, allowedMetas, []);
  return keepTopArmyEntries(results, ARMY_BUILDER_LIMITS.finalArmies, "total");
}

function buildArmyCommanderSearchFallbackArmies(allowedMetas, concept, seedMeta, formationChoiceKey = "auto") {
  const overrideConfig = {
    vicePool: Math.max(ARMY_BUILDER_LIMITS.vicePool, 18),
    aidePool: Math.max(ARMY_BUILDER_LIMITS.aidePool, 14),
    vicePairKeep: Math.max(ARMY_BUILDER_LIMITS.vicePairKeep, 54),
    keepUnitsPerCommander: Math.max(ARMY_BUILDER_LIMITS.keepUnitsPerCommander, 24)
  };
  const commanderMetas = buildArmyCommanderFastAutoEntries(allowedMetas, concept, seedMeta, [])
    .slice(0, 10)
    .map((entry) => entry.meta);
  const results = [];
  const signatureSet = new Set();
  const maxResults = Math.max(ARMY_BUILDER_LIMITS.finalArmies * 2, 6);

  const search = (remainingMetas, remainingCommanderMetas, pickedUnits) => {
    if (results.length >= maxResults) {
      return;
    }
    if (pickedUnits.length === 5) {
      const army = evaluateArmyComposition(pickedUnits, concept, seedMeta, formationChoiceKey);
      const signature = buildArmyCompositionSignature(army);
      if (!signature || signatureSet.has(signature)) {
        return;
      }
      signatureSet.add(signature);
      results.push(army);
      return;
    }

    const commanderEntries = remainingCommanderMetas
      .filter((meta) => remainingMetas.some((entry) => entry.character.id === meta.character.id))
      .map((meta) => ({
        meta,
        candidates: withArmyBuilderLimitOverrides(overrideConfig, () =>
          buildUnitCandidatesForCommander(meta, remainingMetas, concept)
        ).slice(0, 3)
      }))
      .filter((entry) => entry.candidates.length)
      .sort(
        (left, right) =>
          left.candidates.length - right.candidates.length ||
          (right.candidates[0]?.total ?? 0) - (left.candidates[0]?.total ?? 0)
      )
      .slice(0, 5);

    for (const entry of commanderEntries) {
      const nextCommanderMetas = remainingCommanderMetas.filter((meta) => meta.character.id !== entry.meta.character.id);
      for (const candidate of entry.candidates) {
        const nextRemainingMetas = remainingMetas.filter((meta) => !candidate.memberIds.has(meta.character.id));
        search(nextRemainingMetas, nextCommanderMetas, [...pickedUnits, candidate]);
        if (results.length >= maxResults) {
          return;
        }
      }
    }
  };

  search(allowedMetas, commanderMetas, []);
  return keepTopArmyEntries(results, ARMY_BUILDER_LIMITS.finalArmies, "total");
}

function buildArmyGreedyCommanderSelection(
  allowedMetas,
  concept,
  seedMeta,
  preferredCommanderIds = [],
  limit = 5,
  candidateEntries = null
) {
  if (!allowedMetas.length || limit <= 0) {
    return [];
  }

  const preferredIds = uniqueValues(preferredCommanderIds.map((value) => Number(value)).filter(Number.isFinite));
  const preferredIdSet = new Set(preferredIds);
  const shortlist = (
    Array.isArray(candidateEntries) && candidateEntries.length
      ? candidateEntries
      : buildArmyCommanderShortlistV2(allowedMetas, concept, null, seedMeta, preferredIds)
  ).slice(0, Math.max(limit + 10, 15));

  if (!shortlist.length) {
    return [];
  }

  const pickedEntries = [];
  const pickedIdSet = new Set();
  const usedMemberIds = new Set();
  const pickedRoleCounts = {
    support: 0,
    frontline: 0,
    disruptor: 0,
    burst: 0
  };
  const pickedRowCounts = {
    front: 0,
    middle: 0,
    back: 0
  };
  const rowTargets = concept?.rowTarget ?? {
    front: 2,
    middle: 2,
    back: 1
  };
  const pressureHeavyConcept =
    concept?.primaryObjective === "pvp" || ["balanced", "meta", "opener", "debuff"].includes(concept?.key);

  const getEntryRoleFlags = (entry) => {
    const tagSet = new Set([...(entry.meta?.roleTags ?? []), ...(entry.bestUnit?.roleTags ?? [])]);
    const burstAxis = entry.bestUnit?.scoreAxes?.burst20s ?? 0;
    return {
      support:
        tagSet.has("role.flex-support") || tagSet.has("support.heal") || tagSet.has("support.cleanse"),
      frontline: tagSet.has("role.frontline-anchor"),
      disruptor:
        tagSet.has("role.disruptor") || tagSet.has("control.buff-strip") || tagSet.has("control.fear"),
      burst:
        tagSet.has("role.burst-commander") ||
        burstAxis >= 56 ||
        (entry.meta?.groupScores?.offense ?? 0) >= 72
    };
  };

  const getEntryRowFocus = (entry) => {
    const scoreSource = entry.bestUnit?.rowScores ?? entry.meta?.rowScores ?? {};
    const fallbackRow = entry.bestUnit?.defaultRow ?? entry.meta?.positionProfile?.dominantRow ?? "middle";
    return getArmyDominantRowInfo(scoreSource, fallbackRow);
  };

  const addPickedRoleCounts = (entry) => {
    const flags = getEntryRoleFlags(entry);
    Object.entries(flags).forEach(([key, enabled]) => {
      if (enabled) {
        pickedRoleCounts[key] += 1;
      }
    });
  };

  const addPickedRowCounts = (entry) => {
    const focus = getEntryRowFocus(entry);
    if (focus?.rowKey) {
      pickedRowCounts[focus.rowKey] += 1;
    }
  };

  while (pickedEntries.length < limit) {
    let bestEntry = null;
    let bestScore = -Infinity;

    shortlist.forEach((entry) => {
      const commanderId = entry.meta.character.id;
      if (pickedIdSet.has(commanderId)) {
        return;
      }

      const memberIds = Array.from(entry.bestUnit?.memberIds ?? [commanderId]);
      const overlapCount = memberIds.filter((characterId) => usedMemberIds.has(characterId)).length;
      const flags = getEntryRoleFlags(entry);
      const rowFocus = getEntryRowFocus(entry);
      const burstAxis = entry.bestUnit?.scoreAxes?.burst20s ?? 0;
      const controlAxis = entry.bestUnit?.scoreAxes?.controlUptime ?? 0;
      const sustainAxis = entry.bestUnit?.scoreAxes?.sustain40s ?? 0;
      let roleNeedBonus = 0;
      let rowNeedBonus = 0;
      let rowOverflowPenalty = 0;
      if (pickedRoleCounts.support < 1 && flags.support) {
        roleNeedBonus += 10;
      }
      if (pickedRoleCounts.frontline < 1 && flags.frontline) {
        roleNeedBonus += 11;
      }
      if (pickedRoleCounts.disruptor < 1 && flags.disruptor) {
        roleNeedBonus += pressureHeavyConcept ? 13 : 9;
      }
      if (pressureHeavyConcept && pickedRoleCounts.burst < 3 && flags.burst) {
        roleNeedBonus += pickedRoleCounts.burst < 1 ? 18 : 14;
      }
      if (!pressureHeavyConcept && pickedRoleCounts.burst < 1 && flags.burst) {
        roleNeedBonus += 8;
      }
      if (rowFocus?.rowKey) {
        const target = rowTargets[rowFocus.rowKey] ?? 0;
        const strongRowBias = rowFocus.score >= 70 || rowFocus.gap >= 8;
        if (pickedRowCounts[rowFocus.rowKey] < target) {
          rowNeedBonus += strongRowBias ? 10 : 6;
        } else if (pickedRowCounts[rowFocus.rowKey] >= target && target > 0) {
          rowOverflowPenalty += strongRowBias ? 10 : 5;
        }
      }
      const axisBias = pressureHeavyConcept
        ? burstAxis * 0.24 + controlAxis * 0.08 + sustainAxis * 0.03
        : sustainAxis * 0.1 + controlAxis * 0.08 + burstAxis * 0.06;
      const duplicateRolePenalty =
        (flags.support && pickedRoleCounts.support >= 2 ? 10 : 0) +
        (flags.frontline && pickedRoleCounts.frontline >= 2 ? 6 : 0) +
        (flags.disruptor && pickedRoleCounts.disruptor >= 2 ? 7 : 0) +
        (flags.burst && pickedRoleCounts.burst >= 3 ? 4 : 0);
      const adjustedScore =
        entry.score +
        entry.buildScore * 0.24 +
        (entry.depthScore ?? 0) * 0.08 +
        (entry.flexibilityScore ?? 0) * 0.06 +
        axisBias +
        roleNeedBonus +
        rowNeedBonus +
        (preferredIdSet.has(commanderId) ? 16 : 0) -
        overlapCount * 28 -
        duplicateRolePenalty -
        rowOverflowPenalty;

      if (adjustedScore > bestScore) {
        bestScore = adjustedScore;
        bestEntry = entry;
      }
    });

    if (!bestEntry) {
      break;
    }

    pickedEntries.push(bestEntry);
    pickedIdSet.add(bestEntry.meta.character.id);
    Array.from(bestEntry.bestUnit?.memberIds ?? [bestEntry.meta.character.id]).forEach((characterId) =>
      usedMemberIds.add(characterId)
    );
    addPickedRoleCounts(bestEntry);
    addPickedRowCounts(bestEntry);
  }

  if (pickedEntries.length < limit) {
    shortlist.forEach((entry) => {
      if (pickedEntries.length >= limit || pickedIdSet.has(entry.meta.character.id)) {
        return;
      }
      pickedEntries.push(entry);
      pickedIdSet.add(entry.meta.character.id);
    });
  }

  return pickedEntries.slice(0, limit).map((entry) => entry.meta.character.id);
}

function findBuildableArmyCommanderIds(context = null) {
  const plannerContext = context ?? getArmyPlannerContext({ ignoreCommanderSelection: true });
  const {
    concept,
    formationChoiceKey,
    seedMeta,
    seedSlots,
    usingRoster,
    readyCount,
    allowedMetas
  } = plannerContext;

  if ((usingRoster && readyCount < 25) || allowedMetas.length < 25) {
    return [];
  }

  const candidateSelections = [];
  const fastEntries = buildArmyCommanderFastAutoEntries(allowedMetas, concept, seedMeta, []);
  const rankSelection = (armies = []) => {
    const topArmy = armies[0];
    if (!topArmy) {
      return -Infinity;
    }
    const burstBias =
      concept.primaryObjective === "pvp" || ["balanced", "meta", "opener"].includes(concept.key)
        ? (topArmy.scoreAxes?.burst20s ?? 0) * 0.22
        : 0;
    return (topArmy.total ?? 0) + burstBias + (topArmy.scoreAxes?.formationFit ?? 0) * 0.06;
  };
  const shouldAcceptQuickSelection = (armies = []) => {
    const topArmy = armies[0];
    if (!topArmy) {
      return false;
    }
    const formationReady = topArmy.formationBonus?.active || topArmy.formation?.key === "basic";
    const totalScore = topArmy.total ?? 0;
    const burstScore = topArmy.scoreAxes?.burst20s ?? 0;
    if (concept.primaryObjective === "pvp" || ["balanced", "meta", "opener", "debuff"].includes(concept.key)) {
      return totalScore >= 38 && (formationReady || burstScore >= 30);
    }
    return totalScore >= 36 && formationReady;
  };

  const greedyIds = buildArmyGreedyCommanderSelection(allowedMetas, concept, seedMeta, [], 5, fastEntries);
  let greedyArmies = [];
  if (greedyIds.length === 5) {
    const cachedGreedyArmies = readArmyCommanderSelectionCache(plannerContext, greedyIds);
    if (cachedGreedyArmies.length) {
      greedyArmies = cachedGreedyArmies;
    } else {
      const greedyMetas = greedyIds.map((characterId) => ARMY_CHARACTER_META_BY_ID.get(characterId)).filter(Boolean);
      greedyArmies = buildArmiesForSelectedCommanders(
        greedyMetas,
        allowedMetas,
        concept,
        seedMeta,
        seedSlots,
        formationChoiceKey,
        plannerContext,
        greedyIds
      );
    }
    if (greedyArmies.length) {
      candidateSelections.push({
        ids: greedyIds,
        armies: greedyArmies,
        score: rankSelection(greedyArmies)
      });
      if (shouldAcceptQuickSelection(greedyArmies)) {
        return greedyIds;
      }
    }
  }

  const quickPreferredIds = [...fastEntries]
    .sort((left, right) => {
      const leftBurst = left.bestUnit?.scoreAxes?.burst20s ?? 0;
      const rightBurst = right.bestUnit?.scoreAxes?.burst20s ?? 0;
      const leftControl = left.bestUnit?.scoreAxes?.controlUptime ?? 0;
      const rightControl = right.bestUnit?.scoreAxes?.controlUptime ?? 0;
      const leftSupport = left.meta.groupScores?.support ?? 0;
      const rightSupport = right.meta.groupScores?.support ?? 0;
      return rightBurst + rightControl * 0.45 + rightSupport * 0.12 - (leftBurst + leftControl * 0.45 + leftSupport * 0.12);
    })
    .slice(0, 8)
    .map((entry) => entry.meta.character.id);
  const guidedIds = buildArmyGreedyCommanderSelection(
    allowedMetas,
    concept,
    seedMeta,
    quickPreferredIds,
    5,
    fastEntries
  );
  if (guidedIds.length === 5 && guidedIds.join(":") !== greedyIds.join(":")) {
    const cachedGuidedArmies = readArmyCommanderSelectionCache(plannerContext, guidedIds);
    const guidedArmies =
      cachedGuidedArmies.length
        ? cachedGuidedArmies
        : buildArmiesForSelectedCommanders(
            guidedIds.map((characterId) => ARMY_CHARACTER_META_BY_ID.get(characterId)).filter(Boolean),
            allowedMetas,
            concept,
            seedMeta,
            seedSlots,
            formationChoiceKey,
            plannerContext,
            guidedIds
          );
    if (guidedArmies.length) {
      candidateSelections.push({
        ids: guidedIds,
        armies: guidedArmies,
        score: rankSelection(guidedArmies)
      });
      if (shouldAcceptQuickSelection(guidedArmies)) {
        return guidedIds;
      }
    }
  }

  const fallbackArmies = buildArmyCommanderSearchFallbackArmies(
    allowedMetas,
    concept,
    seedMeta,
    formationChoiceKey
  );
  if (!fallbackArmies.length) {
    const bestSelection = candidateSelections.sort((left, right) => (right.score ?? -Infinity) - (left.score ?? -Infinity))[0];
    return bestSelection?.ids ?? [];
  }
  const fallbackIds = fallbackArmies[0].units.map((unit) => unit.commander.id).slice(0, 5);
  if (fallbackIds.length === 5) {
    candidateSelections.push({
      ids: fallbackIds,
      armies: fallbackArmies,
      score: rankSelection(fallbackArmies)
    });
  }

  const bestSelection = candidateSelections.sort((left, right) => (right.score ?? -Infinity) - (left.score ?? -Infinity))[0];
  if (!bestSelection?.ids?.length) {
    return [];
  }
  if (bestSelection.armies?.length) {
    storeArmyCommanderSelectionCache(plannerContext, bestSelection.ids, bestSelection.armies);
  }
  return bestSelection.ids;
}

function findNearestBuildableArmySelection(context = null, selectedCommanderIds = []) {
  const plannerContext = context ?? getArmyPlannerContext({ ignoreCommanderSelection: true });
  const {
    concept,
    formationChoiceKey,
    seedMeta,
    usingRoster,
    readyCount,
    allowedMetas
  } = plannerContext;

  const normalizedSelectedIds = sanitizeArmySelectedCommanderIds(selectedCommanderIds, allowedMetas);
  if (normalizedSelectedIds.length < 5 || (usingRoster && readyCount < 25) || allowedMetas.length < 25) {
    return null;
  }

  const fastEntries = buildArmyCommanderFastAutoEntries(
    allowedMetas,
    concept,
    seedMeta,
    normalizedSelectedIds
  );
  const suggestedCommanderIds = buildArmyGreedyCommanderSelection(
    allowedMetas,
    concept,
    seedMeta,
    normalizedSelectedIds,
    5,
    fastEntries
  );
  if (suggestedCommanderIds.length < 5) {
    return null;
  }

  const selectedIdSet = new Set(normalizedSelectedIds);
  const keptIds = normalizedSelectedIds.filter((id) => suggestedCommanderIds.includes(id));
  const addedIds = suggestedCommanderIds.filter((id) => !selectedIdSet.has(id));
  const removedIds = normalizedSelectedIds.filter((id) => !suggestedCommanderIds.includes(id));

  if (keptIds.length < 3) {
    return null;
  }

  return {
    selectedCommanderIds: suggestedCommanderIds,
    keptIds,
    addedIds,
    removedIds,
    overlapCount: keptIds.length
  };
}

function buildArmyCommanderSelectionCacheKey(context = {}, selectedCommanderIds = []) {
  const rarityKey = Array.isArray(context.selectedRarities) ? context.selectedRarities.join(",") : "";
  const commanderKey = [...selectedCommanderIds].map((value) => Number(value)).filter(Number.isFinite).sort((left, right) => left - right).join(",");
  return [
    commanderKey,
    context.concept?.key ?? "",
    context.formationChoiceKey ?? "",
    rarityKey,
    context.seedCharacter?.id ?? 0,
    context.usingRoster ? "roster" : "all"
  ].join("|");
}

function storeArmyCommanderSelectionCache(context = {}, selectedCommanderIds = [], armies = []) {
  if (!selectedCommanderIds.length || !armies.length) {
    armyCommanderSelectionCache = null;
    return;
  }

  armyCommanderSelectionCache = {
    key: buildArmyCommanderSelectionCacheKey(context, selectedCommanderIds),
    armies
  };
}

function readArmyCommanderSelectionCache(context = {}, selectedCommanderIds = []) {
  if (!armyCommanderSelectionCache?.armies?.length) {
    return [];
  }
  return armyCommanderSelectionCache.key === buildArmyCommanderSelectionCacheKey(context, selectedCommanderIds)
    ? armyCommanderSelectionCache.armies
    : [];
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

function mergeArmyStatMaps(target = {}, source = {}) {
  Object.entries(source).forEach(([key, value]) => {
    target[key] = (target[key] ?? 0) + Number(value ?? 0);
  });
  return target;
}

function getArmyFormationTypesForUnit(unit) {
  const commander = unit?.commander ?? unit?.character ?? null;
  const baseType = commander?.type ?? "-";
  const text = [
    commander?.battleArtText,
    ...(commander?.skillRecords ?? []).flatMap((skill) => [skill.name, skill.summary, skill.initialEffect, skill.maxEffect]),
    ...(commander?.featureTags ?? [])
  ]
    .filter(Boolean)
    .join(" ");
  const types = new Set([baseType]);

  ["闘", "援"].forEach((typeKey) => {
    if (
      new RegExp(`${typeKey}タイプとしても扱う|${typeKey}タイプとして扱う|${typeKey}タイプを追加`, "u").test(text)
    ) {
      types.add(typeKey);
    }
  });

  return [...types];
}

function getArmyFormationTypeInfo(units) {
  return units.reduce(
    (result, unit) => {
      const commander = unit?.commander ?? unit?.character ?? null;
      const baseType = commander?.type ?? "-";
      const types = getArmyFormationTypesForUnit(unit);

      types.forEach((typeKey) => {
        result.counts[typeKey] = (result.counts[typeKey] ?? 0) + 1;
      });

      if (types.some((typeKey) => typeKey !== baseType)) {
        result.aliasCount += 1;
      }

      return result;
    },
    { counts: {}, aliasCount: 0 }
  );
}

function getArmyFormationRowDemand(units = []) {
  const counts = { front: 0, middle: 0, back: 0 };
  const strengths = { front: 0, middle: 0, back: 0 };

  units.forEach((unit) => {
    const rowScores = unit?.rowScores ?? {};
    const dominant = getArmyDominantRowInfo(rowScores, unit?.defaultRow ?? "middle");
    const dominantRow = dominant.rowKey || "middle";
    const dominantScore = dominant.score ?? (rowScores[dominantRow] ?? 50);

    ARMY_BUILDER_ROW_KEYS.forEach((rowKey) => {
      strengths[rowKey] += rowScores[rowKey] ?? 50;
    });

    counts[dominantRow] += dominantScore >= 72 ? 1.35 : dominantScore >= 60 ? 1 : 0.72;
  });

  return {
    counts,
    strengths: Object.fromEntries(
      ARMY_BUILDER_ROW_KEYS.map((rowKey) => [
        rowKey,
        units.length ? strengths[rowKey] / units.length : 0
      ])
    )
  };
}

function getArmyCommanderTypeCounts(units = []) {
  return units.reduce(
    (result, unit) => {
      const commander =
        unit.commander ??
        unit.unitMembers?.find((member) => member.slotKey === "commander")?.meta?.character ??
        null;
      const typeKey = commander?.type;
      if (typeKey) {
        result[typeKey] = (result[typeKey] ?? 0) + 1;
      }
      return result;
    },
    { 援: 0, 闘: 0, 護: 0, 妨: 0, 智: 0 }
  );
}

function getArmyObservedFormationMixScore(units = [], formation) {
  const typeCounts = getArmyCommanderTypeCounts(units);
  const supportCount = (typeCounts["援"] ?? 0) + Math.max(0, (typeCounts["智"] ?? 0) - 1) * 0.4;
  const assaultCount = (typeCounts["闘"] ?? 0) + (typeCounts["護"] ?? 0);
  const disruptorCount = (typeCounts["妨"] ?? 0) + Math.min(1, typeCounts["智"] ?? 0) * 0.5;
  let score = 56;
  let text = "";

  switch (formation?.key) {
    case "kakuyoku":
      score += supportCount >= 2 ? 18 : supportCount >= 1 ? 6 : -10;
      score += assaultCount >= 2 ? 16 : assaultCount >= 1 ? 6 : -8;
      score += disruptorCount <= 1.5 ? 6 : 0;
      text =
        supportCount >= 2 && assaultCount >= 2
          ? "支援2枚で前圧を支える型"
          : supportCount >= 2
            ? "支援を前列へ回しやすい型"
            : "";
      break;
    case "suikou":
      score += assaultCount >= 3 ? 18 : assaultCount >= 2 ? 8 : -10;
      score += supportCount >= 1 ? 10 : -8;
      score += disruptorCount >= 1 ? 8 : 0;
      text =
        assaultCount >= 3 && supportCount >= 1
          ? "攻め3枚と橋渡し役が揃う型"
          : assaultCount >= 3
            ? "前圧を押し込みやすい型"
            : "";
      break;
    case "sakubou":
      score += disruptorCount >= 3 ? 22 : disruptorCount >= 2 ? 10 : -12;
      score += supportCount >= 1 ? 10 : -6;
      score += assaultCount >= 1 ? 4 : 0;
      text =
        disruptorCount >= 3 && supportCount >= 1
          ? "妨害3枚以上に支援1枚を添える型"
          : disruptorCount >= 3
            ? "妨害寄せで押さえ込む型"
            : "";
      break;
    case "houjin":
      score += supportCount >= 1 ? 10 : -4;
      score += assaultCount >= 2 ? 10 : assaultCount >= 1 ? 4 : -6;
      score += disruptorCount >= 1 ? 6 : 0;
      text =
        supportCount >= 1 && assaultCount >= 2
          ? "中核火力へ支援を添える型"
          : supportCount >= 1
            ? "支援中心で押し込みを作る型"
            : "";
      break;
    default:
      score += supportCount >= 1 ? 6 : 0;
      score += assaultCount >= 2 ? 6 : 0;
      score += disruptorCount >= 1 ? 4 : 0;
      break;
  }

  return {
    score: clampArmyScore(score),
    text,
    typeCounts
  };
}

function getArmyFormationStrategicBias(units = [], concept, formation, counts = null, teamAxes = null) {
  const rowDemand = getArmyFormationRowDemand(units);
  const profileCounts = counts ?? getArmyCommunityProfileCounts(units);
  const formationMix = getArmyObservedFormationMixScore(units, formation);
  const axes =
    teamAxes ??
    {
      burst20s: averageArmyValues(units.map((unit) => unit.scoreAxes?.burst20s ?? 50)),
      sustain40s: averageArmyValues(units.map((unit) => unit.scoreAxes?.sustain40s ?? 50)),
      controlUptime: averageArmyValues(units.map((unit) => unit.scoreAxes?.controlUptime ?? 50)),
      siegeDps: averageArmyValues(units.map((unit) => unit.scoreAxes?.siegeDps ?? 50))
    };
  const rowCapacities = (formation?.slots ?? []).reduce((result, slot) => {
    result[slot.rowKey] = (result[slot.rowKey] ?? 0) + 1;
    return result;
  }, {});
  const rowSupportDemand = units.reduce(
    (result, unit) => {
      for (const member of unit.unitMembers ?? []) {
        const skillText = [
          member.meta?.character?.battleArtText ?? "",
          ...(member.meta?.character?.battleArtEffects ?? []),
          ...(member.meta?.character?.guide?.evaluationPoints ?? []),
          ...(member.meta?.character?.guide?.latestFormation?.focusTitles ?? [])
        ]
          .filter(Boolean)
          .join(" ");
        if (!/(同じ横列|横列の味方|同列の味方|横一列)/u.test(skillText)) {
          continue;
        }
        const preferredRow =
          member.meta?.positionProfile?.dominantRow ??
          getArmyDominantRowInfo(member.meta?.rowScores ?? {}, unit.assignedRow ?? unit.defaultRow ?? "middle").rowKey;
        result[preferredRow] = (result[preferredRow] ?? 0) + (member.slotKey === "commander" ? 1 : 0.72);
      }
      return result;
    },
    { front: 0, middle: 0, back: 0 }
  );
  let bonus = 0;
  const reasons = [];

  switch (formation?.key) {
    case "kakuyoku":
      bonus += Math.max(0, rowDemand.counts.front - 1.1) * 16;
      bonus += Math.max(0, profileCounts.frontline - 0.7) * 10;
      bonus += Math.max(0, profileCounts.support - 1.1) * 14;
      bonus += Math.max(0, axes.sustain40s - 54) * 0.16;
      if (rowDemand.counts.front >= 1.6) {
        reasons.push("前衛向きが多い");
      }
      if (profileCounts.support >= 1.4) {
        reasons.push("支援2枚で前列を支えやすい");
      }
      break;
    case "suikou":
      bonus += Math.max(0, profileCounts.pressure - 2.2) * 16;
      bonus += Math.max(0, profileCounts.frontline - 0.8) * 10;
      bonus += Math.max(0, profileCounts.support - 0.45) * 8;
      bonus += Math.max(0, profileCounts.disruptor - 0.35) * 8;
      bonus += Math.max(0, axes.burst20s - 48) * 0.2;
      bonus += Math.max(0, axes.siegeDps - 46) * 0.16;
      if (Math.max(axes.burst20s, axes.siegeDps) >= 60) {
        reasons.push("攻め筋が太い");
      }
      if (profileCounts.support >= 0.6 || profileCounts.disruptor >= 0.6) {
        reasons.push("橋渡し役がいる");
      }
      break;
    case "houjin":
      bonus += Math.max(0, rowDemand.counts.middle - 1.3) * 10;
      bonus += Math.max(0, profileCounts.pressure - 1.8) * 8;
      bonus += Math.max(0, profileCounts.support - 0.8) * 8;
      bonus += Math.max(0, axes.burst20s - 50) * 0.14;
      if (rowDemand.counts.middle >= 1.8) {
        reasons.push("中列向きが多い");
      }
      break;
    case "sakubou":
      bonus += Math.max(0, profileCounts.disruptor - 1.4) * 20;
      bonus += Math.max(0, profileCounts.support - 0.5) * 12;
      bonus += Math.max(0, axes.controlUptime - 56) * 0.22;
      if (profileCounts.disruptor >= 2) {
        reasons.push("妨害3枚級が作れる");
      }
      if (profileCounts.support >= 0.7) {
        reasons.push("支援1枚を添えやすい");
      }
      break;
    case "basic":
      bonus -= 28;
      reasons.push("基本陣は優先しない");
      break;
    default:
      break;
  }

  bonus += Math.max(0, formationMix.score - 58) * 0.35;
  if (formationMix.text) {
    reasons.push(formationMix.text);
  }

  const rowSupportBonus = [...ARMY_BUILDER_ROW_KEYS].reduce((total, rowKey) => {
    const capacity = rowCapacities[rowKey] ?? 0;
    if (capacity < 2) {
      return total;
    }
    return total + Math.max(0, (rowSupportDemand[rowKey] ?? 0) - 0.45) * (capacity - 1) * 9;
  }, 0);
  bonus += rowSupportBonus;
  if (rowSupportBonus >= 6) {
    reasons.push("横列支援を並べやすい");
  }

  return {
    score: clampArmyScore(50 + bonus),
    rawBonus: bonus,
    reasonText: reasons.join(" / "),
    rowDemand
  };
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
  if (!bonus?.bonuses?.length) {
    return "発動条件は未達です。";
  }

  const statMap = {
    attack: "攻撃",
    defense: "防御",
    war: "戦威",
    strategy: "策略"
  };
  const bonusText = bonus.bonuses
    .map((entry) => {
      const statText = Object.entries(entry.stats ?? {})
        .map(([statKey, value]) => `${statMap[statKey] ?? statKey}+${value}%`)
        .join(" / ");
      const typeLabel = entry.type === "any" ? "いずれか" : `${entry.type}タイプ`;
      const troopText = entry.maxTroopsRate ? `${statText ? " / " : ""}最大兵力+${entry.maxTroopsRate}%` : "";
      return `${typeLabel}${entry.minUnits}部隊以上: ${statText}${troopText}`;
    })
    .join(" + ");
  const extras = [];

  if (bonus.aliasCount) {
    extras.push(`タイプ追加判定 ${bonus.aliasCount}部隊`);
  }
  if (bonus.maxTroopsRate) {
    extras.push(`最大兵力+${bonus.maxTroopsRate}%`);
  }
  const demeritText = Object.entries(bonus.demerits ?? {})
    .filter(([, value]) => Number(value ?? 0) > 0)
    .map(([statKey, value]) => `${statMap[statKey] ?? statKey}-${value}%`)
    .join(" / ");
  if (demeritText) {
    extras.push(`デメリット ${demeritText}`);
  }

  return [bonusText, ...extras].join(" / ");
}

function getArmyFormationActiveBonus(units, formation) {
  const typeInfo = getArmyFormationTypeInfo(units);

  const activeBonuses = (formation.bonuses ?? [])
    .map((bonus) => ({
      ...bonus,
      count: bonus.type === "any" ? units.length : typeInfo.counts[bonus.type] ?? 0,
      value: getArmyFormationBonusValue(bonus.stats) + (bonus.maxTroopsRate ?? 0) * 0.52
    }))
    .filter((bonus) => bonus.count >= bonus.minUnits)
    .sort((left, right) => right.value - left.value);

  if (!activeBonuses.length) {
    return null;
  }

  const stats = activeBonuses.reduce((result, bonus) => mergeArmyStatMaps(result, bonus.stats), {});
  const demerits = activeBonuses.reduce((result, bonus) => mergeArmyStatMaps(result, bonus.demerits), {});
  const maxTroopsRate = Math.round(
    sumArmyValues(activeBonuses.map((bonus) => bonus.maxTroopsRate ?? bonus.maxTroops ?? bonus.maxSoldiers ?? bonus.troops ?? 0))
  );
  const value =
    sumArmyValues(activeBonuses.map((bonus) => getArmyFormationBonusValue(bonus.stats))) -
    getArmyFormationBonusValue(demerits) * 0.84 +
    Math.min(18, maxTroopsRate * 0.6);

  return {
    bonuses: activeBonuses,
    stats,
    demerits,
    maxTroopsRate,
    aliasCount: typeInfo.aliasCount,
    typeCounts: typeInfo.counts,
    value: clampArmyScore(value + Math.max(0, activeBonuses.length - 1) * 8)
  };
}

function getArmyFormationSlotTempoBias(slotKey, formation) {
  const baseSecond = getFormationSlotBaseSecond(formation, slotKey);
  return clampArmyScore(((60 - baseSecond) / 40) * 100) / 100;
}

function getArmyFormationPressureBias(concept) {
  const biasMap = {
    balanced: 0.58,
    siege: 0.86,
    counter: 0.52,
    debuff: 0.8,
    defense: 0.28,
    growth: 0.46,
    meta: 0.54,
    powermax: 0.66
  };
  return biasMap[concept?.key] ?? 0.5;
}

function getArmyObservedProfileLabel(key) {
  return ARMY_OBSERVED_PROFILE_LABELS[key] ?? key;
}

function getArmyObservedTopProfileKey(source = {}) {
  return ["support", "pressure", "frontline", "disruptor", "late"].reduce((bestKey, key) => {
    if (!bestKey) {
      return key;
    }
    return (source[key] ?? 0) > (source[bestKey] ?? 0) ? key : bestKey;
  }, "");
}

function getArmyObservedCountContribution(value) {
  if (value >= 78) {
    return 1;
  }
  if (value >= 64) {
    return 0.8;
  }
  if (value >= 50) {
    return 0.55;
  }
  if (value >= 38) {
    return 0.3;
  }
  return 0;
}

function getArmyObservedBandScore(value, minTarget, maxTarget) {
  const center = (minTarget + maxTarget) / 2;
  const freeBand = Math.max((maxTarget - minTarget) / 2, 0.25);
  const distance = Math.abs(value - center);
  const overflow = Math.max(0, distance - freeBand);
  return clampArmyScore(100 - overflow * 42 - Math.max(0, overflow - 1) * 18);
}

function shiftArmyObservedBand(band = [0, 0], minDelta = 0, maxDelta = minDelta) {
  const nextMin = Math.max(0, (band[0] ?? 0) + minDelta);
  const nextMax = Math.max(nextMin, (band[1] ?? 0) + maxDelta);
  return [nextMin, nextMax];
}

function getArmyObservedFormationTargets(formation, concept) {
  const baseTargets = ARMY_OBSERVED_PATTERN_TARGETS[formation?.key] ?? ARMY_OBSERVED_PATTERN_TARGETS.generic;
  const targets = Object.fromEntries(
    Object.entries(baseTargets).map(([key, band]) => [key, [...band]])
  );

  if (concept?.key === "siege") {
    targets.pressure = shiftArmyObservedBand(targets.pressure, 0.35, 0.45);
    targets.support = shiftArmyObservedBand(targets.support, -0.1, 0.1);
    targets.late = shiftArmyObservedBand(targets.late, -0.2, 0);
  } else if (concept?.key === "defense") {
    targets.support = shiftArmyObservedBand(targets.support, 0.2, 0.4);
    targets.frontline = shiftArmyObservedBand(targets.frontline, 0.45, 0.7);
    targets.pressure = shiftArmyObservedBand(targets.pressure, -0.35, -0.15);
    targets.disruptor = shiftArmyObservedBand(targets.disruptor, 0.1, 0.3);
    targets.late = shiftArmyObservedBand(targets.late, 0.35, 0.6);
  } else if (concept?.key === "debuff") {
    targets.support = shiftArmyObservedBand(targets.support, 0.1, 0.3);
    targets.pressure = shiftArmyObservedBand(targets.pressure, -0.2, 0.1);
    targets.disruptor = shiftArmyObservedBand(targets.disruptor, 0.5, 0.9);
  } else if (concept?.key === "powermax" || concept?.key === "counter") {
    targets.pressure = shiftArmyObservedBand(targets.pressure, 0.15, 0.35);
  }

  return targets;
}

function getArmyObservedFallbackSlotProfile(slot, formation) {
  const tempoBias = getArmyFormationSlotTempoBias(slot.key, formation);
  const isFront = slot.rowKey === "front";
  const isMiddle = slot.rowKey === "middle";
  const isBack = slot.rowKey === "back";
  const profile = {
    support: isMiddle ? 0.76 : isBack ? 0.68 : 0.48,
    pressure: isFront ? 0.82 : isMiddle ? 0.74 : 0.54,
    frontline: isFront ? 0.9 : isMiddle ? 0.68 : 0.42,
    disruptor: isMiddle ? 0.74 : isBack ? 0.6 : 0.5,
    late: isBack ? 0.9 : isMiddle ? 0.6 : 0.44
  };

  if (tempoBias >= 0.72) {
    profile.support += 0.08;
    profile.pressure += 0.14;
    profile.late -= 0.12;
  } else if (tempoBias <= 0.44) {
    profile.support += 0.04;
    profile.pressure -= 0.08;
    profile.frontline += 0.12;
    profile.late += 0.18;
  }

  Object.keys(profile).forEach((key) => {
    profile[key] = Math.max(0.28, Math.min(1, profile[key]));
  });

  return profile;
}

function getArmyObservedSlotProfile(slot, formation) {
  const profile = ARMY_OBSERVED_FORMATION_SLOT_PROFILES[formation?.key]?.[slot?.key];
  if (profile) {
    return profile;
  }
  return getArmyObservedFallbackSlotProfile(slot, formation);
}

function getArmyObservedUnitProfile(unit = {}) {
  const roleSet = new Set(unit.roleTags ?? []);
  const commander = unit.commander ?? unit.unitMembers?.find((member) => member.slotKey === "commander")?.meta?.character ?? null;
  const typeKey = commander?.type ?? "-";
  const expertFamily = unit.expertPattern?.family ?? "hybrid";
  const burstScore = unit.scoreAxes?.burst20s ?? unit.scoreBreakdown?.pressureScore ?? 50;
  const sustainScore = unit.scoreAxes?.sustain40s ?? unit.scoreBreakdown?.sustainScore ?? 50;
  const controlScore = unit.scoreAxes?.controlUptime ?? unit.scoreBreakdown?.utilityScore ?? 50;
  const cleanseScore = unit.scoreAxes?.cleanseCoverage ?? 0;
  const ehpScore = unit.scoreAxes?.ehp ?? unit.scoreBreakdown?.sustainScore ?? 50;
  const powerScore = unit.scoreAxes?.powerCurrent ?? unit.scoreBreakdown?.powerScore ?? 50;
  const tempoScore = unit.scoreBreakdown?.tempoScore ?? 50;
  const frontRowScore = unit.rowScores?.front ?? unit.rowScores?.middle ?? 50;
  const backRowScore = unit.rowScores?.back ?? unit.rowScores?.middle ?? 50;

  const support = clampArmyScore(
    (roleSet.has("role.flex-support") ? 32 : 0) +
      (roleSet.has("support.heal") ? 22 : 0) +
      (roleSet.has("support.cleanse") ? 18 : 0) +
      (typeKey === "援" ? 16 : 0) +
      (expertFamily === "support" ? 18 : 0) +
      (unit.scoreBreakdown?.utilityScore ?? controlScore) * 0.24 +
      cleanseScore * 0.16 +
      sustainScore * 0.08
  );
  const disruptor = clampArmyScore(
    (roleSet.has("role.disruptor") ? 34 : 0) +
      (roleSet.has("control.buff-strip") ? 18 : 0) +
      (roleSet.has("control.fear") ? 18 : 0) +
      (typeKey === "妨" ? 16 : 0) +
      controlScore * 0.38 +
      (expertFamily === "support" ? 10 : 0)
  );
  const frontline = clampArmyScore(
    (roleSet.has("role.frontline-anchor") ? 34 : 0) +
      (roleSet.has("def.damage-cut") ? 18 : 0) +
      (roleSet.has("def.debuff-immunity") ? 14 : 0) +
      (typeKey === "護" ? 16 : 0) +
      ehpScore * 0.34 +
      sustainScore * 0.18 +
      frontRowScore * 0.1 +
      (expertFamily === "defense" ? 16 : 0)
  );
  const pressure = clampArmyScore(
    (roleSet.has("role.burst-commander") ? 30 : 0) +
      (roleSet.has("role.siege-breaker") ? 20 : 0) +
      (roleSet.has("role.counter-enabler") ? 8 : 0) +
      (typeKey === "闘" ? 16 : 0) +
      burstScore * 0.38 +
      powerScore * 0.18 +
      tempoScore * 0.12 +
      (expertFamily === "assault" ? 16 : 0) +
      (expertFamily === "siege" ? 14 : 0)
  );
  const orderLabel = commander?.battleArtMeta?.chainOrder ?? "普通";
  const late = clampArmyScore(
    frontline * 0.4 +
      pressure * 0.22 +
      sustainScore * 0.18 +
      backRowScore * 0.12 +
      (orderLabel === "遅い" ? 16 : orderLabel === "普通" ? 8 : 0) +
      (expertFamily === "defense" ? 10 : 0) +
      (roleSet.has("support.heal") ? 6 : 0)
  );

  return {
    support,
    pressure,
    frontline,
    disruptor,
    late,
    primaryKey: getArmyObservedTopProfileKey({ support, pressure, frontline, disruptor, late })
  };
}

function getArmyObservedSlotProfileMatch(unit, slot, formation, concept) {
  const profile = getArmyObservedUnitProfile(unit);
  const preferences = getArmyObservedSlotProfile(slot, formation);
  const totalWeight = Math.max(sumArmyValues(Object.values(preferences)), 0.01);
  const weightedScore =
    (profile.support * (preferences.support ?? 0) +
      profile.pressure * (preferences.pressure ?? 0) +
      profile.frontline * (preferences.frontline ?? 0) +
      profile.disruptor * (preferences.disruptor ?? 0) +
      profile.late * (preferences.late ?? 0)) /
    totalWeight;
  const preferredKey = getArmyObservedTopProfileKey(preferences);
  let bonus = 0;

  if (concept?.primaryObjective === "siege" && preferredKey === "pressure" && profile.pressure >= 66) {
    bonus += 4;
  }
  if (concept?.primaryObjective === "defense" && (preferredKey === "frontline" || preferredKey === "late") && profile.frontline >= 62) {
    bonus += 4;
  }
  if (concept?.key === "debuff" && preferredKey === "disruptor" && profile.disruptor >= 62) {
    bonus += 4;
  }
  if (preferredKey === "support" && profile.support >= 62) {
    bonus += 3;
  }

  return {
    score: clampArmyScore(weightedScore + bonus),
    profile,
    preferences,
    preferredKey,
    actualKey: profile.primaryKey
  };
}

function getArmyObservedArmyPatternScore(units = [], concept, formation) {
  if (!units.length) {
    return {
      score: 0,
      slotAverage: 0,
      compositionScore: 0,
      counts: { support: 0, pressure: 0, frontline: 0, disruptor: 0, late: 0 },
      matchedSlots: [],
      weakSlots: [],
      focusText: ARMY_OBSERVED_FORMATION_FOCUS_TEXT[formation?.key] ?? "",
      summaryText: ""
    };
  }

  const slotEntries = units.map((unit) => {
    const slot =
      unit.assignedFormationSlot ??
      getFormationSlotMeta(formation, unit.assignedFormationSlot?.key ?? formation?.slots?.[0]?.key ?? "first");
    const match = getArmyObservedSlotProfileMatch(unit, slot, formation, concept);
    return {
      unit,
      slot,
      ...match
    };
  });
  const counts = slotEntries.reduce(
    (result, entry) => {
      result.support += getArmyObservedCountContribution(entry.profile.support);
      result.pressure += getArmyObservedCountContribution(entry.profile.pressure);
      result.frontline += getArmyObservedCountContribution(entry.profile.frontline);
      result.disruptor += getArmyObservedCountContribution(entry.profile.disruptor);
      result.late += getArmyObservedCountContribution(entry.profile.late);
      return result;
    },
    { support: 0, pressure: 0, frontline: 0, disruptor: 0, late: 0 }
  );
  const targets = getArmyObservedFormationTargets(formation, concept);
  const bandScores = {
    support: getArmyObservedBandScore(counts.support, ...(targets.support ?? ARMY_OBSERVED_PATTERN_TARGETS.generic.support)),
    pressure: getArmyObservedBandScore(counts.pressure, ...(targets.pressure ?? ARMY_OBSERVED_PATTERN_TARGETS.generic.pressure)),
    frontline: getArmyObservedBandScore(counts.frontline, ...(targets.frontline ?? ARMY_OBSERVED_PATTERN_TARGETS.generic.frontline)),
    disruptor: getArmyObservedBandScore(counts.disruptor, ...(targets.disruptor ?? ARMY_OBSERVED_PATTERN_TARGETS.generic.disruptor)),
    late: getArmyObservedBandScore(counts.late, ...(targets.late ?? ARMY_OBSERVED_PATTERN_TARGETS.generic.late))
  };
  const formationMix = getArmyObservedFormationMixScore(units, formation);
  const diversityScore = clampArmyScore(
    54 +
      Math.min(18, new Set(slotEntries.map((entry) => entry.actualKey)).size * 9) +
      (counts.support >= 0.9 ? 8 : -6) +
      (counts.pressure >= 2.4 ? 10 : counts.pressure >= 1.8 ? 4 : -8) +
      (counts.frontline >= 0.8 ? 8 : concept?.key === "defense" ? -10 : -4) +
      (counts.disruptor <= (concept?.key === "debuff" ? 2.4 : 1.6) ? 4 : -6)
  );
  const slotAverage = clampArmyScore(averageArmyValues(slotEntries.map((entry) => entry.score)));
  const compositionScore = clampArmyScore(
    bandScores.support * 0.22 +
      bandScores.pressure * 0.24 +
      bandScores.frontline * 0.2 +
      bandScores.disruptor * 0.14 +
      bandScores.late * 0.12 +
      diversityScore * 0.04 +
      formationMix.score * 0.08
  );
  const matchedSlots = slotEntries
    .filter((entry) => entry.score >= 70)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((entry) => `${entry.slot.label}${getArmyObservedProfileLabel(entry.actualKey)}`);
  const weakSlots = slotEntries
    .filter((entry) => entry.score < 56)
    .sort((left, right) => left.score - right.score)
    .slice(0, 2)
    .map((entry) => `${entry.slot.label}${getArmyObservedProfileLabel(entry.preferredKey)}寄り`);

  return {
    score: clampArmyScore(compositionScore * 0.68 + slotAverage * 0.32),
    slotAverage,
    compositionScore,
    counts,
    bandScores,
    diversityScore,
    formationMixScore: formationMix.score,
    formationMixText: formationMix.text,
    matchedSlots,
    weakSlots,
    focusText:
      ARMY_OBSERVED_FORMATION_FOCUS_TEXT[formation?.key] ??
      "役割を散らしつつ、速い枠と遅い枠の使い分けを見ています。",
      summaryText: `支援${counts.support.toFixed(1)} / 圧力${counts.pressure.toFixed(1)} / 前線${counts.frontline.toFixed(1)} / 妨害${counts.disruptor.toFixed(1)}${formationMix.text ? ` / 型 ${formationMix.text}` : ""}`
  };
}

function getArmyCommunityFormationGuide(formation, concept) {
  const seasonFocusKey = getArmySelectedSeasonFocusKey();
  const seasonFocus = getArmySeasonFocusConfig("s3", concept);
  const guide = ARMY_COMMUNITY_FORMATION_GUIDES[formation?.key] ?? ARMY_COMMUNITY_FORMATION_GUIDES.generic;
  const conceptBonus =
    (ARMY_COMMUNITY_CONCEPT_FORMATION_BONUS[concept?.key]?.[formation?.key] ?? 0) +
    (seasonFocus.formationBias?.[formation?.key] ?? 0);
  const fallbackLabel = FORMATION_MAP[guide.fallbackFormationKey]?.label ?? formation?.label ?? "基本陣";
  const profileTargets = Object.fromEntries(
    Object.entries(guide.profileTargets ?? {}).map(([key, band]) => [
      key,
      shiftArmyObservedBand(band, ...(seasonFocus.profileDelta?.[key] ?? [0, 0]))
    ])
  );
  const axisTargets = Object.fromEntries(
    Object.entries(guide.axisTargets ?? {}).map(([key, band]) => [
      key,
      shiftArmyObservedBand(band, ...(seasonFocus.axisDelta?.[key] ?? [0, 0]))
    ])
  );
  return {
    ...guide,
    seasonFocusKey,
    seasonFocusLabel: seasonFocus.label,
    focusText: `${guide.focusText} ${seasonFocus.summary}`,
    sourceText: `${guide.sourceText} / ${seasonFocus.label}`,
    profileTargets,
    axisTargets,
    conceptBonus,
    fallbackLabel
  };
}

function getArmyCommunityProfileCounts(units = []) {
  return units.reduce(
    (result, unit) => {
      const profile = getArmyObservedUnitProfile(unit);
      result.support += getArmyObservedCountContribution(profile.support);
      result.pressure += getArmyObservedCountContribution(profile.pressure);
      result.frontline += getArmyObservedCountContribution(profile.frontline);
      result.disruptor += getArmyObservedCountContribution(profile.disruptor);
      result.late += getArmyObservedCountContribution(profile.late);
      result.primaryCounts[profile.primaryKey] = (result.primaryCounts[profile.primaryKey] ?? 0) + 1;
      return result;
    },
    {
      support: 0,
      pressure: 0,
      frontline: 0,
      disruptor: 0,
      late: 0,
      primaryCounts: {}
    }
  );
}

function getArmyCommonFoundationScore(units = [], concept, formation, activeFormationBonus, formationPlacementScore = 0) {
  const seasonFocus = getArmySeasonFocusConfig("s3", concept);
  if (!units.length) {
    return {
      score: 0,
      chainScore: 0,
      roleCoreScore: 0,
      commanderCoreScore: 0,
      formationReadinessScore: 0,
      summaryText: "",
      warningText: "",
      focusText: "共通条件とS3条件を分けて見ます。"
    };
  }

  const counts = getArmyCommunityProfileCounts(units);
  const chainScore = clampArmyScore(averageArmyValues(units.map((unit) => unit.chainAverage ?? 0)));
  const videoTheoryScore = clampArmyScore(averageArmyValues(units.map((unit) => unit.videoTheory?.score ?? 50)));
  const commanderCoreScore = clampArmyScore(
    averageArmyValues(units.map((unit) => getArmySlotBaseScore(getArmyMeta(unit.commander), "commander", concept)))
  );
  const roleCoreScore = clampArmyScore(
    getArmyObservedBandScore(counts.support, 0.8, 1.8) * 0.22 +
      getArmyObservedBandScore(counts.pressure, 1.8, 3.6) * 0.3 +
      getArmyObservedBandScore(counts.frontline, 0.8, 1.8) * 0.24 +
      getArmyObservedBandScore(counts.disruptor, 0.2, 1.4) * 0.12 +
      getArmyObservedBandScore(counts.late, 0.8, 2) * 0.12
  );
  const s3DensityScore = clampArmyScore(
    getArmyObservedBandScore(counts.support, 1, 2.1) * 0.54 +
      getArmyObservedBandScore(counts.disruptor, 0.5, 1.6) * 0.46
  );
  const formationReadinessScore = clampArmyScore(
    (activeFormationBonus ? 74 + activeFormationBonus.value * 0.22 : 48) * 0.5 +
      formationPlacementScore * 0.3 +
      averageArmyValues(units.map((unit) => unit.scoreAxes?.sustain40s ?? 50)) * 0.2
  );
  const commonRequirementScore = clampArmyScore(
    chainScore * 0.32 +
      roleCoreScore * 0.3 +
      commanderCoreScore * 0.2 +
      formationReadinessScore * 0.18
  );
  const s3ConditionScore = clampArmyScore(
    s3DensityScore * 0.4 +
      videoTheoryScore * 0.36 +
      formationReadinessScore * 0.24
  );
  const commonConditionText = [
    counts.support >= 0.7 ? "始動役あり" : "始動役不足",
    counts.pressure >= 1.7 ? "圧力あり" : "圧力不足",
    counts.frontline >= 0.7 ? "前線あり" : "前線不足",
    chainScore >= 60 ? "副将連鎖あり" : "副将連鎖不足",
    commanderCoreScore >= 62 ? "主将軸成立" : "主将軸が弱い"
  ].join(" / ");
  const s3ConditionText = [
    s3DensityScore >= 60 ? "支援/妨害密度○" : "支援/妨害密度不足",
    videoTheoryScore >= 60 ? "技能束ね○" : "技能束ね不足",
    formationReadinessScore >= 60 ? "配置準備○" : "配置準備不足"
  ].join(" / ");
  const s2ReferenceText =
    (seasonFocus.referenceMix?.s2 ?? 0) >= 0.1
      ? "S2参考を少し強めに反映: 初動20秒と陣形速度も補助加点"
      : "S2参考は軽め: 初動20秒と陣形相性は補助加点のみ";

  const warnings = [];
  if (counts.support < 0.7) {
    warnings.push("支援不足");
  }
  if (counts.pressure < 1.7) {
    warnings.push("圧力不足");
  }
  if (counts.frontline < 0.7) {
    warnings.push("前線不足");
  }
  if (chainScore < 60) {
    warnings.push("連鎖率不足");
  }
  if (formationPlacementScore < 58) {
    warnings.push("配置不足");
  }
  if (s3DensityScore < 58) {
    warnings.push("S3支援/妨害不足");
  }

  return {
    score: clampArmyScore(
      chainScore * 0.24 +
        roleCoreScore * 0.28 +
        commanderCoreScore * 0.2 +
        formationReadinessScore * 0.14 +
        s3DensityScore * 0.08 +
        videoTheoryScore * 0.06
    ),
    chainScore,
    roleCoreScore,
    commanderCoreScore,
    formationReadinessScore,
    videoTheoryScore,
    s3DensityScore,
    commonRequirementScore,
    s3ConditionScore,
    summaryText: `必要 ${commonRequirementScore.toFixed(0)} / S3 ${s3ConditionScore.toFixed(0)} / 配置 ${formationReadinessScore.toFixed(0)}`,
    warningText: warnings.join(" / "),
    focusText:
      `共通では主将軸・副将連鎖・支援/圧力/前線の最低限を見ます。S3では支援/妨害/継戦の密度と技能束ねを十分条件寄りに扱います。 ${seasonFocus.summary}`,
    commonConditionText,
    s3ConditionText,
    s2ReferenceText
  };
}

function getArmyCommunityFormationGuideScore(units = [], concept, formation, activeFormationBonus, formationPlacementScore = 0) {
  const guide = getArmyCommunityFormationGuide(formation, concept);
  if (!units.length) {
    return {
      score: 0,
      naturalnessScore: 0,
      replacementFlexScore: 0,
      antiForceScore: 0,
      counts: { support: 0, pressure: 0, frontline: 0, disruptor: 0, late: 0 },
      primaryCounts: {},
      focusText: guide.focusText,
      sourceText: guide.sourceText,
      summaryText: "",
      warningText: "",
      improvementTip: "",
      conceptBonus: guide.conceptBonus,
      fallbackLabel: guide.fallbackLabel
    };
  }

  const counts = getArmyCommunityProfileCounts(units);
  const teamAxes = {
    burst20s: averageArmyValues(units.map((unit) => unit.scoreAxes?.burst20s ?? 50)),
    sustain40s: averageArmyValues(units.map((unit) => unit.scoreAxes?.sustain40s ?? 50)),
    controlUptime: averageArmyValues(units.map((unit) => unit.scoreAxes?.controlUptime ?? 50)),
    siegeDps: averageArmyValues(units.map((unit) => unit.scoreAxes?.siegeDps ?? 50)),
    cleanseCoverage: averageArmyValues(units.map((unit) => unit.scoreAxes?.cleanseCoverage ?? 0))
  };
  const baseProfileTargets = guide.profileTargets ?? ARMY_COMMUNITY_FORMATION_GUIDES.generic.profileTargets;
  const baseAxisTargets = guide.axisTargets ?? ARMY_COMMUNITY_FORMATION_GUIDES.generic.axisTargets;
  const profileScores = {
    support: getArmyObservedBandScore(counts.support, ...(baseProfileTargets.support ?? [0, 100])),
    pressure: getArmyObservedBandScore(counts.pressure, ...(baseProfileTargets.pressure ?? [0, 100])),
    frontline: getArmyObservedBandScore(counts.frontline, ...(baseProfileTargets.frontline ?? [0, 100])),
    disruptor: getArmyObservedBandScore(counts.disruptor, ...(baseProfileTargets.disruptor ?? [0, 100])),
    late: getArmyObservedBandScore(counts.late, ...(baseProfileTargets.late ?? [0, 100]))
  };
  const axisScores = {
    burst20s: getArmyObservedBandScore(teamAxes.burst20s, ...(baseAxisTargets.burst20s ?? [0, 100])),
    sustain40s: getArmyObservedBandScore(teamAxes.sustain40s, ...(baseAxisTargets.sustain40s ?? [0, 100])),
    controlUptime: getArmyObservedBandScore(teamAxes.controlUptime, ...(baseAxisTargets.controlUptime ?? [0, 100])),
    siegeDps: getArmyObservedBandScore(teamAxes.siegeDps, ...(baseAxisTargets.siegeDps ?? [0, 100])),
    cleanseCoverage: getArmyObservedBandScore(teamAxes.cleanseCoverage, ...(baseAxisTargets.cleanseCoverage ?? [0, 100]))
  };
  const naturalnessScore = clampArmyScore(
    profileScores.support * 0.16 +
      profileScores.pressure * 0.26 +
      profileScores.frontline * 0.18 +
      profileScores.disruptor * 0.16 +
      profileScores.late * 0.08 +
      averageArmyValues(Object.values(axisScores)) * 0.16
  );
  const roleFloorHits = ["support", "pressure", "frontline", "disruptor"].filter(
    (key) => counts[key] >= Math.max(0.4, (baseProfileTargets[key]?.[0] ?? 0.5) * 0.8)
  ).length;
  const uniquePrimaryCount = Object.keys(counts.primaryCounts).length;
  const primaryCrowd = Math.max(...Object.values(counts.primaryCounts), 0);
  const replacementFlexScore = clampArmyScore(
    38 + uniquePrimaryCount * 14 + roleFloorHits * 8 - Math.max(0, primaryCrowd - 2) * 9
  );

  const warnings = [];
  let antiForcePenalty = 0;
  if (formation.key !== "basic" && !activeFormationBonus) {
    antiForcePenalty += formation.key === "sakubou" ? 22 : 18;
    warnings.push("陣効果未発動");
  }
  if (formationPlacementScore < 56) {
    antiForcePenalty += Math.round((56 - formationPlacementScore) * 0.22);
    warnings.push("配置噛み合い不足");
  }

  switch (formation.key) {
    case "suikou":
      if (counts.pressure < 2.2) {
        antiForcePenalty += 18;
        warnings.push("圧力不足");
      }
      if (counts.support < 0.5 && counts.disruptor < 0.4) {
        antiForcePenalty += 12;
        warnings.push("橋渡し不足");
      }
      if (Math.max(teamAxes.burst20s, teamAxes.siegeDps) < 54) {
        antiForcePenalty += 14;
        warnings.push("攻め筋不足");
      }
      break;
    case "kakuyoku":
      if (counts.frontline < 0.9) {
        antiForcePenalty += 18;
        warnings.push("前線不足");
      }
      if (counts.support < 1.1) {
        antiForcePenalty += 14;
        warnings.push("支援不足");
      }
      if (teamAxes.sustain40s < 56) {
        antiForcePenalty += 12;
        warnings.push("継戦不足");
      }
      break;
    case "houjin":
      if (counts.pressure < 1.9) {
        antiForcePenalty += 14;
        warnings.push("戦法火力不足");
      }
      if (counts.support < 0.8) {
        antiForcePenalty += 10;
        warnings.push("支援核不足");
      }
      break;
    case "sakubou":
      if (counts.disruptor < 1.6) {
        antiForcePenalty += 28;
        warnings.push("妨害核不足");
      }
      if (counts.support < 0.6) {
        antiForcePenalty += 12;
        warnings.push("支援不足");
      }
      if (teamAxes.controlUptime < 60) {
        antiForcePenalty += 22;
        warnings.push("前半妨害不足");
      }
      break;
    default:
      if (!activeFormationBonus) {
        antiForcePenalty += 16;
      }
      if (uniquePrimaryCount < 3) {
        antiForcePenalty += 8;
        warnings.push("役割偏重");
      }
      break;
  }

  const antiForceScore = clampArmyScore(
    100 -
      antiForcePenalty +
      Math.min(8, (activeFormationBonus?.bonuses?.length ?? 0) * 4) +
      Math.max(0, guide.conceptBonus)
  );
  const activeBonusScore = activeFormationBonus
    ? clampArmyScore(56 + activeFormationBonus.value * 0.62 + guide.conceptBonus)
    : clampArmyScore(42 + guide.conceptBonus);
  const score = clampArmyScore(
    naturalnessScore * 0.48 +
      replacementFlexScore * 0.22 +
      antiForceScore * 0.18 +
      activeBonusScore * 0.12
  );
  const warningText = [...new Set(warnings)].join(" / ");

  return {
    score,
    naturalnessScore,
    replacementFlexScore,
    antiForceScore,
    counts: {
      support: counts.support,
      pressure: counts.pressure,
      frontline: counts.frontline,
      disruptor: counts.disruptor,
      late: counts.late
    },
    primaryCounts: counts.primaryCounts,
    focusText: guide.focusText,
    sourceText: guide.sourceText,
    summaryText: `自然さ ${naturalnessScore.toFixed(0)} / 代用性 ${replacementFlexScore.toFixed(0)} / 無理合わせ ${antiForceScore.toFixed(0)}`,
    warningText,
    improvementTip: warningText ? `${warningText.split(" / ")[0]} を補うか ${guide.fallbackLabel} へ戻す` : "",
    conceptBonus: guide.conceptBonus,
    fallbackLabel: guide.fallbackLabel
  };
}

function getArmyFormationViabilityAssessment(
  units = [],
  concept,
  formation,
  activeFormationBonus,
  formationPlacementScore = 0,
  communityGuide = null
) {
  if (!units.length) {
    return {
      score: 0,
      penalty: 100,
      warningText: "",
      teamAxes: {
        burst20s: 0,
        sustain40s: 0,
        controlUptime: 0,
        siegeDps: 0
      }
    };
  }

  const nonBasic = formation?.key !== "basic";
  const teamAxes = {
    burst20s: averageArmyValues(units.map((unit) => unit.scoreAxes?.burst20s ?? 0)),
    sustain40s: averageArmyValues(units.map((unit) => unit.scoreAxes?.sustain40s ?? 0)),
    controlUptime: averageArmyValues(units.map((unit) => unit.scoreAxes?.controlUptime ?? 0)),
    siegeDps: averageArmyValues(units.map((unit) => unit.scoreAxes?.siegeDps ?? 0))
  };
  const warnings = [];
  let penalty = 0;

  if (nonBasic && !activeFormationBonus) {
    penalty += formation?.key === "sakubou" ? 34 : 26;
    warnings.push("陣効果未発動");
  }

  if (nonBasic && formationPlacementScore < 60) {
    penalty += Math.round((60 - formationPlacementScore) * 0.45);
    warnings.push("配置準備不足");
  }

  if (communityGuide && nonBasic && communityGuide.antiForceScore < 60) {
    penalty += Math.round((60 - communityGuide.antiForceScore) * 0.5);
  }

  const pressureHeavyConcept =
    concept?.primaryObjective === "pvp" || ["balanced", "meta", "opener", "debuff"].includes(concept?.key);
  if (pressureHeavyConcept && teamAxes.burst20s < 30) {
    penalty += Math.round((30 - teamAxes.burst20s) * 1.1);
    warnings.push("初動火力不足");
  }

  switch (formation?.key) {
    case "sakubou":
      if ((communityGuide?.counts?.disruptor ?? 0) < 1.8) {
        penalty += 18;
        warnings.push("妨害枚数不足");
      }
      if ((communityGuide?.counts?.support ?? 0) < 0.6) {
        penalty += 12;
        warnings.push("支援不足");
      }
      if (teamAxes.controlUptime < 60) {
        penalty += Math.round((60 - teamAxes.controlUptime) * 0.8);
        warnings.push("妨害維持不足");
      }
      if (teamAxes.burst20s < 28) {
        penalty += Math.round((28 - teamAxes.burst20s) * 0.9);
        warnings.push("削り不足");
      }
      break;
    case "suikou":
      if (teamAxes.burst20s < 56) {
        penalty += Math.round((56 - teamAxes.burst20s) * 0.65);
        warnings.push("速攻不足");
      }
      if ((communityGuide?.counts?.support ?? 0) < 0.5 && (communityGuide?.counts?.disruptor ?? 0) < 0.4) {
        penalty += 10;
        warnings.push("橋渡し不足");
      }
      if (teamAxes.siegeDps < 46 && concept?.primaryObjective === "siege") {
        penalty += Math.round((46 - teamAxes.siegeDps) * 0.5);
      }
      break;
    case "kakuyoku":
      if ((communityGuide?.counts?.support ?? 0) < 1.1) {
        penalty += 12;
        warnings.push("支援不足");
      }
      if (teamAxes.sustain40s < 58) {
        penalty += Math.round((58 - teamAxes.sustain40s) * 0.65);
        warnings.push("継戦不足");
      }
      break;
    case "houjin":
      if (teamAxes.burst20s < 38) {
        penalty += Math.round((38 - teamAxes.burst20s) * 0.45);
        warnings.push("押し込み不足");
      }
      break;
    default:
      break;
  }

  const bonusCredit = activeFormationBonus ? Math.min(10, (activeFormationBonus.value ?? 0) * 0.08) : 0;
  return {
    score: clampArmyScore(100 - penalty + bonusCredit),
    penalty: Math.max(0, Math.round(penalty - bonusCredit)),
    warningText: [...new Set(warnings)].join(" / "),
    teamAxes
  };
}

function getArmyFormationPlacementScore(unit, slot, formation, concept) {
  const rowScore = unit.rowScores[slot.rowKey] ?? unit.rowScores[unit.defaultRow] ?? 50;
  const tempoBias = getArmyFormationSlotTempoBias(slot.key, formation);
  const pressureProfile = clampArmyScore(
    (unit.scoreAxes?.burst20s ?? unit.scoreBreakdown?.pressureScore ?? 50) * 0.5 +
      (unit.scoreAxes?.controlUptime ?? unit.scoreBreakdown?.tempoScore ?? 50) * 0.28 +
      (unit.scoreAxes?.powerCurrent ?? 50) * 0.22
  );
  const stabilityProfile = clampArmyScore(
    (unit.scoreAxes?.ehp ?? unit.scoreBreakdown?.sustainScore ?? 50) * 0.48 +
      (unit.scoreAxes?.sustain40s ?? unit.scoreBreakdown?.sustainScore ?? 50) * 0.32 +
      (unit.scoreAxes?.cleanseCoverage ?? unit.scoreBreakdown?.utilityScore ?? 50) * 0.2
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
  const observedMatch = getArmyObservedSlotProfileMatch(unit, slot, formation, concept);

  return clampArmyScore(rowScore * 0.56 + slotFitScore * 0.22 + orderBonus * 0.08 + observedMatch.score * 0.14);
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
  const expertCoverageScore = getArmyExpertCoverageScore(augmentedUnits, concept);
  const commanderQualityScore = clampArmyScore(
    averageArmyValues(
      augmentedUnits.map((unit) => getArmySlotBaseScore(getArmyMeta(unit.commander), "commander", concept))
    )
  );
  const synergyCoverageScore = clampArmyScore(
    averageArmyValues(augmentedUnits.map((unit) => unit.chainAverage)) * 0.34 +
      averageArmyValues(augmentedUnits.map((unit) => unit.synergyScore)) * 0.46 +
      expertCoverageScore * 0.2
  );
  const stabilityScore = clampArmyScore(
    averageArmyValues(augmentedUnits.map((unit) => unit.sustainScore)) * 0.62 +
      averageArmyValues(augmentedUnits.map((unit) => unit.rowScores[unit.assignedRow] ?? 0)) * 0.38
  );
  const objectivePurityScore = clampArmyScore(
    averageArmyValues(
      augmentedUnits.map((unit) => unit.scoreBreakdown.objectiveFitScore)
    ) *
      0.54 +
      roleCoverageScore * 0.28 +
      expertCoverageScore * 0.18
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
  const brittleUnits = augmentedUnits.filter((unit) => (unit.expertPatternScore ?? 0) < 48).length;

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

  const armyWeights = getArmyCompositionWeights(concept, false);

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
  const weightMap = getArmyAxisWeights(concept);
  const augmentedUnits = units.map((unit, index) => {
    const assignedSlot = getFormationSlotMeta(formation, formationAssignment.slotKeys[index] ?? formation.slots[index]?.key);
    const nextUnit = {
      ...unit,
      assignedFormationSlot: assignedSlot,
      assignedRow: assignedSlot.rowKey
    };
    const scoreAxes = buildArmyUnitScoreAxes(nextUnit, concept, formation, assignedSlot.key);
    return {
      ...nextUnit,
      scoreAxes,
      total: scoreArmyAxes(scoreAxes, weightMap),
      tieBreaker:
        scoreAxes.burst20s * 0.46 +
        scoreAxes.controlUptime * 0.24 +
        scoreAxes.powerCurrent * 0.18 +
        scoreAxes.formationFit * 0.12
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
  const expertCoverageScore = getArmyExpertCoverageScore(augmentedUnits, concept);
  const commanderQualityScore = clampArmyScore(
    averageArmyValues(
      augmentedUnits.map((unit) => getArmySlotBaseScore(getArmyMeta(unit.commander), "commander", concept))
    )
  );
  const synergyCoverageScore = clampArmyScore(
    averageArmyValues(augmentedUnits.map((unit) => unit.chainAverage)) * 0.34 +
      averageArmyValues(augmentedUnits.map((unit) => unit.synergyScore)) * 0.46 +
      expertCoverageScore * 0.2
  );
  const stabilityScore = clampArmyScore(
    averageArmyValues(augmentedUnits.map((unit) => unit.sustainScore)) * 0.62 +
      averageArmyValues(augmentedUnits.map((unit) => unit.rowScores[unit.assignedRow] ?? 0)) * 0.38
  );
  const objectivePurityScore = clampArmyScore(
    averageArmyValues(
      augmentedUnits.map((unit) => unit.scoreBreakdown.objectiveFitScore)
    ) *
      0.54 +
      roleCoverageScore * 0.28 +
      expertCoverageScore * 0.18
  );
  const investmentEfficiencyScore = clampArmyScore(
    averageArmyValues(augmentedUnits.map((unit) => unit.scoreBreakdown.investmentScore))
  );
  const activeFormationBonus = getArmyFormationActiveBonus(augmentedUnits, formation);
  const formationPlacementScore = clampArmyScore(formationAssignment.score / Math.max(augmentedUnits.length, 1));
  const formationProfileCounts = getArmyCommunityProfileCounts(augmentedUnits);
  const formationAxesPreview = {
    burst20s: averageArmyValues(augmentedUnits.map((unit) => unit.scoreAxes?.burst20s ?? 50)),
    sustain40s: averageArmyValues(augmentedUnits.map((unit) => unit.scoreAxes?.sustain40s ?? 50)),
    controlUptime: averageArmyValues(augmentedUnits.map((unit) => unit.scoreAxes?.controlUptime ?? 50)),
    siegeDps: averageArmyValues(augmentedUnits.map((unit) => unit.scoreAxes?.siegeDps ?? 50))
  };
  const formationStrategicBias = getArmyFormationStrategicBias(
    augmentedUnits,
    concept,
    formation,
    formationProfileCounts,
    formationAxesPreview
  );
  const formationBonusScore = activeFormationBonus
    ? clampArmyScore(56 + activeFormationBonus.value * 0.72)
    : formation.key === "basic"
      ? 46
      : 8;
  const commonFoundation = getArmyCommonFoundationScore(
    augmentedUnits,
    concept,
    formation,
    activeFormationBonus,
    formationPlacementScore
  );
  const communityGuide = getArmyCommunityFormationGuideScore(
    augmentedUnits,
    concept,
    formation,
    activeFormationBonus,
    formationPlacementScore
  );
  const formationViability = getArmyFormationViabilityAssessment(
    augmentedUnits,
    concept,
    formation,
    activeFormationBonus,
    formationPlacementScore,
    communityGuide
  );
  const formationRecommendationScore =
    formation.key === getConceptRecommendedFormationKey(concept)
      ? clampArmyScore(
          (activeFormationBonus || formation.key === "basic" ? 78 : 58) +
            communityGuide.conceptBonus * 0.5 +
            formationStrategicBias.rawBonus * 0.8 -
            Math.max(0, 58 - formationViability.score) * 0.18
        )
      : clampArmyScore(
          (activeFormationBonus ? 60 : 36) +
            communityGuide.conceptBonus * 0.4 +
            formationStrategicBias.rawBonus * 0.72 -
            Math.abs(formationPlacementScore - 60) * 0.22
        );
  const observedPattern = getArmyObservedArmyPatternScore(augmentedUnits, concept, formation);
  const formationFitScore = clampArmyScore(
    formationPlacementScore * 0.24 +
      formationBonusScore * 0.18 +
      formationRecommendationScore * 0.08 +
      formationStrategicBias.score * 0.1 +
      observedPattern.score * 0.1 +
      communityGuide.score * 0.08 +
      commonFoundation.score * 0.08 +
      formationViability.score * 0.24
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
  const brittleUnits = augmentedUnits.filter((unit) => (unit.expertPatternScore ?? 0) < 48).length;

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
  if (brittleUnits >= 2) {
    penalties.brittleMetaFrame = Math.round(brittleUnits * 2.5);
  }
  const rowDelta = ARMY_BUILDER_ROW_KEYS.reduce((sum, rowKey) => {
    return sum + Math.abs((rowCounts[rowKey] ?? 0) - (concept.rowTarget?.[rowKey] ?? 0));
  }, 0);
  if (rowDelta >= 2) {
    penalties.rowMismatch = Math.round(rowDelta * 2.5);
  }
  if (commonFoundation.warningText.split(" / ").filter(Boolean).length >= 3) {
    penalties.foundationWeak = 8;
  }
  if (formation.key !== "basic" && communityGuide.antiForceScore < 58) {
    penalties.forcedFormation = Math.round((58 - communityGuide.antiForceScore) * (formation.key === "sakubou" ? 0.58 : 0.42));
  }
  if (formation.key !== "basic" && formationViability.penalty > 0) {
    penalties.formationViability = Math.round(formationViability.penalty * 0.7);
  }
  if (formation.key === "basic") {
    penalties.basicFormation = 28;
  }

  const powerEstimate = getArmyPowerEstimate({
    units: augmentedUnits,
    formation: { activeBonus: activeFormationBonus },
    scoreBreakdown: { formationFitScore }
  });
  const formationStats = activeFormationBonus?.stats ?? {};
  const formationDemerits = activeFormationBonus?.demerits ?? {};
  const formationOffenseBonus =
    (formationStats.attack ?? 0) * 0.8 + (formationStats.war ?? 0) * 0.62 + (formationStats.strategy ?? 0) * 0.18;
  const formationDefenseBonus =
    (formationStats.defense ?? 0) * 0.82 + (formationStats.war ?? 0) * 0.28 + (formationStats.strategy ?? 0) * 0.18;
  const formationControlBonus =
    (formationStats.strategy ?? 0) * 0.84 + (formationStats.war ?? 0) * 0.18 + (formationStats.attack ?? 0) * 0.12;
  const formationPenaltyValue =
    (formationDemerits.attack ?? 0) * 0.68 +
    (formationDemerits.defense ?? 0) * 0.74 +
    (formationDemerits.war ?? 0) * 0.64 +
    (formationDemerits.strategy ?? 0) * 0.7;
  const referenceArmyPower = Math.max(getArmyReferenceUnitPower() * 5, 1);
  const scoreAxes = {
    powerCurrent: clampArmyScore((powerEstimate.current / referenceArmyPower) * 100),
    powerPotential: clampArmyScore((powerEstimate.potential / referenceArmyPower) * 100),
    burst20s: clampArmyScore(
      averageArmyValues(augmentedUnits.map((unit) => unit.scoreAxes?.burst20s ?? 0)) * 0.86 + formationOffenseBonus * 0.14
    ),
    sustain40s: clampArmyScore(
      averageArmyValues(augmentedUnits.map((unit) => unit.scoreAxes?.sustain40s ?? 0)) * 0.84 + formationDefenseBonus * 0.16
    ),
    siegeDps: clampArmyScore(
      averageArmyValues(augmentedUnits.map((unit) => unit.scoreAxes?.siegeDps ?? 0)) * 0.88 +
        ((formationStats.attack ?? 0) * 0.74 + (formationStats.war ?? 0) * 0.36) * 0.12
    ),
    ehp: clampArmyScore(
      averageArmyValues(augmentedUnits.map((unit) => unit.scoreAxes?.ehp ?? 0)) * 0.84 + formationDefenseBonus * 0.16
    ),
    controlUptime: clampArmyScore(
      averageArmyValues(augmentedUnits.map((unit) => unit.scoreAxes?.controlUptime ?? 0)) * 0.88 + formationControlBonus * 0.12
    ),
    cleanseCoverage: clampArmyScore(
      averageArmyValues(augmentedUnits.map((unit) => unit.scoreAxes?.cleanseCoverage ?? 0)) * 0.92 +
        ((formationStats.defense ?? 0) * 0.22 + (formationStats.strategy ?? 0) * 0.28) * 0.08
    ),
    formationFit: formationFitScore,
    metaPrior: clampArmyScore(
      averageArmyValues(augmentedUnits.map((unit) => unit.scoreAxes?.metaPrior ?? 0)) * 0.56 +
        roleCoverageScore * 0.08 +
        expertCoverageScore * 0.14 +
        observedPattern.score * 0.12 +
        communityGuide.score * 0.06 +
        commonFoundation.score * 0.12
    ),
    roleCoverage: clampArmyScore(
      roleCoverageScore * 0.74 +
        averageArmyValues(augmentedUnits.map((unit) => unit.scoreAxes?.roleCoverage ?? 0)) * 0.14 +
        commonFoundation.score * 0.12
    ),
    investmentEfficiency: clampArmyScore(
      averageArmyValues(augmentedUnits.map((unit) => unit.scoreAxes?.investmentEfficiency ?? 0)) * 0.76 +
        clampArmyScore((powerEstimate.growth / Math.max(powerEstimate.potential, 1)) * 140) * 0.24
    )
  };
  ARMY_SCORE_AXIS_KEYS.forEach((axisKey) => {
    scoreAxes[axisKey] = clampArmyScore((scoreAxes[axisKey] ?? 0) - formationPenaltyValue * 0.12);
  });

  const scoreBreakdown = {
    armyPowerScore: scoreAxes.powerCurrent,
    roleCoverageScore,
    commanderQualityScore,
    synergyCoverageScore,
    stabilityScore: clampArmyScore(scoreAxes.ehp * 0.54 + scoreAxes.sustain40s * 0.46),
    formationFitScore: scoreAxes.formationFit,
    commonFoundationScore: commonFoundation.score,
    observedPatternScore: observedPattern.score,
    communityGuideScore: communityGuide.score,
    objectivePurityScore,
    investmentEfficiencyScore: scoreAxes.investmentEfficiency
  };

  const total = clampArmyScore(
    scoreArmyAxes(scoreAxes, weightMap) - sumArmyValues(Object.values(penalties)) * 0.42
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
    tieBreaker:
      scoreAxes.powerPotential * 0.34 +
      scoreAxes.burst20s * 0.24 +
      scoreAxes.formationFit * 0.22 +
      synergyCoverageScore * 0.2,
    concept,
    units: augmentedUnits,
    rowCounts,
    formationAssignmentScore: formationAssignment.score,
    ruleCoverage,
    missingRules,
    satisfiedRules,
    penalties,
    scoreBreakdown,
    scoreAxes,
    commonFoundation,
    observedPattern,
    communityGuide,
    preferredAxisText: formatArmyAxisText(scoreAxes, concept, 4),
    summaryParts: [
      `${concept.label}`,
      `陣形 ${formation.label}`,
      `環境 ${getArmySeasonFocusConfig("s3", concept).label}`,
      `前${rowCounts.front} / 中${rowCounts.middle} / 後${rowCounts.back}`,
      seedMeta ? `固定武将 ${seedMeta.character.name}` : "固定武将なし",
      `編成土台: ${commonFoundation.summaryText}`,
      `主要軸: ${formatArmyAxisText(scoreAxes, concept, 3)}`,
      `画像傾向: ${observedPattern.summaryText}`,
      `記事傾向: ${communityGuide.summaryText}`,
      formationStrategicBias.reasonText ? `陣判断: ${formationStrategicBias.reasonText}` : ""
    ],
    improvementTips: [
      missingRules[0] ? `${armyRoleTagLabel(missingRules[0].tag)} を埋める武将へ差し替える` : "",
      rowCounts.front < (concept.rowTarget?.front ?? 0) ? "前列向きの主将を増やす" : "",
      lowAideUnits >= 2 ? "補佐枠を支援寄りの武将へ差し替える" : "",
      brittleUnits >= 2 ? "各部隊に 前衛 or 支援 の軸を入れて型崩れを減らす" : "",
      !activeFormationBonus ? "陣効果が未発動なのでタイプ構成を寄せる" : "",
      scoreAxes.cleanseCoverage < 42 && concept.key === "defense" ? "防衛安定では弱化解除か回復を増やす" : "",
      scoreAxes.controlUptime < 46 && concept.key === "debuff" ? "妨害先手では恐怖や強化解除を前半20秒へ寄せる" : "",
      commonFoundation.warningText ? `${commonFoundation.warningText.split(" / ")[0]} を優先補強する` : "",
      observedPattern.weakSlots[0] ? `${observedPattern.weakSlots[0]} の役割を画像傾向に寄せる` : "",
      communityGuide.improvementTip,
      formation.key === "basic" ? "基本陣は使わず、手持ちの配置適性に合う陣へ寄せる" : ""
    ].filter(Boolean),
    formation: {
      key: formation.key,
      name: formation.label,
      reason: `${formation.description} / ${formation.sourceSummary} / ${formatArmyFormationBonusSummary(activeFormationBonus)}`,
      sourceSummary: formation.sourceSummary,
      timings: formation.timings,
      activeBonus: activeFormationBonus,
      slotAssignments: augmentedUnits.map((unit) => unit.assignedFormationSlot),
      strategicBias: formationStrategicBias
    },
    powerEstimate
  };
}

function evaluateArmyComposition(units, concept, seedMeta, formationChoiceKey = "auto") {
  const choiceKey = sanitizeArmyFormationChoiceKey(formationChoiceKey);
  const formations =
    choiceKey === "auto"
      ? FORMATION_DEFS.filter((formation) => formation.key !== "basic")
      : [FORMATION_MAP[choiceKey] ?? FORMATION_DEFS[0]];

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
          averageArmyValues(nextUnits.map((unit) => unit.synergyScore)) * 0.05 +
          averageArmyValues(nextUnits.map((unit) => unit.scoreAxes?.formationFit ?? 0)) * 0.03 +
          averageArmyValues(nextUnits.map((unit) => unit.scoreAxes?.roleCoverage ?? 0)) * 0.02;

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

function buildArmyCompositionSignature(armyOrUnits) {
  const units = Array.isArray(armyOrUnits) ? armyOrUnits : armyOrUnits?.units ?? [];
  return units
    .map((unit) => unit.signature)
    .filter(Boolean)
    .sort()
    .join("|");
}

function getArmyReservedIds(units, exceptIndex) {
  const reservedIds = new Set();
  units.forEach((unit, unitIndex) => {
    if (unitIndex === exceptIndex) {
      return;
    }
    unit.memberIds.forEach((characterId) => reservedIds.add(characterId));
  });
  return reservedIds;
}

function getArmyUnitMemberMeta(unit, slotKey) {
  return unit.unitMembers.find((member) => member.slotKey === slotKey)?.meta ?? null;
}

function addArmyRefinementCandidate(result, signatures, army, seedMeta) {
  if (!army || (seedMeta && !armyContainsSeed(army, seedMeta))) {
    return;
  }

  const signature = buildArmyCompositionSignature(army);
  if (!signature || signatures.has(signature)) {
    return;
  }

  signatures.add(signature);
  result.push(army);
}

function buildArmyLocalSwapCandidates(baseArmy, unitPool, concept, seedMeta, formationChoiceKey) {
  const results = [];

  for (let unitIndex = 0; unitIndex < baseArmy.units.length; unitIndex += 1) {
    const reservedIds = getArmyReservedIds(baseArmy.units, unitIndex);
    let picked = 0;

    for (const candidate of unitPool) {
      if (candidate.signature === baseArmy.units[unitIndex].signature) {
        continue;
      }
      if ([...candidate.memberIds].some((characterId) => reservedIds.has(characterId))) {
        continue;
      }

      const nextUnits = baseArmy.units.map((unit, index) => (index === unitIndex ? candidate : unit));
      results.push(evaluateArmyComposition(nextUnits, concept, seedMeta, formationChoiceKey));
      picked += 1;

      if (picked >= ARMY_BUILDER_LIMITS.localSearchUnitPool) {
        break;
      }
    }
  }

  return results;
}

function buildArmyLocalCommanderSwapCandidates(baseArmy, allowedMetas, concept, seedMeta, formationChoiceKey) {
  const results = [];

  for (let unitIndex = 0; unitIndex < baseArmy.units.length; unitIndex += 1) {
    const baseUnit = baseArmy.units[unitIndex];
    const reservedIds = getArmyReservedIds(baseArmy.units, unitIndex);
    const vice1Meta = getArmyUnitMemberMeta(baseUnit, "vice1");
    const vice2Meta = getArmyUnitMemberMeta(baseUnit, "vice2");
    const aide1Meta = getArmyUnitMemberMeta(baseUnit, "aide1");
    const aide2Meta = getArmyUnitMemberMeta(baseUnit, "aide2");

    if (!vice1Meta || !vice2Meta || !aide1Meta || !aide2Meta) {
      continue;
    }

    const blockedIds = new Set([vice1Meta.character.id, vice2Meta.character.id, aide1Meta.character.id, aide2Meta.character.id]);
    const commanderCandidates = keepTopArmyEntries(
      allowedMetas
        .filter((meta) => !reservedIds.has(meta.character.id))
        .filter((meta) => meta.character.id !== baseUnit.commander.id && !blockedIds.has(meta.character.id))
        .map((meta) => ({
          meta,
          score: getArmySlotBaseScore(meta, "commander", concept) + getArmyConceptAffinity(meta, concept) * 0.24
        })),
      ARMY_BUILDER_LIMITS.localSearchCommanderPool,
      "score"
    ).map((entry) => entry.meta);

    commanderCandidates.forEach((commanderMeta) => {
      const candidate = buildArmyUnitCandidate(commanderMeta, vice1Meta, vice2Meta, aide1Meta, aide2Meta, concept);
      if (!candidate) {
        return;
      }
      const nextUnits = baseArmy.units.map((unit, index) => (index === unitIndex ? candidate : unit));
      results.push(evaluateArmyComposition(nextUnits, concept, seedMeta, formationChoiceKey));
    });
  }

  return results;
}

function buildArmyLocalAideSwapCandidates(baseArmy, allowedMetas, concept, seedMeta, formationChoiceKey) {
  const results = [];

  for (let unitIndex = 0; unitIndex < baseArmy.units.length; unitIndex += 1) {
    const baseUnit = baseArmy.units[unitIndex];
    const reservedIds = getArmyReservedIds(baseArmy.units, unitIndex);
    const commanderMeta = getArmyMeta(baseUnit.commander);
    const vice1Meta = getArmyUnitMemberMeta(baseUnit, "vice1");
    const vice2Meta = getArmyUnitMemberMeta(baseUnit, "vice2");

    if (!commanderMeta || !vice1Meta || !vice2Meta) {
      continue;
    }

    const availableMetas = allowedMetas.filter((meta) => !reservedIds.has(meta.character.id));
    const aideCandidates = keepTopArmyEntries(
      buildAidePairs(commanderMeta, [vice1Meta, vice2Meta], availableMetas, concept)
        .map((pair) => buildArmyUnitCandidate(commanderMeta, vice1Meta, vice2Meta, pair[0], pair[1], concept))
        .filter(Boolean)
        .filter((candidate) => candidate.signature !== baseUnit.signature),
      ARMY_BUILDER_LIMITS.localSearchAidePairs,
      "total"
    );

    aideCandidates.forEach((candidate) => {
      const nextUnits = baseArmy.units.map((unit, index) => (index === unitIndex ? candidate : unit));
      results.push(evaluateArmyComposition(nextUnits, concept, seedMeta, formationChoiceKey));
    });
  }

  return results;
}

function refineArmyCandidates(initialArmies, unitPool, allowedMetas, concept, seedMeta, formationChoiceKey = "auto") {
  if (!initialArmies.length) {
    return initialArmies;
  }

  const results = [];
  const signatures = new Set();

  initialArmies.forEach((army) => addArmyRefinementCandidate(results, signatures, army, seedMeta));

  initialArmies.slice(0, ARMY_BUILDER_LIMITS.localSearchArmies).forEach((baseArmy) => {
    addArmyRefinementCandidate(
      results,
      signatures,
      evaluateArmyComposition(baseArmy.units, concept, seedMeta, formationChoiceKey),
      seedMeta
    );
    buildArmyLocalSwapCandidates(baseArmy, unitPool, concept, seedMeta, formationChoiceKey).forEach((army) =>
      addArmyRefinementCandidate(results, signatures, army, seedMeta)
    );
    buildArmyLocalCommanderSwapCandidates(baseArmy, allowedMetas, concept, seedMeta, formationChoiceKey).forEach((army) =>
      addArmyRefinementCandidate(results, signatures, army, seedMeta)
    );
    buildArmyLocalAideSwapCandidates(baseArmy, allowedMetas, concept, seedMeta, formationChoiceKey).forEach((army) =>
      addArmyRefinementCandidate(results, signatures, army, seedMeta)
    );
  });

  return keepTopArmyEntries(results, ARMY_BUILDER_LIMITS.finalArmies, "total");
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

  return FORMATION_DEFS.filter((formation) => formation.key !== "basic").map((formation) => {
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

function getArmyResultConfidence(bestArmy, allowedMetas, usingRoster, readyCount, concept) {
  const minOwnedHeroes = ARMY_BUILDER_GATES.minOwnedHeroes ?? 30;
  const minAvailableHeroes = ARMY_BUILDER_GATES.minAvailableHeroes ?? 25;
  const minCommanderCandidates = ARMY_BUILDER_GATES.minCommanderCandidates ?? 5;
  const commanderCandidates = allowedMetas.filter(
    (meta) => getArmySlotBaseScore(meta, "commander", concept) >= getArmySlotSuitabilityFloorScore("commander")
  ).length;
  const checks = [
    {
      ok: !usingRoster || readyCount >= minOwnedHeroes,
      text: usingRoster ? `仕上がり ${readyCount}/${minOwnedHeroes}` : "全武将モード"
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

function buildArmyRoleAudit(bestArmy, allowedMetas, concept, usingRoster, readyCount, formationAlternatives) {
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
  const confidence = getArmyResultConfidence(bestArmy, allowedMetas, usingRoster, readyCount, concept);
  const toolNames = [
    "missing-role-checker",
    "formation-auto-picker",
    "slot-suitability-finder",
    "army-score-explainer"
  ].map((key) => ARMY_SUPPORT_TOOL_NAME_MAP[key] ?? key);
  const topAxes = getArmyTopAxisEntries(bestArmy.scoreAxes, concept, 4);
  const axisWeightText = topAxes.map((entry) => `${entry.label} x${entry.weight.toFixed(2)}`).join(" / ");
  const metaPriorWeight = (getArmyAxisWeights(concept).metaPrior ?? 0) * 100;
  const commonFoundation = bestArmy.commonFoundation ?? null;
  const observedPattern = bestArmy.observedPattern ?? null;
  const communityGuide = bestArmy.communityGuide ?? null;
  const videoTheoryAverage = clampArmyScore(
    averageArmyValues(bestArmy.units.map((unit) => unit.videoTheory?.score ?? 50))
  );
  const videoTheoryUnitText = bestArmy.units
    .map((unit) => `${unit.commander.name} ${Math.round(unit.videoTheory?.score ?? 0)}`)
    .join(" / ");
  const videoTheoryPackages = uniqueValues(
    bestArmy.units.flatMap((unit) => (unit.videoTheory?.packages ?? []).map(getArmyVideoPackageLabel))
  ).join(" / ");
  const videoTheoryWarnings = uniqueValues(
    bestArmy.units.map((unit) => unit.videoTheory?.warningText).filter(Boolean)
  )
    .slice(0, 2)
    .join(" / ");

  return {
    confidence,
    cards: [
      {
        title: "最適化方針",
        body: `${concept.label} モードで多軸スコアを合成しています。`,
        detail: formatArmyAxisText(bestArmy.scoreAxes, concept, 4),
        extra:
          `${axisWeightText}` +
          (metaPriorWeight > 0 ? ` / 世間採用寄りは補助点 ${metaPriorWeight.toFixed(0)}%` : "")
      },
      {
        title: "役割不足",
        body: bestArmy.missingRules.length ? "不足役割があります。" : "必須役割は概ね充足しています。",
        detail: missingText,
        extra: crowdedRoles ? `重なり: ${crowdedRoles}` : `充足: ${satisfiedText}`
      },
      {
        title: "採用基準",
        body: "評価仕様の手持ち数とスロット適性基準を確認しています。",
        detail: `主将候補 ${commanderCandidates} / 副将候補 ${viceCandidates} / 補佐候補 ${aideCandidates}`,
        extra: [
          usingRoster ? `仕上がり ${readyCount}/${ARMY_BUILDER_GATES.minOwnedHeroes ?? 30}` : "全武将モード",
          `候補 ${allowedMetas.length}/${ARMY_BUILDER_GATES.minAvailableHeroes ?? 25}`,
          `下限 主将${Math.round(getArmySlotSuitabilityFloorScore("commander"))} / 副将${Math.round(
            getArmySlotSuitabilityFloorScore("vice")
          )} / 補佐${Math.round(getArmySlotSuitabilityFloorScore("aide"))}`
        ].join(" | ")
      },
      {
        title: "画像傾向",
        body: observedPattern?.focusText ?? "上位画像の並び傾向を採点へ反映しています。",
        detail: observedPattern?.summaryText ?? "支援・圧力・前線の散らし方を見ています。",
        extra: observedPattern
          ? observedPattern.weakSlots.length
            ? `要調整 ${observedPattern.weakSlots.join(" / ")}`
            : `一致 ${observedPattern.matchedSlots.join(" / ") || `傾向一致 ${observedPattern.score.toFixed(0)} / 100`}`
          : "画像データ未反映"
      },
      {
        title: "S3必要条件",
        body: commonFoundation?.commonConditionText ?? "主将軸・副将連鎖・支援/圧力/前線の最低限を見ています。",
        detail: commonFoundation
          ? `必要 ${commonFoundation.commonRequirementScore.toFixed(0)} / 100 / ${commonFoundation.summaryText}`
          : "必要条件 / S3条件 / 配置 を見ています。",
        extra: commonFoundation
          ? [
              commonFoundation.focusText,
              commonFoundation.warningText || "大きな欠けはありません。",
              commonFoundation.s2ReferenceText
            ]
              .filter(Boolean)
              .join(" / ")
          : "主将軸・副将連鎖・支援/圧力/前線を見ています。"
      },
      {
        title: "S3勝ち筋",
        body: commonFoundation?.s3ConditionText ?? "支援/妨害密度と技能束ねを、S3で伸ばしたい十分条件として見ています。",
        detail: commonFoundation
          ? `十分 ${commonFoundation.s3ConditionScore.toFixed(0)} / 100 / 動画一致 ${videoTheoryAverage.toFixed(0)}`
          : "支援/妨害密度 / 技能束ね / 配置 を見ています。",
        extra: commonFoundation
          ? [
              commonFoundation.summaryText,
              commonFoundation.s2ReferenceText
            ]
              .filter(Boolean)
              .join(" / ")
          : "主将軸・副将連鎖・支援/圧力/前線を見ています。"
      },
      {
        title: "動画内容",
        body: "字幕や内容で多かった主将起点 / 連鎖 / 技能束ねの一致度です。",
        detail: `平均 ${videoTheoryAverage.toFixed(1)} / 100 / ${videoTheoryUnitText}`,
        extra: videoTheoryWarnings || (videoTheoryPackages ? `主要要素 ${videoTheoryPackages}` : "主要要素をまだ抽出できていません。")
      },
      {
        title: "記事傾向",
        body: communityGuide?.focusText ?? "主将軸と役割代用を優先し、陣形の無理押しを下げています。",
        detail: communityGuide?.summaryText ?? "自然さ / 代用性 / 無理合わせ を見ています。",
        extra: communityGuide ? communityGuide.warningText || communityGuide.sourceText : "GameWith優先で外部記事をソフト反映"
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

function buildArmyCommanderShortlistLegacy(allowedMetas, concept, bestArmy = null, seedMeta, selectedCommanderIds = []) {
  const activeCommanderMap = new Map((bestArmy?.units ?? []).map((unit, index) => [unit.commander.id, index]));
  const selectedIdSet = new Set(selectedCommanderIds);
  const topCandidates = keepTopArmyEntries(
    allowedMetas.map((meta) => ({
      meta,
      score: clampArmyScore(
        getArmySlotBaseScore(meta, "commander", concept) * 0.56 +
          getArmyConceptAffinity(meta, concept) * 0.18 +
          (meta.objectiveScores?.[concept.primaryObjective] ?? 0) * 0.16 +
          meta.chainPotential * 0.1 +
          (activeCommanderMap.has(meta.character.id) ? 4 : 0) +
          (selectedIdSet.has(meta.character.id) ? 6 : 0) +
          (seedMeta?.character.id === meta.character.id ? 12 : 0)
      )
    })),
    10,
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
      isSelected: selectedIdSet.has(entry.meta.character.id),
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

function buildArmyUnitCandidatesForShortlist(commanderMeta, allowedMetas, concept) {
  return buildUnitCandidatesForCommander(commanderMeta, allowedMetas, concept).slice(
    0,
    Math.max(ARMY_BUILDER_LIMITS.commanderPreviewUnits, 3)
  );
}

function getArmyCommanderNeedScore(commanderMeta, bestUnit, concept) {
  if (!bestUnit) {
    return clampArmyScore(
      getArmySlotBaseScore(commanderMeta, "commander", concept) * 0.74 +
        getArmyConceptAffinity(commanderMeta, concept) * 0.16 +
        (commanderMeta.objectiveScores?.[concept.primaryObjective] ?? 0) * 0.1
    );
  }

  const axes = bestUnit.scoreAxes ?? {};
  const breakdown = bestUnit.scoreBreakdown ?? {};
  const commanderScore = getArmySlotBaseScore(commanderMeta, "commander", concept);
  const objectiveScore = commanderMeta.objectiveScores?.[concept.primaryObjective] ?? 0;
  const readinessScore = getArmyAvailabilityProfile(commanderMeta).currentReadinessScore ?? 100;

  switch (concept.key) {
    case "powermax":
      return clampArmyScore(
        (axes.powerCurrent ?? 0) * 0.32 +
          (axes.powerPotential ?? 0) * 0.16 +
          (breakdown.powerScore ?? 0) * 0.16 +
          commanderScore * 0.16 +
          objectiveScore * 0.08 +
          commanderMeta.groupScores.offense * 0.08 +
          readinessScore * 0.04
      );
    case "siege":
      return clampArmyScore(
        (axes.siegeDps ?? 0) * 0.34 +
          (axes.burst20s ?? 0) * 0.14 +
          (axes.powerCurrent ?? 0) * 0.1 +
          (axes.roleCoverage ?? 0) * 0.08 +
          (axes.formationFit ?? 0) * 0.08 +
          commanderScore * 0.14 +
          objectiveScore * 0.08 +
          commanderMeta.groupScores.offense * 0.04
      );
    case "debuff":
      return clampArmyScore(
        (axes.controlUptime ?? 0) * 0.32 +
          (axes.burst20s ?? 0) * 0.12 +
          (axes.roleCoverage ?? 0) * 0.08 +
          (axes.formationFit ?? 0) * 0.08 +
          commanderScore * 0.14 +
          objectiveScore * 0.08 +
          commanderMeta.groupScores.control * 0.14 +
          readinessScore * 0.04
      );
    case "opener":
      return clampArmyScore(
        (axes.burst20s ?? 0) * 0.3 +
          (axes.controlUptime ?? 0) * 0.22 +
          (axes.formationFit ?? 0) * 0.12 +
          (axes.roleCoverage ?? 0) * 0.08 +
          commanderScore * 0.12 +
          objectiveScore * 0.08 +
          commanderMeta.groupScores.control * 0.1 +
          commanderMeta.groupScores.support * 0.1 +
          readinessScore * 0.05
      );
    case "defense":
      return clampArmyScore(
        (axes.ehp ?? 0) * 0.28 +
          (axes.sustain40s ?? 0) * 0.18 +
          (axes.cleanseCoverage ?? 0) * 0.1 +
          (axes.formationFit ?? 0) * 0.08 +
          commanderScore * 0.14 +
          commanderMeta.groupScores.defense * 0.14 +
          objectiveScore * 0.04 +
          (axes.roleCoverage ?? 0) * 0.04
      );
    case "growth":
      return clampArmyScore(
        (axes.powerPotential ?? 0) * 0.24 +
          (axes.investmentEfficiency ?? 0) * 0.22 +
          (axes.formationFit ?? 0) * 0.08 +
          (axes.roleCoverage ?? 0) * 0.08 +
          commanderScore * 0.14 +
          objectiveScore * 0.08 +
          readinessScore * 0.08 +
          (breakdown.powerScore ?? 0) * 0.08
      );
    case "counter":
      return clampArmyScore(
        (axes.powerPotential ?? 0) * 0.2 +
          (axes.burst20s ?? 0) * 0.12 +
          (axes.sustain40s ?? 0) * 0.12 +
          (axes.formationFit ?? 0) * 0.08 +
          commanderScore * 0.16 +
          commanderMeta.groupScores.offense * 0.12 +
          objectiveScore * 0.08 +
          (breakdown.powerScore ?? 0) * 0.12
      );
    case "meta":
      return clampArmyScore(
        (axes.metaPrior ?? 0) * 0.22 +
          (axes.burst20s ?? 0) * 0.1 +
          (axes.sustain40s ?? 0) * 0.08 +
          (axes.controlUptime ?? 0) * 0.08 +
          (axes.formationFit ?? 0) * 0.08 +
          commanderScore * 0.14 +
          objectiveScore * 0.08 +
          averageArmyValues([commanderMeta.groupScores.support, commanderMeta.groupScores.control]) * 0.1 +
          (axes.roleCoverage ?? 0) * 0.12
      );
    default:
      return clampArmyScore(
        (axes.burst20s ?? 0) * 0.16 +
          (axes.sustain40s ?? 0) * 0.12 +
          (axes.controlUptime ?? 0) * 0.12 +
          (axes.formationFit ?? 0) * 0.08 +
          commanderScore * 0.16 +
          objectiveScore * 0.08 +
          commanderMeta.groupScores.offense * 0.08 +
          commanderMeta.groupScores.defense * 0.08 +
          (axes.roleCoverage ?? 0) * 0.12
      );
  }
}

function buildArmyCommanderPreviewSummary(commanderMeta, allowedMetas, concept) {
  const previewUnits = buildArmyUnitCandidatesForShortlist(commanderMeta, allowedMetas, concept);
  const bestUnit = previewUnits[0] ?? null;
  const viceMembers = bestUnit?.unitMembers.filter((member) => member.slotKey.startsWith("vice")) ?? [];
  const aideMembers = bestUnit?.unitMembers.filter((member) => member.slotKey.startsWith("aide")) ?? [];
  const chainAverage = averageArmyValues(
    viceMembers.map((member) => normalizeChainRate(member.chainStats?.rate ?? 0))
  );
  const shellScore = bestUnit
    ? clampArmyScore(
        (bestUnit.scoreBreakdown?.synergyScore ?? 0) * 0.36 +
          (bestUnit.scoreBreakdown?.slotFitScore ?? 0) * 0.18 +
          (bestUnit.scoreBreakdown?.guideClusterScore ?? 0) * 0.14 +
          (bestUnit.scoreBreakdown?.videoTheoryScore ?? 0) * 0.14 +
          chainAverage * 0.18
      )
    : 0;
  const topUnits = previewUnits.slice(0, Math.max(ARMY_BUILDER_LIMITS.commanderPreviewUnits, 3));
  const roleSpreadScore = clampArmyScore(new Set(topUnits.flatMap((unit) => unit.roleTags ?? [])).size * 6.8);
  const flexibilityScore = topUnits.length
    ? clampArmyScore(
        averageArmyValues(topUnits.map((unit) => unit.total)) * 0.44 +
          averageArmyValues(topUnits.map((unit) => unit.scoreAxes?.roleCoverage ?? 0)) * 0.24 +
          averageArmyValues(topUnits.map((unit) => unit.scoreAxes?.formationFit ?? 0)) * 0.14 +
          roleSpreadScore * 0.18
      )
    : 0;
  const strongCount = topUnits.filter((unit) => unit.total >= Math.max(58, (bestUnit?.total ?? 0) - 8)).length;
  const depthScore = topUnits.length
    ? clampArmyScore(
        averageArmyValues(topUnits.map((unit, index) => unit.total - index * 3)) * 0.76 +
          Math.min(100, strongCount * 18) * 0.24
      )
    : 0;
  const powerEstimate = bestUnit ? getArmyUnitPowerEstimate(bestUnit) : null;
  const focusAxes = bestUnit ? getArmyTopAxisEntries(bestUnit.scoreAxes ?? {}, concept, 2) : [];
  const roleText = bestUnit
    ? uniqueValues(
        bestUnit.roleTags
          .filter(
            (tag) =>
              tag.startsWith("role.") ||
              tag.startsWith("support.") ||
              tag.startsWith("control.") ||
              tag.startsWith("def.")
          )
          .map((tag) => armyRoleTagLabel(tag))
      )
        .slice(0, 4)
        .join(" / ")
    : "役割候補不足";

  return {
    bestUnit,
    focusAxes,
    shellScore,
    flexibilityScore,
    depthScore,
    vicePairText: viceMembers.length ? viceMembers.map((member) => member.meta.character.name).join(" / ") : "副将候補不足",
    viceChainText: viceMembers.length
      ? viceMembers
          .map((member) => `${member.meta.character.name} ${formatPercent(member.chainStats?.rate ?? 0)}`)
          .join(" / ")
      : "連鎖候補不足",
    aidePairText: aideMembers.length ? aideMembers.map((member) => member.meta.character.name).join(" / ") : "補佐候補不足",
    roleText,
    unitPowerText: powerEstimate
      ? `現在 ${Math.round(powerEstimate.current)} / 最大 ${Math.round(powerEstimate.potential)}`
      : "部隊見込み不足"
  };
}

function buildArmyCommanderSafePreview(commanderMeta, concept) {
  const commanderScore = getArmySlotBaseScore(commanderMeta, "commander", concept);
  const conceptAffinity = getArmyConceptAffinity(commanderMeta, concept);
  const powerEstimate = getArmyCharacterPowerSnapshot(commanderMeta);
  const roleText =
    uniqueValues(
      [...commanderMeta.roleTagSet]
        .filter(
          (tag) =>
            tag.startsWith("role.") || tag.startsWith("support.") || tag.startsWith("control.") || tag.startsWith("def.")
        )
        .map((tag) => armyRoleTagLabel(tag))
    )
      .slice(0, 4)
      .join(" / ") || "役割候補整理中";
  const focusParts = [];
  if (commanderMeta.groupScores.control >= 68) {
    focusParts.push("妨害先手");
  }
  if (commanderMeta.groupScores.support >= 68) {
    focusParts.push("支援起点");
  }
  if (commanderMeta.groupScores.offense >= 70) {
    focusParts.push("主将火力");
  }
  if (commanderMeta.groupScores.defense >= 70) {
    focusParts.push("受け持ち");
  }
  return {
    bestUnit: null,
    focusAxes: [],
    shellScore: clampArmyScore(
      commanderMeta.chainPotential * 0.34 +
        commanderMeta.groupScores.support * 0.22 +
        commanderMeta.groupScores.control * 0.18 +
        conceptAffinity * 0.16 +
        commanderScore * 0.1
    ),
    flexibilityScore: clampArmyScore(
      conceptAffinity * 0.42 +
        commanderScore * 0.28 +
        commanderMeta.groupScores.support * 0.1 +
        commanderMeta.groupScores.control * 0.1 +
        commanderMeta.groupScores.offense * 0.1
    ),
    depthScore: clampArmyScore(
      commanderScore * 0.38 +
        conceptAffinity * 0.24 +
        commanderMeta.chainPotential * 0.18 +
        (commanderMeta.character.tenpu / 900) * 100 * 0.2
    ),
    vicePairText: "選択後に副将ペアを再計算",
    viceChainText: "主将選択後に連鎖候補を表示",
    aidePairText: "選択後に補佐候補を再計算",
    roleText,
    focusText: focusParts.join(" / ") || "主将軸を作りやすい",
    unitPowerText: `現在 ${Math.round(powerEstimate.current)} / 最大 ${Math.round(powerEstimate.potential)}`
  };
}

function pickDiverseArmyCommanderShortlist(entries, limit) {
  const sorted = [...entries].sort((left, right) => right.score - left.score);
  const forced = sorted.filter((entry) => entry.isSelected || entry.isSeed || entry.isActive).slice(0, limit);
  const picked = [...forced];
  const pickedIdSet = new Set(picked.map((entry) => entry.meta.character.id));
  const typeCounts = new Map();
  const guideCounts = new Map();
  const focusCounts = new Map();
  const rowCounts = new Map();

  const addCounts = (entry) => {
    const typeKey = entry.meta.character.type || "any";
    const guideKey = entry.meta.character.guideSlot || "any";
    const focusKey = entry.focusAxes?.[0]?.key ?? "general";
    const rowKey =
      entry.bestUnit?.defaultRow ??
      entry.meta.positionProfile?.dominantRow ??
      getArmyDominantRowInfo(entry.bestUnit?.rowScores ?? entry.meta.rowScores ?? {}, "middle").rowKey;
    typeCounts.set(typeKey, (typeCounts.get(typeKey) ?? 0) + 1);
    guideCounts.set(guideKey, (guideCounts.get(guideKey) ?? 0) + 1);
    focusCounts.set(focusKey, (focusCounts.get(focusKey) ?? 0) + 1);
    rowCounts.set(rowKey, (rowCounts.get(rowKey) ?? 0) + 1);
  };

  picked.forEach(addCounts);

  const remaining = sorted.filter((entry) => !pickedIdSet.has(entry.meta.character.id));
  while (picked.length < limit && remaining.length) {
    let bestIndex = 0;
    let bestAdjustedScore = -Infinity;

    remaining.forEach((entry, index) => {
      const typeKey = entry.meta.character.type || "any";
      const guideKey = entry.meta.character.guideSlot || "any";
      const focusKey = entry.focusAxes?.[0]?.key ?? "general";
      const rowKey =
        entry.bestUnit?.defaultRow ??
        entry.meta.positionProfile?.dominantRow ??
        getArmyDominantRowInfo(entry.bestUnit?.rowScores ?? entry.meta.rowScores ?? {}, "middle").rowKey;
      const typeCount = typeCounts.get(typeKey) ?? 0;
      const guideCount = guideCounts.get(guideKey) ?? 0;
      const focusCount = focusCounts.get(focusKey) ?? 0;
      const rowCount = rowCounts.get(rowKey) ?? 0;
      const diversityBonus =
        (typeCount === 0 ? 4.8 : typeCount === 1 ? 1.6 : 0) +
        (guideCount === 0 ? 2.6 : guideCount === 1 ? 0.8 : 0) +
        (focusCount === 0 ? 1.8 : 0) +
        (rowCount === 0 ? 2.6 : rowCount === 1 ? 0.8 : 0) +
        Math.max(0, (entry.flexibilityScore ?? 0) - 70) * 0.03;
      const adjustedScore = entry.score + diversityBonus;

      if (adjustedScore > bestAdjustedScore) {
        bestAdjustedScore = adjustedScore;
        bestIndex = index;
      }
    });

    const [pickedEntry] = remaining.splice(bestIndex, 1);
    picked.push(pickedEntry);
    addCounts(pickedEntry);
  }

  return picked.sort((left, right) => {
    const leftBoost = left.isSelected ? 0.6 : 0;
    const rightBoost = right.isSelected ? 0.6 : 0;
    return right.score + rightBoost - (left.score + leftBoost);
  });
}

function buildArmyCommanderShortlistV2(allowedMetas, concept, bestArmy = null, seedMeta, selectedCommanderIds = []) {
  if (!allowedMetas.length) {
    return [];
  }
  const activeCommanderMap = new Map((bestArmy?.units ?? []).map((unit, index) => [unit.commander.id, index]));
  const selectedIdSet = new Set(selectedCommanderIds);
  const coarseCandidates = keepTopArmyEntries(
    allowedMetas.map((meta) => {
      const commanderScore = getArmySlotBaseScore(meta, "commander", concept);
      const objectiveScore = meta.objectiveScores?.[concept.primaryObjective] ?? 0;
      const conceptAffinity = getArmyConceptAffinity(meta, concept);
      const powerSnapshot = getArmyCharacterPowerSnapshot(meta);
      const powerNowScore = clampArmyScore(
        (powerSnapshot.current / Math.max(getArmyReferenceUnitPower() * 0.38, 1)) * 100
      );
      const positionBiasScore = clampArmyScore(
        (meta.positionProfile?.dominantScore ?? 0) * 2.1 + Math.max(0, meta.positionProfile?.dominantGap ?? 0) * 2.6
      );

      return {
        meta,
        commanderScore,
        objectiveScore,
        conceptAffinity,
        score: clampArmyScore(
          commanderScore * 0.4 +
            conceptAffinity * 0.18 +
            objectiveScore * 0.14 +
            meta.chainPotential * 0.1 +
            positionBiasScore * 0.08 +
            powerNowScore * 0.1 +
            (activeCommanderMap.has(meta.character.id) ? 4 : 0) +
            (selectedIdSet.has(meta.character.id) ? 6 : 0) +
            (seedMeta?.character.id === meta.character.id ? 12 : 0)
        )
      };
    }),
    Math.max(ARMY_BUILDER_LIMITS.commanderPreviewPool, ARMY_BUILDER_LIMITS.commanderShortlist + 6),
    "score"
  );

  const enriched = coarseCandidates.map((entry) => {
    let preview = null;
    try {
      preview = withArmyBuilderLimitOverrides(
        {
          vicePool: Math.min(ARMY_BUILDER_LIMITS.vicePool, ARMY_BUILDER_LIMITS.commanderPreviewVicePool),
          aidePool: Math.min(ARMY_BUILDER_LIMITS.aidePool, ARMY_BUILDER_LIMITS.commanderPreviewAidePool),
          vicePairKeep: Math.min(ARMY_BUILDER_LIMITS.vicePairKeep, ARMY_BUILDER_LIMITS.commanderPreviewVicePairKeep),
          keepUnitsPerCommander: Math.max(ARMY_BUILDER_LIMITS.commanderPreviewUnits, 3)
        },
        () => buildArmyCommanderPreviewSummary(entry.meta, allowedMetas, concept)
      );
    } catch (error) {
      preview = null;
    }
    const safePreview = preview ?? buildArmyCommanderSafePreview(entry.meta, concept);
    const needScore = getArmyCommanderNeedScore(entry.meta, safePreview.bestUnit, concept);
    const slotEntries = getArmySlotSuitabilityEntries(entry.meta, concept);

    return {
      meta: entry.meta,
      isSelected: selectedIdSet.has(entry.meta.character.id),
      isSeed: seedMeta?.character.id === entry.meta.character.id,
      isActive: activeCommanderMap.has(entry.meta.character.id),
      score: clampArmyScore(
          entry.commanderScore * 0.2 +
          entry.conceptAffinity * 0.08 +
          entry.objectiveScore * 0.08 +
          (safePreview.bestUnit?.total ?? 0) * 0.34 +
          needScore * 0.14 +
          safePreview.shellScore * 0.08 +
          safePreview.flexibilityScore * 0.08 +
          safePreview.depthScore * 0.06 +
          (activeCommanderMap.has(entry.meta.character.id) ? 3 : 0) +
          (selectedIdSet.has(entry.meta.character.id) ? 5 : 0) +
          (seedMeta?.character.id === entry.meta.character.id ? 8 : 0)
      ),
      commanderScore: entry.commanderScore,
      buildScore:
        safePreview.bestUnit?.total ??
        clampArmyScore((safePreview.flexibilityScore ?? 0) * 0.64 + (safePreview.shellScore ?? 0) * 0.36),
      needScore,
      shellScore: safePreview.shellScore,
      flexibilityScore: safePreview.flexibilityScore,
      depthScore: safePreview.depthScore,
      bestSlot: slotEntries[0],
      bestUnit: safePreview.bestUnit,
      positionText: entry.meta.positionProfile?.focusText || "汎用",
      focusAxes: safePreview.focusAxes,
      focusText:
        safePreview.focusAxes?.length
          ? safePreview.focusAxes.map((axis) => `${axis.label} ${axis.value.toFixed(1)}`).join(" / ")
          : safePreview.focusText,
      vicePairText: safePreview.vicePairText,
      viceChainText: safePreview.viceChainText,
      aidePairText: safePreview.aidePairText,
      roleText: safePreview.roleText,
      unitPowerText: safePreview.unitPowerText,
      usageText: activeCommanderMap.has(entry.meta.character.id)
        ? `現編成入り: 第${activeCommanderMap.get(entry.meta.character.id) + 1}部隊`
        : "現編成外",
      featureText:
        entry.meta.character.featureTags
          .filter((featureKey) => concept.featureWeights?.[featureKey] >= 10)
          .slice(0, 3)
          .join(" / ") || "主要タグなし"
    };
  });

  const diverseEntries = pickDiverseArmyCommanderShortlist(enriched, ARMY_BUILDER_LIMITS.commanderShortlist);
  const finalEntries = diverseEntries.length
    ? diverseEntries
    : keepTopArmyEntries(
        allowedMetas.map((meta) => {
          const commanderScore = getArmySlotBaseScore(meta, "commander", concept);
          const conceptAffinity = getArmyConceptAffinity(meta, concept);
          const preview = buildArmyCommanderSafePreview(meta, concept);
          const positionBiasScore = clampArmyScore(
            (meta.positionProfile?.dominantScore ?? 0) * 2.1 +
              Math.max(0, meta.positionProfile?.dominantGap ?? 0) * 2.6
          );
          return {
            meta,
            isSelected: selectedIdSet.has(meta.character.id),
            isSeed: seedMeta?.character.id === meta.character.id,
            isActive: activeCommanderMap.has(meta.character.id),
            score: clampArmyScore(
              commanderScore * 0.48 +
                conceptAffinity * 0.22 +
                preview.shellScore * 0.14 +
                preview.depthScore * 0.08 +
                positionBiasScore * 0.08
            ),
            commanderScore,
            buildScore: clampArmyScore(preview.flexibilityScore * 0.64 + preview.shellScore * 0.36),
            needScore: clampArmyScore(commanderScore * 0.58 + conceptAffinity * 0.42),
            shellScore: preview.shellScore,
            flexibilityScore: preview.flexibilityScore,
            depthScore: preview.depthScore,
            bestSlot: getArmySlotSuitabilityEntries(meta, concept)[0],
            bestUnit: null,
            positionText: meta.positionProfile?.focusText || "汎用",
            focusAxes: [],
            focusText: preview.focusText,
            vicePairText: preview.vicePairText,
            viceChainText: preview.viceChainText,
            aidePairText: preview.aidePairText,
            roleText: preview.roleText,
            unitPowerText: preview.unitPowerText,
            usageText: "候補再計算中",
            featureText:
              meta.character.featureTags.filter((featureKey) => concept.featureWeights?.[featureKey] >= 10).slice(0, 3).join(" / ") ||
              "主要タグなし"
          };
        }),
        ARMY_BUILDER_LIMITS.commanderShortlist,
        "score"
      );
  return finalEntries.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
}

function buildArmyViceShortlistForCommander(commanderMeta, allowedMetas, concept, usedIds = new Set()) {
  if (!commanderMeta) {
    return {
      commanderMeta: null,
      entries: []
    };
  }

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
        usageText: usedCount === 2 ? "両方使用中" : usedCount === 1 ? "一部使用中" : "組み込み候補",
        viceChainText: [vice1Fitness, vice2Fitness]
          .map((fitness, pairIndex) => `${pair[pairIndex].character.name} ${formatPercent(fitness.chainStats?.rate ?? 0)}`)
          .join(" / ")
      };
    })
  };
}

function buildArmyPreviewViceShortlist(allowedMetas, concept, seedMeta, selectedCommanderIds = [], commanderShortlist = []) {
  const selectedCommanderMetas = selectedCommanderIds
    .map((characterId) => allowedMetas.find((meta) => meta.character.id === characterId) ?? null)
    .filter(Boolean);
  const allowedIdSet = new Set(allowedMetas.map((meta) => meta.character.id));
  const seedCommanderMeta =
    seedMeta && allowedIdSet.has(seedMeta.character.id)
      ? allowedMetas.find((meta) => meta.character.id === seedMeta.character.id) ?? seedMeta
      : null;
  const focusCommanderMeta =
    selectedCommanderMetas[0] ??
    seedCommanderMeta ??
    commanderShortlist.find((entry) => entry?.meta)?.meta ??
    allowedMetas[0] ??
    null;
  const reservedCommanderIds = new Set(selectedCommanderMetas.map((meta) => meta.character.id));
  const previewAllowedMetas = focusCommanderMeta
    ? allowedMetas.filter(
        (meta) =>
          meta.character.id === focusCommanderMeta.character.id || !reservedCommanderIds.has(meta.character.id)
      )
    : allowedMetas;

  return buildArmyViceShortlistForCommander(focusCommanderMeta, previewAllowedMetas, concept, reservedCommanderIds);
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
  return buildArmyViceShortlistForCommander(commanderMeta, allowedMetas, concept, usedIds);
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

function buildHeuristicArmiesForSelectedCommanders(
  selectedCommanderMetas,
  allowedMetas,
  concept,
  seedMeta,
  formationChoiceKey = "auto"
) {
  if (selectedCommanderMetas.length !== 5) {
    return [];
  }

  const overrideConfig = {
    vicePool: 5,
    aidePool: 4,
    vicePairKeep: 6,
    keepUnitsPerCommander: 3,
    armyBeamWidth: 18
  };
  const commanderEntries = selectedCommanderMetas
    .map((commanderMeta) => ({
      commanderMeta,
      quickScore: getArmyQuickCommanderSelectionScore(commanderMeta, concept, seedMeta),
      previewCandidates: withArmyBuilderLimitOverrides(overrideConfig, () =>
        buildUnitCandidatesForCommander(commanderMeta, allowedMetas, concept)
      ).slice(0, 3)
    }))
    .filter((entry) => entry.previewCandidates.length)
    .sort(
      (left, right) =>
        left.previewCandidates.length - right.previewCandidates.length ||
        (right.quickScore ?? 0) - (left.quickScore ?? 0)
    );

  if (commanderEntries.length !== selectedCommanderMetas.length) {
    return [];
  }

  const pickedUnits = [];
  const signatures = new Set();

  const search = (index, remainingMetas) => {
    if (index >= commanderEntries.length) {
      if (pickedUnits.length !== commanderEntries.length) {
        return null;
      }
      const army = evaluateArmyComposition(pickedUnits, concept, seedMeta, formationChoiceKey);
      const signature = buildArmyCompositionSignature(army);
      if (!signature || signatures.has(signature)) {
        return null;
      }
      signatures.add(signature);
      return army;
    }

    const commanderMeta = commanderEntries[index].commanderMeta;
    const candidates = withArmyBuilderLimitOverrides(overrideConfig, () =>
      buildUnitCandidatesForCommander(commanderMeta, remainingMetas, concept)
    ).slice(0, 3);

    for (const candidate of candidates) {
      const nextRemainingMetas = remainingMetas.filter((meta) => !candidate.memberIds.has(meta.character.id));
      pickedUnits.push(candidate);
      const army = search(index + 1, nextRemainingMetas);
      if (army) {
        return army;
      }
      pickedUnits.pop();
    }

    return null;
  };

  const firstArmy = search(0, allowedMetas);
  return firstArmy ? [firstArmy] : [];
}

function armyContainsSeed(army, seedMeta) {
  if (!seedMeta) {
    return true;
  }

  return army.units.some((unit) =>
    unit.unitMembers.some((member) => member.meta.character.id === seedMeta.character.id)
  );
}

function buildArmiesForSelectedCommanders(
  selectedCommanderMetas,
  allowedMetas,
  concept,
  seedMeta,
  seedSlots,
  formationChoiceKey,
  cacheContext = null,
  cacheSelectedCommanderIds = []
) {
  const selectedIds =
    cacheSelectedCommanderIds.length > 0
      ? cacheSelectedCommanderIds
      : selectedCommanderMetas.map((meta) => meta.character.id);
  if (cacheContext && selectedIds.length) {
    const cachedArmies = readArmyCommanderSelectionCache(cacheContext, selectedIds);
    if (cachedArmies.length) {
      return cachedArmies;
    }
  }

  let armies = buildHeuristicArmiesForSelectedCommanders(
    selectedCommanderMetas,
    allowedMetas,
    concept,
    seedMeta,
    formationChoiceKey
  );
  if (armies.length && cacheContext) {
    storeArmyCommanderSelectionCache(cacheContext, selectedIds, armies);
    return armies;
  }

  const fastSearchConfig = {
    vicePool: Math.min(ARMY_BUILDER_LIMITS.vicePool, 8),
    aidePool: Math.min(ARMY_BUILDER_LIMITS.aidePool, 6),
    vicePairKeep: Math.min(ARMY_BUILDER_LIMITS.vicePairKeep, 16),
    keepUnitsPerCommander: Math.min(ARMY_BUILDER_LIMITS.keepUnitsPerCommander, 8)
  };
  const midSearchConfig = {
    vicePool: Math.min(ARMY_BUILDER_LIMITS.vicePool, 10),
    aidePool: Math.min(ARMY_BUILDER_LIMITS.aidePool, 7),
    vicePairKeep: Math.min(ARMY_BUILDER_LIMITS.vicePairKeep, 20),
    keepUnitsPerCommander: Math.min(ARMY_BUILDER_LIMITS.keepUnitsPerCommander, 10)
  };
  armies = withArmyBuilderLimitOverrides(fastSearchConfig, () =>
    buildArmyStatesFromCommanderGroups(selectedCommanderMetas, allowedMetas, concept, seedMeta, formationChoiceKey)
  );

  if (!armies.length) {
    armies = withArmyBuilderLimitOverrides(midSearchConfig, () =>
      buildArmyStatesFromCommanderGroups(selectedCommanderMetas, allowedMetas, concept, seedMeta, formationChoiceKey)
    );
  }

  if (!armies.length) {
    const commanderPool = getArmyCommanderPool(allowedMetas, concept, seedMeta, seedSlots);
    const genericUnits = buildGenericUnitCandidates(allowedMetas, commanderPool, concept);
    const seedUnits = buildSeedUnitCandidates(seedMeta, seedSlots, allowedMetas, commanderPool, concept);
    const unitPool = keepTopArmyEntries(
      [...genericUnits, ...seedUnits],
      Math.max(ARMY_BUILDER_LIMITS.genericUnitPool, seedUnits.length + 12),
      "total"
    );
    armies = buildArmyStates(unitPool, concept, seedMeta, seedUnits, formationChoiceKey).filter((army) =>
      selectedCommanderMetas.every((meta) => army.units.some((unit) => unit.commander.id === meta.character.id))
    );
  }

  if (!armies.length) {
    armies = buildFallbackArmies(allowedMetas, concept, seedMeta, seedSlots, formationChoiceKey).filter((army) =>
      selectedCommanderMetas.every((meta) => army.units.some((unit) => unit.commander.id === meta.character.id))
    );
  }

  if (!armies.length && cacheContext) {
    armies = readArmyCommanderSelectionCache(cacheContext, selectedIds);
  }

  if (armies.length && cacheContext) {
    storeArmyCommanderSelectionCache(cacheContext, selectedIds, armies);
  }

  return armies;
}

function buildArmyPlannerResult() {
  if (!elements.armyView) {
    return null;
  }

  const context = getArmyPlannerContext();
  const {
    concept,
    seasonFocusKey,
    formationChoiceKey,
    selectedRarities,
    seedCharacter,
    seedMeta,
    seedSlots,
    usingRoster,
    ownedCount,
    readyCount,
    allowedMetas,
    selectedCommanderIds
  } = context;
  const previewResult = buildArmyCommanderPreviewResult(context);
  let effectiveSelectedCommanderIds = [...selectedCommanderIds];
  let autoRepairValidation = "";

  if (effectiveSelectedCommanderIds.length < 5) {
    return previewResult;
  }

  if (usingRoster && readyCount < 25) {
    return {
      ...previewResult,
      validation: `仕上がりが ${readyCount} 体です。5部隊編成には 25 体以上必要です。`
    };
  }

  if (allowedMetas.length < 25) {
    return {
      ...previewResult,
      validation: usingRoster
        ? `仕上がり ${readyCount} 体のうち、この条件で使えるのは ${allowedMetas.length} 体です。レアリティ条件を広げてください。`
        : `選択中のレアリティでは ${allowedMetas.length} 体しか使えません。25体以上を確保してください。`
    };
  }

  let selectedCommanderMetas = getArmySelectedCommanderMetas(allowedMetas);
  let armies = buildArmiesForSelectedCommanders(
    selectedCommanderMetas,
    allowedMetas,
    concept,
    seedMeta,
    seedSlots,
    formationChoiceKey,
    context,
    selectedCommanderIds
  );

  if (!armies.length) {
    const repairedSelection = findNearestBuildableArmySelection(context, effectiveSelectedCommanderIds);
    if (repairedSelection?.selectedCommanderIds?.length) {
      effectiveSelectedCommanderIds = [...repairedSelection.selectedCommanderIds];
      armySelectedCommanderIds = [...effectiveSelectedCommanderIds];
      selectedCommanderMetas = effectiveSelectedCommanderIds
        .map((characterId) => ARMY_CHARACTER_META_BY_ID.get(characterId))
        .filter(Boolean);
      armies = buildArmiesForSelectedCommanders(
        selectedCommanderMetas,
        allowedMetas,
        concept,
        seedMeta,
        seedSlots,
        formationChoiceKey,
        context,
        effectiveSelectedCommanderIds
      );
      const removedNames = repairedSelection.removedIds
        .map((characterId) => ARMY_CHARACTER_META_BY_ID.get(characterId)?.character?.name)
        .filter(Boolean);
      const addedNames = repairedSelection.addedIds
        .map((characterId) => ARMY_CHARACTER_META_BY_ID.get(characterId)?.character?.name)
        .filter(Boolean);
      autoRepairValidation = formatSummaryText(
        [
          "選択した5体では25体が組めなかったため、近い主将構成へ自動補正しました。",
          removedNames.length ? `外した主将: ${removedNames.join(" / ")}` : "",
          addedNames.length ? `追加した主将: ${addedNames.join(" / ")}` : ""
        ].filter(Boolean),
        " "
      );
    }
  }

  if (!armies.length) {
    return {
      ...previewResult,
      validation: "選んだ主将5体で噛み合う25体軍勢を組めませんでした。主将の組み合わせかレアリティ条件を見直してください。"
    };
  }

  const bestArmy = armies[0];
  const formationAlternatives = buildArmyFormationAlternatives(bestArmy, concept, seedMeta);
  const roleAudit = buildArmyRoleAudit(bestArmy, allowedMetas, concept, usingRoster, readyCount, formationAlternatives);
  const commanderShortlist = buildArmyCommanderPoolEntries(context, effectiveSelectedCommanderIds);
  const viceShortlist = buildArmyViceShortlist(bestArmy, allowedMetas, concept, seedMeta);
  const swapSuggestions = buildArmySwapSuggestions(bestArmy, allowedMetas, concept);
  const exclusionReasons = buildArmyExclusionReasons(bestArmy, allowedMetas, concept, []);

  return {
    validation: autoRepairValidation,
    concept,
    seasonFocusKey,
    formationChoiceKey,
    selectedRarities,
    seedCharacter,
    seedSlots,
    summary: formatSummaryText(
      [
        `最適化方針: ${concept.label}`,
        `選択主将: ${selectedCommanderMetas.map((meta) => meta.character.name).join(" / ")}`,
        usingRoster ? `仕上がり: ${readyCount}体 / 登録 ${ownedCount}体` : "全武将モード",
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
    selectedCommanderIds: effectiveSelectedCommanderIds,
    usingRoster,
    ownedCount,
    readyCount,
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
          <p class="field-note">手持ち、固定武将、最適化方針に応じて最終陣形が変わります。</p>
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
  const usingObservedPower = isArmyObservedPowerModeEnabled();
  const axisText = formatArmyAxisText(army.scoreAxes, result.concept, 4);
  const topAxes = getArmyTopAxisEntries(army.scoreAxes, result.concept, 3)
    .map((entry) => `${entry.label} ${entry.value.toFixed(1)}`)
    .join(" / ");
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
      title: usingObservedPower ? "CSV現在戦力" : "推定現在戦力",
      body: usingObservedPower
        ? "貼り付けた現在値の戦力を優先し、主将40 / 副将20 / 補佐10の反映率で部隊戦力へ集計しています。"
        : result.usingRoster
          ? "手持ち入力の育成段階と装備状態を反映した簡易推定です。"
          : "手持ち未入力のため、公開データ基準の完成想定で表示しています。",
      detail: `現在 ${formatArmyEstimateNumber(powerEstimate.current)} / 最大見込み ${formatArmyEstimateNumber(
        powerEstimate.potential
      )}`,
      extra: usingObservedPower
        ? `CSV一致 ${armyObservedPowerState.matchedCount}/${armyObservedPowerState.rowCount} / 陣補正 x${powerEstimate.formationMultiplier.toFixed(
            3
          )}`
        : `完成度 ${powerEstimate.completeness.toFixed(1)} / 100 | 陣補正 x${powerEstimate.formationMultiplier.toFixed(3)}`
    },
    {
      title: "伸びしろ",
      body: usingObservedPower
        ? "CSV実測モードでは、現在値をそのまま採用するため伸びしろは自動計算しません。"
        : `この軍勢はあと ${formatArmyEstimateNumber(powerEstimate.growth)} 伸びる見込みです。`,
      detail: usingObservedPower ? getArmyPowerModelSummaryText() : growthText,
      extra: usingObservedPower
        ? "戦力列がない武将だけ、貼り付けたCSVで最も安定した仮説式から補完します。"
        : "伸び幅が大きい武将から順に、今週の育成候補として見てください。"
    },
    {
      title: "総合スコア",
      body: `上位 ${activeArmyAlternativeIndex + 1} 位の軍勢です。`,
      detail: `総合 ${army.total.toFixed(1)} / 100`,
      extra: topAxes || `現在戦力 ${army.scoreAxes.powerCurrent.toFixed(1)} / 陣形適合 ${army.scoreAxes.formationFit.toFixed(1)}`
    },
    {
      title: "多軸評価",
      body: `${result.concept.label} モードの主要評価軸です。`,
      detail: axisText,
      extra: `役割充足 ${army.scoreAxes.roleCoverage.toFixed(1)} | 世間採用寄り ${army.scoreAxes.metaPrior.toFixed(1)}`
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
      title: "時間軸評価",
      body: "20秒火力、40秒継戦、妨害維持をまとめて見ています。",
      detail: `20秒火力 ${army.scoreAxes.burst20s.toFixed(1)} | 40秒継戦 ${army.scoreAxes.sustain40s.toFixed(1)} | 妨害維持 ${army.scoreAxes.controlUptime.toFixed(1)}`,
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
    return renderEmptyState("軍勢を生成すると、ここに評価仕様ベースの診断を表示します。");
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

function renderArmyCommanderWizard(plannerResult = null) {
  const result = plannerResult ?? buildArmyCommanderPreviewResult();
  const selectedCommanderMetas = (result.selectedCommanderIds ?? [])
    .map((characterId) => ARMY_CHARACTER_META_BY_ID.get(characterId))
    .filter(Boolean);

  if (elements.armyCommanderWizardSummaryGrid) {
    const cards = [
      {
        title: "STEP 1",
        body: `${result.allowedCount ?? 0}体から主将候補を洗い、主将向きの高い順に並べます。`,
        detail: `候補表示 ${result.commanderShortlist?.length ?? 0}体 / ${
          result.usingRoster
            ? `仕上がり ${result.readyCount ?? 0}体 / 登録 ${result.ownedCount ?? 0}体`
            : "全武将モード"
        }`
      },
      {
        title: "STEP 2",
        body: `選択済み ${selectedCommanderMetas.length} / 5`,
        detail: selectedCommanderMetas.length
          ? selectedCommanderMetas.map((meta) => meta.character.name).join(" / ")
          : "まだ主将を選んでいません。"
      },
      {
        title: "STEP 3",
        body: selectedCommanderMetas.length >= 5 ? "副将 / 補佐を組める状態です。" : "主将が5体揃うと残り20枠を提案します。",
        detail: `陣形 ${FORMATION_MAP[result.formationChoiceKey ?? sanitizeArmyFormationChoiceKey(elements.armyFormation?.value ?? "auto")]?.label ?? "自動"} / 方針 ${result.concept?.label ?? "-"}`
      }
    ];
    if (cards[2]) {
      cards[2].detail += ` / 環境 ${getArmySeasonFocusConfig(result.seasonFocusKey ?? "s3", result.concept).label}`;
    }
    elements.armyCommanderWizardSummaryGrid.innerHTML = cards
      .map(
        (card) => `
          <article class="army-summary-card">
            <h3>${escapeHtml(card.title)}</h3>
            <p class="field-note">${escapeHtml(card.body)}</p>
            <p class="toolbar-summary">${escapeHtml(card.detail)}</p>
          </article>
        `
      )
      .join("");
  }

  if (elements.armySelectedCommanderStrip) {
    const selectedMarkup = Array.from({ length: 5 }, (_, index) => {
      const meta = selectedCommanderMetas[index] ?? null;
      return `
        <button
          class="mini-button"
          type="button"
          ${meta ? `data-army-remove-commander="${meta.character.id}"` : "disabled"}
        >
          ${escapeHtml(meta ? `主将${index + 1}: ${meta.character.name}` : `主将${index + 1}: 未選択`)}
        </button>
      `;
    }).join("");
    elements.armySelectedCommanderStrip.innerHTML = selectedMarkup;
  }

  if (elements.armyCommanderHelp) {
    elements.armyCommanderHelp.textContent =
      selectedCommanderMetas.length >= 5
        ? "主将5体が決まったので、「副将・補佐を組む」で残りの20枠を提案できます。"
        : "主将候補カードの「主将に追加」から5体選ぶと、その主将を軸に残りの副将 / 補佐を組みます。";
  }
}

function renderArmyCommanderWizard(plannerResult = null) {
  const result = plannerResult ?? buildArmyCommanderPreviewResult();
  const selectedCommanderMetas = (result.selectedCommanderIds ?? [])
    .map((characterId) => ARMY_CHARACTER_META_BY_ID.get(characterId))
    .filter(Boolean);
  const ownedCharacters = getOwnedArmyCharacters();
  const readyCharacters = getReadyArmyCharacters();

  if (elements.armyCommanderWizardSummaryGrid) {
    const cards = [
      {
        title: "STEP 1",
        body: "手持ち主将プールから5体選ぶと、その5人を軸に25体を組みます。",
        detail: result.usingRoster
          ? `仕上がり ${readyCharacters.length}体 / 手持ち ${ownedCharacters.length}体`
          : `全武将 ${result.allowedCount ?? 0}体`
      },
      {
        title: "STEP 2",
        body: `選択済み ${selectedCommanderMetas.length} / 5`,
        detail: selectedCommanderMetas.length
          ? selectedCommanderMetas.map((meta) => meta.character.name).join(" / ")
          : "まだ主将を選んでいません。"
      },
      {
        title: "STEP 3",
        body: selectedCommanderMetas.length >= 5 ? "副将 / 補佐を組める状態です。" : "主将が5体そろうと残り20枠を提案します。",
        detail: `陣形 ${FORMATION_MAP[result.formationChoiceKey ?? sanitizeArmyFormationChoiceKey(elements.armyFormation?.value ?? "auto")]?.label ?? "自動"} / 方針 ${result.concept?.label ?? "-"} / 参照 ${getArmySeasonFocusConfig(result.seasonFocusKey ?? "s3", result.concept).label}`
      }
    ];
    elements.armyCommanderWizardSummaryGrid.innerHTML = cards
      .map(
        (card) => `
          <article class="army-summary-card">
            <h3>${escapeHtml(card.title)}</h3>
            <p class="field-note">${escapeHtml(card.body)}</p>
            <p class="toolbar-summary">${escapeHtml(card.detail)}</p>
          </article>
        `
      )
      .join("");
  }

  if (elements.armySelectedCommanderStrip) {
    elements.armySelectedCommanderStrip.innerHTML = Array.from({ length: 5 }, (_, index) => {
      const meta = selectedCommanderMetas[index] ?? null;
      return `
        <button
          class="mini-button"
          type="button"
          ${meta ? `data-army-remove-commander="${meta.character.id}"` : "disabled"}
        >
          ${escapeHtml(meta ? `主将${index + 1}: ${meta.character.name}` : `主将${index + 1}: 未選択`)}
        </button>
      `;
    }).join("");
  }

  if (elements.armyCommanderHelp) {
    elements.armyCommanderHelp.textContent =
      selectedCommanderMetas.length >= 5
        ? "主将5体がそろったので、「副将・補佐を組む」で残り20枠を提案できます。"
        : "下の手持ち主将プールから、使いたい主将を5体選んでください。";
  }
}

function renderArmyCommanderWizard(plannerResult = null) {
  const result = plannerResult ?? buildArmyCommanderPreviewResult();
  const selectedCommanderMetas = (result.selectedCommanderIds ?? [])
    .map((characterId) => ARMY_CHARACTER_META_BY_ID.get(characterId))
    .filter(Boolean);
  const ownedCharacters = getOwnedArmyCharacters();
  const readyCharacters = getReadyArmyCharacters();
  const formationLabel =
    FORMATION_MAP[result.formationChoiceKey ?? sanitizeArmyFormationChoiceKey(elements.armyFormation?.value ?? "auto")]?.label ?? "自動";
  const seasonLabel = getArmySeasonFocusConfig(result.seasonFocusKey ?? "s3", result.concept).label;

  if (elements.armyCommanderWizardSummaryGrid) {
    const cards = [
      {
        title: "主将プール",
        body: result.usingRoster ? `仕上がり ${readyCharacters.length} / 所持 ${ownedCharacters.length}` : `全武将 ${result.allowedCount ?? 0}`,
        detail: "下の一覧から5人を選ぶ"
      },
      {
        title: "選択状況",
        body: `${selectedCommanderMetas.length} / 5`,
        detail: selectedCommanderMetas.length
          ? selectedCommanderMetas.map((meta) => meta.character.name).join(" / ")
          : "まだ主将を選んでいません"
      },
      {
        title: "編成条件",
        body: selectedCommanderMetas.length >= 5 ? "副将・補佐を組めます" : "主将を5人選ぶ",
        detail: `${formationLabel} / ${result.concept?.label ?? "-"} / ${seasonLabel}`
      }
    ];
    elements.armyCommanderWizardSummaryGrid.innerHTML = cards
      .map(
        (card) => `
          <article class="army-summary-card">
            <h3>${escapeHtml(card.title)}</h3>
            <p class="field-note">${escapeHtml(card.body)}</p>
            <p class="toolbar-summary">${escapeHtml(card.detail)}</p>
          </article>
        `
      )
      .join("");
  }

  if (elements.armySelectedCommanderStrip) {
    elements.armySelectedCommanderStrip.innerHTML = Array.from({ length: 5 }, (_, index) => {
      const meta = selectedCommanderMetas[index] ?? null;
      const label = meta ? `主将${index + 1}: ${meta.character.name}` : `主将${index + 1}: 未選択`;
      return `
        <button
          class="mini-button"
          type="button"
          ${meta ? `data-army-remove-commander="${meta.character.id}"` : "disabled"}
        >
          ${escapeHtml(label)}
        </button>
      `;
    }).join("");
  }

  if (elements.armyCommanderHelp) {
    elements.armyCommanderHelp.textContent =
      selectedCommanderMetas.length >= 5
        ? "主将5人が揃いました。「副将・補佐を組む」で残り20枠を編成します。"
        : "下の主将プールから、使いたい主将を5人選んでください。";
  }
}

function renderArmyCommanderPoolCard(meta, profile, isSelected, isReady) {
  const snapshot = getArmyCharacterPowerSnapshot(meta.character);
  const statusText = isReady ? "仕上がり" : "未育成";
  const actionLabel = isSelected ? "主将から外す" : "主将に入れる";
  return `
    <article class="quick-card army-commander-card ${isSelected ? "is-selected" : ""} ${!isReady ? "is-dim" : ""}" ${
      isReady ? `data-army-select-commander-card="${meta.character.id}" role="button" tabindex="0"` : ""
    }>
      <span class="status-pill ${isSelected ? "is-live" : isReady ? "is-next" : "is-plan"}">${escapeHtml(
        isSelected ? "選択中" : statusText
      )}</span>
      <img src="${escapeHtml(meta.character.imageUrl)}" alt="${escapeHtml(meta.character.name)}" loading="lazy" />
      <h3>${escapeHtml(meta.character.name)}</h3>
      <p>${escapeHtml(meta.character.rarity)} / ${escapeHtml(meta.character.type || "-")} / 天賦 ${escapeHtml(meta.character.tenpu)}</p>
      <ul>
        <li><span>育成段階</span><span>${escapeHtml(getArmyProfileLabel(ARMY_INVESTMENT_TIER_DEFS, profile.investmentTier))}</span></li>
        <li><span>装備</span><span>${escapeHtml(getArmyProfileLabel(ARMY_EQUIPMENT_FIT_DEFS, profile.equipmentFit))}</span></li>
        <li><span>想定戦力</span><span>${escapeHtml(formatArmyEstimateNumber(snapshot.current))}</span></li>
        <li><span>役割</span><span>${escapeHtml((meta.character.featureTags || []).slice(0, 3).join(" / ") || "-")}</span></li>
      </ul>
      <div class="card-actions">
        <button class="mini-button" type="button" ${isReady ? `data-army-select-commander="${meta.character.id}"` : "disabled"}>
          ${escapeHtml(isReady ? actionLabel : "未育成")}
        </button>
      </div>
    </article>
  `;
}

function renderArmyCommanderPoolGrid(result = null) {
  if (!elements.armyCommanderGrid) {
    return;
  }

  const selectedIdSet = new Set(result?.selectedCommanderIds ?? armySelectedCommanderIds);
  const ownedCharacters = getOwnedArmyCharacters();
  if (!ownedCharacters.length) {
    elements.armyCommanderGrid.innerHTML = renderEmptyState("手持ち登録した武将がここに並びます。");
    return;
  }

  const entries = ownedCharacters
    .map((character) => {
      const profile = getArmyRosterProfile(character.id);
      const meta = getArmyMeta(character);
      const isReady = profile.investmentTier === "trained";
      const isSelected = selectedIdSet.has(character.id);
      const power = getArmyCharacterPowerSnapshot(character).current;
      return { character, profile, meta, isReady, isSelected, power };
    })
    .sort(
      (left, right) =>
        Number(right.isSelected) - Number(left.isSelected) ||
        Number(right.isReady) - Number(left.isReady) ||
        right.power - left.power ||
        left.character.name.localeCompare(right.character.name, "ja")
    );

  elements.armyCommanderGrid.innerHTML = entries
    .map((entry) => renderArmyCommanderPoolCard(entry.meta, entry.profile, entry.isSelected, entry.isReady))
    .join("");
}

function renderArmyCommanderShortlistCardV2(entry) {
  const actionLabel = entry.isSelected ? "選択解除" : "主将に追加";
  const focusText = entry.focusText || "軸は再計算中";
  const positionText = entry.positionText || entry.meta.positionProfile?.focusText || "汎用";
  const buildText = `${entry.buildScore.toFixed(1)} / 100`;
  const depthText = `${(entry.depthScore ?? entry.flexibilityScore).toFixed(1)} / 100`;
  return `
    <article class="quick-card army-commander-card ${entry.isSelected ? "is-selected" : ""}" data-army-select-commander-card="${entry.meta.character.id}" role="button" tabindex="0">
      <span class="status-pill ${entry.isSelected ? "is-live" : entry.rank <= 3 ? "is-live" : "is-next"}">${escapeHtml(
        entry.isSelected ? `選択中 ${entry.rank}` : `主将候補 ${entry.rank}`
      )}</span>
      <h3>${escapeHtml(entry.meta.character.name)}</h3>
      <p>${escapeHtml(entry.meta.character.rarity)} / ${escapeHtml(entry.meta.character.type || "-")} / 天賦 ${entry.meta.character.tenpu}</p>
      <ul>
        <li><span>主将適性</span><span>${entry.commanderScore.toFixed(1)} / 100</span></li>
        <li><span>編成見込み</span><span>${escapeHtml(buildText)}</span></li>
        <li><span>目的一致</span><span>${entry.needScore.toFixed(1)} / 100</span></li>
        <li><span>部隊戦力</span><span>${escapeHtml(entry.unitPowerText)}</span></li>
        <li><span>副将候補</span><span>${escapeHtml(entry.vicePairText)}</span></li>
        <li><span>補佐候補</span><span>${escapeHtml(entry.aidePairText)}</span></li>
        <li><span>配置</span><span>${escapeHtml(positionText)}</span></li>
        <li><span>強み</span><span>${escapeHtml(focusText)}</span></li>
        <li><span>厚み</span><span>${escapeHtml(depthText)}</span></li>
        <li><span>役割</span><span>${escapeHtml(entry.roleText || entry.featureText)}</span></li>
      </ul>
      <div class="card-actions">
        <button class="mini-button" type="button" data-army-select-commander="${entry.meta.character.id}">${escapeHtml(actionLabel)}</button>
      </div>
    </article>
  `;
}

function renderArmyCommanderShortlistCardLegacy(entry) {
  const actionLabel = entry.isSelected ? "選択解除" : "主将に追加";
  return `
    <article class="quick-card army-commander-card ${entry.isSelected ? "is-selected" : ""}" data-army-select-commander-card="${entry.meta.character.id}" role="button" tabindex="0">
      <span class="status-pill ${entry.isSelected ? "is-live" : entry.rank <= 3 ? "is-live" : "is-next"}">${escapeHtml(
        entry.isSelected ? `選択中 ${entry.rank}` : `主将候補 ${entry.rank}`
      )}</span>
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
        <button class="mini-button" type="button" data-army-select-commander="${entry.meta.character.id}">${escapeHtml(actionLabel)}</button>
      </div>
    </article>
  `;
}

function renderArmyCommanderShortlistCardV2(entry) {
  if (entry?.mode === "pool") {
    return renderArmyCommanderPoolCard(entry.meta, entry.profile, entry.isSelected, entry.isReady);
  }
  const actionLabel = entry.isSelected ? "驕ｸ謚櫁ｧ｣髯､" : "荳ｻ蟆・↓霑ｽ蜉";
  const focusText = entry.focusText || "霆ｸ縺ｯ蜀崎ｨ育ｮ嶺ｸｭ";
  const positionText = entry.positionText || entry.meta.positionProfile?.focusText || "汎用";
  const buildText = `${entry.buildScore.toFixed(1)} / 100`;
  const depthText = `${(entry.depthScore ?? entry.flexibilityScore).toFixed(1)} / 100`;
  return `
    <article class="quick-card army-commander-card ${entry.isSelected ? "is-selected" : ""}" data-army-select-commander-card="${entry.meta.character.id}" role="button" tabindex="0">
      <span class="status-pill ${entry.isSelected ? "is-live" : entry.rank <= 3 ? "is-live" : "is-next"}">${escapeHtml(
        entry.isSelected ? `驕ｸ謚樔ｸｭ ${entry.rank}` : `荳ｻ蟆・呵｣・${entry.rank}`
      )}</span>
      <h3>${escapeHtml(entry.meta.character.name)}</h3>
      <p>${escapeHtml(entry.meta.character.rarity)} / ${escapeHtml(entry.meta.character.type || "-")} / 螟ｩ雉ｦ ${entry.meta.character.tenpu}</p>
      <ul>
        <li><span>荳ｻ蟆・←諤ｧ</span><span>${entry.commanderScore.toFixed(1)} / 100</span></li>
        <li><span>邱ｨ謌占ｦ玖ｾｼ縺ｿ</span><span>${escapeHtml(buildText)}</span></li>
        <li><span>逶ｮ逧・ｸ閾ｴ</span><span>${entry.needScore.toFixed(1)} / 100</span></li>
        <li><span>驛ｨ髫頑姶蜉・/span><span>${escapeHtml(entry.unitPowerText)}</span></li>
        <li><span>蜑ｯ蟆・呵｣・/span><span>${escapeHtml(entry.vicePairText)}</span></li>
        <li><span>陬應ｽ仙呵｣・/span><span>${escapeHtml(entry.aidePairText)}</span></li>
        <li><span>驟咲ｽｮ</span><span>${escapeHtml(positionText)}</span></li>
        <li><span>蠑ｷ縺ｿ</span><span>${escapeHtml(focusText)}</span></li>
        <li><span>蜴壹∩</span><span>${escapeHtml(depthText)}</span></li>
        <li><span>蠖ｹ蜑ｲ</span><span>${escapeHtml(entry.roleText || entry.featureText)}</span></li>
      </ul>
      <div class="card-actions">
        <button class="mini-button" type="button" data-army-select-commander="${entry.meta.character.id}">${escapeHtml(actionLabel)}</button>
      </div>
    </article>
  `;
}

function renderArmyCommanderPoolCard(meta, profile, isSelected, isReady) {
  const snapshot = getArmyCharacterPowerSnapshot(meta.character);
  const statusText = isSelected ? "選択中" : isReady ? "仕上がり" : "未育成";
  const actionLabel = isSelected ? "外す" : "主将に入れる";
  const featureText = (meta.character.featureTags || []).slice(0, 3).join(" / ") || "-";
  const positionText = meta.positionProfile?.focusText || "汎用";
  return `
    <article class="quick-card army-commander-card ${isSelected ? "is-selected" : ""} ${!isReady ? "is-dim" : ""}" ${
      isReady ? `data-army-select-commander-card="${meta.character.id}" role="button" tabindex="0"` : ""
    }>
      <span class="status-pill ${isSelected ? "is-live" : isReady ? "is-next" : "is-plan"}">${escapeHtml(statusText)}</span>
      <img src="${escapeHtml(meta.character.imageUrl)}" alt="${escapeHtml(meta.character.name)}" loading="lazy" />
      <h3>${escapeHtml(meta.character.name)}</h3>
      <p>${escapeHtml(meta.character.rarity)} / ${escapeHtml(meta.character.type || "-")} / 天賦 ${escapeHtml(meta.character.tenpu)}</p>
      <ul>
        <li><span>育成</span><span>${escapeHtml(getArmyProfileLabel(ARMY_INVESTMENT_TIER_DEFS, profile.investmentTier))}</span></li>
        <li><span>装備</span><span>${escapeHtml(getArmyProfileLabel(ARMY_EQUIPMENT_FIT_DEFS, profile.equipmentFit))}</span></li>
        <li><span>戦力目安</span><span>${escapeHtml(formatArmyEstimateNumber(snapshot.current))}</span></li>
        <li><span>配置</span><span>${escapeHtml(positionText)}</span></li>
        <li><span>役割</span><span>${escapeHtml(featureText)}</span></li>
      </ul>
      <div class="card-actions">
        <button class="mini-button" type="button" ${isReady ? `data-army-select-commander="${meta.character.id}"` : "disabled"}>
          ${escapeHtml(isReady ? actionLabel : "未育成")}
        </button>
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

function bindArmyCommanderCardButtons() {
  if (!elements.armyCommanderGrid) {
    return;
  }

  elements.armyCommanderGrid.querySelectorAll("[data-army-select-commander]").forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleArmyCommanderSelection(button.dataset.armySelectCommander);
    };
  });

  elements.armyCommanderGrid.querySelectorAll("[data-army-select-commander-card]").forEach((card) => {
    card.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.target.closest("[data-army-select-commander]")) {
        return;
      }
      toggleArmyCommanderSelection(card.dataset.armySelectCommanderCard);
    };
    card.onkeydown = (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      toggleArmyCommanderSelection(card.dataset.armySelectCommanderCard);
    };
  });
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

function isArmySkillActiveForPlacement(skill, slotKey, rowKey) {
  const conditions = skill?.conditions ?? [];
  const rowConditions = conditions.filter((conditionKey) => ARMY_BUILDER_ROW_KEYS.includes(conditionKey));
  const roleConditions = conditions.filter((conditionKey) => ["main", "vice", "aide"].includes(conditionKey));
  const roleCondition = ARMY_SLOT_ROLE_CONDITION[slotKey];
  const rowOk = !rowConditions.length || rowConditions.includes(rowKey);
  const roleOk = !roleConditions.length || roleConditions.includes(roleCondition);
  return rowOk && roleOk;
}

function summarizeArmyEffectText(text = "") {
  const normalized = `${text}`.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }
  return normalized.length > 84 ? `${normalized.slice(0, 84)}…` : normalized;
}

function buildArmyUnitSkillSummary(unit) {
  const rowKey = unit.assignedRow ?? unit.defaultRow ?? "middle";
  const commander = unit.unitMembers.find((member) => member.slotKey === "commander");
  const viceMembers = unit.unitMembers.filter((member) => member.slotKey === "vice1" || member.slotKey === "vice2");
  const aideMembers = unit.unitMembers.filter((member) => member.slotKey === "aide1" || member.slotKey === "aide2");
  const rows = [];

  if (commander) {
    const tacticName = commander.meta.character.battleArtMeta?.name || `${commander.meta.character.name}の戦法`;
    const tacticEffects = [
      ...(commander.meta.character.battleArtEffects ?? []),
      commander.meta.character.battleArtText ?? ""
    ]
      .filter(Boolean)
      .slice(0, 2)
      .map((text) => summarizeArmyEffectText(text))
      .filter(Boolean)
      .join(" / ");
    rows.push({
      label: "主将戦法",
      value: `${tacticName}${tacticEffects ? `: ${tacticEffects}` : ""}`
    });
  }

  if (viceMembers.length) {
    rows.push({
      label: "副将戦法",
      value: viceMembers
        .map((member) => `${member.meta.character.name}: ${member.meta.character.battleArtMeta?.name || "戦法"}`)
        .join(" / ")
    });
  }

  unit.unitMembers.forEach((member) => {
    const activeSkills = (member.meta.character.skillRecords ?? [])
      .filter((skill) => isArmySkillActiveForPlacement(skill, member.slotKey, rowKey))
      .slice(0, 2);
    if (!activeSkills.length) {
      return;
    }
    const skillText = activeSkills
      .map((skill) => {
        const detail = summarizeArmyEffectText(skill.summary || skill.initialEffect || skill.maxEffect || "");
        return `${skill.name}${detail ? `: ${detail}` : ""}`;
      })
      .join(" / ");
    rows.push({
      label: member.slotKey.startsWith("aide") ? "補佐技能" : `${member.label}技能`,
      value: `${member.meta.character.name}: ${skillText}`
    });
  });

  if (aideMembers.length) {
    rows.push({
      label: "補佐メモ",
      value: "補佐は戦法なし。技能と戦力で支える枠です。"
    });
  }

  return rows.slice(0, 8);
}

function renderArmyUnitCard(unit, unitIndex, armyIndex, unitPowerEstimate, isFocused = false) {
  const skillSummaryRows = buildArmyUnitSkillSummary(unit);
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
            snapshot?.observedRow
              ? `<div class="army-list-row"><span>算出元</span><span>${escapeHtml(
                  snapshot.source === "observed"
                    ? `CSV実測 / Lv ${snapshot.observedRow.level ?? "-"} / 秘伝 ${snapshot.observedRow.secret ?? 0}`
                    : "CSV補完"
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
    <article class="army-unit-card ${isFocused ? "is-active-focus" : ""}">
      <div class="army-unit-head">
        <div>
          <h3>第${unitIndex + 1}部隊</h3>
          <p>${escapeHtml(unit.assignedFormationSlot?.label || "-")} / ${escapeHtml(builderRowLabelFor(unit.assignedRow))} / 主将 ${escapeHtml(unit.commander.name)}</p>
        </div>
        <div class="stacked-meta">
          ${isFocused ? '<span class="status-pill is-live">戦法表示中</span>' : ""}
          <span class="count-pill">${unit.total.toFixed(1)}</span>
        </div>
      </div>
      <div class="army-score-line">
        <span>主要軸</span>
        <span>
          現在戦力 ${unit.scoreAxes.powerCurrent.toFixed(1)} |
          20秒火力 ${unit.scoreAxes.burst20s.toFixed(1)} |
          40秒継戦 ${unit.scoreAxes.sustain40s.toFixed(1)}
        </span>
      </div>
      <div class="army-score-line">
        <span>補助軸</span>
        <span>
          妨害維持 ${unit.scoreAxes.controlUptime.toFixed(1)} |
          解除厚み ${unit.scoreAxes.cleanseCoverage.toFixed(1)} |
          陣形適合 ${unit.scoreAxes.formationFit.toFixed(1)}
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
      ${
        skillSummaryRows.length
          ? `<div class="army-explanation army-skill-summary">
              <div class="army-note-list">
                ${skillSummaryRows
                  .map(
                    (row) =>
                      `<div class="army-list-row"><span>${escapeHtml(row.label)}</span><span>${escapeHtml(row.value)}</span></div>`
                  )
                  .join("")}
              </div>
            </div>`
          : ""
      }
      <div class="army-explanation">
        <div class="army-note-list">
          ${unit.reasons.map((reason) => `<div class="army-list-row"><span>採用理由</span><span>${escapeHtml(reason)}</span></div>`).join("")}
          ${unit.warnings.map((warning) => `<div class="army-list-row"><span>注意点</span><span>${escapeHtml(warning)}</span></div>`).join("")}
        </div>
      </div>
      <div class="card-actions">
        <button class="mini-button" type="button" data-army-focus-unit="${armyIndex}:${unitIndex}">${isFocused ? "この部隊を表示中" : "戦法を見る"}</button>
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
        <li><span>主要軸</span><span>${escapeHtml(formatArmyAxisText(army.scoreAxes, army.concept, 2) || "-")}</span></li>
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
    resetArmyBattlePreviewState();
  } else if (!lastArmyPlannerResult) {
    lastArmyPlannerResult = buildArmyPlannerResult();
    resetArmyBattlePreviewState();
  }

  const plannerResult = result ?? lastArmyPlannerResult;
  renderArmyRosterUi();
  syncArmyShareButtons(Boolean(plannerResult.armies.length));
  renderArmyFormationInfoCards(
    {
      concept: ARMY_CONCEPT_MAP[elements.armyConcept?.value] ?? ARMY_CONCEPT_DEFS[0],
      formationChoiceKey: sanitizeArmyFormationChoiceKey(elements.armyFormation?.value ?? "auto")
    },
    null
  );
  const seasonSummaryLabel = getArmySeasonFocusConfig(plannerResult.seasonFocusKey ?? "s3", plannerResult.concept).label;
  elements.armySummary.textContent = `${plannerResult.summary} / 環境 ${seasonSummaryLabel}`;
  elements.armyValidation.textContent = plannerResult.validation;
  elements.armyValidation.hidden = !plannerResult.validation;
  elements.armyTopCount.textContent =
    plannerResult.armies.length > 0
      ? `${plannerResult.armies.length}件`
      : `主将 ${plannerResult.selectedCommanderIds?.length ?? 0} / 5`;
  renderArmyCommanderWizard(plannerResult);
  renderArmyPlannerFloatingUi(plannerResult);

  if (!plannerResult.armies.length) {
    renderArmyFormationInfoCards(plannerResult, null);
    elements.armyOverviewGrid.innerHTML = renderEmptyState(
      plannerResult.validation || "主将を5体選ぶと、ここに総評とおすすめ陣形を表示します。"
    );
    if (elements.armyAuditGrid) {
      elements.armyAuditGrid.innerHTML = renderEmptyState("主将5体が決まると、ここに役割不足と陣形比較を表示します。");
    }
    elements.armyUnitGrid.innerHTML = "";
  if (elements.armyCommanderGrid) {
    elements.armyCommanderGrid.innerHTML = (plannerResult.commanderShortlist ?? []).length
      ? plannerResult.commanderShortlist.map((entry) => renderArmyCommanderShortlistCardV2(entry)).join("")
      : renderEmptyState("この条件では主将候補を出せません。");
    bindArmyCommanderCardButtons();
  }
    if (elements.armyViceGrid) {
      elements.armyViceGrid.innerHTML = (plannerResult.viceShortlist?.entries ?? []).length
        ? plannerResult.viceShortlist.entries
            .map((entry) => renderArmyViceShortlistCard(plannerResult.viceShortlist.commanderMeta, entry))
            .join("")
        : renderEmptyState("主将が固まると、ここに副将候補を表示します。");
    }
    elements.armyAlternativeGrid.innerHTML = renderEmptyState("主将5体が決まると、ここに別案の軍勢を表示します。");
    if (elements.armySwapGrid) {
      elements.armySwapGrid.innerHTML = renderEmptyState("完成案が出ると、ここに1枠差し替え提案を表示します。");
    }
    elements.armyReserveGrid.innerHTML = renderEmptyState("完成案が出ると、ここに差し替え候補を表示します。");
    if (elements.armyExcludedGrid) {
      elements.armyExcludedGrid.innerHTML = renderEmptyState("完成案が出ると、ここに落選理由を表示します。");
    }
    renderArmyBattlePreviewEmptyState(
      "主将5体が決まると、ここに0〜50秒の戦法タイムラインを表示します。",
      "主将5体が決まると、ここに3×3盤面を表示します。",
      "主将5体が決まると、ここに継続中のバフ / デバフを表示します。"
    );
    return;
  }

  const activeArmy = plannerResult.armies[activeArmyAlternativeIndex] ?? plannerResult.armies[0];
  const powerEstimate = getArmyPowerEstimate(activeArmy);
  activeArmyUnitIndex = Math.max(0, Math.min(powerEstimate.units.length - 1, Number(activeArmyUnitIndex) || 0));
  renderArmyFormationInfoCards(plannerResult, activeArmy);
  elements.armyOverviewGrid.innerHTML = renderArmyOverviewCards(activeArmy, plannerResult, powerEstimate);
  if (elements.armyAuditGrid) {
    elements.armyAuditGrid.innerHTML = renderArmyAuditCards(plannerResult.auditCards ?? []);
  }
  elements.armyUnitGrid.innerHTML = powerEstimate.units
    .map((unit, unitIndex) =>
      renderArmyUnitCard(unit, unitIndex, activeArmyAlternativeIndex, unit.powerEstimate, unitIndex === activeArmyUnitIndex)
    )
    .join("");
  if (elements.armyCommanderGrid) {
    elements.armyCommanderGrid.innerHTML = (plannerResult.commanderShortlist ?? []).length
      ? plannerResult.commanderShortlist.map((entry) => renderArmyCommanderShortlistCardV2(entry)).join("")
      : renderEmptyState("主将候補はまだ出せません。");
    bindArmyCommanderCardButtons();
  }
  if (elements.armyViceGrid) {
    elements.armyViceGrid.innerHTML = (plannerResult.viceShortlist?.entries ?? []).length
      ? plannerResult.viceShortlist.entries
          .map((entry) => renderArmyViceShortlistCard(plannerResult.viceShortlist.commanderMeta, entry))
          .join("")
      : renderEmptyState("この条件では副将候補が組めません。仕上がり武将か条件を見直してください。");
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
  renderArmyBattlePreviewPanel(activeArmy, powerEstimate);
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
  if (elements.armyPowerMode) {
    elements.armyPowerMode.value = sanitizeArmyPowerMode(armyObservedPowerState.mode);
  }
  if (elements.armyRosterSearch) {
    elements.armyRosterSearch.value = "";
  }
  armySelectedCommanderIds = [];
  armyCommanderSelectionCache = null;
  clearArmyCommanderPrefetchTimer();
  armyCommanderPrefetchKey = "";
  resetArmyBattlePreviewState();
  renderCheckboxGroup(elements.armyRarityFilters, RARITY_DEFS, "army-rarity", ARMY_BUILDER_DEFAULT_RARITIES);
  lastArmyPlannerResult = null;
  activeArmyAlternativeIndex = 0;
  renderArmyRosterUi();
  renderArmyPlanner(buildArmyPlannerResult());
}

function collectArmyShareState() {
  const selectedRarities = readCheckedValuesIn(elements.armyRarityFilters, "army-rarity");

  return {
    seedCharacter: elements.armySeedCharacter?.value || undefined,
    seedMode: elements.armySeedMode?.value !== "best" ? elements.armySeedMode.value : undefined,
    concept: elements.armyConcept?.value !== "balanced" ? elements.armyConcept.value : undefined,
    formation: elements.armyFormation?.value !== "auto" ? elements.armyFormation.value : undefined,
    powerMode:
      sanitizeArmyPowerMode(elements.armyPowerMode?.value ?? "standard") !== "standard"
        ? sanitizeArmyPowerMode(elements.armyPowerMode?.value ?? "standard")
        : undefined,
    rarities:
      selectedRarities.join("|") === ARMY_BUILDER_DEFAULT_RARITIES.join("|") ? undefined : selectedRarities,
    selectedCommanders: armySelectedCommanderIds.length ? armySelectedCommanderIds : undefined,
    roster: serializeArmyRosterForShare()
  };
}

function refreshArmyPlannerFromExternalState() {
  if (!elements.armyView) {
    return;
  }

  lastArmyPlannerResult = null;
  activeArmyAlternativeIndex = 0;
  renderArmyRosterUi();
  renderArmyPlanner(buildArmyPlannerResult());
}

function applyArmyShareState(state = {}, options = {}) {
  if (!elements.armyView) {
    return false;
  }

  elements.armySeedCharacter.value = state.seedCharacter ?? "";
  elements.armySeedMode.value = state.seedMode ?? "best";
  elements.armyConcept.value = state.concept ?? "balanced";
  if (elements.armyFormation) {
    elements.armyFormation.value = sanitizeArmyFormationChoiceKey(state.formation ?? "auto");
  }
  if (elements.armyPowerMode) {
    elements.armyPowerMode.value = sanitizeArmyPowerMode(state.powerMode ?? armyObservedPowerState.mode ?? "standard");
  }
  setCheckedValuesByName("army-rarity", state.rarities ?? ARMY_BUILDER_DEFAULT_RARITIES);
  setArmySelectedCommanderIds(state.selectedCommanders ?? [], preparedCharacters.map((character) => getArmyMeta(character)));
  importArmyRosterShareState(state.roster ?? null, { rerender: false });
  setArmyObservedPowerMode(elements.armyPowerMode?.value ?? "standard", { rerender: false });
  if (elements.armyRosterSearch) {
    elements.armyRosterSearch.value = "";
  }

  setActiveView("army", { updateHash: true });
  refreshArmyPlannerFromExternalState();

  if (options.showToast !== false) {
    window.KH_APP_API?.showStatusToast?.("共有リンクの軍勢条件を復元しました。");
  }

  return true;
}

function bindArmyPlannerEvents() {
  if (!elements.armyView) {
    return;
  }

  if (elements.armySuggestCommandersButton) {
    elements.armySuggestCommandersButton.textContent = "主将プールを更新";
  }
  if (elements.armyAutoSelectCommandersButton) {
    elements.armyAutoSelectCommandersButton.textContent = "おすすめ5人を選ぶ";
  }
  if (elements.armyFinalizeButton) {
    elements.armyFinalizeButton.textContent = "副将・補佐を組む";
  }
  setArmyPlannerBusy(false);

  [
    elements.powerCalcSoldier,
    elements.powerCalcAttack,
    elements.powerCalcDefense,
    elements.powerCalcWar,
    elements.powerCalcStrategy,
    elements.powerCalcSoldierBuff,
    elements.powerCalcAttackBuff,
    elements.powerCalcDefenseBuff,
    elements.powerCalcWarBuff,
    elements.powerCalcStrategyBuff
  ]
    .filter(Boolean)
    .forEach((input) => input.addEventListener("input", renderArmyS3PowerCalculator));
  elements.powerCalcResetButton?.addEventListener("click", () => {
    resetArmyS3PowerCalcInputs();
    renderArmyS3PowerCalculator();
  });
  elements.heroPowerPreset?.addEventListener("change", () => {
    applyHeroPowerResearchPreset(elements.heroPowerPreset.value);
    renderHeroPowerResearch();
  });
  [
    elements.heroPowerAttack,
    elements.heroPowerDefense,
    elements.heroPowerWar,
    elements.heroPowerStrategy,
    elements.heroPowerCharm,
    elements.heroPowerLevel,
    elements.heroPowerTenpu
  ]
    .filter(Boolean)
    .forEach((input) =>
      input.addEventListener("input", () => {
        if (elements.heroPowerPreset && elements.heroPowerPreset.value !== "custom") {
          elements.heroPowerPreset.value = "custom";
        }
        renderHeroPowerResearch();
      })
    );
  elements.heroPowerResetButton?.addEventListener("click", () => {
    resetHeroPowerResearchInputs();
    renderHeroPowerResearch();
  });

  elements.armySuggestCommandersButton?.addEventListener("click", () => {
    lastArmyPlannerResult = null;
    activeArmyAlternativeIndex = 0;
    renderArmyPlanner(buildArmyCommanderPreviewResult());
    elements.armyCommanderGrid?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  elements.armyAutoSelectCommandersButton?.addEventListener("click", () => {
    setArmyPlannerBusy(true);
    window.setTimeout(() => {
      try {
        const context = getArmyPlannerContext({ ignoreCommanderSelection: true });
        const previewResult = buildArmyCommanderPreviewResult(context);
        const fastEntries = buildArmyCommanderFastAutoEntries(
          context.allowedMetas,
          context.concept,
          context.seedMeta,
          []
        );
        const topCommanderIds = buildArmyGreedyCommanderSelection(
          context.allowedMetas,
          context.concept,
          context.seedMeta,
          [],
          5,
          fastEntries
        ).slice(0, 5);
        setArmySelectedCommanderIds(
          topCommanderIds,
          previewResult.commanderShortlist.map((entry) => entry.meta).filter(Boolean)
        );
        lastArmyPlannerResult = null;
        activeArmyAlternativeIndex = 0;
        renderArmyPlanner(buildArmyCommanderPreviewResult());
        elements.armySelectedCommanderStrip?.scrollIntoView({ behavior: "smooth", block: "start" });
      } finally {
        setArmyPlannerBusy(false);
      }
    }, 16);
  });
  elements.armyFinalizeButton?.addEventListener("click", () => {
    if (armySelectedCommanderIds.length < 5) {
      window.KH_APP_API?.showStatusToast?.("先に主将を5体選んでください。");
      return;
    }
    setArmyPlannerBusy(true);
    window.setTimeout(() => {
      try {
        lastArmyPlannerResult = null;
        activeArmyAlternativeIndex = 0;
        renderArmyPlanner(buildArmyPlannerResult());
        elements.armyOverviewGrid?.scrollIntoView({ behavior: "smooth", block: "start" });
      } finally {
        setArmyPlannerBusy(false);
      }
    }, 16);
  });
  elements.armyClearCommanderSelectionButton?.addEventListener("click", () => {
    armySelectedCommanderIds = [];
    armyCommanderSelectionCache = null;
    clearArmyCommanderPrefetchTimer();
    armyCommanderPrefetchKey = "";
    lastArmyPlannerResult = null;
    activeArmyAlternativeIndex = 0;
    renderArmyPlanner(buildArmyCommanderPreviewResult());
  });
  elements.armyResetButton?.addEventListener("click", resetArmyPlanner);
  elements.armyExportImageButton?.addEventListener("click", async () => {
    try {
      await exportArmyShareImage();
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
      window.KH_APP_API?.showStatusToast?.(
        error?.message === "army-share-no-selection" ? "先に軍勢を生成してください。" : "画像の書き出しに失敗しました。"
      );
    }
  });
  elements.armyShareImageButton?.addEventListener("click", async () => {
    try {
      await shareArmyShareImage();
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
      window.KH_APP_API?.showStatusToast?.(
        error?.message === "army-share-no-selection" ? "先に軍勢を生成してください。" : "画像共有に失敗しました。"
      );
    }
  });
  elements.armySeedCharacter?.addEventListener("change", () => scheduleArmyPlannerRebuild(true));
  elements.armySeedMode?.addEventListener("change", () => scheduleArmyPlannerRebuild(true));
  elements.armyConcept?.addEventListener("change", () => scheduleArmyPlannerRebuild(true));
  elements.armyFormation?.addEventListener("change", () => scheduleArmyPlannerRebuild(true));
  elements.armyPowerMode?.addEventListener("change", () => {
    setArmyObservedPowerMode(elements.armyPowerMode.value);
  });
  elements.armyRarityFilters?.addEventListener("change", () => scheduleArmyPlannerRebuild(true));
  elements.armyRosterSearch?.addEventListener("input", renderArmyRosterGrid);
  elements.armyPowerImportButton?.addEventListener("click", () => {
    try {
      applyArmyObservedPowerImport(elements.armyPowerImportInput?.value ?? "");
    } catch (error) {
      window.KH_APP_API?.showStatusToast?.(
        error.message === "army-import-header-mismatch"
          ? "CSVの見出しを認識できませんでした。武将名, 戦力, 攻撃, 防御, 戦威, 策略 を確認してください。"
          : "CSVの読み込みに失敗しました。"
      );
    }
  });
  elements.armyPowerClearButton?.addEventListener("click", () => {
    clearArmyObservedPowerImport();
    window.KH_APP_API?.showStatusToast?.("CSV実測データを削除しました。");
  });
  elements.armyImageImportInput?.addEventListener("change", () => {
    const file = elements.armyImageImportInput.files?.[0] ?? null;
    setArmyImageImportFile(file);
    renderArmyImageImportUi();
  });
  elements.armyImageImportButton?.addEventListener("click", async () => {
    try {
      await runArmyImageOcr();
      if (!armyImageImportState.error) {
        window.KH_APP_API?.showStatusToast?.("画像のOCR候補を更新しました。");
      }
    } catch (error) {
      window.KH_APP_API?.showStatusToast?.("OCRの読み取りに失敗しました。");
    }
  });
  elements.armyImageImportApplyButton?.addEventListener("click", () => {
    try {
      applyArmyImageImportFields();
      window.KH_APP_API?.showStatusToast?.("OCR結果を手持ち実測へ反映しました。");
    } catch (error) {
      window.KH_APP_API?.showStatusToast?.(
        error.message === "army-ocr-character-mismatch"
          ? "武将名を特定できませんでした。OCR結果の武将名を補正してください。"
          : "戦力・攻撃・防御・戦威・策略がそろってから反映してください。"
      );
    }
  });
  elements.armyImageImportClearButton?.addEventListener("click", () => {
    clearArmyImageImportState();
    if (elements.armyImageImportInput) {
      elements.armyImageImportInput.value = "";
    }
    renderArmyImageImportUi();
    window.KH_APP_API?.showStatusToast?.("OCR結果をクリアしました。");
  });
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
    const dockActionButton = event.target.closest("[data-army-dock-action]");
    if (dockActionButton) {
      if (dockActionButton.dataset.armyDockAction === "auto") {
        elements.armyAutoSelectCommandersButton?.click();
      } else if (dockActionButton.dataset.armyDockAction === "finalize") {
        elements.armyFinalizeButton?.click();
      }
      return;
    }

    const quickCloseButton = event.target.closest("[data-army-quick-close]");
    if (quickCloseButton) {
      closeArmyQuickEditor();
      return;
    }

    const quickOwnedButton = event.target.closest("[data-army-quick-owned]");
    if (quickOwnedButton) {
      const characterId = Number(quickOwnedButton.dataset.armyQuickOwned);
      setArmyRosterOwned(characterId, !isArmyCharacterOwned(characterId));
      if (!isArmyCharacterOwned(characterId)) {
        armyQuickEditCharacterId = null;
      }
      renderArmyRosterUi();
      scheduleArmyPlannerRebuild();
      return;
    }

    const quickCommanderButton = event.target.closest("[data-army-quick-commander]");
    if (quickCommanderButton) {
      toggleArmyCommanderSelection(quickCommanderButton.dataset.armyQuickCommander);
      renderArmyPlannerFloatingUi(lastArmyPlannerResult);
      return;
    }

    const rosterButton = event.target.closest("[data-army-roster-toggle]");
    if (rosterButton) {
      const characterId = Number(rosterButton.dataset.armyRosterToggle);
      if (armyRosterLongPressConsumedId === characterId) {
        armyRosterLongPressConsumedId = null;
        return;
      }
      cycleArmyRosterQuickState(characterId);
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

    const focusUnitButton = event.target.closest("[data-army-focus-unit]");
    if (focusUnitButton) {
      const [armyIndex, unitIndex] = focusUnitButton.dataset.armyFocusUnit.split(":").map((value) => Number(value));
      activeArmyAlternativeIndex = Number.isFinite(armyIndex) ? armyIndex : 0;
      activeArmyUnitIndex = Number.isFinite(unitIndex) ? unitIndex : 0;
      activeArmyPreviewSecond = clampArmyTimelinePreviewSecond(ARMY_TIMELINE_DEFAULT_SECOND);
      activeArmyPreviewGroupId = null;
      activeArmyTargetSlotKey = null;
      renderArmyPlanner();
      return;
    }

    const previewSecondButton = event.target.closest("[data-army-preview-second]");
    if (previewSecondButton && previewSecondButton.closest("#armyTimeline")) {
      activeArmyPreviewSecond = clampArmyTimelinePreviewSecond(previewSecondButton.dataset.armyPreviewSecond);
      activeArmyPreviewGroupId = previewSecondButton.dataset.armySelectGroup || null;
      renderArmyBattlePreviewPanel(lastArmyPlannerResult?.armies?.[activeArmyAlternativeIndex] ?? null);
      return;
    }

    const targetSlotButton = event.target.closest("[data-army-target-slot]");
    if (targetSlotButton && targetSlotButton.closest("#armyBoardGrid")) {
      activeArmyTargetSlotKey = targetSlotButton.dataset.armyTargetSlot || null;
      renderArmyBattlePreviewPanel(lastArmyPlannerResult?.armies?.[activeArmyAlternativeIndex] ?? null);
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
      resetArmyBattlePreviewState();
      renderArmyPlanner();
      return;
    }

    const armyImageSuggestButton = event.target.closest("[data-army-image-suggest]");
    if (armyImageSuggestButton) {
      updateArmyImageImportField("name", armyImageSuggestButton.dataset.armyImageSuggest || "");
      return;
    }

    const selectCommanderButton = event.target.closest("[data-army-select-commander]");
    if (selectCommanderButton) {
      toggleArmyCommanderSelection(selectCommanderButton.dataset.armySelectCommander);
      return;
    }

    const selectCommanderCard = event.target.closest("[data-army-select-commander-card]");
    if (selectCommanderCard) {
      toggleArmyCommanderSelection(selectCommanderCard.dataset.armySelectCommanderCard);
      return;
    }

    const removeCommanderButton = event.target.closest("[data-army-remove-commander]");
    if (removeCommanderButton) {
      armySelectedCommanderIds = armySelectedCommanderIds.filter(
        (value) => value !== Number(removeCommanderButton.dataset.armyRemoveCommander)
      );
      lastArmyPlannerResult = null;
      activeArmyAlternativeIndex = 0;
      renderArmyPlanner(buildArmyCommanderPreviewResult());
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
    const imageField = event.target.closest("[data-army-image-field]");
    if (imageField) {
      updateArmyImageImportField(imageField.dataset.armyImageField, imageField.value);
      return;
    }
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
  elements.armyView.addEventListener("pointerdown", (event) => {
    const rosterButton = event.target.closest("[data-army-roster-toggle]");
    if (!rosterButton || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }
    clearArmyRosterLongPressTimer();
    const characterId = Number(rosterButton.dataset.armyRosterToggle);
    armyRosterLongPressTimer = window.setTimeout(() => {
      armyRosterLongPressConsumedId = characterId;
      openArmyQuickEditor(characterId);
    }, 420);
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
    elements.armyView.addEventListener(eventName, clearArmyRosterLongPressTimer);
  });
  elements.armyView.addEventListener("contextmenu", (event) => {
    const rosterButton = event.target.closest("[data-army-roster-toggle]");
    if (!rosterButton) {
      return;
    }
    event.preventDefault();
    const characterId = Number(rosterButton.dataset.armyRosterToggle);
    armyRosterLongPressConsumedId = characterId;
    openArmyQuickEditor(characterId);
  });
}

function populateArmyPlannerControls() {
  if (!elements.armyView) {
    return;
  }

  populateSimpleSelect(
    elements.heroPowerPreset,
    HERO_POWER_RESEARCH_PRESET_DEFS,
    HERO_POWER_RESEARCH_SAMPLE_ROWS[0]?.key ?? "custom"
  );
  populateCharacterSelect(elements.armySeedCharacter, "固定しない");
  populateSimpleSelect(elements.armySeedMode, ARMY_SEED_MODE_DEFS, "best");
  populateSimpleSelect(elements.armyConcept, ARMY_CONCEPT_DEFS, "balanced");
  populateSimpleSelect(elements.armyFormation, ARMY_FORMATION_SELECT_DEFS, "auto");
  populateSimpleSelect(elements.armyPowerMode, ARMY_POWER_MODE_DEFS, sanitizeArmyPowerMode(armyObservedPowerState.mode));
  populateSimpleSelect(elements.armyDefaultInvestment, ARMY_INVESTMENT_TIER_DEFS, armyRosterState.defaultInvestmentTier);
  populateSimpleSelect(elements.armyDefaultEquipment, ARMY_EQUIPMENT_FIT_DEFS, armyRosterState.defaultEquipmentFit);
  renderCheckboxGroup(elements.armyRarityFilters, RARITY_DEFS, "army-rarity", ARMY_BUILDER_DEFAULT_RARITIES);
  resetArmyS3PowerCalcInputs();
  renderArmyS3PowerCalculator();
  resetHeroPowerResearchInputs();
  renderHeroPowerResearch();
  renderArmyPowerImportUi();
  renderArmyRosterUi();
}

function renderArmyPlannerIdleState() {
  if (!elements.armyView) {
    return;
  }

  syncArmyShareButtons(false);
  elements.armySummary.textContent =
    "検索条件: 手持ちを選び、主将候補を出し、主将5体を決めると残りの副将 / 補佐を自動提案します。";
  elements.armyValidation.hidden = true;
  elements.armyValidation.textContent = "";
  elements.armyTopCount.textContent = "主将 0 / 5";
  renderArmyRosterUi();
  renderArmyCommanderWizard(buildArmyCommanderPreviewResult());
  elements.armyOverviewGrid.innerHTML = renderEmptyState(
    "主将5体が決まると、ここに総評とおすすめ陣形を表示します。"
  );
  if (elements.armyAuditGrid) {
    elements.armyAuditGrid.innerHTML = renderEmptyState("ここに役割不足、採用基準、陣形比較、信頼度を表示します。");
  }
  elements.armyUnitGrid.innerHTML = "";
  if (elements.armyCommanderGrid) {
    elements.armyCommanderGrid.innerHTML = renderEmptyState("主将候補を出すと、ここに候補が並びます。");
  }
  if (elements.armyViceGrid) {
    elements.armyViceGrid.innerHTML = renderEmptyState("主将5体が決まると、ここに副将ペア候補を表示します。");
  }
  elements.armyAlternativeGrid.innerHTML = renderEmptyState("主将5体が決まると、ここに別案の軍勢を表示します。");
  if (elements.armySwapGrid) {
    elements.armySwapGrid.innerHTML = renderEmptyState("完成案が出ると、ここに1枠差し替え提案を表示します。");
  }
  elements.armyReserveGrid.innerHTML = renderEmptyState("完成案が出ると、ここに差し替え候補を表示します。");
  if (elements.armyExcludedGrid) {
    elements.armyExcludedGrid.innerHTML = renderEmptyState("完成案が出ると、ここに落選理由を表示します。");
  }
  renderArmyBattlePreviewEmptyState(
    "部隊が決まると、ここに0〜50秒の戦法タイムラインを表示します。",
    "部隊が決まると、ここに味方盤面と敵盤面を表示します。",
    "部隊が決まると、ここに継続中のバフ / デバフを表示します。"
  );
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

  window.KH_ARMY_SHARE_API = {
    getOwnedCount: () => armyRosterState.ownedCount ?? 0,
    exportState: exportArmyRosterState,
    importState: importArmyRosterState,
    collectShareState: collectArmyShareState,
    applyShareState: applyArmyShareState,
    refresh: refreshArmyPlannerFromExternalState
  };

  if (window.__KH_PENDING_SHARE_PAYLOAD?.view === "army") {
    applyArmyShareState(window.__KH_PENDING_SHARE_PAYLOAD.state ?? {}, { showToast: true });
    window.__KH_PENDING_SHARE_PAYLOAD = null;
  } else {
    window.KH_APP_API?.updateBackupMeta?.();
  }
}

bootArmyPlanner();
