import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { OccurrenceProvider } from "../src/context/OccurrenceContext";
import { ThemeProvider, useAppTheme } from "../src/context/ThemeContext";

function AppContent() {
  const { isDark } = useAppTheme();
  return (
    <OccurrenceProvider>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
    </OccurrenceProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
