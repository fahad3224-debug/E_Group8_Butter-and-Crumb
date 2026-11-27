/**
 * Butter and Crumb — Page Rendering, Search, Allergen Tags, Quick-View & Reviews
 */

const REVIEWS_STORAGE_KEY = "butterCrumbReviews";

/**
 * Generates HTML markup for a single product card matching the paper prototype.
 */
function createProductCardHtml(product) {
  const allergenPills = product.allergens
    .map((allergen) => `<span class="bc-allergen-tag">${allergen}</span>`)
    .join("");

  return `
    <article class="bc-product-card" aria-label="${product.name}">
      <div class="bc-product-img-wrap">
        <img src="${product.image}" alt="${product.alt}" class="bc-product-img" loading="lazy">
        <span class="bc-category-badge">${product.categoryLabel}</span>
      </div>
      <h3 class="bc-product-title">${product.name}</h3>
      <p class="bc-product-price">${formatPrice(product.price)}</p>
      <p class="small text-muted mb-2">${product.description}</p>
      <div class="bc-allergen-group" aria-label="Allergens: ${product.allergens.join(", ")}">
        <span class="bc-allergen-label">Allergens:</span>
        ${allergenPills}
      </div>
      <div class="mt-auto d-flex gap-2">
        <button type="button" class="bc-btn-primary flex-grow-1" data-add-cart="${product.id}">
          Add to Cart
        </button>
        <button type="button" class="bc-btn-outline" data-quick-view="${product.id}" aria-label="View details for ${product.name}">
          Details
        </button>
      </div>
    </article>
  `;
}

/**
 * Renders a list of products into a grid container with a Bootstrap column class.
 */
