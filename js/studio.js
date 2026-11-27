/**
 * Cake Studio page (index.html).
 * Renders every option from CAKE in config.js, keeps the 3D cake, caption,
 * price, lead time and points in sync, and handles saving / adding to the estimate.
 */

import { CAKE } from './config.js';
import { formatPKR } from './format.js';
import { addItemToEstimate, getCakeDraft, saveCakeDraft, getSavedDesigns, saveCakeDesign, deleteSavedDesign, pointsFor } from './store.js';
import { createCake3D } from './cake/cake3d.js';
import { pick, cakePrice, leadHours, caption, describe, frostingName, sameSponge } from './cake/pricing.js';

const $ = (sel) => document.querySelector(sel);
const esc = (str) => String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const DEFAULT_STATE = {
  shape: 'round',
  size: '8',
  layers: 3,
  sponges: ['chocolate', 'vanilla', 'chocolate', 'vanilla'],
  filling: 'raspberry-jam',
  finish: 'buttercream',
  frosting: CAKE.frostings[0].color,
  toppings: ['berries', 'piped-border'],
  msg: '',
  dietary: [],
  notes: '',
};

// Restore the last design the customer was working on (validated against config)
function loadState() {
  const saved = getCakeDraft();
  const s = { ...structuredClone(DEFAULT_STATE), ...(saved || {}) };
  const ok = (list, id) => list.some((o) => o.id === id);
  if (!ok(CAKE.shapes, s.shape)) s.shape = DEFAULT_STATE.shape;
  if (!ok(CAKE.sizes, s.size)) s.size = DEFAULT_STATE.size;
  if (!CAKE.layers.includes(s.layers)) s.layers = DEFAULT_STATE.layers;
  if (!Array.isArray(s.sponges) || s.sponges.length < 4) s.sponges = [...DEFAULT_STATE.sponges];
  s.sponges = s.sponges.map((id) => (ok(CAKE.sponges, id) ? id : 'vanilla'));
  if (!ok(CAKE.fillings, s.filling)) s.filling = DEFAULT_STATE.filling;
  if (!ok(CAKE.finishes, s.finish)) s.finish = DEFAULT_STATE.finish;
  if (!/^#[0-9a-f]{6}$/i.test(s.frosting)) s.frosting = DEFAULT_STATE.frosting;
  s.toppings = (s.toppings || []).filter((id) => ok(CAKE.toppings, id));
  s.dietary = (s.dietary || []).filter((id) => ok(CAKE.dietary, id));
  s.msg = String(s.msg || '').slice(0, CAKE.messageMax);
  s.notes = String(s.notes || '');
  return s;
}

const state = loadState();
let selLayer = -1;

/* ---------- render option controls from config ---------- */

const priceTag = (p) => (p ? `<small class="chip__price">+${formatPKR(p)}</small>` : '');

function chips(el, list, key, label, multi = false) {
  $(el).innerHTML = list
    .map((item) => {
      const val = typeof item === 'object' ? item.id : item;
      return `<button type="button" class="chip${multi ? ' chip--multi' : ''}" data-k="${key}" data-v="${val}" aria-pressed="false">${label(item)}</button>`;
    })
    .join('');
}

chips('#optShape', CAKE.shapes, 'shape', (x) => `<span class="chip__shape chip__shape--${x.id}" aria-hidden="true"></span>${x.label}${priceTag(x.price)}`);
chips('#optSize', CAKE.sizes, 'size', (x) => `${x.label} <small class="chip__sub">${x.sub}</small>`);
chips('#optLayers', CAKE.layers, 'layers', (x) => `${x} layers`);
chips('#optFilling', CAKE.fillings, 'filling', (x) => `<span class="chip__dot" style="background:${x.color}" aria-hidden="true"></span>${x.label}${priceTag(x.price)}`);
chips('#optFinish', CAKE.finishes, 'finish', (x) => `${x.label}${priceTag(x.price)}`);
chips('#optTop', CAKE.toppings, 'toppings', (x) => `${x.label}${priceTag(x.price)}`, true);
chips('#optDiet', CAKE.dietary, 'dietary', (x) => `${x.label}${priceTag(x.price)}`, true);

$('#optSponge').innerHTML =
  `<option value="mixed" disabled>Mixed (set per layer on the cake)</option>` +
  CAKE.sponges.map((x) => `<option value="${x.id}">${x.label}${x.price ? ` (+${formatPKR(x.price)})` : ''}</option>`).join('');

$('#optFrost').innerHTML = CAKE.frostings
  .map((f) => `<button type="button" class="swatch-btn" data-k="frosting" data-v="${f.color}" style="background-color:${f.color}" title="${f.label}" aria-label="${f.label} frosting" aria-pressed="false"></button>`)
  .join('');

$('#optMsg').maxLength = CAKE.messageMax;
$('#optMsg').value = state.msg;
$('#optNotes').value = state.notes;

/* ---------- the 3D cake ---------- */

const stage = $('#cake3d');
const cake = createCake3D(stage, {
  onSelect: (i) => {
    selLayer = i;
    renderLayerInfo();
  },
  onExplode: (x) => {
    $('#tExplode').value = Math.round(x * 100);
    $('#tExplode').setAttribute('aria-valuetext', `${Math.round(x * 100)}% open`);
    $('#tOpen').textContent = x > 0.5 ? 'Close layers' : 'Open layers';
    $('#tOpen').setAttribute('aria-pressed', String(x > 0.5));
  },
});

/* ---------- layer inspector ---------- */

function renderLayerInfo() {
  const el = $('#layerInfo');
  const i = selLayer;
  if (i < 0 || i >= state.layers) {
    el.innerHTML = `<p class="layer-info__empty">Tap any layer on the cake to open it and choose its sponge.</p>`;
    return;
  }
  const pos = i === 0 ? 'Bottom' : i === state.layers - 1 ? 'Top' : 'Middle';
  const sp = pick(CAKE.sponges, state.sponges[i]);
  const edge = state.finish === 'naked' ? 'rgba(70,35,15,.4)' : state.frosting;
  const topBand = i === state.layers - 1 ? `linear-gradient(${state.finish === 'drip' ? '#3B2314' : state.frosting} 0 6px, transparent 6px), ` : '';
  const below = i < state.layers - 1 ? `${pick(CAKE.fillings, state.filling).label} spread on top` : `${pick(CAKE.finishes, state.finish).label} on top${state.msg ? `, “${esc(state.msg)}”` : ''}`;

  el.innerHTML = `
    <div class="layer-info__row">
      <div class="xsec" title="Cross-section" style="background:${topBand}linear-gradient(90deg, ${edge} 0 5px, transparent 5px calc(100% - 5px), ${edge} 0), ${sp.color}"></div>
      <div class="flex-grow-1">
        <p class="layer-info__eyebrow">${pos} layer · ${i + 1} of ${state.layers}</p>
        <label class="visually-hidden" for="layerSponge">Sponge for this layer</label>
        <select class="form-select form-select-sm crumb-select" id="layerSponge">
          ${CAKE.sponges.map((x) => `<option value="${x.id}" ${x.id === sp.id ? 'selected' : ''}>${x.label}${x.price ? ` (+${formatPKR(x.price)})` : ''}</option>`).join('')}
        </select>
        <small class="layer-info__note">${below}</small>
      </div>
      <div class="layer-info__nav">
        <button type="button" class="chip chip--icon" data-lnav="1" ${i === state.layers - 1 ? 'disabled' : ''} aria-label="Layer above">↑</button>
        <button type="button" class="chip chip--icon" data-lnav="-1" ${i === 0 ? 'disabled' : ''} aria-label="Layer below">↓</button>
      </div>
    </div>`;

  $('#layerSponge').addEventListener('change', (e) => {
    state.sponges[i] = e.target.value;
    draw();
  });
}

$('#layerInfo').addEventListener('click', (e) => {
  const b = e.target.closest('[data-lnav]');
  if (b) cake.select(selLayer + Number(b.dataset.lnav));
});

/* ---------- summary ---------- */

function renderSummary() {
  const { total, lines } = cakePrice(state);
  $('#cakePrice').textContent = formatPKR(total);
  $('#cakeLead').textContent = `Needs ${leadHours(state)} hours’ notice`;
  $('#cakePoints').textContent = `Earn +${pointsFor(total)} Sweet Points`;
  $('#priceLines').innerHTML = lines.map(([label, amount]) => `<li><span>${esc(label)}</span><span>${formatPKR(amount)}</span></li>`).join('');
}

/* ---------- redraw everything from state ---------- */

function draw() {
  cake.build(state);

  document.querySelectorAll('[data-k]').forEach((b) => {
    const { k, v } = b.dataset;
    let on;
    if (k === 'toppings' || k === 'dietary') on = state[k].includes(v);
    else if (k === 'layers') on = state.layers === Number(v);
    else if (k === 'frosting') on = state.frosting.toLowerCase() === v.toLowerCase();
    else on = state[k] === v;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-pressed', String(on));
  });

  $('#optSponge').value = sameSponge(state) ? state.sponges[0] : 'mixed';
  $('#frostName').textContent = frostingName(state.frosting);
  $('#optFrostCustom').value = state.frosting;
  $('#msgCount').textContent = `${state.msg.length}/${CAKE.messageMax}`;
  $('#cakeCaption').textContent = caption(state);
  stage.setAttribute('aria-label', `Interactive 3D cake: ${describe(state)}. Drag or use left and right arrows to turn it, up and down arrows to open the layers.`);

  renderSummary();
  renderLayerInfo();
  saveCakeDraft(state);
}

/* ---------- option events ---------- */

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-k]');
  if (!b) return;
  const { k, v } = b.dataset;
  if (k === 'toppings' || k === 'dietary') {
    state[k] = state[k].includes(v) ? state[k].filter((x) => x !== v) : [...state[k], v];
  } else if (k === 'layers') {
    state.layers = Number(v);
  } else {
    state[k] = v;
  }
  $('#afterAdd').classList.add('d-none');
  draw();
});

