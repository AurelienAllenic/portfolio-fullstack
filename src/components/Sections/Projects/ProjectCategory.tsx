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

const getLabelFromPath = (path: string) => {
  const file = path.split("/").pop() || path;
  const base = file.split(".").slice(0, -1).join(".") || file;
  const firstToken = base.split(/[-_.]+/)[0] || base;
  const key = firstToken.toLowerCase();
  const map: Record<string, string> = {
    html: "HTML",
    css: "CSS",
    scss: "SCSS",
    js: "JavaScript",
    javascript: "JavaScript",
    ts: "TypeScript",
    typescript: "TypeScript",
    react: "React",
    next: "Next.js",
    nextjs: "Next.js",
    node: "Node.js",
    nodejs: "Node.js",
    python: "Python",
    django: "Django",
  };
  if (map[key]) return map[key];
  return key.charAt(0).toUpperCase() + key.slice(1);
};

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
              const src = it;
              const label = getLabelFromPath(src);
              return (
                <li key={i} className={styles.iconBadge}>
                  <img src={src} alt={label} />
                  <span className={styles.tooltip}>{label}</span>
                </li>
              );
            }
            const src = it.src;
            const label = it.alt ?? getLabelFromPath(src);
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
      
    </section>
  );
};

export default ProjectCategory;