/**
 * LocalStorage persistence for Crumbery Bakery:
 * member sessions, rewards ledger, estimator cart/steps,
 * recently viewed items, and saved custom cake designs.
 */

import { REWARDS } from './config.js';

const KEYS = {
  SESSION: 'crumbery_session',
  MEMBERS: 'crumbery_members',
  ESTIMATE: 'crumbery_estimate',
  RECENT: 'crumbery_recent',
  DESIGNS: 'crumbery_designs',
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

/* ---------- Auth & Rewards ---------- */

export function getSession() {
  return readJSON(KEYS.SESSION, null);
}

export function setSession(session) {
  if (session) {
    writeJSON(KEYS.SESSION, session);
  } else {
    localStorage.removeItem(KEYS.SESSION);
  }
  window.dispatchEvent(new CustomEvent('crumbery:auth-changed', { detail: session }));
}

export function getMembersMap() {
  return readJSON(KEYS.MEMBERS, {});
}

export function saveMembersMap(map) {
  writeJSON(KEYS.MEMBERS, map);
}

export function getActiveMember() {
  const session = getSession();
  if (!session?.email) return null;
  const members = getMembersMap();
  return members[session.email] || null;
}

export function getTierForPoints(points) {
  let active = REWARDS.tiers[0];
  for (const tier of REWARDS.tiers) {
    if (points >= tier.minPoints) active = tier;
  }
  return active;
}

export function getActiveTier() {
  const member = getActiveMember();
  if (!member) return REWARDS.tiers[0];
  return getTierForPoints(member.points || 0);
}

/* ---------- Estimator State ---------- */

function defaultEstimate() {
  return {
    step: 1,
    items: [],
    fulfillmentMode: 'delivery',
    sectorId: 'f7',
    street: '',
    gpsCoords: null,
    timeMode: 'asap',
    scheduleDate: '',
    scheduleTime: '16:00',
  };
}

export function getEstimate() {
  const stored = readJSON(KEYS.ESTIMATE, null);
  return stored ? { ...defaultEstimate(), ...stored } : defaultEstimate();
}

export function saveEstimate(state) {
  writeJSON(KEYS.ESTIMATE, state);
}

export function resetEstimate() {
  const fresh = defaultEstimate();
  writeJSON(KEYS.ESTIMATE, fresh);
  return fresh;
}

export function addItemToEstimate(item, qty = 1) {
  const est = getEstimate();
  const existing = est.items.find((entry) => entry.id === item.id);
  if (existing) {
    existing.qty += qty;
  } else {
    est.items.push({
      id: item.id,
      name: item.name,
      category: item.category || 'Cakes',
      price: item.price,
      qty,
      prepMinutes: item.prepMinutes || 25,
      isCustomCake: Boolean(item.isCustomCake),
      meta: item.meta || '',
    });
  }
  saveEstimate(est);
  return est;
}

export function updateEstimateItemQty(id, delta) {
  const est = getEstimate();
  const idx = est.items.findIndex((entry) => entry.id === id);
  if (idx === -1) return est;
  est.items[idx].qty += delta;
  if (est.items[idx].qty <= 0) {
    est.items.splice(idx, 1);
  }
  saveEstimate(est);
  return est;
}

/* ---------- Recently Viewed ---------- */

export function getRecentViewed() {
  return readJSON(KEYS.RECENT, []);
}

export function pushRecentViewed(itemId) {
  const current = getRecentViewed().filter((id) => id !== itemId);
  current.unshift(itemId);
  const trimmed = current.slice(0, 5);
  writeJSON(KEYS.RECENT, trimmed);
  return trimmed;
}

/* ---------- Saved Cake Designs ---------- */

export function getSavedDesigns() {
  return readJSON(KEYS.DESIGNS, []);
}

export function saveCakeDesign(design) {
  const list = getSavedDesigns().filter((d) => d.id !== design.id);
  list.unshift(design);
  const trimmed = list.slice(0, 8);
  writeJSON(KEYS.DESIGNS, trimmed);
  return trimmed;
}

export function deleteSavedDesign(id) {
  const list = getSavedDesigns().filter((d) => d.id !== id);
  writeJSON(KEYS.DESIGNS, list);
  return list;
}

/* ---------- Cake Studio Draft (survives reloads) ---------- */

const DRAFT_KEY = 'crumbery_cake_draft';

export function getCakeDraft() {
  return readJSON(DRAFT_KEY, null);
}

export function saveCakeDraft(state) {
  writeJSON(DRAFT_KEY, state);
}
