// SCHEMA DRAWER — logique du drawer schéma : vues, LCD, histogramme, cartes de contrôle, annotations
let currentAnnotations={front:[],back:[],lens:[]};
let currentView='front';
let currentDrawerTab='controls'; // onglet actif par défaut, cf. classe "active" sur #dtab-controls dans le HTML

// ── Couleur par paramètre (et non par catégorie) — partagée entre la légende
// texte et le schéma annoté, pour un rendu visuellement cohérent et diversifié.
function getActiveParamOrder(params){
  return Object.keys(params||{}).filter(p=>{
    const entry=PARAM_TO_CONTROLS_V3.M[p];
    return entry&&CONTROL_SEQUENCES[entry.sequence];
  });
}
function colorForParamName(paramName,order,isDark){
  const palette=isDark?LABEL_PALETTE_DARK:LABEL_PALETTE_LIGHT;
  const idx=order.indexOf(paramName);
  return palette[Math.max(0,idx)%palette.length];
}

function getActiveControlsByView(params){
  const byView={front:new Set(),back:new Set(),lens:new Set()};
  Object.keys(params).forEach(paramName=>{
    const entry=PARAM_TO_CONTROLS_V3.M[paramName];
    const steps=entry&&CONTROL_SEQUENCES[entry.sequence];
    if(!steps)return;
    steps.forEach(step=>step.options.forEach(opt=>byView[opt.view]?.add(opt.id)));
  });
  return{front:[...byView.front],back:[...byView.back],lens:[...byView.lens]};
}

const CIRCLED=['①','②','③','④','⑤'];
function describeActiveSequences(params){
  const out=[];
  Object.keys(params).forEach(paramName=>{
    const entry=PARAM_TO_CONTROLS_V3.M[paramName];
    const steps=entry&&CONTROL_SEQUENCES[entry.sequence];
    if(!steps)return;
    const text=steps.map((step,i)=>{
      const num=steps.length>1?(CIRCLED[i]||(i+1)+'.')+' ':'';
      return num+step.options.map(o=>o.label).join(' ou ');
    }).join('  →  ');
    out.push({param:paramName,label:text});
  });
  return out;
}

function bestView(front,back,lens){
  const scores={front:front.length, back:back.length, lens:lens.length};
  return Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0];
}

function switchView(v){
  currentView=v;
  ['front','back','lens'].forEach(x=>{
    document.getElementById('svt-'+x)?.classList.toggle('active',x===v);
    document.getElementById('view-'+x)?.classList.toggle('active',x===v);
  });
  setTimeout(positionAnnotations, 60);
}


function switchDrawerTab(tab){
  currentDrawerTab=tab;
  ['controls','screen','schema'].forEach(t=>{
    document.getElementById('dtab-'+t)?.classList.toggle('active',t===tab);
    document.getElementById('svt-'+t)?.classList.toggle('active',t===tab);
  });
  if(tab==='schema') setTimeout(positionAnnotations,80);
}

function toggleExpand(){
  const sheet=document.getElementById('bottom-sheet');
  const btn=document.getElementById('sheet-expand');
  const expanded=sheet.classList.toggle('expanded');
  if(btn) btn.textContent=expanded?'⤡':'⤢';
  // Repositionner les annotations si schéma visible
  if(currentDrawerTab==='schema') setTimeout(positionAnnotations,100);
}

function switchScreenTab(tab){
  ['info','liveview'].forEach(t=>{
    document.getElementById('stab-'+t)?.classList.toggle('active',t===tab);
    document.getElementById('sst-'+t)?.classList.toggle('active',t===tab);
  });
}

