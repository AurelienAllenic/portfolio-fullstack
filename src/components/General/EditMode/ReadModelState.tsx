import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useEditMode } from '../../../contexts/EditModeContext';
import * as THREE from 'three';

interface ReadModelStateProps {
  particlesGroupRef?: React.RefObject<THREE.Group>;
  onStateRead: (zoom: number, rotation: { x: number; y: number; z: number }) => void;
}

// Composant qui lit l'état actuel du modèle quand le mode édition est activé
const ReadModelState = ({
  particlesGroupRef,
  onStateRead,
}: ReadModelStateProps) => {
  const { camera } = useThree();
  const { isEditMode } = useEditMode();
  const hasReadRef = useRef(false);

  useEffect(() => {
    // Lire les valeurs seulement une fois quand le mode édition est activé
    if (!isEditMode || hasReadRef.current) return;
    
    let currentZoom = 25; // valeur par défaut
    let currentRotation = { x: 0, y: 0, z: 0 };

    // Lire le zoom actuel de la caméra
    if (camera instanceof THREE.PerspectiveCamera) {
      currentZoom = camera.position.z;
    }

    // Lire la rotation actuelle du groupe de particules
    if (particlesGroupRef?.current) {
      const group = particlesGroupRef.current;
      currentRotation = {
        x: THREE.MathUtils.radToDeg(group.rotation.x),
        y: THREE.MathUtils.radToDeg(group.rotation.y),
        z: THREE.MathUtils.radToDeg(group.rotation.z),
      };
    }

    // Envoyer les valeurs au parent
    onStateRead(currentZoom, currentRotation);
    hasReadRef.current = true;
  }, [isEditMode, camera, particlesGroupRef, onStateRead]);

  // Réinitialiser le flag quand le mode édition est désactivé
  useEffect(() => {
    if (!isEditMode) {
      hasReadRef.current = false;
    }
  }, [isEditMode]);

  return null;
};

export default ReadModelState;
