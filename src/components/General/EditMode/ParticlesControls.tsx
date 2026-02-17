import { useState, useEffect } from 'react';
import { useEditMode } from '../../../contexts/EditModeContext';
import { HiMagnifyingGlassPlus, HiMagnifyingGlassMinus, HiArrowPath } from 'react-icons/hi2';
import styles from './particlesControls.module.scss';

interface ParticlesControlsProps {
  particlesGroupRef?: React.RefObject<any>;
  onZoomChange?: (zoom: number) => void;
  onRotationChange?: (rotation: { x: number; y: number; z: number }) => void;
  zoom: number;
  rotation: { x: number; y: number; z: number };
  onZoomUpdate: (zoom: number) => void;
  onRotationUpdate: (rotation: { x: number; y: number; z: number }) => void;
  // Nouvelles props pour particules
  lightIntensity?: number;
  onLightIntensityUpdate?: (intensity: number) => void;
  particleCount?: number;
  onParticleCountUpdate?: (count: number) => void;
  particleColor?: string;
  onParticleColorUpdate?: (color: string) => void;
  minBrightness?: number;
  maxBrightness?: number;
  onBrightnessUpdate?: (min: number, max: number) => void;
}

const ParticlesControls = ({
  onZoomChange,
  onRotationChange,
  zoom,
  rotation,
  onZoomUpdate,
  onRotationUpdate,
  lightIntensity = 0.5,
  onLightIntensityUpdate,
  particleCount = 200,
  onParticleCountUpdate,
  particleColor = '#ffffff',
  onParticleColorUpdate,
  minBrightness = 1.0,
  maxBrightness = 3.5,
  onBrightnessUpdate,
}: ParticlesControlsProps) => {
  const { isEditMode } = useEditMode();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const zoomLevels = [10, 15, 20, 25, 30, 35, 40, 50];
  const [currentZoomIndex, setCurrentZoomIndex] = useState(() => {
    const index = zoomLevels.findIndex(level => level === zoom);
    return index >= 0 ? index : Math.floor(zoomLevels.length / 2);
  });

  useEffect(() => {
    if (onZoomChange) {
      onZoomChange(zoom);
    }
  }, [zoom, onZoomChange]);

  useEffect(() => {
    if (onRotationChange) {
      onRotationChange(rotation);
    }
  }, [rotation, onRotationChange]);

  // Synchroniser l'index de zoom avec la valeur actuelle
  useEffect(() => {
    const index = zoomLevels.findIndex(level => level === zoom);
    if (index >= 0 && index !== currentZoomIndex) {
      setCurrentZoomIndex(index);
    }
  }, [zoom]);

  const handleZoomIn = () => {
    // Inversé : zoom in = reculer (augmenter la valeur Z)
    if (currentZoomIndex < zoomLevels.length - 1) {
      const newIndex = currentZoomIndex + 1;
      setCurrentZoomIndex(newIndex);
      onZoomUpdate(zoomLevels[newIndex]);
    }
  };

  const handleZoomOut = () => {
    // Inversé : zoom out = avancer (diminuer la valeur Z)
    if (currentZoomIndex > 0) {
      const newIndex = currentZoomIndex - 1;
      setCurrentZoomIndex(newIndex);
      onZoomUpdate(zoomLevels[newIndex]);
    }
  };

  const handleResetRotation = () => {
    onRotationUpdate({ x: 0, y: 0, z: 0 });
  };

  const handleResetZoom = () => {
    const defaultIndex = zoomLevels.findIndex(level => level === 25);
    const index = defaultIndex >= 0 ? defaultIndex : Math.floor(zoomLevels.length / 2);
    setCurrentZoomIndex(index);
    onZoomUpdate(zoomLevels[index]);
  };

  const handleStart = (clientX: number, clientY: number) => {
    if (!isEditMode) return;
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isEditMode || !isDragging) return;

    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;

    onRotationUpdate({
      x: rotation.x + deltaY * 0.5,
      y: rotation.y + deltaX * 0.5,
      z: rotation.z,
    });

    setDragStart({ x: clientX, y: clientY });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragStart]);

  if (!isEditMode) return null;

  return (
    <>
      {/* Zone de glisser-déposer invisible sur tout le canvas */}
      <div
        className={styles.dragZone}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
      />
      <div className={styles.controlsContainer}>
        <div className={styles.controlsPanel}>
        <div className={styles.header}>
          <h3 className={styles.title}>Contrôles des particules</h3>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.label}>Zoom caméra</label>
          <div className={styles.zoomControls}>
            <button
              onClick={handleZoomIn}
              disabled={currentZoomIndex === 0}
              className={styles.controlButton}
              aria-label="Zoom arrière"
            >
              <HiMagnifyingGlassMinus />
            </button>
            <span className={styles.zoomValue}>{zoom}</span>
            <button
              onClick={handleZoomOut}
              disabled={currentZoomIndex === zoomLevels.length - 1}
              className={styles.controlButton}
              aria-label="Zoom avant"
            >
              <HiMagnifyingGlassPlus />
            </button>
          </div>
          <div className={styles.zoomSlider}>
            <input
              type="range"
              min="0"
              max={zoomLevels.length - 1}
              value={zoomLevels.length - 1 - currentZoomIndex}
              onChange={(e) => {
                const invertedIndex = Number(e.target.value);
                const index = zoomLevels.length - 1 - invertedIndex;
                setCurrentZoomIndex(index);
                onZoomUpdate(zoomLevels[index]);
              }}
              className={styles.slider}
            />
          </div>
          <button
            onClick={handleResetZoom}
            className={styles.resetButton}
            aria-label="Réinitialiser le zoom"
          >
            Réinitialiser zoom
          </button>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.label}>Rotation</label>
          <div className={styles.rotationInfo}>
            <span>X: {Math.round(rotation.x)}°</span>
            <span>Y: {Math.round(rotation.y)}°</span>
            <span>Z: {Math.round(rotation.z)}°</span>
          </div>
          <button
            onClick={handleResetRotation}
            className={styles.resetButton}
            aria-label="Réinitialiser la rotation"
          >
            <HiArrowPath />
            Réinitialiser rotation
          </button>
        </div>

        {/* Contrôles des lumières */}
        {onLightIntensityUpdate && (
          <div className={styles.controlGroup}>
            <label className={styles.label}>Intensité lumière</label>
            <div className={styles.zoomSlider}>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={lightIntensity}
                onChange={(e) => onLightIntensityUpdate(Number(e.target.value))}
                className={styles.slider}
              />
            </div>
            <span className={styles.zoomValue}>{lightIntensity.toFixed(1)}</span>
          </div>
        )}

        {/* Contrôles de concentration de points */}
        {onParticleCountUpdate && (
          <div className={styles.controlGroup}>
            <label className={styles.label}>Concentration de points</label>
            <div className={styles.zoomSlider}>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={particleCount}
                onChange={(e) => onParticleCountUpdate(Number(e.target.value))}
                className={styles.slider}
              />
            </div>
            <span className={styles.zoomValue}>{particleCount}</span>
          </div>
        )}

        {/* Contrôles de couleur */}
        {onParticleColorUpdate && (
          <div className={styles.controlGroup}>
            <label className={styles.label}>Couleur des points</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="color"
                value={particleColor}
                onChange={(e) => onParticleColorUpdate(e.target.value)}
                style={{
                  width: '50px',
                  height: '36px',
                  border: '2px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              />
              <span className={styles.zoomValue}>{particleColor}</span>
            </div>
          </div>
        )}

        {/* Contrôles de brillance */}
        {onBrightnessUpdate && (
          <div className={styles.controlGroup}>
            <label className={styles.label}>Brillance min / max</label>
            <div className={styles.zoomSlider} style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(0, 0, 0, 0.6)', marginBottom: '4px' }}>Min: {minBrightness.toFixed(1)}</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={minBrightness}
                onChange={(e) => onBrightnessUpdate(Number(e.target.value), maxBrightness)}
                className={styles.slider}
              />
            </div>
            <div className={styles.zoomSlider}>
              <label style={{ fontSize: '11px', color: 'rgba(0, 0, 0, 0.6)', marginBottom: '4px' }}>Max: {maxBrightness.toFixed(1)}</label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={maxBrightness}
                onChange={(e) => onBrightnessUpdate(minBrightness, Number(e.target.value))}
                className={styles.slider}
              />
            </div>
          </div>
        )}

        <div className={styles.controlGroup}>
          <p className={styles.hint}>
            Faites glisser sur le canvas pour faire tourner les particules
          </p>
        </div>
        </div>
      </div>
    </>
  );
};

export default ParticlesControls;
