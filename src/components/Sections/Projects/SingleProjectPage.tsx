import { useParams } from "react-router-dom";
import SingleProject from "./SingleProject";
import {
  openclassrooms1_cover,
  openclassrooms2_cover,
  openclassrooms3_cover,
  projects_cover,
  openclassrooms1,
  openclassrooms2,
  openclassrooms3,
  projects,
} from "./Data";
import type { ProjectCover, Project } from "./ProjectCategory";

const SingleProjectPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();

  const covers: ProjectCover[] = [
    openclassrooms1_cover,
    openclassrooms2_cover,
    openclassrooms3_cover,
    projects_cover,
  ];

  const projectsData: Project[][] = [
    openclassrooms1,
    openclassrooms2,
    openclassrooms3,
    projects,
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
    // Récupérer la position de scroll sauvegardée
    const savedScrollPosition = sessionStorage.getItem('portfolioScrollPosition');
    
    // Indiquer qu'on doit restaurer le scroll
    if (savedScrollPosition) {
      sessionStorage.setItem('shouldRestoreScroll', 'true');
    }
    
    // Essayer de fermer l'onglet
    window.close();
    
    // Si la fermeture échoue (onglet non ouvert par script), rediriger
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  };

  return (
    <SingleProject
      projects={projectsData[categoryIndex]}
      categoryTitle={covers[categoryIndex].title}
      onBack={handleBack}
    />
  );
};

export default SingleProjectPage;
