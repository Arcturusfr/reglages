// MANAGE — rendu de l'onglet Préréglages (liste, suppression)
function renderManage(){
  document.getElementById('preset-list').innerHTML=presets.map(p=>{
    const nd=Object.keys(p.defaultParams||{}).length;
    const nc=p.conditions?.length||0;
    return`<div class="preset-item">
      <div class="preset-item-icon">${p.icon}</div>
      <div class="preset-item-info">
        <div class="preset-item-name">${p.name}</div>
        <div class="preset-item-params">${nd} paramètre${nd>1?'s':''} · ${nc} condition${nc>1?'s':''}</div>
      </div>
      <div class="preset-item-actions">
        <button class="btn-sm" onclick="openEditModal('${p.id}')" style="color:var(--gold)">✎</button>
        <button class="btn-sm" onclick="deletePreset('${p.id}')">✕</button>
      </div>
    </div>`;
  }).join('')||`<div style="text-align:center;color:var(--text-dim);padding:30px;font-size:.95rem;">Aucun préréglage.</div>`;
}
function deletePreset(id){
  if(!confirm('Supprimer ce préréglage ?'))return;
  presets=presets.filter(p=>p.id!==id);
  save();renderManage();renderGuide();toast('Préréglage supprimé','success');
}

// ═══════════════════════════════════════════
//  FORMULAIRE
// ═══════════════════════════════════════════
