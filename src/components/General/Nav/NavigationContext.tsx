/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, useRef } from "react";
import type { ReactNode } from "react";

type HeroState = "hero1" | "hero2";

interface NavigationContextType {
  heroState: HeroState;
  setHeroState: (state: HeroState) => void;
  navigateToHero: (destination: HeroState) => void;
  navigateToProjects: () => void;
  navigateToContact: () => void;
  isTransitioning: boolean;
  transitionDirection: "close" | "open";
  setReturnToHero: (callback: () => void) => void;
  setNavigateToProjects: (callback: () => void) => void;
  setNavigateToContact: (callback: () => void) => void;
  shouldResetHeroStates: boolean; // Flag pour réinitialiser les états Hero
  shouldResetHeroStatesRef: React.RefObject<boolean>; // Ref pour lecture synchrone
  shouldResetProjectsStates: boolean; // Flag pour réinitialiser les états Projects
  resetNavigationFlags: () => void; // Fonction pour réinitialiser les flags
  updateCurrentSection?: (section: "hero" | "projects" | "contact") => void; // Synchronisation manuelle
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [heroState, setHeroState] = useState<HeroState>("hero1"); // Par défaut hero1 (HeroBeforeScroll)
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<"close" | "open">("close");
  const [shouldResetHeroStates, setShouldResetHeroStates] = useState(false);
  const [shouldResetProjectsStates, setShouldResetProjectsStates] = useState(false);
  const currentSectionRef = useRef<"hero" | "projects" | "contact">("hero"); // Suivre la section actuelle
  const shouldResetHeroStatesRef = useRef(false); // Ref pour lecture synchrone
  const returnToHeroCallbackRef = useRef<(() => void) | null>(null);
  const navigateToProjectsCallbackRef = useRef<(() => void) | null>(null);
  const navigateToContactCallbackRef = useRef<(() => void) | null>(null);

  const setReturnToHero = (callback: () => void) => {
    returnToHeroCallbackRef.current = callback;
  };

  const setNavigateToProjects = (callback: () => void) => {
    navigateToProjectsCallbackRef.current = callback;
  };

  const setNavigateToContact = (callback: () => void) => {
    navigateToContactCallbackRef.current = callback;
  };

  const resetNavigationFlags = () => {
    setShouldResetHeroStates(false);
    shouldResetHeroStatesRef.current = false;
    setShouldResetProjectsStates(false);
  };

  const updateCurrentSection = (section: "hero" | "projects" | "contact") => {
    currentSectionRef.current = section;
  };

  const navigateToHero = (destination: HeroState) => {
    console.log('🔵 [NAV CONTEXT] navigateToHero called with destination:', destination, 'isTransitioning:', isTransitioning);
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTransitionDirection("close");
    
    // Fermer le gradient (écran noir)
    setTimeout(() => {
      // Changer l'état hero et activer le flag de réinitialisation AVANT d'appeler le callback
      console.log('🔵 [NAV CONTEXT] Setting heroState to:', destination, 'and shouldResetHeroStates to true');
      setHeroState(destination);
      setShouldResetHeroStates(true);
      shouldResetHeroStatesRef.current = true; // Mise à jour synchrone du ref
      currentSectionRef.current = "hero";
      
      // Ensuite, revenir à Hero pour fermer Projects/Contact (le flag shouldResetHeroStates est maintenant true)
      if (returnToHeroCallbackRef.current) {
        console.log('🔵 [NAV CONTEXT] Calling returnToHeroCallback (shouldResetHeroStatesRef.current is now:', shouldResetHeroStatesRef.current, ')');
        returnToHeroCallbackRef.current();
      }
      
      setTransitionDirection("open");
      
      // Ouvrir le gradient pour révéler
      setTimeout(() => {
        setIsTransitioning(false);
      }, 800);
    }, 800);
  };

  const navigateToProjects = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTransitionDirection("close");
    
    setTimeout(() => {
      // Revenir à Hero d'abord SEULEMENT si on n'est pas déjà sur Hero/Projects
      if (currentSectionRef.current === "contact" && returnToHeroCallbackRef.current) {
        returnToHeroCallbackRef.current();
      }
      
      // Naviguer vers Projects et activer le flag de réinitialisation
      if (navigateToProjectsCallbackRef.current) {
        navigateToProjectsCallbackRef.current();
      }
      setShouldResetProjectsStates(true);
      currentSectionRef.current = "projects";
      
      setTransitionDirection("open");
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 800);
    }, 800);
  };

  const navigateToContact = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTransitionDirection("close");
    
    setTimeout(() => {
      // NE PAS retourner à Hero - aller directement à Contact
      // La transition Projects → Contact est gérée par le scroll naturel
      
      // Naviguer vers Contact
      if (navigateToContactCallbackRef.current) {
        navigateToContactCallbackRef.current();
      }
      currentSectionRef.current = "contact";
      
      setTransitionDirection("open");
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 800);
    }, 800);
  };

  return (
    <NavigationContext.Provider value={{ 
      heroState, 
      setHeroState, 
      navigateToHero, 
      navigateToProjects,
      navigateToContact,
      isTransitioning, 
      transitionDirection, 
      setReturnToHero,
      setNavigateToProjects,
      setNavigateToContact,
      shouldResetHeroStates,
      shouldResetHeroStatesRef,
      shouldResetProjectsStates,
      resetNavigationFlags,
      updateCurrentSection
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};

