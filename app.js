const { characters: CHARACTERS, skills: SKILLS, skillOrder: SKILL_ORDER, enishiWeights: ENISHI_WEIGHTS } =
  APP_DATA;

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

const STAT_MAP = Object.fromEntries(STAT_DEFS.map((stat) => [stat.key, stat]));
const CONDITION_MAP = Object.fromEntries(
  CONDITION_DEFS.map((condition) => [condition.key, condition])
);
const RARITY_MAP = Object.fromEntries(RARITY_DEFS.map((rarity) => [rarity.key, rarity]));
const RARITY_RANK = Object.fromEntries(RARITY_DEFS.map((rarity, index) => [rarity.key, index]));
const SKILL_RANK = Object.fromEntries(SKILL_ORDER.map((skillName, index) => [skillName, index]));

const defaultRarities = RARITY_DEFS.map((rarity) => rarity.key);

function getSkillRecord(skillName) {
  return (
    SKILLS[skillName] ?? {
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

const preparedCharacters = CHARACTERS.map((character) => {
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

  return {
    ...character,
    rankedStats,
    top1: rankedStats[0],
    top2: rankedStats[1],
    skillRecords,
    conditionIndex,
    personalitySet: new Set(character.personalities)
  };
});

const characterByName = Object.fromEntries(
  preparedCharacters.map((character) => [character.name, character])
);

const elements = {
  form: document.querySelector("#searchForm"),
  primaryStat: document.querySelector("#primaryStat"),
  secondaryStat: document.querySelector("#secondaryStat"),
  chainCommander: document.querySelector("#chainCommander"),
  chainSortEnabled: document.querySelector("#chainSortEnabled"),
  commanderOptions: document.querySelector("#commanderOptions"),
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
  datasetCount: document.querySelector("#datasetCount"),
  ssrCount: document.querySelector("#ssrCount"),
  srCount: document.querySelector("#srCount"),
  skillDialog: document.querySelector("#skillDialog"),
  skillDialogTitle: document.querySelector("#skillDialogTitle"),
  skillDialogMeta: document.querySelector("#skillDialogMeta"),
  skillDialogSummaryBlock: document.querySelector("#skillDialogSummaryBlock"),
  skillDialogSummary: document.querySelector("#skillDialogSummary"),
  skillDialogInitialBlock: document.querySelector("#skillDialogInitialBlock"),
  skillDialogInitial: document.querySelector("#skillDialogInitial"),
  skillDialogMaxBlock: document.querySelector("#skillDialogMaxBlock"),
  skillDialogMax: document.querySelector("#skillDialogMax"),
  skillDialogClose: document.querySelector("#skillDialogClose")
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function labelFor(statKey) {
  return STAT_MAP[statKey]?.label ?? "";
}

function conditionLabelFor(conditionKey) {
  return CONDITION_MAP[conditionKey]?.label ?? "";
}

function formatPercent(value) {
  if (value == null) {
    return "";
  }

  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
}

function populateSelect(select, placeholder) {
  const options = [`<option value="">${placeholder}</option>`];

  for (const stat of STAT_DEFS) {
    options.push(`<option value="${stat.key}">${stat.label}</option>`);
  }

  select.innerHTML = options.join("");
}

function populateCommanderDatalist() {
  elements.commanderOptions.innerHTML = preparedCharacters
    .map(
      (character) =>
        `<option value="${escapeHtml(character.name)}">${escapeHtml(character.rarity)} / 天賦 ${character.tenpu}</option>`
    )
    .join("");
}

function renderCheckboxGroup(container, defs, name, checkedValues) {
  const checkedSet = new Set(checkedValues);

  container.innerHTML = defs
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

function readCheckedValues(name) {
  return Array.from(
    document.querySelectorAll(`input[name="${name}"]:checked`),
    (input) => input.value
  );
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

function setValidationMessage(message) {
  elements.validationMessage.textContent = message;
  elements.validationMessage.hidden = !message;
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

function matchesFilters(character, selectedRarities, selectedConditions) {
  return selectedRarities.includes(character.rarity) && matchesConditions(character, selectedConditions);
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
    return { rate: null, shared: [] };
  }

  const shared = targetCharacter.personalities.filter((personality) =>
    referenceCharacter.personalitySet.has(personality)
  );
  const bonus = shared.reduce((sum, personality) => sum + (ENISHI_WEIGHTS[personality] ?? 0), 0);
  const rate = targetCharacter.chainBase * 100 + bonus;

  return { rate, shared };
}

function sortMatches(list, context) {
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
      const signatureDiff = compareNumberArrays(
        skillSignature(left),
        skillSignature(right)
      );
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

    return (
      RARITY_RANK[left.rarity] - RARITY_RANK[right.rarity] ||
      right.tenpu - left.tenpu ||
      right.top1.value - left.top1.value ||
      right.top2.value - left.top2.value ||
      left.name.localeCompare(right.name, "ja")
    );
  });
}

function formatSummary(primary, secondary, rarities, conditions, chainContext) {
  const parts = [];

  if (primary && secondary) {
    parts.push(`ステータス: ${labelFor(primary)} → ${labelFor(secondary)}`);
  } else if (primary) {
    parts.push(`ステータス: ${labelFor(primary)}`);
  }

  if (conditions.length) {
    parts.push(`技能条件: ${conditions.map(conditionLabelFor).join(" / ")}`);
  }

  if (rarities.length !== RARITY_DEFS.length) {
    parts.push(`レアリティ: ${rarities.map((rarity) => RARITY_MAP[rarity].label).join(" / ")}`);
  }

  if (chainContext.chainSortEnabled && chainContext.chainReference) {
    parts.push(`連鎖率基準: ${chainContext.chainReference.name}`);
  }

  if (!parts.length) {
    return "";
  }

  return `検索条件: ${parts.join("  |  ")}`;
}

function buildStateDescription(baseText, chainContext) {
  if (!chainContext.chainSortEnabled || !chainContext.chainReference) {
    return baseText;
  }

  return `${baseText} 並び順は ${chainContext.chainReference.name} を主将に置いた場合の副将連鎖率が最優先です。`;
}

function getSearchState(primary, secondary, rarities, conditions, chainContext) {
  const filteredCharacters = preparedCharacters.filter(
    (character) =>
      matchesFilters(character, rarities, conditions) &&
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
      summary: formatSummary(primary, secondary, rarities, conditions, chainContext),
      exactTitle:
        chainContext.chainSortEnabled && chainContext.chainReference
          ? `連鎖率順: ${chainContext.chainReference.name}`
          : "条件一致",
      exactDescription: buildStateDescription(
        "選択したレアリティと技能条件に一致する武将です。魅力は除外し、攻撃・防御・戦威・策略の4項目だけを表示しています。",
        chainContext
      ),
      partialTitle: "ステータス検索の使い方",
      partialDescription:
        "第1ステータスを選ぶと 1位一致 / 2位一致、第1・第2ステータスを選ぶと 完全一致 / 逆順一致 で分けて表示します。",
      exact: sortMatches(filteredCharacters, sortContext),
      partial: [],
      exactEmptyMessage:
        chainContext.chainSortEnabled && chainContext.chainReference
          ? "条件に一致する副将候補はいません。"
          : "条件に一致する武将はいません。",
      partialEmptyMessage:
        "ステータスを追加すると、ここに 2位一致 や 逆順一致 を表示します。"
    };
  }

  if (!secondary) {
    return {
      summary: formatSummary(primary, secondary, rarities, conditions, chainContext),
      exactTitle: `1位一致: ${labelFor(primary)}`,
      exactDescription: buildStateDescription(
        "最も高いステータスが選択項目の武将です。レアリティと技能条件の絞り込みを反映しています。",
        chainContext
      ),
      partialTitle: `2位一致: ${labelFor(primary)}`,
      partialDescription: buildStateDescription(
        "1位ではないものの、2番目に高いステータスが選択項目の武将です。レアリティと技能条件の絞り込みを反映しています。",
        chainContext
      ),
      exact: sortMatches(
        filteredCharacters.filter((character) => character.top1.key === primary),
        sortContext
      ),
      partial: sortMatches(
        filteredCharacters.filter((character) => character.top2.key === primary),
        sortContext
      ),
      exactEmptyMessage: "1位一致の武将はいません。",
      partialEmptyMessage: "2位一致の武将はいません。"
    };
  }

  return {
    summary: formatSummary(primary, secondary, rarities, conditions, chainContext),
    exactTitle: `完全一致: ${labelFor(primary)} → ${labelFor(secondary)}`,
    exactDescription: buildStateDescription(
      "1位・2位の並び順まで一致する武将です。レアリティと技能条件の絞り込みを反映しています。",
      chainContext
    ),
    partialTitle: `逆順一致: ${labelFor(secondary)} → ${labelFor(primary)}`,
    partialDescription: buildStateDescription(
      "上位2項目は一致するものの、1位・2位の順番が逆の武将です。レアリティと技能条件の絞り込みを反映しています。",
      chainContext
    ),
    exact: sortMatches(
      filteredCharacters.filter(
        (character) => character.top1.key === primary && character.top2.key === secondary
      ),
      sortContext
    ),
    partial: sortMatches(
      filteredCharacters.filter(
        (character) => character.top1.key === secondary && character.top2.key === primary
      ),
      sortContext
    ),
    exactEmptyMessage: "完全一致の武将はいません。",
    partialEmptyMessage: "逆順一致の武将はいません。"
  };
}

function renderSkillChips(character, selectedConditions) {
  const matchedSkills = getMatchedSkills(character, selectedConditions);
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

function renderChainInfo(character, chainContext) {
  if (!chainContext.chainSortEnabled || !chainContext.chainReference) {
    return "";
  }

  const { rate, shared } = getChainStats(chainContext.chainReference, character);
  const sharedText = shared.length ? shared.join(" / ") : "共通個性なし";

  return `
    <div class="chain-box">
      <div class="chain-head">
        <span class="chain-pill">連鎖率 ${escapeHtml(formatPercent(rate))}</span>
        <span class="chain-pill chain-pill-muted">共通個性 ${shared.length}個</span>
      </div>
      <p class="chain-traits">${escapeHtml(sharedText)}</p>
    </div>
  `;
}

function renderCards(
  list,
  selectedStats,
  selectedConditions,
  chainContext,
  emptyMessage = "一致する武将はいません。"
) {
  const selectedSet = new Set(selectedStats.filter(Boolean));

  if (!list.length) {
    return `
      <div class="empty-state">
        <p>${escapeHtml(emptyMessage)}</p>
      </div>
    `;
  }

  return list
    .map((character) => {
      const stats = STAT_DEFS.map((stat) => {
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
                  <p class="subline">${escapeHtml(character.rarity)} / 天賦 ${character.tenpu}</p>
                </div>
                <a class="source-link" href="${escapeHtml(character.sourceUrl)}" target="_blank" rel="noreferrer">GameWith</a>
              </div>
              <div class="top-pair">
                <span class="pair-badge rank-1">1位: ${escapeHtml(character.top1.label)} ${character.top1.value}</span>
                <span class="pair-badge rank-2">2位: ${escapeHtml(character.top2.label)} ${character.top2.value}</span>
              </div>
              ${renderChainInfo(character, chainContext)}
              ${renderSkillChips(character, selectedConditions)}
              <dl class="stats-grid">
                ${stats}
              </dl>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderEmptySearchState() {
  elements.summary.textContent =
    "第1ステータスや技能条件、連鎖率ソートを使って、戦力を伸ばしやすい武将を条件別に探せます。";

  elements.exactTitle.textContent = "検索の使い方";
  elements.exactDescription.textContent =
    "第1ステータスだけを選ぶと 1位一致 / 2位一致、第1・第2ステータスを選ぶと 完全一致 / 逆順一致 で表示します。";
  elements.exactCount.textContent = "";
  elements.exactList.innerHTML = `
    <div class="empty-state">
      <p>まずは攻撃・防御・戦威・策略のいずれか、技能条件、または連鎖率ソートを選んでください。</p>
    </div>
  `;

  elements.partialTitle.textContent = "技能と連鎖率";
  elements.partialDescription.textContent =
    "技能条件は同じ技能ごとにまとまり、連鎖率ソートをオンにすると並び順の最優先になります。";
  elements.partialCount.textContent = "";
  elements.partialList.innerHTML = `
    <div class="empty-state">
      <p>魅力は戦力に影響しないため除外しています。SSR と SR のみを対象にしています。</p>
    </div>
  `;
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

function renderSearchResults() {
  syncSecondaryOptions();

  const primary = elements.primaryStat.value;
  const secondary = elements.secondaryStat.value;
  const rarities = readCheckedValues("rarity");
  const conditions = readCheckedValues("condition");
  const chainSortEnabled = elements.chainSortEnabled.checked;
  const chainReference = characterByName[elements.chainCommander.value.trim()] ?? null;

  const chainContext = {
    chainSortEnabled,
    chainReference
  };

  const hasActiveFilter =
    Boolean(primary) ||
    Boolean(secondary) ||
    Boolean(conditions.length) ||
    rarities.length !== RARITY_DEFS.length ||
    (chainSortEnabled && chainReference);

  if (!rarities.length) {
    setValidationMessage("SSR か SR を1つ以上選んでください。");
    return;
  }

  if (!primary && secondary) {
    setValidationMessage("第2ステータスを使う場合は、第1ステータスも選んでください。");
    return;
  }

  if (primary && secondary && primary === secondary) {
    setValidationMessage("第1ステータスと第2ステータスに同じ項目は選べません。");
    return;
  }

  if (chainSortEnabled && !chainReference) {
    setValidationMessage("連鎖率順を使う場合は、基準武将を一覧から選んでください。");
    return;
  }

  setValidationMessage("");

  if (!hasActiveFilter) {
    renderEmptySearchState();
    return;
  }

  const state = getSearchState(primary, secondary, rarities, conditions, chainContext);

  elements.summary.textContent = state.summary || "条件に一致する武将を表示しています。";

  elements.exactTitle.textContent = state.exactTitle;
  elements.exactDescription.textContent = state.exactDescription;
  elements.exactCount.textContent = `${state.exact.length}体`;
  elements.exactList.innerHTML = renderCards(
    state.exact,
    [primary, secondary],
    conditions,
    chainContext,
    state.exactEmptyMessage
  );

  elements.partialTitle.textContent = state.partialTitle;
  elements.partialDescription.textContent = state.partialDescription;
  elements.partialCount.textContent = state.partial.length ? `${state.partial.length}体` : "";
  elements.partialList.innerHTML = renderCards(
    state.partial,
    [primary, secondary],
    conditions,
    chainContext,
    state.partialEmptyMessage
  );
}

function resetSearch() {
  elements.primaryStat.value = "";
  elements.secondaryStat.value = "";
  elements.chainCommander.value = "";
  elements.chainSortEnabled.checked = false;

  document
    .querySelectorAll('input[name="rarity"]')
    .forEach((input) => (input.checked = defaultRarities.includes(input.value)));

  document
    .querySelectorAll('input[name="condition"]')
    .forEach((input) => (input.checked = false));

  setValidationMessage("");
  renderSearchResults();
}

function bindSkillDialog() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-skill-name]");
    if (!button) {
      return;
    }

    openSkillDialog(button.dataset.skillName);
  });

  elements.skillDialogClose.addEventListener("click", closeSkillDialog);
  elements.skillDialog.addEventListener("click", (event) => {
    if (event.target === elements.skillDialog) {
      closeSkillDialog();
    }
  });
}

function boot() {
  populateSelect(elements.primaryStat, "ステータスを選択");
  populateSelect(elements.secondaryStat, "なし");
  populateCommanderDatalist();
  renderCheckboxGroup(elements.rarityFilters, RARITY_DEFS, "rarity", defaultRarities);
  renderCheckboxGroup(elements.conditionFilters, CONDITION_DEFS, "condition", []);

  const ssrCount = preparedCharacters.filter((character) => character.rarity === "SSR").length;
  const srCount = preparedCharacters.filter((character) => character.rarity === "SR").length;

  elements.datasetCount.textContent = `${preparedCharacters.length}体`;
  elements.ssrCount.textContent = `${ssrCount}体`;
  elements.srCount.textContent = `${srCount}体`;

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    renderSearchResults();
  });

  elements.form.addEventListener("change", renderSearchResults);
  elements.chainCommander.addEventListener("input", renderSearchResults);
  elements.resetButton.addEventListener("click", resetSearch);

  bindSkillDialog();
  renderEmptySearchState();
  syncSecondaryOptions();
}

boot();
