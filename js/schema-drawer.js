// 2026-09-20 01:22 (Paris) — V025 — (1) toggleExpand() utilise ICONS.expand/collapse (SVG) au lieu des glyphes ⤢/⤡. (2) Étiquettes cliquables : si getControlDetail(id) existe (js/control-data.js), l'étiquette reçoit une icône ⓘ (largeur augmentée, texte décalé), devient un <g role="button"> à pointer-events:all et ouvre openControlDetail() (js/control-popup.js) avec le paramètre et la valeur concernés. Les autres étiquettes sont inchangées.
// 2026-09-14 15:42 (Paris) — V023 — (1) Libellé 'Molette vitesse'→'Molette arrière' n'affecte pas ce fichier directement (voir schema-data.js) mais la ligne de rappel est désormais tracée en épaisseur RÉELLE fixe de 2px écran (vector-effect:non-scaling-stroke) au lieu de 2/3 unités viewBox (qui donnaient une épaisseur visuelle variable et très fine selon la vue). (2) Vue Objectif agrandie de 20% : VIEW_MAX_WIDTH_RATIO.lens passe de 1 à 1.2 (à resynchroniser avec css/styles.css #svg-lens-wrap, qui passe conjointement de max-width:100% à 120%). (3) Ajout de LABEL_MANUAL_ADJUST : la correction d'aspect ratio de la vue Objectif (V022) a rendu son image visuellement plus grande dans la colonne (ratio 0.5→1, indépendamment de l'élargissement du viewBox 2120→3180), alors que labelScaleForView() maintient volontairement la taille RÉELLE des étiquettes strictement identique entre les 3 vues (par définition de l'harmonisation) — les étiquettes de la vue Objectif sont donc restées à la même taille absolue qu'avant, mais paraissent désormais visuellement petites à côté d'un schéma plus grand. LABEL_MANUAL_ADJUST.lens applique un facteur correctif manuel (indépendant de l'harmonisation automatique) pour regrossir ces étiquettes en proportion du grossissement du schéma. Valeur estimée à ajuster visuellement si besoin.
// 2026-09-13 (Paris) — V022 — Correction de l'aspect ratio de la vue Objectif : VIEW_VIEWBOX.lens passe de {w:2120,h:2120} (carré, déformant) à {w:3180,h:2120} (~3:2), et VIEW_MAX_WIDTH_RATIO.lens repasse de 0.5 à 1 puisque le schéma n'a plus besoin d'être réduit de moitié pour compenser une hauteur excessive. Voir index.html (<g id="lens-hscale-fix">) et css/styles.css (#svg-lens-wrap) pour le reste de la correction.
// 2026-09-12 (Paris) — V021 — Anti-croisement des lignes de rappel : l'ancien système attribuait un "étage" (tier) horizontal aux étiquettes simplement dans l'ordre de tri par position d'ancre (index du tableau). Ceci ne garantit PAS l'absence de croisement : si le trajet horizontal d'une étiquette A "avale" la position d'une étiquette B qui doit ensuite descendre vers un étage plus éloigné, la verticale de B traverse le segment horizontal de A. Remplacement par assignTiers() : calcule pour chaque paire de connexions une contrainte "doit être plus extérieure que" dès que le point de départ (centerX) de l'une tombe dans le couloir horizontal de l'autre, puis résout ces contraintes par relaxation itérative (façon tri topologique) et compacte les paliers obtenus. Résultat : les trajets à faible débattement restent sur les voies proches du schéma, les trajets à grand débattement sont repoussés sur des voies plus extérieures, sans jamais traverser un couloir occupé. Lignes de rappel allégées (pointillé plus fin, proportionnel à l'harmonisation V020). Voir explication détaillée en fin de fichier.
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
  if(btn) btn.innerHTML=expanded?ICONS.collapse:ICONS.expand;
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
  lens: {w:3180,h:2120}, // V022 : 2120×2120 d'origine ×1.5 en largeur — cf. <g id="lens-hscale-fix"> dans index.html (correction de la compression horizontale de l'objectif)
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
const VIEW_MAX_WIDTH_RATIO={front:1,back:1,lens:1.2}; // V023 : lens passé à 1.2 (120%) pour agrandir le schéma Objectif de 20% par rapport aux 2 autres vues. Resynchroniser avec css/styles.css (#svg-lens-wrap, règle normale ET règle .bottom-sheet.expanded) si cette valeur change.
const LABEL_REF_VIEW='back';
// V023 : facteur correctif manuel appliqué APRÈS l'harmonisation automatique (labelScaleForView), pour compenser
// le fait que l'harmonisation cible volontairement une taille RÉELLE (px écran) identique entre les 3 vues, alors
// que le schéma Objectif est désormais affiché nettement plus grand que les 2 autres (agrandissement V022 + V023).
// Sans ce correctif, ses étiquettes restent à la même taille absolue qu'avant et paraissent trop petites à côté
// d'un schéma plus grand. Valeur estimée en cohérence avec le grossissement du schéma — à ajuster visuellement.
const LABEL_MANUAL_ADJUST={front:1,back:1,lens:1.3};
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
  // V023 : on applique ensuite LABEL_MANUAL_ADJUST, un correctif manuel indépendant de la mesure live,
  // pour regrossir les étiquettes de la vue Objectif en proportion de son agrandissement (voir explication en tête de fichier).
  const LS=labelScaleForView(currentView,wrap,realSvg,VBW)*(LABEL_MANUAL_ADJUST[currentView]||1);
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
    const rawLabel=coord.label; // nom du contrôle physique (ex. "Molette arrière")
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
    // Fiche détail disponible → place réservée à droite du texte pour l'icône ⓘ
    const hasDetail=typeof getControlDetail==='function'&&!!getControlDetail(id);
    const iconW=hasDetail?font*1.2:0;
    const lblW=txtW+padX*2+iconW;
    return{id,px,py,col,label,paramLine,valueLine,hasValue,boxH,lblW,hasDetail,iconW,paramName};
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
    const{id,px,py,col,label,paramLine,valueLine,hasValue,boxH,lblW,centerX,hasDetail,iconW,paramName}=it;
    const lblX0=centerX-lblW/2;
    const lblCX=centerX;
    const lblY0=fromTop?VBY0+gapEdge:VBH+marginBot-boxH-gapEdge;
    const lblCY=lblY0+boxH/2;
    // Groupe de l'étiquette (fond + textes + icône) : cible du clic si une fiche détail existe
    const lg=document.createElementNS('http://www.w3.org/2000/svg','g');
    svg.appendChild(lg);
    const textCX=lblCX-(iconW||0)/2; // texte recentré dans la partie gauche quand l'icône ⓘ occupe la droite
    // Fond étiquette
    const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x',lblX0);rect.setAttribute('y',lblY0);rect.setAttribute('width',lblW);rect.setAttribute('height',boxH);
    rect.setAttribute('rx',corner);rect.setAttribute('fill',isDark?'rgba(10,12,16,.9)':'rgba(250,248,244,.93)');
    rect.setAttribute('stroke',col);rect.setAttribute('stroke-width','4');
    lg.appendChild(rect);
    // Texte
    if(hasValue){
      // Ligne 1 — nom du contrôle physique, discret, en haut de l'étiquette
      const txt1=document.createElementNS('http://www.w3.org/2000/svg','text');
      txt1.setAttribute('x',textCX);txt1.setAttribute('y',lblY0+padTop+font1*0.8);
      txt1.setAttribute('text-anchor','middle');
      txt1.setAttribute('font-family','Inter,system-ui,sans-serif');
      txt1.setAttribute('font-size',font1);txt1.setAttribute('font-weight','600');
      txt1.setAttribute('fill',isDark?'rgba(232,242,248,.65)':'rgba(20,20,20,.68)');
      txt1.textContent=label;
      lg.appendChild(txt1);
      // Ligne 2 — nom du PARAMÈTRE, en majuscules, taille intermédiaire
      const txt2=document.createElementNS('http://www.w3.org/2000/svg','text');
      txt2.setAttribute('x',textCX);txt2.setAttribute('y',lblY0+padTop+font1+font2*0.85);
      txt2.setAttribute('text-anchor','middle');
      txt2.setAttribute('font-family','Inter,system-ui,sans-serif');
      txt2.setAttribute('font-size',font2);txt2.setAttribute('font-weight','700');
      txt2.setAttribute('fill',col);
      txt2.setAttribute('letter-spacing','.5');
      txt2.textContent=paramLine;
      lg.appendChild(txt2);
      // Ligne 3 — VALEUR du réglage, mise en avant (couleur du paramètre, gras, plus grand)
      const txt3=document.createElementNS('http://www.w3.org/2000/svg','text');
      txt3.setAttribute('x',textCX);txt3.setAttribute('y',lblY0+boxH-padBottom);
      txt3.setAttribute('text-anchor','middle');
      txt3.setAttribute('font-family','Inter,system-ui,sans-serif');
      txt3.setAttribute('font-size',font);txt3.setAttribute('font-weight','700');
      txt3.setAttribute('fill',col);
      txt3.textContent=valueLine;
      lg.appendChild(txt3);
    }else{
      // Repli : uniquement le nom du contrôle (aucun paramètre actif identifié)
      const txt=document.createElementNS('http://www.w3.org/2000/svg','text');
      txt.setAttribute('x',textCX);txt.setAttribute('y',lblCY+font*0.38);
      txt.setAttribute('text-anchor','middle');
      txt.setAttribute('font-family','Inter,system-ui,sans-serif');
      txt.setAttribute('font-size',font);txt.setAttribute('font-weight','700');
      txt.setAttribute('fill',col);
      txt.textContent=label;
      lg.appendChild(txt);
    }
    if(hasDetail){
      const r=font*0.46,icx=lblX0+lblW-padX-iconW/2,icy=lblCY;
      const ic=document.createElementNS('http://www.w3.org/2000/svg','circle');
      ic.setAttribute('cx',icx);ic.setAttribute('cy',icy);ic.setAttribute('r',r);
      ic.setAttribute('fill','none');ic.setAttribute('stroke',col);ic.setAttribute('stroke-width','5');
      lg.appendChild(ic);
      const it2=document.createElementNS('http://www.w3.org/2000/svg','text');
      it2.setAttribute('x',icx);it2.setAttribute('y',icy+r*0.48);it2.setAttribute('text-anchor','middle');
      it2.setAttribute('font-family','Inter,system-ui,sans-serif');it2.setAttribute('font-size',r*1.4);
      it2.setAttribute('font-weight','800');it2.setAttribute('fill',col);it2.textContent='i';
      lg.appendChild(it2);
      // Le calque parent est en pointer-events:none : on réactive uniquement pour cette étiquette
      lg.style.pointerEvents='all';lg.style.cursor='pointer';
      lg.setAttribute('role','button');lg.setAttribute('aria-label','Détails : '+label);
      lg.setAttribute('data-ctrl-id',id);
      lg.addEventListener('click',e=>{e.stopPropagation();openControlDetail(id,{param:paramName,value:valueLine});});
    }
    // Trait — chaque étiquette a son propre "étage" horizontal (tier) pour que
    // les lignes ne se superposent jamais, même si elles se croisent.
    const tierBase=fromTop?(VBY0+gapEdge+boxH+tierStart):(VBH+tierStart);
    const midY=tierBase+(tierIdx||0)*tierGap;
    const tStartY=fromTop?lblY0+boxH:lblY0;
    const line=document.createElementNS('http://www.w3.org/2000/svg','path');
    line.setAttribute('d',`M ${lblCX} ${tStartY} L ${lblCX} ${midY} L ${px} ${midY} L ${px} ${py}`);
    line.setAttribute('fill','none');line.setAttribute('stroke',col);
    // V023 : épaisseur fixée à 2px RÉELS (écran), identique dans les 3 vues, via vector-effect:non-scaling-stroke —
    // un stroke-width classique en unités viewBox donnait une épaisseur affichée variable et très fine selon
    // l'échelle de chaque vue (auparavant '3' en unités viewBox, soit largement moins de 1px réel une fois réduit).
    line.setAttribute('stroke-width','2');line.setAttribute('vector-effect','non-scaling-stroke');
    line.setAttribute('stroke-dasharray',`${(7*LS).toFixed(1)} ${(6*LS).toFixed(1)}`);
    line.setAttribute('stroke-linecap','round');line.setAttribute('opacity','.7');
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
  assignTiers(topItems);
  assignTiers(botItems);
  topItems.forEach(it=>drawAnnotation(it,true,it.tier));
  botItems.forEach(it=>drawAnnotation(it,false,it.tier));
}

