"use strict";

const MEDICAL_UNIVERSITIES = [
  "北海道大学","札幌医科大学","旭川医科大学","弘前大学","岩手医科大学","東北大学","秋田大学","山形大学","福島県立医科大学","筑波大学","自治医科大学","獨協医科大学","群馬大学","埼玉医科大学","千葉大学","国際医療福祉大学","東京大学","東京科学大学","東京医科大学","東京慈恵会医科大学","日本医科大学","日本大学","東邦大学","昭和医科大学","帝京大学","杏林大学","順天堂大学","慶應義塾大学","東京女子医科大学","北里大学","東海大学","聖マリアンナ医科大学","横浜市立大学","新潟大学","富山大学","金沢大学","金沢医科大学","福井大学","山梨大学","信州大学","岐阜大学","浜松医科大学","名古屋大学","名古屋市立大学","愛知医科大学","藤田医科大学","三重大学","滋賀医科大学","京都大学","京都府立医科大学","大阪大学","大阪公立大学","関西医科大学","近畿大学","兵庫医科大学","神戸大学","奈良県立医科大学","和歌山県立医科大学","鳥取大学","島根大学","岡山大学","川崎医科大学","広島大学","山口大学","徳島大学","香川大学","愛媛大学","高知大学","九州大学","福岡大学","久留米大学","産業医科大学","佐賀大学","長崎大学","熊本大学","大分大学","宮崎大学","鹿児島大学","琉球大学"
];

const SPECIALTIES = [
  "総合診療","救急","内科","外科","小児科","産婦人科","精神科","皮膚科",
  "整形外科","眼科","耳鼻咽喉科","泌尿器科","放射線科","麻酔科","病理","未定"
];
const REGIONS = ["北海道","東北","関東","北陸・甲信越","東海","近畿","中国","四国","九州・沖縄"];
const PREFECTURES = ["北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県","茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県","新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県","静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県","徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"];

const STORAGE_VERSION = "clean-details-v1";
const VERSION_KEY = "medmatch_ui_data_version";

