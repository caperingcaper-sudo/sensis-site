function switchLang(lang){
document.getElementById('lang-en').style.display = (lang==='en') ? 'block' : 'none';
document.getElementById('lang-cn').style.display = (lang==='cn') ? 'block' : 'none';
document.getElementById('lang-jp').style.display = (lang==='jp') ? 'block' : 'none';
document.querySelectorAll('.langs .lang')
.forEach(b => b.classList.toggle('is-active', b.dataset.lang === lang));
document.documentElement.setAttribute('data-lang', lang);
}
function switchLang(code){
  const root = document.documentElement; // <html>
  const allowed = ['en','cn','jp'];
  const code2 = allowed.includes(code) ? code : 'en';

  // data-lang（CSS 変数/显示切替）と lang（字体切替）を両方更新
  root.setAttribute('data-lang', code2);
  // zh と cn の整合（あなたの CSS は cn を使っている）
  root.setAttribute('lang', code2 === 'cn' ? 'zh' : (code2 === 'jp' ? 'ja' : 'en'));

  // ボタンの active 表示更新
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
