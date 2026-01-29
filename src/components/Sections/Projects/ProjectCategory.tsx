import { useEffect, useRef, useLayoutEffect, useState, useMemo } from "react";
import { gsap } from "gsap";
import styles from "./projects.module.scss";
import RadialTransitionOverlay from "../../General/Nav/RadialTransitionOverlay";
import BlurImage from "../../General/BlurImage";
import { HiArrowRight } from "react-icons/hi2";
import { useLanguage } from "../../General/Language/LanguageContext";

// Optimiser les URLs Cloudinary (extrait le public_id pour éviter de dupliquer les paramètres)
const optimizeCloudinaryUrl = (url: string, width?: number, quality: string = "auto"): string => {
  if (!url.includes("cloudinary.com")) return url;
  const parts = url.split("/image/upload/");
  if (parts.length !== 2) return url;
  const base = parts[0];
  const rest = parts[1];
  const lastSlash = rest.lastIndexOf("/");
  const publicId = lastSlash >= 0 ? rest.slice(lastSlash + 1) : rest;
  let params = `f_webp,q_${quality}`;
  if (width) params += `,w_${width}`;
  return `${base}/image/upload/${params}/${publicId}`;
};

// Précharger une image
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
};

type CoverIcon = string | { src: string; alt?: string };

export interface ProjectCover {
  title: string;
  slug: string;
  content: string;
  sideImages: string[];
  mainImage: string;
  listIcons: CoverIcon[];
}

export interface ProjectFolderItem {
  id: number;
  title: string;
  titleEn: string;
  link: string;
}

export interface Project {
  id: number;
  image?: string; // Image unique (optionnel si imageDiaporama ou images est fourni)
  imageDiaporama?: string[]; // Tableau d'images pour le diaporama (prioritaire)
  images?: string[]; // Tableau d'images pour le diaporama (alternative)
  title: string;
  description: string;
  titleEn: string;
  descriptionEn: string;
  github: string;
  demo: string;
  figma: string;
  folder: string | ProjectFolderItem[];
  technologies: string[];
}

interface ProjectCategoryProps {
  cover: ProjectCover;
  projects?: Project[];
  categoryIndex?: number;
}

const isUrl = (v: string) => /^https?:\/\//i.test(v);

