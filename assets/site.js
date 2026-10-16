(() => {
  'use strict';
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('primaryNav');
  const menuPath = document.getElementById('menuPath');
  const mobile = window.matchMedia('(max-width: 960px)');
  const menuLinks = [...nav.querySelectorAll('a')];
  let menuOpen = false;
  function setMenu(open, returnFocus = false) {
    menuOpen = Boolean(open && mobile.matches);
    nav.hidden = mobile.matches && !menuOpen;
    toggle.setAttribute('aria-expanded', String(menuOpen));
    toggle.setAttribute('aria-label', menuOpen ? '關閉導覽選單' : '開啟導覽選單');
    menuPath.setAttribute('d', menuOpen ? 'M6 6l12 12M6 18L18 6' : 'M4 6h16M4 12h16M4 18h16');
    if (returnFocus) toggle.focus();
  }
  toggle.hidden = false;
  setMenu(false);
  toggle.addEventListener('click', () => setMenu(!menuOpen));
  mobile.addEventListener('change', () => {
    const hiddenFocus = mobile.matches && nav.contains(document.activeElement);
    setMenu(false, hiddenFocus);
  });
  menuLinks.forEach(link => link.addEventListener('click', () => {
    if (mobile.matches) setMenu(false, true);
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuOpen) setMenu(false, true);
  });
  document.addEventListener('click', event => {
    if (menuOpen && !nav.contains(event.target) && !toggle.contains(event.target)) setMenu(false);
  });
  document.addEventListener('focusin', event => {
    if (menuOpen && !nav.contains(event.target) && !toggle.contains(event.target)) setMenu(false);
  });
  const filters = [...document.querySelectorAll('.filter-tab')];
  const cards = [...document.querySelectorAll('.module-card')];
  const status = document.getElementById('filterStatus');
  filters.forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    cards.forEach(card => {
      card.hidden = category !== 'all' && card.dataset.category !== category;
      if (!card.hidden) count++;
    });
    status.textContent = '顯示 ' + count + ' 個系統模組';
  }));
  function revealTarget(hash) {
    let target;
    try { target = document.getElementById(decodeURIComponent(hash.slice(1))); } catch { return; }
    if (!target) return;
    let parent = target;
    while (parent) {
      if (parent.tagName === 'DETAILS') parent.open = true;
      parent = parent.parentElement;
    }
    return target;
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => revealTarget(link.hash)));
  window.addEventListener('hashchange', () => revealTarget(location.hash));
  if (location.hash) {
    const target = revealTarget(location.hash);
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  }
  const navigation = [...nav.querySelectorAll('.nav-link[href^="#"]')].map(link => ({link, section: document.querySelector(link.getAttribute('href'))})).filter(item => item.section);
  let scheduled = false;
  function updateNavigation() {
    const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header')) + 100;
    const current = navigation.filter(item => item.section.getBoundingClientRect().top <= offset).at(-1);
    navigation.forEach(item => {
      if (item === current) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    });
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateNavigation); }
  }, {passive:true});
  window.addEventListener('resize', updateNavigation);
  updateNavigation();
})();
