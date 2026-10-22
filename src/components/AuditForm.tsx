import React, { useState, useEffect } from 'react';
import { Audit, ResponseItem, ComplianceStatus } from '../types';
import { getSavedSectors } from '../utils/dataStorage';
import { ArrowLeft, Save, CheckCircle2, ClipboardCheck, AlertTriangle } from 'lucide-react';

interface AuditFormProps {
  audit: Audit;
  onUpdateResponses: (responses: Record<string, ResponseItem>, criticalNotes?: string) => void;
  onSaveDraft: () => void;
  onFinalize: () => void;
  onCancel: () => void;
}

export default function AuditForm({ audit, onUpdateResponses, onSaveDraft, onFinalize, onCancel }: AuditFormProps) {
  const [responses, setResponses] = useState<Record<string, ResponseItem>>({});
  const [criticalNotes, setCriticalNotes] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'nc'>('all');

  const sector = getSavedSectors().find((s) => s.id === audit.sectorId);
  const questions = sector?.questions || [];

  useEffect(() => {
    setResponses(audit.responses || {});
    setCriticalNotes(audit.criticalNotes || '');
  }, [audit]);

  // Handle setting status for a question
  const handleStatusChange = (questionId: string, status: ComplianceStatus) => {
    const updated = {
      ...responses,
      [questionId]: {
        ...(responses[questionId] || { comment: '' }),
        status,
      },
    };
    setResponses(updated);
    onUpdateResponses(updated, criticalNotes);
  };

  // Handle setting comment for a question
  const handleCommentChange = (questionId: string, comment: string) => {
    const updated = {
      ...responses,
      [questionId]: {
        ...(responses[questionId] || { status: 'NA' }),
        comment,
      },
    };
    setResponses(updated);
    onUpdateResponses(updated, criticalNotes);
  };

  // Handle changing general critical notes
  const handleCriticalNotesChange = (notes: string) => {
    setCriticalNotes(notes);
    onUpdateResponses(responses, notes);
  };

  // Counts and progress calculations
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(responses).length;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Filtered questions to display
  const filteredQuestions = questions.filter((q) => {
    const answer = responses[q.id];
    if (activeFilter === 'pending') {
      return !answer;
    }
    if (activeFilter === 'nc') {
      return answer && answer.status === 'NC';
    }
    return true;
  });

  const handleFinalizeClick = () => {
    const missingCount = totalQuestions - answeredCount;
    if (missingCount > 0) {
      if (!confirm(`Restam ${missingCount} perguntas sem resposta. Tem certeza que deseja finalizar a auditoria mesmo assim? Os itens não respondidos ficarão marcados como "Não se Aplica".`)) {
        return;
      }
    }
    onFinalize();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans pb-24">
      {/* Header and Back Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          id="btn-form-back"
          onClick={onCancel}
          className="flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            id="btn-form-save-draft"
            onClick={onSaveDraft}
            className="flex items-center space-x-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            <Save className="w-4 h-4 text-gray-500" />
            <span>Salvar Rascunho</span>
          </button>
          
          <button
            id="btn-form-finalize"
            onClick={handleFinalizeClick}
            className="flex items-center space-x-1.5 bg-[#2B7FE0] hover:bg-[#3C82DC] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-100"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finalizar Visita</span>
          </button>
        </div>
      </div>

      {/* Audit Meta Summary Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <span className="px-2.5 py-0.5 bg-blue-50 text-[#2B7FE0] text-[10px] font-bold rounded-full uppercase tracking-wider">
              {sector?.name}
            </span>
            <h2 className="text-lg font-extrabold text-gray-900 mt-1">Checklist de Visita Técnica</h2>
          </div>
          <div className="mt-2 sm:mt-0 text-left sm:text-right text-xs font-mono text-gray-500">
            <div><span className="font-semibold text-gray-700">Avaliador:</span> {audit.evaluator}</div>
            <div className="mt-0.5"><span className="font-semibold text-gray-700">Data:</span> {audit.date.split('-').reverse().join('/')}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-gray-600">Progresso do Checklist</span>
            <span className="font-mono font-bold text-gray-800">
              {answeredCount} / {totalQuestions} respondidos ({Math.round(progressPercent)}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2B7FE0] to-[#3C82DC] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Internal Navigation Filter */}
      <div className="flex items-center space-x-1 bg-gray-100/80 p-1 rounded-xl mb-6 max-w-sm">
        <button
          id="btn-filter-all"
          onClick={() => setActiveFilter('all')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeFilter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Todos ({totalQuestions})
        </button>
        <button
          id="btn-filter-pending"
          onClick={() => setActiveFilter('pending')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeFilter === 'pending' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Faltantes ({totalQuestions - answeredCount})
        </button>
        <button
          id="btn-filter-nc"
          onClick={() => setActiveFilter('nc')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeFilter === 'nc' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Não Conf. ({(Object.values(responses) as ResponseItem[]).filter((r) => r.status === 'NC').length})
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-4 mb-8">
        {filteredQuestions.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-500">
            <ClipboardCheck className="w-8 h-8 text-gray-400 mx-auto mb-2.5" />
            <p className="text-sm font-semibold">Nenhum item encontrado para o filtro selecionado.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const response = responses[q.id];
            const isSelected = response?.status;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl p-5 border transition-all ${
                  response?.status === 'NC'
                    ? 'border-red-100 shadow-xs shadow-red-50/20'
                    : 'border-gray-100 shadow-xs'
                }`}
              >
                {/* Question Info Header */}
                <div className="flex items-start space-x-3 mb-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-50 text-[#2B7FE0] font-mono text-xs font-bold flex items-center justify-center mt-0.5">
                    {q.id}
                  </span>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed pt-0.5">
                    {q.text}
                  </p>
                </div>

                {/* Styled Radios Touch Targets */}
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  {/* Conforme Button */}
                  <button
                    id={`btn-question-${q.id}-C`}
                    onClick={() => handleStatusChange(q.id, 'C')}
                    className={`flex items-center justify-center space-x-1.5 h-11 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      response?.status === 'C'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-xs'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Conforme</span>
                  </button>

                  {/* Não Conforme Button */}
                  <button
                    id={`btn-question-${q.id}-NC`}
                    onClick={() => handleStatusChange(q.id, 'NC')}
                    className={`flex items-center justify-center space-x-1.5 h-11 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      response?.status === 'NC'
                        ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-xs'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Não Conf.</span>
                  </button>

                  {/* Não se Aplica Button */}
                  <button
                    id={`btn-question-${q.id}-NA`}
                    onClick={() => handleStatusChange(q.id, 'NA')}
                    className={`flex items-center justify-center space-x-1.5 h-11 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      response?.status === 'NA'
                        ? 'bg-gray-100 border-gray-300 text-gray-700 shadow-xs'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    <span>N/A</span>
                  </button>
                </div>

                {/* Comment area */}
                <div className="relative">
                  {response?.status === 'NC' && !response.comment && (
                    <div className="flex items-center space-x-1 text-[10px] font-semibold text-rose-600 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Insira detalhes ou evidências para guiar o plano de ação</span>
                    </div>
                  )}
                  <input
                    id={`input-question-comment-${q.id}`}
                    type="text"
                    placeholder="Evidências, observações adicionais ou plano de ação..."
                    value={response?.comment || ''}
                    onChange={(e) => handleCommentChange(q.id, e.target.value)}
                    className={`w-full px-3.5 py-2 text-xs bg-gray-50 border rounded-xl placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]/20 focus:border-[#2B7FE0] transition-all ${
                      response?.status === 'NC' && !response.comment
                        ? 'border-rose-200 focus:border-rose-400'
                        : 'border-gray-200'
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Critical Summary on Closing */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Principais Não Conformidades Críticas Identificadas</span>
        </h3>
        <p className="text-xs text-gray-500 mb-3.5 leading-relaxed">
          Registre abaixo uma síntese das observações de alta gravidade identificadas no encerramento da visita para inclusão formal na folha de assinaturas do relatório.
        </p>
        <textarea
          id="textarea-critical-notes"
          rows={3}
          placeholder="Ex: Identificado no expurgo da CME funcionário sem protetor facial e coletores de perfurocortantes sobrecarregados no posto B..."
          value={criticalNotes}
          onChange={(e) => handleCriticalNotesChange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]/20 focus:border-[#2B7FE0] transition-all"
        ></textarea>
      </div>

      {/* Bottom Floating Action Bar for Mobile Devices */}
      <div className="sm:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-3 flex items-center justify-between space-x-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40">
        <button
          id="btn-form-save-draft-mobile"
          onClick={onSaveDraft}
          className="flex-1 flex items-center justify-center space-x-1.5 border border-gray-200 text-gray-700 text-xs font-bold py-2.5 rounded-xl bg-white"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Rascunho</span>
        </button>
        <button
          id="btn-form-finalize-mobile"
          onClick={handleFinalizeClick}
          className="flex-1 flex items-center justify-center space-x-1.5 bg-[#2B7FE0] text-white text-xs font-bold py-2.5 rounded-xl shadow-md"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Finalizar</span>
        </button>
      </div>
    </div>
  );
}
