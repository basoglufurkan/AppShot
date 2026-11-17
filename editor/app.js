// Appshot editor client. Plain modules, no build step.
const $ = (s) => document.querySelector(s);
const state = { plan: null, meta: null, raw: [], sel: 0, size: null, locale: null, dirty: false, W: 0, H: 0, N: 0, tab: 'shot' };
const api = async (url, body, method = body ? 'POST' : 'GET') => {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok && r.status !== 422) throw new Error(j.error || r.statusText);
  return { status: r.status, ...j };
};
const log = (s) => { const el = $('#log'); el.textContent += s.endsWith('\n') ? s : s + '\n'; el.parentElement.scrollTop = 1e9; };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const L = (v, loc = state.locale) => (v && typeof v === 'object' && !Array.isArray(v) ? v[loc] ?? '' : v ?? '');
const setL = (obj, key, value) => {
  const cur = obj[key];
  if (cur && typeof cur === 'object' && !Array.isArray(cur)) cur[state.locale] = value;
  else obj[key] = Object.fromEntries((state.plan.locales || [state.locale]).map((l) => [l, l === state.locale ? value : (typeof cur === 'string' ? cur : '')]));
};
const shot = () => state.plan.shots[state.sel];

function markDirty() { state.dirty = true; $('#dirty').hidden = false; schedule(); }
let timer;
function schedule() { clearTimeout(timer); timer = setTimeout(refresh, 260); }

async function load() {
  const s = await api('/api/state');
  state.plan = s.plan; state.meta = s.meta; state.raw = s.raw;
  state.size ||= s.plan.sizes?.[0] || 'iphone-6.9';
  state.locale ||= s.plan.defaultLocale || s.plan.locales?.[0] || 'en-US';
  state.sel = Math.min(state.sel, s.plan.shots.length - 1);
  state.dirty = false; $('#dirty').hidden = true; $('#banner').hidden = true;
  $('#appName').textContent = L(s.plan.app?.name) || '';
  fillSelect($('#size'), [...new Set([...(s.plan.sizes || []), ...s.meta.sizes.map((x) => x.id)])].map((id) => [id, id]), state.size);
  fillSelect($('#locale'), (s.plan.locales || [state.locale]).map((l) => [l, l]), state.locale);
  renderInspector();
  await refresh();
}

function fillSelect(el, options, value) {
  el.innerHTML = options.map(([v, label]) => `<option value="${esc(v)}"${v === value ? ' selected' : ''}>${esc(label)}</option>`).join('');
}

async function refresh() {
  const plan = state.plan;
  const [strip, single] = await Promise.all([
    api('/api/compose', { plan, size: state.size, locale: state.locale, viewAll: true }),
    api('/api/compose', { plan, size: state.size, locale: state.locale }),
  ]);
  state.W = single.W; state.H = single.H; state.N = single.slots.length;
  // Strip: every shot side by side, scaled to ~190px height.
  const sh = 190, s = sh / strip.H;
  const sf = $('#stripFrame');
  sf.style.width = `${strip.W * strip.slots.length}px`; sf.style.height = `${strip.H}px`; sf.style.transform = `scale(${s})`;
  sf.srcdoc = strip.html;
  const box = $('#strip');
  box.style.width = `${strip.W * strip.slots.length * s}px`; box.style.height = `${sh}px`;
  $('#stripHits').innerHTML = strip.slots.map((sl, i) => `<div class="hit${i === state.sel ? ' on' : ''}" data-i="${i}" style="width:${strip.W * s}px"><span>${i + 1}</span></div>`).join('');
  // Stage: selected shot as large as fits.
  const stage = $('#stage'), area = stage.parentElement.getBoundingClientRect();
  const k = Math.min((area.height - 32) / single.H, (area.width - 32) / single.W);
  const f = $('#shotFrame');
  f.style.width = `${single.W}px`; f.style.height = `${single.H}px`; f.style.transform = `scale(${k})`;
  stage.style.width = `${single.W * k}px`; stage.style.height = `${single.H * k}px`;
  f.onload = async () => { try { await f.contentWindow.__appshot.ready; f.contentWindow.__appshot.show(state.sel); } catch {} };
  f.srcdoc = single.html;
  lint();
}

