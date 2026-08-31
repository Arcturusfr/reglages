// FORM — formulaire d'ajout/édition d'un préréglage (modale)
function openAddModal(){
  editingId=null;
  formState={activeTab:'default',defaultParams:{'Ouverture':{value:'',note:''},'ISO':{value:'',note:''},'Vitesse':{value:'',note:''}},conditions:[],tips:[]};
  document.getElementById('modal-title').textContent='Nouveau préréglage';
  renderForm();document.getElementById('modal-overlay').classList.add('open');
}
function openEditModal(id){
  editingId=id;const p=getPreset(id);
  formState={activeTab:'default',defaultParams:JSON.parse(JSON.stringify(p.defaultParams||{})),conditions:JSON.parse(JSON.stringify(p.conditions||[])),tips:[...(p.tips||[])]};
  document.getElementById('modal-title').textContent='Modifier le préréglage';
  renderForm();document.getElementById('modal-overlay').classList.add('open');
}
function closeModal(){document.getElementById('modal-overlay').classList.remove('open');editingId=null;}

function renderForm(){
  const p=editingId?getPreset(editingId):null;
  const{activeTab,defaultParams,conditions,tips}=formState;
  const tabs=[
    `<button class="cond-tab-btn is-default${activeTab==='default'?' active':''}" onclick="switchFormTab('default')">Défaut</button>`,
    ...conditions.map((c,i)=>`<button class="cond-tab-btn${activeTab===i?' active':''}" onclick="switchFormTab(${i})">${esc(c.name)||'Cond.'+(i+1)}</button>`),
    `<button class="cond-tab-btn" onclick="addCondition()" style="color:var(--gold)">＋ Condition</button>`
  ].join('');
  let panelHtml='';
  if(activeTab==='default'){
    const rows=Object.entries(defaultParams).map(([n,v])=>`
      <div class="param-form-row">
        <input class="form-input pf-name" placeholder="Nom" value="${esc(n)}" onchange="renameDefaultParam('${esc(n)}',this.value)" style="font-size:.82rem">
        <input class="form-input" placeholder="Valeur" value="${esc(v.value)}" oninput="formState.defaultParams['${esc(n)}'].value=this.value" style="font-size:.82rem">
        <input class="form-input" placeholder="Note" value="${esc(v.note)}" oninput="formState.defaultParams['${esc(n)}'].note=this.value" style="font-size:.82rem">
        <button type="button" class="btn-sm" onclick="removeDefaultParam('${esc(n)}')">✕</button>
      </div>`).join('');
    panelHtml=`<div style="font-size:.7rem;font-weight:600;color:var(--text-dim);margin-bottom:8px">NOM &nbsp;·&nbsp; VALEUR PAR DÉFAUT &nbsp;·&nbsp; NOTE</div>${rows}<button type="button" class="btn-add" onclick="addDefaultParam()">+ Ajouter un paramètre</button>`;
  }else{
    const ci=activeTab;const cond=conditions[ci];
    const overrideRows=Object.entries(cond.params).map(([n,v])=>`
      <div class="param-form-row">
        <input class="form-input pf-name" placeholder="Nom" value="${esc(n)}" onchange="renameCondParam(${ci},'${esc(n)}',this.value)" style="font-size:.82rem">
        <input class="form-input" placeholder="Valeur" value="${esc(v.value)}" oninput="formState.conditions[${ci}].params['${esc(n)}'].value=this.value" style="font-size:.82rem">
        <input class="form-input" placeholder="Note" value="${esc(v.note)}" oninput="formState.conditions[${ci}].params['${esc(n)}'].note=this.value" style="font-size:.82rem">
        <button type="button" class="btn-sm" onclick="removeCondParam(${ci},'${esc(n)}')">✕</button>
      </div>`).join('');
    const inherited=Object.keys(defaultParams).filter(n=>!cond.params[n]);
    const inheritedHtml=inherited.length?`<div style="font-size:.7rem;font-weight:600;color:var(--text-dim);margin:12px 0 6px">HÉRITÉS DU DÉFAUT (non modifiés)</div>${inherited.map(n=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;opacity:.55"><span style="font-size:.78rem;font-weight:600;color:var(--param-label);flex:1">${esc(n)}</span><span class="inherit-badge">${esc(defaultParams[n].value)}</span></div>`).join('')}`:'';
    panelHtml=`<div class="cond-name-row"><input class="form-input" placeholder="Nom de la condition" value="${esc(cond.name)}" oninput="formState.conditions[${ci}].name=this.value">${conditions.length>0?`<button type="button" class="btn-remove-cond" onclick="removeCondition(${ci})">Supprimer</button>`:''}</div><div style="font-size:.7rem;font-weight:600;color:var(--text-dim);margin-bottom:8px">PARAMÈTRES SPÉCIFIQUES À CETTE CONDITION</div>${overrideRows}<button type="button" class="btn-add" onclick="addCondParam(${ci})" style="margin-bottom:10px">+ Ajouter un paramètre spécifique</button>${inheritedHtml}`;
  }
  const tipRows=tips.map((t,i)=>`<div class="tip-input-row"><input class="form-input" placeholder="Conseil…" value="${esc(t)}" oninput="formState.tips[${i}]=this.value"><button type="button" class="btn-sm" onclick="removeTip(${i})">✕</button></div>`).join('');
  document.getElementById('modal-body').innerHTML=`
    <div class="two-col">
      <div class="form-group"><label class="form-label">Icône</label><input class="form-input" id="f-icon" maxlength="4" value="${esc(p?.icon||'📷')}" style="font-size:1.3rem"></div>
      <div class="form-group"><label class="form-label">Nom</label><input class="form-input" id="f-name" value="${esc(p?.name||'')}"></div>
    </div>
    <div class="two-col">
      <div class="form-group"><label class="form-label">Catégorie</label><input class="form-input" id="f-cat" list="cat-list" value="${esc(p?.category||'')}"><datalist id="cat-list">${[...new Set(presets.map(x=>x.category))].map(c=>`<option value="${esc(c)}">`).join('')}</datalist></div>
      <div class="form-group"><label class="form-label">Description</label><input class="form-input" id="f-desc" value="${esc(p?.description||'')}"></div>
    </div>
    <div class="divider"></div>
    <div class="section-label">Réglages</div>
    <div class="cond-tabs-wrap"><div class="cond-tabs-header">${tabs}</div><div class="cond-tab-body">${panelHtml}</div></div>
    <div class="divider"></div>
    <div class="section-label">Conseils</div>
    <div class="tips-form" id="tips-rows">${tipRows}</div>
    <button type="button" class="btn-add" onclick="addTipRow()" style="margin-top:6px">+ Ajouter un conseil</button>
    <div class="divider"></div>
    <div class="form-group"><label class="form-label">Avertissement de sécurité (optionnel)</label><textarea class="form-textarea" id="f-warn">${esc(p?.warning||'')}</textarea></div>
    <div class="form-actions">
      <button class="btn-primary" onclick="savePreset()">Enregistrer</button>
      <button class="btn-secondary" onclick="closeModal()">Annuler</button>
      ${editingId?`<button class="btn-danger" onclick="deleteFromModal('${editingId}')">Supprimer</button>`:''}
    </div>`;
  window.defaultParams=formState.defaultParams;
}

function switchFormTab(t){formState.activeTab=t;renderForm();}
function addDefaultParam(){const n='Param '+(Object.keys(formState.defaultParams).length+1);formState.defaultParams[n]={value:'',note:''};renderForm();}
function removeDefaultParam(n){if(Object.keys(formState.defaultParams).length<=1){toast('Au moins 1 paramètre requis','error');return;}delete formState.defaultParams[n];renderForm();}
function renameDefaultParam(old,nw){nw=nw.trim();if(!nw||nw===old)return;const e=Object.entries(formState.defaultParams);formState.defaultParams={};e.forEach(([k,v])=>{formState.defaultParams[k===old?nw:k]=v;});formState.conditions.forEach(c=>{if(c.params[old]){c.params[nw]=c.params[old];delete c.params[old];}});}
function addCondition(){formState.conditions.push({name:'Condition '+(formState.conditions.length+1),params:{}});formState.activeTab=formState.conditions.length-1;renderForm();}
function removeCondition(i){formState.conditions.splice(i,1);formState.activeTab='default';renderForm();}
function addCondParam(ci){const n='Param '+(Object.keys(formState.conditions[ci].params).length+1);formState.conditions[ci].params[n]={value:'',note:''};renderForm();}
function removeCondParam(ci,n){delete formState.conditions[ci].params[n];renderForm();}
function renameCondParam(ci,old,nw){nw=nw.trim();if(!nw||nw===old)return;const e=Object.entries(formState.conditions[ci].params);formState.conditions[ci].params={};e.forEach(([k,v])=>{formState.conditions[ci].params[k===old?nw:k]=v;});}
function addTipRow(){formState.tips.push('');renderForm();}
function removeTip(i){formState.tips.splice(i,1);renderForm();}

function savePreset(){
  const icon=document.getElementById('f-icon').value.trim()||'📷';
  const name=document.getElementById('f-name').value.trim();
  const category=document.getElementById('f-cat').value.trim();
  const description=document.getElementById('f-desc').value.trim();
  const warning=document.getElementById('f-warn').value.trim()||null;
  if(!name){toast('Le nom est requis','error');return;}
  const tips=formState.tips.filter(t=>t.trim());
  const defaultParams=formState.defaultParams;
  const conditions=formState.conditions.filter(c=>c.name.trim()).map(c=>({name:c.name.trim(),params:c.params}));
  if(editingId){
    const idx=presets.findIndex(p=>p.id===editingId);
    presets[idx]={...presets[idx],icon,name,category,description,warning,defaultParams,conditions,tips};
    toast('Préréglage mis à jour','success');
  }else{
    presets.push({id:'custom_'+Date.now(),icon,name,category,description,warning,defaultParams,conditions,tips});
    toast('Préréglage ajouté','success');
  }
  save();closeModal();renderGuide();renderManage();
}
function deleteFromModal(id){
  if(!confirm('Supprimer ce préréglage ?'))return;
  presets=presets.filter(p=>p.id!==id);
  save();closeModal();renderGuide();renderManage();toast('Préréglage supprimé','success');
}

// ═══════════════════════════════════════════
//  EXPORT / IMPORT
// ═══════════════════════════════════════════
