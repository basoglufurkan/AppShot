// A glass with a wave filled to `pct` (0–1). w × h in px.
window.glass = (w, h, pct) => {
  const fill = h * pct, top = h - fill;
  return `<div style="position:relative;width:${w}px;height:${h}px;border-radius:18px 18px 34px 34px;background:linear-gradient(180deg,#F6FAFF,#E7F1FC);box-shadow:inset 0 0 0 3px #CFE3F8;overflow:hidden">
    <svg style="position:absolute;left:0;top:${top - 14}px" width="${w}" height="${fill + 14}" viewBox="0 0 ${w} ${fill + 14}" preserveAspectRatio="none">
      <defs><linearGradient id="wf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5FD3F3"/><stop offset="1" stop-color="#1E7BF0"/></linearGradient></defs>
      <path d="M0 12 C ${w * 0.2} 2, ${w * 0.35} 22, ${w * 0.55} 12 S ${w * 0.85} 2, ${w} 12 L ${w} ${fill + 14} L 0 ${fill + 14} Z" fill="url(#wf)"/>
      <path d="M0 16 C ${w * 0.25} 26, ${w * 0.45} 6, ${w * 0.65} 16 S ${w * 0.9} 26, ${w} 16" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none"/>
    </svg>
    <div style="position:absolute;left:${w * 0.2}px;top:${top + fill * 0.35}px;width:10px;height:10px;border-radius:50%;background:#fff;opacity:.5"></div>
    <div style="position:absolute;left:${w * 0.62}px;top:${top + fill * 0.6}px;width:7px;height:7px;border-radius:50%;background:#fff;opacity:.45"></div>
    <div style="position:absolute;left:${w * 0.42}px;top:${top + fill * 0.78}px;width:12px;height:12px;border-radius:50%;background:#fff;opacity:.35"></div>
    <div style="position:absolute;left:10px;top:12px;width:8px;height:${h * 0.55}px;border-radius:4px;background:#fff;opacity:.7"></div>
  </div>`;
};
