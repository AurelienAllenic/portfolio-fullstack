import { useEffect, useRef, useState } from "react";
import styles from "./hero.module.scss";
import { gsap } from "gsap";
import HeroBeforeScroll from "./HeroBeforeScroll";
import HeroAfterScroll from "./HeroAfterScroll";

const Hero: React.FC = () => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<NodeListOf<HTMLImageElement> | null>(null);
  const hero2Ref = useRef<HTMLDivElement>(null);

  const [gradientState, setGradientState] = useState<
    "hero1" | "hero2" | "transition"
  >("hero1");

  useEffect(() => {
    const overlay = overlayRef.current;
    const container = containerRef.current;
    if (!overlay || !container) return;

    let scrollBlocked = true;

    const tl = gsap.timeline({
      paused: true,
      defaults: { duration: 1, ease: "power2.out" },
    });

    tl.to(overlay, {
      "--gradient-size": "100%",
      onUpdate: () => {
        const val =
          parseFloat(
            getComputedStyle(overlay).getPropertyValue("--gradient-size")
          ) || 0;
        overlay.style.setProperty("--gradient-size", `${val}%`);

        if (val > 0 && val < 50) {
          setGradientState("transition");
        } else if (val >= 50) {
          setGradientState("hero2");
        } else if (val === 0) {
          setGradientState("hero1");
        }
      },
      onComplete: () => {
        scrollBlocked = false;
        document.body.style.overflow = "auto";

        // ⚡ ICÔNES HERO2 (ENTRANCE)
        const icons =
          container.querySelectorAll<HTMLImageElement>(".contentRight img");
        iconsRef.current = icons;
        gsap.set(icons, { opacity: 0, y: -50 });
        gsap.to(icons, {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          delay: 1,
          ease: "power2.out",
        });
      },
      onReverseComplete: () => {
        scrollBlocked = true;
        document.body.style.overflow = "hidden";
        setGradientState("hero1");
      },
    });

    const handleWheel = (e: WheelEvent) => {
      const rect = container.getBoundingClientRect();
      const delta = e.deltaY;

      if (rect.top <= 0 && rect.bottom > 0) {
        if (scrollBlocked) e.preventDefault();

        if (delta > 0 && tl.progress() < 1) {
          tl.play();
        } else if (delta < 0 && rect.top === 0 && tl.progress() > 0) {
          // ⚡ Fade-out HeroAfterScroll dès le début de la reverse
          if (hero2Ref.current) {
            gsap.to(hero2Ref.current, {
              opacity: 0,
              duration: 1,
              ease: "power2.out",
            });
          }
          tl.reverse();
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      document.body.style.overflow = "auto";
      tl.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.containerHero}>
      <div
        ref={overlayRef}
        className={styles.overlay}
        style={{ "--gradient-size": "0%" } as React.CSSProperties}
      ></div>

      {gradientState === "hero1" && <HeroBeforeScroll />}
      {gradientState === "hero2" && <HeroAfterScroll ref={hero2Ref} />}
    </div>
  );
};

export default Hero;
