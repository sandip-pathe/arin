// components/pdf-generation-loader.tsx
import React from "react";

interface PDFGenerationLoaderProps {
  isGeneratingPDF: boolean;
}

const PDFGenerationLoader: React.FC<PDFGenerationLoaderProps> = ({
  isGeneratingPDF,
}) => {
  if (!isGeneratingPDF) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
        <span>Generating PDF...</span>
      </div>
    </div>
  );
};

export default PDFGenerationLoader;
