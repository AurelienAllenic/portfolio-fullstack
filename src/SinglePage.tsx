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
  // Vérifier immédiatement si on doit restaurer
  const shouldRestore = sessionStorage.getItem('shouldRestoreScroll') === 'true';
  const savedCategoryIndex = sessionStorage.getItem('lastProjectCategoryIndex');
  const initialShowProjects = shouldRestore && savedCategoryIndex;
  const initialForceIndex = initialShowProjects ? parseInt(savedCategoryIndex!) : undefined;
  
  // Vérifier si on revient de Credits, Mentions ou PolitiqueConfidentialite vers Contact
  const returningFromCreditsToContact = sessionStorage.getItem('returningFromCreditsToContact') === 'true';
  const returningFromMentionsToContact = sessionStorage.getItem('returningFromMentionsToContact') === 'true';
  const returningFromPolitiqueConfidentialiteToContact = sessionStorage.getItem('returningFromPolitiqueConfidentialiteToContact') === 'true';
  const returningToContact = returningFromCreditsToContact || returningFromMentionsToContact || returningFromPolitiqueConfidentialiteToContact;
  const initialShowContact = returningToContact;
  const initialShowProjectsForContact = returningToContact; // Projects doit être monté pour Contact

  const [showProjects, setShowProjects] = useState(!!initialShowProjects || initialShowProjectsForContact);
  const [returnFromProjects, setReturnFromProjects] = useState(false);
  const [showContact, setShowContact] = useState(initialShowContact);
  const [forceProjectsIndex, setForceProjectsIndex] = useState<number | undefined>(
    initialShowContact ? 3 : initialForceIndex // Forcer la dernière catégorie si on va à Contact
  );

  // Nettoyer sessionStorage après la restauration
  useEffect(() => {
    if (shouldRestore && savedCategoryIndex) {
      
      // Réinitialiser le scroll immédiatement
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      
      // Nettoyer après un délai
      setTimeout(() => {
        sessionStorage.removeItem('shouldRestoreScroll');
        sessionStorage.removeItem('lastProjectCategoryIndex');
        setForceProjectsIndex(undefined);
        // S'assurer que le scroll est toujours à 0
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
      }, 1000);
    }
  }, []);

  const handleTransitionToProjects = (categoryIndex?: number) => {
    console.log('[handleTransitionToProjects] Appelé avec categoryIndex:', categoryIndex);
    setShowProjects(true);
    // Seulement réinitialiser forceProjectsIndex si pas de catégorie spécifiée
    if (categoryIndex === undefined) {
      console.log('[handleTransitionToProjects] categoryIndex undefined, réinitialisation de forceProjectsIndex');
      setForceProjectsIndex(undefined);
    } else {
      console.log('[handleTransitionToProjects] categoryIndex défini, PAS de réinitialisation');
    }
  };

  const handleReturnToHero = () => {
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
    setShowContact(false);
    // Réinitialiser forceProjectsIndex pour permettre le scroll libre
    setTimeout(() => {
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
  handleTransitionToProjects: (categoryIndex?: number) => void;
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
    navigateToContact,
    shouldResetHeroStates,
    shouldResetHeroStatesRef,
    shouldResetProjectsStates,
    lastProjectsCategoryIndexRef,
    resetNavigationFlags,
    updateCurrentSection
  } = useNavigation();

  // Vérifier dès l'initialisation si on est en mode restauration
  const isRestoringFromProjects = sessionStorage.getItem('shouldRestoreScroll') === 'true';
  const isReturningFromCredits = sessionStorage.getItem('returningFromCreditsToContact') === 'true';
  const isReturningFromMentions = sessionStorage.getItem('returningFromMentionsToContact') === 'true';
  const isReturningFromPolitiqueConfidentialite = sessionStorage.getItem('returningFromPolitiqueConfidentialiteToContact') === 'true';
  const isReturningToContact = isReturningFromCredits || isReturningFromMentions || isReturningFromPolitiqueConfidentialite;

  // États locaux pour la synchronisation
  const [heroTextIndex, setHeroTextIndex] = useState<number | undefined>(undefined);
  const [heroNavigationReset, setHeroNavigationReset] = useState(false);
  // Si on revient de Credits ou Mentions, Contact est monté mais doit être invisible jusqu'à l'animation
  // Si on restaure depuis Projects, on cache d'abord puis on affiche après un délai
  const [showContent, setShowContent] = useState(!isRestoringFromProjects || isReturningToContact);
  const [navOpacity, setNavOpacity] = useState((isRestoringFromProjects && !isReturningToContact) ? 0 : 1);
  // État pour contrôler la visibilité de Contact lors du retour depuis Credits ou Mentions
  const [isContactVisible, setIsContactVisible] = useState(!isReturningToContact);

  // Gérer la visibilité du contenu lors de la restauration
  // Note: Si on revient de Credits ou Mentions, showContent est déjà true, donc pas besoin de délai
  useEffect(() => {
    if (isRestoringFromProjects && !isReturningToContact) {
      // Commencer à afficher la nav plus tôt (après 100ms)
      const navTimer = setTimeout(() => {
        setNavOpacity(1);
      }, 100);
      
      const contentTimer = setTimeout(() => {
        setShowContent(true);
      }, 300);

      return () => {
        clearTimeout(navTimer);
        clearTimeout(contentTimer);
      };
    }
  }, [isRestoringFromProjects, isReturningToContact]);

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

  useEffect(() => {
    setReturnToHero(() => {
      // Read the ref value for synchronous access
      const isNavigationClick = shouldResetHeroStatesRef.current;
      
      // If this is a navigation click (shouldResetHeroStatesRef is true), reset returnFromProjects
      if (isNavigationClick) {
        setReturnFromProjects(false);
      }
      
      // Fermer Contact si ouvert
      if (showContact) {
        handleCloseContact();
      }
      
      // Only call handleReturnToHero if we're on Projects AND it's NOT a navigation click (scroll return)
      if (showProjects && !isNavigationClick) {
        handleReturnToHero();
      } else if (showProjects && isNavigationClick) {
        // Navigation click from Projects - just close Projects without setting returnFromProjects
        setShowProjects(false);
      }
    });
  }, [showProjects, showContact, handleReturnToHero, handleCloseContact, setReturnToHero, shouldResetHeroStates, shouldResetHeroStatesRef]);

  useEffect(() => {
    setNavigateToProjects((categoryIndex?: number) => {
      console.log('[setNavigateToProjects callback] Début avec categoryIndex:', categoryIndex, 'showProjects:', showProjects);
      // Fermer Contact si ouvert
      if (showContact) {
        handleCloseContact();
      }
      handleTransitionToProjects(categoryIndex);
      console.log('[setNavigateToProjects callback] Après handleTransitionToProjects, showProjects:', showProjects);
      // Forcer la catégorie spécifiée ou la première si non spécifiée
      if (!showProjects) {
        const indexToUse = categoryIndex !== undefined ? categoryIndex : 0;
        console.log('[setNavigateToProjects callback] showProjects est false, setForceProjectsIndex(', indexToUse, ')');
        setForceProjectsIndex(indexToUse);
        // Réinitialiser après un court délai pour éviter les re-applications
        setTimeout(() => {
          console.log('[setNavigateToProjects callback] Réinitialisation de forceProjectsIndex après 500ms');
          setForceProjectsIndex(undefined);
        }, 500);
      } else {
        console.log('[setNavigateToProjects callback] showProjects est true, skipping forceProjectsIndex');
      }
    });
  }, [setNavigateToProjects, handleTransitionToProjects, showContact, handleCloseContact, showProjects]);

  // Gérer la réinitialisation des états Hero lors de la navigation
  useEffect(() => {
    if (shouldResetHeroStates) {
      // Déterminer le textIndex en fonction de heroState
      const targetTextIndex = heroState === "hero2" ? 0 : undefined;
      setHeroTextIndex(targetTextIndex);
      setHeroNavigationReset(true);
      
      // Réinitialiser les flags après un court délai
      setTimeout(() => {
        setHeroNavigationReset(false);
        setHeroTextIndex(undefined);
        resetNavigationFlags();
      }, 200);
    }
  }, [shouldResetHeroStates, heroState, resetNavigationFlags]);

  // Gérer la réinitialisation des états Projects lors de la navigation
  useEffect(() => {
    if (shouldResetProjectsStates) {
      // Utiliser l'index sauvegardé, sinon forcer à 0
      const indexToForce = lastProjectsCategoryIndexRef.current !== undefined ? lastProjectsCategoryIndexRef.current : 0;
      console.log('[shouldResetProjectsStates] Forçage à l\'index:', indexToForce, 'lastProjectsCategoryIndexRef:', lastProjectsCategoryIndexRef.current);
      setForceProjectsIndex(indexToForce);
      
      // Réinitialiser les flags ET le forceIndex après un court délai
      setTimeout(() => {
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

  // Gérer le retour depuis Credits, Mentions ou PolitiqueConfidentialite vers Contact
  useEffect(() => {
    const returningFromCredits = sessionStorage.getItem('returningFromCreditsToContact') === 'true';
    const returningFromMentions = sessionStorage.getItem('returningFromMentionsToContact') === 'true';
    const returningFromPolitiqueConfidentialite = sessionStorage.getItem('returningFromPolitiqueConfidentialiteToContact') === 'true';
    if (returningFromCredits || returningFromMentions || returningFromPolitiqueConfidentialite) {
      // Nettoyer les flags immédiatement
      if (returningFromCredits) {
        sessionStorage.removeItem('returningFromCreditsToContact');
      }
      if (returningFromMentions) {
        sessionStorage.removeItem('returningFromMentionsToContact');
      }
      if (returningFromPolitiqueConfidentialite) {
        sessionStorage.removeItem('returningFromPolitiqueConfidentialiteToContact');
      }
      
      // Contact est monté mais invisible, on déclenche immédiatement l'animation de navigation
      // qui va d'abord fermer (écran noir) puis ouvrir (révélation)
      // L'animation "close" dure 800ms, puis "open" commence et dure 800ms
      navigateToContact();
      // Rendre Contact visible après le début de l'animation d'ouverture (800ms close + petit délai)
      setTimeout(() => {
        setIsContactVisible(true);
      }, 900);
    }
  }, [navigateToContact]);

  return (
    <>
      <div style={{ opacity: navOpacity, transition: 'opacity 0.4s ease' }}>
        <Nav />
        <MobileNav />
      </div>
      {showContent && (
        <div style={{ 
          opacity: 1,
          transition: 'opacity 0.4s ease'
        }}>
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
              setReturnFromProjects(false);
            }}
            forceHeroState={returnFromProjects ? undefined : (shouldResetHeroStates ? heroState : undefined)}
            forceTextIndex={heroTextIndex}
            onNavigationReset={heroNavigationReset}
          />
        )}
        {showProjects && (
          <div style={{ display: showContact ? 'none' : 'block', position: 'relative', zIndex: 1 }}>
            <Projects onTransitionToHero={handleReturnToHero} />
            <SliderProjects 
              onTransitionToContact={handleTransitionToContact}
              onTransitionFromContact={handleCloseContact}
              forceIndex={forceProjectsIndex}
              onForceIndexComplete={() => {
                // Ne rien faire ici, la réinitialisation est gérée par le setTimeout dans SinglePage
              }}
            />
          </div>
        )}
        {showContact && (
          <div 
            style={{ 
              position: 'relative', 
              zIndex: 2,
              opacity: isContactVisible ? 1 : 0,
              transition: isContactVisible ? 'opacity 0.3s ease' : 'none'
            }}
          >
            <Contact />
          </div>
        )}
        </div>
      )}
    </>
  );
};

export default SinglePage;
