# Crumbery Bakery — Islamabad

A 3-page responsive website for **Crumbery**, a homemade bakery in **F-7 Markaz, Islamabad, Pakistan**. Built with semantic HTML5, custom CSS3, vanilla ES modules, Bootstrap 5.3, and a **hand-written WebGL2 PBR renderer** (zero 3D or math libraries).

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
- **Hand-written WebGL2 Engine** (`js/gl/`) — custom `vec3`/`mat4` math, lathe/wedge/rounded-box/heart geometry builders, procedural canvas textures + normal maps, Cook-Torrance GGX PBR shader with Charlie sheen, clearcoat, wrap subsurface scattering, 3×3 PCF shadow mapping, and ACES filmic tone mapping.
- **Google Fonts**: `Bricolage Grotesque`, `Bagel Fat One`, `Gluten`, `DM Sans`

## Folder Structure

```text
/
├── index.html          → Cake Studio (WebGL2 customizer)
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
│   ├── gl/             → hand-written WebGL2 engine
│   ├── cake/           → cake model, options, pricing, studio UI
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

## Image Credits

*(Images will be listed with royalty-free sources as they are added in upcoming commits.)*
