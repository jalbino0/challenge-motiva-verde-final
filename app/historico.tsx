import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppPopup } from "../src/components/AppPopup";
import { OccurrenceCard } from "../src/components/OccurrenceCard";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { useOccurrences } from "../src/context/OccurrenceContext";
import { useAppTheme } from "../src/context/ThemeContext";

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { occurrences, updateOccurrenceStatus, refreshData, refreshing } = useOccurrences();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorPopup, setErrorPopup] = useState({ visible: false, message: "" });

  async function handleFinishOccurrence(id: string) {
    try {
      await updateOccurrenceStatus(id, "Concluída");
      setShowSuccess(true);
    } catch (error) {
      setErrorPopup({
        visible: true,
        message: error instanceof Error ? error.message : "Não foi possível atualizar o banco.",
      });
    }
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
            : "Não foi possível atualizar os registros. Tente novamente.",
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
          <View style={styles.headerContent}>
            <Text style={styles.title}>Histórico</Text>
            <Text style={styles.subtitle}>Ocorrências registradas</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{occurrences.length}</Text>
          <Text style={styles.summaryText}>registros carregados do banco</Text>
        </View>

        {occurrences.length > 0 ? (
          occurrences.map((occurrence) => (
            <OccurrenceCard
              key={occurrence.id}
              occurrence={occurrence}
              showAction
              onFinish={() => handleFinishOccurrence(occurrence.id)}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhuma ocorrência registrada</Text>
            <Text style={styles.emptyText}>
              O histórico está vazio. Registre uma nova ocorrência para iniciar o acompanhamento.
            </Text>
          </View>
        )}

        <View style={styles.footerActions}>
          <PrimaryButton
            title="Registrar manutenção"
            icon="+"
            variant="success"
            onPress={() => router.push("/registrar")}
          />
          <PrimaryButton
            title={refreshing ? "Atualizando..." : "Atualizar dados"}
            variant="outline"
            onPress={handleRefresh}
            loading={refreshing}
          />
        </View>
      </ScrollView>

      <AppPopup
        visible={showSuccess}
        type="success"
        title="Ocorrência concluída"
        message="O status foi atualizado e o registro foi enviado para o histórico."
        primaryLabel="Continuar"
        secondaryLabel="Fechar"
        onPrimaryAction={() => setShowSuccess(false)}
        onClose={() => setShowSuccess(false)}
      />

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
    headerContent: { flex: 1 },
    title: { color: theme.colors.dark, fontSize: 23, fontWeight: "900" },
    subtitle: { color: theme.colors.muted, marginTop: 4, fontSize: 15, lineHeight: 21 },
    summaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    summaryNumber: { color: theme.colors.primary, fontSize: 30, fontWeight: "900" },
    summaryText: { color: theme.colors.muted, fontSize: 15, fontWeight: "800" },
    emptyCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 22,
      alignItems: "center",
      marginBottom: 14,
    },
    emptyTitle: { color: theme.colors.dark, fontSize: 17, fontWeight: "900" },
    emptyText: {
      color: theme.colors.muted,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
      marginTop: 6,
    },
    footerActions: { gap: 14, marginTop: 10 },
  });
}
