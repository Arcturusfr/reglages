// 2026-09-24 10:20 (Paris) — V027 — (1) Titre de la 1ère section renommé « Dans le mode M (Manuel) » (dial-rear ET aperture — même libellé littéral dans les 2 fiches). Ce titre est désormais affiché à droite du schéma dans le cadre (js/control-popup.js gère la mise en page, aucune autre donnée changée ici). (2) Texte de la fiche « aperture » réécrit : la bague de l'objectif et la molette arrière du boîtier sont désormais présentées comme mutuellement EXCLUSIVES selon la position du commutateur — bague seule quand il pointe sur le symbole du diaphragme, molette arrière seule quand il pointe sur le repère rouge « A » — et non plus comme un choix libre entre bague et molette avant (correction relayée par l'utilisateur, à vérifier sur le boîtier réel comme le reste de cette fiche).
// 2026-09-23 07:59 (Paris) — V026 — Ajout de la fiche « Ouverture » : couvre à la fois la bague d'ouverture (ring-aperture-lens) et le commutateur du mode d'ouverture (switch-aperture-mode), qui pointent désormais tous les deux vers la même fiche via CONTROL_DETAIL_ALIAS — cohérent avec le fait qu'ils forment une seule et même séquence à 2 étapes dans js/schema-data.js (CONTROL_SEQUENCES.ouverture). Illustration : SVG fourni par l'utilisateur (commutateurs-objectif.svg, schéma du fût de l'objectif : bague crantée d'ouverture + commutateur de mode A/bague), corrigé uniquement pour préfixer l'id du <path> de guidage de texte (« courbe » → « ap-courbe ») afin d'éviter toute collision avec un futur SVG inline du même document (même précaution que pour la molette arrière, cf. préfixe « mra- »). Contenu inchangé sinon.
// CONTROL DATA — fiches détail des contrôles du X-S20
// Pour ajouter un contrôle : 1) ajouter une entrée dans CONTROL_DETAILS ; 2) déclarer ses ids de CONTROL_COORDS dans CONTROL_DETAIL_ALIAS.
// Les étiquettes des contrôles présents dans CONTROL_DETAIL_ALIAS reçoivent automatiquement l'icône ⓘ et deviennent cliquables (voir js/schema-drawer.js).

