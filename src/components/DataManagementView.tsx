import React, { useRef, useState } from 'react';
import { Audit } from '../types';
import { exportBackup, exportToCSV, importBackup, saveAudits, getSavedSectors, saveSectors } from '../utils/dataStorage';
import { 
  Download, Upload, FileSpreadsheet, Trash2, ShieldAlert, CheckCircle2, 
  Database, RefreshCw, AlertTriangle, FileUp, Cloud, CloudUpload, CloudDownload,
  LogIn, LogOut, CheckCircle, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  syncAllAuditsToCloud, 
  syncAllSectorsToCloud, 
  fetchAuditsFromCloud, 
  fetchSectorsFromCloud 
} from '../services/firestoreService';

interface DataManagementViewProps {
  audits: Audit[];
  onReloadData: (newAudits: Audit[]) => void;
  onSectorsReload?: () => void;
}


export default function DataManagementView({ audits, onReloadData, onSectorsReload }: DataManagementViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const { user, login, logout } = useAuth();

  // Push local data to Cloud Firestore
  const handlePushToCloud = async () => {
    if (!user) {
      setErrorMsg('Por favor, faça login com sua conta Google antes de sincronizar na nuvem.');
      return;
    }
    try {
      setIsCloudSyncing(true);
      setErrorMsg('');
      const sectors = getSavedSectors();
      await syncAllAuditsToCloud(audits);
      await syncAllSectorsToCloud(sectors);
      showSuccess(`Sincronização concluída! ${audits.length} auditorias e ${sectors.length} setores foram salvos na nuvem do Google AI Studio com segurança.`);
    } catch (err) {
      console.error(err);
      setErrorMsg('Falha ao sincronizar com a nuvem. Verifique a conexão com a internet ou permissões.');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Pull cloud data into device
  const handlePullFromCloud = async () => {
    try {
      setIsCloudSyncing(true);
      setErrorMsg('');
      const cloudAudits = await fetchAuditsFromCloud();
      const cloudSectors = await fetchSectorsFromCloud();

      if (cloudAudits.length > 0) {
        saveAudits(cloudAudits);
        onReloadData(cloudAudits);
      }
      if (cloudSectors.length > 0) {
        saveSectors(cloudSectors);
        if (onSectorsReload) onSectorsReload();
      }

      showSuccess(`Download concluído! Carregadas ${cloudAudits.length} auditorias e ${cloudSectors.length} setores diretamente do Firestore.`);
    } catch (err) {
      console.error(err);
      setErrorMsg('Falha ao buscar dados na nuvem.');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Handle Backup (JSON download)
  const handleExportJSON = () => {

    exportBackup(audits);
    showSuccess('Backup em formato JSON gerado e baixado com sucesso.');
  };

  // Handle Excel/Spreadsheet (CSV download)
  const handleExportCSV = () => {
    exportToCSV(audits);
    showSuccess('Planilha em formato CSV gerada e baixada com sucesso.');
  };

  // Handle JSON File selection and validation
  const handleFileImport = (file: File) => {
    if (!file) return;
    
    setErrorMsg('');
    setSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = importBackup(content);
        
        if (confirm(`Aviso: Foram encontradas ${imported.length} auditorias no arquivo selecionado. Isso irá substituir as auditorias atuais do seu dispositivo. Deseja prosseguir?`)) {
          saveAudits(imported);
          onReloadData(imported);
          showSuccess(`Restauração efetuada com sucesso! ${imported.length} registros foram sincronizados.`);
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Falha ao analisar arquivo.');
      }
    };
    reader.onerror = () => {
      setErrorMsg('Erro de leitura do arquivo.');
    };
    reader.readAsText(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileImport(e.target.files[0]);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileImport(e.dataTransfer.files[0]);
    }
  };

  const handleResetDatabase = () => {
    if (confirm('ATENÇÃO: Esta ação é irreversível e irá deletar permanentemente TODOS os rascunhos e históricos salvos localmente. Deseja mesmo prosseguir?')) {
      if (confirm('DIFÍCIL DE RECUPERAR: Tem certeza absoluta? Todos os relatórios do seu dispositivo serão excluídos agora.')) {
        saveAudits([]);
        onReloadData([]);
        showSuccess('Banco de dados local restaurado para o padrão vazio.');
      }
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold tracking-tight text-gray-900 md:text-2xl">Gestão de Dados</h2>
        <p className="text-xs text-gray-500 mt-1">Ferramentas avançadas para backup local, restauração de segurança e exportação para planilhas.</p>
      </div>

      {/* Message feedback alert */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold mb-6 flex items-center space-x-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-semibold mb-6 flex items-center space-x-2.5">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Firebase Cloud Firestore Synchronization Section */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md mb-8 border border-blue-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-5 border-b border-white/10">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 flex-shrink-0">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold tracking-tight">Banco de Dados em Nuvem (Firebase Firestore)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Online
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-1 leading-relaxed">
                Auditorias e questionários salvos diretamente nos servidores do Google. Acesse de qualquer celular ou computador sem perda de dados.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-3 bg-white/10 px-3 py-2 rounded-xl border border-white/10 text-xs">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-400 text-blue-950 font-bold flex items-center justify-center text-[11px]">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="text-left">
                  <p className="font-semibold text-white leading-tight">{user.displayName || 'Usuário Google'}</p>
                  <p className="text-[10px] text-blue-200 truncate max-w-[140px]">{user.email}</p>
                </div>
                <button
                  onClick={() => logout()}
                  title="Desconectar conta"
                  className="ml-2 text-blue-300 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => login()}
                className="flex items-center space-x-2 bg-white text-gray-900 hover:bg-gray-100 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-blue-600" />
                <span>Conectar com Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Cloud Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handlePushToCloud}
            disabled={isCloudSyncing}
            className="flex items-center justify-center space-x-2 bg-[#2B7FE0] hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            {isCloudSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CloudUpload className="w-4 h-4" />
            )}
            <span>Enviar Todos os Dados para a Nuvem</span>
          </button>

          <button
            onClick={handlePullFromCloud}
            disabled={isCloudSyncing}
            className="flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all border border-white/15 cursor-pointer"
          >
            {isCloudSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CloudDownload className="w-4 h-4" />
            )}
            <span>Baixar Dados da Nuvem para o Dispositivo</span>
          </button>
        </div>

        <p className="text-[11px] text-blue-300/70 mt-3.5 flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>Sincronização bidirecional: salva localmente e na nuvem em tempo real com regras de segurança ativas.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Export Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <Download className="w-5 h-5 text-[#2B7FE0]" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Exportação de Relatórios</h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              Exporte seus dados locais para planilhas ou faça backups preventivos periódicos para armazenar externamente.
            </p>
          </div>

          <div className="space-y-2.5 mt-6">
            <button
              id="btn-export-csv"
              onClick={handleExportCSV}
              className="w-full flex items-center justify-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs py-3 rounded-xl transition-all border border-emerald-100 cursor-pointer"
            >
              <FileSpreadsheet className="w-4.5 h-4.5" />
              <span>Exportar Planilha (CSV)</span>
            </button>

            <button
              id="btn-export-json"
              onClick={handleExportJSON}
              className="w-full flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-[#2B7FE0] font-bold text-xs py-3 rounded-xl transition-all border border-blue-100 cursor-pointer"
            >
              <Database className="w-4.5 h-4.5" />
              <span>Gerar Arquivo de Backup (.json)</span>
            </button>
          </div>
        </div>

        {/* Restore Card with Drag & Drop */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
            <Upload className="w-5 h-5 text-[#2B7FE0]" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1.5">Restaurar de Backup</h3>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Selecione ou arraste um arquivo de backup (.json) para restaurar as auditorias salvas anteriormente.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleInputChange}
            className="hidden"
          />

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-[#2B7FE0] bg-blue-50/20' 
                : 'border-gray-200 hover:border-[#2B7FE0]/40 hover:bg-gray-50/50'
            }`}
          >
            <FileUp className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-[11px] font-bold text-gray-700">Arrastar backup ou clicar para buscar</p>
            <p className="text-[10px] text-gray-400 mt-1">Apenas arquivos .json de backup válidos</p>
          </div>
        </div>
      </div>

      {/* Dangerous/Reset Panel */}
      <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-5">
        <div className="flex items-start space-x-3">
          <div className="p-1 rounded-lg bg-rose-50 text-rose-600 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">Área de Limpeza e Redefinição</h4>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
              Excluir permanentemente todos os registros do seu navegador local. Certifique-se de exportar um backup antes para não perder seu histórico de visitas técnicas.
            </p>
            <button
              id="btn-clear-database"
              onClick={handleResetDatabase}
              className="mt-4 flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpar Todos os Dados</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
