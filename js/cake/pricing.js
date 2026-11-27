/**
 * Cake Studio pricing, lead time and plain-text descriptions.
 * All numbers come from CAKE in config.js.
 */

import { CAKE } from '../config.js';

export const pick = (list, id) => list.find((o) => o.id === id) || list[0];

/** The frosting's friendly name, or "custom colour" for a picker value. */
export function frostingName(hex) {
  const match = CAKE.frostings.find((f) => f.color.toLowerCase() === String(hex).toLowerCase());
  return match ? match.label : 'Custom colour';
}

/** Price breakdown for a cake design. Returns { total, lines: [[label, amount], …] }. */
export function cakePrice(s) {
  const size = pick(CAKE.sizes, s.size);
  const shape = pick(CAKE.shapes, s.shape);
  const lines = [[`${size.label} ${shape.label.toLowerCase()} base`, size.price]];

  if (shape.price) lines.push([`${shape.label} tin`, shape.price]);

  const extraLayers = Math.max(0, s.layers - 2);
  if (extraLayers) lines.push([`${extraLayers} extra layer${extraLayers > 1 ? 's' : ''}`, Math.round(size.price * CAKE.extraLayerRate * extraLayers)]);

  // Sponges are charged per layer, averaged so mixed cakes stay fair
  const used = s.sponges.slice(0, s.layers);
  const spongeAvg = used.reduce((sum, id) => sum + pick(CAKE.sponges, id).price, 0) / s.layers;
  if (spongeAvg) lines.push([sameSponge(s) ? `${pick(CAKE.sponges, used[0]).label} sponge` : 'Mixed sponges', Math.round(spongeAvg)]);

  const filling = pick(CAKE.fillings, s.filling);
  if (filling.price) lines.push([`${filling.label} filling`, filling.price]);

  const finish = pick(CAKE.finishes, s.finish);
  if (finish.price) lines.push([`${finish.label} finish`, finish.price]);

  s.toppings.forEach((id) => {
    const t = pick(CAKE.toppings, id);
    lines.push([t.label, t.price]);
  });

  if (s.msg.trim()) lines.push(['Message on top', CAKE.messagePrice]);

  s.dietary.forEach((id) => {
    const d = pick(CAKE.dietary, id);
    if (d.price) lines.push([d.label, d.price]);
  });

  const raw = lines.reduce((sum, [, amount]) => sum + amount, 0);
  return { total: Math.round(raw / CAKE.roundTo) * CAKE.roundTo, lines };
}

export const sameSponge = (s) => s.sponges.slice(0, s.layers).every((id) => id === s.sponges[0]);

/** Hours of notice the bakery needs for this design. */
export function leadHours(s) {
  return s.layers >= 4 || s.dietary.length ? CAKE.leadHours.special : CAKE.leadHours.standard;
}

/** Short caption, e.g. "2 kg round · vanilla · 3 layers · buttercream". */
export function caption(s) {
  const sponge = sameSponge(s) ? pick(CAKE.sponges, s.sponges[0]).label.toLowerCase() : 'mixed sponge';
  return `${pick(CAKE.sizes, s.size).label} ${pick(CAKE.shapes, s.shape).label.toLowerCase()} · ${sponge} · ${s.layers} layers · ${pick(CAKE.finishes, s.finish).label.toLowerCase()}`;
}

/** Full one-line spec used in the estimator and saved designs. */
export function describe(s) {
  const sponges = sameSponge(s)
    ? `${pick(CAKE.sponges, s.sponges[0]).label} sponge`
    : `Layers (bottom to top): ${s.sponges.slice(0, s.layers).map((id) => pick(CAKE.sponges, id).label).join(' / ')}`;
  return [
    `${pick(CAKE.sizes, s.size).label} ${pick(CAKE.shapes, s.shape).label.toLowerCase()}, ${s.layers} layers`,
    sponges,
    `${pick(CAKE.fillings, s.filling).label} filling`,
    `${pick(CAKE.finishes, s.finish).label} in ${frostingName(s.frosting).toLowerCase()}`,
    s.toppings.map((id) => pick(CAKE.toppings, id).label).join(', '),
    s.msg.trim() ? `“${s.msg.trim()}”` : '',
    s.dietary.map((id) => pick(CAKE.dietary, id).label).join(', '),
  ]
    .filter(Boolean)
    .join(' · ');
}