function refreshSchema(){
  if(!currentPopupPreset)return;
  const{params}=resolveParams(currentPopupPreset,currentPopupCondIdx);
  const{front,back,lens}=getActiveControlsByView(params);
  const condName=currentPopupCondIdx!==null
    ?currentPopupPreset.conditions[currentPopupCondIdx]?.name
    :'Réglages par défaut';
  document.getElementById('sheet-subtitle').textContent=
    `${currentPopupPreset.icon} ${currentPopupPreset.name} — ${condName}`;
  currentAnnotations={front,back,lens,paramsSnapshot:params};

  // ── LCD ──
  updateLCD(params,condName);

  // ── Mini-cartes ──
  buildControlCards(params);

  // ── Légende schéma ──
  const allLabels=describeActiveSequences(params);
  const legendItems=allLabels.length?allLabels:[{param:'',label:'Aucune commande spécifique'}];
  const isDarkNow=document.documentElement.getAttribute('data-theme')!=='light';
  const legendParamOrder=getActiveParamOrder(params);
  document.getElementById('schema-legend').innerHTML=`
    <div style="font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-dim);width:100%;margin-bottom:6px">Commandes concernées</div>
    ${legendItems.map(l=>{
      const dotStyle=l.param?`background:${colorForParamName(l.param,legendParamOrder,isDarkNow)};box-shadow:0 0 6px ${colorForParamName(l.param,legendParamOrder,isDarkNow)}88`:'';
      return `<div class="leg-item"><div class="leg-dot ${l.param?'':'leg-inactive'}" style="${dotStyle}"></div><span>${l.param?`<strong>${l.param}</strong> → `:''}${l.label}</span></div>`;
    }).join('')}`;
  // Vue auto pour l'onglet schéma
  const best=bestView(front,back,lens);
  switchView(best);

  if(document.getElementById('sheet-overlay').classList.contains('open')&&currentDrawerTab==='schema'){
    setTimeout(positionAnnotations,80);
  }
}

// ── Mise à jour de l'écran LCD ──
function updateLCD(params,condName){
  const p=currentPopupPreset;
  function get(key,fb='—'){return params[key]?.value||fb;}
  // ── Écran Info ──
  const pn=document.getElementById('lcd-preset-name');
  if(pn) pn.textContent=p.icon+' '+p.name;
  const cd=document.getElementById('lcd-cond');
  if(cd) cd.textContent=condName!=='Réglages par défaut'?'['+condName+']':'';
  function setVal(elId,key,fb='—'){
    const el=document.getElementById(elId);if(!el)return;
    el.textContent=get(key,fb);
    el.classList.toggle('active',!!params[key]);
  }
  setVal('lcd-av','Ouverture');setVal('lcd-tv','Vitesse');setVal('lcd-iso','ISO');
  setVal('lcd-wb','Balance des blancs');setVal('lcd-metering','Mode mesure');
  setVal('lcd-af','Mise au point');setVal('lcd-drive','Mode rafale');
  setVal('lcd-focal','Focale');setVal('lcd-format','Format','RAW');
  ['wb','metering','af','drive'].forEach(k=>{
    const map={wb:'Balance des blancs',metering:'Mode mesure',af:'Mise au point',drive:'Mode rafale'};
    const el=document.getElementById('lcd-'+k+'-blk');
    if(el) el.style.opacity=params[map[k]]?'1':'.3';
  });
  // ── Live View ──
  const lv={av:'Ouverture',tv:'Vitesse',iso:'ISO'};
  Object.entries(lv).forEach(([id,key])=>{
    const el=document.getElementById('lv-'+id);
    if(el) el.textContent=get(key,'—');
  });
  const wb=document.getElementById('lv-wb'); if(wb) wb.textContent='WB '+get('Balance des blancs','—');
  const af=document.getElementById('lv-af'); if(af) af.textContent='AF '+get('Mise au point','—').split(' ')[0];
  const dr=document.getElementById('lv-drive'); if(dr) dr.textContent='□ '+get('Mode rafale','—');
  const fm=document.getElementById('lv-format'); if(fm) fm.textContent=get('Format','RAW');
  // Histogramme décoratif
  drawHistogram(params);
}

