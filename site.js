/* ITSX Assure — Console theme behaviour */
(function () {
  document.documentElement.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {
    /* reveal on scroll + count-up */
    var countUp = function (el) {
      var end = +el.dataset.count, start = null;
      var step = function (t) {
        start = start || t;
        var p = Math.min((t - start) / 1600, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          e.target.querySelectorAll('[data-count]').forEach(countUp);
          io.unobserve(e.target);
        });
      }, { threshold: 0.12 });
      document.querySelectorAll('.rv').forEach(function (el, i) {
        el.style.transitionDelay = (i % 4) * 70 + 'ms';
        io.observe(el);
      });
    } else {
      document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
    }

    /* cursor spotlight on cards */
    document.querySelectorAll('.spot').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        b.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    /* tab groups: [data-tabs] with .tab[data-t] and .panel[id] */
    document.querySelectorAll('[data-tabs]').forEach(function (group) {
      var tabs = group.querySelectorAll('.tab');
      var select = function (tab, focus) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', on);
          t.tabIndex = on ? 0 : -1;
          var p = group.querySelector('#' + t.dataset.t);
          if (p) p.classList.toggle('on', on);
        });
        if (focus) tab.focus();
      };
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(t); });
        t.addEventListener('keydown', function (e) {
          var d = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          select(tabs[(i + d + tabs.length) % tabs.length], true);
        });
      });
    });

    /* mobile menu */
    var header = document.querySelector('header.nav');
    var burger = document.querySelector('.burger');
    if (burger) {
      burger.addEventListener('click', function () {
        var open = header.classList.toggle('open');
        burger.setAttribute('aria-expanded', open);
      });
      header.querySelectorAll('.mobile-menu a').forEach(function (a) {
        a.addEventListener('click', function () { header.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); });
      });
    }

    /* contact modal — same endpoint and recipients as the live site */
    var modal = document.getElementById('contact-modal');
    if (!modal) return;
    var form = modal.querySelector('form');
    var sendBtn = form.querySelector('button[type=submit]');
    var lastFocus = null;
    var openModal = function (e) {
      if (e) e.preventDefault();
      lastFocus = document.activeElement;
      modal.classList.remove('success', 'error');
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { form.querySelector('input').focus(); }, 50);
    };
    var closeModal = function () {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };
    document.querySelectorAll('[data-contact]').forEach(function (b) { b.addEventListener('click', openModal); });
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    modal.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', closeModal); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sendBtn.disabled) return;
      var name = form.name.value.trim(), email = form.email.value.trim(), message = form.message.value.trim();
      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending…';
      modal.classList.remove('error');
      fetch('https://formsubmit.co/ajax/dw@itsxassure.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: name, email: email, message: message,
          _subject: 'Website enquiry' + (name ? ' from ' + name : ''),
          _cc: 'ag@itsxassure.com,rl@itsxassure.com',
          _template: 'table'
        })
      })
        .then(function (res) { return res.json().then(function (d) { return { ok: res.ok, d: d }; }).catch(function () { return { ok: res.ok, d: {} }; }); })
        .then(function (r) {
          if (r.ok && String(r.d.success) === 'true') { modal.classList.add('success'); form.reset(); }
          else modal.classList.add('error');
        })
        .catch(function () { modal.classList.add('error'); })
        .then(function () { sendBtn.disabled = false; sendBtn.textContent = 'Send message'; });
    });
  });
})();
