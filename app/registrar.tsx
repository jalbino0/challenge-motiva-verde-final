import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppPopup } from "../src/components/AppPopup";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { useOccurrences } from "../src/context/OccurrenceContext";
import { useAppTheme } from "../src/context/ThemeContext";
import { occurrenceTypes, priorities, Priority, RoadSection } from "../src/data/mockData";

type RoadOption = {
  name: string;
  reference: RoadSection;
  minKm: number | null;
  maxKm: number | null;
};

function parseKm(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

export default function RegisterOccurrenceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addOccurrence, roadSections, currentUser } = useOccurrences();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  const roads = useMemo<RoadOption[]>(() => {
    const grouped = new Map<string, RoadOption>();

    for (const section of roadSections) {
      const name = section.title.trim();
      const key = name.toLowerCase();
      const start = section.kmInicial ?? null;
      const end = section.kmFinal ?? start;
      const existing = grouped.get(key);

      if (!existing) {
        grouped.set(key, {
          name,
          reference: section,
          minKm: start,
          maxKm: end,
        });
        continue;
      }

      if (start != null) existing.minKm = existing.minKm == null ? start : Math.min(existing.minKm, start);
      if (end != null) existing.maxKm = existing.maxKm == null ? end : Math.max(existing.maxKm, end);
    }

    return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [roadSections]);

  const [selectedRoad, setSelectedRoad] = useState<RoadOption | null>(null);
  const [kmInicial, setKmInicial] = useState("");
  const [kmFinal, setKmFinal] = useState("");
  const [type, setType] = useState("");
  const [priority, setPriority] = useState<Priority>("Média");
  const [height, setHeight] = useState("");
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("GPS: localização ainda não capturada");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [popup, setPopup] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "error" | "warning" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  const funcionario = currentUser?.funcionario || "Funcionário não identificado";

  function showPopup(type: "error" | "warning" | "info", title: string, message: string) {
    setPopup({ visible: true, type, title, message });
  }

  async function handleGetLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationText("GPS: permissão de localização negada");
        showPopup("warning", "Permissão negada", "Não foi possível capturar a localização do dispositivo.");
        return;
      }

      setLocationText("GPS: capturando localização...");
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const latitude = location.coords.latitude.toFixed(6);
      const longitude = location.coords.longitude.toFixed(6);
      setLocationText(`GPS: ${latitude}, ${longitude}`);
    } catch {
      setLocationText("GPS: não foi possível capturar a localização");
      showPopup("error", "Erro no GPS", "Não foi possível obter a localização atual. Tente novamente.");
    }
  }

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showPopup("warning", "Permissão negada", "Não foi possível acessar a galeria do dispositivo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.6 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  }

  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showPopup("warning", "Permissão negada", "Não foi possível acessar a câmera do dispositivo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.6 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  }

  async function handleSave() {
    if (!currentUser) {
      showPopup("error", "Sessão inválida", "Entre novamente para identificar o funcionário responsável.");
      return;
    }
    if (!selectedRoad) {
      showPopup("warning", "Rodovia obrigatória", "Selecione a rodovia em que a operação deverá ser realizada.");
      return;
    }

    const startKm = parseKm(kmInicial);
    const endKm = parseKm(kmFinal);
    if (startKm == null || endKm == null) {
      showPopup("warning", "KM obrigatório", "Informe KM inicial e KM final usando apenas números, por exemplo 10 ou 10,5.");
      return;
    }
    if (startKm < 0 || endKm < 0) {
      showPopup("warning", "KM inválido", "Os quilômetros não podem ser negativos.");
      return;
    }
    if (endKm < startKm) {
      showPopup("warning", "Intervalo inválido", "O KM final precisa ser igual ou maior que o KM inicial.");
      return;
    }
    if (!type) {
      showPopup("warning", "Operação obrigatória", "Selecione qual tipo de operação deverá ser realizada.");
      return;
    }
    if (!description.trim()) {
      showPopup("warning", "Descrição obrigatória", "Descreva brevemente a situação encontrada.");
      return;
    }

    setSaving(true);
    try {
      await addOccurrence({
        kmInicial: startKm,
        kmFinal: endKm,
        section: selectedRoad.name,
        highway: selectedRoad.name,
        city: "",
        type,
        priority,
        status: priority === "Crítica" ? "Crítica" : "Em andamento",
        description: description.trim(),
        height: height.trim(),
        location: locationText.startsWith("GPS: -") || /GPS: \d/.test(locationText) ? locationText : undefined,
        photoUri,
        assetCode: selectedRoad.reference.assetCode,
        roadSection: selectedRoad.reference,
      });
      setSuccessVisible(true);
    } catch (error) {
      showPopup(
        "error",
        "Erro ao registrar",
        error instanceof Error ? error.message : "Não foi possível salvar a solicitação no banco de dados."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            <Text style={styles.title}>Registrar Ocorrência</Text>
            <Text style={styles.subtitle}>Solicite uma operação de manutenção</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Funcionário responsável</Text>
          <Text style={styles.infoValue}>{funcionario}</Text>
          <Text style={styles.infoHelper}>Preenchido automaticamente a partir do login.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Rodovia</Text>
          <Text style={styles.helperTop}>Escolha uma rodovia cadastrada no banco de dados.</Text>
          {roads.length === 0 ? <Text style={styles.helper}>Nenhuma rodovia foi carregada do banco.</Text> : null}
          <View style={styles.chipGroup}>
            {roads.map((road) => {
              const selected = selectedRoad?.name === road.name;
              return (
                <Pressable
                  key={road.name}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setSelectedRoad(road)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{road.name}</Text>
                </Pressable>
              );
            })}
          </View>
          {selectedRoad && selectedRoad.minKm != null && selectedRoad.maxKm != null ? (
            <Text style={styles.helper}>
              Referência cadastrada: KM {selectedRoad.minKm} até KM {selectedRoad.maxKm}
            </Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Intervalo da ocorrência</Text>
          <View style={styles.kmRow}>
            <View style={styles.kmField}>
              <Text style={styles.fieldLabel}>KM inicial</Text>
              <TextInput
                style={styles.input}
                value={kmInicial}
                onChangeText={setKmInicial}
                placeholder="Ex: 10"
                placeholderTextColor={theme.colors.muted}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.kmField}>
              <Text style={styles.fieldLabel}>KM final</Text>
              <TextInput
                style={styles.input}
                value={kmFinal}
                onChangeText={setKmFinal}
                placeholder="Ex: 20"
                placeholderTextColor={theme.colors.muted}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          <Text style={styles.helper}>Os KMs são informados manualmente pelo operador.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Localização por GPS</Text>
          <Text style={styles.locationText}>{locationText}</Text>
          <PrimaryButton
            title="Capturar localização atual"
            icon="⌖"
            variant="outline"
            onPress={handleGetLocation}
            style={styles.smallButton}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Tipo de operação</Text>
          <Text style={styles.helperTop}>Selecione a operação que deverá ser realizada neste intervalo.</Text>
          <View style={styles.chipGroup}>
            {occurrenceTypes.map((item) => (
              <Pressable
                key={item}
                style={[styles.chip, type === item && styles.chipSelected]}
                onPress={() => setType(item)}
              >
                <Text style={[styles.chipText, type === item && styles.chipTextSelected]}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Prioridade</Text>
          <View style={styles.priorityRow}>
            {priorities.map((item) => (
              <Pressable
                key={item}
                style={[styles.priorityChip, priority === item && styles.prioritySelected]}
                onPress={() => setPriority(item)}
              >
                <Text style={[styles.priorityText, priority === item && styles.priorityTextSelected]}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Altura estimada da vegetação</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="Ex: 1,5 m ou 80 cm"
            placeholderTextColor={theme.colors.muted}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Descrição breve</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descreva a situação encontrada..."
            placeholderTextColor={theme.colors.muted}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Adicionar foto</Text>
          <View style={styles.photoActions}>
            <PrimaryButton title="Tirar foto" variant="outline" onPress={handleTakePhoto} style={styles.photoButton} />
            <PrimaryButton title="Escolher galeria" variant="outline" onPress={handlePickImage} style={styles.photoButton} />
          </View>
          {photoUri && <Image source={{ uri: photoUri }} style={styles.photo} />}
        </View>

        <PrimaryButton title="Salvar ocorrência" icon="✓" variant="success" onPress={handleSave} loading={saving} />
      </ScrollView>

      <AppPopup
        visible={successVisible}
        type="success"
        title="Ocorrência registrada!"
        message="A solicitação foi salva no banco com a rodovia selecionada, os KMs informados, o tipo de operação e o funcionário da sessão."
        primaryLabel="Ver histórico"
        secondaryLabel="Fechar"
        onClose={() => setSuccessVisible(false)}
        onPrimaryAction={() => {
          setSuccessVisible(false);
          router.replace("/historico");
        }}
      />

      <AppPopup
        visible={popup.visible}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={() => setPopup((current) => ({ ...current, visible: false }))}
      />
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>["theme"]) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    container: { paddingHorizontal: 20 },
    header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 22 },
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
    infoCard: {
      backgroundColor: theme.colors.surfaceSoft,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      padding: 16,
      marginBottom: 14,
    },
    infoTitle: { color: theme.colors.muted, fontSize: 14, fontWeight: "800" },
    infoValue: { color: theme.colors.primary, fontSize: 20, fontWeight: "900", marginTop: 5 },
    infoHelper: { color: theme.colors.muted, fontSize: 14, lineHeight: 20, marginTop: 6 },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      marginBottom: 14,
    },
    label: { color: theme.colors.dark, fontSize: 16, fontWeight: "900", marginBottom: 10 },
    fieldLabel: { color: theme.colors.muted, fontSize: 14, fontWeight: "800", marginBottom: 7 },
    helperTop: { color: theme.colors.muted, fontSize: 14, lineHeight: 20, marginBottom: 12 },
    helper: { color: theme.colors.muted, fontSize: 14, lineHeight: 20, marginTop: 10 },
    locationText: { color: theme.colors.dark, fontSize: 14, fontWeight: "700", lineHeight: 20 },
    input: {
      minHeight: 52,
      backgroundColor: theme.colors.input,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: 14,
      color: theme.colors.dark,
      fontSize: 16,
    },
    textArea: { minHeight: 110, paddingTop: 14 },
    smallButton: { marginTop: 14, minHeight: 44 },
    chipGroup: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    chip: {
      backgroundColor: theme.colors.surfaceSoft,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    chipSelected: { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.primary },
    chipText: { color: theme.colors.muted, fontSize: 14, fontWeight: "800" },
    chipTextSelected: { color: theme.colors.primary },
    kmRow: { flexDirection: "row", gap: 10 },
    kmField: { flex: 1 },
    priorityRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    priorityChip: {
      flex: 1,
      minWidth: 70,
      alignItems: "center",
      backgroundColor: theme.colors.surfaceSoft,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingVertical: 12,
    },
    prioritySelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    priorityText: { color: theme.colors.muted, fontSize: 14, fontWeight: "900" },
    priorityTextSelected: { color: "#FFFFFF" },
    photoActions: { flexDirection: "row", gap: 10 },
    photoButton: { flex: 1, minHeight: 46 },
    photo: { width: "100%", height: 180, borderRadius: theme.radius.md, marginTop: 14 },
  });
}
