import { Audit, BackupData, Sector } from '../types';
import { SECTORS_DATA } from '../data/sectors';

const STORAGE_KEY = 'gestor_auditorias_audits';
const SECTORS_STORAGE_KEY = 'gestor_auditorias_sectors';

// Get all sectors from localStorage or return default SECTORS_DATA
export function getSavedSectors(): Sector[] {
  try {
    const rawData = localStorage.getItem(SECTORS_STORAGE_KEY);
    if (!rawData) {
      return SECTORS_DATA;
    }
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Failed to parse saved sectors', error);
    return SECTORS_DATA;
  }
}

// Save sectors to localStorage
export function saveSectors(sectors: Sector[]): void {
  try {
    localStorage.setItem(SECTORS_STORAGE_KEY, JSON.stringify(sectors));
  } catch (error) {
    console.error('Failed to save sectors', error);
  }
}

// Get all audits from localStorage
export function getSavedAudits(): Audit[] {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return getDemoAudits(); // seed demo data if empty so the app has content on first run
    }
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Failed to parse saved audits', error);
    return getDemoAudits();
  }
}

// Save audits to localStorage
export function saveAudits(audits: Audit[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(audits));
  } catch (error) {
    console.error('Failed to save audits', error);
  }
}

// Export audits to JSON file for download
export function exportBackup(audits: Audit[]): void {
  const backup: BackupData = {
    audits,
    version: '1.0.0',
    exportDate: new Date().toISOString(),
  };

  const dataStr = JSON.stringify(backup, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  const formattedDate = new Date().toISOString().slice(0, 10);
  link.download = `backup_auditorias_${formattedDate}.json`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// Export audits to CSV format compatible with Excel (using UTF-8 BOM and semicolon separator)
export function exportToCSV(audits: Audit[]): void {
  const sectors = getSavedSectors();
  // We want to create rows for questions/responses in all audits
  // Columns: ID Auditoria, Setor, Data, Status, Pontuação, ID Pergunta, Pergunta, Conformidade, Comentários, Avaliador
  const headers = [
    'ID Auditoria',
    'Setor',
    'Data',
    'Status',
    'Conformidade Geral (%)',
    'ID Pergunta',
    'Pergunta',
    'Status Resposta',
    'Observações / Ações',
    'Avaliador'
  ];

  const rows: string[][] = [headers];

  audits.forEach((audit) => {
    const sector = sectors.find((s) => s.id === audit.sectorId);
    if (!sector) return;

    sector.questions.forEach((q) => {
      const response = audit.responses[q.id] || { status: 'NA', comment: '' };
      
      let statusLabel = 'Não se Aplica';
      if (response.status === 'C') statusLabel = 'Conforme';
      if (response.status === 'NC') statusLabel = 'Não Conforme';

      const row = [
        audit.id,
        audit.sectorName,
        audit.date.split('-').reverse().join('/'),
        audit.status === 'finalizado' ? 'Finalizado' : 'Em andamento',
        Math.round(audit.score).toString(),
        q.id,
        q.text.replace(/"/g, '""'),
        statusLabel,
        (response.comment || '').replace(/"/g, '""'),
        audit.evaluator || ''
      ];
      rows.push(row);
    });
  });

  // Build CSV string
  // Use semicolon and wrap fields in quotes for maximum Excel compatibility in Portuguese locale
  const csvContent = rows
    .map((row) => row.map((field) => `"${field}"`).join(';'))
    .join('\n');

  // Add BOM for Excel UTF-8 representation
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const formattedDate = new Date().toISOString().slice(0, 10);
  link.download = `auditorias_sciras_${formattedDate}.csv`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// Parse imported JSON and return audits if valid
export function importBackup(fileContent: string): Audit[] {
  try {
    const data = JSON.parse(fileContent) as BackupData;
    if (data && Array.isArray(data.audits)) {
      return data.audits;
    }
    throw new Error('Formato de arquivo inválido. A chave "audits" deve ser um array.');
  } catch (error) {
    throw new Error('Falha ao processar arquivo de backup: ' + (error instanceof Error ? error.message : 'formato incorreto'));
  }
}

// Seeding some dummy audits so user sees a beautiful system upon opening
function getDemoAudits(): Audit[] {
  return [
    {
      id: 'aud-001',
      sectorId: 'gerais',
      sectorName: 'Requisitos Gerais',
      evaluator: 'Dr. Lucas Bezerra',
      date: '2026-06-25',
      status: 'finalizado',
      score: 75,
      responses: {
        '1.1': { status: 'C', comment: 'Todas as pias desimpedidas.' },
        '1.2': { status: 'C', comment: '' },
        '1.3': { status: 'C', comment: 'Validade até 2027.' },
        '1.4': { status: 'NC', comment: 'Alguns profissionais da enfermagem esqueceram de lavar as mãos após contato indireto.' },
        '1.5': { status: 'C', comment: '' },
        '1.6': { status: 'C', comment: '' },
        '1.7': { status: 'NC', comment: 'Observados dois médicos vestindo anel e relógio durante o exame.' },
        '1.8': { status: 'C', comment: '' },
        '1.9': { status: 'C', comment: '' },
        '1.10': { status: 'NC', comment: 'Coletor de perfurocortante do posto B passou da linha de 2/3.' },
        '1.11': { status: 'C', comment: '' },
        '1.12': { status: 'C', comment: '' }
      },
      criticalNotes: 'Atenção aos adornos (NR-32) e ao esvaziamento tempestivo de coletores de perfurocortantes.'
    },
    {
      id: 'aud-002',
      sectorId: 'laboratorio',
      sectorName: 'Laboratório de Análises Clínicas',
      evaluator: 'Dra. Mariana Silva',
      date: '2026-06-26',
      status: 'finalizado',
      score: 87.5,
      responses: {
        '2.1': { status: 'C', comment: '' },
        '2.2': { status: 'C', comment: '' },
        '2.3': { status: 'C', comment: '' },
        '2.4': { status: 'C', comment: '' },
        '2.5': { status: 'NA', comment: 'Não possuímos cabine biológica ativa neste bloco.' },
        '2.6': { status: 'C', comment: '' },
        '2.7': { status: 'NC', comment: 'Registro de temperatura falhou no dia 24/06.' },
        '2.8': { status: 'C', comment: '' }
      },
      criticalNotes: 'Manter a folha de registros de temperatura preenchida diariamente sem lacunas.'
    },
    {
      id: 'aud-003',
      sectorId: 'cme',
      sectorName: 'CME (Central de Material e Esterilização)',
      evaluator: 'Dr. Lucas Bezerra',
      date: '2026-06-27',
      status: 'em_andamento',
      score: 50,
      responses: {
        '3.1': { status: 'C', comment: 'Unidirecional perfeito.' },
        '3.2': { status: 'NC', comment: 'Profissional no expurgo sem protetor facial regulamentado.' },
        '3.3': { status: 'C', comment: '' },
        '3.4': { status: 'C', comment: '' },
        '3.5': { status: 'NC', comment: 'Uma seladora apresentando frouxidão no lacre plástico.' }
      }
    }
  ];
}
