import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const prospectFile = join(
  root,
  "docs",
  "outreach",
  "claimbrief-prospects-2026-07-02.csv"
);
const outputDir = join(root, "docs", "outreach", "generated");
const emlDir = join(outputDir, "claimbrief-direct-email-eml-2026-07-02");
const trackerFile = join(root, "docs", "outreach", "claimbrief-pipeline-tracker.csv");
const sampleUrl =
  process.env.CLAIMBRIEF_SAMPLE_URL ||
  "https://app.anaya.legal/samples/claimbrief-sample-review.html";
const postalAddress =
  process.env.CLAIMBRIEF_POSTAL_ADDRESS ||
  "[ADD VALID PHYSICAL POSTAL ADDRESS BEFORE SENDING]";
const directEmailAllowed =
  Boolean(process.env.CLAIMBRIEF_POSTAL_ADDRESS) &&
  postalAddress !== "[ADD VALID PHYSICAL POSTAL ADDRESS BEFORE SENDING]";
const complianceFooter = `If this is not relevant, reply "no" and I will not follow up.
Mailing address: ${postalAddress}`;

const baseEmail = (row) => `Hi ${salutation(row)},

${row.first_line}

I am testing ClaimBrief, a small tool that turns claim documents into a cited review brief for licensed claim professionals.

It reads the policy, denial letter, carrier estimate, contractor estimate, and correspondence, then outputs:

- denial reasons in the carrier's own wording
- policy provisions and exclusions mentioned
- missing evidence checklist
- draft response outline for human review

No carrier contact, no legal advice, no homeowner-facing promises. Just document review speed.

If you send one old closed or redacted claim packet, I will return a sample ClaimBrief in 24 hours. If it is useless, tell me and I will not follow up.

Sample format: ${sampleUrl}

Worth trying on one file?

Sandy

${complianceFooter}`;

const followUpEmail = (row) => `Hi ${salutation(row)},

Quick clarification: I am not selling another claims CRM.

This is just a "brief this messy file" tool for policies, denial letters, estimates, and adjuster correspondence.

The output is a PDF/Markdown review packet your team can edit or ignore.

I can do one free sample from a closed/redacted file. Want me to show you what it looks like?

Sample format: ${sampleUrl}

Sandy

${complianceFooter}`;

const contactFormMessage = (row) => `${row.first_line}

I am testing ClaimBrief, a document-review tool for licensed claim professionals. It turns a policy, denial letter, estimates, and correspondence into a cited claim brief: denial reasons, policy provisions, missing evidence, and draft response outline.

No carrier contact, no legal advice, no homeowner-facing promises. Sample format: ${sampleUrl}

Could I create one free sample from an old closed or redacted claim packet?`;

const phoneOpener = (row) =>
  `Hi, I am calling about a tiny document-review tool for public adjusters. I saw ${row.company} handles ${row.observed_specialty}. The simple version: send one old redacted claim packet, and I return a cited brief with denial reasons, policy language, missing evidence, and a response outline. Who reviews carrier letters or policy language before a response goes out?`;

const salutation = (row) => {
  const company = row.company || "there";
  const shortName = company.replace(/\s+(Claims|Public Adjusters|Adjusters|Group|LLC|Inc\.?)$/i, "");
  return `${shortName} team`;
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
  return data.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] || ""]))
  );
};

