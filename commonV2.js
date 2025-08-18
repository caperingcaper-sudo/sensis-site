/* commonV2.js —— 极简交互：语言切换 + 右下角抽屉按钮
   不改任何样式尺寸；只提供两个全局函数给 HTML 的 onclick 使用。
*/

// —— 语言切换：根据 .i18n 的 lang 属性显示/隐藏文本
window.switchLang = function(lang) {
  // 记录当前语言（可选）
  document.documentElement.setAttribute('data-lang', lang);

  // 切换文案可见性
  document.querySelectorAll('.i18n').forEach(el => {
    el.style.display = (el.getAttribute('lang') === lang) ? '' : 'none';
  });

  // 切换语言按钮的激活态（如果你有 .lang.is-active 的样式就会生效）
  document.querySelectorAll('.lang').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.lang === lang);
  });
};

// —— 右下角圆形按钮：开/关侧栏 + 遮罩
window.toggleMenu = function () {
  const aside = document.querySelector('aside');
  const backdrop = document.querySelector('.backdrop');
  const btn = document.querySelector('.fab-menu');

  if (!aside) return; // 没侧栏就不处理
  const open = aside.classList.toggle('is-open');

  if (backdrop) backdrop.hidden = !open;         // 用 hidden 控制遮罩显隐
  if (btn) btn.setAttribute('aria-expanded', String(open));
};

// —— 页面就绪时做一次初始化
document.addEventListener('DOMContentLoaded', () => {
  // 1) 根据 <html data-lang="..."> 初始化一次语言（默认 en）
  const current = document.documentElement.getAttribute('data-lang') || 'en';
  window.switchLang(current);

  // 2) 让点遮罩也能关闭
  const backdrop = document.querySelector('.backdrop');
  if (backdrop) backdrop.addEventListener('click', window.toggleMenu);
});

// commonV2.js
(function () {
  const body = document.body;
  const btn = document.querySelector('.fab-menu');
  const backdrop = document.querySelector('.backdrop');
  const aside = document.querySelector('aside');

  function openMenu() {
    body.classList.add('drawer-open');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    if (backdrop) backdrop.hidden = false;   // 显示遮罩
  }

  function closeMenu() {
    body.classList.remove('drawer-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (backdrop) backdrop.hidden = true;    // 隐藏遮罩
  }

  // 提供给 HTML 的 onclick 使用（全局可见）
  window.toggleMenu = function () {
    if (body.classList.contains('drawer-open')) closeMenu();
    else openMenu();
  };

  // ESC 关闭；侧栏里点到链接也关闭
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  if (aside) aside.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeMenu();
  });

  // 初始保证是关闭态
  closeMenu();
})();