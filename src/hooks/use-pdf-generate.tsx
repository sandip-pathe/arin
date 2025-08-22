// hooks/use-pdf-generator.ts
import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import saveAs from "file-saver";
import { generateIEEECitation } from "@/lib/citation-utils";
import { Paragraph, SummaryItem, Ontology } from "@/types/page";
import PDFDocument from "@/components/pdf-document";

type PDFOptions = {
  summary: boolean;
  keyData: boolean;
  sources: boolean;
};

type PDFData = {
  summary: SummaryItem | null;
  paragraphs: Paragraph[];
  ontology: Ontology;
  options: PDFOptions;
};

export function usePDFGenerator() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDF = async (data: PDFData) => {
    setIsGeneratingPDF(true);

    try {
      // Generate IEEE citations
      const citations = data.paragraphs.reduce((acc, para, index) => {
        acc[para.id] = generateIEEECitation(para, index + 1);
        return acc;
      }, {} as Record<string, string>);

      // Create PDF document
      const doc = (
        <PDFDocument
          summary={data.summary}
          paragraphs={data.paragraphs}
          ontology={data.ontology}
          options={data.options}
          citations={citations}
        />
      );

      // Generate PDF blob
      const pdfBlob = await pdf(doc).toBlob();

      // Save the file
      saveAs(pdfBlob, "legal-document-summary.pdf");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      throw new Error("PDF generation failed");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return { generatePDF, isGeneratingPDF };
}