function renderProductGrid(container, products, colClass) {
  if (!container) {
    return;
  }

  if (products.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = products
    .map((product) => `<div class="${colClass}">${createProductCardHtml(product)}</div>`)
    .join("");
}

/**
 * Delegated click listener for Add to Cart and Quick-View buttons across grids.
 */
function initProductCardActions() {
  document.addEventListener("click", (event) => {
    const addBtn = event.target.closest("[data-add-cart]");
    if (addBtn) {
      addToCart(addBtn.getAttribute("data-add-cart"), addBtn);
      return;
    }

    const viewBtn = event.target.closest("[data-quick-view]");
    if (viewBtn) {
      openQuickViewModal(viewBtn.getAttribute("data-quick-view"));
    }
  });
}

/**
 * Opens the Product Quick-View modal with full details and allergen notice.
 */
function openQuickViewModal(productId) {
  const product = BAKERY_PRODUCTS.find((item) => item.id === productId);
  const modalEl = document.getElementById("productQuickViewModal");
  if (!product || !modalEl || typeof bootstrap === "undefined") {
    return;
  }

  document.getElementById("quickViewTitle").textContent = product.name;
  document.getElementById("quickViewImage").src = product.image;
  document.getElementById("quickViewImage").alt = product.alt;
  document.getElementById("quickViewPrice").textContent = formatPrice(product.price);
  document.getElementById("quickViewDesc").textContent = product.description;
  document.getElementById("quickViewAllergens").innerHTML = product.allergens
    .map((a) => `<span class="bc-allergen-tag">${a}</span>`)
    .join("");

  const addModalBtn = document.getElementById("quickViewAddBtn");
  addModalBtn.onclick = () => addToCart(product.id, addModalBtn);

  bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

/* ==========================================================================
   Page 1: Menu Page Logic (Popular Products + Reviews)
   ========================================================================== */
function getStoredReviews() {
  try {
    const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!saved) {
      return [...INITIAL_REVIEWS];
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...INITIAL_REVIEWS];
  } catch (error) {
    return [...INITIAL_REVIEWS];
  }
}

function renderReviews(reviews) {
  const reviewsGrid = document.getElementById("reviewsGrid");
  const avgEl = document.getElementById("averageRatingDisplay");
  if (!reviewsGrid) {
    return;
  }

  if (avgEl && reviews.length > 0) {
    const avg = (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1);
    avgEl.textContent = `${avg} / 5 (${reviews.length} reviews)`;
  }

  reviewsGrid.innerHTML = reviews
    .map((rev) => {
      const stars = "&#9733;".repeat(rev.rating) + "&#9734;".repeat(5 - rev.rating);
      return `
        <div class="col-md-6">
          <article class="bc-review-card">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="bc-stars" aria-label="${rev.rating} out of 5 stars">${stars}</span>
              <span class="bc-review-product-pill">${rev.productName}</span>
            </div>
            <p class="mb-2">"${rev.comment}"</p>
            <div class="d-flex justify-content-between small text-muted">
              <strong style="color: var(--bc-espresso);">${rev.customerName}</strong>
              <span>${rev.date}</span>
            </div>
          </article>
        </div>
      `;
    })
    .join("");
}

function initMenuPage() {
  const popularGrid = document.getElementById("popularProductsGrid");
  const popularProducts = BAKERY_PRODUCTS.filter((item) => item.showOnMenu);
  renderProductGrid(popularGrid, popularProducts, "col-md-6");

  // Populate product dropdown in Review Form
  const reviewProductSelect = document.getElementById("reviewProduct");
  if (reviewProductSelect) {
    reviewProductSelect.innerHTML =
      '<option value="">Select a bakery item...</option>' +
      popularProducts.map((p) => `<option value="${p.name}">${p.name}</option>`).join("");
  }

  let currentReviews = getStoredReviews();
  renderReviews(currentReviews);

  // Filter reviews by product
  const filterSelect = document.getElementById("reviewFilterSelect");
  if (filterSelect) {
    filterSelect.innerHTML =
      '<option value="all">All Reviewed Items</option>' +
      [...new Set(currentReviews.map((r) => r.productName))]
        .map((name) => `<option value="${name}">${name}</option>`)
        .join("");

    filterSelect.addEventListener("change", () => {
      const selected = filterSelect.value;
      const filtered =
        selected === "all"
          ? currentReviews
          : currentReviews.filter((r) => r.productName === selected);
      renderReviews(filtered);
    });
  }

  // Review Form Validation & Submission
  const reviewForm = document.getElementById("reviewForm");
  if (reviewForm) {
    reviewForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const nameInput = document.getElementById("reviewerName");
      const productInput = document.getElementById("reviewProduct");
      const ratingInput = document.getElementById("reviewRating");
      const commentInput = document.getElementById("reviewComment");
      const feedbackEl = document.getElementById("reviewFormFeedback");

      const name = nameInput.value.trim();
      const productName = productInput.value.trim();
      const rating = Number(ratingInput.value);
      const comment = commentInput.value.trim();

      const errors = [];
      if (name.length < 2) errors.push("Please enter your name (at least 2 characters).");
      if (!productName) errors.push("Please select a product.");
      if (!(rating >= 1 && rating <= 5)) errors.push("Please select a rating between 1 and 5.");
      if (comment.length < 10) errors.push("Review comment must be at least 10 characters.");

      if (errors.length > 0) {
        feedbackEl.className = "alert alert-danger py-2 small mt-2 mb-0";
        feedbackEl.textContent = errors[0];
        return;
      }

      const newReview = {
        id: "rev-" + Date.now(),
        customerName: name,
        productName: productName,
        rating: rating,
        comment: comment,
        date: "Just now"
      };

      currentReviews = [newReview, ...currentReviews];
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(currentReviews));
      renderReviews(currentReviews);
      reviewForm.reset();

      feedbackEl.className = "alert alert-success py-2 small mt-2 mb-0";
      feedbackEl.textContent = "Thank you! Your review has been published.";
    });
  }
}

/* ==========================================================================
   Page 2: Cakes Page Logic (Vertical Prototype: Live Search + 2-Column Grid)
   ========================================================================== */
