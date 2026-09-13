import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppPopup } from "../src/components/AppPopup";
import { useOccurrences } from "../src/context/OccurrenceContext";
import { useAppTheme } from "../src/context/ThemeContext";
import { RoadSection, VegetationStatus } from "../src/data/mockData";

const STATUS_ORDER: VegetationStatus[] = ["Normal", "Atenção", "Crítico"];

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { roadSections, refreshing, refreshData } = useOccurrences();
  const { theme, isDark } = useAppTheme();
  const styles = createStyles(theme);
  const [errorPopup, setErrorPopup] = useState({ visible: false, message: "" });

  const statusCounts = useMemo(() => {
    return STATUS_ORDER.reduce<Record<VegetationStatus, number>>(
      (acc, status) => {
        acc[status] = roadSections.filter((section) => section.status === status).length;
        return acc;
      },
      { Normal: 0, Atenção: 0, Crítico: 0 }
    );
  }, [roadSections]);

  const totalLength = useMemo(() => {
    return (
      roadSections.reduce((sum, section) => sum + getSectionLength(section), 0) ||
      roadSections.length ||
      1
    );
  }, [roadSections]);

  function getSectionStyle(status: string) {
    if (status === "Normal") {
      return {
        background: theme.colors.successSoft,
        border: isDark ? "#245A3D" : "#86EFAC",
        text: theme.colors.success,
        solid: "#22C55E",
      };
    }
    if (status === "Atenção") {
      return {
        background: theme.colors.warningSoft,
        border: isDark ? "#665020" : "#FCD34D",
        text: theme.colors.warning,
        solid: "#FACC15",
      };
    }
    return {
      background: theme.colors.dangerSoft,
      border: isDark ? "#6D2B2D" : "#FCA5A5",
      text: theme.colors.danger,
      solid: "#EF4444",
    };
  }

  async function handleRefresh() {
    try {
      await refreshData();
    } catch (error) {
      setErrorPopup({
        visible: true,
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar os trechos. Tente novamente.",
      });
    }
  }

  return (
    <View style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 42 },
        ]}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Mapa de Trechos</Text>
            <Text style={styles.subtitle}>Situação atual da rodovia</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Panorama dos trechos monitorados</Text>
          <Text style={styles.cardSubtitle}>
            Cada faixa abaixo representa um trecho real do banco, na ordem dos quilômetros.
          </Text>

          {roadSections.length > 0 ? (
            <View style={styles.routeBar}>
              {roadSections.map((section) => {
                const sectionStyle = getSectionStyle(section.status);
                const weight = getSectionLength(section) / totalLength;
                return (
                  <View
                    key={section.id}
                    style={[
                      styles.routeSegment,
                      {
                        flex: Math.max(weight, 0.08),
                        backgroundColor: sectionStyle.solid,
                      },
                    ]}
                  />
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyRoute}>
              <Text style={styles.emptyText}>Nenhum trecho carregado.</Text>
            </View>
          )}

          <View style={styles.statusGrid}>
            {STATUS_ORDER.map((status) => {
              const sectionStyle = getSectionStyle(status);
              return (
                <View
                  key={status}
                  style={[
                    styles.statusSummary,
                    {
                      backgroundColor: sectionStyle.background,
                      borderColor: sectionStyle.border,
                    },
                  ]}
                >
                  <View style={[styles.statusDot, { backgroundColor: sectionStyle.solid }]} />
                  <View>
                    <Text style={[styles.statusCount, { color: sectionStyle.text }]}>
                      {statusCounts[status]}
                    </Text>
                    <Text style={styles.statusLabel}>{status}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Detalhes dos trechos</Text>
          <Pressable disabled={refreshing} onPress={handleRefresh}>
            <Text style={[styles.refresh, refreshing && styles.refreshDisabled]}>
              {refreshing ? "Atualizando..." : "Atualizar"}
            </Text>
          </Pressable>
        </View>

        {roadSections.length > 0 ? (
          roadSections.map((section) => {
            const sectionStyle = getSectionStyle(section.status);
            return (
              <View
                key={section.id}
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: sectionStyle.background,
                    borderColor: sectionStyle.border,
                  },
                ]}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderText}>
                    <Text style={[styles.sectionKm, { color: sectionStyle.text }]}>
                      {section.km}
                    </Text>
                    {section.title !== "Trecho sem nome" && (
                      <Text style={styles.sectionName}>{section.title}</Text>
                    )}
                  </View>
                  <View style={[styles.statusBadge, { borderColor: sectionStyle.border }]}>
                    <Text style={[styles.status, { color: sectionStyle.text }]}>
                      {section.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.sectionDescription}>{section.description}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>Risco: {section.risk}</Text>
                  <Text style={styles.meta}>Extensão: {formatLength(section)}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyDetails}>
            <Text style={styles.emptyDetailsTitle}>Sem dados de trechos</Text>
            <Text style={styles.emptyDetailsText}>
              Atualize os dados para tentar carregar os trechos monitorados novamente.
            </Text>
          </View>
        )}
      </ScrollView>

      <AppPopup
        visible={errorPopup.visible}
        type="error"
        title="Erro ao atualizar"
        message={errorPopup.message}
        onClose={() => setErrorPopup({ visible: false, message: "" })}
      />
    </View>
  );
}

function getSectionLength(section: RoadSection) {
  if (typeof section.tamanho === "number" && section.tamanho > 0) return section.tamanho;
  const start = section.kmInicial ?? 0;
  const end = section.kmFinal ?? start;
  return Math.max(Math.abs(end - start), 1);
}

function formatLength(section: RoadSection) {
  const length = getSectionLength(section);
  return `${Number.isInteger(length) ? length : length.toFixed(1)} km`;
}

function createStyles(theme: ReturnType<typeof useAppTheme>["theme"]) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    container: { paddingHorizontal: 20 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 22,
    },
    headerInfo: { flex: 1 },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    backText: { fontSize: 24, color: theme.colors.dark },
    title: { color: theme.colors.dark, fontSize: 23, fontWeight: "900" },
    subtitle: { color: theme.colors.muted, marginTop: 4, fontSize: 15, lineHeight: 21 },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 24,
      ...theme.shadow,
    },
    cardTitle: { color: theme.colors.dark, fontSize: 17, fontWeight: "900" },
    cardSubtitle: {
      color: theme.colors.muted,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 5,
      marginBottom: 16,
    },
    routeBar: {
      minHeight: 30,
      borderRadius: 15,
      overflow: "hidden",
      flexDirection: "row",
      backgroundColor: theme.colors.surfaceSoft,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    routeSegment: { minWidth: 8 },
    emptyRoute: {
      minHeight: 58,
      borderRadius: 14,
      backgroundColor: theme.colors.surfaceSoft,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    emptyText: { color: theme.colors.muted, fontSize: 14, fontWeight: "700" },
    statusGrid: { flexDirection: "row", gap: 8 },
    statusSummary: {
      flex: 1,
      minHeight: 72,
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    statusDot: { width: 9, height: 9, borderRadius: 5 },
    statusCount: { fontSize: 22, fontWeight: "900" },
    statusLabel: { color: theme.colors.muted, fontSize: 12, fontWeight: "800", marginTop: 1 },
    sectionTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    refresh: { color: theme.colors.primary, fontWeight: "900", fontSize: 13 },
    refreshDisabled: { opacity: 0.55 },
    sectionTitle: { color: theme.colors.dark, fontSize: 20, fontWeight: "900" },
    sectionCard: {
      borderWidth: 1,
      borderRadius: theme.radius.lg,
      padding: 16,
      marginBottom: 14,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
    },
    sectionHeaderText: { flex: 1 },
    sectionKm: { fontSize: 18, fontWeight: "900" },
    sectionName: { color: theme.colors.muted, fontSize: 14, fontWeight: "700", marginTop: 3 },
    statusBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
    status: { fontSize: 12, fontWeight: "900" },
    sectionDescription: { color: theme.colors.dark, marginTop: 10, fontSize: 15, lineHeight: 22 },
    metaRow: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 14 },
    meta: { color: theme.colors.muted, fontSize: 13 },
    emptyDetails: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 22,
      alignItems: "center",
    },
    emptyDetailsTitle: { color: theme.colors.dark, fontSize: 17, fontWeight: "900" },
    emptyDetailsText: {
      color: theme.colors.muted,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
      marginTop: 6,
    },
  });
}