const toCsv = (rows, headers) => {
  const escapeCell = (value) => {
    const stringValue = String(value ?? "");
    if (/[",\r\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(",")),
  ].join("\n");
};

const toMarkdownDrafts = (title, rows, render) => {
  const sections = rows.map((row) => `## ${row.priority}. ${row.company}

${render(row)}
`);

  return `# ${title}

Generated from \`docs/outreach/claimbrief-prospects-2026-07-02.csv\`.

${sections.join("\n")}
`;
};

const slugify = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);

const toEml = (row) => {
  const headers = [
    "X-Unsent: 1",
    `To: ${row.to}`,
    `Subject: ${row.subject.replace(/[\r\n]+/g, " ")}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
  ];

  return `${headers.join("\r\n")}\r\n\r\n${row.body.replace(/\n/g, "\r\n")}\r\n`;
};

const toDayOnePacket = (emailRows, formRows) => {
  const emailLines = emailRows
    .map(
      (row, index) =>
        `| ${index + 1} | ${row.company} | ${row.to} | ${row.subject} | \`claimbrief-${String(index + 1).padStart(3, "0")}-${slugify(row.company)}.eml\` |`
    )
    .join("\n");

  const firstFormRows = formRows.slice(0, 20);
  const formLines = firstFormRows
    .map(
      (row, index) =>
        `| ${index + 1} | ${row.company} | ${row.contact_url} | ${row.phone || "not found"} | ${row.subject} |`
    )
    .join("\n");

  return `# ClaimBrief Day 1 Send Packet - 2026-07-02

Generated from \`docs/outreach/claimbrief-prospects-2026-07-02.csv\`.

This packet is for review and sending. It does not send anything by itself.

## Send Rule

- Review every email before sending.
- Send only from the mailbox you want replies to land in.
- Replace the mailing-address placeholder before any real send, or regenerate with \`CLAIMBRIEF_POSTAL_ADDRESS\`.
- After each send, update \`docs/outreach/claimbrief-pipeline-tracker.csv\`.
- If a contact form asks for policyholder claim details, do not invent them. Use only the general message field or call instead.
- Before the first real external action, check \`docs/outreach/generated/claimbrief-identity-readiness-2026-07-02.md\`.
- Before the first real external action, use \`docs/outreach/generated/claimbrief-first-attempt-packet-2026-07-02.md\`.
- If starting from zero, use \`docs/outreach/generated/claimbrief-today-execution-plan-2026-07-02.html\` before this broader packet.
- Check \`docs/outreach/generated/claimbrief-today-contact-paths-2026-07-02.md\` before submitting any today-sheet forms.

## Direct Emails

Open the \`.eml\` files from \`docs/outreach/generated/claimbrief-direct-email-eml-2026-07-02/\`.

| Order | Company | To | Subject | Draft File |
| ---: | --- | --- | --- | --- |
${emailLines}

## First 20 Contact Forms Or Calls

Start with \`docs/outreach/generated/claimbrief-identity-readiness-2026-07-02.md\`, \`docs/outreach/generated/claimbrief-first-attempt-packet-2026-07-02.md\`, and \`docs/outreach/generated/claimbrief-today-execution-plan-2026-07-02.html\` for the five-target Oklahoma submit/call plan. Then read \`docs/outreach/generated/claimbrief-today-contact-paths-2026-07-02.md\` before opening forms. If there is no reply, use \`docs/outreach/generated/claimbrief-contact-form-messages-2026-07-02.csv\` or the send board for the broader queue.

| Order | Company | Contact URL | Phone | Subject |
| ---: | --- | --- | --- | --- |
${formLines}

## Day 1 Done Criteria

- 35 direct emails sent or intentionally skipped with a tracker note.
- First 20 forms/calls attempted or intentionally skipped with a tracker note.
- Every sent or skipped lead has \`status\`, \`next_action\`, and \`last_touch_date\` updated.

## Reply Handling

Use \`docs/outreach/claimbrief-reply-and-close-playbook.md\`.
Use \`docs/outreach/claimbrief-outbound-compliance-checklist.md\` before the first real send.

If one person sends a real packet, stop adding features. Produce the sample and ask for payment or invoice approval.
`;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const mailtoHref = (row) =>
  `mailto:${encodeURIComponent(row.to)}?subject=${encodeURIComponent(
    row.subject
  )}&body=${encodeURIComponent(row.body)}`;

const toSendBoard = (emailRows, formRows) => {
  const emailCards = emailRows
    .map(
      (row) => `<article class="card">
        <div class="row">
          <div>
            <p class="eyebrow">Email ${escapeHtml(row.priority)}</p>
            <h2>${escapeHtml(row.company)}</h2>
            <p class="muted">${escapeHtml(row.to)}</p>
          </div>
          ${
            directEmailAllowed
              ? `<a class="button primary" href="${mailtoHref(row)}">Open email</a>`
              : '<span class="button disabled">Email blocked</span>'
          }
        </div>
        ${
          directEmailAllowed
            ? ""
            : '<p class="warning">Set CLAIMBRIEF_POSTAL_ADDRESS and regenerate before opening direct email sends.</p>'
        }
        <p><strong>Subject:</strong> ${escapeHtml(row.subject)}</p>
        <pre>${escapeHtml(row.body)}</pre>
      </article>`
    )
    .join("\n");

  const formCards = formRows
    .map(
      (row) => `<article class="card">
        <div class="row">
          <div>
            <p class="eyebrow">Form ${escapeHtml(row.priority)}</p>
            <h2>${escapeHtml(row.company)}</h2>
            <p class="muted">${escapeHtml(row.phone || "phone not found")}</p>
          </div>
          <a class="button" href="${escapeHtml(row.contact_url)}" target="_blank" rel="noreferrer">Open form</a>
        </div>
        <p><strong>Subject:</strong> ${escapeHtml(row.subject)}</p>
        <pre>${escapeHtml(row.message)}</pre>
        <details>
          <summary>Phone opener</summary>
          <pre>${escapeHtml(row.phone_opener)}</pre>
        </details>
      </article>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ClaimBrief Send Board</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #eef2f7;
        --panel: #ffffff;
        --ink: #0f172a;
        --muted: #64748b;
        --line: #cbd5e1;
        --primary: #0f172a;
        --accent: #0f766e;
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
        position: sticky;
        top: 0;
        z-index: 1;
        border-bottom: 1px solid var(--line);
        background: rgb(255 255 255 / 94%);
        padding: 20px 24px;
        backdrop-filter: blur(12px);
      }

      main {
        width: min(1160px, calc(100% - 32px));
        margin: 24px auto 48px;
      }

      h1, h2, p { margin-top: 0; }
      h1 { margin-bottom: 6px; font-size: clamp(28px, 4vw, 42px); }
      h2 { margin-bottom: 4px; font-size: 20px; }
      .muted { color: var(--muted); margin-bottom: 0; }
      .eyebrow { margin-bottom: 4px; color: var(--accent); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
      .stats { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
      .stat { border: 1px solid var(--line); border-radius: 8px; background: #f8fafc; padding: 8px 10px; font-size: 14px; }
      .section-title { margin: 30px 0 12px; font-size: 24px; }
      .grid { display: grid; gap: 14px; }
      .card { border: 1px solid var(--line); border-radius: 8px; background: var(--panel); padding: 18px; box-shadow: 0 10px 28px rgb(15 23 42 / 8%); }
      .row { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
      .button { display: inline-flex; align-items: center; justify-content: center; min-width: 112px; height: 40px; border: 1px solid var(--line); border-radius: 6px; background: white; color: var(--ink); font-weight: 700; text-decoration: none; }
      .button.primary { border-color: var(--primary); background: var(--primary); color: white; }
      .button.disabled { cursor: not-allowed; opacity: .6; }
      .warning { border-left: 4px solid #f59e0b; background: #fffbeb; padding: 10px 12px; color: #78350f; }
      pre { overflow-x: auto; white-space: pre-wrap; border: 1px solid var(--line); border-radius: 8px; background: #f8fafc; padding: 14px; color: #1e293b; font-family: "SFMono-Regular", Consolas, monospace; font-size: 13px; }
      details { margin-top: 12px; }
      summary { cursor: pointer; font-weight: 700; }

      @media (max-width: 720px) {
        header { position: static; }
        main { width: min(100% - 20px, 1160px); }
        .row { flex-direction: column; }
        .button { width: 100%; }
      }
    </style>
  </head>
  <body>
    <header>
      <h1>ClaimBrief Send Board</h1>
      <p class="muted">Open each email/form, send, then update <code>claimbrief-pipeline-tracker.csv</code>.</p>
      <div class="stats">
        <div class="stat">${emailRows.length} direct emails</div>
        <div class="stat">${formRows.length} contact forms/calls</div>
        <div class="stat">Sample: ${escapeHtml(sampleUrl)}</div>
      </div>
    </header>
    <main>
      <h2 class="section-title">Direct Emails</h2>
      <div class="grid">${emailCards}</div>
      <h2 class="section-title">Contact Forms And Calls</h2>
      <div class="grid">${formCards}</div>
    </main>
  </body>
</html>`;
};

const prospects = parseCsv(readFileSync(prospectFile, "utf8"));
const emailRows = prospects
  .filter((row) => row.contact_channel === "email")
  .map((row) => ({
    priority: row.priority,
    company: row.company,
    to: row.contact_value,
    subject: row.recommended_subject,
    body: baseEmail(row),
    follow_up_subject: "not a CRM",
    follow_up_body: followUpEmail(row),
    source_url: row.source_url,
  }));

const formRows = prospects
  .filter((row) => row.contact_channel === "contact_form")
  .map((row) => ({
    priority: row.priority,
    company: row.company,
    contact_url: row.contact_value,
    phone: row.phone,
    subject: row.recommended_subject,
    message: contactFormMessage(row),
    phone_opener: phoneOpener(row),
    source_url: row.source_url,
  }));

const trackerHeaders = [
  "company",
  "contact",
  "channel",
  "status",
  "next_action",
  "next_action_date",
  "last_touch_date",
  "reply_bucket",
  "packet_received",
  "sample_delivered",
  "payment_status",
  "expected_value",
  "notes",
];

const existingTrackerRows = existsSync(trackerFile)
  ? parseCsv(readFileSync(trackerFile, "utf8"))
  : [];
const trackerKey = (company, contact) => `${company}::${contact}`;
const existingTrackerByContact = new Map(
  existingTrackerRows.map((row) => [trackerKey(row.company, row.contact), row])
);

const trackerRows = prospects.map((row) => {
  const existing = existingTrackerByContact.get(trackerKey(row.company, row.contact_value)) || {};
  const defaultNextAction =
    row.contact_channel === "email" ? "send_email" : "submit_form_or_call";
  const existingNextAction = existing.next_action || "";
  const isUntouchedDefaultAction =
    (existing.status || "not_sent") === "not_sent" &&
    ["send_email", "submit_form_or_call"].includes(existingNextAction);

  return {
    company: row.company,
    contact: row.contact_value,
    channel: row.contact_channel,
    status: existing.status || "not_sent",
    next_action:
      !existingNextAction || isUntouchedDefaultAction
        ? defaultNextAction
        : existingNextAction,
    next_action_date: existing.next_action_date || "",
    last_touch_date: existing.last_touch_date || "",
    reply_bucket: existing.reply_bucket || "",
    packet_received: existing.packet_received || "no",
    sample_delivered: existing.sample_delivered || "no",
    payment_status: existing.payment_status || "not_sent",
    expected_value: existing.expected_value || "299",
    notes: existing.notes || `${row.state_focus}; ${row.evidence_note}`,
  };
});

mkdirSync(outputDir, { recursive: true });
rmSync(emlDir, { force: true, recursive: true });
mkdirSync(emlDir, { recursive: true });

writeFileSync(trackerFile, toCsv(trackerRows, trackerHeaders));

writeFileSync(
  join(outputDir, "claimbrief-direct-email-mailmerge-2026-07-02.csv"),
  toCsv(emailRows, [
    "priority",
    "company",
    "to",
    "subject",
    "body",
    "follow_up_subject",
    "follow_up_body",
    "source_url",
  ])
);

writeFileSync(
  join(outputDir, "claimbrief-contact-form-messages-2026-07-02.csv"),
  toCsv(formRows, [
    "priority",
    "company",
    "contact_url",
    "phone",
    "subject",
    "message",
    "phone_opener",
    "source_url",
  ])
);

writeFileSync(
  join(outputDir, "claimbrief-direct-email-drafts-2026-07-02.md"),
  toMarkdownDrafts(
    "ClaimBrief Direct Email Drafts - 2026-07-02",
    emailRows,
    (row) => `To: ${row.to}
Subject: ${row.subject}

\`\`\`text
${row.body}
\`\`\`

Follow-up subject: ${row.follow_up_subject}

\`\`\`text
${row.follow_up_body}
\`\`\``
  )
);

emailRows.forEach((row, index) => {
  const fileName = `claimbrief-${String(index + 1).padStart(3, "0")}-${slugify(
    row.company
  )}.eml`;
  writeFileSync(join(emlDir, fileName), toEml(row));
});

writeFileSync(
  join(outputDir, "claimbrief-contact-form-drafts-2026-07-02.md"),
  toMarkdownDrafts(
    "ClaimBrief Contact Form Drafts - 2026-07-02",
    formRows,
    (row) => `URL: ${row.contact_url}
Phone: ${row.phone || "not found"}
Subject: ${row.subject}

\`\`\`text
${row.message}
\`\`\`

Phone opener:

\`\`\`text
${row.phone_opener}
\`\`\``
  )
);

writeFileSync(
  join(outputDir, "claimbrief-send-board-2026-07-02.html"),
  toSendBoard(emailRows, formRows)
);

writeFileSync(
  join(outputDir, "claimbrief-day-1-send-packet-2026-07-02.md"),
  toDayOnePacket(emailRows, formRows)
);

console.log(`Generated ${emailRows.length} direct-email rows.`);
console.log(`Generated ${formRows.length} contact-form rows.`);
console.log(`Generated ${trackerRows.length} tracker rows.`);
console.log("Generated send board.");
console.log(`Generated ${emailRows.length} .eml drafts.`);
if (!process.env.CLAIMBRIEF_POSTAL_ADDRESS) {
  console.log("Warning: email drafts contain a mailing-address placeholder.");
}
