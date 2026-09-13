import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AppTheme, darkTheme, lightTheme } from "../styles/theme";

type ThemeMode = "light" | "dark";

type ThemeContextData = {
  mode: ThemeMode;
  isDark: boolean;
  theme: AppTheme;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = "@motiva_verde_theme";
const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === "dark" || saved === "light") setMode(saved);
      })
      .catch(() => {});
  }, []);

  function setThemeMode(nextMode: ThemeMode) {
    setMode(nextMode);
    AsyncStorage.setItem(STORAGE_KEY, nextMode).catch(() => {});
  }

  function toggleTheme() {
    setThemeMode(mode === "dark" ? "light" : "dark");
  }

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === "dark",
      theme: mode === "dark" ? darkTheme : lightTheme,
      toggleTheme,
      setThemeMode,
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useAppTheme deve ser usado dentro de ThemeProvider");
  return context;
}
