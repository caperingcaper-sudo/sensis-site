function switchLang(code){
  const root = document.documentElement;
  const allowed = ['en','cn','jp'];
  const code2 = allowed.includes(code) ? code : 'en';

  // 可視切替（全ページ）
  root.setAttribute('data-lang', code2);

  // フォント用の html[lang] も更新（既存のあなたの設定に追随）
  root.setAttribute('lang', code2 === 'cn' ? 'zh' : (code2 === 'jp' ? 'ja' : 'en'));

  // ボタンの active 表示
  document.querySelectorAll('.langs .lang').forEach(btn=>{
    btn.classList.toggle('is-active', btn.getAttribute('data-lang') === code2);
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.logo-link');
  if (!logo) return;
  logo.addEventListener('click', () => {
    if (window.innerWidth <= 960) {
      document.body.classList.remove('menu-open'); // 先合上抽屉
    }
    // 不阻止默认跳转行为，直接回首页
  });
});
function toggleMenu(){ document.body.classList.toggle('menu-open'); }
  // 初始语言（避免缓存导致的显示异常）
document.addEventListener('DOMContentLoaded', () => switchLang('en'));
<script>
/* ====== 交互：同意后启用提交 ====== */
document.addEventListener('DOMContentLoaded', ()=>{
  const consent = document.getElementById('consent');
  const btn = document.getElementById('btn-submit');
  if (consent && btn) {
    consent.addEventListener('change', ()=>{ btn.disabled = !consent.checked; });
  }
});

/* ====== 反馈卡渲染（i18n 简易版） ====== */
function renderFeedbackCard(payload, result){
  const lang = document.documentElement.getAttribute('data-lang') || 'en';
  const t = {
    title: { en:'Your Profile Summary', cn:'你的画像摘要', jp:'あなたのプロフィール要約' },
    id:    { en:'Submission ID', cn:'提交编号', jp:'送信ID' },
    plan:  { en:'Suggested next step', cn:'建议的下一步', jp:'次の一手' },
    copy:  { en:'Copy share link', cn:'复制分享链接', jp:'共有リンクをコピー' },
    saved: { en:'Copied!', cn:'已复制！', jp:'コピーしました！' }
  };

  const shareLink = result.shareUrl || '';

  const html = `
    <div class="card">
      <h3>${t.title[lang]}</h3>
      <p><strong>${t.id[lang]}:</strong> ${result.id}</p>
      <p>
        <strong>Cadence:</strong> ${result.cadence}<br>
        <strong>Focus:</strong> ${result.focus}<br>
        <strong>${t.plan[lang]}:</strong> ${result.nextStep}
      </p>
      ${shareLink ? `<button type="button" class="link" onclick="navigator.clipboard.writeText('${shareLink}').then(()=>alert('${t.saved[lang]}'))">${t.copy[lang]}</button>` : ``}
    </div>
  `;
  const box = document.getElementById('feedback');
  box.innerHTML = html;
  box.hidden = false;
}

/* ====== 提交：POST 到 Apps Script ====== */
async function submitForm(){
  const form = document.getElementById('intake');
  const data = formToJSON(form);

  // 可加：前端轻验证（举例：昵称）
  if (!data.user_nick || !data.user_nick.trim()){
    alert('Please enter your Nick Name / 请输入昵称');
    return;
  }

  // 页面语言也带上
  data._lang = document.documentElement.getAttribute('data-lang') || 'en';

  const ENDPOINT_URL = '<<PASTE_YOUR_APPS_SCRIPT_WEBAPP_URL_HERE>>';

  const btn = document.getElementById('btn-submit');
  btn.disabled = true; btn.textContent = '...';

  try{
    const resp = await fetch(ENDPOINT_URL, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(data),
    });
    const json = await resp.json(); // {ok:true, id, shareUrl, cadence, focus, nextStep }
    if (!json.ok) throw new Error(json.error || 'Submit failed');

    renderFeedbackCard(data, json);
    btn.textContent = 'Submitted';
  }catch(err){
    console.error(err);
    alert('Submit failed. Please try again.');
    btn.disabled = false; btn.textContent = 'Submit';
  }
}