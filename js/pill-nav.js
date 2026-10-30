/**
 * LA ESVASTICA PRIVATE LIMITED - PILLNAV (REACT BITS COMPONENT)
 * Interactive Glider Physics, Dot Indicator, and Header Glass Scroll Tracking
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', initPillNav);

  function initPillNav() {
    const header = document.querySelector('.site-header');
    const track = document.querySelector('.nav-links');

    initHeaderScroll(header);
    if (!track) return;

    // Create PillNav micro-elements if not already in DOM
    let glider = track.querySelector('.pill-nav__glider');
    if (!glider) {
      glider = document.createElement('div');
      glider.className = 'pill-nav__glider';
      track.appendChild(glider);
    }

    let activeFill = track.querySelector('.pill-nav__active-fill');
    if (!activeFill) {
      activeFill = document.createElement('div');
      activeFill.className = 'pill-nav__active-fill';
      track.appendChild(activeFill);
    }

    let dot = track.querySelector('.pill-nav__dot');
    if (!dot) {
      dot = document.createElement('div');
      dot.className = 'pill-nav__dot';
      track.appendChild(dot);
    }

    // Navigation elements
    const dropdown = track.querySelector('.nav-dropdown');
    const dropdownTrigger = dropdown ? dropdown.querySelector('.nav-dropdown-trigger') : null;
    const directLinks = Array.from(track.querySelectorAll(':scope > .nav-link'));

    // Combined list of track items
    const allItems = [...directLinks];
    if (dropdownTrigger && !allItems.includes(dropdownTrigger)) {
      allItems.push(dropdownTrigger);
    }

    // Exact coordinate helper relative to track
    function getCoords(element) {
      if (!element || !track) return null;
      const trackRect = track.getBoundingClientRect();
      const elRect = element.getBoundingClientRect();
      return {
        left: Math.round(elRect.left - trackRect.left),
        width: Math.round(elRect.width)
      };
    }

    function getActiveItem() {
      for (let i = 0; i < allItems.length; i++) {
        const item = allItems[i];
        if (item.classList.contains('active') || item.getAttribute('aria-current') === 'page') {
          return item;
        }
      }
      return null;
    }

    function updateActiveState() {
      const activeItem = getActiveItem();
      if (activeItem) {
        const coords = getCoords(activeItem);
        if (coords && coords.width > 0) {
          activeFill.style.transform = `translateX(${coords.left}px)`;
          activeFill.style.width = `${coords.width}px`;
          activeFill.style.opacity = '1';

          dot.style.transform = `translateX(${coords.left + coords.width / 2}px)`;
          dot.style.opacity = '1';
          return;
        }
      }
      activeFill.style.opacity = '0';
      dot.style.opacity = '0';
    }

    function moveGliderTo(element) {
      if (!element) {
        glider.style.opacity = '0';
        return;
      }

      // If hovering over the active item, hide the glider so active fill is shown
      if (element.classList.contains('active') || element.getAttribute('aria-current') === 'page') {
        glider.style.opacity = '0';
        return;
      }

      const coords = getCoords(element);
      if (coords && coords.width > 0) {
        glider.style.transform = `translateX(${coords.left}px)`;
        glider.style.width = `${coords.width}px`;
        glider.style.opacity = '1';
      }
    }

    function resetGlider() {
      glider.style.opacity = '0';
      const activeItem = getActiveItem();
      if (activeItem) {
        const coords = getCoords(activeItem);
        if (coords && coords.width > 0) {
          glider.style.transform = `translateX(${coords.left}px)`;
          glider.style.width = `${coords.width}px`;
        }
      }
    }

    // Attach listeners for direct links (Home, About Us, Contact)
    directLinks.forEach((link) => {
      link.addEventListener('mouseenter', () => moveGliderTo(link));
      link.addEventListener('focus', () => moveGliderTo(link));
    });

    // Attach listeners for Divisions dropdown
    if (dropdown && dropdownTrigger) {
      // Hovering either the trigger or anywhere in the dropdown tree anchors glider on Divisions
      dropdown.addEventListener('mouseenter', () => {
        moveGliderTo(dropdownTrigger);
      });

      dropdownTrigger.addEventListener('focus', () => {
        moveGliderTo(dropdownTrigger);
      });

      dropdown.addEventListener('mouseleave', (e) => {
        if (!track.contains(e.relatedTarget)) {
          resetGlider();
        }
      });
    }

    track.addEventListener('mouseleave', (e) => {
      if (!track.contains(e.relatedTarget)) {
        resetGlider();
        updateActiveState();
      }
    });

    track.addEventListener('focusout', (e) => {
      if (!track.contains(e.relatedTarget)) {
        resetGlider();
        updateActiveState();
      }
    });

    // Initial update and re-sync on fonts load and window resize
    updateActiveState();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateActiveState);
    }
    window.addEventListener('load', updateActiveState);
    window.addEventListener('resize', debounce(updateActiveState, 80));

    // Observe active class changes dynamically
    const observer = new MutationObserver(() => {
      updateActiveState();
    });

    allItems.forEach((item) => {
      observer.observe(item, { attributes: true, attributeFilter: ['class', 'aria-current'] });
    });

    setTimeout(updateActiveState, 100);
    setTimeout(updateActiveState, 300);
  }

  function initHeaderScroll(header) {
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 25) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function debounce(fn, ms) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), ms);
    };
  }
})();
