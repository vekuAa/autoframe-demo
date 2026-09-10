# AutoFrame React V1

Prototype autonome React + TypeScript pour standardiser la prise de photo automobile.

## Stack
- React
- TypeScript
- Vite
- TensorFlow.js
- COCO-SSD

COCO-SSD reçoit directement l'élément `<video>` du navigateur et retourne notamment une bounding box,
une classe et un score de confiance. Dans cette V1 il sert uniquement à localiser le véhicule.

## Fonctions V1
- caméra arrière téléphone
- détection voiture / camion / bus
- protocole de 3 vues
- gabarit visuel distinct par vue
- moteur de qualité séparé (`src/lib/qualityEngine.ts`)
- rouge : hors tolérances
- orange : proche de la cible
- vert : taille + centrage conformes
- stabilité requise avant activation du bouton
- capture photo
- passage automatique à l'étape suivante

## Important
Cette V1 ne certifie PAS encore que la caméra voit réellement un angle 3/4 avant, profil ou 3/4 arrière.
Le gabarit indique la vue attendue, mais COCO-SSD ne fournit pas cette classification d'angle.
Une V2 devra ajouter un modèle automobile spécialisé.

## Installation locale

Vite actuel nécessite une version moderne de Node.js.

```bash
npm install
npm run dev
```

Puis ouvrir l'URL locale affichée par Vite.

## Test sur téléphone

L'accès caméra du navigateur nécessite un contexte sécurisé dans les navigateurs courants.
Déploie le projet en HTTPS (Vercel, Netlify ou GitHub Pages), puis ouvre l'URL sur le téléphone.

### GitHub Pages

Le projet utilise `base: './'` dans `vite.config.ts` et contient déjà :
`.github/workflows/deploy-pages.yml`.

Tu peux donc pousser tout le dossier sur GitHub. Ensuite :

1. `Settings` → `Pages`
2. Dans `Build and deployment`, choisir **GitHub Actions**
3. pousser sur la branche `main`

GitHub installera les dépendances, construira Vite et publiera automatiquement le dossier `dist`.

En local :

```bash
npm install
npm run build
```

## Architecture

```text
src/
  components/
    GuideOverlay.tsx
    Metrics.tsx
    ProtocolStrip.tsx
  lib/
    detector.ts       # TensorFlow / COCO-SSD
    protocol.ts       # liste des prises de vue
    qualityEngine.ts  # règles métier rouge/orange/vert
  App.tsx
  types.ts
  styles.css
```

Le découplage du moteur de qualité est volontaire : il pourra être repris ou exposé plus tard
dans l'application métier principale.
