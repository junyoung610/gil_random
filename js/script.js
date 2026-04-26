/* ===== 데이터 ===== */
const DATA = {
  기관: [
    "유초등부",
    "중고등부",
    "대학청년부",
    "다니엘부",
    "바울전도회",
    "한나전도회",
    "마리아전도회",
    "에스더전도회",
    "교역자",
    "활동조조희주",
    "활동조김민수",
    "활동조정다운",
  ],
  유초등부: [
    "고유찬",
    "박소율",
    "이서윤",
    "고유준",
    "송민하",
    "박세진",
    "이지아",
    "최빛",
    "최별",
    "안예준",
    "우엔수진",
  ],
  중고등부: ["안예빈", "이세중", "이정아", "이윤아", "김성현"],
  대학청년부: [
    "이예준",
    "정나실",
    "김준영",
    "이도연",
    "최서윤",
    "허겸",
    "조동주",
    "최윤재",
    "조현묵",
    "홍민규",
    "홍선규",
  ],
  다니엘부: ["김민수", "조희주", "정다운", "정다정"],
  바울전도회: ["김용남", "정병선", "김동현", "송창완", "안재호", "조병삼", "양조권", "최승환"],
  한나전도회: ["전상수", "노금자", "이숙영", "장옥분", "정준경", "최성례"],
  마리아전도회: ["손은아", "최은숙", "김명희", "이숙현", "이정순", "최은자", "나경자"],
  에스더전도회: ["박현희", "정성숙", "강유리", "김은숙", "김향순", "정윤정", "조아라", "최혜선"],
  교역자: ["최준봉", "김주혜"],
  활동조조희주: [
    "조희주",
    "김용남",
    "전상수",
    "이정순",
    "정준경",
    "노금자",
    "조병삼",
    "김명희",
    "이숙영",
    "김은숙",
    "강유리",
    "조아라",
    "양종권",
    "전창석",
    "허겸",
    "최서윤",
    "이예준",
    "이세중",
    "최별",
    "고유찬",
  ],
  활동조김민수: [
    "김민수",
    "정병선",
    "최은숙",
    "최은자",
    "장옥분",
    "정윤정",
    "최혜선",
    "안재호",
    "정다정",
    "홍선규",
    "조현묵",
    "조동주",
    "이도연",
    "김준영",
    "김성현",
    "이윤아",
    "안예준",
    "이지아",
    "최빛",
    "수진",
  ],
  활동조정다운: [
    "정다운",
    "김동현",
    "정성숙",
    "손은아",
    "송창완",
    "김향순",
    "박현희",
    "이숙현",
    "최성례",
    "나경자",
    "양홍연",
    "최윤재",
    "홍민규",
    "정나실",
    "이정아",
    "안예빈",
    "박세진",
    "박소율",
    "고유준",
  ],
};
/* ================== */

let selectedOrg = null;
let attendance = {};
let rollInterval = null;

/* ===== localStorage 저장 ===== */
function saveAttendance() {
  localStorage.setItem("attendance", JSON.stringify(attendance));
}

/* ===== localStorage 불러오기 ===== */
function loadAttendance() {
  const saved = localStorage.getItem("attendance");
  if (saved) {
    attendance = JSON.parse(saved);
    return true;
  }
  return false;
}

/* ===== 초기화 ===== */
function init() {
  const hasSaved = loadAttendance();

  if (!hasSaved) {
    Object.keys(DATA).forEach((org) => {
      attendance[org] = {};
      DATA[org].forEach((m) => (attendance[org][m] = true));
    });
  }

  const grid = document.getElementById("orgGrid");

  const allBtn = document.createElement("button");
  allBtn.className = "org-btn all-btn";
  allBtn.textContent = "전체";
  allBtn.dataset.org = "__all__";
  allBtn.onclick = () => selectOrg("__all__");
  grid.appendChild(allBtn);

  const div = document.createElement("div");
  div.className = "org-divider";
  grid.appendChild(div);

  Object.keys(DATA).forEach((org) => {
    const btn = document.createElement("button");
    btn.className = "org-btn";
    btn.textContent = org;
    btn.dataset.org = org;
    btn.onclick = () => selectOrg(org);
    grid.appendChild(btn);
  });

  selectOrg("__all__");
}

/* ===== 기관 선택 ===== */
function selectOrg(org) {
  selectedOrg = org === "__all__" ? null : org;

  document.querySelectorAll(".org-btn").forEach((b) => {
    b.classList.remove("active");
    if (b.dataset.org === org) b.classList.add("active");
  });

  renderMembers();
}

/* ===== 현재 회원 ===== */
function getCurrentMembers() {
  if (selectedOrg === null) {
    let all = [];
    Object.keys(DATA).forEach((org) => {
      DATA[org].forEach((name) => all.push({ name, org }));
    });
    return all;
  } else {
    return DATA[selectedOrg].map((name) => ({ name, org: selectedOrg }));
  }
}

/* ===== 렌더링 ===== */
function renderMembers() {
  const card = document.getElementById("memberCard");
  const members = getCurrentMembers();
  const presentCount = members.filter((m) => attendance[m.org][m.name]).length;

  const title =
    selectedOrg === null
      ? `전체 회원 (${members.length}명)`
      : `${selectedOrg} 회원 (${members.length}명)`;

  card.innerHTML = `
    <div class="member-header">
    <p class="title-style">${title}</p>
    <div class="member-G">
        <span>참석 ${presentCount}명</span>
        <button class="toggle-all" onclick="toggleAll()">전체 토글</button>
      </div>
    </div>
    <div id="memberList"></div>
  `;

  const list = document.getElementById("memberList");

  members.forEach(({ name, org }) => {
    const present = attendance[org][name];

    const row = document.createElement("div");
    row.className = "member-row" + (present ? "" : " absent");
    row.onclick = () => toggleMember(name, org);

    row.innerHTML = `
      <span>${present ? "✔️" : "❌"}</span>
      ${name}
      ${selectedOrg === null ? `(${org})` : ""}
    `;

    list.appendChild(row);
  });

  document.getElementById("drawBtn").disabled = presentCount === 0;
}

/* ===== 개별 토글 ===== */
function toggleMember(name, org) {
  attendance[org][name] = !attendance[org][name];
  saveAttendance(); // ⭐ 핵심
  renderMembers();
}

/* ===== 전체 토글 ===== */
function toggleAll() {
  const members = getCurrentMembers();
  const allOn = members.every((m) => attendance[m.org][m.name]);

  members.forEach((m) => {
    attendance[m.org][m.name] = !allOn;
  });

  saveAttendance(); // ⭐ 핵심
  renderMembers();
}

/* ===== 뽑기 ===== */
function startDraw() {
  const members = getCurrentMembers();
  const pool = members.filter((m) => attendance[m.org][m.name]);

  if (pool.length === 0) return;

  const resultName = document.getElementById("resultName");
  const resultCard = document.getElementById("resultCard");
  const drawBtn = document.getElementById("drawBtn");

  resultCard.style.display = "block";

  drawBtn.disabled = true;

  let count = 0;

  rollInterval = setInterval(() => {
    const rand = pool[Math.floor(Math.random() * pool.length)];
    resultName.textContent = rand.name;

    count++;

    if (count > 25) {
      clearInterval(rollInterval);

      const winner = pool[Math.floor(Math.random() * pool.length)];
      resultName.textContent = winner.name;

      drawBtn.disabled = false;
    }
  }, 70);
}

/* 실행 */
init();
