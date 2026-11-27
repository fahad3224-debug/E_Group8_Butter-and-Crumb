import { CAKE } from './config.js';
import { formatPKR } from './format.js';
import {
  getCakeDraft,
  setCakeDraft,
  getSavedCakes,
  setSavedCakes,
  getEstimateState,
  setEstimateState
} from './store.js';
import { initLayout } from './layout.js';
import { createCake3D } from './cake/cake3d.js';
import { calculateCakePrice, getCakeCaption, getCakeDescription } from './cake/pricing.js';

initLayout();

const esc = (str) =>
  String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const DEFAULT_STATE = {
  shape: 'round',
  size: '2kg',
  layers: 3,
  sponges: ['chocolate', 'chocolate', 'chocolate', 'chocolate'],
  filling: 'ganache',
  finish: 'buttercream',
  frosting: '#FBEBD6',
  toppings: ['berries'],
  msg: '',
  dietary: [],
  notes: ''
};

function sanitizeState(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_STATE };
  const s = { ...DEFAULT_STATE };
  if (CAKE.shapes.some((x) => x.id === raw.shape)) s.shape = raw.shape;
  if (CAKE.sizes.some((x) => x.id === raw.size)) s.size = raw.size;
  if (CAKE.layers.some((x) => x.count === raw.layers)) s.layers = raw.layers;
  if (Array.isArray(raw.sponges) && raw.sponges.length === 4) {
    s.sponges = raw.sponges.map((id) => (CAKE.sponges.some((x) => x.id === id) ? id : 'vanilla'));
  }
  if (CAKE.fillings.some((x) => x.id === raw.filling)) s.filling = raw.filling;
  if (CAKE.finishes.some((x) => x.id === raw.finish)) s.finish = raw.finish;
  if (typeof raw.frosting === 'string' && /^#[0-9a-f]{6}$/i.test(raw.frosting)) s.frosting = raw.frosting;
  if (Array.isArray(raw.toppings)) s.toppings = raw.toppings.filter((id) => CAKE.toppings.some((x) => x.id === id));
  if (typeof raw.msg === 'string') s.msg = raw.msg.slice(0, CAKE.messageMaxLen);
  if (Array.isArray(raw.dietary)) s.dietary = raw.dietary.filter((id) => CAKE.dietary.some((x) => x.id === id));
  if (typeof raw.notes === 'string') s.notes = raw.notes;
  return s;
}

let state = sanitizeState(getCakeDraft());
let selectedLayer = -1;

const viewport = document.getElementById('cake-viewport');
const cake3d = createCake3D(viewport, {
  onSelect(i) {
    selectedLayer = i;
    renderInspector();
  },
  onExplode(x) {
    const pct = Math.round(x * 100);
    const slider = document.getElementById('explode-slider');
    if (slider) slider.value = String(pct);
    const pctEl = document.getElementById('explode-pct');
    if (pctEl) pctEl.textContent = `${pct}%`;
    const open = x > 0.1;
    const btnLayers = document.getElementById('btn-toggle-layers');
    if (btnLayers) {
      btnLayers.textContent = open ? 'Close layers' : 'Open layers';
      btnLayers.classList.toggle('is-active', open);
      btnLayers.setAttribute('aria-pressed', String(open));
    }
  }
});

// ---- Build steps: rendered ONCE, only active-state updated after ----

