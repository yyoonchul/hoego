const STORAGE_KEY = "hoego.posts.v2";
const SETTINGS_KEY = "hoego.github.v1";
const ARCHIVE_PATH = "./data/posts.json";

const state = {
  posts: [],
  settings: loadSettings(),
  archiveSha: null,
  editingId: null,
};

const schemaFields = {
  reflection: [
    ["wins", "좋았던 점"],
    ["challenges", "어려웠던 점"],
    ["learnings", "배운 점"],
  ],
  plan: [
    ["goals", "목표"],
    ["actions", "실행 계획"],
    ["support", "필요한 도움"],
  ],
};

const form = document.querySelector("#postForm");
const board = document.querySelector("#board");
const emptyState = document.querySelector("#emptyState");
const storageStatus = document.querySelector("#storageStatus");

document.addEventListener("DOMContentLoaded", init);

async function init() {
  document.querySelector("#weekOf").valueAsDate = new Date();
  fillSettingsForm();
  bindEvents();
  await loadPosts();
  render();
}

function bindEvents() {
  form.addEventListener("submit", handleSubmit);
  document.querySelector("#resetForm").addEventListener("click", resetComposer);
  document.querySelector("#saveSettings").addEventListener("click", saveSettings);
  document.querySelector("#clearSettings").addEventListener("click", clearSettings);
  document.querySelector("#exportPosts").addEventListener("click", exportPosts);
  document.querySelector("#importPosts").addEventListener("change", importPosts);
}

async function loadPosts() {
  const localPosts = loadLocalPosts();
  const archivePosts = await loadArchivePosts();
  const remotePosts = hasGitHubSettings() ? await loadGitHubPosts() : [];

  state.posts = mergePosts(remotePosts, archivePosts, localPosts);
  saveLocalPosts();

  if (hasGitHubSettings()) {
    storageStatus.textContent = "GitHub JSON 아카이브에 연결되었습니다.";
  } else {
    storageStatus.textContent = "레포의 data/posts.json을 읽고, 새 글은 이 브라우저에 임시 저장합니다.";
  }
}

