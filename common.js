/* ===== common.js =====
 * 功能：
 * 1) 多语言切换：.langs 按钮 + html[data-lang] + .i18n/.i18n-block（由 CSS 控制显隐）
 * 2) 移动端抽屉菜单：body.drawer-open + .fab-menu + .backdrop + <aside>
 * 3) 容错：缺节点不报错；没写 onclick 也能用
 */

(function () {
  /* ---------- 工具 ---------- */
  const LANG_KEY     = 'sensis.lang';
  const DEFAULT_LANG = document.documentElement.dataset.lang || 'en';
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);

  /* =========================
   *  1) 语言切换（显隐由 CSS 通过 [data-lang] 控制）
   * ========================= */
  function applyLang(lang) {
    if (!lang) return;
    document.documentElement.dataset.lang = lang;

    // 切换按钮高亮
    $$('.langs .lang').forEach(btn => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle('is-active', active);
      if (active) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });

    try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
  }

  function switchLang(lang) { applyLang(lang); }
  // 暴露给 HTML 的 onclick（如果页面用了）
  window.switchLang = switchLang;

  function initLang() {
    let lang = DEFAULT_LANG;
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved) lang = saved;
    } catch (_) {}
    applyLang(lang);

    // 绑定按钮（即使 HTML 已有 onclick，这里也不会冲突）
    $$('.langs .lang').forEach(btn => {
      on(btn, 'click', () => switchLang(btn.dataset.lang));
    });
  }

  /* =========================
   *  2) 移动端抽屉菜单
   * ========================= */
  function setMenu(open) {
    const want = !!open;
    document.body.classList.toggle('drawer-open', want);
    const btn = $('.fab-menu');
    const bd  = $('.backdrop');
    if (btn) btn.setAttribute('aria-expanded', want ? 'true' : 'false');
    if (bd)  bd.hidden = !want;
  }

  function toggleMenu(force) {
    if (typeof force === 'boolean') {
      setMenu(force);
    } else {
      // 关键：直接读 DOM 当前状态，避免状态漂移
      const nowOpen = document.body.classList.contains('drawer-open');
      setMenu(!nowOpen);
    }
  }
  window.toggleMenu = toggleMenu;

  function initMenu() {
    const btn = $('.fab-menu');
    const bd  = $('.backdrop');

    // 若页面没写 onclick，也能工作
    on(btn, 'click', () => toggleMenu());
    on(bd,  'click', () => toggleMenu(false));

    // Esc 关闭
    on(document, 'keydown', e => {
      if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) {
        e.preventDefault();
        toggleMenu(false);
      }
    });

    // 侧栏点击链接后自动关闭（移动端体验）
    const aside = $('aside');
    if (aside) $$('a', aside).forEach(a => on(a, 'click', () => toggleMenu(false)));
  }

  /* =========================
   *  3) 初始化
   * ========================= */
  function init() {
    initLang();
    initMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();