/*
  前版に含めていたデモ登録データを一度だけ削除する。
  実際のSupabase上のデータには触れない。
*/
if (localStorage.getItem(VERSION_KEY) !== STORAGE_VERSION) {
  [
    "medmatch_profile","medmatch_jobs","medmatch_applications","medmatch_scouts",
    "medmatch_hospitals","medmatch_students","medmatch_favorites"
  ].forEach(k => localStorage.removeItem(k));
  localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const state = {
  role: "student",
  page: "dashboard",
  detailId: null,
  previousPage: null,
  profile: load("medmatch_profile", {
    university:"", schoolYear:"", graduationYear:"", specialty:"", area:"", bio:""
  }),
  jobs: load("medmatch_jobs", []),
  applications: load("medmatch_applications", []),
  scouts: load("medmatch_scouts", []),
  hospitals: load("medmatch_hospitals", []),
  students: load("medmatch_students", []),
  favorites: load("medmatch_favorites", [])
};

const nav = {
  student: [
    ["dashboard","⌂","ホーム"],
    ["hospitals","⌕","病院・募集を探す"],
    ["scouts","✉","スカウト"],
    ["pipeline","▦","見学・応募管理"],
    ["profile","◎","プロフィール"]
  ],
  hospital: [
    ["dashboard","⌂","ホーム"],
    ["students","⌕","学生を探す"],
    ["scouts","✉","スカウト管理"],
    ["pipeline","▦","見学・応募管理"],
    ["jobs","＋","募集管理"]
  ],
  admin: [
    ["dashboard","⌂","ダッシュボード"],
    ["students","♙","医学生管理"],
    ["hospitals","✚","病院管理"],
    ["review","✓","審査"],
    ["reports","!","通報・問い合わせ"],
    ["audit","≡","操作ログ"]
  ]
};

function esc(v=""){
  return String(v).replace(/[&<>"']/g,c=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}
function badge(t,c=""){ return `<span class="badge ${c}">${esc(t)}</span>`; }
function kpi(label,value,foot=""){
  return `<div class="card"><div class="kpi-label">${esc(label)}</div><div class="kpi-value">${esc(value)}</div>${foot?`<div class="kpi-foot">${esc(foot)}</div>`:""}</div>`;
}
function emptyState(title, text, action=""){
  return `<div class="card empty-state">
    <div class="empty-icon">＋</div>
    <div class="empty-title">${esc(title)}</div>
    <div class="empty-text">${esc(text)}</div>
    ${action}
  </div>`;
}
function rowButton(label, page, id){
  return `<button class="btn" onclick="openDetail('${page}','${esc(id)}')">${esc(label)}</button>`;
}
function formatDate(v){
  if(!v) return "未設定";
  const p=String(v).split("-");
  return p.length===3 ? `${p[0]}/${p[1]}/${p[2]}` : esc(v);
}
function pageHead(title, sub, actions=""){
  return `<div class="page-head">
    <div><div class="page-title">${esc(title)}</div><div class="page-sub">${esc(sub)}</div></div>
    ${actions?`<div class="actions">${actions}</div>`:""}
  </div>`;
}
function backButton(){
  return `<button class="btn" onclick="goBack()">← 一覧に戻る</button>`;
}
function detailRow(label, value){
  return `<div class="detail-row"><div class="detail-label">${esc(label)}</div><div class="detail-value">${value || '<span class="muted">未登録</span>'}</div></div>`;
}
function section(title, body){
  return `<div class="card detail-section"><h3 class="section-title">${esc(title)}</h3>${body}</div>`;
}

function setRole(role){
  state.role = role;
  state.page = "dashboard";
  state.detailId = null;
  document.querySelectorAll(".role-btn").forEach(b=>b.classList.toggle("active",b.dataset.role===role));
  document.getElementById("userChip").textContent =
    role==="student" ? "医学生" : role==="hospital" ? "病院アカウント" : "運営管理者";
  render();
}

function renderSidebar(){
  const s = document.getElementById("sidebar");
  const currentBase = ["job-detail","application-detail","scout-detail","hospital-detail","student-detail","job-new","job-edit"].includes(state.page)
    ? state.previousPage
    : state.page;
  s.innerHTML = `<div class="side-group">
    <div class="side-label">${state.role==="admin"?"管理":"メニュー"}</div>
    ${nav[state.role].map(([id,icon,label])=>`
      <button class="nav-item ${currentBase===id?"active":""}" data-page="${id}">
        <span class="nav-icon">${icon}</span><span class="nav-text">${label}</span>
      </button>`).join("")}
  </div>`;
  s.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>go(b.dataset.page));
}

function go(page){
  state.previousPage = state.page;
  state.page = page;
  state.detailId = null;
  render();
}
function openDetail(page,id){
  state.previousPage = state.page;
  state.page = page;
  state.detailId = id;
  render();
}
function goBack(){
  state.page = state.previousPage || "dashboard";
  state.detailId = null;
  state.previousPage = null;
  render();
}

/* ---------- 医学生 ---------- */

function studentDashboard(){
  const scoutUnread = state.scouts.filter(s=>s.direction==="to-student" && s.status==="unread").length;
  const activeApps = state.applications.filter(a=>!["完了","辞退"].includes(a.status)).length;
  const visits = state.applications.filter(a=>a.type==="病院見学" && !["完了","辞退"].includes(a.status)).length;
  const favs = state.favorites.length;

  return `${pageHead("ホーム","見学・スカウト・応募状況をまとめて確認できます。",`<button class="btn primary" onclick="go('hospitals')">病院・募集を探す</button>`)}
    ${!state.profile.university ? `<div class="notice">プロフィールはまだ未登録です。大学・学年・卒業予定年度を登録すると、病院側から検索される情報を整えられます。</div>` : ""}
    <div class="grid cols-4">
      ${kpi("新着スカウト",`${scoutUnread}件`)}
      ${kpi("見学予定",`${visits}件`)}
      ${kpi("応募中",`${activeApps}件`)}
      ${kpi("お気に入り",`${favs}件`)}
    </div>
    <div class="grid cols-2" style="margin-top:16px">
      <div class="card">
        <h3 class="section-title">次の予定</h3>
        ${state.applications.length ? studentApplicationMiniList() : `<div class="muted small">現在、見学・応募の予定はありません。</div>`}
      </div>
      <div class="card">
        <h3 class="section-title">新着スカウト</h3>
        ${state.scouts.length ? studentScoutMiniList() : `<div class="muted small">現在、新着スカウトはありません。</div>`}
      </div>
    </div>`;
}

function studentApplicationMiniList(){
  return `<div class="list">${state.applications.slice(0,4).map(a=>{
    const j=state.jobs.find(x=>String(x.id)===String(a.jobId));
    return `<button class="clickable-row" onclick="openDetail('application-detail','${esc(a.id)}')">
      <div class="row-main"><div class="avatar">応</div><div><div class="row-title">${esc(j?.title || a.title || "応募")}</div><div class="row-sub">${esc(a.status || "受付済み")}</div></div></div>
      ${badge(a.status || "受付済み","blue")}
    </button>`;
  }).join("")}</div>`;
}
function studentScoutMiniList(){
  return `<div class="list">${state.scouts.slice(0,4).map(s=>`
    <button class="clickable-row" onclick="openDetail('scout-detail','${esc(s.id)}')">
      <div class="row-main"><div class="avatar">✉</div><div><div class="row-title">${esc(s.hospitalName || "病院")}</div><div class="row-sub">${esc(s.subject || "スカウト")}</div></div></div>
      ${badge(s.status==="unread"?"未読":"既読",s.status==="unread"?"blue":"")}
    </button>`).join("")}</div>`;
}

function hospitalsPage(){
  const publicJobs = state.jobs.filter(j=>j.status==="公開中");
  return `${pageHead("病院・募集を探す","公開中の研修・見学・説明会などを検索します。")}
    <div class="card">
      <div class="search-panel">
        <div class="field"><label>地域</label><select id="studentRegion"><option value="">全国</option>${REGIONS.map(x=>`<option>${esc(x)}</option>`).join("")}</select></div>
        <div class="field"><label>希望診療科</label><select id="studentSpecialty"><option value="">指定なし</option>${SPECIALTIES.map(x=>`<option>${esc(x)}</option>`).join("")}</select></div>
        <div class="field"><label>募集種別</label><select id="studentJobType"><option value="">指定なし</option><option>初期研修</option><option>病院見学</option><option>説明会</option><option>実習・インターン</option><option>その他</option></select></div>
        <div class="field"><label>卒業年度</label><select id="studentGrad"><option value="">指定なし</option>${[2027,2028,2029,2030,2031,2032,2033].map(x=>`<option>${x}</option>`).join("")}</select></div>
      </div>
      <div class="actions">
        <button class="btn primary" onclick="filterStudentJobs()">検索</button>
        <button class="btn" onclick="go('hospitals')">条件をリセット</button>
      </div>
    </div>
    <div id="studentJobResults" style="margin-top:16px">
      ${studentJobList(publicJobs)}
    </div>`;
}

function studentJobList(list){
  if(!list.length){
    return emptyState("現在公開中の募集はありません","病院が募集を公開すると、ここに表示されます。");
  }
  return `<div class="list">${list.map(j=>`
    <div class="hospital-card">
      <div>
        <div class="row-title" style="font-size:18px">${esc(j.title)}</div>
        <div class="row-sub">${esc(j.hospitalName || "病院名未登録")} ・ ${esc(j.prefecture || "勤務地未登録")}</div>
        <div class="hospital-meta">
          ${badge(j.type || "募集","blue")}
          ${j.graduationYear?badge(`${j.graduationYear}年度卒`):""}
          ${j.deadline?badge(`締切 ${formatDate(j.deadline)}`,"orange"):""}
        </div>
      </div>
      <div class="actions">
        <button class="btn" onclick="toggleFavorite('${esc(j.id)}')">${state.favorites.includes(String(j.id))?"♥ 保存済み":"♡ お気に入り"}</button>
        <button class="btn primary" onclick="openDetail('job-detail','${esc(j.id)}')">募集詳細</button>
      </div>
    </div>`).join("")}</div>`;
}

function filterStudentJobs(){
  const region=document.getElementById("studentRegion").value;
  const specialty=document.getElementById("studentSpecialty").value;
  const type=document.getElementById("studentJobType").value;
  const grad=document.getElementById("studentGrad").value;
  const list=state.jobs.filter(j=>
    j.status==="公開中" &&
    (!region || j.region===region) &&
    (!specialty || (j.specialties||[]).includes(specialty)) &&
    (!type || j.type===type) &&
    (!grad || String(j.graduationYear)===String(grad))
  );
  document.getElementById("studentJobResults").innerHTML=studentJobList(list);
}

function jobDetailPage(){
  const j=state.jobs.find(x=>String(x.id)===String(state.detailId));
  if(!j) return `${pageHead("募集詳細","指定された募集は見つかりません。",backButton())}${emptyState("募集がありません","一覧から募集を選び直してください。")}`;
  const isHospital = state.role==="hospital";
  const app = state.applications.find(a=>String(a.jobId)===String(j.id));
  const specialties=(j.specialties||[]).map(x=>badge(x,"blue")).join(" ");
  return `${pageHead(j.title || "募集詳細",`${j.hospitalName || "病院名未登録"}の募集詳細`,`
      ${backButton()}
      ${isHospital?`<button class="btn primary" onclick="openDetail('job-edit','${esc(j.id)}')">編集</button>`:
        `<button class="btn" onclick="toggleFavorite('${esc(j.id)}')">${state.favorites.includes(String(j.id))?"♥ 保存済み":"♡ お気に入り"}</button>
         <button class="btn primary" onclick="applyToJob('${esc(j.id)}')">${app?"応募済み":"応募・見学申込"}</button>`}
    `)}
    <div class="detail-layout">
      <div class="detail-main">
        ${section("募集概要",`
          <div class="detail-grid">
            ${detailRow("募集種別",esc(j.type || ""))}
            ${detailRow("募集状態",badge(j.status || "下書き",j.status==="公開中"?"green":""))}
            ${detailRow("病院名",esc(j.hospitalName || ""))}
            ${detailRow("勤務地",esc([j.prefecture,j.city].filter(Boolean).join(" ") || ""))}
            ${detailRow("対象学年",esc(j.targetYears || ""))}
            ${detailRow("卒業予定年度",j.graduationYear?`${esc(j.graduationYear)}年度`:"")}
            ${detailRow("募集人数",j.positions?`${esc(j.positions)}名`:"")}
            ${detailRow("応募締切",j.deadline?formatDate(j.deadline):"")}
          </div>
        `)}
        ${section("対象診療科", specialties || `<span class="muted">未登録</span>`)}
        ${section("研修・募集内容",`<div class="detail-copy">${nl2br(j.description || "") || '<span class="muted">未登録</span>'}</div>`)}
        ${section("応募方法・必要書類",`<div class="detail-copy">${nl2br(j.applicationMethod || "") || '<span class="muted">未登録</span>'}</div>`)}
        ${section("選考方法",`<div class="detail-copy">${nl2br(j.selection || "") || '<span class="muted">未登録</span>'}</div>`)}
        ${section("勤務・待遇",`
          <div class="detail-grid">
            ${detailRow("給与・手当",esc(j.salary || ""))}
            ${detailRow("勤務時間",esc(j.workHours || ""))}
            ${detailRow("当直",esc(j.oncall || ""))}
            ${detailRow("休日・休暇",esc(j.holidays || ""))}
          </div>
        `)}
      </div>
      <aside class="detail-aside">
        <div class="card sticky-card">
          <div class="small muted">募集ID</div>
          <div class="detail-id">${esc(j.id)}</div>
          <div class="detail-side-line"><span>掲載開始</span><strong>${j.publishedAt?formatDate(j.publishedAt):"未設定"}</strong></div>
          <div class="detail-side-line"><span>応募締切</span><strong>${j.deadline?formatDate(j.deadline):"未設定"}</strong></div>
          <div class="detail-side-line"><span>状態</span><strong>${esc(j.status || "下書き")}</strong></div>
        </div>
      </aside>
    </div>`;
}

function nl2br(v){
  if(!v) return "";
  return esc(v).replace(/\n/g,"<br>");
}

function toggleFavorite(id){
  id=String(id);
  state.favorites = state.favorites.includes(id) ? state.favorites.filter(x=>x!==id) : [...state.favorites,id];
  save("medmatch_favorites",state.favorites);
  render();
  toast(state.favorites.includes(id)?"お気に入りに追加しました":"お気に入りから外しました");
}

function applyToJob(jobId){
  const j=state.jobs.find(x=>String(x.id)===String(jobId));
  if(!j) return;
  const existing=state.applications.find(a=>String(a.jobId)===String(jobId));
  if(existing){
    openDetail("application-detail",existing.id);
    return;
  }
  const a={
    id:`APP-${Date.now()}`,
    jobId:String(jobId),
    title:j.title,
    hospitalName:j.hospitalName || "",
    type:j.type==="病院見学"?"病院見学":"応募",
    status:"申込済み",
    createdAt:new Date().toISOString().slice(0,10),
    message:""
  };
  state.applications.unshift(a);
  save("medmatch_applications",state.applications);
  state.previousPage="job-detail";
  state.page="application-detail";
  state.detailId=a.id;
  render();
  toast("申込を登録しました");
}

function scoutsStudent(){
  const list=state.scouts.filter(s=>s.direction==="to-student");
  return `${pageHead("スカウト","病院から届いたアプローチです。")}
    ${list.length ? `<div class="list">${list.map(s=>`
      <button class="clickable-card" onclick="openDetail('scout-detail','${esc(s.id)}')">
        <div><div class="row-title">${esc(s.hospitalName || "病院")}</div><div class="row-sub">${esc(s.subject || "スカウト")}</div></div>
        ${badge(s.status==="unread"?"未読":"既読",s.status==="unread"?"blue":"")}
      </button>`).join("")}</div>` :
      emptyState("スカウトはまだありません","病院からスカウトが届くと、ここに表示されます。")}`;
}

function scoutDetailPage(){
  const s=state.scouts.find(x=>String(x.id)===String(state.detailId));
  if(!s) return `${pageHead("スカウト詳細","指定されたスカウトは見つかりません。",backButton())}${emptyState("スカウトがありません","一覧から選び直してください。")}`;
  if(s.status==="unread"){s.status="read";save("medmatch_scouts",state.scouts);}
  return `${pageHead("スカウト詳細",s.subject || "病院からのスカウト",backButton())}
    <div class="grid cols-2">
      <div class="card">
        <h3 class="section-title">${esc(s.hospitalName || "病院")}</h3>
        <div class="detail-copy">${nl2br(s.message || "") || '<span class="muted">メッセージはありません。</span>'}</div>
      </div>
      <div class="card">
        <h3 class="section-title">スカウト情報</h3>
        ${detailRow("送信日",s.createdAt?formatDate(s.createdAt):"")}
        ${detailRow("状態",esc(s.status || ""))}
        ${s.jobId?`<div class="actions" style="margin-top:14px"><button class="btn primary" onclick="openDetail('job-detail','${esc(s.jobId)}')">関連する募集を見る</button></div>`:""}
      </div>
    </div>`;
}

function studentPipeline(){
  if(!state.applications.length){
    return `${pageHead("見学・応募管理","見学申込・応募の状況を管理します。")}
      ${emptyState("見学・応募はまだありません","募集詳細から応募・病院見学を申し込むと、ここに表示されます。",`<button class="btn primary" onclick="go('hospitals')">募集を探す</button>`)}`;
  }
  const groups=["申込済み","日程調整","選考中","完了"];
  return `${pageHead("見学・応募管理","見学申込・応募の状況を管理します。")}
    <div class="kanban">${groups.map(g=>{
      const items=state.applications.filter(a=>(a.status||"申込済み")===g);
      return `<div class="kanban-col"><div class="kanban-head">${g}<span>${items.length}</span></div>
        ${items.map(a=>`<button class="kanban-card clickable-kanban" onclick="openDetail('application-detail','${esc(a.id)}')">
          <div class="row-title">${esc(a.title || "応募")}</div><div class="row-sub">${esc(a.hospitalName || "")}</div>
        </button>`).join("")}
      </div>`;
    }).join("")}</div>`;
}

function applicationDetailPage(){
  const a=state.applications.find(x=>String(x.id)===String(state.detailId));
  if(!a) return `${pageHead("応募・見学詳細","指定された申込は見つかりません。",backButton())}${emptyState("申込がありません","一覧から選び直してください。")}`;
  const j=state.jobs.find(x=>String(x.id)===String(a.jobId));
  return `${pageHead("応募・見学詳細",a.title || "申込詳細",`
    ${backButton()}
    ${j?`<button class="btn" onclick="openDetail('job-detail','${esc(j.id)}')">募集詳細を見る</button>`:""}
  `)}
  <div class="grid cols-2">
    <div class="card">
      <h3 class="section-title">申込情報</h3>
      ${detailRow("病院",esc(a.hospitalName || ""))}
      ${detailRow("区分",esc(a.type || ""))}
      ${detailRow("申込日",a.createdAt?formatDate(a.createdAt):"")}
      ${detailRow("現在の状態",badge(a.status || "申込済み","blue"))}
    </div>
    <div class="card">
      <h3 class="section-title">連絡・次の対応</h3>
      <div class="detail-copy">${a.message?nl2br(a.message):'<span class="muted">病院からの連絡はまだありません。</span>'}</div>
    </div>
  </div>`;
}

function universityDatalist(){
  return `<datalist id="medicalUniversities">${MEDICAL_UNIVERSITIES.map(u=>`<option value="${esc(u)}"></option>`).join("")}</datalist>`;
}
function profilePage(){
  const p=state.profile;
  const gradYears=[]; for(let y=2027;y<=2038;y++) gradYears.push(y);
  return `${pageHead("プロフィール","病院に公開する情報を設定します。",`<button class="btn primary" onclick="saveProfile()">保存</button>`)}
    <div class="grid cols-2">
      <div class="card">
        <h3 class="section-title">基本情報</h3>
        <div class="field" style="margin-bottom:12px"><label>大学</label>
          <input id="profileUniversity" list="medicalUniversities" value="${esc(p.university)}" placeholder="大学名を入力すると候補が表示されます">
          ${universityDatalist()}
          <div class="field-help">文字を入力すると医学部のある大学候補が表示されます。</div>
        </div>
        <div class="field" style="margin-bottom:12px"><label>学年</label>
          <select id="profileSchoolYear"><option value="">選択してください</option>${[1,2,3,4,5,6].map(y=>`<option value="${y}" ${String(y)===String(p.schoolYear)?"selected":""}>医学部${y}年</option>`).join("")}</select>
        </div>
        <div class="field" style="margin-bottom:12px"><label>卒業予定年度</label>
          <select id="profileGraduationYear"><option value="">選択してください</option>${gradYears.map(y=>`<option value="${y}" ${String(y)===String(p.graduationYear)?"selected":""}>${y}年度</option>`).join("")}</select>
        </div>
        <div class="field" style="margin-bottom:12px"><label>希望診療科</label><input id="profileSpecialty" value="${esc(p.specialty)}" placeholder="例：救急 / 総合診療"></div>
        <div class="field"><label>希望地域</label><input id="profileArea" value="${esc(p.area)}" placeholder="例：東京 / 神奈川"></div>
      </div>
      <div class="card">
        <h3 class="section-title">自己紹介</h3>
        <div class="field"><label>自己紹介</label><textarea id="profileBio" placeholder="研修で重視したいこと、興味のある分野など">${esc(p.bio)}</textarea></div>
      </div>
    </div>`;
}
function saveProfile(){
  state.profile={
    university:document.getElementById("profileUniversity").value.trim(),
    schoolYear:document.getElementById("profileSchoolYear").value,
    graduationYear:document.getElementById("profileGraduationYear").value,
    specialty:document.getElementById("profileSpecialty").value.trim(),
    area:document.getElementById("profileArea").value.trim(),
    bio:document.getElementById("profileBio").value.trim()
  };
  save("medmatch_profile",state.profile);
  toast("プロフィールを保存しました");
  render();
}

/* ---------- 病院 ---------- */

function hospitalDashboard(){
  const publicCount=state.jobs.filter(j=>j.status==="公開中").length;
  const draftCount=state.jobs.filter(j=>j.status!=="公開中").length;
  const apps=state.applications.length;
  const sent=state.scouts.filter(s=>s.direction==="to-student").length;
  return `${pageHead("採用ダッシュボード","募集・応募・スカウトの状況を確認できます。",`<button class="btn primary" onclick="go('jobs')">募集管理</button>`)}
    <div class="grid cols-4">
      ${kpi("公開中の募集",`${publicCount}件`)}
      ${kpi("下書き",`${draftCount}件`)}
      ${kpi("応募・見学申込",`${apps}件`)}
      ${kpi("送信スカウト",`${sent}件`)}
    </div>
    <div class="grid cols-2" style="margin-top:16px">
      <div class="card"><h3 class="section-title">最近の応募</h3>${state.applications.length?hospitalApplicationMiniList():`<div class="muted small">まだ応募・見学申込はありません。</div>`}</div>
      <div class="card"><h3 class="section-title">募集状況</h3>${state.jobs.length?hospitalJobMiniList():`<div class="muted small">募集はまだ作成されていません。</div>`}</div>
    </div>`;
}
function hospitalApplicationMiniList(){
  return `<div class="list">${state.applications.slice(0,5).map(a=>`
    <button class="clickable-row" onclick="openDetail('application-detail','${esc(a.id)}')">
      <div><div class="row-title">${esc(a.title || "応募")}</div><div class="row-sub">${esc(a.status || "申込済み")}</div></div>${badge(a.status || "申込済み","blue")}
    </button>`).join("")}</div>`;
}
function hospitalJobMiniList(){
  return `<div class="list">${state.jobs.slice(0,5).map(j=>`
    <button class="clickable-row" onclick="openDetail('job-detail','${esc(j.id)}')">
      <div><div class="row-title">${esc(j.title)}</div><div class="row-sub">${esc(j.type || "")}</div></div>${badge(j.status || "下書き",j.status==="公開中"?"green":"")}
    </button>`).join("")}</div>`;
}

function studentsPage(){
  return `${pageHead("学生を探す","スカウト受信を許可している医学生から検索します。")}
    <div class="card">
      <div class="search-panel">
        <div class="field"><label>卒業年度</label><select><option>指定なし</option>${[2027,2028,2029,2030,2031].map(x=>`<option>${x}</option>`).join("")}</select></div>
        <div class="field"><label>希望地域</label><select><option>指定なし</option>${REGIONS.map(x=>`<option>${esc(x)}</option>`).join("")}</select></div>
        <div class="field"><label>希望診療科</label><select><option>指定なし</option>${SPECIALTIES.map(x=>`<option>${esc(x)}</option>`).join("")}</select></div>
        <div class="field"><label>大学</label><input list="hospitalUniversityCandidates" placeholder="大学名を入力"><datalist id="hospitalUniversityCandidates">${MEDICAL_UNIVERSITIES.map(u=>`<option value="${esc(u)}"></option>`).join("")}</datalist></div>
      </div>
      <button class="btn primary" onclick="toast('検索条件を適用しました')">検索</button>
    </div>
    <div style="margin-top:16px">
      ${state.students.length ? `<div class="list">${state.students.map(s=>studentCard(s)).join("")}</div>` :
        emptyState("登録済みの学生データはありません","学生プロフィールが登録されると、検索結果に表示されます。")}
    </div>`;
}
function studentCard(s){
  return `<div class="student-card">
    <div>
      <div class="row-title" style="font-size:18px">${esc(s.displayName || "医学生")}</div>
      <div class="row-sub">${esc(s.university || "")} ${s.schoolYear?`・ 医学部${esc(s.schoolYear)}年`:""}</div>
      <div class="student-meta">${s.graduationYear?badge(`卒業 ${s.graduationYear}`,"blue"):""}${s.specialty?badge(s.specialty):""}${s.area?badge(s.area,"green"):""}</div>
    </div>
    <div class="actions"><button class="btn primary" onclick="openDetail('student-detail','${esc(s.id)}')">プロフィール詳細</button></div>
  </div>`;
}
function studentDetailPage(){
  const s=state.students.find(x=>String(x.id)===String(state.detailId));
  if(!s) return `${pageHead("学生プロフィール","指定された学生は見つかりません。",backButton())}${emptyState("学生データがありません","一覧から選び直してください。")}`;
  return `${pageHead("学生プロフィール",s.displayName || "医学生",`${backButton()}<button class="btn primary" onclick="createScoutForStudent('${esc(s.id)}')">スカウトする</button>`)}
    <div class="grid cols-2">
      <div class="card"><h3 class="section-title">基本情報</h3>
        ${detailRow("大学",esc(s.university || ""))}
        ${detailRow("学年",s.schoolYear?`医学部${esc(s.schoolYear)}年`:"")}
        ${detailRow("卒業予定年度",s.graduationYear?`${esc(s.graduationYear)}年度`:"")}
        ${detailRow("希望診療科",esc(s.specialty || ""))}
        ${detailRow("希望地域",esc(s.area || ""))}
      </div>
      <div class="card"><h3 class="section-title">自己紹介</h3><div class="detail-copy">${nl2br(s.bio || "") || '<span class="muted">未登録</span>'}</div></div>
    </div>`;
}
function createScoutForStudent(studentId){
  const s=state.students.find(x=>String(x.id)===String(studentId)); if(!s)return;
  const scout={id:`SCT-${Date.now()}`,direction:"to-student",studentId:String(studentId),hospitalName:"病院",subject:"病院からのスカウト",message:"プロフィールを拝見し、ご連絡しました。",status:"unread",createdAt:new Date().toISOString().slice(0,10)};
  state.scouts.unshift(scout);save("medmatch_scouts",state.scouts);toast("スカウトを送信しました");go("scouts");
}

function hospitalScouts(){
  const list=state.scouts.filter(s=>s.direction==="to-student");
  return `${pageHead("スカウト管理","送信したスカウトの状況を確認します。")}
    ${list.length ? `<div class="list">${list.map(s=>`
      <button class="clickable-card" onclick="openDetail('scout-detail','${esc(s.id)}')">
        <div><div class="row-title">${esc(s.subject || "スカウト")}</div><div class="row-sub">${esc(s.createdAt || "")}</div></div>${badge(s.status || "送信済み","blue")}
      </button>`).join("")}</div>` :
      emptyState("送信済みスカウトはありません","学生プロフィールからスカウトを送信すると、ここに表示されます。")}`;
}

function hospitalPipeline(){
  return `${pageHead("見学・応募管理","病院見学から選考までを管理します。")}
    ${state.applications.length ? `<div class="list">${state.applications.map(a=>`
      <button class="clickable-card" onclick="openDetail('application-detail','${esc(a.id)}')">
        <div><div class="row-title">${esc(a.title || "応募")}</div><div class="row-sub">${esc(a.hospitalName || "")}</div></div>${badge(a.status || "申込済み","blue")}
      </button>`).join("")}</div>` :
      emptyState("見学・応募はまだありません","学生から申込が届くと、ここに表示されます。")}`;
}

function jobsPage(){
  return `${pageHead("募集管理","初期研修・病院見学・説明会の募集を作成・管理します。",`<button class="btn primary" onclick="go('job-new')">＋ 新規募集</button>`)}
    ${state.jobs.length ? `<div class="list">${state.jobs.map(j=>`
      <div class="hospital-card">
        <div><div class="row-title" style="font-size:18px">${esc(j.title)}</div><div class="row-sub">${esc(j.type || "")} ・ ${j.deadline?`締切 ${formatDate(j.deadline)}`:"締切未設定"}</div><div class="hospital-meta">${badge(j.status || "下書き",j.status==="公開中"?"green":"")}</div></div>
        <div class="actions"><button class="btn" onclick="openDetail('job-edit','${esc(j.id)}')">編集</button><button class="btn primary" onclick="openDetail('job-detail','${esc(j.id)}')">詳細</button></div>
      </div>`).join("")}</div>` :
      emptyState("募集はまだありません","最初の募集を作成してください。",`<button class="btn primary" onclick="go('job-new')">＋ 新規募集を作成</button>`)}`;
}

function jobFormPage(edit=false){
  const existing = edit ? state.jobs.find(x=>String(x.id)===String(state.detailId)) : null;
  if(edit && !existing) return `${pageHead("募集編集","指定された募集は見つかりません。",backButton())}`;
  const j=existing || {
    title:"",hospitalName:"",type:"初期研修",status:"下書き",region:"",prefecture:"",city:"",
    targetYears:"",graduationYear:"",positions:"",deadline:"",publishedAt:"",
    specialties:[],description:"",applicationMethod:"",selection:"",salary:"",workHours:"",oncall:"",holidays:""
  };
  const years=[];for(let y=2027;y<=2038;y++)years.push(y);
  return `${pageHead(edit?"募集を編集":"新規募集","募集内容を入力してください。",backButton())}
    <form id="jobForm" class="card" onsubmit="saveJob(event,'${edit?esc(j.id):""}')">
      <h3 class="section-title">基本情報</h3>
      <div class="form-grid">
        <div class="field full"><label>募集タイトル</label><input name="title" value="${esc(j.title)}" required placeholder="例：2028年度 初期臨床研修医募集"></div>
        <div class="field"><label>病院名</label><input name="hospitalName" value="${esc(j.hospitalName)}" required></div>
        <div class="field"><label>募集種別</label><select name="type">${["初期研修","病院見学","説明会","実習・インターン","その他"].map(x=>`<option ${j.type===x?"selected":""}>${x}</option>`).join("")}</select></div>
        <div class="field"><label>状態</label><select name="status"><option ${j.status==="下書き"?"selected":""}>下書き</option><option ${j.status==="公開中"?"selected":""}>公開中</option><option ${j.status==="募集終了"?"selected":""}>募集終了</option></select></div>
        <div class="field"><label>地域</label><select name="region"><option value="">選択してください</option>${REGIONS.map(x=>`<option ${j.region===x?"selected":""}>${esc(x)}</option>`).join("")}</select></div>
        <div class="field"><label>都道府県</label><select name="prefecture"><option value="">選択してください</option>${PREFECTURES.map(x=>`<option ${j.prefecture===x?"selected":""}>${esc(x)}</option>`).join("")}</select></div>
        <div class="field"><label>市区町村</label><input name="city" value="${esc(j.city)}" placeholder="例：札幌市北区"></div>
        <div class="field"><label>対象学年</label><input name="targetYears" value="${esc(j.targetYears)}" placeholder="例：医学部5〜6年"></div>
        <div class="field"><label>卒業予定年度</label><select name="graduationYear"><option value="">指定なし</option>${years.map(y=>`<option value="${y}" ${String(j.graduationYear)===String(y)?"selected":""}>${y}年度</option>`).join("")}</select></div>
        <div class="field"><label>募集人数</label><input name="positions" type="number" min="1" value="${esc(j.positions)}"></div>
        <div class="field"><label>応募締切</label><input name="deadline" type="date" value="${esc(j.deadline)}"></div>
        <div class="field"><label>掲載開始日</label><input name="publishedAt" type="date" value="${esc(j.publishedAt)}"></div>
        <div class="field full"><label>対象診療科</label><div class="option-grid">${SPECIALTIES.map(x=>`<label class="check-option"><input type="checkbox" name="specialties" value="${esc(x)}" ${(j.specialties||[]).includes(x)?"checked":""}><span>${esc(x)}</span></label>`).join("")}</div></div>
        <div class="field full"><label>研修・募集内容</label><textarea name="description" placeholder="プログラムの特徴、研修内容、対象者へのメッセージなど">${esc(j.description)}</textarea></div>
        <div class="field full"><label>応募方法・必要書類</label><textarea name="applicationMethod" placeholder="応募フォーム、履歴書、成績証明書など">${esc(j.applicationMethod)}</textarea></div>
        <div class="field full"><label>選考方法</label><textarea name="selection" placeholder="書類選考、面接、日程など">${esc(j.selection)}</textarea></div>
        <div class="field"><label>給与・手当</label><input name="salary" value="${esc(j.salary)}"></div>
        <div class="field"><label>勤務時間</label><input name="workHours" value="${esc(j.workHours)}"></div>
        <div class="field"><label>当直</label><input name="oncall" value="${esc(j.oncall)}"></div>
        <div class="field"><label>休日・休暇</label><input name="holidays" value="${esc(j.holidays)}"></div>
      </div>
      <div class="form-footer">
        <button type="button" class="btn" onclick="goBack()">キャンセル</button>
        <button type="submit" class="btn primary">${edit?"変更を保存":"募集を作成"}</button>
      </div>
    </form>`;
}
function saveJob(e, id){
  e.preventDefault();
  const fd=new FormData(e.target);
  const obj={
    id:id || `JOB-${Date.now()}`,
    title:fd.get("title").trim(),
    hospitalName:fd.get("hospitalName").trim(),
    type:fd.get("type"),
    status:fd.get("status"),
    region:fd.get("region"),
    prefecture:fd.get("prefecture"),
    city:fd.get("city").trim(),
    targetYears:fd.get("targetYears").trim(),
    graduationYear:fd.get("graduationYear"),
    positions:fd.get("positions"),
    deadline:fd.get("deadline"),
    publishedAt:fd.get("publishedAt"),
    specialties:fd.getAll("specialties"),
    description:fd.get("description").trim(),
    applicationMethod:fd.get("applicationMethod").trim(),
    selection:fd.get("selection").trim(),
    salary:fd.get("salary").trim(),
    workHours:fd.get("workHours").trim(),
    oncall:fd.get("oncall").trim(),
    holidays:fd.get("holidays").trim()
  };
  if(id){
    const idx=state.jobs.findIndex(x=>String(x.id)===String(id));
    if(idx>=0) state.jobs[idx]=obj;
  }else{
    state.jobs.unshift(obj);
  }
  save("medmatch_jobs",state.jobs);
  state.previousPage="jobs";
  state.page="job-detail";
  state.detailId=obj.id;
  render();
  toast(id?"募集を更新しました":"募集を作成しました");
}

/* ---------- 管理者 ---------- */

function adminDashboard(){
  return `${pageHead("運営ダッシュボード","サービス全体の登録・審査状況です。")}
    <div class="grid cols-4">
      ${kpi("登録医学生",`${state.students.length}`)}
      ${kpi("登録病院",`${state.hospitals.length}`)}
      ${kpi("公開中募集",`${state.jobs.filter(j=>j.status==="公開中").length}`)}
      ${kpi("応募・見学申込",`${state.applications.length}`)}
    </div>
    <div style="margin-top:16px">${emptyState("要対応案件はありません","審査・通報などが発生するとここに表示されます。")}</div>`;
}
function adminStudents(){
  return `${pageHead("医学生管理","登録状態・本人確認・利用状況を管理します。")}
    ${state.students.length?`<div class="list">${state.students.map(studentCard).join("")}</div>`:emptyState("登録済み医学生はありません","学生登録データが作成されると、ここに表示されます。")}`;
}
function adminHospitals(){
  return `${pageHead("病院管理","病院アカウントと確認状況を管理します。")}
    ${state.hospitals.length?`<div class="list">${state.hospitals.map(h=>`
      <div class="hospital-card"><div><div class="row-title">${esc(h.name || "病院")}</div><div class="row-sub">${esc(h.prefecture || "")}</div></div><div class="actions"><button class="btn primary" onclick="openDetail('hospital-detail','${esc(h.id)}')">詳細</button></div></div>`).join("")}</div>`:
      emptyState("登録済み病院はありません","病院登録データが作成されると、ここに表示されます。")}`;
}
function hospitalDetailPage(){
  const h=state.hospitals.find(x=>String(x.id)===String(state.detailId));
  if(!h)return `${pageHead("病院詳細","指定された病院は見つかりません。",backButton())}${emptyState("病院データがありません","一覧から選び直してください。")}`;
  return `${pageHead("病院詳細",h.name || "病院",backButton())}
    <div class="grid cols-2">
      <div class="card"><h3 class="section-title">基本情報</h3>${detailRow("病院名",esc(h.name||""))}${detailRow("所在地",esc([h.prefecture,h.city].filter(Boolean).join(" ")))}${detailRow("病院種別",esc(h.type||""))}</div>
      <div class="card"><h3 class="section-title">紹介</h3><div class="detail-copy">${nl2br(h.description||"") || '<span class="muted">未登録</span>'}</div></div>
    </div>`;
}
function reviewPage(){return `${pageHead("審査","学生本人確認と病院確認を処理します。")}${emptyState("審査待ちはありません","新しい確認申請が入ると、ここに表示されます。")}`;}
function reportsPage(){return `${pageHead("通報・問い合わせ","不適切な利用や問い合わせを管理します。")}${emptyState("通報・問い合わせはありません","新しい案件が届くと、ここに表示されます。")}`;}
function auditPage(){return `${pageHead("操作ログ","管理者操作を監査目的で確認します。")}${emptyState("操作ログはまだありません","管理操作が記録されると、ここに表示されます。")}`;}

/* ---------- Render ---------- */

function renderMain(){
  let html="";
  if(state.role==="student"){
    if(state.page==="dashboard") html=studentDashboard();
    else if(state.page==="hospitals") html=hospitalsPage();
    else if(state.page==="scouts") html=scoutsStudent();
    else if(state.page==="pipeline") html=studentPipeline();
    else if(state.page==="profile") html=profilePage();
    else if(state.page==="job-detail") html=jobDetailPage();
    else if(state.page==="scout-detail") html=scoutDetailPage();
    else if(state.page==="application-detail") html=applicationDetailPage();
    else html=studentDashboard();
  }else if(state.role==="hospital"){
    if(state.page==="dashboard") html=hospitalDashboard();
    else if(state.page==="students") html=studentsPage();
    else if(state.page==="scouts") html=hospitalScouts();
    else if(state.page==="pipeline") html=hospitalPipeline();
    else if(state.page==="jobs") html=jobsPage();
    else if(state.page==="job-new") html=jobFormPage(false);
    else if(state.page==="job-edit") html=jobFormPage(true);
    else if(state.page==="job-detail") html=jobDetailPage();
    else if(state.page==="student-detail") html=studentDetailPage();
    else if(state.page==="scout-detail") html=scoutDetailPage();
    else if(state.page==="application-detail") html=applicationDetailPage();
    else html=hospitalDashboard();
  }else{
    if(state.page==="dashboard") html=adminDashboard();
    else if(state.page==="students") html=adminStudents();
    else if(state.page==="hospitals") html=adminHospitals();
    else if(state.page==="review") html=reviewPage();
    else if(state.page==="reports") html=reportsPage();
    else if(state.page==="audit") html=auditPage();
    else if(state.page==="student-detail") html=studentDetailPage();
    else if(state.page==="hospital-detail") html=hospitalDetailPage();
    else if(state.page==="job-detail") html=jobDetailPage();
    else html=adminDashboard();
  }
  document.getElementById("main").innerHTML=html;
}
function render(){ renderSidebar(); renderMain(); }

function toast(msg){
  const t=document.getElementById("toast");
  t.textContent=msg;t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),1800);
}

window.go=go;
window.openDetail=openDetail;
window.goBack=goBack;
window.toast=toast;
window.saveProfile=saveProfile;
window.filterStudentJobs=filterStudentJobs;
window.toggleFavorite=toggleFavorite;
window.applyToJob=applyToJob;
window.saveJob=saveJob;
window.createScoutForStudent=createScoutForStudent;

document.querySelectorAll(".role-btn").forEach(b=>b.onclick=()=>setRole(b.dataset.role));
render();
