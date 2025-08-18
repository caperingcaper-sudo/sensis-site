(function () {
  const body = document.body;
  const fab  = document.querySelector('.fab-menu');
  const backdrop = document.querySelector('.backdrop');
  let lastScrollY = 0;

  // 切换抽屉
  window.toggleMenu = function toggleMenu() {
    const open = !body.classList.contains('menu-open');
    if (open) {
      lastScrollY = window.scrollY;
      body.classList.add('menu-open');
      body.style.top = `-${lastScrollY}px`;       // 锁滚动（iOS 也稳）
      body.style.position = 'fixed';
      if (backdrop) backdrop.hidden = false;
      if (fab) fab.setAttribute('aria-expanded', 'true');
    } else {
      body.classList.remove('menu-open');
      body.style.position = '';
      body.style.top = '';
      window.scrollTo(0, lastScrollY);            // 恢复滚动位置
      if (backdrop) backdrop.hidden = true;
      if (fab) fab.setAttribute('aria-expanded', 'false');
    }
  };

  // 宽度变化：>1024 时确保复位（避免从小屏切到大屏时抽屉卡住）
  const mql = window.matchMedia('(max-width: 1024px)');
  function ensureState() {
    if (!mql.matches) {
      document.body.classList.remove('menu-open');
      document.body.style.position = '';
      document.body.style.top = '';
      if (backdrop) backdrop.hidden = true;
      if (fab) fab.setAttribute('aria-expanded', 'false');
    }
  }
  mql.addEventListener ? mql.addEventListener('change', ensureState)
                       : mql.addListener(ensureState);

  // 键盘无障碍：Esc 关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) {
      toggleMenu();
    }
  });
})();
