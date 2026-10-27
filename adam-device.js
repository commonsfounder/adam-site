(function () {
  var COUNT = 36;
  var VER = '15';
  var HALF = [0.107, 0.12, 0.16, 0.115, 0.13];
  var SIDE = [1, -1, 1, -1, 1];
  var host = document.getElementById('device');
  if (!host) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'gl-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Adam speaker, assembled and opened to show its parts');
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var frames = new Array(COUNT);
  var pts = null;
  var tags = [];
  var target = 0, shown = 0, raf = 0, dpr = 1;
  var px = 0, py = 0, tx = 0, ty = 0;
  var rect = { x: 0, y: 0, w: 1, h: 1 };

  function url(i) { return 'frames/f' + (i < 10 ? '0' + i : i) + '.webp?v=' + VER; }
  function ready(img) { return img && img.complete && img.naturalWidth; }

  function size() {
    var r = host.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    draw();
  }

  function blit(img, a) {
    var s = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    var dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    var x = (canvas.width - dw) / 2 + px * dpr, y = (canvas.height - dh) / 2 + py * dpr;
    rect = { x: x / dpr, y: y / dpr, w: dw / dpr, h: dh / dpr };
    ctx.globalAlpha = a;
    ctx.drawImage(img, x, y, dw, dh);
  }

  function place(f) {
    if (!pts || !tags.length) return;
    var i = Math.floor(f), t = f - i, j = Math.min(COUNT - 1, i + 1);
    var hw = host.clientWidth;
    tags.forEach(function (tag, k) {
      var a = pts[i][k], b = pts[j][k];
      var ax = rect.x + (a[0] + (b[0] - a[0]) * t) * rect.w;
      var ay = rect.y + (a[1] + (b[1] - a[1]) * t) * rect.h;
      var edge = ax + SIDE[k] * (HALF[k] + 0.025) * rect.w;
      var col = rect.x + (SIDE[k] > 0 ? 0.76 : 0.24) * rect.w;
      tag.el.style.setProperty('--w', Math.max(14, Math.abs(col - edge)) + 'px');
      tag.el.style.top = ay + 'px';
      if (SIDE[k] > 0) { tag.el.style.left = edge + 'px'; tag.el.style.right = 'auto'; }
      else { tag.el.style.right = (hw - edge) + 'px'; tag.el.style.left = 'auto'; }
    });
  }

  function mark() {
    tags.forEach(function (tag) { tag.el.classList.toggle('on', target >= tag.from); });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var f = Math.min(COUNT - 1, Math.max(0, shown * (COUNT - 1)));
    var i = Math.floor(f), t = f - i;
    var a = frames[i], b = frames[Math.min(COUNT - 1, i + 1)];
    if (ready(a)) blit(a, 1);
    if (ready(b) && t > 0.001) blit(b, t);
    ctx.globalAlpha = 1;
    place(f);
  }

  function tick() {
    raf = 0;
    shown += (target - shown) * 0.16;
    px += (tx - px) * 0.08; py += (ty - py) * 0.08;
    draw();
    if (Math.abs(target - shown) > 0.0004 || Math.abs(tx - px) > 0.05 || Math.abs(ty - py) > 0.05) raf = requestAnimationFrame(tick);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.AdamDevice = {
    setProgress: function (p) { target = reduce ? 0 : p; if (reduce) shown = 0; mark(); kick(); }
  };

  if (!reduce && window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 10;
      ty = (e.clientY / window.innerHeight - 0.5) * 5;
      kick();
    }, { passive: true });
  }

  function buildTags() {
    document.querySelectorAll('#parts li').forEach(function (li) {
      var el = document.createElement('div');
      el.className = 'tag';
      el.innerHTML = '<i class="td"></i><i class="tl"></i><span class="tt"><b></b><span></span></span>';
      el.querySelector('b').textContent = li.querySelector('b').textContent;
      el.querySelector('.tt span').textContent = li.querySelector('span').textContent;
      var tipText = li.getAttribute('data-tip');
      if (tipText) {
        var id = 'tip-' + tags.length, tip = document.createElement('span');
        tip.className = 'tip'; tip.id = id; tip.setAttribute('role', 'tooltip'); tip.textContent = tipText;
        el.querySelector('.tt').appendChild(tip);
        el.tabIndex = 0; el.setAttribute('aria-describedby', id);
        var timer = 0;
        var show = function (now) { clearTimeout(timer); timer = setTimeout(function () { el.classList.add('tipon'); }, now ? 0 : 150); };
        var hide = function () { clearTimeout(timer); el.classList.remove('tipon'); };
        el.addEventListener('pointerenter', function () { show(false); });
        el.addEventListener('pointerleave', hide);
        el.addEventListener('focus', function () { show(true); });
        el.addEventListener('blur', hide);
        el.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
      }
      host.appendChild(el);
      if (tags.length % 2 === 1) el.classList.add('l');
      tags.push({ el: el, from: parseFloat(li.getAttribute('data-from')) });
    });
    mark();
    draw();
  }

  function load(i, first) {
    var img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      if (first) {
        host.appendChild(canvas);
        host.classList.add('gl');
        size();
        window.addEventListener('resize', size);
        for (var k = 1; k < COUNT; k++) load(k, false);
        fetch('frames/pts.json?v=' + VER).then(function (r) { return r.json(); }).then(function (d) { pts = d; buildTags(); }).catch(function () {});
      } else { draw(); }
    };
    img.src = url(i);
    frames[i] = img;
  }
  load(0, true);
})();
