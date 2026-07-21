const STORAGE_KEY = "hoego.weekly-circle.v3";

const members = [
  { id: "miso", name: "미소", initial: "미", color: "blue" },
  { id: "junho", name: "준호", initial: "준", color: "purple" },
  { id: "jiah", name: "지아", initial: "지", color: "green" },
  { id: "hyeonu", name: "현우", initial: "현", color: "yellow" },
];

const seedState = {
  editorId: "miso",
  currentWeek: {
    week: 12,
    title: "이주의 회고",
    range: "2026.07.14 - 07.20",
    previousPlans: {
      miso: "밀린 문서부터 정리하고, 운동 주 3회 다시 시작하기",
      junho: "블로그 글 초안 하나 쓰기",
      jiah: "발표 피드백 반영하고 조금 쉬어가기",
      hyeonu: "다음 주엔 저녁 시간 확보해서 만회하기",
    },
    entries: {
      miso: {
        status: "done",
        review: "이번 주엔 사이드 프로젝트 배포까지 끝냈다. 근데 문서 정리를 못 해서 다음 주로 넘어감.",
        plan: "밀린 문서 마무리, 회고 사이트 프로토타입 만들기",
      },
      junho: {
        status: "draft",
        review: "회사 일이 많아 개인 작업은 거의 못 함. 대신 읽던 책 한 권 완독.",
        plan: "블로그 글 초안 하나 쓰기",
      },
      jiah: { status: "pending", review: "", plan: "" },
      hyeonu: { status: "pending", review: "", plan: "" },
    },
  },
  archive: [
    {
      week: 11,
      title: "이주의 회고",
      range: "2026.07.07 - 07.13",
      participation: "4/4",
      entries: {
        miso: {
          review: "이사 준비로 정신없었지만 회고 사이트 기획은 시작함.",
          plan: "밀린 문서 정리, 운동 주 3회 재개",
        },
        junho: {
          review: "운동 루틴 다시 잡음. 주 3회 다 성공해서 뿌듯.",
          plan: "이 페이스 유지하고 식단도 신경 쓰기",
        },
        jiah: {
          review: "발표 준비하느라 바빴지만 결과는 만족스러웠다.",
          plan: "발표 피드백 반영하고 조금 쉬어가기",
        },
        hyeonu: {
          review: "일이 몰려서 개인 목표는 거의 못 챙겼다.",
          plan: "다음 주엔 저녁 시간 확보해서 만회하기",
        },
      },
    },
    {
      week: 10,
      title: "이주의 회고",
      range: "2026.06.30 - 07.06",
      participation: "3/4",
      entries: {
        miso: {
          review: "프로젝트 방향을 다시 잡고 필요한 자료를 모았다.",
          plan: "이사 준비 체크리스트 만들기",
        },
        junho: {
          review: "감기로 한 주를 쉬었지만 컨디션을 회복했다.",
          plan: "운동 루틴을 낮은 강도로 다시 시작",
        },
        hyeonu: {
          review: "아직 면접 준비 리듬을 만들지 못했다.",
          plan: "매일 30분씩 예상 질문 정리",
        },
      },
    },
    {
      week: 9,
      title: "이주의 회고",
      range: "2026.06.23 - 06.29",
      participation: "4/4",
      entries: {
        miso: {
          review: "첫 회고라 어색했지만 각자 목표를 하나씩 정했다.",
          plan: "사이드 프로젝트 범위 줄이기",
        },
        junho: {
          review: "책 읽는 시간을 다시 확보했다.",
          plan: "퇴근 후 운동 시간을 캘린더에 고정",
        },
        jiah: {
          review: "발표 주제를 정하고 자료 조사를 시작했다.",
          plan: "발표 목차 초안 만들기",
        },
        hyeonu: {
          review: "개인 목표를 너무 크게 잡았다는 걸 알았다.",
          plan: "면접 준비를 작은 단위로 나누기",
        },
      },
    },
  ],
};

const state = loadState();
let autosaveTimer = null;

