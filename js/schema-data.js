// 2026-09-23 07:59 (Paris) — V026 — Séquence "Ouverture" en 2 étapes : ① positionner le commutateur du mode d'ouverture (switch-aperture-mode) puis ② régler la valeur (bague d'ouverture ou molette avant). Ajout de l'entrée CONTROL_COORDS.switch-aperture-mode (label "Commutateur du mode d'ouverture", ancrée nativement via index.html V023, coordonnées de repli en % dérivées de l'ancre réelle) — elle s'affiche donc désormais automatiquement à côté de la bague d'ouverture sur la vue Objectif dès que le paramètre "Ouverture" est actif (même mécanisme que pour toute paire d'options actives d'une séquence). Ajout au passage de switch-focus-range (ancre déjà posée nativement en V023 mais jusqu'ici absente de CONTROL_COORDS, donc jamais affichée) et suppression de switch-ois/switch-af-mf, entrées obsolètes non référencées par aucune séquence depuis la correction matériel du 2026-09-14 (n'existent pas sous ces identifiants sur le X-S20/Fujinon XF70-300mm). PARAM_ACTION.Ouverture et PARAM_HW.Ouverture mis à jour pour refléter les 2 étapes.
// 2026-09-14 18:50 (Paris) — V024 — Correction du pointage de la vue Objectif : les 5 contrôles (ring-aperture-lens, ring-focus, ring-zoom, switch-ois, switch-af-mf) pointaient vers les mauvais éléments du schéma. Cause racine identifiée par rendu réel (Playwright, sans réseau) : les coordonnées de repli en % n'avaient jamais été recalées après la refonte du viewBox Objectif (V022) et étaient en réalité décalées d'un cran entre les 3 bagues (ring-aperture-lens pointait en fait sur la bague de mise au point, ring-focus sur la bague de zoom, ring-zoom sur la bague d'ouverture), et les 2 switches pointaient carrément sur l'avant du fût (zone bagues) au lieu du bloc de commutateurs près de la monture. Coordonnées recalculées par inspection visuelle du rendu réel du SVG. Des ancres natives ont également été ajoutées dans index.html (voir son commentaire de version) ; ces % ne servent donc plus que de filet de sécurité, mais sont désormais justes.
// 2026-09-14 15:42 (Paris) — V023 — Libellé 'Molette vitesse' renommé en 'Molette arrière' (CONTROL_COORDS.dial-shutter, CONTROL_SEQUENCES.vitesse, PARAM_ACTION.Vitesse)
// 2026-09-03 15:53 (Paris) — V013 — Commentaire vue arrière mis à jour (nouveau viewBox 1536×864, FaceArr_vector.svg) — CONTROL_COORDS.back toujours en % (repli, non ancré)
// SCHEMA DATA — coordonnées des contrôles, catégories, actions, matériel (vue caméra annotée)
// Coordonnées par vue (% du viewBox)
// Coordonnées par vue (% du viewBox) — utilisées en repli tant qu'une vue
// n'a pas encore ses ancres SVG natives (voir resolveControlXY dans schema-drawer.js)
const CONTROL_COORDS={
  // ── Vue AVANT (viewBox 2048×1365) — ancrée nativement, ces % ne servent plus que de filet de sécurité ──
  'dial-shutter'  :{view:'front', x:27.24, y:8.09,  label:'Molette arrière',  slot:'top'},
  'btn-iso'       :{view:'front', x:24.67, y:15.20, label:'Bouton ISO',       slot:'top'},
  'btn-shutter'   :{view:'front', x:19.73, y:19.93, label:'Déclencheur',      slot:'top'},
  'btn-q'         :{view:'front', x:19.14, y:13.12, label:'Bouton Q',         slot:'top'},
  'dial-top-front':{view:'front', x:15.99, y:33.26, label:'Molette avant',    slot:'bottom'},
  // ── Vue ARRIÈRE (viewBox 1536×864, FaceArr_vector.svg) — à valider/ancrer en phase 2, coordonnées estimées ──
  'btn-af-back'   :{view:'back',  x:84,  y:45, label:'Bouton AF-L',       slot:'top'},
  'dial-back'     :{view:'back',  x:75,  y:55, label:'Molette arrière',   slot:'bottom'},
  'joystick'      :{view:'back',  x:82,  y:65, label:'Joystick',          slot:'bottom'},
  'btn-menu'      :{view:'back',  x:72,  y:42, label:'Bouton MENU',       slot:'top'},
  'btn-disp'      :{view:'back',  x:72,  y:50, label:'Bouton DISP/BACK (menu Q réduit)', slot:'bottom'},
  'btn-drive'     :{view:'back',  x:60,  y:65, label:'Bouton Drive',      slot:'bottom'}, // position approximative, à valider phase 2
  // ── Vue OBJECTIF (viewBox 3180×2120) — ancrée nativement (voir index.html, ancres natives V023) ; ces % ne servent plus que de filet de sécurité — recalées en V024/V026 sur le rendu réel ──
  'ring-aperture-lens':{view:'lens', x:67.31, y:49.21, label:'Bague ouverture', slot:'bottom'},
  'ring-focus'    :{view:'lens',  x:27.94, y:49.21, label:'Bague mise au point',slot:'bottom'},
  'ring-zoom'     :{view:'lens',  x:44.5,  y:49.21, label:'Bague zoom',        slot:'bottom'},
  // V026 : switch-ois/switch-af-mf (obsolètes, jamais référencés par une séquence) remplacés par les 2 vrais commutateurs
  // du fût, déjà ancrés nativement dans index.html depuis V023 mais absents jusqu'ici de CONTROL_COORDS (donc jamais
  // affichés). Coordonnées de repli en % dérivées des ancres natives réelles (switch-focus-range : 2894.7,955.0 ;
  // switch-aperture-mode : 2881.6,1360.1 — sur viewBox 3180×2120).
  'switch-focus-range'  :{view:'lens', x:91.03, y:45.05, label:'Sélecteur de plage MAP',          slot:'top'},
  'switch-aperture-mode':{view:'lens', x:90.62, y:64.16, label:"Commutateur du mode d'ouverture", slot:'bottom'},
};
// Supprimés (n'existent pas physiquement sur le X-S20) : dial-iso, dial-drive,
// btn-af (avant), lever-af, ring-aperture (avant), btn-q-back (doublon de btn-disp)
// Supprimés (n'existent pas sous ces identifiants sur le Fujinon XF70-300mm, cf. V026) : switch-ois, switch-af-mf

