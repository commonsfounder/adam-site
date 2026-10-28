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
  var p = s.querySelector('.intro-word'), mark = s.querySelector('.mark'), dot = mark.querySelector('.head'), decoy = s.querySelector('.decoy');
  var INK = '#201E1B', RECT = '<rect x="0" y="180" width="170" height="540" rx="85" fill="#201E1B"/>';
  var FACES = [
    { dot: '#d4501f', back: '<g fill="none" stroke="#201E1B" stroke-width="12" stroke-linecap="round"><path d="M85 4C80-22 62-30 50-26"/><path d="M85 4C92-26 110-34 124-28"/><path d="M85 4C85-20 86-32 84-44"/></g>', front: '', glasses: '' },
    { dot: '#c98a00', back: '', front: '<path d="M12 56A73 62 0 0 1 158 56Z" fill="#8a3b1c"/><rect x="6" y="46" width="158" height="26" rx="13" fill="#6e2e15"/><circle cx="85" cy="-14" r="17" fill="#f4e3c1"/>', glasses: '' },
    { dot: '#b83a66', back: '', front: '<g fill="#ffd3df"><path d="M122 8L88-14V30Z"/><path d="M122 8L156-14V30Z"/><circle cx="122" cy="8" r="13" fill="#e8708f"/></g>', glasses: '' },
    { dot: '#2fa6b8', back: '<path d="M85 2V-40" stroke="#201E1B" stroke-width="9" stroke-linecap="round"/><circle cx="85" cy="-48" r="14" fill="#201E1B"/>', front: '', glasses: '<circle cx="55" cy="74" r="30" fill="none" stroke="#201E1B" stroke-width="9"/><circle cx="115" cy="74" r="30" fill="none" stroke="#201E1B" stroke-width="9"/><path d="M84 72h2" stroke="#201E1B" stroke-width="9" stroke-linecap="round"/>' }
  ];
  function face(k) {
    var f = FACES[k];
    return '<g class="head">' + f.back + '<circle cx="85" cy="75" r="75" fill="' + f.dot + '"/><circle class="e" cx="55" cy="74" r="20" fill="#fff"/><circle class="e" cx="115" cy="74" r="20" fill="#fff"/><g class="eyes-g"><circle class="e" cx="60" cy="76" r="9" fill="' + INK + '"/><circle class="e" cx="120" cy="76" r="9" fill="' + INK + '"/></g>' + f.glasses + f.front + '</g>' + RECT;
  }
  mark.innerHTML = face(0); dot = mark.querySelector('.head');
  var T = 4200, busy = false;
  s.classList.add('live', 'pre');
  var letters = [], pt = null, alive = [], blinkT = 0;
  (function wrap() {
    var rest = s.querySelector('.rest'), txt = rest.textContent; rest.textContent = ''; rest.setAttribute('aria-hidden', 'true'); p.setAttribute('aria-label', 'intuitive devices');
    txt.split('').forEach(function (c) {
      if (c === ' ') { rest.appendChild(document.createTextNode(' ')); return; }
      var sp = document.createElement('span'); sp.className = 'ch' + (c === 'i' ? ' is-i' : ''); sp.textContent = c; sp.dataset.c = c; rest.appendChild(sp); letters.push(sp);
    });
  })();
  var MINI_OLD = '<svg class="mini" viewBox="0 0 170 720" aria-hidden="true"><g class="head"><circle cx="85" cy="75" r="75" fill="#D4501F"/><g class="eyes-g"><circle class="e" cx="57" cy="72" r="12" fill="#201E1B"/><circle class="e" cx="113" cy="72" r="12" fill="#201E1B"/></g></g><rect x="0" y="180" width="170" height="540" rx="85" fill="#201E1B"/></svg>';
  var EYES = '<span class="eyes"><span class="eye"><span class="pupil"></span></span><span class="eye"><span class="pupil"></span></span></span>';
  function look() {
    var fs = parseFloat(getComputedStyle(p).fontSize), tx, ty;
    if (pt) { tx = pt.x; ty = pt.y; } else { var m = mark.getBoundingClientRect(); tx = m.left + m.width / 2; ty = m.top; }
    alive.forEach(function (l) {
      l.querySelectorAll('.eye').forEach(function (e) {
        var r = e.getBoundingClientRect(), dx = tx - (r.left + r.width / 2), dy = ty - (r.top + r.height / 2), d = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(1, d / (fs * 0.6)) * fs * 0.03;
        e.firstChild.style.transform = 'translate(' + (dx / d * k).toFixed(2) + 'px,' + (dy / d * k).toFixed(2) + 'px)';
      });
    });
  }
  function reset() {
    clearInterval(blinkT); alive = [];
    letters.forEach(function (l) { l.className = 'ch' + (l.dataset.c === 'i' ? ' is-i' : ''); l.textContent = l.dataset.c; });
  }
  function infect() {
    letters.forEach(function (l, n) {
      setTimeout(function () {
        if (l.dataset.c === 'i') { var kk = Math.min(3, 1 + letters.slice(0, n).filter(function (x) { return x.dataset.c === 'i'; }).length); l.innerHTML = '<svg class="mini" viewBox="0 0 170 720" aria-hidden="true">' + face(kk) + '</svg>'; l.classList.add('born'); }
        lookHeads();
      }, n * 110);
    });
    blinkT = setInterval(function () {
      if (!alive.length) return; var l = alive[Math.floor(Math.random() * alive.length)];
      l.classList.add('blink'); setTimeout(function () { l.classList.remove('blink'); }, 150);
    }, 700);
  }
  window.addEventListener('pointermove', function (e) { pt = { x: e.clientX, y: e.clientY }; if (alive.length) look(); }, { passive: true });
  function lookHeads() {
    s.querySelectorAll('.eyes-g').forEach(function (g) {
      var r = g.ownerSVGElement.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.width * 0.45;
      var dx = pt ? pt.x - cx : 0, dy = pt ? pt.y - cy : 0, d = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(1, d / 220) * 9;
      g.style.transform = 'translate(' + (dx / d * k).toFixed(2) + 'px,' + (dy / d * k).toFixed(2) + 'px)';
    });
  }
  window.addEventListener('pointermove', lookHeads, { passive: true });
  setInterval(function () {
    var all = s.querySelectorAll('svg'); if (!all.length) return; var e = all[Math.floor(Math.random() * all.length)];
    e.classList.add('blink'); setTimeout(function () { e.classList.remove('blink'); }, 150);
  }, 2400);
  function play() {
    if (busy || !mark.animate) return; busy = true; reset();
    setTimeout(infect, 500 + T * 0.85);
    var fs = parseFloat(getComputedStyle(p).fontSize), r = mark.getBoundingClientRect(), D = r.right + 60, H = fs * 0.6;
    s.classList.add('live');
    [mark, dot, decoy].forEach(function (e) { e.getAnimations().forEach(function (a) { a.cancel(); }); });
    function k(o, x, y, sx, sy, ease) { return { offset: o, transform: 'translate(' + (-D * x).toFixed(1) + 'px,' + (H * y).toFixed(1) + 'px) scale(' + sx + ',' + sy + ')', easing: ease || 'ease-in-out' }; }
    var up = 'cubic-bezier(.25,.6,.35,1)', down = 'cubic-bezier(.55,0,.85,.45)';
    mark.animate([
      k(0, 1, 0, 1, 1), k(0.04, 0.88, 0, 1.1, 0.9, up), k(0.12, 0.74, -0.8, 0.9, 1.12, down), k(0.2, 0.6, 0, 1.14, 0.86),
      k(0.24, 0.6, 0, 1, 1), k(0.28, 0.6, 0, 1.08, 0.92, up), k(0.36, 0.38, -1, 0.9, 1.12, down), k(0.44, 0.2, 0, 1.14, 0.86),
      k(0.5, 0.2, 0, 1, 1), k(0.62, 0.2, 0, 1.16, 0.84, up), k(0.72, 0.08, -1.1, 0.92, 1.1, down), k(0.8, 0, 0, 1.28, 0.72),
      k(0.86, 0, 0, 0.95, 1.1), k(0.92, 0, 0, 1.02, 0.98), k(1, 0, 0, 1, 1)
    ], { duration: T, delay: 500, fill: 'both' });
    function d(o, x, y) { return { offset: o, transform: 'translate(' + x + '%,' + y + '%)', easing: 'ease-in-out' }; }
    dot.animate([d(0, 0, 0), d(0.5, 0, 0), d(0.54, 30, 0), d(0.6, 30, 0), d(0.64, 0, 0), d(0.8, 0, 0), d(0.84, 0, 0), d(0.88, 0, -140), d(0.92, 0, 0), d(0.95, -35, 0), d(0.98, 35, 0), d(1, 0, 0)], { duration: T, delay: 500, fill: 'both' });
    decoy.animate([{ transform: 'scaleY(1)', opacity: 1 }, { transform: 'scaleY(0.07)', opacity: 1, offset: 0.75 }, { transform: 'scaleY(0.07)', opacity: 0 }], { duration: 260, delay: 500 + T * 0.8, fill: 'both' });
    s.classList.remove('pre');
    setTimeout(function () { busy = false; }, T + 700);
  }
  ((document.fonts && document.fonts.ready) || Promise.resolve()).then(function () { setTimeout(play, 100); });
  s.addEventListener('click', play);
})();
