import styles from "./projects.module.scss";
import type { ProjectCover } from "./ProjectCategory";

interface ProjectCategoryDesktopProps {
  cover: ProjectCover;
  getLabelFromPath: (path: string) => string;
}

const ProjectCategoryDesktop = ({ cover, getLabelFromPath }: ProjectCategoryDesktopProps) => {
  return (
    <div className={styles.subContainerCategory}>
      {/* Colonne gauche: mosaïque + CTA */}
      <aside className={styles.left}>
        <div className={styles.mosaic}>
          {cover.sideImages.slice(0, 3).map((src, i) => (
            <div key={i} className={`${styles.mosaicItem} ${styles[`mosaicItem${i + 1}`]}`}>
              <img src={src} alt={`side-${i + 1}`} />
            </div>
          ))}
          <div className={`${styles.mosaicItem} ${styles.mosaicItem4}`}>
            <img src={cover.sideImages[3]} alt="side-4" />
            <button className={styles.cta} type="button">
              <span className={styles.arrow} aria-hidden>—→</span>
              <span>Voir les projets</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Centre: titre + encadré + icônes */}
      <div className={styles.center}>
        <h2 className={styles.title}>
          <span className={styles.titleMain}>{cover.titleFirstPart}</span>
          <span className={styles.titleAccent}>{cover.titleSecondPart}</span>
        </h2>

        <div className={styles.contentBox}>
          {cover.content.split(". ").map((line, i, arr) => (
            <p key={i}>
              {line.trim()}
              {i < arr.length - 1 ? "." : ""}
            </p>
          ))}
        </div>

        <ul className={styles.icons}>
          {cover.listIcons.map((it, i) => {
            const src = typeof it === "string" ? it : it.src;
            const label = typeof it === "string" ? getLabelFromPath(src) : it.alt ?? getLabelFromPath(src);
            return (
              <li key={i} className={styles.iconBadge}>
                <img src={src} alt={label} />
                <span className={styles.tooltip}>{label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Droite: grande image */}
      <aside className={styles.right}>
        <img src={cover.mainImage} alt="main" />
      </aside>
    </div>
  );
};

export default ProjectCategoryDesktop;
