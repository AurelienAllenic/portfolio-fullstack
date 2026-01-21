import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import styles from "./projects.module.scss";
import type { Project } from "./ProjectCategory";

interface SingleProjectProps {
  projects: Project[];
  categoryTitle: string;
  initialProjectIndex?: number;
  onBack?: () => void;
}

const SingleProject = ({ 
  projects, 
  categoryTitle, 
  initialProjectIndex = 0,
  onBack 
}: SingleProjectProps) => {
  const [selectedIndex, setSelectedIndex] = useState(initialProjectIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedProject = projects[selectedIndex];

  // Animation d'entrée
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    gsap.fromTo(
      container,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      }
    );
  }, []);

  // Animation lors du changement de projet
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mainImage = container.querySelector(`.${styles.projectMainImage}`);
    const title = container.querySelector(`.${styles.projectTitle}`);
    const description = container.querySelector(`.${styles.projectDescription}`);
    const techIcons = container.querySelectorAll(`.${styles.techIcon}`);
    const buttons = container.querySelectorAll(`.${styles.projectButton}`);

    gsap.fromTo(
      [mainImage, title, description, techIcons, buttons],
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
      }
    );
  }, [selectedIndex]);

  const handleImageClick = (index: number) => {
    if (index !== selectedIndex) {
      setSelectedIndex(index);
    }
  };

  const getTechIcon = (tech: string): string => {
    const techMap: { [key: string]: string } = {
      html: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/html_yzkdbv.webp",
      css: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/css_ldbn4p.webp",
      scss: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/scss_f6hkzy.webp",
      javascript: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/js_cbaqmr.webp",
      reactjs: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/react_jzelsd.webp",
      nodejs: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/nodejs_lqsesq.webp",
      python: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/python_ldgrbv.webp",
      django: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/django_dyc8kz.webp",
      nextjs: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/next_ep27nk.webp",
    };
    return techMap[tech.toLowerCase()] || "";
  };

  const getTechName = (tech: string): string => {
    const techNames: { [key: string]: string } = {
      html: "HTML",
      css: "CSS",
      scss: "SCSS",
      javascript: "JavaScript",
      reactjs: "React",
      nodejs: "Node.js",
      python: "Python",
      django: "Django",
      nextjs: "Next.js",
      jquery: "jQuery",
      seo: "SEO",
      backlog: "Backlog",
      twig: "Twig",
      flask: "Flask",
      pytest: "Pytest",
      sql: "SQL",
      sentry: "Sentry",
      "django rest": "Django Rest",
      "pipeline ci/cd": "CI/CD",
      docker: "Docker",
      "styled-components": "Styled Components",
      userstories: "User Stories",
      figma: "Figma",
    };
    return techNames[tech.toLowerCase()] || tech.charAt(0).toUpperCase() + tech.slice(1);
  };

  return (
    <div ref={containerRef} className={styles.containerSingleProject}>
      {/* Slider d'images en haut */}
      <div className={styles.topSlider}>
        {projects.map((project, index) => (
          <div
            key={project.id}
            className={`${styles.sliderImage} ${
              index === selectedIndex ? styles.sliderImageActive : ""
            }`}
            onClick={() => handleImageClick(index)}
          >
            <img src={project.image} alt={project.title} />
          </div>
        ))}
      </div>

      {/* Contenu du projet sélectionné */}
      <div className={styles.projectContent}>
        {/* Image principale */}
        <div className={styles.projectMainImage}>
          <img src={selectedProject.image} alt={selectedProject.title} />
        </div>

        {/* Détails du projet */}
        <div className={styles.projectDetails}>
          {/* Titre */}
          <h2 className={styles.projectTitle}>{selectedProject.title}</h2>

          {/* Description */}
          <p className={styles.projectDescription}>{selectedProject.description}</p>

          {/* Icônes des technologies */}
          <div className={styles.techIcons}>
            {selectedProject.technologies.map((tech, index) => {
              const iconUrl = getTechIcon(tech);
              return iconUrl ? (
                <div key={index} className={styles.techIconContainer}>
                  <img src={iconUrl} alt={tech} className={styles.techIcon} />
                  <span className={styles.techTooltip}>{getTechName(tech)}</span>
                </div>
              ) : (
                <div key={index} className={styles.techBadge}>
                  {getTechName(tech)}
                </div>
              );
            })}
          </div>

          {/* Boutons d'action */}
          <div className={styles.projectButtons}>
            {selectedProject.github && (
              <a
                href={selectedProject.github}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.projectButton}
              >
                GitHub
              </a>
            )}
            {selectedProject.demo && (
              <a
                href={selectedProject.demo}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.projectButton}
              >
                Live Demo
              </a>
            )}
            {selectedProject.figma && (
              <a
                href={selectedProject.figma}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.projectButton}
              >
                Figma
              </a>
            )}
            {selectedProject.folder && Array.isArray(selectedProject.folder) && (
              <>
                {selectedProject.folder.map((item) => (
                  <a
                    key={item.id}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.projectButton}
                  >
                    {item.title}
                  </a>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Nom de la catégorie en bas à droite */}
        <div className={styles.categoryLabel}>{categoryTitle}</div>
      </div>

      {/* Bouton retour */}
      <button 
        onClick={() => {
          if (onBack) {
            onBack();
          } else {
            // Essayer de fermer l'onglet, sinon retourner à l'accueil
            window.close();
            setTimeout(() => {
              window.location.href = "/";
            }, 100);
          }
        }} 
        className={styles.backButton}
      >
        ← Retour
      </button>
    </div>
  );
};

export default SingleProject;
