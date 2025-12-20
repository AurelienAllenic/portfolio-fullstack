import { useEffect, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import styles from "./projects.module.scss";

type CoverIcon = string | { src: string; alt?: string };

export interface ProjectCover {
  title: string;
  content: string;
  sideImages: string[];
  mainImage: string;
  listIcons: CoverIcon[];
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
  projects?: Project[];
  categoryIndex?: number;
}

const isUrl = (v: string) => /^https?:\/\//i.test(v);

const getTechName = (url: string): string => {
  const match = url.match(/\/([^\/]+)_[^_]+\.webp$/);
  if (match) {
    const name = match[1];
    if (name === 'nodejs') return 'Node.js';
    if (name === 'reactjs') return 'React';
    if (name === 'nextjs') return 'Next.js';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return 'Technologie';
};

const ProjectCategory = ({ cover, categoryIndex }: ProjectCategoryProps) => {
  const containerRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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

    const mobileTitleMain = container.querySelector(`.${styles.mobileTitleMain}`);
    const mobileTitleAccent = container.querySelector(`.${styles.mobileTitleAccent}`);
    const mobileDescription = container.querySelector(`.${styles.mobileDescription}`);
    const mobileImage = container.querySelector(`.${styles.mobileImage}`);
    const mobileIcons = container.querySelectorAll(`.${styles.mobileIcons} .${styles.iconContainer}`);
    const mobileImageLeft = container.querySelector(`.${styles.mobileImageLeft}`);
    const mobileImageRight = container.querySelector(`.${styles.mobileImageRight}`);
    const mobileCta = container.querySelector(`.${styles.mobileCta}`);

    if (mobileTitleMain && mobileTitleAccent) gsap.set([mobileTitleMain, mobileTitleAccent], { opacity: 0, y: -30 });
    if (mobileDescription) gsap.set(mobileDescription, { opacity: 0 });
    if (mobileImage) gsap.set(mobileImage, { opacity: 0, scale: 0.8 });
    if (mobileIcons.length > 0) gsap.set(mobileIcons, { opacity: 0 });
    if (mobileImageLeft) gsap.set(mobileImageLeft, { opacity: 0, x: -30 });
    if (mobileImageRight) gsap.set(mobileImageRight, { opacity: 0, x: 30 });
    if (mobileCta) gsap.set(mobileCta, { opacity: 0, y: 30 });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (categoryIndex === undefined) {
      return;
    }

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

    const mobileTitleMain = container.querySelector(`.${styles.mobileTitleMain}`);
    const mobileTitleAccent = container.querySelector(`.${styles.mobileTitleAccent}`);
    const mobileDescription = container.querySelector(`.${styles.mobileDescription}`);
    const mobileImage = container.querySelector(`.${styles.mobileImage}`);
    const mobileIcons = container.querySelectorAll(`.${styles.mobileIcons} .${styles.iconContainer}`);
    const mobileImageLeft = container.querySelector(`.${styles.mobileImageLeft}`);
    const mobileImageRight = container.querySelector(`.${styles.mobileImageRight}`);
    const mobileCta = container.querySelector(`.${styles.mobileCta}`);

    if (mobileTitleMain && mobileTitleAccent) gsap.set([mobileTitleMain, mobileTitleAccent], { opacity: 0, y: -30 });
    if (mobileDescription) gsap.set(mobileDescription, { opacity: 0 });
    if (mobileImage) gsap.set(mobileImage, { opacity: 0, scale: 0.8 });
    if (mobileIcons.length > 0) gsap.set(mobileIcons, { opacity: 0 });
    if (mobileImageLeft) gsap.set(mobileImageLeft, { opacity: 0, x: -30 });
    if (mobileImageRight) gsap.set(mobileImageRight, { opacity: 0, x: 30 });
    if (mobileCta) gsap.set(mobileCta, { opacity: 0, y: 30 });

    const parentElement = container.parentElement;
    if (parentElement && getComputedStyle(parentElement).opacity === "0") {
      const checkVisibility = setInterval(() => {
        if (getComputedStyle(parentElement).opacity !== "0") {
          clearInterval(checkVisibility);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              runAnimation();
            });
          });
        }
      }, 50);
      return () => clearInterval(checkVisibility);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        runAnimation();
      });
    });

    function runAnimation() {
      if (!container) return;

      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      const mosaicItems = container.querySelectorAll(`.${styles.mosaicItem}`);
      const ctaButton = container.querySelector(`.${styles.cta}`);
      const titleMain = container.querySelector(`.${styles.titleMain}`);
      const titleAccent = container.querySelector(`.${styles.titleAccent}`);
      const contentBox = container.querySelector(`.${styles.contentBox}`);
      const icons = container.querySelectorAll(`.${styles.iconContainer}`);
      const rightImage = container.querySelector(`.${styles.right} img`);

      const mobileTitleMain = container.querySelector(`.${styles.mobileTitleMain}`);
      const mobileTitleAccent = container.querySelector(`.${styles.mobileTitleAccent}`);
      const mobileDescription = container.querySelector(`.${styles.mobileDescription}`);
      const mobileImage = container.querySelector(`.${styles.mobileImage}`);
      const mobileIcons = container.querySelectorAll(`.${styles.mobileIcons} .${styles.iconContainer}`);
      const mobileImageLeft = container.querySelector(`.${styles.mobileImageLeft}`);
      const mobileImageRight = container.querySelector(`.${styles.mobileImageRight}`);
      const mobileCta = container.querySelector(`.${styles.mobileCta}`);

      if (mosaicItems.length === 0) {
        setTimeout(() => runAnimation(), 50);
        return;
      }

      if (mosaicItems.length < 3) {
        setTimeout(() => runAnimation(), 100);
        return;
      }

      const mosaicArray = Array.from(mosaicItems);
      
      const allConnected = mosaicArray.every((item) => item.isConnected);
      if (!allConnected) {
        setTimeout(() => runAnimation(), 100);
        return;
      }

      mosaicArray.forEach((item) => {
        gsap.set(item, { opacity: 0 });
      });

      const tl = gsap.timeline({ 
        defaults: { ease: "power2.out" },
        onComplete: () => {
          if (mosaicArray.length >= 2) {
            const image1 = mosaicArray[0];
            const image2 = mosaicArray[1];
            
            if (image1 && image1.isConnected) {
              const opacity1 = parseFloat(getComputedStyle(image1).opacity);
              if (opacity1 < 0.9) {
                gsap.to(image1, {
                  opacity: 1,
                  duration: 0.3,
                  ease: "power2.out",
                });
              }
            }
            
            if (image2 && image2.isConnected) {
              const opacity2 = parseFloat(getComputedStyle(image2).opacity);
              if (opacity2 < 0.9) {
                gsap.to(image2, {
                  opacity: 1,
                  duration: 0.3,
                  ease: "power2.out",
                });
              }
            }
          }
        }
      });
      timelineRef.current = tl;

      if (mosaicArray.length >= 2) {
        const image1 = mosaicArray[0];
        const image2 = mosaicArray[1];
        
        if (image1 && image1.isConnected) {
          tl.to(image1, {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            force3D: true,
          }, 0);
        }
        
        if (image2 && image2.isConnected) {
          tl.to(image2, {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            force3D: true,
          }, 0.08);
        }
      }
      
      mosaicArray.forEach((item, index) => {
        if (index === 0 || index === 1) return;
        
        if (item && item.isConnected) {
          tl.to(item, {
            opacity: 1,
            duration: 0.35,
            ease: "power2.out",
          }, index * 0.08);
        } else {
          setTimeout(() => {
            if (item && item.isConnected) {
              gsap.to(item, {
                opacity: 1,
                duration: 0.35,
                ease: "power2.out",
              });
            }
          }, (index * 0.08 * 1000) + 100);
        }
      });
      
      if (mosaicArray.length >= 2) {
        setTimeout(() => {
          const image1 = mosaicArray[0];
          const image2 = mosaicArray[1];
          
          if (image1 && image1.isConnected) {
            const opacity1 = parseFloat(getComputedStyle(image1).opacity);
            if (opacity1 < 0.9) {
              gsap.set(image1, { opacity: 1 });
            }
          }
          
          if (image2 && image2.isConnected) {
            const opacity2 = parseFloat(getComputedStyle(image2).opacity);
            if (opacity2 < 0.9) {
              gsap.set(image2, { opacity: 1 });
            }
          }
        }, 500);
      }

      tl.to(ctaButton, {
        opacity: 1,
        y: 0,
        duration: 0.4,
      }, 0.3);

      tl.to([titleMain, titleAccent], {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.05,
      }, 0.4);

      tl.to(contentBox, {
        opacity: 1,
        duration: 0.4,
      }, 0.5);

      tl.to(icons, {
        opacity: 1,
        duration: 0.4,
        stagger: 0.05,
      }, 0.6);

      tl.to(rightImage, {
        opacity: 1,
        x: 0,
        duration: 0.5,
      }, 0.2);

      if (mobileTitleMain && mobileTitleAccent) {
        tl.to([mobileTitleMain, mobileTitleAccent], {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
        }, 0.2);
      }

      if (mobileImage) {
        tl.to(mobileImage, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
        }, 0.3);
      }

      if (mobileDescription) {
        tl.to(mobileDescription, {
          opacity: 1,
          duration: 0.4,
        }, 0.4);
      }

      if (mobileImageLeft) {
        tl.to(mobileImageLeft, {
          opacity: 1,
          x: 0,
          duration: 0.4,
        }, 0.5);
      }

      if (mobileImageRight) {
        tl.to(mobileImageRight, {
          opacity: 1,
          x: 0,
          duration: 0.4,
        }, 0.5);
      }

      if (mobileIcons.length > 0) {
        tl.to(mobileIcons, {
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
        }, 0.6);
      }

      if (mobileCta) {
        tl.to(mobileCta, {
          opacity: 1,
          y: 0,
          duration: 0.4,
        }, 0.7);
      }
    }
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

        <div className={styles.mobileDescription}>
          {cover.content.split(". ").map((line, i, arr) => (
            <p key={i}>
              {line.trim()}
              {i < arr.length - 1 ? "." : ""}
            </p>
          ))}
        </div>

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

        <aside className={styles.right}>
          <img src={cover.mainImage} alt="main" />
        </aside>

        <div className={styles.mobileBottomSection}>
          <img
            src={cover.sideImages[1]}
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
            src={cover.sideImages[2]}
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