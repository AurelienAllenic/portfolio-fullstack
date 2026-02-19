import { useState, useRef } from "react";
import { useLanguage } from "../../General/Language/LanguageContext";
import BlurImage from "../../General/BlurImage";
import RadialTransitionOverlay from "../../General/Nav/RadialTransitionOverlay";
import styles from "./projects.module.scss";

const optimizeCloudinaryUrl = (url: string, width?: number, quality: string = "auto"): string => {
  if (!url.includes("cloudinary.com")) return url;
  const parts = url.split("/image/upload/");
  if (parts.length !== 2) return url;
  const base = parts[0];
  const rest = parts[1];
  const lastSlash = rest.lastIndexOf("/");
  const publicId = lastSlash >= 0 ? rest.slice(lastSlash + 1) : rest;
  
  // Pour les GIFs, ne pas transformer en WebP pour préserver l'animation
  const isGif = publicId.toLowerCase().endsWith('.gif') || url.toLowerCase().includes('.gif');
  const format = isGif ? 'f_auto' : 'f_webp';
  
  let params = `${format},q_${quality}`;
  if (width) params += `,w_${width}`;
  return `${base}/image/upload/${params}/${publicId}`;
};

export interface FormationItem {
  slug: string;
  title: string;
  cover: { mainImage: string; sideImages?: string[] };
  projects: unknown[];
}

interface FormationSelectorProps {
  formations: readonly FormationItem[];
  categoryIndex?: number;
}

const FormationSelector = ({ formations, categoryIndex }: FormationSelectorProps) => {
  const { language, t } = useLanguage();
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pendingUrlRef = useRef<string | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    if (categoryIndex !== undefined) {
      sessionStorage.setItem("lastProjectCategoryIndex", categoryIndex.toString());
      sessionStorage.setItem("shouldRestoreScroll", "true");
    }
    pendingUrlRef.current = `/projects/formations-openclassrooms/${slug}`;
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    if (pendingUrlRef.current) {
      window.location.href = pendingUrlRef.current;
    }
  };

  const titleKey = "projects.category.openclassrooms";
  const title = t(titleKey);

  const displayTitleFor = (formation: FormationItem) =>
    language === "en"
      ? (formation.slug === "formation-web"
          ? "Web Developer Training"
          : formation.slug === "formation-react"
            ? "React Training"
            : formation.slug === "formation-python"
              ? "Python Training"
              : formation.title)
      : formation.title;

  return (
    <>
      <RadialTransitionOverlay
        isActive={isTransitioning}
        direction="in"
        onComplete={handleTransitionComplete}
      />
    <section className={`${styles.cover} ${styles.formationSelectorPage}`}>
      <div className={styles.formationSelectorInner}>
        <header className={styles.formationSelectorHeader}>
          <h2 className={styles.formationSelectorTitle}>{title}</h2>
          <div className={styles.formationSelectorDescription}>
            <p>{t("projects.category.openclassrooms.description")}</p>
          </div>
        </header>
        <div className={styles.formationSelectorGrid}>
          {formations.map((formation) => {
            const href = `/projects/formations-openclassrooms/${formation.slug}`;
            return (
              <a
                key={formation.slug}
                href={href}
                className={styles.formationCard}
                onClick={(e) => handleClick(e, formation.slug)}
              >
                <div className={styles.formationCardImage}>
                  <BlurImage
                    src={formation.cover.mainImage}
                    fullSrc={optimizeCloudinaryUrl(formation.cover.mainImage, isMobile ? 400 : 500, "80")}
                    alt={displayTitleFor(formation)}
                    loading="lazy"
                  />
                </div>
                <span className={styles.formationCardTitle}>{displayTitleFor(formation)}</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
    </>
  );
};

export default FormationSelector;
