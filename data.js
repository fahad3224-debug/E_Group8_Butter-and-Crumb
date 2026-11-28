/**
 * Crumbery Unified Desserts Catalog
 * Shared across Traditional Sweets Collection (index.html) and World of Desserts (world-of-desserts.html)
 * so cart items and custom prices stay synchronized across every page via localStorage.
 */
window.CRUMBERY_DESSERTS = [
  {
    id: "gulab-jamun",
    name: "Gulab Jamun",
    description:
      "Warm, melt-in-the-mouth milk-solid dumplings delicately simmered in fragrant rosewater and green cardamom syrup.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: false,
    category: "Syrup Classics",
    serving: "Box of 6 pcs",
    defaultPricePkr: 650,
    image: "assets/images/gulab-jamun.jpg",
    imageAlt: "Golden-brown Gulab Jamun soaked in rose-cardamom syrup topped with crushed pistachios"
  },
  {
    id: "rasgulla",
    name: "Rasgulla",
    description:
      "Feather-light, spongy cottage cheese spheres poached in a crystal-clear, gently sweetened saffron syrup.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: true,
    category: "Syrup Classics",
    serving: "Box of 6 pcs",
    defaultPricePkr: 600,
    image: "assets/images/rasgulla.jpg",
    imageAlt: "Soft snowy-white Rasgulla dumplings served in light syrup with saffron strands"
  },
  {
    id: "kaju-katli",
    name: "Kaju Katli",
    description:
      "Silky diamond-cut cashew fudge stone-ground with pure cane sugar and finished with delicate edible silver leaf.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: true,
    category: "Artisanal Fudge",
    serving: "250g Gift Box",
    defaultPricePkr: 1150,
    image: "assets/images/kaju-katli.jpg",
    imageAlt: "Diamond-shaped Kaju Katli cashew fudge slices adorned with silver leaf"
  },
  {
    id: "halwa",
    name: "Halwa",
    description:
      "Slow-roasted golden halwa enriched with pure desi ghee, toasted almonds, cashews, and aromatic cardamom.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: false,
    category: "Warm Classics",
    serving: "300g Bowl",
    defaultPricePkr: 720,
    image: "assets/images/halwa.jpg",
    imageAlt: "Rich golden Halwa garnished with slivered almonds, pistachios, and cashews"
  },
  {
    id: "shahi-tukda",
    name: "Shahi Tukda",
    description:
      "Ghee-crisped brioche triangles steeped in velvety saffron rabri, finished with crushed pistachios and rose petals.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: false,
    category: "Royal Puddings",
    serving: "2 Royal Slices",
    defaultPricePkr: 850,
    image: "assets/images/shahi-tukda.jpg",
    imageAlt: "Shahi Tukda topped with thick saffron rabri cream, pistachios, and rose petals"
  },
  {
    id: "jalebi",
    name: "Jalebi",
    description:
      "Crisp, golden fermented spirals fried fresh and dipped in warm saffron-infused syrup for a crackling bite.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: false,
    category: "Crispy Delights",
    serving: "250g Fresh Pack",
    defaultPricePkr: 520,
    image: "assets/images/jalebi.jpg",
    imageAlt: "Crispy golden spiral Jalebi glistening in warm saffron syrup with pistachio flakes"
  },
  {
    id: "kheer",
    name: "Kheer",
    description:
      "Heirloom basmati rice slow-simmered in whole milk with saffron, green cardamom, and roasted almond slivers.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: true,
    category: "Chilled & Creamy",
    serving: "250ml Clay Matka",
    defaultPricePkr: 580,
    image: "assets/images/kheer.jpg",
    imageAlt: "Creamy saffron Kheer rice pudding served in an earthy clay bowl with nuts"
  },
  {
    id: "rasmalai",
    name: "Rasmalai",
    description:
      "Tender chhena medallions chilled in thickened saffron-pistachio milk cream for a rich, floral finish.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: true,
    category: "Chilled & Creamy",
    serving: "4 Chilled Patties",
    defaultPricePkr: 780,
    image: "assets/images/rasmalai.jpg",
    imageAlt: "Rasmalai patties resting in chilled saffron milk cream with crushed pistachios"
  },
  {
    id: "kulfi",
    name: "Kulfi",
    description:
      "Dense, slow-reduced caramelized milk ice cream rolled in hand-crushed Iranian pistachios and saffron threads.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: true,
    category: "Chilled & Creamy",
    serving: "2 Malai Cones",
    defaultPricePkr: 490,
    image: "assets/images/kulfi.jpg",
    imageAlt: "Traditional pistachio Malai Kulfi cones garnished with crushed pistachios"
  },
  {
    id: "falooda",
    name: "Falooda",
    description:
      "Layered chilled rose milk, silky vermicelli, sweet basil seeds, ruby jelly, and a scoop of creamy malai kulfi.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: false,
    category: "Chilled & Creamy",
    serving: "Tall Royal Glass",
    defaultPricePkr: 680,
    image: "assets/images/falooda.jpg",
    imageAlt: "Layered pink Rose Falooda dessert drink topped with kulfi and pistachios"
  }
];

