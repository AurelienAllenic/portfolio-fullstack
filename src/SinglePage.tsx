import Nav from "./components/General/Nav/Nav";
import Scrollbar from "./components/General/ScrollBar/ScrollBar";
import Contact from "./components/Sections/Contact/Contact";
import Hero from "./components/Sections/Hero/Hero";
import Projects from "./components/Sections/Projects/Projects";

const SinglePage = () => {
  return (
    <>
      <Scrollbar>
        <Nav />
        <Hero />
        <Projects />
        <Contact />
      </Scrollbar>
    </>
  );
};

export default SinglePage;
