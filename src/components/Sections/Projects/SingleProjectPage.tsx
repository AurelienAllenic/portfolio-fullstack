import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import SingleProject from "./SingleProject";
import RadialTransitionOverlay from "../../General/Nav/RadialTransitionOverlay";
import LanguageToggle from "../../General/Language/LanguageToggle";
import {
  openclassrooms1_cover,
  openclassrooms2_cover,
  openclassrooms3_cover,
  projects_cover,
  solead_cover,
  openclassrooms1,
  openclassrooms2,
  openclassrooms3,
  projects,
  solead,
  iim,
  iim_cover,
} from "./Data";
import type { ProjectCover, Project } from "./ProjectCategory";
import { useTrackSectionArrival } from "../../../hooks/useTrackSectionArrival";

const SingleProjectPage = () => {
  const { categorySlug, programmingLanguage } = useParams<{ categorySlug: string; programmingLanguage?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isTransitioningBack, setIsTransitioningBack] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useTrackSectionArrival('page_projects');
  
  const categoryKeyMap: Record<string, string> = {
    "formation-web": "web",
    "formation-react": "react",
    "formation-python": "python",
    "projets-personnels": "personnel",
    "projets-solead": "solead",
    "mastere-iim": "iim",
  };

  const covers: ProjectCover[] = [
    projects_cover,
    solead_cover,
    iim_cover,
    openclassrooms3_cover,
    openclassrooms2_cover,
    openclassrooms1_cover,
  ];

  const projectsData: Project[][] = [
    projects,
    solead,
    iim,
    openclassrooms3,
    openclassrooms2,
    openclassrooms1,
  ];

  const categoryIndex = covers.findIndex(cover => cover.slug === categorySlug);
  let filteredProjects = projectsData[categoryIndex] || [];
  if (programmingLanguage && categoryIndex !== -1) {
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
  
  if (projectIndexParam && categoryIndex !== -1) {
    const originalIndex = parseInt(projectIndexParam, 10);
    const allProjects = projectsData[categoryIndex] || [];

    if (programmingLanguage && allProjects[originalIndex]) {
      const targetProject = allProjects[originalIndex];
      const filteredIndex = filteredProjects.findIndex(p => p.id === targetProject.id);
      initialProjectIndex = filteredIndex !== -1 ? filteredIndex : 0;
    } else {
      initialProjectIndex = originalIndex;
    }
  }

  if (categoryIndex === -1) {
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
    sessionStorage.setItem('shouldRestoreScroll', 'true');
    setIsTransitioningBack(true);
  };

  const handleTransitionBackComplete = () => {
    navigate("/");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

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
          categoryKey={categoryKeyMap[categorySlug ?? ""] ?? "web"}
          programmingLanguage={programmingLanguage}
          initialProjectIndex={isNaN(initialProjectIndex) || initialProjectIndex >= filteredProjects.length ? 0 : initialProjectIndex}
          onBack={handleBack}
        />
      </div>
      <LanguageToggle />
    </>
  );
};

export default SingleProjectPage;
