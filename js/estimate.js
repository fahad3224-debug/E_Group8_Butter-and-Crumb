import { BAKERY, DELIVERY, TAX_RATE, REWARDS } from './config.js';
import { MENU_ITEMS } from './data/menu.js';
import { formatPKR, formatTime12, formatCountdown, haversineKm } from './format.js';
import {
  getEstimateState,
  setEstimateState,
  getRecentlyViewed,
  setRecentlyViewed,
  getMember
} from './store.js';
import { initLayout } from './layout.js';

initLayout();

const CATEGORIES = ['All', 'Pastries', 'Breads', 'Sweets', 'Cakes'];

const defaultState = {
  items: {}, // { [id]: qty }
  customCakes: [], // [{ id, name, category, price, prepMinutes, isCustomCake, leadHours, meta }]
  mode: 'delivery', // 'delivery' | 'pickup'
  sectorId: DELIVERY.sectors[0].id,
  customCoords: null, // { lat, lng }
  street: '',
  timeMode: 'asap', // 'asap' | 'schedule'
  scheduleDate: '',
  scheduleTime: ''
};

let state = { ...defaultState, ...(getEstimateState() || {}) };
let activeCategory = 'All';
let searchQuery = '';
let sortBy = 'popular';
let productModal = null;

function persist() {
  setEstimateState(state);
}

function getMemberTier(member) {
  if (!member) return null;
  const pts = Number(member.points || 0);
  let current = REWARDS.tiers[0];
  for (const t of REWARDS.tiers) {
    if (pts >= t.minPoints) current = t;
  }
  return current;
}

function getDistanceKm() {
  if (state.mode === 'pickup') return 0;
  if (state.customCoords) {
    return haversineKm(BAKERY.coords, state.customCoords);
  }
  const sector = DELIVERY.sectors.find((s) => s.id === state.sectorId) || DELIVERY.sectors[0];
  return haversineKm(BAKERY.coords, sector);
}

function getDeliveryBand(km) {
  for (const band of DELIVERY.bands) {
    if (km <= band.maxKm) return band;
  }
  return null;
}

function getEarliestCustomCakeDate() {
  if (!state.customCakes || state.customCakes.length === 0) return null;
  const maxLead = Math.max(...state.customCakes.map((c) => c.leadHours || 24));
  const target = new Date(Date.now() + maxLead * 3600 * 1000);
  return snapToOpeningHours(target);
}

function snapToOpeningHours(date) {
  const d = new Date(date.getTime());
  if (d.getHours() < BAKERY.openHour) {
    d.setHours(BAKERY.openHour, 0, 0, 0);
  } else if (d.getHours() >= BAKERY.closeHour) {
    d.setDate(d.getDate() + 1);
    d.setHours(BAKERY.openHour, 0, 0, 0);
  }
  return d;
}

function renderCategories() {
  const wrap = document.getElementById('category-badges');
  if (!wrap) return;
  wrap.innerHTML = CATEGORIES.map((cat) => `
    <button type="button" class="btn border-0 p-0 d-flex flex-column align-items-center gap-1" data-cat="${cat}" aria-pressed="${activeCategory === cat}">
      <span class="flower-badge ${activeCategory === cat ? 'is-active' : ''}">
        <span class="small fw-bold">${cat.slice(0, 3).toUpperCase()}</span>
      </span>
      <span class="small fw-bold">${cat}</span>
    </button>
  `).join('');

  wrap.querySelectorAll('[data-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      renderCategories();
      renderMenu();
    });
  });
}

