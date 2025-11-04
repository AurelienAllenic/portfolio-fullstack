import styles from "./projects.module.scss";

type CoverIcon = string | { src: string; alt?: string };

export interface ProjectCover {
  titleFirstPart: string;
  titleSecondPart: string;
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
}

const isUrl = (v: string) => /^https?:\/\//i.test(v);

const ProjectCategory = ({ cover }: ProjectCategoryProps) => {
  return (
    <section className={styles.cover} id="projects">
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
          <span className={styles.titleMain}>
            {cover.titleFirstPart}
          </span>
          <span className={styles.titleAccent}>
            {cover.titleSecondPart}
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

        <ul className={styles.icons}>
          {cover.listIcons.map((it, i) => {
            if (typeof it === "string") {
              return (
                <li key={i} className={styles.iconBadge} data-label={isUrl(it) ? undefined : it}>
                  {isUrl(it) ? <img src={it} alt={`icon-${i}`} /> : it}
                </li>
              );
            }
            return (
              <li key={i} className={styles.iconBadge} data-label={it.alt}>
                <img src={it.src} alt={it.alt ?? `icon-${i}`} />
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
      
    </section>
  );
};

export default ProjectCategory;