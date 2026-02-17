import { useState } from 'react';
import { useEditMode } from '../../../contexts/EditModeContext';
import { HiPencil } from 'react-icons/hi2';
import styles from './editModeButton.module.scss';

const EditModeButton = () => {
  const { isEditMode, toggleEditMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className={`${styles.editModeButton} ${isEditMode ? styles.active : ''}`}
      onClick={toggleEditMode}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={isEditMode ? "Désactiver le mode édition" : "Activer le mode édition"}
      title={isEditMode ? "Désactiver le mode édition" : "Activer le mode édition"}
    >
      <HiPencil className={styles.icon} />
      {isHovered && (
        <span className={styles.tooltip}>
          {isEditMode ? "Mode édition activé" : "Mode édition"}
        </span>
      )}
    </button>
  );
};

export default EditModeButton;
