/* ==========================================================================
   Crumbery Home Bakery — Checkout & Simulated Payment Logic (Member 5)
   Reuses sub(), disc(), and total() from cart.js, validates customer fields,
   displays payment method instructions, generates a unique order number,
   and clears the cart ONLY after successful order placement.
   ========================================================================== */

const PAYMENT_INSTRUCTIONS = {
  'Cash on Delivery': {
    title: 'Cash on Delivery (Simulated)',
    text: 'Pay the final amount in cash to our delivery rider when your fresh Crumbery order arrives at your doorstep.'
  },
  Easypaisa: {
    title: 'Easypaisa Mobile Wallet (Simulated Demo)',
    text: 'Demo Instruction: Send the payable total to Crumbery Bakery Easypaisa Account (0300-0000000 — Demo Only). Do NOT transfer real money or enter real PINs.'
  },
  JazzCash: {
    title: 'JazzCash Mobile Wallet (Simulated Demo)',
    text: 'Demo Instruction: Transfer the payable total via JazzCash App to Till ID 000000 (Crumbery Demo). Do NOT transfer real money or enter real MPINs.'
  },
  'Bank Transfer': {
    title: 'Direct Bank Transfer / IBFT (Simulated Demo)',
    text: 'Demo Instruction: Bank: Crumbery Demo Bank | Account Title: Crumbery Home Bakery | IBAN: PK00DEMO0000000000000000. Do NOT transfer real funds.'
  }
};

function generateUniqueOrderNumber() {
  const existingOrders = readStorage(STORAGE_KEYS.ORDERS, []);
  const now = new Date();
  const datePart =
    String(now.getFullYear()) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');

  let candidate = '';
  let isDuplicate = true;

  while (isDuplicate) {
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    candidate = 'CRB-' + datePart + '-' + randomPart;
    isDuplicate = false;

    for (let i = 0; i < existingOrders.length; i += 1) {
      if (existingOrders[i].orderNumber === candidate) {
        isDuplicate = true;
        break;
      }
    }
  }

  return candidate;
}

function renderPaymentInstructions() {
  const box = document.getElementById('payment-instructions-box');
  const selectedRadio = document.querySelector('input[name="paymentMethod"]:checked');
  if (!box || !selectedRadio) {
    return;
  }

  const info = PAYMENT_INSTRUCTIONS[selectedRadio.value];
  if (!info) {
    box.hidden = true;
    return;
  }

  box.hidden = false;
  box.innerHTML =
    '<strong>' + escapeHtml(info.title) + '</strong>' +
    '<p style="margin: 0.35rem 0 0;">' + escapeHtml(info.text) + '</p>';
}

function renderCheckoutSummary() {
  const emptyNotice = document.getElementById('checkout-empty-notice');
  const checkoutGrid = document.getElementById('checkout-main-grid');
  const itemsList = document.getElementById('checkout-summary-items');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const discountEl = document.getElementById('checkout-discount');
  const promoRowEl = document.getElementById('checkout-promo-label');
  const totalEl = document.getElementById('checkout-total');

  const cart = getCart();
  const appliedPromo = getAppliedPromo();
  const subtotalAmount = sub(cart);
  const discountAmount = disc(subtotalAmount, appliedPromo);
  const finalTotal = total(subtotalAmount, discountAmount);

  if (cart.length === 0 || subtotalAmount === 0) {
    if (emptyNotice) emptyNotice.hidden = false;
    if (checkoutGrid) checkoutGrid.hidden = true;
    return;
  }

  if (emptyNotice) emptyNotice.hidden = true;
  if (checkoutGrid) checkoutGrid.hidden = false;

  if (itemsList) {
    let html = '';
    for (let i = 0; i < cart.length; i += 1) {
      const entry = cart[i];
      const product = findProductById(entry.id);
      if (!product) {
        continue;
      }
      const lineTotal = product.price * entry.qty;
      html +=
        '<li class="checkout-summary-item">' +
        '  <div class="checkout-summary-left">' +
        '    <img src="' + product.image + '" alt="' + escapeHtml(product.name) + '" />' +
        '    <div>' +
        '      <strong>' + escapeHtml(product.name) + '</strong><br />' +
        '      <span style="font-size:0.85rem;">Qty: ' + entry.qty + ' &times; ' + formatPrice(product.price) + '</span>' +
        '    </div>' +
        '  </div>' +
        '  <strong>' + formatPrice(lineTotal) + '</strong>' +
        '</li>';
    }
    itemsList.innerHTML = html;
  }

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotalAmount);
  if (discountEl) {
    discountEl.textContent = discountAmount > 0 ? '- ' + formatPrice(discountAmount) : formatPrice(0);
  }
  if (promoRowEl) {
    promoRowEl.textContent = appliedPromo && discountAmount > 0 ? 'Discount (' + appliedPromo + ')' : 'Discount';
  }
  if (totalEl) totalEl.textContent = formatPrice(finalTotal);
}

function setFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);
  if (input) {
    if (message) {
      input.classList.add('input-invalid');
    } else {
      input.classList.remove('input-invalid');
    }
  }
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function validateCheckoutForm() {
  let isValid = true;
  let firstInvalidInput = null;

  const fullName = document.getElementById('full-name').value.trim();
  const phone = document.getElementById('phone-number').value.trim();
  const email = document.getElementById('email-address').value.trim();
  const address = document.getElementById('delivery-address').value.trim();
  const city = document.getElementById('city').value.trim();
  const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');

  // Clear previous errors
  setFieldError('full-name', 'error-full-name', '');
  setFieldError('phone-number', 'error-phone-number', '');
  setFieldError('email-address', 'error-email-address', '');
  setFieldError('delivery-address', 'error-delivery-address', '');
  setFieldError('city', 'error-city', '');

  const paymentErrEl = document.getElementById('error-payment-method');
  if (paymentErrEl) paymentErrEl.textContent = '';

  if (fullName.length < 2) {
    setFieldError('full-name', 'error-full-name', 'Please enter your full name.');
    firstInvalidInput = firstInvalidInput || document.getElementById('full-name');
    isValid = false;
  }

  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    setFieldError('phone-number', 'error-phone-number', 'Please enter a valid phone number (10 to 15 digits).');
    firstInvalidInput = firstInvalidInput || document.getElementById('phone-number');
    isValid = false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    setFieldError('email-address', 'error-email-address', 'Please enter a valid email address.');
    firstInvalidInput = firstInvalidInput || document.getElementById('email-address');
    isValid = false;
  }

  if (address.length < 8) {
    setFieldError('delivery-address', 'error-delivery-address', 'Please enter your complete delivery address.');
    firstInvalidInput = firstInvalidInput || document.getElementById('delivery-address');
    isValid = false;
  }

  if (city.length < 2) {
    setFieldError('city', 'error-city', 'Please enter your city.');
    firstInvalidInput = firstInvalidInput || document.getElementById('city');
    isValid = false;
  }

  if (!selectedPayment) {
    if (paymentErrEl) paymentErrEl.textContent = 'Please select one payment method.';
    isValid = false;
  }

  const formBanner = document.getElementById('checkout-form-error');
  if (!isValid) {
    if (formBanner) {
      formBanner.textContent = 'Please fix the highlighted fields below before placing your order.';
      formBanner.hidden = false;
    }
    if (firstInvalidInput) {
      firstInvalidInput.focus();
    }
  } else if (formBanner) {
    formBanner.hidden = true;
  }

  return isValid;
}

function handlePlaceOrder(event) {
  event.preventDefault();

  const cart = getCart();
  if (cart.length === 0) {
    renderCheckoutSummary();
    return;
  }

  if (!validateCheckoutForm()) {
    return;
  }

  const appliedPromo = getAppliedPromo();
  const subtotalAmount = sub(cart);
  const discountAmount = disc(subtotalAmount, appliedPromo);
  const finalTotal = total(subtotalAmount, discountAmount);

  const orderedItems = [];
  for (let i = 0; i < cart.length; i += 1) {
    const product = findProductById(cart[i].id);
    if (product) {
      orderedItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: cart[i].qty,
        lineTotal: product.price * cart[i].qty
      });
    }
  }

  const orderData = {
    orderNumber: generateUniqueOrderNumber(),
    createdAt: new Date().toLocaleString(),
    customer: {
      fullName: document.getElementById('full-name').value.trim(),
      phone: document.getElementById('phone-number').value.trim(),
      email: document.getElementById('email-address').value.trim(),
      address: document.getElementById('delivery-address').value.trim(),
      city: document.getElementById('city').value.trim(),
      instructions: document.getElementById('delivery-instructions').value.trim()
    },
    paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
    items: orderedItems,
    promoCode: appliedPromo,
    subtotal: subtotalAmount,
    discount: discountAmount,
    totalAmount: finalTotal
  };

  // Save simulated order history in localStorage
  const pastOrders = readStorage(STORAGE_KEYS.ORDERS, []);
  pastOrders.push(orderData);
  writeStorage(STORAGE_KEYS.ORDERS, pastOrders);

  // Clear the cart ONLY after successful order placement
  saveCart([]);
  saveAppliedPromo('');

  displayOrderConfirmation(orderData);
}

