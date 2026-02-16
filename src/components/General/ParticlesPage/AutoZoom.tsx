import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

const Z_MIN = 6;   // zoom max avant (très proche)
const Z_MAX = 35; // zoom max arrière (dézoom limité)
const FREQ = 0.30; // fréquence du cycle (zoom / dézoom plus rapide)

export default function AutoZoom({ resetTrigger }: { resetTrigger: number }) {
  const { camera } = useThree();
  const timeOffsetRef = useRef(0);
  const lastResetRef = useRef(resetTrigger);

  useEffect(() => {
    camera.position.z = Z_MIN;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, resetTrigger]);

  useFrame((state) => {
    const clock = state.clock.elapsedTime;
    if (resetTrigger !== lastResetRef.current) {
      lastResetRef.current = resetTrigger;
      timeOffsetRef.current = clock;
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
