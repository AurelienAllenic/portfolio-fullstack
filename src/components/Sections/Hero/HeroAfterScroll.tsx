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
  afterLink: string;
};

type TextContent = string | LinkText;

const HeroAfterScroll = forwardRef<HTMLDivElement, HeroAfterScrollProps>(
  ({ onReturnToHeroBefore }, ref) => {
    const iconContainers = useRef<(HTMLDivElement | null)[]>([]);
    const textRef = useRef<HTMLParagraphElement | null>(null);
    const [textIndex, setTextIndex] = useState(0);
    const [scrollLocked, setScrollLocked] = useState(false);
    const firstRender = useRef(true);

    const texts: TextContent[] = [
      "Depuis 2021, je me forme au développement web fullStack. Mes technologies de prédilection sont ReactJs avec NodeJs.",
      "Je suis titulaire d'un mastère en développement web fullstack à l'IIM digital School du pôle Léonard de Vinci.",
      {
        beforeLink:
          "Pendant ces deux années de mastère, j'ai réalisé une alternance chez ",
        linkText: "Solead agency",
        linkHref: "https://soleadagency.com",
        afterLink:
          " en tant que développeur web. Travaillant à la fois sur du front et du back",
      },
      "J'ai également suivi trois formations OpenClassrooms : <br />Développeur Web,<br />Développeur d'application - JavaScript/React,<br />Développeur d'application - Python.",
    ];

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

    // Gestion du scroll
    useEffect(() => {
      const handleWheel = (e: WheelEvent) => {
        if (scrollLocked) {
          e.preventDefault();
          return;
        }

        const isAtTop = window.scrollY === 0;
        if (!isAtTop) return;

        const goingDown = e.deltaY > 0;
        const goingUp = e.deltaY < 0;

        // 🔽 Passage au texte suivant
        if (goingDown && textIndex < texts.length - 1) {
          e.preventDefault();
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

        // 🔼 Gestion du scroll vers le haut
        else if (goingUp) {
          e.preventDefault();
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
            // Retour au texte précédent
            tl.to(textRef.current, { opacity: 0, duration: 0.5 })
              .add(() => setTextIndex((prev) => prev - 1))
              .to(textRef.current, { opacity: 1, duration: 0.5 });
          } else if (textIndex === 0) {
            // Retour à HeroBeforeScroll
            tl.to(textRef.current, { opacity: 0, duration: 0.5 }).add(() => {
              onReturnToHeroBefore?.();
            });
          }
        }
      };

      window.addEventListener("wheel", handleWheel, { passive: false });
      return () => window.removeEventListener("wheel", handleWheel);
    }, [textIndex, scrollLocked, onReturnToHeroBefore]);

    // Animation d’apparition du texte
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
            duration: 0.8,
            ease: "power2.out",
            delay: firstRender.current ? 1 : 0,
            onComplete: () => {
              firstRender.current = false;
            },
          }
        );
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
        <div className={styles.overlay}></div>
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
              {textIndex === 2 ? (
                <>
                  {(texts[2] as LinkText).beforeLink}
                  <a
                    href={(texts[2] as LinkText).linkHref}
                    className={styles.linkSubtitle}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {(texts[2] as LinkText).linkText}
                  </a>
                  {(texts[2] as LinkText).afterLink}
                </>
              ) : (
                <span
                  dangerouslySetInnerHTML={{
                    __html: texts[textIndex] as string,
                  }}
                ></span>
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
