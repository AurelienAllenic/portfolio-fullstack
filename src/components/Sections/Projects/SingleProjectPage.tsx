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
  projects,
  solead,
  iim,
} from "./Data";
import type { ProjectCover, Project } from "./ProjectCategory";
import { useTrackSectionArrival } from "../../../hooks/useTrackSectionArrival";
import FormationSelector from "./FormationSelector";
import styles from "./projects.module.scss";

const FORMATION_SLUGS = ["formation-web", "formation-react", "formation-python"] as const;

const SingleProjectPage = () => {
  const { categorySlug, programmingLanguage } = useParams<{ categorySlug: string; programmingLanguage?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isTransitioningBack, setIsTransitioningBack] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showEntryOverlay, setShowEntryOverlay] = useState(true);
  const backTargetRef = useRef("/");

  useTrackSectionArrival('page_projects');

  const isFormationsOpenclassrooms = categorySlug === "formations-openclassrooms";
  const formationSlug = isFormationsOpenclassrooms && programmingLanguage && FORMATION_SLUGS.includes(programmingLanguage as typeof FORMATION_SLUGS[number])
    ? programmingLanguage
    : null;
  const isFormationSelectorPage = isFormationsOpenclassrooms && !formationSlug;
  
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
    projects,
    solead,
    iim,
  ];

  const categoryIndex = covers.findIndex(cover => cover.slug === categorySlug);
  let filteredProjects: Project[] = projectsData[categoryIndex] || [];

  if (formationSlug) {
    const formation = OPENCLASSROOMS_FORMATIONS.find(f => f.slug === formationSlug);
    filteredProjects = formation ? (formation.projects as Project[]) : [];
  } else if (programmingLanguage && categoryIndex !== -1) {
    const normalizedLanguage = programmingLanguage.toLowerCase();
    filteredProjects = filteredProjects.filter(project => 
      project.technologies.some(tech => {
        const normalizedTech = tech.toLowerCase();
        if (normalizedLanguage === 'react' && (normalizedTech === 'reactjs' || normalizedTech === 'react')) return true;
        if (normalizedLanguage === 'reactjs' && (normalizedTech === 'reactjs' || normalizedTech === 'react')) return true;
        if (normalizedLanguage === 'node' && (normalizedTech === 'nodejs' || normalizedTech === 'node')) return true;
        if (normalizedLanguage === 'nodejs' && (normalizedTech === 'nodejs' || normalizedTech === 'node')) return true;
        if (normalizedLanguage === 'next' && (normalizedTech === 'nextjs' || normalizedTech === 'next')) return true;
        if (normalizedLanguage === 'nextjs' && (normalizedTech === 'nextjs' || normalizedTech === 'next')) return true;
        if (normalizedLanguage === 'js' && (normalizedTech === 'javascript' || normalizedTech === 'js')) return true;
        if (normalizedLanguage === 'javascript' && (normalizedTech === 'javascript' || normalizedTech === 'js')) return true;
        return normalizedTech === normalizedLanguage;
      })
    );
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

  if (categoryIndex === -1 && !isFormationSelectorPage && !formationSlug) {
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
    backTargetRef.current = formationSlug ? "/projects/formations-openclassrooms" : "/";
    if (!formationSlug) {
      sessionStorage.setItem('shouldRestoreScroll', 'true');
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

  // Éviter que l'overlay "in" (fermeture) reste actif après navigation formation → sélecteur
  useEffect(() => {
    if (isFormationSelectorPage) {
      setIsTransitioningBack(false);
    }
  }, [isFormationSelectorPage]);

  if (isFormationSelectorPage) {
    return (
      <>
        <RadialTransitionOverlay
          isActive={showEntryOverlay}
          direction="out"
          onComplete={() => setShowEntryOverlay(false)}
        />
        <RadialTransitionOverlay
          isActive={isTransitioningBack}
          direction="in"
          onComplete={handleTransitionBackComplete}
        />
        <div style={{ opacity: showContent ? 1 : 0, position: "relative" }}>
          <FormationSelector formations={OPENCLASSROOMS_FORMATIONS} />
          <button
            type="button"
            onClick={handleBack}
            className={styles.formationSelectorBackButton}
            aria-label="Retour à l'accueil"
          >
            ← Retour
          </button>
        </div>
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
        />
      </div>
      <LanguageToggle />
    </>
  );
};

export default SingleProjectPage;
