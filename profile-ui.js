
(() => {
  const STORAGE_KEY = "medmatch_student_profile_ui_v2";

  const MEDICAL_UNIVERSITIES = [
    "北海道大学","札幌医科大学","旭川医科大学","弘前大学","岩手医科大学","東北大学",
    "秋田大学","山形大学","福島県立医科大学","筑波大学","自治医科大学","獨協医科大学",
    "群馬大学","埼玉医科大学","千葉大学","国際医療福祉大学","東京大学","東京科学大学",
    "東京医科大学","東京慈恵会医科大学","日本医科大学","日本大学","東邦大学","昭和医科大学",
    "帝京大学","杏林大学","順天堂大学","慶應義塾大学","東京女子医科大学","北里大学",
    "東海大学","聖マリアンナ医科大学","横浜市立大学","新潟大学","富山大学","金沢大学",
    "金沢医科大学","福井大学","山梨大学","信州大学","岐阜大学","浜松医科大学",
    "名古屋大学","名古屋市立大学","愛知医科大学","藤田医科大学","三重大学","滋賀医科大学",
    "京都大学","京都府立医科大学","大阪大学","大阪公立大学","関西医科大学","近畿大学",
    "兵庫医科大学","神戸大学","奈良県立医科大学","和歌山県立医科大学","鳥取大学","島根大学",
    "岡山大学","川崎医科大学","広島大学","山口大学","徳島大学","香川大学","愛媛大学",
    "高知大学","九州大学","福岡大学","久留米大学","産業医科大学","佐賀大学","長崎大学",
    "熊本大学","大分大学","宮崎大学","鹿児島大学","琉球大学"
  ];

  const SPECIALTIES = [
    "総合診療","救急","内科","外科","小児科","産婦人科","精神科","皮膚科",
    "整形外科","眼科","耳鼻咽喉科","泌尿器科","放射線科","麻酔科","病理","未定"
  ];

  const AREAS = [
    "北海道","東北","関東","甲信越","北陸","東海","近畿","中国","四国","九州","沖縄","全国"
  ];

  const defaultProfile = {
    university: "北海道大学",
    schoolYear: "5",
    graduationYear: "2028",
    specialties: ["救急","総合診療"],
    areas: ["関東"],
    bio: "救急・総合診療に興味があります。市中病院で幅広い症例を経験したいです。",
    universityVisible: true,
    nameVisible: false,
    specialtyVisible: true,
    areaVisible: true,
    scoutEnabled: true
  };

  function loadProfile(){
    try {
      return {...defaultProfile, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")};
    } catch {
      return {...defaultProfile};
    }
  }

  function escapeHtml(value=""){
    return String(value).replace(/[&<>"']/g, ch => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[ch]));
  }

  function graduationOptions(selected){
    const currentYear = new Date().getFullYear();
    const years = [];
    for(let y=currentYear; y<=currentYear+10; y++) years.push(String(y));
    return `<option value="">選択してください</option>` +
      years.map(y => `<option value="${y}" ${String(selected)===y?"selected":""}>${y}年度</option>`).join("");
  }

  function schoolYearOptions(selected){
    return `<option value="">選択してください</option>` +
      [1,2,3,4,5,6].map(y =>
        `<option value="${y}" ${String(selected)===String(y)?"selected":""}>医学部 ${y}年</option>`
      ).join("");
  }

  function chipGroup(name, items, selected=[]){
    const set = new Set(selected || []);
    return `<div class="chip-group">` + items.map(item => `
      <label class="choice-chip">
        <input type="checkbox" name="${name}" value="${escapeHtml(item)}" ${set.has(item)?"checked":""}>
        <span>${escapeHtml(item)}</span>
      </label>
    `).join("") + `</div>`;
  }

  function switchRow(id, title, description, checked){
    return `
      <div class="profile-switch-row">
        <div class="profile-switch-copy">
          <strong>${title}</strong>
          <small>${description}</small>
        </div>
        <label class="toggle-switch" aria-label="${title}">
          <input id="${id}" type="checkbox" ${checked?"checked":""}>
          <span class="toggle-slider"></span>
        </label>
      </div>`;
  }

  function calculateCompletion(profile){
    let score = 0;
    const checks = [
      !!profile.university,
      !!profile.schoolYear,
      !!profile.graduationYear,
      (profile.specialties || []).length > 0,
      (profile.areas || []).length > 0,
      (profile.bio || "").trim().length >= 20
    ];
    score = checks.filter(Boolean).length;
    return Math.round(score / checks.length * 100);
  }

  window.profilePage = function profilePage(){
    const p = loadProfile();
    const completion = calculateCompletion(p);
    const summary = [
      ["大学", !!p.university],
      ["学年", !!p.schoolYear],
      ["卒業予定年度", !!p.graduationYear],
      ["希望診療科", (p.specialties || []).length > 0],
      ["希望地域", (p.areas || []).length > 0],
      ["自己紹介 20文字以上", (p.bio || "").trim().length >= 20]
    ];

    return `
      <div class="page-head">
        <div>
          <div class="page-title">プロフィール</div>
          <div class="page-sub">病院に伝える情報を登録します。入力しやすい項目は選択式にしています。</div>
        </div>
      </div>

      <form id="studentProfileForm" class="profile-layout" autocomplete="on">
        <div class="profile-stack">
          <div id="profileError" class="profile-error"></div>

          <section class="card profile-card">
            <div class="profile-card-head">
              <div>
                <h3 class="profile-card-title">基本情報</h3>
                <div class="profile-card-desc">学年・卒業年度は選択式です。大学名は入力すると候補が表示されます。</div>
              </div>
            </div>

            <div class="profile-form-grid">
              <div class="profile-field full">
                <label for="profileUniversity">大学 <span class="required-badge">必須</span></label>
                <input
                  id="profileUniversity"
                  name="university"
                  list="medicalUniversityList"
                  value="${escapeHtml(p.university)}"
                  placeholder="例：北海道大学"
                  autocomplete="organization"
                  required
                >
                <datalist id="medicalUniversityList">
                  ${MEDICAL_UNIVERSITIES.map(u => `<option value="${escapeHtml(u)}"></option>`).join("")}
                </datalist>
                <div class="field-hint">文字を入力すると医学部・医科大学の候補を絞り込めます。候補外も入力可能です。</div>
              </div>

              <div class="profile-field">
                <label for="profileSchoolYear">学年 <span class="required-badge">必須</span></label>
                <select id="profileSchoolYear" name="schoolYear" required>
                  ${schoolYearOptions(p.schoolYear)}
                </select>
              </div>

              <div class="profile-field">
                <label for="profileGraduationYear">卒業予定年度 <span class="required-badge">必須</span></label>
                <select id="profileGraduationYear" name="graduationYear" required>
                  ${graduationOptions(p.graduationYear)}
                </select>
                <div class="field-hint">留年・休学などを考慮し、学年とは独立して選べます。</div>
              </div>
            </div>
          </section>

          <section class="card profile-card">
            <div class="profile-card-head">
              <div>
                <h3 class="profile-card-title">希望条件</h3>
                <div class="profile-card-desc">複数選択できます。病院側の検索条件にも利用しやすい形式です。</div>
              </div>
            </div>

            <div class="profile-form-grid">
              <div class="profile-field full">
                <label>希望診療科 <span class="required-badge">1つ以上</span></label>
                ${chipGroup("specialties", SPECIALTIES, p.specialties)}
              </div>

              <div class="profile-field full">
                <label>希望地域 <span class="required-badge">1つ以上</span></label>
                ${chipGroup("areas", AREAS, p.areas)}
              </div>

              <div class="profile-field full">
                <label for="profileBio">自己紹介 <span class="optional-badge">任意</span></label>
                <textarea id="profileBio" name="bio" maxlength="800" placeholder="興味のある診療科、研修で重視したいこと、将来像など">${escapeHtml(p.bio)}</textarea>
                <div class="field-hint"><span id="bioCount">${(p.bio || "").length}</span> / 800文字</div>
              </div>
            </div>
          </section>

          <section class="card profile-card">
            <div class="profile-card-head">
              <div>
                <h3 class="profile-card-title">公開設定</h3>
                <div class="profile-card-desc">病院側にどこまで見せるかを個別に設定できます。</div>
              </div>
            </div>
            <div class="profile-switch-list">
              ${switchRow("universityVisible","大学名を公開","病院の学生検索・プロフィールに大学名を表示します。",p.universityVisible)}
              ${switchRow("nameVisible","氏名を公開","スカウト前の病院にも氏名を表示します。",p.nameVisible)}
              ${switchRow("specialtyVisible","希望診療科を公開","希望診療科を病院に表示します。",p.specialtyVisible)}
              ${switchRow("areaVisible","希望地域を公開","希望地域を病院に表示します。",p.areaVisible)}
              ${switchRow("scoutEnabled","スカウトを受け取る","OFFにすると新しいスカウト対象から外れます。",p.scoutEnabled)}
            </div>
          </section>

          <div class="save-bar">
            <div id="profileSaveStatus" class="save-status">変更内容はこのブラウザに保存されます。</div>
            <button class="btn primary" type="submit">変更を保存</button>
          </div>
        </div>

        <aside class="card profile-card profile-summary">
          <div class="completion-ring" style="--progress:${completion}">
            <span class="completion-value">${completion}%</span>
          </div>
          <div class="summary-title">プロフィール完成度</div>
          <div class="summary-copy">基本項目を埋めると、病院側の検索で条件に合いやすくなります。</div>
          <div class="summary-list">
            ${summary.map(([label,done]) => `
              <div class="summary-item ${done?"done":""}">
                <span class="summary-dot"></span>
                <span>${escapeHtml(label)}</span>
              </div>
            `).join("")}
          </div>
        </aside>
      </form>`;
  };

  function collectChecked(form, name){
    return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(el => el.value);
  }

  function bindProfileForm(){
    const form = document.getElementById("studentProfileForm");
    if(!form) return;

    const bio = document.getElementById("profileBio");
    const count = document.getElementById("bioCount");
    if(bio && count){
      bio.addEventListener("input", () => count.textContent = bio.value.length);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const error = document.getElementById("profileError");
      error.classList.remove("show");
      error.textContent = "";

      const specialties = collectChecked(form, "specialties");
      const areas = collectChecked(form, "areas");
      const data = {
        university: form.elements.university.value.trim(),
        schoolYear: form.elements.schoolYear.value,
        graduationYear: form.elements.graduationYear.value,
        specialties,
        areas,
        bio: form.elements.bio.value.trim(),
        universityVisible: document.getElementById("universityVisible").checked,
        nameVisible: document.getElementById("nameVisible").checked,
        specialtyVisible: document.getElementById("specialtyVisible").checked,
        areaVisible: document.getElementById("areaVisible").checked,
        scoutEnabled: document.getElementById("scoutEnabled").checked
      };

      const problems = [];
      if(!data.university) problems.push("大学を入力してください。");
      if(!data.schoolYear) problems.push("学年を選択してください。");
      if(!data.graduationYear) problems.push("卒業予定年度を選択してください。");
      if(!data.specialties.length) problems.push("希望診療科を1つ以上選択してください。");
      if(!data.areas.length) problems.push("希望地域を1つ以上選択してください。");

      if(problems.length){
        error.innerHTML = problems.map(x => `<div>・${escapeHtml(x)}</div>`).join("");
        error.classList.add("show");
        error.scrollIntoView({behavior:"smooth", block:"center"});
        return;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      if(window.state?.students?.length){
        const me = window.state.students.find(s => s.id === 2831) || window.state.students[0];
        if(me){
          me.university = data.university;
          me.year = `医学部${data.schoolYear}年`;
          me.grad = data.graduationYear;
          me.prefs = data.specialties.join(" / ");
          me.area = data.areas.join("・");
          me.scout = data.scoutEnabled;
        }
      }

      if(typeof window.toast === "function") window.toast("プロフィールを保存しました");
      if(typeof window.render === "function") window.render();
    });
  }

  const originalRender = window.render;
  if(typeof originalRender === "function"){
    window.render = function(){
      originalRender();
      bindProfileForm();
    };
  }

  // app.js may have already rendered before this patch loaded.
  bindProfileForm();
})();
