
"use strict";

const JOBS = [
  {id:1,new:true,title:"2028年度 初期臨床研修医募集",hospital:"東京中央総合病院",pref:"東京都",area:"関東",type:"初期研修",target:"医学部5〜6年",grad:"2028",specialties:["総合診療","救急","内科"],positions:12,deadline:"2026-10-31"},
  {id:2,new:true,title:"病院見学・初期研修説明会",hospital:"横浜みなと市民病院",pref:"神奈川県",area:"関東",type:"病院見学",target:"医学部4〜6年",grad:"",specialties:["救急","外科"],positions:30,deadline:"2026-09-20"},
  {id:3,new:false,title:"2028年度 初期研修プログラム",hospital:"札幌北医療センター",pref:"北海道",area:"北海道",type:"初期研修",target:"医学部5〜6年",grad:"2028",specialties:["内科","小児科","総合診療"],positions:8,deadline:"2026-11-15"},
  {id:4,new:false,title:"救急科 1日インターンシップ",hospital:"大阪ベイ救命救急センター",pref:"大阪府",area:"近畿",type:"実習・インターン",target:"医学部4〜6年",grad:"",specialties:["救急","麻酔科"],positions:20,deadline:"2026-09-10"}
];

const UNIVERSITIES = [
  "北海道大学","札幌医科大学","旭川医科大学","東北大学","筑波大学","群馬大学","千葉大学","東京大学",
  "東京科学大学","東京医科大学","東京慈恵会医科大学","日本医科大学","順天堂大学","慶應義塾大学",
  "横浜市立大学","新潟大学","金沢大学","信州大学","名古屋大学","京都大学","大阪大学","神戸大学",
  "岡山大学","広島大学","徳島大学","九州大学","長崎大学","熊本大学","鹿児島大学","琉球大学"
];

const state = {
  role: localStorage.getItem("mm_role") || "student",
  page: "home",
  favorites: JSON.parse(localStorage.getItem("mm_favs") || "[]"),
  applications: JSON.parse(localStorage.getItem("mm_apps") || "[]"),
  profile: JSON.parse(localStorage.getItem("mm_profile") || '{"university":"北海道大学","year":"5","grad":"2028","bio":""}')
};

function esc(v){return String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800);}
function fmtDate(v){const p=v.split("-");return `${p[0]}/${p[1]}/${p[2]}`;}

function jobCards(list){
  if(!list.length) return '<div class="empty">該当する公募はありません。条件を変更して検索してください。</div>';
  return list.map(j => `
    <article class="job">
      <div class="job-main">
        <div class="badges">${j.new?'<span class="badge new">NEW</span>':""}<span class="badge open">募集中</span><span class="badge">${esc(j.type)}</span></div>
        <button class="job-title" data-detail="${j.id}">${esc(j.title)}</button>
        <div class="hospital">${esc(j.hospital)}</div>
        <div class="meta">
          <div><b>勤務地</b><span>${esc(j.pref)}</span></div>
          <div><b>募集対象</b><span>${esc(j.target)}</span></div>
          <div><b>募集人数</b><span>${j.positions}名</span></div>
          <div><b>診療科</b><span>${j.specialties.map(esc).join("・")}</span></div>
        </div>
      </div>
      <div class="job-side">
        <div class="deadline">応募締切<strong>${fmtDate(j.deadline)}</strong></div>
        <div class="job-buttons">
          <button class="btn" data-fav="${j.id}">${state.favorites.includes(j.id)?"★ 保存済み":"☆ お気に入り"}</button>
          <button class="btn primary" data-detail="${j.id}">詳細を見る</button>
        </div>
      </div>
    </article>`).join("");
}

function renderJobs(list=JOBS){document.getElementById("jobList").innerHTML=jobCards(list);bindDynamic();}

function bindDynamic(){
  document.querySelectorAll("[data-fav]").forEach(b => b.onclick=() => {
    const id=Number(b.dataset.fav);
    state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];
    localStorage.setItem("mm_favs",JSON.stringify(state.favorites));
    renderPage(state.page);
    toast("お気に入りを更新しました");
  });
  document.querySelectorAll("[data-detail]").forEach(b => b.onclick=() => {
    const j=JOBS.find(x=>x.id===Number(b.dataset.detail));
    if(!j)return;
    alert(`${j.title}\n${j.hospital}\n\n勤務地: ${j.pref}\n対象: ${j.target}\n診療科: ${j.specialties.join("・")}\n応募締切: ${fmtDate(j.deadline)}`);
  });
}

