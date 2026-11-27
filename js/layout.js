import { BAKERY } from './config.js';
import { getMember, clearMember } from './store.js';

const NAV_LINKS = [
  { href: 'index.html', label: 'Cake Studio' },
  { href: 'rewards.html', label: 'Sweet Rewards' },
  { href: 'estimate.html', label: 'Estimator' }
];

function getCurrentPage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  return path === '' ? 'index.html' : path;
}

function renderMemberStatus(member) {
  if (!member) return '';
  const firstName = (member.name || 'Friend').trim().split(/\s+/)[0];
  return `
    <span class="nav-user-badge">
      <span>Hi, ${escapeHtml(firstName)}</span>
      <button type="button" class="nav-signout-btn" data-action="signout">Sign out</button>
    </span>
  `;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

export function initLayout() {
  const current = getCurrentPage();
  const member = getMember();
  const headerMount = document.getElementById('site-header');
  const footerMount = document.getElementById('site-footer');

  if (headerMount) {
    headerMount.innerHTML = `
      <a class="skip-link" href="#main-content">Skip to content</a>
      <nav class="site-nav" aria-label="Primary navigation">
        <div class="nav-group d-none d-md-flex">
          <a class="nav-link-custom ${current === 'index.html' ? 'is-active' : ''}" href="index.html">Cake Studio</a>
          <a class="nav-link-custom ${current === 'rewards.html' ? 'is-active' : ''}" href="rewards.html">Sweet Rewards</a>
        </div>
        <button class="mobile-menu-btn d-md-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileNavOffcanvas" aria-controls="mobileNavOffcanvas">
          Menu
        </button>
        <a class="wordmark fs-2" href="index.html" aria-label="Crumbery home">crumbery</a>
        <div class="nav-group nav-group--right">
          <a class="nav-link-custom d-none d-md-inline-block ${current === 'estimate.html' ? 'is-active' : ''}" href="estimate.html">Estimator</a>
          <a class="nav-link-custom d-md-none ${current === 'estimate.html' ? 'is-active' : ''}" href="estimate.html">Estimate</a>
          <span class="d-none d-md-inline-flex">${renderMemberStatus(member)}</span>
        </div>
      </nav>
      <div class="offcanvas offcanvas-start text-bg-dark" tabindex="-1" id="mobileNavOffcanvas" aria-labelledby="mobileNavLabel" style="background-color: var(--choco); color: var(--cream);">
        <div class="offcanvas-header">
          <span class="wordmark fs-3" id="mobileNavLabel">crumbery</span>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body d-flex flex-column gap-3">
          ${NAV_LINKS.map((l) => `
            <a class="nav-link-custom fs-5 ${current === l.href ? 'is-active' : ''}" href="${l.href}">${l.label}</a>
          `).join('')}
          <div class="mt-3 pt-3 border-top border-secondary">
            ${renderMemberStatus(member) || `<a class="btn-pill btn-pill--cream btn-pill--sm" href="rewards.html">Sign in <span class="arrow">→</span></a>`}
          </div>
        </div>
      </div>
    `;

    headerMount.querySelectorAll('[data-action="signout"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        clearMember();
        window.location.reload();
      });
    });
  }

  if (footerMount) {
    footerMount.className = 'site-footer';
    footerMount.innerHTML = `
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-4">
            <a class="wordmark fs-1 d-inline-block mb-2" href="index.html">crumbery</a>
            <p class="small mb-3" style="color: rgba(252,235,216,0.82);">
              Homemade cakes, flaky pastries, and sourdough baked fresh every morning in F-7 Markaz, Islamabad.
            </p>
            <div class="d-flex gap-2">
              <a class="social-icon-btn" href="#newsletter-form" aria-label="Instagram">IG</a>
              <a class="social-icon-btn" href="#newsletter-form" aria-label="Facebook">FB</a>
              <a class="social-icon-btn" href="#newsletter-form" aria-label="WhatsApp">WA</a>
            </div>
          </div>
          <div class="col-6 col-lg-2">
            <h3 class="h6 text-uppercase fw-bold mb-3" style="color: var(--butter);">Pages</h3>
            <ul class="list-unstyled d-grid gap-2 small">
              ${NAV_LINKS.map((l) => `<li><a class="footer-link" href="${l.href}">${l.label}</a></li>`).join('')}
            </ul>
          </div>
          <div class="col-6 col-lg-3">
            <h3 class="h6 text-uppercase fw-bold mb-3" style="color: var(--butter);">Visit Us</h3>
            <p class="small mb-1">${BAKERY.address}</p>
            <p class="small mb-1">${BAKERY.phone}</p>
            <p class="small mb-0">Daily: ${BAKERY.openHour}:00 AM – ${BAKERY.closeHour - 12}:00 PM</p>
          </div>
          <div class="col-lg-3">
            <h3 class="h6 text-uppercase fw-bold mb-3" style="color: var(--butter);">Fresh Bake Alerts</h3>
            <form id="newsletter-form" novalidate>
              <label for="newsletter-email" class="visually-hidden">Email address</label>
              <div class="input-group input-group-sm mb-2">
                <input id="newsletter-email" type="email" class="form-control" placeholder="you@example.com" required style="background: var(--cream); color: var(--choco); border: none;">
                <button class="btn fw-bold" type="submit" style="background: var(--terracotta); color: var(--cream);">Join</button>
              </div>
              <div id="newsletter-feedback" class="small" aria-live="polite"></div>
            </form>
          </div>
        </div>
        <hr class="my-4" style="border-color: rgba(252,235,216,0.2);">
        <p class="small mb-0 text-center" style="color: rgba(252,235,216,0.68);">© ${new Date().getFullYear()} Crumbery Bakery, Islamabad.</p>
      </div>
    `;

    const form = footerMount.querySelector('#newsletter-form');
    const emailInput = footerMount.querySelector('#newsletter-email');
    const feedback = footerMount.querySelector('#newsletter-feedback');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = emailInput.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        feedback.textContent = 'Please enter a valid email address.';
        feedback.style.color = 'var(--butter)';
        return;
      }
      feedback.textContent = 'You are on the list for fresh bake alerts.';
      feedback.style.color = 'var(--butter)';
      emailInput.value = '';
    });
  }
}