$('#optSponge').addEventListener('change', (e) => {
  state.sponges = state.sponges.map(() => e.target.value);
  draw();
});

$('#optFrostCustom').addEventListener('input', (e) => {
  state.frosting = e.target.value;
  draw();
});

$('#optMsg').addEventListener('input', (e) => {
  state.msg = e.target.value.slice(0, CAKE.messageMax);
  draw();
});

$('#optNotes').addEventListener('input', (e) => {
  state.notes = e.target.value;
  saveCakeDraft(state);
});

/* ---------- viewer tools ---------- */

$('#tOpen').addEventListener('click', () => {
  const x = cake.open > 0.5 ? 0 : 1;
  cake.setOpen(x);
  $('#tExplode').value = x * 100;
  $('#tOpen').textContent = x ? 'Close layers' : 'Open layers';
  $('#tOpen').setAttribute('aria-pressed', String(Boolean(x)));
});

$('#tExplode').addEventListener('input', (e) => {
  const x = e.target.value / 100;
  cake.setOpen(x);
  $('#tOpen').textContent = x > 0.5 ? 'Close layers' : 'Open layers';
});

$('#tCut').addEventListener('click', (e) => {
  const on = cake.toggleCut();
  e.currentTarget.classList.toggle('is-active', on);
  e.currentTarget.setAttribute('aria-pressed', String(on));
  e.currentTarget.textContent = on ? 'Close the slice' : 'Cut a slice';
});

