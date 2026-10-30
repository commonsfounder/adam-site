(function () {
  var ORDER = ['black', 'white', 'sandstone'];
  var LABELS = { sandstone: 'Sand', black: 'Charcoal', white: 'Chalk' };
  var PREFIX = { sandstone: '', black: 'colorways/black/', white: 'colorways/white/' };
  var KEY = 'adam-colour';
  var cur = 'sandstone';
  try {
    var saved = window.localStorage.getItem(KEY);
    if (saved && PREFIX.hasOwnProperty(saved)) cur = saved;
  } catch (e) {}
  document.documentElement.setAttribute('data-colour', cur);

  var kept = [];
  function preload(url) { var im = new Image(); im.decoding = 'async'; im.src = url; kept.push(im); if (kept.length > 90) kept.shift(); }
  function framesUrl(name) { return PREFIX[cur] + 'frames/' + name; }
  function insideUrl(name) { return PREFIX[cur] + 'inside/' + name; }
  function dayUrl(name) { return PREFIX[cur] + 'day/' + name; }
  function urlFor(kind, name) { return PREFIX[cur] + kind + '/' + name; }
  function preloadColour(name) {
    if (name === cur) return;
    var p = PREFIX[name];
    var first = [p + 'frames/box.webp?v=15', p + 'inside/speaker_shell.webp', p + 'inside/speaker_panel.webp'];
    first.forEach(preload);
    var rest = [];
    ['panel', 'shell', 'processor', 'memory', 'storage', 'radio', 'radar', 'board', 'driver', 'base'].forEach(function (k) {
      rest.push(p + 'inside/speaker_' + k + '.webp', p + 'inside/speaker_' + k + '_line.webp');
    });
    ['panel', 'shell', 'processor', 'memory', 'board', 'radio', 'radar', 'driver', 'base'].forEach(function (k) { rest.push(p + 'inside/macro_' + k + '.webp'); });
    ['night', 'morning', 'day', 'evening'].forEach(function (k) { rest.push(p + 'day/' + k + '.webp?v=3'); });
    var run = function () { rest.forEach(preload); };
    if (window.requestIdleCallback) window.requestIdleCallback(run, { timeout: 2500 }); else setTimeout(run, 600);
  }

  var api = {
    name: function () { return cur; },
    prefix: function () { return PREFIX[cur]; },
    framesUrl: framesUrl,
    insideUrl: insideUrl,
    dayUrl: dayUrl,
    urlFor: urlFor,
    set: function (name) { apply(name, true); }
  };
  window.AdamColour = api;

  function apply(name, save) {
    if (!PREFIX.hasOwnProperty(name)) return;
    var changed = name !== cur;
    cur = name;
    document.documentElement.setAttribute('data-colour', cur);
    if (save) { try { window.localStorage.setItem(KEY, cur); } catch (e) {} }
    var label = document.getElementById('colourName');
    if (label) label.textContent = LABELS[cur];
    document.querySelectorAll('#colourPicker .swatch').forEach(function (b) {
      var on = b.getAttribute('data-colour') === cur;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    var box = document.querySelector('[data-box]');
    if (box) box.src = framesUrl('box.webp') + '?v=15';
    if (changed) window.dispatchEvent(new CustomEvent('adam-colour-change', { detail: cur }));
  }

  function init() {
    var picker = document.getElementById('colourPicker');
    if (picker) {
      var btns = Array.prototype.slice.call(picker.querySelectorAll('.swatch'));
      btns.forEach(function (b, i) {
        b.addEventListener('click', function () { apply(b.getAttribute('data-colour'), true); });
        b.addEventListener('pointerenter', function () { preloadColour(b.getAttribute('data-colour')); });
        b.addEventListener('focus', function () { preloadColour(b.getAttribute('data-colour')); });
        b.addEventListener('keydown', function (e) {
          var next = null;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = btns[(i + 1) % btns.length];
          if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = btns[(i + btns.length - 1) % btns.length];
          if (next) { e.preventDefault(); next.focus(); apply(next.getAttribute('data-colour'), true); }
        });
      });
    }
    apply(cur, false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
