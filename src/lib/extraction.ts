import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { createWorker, createScheduler } from "tesseract.js";

type ProgressHandler = (progress: number, message?: string) => void;

// Global map to track progress per page
const progressTrackers = new Map<string, (progress: number) => void>();

/**
 * Extracts text from various file types including PDF, DOCX, XLSX, images, and text files.
 */
export async function extractText(
  file: File,
  progressHandler?: ProgressHandler
): Promise<string> {
  try {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const mimeType = file.type;

    if (extension === "pdf" || mimeType === "application/pdf") {
      return await extractFromPDF(file, progressHandler);
    }

    if (
      extension === "docx" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return await extractFromDocx(file, progressHandler);
    }

    if (
      extension === "xlsx" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return await extractFromXlsx(file, progressHandler);
    }

    if (
      ["jpg", "jpeg", "png"].includes(extension) ||
      mimeType.startsWith("image/")
    ) {
      return await extractFromImage(file, progressHandler);
    }

    if (["txt", "md"].includes(extension) || mimeType === "text/plain") {
      progressHandler?.(100);
      return await file.text();
    }

    throw new Error("Unsupported file type");
  } catch (error) {
    throw new Error(
      `Failed to extract text: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

async function extractFromPDF(
  file: File,
  progressHandler?: ProgressHandler
): Promise<string> {
  // Dynamically import PDF.js
  // @ts-expect-error
  const pdfjs = await import("pdfjs-dist/build/pdf");
  // @ts-expect-error
  const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.min.mjs");

  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;

  const arrayBuffer = await file.arrayBuffer();
  const typedArray = new Uint8Array(arrayBuffer);

  const pdf = await pdfjs.getDocument({
    data: typedArray,
    disableAutoFetch: true,
    disableStream: true,
  }).promise;

  // First try to extract as regular PDF
  try {
    progressHandler?.(5, "Extracting text from PDF...");
    const text = await extractTextFromPDF(pdf, pdfjs, progressHandler);

    // Check if we got meaningful text
    if (text.trim().length > 100 || pdf.numPages === 1) {
      return text;
    }
  } catch (error) {
    console.log(
      "Regular PDF extraction failed, trying scanned detection",
      error
    );
  }

  // If regular extraction failed or got little text, check if scanned
  progressHandler?.(10, "Analyzing PDF content...");
  const isScanned = await isScannedPDF(pdf, pdfjs, progressHandler);
  console.log(isScanned ? "Scanned PDF detected" : "Regular PDF detected");

  if (isScanned) {
    return await extractScannedPDF(pdf, file.name, pdfjs, progressHandler);
  }

  // Final fallback to regular extraction
  return await extractTextFromPDF(pdf, pdfjs, progressHandler);
}

// Improved scanned PDF detection
async function isScannedPDF(
  pdf: any,
  pdfjs: any,
  progressHandler?: ProgressHandler
): Promise<boolean> {
  try {
    let scannedPageCount = 0;
    const pagesToCheck = Math.min(3, pdf.numPages); // Check first 3 pages

    for (let i = 1; i <= pagesToCheck; i++) {
      progressHandler?.(
        10 + Math.round(20 * (i / pagesToCheck)),
        `Checking page ${i}/${pagesToCheck}...`
      );

      const page = await pdf.getPage(i);
      if (await isScannedPage(page, pdfjs)) {
        scannedPageCount++;
      }

      // If majority of checked pages are scanned, consider PDF scanned
      if (scannedPageCount >= Math.ceil(pagesToCheck / 2)) {
        return true;
      }
    }

    return scannedPageCount > 0;
  } catch (error) {
    console.error("Error checking PDF type:", error);
    return false;
  }
}

// More accurate page scanning detection
async function isScannedPage(page: any, pdfjs: any): Promise<boolean> {
  try {
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });
    const pageArea = viewport.width * viewport.height;

    // Case 1: No text content at all
    if (textContent.items.length === 0) {
      return true;
    }

    // Calculate text metrics
    const text = textContent.items.map((i: any) => i.str).join("");
    const textLength = text.length;
    const textDensity = textLength / pageArea;

    // Check for non-alphanumeric ratio
    const nonAlphaNumeric = text.replace(/[\w\s.,;:!?'"()-]/g, "");
    const nonAlphaRatio = nonAlphaNumeric.length / Math.max(1, textLength);

    // Check for invalid characters
    const hasBadChars = /[\uFFFD\u0000-\u001F]/.test(text);

    // Check if page contains images
    const operatorList = await page.getOperatorList();
    const containsImages = operatorList.fnArray.includes(
      pdfjs.OPS.paintImageXObject
    );

    // Improved heuristics
    return (
      // Very sparse text with images
      (textDensity < 0.0005 && containsImages) ||
      // Mostly non-alphanumeric with images
      (nonAlphaRatio > 0.6 && containsImages) ||
      // Invalid characters with images
      (hasBadChars && containsImages) ||
      // High image-to-text ratio
      (containsImages && textDensity < 0.001)
    );
  } catch (error) {
    console.error("Error checking if page is scanned:", error);
    return false;
  }
}

// Optimized regular PDF extraction with minimal progress updates
async function extractTextFromPDF(
  pdf: any,
  pdfjs: any,
  progressHandler?: ProgressHandler
): Promise<string> {
  const numPages = pdf.numPages;
  let extractedText = "";
  let lastReportedProgress = -1;

  for (let i = 1; i <= numPages; i++) {
    const progress = Math.round((i / numPages) * 90); // Reserve 10% for completion

    // Only report progress every 10% or on last page
    if (progress - lastReportedProgress >= 10 || i === numPages) {
      progressHandler?.(progress, `Extracting page ${i}/${numPages}...`);
      lastReportedProgress = progress;
    }

    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    extractedText +=
      textContent.items.map((item: any) => item.str).join(" ") + "\n";
  }

  progressHandler?.(100, "Text extraction complete");
  return extractedText;
}

// Scanned PDF extraction with optimized progress
async function extractScannedPDF(
  pdf: any,
  filename: string,
  pdfjs: any,
  progressHandler?: ProgressHandler
): Promise<string> {
  const numPages = pdf.numPages;
  const scheduler = createScheduler();
  const worker = await createWorker("eng");
  scheduler.addWorker(worker);

  let fullText = "";
  let currentPage = 0;
  let lastReportedProgress = -1;

  // Create optimized progress tracker
  const progressTracker = (progress: number) => {
    if (!currentPage) return;

    const pageProgress = Math.min(progress * 0.7, 0.7);
    const totalProgress = Math.round(
      ((currentPage - 1 + pageProgress) / numPages) * 90 + 10
    );

    // Only update if significant change
    if (totalProgress - lastReportedProgress >= 5 || totalProgress >= 95) {
      progressHandler?.(
        Math.min(totalProgress, 99),
        `Processing page ${currentPage}/${numPages}...`
      );
      lastReportedProgress = totalProgress;
    }
  };

  try {
    // @ts-ignore-next-line
    worker.onProgress = progressTracker;

    for (let i = 1; i <= numPages; i++) {
      currentPage = i;

      // Only report page start every 10% or first/last page
      if (i === 1 || i % Math.ceil(numPages / 10) === 0 || i === numPages) {
        progressHandler?.(
          Math.round((i / numPages) * 10) + 10,
          `Processing page ${i}/${numPages}...`
        );
      }

      // Render page to canvas
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 }); // Reduced scale for faster rendering
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Failed to get canvas context");

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;

      // Convert to image with lower quality for faster OCR
      const imageData = canvas.toDataURL("image/jpeg", 0.7);
      const blob = dataURLtoBlob(imageData);
      const imageFile = new File([blob], `${filename}_page_${i}.jpg`, {
        type: "image/jpeg",
      });

      // OCR processing
      const { data } = await scheduler.addJob("recognize", imageFile);
      fullText += data.text + "\n\n";
    }

    progressHandler?.(100, "OCR complete");
    return fullText;
  } finally {
    await scheduler.terminate();
  }
}

// Helper function to convert data URL to Blob
function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(",");
  const match = arr[0].match(/:(.*?);/);
  if (!match) throw new Error("Invalid data URL format");

  const mime = match[1];
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);

  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }

  return new Blob([u8arr], { type: mime });
}

async function extractFromDocx(
  file: File,
  progressHandler?: ProgressHandler
): Promise<string> {
  progressHandler?.(10, "Processing DOCX document...");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  progressHandler?.(100);
  return result.value;
}

async function extractFromXlsx(
  file: File,
  progressHandler?: ProgressHandler
): Promise<string> {
  progressHandler?.(10, "Processing spreadsheet...");
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array", sheetStubs: true });

  let text = "";
  const sheetCount = workbook.SheetNames.length;

  for (let index = 0; index < sheetCount; index++) {
    const progress = Math.round(((index + 1) / sheetCount) * 100);
    progressHandler?.(
      progress,
      `Processing sheet ${index + 1}/${sheetCount}...`
    );

    const sheetName = workbook.SheetNames[index];
    const worksheet = workbook.Sheets[sheetName];
    text += XLSX.utils.sheet_to_csv(worksheet, { skipHidden: true }) + "\n\n";
  }

  progressHandler?.(100);
  return text;
}

async function extractFromImage(
  file: File,
  progressHandler?: ProgressHandler
): Promise<string> {
  const worker = await createWorker("eng");
  try {
    let lastProgress = 0;
    // @ts-ignore-next-line
    worker.onProgress = (progress: any) => {
      const currentProgress = Math.round(progress * 100);
      if (currentProgress > lastProgress) {
        lastProgress = currentProgress;
        progressHandler?.(currentProgress, "Processing image with OCR...");
      }
    };

    const { data } = await worker.recognize(file);
    progressHandler?.(100);
    return data.text;
  } finally {
    await worker.terminate();
  }
}
