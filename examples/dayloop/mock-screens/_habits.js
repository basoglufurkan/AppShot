// Demo data shared by the Dayloop mock screens.
window.HABITS = [
  { name: 'Read 10 pages', meta: 'Daily · 21:30', icon: '📚', c: 'var(--read)', hex: '#7C5CFF', streak: 32, done: true },
  { name: 'Walk 8,000 steps', meta: 'Daily', icon: '🚶', c: 'var(--walk)', hex: '#22B573', streak: 18, done: true },
  { name: 'Meditate', meta: '10 min · mornings', icon: '🧘', c: 'var(--med)', hex: '#2BB3F3', streak: 9, done: true },
  { name: 'Drink 2 L water', meta: 'Daily', icon: '💧', c: 'var(--water)', hex: '#3B7BF6', streak: 27, done: true },
  { name: 'No phone in bed', meta: 'Weekdays', icon: '📵', c: 'var(--sleep)', hex: '#F5A524', streak: 6, done: true },
  { name: 'Journal', meta: '3× a week', icon: '✍️', c: 'var(--journal)', hex: '#EC4899', streak: 4, done: false },
];
window.CHECK = '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
// Deterministic "contribution graph": mostly done, a few misses.
window.heat = (cols, rows, hex, seed = 7, missRate = 0.12) => {
  let s = seed, out = '';
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let c = 0; c < cols; c++) {
    out += '<div style="display:flex;flex-direction:column;gap:4px">';
    for (let y = 0; y < rows; y++) {
      const v = r(), miss = v < missRate, a = miss ? 0.09 : 0.35 + 0.65 * r();
      out += `<div style="width:15px;height:15px;border-radius:4px;background:${hex};opacity:${a.toFixed(2)}"></div>`;
    }
    out += '</div>';
  }
  return out;
};
