/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, useRef } from "react";
import type { ReactNode } from "react";

type HeroState = "hero1" | "hero2";

interface NavigationContextType {
  heroState: HeroState;
  setHeroState: (state: HeroState) => void;
  navigateToHero: (destination: HeroState) => void;
  navigateToProjects: (categoryIndex?: number) => void;
  navigateToContact: () => void;
  isTransitioning: boolean;
  transitionDirection: "close" | "open";
  setReturnToHero: (callback: () => void) => void;
  setNavigateToProjects: (callback: (categoryIndex?: number) => void) => void;
  setNavigateToContact: (callback: () => void) => void;
  shouldResetHeroStates: boolean;
  shouldResetHeroStatesRef: React.RefObject<boolean>;
  shouldResetProjectsStates: boolean;
  lastProjectsCategoryIndexRef: React.RefObject<number | undefined>;
  resetNavigationFlags: () => void;
  updateCurrentSection?: (section: "hero" | "projects" | "contact") => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [heroState, setHeroState] = useState<HeroState>("hero1");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<"close" | "open">("close");
  const [shouldResetHeroStates, setShouldResetHeroStates] = useState(false);
  const [shouldResetProjectsStates, setShouldResetProjectsStates] = useState(false);
  const currentSectionRef = useRef<"hero" | "projects" | "contact">("hero");
  const shouldResetHeroStatesRef = useRef(false);
  const lastProjectsCategoryIndexRef = useRef<number | undefined>(undefined);
  const returnToHeroCallbackRef = useRef<(() => void) | null>(null);
  const navigateToProjectsCallbackRef = useRef<((categoryIndex?: number) => void) | null>(null);
  const navigateToContactCallbackRef = useRef<(() => void) | null>(null);

  const setReturnToHero = (callback: () => void) => {
    returnToHeroCallbackRef.current = callback;
  };

  const setNavigateToProjects = (callback: (categoryIndex?: number) => void) => {
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
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTransitionDirection("close");

    setTimeout(() => {
      setHeroState(destination);
      setShouldResetHeroStates(true);
      shouldResetHeroStatesRef.current = true;
      currentSectionRef.current = "hero";

      if (returnToHeroCallbackRef.current) {
        returnToHeroCallbackRef.current();
      }

      setTimeout(() => {
        setTransitionDirection("open");

        setTimeout(() => {
          setIsTransitioning(false);
        }, 1200);
      }, 125); // Black screen delay
    }, 1200); // Close duration
  };

  const navigateToProjects = (categoryIndex?: number) => {
    lastProjectsCategoryIndexRef.current = categoryIndex;
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTransitionDirection("close");
  
    setTimeout(() => {
      if (currentSectionRef.current === "contact" && returnToHeroCallbackRef.current) {
        returnToHeroCallbackRef.current();
      }
      
      if (navigateToProjectsCallbackRef.current) {
        navigateToProjectsCallbackRef.current(categoryIndex);
      }
      setShouldResetProjectsStates(true);
      currentSectionRef.current = "projects";

      setTimeout(() => {
        setTransitionDirection("open");

        setTimeout(() => {
          setIsTransitioning(false);
        }, 1200);
      }, 125); // Black screen delay
    }, 1200); // Close duration
  };

  const navigateToContact = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTransitionDirection("close");

    setTimeout(() => {
      if (navigateToContactCallbackRef.current) {
        navigateToContactCallbackRef.current();
      }
      currentSectionRef.current = "contact";

      setTimeout(() => {
        setTransitionDirection("open");

        setTimeout(() => {
          setIsTransitioning(false);
        }, 1200);
      }, 125); // Black screen delay
    }, 1200); // Close duration
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
      lastProjectsCategoryIndexRef,
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
