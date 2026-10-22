# AMEPA - Sistema de Gestão de Auditorias de Conformidade

Sistema web responsivo e offline-first desenvolvido para gestão, execução e análise de auditorias internas de conformidade setoriais na **AMEPA**.

![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8.svg)
![Vite](https://img.shields.io/badge/Vite-6-purple.svg)

---

## 📋 Funcionalidades Principais

- **Seleção de Setores Especializados**:
  - Sala Limpa (ISO 14644, fluxo de ar, EPIs estéreis, pressão diferencial)
  - Produção e Manufatura (Procedimentos operacionais, maquinário, calibração)
  - Controle de Qualidade (CQ) (Amostragem, calibração, ensaios)
  - Almoxarifado e Armazenamento (FIFO/FEFO, controle térmico, segregação)
  - Manutenção e Utilidades (Plano preventivo, HVAC, água purificada)
  - Segurança do Trabalho (NRs, brigada, EPCs/EPIs, rotas de fuga)

- **Execução Dinâmica de Auditorias**:
  - Avaliação por item: **Conforme (C)**, **Não Conforme (NC)**, **Não Aplicável (NA)**
  - Níveis de severidade para não-conformidades: **Baixa**, **Média**, **Alta**, **Crítica**
  - Registro de observações, evidências e notas críticas
  - Cálculo automático de conformidade ponderada

- **Gerador de Relatórios em PDF Profissional**:
  - Emissão de relatórios completos em formato PDF com cabeçalho institucional, sumário executivo, pontuação geral, detalhamento de não conformidades e espaço para assinaturas do auditor e responsável.

- **Dashboard e Indicadores (BI)**:
  - Taxa geral de conformidade média
  - Total de auditorias e não-conformidades críticas
  - Distribuição de conformidade por setor
  - Evolução histórica das inspeções

- **Editor e Gerenciador de Formulários**:
  - Adição, edição e exclusão de perguntas e critérios de avaliação por setor
  - Customização das normas e pesos de avaliação

- **Gestão de Dados, Nuvem e Backup**:
  - Armazenamento em nuvem persistente com **Google Cloud Firestore** integrado ao AI Studio
  - Autenticação e sincronização com conta Google
  - Armazenamento local rápido e offline-first (`localStorage`)
  - Exportação e importação completa em formato JSON
  - Geração de relatórios consolidados em CSV / Excel para auditoria

---

## 🚀 Instalação e Execução Local

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior
- Gerenciador de pacotes `npm`

### Passos

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/lfbaeta/amepa-auditoria.git
   cd amepa-auditoria
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador em `http://localhost:3000`.

4. **Gerar versão de produção (Build):**
   ```bash
   npm run build
   ```

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **PDF**: [jsPDF](https://github.com/parallax/jsPDF) e [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Data & Visualização**: [date-fns](https://date-fns.org/)

---

## 📄 Licença

Projeto desenvolvido para gestão interna de qualidade e conformidade - AMEPA.
