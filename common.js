/* ===== common.js (stable) =====
 * 功能：
 * 1) i18n：切换 .i18n[lang=en|cn|jp]，记忆 localStorage('sensis.lang')
 * 2) 移动抽屉：.fab-menu + .backdrop 控制 <aside>
 *    - <aside> 切 data-open="1" 打开
 *    - .backdrop hidden 切换
 *    - body 加/去 .drawer-open（锁滚动）
 *    - aria-expanded 同步
 *    - Esc 关闭；点导航链接自动关闭
 * 3) 容错：元素缺失不报错；多次初始化不重复绑定
 */

(function () {
  const LANG_KEY = 'sensis.lang';
  const DEFAULT_LANG = document.documentElement.dataset.lang || 'en';

  /* ---------- 小工具 ---------- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);

  /* ---------- 语言：显示/隐藏 .i18n ---------- */
  function applyLang(lang) {
    document.documentElement.dataset.lang = lang;

    // 切换按钮高亮（如果页面有 .langs）
    $$('.langs .lang').forEach(btn => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle('is-active', active);
      if (active) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });

    // 同容器多语言兄弟：只显示目标语言
    $$('.i18n').forEach(node => {
      const parent = node.parentElement;
      if (parent && $$('.i18n', parent).length > 1) {
        $$('.i18n', parent).forEach(sib => {
          sib.style.display = (sib.getAttribute('lang') === lang ? '' : 'none');
        });
      } else {
        node.style.display = (node.getAttribute('lang') === lang ? '' : 'none');
      }
    });

    try { localStorage.setItem(LANG_KEY, lang); } catch(_) {}
  }

  function switchLang(lang) { if (lang) applyLang(lang); }
  window.switchLang = switchLang; // 供页面按钮调用

  /* ---------- 抽屉菜单 ---------- */
  const drawerState = { open: false, inited: false };

  function isMobileOrPadPortrait() {
    // 逻辑：小屏或竖屏时才启用抽屉；具体断点交给 CSS 控制显示与否
    return window.matchMedia('(max-width: 1024px) and (orientation: portrait), (max-width: 768px)').matches;
  }

  function setMenu(open) {
    drawerState.open = !!open;

    const aside    = $('aside');
    const backdrop = $('.backdrop');
    const btn      = $('.fab-menu');

    if (aside)    aside.dataset.open = drawerState.open ? '1' : '';
    if (backdrop) backdrop.hidden    = !drawerState.open;
    if (btn)      btn.setAttribute('aria-expanded', drawerState.open ? 'true' : 'false');

    document.body.classList.toggle('drawer-open', drawerState.open);
  }

  function toggleMenu(force) {
    // 桌面端直接不处理（保持侧栏正常显示，避免误切）
    if (!isMobileOrPadPortrait()) return;
    if (typeof force === 'boolean') setMenu(force);
    else setMenu(!drawerState.open);
  }
  function closeMenu() { setMenu(false); }

  // 暴露给 HTML 内联 onclick
  window.toggleMenu = toggleMenu;

  /* ---------- 初始化 ---------- */
  function initLang() {
    let lang = DEFAULT_LANG;
    try { const saved = localStorage.getItem(LANG_KEY); if (saved) lang = saved; } catch(_) {}
    applyLang(lang);

    $$('.langs .lang').forEach(btn => {
      on(btn, 'click', () => switchLang(btn.dataset.lang));
    });
  }

  function initDrawer() {
    if (drawerState.inited) return; // 防重复
    drawerState.inited = true;

    const btn = $('.fab-menu');
    const backdrop = $('.backdrop');
    const aside = $('aside');

    on(btn, 'click', () => toggleMenu());
    on(backdrop, 'click', () => closeMenu());

    if (aside) { $$('a', aside).forEach(a => on(a, 'click', () => closeMenu())); }

    on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && drawerState.open) {
        e.preventDefault();
        closeMenu();
      }
    });

    // 视口变化时：若变为桌面端，确保关闭遮罩/状态复位
    on(window, 'resize', () => {
      if (!isMobileOrPadPortrait()) closeMenu();
    });
  }

  function init() { initLang(); initDrawer(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
