# Mode Édition

Ce système permet d'activer un mode édition qui bloque les transitions de scroll et offre des contrôles pour les modèles 3D.

## Utilisation

### Bouton d'édition

Le bouton d'édition est automatiquement ajouté en bas à droite de l'écran. Il permet d'activer/désactiver le mode édition.

### Contrôles pour modèles 3D

Pour utiliser les contrôles sur un modèle 3D, importez et utilisez le composant `Model3DControls` :

```tsx
import Model3DControls from '../../General/EditMode/Model3DControls';
import { useEditMode } from '../../../contexts/EditModeContext';

const My3DModel = () => {
  const modelRef = useRef<HTMLDivElement>(null);
  const { isEditMode } = useEditMode();

  return (
    <>
      <div ref={modelRef} className="my-3d-model">
        {/* Votre modèle 3D ici */}
      </div>
      
      <Model3DControls
        modelRef={modelRef}
        zoomLevels={[0.5, 0.75, 1, 1.25, 1.5, 2]}
        initialZoom={1}
        initialRotation={{ x: 0, y: 0, z: 0 }}
        onZoomChange={(zoom) => {
          console.log('Zoom changé:', zoom);
        }}
        onRotationChange={(rotation) => {
          console.log('Rotation changée:', rotation);
        }}
      />
    </>
  );
};
```

### Props du composant Model3DControls

- `zoomLevels` (optionnel) : Tableau des niveaux de zoom disponibles. Par défaut: `[0.5, 0.75, 1, 1.25, 1.5, 2]`
- `initialZoom` (optionnel) : Zoom initial. Par défaut: `1`
- `initialRotation` (optionnel) : Rotation initiale. Par défaut: `{ x: 0, y: 0, z: 0 }`
- `onZoomChange` (optionnel) : Callback appelé quand le zoom change
- `onRotationChange` (optionnel) : Callback appelé quand la rotation change
- `modelRef` (optionnel) : Référence vers l'élément DOM du modèle 3D

### Utilisation du contexte EditMode

Pour accéder à l'état du mode édition dans n'importe quel composant :

```tsx
import { useEditMode } from '../../../contexts/EditModeContext';

const MyComponent = () => {
  const { isEditMode, toggleEditMode, setEditMode } = useEditMode();

  return (
    <div>
      {isEditMode && <p>Mode édition activé</p>}
      <button onClick={toggleEditMode}>
        {isEditMode ? 'Désactiver' : 'Activer'} le mode édition
      </button>
    </div>
  );
};
```

## Fonctionnalités

- ✅ Bouton d'édition en bas à droite avec icône pinceau
- ✅ Blocage des transitions de scroll quand le mode édition est activé
- ✅ Contrôles de zoom pour les modèles 3D
- ✅ Contrôles de rotation pour les modèles 3D
- ✅ Interface utilisateur moderne et responsive
