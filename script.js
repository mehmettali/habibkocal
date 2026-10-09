(function () {
  var header = document.getElementById('header');
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  // Sticky header shadow
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
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
