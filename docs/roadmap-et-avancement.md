Version 2026-09-14 18:50 (Europe/Paris) — V024

## Dernière livraison (V024) — correctif urgent

**Bug signalé par l'utilisateur** : les étiquettes de la vue Objectif ne pointaient plus vers les bons contrôles ; les ancres invisibles avaient disparu de `index.html`.

**Diagnostic** (rendu réel via Playwright en local, sans réseau — chromium fonctionne hors-ligne pour du rendu de fichiers locaux) : deux problèmes cumulés dans la vue Objectif :
1. Les ancres natives `<circle id="anchor-...">` étaient effectivement absentes du SVG Objectif dans `index.html` (contrairement aux vues Avant/Arrière qui en ont).
2. En leur absence, le code retombe sur le repli en % (`CONTROL_COORDS` dans `js/schema-data.js`) — mais ce repli était lui-même faux : les 3 bagues étaient décalées d'un cran (`ring-aperture-lens` pointait en fait sur la bague de mise au point, `ring-focus` sur la bague de zoom, `ring-zoom` sur la bague d'ouverture), et les 2 switches (`switch-ois`, `switch-af-mf`) pointaient carrément sur l'avant du fût au lieu du bloc de commutateurs près de la monture. Ces % n'avaient jamais été recalés après la refonte du viewBox Objectif (V022).

**Correctif appliqué** :
- Ajout des 5 ancres natives manquantes dans `index.html`, placées **hors** du groupe `<g id="lens-hscale-fix" transform="scale(1.5,1)">` — important, car `positionAnnotations()` lit les attributs `cx`/`cy` bruts sans résoudre les transforms ancêtres ; une ancre placée à l'intérieur du groupe y serait mal interprétée.
- Coordonnées déterminées par inspection visuelle du rendu réel du SVG (capture d'écran + repérage des bagues/switches), puis vérifiées en conditions réelles dans l'app (préréglage "Pleine Lune" → onglet Schéma → Objectif).
- Correction en parallèle du repli en % dans `js/schema-data.js` (`CONTROL_COORDS`), pour que ce filet de sécurité soit désormais juste lui aussi, et pas seulement contourné par les nouvelles ancres.

**Testé dans cette session** (fait exceptionnel possible cette fois : Chromium/Playwright fonctionne bien en local malgré le réseau désactivé, tant qu'aucune requête externe n'est nécessaire — seules les polices Google Fonts échouent silencieusement, sans impact) : rendu réel de l'app, ouverture du drawer, bascule sur la vue Objectif, vérifié visuellement que "Focale" pointe sur la bague de zoom et "Ouverture" sur la bague d'ouverture, en mode normal ET en mode agrandi.

**Non résolu / hors-scope** : `switch-ois` et `switch-af-mf` ne sont actuellement référencés par aucune `CONTROL_SEQUENCES` (aucun paramètre du guide ne les active) — leurs ancres/coordonnées ont été corrigées par cohérence mais restent donc pour l'instant inutilisées en pratique.

---

Version 2026-09-14 15:42 (Europe/Paris) — V023

## Dernière livraison (V023)

4 demandes ponctuelles traitées, hors chantier "drawer schéma" en cours ci-dessous :
1. **Renommage du libellé "Molette vitesse" → "Molette arrière"** — dans les étiquettes des schémas ET dans la liste "Commandes concernées" (`js/data.js` : mapping legacy `PARAM_TO_CONTROLS.Vitesse` ; `js/schema-data.js` : `CONTROL_COORDS['dial-shutter']`, `CONTROL_SEQUENCES.vitesse`, `PARAM_ACTION.Vitesse`).
2. **Vue Objectif agrandie de 20%** — `css/styles.css` `#svg-lens-wrap` passe de `max-width:100%` à `120%` (mode normal ET mode agrandi du drawer) ; `js/schema-drawer.js` `VIEW_MAX_WIDTH_RATIO.lens` passe de `1` à `1.2` en conséquence (ces deux valeurs doivent rester synchronisées, comme documenté déjà pour V022).
3. **Étiquettes de la vue Objectif regrossies** — la correction d'aspect ratio du schéma Objectif (V022) avait affiché ce schéma visuellement plus grand dans sa colonne (le ratio étant passé de 0.5 à 1, indépendamment de l'élargissement du viewBox), alors que le système d'harmonisation (`labelScaleForView()`) maintient volontairement les étiquettes à une taille RÉELLE (px écran) strictement identique entre les 3 vues. Résultat : les étiquettes Objectif sont restées à la même taille absolue qu'avant, mais paraissaient disproportionnellement petites à côté d'un schéma plus grand. Ajout d'un nouveau facteur `LABEL_MANUAL_ADJUST` (indépendant de la mesure live d'harmonisation), appliqué après coup, avec `lens:1.3` pour regrossir ces étiquettes en proportion de l'agrandissement du schéma. **Valeur estimée** (pas de mesure Playwright possible dans cette session, réseau désactivé) — à ajuster visuellement si le rendu réel diffère.
4. **Lignes de rappel épaissies à 2px réels** — l'épaisseur (`stroke-width`) des lignes en pointillés reliant chaque étiquette à son ancre était définie en unités viewBox (`'3'`) et non compensée par le facteur d'harmonisation, contrairement au `stroke-dasharray` (qui lui est bien multiplié par `LS`) : elle apparaissait donc extrêmement fine à l'écran (largement sous 1px réel une fois le viewBox réduit à la taille d'affichage) et variait d'une vue à l'autre. Remplacé par `stroke-width:2` + `vector-effect:non-scaling-stroke`, qui fixe l'épaisseur à exactement 2px écran, de façon garantie identique dans les 3 vues quelle que soit leur échelle — plus robuste que toute compensation manuelle par calcul.

