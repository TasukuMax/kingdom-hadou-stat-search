const {
  characters: RAW_CHARACTERS,
  skills: RAW_SKILLS,
  skillOrder: SKILL_ORDER,
  enishiWeights: ENISHI_WEIGHTS,
  sources: SOURCES
} = APP_DATA;
const SEASON3 =
  typeof SEASON3_DATA === "object" && SEASON3_DATA
    ? SEASON3_DATA
    : {
        seasonKey: "s3",
        seasonLabel: "Season 3 Only",
        theme: "",
        masterRevision: "",
        updatedAt: "",
        contextNotes: [],
        heroes: [],
        skills: [],
        tags: [],
        objectives: [],
        builderWeights: {},
        roleBuckets: {},
        updates: [],
        sources: []
      };

const VIEW_KEYS = ["power", "character", "skill", "synergy", "board"];

const STAT_DEFS = [
  { key: "attack", label: "攻撃" },
  { key: "defense", label: "防御" },
  { key: "war", label: "戦威" },
  { key: "strategy", label: "策略" }
];

const CONDITION_DEFS = [
  { key: "front", label: "前列", hint: "攻陣 / 守壁 / 破壁" },
  { key: "middle", label: "中列", hint: "枢機" },
  { key: "back", label: "後列", hint: "後備 / 防陣" },
  { key: "main", label: "主将", hint: "主将時のみ発動" },
  { key: "vice", label: "副将", hint: "副将時のみ発動" },
  { key: "aide", label: "補佐", hint: "補佐時のみ発動" }
];

const RARITY_DEFS = [
  { key: "SSR", label: "SSR" },
  { key: "SR", label: "SR" }
];

const TYPE_DEFS = [
  { key: "闘", label: "闘" },
  { key: "援", label: "援" },
  { key: "護", label: "護" },
  { key: "妨", label: "妨" }
];

const OBJECTIVE_FILTER_DEFS = [
  { key: "pvp", label: "対人" },
  { key: "siege", label: "攻城" },
  { key: "defense", label: "防衛" },
  { key: "gathering", label: "調達" }
];

const CHARACTER_TAG_DEFS = [
  { key: "攻撃1位", label: "攻撃1位" },
  { key: "防御1位", label: "防御1位" },
  { key: "戦威1位", label: "戦威1位" },
  { key: "策略1位", label: "策略1位" },
  { key: "攻撃2位", label: "攻撃2位" },
  { key: "防御2位", label: "防御2位" },
  { key: "戦威2位", label: "戦威2位" },
  { key: "策略2位", label: "策略2位" },
  { key: "天賦900", label: "天賦900" },
  { key: "天賦850", label: "天賦850" },
  { key: "天賦800", label: "天賦800" },
  ...SEASON3.tags.map((tag) => ({
    key: tag.label,
    label: tag.label,
    hint: tag.description
  })),
  ...CONDITION_DEFS.map((condition) => ({
    key: condition.label,
    label: condition.label,
    hint: condition.hint
  }))
];

const CHARACTER_FEATURE_DEFS = [
  { key: "対物", label: "対物", hint: "技能や戦法で対物ダメージを伸ばせる" },
  { key: "弱化効果付与", label: "弱化効果付与", hint: "攻撃低下・防御低下・戦威低下・策略低下・恐怖・病毒など" },
  { key: "弱化解除", label: "弱化解除", hint: "味方の弱化効果を解除できる" },
  { key: "強化効果付与", label: "強化効果付与", hint: "堅固・反撃強化・攻速上昇・各種上昇効果の付与" },
  { key: "強化解除", label: "強化解除", hint: "相手の強化効果を解除できる" },
  { key: "回復", label: "回復", hint: "負傷兵回復などを持つ" },
  { key: "被ダメ軽減", label: "被ダメ軽減", hint: "被ダメージ軽減を持つ" },
  { key: "反撃", label: "反撃", hint: "反撃強化や反撃時効果を持つ" },
  { key: "攻速上昇", label: "攻速上昇", hint: "攻撃速度を上げられる" },
  { key: "攻速低下", label: "攻速低下", hint: "相手の攻撃速度を下げられる" },
  { key: "継続削り", label: "継続削り", hint: "病毒などの継続削りを持つ" },
  { key: "会心", label: "会心", hint: "会心発生率や会心威力に関わる" },
  { key: "堅固", label: "堅固", hint: "堅固付与や堅固活用を持つ" },
  { key: "回避", label: "回避", hint: "回避付与を持つ" },
  { key: "連鎖依存", label: "連鎖依存", hint: "共通個性数で性能が伸びる" },
  { key: "兵力条件", label: "兵力条件", hint: "兵力割合で効果が変わる" },
  { key: "調達", label: "調達", hint: "調達・採集で価値がある" },
  { key: "デバフ無効", label: "デバフ無効", hint: "能力低下系デバフを受けにくい" }
];

const SKILL_FEATURE_MAP = {
  攻城: ["対物"],
  破壁: ["対物"],
  大勇: ["対物"],
  山読: ["対物", "連鎖依存"],
  掃討: ["攻速上昇"],
  猛者: ["会心"],
  豪傑: ["会心"],
  発揚: ["兵力条件"],
  奮戦: ["兵力条件"],
  不屈: ["兵力条件"],
  逆境: ["兵力条件"],
  洞察: ["調達"],
  人望: ["調達"],
  雄心: ["連鎖依存"],
  死王: ["会心", "攻速上昇", "強化効果付与"],
  戦士: ["攻速上昇", "連鎖依存"],
  報復: ["反撃", "弱化効果付与"],
  飛槍: ["攻速上昇", "連鎖依存"],
  白老: ["強化効果付与", "堅固", "連鎖依存"],
  戦神子: ["連鎖依存"],
  伝熱: ["攻速上昇", "強化効果付与"],
  不敗: ["被ダメ軽減"],
  巨人: ["強化効果付与"],
  才賢: ["弱化効果付与", "攻速低下"],
  黒弓: ["弱化効果付与", "継続削り"],
  奇矯: ["弱化効果付与"],
  堅靭: ["強化効果付与", "回避"]
};

const S3_FEATURE_TAG_MAP = {
  "siege.structure-damage-up": ["対物"],
  "control.fear": ["弱化効果付与"],
  "control.buff-strip": ["弱化効果付与", "強化解除"],
  "control.dot": ["弱化効果付与", "継続削り"],
  "tempo.attack-speed-down": ["弱化効果付与", "攻速低下"],
  "tempo.attack-speed-up": ["攻速上昇"],
  "role.counter-enabler": ["反撃"],
  "def.damage-cut": ["被ダメ軽減"],
  "def.debuff-immunity": ["デバフ無効"]
};

const TACTIC_FEATURE_RULES = [
  { feature: "対物", pattern: /対物/u },
  { feature: "弱化効果付与", pattern: /(攻撃|防御|戦威|策略|攻撃速度)を?\d+[%％]低下|恐怖|病毒/u },
  { feature: "弱化解除", pattern: /弱化効果.*解除/u },
  { feature: "強化解除", pattern: /強化効果.*解除/u },
  { feature: "回復", pattern: /回復/u },
  { feature: "被ダメ軽減", pattern: /被ダメージ.*軽減/u },
  { feature: "反撃", pattern: /反撃/u },
  { feature: "攻速上昇", pattern: /攻撃速度上昇/u },
  { feature: "攻速低下", pattern: /攻撃速度低下/u },
  { feature: "継続削り", pattern: /病毒/u },
  { feature: "会心", pattern: /会心(発生|威力)?上昇/u },
  { feature: "堅固", pattern: /堅固/u },
  { feature: "回避", pattern: /回避/u },
  { feature: "兵力条件", pattern: /兵力が\d+[%％](以上|以下)/u },
  { feature: "強化効果付与", pattern: /付与|反撃強化/u }
];

const SKILL_EFFECT_DEFS = [
  { key: "structure", label: "対物関連", hint: "対物上昇や攻城寄り" },
  { key: "counter", label: "反撃関連", hint: "反撃ダメージや反撃支援" },
  { key: "speed", label: "攻撃速度関連", hint: "攻撃速度上昇 / 低下" },
  { key: "debuff", label: "弱化関連", hint: "低下、恐怖、病毒など" },
  { key: "cleanse", label: "解除関連", hint: "強化解除 / 弱化解除" },
  { key: "heal", label: "回復関連", hint: "負傷兵回復など" },
  { key: "guard", label: "堅固関連", hint: "堅固付与や堅固活用" },
  { key: "support", label: "強化付与", hint: "各種上昇や付与系" },
  { key: "logistics", label: "調達関連", hint: "調達や任命で価値がある" },
  { key: "season3", label: "S3注目", hint: "Season 3 starter に含まれる技能" }
];

const CHARACTER_SORT_DEFS = [
  { key: "rarityTenpu", label: "レアリティ / 天賦順" },
  { key: "topPair", label: "上位2値合計順" },
  { key: "attack", label: "攻撃順" },
  { key: "defense", label: "防御順" },
  { key: "war", label: "戦威順" },
  { key: "strategy", label: "策略順" },
  { key: "chainBase", label: "基礎連鎖率順" },
  { key: "name", label: "名前順" }
];

const SKILL_SORT_DEFS = [
  { key: "order", label: "GameWith掲載順" },
  { key: "holders", label: "所持武将数順" },
  { key: "name", label: "名前順" }
];

const S3_SLOT_FOCUS_DEFS = [
  { key: "commander", label: "主将優先" },
  { key: "vice", label: "副将優先" },
  { key: "aide", label: "補佐優先" },
  { key: "balanced", label: "総合" }
];

const LIVE_FEATURES = [
  {
    title: "戦力検索",
    status: "LIVE",
    statusClass: "is-live",
    description: "上位2ステータス、技能条件、連鎖率優先ソートを組み合わせて戦力を伸ばしやすい武将を探す。",
    actionLabel: "戦力検索を開く",
    view: "power"
  },
  {
    title: "武将DB",
    status: "LIVE",
    statusClass: "is-live",
    description: "武将名、技能名、個性、役割タグ、上位ステータスを全文検索・タグ検索する。",
    actionLabel: "武将DBを開く",
    view: "character"
  },
  {
    title: "技能DB",
    status: "LIVE",
    statusClass: "is-live",
    description: "技能の概要、初期効果、最大効果、所持武将を一覧化して検索する。",
    actionLabel: "技能DBを開く",
    view: "skill"
  },
  {
    title: "相性検索",
    status: "LIVE",
    statusClass: "is-live",
    description: "指定武将を主将に置いたときの副将連鎖率と共通個性を軸に候補を並べる。",
    actionLabel: "相性検索を開く",
    view: "synergy"
  }
];

const PLANNED_FEATURES = [
  {
    title: "編成勝率シミュレータ",
    status: "NEXT",
    statusClass: "is-next",
    description: "味方編成と仮想敵編成を置き、前中後列と主将副将補佐まで含めた勝率推定を返す。",
    need: "必要: 戦闘式、兵力計算、装備・将星・秘伝の反映。"
  },
  {
    title: "与ダメ計算",
    status: "NEXT",
    statusClass: "is-next",
    description: "攻撃側の武将、技能、兵科、装備から戦法ダメージと通常ダメージを見積もる。",
    need: "必要: ダメージ式、兵科補正、バフ/デバフの処理順。"
  },
  {
    title: "被ダメ計算",
    status: "NEXT",
    statusClass: "is-next",
    description: "防御側の防御・兵力・軽減技能から耐久の目安を計算する。",
    need: "必要: 被ダメ式、軽減技能、兵力依存の確認。"
  },
  {
    title: "育成優先順位診断",
    status: "NEXT",
    statusClass: "is-next",
    description: "手持ち武将の役割不足を見て、誰を先に育てるべきかを診断する。",
    need: "必要: 手持ち入力、目標編成テンプレ、育成段階差分。"
  },
  {
    title: "今週の強化先提案",
    status: "PLAN",
    statusClass: "is-plan",
    description: "不足役割とイベント状況から今週の素材投下先を提案する。",
    need: "必要: 所持状況、週間目標、素材在庫入力。"
  },
  {
    title: "戦力伸び幅予測",
    status: "PLAN",
    statusClass: "is-plan",
    description: "武将ごとの高ステータス育成でどれだけ戦力が伸びるかを予測する。",
    need: "必要: 戦力計算式、成長係数、育成段階ごとの差分。"
  },
  {
    title: "装備DB",
    status: "PLAN",
    statusClass: "is-plan",
    description: "装備の効果、入手経路、装備相性、付与先候補を横断検索する。",
    need: "必要: 装備一覧ソースの取り込みと正規化。"
  },
  {
    title: "AI編成提案",
    status: "PLAN",
    statusClass: "is-plan",
    description: "目的と手持ちに対して前中後列まで含めた候補編成を提案する。",
    need: "必要: 武将DB、技能DB、装備DB、評価ルールの統合。"
  },
  {
    title: "AI対策提案",
    status: "PLAN",
    statusClass: "is-plan",
    description: "相手編成を入力すると刺さる対策候補と差し替え案を返す。",
    need: "必要: 敵編成入力、メタ相性ルール、勝率推定器。"
  }
];

