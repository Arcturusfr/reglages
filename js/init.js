// 2026-09-20 01:22 (Paris) — V025 — Injection des icônes SVG (ICONS) dans les éléments [data-icon] au démarrage.
// INIT — écouteurs globaux et démarrage de l'application (+ enregistrement du service worker)
document.getElementById('modal-overlay').addEventListener('click',e=>{if(e.target===document.getElementById('modal-overlay'))closeModal();});

// Icônes de navigation
document.querySelectorAll("[data-icon]").forEach(el=>{el.innerHTML=ICONS[el.dataset.icon]||"";});

// INIT
loadTheme();loadPresets();renderGuide();
if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js').then(r=>console.log('[PWA]',r.scope)).catch(e=>console.warn('[PWA]',e));});}
