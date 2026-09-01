// GUIDE — rendu de l'onglet Guide (grille de catégories/préréglages)
function renderGuide(){
  const cats=[...new Set(presets.map(p=>p.category))];
  document.getElementById('stats-row').innerHTML=
    `<div class="stat-pill"><strong>${presets.length}</strong> préréglages</div>
     <div class="stat-pill"><strong>${cats.length}</strong> catégories</div>`;
  document.getElementById('cat-grid').innerHTML=presets.map(p=>
    `<div class="cat-card" onclick="openPopup('${p.id}')">
       <span class="cat-icon">${p.icon}</span>
       <div class="cat-name">${p.name}</div>
     </div>`).join('');
}

// ═══════════════════════════════════════════
//  POPUP
// ═══════════════════════════════════════════