function drawHistogram(params){
  const svg=document.getElementById('lv-histo-svg');if(!svg)return;
  svg.innerHTML='';
  // Générer des barres fictives dont la forme évoque l'exposition
  const hasISO=!!params['ISO'],hasAv=!!params['Ouverture'],hasTv=!!params['Vitesse'];
  const bars=20;const W=80,H=30;
  // Profil gaussien décalé selon exposition estimée
  const center=hasAv?38:hasISO?42:30;
  for(let i=0;i<bars;i++){
    const x=i*(W/bars);const bw=(W/bars)-1;
    const d=i*(W/bars)+bw/2-center;
    const h=Math.max(2,H*Math.exp(-d*d/200)*(.7+Math.random()*.3));
    const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x',x);rect.setAttribute('y',H-h);
    rect.setAttribute('width',bw);rect.setAttribute('height',h);
    rect.setAttribute('fill','rgba(255,255,255,.55)');
    svg.appendChild(rect);
  }
}

// ── Construction des mini-cartes ──
function buildControlCards(params){
  const container=document.getElementById('control-cards');
  if(!container)return;
  container.innerHTML='';

  const entries=Object.entries(params).filter(([k])=>k!=='Lieu');
  if(!entries.length){
    container.innerHTML='<div style="text-align:center;color:var(--text-dim);padding:20px;font-size:.9rem;">Aucune commande spécifique.</div>';
    return;
  }

  entries.forEach(([paramName,pval])=>{
    const cat=PARAM_CATEGORY[paramName]||'misc';
    const icon=CAT_ICON[cat]||'◈';
    const action=PARAM_ACTION[paramName]||'—';
    const hw=PARAM_HW[paramName]||'';

    const card=document.createElement('div');
    card.className=`ctrl-card cat-${cat}`;
    card.innerHTML=`
      <div class="ctrl-card-icon">${icon}</div>
      <div class="ctrl-card-body">
        <div class="ctrl-card-name">${paramName}</div>
        <div class="ctrl-card-value">${pval.value}</div>
        ${pval.note?`<div class="ctrl-card-action">ℹ ${pval.note}</div>`:''}
        <div class="ctrl-card-action">${action}</div>
        <div class="ctrl-card-hw">${hw}</div>
      </div>`;
    container.appendChild(card);
  });
}

