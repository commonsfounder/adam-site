(function () {
  var KEYS = [
    { c: '#6a5bd6', g: 'rgba(106, 91, 214, 0.28)' },
    { c: '#e01e5a', g: 'rgba(54, 197, 240, 0.30)', slack: true },
    { c: '#1f7ae0', g: 'rgba(31, 122, 224, 0.28)' },
    { c: '#d4501f', g: 'rgba(212, 80, 31, 0.3)' },
    { c: '#c98a00', g: 'rgba(201, 138, 0, 0.3)' },
    { c: '#b83a66', g: 'rgba(184, 58, 102, 0.3)' }
  ];
  var SLACK = ['#e01e5a', '#36c5f0', '#ecb22e', '#2eb67d'];
  var track = document.getElementById('famTrack');
  if (!track) return;
  var para = document.getElementById('famSentence');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  var words = Array.prototype.slice.call(para.querySelectorAll('.w'));
  var keyEls = KEYS.map(function (k, i) {
    var el = para.querySelector('.k[data-k="' + i + '"]');
    if (!el) return null;
    el.style.setProperty('--c', k.c); el.style.setProperty('--g', k.g); return el;
  });
  var keyAt = keyEls.map(function (el) { return words.indexOf(el) + 1; });
  var PICK = [
    { rows: [3, 3], list: ['mail', 'mail-open', 'inbox', 'paperclip', 'at-sign', 'send', 'file-text', 'calendar'] },
    { rows: [3, 3], list: ['slack', 'hash', 'message-square', 'at-sign', 'paperclip', 'send', 'calendar', 'briefcase'] },
    { rows: [3, 3], list: ['plane', 'plane-takeoff', 'ticket', 'luggage', 'plane-landing', 'map-pin', 'globe', 'calendar'] },
    { rows: [3, 3], list: ['gamepad-2', 'joystick', 'trophy', 'dices', 'ghost', 'rocket', 'crown', 'target'] },
    { rows: [4, 4], list: ['pencil', 'palette', 'brush', 'camera', 'music', 'wand-sparkles', 'film', 'lightbulb', 'clapperboard', 'guitar'] },
    { rows: [6, 5], list: ['wifi', 'message-circle', 'heart', 'link', 'users', 'globe', 'phone', 'mail', 'radio', 'share-2', 'smile', 'handshake', 'send', 'video'] }
  ];
  function rnd(seed) { var x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); }
  function mk(name, d, seed, col) {
    var s = document.createElement('span'); s.className = 'ki'; if (col) s.style.setProperty('--c', col); s.style.setProperty('--d', d + 'ms');
    s.style.setProperty('--dy', ((rnd(seed) - 0.5) * 0.16).toFixed(3) + 'em');
    s.style.setProperty('--rot', ((rnd(seed + 7) - 0.5) * 30).toFixed(1) + 'deg');
    s.style.setProperty('--sz', (0.86 + rnd(seed + 13) * 0.3).toFixed(2));
    var v = document.createElementNS(NS, 'svg'); v.setAttribute('viewBox', '0 0 24 24');
    var u = document.createElementNS(NS, 'use'); u.setAttribute('href', 'family/icons.svg?v=2#i-' + name);
    v.appendChild(u); s.appendChild(v); return s;
  }
  var rings = keyEls.map(function (el, i) {
    if (!el) return null;
    var ring = document.createElement('span'); ring.className = 'kring'; ring.setAttribute('aria-hidden', 'true');
    if (i >= 3) {
    var P = PICK[i], idx = 0;
      ['up', 'dn'].forEach(function (pos, r) {
        var rowEl = document.createElement('span'); rowEl.className = 'kr ' + pos;
        for (var n = 0; n < P.rows[r]; n++) { rowEl.appendChild(mk(P.list[idx], idx * 45, i * 50 + idx, KEYS[i].slack ? SLACK[idx % 4] : null)); idx++; }
        ring.appendChild(rowEl);
      });
      ['lt', 'rt'].forEach(function (side) {
        var box = document.createElement('span'); box.className = 'kc ' + side;
        box.appendChild(mk(P.list[idx], idx * 45, i * 50 + idx, KEYS[i].slack ? SLACK[idx % 4] : null)); idx++; ring.appendChild(box);
      });
    }
    el.appendChild(ring);
    if (i === 0) {
      var env = document.createElement('span'); env.className = 'kenv';
      env.innerHTML = '<svg viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/></svg>';
      ring.appendChild(env);
    }
    if (KEYS[i].flight) {
      var sv = document.createElementNS(NS, 'svg'); sv.setAttribute('class', 'kloop'); sv.setAttribute('viewBox', '0 0 200 40'); sv.setAttribute('preserveAspectRatio', 'none'); sv.setAttribute('aria-hidden', 'true');
      var pa = document.createElementNS(NS, 'path'); pa.setAttribute('d', 'M2 32 C 36 30, 68 8, 92 15 C 114 21, 108 40, 94 33 C 80 26, 94 2, 122 7 C 152 12, 172 24, 198 9'); pa.setAttribute('pathLength', '100'); sv.appendChild(pa); ring.appendChild(sv);
    }
    return ring;
  });
  var ticking = false;
  function build() {}
  function ring_state() {
    keyEls.forEach(function (el, i) { if (el) rings[i].classList.toggle('on', el.classList.contains('lit')); });
  }
  var beats = Array.prototype.slice.call(para.querySelectorAll('.beat'));
  var T = words.map(function (w, i) { return 0.04 + 0.9 * (i / Math.max(1, words.length - 1)); });
  var FADE = 0.035;
  function render(p) {
    words.forEach(function (w, i) {
      if (keyEls.indexOf(w) >= 0) return;
      var o = Math.min(1, Math.max(0, (p - (T[i] - FADE)) / FADE));
      w.style.color = o >= 1 ? '' : o <= 0 ? '' : 'color-mix(in srgb, var(--ink) ' + (o * 100).toFixed(0) + '%, #b7b3aa)';
      w.classList.toggle('show', o >= 1);
    });
    keyEls.forEach(function (el) { if (el) el.classList.toggle('lit', p >= T[words.indexOf(el)]); });
    ring_state();
    beats.forEach(function (b, i) {
      var first = words.indexOf(b.querySelector('.w')), next = beats[i + 1] ? words.indexOf(beats[i + 1].querySelector('.w')) : -1;
      var t0 = i === 0 ? -1 : T[first] + 0.035, t1 = next < 0 ? 2 : T[next] + 0.035;
      b.classList.toggle('on', p >= t0 && p < t1);
    });
  }
  function apply(p) { render(p); }
  if (para.hasAttribute('data-static')) {
    if (reduce || !('IntersectionObserver' in window)) { render(1); return; }
    var sio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { render(1); sio.disconnect(); } }, { threshold: 0.6 });
    sio.observe(para); return;
  }
  function update() {
    ticking = false;
    var r = track.getBoundingClientRect(), total = r.height - window.innerHeight;
    apply(total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  if (!reduce) {
    build(); update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { build(); update(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { build(); update(); });
  }
})();
