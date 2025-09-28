import Nav from "./components/General/Nav/Nav";
import Contact from "./components/Sections/Contact/Contact";
import Hero from "./components/Sections/Hero/Hero";
import Projects from "./components/Sections/Projects/Projects";

const SinglePage = () => {
  return (
    <>
      <Nav />
      <Hero />
      <Projects />
      <Contact />
    </>
  );
};

export default SinglePage;
