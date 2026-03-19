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
        seasonLabel: "Season 3限定",
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

const VIEW_KEYS = ["power", "character", "skill", "synergy", "builder", "army", "board"];
const UI_STATE_STORAGE_KEY = "kh-site-ui-v1";
const HERO_RECENT_STORAGE_KEY = "kh-hero-recent-v1";
const FAVORITE_CHARACTERS_STORAGE_KEY = "kh-favorite-characters-v1";
const FAVORITE_SKILLS_STORAGE_KEY = "kh-favorite-skills-v1";
const SHARE_PARAM_KEY = "share";
const SHARE_PAYLOAD_VERSION = 1;
const BACKUP_VERSION = 1;
const BACKUP_FILE_PREFIX = "kingdom-hadou-backup";

const SHARE_VIEW_HINTS = {
  power: "戦力検索のステータス条件、連鎖基準、絞り込みをURLに入れて共有します。",
  character: "武将DBの全文検索、並び順、絞り込み、比較候補までURLに含めます。",
  skill: "技能DBの全文検索、並び順、絞り込みをURLに含めます。",
  synergy: "相性検索の基準武将、候補条件、特徴フィルタをURLに含めます。",
  builder: "編成ツールの陣形、主将・副将・補佐、秒数プレビューをURLに含めます。",
  army: "軍勢の軸武将、コンセプト、レア条件、手持ち情報までURLに含めます。長い場合は JSON 共有も使ってください。",
  board: "S3ハブの目的と優先スロットをURLに含めます。"
};

const VIEW_META = {
  power: { label: "戦力検索", shortLabel: "検索", summary: "上位2ステータス・技能条件・連鎖率から探す" },
  character: { label: "武将DB", shortLabel: "武将", summary: "武将名・技能・個性・特徴タグを横断検索する" },
  skill: { label: "技能DB", shortLabel: "技能", summary: "技能名・効果・所持武将から探す" },
  synergy: { label: "相性検索", shortLabel: "相性", summary: "主将基準の連鎖率と共通個性で並べる" },
  builder: { label: "編成ツールβ", shortLabel: "編成", summary: "1部隊の主将・副将・補佐・9x9盤面を確認する" },
  army: { label: "軍勢自動編成β", shortLabel: "軍勢", summary: "25体軍勢を自動提案する" },
  board: { label: "S3ハブ", shortLabel: "S3", summary: "S3の採点軸と注目候補を見る" }
};

const HERO_SHORTCUT_DEFS = [
  { key: "power-attack-defense", label: "攻撃→防御", hint: "戦力検索", description: "王騎型のような攻撃1位・防御2位をすぐ探します。" },
  { key: "power-war-strategy", label: "戦威→策略", hint: "戦力検索", description: "軍勢・補助寄りの並びをすぐ見ます。" },
  { key: "character-siege", label: "対物武将", hint: "武将DB", description: "対物タグを持つ武将に絞ります。" },
  { key: "skill-front", label: "前列技能", hint: "技能DB", description: "前列条件の技能だけを表示します。" },
  { key: "synergy-ouki", label: "王騎相性", hint: "相性検索", description: "王騎を主将にした副将候補を出します。" },
  { key: "army-siege", label: "対物軍勢", hint: "軍勢編成", description: "対物特化の軍勢コンセプトへ切り替えます。" }
];

const HERO_RESULT_TYPE_PRIORITY = {
  character: 5,
  skill: 4,
  synergy: 3,
  builder: 3,
  shortcut: 2,
  view: 1
};

const SLOT_LABEL_MAP = {
  commander: "主将",
  vice: "副将",
  aide: "補佐"
};

const SLOT_SUMMARY_HINTS = {
  commander: "戦法主導力と前線維持を重視",
  vice: "連鎖率と差し込み性能を重視",
  aide: "技能価値と支援量を重視"
};

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
  { key: "season3", label: "S3注目", hint: "S3初期データに含まれる技能" }
];

const CHARACTER_SORT_DEFS = [
  { key: "rarityTenpu", label: "レアリティ / 天賦順" },
  { key: "commanderFit", label: "主将適性順" },
  { key: "viceFit", label: "副将適性順" },
  { key: "aideFit", label: "補佐適性順" },
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

const ARMY_SEED_MODE_DEFS = [
  { key: "best", label: "最適枠で採用" },
  { key: "commander", label: "主将固定" },
  { key: "vice", label: "副将固定" },
  { key: "aide", label: "補佐固定" }
];

const ARMY_CONCEPT_DEFS = [
  {
    key: "balanced",
    label: "対人勝率",
    description: "前半20秒の噛み合い、継戦力、制圧力を均等に取りにいく対人の基準モードです。",
    primaryObjective: "pvp",
    objectiveMix: { pvp: 0.65, defense: 0.2, siege: 0.1, gathering: 0.05 },
    recommendedFormation: "基本陣参",
    formationReason: "5部隊の役割を崩さず、前半の支援と妨害を並べやすい陣形です。",
    rowTarget: { front: 2, middle: 2, back: 1 },
    commanderTypeBias: { 闘: 8, 護: 7, 妨: 7, 援: 4 },
    orderWeights: { 早い: 1, 普通: 0.82, 遅い: 0.64 },
    featureWeights: {
      弱化効果付与: 16,
      強化解除: 12,
      被ダメ軽減: 12,
      強化効果付与: 10,
      反撃: 9,
      回復: 8,
      攻速低下: 8,
      弱化解除: 7,
      会心: 6
    },
    tagWeights: {
      "role.frontline-anchor": 18,
      "role.burst-commander": 16,
      "role.disruptor": 16,
      "role.counter-enabler": 10,
      "def.damage-cut": 10,
      "control.buff-strip": 10
    },
    required: [
      { tag: "role.frontline-anchor", minUnits: 2, weight: 1 },
      { tag: "role.burst-commander", minUnits: 1, weight: 0.9 },
      { tag: "role.disruptor", minUnits: 1, weight: 0.9 }
    ],
    preferred: [
      { tag: "role.counter-enabler", minUnits: 1, weight: 0.6 },
      { tag: "support.cleanse", minUnits: 1, weight: 0.45 }
    ]
  },
  {
    key: "powermax",
    label: "現在戦力最大",
    description: "今の手持ちと実測戦力を優先し、現時点で最も高い総戦力を出しやすい軍勢を狙います。",
    primaryObjective: "pvp",
    objectiveMix: { pvp: 0.5, defense: 0.2, siege: 0.2, gathering: 0.1 },
    recommendedFormation: "基本陣参",
    formationReason: "列配分を大きく崩さず、高戦力主将を5部隊へ分散しやすい基準陣形です。",
    rowTarget: { front: 2, middle: 2, back: 1 },
    commanderTypeBias: { 闘: 9, 護: 8, 妨: 7, 援: 6 },
    orderWeights: { 早い: 1, 普通: 0.9, 遅い: 0.72 },
    featureWeights: {
      強化効果付与: 10,
      被ダメ軽減: 10,
      反撃: 9,
      弱化効果付与: 8,
      強化解除: 8,
      回復: 7,
      対物: 6,
      攻速上昇: 6
    },
    tagWeights: {
      "role.burst-commander": 18,
      "role.frontline-anchor": 14,
      "role.flex-support": 10,
      "role.disruptor": 8,
      "role.counter-enabler": 8
    },
    required: [
      { tag: "role.frontline-anchor", minUnits: 1, weight: 0.75 },
      { tag: "role.burst-commander", minUnits: 2, weight: 1 }
    ],
    preferred: [
      { tag: "role.flex-support", minUnits: 1, weight: 0.35 },
      { tag: "support.cleanse", minUnits: 1, weight: 0.25 }
    ]
  },
  {
    key: "siege",
    label: "攻城DPS",
    description: "対物、攻速、前半の火力支援を重ね、城や砦を削る速度を優先する軍勢です。",
    primaryObjective: "siege",
    objectiveMix: { siege: 0.78, pvp: 0.12, defense: 0.1, gathering: 0 },
    recommendedFormation: "錐行陣参",
    formationReason: "通常攻撃火力を押し上げやすく、対物主将を複数置いた時の削りが安定します。",
    rowTarget: { front: 2, middle: 2, back: 1 },
    commanderTypeBias: { 闘: 10, 援: 8, 護: 4, 妨: 2 },
    orderWeights: { 早い: 1, 普通: 0.86, 遅い: 0.58 },
    featureWeights: {
      対物: 22,
      攻速上昇: 12,
      強化効果付与: 10,
      被ダメ軽減: 6,
      反撃: 5,
      会心: 5,
      デバフ無効: 4
    },
    tagWeights: {
      "role.siege-breaker": 22,
      "siege.structure-damage-up": 18,
      "tempo.attack-speed-up": 12,
      "role.flex-support": 8,
      "def.debuff-immunity": 8
    },
    required: [
      { tag: "role.siege-breaker", minUnits: 2, weight: 1 },
      { tag: "siege.structure-damage-up", minUnits: 3, weight: 0.95 },
      { tag: "role.frontline-anchor", minUnits: 1, weight: 0.7 }
    ],
    preferred: [
      { tag: "tempo.attack-speed-up", minUnits: 2, weight: 0.6 },
      { tag: "role.flex-support", minUnits: 1, weight: 0.45 }
    ]
  },
  {
    key: "counter",
    label: "最大見込み戦力",
    description: "完成育成を前提に、潜在戦力が最も高くなる25体軍勢を優先するモードです。",
    primaryObjective: "pvp",
    objectiveMix: { pvp: 0.45, defense: 0.25, siege: 0.2, gathering: 0.1 },
    recommendedFormation: "基本陣参",
    formationReason: "育成完了後の主将性能と列適性を崩しにくく、潜在値を素直に積み上げやすい陣形です。",
    rowTarget: { front: 2, middle: 2, back: 1 },
    commanderTypeBias: { 闘: 9, 護: 8, 妨: 6, 援: 5 },
    orderWeights: { 早い: 0.94, 普通: 0.9, 遅い: 0.72 },
    featureWeights: {
      強化効果付与: 14,
      被ダメ軽減: 12,
      反撃: 10,
      回復: 9,
      弱化効果付与: 9,
      強化解除: 8,
      攻速上昇: 7,
      対物: 6
    },
    tagWeights: {
      "role.burst-commander": 18,
      "role.frontline-anchor": 16,
      "role.flex-support": 10,
      "role.disruptor": 8,
      "role.counter-enabler": 8
    },
    required: [
      { tag: "role.frontline-anchor", minUnits: 1, weight: 0.7 },
      { tag: "role.burst-commander", minUnits: 2, weight: 1 }
    ],
    preferred: [
      { tag: "role.flex-support", minUnits: 1, weight: 0.45 },
      { tag: "support.cleanse", minUnits: 1, weight: 0.35 }
    ]
  },
  {
    key: "debuff",
    label: "妨害先手",
    description: "恐怖、攻速低下、強化解除を前半20秒へ寄せ、相手のテンポを先に崩す軍勢です。",
    primaryObjective: "pvp",
    objectiveMix: { pvp: 0.75, defense: 0.15, siege: 0.1, gathering: 0 },
    recommendedFormation: "策謀陣参",
    formationReason: "策略を伸ばして妨害を通しやすくし、前半のテンポを握りやすい陣形です。",
    rowTarget: { front: 1, middle: 2, back: 2 },
    commanderTypeBias: { 妨: 12, 護: 6, 援: 4, 闘: 3 },
    orderWeights: { 早い: 1, 普通: 0.84, 遅い: 0.54 },
    featureWeights: {
      弱化効果付与: 22,
      攻速低下: 14,
      強化解除: 14,
      継続削り: 10,
      弱化解除: 6,
      被ダメ軽減: 4
    },
    tagWeights: {
      "role.disruptor": 20,
      "tempo.attack-speed-down": 16,
      "control.buff-strip": 14,
      "control.fear": 14,
      "control.dot": 10
    },
    required: [
      { tag: "role.disruptor", minUnits: 2, weight: 1 },
      { tag: "tempo.attack-speed-down", minUnits: 1, weight: 0.8 },
      { tag: "control.buff-strip", minUnits: 1, weight: 0.8 }
    ],
    preferred: [
      { tag: "control.fear", minUnits: 1, weight: 0.55 },
      { tag: "role.frontline-anchor", minUnits: 1, weight: 0.45 }
    ]
  },
  {
    key: "defense",
    label: "防衛安定",
    description: "前列維持、被ダメ軽減、回復、解除を積み、40秒以降まで崩れにくくします。",
    primaryObjective: "defense",
    objectiveMix: { defense: 0.75, pvp: 0.15, siege: 0.1, gathering: 0 },
    recommendedFormation: "鶴翼陣参",
    formationReason: "防御補正と列維持を取りやすく、防衛や受け寄りの軍勢に向いています。",
    rowTarget: { front: 2, middle: 2, back: 1 },
    commanderTypeBias: { 護: 12, 妨: 7, 援: 5, 闘: 4 },
    orderWeights: { 早い: 0.8, 普通: 1, 遅い: 0.82 },
    featureWeights: {
      被ダメ軽減: 20,
      回復: 16,
      堅固: 14,
      弱化解除: 12,
      デバフ無効: 12,
      反撃: 8,
      強化効果付与: 8
    },
    tagWeights: {
      "role.frontline-anchor": 20,
      "def.damage-cut": 18,
      "support.heal": 14,
      "support.cleanse": 12,
      "def.debuff-immunity": 10,
      "role.disruptor": 6
    },
    required: [
      { tag: "role.frontline-anchor", minUnits: 2, weight: 1 },
      { tag: "def.damage-cut", minUnits: 2, weight: 0.9 },
      { tag: "support.heal", minUnits: 1, weight: 0.75 }
    ],
    preferred: [
      { tag: "support.cleanse", minUnits: 1, weight: 0.55 },
      { tag: "def.debuff-immunity", minUnits: 1, weight: 0.45 }
    ]
  },
  {
    key: "growth",
    label: "育成効率",
    description: "今の育成段階と将来値の差を見て、育てた時の伸びと実戦投入しやすさを両立します。",
    primaryObjective: "pvp",
    objectiveMix: { pvp: 0.45, defense: 0.3, siege: 0.2, gathering: 0.05 },
    recommendedFormation: "基本陣参",
    formationReason: "完成前でも列条件が崩れにくく、投資先の価値が見えやすい基準陣形です。",
    rowTarget: { front: 2, middle: 2, back: 1 },
    commanderTypeBias: { 闘: 8, 護: 8, 妨: 6, 援: 5 },
    orderWeights: { 早い: 0.92, 普通: 0.88, 遅い: 0.74 },
    featureWeights: {
      強化効果付与: 12,
      被ダメ軽減: 12,
      回復: 10,
      弱化解除: 10,
      弱化効果付与: 8,
      反撃: 8,
      対物: 6
    },
    tagWeights: {
      "role.frontline-anchor": 16,
      "role.flex-support": 14,
      "role.burst-commander": 12,
      "support.cleanse": 10,
      "support.heal": 10
    },
    required: [
      { tag: "role.frontline-anchor", minUnits: 1, weight: 0.8 },
      { tag: "role.flex-support", minUnits: 1, weight: 0.75 }
    ],
    preferred: [
      { tag: "support.cleanse", minUnits: 1, weight: 0.55 },
      { tag: "role.disruptor", minUnits: 1, weight: 0.45 }
    ]
  },
  {
    key: "meta",
    label: "世間採用寄り",
    description: "公開編成や推奨枠を弱い事前分布として使い、今の手持ちに寄せて無理なく採用形へ近づけます。",
    primaryObjective: "pvp",
    objectiveMix: { pvp: 0.6, defense: 0.25, siege: 0.15, gathering: 0 },
    recommendedFormation: "基本陣参",
    formationReason: "公開編成との整合を取りつつ、汎用的に外しにくい配置へ寄せやすい陣形です。",
    rowTarget: { front: 2, middle: 2, back: 1 },
    commanderTypeBias: { 闘: 8, 護: 7, 妨: 7, 援: 5 },
    orderWeights: { 早い: 0.96, 普通: 0.84, 遅い: 0.68 },
    featureWeights: {
      弱化効果付与: 14,
      強化解除: 12,
      被ダメ軽減: 12,
      強化効果付与: 10,
      回復: 8,
      弱化解除: 8,
      会心: 6
    },
    tagWeights: {
      "role.frontline-anchor": 16,
      "role.burst-commander": 16,
      "role.disruptor": 14,
      "role.flex-support": 10,
      "support.cleanse": 8
    },
    required: [
      { tag: "role.frontline-anchor", minUnits: 2, weight: 0.95 },
      { tag: "role.burst-commander", minUnits: 1, weight: 0.85 },
      { tag: "role.disruptor", minUnits: 1, weight: 0.85 }
    ],
    preferred: [
      { tag: "support.cleanse", minUnits: 1, weight: 0.55 },
      { tag: "role.flex-support", minUnits: 1, weight: 0.45 }
    ]
  }
];

const BUILDER_SLOT_DEFS = [
  { key: "commander", label: "主将", tacticSlot: true, roleCondition: "main" },
  { key: "vice1", label: "副将1", tacticSlot: true, roleCondition: "vice" },
  { key: "vice2", label: "副将2", tacticSlot: true, roleCondition: "vice" },
  { key: "aide1", label: "補佐1", tacticSlot: false, roleCondition: "aide" },
  { key: "aide2", label: "補佐2", tacticSlot: false, roleCondition: "aide" }
];

const BUILDER_ROW_DEFS = [
  { key: "front", label: "前列" },
  { key: "middle", label: "中列" },
  { key: "back", label: "後列" }
];

const FORMATION_DEFS = [
  {
    key: "basic",
    label: "基本陣",
    shortLabel: "基本",
    description: "8秒刻みで一定に回る基準陣形です。バフと攻撃を交互に重ねやすく、扱いが安定します。",
    sourceSummary: "援タイプ3部隊以上で戦威+20%",
    sourceDate: "GameWith 2026年3月14日",
    timings: [20, 8, 8, 8, 8, 8],
    bonuses: [{ type: "援", minUnits: 3, stats: { war: 20 } }],
    slots: [
      { key: "first", label: "1st", rowKey: "middle", gridCol: 1, gridRow: 1 },
      { key: "second", label: "2nd", rowKey: "front", gridCol: 1, gridRow: 0 },
      { key: "third", label: "3rd", rowKey: "middle", gridCol: 0, gridRow: 1 },
      { key: "fourth", label: "4th", rowKey: "middle", gridCol: 2, gridRow: 1 },
      { key: "fifth", label: "5th", rowKey: "back", gridCol: 1, gridRow: 2 }
    ]
  },
  {
    key: "suikou",
    label: "錐行陣",
    shortLabel: "錐行",
    description: "高い攻撃補正と左から右へ流れるテンポが特徴で、通常攻撃や対物寄りの軍勢と相性が良い陣形です。",
    sourceSummary: "闘タイプ3部隊以上で攻撃+30%、援タイプ3部隊以上で攻撃+20%・戦威+10%",
    sourceDate: "GameWith 2026年3月14日",
    timings: [20, 8, 6, 8, 6, 10],
    bonuses: [
      { type: "闘", minUnits: 3, stats: { attack: 30 } },
      { type: "援", minUnits: 3, stats: { attack: 20, war: 10 } }
    ],
    slots: [
      { key: "first", label: "1st", rowKey: "front", gridCol: 1, gridRow: 0 },
      { key: "second", label: "2nd", rowKey: "middle", gridCol: 0, gridRow: 1 },
      { key: "third", label: "3rd", rowKey: "back", gridCol: 0, gridRow: 2 },
      { key: "fourth", label: "4th", rowKey: "middle", gridCol: 2, gridRow: 1 },
      { key: "fifth", label: "5th", rowKey: "back", gridCol: 2, gridRow: 2 }
    ]
  },
  {
    key: "kakuyoku",
    label: "鶴翼陣",
    shortLabel: "鶴翼",
    description: "前列から中列へ噛ませる形で防御を積みやすく、反撃や耐久寄りの軍勢と噛み合う陣形です。",
    sourceSummary: "闘タイプ3部隊以上で攻撃+10%・防御+30%、援タイプ3部隊以上で戦威+10%・防御+30%",
    sourceDate: "GameWith 2026年3月14日",
    timings: [20, 6, 8, 6, 10, 8],
    bonuses: [
      { type: "闘", minUnits: 3, stats: { attack: 10, defense: 30 } },
      { type: "援", minUnits: 3, stats: { war: 10, defense: 30 } }
    ],
    slots: [
      { key: "first", label: "1st", rowKey: "front", gridCol: 0, gridRow: 0 },
      { key: "second", label: "2nd", rowKey: "front", gridCol: 2, gridRow: 0 },
      { key: "third", label: "3rd", rowKey: "middle", gridCol: 0, gridRow: 1 },
      { key: "fourth", label: "4th", rowKey: "middle", gridCol: 2, gridRow: 1 },
      { key: "fifth", label: "5th", rowKey: "back", gridCol: 1, gridRow: 2 }
    ]
  },
  {
    key: "houjin",
    label: "方陣",
    shortLabel: "方陣",
    description: "戦法火力に寄せやすく、中央を守って後列や外周の火力へ繋げる運用に向く陣形です。",
    sourceSummary: "闘タイプ3部隊以上で攻撃+10%・戦威+20%",
    sourceDate: "GameWith 2026年3月14日",
    timings: [20, 8, 12, 8, 6, 6],
    bonuses: [{ type: "闘", minUnits: 3, stats: { attack: 10, war: 20 } }],
    slots: [
      { key: "first", label: "1st", rowKey: "front", gridCol: 0, gridRow: 0 },
      { key: "second", label: "2nd", rowKey: "front", gridCol: 2, gridRow: 0 },
      { key: "third", label: "3rd", rowKey: "back", gridCol: 2, gridRow: 2 },
      { key: "fourth", label: "4th", rowKey: "back", gridCol: 0, gridRow: 2 },
      { key: "fifth", label: "5th", rowKey: "middle", gridCol: 1, gridRow: 1 }
    ]
  },
  {
    key: "sakubou",
    label: "策謀陣",
    shortLabel: "策謀",
    description: "1st と 2nd がすぐ続くため、横列・縦列バフや弱化を重ねやすい妨害寄りの陣形です。",
    sourceSummary: "闘タイプ4部隊以上で攻撃+20%・策略+40%、援タイプ4部隊以上で戦威+20%・策略+40%",
    sourceDate: "GameWith 2026年3月14日",
    timings: [20, 6, 6, 8, 8, 8],
    bonuses: [
      { type: "闘", minUnits: 4, stats: { attack: 20, strategy: 40 } },
      { type: "援", minUnits: 4, stats: { war: 20, strategy: 40 } }
    ],
    slots: [
      { key: "first", label: "1st", rowKey: "middle", gridCol: 1, gridRow: 1 },
      { key: "second", label: "2nd", rowKey: "middle", gridCol: 2, gridRow: 1 },
      { key: "third", label: "3rd", rowKey: "back", gridCol: 2, gridRow: 2 },
      { key: "fourth", label: "4th", rowKey: "front", gridCol: 0, gridRow: 0 },
      { key: "fifth", label: "5th", rowKey: "front", gridCol: 1, gridRow: 0 }
    ]
  }
];

const FORMATION_MAP = Object.fromEntries(FORMATION_DEFS.map((formation) => [formation.key, formation]));
const FORMATION_SELECT_DEFS = FORMATION_DEFS.map((formation) => ({
  key: formation.key,
  label: formation.label
}));
const ARMY_FORMATION_SELECT_DEFS = [
  { key: "auto", label: "自動選択" },
  ...FORMATION_SELECT_DEFS
];
const FORMATION_SLOT_KEY_ORDER = ["first", "second", "third", "fourth", "fifth"];
const FORMATION_SLOT_LABELS = {
  first: "1st",
  second: "2nd",
  third: "3rd",
  fourth: "4th",
  fifth: "5th"
};

const TACTIC_ORDER_SCORES = {
  commander: { 早い: 1, 普通: 4, 遅い: 7 },
  vice1: { 早い: 2, 普通: 5, 遅い: 8 },
  vice2: { 早い: 3, 普通: 6, 遅い: 9 }
};

const TACTIC_TONE_PRIORITY = ["support", "damage", "debuff", "heal", "utility"];

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
  },
  {
    title: "編成ツールβ",
    status: "LIVE",
    statusClass: "is-live",
    description: "1部隊の主将・副将・補佐を置いて、連鎖順、技能条件、重複技能をまとめて確認する。",
    actionLabel: "編成ツールを開く",
    view: "builder"
  },
  {
    title: "軍勢自動編成β",
    status: "LIVE",
    statusClass: "is-live",
    description: "任意の武将と軍勢コンセプトを指定して、5部隊25体の候補を自動で組み上げる。",
    actionLabel: "軍勢自動編成を開く",
    view: "army"
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
    title: "手持ち入力対応AI編成",
    status: "PLAN",
    statusClass: "is-plan",
    description: "所持武将、育成段階、装備、固定枠まで反映して個人用の候補軍勢を提案する。",
    need: "必要: 手持ち入力、育成段階、装備DB、評価ルールの統合。"
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
const S3_TOOL_CATALOG = SEASON3.toolCatalog ?? [];
const S3_POWER_BUILDER_CONFIG = SEASON3.powerBuilderConfig ?? {};
const S3_ROLE_BUCKETS = SEASON3.roleBuckets?.objectives ?? {};
const S3_UPDATES = SEASON3.updates ?? [];
const ARMY_CONCEPT_MAP = Object.fromEntries(ARMY_CONCEPT_DEFS.map((concept) => [concept.key, concept]));
const BUILDER_SLOT_MAP = Object.fromEntries(BUILDER_SLOT_DEFS.map((slot) => [slot.key, slot]));
const BUILDER_ROW_MAP = Object.fromEntries(BUILDER_ROW_DEFS.map((row) => [row.key, row]));
const TACTIC_SLOT_DEFS = BUILDER_SLOT_DEFS.filter((slot) => slot.tacticSlot);

const defaultRarities = RARITY_DEFS.map((rarity) => rarity.key);
const defaultTypes = TYPE_DEFS.map((type) => type.key);

const ARMY_FEATURE_GROUP_WEIGHTS = {
  offense: {
    対物: 22,
    会心: 14,
    攻速上昇: 12,
    強化効果付与: 10,
    継続削り: 10,
    反撃: 8
  },
  defense: {
    被ダメ軽減: 20,
    堅固: 18,
    回復: 16,
    弱化解除: 14,
    デバフ無効: 12,
    反撃: 10,
    強化効果付与: 8
  },
  control: {
    弱化効果付与: 20,
    攻速低下: 16,
    強化解除: 16,
    継続削り: 12,
    弱化解除: 6,
    デバフ無効: 4
  },
  support: {
    強化効果付与: 18,
    回復: 16,
    弱化解除: 16,
    被ダメ軽減: 10,
    攻速上昇: 10,
    デバフ無効: 10,
    対物: 6
  }
};

const ARMY_ORDER_VALUE_MAP = {
  早い: 100,
  普通: 72,
  遅い: 48
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "");
}

function tokenizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\/・,、。．.=＝+＋()（）[\]【】]/gu, " ")
    .split(/\s+/u)
    .map((token) => normalizeSearchText(token))
    .filter(Boolean);
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

function formatDataRevisionLabel(value) {
  const revision = String(value ?? "").trim();
  return revision ? `データ版 ${revision}` : "データ版 -";
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

const VISUAL_BADGE_META = {
  stat: {
    attack: { short: "攻", tone: "attack" },
    defense: { short: "防", tone: "defense" },
    war: { short: "威", tone: "war" },
    strategy: { short: "策", tone: "strategy" }
  },
  type: {
    闘: { short: "闘", tone: "type-fight" },
    援: { short: "援", tone: "type-support" },
    護: { short: "護", tone: "type-guard" },
    妨: { short: "妨", tone: "type-disrupt" }
  },
  objective: {
    pvp: { short: "対", tone: "objective-pvp" },
    siege: { short: "城", tone: "objective-siege" },
    defense: { short: "守", tone: "objective-defense" },
    gathering: { short: "採", tone: "objective-gathering" }
  },
  feature: {
    対物: { short: "城", tone: "feature-siege" },
    弱化効果付与: { short: "弱", tone: "feature-debuff" },
    弱化解除: { short: "解", tone: "feature-cleanse" },
    強化効果付与: { short: "強", tone: "feature-buff" },
    強化解除: { short: "剥", tone: "feature-strip" },
    回復: { short: "癒", tone: "feature-heal" },
    被ダメ軽減: { short: "盾", tone: "feature-guard" },
    反撃: { short: "反", tone: "feature-counter" },
    攻速上昇: { short: "速", tone: "feature-speed" },
    攻速低下: { short: "遅", tone: "feature-slow" },
    継続削り: { short: "毒", tone: "feature-dot" },
    会心: { short: "会", tone: "feature-crit" },
    堅固: { short: "堅", tone: "feature-guard" },
    回避: { short: "避", tone: "feature-utility" },
    連鎖依存: { short: "鎖", tone: "feature-chain" },
    兵力条件: { short: "兵", tone: "feature-utility" },
    調達: { short: "採", tone: "feature-gather" },
    デバフ無効: { short: "免", tone: "feature-cleanse" }
  }
};

function getVisualBadgeMeta(kind, key, fallbackLabel = key) {
  const label = fallbackLabel || key || "";
  const defaults = {
    short: label ? String(label).trim().slice(0, 1) : "?",
    tone: "default"
  };
  return {
    ...defaults,
    ...(VISUAL_BADGE_META[kind]?.[key] ?? {})
  };
}

function renderVisualBadge(kind, key, label = key, options = {}) {
  const meta = getVisualBadgeMeta(kind, key, label);
  const classes = ["visual-badge", `tone-${meta.tone}`];
  if (options.compact) {
    classes.push("is-compact");
  }
  if (options.iconOnly) {
    classes.push("is-icon-only");
  }

  const title = options.title ?? label ?? key ?? "";
  return `
    <span class="${classes.join(" ")}" ${title ? `title="${escapeHtml(title)}"` : ""}>
      <span class="visual-badge-icon" aria-hidden="true">${escapeHtml(meta.short)}</span>
      ${options.iconOnly ? "" : `<span class="visual-badge-label">${escapeHtml(label ?? key ?? "")}</span>`}
    </span>
  `;
}

function tokenizeRawSearchTerms(query) {
  return uniqueValues(
    String(query ?? "")
      .split(/[\s\u3000,、/／]+/u)
      .map((token) => token.trim())
      .filter(Boolean)
  );
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

function deriveBattleArtMeta(character) {
  const effectLines = character.battleArtEffects ?? [];
  const text = collectTacticText(character);
  const tags = [];
  const allyScopes = [];
  const enemyScopes = [];
  const rowBoosts = [];

  if (/攻撃を\d+％上昇/u.test(text)) {
    tags.push("攻撃上昇");
  }
  if (/防御を\d+％上昇/u.test(text)) {
    tags.push("防御上昇");
  }
  if (/戦威を\d+％上昇/u.test(text)) {
    tags.push("戦威上昇");
  }
  if (/策略を\d+％上昇/u.test(text)) {
    tags.push("策略上昇");
  }
  if (/対物を\d+％上昇/u.test(text)) {
    tags.push("対物上昇");
  }
  if (/攻撃速度上昇/u.test(text)) {
    tags.push("攻速上昇");
  }
  if (/攻撃速度低下/u.test(text)) {
    tags.push("攻速低下", "弱化");
  }
  if (/会心/u.test(text)) {
    tags.push("会心");
  }
  if (/反撃/u.test(text)) {
    tags.push("反撃");
  }
  if (/堅固/u.test(text)) {
    tags.push("堅固");
  }
  if (/回復/u.test(text)) {
    tags.push("回復");
  }
  if (/(低下|恐怖|病毒)/u.test(text)) {
    tags.push("弱化");
  }
  if (/(解除|悠然|無効)/u.test(text)) {
    tags.push("解除・無効");
  }
  if (/(攻撃|戦威|対物)\d+％の攻撃/u.test(text)) {
    tags.push("ダメージ");
  }

  if (/前列にいる場合/u.test(text)) {
    rowBoosts.push("front");
  }
  if (/中列にいる場合/u.test(text)) {
    rowBoosts.push("middle");
  }
  if (/後列にいる場合/u.test(text)) {
    rowBoosts.push("back");
  }

  for (const line of effectLines) {
    if (/軍勢全体/u.test(line)) {
      allyScopes.push("軍勢全体");
    }
    if (/自部隊/u.test(line)) {
      allyScopes.push("自部隊");
    }
    if (/攻撃対象と同じ横列の部隊/u.test(line)) {
      enemyScopes.push("敵横列");
    }
    if (/攻撃対象と同じ縦列の部隊/u.test(line)) {
      enemyScopes.push("敵縦列");
    }
    if (!/攻撃対象/.test(line) && /同じ横列の部隊/u.test(line)) {
      allyScopes.push("味方横列");
    }
    if (!/攻撃対象/.test(line) && /同じ縦列の部隊/u.test(line)) {
      allyScopes.push("味方縦列");
    }
    if (/攻撃対象/u.test(line) && !/同じ(横列|縦列)の部隊/u.test(line)) {
      enemyScopes.push("単体");
    }
  }

  const toneChecks = {
    support: tags.some((tag) =>
      ["攻撃上昇", "防御上昇", "戦威上昇", "策略上昇", "対物上昇", "攻速上昇", "会心", "反撃", "堅固"].includes(tag)
    ),
    damage: tags.includes("ダメージ") || ["攻撃", "戦威", "対物"].includes(character.battleArtType),
    debuff: tags.some((tag) => ["弱化", "攻速低下"].includes(tag)),
    heal: tags.includes("回復"),
    utility: tags.includes("解除・無効")
  };
  const tone = TACTIC_TONE_PRIORITY.find((key) => toneChecks[key]) ?? "utility";

  return {
    type: character.battleArtType ?? "",
    chainOrder: character.battleArtChainOrder ?? "",
    tags: uniqueValues(tags),
    allyScopes: uniqueValues(allyScopes),
    enemyScopes: uniqueValues(enemyScopes),
    rowBoosts: uniqueValues(rowBoosts),
    tone
  };
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

function clampScore(value) {
  return Math.max(0, Math.min(99, Math.round(value)));
}

function deriveSlotFitProfile({
  character,
  season3,
  rankedStats,
  conditionIndex,
  featureTags,
  objectiveTags,
  guideSlot
}) {
  const topPair = rankedStats[0].value + rankedStats[1].value;
  const featureSet = new Set(featureTags);
  const commanderReasons = [];
  const viceReasons = [];
  const aideReasons = [];
  let commanderScore = 0;
  let viceScore = 0;
  let aideScore = 0;

  const pushReason = (target, text) => {
    if (text && !target.includes(text)) {
      target.push(text);
    }
  };

  if (season3) {
    commanderScore = season3.commanderScore;
    viceScore = season3.viceScore;
    aideScore = season3.aideScore;
    pushReason(commanderReasons, `S3主将評価 ${season3.commanderScore}点`);
    pushReason(viceReasons, `S3副将評価 ${season3.viceScore}点`);
    pushReason(aideReasons, `S3補佐評価 ${season3.aideScore}点`);
  } else {
    commanderScore =
      rankedStats[0].value * 0.06 +
      rankedStats[1].value * 0.032 +
      character.tenpu * 0.018 +
      character.chainBase * 36;
    viceScore =
      rankedStats[0].value * 0.031 +
      rankedStats[1].value * 0.029 +
      character.tenpu * 0.013 +
      character.chainBase * 44;
    aideScore =
      rankedStats[0].value * 0.014 +
      rankedStats[1].value * 0.018 +
      character.tenpu * 0.01 +
      character.chainBase * 32;
  }

  if (guideSlot === "主将" || (conditionIndex.main ?? []).length) {
    commanderScore += 14;
    pushReason(commanderReasons, "主将条件や編成例がある");
  }
  if (guideSlot === "副将" || (conditionIndex.vice ?? []).length) {
    viceScore += 14;
    pushReason(viceReasons, "副将条件や編成例がある");
  }
  if (guideSlot === "補佐" || (conditionIndex.aide ?? []).length) {
    aideScore += 16;
    pushReason(aideReasons, "補佐条件や編成例がある");
  }

  if (topPair >= 1580) {
    commanderScore += 10;
    pushReason(commanderReasons, "上位2値が高く主将で押しやすい");
  } else if (topPair >= 1480) {
    commanderScore += 6;
    pushReason(commanderReasons, "上位2値が安定して高い");
  }

  if (character.chainBase >= 0.24) {
    viceScore += 10;
    aideScore += 6;
    pushReason(viceReasons, "基礎連鎖率が高い");
    pushReason(aideReasons, "連鎖率を盛りやすい");
  } else if (character.chainBase >= 0.21) {
    viceScore += 6;
    pushReason(viceReasons, "連鎖率が平均より高い");
  }

  if (character.type === "闘") {
    commanderScore += 8;
    viceScore += 5;
    pushReason(commanderReasons, "闘タイプで主導力を出しやすい");
  }
  if (character.type === "護") {
    commanderScore += 7;
    viceScore += 4;
    pushReason(commanderReasons, "護タイプで前線維持に向く");
  }
  if (character.type === "妨") {
    viceScore += 8;
    commanderScore += 3;
    pushReason(viceReasons, "妨タイプで差し込みや妨害が強い");
  }
  if (character.type === "援") {
    aideScore += 12;
    viceScore += 3;
    pushReason(aideReasons, "援タイプで支援価値を出しやすい");
  }

  if (featureSet.has("回復") || featureSet.has("強化効果付与") || featureSet.has("弱化解除")) {
    aideScore += 10;
    pushReason(aideReasons, "支援技能の価値が高い");
  }
  if (featureSet.has("被ダメ軽減") || featureSet.has("反撃") || featureSet.has("堅固")) {
    commanderScore += 8;
    pushReason(commanderReasons, "前線維持に効く特徴がある");
  }
  if (
    featureSet.has("弱化効果付与") ||
    featureSet.has("強化解除") ||
    featureSet.has("攻速低下") ||
    featureSet.has("対物")
  ) {
    viceScore += 8;
    pushReason(viceReasons, "副将から効く差し込み性能がある");
  }
  if (featureSet.has("調達")) {
    aideScore += 5;
    pushReason(aideReasons, "任命や支援寄りの用途がある");
  }

  if (objectiveTags.includes("defense")) {
    commanderScore += 3;
    pushReason(commanderReasons, "防衛用途で主将価値を出しやすい");
  }
  if (objectiveTags.includes("siege")) {
    viceScore += 3;
    pushReason(viceReasons, "攻城用途で差し込み候補になりやすい");
  }

  const scores = {
    commander: clampScore(commanderScore),
    vice: clampScore(viceScore),
    aide: clampScore(aideScore)
  };
  const sorted = Object.entries(scores)
    .map(([key, score]) => ({
      key,
      score,
      label: SLOT_LABEL_MAP[key]
    }))
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label, "ja"));

  const reasons = {
    commander: commanderReasons.slice(0, 3),
    vice: viceReasons.slice(0, 3),
    aide: aideReasons.slice(0, 3)
  };

  if (!reasons[sorted[0].key].length) {
    pushReason(reasons[sorted[0].key], `${sorted[0].label}寄りの配分`);
  }

  return {
    scores,
    sorted,
    bestKey: sorted[0].key,
    secondaryKey: sorted[1].key,
    reasons,
    headline: `${sorted[0].label} → ${sorted[1].label}`
  };
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
  const battleArtMeta = deriveBattleArtMeta(character);
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
  const slotFit = deriveSlotFitProfile({
    character,
    season3,
    rankedStats,
    conditionIndex,
    featureTags,
    objectiveTags,
    guideSlot
  });

  const displayTags = uniqueValues([
    character.rarity,
    `天賦${character.tenpu}`,
    `${rankedStats[0].label}1位`,
    `${rankedStats[1].label}2位`,
    character.type ? `${character.type}タイプ` : "",
    guideSlot ? `${guideSlot}向き` : "",
    `${slotFit.sorted[0].label}適性高`,
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
      character.battleArtType ?? "",
      character.battleArtChainOrder ?? "",
      ...battleArtMeta.tags,
      ...battleArtMeta.allyScopes,
      ...battleArtMeta.enemyScopes,
      ...battleArtMeta.rowBoosts.map((rowKey) => BUILDER_ROW_MAP[rowKey]?.label ?? rowKey),
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
      slotFit.headline,
      ...Object.values(slotFit.reasons).flat(),
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
    battleArtMeta,
    featureTags,
    objectiveTags,
    displayTags,
    searchText,
    personalitySet: new Set(character.personalities),
    guide,
    guideSlot,
    slotFit,
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
  viewNav: document.querySelector(".view-nav"),
  statusToast: document.querySelector("#statusToast"),
  datasetCount: document.querySelector("#datasetCount"),
  ssrCount: document.querySelector("#ssrCount"),
  srCount: document.querySelector("#srCount"),
  skillCount: document.querySelector("#skillCount"),
  sourceCount: document.querySelector("#sourceCount"),
  seasonLabel: document.querySelector("#seasonLabel"),
  seasonRevision: document.querySelector("#seasonRevision"),
  seasonUpdatedAt: document.querySelector("#seasonUpdatedAt"),
  trustSnapshot: document.querySelector("#trustSnapshot"),
  shareScopeNote: document.querySelector("#shareScopeNote"),
  copyStateLinkButton: document.querySelector("#copyStateLinkButton"),
  downloadBackupButton: document.querySelector("#downloadBackupButton"),
  importBackupButton: document.querySelector("#importBackupButton"),
  backupImportInput: document.querySelector("#backupImportInput"),
  backupMeta: document.querySelector("#backupMeta"),
  clearBrowserDataButton: document.querySelector("#clearBrowserDataButton"),
  heroCommandInput: document.querySelector("#heroCommandInput"),
  heroCommandClear: document.querySelector("#heroCommandClear"),
  heroCommandSummary: document.querySelector("#heroCommandSummary"),
  heroCommandResults: document.querySelector("#heroCommandResults"),
  heroShortcutStrip: document.querySelector("#heroShortcutStrip"),
  mobileDock: document.querySelector("#mobileDock"),
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
  characterFavoriteToggle: document.querySelector("#characterFavoriteToggle"),
  characterSummary: document.querySelector("#characterSummary"),
  characterCompareCount: document.querySelector("#characterCompareCount"),
  characterCompareSummary: document.querySelector("#characterCompareSummary"),
  characterCompareList: document.querySelector("#characterCompareList"),
  characterCompareResetButton: document.querySelector("#characterCompareResetButton"),
  characterQuickGrid: document.querySelector("#characterQuickGrid"),
  characterCount: document.querySelector("#characterCount"),
  characterList: document.querySelector("#characterList"),

  skillView: document.querySelector("#view-skill"),
  skillKeyword: document.querySelector("#skillKeyword"),
  skillSort: document.querySelector("#skillSort"),
  skillConditionFilters: document.querySelector("#skillConditionFilters"),
  skillEffectFilters: document.querySelector("#skillEffectFilters"),
  skillResetButton: document.querySelector("#skillResetButton"),
  skillFavoriteToggle: document.querySelector("#skillFavoriteToggle"),
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

  builderView: document.querySelector("#view-builder"),
  builderFormation: document.querySelector("#builderFormation"),
  builderFormationSlot: document.querySelector("#builderFormationSlot"),
  builderTargetSlot: document.querySelector("#builderTargetSlot"),
  builderPreviewSecond: document.querySelector("#builderPreviewSecond"),
  builderPreviewSecondLabel: document.querySelector("#builderPreviewSecondLabel"),
  builderCommander: document.querySelector("#builderCommander"),
  builderVice1: document.querySelector("#builderVice1"),
  builderVice2: document.querySelector("#builderVice2"),
  builderAide1: document.querySelector("#builderAide1"),
  builderAide2: document.querySelector("#builderAide2"),
  builderVice1Enabled: document.querySelector("#builderVice1Enabled"),
  builderVice2Enabled: document.querySelector("#builderVice2Enabled"),
  builderLoadGuideButton: document.querySelector("#builderLoadGuideButton"),
  builderResetButton: document.querySelector("#builderResetButton"),
  builderSummary: document.querySelector("#builderSummary"),
  builderValidation: document.querySelector("#builderValidation"),
  builderTimelineCount: document.querySelector("#builderTimelineCount"),
  builderTimeline: document.querySelector("#builderTimeline"),
  builderBoardGrid: document.querySelector("#builderBoardGrid"),
  builderBoardLegend: document.querySelector("#builderBoardLegend"),
  builderActiveEffects: document.querySelector("#builderActiveEffects"),
  builderOverviewGrid: document.querySelector("#builderOverviewGrid"),
  builderSlotGrid: document.querySelector("#builderSlotGrid"),

  armyView: document.querySelector("#view-army"),
  armySeedCharacter: document.querySelector("#armySeedCharacter"),
  armySeedMode: document.querySelector("#armySeedMode"),
  armyConcept: document.querySelector("#armyConcept"),
  armyFormation: document.querySelector("#armyFormation"),
  armyFormationInfoGrid: document.querySelector("#armyFormationInfoGrid"),
  armyPowerMode: document.querySelector("#armyPowerMode"),
  armyPowerImportInput: document.querySelector("#armyPowerImportInput"),
  armyPowerImportButton: document.querySelector("#armyPowerImportButton"),
  armyPowerClearButton: document.querySelector("#armyPowerClearButton"),
  armyPowerImportSummaryGrid: document.querySelector("#armyPowerImportSummaryGrid"),
  armyRosterSearch: document.querySelector("#armyRosterSearch"),
  armyDefaultInvestment: document.querySelector("#armyDefaultInvestment"),
  armyDefaultEquipment: document.querySelector("#armyDefaultEquipment"),
  armyRosterSummaryGrid: document.querySelector("#armyRosterSummaryGrid"),
  armyRosterGrid: document.querySelector("#armyRosterGrid"),
  armyOwnedSettings: document.querySelector("#armyOwnedSettings"),
  armySelectAllSsrButton: document.querySelector("#armySelectAllSsrButton"),
  armySelectAllSrButton: document.querySelector("#armySelectAllSrButton"),
  armyClearRosterButton: document.querySelector("#armyClearRosterButton"),
  armyRarityFilters: document.querySelector("#armyRarityFilters"),
  armyBuildButton: document.querySelector("#armyBuildButton"),
  armyResetButton: document.querySelector("#armyResetButton"),
  armySummary: document.querySelector("#armySummary"),
  armyValidation: document.querySelector("#armyValidation"),
  armyTopCount: document.querySelector("#armyTopCount"),
  armyExportImageButton: document.querySelector("#armyExportImageButton"),
  armyShareImageButton: document.querySelector("#armyShareImageButton"),
  armyOverviewGrid: document.querySelector("#armyOverviewGrid"),
  armyAuditGrid: document.querySelector("#armyAuditGrid"),
  armyUnitGrid: document.querySelector("#armyUnitGrid"),
  armyCommanderGrid: document.querySelector("#armyCommanderGrid"),
  armyViceGrid: document.querySelector("#armyViceGrid"),
  armyAlternativeGrid: document.querySelector("#armyAlternativeGrid"),
  armySwapGrid: document.querySelector("#armySwapGrid"),
  armyReserveGrid: document.querySelector("#armyReserveGrid"),
  armyExcludedGrid: document.querySelector("#armyExcludedGrid"),

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

function readStoredJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStoredJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Ignore storage failures so the app stays usable in private mode.
  }
}

function getUiState() {
  return readStoredJson(UI_STATE_STORAGE_KEY, {});
}

function saveUiState(patch) {
  const nextState = {
    ...getUiState(),
    ...patch
  };
  writeStoredJson(UI_STATE_STORAGE_KEY, nextState);
  return nextState;
}

function getHeroRecentEntries() {
  return readStoredJson(HERO_RECENT_STORAGE_KEY, []).filter(
    (entry) => entry && entry.type && entry.value && entry.label
  );
}

function sortHeroEntries(left, right) {
  return (
    right.score - left.score ||
    (HERO_RESULT_TYPE_PRIORITY[right.type] ?? 0) - (HERO_RESULT_TYPE_PRIORITY[left.type] ?? 0) ||
    left.label.localeCompare(right.label, "ja")
  );
}

function pushHeroRecentEntry(entry) {
  const current = getHeroRecentEntries();
  const next = [
    entry,
    ...current.filter((item) => !(item.type === entry.type && item.value === entry.value))
  ].slice(0, 6);
  writeStoredJson(HERO_RECENT_STORAGE_KEY, next);
  renderHeroCommand();
  updateBackupMeta();
}

function getFavoriteCharacterNames() {
  return readStoredJson(FAVORITE_CHARACTERS_STORAGE_KEY, []).filter(Boolean);
}

function getFavoriteSkillNames() {
  return readStoredJson(FAVORITE_SKILLS_STORAGE_KEY, []).filter(Boolean);
}

function isFavoriteCharacter(name) {
  return getFavoriteCharacterNames().includes(name);
}

function isFavoriteSkill(name) {
  return getFavoriteSkillNames().includes(name);
}

function toggleFavoriteCharacter(name) {
  const current = new Set(getFavoriteCharacterNames());
  if (current.has(name)) {
    current.delete(name);
  } else {
    current.add(name);
  }
  writeStoredJson(FAVORITE_CHARACTERS_STORAGE_KEY, [...current].sort((left, right) => left.localeCompare(right, "ja")));
  updateBackupMeta();
}

function toggleFavoriteSkill(name) {
  const current = new Set(getFavoriteSkillNames());
  if (current.has(name)) {
    current.delete(name);
  } else {
    current.add(name);
  }
  writeStoredJson(FAVORITE_SKILLS_STORAGE_KEY, [...current].sort((left, right) => left.localeCompare(right, "ja")));
  updateBackupMeta();
}

function setToggleButtonState(button, active) {
  if (!button) {
    return;
  }

  button.dataset.active = active ? "true" : "false";
  button.classList.toggle("is-active", active);
  button.setAttribute("aria-pressed", active ? "true" : "false");
}

function getComparedCharacterNames() {
  return (getUiState().characterCompareNames ?? []).filter((name) => characterByName[name]);
}

function saveComparedCharacterNames(names) {
  saveUiState({
    characterCompareNames: uniqueValues(names).filter((name) => characterByName[name]).slice(0, 3)
  });
  updateBackupMeta();
}

function isComparedCharacter(name) {
  return getComparedCharacterNames().includes(name);
}

function toggleComparedCharacter(name) {
  const current = getComparedCharacterNames();
  if (current.includes(name)) {
    saveComparedCharacterNames(current.filter((item) => item !== name));
    return;
  }

  const next = [...current, name];
  saveComparedCharacterNames(next.slice(-3));
}

function clearComparedCharacters() {
  saveComparedCharacterNames([]);
}

function setCheckedValuesByName(name, values) {
  const wanted = new Set(values);
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = wanted.has(input.value);
  });
}