const SOURCE_LABELS = {
  characterList: "武将一覧",
  skillList: "技能一覧",
  simulator: "編成シミュレーター",
  teamGuide: "編成のコツ",
  aideGuide: "補佐ガイド",
  lowRarityGuide: "低レア運用",
  officialNewbie: "公式指南書"
};

const SCORE_LABELS = {
  offenseScore: "攻撃性能",
  defenseScore: "防御性能",
  controlScore: "妨害性能",
  tempoScore: "テンポ",
  synergyScore: "相性",
  counterScore: "対策性能",
  structureDamageScore: "対物性能",
  normalAttackScore: "通常火力",
  consistencyScore: "安定性",
  utilityScore: "汎用性",
  speedScore: "速度",
  survivalScore: "生存力",
  slotFitScore: "スロット適性",
  objectiveFitScore: "目的適性",
  pressureScore: "圧力",
  sustainScore: "継戦力",
  investmentScore: "育成効率",
  armyPowerScore: "軍勢総合",
  roleCoverageScore: "役割充足",
  commanderQualityScore: "主将品質",
  synergyCoverageScore: "シナジー充足",
  stabilityScore: "安定性",
  objectivePurityScore: "目的純度",
  investmentEfficiencyScore: "投資効率"
};

const PENALTY_LABELS = {
  badAideUsage: "補佐に不向きな武将起用",
  missingFrontline: "前列不足",
  missingControlInPvp: "対人で妨害不足",
  missingSiegeCore: "攻城で対物不足",
  tooManyUntrainedCommanders: "未育成主将が多い",
  duplicateWeaknessCluster: "弱点の重なり"
};

const INVESTMENT_TIER_LABELS = {
  trained: "育成済み",
  usable: "実用圏",
  untrained: "未育成"
};

const LOCK_STATE_LABELS = {
  locked: "固定したい",
  neutral: "通常",
  excluded: "除外"
};

const EQUIPMENT_STATE_LABELS = {
  none: "未入力",
  matched: "適正装備あり",
  mismatched: "装備ミスマッチ"
};

const STAT_MAP = Object.fromEntries(STAT_DEFS.map((stat) => [stat.key, stat]));
const CONDITION_MAP = Object.fromEntries(CONDITION_DEFS.map((condition) => [condition.key, condition]));
const CONDITION_LABEL_TO_KEY = Object.fromEntries(
  CONDITION_DEFS.map((condition) => [condition.label, condition.key])
);
const RARITY_MAP = Object.fromEntries(RARITY_DEFS.map((rarity) => [rarity.key, rarity]));
const TYPE_MAP = Object.fromEntries(TYPE_DEFS.map((type) => [type.key, type]));
const RARITY_RANK = Object.fromEntries(RARITY_DEFS.map((rarity, index) => [rarity.key, index]));
const SKILL_RANK = Object.fromEntries(SKILL_ORDER.map((skillName, index) => [skillName, index]));
const CHARACTER_SORT_MAP = Object.fromEntries(
  CHARACTER_SORT_DEFS.map((definition) => [definition.key, definition.label])
);
const SKILL_SORT_MAP = Object.fromEntries(
  SKILL_SORT_DEFS.map((definition) => [definition.key, definition.label])
);
const OBJECTIVE_FILTER_MAP = Object.fromEntries(
  OBJECTIVE_FILTER_DEFS.map((definition) => [definition.key, definition.label])
);
const SKILL_EFFECT_MAP = Object.fromEntries(
  SKILL_EFFECT_DEFS.map((definition) => [definition.key, definition.label])
);
const CHARACTER_FEATURE_MAP = Object.fromEntries(
  CHARACTER_FEATURE_DEFS.map((definition) => [definition.key, definition])
);
const S3_TAG_MAP = Object.fromEntries(SEASON3.tags.map((tag) => [tag.key, tag]));
const S3_OBJECTIVE_MAP = Object.fromEntries(SEASON3.objectives.map((objective) => [objective.key, objective]));
const S3_HERO_RAW_BY_NAME = Object.fromEntries(SEASON3.heroes.map((hero) => [hero.name, hero]));
const S3_SKILL_RAW_BY_NAME = Object.fromEntries(SEASON3.skills.map((skill) => [skill.name, skill]));
const S3_ROLE_BUCKETS = SEASON3.roleBuckets?.objectives ?? {};
const S3_UPDATES = SEASON3.updates ?? [];

