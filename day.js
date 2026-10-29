(function () {
  var track = document.getElementById('dayTrack');
  if (!track) return;
  var IMG = { w: 3200, h: 2048 };
  var P = {
    cot: [0.5565, 0.2551], table: [0.6968, 0.3041], entry: [0.634, 0.758], door: [0.6085, 0.8603],
    hob: [0.7682, 0.2527], kitchen: [0.7105, 0.3413], hallway: [0.5622, 0.3959], bedroom: [0.4357, 0.2549], fall: [0.5278, 0.4873]
  };
  var S = [
    { img: 's1', time: '3:12 am', head: 'June is crying.', bg: '#131316', dark: true, at: 'cot', z: 2.9,
      narr: 'A cry in the nursery. Adam tells the grown-ups and lets the house keep sleeping.',
      from: 'Adam', msg: 'June is crying in the nursery. Who is up?', chips: ['Maya', 'Dan'], pick: 0, done: 'Maya is up. Dan sleeps on.' },
    { img: 's2', time: '6:50 am', head: 'Kit day.', bg: '#e3d9cc', dark: false, at: 'table', z: 2.7,
      narr: 'Adam remembers what the family has told it, and says it at the moment it matters.',
      from: 'Adam', msg: 'Today is PE. Theo’s kit is by the dryer.', chips: ['Thanks'], pick: 0, done: 'Theo has it.' },
    { img: 's3', time: '8:10 am', head: 'Out the door.', bg: '#e6e1d8', dark: false, at: 'entry', z: 2.7,
      narr: 'The busiest minute of the day is when the small things slip. Adam keeps track of the ones that matter.',
      from: 'Adam', msg: 'Gran has not taken her morning tablets.', chips: ['Remind her', 'Tell Maya'], pick: 0, done: 'Gran has been reminded.' },
    { img: 's4', time: '11:30 am', head: 'A knock at the door.', bg: '#ebe8e1', dark: false, at: 'door', z: 2.7,
      narr: 'Nobody is home, and nothing is watching the door. Adam still hears it and tells you.',
      from: 'Adam', msg: 'Someone knocked at the front door. Nobody is home.', chips: ['Tell Maya', 'Ignore'], pick: 0, done: 'Maya has been told.' },
    { img: 's5', time: '2:15 pm', head: 'The smoke alarm.', bg: '#ebe8e1', dark: false, at: 'hob', z: 3.0,
      narr: 'Adam’s radio keeps listening for smoke and CO alarms, even when the rest of it is asleep.',
      from: 'Adam', msg: 'The smoke alarm is sounding in the kitchen.', chips: ['Call Maya', 'Call Dan'], pick: 0, done: 'Calling Maya now.' },
    { img: 's6', time: '5:45 pm', head: 'A fall.', bg: '#2e2a26', dark: true, at: 'fall', z: 2.9,
      narr: 'Adam listens for the sounds that mean something is wrong, and gets the right person there.',
      from: 'Adam', msg: 'I heard a fall in the living room. Gran is not answering. Should I call 999?', chips: ['Yes, call 999', 'She’s okay'], pick: 0, done: 'Calling 999. Maya and Dan have been told.' },
    { img: 's7', time: '7:30 pm', head: 'Bath time.', bg: '#2e2a26', dark: true, at: 'hallway', z: 2.7,
      narr: 'Adam asks first, and does not do anything you have not approved.',
      from: 'Adam', msg: 'June’s bath is due. Dan, can you take it?', chips: ['Yes', 'Ask Maya'], pick: 0, done: 'Dan has bath time.' },
    { img: 's8', time: '10:30 pm', head: 'Goodnight.', bg: '#131316', dark: true, at: 'bedroom', z: 2.7,
      narr: 'A quiet house, and tomorrow already in order.',
      from: 'Adam', msg: 'June and Theo are asleep. Tomorrow: swimming at 4, and Dan has a late meeting.', chips: ['Goodnight'], pick: 0, done: 'Quiet mode on. Lights off.', after: 's8b' }
  ];
  var WIDE = { x: 0.5, y: 0.52, z: 1.0 };
  var sec = track.parentNode, stage = document.getElementById('dayStage');
  var cam = document.createElement('div'); cam.className = 'day-cam day-strip'; stage.appendChild(cam);
  var panels = S.map(function () { var d = document.createElement('div'); d.className = 'day-panel'; cam.appendChild(d); return d; });
  var imgs = S.map(function (s, i) {
    var im = document.createElement('img'); im.src = 'day/story/' + s.img + '.webp?v=2'; im.className = 'day-img'; im.decoding = 'async';
    im.alt = i === 0 ? 'A three-dimensional cutaway of a family home with Adam in it' : ''; if (i) im.setAttribute('aria-hidden', 'true');
    panels[i].appendChild(im); return im;
  });
  var afters = S.map(function (s, i) {
    if (!s.after) return null;
    var im = document.createElement('img'); im.src = 'day/story/' + s.after + '.webp?v=2'; im.className = 'day-img slow'; im.decoding = 'async'; im.setAttribute('aria-hidden', 'true');
    panels[i].appendChild(im); return im;
  });
  function setAfter(on) { afters.forEach(function (im, k) { if (im) { im.classList.toggle('on', on && k === shown); imgs[k].classList.toggle('dim', on && k === shown); } }); }
  var ring = document.createElement('i'); ring.className = 'day-ring'; ring.setAttribute('aria-hidden', 'true'); stage.appendChild(ring);
  var card = document.createElement('div'); card.className = 'day-card'; card.setAttribute('aria-live', 'polite');
  card.innerHTML = '<div class="dc-from"></div><div class="dc-msg"></div><div class="dc-chips"></div><div class="dc-done"></div>';
  stage.appendChild(card);
  var time = document.getElementById('dayTime'), head = document.getElementById('dayHead'), narr = document.getElementById('dayNarr'), ticks = document.getElementById('dayTicks');
  var tickEls = S.map(function (s) { var li = document.createElement('li'); li.innerHTML = '<span></span><b>' + s.time + '</b>'; ticks.appendChild(li); return li; });
  var NS = S.length, shown = -1, cx = 0, spd = 0;
  var geo = { w: 0, h: 0, iw: 0, ih: 0, l: 0, t: 0 };

  function place() {
    S.forEach(function (sc, i) {
      var f = foc(i), els = [imgs[i], afters[i]];
      els.forEach(function (im) {
        if (!im) return;
        im.style.width = geo.iw * f.z + 'px'; im.style.height = geo.ih * f.z + 'px';
        im.style.left = (geo.W / 2 - f.z * f.x * geo.iw) + 'px'; im.style.top = (geo.H / 2 - f.z * f.y * geo.ih) + 'px';
        im.style.transformOrigin = (f.x * 100) + '% ' + (f.y * 100) + '%';
      });
    });
  }
  function layout() {
    var W = stage.clientWidth, H = stage.clientHeight, k = Math.max(W / IMG.w, H / IMG.h);
    geo.W = W; geo.H = H; geo.iw = IMG.w * k; geo.ih = IMG.h * k;
    cam.style.width = W * NS + 'px'; cam.style.height = H + 'px';
    panels.forEach(function (p, i) { p.style.left = i * W + 'px'; p.style.width = W + 'px'; p.style.height = H + 'px'; });
    place();
  }
  layout(); window.addEventListener('resize', layout);

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function foc(i) { var p = P[S[i].at]; return { x: p[0], y: p[1], z: geo.W < 720 ? Math.max(1.3, S[i].z * 0.5) : S[i].z }; }
  function mix(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t }; }

  function target(p) {
    var f = p * NS, i = Math.min(NS - 1, Math.floor(f)), t = f - i, pos = i, d = 0;
    if (t < 0.25 && i > 0) pos = i - 1 + ease(t / 0.25);
    else d = (t - 0.25) / 0.75;
    return { i: i, t: t, pos: pos, d: Math.max(0, d) };
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
    card.classList.remove('show', 'answered'); setAfter(false); void card.offsetWidth;
  }

  var timer = 0;
  function frame() {
    var r = track.getBoundingClientRect(), total = r.height - innerHeight;
    var p = total > 0 ? Math.min(0.9999, Math.max(0, -r.top / total)) : 0;
    var T = target(p);
    var op = cx; cx += (T.pos - cx) * 0.18;
    var sp = Math.min(1, Math.abs(cx - op) * 6); spd += (sp - spd) * 0.25;
    cam.style.transform = 'translate3d(' + (-cx * geo.W).toFixed(1) + 'px,0,0)';
    cam.style.filter = spd > 0.05 ? 'blur(' + (spd * 1.6).toFixed(2) + 'px)' : 'none';
    imgs.forEach(function (im, k) { var z = k === T.i ? 1 + T.d * 0.08 : 1; im.style.transform = 'scale(' + z.toFixed(3) + ')'; if (afters[k]) afters[k].style.transform = im.style.transform; });
    show(T.i);
    var arrived = T.t > 0.35;
    if (arrived && !card.classList.contains('show')) { card.classList.add('show'); clearTimeout(timer); timer = setTimeout(function () { card.classList.add('answered'); setAfter(true); }, 1700); }
    if (!arrived) { card.classList.remove('show', 'answered'); clearTimeout(timer); setAfter(false); }
    ring.classList.toggle('go', arrived);
    stage.classList.toggle('fast', T.t < 0.25);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
