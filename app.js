
const MED_UNIVERSITIES = [
  "北海道大学","札幌医科大学","旭川医科大学","弘前大学","岩手医科大学","東北大学","秋田大学","山形大学",
  "福島県立医科大学","筑波大学","自治医科大学","獨協医科大学","群馬大学","埼玉医科大学","千葉大学",
  "国際医療福祉大学","東京大学","東京科学大学","東京医科大学","東京慈恵会医科大学","日本医科大学",
  "日本大学","東邦大学","昭和医科大学","帝京大学","杏林大学","順天堂大学","慶應義塾大学",
  "東京女子医科大学","北里大学","東海大学","聖マリアンナ医科大学","横浜市立大学","新潟大学",
  "富山大学","金沢大学","金沢医科大学","福井大学","山梨大学","信州大学","岐阜大学","浜松医科大学",
  "名古屋大学","名古屋市立大学","愛知医科大学","藤田医科大学","三重大学","滋賀医科大学","京都大学",
  "京都府立医科大学","大阪大学","大阪公立大学","関西医科大学","近畿大学","兵庫医科大学","神戸大学",
  "奈良県立医科大学","和歌山県立医科大学","鳥取大学","島根大学","岡山大学","川崎医科大学","広島大学",
  "山口大学","徳島大学","香川大学","愛媛大学","高知大学","九州大学","福岡大学","久留米大学",
  "産業医科大学","佐賀大学","長崎大学","熊本大学","大分大学","宮崎大学","鹿児島大学","琉球大学"
];

const SPECIALTIES = [
  "総合診療","救急","内科","外科","小児科","産婦人科","精神科","皮膚科","整形外科","眼科",
  "耳鼻咽喉科","泌尿器科","放射線科","麻酔科","病理","未定"
];
const AREAS = ["北海道","東北","関東","北陸・甲信越","東海","近畿","中国","四国","九州・沖縄"];
const PREFECTURES = ["北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県","茨城県","栃木県","群馬県",
  "埼玉県","千葉県","東京都","神奈川県","新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県","静岡県",
  "愛知県","三重県","滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県","鳥取県","島根県","岡山県","広島県",
  "山口県","徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"];

const state = {
  role: localStorage.getItem("mm_role") || "student",
  page: localStorage.getItem("mm_page") || "home",
  favorites: JSON.parse(localStorage.getItem("mm_favorites") || "[1,3]"),
  savedSearches: JSON.parse(localStorage.getItem("mm_saved_searches") || "[]"),
  applications: JSON.parse(localStorage.getItem("mm_apps") || "[1]"),
  profile: JSON.parse(localStorage.getItem("mm_profile") || JSON.stringify({
    university:"北海道大学", schoolYear:"5", graduationYear:"2028",
    specialties:["救急","総合診療"], areas:["関東"], bio:"救急・総合診療を中心に、幅広い症例を経験できる初期研修を希望しています。",
    scout:true, universityVisible:true, nameVisible:false
  }))
};

const jobs = [
  {id:1,new:true,title:"2028年度 初期臨床研修医募集",hospital:"東京中央総合病院",pref:"東京都",area:"関東",
   type:"初期研修",target:"医学部5〜6年",grad:"2028",specialties:["総合診療","救急","内科"],positions:12,
   deadline:"2026-10-31",posted:"2026-08-20",status:"募集中",summary:"救急外来と総合診療を軸に、Common diseaseから重症例まで幅広く経験できるプログラムです。"},
  {id:2,new:true,title:"病院見学・初期研修説明会",hospital:"横浜みなと市民病院",pref:"神奈川県",area:"関東",
   type:"病院見学",target:"医学部4〜6年",grad:"",specialties:["救急","外科"],positions:30,
   deadline:"2026-09-20",posted:"2026-08-18",status:"募集中",summary:"少人数見学会。救急外来、手術室、研修医カンファレンスを見学できます。"},
  {id:3,new:false,title:"2028年度 初期研修プログラム",hospital:"札幌北医療センター",pref:"北海道",area:"北海道",
   type:"初期研修",target:"医学部5〜6年",grad:"2028",specialties:["内科","小児科","総合診療"],positions:8,
   deadline:"2026-11-15",posted:"2026-08-12",status:"募集中",summary:"地域医療と大学病院連携を組み合わせたローテーションを提供します。"},
  {id:4,new:false,title:"救急科 1日インターンシップ",hospital:"大阪ベイ救命救急センター",pref:"大阪府",area:"近畿",
   type:"実習・インターン",target:"医学部4〜6年",grad:"",specialties:["救急","麻酔科"],positions:20,
   deadline:"2026-09-10",posted:"2026-08-08",status:"募集中",summary:"救急搬送受入から初療、ICU回診までを体験する1日プログラムです。"},
  {id:5,new:false,title:"地域医療重点型 初期臨床研修医募集",hospital:"福岡東総合病院",pref:"福岡県",area:"九州・沖縄",
   type:"初期研修",target:"医学部5〜6年",grad:"2028",specialties:["総合診療","内科","外科"],positions:6,
   deadline:"2026-10-20",posted:"2026-07-30",status:"募集中",summary:"地域の基幹病院として一次から二次救急までを担い、訪問診療も経験できます。"}
];