// ═══════════════════════════════════════════
//  viewBox de référence pour chaque vue
// ═══════════════════════════════════════════
const VIEW_VIEWBOX={
  front:{w:2048,h:1365},
  back: {w:4096,h:1274},
  lens: {w:2120,h:2120},
};
// Marges internes (en unités viewBox) pour les étiquettes
const VB_MARGIN_TOP  = 300; // espace au-dessus du visuel pour les étiquettes haut
const VB_MARGIN_BOT  = 300; // espace en dessous pour les étiquettes bas
const LBL_H          = 74;  // hauteur d'une étiquette (unités vb)
const LBL_PAD_X      = 26;  // padding horizontal étiquette
const LBL_FONT       = 54;  // taille police étiquette
const LBL_CORNER     = 14;  // rayon coin arrondi
const LBL_TIER_GAP   = 34;  // écart vertical entre étages de lignes pour éviter les chevauchements
function positionAnnotations(){
  const viewWrapId=currentView==='front'?'svg-real-wrap':currentView==='back'?'svg-back-wrap':'svg-lens-wrap';
  const wrap=document.getElementById(viewWrapId);
  if(!wrap)return;
  ['svg-real-wrap','svg-back-wrap','svg-lens-wrap'].forEach(id=>{
    const w=document.getElementById(id);
    if(!w)return;
    w.querySelectorAll('.anno-overlay-svg').forEach(e=>e.remove());
    if(w._annoResizeObserver){w._annoResizeObserver.disconnect();w._annoResizeObserver=null;}
  });
  const activeIds=currentAnnotations[currentView]||[];
  const active=activeIds.filter(id=>CONTROL_COORDS[id]&&CONTROL_COORDS[id].view===currentView);
  if(!active.length)return;
  const isDark=document.documentElement.getAttribute('data-theme')!=='light';
  const vb=VIEW_VIEWBOX[currentView];
  const VBW=vb.w,VBH=vb.h;
  const VBY0=-VB_MARGIN_TOP,VBH2=VBH+VB_MARGIN_TOP+VB_MARGIN_BOT;
  const topIds=active.filter(id=>CONTROL_COORDS[id].slot==='top');
  const botIds=active.filter(id=>CONTROL_COORDS[id].slot==='bottom');
  const realSvg=wrap.querySelector('svg');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','anno-overlay-svg');
  svg.setAttribute('viewBox',`0 ${VBY0} ${VBW} ${VBH2}`);
  svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  wrap.style.position='relative';
  wrap.appendChild(svg);
  // ── Alignement pixel-perfect ──
  // Le viewBox du calque est plus HAUT que celui de l'image réelle (il inclut les
  // marges pour les étiquettes en haut/bas). Si on se contente de width:100%/height:100%
  // sur le calque, son "meet" le fait rentrer dans le cadre de l'image (proportions
  // différentes) → tout le contenu se retrouve compressé et recentré, désaligné des
  // vrais boutons. On calcule donc explicitement la taille et la position du calque
  // en pixels, à partir du rendu réel de l'image, pour que l'échelle soit identique.
  function syncOverlayGeometry(){
    if(!realSvg)return;
    const wrapRect=wrap.getBoundingClientRect();
    const imgRect=realSvg.getBoundingClientRect();
    if(!imgRect.width)return;
    const scale=imgRect.width/VBW;
    svg.setAttribute('style',
      `position:absolute;pointer-events:none;overflow:visible;z-index:4;`+
      `left:${imgRect.left-wrapRect.left}px;`+
      `top:${(imgRect.top-wrapRect.top)-VB_MARGIN_TOP*scale}px;`+
      `width:${imgRect.width}px;`+
      `height:${VBH2*scale}px;`);
    // Réserve de l'espace vertical autour du cadre pour que les étiquettes qui
    // débordent (au-dessus/en-dessous, cf. overflow:visible sur .svg-wrap) ne
    // chevauchent pas les éléments voisins (onglets, légende...).
    wrap.style.marginTop=(VB_MARGIN_TOP*scale+16)+'px';
    wrap.style.marginBottom=(VB_MARGIN_BOT*scale+16)+'px';
  }
  syncOverlayGeometry();
  if(window.ResizeObserver){
    const ro=new ResizeObserver(()=>syncOverlayGeometry());
    ro.observe(wrap);
    wrap._annoResizeObserver=ro;
  }
  function spreadVBX(ids){const n=ids.length;if(!n)return[];return ids.map((_,i)=>n===1?VBW/2:VBW*(i+1)/(n+1));}
  const topX=spreadVBX(topIds),botX=spreadVBX(botIds);

  function getParamForControl(ctrlId){
    const params=currentAnnotations.paramsSnapshot||{};
    for(const paramName of Object.keys(params)){
      const entry=PARAM_TO_CONTROLS_V3.M[paramName];
      const steps=entry&&CONTROL_SEQUENCES[entry.sequence];
      if(steps&&steps.some(s=>s.options.some(o=>o.id===ctrlId)))return paramName;
    }
    return null;
  }

  // Ordre stable des paramètres actifs → une couleur de palette par paramètre
  // (et non par catégorie), pour un contraste maximal entre étiquettes visibles
  // simultanément, même si plusieurs partagent la même catégorie (ex. Ouverture/ISO/Vitesse).
  const activeParamOrder=getActiveParamOrder(currentAnnotations.paramsSnapshot);
  function colorForParam(paramName){return colorForParamName(paramName,activeParamOrder,isDark);}

  function drawAnnotation(id,lblX,fromTop,tierIdx,tierCount){
    const coord=CONTROL_COORDS[id];
    const svgRoot=wrap.querySelector('svg');
    const anchor=svgRoot?.querySelector('#anchor-'+id);
    const px=anchor?parseFloat(anchor.getAttribute('cx')):(coord.x/100)*VBW;
    const py=anchor?parseFloat(anchor.getAttribute('cy')):(coord.y/100)*VBH;
    const paramName=getParamForControl(id);
    const col=colorForParam(paramName);
    const label=coord.label;
    const txtW=Math.max(label.length*LBL_FONT*0.52,120);
    const lblW=txtW+LBL_PAD_X*2;
    const lblX0=Math.max(10,Math.min(VBW-lblW-10,lblX-lblW/2));
    const lblCX=lblX0+lblW/2;
    const lblY0=fromTop?VBY0+20:VBH+VB_MARGIN_BOT-LBL_H-20;
    const lblCY=lblY0+LBL_H/2;
    // Fond étiquette
    const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x',lblX0);rect.setAttribute('y',lblY0);rect.setAttribute('width',lblW);rect.setAttribute('height',LBL_H);
    rect.setAttribute('rx',LBL_CORNER);rect.setAttribute('fill',isDark?'rgba(10,12,16,.9)':'rgba(250,248,244,.93)');
    rect.setAttribute('stroke',col);rect.setAttribute('stroke-width','4');
    svg.appendChild(rect);
    // Texte
    const txt=document.createElementNS('http://www.w3.org/2000/svg','text');
    txt.setAttribute('x',lblX0+lblW/2);txt.setAttribute('y',lblCY+LBL_FONT*0.38);
    txt.setAttribute('text-anchor','middle');
    txt.setAttribute('font-family','Inter,system-ui,sans-serif');
    txt.setAttribute('font-size',LBL_FONT);txt.setAttribute('font-weight','700');
    txt.setAttribute('fill',col);
    txt.textContent=label;
    svg.appendChild(txt);
    // Trait — chaque étiquette a son propre "étage" horizontal (tier) pour que
    // les lignes ne se superposent jamais, même si elles se croisent.
    const tierBase=fromTop?(VBY0+20+LBL_H+22):(VBH+22);
    const midY=tierBase+(tierIdx||0)*LBL_TIER_GAP;
    const tStartY=fromTop?lblY0+LBL_H:lblY0;
    const line=document.createElementNS('http://www.w3.org/2000/svg','path');
    line.setAttribute('d',`M ${lblCX} ${tStartY} L ${lblCX} ${midY} L ${px} ${midY} L ${px} ${py}`);
    line.setAttribute('fill','none');line.setAttribute('stroke',col);
    line.setAttribute('stroke-width','4');line.setAttribute('stroke-dasharray','10 6');
    line.setAttribute('stroke-linecap','round');line.setAttribute('opacity','.75');
    svg.appendChild(line);
    // Point
    const ring=document.createElementNS('http://www.w3.org/2000/svg','circle');
    ring.setAttribute('cx',px);ring.setAttribute('cy',py);ring.setAttribute('r',22);
    ring.setAttribute('fill','none');ring.setAttribute('stroke',col);ring.setAttribute('stroke-width','5');ring.setAttribute('opacity','.4');
    svg.appendChild(ring);
    const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');
    dot.setAttribute('cx',px);dot.setAttribute('cy',py);dot.setAttribute('r',13);
    dot.setAttribute('fill',col);dot.setAttribute('class','dot-active');
    svg.appendChild(dot);
  }
  topIds.forEach((id,i)=>drawAnnotation(id,topX[i],true,i,topIds.length));
  botIds.forEach((id,i)=>drawAnnotation(id,botX[i],false,i,botIds.length));
}
