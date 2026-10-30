/**
 * LA ESVASTICA PRIVATE LIMITED - CORE JAVASCRIPT
 * Header scroll state, toast notifications, and global helpers
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initCurrentYear();
  initSmoothScroll();
});

// Sticky Header Box-Shadow on Scroll
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// Auto-update footer copyright year
function initCurrentYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// Accessible smooth scroll for in-page anchors
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        targetEl.focus({ preventScroll: true });
      }
    });
  });
}

// Global Accessible Toast Notification
window.showToast = function(message, type = 'success') {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `toast show ${type === 'error' ? 'toast-error' : 'toast-success'}`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
};
