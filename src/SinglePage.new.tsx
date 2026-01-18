import Nav from "./components/General/Nav/Nav";
import Contact from "./components/Sections/Contact/Contact";
import Hero from "./components/Sections/Hero/Hero";
import Projects from "./components/Sections/Projects/Projects";
import MobileNav from "./components/General/Nav/MobileNav";
import SliderProjects from "./components/Sections/Projects/SliderProjects";
import { ModalCVProvider } from "./components/General/Nav/ModalCVContext";
import { AppStateProvider, useAppState } from "./state/AppStateContext";
import { useScrollManager } from "./hooks/useScrollManager";
import TransitionOverlay from "./components/General/Nav/TransitionOverlay";

/**
 * NOUVELLE ARCHITECTURE - SIMPLIFIÉE
 * 
 * - Tous les composants sont toujours montés (pas de montage/démontage)
 * - Visibilité contrôlée par l'état centralisé
 * - Un seul gestionnaire de scroll
 * - État prévisible et cohérent
 */

const SinglePage = () => {
  return (
    <ModalCVProvider>
      <AppStateProvider>
        <SinglePageContent />
      </AppStateProvider>
    </ModalCVProvider>
  );
};

const SinglePageContent = () => {
  const { state } = useAppState();
  
  // Installer le gestionnaire de scroll unique
  useScrollManager();

  // Déterminer quelle section est active
  const isHeroVisible = state.section.type === "heroBeforeScroll" || state.section.type === "heroAfterScroll";
  const isProjectsVisible = state.section.type === "projects";
  const isContactVisible = state.section.type === "contact";

  // Déterminer le sous-état de Hero
  const heroState = state.section.type === "heroAfterScroll" ? "hero2" : "hero1";
  const heroTextIndex = state.section.type === "heroAfterScroll" ? state.section.textIndex : undefined;

  // Déterminer le sous-état de Projects
  const projectsCategoryIndex = state.section.type === "projects" ? state.section.categoryIndex : 0;

  return (
    <>
      <Nav />
      <MobileNav />
      
      <TransitionOverlay
        isActive={state.transitionState === "transitioning"}
        onComplete={() => {}}
        direction={state.transitionState === "transitioning" ? "close" : "open"}
      />

      {/* Hero - Toujours monté, visibilité contrôlée */}
      <div style={{ display: isHeroVisible ? "block" : "none" }}>
        <Hero
          heroState={heroState}
          textIndex={heroTextIndex}
          isVisible={isHeroVisible}
        />
      </div>

      {/* Projects - Toujours monté, visibilité contrôlée */}
      <div style={{ display: isProjectsVisible ? "block" : "none" }}>
        <Projects isVisible={isProjectsVisible} />
        <SliderProjects
          categoryIndex={projectsCategoryIndex}
          isVisible={isProjectsVisible}
        />
      </div>

      {/* Contact - Toujours monté, visibilité contrôlée */}
      <div style={{ display: isContactVisible ? "block" : "none" }}>
        <Contact isVisible={isContactVisible} />
      </div>
    </>
  );
};

export default SinglePage;