function getHeroDefaultEntries() {
  const recentEntries = getHeroRecentEntries().map((entry) => ({
    ...entry,
    meta: "最近使った項目",
    subtitle: entry.summary,
    score: 90
  }));
  const shortcutEntries = HERO_SHORTCUT_DEFS.slice(0, 4).map((entry, index) => ({
    type: "shortcut",
    value: entry.key,
    label: entry.label,
    meta: "おすすめショートカット",
    subtitle: `${entry.hint} / ${entry.description}`,
    score: 72 - index
  }));
  const featureEntries = LIVE_FEATURES.slice(0, 4).map((feature, index) => ({
    type: "view",
    value: feature.view,
    label: feature.title,
    meta: "画面",
    subtitle: feature.description,
    score: 60 - index
  }));

  return dedupeHeroEntries([...recentEntries, ...shortcutEntries, ...featureEntries]).slice(0, 8);
}

function dedupeHeroEntries(entries) {
  const seen = new Set();
  const uniqueEntries = [];

  for (const entry of entries) {
    const key = `${entry.type}:${entry.value}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    uniqueEntries.push(entry);
  }

  return uniqueEntries;
}

function scoreHeroSearchEntry(query, options) {
  const titles = options.titles?.length ? options.titles : [options.label];
  const normalizedTitles = titles.map(normalizeSearchText).filter(Boolean);
  const normalizedSearch = normalizeSearchText(options.searchText);
  const normalizedSubtitle = normalizeSearchText(options.subtitle ?? "");
  const weights = {
    exact: 840,
    prefix: 620,
    include: 420,
    search: 120,
    subtitle: 48,
    bonus: 0,
    ...options.weights
  };

  let score = weights.bonus;
  let titleMatched = false;

  for (const normalizedTitle of normalizedTitles) {
    if (!normalizedTitle) {
      continue;
    }

    if (normalizedTitle === query) {
      score = Math.max(score, weights.exact + weights.bonus);
      titleMatched = true;
      continue;
    }

    if (normalizedTitle.startsWith(query)) {
      score = Math.max(score, weights.prefix + weights.bonus);
      titleMatched = true;
      continue;
    }

    if (normalizedTitle.includes(query)) {
      score = Math.max(score, weights.include + weights.bonus);
      titleMatched = true;
    }
  }

  if (normalizedSearch.includes(query)) {
    score += titleMatched ? Math.round(weights.search * 0.35) : weights.search;
  }

  if (normalizedSubtitle.includes(query)) {
    score += weights.subtitle;
  }

  return score;
}

function buildHeroCharacterContextEntries(entry) {
  if (!entry || entry.score < 620) {
    return [];
  }

  return [
    {
      type: "synergy",
      value: entry.value,
      label: `${entry.label}の相性`,
      meta: "相性導線",
      subtitle: "主将に置いた連鎖率順へ移動",
      score: entry.score - 28
    },
    {
      type: "builder",
      value: `${entry.value}で編成ツール`,
      label: `${entry.label}で編成`,
      meta: "編成導線",
      subtitle: "編成ツールβで主将にセット",
      score: entry.score - 42
    }
  ];
}

function getHeroSearchEntries(query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return getHeroDefaultEntries();
  }

  const viewEntries = Object.entries(VIEW_META)
    .map(([viewKey, meta]) => {
      const subtitle = meta.summary;
      return {
        type: "view",
        value: viewKey,
        label: meta.label,
        meta: "画面",
        subtitle,
        score: scoreHeroSearchEntry(normalizedQuery, {
          label: meta.label,
          titles: [meta.label, meta.shortLabel],
          searchText: `${meta.label} ${meta.shortLabel}`,
          subtitle,
          weights: {
            exact: 260,
            prefix: 210,
            include: 170,
            search: 40,
            subtitle: 24,
            bonus: 0
          }
        })
      };
    })
    .filter((entry) => entry.score > 0);

  const characterEntries = preparedCharacters
    .map((character) => {
      const subtitle = `${character.rarity} / ${character.type} / ${
        character.featureTags.slice(0, 3).join(" / ") || "主要タグなし"
      }`;
      return {
        type: "character",
        value: character.name,
        label: character.name,
        meta: "武将",
        subtitle,
        score: scoreHeroSearchEntry(normalizedQuery, {
          label: character.name,
          searchText: character.searchText,
          subtitle,
          weights: {
            exact: 980,
            prefix: 780,
            include: 560,
            search: 136,
            subtitle: 32,
            bonus: 10
          }
        })
      };
    })
    .filter((entry) => entry.score > 0)
    .sort(sortHeroEntries)
    .slice(0, 5);

  const skillEntries = preparedSkills
    .map((skill) => {
      const subtitle = `${skill.conditions.map(conditionLabelFor).join(" / ") || "条件なし"} / 所持 ${
        skill.holderCount
      }体`;
      return {
        type: "skill",
        value: skill.name,
        label: skill.name,
        meta: "技能",
        subtitle,
        score: scoreHeroSearchEntry(normalizedQuery, {
          label: skill.name,
          searchText: skill.searchText,
          subtitle,
          weights: {
            exact: 920,
            prefix: 720,
            include: 520,
            search: 124,
            subtitle: 28,
            bonus: 6
          }
        })
      };
    })
    .filter((entry) => entry.score > 0)
    .sort(sortHeroEntries)
    .slice(0, 5);

  const shortcutEntries = HERO_SHORTCUT_DEFS.map((entry) => {
    const subtitle = `${entry.hint} / ${entry.description}`;
    return {
      type: "shortcut",
      value: entry.key,
      label: entry.label,
      meta: "ショートカット",
      subtitle,
      score: scoreHeroSearchEntry(normalizedQuery, {
        label: entry.label,
        searchText: `${entry.label} ${entry.hint} ${entry.description}`,
        subtitle,
        weights: {
          exact: 640,
          prefix: 500,
          include: 360,
          search: 90,
          subtitle: 36,
          bonus: 4
        }
      })
    };
  })
    .filter((entry) => entry.score > 0)
    .sort(sortHeroEntries)
    .slice(0, 4);

  const contextEntries = buildHeroCharacterContextEntries(characterEntries[0]);

  return dedupeHeroEntries([
    ...characterEntries,
    ...skillEntries,
    ...shortcutEntries,
    ...contextEntries,
    ...viewEntries
  ])
    .sort(sortHeroEntries)
    .slice(0, 8);
}

function collectHeroResultCounts(entries) {
  return entries.reduce((counts, entry) => {
    counts[entry.type] = (counts[entry.type] ?? 0) + 1;
    return counts;
  }, {});
}

function formatHeroResultSummary(query, entries) {
  if (!query) {
    const recentCount = entries.filter((entry) => entry.meta === "最近使った項目").length;
    return recentCount
      ? `最近使った項目 ${recentCount} 件と、すぐ使う導線を表示しています。`
      : "よく使う導線を先頭に表示しています。武将名や技能名を打つと直接移動できます。";
  }

  if (!entries.length) {
    return `「${query}」に一致する武将・技能・画面は見つかりませんでした。`;
  }

  const counts = collectHeroResultCounts(entries);
  const parts = [];

  if (counts.character) {
    parts.push(`武将 ${counts.character}`);
  }
  if (counts.skill) {
    parts.push(`技能 ${counts.skill}`);
  }
  if (counts.shortcut || counts.synergy || counts.builder) {
    parts.push(`導線 ${(counts.shortcut ?? 0) + (counts.synergy ?? 0) + (counts.builder ?? 0)}`);
  }
  if (counts.view) {
    parts.push(`画面 ${counts.view}`);
  }

  return `「${query}」の候補 ${entries.length} 件: ${parts.join(" / ")}`;
}

function highlightHeroText(text, query) {
  const sourceText = String(text ?? "");
  const tokens = tokenizeRawSearchTerms(query);

  if (!tokens.length) {
    return escapeHtml(sourceText);
  }

  const matcher = new RegExp(
    `(${tokens
      .slice()
      .sort((left, right) => right.length - left.length)
      .map((token) => escapeRegExp(token))
      .join("|")})`,
    "ig"
  );
  const parts = sourceText.split(matcher).filter((part) => part.length > 0);

  if (parts.length <= 1) {
    return escapeHtml(sourceText);
  }

  return parts
    .map((part) =>
      tokens.some((token) => part.toLowerCase() === token.toLowerCase())
        ? `<mark class="hero-highlight">${escapeHtml(part)}</mark>`
        : escapeHtml(part)
    )
    .join("");
}

function renderHeroCommand() {
  if (!elements.heroCommandResults) {
    return;
  }

  const query = elements.heroCommandInput?.value.trim() ?? "";
  const entries = getHeroSearchEntries(query);

  if (elements.heroCommandSummary) {
    elements.heroCommandSummary.textContent = formatHeroResultSummary(query, entries);
  }

  elements.heroCommandResults.innerHTML = entries.length
    ? entries
        .map(
          (entry) => `
            <button
              class="hero-result-card"
              type="button"
              data-hero-kind="${escapeHtml(entry.type)}"
              data-hero-action="${escapeHtml(entry.type)}"
              data-hero-value="${escapeHtml(entry.value)}"
            >
              <span class="hero-result-meta">${escapeHtml(entry.meta)}</span>
              <strong>${highlightHeroText(entry.label, query)}</strong>
              <small>${highlightHeroText(entry.subtitle || "該当データへ移動します。", query)}</small>
            </button>
          `
        )
        .join("")
    : `
        <article class="hero-result-card" data-hero-kind="empty">
          <span class="hero-result-meta">検索結果</span>
          <strong>該当なし</strong>
          <small>武将名、技能名、画面名、または対物・前列のような条件で検索してください。</small>
        </article>
      `;
}

function renderHeroShortcutStrip() {
  if (!elements.heroShortcutStrip) {
    return;
  }

  elements.heroShortcutStrip.innerHTML = HERO_SHORTCUT_DEFS.map(
    (entry) => `
      <button class="hero-shortcut-chip" type="button" data-hero-shortcut="${escapeHtml(entry.key)}">
        <strong>${escapeHtml(entry.label)}</strong>
        <small>${escapeHtml(`${entry.hint} | ${entry.description}`)}</small>
      </button>
    `
  ).join("");
}

function applyHeroShortcut(shortcutKey) {
  switch (shortcutKey) {
    case "power-attack-defense":
      resetPowerSearch();
      elements.primaryStat.value = "attack";
      elements.secondaryStat.value = "defense";
      setActiveView("power", { scrollToNav: true });
      renderPowerResults();
      break;
    case "power-war-strategy":
      resetPowerSearch();
      elements.primaryStat.value = "war";
      elements.secondaryStat.value = "strategy";
      setActiveView("power", { scrollToNav: true });
      renderPowerResults();
      break;
    case "character-siege":
      resetCharacterDb();
      setCheckedValuesByName("db-feature", ["対物"]);
      setActiveView("character", { scrollToNav: true });
      renderCharacterDb();
      break;
    case "skill-front":
      resetSkillDb();
      setCheckedValuesByName("skill-condition", ["front"]);
      setActiveView("skill", { scrollToNav: true });
      renderSkillDb();
      break;
    case "synergy-ouki":
      elements.synergyCommander.value = "王騎";
      setActiveView("synergy", { scrollToNav: true });
      renderSynergy();
      break;
    case "army-siege":
      if (elements.armyConcept) {
        elements.armyConcept.value = "siege";
      }
      setActiveView("army", { scrollToNav: true });
      if (typeof renderArmyPlanner === "function") {
        renderArmyPlanner();
      }
      break;
    default:
      return;
  }

  const shortcut = HERO_SHORTCUT_DEFS.find((entry) => entry.key === shortcutKey);
  if (shortcut) {
    pushHeroRecentEntry({
      type: "shortcut",
      value: shortcut.key,
      label: shortcut.label,
      summary: `${shortcut.hint}を即時適用`
    });
  }
}

function focusHeroCommandInput() {
  if (!elements.heroCommandInput) {
    return;
  }

  elements.heroCommandInput.focus();
  elements.heroCommandInput.select();
}

function bindHeroCommand() {
  if (!elements.heroCommandInput) {
    return;
  }

  renderHeroShortcutStrip();
  renderHeroCommand();

  elements.heroCommandInput.addEventListener("input", renderHeroCommand);
  elements.heroCommandInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    const firstEntry = getHeroSearchEntries(elements.heroCommandInput.value.trim())[0];
    if (!firstEntry) {
      return;
    }

    event.preventDefault();
    runHeroAction(firstEntry.type, firstEntry.value);
  });
  elements.heroCommandClear?.addEventListener("click", () => {
    elements.heroCommandInput.value = "";
    renderHeroCommand();
    focusHeroCommandInput();
  });

  document.addEventListener("keydown", (event) => {
    const activeTag = document.activeElement?.tagName;
    const isTypingField = activeTag === "INPUT" || activeTag === "TEXTAREA" || document.activeElement?.isContentEditable;

    if ((event.key === "/" && !isTypingField) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) {
      event.preventDefault();
      focusHeroCommandInput();
      return;
    }

    if (event.key === "Escape" && document.activeElement === elements.heroCommandInput) {
      elements.heroCommandInput.value = "";
      renderHeroCommand();
    }
  });
}

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

function populateCharacterSelect(select, placeholder) {
  if (!select) {
    return;
  }

  const options = [`<option value="">${placeholder}</option>`].concat(
    preparedCharacters.map(
      (character) =>
        `<option value="${escapeHtml(character.name)}">${escapeHtml(character.rarity)} / ${escapeHtml(
          character.name
        )} / ${escapeHtml(character.type || "-")} / 天賦 ${character.tenpu}</option>`
    )
  );

  select.innerHTML = options.join("");
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
  const tokens = tokenizeSearchText(needle);
  return !tokens.length || tokens.every((token) => haystack.includes(token));
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
  const scrollToNav = options.scrollToNav === true;

  elements.viewButtons.forEach((button) => {
    const isActive = button.dataset.viewTab === nextView;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });

  elements.viewPanels.forEach((panel) => {
    panel.hidden = panel.id !== `view-${nextView}`;
  });

  saveUiState({ activeView: nextView });
  updateShareScopeNote(nextView);

  if (updateHash) {
    const nextHash = `#${nextView}`;
    if (window.location.hash !== nextHash) {
      history.replaceState(null, "", nextHash);
    }
  }

  if (scrollToNav && elements.viewNav) {
    const navTop = elements.viewNav.getBoundingClientRect().top + window.scrollY - 12;
    window.scrollTo({
      top: Math.max(0, navTop),
      behavior: "smooth"
    });
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

    if (sortKey === "commanderFit" || sortKey === "viceFit" || sortKey === "aideFit") {
      const slotKey = sortKey.replace(/Fit$/u, "");
      const slotDiff = right.slotFit.scores[slotKey] - left.slotFit.scores[slotKey];
      return slotDiff || compareCharactersBase(left, right);
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

function renderDisclosure(summaryLabel, bodyMarkup, extraClass = "") {
  const body = String(bodyMarkup ?? "").trim();
  if (!body) {
    return "";
  }

  return `
    <details class="card-disclosure ${escapeHtml(extraClass)}">
      <summary>
        <span>${escapeHtml(summaryLabel)}</span>
      </summary>
      <div class="details-body">
        ${body}
      </div>
    </details>
  `;
}

function renderBattleArtPreview(character) {
  if (!character.battleArtName && !(character.battleArtEffects ?? []).length) {
    return "";
  }

  const previewText = character.battleArtEffects?.[0] ?? "戦法効果は詳細を開いて確認できます。";
  const chips = [
    character.battleArtMeta?.type ? `系統 ${character.battleArtMeta.type}` : "",
    character.battleArtMeta?.chainOrder ? `連鎖順 ${character.battleArtMeta.chainOrder}` : ""
  ].filter(Boolean);

  return `
    <div class="inline-summary">
      <div class="inline-summary-head">
        <p class="skill-group-title">戦法サマリー</p>
        <h4>${escapeHtml(character.battleArtName || "戦法名なし")}</h4>
      </div>
      ${chips.length ? `<div class="meta-chip-list">${chips.map((chip) => `<span class="meta-chip">${escapeHtml(chip)}</span>`).join("")}</div>` : ""}
      <p>${escapeHtml(previewText)}</p>
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
            const hint = featureHintFor(feature);
            return highlightedSet.has(feature)
              ? renderVisualBadge("feature", feature, feature, { title: hint || feature })
                  .replace('class="visual-badge ', 'class="visual-badge is-highlight ')
              : renderVisualBadge("feature", feature, feature, { title: hint || feature });
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

  const battleArtMetaChips = [
    character.battleArtMeta?.type ? `<span class="meta-chip">系統 ${escapeHtml(character.battleArtMeta.type)}</span>` : "",
    character.battleArtMeta?.chainOrder
      ? `<span class="meta-chip">連鎖順 ${escapeHtml(character.battleArtMeta.chainOrder)}</span>`
      : ""
  ]
    .filter(Boolean)
    .join("");

  return `
    <div class="battle-art-box">
      <p class="skill-group-title">戦法</p>
      <h4>${escapeHtml(character.battleArtName || "戦法名なし")}</h4>
      ${battleArtMetaChips ? `<div class="meta-chip-list">${battleArtMetaChips}</div>` : ""}
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
      <p class="season-pill">${escapeHtml(SEASON3.seasonLabel)} / ${escapeHtml(formatDataRevisionLabel(season3.masterRevision))} / ${escapeHtml(
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
      <p class="season-pill">${escapeHtml(SEASON3.seasonLabel)} / ${escapeHtml(formatDataRevisionLabel(season3.masterRevision))} / ${escapeHtml(
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
        <dt>${renderVisualBadge("stat", stat.key, stat.label, { compact: true })}</dt>
        <dd>${character[stat.key]}</dd>
      </div>
    `;
  }).join("");
}

function buildHighlightedSearchEvidence(items, query) {
  if (!String(query ?? "").trim()) {
    return [];
  }

  return items
    .map((item) => ({
      label: item.label,
      text: item.text,
      markup: highlightHeroText(item.text, query)
    }))
    .filter((item) => item.markup && item.markup !== escapeHtml(String(item.text ?? "")))
    .slice(0, 3);
}

function renderSearchEvidenceRows(rows = []) {
  if (!rows.length) {
    return "";
  }

  return `
    <div class="search-evidence-box">
      <p class="skill-group-title">検索ヒット箇所</p>
      <div class="search-evidence-list">
        ${rows
          .map(
            (row) => `
              <div class="search-evidence-row">
                <span class="search-evidence-label">${escapeHtml(row.label)}</span>
                <span class="search-evidence-text">${row.markup}</span>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function getCharacterSearchEvidence(character, query) {
  return buildHighlightedSearchEvidence(
    [
      { label: "武将名", text: character.name },
      { label: "戦法", text: [character.battleArtName, ...(character.battleArtEffects ?? [])].filter(Boolean).join(" / ") },
      { label: "特徴", text: character.featureTags.join(" / ") },
      { label: "個性", text: character.personalities.join(" / ") },
      ...character.skillRecords.map((skill) => ({
        label: `技能 ${skill.name}`,
        text: [skill.name, skill.summary, skill.initialEffect, skill.maxEffect].filter(Boolean).join(" / ")
      }))
    ],
    query
  );
}

function getSkillSearchEvidence(skill, query) {
  return buildHighlightedSearchEvidence(
    [
      { label: "技能名", text: skill.name },
      { label: "概要", text: skill.summary || "" },
      { label: "初期効果", text: skill.initialEffect || "" },
      { label: "最大効果", text: skill.maxEffect || "" },
      { label: "所持武将", text: skill.holders.map((holder) => holder.name).join(" / ") }
    ],
    query
  );
}

function renderFavoriteButton(kind, name) {
  const active = kind === "character" ? isFavoriteCharacter(name) : isFavoriteSkill(name);
  const label = active ? "保存中" : "保存";
  return `
    <button
      type="button"
      class="favorite-button ${active ? "is-active" : ""}"
      data-toggle-favorite-kind="${escapeHtml(kind)}"
      data-toggle-favorite-value="${escapeHtml(name)}"
      aria-pressed="${active ? "true" : "false"}"
      title="${escapeHtml(name)}をお気に入り${active ? "解除" : "保存"}"
    >
      <span aria-hidden="true">${active ? "★" : "☆"}</span>
      <span>${label}</span>
    </button>
  `;
}

function renderCompareButton(name) {
  const active = isComparedCharacter(name);
  return `
    <button
      type="button"
      class="mini-button ${active ? "is-toned" : ""}"
      data-toggle-compare-character="${escapeHtml(name)}"
      aria-pressed="${active ? "true" : "false"}"
    >
      ${active ? "比較から外す" : "比較に追加"}
    </button>
  `;
}

function renderSlotFitSummary(character) {
  const scoreMarkup = character.slotFit.sorted
    .map(
      (entry, index) => `
        <span class="meta-chip ${index === 0 ? "is-highlight" : ""}">
          ${escapeHtml(entry.label)} ${entry.score}
        </span>
      `
    )
    .join("");
  const reasonText =
    character.slotFit.reasons[character.slotFit.bestKey].join(" / ") || SLOT_SUMMARY_HINTS[character.slotFit.bestKey];

  return `
    <div class="inline-summary slot-fit-summary">
      <div class="inline-summary-head">
        <p class="skill-group-title">スロット適性</p>
        <h4>${escapeHtml(character.slotFit.headline)}</h4>
      </div>
      <div class="meta-chip-list">${scoreMarkup}</div>
      <p>${escapeHtml(reasonText)}</p>
    </div>
  `;
}

function renderCardActions(character) {
  return `
    <div class="card-actions">
      ${renderFavoriteButton("character", character.name)}
      ${renderCompareButton(character.name)}
      <button
        type="button"
        class="mini-button"
        data-use-builder-commander="${escapeHtml(character.name)}"
      >
        この武将を主将に編成する
      </button>
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
  const searchKeyword = options.searchKeyword ?? "";
  const showTags = options.showTags ?? false;
  const showPersonalities = options.showPersonalities ?? false;
  const showActions = options.showActions ?? true;
  const showSeason3Info = options.showSeason3Info ?? false;
  const showBattleArt = options.showBattleArt ?? true;
  const showGuideInsights = options.showGuideInsights ?? false;
  const searchEvidenceMarkup = renderSearchEvidenceRows(getCharacterSearchEvidence(character, searchKeyword));
  const detailsMarkup = renderDisclosure(
    "詳細を開く",
    [
      showBattleArt ? renderBattleArtBlock(character) : "",
      showGuideInsights ? renderGuideInsightsBlock(character) : "",
      showSeason3Info ? renderSeason3HeroBlock(character) : "",
      showTags ? renderDisplayTags(character, highlightedTags) : "",
      renderSkillChips(character, selectedConditionKeys),
      showPersonalities ? renderPersonalityGroup(character, chainStats) : ""
    ].join(""),
    "character-disclosure"
  );

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
              <h3>${highlightHeroText(character.name, searchKeyword)}</h3>
              <p class="subline">${escapeHtml(character.rarity)} / 天賦 ${character.tenpu} / 基礎連鎖率 ${escapeHtml(formatPercent(character.chainBase * 100))}</p>
              <div class="meta-chip-list card-meta-strip">
                ${renderVisualBadge("type", character.type || "-", `${character.type || "-"}タイプ`, {
                  title: `${character.type || "-"}タイプ`
                })}
                <span class="meta-chip">主将 ${character.slotFit.scores.commander}</span>
                <span class="meta-chip">副将 ${character.slotFit.scores.vice}</span>
                <span class="meta-chip">補佐 ${character.slotFit.scores.aide}</span>
              </div>
            </div>
            <a class="source-link" href="${escapeHtml(character.sourceUrl)}" target="_blank" rel="noreferrer">GameWith</a>
          </div>
          <div class="top-pair">
            <span class="pair-badge rank-1">1位: ${escapeHtml(character.top1.label)} ${character.top1.value}</span>
            <span class="pair-badge rank-2">2位: ${escapeHtml(character.top2.label)} ${character.top2.value}</span>
          </div>
          ${renderSlotFitSummary(character)}
          ${showBattleArt ? renderBattleArtPreview(character) : ""}
          ${renderFeatureTags(character, highlightedTags)}
          ${searchEvidenceMarkup}
          ${renderChainInfo(chainStats)}
          ${showActions ? renderCardActions(character) : ""}
          <dl class="stats-grid">
            ${renderStatsGrid(character, selectedStats)}
          </dl>
          ${detailsMarkup}
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

function renderSkillCard(skill, options = {}) {
  const searchKeyword = options.searchKeyword ?? "";
  const conditionMarkup = skill.conditionLabels.length
    ? skill.conditionLabels.map((label) => `<span class="meta-chip">${escapeHtml(label)}</span>`).join("")
    : `<span class="meta-chip">条件なし</span>`;
  const featureMarkup = skill.featureTags.length
    ? skill.featureTags
        .map((feature) => renderVisualBadge("feature", feature, SKILL_EFFECT_MAP[feature] ?? feature))
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
            ${highlightHeroText(skill.name, searchKeyword)}
          </button>
          <p class="subline">所持武将 ${skill.holderCount}体 / 技能Lv ${skill.level || 0}</p>
        </div>
        <div>
          ${renderFavoriteButton("skill", skill.name)}
          <div class="meta-chip-list">${conditionMarkup}${featureMarkup}</div>
        </div>
      </div>
      <p class="skill-summary">${highlightHeroText(skill.summary || "概要データはありません。", searchKeyword)}</p>
      ${renderSearchEvidenceRows(getSkillSearchEvidence(skill, searchKeyword))}
      ${renderDisclosure(
        "効果と所持武将を開く",
        `
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
        `,
        "skill-disclosure"
      )}
    </article>
  `;
}

function renderSkillCards(list, emptyMessage, options = {}) {
  if (!list.length) {
    return `
      <div class="empty-state">
        <p>${escapeHtml(emptyMessage)}</p>
      </div>
    `;
  }

  return list.map((skill) => renderSkillCard(skill, options)).join("");
}

function renderEmptyState(message) {
  return `
    <div class="empty-state">
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function builderSlotLabelFor(slotKey) {
  return BUILDER_SLOT_MAP[slotKey]?.label ?? slotKey;
}

function builderRowLabelFor(rowKey) {
  return BUILDER_ROW_MAP[rowKey]?.label ?? rowKey;
}

const BUILDER_CHAIN_SECOND_OFFSETS = {
  1: 0,
  2: 2,
  3: 4,
  4: 8,
  5: 10,
  6: 12,
  7: 16,
  8: 18,
  9: 20
};

const BUILDER_EFFECT_FALLBACK_SECONDS = {
  buff: 10,
  debuff: 10,
  heal: 6,
  damage: 1,
  utility: 8
};

const BUILDER_TIMELINE_MAX_SECOND = 50;
const BUILDER_EFFECT_SHORT_LABEL_RULES = [
  [/悠然/u, "悠然"],
  [/堅固/u, "堅固"],
  [/回復/u, "回復"],
  [/反撃/u, "反撃"],
  [/会心/u, "会心"],
  [/連撃/u, "連撃"],
  [/被ダメージ.*軽減|被害を軽減/u, "被ダメ軽減"],
  [/攻撃速度.*上昇|攻速.*上昇/u, "攻速上昇"],
  [/攻撃速度.*低下|攻速.*低下/u, "攻速低下"],
  [/防御.*上昇/u, "防御上昇"],
  [/攻撃.*上昇/u, "攻撃上昇"],
  [/戦威.*上昇/u, "戦威上昇"],
  [/策略.*上昇/u, "策略上昇"],
  [/強化.*付与/u, "強化付与"],
  [/弱化.*付与/u, "弱化付与"],
  [/強化解除/u, "強化解除"],
  [/弱化解除/u, "弱化解除"],
  [/対物/u, "対物"],
  [/ダメージ/u, "ダメージ"]
];
const BUILDER_SCOPE_LABELS = {
  army: "全体",
  self: "自身",
  target: "単体",
  allyRow: "同横列",
  allyColumn: "同縦列",
  enemyRow: "敵横列",
  enemyColumn: "敵縦列"
};

function builderFormationFor(key) {
  return FORMATION_MAP[key] ?? FORMATION_DEFS[0];
}

function formationSlotLabelFor(slotKey) {
  return FORMATION_SLOT_LABELS[slotKey] ?? slotKey;
}

function getFormationSlotMeta(formation, slotKey) {
  return formation.slots.find((slot) => slot.key === slotKey) ?? formation.slots[0];
}

function getFormationSlotOptionDefs(formation) {
  return FORMATION_SLOT_KEY_ORDER.map((slotKey) => {
    const slot = getFormationSlotMeta(formation, slotKey);
    return {
      key: slot.key,
      label: `${slot.label} / ${builderRowLabelFor(slot.rowKey)}`
    };
  });
}

function formatFormationTiming(formation) {
  return formation.timings.map((value) => `${value}秒`).join(" → ");
}

function getBuilderEffectShortLabel(effect) {
  const text = `${effect?.text ?? ""}`.replace(/（[^）]*）/gu, "").trim();
  for (const [pattern, label] of BUILDER_EFFECT_SHORT_LABEL_RULES) {
    if (pattern.test(text)) {
      return label;
    }
  }

  const compact = text
    .replace(/[、。].*$/u, "")
    .replace(/を.*$/u, "")
    .replace(/の.*$/u, "")
    .trim();
  if (compact) {
    return compact.length > 10 ? `${compact.slice(0, 10)}…` : compact;
  }
  return effect?.battleArtName || "効果";
}

function getBuilderActivationRateForEntry(entry) {
  return entry.key === "commander" ? 1 : Math.max(0, Math.min(1, Number(entry.chainStats?.rate ?? 0)));
}

function getBuilderEffectScopeLabel(effect) {
  return BUILDER_SCOPE_LABELS[effect.scope] ?? "単体";
}

function compareBuilderEffects(left, right) {
  return (
    left.startSecond - right.startSecond ||
    right.activationRate - left.activationRate ||
    left.characterName.localeCompare(right.characterName, "ja")
  );
}

function populateBuilderFormationSlotOptions() {
  if (!elements.builderFormationSlot || !elements.builderFormation) {
    return;
  }

  const formation = builderFormationFor(elements.builderFormation.value);
  const previous = elements.builderFormationSlot.value;
  populateSimpleSelect(
    elements.builderFormationSlot,
    getFormationSlotOptionDefs(formation),
    formation.slots.some((slot) => slot.key === previous) ? previous : formation.slots[0]?.key
  );
}

function populateBuilderTargetSlotOptions() {
  if (!elements.builderTargetSlot || !elements.builderFormation) {
    return;
  }

  const formation = builderFormationFor(elements.builderFormation.value);
  const previous = elements.builderTargetSlot.value;
  populateSimpleSelect(
    elements.builderTargetSlot,
    getFormationSlotOptionDefs(formation),
    formation.slots.some((slot) => slot.key === previous) ? previous : formation.slots[0]?.key
  );
}

function getBuilderSlotInputs() {
  return {
    commander: elements.builderCommander,
    vice1: elements.builderVice1,
    vice2: elements.builderVice2,
    aide1: elements.builderAide1,
    aide2: elements.builderAide2
  };
}

function getBuilderToggleMap() {
  return {
    vice1: elements.builderVice1Enabled,
    vice2: elements.builderVice2Enabled
  };
}

function evaluateBuilderSkills(character, slotKey, rowKey) {
  return character.skillRecords.map((skill) => {
    const rowConditions = skill.conditions.filter((conditionKey) =>
      ["front", "middle", "back"].includes(conditionKey)
    );
    const roleConditions = skill.conditions.filter((conditionKey) =>
      ["main", "vice", "aide"].includes(conditionKey)
    );
    const unmetConditions = [];

    if (rowConditions.length && !rowConditions.includes(rowKey)) {
      unmetConditions.push(...rowConditions);
    }

    if (
      roleConditions.length &&
      !roleConditions.includes(BUILDER_SLOT_MAP[slotKey]?.roleCondition)
    ) {
      unmetConditions.push(...roleConditions);
    }

    return {
      ...skill,
      active: unmetConditions.length === 0,
      unmetConditions
    };
  });
}

function describeBuilderPairing(commander, partner, rowKey, chainStats) {
  if (!commander || !partner || commander.id === partner.id) {
    return [];
  }

  const notes = [];
  const commanderType = commander.battleArtMeta?.type ?? "";
  const partnerType = partner.battleArtMeta?.type ?? "";

  if (commanderType && partnerType && commanderType === partnerType) {
    notes.push(`同系統: 両方とも${commanderType}系`);
  }

  if (commanderType && partner.battleArtMeta?.tags.includes(`${commanderType}上昇`)) {
    notes.push(`主将補助: ${commanderType}上昇を付与`);
  }

  if (
    partner.battleArtMeta?.enemyScopes.some((scope) =>
      (commander.battleArtMeta?.enemyScopes ?? []).includes(scope)
    )
  ) {
    notes.push("狙う範囲が近く、同じ敵列に重ねやすい");
  }

  if (partner.battleArtMeta?.rowBoosts.includes(rowKey)) {
    notes.push(`${builderRowLabelFor(rowKey)}で戦法が強化される`);
  }

  if (chainStats?.rate != null) {
    if (chainStats.rate >= 32) {
      notes.push("連鎖率はかなり高め");
    } else if (chainStats.rate >= 28) {
      notes.push("連鎖率は実用圏");
    } else {
      notes.push("連鎖率は低め");
    }
  }

  if (partner.battleArtMeta?.tags.includes("弱化") && commander.battleArtMeta?.tags.includes("ダメージ")) {
    notes.push("弱化のあとに主将火力を重ねやすい");
  }

  if (partner.battleArtMeta?.tags.includes("攻速上昇") && commander.battleArtMeta?.tags.includes("会心")) {
    notes.push("攻速上昇で主将の会心運用を補助");
  }

  return uniqueValues(notes).slice(0, 4);
}

function guessBuilderRowFromGuide(character) {
  if (!character) {
    return "";
  }

  const guideText = [
    ...(character.guide?.evaluationPoints ?? []),
    ...(character.guide?.latestFormation?.focusTitles ?? [])
  ].join(" ");

  if (guideText.includes("前列")) {
    return "front";
  }
  if (guideText.includes("中列")) {
    return "middle";
  }
  if (guideText.includes("後列")) {
    return "back";
  }

  if (character.conditionKeys.includes("front")) {
    return "front";
  }
  if (character.conditionKeys.includes("middle")) {
    return "middle";
  }
  if (character.conditionKeys.includes("back")) {
    return "back";
  }

  return "";
}

function guessBuilderFormationSlotFromGuide(character, formationKey) {
  const formation = builderFormationFor(formationKey);
  const rowGuess = guessBuilderRowFromGuide(character);
  if (rowGuess) {
    const slot = formation.slots.find((entry) => entry.rowKey === rowGuess);
    if (slot) {
      return slot.key;
    }
  }
  return formation.slots[0]?.key ?? "first";
}

function classifyBuilderEffectKind(text) {
  if (/回復/u.test(text)) {
    return "heal";
  }
  if (/(攻撃対象|低下|恐怖|病毒|解除)/u.test(text) && !/上昇/u.test(text)) {
    return "debuff";
  }
  if (/(％|%)の攻撃|ダメージ/u.test(text)) {
    return "damage";
  }
  if (/(悠然|無効|堅固|反撃|回避)/u.test(text)) {
    return "utility";
  }
  return "buff";
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function splitBuilderEffectSegments(line) {
  return normalizeText(line)
    .replace(/●/gu, "|")
    .split("|")
    .flatMap((part) =>
      part.split(/、(?=(?:自部隊|攻撃対象|自身1部隊|自身|軍勢全体|同じ横列の部隊|同じ縦列の部隊))/u)
    )
    .map((part) => normalizeText(part))
    .filter(Boolean);
}

function parseBuilderEffectSegment(text, tone) {
  const exactDuration = text.match(/[（(](\d+)秒[）)]/u)?.[1];
  const kind = classifyBuilderEffectKind(text);
  const duration = Number(exactDuration ?? BUILDER_EFFECT_FALLBACK_SECONDS[kind] ?? 8);
  let side = "ally";
  let scope = "self";

  if (/軍勢全体/u.test(text)) {
    side = "ally";
    scope = "army";
  } else if (/攻撃対象と同じ横列の部隊/u.test(text)) {
    side = "enemy";
    scope = "enemyRow";
  } else if (/攻撃対象と同じ縦列の部隊/u.test(text)) {
    side = "enemy";
    scope = "enemyColumn";
  } else if (/攻撃対象/u.test(text)) {
    side = "enemy";
    scope = "target";
  } else if (/同じ横列の部隊/u.test(text)) {
    side = "ally";
    scope = "allyRow";
  } else if (/同じ縦列の部隊/u.test(text)) {
    side = "ally";
    scope = "allyColumn";
  } else if (/(自部隊|自身1部隊|自身)/u.test(text)) {
    side = "ally";
    scope = "self";
  } else if (kind === "damage" || kind === "debuff") {
    side = "enemy";
    scope = "target";
  }

  return {
    text,
    tone,
    kind,
    side,
    scope,
    duration,
    estimated: !exactDuration
  };
}

function parseBuilderBattleArtEffects(character) {
  const lines = character.battleArtEffects ?? [];
  const tone = character.battleArtMeta?.tone ?? "utility";
  const segments = lines.flatMap((line) =>
    splitBuilderEffectSegments(line).map((part) => parseBuilderEffectSegment(part, tone))
  );
  if (segments.length) {
    return segments;
  }
  return [
    {
      text: character.battleArtName || "戦法効果",
      tone,
      kind: tone === "damage" ? "damage" : "buff",
      side: tone === "damage" ? "enemy" : "ally",
      scope: tone === "damage" ? "target" : "self",
      duration: tone === "damage" ? 1 : 8,
      estimated: true
    }
  ];
}

function getFormationSlotBaseSecond(formation, slotKey) {
  const index = FORMATION_SLOT_KEY_ORDER.indexOf(slotKey);
  let second = formation.timings[0];
  for (let offset = 0; offset < index; offset += 1) {
    second += formation.timings[offset + 1];
  }
  return second;
}

function getFormationCycleLength(formation) {
  return sumArmyValues(formation.timings.slice(1));
}

function getBuilderBoardLayout(formation) {
  const rowMap = [1, 4, 7];
  const allyColMap = [1, 2, 3];

  return {
    ally: Object.fromEntries(
      formation.slots.map((slot) => [
        slot.key,
        {
          ...slot,
          x: allyColMap[slot.gridCol],
          y: rowMap[slot.gridRow]
        }
      ])
    ),
    enemy: Object.fromEntries(
      formation.slots.map((slot) => [
        slot.key,
        {
          ...slot,
          x: 8 - allyColMap[slot.gridCol],
          y: rowMap[slot.gridRow]
        }
      ])
    )
  };
}

function buildBuilderTimelineWindows(entry, formation, formationSlotKey) {
  const baseSecond = getFormationSlotBaseSecond(formation, formationSlotKey);
  const cycleLength = getFormationCycleLength(formation);
  const triggerOffset = BUILDER_CHAIN_SECOND_OFFSETS[entry.orderScore] ?? 0;
  const activationRate = getBuilderActivationRateForEntry(entry);
  const triggerSeconds = [];
  const windows = [];

  for (let cycle = 0; cycle < 3; cycle += 1) {
    const triggerSecond = baseSecond + cycleLength * cycle + triggerOffset;
    if (triggerSecond > 60) {
      break;
    }

    triggerSeconds.push(triggerSecond);
    for (const [effectIndex, effect] of parseBuilderBattleArtEffects(entry.character).entries()) {
      windows.push({
        ...effect,
        id: `${entry.key}-${entry.character.id}-${cycle}-${effectIndex}`,
        startSecond: triggerSecond,
        endSecond: Math.min(60, triggerSecond + Math.max(effect.duration, 1)),
        characterName: entry.character.name,
        sourceLabel: entry.label,
        battleArtName: entry.character.battleArtName || entry.character.name,
        shortLabel: getBuilderEffectShortLabel(effect),
        activationRate,
        chainOrder: entry.character.battleArtMeta?.chainOrder ?? null,
        sourceSlotKey: formationSlotKey
      });
    }
  }

  return {
    triggerSeconds,
    windows
  };
}

function resolveBuilderEffectTargetSlots(effect, formation, sourceSlotKey, targetSlotKey) {
  const sourceSlot = getFormationSlotMeta(formation, sourceSlotKey);
  const targetSlot = getFormationSlotMeta(formation, targetSlotKey);

  if (effect.scope === "army") {
    return formation.slots.map((slot) => slot.key);
  }
  if (effect.scope === "self" || effect.scope === "target") {
    return [effect.side === "ally" ? sourceSlot.key : targetSlot.key];
  }
  if (effect.scope === "allyRow") {
    return formation.slots.filter((slot) => slot.rowKey === sourceSlot.rowKey).map((slot) => slot.key);
  }
  if (effect.scope === "allyColumn") {
    return formation.slots.filter((slot) => slot.gridCol === sourceSlot.gridCol).map((slot) => slot.key);
  }
  if (effect.scope === "enemyRow") {
    return formation.slots.filter((slot) => slot.rowKey === targetSlot.rowKey).map((slot) => slot.key);
  }
  if (effect.scope === "enemyColumn") {
    return formation.slots.filter((slot) => slot.gridCol === targetSlot.gridCol).map((slot) => slot.key);
  }
  return [effect.side === "ally" ? sourceSlot.key : targetSlot.key];
}

function buildBuilderTimelineSegments(timelineEntries) {
  const windows = timelineEntries
    .flatMap((entry) => entry.windows)
    .map((effect) => ({
      ...effect,
      clippedStart: Math.max(0, Math.min(BUILDER_TIMELINE_MAX_SECOND, effect.startSecond)),
      clippedEnd: Math.max(0, Math.min(BUILDER_TIMELINE_MAX_SECOND, effect.endSecond))
    }))
    .filter((effect) => effect.clippedEnd > effect.clippedStart)
    .sort(compareBuilderEffects);

  const boundaries = uniqueValues([
    0,
    BUILDER_TIMELINE_MAX_SECOND,
    ...windows.flatMap((effect) => [effect.clippedStart, effect.clippedEnd])
  ]).sort((left, right) => left - right);

  const segments = [];
  for (let index = 0; index < boundaries.length - 1; index += 1) {
    const startSecond = boundaries[index];
    const endSecond = boundaries[index + 1];
    if (endSecond <= startSecond) {
      continue;
    }

    const activeEffects = windows
      .filter((effect) => effect.clippedStart < endSecond && effect.clippedEnd > startSecond)
      .sort(compareBuilderEffects);
    segments.push({
      id: `segment-${startSecond}-${endSecond}`,
      startSecond,
      endSecond,
      previewSecond: Math.min(
        BUILDER_TIMELINE_MAX_SECOND,
        Math.max(0, Math.floor((startSecond + endSecond) / 2))
      ),
      tone: activeEffects[0]?.tone ?? "empty",
      activeEffects
    });
  }

  return segments;
}

function getBuilderTimelinePrimaryTone(effects = []) {
  const tonePriority = {
    damage: 5,
    debuff: 4,
    support: 3,
    heal: 2,
    utility: 1,
    empty: 0
  };
  return effects.reduce((bestTone, effect) => {
    const tone = effect?.tone || "utility";
    return (tonePriority[tone] ?? 0) > (tonePriority[bestTone] ?? 0) ? tone : bestTone;
  }, "empty");
}

function buildBuilderTimelineRowSegments(effects) {
  const boundaries = uniqueValues([
    0,
    BUILDER_TIMELINE_MAX_SECOND,
    ...effects.flatMap((effect) => [effect.clippedStart, effect.clippedEnd])
  ]).sort((left, right) => left - right);
  const segments = [];

  for (let index = 0; index < boundaries.length - 1; index += 1) {
    const startSecond = boundaries[index];
    const endSecond = boundaries[index + 1];
    if (endSecond <= startSecond) {
      continue;
    }

    const activeEffects = effects
      .filter((effect) => effect.clippedStart < endSecond && effect.clippedEnd > startSecond)
      .sort(compareBuilderEffects);
    if (!activeEffects.length) {
      continue;
    }

    segments.push({
      id: `timeline-slot-segment-${startSecond}-${endSecond}`,
      startSecond,
      endSecond,
      previewSecond: Math.min(
        BUILDER_TIMELINE_MAX_SECOND,
        Math.max(startSecond, Math.floor((startSecond + endSecond) / 2))
      ),
      label: summarizeBuilderCellEffects(activeEffects) || `${activeEffects.length}件`,
      tone: getBuilderTimelinePrimaryTone(activeEffects),
      estimated: activeEffects.some((effect) => effect.estimated),
      activeEffects
    });
  }

  return segments;
}

function buildBuilderTimelineRows(timelineWindows, formation, formationSlotKey, targetSlotKey) {
  const rowMap = new Map();

  for (const effect of timelineWindows) {
    const clippedStart = Math.max(0, Math.min(BUILDER_TIMELINE_MAX_SECOND, effect.startSecond));
    const clippedEnd = Math.max(0, Math.min(BUILDER_TIMELINE_MAX_SECOND, effect.endSecond));
    if (clippedEnd <= clippedStart) {
      continue;
    }

    const targetSlotKeys = resolveBuilderEffectTargetSlots(
      effect,
      formation,
      effect.sourceSlotKey || formationSlotKey,
      targetSlotKey
    );
    for (const slotKey of targetSlotKeys) {
      const slot = getFormationSlotMeta(formation, slotKey);
      const rowId = `${effect.side}-${slotKey}`;
      if (!rowMap.has(rowId)) {
        rowMap.set(rowId, {
          id: `timeline-row-${rowId}`,
          side: effect.side,
          slotKey,
          slotLabel: slot.label,
          rowKey: slot.rowKey,
          sortOrder: (effect.side === "ally" ? 0 : 10) + FORMATION_SLOT_KEY_ORDER.indexOf(slotKey),
          title: `${effect.side === "ally" ? "味方" : "敵"} ${slot.label}`,
          subtitle: [
            builderRowLabelFor(slot.rowKey),
            effect.side === "ally" && slotKey === formationSlotKey ? "自部隊" : "",
            effect.side === "enemy" && slotKey === targetSlotKey ? "基準敵" : ""
          ]
            .filter(Boolean)
            .join(" / "),
          effects: []
        });
      }

      rowMap.get(rowId).effects.push({
        ...effect,
        clippedStart,
        clippedEnd,
        targetSlotKey: slotKey
      });
    }
  }

  return [...rowMap.values()]
    .map((row) => {
      const effects = row.effects.sort(compareBuilderEffects);
      const segments = buildBuilderTimelineRowSegments(effects);
      return {
        ...row,
        effects,
        segments,
        previewSecond: segments[0]?.previewSecond ?? 0,
        estimated: effects.some((effect) => effect.estimated),
        tone: getBuilderTimelinePrimaryTone(effects)
      };
    })
    .filter((row) => row.segments.length)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title, "ja"));
}

function summarizeBuilderCellEffects(effects) {
  const labels = uniqueValues(effects.map((effect) => effect.shortLabel));
  if (!labels.length) {
    return "";
  }
  return labels.length === 1 ? labels[0] : `${labels[0]} +${labels.length - 1}`;
}

function buildBuilderMiniBoardCells(state, side) {
  const cells = Array.from({ length: 9 }, (_, index) => ({
    x: index % 3,
    y: Math.floor(index / 3),
    slotKey: "",
    slotLabel: "",
    rowLabel: "",
    isSelf: false,
    isTarget: false,
    effects: []
  }));

  const cellAt = (x, y) => cells[y * 3 + x];
  for (const slot of state.formation.slots) {
    const cell = cellAt(slot.gridCol, slot.gridRow);
    cell.slotKey = slot.key;
    cell.slotLabel = slot.label;
    cell.rowLabel = builderRowLabelFor(slot.rowKey);
    if (side === "ally" && slot.key === state.formationSlot.key) {
      cell.isSelf = true;
    }
    if (side === "enemy" && slot.key === state.targetSlotKey) {
      cell.isTarget = true;
    }
  }

  for (const effect of state.activeEffects.filter((row) => row.side === side)) {
    const targetSlotKeys = resolveBuilderEffectTargetSlots(
      effect,
      state.formation,
      state.formationSlot.key,
      state.targetSlotKey
    );
    for (const slotKey of targetSlotKeys) {
      const slot = getFormationSlotMeta(state.formation, slotKey);
      cellAt(slot.gridCol, slot.gridRow).effects.push(effect);
    }
  }

  return cells.map((cell) => ({
    ...cell,
    occupied: Boolean(cell.slotKey),
    hasBuff: cell.effects.some((effect) => effect.kind === "buff"),
    hasDebuff: cell.effects.some((effect) => effect.kind === "debuff" || effect.kind === "damage"),
    hasHeal: cell.effects.some((effect) => effect.kind === "heal"),
    hasUtility: cell.effects.some((effect) => effect.kind === "utility"),
    effectSummary: summarizeBuilderCellEffects(cell.effects),
    tone: getBuilderTimelinePrimaryTone(cell.effects),
    displayTitle:
      side === "ally" && cell.isSelf ? state.commander?.name || "自部隊" : cell.slotLabel || (cell.slotKey ? "部隊" : ""),
    displayNote: [
      side === "ally" && cell.isSelf ? "自部隊" : "",
      side === "enemy" && cell.isTarget ? "基準敵" : "",
      summarizeBuilderCellEffects(cell.effects) || cell.rowLabel
    ]
      .filter(Boolean)
      .join(" / ")
  }));
}

function buildBuilderBoardSnapshot(state) {
  return {
    allyCells: buildBuilderMiniBoardCells(state, "ally"),
    enemyCells: buildBuilderMiniBoardCells(state, "enemy")
  };
}

function buildBuilderState() {
  const formation = builderFormationFor(elements.builderFormation?.value);
  const formationSlot = getFormationSlotMeta(
    formation,
    elements.builderFormationSlot?.value || formation.slots[0]?.key
  );
  const rowKey = formationSlot.rowKey;
  const targetSlotKey = elements.builderTargetSlot?.value || formation.slots[0]?.key;
  const previewSecond = Math.max(
    0,
    Math.min(BUILDER_TIMELINE_MAX_SECOND, Number(elements.builderPreviewSecond?.value ?? 20))
  );
  const slotInputs = getBuilderSlotInputs();
  const toggleMap = getBuilderToggleMap();
  const commander = characterByName[slotInputs.commander?.value] ?? null;

  const slotEntries = BUILDER_SLOT_DEFS.map((slot) => {
    const character = characterByName[slotInputs[slot.key]?.value] ?? null;
    const toggleInput = toggleMap[slot.key];
    const tacticEnabled = slot.key === "commander" ? true : toggleInput ? toggleInput.checked : true;
    const chainStats =
      commander && character && slot.roleCondition === "vice" ? getChainStats(commander, character) : null;

    return {
      ...slot,
      character,
      tacticEnabled,
      chainStats,
      skillStates: character ? evaluateBuilderSkills(character, slot.key, rowKey) : [],
      orderScore:
        slot.tacticSlot && character
          ? TACTIC_ORDER_SCORES[slot.key]?.[character.battleArtMeta?.chainOrder] ?? Number.MAX_SAFE_INTEGER
          : null
    };
  });

  const selectedEntries = slotEntries.filter((entry) => entry.character);
  const selectedCharacters = selectedEntries.map((entry) => entry.character);
  const duplicateMap = selectedEntries.reduce((map, entry) => {
    map.set(entry.character.name, (map.get(entry.character.name) ?? 0) + 1);
    return map;
  }, new Map());
  const duplicateNames = [...duplicateMap.entries()]
    .filter(([, count]) => count > 1)
    .map(([name, count]) => ({ name, count }));

  const duplicateSkillMap = new Map();
  for (const entry of selectedEntries) {
    for (const skill of entry.character.skillRecords) {
      if (!duplicateSkillMap.has(skill.name)) {
        duplicateSkillMap.set(skill.name, []);
      }
      duplicateSkillMap.get(skill.name).push(entry.label);
    }
  }
  const duplicateSkills = [...duplicateSkillMap.entries()]
    .filter(([, slots]) => slots.length > 1)
    .map(([name, slots]) => ({ name, slots }));

  const typeCounts = selectedCharacters.reduce((map, character) => {
    map.set(character.type || "-", (map.get(character.type || "-") ?? 0) + 1);
    return map;
  }, new Map());
  const typeSummary = [...typeCounts.entries()].map(([type, count]) => `${typeLabelFor(type)}${count}`);

  const activeSkillCount = slotEntries.reduce(
    (sum, entry) => sum + entry.skillStates.filter((skill) => skill.active).length,
    0
  );
  const inactiveSkillCount = slotEntries.reduce(
    (sum, entry) => sum + entry.skillStates.filter((skill) => !skill.active).length,
    0
  );

  const timelineEntries = slotEntries
    .filter((entry) => entry.tacticSlot && entry.character && (entry.key === "commander" || entry.tacticEnabled))
    .map((entry) => ({
      ...entry,
      pairingNotes:
        commander && entry.key !== "commander"
          ? describeBuilderPairing(commander, entry.character, rowKey, entry.chainStats)
          : [],
      ...buildBuilderTimelineWindows(entry, formation, formationSlot.key)
    }))
    .sort((left, right) => left.orderScore - right.orderScore || compareCharactersBase(left.character, right.character));
  const timelineWindows = timelineEntries.flatMap((entry) => entry.windows).sort(compareBuilderEffects);
  const timelineSegments = buildBuilderTimelineSegments(timelineEntries);
  const timelineRows = buildBuilderTimelineRows(timelineWindows, formation, formationSlot.key, targetSlotKey);

  const overviewNotes = [];
  if (!commander && selectedEntries.length) {
    overviewNotes.push("主将を選ぶと副将の連鎖率と発動順を計算できます。");
  }
  if (duplicateNames.length) {
    overviewNotes.push("同じ武将を重ねる編成はゲーム内では組めません。");
  }
  if (duplicateSkills.length) {
    overviewNotes.push("同一技能が重なると補佐も含めて効果量を伸ばしやすくなります。");
  }
  if (timelineEntries.some((entry) => entry.character?.battleArtMeta?.rowBoosts.includes(rowKey))) {
    overviewNotes.push(`${builderRowLabelFor(rowKey)}で追加効果が入る戦法があります。`);
  }
  overviewNotes.push(`${formation.label} は ${formatFormationTiming(formation)} で回る想定です。`);

  const activeEffects = timelineWindows
    .filter((effect) => previewSecond >= effect.startSecond && previewSecond < effect.endSecond)
    .sort(compareBuilderEffects);

  return {
    formation,
    formationSlot,
    rowKey,
    targetSlotKey,
    previewSecond,
    commander,
    slotEntries,
    selectedEntries,
    selectedCharacters,
    duplicateNames,
    duplicateSkills,
    typeSummary,
    activeSkillCount,
    inactiveSkillCount,
    timelineEntries,
    timelineWindows,
    timelineSegments,
    timelineRows,
    activeEffects,
    boardCells: buildBuilderBoardSnapshot({
      formation,
      formationSlot,
      targetSlotKey,
      commander,
      activeEffects
    }),
    overviewNotes: uniqueValues(overviewNotes)
  };
}

function renderBuilderTimeline(state) {
  if (!state.commander) {
    return renderEmptyState("主将を選ぶと、0〜40秒の発動帯と連鎖率をまとめて表示します。");
  }

  if (!state.timelineSegments.length) {
    return renderEmptyState("戦法を表示できる武将がまだ選ばれていません。");
  }

  const axisMarkup = Array.from({ length: 5 }, (_, index) => `<span>${index * 10}秒</span>`).join("");
  const segmentMarkup = state.timelineSegments
    .map((segment) => {
      const isActive =
        state.previewSecond >= segment.startSecond &&
        (state.previewSecond < segment.endSecond ||
          (segment.endSecond === BUILDER_TIMELINE_MAX_SECOND && state.previewSecond === BUILDER_TIMELINE_MAX_SECOND));
      const effectMarkup = segment.activeEffects.length
        ? segment.activeEffects
            .map(
              (effect) => `
                <span class="timeline-effect-chip tone-${escapeHtml(effect.tone || "utility")}">
                  <strong>${escapeHtml(effect.characterName)}</strong>
                  <small>${escapeHtml(`${effect.shortLabel} / ${formatPercent(effect.activationRate)}`)}</small>
                </span>
              `
            )
            .join("")
        : `<span class="timeline-effect-chip is-empty"><strong>有効効果なし</strong><small>次の発動待ち</small></span>`;

      return `
        <button
          class="timeline-segment-card ${isActive ? "is-active" : ""}"
          type="button"
          data-builder-preview-second="${segment.previewSecond}"
        >
          <div class="timeline-segment-head">
            <strong>${escapeHtml(`${segment.startSecond}〜${segment.endSecond}秒`)}</strong>
            <span>${escapeHtml(segment.activeEffects.length ? `${segment.activeEffects.length}効果` : "空白区間")}</span>
          </div>
          <div class="timeline-segment-track">
            <div
              class="timeline-segment-range tone-${escapeHtml(segment.tone)} ${segment.activeEffects.length ? "" : "is-empty"}"
              style="--start:${segment.startSecond}; --end:${segment.endSecond}"
            ></div>
            <div class="timeline-now" style="--at:${state.previewSecond}"></div>
          </div>
          <div class="timeline-effect-list">${effectMarkup}</div>
        </button>
      `;
    })
    .join("");

  return `
    <div class="timeline-shell">
      <div class="timeline-axis">${axisMarkup}</div>
      <div class="timeline-list">${segmentMarkup}</div>
    </div>
  `;
}

function renderBuilderOverview(state) {
  const rowLabel = builderRowLabelFor(state.rowKey);
  const selectionText = `${state.selectedEntries.length}/${BUILDER_SLOT_DEFS.length}枠`;
  const chainRows = state.slotEntries
    .filter((entry) => entry.roleCondition === "vice" && entry.character)
    .map((entry) => {
      const sharedText = entry.chainStats?.shared.length
        ? entry.chainStats.shared.map((row) => row.name).join(" / ")
        : "共通個性なし";
      return `<li>${escapeHtml(entry.label)} ${escapeHtml(entry.character.name)}: ${escapeHtml(
        formatPercent(entry.chainStats?.rate ?? 0)
      )} / ${escapeHtml(sharedText)}</li>`;
    })
    .join("");
  const duplicateSkillRows = state.duplicateSkills.length
    ? state.duplicateSkills
        .map(
          (row) => `<li>${escapeHtml(row.name)} ×${row.slots.length}: ${escapeHtml(row.slots.join(" / "))}</li>`
        )
        .join("")
    : "<li>重複技能なし</li>";
  const noteRows = state.overviewNotes.map((note) => `<li>${escapeHtml(note)}</li>`).join("");

  return `
    <article class="info-card">
      <h2>部隊サマリー</h2>
      <ul class="bullet-list">
        <li>陣形: ${escapeHtml(state.formation.label)} / 位置: ${escapeHtml(state.formationSlot.label)}</li>
        <li>列: ${escapeHtml(rowLabel)}</li>
        <li>選択枠: ${escapeHtml(selectionText)}</li>
        <li>タイプ構成: ${escapeHtml(state.typeSummary.join(" / ") || "未選択")}</li>
        <li>有効技能 ${state.activeSkillCount} / 条件未達 ${state.inactiveSkillCount}</li>
      </ul>
    </article>
    <article class="info-card">
      <h2>副将連鎖率</h2>
      <ul class="bullet-list">${chainRows || "<li>副将を選ぶと表示します。</li>"}</ul>
    </article>
    <article class="info-card">
      <h2>重複技能</h2>
      <ul class="bullet-list">${duplicateSkillRows}</ul>
    </article>
    <article class="info-card">
      <h2>チェックポイント</h2>
      <ul class="bullet-list">${noteRows}</ul>
    </article>
  `;
}

function renderBuilderBoardLegend() {
  return `
    <span class="legend-chip"><span class="legend-swatch is-buff"></span>味方バフ</span>
    <span class="legend-chip"><span class="legend-swatch is-debuff"></span>敵デバフ / ダメージ</span>
    <span class="legend-chip"><span class="legend-swatch is-heal"></span>回復</span>
    <span class="legend-chip"><span class="legend-swatch is-utility"></span>悠然 / 堅固 / 解除</span>
  `;
}

function renderBuilderBoardPanel(title, cells, side) {
  return `
    <article class="board-panel">
      <div class="board-panel-head">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(side === "enemy" ? "敵マスをタップで基準変更" : "自部隊の3×3")}</span>
      </div>
      <div class="board-grid-mini">
        ${cells
    .map((cell) => {
      const classes = [
        "board-cell",
        side === "ally" ? "is-friendly" : "is-enemy",
        cell.isSelf ? "is-self" : "",
        cell.isTarget ? "is-target" : "",
        cell.hasBuff ? "has-buff" : "",
        cell.hasDebuff ? "has-debuff" : "",
        cell.hasHeal ? "has-heal" : "",
        cell.hasUtility ? "has-utility" : ""
      ]
        .filter(Boolean)
        .join(" ");
      const noteParts = [
        cell.isSelf ? "自部隊" : "",
        cell.isTarget ? "基準敵" : "",
        cell.effectSummary || cell.rowLabel
      ].filter(Boolean);

      return `
        <div class="${classes}">
          ${
            side === "enemy" && cell.slotKey
              ? `<button type="button" data-builder-target-slot="${escapeHtml(cell.slotKey)}"></button>`
              : ""
          }
          <div class="board-cell-label">${escapeHtml(cell.slotLabel || "空き")}</div>
          <div class="board-cell-note">${escapeHtml(noteParts.join(" / "))}</div>
        </div>
      `;
    })
    .join("")}
      </div>
    </article>
  `;
}

function renderBuilderBoard(state) {
  return `
    <div class="board-grid-duo">
      ${renderBuilderBoardPanel("味方 3×3", state.boardCells.allyCells, "ally")}
      ${renderBuilderBoardPanel("敵 3×3", state.boardCells.enemyCells, "enemy")}
    </div>
  `;
}

function renderBuilderActiveEffects(state) {
  if (!state.activeEffects.length) {
    return renderEmptyState(`${state.previewSecond}秒時点で残っているバフ / デバフはありません。`);
  }

  return state.activeEffects
    .map(
      (effect) => {
        const targetSlots = resolveBuilderEffectTargetSlots(
          effect,
          state.formation,
          state.formationSlot.key,
          state.targetSlotKey
        )
          .map((slotKey) => formationSlotLabelFor(slotKey))
          .join(" / ");

        return `
        <article class="army-slot-item">
          <div class="army-list-row">
            <span>${escapeHtml(`${effect.startSecond}〜${effect.endSecond}秒`)}</span>
            <span>${escapeHtml(effect.estimated ? "推定秒" : "確定秒")}</span>
          </div>
          <div class="army-list-row">
            <span>発動</span>
            <span>${escapeHtml(`${effect.characterName} / ${effect.shortLabel}`)}</span>
          </div>
          <div class="army-list-row">
            <span>連鎖率</span>
            <span>${escapeHtml(effect.sourceLabel === "主将" ? "100% / 主将" : formatPercent(effect.activationRate))}</span>
          </div>
          <div class="army-list-row">
            <span>対象</span>
            <span>${escapeHtml(`${effect.side === "ally" ? "味方" : "敵"} / ${getBuilderEffectScopeLabel(effect)} / ${targetSlots}`)}</span>
          </div>
          <div class="army-list-row">
            <span>戦法</span>
            <span>${escapeHtml(effect.battleArtName)}</span>
          </div>
          <div class="army-list-row">
            <span>内容</span>
            <span>${escapeHtml(effect.text)}</span>
          </div>
        </article>
      `;
      }
    )
    .join("");
}

function renderBuilderSkillButtons(skillRows, active) {
  if (!skillRows.length) {
    return `<p class="field-note">${active ? "有効技能なし" : "条件未達の技能なし"}</p>`;
  }

  return `
    <div class="skill-chip-list">
      ${skillRows
        .map((skill) => {
          const caption = active
            ? skill.conditions.map(conditionLabelFor).join(" / ") || "常時"
            : skill.unmetConditions.map(conditionLabelFor).join(" / ");
          return `
            <button
              type="button"
              class="skill-chip ${active ? "is-matched" : "is-inactive"}"
              data-skill-name="${escapeHtml(skill.name)}"
            >
              <strong>${escapeHtml(skill.name)}</strong>
              <small>${escapeHtml(caption)}</small>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderBuilderSlotCard(entry, rowKey) {
  if (!entry.character) {
    return `
      <article class="builder-slot-card is-empty">
        <h3>${escapeHtml(entry.label)}</h3>
        <p>未選択</p>
      </article>
    `;
  }

  const activeSkills = entry.skillStates.filter((skill) => skill.active);
  const inactiveSkills = entry.skillStates.filter((skill) => !skill.active);
  const scopeText = entry.tacticSlot
    ? uniqueValues([
        ...(entry.character.battleArtMeta?.allyScopes ?? []).map((scope) => `味方:${scope}`),
        ...(entry.character.battleArtMeta?.enemyScopes ?? []).map((scope) => `敵:${scope}`)
      ])
    : [];
  const rowBoostText = entry.tacticSlot
    ? (entry.character.battleArtMeta?.rowBoosts ?? []).map((row) => `${builderRowLabelFor(row)}で追加効果`)
    : [];
  const chainMarkup =
    entry.chainStats?.rate != null
      ? `
          <div class="chain-box">
            <div class="chain-head">
              <span class="chain-pill">連鎖率 ${escapeHtml(formatPercent(entry.chainStats.rate))}</span>
              <span class="chain-pill chain-pill-muted">
                基礎 ${escapeHtml(formatPercent(entry.chainStats.base))} + 個性加算 ${escapeHtml(
                  formatPercent(entry.chainStats.bonus)
                )}
              </span>
            </div>
            <p class="chain-traits">${escapeHtml(
              entry.chainStats.shared.length
                ? entry.chainStats.shared.map((row) => row.name).join(" / ")
                : "共通個性なし"
            )}</p>
          </div>
        `
      : "";

  return `
    <article class="builder-slot-card">
      <div class="builder-slot-head">
        <div class="character-thumb-wrap">
          <img
            class="character-thumb"
            src="${escapeHtml(entry.character.imageUrl)}"
            alt="${escapeHtml(entry.character.name)}"
            loading="lazy"
          >
        </div>
        <div class="builder-slot-main">
          <div class="card-header">
            <div>
              <p class="skill-group-title">${escapeHtml(entry.label)}</p>
              <h3>${escapeHtml(entry.character.name)}</h3>
              <p class="subline">
                ${escapeHtml(entry.character.rarity)} / ${escapeHtml(entry.character.type || "-")}タイプ / 天賦 ${entry.character.tenpu}
              </p>
            </div>
            <button type="button" class="mini-button" data-open-character="${escapeHtml(entry.character.name)}">
              武将DBで開く
            </button>
          </div>
          <div class="meta-chip-list">
            ${
              entry.tacticSlot
                ? `<span class="meta-chip">系統 ${escapeHtml(entry.character.battleArtMeta?.type || "-")}</span>`
                : ""
            }
            ${
              entry.tacticSlot
                ? `<span class="meta-chip">連鎖順 ${escapeHtml(entry.character.battleArtMeta?.chainOrder || "-")}</span>`
                : ""
            }
            ${entry.tacticSlot && entry.key !== "commander" && !entry.tacticEnabled ? '<span class="meta-chip">戦法オフ</span>' : ""}
            ${scopeText.map((text) => `<span class="meta-chip">${escapeHtml(text)}</span>`).join("")}
            ${rowBoostText.map((text) => `<span class="meta-chip">${escapeHtml(text)}</span>`).join("")}
          </div>
          ${
            entry.tacticSlot
              ? `
                  <div class="battle-art-box">
                    <p class="skill-group-title">戦法</p>
                    <h4>${escapeHtml(entry.character.battleArtName || "戦法名なし")}</h4>
                    <ul class="bullet-list">
                      ${(entry.character.battleArtEffects ?? [])
                        .map((effect) => `<li>${escapeHtml(effect)}</li>`)
                        .join("")}
                    </ul>
                  </div>
                `
              : ""
          }
          ${chainMarkup}
          <div class="skill-group">
            <p class="skill-group-title">有効技能</p>
            ${renderBuilderSkillButtons(activeSkills, true)}
          </div>
          <div class="skill-group">
            <p class="skill-group-title">条件未達の技能</p>
            ${renderBuilderSkillButtons(inactiveSkills, false)}
          </div>
          <dl class="stats-grid">${renderStatsGrid(entry.character, [])}</dl>
        </div>
      </div>
    </article>
  `;
}

function setBuilderValidation(message) {
  elements.builderValidation.textContent = message;
  elements.builderValidation.hidden = !message;
}

function renderBuilderView() {
  if (!elements.builderView) {
    return;
  }

  const state = buildBuilderState();
  const validationMessages = [];

  if (state.duplicateNames.length) {
    validationMessages.push(
      `重複武将: ${state.duplicateNames.map((row) => `${row.name} ×${row.count}`).join(" / ")}`
    );
  }

  if (!state.commander && state.selectedEntries.length) {
    validationMessages.push("主将を選ぶと連鎖率と効果帯を計算できます。");
  }

  elements.builderSummary.textContent = formatSummaryText(
    [
      `陣形: ${state.formation.label}`,
      `位置: ${state.formationSlot.label}`,
      `列: ${builderRowLabelFor(state.rowKey)}`,
      `主将: ${state.commander?.name ?? "未選択"}`,
      `選択枠: ${state.selectedEntries.length}/${BUILDER_SLOT_DEFS.length}`,
      `表示帯: ${state.timelineSegments.filter((segment) => segment.activeEffects.length).length}区間`,
      `現在: ${state.previewSecond}秒`
    ],
    "編成条件を指定してください。"
  );
  setBuilderValidation(validationMessages.join(" / "));
  elements.builderTimelineCount.textContent = `0〜${BUILDER_TIMELINE_MAX_SECOND}秒 / ${state.timelineSegments.length}区間`;
  if (elements.builderPreviewSecondLabel) {
    elements.builderPreviewSecondLabel.textContent = `${state.previewSecond}秒時点の3×3盤面を表示します。時間帯カードをタップするとその秒へ移動します。`;
  }
  if (elements.builderBoardLegend) {
    elements.builderBoardLegend.innerHTML = renderBuilderBoardLegend();
  }
  elements.builderTimeline.innerHTML = renderBuilderTimeline(state);
  elements.builderBoardGrid.innerHTML = renderBuilderBoard(state);
  elements.builderActiveEffects.innerHTML = renderBuilderActiveEffects(state);
  elements.builderOverviewGrid.innerHTML = renderBuilderOverview(state);
  elements.builderSlotGrid.innerHTML = BUILDER_SLOT_DEFS.map((slot) => {
    const entry = state.slotEntries.find((row) => row.key === slot.key);
    return renderBuilderSlotCard(entry, state.rowKey);
  }).join("");
}

function renderBuilderTimeline(state) {
  if (!state.commander) {
    return renderEmptyState("主将を選ぶと、0～50秒の戦法タイムラインと連鎖率をまとめて表示します。");
  }

  if (!state.timelineRows.length) {
    return renderEmptyState("戦法を表示できる武将がまだ選ばれていません。");
  }

  const axisMarkup = Array.from(
    { length: BUILDER_TIMELINE_MAX_SECOND / 10 + 1 },
    (_, index) => `<span>${index * 10}秒</span>`
  ).join("");
  const rowMarkup = state.timelineRows
    .map((row) => {
      const isActive =
        state.previewSecond >= row.startSecond &&
        (state.previewSecond < row.endSecond ||
          (row.endSecond === BUILDER_TIMELINE_MAX_SECOND && state.previewSecond === BUILDER_TIMELINE_MAX_SECOND));
      const barMarkup = row.effects
        .map(
          (effect, index) => `
            <span
              class="builder-timeline-bar tone-${escapeHtml(effect.tone || "utility")} ${effect.estimated ? "is-estimated" : ""}"
              style="--start:${effect.clippedStart}; --end:${effect.clippedEnd}; --lane:${index}"
              title="${escapeHtml(`${effect.characterName} / ${effect.shortLabel} / ${effect.text}`)}"
            >
              <span>${escapeHtml(effect.shortLabel)}</span>
            </span>
          `
        )
        .join("");
      const effectMetaMarkup = row.effects
        .map(
          (effect) => `
            <span class="timeline-effect-chip tone-${escapeHtml(effect.tone || "utility")}">
              <strong>${escapeHtml(effect.shortLabel)}</strong>
              <small>${escapeHtml(`${effect.startSecond}～${effect.endSecond}秒 / ${getBuilderEffectScopeLabel(effect)}`)}</small>
            </span>
          `
        )
        .join("");

      return `
        <button
          class="builder-timeline-row ${isActive ? "is-active" : ""}"
          type="button"
          data-builder-preview-second="${row.previewSecond}"
        >
          <div class="builder-timeline-row-head">
            <div>
              <div class="builder-timeline-source">${escapeHtml(`${row.sourceLabel} / ${row.characterName}`)}</div>
              <strong class="builder-timeline-title">${escapeHtml(row.battleArtName)}</strong>
            </div>
            <div class="builder-timeline-meta">
              <span>${escapeHtml(`${row.triggerSecond}秒発動`)}</span>
              <span>${escapeHtml(row.sourceLabel === "主将" ? "100% / 主将" : formatPercent(row.activationRate))}</span>
              <span>${escapeHtml(row.estimated ? "推定秒含む" : "確定秒のみ")}</span>
            </div>
          </div>
          <div class="builder-timeline-track" style="--lanes:${Math.max(row.effects.length, 1)}">
            ${barMarkup}
            <div class="builder-timeline-now" style="--at:${state.previewSecond}"></div>
          </div>
          <div class="builder-timeline-row-foot">${effectMetaMarkup}</div>
        </button>
      `;
    })
    .join("");

  return `
    <div class="builder-timeline-shell">
      <div class="builder-timeline-axis">${axisMarkup}</div>
      <div class="builder-timeline-rows">${rowMarkup}</div>
    </div>
  `;
}

function renderBuilderView() {
  if (!elements.builderView) {
    return;
  }

  const state = buildBuilderState();
  const validationMessages = [];

  if (state.duplicateNames.length) {
    validationMessages.push(
      `重複武将: ${state.duplicateNames.map((row) => `${row.name} ×${row.count}`).join(" / ")}`
    );
  }

  if (!state.commander && state.selectedEntries.length) {
    validationMessages.push("主将を選ぶと連鎖率と効果帯を計算できます。");
  }

  elements.builderSummary.textContent = formatSummaryText(
    [
      `陣形: ${state.formation.label}`,
      `位置: ${state.formationSlot.label}`,
      `列: ${builderRowLabelFor(state.rowKey)}`,
      `主将: ${state.commander?.name ?? "未選択"}`,
      `選択枠: ${state.selectedEntries.length}/${BUILDER_SLOT_DEFS.length}`,
      `対象位置: ${state.timelineRows.length}マス`,
      `現在: ${state.previewSecond}秒`
    ],
    "編成条件を指定してください。"
  );
  setBuilderValidation(validationMessages.join(" / "));
  elements.builderTimelineCount.textContent = `0～${BUILDER_TIMELINE_MAX_SECOND}秒 / ${state.timelineRows.length}マス`;
  if (elements.builderPreviewSecondLabel) {
    elements.builderPreviewSecondLabel.textContent = `${state.previewSecond}秒時点の3×3盤面を表示します。効果帯を押すとその秒へ移動します。`;
  }
  const timelineSection = elements.builderTimeline?.closest(".result-section");
  const timelineHeading = timelineSection?.querySelector(".result-header h2");
  const timelineLead = timelineSection?.querySelector(".result-header p");
  if (timelineHeading) {
    timelineHeading.textContent = "0～50秒の効果帯";
  }
  if (timelineLead) {
    timelineLead.textContent = "戦法ごとではなく、味方3×3と敵3×3のどこに何秒から何秒まで効果が残るかを位置別にまとめます。";
  }
  if (elements.builderBoardLegend) {
    elements.builderBoardLegend.innerHTML = renderBuilderBoardLegend();
  }
  elements.builderTimeline.innerHTML = renderBuilderTimeline(state);
  elements.builderBoardGrid.innerHTML = renderBuilderBoard(state);
  elements.builderActiveEffects.innerHTML = renderBuilderActiveEffects(state);
  elements.builderOverviewGrid.innerHTML = renderBuilderOverview(state);
  elements.builderSlotGrid.innerHTML = BUILDER_SLOT_DEFS.map((slot) => {
    const entry = state.slotEntries.find((row) => row.key === slot.key);
    return renderBuilderSlotCard(entry, state.rowKey);
  }).join("");
}

function renderBuilderTimeline(state) {
  if (!state.commander) {
    return renderEmptyState("主将を選ぶと、0～50秒でどの位置に効果が乗るかをまとめて表示します。");
  }

  if (!state.timelineRows.length) {
    return renderEmptyState("戦法を表示できる武将がまだ選ばれていません。");
  }

  const axisMarkup = Array.from(
    { length: BUILDER_TIMELINE_MAX_SECOND / 10 + 1 },
    (_, index) => `<span>${index * 10}秒</span>`
  ).join("");
  const rowMarkup = state.timelineRows
    .map((row) => {
      const currentEffects = row.effects.filter(
        (effect) =>
          state.previewSecond >= effect.clippedStart &&
          (state.previewSecond < effect.clippedEnd ||
            (effect.clippedEnd === BUILDER_TIMELINE_MAX_SECOND && state.previewSecond === BUILDER_TIMELINE_MAX_SECOND))
      );
      const isActive = currentEffects.length > 0;
      const barMarkup = row.segments
        .map(
          (segment) => `
            <span
              class="builder-timeline-bar tone-${escapeHtml(segment.tone || "utility")} ${segment.estimated ? "is-estimated" : ""}"
              style="--start:${segment.startSecond}; --end:${segment.endSecond}; --lane:0"
              title="${escapeHtml(
                segment.activeEffects
                  .map((effect) => `${effect.characterName} / ${effect.shortLabel} / ${effect.startSecond}～${effect.endSecond}秒`)
                  .join(" | ")
              )}"
              data-builder-preview-second="${segment.previewSecond}"
            >
              <span>${escapeHtml(segment.label)}</span>
            </span>
          `
        )
        .join("");
      const effectMetaMarkup = currentEffects.length
        ? currentEffects
            .map(
              (effect) => `
                <span class="timeline-effect-chip tone-${escapeHtml(effect.tone || "utility")}">
                  <strong>${escapeHtml(`${effect.characterName} / ${effect.shortLabel}`)}</strong>
                  <small>${escapeHtml(`${effect.startSecond}～${effect.endSecond}秒 / ${getBuilderEffectScopeLabel(effect)}`)}</small>
                </span>
              `
            )
            .join("")
        : `<span class="timeline-effect-chip is-empty"><strong>${escapeHtml(`${state.previewSecond}秒は効果なし`)}</strong><small>${escapeHtml(
            row.title
          )}</small></span>`;

      return `
        <button
          class="builder-timeline-row ${isActive ? "is-active" : ""}"
          type="button"
          data-builder-preview-second="${row.previewSecond}"
        >
          <div class="builder-timeline-row-head">
            <div>
              <div class="builder-timeline-source">${escapeHtml(row.subtitle || "対象スロット")}</div>
              <strong class="builder-timeline-title">${escapeHtml(row.title)}</strong>
            </div>
            <div class="builder-timeline-meta">
              <span>${escapeHtml(`${row.segments.length}区間`)}</span>
              <span>${escapeHtml(`累計 ${row.effects.length}件`)}</span>
              <span>${escapeHtml(isActive ? `${state.previewSecond}秒で ${currentEffects.length}件` : `${state.previewSecond}秒はなし`)}</span>
            </div>
          </div>
          <div class="builder-timeline-track" style="--lanes:1">
            ${barMarkup}
            <div class="builder-timeline-now" style="--at:${state.previewSecond}"></div>
          </div>
          <div class="builder-timeline-row-foot">${effectMetaMarkup}</div>
        </button>
      `;
    })
    .join("");

  return `
    <div class="builder-timeline-shell">
      <div class="builder-timeline-axis">${axisMarkup}</div>
      <div class="builder-timeline-rows">${rowMarkup}</div>
    </div>
  `;
}

function renderBuilderBoardLegend() {
  return `
    <span class="legend-chip"><span class="legend-swatch is-buff"></span>味方バフ</span>
    <span class="legend-chip"><span class="legend-swatch is-debuff"></span>敵デバフ / ダメージ</span>
    <span class="legend-chip"><span class="legend-swatch is-heal"></span>回復</span>
    <span class="legend-chip"><span class="legend-swatch is-utility"></span>補助 / 解除 / 悠然</span>
  `;
}

function renderBuilderBoardPanel(title, caption, cells, side) {
  return `
    <article class="builder-board-faction ${side === "ally" ? "is-friendly" : "is-enemy"}">
      <div class="builder-board-faction-head">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(caption)}</span>
      </div>
      <div class="builder-board-grid">
        ${cells
          .map((cell) => {
            const classes = [
              "builder-board-cell",
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
                    ? `<button type="button" data-builder-target-slot="${escapeHtml(cell.slotKey)}" aria-label="${escapeHtml(`${cell.slotLabel}を基準敵にする`)}"></button>`
                    : ""
                }
                ${
                  cell.occupied
                    ? `
                      <div class="builder-board-slot">${escapeHtml(cell.slotLabel)}</div>
                      <div class="builder-board-name">${escapeHtml(cell.displayTitle || "")}</div>
                      <div class="builder-board-note">${escapeHtml(cell.displayNote || "")}</div>
                      <div class="builder-board-effect">${escapeHtml(cell.effectSummary || "効果なし")}</div>
                    `
                    : `<div class="builder-board-note">空きマス</div>`
                }
              </div>
            `;
          })
          .join("")}
      </div>
    </article>
  `;
}

function renderBuilderBoard(state) {
  return `
    <div class="builder-board-stage">
      <div class="builder-board-stage-head">
        <strong>${escapeHtml(`${state.previewSecond}秒時点 / ${state.formation.label}`)}</strong>
        <span>${escapeHtml(`自部隊: ${state.formationSlot.label} / 基準敵: ${formationSlotLabelFor(state.targetSlotKey)}`)}</span>
      </div>
      <div class="builder-board-stage-grid">
        ${renderBuilderBoardPanel("味方盤面", "自部隊を含む十字基準の5枠", state.boardCells.allyCells, "ally")}
        ${renderBuilderBoardPanel("敵盤面", "敵マスを押すと単体対象の基準を変更", state.boardCells.enemyCells, "enemy")}
      </div>
    </div>
  `;
}

function renderBuilderActiveEffects(state) {
  if (!state.activeEffects.length) {
    return `
      <div class="builder-effect-stream">
        <div class="builder-effect-stream-head">
          <strong>${escapeHtml(`${state.previewSecond}秒時点の継続効果 0件`)}</strong>
          <span>この秒には残っているバフ / デバフはありません。</span>
        </div>
      </div>
    `;
  }

  const items = state.activeEffects
    .map((effect) => {
      const targetSlots = resolveBuilderEffectTargetSlots(
        effect,
        state.formation,
        state.formationSlot.key,
        state.targetSlotKey
      )
        .map((slotKey) => formationSlotLabelFor(slotKey))
        .join(" / ");

      return `
        <article class="builder-effect-item tone-${escapeHtml(effect.tone || "utility")}">
          <div class="builder-effect-item-head">
            <strong>${escapeHtml(`${effect.characterName} / ${effect.shortLabel}`)}</strong>
            <span>${escapeHtml(`${effect.startSecond}～${effect.endSecond}秒`)}</span>
          </div>
          <div class="army-list-row">
            <span>対象</span>
            <span>${escapeHtml(`${effect.side === "ally" ? "味方" : "敵"} / ${getBuilderEffectScopeLabel(effect)} / ${targetSlots}`)}</span>
          </div>
          <div class="army-list-row">
            <span>連鎖率</span>
            <span>${escapeHtml(effect.sourceLabel === "主将" ? "100% / 主将" : formatPercent(effect.activationRate))}</span>
          </div>
          <div class="army-list-row">
            <span>内容</span>
            <span>${escapeHtml(effect.text)}</span>
          </div>
        </article>
      `;
    })
    .join("");

  return `
    <div class="builder-effect-stream">
      <div class="builder-effect-stream-head">
        <strong>${escapeHtml(`${state.previewSecond}秒時点の継続効果 ${state.activeEffects.length}件`)}</strong>
        <span>タイムライン行と敵盤面を押すと表示が連動します。</span>
      </div>
      ${items}
    </div>
  `;
}

function renderBuilderView() {
  if (!elements.builderView) {
    return;
  }

  const state = buildBuilderState();
  const validationMessages = [];

  if (state.duplicateNames.length) {
    validationMessages.push(
      `重複武将: ${state.duplicateNames.map((row) => `${row.name} ×${row.count}`).join(" / ")}`
    );
  }

  if (!state.commander && state.selectedEntries.length) {
    validationMessages.push("主将を選ぶと連鎖率とタイムラインを計算できます。");
  }

  elements.builderSummary.textContent = formatSummaryText(
    [
      `陣形: ${state.formation.label}`,
      `位置: ${state.formationSlot.label}`,
      `列: ${builderRowLabelFor(state.rowKey)}`,
      `主将: ${state.commander?.name ?? "未選択"}`,
      `選択枠: ${state.selectedEntries.length}/${BUILDER_SLOT_DEFS.length}`,
      `対象位置: ${state.timelineRows.length}マス`,
      `現在: ${state.previewSecond}秒`
    ],
    "編成条件を指定してください。"
  );
  setBuilderValidation(validationMessages.join(" / "));
  elements.builderTimelineCount.textContent = `0～${BUILDER_TIMELINE_MAX_SECOND}秒 / ${state.timelineRows.length}マス`;
  const timelineSection = elements.builderTimeline?.closest(".result-section");
  const boardSection = elements.builderBoardGrid?.closest(".result-section");
  const activeEffectsCard = elements.builderActiveEffects?.closest(".module-card");
  if (timelineSection) {
    const heading = timelineSection.querySelector("h2");
    const description = timelineSection.querySelector(".result-header p");
    if (heading) {
      heading.textContent = "0～50秒の効果帯";
    }
    if (description) {
      description.textContent = "戦法ごとではなく、味方3×3と敵3×3のどこに何秒から何秒まで効果が残るかを位置別にまとめます。";
    }
  }
  if (boardSection) {
    const heading = boardSection.querySelector("h2");
    const description = boardSection.querySelector(".result-header p");
    if (heading) {
      heading.textContent = "盤面プレビュー";
    }
    if (description) {
      description.textContent = "選択中の秒で、味方盤面と敵盤面のどこに効果が残っているかを確認します。";
    }
  }
  if (activeEffectsCard) {
    const heading = activeEffectsCard.querySelector("h2");
    if (heading) {
      heading.textContent = "その秒の継続効果";
    }
  }
  if (elements.builderPreviewSecondLabel) {
    elements.builderPreviewSecondLabel.textContent = `${state.previewSecond}秒時点の盤面と継続効果を表示します。効果帯を押すとその秒へ移動します。`;
  }
  if (elements.builderBoardLegend) {
    elements.builderBoardLegend.innerHTML = renderBuilderBoardLegend();
  }
  elements.builderTimeline.innerHTML = renderBuilderTimeline(state);
  elements.builderBoardGrid.innerHTML = renderBuilderBoard(state);
  elements.builderActiveEffects.innerHTML = renderBuilderActiveEffects(state);
  elements.builderOverviewGrid.innerHTML = renderBuilderOverview(state);
  elements.builderSlotGrid.innerHTML = BUILDER_SLOT_DEFS.map((slot) => {
    const entry = state.slotEntries.find((row) => row.key === slot.key);
    return renderBuilderSlotCard(entry, state.rowKey);
  }).join("");
}

function resetBuilderView() {
  if (!elements.builderView) {
    return;
  }

  elements.builderFormation.value = FORMATION_DEFS[0].key;
  populateBuilderFormationSlotOptions();
  populateBuilderTargetSlotOptions();
  elements.builderFormationSlot.value = FORMATION_DEFS[0].slots[0].key;
  elements.builderTargetSlot.value = FORMATION_DEFS[0].slots[0].key;
  elements.builderPreviewSecond.value = "20";
  Object.values(getBuilderSlotInputs()).forEach((input) => {
    if (input) {
      input.value = "";
    }
  });
  Object.values(getBuilderToggleMap()).forEach((input) => {
    if (input) {
      input.checked = true;
    }
  });
  renderBuilderView();
}

function loadBuilderGuideFormation() {
  if (!elements.builderView) {
    return;
  }

  const commander = characterByName[elements.builderCommander?.value] ?? null;
  if (!commander) {
    setBuilderValidation("おすすめ編成を読み込む前に主将を選んでください。");
    return;
  }

  const slotInputs = getBuilderSlotInputs();
  const placementMap = Object.fromEntries(
    (commander.guide?.latestFormation?.placements ?? []).map((row) => [row.slot, row.name])
  );
  const slotByLabel = {
    主将: "commander",
    副将1: "vice1",
    副将2: "vice2",
    補佐1: "aide1",
    補佐2: "aide2"
  };

  for (const [slotLabel, slotKey] of Object.entries(slotByLabel)) {
    if (!slotInputs[slotKey]) {
      continue;
    }

    const nextName = placementMap[slotLabel] ?? (slotKey === "commander" ? commander.name : "");
    slotInputs[slotKey].value = characterByName[nextName] ? nextName : "";
  }

  elements.builderFormation.value = elements.builderFormation.value || FORMATION_DEFS[0].key;
  populateBuilderFormationSlotOptions();
  populateBuilderTargetSlotOptions();
  elements.builderFormationSlot.value = guessBuilderFormationSlotFromGuide(commander, elements.builderFormation.value);
  elements.builderTargetSlot.value = elements.builderFormationSlot.value;

  renderBuilderView();
}

function openBuilderWithCommander(name) {
  if (!elements.builderCommander) {
    return;
  }

  elements.builderCommander.value = name;
  setActiveView("builder", { scrollToNav: true });
  renderBuilderView();
  pushHeroRecentEntry({
    type: "builder",
    value: name,
    label: `${name}で編成ツール`,
    summary: "編成ツールβへ移動"
  });
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
  const favoritesOnly = elements.characterFavoriteToggle?.dataset.active === "true";
  const selectedConditionKeys = getConditionKeysFromLabels(tags);

  const filtered = preparedCharacters.filter(
    (character) =>
      rarities.includes(character.rarity) &&
      types.includes(character.type) &&
      objectives.every((objective) => character.objectiveTags.includes(objective)) &&
      tags.every((tag) => character.displayTags.includes(tag)) &&
      features.every((feature) => character.featureTags.includes(feature)) &&
      (!favoritesOnly || isFavoriteCharacter(character.name)) &&
      keywordMatches(character.searchText, keyword)
  );

  const sorted = sortCharactersForDb(filtered, sortKey);
  const quickCards = [
    renderSlotQuickCard("主将候補", "commander", sorted),
    renderSlotQuickCard("副将候補", "vice", sorted),
    renderSlotQuickCard("補佐候補", "aide", sorted)
  ];

  elements.characterSummary.textContent = formatSummaryText(
    [
      keyword ? `全文: ${keyword}` : "",
      types.length !== TYPE_DEFS.length ? `タイプ: ${types.map(typeLabelFor).join(" / ")}` : "",
      objectives.length ? `目的: ${objectives.map(objectiveLabelFor).join(" / ")}` : "",
      tags.length ? `タグ: ${tags.join(" / ")}` : "",
      features.length ? `特徴: ${features.join(" / ")}` : "",
      favoritesOnly ? "お気に入りのみ" : "",
      rarities.length !== RARITY_DEFS.length ? `レアリティ: ${rarities.join(" / ")}` : "",
      `並び順: ${CHARACTER_SORT_MAP[sortKey]}`
    ].filter(Boolean),
    "武将DBでは、武将名、技能名、技能説明、個性、タグ、特徴を横断して検索できます。"
  );

  updateFavoriteToggleLabels();
  renderCharacterComparePanel();
  if (elements.characterQuickGrid) {
    elements.characterQuickGrid.innerHTML = quickCards.join("");
  }
  elements.characterCount.textContent = `${sorted.length}体`;
  elements.characterList.innerHTML = renderCharacterCards(sorted, {
    showTags: true,
    showPersonalities: true,
    showGuideInsights: true,
    showSeason3Info: true,
    searchKeyword: keyword,
    highlightedTags: [...tags, ...features],
    selectedConditionKeys,
    emptyMessage: "条件に一致する武将はいません。"
  });
}

function resetCharacterDb() {
  elements.characterKeyword.value = "";
  elements.characterSort.value = "rarityTenpu";
  setToggleButtonState(elements.characterFavoriteToggle, false);
  saveUiState({ characterFavoritesOnly: false });
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
  const favoritesOnly = elements.skillFavoriteToggle?.dataset.active === "true";

  const filtered = preparedSkills.filter(
    (skill) =>
      conditions.every((condition) => skill.conditions.includes(condition)) &&
      effects.every((effect) => skill.featureTags.includes(effect)) &&
      (!favoritesOnly || isFavoriteSkill(skill.name)) &&
      keywordMatches(skill.searchText, keyword)
  );

  const sorted = sortSkillsForDb(filtered, sortKey);

  elements.skillSummary.textContent = formatSummaryText(
    [
      keyword ? `全文: ${keyword}` : "",
      conditions.length ? `条件: ${conditions.map(conditionLabelFor).join(" / ")}` : "",
      effects.length ? `効果種別: ${effects.map((effect) => SKILL_EFFECT_MAP[effect] ?? effect).join(" / ")}` : "",
      favoritesOnly ? "お気に入りのみ" : "",
      `並び順: ${SKILL_SORT_MAP[sortKey]}`
    ].filter(Boolean),
    "技能DBでは、技能名、効果文、所持武将までまとめて検索できます。"
  );

  updateFavoriteToggleLabels();
  elements.skillDbCount.textContent = `${sorted.length}件`;
  elements.skillList.innerHTML = renderSkillCards(sorted, "条件に一致する技能はありません。", {
    searchKeyword: keyword
  });
}

function resetSkillDb() {
  elements.skillKeyword.value = "";
  elements.skillSort.value = "order";
  setToggleButtonState(elements.skillFavoriteToggle, false);
  saveUiState({ skillFavoritesOnly: false });
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

function renderSlotQuickCard(title, slotKey, candidates) {
  const list = [...candidates]
    .sort((left, right) => right.slotFit.scores[slotKey] - left.slotFit.scores[slotKey] || compareCharactersBase(left, right))
    .slice(0, 3);

  if (!list.length) {
    return `
      <article class="quick-card">
        <h3>${escapeHtml(title)}</h3>
        <p>今の条件では候補がいません。</p>
      </article>
    `;
  }

  return `
    <article class="quick-card">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(SLOT_SUMMARY_HINTS[slotKey])}</p>
      <ul>
        ${list
          .map(
            (character) => `
              <li>
                <button type="button" class="holder-button" data-open-character="${escapeHtml(character.name)}">
                  ${escapeHtml(character.name)}
                </button>
                <strong>${character.slotFit.scores[slotKey]}</strong>
              </li>
            `
          )
          .join("")}
      </ul>
    </article>
  `;
}

function buildCharacterCompareContext(characters) {
  return {
    statMax: STAT_DEFS.reduce((result, stat) => {
      result[stat.key] = Math.max(...characters.map((character) => character?.[stat.key] ?? 0), 1);
      return result;
    }, {}),
    metricMax: {
      commander: Math.max(...characters.map((character) => character?.slotFit?.scores?.commander ?? 0), 1),
      vice: Math.max(...characters.map((character) => character?.slotFit?.scores?.vice ?? 0), 1),
      aide: Math.max(...characters.map((character) => character?.slotFit?.scores?.aide ?? 0), 1),
      topTwo: Math.max(...characters.map((character) => (character?.top1?.value ?? 0) + (character?.top2?.value ?? 0)), 1)
    }
  };
}

function renderCompareRadar(character, context) {
  const size = 148;
  const center = size / 2;
  const radius = 54;
  const count = STAT_DEFS.length;
  const labelRadius = radius + 18;
  const rings = [0.33, 0.66, 1];

  function pointFor(index, ratio) {
    const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
    return {
      x: center + Math.cos(angle) * radius * ratio,
      y: center + Math.sin(angle) * radius * ratio
    };
  }

  const grids = rings
    .map((ring) =>
      STAT_DEFS.map((_, index) => {
        const point = pointFor(index, ring);
        return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
      }).join(" ")
    )
    .map((points) => `<polygon class="compare-radar-grid" points="${points}" />`)
    .join("");
  const spokes = STAT_DEFS.map((_, index) => {
    const point = pointFor(index, 1);
    return `<line class="compare-radar-spoke" x1="${center}" y1="${center}" x2="${point.x.toFixed(1)}" y2="${point.y.toFixed(1)}" />`;
  }).join("");
  const polygon = STAT_DEFS.map((stat, index) => {
    const point = pointFor(index, (character[stat.key] ?? 0) / Math.max(context.statMax[stat.key] ?? 1, 1));
    return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
  }).join(" ");
  const labels = STAT_DEFS.map((stat, index) => {
    const point = pointFor(index, labelRadius / radius);
    return `<text class="compare-radar-label" x="${point.x.toFixed(1)}" y="${point.y.toFixed(1)}" text-anchor="middle">${escapeHtml(stat.label)}</text>`;
  }).join("");

  return `
    <div class="compare-radar-wrap" aria-hidden="true">
      <svg class="compare-radar" viewBox="0 0 ${size} ${size}">
        ${grids}
        ${spokes}
        <polygon class="compare-radar-shape" points="${polygon}" />
        <circle class="compare-radar-core" cx="${center}" cy="${center}" r="3.5" />
        ${labels}
      </svg>
    </div>
  `;
}

function renderCompareMetricCell(label, value, isBest = false) {
  return `
    <div class="${isBest ? "is-best" : ""}">
      <dt>${escapeHtml(label)}</dt>
      <dd>${value}</dd>
    </div>
  `;
}

function renderCompareObjectiveBlock(character) {
  if (character.season3?.objectiveScores) {
    const objectiveMarkup = Object.entries(character.season3.objectiveScores)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(
        ([objectiveKey, score]) => renderVisualBadge("objective", objectiveKey, `${objectiveLabelFor(objectiveKey)} ${score}`)
      )
      .join("");
    return `<div class="meta-chip-list">${objectiveMarkup}</div>`;
  }

  if (character.objectiveTags.length) {
    return `
      <div class="meta-chip-list">
        ${character.objectiveTags.map((objectiveKey) => renderVisualBadge("objective", objectiveKey, objectiveLabelFor(objectiveKey))).join("")}
      </div>
    `;
  }

  return `<p class="compare-note">用途タグは未整理です。</p>`;
}

function renderCharacterCompareCard(character, context) {
  const note =
    character.season3?.roleSummary ||
    character.guide?.evaluationPoints?.[0] ||
    character.slotFit.reasons[character.slotFit.bestKey][0] ||
    "";
  const topTwoValue = character.top1.value + character.top2.value;

  return `
    <article class="compare-card">
      <div class="compare-card-head">
        <div class="compare-card-id">
          <img class="compare-thumb" src="${escapeHtml(character.imageUrl)}" alt="${escapeHtml(character.name)}" loading="lazy">
          <div>
            <h3>${escapeHtml(character.name)}</h3>
            <p class="subline">${escapeHtml(character.rarity)} / ${escapeHtml(character.type || "-")}タイプ / 天賦 ${character.tenpu}</p>
          </div>
        </div>
        <button
          type="button"
          class="favorite-button"
          data-toggle-compare-character="${escapeHtml(character.name)}"
          aria-pressed="true"
        >
          外す
        </button>
      </div>
      <div class="meta-chip-list">
        ${renderVisualBadge("type", character.type || "-", `${character.type || "-"}タイプ`)}
        <span class="meta-chip is-highlight">${escapeHtml(character.slotFit.sorted[0].label)} ${character.slotFit.sorted[0].score}</span>
        <span class="meta-chip">${escapeHtml(character.slotFit.sorted[1].label)} ${character.slotFit.sorted[1].score}</span>
        <span class="meta-chip">基礎連鎖率 ${escapeHtml(formatPercent(character.chainBase * 100))}</span>
      </div>
      ${renderCompareRadar(character, context)}
      <dl class="compare-metric-grid">
        ${renderCompareMetricCell("主将", character.slotFit.scores.commander, character.slotFit.scores.commander >= context.metricMax.commander)}
        ${renderCompareMetricCell("副将", character.slotFit.scores.vice, character.slotFit.scores.vice >= context.metricMax.vice)}
        ${renderCompareMetricCell("補佐", character.slotFit.scores.aide, character.slotFit.scores.aide >= context.metricMax.aide)}
        ${renderCompareMetricCell("上位2値", topTwoValue, topTwoValue >= context.metricMax.topTwo)}
      </dl>
      <div class="compare-stat-list">
        ${STAT_DEFS.map((stat) => {
          const isBest = (character[stat.key] ?? 0) >= (context.statMax[stat.key] ?? 0);
          return `
            <div class="compare-stat-row ${isBest ? "is-best" : ""}">
              <span>${renderVisualBadge("stat", stat.key, stat.label, { compact: true })}</span>
              <strong>${character[stat.key]}</strong>
            </div>
          `;
        }).join("")}
      </div>
      <p class="compare-note">1位 ${escapeHtml(character.top1.label)} ${character.top1.value} / 2位 ${escapeHtml(character.top2.label)} ${character.top2.value}</p>
      ${renderCompareObjectiveBlock(character)}
      <div class="meta-chip-list">
        ${character.featureTags.slice(0, 5).map((feature) => renderVisualBadge("feature", feature, feature)).join("")}
      </div>
      <p class="compare-note">${escapeHtml(note)}</p>
      <div class="compare-actions">
        <button type="button" class="mini-button" data-use-builder-commander="${escapeHtml(character.name)}">編成へ送る</button>
        <button type="button" class="mini-button" data-use-synergy-reference="${escapeHtml(character.name)}">相性を見る</button>
      </div>
    </article>
  `;
}

function renderCharacterComparePanel() {
  if (!elements.characterCompareList || !elements.characterCompareSummary || !elements.characterCompareCount) {
    return;
  }

  const compared = getComparedCharacterNames()
    .map((name) => characterByName[name])
    .filter(Boolean);
  const compareContext = buildCharacterCompareContext(compared);

  elements.characterCompareCount.textContent = `${compared.length}/3`;
  elements.characterCompareSummary.textContent = compared.length
    ? "主将 / 副将 / 補佐適性に加えて、レーダーと最大値ハイライトで差分を見比べられます。"
    : "カードの「比較に追加」で最大3体まで横並び比較できます。";

  elements.characterCompareList.innerHTML = compared.length
    ? compared.map((character) => renderCharacterCompareCard(character, compareContext)).join("")
    : renderEmptyState("比較したい武将を追加すると、ここに差分を表示します。");
}

function updateFavoriteToggleLabels() {
  if (elements.characterFavoriteToggle) {
    const active = elements.characterFavoriteToggle.dataset.active === "true";
    const count = getFavoriteCharacterNames().length;
    elements.characterFavoriteToggle.textContent = active
      ? `お気に入りのみ ${count}`
      : `お気に入りを見る ${count}`;
  }

  if (elements.skillFavoriteToggle) {
    const active = elements.skillFavoriteToggle.dataset.active === "true";
    const count = getFavoriteSkillNames().length;
    elements.skillFavoriteToggle.textContent = active
      ? `お気に入りのみ ${count}`
      : `お気に入りを見る ${count}`;
  }
}

function applyResearchPreset(presetKey) {
  const presetLabels = {
    commander: "主将候補",
    vice: "副将候補",
    aide: "補佐候補",
    siege: "攻城対物",
    srAide: "SR補助"
  };

  switch (presetKey) {
    case "commander":
      resetCharacterDb();
      elements.characterSort.value = "commanderFit";
      setActiveView("character", { scrollToNav: true });
      renderCharacterDb();
      break;
    case "vice":
      resetCharacterDb();
      elements.characterSort.value = "viceFit";
      setActiveView("character", { scrollToNav: true });
      renderCharacterDb();
      break;
    case "aide":
      resetCharacterDb();
      elements.characterSort.value = "aideFit";
      setActiveView("character", { scrollToNav: true });
      renderCharacterDb();
      break;
    case "siege":
      resetCharacterDb();
      elements.characterSort.value = "viceFit";
      setCheckedValuesByName("db-objective", ["siege"]);
      setCheckedValuesByName("db-feature", ["対物"]);
      setActiveView("character", { scrollToNav: true });
      renderCharacterDb();
      break;
    case "srAide":
      resetCharacterDb();
      elements.characterSort.value = "aideFit";
      setCheckedValuesByName("db-rarity", ["SR"]);
      setActiveView("character", { scrollToNav: true });
      renderCharacterDb();
      break;
    default:
      return;
  }

  pushHeroRecentEntry({
    type: "shortcut",
    value: `preset:${presetKey}`,
    label: `${presetLabels[presetKey] ?? presetKey}プリセット`,
    summary: "研究ベースの絞り込みを適用"
  });
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
    return renderEmptyState("S3コア提案データがありません。");
  }

  const commanderChainText = core.partners.length
    ? core.partners
        .map((partner) => `${partner.name} ${formatPercent(getChainStats(core.commander, partner).rate)}`)
        .join(" / ")
    : "連携候補なし";

  return `
    <article class="quick-card">
      <h3>${escapeHtml(objectiveLabelFor(core.objectiveKey))}コア</h3>
      <p>${escapeHtml(core.commander.name)} を軸にした S3コア案</p>
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
  elements.s3RevisionLabel.textContent = formatDataRevisionLabel(SEASON3.masterRevision);
  elements.s3ContextNotes.innerHTML = SEASON3.contextNotes
    .map((note) => `<li>${escapeHtml(note)}</li>`)
    .join("");

  elements.s3Summary.textContent = formatSummaryText(
    [
      `目的: ${objectiveLabel}`,
      `優先スロット: ${S3_SLOT_FOCUS_DEFS.find((item) => item.key === slotFocus)?.label ?? slotFocus}`,
      `データ版: ${SEASON3.masterRevision}`
    ],
    "S3の注目候補を表示しています。"
  );
  elements.s3HeroCount.textContent = `${sortedHeroes.length}体`;
  elements.s3HeroList.innerHTML = renderCharacterCards(sortedHeroes, {
    showTags: true,
    showSeason3Info: true,
    showActions: true,
    showBattleArt: false,
    emptyMessage: "S3注目武将データがありません。"
  });
  elements.s3UpgradeGrid.innerHTML = topUpgrades.length
    ? topUpgrades.map((character) => renderS3UpgradeCard(character, objectiveKey, slotFocus)).join("")
    : renderEmptyState("今週のおすすめ強化先はありません。");
  elements.s3SkillCount.textContent = `${season3FeaturedSkills.length}件`;
  elements.s3SkillList.innerHTML = renderSkillCards(
    season3FeaturedSkills,
    "S3注目技能データがありません。"
  );
  elements.s3WeightGrid.innerHTML = [
    renderSeason3WeightCard(
      `${objectiveLabel}の戦闘軸`,
      "目的別スコアの重みを表示しています。",
      objectiveWeights
    ),
    renderSeason3WeightCard(
      "部隊スコア軸",
      "部隊スコアの重みを表示しています。",
      unitWeights
    ),
    renderSeason3WeightCard(
      "軍勢スコア軸",
      "軍勢スコアの重みを表示しています。",
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

function getCurrentViewKey() {
  return (
    elements.viewButtons.find((button) => button.classList.contains("is-active"))?.dataset.viewTab ||
    window.location.hash.replace(/^#/, "") ||
    getUiState().activeView ||
    "power"
  );
}

function updateTrustSnapshot() {
  if (!elements.trustSnapshot) {
    return;
  }

  const parts = [
    `シーズン: ${SEASON3.seasonLabel || "-"}`,
    formatDataRevisionLabel(SEASON3.masterRevision),
    `更新基準 ${SEASON3.updatedAt || "-"}`
  ];

  elements.trustSnapshot.textContent = parts.join(" / ");
}

function updateShareScopeNote(viewKey = getCurrentViewKey()) {
  if (!elements.shareScopeNote) {
    return;
  }

  const meta = VIEW_META[viewKey] ?? VIEW_META.power;
  const hint = SHARE_VIEW_HINTS[viewKey] ?? SHARE_VIEW_HINTS.power;
  elements.shareScopeNote.textContent = `${meta.label}: ${hint}`;
}

let statusToastTimer = null;

function showStatusToast(message) {
  if (!elements.statusToast || !message) {
    return;
  }

  elements.statusToast.textContent = message;
  elements.statusToast.classList.add("is-visible");

  if (statusToastTimer) {
    window.clearTimeout(statusToastTimer);
  }

  statusToastTimer = window.setTimeout(() => {
    elements.statusToast.classList.remove("is-visible");
  }, 2600);
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "readonly");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const succeeded = document.execCommand("copy");
  textarea.remove();
  return succeeded;
}

function downloadJsonFile(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  downloadBlobFile(filename, blob);
}

function downloadBlobFile(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function registerPwa() {
  const isLocalHost = /^(localhost|127\.0\.0\.1)$/u.test(window.location.hostname);
  if (!("serviceWorker" in navigator) || (window.location.protocol !== "https:" && !isLocalHost)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

function encodeJsonToBase64Url(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "");
}

function decodeJsonFromBase64Url(value) {
  const normalized = String(value ?? "").replace(/-/gu, "+").replace(/_/gu, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function arrayIfNonEmpty(values) {
  return values.length ? values : undefined;
}

function optionalSelection(values, defaults) {
  return values.join("|") === defaults.join("|") ? undefined : values;
}

function collectPowerShareState() {
  return {
    primary: elements.primaryStat.value || undefined,
    secondary: elements.secondaryStat.value || undefined,
    chainCommander: elements.chainCommander.value.trim() || undefined,
    chainSortEnabled: elements.chainSortEnabled.checked || undefined,
    rarities: optionalSelection(readCheckedValuesIn(elements.powerForm, "power-rarity"), defaultRarities),
    conditions: arrayIfNonEmpty(readCheckedValuesIn(elements.powerForm, "power-condition")),
    features: arrayIfNonEmpty(readCheckedValuesIn(elements.powerForm, "power-feature"))
  };
}

function collectCharacterShareState() {
  return {
    keyword: elements.characterKeyword.value.trim() || undefined,
    sortKey: elements.characterSort.value !== "rarityTenpu" ? elements.characterSort.value : undefined,
    rarities: optionalSelection(readCheckedValuesIn(elements.characterView, "db-rarity"), defaultRarities),
    types: optionalSelection(readCheckedValuesIn(elements.characterView, "db-type"), defaultTypes),
    objectives: arrayIfNonEmpty(readCheckedValuesIn(elements.characterView, "db-objective")),
    tags: arrayIfNonEmpty(readCheckedValuesIn(elements.characterView, "db-tag")),
    features: arrayIfNonEmpty(readCheckedValuesIn(elements.characterView, "db-feature")),
    favoritesOnly: elements.characterFavoriteToggle?.dataset.active === "true" || undefined,
    compare: arrayIfNonEmpty(getComparedCharacterNames())
  };
}

function collectSkillShareState() {
  return {
    keyword: elements.skillKeyword.value.trim() || undefined,
    sortKey: elements.skillSort.value !== "order" ? elements.skillSort.value : undefined,
    conditions: arrayIfNonEmpty(readCheckedValuesIn(elements.skillView, "skill-condition")),
    effects: arrayIfNonEmpty(readCheckedValuesIn(elements.skillView, "skill-effect")),
    favoritesOnly: elements.skillFavoriteToggle?.dataset.active === "true" || undefined
  };
}

function collectSynergyShareState() {
  return {
    commander: elements.synergyCommander.value.trim() || undefined,
    keyword: elements.synergyKeyword.value.trim() || undefined,
    rarities: optionalSelection(readCheckedValuesIn(elements.synergyView, "synergy-rarity"), defaultRarities),
    conditions: arrayIfNonEmpty(readCheckedValuesIn(elements.synergyView, "synergy-condition")),
    features: arrayIfNonEmpty(readCheckedValuesIn(elements.synergyView, "synergy-feature"))
  };
}

function collectBuilderShareState() {
  return {
    formation: elements.builderFormation?.value || undefined,
    formationSlot: elements.builderFormationSlot?.value || undefined,
    targetSlot: elements.builderTargetSlot?.value || undefined,
    previewSecond: elements.builderPreviewSecond?.value || undefined,
    commander: elements.builderCommander?.value || undefined,
    vice1: elements.builderVice1?.value || undefined,
    vice2: elements.builderVice2?.value || undefined,
    aide1: elements.builderAide1?.value || undefined,
    aide2: elements.builderAide2?.value || undefined,
    vice1Enabled: elements.builderVice1Enabled?.checked === false ? false : undefined,
    vice2Enabled: elements.builderVice2Enabled?.checked === false ? false : undefined
  };
}

function collectBoardShareState() {
  return {
    objective: elements.s3Objective?.value || undefined,
    slotFocus: elements.s3SlotFocus?.value || undefined
  };
}

function collectCurrentSharePayload() {
  const view = getCurrentViewKey();
  let state = {};

  switch (view) {
    case "power":
      state = collectPowerShareState();
      break;
    case "character":
      state = collectCharacterShareState();
      break;
    case "skill":
      state = collectSkillShareState();
      break;
    case "synergy":
      state = collectSynergyShareState();
      break;
    case "builder":
      state = collectBuilderShareState();
      break;
    case "army":
      state = window.KH_ARMY_SHARE_API?.collectShareState?.() ?? {};
      break;
    case "board":
      state = collectBoardShareState();
      break;
    default:
      state = {};
  }

  return {
    version: SHARE_PAYLOAD_VERSION,
    view,
    state
  };
}

function buildShareUrl(payload) {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set(SHARE_PARAM_KEY, encodeJsonToBase64Url(payload));
  url.hash = payload.view;
  return url.toString();
}

function readSharedPayloadFromLocation() {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get(SHARE_PARAM_KEY);
    if (!encoded) {
      return null;
    }

    const decoded = decodeJsonFromBase64Url(encoded);
    if (decoded?.version !== SHARE_PAYLOAD_VERSION || !VIEW_KEYS.includes(decoded.view)) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

function applyPowerShareState(state = {}) {
  resetPowerSearch();
  elements.primaryStat.value = state.primary ?? "";
  elements.secondaryStat.value = state.secondary ?? "";
  elements.chainCommander.value = state.chainCommander ?? "";
  elements.chainSortEnabled.checked = Boolean(state.chainSortEnabled);
  setCheckedValuesByName("power-rarity", state.rarities ?? defaultRarities);
  setCheckedValuesByName("power-condition", state.conditions ?? []);
  setCheckedValuesByName("power-feature", state.features ?? []);
  renderPowerResults();
}

function applyCharacterShareState(state = {}) {
  resetCharacterDb();
  elements.characterKeyword.value = state.keyword ?? "";
  elements.characterSort.value = state.sortKey ?? "rarityTenpu";
  setCheckedValuesByName("db-rarity", state.rarities ?? defaultRarities);
  setCheckedValuesByName("db-type", state.types ?? defaultTypes);
  setCheckedValuesByName("db-objective", state.objectives ?? []);
  setCheckedValuesByName("db-tag", state.tags ?? []);
  setCheckedValuesByName("db-feature", state.features ?? []);
  setToggleButtonState(elements.characterFavoriteToggle, Boolean(state.favoritesOnly));
  saveUiState({ characterFavoritesOnly: Boolean(state.favoritesOnly) });
  saveComparedCharacterNames(state.compare ?? []);
  renderCharacterDb();
}

function applySkillShareState(state = {}) {
  resetSkillDb();
  elements.skillKeyword.value = state.keyword ?? "";
  elements.skillSort.value = state.sortKey ?? "order";
  setCheckedValuesByName("skill-condition", state.conditions ?? []);
  setCheckedValuesByName("skill-effect", state.effects ?? []);
  setToggleButtonState(elements.skillFavoriteToggle, Boolean(state.favoritesOnly));
  saveUiState({ skillFavoritesOnly: Boolean(state.favoritesOnly) });
  renderSkillDb();
}

function applySynergyShareState(state = {}) {
  resetSynergy();
  elements.synergyCommander.value = state.commander ?? "";
  elements.synergyKeyword.value = state.keyword ?? "";
  setCheckedValuesByName("synergy-rarity", state.rarities ?? defaultRarities);
  setCheckedValuesByName("synergy-condition", state.conditions ?? []);
  setCheckedValuesByName("synergy-feature", state.features ?? []);
  renderSynergy();
}

function applyBuilderShareState(state = {}) {
  resetBuilderView();
  if (elements.builderFormation && state.formation) {
    elements.builderFormation.value = state.formation;
    populateBuilderFormationSlotOptions();
    populateBuilderTargetSlotOptions();
  }
  if (elements.builderFormationSlot) {
    elements.builderFormationSlot.value = state.formationSlot ?? elements.builderFormationSlot.value;
  }
  if (elements.builderTargetSlot) {
    elements.builderTargetSlot.value = state.targetSlot ?? elements.builderTargetSlot.value;
  }
  if (elements.builderPreviewSecond && state.previewSecond) {
    elements.builderPreviewSecond.value = state.previewSecond;
  }
  if (elements.builderCommander) {
    elements.builderCommander.value = state.commander ?? "";
  }
  if (elements.builderVice1) {
    elements.builderVice1.value = state.vice1 ?? "";
  }
  if (elements.builderVice2) {
    elements.builderVice2.value = state.vice2 ?? "";
  }
  if (elements.builderAide1) {
    elements.builderAide1.value = state.aide1 ?? "";
  }
  if (elements.builderAide2) {
    elements.builderAide2.value = state.aide2 ?? "";
  }
  if (elements.builderVice1Enabled) {
    elements.builderVice1Enabled.checked = state.vice1Enabled !== false;
  }
  if (elements.builderVice2Enabled) {
    elements.builderVice2Enabled.checked = state.vice2Enabled !== false;
  }
  renderBuilderView();
}

function applyBoardShareState(state = {}) {
  resetS3Board();
  if (elements.s3Objective && state.objective) {
    elements.s3Objective.value = state.objective;
  }
  if (elements.s3SlotFocus && state.slotFocus) {
    elements.s3SlotFocus.value = state.slotFocus;
  }
  renderFeatureBoard();
}

function applySharedPayload(payload, options = {}) {
  if (!payload || payload.version !== SHARE_PAYLOAD_VERSION || !VIEW_KEYS.includes(payload.view)) {
    return false;
  }

  if (payload.view === "army") {
    if (window.KH_ARMY_SHARE_API?.applyShareState) {
      window.KH_ARMY_SHARE_API.applyShareState(payload.state ?? {}, options);
      return true;
    }
    window.__KH_PENDING_SHARE_PAYLOAD = payload;
    return false;
  }

  switch (payload.view) {
    case "power":
      applyPowerShareState(payload.state);
      break;
    case "character":
      applyCharacterShareState(payload.state);
      break;
    case "skill":
      applySkillShareState(payload.state);
      break;
    case "synergy":
      applySynergyShareState(payload.state);
      break;
    case "builder":
      applyBuilderShareState(payload.state);
      break;
    case "board":
      applyBoardShareState(payload.state);
      break;
    default:
      return false;
  }

  setActiveView(payload.view, { updateHash: true });
  updateBackupMeta();

  if (options.showToast !== false) {
    showStatusToast("共有リンクの条件を復元しました。");
  }
  return true;
}

function updateBackupMeta() {
  if (!elements.backupMeta) {
    return;
  }

  const ownedCount = window.KH_ARMY_SHARE_API?.getOwnedCount?.() ?? 0;
  elements.backupMeta.textContent = formatSummaryText(
    [
      `お気に入り ${getFavoriteCharacterNames().length + getFavoriteSkillNames().length}件`,
      `比較 ${getComparedCharacterNames().length}体`,
      `最近使った項目 ${getHeroRecentEntries().length}件`,
      `手持ち ${ownedCount}体`
    ],
    "共有は現在のタブ条件、JSON はお気に入り・比較・最近使った項目・手持ち入力のバックアップに使えます。"
  );
}

function buildBackupPayload() {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    uiState: getUiState(),
    heroRecent: getHeroRecentEntries(),
    favoriteCharacters: getFavoriteCharacterNames(),
    favoriteSkills: getFavoriteSkillNames(),
    armyRoster: window.KH_ARMY_SHARE_API?.exportState?.() ?? null
  };
}

function refreshUiAfterExternalState(targetView) {
  renderHeroCommand();
  setToggleButtonState(elements.characterFavoriteToggle, Boolean(getUiState().characterFavoritesOnly));
  setToggleButtonState(elements.skillFavoriteToggle, Boolean(getUiState().skillFavoritesOnly));
  updateFavoriteToggleLabels();
  renderPowerResults();
  renderCharacterDb();
  renderSkillDb();
  renderSynergy();
  renderBuilderView();
  renderFeatureBoard();
  setActiveView(targetView || getUiState().activeView || "power", { updateHash: true });
  updateTrustSnapshot();
  updateShareScopeNote();
  updateBackupMeta();
}

async function copyCurrentStateLink() {
  const payload = collectCurrentSharePayload();
  const url = buildShareUrl(payload);
  await copyTextToClipboard(url);
  showStatusToast("現在の条件を共有リンクとしてコピーしました。");
}

function downloadBackup() {
  const stamp = new Date().toISOString().slice(0, 10);
  downloadJsonFile(`${BACKUP_FILE_PREFIX}-${stamp}.json`, buildBackupPayload());
  showStatusToast("JSON バックアップを書き出しました。");
}

function applyBackupPayload(payload) {
  if (payload?.version !== BACKUP_VERSION) {
    throw new Error("unsupported-backup-version");
  }

  writeStoredJson(UI_STATE_STORAGE_KEY, payload.uiState ?? {});
  writeStoredJson(HERO_RECENT_STORAGE_KEY, payload.heroRecent ?? []);
  writeStoredJson(FAVORITE_CHARACTERS_STORAGE_KEY, payload.favoriteCharacters ?? []);
  writeStoredJson(FAVORITE_SKILLS_STORAGE_KEY, payload.favoriteSkills ?? []);
  window.KH_ARMY_SHARE_API?.importState?.(payload.armyRoster ?? null, { rerender: false });

  refreshUiAfterExternalState(payload.uiState?.activeView ?? "power");
  if ((payload.uiState?.activeView ?? "") === "army") {
    window.KH_ARMY_SHARE_API?.refresh?.();
  }
  showStatusToast("JSON バックアップを読み込みました。");
}

async function importBackupFromFile(file) {
  if (!file) {
    return;
  }

  const text = await file.text();
  applyBackupPayload(JSON.parse(text));
}

function clearBrowserStoredData() {
  const confirmed = window.confirm(
    "お気に入り、比較、最近使った項目、手持ち入力などのブラウザ保存データを初期化します。続けますか？"
  );
  if (!confirmed) {
    return;
  }

  [
    UI_STATE_STORAGE_KEY,
    HERO_RECENT_STORAGE_KEY,
    FAVORITE_CHARACTERS_STORAGE_KEY,
    FAVORITE_SKILLS_STORAGE_KEY
  ].forEach((key) => window.localStorage.removeItem(key));

  window.KH_ARMY_SHARE_API?.importState?.(null, { rerender: false });

  resetPowerSearch();
  resetCharacterDb();
  resetSkillDb();
  resetSynergy();
  resetBuilderView();
  resetS3Board();
  refreshUiAfterExternalState("power");
  showStatusToast("ブラウザ保存データを初期化しました。");
}

function bindUtilityActions() {
  elements.copyStateLinkButton?.addEventListener("click", async () => {
    try {
      await copyCurrentStateLink();
    } catch (error) {
      showStatusToast("共有リンクのコピーに失敗しました。");
    }
  });

  elements.downloadBackupButton?.addEventListener("click", downloadBackup);
  elements.importBackupButton?.addEventListener("click", () => elements.backupImportInput?.click());
  elements.backupImportInput?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      await importBackupFromFile(file);
    } catch (error) {
      showStatusToast("JSON の読み込みに失敗しました。");
    } finally {
      event.target.value = "";
    }
  });
  elements.clearBrowserDataButton?.addEventListener("click", clearBrowserStoredData);
}

window.__KH_PENDING_SHARE_PAYLOAD = readSharedPayloadFromLocation();
window.KH_APP_API = {
  updateBackupMeta,
  showStatusToast,
  downloadBlobFile,
  applySharedPayload
};

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

  pushHeroRecentEntry({
    type: "skill",
    value: skillName,
    label: skillName,
    summary: `${conditionText} / 技能詳細`
  });
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
  setActiveView("character", { scrollToNav: true });
  renderCharacterDb();
  pushHeroRecentEntry({
    type: "character",
    value: name,
    label: name,
    summary: "武将DBで表示"
  });
}

function openSynergyWithReference(name) {
  elements.synergyCommander.value = name;
  setActiveView("synergy", { scrollToNav: true });
  renderSynergy();
  pushHeroRecentEntry({
    type: "synergy",
    value: name,
    label: `${name}相性`,
    summary: "相性検索で表示"
  });
}

function runHeroAction(actionType, value) {
  if (!value) {
    return;
  }

  switch (actionType) {
    case "view":
      setActiveView(value, { scrollToNav: true });
      pushHeroRecentEntry({
        type: "view",
        value,
        label: VIEW_META[value]?.label ?? value,
        summary: VIEW_META[value]?.summary ?? "画面へ移動"
      });
      return;
    case "character":
      openCharacterDb(value);
      return;
    case "skill":
      openSkillDialog(value);
      return;
    case "synergy":
      openSynergyWithReference(value);
      return;
    case "builder":
      openBuilderWithCommander(value.replace(/で編成ツール$/u, ""));
      return;
    case "shortcut":
      applyHeroShortcut(value);
      return;
    default:
      return;
  }
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
      const targetView = viewButton.dataset.switchView;
      setActiveView(targetView, { scrollToNav: true });
      pushHeroRecentEntry({
        type: "view",
        value: targetView,
        label: VIEW_META[targetView]?.label ?? targetView,
        summary: VIEW_META[targetView]?.summary ?? "画面へ移動"
      });
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
      return;
    }

    const builderButton = event.target.closest("[data-use-builder-commander]");
    if (builderButton) {
      openBuilderWithCommander(builderButton.dataset.useBuilderCommander);
      return;
    }

    const compareButton = event.target.closest("[data-toggle-compare-character]");
    if (compareButton) {
      toggleComparedCharacter(compareButton.dataset.toggleCompareCharacter);
      renderCharacterDb();
      return;
    }

    const presetButton = event.target.closest("[data-apply-research-preset]");
    if (presetButton) {
      applyResearchPreset(presetButton.dataset.applyResearchPreset);
      return;
    }

    const clearCompareButton = event.target.closest("#characterCompareResetButton");
    if (clearCompareButton) {
      clearComparedCharacters();
      renderCharacterDb();
      return;
    }

    const favoriteToggleButton = event.target.closest("[data-toggle-favorite-kind]");
    if (favoriteToggleButton) {
      const kind = favoriteToggleButton.dataset.toggleFavoriteKind;
      const value = favoriteToggleButton.dataset.toggleFavoriteValue;
      if (kind === "character") {
        toggleFavoriteCharacter(value);
      } else if (kind === "skill") {
        toggleFavoriteSkill(value);
      }
      renderCharacterDb();
      renderSkillDb();
      return;
    }

    const heroActionButton = event.target.closest("[data-hero-action]");
    if (heroActionButton) {
      runHeroAction(heroActionButton.dataset.heroAction, heroActionButton.dataset.heroValue);
      return;
    }

    const heroShortcutButton = event.target.closest("[data-hero-shortcut]");
    if (heroShortcutButton) {
      applyHeroShortcut(heroShortcutButton.dataset.heroShortcut);
      return;
    }

    const scrollTopButton = event.target.closest("[data-scroll-top]");
    if (scrollTopButton) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (event.target.closest("#characterFavoriteToggle")) {
      const active = elements.characterFavoriteToggle?.dataset.active === "true";
      setToggleButtonState(elements.characterFavoriteToggle, !active);
      saveUiState({ characterFavoritesOnly: !active });
      renderCharacterDb();
      return;
    }

    if (event.target.closest("#skillFavoriteToggle")) {
      const active = elements.skillFavoriteToggle?.dataset.active === "true";
      setToggleButtonState(elements.skillFavoriteToggle, !active);
      saveUiState({ skillFavoritesOnly: !active });
      renderSkillDb();
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
      setActiveView(button.dataset.viewTab, { scrollToNav: true });
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
  populateSimpleSelect(elements.builderFormation, FORMATION_SELECT_DEFS, FORMATION_DEFS[0].key);
  populateBuilderFormationSlotOptions();
  populateBuilderTargetSlotOptions();
  populateCharacterSelect(elements.builderCommander, "主将を選択");
  populateCharacterSelect(elements.builderVice1, "副将1を選択");
  populateCharacterSelect(elements.builderVice2, "副将2を選択");
  populateCharacterSelect(elements.builderAide1, "補佐1を選択");
  populateCharacterSelect(elements.builderAide2, "補佐2を選択");

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
  bindHeroCommand();
  bindUtilityActions();
  registerPwa();
  setToggleButtonState(elements.characterFavoriteToggle, Boolean(getUiState().characterFavoritesOnly));
  setToggleButtonState(elements.skillFavoriteToggle, Boolean(getUiState().skillFavoritesOnly));
  updateFavoriteToggleLabels();
  updateTrustSnapshot();

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
  if (elements.builderView) {
    elements.builderFormation?.addEventListener("change", () => {
      populateBuilderFormationSlotOptions();
      populateBuilderTargetSlotOptions();
      renderBuilderView();
    });
    elements.builderPreviewSecond?.addEventListener("input", renderBuilderView);
    elements.builderView.addEventListener("change", renderBuilderView);
    elements.builderView.addEventListener("click", (event) => {
      const previewButton = event.target.closest("[data-builder-preview-second]");
      if (previewButton && elements.builderPreviewSecond) {
        elements.builderPreviewSecond.value = previewButton.dataset.builderPreviewSecond;
        renderBuilderView();
        return;
      }

      const targetButton = event.target.closest("[data-builder-target-slot]");
      if (!targetButton || !elements.builderTargetSlot) {
        return;
      }
      elements.builderTargetSlot.value = targetButton.dataset.builderTargetSlot;
      renderBuilderView();
    });
    elements.builderLoadGuideButton?.addEventListener("click", loadBuilderGuideFormation);
    elements.builderResetButton?.addEventListener("click", resetBuilderView);
  }
  elements.s3Objective.addEventListener("change", renderFeatureBoard);
  elements.s3SlotFocus.addEventListener("change", renderFeatureBoard);
  elements.s3ResetButton.addEventListener("click", resetS3Board);

  renderPowerEmptyState();
  syncSecondaryOptions();
  renderCharacterDb();
  renderSkillDb();
  renderSynergy();
  renderBuilderView();
  renderFeatureBoard();

  const initialView =
    window.__KH_PENDING_SHARE_PAYLOAD?.view ||
    window.location.hash.replace(/^#/, "") ||
    getUiState().activeView ||
    "power";
  setActiveView(initialView, { updateHash: false });
  window.setTimeout(updateBackupMeta, 0);

  if (window.__KH_PENDING_SHARE_PAYLOAD && window.__KH_PENDING_SHARE_PAYLOAD.view !== "army") {
    applySharedPayload(window.__KH_PENDING_SHARE_PAYLOAD, { showToast: true });
    window.__KH_PENDING_SHARE_PAYLOAD = null;
  }
}

boot();
