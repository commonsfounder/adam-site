(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var root = document.documentElement;
  root.classList.add('mo');

  function splitWords(el) {
    var txt = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.textContent = '';
    txt.forEach(function (w, i) {
      var o = document.createElement('span'); o.className = 'mw'; o.setAttribute('aria-hidden', 'true');
      var s = document.createElement('span'); s.className = 'mi'; s.textContent = w; s.style.setProperty('--i', i);
      o.appendChild(s); el.appendChild(o); if (i < txt.length - 1) el.appendChild(document.createTextNode(' '));
    });
  }
  document.querySelectorAll('.story-head h2, .head h2:not(.hero-h), .closing h2').forEach(function (h) {
    if (h.querySelector('br')) { var parts = h.innerHTML.split(/<br\s*\/?>/i); h.innerHTML = ''; parts.forEach(function (p, i) { var d = document.createElement('span'); d.className = 'ml'; d.textContent = p.replace(/&rsquo;/g, '’'); h.appendChild(d); splitWords(d); if (i < parts.length - 1) h.appendChild(document.createElement('br')); }); }
    else splitWords(h);
    h.classList.add('msplit');
  });

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.msplit').forEach(function (n) { io.observe(n); });
  document.querySelectorAll('.tile, .principles > div, .twolist li, .statrow > div, .lede, .shot, .acc-item').forEach(function (n, i) { n.classList.add('mrise'); io.observe(n); });
  document.querySelectorAll('.bento').forEach(function (b) { Array.prototype.forEach.call(b.children, function (t, i) { t.style.setProperty('--d', (i * 90) + 'ms'); }); });
  document.querySelectorAll('.principles, .statrow, .twolist').forEach(function (g) { Array.prototype.forEach.call(g.children, function (t, i) { t.style.setProperty('--d', (i * 110) + 'ms'); }); });

  document.querySelectorAll('.statrow b').forEach(function (b) {
    var m = b.textContent.match(/^(\d+)$/); if (!m) return;
    var to = +m[1], done = false;
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting || done) return; done = true; o.disconnect();
      var t0 = performance.now(), dur = 1300;
      (function f(t) { var k = Math.min(1, (t - t0) / dur); b.textContent = Math.round(to * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(f); })(t0);
    }, { threshold: 0.6 });
    b.textContent = '0'; o.observe(b);
  });

  var par = Array.prototype.slice.call(document.querySelectorAll('[data-par]'));
  var hero = document.querySelector('.explode-wrap .device-col');
  var band = document.getElementById('marq');
  var closing = document.querySelector('.closing .wrap');
  var vy = 0, last = scrollY, pos = 0, tick = false;

  function frame() {
    tick = false;
    var y = scrollY, h = innerHeight;
    vy += ((y - last) - vy) * 0.2; last = y;
    par.forEach(function (el) {
      var r = el.parentNode.getBoundingClientRect();
      if (r.bottom < -100 || r.top > h + 100) return;
      var k = ((r.top + r.height / 2) - h / 2) / h;
      el.style.transform = 'translate3d(0,' + (k * -parseFloat(el.dataset.par)).toFixed(1) + 'px,0) scale(' + (1 + Math.abs(k) * 0.04).toFixed(3) + ')';
    });
    if (hero) {
      var rr = hero.parentNode.getBoundingClientRect();
      hero.style.setProperty('--hy', Math.max(0, Math.min(1, y / (h * 0.9))).toFixed(3));
    }
    if (band) {
      pos -= 1.2 + Math.abs(vy) * 0.9;
      var w = band.firstElementChild.offsetWidth;
      if (w) { pos = pos % w; band.style.transform = 'translate3d(' + pos.toFixed(1) + 'px,0,0)'; }
      band.style.setProperty('--sk', Math.max(-8, Math.min(8, vy * -0.35)).toFixed(2) + 'deg');
    }
    if (closing) {
      var cr = closing.parentNode.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, 1 - cr.top / h));
      closing.style.transform = 'scale(' + (0.9 + p * 0.1).toFixed(3) + ')';
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  document.querySelectorAll('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) {
      var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      t.style.setProperty('--rx', (y * -5).toFixed(2) + 'deg'); t.style.setProperty('--ry', (x * 5).toFixed(2) + 'deg');
      t.style.setProperty('--mx', ((x + 0.5) * 100).toFixed(0) + '%'); t.style.setProperty('--my', ((y + 0.5) * 100).toFixed(0) + '%');
    });
    t.addEventListener('pointerleave', function () { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); });
  });
})();