async function loadArchivePosts() {
  try {
    const response = await fetch(`${ARCHIVE_PATH}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return [];
    return normalizePosts(await response.json());
  } catch {
    return [];
  }
}

async function loadGitHubPosts() {
  try {
    const file = await fetchGitHubFile();
    state.archiveSha = file.sha;
    return normalizePosts(JSON.parse(decodeBase64(file.content)));
  } catch (error) {
    storageStatus.textContent = `GitHub JSON 읽기 실패: ${error.message}`;
    return [];
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  const data = new FormData(form);
  const existingPost = state.editingId ? state.posts.find((item) => item.id === state.editingId) : null;
  const post = {
    id: existingPost?.id || crypto.randomUUID(),
    type: "weekly",
    author: clean(data.get("author")),
    weekOf: data.get("weekOf"),
    title: clean(data.get("title")),
    content: {
      reflection: Object.fromEntries(schemaFields.reflection.map(([key]) => [key, clean(data.get(key))])),
      plan: Object.fromEntries(schemaFields.plan.map(([key]) => [key, clean(data.get(key))])),
    },
    commitment: clean(data.get("commitment")),
    createdAt: existingPost?.createdAt || new Date().toISOString(),
    updatedAt: existingPost ? new Date().toISOString() : undefined,
  };

  if (!post.author || !post.title || !post.weekOf) return;

  state.posts = state.editingId
    ? state.posts.map((item) => (item.id === state.editingId ? post : item))
    : mergePosts([post], state.posts);
  saveLocalPosts();
  render();

  if (hasGitHubSettings()) {
    await commitPosts(
      `${state.editingId ? "Update" : "Add"} weekly retrospective: ${post.title}`,
      { mergeLatest: !state.editingId },
    );
  } else {
    storageStatus.textContent = state.editingId
      ? "로컬에서 수정했습니다. GitHub 설정이 없어서 레포 JSON은 바뀌지 않았습니다."
      : "로컬에 저장했습니다. GitHub 설정을 저장하면 data/posts.json에 커밋할 수 있습니다.";
  }

  resetComposer();
}

function render() {
  renderWeekRange();
  renderStats();
  renderBoard();
}

function renderWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  document.querySelector("#weekRange").textContent = `${formatDate(monday)} - ${formatDate(sunday)}`;
}

function renderStats() {
  document.querySelector("#postCount").textContent = state.posts.length;
  document.querySelector("#writerCount").textContent = new Set(state.posts.map((post) => post.author)).size;
}

function renderBoard() {
  board.innerHTML = "";
  emptyState.hidden = state.posts.length > 0;

  state.posts.forEach((post) => {
    const card = document.createElement("article");
    card.className = "post-card";
    card.innerHTML = `
      <header>
        <div>
          <span class="meta">${escapeHtml(post.author)} · ${escapeHtml(post.weekOf)}</span>
          <h3>${escapeHtml(post.title)}</h3>
        </div>
        <span class="badge">weekly</span>
      </header>
      <div class="post-groups">
        ${renderPostGroup("이번주 회고", schemaFields.reflection, post.content.reflection)}
        ${renderPostGroup("다음주 플랜", schemaFields.plan, post.content.plan)}
      </div>
      ${post.commitment ? `<p class="commitment">${escapeHtml(post.commitment)}</p>` : ""}
      <div class="card-actions">
        <button class="edit-button" type="button" data-id="${post.id}" aria-label="글 편집" title="글 편집">edit</button>
        <button class="delete-button" type="button" data-id="${post.id}" aria-label="글 삭제" title="글 삭제">×</button>
      </div>
    `;
    board.append(card);
  });

  board.querySelectorAll(".edit-button").forEach((button) => {
    button.addEventListener("click", () => editPost(button.dataset.id));
  });

  board.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", () => deletePost(button.dataset.id));
  });
}

function renderPostGroup(title, fields, content) {
  const sections = fields.map(([key, label]) => renderPostSection(label, content?.[key])).join("");
  if (!sections) return "";
  return `
    <section class="post-group">
      <h4>${title}</h4>
      <div class="post-sections">${sections}</div>
    </section>
  `;
}

function renderPostSection(label, value) {
  if (!value) return "";
  return `
    <div class="post-section">
      <strong>${label}</strong>
      <p>${escapeHtml(value)}</p>
    </div>
  `;
}

function editPost(id) {
  const post = state.posts.find((item) => item.id === id);
  if (!post) return;

  state.editingId = id;
  form.author.value = post.author;
  form.weekOf.value = post.weekOf;
  form.title.value = post.title;
  form.wins.value = post.content.reflection?.wins || "";
  form.challenges.value = post.content.reflection?.challenges || "";
  form.learnings.value = post.content.reflection?.learnings || "";
  form.goals.value = post.content.plan?.goals || "";
  form.actions.value = post.content.plan?.actions || "";
  form.support.value = post.content.plan?.support || "";
  form.commitment.value = post.commitment || "";
  form.querySelector("button[type='submit']").textContent = "수정 저장";
  document.querySelector("#resetForm").textContent = "편집 취소";
  document.querySelector("#compose").scrollIntoView({ behavior: "smooth", block: "start" });
  storageStatus.textContent = "편집 중입니다. 저장하면 기존 글이 업데이트됩니다.";
}

function resetComposer() {
  state.editingId = null;
  form.reset();
  document.querySelector("#weekOf").valueAsDate = new Date();
  form.querySelector("button[type='submit']").textContent = "게시하기";
  document.querySelector("#resetForm").textContent = "초기화";
}

async function deletePost(id) {
  if (state.editingId === id) resetComposer();
  state.posts = state.posts.filter((post) => post.id !== id);
  saveLocalPosts();
  render();

  if (hasGitHubSettings()) {
    await commitPosts("Delete weekly retrospective", { mergeLatest: false });
  } else {
    storageStatus.textContent = "로컬에서 삭제했습니다. GitHub 설정이 없어서 레포 JSON은 바뀌지 않았습니다.";
  }
}

async function commitPosts(message, options = {}) {
  try {
    storageStatus.textContent = "data/posts.json에 커밋하는 중입니다.";
    const { mergeLatest = true } = options;
    const latest = await fetchGitHubFile();
    const latestPosts = normalizePosts(JSON.parse(decodeBase64(latest.content)));
    const mergedPosts = mergeLatest ? mergePosts(state.posts, latestPosts) : state.posts;
    const body = {
      message,
      content: encodeBase64(JSON.stringify(mergedPosts, null, 2) + "\n"),
      sha: latest.sha,
      branch: setting("githubBranch", "main"),
    };

    const response = await fetch(githubApiUrl(), {
      method: "PUT",
      headers: githubHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(await githubErrorMessage(response));
    const data = await response.json();
    state.archiveSha = data.content.sha;
    state.posts = mergedPosts;
    saveLocalPosts();
    render();
    storageStatus.textContent = "data/posts.json에 커밋했습니다. GitHub Pages 반영에는 잠시 걸릴 수 있습니다.";
  } catch (error) {
    storageStatus.textContent = `GitHub 저장 실패: ${error.message}`;
  }
}

async function fetchGitHubFile() {
  const response = await fetch(`${githubApiUrl()}?ref=${encodeURIComponent(setting("githubBranch", "main"))}`, {
    headers: githubHeaders(),
  });
  if (!response.ok) throw new Error(await githubErrorMessage(response));
  return response.json();
}

function githubApiUrl() {
  const owner = encodeURIComponent(setting("githubOwner"));
  const repo = encodeURIComponent(setting("githubRepo"));
  const path = setting("githubPath", "data/posts.json").split("/").map(encodeURIComponent).join("/");
  return `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
}

function githubHeaders() {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${setting("githubToken")}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function githubErrorMessage(response) {
  try {
    const data = await response.json();
    return data.message || `${response.status} ${response.statusText}`;
  } catch {
    return `${response.status} ${response.statusText}`;
  }
}

function saveSettings() {
  state.settings = {
    githubOwner: document.querySelector("#githubOwner").value.trim(),
    githubRepo: document.querySelector("#githubRepo").value.trim(),
    githubBranch: document.querySelector("#githubBranch").value.trim() || "main",
    githubPath: document.querySelector("#githubPath").value.trim() || "data/posts.json",
    githubToken: document.querySelector("#githubToken").value.trim(),
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  loadPosts().then(render);
}

function clearSettings() {
  state.settings = {};
  localStorage.removeItem(SETTINGS_KEY);
  fillSettingsForm();
  loadPosts().then(render);
}

function fillSettingsForm() {
  document.querySelector("#githubOwner").value = state.settings.githubOwner || "";
  document.querySelector("#githubRepo").value = state.settings.githubRepo || "";
  document.querySelector("#githubBranch").value = state.settings.githubBranch || "main";
  document.querySelector("#githubPath").value = state.settings.githubPath || "data/posts.json";
  document.querySelector("#githubToken").value = state.settings.githubToken || "";
}

function hasGitHubSettings() {
  return Boolean(
    setting("githubOwner") &&
    setting("githubRepo") &&
    setting("githubPath", "data/posts.json") &&
    setting("githubToken"),
  );
}

function setting(key, fallback = "") {
  return state.settings[key] || fallback;
}

function exportPosts() {
  const blob = new Blob([JSON.stringify(state.posts, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "posts.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importPosts(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const imported = normalizePosts(JSON.parse(reader.result));
      state.posts = mergePosts(imported, state.posts);
      saveLocalPosts();
      render();
      if (hasGitHubSettings()) {
        await commitPosts("Import weekly retrospective archive");
      } else {
        storageStatus.textContent = "JSON 게시글을 로컬로 가져왔습니다.";
      }
    } catch (error) {
      storageStatus.textContent = `가져오기 실패: ${error.message}`;
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function loadLocalPosts() {
  try {
    return normalizePosts(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  } catch {
    return [];
  }
}

function saveLocalPosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.posts));
}

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  } catch {
    return {};
  }
}

function mergePosts(...groups) {
  const postsById = new Map();
  groups.flat().map(normalizePost).forEach((post) => {
    if (post.id) postsById.set(post.id, post);
  });
  return [...postsById.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function normalizePosts(posts) {
  if (!Array.isArray(posts)) return [];
  return posts.map(normalizePost);
}

function normalizePost(post) {
  const safePost = post || {};
  return {
    id: safePost.id || crypto.randomUUID(),
    type: "weekly",
    author: clean(safePost.author),
    weekOf: safePost.weekOf || safePost.week_of || "",
    title: clean(safePost.title),
    content: normalizeContent(safePost),
    commitment: clean(safePost.commitment),
    createdAt: safePost.createdAt || safePost.created_at || new Date().toISOString(),
    updatedAt: safePost.updatedAt || safePost.updated_at || undefined,
  };
}

function normalizeContent(post) {
  if (post?.content?.reflection || post?.content?.plan) {
    return {
      reflection: post.content.reflection || {},
      plan: post.content.plan || {},
    };
  }

  if (post?.type === "reflection") {
    return { reflection: post.content || {}, plan: {} };
  }

  if (post?.type === "plan") {
    return { reflection: {}, plan: post.content || {} };
  }

  return { reflection: {}, plan: {} };
}

function encodeBase64(value) {
  return btoa(unescape(encodeURIComponent(value)));
}

function decodeBase64(value) {
  return decodeURIComponent(escape(atob(value.replace(/\n/g, ""))));
}

function clean(value) {
  return String(value || "").trim();
}

function formatDate(date) {
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(date);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
