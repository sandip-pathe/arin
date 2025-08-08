// usePDFGenerator.ts
import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import saveAs from "file-saver";
import { generateIEEECitation } from "@/lib/citation-utils";
import { Paragraph, SummaryItem, Ontology } from "@/types/page";
import PDFGenerator from "@/components/PDFGenerator";

type PDFOptions = {
  summary: boolean;
  keyData: boolean;
  sources: boolean;
};

type PDFData = {
  summaries: SummaryItem[];
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

      // Generate PDF in chunks to prevent blocking
      const pdfBlob = await new Promise<Blob>(async (resolve) => {
        // Use setTimeout to break up work and prevent blocking
        setTimeout(async () => {
          const doc = (
            <PDFGenerator
              summaries={data.summaries}
              paragraphs={data.paragraphs}
              ontology={data.ontology}
              options={data.options}
              citations={citations}
            />
          );

          const blob = await pdf(doc).toBlob();
          resolve(blob);
        }, 0);
      });

      // Save the file
      saveAs(pdfBlob, "document-summary.pdf");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return { generatePDF, isGeneratingPDF };
}
