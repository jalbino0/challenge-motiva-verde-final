import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../context/ThemeContext";

type Tone = "red" | "yellow" | "green" | "blue" | "purple";
type Props = { icon: string; value: string | number; label: string; tone?: Tone };

export function StatusCard({ icon, value, label, tone = "purple" }: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const toneMap = {
    red: { background: theme.colors.dangerSoft, color: theme.colors.danger },
    yellow: { background: theme.colors.warningSoft, color: theme.colors.warning },
    green: { background: theme.colors.successSoft, color: theme.colors.success },
    blue: { background: theme.colors.infoSoft, color: theme.colors.info },
    purple: { background: theme.colors.surfaceSoft, color: theme.colors.primary },
  };
  const toneStyle = toneMap[tone];

  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: toneStyle.background }]}>
        <Text style={[styles.icon, { color: toneStyle.color }]}>{icon}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>["theme"]) {
  return StyleSheet.create({
    card: { flex: 1, minHeight: 120, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 14, justifyContent: "space-between", borderWidth: 1, borderColor: theme.colors.border, ...theme.shadow },
    iconBox: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
    icon: { fontSize: 18, fontWeight: "900" },
    value: { fontSize: 26, fontWeight: "800", color: theme.colors.dark, marginTop: 8 },
    label: { fontSize: 14, color: theme.colors.muted, lineHeight: 20 },
  });
}
