import { useState, useEffect, useRef } from 'react';
import { useEditMode } from '../../../contexts/EditModeContext';
import { HiMagnifyingGlassPlus, HiMagnifyingGlassMinus, HiArrowPath, HiStar } from 'react-icons/hi2';
import styles from './particlesControls.module.scss';

interface ParticlesControlsProps {
  particlesGroupRef?: React.RefObject<any>;
  onZoomChange?: (zoom: number) => void;
  onRotationChange?: (rotation: { x: number; y: number; z: number }) => void;
  zoom: number;
  rotation: { x: number; y: number; z: number };
  onZoomUpdate: (zoom: number) => void;
  onRotationUpdate: (rotation: { x: number; y: number; z: number }) => void;
}

const ParticlesControls = ({
  onZoomChange,
  onRotationChange,
  zoom,
  rotation,
  onZoomUpdate,
  onRotationUpdate,
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
    if (currentZoomIndex < zoomLevels.length - 1) {
      const newIndex = currentZoomIndex + 1;
      setCurrentZoomIndex(newIndex);
      onZoomUpdate(zoomLevels[newIndex]);
    }
  };

  const handleZoomOut = () => {
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
          <HiStar className={styles.icon} />
          <h3 className={styles.title}>Contrôles des particules</h3>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.label}>Zoom caméra</label>
          <div className={styles.zoomControls}>
            <button
              onClick={handleZoomOut}
              disabled={currentZoomIndex === 0}
              className={styles.controlButton}
              aria-label="Zoom arrière"
            >
              <HiMagnifyingGlassMinus />
            </button>
            <span className={styles.zoomValue}>{zoom}</span>
            <button
              onClick={handleZoomIn}
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
              value={currentZoomIndex}
              onChange={(e) => {
                const index = Number(e.target.value);
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