// ═══════════════════════════════════════════
//  ROUTAGE ANTI-CROISEMENT DES LIGNES DE RAPPEL
// ═══════════════════════════════════════════
// Chaque ligne de rappel part du bas/haut de son étiquette (x = centerX, position
// résolue par resolveRow), descend/monte verticalement jusqu'à un "étage" (tier)
// horizontal dédié, parcourt cet étage jusqu'à l'aplomb de son ancre (x = px), puis
// rejoint l'ancre verticalement. Le risque de croisement vient des DEUX segments
// verticaux (côté étiquette ET côté ancre) : chacun relie l'intérieur du schéma (le
// bord de l'étiquette d'un côté, l'ancre sur la photo de l'autre) à l'étage de sa
// ligne, et traverse donc au passage tous les étages plus proches — y compris
// l'étage horizontal d'une AUTRE ligne, si son abscisse s'y trouve. Ce n'est donc
// pas l'ORDRE gauche-droite des étiquettes qui compte, mais la question : « le
// trajet (centerX → px) d'une ligne A recouvre-t-il l'une des deux extrémités
// (centerX ou px) d'une ligne B ? ». Si oui, B doit rester plus proche du schéma
// que A (sinon l'une des verticales de B, en route vers un étage plus lointain,
// coupe le couloir horizontal de A).
//
// assignTiers() calcule donc, pour chaque paire de lignes, cette contrainte
// « A doit être plus extérieure que B », puis résout l'ensemble par relaxation
// itérative façon tri topologique (une ligne ne peut être à un étage inférieur ou
// égal à celui de toute ligne qu'elle doit dépasser). Les lignes à faible
// débattement horizontal (centerX proche de px) se stabilisent ainsi naturellement
// près du schéma, tandis que les lignes à grand débattement sont repoussées vers
// des étages extérieurs — exactement là où aucun autre trajet ne peut plus les
// couper. Un compactage final retire les étages inutilisés pour limiter l'espace
// vertical consommé.
//
// Limite connue : si deux trajets se chevauchent en « quinconce » (aucun des deux
// n'englobe complètement l'autre, chacun n'empiétant que partiellement sur le
// couloir de l'autre), aucun ordre d'étages ne peut éliminer le croisement — il
// faudrait déplacer une étiquette, pas seulement changer son étage. Ce cas de
// figure ne peut se produire que si les boîtes d'étiquette d'une même rangée sont
// déjà plus larges que l'espace disponible (voir le bug pré-existant et déjà
// documenté dans roadmap-et-avancement.md : débordement de largeur cumulée des
// étiquettes sur la vue arrière lorsque 3 étiquettes sont actives simultanément).
// Une fois ce bug de largeur corrigé séparément, ce cas résiduel disparaît de
// lui-même. La relaxation ci-dessous reste bornée dans tous les cas (jamais de
// boucle infinie) et produit alors un compromis raisonnable plutôt qu'un blocage.
function assignTiers(items){
  const n=items.length;
  if(!n)return items;
  items.forEach(it=>{
    it.lo=Math.min(it.centerX,it.px);
    it.hi=Math.max(it.centerX,it.px);
    it.tier=0;
  });
  const constraints=[]; // {outer, inner} : outer.tier doit rester STRICTEMENT > inner.tier
  for(let i=0;i<n;i++){
    for(let j=0;j<n;j++){
      if(i===j)continue;
      const A=items[i],B=items[j];
      // Les DEUX extrémités du trajet de B peuvent traverser le couloir de A :
      // - son côté étiquette (centerX), lors de la descente/montée vers son propre étage ;
      // - son côté ancre (px), car ce segment part de l'intérieur du schéma et
      //   remonte lui aussi à travers tous les étages plus proches que le sien
      //   pour rejoindre son étage. Ignorer ce second cas (comme le faisait une
      //   première version de cette fonction) laisse passer des croisements bien réels.
      if((B.centerX>A.lo && B.centerX<A.hi)||(B.px>A.lo && B.px<A.hi)){
        constraints.push({outer:A,inner:B});
      }
    }
  }
  // Relaxation bornée (au plus n+2 passes) : suffisant pour propager les
  // contraintes en chaîne sur le faible nombre de commandes actives par vue.
  // En cas de dépendance circulaire (A doit dépasser B ET B doit dépasser A —
  // configuration très rare, non résolvable par un simple étagement), la boucle
  // s'arrête sans osciller indéfiniment ; le résultat reste alors un compromis
  // raisonnable plutôt qu'une garantie absolue.
  for(let pass=0;pass<n+2;pass++){
    let changed=false;
    constraints.forEach(({outer,inner})=>{
      if(outer.tier<=inner.tier){outer.tier=inner.tier+1;changed=true;}
    });
    if(!changed)break;
  }
  // Compactage : renumérote les étages utilisés en entiers consécutifs (0,1,2…)
  // pour ne pas gaspiller d'espace vertical si des paliers intermédiaires
  // restent inoccupés.
  const used=[...new Set(items.map(it=>it.tier))].sort((a,b)=>a-b);
  const remap=new Map(used.map((t,idx)=>[t,idx]));
  items.forEach(it=>{it.tier=remap.get(it.tier);});
  return items;
}
