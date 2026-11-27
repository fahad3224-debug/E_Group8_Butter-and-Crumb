import { CAKE } from '../config.js';

const STYLE_ID = 'crumbery-c3d-styles';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .c3d-layer, .c3d-filling, .c3d-plate-wrap, .c3d-toppings {
      position: absolute;
      left: 0; top: 0;
      width: 0; height: 0;
      transform-style: preserve-3d;
      transition: opacity 0.25s ease;
    }
    .c3d-facet {
      position: absolute;
      top: 0; left: 0;
      backface-visibility: hidden;
      transform-style: preserve-3d;
    }
    .c3d-facet::after {
      content: "";
      position: absolute;
      inset: 0;
      background: #000;
      opacity: var(--d, 0);
      pointer-events: none;
    }
    .c3d-disc {
      position: absolute;
      backface-visibility: hidden;
    }
    .c3d-selected .c3d-facet,
    .c3d-selected .c3d-disc {
      outline: 2px solid var(--terracotta);
    }
    .c3d-faded {
      opacity: 0.14;
    }
    .c3d-drip {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      background: #3B2314;
      border-radius: 0 0 99px 99px;
      pointer-events: none;
    }
    .c3d-cut-plane {
      position: absolute;
      top: 0;
      left: 0;
      transform-origin: 0 50%;
      backface-visibility: visible;
      border: 1px solid rgba(59, 35, 20, 0.15);
    }
    .c3d-billboard {
      position: absolute;
      transform-style: preserve-3d;
      pointer-events: none;
    }
    .c3d-billboard-inner {
      transform: rotateY(var(--iry, 0deg));
    }
    .c3d-flame {
      width: 6px;
      height: 10px;
      background: radial-gradient(circle at 50% 70%, #FFF6B0, #F28B30 70%, transparent);
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      margin: 0 auto 1px;
      animation: c3d-flicker 0.6s infinite alternate ease-in-out;
    }
    @keyframes c3d-flicker {
      from { transform: scale(1) rotate(-3deg); }
      to { transform: scale(1.12) rotate(3deg); }
    }
    @media (prefers-reduced-motion: reduce) {
      .c3d-flame { animation: none; }
    }
    .c3d-msg {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      font-family: var(--font-sticker);
      font-weight: 700;
      text-align: center;
      padding: 18%;
      line-height: 1.1;
      pointer-events: none;
      word-break: break-word;
    }
  `;
  document.head.appendChild(style);
}

function crumbBg(hex) {
  return `
    radial-gradient(circle at 20% 30%, rgba(59,35,20,0.16) 1px, transparent 1.5px),
    radial-gradient(circle at 70% 60%, rgba(255,255,255,0.2) 1px, transparent 1.5px),
    radial-gradient(circle at 45% 80%, rgba(59,35,20,0.12) 1px, transparent 1.5px),
    ${hex}
  `;
}

function getWallStyle(finish, frostingHex, spongeHex) {
  if (finish === 'naked') {
    return { background: crumbBg(spongeHex), backgroundSize: '12px 12px, 14px 14px, 10px 10px, auto' };
  }
  if (finish === 'semi-naked') {
    return {
      background: `linear-gradient(180deg, ${frostingHex}cc 0%, transparent 45%, ${frostingHex}cc 100%), ${crumbBg(spongeHex)}`,
      backgroundSize: 'auto, 12px 12px, 14px 14px, 10px 10px, auto'
    };
  }
  if (finish === 'fondant') {
    return {
      background: `linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 25%), ${frostingHex}`
    };
  }
  return {
    background: `repeating-linear-gradient(180deg, rgba(255,255,255,0.08) 0 4px, transparent 4px 9px), ${frostingHex}`
  };
}

function isDarkColor(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}

export function createCake3D(viewport) {
  injectStyles();

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rx = -24;
  let ry = -38;
  let vx = 0;
  let explodeTarget = 0;
  let explode = 0;
  let isCut = false;
  let selectedIdx = -1;
  let autoSpin = !reducedMotion;
  let isVisible = true;
  let dirty = true;
  let currentState = null;

  let onSelectCb = () => {};
  let onExplodeCb = () => {};

  viewport.innerHTML = '';
  const world = document.createElement('div');
  world.className = 'c3d-world';
  viewport.appendChild(world);

  const layerEls = [];
  const fillingEls = [];
  const facetList = [];

  function build(state) {
    currentState = state;
    world.innerHTML = '';
    layerEls.length = 0;
    fillingEls.length = 0;
    facetList.length = 0;

    const sizeCfg = CAKE.sizes.find((s) => s.id === state.size) || CAKE.sizes[1];
    const layerCfg = CAKE.layers.find((l) => l.count === state.layers) || CAKE.layers[0];
    const fillCfg = CAKE.fillings.find((f) => f.id === state.filling) || CAKE.fillings[0];
    const radius = sizeCfg.radius;
    const isRound = state.shape === 'round';
    const layerH = layerCfg.height;
    const fillH = layerCfg.fillingHeight;
    const isNaked = state.finish === 'naked';

    // Shadow & Plate
    const plateWrap = document.createElement('div');
    plateWrap.className = 'c3d-plate-wrap';
    const plateR = radius + 28;
    const shadow = document.createElement('div');
    shadow.style.cssText = `
      position:absolute; width:${plateR * 2.2}px; height:${plateR * 2.2}px;
      left:${-plateR * 1.1}px; top:${-plateR * 1.1}px;
      border-radius:50%;
      background: radial-gradient(circle, rgba(59,35,20,0.28) 0%, transparent 70%);
      transform: rotateX(90deg) translateZ(-12px);
    `;
    const plate = document.createElement('div');
    plate.style.cssText = `
      position:absolute; width:${plateR * 2}px; height:${plateR * 2}px;
      left:${-plateR}px; top:${-plateR}px;
      border-radius:50%;
      background: radial-gradient(circle at 40% 35%, #FFFDF9 0%, #EFE5D8 75%, #D8C7B4 100%);
      border: 3px solid #E5D8C8;
      transform: rotateX(90deg) translateZ(-4px);
    `;
    plateWrap.append(shadow, plate);
    world.appendChild(plateWrap);

    let yCursor = 0;
    const count = state.layers;

    for (let i = 0; i < count; i++) {
      const spongeId = state.sponges[i] || state.sponges[0];
      const spongeCfg = CAKE.sponges.find((s) => s.id === spongeId) || CAKE.sponges[0];
      const wallStyle = getWallStyle(state.finish, state.frosting, spongeCfg.color);
      const isTopLayer = i === count - 1;

      const layerWrap = document.createElement('div');
      layerWrap.className = 'c3d-layer';
      layerWrap.dataset.layerIndex = String(i);
      layerWrap.dataset.baseY = String(yCursor);

      if (isRound) {
        const segs = 32;
        const segW = 2 * radius * Math.tan(Math.PI / segs) + 1.5;
        for (let s = 0; s < segs; s++) {
          if (isCut && s < 8) continue;
          const angle = (s * 360) / segs;
          const facet = document.createElement('div');
          facet.className = 'c3d-facet';
          facet.dataset.layerIndex = String(i);
          facet.style.width = `${segW}px`;
          facet.style.height = `${layerH}px`;
          facet.style.left = `${-segW / 2}px`;
          facet.style.top = `${-layerH}px`;
          facet.style.background = wallStyle.background;
          if (wallStyle.backgroundSize) facet.style.backgroundSize = wallStyle.backgroundSize;
          facet.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
          if (isTopLayer && state.finish === 'chocolate-drip') {
            const drip = document.createElement('div');
            drip.className = 'c3d-drip';
            drip.style.height = `${9 + ((s * 7) % 19)}px`;
            facet.appendChild(drip);
          }
          layerWrap.appendChild(facet);
          facetList.push({ el: facet, angle });
        }
      } else {
        const sides = [0, 90, 180, 270];
        sides.forEach((angle, sideIdx) => {
          [-radius / 2, radius / 2].forEach((offsetX, halfIdx) => {
            if (isCut && ((sideIdx === 0 && halfIdx === 1) || (sideIdx === 1 && halfIdx === 0))) return;
            const facet = document.createElement('div');
            facet.className = 'c3d-facet';
            facet.dataset.layerIndex = String(i);
            facet.style.width = `${radius + 1}px`;
            facet.style.height = `${layerH}px`;
            facet.style.left = `${-radius / 2}px`;
            facet.style.top = `${-layerH}px`;
            facet.style.background = wallStyle.background;
            if (wallStyle.backgroundSize) facet.style.backgroundSize = wallStyle.backgroundSize;
            facet.style.transform = `rotateY(${angle}deg) translateZ(${radius}px) translateX(${offsetX}px)`;
            layerWrap.appendChild(facet);
            facetList.push({ el: facet, angle });
          });
        });
      }

      // Top & bottom discs (hairline fix: internal discs 1.5px smaller)
      const topR = isTopLayer ? radius : radius - 1.5;
      const topDisc = document.createElement('div');
      topDisc.className = 'c3d-disc';
      topDisc.dataset.layerIndex = String(i);
      const topColor = isTopLayer && state.finish === 'chocolate-drip' ? '#3B2314' : (isNaked ? spongeCfg.color : state.frosting);
      topDisc.style.cssText = `
        width:${topR * 2}px; height:${topR * 2}px;
        left:${-topR}px; top:${-topR}px;
        border-radius:${isRound ? '50%' : '6px'};
        background:${topColor};
        transform: translateY(${-layerH}px) rotateX(90deg);
      `;
      if (isCut) {
        topDisc.style.webkitMaskImage = 'conic-gradient(from 0deg, transparent 0deg 90deg, #000 90deg 360deg)';
        topDisc.style.maskImage = 'conic-gradient(from 0deg, transparent 0deg 90deg, #000 90deg 360deg)';
      }

      if (isTopLayer && state.msg) {
        const msgEl = document.createElement('div');
        msgEl.className = 'c3d-msg';
        msgEl.textContent = state.msg;
        msgEl.style.color = isDarkColor(topColor) ? '#FCEBD8' : '#3B2314';
        msgEl.style.fontSize = `${Math.max(12, Math.round(radius * 0.14))}px`;
        topDisc.appendChild(msgEl);
      }

      layerWrap.appendChild(topDisc);

      if (isCut) {
        [0, -90].forEach((rot) => {
          const cutPlane = document.createElement('div');
          cutPlane.className = 'c3d-cut-plane';
          cutPlane.style.width = `${radius}px`;
          cutPlane.style.height = `${layerH}px`;
          cutPlane.style.top = `${-layerH}px`;
          cutPlane.style.background = crumbBg(spongeCfg.color);
          cutPlane.style.backgroundSize = '12px 12px, 14px 14px, 10px 10px, auto';
          cutPlane.style.transform = `rotateY(${rot}deg)`;
          layerWrap.appendChild(cutPlane);
        });
      }

      world.appendChild(layerWrap);
      layerEls.push(layerWrap);
      yCursor -= layerH;

      // Filling between layers
      if (i < count - 1) {
        const fillWrap = document.createElement('div');
        fillWrap.className = 'c3d-filling';
        fillWrap.dataset.baseY = String(yCursor);
        const fillColor = isNaked ? fillCfg.color : state.frosting;
        const fDisc = document.createElement('div');
        fDisc.className = 'c3d-disc';
        const fR = radius - 1.5;
        fDisc.style.cssText = `
          width:${fR * 2}px; height:${fR * 2}px;
          left:${-fR}px; top:${-fR}px;
          border-radius:${isRound ? '50%' : '6px'};
          background:${fillColor};
          transform: translateY(${-fillH / 2}px) rotateX(90deg);
        `;
        fillWrap.appendChild(fDisc);
        world.appendChild(fillWrap);
        fillingEls.push(fillWrap);
        yCursor -= fillH;
      }
    }

    // Toppings on top layer
    if (state.toppings && state.toppings.length > 0 && layerEls.length > 0) {
      const topLayer = layerEls[layerEls.length - 1];
      const topY = -layerH;
      const goldenAngle = 2.39996323;
      let tIdx = 0;

      state.toppings.forEach((tId) => {
        const itemCount = tId === 'piped-border' ? 12 : tId === 'candles' ? 5 : 6;
        for (let k = 0; k < itemCount; k++) {
          const angle = tId === 'piped-border' ? (k * 2 * Math.PI) / itemCount : tIdx * goldenAngle;
          if (isCut && angle >= 0 && angle <= Math.PI / 2) {
            tIdx++;
            continue;
          }
          const minR = state.msg ? radius * 0.62 : radius * 0.22;
          const dist = tId === 'piped-border' ? radius * 0.84 : minR + ((k * 19) % Math.max(12, radius * 0.55 - minR));
          const x = Math.cos(angle) * dist;
          const z = Math.sin(angle) * dist;

          const bb = document.createElement('div');
          bb.className = 'c3d-billboard';
          bb.style.transform = `translate3d(${x}px, ${topY}px, ${z}px)`;

          const inner = document.createElement('div');
          inner.className = 'c3d-billboard-inner';
          if (tId === 'berries') {
            inner.innerHTML = `<div style="width:14px;height:14px;border-radius:50%;background:${k % 2 ? '#9C2338' : '#2C3E73'};margin-top:-14px;box-shadow:inset -2px -2px 0 rgba(0,0,0,0.25);"></div>`;
          } else if (tId === 'macarons') {
            inner.innerHTML = `<div style="width:18px;height:12px;border-radius:6px;background:#E8A598;border-bottom:3px solid #FBF3E2;margin-top:-12px;"></div>`;
          } else if (tId === 'candles') {
            inner.innerHTML = `<div style="margin-top:-36px;"><div class="c3d-flame"></div><div style="width:5px;height:24px;background:repeating-linear-gradient(45deg,#F8E08E 0 4px,#C9503A 4px 8px);margin:0 auto;border-radius:2px;"></div></div>`;
          } else if (tId === 'gold-leaf') {
            inner.innerHTML = `<div style="width:12px;height:10px;background:linear-gradient(135deg,#FFE57F,#D4AF37);clip-path:polygon(10% 0,90% 20%,100% 90%,0 70%);margin-top:-4px;"></div>`;
          } else if (tId === 'piped-border') {
            inner.innerHTML = `<div style="width:12px;height:10px;border-radius:50%;background:${state.frosting};border:1px solid rgba(59,35,20,0.15);margin-top:-9px;"></div>`;
          } else {
            inner.innerHTML = `<div style="width:10px;height:10px;border-radius:3px;background:${tId === 'shards' ? '#3B2314' : '#F8E08E'};margin-top:-10px;"></div>`;
          }
          bb.appendChild(inner);
          topLayer.appendChild(bb);
          tIdx++;
        }
      });
    }

    updateAriaLabel();
    dirty = true;
  }

  function updateAriaLabel() {
    if (!currentState) return;
    viewport.setAttribute(
      'aria-label',
      `3D ${currentState.size} ${currentState.shape} cake with ${currentState.layers} layers and ${currentState.finish} finish`
    );
  }

  // Pointer & Wheel & Keyboard Controls
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let moved = 0;

  viewport.addEventListener('pointerdown', (e) => {
    dragging = true;
    autoSpin = false;
    startX = e.clientX;
    startY = e.clientY;
    moved = 0;
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    moved += Math.hypot(dx, dy);
    ry += dx * 0.45;
    vx = dx * 0.45;
    if (e.pointerType === 'mouse') {
      rx = Math.max(-75, Math.min(8, rx - dy * 0.3));
    }
    startX = e.clientX;
    startY = e.clientY;
    dirty = true;
  });

  viewport.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    if (moved < 6) {
      const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-layer-index]');
      if (hit) {
        const idx = Number(hit.dataset.layerIndex);
        select(selectedIdx === idx ? -1 : idx);
      }
    }
  });

  viewport.addEventListener('wheel', (e) => {
    const next = Math.max(0, Math.min(1, explodeTarget + (e.deltaY > 0 ? 0.12 : -0.12)));
    if (next !== explodeTarget) {
      e.preventDefault();
      autoSpin = false;
      setOpen(next);
    }
  }, { passive: false });

  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { ry -= 12; autoSpin = false; dirty = true; }
    else if (e.key === 'ArrowRight') { ry += 12; autoSpin = false; dirty = true; }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setOpen(Math.min(1, explodeTarget + 0.2)); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(Math.max(0, explodeTarget - 0.2)); }
    else if (e.key === 'Escape') { select(-1); }
  });

  const io = new IntersectionObserver((entries) => {
    isVisible = entries[0]?.isIntersecting ?? true;
  });
  io.observe(viewport);

  function frame() {
    if (isVisible) {
      if (autoSpin) {
        ry += 0.22;
        dirty = true;
      } else if (!dragging && Math.abs(vx) > 0.05) {
        ry += vx;
        vx *= 0.92;
        dirty = true;
      }
      if (Math.abs(explode - explodeTarget) > 0.002) {
        explode += (explodeTarget - explode) * 0.18;
        dirty = true;
      }

      if (dirty) {
        const vw = viewport.clientWidth || 320;
        const vh = viewport.clientHeight || 340;
        const maxR = 160;
        const totalH = 210 + explode * 180;
        const scale = Math.min(1.05, (vw * 0.72) / (maxR * 2), (vh * 0.76) / totalH);

        world.style.setProperty('--iry', `${-ry}deg`);
        world.style.transform = `scale3d(${scale}, ${scale}, ${scale}) rotateX(${rx}deg) rotateY(${ry}deg)`;

        layerEls.forEach((el, idx) => {
          const baseY = Number(el.dataset.baseY || 0);
          const lift = idx * explode * 64 + (selectedIdx === idx ? -22 : 0);
          el.style.transform = `translateY(${baseY - idx * explode * 64 + (selectedIdx === idx ? -22 : 0)}px)`;
          el.classList.toggle('c3d-selected', selectedIdx === idx);
          el.classList.toggle('c3d-faded', selectedIdx >= 0 && selectedIdx !== idx);
          void lift;
        });

        fillingEls.forEach((el, idx) => {
          const baseY = Number(el.dataset.baseY || 0);
          el.style.transform = `translateY(${baseY - (idx + 0.5) * explode * 64}px)`;
          el.classList.toggle('c3d-faded', selectedIdx >= 0);
        });

        facetList.forEach(({ el, angle }) => {
          const rad = ((angle + ry + 35) * Math.PI) / 180;
          const d = 0.36 * (1 - (Math.cos(rad) + 1) / 2);
          el.style.setProperty('--d', d.toFixed(3));
        });

        dirty = false;
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function select(i) {
    selectedIdx = i;
    if (i >= 0 && explodeTarget < 0.7) {
      setOpen(0.7);
    }
    dirty = true;
    onSelectCb(selectedIdx);
  }

  function setOpen(x) {
    explodeTarget = Math.max(0, Math.min(1, x));
    dirty = true;
    onExplodeCb(explodeTarget);
  }

  function toggleCut() {
    isCut = !isCut;
    if (currentState) build(currentState);
    return isCut;
  }

  function reset() {
    rx = -24;
    ry = -38;
    vx = 0;
    selectedIdx = -1;
    isCut = false;
    setOpen(0);
    if (currentState) build(currentState);
    onSelectCb(-1);
  }

  return {
    build,
    select,
    setOpen,
    get open() { return explodeTarget; },
    get cut() { return isCut; },
    toggleCut,
    reset,
    onSelect(cb) { onSelectCb = cb; },
    onExplode(cb) { onExplodeCb = cb; }
  };
}
