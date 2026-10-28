(function () {
  var track = document.getElementById('dayTrack');
  if (!track) return;
  var P = { speaker: [0.4809, 0.5157], plugA: [0.4663, 0.429], plugB: [0.7633, 0.5659], bedroom: [0.3893, 0.2879], nursery: [0.5318, 0.3501], kitchen: [0.705, 0.4412], hallway: [0.5262, 0.5101], living: [0.3049, 0.5692] };
  var S = [
    { img: 'night', time: '3:12 am', head: 'Is the baby crying?', bg: '#131316', dark: true, at: 'nursery', z: 2.7, card: ['Nursery', 'Heard from the cot, so you can check before you get up.'] },
    { img: 'morning', time: '6:48 am', head: 'Who is home?', bg: '#e3d9cc', dark: false, at: 'bedroom', z: 2.5, card: ['Bedroom', 'The house knows which rooms are in use, and leaves the rest alone.'] },
    { img: 'day', time: '2:15 pm', head: 'An empty house, looked after.', bg: '#ebe8e1', dark: false, at: 'kitchen', z: 2.6, card: ['Kitchen', 'No one is home. Adam keeps listening.'] },
    { img: 'evening', time: '7:30 pm', head: 'Who is dealing with it?', bg: '#2e2a26', dark: true, at: 'hallway', z: 2.8, card: ['Hallway', 'Deliveries and chores go to the right person, not the loudest.'] }
  ];
  var WIDE = { x: 0.5, y: 0.5, z: 1.0 };
  var sec = track.parentNode, stage = document.getElementById('dayStage');
  function dayUrl(name) { return (window.AdamColour ? window.AdamColour.dayUrl(name) : 'day/' + name) + '?v=3'; }
  var cam = document.createElement('div'); cam.className = 'day-cam'; stage.appendChild(cam);
  var imgs = S.map(function (s, i) {
    var im = document.createElement('img'); im.src = dayUrl(s.img + '.webp'); im.className = 'day-img'; im.decoding = 'async';
    im.alt = i === 0 ? 'A three-dimensional view of a home with Adam in it' : ''; if (i) im.setAttribute('aria-hidden', 'true');
    cam.appendChild(im); return im;
  });
  window.addEventListener('adam-colour-change', function () { imgs.forEach(function (im, k) { im.src = dayUrl(S[k].img + '.webp'); }); });
  var ring = document.createElement('i'); ring.className = 'day-ring'; ring.setAttribute('aria-hidden', 'true'); cam.appendChild(ring);
  var card = document.createElement('div'); card.className = 'day-card'; card.setAttribute('aria-live', 'polite'); card.innerHTML = '<b></b><span></span>'; cam.appendChild(card);
  var time = document.getElementById('dayTime'), head = document.getElementById('dayHead');
  var spd = 0, NS = S.length, cur = -1, shown = -1, ticking = false, tx = WIDE.x, ty = WIDE.y, tz = WIDE.z, cx = tx, cy = ty, cz = tz;

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function foc(i) { var p = P[S[i].at]; return { x: p[0], y: p[1], z: S[i].z }; }
  function mix(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t }; }

  function target(p) {
    var f = p * NS, i = Math.min(NS - 1, Math.floor(f)), t = f - i, now = foc(i);
    var out;
    if (t < 0.22) {
      var prev = i === 0 ? WIDE : foc(i - 1);
      var k = t / 0.22, mid = mix(prev, WIDE, Math.min(1, k * 2)), arr = mix(WIDE, now, ease(Math.max(0, k * 2 - 1)));
      out = k < 0.5 ? mid : arr;
      if (i === 0) out = mix(WIDE, now, ease(k));
      out.z += Math.sin(k * Math.PI) * -0.25 * (i === 0 ? 0 : 1);
    } else {
      var d = (t - 0.22) / 0.78;
      out = { x: now.x, y: now.y, z: now.z * (1 + d * 0.16) };
    }
    return { i: i, t: t, c: out };
  }

  function show(i) {
    if (i === shown) return; shown = i; var s = S[i];
    imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
    sec.style.setProperty('--dbg', s.bg); sec.classList.toggle('dark', s.dark);
    time.textContent = s.time; head.textContent = s.head;
    [head, time].forEach(function (n) { n.classList.remove('swap'); void n.offsetWidth; n.classList.add('swap'); });
    var p = P[s.at]; ring.style.left = card.style.left = (p[0] * 100) + '%'; ring.style.top = card.style.top = (p[1] * 100) + '%';
    card.firstChild.textContent = s.card[0]; card.lastChild.textContent = s.card[1];
  }

  function frame() {
    ticking = false;
    var r = track.getBoundingClientRect(), total = r.height - innerHeight;
    var p = total > 0 ? Math.min(0.9999, Math.max(0, -r.top / total)) : 0;
    var T = target(p);
    tx = T.c.x; ty = T.c.y; tz = T.c.z;
    var ox = cx, oy = cy, oz = cz;
    cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16; cz += (tz - cz) * 0.16;
    var sp = Math.min(1, (Math.abs(cx - ox) * 60 + Math.abs(cy - oy) * 60 + Math.abs(cz - oz) * 3));
    spd += (sp - spd) * 0.25;
    var W = stage.clientWidth, H = stage.clientHeight;
    var px = (0.5 - cx) * W * cz, py = (0.5 - cy) * H * cz;
    var roll = (cx - tx) * -14;
    cam.style.transform = 'translate3d(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px,0) rotate(' + roll.toFixed(2) + 'deg) scale(' + cz.toFixed(3) + ')';
    cam.style.filter = spd > 0.04 ? 'blur(' + (spd * 3.2).toFixed(2) + 'px) brightness(' + (1 + spd * 0.06).toFixed(3) + ')' : 'none';
    cam.style.setProperty('--inv', (1 / cz).toFixed(3));
    var travelling = T.t < 0.22;
    show(T.t < 0.12 && T.i > 0 ? T.i : T.i);
    var arrived = T.t > 0.3;
    card.classList.toggle('show', arrived); ring.classList.toggle('go', arrived);
    stage.classList.toggle('fast', travelling);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
