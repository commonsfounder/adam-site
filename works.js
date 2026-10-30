(function () {
  var root = document.getElementById('works');
  if (!root) return;
  var SETS = {
    p: [['Gmail', 'gmail'], ['Google Calendar', 'gcal'], ['Apple Calendar', 'applecal'], ['Apple Health', 'health'], ['WHOOP', 'whoop'], ['Oura', 'oura'], ['Spotify', 'spotify'], ['WhatsApp', 'whatsapp'], ['Outlook', 'outlook'], ['Strava', 'strava']],
    a: [['Claude Duet', 'duet'], ['ChatGPT Dots', 'chatgpt'], ['Grok Bot', 'grokbot'], ['Muse', 'muse'], ['Gemini', 'gemini'], ['Instinct', 'instinct'], ['Poke', 'poke'], ['Pally', 'pally'], ['Town', 'town'], ['Wabi', 'wabi']],
    h: [['Philips Hue', 'hue'], ['Sonos', 'sonos'], ['Ring', 'ring'], ['Google Home', 'googlehome'], ['Alexa', 'alexa'], ['Apple Home', 'applehome'], ['Dyson', 'dyson'], ['Nest', 'nest'], ['IKEA', 'ikea'], ['Hive', 'hive']]
  };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  var track = root.querySelector('.wk-track');
  var words = Array.prototype.slice.call(root.querySelectorAll('.wk-w'));
  var prog = reduce ? 1 : 0, running = false;
  function at(el) { return 0.04 + 0.66 * words.indexOf(el) / (words.length - 1); }
  var loops = Array.prototype.slice.call(root.querySelectorAll('.wk-loop')).map(function (el) {
    var size = window.innerWidth < 600 ? 24 : 36;
    var sv = document.createElementNS(NS, 'svg'); sv.setAttribute('class', 'wk-path'); sv.setAttribute('aria-hidden', 'true');
    var pa = document.createElementNS(NS, 'path'); sv.appendChild(pa); el.insertBefore(sv, el.firstChild);
    var items = SETS[el.dataset.set].map(function (x) {
      var d = document.createElement('span'); d.className = 'wk-lg'; d.style.setProperty('--s', size + 'px');
      var im = document.createElement('img'); im.src = 'works/' + x[1] + '.webp'; im.alt = x[0]; im.width = 48; im.height = 48; im.loading = 'lazy'; im.decoding = 'async';
      d.appendChild(im); el.appendChild(d); return d;
    });
    return { el: el, items: items, path: pa, t0: at(el.querySelector('.wk-w')) };
  });
  function pos(t, A, K) { var sn = Math.sin(t), c = Math.cos(t), d = 1 + sn * sn; return [A * c / d, K * A * sn * c / d]; }
  function frame(now) {
    loops.forEach(function (L) {
      var w = L.el.querySelector('b').offsetWidth, h = L.el.offsetHeight, gap = w / 2 + 4;
      if (L.w !== w || L.vw !== window.innerWidth) {
        L.w = w; L.vw = window.innerWidth;
        var A = Math.max(gap + 64, Math.min(h * 7.5, window.innerWidth / 2 - 34)), K = Math.min(1.5, (h * 0.8) / (0.354 * A));
        var P = [], len = [0], d = '', on = false;
        for (var k = 0; k <= 600; k++) {
          var q = pos(k / 600 * Math.PI * 2, A, K); P.push(q);
          if (k) len.push(len[k - 1] + Math.hypot(q[0] - P[k - 1][0], q[1] - P[k - 1][1]));
          if (Math.abs(q[0]) > gap + 4) { d += (on ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1); on = true; } else on = false;
        }
        L.P = P; L.len = len; L.path.setAttribute('d', d);
      }
      var T = L.len[L.len.length - 1], n = L.items.length, R = Math.max(0, Math.min(1, (prog - L.t0) / 0.14)), g = 1 - Math.pow(1 - R, 3);
      L.path.style.opacity = R.toFixed(3);
      L.items.forEach(function (it, i) {
        var target = (((reduce ? 0 : now / 40000) + i / n) % 1) * T, lo = 0, hi = L.len.length - 1;
        while (hi - lo > 1) { var m = (lo + hi) >> 1; if (L.len[m] < target) lo = m; else hi = m; }
        var q = L.P[lo], vis = Math.max(0, Math.min(1, (Math.abs(q[0]) - gap) / 22)), s = 0.25 + 0.75 * g;
        it.style.transform = 'translate(' + (q[0] * s).toFixed(1) + 'px,' + (q[1] * s).toFixed(1) + 'px) scale(' + ((0.55 + 0.45 * vis) * (0.4 + 0.6 * g)).toFixed(3) + ')';
        it.style.opacity = (vis * R).toFixed(3);
      });
    });
    if (running && !reduce) requestAnimationFrame(frame);
  }
  function onScroll() {
    if (reduce) return;
    var r = track.getBoundingClientRect(), tot = r.height - window.innerHeight;
    prog = Math.max(0, Math.min(1, -r.top / tot));
    words.forEach(function (w) { w.classList.toggle('on', prog >= at(w)); });
  }
  if (reduce) { words.forEach(function (w) { w.classList.add('on'); }); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      var vis = es[0].isIntersecting;
      if (vis && !running) { running = true; requestAnimationFrame(frame); } else if (!vis) running = false;
      if (reduce && vis) frame(0);
    }, { rootMargin: '200px 0px' }).observe(root);
  } else { running = true; requestAnimationFrame(frame); }
})();
