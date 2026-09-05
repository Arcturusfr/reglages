Version 2026-09-03 23:38 (Europe/Paris)

## Important ##

Après chaque génération d'un nouveau fichier de code : intégration + test réel via Chromium/Playwright avant livraison.
Mettre à jour les horodatages + numéro de version `Vxxx`** en commentaire en première ligbe dans les fichiers modifiés ou créés.


## Où on en est

Le chantier en cours est la refonte du **drawer schéma** (l'onglet qui montre visuellement quels boutons/molettes actionner pour un préréglage donné). Objectif final : plusieurs vues possibles (vue avant, vue arrière, objectif...), vue active en grand avec des vignettes cliquables des autres vues pour changer de vue, des étiquettes contenant le nom d'un contrôle (molette, bouton...) sont reliées à ce contrôle par des lignes de rappel (système d'ancrage précis par ancres invisibles). Ces étiquettes devront accueillir la valeur du réglage (vitesse, ISO...) du contrôle concerné et, plus tard, une image SVG du contrôle.

**État d'avancement par vue :**

- ✅ **Vue avant** — entièrement migrée vers le nouveau système, ancrée nativement, testée et validée (alignement pixel-perfect, couleurs, tailles, absence de chevauchement).
- ✅ **Vue arrière** — entièrement migrée vers le nouveau système, ancrée nativement, testée et validée (alignement pixel-perfect, couleurs, tailles, absence de chevauchement).
- ⏳ **Vue objectif** — pas encore ancrée, à faire plus tard.
- ⏳ **Enrichissement des étiquettes des contrôles** — il faudra agrandir le cadre des étiquettes pour y intégrer les valeurs du contrôle et une image du contrôle.
- ⏳ **Simulation LCD** — pas encore intégrée au nouveau système de vues/vignettes.
- ⏳ **Vignettes cliquables remplaçant les onglets** — pas encore implémenté (actuellement encore des onglets classiques `svt-front/svt-lens/svt-back`).

Seul le **mode Manuel (M)** est couvert par le modèle de données ; l'architecture est prévue pour accueillir d'autres modes plus tard sans réécriture.

## Prochaines étapes immédiates

1. **Insérer la valeur du contrôle concerné dans chaque étiquette affichée**
2. **Puis insérer une image du contrôle dans chaque étiquette**
4. **Puis la vue objectif**, adaptation de l'outil `editeur-ancres-vue-avant.html` avec le schéma de l'objectif et les contrôles correspondants
5. **Puis la simulation LCD**, à intégrer dans le même système de vues/vignettes.
6. **Puis les vignettes cliquables** en remplacement des onglets actuels.
7. **Ajouter les horodatages + numéro de version `Vxxx`** dans les fichiers dès la prochaine livraison (exigence du projet non respectée récemment).
8. **Revoir la stratégie de cache du service worker** dans un fil séparé (pas urgent pour le développement du drawer, mais à ne pas perdre de vue).

---
