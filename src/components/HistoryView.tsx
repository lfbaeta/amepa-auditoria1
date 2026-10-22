import React, { useState } from 'react';
import { Audit } from '../types';
import { SECTORS_DATA } from '../data/sectors';
import { generateAuditPDF } from '../utils/pdfGenerator';
import { 
  Search, Filter, Calendar, FileText, Play, Trash2, Download, 
  X, Check, AlertTriangle, HelpCircle, Eye, RefreshCw 
} from 'lucide-react';

interface HistoryViewProps {
  audits: Audit[];
  onResumeAudit: (auditId: string) => void;
  onDeleteAudit: (auditId: string) => void;
}

export default function HistoryView({ audits, onResumeAudit, onDeleteAudit }: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);

  // Filter audits
  const filteredAudits = audits.filter((audit) => {
    const matchesSearch = 
      audit.evaluator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.sectorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = selectedSector === 'all' || audit.sectorId === selectedSector;
    const matchesStatus = selectedStatus === 'all' || audit.status === selectedStatus;

    return matchesSearch && matchesSector && matchesStatus;
  });

  // Sort: newest first
  const sortedAudits = [...filteredAudits].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleDownloadPDF = (audit: Audit) => {
    try {
      const doc = generateAuditPDF(audit);
      const formattedDate = audit.date.split('-').reverse().join('_');
      doc.save(`relatorio_SCIRAS_${audit.sectorId}_${formattedDate}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Erro ao gerar relatório em PDF. Por favor, tente novamente.');
    }
  };

  const handleDeleteClick = (auditId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('Atenção: Esta ação irá excluir definitivamente o registro de auditoria do banco de dados local. Deseja prosseguir?')) {
      onDeleteAudit(auditId);
      if (selectedAudit?.id === auditId) {
        setSelectedAudit(null);
      }
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (score >= 70) return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-rose-50 text-rose-700 border-rose-100';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 md:text-2xl">Histórico de Visitas</h2>
          <p className="text-xs text-gray-500 mt-1">Consulte rascunhos em andamento ou faça o download dos relatórios oficiais em PDF.</p>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6 space-y-3">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="history-search-input"
            type="text"
            placeholder="Buscar por avaliador ou setor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]/20 focus:border-[#2B7FE0] transition-all"
          />
        </div>

        {/* Filters dropdown row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Sector Selector */}
          <div>
            <label htmlFor="filter-sector-dropdown" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Setor</label>
            <select
              id="filter-sector-dropdown"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none"
            >
              <option value="all">Todos os Setores</option>
              {SECTORS_DATA.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div>
            <label htmlFor="filter-status-dropdown" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
            <select
              id="filter-status-dropdown"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="finalizado">Finalizados</option>
              <option value="em_andamento">Rascunhos</option>
            </select>
          </div>
        </div>
      </div>

      {/* History List */}
      {sortedAudits.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-xs text-gray-500">
          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-semibold">Nenhuma auditoria encontrada com os filtros aplicados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedAudits.map((audit) => {
            const isFinished = audit.status === 'finalizado';
            
            return (
              <div
                key={audit.id}
                onClick={() => setSelectedAudit(audit)}
                className="bg-white border border-gray-100 hover:border-blue-100 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5"
              >
                {/* Meta info */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-800 leading-none">
                      {audit.sectorName}
                    </span>
                    {audit.status === 'em_andamento' ? (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px] font-extrabold uppercase">
                        Rascunho
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-extrabold uppercase">
                        Finalizado
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                    <span className="flex items-center space-x-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{audit.date.split('-').reverse().join('/')}</span>
                    </span>
                    <span>•</span>
                    <span>Avaliador: {audit.evaluator}</span>
                  </div>
                </div>

                {/* Score & actions row */}
                <div className="flex items-center justify-between sm:justify-end gap-3.5 pt-2 sm:pt-0 border-t sm:border-0 border-gray-50">
                  {/* Conformity score badge */}
                  <div className={`px-3 py-1.5 border rounded-xl text-center flex flex-col justify-center min-w-16 ${getScoreColorClass(audit.score)}`}>
                    <span className="text-sm font-black tracking-tightleading-none">
                      {Math.round(audit.score)}%
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-wider">Conformidade</span>
                  </div>

                  {/* Immediate actions */}
                  <div className="flex items-center space-x-1.5">
                    {audit.status === 'em_andamento' ? (
                      <button
                        id={`btn-history-resume-${audit.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onResumeAudit(audit.id);
                        }}
                        className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-all"
                        title="Retomar preenchimento"
                      >
                        <Play className="w-4 h-4 fill-amber-700" />
                      </button>
                    ) : (
                      <button
                        id={`btn-history-pdf-${audit.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPDF(audit);
                        }}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-[#2B7FE0] rounded-lg transition-all"
                        title="Baixar PDF do Relatório"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      id={`btn-history-delete-${audit.id}`}
                      onClick={(e) => handleDeleteClick(audit.id, e)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all"
                      title="Excluir Auditoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Dialog/Drawer Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 bg-blue-50 text-[#2B7FE0] text-[9px] font-bold rounded-full uppercase tracking-wider">
                  {selectedAudit.sectorName}
                </span>
                <h3 className="text-base font-extrabold text-gray-900 mt-1">Detalhes da Auditoria</h3>
              </div>
              <button
                id="btn-modal-close"
                onClick={() => setSelectedAudit(null)}
                className="p-1.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Modal Body Scroll */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Info panel */}
              <div className="grid grid-cols-2 gap-4 bg-blue-50/20 border border-blue-50/60 rounded-2xl p-4 text-xs">
                <div>
                  <div className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Avaliador</div>
                  <div className="font-bold text-gray-800 mt-0.5">{selectedAudit.evaluator}</div>
                </div>
                <div>
                  <div className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Data da Visita</div>
                  <div className="font-bold text-gray-800 mt-0.5">{selectedAudit.date.split('-').reverse().join('/')}</div>
                </div>
                <div>
                  <div className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Status</div>
                  <div className="font-bold mt-0.5">
                    {selectedAudit.status === 'finalizado' ? (
                      <span className="text-emerald-600">Finalizado</span>
                    ) : (
                      <span className="text-amber-600">Rascunho em andamento</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">Grau de Conformidade</div>
                  <div className="font-extrabold text-[#2B7FE0] text-sm mt-0.5">{Math.round(selectedAudit.score)}%</div>
                </div>
              </div>

              {/* Critical Notes if any */}
              {selectedAudit.criticalNotes && (
                <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
                  <div className="font-bold flex items-center space-x-1 mb-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Síntese de Não Conformidades Críticas:</span>
                  </div>
                  <p className="leading-relaxed font-medium">{selectedAudit.criticalNotes}</p>
                </div>
              )}

              {/* List of responses */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Itens Avaliados</h4>
                
                {(() => {
                  const sData = SECTORS_DATA.find((s) => s.id === selectedAudit.sectorId);
                  const qList = sData?.questions || [];

                  return qList.map((q) => {
                    const response = selectedAudit.responses[q.id];
                    let statusBadge = (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[9px] font-extrabold uppercase">
                        N/A
                      </span>
                    );
                    if (response?.status === 'C') {
                      statusBadge = (
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-extrabold uppercase">
                          C
                        </span>
                      );
                    } else if (response?.status === 'NC') {
                      statusBadge = (
                        <span className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded text-[9px] font-extrabold uppercase">
                          NC
                        </span>
                      );
                    }

                    return (
                      <div key={q.id} className="border-b border-gray-50 pb-3 last:border-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start space-x-2">
                            <span className="font-mono text-xs font-bold text-gray-400 mt-0.5">{q.id}</span>
                            <span className="text-xs text-gray-700 leading-relaxed font-medium">{q.text}</span>
                          </div>
                          <div className="flex-shrink-0">{statusBadge}</div>
                        </div>
                        {response?.comment && (
                          <div className="text-[11px] font-sans italic text-gray-500 pl-6 mt-1 bg-gray-50/50 p-2 rounded-lg border border-gray-100/50">
                            Obs: {response.comment}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
              {selectedAudit.status === 'em_andamento' ? (
                <button
                  id="btn-modal-resume"
                  onClick={() => {
                    onResumeAudit(selectedAudit.id);
                    setSelectedAudit(null);
                  }}
                  className="flex items-center space-x-1.5 bg-[#2B7FE0] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-[#3C82DC] transition-colors"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Retomar Preenchimento</span>
                </button>
              ) : (
                <button
                  id="btn-modal-pdf"
                  onClick={() => handleDownloadPDF(selectedAudit)}
                  className="flex items-center space-x-1.5 bg-[#2B7FE0] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-[#3C82DC] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Gerar Relatório PDF</span>
                </button>
              )}

              <button
                id="btn-modal-delete-inside"
                onClick={(e) => {
                  handleDeleteClick(selectedAudit.id, e);
                }}
                className="flex items-center space-x-1.5 bg-rose-50 text-rose-600 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-rose-100 transition-colors border border-rose-100"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Registro</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