window.CRUMBERY_WORLD_DESSERTS = [
  // Asia
  {
    id: "baklava",
    name: "Baklava",
    continent: "Asia",
    description:
      "Crisp, honey-glazed layers of golden phyllo pastry generously filled with roasted pistachios and walnuts.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: false,
    category: "Asia",
    serving: "6 Pastry Squares",
    defaultPricePkr: 1250,
    image: "assets/images/baklava.jpg",
    imageAlt: "Golden layered Baklava pastry filled with crushed pistachios"
  },
  {
    id: "mochi",
    name: "Mochi",
    continent: "Asia",
    description:
      "Pillow-soft Japanese glutinous rice cakes delicately dusted and filled with sweet red bean and cream.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: true,
    category: "Asia",
    serving: "Box of 4 pcs",
    defaultPricePkr: 950,
    image: "assets/images/mochi.jpg",
    imageAlt: "Soft traditional Japanese Mochi rice cakes"
  },
  {
    id: "matcha-roll-cake",
    name: "Matcha Roll Cake",
    continent: "Asia",
    description:
      "Airy Kyoto green tea sponge cake rolled around lightly whipped Chantilly cream for a balanced earthy sweetness.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: false,
    category: "Asia",
    serving: "2 Thick Slices",
    defaultPricePkr: 1080,
    image: "assets/images/matcha-roll-cake.jpg",
    imageAlt: "Green tea Matcha Roll Cake swirled with light whipped cream"
  },

  // Africa
  {
    id: "malva-pudding",
    name: "Malva Pudding",
    continent: "Africa",
    description:
      "Warm South African caramelized sponge pudding infused with apricot jam and drenched in velvety butter-cream sauce.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: false,
    category: "Africa",
    serving: "Warm Portion",
    defaultPricePkr: 890,
    image: "assets/images/malva-pudding.jpg",
    imageAlt: "Warm caramelized South African Malva Pudding served with cream sauce"
  },

  // Europe
  {
    id: "bougatsa",
    name: "Bougatsa",
    continent: "Europe",
    description:
      "Flaky Greek phyllo pastry baked around silky vanilla semolina custard and dusted with icing sugar and cinnamon.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: false,
    category: "Europe",
    serving: "2 Warm Squares",
    defaultPricePkr: 920,
    image: "assets/images/bougatsa.jpg",
    imageAlt: "Flaky golden Greek Bougatsa pastry"
  },
  {
    id: "tiramisu",
    name: "Tiramisu",
    continent: "Europe",
    description:
      "Classic Italian espresso-soaked savoiardi layered with whipped mascarpone mousse and dark Dutch cocoa.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: false,
    category: "Europe",
    serving: "220g Dessert Cup",
    defaultPricePkr: 1180,
    image: "assets/images/tiramisu.jpg",
    imageAlt: "Layered Italian Tiramisu dusted with cocoa powder"
  },
  {
    id: "creme-brulee",
    name: "Crème Brûlée",
    continent: "Europe",
    description:
      "Rich French Madagascar vanilla bean custard topped with a freshly torched, glass-crisp caramelized sugar crust.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: true,
    category: "Europe",
    serving: "1 Ceramic Ramekin",
    defaultPricePkr: 980,
    image: "assets/images/creme-brulee.jpg",
    imageAlt: "French Crème Brûlée with a golden caramelized sugar crust"
  },

  // North America
  {
    id: "new-york-cheesecake",
    name: "New York Cheesecake",
    continent: "North America",
    description:
      "Dense, velvety baked cream cheese cake over a buttery graham cracker crust with a hint of bright lemon zest.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: false,
    category: "North America",
    serving: "1 Generous Slice",
    defaultPricePkr: 1120,
    image: "assets/images/new-york-cheesecake.jpg",
    imageAlt: "Creamy New York Cheesecake slice on a dessert plate"
  },
  {
    id: "pecan-pie",
    name: "Pecan Pie",
    continent: "North America",
    description:
      "Southern-style flaky pastry tart filled with toasted Georgia pecans suspended in warm brown-sugar caramel.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: false,
    category: "North America",
    serving: "1 Tart Slice",
    defaultPricePkr: 990,
    image: "assets/images/pecan-pie.jpg",
    imageAlt: "Golden baked Pecan Pie topped with whole toasted pecans"
  },
  {
    id: "brownies",
    name: "Brownies",
    continent: "North America",
    description:
      "Fudgy dark-chocolate squares with crackly tops, rich cocoa depth, and crisp roasted walnut chunks.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: false,
    category: "North America",
    serving: "Box of 4 Squares",
    defaultPricePkr: 880,
    image: "assets/images/brownies.jpg",
    imageAlt: "Rich fudgy dark chocolate Brownies"
  },

  // South America
  {
    id: "brigadeiro",
    name: "Brigadeiro",
    continent: "South America",
    description:
      "Beloved Brazilian condensed-milk cocoa truffles hand-rolled in glossy dark chocolate sprinkles.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: true,
    category: "South America",
    serving: "Box of 6 Truffles",
    defaultPricePkr: 840,
    image: "assets/images/brigadeiro.jpg",
    imageAlt: "Chocolate Brigadeiro truffles coated in chocolate sprinkles"
  },
  {
    id: "tres-leches-cake",
    name: "Tres Leches Cake",
    continent: "South America",
    description:
      "Feather-light sponge cake soaked in three rich milks and crowned with whipped vanilla cream and cinnamon.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: false,
    category: "South America",
    serving: "1 Chilled Slice",
    defaultPricePkr: 960,
    image: "assets/images/tres-leches-cake.jpg",
    imageAlt: "Moist Tres Leches Cake topped with whipped cream"
  },
  {
    id: "alfajores",
    name: "Alfajores",
    continent: "South America",
    description:
      "Tender meltaway shortbread sandwich cookies generously filled with silky dulce de leche and rolled in coconut.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: false,
    category: "South America",
    serving: "Box of 4 Cookies",
    defaultPricePkr: 920,
    image: "assets/images/alfajores.jpg",
    imageAlt: "Dulce de leche filled Alfajores cookies"
  },

  // Oceania
  {
    id: "pavlova",
    name: "Pavlova",
    continent: "Oceania",
    description:
      "Crisp baked meringue shell with a marshmallow-soft centre, topped with whipped cream and fresh seasonal berries.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: true,
    category: "Oceania",
    serving: "Personal Pavlova",
    defaultPricePkr: 1050,
    image: "assets/images/pavlova.jpg",
    imageAlt: "Crisp meringue Pavlova topped with whipped cream and fresh fruit"
  },
  {
    id: "lamington",
    name: "Lamington",
    continent: "Oceania",
    description:
      "Golden Australian butter sponge cubes dipped in silky dark chocolate icing and coated in fine desiccated coconut.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: false,
    category: "Oceania",
    serving: "Box of 4 Cubes",
    defaultPricePkr: 820,
    image: "assets/images/lamington.jpg",
    imageAlt: "Chocolate and coconut coated Lamington sponge squares"
  },
  {
    id: "anzac-biscuits",
    name: "Anzac Biscuits",
    continent: "Oceania",
    description:
      "Golden-baked rolled oat and coconut cookies caramelized with rich golden syrup for a comforting, chewy crunch.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: false,
    category: "Oceania",
    serving: "Pack of 6 Biscuits",
    defaultPricePkr: 690,
    image: "assets/images/anzac-biscuits.jpg",
    imageAlt: "Golden baked oat and coconut Anzac Biscuits"
  }
];

