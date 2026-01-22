import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SingleProject from "./SingleProject";
import RadialTransitionOverlay from "../../General/Nav/RadialTransitionOverlay";
import {
  openclassrooms1_cover,
  openclassrooms2_cover,
  openclassrooms3_cover,
  projects_cover,
  openclassrooms1,
  openclassrooms2,
  openclassrooms3,
  projects,
  iim,
  iim_cover,
} from "./Data";
import type { ProjectCover, Project } from "./ProjectCategory";

const SingleProjectPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const [isTransitioningBack, setIsTransitioningBack] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const covers: ProjectCover[] = [
    projects_cover,
    iim_cover,
    openclassrooms3_cover,
    openclassrooms2_cover,
    openclassrooms1_cover,
  ];

  const projectsData: Project[][] = [
    projects,
    iim,
    openclassrooms3,
    openclassrooms2,
    openclassrooms1,
  ];

  // Trouver l'index de la catégorie par slug
  const categoryIndex = covers.findIndex(cover => cover.slug === categorySlug);

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
            // Fermer l'onglet ou revenir à l'accueil
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
    // S'assurer que le flag de restauration est bien présent
    sessionStorage.setItem('shouldRestoreScroll', 'true');
    
    // Déclencher l'animation
    setIsTransitioningBack(true);
  };

  const handleTransitionBackComplete = () => {
    // Naviguer après l'animation
    navigate("/");
  };

  useEffect(() => {
    // Afficher le contenu après 0.3s
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
          projects={projectsData[categoryIndex]}
          categoryTitle={covers[categoryIndex].title}
          onBack={handleBack}
        />
      </div>
    </>
  );
};

export default SingleProjectPage;
