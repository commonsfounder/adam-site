(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // scroll reveals, once per element
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(function (el) { revealIO.observe(el); });

  // mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('open', open);
    document.body.classList.toggle('locked', open);
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 860) setMenu(false); });
  }

  // tagline: words activate one at a time as they cross the trigger line
  var tagline = document.getElementById('tagline');
  if (tagline) {
    var words = tagline.textContent.trim().split(/\s+/);
    tagline.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      tagline.appendChild(s);
      if (i < words.length - 1) tagline.appendChild(document.createTextNode(' '));
    });
    var spans = tagline.querySelectorAll('.w');
    if (reduce) {
      spans.forEach(function (s) { s.classList.add('on'); });
    } else {
      var wordIO = new IntersectionObserver(function (entries) {
        var step = 0;
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          wordIO.unobserve(el);
          setTimeout(function () { el.classList.add('on'); }, step * 60);
          step += 1;
        });
      }, { rootMargin: '0px 0px -35% 0px', threshold: 0 });
      spans.forEach(function (s) { wordIO.observe(s); });
    }
  }

  // exploded device
  var wrap = document.querySelector('.explode-wrap');
  if (wrap) {
    var layers = Array.prototype.slice.call(document.querySelectorAll('#device .layer'));
    var callouts = Array.prototype.slice.call(document.querySelectorAll('#device .callout'));
    var capTitle = document.getElementById('capTitle');
    var capBody = document.getElementById('capBody');
    var prog = document.getElementById('prog');
    var stages = [
      { t: 'One object.<br>One home computer.', b: 'One speaker in the room you use most, two plugs covering the rest. No cameras, anywhere.' },
      { t: 'It opens.<br>Every layer counts.', b: 'Mic array, compute, driver, sensing. Nothing that watches. Keep scrolling.' },
      { t: 'Nothing<br>that watches.', b: 'Presence, sound, air and light at room level. Never a recording of your life.' }
    ];
    var stage = -1, ticking = false;
    var render = function (p) {
      layers.forEach(function (l) {
        var up = parseFloat(l.getAttribute('data-up')) || 0;
        l.style.transform = 'translateX(-50%) translateY(' + (-up * p).toFixed(1) + 'px)';
      });
      callouts.forEach(function (c) {
        c.classList.toggle('on', p >= (parseFloat(c.getAttribute('data-from')) || 0));
      });
      var s = p < 0.3 ? 0 : (p < 0.62 ? 1 : 2);
      if (s !== stage) { stage = s; capTitle.innerHTML = stages[s].t; capBody.textContent = stages[s].b; }
      prog.style.transform = 'scaleX(' + p.toFixed(3) + ')';
    };
    var update = function () {
      ticking = false;
      var r = wrap.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      render(reduce ? 0 : p);
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    if (reduce) callouts.forEach(function (c) { c.classList.add('on'); });
    update();
  }

  // tabs
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.tabpanel'));
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
      if (n === null) return;
      var next = tabs[(n + tabs.length) % tabs.length];
      next.focus();
      select(next);
    });
  });
  function select(t) {
    tabs.forEach(function (x) { x.setAttribute('aria-selected', 'false'); x.tabIndex = -1; });
    panels.forEach(function (p) { p.classList.remove('on'); });
    t.setAttribute('aria-selected', 'true');
    t.tabIndex = 0;
    var p = document.querySelector('.tabpanel[data-panel="' + t.getAttribute('data-tab') + '"]');
    if (p) p.classList.add('on');
  }

  // copy email (pilot page)
  var copyBtns = document.querySelectorAll('[data-copy]');
  var toast = document.getElementById('toast');
  var timer = null;
  function show(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  function copy(email) {
    var done = function () { show('Copied ' + email); };
    var fallback = function () {
      var input = document.createElement('input');
      input.value = email;
      document.body.appendChild(input);
      input.select();
      try { document.execCommand('copy'); done(); } catch (e) { show(email); }
      document.body.removeChild(input);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(email).then(done, fallback);
    else fallback();
  }
  copyBtns.forEach(function (b) { b.addEventListener('click', function () { copy(b.getAttribute('data-copy')); }); });
})();
