// public/workers/pdfWorker.ts
import { pdf } from "@react-pdf/renderer";
import PDFDocument from "@/components/pdf-document"; // works with react-pdf

self.onmessage = async (e: MessageEvent) => {
  const { data } = e;

  try {
    const { summary, paragraphs, ontology, options, citations } = data;

    const doc = (
      <PDFDocument
        summary={summary}
        paragraphs={paragraphs}
        ontology={ontology}
        options={options}
        citations={citations}
      />
    );

    // Generate Blob (heavy lifting done in worker)
    const blob = await pdf(doc).toBlob();

    // Transfer back (Blob is transferable in most browsers)
    postMessage({ success: true, blob });
  } catch (err: any) {
    postMessage({ success: false, error: err.message });
  }
};
