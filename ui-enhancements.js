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
  "兵庫医科大学","神戸大学","奈良県立医科大学","和歌山県立医科大学","鳥取大学",
  "島根大学","岡山大学","川崎医科大学","広島大学","山口大学","徳島大学","香川大学",
  "愛媛大学","高知大学","九州大学","福岡大学","久留米大学","産業医科大学","佐賀大学",
  "長崎大学","熊本大学","大分大学","宮崎大学","鹿児島大学","琉球大学"
];

const LIST_ID = "medmatch-university-list";

function normalize(s) {
  return String(s || "").replace(/\s+/g, "").toLowerCase();
}

function ensureList() {
  if (document.getElementById(LIST_ID)) return;
  const dl = document.createElement("datalist");
  dl.id = LIST_ID;
  dl.innerHTML = MEDICAL_UNIVERSITIES.map(u => `<option value="${u}"></option>`).join("");
  document.body.appendChild(dl);
}

function descriptor(field, control) {
  return normalize([
    field.querySelector("label")?.textContent,
    control?.name,
    control?.id,
    control?.placeholder,
    control?.getAttribute("aria-label")
  ].join(" "));
}

function convertInputToSelect(input, options, marker) {
  if (!input || input.tagName === "SELECT" || input.dataset[marker] === "1") return;
  const select = document.createElement("select");
  const current = String(input.value || "");
  const seen = new Set(options.map(o => String(o.value)));

  select.append(new Option("選択してください", ""));
  if (current && !seen.has(current)) select.append(new Option(current, current));

  for (const o of options) {
    select.append(new Option(o.label, String(o.value), false, String(o.value) === current));
  }

  input.dataset[marker] = "1";
  input.style.display = "none";
  input.setAttribute("aria-hidden", "true");
  input.insertAdjacentElement("afterend", select);

  select.addEventListener("change", () => {
    input.value = select.value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function enhance() {
  ensureList();

  document.querySelectorAll(".field").forEach(field => {
    const control = field.querySelector("input, select");
    if (!control) return;
    const d = descriptor(field, control);

    const isGrad = /卒業予定?年度|卒業年度|graduation.?year|grad.?year/.test(d);
    const isYear = !isGrad && (/学年/.test(d) || /school.?year|school_year/.test(d));
    const isUniversity = /所属大学|大学名|university/.test(d) || (d.includes("大学") && !d.includes("大学病院"));

    if (isUniversity && control.tagName === "INPUT") {
      control.setAttribute("list", LIST_ID);
      control.setAttribute("autocomplete", "organization");
    }

    if (isYear) {
      convertInputToSelect(
        control,
        [1,2,3,4,5,6].map(y => ({ value: y, label: `医学部 ${y}年` })),
        "medmatchYearEnhanced"
      );
    }

    if (isGrad) {
      const now = new Date().getFullYear();
      const years = Array.from({length: 11}, (_,i) => now+i)
        .map(y => ({ value: y, label: `${y}年度` }));
      convertInputToSelect(control, years, "medmatchGradEnhanced");
    }
  });
}

let queued = false;
function schedule() {
  if (queued) return;
  queued = true;
  queueMicrotask(() => {
    queued = false;
    enhance();
  });
}

document.addEventListener("DOMContentLoaded", schedule);
new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
schedule();
