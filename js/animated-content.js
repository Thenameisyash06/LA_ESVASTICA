/**
 * LA ESVASTICA PRIVATE LIMITED - ANIMATED CONTENT CONTROLLER
 * Faithful vanilla JS implementation of React Bits <AnimatedContent />
 * Supports whole-website scroll-up animations for both text sections and card elements
 * (Vertical cards, Feature boxes, Director cards, Step cards, Form cards, Hero stats)
 * Supports GSAP + ScrollTrigger with seamless IntersectionObserver CSS fallback
 */

(function () {
  'use strict';

  // Mark HTML with .js class for progressive styling
  document.documentElement.classList.add('js');

  const WIPES = {
    up: 'linear-gradient(to top, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
    down: 'linear-gradient(to bottom, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
    left: 'linear-gradient(to left, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
    right: 'linear-gradient(to right, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
    center: 'radial-gradient(farthest-corner at 50% 50%, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))'
  };

  const isReducedMotion = () => {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  };

  /**
   * Initializes a single AnimatedContent element using GSAP + ScrollTrigger
   */
  function animateWithGSAP(el, options = {}) {
    if (!window.gsap) return false;
    if (window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }

    // Pronounced defaults: 85px travel, 1.4s duration, 0.94 scale, 0.18 threshold
    const distance = Number(options.distance ?? el.dataset.distance ?? 85);
    const direction = options.direction || el.dataset.direction || 'vertical';
    const reverse = (options.reverse ?? el.dataset.reverse) === true || el.dataset.reverse === 'true';
    const duration = Number(options.duration ?? el.dataset.duration ?? 1.4);
    const ease = options.ease || el.dataset.ease || 'power3.out';
    const initialOpacity = Number(options.initialOpacity ?? el.dataset.initialOpacity ?? 0);
    const animateOpacity = (options.animateOpacity ?? el.dataset.animateOpacity) !== false && el.dataset.animateOpacity !== 'false';
    const scale = Number(options.scale ?? el.dataset.scale ?? 0.94);
    const blur = Number(options.blur ?? el.dataset.blur ?? 0);
    const rotate = Number(options.rotate ?? el.dataset.rotate ?? 0);
    const tilt = Number(options.tilt ?? el.dataset.tilt ?? 0);
    const wipe = options.wipe || el.dataset.wipe || 'none';
    const threshold = Number(options.threshold ?? el.dataset.threshold ?? 0.18);
    const delay = Number(options.delay ?? el.dataset.delay ?? 0);
    const stagger = Number(options.stagger ?? el.dataset.stagger ?? 0);
    const staggerFrom = options.staggerFrom || el.dataset.staggerFrom || 'start';
    const trigger = options.trigger || el.dataset.trigger || 'scroll';
    const once = (options.once ?? el.dataset.once) !== false && el.dataset.once !== 'false';
    const scrub = options.scrub ?? el.dataset.scrub ?? false;
    const disappearAfter = Number(options.disappearAfter ?? el.dataset.disappearAfter ?? 0);
    const disappearDuration = Number(options.disappearDuration ?? el.dataset.disappearDuration ?? 0.6);
    const disappearEase = options.disappearEase || el.dataset.disappearEase || 'power3.in';

    const targets = stagger > 0 && el.children.length ? Array.from(el.children) : [el];
    const horizontal = direction === 'horizontal';
    const axis = horizontal ? 'x' : 'y';
    const sign = reverse ? -1 : 1;
    const mask = WIPES[wipe];

    window.gsap.set(el, { visibility: 'visible' });

    if (isReducedMotion()) {
      window.gsap.set(targets, { opacity: 1, x: 0, y: 0, scale: 1, filter: 'none' });
      return true;
    }

    const from = {
      [axis]: distance * sign,
      scale,
      opacity: animateOpacity ? initialOpacity : 1
    };

    const to = {
      [axis]: 0,
      scale: 1,
      opacity: 1,
      duration,
      ease
    };

    if (blur > 0) {
      from.filter = `blur(${blur}px)`;
      to.filter = 'blur(0px)';
    }

    if (rotate) {
      from.rotation = rotate * sign;
      to.rotation = 0;
    }

    if (tilt) {
      const tiltAxis = horizontal ? 'rotationY' : 'rotationX';
      from[tiltAxis] = horizontal ? -tilt * sign : tilt * sign;
      to[tiltAxis] = 0;
      from.transformPerspective = 900;
      to.transformPerspective = 900;
    }

    if (mask) {
      window.gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });
      from['--ac-wipe'] = 0;
      to['--ac-wipe'] = 1;
    }

    if (stagger > 0) {
      to.stagger = { each: stagger, from: staggerFrom };
    }

    const settle = () => {
      if (scrub) return;
      window.gsap.set(targets, {
        clearProps: mask ? 'filter,transform,maskImage,webkitMaskImage' : 'filter,transform'
      });
      el.classList.add('animated-content-settled');
    };

    const disappear = () => {
      if (disappearAfter <= 0) return;
      const out = {
        [axis]: -distance * sign,
        scale: 0.85,
        opacity: animateOpacity ? initialOpacity : 0,
        delay: disappearAfter,
        duration: disappearDuration,
        ease: disappearEase
      };
      if (blur > 0) out.filter = `blur(${blur}px)`;
      if (stagger > 0) out.stagger = { each: stagger, from: staggerFrom };
      window.gsap.to(targets, out);
    };

    const tl = window.gsap.timeline({
      paused: true,
      onComplete: () => {
        settle();
        if (once && !scrub) disappear();
      }
    });

    tl.fromTo(targets, from, to, scrub ? 0 : Math.max(delay, 0));

    if (trigger === 'mount') {
      tl.play();
      return true;
    }

    if (!window.ScrollTrigger) {
      tl.play();
      return true;
    }

    // Trigger when element reaches top 82% of screen
    const start = `top ${(1 - threshold) * 100}%`;

    if (scrub) {
      window.ScrollTrigger.create({
        trigger: el,
        start,
        end: `top ${Math.max((1 - threshold) * 100 - 45, 5)}%`,
        scrub: scrub === true ? true : Math.max(Number(scrub) || 0, 0.01),
        animation: tl
      });
      return true;
    }

    window.ScrollTrigger.create({
      trigger: el,
      start,
      once,
      onEnter: () => tl.play(),
      onLeaveBack: once
        ? undefined
        : () => {
            if (mask) window.gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });
            tl.reverse();
          }
    });

    return true;
  }

  /**
   * High-performance CSS / IntersectionObserver fallback if GSAP is not present
   */
  function animateWithFallback(el) {
    if (isReducedMotion()) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }

    const distance = Number(el.dataset.distance || 80);
    const duration = Number(el.dataset.duration || 1.4);
    const delay = Number(el.dataset.delay || 0);
    const stagger = Number(el.dataset.stagger || 0);
    const threshold = Number(el.dataset.threshold || 0.18);

    const targets = stagger > 0 && el.children.length ? Array.from(el.children) : [el];

    targets.forEach((target, i) => {
      target.style.opacity = '0';
      target.style.transform = `translate3d(0, ${distance}px, 0) scale(0.94)`;
      target.style.transition = `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay + i * stagger}s, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay + i * stagger}s`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          targets.forEach(target => {
            target.style.opacity = '1';
            target.style.transform = 'translate3d(0, 0, 0) scale(1)';
          });
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: Math.min(Math.max(threshold, 0), 1)
    });

    observer.observe(el);
  }

  /**
   * Automatically scans and decorates website sections, text headers AND card components
   */
  function initWebsiteScrollAnimations() {
    // 1. Explicitly tagged elements
    const taggedElements = document.querySelectorAll('.animated-content, [data-animated-content]');
    taggedElements.forEach(el => {
      if (!animateWithGSAP(el)) {
        animateWithFallback(el);
      }
    });

    // 2. Hero Elements (Smooth 1.5s entrance on page mount with distinct cascade)
    document.querySelectorAll('.hero-content').forEach(hero => {
      hero.setAttribute('data-animated-content', 'true');
      hero.setAttribute('data-trigger', 'mount');
      hero.setAttribute('data-distance', '70');
      hero.setAttribute('data-duration', '1.5');
      hero.setAttribute('data-delay', '0.15');
      hero.setAttribute('data-stagger', '0.2');
      hero.setAttribute('data-scale', '0.96');
      if (!animateWithGSAP(hero)) animateWithFallback(hero);
    });

    // Hero image card and floating card on mount
    document.querySelectorAll('.hero-image-card').forEach(heroCard => {
      heroCard.setAttribute('data-animated-content', 'true');
      heroCard.setAttribute('data-trigger', 'mount');
      heroCard.setAttribute('data-distance', '60');
      heroCard.setAttribute('data-duration', '1.6');
      heroCard.setAttribute('data-delay', '0.3');
      heroCard.setAttribute('data-scale', '0.94');
      if (!animateWithGSAP(heroCard)) animateWithFallback(heroCard);
    });

    // Hero stats row (Staggered badges)
    document.querySelectorAll('.hero-stats-row').forEach(stats => {
      stats.setAttribute('data-animated-content', 'true');
      stats.setAttribute('data-trigger', 'mount');
      stats.setAttribute('data-distance', '40');
      stats.setAttribute('data-duration', '1.3');
      stats.setAttribute('data-delay', '0.5');
      stats.setAttribute('data-stagger', '0.15');
      stats.setAttribute('data-scale', '0.95');
      if (!animateWithGSAP(stats)) animateWithFallback(stats);
    });

    // 3. Section Titles & Subtitles (Starts when 18% into view, glides up 80px over 1.4s)
    document.querySelectorAll('.section-header, .page-header-content').forEach(header => {
      if (!header.hasAttribute('data-animated-content')) {
        header.setAttribute('data-animated-content', 'true');
        header.setAttribute('data-distance', '75');
        header.setAttribute('data-duration', '1.4');
        header.setAttribute('data-threshold', '0.18');
        header.setAttribute('data-scale', '0.96');
        if (!animateWithGSAP(header)) animateWithFallback(header);
      }
    });

    // 4. Card Grids: Staggers all child cards with a 1.4s glide & 0.18s cascade
    const cardGridSelectors = [
      '.vertical-grid',          // Flagship business divisions on index.html
      '.feature-grid-2',         // Vision & Mission cards on about.html, service pairs
      '.feature-grid-3',         // Technology & operational cards, deployment models
      '.feature-grid-4',         // Capabilities cards, 4-step workflow, 4-phase roadmap
      '.director-grid',          // Executive leadership cards (Sanjay Soni & Jeel Soni)
      '.comparison-table-wrapper', // Gold testing spectrometry vs touchstone table
      '.trust-strip'             // Bank of India trust bar
    ];

    cardGridSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(grid => {
        if (!grid.hasAttribute('data-animated-content')) {
          grid.setAttribute('data-animated-content', 'true');
          grid.setAttribute('data-distance', '85');
          grid.setAttribute('data-duration', '1.4');
          grid.setAttribute('data-stagger', '0.18');
          grid.setAttribute('data-threshold', '0.16');
          grid.setAttribute('data-scale', '0.93');
          if (!animateWithGSAP(grid)) animateWithFallback(grid);
        }
      });
    });

    // 5. Standalone Individual Cards (Form cards, Consultation cards, Standalone boxes)
    const individualCardSelectors = [
      '.form-card',              // Main inquiry form cards across all pages
      '.step-card',              // Workflow step cards
      '.vertical-card',          // Vertical division cards (fallback if outside grid)
      '.feature-box',            // Feature cards (fallback if outside grid)
      '.director-card',          // Leadership cards (fallback if outside grid)
      '.hero-floating-card'      // Floating metric cards
    ];

    individualCardSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(card => {
        // Only attach if card isn't already inside an animated grid container
        if (!card.closest('[data-animated-content]') && !card.hasAttribute('data-animated-content')) {
          card.setAttribute('data-animated-content', 'true');
          card.setAttribute('data-distance', '80');
          card.setAttribute('data-duration', '1.4');
          card.setAttribute('data-threshold', '0.18');
          card.setAttribute('data-scale', '0.94');
          if (!animateWithGSAP(card)) animateWithFallback(card);
        }
      });
    });
  }

  // Initialize on DOMContentLoaded and on window load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initWebsiteScrollAnimations();
    });
  } else {
    initWebsiteScrollAnimations();
  }

  // Expose helper globally for custom programmatic animations
  window.AnimatedContent = {
    init: initWebsiteScrollAnimations,
    animate: animateWithGSAP
  };

})();
