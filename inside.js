(function () {
    var L = window.ADAM_LAYERS;
    var SETS = {
      speaker: [
        { k: 'panel', name: 'Top panel', side: 'r', rows: ['Frosted satin polymer', '4 digital MEMS microphones', 'The light shows listening, thinking and speaking'] },
        { k: 'shell', name: 'Fabric shell', side: 'b', cardSide: 'r', weave: true, rows: ['Tightly woven acoustic fabric', 'Hollow shell', 'Lets sound out and hides the electronics'] },
        { k: 'processor', name: 'Processor', side: 't', zoom: true, rows: ['Quad-core Arm Cortex-A55', 'On-chip neural engine', 'Runs Adam and what it learns about your home'] },
        { k: 'memory', name: 'Memory', side: 't', rows: ['2 GB LPDDR4', 'Holds your household’s memory on the device'] },
        { k: 'storage', name: 'Storage', side: 'l', rows: ['16 GB eMMC'] },
        { k: 'radio', name: 'Radio', side: 'r', rows: ['Wi-Fi 6, Bluetooth 5, Thread', 'Listens for smoke and CO alarms while the processor sleeps'] },
        { k: 'radar', name: 'Presence radar', side: 'b', rows: ['24 GHz radar', 'Senses people without a camera'] },
        { k: 'board', name: 'Circuit board', side: 'l', rows: ['Temperature, humidity and light sensors', 'Carries the chips and power'] },
        { k: 'driver', name: 'Speaker driver', side: 'l', rows: ['3 inch full-range', 'Class-D amplifier', 'Adam’s voice'] },
        { k: 'base', name: 'Base', side: 'r', rows: ['Matte anodised aluminium, 2 cm', 'Power, mute switch and reset on the rear'] }
      ],
      plug: [
        { k: 'housing', name: 'Front cover', side: 'r', rows: ['Radar window, status light and vents', 'One microphone pinhole'] },
        { k: 'board', name: 'Sensor board', side: 'l', rows: ['Wi-Fi 6, Bluetooth 5, Thread', '24 GHz radar', 'Temperature, humidity and light'] },
        { k: 'module', name: 'Power module', side: 'r', rows: ['5 V, isolated AC to DC'] },
        { k: 'pins', name: 'Back shell and pins', side: 'l', rows: ['UK three-pin', 'Fits a standard wall socket'] }
      ]
    };
    var set = 'speaker', cur = -1, weaveRaf = 0;
    var stage = document.getElementById('stage'), plist = document.getElementById('plist'), mcard = document.getElementById('mcard');
    var nodes = [], macro = null, screen = null, zoomTimer = 0;

    function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
    function pct(v) { return (v * 100).toFixed(3) + '%'; }
    function isDesktop() { return window.innerWidth >= 861; }

    function makeCard(p) {
      var c = el('div', 'pcard');
      var key = el('div', 'key'); key.textContent = p.name;
      var rows = el('div', 'rows');
      p.rows.forEach(function (r, i) { var d = el('div', i === p.rows.length - 1 && p.rows.length > 1 ? 'm' : ''); d.textContent = r; rows.appendChild(d); });
      var top = el('div', 'ctop'); top.appendChild(key); top.appendChild(rows);
      c.appendChild(top);
      if (p.weave) { var cv = el('canvas', 'weave'); cv.width = 340; cv.height = 170; c.appendChild(cv); c.weaveCanvas = cv; }
      return c;
    }

    function place(node, p, bb, card) {
      var x0 = bb[0], y0 = bb[1], x1 = bb[2], y1 = bb[3], cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, g = 0.012;
      var s = card ? card.style : node.style;
      var t = card || node;
      var side = card ? (p.cardSide || p.side) : p.side;
      t.style.left = t.style.right = t.style.top = t.style.bottom = 'auto';
      t.style.transform = '';
      if (side === 'r') { t.style.left = pct(x1 + g); t.style.top = pct(cy); t.style.transform = 'translateY(-50%)'; }
      if (side === 'l') { t.style.right = pct(1 - x0 + g); t.style.top = pct(cy); t.style.transform = 'translateY(-50%)'; }
      if (side === 't') { t.style.left = pct(cx); t.style.top = pct(y0 - g); t.style.transform = 'translate(-50%, -100%)'; }
      if (side === 'b') { t.style.left = pct(cx); t.style.top = pct(y1 + g); t.style.transform = 'translateX(-50%)'; }
    }

    function clamp(card) {
      if (!isDesktop()) return;
      var sr = stage.getBoundingClientRect(), r = card.getBoundingClientRect();
      var dx = 0;
      if (r.left < sr.left + 6) dx = sr.left + 6 - r.left;
      if (r.right > sr.right - 6) dx = sr.right - 6 - r.right;
      if (dx) card.style.marginLeft = dx + 'px';
    }

    function build() {
      stopWeave(); stopGame();
      stage.innerHTML = ''; plist.innerHTML = ''; mcard.innerHTML = ''; nodes = []; cur = -1;
      stage.classList.remove('focus', 'zoomed'); macro = null; screen = null;
      var parts = SETS[set], B = L[set];
      parts.forEach(function (p, i) {
        var bb = B[p.k];
        var lay = el('img', 'lay'); lay.src = 'inside/' + set + '_' + p.k + '.webp'; lay.alt = '';
        var lin = el('img', 'lin'); lin.src = 'inside/' + set + '_' + p.k + '_line.webp'; lin.alt = '';
        lay.style.transformOrigin = lin.style.transformOrigin = pct((bb[0] + bb[2]) / 2) + ' ' + pct((bb[1] + bb[3]) / 2);
        stage.appendChild(lay); stage.appendChild(lin);
        p._lay = lay; p._lin = lin;
      });
      parts.forEach(function (p, i) {
        var bb = B[p.k];
        var hit = el('button', 'hit'); hit.type = 'button'; hit.setAttribute('aria-label', p.name);
        hit.style.left = pct(bb[0]); hit.style.top = pct(bb[1]); hit.style.width = pct(bb[2] - bb[0]); hit.style.height = pct(bb[3] - bb[1]);
        hit.addEventListener('click', function () { open(i); });
        hit.addEventListener('mouseenter', function () { p._lay.classList.add('hov'); });
        hit.addEventListener('mouseleave', function () { p._lay.classList.remove('hov'); });
        stage.appendChild(hit);
        var tag = el('div', 'ptag'); var tb = el('span', 'ptagb'); tb.textContent = p.name; tag.appendChild(tb);
        tb.addEventListener('click', function () { open(i); });
        place(tag, p, bb);
        stage.appendChild(tag);
        var card = makeCard(p); card.classList.add('floating');
        place(null, p, bb, card);
        stage.appendChild(card);
        var mc = makeCard(p); mcard.appendChild(mc);
        var li = el('li'); var lb = el('button'); lb.type = 'button'; lb.textContent = p.name; lb.addEventListener('click', function () { open(i); }); li.appendChild(lb); plist.appendChild(li);
        nodes.push({ tag: tag, card: card, mc: mc });
      });
      if (set === 'speaker') {
        macro = el('div', 'macro'); var mi = el('img'); mi.src = 'inside/macro_processor.webp'; mi.alt = 'The processor, close up'; macro.appendChild(mi);
        screen = el('canvas', 'screen'); macro.appendChild(screen); stage.appendChild(macro);
      }
    }

    function startWeave(cv) {
      var ctx = cv.getContext('2d'), W = cv.width, H = cv.height, S = 14;
      var mx = -999, my = -999, tx = -999, ty = -999;
      function pos(e) { var r = cv.getBoundingClientRect(); tx = (e.clientX - r.left) * W / r.width; ty = (e.clientY - r.top) * H / r.height; }
      cv.onpointermove = pos; cv.onpointerdown = pos;
      cv.onpointerleave = function () { tx = ty = -999; };
      function rr(x, y, w, h, r) { if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); } else { ctx.fillRect(x, y, w, h); } }
      function frame() {
        mx += (tx - mx) * 0.2; my += (ty - my) * 0.2;
        ctx.fillStyle = '#463f35'; ctx.fillRect(0, 0, W, H);
        for (var j = -1; j <= Math.ceil(H / S); j++) {
          for (var i = -1; i <= Math.ceil(W / S); i++) {
            var cx = i * S + S / 2, cy = j * S + S / 2, dx = cx - mx, dy = cy - my, d = Math.sqrt(dx * dx + dy * dy);
            var f = Math.exp(-(d * d) / (2 * 46 * 46));
            var ox = d > 0.5 ? dx / d * f * 16 : 0, oy = d > 0.5 ? dy / d * f * 16 : 0;
            var over = ((i + j) & 1) === 0;
            var lift = 1 + f * 0.35;
            var base = over ? [201, 189, 163] : [160, 148, 124];
            var add = f * 55;
            ctx.fillStyle = 'rgb(' + Math.min(255, base[0] + add | 0) + ',' + Math.min(255, base[1] + add | 0) + ',' + Math.min(255, base[2] + add | 0) + ')';
            var x = cx + ox, y = cy + oy;
            if (over) rr(x - S * 0.4 * lift, y - S * 0.52, S * 0.8 * lift, S * 1.04, S * 0.3);
            else rr(x - S * 0.52, y - S * 0.4 * lift, S * 1.04, S * 0.8 * lift, S * 0.3);
          }
        }
        weaveRaf = requestAnimationFrame(frame);
      }
      stopWeave(); frame();
    }

    var gameTimer = 0, gameKey = null;

    function homography(w, h, q) {
      var src = [[0, 0], [w, 0], [w, h], [0, h]], A = [], v = [], i, j, k;
      for (i = 0; i < 4; i++) {
        var x = src[i][0], y = src[i][1], u = q[i][0], t = q[i][1];
        A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
        A.push([0, 0, 0, x, y, 1, -t * x, -t * y, t]);
      }
      for (i = 0; i < 8; i++) {
        var p = i;
        for (j = i + 1; j < 8; j++) if (Math.abs(A[j][i]) > Math.abs(A[p][i])) p = j;
        var tmp = A[i]; A[i] = A[p]; A[p] = tmp;
        for (j = i + 1; j < 8; j++) { var f = A[j][i] / A[i][i]; for (k = i; k < 9; k++) A[j][k] -= f * A[i][k]; }
      }
      for (i = 7; i >= 0; i--) { var sum = A[i][8]; for (j = i + 1; j < 8; j++) sum -= A[i][j] * v[j]; v[i] = sum / A[i][i]; }
      return 'matrix3d(' + [v[0], v[3], 0, v[6], v[1], v[4], 0, v[7], 0, 0, 1, 0, v[2], v[5], 0, 1].join(',') + ')';
    }

    function startDieGame(macro, cv) {
      var W = 280, H = 280, C = 20, GW = 14, GH = 14;
      cv.width = W; cv.height = H; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      function fit() {
        var mw = macro.offsetWidth, mh = macro.offsetHeight, q = window.ADAM_DIE.map(function (p) { return [p[0] * mw, p[1] * mh]; });
        cv.style.transform = homography(W, H, q);
      }
      fit(); cv.fitFn = fit;
      var ctx = cv.getContext('2d'), snake, dir, next, food, score, sx = 0, sy = 0, tick = 0;
      function spawn() { do { food = { x: Math.floor(Math.random() * GW), y: Math.floor(Math.random() * GH) }; } while (snake.some(function (b) { return b.x === food.x && b.y === food.y; })); }
      function reset() { snake = [{ x: 6, y: 7 }, { x: 5, y: 7 }, { x: 4, y: 7 }]; dir = next = { x: 1, y: 0 }; score = 0; spawn(); }
      function px(x, y, c, glow) {
        ctx.fillStyle = c; ctx.shadowColor = glow ? '#ff7a33' : 'transparent'; ctx.shadowBlur = glow ? 10 : 0;
        ctx.fillRect(x * C + 2, y * C + 2, C - 4, C - 4);
      }
      function draw() {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(12,10,8,0.84)'; ctx.fillRect(0, 0, W, H);
        for (var y = 0; y < GH; y++) for (var x = 0; x < GW; x++) px(x, y, 'rgba(255,255,255,0.045)', false);
        snake.forEach(function (b, i) { px(b.x, b.y, i === 0 ? '#ffb27a' : '#ff6a22', true); });
        if (tick % 6 < 4) px(food.x, food.y, '#ffd9bd', true);
        ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,170,110,0.95)'; ctx.font = '500 13px "Geist Mono", monospace'; ctx.fillText(String(score), 6, 14);
      }
      function step() {
        tick++; dir = next;
        var h = { x: (snake[0].x + dir.x + GW) % GW, y: (snake[0].y + dir.y + GH) % GH };
        if (snake.some(function (b) { return b.x === h.x && b.y === h.y; })) { reset(); draw(); return; }
        snake.unshift(h);
        if (h.x === food.x && h.y === food.y) { score++; spawn(); } else snake.pop();
        draw();
      }
      function turn(x, y) { if (x === -dir.x && y === -dir.y) return; next = { x: x, y: y }; }
      gameKey = function (e) {
        var m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] }[e.key];
        if (!m) return false; turn(m[0], m[1]); return true;
      };
      macro.onpointerdown = function (e) { sx = e.clientX; sy = e.clientY; };
      macro.onpointerup = function (e) {
        var dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) < 14 && Math.abs(dy) < 14) return;
        if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0); else turn(0, dy > 0 ? 1 : -1);
      };
      stopGame(); reset(); draw();
      gameTimer = setInterval(step, 120);
    }
    function stopGame() { if (gameTimer) clearInterval(gameTimer); gameTimer = 0; gameKey = null; }
    function stopWeave() { if (weaveRaf) cancelAnimationFrame(weaveRaf); weaveRaf = 0; }

    function open(i) {
      var parts = SETS[set], n = (i + parts.length) % parts.length, p = parts[n];
      cur = n;
      stage.classList.add('focus');
      parts.forEach(function (q, k) {
        q._lay.classList.toggle('sel', k === n); q._lin.classList.toggle('sel', k === n);
        nodes[k].card.classList.remove('on'); nodes[k].mc.classList.remove('on');
        nodes[k].tag.style.visibility = (k === n && isDesktop()) ? 'hidden' : '';
      });
      var node = nodes[n];
      node.card.style.marginLeft = '';
      node.card.classList.add('on'); node.mc.classList.add('on');
      clamp(node.card);
      stopWeave(); stopGame(); clearTimeout(zoomTimer);
      stage.classList.remove('zoomed');
      parts.forEach(function (q, k) { place(null, q, L[set][q.k], nodes[k].card); });
      node.card.style.marginLeft = '';
      var cv = isDesktop() ? node.card.weaveCanvas : node.mc.weaveCanvas;
      if (cv) startWeave(cv);
      if (p.zoom && macro) {
        zoomTimer = setTimeout(function () {
          stage.classList.add('zoomed');
          if (isDesktop()) { var cs = node.card.style; cs.left = 'auto'; cs.bottom = 'auto'; cs.right = '0'; cs.top = '50%'; cs.transform = 'translateY(-50%)'; }
          startDieGame(macro, screen);
        }, 450);
      }
    }
    function close() {
      cur = -1; clearTimeout(zoomTimer); stage.classList.remove('focus', 'zoomed'); stopWeave(); stopGame();
      SETS[set].forEach(function (q, k) { q._lay.classList.remove('sel'); q._lin.classList.remove('sel'); nodes[k].card.classList.remove('on'); nodes[k].mc.classList.remove('on'); nodes[k].tag.style.visibility = ''; });
    }

    stage.addEventListener('click', function (e) { if (e.target === stage) close(); });
    document.querySelectorAll('#seg button').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.set === set) return;
        set = b.dataset.set;
        document.querySelectorAll('#seg button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        var ready = false;
    function load() { if (ready) return; ready = true; build(); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { load(); o.disconnect(); } }, { rootMargin: '800px 0px' }).observe(stage);
    } else load();
      });
    });
    document.addEventListener('keydown', function (e) {
      var sr = stage.getBoundingClientRect();
      if (sr.bottom < 0 || sr.top > window.innerHeight) return;
      if (e.key === 'Escape') close();
      if (cur < 0) return;
      if (gameKey && gameKey(e)) { e.preventDefault(); return; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') open(cur + 1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') open(cur - 1);
    });
    window.addEventListener('resize', function () { if (screen && screen.fitFn && stage.classList.contains('zoomed')) screen.fitFn(); if (cur >= 0 && !(SETS[set][cur] && SETS[set][cur].zoom)) open(cur); });
    var ready = false;
    function load() { if (ready) return; ready = true; build(); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { load(); o.disconnect(); } }, { rootMargin: '800px 0px' }).observe(stage);
    } else load();
  })();