function buildSteps() {
  const container = document.getElementById('studio-steps');
  container.innerHTML = `
    <div>
      <div class="d-flex align-items-center gap-2 mb-2"><span class="step-num-badge">1</span><h2 class="font-display fs-4 mb-0">Shape</h2></div>
      <div class="d-flex flex-wrap gap-2" id="step-shapes">
        ${CAKE.shapes.map((sh) => `
          <button type="button" class="chip" data-shape="${sh.id}" aria-pressed="false">
            <span>${sh.id === 'round' ? '●' : '■'}</span> ${sh.label}${sh.price ? ` <span class="chip__price">+${formatPKR(sh.price)}</span>` : ''}
          </button>
        `).join('')}
      </div>
    </div>

    <div>
      <div class="d-flex align-items-center gap-2 mb-2"><span class="step-num-badge">2</span><h2 class="font-display fs-4 mb-0">Size</h2></div>
      <div class="d-flex flex-wrap gap-2" id="step-sizes">
        ${CAKE.sizes.map((sz) => `
          <button type="button" class="chip" data-size="${sz.id}" aria-pressed="false">
            ${sz.label} (${sz.detail}) <span class="chip__price">${formatPKR(sz.price)}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <div>
      <div class="d-flex align-items-center gap-2 mb-2"><span class="step-num-badge">3</span><h2 class="font-display fs-4 mb-0">Layers</h2></div>
      <div class="d-flex flex-wrap gap-2" id="step-layers">
        ${CAKE.layers.map((ly) => `
          <button type="button" class="chip" data-layers="${ly.count}" aria-pressed="false">
            ${ly.label}${ly.multiplier ? ` <span class="chip__price">+${Math.round(ly.multiplier * 100)}%</span>` : ''}
          </button>
        `).join('')}
      </div>
    </div>

    <div>
      <div class="d-flex align-items-center gap-2 mb-2"><span class="step-num-badge">4</span><h2 class="font-display fs-4 mb-0">Sponge flavour</h2></div>
      <label for="sponge-all-select" class="visually-hidden">Sponge flavour for all layers</label>
      <select id="sponge-all-select" class="form-select">
        <option value="mixed">Mixed (set per layer on the cake)</option>
        ${CAKE.sponges.map((sp) => `<option value="${sp.id}">${sp.label}${sp.price ? ` (+${formatPKR(sp.price)})` : ''}</option>`).join('')}
      </select>
      <p class="small text-choco-muted mt-1 mb-0">Tip: tap any layer on the 3D cake to set its sponge individually.</p>
    </div>

    <div>
      <div class="d-flex align-items-center gap-2 mb-2"><span class="step-num-badge">5</span><h2 class="font-display fs-4 mb-0">Filling</h2></div>
      <div class="d-flex flex-wrap gap-2" id="step-fillings">
        ${CAKE.fillings.map((f) => `
          <button type="button" class="chip" data-filling="${f.id}" aria-pressed="false">
            <span class="chip-dot" style="background:${f.color};"></span>
            ${f.label}${f.price ? ` <span class="chip__price">+${formatPKR(f.price)}</span>` : ''}
          </button>
        `).join('')}
      </div>
    </div>

    <div>
      <div class="d-flex align-items-center gap-2 mb-2"><span class="step-num-badge">6</span><h2 class="font-display fs-4 mb-0">Finish</h2></div>
      <div class="d-flex flex-wrap gap-2" id="step-finishes">
        ${CAKE.finishes.map((fn) => `
          <button type="button" class="chip" data-finish="${fn.id}" aria-pressed="false">
            ${fn.label}${fn.price ? ` <span class="chip__price">+${formatPKR(fn.price)}</span>` : ''}
          </button>
        `).join('')}
      </div>
    </div>

    <div>
      <div class="d-flex align-items-center gap-2 mb-2">
        <span class="step-num-badge">7</span>
        <h2 class="font-display fs-4 mb-0">Frosting colour: <span id="frosting-label" class="text-terracotta">Warm cream</span></h2>
      </div>
      <div class="d-flex flex-wrap align-items-center gap-2" id="step-frosting-colors">
        ${CAKE.frostingColors.map((c) => `
          <button type="button" class="color-swatch" style="background:${c.hex};" data-color="${c.hex}" aria-label="${c.label}" title="${c.label}"></button>
        `).join('')}
        <label class="small fw-bold ms-2 d-inline-flex align-items-center gap-1">
          Custom <input type="color" id="frosting-custom-color" value="#FBEBD6" class="form-control form-control-color border-0 p-0" style="width:32px;height:32px;">
        </label>
      </div>
    </div>

    <div>
      <div class="d-flex align-items-center gap-2 mb-2"><span class="step-num-badge">8</span><h2 class="font-display fs-4 mb-0">Toppings (pick any)</h2></div>
      <div class="d-flex flex-wrap gap-2" id="step-toppings">
        ${CAKE.toppings.map((t) => `
          <button type="button" class="chip" data-topping="${t.id}" aria-pressed="false">
            <span class="topping-check" aria-hidden="true"></span>${t.label} <span class="chip__price">+${formatPKR(t.price)}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <div>
      <div class="d-flex align-items-center gap-2 mb-2"><span class="step-num-badge">9</span><h2 class="font-display fs-4 mb-0">Message on the cake</h2></div>
      <label for="cake-msg-input" class="visually-hidden">Message on the cake</label>
      <input id="cake-msg-input" type="text" class="form-control" maxlength="${CAKE.messageMaxLen}" placeholder="Happy Birthday!">
      <div class="d-flex justify-content-between small text-choco-muted mt-1">
        <span>+${formatPKR(CAKE.messagePrice)} when not empty</span>
        <span id="msg-counter">0/${CAKE.messageMaxLen}</span>
      </div>
    </div>

    <div>
      <div class="d-flex align-items-center gap-2 mb-2"><span class="step-num-badge">10</span><h2 class="font-display fs-4 mb-0">Dietary (optional)</h2></div>
      <div class="d-flex flex-wrap gap-2" id="step-dietary">
        ${CAKE.dietary.map((d) => `
          <button type="button" class="chip" data-dietary="${d.id}" aria-pressed="false">
            <span class="topping-check" aria-hidden="true"></span>${d.label}${d.price ? ` <span class="chip__price">+${formatPKR(d.price)}</span>` : ''}
          </button>
        `).join('')}
      </div>
    </div>

    <div>
      <div class="d-flex align-items-center gap-2 mb-2"><span class="step-num-badge">11</span><h2 class="font-display fs-4 mb-0">Anything else?</h2></div>
      <label for="cake-notes-input" class="visually-hidden">Additional notes</label>
      <textarea id="cake-notes-input" class="form-control" rows="2" placeholder="Ribbon colour, allergies, or delivery note..."></textarea>
    </div>
  `;

  // Wire events ONCE
  container.querySelectorAll('[data-shape]').forEach((b) => b.addEventListener('click', () => { state.shape = b.dataset.shape; onStateChange(); }));
  container.querySelectorAll('[data-size]').forEach((b) => b.addEventListener('click', () => { state.size = b.dataset.size; onStateChange(); }));
  container.querySelectorAll('[data-layers]').forEach((b) => b.addEventListener('click', () => { state.layers = Number(b.dataset.layers); onStateChange(); }));
  container.querySelector('#sponge-all-select').addEventListener('change', (e) => {
    if (e.target.value !== 'mixed') {
      state.sponges = Array(4).fill(e.target.value);
      onStateChange();
    }
  });
  container.querySelectorAll('[data-filling]').forEach((b) => b.addEventListener('click', () => { state.filling = b.dataset.filling; onStateChange(); }));
  container.querySelectorAll('[data-finish]').forEach((b) => b.addEventListener('click', () => { state.finish = b.dataset.finish; onStateChange(); }));
  container.querySelectorAll('[data-color]').forEach((b) => b.addEventListener('click', () => {
    state.frosting = b.dataset.color;
    container.querySelector('#frosting-custom-color').value = b.dataset.color;
    onStateChange();
  }));
  container.querySelector('#frosting-custom-color').addEventListener('input', (e) => {
    state.frosting = e.target.value;
    onStateChange();
  });
  container.querySelectorAll('[data-topping]').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.topping;
    state.toppings = state.toppings.includes(id)
      ? state.toppings.filter((x) => x !== id)
      : [...state.toppings, id];
    onStateChange();
  }));
  container.querySelectorAll('[data-dietary]').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.dietary;
    state.dietary = state.dietary.includes(id)
      ? state.dietary.filter((x) => x !== id)
      : [...state.dietary, id];
    onStateChange();
  }));

  const msgInput = container.querySelector('#cake-msg-input');
  msgInput.addEventListener('input', (e) => {
    state.msg = e.target.value.slice(0, CAKE.messageMaxLen);
    document.getElementById('msg-counter').textContent = `${state.msg.length}/${CAKE.messageMaxLen}`;
    setCakeDraft(state);
    cake3d.build(state);
    updatePricePanel();
  });

  const notesInput = container.querySelector('#cake-notes-input');
  notesInput.addEventListener('input', (e) => {
    state.notes = e.target.value;
    setCakeDraft(state);
  });
}