$('#tReset').addEventListener('click', () => {
  if (cake.cut) $('#tCut').click();
  cake.reset();
});

$('#surprise').addEventListener('click', () => {
  const r = (n) => Math.floor(Math.random() * n);
  const any = (list) => list[r(list.length)];
  const mixed = Math.random() < 0.4;
  const sponge = any(CAKE.sponges).id;
  Object.assign(state, {
    shape: any(CAKE.shapes).id,
    size: any(CAKE.sizes).id,
    layers: any(CAKE.layers),
    sponges: [0, 1, 2, 3].map(() => (mixed ? any(CAKE.sponges).id : sponge)),
    filling: any(CAKE.fillings).id,
    finish: any(CAKE.finishes).id,
    frosting: any(CAKE.frostings).color,
    toppings: CAKE.toppings.filter(() => Math.random() < 0.3).map((t) => t.id),
  });
  draw();
});

/* ---------- saved designs (thumbnail drawn on a 2D canvas) ---------- */

function thumbnail(s) {
  const c = document.createElement('canvas');
  c.width = 240;
  c.height = 180;
  const g = c.getContext('2d');
  g.fillStyle = '#F3D9BF';
  g.fillRect(0, 0, 240, 180);
  // plate
  g.fillStyle = '#FBF3E2';
  g.beginPath();
  g.ellipse(120, 150, 100, 16, 0, 0, Math.PI * 2);
  g.fill();
  // cross-section: sponges + fillings, bottom to top
  const w = s.size === '6' ? 130 : s.size === '8' ? 150 : 170;
  const x = 120 - w / 2;
  const lh = 84 / s.layers;
  const edge = s.finish === 'naked' ? null : s.frosting;
  let y = 146;
  for (let i = 0; i < s.layers; i++) {
    y -= lh;
    g.fillStyle = pick(CAKE.sponges, s.sponges[i]).color;
    g.fillRect(x, y, w, lh - 5);
    if (i < s.layers - 1) {
      g.fillStyle = pick(CAKE.fillings, s.filling).color;
      g.fillRect(x, y - 5, w, 5);
    }
  }
  const top = y - 5;
  if (edge) {
    g.fillStyle = edge;
    g.fillRect(x - 6, top, 6, 146 - top);
    g.fillRect(x + w, top, 6, 146 - top);
  }
  g.fillStyle = s.finish === 'drip' ? '#3B2314' : s.frosting;
  g.fillRect(x - (edge ? 6 : 0), top - 7, w + (edge ? 12 : 0), 8);
  if (s.toppings.includes('berries')) {
    g.fillStyle = '#9B2440';
    for (let k = 0; k < 6; k++) {
      g.beginPath();
      g.arc(x + 14 + k * ((w - 28) / 5), top - 12, 6, 0, Math.PI * 2);
      g.fill();
    }
  }
  return c.toDataURL('image/png');
}

