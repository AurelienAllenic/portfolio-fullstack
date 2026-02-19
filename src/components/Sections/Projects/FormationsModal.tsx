import { useEffect, useState, useRef } from "react";
import styles from "./projects.module.scss";
import BlurImage from "../../General/BlurImage";
import RadialTransitionOverlay from "../../General/Nav/RadialTransitionOverlay";
import { useLanguage } from "../../General/Language/LanguageContext";
import { OPENCLASSROOMS_FORMATIONS } from "./Data";
import { useAnalytics } from "../../../hooks/useAnalytics";

interface FormationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryIndex?: number;
}

const optimizeCloudinaryUrl = (url: string, width?: number, quality: string = "auto"): string => {
  if (!url.includes("cloudinary.com")) return url;
  const parts = url.split("/image/upload/");
  if (parts.length !== 2) return url;
  const base = parts[0];
  const rest = parts[1];
  const lastSlash = rest.lastIndexOf("/");
  const publicId = lastSlash >= 0 ? rest.slice(lastSlash + 1) : rest;
  
  const isGif = publicId.toLowerCase().endsWith('.gif') || url.toLowerCase().includes('.gif');
  const format = isGif ? 'f_auto' : 'f_webp';
  
  let params = `${format},q_${quality}`;
  if (width) params += `,w_${width}`;
  return `${base}/image/upload/${params}/${publicId}`;
};

const FormationsModal = ({ isOpen, onClose, categoryIndex }: FormationsModalProps) => {
  const { language } = useLanguage();
  const { trackClick } = useAnalytics();
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pendingUrlRef = useRef<string | null>(null);

  // Tracking de l'ouverture de la modale
  useEffect(() => {
    if (isOpen) {
      trackClick('modal_formations_openclassrooms_ouvrir');
    }
  }, [isOpen, trackClick]);

  useEffect(() => {
    if (isOpen) {
      document.body.setAttribute("data-modal-open", "true");
    } else {
      document.body.removeAttribute("data-modal-open");
    }
    return () => {
      document.body.removeAttribute("data-modal-open");
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        trackClick('modal_formations_openclassrooms_fermer');
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, trackClick]);

  const handleTransitionComplete = () => {
    if (pendingUrlRef.current) {
      window.location.href = pendingUrlRef.current;
    }
  };

  const handleFormationClick = (slug: string) => {
    trackClick(`modal_formations_openclassrooms_${slug}`);
    if (categoryIndex !== undefined) {
      sessionStorage.setItem("lastProjectCategoryIndex", categoryIndex.toString());
      sessionStorage.setItem("shouldRestoreScroll", "true");
    }
    pendingUrlRef.current = `/projects/formations-openclassrooms/${slug}`;
    setIsTransitioning(true); // Déclencher la transition sans fermer la modale
  };

  if (!isOpen) return null;

  type FormationType = typeof OPENCLASSROOMS_FORMATIONS[number];
  
  const displayTitleFor = (formation: FormationType): string => {
    if (language === "en") {
      if (formation.slug === "formation-web") return "Web Developer Training";
      if (formation.slug === "formation-react") return "React Training";
      if (formation.slug === "formation-python") return "Python Training";
    }
    return formation.title;
  };

  return (
    <>
      <RadialTransitionOverlay
        isActive={isTransitioning}
        direction="in"
        onComplete={handleTransitionComplete}
      />
      <div className={styles.modalOverlay} onClick={() => {
        trackClick('modal_formations_openclassrooms_fermer');
        onClose();
      }}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Choisir une formation OpenClassrooms"
        >
          <button
            className={styles.modalClose}
            onClick={() => {
              trackClick('modal_formations_openclassrooms_fermer');
              onClose();
            }}
            aria-label="Fermer"
          >
            ×
          </button>
          <h3 className={styles.modalTitle}>
            {language === "en" ? "Choose a Training" : "Choisir une formation"}
          </h3>
          <div className={styles.formationsModalGrid}>
            {OPENCLASSROOMS_FORMATIONS.map((formation) => (
              <button
                key={formation.slug}
                className={styles.formationModalCard}
                onClick={() => handleFormationClick(formation.slug)}
              >
                <div className={styles.formationModalCardImage}>
                  <BlurImage
                    src={formation.cover.mainImage}
                    fullSrc={optimizeCloudinaryUrl(formation.cover.mainImage, isMobile ? 300 : 400, "80")}
                    alt={displayTitleFor(formation)}
                    loading="lazy"
                  />
                </div>
                <span className={styles.formationModalCardTitle}>
                  {displayTitleFor(formation)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FormationsModal;
