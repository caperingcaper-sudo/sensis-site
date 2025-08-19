/* commonV2.js —— 极简交互：语言切换 + 抽屉菜单 */
(function () {
  // —— 语言切换：仅设置 data-lang，并更新按钮状态（显示逻辑交给 CSS）
  window.switchLang = function (lang) {
    document.documentElement.setAttribute('data-lang', lang);
    document.querySelectorAll('.lang').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });
  };
  // —— 抽屉：统一用 body.drawer-open
  const body = document.body;
  const btn = document.querySelector('.fab-menu');
  const backdrop = document.querySelector('.backdrop');
  const aside = document.querySelector('aside');

  function openMenu() {
    body.classList.add('drawer-open');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    if (backdrop) backdrop.hidden = false;
  }
  function closeMenu() {
    body.classList.remove('drawer-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (backdrop) backdrop.hidden = true;

 window.toggleMenu = function () {
    if (body.classList.contains('drawer-open')) closeMenu();
    else openMenu();  
// 初始化：设定当前语言（默认沿用 html[data-lang] 或 'en'），并确保抽屉是关闭的
  document.addEventListener('DOMContentLoaded', () => {
    const current = document.documentElement.getAttribute('data-lang') || 'en';
    window.switchLang(current);
    closeMenu();
  });

  // ESC 关闭；点遮罩关闭；侧栏内点链接也关闭
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  if (backdrop) backdrop.addEventListener('click', closeMenu);
  if (aside) aside.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
})();
 
