/**
 * Delivery & Bill Estimator page logic (`estimate.html`).
 * Handles menu filtering/sorting, product detail modal, recently viewed items,
 * 4-step validation, Haversine GPS/sector distance, peak-hour ETA, and PKR receipt.
 */

import { BAKERY, DELIVERY, TAX_RATE } from './config.js';
import { formatPKR, formatCountdown, formatTime12h, haversineKm } from './format.js';
import { MENU_ITEMS } from './data/menu.js';
import {
  getEstimate,
  saveEstimate,
  resetEstimate,
  addItemToEstimate,
  updateEstimateItemQty,
  getRecentViewed,
  pushRecentViewed,
  getActiveTier,
  pointsFor,
} from './store.js';

let activeCategory = 'all';
let searchTerm = '';
let sortMode = 'popular';
let activeModalItem = null;
let productModal = null;

function initEstimator() {
  const menuGrid = document.getElementById('menuGrid');
  if (!menuGrid) return;

  const modalEl = document.getElementById('productDetailModal');
  if (modalEl && window.bootstrap) {
    productModal = new window.bootstrap.Modal(modalEl);
  }

  populateSectors();
  hydrateFormFromState();
  bindEvents();
  startCountdownTimer();

  renderMenu();
  renderRecentlyViewed();
  renderReceiptAndEta();
}

/* ---------- Sectors & Initial Hydration ---------- */

function populateSectors() {
  const select = document.getElementById('sectorSelect');
  if (!select) return;
  for (const sector of DELIVERY.sectors) {
    const opt = document.createElement('option');
    opt.value = sector.id;
    opt.textContent = sector.label;
    select.appendChild(opt);
  }
}

function hydrateFormFromState() {
  const est = getEstimate();
  const modeRadio = document.querySelector(`input[name="fulfillmentMode"][value="${est.fulfillmentMode}"]`);
  if (modeRadio) modeRadio.checked = true;
  toggleFulfillmentFields(est.fulfillmentMode);

  const sectorSelect = document.getElementById('sectorSelect');
  if (sectorSelect && est.sectorId) sectorSelect.value = est.sectorId;

  const streetInput = document.getElementById('streetInput');
  if (streetInput) streetInput.value = est.street || '';

  const timeRadio = document.querySelector(`input[name="timeMode"][value="${est.timeMode}"]`);
  if (timeRadio) timeRadio.checked = true;

  const dateInput = document.getElementById('scheduleDateInput');
  const timeInput = document.getElementById('scheduleTimeInput');
  const todayStr = new Date().toISOString().split('T')[0];
  if (dateInput) {
    dateInput.min = todayStr;
    dateInput.value = est.scheduleDate || todayStr;
  }
  if (timeInput) {
    timeInput.value = est.scheduleTime || '16:00';
  }
  toggleScheduleFields(est.timeMode);
  updateDistanceStatus();
}

/* ---------- Events ---------- */

