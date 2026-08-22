(() => {
  const showStartupError = () => {
    const root = document.getElementById("root");
    if (!root) return;
    const stillBooting = !!root.querySelector(".boot-screen");
    if (!stillBooting) return;
    root.innerHTML = `
      <main class="page" style="padding-top:48px">
        <div class="notice error">
          <strong>MedMatch の JavaScript を読み込めませんでした。</strong><br>
          app.js が GitHub に存在するか、GitHub Pages の公開対象に含まれているか確認してください。
        </div>
        <div class="panel"><div class="panel-head">確認するファイル</div><div class="panel-body">
          <code>index.html</code> と同じ階層に <code>app.js</code> が必要です。
        </div></div>
      </main>`;
  };
  window.addEventListener("DOMContentLoaded", () => setTimeout(showStartupError, 1200));
})();
