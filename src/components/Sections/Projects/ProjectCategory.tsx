import { useEffect, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import styles from "./projects.module.scss";

type CoverIcon = string | { src: string; alt?: string };

export interface ProjectCover {
  title: string;
  content: string;
  sideImages: string[];   // 4 images mosaïque à gauche
  mainImage: string;      // grande image à droite
  listIcons: CoverIcon[]; // icônes ou libellés
}

export interface ProjectFolderItem {
  id: number;
  title: string;
  titleEn: string;
  link: string;
}

export interface Project {
  id: number;
  image: string;
  title: string;
  titleEn: string;
  github: string;
  demo: string;
  figma: string;
  folder: string | ProjectFolderItem[];
  technologies: string[];
}

interface ProjectCategoryProps {
  cover: ProjectCover;
  projects?: Project[]; // optionnel et typé correctement
  categoryIndex?: number; // ✅ Nouveau prop pour déclencher les animations
}

const isUrl = (v: string) => /^https?:\/\//i.test(v);

const getTechName = (url: string): string => {
  // Extrait le nom de la techno depuis l'URL
  // Ex: "https://.../html_yzkdbv.webp" -> "HTML"
  const match = url.match(/\/([^\/]+)_[^_]+\.webp$/);
  if (match) {
    const name = match[1];
    // Cas spéciaux
    if (name === 'nodejs') return 'Node.js';
    if (name === 'reactjs') return 'React';
    if (name === 'nextjs') return 'Next.js';
    // Capitalisation normale
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return 'Technologie';
};

const ProjectCategory = ({ cover, categoryIndex }: ProjectCategoryProps) => {
  const containerRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // ✅ INITIALISATION IMMÉDIATE : éviter le flash
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ✅ Initialiser immédiatement tous les éléments à leur état initial
    const mosaicItems = container.querySelectorAll(`.${styles.mosaicItem}`);
    const ctaButton = container.querySelector(`.${styles.cta}`);
    const titleMain = container.querySelector(`.${styles.titleMain}`);
    const titleAccent = container.querySelector(`.${styles.titleAccent}`);
    const contentBox = container.querySelector(`.${styles.contentBox}`);
    const icons = container.querySelectorAll(`.${styles.iconContainer}`);
    const rightImage = container.querySelector(`.${styles.right} img`);

    gsap.set(mosaicItems, { opacity: 0 });
    gsap.set(ctaButton, { opacity: 0, y: 30 });
    gsap.set([titleMain, titleAccent], { opacity: 0, y: -30 });
    gsap.set(contentBox, { opacity: 0 });
    gsap.set(icons, { opacity: 0 });
    gsap.set(rightImage, { opacity: 0, x: 50 });
  }, []);

  // ✅ ANIMATION : lancer les animations
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ✅ Si categoryIndex est undefined, ne pas animer (élément caché)
    if (categoryIndex === undefined) {
      return;
    }

    // ✅ Réinitialiser immédiatement AVANT de vérifier la visibilité
    const mosaicItems = container.querySelectorAll(`.${styles.mosaicItem}`);
    const ctaButton = container.querySelector(`.${styles.cta}`);
    const titleMain = container.querySelector(`.${styles.titleMain}`);
    const titleAccent = container.querySelector(`.${styles.titleAccent}`);
    const contentBox = container.querySelector(`.${styles.contentBox}`);
    const icons = container.querySelectorAll(`.${styles.iconContainer}`);
    const rightImage = container.querySelector(`.${styles.right} img`);

    // ✅ Initialiser immédiatement pour éviter le pop
    gsap.set(mosaicItems, { opacity: 0 });
    gsap.set(ctaButton, { opacity: 0, y: 30 });
    gsap.set([titleMain, titleAccent], { opacity: 0, y: -30 });
    gsap.set(contentBox, { opacity: 0 });
    gsap.set(icons, { opacity: 0 });
    gsap.set(rightImage, { opacity: 0, x: 50 });

    // ✅ Vérifier si l'élément est visible
    const parentElement = container.parentElement;
    if (parentElement && getComputedStyle(parentElement).opacity === "0") {
      // Attendre que l'élément devienne visible
      const checkVisibility = setInterval(() => {
        if (getComputedStyle(parentElement).opacity !== "0") {
          clearInterval(checkVisibility);
          runAnimation();
        }
      }, 50);
      return () => clearInterval(checkVisibility);
    }

    // ✅ Lancer l'animation directement
    const timer = setTimeout(() => {
      runAnimation();
    }, 10); // Délai très court

    function runAnimation() {
      // ✅ Tuer l'animation précédente si elle existe
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      // ✅ Timeline d'animation optimisée pour 1.5s maximum
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      timelineRef.current = tl;

      // 1. Images mosaïque (0s) : opacité 0 à 1, une après l'autre
      tl.to(mosaicItems, {
        opacity: 1,
        duration: 0.35,
        stagger: 0.08,
      }, 0);

      // 2. Bouton "Voir les projets" : translate depuis le bas + opacité
      tl.to(ctaButton, {
        opacity: 1,
        y: 0,
        duration: 0.4,
      }, 0.3);

      // 3. Titre principal : translate depuis le haut + opacité
      tl.to([titleMain, titleAccent], {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.05,
      }, 0.4);

      // 4. Texte de description : apparaît avec opacité
      tl.to(contentBox, {
        opacity: 1,
        duration: 0.4,
      }, 0.5);

      // 5. Icônes de langages : opacité, les uns après les autres
      tl.to(icons, {
        opacity: 1,
        duration: 0.4,
        stagger: 0.05,
      }, 0.6);

      // 6. Image de droite : translate depuis la droite + opacité
      tl.to(rightImage, {
        opacity: 1,
        x: 0,
        duration: 0.5,
      }, 0.2);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [categoryIndex]);

  return (
    <section ref={containerRef} className={styles.cover} id="projects">
      <div className={styles.coverInner}>
        {/* Mobile: Ligne 1 - Titre + Image */}
        <div className={styles.mobileHeaderRow}>
          <div className={styles.mobileTitle}>
            <h2 className={styles.mobileTitleMain}>
              {cover.title.split(" ")[0]}
            </h2>
            <h3 className={styles.mobileTitleAccent}>
              {cover.title.split(" ").slice(1).join(" ") || "WEB"}
            </h3>
          </div>
          <img src={cover.mainImage} alt="main" className={styles.mobileImage} />
        </div>

        {/* Mobile: Ligne 2 - Description */}
        <div className={styles.mobileDescription}>
          {cover.content.split(". ").map((line, i, arr) => (
            <p key={i}>
              {line.trim()}
              {i < arr.length - 1 ? "." : ""}
            </p>
          ))}
        </div>

        {/* Colonne gauche: mosaïque + CTA */}
        <aside className={styles.left}>
        <div className={styles.mosaic}>
          {cover.sideImages.slice(0, 4).map((src, i) => (
            <div key={i} className={styles.mosaicItem}>
              <img src={src} alt={`side-${i + 1}`} />
            </div>
          ))}
        </div>

        <button className={styles.cta} type="button">
          <span className={styles.arrow} aria-hidden>—→</span>
          <span>Voir les projets</span>
        </button>
      </aside>

      {/* Centre: titre + encadré + icônes */}
      <div className={styles.center}>
        <h2 className={styles.title}>
          <span className={styles.titleMain}>
            {cover.title.split(" ")[0]}
          </span>
          <span className={styles.titleAccent}>
            {cover.title.split(" ").slice(1).join(" ") || "WEB"}
          </span>
        </h2>

        <div className={styles.contentBox}>
          {cover.content.split(". ").map((line, i, arr) => (
            <p key={i}>
              {line.trim()}
              {i < arr.length - 1 ? "." : ""}
            </p>
          ))}
        </div>

        <div className={styles.icons}>
          {cover.listIcons.map((it, i) => {
            if (typeof it === "string") {
              return (
                <div key={i} className={styles.iconContainer}>
                  {isUrl(it) ? (
                    <>
                      <img src={it} alt={getTechName(it)} />
                      <span className={styles.tooltip}>{getTechName(it)}</span>
                    </>
                  ) : (
                    <>
                      <span>{it}</span>
                      <span className={styles.tooltip}>{it}</span>
                    </>
                  )}
                </div>
              );
            }
            return (
              <div key={i} className={styles.iconContainer}>
                <img src={it.src} alt={it.alt ?? getTechName(it.src)} />
                <span className={styles.tooltip}>{it.alt ?? getTechName(it.src)}</span>
              </div>
            );
          })}
        </div>
      </div>

        {/* Droite: grande image */}
        <aside className={styles.right}>
          <img src={cover.mainImage} alt="main" />
        </aside>

        {/* Mobile: Ligne 3 - Image gauche + Icônes + Image droite + Bouton */}
        <div className={styles.mobileBottomSection}>
          <img
            src={cover.sideImages[2]}
            alt="mobile-1"
            className={styles.mobileImageLeft}
          />
          <div className={styles.mobileIcons}>
            {cover.listIcons.map((it, i) => {
              if (typeof it === "string") {
                return (
                  <div key={i} className={styles.iconContainer}>
                    {isUrl(it) ? (
                      <>
                        <img src={it} alt={getTechName(it)} />
                        <span className={styles.tooltip}>{getTechName(it)}</span>
                      </>
                    ) : (
                      <>
                        <span>{it}</span>
                        <span className={styles.tooltip}>{it}</span>
                      </>
                    )}
                  </div>
                );
              }
              return (
                <div key={i} className={styles.iconContainer}>
                  <img src={it.src} alt={it.alt ?? getTechName(it.src)} />
                  <span className={styles.tooltip}>
                    {it.alt ?? getTechName(it.src)}
                  </span>
                </div>
              );
            })}
          </div>
          <img
            src={cover.sideImages[3]}
            alt="mobile-2"
            className={styles.mobileImageRight}
          />
          <button className={styles.mobileCta} type="button">
            <span className={styles.arrow} aria-hidden>
              —→
            </span>
            <span>Voir les projets</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProjectCategory;