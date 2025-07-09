async function extractTextFromPDF(file: File): Promise<string> {
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

async function extractTextFromDocx(file: File): Promise<string> {
    const mammoth = (await import('mammoth')).default;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            if (!event.target?.result) {
                return reject(new Error("Failed to read file"));
            }
            try {
                const result = await mammoth.extractRawText({ arrayBuffer: event.target.result as ArrayBuffer });
                resolve(result.value);
            } catch (error) {
                console.error("Error parsing DOCX:", error);
                reject(new Error("Failed to parse DOCX file."));
            }
        };
        reader.readAsArrayBuffer(file);
    });
}

async function extractTextFromXlsx(file: File): Promise<string> {
    const XLSX = await import('xlsx');
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target?.result) {
                return reject(new Error("Failed to read file"));
            }
            try {
                const data = new Uint8Array(event.target.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                let content = '';
                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    content += XLSX.utils.sheet_to_csv(worksheet);
                });
                resolve(content);
            } catch (error) {
                console.error("Error parsing XLSX:", error);
                reject(new Error("Failed to parse XLSX file."));
            }
        };
        reader.readAsArrayBuffer(file);
    });
}

async function extractTextFromTxt(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target?.result) {
                return reject(new Error("Failed to read file"));
            }
            resolve(event.target.result as string);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}


export async function extractText(file: File): Promise<string> {
    switch (file.type) {
        case 'application/pdf':
            return extractTextFromPDF(file);
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return extractTextFromDocx(file);
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return extractTextFromXlsx(file);
        case 'text/plain':
        case 'text/markdown':
            return extractTextFromTxt(file);
        default:
            throw new Error(`Unsupported file type: ${file.type}`);
    }
}
