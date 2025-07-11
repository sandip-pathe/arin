import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { createWorker } from 'tesseract.js';

/**
 * Extracts text from various file types including PDF, DOCX, XLSX, images, and text files.
 * 
 * @param {File} file - The file to extract text from.
 * @returns {Promise<string>} - A promise that resolves to the extracted text.
 * @throws {Error} - If the file type is unsupported or if extraction fails.
 */

export async function extractText(file: File): Promise<string> {
  try {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const mimeType = file.type;

    // Handle PDF files
    if (extension === 'pdf' || mimeType === 'application/pdf') {
      return await extractFromPDF(file);
    }

    // Handle DOCX files
    if (extension === 'docx' || 
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await extractFromDocx(file);
    }

    // Handle XLSX files
    if (extension === 'xlsx' || 
        mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return await extractFromXlsx(file);
    }

    // Handle image files
    if (['jpg', 'jpeg', 'png'].includes(extension) || 
        mimeType.startsWith('image/')) {
      return await extractFromImage(file);
    }

    // Handle text files
    if (['txt', 'md'].includes(extension) || 
        mimeType === 'text/plain') {
      return await file.text();
    }

    throw new Error('Unsupported file type');
  } catch (error) {
    throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function extractFromPDF(file: File): Promise<string> {
    const pdfjs = await import('pdfjs-dist/build/pdf');
    const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.min.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            if (!event.target?.result) {
                return reject(new Error("Failed to read file"));
            }
            try {
                const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
                const pdf = await pdfjs.getDocument(typedArray).promise;
                let textContent = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const text = await page.getTextContent();
                    textContent += text.items.map((item: any) => item.str).join(' ') + '\n';
                }
                resolve(textContent);
            } catch (error) {
                console.error("Error parsing PDF:", error);
                reject(new Error("Failed to parse PDF file."));
            }
        };
        reader.readAsArrayBuffer(file);
    });
}

async function checkIfScannedPDF(pdf: any): Promise<boolean> {
  try {
    // Get first page
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    
    // If no text content, it's likely scanned
    if (textContent.items.length === 0) {
      return true;
    }
    
    // Check text density - if too low, likely scanned
    const textLength = textContent.items.map((i: any) => i.str).join('').length;
    const viewport = page.getViewport({ scale: 1.0 });
    const pageArea = viewport.width * viewport.height;
    const textDensity = textLength / pageArea;
    
    return textDensity < 0.0001; // Threshold for text density
  } catch (error) {
    console.error('Error checking if PDF is scanned:', error);
    return false;
  }
}

async function extractFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function extractFromXlsx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  let text = '';
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    jsonData.forEach((row: any) => {
      text += row.join('\t') + '\n';
    });
    text += '\n\n';
  });
  
  return text;
}

async function extractFromImage(file: File, isPDF = false): Promise<string> {
  const worker = await createWorker('eng');
  try {
    const { data: { text } } = await worker.recognize(file);
    return text;
  } finally {
    await worker.terminate();
  }
}