// POPUP — popup de détail d'un préréglage + drawer schéma (ouverture/fermeture, rendu, sheet)
function openPopup(id){
  currentPopupPreset=getPreset(id);if(!currentPopupPreset)return;
  currentPopupCondIdx=null;
  renderPopup();
  document.getElementById('popup-overlay').classList.add('open');
  showSchemaTab();
}
function closePopup(){
  document.getElementById('popup-overlay').classList.remove('open');
  closeSheet();
  hideSchemaTab();
}
function showSchemaTab(){document.getElementById('schema-tab').classList.add('visible');}
function hideSchemaTab(){document.getElementById('schema-tab').classList.remove('visible');}
function renderPopup(){
  const p=currentPopupPreset;const condIdx=currentPopupCondIdx;
  const hasConds=p.conditions&&p.conditions.length>0;
  const{params,overrides}=resolveParams(p,condIdx);
  const condSel=hasConds?`
    <div class="popup-conditions">
      <span class="conditions-label">🎛 Conditions</span>
      <select class="conditions-select" onchange="currentPopupCondIdx=this.value===''?null:parseInt(this.value);renderPopup()">
        <option value=""${condIdx===null?' selected':''}>— Réglages par défaut —</option>
        ${p.conditions.map((c,i)=>`<option value="${i}"${i===condIdx?' selected':''}>${esc(c.name)}</option>`).join('')}
      </select>
    </div>`:'';
  const paramsHtml=Object.entries(params).map(([k,v])=>{
    const isOv=condIdx!==null&&overrides[k];
    return`<div class="param-block">
      ${isOv?'<span class="param-override-badge">modifié</span>':''}
      <div class="param-label">${k}</div>
      <div class="param-value">${v.value}</div>
      ${v.note?`<div class="param-note">${v.note}</div>`:''}
    </div>`;}).join('');
  const tipsHtml=p.tips?.length?`<div class="tips-section"><div class="tips-label">Conseils</div>${p.tips.map(t=>`<div class="tip-item">${t}</div>`).join('')}</div>`:'';
  const warnHtml=p.warning?`<div class="warning-badge">${p.warning}</div>`:'';
  document.getElementById('popup-content').innerHTML=`
    <div class="popup-header">
      <button class="popup-back" onclick="closePopup()">←</button>
      <div class="popup-title-block">
        <div class="popup-title">${p.icon} ${p.name}</div>
        <div class="popup-desc">${p.description||''}</div>
      </div>
      <button class="popup-edit-btn" onclick="closePopup();openEditModal('${p.id}')">Modifier</button>
    </div>
    ${condSel}
    <div class="popup-body">
      ${warnHtml}
      <div class="params-grid">${paramsHtml}</div>
      ${tipsHtml}
    </div>
`;
  // Rafraîchir le schéma si déjà ouvert
  if(document.getElementById('sheet-overlay').classList.contains('open'))refreshSchema();
}

document.getElementById('popup-overlay').addEventListener('click',e=>{
  if(e.target===document.getElementById('popup-overlay'))closePopup();
});

// ═══════════════════════════════════════════
//  BOTTOM SHEET SCHÉMA
// ═══════════════════════════════════════════
function openSheet(){
  const overlay=document.getElementById('sheet-overlay');
  if(!overlay)return;
  overlay.classList.add('open');
  // Cacher l'onglet Boîtier (drawer ouvert = onglet intégré visible)
  document.getElementById('schema-tab')?.classList.remove('visible');
  if(currentPopupPreset){
    try{refreshSchema();}catch(e){console.warn('[openSheet]',e);}
    setTimeout(()=>{
      try{if(currentDrawerTab==='schema')positionAnnotations();}catch(e){console.warn('[pos]',e);}
    },120);
  }
}
function closeSheet(){
  document.getElementById('sheet-overlay').classList.remove('open');
  // Réafficher l'onglet Boîtier si popup encore ouvert
  if(document.getElementById('popup-overlay').classList.contains('open')){
    document.getElementById('schema-tab')?.classList.add('visible');
  }
}

// ═══════════════════════════════════════════
//  ANNOTATIONS — coords en % sur viewBox 2048×1365
//  slot: 'top' = étiquette au-dessus, 'bottom' = en dessous
// ═══════════════════════════════════════════
function handleSheetOverlayClick(e){
  if(e.target===document.getElementById('sheet-overlay'))closeSheet();
}

// ═══════════════════════════════════════════
//  MANAGE
// ═══════════════════════════════════════════
