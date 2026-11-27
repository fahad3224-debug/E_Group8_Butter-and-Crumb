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

/**
 * Cake Studio options. Every option the customer can pick lives here,
 * with its price (PKR) and the colours the 3D cake uses to draw it.
 * `r` is the radius of the 3D model in CSS pixels.
 */
export const CAKE = {
  shapes: [
    { id: 'round', label: 'Round', price: 0 },
    { id: 'square', label: 'Square', price: 300 },
  ],
  sizes: [
    { id: '6', label: '1 kg', sub: '6″ · serves 6–8', price: 2800, r: 92 },
    { id: '8', label: '2 kg', sub: '8″ · serves 10–14', price: 4200, r: 112 },
    { id: '10', label: '3 kg', sub: '10″ · serves 18–24', price: 6000, r: 132 },
  ],
  layers: [2, 3, 4],
  extraLayerRate: 0.18, // each layer above 2 adds 18% of the base price
  sponges: [
    { id: 'vanilla', label: 'Vanilla', price: 0, color: '#F1DDAE' },
    { id: 'chocolate', label: 'Chocolate', price: 300, color: '#5A3A2A' },
    { id: 'red-velvet', label: 'Red velvet', price: 450, color: '#9E2F35' },
    { id: 'coffee', label: 'Coffee', price: 350, color: '#A8794F' },
    { id: 'pistachio', label: 'Pistachio', price: 700, color: '#B9C48A' },
    { id: 'biscoff', label: 'Lotus Biscoff', price: 500, color: '#C98F55' },
  ],
  fillings: [
    { id: 'vanilla-cream', label: 'Vanilla cream', price: 0, color: '#FBF3E2' },
    { id: 'raspberry-jam', label: 'Raspberry jam', price: 450, color: '#9C2338' },
    { id: 'ganache', label: 'Chocolate ganache', price: 650, color: '#3E261B' },
    { id: 'salted-caramel', label: 'Salted caramel', price: 550, color: '#C98B3E' },
    { id: 'nutella', label: 'Nutella', price: 600, color: '#5C3A24' },
    { id: 'biscoff-spread', label: 'Biscoff spread', price: 500, color: '#B57A41' },
  ],
  finishes: [
    { id: 'buttercream', label: 'Buttercream', price: 0 },
    { id: 'fondant', label: 'Fondant', price: 950 },
    { id: 'semi-naked', label: 'Semi-naked', price: 200 },
    { id: 'naked', label: 'Naked', price: 0 },
    { id: 'drip', label: 'Chocolate drip', price: 750 },
  ],
  frostings: [
    { label: 'Warm cream', color: '#FBEBD6' },
    { label: 'Butter', color: '#F6DC86' },
    { label: 'Blush', color: '#E8A598' },
    { label: 'Pistachio', color: '#BFC99A' },
    { label: 'Terracotta', color: '#C9503A' },
    { label: 'Plum', color: '#5B2A4A' },
    { label: 'Cocoa', color: '#6A4936' },
  ],
  toppings: [
    { id: 'berries', label: 'Fresh berries', price: 650 },
    { id: 'macarons', label: 'Macarons', price: 850 },
    { id: 'shards', label: 'Chocolate shards', price: 450 },
    { id: 'sprinkles', label: 'Sprinkles', price: 350 },
    { id: 'gold-leaf', label: 'Gold leaf', price: 1100 },
    { id: 'flowers', label: 'Sugar flowers', price: 900 },
    { id: 'candles', label: 'Candles', price: 250 },
    { id: 'piped-border', label: 'Piped border', price: 400 },
  ],
  messagePrice: 300,
  messageMax: 24,
  dietary: [
    { id: 'eggless', label: 'Eggless', price: 400 },
    { id: 'sugar-free', label: 'Sugar-free', price: 500 },
    { id: 'nut-free', label: 'Nut-free', price: 0 },
  ],
  leadHours: { standard: 24, special: 48 }, // special = 4 layers or any dietary option
  prepMinutes: 90, // assembly time used by the delivery estimator
  roundTo: 50,
};
