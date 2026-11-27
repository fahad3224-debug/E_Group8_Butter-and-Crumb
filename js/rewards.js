import { REWARDS } from './config.js';
import { getMember, setMember, getAccounts, saveAccount } from './store.js';
import { initLayout } from './layout.js';

initLayout();

const root = document.getElementById('rewards-root');
let historyFilter = 'all';
let pendingRedemption = null;

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function scorePassword(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Weak', pct: 30, color: 'var(--terracotta)', tip: 'Use 8+ chars with upper, lower, and a number.' };
  if (score <= 3) return { label: 'Fair', pct: 65, color: '#D99B26', tip: 'Add a symbol to make it strong.' };
  return { label: 'Strong', pct: 100, color: '#2F7D4C', tip: 'Great password.' };
}

/** Tier is based on LIFETIME points, not spendable balance. */
function getTierInfo(lifetimePoints) {
  let current = REWARDS.tiers[0];
  let next = null;
  for (let i = 0; i < REWARDS.tiers.length; i++) {
    if (lifetimePoints >= REWARDS.tiers[i].minPoints) {
      current = REWARDS.tiers[i];
      next = REWARDS.tiers[i + 1] || null;
    }
  }
  return { current, next };
}

function renderAuth() {
  root.innerHTML = `
    <div class="rewards-auth-card">
      <ul class="nav nav-pills nav-fill mb-4" id="rewardsAuthTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="tab-signin" data-bs-toggle="pill" data-bs-target="#pane-signin" type="button" role="tab">Sign in</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab-signup" data-bs-toggle="pill" data-bs-target="#pane-signup" type="button" role="tab">Create account</button>
        </li>
      </ul>
      <div class="tab-content">
        <div class="tab-pane fade show active" id="pane-signin" role="tabpanel">
          <form id="signin-form" novalidate class="d-grid gap-3">
            <div>
              <label for="signin-email" class="form-label fw-bold small">Email</label>
              <input id="signin-email" type="email" class="form-control" required>
            </div>
            <div>
              <label for="signin-password" class="form-label fw-bold small">Password</label>
              <input id="signin-password" type="password" class="form-control" required>
            </div>
            <div id="signin-error" class="small text-terracotta" aria-live="polite"></div>
            <button type="submit" class="btn-pill">Sign in <span class="arrow">→</span></button>
          </form>
        </div>
        <div class="tab-pane fade" id="pane-signup" role="tabpanel">
          <form id="signup-form" novalidate class="d-grid gap-3">
            <div>
              <label for="signup-name" class="form-label fw-bold small">Full name</label>
              <input id="signup-name" type="text" class="form-control" required>
              <div class="invalid-feedback" id="err-name">Please enter your name.</div>
            </div>
            <div>
              <label for="signup-email" class="form-label fw-bold small">Email</label>
              <input id="signup-email" type="email" class="form-control" required>
              <div class="invalid-feedback" id="err-email">Enter a valid email address.</div>
            </div>
            <div>
              <label for="signup-phone" class="form-label fw-bold small">Pakistani mobile (03XX-XXXXXXX)</label>
              <input id="signup-phone" type="tel" class="form-control" placeholder="0300-1234567" required>
              <div class="invalid-feedback" id="err-phone">Format: 03XX-XXXXXXX</div>
            </div>
            <div>
              <label for="signup-password" class="form-label fw-bold small">Password</label>
              <input id="signup-password" type="password" class="form-control" required>
              <div class="strength-meter mt-2"><div id="strength-fill" class="strength-meter__fill"></div></div>
              <div id="strength-text" class="small text-choco-muted mt-1" aria-live="polite"></div>
            </div>
            <div>
              <label for="signup-confirm" class="form-label fw-bold small">Confirm password</label>
              <input id="signup-confirm" type="password" class="form-control" required>
              <div class="invalid-feedback" id="err-confirm">Passwords do not match.</div>
            </div>
            <button type="submit" class="btn-pill">Create account (+${REWARDS.signupBonus} pts) <span class="arrow">→</span></button>
          </form>
        </div>
      </div>
    </div>
  `;

  function setValid(input, valid) {
    input.classList.toggle('is-invalid', !valid);
    input.classList.toggle('is-valid', valid);
  }

  const pwInput = document.getElementById('signup-password');
  const confirmInput = document.getElementById('signup-confirm');
  const emailInput = document.getElementById('signup-email');
  const phoneInput = document.getElementById('signup-phone');
  const nameInput = document.getElementById('signup-name');

  pwInput.addEventListener('input', () => {
    const s = scorePassword(pwInput.value);
    const fill = document.getElementById('strength-fill');
    fill.style.width = `${s.pct}%`;
    fill.style.backgroundColor = s.color;
    document.getElementById('strength-text').textContent = `${s.label}: ${s.tip}`;
    setValid(pwInput, pwInput.value.length >= 8);
  });

  emailInput.addEventListener('input', () => setValid(emailInput, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())));
  phoneInput.addEventListener('input', () => setValid(phoneInput, /^03\d{2}-?\d{7}$/.test(phoneInput.value.trim())));
  nameInput.addEventListener('input', () => setValid(nameInput, nameInput.value.trim().length >= 2));
  confirmInput.addEventListener('input', () => setValid(confirmInput, confirmInput.value === pwInput.value && confirmInput.value.length > 0));

  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const phone = phoneInput.value.trim();
    const pw = pwInput.value;
    const confirm = confirmInput.value;

    let ok = true;
    if (name.length < 2) { setValid(nameInput, false); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setValid(emailInput, false); ok = false; }
    if (!/^03\d{2}-?\d{7}$/.test(phone)) { setValid(phoneInput, false); ok = false; }
    if (pw.length < 8) { setValid(pwInput, false); ok = false; }
    if (pw !== confirm) { setValid(confirmInput, false); ok = false; }
    if (!ok) return;

    const passwordHash = await hashPassword(pw);
    const signupPts = REWARDS.signupBonus + 420; // seed realistic history
    const newMember = {
      name,
      email,
      phone,
      passwordHash,
      balance: signupPts,         // spendable balance
      lifetimePoints: signupPts,  // never decreases — drives tier
      history: [
        { id: 'h1', type: 'earned', title: 'Welcome bonus', points: REWARDS.signupBonus, date: 'Today' },
        { id: 'h2', type: 'earned', title: 'Sourdough & Croissant order (F-7)', points: 240, date: '3 days ago' },
        { id: 'h3', type: 'earned', title: 'Custom 1 kg Cake', points: 180, date: 'Last week' }
      ]
    };
    saveAccount(newMember);
    setMember(newMember);
    window.location.reload();
  });

  document.getElementById('signin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value.trim().toLowerCase();
    const pw = document.getElementById('signin-password').value;
    const err = document.getElementById('signin-error');
    const account = getAccounts().find((a) => a.email.toLowerCase() === email);
    if (!account) { err.textContent = 'No account found with that email.'; return; }
    const hash = await hashPassword(pw);
    if (hash !== account.passwordHash) { err.textContent = 'Incorrect password.'; return; }
    setMember(account);
    window.location.reload();
  });
}

