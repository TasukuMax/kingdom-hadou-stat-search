(() => {
  const root = document.querySelector("#communityBoardRoot");
  if (!root) return;

  const appApi = window.KH_APP_API ?? {};
  const RUNTIME_CONFIG_URL = "./shared/runtime-config.json";
  const POST_DRAFT_STORAGE_KEY = "kh-community-post-draft-v1";
  const URL_PATTERN = /https?:\/\/[^\s<]+/g;
  const CATS = [
    { key: "all", label: "すべて" },
    { key: "formation", label: "編成" },
    { key: "general", label: "雑談" },
    { key: "tips", label: "攻略" },
    { key: "event", label: "イベント" },
    { key: "qna", label: "質問" },
    { key: "recruit", label: "募集" }
  ];
  const SERVERS = [
    { key: "all", label: "全体" },
    { key: "1", label: "サーバー1" },
    { key: "2", label: "サーバー2" },
    { key: "3", label: "サーバー3" }
  ];
  const CAT_LABEL = Object.fromEntries(CATS.map((entry) => [entry.key, entry.label]));
  const SERVER_LABEL = Object.fromEntries(SERVERS.map((entry) => [entry.key, entry.label]));
  const state = {
    loading: true,
    submitting: false,
    bridgeEnabled: false,
    apiBase: "/api",
    crossOrigin: false,
    dynamicSiteUrl: "",
    readOnly: false,
    authenticated: false,
    user: null,
    profile: null,
    posts: [],
    replies: [],
    selectedCategory: "all",
    selectedPostId: "",
    postDraft: null,
    authMode: "login",
    authError: "",
    actionError: ""
  };

  const esc = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  const fmt = (value) => {
    if (!value) return "-";
    try {
      return new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(value));
    } catch {
      return String(value);
    }
  };
  const authorName = (author) => author?.displayName || author?.loginName || "匿名";
  const badge = (label, cls = "") => (label ? `<span class="cb-badge ${cls}">${esc(label)}</span>` : "");
  const titleBadge = (author) => badge(author?.activeTitle?.label || "", "cb-badge-title");
  const normCat = (value) => (CATS.some((entry) => entry.key === value) ? value : "all");
  const repliesFor = (postId) => state.replies.filter((entry) => entry.postId === postId);
  const visiblePosts = () =>
    state.selectedCategory === "all"
      ? state.posts
      : state.posts.filter((entry) => entry.categoryKey === state.selectedCategory);
  const selectedPost = () => state.posts.find((entry) => entry.id === state.selectedPostId) ?? null;
  const renderRichText = (value) => {
    const text = String(value ?? "");
    let html = "";
    let last = 0;
    for (const match of text.matchAll(URL_PATTERN)) {
      const index = match.index ?? 0;
      html += esc(text.slice(last, index)).replaceAll("\n", "<br>");
      html += `<a href="${esc(match[0])}" target="_blank" rel="noreferrer">${esc(match[0])}</a>`;
      last = index + match[0].length;
    }
    html += esc(text.slice(last)).replaceAll("\n", "<br>");
    return html;
  };

  function createEmptyPostDraft() {
    return { categoryKey: "formation", serverScope: "all", title: "", body: "" };
  }

  function sanitizePostDraft(value) {
    if (!value || typeof value !== "object") return createEmptyPostDraft();
    return {
      categoryKey: CATS.some((entry) => entry.key === value.categoryKey && entry.key !== "all") ? value.categoryKey : "formation",
      serverScope: SERVERS.some((entry) => entry.key === value.serverScope) ? value.serverScope : "all",
      title: String(value.title || "").slice(0, 80),
      body: String(value.body || "").slice(0, 1200)
    };
  }

  function readPostDraft() {
    try {
      return sanitizePostDraft(JSON.parse(window.sessionStorage.getItem(POST_DRAFT_STORAGE_KEY) || "null"));
    } catch {
      return createEmptyPostDraft();
    }
  }

  function savePostDraft() {
    try {
      window.sessionStorage.setItem(POST_DRAFT_STORAGE_KEY, JSON.stringify(state.postDraft));
    } catch {}
  }

  function clearPostDraftStorage() {
    try {
      window.sessionStorage.removeItem(POST_DRAFT_STORAGE_KEY);
    } catch {}
  }

  function ensureSelection() {
    const post = selectedPost();
    if (post && (state.selectedCategory === "all" || post.categoryKey === state.selectedCategory)) return;
    state.selectedPostId = visiblePosts()[0]?.id ?? "";
  }

  function setFeed(posts, replies) {
    state.posts = Array.isArray(posts) ? posts : [];
    state.replies = Array.isArray(replies) ? replies : [];
    ensureSelection();
  }

  function isDynamicOrigin() {
    const hostname = window.location.hostname || "";
    return hostname === "127.0.0.1" || hostname === "localhost" || hostname.endsWith(".trycloudflare.com");
  }

  async function loadRuntimeConfig() {
    if (isDynamicOrigin()) {
      state.bridgeEnabled = true;
      state.apiBase = "/api";
      state.crossOrigin = false;
      state.dynamicSiteUrl = window.location.origin;
      return;
    }
    try {
      const response = await fetch(RUNTIME_CONFIG_URL, { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json();
      const dynamicApiBase = String(payload?.dynamicApiBase || "").trim().replace(/\/$/, "");
      state.bridgeEnabled = Boolean(payload?.bridgeEnabled && dynamicApiBase);
      state.apiBase = state.bridgeEnabled ? dynamicApiBase : "/api";
      state.crossOrigin = state.bridgeEnabled && /^https?:\/\//.test(state.apiBase);
      state.dynamicSiteUrl = String(payload?.dynamicSiteUrl || "").trim();
    } catch {
      state.bridgeEnabled = false;
      state.apiBase = "/api";
      state.crossOrigin = false;
      state.dynamicSiteUrl = "";
    }
  }

  function apiUrl(path) {
    if (!state.bridgeEnabled || !state.crossOrigin) return path;
    return `${state.apiBase}${path.replace(/^\/api/, "")}`;
  }

  async function req(url, options = {}) {
    const response = await fetch(apiUrl(url), {
      credentials: "include",
      mode: state.crossOrigin ? "cors" : "same-origin",
      headers: { "Content-Type": "application/json; charset=utf-8", ...(options.headers ?? {}) },
      ...options
    });
    const text = await response.text();
    let json = null;
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {}
    }
    if (!response.ok) throw new Error(json?.error || `HTTP ${response.status}`);
    return json;
  }

  async function refresh() {
    state.loading = true;
    render();
    try {
      const feed = await req("/api/community/feed", { cache: "no-store" });
      state.readOnly = false;
      state.authenticated = Boolean(feed?.authenticated);
      state.user = feed?.user ?? null;
      setFeed(feed?.posts ?? [], feed?.replies ?? []);
      if (state.authenticated) {
        const profile = await req("/api/user/profile", { cache: "no-store" });
        state.profile = profile?.profile ?? null;
      } else {
        state.profile = null;
      }
      state.authError = "";
      state.actionError = "";
    } catch (error) {
      state.readOnly = true;
      state.authenticated = false;
      state.user = null;
      state.profile = null;
      try {
        const fallback = await fetch("./shared/forum.json", { cache: "no-store" }).then((res) => res.json());
        setFeed(fallback?.posts ?? [], fallback?.replies ?? []);
      } catch {
        setFeed([], []);
        state.actionError = "コミュニティを読み込めませんでした。";
      }
    } finally {
      state.loading = false;
      render();
      appApi.updateBackupMeta?.();
    }
  }

  async function saveProfilePatch(patch, message) {
    state.submitting = true;
    state.actionError = "";
    render();
    try {
      const payload = await req("/api/user/profile", { method: "PUT", body: JSON.stringify(patch) });
      state.profile = payload?.profile ?? state.profile;
      appApi.showStatusToast?.(message);
      await refresh();
    } catch (error) {
      state.actionError = error.message;
      render();
    } finally {
      state.submitting = false;
      render();
    }
  }

  async function auth(mode, formData) {
    state.submitting = true;
    state.authError = "";
    render();
    try {
      await req(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify({ loginName: formData.get("loginName"), password: formData.get("password") })
      });
      appApi.showStatusToast?.(mode === "register" ? "新規登録しました。" : "ログインしました。");
      await refresh();
    } catch (error) {
      state.authError = error.message;
      render();
    } finally {
      state.submitting = false;
      render();
    }
  }

  async function logout() {
    state.submitting = true;
    render();
    try {
      await req("/api/auth/logout", { method: "POST", body: JSON.stringify({ ok: true }) });
      appApi.showStatusToast?.("ログアウトしました。");
      await refresh();
    } catch (error) {
      state.actionError = error.message;
      render();
    } finally {
      state.submitting = false;
      render();
    }
  }

  async function createPost(formData) {
    state.submitting = true;
    state.actionError = "";
    render();
    try {
      const payload = await req("/api/community/posts", {
        method: "POST",
        body: JSON.stringify({
          categoryKey: formData.get("categoryKey"),
          serverScope: formData.get("serverScope"),
          title: formData.get("title"),
          body: formData.get("body")
        })
      });
      state.selectedCategory = payload?.post?.categoryKey || state.selectedCategory;
      state.selectedPostId = payload?.post?.id || state.selectedPostId;
      state.postDraft = createEmptyPostDraft();
      clearPostDraftStorage();
      appApi.showStatusToast?.("投稿しました。");
      await refresh();
    } catch (error) {
      state.actionError = error.message;
      render();
    } finally {
      state.submitting = false;
      render();
    }
  }

  async function createReply(formData) {
    state.submitting = true;
    state.actionError = "";
    render();
    try {
      await req("/api/community/replies", {
        method: "POST",
        body: JSON.stringify({ postId: formData.get("postId"), body: formData.get("body") })
      });
      appApi.showStatusToast?.("返信しました。");
      await refresh();
    } catch (error) {
      state.actionError = error.message;
      render();
    } finally {
      state.submitting = false;
      render();
    }
  }

  async function remove(kind, id) {
    if (!window.confirm(kind === "post" ? "この投稿を削除しますか？" : "この返信を削除しますか？")) return;
    state.submitting = true;
    render();
    try {
      await req(kind === "post" ? `/api/community/posts/${encodeURIComponent(id)}` : `/api/community/replies/${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      appApi.showStatusToast?.(kind === "post" ? "投稿を削除しました。" : "返信を削除しました。");
      await refresh();
    } catch (error) {
      state.actionError = error.message;
      render();
    } finally {
      state.submitting = false;
      render();
    }
  }

  function saveArmy() {
    saveProfilePatch({ armyRoster: window.KH_ARMY_SHARE_API?.exportState?.() ?? null }, "軍勢データを保存しました。");
  }
  function loadArmy() {
    if (!state.profile?.armyRoster) return appApi.showStatusToast?.("保存データがありません。");
    window.KH_ARMY_SHARE_API?.importState?.(state.profile.armyRoster, { rerender: true });
    document.querySelector('[data-view-tab="army"]')?.click();
    appApi.showStatusToast?.("軍勢データを読み込みました。");
  }
  function saveAdvanced() {
    const payload =
      window.KH_ADVANCED_BUILDER_API?.exportState?.() ??
      window.KH_ADVANCED_BUILDER_API?.collectShareState?.() ??
      null;
    saveProfilePatch({ advancedBuilder: payload }, "詳細育成を保存しました。");
  }
  function loadAdvanced() {
    if (!state.profile?.advancedBuilder) return appApi.showStatusToast?.("保存データがありません。");
    window.KH_ADVANCED_BUILDER_API?.importState?.(state.profile.advancedBuilder, { rerender: true });
    document.querySelector('[data-view-tab="advanced"]')?.click();
    appApi.showStatusToast?.("詳細育成を読み込みました。");
  }

  function syncPostDraftFromForm(form) {
    if (!form) return;
    const formData = new FormData(form);
    state.postDraft = sanitizePostDraft({
      categoryKey: formData.get("categoryKey"),
      serverScope: formData.get("serverScope"),
      title: formData.get("title"),
      body: formData.get("body")
    });
    savePostDraft();
  }

  function render() {
    state.postDraft = sanitizePostDraft(state.postDraft);
    const postDraft = state.postDraft;
    const post = selectedPost();
    const posts = visiblePosts();
    const earnedTitles = state.profile?.earnedTitles ?? [];
    const titleOptions = ['<option value="">称号なし</option>']
      .concat(
        earnedTitles.map(
          (entry) =>
            `<option value="${esc(entry.key)}" ${entry.key === state.profile?.activeTitleKey ? "selected" : ""}>${esc(entry.label)}</option>`
        )
      )
      .join("");
    const catOptions = CATS.filter((entry) => entry.key !== "all")
      .map((entry) => `<option value="${esc(entry.key)}" ${postDraft.categoryKey === entry.key ? "selected" : ""}>${esc(entry.label)}</option>`)
      .join("");
    const serverOptions = SERVERS.map((entry) => `<option value="${esc(entry.key)}" ${postDraft.serverScope === entry.key ? "selected" : ""}>${esc(entry.label)}</option>`)
      .join("");
    const catButtons = CATS.map((entry) => {
      const count = entry.key === "all" ? state.posts.length : state.posts.filter((postItem) => postItem.categoryKey === entry.key).length;
      return `<button class="cb-cat ${state.selectedCategory === entry.key ? "is-active" : ""}" type="button" data-cb-category="${esc(entry.key)}"><span>${esc(entry.label)}</span><strong>${count}</strong></button>`;
    }).join("");
    const postCards = posts.length
      ? posts.map((entry) => {
          const preview = String(entry.body || "").replace(/\s+/g, " ").trim();
          return `<button class="cb-post ${state.selectedPostId === entry.id ? "is-active" : ""}" type="button" data-cb-post="${esc(entry.id)}"><div class="cb-row">${badge(CAT_LABEL[entry.categoryKey] || entry.categoryKey)}${badge(SERVER_LABEL[entry.serverScope] || entry.serverScope)}${titleBadge(entry.author)}</div><strong>${esc(entry.title)}</strong><p>${esc(preview.slice(0, 56))}${preview.length > 56 ? "..." : ""}</p><small>${esc(authorName(entry.author))} / ${esc(fmt(entry.updatedAt || entry.createdAt))}</small></button>`;
        }).join("")
      : '<p class="cb-muted">まだ投稿はありません。</p>';
    const replyCards = post
      ? repliesFor(post.id).map((entry) => `<article class="cb-reply"><div class="cb-row"><div class="cb-row">${titleBadge(entry.author)}${badge(authorName(entry.author))}</div><div class="cb-row"><small>${esc(fmt(entry.createdAt))}</small>${entry.isMine && !state.readOnly ? `<button class="cb-text" type="button" data-cb-delete-reply="${esc(entry.id)}">削除</button>` : ""}</div></div><p>${renderRichText(entry.body)}</p></article>`).join("")
      : "";

    root.innerHTML = `
      <div class="cb-root">
        <section class="cb-hero">
          <div><p class="cb-kicker">Kingdom Hadou</p><h2>コミュニティ</h2><p class="cb-muted">編成・攻略・質問・募集。</p></div>
          <div class="cb-row">${badge(`スレ ${state.posts.length}`)}${badge(`返信 ${state.replies.length}`)}${badge(state.readOnly ? "閲覧専用" : state.authenticated ? "ログイン中" : "未ログイン")}</div>
        </section>
        ${state.actionError ? `<p class="cb-error">${esc(state.actionError)}</p>` : ""}
        ${state.loading ? '<p class="cb-loading">読み込み中...</p>' : ""}
        <div class="cb-grid ${state.loading ? "is-loading" : ""}">
          <aside class="cb-side">
            <section class="cb-card">
              ${
                state.readOnly
                  ? '<h3>閲覧専用</h3><p class="cb-muted">閲覧のみできます。</p>'
                  : state.authenticated
                    ? `<div class="cb-head"><div><h3>ログイン中</h3><p class="cb-muted">${esc(state.user?.loginName || "")}</p></div><button class="secondary-button" type="button" data-cb-action="logout" ${state.submitting ? "disabled" : ""}>ログアウト</button></div><div class="cb-row">${badge(`表示名 ${state.profile?.displayName || state.user?.loginName || "-"}`)}${badge(state.profile?.activeTitle?.label || "称号なし", "cb-badge-title")}</div>`
                    : `<div class="cb-head"><div><h3>${state.authMode === "register" ? "新規登録" : "ログイン"}</h3><p class="cb-muted">投稿用</p></div></div><div class="cb-toggle"><button class="${state.authMode === "login" ? "is-active" : ""}" type="button" data-cb-auth-mode="login">ログイン</button><button class="${state.authMode === "register" ? "is-active" : ""}" type="button" data-cb-auth-mode="register">新規登録</button></div><form class="cb-form" data-cb-form="auth"><label><span>ログインID</span><input type="text" name="loginName" maxlength="32" autocomplete="username"></label><label><span>パスワード</span><input type="password" name="password" minlength="8" maxlength="72" autocomplete="${state.authMode === "login" ? "current-password" : "new-password"}"></label>${state.authError ? `<p class="cb-error">${esc(state.authError)}</p>` : ""}<button class="primary-button" type="submit" ${state.submitting ? "disabled" : ""}>${state.authMode === "register" ? "新規登録" : "ログイン"}</button></form>`
              }
            </section>
            ${
              state.authenticated && state.profile
                ? `<section class="cb-card"><h3>保存データ</h3><form class="cb-form" data-cb-form="profile"><label><span>表示名</span><input type="text" name="displayName" maxlength="32" value="${esc(state.profile.displayName || "")}"></label><label><span>称号</span><select name="activeTitleKey">${titleOptions}</select></label><button class="primary-button" type="submit" ${state.submitting ? "disabled" : ""}>保存</button></form><div class="cb-save-grid"><article class="cb-save-card"><strong>軍勢</strong><p>所持 ${esc(state.profile.armyRosterSummary?.ownedCount ?? 0)} / 育成 ${esc(state.profile.armyRosterSummary?.trainedCount ?? 0)}</p><div class="cb-row"><button class="secondary-button" type="button" data-cb-action="save-army" ${state.submitting ? "disabled" : ""}>保存</button><button class="secondary-button" type="button" data-cb-action="load-army">読込</button></div></article><article class="cb-save-card"><strong>詳細育成</strong><p>設定 ${esc(state.profile.advancedBuilderSummary?.configuredCount ?? 0)} / 育成 ${esc(state.profile.advancedBuilderSummary?.totalTraining ?? 0)}</p><div class="cb-row"><button class="secondary-button" type="button" data-cb-action="save-advanced" ${state.submitting ? "disabled" : ""}>保存</button><button class="secondary-button" type="button" data-cb-action="load-advanced">読込</button></div></article></div></section>`
                : ""
            }
            <section class="cb-card"><h3>カテゴリ</h3><div class="cb-cats">${catButtons}</div></section>
          </aside>
          <section class="cb-main">
            <section class="cb-card">
              ${
                state.authenticated && !state.readOnly
                  ? `<h3>投稿</h3><form class="cb-form" data-cb-form="post"><div class="cb-two"><label><span>カテゴリ</span><select name="categoryKey">${catOptions}</select></label><label><span>公開先</span><select name="serverScope">${serverOptions}</select></label></div><label><span>タイトル</span><input type="text" name="title" maxlength="80" value="${esc(postDraft.title)}"></label><label><span>本文</span><textarea name="body" rows="5" maxlength="1200">${esc(postDraft.body)}</textarea></label><button class="primary-button" type="submit" ${state.submitting ? "disabled" : ""}>投稿</button></form>`
                  : '<h3>投稿</h3><p class="cb-muted">ログインで投稿できます。</p>'
              }
            </section>
            <section class="cb-card cb-scroll"><div class="cb-head"><div><h3>スレッド</h3><p class="cb-muted">${posts.length}件</p></div></div><div class="cb-posts">${postCards}</div></section>
          </section>
          <section class="cb-detail">
            <section class="cb-card">${post ? `<div class="cb-head"><div><div class="cb-row">${badge(CAT_LABEL[post.categoryKey] || post.categoryKey)}${badge(SERVER_LABEL[post.serverScope] || post.serverScope)}${titleBadge(post.author)}</div><h3>${esc(post.title)}</h3><p class="cb-muted">${esc(authorName(post.author))} / ${esc(fmt(post.createdAt))}</p></div>${post.isMine && !state.readOnly ? `<button class="secondary-button" type="button" data-cb-delete-post="${esc(post.id)}" ${state.submitting ? "disabled" : ""}>削除</button>` : ""}</div><div class="cb-body">${renderRichText(post.body)}</div>` : '<h3>詳細</h3><p class="cb-muted">スレッドを選ぶと表示されます。</p>'}</section>
            <section class="cb-card"><div class="cb-head"><div><h3>返信</h3><p class="cb-muted">${post ? repliesFor(post.id).length : 0}件</p></div></div><div class="cb-replies">${post ? replyCards || '<p class="cb-muted">返信はまだありません。</p>' : '<p class="cb-muted">スレッドを選ぶと表示されます。</p>'}</div>${post && state.authenticated && !state.readOnly ? `<form class="cb-form" data-cb-form="reply"><input type="hidden" name="postId" value="${esc(post.id)}"><label><span>返信</span><textarea name="body" rows="4" maxlength="400"></textarea></label><button class="primary-button" type="submit" ${state.submitting ? "disabled" : ""}>返信</button></form>` : post ? '<p class="cb-muted">返信はログイン後に使えます。</p>' : ""}</section>
          </section>
        </div>
      </div>
    `;
  }

  function applyPostDraft(draft, options = {}) {
    state.postDraft = sanitizePostDraft(draft);
    savePostDraft();
    if (options.keepCategory !== true) state.selectedCategory = state.postDraft.categoryKey;
    ensureSelection();
    if (options.rerender !== false) render();
    if (options.showToast) appApi.showStatusToast?.("編成投稿の下書きを読み込みました。");
  }

  function applyShareState(nextState = {}, options = {}) {
    state.selectedCategory = normCat(String(nextState.category || "all"));
    state.selectedPostId = String(nextState.postId || "");
    const post = selectedPost();
    if (post && state.selectedCategory !== "all" && post.categoryKey !== state.selectedCategory) {
      state.selectedCategory = post.categoryKey;
    }
    ensureSelection();
    if (options.rerender !== false) render();
    if (options.showToast) appApi.showStatusToast?.("コミュニティの共有状態を読み込みました。");
  }

  function clearState(options = {}) {
    state.selectedCategory = "all";
    state.selectedPostId = "";
    state.authError = "";
    state.actionError = "";
    state.postDraft = readPostDraft();
    ensureSelection();
    if (options.rerender !== false) render();
  }

  function injectStyle() {
    if (document.querySelector("#community-board-style")) return;
    const style = document.createElement("style");
    style.id = "community-board-style";
    style.textContent = `
      .cb-root,.cb-side,.cb-main,.cb-detail,.cb-form,.cb-posts,.cb-replies,.cb-cats,.cb-save-grid{display:grid;gap:14px}
      .cb-root{gap:16px}.cb-grid{display:grid;grid-template-columns:minmax(250px,290px) minmax(0,1fr);gap:16px;align-items:start}.cb-grid.is-loading{opacity:.72}
      .cb-side{grid-column:1;grid-row:1/span 2;position:sticky;top:88px}.cb-main,.cb-detail{grid-column:2}
      .cb-hero,.cb-card,.cb-save-card{padding:18px;border:1px solid rgba(148,163,184,.18);border-radius:18px;background:#fff;box-shadow:0 12px 28px rgba(15,23,42,.06)}
      .cb-hero{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.cb-head,.cb-row,.cb-two,.cb-toggle{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap}
      .cb-kicker{margin:0 0 6px;color:#475569;font-size:.76rem;letter-spacing:.08em;text-transform:uppercase}.cb-hero h2,.cb-card h3{margin:0}.cb-muted,.cb-post p,.cb-reply p,.cb-body,.cb-save-card p{margin:0;color:#64748b;line-height:1.6}
      .cb-body a,.cb-reply a{color:#1d4ed8;word-break:break-all}.cb-loading,.cb-error{margin:0;padding:12px 14px;border-radius:14px}.cb-loading{background:#eff6ff;color:#1d4ed8;font-weight:700}.cb-error{background:#fef2f2;color:#b91c1c}
      .cb-badge{display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.18);background:#f8fafc;color:#334155;font-size:.8rem;font-weight:700}.cb-badge-title{background:#eef2ff}
      .cb-form label,.cb-form span{display:grid;gap:6px}.cb-form input,.cb-form select,.cb-form textarea{width:100%;padding:11px 13px;border:1px solid rgba(148,163,184,.26);border-radius:12px;background:#fff;font:inherit;color:#0f172a}
      .cb-form textarea{min-height:140px;resize:vertical}.cb-form input:focus,.cb-form select:focus,.cb-form textarea:focus{outline:none;border-color:rgba(37,99,235,.5);box-shadow:0 0 0 4px rgba(59,130,246,.08)}
      .cb-toggle{padding:4px;border-radius:14px;border:1px solid rgba(148,163,184,.18);background:#f8fafc}.cb-toggle button,.cb-cat,.cb-post,.cb-text{border:0;background:transparent;color:inherit;font:inherit}
      .cb-toggle button{flex:1;padding:9px 12px;border-radius:10px;cursor:pointer;font-weight:700;color:#475569}.cb-toggle .is-active{background:#0f172a;color:#fff}
      .cb-cat{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-radius:14px;border:1px solid rgba(148,163,184,.18);background:#fff;cursor:pointer}.cb-cat.is-active{background:#0f172a;border-color:#0f172a;color:#fff}
      .cb-scroll{max-height:520px;overflow:auto}.cb-post{display:grid;gap:10px;width:100%;padding:15px;border-radius:16px;border:1px solid rgba(148,163,184,.18);background:#fff;text-align:left;cursor:pointer}
      .cb-post:hover,.cb-post.is-active{border-color:rgba(37,99,235,.24);background:#f8fafc}.cb-post strong{font-size:1rem}.cb-post small{color:#64748b}.cb-body{word-break:break-word}
      .cb-reply{display:grid;gap:8px;padding:14px 0;border-top:1px solid rgba(148,163,184,.18)}.cb-reply:first-child{padding-top:0;border-top:0}.cb-save-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .cb-save-card{padding:16px;border:1px solid rgba(148,163,184,.18);border-radius:16px;background:#f8fafc}.cb-text{cursor:pointer;color:#2563eb;font-weight:700}
      @media (max-width:1100px){.cb-grid,.cb-save-grid{grid-template-columns:1fr}.cb-side,.cb-main,.cb-detail{grid-column:auto;grid-row:auto}.cb-side{position:static}.cb-scroll{max-height:none}}
      @media (max-width:640px){.cb-hero{flex-direction:column}}
    `;
    document.head.append(style);
  }

  root.addEventListener("click", (event) => {
    const category = event.target.closest("[data-cb-category]");
    if (category) {
      state.selectedCategory = normCat(category.dataset.cbCategory);
      ensureSelection();
      render();
      return;
    }
    const post = event.target.closest("[data-cb-post]");
    if (post) {
      state.selectedPostId = post.dataset.cbPost || "";
      render();
      return;
    }
    const authMode = event.target.closest("[data-cb-auth-mode]");
    if (authMode) {
      state.authMode = authMode.dataset.cbAuthMode === "register" ? "register" : "login";
      state.authError = "";
      render();
      return;
    }
    const action = event.target.closest("[data-cb-action]");
    if (action) {
      const key = action.dataset.cbAction;
      if (key === "logout") logout();
      if (key === "save-army") saveArmy();
      if (key === "load-army") loadArmy();
      if (key === "save-advanced") saveAdvanced();
      if (key === "load-advanced") loadAdvanced();
      return;
    }
    const deletePost = event.target.closest("[data-cb-delete-post]");
    if (deletePost) {
      remove("post", deletePost.dataset.cbDeletePost);
      return;
    }
    const deleteReply = event.target.closest("[data-cb-delete-reply]");
    if (deleteReply) remove("reply", deleteReply.dataset.cbDeleteReply);
  });

  root.addEventListener("input", (event) => {
    const form = event.target.closest('[data-cb-form="post"]');
    if (form) syncPostDraftFromForm(form);
  });

  root.addEventListener("change", (event) => {
    const form = event.target.closest('[data-cb-form="post"]');
    if (form) syncPostDraftFromForm(form);
  });

  root.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-cb-form]");
    if (!form) return;
    event.preventDefault();
    const formData = new FormData(form);
    const kind = form.dataset.cbForm;
    if (kind === "auth") return auth(state.authMode, formData);
    if (kind === "profile") {
      return saveProfilePatch(
        { displayName: formData.get("displayName"), activeTitleKey: formData.get("activeTitleKey") },
        "プロフィールを保存しました。"
      );
    }
    if (kind === "post") {
      syncPostDraftFromForm(form);
      createPost(formData);
      return;
    }
    if (kind === "reply") {
      createReply(formData);
      form.reset();
    }
  });

  window.KH_COMMUNITY_BOARD_API = {
    collectShareState: () => ({ category: state.selectedCategory, postId: state.selectedPostId }),
    applyShareState,
    applyPostDraft,
    clearState,
    refresh
  };

  state.postDraft = readPostDraft();
  injectStyle();
  render();
  loadRuntimeConfig()
    .catch(() => {})
    .then(() => refresh())
    .then(() => {
      if (window.__KH_PENDING_SHARE_PAYLOAD?.view === "community") {
        applyShareState(window.__KH_PENDING_SHARE_PAYLOAD.state ?? {}, { showToast: true });
        window.__KH_PENDING_SHARE_PAYLOAD = null;
      }
    });
})();