const students = [
  {id:101,university:"北海道大学",year:5,grad:2028,areas:["関東","北海道"],specialties:["救急","総合診療"],scout:true,last:"2026-08-22",name:"M.N."},
  {id:102,university:"東北大学",year:6,grad:2027,areas:["関東"],specialties:["内科","総合診療"],scout:true,last:"2026-08-21",name:"K.S."},
  {id:103,university:"大阪大学",year:5,grad:2028,areas:["近畿","東海"],specialties:["外科","救急"],scout:true,last:"2026-08-20",name:"A.T."},
  {id:104,university:"九州大学",year:4,grad:2029,areas:["九州・沖縄","関東"],specialties:["小児科","内科"],scout:true,last:"2026-08-19",name:"Y.H."}
];

const hospitalJobs = [
  {id:"H-001",title:"2028年度 初期臨床研修医募集",status:"公開中",views:421,favorites:37,apps:12,deadline:"2026-10-31"},
  {id:"H-002",title:"救急科 病院見学会",status:"公開中",views:186,favorites:18,apps:21,deadline:"2026-09-20"},
  {id:"H-003",title:"2029年度向け オープンホスピタル",status:"下書き",views:0,favorites:0,apps:0,deadline:"未設定"}
];

const approvals = [
  {id:901,type:"病院",name:"北関東地域医療センター",meta:"群馬県 / 申請 2026-08-22 14:12",status:"審査待ち"},
  {id:902,type:"病院",name:"湘南救急総合病院",meta:"神奈川県 / 申請 2026-08-22 11:03",status:"審査待ち"},
  {id:903,type:"公募",name:"2028年度 初期臨床研修医募集",meta:"名古屋中央病院 / 申請 2026-08-21 18:40",status:"審査待ち"}
];

function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function fmtDate(v){ if(!v) return "—"; const [y,m,d]=v.split("-"); return `${y}/${m}/${d}`; }
function selectOptions(items, selected="", blank="選択してください"){
  return `<option value="">${blank}</option>` + items.map(v=>`<option value="${esc(v)}" ${String(v)===String(selected)?"selected":""}>${esc(v)}</option>`).join("");
}
function toast(msg){
  const root=document.getElementById("toast-root");
  const el=document.createElement("div");el.className="toast";el.textContent=msg;root.appendChild(el);
  setTimeout(()=>el.remove(),2400);
}
function setRole(role){
  state.role=role; state.page=role==="student"?"home":"dashboard";
  localStorage.setItem("mm_role",role); localStorage.setItem("mm_page",state.page); render();
}
function navigate(page){
  state.page=page;localStorage.setItem("mm_page",page);window.scrollTo({top:0,behavior:"instant"});render();
}
function toggleFavorite(id){
  state.favorites = state.favorites.includes(id) ? state.favorites.filter(x=>x!==id) : [...state.favorites,id];
  localStorage.setItem("mm_favorites",JSON.stringify(state.favorites));render();toast("お気に入りを更新しました");
}
function applyJob(id){
  if(!state.applications.includes(id)) state.applications.push(id);
  localStorage.setItem("mm_apps",JSON.stringify(state.applications));closeModal();render();toast("応募情報を登録しました");
}
function showJob(id){
  const j=jobs.find(x=>x.id===id); if(!j)return;
  openModal(`
    <div class="modal-head"><h3>${esc(j.title)}</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="job-hospital" style="margin-bottom:12px">${esc(j.hospital)}</div>
      <dl class="detail-grid">
        <dt>募集区分</dt><dd>${esc(j.type)}</dd>
        <dt>勤務地</dt><dd>${esc(j.pref)}</dd>
        <dt>対象</dt><dd>${esc(j.target)}</dd>
        <dt>募集人数</dt><dd>${j.positions}名</dd>
        <dt>診療科</dt><dd>${j.specialties.map(esc).join("、")}</dd>
        <dt>応募締切</dt><dd>${fmtDate(j.deadline)}</dd>
        <dt>掲載日</dt><dd>${fmtDate(j.posted)}</dd>
      </dl>
      <div class="detail-description"><strong>公募概要</strong><br>${esc(j.summary)}<br><br>
      実際の運用では、ここに給与、勤務時間、研修プログラム、選考方法、必要書類、病院URLなどを表示します。</div>
    </div>
    <div class="modal-actions">
      <button class="btn" onclick="toggleFavorite(${j.id});closeModal()">${state.favorites.includes(j.id)?"お気に入り解除":"お気に入り保存"}</button>
      <button class="btn primary" onclick="applyJob(${j.id})">${state.applications.includes(j.id)?"応募済み":"応募する"}</button>
    </div>
  `);
}
function openModal(html){
  const div=document.createElement("div");div.className="modal-backdrop";div.id="modal-root";
  div.innerHTML=`<div class="modal">${html}</div>`;div.addEventListener("click",e=>{if(e.target===div)closeModal()});
  document.body.appendChild(div);
}
function closeModal(){document.getElementById("modal-root")?.remove()}

