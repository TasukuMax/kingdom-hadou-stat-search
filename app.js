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

const VIEW_KEYS = ["power", "character", "skill", "synergy", "builder", "army", "board"];

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

const ARMY_SEED_MODE_DEFS = [
  { key: "best", label: "最適枠で採用" },
  { key: "commander", label: "主将固定" },
  { key: "vice", label: "副将固定" },
  { key: "aide", label: "補佐固定" }
];

const ARMY_CONCEPT_DEFS = [
  {
    key: "balanced",
    label: "対軍勢バランス",
    description: "主将の質、連鎖率、妨害、耐久の4点を均等に取りにいく基準構成です。",
    primaryObjective: "pvp",
    objectiveMix: { pvp: 0.65, defense: 0.2, siege: 0.1, gathering: 0.05 },
    recommendedFormation: "基本陣参",
    formationReason: "5部隊の役割を崩さず、横断バフと妨害を扱いやすい陣形です。",
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
    key: "siege",
    label: "対物特化",
    description: "対物、攻速、軍勢バフを重ね、城や砦を削る速度を優先する軍勢です。",
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
    label: "反撃特化",
    description: "反撃強化と被ダメ軽減を厚くして、殴られながら返す軍勢です。",
    primaryObjective: "defense",
    objectiveMix: { defense: 0.55, pvp: 0.35, siege: 0.1, gathering: 0 },
    recommendedFormation: "鶴翼陣参",
    formationReason: "耐久寄りの軍勢に噛み合いやすく、反撃支援と前列保持を両立しやすい陣形です。",
    rowTarget: { front: 2, middle: 1, back: 2 },
    commanderTypeBias: { 護: 10, 闘: 8, 妨: 5, 援: 4 },
    orderWeights: { 早い: 0.86, 普通: 1, 遅い: 0.74 },
    featureWeights: {
      反撃: 22,
      被ダメ軽減: 16,
      堅固: 12,
      回復: 11,
      強化効果付与: 10,
      弱化解除: 8,
      デバフ無効: 8
    },
    tagWeights: {
      "role.counter-enabler": 22,
      "def.damage-cut": 16,
      "role.frontline-anchor": 14,
      "support.heal": 10,
      "def.debuff-immunity": 8
    },
    required: [
      { tag: "role.counter-enabler", minUnits: 2, weight: 1 },
      { tag: "def.damage-cut", minUnits: 2, weight: 0.9 },
      { tag: "role.frontline-anchor", minUnits: 2, weight: 0.9 }
    ],
    preferred: [
      { tag: "support.heal", minUnits: 1, weight: 0.55 },
      { tag: "support.cleanse", minUnits: 1, weight: 0.45 }
    ]
  },
  {
    key: "debuff",
    label: "弱化妨害",
    description: "恐怖、攻速低下、強化解除を重ねて相手のテンポを崩す軍勢です。",
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
    label: "防衛耐久",
    description: "前列維持、被ダメ軽減、回復、解除を積み、長期戦で崩れにくくします。",
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

  builderView: document.querySelector("#view-builder"),
  builderRow: document.querySelector("#builderRow"),
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
  builderOverviewGrid: document.querySelector("#builderOverviewGrid"),
  builderSlotGrid: document.querySelector("#builderSlotGrid"),

  armyView: document.querySelector("#view-army"),
  armySeedCharacter: document.querySelector("#armySeedCharacter"),
  armySeedMode: document.querySelector("#armySeedMode"),
  armyConcept: document.querySelector("#armyConcept"),
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
  armyOverviewGrid: document.querySelector("#armyOverviewGrid"),
  armyUnitGrid: document.querySelector("#armyUnitGrid"),
  armyAlternativeGrid: document.querySelector("#armyAlternativeGrid"),
  armyReserveGrid: document.querySelector("#armyReserveGrid"),

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
  const scrollToNav = options.scrollToNav === true;

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
  const showTags = options.showTags ?? false;
  const showPersonalities = options.showPersonalities ?? false;
  const showActions = options.showActions ?? true;
  const showSeason3Info = options.showSeason3Info ?? false;
  const showBattleArt = options.showBattleArt ?? true;
  const showGuideInsights = options.showGuideInsights ?? false;
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
          ${showBattleArt ? renderBattleArtPreview(character) : ""}
          ${renderFeatureTags(character, highlightedTags)}
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

function builderSlotLabelFor(slotKey) {
  return BUILDER_SLOT_MAP[slotKey]?.label ?? slotKey;
}

function builderRowLabelFor(rowKey) {
  return BUILDER_ROW_MAP[rowKey]?.label ?? rowKey;
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

function buildBuilderState() {
  const rowKey = elements.builderRow?.value || "front";
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
          : []
    }))
    .sort((left, right) => left.orderScore - right.orderScore || compareCharactersBase(left.character, right.character));

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
  overviewNotes.push("タイムラインは秒数ではなく、GameWith の連鎖順ルールを 1〜9 の順番に並べています。");

  return {
    rowKey,
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
    overviewNotes: uniqueValues(overviewNotes)
  };
}

