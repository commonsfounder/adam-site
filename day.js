(function () {
  var track = document.getElementById('dayTrack');
  if (!track) return;
  var IMG = { w: 3200, h: 2048 };
  var P = {
    cot: [0.5565, 0.2551], table: [0.6968, 0.3041], entry: [0.634, 0.758], door: [0.6085, 0.8603],
    hob: [0.7682, 0.2527], kitchen: [0.7105, 0.3413], hallway: [0.5622, 0.3959], bedroom: [0.4357, 0.2549]
  };
  var S = [
    { img: 's1', time: '3:12 am', head: 'June is crying.', bg: '#131316', dark: true, at: 'cot', z: 2.9,
      narr: 'A cry in the nursery. Adam tells the grown-ups and lets the house keep sleeping.',
      from: 'Adam', msg: 'June is crying in the nursery. Who is up?', chips: ['Maya', 'Dan'], pick: 0, done: 'Maya is up. Dan sleeps on.' },
    { img: 's2', time: '6:50 am', head: 'Kit day.', bg: '#e3d9cc', dark: false, at: 'table', z: 2.7,
      narr: 'Adam remembers what the family has told it, and says it at the moment it matters.',
      from: 'Adam', msg: 'Today is PE. Theo’s kit is by the dryer.', chips: ['Thanks'], pick: 0, done: 'Theo has it.' },
    { img: 's3', time: '8:10 am', head: 'Out the door.', bg: '#e6e1d8', dark: false, at: 'entry', z: 2.7,
      narr: 'The school run is the busiest minute of the day. Adam catches what gets left behind.',
      from: 'Adam', msg: 'Theo’s reading book is on the hall table.', chips: ['Dan, grab it'], pick: 0, done: 'Dan has it.' },
    { img: 's4', time: '11:30 am', head: 'A knock at the door.', bg: '#ebe8e1', dark: false, at: 'door', z: 2.7,
      narr: 'Nobody is home, and nothing is watching the door. Adam still hears it and tells you.',
      from: 'Adam', msg: 'Someone knocked at the front door. Nobody is home.', chips: ['Remind me at 5'], pick: 0, done: 'Reminder set for 5:00 pm.' },
    { img: 's5', time: '2:15 pm', head: 'The smoke alarm.', bg: '#ebe8e1', dark: false, at: 'hob', z: 3.0,
      narr: 'Adam’s radio keeps listening for smoke and CO alarms, even when the rest of it is asleep.',
      from: 'Adam', msg: 'The smoke alarm is sounding in the kitchen.', chips: ['Call Maya', 'Call Dan'], pick: 0, done: 'Calling Maya now.' },
    { img: 's6', time: '5:45 pm', head: 'Whose night is it?', bg: '#2e2a26', dark: true, at: 'kitchen', z: 2.7,
      narr: 'Most of running a home is agreeing who does what. Adam keeps the list so you do not have to.',
      from: 'Adam', msg: 'Dinner is at 7. Who is cooking?', chips: ['Maya', 'Dan'], pick: 0, done: 'Maya cooks. Dan takes bath time.' },
    { img: 's7', time: '7:30 pm', head: 'Bath time.', bg: '#2e2a26', dark: true, at: 'hallway', z: 2.7,
      narr: 'Adam asks first, and does not do anything you have not approved.',
      from: 'Adam', msg: 'June’s bath is due. Dan, can you take it?', chips: ['Yes', 'Ask Maya'], pick: 0, done: 'Dan has bath time.' },
    { img: 's8', time: '10:30 pm', head: 'Goodnight.', bg: '#131316', dark: true, at: 'bedroom', z: 2.7,
      narr: 'A quiet house, and tomorrow already in order.',
      from: 'Adam', msg: 'June and Theo are asleep. Tomorrow: swimming at 4, and Dan has a late meeting.', chips: ['Goodnight'], pick: 0, done: 'Quiet mode on.' }
  ];
  var WIDE = { x: 0.5, y: 0.52, z: 1.0 };
  var sec = track.parentNode, stage = document.getElementById('dayStage');
  var cam = document.createElement('div'); cam.className = 'day-cam'; stage.appendChild(cam);
  var imgs = S.map(function (s, i) {
    var im = document.createElement('img'); im.src = 'day/story/' + s.img + '.webp?v=1'; im.className = 'day-img'; im.decoding = 'async';
    im.alt = i === 0 ? 'A three-dimensional cutaway of a family home with Adam in it' : ''; if (i) im.setAttribute('aria-hidden', 'true');
    cam.appendChild(im); return im;
  });
  var ring = document.createElement('i'); ring.className = 'day-ring'; ring.setAttribute('aria-hidden', 'true'); stage.appendChild(ring);
  var card = document.createElement('div'); card.className = 'day-card'; card.setAttribute('aria-live', 'polite');
  card.innerHTML = '<div class="dc-from"></div><div class="dc-msg"></div><div class="dc-chips"></div><div class="dc-done"></div>';
  stage.appendChild(card);
  var time = document.getElementById('dayTime'), head = document.getElementById('dayHead'), narr = document.getElementById('dayNarr'), ticks = document.getElementById('dayTicks');
  var tickEls = S.map(function (s) { var li = document.createElement('li'); li.innerHTML = '<span></span><b>' + s.time + '</b>'; ticks.appendChild(li); return li; });
  var NS = S.length, shown = -1, tx = WIDE.x, ty = WIDE.y, tz = WIDE.z, cx = tx, cy = ty, cz = tz, spd = 0;
  var geo = { w: 0, h: 0, iw: 0, ih: 0, l: 0, t: 0 };

  function layout() {
    var W = stage.clientWidth, H = stage.clientHeight, k = Math.max(W / IMG.w, H / IMG.h) * 1.0;
    geo.W = W; geo.H = H; geo.iw = IMG.w * k; geo.ih = IMG.h * k; geo.l = (W - geo.iw) / 2; geo.t = (H - geo.ih) / 2;
    cam.style.width = geo.iw + 'px'; cam.style.height = geo.ih + 'px'; cam.style.left = geo.l + 'px'; cam.style.top = geo.t + 'px';
  }
  layout(); window.addEventListener('resize', layout);

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function foc(i) { var p = P[S[i].at]; return { x: p[0], y: p[1], z: geo.W < 720 ? Math.max(1.3, S[i].z * 0.5) : S[i].z }; }
  function mix(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t }; }

  function target(p) {
    var f = p * NS, i = Math.min(NS - 1, Math.floor(f)), t = f - i, now = foc(i), out;
    if (t < 0.2) {
      var prev = i === 0 ? WIDE : foc(i - 1), k = t / 0.2;
      var mid = mix(prev, WIDE, Math.min(1, k * 2)), arr = mix(WIDE, now, ease(Math.max(0, k * 2 - 1)));
      out = k < 0.5 ? mid : arr;
      if (i === 0) out = mix(WIDE, now, ease(k));
    } else {
      var d = (t - 0.2) / 0.8;
      out = { x: now.x, y: now.y, z: now.z * (1 + d * 0.1) };
    }
    return { i: i, t: t, c: out };
  }

  function show(i) {
    if (i === shown) return; shown = i; var s = S[i];
    imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
    sec.style.setProperty('--dbg', s.bg); sec.classList.toggle('dark', s.dark);
    time.textContent = s.time; head.textContent = s.head; narr.textContent = s.narr;
    [head, time, narr].forEach(function (n) { n.classList.remove('swap'); void n.offsetWidth; n.classList.add('swap'); });
    tickEls.forEach(function (li, k) { li.classList.toggle('on', k === i); li.classList.toggle('past', k < i); });
    card.querySelector('.dc-from').textContent = s.from; card.querySelector('.dc-msg').textContent = s.msg;
    var ch = card.querySelector('.dc-chips'); ch.innerHTML = '';
    s.chips.forEach(function (c, k) { var e = document.createElement('span'); e.textContent = c; if (k === s.pick) e.className = 'pick'; ch.appendChild(e); });
    card.querySelector('.dc-done').textContent = s.done;
    card.classList.remove('show', 'answered'); void card.offsetWidth;
  }

  var timer = 0;
  function frame() {
    var r = track.getBoundingClientRect(), total = r.height - innerHeight;
    var p = total > 0 ? Math.min(0.9999, Math.max(0, -r.top / total)) : 0;
    var T = target(p);
    tx = T.c.x; ty = T.c.y; tz = T.c.z;
    var ox = cx, oy = cy, oz = cz;
    cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14; cz += (tz - cz) * 0.14;
    var sp = Math.min(1, (Math.abs(cx - ox) * 50 + Math.abs(cy - oy) * 50 + Math.abs(cz - oz) * 2.5));
    spd += (sp - spd) * 0.25;
    var tX = geo.W / 2 - geo.l - cz * cx * geo.iw, tY = geo.H / 2 - geo.t - cz * cy * geo.ih;
    cam.style.transform = 'translate3d(' + tX.toFixed(1) + 'px,' + tY.toFixed(1) + 'px,0) scale(' + cz.toFixed(3) + ')';
    cam.style.filter = spd > 0.05 ? 'blur(' + (spd * 2.4).toFixed(2) + 'px)' : 'none';
    cam.style.setProperty('--inv', (1 / cz).toFixed(3));
    show(T.i);
    var arrived = T.t > 0.3;
    if (arrived && !card.classList.contains('show')) { card.classList.add('show'); clearTimeout(timer); timer = setTimeout(function () { card.classList.add('answered'); }, 1700); }
    if (!arrived) { card.classList.remove('show', 'answered'); clearTimeout(timer); }
    ring.classList.toggle('go', arrived);
    stage.classList.toggle('fast', T.t < 0.2);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
