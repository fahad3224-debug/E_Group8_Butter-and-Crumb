// Centralised localStorage helper wrapped in try/catch

const KEYS = {
  member: 'crumbery_member',
  accounts: 'crumbery_accounts',
  cakeDraft: 'crumbery_cake_draft',
  savedCakes: 'crumbery_saved_cakes',
  estimate: 'crumbery_estimate',
  recentlyViewed: 'crumbery_recent_items'
};

function read(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function remove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore storage errors
  }
}

export function getMember() {
  return read(KEYS.member, null);
}

export function setMember(member) {
  write(KEYS.member, member);
}

export function clearMember() {
  remove(KEYS.member);
}

export function getAccounts() {
  return read(KEYS.accounts, []);
}

export function saveAccount(account) {
  const accounts = getAccounts();
  const idx = accounts.findIndex((a) => a.email.toLowerCase() === account.email.toLowerCase());
  if (idx >= 0) {
    accounts[idx] = account;
  } else {
    accounts.push(account);
  }
  write(KEYS.accounts, accounts);
}

export function getCakeDraft() {
  return read(KEYS.cakeDraft, null);
}

export function setCakeDraft(draft) {
  write(KEYS.cakeDraft, draft);
}

export function getSavedCakes() {
  return read(KEYS.savedCakes, []);
}

export function setSavedCakes(list) {
  write(KEYS.savedCakes, list);
}

export function getEstimateState() {
  return read(KEYS.estimate, null);
}

export function setEstimateState(state) {
  write(KEYS.estimate, state);
}

export function getRecentlyViewed() {
  return read(KEYS.recentlyViewed, []);
}

export function setRecentlyViewed(ids) {
  write(KEYS.recentlyViewed, ids);
}
