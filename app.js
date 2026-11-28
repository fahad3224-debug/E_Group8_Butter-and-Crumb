/**
 * Crumbery Shared Application Logic
 * Powers both Traditional Sweets Collection (index.html) and World of Desserts (world-of-desserts.html)
 * using one shared cart, search, filter, and editable PKR pricing engine backed by localStorage.
 */
(function () {
  const pageMode = document.body.dataset.page || "traditional";
  const traditionalDesserts = window.CRUMBERY_DESSERTS || [];
  const worldDesserts = window.CRUMBERY_WORLD_DESSERTS || [];
  const glutenFreeDesserts = window.CRUMBERY_GLUTEN_FREE_DESSERTS || [];
  const allDesserts =
    window.CRUMBERY_ALL_DESSERTS || [...traditionalDesserts, ...worldDesserts, ...glutenFreeDesserts];
  const pageDesserts =
    pageMode === "world"
      ? worldDesserts
      : pageMode === "gluten-free"
      ? glutenFreeDesserts
      : traditionalDesserts;
  const storage = window.CrumberyStorage;

  const state = {
    searchQuery: "",
    activeFilter: "all",
    cart: storage.getCart(),
    customPrices: storage.getCustomPrices(),
    toastTimer: null
  };

  // DOM References
  const els = {
    grid: document.getElementById("desserts-grid"),
    emptyState: document.getElementById("empty-state"),
    resultsSummary: document.getElementById("results-summary"),
    searchInput: document.getElementById("dessert-search"),
    searchForm: document.getElementById("nav-search-form"),
    searchClear: document.getElementById("search-clear"),
    filterPills: document.querySelectorAll(".filter-pill"),
    resetPricesBtn: document.getElementById("reset-prices-btn"),
    clearFiltersBtn: document.getElementById("clear-filters-btn"),
    heroGfBtn: document.getElementById("hero-gf-btn"),
    navLinks: document.querySelectorAll("[data-nav]"),
    navToggle: document.getElementById("nav-toggle"),
    navPanel: document.getElementById("nav-panel"),
    cartToggle: document.getElementById("cart-toggle"),
    footerOpenCart: document.getElementById("footer-open-cart"),
    cartCount: document.getElementById("cart-count"),
    cartDrawer: document.getElementById("cart-drawer"),
    cartBackdrop: document.getElementById("cart-backdrop"),
    cartClose: document.getElementById("cart-close"),
    cartItemsContainer: document.getElementById("cart-items-container"),
    cartDrawerSubtitle: document.getElementById("cart-drawer-subtitle"),
    cartSubtotal: document.getElementById("cart-subtotal"),
    checkoutBtn: document.getElementById("checkout-btn"),
    clearCartBtn: document.getElementById("clear-cart-btn"),
    toast: document.getElementById("toast"),
    countAll: document.getElementById("count-all"),
    currentYear: document.getElementById("current-year")
  };

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */
  function formatPkr(amount) {
    return `PKR ${Number(amount).toLocaleString("en-PK")}`;
  }

  function getPrice(dessert) {
    const custom = Number(state.customPrices[dessert.id]);
    return Number.isFinite(custom) && custom > 0 ? custom : dessert.defaultPricePkr;
  }

  function getDessertById(id) {
    return allDesserts.find((item) => item.id === id);
  }

  function getTotalCartCount() {
    return state.cart.reduce((sum, entry) => sum + entry.qty, 0);
  }

  function showToast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.hidden = false;
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => {
      els.toast.hidden = true;
    }, 2400);
  }

  function buildFallbackSvg(name) {
    const safeName = encodeURIComponent(name);
    return (
      "data:image/svg+xml;utf8," +
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'>` +
      `<rect width='400' height='300' fill='%234A2C1D'/>` +
      `<circle cx='200' cy='135' r='52' fill='%23C8553D'/>` +
      `<circle cx='200' cy='135' r='26' fill='%23F2C14E'/>` +
      `<text x='200' y='230' text-anchor='middle' fill='%23FDF1DF' font-family='Georgia, serif' font-size='22'>${safeName}</text>` +
      `</svg>`
    );
  }

  /* ------------------------------------------------------------------------
     Filtering & Rendering Product Cards
     ------------------------------------------------------------------------ */
  function getFilteredDesserts() {
    const query = state.searchQuery.trim().toLowerCase();

    return pageDesserts.filter((dessert) => {
      if (pageMode === "world") {
        if (state.activeFilter !== "all" && dessert.continent !== state.activeFilter) {
          return false;
        }
      } else {
        if (state.activeFilter === "vegetarian" && !dessert.isVegetarian) return false;
        if (state.activeFilter === "gluten-free" && !dessert.glutenFree) return false;
        if (state.activeFilter === "chilled" && dessert.category !== "Chilled & Creamy") return false;
      }

      if (!query) return true;
      const haystack = `${dessert.name} ${dessert.description} ${dessert.category} ${dessert.continent || ""} ${dessert.dietary}`.toLowerCase();
      return haystack.includes(query);
    });
  }

  function createDessertCard(dessert) {
    const article = document.createElement("article");
    article.className = "dessert-card";
    article.dataset.id = dessert.id;

    const currentPrice = getPrice(dessert);
    const dietaryClass = dessert.isVegetarian ? "is-veg" : "is-nonveg";
    const rightBadge = dessert.continent
      ? `<span class="continent-tag">${dessert.continent}</span>`
      : dessert.glutenFree
      ? '<span class="gf-tag">Gluten-Free</span>'
      : "";

    article.innerHTML = `
      <div class="card-media">
        <img
          class="card-image"
          src="${dessert.image}"
          alt="${dessert.imageAlt}"
          loading="lazy"
        />
        <div class="card-badges">
          <span class="dietary-badge ${dietaryClass}">
            <span class="dietary-mark" aria-hidden="true"></span>
            ${dessert.dietary}
          </span>
          ${rightBadge}
        </div>
      </div>

      <div class="card-body">
        <div class="card-meta-row">
          <span class="card-category">${dessert.category}</span>
          <span class="card-serving">${dessert.serving}</span>
        </div>
        <h3 class="card-title">${dessert.name}</h3>
        <p class="card-description">${dessert.description}</p>

        <div class="card-footer">
          <div class="price-editor-row">
            <label class="price-label-group" for="price-${dessert.id}">
              <span class="currency-prefix">PKR</span>
              <input
                class="price-input"
                id="price-${dessert.id}"
                type="number"
                min="50"
                max="99999"
                step="10"
                value="${currentPrice}"
                aria-label="Edit price in PKR for ${dessert.name}"
              />
            </label>
            <button
              type="button"
              class="price-edit-btn"
              data-edit-price="${dessert.id}"
              aria-label="Focus price input for ${dessert.name}"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 20h9" stroke-linecap="round" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke-linejoin="round" />
              </svg>
              Edit Price
            </button>
          </div>

          <button type="button" class="add-to-cart-btn" data-add-cart="${dessert.id}">
            Add to Cart
          </button>
        </div>
      </div>
    `;

    const img = article.querySelector(".card-image");
    img.addEventListener(
      "error",
      () => {
        img.src = buildFallbackSvg(dessert.name);
      },
      { once: true }
    );

    const priceInput = article.querySelector(".price-input");
    const editBtn = article.querySelector(".price-edit-btn");
    const addBtn = article.querySelector(".add-to-cart-btn");

    editBtn.addEventListener("click", () => {
      priceInput.focus();
      priceInput.select();
    });

    const commitPrice = () => {
      const parsed = Math.round(Number(priceInput.value));
      if (!Number.isFinite(parsed) || parsed < 1) {
        priceInput.value = getPrice(dessert);
        showToast("Please enter a valid price in PKR.");
        return;
      }
      priceInput.value = parsed;
      if (parsed !== getPrice(dessert)) {
        state.customPrices = storage.saveCustomPrice(dessert.id, parsed);
        updateResetPricesVisibility();
        renderCart();
        showToast(`${dessert.name} updated to ${formatPkr(parsed)}`);
      }
    };

    priceInput.addEventListener("change", commitPrice);
    priceInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        priceInput.blur();
      }
    });

    addBtn.addEventListener("click", () => {
      commitPrice();
      addToCart(dessert.id, addBtn);
    });

    return article;
  }

  function renderDesserts() {
    if (!els.grid) return;
    const filtered = getFilteredDesserts();
    els.grid.innerHTML = "";

    if (filtered.length === 0) {
      if (els.emptyState) els.emptyState.hidden = false;
      if (els.resultsSummary) els.resultsSummary.textContent = "0 desserts found";
      return;
    }

    if (els.emptyState) els.emptyState.hidden = true;
    const fragment = document.createDocumentFragment();
    filtered.forEach((dessert) => {
      fragment.appendChild(createDessertCard(dessert));
    });
    els.grid.appendChild(fragment);

    if (els.resultsSummary) {
      let label = "traditional sweets";
      if (pageMode === "world") {
        label = state.activeFilter === "all"
          ? "international desserts across 6 continents"
          : `${state.activeFilter} desserts`;
      } else if (pageMode === "gluten-free") {
        label = "gluten-free desserts";
      } else {
        const filterLabels = {
          all: "traditional sweets",
          vegetarian: "vegetarian sweets",
          "gluten-free": "gluten-free traditional sweets",
          chilled: "chilled & creamy sweets"
        };
        label = filterLabels[state.activeFilter] || "traditional sweets";
      }

      const searchSuffix = state.searchQuery.trim()
        ? ` matching "${state.searchQuery.trim()}"`
        : "";
      els.resultsSummary.textContent = `Showing ${filtered.length} ${label}${searchSuffix}`;
    }
  }

  function updateResetPricesVisibility() {
    if (!els.resetPricesBtn) return;
    const hasCustomPrices = Object.keys(state.customPrices).length > 0;
    els.resetPricesBtn.hidden = !hasCustomPrices;
  }

  /* ------------------------------------------------------------------------
     Cart Management (Synchronized across pages via localStorage)
     ------------------------------------------------------------------------ */
  function persistAndRefreshCart() {
    storage.saveCart(state.cart);
    updateCartBadge(true);
    renderCart();
  }

  function addToCart(dessertId, buttonEl) {
    const dessert = getDessertById(dessertId);
    if (!dessert) return;

    const existing = state.cart.find((item) => item.id === dessertId);
    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({ id: dessertId, qty: 1 });
    }

    persistAndRefreshCart();
    showToast(`Added ${dessert.name} to your cart`);

    if (buttonEl) {
      buttonEl.classList.add("is-added");
      buttonEl.textContent = "Added to Cart ✓";
      window.setTimeout(() => {
        buttonEl.classList.remove("is-added");
        buttonEl.textContent = "Add to Cart";
      }, 950);
    }
  }

  function updateCartItemQty(dessertId, delta) {
    const idx = state.cart.findIndex((item) => item.id === dessertId);
    if (idx === -1) return;

    state.cart[idx].qty += delta;
    if (state.cart[idx].qty <= 0) {
      state.cart.splice(idx, 1);
    }
    persistAndRefreshCart();
  }

  function removeCartItem(dessertId) {
    state.cart = state.cart.filter((item) => item.id !== dessertId);
    persistAndRefreshCart();
  }

  function clearCart() {
    state.cart = [];
    persistAndRefreshCart();
    showToast("Cart cleared");
  }

  function updateCartBadge(animate) {
    if (!els.cartCount) return;
    const total = getTotalCartCount();
    els.cartCount.textContent = String(total);

    if (animate) {
      els.cartCount.classList.remove("is-bump");
      void els.cartCount.offsetWidth;
      els.cartCount.classList.add("is-bump");
    }
  }

  function renderCart() {
    if (!els.cartItemsContainer) return;
    const totalCount = getTotalCartCount();
    if (els.cartDrawerSubtitle) {
      els.cartDrawerSubtitle.textContent =
        totalCount === 1 ? "1 item selected" : `${totalCount} items selected`;
    }

    if (state.cart.length === 0) {
      els.cartItemsContainer.innerHTML = `
        <div class="cart-empty">
          <h3>Your Crumbery box is empty</h3>
          <p>Add traditional or international desserts to build your bespoke Crumbery box.</p>
        </div>
      `;
      if (els.cartSubtotal) els.cartSubtotal.textContent = "PKR 0";
      if (els.checkoutBtn) els.checkoutBtn.disabled = true;
      if (els.clearCartBtn) els.clearCartBtn.disabled = true;
      return;
    }

    if (els.checkoutBtn) els.checkoutBtn.disabled = false;
    if (els.clearCartBtn) els.clearCartBtn.disabled = false;

    let subtotal = 0;
    const fragment = document.createDocumentFragment();

    state.cart.forEach((entry) => {
      const dessert = getDessertById(entry.id);
      if (!dessert) return;

      const unitPrice = getPrice(dessert);
      const lineTotal = unitPrice * entry.qty;
      subtotal += lineTotal;

      const itemEl = document.createElement("div");
      itemEl.className = "cart-item";
      itemEl.innerHTML = `
        <img class="cart-item-img" src="${dessert.image}" alt="${dessert.name}" />
        <div class="cart-item-info">
          <div class="cart-item-top">
            <h4 class="cart-item-name">${dessert.name}</h4>
            <button type="button" class="cart-remove-btn" data-remove="${dessert.id}">
              Remove
            </button>
          </div>
          <span class="cart-item-price">${formatPkr(unitPrice)} &middot; ${dessert.serving}</span>
          <div class="cart-item-controls">
            <div class="qty-stepper" aria-label="Quantity for ${dessert.name}">
              <button type="button" class="qty-btn" data-qty-dec="${dessert.id}" aria-label="Decrease quantity">&minus;</button>
              <span class="qty-value">${entry.qty}</span>
              <button type="button" class="qty-btn" data-qty-inc="${dessert.id}" aria-label="Increase quantity">+</button>
            </div>
            <span class="cart-line-total">${formatPkr(lineTotal)}</span>
          </div>
        </div>
      `;

      const img = itemEl.querySelector(".cart-item-img");
      img.addEventListener(
        "error",
        () => {
          img.src = buildFallbackSvg(dessert.name);
        },
        { once: true }
      );

      itemEl.querySelector("[data-qty-dec]").addEventListener("click", () => updateCartItemQty(dessert.id, -1));
      itemEl.querySelector("[data-qty-inc]").addEventListener("click", () => updateCartItemQty(dessert.id, 1));
      itemEl.querySelector("[data-remove]").addEventListener("click", () => removeCartItem(dessert.id));

      fragment.appendChild(itemEl);
    });

    els.cartItemsContainer.innerHTML = "";
    els.cartItemsContainer.appendChild(fragment);
    if (els.cartSubtotal) els.cartSubtotal.textContent = formatPkr(subtotal);
  }

  /* ------------------------------------------------------------------------
     Drawer, Navigation & Event Binding
     ------------------------------------------------------------------------ */
  function openCartDrawer() {
    if (!els.cartDrawer || !els.cartBackdrop) return;
    els.cartDrawer.hidden = false;
    els.cartBackdrop.hidden = false;
    if (els.cartToggle) els.cartToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    if (els.cartClose) els.cartClose.focus();
  }

  function closeCartDrawer() {
    if (!els.cartDrawer || !els.cartBackdrop) return;
    els.cartDrawer.hidden = true;
    els.cartBackdrop.hidden = true;
    if (els.cartToggle) {
      els.cartToggle.setAttribute("aria-expanded", "false");
      els.cartToggle.focus();
    }
    document.body.style.overflow = "";
  }

  function setFilter(filterName) {
    state.activeFilter = filterName;
    els.filterPills.forEach((pill) => {
      const isActive = pill.dataset.filter === filterName;
      pill.classList.toggle("is-active", isActive);
      pill.setAttribute("aria-pressed", String(isActive));
    });
    renderDesserts();
  }

  function setActiveNav(navKey) {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.nav === navKey);
    });
  }

  function closeMobileMenu() {
    if (!els.navPanel || !els.navToggle) return;
    els.navPanel.classList.remove("is-open");
    els.navToggle.setAttribute("aria-expanded", "false");
  }

  function bindEvents() {
    // Search
    if (els.searchInput) {
      els.searchInput.addEventListener("input", (event) => {
        state.searchQuery = event.target.value;
        if (els.searchClear) els.searchClear.hidden = state.searchQuery.length === 0;
        renderDesserts();
      });
    }

    if (els.searchForm) {
      els.searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const collection = document.getElementById("collection");
        if (collection) collection.scrollIntoView({ behavior: "smooth" });
        closeMobileMenu();
      });
    }

    if (els.searchClear) {
      els.searchClear.addEventListener("click", () => {
        state.searchQuery = "";
        if (els.searchInput) {
          els.searchInput.value = "";
          els.searchInput.focus();
        }
        els.searchClear.hidden = true;
        renderDesserts();
      });
    }

    // Filter pills / continent buttons
    els.filterPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        setFilter(pill.dataset.filter);
      });
    });

    // Clear filters
    if (els.clearFiltersBtn) {
      els.clearFiltersBtn.addEventListener("click", () => {
        state.searchQuery = "";
        if (els.searchInput) els.searchInput.value = "";
        if (els.searchClear) els.searchClear.hidden = true;
        setFilter("all");
        setActiveNav(pageMode === "world" ? "world" : pageMode === "gluten-free" ? "gluten-free" : "home");
      });
    }

    // Reset edited prices
    if (els.resetPricesBtn) {
      els.resetPricesBtn.addEventListener("click", () => {
        state.customPrices = storage.resetCustomPrices();
        updateResetPricesVisibility();
        renderDesserts();
        renderCart();
        showToast("Restored default PKR prices");
      });
    }

    // Hero Gluten-Free CTA (on Traditional Sweets page)
    if (els.heroGfBtn) {
      els.heroGfBtn.addEventListener("click", () => {
        setFilter("gluten-free");
        setActiveNav("gluten-free");
        const collection = document.getElementById("collection");
        if (collection) collection.scrollIntoView({ behavior: "smooth" });
      });
    }

    // Navigation links (in-page filtering when staying on current page)
    els.navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const target = link.dataset.nav;
        if (pageMode === "traditional") {
          if (target === "home") {
            setActiveNav("home");
            setFilter("all");
          } else if (target === "gluten-free") {
            setActiveNav("gluten-free");
            setFilter("gluten-free");
          }
        } else if (pageMode === "world" && target === "world") {
          setActiveNav("world");
          setFilter("all");
        }
        closeMobileMenu();
      });
    });

    // Mobile menu toggle
    if (els.navToggle && els.navPanel) {
      els.navToggle.addEventListener("click", () => {
        const willOpen = !els.navPanel.classList.contains("is-open");
        els.navPanel.classList.toggle("is-open", willOpen);
        els.navToggle.setAttribute("aria-expanded", String(willOpen));
      });
    }

    // Cart Drawer controls
    if (els.cartToggle) {
      els.cartToggle.addEventListener("click", () => {
        closeMobileMenu();
        openCartDrawer();
      });
    }
    if (els.footerOpenCart) els.footerOpenCart.addEventListener("click", openCartDrawer);
    if (els.cartClose) els.cartClose.addEventListener("click", closeCartDrawer);
    if (els.cartBackdrop) els.cartBackdrop.addEventListener("click", closeCartDrawer);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && els.cartDrawer && !els.cartDrawer.hidden) {
        closeCartDrawer();
      }
    });

    if (els.clearCartBtn) els.clearCartBtn.addEventListener("click", clearCart);

    if (els.checkoutBtn) {
      els.checkoutBtn.addEventListener("click", () => {
        if (state.cart.length === 0) return;
        const totalItems = getTotalCartCount();
        const totalAmount = els.cartSubtotal ? els.cartSubtotal.textContent : "PKR 0";
        state.cart = [];
        storage.saveCart(state.cart);
        updateCartBadge(true);
        if (els.cartDrawerSubtitle) els.cartDrawerSubtitle.textContent = "Order confirmed";
        if (els.cartSubtotal) els.cartSubtotal.textContent = "PKR 0";
        els.checkoutBtn.disabled = true;
        if (els.clearCartBtn) els.clearCartBtn.disabled = true;
        if (els.cartItemsContainer) {
          els.cartItemsContainer.innerHTML = `
            <div class="order-confirmation">
              <h3>Thank you for your order!</h3>
              <p>
                We have received your Crumbery dessert order (${totalItems} item${totalItems > 1 ? "s" : ""},
                total <strong>${totalAmount}</strong>). Your treats are being freshly packed.
              </p>
            </div>
          `;
        }
      });
    }

    // Sync cart and custom prices across open tabs/windows
    window.addEventListener("storage", (event) => {
      if (event.key === "crumbery_traditional_sweets_cart_v1") {
        state.cart = storage.getCart();
        updateCartBadge(false);
        renderCart();
      } else if (event.key === "crumbery_traditional_sweets_prices_v1") {
        state.customPrices = storage.getCustomPrices();
        updateResetPricesVisibility();
        renderDesserts();
        renderCart();
      }
    });
  }

  /* ------------------------------------------------------------------------
     Init
     ------------------------------------------------------------------------ */
  function init() {
    if (els.countAll) els.countAll.textContent = String(pageDesserts.length);
    if (els.currentYear) els.currentYear.textContent = String(new Date().getFullYear());

    // Apply URL query filter when navigating from another page (e.g. ?filter=gluten-free or ?continent=Asia)
    const params = new URLSearchParams(window.location.search);
    const initialFilter = params.get("filter");
    const initialContinent = params.get("continent");

    if (pageMode === "traditional" && initialFilter === "gluten-free") {
      state.activeFilter = "gluten-free";
      setActiveNav("gluten-free");
      els.filterPills.forEach((pill) => {
        const isActive = pill.dataset.filter === "gluten-free";
        pill.classList.toggle("is-active", isActive);
        pill.setAttribute("aria-pressed", String(isActive));
      });
    } else if (pageMode === "world" && initialContinent) {
      const validContinents = ["Asia", "Africa", "Europe", "North America", "South America", "Oceania"];
      if (validContinents.includes(initialContinent)) {
        state.activeFilter = initialContinent;
        els.filterPills.forEach((pill) => {
          const isActive = pill.dataset.filter === initialContinent;
          pill.classList.toggle("is-active", isActive);
          pill.setAttribute("aria-pressed", String(isActive));
        });
      }
    }

    updateResetPricesVisibility();
    updateCartBadge(false);
    renderDesserts();
    renderCart();
    bindEvents();
  }

  init();
})();
