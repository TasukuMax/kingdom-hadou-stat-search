(() => {
  const root = document.querySelector("#gachaSimulatorRoot");
  if (!root || typeof APP_DATA !== "object" || !Array.isArray(APP_DATA.characters)) {
    return;
  }

  const STORAGE_KEY = "kh-gacha-sim-s3-v2";
  const LEGACY_STORAGE_KEYS = ["kh-gacha-sim-s3-v1"];
  const SHARE_STATE_VERSION = 2;
  const DRAW_ANIMATION_MS = 4700;
  const PULL_PRICE_YEN = 150;
  const TEN_PULL_HISTORY_LIMIT = 12;
  const VIDEO_URL = "./assets/s3-eiketsu-summon.mov";
  const LOCAL_GACHA_ASSET_BASE = "./assets/gacha";
  const SHARE_IMAGE_WIDTH = 1600;
  const SHARE_IMAGE_HEIGHT = 900;
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
  const inlineImageCache = new Map();

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
    }
  };

  const BASE_NORMAL_GROUPS = [
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
    { rarity: "SR", tenpu: 650, rate: 3.576, names: ["カク備", "去亥", "肆氏", "松左", "崇原", "石", "中鉄", "丁之", "田永", "田有", "沛浪", "来輝", "竜川"] },
    { rarity: "R", tenpu: 550, rate: 3.333, names: ["魏興", "慶", "竭氏", "昂", "左慈", "朱鬼", "澤圭", "田孝", "東美", "尾到", "尾平", "麻鬼", "友里", "竜有", "魯延"] }
  ];

  const BASE_SSR_GUARANTEE_GROUPS = [
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

  const BASE_SSR900_GUARANTEE_GROUPS = [
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

  function toLocalGachaImageUrl(rawUrl) {
    if (!rawUrl) {
      return "";
    }
    const match = String(rawUrl).match(/\/(chara_\d+\.png)(?:\?.*)?$/i);
    if (!match) {
      return rawUrl;
    }
    return `${LOCAL_GACHA_ASSET_BASE}/${match[1]}`;
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
    const imageUrl = toLocalGachaImageUrl(sourceCharacter?.imageUrl || fallback.imageUrl || "");
    const record = {
      name,
      rarity,
      tenpu: Number(tenpu),
      type: sourceCharacter?.type || fallback.type || "",
      imageUrl,
      sourceUrl: sourceCharacter?.sourceUrl || fallback.sourceUrl || "",
      placeholder: !imageUrl
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

  function cloneGroups(groups = []) {
    return groups
      .filter((group) => group && Array.isArray(group.names))
      .map((group) => ({
        rarity: String(group.rarity || ""),
        tenpu: Number(group.tenpu || 0),
        rate: Number(group.rate || 0),
        names: group.names.map((name) => String(name))
      }));
  }

  function computeRatesByRarity(groups = []) {
    return groups.reduce(
      (totals, group) => {
        totals[group.rarity] = (totals[group.rarity] || 0) + Number(group.rate || 0) * group.names.length;
        return totals;
      },
      { SSR: 0, SR: 0, R: 0 }
    );
  }

  function normalizePityRules(pity = {}) {
    return {
      ssrEvery: Math.max(0, Number(pity.ssrEvery ?? 20)),
      ssrLabel: String(pity.ssrLabel || "SSR武将"),
      ssr900Every: Math.max(0, Number(pity.ssr900Every ?? 100)),
      ssr900Label: String(pity.ssr900Label || "SSR武将(天賦900)")
    };
  }

  const BUILTIN_BANNER_DEFINITIONS = [
    {
      key: "s3-eiketsu",
      kind: "standard",
      label: "シーズン3 英傑登用",
      eyebrow: "Season 3 / 英傑",
      stageTitle: "人材 / 英傑登用",
      stageSubtitle: "公開されている提供割合と 20回ごとのSSR確定、100回ごとの天賦900確定を反映します。",
      controlNote: "常設英傑の提供割合を基準にした本番用バナーです。",
      cautionText: "",
      crest: "英",
      featuredNames: ["王翦", "オルド", "汗明", "李牧"],
      normalGroups: BASE_NORMAL_GROUPS,
      ssrGuaranteeGroups: BASE_SSR_GUARANTEE_GROUPS,
      ssr900GuaranteeGroups: BASE_SSR900_GUARANTEE_GROUPS,
      videoUrl: VIDEO_URL
    },
    {
      key: "s3-limited-template",
      kind: "limited",
      label: "限定登用 ひな形",
      eyebrow: "Season 3 / 限定",
      stageTitle: "人材 / 限定登用",
      stageSubtitle: "限定登用をあとから差し替えるための基盤です。現在は英傑登用の確率表を仮置きしています。",
      controlNote: "限定武将の実データが集まったら、このバナー定義に提供割合を入れ替えられます。",
      cautionText: "現在は仮置きです。抽選確率は英傑登用ベースで動いています。",
      crest: "限",
      featuredNames: [],
      videoUrl: VIDEO_URL
    },
    {
      key: "s3-kessen-template",
      kind: "limited",
      label: "決戦登用 ひな形",
      eyebrow: "Season 3 / 決戦",
      stageTitle: "人材 / 決戦登用",
      stageSubtitle: "決戦登用を切り替えられるようにする土台です。今は英傑登用の確率表を仮置きしています。",
      controlNote: "決戦バナー固有の提供割合や注目武将を、あとから個別に差し替えられます。",
      cautionText: "現在は仮置きです。抽選確率は英傑登用ベースで動いています。",
      crest: "決",
      featuredNames: [],
      videoUrl: VIDEO_URL
    },
    {
      key: "s3-senbatsu-template",
      kind: "limited",
      label: "選抜登用 ひな形",
      eyebrow: "Season 3 / 選抜",
      stageTitle: "人材 / 選抜登用",
      stageSubtitle: "選抜登用を選べるようにする土台です。今は英傑登用の確率表を仮置きしています。",
      controlNote: "選抜バナーのピックアップ情報が揃ったら、そのまま差し替えられます。",
      cautionText: "現在は仮置きです。抽選確率は英傑登用ベースで動いています。",
      crest: "選",
      featuredNames: [],
      videoUrl: VIDEO_URL
    }
  ];

  function prepareBannerDefinition(definition) {
    if (!definition || !definition.key) {
      return null;
    }

    const normalGroups =
      Array.isArray(definition.normalGroups) && definition.normalGroups.length
        ? cloneGroups(definition.normalGroups)
        : cloneGroups(BASE_NORMAL_GROUPS);
    const ssrGuaranteeGroups =
      Array.isArray(definition.ssrGuaranteeGroups) && definition.ssrGuaranteeGroups.length
        ? cloneGroups(definition.ssrGuaranteeGroups)
        : cloneGroups(BASE_SSR_GUARANTEE_GROUPS);
    const ssr900GuaranteeGroups =
      Array.isArray(definition.ssr900GuaranteeGroups) && definition.ssr900GuaranteeGroups.length
        ? cloneGroups(definition.ssr900GuaranteeGroups)
        : cloneGroups(BASE_SSR900_GUARANTEE_GROUPS);
    const kind = definition.kind === "limited" ? "limited" : "standard";

    return {
      key: String(definition.key),
      kind,
      label: String(definition.label || definition.stageTitle || definition.key),
      eyebrow: String(definition.eyebrow || (kind === "limited" ? "Season 3 / 限定" : "Season 3 / 英傑")),
      stageTitle: String(definition.stageTitle || definition.label || "人材 / 英傑登用"),
      stageSubtitle: String(
        definition.stageSubtitle || "本家の10連結果画面を参考に、最後の結果を大きく表示します。"
      ),
      controlNote: String(definition.controlNote || ""),
      cautionText: String(definition.cautionText || ""),
      crest: String(definition.crest || (kind === "limited" ? "限" : "英")).slice(0, 2),
      featuredNames: Array.isArray(definition.featuredNames)
        ? definition.featuredNames.map((name) => String(name)).filter(Boolean)
        : [],
      videoUrl: String(definition.videoUrl || VIDEO_URL),
      pity: normalizePityRules(definition.pity || {}),
      normalGroups,
      ssrGuaranteeGroups,
      ssr900GuaranteeGroups,
      normalPool: createPreparedPool(expandGroups(normalGroups)),
      ssrGuaranteePool: createPreparedPool(expandGroups(ssrGuaranteeGroups)),
      ssr900GuaranteePool: createPreparedPool(expandGroups(ssr900GuaranteeGroups)),
      normalSummary: createGroupSummary(normalGroups),
      ssrGuaranteeSummary: createGroupSummary(ssrGuaranteeGroups),
      ssr900GuaranteeSummary: createGroupSummary(ssr900GuaranteeGroups),
      normalRatesByRarity: computeRatesByRarity(normalGroups)
    };
  }

  // Site owners can inject real limited banner data through window.KH_GACHA_BANNER_LIBRARY.
  function getExternalBannerDefinitions() {
    return Array.isArray(window.KH_GACHA_BANNER_LIBRARY) ? window.KH_GACHA_BANNER_LIBRARY : [];
  }

  function buildBannerLibrary() {
    const bannerMap = new Map();
    for (const definition of [...BUILTIN_BANNER_DEFINITIONS, ...getExternalBannerDefinitions()]) {
      const prepared = prepareBannerDefinition(definition);
      if (prepared) {
        bannerMap.set(prepared.key, prepared);
      }
    }
    return [...bannerMap.values()];
  }

  const BANNERS = buildBannerLibrary();
  const DEFAULT_BANNER = BANNERS[0];
  const BANNER_LOOKUP = new Map(BANNERS.map((entry) => [entry.key, entry]));

  function resolveBannerKey(rawKey) {
    const key = String(rawKey || "");
    return BANNER_LOOKUP.has(key) ? key : DEFAULT_BANNER.key;
  }

  function getBannerByKey(key) {
    return BANNER_LOOKUP.get(resolveBannerKey(key)) || DEFAULT_BANNER;
  }

  function createEmptyBannerProgress() {
    return {
      totalPulls: 0,
      pullCounts: {},
      lastBatch: [],
      tenPullHistory: [],
      selectedTenPullId: ""
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

  function serializeResult(entry) {
    return {
      name: entry.name,
      rarity: entry.rarity,
      tenpu: entry.tenpu,
      guaranteeKind: entry.guaranteeKind,
      sequence: entry.sequence
    };
  }

  function sanitizeHistoryEntry(entry) {
    if (!entry || !Array.isArray(entry.batch)) {
      return null;
    }
    const batch = entry.batch.map(sanitizeResult).filter(Boolean).slice(0, 10);
    if (!batch.length) {
      return null;
    }
    return {
      id: String(entry.id || `ten-${batch.at(-1)?.sequence || 0}`),
      batch,
      endedAtPull: Number(entry.endedAtPull || batch.at(-1)?.sequence || 0)
    };
  }

  function sanitizeBannerProgress(raw) {
    const nextProgress = createEmptyBannerProgress();
    if (!raw || typeof raw !== "object") {
      return nextProgress;
    }

    nextProgress.totalPulls = Math.max(0, Number(raw.totalPulls || 0));

    if (raw.pullCounts && typeof raw.pullCounts === "object") {
      for (const [name, count] of Object.entries(raw.pullCounts)) {
        const safeCount = Math.max(0, Number(count || 0));
        if (safeCount > 0) {
          nextProgress.pullCounts[name] = safeCount;
        }
      }
    }

    if (Array.isArray(raw.lastBatch)) {
      nextProgress.lastBatch = raw.lastBatch.map(sanitizeResult).filter(Boolean).slice(-10);
    }

    if (Array.isArray(raw.tenPullHistory)) {
      nextProgress.tenPullHistory = raw.tenPullHistory
        .map(sanitizeHistoryEntry)
        .filter(Boolean)
        .slice(0, TEN_PULL_HISTORY_LIMIT);
    }

    const selectedId = String(raw.selectedTenPullId || "");
    nextProgress.selectedTenPullId = nextProgress.tenPullHistory.some((entry) => entry.id === selectedId) ? selectedId : "";

    const countedPulls = Object.values(nextProgress.pullCounts).reduce((sum, count) => sum + Number(count), 0);
    if (countedPulls > 0 && nextProgress.totalPulls < countedPulls) {
      nextProgress.totalPulls = countedPulls;
    }

    return nextProgress;
  }

  function serializeBannerProgress(progress) {
    return {
      totalPulls: progress.totalPulls,
      pullCounts: progress.pullCounts,
      lastBatch: progress.lastBatch.map(serializeResult),
      tenPullHistory: progress.tenPullHistory.map((entry) => ({
        id: entry.id,
        endedAtPull: entry.endedAtPull,
        batch: entry.batch.map(serializeResult)
      })),
      selectedTenPullId: progress.selectedTenPullId
    };
  }

  function hasBannerProgressData(progress) {
    return Boolean(
      progress.totalPulls > 0 ||
        Object.keys(progress.pullCounts).length ||
        progress.lastBatch.length ||
        progress.tenPullHistory.length
    );
  }

  function ensureBannerProgress(targetState, key = targetState.bannerKey) {
    const safeKey = resolveBannerKey(key);
    if (!targetState.banners[safeKey]) {
      targetState.banners[safeKey] = createEmptyBannerProgress();
    }
    return targetState.banners[safeKey];
  }

  function createDefaultState() {
    return {
      bannerKey: DEFAULT_BANNER.key,
      banners: {
        [DEFAULT_BANNER.key]: createEmptyBannerProgress()
      },
      animationEnabled: true
    };
  }

  function sanitizeState(raw) {
    const nextState = createDefaultState();
    if (!raw || typeof raw !== "object") {
      return nextState;
    }

    nextState.bannerKey = resolveBannerKey(raw.bannerKey);
    nextState.animationEnabled = raw.animationEnabled !== false;
    nextState.banners = {};

    if (raw.banners && typeof raw.banners === "object") {
      for (const [bannerKey, progress] of Object.entries(raw.banners)) {
        const safeKey = resolveBannerKey(bannerKey);
        nextState.banners[safeKey] = sanitizeBannerProgress(progress);
      }
    }

    if (raw.bannerProgress && typeof raw.bannerProgress === "object") {
      nextState.banners[nextState.bannerKey] = sanitizeBannerProgress(raw.bannerProgress);
    } else {
      const legacyProgress = sanitizeBannerProgress(raw);
      if (hasBannerProgressData(legacyProgress)) {
        nextState.banners[nextState.bannerKey] = legacyProgress;
      }
    }

    ensureBannerProgress(nextState, nextState.bannerKey);
    return nextState;
  }

  function loadState() {
    try {
      for (const key of [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]) {
        const stored = window.localStorage.getItem(key);
        if (!stored) {
          continue;
        }
        return sanitizeState(JSON.parse(stored));
      }
      return createDefaultState();
    } catch (error) {
      return createDefaultState();
    }
  }

  function saveState() {
    const serializable = {
      bannerKey: state.bannerKey,
      banners: Object.fromEntries(Object.entries(state.banners).map(([key, progress]) => [key, serializeBannerProgress(progress)])),
      animationEnabled: state.animationEnabled
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        window.localStorage.removeItem(legacyKey);
      }
    } catch (error) {
      // ignore persistence failures
    }
  }

  function renderProbabilityDisclosure(title, summaryText, contentId) {
    return `
      <details class="gacha-probability-disclosure">
        <summary class="gacha-probability-disclosure__summary">
          <div>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(summaryText)}</p>
          </div>
          <span class="gacha-probability-disclosure__hint">タップで表示</span>
        </summary>
        <div class="gacha-probability-disclosure__body" id="${escapeHtml(contentId)}"></div>
      </details>
    `;
  }

  const state = loadState();
  let isDrawing = false;
  let shareActionBusy = false;
  let drawAnimationTimer = null;

  function getActiveBanner() {
    return getBannerByKey(state.bannerKey);
  }

  function getActiveBannerProgress() {
    return ensureBannerProgress(state, state.bannerKey);
  }

  root.innerHTML = `
    <div class="gacha-shell">
      <div class="gacha-stage-column">
        <section class="gacha-stage-card">
          <div class="gacha-stage" id="gachaStage">
            <div class="gacha-stage__header">
              <div class="gacha-stage__title-group">
                <span class="gacha-stage__crest" id="gachaBannerCrest">英</span>
                <div>
                  <p class="gacha-stage__eyebrow" id="gachaBannerEyebrow">Season 3 / 英傑</p>
                  <h3 class="gacha-stage__title" id="gachaBannerTitle">人材 / 英傑登用</h3>
                </div>
              </div>
              <button class="gacha-stage__close" id="gachaResetStageButton" type="button" aria-label="結果をリセット">×</button>
            </div>

            <div class="gacha-stage__subhead">
              <div>
                <p class="gacha-stage__subtitle" id="gachaStageSubtitle">本家の10連結果画面を参考に、最後の結果を大きく表示します。</p>
                <p class="gacha-stage__hint" id="gachaLatestSummary">まだ登用していません。右側のボタンから開始してください。</p>
              </div>
              <div class="gacha-stage__meta">
                <span class="gacha-mini-stat"><strong id="gachaTotalPullsStat">0</strong><span>累計回数</span></span>
                <span class="gacha-mini-stat"><strong id="gachaApproxSpendStat">0円</strong><span>概算課金額</span></span>
              </div>
            </div>

            <div class="gacha-stage__result-board">
              <div class="gacha-results-grid" id="gachaResultsGrid"></div>
            </div>

            <div class="gacha-stage__cta-row" id="gachaStageCtaRow">
              <button class="gacha-stage__draw-button gacha-stage__draw-button--single" id="gachaStageDrawOneButton" type="button">
                <strong>1回引く</strong>
                <span>単発の結果を見る</span>
              </button>
              <button class="gacha-stage__draw-button gacha-stage__draw-button--ten" id="gachaStageDrawTenButton" type="button">
                <strong>もう10連する</strong>
                <span>本家寄せの結果画面へ更新</span>
              </button>
              <button class="gacha-stage__draw-button gacha-stage__draw-button--history" id="gachaStageHistoryButton" type="button">
                <strong>10連履歴</strong>
                <span>過去の結果を見返す</span>
              </button>
            </div>

            <div class="gacha-stage__footer">
              <p class="gacha-stage__notice">所持中の武将を再獲得した場合は、シミュレーター上では回数に加算して集計します。</p>
              <p class="gacha-stage__notice gacha-stage__notice--accent" id="gachaPityNotice"></p>
              <div class="gacha-stage__actionbar">
                <p class="gacha-stage__share-summary" id="gachaShareSummary">10連結果が表示されると、見た目そのままに画像共有できます。</p>
                <div class="gacha-stage__share-buttons">
                  <button class="secondary-button" id="gachaExportImageButton" type="button">結果画像を書き出す</button>
                  <button class="primary-button" id="gachaShareImageButton" type="button">結果画像を共有</button>
                </div>
              </div>
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
              <p>選択中のバナーに合わせて、通常枠と確定枠の内訳を切り替えます。</p>
            </div>
          </div>
          <div class="gacha-probability-grid" id="gachaProbabilityGrid"></div>
        </section>

        <section class="result-section partial-section gacha-history-card">
          <div class="result-header">
            <div>
              <h2>10連履歴</h2>
              <p>各10連で出た武将をそのまま残します。履歴を押すと、その10連を結果画面へ戻して共有できます。</p>
            </div>
            <span class="count-pill" id="gachaHistoryCount"></span>
          </div>
          <div class="gacha-history-list" id="gachaHistoryList"></div>
        </section>
      </div>

      <div class="gacha-side-column">
        <section class="panel gacha-control-card">
          <div class="panel-header">
            <div>
              <h2>登用操作</h2>
              <p>通常・限定・決戦・選抜の各バナーを切り替えながら、個別に回数を積み上げられます。</p>
            </div>
          </div>
          <div class="gacha-control-stack">
            <div class="field">
              <label for="gachaBannerSelect">対象バナー</label>
              <select id="gachaBannerSelect"></select>
              <p class="field-note" id="gachaBannerControlNote">限定バナーのひな形もここから切り替えます。</p>
            </div>
            <div class="status-pills" id="gachaBannerMeta"></div>
            <div class="status-pills" id="gachaBannerFeatured" hidden></div>
            <label class="gacha-toggle">
              <input id="gachaAnimationToggle" type="checkbox">
              <span>実機録画ベースの動画演出を流す</span>
            </label>
            <div class="gacha-button-grid">
              <button class="primary-button gacha-draw-button" id="gachaDrawTenButton" type="button">10連を引く</button>
              <button class="secondary-button gacha-draw-button" id="gachaDrawOneButton" type="button">1回引く</button>
              <button class="secondary-button gacha-draw-button" id="gachaResetButton" type="button">履歴をリセット</button>
            </div>
            <div class="toolbar-summary" id="gachaBannerSummary"></div>
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
              <h2>SSR武将ごとの獲得回数</h2>
              <p>Game8寄せで、SSRを1回以上引いた武将だけを表示します。回数表示はそのまま残します。</p>
            </div>
            <span class="count-pill" id="gachaUniqueCount"></span>
          </div>
          <div class="gacha-pull-counts" id="gachaPullCounts"></div>
        </section>
      </div>
    </div>
  `;

  const elements = {
    stage: root.querySelector("#gachaStage"),
    bannerCrest: root.querySelector("#gachaBannerCrest"),
    bannerEyebrow: root.querySelector("#gachaBannerEyebrow"),
    bannerTitle: root.querySelector("#gachaBannerTitle"),
    stageSubtitle: root.querySelector("#gachaStageSubtitle"),
    animationOverlay: root.querySelector("#gachaAnimationOverlay"),
    animationVideo: root.querySelector("#gachaAnimationVideo"),
    animationStatus: root.querySelector("#gachaAnimationStatus"),
    bannerSelect: root.querySelector("#gachaBannerSelect"),
    bannerControlNote: root.querySelector("#gachaBannerControlNote"),
    bannerMeta: root.querySelector("#gachaBannerMeta"),
    bannerFeatured: root.querySelector("#gachaBannerFeatured"),
    bannerSummary: root.querySelector("#gachaBannerSummary"),
    probabilityGrid: root.querySelector("#gachaProbabilityGrid"),
    animationToggle: root.querySelector("#gachaAnimationToggle"),
    drawOneButton: root.querySelector("#gachaDrawOneButton"),
    drawTenButton: root.querySelector("#gachaDrawTenButton"),
    stageDrawOneButton: root.querySelector("#gachaStageDrawOneButton"),
    stageDrawTenButton: root.querySelector("#gachaStageDrawTenButton"),
    stageHistoryButton: root.querySelector("#gachaStageHistoryButton"),
    resetButton: root.querySelector("#gachaResetButton"),
    resetStageButton: root.querySelector("#gachaResetStageButton"),
    exportImageButton: root.querySelector("#gachaExportImageButton"),
    shareImageButton: root.querySelector("#gachaShareImageButton"),
    resultsGrid: root.querySelector("#gachaResultsGrid"),
    latestSummary: root.querySelector("#gachaLatestSummary"),
    shareSummary: root.querySelector("#gachaShareSummary"),
    pityNotice: root.querySelector("#gachaPityNotice"),
    totalPullsStat: root.querySelector("#gachaTotalPullsStat"),
    approxSpendStat: root.querySelector("#gachaApproxSpendStat"),
    controlSummary: root.querySelector("#gachaControlSummary"),
    statGrid: root.querySelector("#gachaStatGrid"),
    uniqueCount: root.querySelector("#gachaUniqueCount"),
    pullCounts: root.querySelector("#gachaPullCounts"),
    historyCount: root.querySelector("#gachaHistoryCount"),
    historyList: root.querySelector("#gachaHistoryList"),
    normalRates: null,
    guaranteeRates: null,
    guarantee900Rates: null
  };

  function renderBannerSelectOptions() {
    elements.bannerSelect.innerHTML = BANNERS.map((banner) => {
      const prefix = banner.kind === "limited" ? "限定" : "常設";
      return `<option value="${escapeHtml(banner.key)}">${escapeHtml(prefix)} / ${escapeHtml(banner.label)}</option>`;
    }).join("");
  }

  function renderProbabilityPanels() {
    const activeBanner = getActiveBanner();
    const ssrPityText = activeBanner.pity.ssrEvery
      ? `${activeBanner.pity.ssrEvery}回目は${activeBanner.pity.ssrLabel}のみを抽選します。`
      : "このバナーにSSR確定枠はありません。";
    const ssr900PityText = activeBanner.pity.ssr900Every
      ? `${activeBanner.pity.ssr900Every}回目は${activeBanner.pity.ssr900Label}のみを抽選します。`
      : "このバナーに天賦900確定枠はありません。";

    elements.probabilityGrid.innerHTML = `
      ${renderProbabilityDisclosure(
        "通常時",
        `SSR ${activeBanner.normalRatesByRarity.SSR.toFixed(3)}% / SR ${activeBanner.normalRatesByRarity.SR.toFixed(3)}% / R ${activeBanner.normalRatesByRarity.R.toFixed(3)}%`,
        "gachaNormalRates"
      )}
      ${renderProbabilityDisclosure(
        activeBanner.pity.ssrEvery ? `${activeBanner.pity.ssrEvery}回ごとのSSR確定` : "SSR確定枠",
        ssrPityText,
        "gachaGuaranteeRates"
      )}
      ${renderProbabilityDisclosure(
        activeBanner.pity.ssr900Every ? `${activeBanner.pity.ssr900Every}回ごとの天賦900確定` : "天賦900確定枠",
        ssr900PityText,
        "gachaGuarantee900Rates"
      )}
    `;

    elements.normalRates = root.querySelector("#gachaNormalRates");
    elements.guaranteeRates = root.querySelector("#gachaGuaranteeRates");
    elements.guarantee900Rates = root.querySelector("#gachaGuarantee900Rates");

    renderRateGroups(elements.normalRates, activeBanner.normalSummary);
    renderRateGroups(elements.guaranteeRates, activeBanner.ssrGuaranteeSummary);
    renderRateGroups(elements.guarantee900Rates, activeBanner.ssr900GuaranteeSummary);
  }

  function renderBannerChrome() {
    const activeBanner = getActiveBanner();
    const metaPills = [
      `<span class="count-pill">${escapeHtml(activeBanner.kind === "limited" ? "限定バナー" : "常設バナー")}</span>`
    ];

    if (activeBanner.pity.ssrEvery) {
      metaPills.push(`<span class="count-pill">${escapeHtml(`${activeBanner.pity.ssrEvery}回ごとSSR確定`)}</span>`);
    }
    if (activeBanner.pity.ssr900Every) {
      metaPills.push(`<span class="count-pill">${escapeHtml(`${activeBanner.pity.ssr900Every}回ごと天賦900確定`)}</span>`);
    }
    if (activeBanner.cautionText) {
      metaPills.push('<span class="count-pill">仮置き</span>');
    }

    elements.bannerCrest.textContent = activeBanner.crest;
    elements.bannerEyebrow.textContent = activeBanner.eyebrow;
    elements.bannerTitle.textContent = activeBanner.stageTitle;
    elements.stageSubtitle.textContent = activeBanner.stageSubtitle;
    elements.bannerSelect.value = activeBanner.key;
    elements.bannerControlNote.textContent = activeBanner.controlNote || "バナーごとの進捗を分けて保存します。";
    elements.bannerMeta.innerHTML = metaPills.join("");
    elements.bannerSummary.textContent =
      activeBanner.cautionText || `${activeBanner.label}として保存中です。履歴と累計回数はこのバナー単位で分けて保持します。`;

    if (activeBanner.featuredNames.length) {
      elements.bannerFeatured.hidden = false;
      elements.bannerFeatured.innerHTML = activeBanner.featuredNames
        .map((name) => `<span class="count-pill">${escapeHtml(name)}</span>`)
        .join("");
    } else {
      elements.bannerFeatured.hidden = true;
      elements.bannerFeatured.innerHTML = "";
    }

    if (elements.animationVideo) {
      const currentSrc = elements.animationVideo.getAttribute("src") || "";
      if (currentSrc !== activeBanner.videoUrl) {
        elements.animationVideo.setAttribute("src", activeBanner.videoUrl);
        elements.animationVideo.load?.();
      }
    }

    renderProbabilityPanels();
  }

  function buildTenPullHistoryId(batch) {
    return `ten-${batch.at(-1)?.sequence || 0}`;
  }

  function recordTenPullHistory(batch) {
    const progress = getActiveBannerProgress();
    const entry = {
      id: buildTenPullHistoryId(batch),
      endedAtPull: Number(batch.at(-1)?.sequence || 0),
      batch: batch.map((result) => sanitizeResult(result)).filter(Boolean)
    };
    progress.tenPullHistory = [
      entry,
      ...progress.tenPullHistory.filter((current) => current.id !== entry.id)
    ].slice(0, TEN_PULL_HISTORY_LIMIT);
    return entry;
  }

  function getSelectedTenPullEntry() {
    const progress = getActiveBannerProgress();
    return progress.selectedTenPullId
      ? progress.tenPullHistory.find((entry) => entry.id === progress.selectedTenPullId) ?? null
      : null;
  }

  function getDisplayBatch() {
    return getSelectedTenPullEntry()?.batch ?? getActiveBannerProgress().lastBatch;
  }

  function getBatchRangeLabel(batch) {
    if (!batch.length) {
      return "";
    }
    const first = Number(batch[0]?.sequence || 0);
    const last = Number(batch.at(-1)?.sequence || first);
    if (!first || !last) {
      return batch.length >= 10 ? "10連結果" : "単発結果";
    }
    return first === last ? `${last}回目` : `${first}〜${last}回目`;
  }

  function countBatchRarities(batch) {
    return batch.reduce(
      (summary, entry) => {
        summary[entry.rarity] = (summary[entry.rarity] || 0) + 1;
        return summary;
      },
      { SSR: 0, SR: 0, R: 0 }
    );
  }

  function getApproximateSpend(totalPulls) {
    return Number(totalPulls || 0) * PULL_PRICE_YEN;
  }

  function getNextGuaranteeKind(pullNumber) {
    const activeBanner = getActiveBanner();
    if (activeBanner.pity.ssr900Every > 0 && pullNumber % activeBanner.pity.ssr900Every === 0) {
      return "ssr900";
    }
    if (activeBanner.pity.ssrEvery > 0 && pullNumber % activeBanner.pity.ssrEvery === 0) {
      return "ssr";
    }
    return "";
  }

  function getPoolForGuarantee(guaranteeKind) {
    const activeBanner = getActiveBanner();
    if (guaranteeKind === "ssr900") {
      return activeBanner.ssr900GuaranteePool;
    }
    if (guaranteeKind === "ssr") {
      return activeBanner.ssrGuaranteePool;
    }
    return activeBanner.normalPool;
  }

  function pullOne() {
    const progress = getActiveBannerProgress();
    const nextPullNumber = progress.totalPulls + 1;
    const guaranteeKind = getNextGuaranteeKind(nextPullNumber);
    const pool = getPoolForGuarantee(guaranteeKind);
    const entry = pickWeightedEntry(pool);
    const result = cloneResultRecord(entry, {
      guaranteeKind,
      sequence: nextPullNumber
    });

    progress.totalPulls = nextPullNumber;
    progress.pullCounts[result.name] = (progress.pullCounts[result.name] || 0) + 1;

    return result;
  }

  function drawBatch(count) {
    const progress = getActiveBannerProgress();
    const batch = [];
    for (let index = 0; index < count; index += 1) {
      batch.push(pullOne());
    }
    progress.lastBatch = batch;
    if (count >= 10) {
      const historyEntry = recordTenPullHistory(batch);
      progress.selectedTenPullId = historyEntry.id;
    } else {
      progress.selectedTenPullId = "";
    }
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

  function summarizeBatch(batch, options = {}) {
    if (!batch.length) {
      return "まだ登用していません。右側のボタンから開始してください。";
    }

    const counts = countBatchRarities(batch);

    const highlightedNames = batch.filter((entry) => entry.rarity === "SSR").map((entry) => entry.name);
    const countLabel = options.label || (batch.length >= 10 ? "直近10連" : "直近結果");
    const ssrSuffix = highlightedNames.length ? ` / SSR: ${highlightedNames.join("、")}` : "";
    return `${countLabel}は SSR ${counts.SSR || 0} / SR ${counts.SR || 0} / R ${counts.R || 0}${ssrSuffix}`;
  }

  function buildPityNotice() {
    const activeBanner = getActiveBanner();
    const progress = getActiveBannerProgress();
    const notices = [];

    if (activeBanner.pity.ssrEvery) {
      notices.push(`あと${pullsUntil(activeBanner.pity.ssrEvery, progress.totalPulls)}回で${activeBanner.pity.ssrLabel}`);
    }
    if (activeBanner.pity.ssr900Every) {
      notices.push(`あと${pullsUntil(activeBanner.pity.ssr900Every, progress.totalPulls)}回で${activeBanner.pity.ssr900Label}`);
    }

    return notices.length ? notices.join("、") : "このバナーに確定枠はありません。";
  }

  function buildDrawControlSummary() {
    const activeBanner = getActiveBanner();
    const progress = getActiveBannerProgress();
    const approximateSpend = getApproximateSpend(progress.totalPulls);
    const parts = [`累計 ${formatCount(progress.totalPulls)}回`, `概算 ${formatCurrencyYen(approximateSpend)}`];

    if (activeBanner.pity.ssrEvery) {
      parts.push(`次のSSR確定まで ${pullsUntil(activeBanner.pity.ssrEvery, progress.totalPulls)}回`);
    }
    if (activeBanner.pity.ssr900Every) {
      parts.push(`次の天賦900確定まで ${pullsUntil(activeBanner.pity.ssr900Every, progress.totalPulls)}回`);
    }

    return parts.join(" / ");
  }

  function getShareableBatch() {
    const batch = getDisplayBatch();
    return batch.length === 10 ? batch.slice(0, 10) : [];
  }

  function buildShareSummary() {
    const batch = getShareableBatch();
    if (!batch.length) {
      return "10連結果が表示されると、ここからそのまま画像化して共有できます。";
    }
    const ssrEntries = batch.filter((entry) => entry.rarity === "SSR");
    const shareScope = getSelectedTenPullEntry() ? `${getBatchRangeLabel(batch)}の` : "直近10連の";
    if (!ssrEntries.length) {
      return `${shareScope}画像共有ができます。今回のSSRは0体です。`;
    }
    return `${shareScope}画像共有ができます。SSR ${ssrEntries.length}体: ${ssrEntries.map((entry) => entry.name).join("、")}`;
  }

  function renderPortrait(record, className = "gacha-result-card__portrait") {
    const themeClass = TYPE_THEME[record.type] ? ` is-${TYPE_THEME[record.type]}` : "";
    if (record.imageUrl) {
      return `<img class="${className}" src="${escapeHtml(record.imageUrl)}" alt="${escapeHtml(record.name)}">`;
    }
    const initial = escapeHtml(record.name.slice(0, 1));
    return `<div class="${className} gacha-result-card__portrait--fallback${themeClass}" aria-label="${escapeHtml(record.name)}">${initial}</div>`;
  }

  function buildResultCard(record, index) {
    const activeBanner = getActiveBanner();
    const rarityClass = `is-${record.rarity.toLowerCase()}`;
    const guaranteeLabel =
      record.guaranteeKind === "ssr900"
        ? `<span class="gacha-result-card__badge is-ssr900">${escapeHtml(activeBanner.pity.ssr900Every || 100)}回確定</span>`
        : record.guaranteeKind === "ssr"
          ? `<span class="gacha-result-card__badge is-ssr">${escapeHtml(activeBanner.pity.ssrEvery || 20)}回確定</span>`
          : "";
    const typeLabel = record.type || "？";
    const typeClass = TYPE_THEME[record.type] ? ` is-${TYPE_THEME[record.type]}` : "";

    return `
      <article class="gacha-result-card ${rarityClass}" style="--gacha-card-delay:${index * 70}ms;">
        <div class="gacha-result-card__glow"></div>
        <div class="gacha-result-card__topline">
          <span class="gacha-result-card__rarity">${escapeHtml(record.rarity)}</span>
          <span class="gacha-result-card__tenpu-chip">天賦${escapeHtml(record.tenpu)}</span>
        </div>
        ${guaranteeLabel}
        <div class="gacha-result-card__portrait-wrap">
          ${renderPortrait(record)}
        </div>
        <div class="gacha-result-card__countline">
          <span class="gacha-result-card__shard">◈</span>
          <strong class="gacha-result-card__count">1000</strong>
        </div>
        <div class="gacha-result-card__bottom">
          <span class="gacha-result-card__type${typeClass}">${escapeHtml(typeLabel)}</span>
          <span class="gacha-result-card__nameplate">${escapeHtml(record.name)}</span>
        </div>
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
    const batch = getDisplayBatch().slice(-10);
    const filledCards = batch.map((record, index) => buildResultCard(record, index));
    const emptyCount = Math.max(0, 10 - filledCards.length);
    const emptyCards = Array.from({ length: emptyCount }, () => buildEmptyResultCard());
    elements.resultsGrid.innerHTML = [...filledCards, ...emptyCards].join("");
  }

  function buildHistoryMiniCard(record) {
    return `
      <article class="gacha-history-mini">
        <div class="gacha-history-mini__thumb">
          ${renderPortrait(record)}
        </div>
        <span class="gacha-history-mini__name">${escapeHtml(record.name)}</span>
        <span class="gacha-history-mini__rarity">${escapeHtml(record.rarity)} / 天賦${escapeHtml(record.tenpu)}</span>
      </article>
    `;
  }

  function renderHistoryList() {
    if (!elements.historyList || !elements.historyCount) {
      return;
    }

    const progress = getActiveBannerProgress();
    elements.historyCount.textContent = progress.tenPullHistory.length ? `${progress.tenPullHistory.length}件` : "";
    if (!progress.tenPullHistory.length) {
      elements.historyList.innerHTML = '<p class="toolbar-summary">10連を引くと、ここに結果履歴が残ります。</p>';
      return;
    }

    elements.historyList.innerHTML = progress.tenPullHistory
      .map((entry) => {
        const counts = countBatchRarities(entry.batch);
        const isActive = entry.id === progress.selectedTenPullId;
        return `
          <article class="gacha-history-entry${isActive ? " is-active" : ""}">
            <div class="gacha-history-entry__head">
              <div>
                <h3>${escapeHtml(getBatchRangeLabel(entry.batch))}</h3>
                <p>SSR ${counts.SSR || 0} / SR ${counts.SR || 0} / R ${counts.R || 0}</p>
              </div>
              <button class="mini-button" type="button" data-gacha-history-id="${escapeHtml(entry.id)}">
                ${isActive ? "表示中" : "この10連を表示"}
              </button>
            </div>
            <div class="gacha-history-entry__grid">
              ${entry.batch.map(buildHistoryMiniCard).join("")}
            </div>
          </article>
        `;
      })
      .join("");
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

  function getPulledRecords({ rarity = "" } = {}) {
    return Object.entries(getActiveBannerProgress().pullCounts)
      .map(([name, count]) => ({
        ...findPulledRecord(name),
        name,
        count: Number(count)
      }))
      .filter((entry) => entry.count > 0)
      .filter((entry) => !rarity || entry.rarity === rarity)
      .sort((left, right) => {
        if (RARITY_ORDER[right.rarity] !== RARITY_ORDER[left.rarity]) {
          return RARITY_ORDER[right.rarity] - RARITY_ORDER[left.rarity];
        }
        if (Number(right.tenpu) !== Number(left.tenpu)) {
          return Number(right.tenpu) - Number(left.tenpu);
        }
        if (right.count !== left.count) {
          return right.count - left.count;
        }
        return left.name.localeCompare(right.name, "ja");
      });
  }

  function renderPullCounts() {
    const pulledRecords = getPulledRecords({ rarity: "SSR" });
    elements.uniqueCount.textContent = `${formatCount(pulledRecords.length)}体`;

    if (!pulledRecords.length) {
      elements.pullCounts.innerHTML = '<p class="toolbar-summary">まだSSR武将を引いていません。</p>';
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
    const activeBanner = getActiveBanner();
    const progress = getActiveBannerProgress();
    const allPulledRecords = getPulledRecords();
    const ssrPulledRecords = allPulledRecords.filter((record) => record.rarity === "SSR");
    const ssrTotal = ssrPulledRecords.reduce((sum, record) => sum + Number(record.count || 0), 0);
    const ssr900Total = ssrPulledRecords
      .filter((record) => Number(record.tenpu) === 900)
      .reduce((sum, record) => sum + Number(record.count || 0), 0);
    const latestSsrCount = progress.lastBatch.filter((entry) => entry.rarity === "SSR").length;

    const cards = [
      buildStatCard("累計回数", `${formatCount(progress.totalPulls)}回`, "is-gold"),
      buildStatCard("概算課金額", formatCurrencyYen(getApproximateSpend(progress.totalPulls)), "is-bronze"),
      buildStatCard("累計SSR", `${formatCount(ssrTotal)}体`),
      buildStatCard("累計天賦900", `${formatCount(ssr900Total)}体`),
      buildStatCard(
        "次のSSR確定",
        activeBanner.pity.ssrEvery ? `あと${pullsUntil(activeBanner.pity.ssrEvery, progress.totalPulls)}回` : "なし"
      ),
      buildStatCard(
        "次の900確定",
        activeBanner.pity.ssr900Every ? `あと${pullsUntil(activeBanner.pity.ssr900Every, progress.totalPulls)}回` : "なし"
      ),
      buildStatCard("直近結果", `${formatCount(latestSsrCount)}体 SSR`),
      buildStatCard("獲得SSR武将数", `${formatCount(ssrPulledRecords.length)}体`)
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

  function downloadBlobFile(filename, blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("gacha-share-file-read-failed"));
      reader.readAsDataURL(blob);
    });
  }

  async function getInlineImageDataUrl(rawUrl) {
    if (!rawUrl) {
      return "";
    }

    const absoluteUrl = new URL(rawUrl, window.location.href).href;
    if (inlineImageCache.has(absoluteUrl)) {
      return inlineImageCache.get(absoluteUrl);
    }

    const pending = fetch(absoluteUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("gacha-share-image-fetch-failed");
        }
        return response.blob();
      })
      .then(blobToDataUrl)
      .catch(() => "");

    inlineImageCache.set(absoluteUrl, pending);
    return pending;
  }

  function buildSharePortraitMarkup(record, inlineImageUrl, index, centerX, centerY, radius) {
    if (inlineImageUrl) {
      return `
        <clipPath id="gacha-share-clip-${index}">
          <circle cx="${centerX}" cy="${centerY}" r="${radius}" />
        </clipPath>
        <image
          href="${escapeHtml(inlineImageUrl)}"
          x="${centerX - radius}"
          y="${centerY - radius}"
          width="${radius * 2}"
          height="${radius * 2}"
          preserveAspectRatio="xMidYMid slice"
          clip-path="url(#gacha-share-clip-${index})"
        />
      `;
    }

    const fallbackFill = {
      battle: "#9f332f",
      guard: "#356cc6",
      support: "#2e8a5f",
      debuff: "#834aac"
    }[TYPE_THEME[record.type] || ""] || "#5c4530";
    return `
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${fallbackFill}" />
      <text x="${centerX}" y="${centerY + 18}" fill="#fff7ea" font-size="58" font-weight="900" text-anchor="middle">${escapeHtml(
        record.name.slice(0, 1)
      )}</text>
    `;
  }

  function buildShareResultCard(record, inlineImageUrl, index, x, y) {
    const activeBanner = getActiveBanner();
    const width = 236;
    const centerX = x + width / 2;
    const centerY = y + 92;
    const portraitRadius = 68;
    const rarityColor =
      record.rarity === "SSR" ? "#ffd33c" : record.rarity === "SR" ? "#cb82ff" : "#3ca7ff";
    const ringColor =
      record.rarity === "SSR" ? "#ffcc36" : record.rarity === "SR" ? "#b372ff" : "#47a8ff";
    const glowColor =
      record.rarity === "SSR"
        ? "rgba(255, 207, 72, 0.56)"
        : record.rarity === "SR"
          ? "rgba(190, 124, 255, 0.42)"
          : "rgba(61, 159, 255, 0.22)";
    const typeClass = TYPE_THEME[record.type] || "";
    const typeFill = {
      battle: "#a23630",
      guard: "#2d67c4",
      support: "#25855a",
      debuff: "#8b4db7"
    }[typeClass] || "rgba(255,255,255,0.22)";
    const guaranteeBadge =
      record.guaranteeKind === "ssr900"
        ? `
            <rect x="${x + 148}" y="${y + 12}" width="76" height="26" rx="13" fill="#612515" stroke="rgba(255,244,212,0.18)" />
            <text x="${x + 186}" y="${y + 30}" fill="#fff3c5" font-size="12" font-weight="800" text-anchor="middle">${escapeHtml(
              `${activeBanner.pity.ssr900Every || 100}回確定`
            )}</text>
          `
        : record.guaranteeKind === "ssr"
          ? `
              <rect x="${x + 148}" y="${y + 12}" width="76" height="26" rx="13" fill="rgba(21,9,9,0.82)" stroke="rgba(255,244,212,0.18)" />
              <text x="${x + 186}" y="${y + 30}" fill="#ffe6aa" font-size="12" font-weight="800" text-anchor="middle">${escapeHtml(
                `${activeBanner.pity.ssrEvery || 20}回確定`
              )}</text>
            `
          : "";

    return `
      <g transform="translate(0 0)">
        <ellipse cx="${centerX}" cy="${centerY + 2}" rx="88" ry="70" fill="${glowColor}" />
        <text x="${x + 12}" y="${y + 34}" fill="${rarityColor}" font-size="${
          record.rarity === "SSR" ? 56 : 52
        }" font-weight="900">${escapeHtml(record.rarity)}</text>
        <rect x="${x + 148}" y="${y + 48}" width="74" height="22" rx="11" fill="rgba(18,7,6,0.72)" />
        <text x="${x + 185}" y="${y + 63}" fill="#ffe7b8" font-size="11" font-weight="700" text-anchor="middle">天賦${escapeHtml(
          record.tenpu
        )}</text>
        ${guaranteeBadge}
        <circle cx="${centerX}" cy="${centerY}" r="${portraitRadius + 7}" fill="rgba(255,244,220,0.08)" />
        <circle cx="${centerX}" cy="${centerY}" r="${portraitRadius}" fill="rgba(34,12,10,0.88)" stroke="${ringColor}" stroke-width="8" />
        ${buildSharePortraitMarkup(record, inlineImageUrl, index, centerX, centerY, portraitRadius)}
        <rect x="${x + 54}" y="${y + 160}" width="128" height="30" rx="15" fill="rgba(20,8,8,0.68)" />
        <text x="${x + 118}" y="${y + 181}" fill="#fff4df" font-size="26" font-weight="800" text-anchor="middle">◈ 1000</text>
        <rect x="${x + 8}" y="${y + 198}" width="36" height="34" rx="11" fill="${typeFill}" />
        <text x="${x + 26}" y="${y + 222}" fill="#fff8ed" font-size="18" font-weight="800" text-anchor="middle">${escapeHtml(
          record.type || "？"
        )}</text>
        <rect x="${x + 50}" y="${y + 196}" width="174" height="38" rx="12" fill="rgba(10,3,3,0.9)" />
        <text x="${x + 137}" y="${y + 220}" fill="#fff9f0" font-size="28" font-weight="800" text-anchor="middle">${escapeHtml(
          record.name
        )}</text>
      </g>
    `;
  }

  function buildGachaShareCardSvg(batch) {
    const activeBanner = getActiveBanner();
    const progress = getActiveBannerProgress();
    const currentDate = new Date().toLocaleString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    const ssrCount = batch.filter((entry) => entry.rarity === "SSR").length;
    const topLine = `累計 ${formatCount(progress.totalPulls)}回 / 概算 ${formatCurrencyYen(getApproximateSpend(progress.totalPulls))}`;
    const pityText = buildPityNotice();
    const batchTitle = getSelectedTenPullEntry() ? `${getBatchRangeLabel(batch)}の結果` : "直近10連結果";
    const cardMarkup = batch
      .map((record, index) => {
        const x = 188 + (index % 5) * 250;
        const y = 176 + Math.floor(index / 5) * 246;
        return buildShareResultCard(record, record.inlineImageUrl || "", index, x, y);
      })
      .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SHARE_IMAGE_WIDTH}" height="${SHARE_IMAGE_HEIGHT}" viewBox="0 0 ${SHARE_IMAGE_WIDTH} ${SHARE_IMAGE_HEIGHT}" role="img" aria-label="キングダム覇道 ${escapeHtml(activeBanner.label)} 10連結果">
  <defs>
    <linearGradient id="gacha-share-bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8d2017" />
      <stop offset="42%" stop-color="#57130f" />
      <stop offset="100%" stop-color="#1c0908" />
    </linearGradient>
    <linearGradient id="gacha-share-button-green" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8ee2cd" />
      <stop offset="100%" stop-color="#2b9a84" />
    </linearGradient>
    <linearGradient id="gacha-share-button-gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f2cb72" />
      <stop offset="100%" stop-color="#ba7d23" />
    </linearGradient>
  </defs>
  <rect width="${SHARE_IMAGE_WIDTH}" height="${SHARE_IMAGE_HEIGHT}" fill="url(#gacha-share-bg)" />
  <circle cx="228" cy="452" r="254" fill="rgba(240,178,88,0.18)" />
  <circle cx="1368" cy="442" r="270" fill="rgba(240,178,88,0.18)" />
  <circle cx="804" cy="248" r="320" fill="rgba(255,216,122,0.10)" />
  <rect x="54" y="42" width="1492" height="816" rx="36" fill="rgba(0,0,0,0.16)" stroke="rgba(255,233,190,0.16)" />

  <rect x="72" y="56" width="252" height="64" rx="10" fill="rgba(0,0,0,0.54)" />
  <text x="112" y="98" fill="#fff6ef" font-size="46" font-weight="900">人材</text>
  <circle cx="382" cy="88" r="22" fill="rgba(255,255,255,0.9)" />
  <text x="382" y="96" fill="#48362b" font-size="26" font-weight="900" text-anchor="middle">?</text>
  <text x="1512" y="100" fill="#fff6ef" font-size="56" font-weight="800" text-anchor="middle">×</text>

  <rect x="1148" y="72" width="336" height="44" rx="22" fill="rgba(13,6,6,0.56)" />
  <text x="1316" y="101" fill="#ffe9c2" font-size="22" font-weight="700" text-anchor="middle">${escapeHtml(topLine)}</text>
  <text x="96" y="146" fill="rgba(255,233,194,0.92)" font-size="26">${escapeHtml(activeBanner.label)} / ${escapeHtml(currentDate)}</text>
  <text x="96" y="182" fill="#fff5eb" font-size="30" font-weight="800">${escapeHtml(batchTitle)}</text>
  <text x="96" y="212" fill="#ffe49d" font-size="20" font-weight="700">SSR ${ssrCount}体 / 共有カード</text>

  ${cardMarkup}

  <rect x="442" y="690" width="716" height="48" rx="12" fill="rgba(17,5,5,0.82)" />
  <text x="800" y="721" fill="#ffe6a7" font-size="26" font-weight="700" text-anchor="middle">所持中の武将を再獲得した場合は、シミュレーター上では回数に加算して集計します</text>
  <rect x="392" y="746" width="816" height="44" rx="12" fill="rgba(17,5,5,0.90)" />
  <text x="800" y="775" fill="#fff1bf" font-size="24" font-weight="800" text-anchor="middle">${escapeHtml(pityText)}</text>

  <g transform="translate(490 804)">
    <rect width="194" height="74" rx="16" fill="url(#gacha-share-button-green)" stroke="rgba(255,237,196,0.5)" />
    <text x="97" y="29" fill="#f7fff7" font-size="28" font-weight="800" text-anchor="middle">1回</text>
    <text x="97" y="58" fill="#fff6e9" font-size="24" font-weight="700" text-anchor="middle">単発結果</text>
  </g>
  <g transform="translate(716 794)">
    <rect width="268" height="84" rx="18" fill="url(#gacha-share-button-green)" stroke="rgba(255,237,196,0.52)" />
    <text x="134" y="34" fill="#f7fff7" font-size="34" font-weight="900" text-anchor="middle">もう10連</text>
    <text x="134" y="67" fill="#fff6e9" font-size="28" font-weight="800" text-anchor="middle">結果を更新</text>
  </g>
  <g transform="translate(1138 798)">
    <rect width="220" height="80" rx="18" fill="url(#gacha-share-button-gold)" stroke="rgba(255,237,196,0.6)" />
    <text x="110" y="52" fill="#fff7ef" font-size="38" font-weight="900" text-anchor="middle">履歴</text>
  </g>
</svg>`;
  }

  function renderGachaShareImageBlob(svgMarkup) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      image.onload = () => {
        try {
          const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1));
          const canvas = document.createElement("canvas");
          canvas.width = SHARE_IMAGE_WIDTH * scale;
          canvas.height = SHARE_IMAGE_HEIGHT * scale;
          const context = canvas.getContext("2d");
          if (!context) {
            throw new Error("gacha-share-canvas-unavailable");
          }
          context.scale(scale, scale);
          context.drawImage(image, 0, 0, SHARE_IMAGE_WIDTH, SHARE_IMAGE_HEIGHT);
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(svgUrl);
            if (blob) {
              resolve(blob);
              return;
            }
            reject(new Error("gacha-share-blob-failed"));
          }, "image/png");
        } catch (error) {
          URL.revokeObjectURL(svgUrl);
          reject(error);
        }
      };
      image.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error("gacha-share-image-load-failed"));
      };
      image.src = svgUrl;
    });
  }

  async function createGachaShareImageAsset() {
    const batch = getShareableBatch();
    if (batch.length !== 10) {
      throw new Error("gacha-share-requires-ten-pull");
    }

    const batchWithInlineImages = await Promise.all(
      batch.map(async (entry) => ({
        ...entry,
        inlineImageUrl: await getInlineImageDataUrl(entry.imageUrl)
      }))
    );
    const svgMarkup = buildGachaShareCardSvg(batchWithInlineImages);
    const blob = await renderGachaShareImageBlob(svgMarkup);
    const filename = `kingdom-hadou-gacha-result-${new Date().toISOString().slice(0, 10)}.png`;
    return {
      batch: batchWithInlineImages,
      blob,
      filename
    };
  }

  async function exportGachaShareImage() {
    const asset = await createGachaShareImageAsset();
    const download = window.KH_APP_API?.downloadBlobFile ?? downloadBlobFile;
    download(asset.filename, asset.blob);
    window.KH_APP_API?.showStatusToast?.("10連結果画像を書き出しました。");
  }

  async function shareGachaShareImage() {
    const asset = await createGachaShareImageAsset();
    const file = new File([asset.blob], asset.filename, { type: "image/png" });
    const activeBanner = getActiveBanner();
    const batchScope = getSelectedTenPullEntry() ? `${getBatchRangeLabel(asset.batch)} / ` : "直近10連結果 / ";
    const shareData = {
      files: [file],
      title: `キングダム覇道 ${activeBanner.label} 10連結果`,
      text: `${batchScope}SSR ${asset.batch.filter((entry) => entry.rarity === "SSR").length}体`
    };

    let canShareFiles = Boolean(navigator.share);
    if (canShareFiles && navigator.canShare) {
      try {
        canShareFiles = navigator.canShare({ files: [file] });
      } catch (error) {
        canShareFiles = false;
      }
    }

    if (canShareFiles) {
      await navigator.share(shareData);
      window.KH_APP_API?.showStatusToast?.("10連結果画像を共有しました。");
      return;
    }

    const download = window.KH_APP_API?.downloadBlobFile ?? downloadBlobFile;
    download(asset.filename, asset.blob);
    window.KH_APP_API?.showStatusToast?.("画像共有に未対応のため、PNGを書き出しました。");
  }

  async function runShareAction(action, errorMessage) {
    if (shareActionBusy || !getShareableBatch().length) {
      return;
    }
    shareActionBusy = true;
    renderAll();
    try {
      await action();
    } catch (error) {
      console.error(error);
      window.KH_APP_API?.showStatusToast?.(errorMessage);
    } finally {
      shareActionBusy = false;
      renderAll();
    }
  }

  function renderAll() {
    const progress = getActiveBannerProgress();
    const hasShareableBatch = getShareableBatch().length === 10;
    const displayBatch = getDisplayBatch();
    const selectedEntry = getSelectedTenPullEntry();
    const hasResults = displayBatch.length > 0;
    renderBannerChrome();
    elements.animationToggle.checked = state.animationEnabled;
    elements.stage.classList.toggle("is-result-view", hasResults);
    elements.totalPullsStat.textContent = formatCount(progress.totalPulls);
    elements.approxSpendStat.textContent = formatCurrencyYen(getApproximateSpend(progress.totalPulls));
    elements.latestSummary.textContent = summarizeBatch(
      displayBatch,
      selectedEntry ? { label: `${getBatchRangeLabel(displayBatch)}の結果` } : {}
    );
    elements.shareSummary.textContent = buildShareSummary();
    elements.pityNotice.textContent = buildPityNotice();
    elements.controlSummary.textContent = buildDrawControlSummary();
    elements.drawOneButton.disabled = isDrawing || shareActionBusy;
    elements.drawTenButton.disabled = isDrawing || shareActionBusy;
    elements.stageDrawOneButton.disabled = isDrawing || shareActionBusy;
    elements.stageDrawTenButton.disabled = isDrawing || shareActionBusy;
    elements.stageHistoryButton.disabled = isDrawing || shareActionBusy || !progress.tenPullHistory.length;
    elements.resetButton.disabled = isDrawing || shareActionBusy;
    elements.resetStageButton.disabled = isDrawing || shareActionBusy;
    elements.exportImageButton.disabled = isDrawing || shareActionBusy || !hasShareableBatch;
    elements.shareImageButton.disabled = isDrawing || shareActionBusy || !hasShareableBatch;
    renderResultsGrid();
    renderStatGrid();
    renderPullCounts();
    renderHistoryList();
  }

  function resetState() {
    state.banners[state.bannerKey] = createEmptyBannerProgress();
    saveState();
    renderAll();
  }

  function runDraw(count) {
    if (isDrawing || shareActionBusy) {
      return;
    }
    isDrawing = true;
    drawBatch(count);
    renderAll();
    if (count >= 10) {
      elements.stage?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    }
    playAnimationForDraw(count);
  }

  function collectShareState() {
    const progress = getActiveBannerProgress();
    return {
      version: SHARE_STATE_VERSION,
      bannerKey: state.bannerKey,
      bannerProgress: serializeBannerProgress({
        ...progress,
        lastBatch: getDisplayBatch().map(sanitizeResult).filter(Boolean)
      }),
      totalPulls: progress.totalPulls,
      pullCounts: progress.pullCounts,
      lastBatch: getDisplayBatch().map(serializeResult),
      animationEnabled: state.animationEnabled
    };
  }

  function applyShareState(payload = {}) {
    const nextBannerKey = resolveBannerKey(payload.bannerKey || state.bannerKey);
    state.bannerKey = nextBannerKey;
    state.banners[nextBannerKey] = sanitizeBannerProgress(payload.bannerProgress || payload);
    state.animationEnabled = payload.animationEnabled !== false;
    saveState();
    renderAll();
  }

  elements.animationToggle.addEventListener("change", () => {
    state.animationEnabled = elements.animationToggle.checked;
    saveState();
    renderAll();
  });

  elements.bannerSelect.addEventListener("change", () => {
    if (isDrawing || shareActionBusy) {
      return;
    }
    clearAnimationState();
    isDrawing = false;
    state.bannerKey = resolveBannerKey(elements.bannerSelect.value);
    ensureBannerProgress(state, state.bannerKey);
    saveState();
    renderAll();
  });

  elements.drawOneButton.addEventListener("click", () => {
    runDraw(1);
  });

  elements.drawTenButton.addEventListener("click", () => {
    runDraw(10);
  });

  elements.stageDrawOneButton.addEventListener("click", () => {
    runDraw(1);
  });

  elements.stageDrawTenButton.addEventListener("click", () => {
    runDraw(10);
  });

  elements.stageHistoryButton.addEventListener("click", () => {
    elements.historyList?.closest(".result-section")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
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
    const progress = getActiveBannerProgress();
    if (progress.selectedTenPullId) {
      progress.selectedTenPullId = "";
    } else {
      progress.lastBatch = [];
    }
    saveState();
    renderAll();
  });

  root.addEventListener("click", (event) => {
    const historyButton = event.target.closest("[data-gacha-history-id]");
    if (!historyButton) {
      return;
    }
    getActiveBannerProgress().selectedTenPullId = historyButton.dataset.gachaHistoryId || "";
    saveState();
    renderAll();
    elements.stage?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  });

  elements.exportImageButton.addEventListener("click", () => {
    runShareAction(exportGachaShareImage, "10連結果画像の書き出しに失敗しました。");
  });

  elements.shareImageButton.addEventListener("click", () => {
    runShareAction(shareGachaShareImage, "10連結果画像の共有に失敗しました。");
  });

  renderBannerSelectOptions();
  renderAll();

  window.KH_GACHA_SIM_API = {
    collectShareState,
    applyShareState,
    createGachaShareImageAsset
  };

  if (window.__KH_PENDING_SHARE_PAYLOAD?.view === "gacha") {
    applyShareState(window.__KH_PENDING_SHARE_PAYLOAD.state ?? {});
    window.__KH_PENDING_SHARE_PAYLOAD = null;
  }
})();