function header(){
  const roleLabel={student:"医学生",hospital:"病院",admin:"運営"}[state.role];
  return `
  <header class="site-header">
    <div class="utility-bar">
      <div class="utility-inner">
        <div>医学生と病院をつなぐ公募・採用支援プラットフォーム</div>
        <div class="utility-links">
          <span>ヘルプ</span><span>お問い合わせ</span>
          <div class="role-preview" aria-label="デモ表示切替">
            ${["student","hospital","admin"].map(r=>`<button class="${state.role===r?"active":""}" onclick="setRole('${r}')">${{student:"医学生",hospital:"病院",admin:"運営"}[r]}</button>`).join("")}
          </div>
        </div>
      </div>
    </div>
    <div class="header-inner">
      <button class="brand" onclick="navigate('${state.role==="student"?"home":"dashboard"}')" style="border:0;background:transparent;padding:0">
        <div class="brand-mark">M</div>
        <div><div class="brand-name">MedMatch</div><div class="brand-tag">Medical Student × Hospital Matching Platform</div></div>
      </button>
      <div class="header-actions">
        <span style="font-size:12px;color:#667085">${roleLabel}としてログイン中</span>
        <button class="btn">登録情報</button><button class="btn primary">${state.role==="hospital"?"公募を登録":"マイページ"}</button>
      </div>
    </div>
    <nav class="public-nav">
      <div class="public-nav-inner">
        ${publicNav()}
      </div>
    </nav>
  </header>`;
}
function publicNav(){
  if(state.role==="student") return `
    <button class="${state.page==="home"?"active":""}" onclick="navigate('home')">求人を探す</button>
    <button class="${state.page==="saved"?"active":""}" onclick="navigate('saved')">保存した検索条件</button>
    <button onclick="navigate('favorites')">お気に入り</button>
    <button onclick="navigate('applications')">応募管理</button>`;
  if(state.role==="hospital") return `
    <button onclick="navigate('dashboard')">病院マイページ</button><button onclick="navigate('jobs')">公募管理</button>
    <button onclick="navigate('student-search')">学生を探す</button><button onclick="navigate('hospital-apps')">応募者管理</button>`;
  return `<button onclick="navigate('dashboard')">管理ダッシュボード</button><button onclick="navigate('approvals')">承認管理</button><button onclick="navigate('users')">ユーザー管理</button>`;
}

function sidebar(){
  const student=[
    ["求人を探す",[["home","求人検索"],["saved","保存した検索条件"],["favorites","お気に入り"]]],
    ["応募・連絡",[["applications","応募管理"],["scouts","スカウト"],["messages","メッセージ"]]],
    ["登録情報",[["profile","プロフィール"],["settings","公開・通知設定"]]]
  ];
  const hospital=[
    ["病院マイページ",[["dashboard","ダッシュボード"]]],
    ["公募管理",[["jobs","公募一覧"],["job-new","新規公募登録"]]],
    ["学生を探す",[["student-search","学生検索"],["student-favorites","お気に入り学生"],["scout-send","スカウト送信"]]],
    ["選考管理",[["hospital-apps","応募者管理"],["messages","メッセージ"]]],
    ["病院情報",[["hospital-profile","病院情報・公開設定"]]]
  ];
  const admin=[
    ["運営",[["dashboard","ダッシュボード"],["approvals","承認管理"]]],
    ["管理",[["users","ユーザー管理"],["job-review","公募監視"],["reports","通報・問い合わせ"]]],
    ["設定",[["announcements","お知らせ管理"],["admin-settings","システム設定"]]]
  ];
  const groups=state.role==="student"?student:state.role==="hospital"?hospital:admin;
  return `<aside class="sidebar">
    <div class="side-card">
      <div class="side-title">${{student:"医学生マイページ",hospital:"病院管理画面",admin:"運営管理画面"}[state.role]}</div>
      <ul class="side-menu">
        ${groups.map(([label,items])=>`<div class="side-section-label">${label}</div>${items.map(([p,l])=>`<li><button class="${state.page===p?"active":""}" onclick="navigate('${p}')">${l}</button></li>`).join("")}`).join("")}
      </ul>
    </div>
    ${state.role==="student"?`
    <div class="side-card"><div class="side-title">プロフィール</div><div class="side-status">
      <strong>完成度 83%</strong><p>病院側の検索に表示される情報を確認してください。</p>
      <div class="progress"><span style="width:83%"></span></div>
      <button class="btn sm block" style="margin-top:10px" onclick="navigate('profile')">プロフィールを編集</button>
    </div></div>`:""}
  </aside>`;
}
function shell(content){
  return `${header()}<div class="layout">${sidebar()}<main class="content">${content}</main></div>${footer()}`;
}
function footer(){return `<footer><div class="footer-inner"><div class="footer-top"><div>© 2026 MedMatch Demo</div><div class="footer-links"><span>利用規約</span><span>プライバシーポリシー</span><span>運営会社</span><span>お問い合わせ</span></div></div></div></footer>`}
function pageHead(title,sub="",actions=""){return `<div class="breadcrumb">MedMatch &gt; ${esc(title)}</div><div class="page-head"><div><h1>${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:""}</div>${actions?`<div class="page-actions">${actions}</div>`:""}</div>`}

