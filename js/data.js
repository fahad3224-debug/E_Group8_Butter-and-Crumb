/**
 * Butter and Crumb — Product & Review Data
 * All product cards and initial customer reviews are rendered from these arrays
 * so the website is data-driven rather than hardcoded in HTML.
 */

const BAKERY_PRODUCTS = [
  {
    id: "black-forest-cake",
    name: "Black Forest Cake",
    category: "cakes",
    categoryLabel: "Cake",
    price: 2000,
    allergens: ["Wheat", "Milk", "Eggs"],
    image: "../images/black-forest-cake.jpg",
    alt: "Layered Black Forest Cake with whipped cream, chocolate shavings, and cherries",
    description: "Rich chocolate sponge layered with fresh whipped cream, sweet cherries, and dark chocolate curls.",
    showOnMenu: true,
    showOnCakes: true,
    showOnBreads: false
  },
  {
    id: "mango-cake",
    name: "Mango Cake",
    category: "cakes",
    categoryLabel: "Cake",
    price: 2500,
    allergens: ["Wheat", "Milk", "Eggs"],
    image: "../images/mango-cake.jpg",
    alt: "Fresh Mango Cake topped with diced golden mangoes and smooth cream",
    description: "Light vanilla sponge layered with chilled mango mousse and fresh seasonal mango cubes.",
    showOnMenu: true,
    showOnCakes: true,
    showOnBreads: false
  },
  {
    id: "chocolate-cake",
    name: "Chocolate Cake",
    category: "cakes",
    categoryLabel: "Cake",
    price: 1500,
    allergens: ["Wheat", "Milk", "Eggs"],
    image: "../images/chocolate-cake.svg",
    alt: "Homemade dark Chocolate Cake frosted with glossy ganache",
    description: "Moist homemade cocoa sponge finished with silky dark chocolate fudge ganache.",
    showOnMenu: false,
    showOnCakes: true,
    showOnBreads: false
  },
  {
    id: "red-velvet-cake",
    name: "Red Velvet Cake",
    category: "cakes",
    categoryLabel: "Cake",
    price: 2000,
    allergens: ["Wheat", "Milk", "Eggs"],
    image: "../images/red-velvet-cake.svg",
    alt: "Classic Red Velvet Cake with smooth cream cheese frosting",
    description: "Velvety cocoa-tinted sponge paired with tangy homemade cream cheese frosting.",
    showOnMenu: false,
    showOnCakes: true,
    showOnBreads: false
  },
  {
    id: "pineapple-cake",
    name: "Pineapple Cake",
    category: "cakes",
    categoryLabel: "Cake",
    price: 1700,
    allergens: ["Wheat", "Milk", "Eggs"],
    image: "../images/pineapple-cake.jpg",
    alt: "Fresh cream Pineapple Cake garnished with pineapple slices",
    description: "Soft sponge soaked in pineapple syrup and topped with whipped cream and golden pineapple.",
    showOnMenu: false,
    showOnCakes: true,
    showOnBreads: false
  },
  {
    id: "strawberry-cake",
    name: "Strawberry Cake",
    category: "cakes",
    categoryLabel: "Cake",
    price: 1700,
    allergens: ["Wheat", "Milk", "Eggs"],
    image: "../images/strawberry-cake.jpg",
    alt: "Homemade Strawberry Cake topped with fresh red strawberries",
    description: "Delicate berry-infused cream cake crowned with fresh glazed strawberries.",
    showOnMenu: false,
    showOnCakes: true,
    showOnBreads: false
  },
  {
    id: "vanilla-cake",
    name: "Vanilla Cake",
    category: "cakes",
    categoryLabel: "Cake",
    price: 1200,
    allergens: ["Wheat", "Milk", "Eggs"],
    image: "../images/vanilla-cake.svg",
    alt: "Classic Vanilla Cake with smooth ivory buttercream frosting",
    description: "Timeless pure vanilla bean sponge finished with whipped buttercream.",
    showOnMenu: false,
    showOnCakes: true,
    showOnBreads: false
  },
  {
    id: "white-bread",
    name: "White Bread",
    category: "breads",
    categoryLabel: "Bread",
    price: 250,
    allergens: ["Wheat", "Milk"],
    image: "../images/white-bread.jpg",
    alt: "Freshly baked soft golden homemade White Bread loaf",
    description: "Soft, pillowy everyday sandwich loaf baked fresh every morning with real butter.",
    showOnMenu: true,
    showOnCakes: false,
    showOnBreads: true
  },
  {
    id: "garlic-bread",
    name: "Garlic Bread",
    category: "breads",
    categoryLabel: "Bread",
    price: 350,
    allergens: ["Wheat"],
    image: "../images/garlic-bread.svg",
    alt: "Warm toasted Garlic Bread slices brushed with garlic and herbs",
    description: "Crisp golden slices infused with roasted garlic, fresh parsley, and olive oil.",
    showOnMenu: true,
    showOnCakes: false,
    showOnBreads: true
  },
  {
    id: "brown-bread",
    name: "Brown Bread",
    category: "breads",
    categoryLabel: "Bread",
    price: 300,
    allergens: ["Wheat"],
    image: "../images/brown-bread.svg",
    alt: "Wholesome whole-wheat Brown Bread loaf",
    description: "Hearty 100% whole-wheat loaf with a tender crumb and nutty crust.",
    showOnMenu: false,
    showOnCakes: false,
    showOnBreads: true
  },
  {
    id: "multigrain-bread",
    name: "Multigrain Bread",
    category: "breads",
    categoryLabel: "Bread",
    price: 350,
    allergens: ["Wheat"],
    image: "../images/multigrain-bread.svg",
    alt: "Artisanal Multigrain Bread topped with rolled oats and seeds",
    description: "Wholesome loaf packed with flax, sesame, sunflower seeds, and rolled oats.",
    showOnMenu: false,
    showOnCakes: false,
    showOnBreads: true
  },
  {
    id: "french-bread",
    name: "French Bread",
    category: "breads",
    categoryLabel: "Bread",
    price: 350,
    allergens: ["Wheat"],
    image: "../images/french-bread.jpg",
    alt: "Crispy golden-brown artisanal French Bread baguette",
    description: "Crackling golden crust with an airy, chewy center baked in small batches.",
    showOnMenu: false,
    showOnCakes: false,
    showOnBreads: true
  },
  {
    id: "milk-bread",
    name: "Milk Bread",
    category: "breads",
    categoryLabel: "Bread",
    price: 300,
    allergens: ["Wheat", "Milk"],
    image: "../images/milk-bread.svg",
    alt: "Soft and fluffy golden homemade Milk Bread loaf",
    description: "Extra-soft, lightly sweet loaf enriched with warm farm milk.",
    showOnMenu: false,
    showOnCakes: false,
    showOnBreads: true
  },
  {
    id: "cupcakes",
    name: "Cupcakes",
    category: "treats",
    categoryLabel: "Treat",
    price: 500,
    allergens: ["Wheat", "Milk", "Eggs"],
    image: "../images/cupcakes.svg",
    alt: "Box of freshly baked Cupcakes with swirled chocolate and vanilla frosting",
    description: "Box of 4 handcrafted cupcakes topped with rich buttercream swirls.",
    showOnMenu: true,
    showOnCakes: false,
    showOnBreads: false
  },
  {
    id: "croissant",
    name: "Croissant",
    category: "treats",
    categoryLabel: "Pastry",
    price: 300,
    allergens: ["Wheat", "Milk", "Eggs"],
    image: "../images/croissant.svg",
    alt: "Flaky golden-brown freshly baked butter Croissant",
    description: "Flaky, layered French-style pastry baked with pure cultured butter.",
    showOnMenu: true,
    showOnCakes: false,
    showOnBreads: false
  }
];

