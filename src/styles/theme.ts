const base = {
  radius: { sm: 10, md: 14, lg: 18, xl: 24 },
  spacing: { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
};

export type AppTheme = {
  colors: {
    background: string;
    surface: string;
    surfaceSoft: string;
    primary: string;
    primaryDark: string;
    primaryLight: string;
    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    danger: string;
    dangerSoft: string;
    info: string;
    infoSoft: string;
    dark: string;
    muted: string;
    border: string;
    input: string;
    white: string;
    black: string;
    overlay: string;
  };
  radius: typeof base.radius;
  spacing: typeof base.spacing;
  shadow: typeof base.shadow;
};

export const lightTheme: AppTheme = {
  ...base,
  colors: {
    background: "#F5F7FB",
    surface: "#FFFFFF",
    surfaceSoft: "#F8FAFC",
    primary: "#6D28D9",
    primaryDark: "#4C1D95",
    primaryLight: "#8B5CF6",
    success: "#009B4D",
    successSoft: "#E8F8EF",
    warning: "#D97706",
    warningSoft: "#FFF7E0",
    danger: "#DC2626",
    dangerSoft: "#FEECEC",
    info: "#2563EB",
    infoSoft: "#EEF4FF",
    dark: "#1F2937",
    muted: "#6B7280",
    border: "#E5E7EB",
    input: "#F9FAFB",
    white: "#FFFFFF",
    black: "#111827",
    overlay: "rgba(17, 24, 39, 0.58)",
  },
};

export const darkTheme: AppTheme = {
  ...base,
  shadow: { ...base.shadow, shadowOpacity: 0.3 },
  colors: {
    background: "#0E1117",
    surface: "#171B23",
    surfaceSoft: "#202631",
    primary: "#8B5CF6",
    primaryDark: "#6D28D9",
    primaryLight: "#A78BFA",
    success: "#36C978",
    successSoft: "#102A1D",
    warning: "#F2AD46",
    warningSoft: "#2C2110",
    danger: "#FF6B6B",
    dangerSoft: "#321718",
    info: "#69A0FF",
    infoSoft: "#14223A",
    dark: "#F3F4F6",
    muted: "#A8B0BD",
    border: "#303744",
    input: "#202631",
    white: "#171B23",
    black: "#F9FAFB",
    overlay: "rgba(0, 0, 0, 0.72)",
  },
};

// Mantido para compatibilidade com arquivos sem tema dinâmico.
export const theme = lightTheme;