**Non testé visuellement dans cette session** (pas d'accès réseau pour lancer Playwright) : à vérifier à l'écran au prochain fil, en particulier le facteur `LABEL_MANUAL_ADJUST.lens` (point 3) qui est une estimation.

---

Version 2026-09-13 22:05 (Europe/Paris)

## Important ##

Après chaque génération d'un nouveau fichier de code : intégration + test réel via Chromium/Playwright avant livraison.
Mettre à jour les horodatages + numéro de version `Vxxx`** en commentaire en première ligbe dans les fichiers modifiés ou créés.

## Où on en est

Le chantier en cours est la refonte du **drawer schéma** (l'onglet qui montre visuellement quels boutons/molettes actionner pour un préréglage donné). Objectif final : plusieurs vues possibles (vue avant, vue arrière, objectif...), vue active en grand avec des vignettes cliquables des autres vues pour changer de vue, des étiquettes contenant le nom d'un contrôle (molette, bouton...) sont reliées à ce contrôle par des lignes de rappel (système d'ancrage précis par ancres invisibles). Ces étiquettes devront accueillir la valeur du réglage (vitesse, ISO...) du contrôle concerné et, plus tard, une image SVG du contrôle.

**État d'avancement par vue :**

- ✅ **Vue avant** — entièrement migrée vers le nouveau système, ancrée nativement, testée et validée (alignement pixel-perfect, couleurs, tailles, absence de chevauchement).
- ✅ **Vue arrière** — entièrement migrée vers le nouveau système, ancrée nativement, testée et validée (alignement pixel-perfect, couleurs, tailles, absence de chevauchement).
- ⏳ **Enrichissement des étiquettes des contrôles** —  les valeurs des contrôles ont été intégrés dans les étiquettes, il reste à ajouter une image du contrôle.
- ✅ **Harmonisation des tailles d'étiquettes entre les 3 schémas** — taille réelle (pixels écran) désormais identique sur avant/arrière/objectif, dans les 2 modes du drawer (normal et agrandi). Testé via Playwright (mesure de bounding-box) : 46.35px/46.35px/46.35px en normal, 57.83px/57.83px/57.83px en agrandi — voir `js/schema-drawer.js` V020 (`labelScaleForView()`).
- ✅ **Anti-croisement des lignes de rappel** — remplacement de l'attribution d'étage (tier) par simple index de tri (ne garantissait pas l'absence de croisement) par `assignTiers()` : calcule pour chaque paire de lignes une contrainte « doit être plus extérieure que » dès que l'une des deux extrémités (côté étiquette OU côté ancre) d'une ligne tombe dans le couloir horizontal d'une autre, puis résout ces contraintes par relaxation itérative bornée (tri topologique) et compacte les étages obtenus. Validé via Playwright : 0 croisement détecté sur les 44 scénarios (préréglage × condition × vue) du jeu de données par défaut, ainsi que sur un cas synthétique d'imbrication où l'ancien algorithme échouait (`test_assign_tiers.py`). Limite connue et documentée dans le code : les chevauchements « en quinconce » (aucun trajet n'englobe complètement l'autre) ne peuvent pas être résolus par un simple étagement — ce cas ne peut survenir qu'en interaction avec le bug de débordement de largeur d'étiquettes déjà listé ci-dessous, et disparaîtra de lui-même une fois celui-ci corrigé. Voir `js/schema-drawer.js` V021.
- ✅ **Vue objectif — déformation corrigée (V022)** — le SVG était dessiné pour un viewBox carré (2120×2120) alors que le sujet (objectif zoom) est réellement plus large que haut, ce qui compressait l'image horizontalement. Correction : tout le contenu du SVG objectif est désormais enveloppé dans `<g id="lens-hscale-fix" transform="scale(1.5,1)">` et le viewBox est élargi en conséquence (`0 0 3180 2120`, ratio ~3:2, cohérent avec la vue avant issue de la même caméra). Comme la mise à l'échelle est uniforme et appliquée à la fois au contenu et au viewBox, les coordonnées de secours en % (`CONTROL_COORDS.lens`) restent valides sans modification. `VIEW_VIEWBOX.lens` et `VIEW_MAX_WIDTH_RATIO.lens` (js/schema-drawer.js) ainsi que `#svg-lens-wrap` (css/styles.css, normal ET mode agrandi) ont été resynchronisés — le schéma n'a plus besoin d'être réduit à 50% puisqu'il n'est plus artificiellement carré. Vérifié via Playwright : ratio d'affichage du schéma objectif = 1.5, identique à la vue avant (1.439 wrap incluant marges, dans les 2 modes normal et agrandi), et hauteur des étiquettes toujours harmonisée (~45px normal / ~58px agrandi) sur les 3 vues. **Facteur 1.5 = estimation raisonnée** (cohérence avec le ratio 3:2 de la vue avant, absence de photo de référence pour l'objectif) — à confirmer/ajuster visuellement par l'utilisateur si besoin ; un seul point à changer en cas d'ajustement : le facteur dans `scale(x,1)` ET la largeur du viewBox `x*2120` en conséquence (ex. `scale(1.4,1)` → `viewBox="0 0 2968 2120"`). **Reste à faire** : ancrage natif (actuellement toujours en secours via coordonnées %), pas encore fait — voir point suivant de la roadmap.
- ⏳ **Simulation LCD** — pas encore intégrée au nouveau système de vues/vignettes.
- ⏳ **Vignettes cliquables remplaçant les onglets** — pas encore implémenté (actuellement encore des onglets classiques `svt-front/svt-lens/svt-back`).

Seul le **mode Manuel (M)** est couvert par le modèle de données ; l'architecture est prévue pour accueillir d'autres modes plus tard sans réécriture.

## Prochaines étapes immédiates
1. **Vue Objectif** — la compression horizontale est corrigée (V022, voir ci-dessus). Reste : ancrage natif du schéma (poser des `<circle id="anchor-...">` réels comme pour avant/arrière, en remplacement du secours en %) via l'outil `editeur-ancres-vue-objectif.html` — cet outil devra utiliser le même viewBox corrigé (`0 0 3180 2120`) et le même wrapper `<g transform="scale(1.5,1)">` que index.html pour que les ancres posées correspondent au rendu réel affiché à l'utilisateur.
3. **Puis insérer une image du contrôle dans chaque étiquette** (évolution encore en réflexion côté utilisateur).
4. **Puis la simulation LCD**, à intégrer dans le même système de vues/vignettes.
5. **Puis les vignettes cliquables** en remplacement des onglets actuels (à voir, finalement les onglets sont peut-être satisfaisants).
6. **Revoir la stratégie de cache du service worker** à faire plus tard (pas urgent pour le développement du drawer, mais à ne pas perdre de vue).
7. **Modifier les couleurs de la face arrière en mode sombre**, actuellement l'affichage face arrière n'est quasiment pas discernable en mode sombre (couleurs d'ombre sur couleur sombre).
8. **[Bug découvert, pré-existant, sans lien avec V020/V021]** Débordement de texte dans certaines étiquettes à 3 lignes : le calcul d'estimation de largeur de texte (facteur `×0.56` par caractère dans `buildLabelData()`) est légèrement trop faible pour du texte en gras (ex. "BALANCE DES BLANCS" déborde de sa boîte sur la vue avant, préréglage "Lever de soleil"). Egalement observé : sur la vue arrière avec 3 étiquettes actives simultanément sur la même rangée (même préréglage), la largeur cumulée dépasse la largeur du schéma et déborde du drawer en mode normal (non agrandi) — `resolveRow()` repositionne les étiquettes mais ne réduit jamais leur largeur si leur somme dépasse l'espace disponible. Reproduit à l'identique dans la version de production d'avant V020 (donc non lié à l'harmonisation des tailles) — à traiter dans un fil dédié. **Priorité relevée après V021** : c'est ce débordement qui crée le seul cas résiduel de croisement (« en quinconce ») que l'anti-croisement de V021 ne peut pas résoudre par étagement seul — corriger ce bug élimine donc aussi ce cas limite.
---
