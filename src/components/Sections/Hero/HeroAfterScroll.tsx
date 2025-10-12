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
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [textIndex, setTextIndex] = useState(0);
    const [scrollLocked, setScrollLocked] = useState(false);
    const firstRender = useRef(true);
    const touchStartY = useRef<number | null>(null);

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

    // Initial animations for icons and titles
    useEffect(() => {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;

      // Animate icons (from side on all devices)
      const icons = iconContainers.current;
      gsap.set(icons, { opacity: 0, x: -45 });
      icons.forEach((container, index) => {
        if (container) {
          gsap.to(container, {
            opacity: 1,
            x: 0,
            duration: 1,
            delay: 0.5 + index * 0.1 + 0.8,
            ease: "power2.out",
            onStart: () => {
              container.style.animation = "none"; // Disable CSS animation
            },
          });
        }
      });

      // Animate titles and subtitle
      const titles = containerRef.current?.querySelectorAll<HTMLElement>(
        `.${styles.titleLeft}, .${styles.titleLeftHighlight}, .${styles.subtitle}`
      );
      if (titles) {
        titles.forEach((el) => {
          el.style.animation = "none"; // Disable CSS animation
        });
        if (isDesktop) {
          gsap.set(titles, { opacity: 0, y: -45 });
          gsap.to(titles, {
            opacity: 1,
            y: 0,
            stagger: 0.2,
            delay: 0.5,
            duration: 1,
            ease: "power2.out",
          });
        } else {
          gsap.set(titles, { opacity: 0, x: -45 });
          gsap.to(titles, {
            opacity: 1,
            x: 0,
            stagger: 0.2,
            delay: 0.5,
            duration: 1,
            ease: "power2.out",
          });
        }
      }
    }, []);

    // Handle scroll and touch events
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
          setScrollLocked(true);
          document.body.style.overflow = "hidden";

          const tl = gsap.timeline({
            onComplete: () => {
              setScrollLocked(false);
              //document.body.style.overflow = "auto";
            },
          });

          tl.to(textRef.current, { opacity: 0, duration: 0.5 })
            .add(() => setTextIndex((prev) => prev + 1))
            .to(textRef.current, { opacity: 1, duration: 0.5 });
        } else if (goingUp) {
          e.preventDefault();
          setScrollLocked(true);
          document.body.style.overflow = "hidden";

          const tl = gsap.timeline({
            onComplete: () => {
              setScrollLocked(false);
              //document.body.style.overflow = "auto";
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

        timeoutId = setTimeout(() => {
          timeoutId = null;
        }, 100);
      };

      const handleTouchStart = (e: TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (touchStartY.current === null || scrollLocked || timeoutId) return;

        const isAtTop = window.scrollY === 0;
        if (!isAtTop) return;

        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        if (rect.top > 0 || rect.bottom <= 0) return;

        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY.current - touchY;

        if (deltaY > 50 && textIndex < texts.length - 1) {
          e.preventDefault();
          setScrollLocked(true);
          document.body.style.overflow = "hidden";

          const tl = gsap.timeline({
            onComplete: () => {
              setScrollLocked(false);
              //document.body.style.overflow = "auto";
            },
          });

          tl.to(textRef.current, { opacity: 0, duration: 0.5 })
            .add(() => setTextIndex((prev) => prev + 1))
            .to(textRef.current, { opacity: 1, duration: 0.5 });
        } else if (deltaY < -50) {
          e.preventDefault();
          setScrollLocked(true);
          document.body.style.overflow = "hidden";

          const tl = gsap.timeline({
            onComplete: () => {
              setScrollLocked(false);
              //document.body.style.overflow = "auto";
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

        timeoutId = setTimeout(() => {
          timeoutId = null;
        }, 100);
      };

      window.addEventListener("wheel", handleWheel, { passive: false });
      window.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      window.addEventListener("touchmove", handleTouchMove, { passive: false });

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        //document.body.style.overflow = "auto";
      };
    }, [textIndex, scrollLocked, onReturnToHeroBefore]);

    // Text and gradient animation
    useEffect(() => {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;

      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { opacity: 0, x: isDesktop ? 0 : -45, y: isDesktop ? -45 : 0 },
          {
            opacity: 1,
            x: 0,
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
        const totalTexts = texts.length - 1;
        const progress = textIndex / totalTexts;
        const gradientSize = 100 - progress * 75;

        gsap.to(overlayRef.current, {
          "--gradient-size": `${gradientSize}%`,
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
        <div ref={containerRef} className={styles.contentContainer}>
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
                        text.afterLink.map((line: string, i: number) => (
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
                <img src={icon.src} alt={icon.name} className={styles.icon} />
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
