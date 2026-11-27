/**
 * Formatting and geospatial math helpers.
 */

const pkrFormatter = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0,
});

/**
 * Format a numeric amount in Pakistani Rupees (e.g., "Rs 1,200").
 * @param {number} amount
 * @returns {string}
 */
export function formatPKR(amount) {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return pkrFormatter.format(safe);
}

/**
 * Format milliseconds into HH:MM:SS countdown string.
 * @param {number} ms
 * @returns {string}
 */
export function formatCountdown(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/**
 * Format 24h hour & minute to 12h readable time (e.g., "4:30 PM").
 * @param {number} hour
 * @param {number} minute
 * @returns {string}
 */
export function formatTime12h(hour, minute = 0) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const minStr = String(minute).padStart(2, '0');
  return `${h12}:${minStr} ${period}`;
}

/**
 * Compute great-circle Haversine distance in kilometers between two coordinates.
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number}
 */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
