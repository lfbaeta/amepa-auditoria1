import { jsPDF } from 'jspdf';
import { Audit, Question } from '../types';
import { getSavedSectors } from './dataStorage';

export function generateAuditPDF(audit: Audit): jsPDF {
  const doc = new jsPDF();
  const sectors = getSavedSectors();
  
  // Font styles and configurations
  const primaryColor = '#2B7FE0';
  const secondaryColor = '#3C82DC';
  const darkTextColor = '#1F2937';
  const grayTextColor = '#4B5563';
  const lightGrayBg = '#F3F4F6';
  const successColor = '#10B981';
  const dangerColor = '#EF4444';
  const warningColor = '#F59E0B';

  // Find questions map
  const sector = sectors.find(s => s.id === audit.sectorId);
  const questionsMap = new Map<string, string>();
  sector?.questions.forEach(q => {
    questionsMap.set(q.id, q.text);
  });

  // Header Banner
  doc.setFillColor(43, 127, 224); // #2B7FE0
  doc.rect(0, 0, 210, 40, 'F');
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('GESTÃO DE AUDITORIAS – SCIRAS', 15, 17);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Relatório Técnico de Visita de Conformidade', 15, 24);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`, 15, 30);

  // Meta info Box
  doc.setFillColor(243, 244, 246);
  doc.rect(15, 48, 180, 42, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(15, 48, 180, 42, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(43, 127, 224);
  doc.text('INFORMAÇÕES GERAIS', 20, 55);

  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  
  doc.setFont('helvetica', 'bold'); doc.text('Setor Avaliado:', 20, 64);
  doc.setFont('helvetica', 'normal'); doc.text(audit.sectorName || '', 55, 64);

  doc.setFont('helvetica', 'bold'); doc.text('Avaliador (SCIRAS):', 20, 71);
  doc.setFont('helvetica', 'normal'); doc.text(audit.evaluator || 'Não informado', 60, 71);

  doc.setFont('helvetica', 'bold'); doc.text('Data da Auditoria:', 20, 78);
  doc.setFont('helvetica', 'normal'); doc.text(audit.date.split('-').reverse().join('/'), 57, 78);

  doc.setFont('helvetica', 'bold'); doc.text('Status:', 20, 85);
  const statusStr = audit.status === 'finalizado' ? 'FINALIZADO' : 'EM ANDAMENTO';
  doc.setFont('helvetica', 'bold');
  if (audit.status === 'finalizado') {
    doc.setTextColor(16, 185, 129); // green
  } else {
    doc.setTextColor(245, 158, 11); // orange
  }
  doc.text(statusStr, 35, 85);

  // Score badge
  doc.setFillColor(255, 255, 255);
  doc.rect(145, 53, 45, 32, 'F');
  doc.setDrawColor(43, 127, 224);
  doc.setLineWidth(0.5);
  doc.rect(145, 53, 45, 32, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.text('CONFORMIDADE', 151, 61);
  
  doc.setFontSize(22);
  doc.setTextColor(43, 127, 224);
  doc.text(`${Math.round(audit.score)}%`, 151, 74);
  doc.setLineWidth(0.2); // reset

  // Critical Notes if any
  let currentY = 98;
  if (audit.criticalNotes) {
    doc.setFillColor(254, 242, 242); // very light red
    doc.setDrawColor(252, 165, 165);
    doc.rect(15, currentY, 180, 20, 'F');
    doc.rect(15, currentY, 180, 20, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(239, 68, 68);
    doc.text('AÇÕES CRÍTICAS / OBSERVAÇÕES:', 20, currentY + 6);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    const wrappedNotes = doc.splitTextToSize(audit.criticalNotes, 170);
    doc.text(wrappedNotes, 20, currentY + 12);
    
    currentY += 28;
  }

  // Items List title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(43, 127, 224);
  doc.text('DETALHAMENTO DOS ITENS AVALIADOS', 15, currentY);
  currentY += 6;

  // Let's print each question
  const questionsList = sector?.questions || [];
  
  questionsList.forEach((q, index) => {
    // Page break handling
    if (currentY > 265) {
      doc.addPage();
      currentY = 20;
    }

    const response = audit.responses[q.id] || { status: 'NA', comment: '' };
    
    // Background for alternate lines
    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(15, currentY, 180, 15, 'F');
    }

    // Border line under item
    doc.setDrawColor(243, 244, 246);
    doc.line(15, currentY + 15, 195, currentY + 15);

    // ID & Question Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    doc.text(`${q.id}`, 18, currentY + 6);

    doc.setFont('helvetica', 'normal');
    const wrappedText = doc.splitTextToSize(q.text, 125);
    doc.text(wrappedText, 28, currentY + 6);

    // Status Label
    let statusText = 'N/A';
    let statusColorRGB = [107, 114, 128]; // gray
    if (response.status === 'C') {
      statusText = 'CONFORME';
      statusColorRGB = [16, 185, 129]; // green
    } else if (response.status === 'NC') {
      statusText = 'NÃO CONFORME';
      statusColorRGB = [239, 68, 68]; // red
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(statusColorRGB[0], statusColorRGB[1], statusColorRGB[2]);
    doc.text(statusText, 160, currentY + 6);

    // Comments if any
    if (response.comment) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(107, 114, 128);
      const wrappedComment = doc.splitTextToSize(`Obs: ${response.comment}`, 155);
      doc.text(wrappedComment, 28, currentY + 12);
    }

    currentY += 16;
  });

  // Page break for Signatures if close to bottom
  if (currentY > 240) {
    doc.addPage();
    currentY = 30;
  } else {
    currentY += 15;
  }

  // Signatures Area
  doc.setDrawColor(156, 163, 175);
  doc.setLineWidth(0.5);
  
  // Line 1
  doc.line(25, currentY + 20, 95, currentY + 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  doc.text('Avaliador (SCIRAS)', 42, currentY + 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(audit.evaluator || 'Assinatura Digital', 45, currentY + 29);

  // Line 2
  doc.line(115, currentY + 20, 185, currentY + 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Responsável pelo Setor', 130, currentY + 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Assinatura / Carimbo', 142, currentY + 29);

  return doc;
}
