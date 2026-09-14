import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppPopup } from "../src/components/AppPopup";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { useOccurrences } from "../src/context/OccurrenceContext";
import { useAppTheme } from "../src/context/ThemeContext";

export default function EntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, loading, login } = useOccurrences();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "error" | "warning" | "info";
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    if (!loading && currentUser) router.replace("/dashboard");
  }, [loading, currentUser, router]);

  async function handleLogin() {
    if (!email.trim() || !senha) {
      setPopup({
        visible: true,
        type: "warning",
        title: "Campos obrigatórios",
        message: "Informe seu e-mail e sua senha.",
      });
      return;
    }

    setSubmitting(true);

    try {
      await login(email, senha);
      router.replace("/dashboard");
    } catch (error) {
      setPopup({
        visible: true,
        type: "error",
        title: "Não foi possível entrar",
        message:
          error instanceof Error
            ? error.message
            : "Verifique seus dados e tente novamente.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {
              paddingTop: insets.top + 24,
              paddingBottom: insets.bottom + 22,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.centerArea}>
            <Image
              source={require("../assets/logo-simbolo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />

            <Text style={styles.title}>Motiva Verde</Text>

            <Text style={styles.subtitle}>
              Acesso exclusivo para funcionários cadastrados
            </Text>
          </View>

          <View style={styles.loginCard}>
            <Text style={styles.label}>E-mail</Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="seuemail@motiva.com.br"
              placeholderTextColor={theme.colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Text style={[styles.label, styles.passwordLabel]}>Senha</Text>

            <TextInput
              value={senha}
              onChangeText={setSenha}
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor={theme.colors.muted}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <PrimaryButton
              title="Entrar"
              onPress={handleLogin}
              variant="primary"
              loading={submitting}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AppPopup
        visible={popup.visible}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={() =>
          setPopup((current) => ({
            ...current,
            visible: false,
          }))
        }
      />
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>["theme"]) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    container: {
      flexGrow: 1,
      paddingHorizontal: 28,
    },
    loading: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background,
    },
    centerArea: {
      alignItems: "center",
      justifyContent: "center",
      flexGrow: 1,
      minHeight: 300,
    },
    logoImage: {
      width: 150,
      height: 150,
    },
    title: {
      marginTop: 8,
      fontSize: 28,
      fontWeight: "900",
      color: theme.colors.dark,
    },
    subtitle: {
      marginTop: 8,
      color: theme.colors.muted,
      textAlign: "center",
      fontSize: 16,
      lineHeight: 23,
    },
    loginCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 18,
      marginTop: 24,
      ...theme.shadow,
    },
    label: {
      fontSize: 15,
      fontWeight: "900",
      color: theme.colors.dark,
      marginBottom: 8,
    },
    passwordLabel: {
      marginTop: 14,
    },
    input: {
      minHeight: 54,
      backgroundColor: theme.colors.input,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: 14,
      color: theme.colors.dark,
      fontSize: 16,
    },
    button: {
      marginTop: 18,
    },
  });
}