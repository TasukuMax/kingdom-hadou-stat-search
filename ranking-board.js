(() => {
  const root = document.querySelector("#rankingBoardRoot");
  if (!root) {
    return;
  }

  const STORAGE_KEY = "kh-ranking-board-v4";
  const SHARE_STATE_VERSION = 1;
  const API_BASE = "/api";
  const SHARED_DATA_URL = "./shared/rankings.json";
  const MAX_IMAGE_DIMENSION = 960;
  const IMAGE_OUTPUT_QUALITY = 0.76;
  const numberFormatter = new Intl.NumberFormat("ja-JP");
  const SERVER_OPTIONS = ["1", "2", "3"];
  const VIEW_DEFS = [
    {
      key: "overall",
      label: "全体ランキング",
      shortLabel: "総合",
      helper: "サーバー1〜3をまとめた全体の上位100人です。"
    },
    {
      key: "server-1",
      label: "サーバー1",
      shortLabel: "鯖1",
      helper: "サーバー1の上位100人です。",
      server: "1"
    },
    {
      key: "server-2",
      label: "サーバー2",
      shortLabel: "鯖2",
      helper: "サーバー2の上位100人です。",
      server: "2"
    },
    {
      key: "server-3",
      label: "サーバー3",
      shortLabel: "鯖3",
      helper: "サーバー3の上位100人です。",
      server: "3"
    }
  ];

  const defaultRemoteEntries = Array.isArray(window.KH_RANKING_REMOTE_DATA?.entries)
    ? window.KH_RANKING_REMOTE_DATA.entries
    : [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatCount(value) {
    return numberFormatter.format(Number(value || 0));
  }

  function showToast(message) {
    if (message) {
      window.KH_APP_API?.showStatusToast?.(message);
    }
  }

  function viewMeta(viewKey) {
    return VIEW_DEFS.find((view) => view.key === viewKey) ?? VIEW_DEFS[0];
  }

  function serverToViewKey(server) {
    return SERVER_OPTIONS.includes(String(server)) ? `server-${server}` : VIEW_DEFS[0].key;
  }

  function createEmptyDraft() {
    return {
      server: SERVER_OPTIONS[0],
      playerName: "",
      powerValue: "",
      proofImageUrl: "",
      proofFileName: ""
    };
  }

  function createDefaultState() {
    return {
      localEntries: [],
      filters: {
        viewKey: VIEW_DEFS[0].key
      },
      draft: createEmptyDraft(),
      selectedId: "",
      manageTokens: {}
    };
  }

  function sanitizeTokenMap(rawValue) {
    if (!rawValue || typeof rawValue !== "object") {
      return {};
    }
    return Object.fromEntries(
      Object.entries(rawValue)
        .filter(([key, value]) => key && value)
        .map(([key, value]) => [String(key), String(value)])
    );
  }

  function sanitizeEntry(rawEntry, fallbackSource = "local") {
    if (!rawEntry || typeof rawEntry !== "object") {
      return null;
    }

    const server = String(rawEntry.server || "").trim();
    const playerName = String(rawEntry.playerName || "").trim();
    const powerValue = Number(rawEntry.powerValue || 0);
    if (!server || !playerName || !Number.isFinite(powerValue) || powerValue <= 0) {
      return null;
    }

    return {
      id: String(rawEntry.id || `${fallbackSource}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      server,
      playerName,
      powerType: "戦闘力",
      powerValue,
      proofImageUrl: String(rawEntry.proofImageUrl || ""),
      proofFileName: String(rawEntry.proofFileName || ""),
      postedAt: String(rawEntry.postedAt || new Date().toISOString()),
      source: rawEntry.source === "remote" ? "remote" : fallbackSource
    };
  }

  function sanitizeDraft(rawDraft) {
    const fallback = createEmptyDraft();
    if (!rawDraft || typeof rawDraft !== "object") {
      return fallback;
    }
    const server = String(rawDraft.server || fallback.server).trim();
    return {
      server: SERVER_OPTIONS.includes(server) ? server : fallback.server,
      playerName: String(rawDraft.playerName || "").trim(),
      powerValue: String(rawDraft.powerValue || "").replace(/[^\d]/g, ""),
      proofImageUrl: String(rawDraft.proofImageUrl || ""),
      proofFileName: String(rawDraft.proofFileName || "")
    };
  }

  function sanitizeFilters(rawFilters) {
    const rawViewKey = String(rawFilters?.viewKey || rawFilters?.boardKey || VIEW_DEFS[0].key);
    return {
      viewKey: VIEW_DEFS.some((view) => view.key === rawViewKey) ? rawViewKey : VIEW_DEFS[0].key
    };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        localEntries: Array.isArray(parsed.localEntries)
          ? parsed.localEntries.map((entry) => sanitizeEntry(entry, "local")).filter(Boolean)
          : [],
        filters: sanitizeFilters(parsed.filters),
        draft: sanitizeDraft(parsed.draft),
        selectedId: String(parsed.selectedId || ""),
        manageTokens: sanitizeTokenMap(parsed.manageTokens)
      };
    } catch (error) {
      return createDefaultState();
    }
  }

  const state = loadState();
  const apiState = {
    checked: false,
    available: false,
    sharedAvailable: false,
    syncing: false,
    remoteEntries: defaultRemoteEntries
      .map((entry) => sanitizeEntry({ ...entry, source: "remote" }, "remote"))
      .filter(Boolean)
  };

  function saveState() {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: SHARE_STATE_VERSION,
          localEntries: state.localEntries,
          filters: state.filters,
          draft: state.draft,
          selectedId: state.selectedId,
          manageTokens: state.manageTokens
        })
      );
      window.KH_APP_API?.updateBackupMeta?.();
      return true;
    } catch (error) {
      showToast("ランキング設定を保存できませんでした。");
      return false;
    }
  }

  function getAllEntries() {
    const merged = new Map();
    [...apiState.remoteEntries, ...state.localEntries].forEach((entry) => {
      merged.set(entry.id, entry);
    });
    return [...merged.values()];
  }

  function sortEntries(entries) {
    return [...entries].sort((left, right) => {
      if (right.powerValue !== left.powerValue) {
        return right.powerValue - left.powerValue;
      }
      return String(right.postedAt).localeCompare(String(left.postedAt));
    });
  }

  function getScopedEntries() {
    const currentView = viewMeta(state.filters.viewKey);
    const filtered = getAllEntries().filter((entry) => {
      if (!SERVER_OPTIONS.includes(entry.server)) {
        return false;
      }
      if (!currentView.server) {
        return true;
      }
      return entry.server === currentView.server;
    });
    return sortEntries(filtered);
  }

  function getVisibleEntries() {
    return getScopedEntries().slice(0, 100);
  }

  function findEntry(entryId) {
    return getAllEntries().find((entry) => entry.id === entryId) ?? null;
  }

  function ensureSelectedEntry(visibleEntries) {
    if (visibleEntries.some((entry) => entry.id === state.selectedId)) {
      return;
    }
    state.selectedId = visibleEntries[0]?.id || "";
  }

  function canDeleteEntry(entry) {
    return Boolean(entry && (entry.source === "local" || state.manageTokens[entry.id]));
  }

  async function requestJson(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json;charset=utf-8");
    }

    const response = await fetch(path, {
      method: options.method || "GET",
      headers,
      body: options.body,
      cache: "no-store"
    });

    if (!response.ok) {
      let message = "";
      try {
        const payload = await response.json();
        message = payload?.error || "";
      } catch (error) {
        // ignore JSON parse errors
      }
      throw new Error(message || `request-failed-${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  async function refreshRemoteEntries() {
    if (!apiState.available) {
      return;
    }
    apiState.syncing = true;
    renderAll();
    try {
      const payload = await requestJson(`${API_BASE}/rankings`);
      apiState.remoteEntries = Array.isArray(payload?.entries)
        ? payload.entries.map((entry) => sanitizeEntry({ ...entry, source: "remote" }, "remote")).filter(Boolean)
        : [];
    } finally {
      apiState.syncing = false;
    }
  }

  async function refreshSharedEntries() {
    try {
      const response = await fetch(SHARED_DATA_URL, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`shared-data-${response.status}`);
      }
      const payload = await response.json();
      apiState.remoteEntries = Array.isArray(payload?.entries)
        ? payload.entries.map((entry) => sanitizeEntry({ ...entry, source: "remote" }, "remote")).filter(Boolean)
        : [];
      apiState.sharedAvailable = true;
    } catch (error) {
      apiState.sharedAvailable = false;
      if (!apiState.available) {
        apiState.remoteEntries = defaultRemoteEntries
          .map((entry) => sanitizeEntry({ ...entry, source: "remote" }, "remote"))
          .filter(Boolean);
      }
    }
  }

  async function probeApiAvailability() {
    try {
      const payload = await requestJson(`${API_BASE}/health`);
      apiState.available = Boolean(payload?.ok);
      if (apiState.available) {
        await refreshRemoteEntries();
      } else {
        await refreshSharedEntries();
      }
    } catch (error) {
      apiState.available = false;
      await refreshSharedEntries();
    } finally {
      apiState.checked = true;
      renderAll();
    }
  }

  function buildSummaryCards(scopedEntries, visibleEntries) {
    const topPower = scopedEntries[0]?.powerValue ?? 0;
    const tenthPower = scopedEntries[9]?.powerValue ?? 0;
    const hundredthPower = scopedEntries[99]?.powerValue ?? 0;
    return [
      { label: "対象人数", value: `${formatCount(scopedEntries.length)}人`, accent: "is-gold" },
      { label: "1位戦闘力", value: topPower ? formatCount(topPower) : "-", accent: "is-bronze" },
      { label: "10位ボーダー", value: tenthPower ? formatCount(tenthPower) : "-", accent: "" },
      { label: "100位ボーダー", value: hundredthPower ? formatCount(hundredthPower) : "-", accent: "" }
    ]
      .map(
        (card) => `
          <article class="ranking-stat-card${card.accent ? ` ${card.accent}` : ""}">
            <span>${escapeHtml(card.label)}</span>
            <strong>${escapeHtml(card.value)}</strong>
          </article>
        `
      )
      .join("");
  }

  function buildViewTabs() {
    return VIEW_DEFS.map((view) => {
      const isActive = view.key === state.filters.viewKey;
      return `
        <button class="ranking-board-tab${isActive ? " is-active" : ""}" type="button" data-ranking-view-tab="${escapeHtml(view.key)}">
          <strong>${escapeHtml(view.shortLabel)}</strong>
          <span>${escapeHtml(view.label)}</span>
        </button>
      `;
    }).join("");
  }

  function buildHeroCards(entries) {
    if (!entries.length) {
      return `
        <div class="ranking-empty-state">
          <strong>まだ投稿がありません。</strong>
          <p>サーバーを選んで、名前・戦闘力・証明画像だけで投稿できます。</p>
        </div>
      `;
    }

    return entries
      .map((entry, index) => {
        const isSelected = entry.id === state.selectedId;
        return `
          <article class="ranking-hero-card${isSelected ? " is-selected" : ""}" data-ranking-entry-id="${escapeHtml(entry.id)}">
            <div class="ranking-hero-card__head">
              <div>
                <p class="journey-eyebrow">サーバー${escapeHtml(entry.server)}</p>
                <h3>${escapeHtml(entry.playerName)}</h3>
              </div>
              <span class="ranking-hero-card__rank">#${index + 1}</span>
            </div>
            <div class="ranking-hero-card__power">
              <span>戦闘力</span>
              <strong>${escapeHtml(formatCount(entry.powerValue))}</strong>
            </div>
            <div class="ranking-chip-row">
              ${
                state.manageTokens[entry.id]
                  ? '<span class="ranking-chip is-accent">自分の投稿</span>'
                  : entry.source === "local"
                    ? '<span class="ranking-chip is-accent">この端末</span>'
                    : '<span class="ranking-chip">共有中</span>'
              }
              <button class="mini-button" type="button" data-ranking-preview-id="${escapeHtml(entry.id)}">証明を見る</button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function buildCompactRows(entries, startRank) {
    if (!entries.length) {
      return `
        <div class="ranking-empty-state">
          <strong>11位以降の投稿はまだありません。</strong>
          <p>上位10名の下に、11位〜100位を並べていきます。</p>
        </div>
      `;
    }

    return entries
      .map((entry, index) => {
        const rank = startRank + index;
        const isSelected = entry.id === state.selectedId;
        return `
          <article class="ranking-compact-entry${isSelected ? " is-selected" : ""}" data-ranking-entry-id="${escapeHtml(entry.id)}">
            <div class="ranking-compact-entry__rank">${rank}</div>
            <div class="ranking-compact-entry__body">
              <strong>${escapeHtml(entry.playerName)}</strong>
              <span>サーバー${escapeHtml(entry.server)}</span>
            </div>
            <div class="ranking-compact-entry__power">${escapeHtml(formatCount(entry.powerValue))}</div>
            <button class="mini-button" type="button" data-ranking-preview-id="${escapeHtml(entry.id)}">証明</button>
          </article>
        `;
      })
      .join("");
  }

  function buildProofViewer(entry) {
    if (!entry) {
      return `
        <div class="ranking-proof-empty">
          <strong>ランキングを選ぶと証明画像を表示します。</strong>
          <p>上位10人カードか、11位以降の一覧を押すとここで証明画像を確認できます。</p>
        </div>
      `;
    }

    const postedLabel = new Date(entry.postedAt).toLocaleString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    return `
      <div class="ranking-proof-panel">
        <div class="ranking-proof-panel__meta">
          <div>
            <p class="journey-eyebrow">サーバー${escapeHtml(entry.server)}</p>
            <h3>${escapeHtml(entry.playerName)}</h3>
            <p>戦闘力 ${escapeHtml(formatCount(entry.powerValue))}</p>
          </div>
          <span class="count-pill">${escapeHtml(postedLabel)}</span>
        </div>
        ${
          entry.proofImageUrl
            ? `<img class="ranking-proof-image" src="${escapeHtml(entry.proofImageUrl)}" alt="${escapeHtml(entry.playerName)} の証明画像">`
            : '<div class="ranking-proof-image ranking-proof-image--empty">証明画像なし</div>'
        }
      </div>
    `;
  }

  function buildDraftPreview() {
    return `
      <div class="ranking-draft-card">
        <div>
          <p class="journey-eyebrow">投稿プレビュー</p>
          <h3>${escapeHtml(state.draft.playerName || "プレイヤー名を入力してください")}</h3>
          <p>サーバー${escapeHtml(state.draft.server)} / 戦闘力 ${
            state.draft.powerValue ? escapeHtml(formatCount(state.draft.powerValue)) : "-"
          }</p>
          <div class="ranking-chip-row">
            ${
              state.draft.proofFileName
                ? `<span class="ranking-chip is-accent">${escapeHtml(state.draft.proofFileName)}</span>`
                : '<span class="ranking-chip">証明画像を追加</span>'
            }
          </div>
        </div>
        ${
          state.draft.proofImageUrl
            ? `<img class="ranking-draft-card__image" src="${escapeHtml(state.draft.proofImageUrl)}" alt="投稿プレビュー画像">`
            : '<div class="ranking-draft-card__image ranking-draft-card__image--empty">画像プレビュー</div>'
        }
      </div>
    `;
  }

  root.innerHTML = `
    <div class="ranking-shell">
      <div class="ranking-main-column">
        <section class="result-section exact-section">
          <div class="result-header">
            <div>
              <h2>戦闘力ランキング</h2>
              <p>全体と各サーバーごとに、上位100人の名前と戦闘力を見られる形に整理しました。</p>
            </div>
          </div>
          <div class="ranking-board-tablist" id="rankingBoardTabs"></div>
          <p class="field-note" id="rankingBoardHelper"></p>
          <div class="ranking-summary-grid" id="rankingStatGrid"></div>
          <div class="toolbar-summary" id="rankingSummary"></div>
          <div class="ranking-hero-grid" id="rankingTopTen"></div>
          <div class="toolbar-summary" id="rankingRestSummary"></div>
          <div class="ranking-compact-list" id="rankingRestTable"></div>
        </section>

        <section class="result-section partial-section">
          <div class="result-header">
            <div>
              <h2>証明画像</h2>
              <p>選択したプレイヤーの画像だけを右下に出して、確認しやすくしています。</p>
            </div>
          </div>
          <div id="rankingProofViewer"></div>
        </section>
      </div>

      <aside class="ranking-form-panel">
        <section class="result-section exact-section">
          <div class="result-header">
            <div>
              <h2>戦闘力投稿</h2>
              <p>サーバー、名前、戦闘力、証明画像だけのシンプルな投稿フォームです。</p>
            </div>
          </div>
          <div class="ranking-form-grid">
            <div class="field">
              <label for="rankingServerInput">サーバー</label>
              <select id="rankingServerInput" aria-label="投稿先サーバー"></select>
            </div>
            <div class="field">
              <label for="rankingNameInput">プレイヤー名</label>
              <input id="rankingNameInput" type="text" placeholder="例: 王騎">
            </div>
            <div class="field field-span-2">
              <label for="rankingPowerInput">戦闘力</label>
              <input id="rankingPowerInput" type="number" min="1" step="1" inputmode="numeric" placeholder="例: 123456789">
            </div>
            <div class="field field-span-2">
              <label for="rankingProofInput">証明画像</label>
              <input id="rankingProofInput" type="file" accept="image/*">
              <p class="field-note" id="rankingProofMeta">画像は自動で圧縮して保存します。</p>
            </div>
          </div>
          <div id="rankingDraftPreview"></div>
          <div class="button-row">
            <button class="primary-button" id="rankingSubmitButton" type="button">投稿する</button>
            <button class="secondary-button" id="rankingDraftResetButton" type="button">入力をクリア</button>
          </div>
          <div class="button-row">
            <button class="secondary-button" id="rankingDeleteButton" type="button" disabled>選択中の投稿を削除</button>
          </div>
          <div class="toolbar-summary" id="rankingFormSummary"></div>
        </section>
      </aside>
    </div>
  `;

  const elements = {
    boardTabs: root.querySelector("#rankingBoardTabs"),
    boardHelper: root.querySelector("#rankingBoardHelper"),
    statGrid: root.querySelector("#rankingStatGrid"),
    summary: root.querySelector("#rankingSummary"),
    topTen: root.querySelector("#rankingTopTen"),
    restSummary: root.querySelector("#rankingRestSummary"),
    restTable: root.querySelector("#rankingRestTable"),
    proofViewer: root.querySelector("#rankingProofViewer"),
    serverInput: root.querySelector("#rankingServerInput"),
    nameInput: root.querySelector("#rankingNameInput"),
    powerInput: root.querySelector("#rankingPowerInput"),
    proofInput: root.querySelector("#rankingProofInput"),
    proofMeta: root.querySelector("#rankingProofMeta"),
    draftPreview: root.querySelector("#rankingDraftPreview"),
    submitButton: root.querySelector("#rankingSubmitButton"),
    draftResetButton: root.querySelector("#rankingDraftResetButton"),
    deleteButton: root.querySelector("#rankingDeleteButton"),
    formSummary: root.querySelector("#rankingFormSummary")
  };

  function syncFormInputsFromDraft() {
    elements.serverInput.innerHTML = SERVER_OPTIONS.map(
      (server) => `<option value="${server}">サーバー${server}</option>`
    ).join("");
    elements.serverInput.value = state.draft.server;
    elements.nameInput.value = state.draft.playerName;
    elements.powerInput.value = state.draft.powerValue;
    elements.proofMeta.textContent = state.draft.proofFileName
      ? `選択中: ${state.draft.proofFileName}`
      : "画像は自動で圧縮して保存します。";
  }

  function buildSourceLabel() {
    if (!apiState.checked) {
      return "共有APIの接続状態を確認しています。";
    }
    if (apiState.available) {
      return apiState.syncing
        ? "共有ランキングへ同期中です。"
        : "共有ランキング接続中です。投稿は全ユーザーに公開されます。";
    }
    if (apiState.sharedAvailable) {
      return "オンライン保存された共有ランキングを表示中です。投稿は動的URL側から行えます。";
    }
    return "共有API未接続のため、現在はこの端末だけに保存します。";
  }

  function renderAll() {
    const scopedEntries = getScopedEntries();
    const visibleEntries = scopedEntries.slice(0, 100);
    const topTenEntries = visibleEntries.slice(0, 10);
    const restEntries = visibleEntries.slice(10);

    ensureSelectedEntry(visibleEntries);
    const selectedEntry = visibleEntries.find((entry) => entry.id === state.selectedId) ?? null;

    elements.boardTabs.innerHTML = buildViewTabs();
    elements.boardHelper.textContent = viewMeta(state.filters.viewKey).helper;
    elements.statGrid.innerHTML = buildSummaryCards(scopedEntries, visibleEntries);
    elements.summary.textContent = `${viewMeta(state.filters.viewKey).label} / 上位${formatCount(
      visibleEntries.length
    )}人表示 / 総投稿${formatCount(scopedEntries.length)}人`;
    elements.topTen.innerHTML = buildHeroCards(topTenEntries);
    elements.restSummary.textContent = restEntries.length
      ? `11位〜${10 + restEntries.length}位`
      : "11位以降はまだありません。";
    elements.restTable.innerHTML = buildCompactRows(restEntries, 11);
    elements.proofViewer.innerHTML = buildProofViewer(selectedEntry);
    elements.draftPreview.innerHTML = buildDraftPreview();
    elements.formSummary.textContent = buildSourceLabel();
    elements.deleteButton.disabled = !canDeleteEntry(selectedEntry);
    syncFormInputsFromDraft();
  }

  function updateDraft(patch) {
    state.draft = sanitizeDraft({ ...state.draft, ...patch });
    saveState();
    renderAll();
  }

  function resetDraft() {
    state.draft = createEmptyDraft();
    if (elements.proofInput) {
      elements.proofInput.value = "";
    }
    saveState();
    renderAll();
  }

  function collectDraftErrors() {
    const errors = [];
    if (!state.draft.server) {
      errors.push("サーバー");
    }
    if (!state.draft.playerName) {
      errors.push("プレイヤー名");
    }
    if (!Number(state.draft.powerValue)) {
      errors.push("戦闘力");
    }
    if (!state.draft.proofImageUrl) {
      errors.push("証明画像");
    }
    return errors;
  }

  function buildRemotePayload() {
    return {
      boardKey: "overall",
      server: state.draft.server,
      playerName: state.draft.playerName,
      powerType: "戦闘力",
      powerValue: Number(state.draft.powerValue),
      comment: "",
      proofImageDataUrl: state.draft.proofImageUrl,
      proofFileName: state.draft.proofFileName
    };
  }

  async function submitDraft() {
    const errors = collectDraftErrors();
    if (errors.length) {
      showToast(`${errors.join(" / ")} を入力してください。`);
      return;
    }

    elements.submitButton.disabled = true;
    try {
      if (apiState.available) {
        const payload = await requestJson(`${API_BASE}/rankings`, {
          method: "POST",
          body: JSON.stringify(buildRemotePayload())
        });
        if (payload?.manageToken && payload?.entry?.id) {
          state.manageTokens[payload.entry.id] = payload.manageToken;
        }
        state.filters.viewKey = serverToViewKey(state.draft.server);
        state.selectedId = payload?.entry?.id || "";
        state.draft = createEmptyDraft();
        if (elements.proofInput) {
          elements.proofInput.value = "";
        }
        saveState();
        await refreshRemoteEntries();
        renderAll();
        showToast("共有ランキングに投稿しました。");
        return;
      }

      const entry = sanitizeEntry({
        id: `local-${Date.now()}`,
        server: state.draft.server,
        playerName: state.draft.playerName,
        powerValue: Number(state.draft.powerValue),
        proofImageUrl: state.draft.proofImageUrl,
        proofFileName: state.draft.proofFileName,
        postedAt: new Date().toISOString(),
        source: "local"
      });
      if (!entry) {
        showToast("投稿内容を確認してください。");
        return;
      }
      state.localEntries = sortEntries([entry, ...state.localEntries]);
      state.filters.viewKey = serverToViewKey(entry.server);
      state.selectedId = entry.id;
      state.draft = createEmptyDraft();
      if (elements.proofInput) {
        elements.proofInput.value = "";
      }
      saveState();
      renderAll();
      showToast("この端末のランキングに投稿しました。");
    } finally {
      elements.submitButton.disabled = false;
    }
  }

  async function removeSelectedEntry() {
    const entry = findEntry(state.selectedId);
    if (!entry) {
      return;
    }

    elements.deleteButton.disabled = true;
    try {
      if (entry.source === "local") {
        state.localEntries = state.localEntries.filter((current) => current.id !== entry.id);
        state.selectedId = "";
        saveState();
        renderAll();
        showToast("選択中の投稿を削除しました。");
        return;
      }

      const token = state.manageTokens[entry.id];
      if (!token || !apiState.available) {
        showToast("この投稿は削除できません。");
        return;
      }

      await requestJson(`${API_BASE}/rankings/${encodeURIComponent(entry.id)}`, {
        method: "DELETE",
        headers: {
          "X-Entry-Token": token
        }
      });
      delete state.manageTokens[entry.id];
      state.selectedId = "";
      saveState();
      await refreshRemoteEntries();
      renderAll();
      showToast("共有ランキングから削除しました。");
    } finally {
      elements.deleteButton.disabled = !canDeleteEntry(findEntry(state.selectedId));
    }
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("ranking-proof-read-failed"));
      reader.readAsDataURL(file);
    });
  }

  function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("ranking-proof-image-load-failed"));
      image.src = dataUrl;
    });
  }

  async function compressProofImage(file) {
    const sourceUrl = await readFileAsDataUrl(file);
    const image = await loadImage(sourceUrl);
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height, 1));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("ranking-proof-canvas-unavailable");
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", IMAGE_OUTPUT_QUALITY);
  }

  function bindEvents() {
    elements.boardTabs.addEventListener("click", (event) => {
      const tab = event.target.closest("[data-ranking-view-tab]");
      if (!tab) {
        return;
      }
      state.filters.viewKey = tab.dataset.rankingViewTab || VIEW_DEFS[0].key;
      saveState();
      renderAll();
    });

    root.addEventListener("click", (event) => {
      const previewButton = event.target.closest("[data-ranking-preview-id]");
      const row = event.target.closest("[data-ranking-entry-id]");
      if (previewButton) {
        state.selectedId = previewButton.dataset.rankingPreviewId || "";
        saveState();
        renderAll();
        return;
      }
      if (row) {
        state.selectedId = row.dataset.rankingEntryId || "";
        saveState();
        renderAll();
      }
    });

    elements.serverInput.addEventListener("change", () => updateDraft({ server: elements.serverInput.value }));
    elements.nameInput.addEventListener("input", () => updateDraft({ playerName: elements.nameInput.value }));
    elements.powerInput.addEventListener("input", () => updateDraft({ powerValue: elements.powerInput.value }));
    elements.proofInput.addEventListener("change", async () => {
      const file = elements.proofInput.files?.[0];
      if (!file) {
        return;
      }
      try {
        updateDraft({
          proofImageUrl: await compressProofImage(file),
          proofFileName: file.name
        });
      } catch (error) {
        console.error(error);
        showToast("証明画像の読み込みに失敗しました。");
      } finally {
        elements.proofInput.value = "";
      }
    });
    elements.submitButton.addEventListener("click", () => {
      submitDraft().catch((error) => {
        console.error(error);
        showToast("投稿に失敗しました。");
      });
    });
    elements.draftResetButton.addEventListener("click", resetDraft);
    elements.deleteButton.addEventListener("click", () => {
      removeSelectedEntry().catch((error) => {
        console.error(error);
        showToast("投稿の削除に失敗しました。");
      });
    });
  }

  function collectShareState() {
    return {
      version: SHARE_STATE_VERSION,
      boardKey: state.filters.viewKey
    };
  }

  function applyShareState(payload = {}) {
    state.filters = sanitizeFilters(payload);
    saveState();
    renderAll();
  }

  function exportState() {
    return {
      localEntries: state.localEntries,
      filters: state.filters,
      draft: state.draft,
      selectedId: state.selectedId,
      manageTokens: state.manageTokens
    };
  }

  function importState(payload, options = {}) {
    if (!payload) {
      state.localEntries = [];
      state.filters = sanitizeFilters({});
      state.draft = createEmptyDraft();
      state.selectedId = "";
      state.manageTokens = {};
    } else {
      const rawEntries = payload.localEntries ?? payload.entries ?? [];
      state.localEntries = Array.isArray(rawEntries)
        ? rawEntries.map((entry) => sanitizeEntry(entry, "local")).filter(Boolean)
        : [];
      state.filters = sanitizeFilters(payload.filters ?? payload);
      state.draft = sanitizeDraft(payload.draft);
      state.selectedId = String(payload.selectedId || "");
      state.manageTokens = sanitizeTokenMap(payload.manageTokens);
    }
    saveState();
    if (options.rerender !== false) {
      renderAll();
    }
  }

  function clearState(options = {}) {
    importState(null, options);
  }

  window.KH_RANKING_BOARD_API = {
    collectShareState,
    applyShareState,
    exportState,
    importState,
    clearState,
    getEntryCount: () => getAllEntries().length,
    refresh: async () => {
      if (apiState.available) {
        await refreshRemoteEntries();
      } else {
        await refreshSharedEntries();
      }
      renderAll();
    }
  };

  bindEvents();
  renderAll();
  probeApiAvailability().catch(() => {
    apiState.checked = true;
    apiState.available = false;
    renderAll();
  });
})();
