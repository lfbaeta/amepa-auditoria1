import React from 'react';
import { ShieldCheck, Plus, History, BarChart3, Database, Settings2, Cloud, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeAuditId: string | null;
  onResumeAudit: () => void;
}

export default function Navbar({ activeTab, setActiveTab, activeAuditId, onResumeAudit }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand/Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2B7FE0] to-[#3C82DC] flex items-center justify-center text-white shadow-md shadow-blue-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight leading-none">Gestor de Auditorias</h1>
            <p className="text-[10px] font-mono text-gray-500 uppercase mt-0.5 tracking-wider">SCIRAS • Segurança do Paciente</p>
          </div>
        </div>

        {/* Desktop Navigation / Buttons */}
        <div className="hidden sm:flex items-center space-x-1 font-sans">
          <button
            id="nav-btn-sectors"
            onClick={() => setActiveTab('sectors')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'sectors'
                ? 'bg-blue-50 text-[#2B7FE0]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Nova Auditoria
          </button>
          <button
            id="nav-btn-history"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'history'
                ? 'bg-blue-50 text-[#2B7FE0]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Histórico
          </button>
          <button
            id="nav-btn-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-50 text-[#2B7FE0]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </button>
          <button
            id="nav-btn-questions"
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'questions'
                ? 'bg-blue-50 text-[#2B7FE0]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Formulários
          </button>
          <button
            id="nav-btn-data"
            onClick={() => setActiveTab('data')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'data'
                ? 'bg-blue-50 text-[#2B7FE0]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Ajustes
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Active Draft Indicator for Quick Resume */}
          {activeAuditId && activeTab !== 'form' && (
            <button
              id="btn-resume-draft-badge"
              onClick={onResumeAudit}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-full hover:bg-amber-100 transition-colors animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="font-semibold">Rascunho Ativo</span>
            </button>
          )}

          {/* Cloud Auth Status */}
          <CloudStatusButton onOpenSettings={() => setActiveTab('data')} />
        </div>
      </div>

      {/* Bottom Navigation for Mobile Devices */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] z-50">
        <div className="grid grid-cols-5 h-16">
          <button
            id="mobile-nav-sectors"
            onClick={() => setActiveTab('sectors')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'sectors' || activeTab === 'form'
                ? 'text-[#2B7FE0]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Plus className="w-5.5 h-5.5" />
            <span className="text-[10px] font-medium font-sans">Nova</span>
          </button>

          <button
            id="mobile-nav-history"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'history' ? 'text-[#2B7FE0]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <History className="w-5.5 h-5.5" />
            <span className="text-[10px] font-medium font-sans">Histórico</span>
          </button>

          <button
            id="mobile-nav-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'dashboard' ? 'text-[#2B7FE0]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <BarChart3 className="w-5.5 h-5.5" />
            <span className="text-[10px] font-medium font-sans">Métricas</span>
          </button>

          <button
            id="mobile-nav-questions"
            onClick={() => setActiveTab('questions')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'questions' ? 'text-[#2B7FE0]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Settings2 className="w-5.5 h-5.5" />
            <span className="text-[10px] font-medium font-sans">Formulários</span>
          </button>

          <button
            id="mobile-nav-data"
            onClick={() => setActiveTab('data')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'data' ? 'text-[#2B7FE0]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Database className="w-5.5 h-5.5" />
            <span className="text-[10px] font-medium font-sans">Ajustes</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function CloudStatusButton({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { user, login } = useAuth();

  if (user) {
    return (
      <button
        onClick={onOpenSettings}
        title={`Conectado: ${user.email} (Sincronização em nuvem ativa)`}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg hover:bg-emerald-100 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <Cloud className="w-3.5 h-3.5 text-emerald-600" />
        <span className="font-semibold hidden md:inline max-w-[120px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => login()}
      title="Conectar com o Google para salvar auditorias em nuvem no AI Studio"
      className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-blue-50 border border-blue-200 text-[#2B7FE0] text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
    >
      <LogIn className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Conectar Nuvem</span>
    </button>
  );
}
