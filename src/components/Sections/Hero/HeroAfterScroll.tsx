import { forwardRef, useEffect, useRef, useState, useLayoutEffect, useMemo } from "react";
import { gsap } from "gsap";
import styles from "./heroAfterScroll.module.scss";
import { useLanguage } from "../../General/Language/LanguageContext";
import { useAnalytics } from "../../../hooks/useAnalytics";

interface HeroAfterScrollProps {
  onReturnToHeroBefore?: () => void;
  onTransitionToProjects?: () => void;
  returnFromProjects?: boolean;
  isForced?: boolean;
  forceTextIndex?: number;
  onNavigationReset?: boolean;
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
    const { t } = useLanguage();
    
    const texts: TextContent[] = useMemo(() => [
      t("hero.afterScroll.text1"),
      {
        beforeLink: t("hero.afterScroll.text2.before"),
        linkText: t("hero.afterScroll.text2.link"),
        linkHref: "https://www.iim.fr/",
        afterLink: t("hero.afterScroll.text2.after"),
      },
      {
        beforeLink: t("hero.afterScroll.text3.before"),
        linkText: t("hero.afterScroll.text3.link"),
        linkHref: "https://soleadagency.com",
        afterLink: t("hero.afterScroll.text3.after"),
      },
      {
        beforeLink: t("hero.afterScroll.text4.before"),
        linkText: t("hero.afterScroll.text4.link"),
        linkHref: "https://openclassrooms.com/",
        afterLink: [
          t("hero.afterScroll.text4.after1"),
          t("hero.afterScroll.text4.after2"),
          t("hero.afterScroll.text4.after3"),
          t("hero.afterScroll.text4.after4"),
        ],
      },
      t("hero.afterScroll.text5"),
    ], [t]);

    const iconContainers = useRef<(HTMLDivElement | null)[]>([]);
    const textRef = useRef<HTMLParagraphElement | null>(null);
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const contentContainerRef = useRef<HTMLDivElement | null>(null);
    const [textIndex, setTextIndex] = useState(
      forceTextIndex !== undefined ? forceTextIndex : (returnFromProjects ? texts.length - 1 : (isForced ? 0 : 0))
    );

    const [scrollLocked, setScrollLocked] = useState(false);
    const [, setAllAnimationsComplete] =
  useState(returnFromProjects || isForced || forceTextIndex !== undefined);
    const [direction, setDirection] = useState<"up" | "down">("down");
    const firstRender = useRef(true);
    const hasTriggeredSwipe = useRef(false);
    const wasNavigationReset = useRef(false);
    const contentRightRef = useRef<HTMLDivElement | null>(null);
    const iconsWrapperRef = useRef<HTMLDivElement | null>(null);
    const scrollAnimationRef = useRef<gsap.core.Timeline | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const { trackClick } = useAnalytics();