function initCakesPage() {
  const cakesGrid = document.getElementById("cakesGrid");
  const searchInput = document.getElementById("cakesSearchInput");
  const clearBtn = document.getElementById("clearCakesSearch");
  const emptyState = document.getElementById("cakesEmptyState");
  const emptyQuerySpan = document.getElementById("cakesEmptyQuery");
  const resetBtn = document.getElementById("resetCakesSearchBtn");
  const countLabel = document.getElementById("cakesResultCount");
  const sortSelect = document.getElementById("cakesSortSelect");

  const allCakes = BAKERY_PRODUCTS.filter((item) => item.showOnCakes);

  function updateCakesView() {
    const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
    const sortMode = sortSelect ? sortSelect.value : "default";

    if (clearBtn) {
      clearBtn.classList.toggle("d-none", query.length === 0);
    }

    let filtered = allCakes.filter((cake) =>
      cake.name.toLowerCase().includes(query) ||
      cake.description.toLowerCase().includes(query)
    );

    if (sortMode === "price-asc") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortMode === "price-desc") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }

    if (countLabel) {
      countLabel.textContent =
        query.length > 0
          ? `Showing ${filtered.length} cake${filtered.length === 1 ? "" : "s"} for "${searchInput.value.trim()}"`
          : `Showing all ${filtered.length} cakes`;
    }

    if (filtered.length === 0) {
      cakesGrid.innerHTML = "";
      emptyState.classList.remove("d-none");
      if (emptyQuerySpan) {
        emptyQuerySpan.textContent = searchInput.value.trim();
      }
    } else {
      emptyState.classList.add("d-none");
      renderProductGrid(cakesGrid, filtered, "col-md-6");
    }
  }

  function resetSearch() {
    if (searchInput) searchInput.value = "";
    if (sortSelect) sortSelect.value = "default";
    updateCakesView();
    if (searchInput) searchInput.focus();
  }

  if (searchInput) searchInput.addEventListener("input", updateCakesView);
  if (sortSelect) sortSelect.addEventListener("change", updateCakesView);
  if (clearBtn) clearBtn.addEventListener("click", resetSearch);
  if (resetBtn) resetBtn.addEventListener("click", resetSearch);

  updateCakesView();
}

/* ==========================================================================
   Page 3: Breads Page Logic (3-Column Grid + Search + Allergen Filter)
   ========================================================================== */
function initBreadsPage() {
  const breadsGrid = document.getElementById("breadsGrid");
  const searchInput = document.getElementById("breadsSearchInput");
  const clearBtn = document.getElementById("clearBreadsSearch");
  const emptyState = document.getElementById("breadsEmptyState");
  const resetBtn = document.getElementById("resetBreadsFilterBtn");
  const countLabel = document.getElementById("breadsResultCount");
  const filterChips = document.querySelectorAll("[data-bread-filter]");

  const allBreads = BAKERY_PRODUCTS.filter((item) => item.showOnBreads);
  let activeFilter = "all";

  function updateBreadsView() {
    const query = (searchInput ? searchInput.value : "").trim().toLowerCase();

    if (clearBtn) {
      clearBtn.classList.toggle("d-none", query.length === 0);
    }

    const filtered = allBreads.filter((bread) => {
      const matchesQuery =
        bread.name.toLowerCase().includes(query) ||
        bread.description.toLowerCase().includes(query);

      if (!matchesQuery) return false;
      if (activeFilter === "dairy-free") {
        return !bread.allergens.includes("Milk");
      }
      if (activeFilter === "milk-enriched") {
        return bread.allergens.includes("Milk");
      }
      return true;
    });

    if (countLabel) {
      countLabel.textContent = `Showing ${filtered.length} of ${allBreads.length} freshly baked breads`;
    }

    if (filtered.length === 0) {
      breadsGrid.innerHTML = "";
      emptyState.classList.remove("d-none");
    } else {
      emptyState.classList.add("d-none");
      renderProductGrid(breadsGrid, filtered, "col-lg-4 col-md-6");
    }
  }

  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      filterChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      activeFilter = chip.getAttribute("data-bread-filter");
      updateBreadsView();
    });
  });

  function resetBreads() {
    if (searchInput) searchInput.value = "";
    activeFilter = "all";
    filterChips.forEach((c) => c.classList.toggle("active", c.getAttribute("data-bread-filter") === "all"));
    updateBreadsView();
  }

  if (searchInput) searchInput.addEventListener("input", updateBreadsView);
  if (clearBtn) clearBtn.addEventListener("click", resetBreads);
  if (resetBtn) resetBtn.addEventListener("click", resetBreads);

  updateBreadsView();
}

/* ==========================================================================
   Bootstrap App Initialization
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderCartDrawer();
  initCartDrawerEvents();
  initProductCardActions();

  const pageName = document.body.getAttribute("data-page");
  if (pageName === "menu") initMenuPage();
  if (pageName === "cakes") initCakesPage();
  if (pageName === "breads") initBreadsPage();
});
