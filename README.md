# Anaya

Anaya is a local-first legal document workspace for reading, summarizing, and discussing legal text. It is built as a focused private tool rather than a cloud collaboration product: sessions live in the browser, documents are extracted locally where possible, and exports are first-class.

The current product direction is deliberately narrow: a fast private legal reading room for PDFs, DOCX files, images, plain text, summaries, citations, and chat transcripts.

## Screenshots

### Local Session Dashboard

![Anaya local dashboard](docs/assets/screenshots/home-dashboard.png)

### Legal Summary Workspace

![Anaya session summary](docs/assets/screenshots/session-summary.png)

### Summary Export Menu

![Anaya summary export menu](docs/assets/screenshots/summary-export-menu.png)

### Chat Export Menu

![Anaya chat export menu](docs/assets/screenshots/chat-export-menu.png)

## What It Does

- Creates private legal sessions in the current browser.
- Extracts text from PDF, DOCX, image, TXT, and Markdown files.
- Uses local parsing, PDF text extraction, OCR, and sentence chunking before AI calls.
- Generates quick skims, structured summaries, source-linked legal points, and legal ontology fields.
- Lets users ask follow-up questions grounded in the generated summary.
- Exports summaries as PDF, Markdown, and TXT.
- Exports chat transcripts as Markdown and TXT.
- Avoids accounts, Firebase, analytics, pricing pages, referral flows, and cloud session storage.

## Privacy Model

Anaya is local-first, not fully offline.

Data that stays local:

- Session index and session content are stored in `window.localStorage`.
- Uploaded files are processed in the browser.
- Extracted paragraphs, summaries, quick skim text, and chat history are saved only in browser storage.
- Exported files are generated client-side and downloaded by the browser.

Data that can leave the device:

- Summary and chat requests send document-derived text to local Next.js API routes.
- Those routes call OpenAI using the server-side `OPENAI_API_KEY`.

There is no browser-exposed OpenAI key, no Firebase client, no Firestore writes, and no Google Analytics in the current app.

## Architecture Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Technical Details](docs/TECHNICAL_DETAILS.md)
- [Business Decisions](docs/BUSINESS_DECISIONS.md)
- [Local Private Migration Notes](docs/LOCAL_PRIVATE_MIGRATION.md)

## Tech Stack

- Next.js 15 App Router
- React 18
- TypeScript
- Tailwind CSS
- Zustand for client state
- OpenAI Node SDK in server routes
- PDF.js, Mammoth, Tesseract.js, wink-nlp
- React PDF renderer for summary PDF export

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
OPENAI_API_KEY=your_server_side_key
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:9002
```

## Verification Commands

```bash
npm run lint
npm run typecheck
npm audit --omit=dev
npm run build
```

The latest verified build route table only includes:

- `/`
- `/s/[sessionId]`
- `/api/ai/chat`
- `/api/ai/quick-skim`
- `/api/ai/summarize`

## Important Caveats

- This is not legal advice software. It summarizes and explains provided documents.
- Local sessions are browser-local. Clearing site data or changing browsers removes access unless the user exported files first.
- OpenAI calls are server-side but still transmit document-derived content to OpenAI.
- There is no multi-device sync, team workspace, account system, or cloud backup by design.
