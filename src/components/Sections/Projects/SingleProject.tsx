import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import styles from "./projects.module.scss";
import type { Project } from "./ProjectCategory";
import RadialTransitionOverlay from "../../General/Nav/RadialTransitionOverlay";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { useLanguage } from "../../General/Language/LanguageContext";
import BlurImage from "../../General/BlurImage";
import { useAnalytics } from "../../../hooks/useAnalytics";

/** Slug pour les labels analytics (nom du projet / bouton) */
const slugifyProjectName = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') || 'project';

interface SingleProjectProps {
  projects: Project[];
  categoryKey: string;
  programmingLanguage?: string;
  initialProjectIndex?: number;
  onBack?: () => void;
}

const SingleProject = ({ 
  projects, 
  categoryKey, 
  programmingLanguage,
  initialProjectIndex = 0,
  onBack 
}: SingleProjectProps) => {
  const { language, t } = useLanguage();
  const categoryLabel = programmingLanguage
    ? `${t(`projects.category.${categoryKey}`)} - ${programmingLanguage.charAt(0).toUpperCase() + programmingLanguage.slice(1)}`
    : t(`projects.category.${categoryKey}`);
  const { trackClick } = useAnalytics();
  const [selectedIndex, setSelectedIndex] = useState(initialProjectIndex);
  const [showOverlay, setShowOverlay] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const slideIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTransitioningRef = useRef(false);
  const gifDurationsRef = useRef<Map<string, number>>(new Map());
  const [loadedGifs, setLoadedGifs] = useState<Record<string, boolean>>({});
  const markGifLoaded = (key: string) => setLoadedGifs((prev) => ({ ...prev, [key]: true }));

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const selectedProject = projects[selectedIndex];
  const projectTitle = language === "en" && selectedProject.titleEn ? selectedProject.titleEn : selectedProject.title;
  const projectDescription = language === "en" && selectedProject.descriptionEn ? selectedProject.descriptionEn : selectedProject.description;

  const getProjectImages = (project: Project): string[] => {
    if (project.imageDiaporama && project.imageDiaporama.length > 0) {
      return project.imageDiaporama;
    }
    if (project.images && project.images.length > 0) {
      return project.images;
    }
    if (project.image) {
      return [project.image];
    }
    return [];
  };
  
  const projectImages = getProjectImages(selectedProject);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    gsap.set(container, { opacity: 0 });
    setTimeout(() => {
      gsap.to(container, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }, 200);
  }, []);

  useEffect(() => {
    if (sliderRef.current && initialProjectIndex > 0) {
      setTimeout(() => {
        const slider = sliderRef.current;
        if (!slider) return;

        const projectCards = slider.querySelectorAll(`.${styles.sliderImage}`);
        if (projectCards[initialProjectIndex]) {
          const targetCard = projectCards[initialProjectIndex] as HTMLElement;
          const cardLeft = targetCard.offsetLeft;
          const cardWidth = targetCard.offsetWidth;
          const sliderWidth = slider.offsetWidth;

          const scrollPosition = cardLeft - (sliderWidth / 2) + (cardWidth / 2);
          
          slider.scrollTo({
            left: Math.max(0, scrollPosition),
            behavior: 'smooth'
          });
        }
      }, 100);
    } else if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: 'instant' });
    }
  }, [initialProjectIndex]);

  useEffect(() => {
    setCurrentImageIndex(0);
    isTransitioningRef.current = false;
  }, [selectedIndex]);

  useEffect(() => {
    const project = projects[selectedIndex];
    if (project) {
      const name = language === 'fr' ? project.title : (project.titleEn || project.title);
      trackClick(`page-projet_${slugifyProjectName(name)}`);
    }
  }, [selectedIndex, language, projects, trackClick]);

  useEffect(() => {
    if (sliderRef.current) {
      setTimeout(() => {
        const slider = sliderRef.current;
        if (!slider) return;
        
        const projectCards = slider.querySelectorAll(`.${styles.sliderImage}`);
        if (projectCards[selectedIndex]) {
          const targetCard = projectCards[selectedIndex] as HTMLElement;
          const cardLeft = targetCard.offsetLeft;
          const cardWidth = targetCard.offsetWidth;
          const sliderWidth = slider.offsetWidth;
          const sliderScrollLeft = slider.scrollLeft;
          const sliderScrollRight = sliderScrollLeft + sliderWidth;

          const cardRight = cardLeft + cardWidth;
          const isVisible = cardLeft >= sliderScrollLeft && cardRight <= sliderScrollRight;

          if (!isVisible) {
            const scrollPosition = cardLeft - (sliderWidth / 2) + (cardWidth / 2);
            slider.scrollTo({
              left: Math.max(0, scrollPosition),
              behavior: 'smooth'
            });
          }
        }
      }, 100);
    }
  }, [selectedIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mainImage = container.querySelector(`.${styles.projectMainImage}`);
    const title = container.querySelector(`.${styles.projectTitle}`);
    const description = container.querySelector(`.${styles.projectDescription}`);
    const techIcons = container.querySelectorAll(`.${styles.techIcon}`);
    const buttons = container.querySelectorAll(`.${styles.projectButton}`);

    gsap.fromTo(
      [mainImage, title, description, techIcons, buttons],
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
      }
    );
  }, [selectedIndex]);

  const isGif = (url: string): boolean => {
    return url.toLowerCase().endsWith('.gif') || url.toLowerCase().includes('.gif');
  };

  const getGifDuration = async (url: string): Promise<number> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      let totalDuration = 0;
      let index = 0;

      while (index < bytes.length - 4) {
        if (bytes[index] === 0x21 && bytes[index + 1] === 0xF9) {
          const delayTime = (bytes[index + 4] | (bytes[index + 5] << 8));
          const frameDelay = delayTime * 10 || 100;
          totalDuration += frameDelay;
        }
        index++;
      }
      return totalDuration > 500 ? totalDuration : 3000;
    } catch (error) {
      console.warn('Impossible de lire la durée du GIF:', error);
      return 3000;
    }
  };

  const optimizeImageUrl = (url: string, width?: number, quality: string = "auto"): string => {
    if (!url.includes("cloudinary.com")) return url;
    const parts = url.split("/image/upload/");
    if (parts.length !== 2) return url;
    const base = parts[0];
    const rest = parts[1];
    const lastSlash = rest.lastIndexOf("/");
    const publicId = lastSlash >= 0 ? rest.slice(lastSlash + 1) : rest;
    const isGif = publicId.toLowerCase().endsWith(".gif");
    let params = isGif ? `q_${quality}` : `f_webp,q_${quality}`;
    if (width) params += `,w_${width}`;
    return `${base}/image/upload/${params}/${publicId}`;
  };

  useEffect(() => {
    const preloadImages = async () => {
      if (projectImages.length === 0) return;
      
      const firstImage = projectImages[0];
      const firstImageSrc = isGif(firstImage) ? firstImage : optimizeImageUrl(firstImage, 1200, "85");
      
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = firstImageSrc;
      });
      
      if (isGif(firstImage)) {
        const duration = await getGifDuration(firstImage);
        gifDurationsRef.current.set(firstImage, duration);
      }
      
      if (projectImages.length > 1) {
        setTimeout(() => {
          projectImages.slice(1).forEach(async (src) => {
            const preloadSrc = isGif(src) ? src : optimizeImageUrl(src, 1200, "85");
            await new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = preloadSrc;
            });
            if (isGif(src)) {
              const duration = await getGifDuration(src);
              gifDurationsRef.current.set(src, duration);
            }
          });
        }, 500);
      }
    };

    preloadImages();
  }, [selectedIndex, projectImages]);

  useEffect(() => {
    if (slideIntervalRef.current) {
      clearTimeout(slideIntervalRef.current);
      slideIntervalRef.current = null;
    }

    if (projectImages.length <= 1) {
      return;
    }

    const currentImageUrl = projectImages[currentImageIndex];
    const isCurrentImageGif = isGif(currentImageUrl);
    let displayDuration: number;
    
    if (isCurrentImageGif) {
      displayDuration = 6000;
    } else {
      displayDuration = 2500;
    }

    if (isCurrentImageGif) {
      requestAnimationFrame(() => {
        const container = containerRef.current;
        if (container) {
          const activeImg = container.querySelector(
            `.${styles.slideshowImage}.${styles.slideshowImageActive}`
          ) as HTMLImageElement;
          
          if (activeImg) {
            const baseUrl = currentImageUrl.split('?')[0];
            activeImg.src = '';
            setTimeout(() => {
              activeImg.src = baseUrl + '?t=' + Date.now();
            }, 10);
          }
        }
      });
    }

    slideIntervalRef.current = setTimeout(() => {
      if (!isTransitioningRef.current) {
        isTransitioningRef.current = true;

        setCurrentImageIndex((prev) => (prev + 1) % projectImages.length);

        setTimeout(() => {
          isTransitioningRef.current = false;
        }, 600);
      }
    }, displayDuration);

    return () => {
      if (slideIntervalRef.current) {
        clearTimeout(slideIntervalRef.current);
        slideIntervalRef.current = null;
      }
    };
  }, [currentImageIndex, projectImages, selectedIndex]);

  const handleImageClick = (index: number) => {
    if (index !== selectedIndex) {
      const project = projects[index];
      if (project) {
        const name = language === 'fr' ? project.title : (project.titleEn || project.title);
        trackClick(`page-projet_${slugifyProjectName(name)}_selection`);
      }
      setSelectedIndex(index);

      if (sliderRef.current) {
        setTimeout(() => {
          const slider = sliderRef.current;
          if (!slider) return;
          
          const projectCards = slider.querySelectorAll(`.${styles.sliderImage}`);
          if (projectCards[index]) {
            const targetCard = projectCards[index] as HTMLElement;
            const cardLeft = targetCard.offsetLeft;
            const cardWidth = targetCard.offsetWidth;
            const sliderWidth = slider.offsetWidth;
            
            const scrollPosition = cardLeft - (sliderWidth / 2) + (cardWidth / 2);
            
            slider.scrollTo({
              left: Math.max(0, scrollPosition),
              behavior: 'smooth'
            });
          }
        }, 50);
      }
    }
  };

  const handleScrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  const handleScrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  const getTechIcon = (tech: string): string => {
    const techMap: { [key: string]: string } = {
      html: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/html_yzkdbv.webp",
      css: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/css_ldbn4p.webp",
      scss: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/scss_f6hkzy.webp",
      javascript: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/js_cbaqmr.webp",
      reactjs: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/react_jzelsd.webp",
      nodejs: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/nodejs_lqsesq.webp",
      python: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/python_ldgrbv.webp",
      django: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/django_dyc8kz.webp",
      nextjs: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/next_ep27nk.webp",
      mongodb : "https://res.cloudinary.com/dwpbyyhoq/image/upload/mongodb-icon_bsizyi.webp",
      reactnative : "https://res.cloudinary.com/dwpbyyhoq/image/upload/react-native_dyhcn4.webp",
      typescript : "https://res.cloudinary.com/dwpbyyhoq/image/upload/ts_hodabq.webp",
      expo : "https://res.cloudinary.com/dwpbyyhoq/image/upload/expo_scubds.webp",
      stripe : "https://res.cloudinary.com/dwpbyyhoq/image/upload/stripe_ij9sgu.webp",
      metabase : "https://res.cloudinary.com/dwpbyyhoq/image/upload/metabase_yqies2.webp",
      tensorflow : "https://res.cloudinary.com/dwpbyyhoq/image/upload/tensorflow_t6u5t9.webp",
      keras : "https://res.cloudinary.com/dwpbyyhoq/image/upload/keras_cjv2id.webp",
      flutter : "https://res.cloudinary.com/dwpbyyhoq/image/upload/flutter_zfmqyx.webp",
      symfony: "https://res.cloudinary.com/dwpbyyhoq/image/upload/symfony_t74k8y.webp",
      jquery: "https://res.cloudinary.com/dwpbyyhoq/image/upload/jquery_wk7xot.webp",
      wordpress: "https://res.cloudinary.com/dwpbyyhoq/image/upload/wordpress-icon_ngq76k.webp",
      php: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/php_r7rttg.webp",
    };
    return techMap[tech.toLowerCase()] || "";
  };

  const getTechName = (tech: string): string => {
    const techNames: { [key: string]: string } = {
      html: "HTML",
      css: "CSS",
      scss: "SCSS",
      javascript: "JavaScript",
      reactjs: "React",
      nodejs: "Node.js",
      python: "Python",
      django: "Django",
      nextjs: "Next.js",
      jquery: "jQuery",
      wordpress: "Wordpress",
      php: "PHP",
      seo: "SEO",
      backlog: "Backlog",
      twig: "Twig",
      flask: "Flask",
      pytest: "Pytest",
      sql: "SQL",
      sentry: "Sentry",
      "django rest": "Django Rest",
      "pipeline ci/cd": "CI/CD",
      docker: "Docker",
      "styled-components": "Styled Components",
      userstories: "User Stories",
      figma: "Figma",
      mongodb : "MongoDB",
      reactnative: "React native",
      typescript: "Typescript",
      expo: "Expo",
      stripe: "Stripe",
      metabase: "Metabase",
      tensorflow: "Tensorflow",
      keras: "Keras",
      flutter: "Flutter",
      symfony: "Symfony",
    };
    return techNames[tech.toLowerCase()] || tech.charAt(0).toUpperCase() + tech.slice(1);
  };

  return (
    <>
      <RadialTransitionOverlay
        isActive={showOverlay}
        direction="out"
        onComplete={() => setShowOverlay(false)}
      />
      <div ref={containerRef} className={styles.containerSingleProject}>
        {/* Upper slider images */}
        <div className={styles.sliderWrapper}>
          <button 
            className={styles.sliderArrowLeft}
            onClick={handleScrollLeft}
            aria-label="Défiler vers la gauche"
          >
            <HiChevronLeft />
          </button>
          <div ref={sliderRef} className={styles.topSlider}>
            {projects.map((project, index) => {
              const projectImages = getProjectImages(project);
              const firstImage = projectImages[0] || '';
              const isFirstGif = isGif(firstImage);
              const thumbnailSrc = isFirstGif ? firstImage : optimizeImageUrl(firstImage, isMobile ? 200 : 300, "75");
              
              return (
                <div
                  key={project.id}
                  className={`${styles.sliderImage} ${
                    index === selectedIndex ? styles.sliderImageActive : ""
                  } ${isFirstGif ? styles.sliderImageGif : ""}`}
                  onClick={() => handleImageClick(index)}
                >
                  {isFirstGif ? (
                    <span
                      className={`${styles.gifPlaceholder} ${loadedGifs[`slider-${project.id}`] ? styles.gifLoaded : ""}`}
                      style={{ backgroundImage: `url(${firstImage})` }}
                    >
                      <img
                        src={firstImage}
                        alt={project.title}
                        loading={index < 3 ? "eager" : "lazy"}
                        onLoad={() => markGifLoaded(`slider-${project.id}`)}
                      />
                    </span>
                  ) : (
                    <BlurImage
                      src={firstImage}
                      fullSrc={thumbnailSrc}
                      alt={project.title}
                      loading={index < 3 ? "eager" : "lazy"}
                      objectFit="cover"
                    />
                  )}
                </div>
              );
            })}
          </div>
          <button 
            className={styles.sliderArrowRight}
            onClick={handleScrollRight}
            aria-label="Défiler vers la droite"
          >
            <HiChevronRight />
          </button>
        </div>

        {/* Selected project content */}
        <div className={styles.projectContent}>
          {/* Main image with crossfade transition */}
          <div className={styles.projectMainImage}>
            {projectImages.map((imgSrc, index) => {
              const isImgGif = isGif(imgSrc);
              const displaySrc = isImgGif ? imgSrc : optimizeImageUrl(imgSrc, isMobile ? 800 : 1200, "85");
              const slideClass = `${styles.slideshowImage} ${index === currentImageIndex ? styles.slideshowImageActive : ""}`;
              const slideStyle = {
                position: (index === 0 ? "relative" : "absolute") as "relative" | "absolute",
                top: index === 0 ? "auto" : 0,
                left: index === 0 ? "auto" : 0,
                width: "100%",
                height: "100%",
                maxWidth: "100%",
                objectFit: "cover" as const,
              };
              
              return isImgGif ? (
                <span
                  key={`${selectedProject.id}-${index}`}
                  className={`${styles.gifPlaceholder} ${loadedGifs[`slide-${selectedProject.id}-${index}`] ? styles.gifLoaded : ""}`}
                  style={{
                    position: index === 0 ? "relative" : "absolute",
                    top: index === 0 ? "auto" : 0,
                    left: index === 0 ? "auto" : 0,
                    width: "100%",
                    height: "100%",
                    maxWidth: "100%",
                    backgroundImage: `url(${imgSrc})`,
                  }}
                >
                  <img
                    src={imgSrc}
                    alt={`${selectedProject.title} - Image ${index + 1}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    className={slideClass}
                    style={slideStyle}
                    onLoad={() => markGifLoaded(`slide-${selectedProject.id}-${index}`)}
                  />
                </span>
              ) : (
                <BlurImage
                  key={`${selectedProject.id}-${index}`}
                  src={imgSrc}
                  fullSrc={displaySrc}
                  alt={`${selectedProject.title} - Image ${index + 1}`}
                  loading={index === 0 ? "eager" : "lazy"}
                  objectFit="cover"
                  wrapperStyle={{
                    position: index === 0 ? "relative" : "absolute",
                    top: index === 0 ? "auto" : 0,
                    left: index === 0 ? "auto" : 0,
                    width: "100%",
                    height: "100%",
                    maxWidth: "100%",
                  }}
                  imgClassName={slideClass}
                  imgStyle={slideStyle}
                />
              );
            })}
          </div>

          {/* Project details */}
          <div className={styles.projectDetails}>
            <h2 className={styles.projectTitle}>{projectTitle}</h2>
            <p className={styles.projectDescription}>{projectDescription}</p>

            <div className={styles.techIcons}>
              {selectedProject.technologies.map((tech, index) => {
                const iconUrl = getTechIcon(tech);
                return iconUrl ? (
                  <div key={index} className={styles.techIconContainer}>
                    <img src={iconUrl} alt={tech} className={styles.techIcon} />
                    <span className={styles.techTooltip}>{getTechName(tech)}</span>
                  </div>
                ) : (
                  <div key={index} className={styles.techBadge}>
                    {getTechName(tech)}
                  </div>
                );
              })}
            </div>

            <div className={styles.projectButtons}>
              {selectedProject.github && (
                <a
                  href={selectedProject.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.projectButton}
                  onClick={() => trackClick(`page-projet_${slugifyProjectName(projectTitle)}_github`)}
                >
                  GitHub
                </a>
              )}
              {selectedProject.demo && (
                <a
                  href={selectedProject.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.projectButton}
                  onClick={() => trackClick(`page-projet_${slugifyProjectName(projectTitle)}_live-demo`)}
                >
                  Live Demo
                </a>
              )}
              {selectedProject.figma && (
                <a
                  href={selectedProject.figma}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.projectButton}
                  onClick={() => trackClick(`page-projet_${slugifyProjectName(projectTitle)}_figma`)}
                >
                  Figma
                </a>
              )}
              {selectedProject.folder && Array.isArray(selectedProject.folder) && (
                <>
                  {selectedProject.folder.map((item) => (
                    <a
                      key={item.id}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.projectButton}
                      onClick={() => trackClick(`page-projet_${slugifyProjectName(projectTitle)}_${slugifyProjectName(item.title)}`)}
                    >
                      {item.title}
                    </a>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className={styles.categoryLabel}>{categoryLabel}</div>
        </div>

        <button onClick={onBack} className={styles.backButton}>
          ← {language === "en" ? "Back" : "Retour"}
        </button>
      </div>
    </>
  );
};

export default SingleProject;