const defaultRarities = RARITY_DEFS.map((rarity) => rarity.key);
const defaultTypes = TYPE_DEFS.map((type) => type.key);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "");
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function hasAnyKeyword(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function labelFor(statKey) {
  return STAT_MAP[statKey]?.label ?? "";
}

function conditionLabelFor(conditionKey) {
  return CONDITION_MAP[conditionKey]?.label ?? "";
}

function typeLabelFor(typeKey) {
  return TYPE_MAP[typeKey]?.label ?? typeKey ?? "";
}

function objectiveLabelFor(objectiveKey) {
  return OBJECTIVE_FILTER_MAP[objectiveKey] ?? S3_OBJECTIVE_MAP[objectiveKey]?.label ?? objectiveKey;
}

function getConditionKeysFromLabels(labels) {
  return labels.map((label) => CONDITION_LABEL_TO_KEY[label]).filter(Boolean);
}

function formatPercent(value) {
  if (value == null) {
    return "";
  }

  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
}

function formatRatioPercent(value) {
  if (value == null) {
    return "";
  }

  return formatPercent(value * 100);
}

function formatMultiplier(value) {
  if (value == null) {
    return "";
  }

  if (value <= 0) {
    return "除外";
  }

  return `${value.toFixed(2)}x`;
}

function scoreLabelFor(scoreKey) {
  return SCORE_LABELS[scoreKey] ?? scoreKey;
}

function penaltyLabelFor(penaltyKey) {
  return PENALTY_LABELS[penaltyKey] ?? penaltyKey;
}

function seasonTagLabel(tagKey) {
  return S3_TAG_MAP[tagKey]?.label ?? tagKey;
}

function featureHintFor(featureKey) {
  return CHARACTER_FEATURE_MAP[featureKey]?.hint ?? "";
}

function hasSeason3Tags(season3, tagKeys) {
  return tagKeys.some((tagKey) => season3?.tags?.includes(tagKey));
}

function collectSkillEffectText(skillRecords) {
  return skillRecords
    .flatMap((skill) => [skill.name, skill.summary, skill.initialEffect, skill.maxEffect])
    .filter(Boolean)
    .join(" ");
}

function collectTacticText(character) {
  return [character.battleArtName, ...(character.battleArtEffects ?? [])].filter(Boolean).join(" ");
}

function deriveFeatureTags(character, skillRecords, season3) {
  const featureTags = [];
  const skillText = collectSkillEffectText(skillRecords);
  const tacticText = collectTacticText(character);

  for (const skill of skillRecords) {
    featureTags.push(...(SKILL_FEATURE_MAP[skill.name] ?? []));
  }

  if (hasAnyKeyword(skillText, ["共通する個性", "同じ個性を持つ武将の人数"])) {
    featureTags.push("連鎖依存");
  }

  if (skillText.includes("調達")) {
    featureTags.push("調達");
  }

  for (const rule of TACTIC_FEATURE_RULES) {
    if (rule.pattern.test(tacticText)) {
      featureTags.push(rule.feature);
    }
  }

  for (const tagKey of season3?.tags ?? []) {
    featureTags.push(...(S3_FEATURE_TAG_MAP[tagKey] ?? []));
  }

  return uniqueValues(featureTags);
}

function deriveObjectiveTags(featureTags, season3) {
  const objectiveTags = [];

  for (const definition of OBJECTIVE_FILTER_DEFS) {
    const seasonScore = season3?.objectiveScores?.[definition.key] ?? 0;
    if (seasonScore >= 60 || season3?.tags?.includes(`obj.${definition.key}`)) {
      objectiveTags.push(definition.key);
    }
  }

  if (featureTags.includes("対物")) {
    objectiveTags.push("siege");
  }
  if (featureTags.includes("調達")) {
    objectiveTags.push("gathering");
  }
  if (
    featureTags.some((tag) =>
      ["被ダメ軽減", "回復", "堅固", "反撃", "デバフ無効", "弱化解除"].includes(tag)
    )
  ) {
    objectiveTags.push("defense");
  }
  if (
    featureTags.some((tag) =>
      ["弱化効果付与", "攻速低下", "会心", "反撃", "強化解除", "継続削り"].includes(tag)
    )
  ) {
    objectiveTags.push("pvp");
  }

  return uniqueValues(objectiveTags);
}

function deriveSkillFeatureTags(skill, season3) {
  const text = [skill.name, skill.summary, skill.initialEffect, skill.maxEffect].filter(Boolean).join(" ");
  const featureTags = [];

  if (/対物/u.test(text) || season3?.tags?.includes("siege.structure-damage-up")) {
    featureTags.push("structure");
  }
  if (/反撃/u.test(text) || season3?.tags?.includes("role.counter-enabler")) {
    featureTags.push("counter");
  }
  if (/攻撃速度(上昇|低下)/u.test(text) || hasSeason3Tags(season3, ["tempo.attack-speed-up", "tempo.attack-speed-down"])) {
    featureTags.push("speed");
  }
  if (/(低下|恐怖|病毒)/u.test(text) || hasSeason3Tags(season3, ["control.fear", "control.dot"])) {
    featureTags.push("debuff");
  }
  if (/解除/u.test(text) || hasSeason3Tags(season3, ["control.buff-strip"])) {
    featureTags.push("cleanse");
  }
  if (/回復/u.test(text)) {
    featureTags.push("heal");
  }
  if (/堅固/u.test(text)) {
    featureTags.push("guard");
  }
  if (/付与|上昇/u.test(text)) {
    featureTags.push("support");
  }
  if (/調達|任命/u.test(text)) {
    featureTags.push("logistics");
  }
  if (season3) {
    featureTags.push("season3");
  }

  return uniqueValues(featureTags);
}

function deriveGuideFallbackSlot({ conditionKeys, featureTags, objectiveTags, top1, guide }) {
  if (guide.evaluationPoints.some((point) => point.includes("任命"))) {
    return "任命";
  }
  if (conditionKeys.includes("main")) {
    return "主将";
  }
  if (conditionKeys.includes("aide")) {
    return "補佐";
  }
  if (conditionKeys.includes("vice")) {
    return "副将";
  }
  if (objectiveTags.includes("gathering")) {
    return "任命";
  }
  if (featureTags.some((tag) => ["回復", "弱化解除", "強化効果付与", "調達"].includes(tag))) {
    return "補佐";
  }
  if (featureTags.some((tag) => ["反撃", "弱化効果付与", "攻速低下", "対物"].includes(tag))) {
    return "副将";
  }
  if (["攻撃", "防御", "戦威"].includes(top1.label)) {
    return "主将";
  }
  return "副将";
}

function compareCharactersBase(left, right) {
  return (
    RARITY_RANK[left.rarity] - RARITY_RANK[right.rarity] ||
    right.tenpu - left.tenpu ||
    right.top1.value - left.top1.value ||
    right.top2.value - left.top2.value ||
    left.name.localeCompare(right.name, "ja")
  );
}

function getSkillRecord(skillName) {
  return (
    RAW_SKILLS[skillName] ?? {
      name: skillName,
      order: Number.MAX_SAFE_INTEGER,
      summary: "",
      level: 0,
      initialEffect: "",
      maxEffect: "",
      conditions: []
    }
  );
}

const preparedCharacters = RAW_CHARACTERS.map((character) => {
  const season3 = S3_HERO_RAW_BY_NAME[character.name] ?? null;
  const rankedStats = STAT_DEFS
    .map((stat, priority) => ({
      ...stat,
      value: character[stat.key],
      priority
    }))
    .sort((left, right) => right.value - left.value || left.priority - right.priority);

  const skillRecords = character.skills
    .map((skillName) => getSkillRecord(skillName))
    .sort((left, right) => left.order - right.order || left.name.localeCompare(right.name, "ja"));

  const conditionIndex = Object.fromEntries(
    CONDITION_DEFS.map((condition) => [
      condition.key,
      skillRecords.filter((skill) => skill.conditions.includes(condition.key))
    ])
  );

  const conditionLabels = CONDITION_DEFS.filter(
    (condition) => conditionIndex[condition.key].length > 0
  ).map((condition) => condition.label);
  const battleArtText = collectTacticText(character);
  const featureTags = deriveFeatureTags(character, skillRecords, season3);
  const objectiveTags = deriveObjectiveTags(featureTags, season3);
  const guide = {
    evaluationPoints: character.guide?.evaluationPoints ?? [],
    latestFormation: {
      placements: character.guide?.latestFormation?.placements ?? [],
      selfSlot: character.guide?.latestFormation?.selfSlot ?? "",
      focusTitles: character.guide?.latestFormation?.focusTitles ?? []
    },
    recommendedSecrets: {
      items: character.guide?.recommendedSecrets?.items ?? [],
      tipTitles: character.guide?.recommendedSecrets?.tipTitles ?? []
    }
  };
  const guideSlot =
    guide.latestFormation.selfSlot ||
    deriveGuideFallbackSlot({
      conditionKeys: CONDITION_DEFS.filter((condition) => conditionLabels.includes(condition.label)).map(
        (condition) => condition.key
      ),
      featureTags,
      objectiveTags,
      top1: rankedStats[0],
      guide
    });

  const displayTags = uniqueValues([
    character.rarity,
    `天賦${character.tenpu}`,
    `${rankedStats[0].label}1位`,
    `${rankedStats[1].label}2位`,
    character.type ? `${character.type}タイプ` : "",
    guideSlot ? `${guideSlot}向き` : "",
    ...objectiveTags.map(objectiveLabelFor),
    season3 ? "S3注目" : "",
    ...conditionLabels,
    ...(season3 ? [season3.type, ...season3.bestUseCases, ...season3.tags.map(seasonTagLabel)] : [])
  ]);

  const searchText = normalizeSearchText(
    [
      character.name,
      character.rarity,
      character.type ? `${character.type}タイプ` : "",
      `天賦${character.tenpu}`,
      ...displayTags,
      ...featureTags,
      ...objectiveTags.map(objectiveLabelFor),
      character.battleArtName ?? "",
      ...(character.battleArtEffects ?? []),
      battleArtText,
      ...character.skills,
      ...skillRecords.map((skill) => skill.summary),
      ...skillRecords.map((skill) => skill.initialEffect),
      ...skillRecords.map((skill) => skill.maxEffect),
      ...character.personalities,
      season3?.roleSummary ?? "",
      ...(season3?.strengths ?? []),
      ...(season3?.weaknesses ?? []),
      ...(season3?.bestUseCases ?? []),
      ...(season3?.tags ?? []).map(seasonTagLabel),
      guideSlot,
      ...guide.evaluationPoints,
      ...guide.latestFormation.placements.map((row) => `${row.slot} ${row.name}`),
      ...guide.latestFormation.focusTitles,
      ...guide.recommendedSecrets.items.map((item) => item.name),
      ...guide.recommendedSecrets.items.map((item) => item.effect),
      ...guide.recommendedSecrets.tipTitles
    ].join(" ")
  );

  return {
    ...character,
    rankedStats,
    top1: rankedStats[0],
    top2: rankedStats[1],
    skillRecords,
    conditionIndex,
    conditionKeys: CONDITION_DEFS.filter((condition) => conditionLabels.includes(condition.label)).map(
      (condition) => condition.key
    ),
    battleArtText,
    featureTags,
    objectiveTags,
    displayTags,
    searchText,
    personalitySet: new Set(character.personalities),
    guide,
    guideSlot,
    season3
  };
}).sort(compareCharactersBase);

const characterByName = Object.fromEntries(
  preparedCharacters.map((character) => [character.name, character])
);

const preparedSkills = Object.values(RAW_SKILLS)
  .map((skill) => {
    const season3 = S3_SKILL_RAW_BY_NAME[skill.name] ?? null;
    const holders = preparedCharacters
      .filter((character) => character.skills.includes(skill.name))
      .sort(compareCharactersBase);
    const conditionLabels = skill.conditions.map(conditionLabelFor);
    const featureTags = deriveSkillFeatureTags(skill, season3);
    const searchText = normalizeSearchText(
      [
        skill.name,
        skill.summary,
        skill.initialEffect,
        skill.maxEffect,
        ...conditionLabels,
        ...featureTags.map((featureKey) => SKILL_EFFECT_MAP[featureKey] ?? featureKey),
        ...holders.map((holder) => holder.name),
        season3?.category ?? "",
        season3?.trigger?.type ?? "",
        season3?.target?.scope ?? "",
        ...(season3?.effects ?? []).map((effect) => effect.valueText ?? ""),
        ...(season3?.tags ?? []).map(seasonTagLabel)
      ].join(" ")
    );

    return {
      ...skill,
      holders,
      holderCount: holders.length,
      conditionLabels,
      featureTags,
      searchText,
      season3
    };
  })
  .sort(
    (left, right) =>
      left.order - right.order ||
      right.holderCount - left.holderCount ||
      left.name.localeCompare(right.name, "ja")
  );

const season3FeaturedCharacters = preparedCharacters.filter((character) => character.season3);
const season3FeaturedSkills = preparedSkills.filter((skill) => skill.season3);

const elements = {
  viewButtons: Array.from(document.querySelectorAll("[data-view-tab]")),
  viewPanels: Array.from(document.querySelectorAll(".app-view")),
  datasetCount: document.querySelector("#datasetCount"),
  ssrCount: document.querySelector("#ssrCount"),
  srCount: document.querySelector("#srCount"),
  skillCount: document.querySelector("#skillCount"),
  sourceCount: document.querySelector("#sourceCount"),
  seasonLabel: document.querySelector("#seasonLabel"),
  seasonRevision: document.querySelector("#seasonRevision"),
  seasonUpdatedAt: document.querySelector("#seasonUpdatedAt"),
  commanderOptions: document.querySelector("#commanderOptions"),
  sourceLinkList: document.querySelector("#sourceLinkList"),
  liveFeatureList: document.querySelector("#liveFeatureList"),
  plannedFeatureList: document.querySelector("#plannedFeatureList"),
  skillDialog: document.querySelector("#skillDialog"),
  skillDialogTitle: document.querySelector("#skillDialogTitle"),
  skillDialogMeta: document.querySelector("#skillDialogMeta"),
  skillDialogSummaryBlock: document.querySelector("#skillDialogSummaryBlock"),
  skillDialogSummary: document.querySelector("#skillDialogSummary"),
  skillDialogInitialBlock: document.querySelector("#skillDialogInitialBlock"),
  skillDialogInitial: document.querySelector("#skillDialogInitial"),
  skillDialogMaxBlock: document.querySelector("#skillDialogMaxBlock"),
  skillDialogMax: document.querySelector("#skillDialogMax"),
  skillDialogClose: document.querySelector("#skillDialogClose"),

  powerForm: document.querySelector("#searchForm"),
  primaryStat: document.querySelector("#primaryStat"),
  secondaryStat: document.querySelector("#secondaryStat"),
  chainCommander: document.querySelector("#chainCommander"),
  chainSortEnabled: document.querySelector("#chainSortEnabled"),
  rarityFilters: document.querySelector("#rarityFilters"),
  conditionFilters: document.querySelector("#conditionFilters"),
  powerFeatureFilters: document.querySelector("#powerFeatureFilters"),
  resetButton: document.querySelector("#resetButton"),
  validationMessage: document.querySelector("#validationMessage"),
  summary: document.querySelector("#searchSummary"),
  exactTitle: document.querySelector("#exactTitle"),
  exactDescription: document.querySelector("#exactDescription"),
  exactCount: document.querySelector("#exactCount"),
  exactList: document.querySelector("#exactList"),
  partialTitle: document.querySelector("#partialTitle"),
  partialDescription: document.querySelector("#partialDescription"),
  partialCount: document.querySelector("#partialCount"),
  partialList: document.querySelector("#partialList"),

  characterView: document.querySelector("#view-character"),
  characterKeyword: document.querySelector("#characterKeyword"),
  characterSort: document.querySelector("#characterSort"),
  characterRarityFilters: document.querySelector("#characterRarityFilters"),
  characterTypeFilters: document.querySelector("#characterTypeFilters"),
  characterObjectiveFilters: document.querySelector("#characterObjectiveFilters"),
  characterTagFilters: document.querySelector("#characterTagFilters"),
  characterFeatureFilters: document.querySelector("#characterFeatureFilters"),
  characterResetButton: document.querySelector("#characterResetButton"),
  characterSummary: document.querySelector("#characterSummary"),
  characterCount: document.querySelector("#characterCount"),
  characterList: document.querySelector("#characterList"),

  skillView: document.querySelector("#view-skill"),
  skillKeyword: document.querySelector("#skillKeyword"),
  skillSort: document.querySelector("#skillSort"),
  skillConditionFilters: document.querySelector("#skillConditionFilters"),
  skillEffectFilters: document.querySelector("#skillEffectFilters"),
  skillResetButton: document.querySelector("#skillResetButton"),
  skillSummary: document.querySelector("#skillSummary"),
  skillDbCount: document.querySelector("#skillDbCount"),
  skillList: document.querySelector("#skillList"),

  synergyView: document.querySelector("#view-synergy"),
  synergyCommander: document.querySelector("#synergyCommander"),
  synergyKeyword: document.querySelector("#synergyKeyword"),
  synergyRarityFilters: document.querySelector("#synergyRarityFilters"),
  synergyConditionFilters: document.querySelector("#synergyConditionFilters"),
  synergyFeatureFilters: document.querySelector("#synergyFeatureFilters"),
  synergyResetButton: document.querySelector("#synergyResetButton"),
  synergySummary: document.querySelector("#synergySummary"),
  synergyQuickGrid: document.querySelector("#synergyQuickGrid"),
  synergyCount: document.querySelector("#synergyCount"),
  synergyList: document.querySelector("#synergyList"),

  s3HeroSeasonLabel: document.querySelector("#s3HeroSeasonLabel"),
  s3ThemeLabel: document.querySelector("#s3ThemeLabel"),
  s3RevisionLabel: document.querySelector("#s3RevisionLabel"),
  s3ContextNotes: document.querySelector("#s3ContextNotes"),
  s3Objective: document.querySelector("#s3Objective"),
  s3SlotFocus: document.querySelector("#s3SlotFocus"),
  s3ResetButton: document.querySelector("#s3ResetButton"),
  s3Summary: document.querySelector("#s3Summary"),
  s3HeroCount: document.querySelector("#s3HeroCount"),
  s3HeroList: document.querySelector("#s3HeroList"),
  s3UpgradeGrid: document.querySelector("#s3UpgradeGrid"),
  s3SkillCount: document.querySelector("#s3SkillCount"),
  s3SkillList: document.querySelector("#s3SkillList"),
  s3WeightGrid: document.querySelector("#s3WeightGrid"),
  s3RoleRuleGrid: document.querySelector("#s3RoleRuleGrid"),
  s3PopularSkillList: document.querySelector("#s3PopularSkillList"),
  s3CoreGrid: document.querySelector("#s3CoreGrid"),
  s3UpdateList: document.querySelector("#s3UpdateList")
};

function populateStatSelect(select, placeholder) {
  if (!select) {
    return;
  }

  const options = [`<option value="">${placeholder}</option>`];

  for (const stat of STAT_DEFS) {
    options.push(`<option value="${stat.key}">${stat.label}</option>`);
  }

  select.innerHTML = options.join("");
}

function populateSimpleSelect(select, definitions, defaultValue) {
  if (!select) {
    return;
  }

  select.innerHTML = definitions
    .map((definition) => `<option value="${definition.key}">${definition.label}</option>`)
    .join("");
  select.value = defaultValue ?? definitions[0]?.key ?? "";
}

function renderCheckboxGroup(container, definitions, name, checkedValues) {
  if (!container) {
    return;
  }

  const checkedSet = new Set(checkedValues);

  container.innerHTML = definitions
    .map(
      (item) => `
        <label class="chip-option">
          <input
            type="checkbox"
            name="${escapeHtml(name)}"
            value="${escapeHtml(item.key)}"
            ${checkedSet.has(item.key) ? "checked" : ""}
          >
          <span class="chip-label">
            <strong>${escapeHtml(item.label)}</strong>
            ${item.hint ? `<small>${escapeHtml(item.hint)}</small>` : ""}
          </span>
        </label>
      `
    )
    .join("");
}

function readCheckedValuesIn(root, name) {
  return Array.from(root.querySelectorAll(`input[name="${name}"]:checked`), (input) => input.value);
}

function keywordMatches(haystack, needle) {
  return !normalizeSearchText(needle) || haystack.includes(normalizeSearchText(needle));
}

function syncSecondaryOptions() {
  const primary = elements.primaryStat.value;

  for (const option of elements.secondaryStat.options) {
    option.disabled = Boolean(option.value && option.value === primary);
  }

  if (elements.secondaryStat.value === primary) {
    elements.secondaryStat.value = "";
  }
}

function setActiveView(viewKey, options = {}) {
  const nextView = VIEW_KEYS.includes(viewKey) ? viewKey : "power";
  const updateHash = options.updateHash !== false;

  elements.viewButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.viewTab === nextView);
  });

  elements.viewPanels.forEach((panel) => {
    panel.hidden = panel.id !== `view-${nextView}`;
  });

  if (updateHash) {
    const nextHash = `#${nextView}`;
    if (window.location.hash !== nextHash) {
      history.replaceState(null, "", nextHash);
    }
  }
}

