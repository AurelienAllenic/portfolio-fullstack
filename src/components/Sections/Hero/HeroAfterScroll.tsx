import { forwardRef, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "./heroAfterScroll.module.scss";

interface HeroAfterScrollProps {
  onReturnToHeroBefore?: () => void;
}

type LinkText = {
  beforeLink: string;
  linkText: string;
  linkHref: string;
  afterLink: string | string[];
};

type TextContent = string | LinkText;

const HeroAfterScroll = forwardRef<HTMLDivElement, HeroAfterScrollProps>(
  ({ onReturnToHeroBefore }, ref) => {
    const iconContainers = useRef<(HTMLDivElement | null)[]>([]);
    const textRef = useRef<HTMLParagraphElement | null>(null);
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const lastTouchY = useRef<number | null>(null); // Suivi de la position Y pour touch

    const [textIndex, setTextIndex] = useState(0);
    const [scrollLocked, setScrollLocked] = useState(false);
    const firstRender = useRef(true);

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

    // Throttle pour limiter la fréquence des événements touch
    const throttle = (func: Function, limit: number) => {
      let inThrottle: boolean;
      return function (...args: any[]) {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    };

    // Apparition progressive des icônes
    useEffect(() => {
      const timeouts = iconContainers.current.map((container, index) => {
        const delay = 0.5 + index * 0.1;
        return setTimeout(() => {
          if (container) container.classList.add(styles.appeared);
        }, (delay + 0.8) * 1000);
      });
      return () => timeouts.forEach(clearTimeout);
    }, []);

    // Gestion des interactions (wheel + touch)
    useEffect(() => {
      const handleInteraction = (direction: "up" | "down") => {
        if (scrollLocked) {
          window.scrollTo(0, 0);
          return;
        }

        const isAtTop = window.scrollY === 0;
        if (!isAtTop) return;

        // 🔽 Texte suivant
        if (direction === "down" && textIndex < texts.length - 1) {
          window.scrollTo(0, 0);
          setScrollLocked(true);
          document.body.style.overflow = "hidden";

          const tl = gsap.timeline({
            onComplete: () => {
              setTimeout(() => {
                setScrollLocked(false);
                document.body.style.overflow = "auto";
              }, 500);
            },
          });

          tl.to(textRef.current, { opacity: 0, duration: 0.5 })
            .add(() => setTextIndex((prev) => prev + 1))
            .to(textRef.current, { opacity: 1, duration: 0.5 });
        }

        // 🔼 Texte précédent
        else if (direction === "up") {
          window.scrollTo(0, 0);
          setScrollLocked(true);
          document.body.style.overflow = "hidden";

          const tl = gsap.timeline({
            onComplete: () => {
              setTimeout(() => {
                setScrollLocked(false);
                document.body.style.overflow = "auto";
              }, 500);
            },
          });

          if (textIndex > 0) {
            tl.to(textRef.current, { opacity: 0, duration: 0.5 })
              .add(() => setTextIndex((prev) => prev - 1))
              .to(textRef.current, { opacity: 1, duration: 0.5 });
          } else if (textIndex === 0) {
            tl.to(textRef.current, { opacity: 0, duration: 0.5 }).add(() => {
              onReturnToHeroBefore?.();
            });
          }
        }
      };

      // Gestion des événements wheel (desktop)
      const handleWheel = (e: WheelEvent) => {
        const direction = e.deltaY > 0 ? "down" : "up";
        if (scrollLocked) e.preventDefault();
        handleInteraction(direction);
      };

      // Gestion des événements tactiles (mobile)
      const handleTouchStart = (e: TouchEvent) => {
        lastTouchY.current = e.touches[0].clientY;
      };

      const handleTouchMove = throttle((e: TouchEvent) => {
        if (lastTouchY.current === null) return;
        const currentY = e.touches[0].clientY;
        const deltaY = lastTouchY.current - currentY;
        const direction = deltaY > 0 ? "down" : "up";
        if (scrollLocked) e.preventDefault();
        handleInteraction(direction);
        lastTouchY.current = currentY;
      }, 16); // 16ms ≈ 60fps

      window.addEventListener("wheel", handleWheel, { passive: false });
      window.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      window.addEventListener("touchmove", handleTouchMove, { passive: false });

      return () => {
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
      };
    }, [textIndex, scrollLocked, onReturnToHeroBefore]);

    // Animation d’apparition du texte + effet radial dynamique
    useEffect(() => {
      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          {
            opacity: 0,
            y: firstRender.current ? 20 : 100,
            delay: firstRender.current ? 1 : 0,
          },
          {
            opacity: 1,
            y: 0,
            duration: firstRender.current ? 0.8 : 0.5,
            ease: "power2.ease-out",
            delay: firstRender.current ? 1 : 0,
            onComplete: () => {
              firstRender.current = false;
            },
          }
        );
      }

      // 🌑 Transition du rayon du gradient
      if (overlayRef.current) {
        const totalTexts = texts.length - 1;
        const progress = textIndex / totalTexts;

        // Détermine la taille du radial : 100% → 0%
        const gradientSize = 100 - progress * 66.66;

        gsap.to(overlayRef.current, {
          "--gradient-size": `${gradientSize}%`,
          duration: 1.2,
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
        {/* 🌗 Overlay dynamique */}
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
                <>
                  {(texts[textIndex] as LinkText).beforeLink}
                  <a
                    href={(texts[textIndex] as LinkText).linkHref}
                    className={styles.linkSubtitle}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {(texts[textIndex] as LinkText).linkText}
                  </a>
                  {Array.isArray((texts[textIndex] as LinkText).afterLink)
                    ? (
                        (texts[textIndex] as LinkText).afterLink as string[]
                      ).map((line: string, i: number) => (
                        <span key={i}>
                          {line}
                          <br />
                        </span>
                      ))
                    : (texts[textIndex] as LinkText).afterLink}
                </>
              )}
            </p>
          </div>

          <div className={styles.contentRight}>
            {allIcons.map((icon, index) => (
              <div
                key={index}
                ref={(el) => (iconContainers.current[index] = el)}
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
