// Pure helpers, no chrome APIs — shared by background.js and test_sort.js.

// "SS", "MM:SS", "HH:MM:SS" → seconds; anything else (LIVE, empty…) → Infinity.
export function parseDuration(text) {
  const m = /^(?:(\d+):)?(\d+):(\d{2})$/.exec(String(text).trim());
  if (!m) return Infinity;
  return (+(m[1] ?? 0)) * 3600 + +m[2] * 60 + +m[3];
}

// tabs: [{id, duration}] → ids sorted ascending by duration; ties and
// Infinity (unknown/live) keep their original relative order.
export function buildOrder(tabs) {
  return tabs
    .map((t, i) => [t.id, t.duration, i])
    .sort((a, b) => (a[1] === b[1] ? a[2] - b[2] : a[1] - b[1]))
    .map(([id]) => id);
}