/** Only update active-state classes/attrs — no innerHTML re-render of steps */
function syncStepActiveStates() {
  const container = document.getElementById('studio-steps');
  if (!container) return;

  container.querySelectorAll('[data-shape]').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.shape === state.shape);
    b.setAttribute('aria-pressed', String(b.dataset.shape === state.shape));
  });
  container.querySelectorAll('[data-size]').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.size === state.size);
    b.setAttribute('aria-pressed', String(b.dataset.size === state.size));
  });
  container.querySelectorAll('[data-layers]').forEach((b) => {
    const match = Number(b.dataset.layers) === state.layers;
    b.classList.toggle('is-active', match);
    b.setAttribute('aria-pressed', String(match));
  });

  // Sponge select
  const spongeSelect = container.querySelector('#sponge-all-select');
  if (spongeSelect) {
    const active = state.sponges.slice(0, state.layers);
    const allSame = active.every((id) => id === active[0]);
    spongeSelect.value = allSame ? active[0] : 'mixed';
  }

  container.querySelectorAll('[data-filling]').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.filling === state.filling);
    b.setAttribute('aria-pressed', String(b.dataset.filling === state.filling));
  });
  container.querySelectorAll('[data-finish]').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.finish === state.finish);
    b.setAttribute('aria-pressed', String(b.dataset.finish === state.finish));
  });
  container.querySelectorAll('[data-color]').forEach((b) => {
    const match = b.dataset.color.toLowerCase() === state.frosting.toLowerCase();
    b.classList.toggle('is-active', match);
  });

  // Frosting label
  const colorName = CAKE.frostingColors.find((c) => c.hex.toLowerCase() === state.frosting.toLowerCase())?.label || 'Custom';
  const frostingLabel = document.getElementById('frosting-label');
  if (frostingLabel) frostingLabel.textContent = colorName;

  container.querySelectorAll('[data-topping]').forEach((b) => {
    const active = state.toppings.includes(b.dataset.topping);
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-pressed', String(active));
    const check = b.querySelector('.topping-check');
    if (check) check.textContent = active ? '✓ ' : '';
  });
  container.querySelectorAll('[data-dietary]').forEach((b) => {
    const active = state.dietary.includes(b.dataset.dietary);
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-pressed', String(active));
    const check = b.querySelector('.topping-check');
    if (check) check.textContent = active ? '✓ ' : '';
  });

  // Msg / notes (restore values after load)
  const msgInput = container.querySelector('#cake-msg-input');
  if (msgInput && msgInput.value !== state.msg) msgInput.value = state.msg;
  const counter = document.getElementById('msg-counter');
  if (counter) counter.textContent = `${state.msg.length}/${CAKE.messageMaxLen}`;

  const notesInput = container.querySelector('#cake-notes-input');
  if (notesInput && notesInput.value !== state.notes) notesInput.value = state.notes;
}

