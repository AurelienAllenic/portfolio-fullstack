import { useState, useRef } from "react";
import { useLanguage } from "../../General/Language/LanguageContext";
import BlurImage from "../../General/BlurImage";
import RadialTransitionOverlay from "../../General/Nav/RadialTransitionOverlay";
import { solead_cover, iim_cover } from "./Data";
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