function renderMenu() {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;

  let list = MENU_ITEMS.filter((item) => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
  else if (sortBy === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));
  else list.sort((a, b) => b.popularity - a.popularity);

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="p-4 rounded-4 text-center" style="background: var(--tan);">
          <p class="fw-bold mb-2">No bakery items match your search.</p>
          <button type="button" class="btn-pill btn-pill--sm" id="btn-reset-filters">Show all items</button>
        </div>
      </div>
    `;
    grid.querySelector('#btn-reset-filters')?.addEventListener('click', () => {
      activeCategory = 'All';
      searchQuery = '';
      document.getElementById('menu-search').value = '';
      renderCategories();
      renderMenu();
    });
    return;
  }

  grid.innerHTML = list.map((item) => {
    const qty = state.items[item.id] || 0;
    return `
      <div class="col-sm-6">
        <article class="product-card">
          <div class="product-card__img-wrap" style="cursor: pointer;" data-detail="${item.id}">
            <img class="product-card__img" src="${item.image}" alt="${item.name}" loading="lazy">
          </div>
          <span class="product-card__cat">${item.category}</span>
          <h3 class="product-card__title">
            <button type="button" class="btn btn-link p-0 text-start text-decoration-none fw-bold text-reset" data-detail="${item.id}">
              ${item.name}
            </button>
          </h3>
          <div class="product-card__footer">
            <span class="product-card__price">${formatPKR(item.price)}</span>
            ${qty === 0 ? `
              <button type="button" class="btn-pill btn-pill--sm" data-add="${item.id}">Add +</button>
            ` : `
              <div class="d-inline-flex align-items-center gap-1">
                <button type="button" class="btn-pill btn-pill--sm btn-pill--outline" data-dec="${item.id}" aria-label="Decrease ${item.name}">–</button>
                <span class="fw-bold px-2" aria-live="polite">${qty}</span>
                <button type="button" class="btn-pill btn-pill--sm" data-inc="${item.id}" aria-label="Increase ${item.name}">+</button>
              </div>
            `}
          </div>
        </article>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('[data-add], [data-inc]').forEach((btn) => {
    btn.addEventListener('click', () => updateItemQty(btn.dataset.add || btn.dataset.inc, 1));
  });
  grid.querySelectorAll('[data-dec]').forEach((btn) => {
    btn.addEventListener('click', () => updateItemQty(btn.dataset.dec, -1));
  });
  grid.querySelectorAll('[data-detail]').forEach((el) => {
    el.addEventListener('click', () => openProductModal(el.dataset.detail));
  });
}

function updateItemQty(id, delta) {
  const next = (state.items[id] || 0) + delta;
  if (next <= 0) delete state.items[id];
  else state.items[id] = next;
  persist();
  renderMenu();
  renderReceiptAndEta();
}

function openProductModal(id) {
  const item = MENU_ITEMS.find((m) => m.id === id);
  if (!item) return;

  const recent = getRecentlyViewed().filter((r) => r !== id);
  recent.unshift(id);
  setRecentlyViewed(recent.slice(0, 5));
  renderRecentlyViewed();

  const titleEl = document.getElementById('productModalLabel');
  const bodyEl = document.getElementById('productModalBody');
  titleEl.textContent = item.name;
  bodyEl.innerHTML = `
    <img src="${item.image}" alt="${item.name}" class="w-100 rounded-4 mb-3" style="max-height: 240px; object-fit: cover;">
    <p class="mb-2">${item.description}</p>
    <p class="small mb-1"><strong>Ingredients:</strong> ${item.ingredients}</p>
    <p class="small mb-1"><strong>Allergens:</strong> ${item.allergens}</p>
    <p class="small mb-3"><strong>Prep time:</strong> ~${item.prepMinutes} mins</p>
    <div class="d-flex justify-content-between align-items-center">
      <span class="fs-4 fw-bold">${formatPKR(item.price)}</span>
      <button type="button" class="btn-pill" id="modal-add-btn">Add to estimate <span class="arrow">→</span></button>
    </div>
  `;
  bodyEl.querySelector('#modal-add-btn').addEventListener('click', () => {
    updateItemQty(item.id, 1);
    productModal?.hide();
  });

  if (!productModal && window.bootstrap) {
    productModal = new window.bootstrap.Modal(document.getElementById('productModal'));
  }
  productModal?.show();
}

function renderRecentlyViewed() {
  const wrap = document.getElementById('recently-viewed-wrap');
  const listEl = document.getElementById('recently-viewed-list');
  const ids = getRecentlyViewed();
  if (!wrap || !listEl || ids.length === 0) {
    wrap?.classList.add('d-none');
    return;
  }
  wrap.classList.remove('d-none');
  listEl.innerHTML = ids
    .map((id) => MENU_ITEMS.find((m) => m.id === id))
    .filter(Boolean)
    .map((item) => `<button type="button" class="chip" data-recent="${item.id}">${item.name}</button>`)
    .join('');
  listEl.querySelectorAll('[data-recent]').forEach((btn) => {
    btn.addEventListener('click', () => openProductModal(btn.dataset.recent));
  });
}

