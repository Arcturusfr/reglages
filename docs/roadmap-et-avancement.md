Version 2026-09-11 02:19 (Europe/Paris)

## Important ##

Après chaque génération d'un nouveau fichier de code : intégration + test réel via Chromium/Playwright avant livraison.
Mettre à jour les horodatages + numéro de version `Vxxx`** en commentaire en première ligbe dans les fichiers modifiés ou créés.

## Où on en est

Le chantier en cours est la refonte du **drawer schéma** (l'onglet qui montre visuellement quels boutons/molettes actionner pour un préréglage donné). Objectif final : plusieurs vues possibles (vue avant, vue arrière, objectif...), vue active en grand avec des vignettes cliquables des autres vues pour changer de vue, des étiquettes contenant le nom d'un contrôle (molette, bouton...) sont reliées à ce contrôle par des lignes de rappel (système d'ancrage précis par ancres invisibles). Ces étiquettes devront accueillir la valeur du réglage (vitesse, ISO...) du contrôle concerné et, plus tard, une image SVG du contrôle.

**État d'avancement par vue :**

- ✅ **Vue avant** — entièrement migrée vers le nouveau système, ancrée nativement, testée et validée (alignement pixel-perfect, couleurs, tailles, absence de chevauchement).
- ✅ **Vue arrière** — entièrement migrée vers le nouveau système, ancrée nativement, testée et validée (alignement pixel-perfect, couleurs, tailles, absence de chevauchement).
- ⏳ **Enrichissement des étiquettes des contrôles** —  les valeurs des contrôles ont été intégrés dans les étiquettes, il reste à ajouter une image du contrôle.
- ⏳ **Vue objectif** — la taille a été ajustée pour s'harmoniser avec les deux autres vues, pas encore ancrée, à faire plus tard, à terme implémenter la possibilité de choisir l'objectif parmi une liste de deux objectifs (le 70-300 et un grand angle).
- ⏳ **Simulation LCD** — pas encore intégrée au nouveau système de vues/vignettes.
- ⏳ **Vignettes cliquables remplaçant les onglets** — pas encore implémenté (actuellement encore des onglets classiques `svt-front/svt-lens/svt-back`).

Seul le **mode Manuel (M)** est couvert par le modèle de données ; l'architecture est prévue pour accueillir d'autres modes plus tard sans réécriture.

## Prochaines étapes immédiates
1. **Étiquettes des schémas SVG**, harmonisation de la taille des caractères des étiquettes entre les différents schémas par augmentation des tailles les plus petites.
2. **Vue Objectif**, adaptation de l'outil `editeur-ancres-vue-avant.html` avec le schéma de l'objectif et les contrôles correspondants.
3. **Puis insérer une image du contrôle dans chaque étiquette**
4. **Puis choix entre 2 objectifs**, implémenter la possibilité de choisir entre deux objectifs.
5. **Puis la simulation LCD**, à intégrer dans le même système de vues/vignettes.
6. **Puis les vignettes cliquables** en remplacement des onglets actuels.
7. **Revoir la stratégie de cache du service worker** à faire plus tard (pas urgent pour le développement du drawer, mais à ne pas perdre de vue).
8. **Modifier les couleurs de la face arrière en mode sombre**, actuellement l'affichage face arrière n'est quasiment pas discernable en mode sombre (couleurs d'ombre sur couleur sombre).
---
