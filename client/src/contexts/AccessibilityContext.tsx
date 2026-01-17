import React, { createContext, useContext, useEffect, useState } from "react";

interface AccessibilityState {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReaderOptimized: boolean;
}

interface AccessibilityContextType extends AccessibilityState {
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  toggleReduceMotion: () => void;
  toggleScreenReaderOptimized: () => void;
  resetAccessibility: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(() => {
    const saved = localStorage.getItem("accessibility-settings");
    return saved
      ? JSON.parse(saved)
      : {
          highContrast: false,
          largeText: false,
          reduceMotion: false,
          screenReaderOptimized: false,
        };
  });

  useEffect(() => {
    localStorage.setItem("accessibility-settings", JSON.stringify(state));
    
    // Apply classes to document body for global styling hooks
    document.body.classList.toggle("high-contrast", state.highContrast);
    document.body.classList.toggle("large-text", state.largeText);
    document.body.classList.toggle("reduce-motion", state.reduceMotion);
    document.body.classList.toggle("screen-reader-optimized", state.screenReaderOptimized);
  }, [state]);

  const toggleHighContrast = () => setState(s => ({ ...s, highContrast: !s.highContrast }));
  const toggleLargeText = () => setState(s => ({ ...s, largeText: !s.largeText }));
  const toggleReduceMotion = () => setState(s => ({ ...s, reduceMotion: !s.reduceMotion }));
  const toggleScreenReaderOptimized = () => setState(s => ({ ...s, screenReaderOptimized: !s.screenReaderOptimized }));
  
  const resetAccessibility = () => setState({
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    screenReaderOptimized: false,
  });

  return (
    <AccessibilityContext.Provider
      value={{
        ...state,
        toggleHighContrast,
        toggleLargeText,
        toggleReduceMotion,
        toggleScreenReaderOptimized,
        resetAccessibility,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
