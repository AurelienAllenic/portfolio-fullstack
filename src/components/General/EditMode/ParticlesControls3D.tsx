import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
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
  const targetZoomRef = useRef<number | null>(null);
  const isAnimatingZoomRef = useRef(false);

  // Détecter les changements de zoom et démarrer l'animation
  useEffect(() => {
    if (!isEditMode || !isInitialized || !camera) return;
    
    if (prevZoomRef.current === null) {
      prevZoomRef.current = zoom;
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.position.z = zoom;
      }
      return;
    }
    
    if (prevZoomRef.current !== zoom && camera instanceof THREE.PerspectiveCamera) {
      targetZoomRef.current = zoom;
      isAnimatingZoomRef.current = true;
    }
  }, [isEditMode, isInitialized, zoom, camera]);

  // Animation fluide du zoom avec useFrame
  useFrame(() => {
    if (!isEditMode || !isInitialized || !camera || !isAnimatingZoomRef.current) return;
    
    if (camera instanceof THREE.PerspectiveCamera && targetZoomRef.current !== null) {
      const currentZ = camera.position.z;
      const targetZ = targetZoomRef.current;
      const diff = targetZ - currentZ;
      
      if (Math.abs(diff) > 0.01) {
        // Interpolation avec easing ease-out
        camera.position.z += diff * 0.15;
      } else {
        camera.position.z = targetZ;
        prevZoomRef.current = targetZ;
        isAnimatingZoomRef.current = false;
        targetZoomRef.current = null;
      }
    }
  });

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

  // S'assurer que la caméra est à la bonne position quand on ferme le panneau
  useEffect(() => {
    if (!isEditMode && camera instanceof THREE.PerspectiveCamera && prevZoomRef.current !== null) {
      // Forcer la caméra à la position du zoom du state avant de fermer
      camera.position.z = zoom;
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      prevZoomRef.current = null;
      prevRotationRef.current = null;
    }
  }, [isEditMode, camera, zoom]);

  return null;
};

export default ParticlesControls3D;
