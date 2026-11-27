/**
 * Butter and Crumb — Shared Cart & Price Calculation Logic
 * Persists cart items in localStorage so items remain saved across Menu, Cakes, and Breads.
 */

const CART_STORAGE_KEY = "butterCrumbCart";
const PROMO_STORAGE_KEY = "butterCrumbPromo";
const VALID_PROMO_CODE = "SWEET10";

function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function getSavedPromo() {
  return localStorage.getItem(PROMO_STORAGE_KEY) || "";
}

function savePromo(code) {
  if (code) {
    localStorage.setItem(PROMO_STORAGE_KEY, code);
  } else {
    localStorage.removeItem(PROMO_STORAGE_KEY);
  }
}

/**
 * Adds one unit of a product by ID, updates UI badges, and shows confirmation.
 */
function addToCart(productId, triggerButton) {
  const product = BAKERY_PRODUCTS.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  const cart = getCart();
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  saveCart(cart);
  updateCartBadge();
  renderCartDrawer();
  showCartToast(product.name + " added to your cart!");

  if (triggerButton) {
    const originalHtml = triggerButton.innerHTML;
    triggerButton.classList.add("is-added");
    triggerButton.innerHTML = "Added &#10003;";
    triggerButton.disabled = true;
    setTimeout(() => {
      triggerButton.classList.remove("is-added");
      triggerButton.innerHTML = originalHtml;
      triggerButton.disabled = false;
    }, 950);
  }
}

/**
 * Changes quantity for an item; removes it if quantity drops below 1.
 */
function updateCartQuantity(productId, delta) {
  if (!Number.isInteger(delta)) {
    return;
  }
  const cart = getCart();
  const targetIndex = cart.findIndex((item) => item.id === productId);
  if (targetIndex === -1) {
    return;
  }

  const nextQty = cart[targetIndex].quantity + delta;
  if (nextQty <= 0) {
    cart.splice(targetIndex, 1);
  } else if (nextQty <= 50) {
    cart[targetIndex].quantity = nextQty;
  }

  saveCart(cart);
  updateCartBadge();
  renderCartDrawer();
}

function removeFromCart(productId) {
  const updatedCart = getCart().filter((item) => item.id !== productId);
  saveCart(updatedCart);
  updateCartBadge();
  renderCartDrawer();
}

function clearCart() {
  saveCart([]);
  savePromo("");
  updateCartBadge();
  renderCartDrawer();
}

/**
 * Calculates total item count, subtotal, promo discount, and final total.
 */
function calculateCartTotals(cart, promoCode) {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const normalizedCode = (promoCode || "").trim().toUpperCase();

  let discount = 0;
  let promoStatus = "";
  let promoValid = false;

  if (normalizedCode === VALID_PROMO_CODE && subtotal > 0) {
    discount = Math.round(subtotal * 0.1);
    promoValid = true;
    promoStatus = "Promo SWEET10 applied (10% off).";
  } else if (normalizedCode !== "" && subtotal > 0) {
    promoStatus = "Invalid promo code. Try SWEET10 for 10% off.";
  }

  const total = Math.max(0, subtotal - discount);
  return { itemCount, subtotal, discount, total, promoStatus, promoValid };
}

function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badges = document.querySelectorAll("[data-cart-count]");
  badges.forEach((badge) => {
    badge.textContent = String(count);
  });
}

function showCartToast(message) {
  const toastEl = document.getElementById("cartToast");
  const toastBody = document.getElementById("cartToastBody");
  if (!toastEl || !toastBody || typeof bootstrap === "undefined") {
    return;
  }
  toastBody.textContent = message;
  const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2200 });
  toast.show();
}

/**
 * Renders the contents of the shared Cart Offcanvas drawer.
 */
