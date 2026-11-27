# Crumbery Bakery Website

A 3-page website for **Crumbery**, a homemade bakery in **F-7 Markaz, Islamabad, Pakistan**.

## Pages
1. **Cake Studio** (`index.html`) — Interactive 3D cake customiser built with pure CSS 3D transforms.
2. **Sweet Rewards** (`rewards.html`) — Member sign-in, points balance, membership tiers, and reward redemptions.
3. **Delivery & Bill Estimator** (`estimate.html`) — Menu browser, delivery/pickup selector, schedule & ETA calculator, and instant bill estimate.

## How to Run Locally
1. Open the project folder in **VS Code**.
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **"Open with Live Server"** (ES modules do not load over `file://`).

## Tech Used
- HTML5, CSS3, Vanilla JavaScript (ES Modules)
- Bootstrap 5.3 (layout grid, modals, offcanvas, tabs, accordion, carousel)
- Google Fonts (`Bricolage Grotesque`, `Bagel Fat One`, `Gluten`, `DM Sans`)
- Pure CSS 3D transforms (`perspective`, `preserve-3d`, `rotateX/Y`, `translateZ`) for the Cake Studio 3D viewer

## Folder Structure
```
/
├── index.html
├── rewards.html
├── estimate.html
├── css/
│   ├── tokens.css
│   ├── components.css
│   └── pages/
│       ├── studio.css
│       ├── rewards.css
│       └── estimate.css
├── js/
│   ├── config.js
│   ├── format.js
│   ├── store.js
│   ├── layout.js
│   ├── studio.js
│   ├── rewards.js
│   ├── estimate.js
│   ├── data/
│   │   └── menu.js
│   └── cake/
│       ├── cake3d.js
│       └── pricing.js
├── assets/images/
└── README.md
```

## How the 3D Cake Works
The 3D cake in `js/cake/cake3d.js` is built from DOM elements inside a `perspective: 1100px` viewport using `transform-style: preserve-3d`. Round layers use 32 angled facets arranged in a cylinder, square layers use 8 half-faces, and each facet computes directional shading every frame. Layers separate smoothly along the Y-axis, and cutting a slice hides one quarter of the facets and masks the discs with `conic-gradient`.

## Image Credits
All product and marquee photography is served from local files in `assets/images/` (royalty-free stock images).

## Features

| Feature | Category | Page | Member |
|---|---|---|---|
| Shared striped header, offcanvas menu, and footer | Responsive & Accessible | All pages | Member 1 |
| Newsletter form with email validation | Forms & Input | All pages | Member 1 |
| Signed-in member greeting and sign-out in header | State & Memory | All pages | Member 2 |
| 11-step cake customiser rendered from config | Data & Display | index.html | Member 1 |
| Pure CSS 3D cake viewer (drag, wheel, keyboard, explode, slice, layer select) | Interaction | index.html | Member 1 |
| Customiser steps rendered once; option clicks update active state only (no focus loss) | Interaction | index.html | Member 1 |
| Custom colour picker stays open across multiple colour changes | Interaction | index.html | Member 1 |
| Reset view also resets slice button text and aria-pressed state | Interaction | index.html | Member 1 |
| "Surprise me" picks 0–3 unique toppings (no duplicate charges) | Logic & Calculation | index.html | Member 1 |
| Inspector, estimator item name, and "Topped with" use readable labels (not raw ids) | Data & Display | index.html | Member 1 |
| Notes textarea text safely escaped before DOM insertion | Security | index.html | Member 1 |
| Layer-separation slider uses terracotta accent colour; filling colour dot visible on selected chip | UI | index.html | Member 1 |
| Live cake pricing, breakdown, lead time, and Sweet Points preview | Logic & Calculation | index.html | Member 1 |
| Cake message input with 24-character limit and counter | Forms & Input | index.html | Member 1 |
| Cake draft persistence and saved designs with canvas thumbnails | State & Memory | index.html | Member 1 |
| Custom cake passed to Delivery & Bill Estimator | State & Memory | index.html | Member 1 |
| Sign-in and Create Account with live validation (Bootstrap is-invalid/is-valid borders) and password strength meter | Forms & Input | rewards.html | Member 2 |
| Password strength scoring and SHA-256 hashing | Logic & Calculation | rewards.html | Member 2 |
| Tier driven by lifetime points (never decreases on redemption); balance is separate spendable pool | Logic & Calculation | rewards.html | Member 2 |
| Dashboard shows both spendable balance and lifetime points | Data & Display | rewards.html | Member 2 |
| Tiers, redemptions, and points history rendered from config | Data & Display | rewards.html | Member 2 |
| Tier progress bar and points count-up animation | Logic & Calculation | rewards.html | Member 2 |
| Reward redemption modal and history filter chips | Interaction | rewards.html | Member 2 |
| Ways to Earn section (4 icon cards: spend, design, birthday, refer) | Data & Display | rewards.html | Member 2 |
| Rewards FAQ accordion (4 questions about earning, demotion, expiry, stacking) | Data & Display | rewards.html | Member 2 |
| Member session, points, and history persisted across pages | State & Memory | rewards.html | Member 2 |
| Menu rendered from data with SVG category icon badges, search, sort, and details modal | Data & Display | estimate.html | Member 3 |
| All product images served from local `assets/images/` files | UI | estimate.html | Member 3 |
| Recently viewed items and estimate state restored after reload | State & Memory | estimate.html | Member 3 |
| Delivery/pickup toggle, geolocation, sector select, and street validation | Forms & Input | estimate.html | Member 3 |
| Earliest valid start time respects opening hours, 8 PM same-day cut-off, and custom-cake lead time | Logic & Calculation | estimate.html | Member 3 |
| ETA shows date when delivery is not today; custom-cake slot rounded to next slot | Logic & Calculation | estimate.html | Member 3 |
| Distance-based delivery fee, member tier discount, tax, and peak-hour ETA | Logic & Calculation | estimate.html | Member 3 |
| Same-day cut-off countdown timer and custom-cake earliest date | Interaction | estimate.html | Member 3 |
| Mobile-first layouts, keyboard controls, `aria-live` regions, reduced motion | Responsive & Accessible | All pages | Member 3 |
