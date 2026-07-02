import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const strict = process.argv.includes("--strict");
const campaignDate = "2026-07-02";

const paths = {
  prospects: join(root, "docs", "outreach", `claimbrief-prospects-${campaignDate}.csv`),
  tracker: join(root, "docs", "outreach", "claimbrief-pipeline-tracker.csv"),
  sendQueue: join(root, "docs", "outreach", `claimbrief-send-queue-${campaignDate}.md`),
  firstSaleRunbook: join(root, "docs", "outreach", "claimbrief-first-sale-runbook.md"),
  complianceChecklist: join(
    root,
    "docs",
    "outreach",
    "claimbrief-outbound-compliance-checklist.md"
  ),
  replyPlaybook: join(root, "docs", "outreach", "claimbrief-reply-and-close-playbook.md"),
  samplePacket: join(root, "public", "samples", "claimbrief-sample-review.html"),
  generated: join(root, "docs", "outreach", "generated"),
  mailmerge: join(
    root,
    "docs",
    "outreach",
    "generated",
    `claimbrief-direct-email-mailmerge-${campaignDate}.csv`
  ),
  formMessages: join(
    root,
    "docs",
    "outreach",
    "generated",
    `claimbrief-contact-form-messages-${campaignDate}.csv`
  ),
  sendBoard: join(
    root,
    "docs",
    "outreach",
    "generated",
    `claimbrief-send-board-${campaignDate}.html`
  ),
  dayOnePacket: join(
    root,
    "docs",
    "outreach",
    "generated",
    `claimbrief-day-1-send-packet-${campaignDate}.md`
  ),
  emlDir: join(
    root,
    "docs",
    "outreach",
    "generated",
    `claimbrief-direct-email-eml-${campaignDate}`
  ),
  report: join(
    root,
    "docs",
    "outreach",
    "generated",
    `claimbrief-send-readiness-report-${campaignDate}.md`
  ),
};

const placeholder = "[ADD VALID PHYSICAL POSTAL ADDRESS BEFORE SENDING]";
const optOutText = 'If this is not relevant, reply "no" and I will not follow up.';

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

const readCsv = (path) => parseCsv(readFileSync(path, "utf8"));

const envNames = [
  "CLAIMBRIEF_POSTAL_ADDRESS",
  "CLAIMBRIEF_SAMPLE_URL",
  "NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL",
  "NEXT_PUBLIC_CLAIMBRIEF_STARTER_URL",
  "NEXT_PUBLIC_CLAIMBRIEF_MONTHLY_URL",
  "NEXT_PUBLIC_CLAIMBRIEF_WHITELABEL_URL",
];

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
      const cleanKey = key.trim();
      if (!envNames.includes(cleanKey) || env[cleanKey] != null) {
        continue;
      }
      env[cleanKey] = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
    }
  }

  for (const name of envNames) {
    if (process.env[name]) {
      env[name] = process.env[name];
    }
  }

  return env;
};

const checks = [];
const blockers = [];
const warnings = [];
const notes = [];

const addCheck = (name, ok, detail, severity = "blocker") => {
  checks.push({ name, ok, detail });
  if (!ok && severity === "blocker") {
    blockers.push(`${name}: ${detail}`);
  }
  if (!ok && severity === "warning") {
    warnings.push(`${name}: ${detail}`);
  }
};

const formatDetail = (detail) => {
  const value = String(detail);
  const relativePath = relative(root, value);
  if (relativePath && !relativePath.startsWith("..") && !relativePath.includes(":")) {
    return relativePath.replace(/\\/g, "/");
  }
  return value;
};

for (const [name, path] of Object.entries(paths)) {
  if (name === "report") {
    continue;
  }
  addCheck(`file:${name}`, existsSync(path), path);
}

const env = readEnvFiles();
const postalAddress = env.CLAIMBRIEF_POSTAL_ADDRESS || "";
addCheck(
  "env:CLAIMBRIEF_POSTAL_ADDRESS",
  Boolean(postalAddress && postalAddress !== placeholder),
  "Set this before sending email drafts."
);

addCheck(
  "env:NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL",
  Boolean(env.NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL),
  "Set the inbox that should receive sample and pilot requests.",
  "warning"
);

addCheck(
  "env:NEXT_PUBLIC_CLAIMBRIEF_STARTER_URL",
  Boolean(env.NEXT_PUBLIC_CLAIMBRIEF_STARTER_URL),
  "Missing $99 checkout URL. The page can fall back to email, but payment collection is slower.",
  "warning"
);

addCheck(
  "env:NEXT_PUBLIC_CLAIMBRIEF_MONTHLY_URL",
  Boolean(env.NEXT_PUBLIC_CLAIMBRIEF_MONTHLY_URL),
  "Missing $299/month checkout URL. Manual invoicing or email fallback is still possible.",
  "warning"
);

let prospects = [];
let mailmergeRows = [];
let formRows = [];
let trackerRows = [];
let emlFiles = [];

