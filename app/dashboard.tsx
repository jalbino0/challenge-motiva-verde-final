import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { StatusCard } from "../src/components/StatusCard";
import { useOccurrences } from "../src/context/OccurrenceContext";
import { useAppTheme } from "../src/context/ThemeContext";

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { occurrences, roadSections, currentUser, logout } = useOccurrences();
  const { theme, isDark, toggleTheme } = useAppTheme();
  const styles = createStyles(theme);

  const criticalSections = roadSections.filter(
    (section) => section.status === "Crítico"
  ).length;

  const attentionSections = roadSections.filter(
    (section) => section.status === "Atenção"
  ).length;

  const completedOccurrences = occurrences.filter(
    (occurrence) => occurrence.status === "Concluída"
  ).length;

  const openOccurrences = occurrences.filter(
    (occurrence) =>
      occurrence.status !== "Concluída" &&
      occurrence.status !== "Cancelada"
  ).length;

  const latestOccurrences = occurrences.slice(0, 2);

  return (
    <View style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 36 },
        ]}
      >
        <View style={[styles.hero, { paddingTop: insets.top + 20 }]}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTextArea}>
              <Text style={styles.heroTitle}>
                Olá, {currentUser?.nome || "Operador"}
              </Text>
              <Text style={styles.heroSubtitle}>
                Bem-vindo ao Motiva Verde
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.themeButton,
                pressed && styles.pressed,
              ]}
              onPress={toggleTheme}
              accessibilityLabel="Alternar tema claro e escuro"
            >
              <Text style={styles.themeIcon}>
                {isDark ? "☀" : "☾"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.heroFooterRow}>
            <Text style={styles.themeLabel}>
              {isDark ? "Modo escuro" : "Modo claro"}
            </Text>

            <Text
              style={styles.logout}
              onPress={async () => {
                await logout();
                router.replace("/");
              }}
            >
              Sair
            </Text>
          </View>
        </View>

        <View style={styles.cardsArea}>
          <View style={styles.grid}>
            <StatusCard
              icon="!"
              value={criticalSections}
              label={criticalSections === 1 ? "Trecho crítico" : "Trechos críticos"}
              tone="red"
            />

            <StatusCard
              icon="⌖"
              value={attentionSections}
              label={
                attentionSections === 1
                  ? "Trecho em atenção"
                  : "Trechos em atenção"
              }
              tone="yellow"
            />
          </View>

          <View style={styles.grid}>
            <StatusCard
              icon="✓"
              value={completedOccurrences}
              label="Manutenções concluídas"
              tone="green"
            />

            <StatusCard
              icon="+"
              value={openOccurrences}
              label="Registros em aberto"
              tone="blue"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações rápidas</Text>

          <View style={styles.actions}>
            <PrimaryButton
              title="Registrar manutenção"
              icon="+"
              variant="success"
              onPress={() => router.push("/registrar")}
            />

            <PrimaryButton
              title="Ver mapa de trechos"
              icon="⌖"
              variant="primary"
              onPress={() => router.push("/mapa")}
            />

            <PrimaryButton
              title="Acompanhar histórico"
              icon="↗"
              variant="dark"
              onPress={() => router.push("/historico")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimos registros</Text>

          {latestOccurrences.length > 0 ? (
            latestOccurrences.map((occurrence) => (
              <View key={occurrence.id} style={styles.latestCard}>
                <View style={styles.latestInfo}>
                  <Text style={styles.latestKm}>{occurrence.km}</Text>
                  <Text style={styles.latestType}>{occurrence.type}</Text>
                </View>

                <Text style={styles.latestStatus}>
                  {occurrence.status}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                Nenhum registro encontrado
              </Text>

              <Text style={styles.emptyText}>
                Quando uma ocorrência for registrada, ela aparecerá aqui.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>["theme"]) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {},
    hero: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingBottom: 68,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
    },
    heroTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
    },
    heroTextArea: {
      flex: 1,
    },
    heroTitle: {
      color: "#FFFFFF",
      fontSize: 24,
      fontWeight: "900",
    },
    heroSubtitle: {
      color: "#EDE9FE",
      fontSize: 16,
      marginTop: 8,
    },
    themeButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.18)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.32)",
    },
    themeIcon: {
      color: "#FFFFFF",
      fontSize: 23,
      fontWeight: "900",
    },
    heroFooterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 14,
    },
    themeLabel: {
      color: "#EDE9FE",
      fontSize: 13,
      fontWeight: "800",
    },
    logout: {
      color: "#FFFFFF",
      fontWeight: "900",
      fontSize: 14,
    },
    cardsArea: {
      paddingHorizontal: 20,
      marginTop: -42,
      gap: 14,
    },
    grid: {
      flexDirection: "row",
      gap: 14,
    },
    section: {
      paddingHorizontal: 20,
      marginTop: 26,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "900",
      color: theme.colors.dark,
      marginBottom: 14,
    },
    actions: {
      gap: 14,
    },
    latestCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
    },
    latestInfo: {
      flex: 1,
    },
    latestKm: {
      fontSize: 17,
      fontWeight: "900",
      color: theme.colors.dark,
    },
    latestType: {
      marginTop: 4,
      fontSize: 15,
      color: theme.colors.muted,
      lineHeight: 18,
    },
    latestStatus: {
      color: theme.colors.primary,
      fontWeight: "900",
      fontSize: 14,
    },
    emptyCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 22,
      alignItems: "center",
    },
    emptyTitle: {
      color: theme.colors.dark,
      fontSize: 17,
      fontWeight: "900",
    },
    emptyText: {
      color: theme.colors.muted,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
      marginTop: 6,
    },
    pressed: {
      opacity: 0.82,
      transform: [{ scale: 0.97 }],
    },
  });
}