import React, { useState, useEffect } from 'react';
import { Audit, Sector } from '../types';
import { getSavedSectors } from '../utils/dataStorage';
import { generateActionPlanPDF, generateExecutiveReportPDF } from '../utils/customReports';
import { exportToCSV } from '../utils/dataStorage';
import { 
  ShieldCheck, AlertOctagon, HelpCircle, TrendingDown, ClipboardList, 
  FileText, Download, Calendar, Users, Briefcase, Filter, RefreshCw
} from 'lucide-react';

interface DashboardViewProps {
  audits: Audit[];
}

export default function DashboardView({ audits }: DashboardViewProps) {
  const [sectors, setSectors] = useState<Sector[]>([]);
  
  // Custom Report Options States
  const [institution, setInstitution] = useState('HOSPITAL DE CLÍNICAS SCIRAS');
  const [customTitle, setCustomTitle] = useState('Relatório Técnico de Visita de Conformidade');
  const [filterSectorId, setFilterSectorId] = useState('all');
  const [filterEvaluator, setFilterEvaluator] = useState('all');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  // Loaded unique evaluators list
  const [evaluators, setEvaluators] = useState<string[]>([]);

  useEffect(() => {
    setSectors(getSavedSectors());
    
    // Extract unique evaluators
    const uniqueEvaluators = Array.from(
      new Set(audits.map(a => a.evaluator).filter(Boolean))
    );
    setEvaluators(uniqueEvaluators);
  }, [audits]);

  // Filter finalized audits for calculation
  const finalizedAudits = audits.filter((a) => a.status === 'finalizado');

  // Apply interactive filters for metrics and report preview
  const getFilteredAudits = () => {
    return finalizedAudits.filter(audit => {
      // Sector filter
      if (filterSectorId !== 'all' && audit.sectorId !== filterSectorId) {
        return false;
      }
      // Evaluator filter
      if (filterEvaluator !== 'all' && audit.evaluator !== filterEvaluator) {
        return false;
      }
      // Start date filter
      if (filterDateStart && audit.date < filterDateStart) {
        return false;
      }
      // End date filter
      if (filterDateEnd && audit.date > filterDateEnd) {
        return false;
      }
      return true;
    });
  };

  const displayedAudits = getFilteredAudits();
  const totalAudits = displayedAudits.length;
  
  let averageConformity = 0;
  if (totalAudits > 0) {
    const sum = displayedAudits.reduce((acc, a) => acc + a.score, 0);
    averageConformity = sum / totalAudits;
  }

  // Count response statuses globally across finalized audits
  let globalC = 0;
  let globalNC = 0;
  let globalNA = 0;

  displayedAudits.forEach((audit) => {
    Object.values(audit.responses).forEach((resp) => {
      if (resp.status === 'C') globalC++;
      if (resp.status === 'NC') globalNC++;
      if (resp.status === 'NA') globalNA++;
    });
  });

  // Calculate sector metrics based on current active sectors (dynamic!)
  const sectorNCStats = sectors.map((sector) => {
    const sectorAudits = displayedAudits.filter((a) => a.sectorId === sector.id);
    let ncCount = 0;
    let totalC = 0;

    sectorAudits.forEach((audit) => {
      Object.values(audit.responses).forEach((resp) => {
        if (resp.status === 'NC') ncCount++;
        if (resp.status === 'C') totalC++;
      });
    });

    const sectorComplianceAvg = sectorAudits.length > 0 
      ? sectorAudits.reduce((sum, a) => sum + a.score, 0) / sectorAudits.length 
      : 100;

    return {
      sectorId: sector.id,
      sectorName: sector.name,
      ncCount,
      auditCount: sectorAudits.length,
      complianceAverage: sectorComplianceAvg,
      questionsCount: sector.questions ? sector.questions.length : 0
    };
  });

  // Sort sectors by count of NC descending
  const sortedSectorsByNC = [...sectorNCStats].sort((a, b) => b.ncCount - a.ncCount);
  const maxNC = Math.max(...sortedSectorsByNC.map((s) => s.ncCount), 1);

  // Collect a timeline list of recent Non-Conformances with comments
  const recentNonConformances: {
    auditId: string;
    sectorName: string;
    date: string;
    evaluator: string;
    questionId: string;
    questionText: string;
    comment: string;
  }[] = [];

  displayedAudits.forEach((audit) => {
    const sector = sectors.find((s) => s.id === audit.sectorId);
    if (!sector) return;

    Object.entries(audit.responses).forEach(([qId, resp]) => {
      if (resp.status === 'NC') {
        const question = sector.questions?.find((q) => q.id === qId);
        recentNonConformances.push({
          auditId: audit.id,
          sectorName: audit.sectorName,
          date: audit.date,
          evaluator: audit.evaluator,
          questionId: qId,
          questionText: question ? question.text : 'Item avaliado',
          comment: resp.comment || 'Nenhuma justificativa detalhada inserida.'
        });
      }
    });
  });

  // Sort NC items by date descending, take top 5
  const latestNCItems = [...recentNonConformances]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Report triggers
  const handleExportActionPlan = () => {
    const doc = generateActionPlanPDF(displayedAudits, sectors, institution, customTitle);
    doc.save(`plano_de_acao_sciras_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleExportExecutive = () => {
    const doc = generateExecutiveReportPDF(displayedAudits, sectors, institution, customTitle);
    doc.save(`relatorio_executivo_sciras_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleExportCSVData = () => {
    exportToCSV(displayedAudits);
  };

  const resetFilters = () => {
    setFilterSectorId('all');
    setFilterEvaluator('all');
    setFilterDateStart('');
    setFilterDateEnd('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 md:text-2xl">Métricas e Opções de Relatórios</h2>
          <p className="text-xs text-gray-500 mt-1">Configure parâmetros customizados, filtre dados de auditoria e exporte relatórios técnicos robustos para SCIRAS.</p>
        </div>
      </div>

      {/* 1. Report Options and Filters Control Room */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-50 pb-3">
          <Filter className="w-4.5 h-4.5 text-[#2B7FE0]" />
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Filtros Avançados e Customização de Relatório</h3>
        </div>

        {/* Input customizations for Institutional report name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">Nome do Hospital / Unidade no PDF</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#2B7FE0]"
              placeholder="Ex: HOSPITAL SANTA MARIA"
            />
          </div>
          <div>
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">Título do Relatório Técnico no PDF</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#2B7FE0]"
              placeholder="Ex: Visita Técnica Mensal de Biossegurança"
            />
          </div>
        </div>

        {/* Interactive filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">Setor</label>
            <select
              value={filterSectorId}
              onChange={(e) => setFilterSectorId(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 font-semibold focus:outline-none"
            >
              <option value="all">Todos os Setores ({sectors.length})</option>
              {sectors.map(sec => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">Avaliador</label>
            <select
              value={filterEvaluator}
              onChange={(e) => setFilterEvaluator(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 font-semibold focus:outline-none"
            >
              <option value="all">Todos os Avaliadores</option>
              {evaluators.map(ev => (
                <option key={ev} value={ev}>{ev}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">De (Data)</label>
            <input
              type="date"
              value={filterDateStart}
              onChange={(e) => setFilterDateStart(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">Até (Data)</label>
            <input
              type="date"
              value={filterDateEnd}
              onChange={(e) => setFilterDateEnd(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Clear filter buttons and action triggers */}
        <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-xs">
          <button
            type="button"
            onClick={resetFilters}
            className="text-gray-400 hover:text-gray-600 font-bold flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Limpar Filtros</span>
          </button>
          <span className="text-[10px] bg-blue-50 text-[#2B7FE0] px-2.5 py-1 rounded-full font-bold">
            {displayedAudits.length} de {finalizedAudits.length} visitas consolidadas atendem aos filtros
          </span>
        </div>
      </div>

      {displayedAudits.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-xs">
          <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Sem correspondências com os filtros ativos</h3>
          <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto">
            Ajuste as datas, avaliadores ou setores selecionados para atualizar os gráficos e gerar os relatórios técnicos correspondentes.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive PDF & Action Plan download options */}
          <div className="bg-blue-50/50 border border-blue-50 rounded-2xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 pr-2 flex flex-col justify-center">
              <h4 className="text-sm font-bold text-blue-900 flex items-center space-x-1.5">
                <FileText className="w-4.5 h-4.5 text-[#2B7FE0]" />
                <span>Exportação de Relatórios</span>
              </h4>
              <p className="text-[11px] text-blue-700 mt-1.5 leading-relaxed">
                Baixe relatórios completos e consolidados baseados nos filtros selecionados acima.
              </p>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                id="btn-report-action-plan-pdf"
                onClick={handleExportActionPlan}
                className="p-3 bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-200 text-left rounded-xl transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="p-1 w-7 h-7 rounded-lg bg-rose-50 text-rose-600 mb-2 flex items-center justify-center">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-gray-800 leading-tight">Plano de Ação NCs</span>
                  <span className="text-[9px] text-gray-400 mt-1 block">Apenas Não Conformidades</span>
                </div>
              </button>

              <button
                id="btn-report-executive-pdf"
                onClick={handleExportExecutive}
                className="p-3 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 text-left rounded-xl transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="p-1 w-7 h-7 rounded-lg bg-blue-50 text-[#2B7FE0] mb-2 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-gray-800 leading-tight">Sumário Geral</span>
                  <span className="text-[9px] text-gray-400 mt-1 block">Gráficos e visão por setor</span>
                </div>
              </button>

              <button
                id="btn-report-export-csv"
                onClick={handleExportCSVData}
                className="p-3 bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 text-left rounded-xl transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="p-1 w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 mb-2 flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-gray-800 leading-tight">Exportar para Excel</span>
                  <span className="text-[9px] text-gray-400 mt-1 block">Planilha CSV formatada</span>
                </div>
              </button>
            </div>
          </div>

          {/* Key Metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Average score Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Média de Conformidade</span>
                <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-black text-gray-900">{Math.round(averageConformity)}%</span>
                <span className="text-xs font-semibold text-emerald-600">de conformidade</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                Baseado em {totalAudits} {totalAudits === 1 ? 'visita' : 'visitas'} consolidadas selecionadas.
              </p>
            </div>

            {/* Total NC card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Não Conformidades</span>
                <span className="p-1 rounded-lg bg-rose-50 text-rose-600">
                  <AlertOctagon className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-black text-rose-600">{globalNC}</span>
                <span className="text-xs font-semibold text-gray-500">ocorrências</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                Total de falhas que requerem implementação urgente de ação corretiva.
              </p>
            </div>

            {/* Ratio pie/ratio text card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amostragem de Itens</span>
                <span className="p-1 rounded-lg bg-blue-50 text-[#2B7FE0]">
                  <HelpCircle className="w-4 h-4" />
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-sm font-bold text-emerald-600">{globalC}</div>
                  <div className="text-[9px] font-medium text-gray-400">Conf.</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-rose-600">{globalNC}</div>
                  <div className="text-[9px] font-medium text-gray-400">N.Conf</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-500">{globalNA}</div>
                  <div className="text-[9px] font-medium text-gray-400">N/A</div>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-3.5 flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${(globalC / (globalC + globalNC + globalNA)) * 100 || 0}%` }}></div>
                <div className="bg-rose-500 h-full" style={{ width: `${(globalNC / (globalC + globalNC + globalNA)) * 100 || 0}%` }}></div>
                <div className="bg-gray-400 h-full" style={{ width: `${(globalNA / (globalC + globalNC + globalNA)) * 100 || 0}%` }}></div>
              </div>
            </div>
          </div>

          {/* Sorted Sectors by NC chart */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Painel Crítico de Riscos</h3>
                <h4 className="text-sm font-bold text-gray-900 mt-0.5">Setores ordenados por volume de "Não Conforme"</h4>
              </div>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center space-x-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Maior Risco Primeiro</span>
              </span>
            </div>

            {/* Visual Bar list */}
            <div className="space-y-4">
              {sortedSectorsByNC.map((sector) => {
                const percentNCScale = (sector.ncCount / maxNC) * 100;
                
                return (
                  <div key={sector.sectorId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-gray-800">
                        {sector.sectorName}
                      </div>
                      <div className="font-mono text-gray-500 flex items-center space-x-2">
                        {sector.auditCount > 0 && (
                          <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-sm">
                            Média: {Math.round(sector.complianceAverage)}% C
                          </span>
                        )}
                        <span className="font-bold text-rose-600">
                          {sector.ncCount} NC
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Bar container */}
                      <div className="flex-1 bg-gray-50 h-3.5 rounded-lg overflow-hidden border border-gray-100 relative">
                        {sector.ncCount > 0 ? (
                          <div
                            className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-lg transition-all duration-500"
                            style={{ width: `${percentNCScale}%` }}
                          ></div>
                        ) : (
                          <div className="absolute inset-0 bg-emerald-50 text-[9px] font-bold text-emerald-700 flex items-center pl-2.5">
                            100% Conforme ou Sem Registros
                          </div>
                        )}
                      </div>
                      
                      {/* Count badge */}
                      <div className="w-10 text-right">
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm ${
                          sector.ncCount > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {sector.ncCount > 0 ? `+${sector.ncCount}` : 'Zerar'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Highlights / Specific non-conformance comments timeline */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Plano de Evidências Recentes (NC)</h3>
            
            {latestNCItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">
                Nenhum indicador de Não Conformidade (NC) registrado nos relatórios recentes com as configurações selecionadas.
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {latestNCItems.map((nc, idx) => (
                  <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-[#2B7FE0] bg-blue-50/70 px-2 py-0.5 rounded-sm">
                        Item {nc.questionId}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        {nc.sectorName} • {nc.date.split('-').reverse().join('/')}
                      </span>
                    </div>
                    <h5 className="text-xs font-semibold text-gray-700 leading-relaxed mb-1.5">
                      {nc.questionText}
                    </h5>
                    <div className="bg-rose-50/50 border border-rose-100/40 rounded-xl p-3 text-xs text-rose-800 font-sans italic relative">
                      <span className="absolute left-2.5 top-2.5 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      <p className="pl-3.5 leading-relaxed">
                        {nc.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