// ═══════════════════════════════════════════
//  SÉQUENCES DE COMMANDES — étapes ordonnées, chaque étape = 1+ options équivalentes
// ═══════════════════════════════════════════
const CONTROL_SEQUENCES={
  'vitesse':[
    {options:[{view:'front', id:'dial-shutter', action:'turn', label:'Molette arrière'}]},
  ],
  'iso':[
    {options:[{view:'front', id:'btn-iso', action:'press', label:'Bouton ISO'}]},
    {options:[
      {view:'front', id:'dial-top-front', action:'turn', label:'Molette avant'},
      {view:'back',  id:'dial-back',      action:'turn', label:'Molette arrière'},
    ]},
  ],
  'ouverture':[
    // V026 : étape préalable obligatoire — le commutateur du mode d'ouverture doit être sur la position
    // "manuel" (pas "A") pour que la bague/molette aient un effet. Une seule option (pas d'alternative) :
    // il n'existe qu'un seul commutateur pour ce réglage.
    {options:[{view:'lens', id:'switch-aperture-mode', action:'set', label:"Commutateur du mode d'ouverture"}]},
    {options:[
      {view:'lens',  id:'ring-aperture-lens', action:'turn', label:'Bague ouverture (objectif)', default:true},
      {view:'front', id:'dial-top-front',     action:'turn', label:'Molette avant'},
    ]},
  ],
  'via-q-menu':[
    {options:[
      {view:'front', id:'btn-q',    action:'press', label:'Bouton Q'},
      {view:'back',  id:'btn-disp', action:'press', label:'Bouton DISP/BACK'},
    ]},
    {options:[{view:'back', id:'joystick', action:'select', label:'Sélectionner au joystick'}]},
  ],
  'menu-only':[
    {options:[{view:'back', id:'btn-menu', action:'press', label:'Bouton MENU'}]},
    {options:[{view:'back', id:'joystick', action:'select', label:'Naviguer au joystick'}]},
  ],
  'drive':[
    {options:[{view:'back', id:'btn-drive', action:'press', label:'Bouton Drive'}]},
    {options:[{view:'back', id:'joystick', action:'select', label:'Choisir la cadence au joystick'}]},
  ],
  'zoom':[
    {options:[{view:'lens', id:'ring-zoom', action:'turn', label:'Bague zoom'}]},
  ],
  'declencheur':[
    {options:[{view:'front', id:'btn-shutter', action:'press', label:'Déclencheur'}]},
  ],
};

