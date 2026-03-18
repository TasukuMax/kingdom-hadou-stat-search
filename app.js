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
  { key: "対物", label: "対物", hint: "対物上昇・建物削りに関わる" },
  { key: "弱化効果付与", label: "弱化効果付与", hint: "低下・病毒・恐怖などを相手に付与する" },
  { key: "強化効果付与", label: "強化効果付与", hint: "攻撃上昇・攻速上昇・堅固・回避などを付与する" },
  { key: "強化解除", label: "強化解除", hint: "相手の強化効果を外せる" },
  { key: "被ダメ軽減", label: "被ダメ軽減", hint: "被ダメージ軽減を持つ" },
  { key: "反撃", label: "反撃", hint: "反撃強化や反撃時効果を持つ" },
  { key: "攻速上昇", label: "攻速上昇", hint: "攻撃速度を上げられる" },
  { key: "攻速低下", label: "攻速低下", hint: "相手の攻撃速度を下げられる" },
  { key: "継続削り", label: "継続削り", hint: "病毒など継続的な削りを持つ" },
  { key: "会心", label: "会心", hint: "会心発生率・会心威力を伸ばす" },
  { key: "堅固", label: "堅固", hint: "堅固を付与または活用する" },
  { key: "回避", label: "回避", hint: "回避付与を持つ" },
  { key: "連鎖依存", label: "連鎖依存", hint: "共通個性数で性能が伸びる" },
  { key: "兵力条件", label: "兵力条件", hint: "兵力割合で効果が変わる" },
  { key: "調達", label: "調達", hint: "調達・採集まわりで価値がある" },
  { key: "デバフ無効", label: "デバフ無効", hint: "能力低下系デバフを受けにくい" }
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
  simulator: "編成シミュレーター"
};

const STAT_MAP = Object.fromEntries(STAT_DEFS.map((stat) => [stat.key, stat]));
const CONDITION_MAP = Object.fromEntries(CONDITION_DEFS.map((condition) => [condition.key, condition]));
const CONDITION_LABEL_TO_KEY = Object.fromEntries(
  CONDITION_DEFS.map((condition) => [condition.label, condition.key])
);
const RARITY_MAP = Object.fromEntries(RARITY_DEFS.map((rarity) => [rarity.key, rarity]));
const RARITY_RANK = Object.fromEntries(RARITY_DEFS.map((rarity, index) => [rarity.key, index]));
const SKILL_RANK = Object.fromEntries(SKILL_ORDER.map((skillName, index) => [skillName, index]));
const CHARACTER_SORT_MAP = Object.fromEntries(
  CHARACTER_SORT_DEFS.map((definition) => [definition.key, definition.label])
);
const SKILL_SORT_MAP = Object.fromEntries(
  SKILL_SORT_DEFS.map((definition) => [definition.key, definition.label])
);
const S3_TAG_MAP = Object.fromEntries(SEASON3.tags.map((tag) => [tag.key, tag]));
const S3_OBJECTIVE_MAP = Object.fromEntries(SEASON3.objectives.map((objective) => [objective.key, objective]));
const S3_HERO_RAW_BY_NAME = Object.fromEntries(SEASON3.heroes.map((hero) => [hero.name, hero]));
const S3_SKILL_RAW_BY_NAME = Object.fromEntries(SEASON3.skills.map((skill) => [skill.name, skill]));

const defaultRarities = RARITY_DEFS.map((rarity) => rarity.key);

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

function getConditionKeysFromLabels(labels) {
  return labels.map((label) => CONDITION_LABEL_TO_KEY[label]).filter(Boolean);
}

function formatPercent(value) {
  if (value == null) {
    return "";
  }

  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
}

