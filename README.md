# Crumbery Bakery Website

A 3-page website for **Crumbery**, a homemade bakery in **F-7 Markaz, Islamabad, Pakistan**.

## Pages
1. **Cake Studio** (`index.html`) — Interactive 3D cake customiser built with pure CSS 3D transforms.
2. **Sweet Rewards** (`rewards.html`) — Points balance, tier progress, membership tiers, reward redemptions, and points history (no sign-in needed).
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
| Cake Studio layout: 3D stage with numbered build steps | Responsive & Accessible | index.html | Member 1 |
| Cake options (shape, size, layers, sponge, filling, finish, colour, toppings, dietary) rendered from config | Data & Display | index.html | Member 1 |
| Pure CSS 3D cake: drag to turn, open layers, tap a layer to change its sponge, cut a slice, keyboard controls | Interaction | index.html | Member 1 |
| Live cake price breakdown, lead time, and Sweet Points preview at the member's tier rate | Logic & Calculation | index.html | Member 1 |
| Cake message with 24-character limit and counter, plus notes | Forms & Input | index.html | Member 1 |
| Cake draft and saved designs (with canvas thumbnails) kept between visits; custom cake sent to the estimator | State & Memory | index.html | Member 1 |
| Points balance, lifetime points, tier badge, and count-up animation | Data & Display | rewards.html | Member 2 |
| Tier cards, rewards catalogue, and points history rendered from config | Data & Display | rewards.html | Member 2 |
| Tier based on lifetime points, so redeeming never lowers it; progress to next tier and points expiry | Logic & Calculation | rewards.html | Member 2 |
| Redeem confirmation modal, history filters (All / Earned / Redeemed), and FAQ accordion | Interaction | rewards.html | Member 2 |
| Points balance, tier, and history kept between visits and shared with the estimator | State & Memory | rewards.html | Member 2 |
| Estimator layout with numbered sections and scalloped receipt summary card | Responsive & Accessible | estimate.html | Member 3 |
| Menu filtering, search, sorting, product details modal, and recently viewed items | Data & Display | estimate.html | Member 3 |
| Delivery/pickup toggle, GPS or sector distance, address and schedule inputs | Forms & Input | estimate.html | Member 3 |
| PKR bill with tier discount, distance-based delivery fee (free above the tier threshold), tax, peak-hour ETA range, and points earned | Logic & Calculation | estimate.html | Member 3 |
| Same-day cut-off countdown timer | Interaction | estimate.html | Member 3 |
| Estimate items and recently viewed items restored after reload | State & Memory | estimate.html | Member 3 |
| Mobile-first layouts, keyboard controls, `aria-live` regions, reduced motion | Responsive & Accessible | All pages | Member 3 |