    useEffect(() => {
      const sectionName = `section_about_${textIndex + 1}`;
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const label = isMobile ? `${sectionName}_mobile` : sectionName;
      trackClick(label);
    }, [textIndex, trackClick]);

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const aiIcons = useMemo(() => [
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/chatgpt_mefpin.webp",
        name: "ChatGPT",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/grok_dkpy3i.webp",
        name: "Grok",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/claude_y8vo09.webp",
        name: "Claude",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/gemini_trlcb2.webp",
        name: "Gemini",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/cursor_levshl.webp",
        name: "Cursor",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/ollama_pf9fbp.webp",
        name: "Ollama",
      },
    ], []);

    const getIconsForTextIndex = useMemo(() => {
      return (index: number) => {
        switch (index) {
          case 0: // First text
            return [
              {
                src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/react_jzelsd.webp",
                name: "React",
              },
              {
                src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/react-native_dyhcn4.webp",
                name: "React Native",
              },
              {
                src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/nodejs_lqsesq.webp",
                name: "Node.js",
              },
              {
                src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/next_ep27nk.webp",
                name: "Next.js",
              },
              {
                src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/mongodb-icon_bsizyi.webp",
                name: "MongoDB",
              },
              {
                src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/prisma-icon_vgbfdr.webp",
                name: "Prisma",
              },
            ];
          case 1: // Second text
            return [
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
                src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/react_jzelsd.webp",
                name: "React",
              },
              {
                src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/react-native_dyhcn4.webp",
                name: "React Native",
              },
              {
                src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/docker-icon_vwrf7p.webp",
                name: "Docker",
              },
            ];
        case 2: // Third text
          return [
            {
              src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/html_yzkdbv.webp",
              name: "HTML",
            },
            {
              src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/css_ldbn4p.webp",
              name: "CSS",
            },
            {
              src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/js_cbaqmr.webp",
              name: "JavaScript",
            },
            {
              src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/jquery_wk7xot.webp",
              name: "jQuery",
            },
            {
              src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/php_r7rttg.webp",
              name: "PHP",
            },
            {
              src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/wordpress-icon_ngq76k.webp",
              name: "WordPress",
            },
          ];
          case 3: // Fourth text
            return [
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
          case 4: // Fifth text (IA)
            return aiIcons;
          default:
            return [];
        }
      };
    }, [aiIcons]);

    const allIconsMobile = useMemo(() => [
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
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/jquery_wk7xot.webp",
        name: "jQuery",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/react_jzelsd.webp",
        name: "React",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/react-native_dyhcn4.webp",
        name: "React Native",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/next_ep27nk.webp",
        name: "Next.js",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/wordpress-icon_ngq76k.webp",
        name: "Wordpress",
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
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/php_r7rttg.webp",
        name: "PHP",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/symfony_t74k8y.webp",
        name: "Symfony",
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
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/chatgpt_mefpin.webp",
        name: "ChatGPT",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/grok_dkpy3i.webp",
        name: "Grok",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/claude_y8vo09.webp",
        name: "Claude",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/gemini_trlcb2.webp",
        name: "Gemini",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/cursor_levshl.webp",
        name: "Cursor",
      },
      {
        src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/ollama_pf9fbp.webp",
        name: "Ollama",
      },
    ], []);

    const allIconsDesktop = useMemo(() => getIconsForTextIndex(textIndex), [getIconsForTextIndex, textIndex]);

    useEffect(() => {
      if (onNavigationReset && !wasNavigationReset.current) {
        wasNavigationReset.current = true;

        firstRender.current = false;
        hasTriggeredSwipe.current = false;
        setScrollLocked(false);

        if (forceTextIndex !== undefined) {
          setTextIndex(forceTextIndex);
          setDirection(forceTextIndex === 0 ? "down" : "up");
        }

        setAllAnimationsComplete(true);

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
      const iconCount = isMobile ? allIconsMobile.length : allIconsDesktop.length;
      
      const timeouts: number[] = [];
      for (let index = 0; index < iconCount; index++) {
        const delay = 0.5 + index * 0.1;
        const timeout = setTimeout(() => {
          if (iconContainers.current[index]) {
            iconContainers.current[index]?.classList.add(styles.appeared);
          }
        }, (delay + 0.8) * 1000);
        timeouts.push(timeout);
      }

      const lastIconDelay =
        0.5 + (iconCount - 1) * 0.1 + 0.8;

      const allAnimationsTimeout = setTimeout(() => {
        setAllAnimationsComplete(true);
      }, (lastIconDelay + 1) * 1000);

      return () => {
        timeouts.forEach(clearTimeout);
        clearTimeout(allAnimationsTimeout);
      };
    }, [textIndex, isMobile]);

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

    useEffect(() => {
      if (scrollAnimationRef.current) {
        scrollAnimationRef.current.kill();
        scrollAnimationRef.current = null;
      }
      if (iconsWrapperRef.current) {
        const wrapper = iconsWrapperRef.current;
        const allIcons = wrapper.querySelectorAll(`.${styles.iconContainer}`);
        const expectedCount = allIconsMobile.length;
        if (allIcons.length > expectedCount) {
          const iconsArray = Array.from(allIcons);
          const duplicates = iconsArray.slice(expectedCount);
          duplicates.forEach((icon) => {
            if (icon.parentNode) {
              icon.parentNode.removeChild(icon);
            }
          });
        }
      }

      if (!isMobile || !iconsWrapperRef.current || !contentRightRef.current) {
        return;
      }
      const checkAndStart = () => {
        const wrapper = iconsWrapperRef.current;
        const container = contentRightRef.current;
        if (!wrapper || !container) return;

        const icons = wrapper.querySelectorAll(`.${styles.iconContainer}`);
        if (icons.length === 0) {
          setTimeout(checkAndStart, 50);
          return;
        }
        const firstIcon = icons[0] as HTMLElement;
        if (firstIcon.offsetWidth === 0) {
          setTimeout(checkAndStart, 50);
          return;
        }
        icons.forEach((icon) => {
          const tooltip = icon.querySelector(`.${styles.tooltip}`) as HTMLElement;
          if (tooltip) {
            gsap.set(tooltip, {
              opacity: 0,
              y: 9,
              force3D: true
            });
          }
        });
        startScrollAnimation();
      };

      const startScrollAnimation = () => {
        const wrapper = iconsWrapperRef.current;
        const container = contentRightRef.current;
        if (!wrapper || !container) return;

        const icons = wrapper.querySelectorAll(`.${styles.iconContainer}`);
        if (icons.length === 0) return;

        let totalWidth = 0;
        icons.forEach((icon) => {
          totalWidth += (icon as HTMLElement).offsetWidth + 25;
        });

        if (totalWidth === 0) {
          setTimeout(startScrollAnimation, 50);
          return;
        }

        const duplicateIcons: HTMLElement[] = [];
        Array.from(icons).forEach((icon) => {
          const clone = icon.cloneNode(true) as HTMLElement;
          wrapper.appendChild(clone);
          duplicateIcons.push(clone);
        });

        gsap.set(wrapper, { x: 0 });

        let tooltipsEnabled = false;
        let tooltipsOpacityMultiplier = 0;
        const lastIconDelay = 0.5 + (icons.length - 1) * 0.1 + 0.8;
        
        setTimeout(() => {
          tooltipsEnabled = true;
          gsap.to({ value: 0 }, {
            value: 1,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: function() {
              tooltipsOpacityMultiplier = this.targets()[0].value;
            }
          });
        }, lastIconDelay * 1000);

        const tooltipAnimators = new Map();
        const allIconsElements = wrapper.querySelectorAll(`.${styles.iconContainer}`);
        allIconsElements.forEach((iconEl) => {
          const tooltip = iconEl.querySelector(`.${styles.tooltip}`) as HTMLElement;
          if (tooltip) {
            tooltipAnimators.set(tooltip, {
              opacity: gsap.quickTo(tooltip, "opacity", {duration: 0.6, ease: "power2.out"}),
              y: gsap.quickTo(tooltip, "y", {duration: 0.6, ease: "power2.out"})
            });
          }
        });

        const scrollTimeline = gsap.timeline({ repeat: -1 });
        scrollTimeline.to(wrapper, {
          x: -totalWidth,
          duration: totalWidth / 30,
          ease: "none",
          onUpdate: () => {
            const currentX = gsap.getProperty(wrapper, "x") as number;
            if (Math.abs(currentX) >= totalWidth) {
              gsap.set(wrapper, { x: 0 });
              scrollTimeline.progress(0);
            }

            if (tooltipsEnabled) {
              const allIconsElements = wrapper.querySelectorAll(`.${styles.iconContainer}`);
              allIconsElements.forEach((iconEl) => {
                const iconRect = (iconEl as HTMLElement).getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const iconCenterX = iconRect.left + iconRect.width / 2;
                const containerCenterX = containerRect.left + containerRect.width / 2;
                const distanceFromCenter = Math.abs(iconCenterX - containerCenterX);
                const maxDistance = containerRect.width / 2;
                const tooltip = iconEl.querySelector(`.${styles.tooltip}`) as HTMLElement;

                if (tooltip && tooltipAnimators.has(tooltip)) {
                  const animator = tooltipAnimators.get(tooltip);
                  if (distanceFromCenter < maxDistance * 0.5) {
                    const baseOpacity = Math.max(0, 1 - (distanceFromCenter / (maxDistance * 0.5)));
                    const finalOpacity = baseOpacity * tooltipsOpacityMultiplier;
                    animator.opacity(finalOpacity);
                    animator.y(9 * (1 - finalOpacity));
                  } else {
                    animator.opacity(0);
                    animator.y(9);
                  }
                }
              });
            }
          }
        });

        scrollAnimationRef.current = scrollTimeline;
      };
      checkAndStart();

      return () => {
        if (scrollAnimationRef.current) {
          scrollAnimationRef.current.kill();
          scrollAnimationRef.current = null;
        }
        if (iconsWrapperRef.current) {
          const wrapper = iconsWrapperRef.current;
          const allIcons = wrapper.querySelectorAll(`.${styles.iconContainer}`);
          const expectedCount = allIconsMobile.length;
          if (allIcons.length > expectedCount) {
            const iconsArray = Array.from(allIcons);
            const duplicates = iconsArray.slice(expectedCount);
            duplicates.forEach((icon) => {
              if (icon.parentNode) {
                icon.parentNode.removeChild(icon);
              }
            });
          }
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
        if (document.body.getAttribute("data-modal-open") === "true") {
          return;
        }
        
        if (scrollLocked || timeoutId) {
          e.preventDefault();
          return;
        }

        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          return;
        }

        const isAtTop = window.scrollY === 0;
        if (!isAtTop) return;

        // Seuil minimum pour éviter les micro-scrolls du trackpad (réduit à 1 pour plus de sensibilité)
        const SCROLL_THRESHOLD = 1;
        const goingDown = e.deltaY > SCROLL_THRESHOLD;
        const goingUp = e.deltaY < -SCROLL_THRESHOLD;

        if (goingDown && textIndex < texts.length - 1) {
          e.preventDefault();
          changeText(textIndex + 1);
        } else if (goingDown && textIndex === texts.length - 1) {
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

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return;
      }
      
      if (window.scrollY !== 0) return;

      if (deltaY > 30 && textIndex < texts.length - 1) {
        e.preventDefault();
        changeText(textIndex + 1);
        hasTriggeredSwipe.current = true;
        touchStartY.current = e.touches[0].clientY;
      } else if (deltaY > 30 && textIndex === texts.length - 1) {
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
      onTransitionToProjects,
    ]);

    useEffect(() => {
      if (isForced) {
        if (textIndex !== 0) {
          setTextIndex(0);
        }
        
        firstRender.current = true;
        setAllAnimationsComplete(true);

        const containerElement = ref && typeof ref === 'object' && ref.current ? ref.current : null;
        if (containerElement) {
          gsap.set(containerElement, { opacity: 1 });
        }

        if (contentContainerRef.current) {
          gsap.set(contentContainerRef.current, { opacity: 1 });
        }

        setTimeout(() => {
          if (textRef.current) {
            gsap.killTweensOf(textRef.current);
            gsap.set(textRef.current, { opacity: 0, y: 20 });
            gsap.fromTo(
              textRef.current,
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                delay: 1.2,
                onComplete: () => {
                  firstRender.current = false;
                  setScrollLocked(false);
                  document.body.style.overflow = "";
                },
              }
            );
          }
        }, 50);
        
        // Empêcher le useEffect principal de s'exécuter
        return;
      }
    }, [isForced, ref]);

    useEffect(() => {
      if (returnFromProjects && textIndex === texts.length - 1) {
        if (textRef.current) {
          textRef.current.style.setProperty('animation', 'none', 'important');
          gsap.killTweensOf(textRef.current);
          gsap.fromTo(
            textRef.current,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
              delay: 0.5,
              onComplete: () => {
                setScrollLocked(false);
                document.body.style.overflow = "";
              },
            }
          );
        }
        return;
      }

      // Ne pas animer si isForced est true ET qu'on est sur le premier rendu
      // Mais autoriser les animations suivantes
      if (isForced && firstRender.current) {
        return;
      }

      if (textRef.current) {
        gsap.killTweensOf(textRef.current);
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
              setScrollLocked(false);
              document.body.style.overflow = "";
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
    }, [textIndex, direction, returnFromProjects]);

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
              {t("hero.afterScroll.title").split(" ").map((word, index, array) => {
                if (index === array.length - 1) {
                  return <span key={index} className={styles.titleLeftHighlight}>{word}</span>;
                }
                return <span key={index}>{word} </span>;
              })}
            </h2>
            <div className={styles.containerSubtitle}>
              <p
                ref={textRef}
                className={`${styles.subtitle} ${
                  textIndex === 2
                    ? styles.mediumSubtitle
                    : textIndex === 3 || textIndex === 4
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
                if (isMobile && e.touches.length > 0) {
                  touchStartX.current = e.touches[0].clientX;
                  touchStartY.current = e.touches[0].clientY;
                }
              }}
              onTouchMove={(e) => {
                if (isMobile && e.touches.length > 0 && touchStartX.current !== null && touchStartY.current !== null) {
                  const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
                  const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);

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
                  {allIconsMobile.map((icon, index) => (
                    <div
                      key={`mobile-${index}`}
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
                  {allIconsDesktop.map((icon, index) => (
                    <div
                      key={`desktop-${textIndex}-${index}`}
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
