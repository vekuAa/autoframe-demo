# AutoFrame React V2

Prototype autonome de standardisation de prises de vue automobiles.

## Ce que la V2 ajoute

- contrôle de luminosité en direct ;
- estimation légère de netteté ;
- moteur d'angle séparé ;
- distinction expérimentale `profil` vs `3/4` ;
- refus de validation lorsque la famille de vue paraît incompatible ;
- architecture prête à remplacer l'heuristique par un vrai classificateur automobile.

## Très important : limite de l'angle

Le fichier `src/lib/angleEstimator.ts` est une **heuristique de démonstration**.

Il utilise principalement le ratio largeur/hauteur de la bounding box détectée pour tenter
de distinguer :

- silhouette très longue -> plutôt profil ;
- silhouette plus compacte -> plutôt 3/4.

Cette méthode n'est PAS suffisante pour une production automobile.

Elle ne peut pas certifier de manière fiable :
- avant vs arrière ;
- gauche vs droite ;
- angle exact en degrés ;
- différences de silhouettes entre citadine, SUV, utilitaire, etc.

Le but de la V2 est de valider l'UX et l'architecture.

## Architecture cible production

```text
Camera
  ↓
Vehicle detector
  ↓
Image-quality analyzer
  ├─ brightness
  └─ sharpness
  ↓
Automotive viewpoint classifier
  ├─ front
  ├─ front-left-3q
  ├─ left-side
  ├─ rear-left-3q
  ├─ rear
  ├─ rear-right-3q
  ├─ right-side
  └─ front-right-3q
  ↓
QualityEngine
  ↓
red / orange / green
```

Dans une V3, `angleEstimator.ts` devra être remplacé par un modèle entraîné sur des images
automobiles étiquetées par vue.

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages

Le workflow est inclus :

`.github/workflows/deploy-pages.yml`

Dans GitHub :

1. Settings
2. Pages
3. Source : GitHub Actions
4. push sur `main`

## Comment mettre à jour ton repo existant

Tu peux remplacer les fichiers V1 par ceux de cette V2, notamment :

- `src/App.tsx`
- `src/types.ts`
- `src/components/Metrics.tsx`
- `src/lib/protocol.ts`
- `src/lib/qualityEngine.ts`

et ajouter :

- `src/lib/imageQuality.ts`
- `src/lib/angleEstimator.ts`

Le workflow et `tsconfig.node.json` fournis ici contiennent également les corrections utilisées
pour ton déploiement GitHub Pages.
