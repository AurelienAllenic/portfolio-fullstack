import { useState, useEffect } from "react";
import ProjectCategoryDesktop from "./ProjectCategoryDesktop";
import ProjectCategoryMobile from "./ProjectCategoryMobile";
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
  const [isDesktop, setIsDesktop] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth > 990 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 990);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className={styles.cover} id="projects">
      {isDesktop ? (
        <ProjectCategoryDesktop cover={cover} getLabelFromPath={getLabelFromPath} />
      ) : (
        <ProjectCategoryMobile cover={cover} getLabelFromPath={getLabelFromPath} />
      )}
    </section>
  );
};

export default ProjectCategory;
