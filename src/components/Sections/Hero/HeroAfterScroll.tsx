import { forwardRef, useEffect, useRef, useState } from "react";
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
  ({ onReturnToHeroBefore, onTransitionToProjects, returnFromProjects }, ref) => {
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
    const [textIndex, setTextIndex] = useState(returnFromProjects ? texts.length - 1 : 0);
    const [scrollLocked, setScrollLocked] = useState(false);
    const [allAnimationsComplete, setAllAnimationsComplete] = useState(returnFromProjects);
    const firstRender = useRef(true);

    // Apparition progressive des icônes
    useEffect(() => {
      const timeouts = iconContainers.current.map((container, index) => {
        const delay = 0.5 + index * 0.1;
        return setTimeout(() => {
          if (container) container.classList.add(styles.appeared);
        }, (delay + 0.8) * 1000);
      });

      // Détecter quand toutes les animations sont terminées
      const lastIconDelay = 0.5 + (iconContainers.current.length - 1) * 0.1 + 0.8;
      const allAnimationsTimeout = setTimeout(() => {
        console.log("Toutes les animations sont terminées !");
        setAllAnimationsComplete(true);
      }, (lastIconDelay + 1) * 1000);

      return () => {
        timeouts.forEach(clearTimeout);
        clearTimeout(allAnimationsTimeout);
      };
    }, []);

    // Fonction pour changer le texte avec animation
    const changeText = (nextIndex: number, callback?: () => void) => {
      setScrollLocked(true);
      document.body.style.overflow = "hidden";
      gsap
        .timeline({
          onComplete: () => {
            setScrollLocked(false);
            callback?.();
          },
        })
        .to(textRef.current, { opacity: 0, duration: 0.5 })
        .add(() => setTextIndex(nextIndex))
        .to(textRef.current, { opacity: 1, duration: 0.5 });
    };

    // Gestion du scroll
    useEffect(() => {
      let timeoutId: number | null = null;

      const handleWheel = (e: WheelEvent) => {
        if (scrollLocked || timeoutId) {
          e.preventDefault();
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
          console.log("Scroll vers le bas au dernier texte - textIndex:", textIndex, "allAnimationsComplete:", allAnimationsComplete);
          if (allAnimationsComplete) {
            // Déclencher la transition vers Projects
            console.log("Condition remplie : Déclenchement de la transition vers Projects !");
            e.preventDefault();
            onTransitionToProjects?.();
          } else {
            console.log("Animations pas encore terminées, on attend...");
          }
        } else if (goingUp) {
          e.preventDefault();
          if (textIndex > 0) changeText(textIndex - 1);
          else changeText(0, onReturnToHeroBefore);
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
    }, [textIndex, scrollLocked, onReturnToHeroBefore]);

    // Gestion du swipe touch
    const touchStartY = useRef<number | null>(null);

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null || scrollLocked) return;
      const deltaY = touchStartY.current - e.touches[0].clientY;
      if (window.scrollY !== 0) return;

      if (deltaY > 30 && textIndex < texts.length - 1) {
        e.preventDefault();
        changeText(textIndex + 1);
        touchStartY.current = e.touches[0].clientY;
      } else if (deltaY > 30 && textIndex === texts.length - 1 && allAnimationsComplete) {
        // Déclencher la transition vers Projects
        e.preventDefault();
        onTransitionToProjects?.();
      } else if (deltaY < -30) {
        e.preventDefault();
        if (textIndex > 0) changeText(textIndex - 1);
        else changeText(0, onReturnToHeroBefore);
        touchStartY.current = e.touches[0].clientY;
      }
    };

    useEffect(() => {
      window.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", () => (touchStartY.current = null));

      return () => {
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener(
          "touchend",
          () => (touchStartY.current = null)
        );
      };
    }, [textIndex, scrollLocked, onReturnToHeroBefore]);

    // Animation texte + overlay
    useEffect(() => {
      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { opacity: 0, y: firstRender.current ? 20 : 100 },
          {
            opacity: 1,
            y: 0,
            duration: firstRender.current ? 0.8 : 0.5,
            ease: "power2.out",
            delay: firstRender.current ? 1 : 0,
            onComplete: () => {
              firstRender.current = false;
            },
          }
        );
      }

      if (overlayRef.current) {
        const progress = textIndex / (texts.length - 1);
        gsap.to(overlayRef.current, {
          "--gradient-size": `${100 - progress * 75}%`,
          duration: 0.5,
          ease: "power2.out",
        });
      }
    }, [textIndex]);

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
    ];

    return (
      <div ref={ref} className={styles.containerHeroAfterScroll}>
        <div
          ref={overlayRef}
          className={styles.gradientOverlay}
          style={{ "--gradient-size": "100%" } as React.CSSProperties}
        />
        <div className={styles.contentContainer}>
          <div className={styles.contentLeft}>
            <h2 className={styles.titleLeft}>
              Mon <span className={styles.titleLeftHighlight}>PARCOURS</span>
            </h2>
            <p
              ref={textRef}
              className={`${styles.subtitle} ${
                textIndex === 2
                  ? styles.mediumSubtitle
                  : textIndex === 3
                  ? styles.largeSubtitle
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
          <div className={styles.contentRight}>
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
        </div>
      </div>
    );
  }
);

HeroAfterScroll.displayName = "HeroAfterScroll";
export default HeroAfterScroll;
