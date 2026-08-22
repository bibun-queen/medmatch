"use strict";

const MEDICAL_UNIVERSITIES = [
  "北海道大学","札幌医科大学","旭川医科大学","弘前大学","岩手医科大学","東北大学","秋田大学","山形大学","福島県立医科大学","筑波大学","自治医科大学","獨協医科大学","群馬大学","埼玉医科大学","千葉大学","国際医療福祉大学","東京大学","東京科学大学","東京医科大学","東京慈恵会医科大学","日本医科大学","日本大学","東邦大学","昭和医科大学","帝京大学","杏林大学","順天堂大学","慶應義塾大学","東京女子医科大学","北里大学","東海大学","聖マリアンナ医科大学","横浜市立大学","新潟大学","富山大学","金沢大学","金沢医科大学","福井大学","山梨大学","信州大学","岐阜大学","浜松医科大学","名古屋大学","名古屋市立大学","愛知医科大学","藤田医科大学","三重大学","滋賀医科大学","京都大学","京都府立医科大学","大阪大学","大阪公立大学","関西医科大学","近畿大学","兵庫医科大学","神戸大学","奈良県立医科大学","和歌山県立医科大学","鳥取大学","島根大学","岡山大学","川崎医科大学","広島大学","山口大学","徳島大学","香川大学","愛媛大学","高知大学","九州大学","福岡大学","久留米大学","産業医科大学","佐賀大学","長崎大学","熊本大学","大分大学","宮崎大学","鹿児島大学","琉球大学"
];

const state = {
  role: "student",
  page: "dashboard",
  profile: loadProfile(),
  students: [
    {id:2831, university:"北海道大学", year:"医学部5年", grad:"2028", prefs:"救急 / 総合診療", area:"東京・神奈川", scout:true},
    {id:2914, university:"東北大学", year:"医学部5年", grad:"2028", prefs:"内科 / 感染症", area:"北海道・東京", scout:true},
    {id:3012, university:"札幌医科大学", year:"医学部4年", grad:"2029", prefs:"小児科", area:"北海道", scout:true}
  ],
  hospitals: [
    {name:"北星総合病院", area:"北海道札幌市", type:"市中病院", salary:"月給 45万円", oncall:"当直 月4回", emergency:"救急搬送 7,200件/年"},
    {name:"東京中央医療センター", area:"東京都", type:"市中病院", salary:"月給 50万円", oncall:"当直 月3回", emergency:"救急搬送 8,500件/年"},
    {name:"みなと大学病院", area:"神奈川県", type:"大学病院", salary:"月給 38万円", oncall:"当直 月2回", emergency:"救急搬送 5,900件/年"}
  ]
};

const nav = {
  student: [["dashboard","⌂","ホーム"],["hospitals","⌕","病院を探す"],["scouts","✉","スカウト"],["pipeline","▦","見学・応募管理"],["profile","◎","プロフィール"]],
  hospital: [["dashboard","⌂","ホーム"],["students","⌕","学生を探す"],["scouts","✉","スカウト管理"],["pipeline","▦","見学・応募管理"],["jobs","＋","募集管理"]],
  admin: [["dashboard","⌂","ダッシュボード"],["students","♙","医学生管理"],["hospitals","✚","病院管理"],["review","✓","審査"],["reports","!","通報・問い合わせ"],["audit","≡","操作ログ"]]
};

