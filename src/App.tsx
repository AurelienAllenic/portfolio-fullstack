import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.scss";

import SinglePage from "./SinglePage";
import SingleProjectPage from "./components/Sections/Projects/SingleProjectPage";
import NotFound from "./components/General/NotFound/NotFound";
import Credits from "./components/Asides/Credits/Credits";
import Mentions from "./components/Asides/Mentions/Mentions";
import PolitiqueConfidentialite from "./components/Asides/PolitiqueConfidentialite/PolitiqueConfidentialite";
import { LanguageProvider } from "./components/General/Language/LanguageContext";
import { AuthProvider } from "./components/General/Auth/AuthContext";
import Login from "./components/General/Auth/Login";
import Dashboard from "./components/General/Dashboard/Dashboard";
import ProtectedRoute from "./components/General/Auth/ProtectedRoute";

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SinglePage />} />
            <Route path="/projects/:categorySlug" element={<SingleProjectPage />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/mentions-legales" element={<Mentions />} />
            <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
