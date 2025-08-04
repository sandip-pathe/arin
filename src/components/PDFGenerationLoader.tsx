import React from "react";

type PDFGenerationLoaderProps = {
  isGeneratingPDF: boolean;
};

export default function PDFGenerationLoader({
  isGeneratingPDF,
}: PDFGenerationLoaderProps) {
  if (!isGeneratingPDF) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <p className="text-lg font-semibold mb-4">Generating PDF...</p>
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse w-3/4"></div>
        </div>
      </div>
    </div>
  );
}