function populateCommanderDatalist() {
  if (!elements.commanderOptions) {
    return;
  }

  elements.commanderOptions.innerHTML = preparedCharacters
    .map(
      (character) =>
        `<option value="${escapeHtml(character.name)}">${escapeHtml(character.rarity)} / 天賦 ${character.tenpu}</option>`
    )
    .join("");
}

function getMatchedSkills(character, selectedConditions) {
  if (!selectedConditions.length) {
    return [];
  }

  const matched = new Map();

  for (const condition of selectedConditions) {
    for (const skill of character.conditionIndex[condition] ?? []) {
      matched.set(skill.name, skill);
    }
  }

  return [...matched.values()].sort(
    (left, right) => left.order - right.order || left.name.localeCompare(right.name, "ja")
  );
}

function matchesConditions(character, selectedConditions) {
  return selectedConditions.every((condition) => (character.conditionIndex[condition] ?? []).length > 0);
}

function compareNumberArrays(left, right) {
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const leftValue = left[index] ?? Number.MAX_SAFE_INTEGER;
    const rightValue = right[index] ?? Number.MAX_SAFE_INTEGER;
    if (leftValue !== rightValue) {
      return leftValue - rightValue;
    }
  }

  return left.length - right.length;
}

function getChainStats(referenceCharacter, targetCharacter) {
  if (!referenceCharacter || referenceCharacter.id === targetCharacter.id) {
    return {
      rate: null,
      base: targetCharacter.chainBase * 100,
      bonus: 0,
      shared: []
    };
  }

  const shared = targetCharacter.personalities
    .filter((personality) => referenceCharacter.personalitySet.has(personality))
    .map((name) => ({ name, bonus: ENISHI_WEIGHTS[name] ?? 0 }));

  const bonus = shared.reduce((sum, row) => sum + row.bonus, 0);
  const base = targetCharacter.chainBase * 100;

  return {
    rate: base + bonus,
    base,
    bonus,
    shared
  };
}

function sortPowerMatches(list, context) {
  const relevantStats = [...new Set(context.selectedStats.filter(Boolean))];
  const skillCache = new Map();
  const signatureCache = new Map();
  const chainCache = new Map();

  function matchedSkills(character) {
    if (!skillCache.has(character.id)) {
      skillCache.set(character.id, getMatchedSkills(character, context.selectedConditions));
    }
    return skillCache.get(character.id);
  }

  function skillSignature(character) {
    if (!signatureCache.has(character.id)) {
      signatureCache.set(
        character.id,
        matchedSkills(character).map((skill) => SKILL_RANK[skill.name] ?? Number.MAX_SAFE_INTEGER)
      );
    }
    return signatureCache.get(character.id);
  }

  function chainStats(character) {
    if (!chainCache.has(character.id)) {
      chainCache.set(character.id, getChainStats(context.chainReference, character));
    }
    return chainCache.get(character.id);
  }

  return [...list].sort((left, right) => {
    if (context.chainSortEnabled && context.chainReference) {
      const rightChain = chainStats(right);
      const leftChain = chainStats(left);
      const chainDiff = (rightChain.rate ?? -1) - (leftChain.rate ?? -1);
      if (chainDiff) {
        return chainDiff;
      }

      const sharedDiff = rightChain.shared.length - leftChain.shared.length;
      if (sharedDiff) {
        return sharedDiff;
      }
    }

    if (context.selectedConditions.length) {
      const signatureDiff = compareNumberArrays(skillSignature(left), skillSignature(right));
      if (signatureDiff) {
        return signatureDiff;
      }

      const matchedSkillDiff = matchedSkills(right).length - matchedSkills(left).length;
      if (matchedSkillDiff) {
        return matchedSkillDiff;
      }
    }

    for (const statKey of relevantStats) {
      if (right[statKey] !== left[statKey]) {
        return right[statKey] - left[statKey];
      }
    }

    return compareCharactersBase(left, right);
  });
}

function sortCharactersForDb(list, sortKey) {
  return [...list].sort((left, right) => {
    if (sortKey === "name") {
      return left.name.localeCompare(right.name, "ja") || compareCharactersBase(left, right);
    }

    if (sortKey === "topPair") {
      const topPairDiff = right.top1.value + right.top2.value - (left.top1.value + left.top2.value);
      return topPairDiff || compareCharactersBase(left, right);
    }

    if (sortKey === "chainBase") {
      const chainDiff = right.chainBase - left.chainBase;
      return chainDiff || compareCharactersBase(left, right);
    }

    if (sortKey !== "rarityTenpu") {
      const statDiff = right[sortKey] - left[sortKey];
      return statDiff || compareCharactersBase(left, right);
    }

    return compareCharactersBase(left, right);
  });
}

function sortSkillsForDb(list, sortKey) {
  return [...list].sort((left, right) => {
    if (sortKey === "holders") {
      return (
        right.holderCount - left.holderCount ||
        left.order - right.order ||
        left.name.localeCompare(right.name, "ja")
      );
    }
    if (sortKey === "name") {
      return left.name.localeCompare(right.name, "ja") || left.order - right.order;
    }
    return (
      left.order - right.order ||
      right.holderCount - left.holderCount ||
      left.name.localeCompare(right.name, "ja")
    );
  });
}

function renderDisplayTags(character, highlightedTags = []) {
  const highlightedSet = new Set(highlightedTags);

  return `
    <div class="meta-chip-list">
      ${character.displayTags
        .map((tag) => {
          const classes = ["meta-chip"];
          if (highlightedSet.has(tag)) {
            classes.push("is-highlight");
          }
          return `<span class="${classes.join(" ")}">${escapeHtml(tag)}</span>`;
        })
        .join("")}
    </div>
  `;
}

