import React, { useState, useEffect } from 'react';
import { Sector } from '../types';
import * as LucideIcons from 'lucide-react';

interface SectorSelectorProps {
  sectors: Sector[];
  onStartAudit: (sectorId: string, evaluator: string, date: string) => void;
}

export default function SectorSelector({ sectors, onStartAudit }: SectorSelectorProps) {
  const [evaluator, setEvaluator] = useState('');
  const [date, setDate] = useState('');

  // Load last used evaluator from localStorage on mount
  useEffect(() => {
    const savedEvaluator = localStorage.getItem('gestor_auditorias_last_evaluator') || '';
    setEvaluator(savedEvaluator);
    
    // Set current date as default
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  const handleStart = (sectorId: string) => {
    if (!evaluator.trim()) {
      alert('Por favor, insira o nome do avaliador antes de iniciar.');
      return;
    }
    // Save evaluator name for next time
    localStorage.setItem('gestor_auditorias_last_evaluator', evaluator);
    onStartAudit(sectorId, evaluator, date);
  };

  // Helper to render dynamic Lucide icon safely
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="w-5 h-5 text-[#2B7FE0]" />;
    }
    return <LucideIcons.ShieldAlert className="w-5 h-5 text-[#2B7FE0]" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans">
      {/* Visual Welcome Banner */}
      <div className="bg-gradient-to-r from-[#2B7FE0] to-[#3C82DC] rounded-2xl p-6 text-white mb-8 shadow-lg shadow-blue-100">
        <h2 className="text-xl font-extrabold tracking-tight md:text-2xl">Nova Visita de Auditoria</h2>
        <p className="text-xs text-blue-100 mt-1 max-w-xl">
          Selecione o setor abaixo para iniciar o checklist oficial da SCIRAS. Certifique-se de preencher o nome do avaliador para assinar o relatório.
        </p>
      </div>

      {/* Setup Form */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Dados Básicos da Visita</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="evaluator-name-input" className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nome do Avaliador (SCIRAS) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <LucideIcons.User className="w-4 h-4" />
              </span>
              <input
                id="evaluator-name-input"
                type="text"
                placeholder="Ex: Dra. Juliana Souza"
                value={evaluator}
                onChange={(e) => setEvaluator(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]/20 focus:border-[#2B7FE0] transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="audit-date-input" className="block text-xs font-semibold text-gray-700 mb-1.5">
              Data da Visita *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <LucideIcons.Calendar className="w-4 h-4" />
              </span>
              <input
                id="audit-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2B7FE0]/20 focus:border-[#2B7FE0] transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sectors Grid */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Selecione o Setor da Auditoria</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sectors.map((sector) => (
            <div
              key={sector.id}
              onClick={() => handleStart(sector.id)}
              className="group bg-white hover:bg-blue-50/10 border border-gray-100 hover:border-[#2B7FE0]/40 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    {renderIcon(sector.icon)}
                  </div>
                  <span className="px-2.5 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {sector.questions.length} itens
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#2B7FE0] transition-colors">
                  {sector.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  {sector.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between text-[#2B7FE0]">
                <span className="text-xs font-semibold">Iniciar checklist</span>
                <LucideIcons.ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
