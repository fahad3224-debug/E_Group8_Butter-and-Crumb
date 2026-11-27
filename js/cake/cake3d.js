/**
 * Interactive 3D cake built from CSS 3D transforms + vanilla JS (no libraries).
 *
 * Each sponge layer is a "cylinder" made of thin vertical facets plus a top and
 * bottom disc. Facets are shaded by angle so the cake reads as lit from the
 * front-left. Fillings sit between the layers.
 *
 * Interactions:  drag = turn · wheel / arrow up-down = open the layers
 *                click a layer = inspect it · "cut" removes a quarter slice
 */

import { CAKE } from '../config.js';

const N = 32; // facets around a round cake
const STEP = 360 / N;
const GAP = 64; // extra space between layers when fully opened
const DRIP = '#3B2314';

const LAYER_H = { 2: 58, 3: 48, 4: 40 }; // more layers = thinner sponges, same overall height
const FILL_H = { 2: 10, 3: 9, 4: 8 };

const CRUMB =
  'radial-gradient(rgba(40,20,8,.13) 1px, transparent 1.8px) 0 0/7px 7px,' +
  'radial-gradient(rgba(255,255,255,.14) 1px, transparent 1.7px) 3px 4px/9px 9px,' +
  'radial-gradient(rgba(40,20,8,.08) 2px, transparent 2.7px) 5px 2px/13px 11px';

const esc = (str) =>
  String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Hex colour → rgba() with alpha. */