function homePage(){
  return `${header()}
  <section class="hero"><div class="hero-inner">
    <div class="hero-copy"><div class="hero-kicker">医学生向け</div><h1>研修先・病院見学・実習の公募を探す</h1>
      <p>条件を指定して、公募情報を検索できます。検索条件は保存して再利用できます。</p></div>
    ${jobSearchPanel()}
    <div class="notice-strip"><span class="notice-label">お知らせ</span><span>2026/08/22　MedMatch試験運用版：病院公募・学生スカウト機能のUIを更新しました。</span></div>
  </div></section>
  <div class="layout">${sidebar()}<main class="content">
    ${pageHead("新着公募","直近に掲載された公募情報です。")}
    ${jobResults(jobs.slice(0,4))}
  </main></div>${footer()}`;
}
function jobSearchPanel(){
  return `<div class="search-panel">
    <div class="search-panel-title"><h2>求人・研修情報検索</h2><div class="result-count">公開中 <strong>${jobs.length}</strong> 件</div></div>
    <form class="search-body" id="job-search-form" onsubmit="runJobSearch(event)">
      <div class="search-grid">
        <div class="field wide"><label>フリーワード</label><input name="q" placeholder="病院名・診療科・研修プログラムなど"></div>
        <div class="field"><label>募集区分</label><select name="type">${selectOptions(["初期研修","病院見学","実習・インターン","説明会","その他"],"","すべて")}</select></div>
        <div class="field"><label>診療科</label><select name="specialty">${selectOptions(SPECIALTIES,"","すべて")}</select></div>
        <div class="field full"><label>勤務地</label><div class="area-buttons">${AREAS.map(a=>`<label><input type="checkbox" name="areas" value="${a}"><span>${a}</span></label>`).join("")}</div></div>
        <div class="field"><label>対象学年</label><div class="inline-fields"><select name="yearFrom">${selectOptions([1,2,3,4,5,6],"","指定なし")}</select><span class="inline-sep">〜</span><select name="yearTo">${selectOptions([1,2,3,4,5,6],"","指定なし")}</select></div></div>
        <div class="field"><label>卒業予定年度</label><select name="grad">${selectOptions([2027,2028,2029,2030,2031,2032],"","指定なし")}</select></div>
        <div class="field"><label>応募締切</label><select name="deadline">${selectOptions(["30日以内","60日以内","90日以内"],"","指定なし")}</select></div>
        <div class="field"><label>並び順</label><select name="sort"><option>新着順</option><option>締切が近い順</option></select></div>
      </div>
      <div class="search-actions"><button type="reset" class="btn">条件をクリア</button><button type="submit" class="btn navy lg">この条件で検索</button></div>
    </form>
  </div>`;
}
function runJobSearch(e){
  e.preventDefault();const fd=new FormData(e.target);
  const q=(fd.get("q")||"").toLowerCase(),type=fd.get("type"),sp=fd.get("specialty"),grad=fd.get("grad");
  const areas=fd.getAll("areas");
  const filtered=jobs.filter(j=>
    (!q || `${j.title} ${j.hospital} ${j.summary}`.toLowerCase().includes(q)) &&
    (!type || j.type===type) && (!sp || j.specialties.includes(sp)) && (!grad || j.grad===grad) &&
    (!areas.length || areas.includes(j.area))
  );
  state.lastSearch={q,type,sp,grad,areas,ids:filtered.map(x=>x.id)};
  state.page="search-results";render();
}
function jobResults(list){
  if(!list.length)return `<div class="empty"><strong>該当する公募はありません</strong>条件を変更して再検索してください。</div>`;
  return `<div class="job-list">${list.map(j=>`
    <article class="job-item">
      <div class="job-main">
        <div class="job-topline">${j.new?`<span class="badge new">NEW</span>`:""}<span class="badge open">${esc(j.status)}</span><span class="badge">${esc(j.type)}</span></div>
        <button onclick="showJob(${j.id})" class="job-title" style="border:0;background:transparent;padding:0;text-align:left">${esc(j.title)}</button>
        <div class="job-hospital">${esc(j.hospital)}</div>
        <div class="job-meta">
          <div class="meta-row"><span class="meta-label">勤務地</span><span>${esc(j.pref)}</span></div>
          <div class="meta-row"><span class="meta-label">募集対象</span><span>${esc(j.target)}</span></div>
          <div class="meta-row"><span class="meta-label">募集人数</span><span>${j.positions}名</span></div>
          <div class="meta-row"><span class="meta-label">診療科</span><span>${j.specialties.map(esc).join("・")}</span></div>
        </div>
      </div>
      <div class="job-side">
        <div class="deadline">応募締切<strong>${fmtDate(j.deadline)}</strong><span>掲載 ${fmtDate(j.posted)}</span></div>
        <div class="job-actions"><button class="btn sm ${state.favorites.includes(j.id)?"ghost-blue":""}" onclick="toggleFavorite(${j.id})">${state.favorites.includes(j.id)?"★ 保存済み":"☆ お気に入り"}</button><button class="btn primary sm" onclick="showJob(${j.id})">詳細を見る</button></div>
      </div>
    </article>`).join("")}</div>`;
}
function searchResultsPage(){
  const list=state.lastSearch?jobs.filter(j=>state.lastSearch.ids.includes(j.id)):jobs;
  const tags=[];
  if(state.lastSearch?.q) tags.push(`キーワード：${state.lastSearch.q}`);
  if(state.lastSearch?.type) tags.push(state.lastSearch.type);
  if(state.lastSearch?.sp) tags.push(state.lastSearch.sp);
  if(state.lastSearch?.grad) tags.push(`${state.lastSearch.grad}年度卒`);
  (state.lastSearch?.areas||[]).forEach(a=>tags.push(a));
  return shell(`${pageHead("求人検索結果","条件に合う公募情報を一覧表示しています。",`<button class="btn" onclick="navigate('home')">条件を変更</button>`)}
    <div class="filter-summary"><div><strong>現在の検索条件</strong><div class="filter-tags">${(tags.length?tags:["すべて"]).map(t=>`<span class="filter-tag">${esc(t)}</span>`).join("")}</div></div>
    <button class="btn sm" onclick="saveCurrentSearch()">この条件を保存</button></div>
    <div class="result-toolbar"><div><strong>${list.length}</strong> 件の公募</div><div class="toolbar-controls"><select><option>新着順</option><option>締切が近い順</option></select><select><option>20件表示</option><option>50件表示</option></select></div></div>
    ${jobResults(list)}`);
}
function saveCurrentSearch(){
  const item={id:Date.now(),name:`検索条件 ${state.savedSearches.length+1}`,criteria:state.lastSearch||{},created:new Date().toISOString().slice(0,10)};
  state.savedSearches.push(item);localStorage.setItem("mm_saved_searches",JSON.stringify(state.savedSearches));toast("検索条件を保存しました");
}
function savedPage(){
  return shell(`${pageHead("保存した検索条件","よく使う検索条件を保存し、新着公募の確認に利用できます。",`<button class="btn primary" onclick="navigate('home')">新しい条件で検索</button>`)}
  <div class="card"><div class="card-head"><h2>保存済み検索条件</h2><span style="font-size:11px;color:#667085">${state.savedSearches.length}件</span></div>
  <div class="card-body compact">${state.savedSearches.length?`<table class="data-table"><thead><tr><th>条件名</th><th>作成日</th><th>マッチング通知</th><th>操作</th></tr></thead><tbody>${state.savedSearches.map(s=>`<tr><td><div class="table-title">${esc(s.name)}</div><div class="table-sub">${esc([s.criteria.type,s.criteria.sp,s.criteria.grad,...(s.criteria.areas||[])].filter(Boolean).join(" / ")||"条件指定なし")}</div></td><td>${fmtDate(s.created)}</td><td><span class="badge open">受信する</span></td><td><button class="btn sm" onclick="state.lastSearch=${JSON.stringify(s.criteria).replace(/"/g,"&quot;")};navigate('search-results')">検索する</button></td></tr>`).join("")}</tbody></table>`:`<div class="empty"><strong>保存した検索条件はありません</strong>求人検索画面から条件を保存できます。</div>`}</div></div>`);
}
function favoritesPage(){return shell(`${pageHead("お気に入り","保存した公募情報です。")}${jobResults(jobs.filter(j=>state.favorites.includes(j.id)))}`)}
function applicationsPage(){
  const list=jobs.filter(j=>state.applications.includes(j.id));
  return shell(`${pageHead("応募管理","応募・見学申込の進捗を一覧で確認できます。")}
  <div class="tabs"><button class="active">すべて</button><button>応募済み</button><button>選考中</button><button>見学予定</button><button>完了</button></div>
  <div class="card"><div class="card-body compact">${list.length?`<table class="data-table"><thead><tr><th>公募</th><th>病院</th><th>応募日</th><th>ステータス</th><th>次の対応</th></tr></thead><tbody>${list.map(j=>`<tr><td><button style="border:0;background:transparent;color:#174b82;font-weight:800" onclick="showJob(${j.id})">${esc(j.title)}</button></td><td>${esc(j.hospital)}</td><td>2026/08/22</td><td><span class="badge warn">病院確認中</span></td><td>メッセージを確認</td></tr>`).join("")}</tbody></table>`:`<div class="empty"><strong>応募履歴はありません</strong>興味のある公募から応募できます。</div>`}</div></div>`);
}
function simpleStudentPage(title,text){
  return shell(`${pageHead(title,text)}<div class="empty"><strong>${esc(title)}</strong>この試作版では画面構成まで実装しています。本番ではSupabaseのデータを接続します。</div>`);
}

