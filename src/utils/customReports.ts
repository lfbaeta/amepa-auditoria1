import { jsPDF } from 'jspdf';
import { Audit, Sector } from '../types';

/**
 * Generates a beautiful action plan containing only Non-Conformities (NC)
 */
export function generateActionPlanPDF(
  audits: Audit[],
  sectors: Sector[],
  institutionName: string = 'HOSPITAL DE CLÍNICAS SCIRAS',
  reportTitle: string = 'PLANO DE AÇÃO - NÃO CONFORMIDADES'
): jsPDF {
  const doc = new jsPDF();
  
  // Design system colors
  const primaryColorRGB = [220, 38, 38]; // Red theme for Action Plan / NCs
  const darkTextColor = '#1F2937';
  const grayTextColor = '#4B5563';

  // 1. Header Banner (Red/Crimson for Critical action items)
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 0, 210, 42, 'F');
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(institutionName.toUpperCase(), 15, 16);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(reportTitle.toUpperCase(), 15, 24);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, 15, 32);
  doc.text(`Total de Auditorias analisadas: ${audits.length}`, 15, 37);

  // Extract all non-conformities
  const ncItems: {
    auditId: string;
    sectorName: string;
    date: string;
    evaluator: string;
    questionId: string;
    questionText: string;
    comment: string;
  }[] = [];

  audits.forEach((audit) => {
    const sector = sectors.find((s) => s.id === audit.sectorId);
    if (!sector) return;

    Object.entries(audit.responses).forEach(([qId, resp]) => {
      if (resp.status === 'NC') {
        const question = sector.questions.find((q) => q.id === qId);
        ncItems.push({
          auditId: audit.id,
          sectorName: audit.sectorName,
          date: audit.date,
          evaluator: audit.evaluator || 'Não informado',
          questionId: qId,
          questionText: question ? question.text : 'Item de auditoria',
          comment: resp.comment || 'Nenhuma justificativa detalhada foi inserida pelo avaliador.'
        });
      }
    });
  });

  let currentY = 54;

  // Header Section text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(220, 38, 38);
  doc.text('MAPEAMENTO DE RISCOS E INFRAÇÕES DETECTADAS', 15, currentY);
  currentY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(31, 41, 55);
  doc.text(`Identificamos um total de ${ncItems.length} não conformidades que requerem plano de ação corretivo imediato.`, 15, currentY);
  currentY += 10;

  if (ncItems.length === 0) {
    doc.setFillColor(240, 253, 250); // light green bg
    doc.setDrawColor(186, 230, 253);
    doc.rect(15, currentY, 180, 24, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(13, 148, 136);
    doc.text('PARABÉNS! NENHUMA NÃO CONFORMIDADE DETECTADA', 20, currentY + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text('Todos os setores auditados atendem 100% aos requisitos de biossegurança analisados.', 20, currentY + 17);
    return doc;
  }

  // Iterate and list NCs as beautiful card rows
  ncItems.forEach((nc, index) => {
    // Check page space
    if (currentY > 240) {
      doc.addPage();
      currentY = 25;
    }

    // Card background
    doc.setFillColor(254, 242, 242); // very light red bg
    doc.setDrawColor(254, 226, 226);
    doc.setLineWidth(0.5);
    doc.rect(15, currentY, 180, 36, 'F');
    doc.rect(15, currentY, 180, 36, 'D');

    // Indicator bar
    doc.setFillColor(220, 38, 38);
    doc.rect(15, currentY, 3, 36, 'F');

    // Title / ID
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(185, 28, 28);
    doc.text(`Ocorrência #${index + 1} - Item ${nc.questionId} [Setor: ${nc.sectorName}]`, 22, currentY + 6);

    // Meta metadata row
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(107, 114, 128);
    doc.text(`Data: ${nc.date.split('-').reverse().join('/')}   |   Avaliador: ${nc.evaluator}`, 22, currentY + 11);

    // Question
    doc.setFont('helvetica', 'semibold');
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    const wrappedQ = doc.splitTextToSize(`Quesito: ${nc.questionText}`, 165);
    doc.text(wrappedQ, 22, currentY + 17);

    // Comments / Action Required
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(153, 27, 27);
    const wrappedComment = doc.splitTextToSize(`Ação Corretiva Solicitada: ${nc.comment}`, 165);
    doc.text(wrappedComment, 22, currentY + 26);

    currentY += 42;
  });

  // Footer/Signatures on new page or at bottom
  if (currentY > 230) {
    doc.addPage();
    currentY = 30;
  } else {
    currentY += 10;
  }

  doc.setDrawColor(156, 163, 175);
  doc.setLineWidth(0.5);
  doc.line(25, currentY + 20, 95, currentY + 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  doc.text('Assinatura do Avaliador SCIRAS', 32, currentY + 25);

  doc.line(115, currentY + 20, 185, currentY + 20);
  doc.text('Diretoria Técnica / Administrativa', 123, currentY + 25);

  return doc;
}

/**
 * Generates a dynamic executive summary dashboard report
 */
export function generateExecutiveReportPDF(
  audits: Audit[],
  sectors: Sector[],
  institutionName: string = 'HOSPITAL DE CLÍNICAS SCIRAS',
  reportTitle: string = 'RELATÓRIO EXECUTIVO DE AUDITORIAS'
): jsPDF {
  const doc = new jsPDF();
  
  // Design system colors (Elegant Dark Blue)
  const primaryColorRGB = [43, 127, 224];
  const darkTextColor = '#1F2937';
  const grayTextColor = '#4B5563';

  // 1. Header Banner
  doc.setFillColor(43, 127, 224);
  doc.rect(0, 0, 210, 42, 'F');
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(institutionName.toUpperCase(), 15, 16);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(reportTitle.toUpperCase(), 15, 24);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, 15, 32);
  doc.text(`Total de Auditorias analisadas: ${audits.length}`, 15, 37);

  let currentY = 54;

  // Executive summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(43, 127, 224);
  doc.text('SUMÁRIO EXECUTIVO DE DESEMPENHO', 15, currentY);
  currentY += 8;

  // Metrics overview box
  doc.setFillColor(243, 244, 246);
  doc.rect(15, currentY, 180, 24, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(15, currentY, 180, 24, 'D');

  // Compute metrics
  const finalized = audits.filter(a => a.status === 'finalizado');
  const avgScore = finalized.length > 0 
    ? finalized.reduce((acc, a) => acc + a.score, 0) / finalized.length 
    : 0;

  let totalC = 0, totalNC = 0, totalNA = 0;
  finalized.forEach(a => {
    Object.values(a.responses).forEach(r => {
      if (r.status === 'C') totalC++;
      if (r.status === 'NC') totalNC++;
      if (r.status === 'NA') totalNA++;
    });
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(31, 41, 55);
  doc.text(`Média de Conformidade: ${Math.round(avgScore)}%`, 20, currentY + 8);
  doc.text(`Conformidades: ${totalC} itens`, 20, currentY + 15);

  doc.text(`Não Conformidades: ${totalNC} itens`, 95, currentY + 8);
  doc.text(`Não Aplicáveis: ${totalNA} itens`, 95, currentY + 15);

  currentY += 34;

  // Performance comparison section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(43, 127, 224);
  doc.text('DESEMPENHO DETALHADO POR SETOR', 15, currentY);
  currentY += 8;

  sectors.forEach((sector) => {
    if (currentY > 250) {
      doc.addPage();
      currentY = 25;
    }

    const sectorAudits = finalized.filter(a => a.sectorId === sector.id);
    const sectorAvg = sectorAudits.length > 0 
      ? sectorAudits.reduce((acc, a) => acc + a.score, 0) / sectorAudits.length 
      : 100;

    let sectorNC = 0;
    sectorAudits.forEach(a => {
      Object.values(a.responses).forEach(r => {
        if (r.status === 'NC') sectorNC++;
      });
    });

    // Sector Card
    doc.setFillColor(249, 250, 251);
    doc.rect(15, currentY, 180, 22, 'F');
    doc.setDrawColor(243, 244, 246);
    doc.rect(15, currentY, 180, 22, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text(sector.name, 20, currentY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Auditorias Realizadas: ${sectorAudits.length}   |   Conformidade Média: ${Math.round(sectorAvg)}%`, 20, currentY + 14);

    // Color code NCs
    if (sectorNC > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text(`Atenção: ${sectorNC} Não Conformidades pendentes de resolução`, 100, currentY + 7);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(13, 148, 136);
      doc.text('Setor 100% Conforme', 100, currentY + 7);
    }

    currentY += 28;
  });

  return doc;
}
