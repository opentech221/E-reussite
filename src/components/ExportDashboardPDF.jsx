import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { trackExportPDF } from '@/lib/analytics';

/**
 * Component pour exporter le dashboard en PDF
 * Capture les KPI cards, charts, et stats en PDF téléchargeable
 */
const ExportDashboardPDF = ({ dashboardRef, userName = 'Utilisateur', userId = null }) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  /**
   * Export le dashboard en PDF
   */
  const exportToPDF = async () => {
    if (!dashboardRef?.current) {
      toast({
        variant: "destructive",
        title: "Erreur d'export",
        description: "Impossible de capturer le dashboard"
      });
      return;
    }

    setIsExporting(true);

    try {
      // 1. Capturer le contenu HTML en canvas
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2, // Haute qualité
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1920,
        windowHeight: dashboardRef.current.scrollHeight
      });

      // 2. Créer le PDF (format A4)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Dimensions A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculer les dimensions de l'image pour fit A4
      const imgWidth = pdfWidth - 20; // Marges de 10mm de chaque côté
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10; // Marge top

      // 3. Ajouter header avec logo et infos
      pdf.setFontSize(20);
      pdf.setTextColor(34, 197, 94); // primary color
      pdf.text('E-Réussite - Dashboard', 10, position);
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 10, position + 6);
      pdf.text(`Utilisateur: ${userName}`, 10, position + 10);

      position += 20; // Espace après header

      // 4. Ajouter l'image du dashboard
      const imgData = canvas.toDataURL('image/png');
      
      if (heightLeft < pdfHeight - 30) {
        // Une seule page suffit
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      } else {
        // Plusieurs pages nécessaires
        while (heightLeft > 0) {
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= (pdfHeight - 30);
          
          if (heightLeft > 0) {
            pdf.addPage();
            position = 10; // Reset position for new page
          }
        }
      }

      // 5. Ajouter footer sur chaque page
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Page ${i} sur ${pageCount} - E-Réussite © ${new Date().getFullYear()}`,
          pdfWidth / 2,
          pdfHeight - 5,
          { align: 'center' }
        );
      }

      // 6. Télécharger le PDF
      const fileName = `dashboard-e-reussite-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      // 📊 Analytics: Track successful export
      trackExportPDF(userId || 'anonymous', true);

      toast({
        title: "✅ Export réussi !",
        description: `Votre dashboard a été exporté en PDF : ${fileName}`,
      });

    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      
      // 📊 Analytics: Track failed export
      trackExportPDF(userId || 'anonymous', false);
      
      toast({
        variant: "destructive",
        title: "❌ Erreur d'export",
        description: "Une erreur s'est produite lors de la génération du PDF"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={exportToPDF}
      disabled={isExporting}
      variant="outline"
      className="gap-2 hover:bg-primary hover:text-white transition-colors"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Génération...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exporter en PDF</span>
          <span className="sm:hidden"><FileText className="w-4 h-4" /></span>
        </>
      )}
    </Button>
  );
};

export default ExportDashboardPDF;
