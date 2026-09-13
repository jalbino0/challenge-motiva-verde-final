import { Platform } from "react-native";

const defaultBaseUrl =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") || defaultBaseUrl;

type RequestOptions = RequestInit & { json?: unknown };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { json, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.message || payload?.erro || payload?.error || "Erro ao comunicar com o servidor.";
    throw new Error(message);
  }

  return payload as T;
}

export type Employee = {
  id?: string;
  email: string;
  nome: string;
  sobrenome: string;
  funcionario: string;
};

export type RodoviaRow = {
  id: string;
  trecho: string | null;
  kmInicial: number | null;
  kmFinal: number | null;
  tipoVegetacao: string | null;
  tamanho: number | null;
  status: string | null;
  latitudeInicial: string | null;
  latitudeFinal: string | null;
  longitudeInicial: string | null;
  longitudeFinal: string | null;
  crescimentoDiario: number | null;
  sensorEncoberto: boolean | null;
  vistoriaSolicitada: boolean | null;
};

export type SolicitacaoRow = {
  id: string;
  nomeTrecho: string | null;
  kmInicial: string | null;
  kmFinal: string | null;
  tipoVegetacao: string | null;
  latitudeInicial: string | null;
  latitudeFinal: string | null;
  longitudeInicial: string | null;
  longitudeFinal: string | null;
  dataLimite: string | null;
  dataSolicitacao: string | null;
  status: string | null;
};

export type HistoricoRow = {
  id: string;
  nomeTrecho: string | null;
  kmInicial: number | null;
  kmFinal: number | null;
  funcionario: string | null;
  dataCorte: string | null;
  tipoVegetacao: string | null;
};

export const api = {
  login(email: string, senha: string) {
    return request<{ status: boolean; funcionario: Employee }>("/funcionarios/login", {
      method: "POST",
      json: { email, senha },
    });
  },

  getRodovias() {
    return request<RodoviaRow[]>("/rodovias");
  },

  getSolicitacoes() {
    return request<SolicitacaoRow[]>("/solicitacoes");
  },

  createSolicitacao(data: Record<string, unknown>) {
    return request<{ status: string; dados: SolicitacaoRow[] }>("/solicitacoes", {
      method: "POST",
      json: data,
    });
  },

  concluirSolicitacao(id: string, funcionario: string) {
    return request<{ status: string }>(`/solicitacoes/${id}/concluir`, {
      method: "POST",
      json: { funcionario },
    });
  },

  getHistorico() {
    return request<HistoricoRow[]>("/historico");
  },

  createHistorico(data: {
    nomeTrecho: string;
    kmInicial: number;
    kmFinal: number;
    funcionario: string;
    tipoVegetacao: string;
  }) {
    return request<{ status: string; dados: HistoricoRow[] }>("/historico", {
      method: "POST",
      json: data,
    });
  },
};