if (existsSync(paths.prospects)) {
  prospects = readCsv(paths.prospects);
}
if (existsSync(paths.mailmerge)) {
  mailmergeRows = readCsv(paths.mailmerge);
}
if (existsSync(paths.formMessages)) {
  formRows = readCsv(paths.formMessages);
}
if (existsSync(paths.tracker)) {
  trackerRows = readCsv(paths.tracker);
}
if (existsSync(paths.emlDir)) {
  emlFiles = readdirSync(paths.emlDir).filter((fileName) => fileName.endsWith(".eml"));
}

const expectedEmailCount = prospects.filter((row) => row.contact_channel === "email").length;
const expectedFormCount = prospects.filter((row) => row.contact_channel === "contact_form").length;

addCheck("count:prospects", prospects.length === 100, `${prospects.length} prospects found.`);
addCheck(
  "count:mailmerge",
  mailmergeRows.length === expectedEmailCount,
  `${mailmergeRows.length} email rows found; expected ${expectedEmailCount}.`
);
addCheck(
  "count:forms",
  formRows.length === expectedFormCount,
  `${formRows.length} form/call rows found; expected ${expectedFormCount}.`
);
addCheck(
  "count:tracker",
  trackerRows.length === prospects.length,
  `${trackerRows.length} tracker rows found; expected ${prospects.length}.`
);
addCheck(
  "count:eml",
  emlFiles.length === expectedEmailCount,
  `${emlFiles.length} .eml drafts found; expected ${expectedEmailCount}.`
);

const emlTexts = emlFiles.map((fileName) => ({
  fileName,
  text: readFileSync(join(paths.emlDir, fileName), "utf8"),
}));

const missingOptOut = emlTexts.filter(({ text }) => !text.includes(optOutText));
const missingAddress = emlTexts.filter(({ text }) => !text.includes("Mailing address:"));
const placeholderDrafts = emlTexts.filter(({ text }) => text.includes(placeholder));
const malformedDrafts = emlTexts.filter(
  ({ text }) => !text.includes("X-Unsent: 1") || !text.includes("\nTo: ") || !text.includes("\nSubject: ")
);

addCheck(
  "drafts:opt_out",
  missingOptOut.length === 0,
  `${missingOptOut.length} .eml drafts are missing opt-out text.`
);
addCheck(
  "drafts:mailing_address",
  missingAddress.length === 0,
  `${missingAddress.length} .eml drafts are missing a mailing-address line.`
);
addCheck(
  "drafts:postal_placeholder",
  placeholderDrafts.length === 0,
  `${placeholderDrafts.length} .eml drafts still contain the postal-address placeholder.`
);
addCheck(
  "drafts:headers",
  malformedDrafts.length === 0,
  `${malformedDrafts.length} .eml drafts are missing basic headers.`
);

const trackerStatusCounts = trackerRows.reduce((accumulator, row) => {
  const key = row.status || "blank";
  accumulator[key] = (accumulator[key] || 0) + 1;
  return accumulator;
}, {});
notes.push(
  `Tracker status counts: ${Object.entries(trackerStatusCounts)
    .map(([status, count]) => `${status}=${count}`)
    .join(", ")}`
);

const status = blockers.length > 0 ? "BLOCKED" : warnings.length > 0 ? "READY_WITH_WARNINGS" : "READY";
const report = `# ClaimBrief Send Readiness Report - ${campaignDate}

Status: **${status}**

Generated by \`npm run outreach:claimbrief:check\`.

## Summary

- Prospects: ${prospects.length}
- Direct email rows: ${mailmergeRows.length}
- Contact-form/call rows: ${formRows.length}
- Tracker rows: ${trackerRows.length}
- EML drafts: ${emlFiles.length}
- Blockers: ${blockers.length}
- Warnings: ${warnings.length}

## Blockers

${blockers.length ? blockers.map((item) => `- ${item}`).join("\n") : "- None"}

## Warnings

${warnings.length ? warnings.map((item) => `- ${item}`).join("\n") : "- None"}

## Checks

| Check | Result | Detail |
| --- | --- | --- |
${checks
  .map(
    (check) =>
      `| ${check.name} | ${check.ok ? "pass" : "fail"} | ${formatDetail(check.detail).replace(/\|/g, "\\|")} |`
  )
  .join("\n")}

## Notes

${notes.map((item) => `- ${item}`).join("\n")}

## Next Action

${
  blockers.length
    ? "Fix blockers, regenerate with `npm run outreach:claimbrief`, then run this check again."
    : "Review the first 5 drafts manually, then send only with action-time confirmation."
}
`;

writeFileSync(paths.report, report);
console.log(`ClaimBrief send readiness: ${status}`);
console.log(`Report: ${paths.report}`);
if (blockers.length) {
  console.log("Blockers:");
  blockers.forEach((item) => console.log(`- ${item}`));
}
if (warnings.length) {
  console.log("Warnings:");
  warnings.forEach((item) => console.log(`- ${item}`));
}

if (strict && blockers.length > 0) {
  process.exitCode = 1;
}
