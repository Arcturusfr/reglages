# Architecture — PhotoManuel (v1.5, version modulaire)

L'application a été découpée depuis un unique `index.html` (396 Ko) vers une
structure de fichiers séparés, **sans aucun changement de comportement**
(pas de build, pas de bundler — toujours ouvrable directement dans un
navigateur ou déployable tel quel sur GitHub Pages).

## Structure

```
photomanuel/
├── index.html          # Squelette HTML uniquement (markup + <link>/<script src>)
├── manifest.json        # Inchangé
├── sw.js                 # Inchangé
├── css/
│   └── styles.css       # Tout le CSS (anciennement dans <style>)
└── js/
    ├── utils.js          # toast(), esc(), ICONS (icônes SVG de navigation) — utilitaires transverses
    ├── data.js            # DEFAULT_PRESETS, mapping paramètre → contrôles
    ├── schema-data.js     # Données du schéma caméra (coordonnées, catégories, icônes, matériel)
    ├── control-data.js    # Fiches détail des contrôles (SVG animé + texte d'aide) et alias id d'ancre → fiche
    ├── theme.js           # Bascule clair/sombre + persistance
    ├── state.js           # État global des préréglages (CRUD localStorage), resolveParams()
    ├── tabs.js             # Navigation entre onglets principaux
    ├── guide.js            # Rendu de l'onglet "Guide"
    ├── popup.js            # Popup de détail d'un préréglage + ouverture/fermeture du drawer schéma
    ├── schema-drawer.js    # Logique complète du drawer schéma (vues, LCD, histogramme, annotations)
    ├── control-popup.js    # Pop-up « fiche détail d'un contrôle » (ouvert au clic sur une étiquette)
    ├── manage.js           # Rendu de l'onglet "Préréglages"
    ├── form.js             # Formulaire d'ajout/édition (modale)
    ├── io.js               # Export / Import JSON, réinitialisation, drag & drop
    └── init.js             # Écouteurs globaux + démarrage de l'app + service worker
```

## Points importants pour la suite du développement

- **Pas de modules ES** : les fichiers JS sont chargés en `<script>` classiques
  (pas `type="module"`), dans l'ordre indiqué ci-dessus dans `index.html`.
  Toutes les fonctions restent donc globales, ce qui préserve la compatibilité
  avec les `onclick="..."` utilisés directement dans le HTML.
- **L'ordre de chargement compte** : certains fichiers déclarent des `const`/`let`
  utilisés par les suivants (ex. `data.js` avant `state.js`, `schema-data.js`
  avant `schema-drawer.js`). Si tu ajoutes un nouveau fichier, pense à
  l'insérer au bon endroit dans la liste des `<script src="js/...">` en fin
  de `index.html`.
- **Vérification effectuée** : le découpage a été validé ligne par ligne
  (aucune ligne de code perdue ni dupliquée par rapport à l'original), la
  syntaxe de chaque fichier JS a été vérifiée avec `node --check`, et toutes
  les fonctions appelées depuis le HTML (`onclick`, etc.) ont été confirmées
  présentes dans les fichiers JS.
- **Prochaines évolutions** : chaque fichier correspond à une responsabilité
  claire (ex. modifier le formulaire → `form.js` uniquement, ajouter un
  préréglage par défaut → `data.js` uniquement), ce qui devrait limiter les
  fichiers à toucher pour une évolution donnée.

- **Fiches détail des contrôles (V025)** : `control-data.js` se charge après `schema-data.js`, `control-popup.js` après `schema-drawer.js`. Ajouter une fiche = une entrée dans `CONTROL_DETAILS` + les ids d'ancres dans `CONTROL_DETAIL_ALIAS` ; l'étiquette correspondante devient alors cliquable automatiquement.
- **Icônes de navigation** : `ICONS` (utils.js) est la source unique ; les boutons statiques portent `data-icon="..."`, rempli au démarrage par `init.js`.