function profilePage(){
  const p=state.profile;
  const years=[];for(let y=2026;y<=2037;y++)years.push(y);
  return shell(`${pageHead("プロフィール","病院の学生検索・スカウトに利用される情報を登録します。")}
  <form class="card" onsubmit="saveProfile(event)">
    <div class="card-head"><h2>基本情報</h2><span class="badge">入力内容は公開設定に従います</span></div>
    <div class="form-section"><div class="form-grid">
      <div class="field full"><label>大学<span class="req">必須</span></label><input name="university" list="universities" value="${esc(p.university)}" placeholder="大学名を入力すると候補が表示されます" required>
        <datalist id="universities">${MED_UNIVERSITIES.map(x=>`<option value="${esc(x)}"></option>`).join("")}</datalist><div class="field-help">候補外の大学名も直接入力できます。</div></div>
      <div class="field"><label>学年<span class="req">必須</span></label><select name="schoolYear" required>${selectOptions([1,2,3,4,5,6],p.schoolYear)}</select></div>
      <div class="field"><label>卒業予定年度<span class="req">必須</span></label><select name="graduationYear" required>${selectOptions(years,p.graduationYear)}</select></div>
      <div class="field full"><label>希望診療科<span class="req">1つ以上</span></label><div class="check-row">${SPECIALTIES.map(x=>`<label class="check"><input type="checkbox" name="specialties" value="${esc(x)}" ${p.specialties.includes(x)?"checked":""}>${esc(x)}</label>`).join("")}</div></div>
      <div class="field full"><label>希望地域<span class="req">1つ以上</span></label><div class="area-buttons">${AREAS.map(x=>`<label><input type="checkbox" name="areas" value="${esc(x)}" ${p.areas.includes(x)?"checked":""}><span>${esc(x)}</span></label>`).join("")}</div></div>
      <div class="field full"><label>自己紹介<span class="optional">任意</span></label><textarea name="bio" maxlength="800">${esc(p.bio)}</textarea><div class="field-help">興味のある診療科、研修で重視したいこと、将来像など。</div></div>
    </div></div>
    <div class="card-head"><h2>公開・スカウト設定</h2></div>
    <div class="form-section">
      ${switchHtml("scout","スカウトを受け取る","病院からの新しいスカウト対象になります。",p.scout)}
      ${switchHtml("universityVisible","大学名を公開","学生検索結果に大学名を表示します。",p.universityVisible)}
      ${switchHtml("nameVisible","氏名を公開","スカウト前の病院にも氏名を表示します。通常は非公開を推奨します。",p.nameVisible)}
    </div>
    <div class="form-actions"><button type="button" class="btn">キャンセル</button><button class="btn primary" type="submit">変更を保存</button></div>
  </form>`);
}
function switchHtml(id,title,desc,checked){return `<div class="switch-row"><div class="switch-copy"><strong>${esc(title)}</strong><small>${esc(desc)}</small></div><label class="toggle"><input name="${id}" type="checkbox" ${checked?"checked":""}><span></span></label></div>`}
function saveProfile(e){
  e.preventDefault();const f=e.target,fd=new FormData(f);
  const specialties=fd.getAll("specialties"),areas=fd.getAll("areas");
  if(!specialties.length||!areas.length){toast("希望診療科と希望地域を1つ以上選択してください");return}
  state.profile={university:fd.get("university").trim(),schoolYear:fd.get("schoolYear"),graduationYear:fd.get("graduationYear"),
    specialties,areas,bio:fd.get("bio").trim(),scout:fd.has("scout"),universityVisible:fd.has("universityVisible"),nameVisible:fd.has("nameVisible")};
  localStorage.setItem("mm_profile",JSON.stringify(state.profile));toast("プロフィールを保存しました");render();
}

