import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../context/ThemeContext";

type PopupType = "success" | "error" | "warning" | "info";

type Props = {
  visible: boolean;
  type?: PopupType;
  title: string;
  message: string;
  onClose: () => void;
  primaryLabel?: string;
  onPrimaryAction?: () => void;
  secondaryLabel?: string;
};

const icons: Record<PopupType, string> = {
  success: "✓",
  error: "!",
  warning: "!",
  info: "i",
};

export function AppPopup({
  visible,
  type = "info",
  title,
  message,
  onClose,
  primaryLabel = "OK",
  onPrimaryAction,
  secondaryLabel,
}: Props) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme, type);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>{icons[type]}</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            onPress={onPrimaryAction ?? onClose}
          >
            <Text style={styles.primaryText}>{primaryLabel}</Text>
          </Pressable>

          {secondaryLabel ? (
            <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} onPress={onClose}>
              <Text style={styles.secondaryText}>{secondaryLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>["theme"], type: PopupType) {
  const accent =
    type === "success"
      ? theme.colors.success
      : type === "error"
        ? theme.colors.danger
        : type === "warning"
          ? theme.colors.warning
          : theme.colors.primary;

  const soft =
    type === "success"
      ? theme.colors.successSoft
      : type === "error"
        ? theme.colors.dangerSoft
        : type === "warning"
          ? theme.colors.warningSoft
          : theme.colors.surfaceSoft;

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 26,
      padding: 24,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow,
    },
    iconCircle: {
      width: 66,
      height: 66,
      borderRadius: 33,
      backgroundColor: soft,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
      borderWidth: 1,
      borderColor: accent,
    },
    icon: { color: accent, fontSize: 31, fontWeight: "900" },
    title: { color: theme.colors.dark, fontSize: 23, fontWeight: "900", textAlign: "center" },
    message: {
      color: theme.colors.muted,
      fontSize: 16,
      lineHeight: 23,
      textAlign: "center",
      marginTop: 10,
      marginBottom: 22,
    },
    primaryButton: {
      width: "100%",
      minHeight: 52,
      borderRadius: 15,
      backgroundColor: accent,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
    secondaryButton: { marginTop: 8, paddingVertical: 10, paddingHorizontal: 18 },
    secondaryText: { color: theme.colors.muted, fontWeight: "800", fontSize: 14 },
    pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  });
}
