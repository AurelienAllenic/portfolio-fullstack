import { useState, useEffect } from "react";
import Nav from "./components/General/Nav/Nav";
import Contact from "./components/Sections/Contact/Contact";
import Hero from "./components/Sections/Hero/Hero";
import Projects from "./components/Sections/Projects/Projects";
import MobileNav from "./components/General/Nav/MobileNav";
import SliderProjects from "./components/Sections/Projects/SliderProjects";
import { ModalCVProvider } from "./components/General/Nav/ModalCVContext";
import { NavigationProvider, useNavigation } from "./components/General/Nav/NavigationContext";
import TransitionOverlay from "./components/General/Nav/TransitionOverlay";

const SinglePage = () => {
  const [showProjects, setShowProjects] = useState(false);
  const [returnFromProjects, setReturnFromProjects] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [forceProjectsIndex, setForceProjectsIndex] = useState<number | undefined>(undefined);

  const handleTransitionToProjects = () => {
    setShowProjects(true);
    setForceProjectsIndex(undefined);
  };

  const handleReturnToHero = () => {
    console.log('🏠 [SINGLEPAGE] handleReturnToHero called');
    setShowProjects(false);
    setReturnFromProjects(true);
    setForceProjectsIndex(undefined);

    // NE PAS réinitialiser returnFromProjects automatiquement
    // Il sera réinitialisé manuellement par Hero quand nécessaire
  };

  const handleTransitionToContact = () => {
    setShowContact(true);
  };

  const handleCloseContact = () => {
    console.log('🏠 [SINGLEPAGE] handleCloseContact called');
    setShowContact(false);
    // Réinitialiser forceProjectsIndex pour permettre le scroll libre
    setTimeout(() => {
      console.log('📍 [SINGLEPAGE] Resetting forceProjectsIndex after closing Contact');
      setForceProjectsIndex(undefined);
    }, 600); // Après l'animation de transition
    // Garder Projects monté pour que SliderProjects puisse gérer le scroll
  };

  return (
    <ModalCVProvider>
      <NavigationProvider>
        <SinglePageContent
          showProjects={showProjects}
          returnFromProjects={returnFromProjects}
          showContact={showContact}
          forceProjectsIndex={forceProjectsIndex}
          handleTransitionToProjects={handleTransitionToProjects}
          handleReturnToHero={handleReturnToHero}
          handleTransitionToContact={handleTransitionToContact}
          handleCloseContact={handleCloseContact}
          setReturnFromProjects={setReturnFromProjects}
          setForceProjectsIndex={setForceProjectsIndex}
          setShowProjects={setShowProjects}
        />
      </NavigationProvider>
    </ModalCVProvider>
  );
};

