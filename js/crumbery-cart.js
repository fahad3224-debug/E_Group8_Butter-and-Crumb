/* ==========================================================================
   Crumbery Home Bakery — Cart Logic (Member 5)
   Contains required calculation functions: sub(), disc(), total(),
   plus quantity controls, product removal, and promo code validation.
   ========================================================================== */

/**
 * 1. sub(): Calculate the cart subtotal from shared product data.
 * Loops through each item in the cart, finds its price in CRUMBERY_PRODUCTS,
 * and adds (price * quantity) to the subtotal.
 */
function sub(cartItems) {
  let subtotal = 0;

  for (let i = 0; i < cartItems.length; i += 1) {
    const cartEntry = cartItems[i];
    const product = findProductById(cartEntry.id);
    const quantity = Number(cartEntry.qty);

    if (product && quantity > 0) {
      subtotal += product.price * quantity;
    }
  }

  return subtotal;
}

/**
 * 2. disc(): Calculate the applicable discount based on subtotal and promo code.
 * - MITHAI10: 10% discount on subtotal.
 * - WELCOME200: Flat Rs. 200 discount (no minimum purchase; capped at subtotal).
 */
function disc(subtotalAmount, promoCode) {
  if (!subtotalAmount || subtotalAmount <= 0 || !promoCode) {
    return 0;
  }

  const normalizedCode = promoCode.trim().toUpperCase();

  if (normalizedCode === 'MITHAI10') {
    return Math.round(subtotalAmount * 0.10);
  }

  if (normalizedCode === 'WELCOME200') {
    return Math.min(200, subtotalAmount);
  }

  return 0;
}

/**
 * 3. total(): Calculate the final payable amount after subtracting the discount.
 */
function total(subtotalAmount, discountAmount) {
  const finalAmount = subtotalAmount - discountAmount;
  return finalAmount > 0 ? finalAmount : 0;
}

/* ---------- Cart Operations (Add, Update Qty, Remove) ---------- */

function addToCart(productId) {
  const product = findProductById(productId);
  if (!product) {
    return;
  }

  const cart = getCart();
  let found = false;

  for (let i = 0; i < cart.length; i += 1) {
    if (cart[i].id === productId) {
      cart[i].qty += 1;
      found = true;
      break;
    }
  }

  if (!found) {
    cart.push({ id: productId, qty: 1 });
  }

  saveCart(cart);
  renderCartPage();
  showCartFeedback('Added "' + product.name + '" to your cart.', 'success');
}

function increaseQuantity(productId) {
  const cart = getCart();
  for (let i = 0; i < cart.length; i += 1) {
    if (cart[i].id === productId) {
      cart[i].qty += 1;
      break;
    }
  }
  saveCart(cart);
  renderCartPage();
}

function decreaseQuantity(productId) {
  const cart = getCart();
  const updatedCart = [];

  for (let i = 0; i < cart.length; i += 1) {
    if (cart[i].id === productId) {
      const newQty = cart[i].qty - 1;
      if (newQty > 0) {
        updatedCart.push({ id: cart[i].id, qty: newQty });
      }
    } else {
      updatedCart.push(cart[i]);
    }
  }

  saveCart(updatedCart);
  if (updatedCart.length === 0) {
    saveAppliedPromo('');
  }
  renderCartPage();
}

function removeFromCart(productId) {
  const cart = getCart();
  const updatedCart = [];

  for (let i = 0; i < cart.length; i += 1) {
    if (cart[i].id !== productId) {
      updatedCart.push(cart[i]);
    }
  }

  saveCart(updatedCart);
  if (updatedCart.length === 0) {
    saveAppliedPromo('');
  }
  renderCartPage();
  showCartFeedback('Item removed from your cart.', 'success');
}

/* ---------- Promotional Code Validation ---------- */

