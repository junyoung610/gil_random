/* ===== 데이터 (기관명과 회원 이름 수정) ===== */
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
};
/* =========================================== */

let selectedOrg = null; // null = 전체
let attendance = {};
let rollInterval = null;

/* 초기화: 모든 기관 attendance 세팅 */
function init() {
  Object.keys(DATA).forEach((org) => {
    attendance[org] = {};
    DATA[org].forEach((m) => (attendance[org][m] = true));
  });

  const grid = document.getElementById("orgGrid");

  // 전체 버튼
  const allBtn = document.createElement("button");
  allBtn.className = "org-btn all-btn";
  allBtn.textContent = "전체";
  allBtn.dataset.org = "__all__";
  allBtn.onclick = () => selectOrg("__all__");
  grid.appendChild(allBtn);

  // 구분선
  const div = document.createElement("div");
  div.className = "org-divider";
  grid.appendChild(div);

  // 기관별 버튼
  Object.keys(DATA).forEach((org) => {
    const btn = document.createElement("button");
    btn.className = "org-btn";
    btn.textContent = org;
    btn.dataset.org = org;
    btn.onclick = () => selectOrg(org);
    grid.appendChild(btn);
  });
}

/* 기관 선택 */
function selectOrg(org) {
  selectedOrg = org === "__all__" ? null : org;

  document.querySelectorAll(".org-btn").forEach((b) => {
    b.classList.remove("active");
    if (b.dataset.org === org) b.classList.add("active");
  });

  renderMembers();
}

/* 현재 선택된 기관(들)의 회원 목록 반환 */
function getCurrentMembers() {
  if (selectedOrg === null) {
    // 전체: 모든 기관 회원 포함
    let all = [];
    Object.keys(DATA).forEach((org) => {
      DATA[org].forEach((name) => all.push({ name, org }));
    });
    return all;
  } else {
    return DATA[selectedOrg].map((name) => ({ name, org: selectedOrg }));
  }
}

/* 회원 목록 렌더링 */
function renderMembers() {
  const card = document.getElementById("memberCard");
  const members = getCurrentMembers();
  const presentCount = members.filter((m) => attendance[m.org][m.name]).length;
  const isAll = selectedOrg === null;
  const title = isAll
    ? `전체 회원 (${members.length}명)`
    : `${selectedOrg} 회원 (${members.length}명)`;

  card.innerHTML = `
      <div class="member-header">
        <p class="section-label" style="margin:0;">${title}</p>
        <div style="display:flex;gap:14px;align-items:center;">
          <span class="member-count">참석 ${presentCount}명</span>
          <button class="toggle-all" onclick="toggleAll()">전체 토글</button>
        </div>
      </div>
      <div class="member-list" id="memberList"></div>
    `;

  const list = document.getElementById("memberList");
  members.forEach(({ name, org }) => {
    const present = attendance[org][name];
    const row = document.createElement("div");
    row.className = "member-row" + (present ? "" : " absent");
    row.onclick = () => toggleMember(name, org);
    row.innerHTML = `
        <div class="check ${present ? "on" : ""}">
          ${
            present
              ? '<svg viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
              : ""
          }
        </div>
        <span class="member-name">${name}</span>
        ${isAll ? `<span class="badge-org">${org}</span>` : ""}
        ${!present ? '<span class="badge-absent">불참</span>' : ""}
      `;
    list.appendChild(row);
  });

  document.getElementById("drawBtn").disabled = presentCount === 0;
}

/* 회원 개별 토글 */
function toggleMember(name, org) {
  attendance[org][name] = !attendance[org][name];
  renderMembers();
}

/* 전체 토글 */
function toggleAll() {
  const members = getCurrentMembers();
  const allOn = members.every((m) => attendance[m.org][m.name]);
  members.forEach((m) => (attendance[m.org][m.name] = !allOn));
  renderMembers();
}

/* 뽑기 */
function startDraw() {
  const members = getCurrentMembers();
  const pool = members.filter((m) => attendance[m.org][m.name]);
  if (pool.length === 0) return;

  const resultCard = document.getElementById("resultCard");
  const resultName = document.getElementById("resultName");
  const resultOrg = document.getElementById("resultOrg");
  const trophy = document.getElementById("trophy");
  const drawBtn = document.getElementById("drawBtn");

  resultCard.style.display = "block";
  trophy.style.display = "none";
  resultOrg.textContent = "";
  drawBtn.disabled = true;

  resultName.className = "result-name rolling";

  clearInterval(rollInterval);
  let count = 0;
  const total = 28;

  rollInterval = setInterval(() => {
    const rand = pool[Math.floor(Math.random() * pool.length)];
    resultName.textContent = rand.name;
    count++;
    if (count >= total) {
      clearInterval(rollInterval);
      const winner = pool[Math.floor(Math.random() * pool.length)];
      resultName.textContent = winner.name;
      resultName.className = "result-name";
      resultOrg.textContent = winner.org + " 소속";
      trophy.style.display = "block";
      drawBtn.disabled = false;
    }
  }, 75);
}

init();
