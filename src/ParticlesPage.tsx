import React, { Suspense, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
// @ts-ignore
import { Model } from "../Particles.jsx";
import AutoZoom from "./components/General/ParticlesPage/AutoZoom";
import ParticlesControls from "./components/General/EditMode/ParticlesControls";
import ParticlesControls3D from "./components/General/EditMode/ParticlesControls3D";
import ReadModelState from "./components/General/EditMode/ReadModelState";
import EditModeButton from "./components/General/EditMode/EditModeButton";
import RadialTransitionOverlay from "./components/General/Nav/RadialTransitionOverlay";
import { useEditMode } from "./contexts/EditModeContext";
import styles from "./particlesPage.module.scss";

const isTouchOrNarrow = () =>
  typeof window !== "undefined" &&
  (window.innerWidth < 768 || "ontouchstart" in window);

const ParticlesPage: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const particlesGroupRef = useRef<THREE.Group>(null);
  const [curtainClosed, setCurtainClosed] = useState(false);
  const [showNextModel, setShowNextModel] = useState(false);
  const [zoomResetTrigger, setZoomResetTrigger] = useState(0);
  const [showEntranceOverlay, setShowEntranceOverlay] = useState(true);
  const [lowPerf] = useState(() => isTouchOrNarrow());
  const hasClosedRef = useRef(false);
  const { isEditMode } = useEditMode();
  const [zoom, setZoom] = useState(25);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [lightIntensity, setLightIntensity] = useState(0.5);
  const [particleCount, setParticleCount] = useState(() => lowPerf ? 30 : 200);
  const [particleColor, setParticleColor] = useState('#ffffff');
  const [minBrightness, setMinBrightness] = useState(1.0);
  const [maxBrightness, setMaxBrightness] = useState(3.5);

  // Fonction pour initialiser les valeurs depuis le modèle actuel
  const handleStateRead = (currentZoom: number, currentRotation: { x: number; y: number; z: number }) => {
    if (!isInitialized) {
      setZoom(currentZoom);
      setRotation(currentRotation);
      setIsInitialized(true);
    }
  };

  // Sauvegarder le zoom actuel quand on ferme le panneau pour une transition fluide
  useEffect(() => {
    if (!isEditMode && isInitialized) {
      // Le zoom actuel est déjà dans le state, AutoZoom lira la position de la caméra directement
      setIsInitialized(false);
    }
  }, [isEditMode, isInitialized]);

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
      // Bloquer le scroll si le mode édition est activé
      if (isEditMode) {
        e.preventDefault();
        return;
      }
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
      // Bloquer le scroll si le mode édition est activé
      if (isEditMode) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Bloquer complètement le swipe si le mode édition est activé
      if (isEditMode) {
        e.preventDefault();
        return;
      }
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
  }, [isEditMode]);

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
            <ambientLight intensity={lightIntensity} />
            <Model
              maxParticles={particleCount}
              groupRef={particlesGroupRef}
              particleColor={parseInt(particleColor.replace('#', ''), 16)}
              minBrightness={minBrightness}
              maxBrightness={maxBrightness}
            />
            {!isEditMode && <AutoZoom resetTrigger={zoomResetTrigger} />}
            {isEditMode && (
              <>
                <ReadModelState
                  particlesGroupRef={particlesGroupRef}
                  onStateRead={handleStateRead}
                />
                <ParticlesControls3D
                  particlesGroupRef={particlesGroupRef}
                  zoom={zoom}
                  rotation={rotation}
                  isInitialized={isInitialized}
                />
              </>
            )}
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
      <EditModeButton />
      {isEditMode && isInitialized && (
        <ParticlesControls
          particlesGroupRef={particlesGroupRef}
          zoom={zoom}
          rotation={rotation}
          onZoomUpdate={setZoom}
          onRotationUpdate={setRotation}
          lightIntensity={lightIntensity}
          onLightIntensityUpdate={setLightIntensity}
          particleCount={particleCount}
          onParticleCountUpdate={setParticleCount}
          particleColor={particleColor}
          onParticleColorUpdate={setParticleColor}
          minBrightness={minBrightness}
          maxBrightness={maxBrightness}
          onBrightnessUpdate={(min, max) => {
            setMinBrightness(min);
            setMaxBrightness(max);
          }}
        />
      )}
    </div>
  );
};

export default ParticlesPage;
