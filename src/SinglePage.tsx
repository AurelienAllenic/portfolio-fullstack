import { useState, useEffect, useRef } from "react";
import Nav from "./components/General/Nav/Nav";
import Contact from "./components/Sections/Contact/Contact";
import Hero from "./components/Sections/Hero/Hero";
import Projects from "./components/Sections/Projects/Projects";
import MobileNav from "./components/General/Nav/MobileNav";
import SliderProjects from "./components/Sections/Projects/SliderProjects";
import { ModalCVProvider } from "./components/General/Nav/ModalCVContext";
import AutoCvModalOnLoad from "./components/General/Nav/AutoCvModalOnLoad";
import { NavigationProvider, useNavigation } from "./components/General/Nav/NavigationContext";
import TransitionOverlay from "./components/General/Nav/TransitionOverlay";
import RadialTransitionOverlay from "./components/General/Nav/RadialTransitionOverlay";
import GlobalLoader from "./components/General/GlobalLoader";
import LanguageToggle from "./components/General/Language/LanguageToggle";
import { useAnalytics } from "./hooks/useAnalytics";

const SinglePage = () => {
  // check if loader already shown
  const hasShownLoader = useRef(
    typeof window !== "undefined" && 
    sessionStorage.getItem("loaderShown") === "true"
  );

  const [showHomeLoader, setShowHomeLoader] = useState(!hasShownLoader.current);
  const [showLoaderTransition, setShowLoaderTransition] = useState(false);

  const { trackEvent } = useAnalytics();
  const hasTrackedInitialPageView = useRef(false);

  // Track PAGE_VIEW once after loader
  useEffect(() => {
    if (!showHomeLoader && !showLoaderTransition && !hasTrackedInitialPageView.current) {
      hasTrackedInitialPageView.current = true;
      trackEvent('PAGE_VIEW');
    }
  }, [showHomeLoader, showLoaderTransition, trackEvent]);

  const shouldRestore = sessionStorage.getItem('shouldRestoreScroll') === 'true';
  const savedCategoryIndex = sessionStorage.getItem('lastProjectCategoryIndex');
  const initialShowProjects = shouldRestore && savedCategoryIndex;
  const initialForceIndex = initialShowProjects ? parseInt(savedCategoryIndex!) : undefined;
  
  // check if returning from Credits, Mentions or PolitiqueConfidentialite to Contact
  const returningFromCreditsToContact = sessionStorage.getItem('returningFromCreditsToContact') === 'true';
  const returningFromMentionsToContact = sessionStorage.getItem('returningFromMentionsToContact') === 'true';
  const returningFromPolitiqueConfidentialiteToContact = sessionStorage.getItem('returningFromPolitiqueConfidentialiteToContact') === 'true';
  const returningToContact = returningFromCreditsToContact || returningFromMentionsToContact || returningFromPolitiqueConfidentialiteToContact;
  const initialShowContact = returningToContact;
  const initialShowProjectsForContact = returningToContact;

  const [showProjects, setShowProjects] = useState(!!initialShowProjects || initialShowProjectsForContact);
  const [returnFromProjects, setReturnFromProjects] = useState(false);
  const [showContact, setShowContact] = useState(initialShowContact);
  const [forceProjectsIndex, setForceProjectsIndex] = useState<number | undefined>(
    initialShowContact ? 3 : initialForceIndex
  );

  // Clean sessionStorage after restoration
  useEffect(() => {
    if (shouldRestore && savedCategoryIndex) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      
      setTimeout(() => {
        sessionStorage.removeItem('shouldRestoreScroll');
        sessionStorage.removeItem('lastProjectCategoryIndex');
        setForceProjectsIndex(undefined);
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
      }, 1000);
    }
  }, []);

  const handleTransitionToProjects = (categoryIndex?: number) => {
    setShowProjects(true);
    if (categoryIndex === undefined) {
      setForceProjectsIndex(undefined);
    }
  };

  const handleReturnToHero = () => {
    setShowProjects(false);
    setReturnFromProjects(true);
    setForceProjectsIndex(undefined);
  };

  const handleTransitionToContact = () => {
    setShowContact(true);
  };

  const handleCloseContact = () => {
    setShowContact(false);
    setTimeout(() => {
      setForceProjectsIndex(undefined);
    }, 600);
  };

  if (showHomeLoader) {
    return (
      <GlobalLoader
        loadDurationMs={1500}
        onComplete={() => {
          sessionStorage.setItem("loaderShown", "true");
          sessionStorage.setItem("fromLoader", "true");
          setShowHomeLoader(false);
          setShowLoaderTransition(true);
        }}
      />
    );
  }

  return (
    <ModalCVProvider>
      <NavigationProvider>
        {showLoaderTransition && (
          <RadialTransitionOverlay
            isActive
            direction="out"
            onComplete={() => {
              sessionStorage.removeItem("fromLoader");
              setShowLoaderTransition(false);
            }}
          />
        )}
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

  const isRestoringFromProjects = sessionStorage.getItem('shouldRestoreScroll') === 'true';
  const isReturningFromCredits = sessionStorage.getItem('returningFromCreditsToContact') === 'true';
  const isReturningFromMentions = sessionStorage.getItem('returningFromMentionsToContact') === 'true';
  const isReturningFromPolitiqueConfidentialite = sessionStorage.getItem('returningFromPolitiqueConfidentialiteToContact') === 'true';
  const isReturningToContact = isReturningFromCredits || isReturningFromMentions || isReturningFromPolitiqueConfidentialite;
  const [heroTextIndex, setHeroTextIndex] = useState<number | undefined>(undefined);
  const [heroNavigationReset, setHeroNavigationReset] = useState(false);
  const [showContent, setShowContent] = useState(!isRestoringFromProjects || isReturningToContact);
  const [navOpacity, setNavOpacity] = useState((isRestoringFromProjects && !isReturningToContact) ? 0 : 1);
  const [isContactVisible, setIsContactVisible] = useState(!isReturningToContact);

  useEffect(() => {
    if (isRestoringFromProjects && !isReturningToContact) {
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
      const isNavigationClick = shouldResetHeroStatesRef.current;

      if (isNavigationClick) {
        setReturnFromProjects(false);
      }

      if (showContact) {
        handleCloseContact();
      }

      if (showProjects && !isNavigationClick) {
        handleReturnToHero();
      } else if (showProjects && isNavigationClick) {
        setShowProjects(false);
      }
    });
  }, [showProjects, showContact, handleReturnToHero, handleCloseContact, setReturnToHero, shouldResetHeroStates, shouldResetHeroStatesRef]);

  useEffect(() => {
    setNavigateToProjects((categoryIndex?: number) => {
      if (showContact) {
        handleCloseContact();
      }
      handleTransitionToProjects(categoryIndex);
      if (!showProjects) {
        const indexToUse = categoryIndex !== undefined ? categoryIndex : 0;
        setForceProjectsIndex(indexToUse);
        setTimeout(() => {
          setForceProjectsIndex(undefined);
        }, 500);
      } else {
      }
    });
  }, [setNavigateToProjects, handleTransitionToProjects, showContact, handleCloseContact, showProjects]);

  useEffect(() => {
    if (shouldResetHeroStates) {
      const targetTextIndex = heroState === "hero2" ? 0 : undefined;
      setHeroTextIndex(targetTextIndex);
      setHeroNavigationReset(true);

      setTimeout(() => {
        setHeroNavigationReset(false);
        setHeroTextIndex(undefined);
        resetNavigationFlags();
      }, 200);
    }
  }, [shouldResetHeroStates, heroState, resetNavigationFlags]);

  useEffect(() => {
    if (shouldResetProjectsStates) {
      const indexToForce = lastProjectsCategoryIndexRef.current !== undefined ? lastProjectsCategoryIndexRef.current : 0;
      setForceProjectsIndex(indexToForce);

      setTimeout(() => {
        setForceProjectsIndex(undefined);
        resetNavigationFlags();
      }, 500);
    }
  }, [shouldResetProjectsStates, setForceProjectsIndex, resetNavigationFlags]);

  useEffect(() => {
    setNavigateToContact(() => {
      if (!showProjects) {
        setShowProjects(true);
        setForceProjectsIndex(3);
        setTimeout(() => {
          handleTransitionToContact();
        }, 200);
      } else {
        handleTransitionToContact();
      }
    });
  }, [setNavigateToContact, handleTransitionToContact, showProjects, setForceProjectsIndex, setShowProjects]);


  useEffect(() => {
    const returningFromCredits = sessionStorage.getItem('returningFromCreditsToContact') === 'true';
    const returningFromMentions = sessionStorage.getItem('returningFromMentionsToContact') === 'true';
    const returningFromPolitiqueConfidentialite = sessionStorage.getItem('returningFromPolitiqueConfidentialiteToContact') === 'true';
    if (returningFromCredits || returningFromMentions || returningFromPolitiqueConfidentialite) {
      if (returningFromCredits) {
        sessionStorage.removeItem('returningFromCreditsToContact');
      }
      if (returningFromMentions) {
        sessionStorage.removeItem('returningFromMentionsToContact');
      }
      if (returningFromPolitiqueConfidentialite) {
        sessionStorage.removeItem('returningFromPolitiqueConfidentialiteToContact');
      }

      navigateToContact();
      setTimeout(() => {
        setIsContactVisible(true);
      }, 900);
    }
  }, [navigateToContact]);

  return (
    <>
      <AutoCvModalOnLoad
        enabled={
          showContent &&
          !showProjects &&
          !showContact &&
          !(isRestoringFromProjects && !isReturningToContact)
        }
      />
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
                // do nothing
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
      <LanguageToggle />
    </>
  );
};

export default SinglePage;