function renderFeatureTags(character, highlightedFeatures = []) {
  if (!character.featureTags.length) {
    return "";
  }

  const highlightedSet = new Set(highlightedFeatures);
  return `
    <div class="skill-group">
      <p class="skill-group-title">特徴</p>
      <div class="meta-chip-list">
        ${character.featureTags
          .map((feature) => {
            const classes = ["meta-chip", "is-feature"];
            if (highlightedSet.has(feature)) {
              classes.push("is-highlight");
            }
            const hint = featureHintFor(feature);
            return `<span class="${classes.join(" ")}" title="${escapeHtml(hint)}">${escapeHtml(feature)}</span>`;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderBattleArtBlock(character) {
  if (!character.battleArtName && !(character.battleArtEffects ?? []).length) {
    return "";
  }

  return `
    <div class="battle-art-box">
      <p class="skill-group-title">戦法</p>
      <h4>${escapeHtml(character.battleArtName || "戦法名なし")}</h4>
      <ul class="bullet-list">
        ${(character.battleArtEffects ?? [])
          .map((effect) => `<li>${escapeHtml(effect)}</li>`)
          .join("")}
      </ul>
    </div>
  `;
}

function renderGuideInsightsBlock(character) {
  const evaluationPoints = character.guide?.evaluationPoints ?? [];
  const formation = character.guide?.latestFormation ?? { placements: [], selfSlot: "", focusTitles: [] };
  const secrets = character.guide?.recommendedSecrets ?? { items: [], tipTitles: [] };

  if (
    !character.guideSlot &&
    !evaluationPoints.length &&
    !formation.placements.length &&
    !formation.focusTitles.length &&
    !secrets.items.length &&
    !secrets.tipTitles.length
  ) {
    return "";
  }

  const usageText = character.objectiveTags.length
    ? character.objectiveTags.map(objectiveLabelFor).join(" / ")
    : "汎用";
  const formationMarkup = formation.placements.length
    ? `
        <div class="guide-slot-grid">
          ${formation.placements
            .map(
              (row) => `
                <span class="guide-slot-chip ${row.name === character.name ? "is-self" : ""}">
                  <small>${escapeHtml(row.slot)}</small>
                  <strong>${escapeHtml(row.name)}</strong>
                </span>
              `
            )
            .join("")}
        </div>
      `
    : `<p class="field-note">個別ページに編成データがありません。</p>`;
  const secretMarkup = secrets.items.length
    ? `
        <div class="meta-chip-list">
          ${secrets.items
            .slice(0, 4)
            .map((item) => `<span class="meta-chip">${escapeHtml(item.name)}</span>`)
            .join("")}
        </div>
      `
    : `<p class="field-note">個別ページに秘伝データがありません。</p>`;

  return `
    <div class="battle-art-box guide-box">
      <p class="skill-group-title">運用メモ</p>
      <p class="guide-summary">
        推奨配置: ${escapeHtml(character.guideSlot || "-")} / 主用途: ${escapeHtml(usageText)}
      </p>
      ${
        evaluationPoints.length
          ? `<ul class="bullet-list">${evaluationPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>`
          : ""
      }
      <div class="effect-grid">
        <section class="effect-box">
          <h3>最新シーズン編成</h3>
          ${formationMarkup}
          ${
            formation.focusTitles.length
              ? `<ul class="bullet-list">${formation.focusTitles
                  .map((title) => `<li>${escapeHtml(title)}</li>`)
                  .join("")}</ul>`
              : ""
          }
        </section>
        <section class="effect-box">
          <h3>おすすめ秘伝</h3>
          ${secretMarkup}
          ${
            secrets.tipTitles.length
              ? `<ul class="bullet-list">${secrets.tipTitles
                  .map((title) => `<li>${escapeHtml(title)}</li>`)
                  .join("")}</ul>`
              : ""
          }
        </section>
      </div>
    </div>
  `;
}

function renderSeason3HeroBlock(character) {
  const season3 = character.season3;
  if (!season3) {
    return "";
  }

  const useCaseText = season3.bestUseCases?.length ? season3.bestUseCases.join(" / ") : "汎用";
  const tagMarkup = season3.tags
    .map((tagKey) => `<span class="meta-chip">${escapeHtml(seasonTagLabel(tagKey))}</span>`)
    .join("");

  return `
    <div class="season-banner">
      <p class="season-pill">${escapeHtml(SEASON3.seasonLabel)} / ${escapeHtml(season3.masterRevision)} / ${escapeHtml(
        season3.type
      )}</p>
      <p>${escapeHtml(season3.roleSummary)}</p>
      <div class="score-grid">
        <div class="score-box">
          <small>主将</small>
          <strong>${season3.commanderScore}</strong>
        </div>
        <div class="score-box">
          <small>副将</small>
          <strong>${season3.viceScore}</strong>
        </div>
        <div class="score-box">
          <small>補佐</small>
          <strong>${season3.aideScore}</strong>
        </div>
      </div>
      <div class="meta-chip-list">
        <span class="meta-chip is-highlight">${escapeHtml(useCaseText)}</span>
        ${tagMarkup}
      </div>
    </div>
  `;
}

function renderSeason3SkillBlock(skill) {
  const season3 = skill.season3;
  if (!season3) {
    return "";
  }

  const tagMarkup = season3.tags
    .map((tagKey) => `<span class="meta-chip">${escapeHtml(seasonTagLabel(tagKey))}</span>`)
    .join("");
  const triggerText = season3.trigger?.type ?? "不明";
  const targetText = season3.target?.scope ?? "不明";
  const effectsText = (season3.effects ?? []).map((effect) => effect.valueText).join(" / ");

  return `
    <div class="season-banner">
      <p class="season-pill">${escapeHtml(SEASON3.seasonLabel)} / ${escapeHtml(season3.masterRevision)} / ${escapeHtml(
        season3.category
      )}</p>
      <p>${escapeHtml(`発動: ${triggerText} / 対象: ${targetText}`)}</p>
      <p>${escapeHtml(effectsText || "効果メモなし")}</p>
      <div class="score-grid">
        <div class="score-box">
          <small>主将価値</small>
          <strong>${season3.slotValue?.commander ?? "-"}</strong>
        </div>
        <div class="score-box">
          <small>副将価値</small>
          <strong>${season3.slotValue?.vice ?? "-"}</strong>
        </div>
        <div class="score-box">
          <small>補佐価値</small>
          <strong>${season3.slotValue?.aide ?? "-"}</strong>
        </div>
      </div>
      <div class="meta-chip-list">${tagMarkup}</div>
    </div>
  `;
}

function renderPersonalityGroup(character, chainStats) {
  const sharedByName = Object.fromEntries((chainStats?.shared ?? []).map((entry) => [entry.name, entry.bonus]));

  return `
    <div class="skill-group">
      <p class="skill-group-title">個性</p>
      <div class="skill-chip-list">
        ${character.personalities
          .map((personality) => {
            const isShared = personality in sharedByName;
            return `
              <span class="personality-chip ${isShared ? "is-shared" : ""}">
                ${escapeHtml(personality)}
                ${isShared ? `<small>+${sharedByName[personality]}</small>` : ""}
              </span>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderSkillChips(character, selectedConditionKeys) {
  const matchedSkills = getMatchedSkills(character, selectedConditionKeys);
  const matchedNames = new Set(matchedSkills.map((skill) => skill.name));
  const primaryMatchedSkill = matchedSkills[0]?.name ?? null;

  return `
    <div class="skill-group">
      <p class="skill-group-title">所持技能</p>
      <div class="skill-chip-list">
        ${character.skillRecords
          .map((skill) => {
            const classes = ["skill-chip"];
            if (matchedNames.has(skill.name)) {
              classes.push("is-matched");
            }
            if (primaryMatchedSkill === skill.name) {
              classes.push("is-primary-match");
            }

            const conditionLabels = skill.conditions.map(conditionLabelFor).join(" / ");
            const caption = conditionLabels || "解説を表示";

            return `
              <button
                type="button"
                class="${classes.join(" ")}"
                data-skill-name="${escapeHtml(skill.name)}"
              >
                <strong>${escapeHtml(skill.name)}</strong>
                <small>${escapeHtml(caption)}</small>
              </button>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderChainInfo(chainStats) {
  if (!chainStats || chainStats.rate == null) {
    return "";
  }

  const sharedText = chainStats.shared.length
    ? chainStats.shared
        .map((entry) => (entry.bonus ? `${entry.name}(+${entry.bonus})` : entry.name))
        .join(" / ")
    : "共通個性なし";

  return `
    <div class="chain-box">
      <div class="chain-head">
        <span class="chain-pill">連鎖率 ${escapeHtml(formatPercent(chainStats.rate))}</span>
        <span class="chain-pill chain-pill-muted">
          基礎 ${escapeHtml(formatPercent(chainStats.base))} + 個性加算 ${escapeHtml(
            formatPercent(chainStats.bonus)
          )}
        </span>
      </div>
      <p class="chain-traits">${escapeHtml(sharedText)}</p>
    </div>
  `;
}

function renderStatsGrid(character, selectedStats) {
  const selectedSet = new Set(selectedStats.filter(Boolean));

  return STAT_DEFS.map((stat) => {
    const classes = ["stat-item"];
    if (selectedSet.has(stat.key)) {
      classes.push("is-highlight");
    }
    if (character.top1.key === stat.key || character.top2.key === stat.key) {
      classes.push("is-top-two");
    }

    return `
      <div class="${classes.join(" ")}">
        <dt>${escapeHtml(stat.label)}</dt>
        <dd>${character[stat.key]}</dd>
      </div>
    `;
  }).join("");
}

function renderCardActions(character) {
  return `
    <div class="card-actions">
      <button
        type="button"
        class="mini-button"
        data-use-synergy-reference="${escapeHtml(character.name)}"
      >
        この武将を基準に相性を見る
      </button>
    </div>
  `;
}

function renderCharacterCard(character, options = {}) {
  const chainStats = options.chainReference ? getChainStats(options.chainReference, character) : null;
  const highlightedTags = options.highlightedTags ?? [];
  const selectedStats = options.selectedStats ?? [];
  const selectedConditionKeys = options.selectedConditionKeys ?? [];
  const showTags = options.showTags ?? false;
  const showPersonalities = options.showPersonalities ?? false;
  const showActions = options.showActions ?? true;
  const showSeason3Info = options.showSeason3Info ?? false;
  const showBattleArt = options.showBattleArt ?? true;
  const showGuideInsights = options.showGuideInsights ?? false;

  return `
    <article class="character-card">
      <div class="card-layout">
        <div class="character-thumb-wrap">
          <img
            class="character-thumb"
            src="${escapeHtml(character.imageUrl)}"
            alt="${escapeHtml(character.name)}"
            loading="lazy"
          >
        </div>
        <div class="card-main">
          <div class="card-header">
            <div>
              <h3>${escapeHtml(character.name)}</h3>
              <p class="subline">
                ${escapeHtml(character.rarity)} / ${escapeHtml(character.type || "-")}タイプ / 天賦 ${character.tenpu} /
                基礎連鎖率 ${escapeHtml(formatPercent(character.chainBase * 100))}
              </p>
            </div>
            <a class="source-link" href="${escapeHtml(character.sourceUrl)}" target="_blank" rel="noreferrer">GameWith</a>
          </div>
          <div class="top-pair">
            <span class="pair-badge rank-1">1位: ${escapeHtml(character.top1.label)} ${character.top1.value}</span>
            <span class="pair-badge rank-2">2位: ${escapeHtml(character.top2.label)} ${character.top2.value}</span>
          </div>
          ${showBattleArt ? renderBattleArtBlock(character) : ""}
          ${showGuideInsights ? renderGuideInsightsBlock(character) : ""}
          ${showSeason3Info ? renderSeason3HeroBlock(character) : ""}
          ${renderFeatureTags(character, highlightedTags)}
          ${showTags ? renderDisplayTags(character, highlightedTags) : ""}
          ${renderChainInfo(chainStats)}
          ${renderSkillChips(character, selectedConditionKeys)}
          ${showPersonalities ? renderPersonalityGroup(character, chainStats) : ""}
          ${showActions ? renderCardActions(character) : ""}
          <dl class="stats-grid">
            ${renderStatsGrid(character, selectedStats)}
          </dl>
        </div>
      </div>
    </article>
  `;
}

function renderCharacterCards(list, options = {}) {
  const emptyMessage = options.emptyMessage ?? "一致する武将はいません。";

  if (!list.length) {
    return `
      <div class="empty-state">
        <p>${escapeHtml(emptyMessage)}</p>
      </div>
    `;
  }

  return list.map((character) => renderCharacterCard(character, options)).join("");
}

function renderSkillCard(skill) {
  const conditionMarkup = skill.conditionLabels.length
    ? skill.conditionLabels.map((label) => `<span class="meta-chip">${escapeHtml(label)}</span>`).join("")
    : `<span class="meta-chip">条件なし</span>`;
  const featureMarkup = skill.featureTags.length
    ? skill.featureTags
        .map((feature) => `<span class="meta-chip is-feature">${escapeHtml(SKILL_EFFECT_MAP[feature] ?? feature)}</span>`)
        .join("")
    : "";

  const holderMarkup = skill.holders.length
    ? skill.holders
        .map(
          (holder) => `
            <button
              type="button"
              class="holder-button"
              data-open-character="${escapeHtml(holder.name)}"
            >
              ${escapeHtml(holder.name)}
            </button>
          `
        )
        .join("")
    : `<span class="meta-chip">所持武将なし</span>`;

  return `
    <article class="skill-card">
      <div class="skill-card-head">
        <div>
          <button type="button" class="skill-title-button" data-skill-name="${escapeHtml(skill.name)}">
            ${escapeHtml(skill.name)}
          </button>
          <p class="subline">所持武将 ${skill.holderCount}体 / 技能Lv ${skill.level || 0}</p>
        </div>
        <div class="meta-chip-list">${conditionMarkup}${featureMarkup}</div>
      </div>
      <p class="skill-summary">${escapeHtml(skill.summary || "概要データはありません。")}</p>
      ${renderSeason3SkillBlock(skill)}
      <div class="effect-grid">
        <section class="effect-box">
          <h3>初期効果</h3>
          <p>${escapeHtml(skill.initialEffect || "データなし")}</p>
        </section>
        <section class="effect-box">
          <h3>最大効果</h3>
          <p>${escapeHtml(skill.maxEffect || "データなし")}</p>
        </section>
      </div>
      <div class="skill-group">
        <p class="skill-group-title">所持武将</p>
        <div class="holder-list">${holderMarkup}</div>
      </div>
    </article>
  `;
}

function renderSkillCards(list, emptyMessage) {
  if (!list.length) {
    return `
      <div class="empty-state">
        <p>${escapeHtml(emptyMessage)}</p>
      </div>
    `;
  }

  return list.map((skill) => renderSkillCard(skill)).join("");
}

function renderEmptyState(message) {
  return `
    <div class="empty-state">
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function setPowerValidation(message) {
  elements.validationMessage.textContent = message;
  elements.validationMessage.hidden = !message;
}

function formatSummaryText(parts, fallback) {
  return parts.length ? `検索条件: ${parts.join(" | ")}` : fallback;
}

function buildPowerDescription(baseText, chainContext) {
  if (!chainContext.chainSortEnabled || !chainContext.chainReference) {
    return baseText;
  }

  return `${baseText} 並び順は ${chainContext.chainReference.name} を主将に置いた場合の副将連鎖率が最優先です。`;
}

function getPowerSearchState(primary, secondary, rarities, conditions, features, chainContext) {
  const filteredCharacters = preparedCharacters.filter(
    (character) =>
      rarities.includes(character.rarity) &&
      matchesConditions(character, conditions) &&
      features.every((feature) => character.featureTags.includes(feature)) &&
      (!chainContext.chainReference || character.id !== chainContext.chainReference.id)
  );

  const sortContext = {
    selectedStats: [primary, secondary],
    selectedConditions: conditions,
    chainSortEnabled: chainContext.chainSortEnabled,
    chainReference: chainContext.chainReference
  };

  if (!primary) {
    return {
      summary: formatSummaryText(
        [
          conditions.length ? `技能条件: ${conditions.map(conditionLabelFor).join(" / ")}` : "",
          features.length ? `特徴: ${features.join(" / ")}` : "",
          rarities.length !== RARITY_DEFS.length ? `レアリティ: ${rarities.join(" / ")}` : "",
          chainContext.chainSortEnabled && chainContext.chainReference
            ? `連鎖率基準: ${chainContext.chainReference.name}`
            : ""
        ].filter(Boolean),
        "技能条件・特徴・連鎖率基準に一致する武将を表示しています。"
      ),
      exactTitle:
        chainContext.chainSortEnabled && chainContext.chainReference
          ? `連鎖率順: ${chainContext.chainReference.name}`
          : "条件一致",
      exactDescription: buildPowerDescription(
        "選択したレアリティ・技能条件・特徴に一致する武将です。魅力は除外し、攻撃・防御・戦威・策略の4項目だけを表示しています。",
        chainContext
      ),
      partialTitle: "ステータス検索の使い方",
      partialDescription:
        "第1ステータスだけを選ぶと 1位一致 / 2位一致、第1・第2ステータスを選ぶと 完全一致 / 逆順一致 で分けて表示します。",
      exact: sortPowerMatches(filteredCharacters, sortContext),
      partial: [],
      exactEmptyMessage:
        chainContext.chainSortEnabled && chainContext.chainReference
          ? "条件に一致する副将候補はいません。"
          : "条件に一致する武将はいません。",
      partialEmptyMessage: "ステータス条件を追加すると、ここに 2位一致 や 逆順一致 を表示します。"
    };
  }

  if (!secondary) {
    return {
      summary: formatSummaryText(
        [
          `ステータス: ${labelFor(primary)}`,
          conditions.length ? `技能条件: ${conditions.map(conditionLabelFor).join(" / ")}` : "",
          features.length ? `特徴: ${features.join(" / ")}` : "",
          rarities.length !== RARITY_DEFS.length ? `レアリティ: ${rarities.join(" / ")}` : "",
          chainContext.chainSortEnabled && chainContext.chainReference
            ? `連鎖率基準: ${chainContext.chainReference.name}`
            : ""
        ].filter(Boolean),
        "ステータス条件に一致する武将を表示しています。"
      ),
      exactTitle: `1位一致: ${labelFor(primary)}`,
      exactDescription: buildPowerDescription(
        "最も高いステータスが選択項目の武将です。レアリティ・技能条件・特徴の絞り込みを反映しています。",
        chainContext
      ),
      partialTitle: `2位一致: ${labelFor(primary)}`,
      partialDescription: buildPowerDescription(
        "1位ではないものの、2番目に高いステータスが選択項目の武将です。レアリティ・技能条件・特徴の絞り込みを反映しています。",
        chainContext
      ),
      exact: sortPowerMatches(
        filteredCharacters.filter((character) => character.top1.key === primary),
        sortContext
      ),
      partial: sortPowerMatches(
        filteredCharacters.filter((character) => character.top2.key === primary),
        sortContext
      ),
      exactEmptyMessage: "1位一致の武将はいません。",
      partialEmptyMessage: "2位一致の武将はいません。"
    };
  }

  return {
    summary: formatSummaryText(
      [
        `ステータス: ${labelFor(primary)} → ${labelFor(secondary)}`,
        conditions.length ? `技能条件: ${conditions.map(conditionLabelFor).join(" / ")}` : "",
        features.length ? `特徴: ${features.join(" / ")}` : "",
        rarities.length !== RARITY_DEFS.length ? `レアリティ: ${rarities.join(" / ")}` : "",
        chainContext.chainSortEnabled && chainContext.chainReference
          ? `連鎖率基準: ${chainContext.chainReference.name}`
          : ""
      ].filter(Boolean),
      "完全一致・逆順一致を表示しています。"
    ),
    exactTitle: `完全一致: ${labelFor(primary)} → ${labelFor(secondary)}`,
    exactDescription: buildPowerDescription(
      "1位・2位の並び順まで一致する武将です。レアリティ・技能条件・特徴の絞り込みを反映しています。",
      chainContext
    ),
    partialTitle: `逆順一致: ${labelFor(secondary)} → ${labelFor(primary)}`,
    partialDescription: buildPowerDescription(
      "上位2項目は一致するものの、1位・2位の順番が逆の武将です。レアリティ・技能条件・特徴の絞り込みを反映しています。",
      chainContext
    ),
    exact: sortPowerMatches(
      filteredCharacters.filter(
        (character) => character.top1.key === primary && character.top2.key === secondary
      ),
      sortContext
    ),
    partial: sortPowerMatches(
      filteredCharacters.filter(
        (character) => character.top1.key === secondary && character.top2.key === primary
      ),
      sortContext
    ),
    exactEmptyMessage: "完全一致の武将はいません。",
    partialEmptyMessage: "逆順一致の武将はいません。"
  };
}

function renderPowerEmptyState() {
  elements.summary.textContent =
    "第1ステータス、技能条件、特徴タグ、連鎖率ソートを組み合わせて、戦力を伸ばしやすい武将を探せます。";

  elements.exactTitle.textContent = "検索の使い方";
  elements.exactDescription.textContent =
    "第1ステータスだけを選ぶと 1位一致 / 2位一致、第1・第2ステータスを選ぶと 完全一致 / 逆順一致 で表示します。";
  elements.exactCount.textContent = "";
  elements.exactList.innerHTML = renderEmptyState(
    "まずは攻撃・防御・戦威・策略のいずれか、技能条件、または連鎖率ソートを選んでください。"
  );

  elements.partialTitle.textContent = "DB と相性検索";
  elements.partialDescription.textContent =
    "上のタブから武将DB、技能DB、相性検索にも移動できます。全文検索とタグ検索は武将DB / 技能DB にあります。";
  elements.partialCount.textContent = "";
  elements.partialList.innerHTML = renderEmptyState(
    "魅力は戦力に影響しないため除外しています。SSR と SR のみを対象にしています。"
  );
}

function renderPowerResults() {
  syncSecondaryOptions();

  const primary = elements.primaryStat.value;
  const secondary = elements.secondaryStat.value;
  const rarities = readCheckedValuesIn(elements.powerForm, "power-rarity");
  const conditions = readCheckedValuesIn(elements.powerForm, "power-condition");
  const features = readCheckedValuesIn(elements.powerForm, "power-feature");
  const chainSortEnabled = elements.chainSortEnabled.checked;
  const chainReference = characterByName[elements.chainCommander.value.trim()] ?? null;
  const chainContext = { chainSortEnabled, chainReference };

  const hasActiveFilter =
    Boolean(primary) ||
    Boolean(secondary) ||
    Boolean(conditions.length) ||
    Boolean(features.length) ||
    rarities.length !== RARITY_DEFS.length ||
    (chainSortEnabled && chainReference);

  if (!rarities.length) {
    setPowerValidation("SSR か SR を1つ以上選んでください。");
    return;
  }

  if (!primary && secondary) {
    setPowerValidation("第2ステータスを使う場合は、第1ステータスも選んでください。");
    return;
  }

  if (primary && secondary && primary === secondary) {
    setPowerValidation("第1ステータスと第2ステータスに同じ項目は選べません。");
    return;
  }

  if (chainSortEnabled && !chainReference) {
    setPowerValidation("連鎖率順を使う場合は、基準武将を一覧から選んでください。");
    return;
  }

  setPowerValidation("");

  if (!hasActiveFilter) {
    renderPowerEmptyState();
    return;
  }

  const state = getPowerSearchState(primary, secondary, rarities, conditions, features, chainContext);

  elements.summary.textContent = state.summary;
  elements.exactTitle.textContent = state.exactTitle;
  elements.exactDescription.textContent = state.exactDescription;
  elements.exactCount.textContent = `${state.exact.length}体`;
  elements.exactList.innerHTML = renderCharacterCards(state.exact, {
    selectedStats: [primary, secondary],
    selectedConditionKeys: conditions,
    highlightedTags: features,
    chainReference,
    emptyMessage: state.exactEmptyMessage
  });

  elements.partialTitle.textContent = state.partialTitle;
  elements.partialDescription.textContent = state.partialDescription;
  elements.partialCount.textContent = state.partial.length ? `${state.partial.length}体` : "";
  elements.partialList.innerHTML = renderCharacterCards(state.partial, {
    selectedStats: [primary, secondary],
    selectedConditionKeys: conditions,
    highlightedTags: features,
    chainReference,
    emptyMessage: state.partialEmptyMessage
  });
}

function resetPowerSearch() {
  elements.primaryStat.value = "";
  elements.secondaryStat.value = "";
  elements.chainCommander.value = "";
  elements.chainSortEnabled.checked = false;
  document
    .querySelectorAll('input[name="power-rarity"]')
    .forEach((input) => (input.checked = defaultRarities.includes(input.value)));
  document
    .querySelectorAll('input[name="power-condition"]')
    .forEach((input) => (input.checked = false));
  document
    .querySelectorAll('input[name="power-feature"]')
    .forEach((input) => (input.checked = false));
  setPowerValidation("");
  renderPowerResults();
}

function renderCharacterDb() {
  const keyword = elements.characterKeyword.value.trim();
  const sortKey = elements.characterSort.value;
  const rarities = readCheckedValuesIn(elements.characterView, "db-rarity");
  const types = readCheckedValuesIn(elements.characterView, "db-type");
  const objectives = readCheckedValuesIn(elements.characterView, "db-objective");
  const tags = readCheckedValuesIn(elements.characterView, "db-tag");
  const features = readCheckedValuesIn(elements.characterView, "db-feature");
  const selectedConditionKeys = getConditionKeysFromLabels(tags);

  const filtered = preparedCharacters.filter(
    (character) =>
      rarities.includes(character.rarity) &&
      types.includes(character.type) &&
      objectives.every((objective) => character.objectiveTags.includes(objective)) &&
      tags.every((tag) => character.displayTags.includes(tag)) &&
      features.every((feature) => character.featureTags.includes(feature)) &&
      keywordMatches(character.searchText, keyword)
  );

  const sorted = sortCharactersForDb(filtered, sortKey);

  elements.characterSummary.textContent = formatSummaryText(
    [
      keyword ? `全文: ${keyword}` : "",
      types.length !== TYPE_DEFS.length ? `タイプ: ${types.map(typeLabelFor).join(" / ")}` : "",
      objectives.length ? `目的: ${objectives.map(objectiveLabelFor).join(" / ")}` : "",
      tags.length ? `タグ: ${tags.join(" / ")}` : "",
      features.length ? `特徴: ${features.join(" / ")}` : "",
      rarities.length !== RARITY_DEFS.length ? `レアリティ: ${rarities.join(" / ")}` : "",
      `並び順: ${CHARACTER_SORT_MAP[sortKey]}`
    ].filter(Boolean),
    "武将DBでは、武将名、技能名、技能説明、個性、タグ、特徴を横断して検索できます。"
  );

  elements.characterCount.textContent = `${sorted.length}体`;
  elements.characterList.innerHTML = renderCharacterCards(sorted, {
    showTags: true,
    showPersonalities: true,
    showGuideInsights: true,
    showSeason3Info: true,
    highlightedTags: [...tags, ...features],
    selectedConditionKeys,
    emptyMessage: "条件に一致する武将はいません。"
  });
}

function resetCharacterDb() {
  elements.characterKeyword.value = "";
  elements.characterSort.value = "rarityTenpu";
  document
    .querySelectorAll('input[name="db-rarity"]')
    .forEach((input) => (input.checked = defaultRarities.includes(input.value)));
  document
    .querySelectorAll('input[name="db-type"]')
    .forEach((input) => (input.checked = defaultTypes.includes(input.value)));
  document.querySelectorAll('input[name="db-objective"]').forEach((input) => (input.checked = false));
  document.querySelectorAll('input[name="db-tag"]').forEach((input) => (input.checked = false));
  document.querySelectorAll('input[name="db-feature"]').forEach((input) => (input.checked = false));
  renderCharacterDb();
}

function renderSkillDb() {
  const keyword = elements.skillKeyword.value.trim();
  const sortKey = elements.skillSort.value;
  const conditions = readCheckedValuesIn(elements.skillView, "skill-condition");
  const effects = readCheckedValuesIn(elements.skillView, "skill-effect");

  const filtered = preparedSkills.filter(
    (skill) =>
      conditions.every((condition) => skill.conditions.includes(condition)) &&
      effects.every((effect) => skill.featureTags.includes(effect)) &&
      keywordMatches(skill.searchText, keyword)
  );

  const sorted = sortSkillsForDb(filtered, sortKey);

  elements.skillSummary.textContent = formatSummaryText(
    [
      keyword ? `全文: ${keyword}` : "",
      conditions.length ? `条件: ${conditions.map(conditionLabelFor).join(" / ")}` : "",
      effects.length ? `効果種別: ${effects.map((effect) => SKILL_EFFECT_MAP[effect] ?? effect).join(" / ")}` : "",
      `並び順: ${SKILL_SORT_MAP[sortKey]}`
    ].filter(Boolean),
    "技能DBでは、技能名、効果文、所持武将までまとめて検索できます。"
  );

  elements.skillDbCount.textContent = `${sorted.length}件`;
  elements.skillList.innerHTML = renderSkillCards(sorted, "条件に一致する技能はありません。");
}

function resetSkillDb() {
  elements.skillKeyword.value = "";
  elements.skillSort.value = "order";
  document.querySelectorAll('input[name="skill-condition"]').forEach((input) => (input.checked = false));
  document.querySelectorAll('input[name="skill-effect"]').forEach((input) => (input.checked = false));
  renderSkillDb();
}

function sortSynergyTargets(reference, targets) {
  return [...targets].sort((left, right) => {
    const rightChain = getChainStats(reference, right);
    const leftChain = getChainStats(reference, left);
    return (
      (rightChain.rate ?? -1) - (leftChain.rate ?? -1) ||
      rightChain.shared.length - leftChain.shared.length ||
      compareCharactersBase(left, right)
    );
  });
}

function renderQuickCard(title, candidates, reference) {
  if (!candidates.length) {
    return `
      <article class="quick-card">
        <h3>${escapeHtml(title)}</h3>
        <p>該当候補なし</p>
      </article>
    `;
  }

  return `
    <article class="quick-card">
      <h3>${escapeHtml(title)}</h3>
      <ul>
        ${candidates
          .map((character) => {
            const chainStats = getChainStats(reference, character);
            return `
              <li>
                <span>${escapeHtml(character.name)}</span>
                <strong>${escapeHtml(formatPercent(chainStats.rate))}</strong>
              </li>
            `;
          })
          .join("")}
      </ul>
    </article>
  `;
}

function renderSynergy() {
  const reference = characterByName[elements.synergyCommander.value.trim()] ?? null;
  const keyword = elements.synergyKeyword.value.trim();
  const rarities = readCheckedValuesIn(elements.synergyView, "synergy-rarity");
  const conditions = readCheckedValuesIn(elements.synergyView, "synergy-condition");
  const features = readCheckedValuesIn(elements.synergyView, "synergy-feature");

  if (!reference) {
    elements.synergySummary.textContent =
      "基準武将を選ぶと、連鎖率順と共通個性の内訳で相性候補を一覧化します。";
    elements.synergyQuickGrid.innerHTML = renderEmptyState(
      "まずは基準武将を入力してください。カードの「この武将を基準に相性を見る」からも移動できます。"
    );
    elements.synergyCount.textContent = "";
    elements.synergyList.innerHTML = renderEmptyState("基準武将を選ぶとここに候補一覧を表示します。");
    return;
  }

  const filtered = preparedCharacters.filter(
    (character) =>
      character.id !== reference.id &&
      rarities.includes(character.rarity) &&
      matchesConditions(character, conditions) &&
      features.every((feature) => character.featureTags.includes(feature)) &&
      keywordMatches(character.searchText, keyword)
  );

  const sorted = sortSynergyTargets(reference, filtered);
  const quickCards = [
    { title: "総合上位", items: sorted.slice(0, 3) },
    {
      title: "前列候補",
      items: sorted.filter((character) => character.conditionKeys.includes("front")).slice(0, 3)
    },
    {
      title: "中列候補",
      items: sorted.filter((character) => character.conditionKeys.includes("middle")).slice(0, 3)
    },
    {
      title: "後列候補",
      items: sorted.filter((character) => character.conditionKeys.includes("back")).slice(0, 3)
    }
  ];

  elements.synergySummary.textContent = formatSummaryText(
    [
      `基準: ${reference.name}`,
      keyword ? `全文: ${keyword}` : "",
      conditions.length ? `候補条件: ${conditions.map(conditionLabelFor).join(" / ")}` : "",
      features.length ? `特徴: ${features.join(" / ")}` : "",
      rarities.length !== RARITY_DEFS.length ? `レアリティ: ${rarities.join(" / ")}` : ""
    ].filter(Boolean),
    `${reference.name} を主将に置いた場合の候補一覧です。`
  );

  elements.synergyQuickGrid.innerHTML = quickCards
    .map((quickCard) => renderQuickCard(quickCard.title, quickCard.items, reference))
    .join("");

  elements.synergyCount.textContent = `${sorted.length}体`;
  elements.synergyList.innerHTML = renderCharacterCards(sorted, {
    showTags: true,
    showPersonalities: true,
    showSeason3Info: true,
    chainReference: reference,
    selectedConditionKeys: conditions,
    highlightedTags: [...conditions.map(conditionLabelFor), ...features],
    emptyMessage: "条件に一致する候補はいません。"
  });
}

function resetSynergy() {
  elements.synergyCommander.value = "";
  elements.synergyKeyword.value = "";
  document
    .querySelectorAll('input[name="synergy-rarity"]')
    .forEach((input) => (input.checked = defaultRarities.includes(input.value)));
  document
    .querySelectorAll('input[name="synergy-condition"]')
    .forEach((input) => (input.checked = false));
  document.querySelectorAll('input[name="synergy-feature"]').forEach((input) => (input.checked = false));
  renderSynergy();
}

function getSeason3ObjectiveValue(character, objectiveKey) {
  return character.season3?.objectiveScores?.[objectiveKey] ?? 0;
}

function getSeason3SlotValue(character, slotFocus) {
  if (!character.season3) {
    return 0;
  }

  if (slotFocus === "commander") {
    return character.season3.commanderScore;
  }
  if (slotFocus === "vice") {
    return character.season3.viceScore;
  }
  if (slotFocus === "aide") {
    return character.season3.aideScore;
  }
  return Math.round(
    (character.season3.commanderScore + character.season3.viceScore + character.season3.aideScore) / 3
  );
}

function sortSeason3Heroes(objectiveKey, slotFocus) {
  return [...season3FeaturedCharacters].sort((left, right) => {
    const rightScore = getSeason3ObjectiveValue(right, objectiveKey) * 0.6 + getSeason3SlotValue(right, slotFocus) * 0.4;
    const leftScore = getSeason3ObjectiveValue(left, objectiveKey) * 0.6 + getSeason3SlotValue(left, slotFocus) * 0.4;
    return rightScore - leftScore || compareCharactersBase(left, right);
  });
}

function renderS3UpgradeCard(character, objectiveKey, slotFocus) {
  const objectiveLabel = S3_OBJECTIVE_MAP[objectiveKey]?.label ?? objectiveKey;
  const objectiveScore = getSeason3ObjectiveValue(character, objectiveKey);
  const slotScore = getSeason3SlotValue(character, slotFocus);
  const strongest = character.season3?.strengths?.[0] ?? character.season3?.roleSummary ?? "";

  return `
    <article class="quick-card">
      <h3>${escapeHtml(character.name)}</h3>
      <p>${escapeHtml(character.season3?.roleSummary ?? "")}</p>
      <ul>
        <li><span>${escapeHtml(objectiveLabel)}適性</span><strong>${objectiveScore}</strong></li>
        <li><span>${escapeHtml(S3_SLOT_FOCUS_DEFS.find((item) => item.key === slotFocus)?.label ?? "総合")}</span><strong>${slotScore}</strong></li>
        <li><span>優先理由</span><strong>${escapeHtml(strongest)}</strong></li>
      </ul>
    </article>
  `;
}

function getSeason3RoleNeedScore(character, objectiveKey) {
  const objectiveConfig = S3_ROLE_BUCKETS[objectiveKey] ?? {};
  const allRules = [...(objectiveConfig.required ?? []), ...(objectiveConfig.preferred ?? [])];
  return allRules.reduce((total, rule) => {
    return total + (character.season3?.tags?.includes(rule.tag) ? rule.weight * 100 : 0);
  }, 0);
}

function buildSeason3ObjectiveCore(objectiveKey) {
  const commanders = [...season3FeaturedCharacters].sort((left, right) => {
    const rightScore =
      getSeason3ObjectiveValue(right, objectiveKey) * 0.48 +
      (right.season3?.commanderScore ?? 0) * 0.32 +
      getSeason3RoleNeedScore(right, objectiveKey) * 0.2;
    const leftScore =
      getSeason3ObjectiveValue(left, objectiveKey) * 0.48 +
      (left.season3?.commanderScore ?? 0) * 0.32 +
      getSeason3RoleNeedScore(left, objectiveKey) * 0.2;
    return rightScore - leftScore || compareCharactersBase(left, right);
  });
  const commander = commanders[0] ?? null;
  if (!commander) {
    return null;
  }

  const partners = season3FeaturedCharacters
    .filter((character) => character.id !== commander.id)
    .sort((left, right) => {
      const rightChain = getChainStats(commander, right).rate ?? 0;
      const leftChain = getChainStats(commander, left).rate ?? 0;
      const rightScore =
        getSeason3ObjectiveValue(right, objectiveKey) * 0.4 +
        (right.season3?.viceScore ?? 0) * 0.26 +
        getSeason3RoleNeedScore(right, objectiveKey) * 0.22 +
        rightChain * 0.12;
      const leftScore =
        getSeason3ObjectiveValue(left, objectiveKey) * 0.4 +
        (left.season3?.viceScore ?? 0) * 0.26 +
        getSeason3RoleNeedScore(left, objectiveKey) * 0.22 +
        leftChain * 0.12;
      return rightScore - leftScore || compareCharactersBase(left, right);
    })
    .slice(0, 3);

  const objectiveConfig = S3_ROLE_BUCKETS[objectiveKey] ?? {};
  const selected = [commander, ...partners];
  const coveredRequired = (objectiveConfig.required ?? []).filter((rule) =>
    selected.some((character) => character.season3?.tags?.includes(rule.tag))
  );
  const focusWeights = Object.entries(SEASON3.builderWeights?.armyWeights?.[objectiveKey] ?? {})
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([key, value]) => `${key.replace(/Score$/u, "")} ${Math.round(value * 100)}%`);

  return {
    objectiveKey,
    commander,
    partners,
    coveredRequired,
    totalRequired: (objectiveConfig.required ?? []).length,
    focusWeights
  };
}

function renderSeason3CoreCard(core) {
  if (!core) {
    return renderEmptyState("Season 3 コア提案データがありません。");
  }

  const commanderChainText = core.partners.length
    ? core.partners
        .map((partner) => `${partner.name} ${formatPercent(getChainStats(core.commander, partner).rate)}`)
        .join(" / ")
    : "連携候補なし";

  return `
    <article class="quick-card">
      <h3>${escapeHtml(objectiveLabelFor(core.objectiveKey))}コア</h3>
      <p>${escapeHtml(core.commander.name)} を軸にした Season 3 コア案</p>
      <ul>
        <li><span>主将候補</span><strong>${escapeHtml(core.commander.name)}</strong></li>
        <li><span>副将候補</span><strong>${escapeHtml(core.partners[0]?.name ?? "-")}</strong></li>
        <li><span>支援候補</span><strong>${escapeHtml(core.partners[1]?.name ?? core.partners[2]?.name ?? "-")}</strong></li>
        <li><span>必須役割充足</span><strong>${core.coveredRequired.length}/${core.totalRequired}</strong></li>
      </ul>
      <p>${escapeHtml(commanderChainText)}</p>
      <p>${escapeHtml(`重点評価: ${core.focusWeights.join(" / ")}`)}</p>
    </article>
  `;
}

function renderSeason3UpdateCard(update) {
  return `
    <article class="module-card">
      <div class="module-card-head">
        <h3>${escapeHtml(update.revisionKey)}</h3>
        <span class="status-pill is-live">${escapeHtml(update.effectiveAt)}</span>
      </div>
      <p>${escapeHtml(update.title)}</p>
      <div class="meta-chip-list">
        ${update.changedHeroes.map((name) => `<span class="meta-chip">${escapeHtml(name)}</span>`).join("")}
      </div>
      <div class="meta-chip-list">
        ${update.changedSkills.map((name) => `<span class="meta-chip is-feature">${escapeHtml(name)}</span>`).join("")}
      </div>
      <ul class="bullet-list">
        ${update.changedFormulas.map((row) => `<li>${escapeHtml(row)}</li>`).join("")}
        ${update.notes.map((row) => `<li>${escapeHtml(row)}</li>`).join("")}
      </ul>
    </article>
  `;
}

function buildWeightEntries(weightMap) {
  return Object.entries(weightMap ?? {})
    .sort((left, right) => right[1] - left[1])
    .map(([key, value]) => ({
      label: scoreLabelFor(key),
      value: formatRatioPercent(value)
    }));
}

function buildPenaltyEntries(penaltyMap) {
  return Object.entries(penaltyMap ?? {})
    .sort((left, right) => right[1] - left[1])
    .map(([key, value]) => ({
      label: penaltyLabelFor(key),
      value: `${value}点`
    }));
}

function renderSeason3WeightCard(title, description, entries) {
  const listMarkup = entries.length
    ? `<ul class="bullet-list">${entries
        .map((entry) => `<li>${escapeHtml(entry.label)}: ${escapeHtml(entry.value)}</li>`)
        .join("")}</ul>`
    : `<p>表示できるデータがありません。</p>`;

  return `
    <article class="module-card">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
      ${listMarkup}
    </article>
  `;
}

function renderSeason3RuleCard(title, description, entries) {
  const listMarkup = entries.length
    ? `<ul>${entries
        .map(
          (entry) => `
            <li>
              <span>${escapeHtml(entry.label)}</span>
              <strong>${escapeHtml(entry.value)}</strong>
            </li>
          `
        )
        .join("")}</ul>`
    : `<p>該当データなし</p>`;

  return `
    <article class="quick-card">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
      ${listMarkup}
    </article>
  `;
}

function renderFeatureBoard() {
  const objectiveKey = elements.s3Objective?.value || SEASON3.objectives[0]?.key || "pvp";
  const slotFocus = elements.s3SlotFocus?.value || "balanced";
  const objectiveLabel = S3_OBJECTIVE_MAP[objectiveKey]?.label ?? objectiveKey;
  const sortedHeroes = sortSeason3Heroes(objectiveKey, slotFocus);
  const topUpgrades = sortedHeroes.slice(0, 4);
  const objectiveConfig = S3_ROLE_BUCKETS[objectiveKey] ?? {};
  const objectiveWeights = buildWeightEntries(S3_OBJECTIVE_MAP[objectiveKey]?.weights).slice(0, 6);
  const unitWeights = buildWeightEntries(SEASON3.builderWeights?.unitWeights?.[objectiveKey]).slice(0, 6);
  const armyWeights = buildWeightEntries(SEASON3.builderWeights?.armyWeights?.[objectiveKey]).slice(0, 6);
  const penaltyEntries = buildPenaltyEntries(SEASON3.builderWeights?.penalties).slice(0, 5);
  const requiredRoleEntries = (objectiveConfig.required ?? []).map((rule) => ({
    label: seasonTagLabel(rule.tag),
    value: `${rule.minUnits}枠 / 重み ${formatRatioPercent(rule.weight)}`
  }));
  const preferredRoleEntries = (objectiveConfig.preferred ?? []).map((rule) => ({
    label: seasonTagLabel(rule.tag),
    value: `${rule.minUnits}枠 / 重み ${formatRatioPercent(rule.weight)}`
  }));
  const investmentEntries = Object.entries(SEASON3.builderWeights?.investmentTierMultipliers ?? {}).map(
    ([key, value]) => ({
      label: INVESTMENT_TIER_LABELS[key] ?? key,
      value: formatMultiplier(value)
    })
  );
  const availabilityEntries = [
    ...Object.entries(SEASON3.builderWeights?.lockMultipliers ?? {}).map(([key, value]) => ({
      label: LOCK_STATE_LABELS[key] ?? key,
      value: formatMultiplier(value)
    })),
    ...Object.entries(SEASON3.builderWeights?.equipmentMultipliers ?? {}).map(([key, value]) => ({
      label: EQUIPMENT_STATE_LABELS[key] ?? key,
      value: formatMultiplier(value)
    }))
  ];
  const popularSkills = [...preparedSkills]
    .sort((left, right) => {
      const rightSeason = right.season3 ? 1 : 0;
      const leftSeason = left.season3 ? 1 : 0;
      return (
        rightSeason - leftSeason ||
        right.holderCount - left.holderCount ||
        left.order - right.order ||
        left.name.localeCompare(right.name, "ja")
      );
    })
    .slice(0, 4);
  const objectiveCores = uniqueValues([objectiveKey, "pvp", "siege", "defense"])
    .map((objective) => buildSeason3ObjectiveCore(objective))
    .filter(Boolean);

  elements.s3HeroSeasonLabel.textContent = SEASON3.seasonLabel;
  elements.s3ThemeLabel.textContent = SEASON3.theme;
  elements.s3RevisionLabel.textContent = SEASON3.masterRevision;
  elements.s3ContextNotes.innerHTML = SEASON3.contextNotes
    .map((note) => `<li>${escapeHtml(note)}</li>`)
    .join("");

  elements.s3Summary.textContent = formatSummaryText(
    [
      `目的: ${objectiveLabel}`,
      `優先スロット: ${S3_SLOT_FOCUS_DEFS.find((item) => item.key === slotFocus)?.label ?? slotFocus}`,
      `Revision: ${SEASON3.masterRevision}`
    ],
    "Season 3 の注目候補を表示しています。"
  );
  elements.s3HeroCount.textContent = `${sortedHeroes.length}体`;
  elements.s3HeroList.innerHTML = renderCharacterCards(sortedHeroes, {
    showTags: true,
    showSeason3Info: true,
    showActions: true,
    showBattleArt: false,
    emptyMessage: "Season 3 注目武将データがありません。"
  });
  elements.s3UpgradeGrid.innerHTML = topUpgrades.length
    ? topUpgrades.map((character) => renderS3UpgradeCard(character, objectiveKey, slotFocus)).join("")
    : renderEmptyState("今週のおすすめ強化先はありません。");
  elements.s3SkillCount.textContent = `${season3FeaturedSkills.length}件`;
  elements.s3SkillList.innerHTML = renderSkillCards(
    season3FeaturedSkills,
    "Season 3 注目技能データがありません。"
  );
  elements.s3WeightGrid.innerHTML = [
    renderSeason3WeightCard(
      `${objectiveLabel}の戦闘軸`,
      "season3-objectives.json の用途別重みです。",
      objectiveWeights
    ),
    renderSeason3WeightCard(
      "部隊スコア軸",
      "season3-builder-weights.json の unitWeights を表示しています。",
      unitWeights
    ),
    renderSeason3WeightCard(
      "軍勢スコア軸",
      "season3-builder-weights.json の armyWeights を表示しています。",
      armyWeights
    ),
    renderSeason3WeightCard("主要減点", "自動編成で避ける失点要素です。", penaltyEntries)
  ].join("");
  elements.s3RoleRuleGrid.innerHTML = [
    renderSeason3RuleCard(
      "必須役割",
      `${objectiveLabel}で最低限そろえたい役割です。`,
      requiredRoleEntries
    ),
    renderSeason3RuleCard(
      "優先役割",
      "余裕があれば押さえたい補助役割です。",
      preferredRoleEntries
    ),
    renderSeason3RuleCard(
      "育成度補正",
      "簡易ロスター入力を内部倍率に変換します。",
      investmentEntries
    ),
    renderSeason3RuleCard(
      "制約 / 装備補正",
      "固定・除外・装備入力の扱いです。",
      availabilityEntries
    )
  ].join("");
  elements.s3PopularSkillList.innerHTML = renderSkillCards(
    popularSkills,
    "表示できる技能データがありません。"
  );
  elements.s3CoreGrid.innerHTML = objectiveCores.length
    ? objectiveCores.map((core) => renderSeason3CoreCard(core)).join("")
    : renderEmptyState("目的別コア提案データがありません。");
  elements.s3UpdateList.innerHTML = S3_UPDATES.length
    ? S3_UPDATES.map((update) => renderSeason3UpdateCard(update)).join("")
    : renderEmptyState("更新履歴データがありません。");

  elements.sourceLinkList.innerHTML = [
    ...Object.entries(SOURCES).map(([key, url]) => ({
      label: SOURCE_LABELS[key] ?? key,
      url
    })),
    ...SEASON3.sources
  ]
    .filter((row, index, list) => list.findIndex((item) => item.url === row.url) === index)
    .map(
      (row) =>
        `<a href="${escapeHtml(row.url)}" target="_blank" rel="noreferrer">${escapeHtml(row.label)}</a>`
    )
    .join("");

  elements.liveFeatureList.innerHTML = LIVE_FEATURES.map(
    (feature) => `
      <article class="module-card">
        <div class="module-card-head">
          <h3>${escapeHtml(feature.title)}</h3>
          <span class="status-pill ${escapeHtml(feature.statusClass)}">${escapeHtml(feature.status)}</span>
        </div>
        <p>${escapeHtml(feature.description)}</p>
        <div class="card-actions">
          <button type="button" class="mini-button" data-switch-view="${escapeHtml(feature.view)}">
            ${escapeHtml(feature.actionLabel)}
          </button>
        </div>
      </article>
    `
  ).join("");

  elements.plannedFeatureList.innerHTML = PLANNED_FEATURES.map(
    (feature) => `
      <article class="module-card">
        <div class="module-card-head">
          <h3>${escapeHtml(feature.title)}</h3>
          <span class="status-pill ${escapeHtml(feature.statusClass)}">${escapeHtml(feature.status)}</span>
        </div>
        <p>${escapeHtml(feature.description)}</p>
        <p>${escapeHtml(feature.need)}</p>
      </article>
    `
  ).join("");
}

function resetS3Board() {
  elements.s3Objective.value = SEASON3.objectives[0]?.key ?? "pvp";
  elements.s3SlotFocus.value = "balanced";
  renderFeatureBoard();
}

function openSkillDialog(skillName) {
  const skill = getSkillRecord(skillName);
  const conditionText = skill.conditions.length
    ? skill.conditions.map(conditionLabelFor).join(" / ")
    : "条件なし";

  elements.skillDialogTitle.textContent = skill.name;
  elements.skillDialogMeta.innerHTML = `
    <span class="dialog-tag">${escapeHtml(conditionText)}</span>
    ${skill.level ? `<span class="dialog-tag dialog-tag-muted">技能Lv ${skill.level}</span>` : ""}
  `;

  const summary = skill.summary || skill.initialEffect || "説明データはありません。";
  const initialEffect = skill.initialEffect || "";
  const maxEffect = skill.maxEffect || "";

  elements.skillDialogSummary.textContent = summary;
  elements.skillDialogSummaryBlock.hidden = !summary;
  elements.skillDialogInitial.textContent = initialEffect;
  elements.skillDialogInitialBlock.hidden = !initialEffect;
  elements.skillDialogMax.textContent = maxEffect;
  elements.skillDialogMaxBlock.hidden = !maxEffect;

  if (typeof elements.skillDialog.showModal === "function") {
    elements.skillDialog.showModal();
  } else {
    elements.skillDialog.setAttribute("open", "open");
  }
}

function closeSkillDialog() {
  if (typeof elements.skillDialog.close === "function") {
    elements.skillDialog.close();
  } else {
    elements.skillDialog.removeAttribute("open");
  }
}

function openCharacterDb(name) {
  elements.characterKeyword.value = name;
  setActiveView("character");
  renderCharacterDb();
}

function openSynergyWithReference(name) {
  elements.synergyCommander.value = name;
  setActiveView("synergy");
  renderSynergy();
}

function bindGlobalActions() {
  document.addEventListener("click", (event) => {
    const skillButton = event.target.closest("[data-skill-name]");
    if (skillButton) {
      openSkillDialog(skillButton.dataset.skillName);
      return;
    }

    const viewButton = event.target.closest("[data-switch-view]");
    if (viewButton) {
      setActiveView(viewButton.dataset.switchView);
      return;
    }

    const characterButton = event.target.closest("[data-open-character]");
    if (characterButton) {
      openCharacterDb(characterButton.dataset.openCharacter);
      return;
    }

    const synergyButton = event.target.closest("[data-use-synergy-reference]");
    if (synergyButton) {
      openSynergyWithReference(synergyButton.dataset.useSynergyReference);
    }
  });

  elements.skillDialogClose.addEventListener("click", closeSkillDialog);
  elements.skillDialog.addEventListener("click", (event) => {
    if (event.target === elements.skillDialog) {
      closeSkillDialog();
    }
  });
}

function bindViewTabs() {
  elements.viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveView(button.dataset.viewTab);
    });
  });

  window.addEventListener("hashchange", () => {
    const hashView = window.location.hash.replace(/^#/, "");
    setActiveView(hashView, { updateHash: false });
  });
}

function populateCounts() {
  const ssrCount = preparedCharacters.filter((character) => character.rarity === "SSR").length;
  const srCount = preparedCharacters.filter((character) => character.rarity === "SR").length;
  const sourceCount = [
    ...Object.values(SOURCES),
    ...SEASON3.sources.map((row) => row.url)
  ].filter((url, index, list) => list.indexOf(url) === index).length;

  elements.datasetCount.textContent = `${preparedCharacters.length}体`;
  elements.ssrCount.textContent = `${ssrCount}体`;
  elements.srCount.textContent = `${srCount}体`;
  elements.skillCount.textContent = `${preparedSkills.length}件`;
  elements.sourceCount.textContent = `${sourceCount}件`;
  elements.seasonLabel.textContent = SEASON3.seasonLabel;
  elements.seasonRevision.textContent = SEASON3.masterRevision;
  elements.seasonUpdatedAt.textContent = SEASON3.updatedAt;
}

function boot() {
  populateStatSelect(elements.primaryStat, "ステータスを選択");
  populateStatSelect(elements.secondaryStat, "なし");
  populateSimpleSelect(elements.characterSort, CHARACTER_SORT_DEFS, "rarityTenpu");
  populateSimpleSelect(elements.skillSort, SKILL_SORT_DEFS, "order");
  populateSimpleSelect(
    elements.s3Objective,
    SEASON3.objectives.map((objective) => ({ key: objective.key, label: objective.label })),
    SEASON3.objectives[0]?.key ?? "pvp"
  );
  populateSimpleSelect(elements.s3SlotFocus, S3_SLOT_FOCUS_DEFS, "balanced");

  renderCheckboxGroup(elements.rarityFilters, RARITY_DEFS, "power-rarity", defaultRarities);
  renderCheckboxGroup(elements.conditionFilters, CONDITION_DEFS, "power-condition", []);
  renderCheckboxGroup(elements.powerFeatureFilters, CHARACTER_FEATURE_DEFS, "power-feature", []);
  renderCheckboxGroup(elements.characterRarityFilters, RARITY_DEFS, "db-rarity", defaultRarities);
  renderCheckboxGroup(elements.characterTypeFilters, TYPE_DEFS, "db-type", defaultTypes);
  renderCheckboxGroup(elements.characterObjectiveFilters, OBJECTIVE_FILTER_DEFS, "db-objective", []);
  renderCheckboxGroup(elements.characterTagFilters, CHARACTER_TAG_DEFS, "db-tag", []);
  renderCheckboxGroup(elements.characterFeatureFilters, CHARACTER_FEATURE_DEFS, "db-feature", []);
  renderCheckboxGroup(elements.skillConditionFilters, CONDITION_DEFS, "skill-condition", []);
  renderCheckboxGroup(elements.skillEffectFilters, SKILL_EFFECT_DEFS, "skill-effect", []);
  renderCheckboxGroup(elements.synergyRarityFilters, RARITY_DEFS, "synergy-rarity", defaultRarities);
  renderCheckboxGroup(elements.synergyConditionFilters, CONDITION_DEFS, "synergy-condition", []);
  renderCheckboxGroup(elements.synergyFeatureFilters, CHARACTER_FEATURE_DEFS, "synergy-feature", []);

  populateCommanderDatalist();
  populateCounts();
  renderFeatureBoard();
  bindViewTabs();
  bindGlobalActions();

  elements.powerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renderPowerResults();
  });
  elements.powerForm.addEventListener("change", renderPowerResults);
  elements.chainCommander.addEventListener("input", renderPowerResults);
  elements.resetButton.addEventListener("click", resetPowerSearch);

  elements.characterKeyword.addEventListener("input", renderCharacterDb);
  elements.characterSort.addEventListener("change", renderCharacterDb);
  elements.characterView.addEventListener("change", renderCharacterDb);
  elements.characterResetButton.addEventListener("click", resetCharacterDb);

  elements.skillKeyword.addEventListener("input", renderSkillDb);
  elements.skillSort.addEventListener("change", renderSkillDb);
  elements.skillView.addEventListener("change", renderSkillDb);
  elements.skillResetButton.addEventListener("click", resetSkillDb);

  elements.synergyCommander.addEventListener("input", renderSynergy);
  elements.synergyKeyword.addEventListener("input", renderSynergy);
  elements.synergyView.addEventListener("change", renderSynergy);
  elements.synergyResetButton.addEventListener("click", resetSynergy);
  elements.s3Objective.addEventListener("change", renderFeatureBoard);
  elements.s3SlotFocus.addEventListener("change", renderFeatureBoard);
  elements.s3ResetButton.addEventListener("click", resetS3Board);

  renderPowerEmptyState();
  syncSecondaryOptions();
  renderCharacterDb();
  renderSkillDb();
  renderSynergy();
  renderFeatureBoard();

  const initialView = window.location.hash.replace(/^#/, "") || "power";
  setActiveView(initialView, { updateHash: false });
}

boot();
