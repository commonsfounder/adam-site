import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const host = document.getElementById('device');
if (host) start();

function start() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return; }

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  const canvas = renderer.domElement;
  canvas.className = 'gl-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.insertBefore(canvas, host.firstChild);
  host.classList.add('gl');

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.4;

  const camera = new THREE.PerspectiveCamera(26, 1, 1, 400);

  const key = new THREE.DirectionalLight(0xfff1d0, 1.7);
  key.position.set(-30, 50, 40);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xdfe8b8, 1.0);
  rim.position.set(45, 22, -34);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xe3e8c4, 0x1c2e1d, 0.3));

  const COLOR = {
    fabric: 0xb9be98, sheen: 0xf4f7dc, base: 0x9da78a, dark: 0x1c2e1d, insert: 0xe3e8c4,
    accent: 0xa8c256, surface: 0x2c3d2a
  };

  /* ---------- textures ---------- */
  function canvasTex(size, draw, srgb) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    draw(c.getContext('2d'), size);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const cell = 8;
  const weaveBump = canvasTex(128, (g, s) => {
    g.fillStyle = '#6a6a6a'; g.fillRect(0, 0, s, s);
    for (let y = 0; y < s / cell; y++) for (let x = 0; x < s / cell; x++) {
      const horiz = ((x + y) & 1) === 0;
      const gr = g.createLinearGradient(horiz ? 0 : x * cell, horiz ? y * cell : 0, horiz ? 0 : x * cell + cell, horiz ? y * cell + cell : 0);
      gr.addColorStop(0, '#8c8c8c'); gr.addColorStop(0.5, '#f2f2f2'); gr.addColorStop(1, '#8c8c8c');
      g.fillStyle = gr;
      g.fillRect(x * cell + (horiz ? 0 : 1), y * cell + (horiz ? 1 : 0), horiz ? cell : cell - 2, horiz ? cell - 2 : cell);
    }
  }, false);
  const weaveMap = canvasTex(128, (g, s) => {
    g.fillStyle = '#e4e4e4'; g.fillRect(0, 0, s, s);
    for (let y = 0; y < s / cell; y++) for (let x = 0; x < s / cell; x++) {
      g.fillStyle = ((x + y) & 1) === 0 ? '#ffffff' : '#ececec';
      g.fillRect(x * cell, y * cell, cell, cell);
    }
  }, true);
  const glowTex = canvasTex(256, (g, s) => {
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, s, s);
  }, true);
  glowTex.wrapS = glowTex.wrapT = THREE.ClampToEdgeWrapping;

  /* ---------- geometry: a soft squircle column ---------- */
  const N = 3.4;
  const SEG = 160;

  function ringPts(a, b) {
    const pts = new Float32Array((SEG + 1) * 2);
    for (let i = 0; i <= SEG; i++) {
      const th = (i / SEG) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
      pts[i * 2] = a * Math.sign(c) * Math.pow(Math.abs(c), 2 / N);
      pts[i * 2 + 1] = b * Math.sign(s) * Math.pow(Math.abs(s), 2 / N);
    }
    return pts;
  }

  function tube(rows, a, b, uvRep) {
    const pos = [], uv = [], idx = [];
    rows.forEach((r, ri) => {
      const p = ringPts(a - r.inset, b - r.inset);
      for (let i = 0; i <= SEG; i++) {
        pos.push(p[i * 2], r.y, p[i * 2 + 1]);
        uv.push((i / SEG) * uvRep[0], r.v * uvRep[1]);
      }
      if (ri > 0) {
        const o = (ri - 1) * (SEG + 1), n = ri * (SEG + 1);
        for (let i = 0; i < SEG; i++) {
          idx.push(o + i, n + i, o + i + 1, o + i + 1, n + i, n + i + 1);
        }
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  function fan(y, a, b, inset, up) {
    const p = ringPts(a - inset, b - inset);
    const pos = [0, y, 0], uv = [0.5, 0.5], idx = [];
    for (let i = 0; i <= SEG; i++) { pos.push(p[i * 2], y, p[i * 2 + 1]); uv.push(0.5 + p[i * 2] / (2 * a), 0.5 + p[i * 2 + 1] / (2 * b)); }
    for (let i = 1; i <= SEG; i++) { if (up) idx.push(0, i + 1, i); else idx.push(0, i, i + 1); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  function profile(h, rBot, rTop, bulge) {
    const rows = [];
    const steps = 8;
    for (let k = 0; k <= steps; k++) {
      const f = (k / steps) * Math.PI / 2;
      rows.push({ y: rBot * (1 - Math.cos(f)), inset: rBot * (1 - Math.sin(f)) });
    }
    const mid = 14;
    for (let k = 1; k < mid; k++) {
      const t = k / mid, y = rBot + t * (h - rBot - rTop);
      rows.push({ y, inset: -bulge * Math.sin(Math.PI * t) });
    }
    for (let k = 0; k <= steps; k++) {
      const f = (k / steps) * Math.PI / 2;
      rows.push({ y: h - rTop + rTop * Math.sin(f), inset: rTop * (1 - Math.cos(f)) });
    }
    rows.forEach((r) => { r.v = r.y / h; });
    return rows;
  }

  /* ---------- parts ---------- */
  const A = 7, B = 7;          // half width, half depth in cm: 14 x 14
  const BODY_H = 19, BASE_H = 2;

  const fabricMat = new THREE.MeshPhysicalMaterial({
    color: COLOR.fabric, map: weaveMap, bumpMap: weaveBump, bumpScale: 0.7, roughness: 0.95, metalness: 0,
    sheen: 1, sheenColor: new THREE.Color(COLOR.sheen), sheenRoughness: 0.5
  });
  fabricMat.map.repeat.set(1, 1);
  const metalMat = new THREE.MeshStandardMaterial({ color: COLOR.base, metalness: 0.85, roughness: 0.42 });
  const darkMat = new THREE.MeshStandardMaterial({ color: COLOR.dark, roughness: 0.8, metalness: 0.1 });
  const insertMat = new THREE.MeshStandardMaterial({ color: COLOR.insert, roughness: 0.6, metalness: 0, emissive: new THREE.Color(COLOR.insert), emissiveIntensity: 0.35 });

  const world = new THREE.Group();
  scene.add(world);
  const spin = new THREE.Group();
  world.add(spin);

  // base: slightly inset metal plinth
  const base = new THREE.Group();
  {
    const rows = profile(BASE_H, 0.18, 0.22, 0);
    const side = new THREE.Mesh(tube(rows, A - 0.55, B - 0.55, [1, 1]), metalMat);
    const top = new THREE.Mesh(fan(BASE_H, A - 0.55, B - 0.55, 0.22, true), metalMat);
    const bottom = new THREE.Mesh(fan(0, A - 0.55, B - 0.55, 0.18, false), metalMat);
    base.add(side, top, bottom);
    const neck = new THREE.Mesh(tube([{ y: BASE_H, inset: 1.1, v: 0 }, { y: BASE_H + 0.3, inset: 1.1, v: 1 }], A, B, [1, 1]), darkMat);
    base.add(neck);
  }
  spin.add(base);

  // fabric body with a recessed top
  const body = new THREE.Group();
  const LIP = 1.1, RT = 1.2;
  {
    const rows = profile(BODY_H, 0.5, RT, 0.18);
    rows.push({ y: BODY_H, inset: RT + LIP, v: 1 });
    const side = new THREE.Mesh(tube(rows, A, B, [22, 8]), fabricMat);
    const wallRows = [{ y: BODY_H, inset: RT + LIP, v: 0 }, { y: BODY_H - 0.3, inset: RT + LIP, v: 1 }];
    const wall = new THREE.Mesh(tube(wallRows, A, B, [1, 1]), insertMat.clone());
    wall.material.emissiveIntensity = 0;
    wall.material.color = new THREE.Color(COLOR.base);
    const floor = new THREE.Mesh(fan(BODY_H - 0.3, A, B, RT + LIP, true), darkMat);
    const bottom = new THREE.Mesh(fan(0, A, B, 0.5, false), darkMat);
    body.add(side, wall, floor, bottom);

    // rear panel: port, mic privacy switch, reset pinhole
    const rear = new THREE.Group();
    rear.position.set(0, 11, -(B - 0.02));
    const plate = new THREE.Mesh(new THREE.BoxGeometry(1.9, 9.5, 0.3), metalMat);
    plate.position.z = -0.04;
    const port = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.45, 0.4), darkMat);
    port.position.set(0, -3.4, -0.1);
    const sw = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.5, 0.4), darkMat);
    sw.position.set(0, -0.8, -0.1);
    const knob = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.55, 0.3), new THREE.MeshStandardMaterial({ color: COLOR.accent, roughness: 0.5 }));
    knob.position.set(0, -0.55, -0.22);
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.4, 12), darkMat);
    pin.rotation.x = Math.PI / 2; pin.position.set(0, 2.2, -0.12);
    rear.add(plate, port, sw, knob, pin);
    body.add(rear);
  }
  body.position.y = BASE_H + 0.2;
  spin.add(body);

  // frosted insert that sits in the recess
  const insert = new THREE.Group();
  const INS_A = A - (RT + LIP) - 0.05, INS_B = B - (RT + LIP) - 0.05;
  {
    const rows = profile(0.22, 0.06, 0.08, 0);
    insert.add(new THREE.Mesh(tube(rows, INS_A, INS_B, [1, 1]), insertMat));
    insert.add(new THREE.Mesh(fan(0.22, INS_A, INS_B, 0.08, true), insertMat));
  }
  const INS_Y = BASE_H + 0.2 + BODY_H - 0.3;
  spin.add(insert);

  // light field above the insert
  const glowMat = new THREE.MeshBasicMaterial({ map: glowTex, color: 0xf2f0c4, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), glowMat);
  glow.rotation.x = -Math.PI / 2;
  spin.add(glow);

  // inner board
  const board = new THREE.Group();
  {
    const pcb = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.22, 8.6), new THREE.MeshStandardMaterial({ color: COLOR.accent, roughness: 0.55, metalness: 0.1 }));
    const chip = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 2.4), darkMat);
    chip.position.y = 0.26;
    board.add(pcb, chip);
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 16), new THREE.MeshStandardMaterial({ color: COLOR.dark, roughness: 0.6 }));
      m.position.set(-3.3 + i * 1.32, 0.2, 3.2);
      board.add(m);
    }
  }
  spin.add(board);

  // driver
  const driver = new THREE.Group();
  {
    const pts = [[0, 0], [2.6, 0], [3.4, 0.5], [4.1, 1.2], [4.6, 2.1], [4.6, 2.5], [4.2, 2.5], [3.5, 1.5], [2.5, 0.8], [0, 0.5]].map((p) => new THREE.Vector2(p[0], p[1]));
    const cone = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), new THREE.MeshStandardMaterial({ color: COLOR.surface, roughness: 0.7, metalness: 0.2, side: THREE.DoubleSide }));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(4.5, 0.28, 16, 64), metalMat);
    ring.rotation.x = Math.PI / 2; ring.position.y = 2.4;
    driver.add(cone, ring);
  }
  spin.add(driver);

  // soft contact shadow
  const shadowTex = canvasTex(256, (g, s) => {
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, 'rgba(0,0,0,0.42)'); gr.addColorStop(0.6, 'rgba(0,0,0,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, s, s);
  }, true);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.02;
  world.add(shadow);

  /* ---------- explode ---------- */
  const rest = {
    base: 0, body: BASE_H + 0.2, driver: BASE_H + 0.3, board: 15, insert: INS_Y
  };
  const lift = { base: 0, body: 9, driver: 4, board: 21, insert: 22 };
  function layout(e) {
    base.position.y = rest.base + lift.base * e;
    body.position.y = rest.body + lift.body * e;
    driver.position.y = rest.driver + lift.driver * e;
    board.position.y = rest.board + lift.board * e;
    insert.position.y = rest.insert + lift.insert * e;
    glow.position.y = insert.position.y + 0.3;
    glow.position.y = insert.position.y + 0.26;
  }

  /* ---------- state, input, loop ---------- */
  let target = 0, cur = 0, mx = 0, my = 0, tmx = 0, tmy = 0, visible = true;
  const ease = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  window.AdamDevice = { setProgress: (p) => { target = p; if (reduce) { cur = p; } } };
  if (!reduce) {
    window.addEventListener('pointermove', (e) => {
      tmx = (e.clientX / window.innerWidth) * 2 - 1;
      tmy = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  function resize() {
    const w = host.clientWidth || 300, h = host.clientHeight || 300;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host);
  resize();

  let running = false;
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) tick(); }, { threshold: 0 }).observe(host);

  const clock = new THREE.Clock();
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    cur += (target - cur) * (reduce ? 1 : 1 - Math.pow(0.0005, dt));
    mx += (tmx - mx) * (1 - Math.pow(0.02, dt));
    my += (tmy - my) * (1 - Math.pow(0.02, dt));
    const e = ease((cur - 0.04) / 0.8);
    layout(e);

    const idle = reduce ? 0 : Math.sin(t * 0.35) * 0.1;
    spin.rotation.y = -0.55 + mx * 0.32 + idle + e * 0.35;
    world.rotation.x = my * 0.04;

    const breathe = reduce ? 0.5 : 0.5 + 0.5 * Math.sin(t * 1.4);
    insertMat.emissiveIntensity = 0.14 + 0.2 * breathe;
    glowMat.opacity = 0.14 + 0.2 * breathe;

    const spread = 21 + e * 22;
    const cy = 8.5 + e * 12;
    const dist = 84 + e * 52;
    camera.position.set(0, cy + 20 + e * 8, dist);
    camera.lookAt(0, cy, 0);
    shadow.material.opacity = 1 - e * 0.5;
    shadow.scale.setScalar(1 + e * 0.15);
    renderer.render(scene, camera);
    return spread;
  }
  function tick() {
    if (!visible || running) return;
    running = true;
    (function loop() {
      if (!visible) { running = false; return; }
      frame();
      requestAnimationFrame(loop);
    })();
  }
  tick();
}
