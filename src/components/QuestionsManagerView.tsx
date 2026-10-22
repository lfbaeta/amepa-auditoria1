import React, { useState, useEffect } from 'react';
import { Sector, Question } from '../types';
import { getSavedSectors, saveSectors } from '../utils/dataStorage';
import { 
  Plus, Trash2, Edit3, Save, Check, X, ClipboardList, 
  Settings2, PlusCircle, Layout, ChevronRight, HelpCircle, AlertCircle
} from 'lucide-react';

interface QuestionsManagerViewProps {
  onSectorsUpdated: () => void;
}

export default function QuestionsManagerView({ onSectorsUpdated }: QuestionsManagerViewProps) {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<string>('');
  
  // Sector Editing / Creating States
  const [isCreatingSector, setIsCreatingSector] = useState(false);
  const [isEditingSector, setIsEditingSector] = useState(false);
  const [sectorName, setSectorName] = useState('');
  const [sectorDesc, setSectorDesc] = useState('');
  const [sectorIcon, setSectorIcon] = useState('ShieldAlert');

  // Question State
  const [newQuestionText, setNewQuestionText] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState('');

  // Notification feedback
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loaded = getSavedSectors();
    setSectors(loaded);
    if (loaded.length > 0) {
      setSelectedSectorId(loaded[0].id);
    }
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 4000);
  };

  const selectedSector = sectors.find(s => s.id === selectedSectorId);

  // Add a new question to the selected sector
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSectorId) return;
    if (!newQuestionText.trim()) {
      showError('O texto da pergunta não pode estar vazio.');
      return;
    }

    const updatedSectors = sectors.map(sec => {
      if (sec.id === selectedSectorId) {
        // Generate a new sequential/unique ID based on existing ones or a timestamp
        const questions = sec.questions || [];
        const nextNum = questions.length > 0 
          ? Math.max(...questions.map(q => {
              const num = parseFloat(q.id);
              return isNaN(num) ? 0 : num;
            })) + 1
          : 1;
        
        // E.g. "1.13" or "8.1"
        const prefix = sec.id === 'gerais' ? '1' : String(Math.floor(nextNum));
        const newId = `${prefix}.${questions.length + 1}`;

        const newQuestion: Question = {
          id: newId,
          sectorId: sec.id,
          text: newQuestionText.trim()
        };

        return {
          ...sec,
          questions: [...questions, newQuestion]
        };
      }
      return sec;
    });

    setSectors(updatedSectors);
    saveSectors(updatedSectors);
    setNewQuestionText('');
    showSuccess('Nova pergunta adicionada com sucesso!');
    onSectorsUpdated();
  };

  // Remove a question
  const handleDeleteQuestion = (qId: string) => {
    if (!selectedSector) return;
    if (selectedSector.questions.length <= 1) {
      if (!confirm('Este setor ficará sem nenhuma pergunta. Deseja mesmo continuar?')) {
        return;
      }
    } else {
      if (!confirm(`Tem certeza que deseja excluir a pergunta "${qId}"? Isso não afetará auditorias já salvas.`)) {
        return;
      }
    }

    const updatedSectors = sectors.map(sec => {
      if (sec.id === selectedSectorId) {
        return {
          ...sec,
          questions: sec.questions.filter(q => q.id !== qId)
        };
      }
      return sec;
    });

    setSectors(updatedSectors);
    saveSectors(updatedSectors);
    showSuccess('Pergunta excluída com sucesso.');
    onSectorsUpdated();
  };

  // Start editing a question text
  const startEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id);
    setEditingQuestionText(q.text);
  };

  // Save the edited question text
  const handleSaveQuestionEdit = (qId: string) => {
    if (!editingQuestionText.trim()) {
      showError('O texto da pergunta não pode ser vazio.');
      return;
    }

    const updatedSectors = sectors.map(sec => {
      if (sec.id === selectedSectorId) {
        return {
          ...sec,
          questions: sec.questions.map(q => {
            if (q.id === qId) {
              return { ...q, text: editingQuestionText.trim() };
            }
            return q;
          })
        };
      }
      return sec;
    });

    setSectors(updatedSectors);
    saveSectors(updatedSectors);
    setEditingQuestionId(null);
    showSuccess('Pergunta atualizada com sucesso.');
    onSectorsUpdated();
  };

  // Create a new custom sector
  const handleCreateSector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectorName.trim()) {
      showError('Nome do setor é obrigatório.');
      return;
    }

    const newId = 'sector_' + Date.now();
    const newSector: Sector = {
      id: newId,
      name: sectorName.trim(),
      description: sectorDesc.trim() || 'Sem descrição cadastrada.',
      icon: sectorIcon,
      questions: [
        { id: `${sectors.length + 1}.1`, sectorId: newId, text: 'O ambiente apresenta-se em conformidade geral?' }
      ]
    };

    const updatedSectors = [...sectors, newSector];
    setSectors(updatedSectors);
    saveSectors(updatedSectors);
    setSelectedSectorId(newId);
    
    // Reset form
    setSectorName('');
    setSectorDesc('');
    setSectorIcon('ClipboardList');
    setIsCreatingSector(false);

    showSuccess(`Setor "${newSector.name}" criado com sucesso com 1 pergunta padrão.`);
    onSectorsUpdated();
  };

  // Edit existing sector metadata (name/description)
  const handleUpdateSectorMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectorName.trim()) {
      showError('Nome do setor é obrigatório.');
      return;
    }

    const updatedSectors = sectors.map(sec => {
      if (sec.id === selectedSectorId) {
        return {
          ...sec,
          name: sectorName.trim(),
          description: sectorDesc.trim()
        };
      }
      return sec;
    });

    setSectors(updatedSectors);
    saveSectors(updatedSectors);
    setIsEditingSector(false);
    showSuccess('Dados do setor atualizados com sucesso.');
    onSectorsUpdated();
  };

  const handleStartEditSector = () => {
    if (!selectedSector) return;
    setSectorName(selectedSector.name);
    setSectorDesc(selectedSector.description);
    setIsEditingSector(true);
  };

  const handleDeleteSector = () => {
    if (!selectedSector) return;
    if (confirm(`ATENÇÃO CRÍTICA: Deseja realmente excluir permanentemente o setor "${selectedSector.name}" e todas as suas ${selectedSector.questions.length} perguntas? Esta ação não pode ser desfeita.`)) {
      const updated = sectors.filter(s => s.id !== selectedSectorId);
      setSectors(updated);
      saveSectors(updated);
      if (updated.length > 0) {
        setSelectedSectorId(updated[0].id);
      } else {
        setSelectedSectorId('');
      }
      showSuccess('Setor excluído com sucesso.');
      onSectorsUpdated();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900 md:text-2xl">Gerenciador de Formulários</h2>
        <p className="text-xs text-gray-500 mt-1">Crie novos setores ou inclua, altere e remova perguntas dos checklists institucionais da SCIRAS.</p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold mb-6 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold mb-6 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Sector Selector List & Actions */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Setores Cadastrados</h3>
              <button
                id="btn-add-new-sector-trigger"
                onClick={() => {
                  setIsCreatingSector(true);
                  setIsEditingSector(false);
                  setSectorName('');
                  setSectorDesc('');
                }}
                className="p-1.5 bg-blue-50 text-[#2B7FE0] hover:bg-blue-100 rounded-lg transition-colors flex items-center space-x-1 text-[10px] font-bold"
                title="Novo Setor"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Setor</span>
              </button>
            </div>

            {/* List of Sectors */}
            <div className="space-y-1.5">
              {sectors.map((sec) => (
                <button
                  key={sec.id}
                  id={`btn-select-sector-mgr-${sec.id}`}
                  onClick={() => {
                    setSelectedSectorId(sec.id);
                    setIsCreatingSector(false);
                    setIsEditingSector(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    selectedSectorId === sec.id && !isCreatingSector
                      ? 'bg-blue-50 text-[#2B7FE0] border-l-4 border-[#2B7FE0] pl-2'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate pr-2">{sec.name}</span>
                  <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">
                    {sec.questions?.length || 0} Q
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Help Information Box */}
          <div className="bg-blue-50/30 border border-blue-50/60 rounded-2xl p-4 text-xs text-blue-800 leading-relaxed space-y-2">
            <h4 className="font-bold flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-[#2B7FE0]" />
              <span>Biossegurança e NR-32</span>
            </h4>
            <p>
              Qualquer nova pergunta incluída estará disponível imediatamente para novas visitas técnicas de auditoria.
            </p>
            <p className="text-[10px] text-blue-600 font-medium">
              Nota: Alterações não alteram o histórico de auditorias já finalizadas para preservar a integridade dos dados históricos.
            </p>
          </div>
        </div>

        {/* Right Side: Editor form area */}
        <div className="md:col-span-2">
          {/* 1. Creating Sector view */}
          {isCreatingSector ? (
            <form onSubmit={handleCreateSector} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                  <Layout className="w-4.5 h-4.5 text-[#2B7FE0]" />
                  <span>Cadastrar Novo Setor SCIRAS</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreatingSector(false)}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600"
                >
                  Cancelar
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nome do Setor *</label>
                <input
                  type="text"
                  placeholder="Ex: UTI Adulto, Hemodiálise, etc."
                  value={sectorName}
                  onChange={(e) => setSectorName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]/20 focus:border-[#2B7FE0] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição / Foco da Avaliação</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Protocolo de acessos vasculares, lavagem cirúrgica das mãos..."
                  value={sectorDesc}
                  onChange={(e) => setSectorDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]/20 focus:border-[#2B7FE0] transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingSector(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold bg-white"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2B7FE0] hover:bg-[#3C82DC] text-white rounded-xl text-xs font-bold"
                >
                  Salvar Setor
                </button>
              </div>
            </form>
          ) : isEditingSector ? (
            /* 2. Editing Sector view */
            <form onSubmit={handleUpdateSectorMeta} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900">Editar Dados do Setor</h3>
                <button
                  type="button"
                  onClick={() => setIsEditingSector(false)}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600"
                >
                  Cancelar
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nome do Setor *</label>
                <input
                  type="text"
                  value={sectorName}
                  onChange={(e) => setSectorName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={sectorDesc}
                  onChange={(e) => setSectorDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]/20"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSector(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold bg-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2B7FE0] hover:bg-[#3C82DC] text-white rounded-xl text-xs font-bold"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          ) : selectedSector ? (
            /* 3. Main Sector Questions List Editor */
            <div className="space-y-4">
              {/* Sector Title Summary */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">{selectedSector.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{selectedSector.description}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    id="btn-edit-sector-meta"
                    onClick={handleStartEditSector}
                    className="p-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-xs font-semibold flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    id="btn-delete-sector"
                    onClick={handleDeleteSector}
                    className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors text-xs font-semibold flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>

              {/* Add Question Input Form */}
              <form onSubmit={handleAddQuestion} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Adicionar Pergunta</h4>
                <div className="flex gap-2">
                  <input
                    id="input-new-question-mgr-text"
                    type="text"
                    placeholder="Escreva o texto do novo quesito de auditoria..."
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="flex-grow px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]/20 focus:border-[#2B7FE0] transition-all"
                  />
                  <button
                    id="btn-submit-new-question"
                    type="submit"
                    className="px-4 py-2.5 bg-[#2B7FE0] hover:bg-[#3C82DC] text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Adicionar</span>
                  </button>
                </div>
              </form>

              {/* Questions List with inline edit capabilities */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
                <div className="px-5 py-3.5 bg-gray-50/50 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Perguntas Ativas ({selectedSector.questions.length})</h4>
                  <span className="text-[10px] text-gray-400">Clique em editar para reescrever o texto</span>
                </div>

                {selectedSector.questions.map((q) => {
                  const isEditing = editingQuestionId === q.id;

                  return (
                    <div key={q.id} className="p-4 flex items-start justify-between gap-4">
                      {isEditing ? (
                        /* Editing input row */
                        <div className="flex-grow flex gap-2">
                          <input
                            type="text"
                            value={editingQuestionText}
                            onChange={(e) => setEditingQuestionText(e.target.value)}
                            className="flex-grow px-3 py-1.5 bg-white border border-blue-400 rounded-lg text-xs text-gray-800 focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveQuestionEdit(q.id)}
                            className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all"
                            title="Salvar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingQuestionId(null)}
                            className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-all"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        /* Static question representation */
                        <>
                          <div className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded bg-blue-50 text-[#2B7FE0] font-mono text-[10px] font-bold flex items-center justify-center mt-0.5">
                              {q.id}
                            </span>
                            <span className="text-xs font-medium text-gray-800 leading-relaxed pt-0.5">
                              {q.text}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => startEditQuestion(q)}
                              className="p-1.5 hover:bg-gray-50 text-gray-500 hover:text-gray-800 rounded-lg transition-colors"
                              title="Editar Pergunta"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="Remover Pergunta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-400 shadow-sm">
              Selecione ou crie um setor para visualizar as perguntas correspondentes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