function loadProfile(){
  try{
    return Object.assign({university:"北海道大学",schoolYear:"5",graduationYear:"2028",specialty:"救急 / 総合診療",area:"東京 / 神奈川",bio:"救急・総合診療に興味があります。市中病院で幅広い症例を経験したいです。"}, JSON.parse(localStorage.getItem("medmatch_profile")||"{}"));
  }catch(e){return {university:"北海道大学",schoolYear:"5",graduationYear:"2028",specialty:"救急 / 総合診療",area:"東京 / 神奈川",bio:""};}
}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function badge(t,c=""){return `<span class="badge ${c}">${esc(t)}</span>`;}
function kpi(label,value,foot=""){return `<div class="card"><div class="kpi-label">${esc(label)}</div><div class="kpi-value">${esc(value)}</div>${foot?`<div class="kpi-foot">${esc(foot)}</div>`:""}</div>`;}
function field(label,options){return `<div class="field"><label>${esc(label)}</label><select>${options.map(x=>`<option>${esc(x)}</option>`).join("")}</select></div>`;}
function table(rows){const [head,...body]=rows;return `<div class="table-wrap"><table><thead><tr>${head.map(x=>`<th>${esc(x)}</th>`).join("")}</tr></thead><tbody>${body.map(r=>`<tr>${r.map((x,i)=>`<td>${i===0?`<strong>${esc(x)}</strong>`:esc(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;}

function setRole(role){
  state.role=role;state.page="dashboard";
  document.querySelectorAll(".role-btn").forEach(b=>b.classList.toggle("active",b.dataset.role===role));
  document.getElementById("userChip").textContent=role==="student"?"医学生 #2831":role==="hospital"?"北星総合病院 採用担当":"運営管理者";
  render();
}
function renderSidebar(){
  const s=document.getElementById("sidebar");
  s.innerHTML=`<div class="side-group"><div class="side-label">${state.role==="admin"?"管理":"メニュー"}</div>${nav[state.role].map(([id,icon,label])=>`<button class="nav-item ${state.page===id?"active":""}" data-page="${id}"><span class="nav-icon">${icon}</span><span class="nav-text">${label}</span></button>`).join("")}</div>`;
  s.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>{state.page=b.dataset.page;render();});
}
function listRow(icon,title,sub,status,color){return `<div class="list-row"><div class="row-main"><div class="avatar">${esc(icon)}</div><div><div class="row-title">${esc(title)}</div><div class="row-sub">${esc(sub)}</div></div></div>${badge(status,color)}</div>`;}

function studentDashboard(){return `<div class="page-head"><div><div class="page-title">ホーム</div><div class="page-sub">見学・スカウト・応募状況をまとめて確認できます。</div></div><div class="actions"><button class="btn primary" onclick="go('hospitals')">病院を探す</button></div></div><div class="notice">プロフィール完成度 80% — 希望勤務地と自己紹介を追加すると、病院から見つけてもらいやすくなります。</div><div class="grid cols-4">${kpi("新着スカウト","3件","+2 今週")}${kpi("見学予定","2件","次回 8/25")}${kpi("応募中","2件","1件 面接待ち")}${kpi("お気に入り","8件","+3 今月")}</div><div class="grid cols-2" style="margin-top:16px"><div class="card"><h3 class="section-title">次の予定</h3><div class="list">${listRow("8/25","北星総合病院","救急科 病院見学","承認済","green")}${listRow("9/3","東京中央医療センター","初期研修説明会","予約済","blue")}</div></div><div class="card"><h3 class="section-title">新着スカウト</h3><div class="list">${listRow("北","北星総合病院","救急志望プロフィールを拝見しました","未読","blue")}${listRow("東","東京中央医療センター","一度見学に来ませんか？","未読","blue")}${listRow("み","みなと大学病院","初期研修プログラムのご案内","既読","")}</div></div></div>`;}
function hospitalsPage(){return `<div class="page-head"><div><div class="page-title">病院を探す</div><div class="page-sub">希望条件から研修病院を検索します。</div></div></div><div class="card"><div class="search-panel">${field("地域",["全国","北海道","東京都","神奈川県"])}${field("希望診療科",["指定なし","救急","内科","外科","小児科"])}${field("病院種別",["指定なし","市中病院","大学病院"])}${field("卒業年度",["2027","2028","2029","2030","2031"])}</div><div class="actions"><button class="btn primary" onclick="toast('条件を適用しました')">検索</button><button class="btn">条件をリセット</button></div></div><div class="list" style="margin-top:16px">${state.hospitals.map(h=>`<div class="hospital-card"><div><div class="row-title" style="font-size:18px">${esc(h.name)}</div><div class="row-sub">${esc(h.area)}</div><div class="hospital-meta">${badge(h.type,"blue")}${badge(h.salary)}${badge(h.oncall)}${badge(h.emergency,"green")}</div></div><div class="actions"><button class="btn" onclick="toast('お気に入りに追加しました')">♡ お気に入り</button><button class="btn primary" onclick="openModal('見学申込','${esc(h.name)}へ病院見学を申し込みます。')">見学を申し込む</button></div></div>`).join("")}</div>`;}
function scoutsStudent(){return `<div class="page-head"><div><div class="page-title">スカウト</div><div class="page-sub">病院から届いたアプローチです。</div></div></div><div class="grid cols-3">${scoutCard("北星総合病院","救急志望プロフィールを拝見しました。年間7,200件の救急搬送を受け入れており、ぜひ一度見学にお越しいただきたいです。")}${scoutCard("東京中央医療センター","2028年度初期研修についてご案内します。総合診療・救急を重視する方に合うプログラムです。")}${scoutCard("みなと大学病院","大学病院での専門研修も視野に入れている学生向けに説明会を実施します。")}</div>`;}
function scoutCard(name,text){return `<div class="card"><div class="row-title">${esc(name)}</div><p class="muted" style="line-height:1.7">${esc(text)}</p><div class="actions"><button class="btn success" onclick="toast('「興味あり」を送信しました')">興味あり</button><button class="btn">辞退</button></div></div>`;}
function studentPipeline(){return `<div class="page-head"><div><div class="page-title">見学・応募管理</div><div class="page-sub">候補から選考までの状況を一元管理します。</div></div></div><div class="kanban">${kanbanCol("候補",["みなと大学病院","中央市民病院"])}${kanbanCol("見学予定",["北星総合病院","東京中央医療センター"])}${kanbanCol("応募済",["北海医療センター"])}${kanbanCol("選考中",["さくら総合病院"])}</div>`;}
function kanbanCol(title,items){return `<div class="kanban-col"><div class="kanban-head">${esc(title)}<span>${items.length}</span></div>${items.map((x,i)=>`<div class="kanban-card"><div class="row-title">${esc(x)}</div><div class="row-sub">${i%2?"次回連絡待ち":"更新 2日前"}</div></div>`).join("")}</div>`;}

function universityDatalist(){return `<datalist id="medicalUniversities">${MEDICAL_UNIVERSITIES.map(u=>`<option value="${esc(u)}"></option>`).join("")}</datalist>`;}
function profilePage(){
  const p=state.profile;
  const gradYears=[];for(let y=2027;y<=2036;y++)gradYears.push(y);
  return `<div class="page-head"><div><div class="page-title">プロフィール</div><div class="page-sub">病院に公開する情報を設定します。</div></div><div class="actions"><button class="btn primary" onclick="saveProfile()">保存</button></div></div><div class="grid cols-2"><div class="card"><h3 class="section-title">基本情報</h3>
  <div class="field" style="margin-bottom:12px"><label>大学</label><input id="profileUniversity" list="medicalUniversities" value="${esc(p.university)}" placeholder="大学名を入力すると候補が表示されます">${universityDatalist()}<div class="field-help">文字を入力すると医学部のある大学候補が表示されます。</div></div>
  <div class="field" style="margin-bottom:12px"><label>学年</label><select id="profileSchoolYear">${[1,2,3,4,5,6].map(y=>`<option value="${y}" ${String(y)===String(p.schoolYear)?"selected":""}>医学部${y}年</option>`).join("")}</select></div>
  <div class="field" style="margin-bottom:12px"><label>卒業予定年度</label><select id="profileGraduationYear">${gradYears.map(y=>`<option value="${y}" ${String(y)===String(p.graduationYear)?"selected":""}>${y}年度</option>`).join("")}</select></div>
  <div class="field" style="margin-bottom:12px"><label>希望診療科</label><input id="profileSpecialty" value="${esc(p.specialty)}"></div>
  <div class="field"><label>希望地域</label><input id="profileArea" value="${esc(p.area)}"></div></div>
  <div class="card"><h3 class="section-title">公開設定</h3>${toggleRow("大学名を公開",true)}${toggleRow("氏名を病院に公開",false)}${toggleRow("希望診療科を公開",true)}${toggleRow("希望地域を公開",true)}${toggleRow("スカウトを受け取る",true)}<div class="field" style="margin-top:14px"><label>自己紹介</label><textarea id="profileBio">${esc(p.bio)}</textarea></div></div></div>`;
}
function toggleRow(label,on){return `<div class="list-row"><div class="row-title">${esc(label)}</div><button class="btn ${on?"primary":""}" onclick="toggleSetting(this)">${on?"ON":"OFF"}</button></div>`;}
function toggleSetting(btn){const on=btn.textContent==="ON";btn.textContent=on?"OFF":"ON";btn.classList.toggle("primary",!on);}
function saveProfile(){
  state.profile={university:document.getElementById("profileUniversity").value.trim(),schoolYear:document.getElementById("profileSchoolYear").value,graduationYear:document.getElementById("profileGraduationYear").value,specialty:document.getElementById("profileSpecialty").value.trim(),area:document.getElementById("profileArea").value.trim(),bio:document.getElementById("profileBio").value.trim()};
  localStorage.setItem("medmatch_profile",JSON.stringify(state.profile));toast("プロフィールを保存しました");
}

function hospitalDashboard(){return `<div class="page-head"><div><div class="page-title">採用ダッシュボード</div><div class="page-sub">学生との接点から応募までを確認できます。</div></div><div class="actions"><button class="btn primary" onclick="go('students')">学生を探す</button></div></div><div class="grid cols-4">${kpi("プロフィール閲覧","1,240","+18% 前月比")}${kpi("お気に入り","85","+12 今月")}${kpi("見学申込","21件","+6 今週")}${kpi("スカウト","50 / 100","残り50通")}</div><div class="grid cols-2" style="margin-top:16px"><div class="card"><h3 class="section-title">採用ファネル</h3>${funnel("スカウト送信",50,100)}${funnel("開封",37,50)}${funnel("興味あり",12,50)}${funnel("見学申込",5,50)}</div><div class="card"><h3 class="section-title">新着アクション</h3><div class="list">${listRow("A","医学生 #2831","スカウトに「興味あり」","新着","green")}${listRow("B","医学生 #2914","病院見学を申請","新着","blue")}${listRow("C","医学生 #3012","募集をお気に入り登録","2時間前","")}</div></div></div>`;}
function funnel(label,val,max){return `<div style="margin-bottom:16px"><div style="display:flex;justify-content:space-between"><strong>${esc(label)}</strong><span class="muted">${val}</span></div><div class="progress"><span style="width:${Math.round(val/max*100)}%"></span></div></div>`;}
function studentsPage(){return `<div class="page-head"><div><div class="page-title">学生を探す</div><div class="page-sub">スカウト受信を許可している医学生から検索します。</div></div></div><div class="card"><div class="search-panel">${field("卒業年度",["指定なし","2027","2028","2029","2030"])}${field("希望地域",["指定なし","北海道","東京都","神奈川県"])}${field("希望診療科",["指定なし","救急","内科","小児科"])}<div class="field"><label>大学</label><input list="hospitalUniversityCandidates" placeholder="大学名を入力"><datalist id="hospitalUniversityCandidates">${MEDICAL_UNIVERSITIES.map(u=>`<option value="${esc(u)}"></option>`).join("")}</datalist><div class="field-help">大学名は入力候補から選べます。</div></div></div><button class="btn primary" onclick="toast('検索条件を適用しました')">検索</button></div><div class="list" style="margin-top:16px">${state.students.map(s=>`<div class="student-card"><div><div class="row-title" style="font-size:18px">医学生 #${s.id}</div><div class="row-sub">${esc(s.university)} ・ ${esc(s.year)}</div><div class="student-meta">${badge("卒業 "+s.grad,"blue")}${badge(s.prefs)}${badge(s.area,"green")}</div></div><div class="actions"><button class="btn">プロフィール</button><button class="btn primary" onclick="openModal('スカウト送信','医学生 #${s.id} にスカウトを送信します。')">スカウトする</button></div></div>`).join("")}</div>`;}
function hospitalScouts(){return `<div class="page-head"><div><div class="page-title">スカウト管理</div><div class="page-sub">送信状況と反応を確認します。</div></div></div><div class="grid cols-4">${kpi("送信済み","50")}${kpi("開封","37","開封率 74%")}${kpi("興味あり","12","承諾率 24%")}${kpi("見学転換","5","転換率 10%")}</div><div class="card" style="margin-top:16px">${table([["学生","卒業年度","希望科","状態","送信日"],["#2831","2028","救急 / 総合診療","興味あり","8/12"],["#2914","2028","内科 / 感染症","既読","8/11"],["#3012","2029","小児科","未読","8/11"]])}</div>`;}
function hospitalPipeline(){return `<div class="page-head"><div><div class="page-title">見学・応募管理</div><div class="page-sub">病院見学から選考までを管理します。</div></div></div><div class="kanban">${kanbanCol("見学申込",["学生 #2914","学生 #3050"])}${kanbanCol("見学確定",["学生 #2831","学生 #3120"])}${kanbanCol("応募",["学生 #2750"])}${kanbanCol("面接",["学生 #2601"])}</div>`;}
function jobsPage(){return `<div class="page-head"><div><div class="page-title">募集管理</div><div class="page-sub">初期研修・病院見学・説明会の募集を作成します。</div></div><div class="actions"><button class="btn primary" onclick="openModal('募集を作成','新しい募集を作成します。')">＋ 新規募集</button></div></div><div class="card">${table([["募集","種別","年度","状態","応募"],["2028年度 初期臨床研修医募集","初期研修","2028","公開中","9"],["救急科 病院見学 8月","病院見学","2028","公開中","21"],["オンライン説明会 9/10","説明会","2028","下書き","0"]])}</div>`;}

function adminDashboard(){return `<div class="page-head"><div><div class="page-title">運営ダッシュボード</div><div class="page-sub">サービス全体の稼働状況と要対応案件です。</div></div></div><div class="grid cols-4">${kpi("登録医学生","1,842","+42 今週")}${kpi("登録病院","126","+3 今週")}${kpi("見学申込","418","+11% 前月比")}${kpi("本人確認待ち","18件","要対応")}</div><div class="grid cols-2" style="margin-top:16px"><div class="card"><h3 class="section-title">要対応</h3><div class="list">${listRow("18","学生本人確認","未処理の申請があります","18件","orange")}${listRow("3","病院確認","新規病院の審査待ち","3件","orange")}${listRow("2","通報","ユーザーからの通報","2件","red")}</div></div><div class="card"><h3 class="section-title">本日の活動</h3><div class="metric-row"><div class="metric"><strong>42</strong><span>新規学生</span></div><div class="metric"><strong>3</strong><span>新規病院</span></div><div class="metric"><strong>194</strong><span>スカウト</span></div><div class="metric"><strong>28</strong><span>見学申込</span></div><div class="metric"><strong>11</strong><span>応募</span></div></div></div></div>`;}
function adminStudents(){return `<div class="page-head"><div><div class="page-title">医学生管理</div><div class="page-sub">登録状態・本人確認・利用状況を管理します。</div></div></div><div class="card">${table([["ID","大学","卒業年度","本人確認","スカウト","最終ログイン"],["#2831","北海道大学","2028","確認済","ON","今日"],["#2914","東北大学","2028","審査中","ON","今日"],["#3012","札幌医科大学","2029","確認済","ON","3日前"]])}</div>`;}
function adminHospitals(){return `<div class="page-head"><div><div class="page-title">病院管理</div><div class="page-sub">病院アカウントと契約状況を管理します。</div></div></div><div class="card">${table([["病院","所在地","確認","プラン","スカウト","状態"],["北星総合病院","北海道","確認済","Standard","50 / 100","利用中"],["東京中央医療センター","東京都","確認済","Pro","120 / 300","利用中"],["みなと大学病院","神奈川県","審査中","Free","0 / 10","審査中"]])}</div>`;}
function reviewPage(){return `<div class="page-head"><div><div class="page-title">審査</div><div class="page-sub">学生本人確認と病院確認を処理します。</div></div></div><div class="grid cols-2"><div class="card"><h3 class="section-title">学生本人確認</h3><div class="list">${reviewRow("学生 #2914","東北大学 / 2028卒")}${reviewRow("学生 #3188","東京大学 / 2029卒")}</div></div><div class="card"><h3 class="section-title">病院確認</h3><div class="list">${reviewRow("みなと大学病院","神奈川県 / 新規登録")}${reviewRow("西東京総合病院","東京都 / 新規登録")}</div></div></div>`;}
function reviewRow(title,sub){return `<div class="list-row"><div><div class="row-title">${esc(title)}</div><div class="row-sub">${esc(sub)}</div></div><div class="actions"><button class="btn" onclick="toast('保留にしました')">保留</button><button class="btn primary" onclick="toast('承認しました')">承認</button></div></div>`;}
function reportsPage(){return `<div class="page-head"><div><div class="page-title">通報・問い合わせ</div><div class="page-sub">不適切な利用や問い合わせを管理します。</div></div></div><div class="card">${table([["ID","種別","報告者","対象","状態","日時"],["#203","通報","学生 #2831","北星総合病院","調査中","8/13 16:40"],["#204","問い合わせ","学生 #3102","—","未対応","8/13 17:05"],["#205","通報","病院担当者","学生 #2980","未対応","8/13 17:42"]])}</div>`;}
function auditPage(){return `<div class="page-head"><div><div class="page-title">操作ログ</div><div class="page-sub">管理者操作を監査目的で保存します。</div></div></div><div class="card">${table([["日時","管理者","対象","操作","理由"],["8/13 17:31","admin01","病院 #126","承認","公式情報確認済"],["8/13 16:50","admin02","学生 #2914","本人確認を保留","追加確認が必要"],["8/13 15:18","admin01","募集 #481","非公開","募集終了"]])}</div>`;}

function go(page){state.page=page;render();}
function renderMain(){let html="";if(state.role==="student")html=state.page==="dashboard"?studentDashboard():state.page==="hospitals"?hospitalsPage():state.page==="scouts"?scoutsStudent():state.page==="pipeline"?studentPipeline():profilePage();else if(state.role==="hospital")html=state.page==="dashboard"?hospitalDashboard():state.page==="students"?studentsPage():state.page==="scouts"?hospitalScouts():state.page==="pipeline"?hospitalPipeline():jobsPage();else html=state.page==="dashboard"?adminDashboard():state.page==="students"?adminStudents():state.page==="hospitals"?adminHospitals():state.page==="review"?reviewPage():state.page==="reports"?reportsPage():auditPage();document.getElementById("main").innerHTML=html;}
function render(){renderSidebar();renderMain();}
function openModal(title,text){let el=document.getElementById("modalBack");if(!el){el=document.createElement("div");el.id="modalBack";el.className="modal-backdrop";el.innerHTML=`<div class="modal"><h3 id="modalTitle"></h3><p id="modalText" class="muted"></p><div class="field"><label>メッセージ</label><textarea id="modalMsg">よろしくお願いいたします。</textarea></div><div class="modal-actions"><button class="btn" onclick="closeModal()">キャンセル</button><button class="btn primary" onclick="submitModal()">送信</button></div></div>`;document.body.appendChild(el);}document.getElementById("modalTitle").textContent=title;document.getElementById("modalText").textContent=text;el.classList.add("show");}
function closeModal(){document.getElementById("modalBack")?.classList.remove("show");}
function submitModal(){closeModal();toast("送信しました");}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800);}

window.go=go;window.openModal=openModal;window.closeModal=closeModal;window.submitModal=submitModal;window.toast=toast;window.saveProfile=saveProfile;window.toggleSetting=toggleSetting;
document.querySelectorAll(".role-btn").forEach(b=>b.onclick=()=>setRole(b.dataset.role));
render();