function initDeliveryControls() {
  const sectorSelect = document.getElementById('sector-select');
  sectorSelect.innerHTML = DELIVERY.sectors.map((s) => `<option value="${s.id}">${s.label}</option>`).join('');
  sectorSelect.value = state.sectorId;

  const streetInput = document.getElementById('street-input');
  streetInput.value = state.street || '';

  const pickupInfo = document.getElementById('pickup-info');
  pickupInfo.innerHTML = `<strong>Pickup address:</strong> ${BAKERY.address}<br><span class="small text-choco-muted">No delivery fee or travel time.</span>`;

  const syncModeUI = () => {
    const isDelivery = state.mode === 'delivery';
    document.getElementById('mode-delivery').classList.toggle('is-active', isDelivery);
    document.getElementById('mode-delivery').setAttribute('aria-pressed', String(isDelivery));
    document.getElementById('mode-pickup').classList.toggle('is-active', !isDelivery);
    document.getElementById('mode-pickup').setAttribute('aria-pressed', String(!isDelivery));
    document.getElementById('delivery-fields').classList.toggle('d-none', !isDelivery);
    pickupInfo.classList.toggle('d-none', isDelivery);
  };

  document.getElementById('mode-delivery').addEventListener('click', () => {
    state.mode = 'delivery';
    persist();
    syncModeUI();
    renderReceiptAndEta();
  });
  document.getElementById('mode-pickup').addEventListener('click', () => {
    state.mode = 'pickup';
    persist();
    syncModeUI();
    renderReceiptAndEta();
  });

  sectorSelect.addEventListener('change', () => {
    state.sectorId = sectorSelect.value;
    state.customCoords = null;
    document.getElementById('geo-status').textContent = '';
    persist();
    renderReceiptAndEta();
  });

  streetInput.addEventListener('input', () => {
    state.street = streetInput.value;
    const err = document.getElementById('street-error');
    err.textContent = state.street.trim().length > 0 && state.street.trim().length < 5
      ? 'Please enter your house number and street.'
      : '';
    persist();
  });

  document.getElementById('btn-geolocate').addEventListener('click', () => {
    const status = document.getElementById('geo-status');
    if (!navigator.geolocation) {
      status.textContent = 'Geolocation is not supported by your browser.';
      return;
    }
    status.textContent = 'Finding your location...';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const km = haversineKm(BAKERY.coords, coords);
        if (km > DELIVERY.maxDeliveryKm) {
          status.textContent = `You are ${km.toFixed(1)} km away — outside our ${DELIVERY.maxDeliveryKm} km delivery area, switched to pickup.`;
          state.mode = 'pickup';
          syncModeUI();
        } else {
          state.customCoords = coords;
          status.textContent = `Location set (${km.toFixed(1)} km from F-7 Markaz).`;
        }
        persist();
        renderReceiptAndEta();
      },
      () => {
        status.textContent = 'Location permission denied. Please choose your sector below.';
      }
    );
  });

  syncModeUI();
}