function renderBuilderTimeline(state) {
  if (!state.commander) {
    return renderEmptyState("主将を選ぶと、主将→副将の連鎖順タイムラインを表示します。");
  }

  if (!state.timelineEntries.length) {
    return renderEmptyState("戦法を表示できる武将がまだ選ばれていません。");
  }

  const axisMarkup = Array.from({ length: 9 }, (_, index) => `<span>${index + 1}</span>`).join("");
  const rowMarkup = state.timelineEntries
    .map((entry) => {
      const rowBoostText = entry.character.battleArtMeta?.rowBoosts.includes(state.rowKey)
        ? `${builderRowLabelFor(state.rowKey)}で効果拡張`
        : "列依存なし";
      const chainText =
        entry.key === "commander"
          ? "主将戦法は必ず発動"
          : `連鎖率 ${formatPercent(entry.chainStats?.rate ?? 0)} / ${rowBoostText}`;

      return `
        <article class="timeline-row-card">
          <div class="timeline-row-head">
            <div>
              <p class="skill-group-title">${escapeHtml(entry.label)}</p>
              <h3>${escapeHtml(entry.character.name)}</h3>
              <p class="subline">${escapeHtml(entry.character.battleArtName || "戦法名なし")} / ${escapeHtml(
                entry.character.battleArtMeta?.type || "-"
              )}</p>
            </div>
            <div class="meta-chip-list">
              <span class="meta-chip">連鎖順 ${escapeHtml(entry.character.battleArtMeta?.chainOrder || "-")}</span>
              ${entry.key !== "commander" ? `<span class="meta-chip">${escapeHtml(chainText)}</span>` : ""}
            </div>
          </div>
          <div class="timeline-track tone-${escapeHtml(entry.character.battleArtMeta?.tone || "utility")}">
            <div class="timeline-event" style="--order:${entry.orderScore}">
              <strong>${escapeHtml(entry.orderScore)}</strong>
              <span>${escapeHtml(entry.character.battleArtName || entry.character.name)}</span>
            </div>
          </div>
          ${
            entry.pairingNotes.length
              ? `<ul class="bullet-list">${entry.pairingNotes
                  .map((note) => `<li>${escapeHtml(note)}</li>`)
                  .join("")}</ul>`
              : ""
          }
        </article>
      `;
    })
    .join("");

  return `
    <div class="timeline-shell">
      <div class="timeline-axis">${axisMarkup}</div>
      <div class="timeline-list">${rowMarkup}</div>
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
    validationMessages.push("主将を選ぶと連鎖率とタイムラインを計算できます。");
  }

  elements.builderSummary.textContent = formatSummaryText(
    [
      `列: ${builderRowLabelFor(state.rowKey)}`,
      `主将: ${state.commander?.name ?? "未選択"}`,
      `選択枠: ${state.selectedEntries.length}/${BUILDER_SLOT_DEFS.length}`,
      `戦法表示: ${state.timelineEntries.length}件`
    ],
    "編成条件を指定してください。"
  );
  setBuilderValidation(validationMessages.join(" / "));
  elements.builderTimelineCount.textContent = `${state.timelineEntries.length}件`;
  elements.builderTimeline.innerHTML = renderBuilderTimeline(state);
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

  elements.builderRow.value = "front";
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

  const guessedRow = guessBuilderRowFromGuide(commander);
  if (guessedRow) {
    elements.builderRow.value = guessedRow;
  }

  renderBuilderView();
}

function openBuilderWithCommander(name) {
  if (!elements.builderCommander) {
    return;
  }

  elements.builderCommander.value = name;
  setActiveView("builder", { scrollToNav: true });
  renderBuilderView();
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
  setActiveView("character", { scrollToNav: true });
  renderCharacterDb();
}

function openSynergyWithReference(name) {
  elements.synergyCommander.value = name;
  setActiveView("synergy", { scrollToNav: true });
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
      setActiveView(viewButton.dataset.switchView, { scrollToNav: true });
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
  populateSimpleSelect(elements.builderRow, BUILDER_ROW_DEFS, "front");
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
    elements.builderView.addEventListener("change", renderBuilderView);
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

  const initialView = window.location.hash.replace(/^#/, "") || "power";
  setActiveView(initialView, { updateHash: false });
}

boot();
