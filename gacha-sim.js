(() => {
  const root = document.querySelector("#gachaSimulatorRoot");
  if (!root || typeof APP_DATA !== "object" || !Array.isArray(APP_DATA.characters)) {
    return;
  }

  const STORAGE_KEY = "kh-gacha-sim-s3-v1";
  const SHARE_STATE_VERSION = 1;
  const DRAW_ANIMATION_MS = 4700;
  const PULL_PRICE_YEN = 150;
  const VIDEO_URL = "./assets/s3-eiketsu-summon.mov";
  const IMAGE_BASE_URL = "https://img.gamewith.jp/article_tools/kingdom-hadou/gacha";
  const TYPE_THEME = {
    闘: "battle",
    護: "guard",
    援: "support",
    妨: "debuff"
  };
  const RARITY_ORDER = {
    SSR: 3,
    SR: 2,
    R: 1
  };
  const NAME_ALIASES = {
    信: ["信(童)"]
  };
  const countFormatter = new Intl.NumberFormat("ja-JP");

  const inferredCharacterData = {
    澤圭: {
      rarity: "R",
      tenpu: 550,
      type: "護",
      imageUrl: `${IMAGE_BASE_URL}/chara_48.png`,
      sourceUrl: "https://gamewith.jp/kingdom-hadou/519275"
    },
    尾平: {
      rarity: "R",
      tenpu: 550,
      type: "援",
      imageUrl: `${IMAGE_BASE_URL}/chara_49.png`,
      sourceUrl: "https://gamewith.jp/kingdom-hadou/519274"
    },
    尾到: {
      rarity: "R",
      tenpu: 550,
      type: "護",
      imageUrl: `${IMAGE_BASE_URL}/chara_50.png`,
      sourceUrl: "https://gamewith.jp/kingdom-hadou/519273"
    },
    魯延: {
      rarity: "R",
      tenpu: 550,
      type: "援",
      imageUrl: `${IMAGE_BASE_URL}/chara_51.png`,
      sourceUrl: "https://gamewith.jp/kingdom-hadou/519272"
    },
    竜有: {
      rarity: "R",
      tenpu: 550,
      type: "護",
      imageUrl: `${IMAGE_BASE_URL}/chara_52.png`,
      sourceUrl: "https://gamewith.jp/kingdom-hadou/519271"
    },
    慶: {
      rarity: "R",
      tenpu: 550,
      type: "妨",
      imageUrl: `${IMAGE_BASE_URL}/chara_53.png`,
      sourceUrl: "https://gamewith.jp/kingdom-hadou/519270"
    },
    友里: {
      rarity: "R",
      tenpu: 550,
      type: "護",
      imageUrl: `${IMAGE_BASE_URL}/chara_54.png`,
      sourceUrl: "https://gamewith.jp/kingdom-hadou/519269"
    },
    東美: {
      rarity: "R",
      tenpu: 550,
      type: "援",
      imageUrl: `${IMAGE_BASE_URL}/chara_55.png`,
      sourceUrl: "https://gamewith.jp/kingdom-hadou/519268"
    },
    朱鬼: {
      rarity: "R",
      tenpu: 550,
      type: "闘",
      imageUrl: `${IMAGE_BASE_URL}/chara_56.png`,
      sourceUrl: "https://gamewith.jp/kingdom-hadou/519267"
    },
    麻鬼: {
      rarity: "R",
      tenpu: 550,
      type: "妨",
      imageUrl: `${IMAGE_BASE_URL}/chara_57.png`,
      sourceUrl: "https://gamewith.jp/kingdom-hadou/519266"
    },
    田孝: {
      rarity: "R",
      tenpu: 550,
      type: "護",
      imageUrl: `${IMAGE_BASE_URL}/chara_58.png`,
      sourceUrl: "https://gamewith.jp/kingdom-hadou/519265"
    },
    竭氏: {
      rarity: "R",
      tenpu: 550,
      type: "妨",
      imageUrl: `${IMAGE_BASE_URL}/chara_59.png`,
      sourceUrl: "https://gamewith.jp/kingdom-hadou/519264"
    },
    昂: {
      rarity: "R",
      tenpu: 550,
      type: "護",
      imageUrl: `${IMAGE_BASE_URL}/chara_60.png`,
      sourceUrl: "https://gamewith.jp/kingdom-hadou/519263"
    },
    左慈: {
      rarity: "R",
      tenpu: 550,
      type: "闘",
      imageUrl: `${IMAGE_BASE_URL}/chara_61.png`,
      sourceUrl: "https://gamewith.jp/kingdom-hadou/519262"
    },
    魏興: {
      rarity: "R",
      tenpu: 550,
      type: "闘",
      imageUrl: `${IMAGE_BASE_URL}/chara_62.png`,
      sourceUrl: "https://gamewith.jp/kingdom-hadou/519261"
    },
    木靸: {
      rarity: "SR",
      tenpu: 650,
      type: "",
      imageUrl: "",
      sourceUrl: ""
    }
  };

  const normalGroups = [
    { rarity: "SSR", tenpu: 900, rate: 0.041, names: ["王翦", "オルド", "汗明", "李牧"] },
    { rarity: "SSR", tenpu: 900, rate: 0.005, names: ["嬴政", "王騎", "羌瘣", "バジオウ", "麃公"] },
    { rarity: "SSR", tenpu: 850, rate: 0.15, names: ["成恢", "臨武君"] },
    { rarity: "SSR", tenpu: 850, rate: 0.1, names: ["シュンメン", "信", "成蟜", "漂", "壁", "ランカイ"] },
    { rarity: "SSR", tenpu: 850, rate: 0.005, names: ["楊端和"] },
    { rarity: "SSR", tenpu: 800, rate: 0.4, names: ["バミュウ"] },
    {
      rarity: "SSR",
      tenpu: 800,
      rate: 0.142,
      names: ["渕", "河了貂", "干央", "魏加", "向", "黄離弦", "尚鹿", "昌文君", "徐完", "楚水", "白亀西", "蒙毅", "陽", "鱗坊"]
    },
    { rarity: "SR", tenpu: 650, rate: 3.576, names: ["カク備", "去亥", "肆氏", "松左", "崇原", "石", "中鉄", "丁之", "田永", "田有", "沛浪", "木靸", "竜川"] },
    { rarity: "R", tenpu: 550, rate: 3.333, names: ["魏興", "慶", "竭氏", "昂", "左慈", "朱鬼", "澤圭", "田孝", "東美", "尾到", "尾平", "麻鬼", "友里", "竜有", "魯延"] }
  ];

  const ssrGuaranteeGroups = [
    { rarity: "SSR", tenpu: 900, rate: 1.5, names: ["王翦", "オルド", "汗明", "李牧"] },
    { rarity: "SSR", tenpu: 900, rate: 0.666, names: ["嬴政", "王騎", "羌瘣", "バジオウ", "麃公", "楊端和"] },
    { rarity: "SSR", tenpu: 850, rate: 5, names: ["成恢", "臨武君"] },
    { rarity: "SSR", tenpu: 850, rate: 3.333, names: ["シュンメン", "信", "成蟜", "漂", "壁", "ランカイ"] },
    { rarity: "SSR", tenpu: 800, rate: 10, names: ["バミュウ"] },
    {
      rarity: "SSR",
      tenpu: 800,
      rate: 3.571,
      names: ["渕", "河了貂", "干央", "魏加", "向", "黄離弦", "尚鹿", "昌文君", "徐完", "楚水", "白亀西", "蒙毅", "陽", "鱗坊"]
    }
  ];

  const ssr900GuaranteeGroups = [
    { rarity: "SSR", tenpu: 900, rate: 16.667, names: ["王翦", "オルド", "汗明", "李牧"] },
    { rarity: "SSR", tenpu: 900, rate: 5.555, names: ["嬴政", "王騎", "羌瘣", "バジオウ", "麃公", "楊端和"] }
  ];

  const baseCharacterLookup = new Map(
    APP_DATA.characters.map((character) => [
      makeCharacterKey(character.name, character.rarity, Number(character.tenpu)),
      character
    ])
  );
  const resolvedCharacterCache = new Map();

  function makeCharacterKey(name, rarity, tenpu) {
    return `${name}::${rarity}::${tenpu}`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatCount(value) {
    return countFormatter.format(Number(value || 0));
  }

  function formatCurrencyYen(value) {
    return `${countFormatter.format(Math.round(Number(value || 0)))}円`;
  }

  function uniqueCharactersCount(counts) {
    return Object.values(counts).filter((count) => Number(count) > 0).length;
  }

  function pullsUntil(step, totalPulls) {
    const remainder = Number(totalPulls || 0) % step;
    return remainder === 0 ? step : step - remainder;
  }

  function cloneResultRecord(record, additions = {}) {
    return {
      name: record.name,
      rarity: record.rarity,
      tenpu: Number(record.tenpu),
      type: record.type || "",
      imageUrl: record.imageUrl || "",
      sourceUrl: record.sourceUrl || "",
      placeholder: Boolean(record.placeholder),
      ...additions
    };
  }

  function resolveCharacterRecord(name, rarity, tenpu) {
    const key = makeCharacterKey(name, rarity, tenpu);
    if (resolvedCharacterCache.has(key)) {
      return resolvedCharacterCache.get(key);
    }

    const aliasCandidates = [name, ...(NAME_ALIASES[name] ?? [])];
    let sourceCharacter = null;

    for (const candidate of aliasCandidates) {
      const direct = baseCharacterLookup.get(makeCharacterKey(candidate, rarity, tenpu));
      if (direct) {
        sourceCharacter = direct;
        break;
      }
    }

    const fallback = inferredCharacterData[name] ?? {};
    const record = {
      name,
      rarity,
      tenpu: Number(tenpu),
      type: sourceCharacter?.type || fallback.type || "",
      imageUrl: sourceCharacter?.imageUrl || fallback.imageUrl || "",
      sourceUrl: sourceCharacter?.sourceUrl || fallback.sourceUrl || "",
      placeholder: !(sourceCharacter?.imageUrl || fallback.imageUrl)
    };

    resolvedCharacterCache.set(key, record);
    return record;
  }

  function expandGroups(groups) {
    return groups.flatMap((group) =>
      group.names.map((name) => {
        const record = resolveCharacterRecord(name, group.rarity, group.tenpu);
        return {
          ...record,
          weight: Number(group.rate),
          rate: Number(group.rate)
        };
      })
    );
  }

  function createPreparedPool(entries) {
    let cumulativeWeight = 0;
    const weightedEntries = entries.map((entry) => {
      cumulativeWeight += entry.weight;
      return {
        ...entry,
        cumulativeWeight
      };
    });

    return {
      totalWeight: cumulativeWeight,
      entries: weightedEntries
    };
  }

  function pickWeightedEntry(pool) {
    const roll = Math.random() * pool.totalWeight;
    return pool.entries.find((entry) => roll < entry.cumulativeWeight) ?? pool.entries.at(-1);
  }

  function createGroupSummary(groups) {
    return groups.map((group) => ({
      rarity: group.rarity,
      tenpu: Number(group.tenpu),
      rate: Number(group.rate),
      names: [...group.names]
    }));
  }

  const banner = {
    key: "s3-eiketsu",
    label: "シーズン3 英傑登用",
    normalPool: createPreparedPool(expandGroups(normalGroups)),
    ssrGuaranteePool: createPreparedPool(expandGroups(ssrGuaranteeGroups)),
    ssr900GuaranteePool: createPreparedPool(expandGroups(ssr900GuaranteeGroups)),
    normalSummary: createGroupSummary(normalGroups),
    ssrGuaranteeSummary: createGroupSummary(ssrGuaranteeGroups),
    ssr900GuaranteeSummary: createGroupSummary(ssr900GuaranteeGroups)
  };

  const normalRatesByRarity = normalGroups.reduce(
    (totals, group) => {
      totals[group.rarity] = (totals[group.rarity] || 0) + group.rate * group.names.length;
      return totals;
    },
    { SSR: 0, SR: 0, R: 0 }
  );

  function createDefaultState() {
    return {
      bannerKey: banner.key,
      totalPulls: 0,
      pullCounts: {},
      lastBatch: [],
      animationEnabled: true
    };
  }

  function sanitizeResult(result) {
    if (!result || !result.name || !result.rarity || !result.tenpu) {
      return null;
    }
    const record = resolveCharacterRecord(result.name, result.rarity, Number(result.tenpu));
    return cloneResultRecord(record, {
      guaranteeKind: result.guaranteeKind || "",
      sequence: Number(result.sequence || 0)
    });
  }

  function sanitizeState(raw) {
    const nextState = createDefaultState();
    if (!raw || typeof raw !== "object") {
      return nextState;
    }

    nextState.bannerKey = raw.bannerKey === banner.key ? raw.bannerKey : banner.key;
    nextState.totalPulls = Math.max(0, Number(raw.totalPulls || 0));
    nextState.animationEnabled = raw.animationEnabled !== false;

    if (raw.pullCounts && typeof raw.pullCounts === "object") {
      for (const [name, count] of Object.entries(raw.pullCounts)) {
        const safeCount = Math.max(0, Number(count || 0));
        if (safeCount > 0) {
          nextState.pullCounts[name] = safeCount;
        }
      }
    }

    if (Array.isArray(raw.lastBatch)) {
      nextState.lastBatch = raw.lastBatch.map(sanitizeResult).filter(Boolean).slice(-10);
    }

    const countedPulls = Object.values(nextState.pullCounts).reduce((sum, count) => sum + Number(count), 0);
    if (countedPulls > 0 && nextState.totalPulls < countedPulls) {
      nextState.totalPulls = countedPulls;
    }

    return nextState;
  }

  function loadState() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return createDefaultState();
      }
      return sanitizeState(JSON.parse(stored));
    } catch (error) {
      return createDefaultState();
    }
  }

  function saveState() {
    const serializable = {
      bannerKey: state.bannerKey,
      totalPulls: state.totalPulls,
      pullCounts: state.pullCounts,
      lastBatch: state.lastBatch.map((entry) => ({
        name: entry.name,
        rarity: entry.rarity,
        tenpu: entry.tenpu,
        guaranteeKind: entry.guaranteeKind,
        sequence: entry.sequence
      })),
      animationEnabled: state.animationEnabled
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch (error) {
      // ignore persistence failures
    }
  }

  const state = loadState();
  let isDrawing = false;
  let drawAnimationTimer = null;

  root.innerHTML = `
    <div class="gacha-shell">
      <div class="gacha-stage-column">
        <section class="gacha-stage-card">
          <div class="gacha-stage" id="gachaStage">
            <div class="gacha-stage__header">
              <div class="gacha-stage__title-group">
                <span class="gacha-stage__crest">◇◇</span>
                <div>
                  <p class="gacha-stage__eyebrow">Season 3限定</p>
                  <h3 class="gacha-stage__title">人材 / 英傑登用</h3>
                </div>
              </div>
              <button class="gacha-stage__close" id="gachaResetStageButton" type="button" aria-label="結果をリセット">×</button>
            </div>

            <div class="gacha-stage__subhead">
              <div>
                <p class="gacha-stage__subtitle">本家の結果画面を参考にした10枠表示</p>
                <p class="gacha-stage__hint" id="gachaLatestSummary">まだ登用していません。右側のボタンから開始してください。</p>
              </div>
              <div class="gacha-stage__meta">
                <span class="gacha-mini-stat"><strong id="gachaTotalPullsStat">0</strong><span>累計回数</span></span>
                <span class="gacha-mini-stat"><strong id="gachaApproxSpendStat">0円</strong><span>概算課金額</span></span>
              </div>
            </div>

            <div class="gacha-results-grid" id="gachaResultsGrid"></div>

            <div class="gacha-stage__footer">
              <p class="gacha-stage__notice">所持中の武将を再獲得した場合は、シミュレーター上では回数に加算して集計します。</p>
              <p class="gacha-stage__notice gacha-stage__notice--accent" id="gachaPityNotice"></p>
            </div>

            <div class="gacha-animation-overlay" id="gachaAnimationOverlay" hidden aria-live="polite">
              <video
                class="gacha-animation-overlay__video"
                id="gachaAnimationVideo"
                src="${escapeHtml(VIDEO_URL)}"
                preload="auto"
                muted
                playsinline
              ></video>
              <div class="gacha-animation-overlay__veil"></div>
              <div class="gacha-animation-overlay__copy">
                <p class="gacha-animation-overlay__eyebrow">英傑登用演出</p>
                <strong id="gachaAnimationStatus">実機動画を再生中</strong>
                <span>動画が使えない環境では、簡易演出へ自動で切り替えます。</span>
              </div>
            </div>
          </div>
        </section>

        <section class="result-section exact-section gacha-probability-card">
          <div class="result-header">
            <div>
              <h2>提供割合</h2>
              <p>通常枠、20回ごとのSSR確定枠、100回ごとの天賦900確定枠を分けて表示しています。</p>
            </div>
          </div>
          <div class="gacha-probability-grid">
            <article class="gacha-probability-panel">
              <h3>通常時</h3>
              <p class="gacha-probability-panel__summary">SSR ${normalRatesByRarity.SSR.toFixed(3)}% / SR ${normalRatesByRarity.SR.toFixed(3)}% / R ${normalRatesByRarity.R.toFixed(3)}%</p>
              <div id="gachaNormalRates"></div>
            </article>
            <article class="gacha-probability-panel">
              <h3>20回ごとのSSR確定</h3>
              <p class="gacha-probability-panel__summary">20回目はSSRのみを抽選します。</p>
              <div id="gachaGuaranteeRates"></div>
            </article>
            <article class="gacha-probability-panel">
              <h3>100回ごとの天賦900確定</h3>
              <p class="gacha-probability-panel__summary">100回目は天賦900のSSRのみを抽選します。</p>
              <div id="gachaGuarantee900Rates"></div>
            </article>
          </div>
        </section>
      </div>

      <div class="gacha-side-column">
        <section class="panel gacha-control-card">
          <div class="panel-header">
            <div>
              <h2>登用操作</h2>
              <p>10連1500円換算で、累計回数に応じた概算課金額も自動計算します。</p>
            </div>
          </div>
          <div class="gacha-control-stack">
            <label class="gacha-toggle">
              <input id="gachaAnimationToggle" type="checkbox">
              <span>実機録画ベースの動画演出を流す</span>
            </label>
            <div class="gacha-button-grid">
              <button class="primary-button gacha-draw-button" id="gachaDrawTenButton" type="button">10連を引く</button>
              <button class="secondary-button gacha-draw-button" id="gachaDrawOneButton" type="button">1回引く</button>
              <button class="secondary-button gacha-draw-button" id="gachaResetButton" type="button">履歴をリセット</button>
            </div>
            <div class="toolbar-summary" id="gachaControlSummary"></div>
          </div>
        </section>

        <section class="result-section exact-section gacha-stat-card">
          <div class="result-header">
            <div>
              <h2>累計サマリー</h2>
              <p>累計のSSR数、天賦900数、次の確定までの残り回数をまとめます。</p>
            </div>
          </div>
          <div class="gacha-stat-grid" id="gachaStatGrid"></div>
        </section>

        <section class="result-section partial-section gacha-count-card">
          <div class="result-header">
            <div>
              <h2>武将ごとの獲得回数</h2>
              <p>1回でも引いた武将だけを表示します。SSR→SR→Rの順で並べます。</p>
            </div>
            <span class="count-pill" id="gachaUniqueCount"></span>
          </div>
          <div class="gacha-pull-counts" id="gachaPullCounts"></div>
        </section>
      </div>
    </div>
  `;

  const elements = {
    animationOverlay: root.querySelector("#gachaAnimationOverlay"),
    animationVideo: root.querySelector("#gachaAnimationVideo"),
    animationStatus: root.querySelector("#gachaAnimationStatus"),
    animationToggle: root.querySelector("#gachaAnimationToggle"),
    drawOneButton: root.querySelector("#gachaDrawOneButton"),
    drawTenButton: root.querySelector("#gachaDrawTenButton"),
    resetButton: root.querySelector("#gachaResetButton"),
    resetStageButton: root.querySelector("#gachaResetStageButton"),
    resultsGrid: root.querySelector("#gachaResultsGrid"),
    latestSummary: root.querySelector("#gachaLatestSummary"),
    pityNotice: root.querySelector("#gachaPityNotice"),
    totalPullsStat: root.querySelector("#gachaTotalPullsStat"),
    approxSpendStat: root.querySelector("#gachaApproxSpendStat"),
    controlSummary: root.querySelector("#gachaControlSummary"),
    statGrid: root.querySelector("#gachaStatGrid"),
    uniqueCount: root.querySelector("#gachaUniqueCount"),
    pullCounts: root.querySelector("#gachaPullCounts"),
    normalRates: root.querySelector("#gachaNormalRates"),
    guaranteeRates: root.querySelector("#gachaGuaranteeRates"),
    guarantee900Rates: root.querySelector("#gachaGuarantee900Rates")
  };

  function getApproximateSpend(totalPulls) {
    return Number(totalPulls || 0) * PULL_PRICE_YEN;
  }

  function getNextGuaranteeKind(pullNumber) {
    if (pullNumber % 100 === 0) {
      return "ssr900";
    }
    if (pullNumber % 20 === 0) {
      return "ssr";
    }
    return "";
  }

  function getPoolForGuarantee(guaranteeKind) {
    if (guaranteeKind === "ssr900") {
      return banner.ssr900GuaranteePool;
    }
    if (guaranteeKind === "ssr") {
      return banner.ssrGuaranteePool;
    }
    return banner.normalPool;
  }

  function pullOne() {
    const nextPullNumber = state.totalPulls + 1;
    const guaranteeKind = getNextGuaranteeKind(nextPullNumber);
    const pool = getPoolForGuarantee(guaranteeKind);
    const entry = pickWeightedEntry(pool);
    const result = cloneResultRecord(entry, {
      guaranteeKind,
      sequence: nextPullNumber
    });

    state.totalPulls = nextPullNumber;
    state.pullCounts[result.name] = (state.pullCounts[result.name] || 0) + 1;

    return result;
  }

  function drawBatch(count) {
    const batch = [];
    for (let index = 0; index < count; index += 1) {
      batch.push(pullOne());
    }
    state.lastBatch = batch;
    saveState();
    return batch;
  }

  function clearAnimationState() {
    window.clearTimeout(drawAnimationTimer);
    drawAnimationTimer = null;
    elements.animationOverlay.hidden = true;
    elements.animationOverlay.classList.remove("is-fallback");
    if (elements.animationVideo) {
      elements.animationVideo.pause();
      try {
        elements.animationVideo.currentTime = 0;
      } catch (error) {
        // ignore seek failures
      }
    }
  }

  function finishDraw() {
    clearAnimationState();
    isDrawing = false;
    renderAll();
  }

  function playAnimationForDraw(count) {
    if (!state.animationEnabled) {
      finishDraw();
      return;
    }

    elements.animationOverlay.hidden = false;
    elements.animationStatus.textContent = count >= 10 ? "10連演出を再生中" : "登用演出を再生中";
    drawAnimationTimer = window.setTimeout(finishDraw, DRAW_ANIMATION_MS);

    if (!elements.animationVideo) {
      elements.animationOverlay.classList.add("is-fallback");
      return;
    }

    try {
      elements.animationVideo.currentTime = 0;
    } catch (error) {
      // ignore seek failures
    }

    const playPromise = elements.animationVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        elements.animationOverlay.classList.add("is-fallback");
      });
    }

    elements.animationVideo.onerror = () => {
      elements.animationOverlay.classList.add("is-fallback");
    };
  }

  function summarizeBatch(batch) {
    if (!batch.length) {
      return "まだ登用していません。右側のボタンから開始してください。";
    }

    const counts = batch.reduce(
      (summary, entry) => {
        summary[entry.rarity] = (summary[entry.rarity] || 0) + 1;
        return summary;
      },
      { SSR: 0, SR: 0, R: 0 }
    );

    const highlightedNames = batch.filter((entry) => entry.rarity === "SSR").map((entry) => entry.name);
    const countLabel = batch.length >= 10 ? "直近10連" : "直近結果";
    const ssrSuffix = highlightedNames.length ? ` / SSR: ${highlightedNames.join("、")}` : "";
    return `${countLabel}は SSR ${counts.SSR || 0} / SR ${counts.SR || 0} / R ${counts.R || 0}${ssrSuffix}`;
  }

  function buildPityNotice() {
    const remaining20 = pullsUntil(20, state.totalPulls);
    const remaining100 = pullsUntil(100, state.totalPulls);
    return `あと${remaining20}回でSSR武将、${remaining100}回でSSR武将(天賦900)を獲得`;
  }

  function buildDrawControlSummary() {
    const next20 = pullsUntil(20, state.totalPulls);
    const next100 = pullsUntil(100, state.totalPulls);
    const approximateSpend = getApproximateSpend(state.totalPulls);
    return `累計 ${formatCount(state.totalPulls)}回 / 概算 ${formatCurrencyYen(approximateSpend)} / 次のSSR確定まで ${next20}回 / 次の天賦900確定まで ${next100}回`;
  }

  function renderPortrait(record, className = "gacha-result-card__portrait") {
    const themeClass = TYPE_THEME[record.type] ? ` is-${TYPE_THEME[record.type]}` : "";
    if (record.imageUrl) {
      return `<img class="${className}" src="${escapeHtml(record.imageUrl)}" alt="${escapeHtml(record.name)}">`;
    }
    const initial = escapeHtml(record.name.slice(0, 1));
    return `<div class="${className} gacha-result-card__portrait--fallback${themeClass}" aria-label="${escapeHtml(record.name)}">${initial}</div>`;
  }

  function buildResultCard(record) {
    const rarityClass = `is-${record.rarity.toLowerCase()}`;
    const guaranteeLabel =
      record.guaranteeKind === "ssr900"
        ? '<span class="gacha-result-card__badge is-ssr900">100回確定</span>'
        : record.guaranteeKind === "ssr"
          ? '<span class="gacha-result-card__badge is-ssr">20回確定</span>'
          : "";
    const typeLabel = record.type || "？";
    const typeClass = TYPE_THEME[record.type] ? ` is-${TYPE_THEME[record.type]}` : "";

    return `
      <article class="gacha-result-card ${rarityClass}">
        <div class="gacha-result-card__glow"></div>
        <div class="gacha-result-card__topline">
          <span class="gacha-result-card__rarity">${escapeHtml(record.rarity)}</span>
          ${guaranteeLabel}
        </div>
        <div class="gacha-result-card__portrait-wrap">
          ${renderPortrait(record)}
        </div>
        <div class="gacha-result-card__info">
          <span class="gacha-result-card__type${typeClass}">${escapeHtml(typeLabel)}</span>
          <span class="gacha-result-card__tenpu">天賦${escapeHtml(record.tenpu)}</span>
        </div>
        <div class="gacha-result-card__nameplate">${escapeHtml(record.name)}</div>
      </article>
    `;
  }

  function buildEmptyResultCard() {
    return `
      <article class="gacha-result-card is-empty" aria-hidden="true">
        <div class="gacha-result-card__placeholder-ring"></div>
      </article>
    `;
  }

  function renderResultsGrid() {
    const batch = state.lastBatch.slice(-10);
    const filledCards = batch.map(buildResultCard);
    const emptyCount = Math.max(0, 10 - filledCards.length);
    const emptyCards = Array.from({ length: emptyCount }, () => buildEmptyResultCard());
    elements.resultsGrid.innerHTML = [...filledCards, ...emptyCards].join("");
  }

  function findPulledRecord(name) {
    const candidates = [
      makeCharacterKey(name, "SSR", 900),
      makeCharacterKey(name, "SSR", 850),
      makeCharacterKey(name, "SSR", 800),
      makeCharacterKey(name, "SR", 650),
      makeCharacterKey(name, "R", 550)
    ]
      .map((key) => resolvedCharacterCache.get(key))
      .filter(Boolean);

    return candidates[0] || inferredCharacterData[name] || { name, rarity: "R", tenpu: 550, type: "", imageUrl: "", placeholder: true };
  }

  function getPulledRecords() {
    return Object.entries(state.pullCounts)
      .map(([name, count]) => ({
        ...findPulledRecord(name),
        name,
        count: Number(count)
      }))
      .filter((entry) => entry.count > 0)
      .sort((left, right) => {
        if (RARITY_ORDER[right.rarity] !== RARITY_ORDER[left.rarity]) {
          return RARITY_ORDER[right.rarity] - RARITY_ORDER[left.rarity];
        }
        if (right.count !== left.count) {
          return right.count - left.count;
        }
        if (Number(right.tenpu) !== Number(left.tenpu)) {
          return Number(right.tenpu) - Number(left.tenpu);
        }
        return left.name.localeCompare(right.name, "ja");
      });
  }

  function renderPullCounts() {
    const pulledRecords = getPulledRecords();
    elements.uniqueCount.textContent = `${formatCount(pulledRecords.length)}体`;

    if (!pulledRecords.length) {
      elements.pullCounts.innerHTML = '<p class="toolbar-summary">まだ武将を引いていません。</p>';
      return;
    }

    elements.pullCounts.innerHTML = pulledRecords
      .map((record) => {
        const typeClass = TYPE_THEME[record.type] ? ` is-${TYPE_THEME[record.type]}` : "";
        return `
          <article class="gacha-pull-row">
            <div class="gacha-pull-row__thumb">
              ${renderPortrait(record, "gacha-pull-row__portrait")}
            </div>
            <div class="gacha-pull-row__body">
              <strong>${escapeHtml(record.name)}</strong>
              <span>${escapeHtml(record.rarity)} / 天賦${escapeHtml(record.tenpu)} / <span class="gacha-type-chip${typeClass}">${escapeHtml(record.type || "？")}</span></span>
            </div>
            <span class="gacha-pull-row__count">×${formatCount(record.count)}</span>
          </article>
        `;
      })
      .join("");
  }

  function buildStatCard(label, value, accent = "") {
    return `
      <article class="gacha-stat-item${accent ? ` ${accent}` : ""}">
        <span class="gacha-stat-item__label">${escapeHtml(label)}</span>
        <strong class="gacha-stat-item__value">${escapeHtml(value)}</strong>
      </article>
    `;
  }

  function renderStatGrid() {
    const pulledRecords = getPulledRecords();
    const ssrTotal = pulledRecords
      .filter((record) => record.rarity === "SSR")
      .reduce((sum, record) => sum + Number(record.count || 0), 0);
    const ssr900Total = pulledRecords
      .filter((record) => record.rarity === "SSR" && Number(record.tenpu) === 900)
      .reduce((sum, record) => sum + Number(record.count || 0), 0);
    const latestSsrCount = state.lastBatch.filter((entry) => entry.rarity === "SSR").length;

    const cards = [
      buildStatCard("累計回数", `${formatCount(state.totalPulls)}回`, "is-gold"),
      buildStatCard("概算課金額", formatCurrencyYen(getApproximateSpend(state.totalPulls)), "is-bronze"),
      buildStatCard("累計SSR", `${formatCount(ssrTotal)}体`),
      buildStatCard("累計天賦900", `${formatCount(ssr900Total)}体`),
      buildStatCard("次のSSR確定", `あと${pullsUntil(20, state.totalPulls)}回`),
      buildStatCard("次の900確定", `あと${pullsUntil(100, state.totalPulls)}回`),
      buildStatCard("直近結果", `${formatCount(latestSsrCount)}体 SSR`),
      buildStatCard("獲得武将数", `${formatCount(uniqueCharactersCount(state.pullCounts))}体`)
    ];

    elements.statGrid.innerHTML = cards.join("");
  }

  function renderRateGroups(target, groups) {
    target.innerHTML = groups
      .map(
        (group) => `
          <article class="gacha-rate-row">
            <div class="gacha-rate-row__meta">
              <strong>${escapeHtml(group.rarity)} / 天賦${escapeHtml(group.tenpu)}</strong>
              <span>${escapeHtml(group.rate.toFixed(3))}%</span>
            </div>
            <p>${escapeHtml(group.names.join("、"))}</p>
          </article>
        `
      )
      .join("");
  }

  function renderAll() {
    elements.animationToggle.checked = state.animationEnabled;
    elements.totalPullsStat.textContent = formatCount(state.totalPulls);
    elements.approxSpendStat.textContent = formatCurrencyYen(getApproximateSpend(state.totalPulls));
    elements.latestSummary.textContent = summarizeBatch(state.lastBatch);
    elements.pityNotice.textContent = buildPityNotice();
    elements.controlSummary.textContent = buildDrawControlSummary();
    elements.drawOneButton.disabled = isDrawing;
    elements.drawTenButton.disabled = isDrawing;
    elements.resetButton.disabled = isDrawing;
    elements.resetStageButton.disabled = isDrawing;
    renderResultsGrid();
    renderStatGrid();
    renderPullCounts();
  }

  function resetState() {
    state.bannerKey = banner.key;
    state.totalPulls = 0;
    state.pullCounts = {};
    state.lastBatch = [];
    saveState();
    renderAll();
  }

  function runDraw(count) {
    if (isDrawing) {
      return;
    }
    isDrawing = true;
    drawBatch(count);
    renderAll();
    playAnimationForDraw(count);
  }

  function collectShareState() {
    return {
      version: SHARE_STATE_VERSION,
      bannerKey: state.bannerKey,
      totalPulls: state.totalPulls,
      pullCounts: state.pullCounts,
      lastBatch: state.lastBatch.map((entry) => ({
        name: entry.name,
        rarity: entry.rarity,
        tenpu: entry.tenpu,
        guaranteeKind: entry.guaranteeKind,
        sequence: entry.sequence
      })),
      animationEnabled: state.animationEnabled
    };
  }

  function applyShareState(payload = {}) {
    const nextState = sanitizeState(payload);
    state.bannerKey = nextState.bannerKey;
    state.totalPulls = nextState.totalPulls;
    state.pullCounts = nextState.pullCounts;
    state.lastBatch = nextState.lastBatch;
    state.animationEnabled = nextState.animationEnabled;
    saveState();
    renderAll();
  }

  elements.animationToggle.addEventListener("change", () => {
    state.animationEnabled = elements.animationToggle.checked;
    saveState();
    renderAll();
  });

  elements.drawOneButton.addEventListener("click", () => {
    runDraw(1);
  });

  elements.drawTenButton.addEventListener("click", () => {
    runDraw(10);
  });

  elements.resetButton.addEventListener("click", () => {
    if (!window.confirm("ガチャの累計回数と獲得履歴をリセットします。よろしいですか。")) {
      return;
    }
    clearAnimationState();
    isDrawing = false;
    resetState();
  });

  elements.resetStageButton.addEventListener("click", () => {
    state.lastBatch = [];
    saveState();
    renderAll();
  });

  renderRateGroups(elements.normalRates, banner.normalSummary);
  renderRateGroups(elements.guaranteeRates, banner.ssrGuaranteeSummary);
  renderRateGroups(elements.guarantee900Rates, banner.ssr900GuaranteeSummary);
  renderAll();

  window.KH_GACHA_SIM_API = {
    collectShareState,
    applyShareState
  };

  if (window.__KH_PENDING_SHARE_PAYLOAD?.view === "gacha") {
    applyShareState(window.__KH_PENDING_SHARE_PAYLOAD.state ?? {});
    window.__KH_PENDING_SHARE_PAYLOAD = null;
  }
})();
