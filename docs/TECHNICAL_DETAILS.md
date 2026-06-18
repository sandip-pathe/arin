# Technical Details

## Runtime

Anaya runs on Next.js App Router with two major surfaces:

- `src/app/page.tsx`: local session dashboard.
- `src/app/s/[sessionId]/page.tsx`: document analysis workspace.

Server routes live under:

- `src/app/api/ai/chat/route.ts`
- `src/app/api/ai/quick-skim/route.ts`
- `src/app/api/ai/summarize/route.ts`

The API routes use `runtime = "nodejs"` because they need the OpenAI Node SDK and server environment variables.

## Environment

Required:

```bash
OPENAI_API_KEY=...
```

Do not add `NEXT_PUBLIC_OPENAI_API_KEY`. Browser-exposed OpenAI keys are explicitly out of scope.

## Local Session Storage

Implementation: `src/lib/local-session.ts`

Session index key:

```text
anaya-local-sessions
```

Session content key:

```text
anaya-local-session:<sessionId>
```

Metadata shape:

```ts
type MinimalSession = {
  id: string;
  title: string;
  updatedAt: SessionTimestamp;
  createdAt: SessionTimestamp;
  userId: string;
  isStarred: boolean;
  noOfAttachments: number;
  folder: string;
  sharedWith: string[];
  owner: string;
  summary?: SummaryItem | null;
};
```

Content shape:

```ts
type LocalSessionContent = {
  paragraphs?: Paragraph[];
  summaries?: SummaryItem | null;
  quickSummary?: string | null;
  chatMessages?: ChatMessages[];
  title?: string;
  updatedAt?: string;
};
```

Notes:

- `userId` is normalized to `local`.
- `owner` is normalized to `This browser`.
- Chat timestamps are revived as `Date` instances on load.
- Existing orphaned content can rebuild metadata if the index is missing.

## File Extraction

Implementation: `src/lib/extraction.ts`

Supported inputs:

- PDF
- DOCX
- JPG, JPEG, PNG and other image MIME types
- TXT
- Markdown

Unsupported:

- XLSX and spreadsheet formats. Spreadsheet support was removed because the old parser expanded security risk and was not central to the private legal reading wedge.

Parsing libraries:

- `pdfjs-dist` for PDF text extraction and page rendering.
- `mammoth` for DOCX raw text extraction.
- `tesseract.js` for image OCR and scanned PDF fallback.

Performance choice:

- Heavy libraries are dynamically imported only when the user uploads a matching file.
- This keeps the session route first-load bundle much smaller.

## Chunking

Implementation: `src/lib/chunk.ts`

Flow:

1. Load `wink-nlp` and `wink-eng-lite-web-model` dynamically.
2. Split raw text into sentences.
3. Group sentences into paragraph records of roughly 200 words.
4. Assign source ids like `d1.p1`.

The source ids are used by summary output to preserve document traceability.

## AI API Validation

Implementation: `src/lib/ai-route-utils.ts`

Guards:

- Requires `Content-Type: application/json`.
- Rejects invalid JSON.
- Limits paragraphs to 1,200 records.
- Limits paragraph text to 120,000 characters.
- Limits chat input to 4,000 characters.
- Limits chat history to 20 messages and 24,000 characters.
- Limits summary context to 80,000 serialized characters.
- Returns safe validation and config errors.
- Hides unexpected server errors behind generic fallback messages.

## Summary API

Implementation: `src/app/api/ai/summarize/route.ts`

Flow:

1. Validate request JSON.
2. Normalize paragraphs.
3. Batch paragraphs with a rough `text.length / 4` token estimate.
4. Run batch extraction with concurrency limit `4`.
5. Ask OpenAI for JSON-only legal extractions and ontology fields.
6. Consolidate batch results into one `SummaryItem`.

Output:

```ts
type SummaryItem = {
  title?: string;
  summary: Summary[];
  legalOntology: Ontology;
};
```

## Quick Skim API

Implementation: `src/app/api/ai/quick-skim/route.ts`

This route produces one concise briefing paragraph for the first part of the document. It is designed to give users fast feedback while the fuller summary is still running.

## Chat API

Implementation: `src/app/api/ai/chat/route.ts`

Input:

- Summary context.
- User message.
- Recent chat history.

Behavior:

- Answers must stay grounded in the provided context.
- The assistant should not invent information.
- The assistant should avoid legal advice and instead clarify the document.

## Exports

Implementation: `src/lib/export-utils.ts`

Summary export:

- `exportToPDF(summary, title)`
- `exportToMarkdown(summary, title)`
- `exportToText(summary, title)`

Chat export:

- `exportChatToMarkdown(messages, title)`
- `exportChatToText(messages, title)`

Filename safety:

- Filenames are sanitized to alphanumeric and underscore characters.
- Length is capped at 100 characters.

## Build And Quality Gates

Commands:

```bash
npm run lint
npm run typecheck
npm audit --omit=dev
npm run build
```

Current important package choices:

- `next` is patched to `^15.5.19`.
- `postcss` is pinned through `overrides`.
- Firebase and Firestore packages are removed.
- `xlsx` is removed.
- Large unused UI and product dependencies were removed.

## Known Technical Limits

- Browser localStorage is not encrypted.
- Browser localStorage is not durable backup.
- Large documents are constrained by browser memory and route payload limits.
- AI routes call OpenAI; this is not offline inference.
- PDF.js worker is served locally from `public/pdf.worker.min.mjs`.
- There is no automated Markdown link checker yet.
