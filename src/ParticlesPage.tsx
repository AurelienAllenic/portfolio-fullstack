import React, { Suspense, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
// @ts-ignore
import { Model } from "../Particles.jsx";
import AutoZoom from "./components/General/ParticlesPage/AutoZoom";
import RadialTransitionOverlay from "./components/General/Nav/RadialTransitionOverlay";
import styles from "./particlesPage.module.scss";

const ParticlesPage: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [curtainClosed, setCurtainClosed] = useState(false);
  const [showNextModel, setShowNextModel] = useState(false);
  const [zoomResetTrigger, setZoomResetTrigger] = useState(0);
  const [showEntranceOverlay, setShowEntranceOverlay] = useState(true);
  const hasClosedRef = useRef(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (hasClosedRef.current) {
        // Scroll vers le haut = revenir au modèle
        if (e.deltaY < 0) {
          hasClosedRef.current = false;
          setCurtainClosed(false);
          setShowNextModel(false);
          setZoomResetTrigger((t) => t + 1);
        }
        return;
      }

      // Scroll vers le bas = fermer (noir + modèle suivant)
      if (e.deltaY > 0) {
        hasClosedRef.current = true;
        setCurtainClosed(true);
        setTimeout(() => setShowNextModel(true), 400);
      }
    };

    wrapper.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      wrapper.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mes modèles 3D</h1>
        <Link to="/" className={styles.backButton}>
          Retour
        </Link>
      </header>

      <div className={styles.canvasWrapper}>
        <Canvas camera={{ position: [0, 0, 25], fov: 60 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <Model />
            <AutoZoom resetTrigger={zoomResetTrigger} />
          </Suspense>
        </Canvas>
      </div>
      <div className={styles.overlay} aria-hidden />
      <div
        className={`${styles.overlayCurtain} ${curtainClosed ? styles.closed : ""}`}
        aria-hidden
      />
      <div
        className={`${styles.nextModel} ${showNextModel ? styles.visible : ""}`}
        aria-hidden
      >
        <p className={styles.nextModelText}>Modèle suivant</p>
      </div>

      {/* Entrée : radial noir fermé qui s’ouvre pour révéler la page */}
      <RadialTransitionOverlay
        isActive={showEntranceOverlay}
        direction="out"
        onComplete={() => setShowEntranceOverlay(false)}
      />
    </div>
  );
};

export default ParticlesPage;
