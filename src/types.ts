export type ComplianceStatus = 'C' | 'NC' | 'NA'; // C = Conforme, NC = Não Conforme, NA = Não se Aplica

export interface Question {
  id: string;
  sectorId: string;
  text: string;
}

export interface Sector {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  questions: Question[];
}

export interface ResponseItem {
  status: ComplianceStatus;
  comment: string;
}

export interface Audit {
  id: string;
  sectorId: string;
  sectorName: string;
  evaluator: string;
  date: string; // YYYY-MM-DD
  status: 'em_andamento' | 'finalizado';
  score: number; // % of compliance
  responses: Record<string, ResponseItem>;
  criticalNotes?: string;
}

export interface BackupData {
  audits: Audit[];
  version: string;
  exportDate: string;
}