function bindEvents() {
  // Category filter buttons
  document.getElementById('categoryFilterBar')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.flower-badge-btn');
    if (!btn) return;
    activeCategory = btn.dataset.cat || 'all';
    document.querySelectorAll('#categoryFilterBar .flower-badge-btn').forEach((b) => {
      const isActive = b === btn;
      b.classList.toggle('is-active', isActive);
      const badge = b.querySelector('.flower-badge');
      if (badge) badge.classList.toggle('flower-badge--terracotta', isActive);
    });
    renderMenu();
  });

  // Search & Sort
  document.getElementById('menuSearchInput')?.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderMenu();
  });

  document.getElementById('menuSortSelect')?.addEventListener('change', (e) => {
    sortMode = e.target.value;
    renderMenu();
  });

  // Menu Grid actions (Add + or Open Details)
  document.getElementById('menuGrid')?.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add-id]');
    if (addBtn) {
      const item = MENU_ITEMS.find((m) => m.id === addBtn.dataset.addId);
      if (item) {
        addItemToEstimate(item, 1);
        renderMenu();
        renderReceiptAndEta();
      }
      return;
    }

    const qtyBtn = e.target.closest('[data-card-qty]');
    if (qtyBtn) {
      updateEstimateItemQty(qtyBtn.dataset.id, Number(qtyBtn.dataset.cardQty));
      renderMenu();
      renderReceiptAndEta();
      return;
    }

    const detailTrigger = e.target.closest('[data-detail-id]');
    if (detailTrigger) {
      openProductModal(detailTrigger.dataset.detailId);
    }
  });

  // Modal Add button
  document.getElementById('modalAddBtn')?.addEventListener('click', () => {
    if (!activeModalItem) return;
    addItemToEstimate(activeModalItem, 1);
    renderMenu();
    renderReceiptAndEta();
    productModal?.hide();
  });

  // Recently Viewed strip
  document.getElementById('recentlyViewedStrip')?.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-recent-id]');
    if (chip) openProductModal(chip.dataset.recentId);
  });

  // Receipt +/- quantity controls
  document.getElementById('receiptItemsList')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-receipt-qty]');
    if (!btn) return;
    updateEstimateItemQty(btn.dataset.id, Number(btn.dataset.receiptQty));
    renderMenu();
    renderReceiptAndEta();
  });

  // Stepper navigation
  document.querySelectorAll('.est-step-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetStep = Number(btn.dataset.step);
      const currentStep = getEstimate().step;
      if (targetStep > currentStep && !validateStep(currentStep)) return;
      goToStep(targetStep);
    });
  });

  document.querySelectorAll('[data-next-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const currentStep = getEstimate().step;
      if (!validateStep(currentStep)) return;
      goToStep(Number(btn.dataset.nextStep));
    });
  });

  document.querySelectorAll('[data-prev-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      goToStep(Number(btn.dataset.prevStep));
    });
  });

  // Fulfillment mode
  document.querySelectorAll('input[name="fulfillmentMode"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const est = getEstimate();
      est.fulfillmentMode = e.target.value;
      saveEstimate(est);
      toggleFulfillmentFields(est.fulfillmentMode);
      renderReceiptAndEta();
    });
  });

  // Sector & street
  document.getElementById('sectorSelect')?.addEventListener('change', (e) => {
    const est = getEstimate();
    est.sectorId = e.target.value;
    est.gpsCoords = null;
    saveEstimate(est);
    updateDistanceStatus();
    renderReceiptAndEta();
  });

  document.getElementById('streetInput')?.addEventListener('input', (e) => {
    const est = getEstimate();
    est.street = e.target.value;
    saveEstimate(est);
  });

  // GPS Location
  document.getElementById('useLocationBtn')?.addEventListener('click', handleUseGps);

  // Time mode & schedule inputs
  document.querySelectorAll('input[name="timeMode"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const est = getEstimate();
      est.timeMode = e.target.value;
      saveEstimate(est);
      toggleScheduleFields(est.timeMode);
      renderReceiptAndEta();
    });
  });

  document.getElementById('scheduleDateInput')?.addEventListener('change', (e) => {
    const est = getEstimate();
    est.scheduleDate = e.target.value;
    saveEstimate(est);
    renderReceiptAndEta();
  });

  document.getElementById('scheduleTimeInput')?.addEventListener('change', (e) => {
    const est = getEstimate();
    est.scheduleTime = e.target.value;
    saveEstimate(est);
    renderReceiptAndEta();
  });

  // Copy & Clear
  document.getElementById('copyEstimateBtn')?.addEventListener('click', handleCopyEstimate);
  document.getElementById('clearEstimateBtn')?.addEventListener('click', () => {
    resetEstimate();
    hydrateFormFromState();
    renderMenu();
    renderReceiptAndEta();
  });

  // Re-calculate if the member's points or tier change
  window.addEventListener('crumbery:member-changed', renderReceiptAndEta);
}

/* ---------- Menu & Modal Rendering ---------- */

