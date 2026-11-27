import { CAKE, REWARDS } from '../config.js';

export function calculateCakePrice(state) {
  const size = CAKE.sizes.find((s) => s.id === state.size) || CAKE.sizes[1];
  const shape = CAKE.shapes.find((s) => s.id === state.shape) || CAKE.shapes[0];
  const layer = CAKE.layers.find((l) => l.count === state.layers) || CAKE.layers[0];
  const filling = CAKE.fillings.find((f) => f.id === state.filling) || CAKE.fillings[0];
  const finish = CAKE.finishes.find((f) => f.id === state.finish) || CAKE.finishes[0];

  const lines = [];
  let rawTotal = 0;

  lines.push({ label: `${size.label} ${shape.label.toLowerCase()} base`, amount: size.price });
  rawTotal += size.price;

  if (shape.price > 0) {
    lines.push({ label: `${shape.label} shape`, amount: shape.price });
    rawTotal += shape.price;
  }

  const extraLayersAmt = Math.round(size.price * layer.multiplier);
  if (extraLayersAmt > 0) {
    lines.push({ label: `${layer.count} layers`, amount: extraLayersAmt });
    rawTotal += extraLayersAmt;
  }

  const activeSponges = (state.sponges || []).slice(0, state.layers);
  const avgSponge =
    activeSponges.reduce((sum, id) => {
      const sp = CAKE.sponges.find((s) => s.id === id);
      return sum + (sp ? sp.price : 0);
    }, 0) / Math.max(1, activeSponges.length);
  if (avgSponge > 0) {
    const roundedSponge = Math.round(avgSponge);
    lines.push({ label: 'Sponge flavour', amount: roundedSponge });
    rawTotal += roundedSponge;
  }

  if (filling.price > 0) {
    lines.push({ label: `${filling.label} filling`, amount: filling.price });
    rawTotal += filling.price;
  }

  if (finish.price > 0) {
    lines.push({ label: `${finish.label} finish`, amount: finish.price });
    rawTotal += finish.price;
  }

  (state.toppings || []).forEach((tId) => {
    const t = CAKE.toppings.find((x) => x.id === tId);
    if (t && t.price > 0) {
      lines.push({ label: t.label, amount: t.price });
      rawTotal += t.price;
    }
  });

  if (state.msg && state.msg.trim().length > 0) {
    lines.push({ label: 'Cake message', amount: CAKE.messagePrice });
    rawTotal += CAKE.messagePrice;
  }

  (state.dietary || []).forEach((dId) => {
    const d = CAKE.dietary.find((x) => x.id === dId);
    if (d && d.price > 0) {
      lines.push({ label: d.label, amount: d.price });
      rawTotal += d.price;
    }
  });

  const total = Math.round(rawTotal / 50) * 50;
  const leadHours = state.layers >= 4 || (state.dietary && state.dietary.length > 0) ? 48 : 24;
  const points = Math.floor(total * REWARDS.pointsPerRupee);

  return { total, lines, leadHours, points };
}

export function getCakeCaption(state) {
  const size = CAKE.sizes.find((s) => s.id === state.size) || CAKE.sizes[1];
  const shape = CAKE.shapes.find((s) => s.id === state.shape) || CAKE.shapes[0];
  const finish = CAKE.finishes.find((f) => f.id === state.finish) || CAKE.finishes[0];
  const active = (state.sponges || []).slice(0, state.layers);
  const allSame = active.every((s) => s === active[0]);
  const spongeLabel = allSame
    ? (CAKE.sponges.find((s) => s.id === active[0])?.label || 'Vanilla')
    : 'Mixed sponge';
  return `${size.label} ${shape.label} · ${spongeLabel} · ${state.layers} layers · ${finish.label}`.toUpperCase();
}

export function getCakeDescription(state) {
  const fill = CAKE.fillings.find((f) => f.id === state.filling)?.label || 'Vanilla cream';
  const parts = [getCakeCaption(state), `Filling: ${fill}`];
  if (state.toppings?.length) {
    const toppingLabels = state.toppings
      .map((id) => CAKE.toppings.find((t) => t.id === id)?.label || id)
      .join(', ');
    parts.push(`Toppings: ${toppingLabels}`);
  }
  if (state.msg?.trim()) parts.push(`Message: "${state.msg.trim()}"`);
  if (state.dietary?.length) {
    const dietLabels = state.dietary
      .map((id) => CAKE.dietary.find((d) => d.id === id)?.label || id)
      .join(', ');
    parts.push(`Dietary: ${dietLabels}`);
  }
  if (state.notes?.trim()) parts.push(`Notes: ${state.notes.trim()}`);
  return parts.join(' · ');
}
