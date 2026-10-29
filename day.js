(function () {
  var track = document.getElementById('dayTrack');
  if (!track) return;
  var IMG = { w: 3200, h: 2048 };
  var P = {
    cot: [0.5565, 0.2551], table: [0.6968, 0.3041], entry: [0.634, 0.758], door: [0.6085, 0.8603],
    hob: [0.7682, 0.2527], kitchen: [0.7105, 0.3413], hallway: [0.5622, 0.3959], bedroom: [0.4357, 0.2549], fall: [0.5278, 0.4873]
  };
  var OUTS = {
    s1: ['Maya is up. Dan sleeps on.', 'Dan is up. Maya sleeps on.'], s2: ['Theo has it.'], s3: ['Gran has been reminded.', 'Maya has been told.'],
    s4: ['Maya has been told.', 'Okay. Adam will keep listening.'], s5: ['Calling Maya now.', 'Calling Dan now.'],
    s6: ['Calling 999. Maya and Dan have been told.', 'Okay. Maya and Dan have been told.'], s7: ['Dan has bath time.', 'Maya has been asked.'], s8: ['Quiet mode on. Lights off.']
  };
  // what lands on someone's phone when a reply is tapped: [name, text, tone]
  var TOAST = {
    s1: [['Maya', 'June is crying in the nursery.'], ['Dan', 'June is crying in the nursery.']], s2: [['Theo', 'PE today. Your kit is by the dryer.']],
    s3: [['Gran', 'Gran, have you taken your morning tablets?'], ['Maya', 'Gran has not taken her morning tablets.']],
    s4: [['Maya', 'Someone knocked at the front door. Nobody is home.'], null], s5: [['Maya', 'The smoke alarm is sounding in the kitchen.'], ['Dan', 'The smoke alarm is sounding in the kitchen.']],
    s6: [['999', 'Fall at home. Gran is not answering.', 'red'], ['Maya', 'Gran is okay. Adam will keep listening.']], s7: [['Dan', 'June’s bath is yours tonight.'], ['Maya', 'Can you take June’s bath?']], s8: [null]
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
  var scroller = document.createElement('div'); scroller.className = 'day-scroller'; scroller.tabIndex = 0; scroller.setAttribute('role', 'group'); scroller.setAttribute('aria-label', 'A day at home. Swipe or scroll sideways.'); stage.appendChild(scroller);
  var cam = document.createElement('div'); cam.className = 'day-cam day-strip'; scroller.appendChild(cam);
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
  var tint = document.createElement('i'); tint.className = 'day-tint'; stage.appendChild(tint);
  var toast = document.createElement('div'); toast.className = 'day-toast'; toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = '<span class="dt-av"></span><div class="dt-txt"><b></b><span></span></div>'; stage.appendChild(toast);
  function react(t) {
    toast.classList.remove('show'); tint.classList.remove('red', 'go'); void toast.offsetWidth;
    var red = t && t[2] === 'red';
    stage.querySelectorAll('.day-wave').forEach(function (w) { w.remove(); });
    if (t) for (var n = 0; n < 3; n++) { var w = document.createElement('i'); w.className = 'day-wave' + (red ? ' red' : ''); w.style.animationDelay = n * 280 + 'ms'; stage.appendChild(w); }
    if (red) { tint.classList.add('red'); void tint.offsetWidth; tint.classList.add('go'); }
    if (t) { toast.querySelector('.dt-av').textContent = t[0].charAt(0); toast.querySelector('b').textContent = t[0] === '999' ? 'Emergency services' : t[0]; toast.querySelector('.dt-txt span').textContent = t[1]; toast.classList.toggle('red', red); setTimeout(function () { toast.classList.add('show'); }, 380); }
  }
  var ring = document.createElement('i'); ring.className = 'day-ring'; ring.setAttribute('aria-hidden', 'true'); stage.appendChild(ring);
  var card = document.createElement('div'); card.className = 'day-card'; card.setAttribute('aria-live', 'polite');
  card.innerHTML = '<div class="dc-from"></div><div class="dc-msg"></div><div class="dc-chips"></div><div class="dc-done"></div>';
  stage.appendChild(card);
  var time = document.getElementById('dayTime'), head = document.getElementById('dayHead'), narr = document.getElementById('dayNarr'), ticks = document.getElementById('dayTicks');
  var tickEls = S.map(function (s) { var li = document.createElement('li'); li.innerHTML = '<span></span><b>' + s.time + '</b>'; ticks.appendChild(li); return li; });
  var NS = S.length, shown = -1;
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
    panels.forEach(function (p) { p.style.width = W + 'px'; p.style.height = H + 'px'; });
    scroller.scrollLeft = shown > 0 ? shown * W : 0;
    place();
  }
  layout(); window.addEventListener('resize', layout);

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function foc(i) { var p = P[S[i].at]; return { x: p[0], y: p[1], z: geo.W < 720 ? Math.max(1.3, S[i].z * 0.5) : S[i].z }; }
  function mix(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t }; }

  function show(i) {
    if (i === shown) return; shown = i; var s = S[i];
    imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
    sec.style.setProperty('--dbg', s.bg); sec.classList.toggle('dark', s.dark);
    time.textContent = s.time; head.textContent = s.head; narr.textContent = s.narr;
    [head, time, narr].forEach(function (n) { n.classList.remove('swap'); void n.offsetWidth; n.classList.add('swap'); });
    tickEls.forEach(function (li, k) { li.classList.toggle('on', k === i); li.classList.toggle('past', k < i); });
    card.querySelector('.dc-from').textContent = s.from; card.querySelector('.dc-msg').textContent = s.msg;
    var ch = card.querySelector('.dc-chips'); ch.innerHTML = '';
    var outs = OUTS[s.img] || [s.done];
    s.chips.forEach(function (c, k) {
      var e = document.createElement('span'); e.textContent = c; e.setAttribute('role', 'button'); e.tabIndex = 0;
      function choose() {
        Array.prototype.forEach.call(ch.children, function (x) { x.classList.remove('pick'); }); e.classList.add('pick');
        card.querySelector('.dc-done').textContent = outs[k] || s.done; card.classList.add('answered'); setAfter(true); react((TOAST[s.img] || [])[k] || null);
      }
      e.addEventListener('click', choose); e.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); choose(); } });
      ch.appendChild(e);
    });
    card.querySelector('.dc-done').textContent = '';
    card.classList.remove('show', 'answered'); setAfter(false); toast.classList.remove('show'); tint.classList.remove('go'); stage.querySelectorAll('.day-wave').forEach(function (w) { w.remove(); }); void card.offsetWidth;
  }

  function go(i) { i = Math.max(0, Math.min(NS - 1, i)); scroller.scrollTo({ left: i * geo.W, behavior: 'smooth' }); }
  tickEls.forEach(function (li, k) { li.style.cursor = 'pointer'; li.addEventListener('click', function () { go(k); }); });
  [['prev', -1, '\u2039', 'Previous scene'], ['next', 1, '\u203A', 'Next scene']].forEach(function (a) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'day-arrow ' + a[0]; b.textContent = a[2]; b.setAttribute('aria-label', a[3]);
    b.addEventListener('click', function () { go(Math.round(scroller.scrollLeft / geo.W) + a[1]); }); stage.appendChild(b);
  });
  scroller.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); go(Math.round(scroller.scrollLeft / geo.W) + (e.key === 'ArrowRight' ? 1 : -1)); } });

  var timer = 0;
  function frame() {
    var pos = scroller.scrollLeft / geo.W, i = Math.max(0, Math.min(NS - 1, Math.round(pos))), arrived = Math.abs(pos - i) < 0.06;
    show(i);
    stage.classList.toggle('first', i === 0); stage.classList.toggle('last', i === NS - 1);
    if (arrived && !card.classList.contains('show')) { card.classList.add('show'); }
    if (!arrived) { if (card.classList.contains('show')) { toast.classList.remove('show'); tint.classList.remove('go'); } card.classList.remove('show', 'answered'); clearTimeout(timer); setAfter(false); }
    ring.classList.toggle('go', arrived);
    stage.classList.toggle('fast', !arrived);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
