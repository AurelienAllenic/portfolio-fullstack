import React, { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
// @ts-ignore
import { Model } from "../../../../Particles.jsx";
import styles from "./particlesTransition.module.scss";
import { gsap } from "gsap";

interface ParticlesTransitionProps {
  isActive: boolean;
  onComplete?: () => void;
}

const ParticlesTransition: React.FC<ParticlesTransitionProps> = ({
  isActive,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Position initiale : hors écran à gauche
    gsap.set(container, { x: "-100vw", opacity: 1 });

    // Animation : traverse l'écran de gauche à droite
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });

    tl.to(container, {
      x: "100vw",
      duration: 2.5,
      ease: "power2.inOut",
    });

    return () => {
      tl.kill();
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div ref={containerRef} className={styles.particlesTransition}>
      <Canvas camera={{ position: [0, 0, 25], fov: 60 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <Model />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ParticlesTransition;
