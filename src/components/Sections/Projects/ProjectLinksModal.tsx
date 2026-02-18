import { useEffect } from "react";
import styles from "./projects.module.scss";
import type { Project } from "./ProjectCategory";
import { useLanguage } from "../../General/Language/LanguageContext";

interface ProjectLinksModalProps {
  isOpen: boolean;
  project: Project;
  onClose: () => void;
}

const ProjectLinksModal = ({ isOpen, project, onClose }: ProjectLinksModalProps) => {
  const { language } = useLanguage();

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
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const projectTitle =
    language === "en" && project.titleEn ? project.titleEn : project.title;

  const links: { label: string; url: string }[] = [
    project.github ? { label: "GitHub", url: project.github } : null,
    project.demo ? { label: "Live Demo", url: project.demo } : null,
    project.figma ? { label: "Figma", url: project.figma } : null,
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={projectTitle}
      >
        <button
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>
        <h3 className={styles.modalTitle}>{projectTitle}</h3>
        <div className={styles.modalLinks}>
          {links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.modalLinkButton}
              onClick={onClose}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectLinksModal;
