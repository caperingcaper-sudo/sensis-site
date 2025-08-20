/* ===== common.js: minimal, safe, final ===== */
(function () {
  const LANG_KEY     = 'sensis.lang';
  const DEFAULT_LANG = (document.documentElement.dataset.lang || 'en');

  /* ---------- 工具 ---------- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);

  /* ---------- 语言切换 ---------- */
  function applyLang(lang){
    if (!lang) return;
    document.documentElement.setAttribute('data-lang', lang);
    $$('.langs .lang').forEach(btn=>{
      const active = btn.dataset.lang === lang;
      btn.classList.toggle('is-active', active);
      if (active) btn.setAttribute('aria-current','true');
      else btn.removeAttribute('aria-current');
    });
    try { localStorage.setItem(LANG_KEY, lang); } catch(_) {}
  }
  function switchLang(lang){ applyLang(lang); }
  window.switchLang = switchLang; // 暴露给 HTML

  function initLang(){
    let lang = DEFAULT_LANG;
    try { const saved = localStorage.getItem(LANG_KEY); if (saved) lang = saved; } catch(_){}
    applyLang(lang);
    $$('.langs .lang').forEach(btn => on(btn, 'click', () => switchLang(btn.dataset.lang)));
  }

  /* ---------- 移动抽屉 ---------- */
  const menuState = { open:false };
  function setMenu(open){
    menuState.open = !!open;
    document.body.classList.toggle('drawer-open', menuState.open);
    const btn = $('.fab-menu'); const bd = $('.backdrop');
    if (btn) btn.setAttribute('aria-expanded', menuState.open ? 'true' : 'false');
    if (bd)  bd.hidden = !menuState.open;
  }
  function toggleMenu(force){
    if (typeof force === 'boolean') setMenu(force);
    else setMenu(!menuState.open);
  }
  window.toggleMenu = toggleMenu; // 暴露给 HTML

  function initMenu(){
    const btn = $('.fab-menu'); const bd = $('.backdrop'); const aside = $('aside');
    on(btn, 'click', () => toggleMenu());
    on(bd,  'click', () => toggleMenu(false));
    on(document, 'keydown', e => { if (e.key === 'Escape' && menuState.open) toggleMenu(false); });
    if (aside) $$('a', aside).forEach(a => on(a, 'click', () => toggleMenu(false)));
  }

  /* ---------- 初始化 ---------- */
  function init(){ initLang(); initMenu(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* ---------- 兜底（极端情况） ---------- */
  if (!window.toggleMenu) {
    window.toggleMenu = function(force){
      const open = (typeof force === 'boolean') ? force : !document.body.classList.contains('drawer-open');
      document.body.classList.toggle('drawer-open', open);
      const btn = document.querySelector('.fab-menu'); const bd = document.querySelector('.backdrop');
      if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (bd)  bd.hidden = !open;
    };
  }

  // 调试提示（加载就会在控制台看到）
  try { console.log('[common.js] loaded OK'); } catch(_){}
})();
