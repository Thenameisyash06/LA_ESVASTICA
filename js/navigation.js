/**
 * LA ESVASTICA PRIVATE LIMITED - NAVIGATION JAVASCRIPT
 * Mobile drawer menu, keyboard focus trap, and active link detection
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initDropdownMenus();
  highlightActiveLink();
});

function initDropdownMenus() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    const menu = dropdown.querySelector('.nav-dropdown-menu');
    if (!trigger || !menu) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', !isExpanded);
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
    });
  });
}

function initMobileNavigation() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const closeBtn = document.querySelector('.drawer-close');
  const backdrop = document.querySelector('.drawer-backdrop');

  if (!toggleBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add('is-open');
    if (backdrop) backdrop.classList.add('is-visible');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-visible');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    toggleBtn.focus();
  }

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('is-open');
    if (isOpen) closeDrawer();
    else openDrawer();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  // Close on Esc key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  // Close drawer when an internal navigation link is clicked
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });
}

function highlightActiveLink() {
  let currentPath = window.location.pathname;
  let rawPage = currentPath.substring(currentPath.lastIndexOf('/') + 1).toLowerCase();
  
  // Normalize root, empty, or extensionless /index to index.html
  if (!rawPage || rawPage === '' || rawPage === 'index') {
    rawPage = 'index.html';
  } else if (!rawPage.endsWith('.html') && !rawPage.includes('.')) {
    // If accessed via extensionless clean path (e.g. /about), normalize to about.html
    rawPage = rawPage + '.html';
  }

  const navLinks = document.querySelectorAll('.nav-link, .drawer-nav a, .dropdown-item, .branched-menu__item');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    let cleanHref = href.split('#')[0].split('?')[0].toLowerCase();
    if (cleanHref === './' || cleanHref === '/' || cleanHref === 'index') {
      cleanHref = 'index.html';
    }

    link.classList.remove('active');
    link.removeAttribute('aria-current');

    if (cleanHref === rawPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');

      // If item is inside divisions dropdown, highlight parent dropdown trigger
      const parentDropdown = link.closest('.nav-dropdown');
      if (parentDropdown) {
        const trigger = parentDropdown.querySelector('.nav-dropdown-trigger');
        if (trigger) trigger.classList.add('active');
      }
    }
  });
}
