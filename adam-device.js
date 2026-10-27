// Scroll-driven product render: pre-rendered frames of the speaker opening up.
// site.js drives it through window.AdamDevice.setProgress(0..1).
(function () {
  var COUNT = 36;
  var VER = '10';
  var host = document.getElementById('device');
  if (!host) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'gl-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Adam speaker, assembled and opened to show its parts');
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var frames = new Array(COUNT);
  var target = 0, shown = 0, raf = 0, dpr = 1;
  var px = 0, py = 0, tx = 0, ty = 0;

  function url(i) { return 'frames/f' + (i < 10 ? '0' + i : i) + '.webp?v=' + VER; }

  function size() {
    var r = host.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    draw();
  }

  function ready(img) { return img && img.complete && img.naturalWidth; }

  function blit(img, a) {
    var s = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    var dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    ctx.globalAlpha = a;
    ctx.drawImage(img, (canvas.width - dw) / 2 + px * dpr, (canvas.height - dh) / 2 + py * dpr, dw, dh);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var f = Math.min(COUNT - 1, Math.max(0, shown * (COUNT - 1)));
    var i = Math.floor(f), t = f - i;
    var a = frames[i], b = frames[Math.min(COUNT - 1, i + 1)];
    if (ready(a)) blit(a, 1);
    if (ready(b) && t > 0.001) blit(b, t);
    ctx.globalAlpha = 1;
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
    setProgress: function (p) { target = reduce ? 0 : p; if (reduce) shown = 0; kick(); }
  };

  if (!reduce && window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 10;
      ty = (e.clientY / window.innerHeight - 0.5) * 5;
      kick();
    }, { passive: true });
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
      } else { draw(); }
    };
    img.src = url(i);
    frames[i] = img;
  }
  load(0, true);
})();
