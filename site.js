(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(function (el) { revealIO.observe(el); });
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
  var wrap = document.querySelector('.explode-wrap');
  if (wrap) {
    var parts = Array.prototype.slice.call(document.querySelectorAll('#parts li'));
    var cur = -2, ticking = false;
    var render = function (p) {
      var idx = -1;
      parts.forEach(function (li, i) { if (p >= parseFloat(li.getAttribute('data-from'))) idx = i; });
      if (idx !== cur) {
        cur = idx;
        parts.forEach(function (li, i) {
          li.classList.toggle('on', i <= idx && i >= 0);
          li.classList.toggle('cur', i === idx);
        });
      }
      if (window.AdamDevice) window.AdamDevice.setProgress(reduce ? 0 : p);
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
    if (reduce) parts.forEach(function (li) { li.classList.add('on', 'cur'); });
    update();
  }
  var accQ = Array.prototype.slice.call(document.querySelectorAll('.acc-q'));
  accQ.forEach(function (q) {
    q.addEventListener('click', function () {
      var open = q.getAttribute('aria-expanded') === 'true';
      accQ.forEach(function (x) {
        x.setAttribute('aria-expanded', 'false');
        document.getElementById(x.getAttribute('aria-controls')).classList.remove('open');
      });
      if (!open) {
        q.setAttribute('aria-expanded', 'true');
        document.getElementById(q.getAttribute('aria-controls')).classList.add('open');
      }
    });
  });
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

(function () {
  var s = document.getElementById('intro'); if (!s) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var p = s.querySelector('.intro-word'), mark = s.querySelector('.mark'), dot = mark.querySelector('circle'), decoy = s.querySelector('.decoy');
  var T = 3400, busy = false;
  function play() {
    if (busy || !mark.animate) return; busy = true;
    var fs = parseFloat(getComputedStyle(p).fontSize), r = mark.getBoundingClientRect(), D = r.right + 60, H = fs * 0.5;
    s.classList.add('live');
    [mark, dot, decoy].forEach(function (e) { e.getAnimations().forEach(function (a) { a.cancel(); }); });
    function k(o, x, y, sx, sy, ease) { return { offset: o, transform: 'translate(' + (-D * x).toFixed(1) + 'px,' + (-H * y).toFixed(1) + 'px) scale(' + sx + ',' + sy + ')', easing: ease || 'ease-in-out' }; }
    var up = 'cubic-bezier(.2,.7,.3,1)', down = 'cubic-bezier(.7,0,.9,.4)';
    mark.animate([
      k(0, 1, 0, 1, 1), k(0.04, 0.88, 0, 1.15, 0.85, up), k(0.12, 0.74, -0.8, 0.9, 1.12, down), k(0.2, 0.6, 0, 1.2, 0.8),
      k(0.24, 0.6, 0, 1, 1), k(0.28, 0.6, 0, 1.12, 0.88, up), k(0.36, 0.38, -1, 0.9, 1.12, down), k(0.44, 0.2, 0, 1.2, 0.8),
      k(0.5, 0.2, 0, 1, 1), k(0.62, 0.2, 0, 1.25, 0.75, up), k(0.72, 0.08, -1.1, 0.92, 1.1, down), k(0.8, 0, 0, 1.4, 0.6),
      k(0.86, 0, 0, 0.95, 1.1), k(0.92, 0, 0, 1.02, 0.98), k(1, 0, 0, 1, 1)
    ], { duration: T, delay: 500, fill: 'both' });
    function d(o, x, y) { return { offset: o, transform: 'translate(' + x + '%,' + y + '%)', easing: 'ease-in-out' }; }
    dot.animate([d(0, 0, 0), d(0.5, 0, 0), d(0.54, 30, 0), d(0.6, 30, 0), d(0.64, 0, 0), d(0.8, 0, 0), d(0.84, 0, 0), d(0.88, 0, -140), d(0.92, 0, 0), d(0.95, -35, 0), d(0.98, 35, 0), d(1, 0, 0)], { duration: T, delay: 500, fill: 'both' });
    decoy.animate([{ transform: 'scaleY(1)', opacity: 1 }, { transform: 'scaleY(0.07)', opacity: 1, offset: 0.75 }, { transform: 'scaleY(0.07)', opacity: 0 }], { duration: 260, delay: 500 + T * 0.8, fill: 'both' });
    setTimeout(function () { busy = false; }, T + 700);
  }
  ((document.fonts && document.fonts.ready) || Promise.resolve()).then(function () { setTimeout(play, 100); });
  s.addEventListener('click', play);
})();
