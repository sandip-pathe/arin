import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const campaignDate = "2026-07-02";
const generatedDir = join(root, "docs", "outreach", "generated");

const paths = {
  formMessages: join(generatedDir, `claimbrief-contact-form-messages-${campaignDate}.csv`),
  tracker: join(root, "docs", "outreach", "claimbrief-pipeline-tracker.csv"),
  sprint: join(generatedDir, `claimbrief-form-call-sprint-${campaignDate}.html`),
};

const parseCsv = (text) => {
  const rows = [];
  let current = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      current.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      current.push(field);
      field = "";
      if (current.some((value) => value.length > 0)) {
        rows.push(current);
      }
      current = [];
      continue;
    }

    field += char;
  }

  if (field.length > 0 || current.length > 0) {
    current.push(field);
    rows.push(current);
  }

  const [headers, ...data] = rows;
  if (!headers) {
    return [];
  }

  return data.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] || ""]))
  );
};

const readCsv = (path) => (existsSync(path) ? parseCsv(readFileSync(path, "utf8")) : []);

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const escapeAttr = escapeHtml;

const slugify = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);

const shellQuote = (value) => `"${String(value ?? "").replace(/"/g, '\\"')}"`;
const rowKey = (company, contact) => `${company}::${contact}`;

const trackerRows = readCsv(paths.tracker);
const trackerByContact = new Map(
  trackerRows.map((row) => [rowKey(row.company, row.contact), row])
);
const formRows = readCsv(paths.formMessages).map((row) => {
  const tracker = trackerByContact.get(rowKey(row.company, row.contact_url)) || {};
  return {
    ...row,
    status: tracker.status || "not_sent",
    nextAction: tracker.next_action || "submit_form_or_call",
  };
});

const queueRows = formRows.filter(
  (row) => row.status === "not_sent" && row.nextAction === "submit_form_or_call"
);
const sprintRows = queueRows.slice(0, 20);

const trackerCommand = (row, mode) => {
  const modes = {
    form: {
      status: "sent",
      nextAction: "follow_up_48h",
      note: "submitted contact form from form/call sprint",
    },
    call: {
      status: "called",
      nextAction: "follow_up_48h",
      note: "called from form/call sprint",
    },
    skip: {
      status: "skipped",
      nextAction: "none",
      note: "skipped because form required claim-specific details or wrong contact path",
    },
  };
  const config = modes[mode];
  return `npm run outreach:claimbrief:tracker -- --company ${shellQuote(
    row.company
  )} --contact ${shellQuote(row.contact_url)} --status ${
    config.status
  } --next-action ${config.nextAction} --last-touch-date ${campaignDate} --append-note ${shellQuote(config.note)}`;
};

