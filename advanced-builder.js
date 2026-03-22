(() => {
  const root = document.querySelector("#advancedBuilderRoot");
  if (!root) {
    return;
  }

  const appApi = window.KH_APP_API ?? {};
  const dataContext = appApi.dataContext ?? {};
  const preparedCharacters = Array.isArray(dataContext.preparedCharacters) ? dataContext.preparedCharacters : [];
  const preparedSkills = Array.isArray(dataContext.preparedSkills) ? dataContext.preparedSkills : [];
  const statDefs = Array.isArray(dataContext.statDefs) ? dataContext.statDefs : [];
  const formationDefs = Array.isArray(dataContext.formationDefs) ? dataContext.formationDefs : [];
  const formationSlotOrder = Array.isArray(dataContext.formationSlotOrder) ? dataContext.formationSlotOrder : [];
  const formationSlotLabels = dataContext.formationSlotLabels ?? {};
  const objectiveDefs = Array.isArray(dataContext.objectiveDefs) ? dataContext.objectiveDefs : [];
  const equipmentPresets = Array.isArray(dataContext.equipmentPresets) ? dataContext.equipmentPresets : [];
  const equipmentFamilies = Array.isArray(dataContext.equipmentFamilies) ? dataContext.equipmentFamilies : [];
  const equipmentCompatibilityByName = dataContext.equipmentCompatibilityByName ?? {};
  const season3 = dataContext.season3 ?? {};

  if (!preparedCharacters.length || !formationDefs.length) {
    root.innerHTML = `
      <div class="advanced-builder-empty">
        <h3>上級編成研究所を初期化できませんでした</h3>
        <p>武将データまたは陣形データの読み込みに失敗しています。ページを再読み込みしてください。</p>
      </div>
    `;
    return;
  }

  const STORAGE_KEY = "kh-advanced-builder-v1";
  const PRESET_COUNT = 3;
  const MEMBER_DEFS = [
    { key: "commander", label: "主将", roleKey: "commander", short: "主" },
    { key: "vice1", label: "副将1", roleKey: "vice", short: "副1" },
    { key: "vice2", label: "副将2", roleKey: "vice", short: "副2" },
    { key: "aide1", label: "補佐1", roleKey: "aide", short: "補1" },
    { key: "aide2", label: "補佐2", roleKey: "aide", short: "補2" }
  ];
  const ROLE_LABELS = {
    commander: "主将",
    vice: "副将",
    aide: "補佐"
  };
  const GEAR_GROUPS = [
    { key: "weapon", label: "武器", familyKeys: ["blade", "polearm", "ranged"] },
    { key: "armor", label: "防具", familyKeys: ["helmet", "armor", "shield"] },
    { key: "support", label: "補助", familyKeys: ["support"] }
  ];
  const SCORE_PRESETS = {
    balanced: {
      label: "万能",
      description: "火力・耐久・支援を均等に見ます。",
      weights: { offense: 0.24, sustain: 0.22, support: 0.16, control: 0.14, siege: 0.1, synergy: 0.14 }
    },
    burst: {
      label: "瞬間火力",
      description: "火力と先手の噛み合いを優先します。",
      weights: { offense: 0.34, sustain: 0.14, support: 0.12, control: 0.14, siege: 0.08, synergy: 0.18 }
    },
    control: {
      label: "妨害",
      description: "弱化、解除、速度差を厚く見ます。",
      weights: { offense: 0.16, sustain: 0.18, support: 0.16, control: 0.28, siege: 0.06, synergy: 0.16 }
    },
    defense: {
      label: "耐久",
      description: "守備、回復、カウンターを重視します。",
      weights: { offense: 0.12, sustain: 0.34, support: 0.14, control: 0.12, siege: 0.06, synergy: 0.22 }
    },
    siege: {
      label: "攻城",
      description: "攻城火力と継続打点を優先します。",
      weights: { offense: 0.18, sustain: 0.14, support: 0.12, control: 0.08, siege: 0.34, synergy: 0.14 }
    }
  };
  const OBJECTIVE_WEIGHT_ADJUSTMENTS = {
    pvp: { offense: 0.04, control: 0.04, sustain: 0.02, siege: -0.04, support: -0.02, synergy: -0.04 },
    siege: { siege: 0.1, offense: 0.04, sustain: -0.04, control: -0.04, support: -0.02, synergy: -0.04 },
    defense: { sustain: 0.08, synergy: 0.04, control: 0.04, offense: -0.08, siege: -0.04, support: -0.04 },
    gathering: { support: 0.08, sustain: 0.04, synergy: 0.02, offense: -0.08, control: -0.04, siege: -0.02 }
  };

  const objectiveLabelByKey = Object.fromEntries(objectiveDefs.map((entry) => [entry.key, entry.label]));
  const formationByKey = Object.fromEntries(formationDefs.map((entry) => [entry.key, entry]));
  const equipmentPresetByKey = Object.fromEntries(equipmentPresets.map((entry) => [entry.key, entry]));
  const equipmentFamilyLabelByKey = Object.fromEntries(equipmentFamilies.map((entry) => [entry.key, entry.label]));
  const characterByName = Object.fromEntries(preparedCharacters.map((character) => [character.name, character]));
  const skillByName = Object.fromEntries(preparedSkills.map((skill) => [skill.name, skill]));
  const typeKeys = [...new Set(preparedCharacters.map((character) => character.type).filter(Boolean))];
  const equipmentOptionCache = new Map();

  const SAMPLE_PRESETS = [
    {
      key: "burst",
      label: "汗明火力例",
      state: {
        objective: "pvp",
        scorePreset: "burst",
        formationMode: "all",
        replaceTarget: "vice2",
        members: [
          { key: "commander", characterName: "汗明", training: 10, star: 8, skillLevel: 8, tacticLevel: 8, extraRate: 8, gear: { weapon: "polearm", armor: "heavy-armor", support: "strategy-book" } },
          { key: "vice1", characterName: "王翦", training: 10, star: 7, skillLevel: 8, tacticLevel: 7, extraRate: 5, gear: { weapon: "blade", armor: "heavy-helmet", support: "strategy-book" } },
          { key: "vice2", characterName: "羌瘣", training: 9, star: 7, skillLevel: 7, tacticLevel: 8, extraRate: 5, gear: { weapon: "mountain-sword", armor: "round-shield", support: "strategy-book" } },
          { key: "aide1", characterName: "河了貂", training: 8, star: 6, skillLevel: 8, tacticLevel: 7, extraRate: 4, gear: { weapon: "crossbow", armor: "heavy-helmet", support: "strategy-book" } },
          { key: "aide2", characterName: "呉鳳明", training: 8, star: 6, skillLevel: 7, tacticLevel: 7, extraRate: 4, gear: { weapon: "crossbow", armor: "heavy-helmet", support: "strategy-book" } }
        ]
      }
    },
    {
      key: "defense",
      label: "王翦防衛例",
      state: {
        objective: "defense",
        scorePreset: "defense",
        formationMode: "all",
        replaceTarget: "aide2",
        members: [
          { key: "commander", characterName: "王翦", training: 10, star: 8, skillLevel: 8, tacticLevel: 8, extraRate: 7, gear: { weapon: "blade", armor: "heavy-armor", support: "strategy-book" } },
          { key: "vice1", characterName: "楊端和", training: 9, star: 7, skillLevel: 8, tacticLevel: 7, extraRate: 5, gear: { weapon: "mountain-sword", armor: "round-shield", support: "strategy-book" } },
          { key: "vice2", characterName: "摎", training: 9, star: 7, skillLevel: 7, tacticLevel: 7, extraRate: 4, gear: { weapon: "polearm", armor: "heavy-armor", support: "strategy-book" } },
          { key: "aide1", characterName: "河了貂", training: 8, star: 6, skillLevel: 8, tacticLevel: 7, extraRate: 4, gear: { weapon: "crossbow", armor: "heavy-helmet", support: "strategy-book" } },
          { key: "aide2", characterName: "蔡沢", training: 8, star: 6, skillLevel: 7, tacticLevel: 7, extraRate: 4, gear: { weapon: "crossbow", armor: "heavy-helmet", support: "strategy-book" } }
        ]
      }
    },
    {
      key: "siege",
      label: "オルド攻城例",
      state: {
        objective: "siege",
        scorePreset: "siege",
        formationMode: "all",
        replaceTarget: "vice1",
        members: [
          { key: "commander", characterName: "オルド", training: 10, star: 8, skillLevel: 8, tacticLevel: 8, extraRate: 7, gear: { weapon: "mountain-sword", armor: "heavy-armor", support: "strategy-book" } },
          { key: "vice1", characterName: "桓騎", training: 9, star: 7, skillLevel: 7, tacticLevel: 8, extraRate: 5, gear: { weapon: "mountain-sword", armor: "round-shield", support: "strategy-book" } },
          { key: "vice2", characterName: "蒙恬", training: 9, star: 7, skillLevel: 7, tacticLevel: 7, extraRate: 5, gear: { weapon: "crossbow", armor: "heavy-helmet", support: "strategy-book" } },
          { key: "aide1", characterName: "河了貂", training: 8, star: 6, skillLevel: 8, tacticLevel: 7, extraRate: 4, gear: { weapon: "crossbow", armor: "heavy-helmet", support: "strategy-book" } },
          { key: "aide2", characterName: "黒桜", training: 8, star: 6, skillLevel: 7, tacticLevel: 7, extraRate: 4, gear: { weapon: "short-bow", armor: "heavy-helmet", support: "strategy-book" } }
        ]
      }
    }
  ];

  function injectStyles() {
    if (document.querySelector("#advanced-builder-style")) {
      return;
    }
    const style = document.createElement("style");
    style.id = "advanced-builder-style";
    style.textContent = `
      .advanced-builder {
        display: grid;
        gap: 20px;
      }
      .advanced-hero {
        display: grid;
        gap: 16px;
        padding: 20px;
        border: 1px solid rgba(201, 160, 71, 0.35);
        border-radius: 24px;
        background:
          radial-gradient(circle at top right, rgba(255, 215, 128, 0.22), transparent 32%),
          linear-gradient(155deg, rgba(67, 23, 14, 0.9), rgba(17, 16, 20, 0.98));
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);
      }
      .advanced-hero__header,
      .advanced-section__header,
      .advanced-summary__header {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: flex-start;
        flex-wrap: wrap;
      }
      .advanced-hero__title {
        margin: 0;
        font-size: clamp(1.45rem, 2.2vw, 1.95rem);
      }
      .advanced-hero__copy,
      .advanced-section__header p,
      .advanced-summary__header p,
      .advanced-empty p {
        margin: 6px 0 0;
        color: rgba(245, 235, 220, 0.82);
        line-height: 1.7;
      }
      .advanced-pill-row,
      .advanced-chip-row,
      .advanced-type-grid,
      .advanced-summary-grid,
      .advanced-member-grid,
      .advanced-formation-grid,
      .advanced-metric-grid,
      .advanced-replacement-grid {
        display: grid;
        gap: 12px;
      }
      .advanced-pill-row {
        grid-template-columns: repeat(auto-fit, minmax(130px, max-content));
      }
      .advanced-pill,
      .advanced-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid rgba(235, 196, 109, 0.3);
        background: rgba(255, 240, 205, 0.08);
        color: #fff4d7;
        font-size: 0.9rem;
      }
      .advanced-chip {
        padding: 6px 10px;
        font-size: 0.82rem;
      }
      .advanced-toolbar,
      .advanced-section,
      .advanced-summary-card,
      .advanced-member-card,
      .advanced-formation-card,
      .advanced-metric-card,
      .advanced-note-card,
      .advanced-replacement-card,
      .advanced-empty {
        border: 1px solid rgba(201, 160, 71, 0.24);
        border-radius: 20px;
        background: rgba(18, 18, 22, 0.88);
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
      }
      .advanced-toolbar,
      .advanced-section,
      .advanced-summary-card,
      .advanced-empty {
        padding: 18px;
      }
      .advanced-toolbar__actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .advanced-button,
      .advanced-button--subtle {
        border: 0;
        border-radius: 14px;
        padding: 12px 16px;
        font: inherit;
        cursor: pointer;
      }
      .advanced-button {
        color: #241203;
        font-weight: 700;
        background: linear-gradient(135deg, #f4d382, #b77a2d);
      }
      .advanced-button--subtle {
        color: #f7e2b2;
        background: rgba(255, 240, 205, 0.08);
        border: 1px solid rgba(235, 196, 109, 0.25);
      }
      .advanced-control-grid {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
      .advanced-field,
      .advanced-field--compact {
        display: grid;
        gap: 8px;
      }
      .advanced-field label,
      .advanced-field--compact label {
        font-size: 0.84rem;
        color: rgba(247, 226, 178, 0.9);
      }
      .advanced-field select,
      .advanced-field input,
      .advanced-field--compact select,
      .advanced-field--compact input,
      .advanced-type-input {
        width: 100%;
        min-width: 0;
        border-radius: 12px;
        border: 1px solid rgba(235, 196, 109, 0.22);
        background: rgba(255, 248, 232, 0.08);
        color: #fff8e6;
        padding: 10px 12px;
        font: inherit;
      }
      .advanced-type-grid {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      }
      .advanced-type-card {
        padding: 12px;
        border-radius: 16px;
        border: 1px solid rgba(201, 160, 71, 0.22);
        background: rgba(255, 248, 232, 0.04);
      }
      .advanced-type-card strong,
      .advanced-summary-card strong,
      .advanced-metric-card strong,
      .advanced-formation-card strong,
      .advanced-replacement-card strong {
        display: block;
        font-size: 1.22rem;
      }
      .advanced-member-grid,
      .advanced-summary-grid,
      .advanced-formation-grid,
      .advanced-metric-grid,
      .advanced-replacement-grid {
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      }
      .advanced-member-card,
      .advanced-formation-card,
      .advanced-metric-card,
      .advanced-replacement-card,
      .advanced-note-card {
        padding: 16px;
      }
      .advanced-member-card {
        display: grid;
        gap: 14px;
      }
      .advanced-member-card__header {
        display: grid;
        grid-template-columns: 72px minmax(0, 1fr);
        gap: 12px;
        align-items: center;
      }
      .advanced-member-card__portrait {
        width: 72px;
        height: 72px;
        border-radius: 18px;
        overflow: hidden;
        background: linear-gradient(135deg, rgba(242, 213, 150, 0.2), rgba(112, 33, 12, 0.35));
        border: 1px solid rgba(235, 196, 109, 0.2);
      }
      .advanced-member-card__portrait img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .advanced-member-card__name {
        margin: 0;
      }
      .advanced-member-card__sub {
        margin: 4px 0 0;
        color: rgba(245, 235, 220, 0.76);
        font-size: 0.9rem;
      }
      .advanced-inline-grid {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .advanced-inline-grid--stats {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      .advanced-note-list {
        display: grid;
        gap: 10px;
      }
      .advanced-note-card h4,
      .advanced-formation-card h4,
      .advanced-summary-card h3,
      .advanced-member-card h4 {
        margin: 0;
      }
      .advanced-note-card p,
      .advanced-formation-card p,
      .advanced-summary-card p,
      .advanced-member-card p,
      .advanced-replacement-card p {
        margin: 6px 0 0;
        color: rgba(245, 235, 220, 0.8);
        line-height: 1.65;
      }
      .advanced-formation-card.is-best {
        border-color: rgba(240, 198, 95, 0.68);
        background:
          radial-gradient(circle at top right, rgba(255, 219, 137, 0.18), transparent 36%),
          rgba(18, 18, 22, 0.94);
      }
      .advanced-score {
        color: #ffd68f;
        font-weight: 700;
      }
      .advanced-muted {
        color: rgba(245, 235, 220, 0.68);
        font-size: 0.88rem;
      }
      .advanced-summary-grid {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
      .advanced-empty {
        text-align: center;
      }
      @media (max-width: 720px) {
        .advanced-hero,
        .advanced-toolbar,
        .advanced-section,
        .advanced-summary-card {
          padding: 16px;
        }
        .advanced-member-card__header {
          grid-template-columns: 56px minmax(0, 1fr);
        }
        .advanced-member-card__portrait {
          width: 56px;
          height: 56px;
        }
        .advanced-inline-grid--stats {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    `;
    document.head.appendChild(style);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function clampNumber(value, min, max, fallback = min) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return fallback;
    }
    return Math.min(max, Math.max(min, number));
  }

  function roundNumber(value, digits = 0) {
    const factor = 10 ** digits;
    return Math.round((Number(value) || 0) * factor) / factor;
  }

  function uniqueValues(values) {
    return [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
  }

  function cloneState(raw) {
    return JSON.parse(JSON.stringify(raw));
  }

  function createEmptyStats() {
    return Object.fromEntries(statDefs.map((definition) => [definition.key, 0]));
  }

  function sumStatMaps(...maps) {
    const next = createEmptyStats();
    maps.forEach((map) => {
      statDefs.forEach((definition) => {
        next[definition.key] += Number(map?.[definition.key] || 0);
      });
    });
    return next;
  }

  function formatSigned(value, digits = 0) {
    const rounded = roundNumber(value, digits);
    if (!rounded) {
      return "0";
    }
    return `${rounded > 0 ? "+" : ""}${rounded}`;
  }

  function formatMetric(value) {
    return roundNumber(value, 1).toFixed(1);
  }

  function formatStatMap(stats = {}) {
    return statDefs
      .map((definition) => ({ label: definition.label, value: Number(stats?.[definition.key] || 0) }))
      .filter((entry) => entry.value > 0)
      .map((entry) => `${entry.label}${entry.value}`)
      .join(" / ");
  }

  function getTopStats(stats = {}) {
    return statDefs
      .map((definition, priority) => ({
        key: definition.key,
        label: definition.label,
        value: Number(stats?.[definition.key] || 0),
        priority
      }))
      .sort((left, right) => right.value - left.value || left.priority - right.priority);
  }

  function getPresetStats(presetKey) {
    return equipmentPresetByKey[presetKey]?.stats ?? createEmptyStats();
  }

  function createDefaultMember(memberKey) {
    return {
      key: memberKey,
      characterName: "",
      training: 0,
      star: 0,
      skillLevel: 1,
      tacticLevel: 1,
      extraRate: 0,
      gear: {
        weapon: "manual",
        armor: "manual",
        support: "manual"
      },
      flatBonus: createEmptyStats()
    };
  }

  function createDefaultState() {
    const initialNames = ["王騎", "羌瘣", "河了貂", "王翦", "蒙恬"];
    const members = MEMBER_DEFS.map((definition, index) => ({
      ...createDefaultMember(definition.key),
      characterName: characterByName[initialNames[index]] ? initialNames[index] : ""
    }));
    return {
      objective: objectiveDefs[0]?.key ?? "pvp",
      scorePreset: "balanced",
      formationMode: "all",
      typeMode: "auto",
      replaceTarget: MEMBER_DEFS[1]?.key ?? "vice1",
      typeCounts: Object.fromEntries(typeKeys.map((key) => [key, 0])),
      members
    };
  }

  function normalizeWeights(weights = {}) {
    const total = Object.values(weights).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0) || 1;
    return Object.fromEntries(
      Object.entries(weights).map(([key, value]) => [key, Math.max(0, Number(value) || 0) / total])
    );
  }

  function getWeights(objectiveKey, presetKey) {
    const base = SCORE_PRESETS[presetKey]?.weights ?? SCORE_PRESETS.balanced.weights;
    const next = { ...base };
    const adjustment = OBJECTIVE_WEIGHT_ADJUSTMENTS[objectiveKey] ?? {};
    Object.entries(adjustment).forEach(([key, value]) => {
      next[key] = Math.max(0, Number(next[key] || 0) + Number(value || 0));
    });
    return normalizeWeights(next);
  }

  function readStoredState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function getCharacterEquipmentFamilies(characterName = "") {
    return equipmentCompatibilityByName[characterName] ?? [];
  }

  function getGearOptionsForMember(member, groupKey) {
    const cacheKey = `${member.characterName || "none"}:${groupKey}`;
    if (equipmentOptionCache.has(cacheKey)) {
      return equipmentOptionCache.get(cacheKey);
    }
    const group = GEAR_GROUPS.find((entry) => entry.key === groupKey);
    const familySet = new Set(getCharacterEquipmentFamilies(member.characterName).filter((family) => group?.familyKeys.includes(family)));
    const options = equipmentPresets.filter(
      (preset) => preset.key === "manual" || familySet.size === 0 || familySet.has(preset.family)
    );
    equipmentOptionCache.set(cacheKey, options);
    return options;
  }

  function sanitizeGearValue(member, groupKey, value) {
    const options = getGearOptionsForMember(member, groupKey);
    return options.some((entry) => entry.key === value) ? value : "manual";
  }

  function sanitizeMember(raw = {}, memberKey = "") {
    const base = createDefaultMember(memberKey || raw.key || "");
    const member = {
      ...base,
      ...raw,
      key: memberKey || raw.key || base.key,
      characterName: characterByName[raw.characterName] ? raw.characterName : ""
    };
    member.training = clampNumber(member.training, 0, 20, 0);
    member.star = clampNumber(member.star, 0, 20, 0);
    member.skillLevel = clampNumber(member.skillLevel, 1, 10, 1);
    member.tacticLevel = clampNumber(member.tacticLevel, 1, 10, 1);
    member.extraRate = clampNumber(member.extraRate, -20, 80, 0);
    member.gear = {
      weapon: "manual",
      armor: "manual",
      support: "manual",
      ...(raw.gear ?? {})
    };
    member.flatBonus = {
      ...createEmptyStats(),
      ...(raw.flatBonus ?? {})
    };
    GEAR_GROUPS.forEach((group) => {
      member.gear[group.key] = sanitizeGearValue(member, group.key, member.gear[group.key]);
    });
    statDefs.forEach((definition) => {
      member.flatBonus[definition.key] = clampNumber(member.flatBonus[definition.key], 0, 500, 0);
    });
    return member;
  }

  function resolveTypeCountsFromMembers(members = []) {
    const counts = Object.fromEntries(typeKeys.map((key) => [key, 0]));
    members.forEach((member) => {
      const typeKey = member.character?.type;
      if (typeKey && counts[typeKey] !== undefined) {
        counts[typeKey] += 1;
      }
    });
    return counts;
  }

  function sanitizeState(raw = {}) {
    const defaultState = createDefaultState();
    const members = MEMBER_DEFS.map((definition, index) =>
      sanitizeMember(raw.members?.[index] ?? raw.members?.find?.((entry) => entry?.key === definition.key) ?? {}, definition.key)
    );
    const typeCounts = Object.fromEntries(
      typeKeys.map((key) => [key, clampNumber(raw.typeCounts?.[key], 0, 5, 0)])
    );
    const objective = objectiveDefs.some((entry) => entry.key === raw.objective) ? raw.objective : defaultState.objective;
    const scorePreset = SCORE_PRESETS[raw.scorePreset] ? raw.scorePreset : defaultState.scorePreset;
    const formationMode =
      raw.formationMode === "all" || formationByKey[raw.formationMode] ? raw.formationMode : defaultState.formationMode;
    const typeMode = raw.typeMode === "manual" ? "manual" : "auto";
    const replaceTarget = MEMBER_DEFS.some((entry) => entry.key === raw.replaceTarget)
      ? raw.replaceTarget
      : defaultState.replaceTarget;
    const next = {
      objective,
      scorePreset,
      formationMode,
      typeMode,
      replaceTarget,
      typeCounts,
      members
    };
    if (typeMode === "auto") {
      next.typeCounts = resolveTypeCountsFromMembers(
        members
          .map((member) => ({ ...member, character: characterByName[member.characterName] }))
          .filter((member) => member.character)
      );
    }
    return next;
  }

  function persistState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // Ignore storage failures in private mode.
    }
  }

  function statValue(stats, key) {
    return Number(stats?.[key] || 0);
  }

  function buildPermutations(items) {
    if (items.length <= 1) {
      return [items.slice()];
    }
    const results = [];
    items.forEach((item, index) => {
      const rest = items.slice(0, index).concat(items.slice(index + 1));
      buildPermutations(rest).forEach((tail) => {
        results.push([item, ...tail]);
      });
    });
    return results;
  }

  const formationPermutations = buildPermutations([0, 1, 2, 3, 4]);

  function getFeatureSet(character) {
    return new Set([...(character.featureTags ?? []), ...(character.battleArtMeta?.tags ?? []), ...(character.season3?.tags ?? [])]);
  }

  function countMatchingTags(character, tags = []) {
    const featureSet = getFeatureSet(character);
    return tags.filter((tag) => featureSet.has(tag)).length;
  }

  function computeMemberProfile(member, memberDef) {
    const character = characterByName[member.characterName] ?? null;
    if (!character) {
      return null;
    }
    const gearStats = GEAR_GROUPS.reduce(
      (sum, group) => sumStatMaps(sum, getPresetStats(member.gear[group.key])),
      createEmptyStats()
    );
    const baseStats = Object.fromEntries(statDefs.map((definition) => [definition.key, Number(character[definition.key] || 0)]));
    const totalBaseStats = sumStatMaps(baseStats, gearStats, member.flatBonus);
    const investRate = 1 + member.training * 0.03 + member.star * 0.025 + member.extraRate / 100;
    const skillRate = 1 + (member.skillLevel - 1) * 0.018;
    const tacticRate = 1 + (member.tacticLevel - 1) * 0.024;
    const finalRate = investRate * skillRate * tacticRate;
    const effectiveStats = Object.fromEntries(
      statDefs.map((definition) => [
        definition.key,
        Math.round(Math.max(0, Number(totalBaseStats[definition.key] || 0)) * finalRate)
      ])
    );
    const effectiveTopStats = getTopStats(effectiveStats);
    const featureSet = getFeatureSet(character);
    const objectiveBoost = character.objectiveTags?.includes(state.objective) ? 10 : 0;
    const offense =
      (statValue(effectiveStats, "attack") * 0.58 + statValue(effectiveStats, "war") * 0.42) / 18 +
      (featureSet.has("ダメージ") ? 9 : 0) +
      (featureSet.has("攻速上昇") ? 6 : 0) +
      objectiveBoost;
    const sustain =
      (statValue(effectiveStats, "defense") * 0.58 + statValue(effectiveStats, "strategy") * 0.16 + statValue(effectiveStats, "war") * 0.12) / 18 +
      (featureSet.has("回復") ? 8 : 0) +
      (featureSet.has("防御デバフ解除") || featureSet.has("バフ解除・浄化") ? 6 : 0) +
      (featureSet.has("カウンター") ? 6 : 0) +
      (character.objectiveTags?.includes("defense") ? 8 : 0);
    const support =
      (statValue(effectiveStats, "strategy") * 0.62 + statValue(effectiveStats, "war") * 0.18) / 18 +
      (featureSet.has("回復") ? 6 : 0) +
      (featureSet.has("攻撃上昇") ? 8 : 0) +
      (featureSet.has("補助") ? 8 : 0) +
      (character.skillRecords?.length || 0) * 1.4;
    const control =
      (statValue(effectiveStats, "strategy") * 0.5 + statValue(effectiveStats, "attack") * 0.12 + statValue(effectiveStats, "war") * 0.18) / 18 +
      countMatchingTags(character, ["弱化", "弱化・DOT", "バフ解除・浄化", "攻速低下", "恐怖", "control.fear", "control.dot", "control.buff-strip"]) * 5;
    const siege =
      (statValue(effectiveStats, "attack") * 0.42 + statValue(effectiveStats, "war") * 0.28) / 18 +
      (featureSet.has("攻城") ? 10 : 0) +
      countMatchingTags(character, ["siege.structure-damage-up", "role.siege-breaker"]) * 6 +
      (character.objectiveTags?.includes("siege") ? 10 : 0);
    const quality =
      (statValue(effectiveStats, "attack") + statValue(effectiveStats, "defense") + statValue(effectiveStats, "war") + statValue(effectiveStats, "strategy")) /
      36;
    const profile = {
      member,
      memberDef,
      character,
      featureSet,
      baseStats,
      gearStats,
      totalBaseStats,
      effectiveStats,
      effectiveTopStats,
      investRate,
      skillRate,
      tacticRate,
      quality,
      metrics: {
        offense,
        sustain,
        support,
        control,
        siege
      }
    };
    return profile;
  }

  function buildRoleCoverage(profiles, objectiveKey) {
    const bucket = season3?.roleBuckets?.objectives?.[objectiveKey] ?? null;
    if (!bucket) {
      return { score: 0, hits: [], misses: [] };
    }
    const tagCounts = {};
    profiles.forEach((profile) => {
      (profile.character.season3?.tags ?? []).forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const hits = [];
    const misses = [];
    let score = 0;
    [...(bucket.required ?? []), ...(bucket.preferred ?? [])].forEach((rule) => {
      const count = Number(tagCounts[rule.tag] || 0);
      const matched = count >= Number(rule.minUnits || 0);
      const label = String(rule.tag || "").replace(/^role\./, "").replace(/^tempo\./, "").replace(/^siege\./, "");
      if (matched) {
        score += Number(rule.weight || 0) * 10;
        hits.push(`${label} ${count}/${rule.minUnits}`);
      } else {
        misses.push(`${label} ${count}/${rule.minUnits}`);
      }
    });
    return { score, hits, misses };
  }

  function buildPairSynergy(left, right) {
    const notes = [];
    let score = 0;
    const leftPersonality = left.character.personalitySet ?? new Set();
    const rightPersonality = right.character.personalitySet ?? new Set();
    const sharedPersonalities = [...leftPersonality].filter((entry) => rightPersonality.has(entry));
    if (sharedPersonalities.length) {
      score += Math.min(10, sharedPersonalities.length * 3);
      notes.push(`${left.character.name}×${right.character.name}: 個性共通 ${sharedPersonalities.slice(0, 2).join(" / ")}`);
    }
    if (
      (left.featureSet.has("攻撃上昇") || left.featureSet.has("補助")) &&
      (right.featureSet.has("ダメージ") || right.featureSet.has("会心"))
    ) {
      score += 10;
      notes.push(`${left.character.name}の強化が${right.character.name}の火力に直結`);
    }
    if (
      (left.featureSet.has("弱化") || left.featureSet.has("弱化・DOT") || left.featureSet.has("control.dot")) &&
      right.featureSet.has("ダメージ")
    ) {
      score += 9;
      notes.push(`${left.character.name}の弱化後に${right.character.name}が取り切りやすい`);
    }
    if (
      (left.featureSet.has("回復") || left.featureSet.has("カウンター") || left.featureSet.has("防御デバフ解除")) &&
      right.memberDef.roleKey === "commander"
    ) {
      score += 8;
      notes.push(`${right.character.name}主将を${left.character.name}が支えやすい`);
    }
    const sharedObjectives = uniqueValues(
      (left.character.objectiveTags ?? []).filter((entry) => (right.character.objectiveTags ?? []).includes(entry))
    );
    if (sharedObjectives.length) {
      score += sharedObjectives.length * 2;
      notes.push(`${left.character.name}と${right.character.name}は${sharedObjectives.map((key) => objectiveLabelByKey[key] ?? key).join(" / ")}寄り`);
    }
    return { score, notes };
  }

  function getPlacementScore(profile, slot, memberIndex) {
    let score = 0;
    if (profile.memberDef.roleKey === "commander" && slot.key === "first") {
      score += 18;
    }
    if (profile.memberDef.roleKey === "vice" && ["second", "third", "fourth"].includes(slot.key)) {
      score += 10;
    }
    if (profile.memberDef.roleKey === "aide" && ["fourth", "fifth"].includes(slot.key)) {
      score += 12;
    }
    if (profile.character.battleArtMeta?.rowBoosts?.includes(slot.rowKey)) {
      score += 12;
    }
    if (slot.rowKey === "front" && ["attack", "defense"].includes(profile.effectiveTopStats[0]?.key)) {
      score += 6;
    }
    if (slot.rowKey === "back" && profile.effectiveTopStats[0]?.key === "strategy") {
      score += 7;
    }
    if (profile.character.guide?.latestFormation?.selfSlot && profile.character.guide.latestFormation.selfSlot.includes(slot.label)) {
      score += 4;
    }
    score += (profile.character.slotFit?.scores?.[profile.memberDef.roleKey] ?? 0) * 0.15;
    score += memberIndex === 0 && slot.key === "first" ? 6 : 0;
    return score;
  }

  function evaluateFormation(formation, profiles, typeCounts, objectiveKey, presetKey) {
    const slots = formationSlotOrder.map((slotKey) => formation.slots.find((slot) => slot.key === slotKey)).filter(Boolean);
    const pairNotes = [];
    let pairScore = 0;
    for (let index = 0; index < profiles.length; index += 1) {
      for (let peerIndex = index + 1; peerIndex < profiles.length; peerIndex += 1) {
        const pair = buildPairSynergy(profiles[index], profiles[peerIndex]);
        pairScore += pair.score;
        pairNotes.push(...pair.notes);
      }
    }
    const roleCoverage = buildRoleCoverage(profiles, objectiveKey);
    const formationBonusState = [];
    const formationMetricBonus = { offense: 0, sustain: 0, support: 0, control: 0, siege: 0, synergy: 0 };
    formation.bonuses.forEach((bonus) => {
      const count = bonus.type === "any" ? profiles.length : Number(typeCounts?.[bonus.type] || 0);
      const active = count >= Number(bonus.minUnits || 0);
      if (!active) {
        return;
      }
      const stats = bonus.stats ?? {};
      const demerits = bonus.demerits ?? {};
      formationMetricBonus.offense += Number(stats.attack || 0) * 0.72 + Number(stats.war || 0) * 0.4;
      formationMetricBonus.sustain += Number(stats.defense || 0) * 0.74 + Number(bonus.maxTroopsRate || 0) * 0.5;
      formationMetricBonus.support += Number(stats.strategy || 0) * 0.55 + Number(stats.war || 0) * 0.18;
      formationMetricBonus.control += Number(stats.strategy || 0) * 0.34;
      formationMetricBonus.siege += Number(stats.attack || 0) * 0.3 + Number(stats.war || 0) * 0.18;
      formationMetricBonus.offense -= Number(demerits.attack || 0) * 0.7 + Number(demerits.war || 0) * 0.35;
      formationMetricBonus.sustain -= Number(demerits.defense || 0) * 0.75;
      formationMetricBonus.support -= Number(demerits.strategy || 0) * 0.4;
      formationMetricBonus.control -= Number(demerits.strategy || 0) * 0.25;
      formationMetricBonus.siege -= Number(demerits.attack || 0) * 0.25;
      formationBonusState.push({
        bonus,
        label: `${bonus.type === "any" ? "任意" : bonus.type}${bonus.minUnits}以上`,
        summary: formatStatMap(stats) + (bonus.maxTroopsRate ? ` / 兵力上限${formatSigned(bonus.maxTroopsRate)}%` : "")
      });
    });
    let bestAssignment = null;
    formationPermutations.forEach((permutation) => {
      const assignment = permutation.map((slotIndex, memberIndex) => ({
        profile: profiles[memberIndex],
        slot: slots[slotIndex],
        placementScore: getPlacementScore(profiles[memberIndex], slots[slotIndex], memberIndex)
      }));
      const assignmentScore = assignment.reduce((sum, entry) => sum + entry.placementScore, 0);
      if (!bestAssignment || assignmentScore > bestAssignment.assignmentScore) {
        bestAssignment = {
          assignment,
          assignmentScore
        };
      }
    });
    const baseMetrics = profiles.reduce(
      (sum, profile) => ({
        offense: sum.offense + profile.metrics.offense,
        sustain: sum.sustain + profile.metrics.sustain,
        support: sum.support + profile.metrics.support,
        control: sum.control + profile.metrics.control,
        siege: sum.siege + profile.metrics.siege
      }),
      { offense: 0, sustain: 0, support: 0, control: 0, siege: 0 }
    );
    const metrics = {
      offense: baseMetrics.offense / profiles.length + formationMetricBonus.offense * 0.12,
      sustain: baseMetrics.sustain / profiles.length + formationMetricBonus.sustain * 0.12,
      support: baseMetrics.support / profiles.length + formationMetricBonus.support * 0.12,
      control: baseMetrics.control / profiles.length + formationMetricBonus.control * 0.12,
      siege: baseMetrics.siege / profiles.length + formationMetricBonus.siege * 0.12,
      synergy: pairScore / Math.max(1, profiles.length - 1) + roleCoverage.score + bestAssignment.assignmentScore * 0.38
    };
    const weights = getWeights(objectiveKey, presetKey);
    const totalScore =
      metrics.offense * weights.offense +
      metrics.sustain * weights.sustain +
      metrics.support * weights.support +
      metrics.control * weights.control +
      metrics.siege * weights.siege +
      metrics.synergy * weights.synergy;
    return {
      formation,
      metrics,
      totalScore,
      pairNotes: uniqueValues(pairNotes),
      roleCoverage,
      formationBonusState,
      bestAssignment
    };
  }

  function analyzeState(currentState, options = {}) {
    const profiles = currentState.members
      .map((member, index) => computeMemberProfile(member, MEMBER_DEFS[index]))
      .filter(Boolean);
    if (!profiles.length) {
      return {
        profiles: [],
        formations: [],
        bestFormation: null,
        totalPower: 0,
        replacementCandidates: []
      };
    }
    const typeCounts =
      currentState.typeMode === "manual"
        ? Object.fromEntries(typeKeys.map((key) => [key, Number(currentState.typeCounts?.[key] || 0)]))
        : resolveTypeCountsFromMembers(profiles);
    const formationCandidates =
      currentState.formationMode === "all"
        ? formationDefs
        : formationDefs.filter((formation) => formation.key === currentState.formationMode);
    const formationReports = formationCandidates
      .map((formation) => evaluateFormation(formation, profiles, typeCounts, currentState.objective, currentState.scorePreset))
      .sort((left, right) => right.totalScore - left.totalScore || left.formation.label.localeCompare(right.formation.label, "ja"));
    const bestFormation = formationReports[0] ?? null;
    const totalPower = profiles.reduce(
      (sum, profile) =>
        sum +
        statValue(profile.effectiveStats, "attack") +
        statValue(profile.effectiveStats, "defense") +
        statValue(profile.effectiveStats, "war") +
        statValue(profile.effectiveStats, "strategy"),
      0
    );
    const report = {
      profiles,
      typeCounts,
      formations: formationReports,
      bestFormation,
      totalPower,
      replacementCandidates: []
    };
    if (!options.skipReplacement && bestFormation) {
      report.replacementCandidates = buildReplacementCandidates(currentState, report);
    }
    return report;
  }

  function buildReplacementCandidates(currentState, baseReport) {
    const targetIndex = MEMBER_DEFS.findIndex((definition) => definition.key === currentState.replaceTarget);
    if (targetIndex < 0) {
      return [];
    }
    const occupiedNames = new Set(
      currentState.members.map((member, index) => (index === targetIndex ? "" : member.characterName)).filter(Boolean)
    );
    return preparedCharacters
      .filter((character) => !occupiedNames.has(character.name))
      .map((character) => {
        const nextState = cloneState(currentState);
        nextState.members[targetIndex].characterName = character.name;
        nextState.members[targetIndex] = sanitizeMember(nextState.members[targetIndex], nextState.members[targetIndex].key);
        const report = analyzeState(nextState, { skipReplacement: true });
        const best = report.bestFormation;
        if (!best) {
          return null;
        }
        return {
          character,
          score: best.totalScore,
          delta: best.totalScore - (baseReport.bestFormation?.totalScore ?? 0),
          formationLabel: best.formation.label,
          metrics: best.metrics,
          slotSummary: best.bestAssignment.assignment.find((entry) => entry.profile.character.name === character.name)?.slot?.label ?? "-"
        };
      })
      .filter(Boolean)
      .sort((left, right) => right.score - left.score || left.character.name.localeCompare(right.character.name, "ja"))
      .slice(0, 12);
  }

  function buildCharacterOptions(selectedValue) {
    return [
      `<option value="">武将を選択</option>`,
      ...preparedCharacters.map(
        (character) =>
          `<option value="${escapeHtml(character.name)}" ${character.name === selectedValue ? "selected" : ""}>${escapeHtml(character.name)} / ${escapeHtml(character.rarity)} / ${escapeHtml(character.type || "-")}</option>`
      )
    ].join("");
  }

  function buildFormationOptions(selectedValue) {
    return [
      `<option value="all" ${selectedValue === "all" ? "selected" : ""}>全陣形を比較</option>`,
      ...formationDefs.map(
        (formation) =>
          `<option value="${escapeHtml(formation.key)}" ${formation.key === selectedValue ? "selected" : ""}>${escapeHtml(formation.label)}</option>`
      )
    ].join("");
  }

  function buildObjectiveOptions(selectedValue) {
    return objectiveDefs
      .map(
        (entry) =>
          `<option value="${escapeHtml(entry.key)}" ${entry.key === selectedValue ? "selected" : ""}>${escapeHtml(entry.label)}</option>`
      )
      .join("");
  }

  function buildScorePresetOptions(selectedValue) {
    return Object.entries(SCORE_PRESETS)
      .map(
        ([key, entry]) =>
          `<option value="${escapeHtml(key)}" ${key === selectedValue ? "selected" : ""}>${escapeHtml(entry.label)}</option>`
      )
      .join("");
  }

  function buildGearOptions(member, groupKey) {
    return getGearOptionsForMember(member, groupKey)
      .map((preset) => {
        const labelParts = [preset.label];
        if (preset.family && preset.family !== "all") {
          labelParts.push(equipmentFamilyLabelByKey[preset.family] ?? preset.family);
        }
        return `<option value="${escapeHtml(preset.key)}" ${preset.key === member.gear[groupKey] ? "selected" : ""}>${escapeHtml(labelParts.join(" / "))}</option>`;
      })
      .join("");
  }

  function renderTypeCounts(currentState, report) {
    return `
      <div class="advanced-type-grid">
        ${typeKeys
          .map((typeKey) => {
            const value =
              currentState.typeMode === "manual"
                ? Number(currentState.typeCounts?.[typeKey] || 0)
                : Number(report.typeCounts?.[typeKey] || 0);
            return `
              <div class="advanced-type-card">
                <span class="advanced-muted">${escapeHtml(typeKey)}</span>
                ${
                  currentState.typeMode === "manual"
                    ? `<input class="advanced-type-input" type="number" min="0" max="5" step="1" value="${value}" data-type-count="${escapeHtml(typeKey)}">`
                    : `<strong>${value}</strong><p class="advanced-muted">選択中の5人から自動集計</p>`
                }
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderToolbar() {
    return `
      <section class="advanced-hero">
        <div class="advanced-hero__header">
          <div>
            <h2 class="advanced-hero__title">超上級者向けの編成研究所</h2>
            <p class="advanced-hero__copy">
              練達、将星凸、技能Lv、戦法Lv、装備補正、部隊タイプ配分、陣形相性までまとめて入れ、
              バフの噛み合いと差し替え候補を一画面で比較できます。
            </p>
          </div>
          <div class="advanced-pill-row">
            <span class="advanced-pill">練達 / 将星凸</span>
            <span class="advanced-pill">装備3枠 + 手入力</span>
            <span class="advanced-pill">陣形比較</span>
            <span class="advanced-pill">差し替え候補</span>
          </div>
        </div>
        <div class="advanced-toolbar">
          <div class="advanced-section__header">
            <div>
              <h3>研究条件</h3>
              <p>このサイト内の比較用係数で試算します。実戦値をさらに寄せたいときは装備補正と追加補正率を足してください。</p>
            </div>
            <div class="advanced-toolbar__actions">
              ${SAMPLE_PRESETS
                .map(
                  (preset) =>
                    `<button class="advanced-button--subtle" type="button" data-action="load-preset" data-preset-key="${escapeHtml(preset.key)}">${escapeHtml(preset.label)}</button>`
                )
                .join("")}
              <button class="advanced-button--subtle" type="button" data-action="reset-builder">初期化</button>
            </div>
          </div>
          <div class="advanced-control-grid" id="advancedControlGrid"></div>
        </div>
      </section>
    `;
  }

  function renderControlGrid(currentState, report) {
    return `
      <div class="advanced-field">
        <label for="advancedObjective">目的</label>
        <select id="advancedObjective" data-global-field="objective">${buildObjectiveOptions(currentState.objective)}</select>
      </div>
      <div class="advanced-field">
        <label for="advancedScorePreset">評価軸</label>
        <select id="advancedScorePreset" data-global-field="scorePreset">${buildScorePresetOptions(currentState.scorePreset)}</select>
      </div>
      <div class="advanced-field">
        <label for="advancedFormationMode">陣形比較</label>
        <select id="advancedFormationMode" data-global-field="formationMode">${buildFormationOptions(currentState.formationMode)}</select>
      </div>
      <div class="advanced-field">
        <label for="advancedTypeMode">タイプ配分</label>
        <select id="advancedTypeMode" data-global-field="typeMode">
          <option value="auto" ${currentState.typeMode === "auto" ? "selected" : ""}>選択武将から自動計算</option>
          <option value="manual" ${currentState.typeMode === "manual" ? "selected" : ""}>手入力</option>
        </select>
      </div>
      <div class="advanced-field">
        <label for="advancedReplaceTarget">差し替え候補を見る枠</label>
        <select id="advancedReplaceTarget" data-global-field="replaceTarget">
          ${MEMBER_DEFS.map(
            (definition) =>
              `<option value="${escapeHtml(definition.key)}" ${currentState.replaceTarget === definition.key ? "selected" : ""}>${escapeHtml(definition.label)}</option>`
          ).join("")}
        </select>
      </div>
      <div class="advanced-field">
        <label>現在の部隊タイプ配分</label>
        ${renderTypeCounts(currentState, report)}
      </div>
    `;
  }

  function renderMemberInputs(currentState) {
    return `
      <section class="advanced-section">
        <div class="advanced-section__header">
          <div>
            <h3>部隊入力</h3>
            <p>主将・副将・補佐の5人を選び、投資状況と装備を細かく入れてください。</p>
          </div>
        </div>
        <div class="advanced-member-grid">
          ${currentState.members
            .map((member, index) => {
              const character = characterByName[member.characterName] ?? null;
              return `
                <article class="advanced-member-card">
                  <div class="advanced-member-card__header">
                    <div class="advanced-member-card__portrait">
                      ${
                        character?.imageUrl
                          ? `<img src="${escapeHtml(character.imageUrl)}" alt="${escapeHtml(character.name)}">`
                          : ""
                      }
                    </div>
                    <div>
                      <h4 class="advanced-member-card__name">${escapeHtml(MEMBER_DEFS[index].label)}</h4>
                      <p class="advanced-member-card__sub">
                        ${character ? `${escapeHtml(character.rarity)} / ${escapeHtml(character.type || "-")} / ${escapeHtml(character.slotFit?.headline || "-")}` : "武将未選択"}
                      </p>
                    </div>
                  </div>
                  <div class="advanced-field">
                    <label>武将</label>
                    <select data-member-index="${index}" data-member-field="characterName">
                      ${buildCharacterOptions(member.characterName)}
                    </select>
                  </div>
                  <div class="advanced-inline-grid">
                    <div class="advanced-field--compact">
                      <label>練達</label>
                      <input type="number" min="0" max="20" step="1" value="${member.training}" data-member-index="${index}" data-member-field="training">
                    </div>
                    <div class="advanced-field--compact">
                      <label>将星凸</label>
                      <input type="number" min="0" max="20" step="1" value="${member.star}" data-member-index="${index}" data-member-field="star">
                    </div>
                    <div class="advanced-field--compact">
                      <label>技能Lv</label>
                      <input type="number" min="1" max="10" step="1" value="${member.skillLevel}" data-member-index="${index}" data-member-field="skillLevel">
                    </div>
                    <div class="advanced-field--compact">
                      <label>戦法Lv</label>
                      <input type="number" min="1" max="10" step="1" value="${member.tacticLevel}" data-member-index="${index}" data-member-field="tacticLevel">
                    </div>
                  </div>
                  <div class="advanced-field--compact">
                    <label>追加補正率(%)</label>
                    <input type="number" min="-20" max="80" step="1" value="${member.extraRate}" data-member-index="${index}" data-member-field="extraRate">
                  </div>
                  <div class="advanced-inline-grid">
                    ${GEAR_GROUPS.map(
                      (group) => `
                        <div class="advanced-field--compact">
                          <label>${escapeHtml(group.label)}</label>
                          <select data-member-index="${index}" data-member-gear="${escapeHtml(group.key)}">
                            ${buildGearOptions(member, group.key)}
                          </select>
                        </div>
                      `
                    ).join("")}
                  </div>
                  <div class="advanced-inline-grid advanced-inline-grid--stats">
                    ${statDefs
                      .map(
                        (definition) => `
                          <div class="advanced-field--compact">
                            <label>${escapeHtml(definition.label)}補正</label>
                            <input type="number" min="0" max="500" step="1" value="${Number(member.flatBonus?.[definition.key] || 0)}" data-member-index="${index}" data-member-stat="${escapeHtml(definition.key)}">
                          </div>
                        `
                      )
                      .join("")}
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      </section>
    `;
  }

  function renderSummary(report) {
    if (!report.bestFormation) {
      return `
        <section class="advanced-section">
          <div class="advanced-empty">
            <h3>武将を1人以上選ぶと試算が始まります</h3>
            <p>まずは主将だけでも入れると、陣形比較と差し替え候補が表示されます。</p>
          </div>
        </section>
      `;
    }
    const best = report.bestFormation;
    return `
      <section class="advanced-summary-card">
        <div class="advanced-summary__header">
          <div>
            <h3>試算サマリー</h3>
            <p>最適判定: ${escapeHtml(best.formation.label)} / 目的 ${escapeHtml(objectiveLabelByKey[state.objective] ?? state.objective)} / 評価軸 ${escapeHtml(SCORE_PRESETS[state.scorePreset]?.label ?? state.scorePreset)}</p>
          </div>
          <div class="advanced-chip-row">
            <span class="advanced-chip">総合 <span class="advanced-score">${formatMetric(best.totalScore)}</span></span>
            <span class="advanced-chip">部隊戦闘力目安 ${Math.round(report.totalPower).toLocaleString("ja-JP")}</span>
          </div>
        </div>
        <div class="advanced-summary-grid">
          <div>
            <span class="advanced-muted">最適陣形</span>
            <strong>${escapeHtml(best.formation.label)}</strong>
            <p>${escapeHtml(best.formation.description || "陣形説明なし")}</p>
          </div>
          <div>
            <span class="advanced-muted">ロール充足</span>
            <strong>${formatMetric(best.roleCoverage.score)}</strong>
            <p>${escapeHtml(best.roleCoverage.hits.slice(0, 3).join(" / ") || "該当なし")}</p>
          </div>
          <div>
            <span class="advanced-muted">配置相性</span>
            <strong>${formatMetric(best.bestAssignment.assignmentScore)}</strong>
            <p>${escapeHtml(best.bestAssignment.assignment.map((entry) => `${entry.profile.character.name}:${entry.slot.label}`).join(" / "))}</p>
          </div>
        </div>
        ${
          best.formationBonusState.length
            ? `<div class="advanced-chip-row">${best.formationBonusState
                .map((entry) => `<span class="advanced-chip">${escapeHtml(entry.label)} ${escapeHtml(entry.summary)}</span>`)
                .join("")}</div>`
            : ""
        }
      </section>
    `;
  }

  function renderMetricCards(report) {
    if (!report.bestFormation) {
      return "";
    }
    const metrics = report.bestFormation.metrics;
    const entries = [
      { key: "offense", label: "火力" },
      { key: "sustain", label: "耐久" },
      { key: "support", label: "支援" },
      { key: "control", label: "妨害" },
      { key: "siege", label: "攻城" },
      { key: "synergy", label: "相性" }
    ];
    return `
      <section class="advanced-section">
        <div class="advanced-section__header">
          <div>
            <h3>編成指標</h3>
            <p>陣形補正込みで、いまの5人がどの方向へ強いかを見ます。</p>
          </div>
        </div>
        <div class="advanced-metric-grid">
          ${entries
            .map(
              (entry) => `
                <article class="advanced-metric-card">
                  <span class="advanced-muted">${escapeHtml(entry.label)}</span>
                  <strong>${formatMetric(metrics[entry.key])}</strong>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderFormationCards(report) {
    if (!report.formations.length) {
      return "";
    }
    return `
      <section class="advanced-section">
        <div class="advanced-section__header">
          <div>
            <h3>陣形比較</h3>
            <p>同じ5人でどの陣形がもっとも噛み合うかを比較します。</p>
          </div>
        </div>
        <div class="advanced-formation-grid">
          ${report.formations
            .map((entry, index) => {
              const isBest = index === 0;
              return `
                <article class="advanced-formation-card ${isBest ? "is-best" : ""}">
                  <span class="advanced-muted">${isBest ? "最適候補" : `比較 ${index + 1}`}</span>
                  <h4>${escapeHtml(entry.formation.label)}</h4>
                  <strong>${formatMetric(entry.totalScore)}</strong>
                  <p>${escapeHtml(entry.formation.description || "")}</p>
                  <div class="advanced-chip-row">
                    <span class="advanced-chip">火力 ${formatMetric(entry.metrics.offense)}</span>
                    <span class="advanced-chip">耐久 ${formatMetric(entry.metrics.sustain)}</span>
                    <span class="advanced-chip">支援 ${formatMetric(entry.metrics.support)}</span>
                    <span class="advanced-chip">妨害 ${formatMetric(entry.metrics.control)}</span>
                    <span class="advanced-chip">攻城 ${formatMetric(entry.metrics.siege)}</span>
                    <span class="advanced-chip">相性 ${formatMetric(entry.metrics.synergy)}</span>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      </section>
    `;
  }

  function renderNotes(report) {
    if (!report.bestFormation) {
      return "";
    }
    const best = report.bestFormation;
    const notes = [
      ...best.pairNotes.slice(0, 6).map((text) => ({ title: "バフ相性", body: text })),
      ...best.roleCoverage.hits.slice(0, 3).map((text) => ({ title: "満たせている役割", body: text })),
      ...best.roleCoverage.misses.slice(0, 3).map((text) => ({ title: "不足ロール", body: text }))
    ];
    return `
      <section class="advanced-section">
        <div class="advanced-section__header">
          <div>
            <h3>相性メモ</h3>
            <p>技能・戦法・個性・S3タグの重なりから、噛み合いを要点だけ抜き出しています。</p>
          </div>
        </div>
        <div class="advanced-note-list">
          ${notes.length
            ? notes
                .map(
                  (note) => `
                    <article class="advanced-note-card">
                      <h4>${escapeHtml(note.title)}</h4>
                      <p>${escapeHtml(note.body)}</p>
                    </article>
                  `
                )
                .join("")
            : `<article class="advanced-note-card"><h4>相性メモなし</h4><p>まだ十分な組み合わせ情報がありません。武将を増やすか、構成を変えて試してください。</p></article>`}
        </div>
      </section>
    `;
  }

  function renderProfileCards(report) {
    if (!report.profiles.length) {
      return "";
    }
    return `
      <section class="advanced-section">
        <div class="advanced-section__header">
          <div>
            <h3>武将ごとの試算結果</h3>
            <p>装備込みの実効4ステと、戦法・技能の方向性を並べています。</p>
          </div>
        </div>
        <div class="advanced-member-grid">
          ${report.profiles
            .map((profile) => {
              const assignment =
                report.bestFormation?.bestAssignment?.assignment?.find(
                  (entry) => entry.profile.character.name === profile.character.name
                ) ?? null;
              return `
                <article class="advanced-member-card">
                  <div class="advanced-member-card__header">
                    <div class="advanced-member-card__portrait">
                      ${
                        profile.character.imageUrl
                          ? `<img src="${escapeHtml(profile.character.imageUrl)}" alt="${escapeHtml(profile.character.name)}">`
                          : ""
                      }
                    </div>
                    <div>
                      <h4 class="advanced-member-card__name">${escapeHtml(profile.character.name)}</h4>
                      <p class="advanced-member-card__sub">
                        ${escapeHtml(profile.memberDef.label)} / ${escapeHtml(profile.character.type || "-")} / 配置 ${escapeHtml(assignment?.slot?.label ?? "-")}
                      </p>
                    </div>
                  </div>
                  <div class="advanced-chip-row">
                    <span class="advanced-chip">練達 ${profile.member.training}</span>
                    <span class="advanced-chip">将星凸 ${profile.member.star}</span>
                    <span class="advanced-chip">技能Lv ${profile.member.skillLevel}</span>
                    <span class="advanced-chip">戦法Lv ${profile.member.tacticLevel}</span>
                  </div>
                  <div class="advanced-chip-row">
                    <span class="advanced-chip">火力 ${formatMetric(profile.metrics.offense)}</span>
                    <span class="advanced-chip">耐久 ${formatMetric(profile.metrics.sustain)}</span>
                    <span class="advanced-chip">支援 ${formatMetric(profile.metrics.support)}</span>
                    <span class="advanced-chip">妨害 ${formatMetric(profile.metrics.control)}</span>
                    <span class="advanced-chip">攻城 ${formatMetric(profile.metrics.siege)}</span>
                  </div>
                  <p>実効4ステ: ${escapeHtml(formatStatMap(profile.effectiveStats) || "-")}</p>
                  <p>装備補正: ${escapeHtml(formatStatMap(sumStatMaps(profile.gearStats, profile.member.flatBonus)) || "なし")}</p>
                  <p>戦法: ${escapeHtml(profile.character.battleArtName || "-")}</p>
                  <p>技能: ${escapeHtml((profile.character.skillRecords ?? []).map((entry) => entry.name).join(" / ") || "-")}</p>
                </article>
              `;
            })
            .join("")}
        </div>
      </section>
    `;
  }

  function renderReplacementCards(report) {
    if (!report.replacementCandidates.length) {
      return "";
    }
    return `
      <section class="advanced-section">
        <div class="advanced-section__header">
          <div>
            <h3>差し替え候補</h3>
            <p>${escapeHtml(MEMBER_DEFS.find((entry) => entry.key === state.replaceTarget)?.label || "対象枠")}に別武将を入れたときの上位候補です。</p>
          </div>
        </div>
        <div class="advanced-replacement-grid">
          ${report.replacementCandidates
            .map(
              (entry, index) => `
                <article class="advanced-replacement-card">
                  <span class="advanced-muted">${index + 1}位 / ${escapeHtml(entry.character.rarity)}</span>
                  <h4>${escapeHtml(entry.character.name)}</h4>
                  <strong>${formatMetric(entry.score)}</strong>
                  <p>差分 ${formatSigned(entry.delta, 1)} / 最適陣形 ${escapeHtml(entry.formationLabel)} / 推奨配置 ${escapeHtml(entry.slotSummary)}</p>
                  <div class="advanced-chip-row">
                    <span class="advanced-chip">火力 ${formatMetric(entry.metrics.offense)}</span>
                    <span class="advanced-chip">耐久 ${formatMetric(entry.metrics.sustain)}</span>
                    <span class="advanced-chip">支援 ${formatMetric(entry.metrics.support)}</span>
                    <span class="advanced-chip">妨害 ${formatMetric(entry.metrics.control)}</span>
                    <span class="advanced-chip">攻城 ${formatMetric(entry.metrics.siege)}</span>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function render() {
    injectStyles();
    const report = analyzeState(state);
    root.innerHTML = `
      <div class="advanced-builder">
        ${renderToolbar()}
        ${renderSummary(report)}
        ${renderMemberInputs(state)}
        ${renderMetricCards(report)}
        ${renderFormationCards(report)}
        ${renderNotes(report)}
        ${renderProfileCards(report)}
        ${renderReplacementCards(report)}
      </div>
    `;
    const controlGrid = root.querySelector("#advancedControlGrid");
    if (controlGrid) {
      controlGrid.innerHTML = renderControlGrid(state, report);
    }
  }

  function updateMemberState(index, updater) {
    const next = cloneState(state);
    const currentMember = next.members[index];
    if (!currentMember) {
      return;
    }
    updater(currentMember);
    next.members[index] = sanitizeMember(currentMember, currentMember.key);
    state = sanitizeState(next);
  }

  function updateFromField(target) {
    if (!(target instanceof HTMLElement)) {
      return false;
    }
    if (target.matches("[data-global-field]")) {
      const field = target.dataset.globalField;
      const next = cloneState(state);
      next[field] = target.value;
      state = sanitizeState(next);
      return true;
    }
    if (target.matches("[data-type-count]")) {
      const next = cloneState(state);
      next.typeCounts[target.dataset.typeCount] = Number(target.value || 0);
      state = sanitizeState(next);
      return true;
    }
    const memberIndex = Number(target.dataset.memberIndex);
    if (!Number.isInteger(memberIndex)) {
      return false;
    }
    if (target.matches("[data-member-field]")) {
      const field = target.dataset.memberField;
      updateMemberState(memberIndex, (member) => {
        member[field] = field === "characterName" ? target.value : Number(target.value || 0);
      });
      return true;
    }
    if (target.matches("[data-member-gear]")) {
      const gearKey = target.dataset.memberGear;
      updateMemberState(memberIndex, (member) => {
        member.gear[gearKey] = target.value;
      });
      return true;
    }
    if (target.matches("[data-member-stat]")) {
      const statKey = target.dataset.memberStat;
      updateMemberState(memberIndex, (member) => {
        member.flatBonus[statKey] = Number(target.value || 0);
      });
      return true;
    }
    return false;
  }

  function loadPreset(presetKey) {
    const preset = SAMPLE_PRESETS.find((entry) => entry.key === presetKey);
    if (!preset) {
      return;
    }
    const base = createDefaultState();
    const next = sanitizeState({
      ...base,
      ...preset.state,
      typeMode: "auto"
    });
    state = next;
    persistState();
    render();
    appApi.showStatusToast?.(`${preset.label}を読み込みました。`);
  }

  function resetBuilder(options = {}) {
    state = sanitizeState(createDefaultState());
    if (options.removeStorage) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        // Ignore storage failures.
      }
    } else {
      persistState();
    }
    if (options.rerender !== false) {
      render();
    }
  }

  function collectShareState() {
    return cloneState(state);
  }

  function applyShareState(nextState, options = {}) {
    state = sanitizeState(nextState);
    persistState();
    if (options.rerender !== false) {
      render();
    }
    if (options.showToast) {
      appApi.showStatusToast?.("上級編成研究所の状態を読み込みました。");
    }
  }

  function exportState() {
    return cloneState(state);
  }

  function importState(nextState, options = {}) {
    if (!nextState || typeof nextState !== "object") {
      resetBuilder(options);
      return;
    }
    applyShareState(nextState, options);
  }

  function refresh() {
    render();
  }

  function handleClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) {
      return;
    }
    const action = button.dataset.action;
    if (action === "load-preset") {
      loadPreset(button.dataset.presetKey);
      return;
    }
    if (action === "reset-builder") {
      resetBuilder();
    }
  }

  function handleChange(event) {
    if (updateFromField(event.target)) {
      persistState();
      render();
    }
  }

  state = sanitizeState(readStoredState() ?? createDefaultState());

  root.addEventListener("click", handleClick);
  root.addEventListener("change", handleChange);

  window.KH_ADVANCED_BUILDER_API = {
    collectShareState,
    applyShareState,
    exportState,
    importState,
    refresh,
    clearState: resetBuilder
  };

  render();

  if (window.__KH_PENDING_SHARE_PAYLOAD?.view === "advanced") {
    applyShareState(window.__KH_PENDING_SHARE_PAYLOAD.state ?? {}, { showToast: true });
    window.__KH_PENDING_SHARE_PAYLOAD = null;
  }
})();
