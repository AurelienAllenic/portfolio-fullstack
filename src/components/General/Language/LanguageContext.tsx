import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traductions
const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    "nav.about": "À propos",
    "nav.projects": "Projets",
    "nav.contact": "Contact",
    
    // Hero
    "hero.title": "Aurélien Allenic",
    "hero.subtitle": "Développeur Web Fullstack",
    
    // Contact
    "contact.title": "Contact",
    "contact.subtitle": "N'hésitez pas à me contacter",
    "contact.email": "Email",
    "contact.linkedin": "LinkedIn",
    "contact.github": "GitHub",
    
    // Footer
    "footer.credits": "Crédits images",
    "footer.mentions": "Mentions légales",
    "footer.privacy": "Politique de confidentialité",
    
    // Projects
    "projects.view": "Voir les projets",
    
    // Common
    "common.back": "Retour",
  },
  en: {
    // Navigation
    "nav.about": "About",
    "nav.projects": "Projects",
    "nav.contact": "Contact",
    
    // Hero
    "hero.title": "Aurélien Allenic",
    "hero.subtitle": "Fullstack Web Developer",
    
    // Contact
    "contact.title": "Contact",
    "contact.subtitle": "Feel free to contact me",
    "contact.email": "Email",
    "contact.linkedin": "LinkedIn",
    "contact.github": "GitHub",
    
    // Footer
    "footer.credits": "Image credits",
    "footer.mentions": "Legal notice",
    "footer.privacy": "Privacy policy",
    
    // Projects
    "projects.view": "View projects",
    
    // Common
    "common.back": "Back",
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Récupérer la langue depuis localStorage ou utiliser 'fr' par défaut
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language") as Language;
    return saved === "en" || saved === "fr" ? saved : "fr";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