window.CRUMBERY_GLUTEN_FREE_DESSERTS = [
  {
    id: "gf-chocolate-brownies",
    name: "Gluten-Free Chocolate Brownies",
    description:
      "Rich, fudgy dark-cocoa brownies crafted with almond meal and pure butter for a decadent crackly top.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: true,
    category: "Gluten-Free Bakery",
    serving: "Box of 4 Squares",
    defaultPricePkr: 940,
    image: "assets/images/gf-chocolate-brownies.jpg",
    imageAlt: "Fudgy Gluten-Free Chocolate Brownies stacked neatly"
  },
  {
    id: "gf-cheesecake",
    name: "Gluten-Free Cheesecake",
    description:
      "Silky baked cream-cheese filling set atop a nutty toasted almond-and-oat crust, finished with fresh berries.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: true,
    category: "Gluten-Free Bakery",
    serving: "1 Generous Slice",
    defaultPricePkr: 1180,
    image: "assets/images/gf-cheesecake.jpg",
    imageAlt: "Creamy Gluten-Free Cheesecake topped with fresh strawberries"
  },
  {
    id: "almond-flour-cookies",
    name: "Almond Flour Cookies",
    description:
      "Golden-baked artisan cookies made from finely blanched almond flour, raw honey, and pure Madagascar vanilla.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: true,
    category: "Gluten-Free Cookies",
    serving: "Box of 6 Cookies",
    defaultPricePkr: 790,
    image: "assets/images/almond-flour-cookies.jpg",
    imageAlt: "Crisp golden Almond Flour Cookies dusted lightly with sugar"
  },
  {
    id: "gf-chocolate-cake",
    name: "Gluten-Free Chocolate Cake",
    description:
      "Velvety flourless Belgian chocolate sponge layered with smooth dark chocolate ganache and roasted cocoa nibs.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: true,
    category: "Gluten-Free Cakes",
    serving: "1 Rich Slice",
    defaultPricePkr: 1120,
    image: "assets/images/gf-chocolate-cake.jpg",
    imageAlt: "Layered Gluten-Free Chocolate Cake coated in glossy fudge ganache"
  },
  {
    id: "coconut-macaroons",
    name: "Coconut Macaroons",
    description:
      "Crisp golden-toasted shredded coconut domes with a tender, chewy centre and a delicate vanilla aroma.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: true,
    category: "Gluten-Free Cookies",
    serving: "Box of 6 Macaroons",
    defaultPricePkr: 760,
    image: "assets/images/coconut-macaroons.jpg",
    imageAlt: "Golden toasted Coconut Macaroons baked to crisp edges"
  },
  {
    id: "gf-fruit-tart",
    name: "Gluten-Free Fruit Tart",
    description:
      "Crisp almond-pastry shell filled with silky vanilla pastry cream and crowned with vibrant seasonal fruits.",
    dietary: "Vegetarian",
    isVegetarian: true,
    glutenFree: true,
    category: "Gluten-Free Tarts",
    serving: "1 Personal Tart",
    defaultPricePkr: 980,
    image: "assets/images/gf-fruit-tart.jpg",
    imageAlt: "Gluten-Free Fruit Tart topped with fresh glazed seasonal fruit"
  }
];

window.CRUMBERY_ALL_DESSERTS = [
  ...window.CRUMBERY_DESSERTS,
  ...window.CRUMBERY_WORLD_DESSERTS,
  ...window.CRUMBERY_GLUTEN_FREE_DESSERTS
];
