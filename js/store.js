/**
 * LocalStorage persistence for Crumbery Bakery:
 * the Sweet Rewards member, estimator cart/steps,
 * recently viewed items, and saved custom cake designs.
 */

import { REWARDS } from './config.js';

const KEYS = {
  MEMBER: 'crumbery_member',
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

/* ---------- Sweet Rewards member ---------- */

const DAY = 24 * 60 * 60 * 1000;

// Starting profile so the dashboard has real history to show (680 lifetime points).
function seedMember() {
  const ago = (days) => new Date(Date.now() - days * DAY).toISOString();
  const history = [
    { date: ago(3), label: 'Sourdough & pastries order', points: 120 },
    { date: ago(16), label: 'Custom 2 kg cake (Cake Studio)', points: 210 },
    { date: ago(35), label: 'Referred a friend', points: 150 },
    { date: ago(62), label: 'Birthday bonus', points: 200 },
  ];
  return { name: 'Sweet Rewards Member', balance: 680, lifetime: 680, history };
}

export function getMember() {
  const member = readJSON(KEYS.MEMBER, null);
  if (member && Array.isArray(member.history)) return member;
  const fresh = seedMember();
  writeJSON(KEYS.MEMBER, fresh);
  return fresh;
}

export function saveMember(member) {
  writeJSON(KEYS.MEMBER, member);
  window.dispatchEvent(new CustomEvent('crumbery:member-changed', { detail: member }));
}

/** Spend points on a reward. Returns the updated member, or null if there aren't enough points. */
export function redeemPoints(reward) {
  const member = getMember();
  if (member.balance < reward.cost) return null;
  member.balance -= reward.cost;
  member.history.unshift({ date: new Date().toISOString(), label: `Redeemed: ${reward.title}`, points: -reward.cost });
  saveMember(member);
  return member;
}

/** Tier is based on lifetime points, so redeeming never lowers it. */
export function getTierForPoints(points) {
  let active = REWARDS.tiers[0];
  for (const tier of REWARDS.tiers) {
    if (points >= tier.minPoints) active = tier;
  }
  return active;
}

export function getActiveTier() {
  return getTierForPoints(getMember().lifetime);
}

/** Sweet Points earned on an amount at the member's current tier. */
export function pointsFor(amount) {
  return Math.floor((Math.max(0, amount) / 100) * getActiveTier().earnPer100);
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
