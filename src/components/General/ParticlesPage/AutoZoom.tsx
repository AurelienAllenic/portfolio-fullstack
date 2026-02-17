import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const Z_MIN = 6;   // zoom max avant (très proche)
const Z_MAX = 35; // zoom max arrière (dézoom limité)
const FREQ = 0.30; // fréquence du cycle (zoom / dézoom plus rapide)

interface AutoZoomProps {
  resetTrigger: number;
  initialZoom?: number;
}

export default function AutoZoom({ resetTrigger, initialZoom }: AutoZoomProps) {
  const { camera } = useThree();
  const timeOffsetRef = useRef(0);
  const lastResetRef = useRef(resetTrigger);
  const initialZoomRef = useRef<number | null>(initialZoom ?? null);
  const hasInitializedRef = useRef(false);

  // Mettre à jour initialZoomRef quand initialZoom change
  useEffect(() => {
    if (initialZoom !== undefined) {
      initialZoomRef.current = initialZoom;
      hasInitializedRef.current = false;
    }
  }, [initialZoom]);

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      if (initialZoomRef.current !== null && !hasInitializedRef.current) {
        // On a une valeur initiale depuis le mode édition
        const startZoom = initialZoomRef.current;
        camera.position.z = startZoom;
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        hasInitializedRef.current = true;
      } else if (initialZoomRef.current === null) {
        // Comportement normal : commencer depuis Z_MIN
        camera.position.z = Z_MIN;
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        hasInitializedRef.current = false;
      }
    }
  }, [camera, resetTrigger, initialZoom]);

  useFrame((state) => {
    const clock = state.clock.elapsedTime;
    
    if (resetTrigger !== lastResetRef.current) {
      lastResetRef.current = resetTrigger;
      
      // Si on a une valeur initiale, calculer l'offset pour reprendre l'animation
      if (initialZoomRef.current !== null && hasInitializedRef.current) {
        const startZoom = initialZoomRef.current;
        const normalizedZoom = (startZoom - Z_MIN) / (Z_MAX - Z_MIN);
        // Inverser la sinusoïde : s = (sin(t*FREQ) + 1) / 2
        // Donc 2*s - 1 = sin(t*FREQ), donc t*FREQ = arcsin(2*s - 1)
        const angle = Math.asin(Math.max(-1, Math.min(1, 2 * normalizedZoom - 1)));
        timeOffsetRef.current = clock - (angle / FREQ);
        initialZoomRef.current = null; // Réinitialiser après utilisation
        hasInitializedRef.current = false;
      } else {
        // Comportement normal
        timeOffsetRef.current = clock;
      }
    }
    
    const t = clock - timeOffsetRef.current;
    // Sinusoïde : ralentit aux limites, plus de "cognée"
    const s = (Math.sin(t * FREQ) + 1) / 2;
    camera.position.z = Z_MIN + (Z_MAX - Z_MIN) * s;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  });

  return null;
}