function studentHome(){
  return `
  <section class="hero"><div class="wrap">
    <p class="eyebrow">医学生向け</p><h1>研修先・病院見学・実習の公募を探す</h1>
    <p class="lead">勤務地、診療科、学年、卒業年度などから公募情報を検索できます。</p>
    ${document.querySelector(".searchbox") ? document.querySelector(".searchbox").outerHTML : ""}
  </div></section>
  <div class="wrap two-col">${studentSide()}<section class="content"><div class="pagehead"><div><h2>新着公募</h2><p>直近に掲載された公募情報です。</p></div></div><div id="jobList"></div></section></div>`;
}
function studentSide(){
  return `<aside class="side"><div class="side-title">医学生マイページ</div>
    <button data-page="home">求人検索</button><button data-page="saved">保存した検索条件</button><button data-page="favorites">お気に入り</button>
    <div class="side-label">応募・連絡</div><button data-page="applications">応募管理</button><button data-page="scouts">スカウト</button><button data-page="messages">メッセージ</button>
    <div class="side-label">登録情報</div><button data-page="profile">プロフィール</button></aside>`;
}
function hospitalSide(){
  return `<aside class="side"><div class="side-title">病院管理画面</div>
    <button data-page="dashboard">ダッシュボード</button><button data-page="jobs">公募管理</button><button data-page="students">学生を探す</button>
    <button data-page="hospital-apps">応募者管理</button><button data-page="messages">メッセージ</button></aside>`;
}
function adminSide(){
  return `<aside class="side"><div class="side-title">運営管理画面</div>
    <button data-page="dashboard">ダッシュボード</button><button data-page="approvals">承認管理</button><button data-page="users">ユーザー管理</button>
    <button data-page="reports">通報・問い合わせ</button></aside>`;
}
function pagehead(title,sub){return `<div class="pagehead"><div><h2>${esc(title)}</h2><p>${esc(sub)}</p></div></div>`;}

function renderPage(page){
  state.page=page;
  const app=document.getElementById("app");

  if(state.role==="student"){
    if(page==="home"){
      app.innerHTML=studentHome();
      bindSearch();
      renderJobs();
    } else if(page==="favorites"){
      app.innerHTML=`<div class="wrap two-col">${studentSide()}<section class="content">${pagehead("お気に入り","保存した公募情報です。")}<div id="jobList"></div></section></div>`;
      renderJobs(JOBS.filter(j=>state.favorites.includes(j.id)));
    } else if(page==="applications"){
      app.innerHTML=`<div class="wrap two-col">${studentSide()}<section class="content">${pagehead("応募管理","応募・見学申込の進捗を確認できます。")}
      <table class="table"><thead><tr><th>公募</th><th>病院</th><th>状態</th></tr></thead><tbody>
      ${state.applications.length?state.applications.map(id=>{const j=JOBS.find(x=>x.id===id);return `<tr><td>${esc(j.title)}</td><td>${esc(j.hospital)}</td><td>病院確認中</td></tr>`}).join(""):'<tr><td colspan="3">応募履歴はありません。</td></tr>'}
      </tbody></table></section></div>`;
      bindNav();
    } else if(page==="profile"){
      app.innerHTML=`<div class="wrap two-col">${studentSide()}<section class="content">${pagehead("プロフィール","病院検索・スカウトに利用される情報を登録します。")}
      <form id="profileForm" class="card"><div class="profile-grid">
        <label class="field full"><span>大学</span><input name="university" list="uniList" value="${esc(state.profile.university)}" required><datalist id="uniList">${UNIVERSITIES.map(u=>`<option value="${esc(u)}"></option>`).join("")}</datalist></label>
        <label class="field"><span>学年</span><select name="year">${[1,2,3,4,5,6].map(y=>`<option value="${y}" ${String(y)===state.profile.year?"selected":""}>${y}年</option>`).join("")}</select></label>
        <label class="field"><span>卒業予定年度</span><select name="grad">${[2027,2028,2029,2030,2031,2032,2033].map(y=>`<option value="${y}" ${String(y)===state.profile.grad?"selected":""}>${y}年度</option>`).join("")}</select></label>
        <label class="field full"><span>自己紹介</span><textarea name="bio">${esc(state.profile.bio)}</textarea></label>
      </div><div class="profile-actions"><button class="btn primary" type="submit">変更を保存</button></div></form></section></div>`;
      bindNav();
      document.getElementById("profileForm").onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target);state.profile={university:fd.get("university"),year:fd.get("year"),grad:fd.get("grad"),bio:fd.get("bio")};localStorage.setItem("mm_profile",JSON.stringify(state.profile));toast("プロフィールを保存しました");};
    } else {
      app.innerHTML=`<div class="wrap two-col">${studentSide()}<section class="content">${pagehead(page==="saved"?"保存した検索条件":page==="scouts"?"スカウト":"メッセージ","この機能は次段階でSupabaseデータと接続します。")}<div class="empty">画面構成を準備済みです。</div></section></div>`;
      bindNav();
    }
  } else if(state.role==="hospital"){
    if(page==="students"){
      app.innerHTML=`<div class="wrap two-col">${hospitalSide()}<section class="content">${pagehead("学生を探す","大学・学年・卒業年度・希望診療科などで検索します。")}
      <div class="card"><div class="profile-grid"><label class="field full"><span>大学</span><input list="uniListH" placeholder="大学名を入力すると候補"><datalist id="uniListH">${UNIVERSITIES.map(u=>`<option value="${esc(u)}"></option>`).join("")}</datalist></label>
      <label class="field"><span>学年</span><select><option>指定なし</option>${[1,2,3,4,5,6].map(y=>`<option>${y}年</option>`).join("")}</select></label><label class="field"><span>卒業年度</span><select><option>指定なし</option><option>2027</option><option>2028</option><option>2029</option></select></label></div></div>
      <div class="card" style="margin-top:10px"><b>北海道大学 医学部5年</b><p>希望診療科：救急・総合診療　／　希望地域：関東・北海道</p><button class="btn primary" onclick="alert('スカウト作成')">スカウトする</button></div>
      </section></div>`;bindNav();
    } else if(page==="jobs"){
      app.innerHTML=`<div class="wrap two-col">${hospitalSide()}<section class="content">${pagehead("公募管理","掲載中・下書きの公募を管理します。")}
      <table class="table"><thead><tr><th>公募</th><th>状態</th><th>応募</th><th>締切</th></tr></thead><tbody><tr><td>2028年度 初期臨床研修医募集</td><td>公開中</td><td>12</td><td>2026/10/31</td></tr><tr><td>救急科 病院見学会</td><td>公開中</td><td>21</td><td>2026/09/20</td></tr></tbody></table></section></div>`;bindNav();
    } else {
      app.innerHTML=`<div class="wrap two-col">${hospitalSide()}<section class="content">${pagehead("病院ダッシュボード","公募・応募・スカウトの状況を確認します。")}<div class="card"><b>新着応募 5件</b><p>未確認 3件 ／ スカウト返信 2件</p></div></section></div>`;bindNav();
    }
  } else {
    const adminContent = page==="approvals"
      ? "<table class='table'><thead><tr><th>種別</th><th>申請</th><th>状態</th><th>操作</th></tr></thead><tbody><tr><td>病院</td><td>北関東地域医療センター</td><td>審査待ち</td><td><button class='btn primary' data-admin-approve='1'>承認</button></td></tr><tr><td>公募</td><td>2028年度 初期臨床研修医募集</td><td>審査待ち</td><td><button class='btn primary' data-admin-approve='1'>承認</button></td></tr></tbody></table>"
      : "<div class='card'><b>審査待ち病院 2件</b><p>審査待ち公募 1件 ／ 登録学生 1,436人</p></div>";
    app.innerHTML=`<div class="wrap two-col">${adminSide()}<section class="content">${pagehead(page==="approvals"?"承認管理":page==="users"?"ユーザー管理":"管理ダッシュボード","病院・公募・ユーザーを運営管理します.")}${adminContent}</section></div>`;
    bindNav();
    document.querySelectorAll("[data-admin-approve]").forEach(b=>b.onclick=()=>{b.closest("tr")?.remove();toast("承認しました");});
  }
  updateNav();
}

