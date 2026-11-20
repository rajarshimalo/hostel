/* ══════════════════════════════════════════════════════════
   PATHFINDER NEST — JAVASCRIPT
   Interactions, Animations, Scroll Reveal
══════════════════════════════════════════════════════════ */

'use strict';

/* ── DOM READY ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initNav();
  initMobileMenu();
  initBookingDrawer();
  initRoomToggle();
  initDraggableGallery();
  initBookingForm();
  initHeroParallax();
  setMinCheckoutDate();
});

/* ── SCROLL REVEAL ───────────────────────────────────────── */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings within the same parent
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
        const idx = siblings.indexOf(entry.target);
        const delay = Math.min(idx * 80, 320);

        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -48px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
}

/* ── STICKY NAV ──────────────────────────────────────────── */
function initNav() {
  const nav = document.getElementById('nav');
  const telBar = document.querySelector('.telemetry-bar');
  const telH = telBar ? telBar.offsetHeight : 32;

  const updateNav = () => {
    if (window.scrollY > telH + 10) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
}

/* ── MOBILE MENU ─────────────────────────────────────────── */
function initMobileMenu() {
  const hamburger = document.getElementById('nav-hamburger');
  const menu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');
  const links = menu.querySelectorAll('.mobile-nav-link');

  const openMenu = () => {
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);
  links.forEach(link => link.addEventListener('click', closeMenu));

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

/* ── BOOKING DRAWER ──────────────────────────────────────── */
function initBookingDrawer() {
  const triggers = document.querySelectorAll('#book-trigger, #hero-book');
  const drawer = document.getElementById('booking-drawer');
  const backdrop = document.getElementById('booking-drawer-backdrop');
  const closeBtn = document.getElementById('booking-drawer-close');

  const openDrawer = () => {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  window.closeBookingDrawer = () => {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  triggers.forEach(t => t.addEventListener('click', openDrawer));
  backdrop.addEventListener('click', window.closeBookingDrawer);
  closeBtn.addEventListener('click', window.closeBookingDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      window.closeBookingDrawer();
    }
  });
}

/* ── ROOM TOGGLE ─────────────────────────────────────────── */
function initRoomToggle() {
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const cards = document.querySelectorAll('.room-card');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      toggleBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;

      cards.forEach((card) => {
        const type = card.dataset.type;
        const show = filter === 'all' || type === filter;

        if (show) {
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(16px)';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          });
        } else {
          card.style.transition = 'opacity 0.25s ease';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

/* ── DRAGGABLE GALLERY ───────────────────────────────────── */
function initDraggableGallery() {
  const wrap = document.querySelector('.gallery-track-wrap');
  const track = document.getElementById('gallery-track');
  if (!wrap || !track) return;

  // Check if on touch device — use CSS scroll-snap instead of JS drag
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  if (isTouchDevice) {
    // On touch, rely on native CSS scroll-snap (set in CSS)
    // No JS drag needed — the browser handles smooth, card-by-card snapping
    return;
  }

  // Desktop: custom drag with momentum
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;
  let velocity = 0;
  let lastX = 0;
  let lastTime = 0;
  let rafId = null;

  wrap.addEventListener('mousedown', (e) => {
    isDragging = true;
    wrap.classList.add('is-dragging');
    startX = e.pageX - wrap.offsetLeft;
    scrollLeft = wrap.scrollLeft;
    lastX = e.pageX;
    lastTime = Date.now();
    velocity = 0;
    cancelAnimationFrame(rafId);
  });

  wrap.addEventListener('mouseleave', () => {
    if (!isDragging) return;
    isDragging = false;
    wrap.classList.remove('is-dragging');
    applyMomentum();
  });

  wrap.addEventListener('mouseup', () => {
    isDragging = false;
    wrap.classList.remove('is-dragging');
    applyMomentum();
  });

  wrap.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - wrap.offsetLeft;
    const walk = (x - startX) * 1.2;
    const now = Date.now();
    const dt = Math.max(now - lastTime, 1);
    velocity = (e.pageX - lastX) / dt * 16; // normalise to ~60fps
    lastX = e.pageX;
    lastTime = now;
    wrap.scrollLeft = scrollLeft - walk;
  });

  function applyMomentum() {
    if (Math.abs(velocity) < 0.5) return;
    velocity *= 0.95;
    wrap.scrollLeft -= velocity;
    if (Math.abs(velocity) > 0.4) {
      rafId = requestAnimationFrame(applyMomentum);
    }
  }
}

/* ── BOOKING FORM ────────────────────────────────────────── */
function initBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const checkin = form.querySelector('#checkin').value;
    const checkout = form.querySelector('#checkout').value;

    // Simple validation
    if (!name || !email || !checkin || !checkout) {
      shakeForm(form);
      return;
    }

    if (!isValidEmail(email)) {
      shakeForm(form);
      return;
    }

    if (new Date(checkout) <= new Date(checkin)) {
      shakeForm(form);
      return;
    }

    // Simulate success
    showToast(`Your nest is waiting, ${name.split(' ')[0]}! We'll be in touch within 2 hours.`);
    form.reset();
  });
}

function shakeForm(form) {
  form.style.animation = 'none';
  requestAnimationFrame(() => {
    form.style.animation = 'shake 0.4s ease';
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ── TOAST ───────────────────────────────────────────────── */
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  const msgEl = toast.querySelector('.toast-msg');
  if (msgEl) msgEl.textContent = msg;

  toast.classList.add('is-visible');
  setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 5000);
}

/* ── HERO SUBTLE PARALLAX ────────────────────────────────── */
function initHeroParallax() {
  const heroImg = document.querySelector('.hero-bg-img');
  if (!heroImg) return;

  // Only run on desktop
  const mq = window.matchMedia('(min-width: 768px)');
  if (!mq.matches) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroH = document.querySelector('.hero')?.offsetHeight || 0;
    if (scrollY > heroH) return;

    const pct = scrollY / heroH;
    heroImg.style.transform = `scale(1.05) translateY(${pct * 6}%)`;
  }, { passive: true });
}

/* ── SET MIN CHECKOUT DATE ───────────────────────────────── */
function setMinCheckoutDate() {
  const checkinInput = document.querySelector('#checkin');
  const checkoutInput = document.querySelector('#checkout');
  if (!checkinInput || !checkoutInput) return;

  // Set today as min for checkin
  const today = new Date().toISOString().split('T')[0];
  checkinInput.min = today;
  checkoutInput.min = today;

  checkinInput.addEventListener('change', () => {
    if (checkinInput.value) {
      const minCheckout = new Date(checkinInput.value);
      minCheckout.setDate(minCheckout.getDate() + 1);
      checkoutInput.min = minCheckout.toISOString().split('T')[0];

      if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
        checkoutInput.value = minCheckout.toISOString().split('T')[0];
      }
    }
  });
}

/* ── SHAKE ANIMATION (injected CSS) ─────────────────────── */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    15%       { transform: translateX(-8px); }
    30%       { transform: translateX(8px); }
    45%       { transform: translateX(-6px); }
    60%       { transform: translateX(6px); }
    75%       { transform: translateX(-4px); }
    90%       { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);

/* ── ACTIVE NAV LINKS ON SCROLL ──────────────────────────── */
(function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = '';
          link.style.borderBottomColor = '';
        });
        const id = entry.target.id;
        const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
        if (activeLink) {
          activeLink.style.color = 'var(--ink-primary)';
        }
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();

