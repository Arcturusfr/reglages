// 2026-09-20 01:22 (Paris) — V025 — Création : fiches détail des contrôles (schéma SVG animé + texte d'aide), ouvertes au clic sur une étiquette du drawer. Premier contrôle en test : la molette arrière (SVG issu de roue-crantee-animee-fleche.svg, corrigé : balise <g> non fermée, xmlns erroné, ids/classes/keyframes préfixés « mra- » car le <style> d'un SVG inline est global au document, prise en charge de prefers-reduced-motion).
// CONTROL DATA — fiches détail des contrôles du X-S20
// Pour ajouter un contrôle : 1) ajouter une entrée dans CONTROL_DETAILS ; 2) déclarer ses ids de CONTROL_COORDS dans CONTROL_DETAIL_ALIAS.
// Les étiquettes des contrôles présents dans CONTROL_DETAIL_ALIAS reçoivent automatiquement l'icône ⓘ et deviennent cliquables (voir js/schema-drawer.js).

// Plusieurs ids d'ancres peuvent renvoyer à la même fiche : la molette arrière est
// 'dial-shutter' sur la vue avant et 'dial-back' sur la vue arrière (même contrôle physique).
const CONTROL_DETAIL_ALIAS={
  'dial-shutter':'dial-rear',
  'dial-back'   :'dial-rear',
};

const CONTROL_DETAILS={
  'dial-rear':{
    title:'Molette arrière',
    subtitle:'Molette de commande arrière · Fujifilm X-S20',
    caption:'Rotation dans les deux sens, cran par cran (animation illustrative)',
    svg:`<svg class="ctrl-svg-rear" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-label="Molette arrière : rotation dans les deux sens">
  <defs>
    <marker id="mra-pointe" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <polygon points="2,2 8,5 2,8" fill="#99B898"/>
    </marker>
  </defs>
  <style>
    .mra-cercle{animation:mraRotCercle 8s cubic-bezier(0.42,0,0.58,1) infinite;transform-origin:0px 0px}
    .mra-fleche{animation:mraRotFleche 8s cubic-bezier(0.42,0,0.58,1) infinite;transform-origin:0 0}
    @keyframes mraRotCercle{0%{transform:rotate(0deg)}15%{transform:rotate(45deg)}35%{transform:rotate(135deg)}50%{transform:rotate(180deg)}55%{transform:rotate(180deg)}70%{transform:rotate(135deg)}90%{transform:rotate(45deg)}100%{transform:rotate(0deg)}}
    @keyframes mraRotFleche{0%{transform:rotate(0deg)}15%{transform:rotate(30deg)}35%{transform:rotate(90deg)}50%{transform:rotate(120deg)}55%{transform:rotate(120deg)}70%{transform:rotate(90deg)}90%{transform:rotate(30deg)}100%{transform:rotate(0deg)}}
    @media (prefers-reduced-motion:reduce){.mra-cercle,.mra-fleche{animation:none}}
  </style>
  <g transform="translate(200 200)">
    <g stroke="#555" fill="#fff">
      <circle class="mra-cercle" r="140" fill="none" stroke-width="8" stroke-dasharray="6 4"/>
      <circle r="138" stroke-width="6"/>
      <circle r="120" stroke-width="4"/>
      <circle r="50" stroke-width="6"/>
      <circle r="40" stroke-width="4"/>
    </g>
    <g class="mra-fleche">
      <path d="M -50.91 -50.91 A 72 72 0 0 1 50.91 -50.91" fill="none" stroke="#99B898" stroke-width="3" stroke-linecap="round" marker-start="url(#mra-pointe)" marker-end="url(#mra-pointe)"/>
    </g>
  </g>
</svg>`,
    note:'Fiche en test : contenu à valider et à compléter selon votre boîtier.',
    sections:[
      {title:'Dans PhotoManuel (mode M)',items:[
        'Vitesse d\'obturation : tourner la molette pour choisir la vitesse (réglage « Vitesse » des cartes).',
        'ISO : après un appui sur le bouton ISO, la molette avant ou la molette arrière peuvent, au choix, changer la valeur.',
      ]},
      {title:'Autres fonctions possibles',items:[
        'Modes P / A / S : son rôle varie (décalage de programme, vitesse, correction d\'exposition…) selon le mode et la configuration ; à vérifier sur le boîtier.',
        'Menus et menu rapide : elle peut aider à parcourir ou à changer certaines valeurs, en complément du joystick.',
        'Personnalisation : le X-S20 permet de réassigner de nombreuses commandes (menu SET UP, réglage des boutons et molettes) ; la fonction réelle peut donc différer de ce résumé.',
      ]},
    ],
    tips:[
      'Chaque cran change la valeur d\'un pas (souvent 1/3 de valeur d\'exposition).',
      'Après chaque changement, vérifier la valeur affichée sur l\'écran ou dans le viseur.',
    ],
  },
};

// Renvoie la fiche associée à un id de contrôle (ou null si aucune).
function getControlDetail(ctrlId){
  const key=CONTROL_DETAIL_ALIAS[ctrlId]||ctrlId;
  return CONTROL_DETAILS[key]||null;
}
