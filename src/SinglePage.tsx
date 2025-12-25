import { useState } from "react";
import Nav from "./components/General/Nav/Nav";
import Contact from "./components/Sections/Contact/Contact";
import Hero from "./components/Sections/Hero/Hero";
import Projects from "./components/Sections/Projects/Projects";
import MobileNav from "./components/General/Nav/MobileNav";
import SliderProjects from "./components/Sections/Projects/SliderProjects";
import { ModalCVProvider } from "./components/General/Nav/ModalCVContext";

const SinglePage = () => {
  const [showProjects, setShowProjects] = useState(false);
  const [returnFromProjects, setReturnFromProjects] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const handleTransitionToProjects = () => {
    setShowProjects(true);
  };

  const handleReturnToHero = () => {
    setShowProjects(false);
    setReturnFromProjects(true);

    // ✅ Ajout essentiel : réinitialiser après un court délai
    // (on laisse le temps à HeroAfterScroll de faire son fade-in)
    setTimeout(() => {
      setReturnFromProjects(false);
    }, 2000);
  };

  const handleTransitionToContact = () => {
    setShowContact(true);
  };

  return (
    <ModalCVProvider>
      <Nav />
      <MobileNav />
      {!showProjects && (
        <Hero
          onTransitionToProjects={handleTransitionToProjects}
          returnFromProjects={returnFromProjects}
          onResetReturnFromProjects={() => setReturnFromProjects(false)} // ✅ ajout
        />
      )}
      {showProjects && (
        <>
          <Projects onTransitionToHero={handleReturnToHero} />
          <SliderProjects onTransitionToContact={handleTransitionToContact} />
        </>
      )}
      {showContact && <Contact />}
    </ModalCVProvider>
  );
};

export default SinglePage;
