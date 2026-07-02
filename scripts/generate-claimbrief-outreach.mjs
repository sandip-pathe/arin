import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

Worth trying on one file?

Sandy`;

const followUpEmail = (row) => `Hi ${salutation(row)},

Quick clarification: I am not selling another claims CRM.

This is just a "brief this messy file" tool for policies, denial letters, estimates, and adjuster correspondence.

The output is a PDF/Markdown review packet your team can edit or ignore.

I can do one free sample from a closed/redacted file. Want me to show you what it looks like?

Sandy`;

const contactFormMessage = (row) => `${row.first_line}

I am testing ClaimBrief, a document-review tool for licensed claim professionals. It turns a policy, denial letter, estimates, and correspondence into a cited claim brief: denial reasons, policy provisions, missing evidence, and draft response outline.

No carrier contact, no legal advice, no homeowner-facing promises. Could I create one free sample from an old closed or redacted claim packet?`;

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

mkdirSync(outputDir, { recursive: true });

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

console.log(`Generated ${emailRows.length} direct-email rows.`);
console.log(`Generated ${formRows.length} contact-form rows.`);
