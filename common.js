function switchLang(lang){
document.getElementById('lang-en').style.display = (lang==='en') ? 'block' : 'none';
document.getElementById('lang-cn').style.display = (lang==='cn') ? 'block' : 'none';
document.getElementById('lang-jp').style.display = (lang==='jp') ? 'block' : 'none';
document.querySelectorAll('.langs .lang')
.forEach(b => b.classList.toggle('is-active', b.dataset.lang === lang));
document.documentElement.setAttribute('data-lang', lang);
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
