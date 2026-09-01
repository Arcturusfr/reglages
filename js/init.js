// INIT — écouteurs globaux et démarrage de l'application (+ enregistrement du service worker)
document.getElementById('modal-overlay').addEventListener('click',e=>{if(e.target===document.getElementById('modal-overlay'))closeModal();});

// INIT
loadTheme();loadPresets();renderGuide();
if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js').then(r=>console.log('[PWA]',r.scope)).catch(e=>console.warn('[PWA]',e));});}
