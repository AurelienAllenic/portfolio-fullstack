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
}

const isUrl = (v: string) => /^https?:\/\//i.test(v);

const ProjectCategory = ({ cover }: ProjectCategoryProps) => {
  // projects n'est pas utilisé dans le code mais reste dans les props pour la suite
  return (
    <section className={styles.cover} id="projects">
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
    </section>
  );
};

export default ProjectCategory;