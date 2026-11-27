/**
 * Sweet Rewards page (rewards.html).
 * Renders the member's points, tier progress, tier cards, rewards catalogue and
 * points history from REWARDS in config.js. No sign-in: there is one member profile.
 */

import { REWARDS } from './config.js';
import { getMember, getTierForPoints, redeemPoints } from './store.js';

const $ = (sel) => document.querySelector(sel);
const fmt = (n) => Math.abs(n).toLocaleString('en-PK');
const esc = (str) => String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const TIER_ICONS = {
  crumb: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="16" fill="#FCEBD8" stroke="#3B2314" stroke-width="2"/><ellipse cx="18" cy="22" rx="9" ry="5" fill="#C9503A"/><rect x="11" y="14" width="14" height="8" rx="3" fill="#F3D9BF"/><rect x="14" y="11" width="8" height="5" rx="2" fill="#F3D9BF"/></svg>',
  loaf: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="16" fill="#F8E08E" stroke="#3B2314" stroke-width="2"/><rect x="8" y="15" width="20" height="10" rx="4" fill="#C9503A"/><ellipse cx="18" cy="15" rx="10" ry="5" fill="#F3D9BF" stroke="#3B2314" stroke-width="1.2"/><path d="M13 12 Q18 8 23 12" stroke="#3B2314" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>',
  crust: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="16" fill="#5B2A4A" stroke="#3B2314" stroke-width="2"/><ellipse cx="18" cy="21" rx="11" ry="6" fill="#C9503A"/><ellipse cx="18" cy="17" rx="11" ry="6" fill="#F3D9BF" stroke="#3B2314" stroke-width="1"/><ellipse cx="18" cy="13" rx="11" ry="6" fill="#F8E08E" stroke="#3B2314" stroke-width="1"/><circle cx="18" cy="9" r="2.5" fill="#FCEBD8" stroke="#3B2314" stroke-width="1"/></svg>',
};

let historyFilter = 'all';
let pendingReward = null;
let shownBalance = null;

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/* ---------- hero ---------- */

