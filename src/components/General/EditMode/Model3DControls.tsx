import { useState, useEffect } from 'react';
import { useEditMode } from '../../../contexts/EditModeContext';
import { HiMagnifyingGlassPlus, HiMagnifyingGlassMinus, HiArrowPath } from 'react-icons/hi2';
import styles from './model3DControls.module.scss';

interface Model3DControlsProps {
  zoomLevels?: number[];
  initialZoom?: number;
  initialRotation?: { x: number; y: number; z: number };
  onZoomChange?: (zoom: number) => void;
  onRotationChange?: (rotation: { x: number; y: number; z: number }) => void;
  modelRef?: React.RefObject<HTMLElement>;
}

const Model3DControls = ({
  zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2],
  initialZoom = 1,
  initialRotation = { x: 0, y: 0, z: 0 },
  onZoomChange,
  onRotationChange,
  modelRef,
}: Model3DControlsProps) => {
  const { isEditMode } = useEditMode();
  const [currentZoomIndex, setCurrentZoomIndex] = useState(() => {
    const index = zoomLevels.findIndex(level => level === initialZoom);
    return index >= 0 ? index : Math.floor(zoomLevels.length / 2);
  });
  const [rotation, setRotation] = useState(initialRotation);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const currentZoom = zoomLevels[currentZoomIndex];

  useEffect(() => {
    if (onZoomChange) {
      onZoomChange(currentZoom);
    }
  }, [currentZoom, onZoomChange]);

  useEffect(() => {
    if (onRotationChange) {
      onRotationChange(rotation);
    }
  }, [rotation, onRotationChange]);

  useEffect(() => {
    if (!isEditMode || !modelRef?.current) return;

    const element = modelRef.current;
    const applyTransform = () => {
      element.style.transform = `scale(${currentZoom}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`;
    };

    applyTransform();
  }, [isEditMode, currentZoom, rotation, modelRef]);

  const handleZoomIn = () => {
    if (currentZoomIndex < zoomLevels.length - 1) {
      setCurrentZoomIndex(prev => prev + 1);
    }
  };

  const handleZoomOut = () => {
    if (currentZoomIndex > 0) {
      setCurrentZoomIndex(prev => prev - 1);
    }
  };

  const handleResetRotation = () => {
    setRotation({ x: 0, y: 0, z: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isEditMode || !isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setRotation(prev => ({
      x: prev.x + deltaY * 0.5,
      y: prev.y + deltaX * 0.5,
      z: prev.z,
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  if (!isEditMode) return null;

  return (
    <div className={styles.controlsContainer}>
      <div className={styles.controlsPanel}>
        <div className={styles.controlGroup}>
          <label className={styles.label}>Zoom</label>
          <div className={styles.zoomControls}>
            <button
              onClick={handleZoomOut}
              disabled={currentZoomIndex === 0}
              className={styles.controlButton}
              aria-label="Zoom arrière"
            >
              <HiMagnifyingGlassMinus />
            </button>
            <span className={styles.zoomValue}>{Math.round(currentZoom * 100)}%</span>
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
              onChange={(e) => setCurrentZoomIndex(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
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
            Réinitialiser
          </button>
        </div>

        <div className={styles.controlGroup}>
          <p className={styles.hint}>
            Faites glisser sur le modèle pour le faire tourner
          </p>
        </div>
      </div>

      {modelRef?.current && (
        <div
          className={styles.modelWrapper}
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {/* Le modèle sera rendu ici via le ref */}
        </div>
      )}
    </div>
  );
};

export default Model3DControls;
