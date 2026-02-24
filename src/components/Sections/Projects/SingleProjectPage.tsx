import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import SingleProject from "./SingleProject";
import RadialTransitionOverlay from "../../General/Nav/RadialTransitionOverlay";
import LanguageToggle from "../../General/Language/LanguageToggle";
import {
  projects_cover,
  solead_cover,
  iim_cover,
  OPENCLASSROOMS_FORMATIONS,
  projectsFiltered,
  solead,
  iim,
  openclassrooms1,
  openclassrooms2,
  openclassrooms3,
} from "./Data";
import type { ProjectCover, Project } from "./ProjectCategory";
import { useTrackSectionArrival } from "../../../hooks/useTrackSectionArrival";
import AllCategoriesSelector from "./AllCategoriesSelector";
import styles from "./projects.module.scss";

const FORMATION_SLUGS = ["formation-web", "formation-react", "formation-python"] as const;

const SingleProjectPage = () => {
  const { categorySlug, programmingLanguage } = useParams<{ categorySlug: string; programmingLanguage?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isTransitioningBack, setIsTransitioningBack] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const backTargetRef = useRef("/");

  useTrackSectionArrival('page_projects');

  const isTousLesProjetsPage = categorySlug === "tous-les-projets";
  // Détecter si on est sur une formation OpenClassrooms (formation-web, formation-react, formation-python)
  const formationSlug = programmingLanguage && FORMATION_SLUGS.includes(programmingLanguage as typeof FORMATION_SLUGS[number])
    ? programmingLanguage
    : null;
  
  const categoryKeyMap: Record<string, string> = {
    "formation-web": "web",
    "formation-react": "react",
    "formation-python": "python",
    "projets-personnels": "personnel",
    "projets-solead": "solead",
    "mastere-iim": "iim",
    "formations-openclassrooms": "openclassrooms",
  };

  const covers: ProjectCover[] = [
    projects_cover,
    solead_cover,
    iim_cover,
  ];

  const projectsData: Project[][] = [
    projectsFiltered,
    solead,
    iim,
  ];

  const categoryIndex = covers.findIndex(cover => cover.slug === categorySlug);
  let filteredProjects: Project[] = projectsData[categoryIndex] || [];

  const filterByLanguage = (projects: Project[], lang: string): Project[] => {
    const normalized = lang.toLowerCase();
    return projects.filter(project =>
      project.technologies.some(tech => {
        const t = tech.toLowerCase();
        if (normalized === 'react' || normalized === 'reactjs') return t === 'reactjs' || t === 'react';
        if (normalized === 'node' || normalized === 'nodejs') return t === 'nodejs' || t === 'node';
        if (normalized === 'next' || normalized === 'nextjs') return t === 'nextjs' || t === 'next';
        if (normalized === 'js' || normalized === 'javascript') return t === 'javascript' || t === 'js';
        return t === normalized;
      })
    );
  };

  if (formationSlug) {
    const formation = OPENCLASSROOMS_FORMATIONS.find(f => f.slug === formationSlug);
    filteredProjects = formation ? (formation.projects as Project[]) : [];
  } else if (isTousLesProjetsPage && programmingLanguage) {
    // Tous les projets (sans Paro, Ascent, Claquettes, Linconnu), toutes catégories confondues
    const EXCLUDED_TITLES = ['Paro', 'Ascent', 'claquettes-swing.fr', 'linconnu-magic.com'];
    const allProjects: Project[] = [
      ...projectsFiltered.filter(p => !EXCLUDED_TITLES.includes(p.title)),
      ...openclassrooms1,
      ...openclassrooms2,
      ...openclassrooms3,
      ...iim,
      ...solead,
    ];
    // Déduplication par titre (les ids ne sont pas uniques entre les tableaux)
    const seen = new Set<string>();
    const deduped = allProjects.filter(p => {
      const key = p.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    filteredProjects = filterByLanguage(deduped, programmingLanguage);
  } else if (programmingLanguage && categoryIndex !== -1) {
    filteredProjects = filterByLanguage(filteredProjects, programmingLanguage);
  }

  const projectIndexParam = searchParams.get('project');
  let initialProjectIndex = 0;

  if (projectIndexParam) {
    const originalIndex = parseInt(projectIndexParam, 10);
    if (formationSlug) {
      initialProjectIndex = filteredProjects.length
        ? Math.max(0, Math.min(originalIndex, filteredProjects.length - 1))
        : 0;
    } else if (categoryIndex !== -1) {
      const allProjects = projectsData[categoryIndex] || [];
      if (programmingLanguage && allProjects[originalIndex]) {
        const targetProject = allProjects[originalIndex];
        const filteredIndex = filteredProjects.findIndex(p => p.id === targetProject.id);
        initialProjectIndex = filteredIndex !== -1 ? filteredIndex : 0;
      } else {
        initialProjectIndex = originalIndex;
      }
    }
  }

  if (categoryIndex === -1 && !formationSlug && !isTousLesProjetsPage) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh", 
        background: "#000", 
        color: "#fff",
        fontFamily: "Arial, sans-serif",
        flexDirection: "column",
        gap: "20px"
      }}>
        <h1>Catégorie introuvable</h1>
        <button 
          onClick={() => {
            window.close();
            setTimeout(() => {
              window.location.href = "/";
            }, 100);
          }}
          style={{
            padding: "10px 20px",
            background: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const handleBack = () => {
    if (formationSlug) {
      // Formation spécifique OpenClassrooms → retour à la page "Autres projets"
      backTargetRef.current = "/projects/tous-les-projets";
    } else if (isTousLesProjetsPage) {
      // Page tous-les-projets → retour à l'accueil
      backTargetRef.current = "/";
      sessionStorage.setItem('shouldRestoreScroll', 'true');
    } else {
      // Toutes les autres catégories (mastere-iim, projets-solead…)
      // → retour à la page de sélection "Autres projets"
      backTargetRef.current = "/projects/tous-les-projets";
    }
    setIsTransitioningBack(true);
  };

  const handleTransitionBackComplete = () => {
    const target = backTargetRef.current;
    navigate(target);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Éviter que l'overlay "in" (fermeture) reste actif après navigation
  useEffect(() => {
    if (isTousLesProjetsPage) {
      setIsTransitioningBack(false);
    }
  }, [isTousLesProjetsPage]);

  if (isTousLesProjetsPage && !programmingLanguage) {
    return (
      <>
        <RadialTransitionOverlay
          isActive={isTransitioningBack}
          direction="in"
          onComplete={handleTransitionBackComplete}
        />
        <AllCategoriesSelector categoryIndex={categoryIndex !== -1 ? categoryIndex : undefined} />
        <button
          type="button"
          onClick={handleBack}
          className={styles.formationSelectorBackButton}
          aria-label="Retour à l'accueil"
        >
          ← Retour
        </button>
        <LanguageToggle />
      </>
    );
  }

  return (
    <>
      <RadialTransitionOverlay
        isActive={isTransitioningBack}
        direction="in"
        onComplete={handleTransitionBackComplete}
      />
      <div style={{ opacity: showContent ? 1 : 0 }}>
        <SingleProject
          projects={filteredProjects}
          categoryKey={formationSlug ? categoryKeyMap[formationSlug] ?? "web" : categoryKeyMap[categorySlug ?? ""] ?? "web"}
          programmingLanguage={formationSlug ? undefined : programmingLanguage}
          initialProjectIndex={isNaN(initialProjectIndex) || initialProjectIndex >= filteredProjects.length ? 0 : initialProjectIndex}
          onBack={handleBack}
          hideCategoryLabel={isTousLesProjetsPage && !!programmingLanguage}
        />
      </div>
      <LanguageToggle />
    </>
  );
};

export default SingleProjectPage;