function hospitalDashboard(){
  return shell(`${pageHead("病院ダッシュボード","公募・応募・スカウトの状況をまとめて確認できます。",`<button class="btn primary" onclick="navigate('job-new')">＋ 新規公募登録</button>`)}
  <div class="dashboard-grid">
    ${stat("公開中の公募","2","下書き 1件")}${stat("新着応募","5","未確認 3件")}${stat("お気に入り登録","55","直近30日")}${stat("スカウト返信","8","返信率 40%")}
  </div>
  <div class="card"><div class="card-head"><h2>対応が必要な項目</h2></div><div class="card-body compact">
    <table class="data-table"><thead><tr><th>種別</th><th>内容</th><th>期限・日時</th><th>状態</th></tr></thead><tbody>
      <tr><td>応募</td><td><div class="table-title">初期研修医募集に新着応募 3件</div></td><td>本日</td><td><span class="badge danger">未確認</span></td></tr>
      <tr><td>公募</td><td><div class="table-title">救急科 病院見学会</div></td><td>2026/09/20締切</td><td><span class="badge warn">締切29日前</span></td></tr>
      <tr><td>スカウト</td><td><div class="table-title">送信済みスカウトへの返信 2件</div></td><td>昨日</td><td><span class="badge new">返信あり</span></td></tr>
    </tbody></table>
  </div></div>
  <div class="card"><div class="card-head"><h2>最近の動き</h2></div><div class="card-body"><div class="timeline">
    ${timeline("16:20","医学部5年の学生から応募","2028年度 初期臨床研修医募集")}
    ${timeline("14:05","スカウトに返信がありました","北海道大学・医学部5年")}
    ${timeline("昨日","公募がお気に入り登録されました","救急科 病院見学会")}
  </div></div></div>`);
}
function stat(label,value,note){return `<div class="stat-card"><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-note">${note}</div></div>`}
function timeline(time,title,text){return `<div class="timeline-item"><div class="timeline-time">${time}</div><div class="timeline-main"><strong>${title}</strong><p>${text}</p></div></div>`}

function hospitalJobsPage(){
  return shell(`${pageHead("公募管理","掲載中・下書き・終了した公募を管理します。",`<button class="btn primary" onclick="navigate('job-new')">＋ 新規公募登録</button>`)}
  <div class="filters-bar"><button class="btn sm navy">すべて 3</button><button class="btn sm">公開中 2</button><button class="btn sm">下書き 1</button><button class="btn sm">募集終了 0</button></div>
  <div class="card"><div class="card-body compact"><table class="data-table"><thead><tr><th>公募ID / タイトル</th><th>状態</th><th>閲覧</th><th>お気に入り</th><th>応募</th><th>締切</th><th>操作</th></tr></thead><tbody>
  ${hospitalJobs.map(j=>`<tr><td><div class="table-title">${esc(j.title)}</div><div class="table-sub">${j.id}</div></td><td><span class="badge ${j.status==="公開中"?"open":"gray"}">${j.status}</span></td><td>${j.views}</td><td>${j.favorites}</td><td><strong>${j.apps}</strong></td><td>${j.deadline}</td><td><button class="btn sm">編集</button></td></tr>`).join("")}
  </tbody></table></div></div>`);
}
function newJobPage(){
  return shell(`${pageHead("新規公募登録","初期研修、病院見学、実習などの募集情報を登録します。")}
  <form class="card" onsubmit="createJob(event)">
    <div class="card-head"><h2>公募基本情報</h2></div>
    <div class="form-section"><div class="form-grid">
      <div class="field full"><label>公募タイトル<span class="req">必須</span></label><input name="title" required placeholder="例：2028年度 初期臨床研修医募集"></div>
      <div class="field"><label>募集区分<span class="req">必須</span></label><select required>${selectOptions(["初期研修","病院見学","実習・インターン","説明会","その他"])}</select></div>
      <div class="field"><label>募集人数<span class="optional">任意</span></label><input type="number" min="1" placeholder="例：10"></div>
      <div class="field"><label>対象学年</label><div class="inline-fields"><select>${selectOptions([1,2,3,4,5,6],"","指定なし")}</select><span class="inline-sep">〜</span><select>${selectOptions([1,2,3,4,5,6],"","指定なし")}</select></div></div>
      <div class="field"><label>対象卒業年度</label><select>${selectOptions([2027,2028,2029,2030,2031],"","指定なし")}</select></div>
      <div class="field full"><label>対象診療科</label><div class="check-row">${SPECIALTIES.map(s=>`<label class="check"><input type="checkbox">${s}</label>`).join("")}</div></div>
      <div class="field"><label>勤務地（都道府県）<span class="req">必須</span></label><select required>${selectOptions(PREFECTURES)}</select></div>
      <div class="field"><label>応募締切<span class="req">必須</span></label><input type="date" required></div>
      <div class="field full"><label>公募概要<span class="req">必須</span></label><textarea required placeholder="研修プログラムの特徴、対象、選考方法などを記載"></textarea></div>
      <div class="field full"><label>応募方法・必要書類</label><textarea placeholder="履歴書、成績証明書、応募フォームなど"></textarea></div>
    </div></div>
    <div class="form-actions"><button class="btn" type="button" onclick="toast('下書き保存しました')">下書き保存</button><button class="btn primary" type="submit">確認して申請</button></div>
  </form>`);
}
function createJob(e){e.preventDefault();toast("公募を審査申請しました");navigate("jobs")}