async function lint() {
  const store = state.size.startsWith('android') ? 'android' : 'ios';
  const r = await api('/api/lint', { plan: state.plan, locale: state.locale, store });
  const items = [...r.set.map((i) => ({ ...i, where: 'set' })), ...r.shots.flatMap((s) => s.issues.map((i) => ({ ...i, where: `#${s.index + 1}` })))];
  const errs = items.filter((i) => i.level === 'error').length;
  $('#issueCount').textContent = errs || '';
  $('#tab-issues').innerHTML = items.length
    ? items.map((i) => `<div class="issue ${i.level}"><b>${esc(i.where)}</b>${esc(i.code)} — ${esc(i.msg)}</div>`).join('')
    : '<div class="issue">No issues for this locale and store.</div>';
  const mine = r.shots.find((s) => s.index === state.sel);
  const box = document.getElementById('shotIssues');
  if (box) box.innerHTML = (mine?.issues || []).filter((i) => i.level !== 'info').map((i) => `<div class="issue ${i.level}">${esc(i.msg)}</div>`).join('');
}

const field = (label, html, hint) => `<div class="field"><label>${esc(label)}</label>${html}${hint ? `<div class="hint">${esc(hint)}</div>` : ''}</div>`;
const range = (key, min, max, step, val, label) => field(label, `<div class="range"><input type="range" data-opt="${key}" min="${min}" max="${max}" step="${step}" value="${val}"><output>${val}</output></div>`);