const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    customerName: "Ayesha Tariq",
    productName: "Black Forest Cake",
    rating: 5,
    comment: "The sponge was super soft and not overly sweet. Ordered it for a family dinner and everyone asked where it was from.",
    date: "2 days ago"
  },
  {
    id: "rev-2",
    customerName: "Hamza Siddiqui",
    productName: "Garlic Bread",
    rating: 5,
    comment: "Warm, crispy edges, and real roasted garlic flavor. Pairs wonderfully with homemade soup.",
    date: "5 days ago"
  },
  {
    id: "rev-3",
    customerName: "Zainab Malik",
    productName: "Mango Cake",
    rating: 4,
    comment: "Fresh mango chunks on top tasted amazing and the cream was light. Allergen labels made ordering easy for my sister.",
    date: "1 week ago"
  },
  {
    id: "rev-4",
    customerName: "Bilal Ahmed",
    productName: "Croissant",
    rating: 5,
    comment: "Flaky buttery layers just like an artisan cafe. Still crisp hours after delivery.",
    date: "1 week ago"
  }
];

/**
 * Formats a number in Pakistani Rupees (e.g., 2000 -> "Rs 2,000").
 */
function formatPrice(amount) {
  return "Rs " + Number(amount).toLocaleString("en-PK");
}
