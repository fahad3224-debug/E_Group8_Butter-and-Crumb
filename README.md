# Crumbery Bakery — Islamabad

A 3-page responsive website for **Crumbery**, a homemade bakery in **F-7 Markaz, Islamabad, Pakistan**. Built with semantic HTML5, custom CSS3, vanilla ES modules, Bootstrap 5.3, and an **interactive 3D cake built with pure CSS 3D transforms** (no 3D libraries).

## How to Run Locally

Because this project uses native ES modules (`<script type="module">`), it must be served over HTTP rather than opened directly with `file://`.

```bash
# Option 1: Python built-in HTTP server
python -m http.server 8000
# Then open http://localhost:8000

# Option 2: VS Code Live Server extension
# Right-click index.html -> "Open with Live Server"
```

## Tech Used

- **HTML5, CSS3, Vanilla JavaScript (ES Modules)**
- **Bootstrap 5.3** (grid, utilities, offcanvas, modals, accordion)
- **CSS 3D cake** (`js/cake/cake3d.js`): each sponge layer is a cylinder of thin shaded facets plus top and bottom discs, with fillings between them. Drag to turn, scroll or use the slider to separate the layers, tap a layer to change its sponge, and cut a slice to see the cross-section. No WebGL or 3D libraries.
- **Google Fonts**: `Bricolage Grotesque`, `Bagel Fat One`, `Gluten`, `DM Sans`

## Folder Structure

```text
/
├── index.html          → Cake Studio (3D cake customizer)
├── rewards.html        → Rewards & membership
├── estimate.html       → Delivery & bill estimator
├── css/
│   ├── tokens.css      → custom properties, fonts
│   ├── components.css  → shared components & signature shapes
│   └── pages/          → page-specific styles
├── js/
│   ├── config.js       → prices, tax, tiers, delivery zones, hours
│   ├── format.js       → PKR currency + time formatting helpers
│   ├── data/menu.js    → menu items
│   ├── store.js        → localStorage persistence
│   ├── layout.js       → shared header/footer + active nav
│   ├── cake/           → cake3d.js (3D cake), pricing.js (price, lead time, descriptions)
│   ├── studio.js       → Cake Studio page: options, summary, saving, add to estimate
│   ├── rewards.js
│   └── estimate.js
├── assets/images/ , assets/icons/
└── README.md
```

## Features Table

| Feature | Category | Page | Member |
|---|---|---|---|
| Shared striped frame, wavy hero, offcanvas nav & newsletter footer | Responsive & Accessible | All pages | [TBD] |
| Footer newsletter email validation & feedback | Forms & Input | All pages | [TBD] |
| Cake Studio responsive layout: 3D stage + numbered build steps | Responsive & Accessible | index.html | [TBD] |
| Cake options rendered from config (shape, size, layers, sponge, filling, finish, colour, toppings, dietary) | Data & Display | index.html | [TBD] |
| Interactive 3D cake: drag to turn, separate layers, per-layer sponge, cut a slice, keyboard controls | Interaction | index.html | [TBD] |
| Live cake price breakdown, lead time and Sweet Points preview | Logic & Calculation | index.html | [TBD] |
| Cake message (24-char limit with counter) and notes | Forms & Input | index.html | [TBD] |
| Cake draft and saved designs (with thumbnails) kept in localStorage; custom cake sent to the estimator | State & Memory | index.html | [TBD] |
| Rewards dashboard layout, tier cards & FAQ accordion | Data & Display | rewards.html | [TBD] |
| Estimator 4-step layout & scalloped paper-receipt summary card | Responsive & Accessible | estimate.html | [TBD] |
| Menu catalog filtering, sorting, product modal & recently viewed items | Data & Display | estimate.html | [TBD] |
| 4-step estimator validation, GPS/sector distance & pickup/delivery toggle | Forms & Input | estimate.html | [TBD] |
| PKR bill calculation, peak-hour ETA range & same-day countdown timer | Logic & Calculation | estimate.html | [TBD] |
| Persistent estimator cart, step progress & recently viewed in localStorage | State & Memory | estimate.html | [TBD] |

## Image Credits

All placeholder photography is royalty-free from [Unsplash](https://unsplash.com):
- `assets/images/hero-cake.jpg` — Layered chocolate berry cake
- `assets/images/sourdough-boule.jpg` — Artisan sourdough boule
- `assets/images/croissant.jpg` — Butter croissant
- `assets/images/cheesecake.jpg` — Berry cheesecake
- `assets/images/focaccia.jpg` — Rosemary focaccia
- `assets/images/brownie.jpg` — Chocolate fudge brownie
- `assets/images/baker-story.jpg` — Baker in kitchen
- `assets/images/berry-danish.jpg` — Berry pastry & baked goods