function renderInspector() {
  const s = shot();
  const m = state.meta.layouts.find((x) => x.id === (s.layout || 'hero-device')) || {};
  const o = s.options || {};
  const screenOpts = [['', '— none —'], ...state.raw.map((r) => [r, r.replace('raw/', '')])];
  const screens = s.screens || (s.screen ? [s.screen] : []);
  const need = Math.max(1, m.needs?.screens || 1);
  $('#tab-shot').innerHTML = `
    <div class="actions"><button data-act="left">← Move</button><button data-act="right">Move →</button><button data-act="dup">Duplicate</button><button data-act="add">+ New</button><button data-act="del">Delete</button></div>
    ${field('Layout', `<select id="f-layout">${state.meta.layouts.map((l) => `<option value="${l.id}"${l.id === (s.layout || 'hero-device') ? ' selected' : ''}>${l.hook ? '★ ' : ''}${esc(l.name)}</option>`).join('')}</select>`, m.summary)}
    ${Array.from({ length: need }, (_, i) => field(need > 1 ? `Screen ${i + 1}` : 'Screen', `<select data-screen="${i}">${screenOpts.map(([v, t]) => `<option value="${esc(v)}"${(typeof screens[i] === 'string' ? screens[i] : '') === v ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>`)).join('')}
    ${field(`Headline (${state.locale})`, `<textarea id="f-headline" rows="2">${esc(L(s.headline))}</textarea>`, '**word** = accent highlight · keep it 2–6 words')}
    ${field(`Subhead (${state.locale})`, `<textarea id="f-subhead" rows="2">${esc(L(s.subhead))}</textarea>`)}
    <div id="shotIssues"></div>
    <div class="row2">
      ${field('Eyebrow', `<input type="text" id="f-eyebrow" value="${esc(L(s.eyebrow))}">`)}
      ${field('Theme', `<select id="f-theme"><option value="">(set theme)</option>${state.meta.themes.map((t) => `<option value="${t.id}"${s.theme === t.id ? ' selected' : ''}>${esc(t.name)}</option>`).join('')}</select>`)}
    </div>
    ${range('deviceScale', 0.4, 1, 0.01, o.deviceScale ?? 0.8, 'Device size')}
    ${range('rotate', -20, 20, 0.5, o.rotate ?? 0, 'Rotation')}
    ${range('textSize', 6, 16, 0.2, o.textSize ?? 10, 'Max headline size')}
    <div class="row2">
      ${field('Frame', `<select data-opt-select="frame"><option value="">(auto)</option>${state.meta.frames.map((f) => `<option${o.frame === f ? ' selected' : ''}>${f}</option>`).join('')}</select>`)}
      ${field('Device colour', `<select data-opt-select="deviceColor"><option value="">(theme)</option>${['black', 'natural', 'white', 'silver', 'desert', 'blue', 'graphite', 'gold', 'pink'].map((c) => `<option${o.deviceColor === c ? ' selected' : ''}>${c}</option>`).join('')}</select>`)}
    </div>
    <details><summary>Advanced: shot JSON (cards, bullets, zoom, notifications…)</summary><textarea id="f-json" rows="14" style="margin-top:8px;font:12px ui-monospace,Menlo">${esc(JSON.stringify(s, null, 2))}</textarea><button id="applyJson" style="margin-top:6px">Apply JSON</button></details>`;
  const p = state.plan;
  $('#tab-set').innerHTML = `
    ${field('App name', `<input type="text" id="p-name" value="${esc(L(p.app?.name))}">`)}
    ${field('Theme', `<select id="p-theme">${state.meta.themes.map((t) => `<option value="${t.id}"${p.theme === t.id ? ' selected' : ''}>${esc(t.name)} ${t.dark ? '· dark' : '· light'}</option>`).join('')}</select>`, state.meta.themes.find((t) => t.id === p.theme)?.description)}
    <div class="row2">
      ${field('Accent', `<input type="color" id="p-accent" value="${p.themeOverrides?.accent || state.meta.themes.find((t) => t.id === p.theme)?.accent || '#7c8cff'}">`)}
      ${field('Panorama', `<label style="text-transform:none;display:flex;gap:6px;align-items:center;color:var(--fg)"><input type="checkbox" id="p-pano"${p.panorama ? ' checked' : ''}> one continuous background</label>`)}
    </div>
    ${field('Keywords (' + state.locale + ')', `<input type="text" id="p-kw" value="${esc(((Array.isArray(p.keywords) ? p.keywords : p.keywords?.[state.locale]) || []).join(', '))}">`, 'Top search terms — the scorer checks they appear in shots 1–3')}
    ${field('Sizes', `<div class="chk">${state.meta.sizes.map((s) => `<label><input type="checkbox" data-size="${s.id}"${(p.sizes || []).includes(s.id) ? ' checked' : ''}>${s.id}</label>`).join('')}</div>`)}
    ${field('Locales', `<div class="chk">${state.meta.locales.map((l) => `<label title="${esc(l.name)}"><input type="checkbox" data-loc="${l.id}"${(p.locales || []).includes(l.id) ? ' checked' : ''}>${l.id}</label>`).join('')}</div>`, 'New locales get empty captions — fill them per skills/locales/<id>.md')}
    <div id="scoreBox"></div>`;
}

// ---- events ----
document.addEventListener('input', (e) => {
  const s = shot(), t = e.target;
  if (t.id === 'f-headline') setL(s, 'headline', t.value);
  else if (t.id === 'f-subhead') setL(s, 'subhead', t.value);
  else if (t.id === 'f-eyebrow') setL(s, 'eyebrow', t.value);
  else if (t.dataset.opt) { s.options ||= {}; s.options[t.dataset.opt] = Number(t.value); t.nextElementSibling.value = t.value; }
  else if (t.id === 'p-name') state.plan.app.name = t.value;
  else if (t.id === 'p-accent') { state.plan.themeOverrides ||= {}; state.plan.themeOverrides.accent = t.value; }
  else if (t.id === 'p-kw') { const list = t.value.split(',').map((x) => x.trim()).filter(Boolean); if (Array.isArray(state.plan.keywords) || !state.plan.keywords) state.plan.keywords = {}; state.plan.keywords[state.locale] = list; }
  else return;
  markDirty();
});
document.addEventListener('change', (e) => {
  const s = shot(), t = e.target, p = state.plan;
  if (t.id === 'f-layout') { s.layout = t.value; renderInspector(); }
  else if (t.dataset.screen !== undefined) {
    const i = Number(t.dataset.screen);
    const list = s.screens || (s.screen ? [s.screen] : []);
    list[i] = t.value || undefined;
    const clean = list.filter(Boolean);
    delete s.screen; delete s.screens;
    if (clean.length > 1) s.screens = clean; else if (clean.length) s.screen = clean[0];
  } else if (t.id === 'f-theme') { if (t.value) s.theme = t.value; else delete s.theme; }
  else if (t.dataset.optSelect) { s.options ||= {}; if (t.value) s.options[t.dataset.optSelect] = t.value; else delete s.options[t.dataset.optSelect]; }
  else if (t.id === 'p-theme') { p.theme = t.value; if (p.themeOverrides) delete p.themeOverrides.accent; renderInspector(); }
  else if (t.id === 'p-pano') p.panorama = t.checked;
  else if (t.dataset.size) { const set = new Set(p.sizes || []); t.checked ? set.add(t.dataset.size) : set.delete(t.dataset.size); p.sizes = [...set]; }
  else if (t.dataset.loc) {
    const set = new Set(p.locales || []); t.checked ? set.add(t.dataset.loc) : set.delete(t.dataset.loc); p.locales = [...set];
    fillSelect($('#locale'), p.locales.map((l) => [l, l]), state.locale);
  } else if (t.id === 'size') { state.size = t.value; refresh(); return; }
  else if (t.id === 'locale') { state.locale = t.value; renderInspector(); refresh(); return; }
  else return;
  markDirty();
});
document.addEventListener('click', async (e) => {
  const t = e.target.closest('button, .hit');
  if (!t) return;
  const shots = state.plan.shots;
  if (t.classList.contains('hit')) { state.sel = Number(t.dataset.i); renderInspector(); document.querySelectorAll('.hit').forEach((h, i) => h.classList.toggle('on', i === state.sel)); try { $('#shotFrame').contentWindow.__appshot.show(state.sel); } catch {} lint(); return; }
  if (t.dataset.tab) { state.tab = t.dataset.tab; document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('on', b === t)); for (const id of ['shot', 'set', 'issues', 'design']) $(`#tab-${id}`).hidden = id !== state.tab; if (state.tab === 'design') renderDesign(); return; }
  if (t.dataset.dir) { const r = await api('/api/design/apply', { plan: state.plan, key: t.dataset.dir }); state.plan = r.plan; log(`✓ Direction ${t.dataset.dir.toUpperCase()} applied — theme ${r.plan.theme}, opening ${r.plan.shots[0].layout}${r.plan.panorama ? ', panorama' : ''} (Save to keep it)`); renderInspector(); markDirty(); return; }
  if (t.id === 'runTournament') { log('▸ Writing the three directions as variants and running the tournament…'); const r = await api('/api/design/tournament', { size: state.size, locale: state.locale }); log(r.code === 0 ? '✓ Tournament finished' : '✗ Tournament failed'); renderDesign(); return; }
  if (t.id === 'scanMarket') { log('▸ Scanning the App Store for the plan keywords…'); await api('/api/market/scan', {}); renderDesign(); return; }
  const act = t.dataset.act;
  if (act === 'left' && state.sel > 0) { [shots[state.sel - 1], shots[state.sel]] = [shots[state.sel], shots[state.sel - 1]]; state.sel--; }
  else if (act === 'right' && state.sel < shots.length - 1) { [shots[state.sel + 1], shots[state.sel]] = [shots[state.sel], shots[state.sel + 1]]; state.sel++; }
  else if (act === 'dup') { const c = JSON.parse(JSON.stringify(shot())); c.id = `${c.id || 'shot'}-copy`; shots.splice(state.sel + 1, 0, c); state.sel++; }
  else if (act === 'add') { shots.splice(state.sel + 1, 0, { id: `shot-${shots.length + 1}`, layout: 'hero-device', screen: state.raw[0], headline: {}, subhead: {} }); state.sel++; }
  else if (act === 'del' && shots.length > 1 && confirm('Delete this shot?')) { shots.splice(state.sel, 1); state.sel = Math.max(0, state.sel - 1); }
  else if (t.id === 'applyJson') { try { shots[state.sel] = JSON.parse($('#f-json').value); } catch (err) { alert(`Invalid JSON: ${err.message}`); return; } }
  else if (t.id === 'save') return save();
  else if (t.id === 'draft' || t.id === 'final') return render(t.id === 'draft');
  else if (t.id === 'score') return score();
  else if (t.id === 'reload') return load();
  else if (t.id === 'keep') { $('#banner').hidden = true; return; }
  else return;
  renderInspector(); markDirty();
});

