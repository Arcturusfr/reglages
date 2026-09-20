// 2026-09-20 01:22 (Paris) — V025 — Ajout de ICONS (icônes SVG de navigation : retour, import/export, agrandir/réduire), remplaçant les glyphes texte ← ⇅ ⤢ ⤡ trop petits sur smartphone.
// UTILS — toast de notification, échappement HTML
// UTILS
let toastTimer;
function toast(msg,type=''){const el=document.getElementById('toast');el.textContent=msg;el.className='show '+type;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.className='',2800);}
function esc(s=''){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

// Icônes de navigation en SVG (trait épais, hérite de currentColor) — dimensionnées par CSS (.ico)
const _ico=p=>`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${p}"/></svg>`;
const ICONS={
  back:_ico('M20 12H4M11 5l-7 7 7 7'),
  swap:_ico('M8 20V4M3.5 8.5L8 4l4.5 4.5M16 4v16M11.5 15.5L16 20l4.5-4.5'),
  expand:_ico('M14 3h7v7M10 21H3v-7M21 3l-7.5 7.5M3 21l7.5-7.5'),
  collapse:_ico('M20 10h-6V4M4 14h6v6M14 10l7-7M10 14l-7 7'),
};
