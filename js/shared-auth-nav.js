/* ==========================================================================
   Crumbery Home Bakery — Shared State, Navigation & Header Helpers
   Handles localStorage keys for cart, promo codes, and demo customer session.
   Note: localStorage auth is for university demonstration only.
   ========================================================================== */

const STORAGE_KEYS = {
  CART: 'crumbery_cart',
  PROMO: 'crumbery_promo',
  USERS: 'crumbery_users',
  CURRENT_USER: 'crumbery_current_user',
  ORDERS: 'crumbery_orders'
};

/**
 * Format a numeric amount cleanly in Pakistani Rupees (Rs.).
 */
function formatPrice(amount) {
  return 'Rs. ' + Number(amount).toLocaleString('en-PK');
}

/**
 * Safely read and parse JSON data from localStorage.
 */
function readStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallbackValue;
    }
    return JSON.parse(raw);
  } catch (error) {
    return fallbackValue;
  }
}

/**
 * Safely save JSON data into localStorage.
 */
function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Ignore storage quota or private-browsing errors gracefully
  }
}

/* ---------- Cart Storage Helpers ---------- */

function getCart() {
  const data = readStorage(STORAGE_KEYS.CART, []);
  return Array.isArray(data) ? data : [];
}

function saveCart(cartArray) {
  writeStorage(STORAGE_KEYS.CART, cartArray);
  updateHeaderUI();
}

function getAppliedPromo() {
  const code = localStorage.getItem(STORAGE_KEYS.PROMO);
  return code ? code.trim().toUpperCase() : '';
}

function saveAppliedPromo(code) {
  if (!code) {
    localStorage.removeItem(STORAGE_KEYS.PROMO);
  } else {
    localStorage.setItem(STORAGE_KEYS.PROMO, code.trim().toUpperCase());
  }
}

/* ---------- Demo Account & Session Helpers (Browser Only) ---------- */

function seedDemoUsersIfEmpty() {
  const existing = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!existing) {
    const demoUsers = [
      {
        name: 'Sana Tariq',
        email: 'sana@crumbery.pk',
        password: 'bakery123'
      }
    ];
    saveRegisteredUsers(demoUsers);
  }
}

function getRegisteredUsers() {
  seedDemoUsersIfEmpty();
  const users = readStorage(STORAGE_KEYS.USERS, []);
  return Array.isArray(users) ? users : [];
}

function saveRegisteredUsers(usersArray) {
  writeStorage(STORAGE_KEYS.USERS, usersArray);
}

function getCurrentUser() {
  return readStorage(STORAGE_KEYS.CURRENT_USER, null);
}

function setCurrentUser(userObj) {
  if (!userObj) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } else {
    writeStorage(STORAGE_KEYS.CURRENT_USER, userObj);
  }
  updateHeaderUI();
}

function logoutCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  updateHeaderUI();
}

/* ---------- Shared Header UI & Mobile Navigation ---------- */

function getTotalCartQuantity() {
  const cart = getCart();
  let totalQty = 0;
  for (let i = 0; i < cart.length; i += 1) {
    totalQty += Number(cart[i].qty) || 0;
  }
  return totalQty;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function updateHeaderUI() {
  const cartCountBadge = document.getElementById('header-cart-count');
  if (cartCountBadge) {
    cartCountBadge.textContent = String(getTotalCartQuantity());
  }

  const userArea = document.getElementById('header-user-area');
  if (!userArea) {
    return;
  }

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.name) {
    userArea.innerHTML =
      '<span class="user-greeting">Hello, ' +
      escapeHtml(currentUser.name) +
      '</span>' +
      '<button type="button" class="btn btn--secondary btn--sm" id="header-logout-btn">Logout</button>';

    const logoutBtn = document.getElementById('header-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        logoutCurrentUser();
        window.location.href = 'account.html';
      });
    }
  } else {
    userArea.innerHTML =
      '<a href="account.html" class="btn btn--secondary btn--sm">Login / Sign Up</a>';
  }
}

function initSharedNavigation() {
  seedDemoUsersIfEmpty();
  updateHeaderUI();

  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const mainNav = document.getElementById('main-nav');
  if (toggleBtn && mainNav) {
    toggleBtn.addEventListener('click', function () {
      const isOpen = mainNav.classList.toggle('is-open');
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }
}

document.addEventListener('DOMContentLoaded', initSharedNavigation);
