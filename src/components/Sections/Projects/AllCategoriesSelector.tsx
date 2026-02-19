import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../General/Language/LanguageContext";
import BlurImage from "../../General/BlurImage";
import RadialTransitionOverlay from "../../General/Nav/RadialTransitionOverlay";
import { solead_cover, iim_cover, allProjectsImages } from "./Data";
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

const ALL_CATEGORIES = [
  {
    slug: "formations-openclassrooms",
    titleFr: "Openclassrooms",
    titleEn: "Openclassrooms",
    image: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/booki_c6gjvd.webp",
  },
  {
    slug: "mastere-iim",
    titleFr: "Mastère IIM",
    titleEn: "IIM Master's",
    image: iim_cover.mainImage,
  },
  {
    slug: "projets-solead",
    titleFr: "Solead",
    titleEn: "Solead",
    image: solead_cover.mainImage,
  },
] as const;

interface AllCategoriesSelectorProps {
  categoryIndex?: number;
}

const AllCategoriesSelector = ({ categoryIndex }: AllCategoriesSelectorProps) => {
  const { language, t } = useLanguage();
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pendingUrlRef = useRef<string | null>(null);
  const [currentBackgroundImageIndex, setCurrentBackgroundImageIndex] = useState(0);
  const [nextBackgroundImageIndex, setNextBackgroundImageIndex] = useState<number | null>(null);
  const [currentOpacity, setCurrentOpacity] = useState(1);
  const [nextOpacity, setNextOpacity] = useState(0);
  const [currentBrightness, setCurrentBrightness] = useState(0.5);
  const [nextBrightness, setNextBrightness] = useState(1);
  
  // Initialiser nextBackgroundImageIndex après le premier render
  useEffect(() => {
    if (allProjectsImages && allProjectsImages.length > 1 && nextBackgroundImageIndex === null) {
      setNextBackgroundImageIndex(1);
    }
  }, [allProjectsImages]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    if (categoryIndex !== undefined) {
      sessionStorage.setItem("lastProjectCategoryIndex", categoryIndex.toString());
      sessionStorage.setItem("shouldRestoreScroll", "true");
    }
    pendingUrlRef.current = `/projects/${slug}`;
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    if (pendingUrlRef.current) {
      window.location.href = pendingUrlRef.current;
    }
  };

  const title = t("projects.category.allprojects");

  const displayTitle = (cat: (typeof ALL_CATEGORIES)[number]) =>
    language === "en" ? cat.titleEn : cat.titleFr;

  // Rotation automatique des images en arrière-plan avec crossfade fluide
  useEffect(() => {
    if (!allProjectsImages || allProjectsImages.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      // Préparer la prochaine image
      const nextIndex = (currentBackgroundImageIndex + 1) % allProjectsImages.length;
      
      // Préparer l'image suivante avec opacity 0 et brightness 1 (pleine luminosité) avant de la rendre visible
      setNextBackgroundImageIndex(nextIndex);
      setNextOpacity(0);
      setNextBrightness(1); // Commencer avec pleine luminosité comme dans le diaporama
      
      // Attendre un frame pour que l'image soit chargée, puis commencer le crossfade
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Crossfade : fade in de la nouvelle image avec luminosité qui baisse progressivement
          // pendant que l'ancienne fade out
          setNextOpacity(1);
          setNextBrightness(0.5); // Réduire la luminosité progressivement
          setCurrentOpacity(0);
        });
      });
      
      // Après la transition, échanger les rôles de manière fluide
      setTimeout(() => {
        // Échanger les indices ET les opacités simultanément dans le même batch React
        // pour éviter le "pop"
        setCurrentBackgroundImageIndex(nextIndex);
        // On remet les opacités et luminosités à leur état initial pour la prochaine transition
        setCurrentOpacity(1);
        setCurrentBrightness(0.5);
        // On remet nextOpacity à 0 seulement après que React ait mis à jour les indices
        // pour éviter que l'ancienne image suivante ne "pop" avant de disparaître
        requestAnimationFrame(() => {
          setNextOpacity(0);
          setNextBrightness(1); // Réinitialiser pour la prochaine transition
        });
      }, 800); // Durée de la transition (correspond à la transition CSS)
    }, 3000); // Change d'image toutes les 3 secondes

    return () => clearInterval(interval);
  }, [currentBackgroundImageIndex, allProjectsImages]);

  const currentBackgroundImage = allProjectsImages && allProjectsImages.length > 0 
    ? allProjectsImages[currentBackgroundImageIndex] 
    : null;
  
  const nextBackgroundImage = allProjectsImages && allProjectsImages.length > 0 
    ? allProjectsImages[nextBackgroundImageIndex] 
    : null;

  return (
    <>
      <RadialTransitionOverlay
        isActive={isTransitioning}
        direction="in"
        onComplete={handleTransitionComplete}
      />
      <section className={`${styles.cover} ${styles.formationSelectorPage}`}>
        {/* Fond animé avec rotation des images - crossfade fluide avec animation de luminosité */}
        {currentBackgroundImage && (
          <div 
            className={styles.allProjectsBackgroundBlur}
            style={{
              backgroundImage: `url(${currentBackgroundImage})`,
              opacity: currentOpacity,
              filter: `blur(15px) brightness(${currentBrightness})`,
            }}
            aria-hidden="true"
          />
        )}
        {nextBackgroundImage && nextBackgroundImageIndex !== null && (
          <div 
            className={styles.allProjectsBackgroundBlur}
            style={{
              backgroundImage: `url(${nextBackgroundImage})`,
              opacity: nextOpacity,
              filter: `blur(15px) brightness(${nextBrightness})`,
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          />
        )}
        <div className={styles.formationSelectorInner}>
          <header className={styles.formationSelectorHeader}>
            <h2 className={styles.formationSelectorTitle}>{title}</h2>
            <div className={styles.formationSelectorDescription}>
              <p>{t("projects.category.allprojects.description")}</p>
            </div>
          </header>
          <div className={styles.formationSelectorGrid}>
            {ALL_CATEGORIES.map((cat) => {
              const href = `/projects/${cat.slug}`;
              return (
                <a
                  key={cat.slug}
                  href={href}
                  className={styles.formationCard}
                  onClick={(e) => handleClick(e, cat.slug)}
                >
                  <div className={styles.formationCardImage}>
                    <BlurImage
                      src={cat.image}
                      fullSrc={optimizeCloudinaryUrl(cat.image, isMobile ? 400 : 500, "80")}
                      alt={displayTitle(cat)}
                      loading="lazy"
                    />
                  </div>
                  <span className={styles.formationCardTitle}>{displayTitle(cat)}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default AllCategoriesSelector;
