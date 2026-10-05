/* Cleaning_13 — interactions */
(function () {
  'use strict';

  /* ---------- header: absolute -> fixed on scroll ---------- */
  var header = document.getElementById('header');
  var hero = document.getElementById('hero');
  var ticking = false;

  function updateHeader() {
    var threshold = hero ? hero.offsetHeight - 120 : 400;
    if (window.scrollY > threshold) {
      header.classList.add('is-fixed');
    } else {
      header.classList.remove('is-fixed');
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
  updateHeader();

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobile-menu');
  var closeBtn = document.getElementById('mmenu-close');

  function openMenu() {
    menu.hidden = false;
    // force reflow so transition runs
    void menu.offsetHeight;
    menu.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function closeMenu() {
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    window.setTimeout(function () {
      if (!menu.classList.contains('is-open')) menu.hidden = true;
    }, 550);
  }

  if (burger && menu) {
    burger.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    menu.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- hero floating card slider ---------- */
  var slides = [
    { name: 'Генеральная уборка',   meta: '190 ₽', img: 'img/general.jpg' },
    { name: 'Поддерживающая уборка', meta: '170 ₽', img: 'img/maintenance.jpg' },
    { name: 'Уборка после ремонта',  meta: '220 ₽', img: 'img/after-renovation.jpg' }
  ];

  var nameEl = document.getElementById('hslide-name');
  var metaEl = document.getElementById('hslide-meta');
  var imgEl  = document.getElementById('hslide-img');
  var dotsEl = document.getElementById('hslide-dots');
  var current = 0;
  var timer = null;

  if (nameEl && metaEl && imgEl && dotsEl) {
    slides.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'hslide__dot' + (i === 0 ? ' is-active' : '');
      b.textContent = '0' + (i + 1);
      b.setAttribute('aria-label', s.name);
      b.addEventListener('click', function () { goTo(i); restart(); });
      dotsEl.appendChild(b);
    });

    var dots = dotsEl.querySelectorAll('.hslide__dot');

    function goTo(i) {
      if (i === current) return;
      current = i;
      var s = slides[i];
      imgEl.classList.add('is-fading');
      window.setTimeout(function () {
        nameEl.textContent = s.name;
        metaEl.textContent = s.meta;
        imgEl.src = s.img;
        imgEl.classList.remove('is-fading');
      }, 220);
      dots.forEach(function (d, di) {
        d.classList.toggle('is-active', di === i);
      });
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        goTo((current + 1) % slides.length);
      }, 4200);
    }

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!reduce.matches) restart();
  }

  /* ---------- services rail ---------- */
  var rail = document.getElementById('rail');
  var prev = document.getElementById('rail-prev');
  var next = document.getElementById('rail-next');

  if (rail && prev && next) {
    function step() {
      var card = rail.querySelector('.svc');
      return card ? card.getBoundingClientRect().width + 24 : 320;
    }
    function syncNav() {
      var max = rail.scrollWidth - rail.clientWidth - 2;
      prev.disabled = rail.scrollLeft <= 2;
      next.disabled = rail.scrollLeft >= max;
    }
    prev.addEventListener('click', function () {
      rail.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    next.addEventListener('click', function () {
      rail.scrollBy({ left: step(), behavior: 'smooth' });
    });
    rail.addEventListener('scroll', syncNav, { passive: true });
    window.addEventListener('resize', syncNav);
    syncNav();
  }

  /* ---------- footer "Свежие новости" ---------- */
  var newsLink = document.getElementById('news-link');
  var newsNote = document.getElementById('news-note');
  if (newsLink && newsNote) {
    newsLink.addEventListener('click', function (e) {
      e.preventDefault();
      newsNote.hidden = false;
    });
  }

  /* ---------- calculator ---------- */
  var calcForm = document.getElementById('calc-form');
  if (calcForm) {
    var area = document.getElementById('area');
    var areaOut = document.getElementById('area-out');
    var sumEl = document.getElementById('calc-sum');
    var noteEl = document.getElementById('calc-note');
    var doneEl = document.getElementById('calc-done');
    var objBtns = calcForm.querySelectorAll('[data-obj]');
    var cleanBtns = calcForm.querySelectorAll('[data-clean]');
    var obj = 'flat';
    var rate = 170;
    var fixed = false;

    function fmt(n) {
      return n.toLocaleString('ru-RU') + ' ₽';
    }
    function paintRange() {
      var min = parseInt(area.min, 10);
      var max = parseInt(area.max, 10);
      var pct = ((parseInt(area.value, 10) - min) / (max - min)) * 100;
      area.style.setProperty('--fill', pct + '%');
    }
    function calc() {
      var a = parseInt(area.value, 10);
      areaOut.textContent = a;
      var sum, note;
      if (fixed) {
        sum = rate;
        note = 'Ориентировочно, по прайсу услуги — ' + fmt(rate);
      } else {
        sum = Math.round(rate * a / 10) * 10;
        note = 'Ориентировочно, по тарифу ' + rate + ' ₽ × ' + a + ' м²';
      }
      sumEl.textContent = fmt(sum);
      noteEl.textContent = note;
      paintRange();
    }

    objBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        objBtns.forEach(function (x) { x.classList.remove('is-on'); x.setAttribute('aria-checked', 'false'); });
        b.classList.add('is-on');
        b.setAttribute('aria-checked', 'true');
        obj = b.getAttribute('data-obj');
        calc();
      });
    });
    cleanBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        cleanBtns.forEach(function (x) { x.classList.remove('is-on'); x.setAttribute('aria-checked', 'false'); });
        b.classList.add('is-on');
        b.setAttribute('aria-checked', 'true');
        rate = parseInt(b.getAttribute('data-clean'), 10);
        fixed = b.hasAttribute('data-fixed');
        calc();
      });
    });
    area.addEventListener('input', calc);
    calcForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (doneEl) doneEl.hidden = false;
    });
    calc();
  }

  /* ---------- lead popup ---------- */
  var popup = document.getElementById('popup');
  var lastFocus = null;

  function openPopup() {
    if (!popup) return;
    lastFocus = document.activeElement;
    popup.hidden = false;
    void popup.offsetHeight;
    popup.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var first = popup.querySelector('input');
    if (first) first.focus();
  }
  function closePopup() {
    if (!popup || popup.hidden) return;
    popup.classList.remove('is-open');
    document.body.style.overflow = '';
    window.setTimeout(function () {
      if (!popup.classList.contains('is-open')) popup.hidden = true;
    }, 400);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  if (popup) {
    document.querySelectorAll('[data-popup]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        if (menu && menu.classList.contains('is-open')) closeMenu();
        openPopup();
      });
    });
    popup.querySelectorAll('[data-popup-close]').forEach(function (el) {
      el.addEventListener('click', closePopup);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePopup();
    });

    var popupForm = document.getElementById('popup-form');
    if (popupForm) {
      popupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var done = document.getElementById('popup-done');
        if (done) {
          done.hidden = false;
          popupForm.querySelectorAll('input, button[type="submit"]').forEach(function (f) { f.disabled = true; });
        }
      });
    }
  }

  /* ---------- smooth anchor offset for fixed header ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.hasAttribute('data-popup')) return;
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY;
      if (id !== '#top') top -= 20;
      window.scrollTo({ top: top, behavior: 'smooth' });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });
})();