// Directions tab: the design director's three directions for this app (with a live preview of the first three shots),
// the market scan, references and the last tournament.
async function renderDesign() {
  const box = $('#tab-design');
  box.innerHTML = '<div class="hint">Asking the design director…</div>';
  const d = await api('/api/design', { plan: state.plan });
  const t = d.tournament;
  const rank = (name) => t?.results?.find((r) => r.name === name);
  box.innerHTML = `
    <div class="field"><label>Three directions for this app</label><div class="hint">Niche, brand, market${d.active ? `, reference <b>${esc(d.active)}</b>` : ''} and real test results decide them. Captions and screens stay; theme, opening and panorama change.</div></div>
    ${d.directions.map((x) => { const r = rank(`dir-${x.key}`); return `<div class="dir">
      <div class="dir-head"><b>${x.key.toUpperCase()}</b> ${esc(x.theme)} · ${esc(x.opening)}${x.panorama ? ' · panorama' : ''}${r ? ` <span class="pill">${r.score}${r.distinct != null ? ` · distinct ${r.distinct}` : ''}</span>` : ''}</div>
      <div class="dir-prev" id="prev-${x.key}"></div>
      <details><summary>Why</summary>${x.reasons.map((w) => `<div class="hint">• ${esc(w)}</div>`).join('')}</details>
      <button data-dir="${x.key}">Use direction ${x.key.toUpperCase()}</button></div>`; }).join('')}
    <div class="actions"><button id="runTournament">Run tournament</button></div>
    ${t ? `<div class="field"><label>Last tournament · ${esc(t.size)} · ${esc(t.locale)}</label>${t.results.map((r, i) => `<div class="hint">${i + 1}. ${esc(r.name)} — ${r.score}${r.distinct != null ? ` · distinct ${r.distinct}` : ''}${r.refMatch != null ? ` · reference ${r.refMatch}` : ''}</div>`).join('')}</div>` : ''}
    <div class="field"><label>Market</label>${d.market ? `<div class="hint">${d.market.apps} apps for “${esc(d.market.terms.join('”, “'))}”</div>${d.market.lines.map((l) => `<div class="hint">• ${esc(l)}</div>`).join('')}${d.market.board ? `<a href="${d.market.board}" target="_blank">Open the market board</a>` : ''}` : '<div class="hint">No scan yet.</div>'}<div class="actions"><button id="scanMarket">${d.market ? 'Scan again' : 'Scan the App Store'}</button></div></div>
    <div class="field"><label>References</label>${d.references.length ? d.references.map((r) => `<div class="hint">${esc(r.name)}${r.name === d.active ? ' (active)' : ''}${r.board ? ` · <a href="${r.board}" target="_blank">board</a>` : r.studied ? '' : ' · not studied yet'}</div>`).join('') : '<div class="hint">None. Add one: node scripts/reference.mjs add &lt;images | video | App Store link&gt;</div>'}</div>`;
  // Previews: the first three shots of each direction at the current size and language, as a small strip.
  for (const x of d.directions) {
    const r = await api('/api/design/preview', { plan: state.plan, key: x.key, size: state.size, locale: state.locale });
    const el = $(`#prev-${x.key}`); if (!el) continue;
    const h = 150, k = h / r.H;
    el.style.height = `${h}px`; el.style.width = `${r.W * r.n * k}px`;
    el.innerHTML = `<iframe title="Direction ${x.key}" style="width:${r.W * r.n}px;height:${r.H}px;transform:scale(${k})"></iframe>`;
    el.firstChild.srcdoc = r.html;
  }
}

