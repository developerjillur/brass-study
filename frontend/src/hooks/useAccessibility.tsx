"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";

type FontSize = "normal" | "large" | "extra-large";

interface AccessibilityContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  fontSize: "normal",
  setFontSize: () => {},
  highContrast: false,
  setHighContrast: () => {},
});

export const useAccessibility = () => useContext(AccessibilityContext);

const FONT_SIZES: Record<FontSize, string> = {
  normal: "18px",
  large: "20px",
  "extra-large": "22px",
};

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    if (typeof window === "undefined") return "normal";
    return (localStorage.getItem("a11y-font-size") as FontSize) || "normal";
  });
  const [highContrast, setHighContrastState] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("a11y-high-contrast") === "true";
  });

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem("a11y-font-size", size);
  };

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    localStorage.setItem("a11y-high-contrast", String(enabled));
  };

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZES[fontSize];
  }, [fontSize]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [highContrast]);

  return (
    <AccessibilityContext.Provider value={{ fontSize, setFontSize, highContrast, setHighContrast }}>
      {children}
    </AccessibilityContext.Provider>
  );
};
