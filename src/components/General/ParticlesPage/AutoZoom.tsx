import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const Z_MIN = 6;   // zoom max avant (très proche)
const Z_MAX = 35; // zoom max arrière (dézoom limité)
const FREQ = 0.30; // fréquence du cycle (zoom / dézoom plus rapide)

interface AutoZoomProps {
  resetTrigger: number;
}

export default function AutoZoom({ resetTrigger }: AutoZoomProps) {
  const { camera } = useThree();
  const timeOffsetRef = useRef(0);
  const lastResetRef = useRef(resetTrigger);
  const hasInitializedRef = useRef(false);

  useFrame((state) => {
    const clock = state.clock.elapsedTime;
    
    // Initialiser depuis la position actuelle de la caméra au premier frame
    if (!hasInitializedRef.current && camera instanceof THREE.PerspectiveCamera) {
      const currentZoom = camera.position.z;
      const normalizedZoom = (currentZoom - Z_MIN) / (Z_MAX - Z_MIN);
      const clampedNormalized = Math.max(0, Math.min(1, normalizedZoom));
      
      // Calculer l'angle pour la sinusoïde
      const angle = Math.asin(Math.max(-1, Math.min(1, 2 * clampedNormalized - 1)));
      
      // Calculer l'offset de temps pour que l'animation reprenne à la position actuelle
      timeOffsetRef.current = clock - (angle / FREQ);
      hasInitializedRef.current = true;
    }
    
    if (resetTrigger !== lastResetRef.current) {
      lastResetRef.current = resetTrigger;
      
      // Lire la position actuelle de la caméra
      if (camera instanceof THREE.PerspectiveCamera) {
        const currentZoom = camera.position.z;
        const normalizedZoom = (currentZoom - Z_MIN) / (Z_MAX - Z_MIN);
        const clampedNormalized = Math.max(0, Math.min(1, normalizedZoom));
        
        // Calculer l'angle pour la sinusoïde
        const angle = Math.asin(Math.max(-1, Math.min(1, 2 * clampedNormalized - 1)));
        
        // Calculer l'offset de temps pour que l'animation reprenne à la position actuelle
        timeOffsetRef.current = clock - (angle / FREQ);
      }
    }
    
    if (camera instanceof THREE.PerspectiveCamera && hasInitializedRef.current) {
      const t = clock - timeOffsetRef.current;
      // Sinusoïde : ralentit aux limites, plus de "cognée"
      const s = (Math.sin(t * FREQ) + 1) / 2;
      const targetZ = Z_MIN + (Z_MAX - Z_MIN) * s;
      
      // Appliquer directement la position calculée (pas de transition, l'animation continue naturellement)
      camera.position.z = targetZ;
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
