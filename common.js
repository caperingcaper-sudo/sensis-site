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
