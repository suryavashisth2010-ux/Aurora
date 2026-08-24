/**
 * Aurora — Considered Skincare
 * main.js: Parallax, nav scroll behaviour, newsletter form
 */

(() => {
  'use strict';

  /* ----------------------------------------------------------
     Utilities
     ---------------------------------------------------------- */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* Throttle using rAF — avoids scroll jank */
  function onScroll(fn) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => { fn(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
  }

  /* Prefer reduced motion */
  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     Parallax
     Elements carry data-parallax="<speed>" where speed is a
     fraction of scroll offset.  Positive = moves down, negative = up.
     ---------------------------------------------------------- */
  function initParallax() {
    if (prefersReducedMotion) return;

    const els = qsa('[data-parallax]');
    if (!els.length) return;

    function applyParallax() {
      const scrollY = window.scrollY;
      els.forEach(el => {
        const rect  = el.getBoundingClientRect();
        const speed = parseFloat(el.dataset.parallax) || 0;
        // Only animate elements near the viewport
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;

        const center = rect.top + rect.height / 2;
        const offset = (center - window.innerHeight / 2) * speed;
        el.style.transform = `translateY(${offset.toFixed(2)}px)`;
      });
    }

    onScroll(applyParallax);
    applyParallax(); // initial paint
  }

  /* ----------------------------------------------------------
     Nav: shrink + shadow on scroll
     ---------------------------------------------------------- */
  function initNav() {
    const nav = qs('.nav');
    if (!nav) return;

    function updateNav() {
      if (window.scrollY > 40) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }
    }

    onScroll(updateNav);
    updateNav();
  }

  /* ----------------------------------------------------------
     Animate sections on enter (simple IntersectionObserver)
     ---------------------------------------------------------- */
  function initReveal() {
    if (prefersReducedMotion) return;

    const style = document.createElement('style');
    style.textContent = `
      .reveal {
        opacity: 0;
        transform: translateY(22px);
        transition: opacity 600ms cubic-bezier(0.22, 0.61, 0.36, 1),
                    transform 600ms cubic-bezier(0.22, 0.61, 0.36, 1);
      }
      .reveal.is-visible {
        opacity: 1;
        transform: none;
      }
    `;
    document.head.appendChild(style);

    const targets = qsa(
      '.product-card, .story__content, .story__image-primary, ' +
      '.story__image-secondary, .quote blockquote, .footer__newsletter, ' +
      '.footer__nav, .footer__brand'
    );

    targets.forEach((el, i) => {
      el.classList.add('reveal');
      // Stagger siblings in product grid
      const delay = (i % 3) * 80;
      el.style.transitionDelay = `${delay}ms`;
    });

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach(el => observer.observe(el));
  }

  /* ----------------------------------------------------------
     Newsletter form
     ---------------------------------------------------------- */
  function initNewsletterForm() {
    const form = qs('.newsletter-form');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = qs('.newsletter-form__input', form);
      const email = input.value.trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        input.style.borderColor = 'rgba(181, 98, 58, 0.8)';
        input.focus();
        return;
      }

      // Reset colour on valid submit
      input.style.borderColor = '';

      // Replace form with confirmation
      const confirmation = document.createElement('p');
      confirmation.style.cssText = `
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.25rem;
        font-style: italic;
        color: rgba(247,244,239,0.75);
        line-height: 1.5;
      `;
      confirmation.textContent = 'Noted. You'll hear from us when it's worth it.';
      form.replaceWith(confirmation);
    });
  }

  /* ----------------------------------------------------------
     Nav active link highlight on scroll
     ---------------------------------------------------------- */
  function initActiveLinks() {
    const sections = qsa('section[id], footer[id]');
    const links    = qsa('.nav__links a');
    if (!sections.length || !links.length) return;

    function updateActive() {
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) {
          current = sec.id;
        }
      });
      links.forEach(link => {
        const href = link.getAttribute('href')?.replace('#', '');
        link.style.color = href === current
          ? 'var(--color-ink)'
          : '';
      });
    }

    onScroll(updateActive);
  }

  /* ----------------------------------------------------------
     Init
     ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initParallax();
    initReveal();
    initNewsletterForm();
    initActiveLinks();
  });

})();
