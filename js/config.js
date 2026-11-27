/**
 * Single source of truth for Crumbery Bakery configuration:
 * location, opening hours, delivery bands, Islamabad/Rwp sectors,
 * tax rate, rewards tiers, and cake pricing constants.
 */

export const BAKERY = {
  name: 'Crumbery',
  address: 'Shop 12, F-7 Markaz (Jinnah Super), Islamabad',
  phone: '+92 51 265 4321',
  coords: { lat: 33.7215, lng: 73.0561 },
  openHour: 9,
  closeHour: 23,
  sameDayCutoffHour: 20,
  defaultPrepMinutes: 25,
};

export const DELIVERY = {
  avgCitySpeedKmh: 24,
  baseDispatchMinutes: 10,
  peakHours: [
    [12, 14],
    [18, 21],
  ],
  peakMultiplier: 1.35,
  maxDeliveryKm: 25,
  bands: [
    { maxKm: 3, fee: 150, label: '0–3 km' },
    { maxKm: 7, fee: 250, label: '3–7 km' },
    { maxKm: 12, fee: 380, label: '7–12 km' },
    { maxKm: 20, fee: 550, label: '12–20 km' },
    { maxKm: 25, fee: 700, label: '20–25 km' },
  ],
  sectors: [
    { id: 'f7', label: 'F-7 (Jinnah Super / Markaz)', lat: 33.7215, lng: 73.0561 },
    { id: 'f6', label: 'F-6 (Super Market)', lat: 33.7294, lng: 73.0736 },
    { id: 'f8', label: 'F-8 Markaz', lat: 33.7118, lng: 73.0389 },
    { id: 'e7', label: 'E-7 (Hillside)', lat: 33.7336, lng: 73.0508 },
    { id: 'blue-area', label: 'Blue Area (Jinnah Ave)', lat: 33.7161, lng: 73.0686 },
    { id: 'g6', label: 'G-6 (Melody / Aabpara)', lat: 33.7145, lng: 73.0858 },
    { id: 'g7', label: 'G-7 (Sitara Market)', lat: 33.7042, lng: 73.0652 },
    { id: 'g9', label: 'G-9 Markaz (Karachi Co.)', lat: 33.6889, lng: 73.0315 },
    { id: 'f10', label: 'F-10 Markaz', lat: 33.6946, lng: 73.0126 },
    { id: 'f11', label: 'F-11 Markaz', lat: 33.6844, lng: 72.9896 },
    { id: 'g10', label: 'G-10 Markaz', lat: 33.6798, lng: 73.0159 },
    { id: 'g11', label: 'G-11 Markaz', lat: 33.6693, lng: 72.9978 },
    { id: 'e11', label: 'E-11 (MPCHS)', lat: 33.6989, lng: 72.9718 },
    { id: 'd12', label: 'D-12 Markaz', lat: 33.7058, lng: 72.9482 },
    { id: 'i8', label: 'I-8 Markaz', lat: 33.6686, lng: 73.0748 },
    { id: 'chak-shahzad', label: 'Chak Shahzad / Park Rd', lat: 33.6731, lng: 73.1449 },
    { id: 'gulberg', label: 'Gulberg Greens', lat: 33.6114, lng: 73.1538 },
    { id: 'saddar-rwp', label: 'Saddar, Rawalpindi', lat: 33.5974, lng: 73.0521 },
    { id: 'bahria-rwp', label: 'Bahria Town Phase 1–4, Rwp', lat: 33.5533, lng: 73.1225 },
  ],
};

export const TAX_RATE = 0.05;

export const REWARDS = {
  pointsPerRupee: 0.05, // 5 Sweet Points per Rs 100
  signupBonus: 150,
  tiers: [
    {
      id: 'crumb',
      name: 'Crumb',
      minPoints: 0,
      discountRate: 0,
      freeDelivery: false,
      perkLabel: 'Earn 5 pts / Rs 100',
    },
    {
      id: 'butter',
      name: 'Butter',
      minPoints: 500,
      discountRate: 0.05,
      freeDelivery: false,
      perkLabel: '5% off every order',
    },
    {
      id: 'ganache',
      name: 'Ganache',
      minPoints: 1500,
      discountRate: 0.1,
      freeDelivery: true,
      perkLabel: '10% off + free delivery',
    },
    {
      id: 'goldleaf',
      name: 'Gold Leaf',
      minPoints: 3500,
      discountRate: 0.15,
      freeDelivery: true,
      perkLabel: '15% off + free delivery + priority bake',
    },
  ],
  redemptions: [
    { id: 'free-croissant', title: 'Butter Croissant', cost: 250, note: 'Fresh laminated pastry' },
    { id: 'free-brownie', title: 'Fudge Brownie Box (2 pc)', cost: 400, note: '70% dark chocolate' },
    { id: 'free-delivery-pass', title: 'Free Delivery Voucher', cost: 300, note: 'Valid across Islamabad' },
    { id: 'off-1000-cake', title: 'Rs 1,000 Off Custom Cake', cost: 900, note: 'Applies in Cake Studio' },
  ],
};

export const CAKE_PRICING = {
  sizes: {
    '6': { label: '6" (Serves 6–8)', basePrice: 2800, radiusScale: 0.85 },
    '8': { label: '8" (Serves 10–14)', basePrice: 4200, radiusScale: 1.0 },
    '10': { label: '10" (Serves 18–24)', basePrice: 6000, radiusScale: 1.2 },
  },
  tiers: {
    1: { label: '1 Tier', multiplier: 1.0, surcharge: 0 },
    2: { label: '2 Tiers', multiplier: 1.55, surcharge: 1800 },
    3: { label: '3 Tiers', multiplier: 2.15, surcharge: 3800 },
  },
  shapes: {
    round: { label: 'Round', surcharge: 0 },
    square: { label: 'Square', surcharge: 300 },
    heart: { label: 'Heart', surcharge: 550 },
  },
  fillings: {
    'vanilla-bean': { label: 'Vanilla Bean', surcharge: 0 },
    'strawberry-jam': { label: 'Strawberry Compote', surcharge: 450 },
    'salted-caramel': { label: 'Salted Caramel', surcharge: 550 },
    'pistachio-praline': { label: 'Pistachio Praline', surcharge: 750 },
    'dark-ganache': { label: 'Dark Chocolate Ganache', surcharge: 650 },
  },
  finishes: {
    smooth: { label: 'Smooth Buttercream', surcharge: 0 },
    'semi-naked': { label: 'Semi-Naked', surcharge: 200 },
    rustic: { label: 'Rustic Swirl', surcharge: 300 },
    drip: { label: 'Glossy Ganache Drip', surcharge: 750 },
    fondant: { label: 'Velvet Fondant', surcharge: 950 },
  },
  toppings: {
    strawberries: { label: 'Fresh Strawberries', price: 650 },
    macarons: { label: 'French Macarons', price: 850 },
    'gold-leaf': { label: '24k Edible Gold Leaf', price: 1100 },
    sprinkles: { label: 'Artisan Sprinkles', price: 350 },
    candles: { label: 'Beeswax Candles', price: 250 },
  },
  plaquePrice: 300,
};
