/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * MODALE D'EXPORT AVANCÉE
 * Description: Options d'export multiples (PDF, Markdown, TXT, Print)
 * Date: 10 octobre 2025
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileDown,
  FileText,
  File,
  Printer,
  Settings,
  Download,
  Check
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';

const ExportModal = ({ isOpen, onClose, searchData }) => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  // Options PDF
  const [pdfOptions, setPdfOptions] = useState({
    quality: 'standard', // standard | high
    orientation: 'portrait', // portrait | landscape
    includeSources: true,
    includeMetadata: true,
    pageSize: 'a4', // a4 | letter
    fontSize: 'normal' // small | normal | large
  });

  // Export PDF avec options
  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF({
        orientation: pdfOptions.orientation,
        unit: 'mm',
        format: pdfOptions.pageSize,
        compress: pdfOptions.quality === 'standard'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Fonction pour ajouter du texte avec retour à la ligne
      const addText = (text, fontSize, isBold = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line) => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += fontSize * 0.5;
        });
        yPosition += 5;
      };

      // Tailles de police selon options
      const fontSizes = {
        small: { title: 16, subtitle: 12, body: 10 },
        normal: { title: 20, subtitle: 14, body: 12 },
        large: { title: 24, subtitle: 16, body: 14 }
      };
      const sizes = fontSizes[pdfOptions.fontSize];

      // En-tête
      doc.setFillColor(139, 92, 246); // Purple
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('E-réussite', margin, 15);
      doc.setFontSize(12);
      doc.text('Recherche intelligente avec Perplexity AI', margin, 25);
      
      yPosition = 50;
      doc.setTextColor(0, 0, 0);

      // Métadonnées
      if (pdfOptions.includeMetadata) {
        doc.setFillColor(240, 240, 240);
        doc.rect(margin - 5, yPosition - 5, maxWidth + 10, 25, 'F');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, margin, yPosition + 5);
        doc.text(`Modèle: ${searchData.model || 'Perplexity Pro'}`, pageWidth / 2, yPosition + 5);
        doc.text(`Sources: ${searchData.citations?.length || 0}`, margin, yPosition + 15);
        yPosition += 35;
        doc.setTextColor(0, 0, 0);
      }

      // Question
      addText('QUESTION', sizes.subtitle, true);
      addText(searchData.query, sizes.body);

      // Réponse
      addText('RÉPONSE', sizes.subtitle, true);
      addText(searchData.answer, sizes.body);

      // Sources
      if (pdfOptions.includeSources && searchData.citations?.length > 0) {
        yPosition += 5;
        addText('SOURCES', sizes.subtitle, true);
        
        searchData.citations.forEach((citation, index) => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.setFontSize(sizes.body);
          doc.setTextColor(139, 92, 246); // Purple pour les liens
          doc.textWithLink(
            `[${index + 1}] ${citation}`,
            margin,
            yPosition,
            { url: citation }
          );
          yPosition += sizes.body * 0.5 + 3;
        });
      }

      // Footer
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} sur ${totalPages} • Généré par E-réussite`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Téléchargement
      const filename = `recherche-${searchData.query.substring(0, 30).replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.pdf`;
      doc.save(filename);

      toast({
        title: '✅ PDF exporté !',
        description: `Le fichier ${filename} a été téléchargé`,
      });
    } catch (error) {
      console.error('Erreur export PDF:', error);
      toast({
        variant: 'destructive',
        title: '❌ Erreur',
        description: 'Impossible d\'exporter le PDF',
      });
    } finally {
      setExporting(false);
    }
  };

  // Export Markdown
  const handleExportMarkdown = () => {
    try {
      let markdown = `# ${searchData.query}\n\n`;
      markdown += `**Date**: ${new Date().toLocaleDateString('fr-FR')}\n`;
      markdown += `**Modèle**: ${searchData.model || 'Perplexity Pro'}\n\n`;
      markdown += `## Réponse\n\n${searchData.answer}\n\n`;
      
      if (searchData.citations?.length > 0) {
        markdown += `## Sources\n\n`;
        searchData.citations.forEach((citation, index) => {
          markdown += `${index + 1}. [${citation}](${citation})\n`;
        });
      }

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recherche-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: '✅ Markdown exporté !',
        description: 'Le fichier Markdown a été téléchargé',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '❌ Erreur',
        description: 'Impossible d\'exporter en Markdown',
      });
    }
  };

  // Export TXT
  const handleExportTXT = () => {
    try {
      let text = `${searchData.query}\n\n`;
      text += `Date: ${new Date().toLocaleDateString('fr-FR')}\n`;
      text += `Modèle: ${searchData.model || 'Perplexity Pro'}\n\n`;
      text += `RÉPONSE\n${'='.repeat(50)}\n\n${searchData.answer}\n\n`;
      
      if (searchData.citations?.length > 0) {
        text += `SOURCES\n${'='.repeat(50)}\n\n`;
        searchData.citations.forEach((citation, index) => {
          text += `[${index + 1}] ${citation}\n`;
        });
      }

      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recherche-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: '✅ TXT exporté !',
        description: 'Le fichier texte a été téléchargé',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '❌ Erreur',
        description: 'Impossible d\'exporter en TXT',
      });
    }
  };

  // Imprimer
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recherche E-réussite</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              line-height: 1.6;
            }
            .header {
              background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
              color: white;
              padding: 30px;
              border-radius: 10px;
              margin-bottom: 30px;
            }
            h1 { margin: 0; font-size: 24px; }
            .meta { font-size: 14px; color: #666; margin: 20px 0; }
            .section { margin: 30px 0; }
            .section-title { 
              font-size: 18px; 
              font-weight: bold; 
              color: #8b5cf6; 
              border-bottom: 2px solid #8b5cf6;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .sources { list-style: none; padding: 0; }
            .sources li { 
              margin: 10px 0; 
              padding-left: 20px;
              position: relative;
            }
            .sources li:before {
              content: "→";
              position: absolute;
              left: 0;
              color: #8b5cf6;
            }
            @media print {
              .header { background: #8b5cf6; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>E-réussite</h1>
            <p>Recherche intelligente avec Perplexity AI</p>
          </div>
          
          <div class="meta">
            <strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')} | 
            <strong>Modèle:</strong> ${searchData.model || 'Perplexity Pro'} |
            <strong>Sources:</strong> ${searchData.citations?.length || 0}
          </div>

          <div class="section">
            <div class="section-title">QUESTION</div>
            <p>${searchData.query}</p>
          </div>

          <div class="section">
            <div class="section-title">RÉPONSE</div>
            <p>${searchData.answer}</p>
          </div>

          ${searchData.citations?.length > 0 ? `
            <div class="section">
              <div class="section-title">SOURCES</div>
              <ul class="sources">
                ${searchData.citations.map((citation, index) => 
                  `<li>[${index + 1}] ${citation}</li>`
                ).join('')}
              </ul>
            </div>
          ` : ''}

          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 100);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();

    toast({
      title: '🖨️ Impression en cours',
      description: 'Fenêtre d\'impression ouverte',
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg flex-shrink-0">
                  <FileDown className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold truncate">Exporter</h2>
                  <p className="text-indigo-100 text-xs sm:text-sm mt-0.5 sm:mt-1 hidden sm:block">Personnalisez votre export</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Options PDF */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                Options PDF
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
                {/* Qualité */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Qualité
                  </label>
                  <select
                    value={pdfOptions.quality}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, quality: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
                  >
                    <option value="standard">Standard (plus rapide)</option>
                    <option value="high">Haute (meilleure qualité)</option>
                  </select>
                </div>

                {/* Orientation */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Orientation
                  </label>
                  <select
                    value={pdfOptions.orientation}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, orientation: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Paysage</option>
                  </select>
                </div>

                {/* Taille de page */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Format de page
                  </label>
                  <select
                    value={pdfOptions.pageSize}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, pageSize: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
                  >
                    <option value="a4">A4</option>
                    <option value="letter">Lettre (US)</option>
                  </select>
                </div>

                {/* Taille de police */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Taille de police
                  </label>
                  <select
                    value={pdfOptions.fontSize}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, fontSize: e.target.value })}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
                  >
                    <option value="small">Petite</option>
                    <option value="normal">Normale</option>
                    <option value="large">Grande</option>
                  </select>
                </div>

                {/* Inclure sources */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="checkbox"
                    id="includeSources"
                    checked={pdfOptions.includeSources}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, includeSources: e.target.checked })}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 rounded"
                  />
                  <label htmlFor="includeSources" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Inclure les sources
                  </label>
                </div>

                {/* Inclure métadonnées */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="checkbox"
                    id="includeMetadata"
                    checked={pdfOptions.includeMetadata}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, includeMetadata: e.target.checked })}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 rounded"
                  />
                  <label htmlFor="includeMetadata" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Inclure les métadonnées
                  </label>
                </div>
              </div>
            </div>

            {/* Formats d'export */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                📦 Formats disponibles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {/* PDF */}
                <button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-sm sm:text-base font-bold">PDF</div>
                      <div className="text-xs opacity-90 hidden sm:block">Format universel</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                </button>

                {/* Markdown */}
                <button
                  onClick={handleExportMarkdown}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all hover:scale-105"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <File className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-sm sm:text-base font-bold">Markdown</div>
                      <div className="text-xs opacity-90 hidden sm:block">Pour édition</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                </button>

                {/* TXT */}
                <button
                  onClick={handleExportTXT}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg transition-all hover:scale-105"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-sm sm:text-base font-bold">Texte brut</div>
                      <div className="text-xs opacity-90 hidden sm:block">Simple et léger</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                </button>

                {/* Imprimer */}
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg transition-all hover:scale-105"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Printer className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-sm sm:text-base font-bold">Imprimer</div>
                      <div className="text-xs opacity-90 hidden sm:block">Version papier</div>
                    </div>
                  </div>
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-b-xl sm:rounded-b-2xl">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
              💡 Astuce : Le format PDF est recommandé pour une meilleure présentation
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExportModal;