const elements = {
  editorSelect: document.querySelector("#editorSelect"),
  statusChips: document.querySelector("#statusChips"),
  currentTitle: document.querySelector("#currentTitle"),
  currentRange: document.querySelector("#currentRange"),
  carryoverLabel: document.querySelector("#carryoverLabel"),
  carryoverText: document.querySelector("#carryoverText"),
  reviewForm: document.querySelector("#reviewForm"),
  reviewInput: document.querySelector("#reviewInput"),
  planInput: document.querySelector("#planInput"),
  autosaveStatus: document.querySelector("#autosaveStatus"),
  friendList: document.querySelector("#friendList"),
  archiveList: document.querySelector("#archiveList"),
  detailTitle: document.querySelector("#detailTitle"),
  detailRange: document.querySelector("#detailRange"),
  detailGrid: document.querySelector("#detailGrid"),
  scrollDown: document.querySelector("#scrollDown"),
  backToArchive: document.querySelector("#backToArchive"),
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  renderEditorSelect();
  bindEvents();
  renderCurrentWeek();
  renderArchive();
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });

  elements.editorSelect.addEventListener("change", () => {
    state.editorId = elements.editorSelect.value;
    saveState();
    renderCurrentWeek();
  });

  elements.reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveCurrentEntry("saved");
  });

  [elements.reviewInput, elements.planInput].forEach((input) => {
    input.addEventListener("input", () => {
      elements.autosaveStatus.textContent = "자동 저장 중";
      clearTimeout(autosaveTimer);
      autosaveTimer = setTimeout(() => saveCurrentEntry("autosaved"), 350);
    });
  });

  elements.scrollDown.addEventListener("click", () => {
    document.querySelector(".friends-section").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  elements.backToArchive.addEventListener("click", () => showView("archive"));
}

function renderEditorSelect() {
  elements.editorSelect.innerHTML = members
    .map((member) => `<option value="${member.id}">편집: ${escapeHtml(member.name)}</option>`)
    .join("");
  elements.editorSelect.value = state.editorId;
}

function renderCurrentWeek() {
  const week = state.currentWeek;
  const editor = getMember(state.editorId);
  const editorEntry = ensureCurrentEntry(state.editorId);

  elements.currentTitle.textContent = `${week.week}주차의 기록`;
  elements.currentRange.textContent = week.range;
  elements.carryoverLabel.textContent = `↩ ${editor.name}의 지난주 계획`;
  elements.carryoverText.textContent = week.previousPlans[state.editorId] || "지난주 계획이 아직 없습니다.";
  elements.reviewInput.value = editorEntry.review;
  elements.planInput.value = editorEntry.plan;
  elements.autosaveStatus.textContent = `${editor.name} 회고 ${editorEntry.status === "done" ? "저장됨" : "작성 중"}`;

  renderStatusChips();
  renderCurrentEntries();
}

function renderStatusChips() {
  elements.statusChips.innerHTML = members.map((member) => {
    const entry = ensureCurrentEntry(member.id);
    const status = entry.status || "pending";
    const icon = status === "done" ? "✓" : status === "draft" ? "♢" : "";
    const label = status === "pending" ? `${member.name} 미작성` : member.name;

    return `
      <span class="status-chip ${status}">
        ${icon ? `<span aria-hidden="true">${icon}</span>` : ""}
        ${escapeHtml(label)}
      </span>
    `;
  }).join("");
}

function renderCurrentEntries() {
  const visibleEntries = members
    .map((member) => ({ member, entry: ensureCurrentEntry(member.id) }));

  elements.friendList.innerHTML = visibleEntries
    .map(({ member, entry }) => renderPersonCard(member, entry, { editable: true }))
    .join("");

  elements.friendList.querySelectorAll("[data-edit-member]").forEach((button) => {
    button.addEventListener("click", () => editMember(button.dataset.editMember));
  });
}

function renderArchive() {
  elements.archiveList.innerHTML = state.archive.map((week) => {
    const summary = members
      .map((member) => {
        const entry = week.entries[member.id];
        if (!entry) return "";
        return `${member.name}: ${entry.review}`;
      })
      .filter(Boolean)
      .join(" · ");

    return `
      <button class="archive-item" type="button" data-week="${week.week}" aria-label="${week.week}주차 회고 상세 보기">
        <span class="week-number">${week.week}<span>주차</span></span>
        <span>
          <span class="archive-meta">${escapeHtml(week.range)} · 참여 ${escapeHtml(week.participation)}</span>
          <span class="archive-summary">${escapeHtml(summary)}</span>
        </span>
        <span class="archive-arrow" aria-hidden="true">›</span>
      </button>
    `;
  }).join("");

  elements.archiveList.querySelectorAll("[data-week]").forEach((button) => {
    button.addEventListener("click", () => openDetail(Number(button.dataset.week)));
  });
}

function openDetail(weekNumber) {
  const week = state.archive.find((item) => item.week === weekNumber);
  if (!week) return;

  elements.detailTitle.textContent = `${week.week}주차 · ${week.title}`;
  elements.detailRange.textContent = week.range;
  elements.detailGrid.innerHTML = members
    .filter((member) => week.entries[member.id])
    .map((member) => renderPersonCard(member, week.entries[member.id]))
    .join("");

  showView("detail");
}

function renderPersonCard(member, entry, options = {}) {
  const editButton = options.editable
    ? `<button class="edit-person-button" type="button" data-edit-member="${member.id}">편집</button>`
    : "";

  return `
    <article class="person-card">
      <header class="person-head">
        <span class="person-identity">
          <span class="avatar ${member.color}" aria-hidden="true">${escapeHtml(member.initial)}</span>
          <h2 class="person-name">${escapeHtml(member.name)}</h2>
        </span>
        ${editButton}
      </header>
      <section class="entry-section">
        <strong class="entry-label">이번 주 회고</strong>
        <p class="entry-text">${escapeHtml(entry.review || "아직 작성 전입니다.")}</p>
      </section>
      <section class="entry-section">
        <strong class="entry-label">다음 주 계획</strong>
        <p class="entry-text">${escapeHtml(entry.plan || "아직 작성 전입니다.")}</p>
      </section>
    </article>
  `;
}

function showView(viewName) {
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    const isActive = panel.dataset.panel === viewName;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    const isActive = button.dataset.view === viewName;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  if (viewName === "detail") {
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.classList.remove("active");
      button.setAttribute("aria-selected", "false");
    });
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function saveCurrentEntry(mode) {
  const editor = getMember(state.editorId);
  const entry = ensureCurrentEntry(state.editorId);
  entry.review = elements.reviewInput.value.trim();
  entry.plan = elements.planInput.value.trim();
  entry.status = entry.review || entry.plan ? "done" : "pending";
  saveState();
  renderStatusChips();
  renderCurrentEntries();
  elements.autosaveStatus.textContent = mode === "saved" ? `${editor.name} 회고 저장됨` : `${editor.name} 회고 자동 저장됨`;
}

function editMember(memberId) {
  state.editorId = memberId;
  elements.editorSelect.value = memberId;
  saveState();
  renderCurrentWeek();
  document.querySelector(".editor-card").scrollIntoView({ behavior: "smooth", block: "start" });
}

function getMember(memberId) {
  return members.find((member) => member.id === memberId) || members[0];
}

function ensureCurrentEntry(memberId) {
  if (!state.currentWeek.entries[memberId]) {
    state.currentWeek.entries[memberId] = { status: "pending", review: "", plan: "" };
  }
  return state.currentWeek.entries[memberId];
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored) return deepClone(seedState);
    return mergeState(deepClone(seedState), stored);
  } catch {
    return deepClone(seedState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function mergeState(base, stored) {
  return {
    ...base,
    ...stored,
    editorId: stored.editorId || stored.viewerId || base.editorId,
    currentWeek: {
      ...base.currentWeek,
      ...stored.currentWeek,
      previousPlans: {
        ...base.currentWeek.previousPlans,
        ...(stored.currentWeek?.previousPlans || {}),
      },
      entries: {
        ...base.currentWeek.entries,
        ...(stored.currentWeek?.entries || {}),
      },
    },
    archive: Array.isArray(stored.archive) ? stored.archive : base.archive,
  };
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
