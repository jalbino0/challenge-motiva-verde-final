export type VegetationStatus = "Normal" | "Atenção" | "Crítico";
export type Priority = "Baixa" | "Média" | "Alta" | "Crítica";
export type OccurrenceStatus =
  | "Aberta"
  | "Em andamento"
  | "Concluída"
  | "Cancelada"
  | "Crítica";

export type RoadSection = {
  id: string;
  km: string;
  title: string;
  description: string;
  highway: string;
  city: string;
  status: VegetationStatus;
  risk: string;
  lastInspection: string;
  assetCode: string;
  kmInicial?: number | null;
  kmFinal?: number | null;
  tipoVegetacao?: string | null;
  latitudeInicial?: string | null;
  latitudeFinal?: string | null;
  longitudeInicial?: string | null;
  longitudeFinal?: string | null;
  tamanho?: number | null;
};

export type Occurrence = {
  id: string;
  km: string;
  section: string;
  highway: string;
  city: string;
  type: string;
  priority: Priority;
  status: OccurrenceStatus;
  description: string;
  height?: string;
  createdAt: string;
  createdBy: string;
  assetCode: string;
  location?: string;
  photoUri?: string | null;
};

export const occurrenceTypes = [
  "Mato alto bloqueando visibilidade",
  "Vegetação obstruindo sinalização",
  "Necessidade de roçada",
  "Poda necessária em árvore",
  "Vegetação próxima ao acostamento",
  "Manutenção de faixa de domínio",
];

export const priorities: Priority[] = ["Baixa", "Média", "Alta", "Crítica"];
