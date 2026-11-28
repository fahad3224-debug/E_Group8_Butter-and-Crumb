/**
 * Reusable localStorage persistence helpers for Crumbery cart and editable PKR prices.
 */
window.CrumberyStorage = (function () {
  const CART_KEY = "crumbery_traditional_sweets_cart_v1";
  const PRICES_KEY = "crumbery_traditional_sweets_prices_v1";

  function safeRead(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Ignore storage quota or private-mode errors gracefully
    }
  }

  return {
    getCart() {
      const items = safeRead(CART_KEY, []);
      return Array.isArray(items)
        ? items.filter((item) => item && typeof item.id === "string" && Number(item.qty) > 0)
        : [];
    },

    saveCart(cart) {
      safeWrite(CART_KEY, cart);
    },

    getCustomPrices() {
      return safeRead(PRICES_KEY, {});
    },

    saveCustomPrice(id, price) {
      const prices = safeRead(PRICES_KEY, {});
      prices[id] = price;
      safeWrite(PRICES_KEY, prices);
      return prices;
    },

    resetCustomPrices() {
      try {
        window.localStorage.removeItem(PRICES_KEY);
      } catch (error) {
        // Ignore gracefully
      }
      return {};
    }
  };
})();
