import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const campaignDate = "2026-07-02";
const generatedDir = join(root, "docs", "outreach", "generated");
const emailPlaceholder = "[ADD VALID PHYSICAL POSTAL ADDRESS BEFORE SENDING]";

const paths = {
  prospects: join(root, "docs", "outreach", `claimbrief-prospects-${campaignDate}.csv`),
  tracker: join(root, "docs", "outreach", "claimbrief-pipeline-tracker.csv"),
  sprint: join(generatedDir, `claimbrief-oklahoma-trigger-sprint-${campaignDate}.html`),
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

const readEnvFiles = () => {
  const env = {};

  for (const fileName of [".env.local", ".env", ".env.production.local"]) {
    const path = join(root, fileName);
    if (!existsSync(path)) {
      continue;
    }

    const lines = readFileSync(path, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }
      const [key, ...rest] = trimmed.split("=");
      if (key.trim() === "CLAIMBRIEF_POSTAL_ADDRESS" && !env.CLAIMBRIEF_POSTAL_ADDRESS) {
        env.CLAIMBRIEF_POSTAL_ADDRESS = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
      }
    }
  }

  if (process.env.CLAIMBRIEF_POSTAL_ADDRESS) {
    env.CLAIMBRIEF_POSTAL_ADDRESS = process.env.CLAIMBRIEF_POSTAL_ADDRESS;
  }

  return env;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const slugify = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);

const shellQuote = (value) => `"${String(value ?? "").replace(/"/g, '\\"')}"`;
const trackerKey = (company, contact) => `${company}::${contact}`;
const env = readEnvFiles();
const directEmailAllowed =
  Boolean(env.CLAIMBRIEF_POSTAL_ADDRESS) &&
  env.CLAIMBRIEF_POSTAL_ADDRESS !== emailPlaceholder;

const prospects = readCsv(paths.prospects);
const trackerRows = readCsv(paths.tracker);
const trackerByContact = new Map(
  trackerRows.map((row) => [trackerKey(row.company, row.contact), row])
);

const isTriggerLead = (row) => {
  const haystack = [
    row.company,
    row.state_focus,
    row.website,
    row.contact_value,
    row.observed_specialty,
    row.first_line,
    row.evidence_note,
  ]
    .join(" ")
    .toLowerCase();

  return row.state_focus.includes("OK") || haystack.includes("oklahoma");
};

const triggerRows = prospects
  .filter(isTriggerLead)
  .map((row) => {
    const tracker = trackerByContact.get(trackerKey(row.company, row.contact_value)) || {};
    return {
      ...row,
      status: tracker.status || "not_sent",
      nextAction:
        tracker.next_action ||
        (row.contact_channel === "email" ? "send_email" : "submit_form_or_call"),
    };
  })
  .filter((row) => row.status === "not_sent")
  .sort((a, b) => Number(a.priority) - Number(b.priority));

const triggerMessage = (row) => `${row.first_line}

I am testing ClaimBrief for wind/hail, denial, and underpayment files. It turns a policy, carrier letter, estimates, and correspondence into a cited review brief: carrier position, policy language mentioned, missing evidence, and draft response outline.

No carrier contact, no legal advice, no homeowner-facing promises. Just document review speed for a licensed claim professional.

Could I create one free sample from an old closed or redacted Oklahoma wind/hail packet?${
  row.contact_channel === "email" && directEmailAllowed
    ? `\n\nIf this is not relevant, reply "no" and I will not follow up.\nMailing address: ${env.CLAIMBRIEF_POSTAL_ADDRESS}`
    : ""
}`;

const trackerCommand = (row, mode) => {
  const modes = {
    email: {
      status: "sent",
      nextAction: "follow_up_48h",
      note: "sent Oklahoma wind/hail trigger email",
    },
    form: {
      status: "sent",
      nextAction: "follow_up_48h",
      note: "submitted Oklahoma wind/hail trigger form",
    },
    call: {
      status: "called",
      nextAction: "follow_up_48h",
      note: "called from Oklahoma wind/hail trigger sprint",
    },
    skip: {
      status: "skipped",
      nextAction: "none",
      note: "skipped Oklahoma trigger target because contact path was not usable",
    },
  };
  const config = modes[mode];
  return `npm run outreach:claimbrief:tracker -- --company ${shellQuote(
    row.company
  )} --contact ${shellQuote(row.contact_value)} --status ${
    config.status
  } --next-action ${config.nextAction} --last-touch-date ${campaignDate} --append-note ${shellQuote(config.note)}`;
};

const mailtoHref = (row) =>
  `mailto:${encodeURIComponent(row.contact_value)}?subject=${encodeURIComponent(
    row.recommended_subject
  )}&body=${encodeURIComponent(triggerMessage(row))}`;