function getFilteredMenu() {
  let list = MENU_ITEMS.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm);
    return matchesCat && matchesSearch;
  });

  if (sortMode === 'price-asc') {
    list = [...list].sort((a, b) => a.price - b.price);
  } else if (sortMode === 'price-desc') {
    list = [...list].sort((a, b) => b.price - a.price);
  } else if (sortMode === 'name-asc') {
    list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  } else {
    list = [...list].sort((a, b) => a.popular - b.popular);
  }
  return list;
}

function renderMenu() {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;

  const items = getFilteredMenu();
  const estItems = getEstimate().items;

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="p-4 text-center rounded-4" style="background: var(--cream); border: 1.5px dashed rgba(59,35,20,0.2);">
          <p class="fw-bold mb-2">No bakes matched "${escapeHtml(searchTerm)}".</p>
          <button type="button" class="pill-btn pill-btn--sm pill-btn--outline" id="resetFiltersBtn">Reset filters</button>
        </div>
      </div>
    `;
    document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
      searchTerm = '';
      activeCategory = 'all';
      const input = document.getElementById('menuSearchInput');
      if (input) input.value = '';
      document.querySelector('#categoryFilterBar [data-cat="all"]')?.click();
    });
    return;
  }

  grid.innerHTML = items
    .map((item) => {
      const inCart = estItems.find((e) => e.id === item.id);
      const badgeHtml = item.badge
        ? `<span class="sticker sticker--sm position-absolute top-0 start-0 m-2" style="font-size: 0.7rem;">${escapeHtml(item.badge)}</span>`
        : '';

      const actionHtml = inCart
        ? `<div class="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1" style="background: var(--choco); color: var(--cream);">
             <button type="button" class="btn btn-sm p-0 text-cream fw-bold border-0" style="width:22px;" data-id="${item.id}" data-card-qty="-1" aria-label="Decrease ${escapeHtml(item.name)}">−</button>
             <span class="small fw-bold px-1">${inCart.qty}</span>
             <button type="button" class="btn btn-sm p-0 text-cream fw-bold border-0" style="width:22px;" data-id="${item.id}" data-card-qty="1" aria-label="Increase ${escapeHtml(item.name)}">+</button>
           </div>`
        : `<button type="button" class="pill-btn pill-btn--sm" data-add-id="${item.id}">Add +</button>`;

      return `
        <div class="col-12 col-sm-6">
          <article class="product-card" style="background: var(--cream);">
            <button type="button" class="product-card__media border-0 p-0 text-start w-100 position-relative" data-detail-id="${item.id}" aria-label="View details for ${escapeHtml(item.name)}">
              <img src="${item.image}" alt="${escapeHtml(item.name)}" loading="lazy">
              ${badgeHtml}
            </button>
            <div class="product-card__cat">${escapeHtml(item.category)}</div>
            <h3 class="product-card__title">
              <button type="button" class="btn btn-link p-0 text-start text-decoration-none fw-bold" style="color: var(--choco); font-size: inherit;" data-detail-id="${item.id}">
                ${escapeHtml(item.name)}
              </button>
            </h3>
            <div class="product-card__footer">
              <span class="product-card__price">${formatPKR(item.price)}</span>
              ${actionHtml}
            </div>
          </article>
        </div>
      `;
    })
    .join('');
}

function openProductModal(itemId) {
  const item = MENU_ITEMS.find((m) => m.id === itemId);
  if (!item) return;
  activeModalItem = item;

  pushRecentViewed(item.id);
  renderRecentlyViewed();

  document.getElementById('modalProductCat').textContent = item.category;
  document.getElementById('modalProductTitle').textContent = item.name;
  const img = document.getElementById('modalProductImg');
  img.src = item.image;
  img.alt = item.name;
  document.getElementById('modalProductDesc').textContent = item.description;
  document.getElementById('modalProductIngredients').textContent = item.ingredients;
  document.getElementById('modalProductAllergens').textContent = item.allergens;
  document.getElementById('modalProductPrep').textContent = `${item.prepMinutes} mins fresh bake`;
  document.getElementById('modalProductPrice').textContent = formatPKR(item.price);

  productModal?.show();
}

function renderRecentlyViewed() {
  const strip = document.getElementById('recentlyViewedStrip');
  if (!strip) return;
  const ids = getRecentViewed();
  const items = ids.map((id) => MENU_ITEMS.find((m) => m.id === id)).filter(Boolean);

  if (items.length === 0) {
    strip.innerHTML = `<span class="small opacity-75">Open any item to see details and track recently viewed bakes.</span>`;
    return;
  }

  strip.innerHTML = items
    .map(
      (item) => `
      <button type="button" class="btn btn-sm rounded-pill fw-bold d-inline-flex align-items-center gap-2" style="background: var(--cream); color: var(--choco); border: 1.5px solid rgba(59,35,20,0.18);" data-recent-id="${item.id}">
        <span>${escapeHtml(item.name)}</span>
        <span class="text-terracotta">${formatPKR(item.price)}</span>
      </button>
    `
    )
    .join('');
}

/* ---------- Stepper & Validation ---------- */

function goToStep(stepNumber, persist = true) {
  const clamped = Math.min(4, Math.max(1, stepNumber));
  if (persist) {
    const est = getEstimate();
    est.step = clamped;
    saveEstimate(est);
  }

  for (let i = 1; i <= 4; i++) {
    const section = document.getElementById(`estStep${i}`);
    if (section) section.hidden = i !== clamped;
  }

  document.querySelectorAll('.est-step-btn').forEach((btn) => {
    const s = Number(btn.dataset.step);
    btn.classList.toggle('is-active', s === clamped);
    btn.classList.toggle('is-done', s < clamped);
    btn.setAttribute('aria-current', s === clamped ? 'step' : 'false');
  });

  clearStepError();
  renderReceiptAndEta();
}

function validateStep(step) {
  clearStepError();
  const est = getEstimate();

  if (step === 1) {
    if (est.items.length === 0) {
      showStepError('estStep1', 'Please add at least one bakery item before continuing.');
      return false;
    }
  }

  if (step === 2 && est.fulfillmentMode === 'delivery') {
    if (!est.sectorId && !est.gpsCoords) {
      showStepError('estStep2', 'Please choose an Islamabad/Rawalpindi sector or use GPS location.');
      return false;
    }
    const dist = getDeliveryDistanceKm(est);
    if (dist > DELIVERY.maxDeliveryKm) {
      showStepError('estStep2', `Location is ${dist.toFixed(1)} km away. We deliver within ${DELIVERY.maxDeliveryKm} km of F-7 Markaz, or choose Bakery Pickup.`);
      return false;
    }
    if (!est.gpsCoords && !est.street.trim()) {
      showStepError('estStep2', 'Please enter your house & street details for delivery.');
      document.getElementById('streetInput')?.focus();
      return false;
    }
  }

  if (step === 3 && est.timeMode === 'scheduled') {
    if (!est.scheduleDate || !est.scheduleTime) {
      showStepError('estStep3', 'Please choose a delivery date and time.');
      return false;
    }
    const [hourStr, minStr] = est.scheduleTime.split(':');
    const hour = Number(hourStr);
    const minute = Number(minStr);
    if (hour < BAKERY.openHour || hour > BAKERY.closeHour || (hour === BAKERY.closeHour && minute > 0)) {
      showStepError(
        'estStep3',
        `Scheduled time must be within bakery hours (${formatTime12h(BAKERY.openHour)} – ${formatTime12h(BAKERY.closeHour)}).`
      );
      return false;
    }
  }

  return true;
}

function showStepError(sectionId, message) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  let alert = section.querySelector('.est-step-alert');
  if (!alert) {
    alert = document.createElement('div');
    alert.className = 'est-step-alert alert mt-3 mb-0 small fw-bold';
    alert.style.background = 'var(--butter)';
    alert.style.color = 'var(--choco)';
    alert.style.border = '1.5px solid var(--choco)';
    alert.setAttribute('role', 'alert');
    section.appendChild(alert);
  }
  alert.textContent = message;
}

function clearStepError() {
  document.querySelectorAll('.est-step-alert').forEach((el) => el.remove());
}

/* ---------- Fulfillment, GPS & Distance ---------- */

function toggleFulfillmentFields(mode) {
  const fields = document.getElementById('deliveryAddressFields');
  if (fields) fields.hidden = mode === 'pickup';
}

function toggleScheduleFields(timeMode) {
  const fields = document.getElementById('scheduledTimeFields');
  if (fields) fields.hidden = timeMode !== 'scheduled';
}

function getDeliveryDistanceKm(est) {
  if (est.fulfillmentMode === 'pickup') return 0;
  if (est.gpsCoords) {
    return haversineKm(BAKERY.coords.lat, BAKERY.coords.lng, est.gpsCoords.lat, est.gpsCoords.lng);
  }
  const sector = DELIVERY.sectors.find((s) => s.id === est.sectorId);
  if (!sector) return 2;
  return haversineKm(BAKERY.coords.lat, BAKERY.coords.lng, sector.lat, sector.lng);
}

function updateDistanceStatus() {
  const statusEl = document.getElementById('geoStatusText');
  if (!statusEl) return;
  const est = getEstimate();
  if (est.fulfillmentMode === 'pickup') {
    statusEl.textContent = 'Pickup at F-7 Markaz, Islamabad';
    return;
  }
  const dist = getDeliveryDistanceKm(est);
  if (est.gpsCoords) {
    statusEl.textContent = `GPS locked: ${dist.toFixed(1)} km from F-7 Markaz`;
  } else if (est.sectorId) {
    statusEl.textContent = `Approx. ${dist.toFixed(1)} km from F-7 Markaz`;
  } else {
    statusEl.textContent = '';
  }
}

function handleUseGps() {
  const statusEl = document.getElementById('geoStatusText');
  if (!navigator.geolocation) {
    if (statusEl) statusEl.textContent = 'Geolocation is not supported by your browser.';
    return;
  }
  if (statusEl) statusEl.textContent = 'Locating...';

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const est = getEstimate();
      est.gpsCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      saveEstimate(est);
      updateDistanceStatus();
      renderReceiptAndEta();
    },
    () => {
      if (statusEl) statusEl.textContent = 'Location access denied. Please choose your sector below.';
    },
    { enableHighAccuracy: false, timeout: 8000 }
  );
}

/* ---------- Calculations, ETA & Receipt ---------- */

/** Crust delivers free on everything; Loaf delivers free above its threshold. */
function qualifiesForFreeDelivery(tier, subtotal) {
  if (tier.freeDelivery) return true;
  return tier.freeDeliveryOver != null && subtotal >= tier.freeDeliveryOver;
}

function getDeliveryFee(distanceKm, subtotal, est, tier) {
  if (est.fulfillmentMode === 'pickup' || subtotal === 0) return 0;
  if (qualifiesForFreeDelivery(tier, subtotal)) return 0;
  for (const band of DELIVERY.bands) {
    if (distanceKm <= band.maxKm) return band.fee;
  }
  return DELIVERY.bands[DELIVERY.bands.length - 1].fee;
}

function isPeakHour(date) {
  const hour = date.getHours();
  return DELIVERY.peakHours.some(([start, end]) => hour >= start && hour <= end);
}

/* ---------- Earliest delivery (opening hours, same-day cut-off, cake notice) ---------- */

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/** Longest notice any custom cake in the estimate needs, in hours (0 if none). */
function cakeLeadHours(est) {
  return est.items.reduce((max, item) => {
    if (!item.isCustomCake) return max;
    // Cakes added before leadHours was stored carry it in their description
    const fromMeta = Number((item.meta || '').match(/needs (\d+)h notice/)?.[1]);
    return Math.max(max, item.leadHours || fromMeta || 24);
  }, 0);
}

function openingOn(date, addDays = 0) {
  const d = new Date(date);
  d.setDate(d.getDate() + addDays);
  d.setHours(BAKERY.openHour, 0, 0, 0);
  return d;
}

/** Move a start time into opening hours, leaving time to bake and deliver before closing. */
function nextOpenStart(date, workMinutes) {
  if (date.getHours() < BAKERY.openHour) return openingOn(date);
  const latestStart = new Date(date);
  latestStart.setHours(BAKERY.closeHour, 0, 0, 0);
  latestStart.setTime(latestStart.getTime() - workMinutes * MINUTE);
  return date > latestStart ? openingOn(date, 1) : date;
}

function getScheduledDate(est) {
  if (est.timeMode !== 'scheduled' || !est.scheduleDate || !est.scheduleTime) return null;
  const d = new Date(`${est.scheduleDate}T${est.scheduleTime}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "today, 4:30 PM" · "tomorrow, 9:40 AM" · "Sun 29 Nov, 9:40 AM" */
function formatWhen(date, withTime = true) {
  const today = new Date();
  const days = Math.round((openingOn(date) - openingOn(today)) / (24 * HOUR));
  const day = days === 0 ? 'today' : days === 1 ? 'tomorrow' : date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  return withTime ? `${day}, ${formatTime12h(date.getHours(), date.getMinutes())}` : day;
}

function computeEta(est, distanceKm) {
  const prepMinutes = est.items.length
    ? Math.max(...est.items.map((item) => item.prepMinutes || BAKERY.defaultPrepMinutes))
    : BAKERY.defaultPrepMinutes;
  const pickup = est.fulfillmentMode === 'pickup';
  const now = new Date();
  const lead = cakeLeadHours(est);

  // Earliest the bakery can start: now, or tomorrow morning after the same-day cut-off,
  // pushed back by any custom cake's notice, then fitted into opening hours.
  let start = now;
  const cutoff = new Date(now);
  cutoff.setHours(BAKERY.sameDayCutoffHour, 0, 0, 0);
  if (now >= cutoff) start = openingOn(now, 1);
  if (lead) start = new Date(Math.max(start.getTime(), now.getTime() + lead * HOUR));

  const travelFor = (when) => {
    if (pickup) return { min: 0, max: 5, peak: false };
    const raw = (distanceKm / DELIVERY.avgCitySpeedKmh) * 60 + DELIVERY.baseDispatchMinutes;
    const peak = isPeakHour(when);
    const min = Math.max(10, Math.round(raw * (peak ? DELIVERY.peakMultiplier : 1)));
    return { min, max: min + 8, peak };
  };

  start = nextOpenStart(start, prepMinutes + travelFor(start).max);
  const travel = travelFor(start);
  const earliestArrival = new Date(start.getTime() + (prepMinutes + travel.min) * MINUTE);

  // A scheduled time is when the customer wants it delivered
  const scheduled = getScheduledDate(est);
  let notice = '';
  let noticeIsError = false;
  let arrival = earliestArrival;
  let arrivalEnd = new Date(start.getTime() + (prepMinutes + travel.max) * MINUTE);

  if (scheduled) {
    const outsideHours =
      scheduled.getHours() < BAKERY.openHour || scheduled.getHours() > BAKERY.closeHour || (scheduled.getHours() === BAKERY.closeHour && scheduled.getMinutes() > 0);
    if (outsideHours) {
      notice = `We deliver between ${formatTime12h(BAKERY.openHour)} and ${formatTime12h(BAKERY.closeHour)}. The earliest we can deliver is ${formatWhen(earliestArrival)}.`;
      noticeIsError = true;
    } else if (scheduled < earliestArrival) {
      notice = lead
        ? `Your custom cake needs ${lead} hours’ notice, so the earliest we can deliver is ${formatWhen(earliestArrival)}.`
        : `That’s too soon. The earliest we can deliver is ${formatWhen(earliestArrival)}.`;
      noticeIsError = true;
    } else {
      arrival = scheduled;
      arrivalEnd = new Date(scheduled.getTime() + (travel.max - travel.min) * MINUTE);
    }
  } else if (lead) {
    notice = `Your custom cake needs ${lead} hours’ notice, so the earliest ${pickup ? 'pickup' : 'delivery'} is ${formatWhen(earliestArrival)}.`;
  }

  const sameDayAsap = !scheduled && start === now;
  const windowText = `${formatTime12h(arrival.getHours(), arrival.getMinutes())} and ${formatTime12h(arrivalEnd.getHours(), arrivalEnd.getMinutes())}`;

  return {
    prepText: lead ? `${lead}h notice` : `${prepMinutes} min`,
    travelText: pickup ? '0 min (Pickup)' : `${travel.min}–${travel.max} min${travel.peak ? ' (peak)' : ''}`,
    totalText: sameDayAsap ? `${prepMinutes + travel.min}–${prepMinutes + travel.max} min` : formatWhen(arrival, false),
    arrivalText: `${pickup ? 'Ready for pickup' : 'Arrives'} ${formatWhen(arrival, false)} between ${windowText}`,
    notice,
    noticeIsError,
    earliestArrival,
  };
}

function renderReceiptAndEta() {
  const est = getEstimate();
  const listEl = document.getElementById('receiptItemsList');
  const subtotalEl = document.getElementById('estSubtotal');
  const discountEl = document.getElementById('estDiscount');
  const deliveryEl = document.getElementById('estDeliveryFee');
  const taxEl = document.getElementById('estTax');
  const totalEl = document.getElementById('estTotal');
  const pointsEl = document.getElementById('estPointsEarned');

  if (listEl) {
    if (est.items.length === 0) {
      listEl.innerHTML = `<span class="opacity-75">No items added yet.</span>`;
    } else {
      listEl.innerHTML = est.items
        .map(
          (item) => `
          <div class="d-flex justify-content-between align-items-start gap-2 py-2 border-bottom border-dark border-opacity-10">
            <div>
              <div class="fw-bold" style="color: var(--choco);">${escapeHtml(item.name)}</div>
              ${item.meta ? `<div class="opacity-75" style="font-size:0.75rem;">${escapeHtml(item.meta)}</div>` : ''}
              <div class="d-inline-flex align-items-center gap-1 mt-1">
                <button type="button" class="btn btn-sm py-0 px-2 rounded-pill" style="background: var(--tan); color: var(--choco);" data-id="${item.id}" data-receipt-qty="-1" aria-label="Decrease quantity of ${escapeHtml(item.name)}">−</button>
                <span class="fw-bold px-1">${item.qty}</span>
                <button type="button" class="btn btn-sm py-0 px-2 rounded-pill" style="background: var(--tan); color: var(--choco);" data-id="${item.id}" data-receipt-qty="1" aria-label="Increase quantity of ${escapeHtml(item.name)}">+</button>
              </div>
            </div>
            <div class="fw-bold text-nowrap">${formatPKR(item.price * item.qty)}</div>
          </div>
        `
        )
        .join('');
    }
  }

  const subtotal = est.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tier = getActiveTier();
  const discount = Math.round(subtotal * tier.discountRate);
  const distanceKm = getDeliveryDistanceKm(est);
  const deliveryFee = getDeliveryFee(distanceKm, subtotal, est, tier);
  const tax = Math.round((subtotal - discount) * TAX_RATE);
  const total = Math.max(0, subtotal - discount + deliveryFee + tax);
  const pointsEarned = pointsFor(subtotal - discount);

  if (subtotalEl) subtotalEl.textContent = formatPKR(subtotal);
  if (discountEl) {
    discountEl.textContent =
      discount > 0 ? `- ${formatPKR(discount)} (${tier.name})` : `- ${formatPKR(0)}`;
  }
  if (deliveryEl) {
    if (est.fulfillmentMode === 'pickup') {
      deliveryEl.textContent = 'Free (Pickup)';
    } else if (subtotal > 0 && qualifiesForFreeDelivery(tier, subtotal)) {
      deliveryEl.textContent = `Free (${tier.name})`;
    } else {
      deliveryEl.textContent = formatPKR(deliveryFee);
    }
  }
  if (taxEl) taxEl.textContent = formatPKR(tax);
  if (totalEl) totalEl.textContent = formatPKR(total);
  if (pointsEl) pointsEl.textContent = `Earn +${pointsEarned} Sweet Points`;

  const eta = computeEta(est, distanceKm);
  const prepEl = document.getElementById('etaPrepRange');
  const travelEl = document.getElementById('etaTravelRange');
  const totalEtaEl = document.getElementById('etaTotalRange');
  if (prepEl) prepEl.textContent = eta.prepText;
  if (travelEl) travelEl.textContent = eta.travelText;
  if (totalEtaEl) totalEtaEl.textContent = eta.totalText;

  const arrivalEl = document.getElementById('etaArrivalText');
  if (arrivalEl) arrivalEl.textContent = est.items.length ? eta.arrivalText : '';

  // Notice about the earliest possible time (custom cake notice, too-early or out-of-hours schedule)
  const noticeEl = document.getElementById('timeNotice');
  if (noticeEl) {
    noticeEl.hidden = !eta.notice;
    noticeEl.classList.toggle('est-time-notice--error', eta.noticeIsError);
    noticeEl.querySelector('[data-notice-text]').textContent = eta.notice;
    const useBtn = noticeEl.querySelector('[data-use-earliest]');
    useBtn.hidden = !eta.noticeIsError;
    useBtn.onclick = () => useEarliestSlot(eta.earliestArrival);
  }
}

/** Fill the schedule inputs with the earliest possible delivery time. */
function useEarliestSlot(date) {
  const d = new Date(date);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0); // round up to the next 5 minutes
  const pad = (n) => String(n).padStart(2, '0');
  const est = getEstimate();
  est.timeMode = 'scheduled';
  est.scheduleDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  est.scheduleTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  saveEstimate(est);
  hydrateFormFromState();
  renderReceiptAndEta();
}

