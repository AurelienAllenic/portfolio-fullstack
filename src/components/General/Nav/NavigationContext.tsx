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
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [heroState, setHeroState] = useState<HeroState>("hero1"); // Par défaut hero1 (HeroBeforeScroll)
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<"close" | "open">("close");
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

  const navigateToHero = (destination: HeroState) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTransitionDirection("close");
    
    // Fermer le gradient (écran noir)
    setTimeout(() => {
      // Si on n'est pas déjà dans Hero, revenir à Hero d'abord
      if (returnToHeroCallbackRef.current) {
        returnToHeroCallbackRef.current();
      }
      
      // Changer l'état hero
      setHeroState(destination);
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
      // Revenir à Hero d'abord si nécessaire
      if (returnToHeroCallbackRef.current) {
        returnToHeroCallbackRef.current();
      }
      
      // Naviguer vers Projects
      if (navigateToProjectsCallbackRef.current) {
        navigateToProjectsCallbackRef.current();
      }
      
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
      // Revenir à Hero d'abord si nécessaire
      if (returnToHeroCallbackRef.current) {
        returnToHeroCallbackRef.current();
      }
      
      // Naviguer vers Contact
      if (navigateToContactCallbackRef.current) {
        navigateToContactCallbackRef.current();
      }
      
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
      setNavigateToContact
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

