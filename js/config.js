// Single source of truth for Crumbery Bakery

export const BAKERY = {
  name: 'Crumbery',
  address: 'Shop 12, F-7 Markaz (Jinnah Super), Islamabad',
  phone: '+92 51 265 4321',
  coords: { lat: 33.7215, lng: 73.0561 },
  openHour: 9,
  closeHour: 23,
  sameDayCutoffHour: 20,
  defaultPrepMinutes: 25
};

export const DELIVERY = {
  avgCitySpeedKmh: 24,
  baseDispatchMinutes: 10,
  peakHours: [
    [12, 14],
    [18, 21]
  ],
  peakMultiplier: 1.35,
  maxDeliveryKm: 25,
  bands: [
    { minKm: 0, maxKm: 3, fee: 150, label: '0–3 km' },
    { minKm: 3, maxKm: 7, fee: 250, label: '3–7 km' },
    { minKm: 7, maxKm: 12, fee: 380, label: '7–12 km' },
    { minKm: 12, maxKm: 20, fee: 550, label: '12–20 km' },
    { minKm: 20, maxKm: 25, fee: 700, label: '20–25 km' }
  ],
  sectors: [
    { id: 'f7', label: 'F-7 Markaz', lat: 33.7215, lng: 73.0561 },
    { id: 'f6', label: 'F-6 Super Market', lat: 33.7302, lng: 73.0762 },
    { id: 'f8', label: 'F-8 Markaz', lat: 33.7112, lng: 73.0389 },
    { id: 'e7', label: 'E-7', lat: 33.7299, lng: 73.0472 },
    { id: 'blue-area', label: 'Blue Area', lat: 33.7138, lng: 73.0638 },
    { id: 'g6', label: 'G-6 Melody / Aabpara', lat: 33.7161, lng: 73.0846 },
    { id: 'g7', label: 'G-7 Sitara Market', lat: 33.7058, lng: 73.0706 },
    { id: 'g9', label: 'G-9 Markaz', lat: 33.6889, lng: 73.0342 },
    { id: 'f10', label: 'F-10 Markaz', lat: 33.6964, lng: 73.0124 },
    { id: 'f11', label: 'F-11 Markaz', lat: 33.6844, lng: 72.9896 },
    { id: 'g10', label: 'G-10 Markaz', lat: 33.6791, lng: 73.0145 },
    { id: 'g11', label: 'G-11 Markaz', lat: 33.6688, lng: 72.9977 },
    { id: 'e11', label: 'E-11', lat: 33.6987, lng: 72.9767 },
    { id: 'd12', label: 'D-12 Markaz', lat: 33.7024, lng: 72.9482 },
    { id: 'i8', label: 'I-8 Markaz', lat: 33.6691, lng: 73.0749 },
    { id: 'chak-shahzad', label: 'Chak Shahzad', lat: 33.6712, lng: 73.1492 },
    { id: 'gulberg', label: 'Gulberg Greens', lat: 33.6095, lng: 73.1489 },
    { id: 'saddar', label: 'Saddar Rawalpindi', lat: 33.5982, lng: 73.0518 },
    { id: 'bahria', label: 'Bahria Town Phase 1–4', lat: 33.5518, lng: 73.1204 }
  ]
};

export const TAX_RATE = 0.05;

export const REWARDS = {
  pointsPerRupee: 0.05,
  signupBonus: 150,
  tiers: [
    { id: 'crumb', name: 'Crumb', minPoints: 0, discountPct: 0, freeDelivery: false, perks: ['5 Sweet Points per Rs 100', 'Birthday treat'] },
    { id: 'butter', name: 'Butter', minPoints: 500, discountPct: 5, freeDelivery: false, perks: ['5% off every estimate', 'Early seasonal menu access'] },
    { id: 'ganache', name: 'Ganache', minPoints: 1500, discountPct: 10, freeDelivery: true, perks: ['10% off every estimate', 'Free delivery in Islamabad/RWP'] },
    { id: 'gold-leaf', name: 'Gold Leaf', minPoints: 3500, discountPct: 15, freeDelivery: true, perks: ['15% off every estimate', 'Free delivery', 'Priority bake slot'] }
  ],
  redemptions: [
    { id: 'redeem-croissant', name: 'Butter Croissant', points: 250, description: 'Flaky, laminated French-butter croissant baked fresh.' },
    { id: 'redeem-brownie', name: 'Fudge Brownie Box (2 pc)', points: 400, description: 'Two rich dark-chocolate fudge brownies.' },
    { id: 'redeem-delivery', name: 'Free Delivery Voucher', points: 300, description: 'Waives delivery fee on your next Islamabad/RWP order.' },
    { id: 'redeem-cake', name: 'Rs 1,000 Off a Custom Cake', points: 900, description: 'Applies Rs 1,000 credit to any Cake Studio creation.' }
  ]
};