function bindNav(){
  document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>renderPage(b.dataset.page));
}
function bindSearch(){
  const form=document.getElementById("jobSearchForm"); if(!form)return;
  form.onsubmit=e=>{
    e.preventDefault();const fd=new FormData(form);const q=(fd.get("q")||"").toLowerCase();const type=fd.get("type"),sp=fd.get("specialty"),grad=fd.get("grad"),areas=fd.getAll("area");
    const list=JOBS.filter(j=>(!q||`${j.title} ${j.hospital}`.toLowerCase().includes(q))&&(!type||j.type===type)&&(!sp||j.specialties.includes(sp))&&(!grad||j.grad===grad)&&(!areas.length||areas.includes(j.area)));
    renderJobs(list);toast(`${list.length}件見つかりました`);
  };
}
function updateNav(){
  document.querySelectorAll(".side [data-page],#topNav [data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===state.page));
}

document.querySelectorAll("[data-role]").forEach(b=>b.onclick=()=>{
  state.role=b.dataset.role;localStorage.setItem("mm_role",state.role);
  document.querySelectorAll("[data-role]").forEach(x=>x.classList.toggle("active",x.dataset.role===state.role));
  renderRoleNav();renderPage(state.role==="student"?"home":"dashboard");
});
document.getElementById("brandHome").onclick=()=>renderPage(state.role==="student"?"home":"dashboard");
document.getElementById("mypageBtn").onclick=()=>renderPage(state.role==="student"?"profile":"dashboard");

function renderRoleNav(){
  const nav=document.querySelector("#topNav .nav-inner"); if(!nav)return;
  if(state.role==="student")nav.innerHTML='<button data-page="home">求人を探す</button><button data-page="favorites">お気に入り</button><button data-page="applications">応募管理</button><button data-page="profile">プロフィール</button>';
  else if(state.role==="hospital")nav.innerHTML='<button data-page="dashboard">病院マイページ</button><button data-page="jobs">公募管理</button><button data-page="students">学生を探す</button><button data-page="hospital-apps">応募者管理</button>';
  else nav.innerHTML='<button data-page="dashboard">管理ダッシュボード</button><button data-page="approvals">承認管理</button><button data-page="users">ユーザー管理</button><button data-page="reports">通報管理</button>';
  bindNav();
}
renderRoleNav();
document.querySelectorAll("[data-role]").forEach(x=>x.classList.toggle("active",x.dataset.role===state.role));
bindSearch();
renderJobs();
bindNav();
