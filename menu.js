function setupMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const menuOverlay = document.getElementById('menu-overlay');
  const closeMenu = document.getElementById('close-menu');
  if (!menuBtn || !menuOverlay || !closeMenu) return;
  menuBtn.addEventListener('click', () => {
    menuOverlay.classList.add('active');
    menuOverlay.style.display = 'flex';
    menuOverlay.setAttribute('aria-hidden', 'false');
    document.querySelectorAll('.menu-link').forEach(link => {
      link.style.animation = 'none';
      void link.offsetWidth;
      link.style.animation = '';
    });
  });
  closeMenu.addEventListener('click', () => {
    menuOverlay.classList.remove('active');
    setTimeout(() => {
      menuOverlay.style.display = 'none';
      menuOverlay.setAttribute('aria-hidden', 'true');
    }, 350);
  });
  menuOverlay.addEventListener('click', (e) => {
    if (e.target === menuOverlay) {
      menuOverlay.classList.remove('active');
      setTimeout(() => {
        menuOverlay.style.display = 'none';
        menuOverlay.setAttribute('aria-hidden', 'true');
      }, 350);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupMenu);
} else {
  setupMenu();
} 