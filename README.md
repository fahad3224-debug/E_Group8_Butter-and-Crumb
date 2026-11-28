# Crumbery — Traditional Sweets, World of Desserts & Gluten-Free Desserts

A responsive, 3-page dessert showcase website for **Crumbery** built with semantic HTML, modular CSS, and vanilla JavaScript.

## Project Structure

```text
butter-and-crumb-p3/
├── index.html                  # Traditional Sweets Collection (10 South Asian sweets)
├── world-of-desserts.html      # World of Desserts (16 global desserts across 6 continents)
├── gluten-free-desserts.html   # Gluten-Free Desserts (6 treats + "Why Choose" section)
├── css/
│   └── styles.css              # Shared theme variables (#4A2C1D, #C8553D, #F2C14E, #FDF1DF) & responsive layout
├── js/
│   ├── data.js                 # Unified catalog (32 total desserts across all 3 pages)
│   ├── storage.js              # Reusable localStorage helpers for cart & custom PKR prices
│   └── app.js                  # Shared card renderer, search, filters, editable PKR prices & cart drawer
└── assets/
    └── images/                 # Food photography for all 32 desserts
```

## Features

- **Warm Crumbery Theme**: Crust Brown (`#4A2C1D`), Terracotta (`#C8553D`), Mustard (`#F2C14E`), and Cream (`#FDF1DF`).
- **Traditional Sweets Collection (`index.html`)**: 10 traditional sweets with vegetarian/gluten-free badges and editable PKR pricing.
- **World of Desserts (`world-of-desserts.html`)**: 16 iconic desserts across **Asia**, **Africa**, **Europe**, **North America**, **South America**, and **Oceania** with continent category filtering.
- **Gluten-Free Desserts (`gluten-free-desserts.html`)**: 6 gluten-free desserts with Gluten-Free badges, editable PKR prices, and the *"Why Choose Our Gluten-Free Treats?"* section.
- **Synchronized Cart & Pricing**: Adding items or editing PKR prices on any page synchronizes automatically via `localStorage`.

## How to Run in VS Code

1. Open the project folder (`butter-and-crumb-p3`) in **Visual Studio Code** (`File` → `Open Folder...`).
2. Install the **Live Server** extension (`ritwickdey.LiveServer`) from the Extensions panel (`Ctrl+Shift+X`).
3. Open `index.html`, `world-of-desserts.html`, or `gluten-free-desserts.html` and click **Go Live** in the bottom-right status bar.
