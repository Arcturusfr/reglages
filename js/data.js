// DONNÉES — préréglages par défaut, mapping paramètre → contrôles génériques
// ═══════════════════════════════════════════
//  DONNÉES PAR DÉFAUT
// ═══════════════════════════════════════════
const DEFAULT_PRESETS=[
  {id:'sunrise',icon:'🌅',name:'Lever de soleil',category:'Ciel & Atmosphère',description:'Capturer les teintes dorées et rosées à l\'horizon.',
   defaultParams:{'Ouverture':{value:'f/8 – f/11',note:'Netteté maximale'},'Vitesse':{value:'1/60 – 1/250 s',note:'Selon la luminosité'},'ISO':{value:'100 – 400',note:'Bas pour moins de bruit'},'Mise au point':{value:'Infini / MF',note:'Sur l\'horizon'},'Balance des blancs':{value:'Nuageux / 6000 K',note:'Renforce les teintes chaudes'},'Mode mesure':{value:'Matrix / Évaluatif',note:''}},
   conditions:[{name:'Ciel nuageux',params:{'Ouverture':{value:'f/5.6 – f/8',note:'Compenser la lumière réduite'},'ISO':{value:'400 – 800',note:'Compenser le manque de lumière'},'Balance des blancs':{value:'7000 K',note:'Accentuer les tons chauds'}}},{name:'Brume matinale',params:{'Ouverture':{value:'f/4 – f/5.6',note:'Maximiser la lumière'},'Vitesse':{value:'1/15 – 1/60 s',note:'Trépied indispensable'},'ISO':{value:'400 – 1600',note:'Faible lumière dans la brume'},'Balance des blancs':{value:'7000 K',note:'Ambrés renforcés'},'Mode mesure':{value:'Ponctuel sur zone claire',note:''}}}],
   tips:['Arrivez 30 min avant le lever.','Trépied en faible lumière.','Bracketing ± 1 EV.','Format RAW pour les hautes lumières.'],warning:null},
  {id:'mountain',icon:'🏔️',name:'Sommets montagneux',category:'Paysage',description:'Sommets lointains, netteté maximale avant/arrière-plan.',
   defaultParams:{'Ouverture':{value:'f/11 – f/16',note:'Hyperfocale, tout net'},'Vitesse':{value:'1/250 – 1/500 s',note:'Geler les nuages'},'ISO':{value:'100',note:'Qualité maximale'},'Mise au point':{value:'Distance hyperfocale',note:'H = f² / (N × c)'},'Balance des blancs':{value:'Lumière du jour / 5500 K',note:''},'Filtre':{value:'CPL polarisant',note:'Ciel bleu saturé'}},
   conditions:[{name:'Temps couvert',params:{'Vitesse':{value:'1/60 – 1/250 s',note:'Lumière diffuse'},'ISO':{value:'200 – 400',note:''},'Balance des blancs':{value:'Nuageux / 6500 K',note:'Éviter la dominante froide'},'Filtre':{value:'ND grad.',note:'Équilibrer ciel/terrain'}}},{name:'Après la pluie',params:{'Balance des blancs':{value:'5600 K',note:'Lumière pure post-pluie'},'Filtre':{value:'CPL + UV',note:'Reflets humides'}}}],
   tips:['H = f² / (N × c), c ≈ 0.03 mm.','Filtre UV en altitude.','Lumière rasante matin/soir.','Désactivez la stabilisation sur trépied.'],warning:null},
  {id:'moon-full',icon:'🌕',name:'Pleine Lune',category:'Astronomie',description:'Détail des cratères et mers lunaires.',
   defaultParams:{'Ouverture':{value:'f/8 – f/11',note:'Piqué optimal'},'Vitesse':{value:'1/125 – 1/500 s',note:'Règle Looney 11'},'ISO':{value:'100',note:'Bruit minimal'},'Mise au point':{value:'Infini MF / LiveView ×10',note:''},'Focale':{value:'300 – 600 mm',note:'Plus long = meilleur'},'Mode rafale':{value:'Activé',note:'Sélectionner la meilleure'}},
   conditions:[{name:'Nuit avec brume',params:{'Ouverture':{value:'f/5.6 – f/8',note:'Compenser l\'atténuation'},'ISO':{value:'200 – 400',note:'Compenser la brume'},'Vitesse':{value:'1/60 – 1/250 s',note:''}}}],
   tips:['Looney 11 : ISO 100, f/11, 1/100 s.','À 500 mm max 1/500 s.','Déclencheur à distance.','Plus belle à l\'horizon.'],warning:null},
  {id:'eclipse-solar',icon:'🌑',name:'Éclipse solaire',category:'Astronomie',description:'Eclipse solaire — sécurité absolue requise.',
   defaultParams:{'Ouverture':{value:'f/8',note:'Phase partielle avec filtre'},'Vitesse':{value:'1/1000 – 1/4000 s',note:''},'ISO':{value:'100',note:''},'Filtre':{value:'ND 5.0 (100 000×)',note:'OBLIGATOIRE'},'Focale':{value:'300 – 600 mm',note:''}},
   conditions:[{name:'Totalité (filtre retiré)',params:{'Ouverture':{value:'f/5.6',note:'Retirer le filtre'},'Vitesse':{value:'1/15 – 1/1000 s',note:'Bracketing large'},'ISO':{value:'100 – 400',note:''},'Filtre':{value:'AUCUN — totalité seulement',note:'Remettre dès la fin'}}}],
   tips:['JAMAIS sans filtre ISO 12312-2 hors totalité.','Totalité : bracketing large.','Le Soleil se déplace de son diamètre en 2 min.'],
   warning:'⚠️ DANGER : filtre solaire certifié ISO 12312-2 OBLIGATOIRE hors totalité. Un filtre ND ordinaire est insuffisant et dangereux.'},
  {id:'milky-way',icon:'🌌',name:'Voie Lactée',category:'Astronomie',description:'Arc galactique, maximiser la captation de lumière.',
   defaultParams:{'Ouverture':{value:'f/1.8 – f/2.8',note:'Maximum de lumière'},'Vitesse':{value:'15 – 25 s',note:'Règle 500'},'ISO':{value:'1600 – 3200',note:''},'Mise au point':{value:'Hyperfocale / étoile brillante',note:''},'Format':{value:'RAW',note:''},'Lieu':{value:'Bortle < 4',note:'Carte Light Pollution Map'}},
   conditions:[{name:'Nouvelle lune',params:{'ISO':{value:'3200 – 6400',note:'Nuit la plus sombre'},'Lieu':{value:'Bortle < 3',note:'Conditions optimales'}}},{name:'Lune croissante',params:{'Vitesse':{value:'12 – 18 s',note:'Réduire avant levée lune'},'ISO':{value:'1600 – 3200',note:''}}}],
   tips:['Règle 500 : vitesse = 500 / focale (FF).','APS-C : règle 300.','Nouvelle Lune ± 3 jours = idéal.','Refroidir le boîtier 30 min avant.'],warning:null},
  {id:'lightning',icon:'⚡',name:'Foudre & Orages',category:'Météo',description:'Capturer des éclairs depuis un abri sécurisé.',
   defaultParams:{'Ouverture':{value:'f/8 – f/11',note:'Netteté paysage'},'Vitesse':{value:'4 – 30 s',note:'Laisser passer l\'éclair'},'ISO':{value:'100 – 200',note:''},'Mise au point':{value:'MF infini',note:''},'Déclencheur':{value:'Intervalomètre',note:'Poses en continu'}},
   conditions:[{name:'Orage diurne',params:{'Vitesse':{value:'1/4 – 2 s',note:'Avec filtre ND64/ND1000'},'ISO':{value:'100',note:''},'Déclencheur':{value:'Détecteur d\'éclairs',note:'Recommandé de jour'}}}],
   tips:['Trépied solide, zone d\'activité cadrée.','4–8 s en continu la nuit.','Toujours rester à l\'abri.'],
   warning:'Ne jamais s\'exposer à l\'extérieur pendant un orage.'},
  {id:'aurora',icon:'🌠',name:'Aurores boréales',category:'Astronomie',description:'Ondulations lumineuses de l\'aurora borealis.',
   defaultParams:{'Ouverture':{value:'f/1.8 – f/2.8',note:''},'Vitesse':{value:'6 – 10 s',note:''},'ISO':{value:'1600 – 3200',note:''},'Mise au point':{value:'Hyperfocale',note:''},'Balance des blancs':{value:'3500 – 4500 K',note:'RAW recommandé'}},
   conditions:[{name:'Activité forte (KP ≥ 5)',params:{'Vitesse':{value:'2 – 5 s',note:'Figer les structures'},'ISO':{value:'800 – 1600',note:''}}},{name:'Activité faible (KP 1–2)',params:{'Ouverture':{value:'f/1.4 – f/1.8',note:''},'Vitesse':{value:'10 – 20 s',note:''},'ISO':{value:'3200 – 6400',note:''}}}],
   tips:['KP index sur SpaceWeatherLive.','Aurore active = poses courtes.','Premier plan intéressant.'],warning:null},
  {id:'star-trails',icon:'⭐',name:'Filés d\'étoiles',category:'Astronomie',description:'Trajectoires circulaires des étoiles autour de Polaris.',
   defaultParams:{'Ouverture':{value:'f/2.8 – f/4',note:''},'Vitesse':{value:'30 s × N poses',note:'Empilement'},'ISO':{value:'800 – 1600',note:''},'Durée totale':{value:'1 – 2 h',note:''},'Format':{value:'RAW',note:''}},
   conditions:[{name:'Nuit noire',params:{'Durée totale':{value:'2 – 3 h',note:'Trails longs'}}},{name:'Nuit partiellement nuageuse',params:{'Ouverture':{value:'f/2.8',note:''},'ISO':{value:'1600',note:''},'Durée totale':{value:'1 h selon éclaircies',note:''}}}],
   tips:['Viser Polaris pour des cercles.','30 s de pose, 1 s de pause.','Logiciels : Sequator, StarStaX.','Batterie de secours indispensable.'],warning:null},
];

