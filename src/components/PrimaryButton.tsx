import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { useAppTheme } from "../context/ThemeContext";

type ButtonVariant = "primary" | "success" | "dark" | "outline" | "danger";

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({ title, onPress, variant = "primary", icon, loading = false, disabled = false, style }: Props) {
  const { theme, isDark } = useAppTheme();
  const styles = createStyles(theme, isDark);
  const isOutline = variant === "outline";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [styles.button, styles[variant], pressed && styles.pressed, disabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? theme.colors.primary : "#FFF"} />
      ) : (
        <Text style={[styles.text, isOutline ? styles.outlineText : styles.solidText]}>
          {icon ? `${icon}  ` : ""}{title}
        </Text>
      )}
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>["theme"], isDark: boolean) {
  return StyleSheet.create({
    button: { minHeight: 54, borderRadius: theme.radius.md, alignItems: "center", justifyContent: "center", paddingHorizontal: theme.spacing.md },
    primary: { backgroundColor: theme.colors.primary },
    success: { backgroundColor: theme.colors.success },
    dark: { backgroundColor: isDark ? "#2B313C" : theme.colors.dark },
    danger: { backgroundColor: theme.colors.danger },
    outline: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
    text: { fontSize: 16, fontWeight: "800", textAlign: "center" },
    solidText: { color: "#FFFFFF" },
    outlineText: { color: theme.colors.primary },
    pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
    disabled: { opacity: 0.5 },
  });
}
