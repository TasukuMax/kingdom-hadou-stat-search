const STAT_DEFS = [
  { key: "attack", label: "攻撃" },
  { key: "defense", label: "防御" },
  { key: "war", label: "戦威" },
  { key: "strategy", label: "策略" }
];

const CONDITION_DEFS = [
  { key: "front", label: "前列", hint: "破壁 / 守壁 / 攻陣" },
  { key: "middle", label: "中列", hint: "枢機" },
  { key: "back", label: "後列", hint: "防陣 / 後備" },
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

const defaultRarities = RARITY_DEFS.map((rarity) => rarity.key);

const preparedCharacters = CHARACTERS.map((character) => {
  const rankedStats = STAT_DEFS
    .map((stat, priority) => ({
      ...stat,
      value: character[stat.key],
      priority
    }))
    .sort((left, right) => right.value - left.value || left.priority - right.priority);

  const conditionIndex = Object.fromEntries(
    CONDITION_DEFS.map((condition) => [
      condition.key,
      character.conditionalSkills.filter((skill) => skill.conditions.includes(condition.key))
    ])
  );

  return {
    ...character,
    rankedStats,
    top1: rankedStats[0],
    top2: rankedStats[1],
    conditionIndex
  };
});

const elements = {
  form: document.querySelector("#searchForm"),
  primaryStat: document.querySelector("#primaryStat"),
  secondaryStat: document.querySelector("#secondaryStat"),
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
  srCount: document.querySelector("#srCount")
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

function populateSelect(select, placeholder) {
  const options = [`<option value="">${placeholder}</option>`];

  for (const stat of STAT_DEFS) {
    options.push(`<option value="${stat.key}">${stat.label}</option>`);
  }

  select.innerHTML = options.join("");
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

function getMatchedConditionSkills(character, selectedConditions) {
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
    (left, right) =>
      right.conditions.length - left.conditions.length ||
      left.name.localeCompare(right.name, "ja")
  );
}

function countMatchedConditions(character, selectedConditions) {
  return selectedConditions.filter((condition) => (character.conditionIndex[condition] ?? []).length > 0)
    .length;
}

function matchesConditions(character, selectedConditions) {
  return selectedConditions.every((condition) => (character.conditionIndex[condition] ?? []).length > 0);
}

function matchesFilters(character, selectedRarities, selectedConditions) {
  return selectedRarities.includes(character.rarity) && matchesConditions(character, selectedConditions);
}

function sortMatches(list, selectedStats, selectedConditions) {
  const relevantStats = [...new Set(selectedStats.filter(Boolean))];

  return [...list].sort((left, right) => {
    const conditionCountDiff =
      countMatchedConditions(right, selectedConditions) -
      countMatchedConditions(left, selectedConditions);
    if (conditionCountDiff) {
      return conditionCountDiff;
    }

    const conditionSkillDiff =
      getMatchedConditionSkills(right, selectedConditions).length -
      getMatchedConditionSkills(left, selectedConditions).length;
    if (conditionSkillDiff) {
      return conditionSkillDiff;
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

function formatSummary(primary, secondary, rarities, conditions) {
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

  if (!parts.length) {
    return "";
  }

  return `検索条件: ${parts.join("  |  ")}`;
}

function getSearchState(primary, secondary, rarities, conditions) {
  const filteredCharacters = sortMatches(
    preparedCharacters.filter((character) => matchesFilters(character, rarities, conditions)),
    [primary, secondary],
    conditions
  );

  if (!primary) {
    return {
      summary: formatSummary(primary, secondary, rarities, conditions),
      exactTitle: "条件一致",
      exactDescription:
        "選択したレアリティと技能条件に一致する武将です。魅力は除外し、攻撃・防御・戦威・策略の4項目だけを表示しています。",
      partialTitle: "ステータス検索の使い方",
      partialDescription:
        "第1ステータスを選ぶと 1位一致 / 2位一致、第1・第2ステータスを選ぶと 完全一致 / 逆順一致 で分けて表示します。",
      exact: filteredCharacters,
      partial: [],
      exactEmptyMessage: "条件に一致する武将はいません。",
      partialEmptyMessage: "ステータスを追加すると、ここに 2位一致 や 逆順一致 を表示します。"
    };
  }

  if (!secondary) {
    return {
      summary: formatSummary(primary, secondary, rarities, conditions),
      exactTitle: `1位一致: ${labelFor(primary)}`,
      exactDescription:
        "最も高いステータスが選択項目の武将です。レアリティと技能条件の絞り込みを反映しています。",
      partialTitle: `2位一致: ${labelFor(primary)}`,
      partialDescription:
        "1位ではないものの、2番目に高いステータスが選択項目の武将です。レアリティと技能条件の絞り込みを反映しています。",
      exact: sortMatches(
        filteredCharacters.filter((character) => character.top1.key === primary),
        [primary],
        conditions
      ),
      partial: sortMatches(
        filteredCharacters.filter((character) => character.top2.key === primary),
        [primary],
        conditions
      ),
      exactEmptyMessage: "1位一致の武将はいません。",
      partialEmptyMessage: "2位一致の武将はいません。"
    };
  }

  return {
    summary: formatSummary(primary, secondary, rarities, conditions),
    exactTitle: `完全一致: ${labelFor(primary)} → ${labelFor(secondary)}`,
    exactDescription:
      "1位・2位の並び順まで一致する武将です。レアリティと技能条件の絞り込みを反映しています。",
    partialTitle: `逆順一致: ${labelFor(secondary)} → ${labelFor(primary)}`,
    partialDescription:
      "上位2項目は一致するものの、1位・2位の順番が逆の武将です。レアリティと技能条件の絞り込みを反映しています。",
    exact: sortMatches(
      filteredCharacters.filter(
        (character) => character.top1.key === primary && character.top2.key === secondary
      ),
      [primary, secondary],
      conditions
    ),
    partial: sortMatches(
      filteredCharacters.filter(
        (character) => character.top1.key === secondary && character.top2.key === primary
      ),
      [primary, secondary],
      conditions
    ),
    exactEmptyMessage: "完全一致の武将はいません。",
    partialEmptyMessage: "逆順一致の武将はいません。"
  };
}

function renderConditionSkills(character, selectedConditions) {
  const matchedSkills = getMatchedConditionSkills(character, selectedConditions);

  if (!matchedSkills.length) {
    return "";
  }

  return `
    <div class="skill-group">
      <p class="skill-group-title">一致した技能条件</p>
      <div class="skill-chip-list">
        ${matchedSkills
          .map((skill) => {
            const labels = skill.conditions.map(conditionLabelFor).join(" / ");
            return `
              <a
                class="skill-chip"
                href="${escapeHtml(skill.sourceUrl)}"
                target="_blank"
                rel="noreferrer"
                title="${escapeHtml(skill.initialEffect)}"
              >
                <strong>${escapeHtml(skill.name)}</strong>
                <small>${escapeHtml(labels)}</small>
              </a>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderCards(list, selectedStats, selectedConditions, emptyMessage = "一致する武将はいません。") {
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
          ${renderConditionSkills(character, selectedConditions)}
          <dl class="stats-grid">
            ${stats}
          </dl>
        </article>
      `;
    })
    .join("");
}

function renderEmptySearchState() {
  elements.summary.textContent =
    "第1ステータスや技能条件を選ぶと、戦力を伸ばしやすい武将を条件別に探せます。";

  elements.exactTitle.textContent = "検索の使い方";
  elements.exactDescription.textContent =
    "第1ステータスだけを選ぶと 1位一致 / 2位一致、第1・第2ステータスを選ぶと 完全一致 / 逆順一致 で表示します。";
  elements.exactCount.textContent = "";
  elements.exactList.innerHTML = `
    <div class="empty-state">
      <p>まずは攻撃・防御・戦威・策略のいずれか、または技能条件を選んでください。</p>
    </div>
  `;

  elements.partialTitle.textContent = "技能条件フィルタ";
  elements.partialDescription.textContent =
    "前列 / 中列 / 後列 と、主将 / 副将 / 補佐 の条件を同じ画面で絞り込めます。";
  elements.partialCount.textContent = "";
  elements.partialList.innerHTML = `
    <div class="empty-state">
      <p>魅力は戦力に影響しないため除外しています。SSR と SR のみを対象にしています。</p>
    </div>
  `;
}

function renderSearchResults() {
  syncSecondaryOptions();

  const primary = elements.primaryStat.value;
  const secondary = elements.secondaryStat.value;
  const rarities = readCheckedValues("rarity");
  const conditions = readCheckedValues("condition");

  const hasActiveFilter =
    Boolean(primary) ||
    Boolean(secondary) ||
    Boolean(conditions.length) ||
    rarities.length !== RARITY_DEFS.length;

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

  setValidationMessage("");

  if (!hasActiveFilter) {
    renderEmptySearchState();
    return;
  }

  const state = getSearchState(primary, secondary, rarities, conditions);

  elements.summary.textContent = state.summary || "条件に一致する武将を表示しています。";

  elements.exactTitle.textContent = state.exactTitle;
  elements.exactDescription.textContent = state.exactDescription;
  elements.exactCount.textContent = `${state.exact.length}体`;
  elements.exactList.innerHTML = renderCards(
    state.exact,
    [primary, secondary],
    conditions,
    state.exactEmptyMessage
  );

  elements.partialTitle.textContent = state.partialTitle;
  elements.partialDescription.textContent = state.partialDescription;
  elements.partialCount.textContent = state.partial.length ? `${state.partial.length}体` : "";
  elements.partialList.innerHTML = renderCards(
    state.partial,
    [primary, secondary],
    conditions,
    state.partialEmptyMessage
  );
}

function resetSearch() {
  elements.primaryStat.value = "";
  elements.secondaryStat.value = "";

  document
    .querySelectorAll('input[name="rarity"]')
    .forEach((input) => (input.checked = defaultRarities.includes(input.value)));

  document
    .querySelectorAll('input[name="condition"]')
    .forEach((input) => (input.checked = false));

  setValidationMessage("");
  renderSearchResults();
}

function boot() {
  populateSelect(elements.primaryStat, "ステータスを選択");
  populateSelect(elements.secondaryStat, "なし");
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
  elements.resetButton.addEventListener("click", resetSearch);

  renderEmptySearchState();
  syncSecondaryOptions();
}

boot();
