import { forwardRef, useEffect, useRef, useState, useLayoutEffect } from "react";
import { gsap } from "gsap";
import styles from "./heroAfterScroll.module.scss";

interface HeroAfterScrollProps {
  onReturnToHeroBefore?: () => void;
  onTransitionToProjects?: () => void;
  returnFromProjects?: boolean;
  isForced?: boolean;
  forceTextIndex?: number; // Pour forcer un textIndex spécifique lors de la navigation
  onNavigationReset?: boolean; // Signal pour réinitialiser les refs après navigation
}

type LinkText = {
  beforeLink: string;
  linkText: string;
  linkHref: string;
  afterLink: string | string[];
};

type TextContent = string | LinkText;

const HeroAfterScroll = forwardRef<HTMLDivElement, HeroAfterScrollProps>(
  (
    { onReturnToHeroBefore, onTransitionToProjects, returnFromProjects, isForced, forceTextIndex, onNavigationReset },
    ref
  ) => {
    const texts: TextContent[] = [
      "Depuis 2021, je me forme au développement web fullStack. Mes technologies de prédilection sont ReactJs avec NodeJs.",
      {
        beforeLink:
          "Je suis titulaire d'un mastère en développement web fullstack à ",
        linkText: "l'IIM Digital School",
        linkHref: "https://www.iim.fr/",
        afterLink: " du pôle Léonard de Vinci.",
      },
      {
        beforeLink:
          "Pendant ces deux années de mastère, j'ai réalisé une alternance chez ",
        linkText: "Solead agency",
        linkHref: "https://soleadagency.com",
        afterLink:
          " en tant que développeur web. Travaillant à la fois sur du front et du back",
      },
      {
        beforeLink: "J'ai également suivi trois formations ",
        linkText: "OpenClassrooms",
        linkHref: "https://openclassrooms.com/",
        afterLink: [
          ":",
          "Développeur Web,",
          "Développeur d'application - JavaScript/React,",
          "Développeur d'application - Python.",
        ],
      },
    ];

    const iconContainers = useRef<(HTMLDivElement | null)[]>([]);
    const textRef = useRef<HTMLParagraphElement | null>(null);
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const contentContainerRef = useRef<HTMLDivElement | null>(null);
    const [textIndex, setTextIndex] = useState(
      forceTextIndex !== undefined ? forceTextIndex : (returnFromProjects ? texts.length - 1 : (isForced ? 0 : 0))
    );

    const [scrollLocked, setScrollLocked] = useState(false);
    const [allAnimationsComplete, setAllAnimationsComplete] =
      useState(returnFromProjects || isForced || forceTextIndex !== undefined);
    const [direction, setDirection] = useState<"up" | "down">("down");
    const firstRender = useRef(true);
    const hasTriggeredSwipe = useRef(false);
    const wasNavigationReset = useRef(false);
    const contentRightRef = useRef<HTMLDivElement | null>(null);
    const iconsWrapperRef = useRef<HTMLDivElement | null>(null);
    const scrollAnimationRef = useRef<gsap.core.Timeline | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Détecter si on est en mobile
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Gérer la réinitialisation lors de la navigation par liens
    useEffect(() => {
      if (onNavigationReset && !wasNavigationReset.current) {
        wasNavigationReset.current = true;
        
        // Réinitialiser les refs critiques
        firstRender.current = false; // Important : ne pas rejouer l'animation d'entrée
        hasTriggeredSwipe.current = false;
        setScrollLocked(false);
        
        // Forcer le textIndex si spécifié
        if (forceTextIndex !== undefined) {
          setTextIndex(forceTextIndex);
          setDirection(forceTextIndex === 0 ? "down" : "up");
        }
        
        // S'assurer que les animations sont considérées comme complètes
        setAllAnimationsComplete(true);
        
        // Réinitialiser le flag après un court délai
        setTimeout(() => {
          wasNavigationReset.current = false;
        }, 100);
      }
    }, [onNavigationReset, forceTextIndex]);

    useLayoutEffect(() => {
      if (textRef.current) {
        textRef.current.style.setProperty('animation', 'none', 'important');
        gsap.set(textRef.current, { opacity: 0, y: 0 });
      }
    }, []);

    useEffect(() => {
      if (returnFromProjects && contentContainerRef.current) {
        gsap.fromTo(
          contentContainerRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: "power2.out" }
        );
        
        if (textRef.current) {
          textRef.current.style.setProperty('animation', 'none', 'important');
          textRef.current.style.setProperty('opacity', '0', 'important');
        }
      }
    }, [returnFromProjects]);

    useEffect(() => {
      const timeouts = iconContainers.current.map((container, index) => {
        const delay = 0.5 + index * 0.1;
        return setTimeout(() => {
          if (container) container.classList.add(styles.appeared);
        }, (delay + 0.8) * 1000);
      });

      const lastIconDelay =
        0.5 + (iconContainers.current.length - 1) * 0.1 + 0.8;

      const allAnimationsTimeout = setTimeout(() => {
        setAllAnimationsComplete(true);
      }, (lastIconDelay + 1) * 1000);

      return () => {
        timeouts.forEach(clearTimeout);
        clearTimeout(allAnimationsTimeout);
      };
    }, []);

    useEffect(() => {
      if (overlayRef.current) {
        const initialProgress = textIndex / (texts.length - 1);
        const initialTarget = `${100 - initialProgress * 75}%`;
        if (returnFromProjects) {
          gsap.to(overlayRef.current, {
            "--gradient-size": initialTarget,
            duration: 0.5,
            ease: "power2.out",
          });
        } else {
          gsap.set(overlayRef.current, { "--gradient-size": initialTarget });
        }
      }
    }, []);

    // Animation de défilement automatique infini avec tooltips
    useEffect(() => {
      // Nettoyer l'animation précédente si elle existe
      if (scrollAnimationRef.current) {
        scrollAnimationRef.current.kill();
        scrollAnimationRef.current = null;
      }

      // Nettoyer les icônes dupliquées si elles existent
      if (iconsWrapperRef.current) {
        const wrapper = iconsWrapperRef.current;
        const allIcons = wrapper.querySelectorAll(`.${styles.iconContainer}`);
        // Supprimer les icônes dupliquées (celles après les originales)
        if (allIcons.length > allIcons.length / 2) {
          Array.from(allIcons).slice(allIcons.length / 2).forEach((icon) => {
            if (icon.parentNode) {
              icon.parentNode.removeChild(icon);
            }
          });
        }
      }

      if (!isMobile || !iconsWrapperRef.current || !contentRightRef.current) {
        return;
      }

      // Attendre un peu que les icônes soient rendues, mais pas trop longtemps
      const checkAndStart = () => {
        const wrapper = iconsWrapperRef.current;
        const container = contentRightRef.current;
        if (!wrapper || !container) return;

        const icons = wrapper.querySelectorAll(`.${styles.iconContainer}`);
        if (icons.length === 0) {
          setTimeout(checkAndStart, 50);
          return;
        }

        // Vérifier si au moins une icône a une largeur (est rendue)
        const firstIcon = icons[0] as HTMLElement;
        if (firstIcon.offsetWidth === 0) {
          setTimeout(checkAndStart, 50);
          return;
        }

        // Lancer l'animation même si toutes les animations d'apparition ne sont pas terminées
        startScrollAnimation();
      };

      const startScrollAnimation = () => {
        const wrapper = iconsWrapperRef.current;
        const container = contentRightRef.current;
        if (!wrapper || !container) return;

        const icons = wrapper.querySelectorAll(`.${styles.iconContainer}`);
        if (icons.length === 0) return;

        // Calculer la largeur totale nécessaire pour la boucle
        let totalWidth = 0;
        icons.forEach((icon) => {
          totalWidth += (icon as HTMLElement).offsetWidth + 25; // 25px = gap
        });

        if (totalWidth === 0) {
          // Réessayer après un court délai si les largeurs ne sont pas encore calculées
          setTimeout(startScrollAnimation, 50);
          return;
        }

        // Dupliquer les icônes pour créer une boucle infinie
        const duplicateIcons: HTMLElement[] = [];
        Array.from(icons).forEach((icon) => {
          const clone = icon.cloneNode(true) as HTMLElement;
          wrapper.appendChild(clone);
          duplicateIcons.push(clone);
        });

        // Position initiale
        gsap.set(wrapper, { x: 0 });

        // Animation de défilement infini
        const scrollTimeline = gsap.timeline({ repeat: -1 });
        scrollTimeline.to(wrapper, {
          x: -totalWidth,
          duration: totalWidth / 30, // Vitesse de défilement (ajustable)
          ease: "none",
          onUpdate: () => {
            const currentX = gsap.getProperty(wrapper, "x") as number;
            
            // Réinitialiser la position pour créer la boucle
            if (Math.abs(currentX) >= totalWidth) {
              gsap.set(wrapper, { x: 0 });
              scrollTimeline.progress(0);
            }

            // Animer les tooltips au fur et à mesure
            const allIconsElements = wrapper.querySelectorAll(`.${styles.iconContainer}`);
            allIconsElements.forEach((iconEl) => {
              const iconRect = (iconEl as HTMLElement).getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              const iconCenterX = iconRect.left + iconRect.width / 2;
              const containerCenterX = containerRect.left + containerRect.width / 2;
              const distanceFromCenter = Math.abs(iconCenterX - containerCenterX);
              const maxDistance = containerRect.width / 2;

              // Afficher le tooltip si l'icône est proche du centre
              const tooltip = iconEl.querySelector(`.${styles.tooltip}`) as HTMLElement;
              if (tooltip) {
                if (distanceFromCenter < maxDistance * 0.5) {
                  const opacity = Math.max(0, 1 - (distanceFromCenter / (maxDistance * 0.5)));
                  // Utiliser set pour éviter les conflits avec les transitions CSS
                  gsap.set(tooltip, {
                    opacity: opacity,
                    y: 9 * (1 - opacity),
                    force3D: true,
                    immediateRender: true
                  });
                } else {
                  gsap.set(tooltip, {
                    opacity: 0,
                    y: 9,
                    force3D: true,
                    immediateRender: true
                  });
                }
              }
            });
          }
        });

        scrollAnimationRef.current = scrollTimeline;
      };

      // Démarrer la vérification immédiatement
      checkAndStart();

      return () => {
        if (scrollAnimationRef.current) {
          scrollAnimationRef.current.kill();
          scrollAnimationRef.current = null;
        }
        // Nettoyer les icônes dupliquées
        if (iconsWrapperRef.current) {
          const wrapper = iconsWrapperRef.current;
          const allIcons = wrapper.querySelectorAll(`.${styles.iconContainer}`);
          const originalCount = allIcons.length / 2;
          Array.from(allIcons).slice(originalCount).forEach((icon) => {
            if (icon.parentNode) {
              icon.parentNode.removeChild(icon);
            }
          });
        }
      };
    }, [isMobile]);

    const changeText = (nextIndex: number, callback?: () => void) => {
      const newDirection = nextIndex > textIndex ? "down" : "up";
      setScrollLocked(true);
      document.body.style.overflow = "hidden";
      gsap
        .timeline({
          onComplete: () => {
            setScrollLocked(false);
            document.body.style.overflow = "";
            callback?.();
          },
        })
        .to(textRef.current, { opacity: 0, duration: 0.5 })
        .add(() => {
          setDirection(newDirection);
          setTextIndex(nextIndex);
        })
        .to(textRef.current, { opacity: 1, duration: 0.5 });
    };

    useEffect(() => {
      let timeoutId: number | null = null;

      const handleWheel = (e: WheelEvent) => {
        // Vérifier si la modale CV est ouverte
        if (document.body.getAttribute("data-modal-open") === "true") {
          return;
        }
        
        if (scrollLocked || timeoutId) {
          e.preventDefault();
          return;
        }

        // Ignorer les scrolls horizontaux (deltaX plus grand que deltaY)
        // Cela permet de scroller dans les icônes sans déclencher les transitions
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          return;
        }

        const isAtTop = window.scrollY === 0;
        if (!isAtTop) return;

        const goingDown = e.deltaY > 0;
        const goingUp = e.deltaY < 0;

        if (goingDown && textIndex < texts.length - 1) {
          e.preventDefault();
          changeText(textIndex + 1);
        } else if (goingDown && textIndex === texts.length - 1) {
          if (allAnimationsComplete) {
            e.preventDefault();
            setScrollLocked(true);
            const tl = gsap.timeline({
              onComplete: () => {
                onTransitionToProjects?.();
              },
            });
            tl.to(overlayRef.current, {
              "--gradient-size": "0%",
              duration: 0.5,
              ease: "power2.out",
            });
            tl.to(
              contentContainerRef.current,
              { opacity: 0, duration: 0.5, ease: "power2.out" },
              "-=0.5"
            );
          }
        } else if (goingUp) {
          e.preventDefault();
          if (textIndex > 0) {
            changeText(textIndex - 1);
          } else {
            setScrollLocked(true);
            onReturnToHeroBefore?.();
          }
        }

        timeoutId = setTimeout(() => {
          timeoutId = null;
        }, 100);
      };

      window.addEventListener("wheel", handleWheel, { passive: false });
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        window.removeEventListener("wheel", handleWheel);
      };
    }, [
      textIndex,
      scrollLocked,
      onReturnToHeroBefore,
      allAnimationsComplete,
      onTransitionToProjects,
    ]);

    const touchStartY = useRef<number | null>(null);
    const touchStartX = useRef<number | null>(null);

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
      hasTriggeredSwipe.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Vérifier si la modale CV est ouverte
      if (document.body.getAttribute("data-modal-open") === "true") {
        return;
      }
      
      if (
        touchStartY.current === null ||
        touchStartX.current === null ||
        scrollLocked ||
        hasTriggeredSwipe.current
      )
        return;
      
      const deltaY = touchStartY.current - e.touches[0].clientY;
      const deltaX = touchStartX.current - e.touches[0].clientX;
      
      // Ignorer les scrolls horizontaux (deltaX plus grand que deltaY)
      // Cela permet de scroller dans les icônes sans déclencher les transitions
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return;
      }
      
      if (window.scrollY !== 0) return;

      if (deltaY > 30 && textIndex < texts.length - 1) {
        e.preventDefault();
        changeText(textIndex + 1);
        hasTriggeredSwipe.current = true;
        touchStartY.current = e.touches[0].clientY;
      } else if (
        deltaY > 30 &&
        textIndex === texts.length - 1 &&
        allAnimationsComplete
      ) {
        e.preventDefault();
        setScrollLocked(true);
        const tl = gsap.timeline({
          onComplete: () => {
            onTransitionToProjects?.();
          },
        });
        tl.to(overlayRef.current, {
          "--gradient-size": "0%",
          duration: 0.5,
          ease: "power2.out",
        });
        tl.to(
          contentContainerRef.current,
          { opacity: 0, duration: 0.5, ease: "power2.out" },
          "-=0.5"
        );
        hasTriggeredSwipe.current = true;
        touchStartY.current = e.touches[0].clientY;
      } else if (deltaY < -30) {
        e.preventDefault();
        if (textIndex > 0) {
          changeText(textIndex - 1);
        } else {
          setScrollLocked(true);
          onReturnToHeroBefore?.();
        }
        hasTriggeredSwipe.current = true;
        touchStartY.current = e.touches[0].clientY;
      }
    };

    useEffect(() => {
      window.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", () => {
        touchStartY.current = null;
        touchStartX.current = null;
      });

      return () => {
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", () => {
          touchStartY.current = null;
          touchStartX.current = null;
        });
      };
    }, [
      textIndex,
      scrollLocked,
      onReturnToHeroBefore,
      allAnimationsComplete,
      onTransitionToProjects,
    ]);

    // Réinitialiser textIndex à 0 si isForced et rendre tout visible immédiatement
    useEffect(() => {
      if (isForced) {
        // Réinitialiser à 0 si nécessaire
        if (textIndex !== 0) {
          setTextIndex(0);
        }
        
        firstRender.current = true;
        setAllAnimationsComplete(true);
        
        // Rendre le conteneur principal visible IMMÉDIATEMENT
        const containerElement = ref && typeof ref === 'object' && ref.current ? ref.current : null;
        if (containerElement) {
          gsap.set(containerElement, { opacity: 1 });
        }
        
        // Rendre le contentContainer visible IMMÉDIATEMENT
        if (contentContainerRef.current) {
          gsap.set(contentContainerRef.current, { opacity: 1 });
        }
        
        // Déclencher l'animation du texte avec le délai normal
        setTimeout(() => {
          if (textRef.current) {
            gsap.set(textRef.current, { opacity: 0, y: 20 });
            gsap.fromTo(
              textRef.current,
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                delay: 1.2, // Délai comme dans le premier render
                onComplete: () => {
                  firstRender.current = false;
                },
              }
            );
          }
        }, 50);
      }
    }, [isForced, ref]);

    useEffect(() => {
      // Si on revient de Projects, animer le texte IMMÉDIATEMENT
      if (returnFromProjects && textIndex === texts.length - 1) {
        if (textRef.current) {
          console.log('🎬 [HEROAFTERSCROLL] returnFromProjects - animating text');
          // Désactiver l'animation CSS
          textRef.current.style.setProperty('animation', 'none', 'important');
          // Animer le texte avec GSAP
          gsap.fromTo(
            textRef.current,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
              delay: 0.5, // Petit délai pour que le gradient soit visible
            }
          );
        }
        return;
      }

      if (textRef.current) {
        console.log('🎬 [HEROAFTERSCROLL] Normal text animation - textIndex:', textIndex);
        gsap.set(textRef.current, { opacity: 0 });
        
        const yFrom = firstRender.current
          ? 20
          : direction === "down"
          ? 100
          : -100;
        
        gsap.fromTo(
          textRef.current,
          { opacity: 0, y: yFrom },
          {
            opacity: 1,
            y: 0,
            duration: firstRender.current ? 0.8 : 0.5,
            ease: "power2.out",
            delay: firstRender.current ? 1.2 : 0,
            onComplete: () => {
              firstRender.current = false;
            },
          }
        );
      }

      // TOUJOURS animer le gradient lors du changement de texte
      if (overlayRef.current) {
        const progress = textIndex / (texts.length - 1);
        console.log('🎨 [HEROAFTERSCROLL] Animating gradient - textIndex:', textIndex, 'progress:', progress, 'target:', `${100 - progress * 75}%`);
        gsap.to(overlayRef.current, {
          "--gradient-size": `${100 - progress * 75}%`,
          duration: 0.5,
          ease: "power2.out",
        });
      }
    }, [textIndex, direction, returnFromProjects]);

    const allIcons = [
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/html_yzkdbv.webp",
        name: "HTML",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/css_ldbn4p.webp",
        name: "CSS",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/scss_f6hkzy.webp",
        name: "SCSS",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/js_cbaqmr.webp",
        name: "JavaScript",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/react_jzelsd.webp",
        name: "React",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/next_ep27nk.webp",
        name: "Next.js",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/nodejs_lqsesq.webp",
        name: "Node.js",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/python_ldgrbv.webp",
        name: "Python",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/django_dyc8kz.webp",
        name: "Django",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/wordpress-icon_ngq76k.webp",
        name: "Wordpress",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/mongodb-icon_bsizyi.webp",
        name: "MongoDb",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/docker-icon_vwrf7p.webp",
        name: "Docker",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/prisma-icon_vgbfdr.webp",
        name: "Prisma",
      },
    ];

    return (
      <div
        ref={ref}
        className={styles.containerHeroAfterScroll}
        style={{ opacity: 0 }}
      >
        <div ref={overlayRef} className={styles.gradientOverlay} />
        <div ref={contentContainerRef} className={styles.contentContainer}>
          <div className={styles.contentLeft}>
            <h2 className={styles.titleLeft}>
              Mon <span className={styles.titleLeftHighlight}>PARCOURS</span>
            </h2>
            <div className={styles.containerSubtitle}>
              <p
                ref={textRef}
                className={`${styles.subtitle} ${
                  textIndex === 2
                    ? styles.mediumSubtitle
                    : textIndex === 3
                    ? styles.largeSubtitle
                    : ""
                } ${
                  returnFromProjects && textIndex === texts.length - 1
                    ? styles.noAnimation
                    : ""
                }`}
              >
                {typeof texts[textIndex] === "string" ? (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: texts[textIndex] as string,
                    }}
                  />
                ) : (
                  (() => {
                    const text = texts[textIndex] as LinkText;
                    return (
                      <>
                        {text.beforeLink}
                        <a
                          href={text.linkHref}
                          className={styles.linkSubtitle}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {text.linkText}
                        </a>
                        {Array.isArray(text.afterLink) ? (
                          text.afterLink.map((line, i) => (
                            <span key={i}>
                              {line}
                              <br />
                            </span>
                          ))
                        ) : (
                          <span>{text.afterLink}</span>
                        )}
                      </>
                    );
                  })()
                )}
              </p>
            </div>
          </div>
          <div className={styles.iconsWrapper}>
            <div 
              ref={contentRightRef}
              className={styles.contentRight}
              onTouchStart={(e) => {
                // Enregistrer la position initiale pour détecter le type de scroll
                if (isMobile && e.touches.length > 0) {
                  touchStartX.current = e.touches[0].clientX;
                  touchStartY.current = e.touches[0].clientY;
                }
              }}
              onTouchMove={(e) => {
                // Bloquer uniquement le scroll horizontal, laisser passer le vertical
                if (isMobile && e.touches.length > 0 && touchStartX.current !== null && touchStartY.current !== null) {
                  const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
                  const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
                  
                  // Si c'est un scroll horizontal (deltaX > deltaY), empêcher la propagation
                  // Sinon, laisser passer pour le scroll vertical
                  if (deltaX > deltaY && deltaX > 10) {
                    e.stopPropagation();
                  }
                }
              }}
            >
              {isMobile ? (
                <div 
                  ref={iconsWrapperRef} 
                  style={{ display: 'flex', gap: '25px', willChange: 'transform' }}
                >
                  {allIcons.map((icon, index) => (
                    <div
                      key={index}
                      ref={(el) => {
                        iconContainers.current[index] = el;
                      }}
                      className={styles.iconContainer}
                    >
                      <img
                        src={icon.src}
                        alt={icon.name}
                        className={styles.icon}
                        style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                      />
                      <span
                        className={`${styles.tooltip} ${
                          index < 6 ? styles.tooltipTop : styles.tooltipBottom
                        }`}
                      >
                        {icon.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {allIcons.map((icon, index) => (
                    <div
                      key={index}
                      ref={(el) => {
                        iconContainers.current[index] = el;
                      }}
                      className={styles.iconContainer}
                    >
                      <img
                        src={icon.src}
                        alt={icon.name}
                        className={styles.icon}
                        style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                      />
                      <span
                        className={`${styles.tooltip} ${
                          index < 6 ? styles.tooltipTop : styles.tooltipBottom
                        }`}
                      >
                        {icon.name}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

HeroAfterScroll.displayName = "HeroAfterScroll";
export default HeroAfterScroll;