function studentSearchPage(){
  return shell(`${pageHead("学生検索","公開プロフィールから、条件に合う医学生を検索できます。")}
  <div class="card"><div class="card-head"><h2>検索条件</h2></div><form class="card-body" onsubmit="searchStudents(event)">
    <div class="search-grid">
      <div class="field wide"><label>大学</label><input name="univ" list="uni-hospital" placeholder="大学名を入力すると候補が表示されます"><datalist id="uni-hospital">${MED_UNIVERSITIES.map(x=>`<option value="${x}"></option>`).join("")}</datalist></div>
      <div class="field"><label>学年</label><select name="year">${selectOptions([1,2,3,4,5,6],"","指定なし")}</select></div>
      <div class="field"><label>卒業予定年度</label><select name="grad">${selectOptions([2027,2028,2029,2030,2031],"","指定なし")}</select></div>
      <div class="field"><label>希望診療科</label><select name="sp">${selectOptions(SPECIALTIES,"","指定なし")}</select></div>
      <div class="field"><label>希望地域</label><select name="area">${selectOptions(AREAS,"","指定なし")}</select></div>
      <div class="field wide"><label>その他</label><label class="check"><input type="checkbox" name="scout" checked> スカウト受付中のみ</label></div>
    </div>
    <div class="search-actions"><button type="reset" class="btn">クリア</button><button class="btn navy" type="submit">学生を検索</button></div>
  </form></div>
  <div id="student-results" style="margin-top:14px">${studentResults(students)}</div>`);
}
function searchStudents(e){
  e.preventDefault();const fd=new FormData(e.target);const univ=fd.get("univ"),year=fd.get("year"),grad=fd.get("grad"),sp=fd.get("sp"),area=fd.get("area");
  const list=students.filter(s=>(!univ||s.university.includes(univ))&&(!year||String(s.year)===year)&&(!grad||String(s.grad)===grad)&&(!sp||s.specialties.includes(sp))&&(!area||s.areas.includes(area)));
  document.getElementById("student-results").innerHTML=studentResults(list);
}
function studentResults(list){
  return `<div class="result-toolbar"><div><strong>${list.length}</strong> 人</div><div class="toolbar-controls"><select><option>最終更新が新しい順</option><option>卒業年度順</option></select></div></div>
  ${list.length?`<div class="student-list">${list.map(s=>`<div class="student-row">
    <div class="avatar">${s.name.split(".").join("")}</div><div><div class="student-name">${esc(s.university)} 医学部${s.year}年</div>
    <div class="student-details"><span>卒業予定：${s.grad}年度</span><span>最終更新：${fmtDate(s.last)}</span><span class="badge open">スカウト受付中</span></div>
    <div class="student-preferences"><strong>希望診療科：</strong>${s.specialties.join("・")}　 <strong>希望地域：</strong>${s.areas.join("・")}</div></div>
    <div class="student-actions"><button class="btn sm">☆ お気に入り</button><button class="btn primary sm" onclick="toast('スカウト作成画面を開きます')">スカウトする</button></div>
  </div>`).join("")}</div>`:`<div class="empty"><strong>該当する学生はいません</strong>条件を広げて検索してください。</div>`}`;
}
function hospitalAppsPage(){
  return shell(`${pageHead("応募者管理","応募者の確認、選考ステータス、連絡を一元管理します。")}
  <div class="tabs"><button class="active">新着 5</button><button>書類確認</button><button>見学調整</button><button>選考中</button><button>完了</button></div>
  <div class="card"><div class="card-body compact"><table class="data-table"><thead><tr><th>応募者</th><th>応募公募</th><th>応募日</th><th>状態</th><th>操作</th></tr></thead><tbody>
  <tr><td><div class="table-title">北海道大学 医学部5年</div><div class="table-sub">2028年度卒業予定</div></td><td>2028年度 初期臨床研修医募集</td><td>2026/08/22</td><td><span class="badge new">新着</span></td><td><button class="btn sm">応募内容を見る</button></td></tr>
  <tr><td><div class="table-title">東北大学 医学部6年</div><div class="table-sub">2027年度卒業予定</div></td><td>救急科 病院見学会</td><td>2026/08/21</td><td><span class="badge warn">日程調整</span></td><td><button class="btn sm">メッセージ</button></td></tr>
  </tbody></table></div></div>`);
}

