import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  Occurrence,
  OccurrenceStatus,
  Priority,
  RoadSection,
  VegetationStatus,
} from "../data/mockData";
import {
  api,
  Employee,
  HistoricoRow,
  RodoviaRow,
  SolicitacaoRow,
} from "../services/api";

type NewOccurrenceInput = {
  kmInicial: number;
  kmFinal: number;
  section: string;
  highway: string;
  city: string;
  type: string;
  priority: Priority;
  description: string;
  height?: string;
  location?: string;
  photoUri?: string | null;
  assetCode?: string;
  status?: OccurrenceStatus;
  roadSection: RoadSection;
};

type OccurrenceContextData = {
  occurrences: Occurrence[];
  roadSections: RoadSection[];
  currentUser: Employee | null;
  loading: boolean;
  refreshing: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
  addOccurrence: (input: NewOccurrenceInput) => Promise<Occurrence>;
  addHistoryRecord: (roadSection: RoadSection) => Promise<Occurrence>;
  updateOccurrenceStatus: (id: string, status: OccurrenceStatus) => Promise<void>;
};

const SESSION_KEY = "@motiva_verde_employee";
const OccurrenceContext = createContext<OccurrenceContextData | undefined>(undefined);

function formatDate(value?: string | null) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function normalizeStatus(status?: string | null): VegetationStatus {
  const value = (status || "").toLowerCase();
  if (value.includes("atras") || value.includes("crít") || value.includes("crit")) return "Crítico";
  if (value.includes("alert") || value.includes("aten")) return "Atenção";
  return "Normal";
}

function statusRisk(status: VegetationStatus) {
  if (status === "Crítico") return "Alto";
  if (status === "Atenção") return "Médio";
  return "Baixo";
}

function vegetationStatusWeight(status: VegetationStatus) {
  if (status === "Crítico") return 3;
  if (status === "Atenção") return 2;
  return 1;
}

function deduplicateRoadSections(rows: RodoviaRow[]) {
  const grouped = new Map<string, RoadSection>();

  for (const row of rows) {
    const mapped = mapRodovia(row);
    const start = row.kmInicial ?? 0;
    const end = row.kmFinal ?? start;
    // Mantém uma opção por trecho + intervalo. Trechos diferentes podem
    // compartilhar o mesmo KM sem serem misturados no aplicativo.
    const roadName = (row.trecho || "").trim().toLowerCase();
    const key = `${roadName}|${start}|${end}`;
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, mapped);
      continue;
    }

    const worst = vegetationStatusWeight(mapped.status) > vegetationStatusWeight(existing.status)
      ? mapped
      : existing;

    // Mantém os valores canônicos de uma linha real do banco. Não combina
    // tipoVegetacao de registros diferentes, pois o cadastro deve voltar
    // para o Histórico exatamente como está em Rodovias.
    grouped.set(key, worst);
  }

  return Array.from(grouped.values()).sort((a, b) => (a.kmInicial ?? 0) - (b.kmInicial ?? 0));
}

function mapRodovia(row: RodoviaRow): RoadSection {
  const status = normalizeStatus(row.status);
  const kmStart = row.kmInicial ?? 0;
  const kmEnd = row.kmFinal ?? kmStart;
  const km = kmStart === kmEnd ? `KM ${kmStart}` : `KM ${kmStart} - KM ${kmEnd}`;

  return {
    id: row.id,
    km,
    title: row.trecho || "Trecho sem nome",
    description: row.tipoVegetacao || "Vegetação monitorada",
    highway: "Rodovia monitorada",
    city: "",
    status,
    risk: statusRisk(status),
    lastInspection: "Dados em tempo real",
    assetCode: row.id.slice(0, 8).toUpperCase(),
    kmInicial: row.kmInicial,
    kmFinal: row.kmFinal,
    tipoVegetacao: row.tipoVegetacao,
    latitudeInicial: row.latitudeInicial,
    latitudeFinal: row.latitudeFinal,
    longitudeInicial: row.longitudeInicial,
    longitudeFinal: row.longitudeFinal,
    tamanho: row.tamanho,
  };
}

function priorityFromStatus(status?: string | null): Priority {
  if (status === "Crítica") return "Crítica";
  return "Média";
}

function mapSolicitacao(row: SolicitacaoRow): Occurrence {
  const km = row.kmFinal && row.kmFinal !== row.kmInicial
    ? `KM ${row.kmInicial ?? "-"} - KM ${row.kmFinal}`
    : `KM ${row.kmInicial ?? "-"}`;

  const location = row.latitudeInicial && row.longitudeInicial
    ? `GPS: ${row.latitudeInicial}, ${row.longitudeInicial}`
    : undefined;

  const status = (row.status || "Em andamento") as OccurrenceStatus;

  return {
    id: row.id,
    km,
    section: row.nomeTrecho || "Trecho sem nome",
    highway: "Rodovia monitorada",
    city: "",
    type: row.tipoVegetacao || "Ocorrência de vegetação",
    priority: priorityFromStatus(status),
    status,
    description: `Solicitação registrada para ${row.tipoVegetacao || "manutenção de vegetação"}.`,
    createdAt: formatDate(row.dataSolicitacao),
    createdBy: "Funcionário Motiva",
    assetCode: row.id.slice(0, 8).toUpperCase(),
    location,
    photoUri: null,
  };
}

