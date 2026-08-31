# 📷 PhotoManuel — Réglages Photo Mode Manuel

Application web progressive (PWA) pour retrouver rapidement les réglages optimaux de votre appareil photo en mode manuel selon le type de sujet photographié.

## Fonctionnalités

- **Guide interactif** : 10 préréglages par défaut (Voie Lactée, Lune, éclipse solaire, lever de soleil, aurores boréales…)
- **Paramètres détaillés** : ouverture, vitesse, ISO, balance des blancs, focale, mise au point, filtres…
- **Conseils de prise de vue** par type de photo
- **Avertissements de sécurité** (éclipse solaire, foudre)
- **Personnalisation complète** : ajoutez, modifiez, supprimez vos propres préréglages
- **Export / Import JSON** : sauvegardez et restaurez vos données
- **PWA** : installable sur smartphone, fonctionne hors-ligne
- **Optimisé ZFold 5** : mise en page adaptative pour écran plié et déplié

## Structure des fichiers

```
├── index.html      # Application principale (autoportante)
├── manifest.json   # Manifeste PWA
├── sw.js           # Service Worker (cache hors-ligne)
├── icon-192.png    # Icône PWA 192×192 (à créer)
├── icon-512.png    # Icône PWA 512×512 (à créer)
└── README.md       # Ce fichier
```

## Déploiement sur GitHub Pages

1. Créez un dépôt GitHub (ex: `photomanuel`)
2. Uploadez les fichiers `index.html`, `manifest.json`, `sw.js` (et les icônes)
3. Dans **Settings → Pages**, choisissez la branche `main` et le dossier `/root`
4. Votre app sera disponible sur `https://<votre-pseudo>.github.io/photomanuel/`

### Icônes PWA

Pour générer les icônes (`icon-192.png` et `icon-512.png`), vous pouvez utiliser :
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Builder](https://www.pwabuilder.com/)
- Toute image carrée redimensionnée en 192×192 et 512×512 px

### Installation sur Android (ZFold 5)

1. Ouvrez l'URL dans **Chrome**
2. Appuyez sur ⋮ → **"Ajouter à l'écran d'accueil"**
3. L'app s'installe comme une application native

## Données

Toutes les données sont stockées dans le **localStorage** du navigateur. Utilisez la fonction **Export** pour sauvegarder vos préréglages dans un fichier JSON avant de changer d'appareil ou de navigateur.

## Préréglages inclus par défaut

| Icône | Nom | Catégorie |
|-------|-----|-----------|
| 🌅 | Lever de soleil | Ciel & Atmosphère |
| 🏔️ | Sommets montagneux | Paysage |
| 🌕 | Pleine Lune | Astronomie |
| 🌙 | Lune en croissant | Astronomie |
| 🌑 | Éclipse solaire ⚠️ | Astronomie |
| 🌌 | Voie Lactée | Astronomie |
| 🌒 | Éclipse lunaire | Astronomie |
| ⚡ | Foudre & Orages | Météo |
| 🌌 | Aurores boréales | Astronomie |
| ⭐ | Filés d'étoiles | Astronomie |

## Licence

Usage personnel libre. Adaptez et partagez à votre guise.
