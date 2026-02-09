import { useEffect, useRef, useMemo } from "react";
import styles from "./modalCV.module.scss";
import { useLanguage } from "../Language/LanguageContext";
import { useCv } from "./CvContext";
import { useAnalytics } from "../../../hooks/useAnalytics";

interface ModalCVProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalCV = ({ isOpen, onClose }: ModalCVProps) => {
  const { language } = useLanguage();
  const { getCvImageUrl, getCvPdfUrl } = useCv();
  const modalRef = useRef<HTMLDivElement>(null);
  const cvImageRef = useRef<HTMLDivElement>(null);

  const { trackClick } = useAnalytics();
  
  // URLs du CV selon la langue depuis le backend
  const { cvImageUrl, cvPdfUrl } = useMemo(() => {
    const imageUrl = getCvImageUrl(language);
    const pdfUrl = getCvPdfUrl(language);
    
    // Fallback vers les URLs par défaut si le backend ne retourne pas de données
    if (!imageUrl || !pdfUrl) {
      if (language === "fr") {
        return {
          cvImageUrl: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/CV_ko43f7.webp",
          cvPdfUrl: "https://res.cloudinary.com/dwpbyyhoq/image/upload/CV_mwcaqj.pdf"
        };
      } else {
        return {
          cvImageUrl: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/resume_o3byqk.webp",
          cvPdfUrl: "https://res.cloudinary.com/dwpbyyhoq/image/upload/resume_fcuwmh.pdf"
        };
      }
    }
    
    return {
      cvImageUrl: imageUrl,
      cvPdfUrl: pdfUrl,
    };
  }, [language, getCvImageUrl, getCvPdfUrl]);

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
    trackClick('modal_cv_download')
    window.open(cvPdfUrl, '_blank', 'noopener,noreferrer');
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
            key={language}
            src={cvImageUrl}
            alt="CV"
            className={styles.cvImage}
          />
          <div className={styles.downloadButton}>
            {language === "fr" ? "Télécharger" : "Download"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCV;