/* ---------- Countdown & Copy ---------- */

function startCountdownTimer() {
  const el = document.getElementById('sameDayCountdown');
  if (!el) return;

  const update = () => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setHours(BAKERY.sameDayCutoffHour, 0, 0, 0);
    const diff = cutoff.getTime() - now.getTime();
    if (diff > 0) {
      el.textContent = `Order in ${formatCountdown(diff)} for delivery today`;
    } else {
      el.textContent = 'Same-day cutoff (8:00 PM) passed — next-day delivery open';
    }
  };

  update();
  setInterval(update, 1000);
}

async function handleCopyEstimate() {
  const est = getEstimate();
  const btn = document.getElementById('copyEstimateBtn');
  const totalText = document.getElementById('estTotal')?.textContent || 'Rs 0';
  const etaText = document.getElementById('etaTotalRange')?.textContent || '';

  const arrivalText = document.getElementById('etaArrivalText')?.textContent || '';
  const lines = [
    'Crumbery Bakery — Islamabad Estimate',
    ...est.items.map((i) => `• ${i.qty}x ${i.name}: ${formatPKR(i.price * i.qty)}`),
    `Fulfillment: ${est.fulfillmentMode === 'pickup' ? 'F-7 Markaz Pickup' : 'Delivery'}`,
    `ETA: ${arrivalText || etaText}`,
    `Estimated Total: ${totalText}`,
  ];

  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = 'Copied to clipboard!';
      setTimeout(() => {
        btn.textContent = orig;
      }, 2000);
    }
  } catch {
    if (btn) btn.textContent = 'Copy ready';
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', initEstimator);