function updatePricePanel() {
  const { total, lines, leadHours, points } = calculateCakePrice(state);
  document.getElementById('studio-total-price').textContent = formatPKR(total);
  document.getElementById('studio-lead-points').textContent =
    `Needs ${leadHours} hours' notice · Earn +${points} Sweet Points`;
  document.getElementById('studio-breakdown').innerHTML = lines
    .map((l) => `<li class="d-flex justify-content-between"><span>${l.label}</span><span>${formatPKR(l.amount)}</span></li>`)
    .join('');
  document.getElementById('cake-caption').textContent = getCakeCaption(state);
}

function renderInspector() {
  const el = document.getElementById('layer-inspector');
  if (!el) return;
  if (selectedLayer < 0 || selectedLayer >= state.layers) {
    el.textContent = 'Tap any layer on the cake to open it and choose its sponge.';
    return;
  }
  const names = ['Bottom layer', 'Middle layer', 'Upper layer', 'Top layer'];
  const layerName = selectedLayer === state.layers - 1 ? 'Top layer' : names[selectedLayer] || `Layer ${selectedLayer + 1}`;
  const spongeId = state.sponges[selectedLayer];
  const sponge = CAKE.sponges.find((s) => s.id === spongeId) || CAKE.sponges[0];
  const filling = CAKE.fillings.find((f) => f.id === state.filling) || CAKE.fillings[0];
  const finish = CAKE.finishes.find((f) => f.id === state.finish) || CAKE.finishes[0];

  el.innerHTML = `
    <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
      <div class="d-flex align-items-center gap-2">
        <span style="width:18px;height:18px;border-radius:4px;background:${sponge.color};border:1px solid rgba(0,0,0,0.2);"></span>
        <strong>${esc(layerName)} · ${selectedLayer + 1} of ${state.layers}</strong>
      </div>
      <div class="d-flex gap-1">
        <button type="button" class="btn btn-sm btn-outline-dark" id="insp-up" ${selectedLayer >= state.layers - 1 ? 'disabled' : ''}>↑</button>
        <button type="button" class="btn btn-sm btn-outline-dark" id="insp-down" ${selectedLayer <= 0 ? 'disabled' : ''}>↓</button>
      </div>
    </div>
    <select id="insp-sponge" class="form-select form-select-sm mb-1" aria-label="Sponge for ${esc(layerName)}">
      ${CAKE.sponges.map((s) => `<option value="${s.id}"${s.id === spongeId ? ' selected' : ''}>${s.label}</option>`).join('')}
    </select>
    <div class="small text-choco-muted">Topped with ${esc(selectedLayer === state.layers - 1 ? finish.label : filling.label)}</div>
  `;
  el.querySelector('#insp-sponge').addEventListener('change', (e) => {
    state.sponges[selectedLayer] = e.target.value;
    onStateChange();
  });
  el.querySelector('#insp-up').addEventListener('click', () => cake3d.select(Math.min(state.layers - 1, selectedLayer + 1)));
  el.querySelector('#insp-down').addEventListener('click', () => cake3d.select(Math.max(0, selectedLayer - 1)));
}