function adminDashboard(){
  return shell(`${pageHead("管理ダッシュボード","病院承認、公募審査、ユーザー状況を確認します。")}
  <div class="dashboard-grid">${stat("審査待ち病院","2","本日 +2")}${stat("審査待ち公募","1","本日 +1")}${stat("公開中公募","128","病院 42施設")}${stat("登録学生","1,436","今月 +86")}</div>
  <div class="card"><div class="card-head"><h2>承認待ち</h2><button class="btn sm" onclick="navigate('approvals')">すべて見る</button></div><div class="card-body compact">${approvalRows(approvals)}</div></div>
  <div class="card"><div class="card-head"><h2>システム状況</h2></div><div class="card-body"><div class="timeline">
    ${timeline("17:20","病院アカウントが新規登録されました","湘南救急総合病院")}
    ${timeline("16:05","公募の審査申請がありました","名古屋中央病院")}
    ${timeline("14:50","学生プロフィールが更新されました","公開プロフィール")}
  </div></div></div>`);
}
function approvalRows(list){
  return list.map(a=>`<div class="approval-row" id="approval-${a.id}"><div><div class="approval-name">${esc(a.name)}</div><div class="approval-meta">${esc(a.meta)}</div></div><div><span class="badge warn">${a.type} / ${a.status}</span></div><div class="approval-actions"><button class="btn sm" onclick="toast('詳細確認画面を開きます')">詳細確認</button><button class="btn primary sm" onclick="approve(${a.id})">承認</button><button class="btn danger sm" onclick="reject(${a.id})">差戻し</button></div></div>`).join("");
}
function approvalsPage(){
  return shell(`${pageHead("承認管理","病院登録と公募掲載の承認・差戻しを行います。")}
  <div class="tabs"><button class="active">すべて ${approvals.length}</button><button>病院 2</button><button>公募 1</button><button>差戻し</button></div>
  <div class="card"><div class="card-head"><h2>審査待ち一覧</h2></div><div class="card-body compact">${approvalRows(approvals)}</div></div>`);
}
function approve(id){document.getElementById(`approval-${id}`)?.remove();toast("承認しました")}
function reject(id){document.getElementById(`approval-${id}`)?.remove();toast("差戻しにしました")}
function usersPage(){
  return shell(`${pageHead("ユーザー管理","学生・病院・管理者アカウントを検索・確認します。")}
  <div class="card"><div class="card-head"><h2>ユーザー検索</h2></div><div class="card-body"><div class="search-grid">
    <div class="field wide"><label>氏名・メール・施設名</label><input placeholder="検索キーワード"></div><div class="field"><label>種別</label><select><option>すべて</option><option>医学生</option><option>病院</option><option>管理者</option></select></div><div class="field"><label>状態</label><select><option>すべて</option><option>有効</option><option>停止中</option></select></div></div>
    <div class="search-actions"><button class="btn navy">検索</button></div></div></div>
  <div class="card"><div class="card-body compact"><table class="data-table"><thead><tr><th>ID</th><th>種別</th><th>表示名</th><th>登録日</th><th>状態</th><th>操作</th></tr></thead><tbody>
  <tr><td>ST-2831</td><td>医学生</td><td>北海道大学 医学部5年</td><td>2026/08/14</td><td><span class="badge open">有効</span></td><td><button class="btn sm">詳細</button></td></tr>
  <tr><td>HP-0108</td><td>病院</td><td>東京中央総合病院</td><td>2026/08/10</td><td><span class="badge open">承認済み</span></td><td><button class="btn sm">詳細</button></td></tr>
  <tr><td>AD-0002</td><td>管理者</td><td>運営管理者</td><td>2026/08/01</td><td><span class="badge open">有効</span></td><td><button class="btn sm">詳細</button></td></tr>
  </tbody></table></div></div>`);
}

function render(){
  let html="";
  if(state.role==="student"){
    if(state.page==="home") html=homePage();
    else if(state.page==="search-results") html=searchResultsPage();
    else if(state.page==="saved") html=savedPage();
    else if(state.page==="favorites") html=favoritesPage();
    else if(state.page==="applications") html=applicationsPage();
    else if(state.page==="profile") html=profilePage();
    else if(state.page==="scouts") html=simpleStudentPage("スカウト","病院から届いたスカウトを確認します。");
    else if(state.page==="messages") html=simpleStudentPage("メッセージ","病院との連絡を一覧で確認します。");
    else html=simpleStudentPage("公開・通知設定","プロフィール公開範囲と通知方法を設定します。");
  } else if(state.role==="hospital"){
    if(state.page==="dashboard") html=hospitalDashboard();
    else if(state.page==="jobs") html=hospitalJobsPage();
    else if(state.page==="job-new") html=newJobPage();
    else if(state.page==="student-search") html=studentSearchPage();
    else if(state.page==="hospital-apps") html=hospitalAppsPage();
    else html=simpleStudentPage(
      {"student-favorites":"お気に入り学生","scout-send":"スカウト送信","messages":"メッセージ","hospital-profile":"病院情報・公開設定"}[state.page]||"病院管理",
      "病院向け機能の管理画面です。"
    );
  } else {
    if(state.page==="dashboard") html=adminDashboard();
    else if(state.page==="approvals") html=approvalsPage();
    else if(state.page==="users") html=usersPage();
    else html=simpleStudentPage(
      {"job-review":"公募監視","reports":"通報・問い合わせ","announcements":"お知らせ管理","admin-settings":"システム設定"}[state.page]||"運営管理",
      "運営者向け管理機能です。"
    );
  }
  document.getElementById("app").innerHTML=html;
}
render();