const getTechName = (url: string): string => {
  const match = url.match(/\/([^/]+)_[^_]+\.webp$/);
  if (match) {
    const name = match[1];
    if (name === 'nodejs') return 'Node.js';
    if (name === 'reactjs') return 'React';
    if (name === 'nextjs') return 'Next.js';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return 'Technologie';
};

// Extraire le slug du langage depuis l'URL de l'icône (pour la route)
const getTechSlug = (url: string): string => {
  // Extraire le nom de fichier depuis l'URL Cloudinary
  const match = url.match(/\/([^/]+)_[^_]+\.webp$/);
  if (match) {
    let name = match[1];
    // Enlever les suffixes comme "-icon"
    name = name.replace(/-icon$/, '');
    
    // Normaliser les noms pour correspondre aux technologies dans les projets
    if (name === 'nodejs' || name === 'node') return 'nodejs';
    if (name === 'reactjs' || name === 'react') return 'reactjs';
    if (name === 'nextjs' || name === 'next') return 'nextjs';
    if (name === 'wordpress') return 'wordpress';
    if (name === 'php') return 'php';
    if (name === 'javascript' || name === 'js') return 'javascript';
    if (name === 'jquery') return 'jquery';
    if (name === 'html') return 'html';
    if (name === 'css') return 'css';
    if (name === 'scss') return 'scss';
    if (name === 'python') return 'python';
    if (name === 'django') return 'django';
    return name.toLowerCase();
  }
  return '';
};

const ProjectCategory = ({ cover, projects, categoryIndex }: ProjectCategoryProps) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pendingUrlRef = useRef<string | null>(null);

  // Fonction pour trouver l'index du projet correspondant à une image
  const findProjectIndexByImage = (imageUrl: string): number | null => {
    if (!projects || projects.length === 0) return null;
    
    // Extraire le nom de fichier de base (sans transformations Cloudinary)
    const extractBaseFilename = (url: string): string => {
      // Extraire la partie après "/image/upload/"
      const uploadMatch = url.match(/\/image\/upload\/[^/]+\/(.+)$/);
      if (uploadMatch) {
        return uploadMatch[1].split('?')[0];
      }
      // Fallback: prendre la dernière partie de l'URL
      const parts = url.split('/');
      return parts[parts.length - 1].split('?')[0];
    };
    
    const baseFilename = extractBaseFilename(imageUrl);
    
    // Chercher dans les projets
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      
      // Vérifier l'image principale
      if (project.image) {
        const projectBaseFilename = extractBaseFilename(project.image);
        if (projectBaseFilename === baseFilename) {
          return i;
        }
      }
      
      // Vérifier les images du diaporama
      if (project.imageDiaporama && project.imageDiaporama.length > 0) {
        for (const diapoImage of project.imageDiaporama) {
          const diapoBaseFilename = extractBaseFilename(diapoImage);
          if (diapoBaseFilename === baseFilename) {
            return i;
          }
        }
      }
      
      // Vérifier le tableau images
      if (project.images && project.images.length > 0) {
        for (const img of project.images) {
          const imgBaseFilename = extractBaseFilename(img);
          if (imgBaseFilename === baseFilename) {
            return i;
          }
        }
      }
    }
    
    return null;
  };
  
  // Détecter si on est en mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Mapping des slugs vers les clés de traduction
  const categoryKeyMap: Record<string, string> = {
    'formation-web': 'web',
    'formation-react': 'react',
    'formation-python': 'python',
    'projets-personnels': 'personnel',
    'projets-solead': 'solead',
    'mastere-iim': 'iim',
  };
  
  const categoryKey = categoryKeyMap[cover.slug] || 'web';
  const categoryTitle = useMemo(() => t(`projects.category.${categoryKey}`), [t, categoryKey]);
  const categoryDescription = useMemo(() => t(`projects.category.${categoryKey}.description`), [t, categoryKey]);
  
  // Séparer le titre en deux parties (premier mot et le reste)
  const titleParts = useMemo(() => {
    const parts = categoryTitle.split(" ");
    return {
      main: parts[0] || "WEB",
      accent: parts.slice(1).join(" ") || "WEB"
    };
  }, [categoryTitle]);

  // Précharger seulement les images critiques au montage
  useEffect(() => {
    const preloadImages = async () => {
      try {
        const mainImageWidth = isMobile ? 600 : 800;
        
        // Précharger seulement l'image principale
        await preloadImage(optimizeCloudinaryUrl(cover.mainImage, mainImageWidth, "85"));
        
        // Précharger seulement les 2 premières images du mosaic avec délai
        setTimeout(() => {
          cover.sideImages.slice(0, 2).forEach(src => {
            const mosaicWidth = isMobile ? 400 : 600;
            preloadImage(optimizeCloudinaryUrl(src, mosaicWidth, "80"));
          });
        }, 300);
      } catch (err) {
        console.warn("Erreur au préchargement des images:", err);
      }
    };
    
    preloadImages();
  }, [cover]);

  const handleViewProjectsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Sauvegarder l'index de la catégorie et l'URL
    if (categoryIndex !== undefined) {
      sessionStorage.setItem('lastProjectCategoryIndex', categoryIndex.toString());
      sessionStorage.setItem('shouldRestoreScroll', 'true');
      pendingUrlRef.current = e.currentTarget.href;
      
      // Déclencher l'animation
      setIsTransitioning(true);
    }
  };

  const handleProjectImageClick = (e: React.MouseEvent<HTMLAnchorElement>, projectIndex: number) => {
    e.preventDefault();
    
    // Sauvegarder l'index de la catégorie et l'URL avec l'index du projet
    if (categoryIndex !== undefined) {
      sessionStorage.setItem('lastProjectCategoryIndex', categoryIndex.toString());
      sessionStorage.setItem('shouldRestoreScroll', 'true');
      const projectUrl = `/projects/${cover.slug}?project=${projectIndex}`;
      pendingUrlRef.current = projectUrl;
      
      // Déclencher l'animation
      setIsTransitioning(true);
    }
  };

  const handleTechIconClick = (e: React.MouseEvent<HTMLAnchorElement>, techUrl: string) => {
    e.preventDefault();
    
    // Sauvegarder l'index de la catégorie
    if (categoryIndex !== undefined) {
      sessionStorage.setItem('lastProjectCategoryIndex', categoryIndex.toString());
      sessionStorage.setItem('shouldRestoreScroll', 'true');
      const techSlug = getTechSlug(techUrl);
      const techUrl_path = `/projects/${cover.slug}/${techSlug}`;
      pendingUrlRef.current = techUrl_path;
      
      // Déclencher l'animation
      setIsTransitioning(true);
    }
  };

  const handleTransitionComplete = () => {
    // Naviguer après l'animation
    if (pendingUrlRef.current) {
      window.location.href = pendingUrlRef.current;
    }
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mosaicItems = container.querySelectorAll(`.${styles.mosaicItem}`);
    const ctaButton = container.querySelector(`.${styles.cta}`);
    const titleMain = container.querySelector(`.${styles.titleMain}`);
    const titleAccent = container.querySelector(`.${styles.titleAccent}`);
    const contentBox = container.querySelector(`.${styles.contentBox}`);
    const icons = container.querySelectorAll(`.${styles.iconContainer}`);
    const rightImage = container.querySelector(`.${styles.right} img`);

    gsap.set(mosaicItems, { opacity: 0 });
    gsap.set(ctaButton, { opacity: 0, y: 30 });
    gsap.set([titleMain, titleAccent], { opacity: 0, y: -30 });
    gsap.set(contentBox, { opacity: 0 });
    gsap.set(icons, { opacity: 0 });
    gsap.set(rightImage, { opacity: 0, x: 50 });

    const mobileTitleMain = container.querySelector(`.${styles.mobileTitleMain}`);
    const mobileTitleAccent = container.querySelector(`.${styles.mobileTitleAccent}`);
    const mobileDescription = container.querySelector(`.${styles.mobileDescription}`);
    const mobileImage = container.querySelector(`.${styles.mobileImage}`);
    const mobileIcons = container.querySelectorAll(`.${styles.mobileIcons} .${styles.iconContainer}`);
    const mobileImageLeft = container.querySelector(`.${styles.mobileImageLeft}`);
    const mobileImageRight = container.querySelector(`.${styles.mobileImageRight}`);
    const mobileCta = container.querySelector(`.${styles.mobileCta}`);

    if (mobileTitleMain && mobileTitleAccent) gsap.set([mobileTitleMain, mobileTitleAccent], { opacity: 0, y: -30 });
    if (mobileDescription) gsap.set(mobileDescription, { opacity: 0 });
    if (mobileImage) gsap.set(mobileImage, { opacity: 0, scale: 0.8 });
    if (mobileIcons.length > 0) gsap.set(mobileIcons, { opacity: 0 });
    if (mobileImageLeft) gsap.set(mobileImageLeft, { opacity: 0, x: -30 });
    if (mobileImageRight) gsap.set(mobileImageRight, { opacity: 0, x: 30 });
    if (mobileCta) gsap.set(mobileCta, { opacity: 0, y: 30 });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (categoryIndex === undefined) {
      return;
    }

    const mosaicItems = container.querySelectorAll(`.${styles.mosaicItem}`);
    const ctaButton = container.querySelector(`.${styles.cta}`);
    const titleMain = container.querySelector(`.${styles.titleMain}`);
    const titleAccent = container.querySelector(`.${styles.titleAccent}`);
    const contentBox = container.querySelector(`.${styles.contentBox}`);
    const icons = container.querySelectorAll(`.${styles.iconContainer}`);
    const rightImage = container.querySelector(`.${styles.right} img`);

    gsap.set(mosaicItems, { opacity: 0 });
    gsap.set(ctaButton, { opacity: 0, y: 30 });
    gsap.set([titleMain, titleAccent], { opacity: 0, y: -30 });
    gsap.set(contentBox, { opacity: 0 });
    gsap.set(icons, { opacity: 0 });
    gsap.set(rightImage, { opacity: 0, x: 50 });

    const mobileTitleMain = container.querySelector(`.${styles.mobileTitleMain}`);
    const mobileTitleAccent = container.querySelector(`.${styles.mobileTitleAccent}`);
    const mobileDescription = container.querySelector(`.${styles.mobileDescription}`);
    const mobileImage = container.querySelector(`.${styles.mobileImage}`);
    const mobileIcons = container.querySelectorAll(`.${styles.mobileIcons} .${styles.iconContainer}`);
    const mobileImageLeft = container.querySelector(`.${styles.mobileImageLeft}`);
    const mobileImageRight = container.querySelector(`.${styles.mobileImageRight}`);
    const mobileCta = container.querySelector(`.${styles.mobileCta}`);

    if (mobileTitleMain && mobileTitleAccent) gsap.set([mobileTitleMain, mobileTitleAccent], { opacity: 0, y: -30 });
    if (mobileDescription) gsap.set(mobileDescription, { opacity: 0 });
    if (mobileImage) gsap.set(mobileImage, { opacity: 0, scale: 0.8 });
    if (mobileIcons.length > 0) gsap.set(mobileIcons, { opacity: 0 });
    if (mobileImageLeft) gsap.set(mobileImageLeft, { opacity: 0, x: -30 });
    if (mobileImageRight) gsap.set(mobileImageRight, { opacity: 0, x: 30 });
    if (mobileCta) gsap.set(mobileCta, { opacity: 0, y: 30 });

    const parentElement = container.parentElement;
    if (parentElement && getComputedStyle(parentElement).opacity === "0") {
      const checkVisibility = setInterval(() => {
        if (getComputedStyle(parentElement).opacity !== "0") {
          clearInterval(checkVisibility);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              runAnimation();
            });
          });
        }
      }, 50);
      return () => clearInterval(checkVisibility);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        runAnimation();
      });
    });

    function runAnimation() {
      if (!container) return;

      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      const mosaicItems = container.querySelectorAll(`.${styles.mosaicItem}`);
      const ctaButton = container.querySelector(`.${styles.cta}`);
      const titleMain = container.querySelector(`.${styles.titleMain}`);
      const titleAccent = container.querySelector(`.${styles.titleAccent}`);
      const contentBox = container.querySelector(`.${styles.contentBox}`);
      const icons = container.querySelectorAll(`.${styles.iconContainer}`);
      const rightImage = container.querySelector(`.${styles.right} img`);

      const mobileTitleMain = container.querySelector(`.${styles.mobileTitleMain}`);
      const mobileTitleAccent = container.querySelector(`.${styles.mobileTitleAccent}`);
      const mobileDescription = container.querySelector(`.${styles.mobileDescription}`);
      const mobileImage = container.querySelector(`.${styles.mobileImage}`);
      const mobileIcons = container.querySelectorAll(`.${styles.mobileIcons} .${styles.iconContainer}`);
      const mobileImageLeft = container.querySelector(`.${styles.mobileImageLeft}`);
      const mobileImageRight = container.querySelector(`.${styles.mobileImageRight}`);
      const mobileCta = container.querySelector(`.${styles.mobileCta}`);

      // Sur mobile les .mosaicItem sont en display:none mais toujours dans le DOM (4 éléments).
      // Si jamais on a 0 ou peu d'items, on lance quand même l'animation pour le reste (images droite, mobile, etc.)
      const mosaicArray = Array.from(mosaicItems);
      const hasEnoughMosaic = mosaicArray.length >= 2;

      if (mosaicArray.length === 0) {
        setTimeout(() => runAnimation(), 50);
        return;
      }

      if (!hasEnoughMosaic && mosaicArray.length === 1) {
        setTimeout(() => runAnimation(), 100);
        return;
      }
      
      const allConnected = mosaicArray.every((item) => item.isConnected);
      if (!allConnected) {
        setTimeout(() => runAnimation(), 100);
        return;
      }

      mosaicArray.forEach((item) => {
        gsap.set(item, { opacity: 0 });
      });

      const tl = gsap.timeline({ 
        defaults: { ease: "power2.out" },
        onComplete: () => {
          if (mosaicArray.length >= 2) {
            const image1 = mosaicArray[0];
            const image2 = mosaicArray[1];
            
            if (image1 && image1.isConnected) {
              const opacity1 = parseFloat(getComputedStyle(image1).opacity);
              if (opacity1 < 0.9) {
                gsap.to(image1, {
                  opacity: 1,
                  duration: 0.3,
                  ease: "power2.out",
                });
              }
            }
            
            if (image2 && image2.isConnected) {
              const opacity2 = parseFloat(getComputedStyle(image2).opacity);
              if (opacity2 < 0.9) {
                gsap.to(image2, {
                  opacity: 1,
                  duration: 0.3,
                  ease: "power2.out",
                });
              }
            }
          }
        }
      });
      timelineRef.current = tl;

      if (mosaicArray.length >= 2) {
        const image1 = mosaicArray[0];
        const image2 = mosaicArray[1];
        
        if (image1 && image1.isConnected) {
          tl.to(image1, {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            force3D: true,
          }, 0);
        }
        
        if (image2 && image2.isConnected) {
          tl.to(image2, {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            force3D: true,
          }, 0.08);
        }
      }
      
      mosaicArray.forEach((item, index) => {
        if (index === 0 || index === 1) return;
        
        if (item && item.isConnected) {
          tl.to(item, {
            opacity: 1,
            duration: 0.35,
            ease: "power2.out",
          }, index * 0.08);
        } else {
          setTimeout(() => {
            if (item && item.isConnected) {
              gsap.to(item, {
                opacity: 1,
                duration: 0.35,
                ease: "power2.out",
              });
            }
          }, (index * 0.08 * 1000) + 100);
        }
      });
      
      if (mosaicArray.length >= 2) {
        setTimeout(() => {
          const image1 = mosaicArray[0];
          const image2 = mosaicArray[1];
          
          if (image1 && image1.isConnected) {
            const opacity1 = parseFloat(getComputedStyle(image1).opacity);
            if (opacity1 < 0.9) {
              gsap.set(image1, { opacity: 1 });
            }
          }
          
          if (image2 && image2.isConnected) {
            const opacity2 = parseFloat(getComputedStyle(image2).opacity);
            if (opacity2 < 0.9) {
              gsap.set(image2, { opacity: 1 });
            }
          }
        }, 500);
      }

      tl.to(ctaButton, {
        opacity: 1,
        y: 0,
        duration: 0.4,
      }, 0.3);

      tl.to([titleMain, titleAccent], {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.05,
      }, 0.4);

      tl.to(contentBox, {
        opacity: 1,
        duration: 0.4,
      }, 0.5);

      tl.to(icons, {
        opacity: 1,
        duration: 0.4,
        stagger: 0.05,
      }, 0.6);

      tl.to(rightImage, {
        opacity: 1,
        x: 0,
        duration: 0.5,
      }, 0.2);

      if (mobileTitleMain && mobileTitleAccent) {
        tl.to([mobileTitleMain, mobileTitleAccent], {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
        }, 0.2);
      }

      if (mobileImage) {
        tl.to(mobileImage, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
        }, 0.3);
      }

      if (mobileDescription) {
        tl.to(mobileDescription, {
          opacity: 1,
          duration: 0.4,
        }, 0.4);
      }

      if (mobileImageLeft) {
        tl.to(mobileImageLeft, {
          opacity: 1,
          x: 0,
          duration: 0.4,
        }, 0.5);
      }

      if (mobileImageRight) {
        tl.to(mobileImageRight, {
          opacity: 1,
          x: 0,
          duration: 0.4,
        }, 0.5);
      }

      if (mobileIcons.length > 0) {
        tl.to(mobileIcons, {
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
        }, 0.6);
      }

      if (mobileCta) {
        tl.to(mobileCta, {
          opacity: 1,
          y: 0,
          duration: 0.4,
        }, 0.7);
      }
    }

    // Fallback : forcer l'affichage des images (mosaic + cover) après 0,8 s si l'animation n'a pas suffi
    const fallbackTimer = setTimeout(() => {
      const el = containerRef.current;
      if (!el) return;
      const mosaicItems = el.querySelectorAll(`.${styles.mosaicItem}`);
      const mosaicImgs = el.querySelectorAll(`.${styles.mosaicItem} img`);
      const rightImg = el.querySelector(`.${styles.right} img`);
      const mobileImg = el.querySelector(`.${styles.mobileImage}`);
      const mobileLeft = el.querySelector(`.${styles.mobileImageLeft}`);
      const mobileRight = el.querySelector(`.${styles.mobileImageRight}`);
      const toShow = [
        ...mosaicItems,
        ...mosaicImgs,
        ...(rightImg ? [rightImg] : []),
        ...(mobileImg ? [mobileImg] : []),
        ...(mobileLeft ? [mobileLeft] : []),
        ...(mobileRight ? [mobileRight] : []),
      ];
      toShow.forEach((node) => {
        if (node && parseFloat(getComputedStyle(node as Element).opacity) < 0.95) {
          gsap.set(node, { opacity: 1, x: 0, y: 0, scale: 1 });
        }
      });
    }, 800);
    return () => clearTimeout(fallbackTimer);
  }, [categoryIndex]);

  return (
    <>
      <RadialTransitionOverlay
        isActive={isTransitioning}
        direction="in"
        onComplete={handleTransitionComplete}
      />
      <section ref={containerRef} className={styles.cover}>
      <div className={styles.coverInner}>
        {/* Mobile: Ligne 1 - Titre + Image */}
        <div className={styles.mobileHeaderRow}>
          <div className={styles.mobileTitle}>
            <h2 className={styles.mobileTitleMain}>
              {titleParts.main}
            </h2>
            <h3 className={styles.mobileTitleAccent}>
              {titleParts.accent}
            </h3>
          </div>
          {(() => {
            const projectIndex = findProjectIndexByImage(cover.mainImage);
            const mainImgSrc = optimizeCloudinaryUrl(cover.mainImage, isMobile ? 600 : 800, "85");
            const content = <BlurImage src={cover.mainImage} fullSrc={mainImgSrc} alt="main" className={styles.mobileImage} loading="eager" />;
            return projectIndex !== null ? (
              <a
                href={`/projects/${cover.slug}?project=${projectIndex}`}
                onClick={(e) => handleProjectImageClick(e, projectIndex)}
                style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
              >
                {content}
              </a>
            ) : (
              content
            );
          })()}
        </div>

        <div className={styles.mobileDescription}>
          {categoryDescription.split(". ").map((line, i, arr) => (
            <p key={i}>
              {line.trim()}
              {i < arr.length - 1 ? "." : ""}
            </p>
          ))}
        </div>

        <aside className={styles.left}>
        <div className={styles.mosaic}>
          {cover.sideImages.slice(0, 4).map((src, i) => {
            const projectIndex = findProjectIndexByImage(src);
            const projectUrl = projectIndex !== null ? `/projects/${cover.slug}?project=${projectIndex}` : null;
            
            return (
              <div key={i} className={styles.mosaicItem}>
                {projectUrl ? (
                  <a 
                    href={projectUrl}
                    onClick={(e) => projectIndex !== null && handleProjectImageClick(e, projectIndex)}
                    style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
                  >
                    <BlurImage 
                      src={src} 
                      fullSrc={optimizeCloudinaryUrl(src, isMobile ? 400 : 600, "80")} 
                      alt={`side-${i + 1}`}
                      loading={i < 2 ? "eager" : "lazy"}
                    />
                  </a>
                ) : (
                  <BlurImage 
                    src={src} 
                    fullSrc={optimizeCloudinaryUrl(src, isMobile ? 400 : 600, "80")} 
                    alt={`side-${i + 1}`}
                    loading={i < 2 ? "eager" : "lazy"}
                  />
                )}
              </div>
            );
          })}
        </div>

        <a 
          href={`/projects/${cover.slug}`} 
          className={styles.cta}
          onClick={handleViewProjectsClick}
        >
          <span className={styles.arrow} aria-hidden><HiArrowRight /></span>
          <span>{t("projects.view")}</span>
        </a>
      </aside>

      <div className={styles.center}>
        <h2 className={styles.title}>
          <span className={styles.titleMain}>
            {titleParts.main}
          </span>
          <span className={styles.titleAccent}>
            {titleParts.accent}
          </span>
        </h2>

        <div className={styles.contentBox}>
          {categoryDescription.split(". ").map((line, i, arr) => (
            <p key={i}>
              {line.trim()}
              {i < arr.length - 1 ? "." : ""}
            </p>
          ))}
        </div>

        <div className={styles.icons}>
          {cover.listIcons.map((it, i) => {
            if (typeof it === "string") {
              const techSlug = isUrl(it) ? getTechSlug(it) : null;
              const techUrl = techSlug ? `/projects/${cover.slug}/${techSlug}` : null;
              
              return (
                <div key={i} className={styles.iconContainer}>
                  {isUrl(it) ? (
                    techUrl ? (
                      <a
                        href={techUrl}
                        onClick={(e) => handleTechIconClick(e, it)}
                        style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
                      >
                        <img src={it} alt={getTechName(it)} />
                        <span className={styles.tooltip}>{getTechName(it)}</span>
                      </a>
                    ) : (
                      <>
                        <img src={it} alt={getTechName(it)} />
                        <span className={styles.tooltip}>{getTechName(it)}</span>
                      </>
                    )
                  ) : (
                    <>
                      <span>{it}</span>
                      <span className={styles.tooltip}>{it}</span>
                    </>
                  )}
                </div>
              );
            }
            const techSlug = getTechSlug(it.src);
            const techUrl = techSlug ? `/projects/${cover.slug}/${techSlug}` : null;
            
            return (
              <div key={i} className={styles.iconContainer}>
                {techUrl ? (
                  <a
                    href={techUrl}
                    onClick={(e) => handleTechIconClick(e, it.src)}
                    style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
                  >
                    <img src={it.src} alt={it.alt ?? getTechName(it.src)} />
                    <span className={styles.tooltip}>{it.alt ?? getTechName(it.src)}</span>
                  </a>
                ) : (
                  <>
                    <img src={it.src} alt={it.alt ?? getTechName(it.src)} />
                    <span className={styles.tooltip}>{it.alt ?? getTechName(it.src)}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

        <aside className={styles.right}>
          {(() => {
            const projectIndex = findProjectIndexByImage(cover.mainImage);
            const mainImgSrc = optimizeCloudinaryUrl(cover.mainImage, isMobile ? 600 : 800, "85");
            const content = <BlurImage src={cover.mainImage} fullSrc={mainImgSrc} alt="main" loading="eager" />;
            return projectIndex !== null ? (
              <a
                href={`/projects/${cover.slug}?project=${projectIndex}`}
                onClick={(e) => handleProjectImageClick(e, projectIndex)}
                style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
              >
                {content}
              </a>
            ) : (
              content
            );
          })()}
        </aside>

        <div className={styles.mobileBottomSection}>
          {(() => {
            const projectIndex = cover.sideImages[1] ? findProjectIndexByImage(cover.sideImages[1]) : null;
            const src1 = cover.sideImages[1];
            const fullSrc1 = src1 ? optimizeCloudinaryUrl(src1, 400, "80") : "";
            const content1 = src1 ? <BlurImage src={src1} fullSrc={fullSrc1} alt="mobile-1" className={styles.mobileImageLeft} loading="lazy" /> : null;
            return projectIndex !== null ? (
              <a
                href={`/projects/${cover.slug}?project=${projectIndex}`}
                onClick={(e) => handleProjectImageClick(e, projectIndex)}
                style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
              >
                {content1}
              </a>
            ) : (
              content1
            );
          })()}
          <div className={styles.mobileIcons}>
            {cover.listIcons.map((it, i) => {
              if (typeof it === "string") {
                const techSlug = isUrl(it) ? getTechSlug(it) : null;
                const techUrl = techSlug ? `/projects/${cover.slug}/${techSlug}` : null;
                
                return (
                  <div key={i} className={styles.iconContainer}>
                    {isUrl(it) ? (
                      techUrl ? (
                        <a
                          href={techUrl}
                          onClick={(e) => handleTechIconClick(e, it)}
                          style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
                        >
                          <img src={it} alt={getTechName(it)} />
                          <span className={styles.tooltip}>{getTechName(it)}</span>
                        </a>
                      ) : (
                        <>
                          <img src={it} alt={getTechName(it)} />
                          <span className={styles.tooltip}>{getTechName(it)}</span>
                        </>
                      )
                    ) : (
                      <>
                        <span>{it}</span>
                        <span className={styles.tooltip}>{it}</span>
                      </>
                    )}
                  </div>
                );
              }
              const techSlug = getTechSlug(it.src);
              const techUrl = techSlug ? `/projects/${cover.slug}/${techSlug}` : null;
              
              return (
                <div key={i} className={styles.iconContainer}>
                  {techUrl ? (
                    <a
                      href={techUrl}
                      onClick={(e) => handleTechIconClick(e, it.src)}
                      style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
                    >
                      <img src={it.src} alt={it.alt ?? getTechName(it.src)} />
                      <span className={styles.tooltip}>
                        {it.alt ?? getTechName(it.src)}
                      </span>
                    </a>
                  ) : (
                    <>
                      <img src={it.src} alt={it.alt ?? getTechName(it.src)} />
                      <span className={styles.tooltip}>
                        {it.alt ?? getTechName(it.src)}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {(() => {
            const projectIndex = cover.sideImages[2] ? findProjectIndexByImage(cover.sideImages[2]) : null;
            const src2 = cover.sideImages[2];
            const fullSrc2 = src2 ? optimizeCloudinaryUrl(src2, 400, "80") : "";
            const content2 = src2 ? <BlurImage src={src2} fullSrc={fullSrc2} alt="mobile-2" className={styles.mobileImageRight} loading="lazy" /> : null;
            return projectIndex !== null ? (
              <a
                href={`/projects/${cover.slug}?project=${projectIndex}`}
                onClick={(e) => handleProjectImageClick(e, projectIndex)}
                style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
              >
                {content2}
              </a>
            ) : (
              content2
            );
          })()}
          <a 
            href={`/projects/${cover.slug}`} 
            className={styles.mobileCta}
            onClick={handleViewProjectsClick}
          >
            <span className={styles.arrow} aria-hidden>
            <HiArrowRight />
            </span>
            <span>{t("projects.view")}</span>
          </a>
        </div>
      </div>
    </section>
    </>
  );
};

export default ProjectCategory;