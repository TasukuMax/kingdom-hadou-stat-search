(() => {
  const root = document.querySelector("#communityBoardRoot");
  if (!root) return;

  const appApi = window.KH_APP_API ?? {};
  const CATS = [
    { key: "all", label: "すべて" },
    { key: "general", label: "総合" },
    { key: "tips", label: "攻略" },
    { key: "event", label: "イベント" },
    { key: "qna", label: "質問" },
    { key: "recruit", label: "募集" }
  ];
  const CAT_LABEL = Object.fromEntries(CATS.map((entry) => [entry.key, entry.label]));
  const SERVERS = [
    { key: "all", label: "全体" },
    { key: "1", label: "サーバー1" },
    { key: "2", label: "サーバー2" },
    { key: "3", label: "サーバー3" }
  ];
  const SERVER_LABEL = Object.fromEntries(SERVERS.map((entry) => [entry.key, entry.label]));
  const state = {
    loading: true,
    submitting: false,
    apiAvailable: true,
    readOnly: false,
    authenticated: false,
    user: null,
    profile: null,
    posts: [],
    replies: [],
    selectedCategory: "all",
    selectedPostId: "",
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

  const normCat = (value) => (CATS.some((entry) => entry.key === value) ? value : "all");
  const badge = (label, cls = "") => (label ? `<span class="cb-badge ${cls}">${esc(label)}</span>` : "");
  const titleBadge = (author) => badge(author?.activeTitle?.label || "", "cb-badge-title");
  const authorName = (author) => author?.displayName || author?.loginName || "匿名";
  const repliesFor = (postId) => state.replies.filter((entry) => entry.postId === postId);
  const visiblePosts = () =>
    state.selectedCategory === "all"
      ? state.posts
      : state.posts.filter((entry) => entry.categoryKey === state.selectedCategory);
  const selectedPost = () => state.posts.find((entry) => entry.id === state.selectedPostId) ?? null;

  function ensureSelection() {
    const selected = selectedPost();
    if (selected && (state.selectedCategory === "all" || selected.categoryKey === state.selectedCategory)) return;
    state.selectedPostId = visiblePosts()[0]?.id ?? "";
  }

  function setFeed(posts, replies) {
    state.posts = Array.isArray(posts) ? posts : [];
    state.replies = Array.isArray(replies) ? replies : [];
    ensureSelection();
  }

  async function req(url, options = {}) {
    const response = await fetch(url, {
      credentials: "include",
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
      state.apiAvailable = true;
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
      state.apiAvailable = false;
      state.readOnly = true;
      state.authenticated = false;
      state.user = null;
      state.profile = null;
      try {
        const fallback = await fetch("./shared/forum.json", { cache: "no-store" }).then((res) => res.json());
        setFeed(fallback?.posts ?? [], fallback?.replies ?? []);
      } catch {
        setFeed([], []);
        state.actionError = "掲示板データを読み込めませんでした。";
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
      appApi.showStatusToast?.(mode === "register" ? "アカウントを作成しました。" : "ログインしました。");
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
    if (!window.confirm(kind === "post" ? "投稿を削除しますか？" : "返信を削除しますか？")) return;
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
    saveProfilePatch({ armyRoster: window.KH_ARMY_SHARE_API?.exportState?.() ?? null }, "部隊所持状況を保存しました。");
  }

  function loadArmy() {
    if (!state.profile?.armyRoster) {
      appApi.showStatusToast?.("保存データがありません。");
      return;
    }
    window.KH_ARMY_SHARE_API?.importState?.(state.profile.armyRoster, { rerender: true });
    document.querySelector('[data-view-tab="army"]')?.click();
    appApi.showStatusToast?.("部隊所持状況を読み込みました。");
  }

  function saveAdvanced() {
    const payload =
      window.KH_ADVANCED_BUILDER_API?.exportState?.() ??
      window.KH_ADVANCED_BUILDER_API?.collectShareState?.() ??
      null;
    saveProfilePatch({ advancedBuilder: payload }, "上級編成研究所の育成条件を保存しました。");
  }

  function loadAdvanced() {
    if (!state.profile?.advancedBuilder) {
      appApi.showStatusToast?.("保存データがありません。");
      return;
    }
    window.KH_ADVANCED_BUILDER_API?.importState?.(state.profile.advancedBuilder, { rerender: true });
    document.querySelector('[data-view-tab="advanced"]')?.click();
    appApi.showStatusToast?.("上級編成研究所の育成条件を読み込みました。");
  }

  function render() {
    const post = selectedPost();
    const posts = visiblePosts();
    const earnedTitles = state.profile?.earnedTitles ?? [];
    const titleOptions = ['<option value="">称号を選択</option>']
      .concat(
        earnedTitles.map(
          (entry) =>
            `<option value="${esc(entry.key)}" ${entry.key === state.profile?.activeTitleKey ? "selected" : ""}>${esc(
              entry.label
            )}</option>`
        )
      )
      .join("");
    const catButtons = CATS.map(
      (entry) =>
        `<button class="cb-cat ${state.selectedCategory === entry.key ? "is-active" : ""}" type="button" data-cb-category="${esc(
          entry.key
        )}"><span>${esc(entry.label)}</span><strong>${entry.key === "all" ? state.posts.length : state.posts.filter((postItem) => postItem.categoryKey === entry.key).length}</strong></button>`
    ).join("");
    const postCards = posts.length
      ? posts
          .map(
            (entry) => `
              <button class="cb-post ${state.selectedPostId === entry.id ? "is-active" : ""}" type="button" data-cb-post="${esc(entry.id)}">
                <div class="cb-row">${badge(CAT_LABEL[entry.categoryKey] || entry.categoryKey)}${badge(SERVER_LABEL[entry.serverScope] || entry.serverScope)}${titleBadge(entry.author)}</div>
                <strong>${esc(entry.title)}</strong>
                <p>${esc(String(entry.body || "").slice(0, 90))}${String(entry.body || "").length > 90 ? "…" : ""}</p>
                <small>${esc(authorName(entry.author))} / ${esc(fmt(entry.updatedAt || entry.createdAt))}</small>
              </button>
            `
          )
          .join("")
      : `<p class="cb-muted">まだ投稿がありません。</p>`;
    const replyCards = post
      ? repliesFor(post.id).map(
          (entry) => `
            <article class="cb-reply">
              <div class="cb-row">
                <div class="cb-row">${titleBadge(entry.author)}${badge(authorName(entry.author))}</div>
                <div class="cb-row"><small>${esc(fmt(entry.createdAt))}</small>${entry.isMine && !state.readOnly ? `<button class="cb-text" type="button" data-cb-delete-reply="${esc(entry.id)}">削除</button>` : ""}</div>
              </div>
              <p>${esc(entry.body).replaceAll("\n", "<br>")}</p>
            </article>
          `
        ).join("")
      : "";
    const serverOptions = SERVERS.map((entry) => `<option value="${esc(entry.key)}">${esc(entry.label)}</option>`).join("");
    const catOptions = CATS.filter((entry) => entry.key !== "all").map((entry) => `<option value="${esc(entry.key)}">${esc(entry.label)}</option>`).join("");

    root.innerHTML = `
      <div class="cb-root">
        <section class="cb-hero">
          <div>
            <p class="cb-kicker">Kingdom Hadou Community</p>
            <h2>攻略掲示板</h2>
            <p class="cb-muted">攻略共有、称号表示、育成保存をひとつのログインでまとめて扱えます。</p>
          </div>
          <div class="cb-row">${badge(`スレッド ${state.posts.length}`)}${badge(`返信 ${state.replies.length}`)}${badge(state.readOnly ? "閲覧専用" : state.authenticated ? "ログイン中" : "未ログイン")}</div>
        </section>
        ${state.actionError ? `<p class="cb-error">${esc(state.actionError)}</p>` : ""}
        ${state.loading ? `<p class="cb-loading">掲示板を読み込んでいます...</p>` : ""}
        <div class="cb-grid ${state.loading ? "is-loading" : ""}">
          <aside class="cb-side">
            <section class="cb-card">
              ${
                state.readOnly
                  ? `<h3>閲覧モード</h3><p class="cb-muted">いまは共有スナップショットを表示しています。投稿やログイン、育成保存は動的サーバー側で利用できます。</p>`
                  : state.authenticated
                    ? `<div class="cb-head"><div><h3>ログイン中</h3><p class="cb-muted">${esc(state.user?.loginName || "")}</p></div><button class="secondary-button" type="button" data-cb-action="logout" ${state.submitting ? "disabled" : ""}>ログアウト</button></div><div class="cb-row">${badge(`表示名 ${state.profile?.displayName || state.user?.loginName || "-"}`)}${badge(state.profile?.activeTitle?.label || "称号なし", "cb-badge-title")}</div>`
                    : `<div class="cb-head"><div><h3>${state.authMode === "register" ? "新規登録" : "ログイン"}</h3><p class="cb-muted">同じアカウントで称号と育成状況を保持できます。</p></div></div><div class="cb-toggle"><button class="${state.authMode === "login" ? "is-active" : ""}" type="button" data-cb-auth-mode="login">ログイン</button><button class="${state.authMode === "register" ? "is-active" : ""}" type="button" data-cb-auth-mode="register">新規登録</button></div><form class="cb-form" data-cb-form="auth"><label><span>ログインID</span><input type="text" name="loginName" maxlength="32" autocomplete="username"></label><label><span>パスワード</span><input type="password" name="password" minlength="8" maxlength="72" autocomplete="${state.authMode === "login" ? "current-password" : "new-password"}"></label>${state.authError ? `<p class="cb-error">${esc(state.authError)}</p>` : ""}<button class="primary-button" type="submit" ${state.submitting ? "disabled" : ""}>${state.authMode === "register" ? "新規登録" : "ログイン"}</button></form>`
              }
            </section>
            ${
              state.authenticated && state.profile
                ? `<section class="cb-card"><h3>プロフィールと保存データ</h3><form class="cb-form" data-cb-form="profile"><label><span>表示名</span><input type="text" name="displayName" maxlength="32" value="${esc(state.profile.displayName || "")}"></label><label><span>表示する称号</span><select name="activeTitleKey">${titleOptions}</select></label><button class="primary-button" type="submit" ${state.submitting ? "disabled" : ""}>プロフィールを保存</button></form><div class="cb-row">${earnedTitles.length ? earnedTitles.map((entry) => badge(entry.label, "cb-badge-title")).join("") : '<span class="cb-muted">獲得称号はまだありません。</span>'}</div><div class="cb-save-grid"><article class="cb-save-card"><strong>部隊所持状況</strong><p>所持 ${esc(state.profile.armyRosterSummary?.ownedCount ?? 0)} / 育成済み ${esc(state.profile.armyRosterSummary?.trainedCount ?? 0)}</p><small>${esc(state.profile.armyRosterSavedAt ? `保存 ${fmt(state.profile.armyRosterSavedAt)}` : "未保存")}</small><div class="cb-row"><button class="secondary-button" type="button" data-cb-action="save-army" ${state.submitting ? "disabled" : ""}>保存</button><button class="secondary-button" type="button" data-cb-action="load-army">読込</button></div></article><article class="cb-save-card"><strong>上級編成研究所</strong><p>設定 ${esc(state.profile.advancedBuilderSummary?.configuredCount ?? 0)}人 / 練達合計 ${esc(state.profile.advancedBuilderSummary?.totalTraining ?? 0)}</p><small>${esc(state.profile.advancedBuilderSavedAt ? `保存 ${fmt(state.profile.advancedBuilderSavedAt)}` : "未保存")}</small><div class="cb-row"><button class="secondary-button" type="button" data-cb-action="save-advanced" ${state.submitting ? "disabled" : ""}>保存</button><button class="secondary-button" type="button" data-cb-action="load-advanced">読込</button></div></article></div></section>`
                : ""
            }
            <section class="cb-card"><h3>カテゴリ</h3><div class="cb-cats">${catButtons}</div></section>
          </aside>
          <section class="cb-main">
            <section class="cb-card">
              ${
                state.authenticated && !state.readOnly
                  ? `<h3>新規投稿</h3><form class="cb-form" data-cb-form="post"><div class="cb-two"><label><span>カテゴリ</span><select name="categoryKey">${catOptions}</select></label><label><span>対象サーバー</span><select name="serverScope">${serverOptions}</select></label></div><label><span>タイトル</span><input type="text" name="title" maxlength="80"></label><label><span>本文</span><textarea name="body" rows="5" maxlength="1200"></textarea></label><button class="primary-button" type="submit" ${state.submitting ? "disabled" : ""}>投稿する</button></form>`
                  : `<h3>投稿するには</h3><p class="cb-muted">ログインすると攻略メモや質問、募集を書き込めます。称号は投稿者名の横に表示されます。</p>`
              }
            </section>
            <section class="cb-card cb-scroll"><div class="cb-head"><div><h3>スレッド一覧</h3><p class="cb-muted">${posts.length}件</p></div></div><div class="cb-posts">${postCards}</div></section>
          </section>
          <section class="cb-detail">
            <section class="cb-card">
              ${
                post
                  ? `<div class="cb-head"><div><div class="cb-row">${badge(CAT_LABEL[post.categoryKey] || post.categoryKey)}${badge(SERVER_LABEL[post.serverScope] || post.serverScope)}${titleBadge(post.author)}</div><h3>${esc(post.title)}</h3><p class="cb-muted">${esc(authorName(post.author))} / ${esc(fmt(post.createdAt))}</p></div>${post.isMine && !state.readOnly ? `<button class="secondary-button" type="button" data-cb-delete-post="${esc(post.id)}" ${state.submitting ? "disabled" : ""}>削除</button>` : ""}</div><div class="cb-body">${esc(post.body).replaceAll("\n", "<br>")}</div>`
                  : `<h3>スレッド詳細</h3><p class="cb-muted">左の一覧からスレッドを選んでください。</p>`
              }
            </section>
            <section class="cb-card">
              <div class="cb-head"><div><h3>返信</h3><p class="cb-muted">${post ? repliesFor(post.id).length : 0}件</p></div></div>
              <div class="cb-replies">${post ? replyCards || '<p class="cb-muted">まだ返信はありません。</p>' : '<p class="cb-muted">スレッドを選ぶと返信が表示されます。</p>'}</div>
              ${
                post && state.authenticated && !state.readOnly
                  ? `<form class="cb-form" data-cb-form="reply"><input type="hidden" name="postId" value="${esc(post.id)}"><label><span>返信する</span><textarea name="body" rows="4" maxlength="400"></textarea></label><button class="primary-button" type="submit" ${state.submitting ? "disabled" : ""}>返信を投稿</button></form>`
                  : post
                    ? `<p class="cb-muted">返信するにはログインが必要です。</p>`
                    : ""
              }
            </section>
          </section>
        </div>
      </div>
    `;
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
    if (options.showToast) appApi.showStatusToast?.("掲示板の共有状態を読み込みました。");
  }

  function clearState(options = {}) {
    state.selectedCategory = "all";
    state.selectedPostId = "";
    state.authError = "";
    state.actionError = "";
    ensureSelection();
    if (options.rerender !== false) render();
  }

  function injectStyle() {
    if (document.querySelector("#community-board-style")) return;
    const style = document.createElement("style");
    style.id = "community-board-style";
    style.textContent = `
      .cb-root,
      .cb-side,
      .cb-main,
      .cb-detail,
      .cb-form,
      .cb-posts,
      .cb-replies,
      .cb-cats,
      .cb-save-grid {
        display: grid;
        gap: 14px;
      }

      .cb-root {
        gap: 16px;
      }

      .cb-grid {
        display: grid;
        grid-template-columns: minmax(260px, 300px) minmax(0, 1fr);
        gap: 16px;
        align-items: start;
      }

      .cb-grid.is-loading {
        opacity: 0.72;
      }

      .cb-side {
        grid-column: 1;
        grid-row: 1 / span 2;
        position: sticky;
        top: 88px;
      }

      .cb-main,
      .cb-detail {
        grid-column: 2;
      }

      .cb-hero,
      .cb-card,
      .cb-save-card {
        padding: 18px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 18px;
        background: #ffffff;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
      }

      .cb-hero {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
      }

      .cb-head,
      .cb-row,
      .cb-two,
      .cb-toggle {
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
      }

      .cb-kicker {
        margin: 0 0 6px;
        color: #475569;
        font-size: 0.76rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .cb-hero h2,
      .cb-card h3 {
        margin: 0;
      }

      .cb-hero h2 + .cb-muted,
      .cb-card > h3 + *,
      .cb-card > .cb-head + * {
        margin-top: 10px;
      }

      .cb-muted,
      .cb-post p,
      .cb-reply p,
      .cb-body,
      .cb-save-card p,
      .cb-save-card small {
        margin: 0;
        color: #64748b;
        line-height: 1.7;
      }

      .cb-loading,
      .cb-error {
        margin: 0;
        padding: 12px 14px;
        border-radius: 14px;
      }

      .cb-loading {
        background: #eff6ff;
        color: #1d4ed8;
        font-weight: 700;
      }

      .cb-error {
        background: #fef2f2;
        color: #b91c1c;
      }

      .cb-badge {
        display: inline-flex;
        align-items: center;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: #f8fafc;
        color: #334155;
        font-size: 0.8rem;
        font-weight: 700;
      }

      .cb-badge-title {
        background: #eef2ff;
        border-color: rgba(99, 102, 241, 0.12);
      }

      .cb-form label,
      .cb-form span {
        display: grid;
        gap: 6px;
      }

      .cb-form input,
      .cb-form select,
      .cb-form textarea {
        width: 100%;
        padding: 11px 13px;
        border: 1px solid rgba(148, 163, 184, 0.26);
        border-radius: 12px;
        background: #ffffff;
        font: inherit;
        color: #0f172a;
      }

      .cb-form textarea {
        min-height: 140px;
        resize: vertical;
      }

      .cb-form input:focus,
      .cb-form select:focus,
      .cb-form textarea:focus {
        outline: none;
        border-color: rgba(37, 99, 235, 0.5);
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
      }

      .cb-toggle {
        padding: 4px;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: #f8fafc;
      }

      .cb-toggle button,
      .cb-cat,
      .cb-post,
      .cb-text {
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
      }

      .cb-toggle button {
        flex: 1;
        padding: 9px 12px;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 700;
        color: #475569;
      }

      .cb-toggle .is-active {
        background: #0f172a;
        color: #ffffff;
      }

      .cb-cats {
        gap: 10px;
      }

      .cb-cat {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 14px;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: #ffffff;
        cursor: pointer;
      }

      .cb-cat.is-active {
        background: #0f172a;
        border-color: #0f172a;
        color: #ffffff;
      }

      .cb-scroll {
        max-height: 520px;
        overflow: auto;
      }

      .cb-post {
        display: grid;
        gap: 10px;
        width: 100%;
        padding: 15px;
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: #ffffff;
        text-align: left;
        cursor: pointer;
      }

      .cb-post:hover,
      .cb-post.is-active {
        border-color: rgba(37, 99, 235, 0.24);
        background: #f8fafc;
      }

      .cb-post strong {
        font-size: 1rem;
      }

      .cb-post small {
        color: #64748b;
      }

      .cb-body {
        white-space: pre-wrap;
      }

      .cb-reply {
        display: grid;
        gap: 8px;
        padding: 14px 0;
        border-top: 1px solid rgba(148, 163, 184, 0.18);
      }

      .cb-reply:first-child {
        padding-top: 0;
        border-top: 0;
      }

      .cb-save-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .cb-save-card {
        padding: 16px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 16px;
        background: #f8fafc;
      }

      .cb-text {
        cursor: pointer;
        color: #2563eb;
        font-weight: 700;
      }

      @media (max-width: 1100px) {
        .cb-grid,
        .cb-save-grid {
          grid-template-columns: 1fr;
        }

        .cb-side,
        .cb-main,
        .cb-detail {
          grid-column: auto;
          grid-row: auto;
        }

        .cb-side {
          position: static;
        }

        .cb-scroll {
          max-height: none;
        }
      }

      @media (max-width: 640px) {
        .cb-hero {
          flex-direction: column;
        }
      }
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

  root.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-cb-form]");
    if (!form) return;
    event.preventDefault();
    const formData = new FormData(form);
    const kind = form.dataset.cbForm;
    if (kind === "auth") return auth(state.authMode, formData);
    if (kind === "profile")
      return saveProfilePatch(
        { displayName: formData.get("displayName"), activeTitleKey: formData.get("activeTitleKey") },
        "プロフィールを保存しました。"
      );
    if (kind === "post") {
      createPost(formData);
      form.reset();
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
    clearState,
    refresh
  };

  injectStyle();
  render();
  refresh().then(() => {
    if (window.__KH_PENDING_SHARE_PAYLOAD?.view === "community") {
      applyShareState(window.__KH_PENDING_SHARE_PAYLOAD.state ?? {}, { showToast: true });
      window.__KH_PENDING_SHARE_PAYLOAD = null;
    }
  });
})();