function renderSaved() {
  const list = getSavedDesigns();
  const strip = $('#savedDesignsStrip');
  if (!list.length) {
    strip.innerHTML = `<div class="saved-design-card saved-design-card--empty"><div class="small fw-bold">No saved cakes yet</div><p class="small opacity-75 mb-0">Click “Save design” to keep a copy of your cake here.</p></div>`;
    return;
  }
  strip.innerHTML = list
    .map(
      (d) => `
      <article class="saved-design-card">
        <img src="${d.thumb}" alt="Cross-section of saved cake: ${esc(d.caption)}" width="240" height="180">
        <div class="small fw-bold">${esc(d.caption)}</div>
        <div class="small opacity-75">${formatPKR(d.price)}</div>
        <div class="d-flex gap-2 mt-auto">
          <button type="button" class="chip" data-load="${d.id}">Load</button>
          <button type="button" class="chip" data-del="${d.id}" aria-label="Delete saved design">Delete</button>
        </div>
      </article>`
    )
    .join('');
}

$('#savedDesignsStrip').addEventListener('click', (e) => {
  const load = e.target.closest('[data-load]');
  const del = e.target.closest('[data-del]');
  if (load) {
    const d = getSavedDesigns().find((x) => x.id === load.dataset.load);
    if (!d) return;
    Object.assign(state, structuredClone(d.state));
    $('#optMsg').value = state.msg;
    $('#optNotes').value = state.notes;
    draw();
    $('#cakeStudioSection').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  if (del) {
    deleteSavedDesign(del.dataset.del);
    renderSaved();
  }
});

$('#saveDesignBtn').addEventListener('click', () => {
  saveCakeDesign({
    id: `cake-${Date.now()}`,
    state: structuredClone(state),
    caption: caption(state),
    price: cakePrice(state).total,
    thumb: thumbnail(state),
    savedAt: new Date().toISOString(),
  });
  renderSaved();
  const fb = $('#studioFeedback');
  fb.textContent = 'Design saved below in “My saved designs”.';
  fb.classList.remove('d-none');
});

$('#addToEstimateBtn').addEventListener('click', () => {
  const { total } = cakePrice(state);
  addItemToEstimate({
    id: `custom-${Date.now()}`,
    name: `Custom cake (${pick(CAKE.sizes, state.size).label} ${pick(CAKE.shapes, state.shape).label.toLowerCase()})`,
    category: 'Cakes',
    price: total,
    prepMinutes: CAKE.prepMinutes,
    isCustomCake: true,
    meta: `${describe(state)} · needs ${leadHours(state)}h notice${state.notes.trim() ? ` · Note: ${state.notes.trim()}` : ''}`,
  });
  $('#afterAdd').classList.remove('d-none');
});

draw();
renderSaved();