function displayOrderConfirmation(order) {
  const checkoutGrid = document.getElementById('checkout-main-grid');
  const confirmationSection = document.getElementById('order-confirmation-section');

  if (checkoutGrid) checkoutGrid.hidden = true;
  if (!confirmationSection) return;

  let itemsRows = '';
  for (let i = 0; i < order.items.length; i += 1) {
    const item = order.items[i];
    itemsRows +=
      '<li class="checkout-summary-item">' +
      '  <span>' + item.qty + ' &times; ' + escapeHtml(item.name) + '</span>' +
      '  <strong>' + formatPrice(item.lineTotal) + '</strong>' +
      '</li>';
  }

  confirmationSection.innerHTML =
    '<div class="card order-confirmation-card">' +
    '  <span class="order-number-pill">Order Confirmed: ' + escapeHtml(order.orderNumber) + '</span>' +
    '  <h2>Thank You for Ordering from Crumbery!</h2>' +
    '  <p>Your simulated order has been placed and your shopping cart has been cleared.</p>' +
    '  <div class="demo-note" style="margin-bottom: 1.25rem;">' +
    '    <p style="margin-bottom:0.35rem;"><strong>Customer:</strong> ' + escapeHtml(order.customer.fullName) + ' (' + escapeHtml(order.customer.phone) + ')</p>' +
    '    <p style="margin-bottom:0.35rem;"><strong>Email:</strong> ' + escapeHtml(order.customer.email) + '</p>' +
    '    <p style="margin-bottom:0.35rem;"><strong>Delivery Address:</strong> ' + escapeHtml(order.customer.address) + ', ' + escapeHtml(order.customer.city) + '</p>' +
    (order.customer.instructions
      ? '<p style="margin-bottom:0.35rem;"><strong>Delivery Instructions:</strong> ' + escapeHtml(order.customer.instructions) + '</p>'
      : '') +
    '    <p style="margin:0;"><strong>Payment Method:</strong> ' + escapeHtml(order.paymentMethod) + ' (Simulated Demo)</p>' +
    '  </div>' +
    '  <h3>Ordered Products</h3>' +
    '  <ul class="checkout-summary-items">' + itemsRows + '</ul>' +
    '  <div class="summary-row"><span>Subtotal</span><strong>' + formatPrice(order.subtotal) + '</strong></div>' +
    '  <div class="summary-row"><span>Discount' + (order.promoCode ? ' (' + escapeHtml(order.promoCode) + ')' : '') + '</span><strong>- ' + formatPrice(order.discount) + '</strong></div>' +
    '  <div class="summary-row summary-row--total"><span>Total Payable</span><span>' + formatPrice(order.totalAmount) + '</span></div>' +
    '  <div style="margin-top:1.5rem; display:flex; flex-wrap:wrap; gap:0.75rem;">' +
    '    <a href="cart.html" class="btn btn--primary">Back to Cart</a>' +
    '    <a href="account.html" class="btn btn--secondary">View Account</a>' +
    '  </div>' +
    '</div>';

  confirmationSection.hidden = false;
  confirmationSection.scrollIntoView({ behavior: 'smooth' });
}

function prefillFromLoggedInUser() {
  const user = getCurrentUser();
  if (!user) {
    return;
  }

  const nameInput = document.getElementById('full-name');
  const emailInput = document.getElementById('email-address');
  if (nameInput && !nameInput.value && user.name) {
    nameInput.value = user.name;
  }
  if (emailInput && !emailInput.value && user.email) {
    emailInput.value = user.email;
  }
}

function initCheckoutPage() {
  renderCheckoutSummary();
  prefillFromLoggedInUser();
  renderPaymentInstructions();

  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
  for (let i = 0; i < paymentRadios.length; i += 1) {
    paymentRadios[i].addEventListener('change', renderPaymentInstructions);
  }

  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handlePlaceOrder);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('checkout-page-root')) {
    initCheckoutPage();
  }
});
