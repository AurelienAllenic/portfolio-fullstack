import { forwardRef, useEffect, useRef, useState, useLayoutEffect } from "react";
import { gsap } from "gsap";
import styles from "./heroAfterScroll.module.scss";

interface HeroAfterScrollProps {
  onReturnToHeroBefore?: () => void;
  onTransitionToProjects?: () => void;
  returnFromProjects?: boolean;
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
    { onReturnToHeroBefore, onTransitionToProjects, returnFromProjects },
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
      returnFromProjects ? texts.length - 1 : 0
    );

    const [scrollLocked, setScrollLocked] = useState(false);
    const [allAnimationsComplete, setAllAnimationsComplete] =
      useState(returnFromProjects);
    const [direction, setDirection] = useState<"up" | "down">("down");
    const firstRender = useRef(true);
    const hasTriggeredSwipe = useRef(false);
    const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);
    const contentRightRef = useRef<HTMLDivElement | null>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const leftArrowRef = useRef<HTMLButtonElement | null>(null);
    const rightArrowRef = useRef<HTMLButtonElement | null>(null);

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
      
      // Animer les flèches après toutes les icônes
      const arrowsAnimationDelay = (lastIconDelay + 0.8) * 1000; // Après la dernière icône + 0.8s
      const arrowsTimeout = setTimeout(() => {
        // Vérifier si les flèches doivent être affichées et les animer
        if (contentRightRef.current && window.innerWidth <= 768) {
          const container = contentRightRef.current;
          const scrollLeft = container.scrollLeft;
          const scrollWidth = container.scrollWidth;
          const clientWidth = container.clientWidth;

          if (scrollLeft > 0 && leftArrowRef.current) {
            gsap.to(leftArrowRef.current, {
              opacity: 1,
              duration: 0.5,
              ease: "power2.out",
            });
          }
          if (scrollLeft < scrollWidth - clientWidth - 1 && rightArrowRef.current) {
            gsap.to(rightArrowRef.current, {
              opacity: 1,
              duration: 0.5,
              ease: "power2.out",
            });
          }
        }
      }, arrowsAnimationDelay);

      const allAnimationsTimeout = setTimeout(() => {
        setAllAnimationsComplete(true);
      }, (lastIconDelay + 1) * 1000);

      return () => {
        timeouts.forEach(clearTimeout);
        clearTimeout(arrowsTimeout);
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

    // Fermer le tooltip quand on clique ailleurs
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent | TouchEvent) => {
        if (window.innerWidth <= 768 && activeTooltipIndex !== null) {
          const target = e.target as HTMLElement;
          if (!target.closest(`.${styles.iconContainer}`)) {
            setActiveTooltipIndex(null);
          }
        }
      };

      if (activeTooltipIndex !== null) {
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('touchend', handleClickOutside);
      }

      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('touchend', handleClickOutside);
      };
    }, [activeTooltipIndex]);

    // Gérer l'affichage des flèches selon la position du scroll
    useEffect(() => {
      const checkScrollPosition = () => {
        if (!contentRightRef.current || window.innerWidth > 768) {
          setShowLeftArrow(false);
          setShowRightArrow(false);
          if (leftArrowRef.current) gsap.set(leftArrowRef.current, { opacity: 0 });
          if (rightArrowRef.current) gsap.set(rightArrowRef.current, { opacity: 0 });
          return;
        }

        const container = contentRightRef.current;
        const scrollLeft = container.scrollLeft;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;

        const shouldShowLeft = scrollLeft > 0;
        const shouldShowRight = scrollLeft < scrollWidth - clientWidth - 1;

        // Animer l'apparition/disparition des flèches
        if (shouldShowLeft) {
          if (!showLeftArrow) {
            setShowLeftArrow(true);
          }
          if (leftArrowRef.current) {
            gsap.to(leftArrowRef.current, {
              opacity: 1,
              duration: 0.3,
              ease: "power2.out"
            });
          }
        } else {
          if (showLeftArrow) {
            setShowLeftArrow(false);
          }
          if (leftArrowRef.current) {
            gsap.to(leftArrowRef.current, {
              opacity: 0,
              duration: 0.3,
              ease: "power2.in"
            });
          }
        }

        if (shouldShowRight) {
          if (!showRightArrow) {
            setShowRightArrow(true);
          }
          if (rightArrowRef.current) {
            gsap.to(rightArrowRef.current, {
              opacity: 1,
              duration: 0.3,
              ease: "power2.out"
            });
          }
        } else {
          if (showRightArrow) {
            setShowRightArrow(false);
          }
          if (rightArrowRef.current) {
            gsap.to(rightArrowRef.current, {
              opacity: 0,
              duration: 0.3,
              ease: "power2.in"
            });
          }
        }
      };

      // Vérifier immédiatement au montage
      const initialCheck = setTimeout(() => {
        checkScrollPosition();
      }, 100);

      if (contentRightRef.current) {
        contentRightRef.current.addEventListener('scroll', checkScrollPosition);
        
        // Vérifier aussi au resize
        window.addEventListener('resize', checkScrollPosition);
      }

      return () => {
        clearTimeout(initialCheck);
        if (contentRightRef.current) {
          contentRightRef.current.removeEventListener('scroll', checkScrollPosition);
        }
        window.removeEventListener('resize', checkScrollPosition);
      };
    }, [showLeftArrow, showRightArrow]);

    const scrollIcons = (direction: 'left' | 'right') => {
      if (!contentRightRef.current) return;
      
      const container = contentRightRef.current;
      const scrollAmount = 200; // Distance de scroll en pixels
      const currentScroll = container.scrollLeft;
      
      container.scrollTo({
        left: direction === 'left' 
          ? currentScroll - scrollAmount 
          : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    };

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

    useEffect(() => {
      if (returnFromProjects && textIndex === texts.length - 1) {
        if (textRef.current) {
          // Désactiver l'animation CSS et forcer opacity: 0 avec !important
          textRef.current.style.setProperty('animation', 'none', 'important');
          textRef.current.style.setProperty('opacity', '0', 'important');
          gsap.set(textRef.current, { opacity: 0, y: 0 });
        }
        return;
      }

      if (textRef.current) {
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

      if (overlayRef.current && !returnFromProjects) {
        const progress = textIndex / (texts.length - 1);
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
            {showLeftArrow && (
              <button
                ref={leftArrowRef}
                className={styles.scrollArrowLeft}
                onClick={() => scrollIcons('left')}
                aria-label="Défiler vers la gauche"
              >
                ←
              </button>
            )}
            <div 
              ref={contentRightRef}
              className={styles.contentRight}
              onTouchStart={(e) => {
                // Empêcher la propagation si on touche dans la zone des icônes
                e.stopPropagation();
              }}
              onTouchMove={(e) => {
                // Empêcher la propagation du scroll horizontal
                e.stopPropagation();
              }}
            >
              {allIcons.map((icon, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    iconContainers.current[index] = el;
                  }}
                  className={`${styles.iconContainer} ${
                    activeTooltipIndex === index ? styles.tooltipActive : ""
                  }`}
                  onClick={() => {
                    // Toggle tooltip au clic en mobile
                    if (window.innerWidth <= 768) {
                      setActiveTooltipIndex(activeTooltipIndex === index ? null : index);
                    }
                  }}
                  onTouchEnd={(e) => {
                    // Empêcher la propagation pour ne pas déclencher les transitions
                    e.stopPropagation();
                    e.preventDefault();
                    // Afficher le tooltip au clic (touchEnd) en mobile
                    if (window.innerWidth <= 768) {
                      setActiveTooltipIndex(activeTooltipIndex === index ? null : index);
                    }
                  }}
                  onTouchStart={(e) => {
                    // Empêcher la propagation pour ne pas déclencher les transitions
                    e.stopPropagation();
                  }}
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
                    } ${activeTooltipIndex === index ? styles.tooltipVisible : ""}`}
                  >
                    {icon.name}
                  </span>
                </div>
              ))}
            </div>
            {showRightArrow && (
              <button
                ref={rightArrowRef}
                className={styles.scrollArrowRight}
                onClick={() => scrollIcons('right')}
                aria-label="Défiler vers la droite"
              >
                →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

HeroAfterScroll.displayName = "HeroAfterScroll";
export default HeroAfterScroll;