const cards = sprintRows
  .map((row, index) => {
    const subjectId = `subject-${index + 1}-${slugify(row.company)}`;
    const messageId = `message-${index + 1}-${slugify(row.company)}`;
    const phoneId = `phone-${index + 1}-${slugify(row.company)}`;
    const formCommandId = `form-command-${index + 1}-${slugify(row.company)}`;
    const callCommandId = `call-command-${index + 1}-${slugify(row.company)}`;
    const skipCommandId = `skip-command-${index + 1}-${slugify(row.company)}`;
    const formCommand = trackerCommand(row, "form");
    const callCommand = trackerCommand(row, "call");
    const skipCommand = trackerCommand(row, "skip");
    const callButton = row.phone
      ? `<a class="button" href="tel:${escapeAttr(row.phone.replace(/[^0-9+]/g, ""))}">Call</a>`
      : "";
    const actionButtons = [
      `<a class="button primary" href="${escapeAttr(row.contact_url)}" target="_blank" rel="noreferrer">Open form</a>`,
      callButton,
    ]
      .filter(Boolean)
      .join("\n          ");

    return `<article class="card">
      <div class="card-head">
        <div>
          <p class="eyebrow">Target ${index + 1} of ${sprintRows.length}</p>
          <h2>${escapeHtml(row.company)}</h2>
          <p class="muted">${escapeHtml(row.phone || "phone not found")}</p>
        </div>
        <div class="actions">
          ${actionButtons}
        </div>
      </div>

      <div class="split">
        <section>
          <h3>Form Message</h3>
          <p><strong>Subject:</strong> <span id="${subjectId}">${escapeHtml(row.subject)}</span></p>
          <button class="button" data-copy="${subjectId}">Copy subject</button>
          <pre id="${messageId}">${escapeHtml(row.message)}</pre>
          <button class="button" data-copy="${messageId}">Copy form message</button>
        </section>
        <section>
          <h3>Phone Opener</h3>
          <pre id="${phoneId}">${escapeHtml(row.phone_opener)}</pre>
          <button class="button" data-copy="${phoneId}">Copy phone opener</button>
        </section>
      </div>

      <details>
        <summary>Tracker commands after action</summary>
        <div class="command-grid">
          <section>
            <h3>After form submit</h3>
            <pre id="${formCommandId}">${escapeHtml(formCommand)}</pre>
            <button class="button" data-copy="${formCommandId}">Copy form tracker command</button>
          </section>
          <section>
            <h3>After call</h3>
            <pre id="${callCommandId}">${escapeHtml(callCommand)}</pre>
            <button class="button" data-copy="${callCommandId}">Copy call tracker command</button>
          </section>
          <section>
            <h3>If form is not usable</h3>
            <pre id="${skipCommandId}">${escapeHtml(skipCommand)}</pre>
            <button class="button" data-copy="${skipCommandId}">Copy skip tracker command</button>
          </section>
        </div>
      </details>
    </article>`;
  })
  .join("\n");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ClaimBrief Form/Call Sprint</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f5f7fb;
        --panel: #fff;
        --ink: #0f172a;
        --muted: #64748b;
        --line: #d8e0ea;
        --primary: #111827;
        --ok: #047857;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        background: var(--bg);
        color: var(--ink);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.5;
      }

      header {
        border-bottom: 1px solid var(--line);
        background: var(--panel);
        padding: 24px;
      }

      main {
        width: min(1180px, calc(100% - 32px));
        margin: 24px auto 56px;
        display: grid;
        gap: 18px;
      }

      h1, h2, h3, p { margin-top: 0; }
      h1 { margin-bottom: 8px; font-size: clamp(30px, 4vw, 44px); letter-spacing: 0; }
      h2 { margin-bottom: 4px; font-size: 22px; }
      h3 { margin-bottom: 8px; font-size: 15px; }
      pre {
        overflow-x: auto;
        white-space: pre-wrap;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #f8fafc;
        padding: 14px;
        color: #1e293b;
        font-family: "SFMono-Regular", Consolas, monospace;
        font-size: 13px;
      }
      .muted { color: var(--muted); }
      .eyebrow { margin-bottom: 4px; color: var(--ok); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
      .banner { border: 1px solid #bbf7d0; border-radius: 8px; background: #f0fdf4; padding: 14px; color: #14532d; }
      .card { border: 1px solid var(--line); border-radius: 8px; background: var(--panel); padding: 18px; box-shadow: 0 10px 28px rgb(15 23 42 / 7%); }
      .card-head, .actions { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
      .actions { flex-wrap: wrap; justify-content: flex-end; }
      .button { display: inline-flex; align-items: center; justify-content: center; min-height: 40px; border: 1px solid var(--line); border-radius: 6px; background: white; color: var(--ink); padding: 0 14px; font-weight: 700; text-decoration: none; cursor: pointer; }
      .button.primary { border-color: var(--primary); background: var(--primary); color: white; }
      .split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 16px; }
      .command-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 12px; }
      details { margin-top: 14px; }
      summary { cursor: pointer; font-weight: 800; }

      @media (max-width: 820px) {
        main { width: min(100% - 20px, 1180px); }
        .card-head, .actions { flex-direction: column; align-items: stretch; }
        .split, .command-grid { grid-template-columns: 1fr; }
        .button { width: 100%; }
      }
    </style>
  </head>
  <body>
    <header>
      <h1>ClaimBrief Form/Call Sprint</h1>
      <p class="muted">${sprintRows.length} unattempted contact-form/call targets from the ${campaignDate} queue. This page does not submit forms, send messages, or update the tracker.</p>
    </header>
    <main>
      <section class="banner">
        Work one card at a time. Use only general contact fields. If a form asks for policyholder, claim number, loss address, carrier, or fake claim details, skip the form and call instead.
      </section>
      ${cards || '<section class="card"><h2>No unattempted form/call targets found.</h2><p class="muted">Run the tracker summary to inspect follow-ups or close queue.</p></section>'}
    </main>
    <script>
      document.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-copy]");
        if (!button) return;
        const target = document.getElementById(button.dataset.copy);
        if (!target) return;
        await navigator.clipboard.writeText(target.innerText);
        const original = button.textContent;
        button.textContent = "Copied";
        setTimeout(() => {
          button.textContent = original;
        }, 1200);
      });
    </script>
  </body>
</html>`;

writeFileSync(paths.sprint, html);
console.log(`ClaimBrief form/call sprint: ${paths.sprint}`);
console.log(`Sprint targets: ${sprintRows.length}`);
