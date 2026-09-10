# AutoFrame React V3

V3 du prototype de standardisation photo automobile.

## Nouveauté principale : mode Collecte IA

La V3 prépare la création d'un vrai classificateur automobile 8 vues.

Classes :
1. Face avant
2. 3/4 avant gauche
3. Profil gauche
4. 3/4 arrière gauche
5. Face arrière
6. 3/4 arrière droit
7. Profil droit
8. 3/4 avant droit

Dans l'application, passe sur `Collecte IA`, sélectionne la classe correcte puis photographie
le véhicule. Chaque photo est stockée localement dans le navigateur avec ses métriques.

Le bouton `Exporter JSON` génère un fichier contenant :
- l'étiquette de vue ;
- la photo JPEG sous forme data URL ;
- date/heure ;
- score de détection ;
- centrage ;
- occupation ;
- lumière ;
- netteté ;
- score de l'heuristique d'angle.

## Pourquoi

La V2 utilise une heuristique de silhouette. Elle n'est pas suffisante pour distinguer réellement
les 8 angles.

Le dataset créé avec la V3 servira à entraîner plus tard un modèle spécialisé.

## Conseils de collecte

Ne photographie pas seulement un véhicule.

Pour éviter que le modèle mémorise un modèle de voiture au lieu de l'angle, varier :
- citadines ;
- berlines ;
- SUV ;
- utilitaires ;
- couleurs ;
- arrière-plans ;
- luminosité ;
- distances raisonnables.

Garder une étiquette correcte est plus important que le volume.

## Déploiement

Même workflow GitHub Pages que précédemment.

```bash
npm install
npm run build
```

Puis push sur `main`.

## Limitation

Le stockage `localStorage` est adapté à une petite démo uniquement. Les photos encodées en base64
occupent rapidement beaucoup d'espace. Une version de collecte sérieuse utilisera IndexedDB ou un backend.
