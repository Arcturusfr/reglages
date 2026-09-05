## Où on en est

Le chantier en cours est la refonte du **drawer schéma** (l'onglet qui montre visuellement quels boutons/molettes actionner pour un préréglage donné). Objectif final : drawer plein écran, vue active en grand avec vignettes cliquables des autres vues, système d'ancrage précis, prévu pour accueillir plus tard un zoom animé sur chaque contrôle.

**État d'avancement par vue :**
- ✅ **Vue avant** — entièrement migrée vers le nouveau système, ancrée nativement, testée et validée (alignement pixel-perfect, couleurs, tailles, absence de chevauchement).
- ✅ **Vue arrière** — entièrement migrée vers le nouveau système, ancrée nativement, testée et validée (alignement pixel-perfect, couleurs, tailles, absence de chevauchement).
- ⏳ **Vue objectif** — pas encore ancrée, à faire plus tard.
- ⏳ **Enrichissement des étiquettes des contrôles** — Agrandir le cadre des étiquettes pour y intégrer les valeurs du contrôle et une image du contrôle.
- ⏳ **Simulation LCD** — pas encore intégrée au nouveau système de vues/vignettes.
- ⏳ **Vignettes cliquables remplaçant les onglets** — pas encore implémenté (actuellement encore des onglets classiques `svt-front/svt-lens/svt-back`).

Seul le **mode Manuel (M)** est couvert par le modèle de données ; l'architecture est prévue pour accueillir d'autres modes plus tard sans réécriture.

## Prochaines étapes immédiates

1. Une fois les ancres arrière posées et le code généré par l'outil : même processus qu'en phase 1 (intégration + test réel via Chromium/Playwright avant livraison).
2. **Puis la vue objectif** (mêmes étapes).
3. **Puis la simulation LCD**, à intégrer dans le même système de vues/vignettes.
4. **Puis les vignettes cliquables** en remplacement des onglets actuels.
5. **Ajouter les horodatages + numéro de version `Vxxx`** dans les fichiers dès la prochaine livraison (exigence du projet non respectée récemment).
6. **Revoir la stratégie de cache du service worker** dans un fil séparé (pas urgent pour le développement du drawer, mais à ne pas perdre de vue).

---