const cards = triggerRows
  .map((row, index) => {
    const slug = `${index + 1}-${slugify(row.company)}`;
    const messageId = `message-${slug}`;
    const phoneId = `phone-${slug}`;
    const formCommandId = `form-command-${slug}`;
    const callCommandId = `call-command-${slug}`;
    const skipCommandId = `skip-command-${slug}`;
    const callButton = row.phone
      ? `<a class="button" href="tel:${escapeHtml(row.phone.replace(/[^0-9+]/g, ""))}">Call</a>`
      : "";
    const openButton =
      row.contact_channel === "email"
        ? directEmailAllowed
          ? `<a class="button primary" href="${mailtoHref(row)}">Open email</a>`
          : ""
        : `<a class="button primary" href="${escapeHtml(row.contact_value)}" target="_blank" rel="noreferrer">Open form</a>`;
    const blockedEmailButton =
      row.contact_channel === "email" && !directEmailAllowed
        ? '<span class="button disabled">Email blocked</span>'
        : "";
    const actionButtons = [
      openButton,
      row.contact_channel === "email" && !directEmailAllowed && callButton
        ? callButton.replace('class="button"', 'class="button primary"')
        : callButton,
      blockedEmailButton,
    ]
      .filter(Boolean)
      .join("\n          ");
    const channelNote =
      row.contact_channel === "email" && !directEmailAllowed
        ? "Direct email is disabled until CLAIMBRIEF_POSTAL_ADDRESS is set. Call first or use the broad email drafts only after readiness is clear."
        : "Use only general contact fields. Do not submit claim-specific details.";
    const emailCommandSection =
      row.contact_channel === "email" && directEmailAllowed
        ? `<section>
            <h3>After email</h3>
            <pre id="email-command-${slug}">${escapeHtml(trackerCommand(row, "email"))}</pre>
            <button class="button" data-copy="email-command-${slug}">Copy email tracker command</button>
          </section>`
        : "";
    const phoneOpener = `Hi, this is Sandy. I am calling about ClaimBrief, a document-review tool for public adjusters working wind, hail, denied, or underpaid files. The simple version is: send one old redacted claim packet, and I return a cited brief with the carrier position, policy language mentioned, missing evidence, and a response outline. Who reviews carrier letters or policy language before a response goes out?`;

    return `<article class="card">
      <div class="card-head">
        <div>
          <p class="eyebrow">Trigger target ${index + 1} of ${triggerRows.length}</p>
          <h2>${escapeHtml(row.company)}</h2>
          <p class="muted">${escapeHtml(row.state_focus)} · ${escapeHtml(row.contact_channel)} · ${escapeHtml(row.phone || "phone not found")}</p>
        </div>
        <div class="actions">
          ${actionButtons}
        </div>
      </div>
      <p><strong>Why this lead:</strong> ${escapeHtml(row.evidence_note)}</p>
      <p class="notice">${escapeHtml(channelNote)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(row.recommended_subject)}</p>
      <pre id="${messageId}">${escapeHtml(triggerMessage(row))}</pre>
      <button class="button" data-copy="${messageId}">Copy message</button>

      <details>
        <summary>Phone opener and tracker commands</summary>
        <div class="command-grid">
          <section>
            <h3>Phone opener</h3>
            <pre id="${phoneId}">${escapeHtml(phoneOpener)}</pre>
            <button class="button" data-copy="${phoneId}">Copy phone opener</button>
          </section>
${emailCommandSection}
          <section>
            <h3>After form</h3>
            <pre id="${formCommandId}">${escapeHtml(trackerCommand(row, "form"))}</pre>
            <button class="button" data-copy="${formCommandId}">Copy form tracker command</button>
          </section>
          <section>
            <h3>After call</h3>
            <pre id="${callCommandId}">${escapeHtml(trackerCommand(row, "call"))}</pre>
            <button class="button" data-copy="${callCommandId}">Copy call tracker command</button>
          </section>
          <section>
            <h3>If unusable</h3>
            <pre id="${skipCommandId}">${escapeHtml(trackerCommand(row, "skip"))}</pre>
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
    <title>ClaimBrief Oklahoma Trigger Sprint</title>
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
      a { color: #1d4ed8; }
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
      .banner { border: 1px solid #bfdbfe; border-radius: 8px; background: #eff6ff; padding: 14px; color: #1e3a8a; }
      .card { border: 1px solid var(--line); border-radius: 8px; background: var(--panel); padding: 18px; box-shadow: 0 10px 28px rgb(15 23 42 / 7%); }
      .card-head, .actions { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
      .actions { flex-wrap: wrap; justify-content: flex-end; }
      .button { display: inline-flex; align-items: center; justify-content: center; min-height: 40px; border: 1px solid var(--line); border-radius: 6px; background: white; color: var(--ink); padding: 0 14px; font-weight: 700; text-decoration: none; cursor: pointer; }
      .button.primary { border-color: var(--primary); background: var(--primary); color: white; }
      .button.disabled { cursor: not-allowed; opacity: .6; }
      .notice { border-left: 4px solid #f59e0b; background: #fffbeb; padding: 10px 12px; color: #78350f; }
      .command-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 12px; }
      details { margin-top: 14px; }
      summary { cursor: pointer; font-weight: 800; }

      @media (max-width: 820px) {
        main { width: min(100% - 20px, 1180px); }
        .card-head, .actions { flex-direction: column; align-items: stretch; }
        .command-grid { grid-template-columns: 1fr; }
        .button { width: 100%; }
      }
    </style>
  </head>
  <body>
    <header>
      <h1>ClaimBrief Oklahoma Wind/Hail Trigger Sprint</h1>
      <p class="muted">${triggerRows.length} unattempted Oklahoma-specific leads with wind, hail, denial, or underpayment signals.</p>
    </header>
    <main>
      <section class="banner">
        Use this as the timely sprint after the June 2026 Oklahoma wind/hail claim-handling news cycle. Do not accuse any carrier in outreach. Ask for one old closed or redacted packet and offer a cited review brief.
      </section>
      ${cards || '<section class="card"><h2>No unattempted trigger targets found.</h2><p class="muted">Run the tracker summary to inspect follow-ups or reopen skipped targets.</p></section>'}
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
console.log(`ClaimBrief Oklahoma trigger sprint: ${paths.sprint}`);
console.log(`Trigger targets: ${triggerRows.length}`);