function initScheduleControls() {
  const asapBtn = document.getElementById('time-asap');
  const schedBtn = document.getElementById('time-schedule');
  const inputsWrap = document.getElementById('schedule-inputs');
  const dateInput = document.getElementById('schedule-date');
  const timeInput = document.getElementById('schedule-time');
  const feedback = document.getElementById('schedule-feedback');

  const todayStr = new Date().toISOString().split('T')[0];
  dateInput.min = todayStr;
  dateInput.value = state.scheduleDate || todayStr;
  timeInput.value = state.scheduleTime || '16:00';

  const syncTimeUI = () => {
    const isAsap = state.timeMode === 'asap';
    asapBtn.classList.toggle('is-active', isAsap);
    asapBtn.setAttribute('aria-pressed', String(isAsap));
    schedBtn.classList.toggle('is-active', !isAsap);
    schedBtn.setAttribute('aria-pressed', String(!isAsap));
    inputsWrap.classList.toggle('d-none', isAsap);
  };

  const validateSchedule = () => {
    feedback.innerHTML = '';
    if (state.timeMode === 'asap') return;
    const [hh, mm] = (timeInput.value || '16:00').split(':').map(Number);
    const chosen = new Date(`${dateInput.value}T${timeInput.value || '16:00'}:00`);
    const earliestCake = getEarliestCustomCakeDate();

    if (hh < BAKERY.openHour || hh >= BAKERY.closeHour) {
      feedback.innerHTML = `Outside opening hours (${BAKERY.openHour}:00 AM – ${BAKERY.closeHour - 12}:00 PM). <button type="button" class="btn btn-link btn-sm p-0 fw-bold" id="btn-next-slot">Use next open slot</button>`;
      feedback.querySelector('#btn-next-slot')?.addEventListener('click', () => {
        const next = snapToOpeningHours(chosen);
        dateInput.value = next.toISOString().split('T')[0];
        timeInput.value = `${String(next.getHours()).padStart(2, '0')}:00`;
        state.scheduleDate = dateInput.value;
        state.scheduleTime = timeInput.value;
        persist();
        validateSchedule();
        renderReceiptAndEta();
      });
      return;
    }

    if (earliestCake && chosen < earliestCake) {
      feedback.textContent = `Your custom cake needs more notice. Earliest slot: ${earliestCake.toLocaleDateString('en-PK')} at ${formatTime12(earliestCake)}.`;
    }
  };

  asapBtn.addEventListener('click', () => {
    state.timeMode = 'asap';
    persist();
    syncTimeUI();
    renderReceiptAndEta();
  });
  schedBtn.addEventListener('click', () => {
    state.timeMode = 'schedule';
    persist();
    syncTimeUI();
    validateSchedule();
    renderReceiptAndEta();
  });
  dateInput.addEventListener('change', () => {
    state.scheduleDate = dateInput.value;
    persist();
    validateSchedule();
    renderReceiptAndEta();
  });
  timeInput.addEventListener('change', () => {
    state.scheduleTime = timeInput.value;
    persist();
    validateSchedule();
    renderReceiptAndEta();
  });

  syncTimeUI();
  validateSchedule();

  // Countdown to 8 PM same-day cut-off
  const updateCountdown = () => {
    const el = document.getElementById('cutoff-countdown');
    if (!el) return;
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate(), BAKERY.sameDayCutoffHour, 0, 0);
    if (now < cutoff) {
      el.textContent = `Order in ${formatCountdown(cutoff - now)} for delivery today`;
    } else {
      el.textContent = `Next delivery: tomorrow from ${BAKERY.openHour}:00 AM`;
    }
  };
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function renderReceiptAndEta() {
  const itemsWrap = document.getElementById('receipt-items');
  const totalsWrap = document.getElementById('receipt-totals');
  const etaWrap = document.getElementById('eta-timeline');
  const mobileTotal = document.getElementById('mobile-bar-total');
  const mobileEta = document.getElementById('mobile-bar-eta');

  const lines = [];
  let subtotal = 0;
  let maxPrep = 0;
  let totalCount = 0;

  (state.customCakes || []).forEach((cake, idx) => {
    subtotal += cake.price;
    totalCount += 1;
    lines.push(`
      <div class="p-2 rounded-3" style="background: var(--cream);">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div>
            <span class="badge text-bg-warning me-1">Custom</span>
            <strong>${cake.name}</strong>
            <div class="small text-choco-muted">${cake.meta || ''}</div>
            <a href="index.html" class="small fw-bold text-terracotta">Edit in Cake Studio</a>
          </div>
          <div class="text-end">
            <div class="fw-bold">${formatPKR(cake.price)}</div>
            <button type="button" class="btn btn-link btn-sm p-0 text-danger" data-remove-cake="${idx}">Remove</button>
          </div>
        </div>
      </div>
    `);
  });

  Object.entries(state.items).forEach(([id, qty]) => {
    const item = MENU_ITEMS.find((m) => m.id === id);
    if (!item || qty <= 0) return;
    const lineTotal = item.price * qty;
    subtotal += lineTotal;
    totalCount += qty;
    if (item.prepMinutes > maxPrep) maxPrep = item.prepMinutes;
    lines.push(`
      <div class="d-flex justify-content-between align-items-center small">
        <span>${qty} × ${item.name}</span>
        <span class="fw-bold">${formatPKR(lineTotal)}</span>
      </div>
    `);
  });

  if (lines.length === 0) {
    itemsWrap.innerHTML = '<p class="small text-choco-muted mb-0">No items added yet. Pick from the menu or design a custom cake.</p>';
  } else {
    itemsWrap.innerHTML = lines.join('');
    itemsWrap.querySelectorAll('[data-remove-cake]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.customCakes.splice(Number(btn.dataset.removeCake), 1);
        persist();
        renderReceiptAndEta();
      });
    });
  }

  const member = getMember();
  const tier = getMemberTier(member);
  const discountPct = tier ? tier.discountPct : 0;
  const discountAmt = subtotal * (discountPct / 100);

  const km = getDistanceKm();
  const band = getDeliveryBand(km);
  let deliveryFee = 0;
  let deliveryLabel = 'Pickup (Rs 0)';
  if (state.mode === 'delivery' && subtotal > 0) {
    if (tier && tier.freeDelivery) {
      deliveryFee = 0;
      deliveryLabel = `Free with ${tier.name}`;
    } else if (band) {
      deliveryFee = band.fee;
      deliveryLabel = `${band.label} (${km.toFixed(1)} km)`;
    }
  }

  const taxable = Math.max(0, subtotal - discountAmt);
  const tax = taxable * TAX_RATE;
  const grandTotal = taxable + tax + deliveryFee;
  const pointsEarned = Math.floor(grandTotal * REWARDS.pointsPerRupee);

  totalsWrap.innerHTML = `
    <div class="d-flex justify-content-between"><span>Subtotal</span><span>${formatPKR(subtotal)}</span></div>
    ${discountPct > 0 ? `<div class="d-flex justify-content-between text-terracotta"><span>${tier.name} discount (${discountPct}%)</span><span>−${formatPKR(discountAmt)}</span></div>` : ''}
    <div class="d-flex justify-content-between"><span>Delivery (${deliveryLabel})</span><span>${formatPKR(deliveryFee)}</span></div>
    <div class="d-flex justify-content-between"><span>Tax (${Math.round(TAX_RATE * 100)}%)</span><span>${formatPKR(tax)}</span></div>
    <hr class="my-2">
    <div class="d-flex justify-content-between fs-5 fw-bold"><span>Estimated total</span><span>${formatPKR(grandTotal)}</span></div>
    <div class="small text-choco-muted">Earn +${pointsEarned} Sweet Points</div>
  `;

  // ETA calculation
  const prepMins = totalCount === 0 ? 0 : BAKERY.defaultPrepMinutes + maxPrep + Math.max(0, totalCount - 1) * 2;
  const refDate = state.timeMode === 'schedule' && state.scheduleDate && state.scheduleTime
    ? new Date(`${state.scheduleDate}T${state.scheduleTime}:00`)
    : new Date();
  const hour = refDate.getHours();
  const isPeak = DELIVERY.peakHours.some(([start, end]) => hour >= start && hour < end);
  const rawTravel = state.mode === 'pickup' ? 0 : (km / DELIVERY.avgCitySpeedKmh) * 60 + DELIVERY.baseDispatchMinutes;
  const travelMins = Math.round(rawTravel * (isPeak ? DELIVERY.peakMultiplier : 1));
  const totalMins = prepMins + travelMins;
  const minMins = Math.round(totalMins * 0.9);
  const maxMins = Math.round(totalMins * 1.1);

  const earliestCake = getEarliestCustomCakeDate();
  let etaSummary = 'Add items to see your estimated time.';
  if (totalCount > 0) {
    if (earliestCake && state.timeMode === 'asap') {
      etaSummary = `Earliest with custom cake: ${earliestCake.toLocaleDateString('en-PK')} at ${formatTime12(earliestCake)}`;
    } else {
      const startEta = new Date(Date.now() + minMins * 60000);
      const endEta = new Date(Date.now() + maxMins * 60000);
      etaSummary = `Arrives between ${formatTime12(startEta)} and ${formatTime12(endEta)}`;
    }
  }

  etaWrap.innerHTML = `
    <p class="fw-bold fs-5 mb-2">${etaSummary}</p>
    <div class="row g-2 small">
      <div class="col-4"><strong>1. Baking</strong><br>${prepMins} mins</div>
      <div class="col-4"><strong>2. On the way</strong><br>${travelMins} mins${isPeak ? ' (peak)' : ''}</div>
      <div class="col-4"><strong>3. At your door</strong><br>${minMins}–${maxMins} mins</div>
    </div>
  `;

  if (mobileTotal) mobileTotal.textContent = formatPKR(grandTotal);
  if (mobileEta) mobileEta.textContent = totalCount > 0 ? etaSummary : 'Add items to estimate';
}

document.getElementById('menu-search')?.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderMenu();
});

document.getElementById('menu-sort')?.addEventListener('change', (e) => {
  sortBy = e.target.value;
  renderMenu();
});

document.getElementById('btn-copy-estimate')?.addEventListener('click', async () => {
  const feedback = document.getElementById('copy-feedback');
  const text = document.getElementById('receipt-card')?.innerText || '';
  try {
    await navigator.clipboard.writeText(text);
    feedback.textContent = 'Copied estimate to clipboard.';
  } catch {
    feedback.textContent = 'Copy not supported here — you can select and copy the receipt text.';
  }
});

document.getElementById('btn-clear-estimate')?.addEventListener('click', () => {
  if (window.confirm('Clear all items from your estimate?')) {
    state = { ...defaultState };
    persist();
    renderMenu();
    renderReceiptAndEta();
  }
});

renderCategories();
renderMenu();
renderRecentlyViewed();
initDeliveryControls();
initScheduleControls();
renderReceiptAndEta();
