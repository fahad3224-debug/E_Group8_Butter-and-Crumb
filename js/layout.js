/**
 * Shared header/footer injector for all Crumbery pages.
 * Marks the active navigation link and wires the footer newsletter form.
 */

const NAV_LEFT = [
  { label: 'Cake Studio', href: 'index.html' },
  { label: 'Rewards', href: 'rewards.html' },
];

const NAV_RIGHT = [
  { label: 'Estimator', href: 'estimate.html' },
];

function getCurrentPage() {
  const path = window.location.pathname.split('/').pop();
  return path && path.length > 0 ? path : 'index.html';
}

function renderHeader(targetEl) {
  const current = getCurrentPage();

  const linkHtml = (item) => {
    const isActive = current === item.href;
    return `<li><a class="site-nav__link" href="${item.href}" ${isActive ? 'aria-current="page"' : ''}>${item.label}</a></li>`;
  };

  targetEl.innerHTML = `
    <nav class="site-nav" aria-label="Main navigation">
      <div class="d-none d-md-block">
        <ul class="site-nav__group site-nav__group--left">
          ${NAV_LEFT.map(linkHtml).join('')}
        </ul>
      </div>

      <div class="d-md-none">
        <button class="nav-hamburger" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileNavOffcanvas" aria-controls="mobileNavOffcanvas" aria-label="Open menu">
          Menu
        </button>
      </div>

      <a href="index.html" class="site-nav__brand wordmark" aria-label="Crumbery home">crumbery</a>

      <div class="d-none d-md-flex align-items-center justify-content-start gap-3">
        <ul class="site-nav__group site-nav__group--right">
          ${NAV_RIGHT.map(linkHtml).join('')}
        </ul>
      </div>

      <div class="d-md-none text-end">
        <a href="estimate.html" class="site-nav__link">Estimate</a>
      </div>
    </nav>

    <div class="offcanvas offcanvas-start offcanvas-crumbery" tabindex="-1" id="mobileNavOffcanvas" aria-labelledby="mobileNavLabel">
      <div class="offcanvas-header">
        <span class="offcanvas-title wordmark fs-2" id="mobileNavLabel">crumbery</span>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close navigation"></button>
      </div>
      <div class="offcanvas-body d-flex flex-column gap-3">
        <ul class="list-unstyled d-flex flex-column gap-2 mb-0">
          ${[...NAV_LEFT, ...NAV_RIGHT].map((item) => `
            <li>
              <a class="site-nav__link fs-6 d-block py-2" href="${item.href}" ${current === item.href ? 'aria-current="page"' : ''}>
                ${item.label}
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
}

function renderFooter(targetEl) {
  targetEl.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="text-center mb-5">
          <span class="sticker sticker--sm mb-3">fresh from our oven</span>
          <h2 class="display-headline display-headline--sub text-cream mb-3">Subscribe for seasonal drops</h2>
          <form class="footer-newsletter" id="footerNewsletterForm" novalidate>
            <label for="newsletterEmail" class="visually-hidden">Email address</label>
            <input id="newsletterEmail" type="email" placeholder="you@example.com" required>
            <button type="submit" class="pill-btn pill-btn--sm pill-btn--terracotta">
              Join <span class="pill-btn__arrow" aria-hidden="true">&rarr;</span>
            </button>
          </form>
          <p class="small mt-2 mb-0 text-cream opacity-75" id="newsletterFeedback" aria-live="polite"></p>
        </div>

        <div class="row g-4 align-items-start border-top border-light border-opacity-25 pt-4">
          <div class="col-12 col-md-4">
            <span class="wordmark fs-2 d-block mb-2">crumbery</span>
            <p class="small opacity-75 mb-0">
              Homemade cakes, artisan loaves, and flaky pastries baked daily in Islamabad.
            </p>
          </div>
          <div class="col-6 col-md-4">
            <h3 class="h6 text-uppercase fw-bold opacity-75 mb-3">Pages</h3>
            <ul class="list-unstyled d-flex flex-column gap-2 small">
              <li><a href="index.html" class="text-decoration-none">Cake Studio</a></li>
              <li><a href="rewards.html" class="text-decoration-none">Sweet Rewards</a></li>
              <li><a href="estimate.html" class="text-decoration-none">Delivery &amp; Bill Estimator</a></li>
            </ul>
          </div>
          <div class="col-6 col-md-4">
            <h3 class="h6 text-uppercase fw-bold opacity-75 mb-3">Islamabad Bakery</h3>
            <p class="small opacity-75 mb-2">
              Jinnah Super, F-7 Markaz, Islamabad<br>
              +92 51 555 0148 &bull; 9:00 AM – 11:00 PM
            </p>
            <div class="d-flex gap-2 mt-3">
              <a href="#top" class="social-circle" aria-label="Instagram">IG</a>
              <a href="#top" class="social-circle" aria-label="Facebook">FB</a>
              <a href="#top" class="social-circle" aria-label="WhatsApp">WA</a>
            </div>
          </div>
        </div>

        <div class="text-center small opacity-50 mt-4 pt-3 border-top border-light border-opacity-10">
          &copy; ${new Date().getFullYear()} Crumbery Bakery Islamabad. All prices in PKR.
        </div>
      </div>
    </footer>
  `;

  const form = targetEl.querySelector('#footerNewsletterForm');
  const input = targetEl.querySelector('#newsletterEmail');
  const feedback = targetEl.querySelector('#newsletterFeedback');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      feedback.textContent = 'Please enter a valid email address.';
      return;
    }
    feedback.textContent = `Thanks! ${email} is subscribed for Islamabad bake drops.`;
    input.value = '';
  });
}

export function initLayout() {
  const headerSlot = document.getElementById('siteHeaderSlot');
  const footerSlot = document.getElementById('siteFooterSlot');

  if (headerSlot) renderHeader(headerSlot);
  if (footerSlot) renderFooter(footerSlot);
}

initLayout();