// Plusieurs ids d'ancres peuvent renvoyer à la même fiche :
// - la molette arrière est 'dial-shutter' sur la vue avant et 'dial-back' sur la vue arrière (même contrôle physique) ;
// - l'ouverture se règle en 2 étapes (commutateur puis bague/molette, cf. CONTROL_SEQUENCES.ouverture dans schema-data.js) :
//   'ring-aperture-lens' et 'switch-aperture-mode' renvoient donc à la même fiche unique « Ouverture ».
const CONTROL_DETAIL_ALIAS={
  'dial-shutter':'dial-rear',
  'dial-back'   :'dial-rear',
  'ring-aperture-lens'  :'aperture',
  'switch-aperture-mode':'aperture',
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
      {title:'Dans le mode M (Manuel)',items:[
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
  'aperture':{
    title:'Ouverture',
    subtitle:"Bague d'ouverture + commutateur du mode d'ouverture · Fujinon XF70-300mm",
    caption:"Fût de l'objectif : bague crantée d'ouverture (à gauche) et commutateur de mode, repère rouge « A » (à droite)",
    svg:`<svg class="ctrl-svg-aperture" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 1446" role="img" aria-label="Bague d'ouverture et commutateur du mode d'ouverture de l'objectif">
<!-- Bulle encadrant le schéma -->
  <path stroke="#4A5568" stroke-width="17"  fill="white"  d="M 859.728 651.852 C 868.381 651.665 873.238 653.526 875.429 662.194 C 880.678 682.958 884.069 704.203 888.61 725.118 C 899.147 773.649 907.307 822.805 917.686 871.325 C 981.745 872.329 1047.23 870.268 1111.45 870.781 C 1139.94 871.008 1172.77 868.688 1200.96 871.896 C 1211.89 873.139 1230.01 882.67 1237.87 890.746 C 1255.58 908.934 1259.82 923.52 1259.84 947.959 C 1259.91 1033.21 1259.93 1118.42 1260.02 1203.63 L 1260.02 1280.95 C 1259.96 1311.94 1263.43 1337.53 1239.39 1361.73 C 1229.54 1371.55 1217.07 1378.33 1203.47 1381.27 C 1187.61 1384.57 1136.06 1383.13 1116.56 1383.14 L 966.75 1383.84 L 743.22 1382.96 L 673.174 1383.02 C 660.382 1383.03 639.349 1383.64 627.601 1381.6 C 612.623 1379.05 598.787 1371.97 587.956 1361.31 C 570.317 1343.67 567.119 1327.03 567.038 1303.53 L 567.016 1042.37 L 567.038 971.598 C 567.042 958.265 566.356 942.419 568.163 929.415 C 572.329 899.438 599.846 873.815 629.936 871.268 C 651.968 869.403 675.706 870.224 698.007 870.234 L 830.016 870.276 C 832.925 853.203 835.179 826.018 837.094 808.153 C 840.499 775.349 844.146 742.57 848.033 709.82 C 849.822 693.582 850.901 675.51 853.739 659.393 C 854.304 656.183 857.234 653.923 859.728 651.852 z"/>
<!-- Molette des ouvertures-->
  <path stroke="#2B2B2B" d="M 849.031 884.154 C 850.588 886.232 852.814 907.878 853.284 911.767 L 959.963 911.8 C 959.06 905.818 956.464 898.191 959.35 893.509 C 962.717 891.61 964.369 891.398 966.779 894.365 C 967.812 905.92 969.801 917.366 970.824 928.988 C 982.889 1065.95 983.669 1215.21 956.831 1350.55 C 953.037 1371.17 948.554 1359.27 933.163 1359.49 C 905.265 1359.89 877.35 1359.46 849.454 1358.84 C 841.862 1358.67 834.586 1364.43 830.116 1360.98 C 830.131 1357.72 835.182 1332.12 836.017 1326.51 C 840.776 1296.58 844.569 1266.51 847.391 1236.34 C 857.876 1121.31 855.774 1005.48 841.121 890.909 C 844.847 888.505 846.002 887.218 849.031 884.154 z"/>
  <path fill="rgb(255,255,255)" d="M 863.107 1069.11 L 969.981 1069.13 C 970.021 1083.62 969.983 1098.12 969.865 1112.62 L 863.091 1112.57 L 863.107 1069.11 z"/>
  <path fill="rgb(255,255,255)" d="M 862.925 1121.58 C 898.041 1121.04 934.625 1121.58 969.862 1121.59 C 969.251 1135.6 968.93 1149.78 968.503 1163.81 C 935.961 1165.08 894.993 1163.89 861.791 1163.87 L 862.925 1121.58 z"/>
  <path fill="rgb(255,255,255)" d="M 861.828 1017.96 L 968.533 1017.96 C 968.862 1032 969.308 1046.04 969.872 1060.08 C 935.89 1061.04 897.32 1060.13 862.967 1060.13 C 862.472 1046.07 862.092 1032.02 861.828 1017.96 z"/>
  <path fill="rgb(255,255,255)" d="M 861.096 1172.92 C 896.472 1172.53 932.646 1172.93 968.089 1172.93 C 967.091 1186.41 966.294 1199.9 965.697 1213.41 L 858.816 1213.68 C 859.345 1200.35 860.387 1186.31 861.096 1172.92 z"/>
  <path fill="rgb(255,255,255)" d="M 858.957 968.248 L 965.703 968.287 C 966.043 981.409 967.194 995.753 967.993 1008.94 L 861.148 1008.94 C 860.652 995.38 859.229 982.022 858.957 968.248 z"/>
  <path fill="rgb(255,255,255)" d="M 897.624 1222.5 C 919.955 1222.3 942.287 1222.3 964.619 1222.48 C 963.561 1235.35 962.347 1248.21 960.976 1261.05 L 921.5 1261.17 C 899.204 1261.2 876.909 1261.42 854.618 1261.85 C 855.59 1248.83 856.688 1235.81 857.913 1222.81 L 897.624 1222.5 z"/>
  <path fill="rgb(255,255,255)" d="M 854.591 920.787 L 960.994 920.788 C 962.36 933.582 963.528 946.396 964.498 959.226 L 857.986 959.212 C 856.593 946.428 855.461 933.617 854.591 920.787 z"/>
  <path fill="rgb(255,255,255)" d="M 924.047 1270.52 C 935.91 1270.22 948.063 1270.23 959.953 1270.1 C 958.248 1282.2 956.857 1294.84 955.339 1307.01 L 883.639 1306.98 L 849.053 1307.09 C 850.708 1295.1 852.124 1283.08 853.3 1271.04 C 876.883 1271.1 900.467 1270.93 924.047 1270.52 z"/>
  <path fill="rgb(255,255,255)" d="M 946.389 1316.46 C 948.703 1316.22 950.181 1316.41 952.463 1316.58 C 953.964 1320.32 949.003 1344.2 947.976 1349.92 C 916.252 1349.53 884.526 1349.35 852.799 1349.37 C 848.748 1349.54 847.005 1349.69 842.891 1349.01 C 841.997 1346.69 846.701 1320.89 847.345 1316.96 C 879.88 1316.95 913.98 1317.46 946.389 1316.46 z"/>
<!-- Commutateurs -->
   <!-- Aplat gris sombre de la forme générale des commutateurs -->
     <path fill="#2B2B2B" d="M 1094.62 904.274 C 1097.04 904.002 1109.06 902.924 1110.26 901.445 C 1113.45 897.524 1113.66 895.904 1118.29 892.707 C 1121.78 892.311 1123.31 891.896 1126.77 892.795 C 1129.18 898.21 1132.02 927.936 1132.96 936.078 C 1145.76 1050.49 1144.33 1166.06 1128.7 1280.12 C 1124.78 1307.17 1122.82 1344.39 1099.79 1361.89 L 1083.15 1361.71 C 1097.15 1353.6 1108.05 1344.55 1111.4 1327.77 C 1132.42 1222.63 1135.18 1114.64 1130.34 1007.8 C 1128.78 973.335 1123.14 939.423 1120.5 905.4 L 1119.32 906.169 C 1109.47 912.561 1084.32 912.645 1088.3 923.907 C 1095.94 929.871 1111.07 917.817 1114.25 944.345 C 1116.41 962.318 1124.65 1067.52 1117.4 1076.26 C 1114.11 1080.22 1110.18 1081.77 1105.11 1081.99 C 1101.97 1082.12 1098.79 1082 1095.65 1081.93 C 1095.26 1110.57 1094.65 1139.2 1093.82 1167.83 C 1099.79 1168.08 1106.39 1167.88 1110.87 1172.53 C 1117.97 1179.91 1114.18 1212.57 1113.66 1223.3 C 1112.92 1238.58 1112.24 1307.48 1102.67 1315.62 C 1096.75 1320.66 1087.57 1319.41 1080.3 1319.23 C 1078.98 1328.56 1076.36 1354.02 1072.15 1361.04 C 1069.59 1362.51 1070.05 1361.99 1066.54 1361.84 C 1063.43 1358.18 1070.4 1325.5 1071.41 1319.31 C 1048.14 1319.65 1039.11 1320.47 1040.66 1293.67 C 1040.84 1290.67 1041.03 1287.67 1041.24 1284.67 C 1042.25 1267.17 1042.65 1262.19 1042.98 1257.2 L 1043.12 1248.06 C 1043.88 1244.27 1044.35 1243.48 1043.17 1239.98 L 1043.56 1228.92 L 1044.65 1204.43 C 1048.9 1198.3 1043.89 1177.94 1049.21 1173.27 C 1057.22 1166.22 1075.02 1167.84 1084.83 1168.02 C 1085.71 1139.34 1086.36 1110.65 1086.77 1081.96 C 1068.24 1082.32 1050.9 1085.25 1052.69 1060.18 C 1053.54 1058.25 1053.31 1059.3 1052.7 1056.88 C 1051.69 1052.05 1051.8 1042.79 1051.09 1036.71 L 1050.1 1019.18 C 1046.08 1019.25 1043.07 1019.29 1039.01 1018.95 C 1037.38 1016.66 1037.89 1017.14 1037.6 1013.91 C 1040.01 1009.33 1045.02 1014.1 1049.53 1010.53 C 1049.47 997.454 1044.22 1003.95 1037.59 1001.26 C 1036.19 997.855 1036.48 999.267 1036.89 995.543 C 1040.79 992.623 1041.29 995.842 1047.16 993.546 C 1049.09 990.663 1048.31 990.371 1047.86 986.219 L 1048.14 984.847 L 1047.84 975.832 L 1046.54 954.163 C 1044.4 923.857 1052.77 924.974 1078.96 925.505 C 1078.75 914.875 1079.06 911.408 1084.43 901.934 C 1089.93 892.251 1092.6 892.023 1102.85 892.161 L 1103.65 892.812 C 1100.81 897.137 1097.96 900.349 1094.62 904.274 z"/>
   <!-- Aplats blancs du sélecteur de la plage de mise au point -->
     <path fill="rgb(255,255,255)" d="M 1057.49 934.923 C 1068.05 934.927 1095.29 931.67 1103.65 939.14 C 1105.57 940.852 1105.83 951.453 1105.45 954.671 L 1103.75 955.533 C 1090.18 955.009 1069.39 954.734 1056.05 955.582 C 1055.31 947.118 1054.23 942.594 1057.49 934.923 z"/>
     <path fill="rgb(255,255,255)" d="M 1058.19 964.775 C 1069.79 964.807 1081.28 964.384 1092.87 964.068 C 1110.46 963.589 1107.71 981.551 1107.83 994.3 L 1058.11 993.936 C 1057.89 985.422 1055.63 972.465 1058.19 964.775 z"/>
     <path fill="rgb(255,255,255)" d="M 1058.76 1002.92 L 1108.82 1003.14 L 1110.18 1039.59 L 1084.75 1039.21 L 1060.93 1039.13 C 1060.24 1032.57 1060.07 1025.21 1059.77 1018.57 C 1065.87 1018.61 1081.81 1019.87 1086.23 1018.17 C 1088.68 1015.66 1088.34 1016.76 1088.48 1013.87 C 1083.24 1008.83 1070.45 1013.87 1060.39 1011.41 C 1058.44 1008.44 1058.99 1006.86 1058.76 1002.92 z"/>
     <path fill="rgb(255,255,255)" d="M 1061.5 1048.08 L 1110.93 1048.52 C 1111.38 1056.9 1112.18 1063.66 1109.54 1071.62 C 1103.28 1073.24 1070.31 1074.02 1063.77 1070.35 C 1061.07 1065.35 1061.58 1054.24 1061.5 1048.08 z"/>
  <!-- Aplats blancs du commutateur du mode d'ouverture -->
    <path fill="rgb(255,255,255)" d="M 1057.92 1177.92 C 1064.59 1177.18 1096.94 1177.34 1102.6 1178.71 C 1106.69 1182.33 1106 1203.07 1103.8 1206.24 L 1055.03 1205.95 C 1055.14 1198.49 1054.67 1183.89 1057.92 1177.92 z"/>
    <path fill="rgb(255,255,255)" d="M 1054.49 1214.94 C 1070.93 1214.88 1087.72 1215.18 1104.19 1215.3 C 1103.8 1227.36 1103.31 1239.41 1102.7 1251.46 L 1072.26 1251.26 L 1052.85 1251.21 L 1053.25 1237.56 C 1061.34 1237.77 1075.69 1239.01 1082.56 1235.03 L 1082.68 1233.63 C 1075.76 1229.58 1062.1 1230.63 1053.91 1230.73 C 1054.02 1225.51 1054.29 1220.17 1054.49 1214.94 z"/>
    <path fill="rgb(255,255,255)" d="M 1052.18 1260.21 L 1102.11 1260.45 C 1101.65 1267.56 1101.36 1276.56 1098.83 1283.05 C 1093.14 1284.95 1057.24 1285.2 1051.77 1281.73 C 1050.23 1276.97 1051.7 1265.77 1052.18 1260.21 z"/>
    <path fill="rgb(255,255,255)" d="M 1050.06 1293.06 C 1065.24 1293.79 1085.16 1293.62 1100.24 1293.04 C 1099.53 1299.4 1099.4 1302.37 1097.1 1308.26 C 1092.51 1311.39 1067.51 1309.73 1060.27 1310 C 1056.49 1310.14 1053.22 1309.91 1050.7 1307.23 C 1049.07 1302.82 1049.79 1297.84 1050.06 1293.06 z"/>
  <!-- Commutateur de verrouillage du zoom -->
    <path fill="#2B2B2B" d="M 679.51 1180.23 C 695.799 1179.69 793.336 1178.33 802.148 1182.46 C 806.712 1184.6 810.918 1190.79 812.336 1195.52 C 816.03 1207.85 805.37 1288.72 802.34 1303.63 C 801.616 1307.2 800.571 1310.33 798.803 1313.52 C 794.566 1321.19 788.984 1324.7 780.737 1327.15 C 761.56 1327.49 666.574 1328.97 655.183 1323.09 C 650.549 1320.7 646.203 1314.86 644.708 1309.95 C 641.508 1299.42 652.278 1204.38 658.036 1194.73 C 662.944 1186.51 670.399 1182.3 679.51 1180.23 z"/>
    <path fill="rgb(255,255,255)" d="M 707.204 1190.17 C 710.627 1189.84 713.651 1189.01 716.394 1190.69 C 726.11 1206.22 721.693 1225.37 720.148 1242.89 C 718.141 1264.01 716.342 1285.14 714.751 1306.29 C 710.472 1309.82 705.323 1313.57 700.871 1316.99 C 685.203 1317.81 685.474 1306.71 686.669 1294.29 C 689.327 1266.63 692.762 1239.01 695.901 1211.4 C 697.022 1201.54 699.127 1196.3 707.204 1190.17 z"/>
    <path fill="rgb(255,255,255)" d="M 684.136 1189.46 C 686.155 1189.47 688.876 1189.47 690.937 1189.66 C 690.877 1189.66 692.878 1190.38 692.779 1190.66 C 692.271 1192.08 687.845 1202.5 687.736 1203.33 C 683.463 1235.75 679.295 1269.41 676.98 1302.01 C 676.576 1307.69 678.217 1312.31 680.105 1316.92 L 664.6 1316.81 C 650.346 1312.91 652.492 1300.26 653.896 1288.63 C 657.296 1261.23 659.077 1233.39 663.656 1206.18 C 665.507 1195.18 673.885 1190.37 684.136 1189.46 z"/>
    <path fill="#2B2B2B" d="M 668.295 1204.92 L 682.143 1205.03 C 678.512 1236.14 675.448 1273.53 670.667 1303.95 L 657.12 1303.93 C 660.623 1270.9 664.349 1237.9 668.295 1204.92 z"/>
    <path fill="rgb(255,255,255)" d="M 788.882 1189.85 C 791.729 1189.78 794.887 1189.64 797.553 1190.82 C 800.165 1191.97 802.114 1195.14 803.01 1197.73 C 805.522 1204.99 795.883 1300.39 791.363 1308.07 C 788.52 1312.89 785.168 1316 779.729 1317.5 C 775.439 1317.58 767.811 1317.87 763.997 1316.51 C 772.654 1307.81 770.408 1304.57 771.537 1292.58 C 772.994 1277.64 774.254 1262.68 775.318 1247.71 C 777.032 1222.39 774.097 1211.46 788.882 1189.85 z"/>
    <path fill="#2B2B2B" d="M 749.902 1195.45 C 753.985 1198.31 755.829 1204.82 755.265 1209.22 C 753.486 1223.08 750.412 1299.72 745.982 1307.08 C 741.299 1303.43 756.574 1213.22 750.272 1204.98 L 748.562 1205.67 C 746.116 1209.25 746.709 1214.01 746.74 1218.45 C 742.244 1242.86 744.106 1274.78 739.761 1299.86 C 738.677 1306.11 745.864 1314.86 731.32 1316.71 C 732.001 1314.58 734.8 1312.89 736.733 1311.41 L 742.464 1243.38 C 743.631 1229.09 743.54 1207.75 749.902 1195.45 z"/>
    <path fill="rgb(255,255,255)" d="M 731.928 1209.21 C 733.312 1209.6 734.834 1210.16 736.215 1210.62 C 737.763 1213.83 729.828 1305.23 727.087 1309.55 L 723.617 1309.56 C 723.344 1303.08 725.461 1283.75 726.072 1276.57 L 731.928 1209.21 z"/>
    <path fill="rgb(255,255,255)" d="M 763.988 1209.37 C 766.299 1209.87 766.33 1209.94 768.451 1211.03 C 769.486 1216.34 761.462 1305.2 759.334 1309.64 C 756.467 1309.71 757.246 1310.24 755.472 1309.03 C 757.991 1276.34 760.604 1241.91 763.988 1209.37 z"/>
    <path fill="rgb(255,255,255)" d="M 758.734 1189.89 L 777.836 1189.97 L 772.38 1198.57 C 769.978 1201.72 768.716 1202.43 764.99 1201.23 C 761.627 1198.16 760.452 1194.14 758.734 1189.89 z"/>
    <path fill="rgb(255,255,255)" d="M 726.107 1189.84 L 742.909 1189.86 L 738.871 1198.07 C 738.72 1198.46 737.416 1200.41 737.099 1200.9 C 733.983 1202.2 735.518 1202.16 732.341 1201.02 C 728.905 1197.85 727.856 1194.19 726.107 1189.84 z"/>
<!-- Bague de fixation de l'objectif -->
  <path fill="#2B2B2B" d="M 1178.95 891.357 C 1205.92 891.834 1221.67 897.819 1235.13 922.643 C 1229.54 916.594 1216.44 903.979 1208.17 903.541 C 1203.92 907.238 1209.33 929.9 1210.44 936.144 C 1212.76 949.135 1214.81 962.174 1216.57 975.253 C 1224.25 1035.16 1224.66 1098.49 1221.18 1158.66 C 1220.91 1163.31 1220.52 1170.1 1220.95 1174.63 C 1221.55 1181.09 1223.92 1190.17 1223.34 1196.59 C 1218.14 1253.56 1206.22 1311.15 1179.62 1361.84 L 1147.64 1361.86 C 1182.28 1244.6 1187.04 1084.86 1174.29 964.044 C 1173.46 954.556 1164.29 894.953 1166.23 891.744 C 1168.83 891.264 1172.03 891.208 1173.03 894.191 C 1178.58 910.762 1180.24 933.635 1182.19 950.973 C 1198.98 1087.94 1190.74 1226.82 1157.86 1360.83 C 1169.62 1343.42 1174.92 1312.49 1178.79 1291 C 1202.51 1159.42 1201.2 1022.81 1178.95 891.357 z"/>
  <path fill="#2B2B2B" d="M 1201.46 1207.67 L 1202.81 1209.48 C 1204.28 1224.3 1195.54 1261.41 1191.17 1276.67 L 1190.68 1276.08 C 1191.93 1262.36 1198.18 1220.74 1201.46 1207.67 z"/>
  <path fill="#2B2B2B" d="M 970.309 892.322 L 987.003 892.272 C 1003.25 1031.65 1002.34 1172.49 984.267 1311.64 C 983.101 1320.28 978.594 1356.81 974.768 1362.08 L 958.131 1362.3 C 967.48 1319.23 973.165 1272.42 976.968 1228.49 C 986.815 1116.52 984.583 1003.82 970.309 892.322 z"/>
<!-- Aperçu du début de la bague de zoom -->
  <path fill="#2B2B2B" d="M 631.567 891.994 C 635.975 891.725 636.476 891.02 640.16 892.8 C 642.449 896.91 645.715 936.228 646.264 942.794 C 657.118 1072.62 655.359 1233.02 628.539 1360.58 C 619.422 1357.82 614.398 1354.98 606.394 1350.3 L 621.391 1350.09 C 623.217 1338.69 624.949 1327.27 626.587 1315.84 C 617.059 1315.6 596.759 1317.77 589.682 1314.07 C 587.488 1311.17 588.026 1312.55 588.085 1308.56 C 592.311 1305.41 621.931 1306.77 628.547 1306.82 C 629.869 1294.45 631.401 1282.1 633.143 1269.78 C 624.266 1269.49 593.837 1271.32 588.403 1268.09 C 587.882 1264.43 587.525 1265.65 589.104 1262.84 C 595.492 1259 624.737 1260.62 634.307 1260.68 L 637.955 1221.23 C 622.618 1220.94 606.253 1222.06 591.067 1220.8 C 588.81 1220.61 589.421 1220.65 588.095 1218.85 C 587.59 1215.77 587.476 1215.9 588.815 1213.16 C 591.57 1211.17 612.779 1212.13 617.75 1212.19 L 638.844 1212.17 C 639.172 1199.21 640.452 1184.1 641.145 1170.96 C 632.521 1170.98 594.949 1171.54 589.184 1170.4 C 588.031 1167.28 588.292 1166.74 588.66 1163.31 C 592.309 1160.72 633.608 1161.94 641.849 1161.97 C 642.027 1147.77 642.617 1133.2 643.03 1118.98 C 629.78 1118.73 600.423 1120.11 589.15 1118.07 C 587.435 1115.61 587.991 1116.3 588.101 1112.6 C 593.405 1107.94 633.887 1109.85 643.164 1109.92 L 643.179 1065.8 C 635.582 1065.8 591.918 1067.23 588.196 1063.97 C 587.97 1060.83 587.494 1060.93 588.643 1058.46 C 595.751 1055.56 632.922 1056.72 643.006 1056.78 L 641.876 1013.78 C 633.094 1013.48 591.998 1015.5 588.558 1011.79 C 588.487 1009.24 588.057 1007.26 589.47 1005.28 C 595.717 1003.91 632.645 1004.67 641.108 1004.71 C 640.848 991.753 639.527 976.412 638.839 963.201 C 629.024 963.092 596.046 964.378 588.76 962.321 C 588.145 958.799 588.085 958.338 589.051 954.911 C 594.233 953.363 630.32 954.124 637.939 954.167 C 636.326 942.499 635.422 926.997 634.363 914.992 L 595.243 914.947 C 598.166 911.181 599.825 909.358 603.209 905.988 L 633.142 905.974 C 632.34 901.586 631.986 896.491 631.567 891.994 z"/>
<!-- Courbe de séparation entre la bague des ouvertures et la bague de zoom -->
  <path fill="#2B2B2B" d="M 814.93 889.84 C 823.98 897.51 825.48 947.31 826.54 960.27 C 836.15 1077.27 833.65 1213.53 812.95 1328.96 C 811.40 1337.50 809.12 1355.60 806.59 1360.23 L 799.59 1360.23 C 802.12 1355.60 804.40 1337.50 805.95 1328.96 C 826.65 1213.53 829.15 1077.27 819.54 960.27 C 818.48 947.31 816.98 897.51 807.93 889.84 z"/>
<!-- Symbole de la bague des ouvertures -->
  <!-- Chemins du symboles -->
    <path fill="#2B2B2B" d="M 1009.7 1271.8 C 1013.41 1272.8 1013.86 1272.31 1016.42 1274.81 C 1015.91 1277.51 1012.12 1280.24 1009.87 1282.26 C 1008.37 1283.81 1009.25 1283.33 1007.15 1283.78 L 1006.34 1281.56 C 1006.79 1276.56 1007.1 1276 1009.7 1271.8 z"/>
    <path fill="#2B2B2B" d="M 1014.44 1282.63 C 1017.15 1284.88 1021.92 1289.06 1022.74 1292.53 L 1020.74 1293.24 C 1017.24 1292.33 1012.71 1291.4 1010.71 1288.52 C 1011.1 1284.97 1011.26 1285.88 1014.44 1282.63 z"/>
    <path fill="#2B2B2B" d="M 1022.89 1266.14 C 1027.19 1266.05 1027.62 1265.74 1030.2 1268.96 C 1030.24 1272.08 1030.79 1270.87 1028.93 1272.88 L 1025.72 1272.74 C 1022.44 1271.94 1018.15 1271.36 1015.81 1269.24 C 1017.79 1266.88 1019.45 1267.08 1022.89 1266.14 z"/>
    <path fill="#2B2B2B" d="M 1036.68 1269.45 C 1038.66 1270.27 1041.15 1273.8 1041.29 1276.84 C 1041.06 1279.63 1038.65 1280.67 1036.03 1277.91 C 1033.77 1275.41 1033.99 1270.19 1036.68 1269.45 Z
                                               M 1038.8 1281.8 C 1040.5 1283.2 1041.0 1285.8 1038.5 1288.2 C 1034.8 1290.8 1028.5 1291.5 1026.4 1289.8 C 1025.2 1288.7 1027.8 1285.2 1032.2 1283.0 C 1035.0 1281.6 1037.4 1280.7 1038.8 1281.8 Z"/>
<!-- Textes et Graduations -->
  <!-- Graduations des modes d'ouverture -->
    <rect x="1030" y="1230" width="15" height="9" stroke="none" fill="black"/>
    <rect x="1030" y="1250" width="15" height="9" stroke="none" fill="black"/>
  <!-- Textes et graduations alignés sur une courbe adaptée à la surface de la forme cylindrique de l'objectif -->
    <!-- Courbe pour l'alignement du texte (id préfixé « ap- » pour éviter toute collision avec d'autres SVG inline) -->
      <path id="ap-courbe"
                 d="M 1040 1362
                       C 1044 1356 1048 1320 1049 1312
                       C 1062 1173 1063 1032 1048 892
                       C 1043 845 1035 802 1028 760"
                fill="none"/>
    <!-- Textes -->
      <!-- Textes des Commutateurs-->
      <text font-family="Arial, sans-serif"
                font-weight="bold"
                dominant-baseline="middle"
                style="white-space:pre;">
        <textPath href="#ap-courbe" startOffset="23%" text-anchor="start"><!--
        --><tspan dy="-22" fill="red" font-size="35">A</tspan><!--
        --><tspan dy="5" fill="black" font-size="22">                       FULL      5m-&#8734;</tspan><!--
        --></textPath>
      </text>
  <!-- Graduations des focales du zoom -->
    <text font-family="Arial, sans-serif"
              font-size="34"
              font-weight="bold"
              fill="black"
              dominant-baseline="middle"
              style="white-space:pre;">
      <textPath href="#ap-courbe" startOffset="62%" text-anchor="middle"><!--
        --><tspan dy="-250">  300              200</tspan><!--
      --></textPath>
    </text>
</svg>`,
    note:'Fiche en test : contenu à valider et à compléter selon votre boîtier.',
    sections:[
      {title:'Dans le mode M (Manuel)',items:[
        "Sur le symbole du diaphragme : seule la bague crantée de l'objectif règle l'ouverture — la molette du boîtier reste sans effet.",
        "Sur le repère rouge « A » : seule la molette arrière du boîtier règle l'ouverture (réglage « Ouverture » des cartes) — la bague de l'objectif reste sans effet.",
        "Les deux méthodes sont exclusives l'une de l'autre : c'est la position du commutateur qui détermine laquelle est active, jamais les deux en même temps.",
      ]},
      {title:"À propos du commutateur du mode d'ouverture",items:[
        "Repère rouge « A » : l'ouverture est pilotée automatiquement par le boîtier — utile dans d'autres modes d'exposition, mais à éviter en mode Manuel (M), celui utilisé par ce guide.",
        "Autre position : l'ouverture se règle manuellement, sur la bague de l'objectif ou sur la molette avant du boîtier, selon la préférence de l'utilisateur.",
        "Personnalisation : la molette avant peut être réassignée à d'autres fonctions selon la configuration du boîtier ; vérifier son rôle réel si le résultat ne correspond pas à ce résumé.",
      ]},
    ],
    tips:[
      "Vérifier la position du commutateur avant de tourner la bague : en position « A », la bague peut sembler « ne rien faire ».",
      "La valeur d'ouverture affichée à l'écran ou dans le viseur permet de confirmer que le réglage a bien été pris en compte.",
    ],
  },
};

// Renvoie la fiche associée à un id de contrôle (ou null si aucune).
function getControlDetail(ctrlId){
  const key=CONTROL_DETAIL_ALIAS[ctrlId]||ctrlId;
  return CONTROL_DETAILS[key]||null;
}
