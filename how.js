(function () {
  var root = document.getElementById('hw');
  if (!root) return;
  var S = [
    { h: 'Crying in the nursery', s: 'Movement by the cot', k: "3:12 am, and it's Dad's turn tonight", d: 'Wakes Dad. The rest of the house keeps sleeping.' },
    { h: 'A heavy thud in the kitchen', s: 'Then no movement', k: 'Dad is home alone', d: 'Alerts the family, or the emergency services.' },
    { h: 'Glass breaking downstairs', s: 'Then a window opening', k: 'Nobody is home', d: 'Tells you straight away, before you have to ask.' }
  ];
  var flow = root.querySelector('.hw-flow');
  var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
  var f = {};
  ['h', 's', 'k', 'd'].forEach(function (n) { f[n] = root.querySelector('[data-f="' + n + '"]'); });
  function show(i) {
    tabs.forEach(function (t, j) { t.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
    flow.classList.add('swap'); flow.classList.remove('go'); void flow.offsetWidth;
    Object.keys(f).forEach(function (n) { f[n].textContent = S[i][n]; });
    flow.classList.remove('swap'); flow.classList.add('go');
  }
  tabs.forEach(function (t, i) { t.addEventListener('click', function () { show(i); }); });
  show(0);
})();
