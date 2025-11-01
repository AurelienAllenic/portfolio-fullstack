import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.scss";

import SinglePage from "./SinglePage";
import ProjectPage from "./components/Sections/Projects/SingleProject";
import NotFound from "./components/General/NotFound/NotFound";
import ProjectCategory from "./components/Sections/Projects/ProjectCategory";
import { openclassrooms1_cover } from "./components/Sections/Projects/Data";
import { openclassrooms1 } from "./components/Sections/Projects/Data";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SinglePage />} />
        <Route path="/project" element={
          <ProjectCategory cover={openclassrooms1_cover} projects={openclassrooms1} />
        } />
        <Route path="/projects/:name" element={<ProjectPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