const SinglePageContent = ({
  showProjects,
  returnFromProjects,
  showContact,
  forceProjectsIndex,
  handleTransitionToProjects,
  handleReturnToHero,
  handleTransitionToContact,
  handleCloseContact,
  setReturnFromProjects,
  setForceProjectsIndex,
  setShowProjects,
}: {
  showProjects: boolean;
  returnFromProjects: boolean;
  showContact: boolean;
  forceProjectsIndex: number | undefined;
  handleTransitionToProjects: () => void;
  handleReturnToHero: () => void;
  handleTransitionToContact: () => void;
  handleCloseContact: () => void;
  setReturnFromProjects: (value: boolean) => void;
  setForceProjectsIndex: (value: number | undefined) => void;
  setShowProjects: (value: boolean) => void;
}) => {
  const { 
    heroState, 
    isTransitioning, 
    transitionDirection, 
    setReturnToHero,
    setNavigateToProjects,
    setNavigateToContact,
    shouldResetHeroStates,
    shouldResetHeroStatesRef,
    shouldResetProjectsStates,
    resetNavigationFlags,
    updateCurrentSection
  } = useNavigation();

  // Synchroniser currentSectionRef avec l'état actuel
  useEffect(() => {
    if (showContact) {
      updateCurrentSection?.("contact");
    } else if (showProjects) {
      updateCurrentSection?.("projects");
    } else {
      updateCurrentSection?.("hero");
    }
  }, [showContact, showProjects, updateCurrentSection]);

  // États locaux pour la synchronisation
  const [heroTextIndex, setHeroTextIndex] = useState<number | undefined>(undefined);
  const [heroNavigationReset, setHeroNavigationReset] = useState(false);

  useEffect(() => {
    setReturnToHero(() => {
      // Read the ref value for synchronous access
      const isNavigationClick = shouldResetHeroStatesRef.current;
      console.log('🏠 [SINGLEPAGE] setReturnToHero - showProjects:', showProjects, 'showContact:', showContact, 'shouldResetHeroStates:', shouldResetHeroStates, 'shouldResetHeroStatesRef.current:', isNavigationClick);
      
      // If this is a navigation click (shouldResetHeroStatesRef is true), reset returnFromProjects
      if (isNavigationClick) {
        console.log('🏠 [SINGLEPAGE] Navigation click - resetting returnFromProjects to false');
        setReturnFromProjects(false);
      }
      
      // Fermer Contact si ouvert
      if (showContact) {
        console.log('🏠 [SINGLEPAGE] Closing Contact');
        handleCloseContact();
      }
      
      // Only call handleReturnToHero if we're on Projects AND it's NOT a navigation click (scroll return)
      if (showProjects && !isNavigationClick) {
        console.log('🏠 [SINGLEPAGE] Closing Projects via scroll - calling handleReturnToHero');
        handleReturnToHero();
      } else if (showProjects && isNavigationClick) {
        // Navigation click from Projects - just close Projects without setting returnFromProjects
        console.log('🏠 [SINGLEPAGE] Closing Projects via nav click - NOT calling handleReturnToHero');
        setShowProjects(false);
      }
    });
  }, [showProjects, showContact, handleReturnToHero, handleCloseContact, setReturnToHero, shouldResetHeroStates, shouldResetHeroStatesRef]);

  useEffect(() => {
    setNavigateToProjects(() => {
      console.log('📍 [NAV] Navigate to Projects called');
      // Fermer Contact si ouvert
      if (showContact) {
        handleCloseContact();
      }
      handleTransitionToProjects();
      // Forcer la première catégorie SEULEMENT si on vient d'ailleurs (pas déjà sur Projects)
      if (!showProjects) {
        console.log('📍 [NAV] Setting forceProjectsIndex to 0');
        setForceProjectsIndex(0);
        // Réinitialiser après un court délai pour éviter les re-applications
        setTimeout(() => {
          console.log('📍 [NAV] Resetting forceProjectsIndex to undefined');
          setForceProjectsIndex(undefined);
        }, 500);
      }
    });
  }, [setNavigateToProjects, handleTransitionToProjects, showContact, handleCloseContact, showProjects]);

  // Gérer la réinitialisation des états Hero lors de la navigation
  useEffect(() => {
    console.log('🔄 [SINGLEPAGE] shouldResetHeroStates changed to:', shouldResetHeroStates);
    if (shouldResetHeroStates) {
      // Déterminer le textIndex en fonction de heroState
      const targetTextIndex = heroState === "hero2" ? 0 : undefined;
      console.log('🔄 [SINGLEPAGE] Setting heroTextIndex to:', targetTextIndex, 'heroNavigationReset to true');
      setHeroTextIndex(targetTextIndex);
      setHeroNavigationReset(true);
      
      // Réinitialiser les flags après un court délai
      setTimeout(() => {
        console.log('🔄 [SINGLEPAGE] Resetting heroNavigationReset and heroTextIndex');
        setHeroNavigationReset(false);
        setHeroTextIndex(undefined);
        resetNavigationFlags();
      }, 200);
    }
  }, [shouldResetHeroStates, heroState, resetNavigationFlags]);

  // Gérer la réinitialisation des états Projects lors de la navigation
  useEffect(() => {
    if (shouldResetProjectsStates) {
      console.log('📍 [RESET] shouldResetProjectsStates triggered, forcing index to 0');
      // Force l'index à 0 pour Projects
      setForceProjectsIndex(0);
      
      // Réinitialiser les flags ET le forceIndex après un court délai
      setTimeout(() => {
        console.log('📍 [RESET] Resetting flags and forceIndex');
        setForceProjectsIndex(undefined);
        resetNavigationFlags();
      }, 500);
    }
  }, [shouldResetProjectsStates, setForceProjectsIndex, resetNavigationFlags]);

  useEffect(() => {
    setNavigateToContact(() => {
      // D'abord monter Projects si pas déjà monté (pour que SliderProjects puisse gérer le scroll)
      if (!showProjects) {
        setShowProjects(true);
        // Forcer l'index à la dernière catégorie (3)
        setForceProjectsIndex(3);
        // Attendre que Projects soit monté avant d'afficher Contact
        setTimeout(() => {
          handleTransitionToContact();
        }, 200);
      } else {
        // Si Projects est déjà monté, ne PAS forcer l'index (garder la catégorie actuelle)
        handleTransitionToContact();
      }
    });
  }, [setNavigateToContact, handleTransitionToContact, showProjects, setForceProjectsIndex, setShowProjects]);

  return (
    <>
      <Nav />
      <MobileNav />
      <TransitionOverlay
        isActive={isTransitioning}
        onComplete={() => {}}
        direction={transitionDirection}
      />
      {!showProjects && !showContact && (
        <Hero
          onTransitionToProjects={handleTransitionToProjects}
          returnFromProjects={returnFromProjects}
          onResetReturnFromProjects={() => {
            console.log('🏠 [SINGLEPAGE] Hero requested reset of returnFromProjects');
            setReturnFromProjects(false);
          }}
          forceHeroState={returnFromProjects ? undefined : (shouldResetHeroStates ? heroState : undefined)}
          forceTextIndex={heroTextIndex}
          onNavigationReset={heroNavigationReset}
        />
      )}
      {console.log('🔧 [SINGLEPAGE] forceHeroState calculation - returnFromProjects:', returnFromProjects, 'shouldResetHeroStates:', shouldResetHeroStates, 'heroState:', heroState, 'RESULT:', returnFromProjects ? undefined : (shouldResetHeroStates ? heroState : undefined))}
      {console.log('🎬 [SINGLEPAGE] Render - showProjects:', showProjects, 'showContact:', showContact, 'returnFromProjects:', returnFromProjects, 'heroState:', heroState)}
      {showProjects && (
        <div style={{ display: showContact ? 'none' : 'block', position: 'relative', zIndex: 1 }}>
          <Projects onTransitionToHero={handleReturnToHero} />
          <SliderProjects 
            onTransitionToContact={handleTransitionToContact}
            onTransitionFromContact={handleCloseContact}
            forceIndex={forceProjectsIndex}
            onForceIndexComplete={() => {
              console.log('📍 [SLIDER] onForceIndexComplete called');
              // Ne rien faire ici, la réinitialisation est gérée par le setTimeout dans SinglePage
            }}
          />
        </div>
      )}
      {showContact && <div style={{ position: 'relative', zIndex: 2 }}><Contact /></div>}
    </>
  );
};

export default SinglePage;
