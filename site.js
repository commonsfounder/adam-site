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
  var f = document.getElementById('signup'); if (!f) return;
  var msg = document.getElementById('signupMsg'), btn = f.querySelector('button'), input = f.querySelector('input[type="email"]');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { msg.className = 'signup-msg err'; msg.textContent = 'That email does not look right.'; input.focus(); return; }
    btn.disabled = true; msg.className = 'signup-msg'; msg.textContent = 'Sending...';
    fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, for: (f.querySelector('[name="for"]') || {}).value || '', company: f.querySelector('.hp').value }) })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok && d.ok, d: d }; }); })
      .then(function (x) {
        if (x.ok) { msg.className = 'signup-msg'; msg.textContent = 'Thank you. We will be in touch.'; input.value = ''; }
        else { btn.disabled = false; msg.className = 'signup-msg err'; msg.textContent = x.d && x.d.error === 'too many tries' ? 'Too many tries. Please try again later.' : 'Something went wrong. Please email us instead.'; }
      })
      .catch(function () { btn.disabled = false; msg.className = 'signup-msg err'; msg.textContent = 'Something went wrong. Please email us instead.'; });
  });
})();

(function () {
  var peek = document.getElementById('peek'), ring = document.getElementById('peekRing'), open = document.getElementById('explodeBtn');
  if (peek && open && 'IntersectionObserver' in window) {
    var shown = false, t1, t2;
    function hide() { peek.classList.remove('show'); if (ring) ring.classList.remove('show'); clearTimeout(t1); clearTimeout(t2); }
    var io = new IntersectionObserver(function (es) {
      if (shown || !es[0].isIntersecting) return;
      shown = true; io.disconnect();
      t1 = setTimeout(function () { peek.classList.add('show'); if (ring) ring.classList.add('show'); }, 700);
      t2 = setTimeout(hide, 12000);
    }, { threshold: 0.5 });
    io.observe(open);
    open.addEventListener('click', hide);
  }
})();

(function () {
  var box = document.getElementById('forWord');
  if (!box) return;
  var L = [
    ['new parents.', '#d4501f', ['baby', 'milk', 'bed-double', 'heart']],
    ['grandparents.', '#b83a66', ['phone', 'hand-heart', 'coffee', 'heart-pulse']],
    ['busy families.', '#c98a00', ['calendar', 'shopping-basket', 'utensils', 'house']],
    ['flatmates.', '#3f6fd8', ['key-round', 'sofa', 'music-2', 'users']],
    ['pet owners.', '#a0522d', ['paw-print', 'dog', 'cat', 'bone']],
    ['carers.', '#2f8f5b', ['stethoscope', 'pill', 'hand-heart', 'phone']],
    ['students.', '#7a4fd0', ['graduation-cap', 'book-open', 'backpack', 'lightbulb']],
    ['night owls.', '#2b4a8a', ['moon', 'headphones', 'coffee', 'star']],
    ['developers.', '#0f7c86', ['code', 'terminal', 'braces', 'cpu']],
    ['you.', '#d4501f', ['smile', 'heart', 'party-popper', 'star']]
  ];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var i = 0, word = box.querySelector('b'), fl = box.querySelector('.for-fl'), NS = 'http://www.w3.org/2000/svg';
  function set(k) {
    var x = L[k]; word.textContent = x[0]; box.style.setProperty('--fc', x[1]);
    fl.innerHTML = '';
    x[2].forEach(function (n, j) {
      var v = document.createElementNS(NS, 'svg'); v.setAttribute('viewBox', '0 0 24 24'); v.setAttribute('class', 'f' + j);
      v.style.setProperty('--d', (80 + j * 90) + 'ms');
      var u = document.createElementNS(NS, 'use'); u.setAttribute('href', 'family/icons.svg?v=2#i-' + n);
      v.appendChild(u); fl.appendChild(v);
    });
  }
  set(0);
  if (reduce) return;
  setInterval(function () {
    box.classList.add('out');
    setTimeout(function () { i = (i + 1) % L.length; set(i); box.classList.remove('out'); }, 320);
  }, 2600);
})();

(function () {
  var op = document.getElementById('opener'), root = document.documentElement;
  if (!op || root.classList.contains('opdone')) return;
  function done() { try { sessionStorage.setItem('op', '1'); } catch (e) {} }
  function skip() { root.classList.add('opskip'); done(); off(); setTimeout(function () { root.classList.add('opdone'); }, 320); }
  function off() { ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (e) { window.removeEventListener(e, skip); }); }
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (e) { window.addEventListener(e, skip, { passive: true }); });
  op.addEventListener('animationend', function (e) { if (e.target === op) { done(); off(); root.classList.add('opdone'); } });
})();
