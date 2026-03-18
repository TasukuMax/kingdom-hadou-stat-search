const STAT_DEFS = [
  { key: "attack", label: "攻撃" },
  { key: "defense", label: "防御" },
  { key: "war", label: "戦威" },
  { key: "strategy", label: "策略" }
];

const STAT_MAP = Object.fromEntries(STAT_DEFS.map((stat) => [stat.key, stat]));

const preparedCharacters = CHARACTERS.map((character) => {
  const rankedStats = STAT_DEFS
    .map((stat, priority) => ({
      ...stat,
      value: character[stat.key],
      priority
    }))
    .sort((left, right) => right.value - left.value || left.priority - right.priority);

  return {
    ...character,
    rankedStats,
    top1: rankedStats[0],
    top2: rankedStats[1]
  };
}).sort((left, right) =>
  right.tenpu - left.tenpu ||
  right.top1.value - left.top1.value ||
  right.top2.value - left.top2.value ||
  left.name.localeCompare(right.name, "ja")
);

const elements = {
  form: document.querySelector("#searchForm"),
  primaryStat: document.querySelector("#primaryStat"),
  secondaryStat: document.querySelector("#secondaryStat"),
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
  datasetCount: document.querySelector("#datasetCount")
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

function populateSelect(select, placeholder) {
  const options = [`<option value="">${placeholder}</option>`];

  for (const stat of STAT_DEFS) {
    options.push(`<option value="${stat.key}">${stat.label}</option>`);
  }

  select.innerHTML = options.join("");
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

function sortMatches(list, selectedStats) {
  const relevantStats = [...new Set(selectedStats.filter(Boolean))];

  return [...list].sort((left, right) => {
    for (const statKey of relevantStats) {
      if (right[statKey] !== left[statKey]) {
        return right[statKey] - left[statKey];
      }
    }

    return (
      right.top1.value - left.top1.value ||
      right.top2.value - left.top2.value ||
      right.tenpu - left.tenpu ||
      left.name.localeCompare(right.name, "ja")
    );
  });
}

function getSearchState(primary, secondary) {
  if (!primary) {
    return null;
  }

  if (!secondary) {
    return {
      summary: `検索条件: ${labelFor(primary)}`,
      exactTitle: `完全一致: 1位が${labelFor(primary)}`,
      exactDescription: "最も高いステータスが選択した項目です。",
      partialTitle: `ある程度一致: 2位が${labelFor(primary)}`,
      partialDescription: "最高値ではないものの、上位2つのうち2位に入っています。",
      exact: sortMatches(preparedCharacters.filter((character) => character.top1.key === primary), [primary]),
      partial: sortMatches(preparedCharacters.filter((character) => character.top2.key === primary), [primary])
    };
  }

  return {
    summary: `検索条件: ${labelFor(primary)} → ${labelFor(secondary)}`,
    exactTitle: `完全一致: ${labelFor(primary)} → ${labelFor(secondary)}`,
    exactDescription: "1位と2位の順番まで一致しています。",
    partialTitle: `ある程度一致: ${labelFor(secondary)} → ${labelFor(primary)}`,
    partialDescription: "上位2つは一致していますが、順番が逆です。",
    exact: sortMatches(
      preparedCharacters.filter(
        (character) => character.top1.key === primary && character.top2.key === secondary
      ),
      [primary, secondary]
    ),
    partial: sortMatches(
      preparedCharacters.filter(
        (character) => character.top1.key === secondary && character.top2.key === primary
      ),
      [primary, secondary]
    )
  };
}

function renderCards(list, selectedStats) {
  const selectedSet = new Set(selectedStats.filter(Boolean));

  if (!list.length) {
    return `
      <div class="empty-state">
        <p>該当する武将はいません。</p>
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
              <p class="subline">天賦 ${character.tenpu}</p>
            </div>
            <a class="source-link" href="${escapeHtml(character.sourceUrl)}" target="_blank" rel="noreferrer">GameWith</a>
          </div>
          <div class="top-pair">
            <span class="pair-badge rank-1">1位 ${escapeHtml(character.top1.label)} ${character.top1.value}</span>
            <span class="pair-badge rank-2">2位 ${escapeHtml(character.top2.label)} ${character.top2.value}</span>
          </div>
          <dl class="stats-grid">
            ${stats}
          </dl>
        </article>
      `;
    })
    .join("");
}

function renderEmptySearchState() {
  elements.summary.textContent = "1つまたは2つのステータスを選ぶと、上位2ステータスに基づいて武将を振り分けます。";

  elements.exactTitle.textContent = "完全一致";
  elements.exactDescription.textContent = "例: 攻撃 → 防御 なら、1位が攻撃・2位が防御の武将を表示します。";
  elements.exactCount.textContent = "";
  elements.exactList.innerHTML = `
    <div class="empty-state">
      <p>まずは検索条件を選んでください。</p>
    </div>
  `;

  elements.partialTitle.textContent = "ある程度一致";
  elements.partialDescription.textContent = "例: 攻撃 → 防御 のとき、防御 → 攻撃の武将はこちらに出ます。";
  elements.partialCount.textContent = "";
  elements.partialList.innerHTML = `
    <div class="empty-state">
      <p>単独検索なら「2位一致」、2項目検索なら「逆順一致」を表示します。</p>
    </div>
  `;
}

function renderSearchResults() {
  syncSecondaryOptions();

  const primary = elements.primaryStat.value;
  const secondary = elements.secondaryStat.value;

  if (primary && secondary && primary === secondary) {
    setValidationMessage("同じステータスを2回選ぶことはできません。");
    return;
  }

  setValidationMessage("");

  const state = getSearchState(primary, secondary);
  if (!state) {
    renderEmptySearchState();
    return;
  }

  elements.summary.textContent = state.summary;

  elements.exactTitle.textContent = state.exactTitle;
  elements.exactDescription.textContent = state.exactDescription;
  elements.exactCount.textContent = `${state.exact.length}体`;
  elements.exactList.innerHTML = renderCards(state.exact, [primary, secondary]);

  elements.partialTitle.textContent = state.partialTitle;
  elements.partialDescription.textContent = state.partialDescription;
  elements.partialCount.textContent = `${state.partial.length}体`;
  elements.partialList.innerHTML = renderCards(state.partial, [primary, secondary]);
}

function resetSearch() {
  elements.primaryStat.value = "";
  elements.secondaryStat.value = "";
  setValidationMessage("");
  renderSearchResults();
}

function boot() {
  populateSelect(elements.primaryStat, "ステータスを選択");
  populateSelect(elements.secondaryStat, "なし");
  elements.datasetCount.textContent = `${preparedCharacters.length}体`;

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    renderSearchResults();
  });

  elements.primaryStat.addEventListener("change", renderSearchResults);
  elements.secondaryStat.addEventListener("change", renderSearchResults);
  elements.resetButton.addEventListener("click", resetSearch);

  renderEmptySearchState();
  syncSecondaryOptions();
}

boot();
