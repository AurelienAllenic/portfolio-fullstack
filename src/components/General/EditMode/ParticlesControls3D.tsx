import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useEditMode } from '../../../contexts/EditModeContext';
import * as THREE from 'three';

interface ParticlesControls3DProps {
  particlesGroupRef?: React.RefObject<THREE.Group>;
  zoom: number;
  rotation: { x: number; y: number; z: number };
  isInitialized?: boolean;
}

// Composant interne au Canvas qui applique les transformations
const ParticlesControls3D = ({
  particlesGroupRef,
  zoom,
  rotation,
  isInitialized = true,
}: ParticlesControls3DProps) => {
  const { camera } = useThree();
  const { isEditMode } = useEditMode();
  const prevZoomRef = useRef<number | null>(null);
  const prevRotationRef = useRef<{ x: number; y: number; z: number } | null>(null);

  // Appliquer le zoom à la caméra seulement si la valeur a changé
  useEffect(() => {
    if (!isEditMode || !isInitialized || !camera) return;
    
    // Ne pas appliquer si c'est la première fois (pour éviter de modifier le modèle à l'ouverture)
    if (prevZoomRef.current === null) {
      prevZoomRef.current = zoom;
      return;
    }
    
    // Appliquer seulement si la valeur a changé
    if (prevZoomRef.current !== zoom && camera instanceof THREE.PerspectiveCamera) {
      camera.position.z = zoom;
      prevZoomRef.current = zoom;
    }
  }, [isEditMode, isInitialized, zoom, camera]);

  // Appliquer la rotation au groupe de particules seulement si la valeur a changé
  useEffect(() => {
    if (!isEditMode || !isInitialized || !particlesGroupRef?.current) return;

    // Ne pas appliquer si c'est la première fois
    if (prevRotationRef.current === null) {
      prevRotationRef.current = rotation;
      return;
    }

    // Appliquer seulement si la valeur a changé
    const prev = prevRotationRef.current;
    if (
      prev.x !== rotation.x ||
      prev.y !== rotation.y ||
      prev.z !== rotation.z
    ) {
      const group = particlesGroupRef.current;
      group.rotation.set(
        THREE.MathUtils.degToRad(rotation.x),
        THREE.MathUtils.degToRad(rotation.y),
        THREE.MathUtils.degToRad(rotation.z)
      );
      prevRotationRef.current = rotation;
    }
  }, [isEditMode, isInitialized, rotation, particlesGroupRef]);

  // Réinitialiser les refs quand le mode édition est désactivé
  useEffect(() => {
    if (!isEditMode) {
      prevZoomRef.current = null;
      prevRotationRef.current = null;
    }
  }, [isEditMode]);

  return null;
};

export default ParticlesControls3D;