function drawThumbnail(cakeState) {
  const canvas = document.createElement('canvas');
  canvas.width = 240;
  canvas.height = 180;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FCEBD8';
  ctx.fillRect(0, 0, 240, 180);
  ctx.fillStyle = '#E5D8C8';
  ctx.fillRect(30, 152, 180, 10);
  const layerH = Math.floor(96 / cakeState.layers);
  const fillCfg = CAKE.fillings.find((f) => f.id === cakeState.filling) || CAKE.fillings[0];
  let y = 152;
  for (let i = 0; i < cakeState.layers; i++) {
    const sp = CAKE.sponges.find((s) => s.id === cakeState.sponges[i]) || CAKE.sponges[0];
    y -= layerH;
    ctx.fillStyle = sp.color;
    ctx.fillRect(55, y, 130, layerH);
    if (i < cakeState.layers - 1) {
      y -= 5;
      ctx.fillStyle = fillCfg.color;
      ctx.fillRect(55, y, 130, 5);
    }
  }
  ctx.strokeStyle = cakeState.frosting;
  ctx.lineWidth = 6;
  ctx.strokeRect(52, y - 3, 136, 152 - y + 3);
  return canvas.toDataURL('image/png');
}

function renderSavedDesigns() {
  const grid = document.getElementById('saved-designs-grid');
  const list = getSavedCakes();
  if (list.length === 0) {
    grid.innerHTML = '<div class="col-12"><p class="text-choco-muted">No saved cakes yet — tap "Save design" to keep a copy of your cake here.</p></div>';
    return;
  }
  grid.innerHTML = list.map((item, idx) => `
    <div class="col-sm-6 col-lg-4">
      <div class="product-card">
        <img src="${esc(item.thumb)}" alt="${esc(item.caption)}" class="saved-cake-thumb mb-2">
        <div class="small fw-bold mb-1">${esc(item.caption)}</div>
        <div class="fw-bold mb-3">${formatPKR(item.price)}</div>
        <div class="d-flex gap-2 mt-auto">
          <button type="button" class="btn-pill btn-pill--sm flex-grow-1" data-load-cake="${idx}">Load</button>
          <button type="button" class="btn-pill btn-pill--outline btn-pill--sm" data-del-cake="${idx}">Delete</button>
        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('[data-load-cake]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const saved = getSavedCakes()[Number(btn.dataset.loadCake)];
      if (saved) {
        state = sanitizeState(saved.state);
        onStateChange();
        document.getElementById('studio-workspace').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  grid.querySelectorAll('[data-del-cake]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = getSavedCakes();
      next.splice(Number(btn.dataset.delCake), 1);
      setSavedCakes(next);
      renderSavedDesigns();
    });
  });
}

/** Central update: persist, sync UI states, rebuild cake, update price */
function onStateChange() {
  setCakeDraft(state);
  syncStepActiveStates();
  updatePricePanel();
  cake3d.build(state);
  renderInspector();
}

// Stage controls
const slider = document.getElementById('explode-slider');
const btnLayers = document.getElementById('btn-toggle-layers');
const btnSlice = document.getElementById('btn-toggle-slice');
const btnReset = document.getElementById('btn-reset-view');

slider.addEventListener('input', () => cake3d.setOpen(Number(slider.value) / 100));
btnLayers.addEventListener('click', () => cake3d.setOpen(cake3d.open > 0.1 ? 0 : 1));
btnSlice.addEventListener('click', () => {
  const cut = cake3d.toggleCut();
  btnSlice.textContent = cut ? 'Close the slice' : 'Cut a slice';
  btnSlice.classList.toggle('is-active', cut);
  btnSlice.setAttribute('aria-pressed', String(cut));
});
btnReset.addEventListener('click', () => {
  cake3d.reset();
  // Also reset the slice button
  btnSlice.textContent = 'Cut a slice';
  btnSlice.classList.remove('is-active');
  btnSlice.setAttribute('aria-pressed', 'false');
});

document.getElementById('btn-surprise-me').addEventListener('click', () => {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  // Unique toppings (0–3)
  const shuffled = [...CAKE.toppings].sort(() => Math.random() - 0.5);
  const nToppings = Math.floor(Math.random() * 4); // 0, 1, 2, or 3
  const toppings = shuffled.slice(0, nToppings).map((t) => t.id);
  // Sometimes mixed sponges
  const sps = CAKE.sponges;
  const sp0 = pick(sps).id;
  const sp1 = Math.random() > 0.6 ? pick(sps).id : sp0;
  const sp2 = Math.random() > 0.6 ? pick(sps).id : sp0;
  const sp3 = Math.random() > 0.6 ? pick(sps).id : sp0;
  state = {
    ...state,
    shape: pick(CAKE.shapes).id,
    size: pick(CAKE.sizes).id,
    layers: pick(CAKE.layers).count,
    sponges: [sp0, sp1, sp2, sp3],
    filling: pick(CAKE.fillings).id,
    finish: pick(CAKE.finishes).id,
    frosting: pick(CAKE.frostingColors).hex,
    toppings
  };
  onStateChange();
});

document.getElementById('btn-save-design').addEventListener('click', () => {
  const { total } = calculateCakePrice(state);
  const saved = getSavedCakes();
  saved.unshift({
    id: `saved-${Date.now()}`,
    caption: getCakeCaption(state),
    price: total,
    thumb: drawThumbnail(state),
    state: { ...state }
  });
  setSavedCakes(saved.slice(0, 12));
  renderSavedDesigns();
  document.getElementById('studio-action-feedback').textContent = 'Design saved below.';
});

document.getElementById('btn-add-estimate').addEventListener('click', () => {
  const { total, leadHours } = calculateCakePrice(state);
  const sizeCfg = CAKE.sizes.find((s) => s.id === state.size) || CAKE.sizes[1];
  const shapeCfg = CAKE.shapes.find((s) => s.id === state.shape) || CAKE.shapes[0];
  const est = getEstimateState() || { items: {}, customCakes: [], mode: 'delivery', sectorId: 'f7', timeMode: 'asap' };
  est.customCakes = est.customCakes || [];
  est.customCakes.push({
    id: `custom-${Date.now()}`,
    name: `Custom cake (${sizeCfg.label} ${shapeCfg.label.toLowerCase()})`,
    category: 'Cakes',
    price: total,
    prepMinutes: 90,
    isCustomCake: true,
    leadHours,
    meta: getCakeDescription(state)
  });
  setEstimateState(est);
  document.getElementById('studio-action-feedback').textContent =
    'Added. Open the estimator to see delivery time and total, or keep designing.';
});

// Bootstrap once
buildSteps();
syncStepActiveStates();
updatePricePanel();
cake3d.build(state);
renderInspector();
renderSavedDesigns();
