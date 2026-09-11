// 2026-09-11 (Paris) — V020 — Harmonisation de la taille RÉELLE (pixels écran) des étiquettes entre les 3 schémas (avant/arrière/objectif), dans tous les modes du drawer. Cause : viewBox de largeurs différentes (2048/1536/2120) + vue Objectif affichée à 50% de la largeur de colonne (vs 100% pour avant/arrière) → à taille de police fixe en unités viewBox, le texte rendu était ~25% plus petit sur la vue avant et ~2,3× plus petit sur la vue objectif que sur la vue arrière. Ajout de VIEW_WRAP_RATIO + labelScaleForView() qui calcule, par vue, un facteur multiplicatif appliqué à toutes les tailles/marges d'étiquette (police, hauteur de boîte, paddings, marges de réserve, écarts d'étage) de sorte que la taille réelle affichée soit identique partout — sans jamais réduire la vue de référence (arrière, déjà la plus grande). Aucune modification des marqueurs (points/anneaux d'ancrage) ni des épaisseurs de trait, volontairement laissés à taille fixe.
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
  back: {w:1536,h:864}, // FaceArr_vector.svg (nouveau schéma arrière)
  lens: {w:2120,h:2120},
};
// ── Harmonisation de la taille RÉELLE (pixels écran) des étiquettes entre les 3 vues ──
// Les 3 schémas ont des viewBox de largeurs différentes (2048/1536/2120) et ne sont pas
// affichés à la même largeur relative dans le drawer : la vue Objectif est volontairement
// réduite à 50% de la largeur de colonne disponible (cf. styles.css #svg-lens-wrap{max-width:50%}),
// alors que les vues Avant/Arrière occupent 100% de cette même largeur, dans tous les modes
// du drawer (normal ou agrandi — les 2 partagent les mêmes ratios). À taille de police fixe
// en unités viewBox, le texte rendu apparaît donc plus petit à mesure que (viewBox ÷ ratio
// d'affichage) grandit. VIEW_MAX_WIDTH_RATIO documente ce ratio de max-width par vue (à
// resynchroniser avec styles.css si celui-ci change) ; labelScaleForView() mesure EN DIRECT
// (getBoundingClientRect, pas de valeur de padding CSS codée en dur) la largeur réellement
// affichée de la vue courante et celle du padding interne de son wrapper, pour en déduire —
// via ce même ratio — quelle serait la largeur d'affichage de la vue de RÉFÉRENCE (Arrière,
// jamais réduite) dans la même colonne, puis le facteur exact à appliquer à toutes les
// tailles/marges d'étiquette (unités viewBox) pour une taille réelle identique entre les 3
// vues, y compris si le padding CSS du wrapper change plus tard.
const VIEW_MAX_WIDTH_RATIO={front:1,back:1,lens:0.5};
const LABEL_REF_VIEW='back';
function labelScaleForView(view,wrapEl,realSvgEl,vbw){
  const wrapRect=wrapEl&&wrapEl.getBoundingClientRect();
  const svgWidth=realSvgEl&&realSvgEl.getBoundingClientRect().width;
  if(!wrapRect||!wrapRect.width||!svgWidth)return 1;
  const hpad=Math.max(0,wrapRect.width-svgWidth);
  const columnWidth=wrapRect.width/(VIEW_MAX_WIDTH_RATIO[view]||1);
  const refWrapWidth=columnWidth*(VIEW_MAX_WIDTH_RATIO[LABEL_REF_VIEW]||1);
  const refSvgWidth=Math.max(1,refWrapWidth-hpad);
  const refScale=refSvgWidth/VIEW_VIEWBOX[LABEL_REF_VIEW].w;
  const curScale=svgWidth/vbw;
  return curScale>0?refScale/curScale:1;
}
// Marges/dimensions des étiquettes, en unités viewBox — valeurs de RÉFÉRENCE (celles de la
// vue de référence LABEL_REF_VIEW, cf. ci-dessus), multipliées par labelScaleForView() au
// moment du tracé pour obtenir la taille réelle harmonisée sur chaque schéma.
const VB_MARGIN_TOP  = 340; // espace au-dessus du visuel pour les étiquettes haut (agrandi pour 2 lignes)
const VB_MARGIN_BOT  = 340; // espace en dessous pour les étiquettes bas (agrandi pour 2 lignes)
const LBL_H          = 74;  // hauteur d'une étiquette à une seule ligne (repli, unités vb)
const LBL_H3         = 204; // hauteur d'une étiquette à 3 lignes : nom du contrôle / PARAMÈTRE / VALEUR (agrandie pour accueillir les 3 lignes à taille harmonisée)
const LBL_PAD_X      = 26;  // padding horizontal étiquette
const LBL_FONT       = 54;  // taille police, harmonisée sur les 3 lignes (calée sur la plus grande taille existante)
const LBL_FONT1      = 54;  // taille police ligne 1 (nom du contrôle physique) — harmonisée avec LBL_FONT
const LBL_FONT2      = 54;  // taille police ligne 2 (nom du paramètre, en majuscules) — harmonisée avec LBL_FONT
const LBL_CORNER     = 14;  // rayon coin arrondi
const LBL_TIER_GAP   = 34;  // écart vertical entre étages de lignes pour éviter les chevauchements
const LBL_GAP_EDGE   = 20;  // écart entre le bord de la marge réservée et le haut/bas de l'étiquette
const LBL_PAD_TOP    = 16;  // padding interne haut, avant la 1ère ligne de texte
const LBL_PAD_BOTTOM = 26;  // padding interne bas, sous la dernière ligne (cas 3 lignes)
const LBL_TIER_START = 22;  // écart entre le bord de l'étiquette et le démarrage du 1er étage de trait
const ROW_GAP         = 22; // écart horizontal minimal entre deux étiquettes voisines d'une même rangée
const LBL_MIN_W       = 120;// largeur minimale d'étiquette (repli si le texte est très court)
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
  const realSvg=wrap.querySelector('svg');
  // ── Facteur d'harmonisation de taille pour la vue courante (mesure live, cf. explication ci-dessus) ──
  const LS=labelScaleForView(currentView,wrap,realSvg,VBW);
  const marginTop=VB_MARGIN_TOP*LS, marginBot=VB_MARGIN_BOT*LS;
  const lblH=LBL_H*LS, lblH3=LBL_H3*LS, padX=LBL_PAD_X*LS;
  const font=LBL_FONT*LS, font1=LBL_FONT1*LS, font2=LBL_FONT2*LS;
  const corner=LBL_CORNER*LS, tierGap=LBL_TIER_GAP*LS;
  const gapEdge=LBL_GAP_EDGE*LS, padTop=LBL_PAD_TOP*LS, padBottom=LBL_PAD_BOTTOM*LS, tierStart=LBL_TIER_START*LS;
  const rowGap=ROW_GAP*LS, minLblW=LBL_MIN_W*LS;
  const VBY0=-marginTop,VBH2=VBH+marginTop+marginBot;
  const topIds=active.filter(id=>CONTROL_COORDS[id].slot==='top');
  const botIds=active.filter(id=>CONTROL_COORDS[id].slot==='bottom');
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
      `top:${(imgRect.top-wrapRect.top)-marginTop*scale}px;`+
      `width:${imgRect.width}px;`+
      `height:${VBH2*scale}px;`);
    // Réserve de l'espace vertical autour du cadre pour que les étiquettes qui
    // débordent (au-dessus/en-dessous, cf. overflow:visible sur .svg-wrap) ne
    // chevauchent pas les éléments voisins (onglets, légende...).
    wrap.style.marginTop=(marginTop*scale+16)+'px';
    wrap.style.marginBottom=(marginBot*scale+16)+'px';
  }
  syncOverlayGeometry();
  if(window.ResizeObserver){
    const ro=new ResizeObserver(()=>syncOverlayGeometry());
    ro.observe(wrap);
    wrap._annoResizeObserver=ro;
  }
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

  const MAX_LABEL_CHARS=24; // tronque les noms de contrôle très longs (ex. "Bouton DISP/BACK (menu Q réduit)") pour borner la largeur de l'étiquette

  // ── Étape 1 : mesurer chaque étiquette (texte + dimensions) avant tout placement ──
  function buildLabelData(id){
    const coord=CONTROL_COORDS[id];
    const svgRoot=wrap.querySelector('svg');
    const anchor=svgRoot?.querySelector('#anchor-'+id);
    const px=anchor?parseFloat(anchor.getAttribute('cx')):(coord.x/100)*VBW;
    const py=anchor?parseFloat(anchor.getAttribute('cy')):(coord.y/100)*VBH;
    const paramName=getParamForControl(id);
    const col=colorForParam(paramName);
    const rawLabel=coord.label; // nom du contrôle physique (ex. "Molette vitesse")
    const label=rawLabel.length>MAX_LABEL_CHARS?rawLabel.slice(0,MAX_LABEL_CHARS-1)+'…':rawLabel;
    // Paramètre + valeur du réglage concerné, sur 2 sous-lignes distinctes (nom, puis
    // valeur) plutôt que concaténées : la largeur de l'étiquette dépend alors du plus
    // long des deux mots, pas de leur somme, ce qui évite les collisions entre
    // étiquettes voisines quand la valeur est longue (ex. "Nuageux / 6000 K").
    const pval=paramName?(currentAnnotations.paramsSnapshot||{})[paramName]:null;
    const paramLine=pval&&pval.value?paramName.toUpperCase():null;
    const valueLine=pval&&pval.value?pval.value:null;
    const hasValue=!!valueLine;
    const boxH=hasValue?lblH3:lblH;
    const line1W=label.length*font1*0.56;
    const line2W=hasValue?paramLine.length*font2*0.56:0;
    const line3W=hasValue?valueLine.length*font*0.52:0;
    const txtW=Math.max(line1W,line2W,line3W,minLblW);
    const lblW=txtW+padX*2;
    return{id,px,py,col,label,paramLine,valueLine,hasValue,boxH,lblW};
  }

  // ── Étape 2 : résoudre les collisions horizontales le long d'une même rangée ──
  // Chaque étiquette vise le x de sa propre ancre ; en cas de chevauchement avec
  // sa voisine (largeurs réelles, pas une répartition fixe en tiers), on la pousse
  // vers la droite, puis on ramène l'ensemble dans le cadre si besoin.
  function resolveRow(ids){
    const items=ids.map(buildLabelData).sort((a,b)=>a.px-b.px);
    items.forEach(it=>{it.centerX=Math.min(VBW-10-it.lblW/2,Math.max(10+it.lblW/2,it.px));});
    for(let i=1;i<items.length;i++){
      const prev=items[i-1],cur=items[i];
      const minCenter=prev.centerX+prev.lblW/2+rowGap+cur.lblW/2;
      if(cur.centerX<minCenter) cur.centerX=minCenter;
    }
    const last=items[items.length-1];
    if(last){
      const overflow=(last.centerX+last.lblW/2)-(VBW-10);
      if(overflow>0){
        items.forEach(it=>it.centerX-=overflow);
        for(let i=items.length-2;i>=0;i--){
          const next=items[i+1],cur=items[i];
          const maxCenter=next.centerX-next.lblW/2-rowGap-cur.lblW/2;
          if(cur.centerX>maxCenter) cur.centerX=maxCenter;
        }
      }
    }
    return items;
  }

  // ── Étape 3 : dessiner chaque étiquette à sa position résolue ──
  function drawAnnotation(it,fromTop,tierIdx){
    const{px,py,col,label,paramLine,valueLine,hasValue,boxH,lblW,centerX}=it;
    const lblX0=centerX-lblW/2;
    const lblCX=centerX;
    const lblY0=fromTop?VBY0+gapEdge:VBH+marginBot-boxH-gapEdge;
    const lblCY=lblY0+boxH/2;
    // Fond étiquette
    const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x',lblX0);rect.setAttribute('y',lblY0);rect.setAttribute('width',lblW);rect.setAttribute('height',boxH);
    rect.setAttribute('rx',corner);rect.setAttribute('fill',isDark?'rgba(10,12,16,.9)':'rgba(250,248,244,.93)');
    rect.setAttribute('stroke',col);rect.setAttribute('stroke-width','4');
    svg.appendChild(rect);
    // Texte
    if(hasValue){
      // Ligne 1 — nom du contrôle physique, discret, en haut de l'étiquette
      const txt1=document.createElementNS('http://www.w3.org/2000/svg','text');
      txt1.setAttribute('x',lblCX);txt1.setAttribute('y',lblY0+padTop+font1*0.8);
      txt1.setAttribute('text-anchor','middle');
      txt1.setAttribute('font-family','Inter,system-ui,sans-serif');
      txt1.setAttribute('font-size',font1);txt1.setAttribute('font-weight','600');
      txt1.setAttribute('fill',isDark?'rgba(232,242,248,.65)':'rgba(20,20,20,.68)');
      txt1.textContent=label;
      svg.appendChild(txt1);
      // Ligne 2 — nom du PARAMÈTRE, en majuscules, taille intermédiaire
      const txt2=document.createElementNS('http://www.w3.org/2000/svg','text');
      txt2.setAttribute('x',lblCX);txt2.setAttribute('y',lblY0+padTop+font1+font2*0.85);
      txt2.setAttribute('text-anchor','middle');
      txt2.setAttribute('font-family','Inter,system-ui,sans-serif');
      txt2.setAttribute('font-size',font2);txt2.setAttribute('font-weight','700');
      txt2.setAttribute('fill',col);
      txt2.setAttribute('letter-spacing','.5');
      txt2.textContent=paramLine;
      svg.appendChild(txt2);
      // Ligne 3 — VALEUR du réglage, mise en avant (couleur du paramètre, gras, plus grand)
      const txt3=document.createElementNS('http://www.w3.org/2000/svg','text');
      txt3.setAttribute('x',lblCX);txt3.setAttribute('y',lblY0+boxH-padBottom);
      txt3.setAttribute('text-anchor','middle');
      txt3.setAttribute('font-family','Inter,system-ui,sans-serif');
      txt3.setAttribute('font-size',font);txt3.setAttribute('font-weight','700');
      txt3.setAttribute('fill',col);
      txt3.textContent=valueLine;
      svg.appendChild(txt3);
    }else{
      // Repli : uniquement le nom du contrôle (aucun paramètre actif identifié)
      const txt=document.createElementNS('http://www.w3.org/2000/svg','text');
      txt.setAttribute('x',lblCX);txt.setAttribute('y',lblCY+font*0.38);
      txt.setAttribute('text-anchor','middle');
      txt.setAttribute('font-family','Inter,system-ui,sans-serif');
      txt.setAttribute('font-size',font);txt.setAttribute('font-weight','700');
      txt.setAttribute('fill',col);
      txt.textContent=label;
      svg.appendChild(txt);
    }
    // Trait — chaque étiquette a son propre "étage" horizontal (tier) pour que
    // les lignes ne se superposent jamais, même si elles se croisent.
    const tierBase=fromTop?(VBY0+gapEdge+boxH+tierStart):(VBH+tierStart);
    const midY=tierBase+(tierIdx||0)*tierGap;
    const tStartY=fromTop?lblY0+boxH:lblY0;
    const line=document.createElementNS('http://www.w3.org/2000/svg','path');
    line.setAttribute('d',`M ${lblCX} ${tStartY} L ${lblCX} ${midY} L ${px} ${midY} L ${px} ${py}`);
    line.setAttribute('fill','none');line.setAttribute('stroke',col);
    line.setAttribute('stroke-width','4');line.setAttribute('stroke-dasharray','10 6');
    line.setAttribute('stroke-linecap','round');line.setAttribute('opacity','.75');
    svg.appendChild(line);
    // Point — taille fixe (repère de position sur la photo), volontairement non affecté
    // par le facteur d'harmonisation LS qui ne concerne que les étiquettes elles-mêmes.
    const ring=document.createElementNS('http://www.w3.org/2000/svg','circle');
    ring.setAttribute('cx',px);ring.setAttribute('cy',py);ring.setAttribute('r',22);
    ring.setAttribute('fill','none');ring.setAttribute('stroke',col);ring.setAttribute('stroke-width','5');ring.setAttribute('opacity','.4');
    svg.appendChild(ring);
    const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');
    dot.setAttribute('cx',px);dot.setAttribute('cy',py);dot.setAttribute('r',13);
    dot.setAttribute('fill',col);dot.setAttribute('class','dot-active');
    svg.appendChild(dot);
  }
  const topItems=resolveRow(topIds),botItems=resolveRow(botIds);
  topItems.forEach((it,i)=>drawAnnotation(it,true,i));
  botItems.forEach((it,i)=>drawAnnotation(it,false,i));
}
