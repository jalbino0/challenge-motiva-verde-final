import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../context/ThemeContext";
import { Occurrence } from "../data/mockData";

type Props = { occurrence: Occurrence; showAction?: boolean; onFinish?: () => void };

export function OccurrenceCard({ occurrence, showAction = false, onFinish }: Props) {
  const { theme, isDark } = useAppTheme();
  const styles = createStyles(theme);

  const cardStyle = (() => {
    if (occurrence.status === "Concluída") return { background: theme.colors.successSoft, border: isDark ? "#245A3D" : "#B7E8C8", text: theme.colors.success };
    if (occurrence.status === "Cancelada") return { background: theme.colors.surfaceSoft, border: theme.colors.border, text: theme.colors.muted };
    if (occurrence.status === "Crítica" || occurrence.priority === "Crítica") return { background: theme.colors.dangerSoft, border: isDark ? "#6D2B2D" : "#F8B4B4", text: theme.colors.danger };
    if (occurrence.priority === "Alta") return { background: theme.colors.infoSoft, border: isDark ? "#2C4770" : "#C7D2FE", text: theme.colors.primary };
    if (occurrence.priority === "Média") return { background: theme.colors.warningSoft, border: isDark ? "#665020" : "#FCD34D", text: theme.colors.warning };
    return { background: theme.colors.surface, border: theme.colors.border, text: theme.colors.dark };
  })();

  const canFinish = showAction && occurrence.status !== "Concluída" && occurrence.status !== "Cancelada";

  return (
    <View style={[styles.card, { backgroundColor: cardStyle.background, borderColor: cardStyle.border }]}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.km}>{occurrence.km}</Text>
          <Text style={[styles.type, { color: cardStyle.text }]}>{occurrence.type}</Text>
        </View>
        <View style={[styles.badge, { borderColor: cardStyle.text }]}>
          <Text style={[styles.badgeText, { color: cardStyle.text }]}>{occurrence.status}</Text>
        </View>
      </View>
      <Text style={styles.description}>{occurrence.description}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>📅 {occurrence.createdAt}</Text>
        <Text style={styles.meta}>📍 {occurrence.assetCode}</Text>
      </View>
      {canFinish && (
        <Pressable style={styles.actionButton} onPress={onFinish}>
          <Text style={styles.actionText}>Marcar como concluída</Text>
        </Pressable>
      )}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>["theme"]) {
  return StyleSheet.create({
    card: { borderWidth: 1, borderRadius: theme.radius.lg, padding: 16, marginBottom: 14 },
    header: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
    headerInfo: { flex: 1 },
    km: { fontSize: 18, fontWeight: "900", color: theme.colors.dark, marginBottom: 4 },
    type: { fontSize: 15, fontWeight: "700", lineHeight: 21 },
    badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start" },
    badgeText: { fontSize: 12, fontWeight: "900" },
    description: { color: theme.colors.dark, fontSize: 15, lineHeight: 22, marginTop: 12 },
    metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 14 },
    meta: { fontSize: 13, color: theme.colors.muted },
    actionButton: { marginTop: 14, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, paddingVertical: 11, alignItems: "center", borderWidth: 1, borderColor: theme.colors.border },
    actionText: { color: theme.colors.success, fontWeight: "900", fontSize: 14 },
  });
}
