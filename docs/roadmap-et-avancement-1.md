Version 2026-09-12 (Europe/Paris)

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
- ⏳ **Vue objectif** — la taille est désormais harmonisée avec les deux autres vues (V020), pas encore ancrée, à faire plus tard.
- ⏳ **Simulation LCD** — pas encore intégrée au nouveau système de vues/vignettes.
- ⏳ **Vignettes cliquables remplaçant les onglets** — pas encore implémenté (actuellement encore des onglets classiques `svt-front/svt-lens/svt-back`).

Seul le **mode Manuel (M)** est couvert par le modèle de données ; l'architecture est prévue pour accueillir d'autres modes plus tard sans réécriture.

## Prochaines étapes immédiates
1. **Vue Objectif**, adaptation de l'outil `editeur-ancres-vue-avant.html` avec le schéma de l'objectif et les contrôles correspondants.
2. **Puis insérer une image du contrôle dans chaque étiquette**
3. **Puis la simulation LCD**, à intégrer dans le même système de vues/vignettes.
4. **Puis les vignettes cliquables** en remplacement des onglets actuels.
5. **Revoir la stratégie de cache du service worker** à faire plus tard (pas urgent pour le développement du drawer, mais à ne pas perdre de vue).
6. **Modifier les couleurs de la face arrière en mode sombre**, actuellement l'affichage face arrière n'est quasiment pas discernable en mode sombre (couleurs d'ombre sur couleur sombre).
7. **[Bug découvert, pré-existant, sans lien avec V020/V021]** Débordement de texte dans certaines étiquettes à 3 lignes : le calcul d'estimation de largeur de texte (facteur `×0.56` par caractère dans `buildLabelData()`) est légèrement trop faible pour du texte en gras (ex. "BALANCE DES BLANCS" déborde de sa boîte sur la vue avant, préréglage "Lever de soleil"). Egalement observé : sur la vue arrière avec 3 étiquettes actives simultanément sur la même rangée (même préréglage), la largeur cumulée dépasse la largeur du schéma et déborde du drawer en mode normal (non agrandi) — `resolveRow()` repositionne les étiquettes mais ne réduit jamais leur largeur si leur somme dépasse l'espace disponible. Reproduit à l'identique dans la version de production d'avant V020 (donc non lié à l'harmonisation des tailles) — à traiter dans un fil dédié. **Priorité relevée après V021** : c'est ce débordement qui crée le seul cas résiduel de croisement (« en quinconce ») que l'anti-croisement de V021 ne peut pas résoudre par étagement seul — corriger ce bug élimine donc aussi ce cas limite.
---
