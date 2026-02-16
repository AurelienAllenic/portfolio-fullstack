import React, { Suspense, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
// @ts-ignore
import { Model } from "../Particles.jsx";
import AutoZoom from "./components/General/ParticlesPage/AutoZoom";
import RadialTransitionOverlay from "./components/General/Nav/RadialTransitionOverlay";
import styles from "./particlesPage.module.scss";

const isTouchOrNarrow = () =>
  typeof window !== "undefined" &&
  (window.innerWidth < 768 || "ontouchstart" in window);

const ParticlesPage: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [curtainClosed, setCurtainClosed] = useState(false);
  const [showNextModel, setShowNextModel] = useState(false);
  const [zoomResetTrigger, setZoomResetTrigger] = useState(0);
  const [showEntranceOverlay, setShowEntranceOverlay] = useState(true);
  const [lowPerf] = useState(() => isTouchOrNarrow());
  const hasClosedRef = useRef(false);

  // Bloquer tout scroll / overflow sur la page
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyTouchAction = body.style.touchAction;
    const prevBodyHeight = body.style.height;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    body.style.height = "100%";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.touchAction = prevBodyTouchAction;
      body.style.height = prevBodyHeight;
    };
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const goToNext = () => {
      hasClosedRef.current = true;
      setCurtainClosed(true);
      setTimeout(() => setShowNextModel(true), 400);
    };

    const goBack = () => {
      hasClosedRef.current = false;
      setCurtainClosed(false);
      setShowNextModel(false);
      setZoomResetTrigger((t) => t + 1);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (hasClosedRef.current) {
        if (e.deltaY < 0) goBack();
        return;
      }
      if (e.deltaY > 0) goToNext();
    };

    const TOUCH_THRESHOLD = 50;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!e.changedTouches[0]) return;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchEndY - touchStartY;
      // Du bas vers le haut (swipe up, deltaY < 0) = masquer ; du haut vers le bas (swipe down, deltaY > 0) = réafficher
      if (hasClosedRef.current) {
        if (deltaY > TOUCH_THRESHOLD) goBack();
        return;
      }
      if (deltaY < -TOUCH_THRESHOLD) goToNext();
    };

    wrapper.addEventListener("wheel", handleWheel, { passive: false });
    wrapper.addEventListener("touchstart", handleTouchStart, { passive: true });
    wrapper.addEventListener("touchmove", handleTouchMove, { passive: false });
    wrapper.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      wrapper.removeEventListener("wheel", handleWheel);
      wrapper.removeEventListener("touchstart", handleTouchStart);
      wrapper.removeEventListener("touchmove", handleTouchMove);
      wrapper.removeEventListener("touchend", handleTouchEnd);
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
        <Canvas
          camera={{ position: [0, 0, 25], fov: 60 }}
          dpr={lowPerf ? 1 : undefined}
          frameloop={curtainClosed && lowPerf ? "never" : "always"}
          gl={{
            antialias: !lowPerf,
            powerPreference: lowPerf ? "low-power" : "default",
            stencil: false,
            depth: true,
          }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <Model maxParticles={lowPerf ? 30 : 200} />
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