function alpha(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Relative brightness 0–1, used to pick readable text colour on the cake. */
export function luminance(hex) {
  const h = hex.replace('#', '');
  return (0.299 * parseInt(h.slice(0, 2), 16) + 0.587 * parseInt(h.slice(2, 4), 16) + 0.114 * parseInt(h.slice(4, 6), 16)) / 255;
}

const FLOWER = (petal, centre) =>
  `<svg viewBox="-20 -20 40 40" width="100%" height="100%" aria-hidden="true">${[0, 72, 144, 216, 288]
    .map((a) => `<circle cx="${(9 * Math.cos((a * Math.PI) / 180)).toFixed(1)}" cy="${(9 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" r="8" fill="${petal}" stroke="rgba(59,35,20,.35)" stroke-width="1"/>`)
    .join('')}<circle r="5" fill="${centre}"/></svg>`;

export function createCake3D(root, { onSelect = () => {}, onExplode = () => {}, wheel = true } = {}) {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const v = { rx: -24, ry: -38, e: 0, eT: 0, sel: -1, cut: false, spin: !reduceMotion, vr: 0 };
  let s = null;
  let H = 58;
  let F = 10;
  let layers = [];
  let fills = [];
  let shade = [];
  let scale = 1;
  let drag = null;
  let lastKey = '';
  let visible = true;

  const world = document.createElement('div');
  world.className = 'c3d-world';
  root.append(world);

  /* ---------- helpers ---------- */

  const opt = (list, id) => list.find((o) => o.id === id) || list[0];
  const isSquare = () => s.shape === 'square';

  // Evenly scattered points on a disc between radius `inner` and `R`, skipping the cut-away quarter.
  const pts = (n, R, inner = 0) =>
    Array.from({ length: n }, (_, i) => {
      const t = i * 2.39996 + 0.6;
      const p = Math.sqrt(inner * inner + (R * R - inner * inner) * ((i + 0.5) / n));
      return [p * Math.cos(t), p * Math.sin(t)];
    }).filter(([x, z]) => !(v.cut && x > -8 && z > -8));

  // Points evenly spaced around the rim (for the piped border).
  const ring = (n, R) =>
    Array.from({ length: n }, (_, i) => {
      const t = (i / n) * Math.PI * 2;
      return [R * Math.sin(t), R * Math.cos(t)];
    }).filter(([x, z]) => !(v.cut && x > -6 && z > -6));

  /* ---------- geometry ---------- */

  // Side walls. Round = N facets; square = 8 half-faces (so a quarter can be cut away).
  function sides(r, h, side) {
    let out = '';
    if (isSquare()) {
      const w = r + 0.6;
      [0, 90, 180, 270].forEach((A) => {
        [-r / 2, r / 2].forEach((off) => {
          // the quarter x>0, z>0 is removed when the cake is cut
          if (v.cut && ((A === 0 && off > 0) || (A === 90 && off < 0))) return;
          out += `<div class="f" data-a="${A}" style="width:${w}px;height:${h}px;left:${-w / 2}px;top:${-h / 2}px;background:${side(A)};transform:rotateY(${A}deg) translateZ(${r}px) translateX(${off}px)"></div>`;
        });
      });
      return out;
    }
    const w = 2 * r * Math.tan(Math.PI / N) + 1.5;
    for (let k = 0; k < N; k++) {
      if (v.cut && k < N / 4) continue;
      const a = (k + 0.5) * STEP;
      out += `<div class="f" data-a="${a}" style="width:${w}px;height:${h}px;left:${-w / 2}px;top:${-h / 2}px;background:${side(a, k)};transform:rotateY(${a}deg) translateZ(${r - 0.5}px)"></div>`;
    }
    return out;
  }

  function disc(r, bg, y, rot, mask, inner = '', extra = '') {
    const cls = isSquare() ? 'disc sq' : 'disc';
    return `<div class="${cls}" style="width:${2 * r}px;height:${2 * r}px;left:${-r}px;top:${-r}px;background:${bg};transform:translateY(${y}px) rotateX(${rot}deg);-webkit-mask:${mask};mask:${mask};${extra}">${inner}</div>`;
  }

  // A layer / filling block: side walls + top & bottom + cut faces when sliced.
  // Internal discs (between layers) are drawn slightly smaller than the walls so their
  // edges never poke out through the frosting as coloured lines.
  function block({ r, h, side, top, bottom, cutFace, topHTML = '', ringColour = '', outerTop = false }) {
    let out = sides(r, h, side);
    const mTop = v.cut ? 'conic-gradient(#000 0 90deg,transparent 0 180deg,#000 0)' : 'none';
    const mBot = v.cut ? 'conic-gradient(transparent 0 90deg,#000 0)' : 'none';
    const inner = r - 1.5;
    // square cakes draw the frosting ring with an inset shadow instead of a radial gradient
    const ringStyle = ringColour && isSquare() ? `box-shadow:inset 0 0 0 6px ${ringColour}` : '';
    out += disc(outerTop ? r : inner, top, -h / 2, 90, mTop, topHTML, topHTML ? '' : ringStyle);
    out += disc(inner, bottom, h / 2, -90, mBot, '', ringStyle);
    if (v.cut) {
      out += `<div class="f cut" data-a="0" style="width:${r}px;height:${h}px;top:${-h / 2}px;background:${cutFace};transform:rotateY(0deg)"></div>`;
      out += `<div class="f cut" data-a="90" style="width:${r}px;height:${h}px;top:${-h / 2}px;background:${cutFace};transform:rotateY(-90deg)"></div>`;
    }
    return out;
  }

  /* ---------- decoration ---------- */

  const has = (id) => s.toppings.includes(id);

  // Flat decorations lying on the top surface.
  function topDecor(r, topColour) {
    let out = '';
    const msgInner = s.msg ? r * 0.55 : 0;
    if (has('sprinkles')) {
      const cols = ['#C9503A', '#F8E08E', '#5B2A4A', '#FFFFFF', '#8FB4A0'];
      pts(54, r * 0.86, msgInner).forEach(([x, z], i) => {
        out += `<i class="spr" style="left:${r + x}px;top:${r + z}px;background:${cols[i % cols.length]};transform:rotate(${i * 47}deg)"></i>`;
      });
    }
    if (has('gold-leaf')) {
      pts(11, r * 0.75, msgInner).forEach(([x, z], i) => {
        out += `<i class="leaf" style="left:${r + x}px;top:${r + z}px;transform:rotate(${i * 61}deg)"></i>`;
      });
    }
    if (s.msg) {
      const light = luminance(topColour) > 0.6;
      const size = Math.max(12, r / (s.msg.length > 14 ? 6.4 : 4.4));
      out += `<span class="c3d-msg" style="font-size:${size}px;color:${light ? '#3B2314' : '#FCEBD8'}">${esc(s.msg)}</span>`;
    }
    return out;
  }

  // Toppings that stand up and always face the viewer (billboards).
  function standing(r, frost) {
    let out = '';
    const msgInner = s.msg ? r * 0.55 : 0;
    const bb = (x, z, w, h, inner, style = '', cls = 'bb') =>
      `<div class="${cls}" style="width:${w}px;height:${h}px;left:${-w / 2}px;top:${-h / 2}px;${style};transform:translate3d(${x}px,${-H / 2 - h / 2 + 3}px,${z}px) rotateY(var(--iry))">${inner}</div>`;

    if (has('piped-border')) {
      const n = Math.round(r / 5.5);
      ring(n, r - 9).forEach(([x, z]) => {
        out += bb(x, z, 17, 14, '', `background:radial-gradient(circle at 40% 30%, rgba(255,255,255,.6), transparent 45%), repeating-conic-gradient(from 20deg, ${frost} 0 22deg, ${alpha('#3B2314', 0.12)} 22deg 30deg), ${frost};border-radius:50% 50% 40% 40%`);
      });
    }
    if (has('berries')) {
      pts(16, r * 0.8, msgInner).forEach(([x, z], i) => {
        const rasp = i % 3 !== 0;
        const bg = rasp
          ? 'radial-gradient(circle, rgba(255,255,255,.35) 0 1px, transparent 1.6px) 0 0/5px 5px, radial-gradient(circle at 35% 30%, #E0607A, #9B2440 55%, #5A1224)'
          : 'radial-gradient(circle at 35% 30%, #A9A4D6, #4A4378 55%, #23203F)';
        out += bb(x, z, rasp ? 17 : 13, rasp ? 17 : 13, '', `background:${bg};border-radius:50%`);
      });
    }
    if (has('macarons')) {
      const cols = ['#E8A598', '#BFC99A', '#F6DC86', '#C9A7D6'];
      pts(5, r * 0.66, msgInner).forEach(([x, z], i) => {
        const c = cols[i % cols.length];
        out += bb(x, z, 30, 24, '', `background:linear-gradient(${c} 0 38%, #FBF3E2 38% 56%, ${c} 56%);border-radius:45%;box-shadow:inset 0 -3px 0 rgba(0,0,0,.08)`);
      });
    }
    if (has('shards')) {
      pts(7, r * 0.6, msgInner).forEach(([x, z], i) => {
        out += bb(x, z, 22, 30, '', `background:linear-gradient(115deg, #6A4936, ${DRIP} 60%);clip-path:polygon(${20 + (i % 3) * 10}% 0,100% 18%,80% 100%,0 85%)`);
      });
    }
    if (has('flowers')) {
      pts(4, r * 0.62, msgInner).forEach(([x, z], i) => {
        out += bb(x, z, 34, 34, FLOWER(i % 2 ? '#FBF3E2' : '#E8A598', '#C9503A'));
      });
    }
    if (has('candles')) {
      pts(5, r * 0.5, s.msg ? r * 0.45 : 0).forEach(([x, z]) => {
        out += bb(x, z, 8, 54, '<i class="flame"></i>', '', 'bb candle');
      });
    }
    return out;
  }

  /* ---------- build the whole cake from state ---------- */

  function build(state) {
    s = state;
    const n = s.layers;
    H = LAYER_H[n] || 48;
    F = FILL_H[n] || 9;
    const r = opt(CAKE.sizes, s.size).r;
    const finish = s.finish;
    const frost = s.frosting;
    const fill = opt(CAKE.fillings, s.filling).color;
    const coated = finish === 'buttercream' || finish === 'fondant' || finish === 'drip';
    const plateR = (isSquare() ? r * 1.42 : r) + 28;

    if (v.sel >= n) {
      v.sel = -1;
      onSelect(-1);
    }

    let html = `<div class="disc shadow3d" style="width:${2 * plateR + 70}px;height:${2 * plateR + 70}px;left:${-plateR - 35}px;top:${-plateR - 35}px;transform:translateY(6px) rotateX(90deg)"></div>
      <div class="disc plate" style="width:${2 * plateR}px;height:${2 * plateR}px;left:${-plateR}px;top:${-plateR}px;transform:rotateX(90deg)"></div>`;

    // Outer coat for each finish
    const coatSide = (sp) => {
      if (finish === 'fondant') return `linear-gradient(rgba(255,255,255,.32), rgba(255,255,255,.06) 18%, transparent 75%, rgba(0,0,0,.07)), ${frost}`;
      if (finish === 'naked') return `linear-gradient(rgba(70,35,15,.16), rgba(70,35,15,.16)), ${CRUMB}, ${sp}`;
      if (finish === 'semi-naked') return `repeating-linear-gradient(0deg, ${alpha(frost, 0.92)} 0 4px, ${alpha(frost, 0.55)} 4px 7px, ${alpha(frost, 0.85)} 7px 11px), ${CRUMB}, ${sp}`;
      return `linear-gradient(rgba(255,255,255,.2), transparent 35%), repeating-linear-gradient(0deg, rgba(255,255,255,.06) 0 3px, rgba(0,0,0,.035) 3px 6px), ${frost}`;
    };

    for (let i = 0; i < n; i++) {
      const sp = opt(CAKE.sponges, s.sponges[i]).color;
      const isTop = i === n - 1;
      const topColour = finish === 'drip' ? DRIP : frost;
      const edge = coated || finish === 'semi-naked' ? frost : 'rgba(70,35,15,.35)';
      const inside = isSquare() ? `${CRUMB}, ${sp}` : `radial-gradient(circle, transparent 0 ${r - 6}px, ${edge} ${r - 6}px), ${CRUMB}, ${sp}`;
      const cutFace = `${isTop ? `linear-gradient(${topColour} 0 7px, transparent 7px), ` : ''}linear-gradient(90deg, transparent 0 calc(100% - 6px), ${edge} 0), ${CRUMB}, ${sp}`;

      let side = () => coatSide(sp);
      if (isTop && finish === 'drip') {
        // ganache drips of varying length down the top layer
        side = (a, k = Math.round(a / 45)) => {
          const len = 9 + ((k * 37) % 19);
          return `radial-gradient(circle at 50% ${len}px, ${DRIP} 3.5px, transparent 4px), linear-gradient(${DRIP} 0 ${len}px, transparent ${len}px), ${coatSide(sp)}`;
        };
      }
      const topBg = isTop
        ? finish === 'drip'
          ? `radial-gradient(circle at 35% 30%, rgba(255,255,255,.28), transparent 38%), ${DRIP}`
          : `radial-gradient(circle at 38% 32%, rgba(255,255,255,.18), transparent 55%), ${frost}`
        : inside;

      html += `<div class="g layer" data-layer="${i}">${block({
        r,
        h: H,
        side,
        top: topBg,
        bottom: inside,
        cutFace,
        topHTML: isTop ? topDecor(r, topColour) : '',
        ringColour: coated || finish === 'semi-naked' ? frost : '',
        outerTop: isTop,
      })}${isTop ? standing(r, frost) : ''}</div>`;

      if (!isTop) {
        const fr = coated ? r : r - 3;
        const fillSide = coated ? coatSide(sp) : finish === 'semi-naked' ? `linear-gradient(${alpha(frost, 0.75)}, ${alpha(frost, 0.75)}), ${fill}` : fill;
        const fillCut = coated ? `linear-gradient(90deg, transparent 0 calc(100% - 6px), ${frost} 0), ${fill}` : fill;
        // when coated, the filling shows a frosting rim if the layers are pulled apart
        const fillFace = coated && !isSquare() ? `radial-gradient(circle, transparent 0 ${fr - 7}px, ${frost} ${fr - 7}px), ${fill}` : fill;
        html += `<div class="g fill" data-fill="${i}">${block({ r: fr, h: F, side: () => fillSide, top: fillFace, bottom: fillFace, cutFace: fillCut, ringColour: coated ? frost : '' })}</div>`;
      }
    }

    world.innerHTML = html;
    layers = [...world.querySelectorAll('.layer')];
    fills = [...world.querySelectorAll('.fill')];
    shade = [...world.querySelectorAll('.f')].map((el) => [el, +el.dataset.a]);
    markSel();
    lastKey = '';
  }

  /* ---------- per-frame layout ---------- */

  const layerY = (i) => -(H / 2 + 2) - i * (H + F) - i * v.e * GAP - (i === v.sel ? 22 * Math.max(v.e, 0.35) : 0);
  const fillY = (j) => -(2 + H + F / 2) - j * (H + F) - (j + 0.5) * v.e * GAP;

  function fit() {
    if (!s) return 1;
    const r = opt(CAKE.sizes, s.size).r;
    const width = (isSquare() ? r * 1.42 : r) * 2 + 150;
    const height = s.layers * H + (s.layers - 1) * (F + v.e * GAP) + 90;
    return Math.min(1, root.clientWidth / width, (root.clientHeight * 0.74) / height);
  }

  function apply() {
    scale = fit();
    const key = [v.rx, v.ry, v.e, v.sel, scale].map((x) => (+x).toFixed(2)).join();
    if (key === lastKey) return;
    lastKey = key;
    world.style.transform = `scale3d(${scale},${scale},${scale}) rotateX(${v.rx}deg) rotateY(${v.ry}deg)`;
    world.style.setProperty('--iry', `${-v.ry}deg`);
    layers.forEach((g, i) => (g.style.transform = `translate3d(0,${layerY(i)}px,0)`));
    fills.forEach((g, j) => (g.style.transform = `translate3d(0,${fillY(j)}px,0)`));
    // light from the front-left: facets turning away get darker
    shade.forEach(([el, a]) => el.style.setProperty('--d', (0.36 * (1 - (Math.cos(((a + v.ry + 35) * Math.PI) / 180) + 1) / 2)).toFixed(3)));
  }

  function loop() {
    if (visible) {
      if (!drag) {
        if (v.spin) v.ry += 0.15;
        else if (Math.abs(v.vr) > 0.02) {
          v.ry += v.vr;
          v.vr *= 0.93;
        }
      }
      v.e += (v.eT - v.e) * (reduceMotion ? 1 : 0.15);
      if (Math.abs(v.eT - v.e) < 0.001) v.e = v.eT;
      apply();
    }
    requestAnimationFrame(loop);
  }

  // Pause the animation while the cake is scrolled out of view
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(root);
  }

  /* ---------- selection ---------- */

  function markSel() {
    layers.forEach((g, i) => {
      g.classList.toggle('dim', v.sel >= 0 && i !== v.sel);
      g.classList.toggle('sel', i === v.sel);
    });
    fills.forEach((g) => g.classList.toggle('dim', v.sel >= 0));
  }

  function select(i, toggle) {
    v.sel = toggle && i === v.sel ? -1 : i;
    if (v.sel >= 0 && v.eT < 0.55) {
      v.eT = 0.7;
      onExplode(v.eT);
    }
    markSel();
    onSelect(v.sel);
  }

  /* ---------- input ---------- */

  root.addEventListener('pointerdown', (e) => {
    if (e.button) return;
    drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY };
    v.spin = false;
    v.vr = 0;
    root.setPointerCapture(e.pointerId);
    root.classList.add('grabbing');
  });

  root.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    drag.x = e.clientX;
    drag.y = e.clientY;
    v.ry += dx * 0.5;
    v.vr = dx * 0.5;
    if (e.pointerType === 'mouse') v.rx = Math.max(-75, Math.min(8, v.rx - dy * 0.3));
  });

  const end = (e) => {
    if (!drag) return;
    const moved = Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy);
    drag = null;
    root.classList.remove('grabbing');
    if (moved < 6 && e.type === 'pointerup') {
      v.vr = 0;
      // pointer capture means the event target is the stage, so find what's under the pointer
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const layer = el && el.closest('[data-layer]');
      const fillEl = el && el.closest('[data-fill]');
      select(layer ? +layer.dataset.layer : fillEl ? +fillEl.dataset.fill : -1, true);
    }
  };
  root.addEventListener('pointerup', end);
  root.addEventListener('pointercancel', end);

  // Wheel opens/closes the layers; once fully open or closed, the page scrolls normally
  if (wheel) {
    root.addEventListener(
      'wheel',
      (e) => {
        const d = e.deltaY;
        if ((d > 0 && v.eT < 1) || (d < 0 && v.eT > 0)) {
          e.preventDefault();
          v.eT = Math.max(0, Math.min(1, v.eT + d * 0.0018));
          onExplode(v.eT);
        }
      },
      { passive: false }
    );
  }

  root.addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'ArrowRight') {
      v.spin = false;
      v.ry += k === 'ArrowLeft' ? -12 : 12;
    } else if (k === 'ArrowUp' || k === 'ArrowDown') {
      v.eT = Math.max(0, Math.min(1, v.eT + (k === 'ArrowUp' ? 0.2 : -0.2)));
      onExplode(v.eT);
    } else if (k === 'Escape') select(-1);
    else return;
    e.preventDefault();
  });

  addEventListener('resize', () => (lastKey = ''));
  requestAnimationFrame(loop);

  return {
    build,
    select: (i) => select(i, false),
    setOpen(x) {
      v.eT = x;
    },
    get open() {
      return v.eT;
    },
    get cut() {
      return v.cut;
    },
    toggleCut() {
      v.cut = !v.cut;
      build(s);
      return v.cut;
    },
    reset() {
      Object.assign(v, { rx: -24, ry: -38, eT: 0, vr: 0, sel: -1, spin: false });
      markSel();
      onSelect(-1);
      onExplode(0);
    },
  };
}
