/**
 * LA ESVASTICA PRIVATE LIMITED - BRANCHED MENU CONTROLLER
 * Single-Trunk Tree Navigation: "Divisions" is the main dropdown button,
 * and all 4 divisions are direct interactive sub-items with curved SVG branches.
 */

(function () {
  'use strict';

  const TRUNK = 16;
  const RADIUS = 10;
  const INDENT = 42;
  const MARK_HEIGHT = 20;

  function initBranchedMenus() {
    const menus = document.querySelectorAll('.branched-menu');
    menus.forEach(setupSingleTrunkMenu);
  }

  function setupSingleTrunkMenu(menu) {
    const marker = menu.querySelector('.branched-menu__marker');
    const tree = menu.querySelector('.branched-menu__tree');
    if (!tree) return;

    const items = Array.from(tree.querySelectorAll('.branched-menu__item'));
    if (!items.length) return;

    const currentPath = window.location.pathname.toLowerCase();
    const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

    function buildTreeLines() {
      const count = items.length;
      const treeH = tree.offsetHeight || (count * 48 + 12);
      const r = RADIUS;
      const endX = INDENT - 8;

      let svg = tree.querySelector('.branched-menu__lines');
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'branched-menu__lines');
        svg.setAttribute('width', INDENT);
        svg.setAttribute('aria-hidden', 'true');
        tree.prepend(svg);
      }
      svg.setAttribute('height', treeH);

      // Compute exact row center Y for each item
      const rowYs = items.map(item => item.offsetTop + item.offsetHeight / 2);
      const lastRowY = rowYs[rowYs.length - 1];

      // Base vertical trunk line down to the last branch
      let svgContent = `<path class="branched-menu__base" d="M ${TRUNK} 0 V ${lastRowY - r}"></path>`;

      // Base branch curves for each item
      rowYs.forEach(y => {
        const branchPath = `M ${TRUNK} ${y - r} A ${r} ${r} 0 0 0 ${TRUNK + r} ${y} H ${endX}`;
        svgContent += `<path class="branched-menu__base" d="${branchPath}"></path>`;
      });

      // Reach active overlay paths for each item
      rowYs.forEach((y, k) => {
        const reachPath = `M ${TRUNK} 0 V ${y - r} A ${r} ${r} 0 0 0 ${TRUNK + r} ${y} H ${endX}`;
        const length = Math.round((y - r) + (Math.PI * r) / 2 + (endX - TRUNK - r));
        svgContent += `<path class="branched-menu__reach" data-reach-index="${k}" d="${reachPath}" style="stroke-dasharray: ${length}; stroke-dashoffset: ${length};"></path>`;
      });

      svg.innerHTML = svgContent;

      // Setup reach interactions
      const reachPaths = Array.from(svg.querySelectorAll('.branched-menu__reach'));
      let activeItem = null;

      items.forEach((item, k) => {
        const y = rowYs[k];
        const length = Math.round((y - r) + (Math.PI * r) / 2 + (endX - TRUNK - r));
        const reachEl = reachPaths[k];
        const href = item.getAttribute('href') || '';
        const cleanHref = href.split('#')[0].split('?')[0].toLowerCase();
        const isCurrent = cleanHref === currentPage;

        if (isCurrent) {
          activeItem = item;
          item.setAttribute('data-active', '');
          item.classList.add('active');
          if (reachEl) reachEl.style.strokeDashoffset = '0';
        }

        // Hover effect: draw golden reach line and glide marker
        item.addEventListener('mouseenter', () => {
          if (reachEl) reachEl.style.strokeDashoffset = '0';
          glideMarkerTo(item);
        });

        item.addEventListener('mouseleave', () => {
          if (reachEl && !item.hasAttribute('data-active')) {
            reachEl.style.strokeDashoffset = `${length}`;
          }
          if (activeItem) {
            glideMarkerTo(activeItem);
          }
        });
      });

      // Position initial marker
      if (activeItem) {
        glideMarkerTo(activeItem);
      } else if (items.length > 0) {
        glideMarkerTo(items[0]);
      }
    }

    function glideMarkerTo(item) {
      if (!marker || !item) return;
      const top = item.offsetTop + (item.offsetHeight - MARK_HEIGHT) / 2;
      marker.style.top = `${top}px`;
      marker.setAttribute('data-on', '');
    }

    // Delay slightly to ensure layout offsets are calculated
    setTimeout(buildTreeLines, 50);
    window.addEventListener('resize', buildTreeLines, { passive: true });

    // Rebuild when dropdown opens
    const parentDropdown = menu.closest('.nav-dropdown');
    if (parentDropdown) {
      const trigger = parentDropdown.querySelector('.nav-dropdown-trigger');
      if (trigger) {
        trigger.addEventListener('click', () => setTimeout(buildTreeLines, 40));
      }
      parentDropdown.addEventListener('mouseenter', () => setTimeout(buildTreeLines, 40));
    }
  }

  // Initialize on DOMContentLoaded and on window load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBranchedMenus);
  } else {
    initBranchedMenus();
  }

  window.initBranchedMenus = initBranchedMenus;
})();