// ═══════════════════════════════════════════
//  MAPPING PARAMÈTRE → SÉQUENCE, par mode d'exposition
//  (seul 'M' — Manuel — est implémenté pour l'instant)
// ═══════════════════════════════════════════
const PARAM_TO_CONTROLS_V3={
  M:{
    'Ouverture'          :{sequence:'ouverture'},
    'Vitesse'            :{sequence:'vitesse'},
    'ISO'                :{sequence:'iso'},
    'Balance des blancs' :{sequence:'via-q-menu'},
    'Mode mesure'        :{sequence:'via-q-menu'},
    'Mise au point'      :{sequence:'menu-only'},
    'Focale'             :{sequence:'zoom'},
    'Mode rafale'        :{sequence:'drive'},
    'Format'             :{sequence:'via-q-menu'},
    'Durée totale'       :{sequence:'menu-only'},
    'Déclencheur'        :{sequence:'declencheur'},
    // 'Filtre' et 'Lieu' : volontairement sans séquence (accessoire / info externe, pas de commande boîtier)
  },
};

// ═══════════════════════════════════════════
//  CATÉGORIES ET ACTIONS DES COMMANDES
// ═══════════════════════════════════════════
const PARAM_CATEGORY={
  'Ouverture':'expo','Vitesse':'expo','ISO':'expo',
  'Mise au point':'focus','Focale':'focus',
  'Balance des blancs':'wb','Mode mesure':'wb',
  'Mode rafale':'drive','Déclencheur':'drive','Format':'drive','Durée totale':'drive',
  'Filtre':'misc','Lieu':'misc',
};
const CAT_ICON={expo:'⊙',focus:'◎',wb:'☀',drive:'▶',misc:'◈'};
const PARAM_ACTION={
  'Ouverture':"① Commutateur du mode d'ouverture · ② ↻ Bague ouverture ou molette avant",
  'Vitesse':'↻ Molette arrière',
  'ISO':'↻ Molette ISO (dessus)',
  'Mise au point':'⇄ Levier AF/MF + ⊙ Bouton AF-L',
  'Focale':'↻ Bague zoom objectif',
  'Balance des blancs':'⊙ Bouton Q → sélectionner WB',
  'Mode mesure':'⊙ Bouton Q → mode mesure',
  'Mode rafale':'↻ Molette Drive (dessus)',
  'Déclencheur':'⊙ Demi-course → MAP · Pleine course → déclencher',
  'Format':'⊙ Bouton Q → Format image',
  'Filtre':"↻ Bague ouverture · Accessoire à visser",
  'Lieu':'ℹ Choisir un site à faible pollution lumineuse',
  'Durée totale':"⚙ Régler l'intervalomètre dans le menu",
};
const PARAM_HW={
  'Ouverture':"Commutateur (objectif) → bague objectif ou molette front",
  'Vitesse':'Molette SS (dessus gauche)',
  'ISO':'Molette ISO (dessus centre)',
  'Mise au point':'Levier AF/MF objectif',
  'Focale':'Bague zoom objectif',
  'Balance des blancs':'Bouton Q → WB',
  'Mode mesure':'Bouton Q → Metering',
  'Mode rafale':'Molette Drive (dessus droite)',
  'Déclencheur':'Bouton déclencheur (dessus)',
  'Format':'Menu Q → RAW / JPEG',
  'Filtre':"Accessoire fixé sur l'objectif",
  'Lieu':'Information externe',
  'Durée totale':'Menu intervalomètre',
};
const CAT_COL_DARK= {expo:'#e05050',focus:'#4090e0',wb:'#e0c040',drive:'#40c080',misc:'#c080e0'};
const CAT_COL_LIGHT={expo:'#c02020',focus:'#1060c0',wb:'#806010',drive:'#208050',misc:'#8040b0'};

// ═══════════════════════════════════════════
//  PALETTE D'ANNOTATION — une couleur distincte par PARAMÈTRE actif
//  (et non par catégorie) pour garantir un maximum de contraste visuel
//  entre étiquettes simultanément affichées sur le schéma.
// ═══════════════════════════════════════════
const LABEL_PALETTE_DARK=['#e05050','#4090e0','#e0c040','#40c080','#c080e0','#e0783c','#2cc4b0','#c04ea0','#9ab52e','#5a7ce0'];
const LABEL_PALETTE_LIGHT=['#c02020','#1060c0','#806010','#208050','#8040b0','#a0480c','#0a8570','#8a1a68','#6a7c10','#2c46b0'];

// Mapping param → contrôles (mis à jour pour inclure arrière + objectif)