function applyPromoCode(rawInput) {
  const promoMsgEl = document.getElementById('promo-feedback');
  const cart = getCart();

  if (cart.length === 0) {
    setPromoMessage(promoMsgEl, 'Please add at least one bakery item before applying a promo code.', 'error');
    return;
  }

  const enteredCode = rawInput.trim().toUpperCase();
  if (!enteredCode) {
    setPromoMessage(promoMsgEl, 'Please enter a promo code (MITHAI10 or WELCOME200).', 'error');
    return;
  }

  const currentPromo = getAppliedPromo();
  if (currentPromo === enteredCode) {
    setPromoMessage(
      promoMsgEl,
      'Promo code "' + enteredCode + '" is already applied. Duplicate discounts are not allowed.',
      'error'
    );
    return;
  }

  if (currentPromo && currentPromo !== enteredCode) {
    setPromoMessage(
      promoMsgEl,
      'Code "' + currentPromo + '" is already active. Remove it first if you want to switch codes.',
      'error'
    );
    return;
  }

  if (enteredCode !== 'MITHAI10' && enteredCode !== 'WELCOME200') {
    setPromoMessage(
      promoMsgEl,
      'Invalid promo code "' + enteredCode + '". Valid codes are MITHAI10 and WELCOME200.',
      'error'
    );
    return;
  }

  saveAppliedPromo(enteredCode);
  renderCartPage();

  if (enteredCode === 'MITHAI10') {
    setPromoMessage(promoMsgEl, 'MITHAI10 applied! You received a 10% discount.', 'success');
  } else {
    setPromoMessage(promoMsgEl, 'WELCOME200 applied! You received Rs. 200 off.', 'success');
  }
}

function removePromoCode() {
  const promoMsgEl = document.getElementById('promo-feedback');
  saveAppliedPromo('');
  renderCartPage();
  setPromoMessage(promoMsgEl, 'Promo code removed.', 'success');
}

function setPromoMessage(element, text, type) {
  if (!element) {
    return;
  }
  element.textContent = text;
  element.className = 'status-message status-message--' + type;
  element.hidden = false;
}

function showCartFeedback(text, type) {
  const banner = document.getElementById('cart-action-feedback');
  if (!banner) {
    return;
  }
  banner.textContent = text;
  banner.className = 'status-message status-message--' + type;
  banner.hidden = false;
}

/* ---------- Cart Page Rendering ---------- */