export const CAKE = {
  shapes: [
    { id: 'round', label: 'Round', price: 0 },
    { id: 'square', label: 'Square', price: 300 }
  ],
  sizes: [
    { id: '1kg', label: '1 kg', detail: '6″ · serves 6–8', price: 2800, radius: 92 },
    { id: '2kg', label: '2 kg', detail: '8″ · serves 10–14', price: 4200, radius: 112 },
    { id: '3kg', label: '3 kg', detail: '10″ · serves 18–24', price: 6000, radius: 132 }
  ],
  layers: [
    { count: 2, label: '2 layers', multiplier: 0, height: 58, fillingHeight: 10 },
    { count: 3, label: '3 layers', multiplier: 0.18, height: 48, fillingHeight: 9 },
    { count: 4, label: '4 layers', multiplier: 0.36, height: 40, fillingHeight: 8 }
  ],
  sponges: [
    { id: 'vanilla', label: 'Vanilla', price: 0, color: '#F1DDAE' },
    { id: 'chocolate', label: 'Chocolate', price: 300, color: '#5A3A2A' },
    { id: 'red-velvet', label: 'Red velvet', price: 450, color: '#9E2F35' },
    { id: 'coffee', label: 'Coffee', price: 350, color: '#A8794F' },
    { id: 'pistachio', label: 'Pistachio', price: 700, color: '#B9C48A' },
    { id: 'biscoff', label: 'Lotus Biscoff', price: 500, color: '#C98F55' }
  ],
  fillings: [
    { id: 'vanilla-cream', label: 'Vanilla cream', price: 0, color: '#FBF3E2' },
    { id: 'raspberry-jam', label: 'Raspberry jam', price: 450, color: '#9C2338' },
    { id: 'ganache', label: 'Chocolate ganache', price: 650, color: '#3E261B' },
    { id: 'salted-caramel', label: 'Salted caramel', price: 550, color: '#C98B3E' },
    { id: 'nutella', label: 'Nutella', price: 600, color: '#5C3A24' },
    { id: 'biscoff-spread', label: 'Biscoff spread', price: 500, color: '#B57A41' }
  ],
  finishes: [
    { id: 'buttercream', label: 'Buttercream', price: 0 },
    { id: 'fondant', label: 'Fondant', price: 950 },
    { id: 'semi-naked', label: 'Semi-naked', price: 200 },
    { id: 'naked', label: 'Naked', price: 0 },
    { id: 'chocolate-drip', label: 'Chocolate drip', price: 750 }
  ],
  frostingColors: [
    { id: 'warm-cream', label: 'Warm cream', hex: '#FBEBD6' },
    { id: 'butter', label: 'Butter', hex: '#F6DC86' },
    { id: 'blush', label: 'Blush', hex: '#E8A598' },
    { id: 'pistachio', label: 'Pistachio', hex: '#BFC99A' },
    { id: 'terracotta', label: 'Terracotta', hex: '#C9503A' },
    { id: 'plum', label: 'Plum', hex: '#5B2A4A' },
    { id: 'cocoa', label: 'Cocoa', hex: '#6A4936' }
  ],
  toppings: [
    { id: 'berries', label: 'Fresh berries', price: 650 },
    { id: 'macarons', label: 'Macarons', price: 850 },
    { id: 'shards', label: 'Chocolate shards', price: 450 },
    { id: 'sprinkles', label: 'Sprinkles', price: 350 },
    { id: 'gold-leaf', label: 'Gold leaf', price: 1100 },
    { id: 'sugar-flowers', label: 'Sugar flowers', price: 900 },
    { id: 'candles', label: 'Candles', price: 250 },
    { id: 'piped-border', label: 'Piped border', price: 400 }
  ],
  messagePrice: 300,
  messageMaxLen: 24,
  dietary: [
    { id: 'eggless', label: 'Eggless', price: 400 },
    { id: 'sugar-free', label: 'Sugar-free', price: 500 },
    { id: 'nut-free', label: 'Nut-free', price: 0 }
  ]
};