function renderHero(member, tier) {
  $('#heroTierBadge').textContent = tier.name;
  $('#heroMemberGreeting').textContent = member.name;
  $('#heroLifetime').textContent = `Lifetime: ${fmt(member.lifetime)} pts`;

  // Count the balance up (or down after redeeming)
  const el = $('#heroPointsCount');
  const from = shownBalance ?? 0;
  const to = member.balance;
  shownBalance = to;
  if (reduceMotion || from === to) {
    el.textContent = `${fmt(to)} pts`;
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / 700);
    el.textContent = `${fmt(Math.round(from + (to - from) * (1 - (1 - t) ** 3)))} pts`;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- progress to next tier ---------- */

function renderProgress(member, tier) {
  const tiers = REWARDS.tiers;
  const next = tiers[tiers.indexOf(tier) + 1];
  if (next) {
    const span = next.minPoints - tier.minPoints;
    const pct = Math.min(100, Math.round(((member.lifetime - tier.minPoints) / span) * 100));
    $('#progressHeading').textContent = `Progress to ${next.name} Tier`;
    $('#pointsToNextText').textContent = `${fmt(next.minPoints - member.lifetime)} points to ${next.name}`;
    $('#tierProgressFill').style.width = `${pct}%`;
  } else {
    $('#progressHeading').textContent = `${tier.name} Tier`;
    $('#pointsToNextText').textContent = 'You’ve reached the top tier';
    $('#tierProgressFill').style.width = '100%';
  }
  $('.tier-progress-track').setAttribute('role', 'progressbar');
  $('.tier-progress-track').setAttribute('aria-valuenow', $('#tierProgressFill').style.width.replace('%', ''));
  $('.tier-progress-track').setAttribute('aria-valuemin', '0');
  $('.tier-progress-track').setAttribute('aria-valuemax', '100');

  // Next points to expire: the oldest points still earned within the expiry window
  const oldest = member.history.filter((h) => h.points > 0).at(-1);
  if (oldest) {
    const expires = new Date(oldest.date);
    expires.setMonth(expires.getMonth() + REWARDS.pointsExpireMonths);
    $('#expiringPointsNote').textContent = `${fmt(oldest.points)} points expire on ${formatDate(expires.toISOString())}.`;
  } else {
    $('#expiringPointsNote').textContent = '';
  }
}

/* ---------- tier cards ---------- */

function renderTiers(member, current) {
  $('#tierCountLabel').textContent = REWARDS.tiers.length;
  $('#tiersGrid').innerHTML = REWARDS.tiers
    .map((t) => {
      const isCurrent = t.id === current.id;
      const locked = member.lifetime < t.minPoints;
      const threshold = t.minPoints === 0 ? 'Start earning on your first order' : `Unlock at ${fmt(t.minPoints)} Sweet Points`;
      return `
        <div class="col-12 col-md-4">
          <div class="tier-card tier-card--${t.id}${isCurrent ? ' is-current' : ''}${locked ? ' is-locked' : ''}">
            ${isCurrent ? '<span class="sticker sticker--terracotta sticker--sm tier-card__current-label">Current Tier</span>' : ''}
            <div class="tier-card__icon" aria-hidden="true">${TIER_ICONS[t.id] || ''}</div>
            <div class="tier-card__badge">${t.label}${locked ? ' · Locked' : ''}</div>
            <h3 class="tier-card__name">${t.name}</h3>
            <div class="tier-card__discount">${Math.round(t.discountRate * 100)}% off</div>
            <ul class="tier-card__perks">
              <li>Rs ${fmt(t.discountRate * 1000)} saved per Rs 1,000 order</li>
              ${t.perks.map((p) => `<li>${p}</li>`).join('')}
            </ul>
            <div class="tier-card__threshold">${threshold}</div>
          </div>
        </div>`;
    })
    .join('');
}

/* ---------- rewards catalogue ---------- */

function renderCatalog(member) {
  $('#redeemCatalog').innerHTML = REWARDS.redemptions
    .map((r) => {
      const short = r.cost - member.balance;
      return `
        <div class="col-12 col-md-4">
          <article class="product-card">
            <div class="product-card__media"><img src="${r.image}" alt="${esc(r.title)}" loading="lazy"></div>
            <div class="product-card__cat">${r.category}</div>
            <h3 class="product-card__title">${r.title}</h3>
            <div class="product-card__footer">
              <span class="product-card__price">${fmt(r.cost)} pts</span>
              ${
                short > 0
                  ? `<button type="button" class="pill-btn pill-btn--sm" disabled>Need ${fmt(short)} pts</button>`
                  : `<button type="button" class="pill-btn pill-btn--sm" data-redeem="${r.id}">Redeem +</button>`
              }
            </div>
          </article>
        </div>`;
    })
    .join('');
}

/* ---------- points history ---------- */

function renderHistory(member) {
  const rows = member.history.filter((h) => historyFilter === 'all' || (historyFilter === 'earned' ? h.points > 0 : h.points < 0));
  $('#pointsHistoryTable tbody').innerHTML = rows.length
    ? rows
        .map(
          (h) => `
        <tr>
          <td>${formatDate(h.date)}</td>
          <td>${esc(h.label)}</td>
          <td class="text-end fw-bold ${h.points > 0 ? 'text-success' : 'text-terracotta'}">${h.points > 0 ? '+' : '−'}${fmt(h.points)} pts</td>
        </tr>`
        )
        .join('')
    : `<tr><td colspan="3" class="text-center small opacity-75 py-3">Nothing here yet.</td></tr>`;

  document.querySelectorAll('[data-history-filter]').forEach((b) => {
    const on = b.dataset.historyFilter === historyFilter;
    b.classList.toggle('pill-btn--outline', !on);
    b.setAttribute('aria-pressed', String(on));
  });
}

/* ---------- render everything ---------- */

function render() {
  const member = getMember();
  const tier = getTierForPoints(member.lifetime);
  renderHero(member, tier);
  renderProgress(member, tier);
  renderTiers(member, tier);
  renderCatalog(member);
  renderHistory(member);
}

/* ---------- events ---------- */

const modal = new bootstrap.Modal($('#redeemModal'));

$('#redeemCatalog').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-redeem]');
  if (!btn) return;
  pendingReward = REWARDS.redemptions.find((r) => r.id === btn.dataset.redeem);
  const member = getMember();
  $('#redeemModalTitle').textContent = `Redeem ${pendingReward.title}?`;
  $('#redeemModalBody').innerHTML = `This uses <strong>${fmt(pendingReward.cost)} Sweet Points</strong>. You’ll have ${fmt(member.balance - pendingReward.cost)} points left. Your tier stays the same.`;
  modal.show();
});

$('#redeemConfirmBtn').addEventListener('click', () => {
  if (pendingReward && redeemPoints(pendingReward)) render();
  pendingReward = null;
  modal.hide();
});

document.querySelectorAll('[data-history-filter]').forEach((b) =>
  b.addEventListener('click', () => {
    historyFilter = b.dataset.historyFilter;
    renderHistory(getMember());
  })
);

render();
