(function () {
  var header = document.getElementById('header');
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  // Sticky header shadow
  var wa = document.querySelector('.wa-float');
  var heroEl = document.getElementById('top');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    if (wa && heroEl) wa.classList.toggle('is-hidden', window.scrollY < heroEl.offsetHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    nav.classList.toggle('is-open', open);
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Contact form -> WhatsApp
  var form = document.getElementById('contactForm');
  var error = document.getElementById('formError');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.name.value.trim();
    var phone = form.phone.value.trim();
    var topic = form.topic.value;
    var message = form.message.value.trim();
    if (!name || !phone || !message) {
      error.hidden = false;
      return;
    }
    error.hidden = true;
    var text = 'Merhaba, web sitesinden yazıyorum.\n\n' +
      'Ad Soyad: ' + name + '\n' +
      'Telefon: ' + phone + '\n' +
      'Konu: ' + topic + '\n\n' +
      message;
    window.open('https://wa.me/905350490053?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });

  // Product filters
  var filters = document.querySelectorAll('.filter');
  var cards = document.querySelectorAll('#productGrid .pcard');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filters.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      cards.forEach(function (c) {
        c.hidden = f !== 'all' && c.getAttribute('data-cat') !== f;
        if (!c.hidden) c.classList.add('is-visible');
      });
    });
  });

  // Scroll progress
  var bar = document.getElementById('progressBar');
  function onProgress() {
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
  }
  window.addEventListener('scroll', onProgress, { passive: true });
  onProgress();

  // Count-up numbers
  var counters = document.querySelectorAll('[data-count]');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        var el = e.target, end = +el.getAttribute('data-count'), t0 = null;
        (function step(t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / 1400);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { el.textContent = '0'; co.observe(el); });
  }

  // Science library search + filter
  var libItems = document.querySelectorAll('#library li');
  var libSearch = document.getElementById('libSearch');
  var libFilters = document.querySelectorAll('.lf');
  var libEmpty = document.getElementById('libEmpty');
  var libType = 'all';
  function norm(s) { return s.toLocaleLowerCase('tr').replace(/ı/g, 'i'); }
  function applyLib() {
    var q = norm(libSearch.value.trim()), shown = 0;
    libItems.forEach(function (li) {
      var ok = (libType === 'all' || li.getAttribute('data-type') === libType) && norm(li.textContent).indexOf(q) !== -1;
      li.hidden = !ok;
      if (ok) shown++;
    });
    libEmpty.hidden = shown > 0;
  }
  if (libSearch) {
    libSearch.addEventListener('input', applyLib);
    libFilters.forEach(function (b) {
      b.addEventListener('click', function () {
        libType = b.getAttribute('data-type');
        libFilters.forEach(function (x) { x.classList.toggle('is-active', x === b); });
        applyLib();
      });
    });
  }

  // Hero slider
  (function () {
    var root = document.getElementById('heroSlider');
    if (!root) return;
    var hero = root.closest('.hero');
    var slides = root.querySelectorAll('.slide');
    var tabs = root.querySelectorAll('.stab');
    var pauseBtn = document.getElementById('sPause');
    var DURATION = 7000;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var current = 0, elapsed = 0, last = null, hovering = false, focused = false, userPaused = reduce;

    function setInert(el, on) {
      if (on) { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); }
      else { el.removeAttribute('inert'); el.removeAttribute('aria-hidden'); }
    }

    function go(i) {
      i = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        s.classList.toggle('is-active', k === i);
        setInert(s, k !== i);
      });
      tabs.forEach(function (t, k) {
        t.classList.toggle('is-active', k === i);
        t.classList.toggle('is-done', k < i);
        t.setAttribute('aria-selected', String(k === i));
        t.querySelector('i').style.width = k < i ? '100%' : '0';
      });
      hero.style.setProperty('--glow', slides[i].getAttribute('data-glow'));
      current = i;
      elapsed = 0;
    }

    function running() { return !userPaused && !hovering && !focused && !document.hidden; }

    function tick(t) {
      if (last !== null && running()) {
        elapsed += t - last;
        var bar = tabs[current].querySelector('i');
        bar.style.width = Math.min(100, (elapsed / DURATION) * 100) + '%';
        if (elapsed >= DURATION) go(current + 1);
      }
      last = t;
      requestAnimationFrame(tick);
    }

    function setPaused(p) {
      userPaused = p;
      pauseBtn.setAttribute('aria-pressed', String(p));
      pauseBtn.setAttribute('aria-label', p ? 'Otomatik geçişi başlat' : 'Otomatik geçişi durdur');
    }

    tabs.forEach(function (t) {
      t.addEventListener('click', function () { go(+t.getAttribute('data-go')); });
    });
    document.getElementById('sPrev').addEventListener('click', function () { go(current - 1); });
    document.getElementById('sNext').addEventListener('click', function () { go(current + 1); });
    pauseBtn.addEventListener('click', function () { setPaused(!userPaused); });

    root.addEventListener('mouseenter', function () { hovering = true; });
    root.addEventListener('mouseleave', function () { hovering = false; });
    root.addEventListener('focusin', function (e) { focused = !e.target.closest('.slider__ui'); });
    root.addEventListener('focusout', function () { focused = false; });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { go(current + 1); }
      else if (e.key === 'ArrowLeft') { go(current - 1); }
    });

    // Swipe
    var startX = null, startY = null;
    var area = root.querySelector('.slides');
    area.addEventListener('pointerdown', function (e) { startX = e.clientX; startY = e.clientY; });
    area.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(current + (dx < 0 ? 1 : -1));
      startX = null;
    });

    setPaused(userPaused);
    go(0);
    requestAnimationFrame(tick);
  })();

  // Product inquiry -> prefill contact form
  document.querySelectorAll('[data-ask]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var product = btn.getAttribute('data-ask');
      var bio = /iş birliği/i.test(product);
      form.topic.value = bio ? 'Diğer' : 'Ürün bilgisi';
      form.message.value = product + ' hakkında bilgi almak istiyorum.';
      document.getElementById('iletisim').scrollIntoView();
      form.name.focus({ preventScroll: true });
    });
  });

  // Press archive toggle
  var more = document.getElementById('pressMore');
  var extra = document.querySelectorAll('.press-list [data-more]');
  extra.forEach(function (li) { li.hidden = true; });
  if (more) {
    more.addEventListener('click', function () {
      var open = more.getAttribute('aria-expanded') !== 'true';
      extra.forEach(function (li) { li.hidden = !open; if (open) li.classList.add('is-visible'); });
      more.setAttribute('aria-expanded', String(open));
      more.textContent = open ? 'Daha az göster' : 'Tüm arşivi göster';
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
