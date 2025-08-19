/* ===== common.js (stable) =====
 * 功能：
 * 1) 语言切换：.i18n[lang="en|cn|jp"] 显示/隐藏
 *    - 记住语言到 localStorage('sensis.lang')
 *    - 按钮：.langs .lang[data-lang=xx]
 *    - 公开 API：window.switchLang(lang), window.getCurrentLang()
 * 2) 移动端抽屉菜单（汉堡 → 侧栏）
 *    - 按钮：.fab-menu；遮罩：.backdrop；侧栏：<aside>
 *    - 公开 API：window.toggleMenu(force)
 *    - 兼容多种 CSS 钩子：aside[data-open="1"] / aside.is-open / body.menu-open / body.drawer-open
 * 3) 对缺失节点做容错，不报错
 */

(function () {
  const LANG_KEY = 'sensis.lang';
  const DEFAULT_LANG =
    (document.documentElement && document.documentElement.dataset.lang) || 'en';

  /* ---------- 工具 ---------- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, val); } catch (_) {}
  }

  /* ---------- 语言：显示/隐藏 .i18n ---------- */
  function applyLang(lang) {
    if (!lang) return;
    // 根节点标记
    if (document.documentElement) {
      document.documentElement.dataset.lang = lang;
    }

    // 切换按钮高亮
    $$('.langs .lang').forEach(btn => {
      const active = (btn.dataset.lang === lang);
      btn.classList.toggle('is-active', active);
      if (active) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });

    // 文本元素切换
    const nodes = $$('.i18n');
    nodes.forEach(node => {
      const want = node.getAttribute('lang');
      const parent = node.parentElement;
      if (parent && $$('.i18n', parent).length > 1) {
        // 父级内多语言并列：同父级中只显示目标语言
        $$('.i18n', parent).forEach(sib => {
          sib.style.display = (sib.getAttribute('lang') === lang ? '' : 'none');
        });
      } else {
        // 单个 .i18n：仅当匹配时显示
        node.style.display = (want === lang ? '' : 'none');
      }
    });

    safeSet(LANG_KEY, lang);
  }

  function resolveInitialLang() {
    // URL 参数优先 ?lang=cn|jp|en
    const m = location.search.match(/[?&]lang=([a-z]{2})/i);
    if (m) return m[1].toLowerCase();
    // 其后 localStorage
    const saved = safeGet(LANG_KEY);
    if (saved) return saved;
    // 默认
    return DEFAULT_LANG;
  }

  function switchLang(lang) {
    applyLang(lang);
  }
  function getCurrentLang() {
    return (document.documentElement && document.documentElement.dataset.lang) || DEFAULT_LANG;
  }

  /* ---------- 移动端抽屉 ---------- */
  const state = { open: false };

  function setMenu(open) {
    state.open = !!open;
    const aside    = $('aside');
    const backdrop = $('.backdrop');
    const btn      = $('.fab-menu');

    // 统一改状态
    if (aside) {
      aside.dataset.open = state.open ? '1' : '';
      aside.classList.toggle('is-open', state.open); // 兼容老样式钩子
    }
    if (backdrop) backdrop.hidden = !state.open;
    if (btn)      btn.setAttribute('aria-expanded', state.open ? 'true' : 'false');

    // 兼容更多 CSS 钩子：任一命中即可显示
    document.body.classList.toggle('drawer-open', state.open);
    document.body.classList.toggle('menu-open',   state.open);
  }

  function toggleMenu(force) {
    if (typeof force === 'boolean') setMenu(force);
    else setMenu(!state.open);
  }
  function closeMenu() { setMenu(false); }

  /* ---------- 初始化 ---------- */
  function initLang() {
    const lang = resolveInitialLang();
    applyLang(lang);
    // 绑定按钮
    $$('.langs .lang').forEach(btn => {
      on(btn, 'click', () => switchLang(btn.dataset.lang));
    });
    // 公开 API
    window.switchLang = switchLang;
    window.getCurrentLang = getCurrentLang;
  }

  function initDrawer() {
    const btn = $('.fab-menu');
    const backdrop = $('.backdrop');
    const aside = $('aside');

    on(btn, 'click', () => toggleMenu());
    on(backdrop, 'click', () => closeMenu());

    // 导航点击后关闭
    if (aside) {
      $$('a', aside).forEach(a => on(a, 'click', () => closeMenu()));
    }

    // Esc 关闭
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && state.open) {
        e.preventDefault();
        closeMenu();
      }
    });

    // 公开 API
    window.toggleMenu = toggleMenu;
  }

  function init() {
    initLang();
    initDrawer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