function mapHistorico(row: HistoricoRow): Occurrence {
  const kmEnd = row.kmFinal ?? row.kmInicial;
  const km = kmEnd !== row.kmInicial
    ? `KM ${row.kmInicial ?? "-"} - KM ${kmEnd ?? "-"}`
    : `KM ${row.kmInicial ?? "-"}`;

  return {
    id: `H-${row.id}`,
    km,
    section: row.nomeTrecho || "Trecho sem nome",
    highway: "Rodovia monitorada",
    city: "",
    type: row.tipoVegetacao || "Manutenção de vegetação",
    priority: "Média",
    status: "Concluída",
    description: "Manutenção concluída e registrada no histórico.",
    createdAt: formatDate(row.dataCorte),
    createdBy: row.funcionario || "Funcionário Motiva",
    assetCode: row.id.slice(0, 8).toUpperCase(),
    photoUri: null,
  };
}

function parseGps(location?: string) {
  if (!location) return { latitude: null, longitude: null };
  const match = location.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  return match ? { latitude: match[1], longitude: match[2] } : { latitude: null, longitude: null };
}

export function OccurrenceProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [roadSections, setRoadSections] = useState<RoadSection[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoRow[]>([]);
  const [historico, setHistorico] = useState<HistoricoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const occurrences = useMemo(
    () => [
      ...solicitacoes.map(mapSolicitacao),
      ...historico.map(mapHistorico),
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [solicitacoes, historico]
  );

  async function refreshData() {
    setRefreshing(true);
    try {
      const [roads, requests, history] = await Promise.all([
        api.getRodovias(),
        api.getSolicitacoes(),
        api.getHistorico(),
      ]);
      setRoadSections(deduplicateRoadSections(roads));
      setSolicitacoes(requests);
      setHistorico(history);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    async function bootstrap() {
      try {
        const storedUser = await AsyncStorage.getItem(SESSION_KEY);
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
          await refreshData();
        }
      } catch (error) {
        console.log("Erro ao iniciar aplicativo:", error);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  async function login(email: string, senha: string) {
    const response = await api.login(email.trim(), senha);
    setCurrentUser(response.funcionario);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(response.funcionario));
    await refreshData();
  }

  async function logout() {
    setCurrentUser(null);
    setRoadSections([]);
    setSolicitacoes([]);
    setHistorico([]);
    await AsyncStorage.removeItem(SESSION_KEY);
  }

  async function addOccurrence(input: NewOccurrenceInput) {
    const gps = parseGps(input.location);
    const selected = input.roadSection;

    const result = await api.createSolicitacao({
      nomeTrecho: input.section,
      kmInicial: input.kmInicial,
      kmFinal: input.kmFinal,
      tipoVegetacao: input.type,
      latitudeInicial: gps.latitude,
      latitudeFinal: gps.latitude,
      longitudeInicial: gps.longitude,
      longitudeFinal: gps.longitude,
      status: input.priority === "Crítica" ? "Crítica" : "Em andamento",
      prioridade: input.priority,
      descricao: input.description,
      altura: input.height || null,
      fotoUri: input.photoUri || null,
      funcionario: currentUser?.funcionario || null,
    });

    await refreshData();
    const inserted = result.dados?.[0];
    return inserted ? mapSolicitacao(inserted) : occurrences[0];
  }


  async function addHistoryRecord(roadSection: RoadSection) {
    if (!currentUser) throw new Error("Sessão do funcionário não encontrada.");
    if (roadSection.kmInicial == null || roadSection.kmFinal == null) {
      throw new Error("O trecho selecionado não possui KM inicial/final válido no banco.");
    }

    const tipoVegetacao = (roadSection.tipoVegetacao || "").trim();
    if (!tipoVegetacao) {
      throw new Error("O trecho selecionado não possui tipo de vegetação cadastrado em Rodovias.");
    }

    const result = await api.createHistorico({
      nomeTrecho: roadSection.title.trim(),
      kmInicial: Number(roadSection.kmInicial),
      kmFinal: Number(roadSection.kmFinal),
      funcionario: currentUser.funcionario,
      tipoVegetacao,
    });

    await refreshData();
    const inserted = result.dados?.[0];
    if (!inserted) throw new Error("O banco não retornou o registro criado.");
    return mapHistorico(inserted);
  }

  async function updateOccurrenceStatus(id: string, status: OccurrenceStatus) {
    if (status !== "Concluída") return;
    if (!currentUser) throw new Error("Sessão do funcionário não encontrada.");
    await api.concluirSolicitacao(id, currentUser.funcionario);
    await refreshData();
  }

  const value = useMemo(
    () => ({
      occurrences,
      roadSections,
      currentUser,
      loading,
      refreshing,
      login,
      logout,
      refreshData,
      addOccurrence,
      addHistoryRecord,
      updateOccurrenceStatus,
    }),
    [occurrences, roadSections, currentUser, loading, refreshing]
  );

  return <OccurrenceContext.Provider value={value}>{children}</OccurrenceContext.Provider>;
}

export function useOccurrences() {
  const context = useContext(OccurrenceContext);
  if (!context) throw new Error("useOccurrences deve ser usado dentro de um OccurrenceProvider");
  return context;
}
