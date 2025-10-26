import { useState } from "react";
import Nav from "./components/General/Nav/Nav";
import Contact from "./components/Sections/Contact/Contact";
import Hero from "./components/Sections/Hero/Hero";
import Projects from "./components/Sections/Projects/Projects";

const SinglePage = () => {
  const [showProjects, setShowProjects] = useState(false);
  const [returnFromProjects, setReturnFromProjects] = useState(false);

  const handleTransitionToProjects = () => {
    console.log("Transition vers Projects déclenchée !");
    setShowProjects(true);
  };

  const handleReturnToHero = () => {
    console.log("Retour vers Hero déclenché !");
    setShowProjects(false);
    setReturnFromProjects(true);

    // ✅ Ajout essentiel : réinitialiser après un court délai
    // (on laisse le temps à HeroAfterScroll de faire son fade-in)
    setTimeout(() => {
      setReturnFromProjects(false);
      console.log("returnFromProjects réinitialisé à false");
    }, 2000);
  };

  return (
    <>
      <Nav />
      {!showProjects && (
        <Hero
          onTransitionToProjects={handleTransitionToProjects}
          returnFromProjects={returnFromProjects}
          onResetReturnFromProjects={() => setReturnFromProjects(false)} // ✅ ajout
        />
      )}
      {showProjects && <Projects onTransitionToHero={handleReturnToHero} />}
      <Contact />
    </>
  );
};

export default SinglePage;
