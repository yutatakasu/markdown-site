import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import siteConfig, { FontFamily } from "../config/siteConfig";
import { safeGetItem, safeRemoveItem, safeSetItem } from "../utils/safeLocalStorage";

// Default font from siteConfig
const DEFAULT_FONT: FontFamily = siteConfig.fontFamily;

interface FontContextType {
  fontFamily: FontFamily;
  setFontFamily: (fontFamily: FontFamily) => void;
  toggleFontFamily: () => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

interface FontProviderProps {
  children: ReactNode;
  defaultFont?: FontFamily; // Allow overriding default font
}

// Font family CSS values
const fontFamilies: Record<FontFamily, string> = {
  serif:
    '"New York", -apple-system-ui-serif, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  monospace: '"IBM Plex Mono", "Liberation Mono", ui-monospace, monospace',
};

// Get initial font from localStorage or use default
// If siteConfig default has changed, prefer the new default over localStorage
const getInitialFont = (defaultFont: FontFamily): FontFamily => {
  const saved = safeGetItem("blog-font-family") as FontFamily | null;
  const savedConfigDefault = safeGetItem("blog-font-family-config-default") as FontFamily | null;

  // If siteConfig default has changed, use the new default instead of saved preference
  if (savedConfigDefault && savedConfigDefault !== defaultFont) {
    // SiteConfig default changed - use new default and clear saved preference
    safeRemoveItem("blog-font-family");
    safeSetItem("blog-font-family-config-default", defaultFont);
    return defaultFont;
  }

  // Use saved preference if valid
  if (saved && ["serif", "sans", "monospace"].includes(saved)) {
    // Store current siteConfig default for future comparison
    if (!savedConfigDefault) {
      safeSetItem("blog-font-family-config-default", defaultFont);
    }
    return saved;
  }

  // No saved preference - use siteConfig default
  safeSetItem("blog-font-family-config-default", defaultFont);
  return defaultFont;
};

// Update CSS variable for font-family
const updateFontFamily = (fontFamily: FontFamily) => {
  document.documentElement.style.setProperty(
    "--font-family",
    fontFamilies[fontFamily]
  );
};

export function FontProvider({
  children,
  defaultFont = DEFAULT_FONT,
}: FontProviderProps) {
  // Initialize font and set CSS variable immediately (synchronously)
  const initialFont = getInitialFont(defaultFont);
  
  // Set CSS variable immediately before React renders
  updateFontFamily(initialFont);

  const [fontFamily, setFontFamilyState] = useState<FontFamily>(initialFont);

  // Apply font to DOM and persist to localStorage
  useEffect(() => {
    updateFontFamily(fontFamily);
    safeSetItem("blog-font-family", fontFamily);
  }, [fontFamily]);

  // Set font directly
  const setFontFamily = (newFont: FontFamily) => {
    setFontFamilyState(newFont);
  };

  // Cycle through fonts: serif -> sans -> monospace -> serif
  const toggleFontFamily = () => {
    const fonts: FontFamily[] = ["serif", "sans", "monospace"];
    const currentIndex = fonts.indexOf(fontFamily);
    const nextIndex = (currentIndex + 1) % fonts.length;
    setFontFamilyState(fonts[nextIndex]);
  };

  return (
    <FontContext.Provider
      value={{ fontFamily, setFontFamily, toggleFontFamily }}
    >
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error("useFont must be used within a FontProvider");
  }
  return context;
}