async function save() {
  const r = await api('/api/plan', { plan: state.plan }, 'PUT');
  if (r.status === 422) { log(`✗ Not saved:\n  ${r.errors.join('\n  ')}`); return false; }
  state.dirty = false; $('#dirty').hidden = true;
  log(`✓ Saved plan.json${r.warnings?.length ? ` (${r.warnings.length} warning(s))` : ''}`);
  return true;
}
async function render(draft) {
  if (state.dirty && !(await save())) return;
  log(`▸ Rendering ${draft ? 'drafts' : 'store-size PNGs'}…`);
  const r = await api('/api/render', { draft });
  log(r.code === 0 ? '✓ Render finished — review/ has fresh contact sheets' : '✗ Render failed');
}
async function score() {
  if (state.dirty && !(await save())) return;
  log('▸ Rendering drafts + scoring…');
  await api('/api/render', { draft: true, sizes: [state.size], locales: [state.locale] });
  const r = await api('/api/score', { draft: true });
  const res = (r.results || []).find((x) => x.size === state.size && x.locale === state.locale) || r.results?.[0];
  if (!res) { log(r.out || 'No score'); return; }
  log(`✓ ${res.size} · ${res.locale}: ${res.total}/100 (${res.verdict})`);
  const box = document.getElementById('scoreBox');
  if (box) box.innerHTML = `<div class="field"><label>Score · ${esc(res.size)} · ${esc(res.locale)}</label><div class="score">${res.total}<span style="font-size:14px;color:var(--muted)">/100 ${esc(res.verdict)}</span></div>${res.fixes.slice(0, 8).map((f) => `<div class="issue warn">+${f.pts} ${esc(f.msg)}</div>`).join('')}</div>`;
  document.querySelector('[data-tab="set"]').click();
}

const ev = new EventSource('/api/events');
ev.addEventListener('plan-changed', () => { if (state.dirty) $('#banner').hidden = false; else load(); });
ev.addEventListener('log', (e) => log(JSON.parse(e.data).line));
window.addEventListener('resize', schedule);
window.addEventListener('beforeunload', (e) => { if (state.dirty) { e.preventDefault(); e.returnValue = ''; } });
load().catch((e) => log(`✗ ${e.message}`));
