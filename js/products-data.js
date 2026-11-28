/* ==========================================================================
   Crumbery Home Bakery — Shared Product Catalog
   All prices are in Pakistani Rupees (PKR / Rs.).
   ========================================================================== */

const CRUMBERY_PRODUCTS = [
  {
    id: 'country-sourdough',
    name: 'Country Sourdough Boule',
    category: 'Artisan Breads',
    price: 950,
    image: '../assets/sourdough-loaves.jpg',
    description: '36-hour slow-fermented organic sourdough with a crisp blistered crust.'
  },
  {
    id: 'garlic-focaccia',
    name: 'Roasted Garlic & Rosemary Focaccia',
    category: 'Artisan Breads',
    price: 850,
    image: '../assets/sourdough-loaves.jpg',
    description: 'Olive oil hearth focaccia topped with roasted garlic cloves and sea salt.'
  },
  {
    id: 'cinnamon-rolls',
    name: 'Brown Butter Cinnamon Rolls (Box of 4)',
    category: 'Morning Pastries',
    price: 1400,
    image: '../assets/morning-pastries.jpg',
    description: 'Warm pillowy brioche rolls swirled with cinnamon sugar and vanilla glaze.'
  },
  {
    id: 'cardamom-knots',
    name: 'Cardamom & Vanilla Brioche Knots (Box of 4)',
    category: 'Morning Pastries',
    price: 1250,
    image: '../assets/morning-pastries.jpg',
    description: 'Hand-twisted cardamom knots finished with pearl sugar.'
  },
  {
    id: 'tahini-cookies',
    name: 'Salted Tahini Chocolate Chunk Cookies (6-Pack)',
    category: 'Cookies & Treats',
    price: 1100,
    image: '../assets/cookies-treats.jpg',
    description: 'Soft-centered bakery cookies with dark chocolate chunks and sea salt.'
  },
  {
    id: 'pistachio-financiers',
    name: 'Browned Butter Pistachio Financiers (Box of 6)',
    category: 'Cookies & Treats',
    price: 1350,
    image: '../assets/cookies-treats.jpg',
    description: 'Nutty almond-flour tea cakes topped with roasted pistachios.'
  },
  {
    id: 'basque-cheesecake',
    name: 'Burnt Basque Cheesecake (6-Inch)',
    category: 'Whole Cakes',
    price: 3200,
    image: '../assets/artisan-cakes.jpg',
    description: 'Caramelized crustless vanilla cheesecake with fresh figs and thyme.'
  },
  {
    id: 'lemon-olive-cake',
    name: 'Meyer Lemon Olive Oil Cake (8-Inch)',
    category: 'Whole Cakes',
    price: 2800,
    image: '../assets/artisan-cakes.jpg',
    description: 'Bright citrus sponge baked with cold-pressed olive oil.'
  }
];

/**
 * Look up a single bakery product from the shared catalog by its ID.
 */
function findProductById(productId) {
  for (let i = 0; i < CRUMBERY_PRODUCTS.length; i += 1) {
    if (CRUMBERY_PRODUCTS[i].id === productId) {
      return CRUMBERY_PRODUCTS[i];
    }
  }
  return null;
}
