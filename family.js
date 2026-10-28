(function () {
  var KEYS = [
    { c: '#d4501f', g: 'rgba(212, 80, 31, 0.3)', icons: ['gamepad-2', 'joystick', 'dices', 'trophy', 'swords', 'puzzle', 'ghost', 'rocket', 'crown', 'target', 'flame', 'headphones', 'star', 'shield', 'bomb', 'zap', 'medal', 'party-popper'] },
    { c: '#c98a00', g: 'rgba(201, 138, 0, 0.3)', icons: ['pencil', 'brush', 'palette', 'camera', 'film', 'music', 'pen-tool', 'scissors', 'wand-sparkles', 'lightbulb', 'clapperboard', 'guitar', 'image', 'layers', 'type', 'pipette', 'ruler', 'shapes'] },
    { c: '#b83a66', g: 'rgba(184, 58, 102, 0.3)', icons: ['wifi', 'message-circle', 'heart', 'link', 'globe', 'users', 'phone', 'mail', 'radio', 'share-2', 'smile', 'handshake', 'bluetooth', 'send', 'at-sign', 'video', 'hand-heart', 'megaphone'] }
  ];
  var track = document.getElementById('famTrack');
  if (!track) return;
  var para = document.getElementById('famSentence');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  var words = Array.prototype.slice.call(para.querySelectorAll('.w'));
  var keyEls = KEYS.map(function (k, i) {
    var el = para.querySelector('.k[data-k="' + i + '"]');
    el.style.setProperty('--c', k.c); el.style.setProperty('--g', k.g); return el;
  });
  var keyAt = keyEls.map(function (el) { return words.indexOf(el) + 1; });
  var PICK = [
    { rows: [3, 3], list: ['gamepad-2', 'joystick', 'trophy', 'dices', 'ghost', 'rocket', 'crown', 'target'] },
    { rows: [4, 4], list: ['pencil', 'palette', 'brush', 'camera', 'music', 'wand-sparkles', 'film', 'lightbulb', 'clapperboard', 'guitar'] },
    { rows: [6, 5], list: ['wifi', 'message-circle', 'heart', 'link', 'users', 'globe', 'phone', 'mail', 'radio', 'share-2', 'smile', 'handshake', 'send', 'video'] }
  ];
  function rnd(seed) { var x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); }
  function mk(name, d, seed) {
    var s = document.createElement('span'); s.className = 'ki'; s.style.setProperty('--d', d + 'ms');
    s.style.setProperty('--dy', ((rnd(seed) - 0.5) * 0.16).toFixed(3) + 'em');
    s.style.setProperty('--rot', ((rnd(seed + 7) - 0.5) * 30).toFixed(1) + 'deg');
    s.style.setProperty('--sz', (0.86 + rnd(seed + 13) * 0.3).toFixed(2));
    var v = document.createElementNS(NS, 'svg'); v.setAttribute('viewBox', '0 0 24 24');
    var u = document.createElementNS(NS, 'use'); u.setAttribute('href', 'family/icons.svg#i-' + name);
    v.appendChild(u); s.appendChild(v); return s;
  }
  var rings = keyEls.map(function (el, i) {
    var ring = document.createElement('span'); ring.className = 'kring'; ring.setAttribute('aria-hidden', 'true');
    var P = PICK[i], idx = 0;
    ['up', 'dn'].forEach(function (pos, r) {
      var rowEl = document.createElement('span'); rowEl.className = 'kr ' + pos;
      for (var n = 0; n < P.rows[r]; n++) { rowEl.appendChild(mk(P.list[idx], idx * 45, i * 50 + idx)); idx++; }
      ring.appendChild(rowEl);
    });
    ['lt', 'rt'].forEach(function (side) {
      var box = document.createElement('span'); box.className = 'kc ' + side;
      box.appendChild(mk(P.list[idx], idx * 45, i * 50 + idx)); idx++; ring.appendChild(box);
    });
    el.appendChild(ring); return ring;
  });
  var shown = -1, ticking = false;
  function build() {}
  function ring_state() {
    keyEls.forEach(function (el, i) { rings[i].classList.toggle('on', el.classList.contains('lit')); });
  }
  var firstKey = words.indexOf(keyEls[0]);
  var T = words.map(function (w, i) {
    if (i < firstKey) return 0.03 + 0.55 * (i / firstKey);
    var k = keyEls.indexOf(w);
    if (k === 0) return 0.62;
    if (k === 1) return 0.76;
    if (k === 2) return 0.93;
    return i === firstKey + 2 ? 0.86 : 0.89;
  });
  function apply(p) {
    var count = 0;
    T.forEach(function (t) { if (p >= t) count++; });
    if (count === shown) return; shown = count;
    words.forEach(function (w, i) { w.classList.toggle('show', i < count); });
    keyEls.forEach(function (el, i) { el.classList.toggle('lit', words.indexOf(el) < count); });
    ring_state();
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
