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
  const [forceProjectsIndex, setForceProjectsIndex] = useState(false);

  const handleTransitionToProjects = () => {
    setShowProjects(true);
    setForceProjectsIndex(false);
  };

  const handleReturnToHero = () => {
    setShowProjects(false);
    setReturnFromProjects(true);
    setForceProjectsIndex(false);

    setTimeout(() => {
      setReturnFromProjects(false);
    }, 2000);
  };

  const handleTransitionToContact = () => {
    setShowContact(true);
  };

  const handleCloseContact = () => {
    setShowContact(false);
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
}: {
  showProjects: boolean;
  returnFromProjects: boolean;
  showContact: boolean;
  forceProjectsIndex: boolean;
  handleTransitionToProjects: () => void;
  handleReturnToHero: () => void;
  handleTransitionToContact: () => void;
  handleCloseContact: () => void;
  setReturnFromProjects: (value: boolean) => void;
  setForceProjectsIndex: (value: boolean) => void;
}) => {
  const { 
    heroState, 
    isTransitioning, 
    transitionDirection, 
    setReturnToHero,
    setNavigateToProjects,
    setNavigateToContact
  } = useNavigation();

  useEffect(() => {
    setReturnToHero(() => {
      if (showProjects) {
        handleReturnToHero();
      }
      if (showContact) {
        handleCloseContact();
      }
    });
  }, [showProjects, showContact, handleReturnToHero, handleCloseContact, setReturnToHero]);

  useEffect(() => {
    setNavigateToProjects(() => {
      handleTransitionToProjects();
      setForceProjectsIndex(true);
    });
  }, [setNavigateToProjects, handleTransitionToProjects, setForceProjectsIndex]);

  useEffect(() => {
    setNavigateToContact(() => {
      handleTransitionToContact();
    });
  }, [setNavigateToContact, handleTransitionToContact]);

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
          onResetReturnFromProjects={() => setReturnFromProjects(false)}
          forceHeroState={heroState}
        />
      )}
      {showProjects && (
        <>
          <Projects onTransitionToHero={handleReturnToHero} />
          <SliderProjects 
            onTransitionToContact={handleTransitionToContact}
            forceIndex={forceProjectsIndex ? 0 : undefined}
            onForceIndexComplete={() => setForceProjectsIndex(false)}
          />
        </>
      )}
      {showContact && <Contact />}
    </>
  );
};

export default SinglePage;
