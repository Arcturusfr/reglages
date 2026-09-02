// SCHEMA DATA — coordonnées des contrôles, catégories, actions, matériel (vue caméra annotée)
// Coordonnées par vue (% du viewBox)
// Coordonnées par vue (% du viewBox) — utilisées en repli tant qu'une vue
// n'a pas encore ses ancres SVG natives (voir resolveControlXY dans schema-drawer.js)
const CONTROL_COORDS={
  // ── Vue AVANT (viewBox 2048×1365) — ancrée nativement, ces % ne servent plus que de filet de sécurité ──
  'dial-shutter'  :{view:'front', x:27.24, y:8.09,  label:'Molette vitesse',  slot:'top'},
  'btn-iso'       :{view:'front', x:24.67, y:15.20, label:'Bouton ISO',       slot:'top'},
  'btn-shutter'   :{view:'front', x:19.73, y:19.93, label:'Déclencheur',      slot:'top'},
  'btn-q'         :{view:'front', x:19.14, y:13.12, label:'Bouton Q',         slot:'top'},
  'dial-top-front':{view:'front', x:15.99, y:33.26, label:'Molette avant',    slot:'bottom'},
  // ── Vue ARRIÈRE (viewBox 4096×2120... — à valider/ancrer en phase 2, coordonnées estimées ──
  'btn-af-back'   :{view:'back',  x:84,  y:45, label:'Bouton AF-L',       slot:'top'},
  'dial-back'     :{view:'back',  x:75,  y:55, label:'Molette arrière',   slot:'bottom'},
  'joystick'      :{view:'back',  x:82,  y:65, label:'Joystick',          slot:'bottom'},
  'btn-menu'      :{view:'back',  x:72,  y:42, label:'Bouton MENU',       slot:'top'},
  'btn-disp'      :{view:'back',  x:72,  y:50, label:'Bouton DISP/BACK (menu Q réduit)', slot:'bottom'},
  'btn-drive'     :{view:'back',  x:60,  y:65, label:'Bouton Drive',      slot:'bottom'}, // position approximative, à valider phase 2
  // ── Vue OBJECTIF (viewBox 2120×2120) — inchangé, non validé ──
  'ring-aperture-lens':{view:'lens', x:28, y:50, label:'Bague ouverture', slot:'bottom'},
  'ring-focus'    :{view:'lens',  x:48,  y:50, label:'Bague mise au point',slot:'bottom'},
  'ring-zoom'     :{view:'lens',  x:68,  y:50, label:'Bague zoom',        slot:'bottom'},
  'switch-ois'    :{view:'lens',  x:22,  y:25, label:'Switch OIS',        slot:'top'},
  'switch-af-mf'  :{view:'lens',  x:35,  y:25, label:'Switch AF/MF',      slot:'top'},
};
// Supprimés (n'existent pas physiquement sur le X-S20) : dial-iso, dial-drive,
// btn-af (avant), lever-af, ring-aperture (avant), btn-q-back (doublon de btn-disp)

// ═══════════════════════════════════════════
//  SÉQUENCES DE COMMANDES — étapes ordonnées, chaque étape = 1+ options équivalentes
// ═══════════════════════════════════════════
const CONTROL_SEQUENCES={
  'vitesse':[
    {options:[{view:'front', id:'dial-shutter', action:'turn', label:'Molette vitesse'}]},
  ],
  'iso':[
    {options:[{view:'front', id:'btn-iso', action:'press', label:'Bouton ISO'}]},
    {options:[
      {view:'front', id:'dial-top-front', action:'turn', label:'Molette avant'},
      {view:'back',  id:'dial-back',      action:'turn', label:'Molette arrière'},
    ]},
  ],
  'ouverture':[
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
  'Ouverture':'↻ Bague ouverture + molette avant',
  'Vitesse':'↻ Molette vitesse (dessus)',
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
  'Ouverture':'Bague objectif + molette front',
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