function renderDashboard(member) {
  // Support both old (points-only) and new (balance + lifetimePoints) accounts
  if (member.lifetimePoints === undefined) {
    member.lifetimePoints = member.points || 0;
  }
  if (member.balance === undefined) {
    member.balance = member.points || 0;
  }

  const { current, next } = getTierInfo(member.lifetimePoints);
  const hero = document.getElementById('rewards-hero');
  if (hero) {
    hero.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <span class="sticker mb-2">${current.name} tier</span>
          <h1 class="font-display display-hero mb-2">Your <span class="text-terracotta">Sweet Rewards</span></h1>
          <p class="fs-5 mb-0">Welcome back, <strong>${member.name}</strong></p>
        </div>
        <div class="text-md-end">
          <div class="small text-uppercase fw-bold text-choco-muted">Points Balance</div>
          <div id="points-counter" class="font-display text-terracotta" style="font-size: clamp(2.5rem, 5vw, 4rem);">0</div>
          <div class="small text-choco-muted">Lifetime earned: ${member.lifetimePoints.toLocaleString()} pts</div>
        </div>
      </div>
    `;
    animateCount(document.getElementById('points-counter'), member.balance);
  }

  const progressPct = next
    ? Math.min(100, Math.round(((member.lifetimePoints - current.minPoints) / (next.minPoints - current.minPoints)) * 100))
    : 100;
  const progressText = next
    ? `${next.minPoints - member.lifetimePoints} points to ${next.name}`
    : `You've reached ${current.name}`;

  const filteredHistory = (member.history || []).filter((h) => historyFilter === 'all' || h.type === historyFilter);

  root.innerHTML = `
    <section class="mb-5">
      <div class="d-flex justify-content-between small fw-bold mb-2">
        <span>${current.name}</span>
        <span>${progressText}</span>
      </div>
      <div class="rewards-progress" role="progressbar" aria-valuenow="${progressPct}" aria-valuemin="0" aria-valuemax="100">
        <div class="rewards-progress__bar" style="width: ${progressPct}%;"></div>
      </div>
    </section>

    <section class="mb-5">
      <h2 class="font-display display-section mb-3">Membership <span class="text-terracotta">Tiers</span></h2>
      <div class="row g-3">
        ${REWARDS.tiers.map((t) => {
          const isCurrent = t.id === current.id;
          const isLocked = member.lifetimePoints < t.minPoints;
          return `
            <div class="col-md-6 col-lg-3">
              <div class="tier-card ${isCurrent ? 'is-current' : ''} ${isLocked ? 'is-locked' : ''}">
                ${isCurrent ? '<span class="sticker sticker--terracotta mb-2">Current tier</span>' : ''}
                ${isLocked ? '<span class="small fw-bold text-choco-muted d-block mb-2">🔒 Locked</span>' : ''}
                <h3 class="font-display fs-3 mb-1">${t.name}</h3>
                <p class="small fw-bold text-choco-muted mb-2">${t.minPoints.toLocaleString()} pts · ${t.discountPct}% off</p>
                <ul class="small ps-3 mb-0">${t.perks.map((p) => `<li>${p}</li>`).join('')}</ul>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>

    <section class="mb-5">
      <h2 class="font-display display-section mb-3">Ways to <span class="text-terracotta">Earn</span></h2>
      <div class="row g-3">
        ${[
          { icon: '🛍️', title: 'Every Rs 100 spent', desc: 'Earn 5 Sweet Points on every order at the counter or via delivery.' },
          { icon: '🎂', title: 'Design a custom cake', desc: 'Get 50 bonus points every time you save a design in the Cake Studio.' },
          { icon: '🎉', title: 'Birthday treat', desc: 'Double points on your birthday month. Update your profile to activate.' },
          { icon: '🤝', title: 'Refer a friend', desc: 'Share your referral link. You both earn 100 bonus points when they sign up.' }
        ].map((w) => `
          <div class="col-md-6 col-lg-3">
            <div class="p-3 h-100 rounded-4" style="background: var(--tan);">
              <div class="fs-2 mb-2">${w.icon}</div>
              <h3 class="fs-6 fw-bold mb-1">${w.title}</h3>
              <p class="small text-choco-muted mb-0">${w.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <section class="mb-5">
      <h2 class="font-display display-section mb-3">Redeem <span class="text-terracotta">Rewards</span></h2>
      <p class="small text-choco-muted mb-3">Balance: <strong>${member.balance.toLocaleString()} pts</strong></p>
      <div class="row g-3">
        ${REWARDS.redemptions.map((r) => {
          const canAfford = member.balance >= r.points;
          return `
            <div class="col-md-6 col-lg-3">
              <div class="product-card">
                <span class="product-card__cat">${r.points} Sweet Points</span>
                <h3 class="product-card__title">${r.name}</h3>
                <p class="small text-choco-muted mb-3">${r.description}</p>
                <div class="product-card__footer">
                  <button type="button" class="btn-pill btn-pill--sm w-100" data-redeem="${r.id}" ${canAfford ? '' : 'disabled'}>
                    ${canAfford ? 'Redeem' : `Need ${r.points - member.balance} more pts`}
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>

    <section class="mb-5">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 class="font-display display-section mb-0">Points <span class="text-terracotta">History</span></h2>
        <div class="d-flex gap-2">
          ${['all', 'earned', 'redeemed'].map((f) => `
            <button type="button" class="chip ${historyFilter === f ? 'is-active' : ''}" data-hfilter="${f}" aria-pressed="${historyFilter === f}">
              ${f[0].toUpperCase() + f.slice(1)}
            </button>
          `).join('')}
        </div>
      </div>
      <div class="d-grid gap-2">
        ${filteredHistory.length === 0
          ? '<p class="text-choco-muted">No activity in this filter.</p>'
          : filteredHistory.map((h) => `
            <div class="p-3 rounded-4 d-flex justify-content-between align-items-center" style="background: var(--tan);">
              <div>
                <div class="fw-bold">${h.title}</div>
                <div class="small text-choco-muted">${h.date}</div>
              </div>
              <div class="fw-bold ${h.type === 'earned' ? 'text-success' : 'text-terracotta'}">
                ${h.type === 'earned' ? '+' : '−'}${h.points} pts
              </div>
            </div>
          `).join('')}
      </div>
    </section>

    <section class="mb-5">
      <h2 class="font-display display-section mb-3">Rewards <span class="text-terracotta">FAQ</span></h2>
      <div class="accordion crumbery-faq" id="rewardsFaq">
        ${[
          { q: 'How do I earn Sweet Points?', a: 'You earn 5 Sweet Points for every Rs 100 spent on any Crumbery order. You also get 150 bonus points when you create your account.' },
          { q: 'Does redeeming points lower my tier?', a: 'No. Your membership tier is based on your lifetime earned points, which never go down. Redeeming only reduces your spendable balance.' },
          { q: 'When do my points expire?', a: 'Sweet Points are valid for 12 months from the date they were earned. Points redeemed as vouchers follow the voucher expiry date.' },
          { q: 'Can I use a tier discount and redeem a reward on the same order?', a: 'Yes! Your tier discount applies to the estimator automatically, and you can apply a redeemed voucher on top of it.' }
        ].map((item, i) => `
          <div class="accordion-item">
            <h3 class="accordion-header">
              <button class="accordion-button${i > 0 ? ' collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#rfaq${i}">
                ${item.q}
              </button>
            </h3>
            <div id="rfaq${i}" class="accordion-collapse collapse${i === 0 ? ' show' : ''}" data-bs-parent="#rewardsFaq">
              <div class="accordion-body">${item.a}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <div class="modal fade" id="redeemModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="background: var(--cream); color: var(--choco); border-radius: 24px;">
          <div class="modal-header border-0">
            <h3 class="modal-title font-display fs-3">Confirm Redemption</h3>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="redeemModalBody"></div>
          <div class="modal-footer border-0">
            <button type="button" class="btn-pill btn-pill--outline btn-pill--sm" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn-pill btn-pill--sm" id="confirm-redeem-btn">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  `;

  root.querySelectorAll('[data-hfilter]').forEach((btn) => {
    btn.addEventListener('click', () => { historyFilter = btn.dataset.hfilter; renderDashboard(member); });
  });

  const modalEl = document.getElementById('redeemModal');
  const modal = window.bootstrap ? new window.bootstrap.Modal(modalEl) : null;

  root.querySelectorAll('[data-redeem]').forEach((btn) => {
    btn.addEventListener('click', () => {
      pendingRedemption = REWARDS.redemptions.find((r) => r.id === btn.dataset.redeem);
      if (!pendingRedemption) return;
      document.getElementById('redeemModalBody').textContent =
        `Redeem "${pendingRedemption.name}" for ${pendingRedemption.points} Sweet Points?`;
      modal?.show();
    });
  });

  document.getElementById('confirm-redeem-btn')?.addEventListener('click', () => {
    if (!pendingRedemption || member.balance < pendingRedemption.points) return;
    // Deduct from spendable balance only; lifetimePoints stays the same
    member.balance -= pendingRedemption.points;
    // Keep legacy .points in sync for other pages that read it
    member.points = member.balance;
    member.history.unshift({
      id: `h-${Date.now()}`,
      type: 'redeemed',
      title: `Redeemed: ${pendingRedemption.name}`,
      points: pendingRedemption.points,
      date: 'Just now'
    });
    setMember(member);
    saveAccount(member);
    modal?.hide();
    renderDashboard(member);
  });
}

function animateCount(el, target) {
  if (!el) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { el.textContent = target.toLocaleString(); return; }
  const start = performance.now();
  const duration = 500;
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    el.textContent = Math.round(target * t).toLocaleString();
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const member = getMember();
if (member) renderDashboard(member);
else renderAuth();