function renderCartPage() {
  const listContainer = document.getElementById('cart-items-list');
  const subtotalEl = document.getElementById('cart-subtotal');
  const discountEl = document.getElementById('cart-discount');
  const totalEl = document.getElementById('cart-total');
  const activePromoEl = document.getElementById('active-promo-container');
  const checkoutBtn = document.getElementById('proceed-checkout-btn');

  if (!listContainer) {
    return;
  }

  const cart = getCart();
  const appliedPromo = getAppliedPromo();
  const subtotalAmount = sub(cart);
  const discountAmount = disc(subtotalAmount, appliedPromo);
  const finalTotal = total(subtotalAmount, discountAmount);

  if (cart.length === 0 || subtotalAmount === 0) {
    listContainer.innerHTML =
      '<div class="empty-state-box">' +
      '<h2>Your Crumbery cart is empty</h2>' +
      '<p>Add warm sourdough loaves, pastries, cookies, or cakes below to build your bakery box.</p>' +
      '</div>';

    if (checkoutBtn) {
      checkoutBtn.setAttribute('aria-disabled', 'true');
      checkoutBtn.classList.add('is-disabled');
    }
  } else {
    let html = '';
    for (let i = 0; i < cart.length; i += 1) {
      const entry = cart[i];
      const product = findProductById(entry.id);
      if (!product) {
        continue;
      }
      const lineTotal = product.price * entry.qty;

      html +=
        '<article class="cart-item-card">' +
        '  <img class="cart-item-img" src="' + product.image + '" alt="' + escapeHtml(product.name) + '" />' +
        '  <div class="cart-item-info">' +
        '    <h3>' + escapeHtml(product.name) + '</h3>' +
        '    <p class="cart-item-unit">' + formatPrice(product.price) + ' each</p>' +
        '    <div class="qty-row">' +
        '      <button type="button" class="qty-btn" data-action="dec" data-id="' + product.id + '" aria-label="Decrease quantity of ' + escapeHtml(product.name) + '">-</button>' +
        '      <span class="qty-value" aria-live="polite">' + entry.qty + '</span>' +
        '      <button type="button" class="qty-btn" data-action="inc" data-id="' + product.id + '" aria-label="Increase quantity of ' + escapeHtml(product.name) + '">+</button>' +
        '    </div>' +
        '  </div>' +
        '  <div class="cart-item-actions">' +
        '    <span class="cart-line-subtotal">' + formatPrice(lineTotal) + '</span>' +
        '    <button type="button" class="remove-item-btn" data-action="remove" data-id="' + product.id + '">Remove</button>' +
        '  </div>' +
        '</article>';
    }
    listContainer.innerHTML = html;

    if (checkoutBtn) {
      checkoutBtn.removeAttribute('aria-disabled');
      checkoutBtn.classList.remove('is-disabled');
    }

    const actionButtons = listContainer.querySelectorAll('[data-action]');
    for (let j = 0; j < actionButtons.length; j += 1) {
      actionButtons[j].addEventListener('click', function () {
        const action = this.getAttribute('data-action');
        const id = this.getAttribute('data-id');
        if (action === 'inc') {
          increaseQuantity(id);
        } else if (action === 'dec') {
          decreaseQuantity(id);
        } else if (action === 'remove') {
          removeFromCart(id);
        }
      });
    }
  }

  if (subtotalEl) {
    subtotalEl.textContent = formatPrice(subtotalAmount);
  }
  if (discountEl) {
    discountEl.textContent = discountAmount > 0 ? '- ' + formatPrice(discountAmount) : formatPrice(0);
  }
  if (totalEl) {
    totalEl.textContent = formatPrice(finalTotal);
  }

  if (activePromoEl) {
    if (appliedPromo && discountAmount > 0) {
      activePromoEl.innerHTML =
        '<span class="applied-promo-pill">' +
        'Applied: ' + escapeHtml(appliedPromo) +
        ' <button type="button" id="remove-promo-btn" aria-label="Remove promo code">&times;</button>' +
        '</span>';
      const removeBtn = document.getElementById('remove-promo-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', removePromoCode);
      }
    } else {
      activePromoEl.innerHTML = '';
    }
  }
}

function renderCatalogHelper() {
  const grid = document.getElementById('quick-add-grid');
  if (!grid) {
    return;
  }

  let html = '';
  for (let i = 0; i < CRUMBERY_PRODUCTS.length; i += 1) {
    const item = CRUMBERY_PRODUCTS[i];
    html +=
      '<article class="catalog-mini-card">' +
      '  <img src="' + item.image + '" alt="' + escapeHtml(item.name) + '" />' +
      '  <div class="catalog-mini-body">' +
      '    <h3>' + escapeHtml(item.name) + '</h3>' +
      '    <p>' + escapeHtml(item.description) + '</p>' +
      '    <span class="catalog-mini-price">' + formatPrice(item.price) + '</span>' +
      '    <button type="button" class="btn btn--primary btn--sm quick-add-btn" data-add-id="' + item.id + '">+ Add to Cart</button>' +
      '  </div>' +
      '</article>';
  }
  grid.innerHTML = html;

  const buttons = grid.querySelectorAll('.quick-add-btn');
  for (let j = 0; j < buttons.length; j += 1) {
    buttons[j].addEventListener('click', function () {
      addToCart(this.getAttribute('data-add-id'));
    });
  }
}

function initCartPage() {
  renderCartPage();
  renderCatalogHelper();

  const promoForm = document.getElementById('promo-form');
  const promoInput = document.getElementById('promo-code-input');
  if (promoForm && promoInput) {
    promoForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyPromoCode(promoInput.value);
      promoInput.value = '';
    });
  }

  const checkoutBtn = document.getElementById('proceed-checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function (event) {
      const cart = getCart();
      if (cart.length === 0) {
        event.preventDefault();
        showCartFeedback('Your cart is empty. Add at least one item before proceeding to checkout.', 'error');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('cart-page-root')) {
    initCartPage();
  }
});
