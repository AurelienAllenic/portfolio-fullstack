import { useEffect, useRef } from "react";
import styles from "./modalCV.module.scss";

interface ModalCVProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalCV = ({ isOpen, onClose }: ModalCVProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const cvImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.setAttribute("data-modal-open", "true");
      
      const preventScroll = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
      window.addEventListener("scroll", preventScroll, { passive: false, capture: true });

      return () => {
        window.removeEventListener("wheel", handleWheel, true);
        window.removeEventListener("touchmove", handleTouchMove, true);
        window.removeEventListener("scroll", preventScroll, true);
        document.body.style.overflow = "";
        document.body.removeAttribute("data-modal-open");
      };
    } else {
      document.body.style.overflow = "";
      document.body.removeAttribute("data-modal-open");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCVClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const pdfUrl = "https://res.cloudinary.com/dwpbyyhoq/image/upload/CV_mwcaqj.pdf";
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={handleBackdropClick}
      ref={modalRef}
    >
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Fermer">
          ×
        </button>
        <div
          className={styles.cvContainer}
          ref={cvImageRef}
          onClick={handleCVClick}
        >
          <img
            src="https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/CV_ko43f7.webp"
            alt="CV"
            className={styles.cvImage}
          />
          <div className={styles.downloadButton}>
            Télécharger
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCV;

