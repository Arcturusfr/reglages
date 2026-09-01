// THEME — bascule clair/sombre, persistance localStorage
const LS_THEME='photomanuel_theme_v2';
function setTheme(t){
  document.documentElement.setAttribute('data-theme',t);
  document.getElementById('meta-theme').content=t==='dark'?'#0a0c10':'#f0ede6';
  document.getElementById('btn-dark').classList.toggle('active',t==='dark');
  document.getElementById('btn-light').classList.toggle('active',t==='light');
  localStorage.setItem(LS_THEME,t);
  // Rafraîchir SVG si sheet ouverte
  if(document.getElementById('sheet-overlay').classList.contains('open')) refreshSchema();
}
function loadTheme(){
  const s=localStorage.getItem(LS_THEME);
  setTheme(s||(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'));
}

// ═══════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════
