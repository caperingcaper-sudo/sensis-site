/* ===== common.js (safe drop-in) =====
 * 功能：
 * 1) 语言切换：.i18n[lang="en|cn|jp"] 显示/隐藏
 *    - 记住语言到 localStorage('sensis.lang')
 *    - 支持页面按钮 .langs .lang[data-lang=xx]
 * 2) 移动端抽屉菜单：.fab-menu 按钮 + .backdrop + <aside>
 *    - 为 <aside> 切换 data-open 状态
 *    - 为 .backdrop 切换 hidden
 *    - 为按钮维护 aria-expanded
 *    - Esc 关闭、点击链接后关闭
 * 3) 对缺失节点做容错，不报错
 */

(function () {
  const LANG_KEY = 'sensis.lang';
  const DEFAULT_LANG = document.documentElement.dataset.lang || 'en';

  /* ---------- 工具 ---------- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);

  /* ---------- 语言：显示/隐藏 .i18n ---------- */
  function applyLang(lang) {
    // root 标记
    document.documentElement.dataset.lang = lang;

    // 切换按钮高亮
    $$('.langs .lang').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
      if (btn.dataset.lang === lang) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });

    // 文本元素切换
    const items = $$('.i18n');
    items.forEach(node => {
      const want = node.getAttribute('lang');
      // 同一块容器里往往有多个 .i18n 同文种兄弟
      const parent = node.parentElement;
      // 如果父级下有多个 .i18n，同父级内先全部隐藏，再显示目标语言
      if (parent && $$('.i18n', parent).length > 1) {
        $$('.i18n', parent).forEach(sib => sib.style.display = (sib.getAttribute('lang') === lang ? '' : 'none'));
      } else {
        // 单个 .i18n 就按匹配显示
        node.style.display = (want === lang ? '' : 'none');
      }
    });

    try { localStorage.setItem(LANG_KEY, lang); } catch(_) {}
  }

  function switchLang(lang) {
    if (!lang) return;
    applyLang(lang);
  }

  /* ---------- 移动端抽屉 ---------- */
  const state = { open: false };
  function setMenu(open) {
    state.open = !!open;
    const aside    = $('aside');
    const backdrop = $('.backdrop');
    const btn      = $('.fab-menu');

    if (aside)    aside.dataset.open = state.open ? '1' : '';
    if (backdrop) backdrop.hidden = !state.open;
    if (btn)      btn.setAttribute('aria-expanded', state.open ? 'true' : 'false');

    // 为了配合 CSS，你也可以让 body 带一个类
    document.body.classList.toggle('drawer-open', state.open);
  }
  function toggleMenu(force) {
    if (typeof force === 'boolean') setMenu(force);
    else setMenu(!state.open);
  }
  function closeMenu() { setMenu(false); }

  /* ---------- 初始化 ---------- */
  function initLang() {
    // 恢复本地语言或默认语言
    let lang = DEFAULT_LANG;
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved) lang = saved;
    } catch(_) {}
    applyLang(lang);

    // 绑定按钮
    $$('.langs .lang').forEach(btn => {
      on(btn, 'click', () => switchLang(btn.dataset.lang));
    });

    // 让 switchLang 在全局可用（页面内联脚本会调）
    window.switchLang = switchLang;
  }

  function initDrawer() {
    const btn = $('.fab-menu');
    const backdrop = $('.backdrop');
    const aside = $('aside');

    on(btn, 'click', () => toggleMenu());
    on(backdrop, 'click', () => closeMenu());

    // 导航中任意链接被点击后关闭
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

    // 全局暴露供 inline 调用
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
