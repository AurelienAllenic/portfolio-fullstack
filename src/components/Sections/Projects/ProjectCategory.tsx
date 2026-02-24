import { useEffect, useRef, useLayoutEffect, useState, useMemo } from "react";
import { gsap } from "gsap";
import styles from "./projects.module.scss";
import RadialTransitionOverlay from "../../General/Nav/RadialTransitionOverlay";
import BlurImage from "../../General/BlurImage";
import { HiArrowRight } from "react-icons/hi2";
import { useLanguage } from "../../General/Language/LanguageContext";
import { useAnalytics } from "../../../hooks/useAnalytics";
import { allProjectsGifs } from "./Data";

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
  image?: string;
  imageDiaporama?: string[];
  images?: string[];
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
  onCtaClick?: () => void;
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

const getTechSlug = (url: string): string => {
  const match = url.match(/\/([^/]+)_[^_]+\.webp$/);
  if (match) {
    let name = match[1];
    name = name.replace(/-icon$/, '');

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

const slugifyProjectName = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') || 'project';

const STANDALONE_SLUGS = ['ascent-standalone', 'paro-standalone', 'claquettes-standalone'] as const;
const isStandaloneCover = (slug: string) => STANDALONE_SLUGS.includes(slug as typeof STANDALONE_SLUGS[number]);

const ProjectCategory = ({ cover, projects, categoryIndex, onCtaClick }: ProjectCategoryProps) => {
  const { t, language } = useLanguage();
  const containerRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pendingUrlRef = useRef<string | null>(null);
  const [currentGifIndex, setCurrentGifIndex] = useState(0);
  const isAllProjectsCover = cover.slug === 'tous-les-projets';
  const [imageOpacity, setImageOpacity] = useState(1);
  const isStandalone = isStandaloneCover(cover.slug);
  
  // Utiliser un state pour l'image principale afin de forcer le re-render lors de la rotation
  const [currentMainImage, setCurrentMainImage] = useState<string>(
    isAllProjectsCover && allProjectsGifs && allProjectsGifs.length > 0 
      ? allProjectsGifs[0] 
      : cover.mainImage
  );

  const { trackClick } = useAnalytics();
  const hasTrackedRef = useRef(false);
  
  // Rotation automatique des GIFs pour "Autres projets" avec transition fluide
  useEffect(() => {
    if (!isAllProjectsCover || !allProjectsGifs || allProjectsGifs.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      const nextIndex = (currentGifIndex + 1) % allProjectsGifs.length;
      const nextImage = allProjectsGifs[nextIndex];
      
      // Utiliser le state d'opacité pour une transition CSS plus fluide
      setImageOpacity(0);
      
      // Changer l'image après un court délai (pendant le fade out)
      setTimeout(() => {
        setCurrentMainImage(nextImage);
        setCurrentGifIndex(nextIndex);
        
        // Fade in de la nouvelle image
        setTimeout(() => {
          setImageOpacity(1);
        }, 50);
      }, 500); // Délai correspondant à la durée du fade out
    }, 3000); // Change de GIF toutes les 3 secondes

    return () => clearInterval(interval);
  }, [isAllProjectsCover, currentGifIndex]);

  // Track section arrival only when the component is visible (categoryIndex is defined)
  useEffect(() => {
    if (categoryIndex === undefined || hasTrackedRef.current) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const label = isMobile 
      ? `project_category_${cover.slug}_mobile`
      : `project_category_${cover.slug}`;

    trackClick(label);
    hasTrackedRef.current = true;
  }, [categoryIndex, cover.slug, trackClick]);

  const findProjectIndexByImage = (imageUrl: string): number | null => {
    if (!projects || projects.length === 0) return null;

    const extractBaseFilename = (url: string): string => {
      const uploadMatch = url.match(/\/image\/upload\/[^/]+\/(.+)$/);
      if (uploadMatch) {
        return uploadMatch[1].split('?')[0];
      }
      const parts = url.split('/');
      return parts[parts.length - 1].split('?')[0];
    };
    
    const baseFilename = extractBaseFilename(imageUrl);

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];

      if (project.image) {
        const projectBaseFilename = extractBaseFilename(project.image);
        if (projectBaseFilename === baseFilename) {
          return i;
        }
      }

      if (project.imageDiaporama && project.imageDiaporama.length > 0) {
        for (const diapoImage of project.imageDiaporama) {
          const diapoBaseFilename = extractBaseFilename(diapoImage);
          if (diapoBaseFilename === baseFilename) {
            return i;
          }
        }
      }

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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const categoryKeyMap: Record<string, string> = {
    'formation-web': 'web',
    'formation-react': 'react',
    'formation-python': 'python',
    'formations-openclassrooms': 'openclassrooms',
    'projets-personnels': 'personnel',
    'projets-solead': 'solead',
    'mastere-iim': 'iim',
    'ascent-standalone': 'ascent',
    'paro-standalone': 'paro',
    'claquettes-standalone': 'claquettes',
    'allprojects': 'allprojects',
    'tous-les-projets': 'allprojects',
  };
  
  const categoryKey = categoryKeyMap[cover.slug] || null;
  const categoryTitle = useMemo(() => {
    if (categoryKey) return t(`projects.category.${categoryKey}`);
    return cover.title;
  }, [t, categoryKey, cover.title]);
  const categoryDescription = useMemo(() => {
    if (categoryKey) return t(`projects.category.${categoryKey}.description`);
    return cover.content;
  }, [t, categoryKey, cover.content]);

  const titleParts = useMemo(() => {
    const parts = categoryTitle.split(" ");
    const isStandaloneProject = ['ascent-standalone', 'paro-standalone', 'claquettes-standalone'].includes(cover.slug);
    const accentText = parts.slice(1).join(" ");
    
    // Pour les projets standalone, ne pas afficher de deuxième ligne si accent est vide
    if (isStandaloneProject && !accentText) {
      return {
        main: parts[0] || "",
        accent: ""
      };
    }
    
    return {
      main: parts[0] || "",
      accent: accentText || ""
    };
  }, [categoryTitle, cover.slug, language]);

  useEffect(() => {
    const preloadImages = async () => {
      try {
        // Pour "Autres projets", précharger tous les GIFs
        if (isAllProjectsCover && allProjectsGifs && allProjectsGifs.length > 0) {
          await Promise.all(allProjectsGifs.map(gif => preloadImage(gif)));
        } else {
          // Ne pas optimiser mainImage pour préserver les GIFs
          await preloadImage(currentMainImage);
        }

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
  }, [cover, isAllProjectsCover, currentMainImage]);

  const handleViewProjectsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    trackClick(`${cover.slug}_voir_les_projets`);
    if (onCtaClick) {
      onCtaClick();
      return;
    }
    if (categoryIndex !== undefined) {
      sessionStorage.setItem('lastProjectCategoryIndex', categoryIndex.toString());
      sessionStorage.setItem('shouldRestoreScroll', 'true');
      pendingUrlRef.current = e.currentTarget.href;
      setIsTransitioning(true);
    }
  };

  const handleProjectImageClick = (e: React.MouseEvent<HTMLAnchorElement>, projectIndex: number) => {
    e.preventDefault();
    const project = projects?.[projectIndex];
    const projectName = project
      ? (language === 'fr' ? project.title : project.titleEn)
      : `project-${projectIndex}`;
    trackClick(`${cover.slug}_${slugifyProjectName(projectName)}`);
    if (categoryIndex !== undefined) {
      sessionStorage.setItem('lastProjectCategoryIndex', categoryIndex.toString());
      sessionStorage.setItem('shouldRestoreScroll', 'true');
      const projectUrl = `/projects/${cover.slug}?project=${projectIndex}`;
      pendingUrlRef.current = projectUrl;
      setIsTransitioning(true);
    }
  };

  /** Clic sur icône tech : pour standalone ne fait que toggle tooltip (géré dans le rendu). Pour les autres, navigation vers la page tous-les-projets filtrée par ce langage. */
  const handleTechIconClick = (e: React.MouseEvent<HTMLAnchorElement>, techUrl: string) => {
    e.preventDefault();
    if (isStandalone) return;
    const techSlug = getTechSlug(techUrl);
    if (techSlug) trackClick(`${cover.slug}_${techSlug}`);
    if (categoryIndex !== undefined) {
      sessionStorage.setItem('lastProjectCategoryIndex', categoryIndex.toString());
      sessionStorage.setItem('shouldRestoreScroll', 'true');
      const techUrl_path = `/projects/${cover.slug}/${techSlug}`;
      pendingUrlRef.current = techUrl_path;
      setIsTransitioning(true);
    }
  };

  const handleTransitionComplete = () => {
    if (pendingUrlRef.current) {
      window.location.href = pendingUrlRef.current;
    }
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Reset direct DOM (pas gsap.set qui peut être asynchrone) pour garantir
    // que les titres sont invisibles AVANT tout paint du navigateur.
    // Cela écrase aussi les styles inline laissés par GSAP lors d'une visite précédente.
    const mobileTitleMain = container.querySelector(`.${styles.mobileTitleMain}`) as HTMLElement | null;
    const mobileTitleAccent = container.querySelector(`.${styles.mobileTitleAccent}`) as HTMLElement | null;
    if (mobileTitleMain) {
      mobileTitleMain.style.opacity = '0';
      mobileTitleMain.style.transform = 'translateY(-30px)';
    }
    if (mobileTitleAccent) {
      mobileTitleAccent.style.opacity = '0';
      mobileTitleAccent.style.transform = 'translateY(-30px)';
    }

    if (categoryIndex === undefined) return;

    const mosaicItems = container.querySelectorAll(`.${styles.mosaicItem}`);
    const ctaButton = container.querySelector(`.${styles.cta}`);
    const titleMain = container.querySelector(`.${styles.titleMain}`);
    const titleAccent = container.querySelector(`.${styles.titleAccent}`);
    const contentBox = container.querySelector(`.${styles.contentBox}`);
    const icons = container.querySelectorAll(`.${styles.iconContainer}`);
    const rightImage = container.querySelector(`.${styles.right} img`);

    gsap.set(mosaicItems, { opacity: 0 });
    gsap.set(ctaButton, { opacity: 0, y: 30 });
    const titleElements = [titleMain, titleAccent].filter(Boolean);
    if (titleElements.length > 0) {
      gsap.set(titleElements, { opacity: 0, y: -30 });
    }
    gsap.set(contentBox, { opacity: 0 });
    gsap.set(icons, { opacity: 0 });
    gsap.set(rightImage, { opacity: 0, x: 50 });

    const mobileDescription = container.querySelector(`.${styles.mobileDescription}`);
    const mobileImage = container.querySelector(`.${styles.mobileImage}`);
    const mobileIcons = container.querySelectorAll(`.${styles.mobileIcons} .${styles.iconContainer}`);
    const mobileImageLeft = container.querySelector(`.${styles.mobileImageLeft}`);
    const mobileImageRight = container.querySelector(`.${styles.mobileImageRight}`);
    const mobileCta = container.querySelector(`.${styles.mobileCta}`);

    if (mobileDescription) gsap.set(mobileDescription, { opacity: 0 });
    if (mobileImage) gsap.set(mobileImage, { opacity: 0, scale: 0.8 });
    if (mobileIcons.length > 0) gsap.set(mobileIcons, { opacity: 0 });
    if (mobileImageLeft) gsap.set(mobileImageLeft, { opacity: 0, x: -30 });
    if (mobileImageRight) gsap.set(mobileImageRight, { opacity: 0, x: 30 });
    if (mobileCta) gsap.set(mobileCta, { opacity: 0, y: 20 });
  }, [categoryIndex]);

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
    const titleElements = [titleMain, titleAccent].filter(Boolean);
    if (titleElements.length > 0) {
      gsap.set(titleElements, { opacity: 0, y: -30 });
    }
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

    // Masquer les titres mobiles initialement (animer chaque élément qui existe)
    if (mobileTitleMain) gsap.set(mobileTitleMain, { opacity: 0, y: -30 });
    if (mobileTitleAccent) gsap.set(mobileTitleAccent, { opacity: 0, y: -30 });
    if (mobileDescription) gsap.set(mobileDescription, { opacity: 0 });
    if (mobileImage) gsap.set(mobileImage, { opacity: 0, scale: 0.8 });
    if (mobileIcons.length > 0) gsap.set(mobileIcons, { opacity: 0 });
    if (mobileImageLeft) gsap.set(mobileImageLeft, { opacity: 0, x: -30 });
    if (mobileImageRight) gsap.set(mobileImageRight, { opacity: 0, x: 30 });
    if (mobileCta) gsap.set(mobileCta, { opacity: 0, y: 20 });

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
      const titleElementsToAnimate = [titleMain, titleAccent].filter(Boolean);
      if (titleElementsToAnimate.length > 0) {
        tl.to(titleElementsToAnimate, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
        }, 0.4);
      }
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
      // Animer les titres mobiles avec fromTo pour forcer le départ à opacity:0
      const mobileTitleEls = [mobileTitleMain, mobileTitleAccent].filter(Boolean);
      const isAscentOrParo = cover.slug === 'ascent-standalone' || cover.slug === 'paro-standalone';
      const titleStart = isAscentOrParo ? 0.5 : 0.2;
      if (mobileTitleEls.length > 0) {
        tl.fromTo(mobileTitleEls,
          { opacity: 0, y: -30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: mobileTitleEls.length > 1 ? 0.05 : 0,
          },
          titleStart
        );
      }
      if (mobileDescription) {
        tl.to(mobileDescription, {
          opacity: 1,
          duration: 0.4,
        }, 0.4);
      }
      if (mobileImage) {
        tl.to(mobileImage, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
        }, 0.85);
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
    const fallbackTimer = setTimeout(() => {
      const el = containerRef.current;
      if (!el) return;
      const mosaicItems = el.querySelectorAll(`.${styles.mosaicItem}`);
      const mosaicImgs = el.querySelectorAll(`.${styles.mosaicItem} img`);
      const rightImg = el.querySelector(`.${styles.right} img`);
      const mobileImg = el.querySelector(`.${styles.mobileImage}`);
      const mobileLeft = el.querySelector(`.${styles.mobileImageLeft}`);
      const mobileRight = el.querySelector(`.${styles.mobileImageRight}`);
      const titleMain = el.querySelector(`.${styles.titleMain}`);
      const titleAccent = el.querySelector(`.${styles.titleAccent}`);
      const mobileTitleMain = el.querySelector(`.${styles.mobileTitleMain}`);
      const mobileTitleAccent = el.querySelector(`.${styles.mobileTitleAccent}`);
      const toShow = [
        ...mosaicItems,
        ...mosaicImgs,
        ...(rightImg ? [rightImg] : []),
        ...(mobileImg ? [mobileImg] : []),
        ...(mobileLeft ? [mobileLeft] : []),
        ...(mobileRight ? [mobileRight] : []),
        ...(titleMain ? [titleMain] : []),
        ...(titleAccent ? [titleAccent] : []),
        ...(mobileTitleMain ? [mobileTitleMain] : []),
        ...(mobileTitleAccent ? [mobileTitleAccent] : []),
      ];
      toShow.forEach((node) => {
        if (node && parseFloat(getComputedStyle(node as Element).opacity) < 0.95) {
          const isMobileCta = (node as Element).classList?.contains(styles.mobileCta);
          gsap.set(node, isMobileCta ? { opacity: 1, y: 0 } : { opacity: 1, x: 0, y: 0, scale: 1 });
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
        <div className={styles.mobileHeaderRow}>
          <div className={styles.mobileTitle}>
            <h2 className={styles.mobileTitleMain}>
              {titleParts.main}
            </h2>
            {titleParts.accent && (
              <h3 className={styles.mobileTitleAccent}>
                {titleParts.accent}
              </h3>
            )}
          </div>
          {(() => {
            const imageToUse = isAllProjectsCover ? currentMainImage : cover.mainImage;
            const projectIndex = findProjectIndexByImage(imageToUse);
            // Ne pas optimiser mainImage pour préserver les GIFs
            const content = (
              <BlurImage 
                src={imageToUse} 
                fullSrc={imageToUse} 
                alt="main" 
                className={styles.mobileImage} 
                loading="eager" 
                key={imageToUse}
                imgStyle={{ opacity: imageOpacity, transition: 'opacity 0.5s ease-in-out' }}
              />
            );
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
        <a
          href={onCtaClick ? '#' : `/projects/${cover.slug}`}
          className={styles.mobileCta}
          onClick={handleViewProjectsClick}
        >
          <span className={styles.arrow} aria-hidden>
            <HiArrowRight />
          </span>
          <span>{onCtaClick ? t("projects.view.project") : t("projects.view")}</span>
        </a>
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
          href={onCtaClick ? '#' : `/projects/${cover.slug}`} 
          className={styles.cta}
          onClick={handleViewProjectsClick}
        >
          <span className={styles.arrow} aria-hidden><HiArrowRight /></span>
          <span>{onCtaClick ? t("projects.view.project") : t("projects.view")}</span>
        </a>
      </aside>
      <div className={styles.center}>
        <h2 className={styles.title}>
          <span className={styles.titleMain}>
            {titleParts.main}
          </span>
          {titleParts.accent && (
            <span className={styles.titleAccent}>
              {titleParts.accent}
            </span>
          )}
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
              const tooltipLabel = getTechName(it);
              if (isStandalone) {
                return (
                  <div
                    key={i}
                    className={styles.iconContainer}
                  >
                    {isUrl(it) ? (
                      <>
                        <img src={it} alt={tooltipLabel} />
                        <span className={styles.tooltip}>{tooltipLabel}</span>
                      </>
                    ) : (
                      <>
                        <span>{it}</span>
                        <span className={styles.tooltip}>{it}</span>
                      </>
                    )}
                  </div>
                );
              }
              return (
                <div key={i} className={styles.iconContainer}>
                  {isUrl(it) ? (
                    techUrl ? (
                      <a
                        href={techUrl}
                        onClick={(e) => handleTechIconClick(e, it)}
                        style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
                      >
                        <img src={it} alt={tooltipLabel} />
                        <span className={styles.tooltip}>{tooltipLabel}</span>
                      </a>
                    ) : (
                      <>
                        <img src={it} alt={tooltipLabel} />
                        <span className={styles.tooltip}>{tooltipLabel}</span>
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
            const tooltipLabel = it.alt ?? getTechName(it.src);
            if (isStandalone) {
              return (
                <div
                  key={i}
                  className={styles.iconContainer}
                >
                  <img src={it.src} alt={tooltipLabel} />
                  <span className={styles.tooltip}>{tooltipLabel}</span>
                </div>
              );
            }
            return (
              <div key={i} className={styles.iconContainer}>
                {techUrl ? (
                  <a
                    href={techUrl}
                    onClick={(e) => handleTechIconClick(e, it.src)}
                    style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
                  >
                    <img src={it.src} alt={tooltipLabel} />
                    <span className={styles.tooltip}>{tooltipLabel}</span>
                  </a>
                ) : (
                  <>
                    <img src={it.src} alt={tooltipLabel} />
                    <span className={styles.tooltip}>{tooltipLabel}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
        <aside className={styles.right}>
          {(() => {
            const imageToUse = isAllProjectsCover ? currentMainImage : cover.mainImage;
            const projectIndex = findProjectIndexByImage(imageToUse);
            // Ne pas optimiser mainImage pour préserver les GIFs
            const content = (
              <BlurImage 
                src={imageToUse} 
                fullSrc={imageToUse} 
                alt="main" 
                loading="eager" 
                key={imageToUse}
                imgStyle={{ opacity: imageOpacity, transition: 'opacity 0.5s ease-in-out' }}
              />
            );
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
                const tooltipLabel = getTechName(it);
                if (isStandalone) {
                  return (
                    <div
                      key={i}
                      className={styles.iconContainer}
                    >
                      {isUrl(it) ? (
                        <>
                          <img src={it} alt={tooltipLabel} />
                          <span className={styles.tooltip}>{tooltipLabel}</span>
                        </>
                      ) : (
                        <>
                          <span>{it}</span>
                          <span className={styles.tooltip}>{it}</span>
                        </>
                      )}
                    </div>
                  );
                }
                return (
                  <div key={i} className={styles.iconContainer}>
                    {isUrl(it) ? (
                      techUrl ? (
                        <a
                          href={techUrl}
                          onClick={(e) => handleTechIconClick(e, it)}
                          style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
                        >
                          <img src={it} alt={tooltipLabel} />
                          <span className={styles.tooltip}>{tooltipLabel}</span>
                        </a>
                      ) : (
                        <>
                          <img src={it} alt={tooltipLabel} />
                          <span className={styles.tooltip}>{tooltipLabel}</span>
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
              const tooltipLabel = it.alt ?? getTechName(it.src);
              if (isStandalone) {
                return (
                  <div
                    key={i}
                    className={styles.iconContainer}
                  >
                    <img src={it.src} alt={tooltipLabel} />
                    <span className={styles.tooltip}>{tooltipLabel}</span>
                  </div>
                );
              }
              return (
                <div key={i} className={styles.iconContainer}>
                  {techUrl ? (
                    <a
                      href={techUrl}
                      onClick={(e) => handleTechIconClick(e, it.src)}
                      style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
                    >
                      <img src={it.src} alt={tooltipLabel} />
                      <span className={styles.tooltip}>{tooltipLabel}</span>
                    </a>
                  ) : (
                    <>
                      <img src={it.src} alt={tooltipLabel} />
                      <span className={styles.tooltip}>{tooltipLabel}</span>
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
        </div>
      </div>
    </section>
    </>
  );
};

export default ProjectCategory;
