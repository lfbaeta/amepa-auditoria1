import React, { useState, useEffect } from 'react';
import { Audit, ResponseItem, Sector } from './types';
import { getSavedAudits, saveAudits, getSavedSectors, saveSectors } from './utils/dataStorage';
import { generateAuditPDF } from './utils/pdfGenerator';
import { useAuth } from './context/AuthContext';
import { 
  saveAuditToCloud, 
  deleteAuditFromCloud, 
  fetchAuditsFromCloud, 
  fetchSectorsFromCloud,
  syncAllAuditsToCloud,
  syncAllSectorsToCloud
} from './services/firestoreService';

// Components
import Navbar from './components/Navbar';
import SectorSelector from './components/SectorSelector';
import AuditForm from './components/AuditForm';
import DashboardView from './components/DashboardView';
import HistoryView from './components/HistoryView';
import DataManagementView from './components/DataManagementView';
import QuestionsManagerView from './components/QuestionsManagerView';

import { ShieldCheck, Plus, CheckCircle2, History, AlertTriangle } from 'lucide-react';


export default function App() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [activeTab, setActiveTab] = useState<string>('sectors');
  const [activeAudit, setActiveAudit] = useState<Audit | null>(null);
  const [completionSuccess, setCompletionSuccess] = useState<boolean>(false);
  const [lastFinishedAudit, setLastFinishedAudit] = useState<Audit | null>(null);
  const { user } = useAuth();

  // Initialize and load saved audits & sectors
  useEffect(() => {
    const data = getSavedAudits();
    const sec = getSavedSectors();
    setAudits(data);
    setSectors(sec);
  }, []);

  // Sync with cloud whenever user logs in
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    async function syncWithCloud() {
      try {
        const cloudAudits = await fetchAuditsFromCloud();
        const cloudSectors = await fetchSectorsFromCloud();

        if (!isMounted) return;

        if (cloudAudits && cloudAudits.length > 0) {
          setAudits(cloudAudits);
          saveAudits(cloudAudits);
        } else {
          // Cloud empty: push current local audits to cloud
          const localAudits = getSavedAudits();
          if (localAudits.length > 0) {
            await syncAllAuditsToCloud(localAudits);
          }
        }

        if (cloudSectors && cloudSectors.length > 0) {
          setSectors(cloudSectors);
          saveSectors(cloudSectors);
        } else {
          // Cloud empty: push current local sectors to cloud
          const localSectors = getSavedSectors();
          if (localSectors.length > 0) {
            await syncAllSectorsToCloud(localSectors);
          }
        }
      } catch (err) {
        console.warn('Background cloud sync notice:', err);
      }
    }

    syncWithCloud();
    return () => { isMounted = false; };
  }, [user]);

  const handleSectorsUpdated = () => {
    const sec = getSavedSectors();
    setSectors(sec);
    if (user) {
      syncAllSectorsToCloud(sec).catch(console.error);
    }
  };


  // Compute overall compliance score helper
  const computeComplianceScore = (responses: Record<string, ResponseItem>): number => {
    let conforme = 0;
    let naoConforme = 0;
    Object.values(responses).forEach((item) => {
      if (item.status === 'C') conforme++;
      if (item.status === 'NC') naoConforme++;
    });
    const total = conforme + naoConforme;
    if (total === 0) return 100;
    return (conforme / total) * 100;
  };

  // Launch a new audit
  const handleStartAudit = (sectorId: string, evaluator: string, date: string) => {
    const sector = sectors.find((s) => s.id === sectorId);
    if (!sector) return;

    const newAudit: Audit = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sectorId,
      sectorName: sector.name,
      evaluator,
      date,
      status: 'em_andamento',
      score: 100, // starts fully compliant
      responses: {},
      criticalNotes: '',
    };

    const updatedAudits = [newAudit, ...audits];
    setAudits(updatedAudits);
    saveAudits(updatedAudits);
    if (user) {
      saveAuditToCloud(newAudit).catch(console.error);
    }
    
    setActiveAudit(newAudit);
    setActiveTab('form');
    setCompletionSuccess(false);
  };

  // Update answers during edit
  const handleUpdateResponses = (responses: Record<string, ResponseItem>, criticalNotes?: string) => {
    if (!activeAudit) return;

    const calculatedScore = computeComplianceScore(responses);
    const updatedAudit: Audit = {
      ...activeAudit,
      responses,
      score: calculatedScore,
      criticalNotes: criticalNotes !== undefined ? criticalNotes : activeAudit.criticalNotes,
    };

    setActiveAudit(updatedAudit);

    const updatedList = audits.map((a) => (a.id === activeAudit.id ? updatedAudit : a));
    setAudits(updatedList);
    saveAudits(updatedList);
    if (user) {
      saveAuditToCloud(updatedAudit).catch(console.error);
    }
  };

  // Save current progress as a draft and leave form
  const handleSaveDraft = () => {
    if (!activeAudit) return;
    
    alert('Rascunho salvo com sucesso! Você pode continuar o preenchimento a qualquer momento no Histórico.');
    setActiveAudit(null);
    setActiveTab('history');
  };

  // Complete and finalize the audit
  const handleFinalize = () => {
    if (!activeAudit) return;

    // Set missing questions to N/A automatically if not responded
    const sector = sectors.find((s) => s.id === activeAudit.sectorId);
    const updatedResponses = { ...activeAudit.responses };

    sector?.questions.forEach((q) => {
      if (!updatedResponses[q.id]) {
        updatedResponses[q.id] = { status: 'NA', comment: '' };
      }
    });

    const calculatedScore = computeComplianceScore(updatedResponses);
    const finalizedAudit: Audit = {
      ...activeAudit,
      responses: updatedResponses,
      status: 'finalizado',
      score: calculatedScore,
    };

    const updatedList = audits.map((a) => (a.id === activeAudit.id ? finalizedAudit : a));
    setAudits(updatedList);
    saveAudits(updatedList);
    if (user) {
      saveAuditToCloud(finalizedAudit).catch(console.error);
    }

    // Auto trigger PDF Download
    try {
      const doc = generateAuditPDF(finalizedAudit);
      const formattedDate = finalizedAudit.date.split('-').reverse().join('_');
      doc.save(`relatorio_SCIRAS_${finalizedAudit.sectorId}_${formattedDate}.pdf`);
    } catch (error) {
      console.error('Failed to trigger automatic PDF', error);
    }

    setLastFinishedAudit(finalizedAudit);
    setCompletionSuccess(true);
    setActiveAudit(null);
    setActiveTab('history');
  };

  // Discard draft or exit without saving additional
  const handleCancelForm = () => {
    if (confirm('Deseja fechar o formulário? Todas as alterações preenchidas nesta sessão já estão salvas como rascunho.')) {
      setActiveAudit(null);
      setActiveTab('sectors');
    }
  };

  // Resume a draft from the history page
  const handleResumeAudit = (auditId: string) => {
    const found = audits.find((a) => a.id === auditId);
    if (found) {
      setActiveAudit(found);
      setActiveTab('form');
      setCompletionSuccess(false);
    }
  };

  // Delete an audit
  const handleDeleteAudit = (auditId: string) => {
    const updated = audits.filter((a) => a.id !== auditId);
    setAudits(updated);
    saveAudits(updated);
    if (user) {
      deleteAuditFromCloud(auditId).catch(console.error);
    }
    
    if (activeAudit?.id === auditId) {
      setActiveAudit(null);
      setActiveTab('sectors');
    }
  };

  // Reload list when backup is restored or reset
  const handleReloadData = (newAudits: Audit[]) => {
    setAudits(newAudits);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 sm:pb-6 flex flex-col font-sans antialiased text-gray-800">
      {/* Navbar orchestration */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setCompletionSuccess(false);
        }}
        activeAuditId={activeAudit ? activeAudit.id : null}
        onResumeAudit={() => {
          if (activeAudit) {
            setActiveTab('form');
          }
        }}
      />

      <main className="flex-grow">
        {/* Success complete toast/modal */}
        {completionSuccess && lastFinishedAudit && (
          <div className="max-w-4xl mx-auto px-4 mt-6">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">Auditoria Finalizada com Sucesso!</h3>
                  <p className="text-xs text-emerald-50 mt-1 max-w-md">
                    O relatório do setor <span className="font-bold">{lastFinishedAudit.sectorName}</span> foi compilado com pontuação de <span className="font-bold">{Math.round(lastFinishedAudit.score)}% de conformidade</span>. O PDF do parecer técnico foi baixado automaticamente.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  id="btn-success-close"
                  onClick={() => setCompletionSuccess(false)}
                  className="px-4 py-2 bg-white text-emerald-800 text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-50 transition-colors"
                >
                  OK, entendi
                </button>
                <button
                  id="btn-success-download"
                  onClick={() => {
                    if (lastFinishedAudit) {
                      const doc = generateAuditPDF(lastFinishedAudit);
                      doc.save(`relatorio_SCIRAS_${lastFinishedAudit.sectorId}.pdf`);
                    }
                  }}
                  className="px-4 py-2 bg-emerald-700/45 text-white text-xs font-bold rounded-xl border border-white/20 hover:bg-emerald-700/60 transition-colors"
                >
                  Baixar Novamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Screen/View Router */}
        {activeTab === 'form' && activeAudit ? (
          <AuditForm
            audit={activeAudit}
            onUpdateResponses={handleUpdateResponses}
            onSaveDraft={handleSaveDraft}
            onFinalize={handleFinalize}
            onCancel={handleCancelForm}
          />
        ) : activeTab === 'history' ? (
          <HistoryView
            audits={audits}
            onResumeAudit={handleResumeAudit}
            onDeleteAudit={handleDeleteAudit}
          />
        ) : activeTab === 'dashboard' ? (
          <DashboardView audits={audits} />
        ) : activeTab === 'questions' ? (
          <QuestionsManagerView onSectorsUpdated={handleSectorsUpdated} />
        ) : activeTab === 'data' ? (
          <DataManagementView 
            audits={audits} 
            onReloadData={handleReloadData} 
            onSectorsReload={handleSectorsUpdated}
          />
        ) : (
          <SectorSelector sectors={sectors} onStartAudit={handleStartAudit} />
        )}
      </main>

      {/* Aesthetic credit banner */}
      <footer className="mt-auto py-6 text-center text-gray-400 text-[10px] uppercase font-mono tracking-wider border-t border-gray-100 bg-white">
        <div>Gestor de Auditorias • SCIRAS v1.1.0</div>
        <div className="text-gray-400 mt-1">Firebase Cloud Firestore & Offline-First • Armazenamento Permanente sem Bloqueios</div>
      </footer>
    </div>
  );
}
