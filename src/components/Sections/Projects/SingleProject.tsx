import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import styles from "./projects.module.scss";
import type { Project } from "./ProjectCategory";
import RadialTransitionOverlay from "../../General/Nav/RadialTransitionOverlay";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

interface SingleProjectProps {
  projects: Project[];
  categoryTitle: string;
  initialProjectIndex?: number;
  onBack?: () => void;
}

const SingleProject = ({ 
  projects, 
  categoryTitle, 
  initialProjectIndex = 0,
  onBack 
}: SingleProjectProps) => {
  const [selectedIndex, setSelectedIndex] = useState(initialProjectIndex);
  const [showOverlay, setShowOverlay] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const slideIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTransitioningRef = useRef(false);
  const gifDurationsRef = useRef<Map<string, number>>(new Map());
  
  const selectedProject = projects[selectedIndex];
  
  // Obtenir les images du projet
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

  // Animation d'entrée avec overlay
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

  // Slider au début
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: 'instant' });
    }
  }, []);

  // Réinitialiser l'index de l'image quand on change de projet
  useEffect(() => {
    setCurrentImageIndex(0);
    isTransitioningRef.current = false;
  }, [selectedIndex]);

  // Animation lors du changement de projet
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

  // Fonction pour vérifier si une image est un GIF
  const isGif = (url: string): boolean => {
    return url.toLowerCase().endsWith('.gif') || url.toLowerCase().includes('.gif');
  };

  // Fonction pour obtenir la durée d'un GIF en analysant ses frames
  const getGifDuration = async (url: string): Promise<number> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      let totalDuration = 0;
      let index = 0;
      
      // Parcourir le fichier GIF pour trouver les blocs Graphics Control Extension (GCE)
      while (index < bytes.length - 4) {
        // Recherche du bloc GCE (0x21 0xF9)
        if (bytes[index] === 0x21 && bytes[index + 1] === 0xF9) {
          // Le délai est stocké aux octets +4 et +5 (little-endian, en centièmes de seconde)
          const delayTime = (bytes[index + 4] | (bytes[index + 5] << 8));
          // Convertir en millisecondes (centièmes de sec → ms)
          const frameDelay = delayTime * 10 || 100; // Si 0, utiliser 100ms par défaut
          totalDuration += frameDelay;
        }
        index++;
      }
      
      // Si la durée totale est trop courte ou nulle, utiliser une valeur par défaut
      return totalDuration > 500 ? totalDuration : 3000;
    } catch (error) {
      console.warn('Impossible de lire la durée du GIF:', error);
      // Durée par défaut pour les GIFs si l'analyse échoue
      return 3000;
    }
  };

  // Précharger TOUTES les images et calculer les durées des GIFs
  useEffect(() => {
    const preloadImages = async () => {
      const promises = projectImages.map(async (src) => {
        // Précharger l'image
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        });
        
        // Si c'est un GIF, calculer et stocker sa durée
        if (isGif(src)) {
          const duration = await getGifDuration(src);
          gifDurationsRef.current.set(src, duration);
        }
      });
      
      await Promise.all(promises);
    };

    if (projectImages.length > 0) {
      preloadImages();
    }
  }, [selectedIndex, projectImages]);

  // Gestion du diaporama automatique avec respect de la durée des GIFs
  useEffect(() => {
    // Nettoyer l'intervalle précédent
    if (slideIntervalRef.current) {
      clearTimeout(slideIntervalRef.current);
      slideIntervalRef.current = null;
    }

    // Pas de diaporama si une seule image
    if (projectImages.length <= 1) {
      return;
    }

    const currentImageUrl = projectImages[currentImageIndex];
    const isCurrentImageGif = isGif(currentImageUrl);

    // Déterminer la durée d'affichage AVANT de manipuler le GIF
    let displayDuration: number;
    
    if (isCurrentImageGif) {
      // Pour un GIF : afficher pendant 5 secondes
      displayDuration = 6000;
      console.log(`Affichage du GIF pendant ${displayDuration}ms`);
    } else {
      // Pour une image statique : 2.5 secondes
      displayDuration = 2500;
    }

    // Si c'est un GIF, le forcer à redémarrer APRÈS avoir récupéré sa durée
    if (isCurrentImageGif) {
      // Utiliser requestAnimationFrame pour s'assurer que le DOM est à jour
      requestAnimationFrame(() => {
        const container = containerRef.current;
        if (container) {
          const activeImg = container.querySelector(
            `.${styles.slideshowImage}.${styles.slideshowImageActive}`
          ) as HTMLImageElement;
          
          if (activeImg) {
            // Extraire l'URL de base sans le timestamp
            const baseUrl = currentImageUrl.split('?')[0];
            
            // Forcer le rechargement du GIF
            activeImg.src = '';
            setTimeout(() => {
              activeImg.src = baseUrl + '?t=' + Date.now();
            }, 10);
          }
        }
      });
    }

    // Programmer la transition vers l'image suivante
    slideIntervalRef.current = setTimeout(() => {
      if (!isTransitioningRef.current) {
        isTransitioningRef.current = true;
        
        // Passer à l'image suivante
        setCurrentImageIndex((prev) => (prev + 1) % projectImages.length);
        
        // Réinitialiser le flag de transition après l'animation CSS
        setTimeout(() => {
          isTransitioningRef.current = false;
        }, 600);
      }
    }, displayDuration);

    // Nettoyage
    return () => {
      if (slideIntervalRef.current) {
        clearTimeout(slideIntervalRef.current);
        slideIntervalRef.current = null;
      }
    };
  }, [currentImageIndex, projectImages, selectedIndex]);

  const handleImageClick = (index: number) => {
    if (index !== selectedIndex) {
      setSelectedIndex(index);
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
      symfony: "https://res.cloudinary.com/dwpbyyhoq/image/upload/symfony_t74k8y.webp"
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
      symfony: "Symfony"
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
        {/* Slider d'images en haut */}
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
              return (
                <div
                  key={project.id}
                  className={`${styles.sliderImage} ${
                    index === selectedIndex ? styles.sliderImageActive : ""
                  } ${isGif(firstImage) ? styles.sliderImageGif : ""}`}
                  onClick={() => handleImageClick(index)}
                >
                  <img src={firstImage} alt={project.title} />
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

        {/* Contenu du projet sélectionné */}
        <div className={styles.projectContent}>
          {/* Image principale avec transition crossfade */}
          <div className={styles.projectMainImage}>
            {projectImages.map((imgSrc, index) => (
              <img 
                key={`${selectedProject.id}-${index}`}
                src={imgSrc} 
                alt={`${selectedProject.title} - Image ${index + 1}`}
                className={`${styles.slideshowImage} ${
                  index === currentImageIndex ? styles.slideshowImageActive : ''
                }`}
                style={{
                  position: index === 0 ? 'relative' : 'absolute',
                  top: index === 0 ? 'auto' : 0,
                  left: index === 0 ? 'auto' : 0,
                  width: '100%', // Toujours 100% pour éviter l'espace à droite
                  height: '100%',
                  maxWidth: '100%',
                  objectFit: 'cover'
                }}
              />
            ))}
          </div>

          {/* Détails du projet */}
          <div className={styles.projectDetails}>
            <h2 className={styles.projectTitle}>{selectedProject.title}</h2>
            <p className={styles.projectDescription}>{selectedProject.description}</p>

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
                    >
                      {item.title}
                    </a>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className={styles.categoryLabel}>{categoryTitle}</div>
        </div>

        <button onClick={onBack} className={styles.backButton}>
          ← Retour
        </button>
      </div>
    </>
  );
};

export default SingleProject;