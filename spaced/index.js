// spaced/index.js
export function updateCard(card, quality) {
  // card: { easiness: 2.5, interval: 0, reps: 0, due: '2025-09-10' }
  const q = Math.max(0, Math.min(5, quality));
  let e = card.easiness ?? 2.5;
  let reps = (card.reps ?? 0) + 1;
  let interval;

  e = e + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (e < 1.3) e = 1.3;

  if (reps === 1) interval = 1;
  else if (reps === 2) interval = 6;
  else interval = Math.round((card.interval ?? 1) * e);

  const due = new Date();
  due.setDate(due.getDate() + interval);

  return { easiness: e, interval, reps, due: due.toISOString().slice(0,10) };
}