// ═══════════════════════════════════════════
//  MAPPING PARAMÈTRES → COMMANDES X-S20
//  Chaque paramètre est associé à un ou plusieurs identifiants de commandes
//  'top'  : commandes vue dessus
//  'back' : commandes vue arrière
// ═══════════════════════════════════════════
const PARAM_TO_CONTROLS={
  'Ouverture'   :{top:['dial-top-front','ring-aperture'],back:[],label:'Bague ouverture + molette avant'},
  'Vitesse'     :{top:['dial-shutter'],back:[],label:'Molette vitesse'},
  'ISO'         :{top:['dial-iso'],back:[],label:'Molette ISO'},
  'Balance des blancs':{top:['btn-q'],back:['btn-q-back'],label:'Bouton Q / Menu'},
  'Mode mesure' :{top:['btn-q'],back:['btn-q-back'],label:'Bouton Q / Menu'},
  'Mise au point':{top:['btn-af'],back:['btn-af-back','lever-af'],label:'Levier AF / Bouton AF-L'},
  'Focale'      :{top:['ring-aperture'],back:[],label:'Bague zoom objectif'},
  'Mode rafale' :{top:['dial-drive'],back:[],label:'Molette Drive'},
  'Filtre'      :{top:[],back:['btn-q-back'],label:'Accessoire + Menu Q'},
  'Format'      :{top:['btn-q'],back:['btn-q-back'],label:'Menu Q → Format RAW'},
  'Lieu'        :{top:[],back:[],label:'—'},
  'Durée totale':{top:[],back:['btn-q-back'],label:'Intervalomètre menu'},
  'Déclencheur' :{top:['btn-shutter'],back:[],label:'Déclencheur / prise remote'},
};

function getActiveControls(params){
  const top=new Set(),back=new Set(),labels=[];
  Object.keys(params).forEach(k=>{
    const ctrl=PARAM_TO_CONTROLS[k];
    if(ctrl){
      ctrl.top.forEach(id=>top.add(id));
      ctrl.back.forEach(id=>back.add(id));
      if(ctrl.label&&ctrl.label!=='—') labels.push({param:k,label:ctrl.label});
    }
  });
  return{top:[...top],back:[...back],labels};
}

// ═══════════════════════════════════════════
//  THEME
// ═══════════════════════════════════════════
