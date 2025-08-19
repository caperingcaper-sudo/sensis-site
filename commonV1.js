/* ===== common.js (final) =====
 * 1) 语言切换：.i18n / .i18n-block（根据 html[data-lang]）
 * 2) 抽屉菜单：切 body.drawer-open，控制 .backdrop.hidden、按钮 aria
 * 3) 对缺节点容错；确保 window.toggleMenu/switchLang 一定存在
 */
(function () {
  const LANG_KEY = 'sensis.lang';
  const DEFAULT_LANG = document.documentElement.dataset.lang || 'en';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);

  /* ---------- 语言 ---------- */
  function applyLang(lang) {
    document.documentElement.dataset.lang = lang;

    // 顶部语言按钮状态
    $$('.langs .lang').forEach(btn => {
      const onLang = btn.dataset.lang === lang;
      btn.classList.toggle('is-active', onLang);
      if (onLang) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });

    // .i18n：同父多语兄弟互斥显示
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

    // .i18n-block：整块互斥显示（纯 CSS 也会控制，这里冗余确保万无一失）
    $$('.i18n-block').forEach(block => {
      block.style.display = (block.getAttribute('lang') === lang ? '' : 'none');
    });

    try { localStorage.setItem(LANG_KEY, lang); } catch(_) {}
  }

  function switchLang(lang) {
    if (!lang) return;
    applyLang(lang);
  }

  /* ---------- 抽屉 ---------- */
  const state = { open: false };

  function setMenu(open) {
    state.open = !!open;
    const btn = $('.fab-menu');
    const bd  = $('.backdrop');
    document.body.classList.toggle('drawer-open', state.open);
    if (btn) btn.setAttribute('aria-expanded', state.open ? 'true' : 'false');
    if (bd)  bd.hidden = !state.open;
  }

  function toggleMenu(force) {
    if (typeof force === 'boolean') setMenu(force);
    else setMenu(!state.open);
  }
  function closeMenu(){ setMenu(false); }

  /* ---------- 初始化 ---------- */
  function initLang() {
    let lang = DEFAULT_LANG;
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved) lang = saved;
    } catch(_) {}
    applyLang(lang);

    $$('.langs .lang').forEach(btn => {
      on(btn, 'click', () => switchLang(btn.dataset.lang));
    });
  }

  function initDrawer() {
    const btn = $('.fab-menu');
    const bd  = $('.backdrop');
    const aside = $('aside');

    on(btn, 'click', () => toggleMenu());
    on(bd,  'click', () => closeMenu());

    if (aside) {
      $$('a', aside).forEach(a => on(a, 'click', () => closeMenu()));
    }

    on(document, 'keydown', e => {
      if (e.key === 'Escape' && state.open) { e.preventDefault(); closeMenu(); }
    });
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

  // 明确挂到 window（关键！）
  window.toggleMenu = window.toggleMenu || toggleMenu;
  window.switchLang = window.switchLang || switchLang;
})();