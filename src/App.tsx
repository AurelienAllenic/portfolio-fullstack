import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.scss";

import SinglePage from "./SinglePage";
import SingleProjectPage from "./components/Sections/Projects/SingleProjectPage";
import NotFound from "./components/General/NotFound/NotFound";
import Credits from "./components/Asides/Credits/Credits";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SinglePage />} />
        <Route path="/projects/:categorySlug" element={<SingleProjectPage />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