function seasonTagLabel(tagKey) {
  return S3_TAG_MAP[tagKey]?.label ?? tagKey;
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

function deriveFeatureTags(skillRecords, season3) {
  const skillText = collectSkillEffectText(skillRecords);
  const featureTags = [];

  if (skillText.includes("対物") || hasSeason3Tags(season3, ["siege.structure-damage-up"])) {
    featureTags.push("対物");
  }

  if (
    hasAnyKeyword(skillText, ["低下", "病毒", "恐怖"]) ||
    hasSeason3Tags(season3, ["control.fear", "control.buff-strip", "control.dot", "tempo.attack-speed-down"])
  ) {
    featureTags.push("弱化効果付与");
  }

  if (hasAnyKeyword(skillText, ["攻撃速度上昇", "攻撃上昇", "堅固", "通常攻撃回避"])) {
    featureTags.push("強化効果付与");
  }

  if (skillText.includes("強化解除") || hasSeason3Tags(season3, ["control.buff-strip"])) {
    featureTags.push("強化解除");
  }

  if (
    (skillText.includes("被ダメージ") && hasAnyKeyword(skillText, ["軽減", "₋", "-"])) ||
    hasSeason3Tags(season3, ["def.damage-cut"])
  ) {
    featureTags.push("被ダメ軽減");
  }

  if (skillText.includes("反撃") || hasSeason3Tags(season3, ["role.counter-enabler"])) {
    featureTags.push("反撃");
  }

  if (
    hasAnyKeyword(skillText, ["攻撃速度上昇", "部隊の攻撃速度が上昇"]) ||
    hasSeason3Tags(season3, ["tempo.attack-speed-up"])
  ) {
    featureTags.push("攻速上昇");
  }

  if (skillText.includes("攻撃速度低下") || hasSeason3Tags(season3, ["tempo.attack-speed-down"])) {
    featureTags.push("攻速低下");
  }

  if (skillText.includes("病毒") || hasSeason3Tags(season3, ["control.dot"])) {
    featureTags.push("継続削り");
  }

  if (skillText.includes("会心")) {
    featureTags.push("会心");
  }

  if (skillText.includes("堅固")) {
    featureTags.push("堅固");
  }

  if (skillText.includes("回避")) {
    featureTags.push("回避");
  }

  if (hasAnyKeyword(skillText, ["共通する個性", "同じ個性を持つ武将の人数"])) {
    featureTags.push("連鎖依存");
  }

  if (hasAnyKeyword(skillText, ["50%以上", "50%以下", "30%以下", "30％以下"])) {
    featureTags.push("兵力条件");
  }

  if (skillText.includes("調達")) {
    featureTags.push("調達");
  }

  if (hasSeason3Tags(season3, ["def.debuff-immunity"])) {
    featureTags.push("デバフ無効");
  }

  return uniqueValues(featureTags);
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
  const featureTags = deriveFeatureTags(skillRecords, season3);

  const displayTags = uniqueValues([
    character.rarity,
    `天賦${character.tenpu}`,
    `${rankedStats[0].label}1位`,
    `${rankedStats[1].label}2位`,
    ...featureTags,
    ...conditionLabels,
    ...(season3 ? [season3.type, ...season3.bestUseCases, ...season3.tags.map(seasonTagLabel)] : [])
  ]);

  const searchText = normalizeSearchText(
    [
      character.name,
      character.rarity,
      `天賦${character.tenpu}`,
      ...displayTags,
      ...featureTags,
      ...character.skills,
      ...skillRecords.map((skill) => skill.summary),
      ...skillRecords.map((skill) => skill.initialEffect),
      ...skillRecords.map((skill) => skill.maxEffect),
      ...character.personalities,
      season3?.roleSummary ?? "",
      ...(season3?.strengths ?? []),
      ...(season3?.weaknesses ?? []),
      ...(season3?.bestUseCases ?? []),
      ...(season3?.tags ?? []).map(seasonTagLabel)
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
    featureTags,
    displayTags,
    searchText,
    personalitySet: new Set(character.personalities),
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
    const searchText = normalizeSearchText(
      [
        skill.name,
        skill.summary,
        skill.initialEffect,
        skill.maxEffect,
        ...conditionLabels,
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
  s3SkillList: document.querySelector("#s3SkillList")
};

function populateStatSelect(select, placeholder) {
  const options = [`<option value="">${placeholder}</option>`];

  for (const stat of STAT_DEFS) {
    options.push(`<option value="${stat.key}">${stat.label}</option>`);
  }

  select.innerHTML = options.join("");
}

function populateSimpleSelect(select, definitions, defaultValue) {
  select.innerHTML = definitions
    .map((definition) => `<option value="${definition.key}">${definition.label}</option>`)
    .join("");
  select.value = defaultValue;
}

function renderCheckboxGroup(container, definitions, name, checkedValues) {
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
                ${escapeHtml(character.rarity)} / 天賦 ${character.tenpu} / 基礎連鎖率 ${escapeHtml(
                  formatPercent(character.chainBase * 100)
                )}
              </p>
            </div>
            <a class="source-link" href="${escapeHtml(character.sourceUrl)}" target="_blank" rel="noreferrer">GameWith</a>
          </div>
          <div class="top-pair">
            <span class="pair-badge rank-1">1位: ${escapeHtml(character.top1.label)} ${character.top1.value}</span>
            <span class="pair-badge rank-2">2位: ${escapeHtml(character.top2.label)} ${character.top2.value}</span>
          </div>
          ${showSeason3Info ? renderSeason3HeroBlock(character) : ""}
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
        <div class="meta-chip-list">${conditionMarkup}</div>
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

function getPowerSearchState(primary, secondary, rarities, conditions, chainContext) {
  const filteredCharacters = preparedCharacters.filter(
    (character) =>
      rarities.includes(character.rarity) &&
      matchesConditions(character, conditions) &&
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
          rarities.length !== RARITY_DEFS.length ? `レアリティ: ${rarities.join(" / ")}` : "",
          chainContext.chainSortEnabled && chainContext.chainReference
            ? `連鎖率基準: ${chainContext.chainReference.name}`
            : ""
        ].filter(Boolean),
        "技能条件や連鎖率基準に一致する武将を表示しています。"
      ),
      exactTitle:
        chainContext.chainSortEnabled && chainContext.chainReference
          ? `連鎖率順: ${chainContext.chainReference.name}`
          : "条件一致",
      exactDescription: buildPowerDescription(
        "選択したレアリティと技能条件に一致する武将です。魅力は除外し、攻撃・防御・戦威・策略の4項目だけを表示しています。",
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
          rarities.length !== RARITY_DEFS.length ? `レアリティ: ${rarities.join(" / ")}` : "",
          chainContext.chainSortEnabled && chainContext.chainReference
            ? `連鎖率基準: ${chainContext.chainReference.name}`
            : ""
        ].filter(Boolean),
        "ステータス条件に一致する武将を表示しています。"
      ),
      exactTitle: `1位一致: ${labelFor(primary)}`,
      exactDescription: buildPowerDescription(
        "最も高いステータスが選択項目の武将です。レアリティと技能条件の絞り込みを反映しています。",
        chainContext
      ),
      partialTitle: `2位一致: ${labelFor(primary)}`,
      partialDescription: buildPowerDescription(
        "1位ではないものの、2番目に高いステータスが選択項目の武将です。レアリティと技能条件の絞り込みを反映しています。",
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
        rarities.length !== RARITY_DEFS.length ? `レアリティ: ${rarities.join(" / ")}` : "",
        chainContext.chainSortEnabled && chainContext.chainReference
          ? `連鎖率基準: ${chainContext.chainReference.name}`
          : ""
      ].filter(Boolean),
      "完全一致・逆順一致を表示しています。"
    ),
    exactTitle: `完全一致: ${labelFor(primary)} → ${labelFor(secondary)}`,
    exactDescription: buildPowerDescription(
      "1位・2位の並び順まで一致する武将です。レアリティと技能条件の絞り込みを反映しています。",
      chainContext
    ),
    partialTitle: `逆順一致: ${labelFor(secondary)} → ${labelFor(primary)}`,
    partialDescription: buildPowerDescription(
      "上位2項目は一致するものの、1位・2位の順番が逆の武将です。レアリティと技能条件の絞り込みを反映しています。",
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
    "第1ステータスや技能条件、連鎖率ソートを使って、戦力を伸ばしやすい武将を条件別に探せます。";

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
  const chainSortEnabled = elements.chainSortEnabled.checked;
  const chainReference = characterByName[elements.chainCommander.value.trim()] ?? null;
  const chainContext = { chainSortEnabled, chainReference };

  const hasActiveFilter =
    Boolean(primary) ||
    Boolean(secondary) ||
    Boolean(conditions.length) ||
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

  const state = getPowerSearchState(primary, secondary, rarities, conditions, chainContext);

  elements.summary.textContent = state.summary;
  elements.exactTitle.textContent = state.exactTitle;
  elements.exactDescription.textContent = state.exactDescription;
  elements.exactCount.textContent = `${state.exact.length}体`;
  elements.exactList.innerHTML = renderCharacterCards(state.exact, {
    selectedStats: [primary, secondary],
    selectedConditionKeys: conditions,
    chainReference,
    emptyMessage: state.exactEmptyMessage
  });

  elements.partialTitle.textContent = state.partialTitle;
  elements.partialDescription.textContent = state.partialDescription;
  elements.partialCount.textContent = state.partial.length ? `${state.partial.length}体` : "";
  elements.partialList.innerHTML = renderCharacterCards(state.partial, {
    selectedStats: [primary, secondary],
    selectedConditionKeys: conditions,
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
  setPowerValidation("");
  renderPowerResults();
}

function renderCharacterDb() {
  const keyword = elements.characterKeyword.value.trim();
  const sortKey = elements.characterSort.value;
  const rarities = readCheckedValuesIn(elements.characterView, "db-rarity");
  const tags = readCheckedValuesIn(elements.characterView, "db-tag");
  const features = readCheckedValuesIn(elements.characterView, "db-feature");
  const selectedConditionKeys = getConditionKeysFromLabels(tags);

  const filtered = preparedCharacters.filter(
    (character) =>
      rarities.includes(character.rarity) &&
      tags.every((tag) => character.displayTags.includes(tag)) &&
      features.every((feature) => character.featureTags.includes(feature)) &&
      keywordMatches(character.searchText, keyword)
  );

  const sorted = sortCharactersForDb(filtered, sortKey);

  elements.characterSummary.textContent = formatSummaryText(
    [
      keyword ? `全文: ${keyword}` : "",
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
  document.querySelectorAll('input[name="db-tag"]').forEach((input) => (input.checked = false));
  document.querySelectorAll('input[name="db-feature"]').forEach((input) => (input.checked = false));
  renderCharacterDb();
}

function renderSkillDb() {
  const keyword = elements.skillKeyword.value.trim();
  const sortKey = elements.skillSort.value;
  const conditions = readCheckedValuesIn(elements.skillView, "skill-condition");

  const filtered = preparedSkills.filter(
    (skill) =>
      conditions.every((condition) => skill.conditions.includes(condition)) &&
      keywordMatches(skill.searchText, keyword)
  );

  const sorted = sortSkillsForDb(filtered, sortKey);

  elements.skillSummary.textContent = formatSummaryText(
    [
      keyword ? `全文: ${keyword}` : "",
      conditions.length ? `条件: ${conditions.map(conditionLabelFor).join(" / ")}` : "",
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

function renderFeatureBoard() {
  const objectiveKey = elements.s3Objective?.value || SEASON3.objectives[0]?.key || "pvp";
  const slotFocus = elements.s3SlotFocus?.value || "balanced";
  const objectiveLabel = S3_OBJECTIVE_MAP[objectiveKey]?.label ?? objectiveKey;
  const sortedHeroes = sortSeason3Heroes(objectiveKey, slotFocus);
  const topUpgrades = sortedHeroes.slice(0, 4);

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
  renderCheckboxGroup(elements.characterRarityFilters, RARITY_DEFS, "db-rarity", defaultRarities);
  renderCheckboxGroup(elements.characterTagFilters, CHARACTER_TAG_DEFS, "db-tag", []);
  renderCheckboxGroup(elements.characterFeatureFilters, CHARACTER_FEATURE_DEFS, "db-feature", []);
  renderCheckboxGroup(elements.skillConditionFilters, CONDITION_DEFS, "skill-condition", []);
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