function renderCartDrawer() {
  const container = document.getElementById("cartItemsContainer");
  const summaryEl = document.getElementById("cartSummary");
  if (!container || !summaryEl) {
    return;
  }

  const cart = getCart();
  const activePromo = getSavedPromo();
  const totals = calculateCartTotals(cart, activePromo);

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="bc-empty-state">
        <p class="fw-bold mb-1">Your cart is currently empty.</p>
        <p class="small text-muted mb-0">Add some freshly baked cakes or breads to get started.</p>
      </div>
    `;
    summaryEl.innerHTML = "";
    return;
  }

  container.innerHTML = cart
    .map((item) => {
      const lineTotal = item.price * item.quantity;
      return `
        <div class="bc-cart-item mb-2 d-flex align-items-center justify-content-between gap-2">
          <div class="d-flex align-items-center gap-2">
            <img src="${item.image}" alt="${item.name}" width="52" height="52" class="rounded-3 object-fit-cover">
            <div>
              <div class="fw-bold small">${item.name}</div>
              <div class="small text-muted">${formatPrice(item.price)} each</div>
              <div class="fw-semibold small" style="color: var(--bc-terracotta);">${formatPrice(lineTotal)}</div>
            </div>
          </div>
          <div class="d-flex align-items-center gap-1">
            <button type="button" class="bc-qty-btn" aria-label="Decrease quantity of ${item.name}" data-qty-action="dec" data-id="${item.id}">-</button>
            <span class="px-2 fw-bold small" aria-live="polite">${item.quantity}</span>
            <button type="button" class="bc-qty-btn" aria-label="Increase quantity of ${item.name}" data-qty-action="inc" data-id="${item.id}">+</button>
            <button type="button" class="btn btn-sm btn-link text-danger ms-1 p-0" aria-label="Remove ${item.name}" data-remove-id="${item.id}">&times;</button>
          </div>
        </div>
      `;
    })
    .join("");

  summaryEl.innerHTML = `
    <div class="border-top pt-3 mt-3">
      <label for="promoCodeInput" class="form-label small fw-bold mb-1">Promo Code (Optional)</label>
      <div class="input-group input-group-sm mb-2">
        <input type="text" id="promoCodeInput" class="form-control" placeholder="Enter SWEET10" value="${activePromo}">
        <button type="button" class="btn btn-dark" id="applyPromoBtn">Apply</button>
      </div>
      ${
        totals.promoStatus
          ? `<p class="small mb-2 ${totals.promoValid ? "text-success" : "text-danger"}">${totals.promoStatus}</p>`
          : ""
      }
      <div class="d-flex justify-content-between small mb-1">
        <span>Subtotal (${totals.itemCount} items)</span>
        <span class="fw-semibold">${formatPrice(totals.subtotal)}</span>
      </div>
      ${
        totals.discount > 0
          ? `<div class="d-flex justify-content-between small text-success mb-1">
               <span>Discount (10%)</span>
               <span>-${formatPrice(totals.discount)}</span>
             </div>`
          : ""
      }
      <div class="d-flex justify-content-between fs-5 fw-bold mt-2 mb-3">
        <span>Total</span>
        <span style="color: var(--bc-terracotta);">${formatPrice(totals.total)}</span>
      </div>
      <div class="d-grid gap-2">
        <button type="button" class="bc-btn-primary w-100" id="checkoutOrderBtn">Place Bakery Order</button>
        <button type="button" class="bc-btn-outline w-100" id="clearCartBtn">Clear Cart</button>
      </div>
      <div id="orderStatusMessage" class="mt-2 small fw-semibold" role="status"></div>
    </div>
  `;
}

/**
 * Attaches click handlers once for the Cart Offcanvas controls.
 */
function initCartDrawerEvents() {
  const drawerEl = document.getElementById("cartOffcanvas");
  if (!drawerEl) {
    return;
  }

  drawerEl.addEventListener("click", (event) => {
    const qtyBtn = event.target.closest("[data-qty-action]");
    if (qtyBtn) {
      const id = qtyBtn.getAttribute("data-id");
      const delta = qtyBtn.getAttribute("data-qty-action") === "inc" ? 1 : -1;
      updateCartQuantity(id, delta);
      return;
    }

    const removeBtn = event.target.closest("[data-remove-id]");
    if (removeBtn) {
      removeFromCart(removeBtn.getAttribute("data-remove-id"));
      return;
    }

    if (event.target.id === "applyPromoBtn") {
      const input = document.getElementById("promoCodeInput");
      savePromo(input ? input.value.trim() : "");
      renderCartDrawer();
      return;
    }

    if (event.target.id === "clearCartBtn") {
      clearCart();
      return;
    }

    if (event.target.id === "checkoutOrderBtn") {
      const msg = document.getElementById("orderStatusMessage");
      if (msg) {
        msg.className = "mt-2 small fw-semibold text-success";
        msg.textContent = "Thank you! Your homemade bakery order has been confirmed.";
      }
      setTimeout(() => {
        clearCart();
      }, 1600);
    }
  });
}
