import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { campaignDate, generatedDir, root } from "./claimbrief-today-targets.mjs";

const publicBaseUrl = process.env.CLAIMBRIEF_PUBLIC_BASE_URL || "https://app.anaya.legal";
const oklahomaOfferUrl =
  process.env.CLAIMBRIEF_OKLAHOMA_OFFER_URL || `${publicBaseUrl}/claimbrief/oklahoma-hail`;

const paths = {
  executionPlan: join(generatedDir, `claimbrief-today-execution-plan-${campaignDate}.md`),
  contactPaths: join(generatedDir, `claimbrief-today-contact-paths-${campaignDate}.json`),
  markdown: join(generatedDir, `claimbrief-first-attempt-packet-${campaignDate}.md`),
};

const envNames = [
  "CLAIMBRIEF_OPERATOR_FIRST_NAME",
  "CLAIMBRIEF_OPERATOR_LAST_NAME",
  "CLAIMBRIEF_OPERATOR_COMPANY",
  "CLAIMBRIEF_REPLY_EMAIL",
  "NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL",
  "CLAIMBRIEF_REPLY_PHONE",
  "CLAIMBRIEF_PUBLIC_BASE_URL",
  "CLAIMBRIEF_OKLAHOMA_OFFER_URL",
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

const hasValue = (value) => Boolean(String(value || "").trim());
const env = readEnvFiles();
const replyEmail = env.CLAIMBRIEF_REPLY_EMAIL || env.NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL || "";

const identityChecks = [
  {
    name: "operator first name",
    key: "CLAIMBRIEF_OPERATOR_FIRST_NAME",
    ok: hasValue(env.CLAIMBRIEF_OPERATOR_FIRST_NAME),
    why: "Needed for most contact forms and for a credible phone opener.",
  },
  {
    name: "operator last name",
    key: "CLAIMBRIEF_OPERATOR_LAST_NAME",
    ok: hasValue(env.CLAIMBRIEF_OPERATOR_LAST_NAME),
    why: "Needed for forms that split name into first and last.",
  },
  {
    name: "operator/company label",
    key: "CLAIMBRIEF_OPERATOR_COMPANY",
    ok: hasValue(env.CLAIMBRIEF_OPERATOR_COMPANY),
    why: "Useful when a form asks company or when a receptionist asks who is calling.",
  },
  {
    name: "reply email",
    key: "CLAIMBRIEF_REPLY_EMAIL or NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL",
    ok: hasValue(replyEmail),
    why: "Needed so prospects can send packets or ask for pricing.",
  },
  {
    name: "reply phone",
    key: "CLAIMBRIEF_REPLY_PHONE",
    ok: hasValue(env.CLAIMBRIEF_REPLY_PHONE),
    why: "Needed for the Gavnat form and useful for callbacks.",
  },
];

const blockers = identityChecks.filter((check) => !check.ok);
const status = blockers.length ? "BLOCKED_IDENTITY" : "READY_FOR_ACTION_CONFIRMATION";

const contactPathReports = existsSync(paths.contactPaths)
  ? JSON.parse(readFileSync(paths.contactPaths, "utf8")).reports || []
  : [];
const gavnat = contactPathReports.find((report) => report.company === "Gavnat Oklahoma");
const gavnatForm = gavnat?.page?.forms?.[0];
const executionPlanExists = existsSync(paths.executionPlan);

const checklistRows = identityChecks
  .map(
    (check) =>
      `| ${check.name} | \`${check.key}\` | ${check.ok ? "pass" : "missing"} | ${check.why} |`
  )
  .join("\n");

const requiredFields = gavnatForm?.requiredFields?.length
  ? gavnatForm.requiredFields.map((field) => `- ${field}`).join("\n")
  : "- Not detected. Run `npm run outreach:claimbrief:today-paths`.";

const sampleFields = gavnatForm?.sampleFields?.length
  ? gavnatForm.sampleFields.map((field) => `- ${field}`).join("\n")
  : "- Not detected. Run `npm run outreach:claimbrief:today-paths`.";

const markdown = `# ClaimBrief First Attempt Packet - ${campaignDate}

Status: **${status}**

Purpose: make the first external action precise. This packet still does not submit forms, send messages, or make calls.

## Identity Gate

| Item | Env key | Status | Why |
| --- | --- | --- | --- |
${checklistRows}

Values are intentionally not printed here. The report only shows whether each value is set.

Set missing values locally before any form submit or call:

\`\`\`bash
CLAIMBRIEF_OPERATOR_FIRST_NAME="Sandy"
CLAIMBRIEF_OPERATOR_LAST_NAME="..."
CLAIMBRIEF_OPERATOR_COMPANY="ClaimBrief"
CLAIMBRIEF_REPLY_EMAIL="..."
CLAIMBRIEF_REPLY_PHONE="..."
\`\`\`

## First External Attempt

Target: **Gavnat Oklahoma**

Action: submit the public form only if visible fields stay general. If the live form asks for claim number, carrier, policyholder, loss address, or other claim-specific details, do not submit; call instead.

URL:

\`\`\`text
https://www.gavnat.com/location/oklahoma/
\`\`\`

Detected required fields:

${requiredFields}

Detected sample fields:

${sampleFields}

Suggested field mapping:

| Form meaning | Value source |
| --- | --- |
| First name | \`CLAIMBRIEF_OPERATOR_FIRST_NAME\` |
| Last name | \`CLAIMBRIEF_OPERATOR_LAST_NAME\` |
| Email | \`CLAIMBRIEF_REPLY_EMAIL\` or \`NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL\` |
| Phone | \`CLAIMBRIEF_REPLY_PHONE\` |
| Company, if shown | \`CLAIMBRIEF_OPERATOR_COMPANY\` |
| Message/inquiry | short message below |
| Dropdowns | choose only truthful/general options; do not pick fake claim details |

Short message:

\`\`\`text
I saw Gavnat's Oklahoma page focuses on tornado, hail, and underpaid property claims.

I am testing ClaimBrief for Oklahoma wind/hail, denial, and underpayment files. Send one old closed/redacted packet; I return a cited brief with carrier position, policy language, missing evidence, and a response outline.

No carrier contact or legal advice.

Sample: ${oklahomaOfferUrl}

Could I make one free sample?
\`\`\`

After submit tracker command:

\`\`\`bash
npm run outreach:claimbrief:tracker -- --company "Gavnat Oklahoma" --contact "https://www.gavnat.com/location/oklahoma/" --status sent --next-action follow_up_48h --last-touch-date ${campaignDate} --append-note "submitted first external attempt"
\`\`\`

## Call-First Backup

If Gavnat form is not usable, call **405-628-0126**.

Phone opener:

\`\`\`text
Hi, this is Sandy. I am testing ClaimBrief for public adjusters reviewing Oklahoma wind/hail files.

The simple version: send one old redacted packet, and I return a cited brief with carrier position, policy language, missing evidence, and a response outline.

Who handles carrier-letter or policy-language review in your office?
\`\`\`

After call tracker command:

\`\`\`bash
npm run outreach:claimbrief:tracker -- --company "Gavnat Oklahoma" --contact "https://www.gavnat.com/location/oklahoma/" --status called --next-action follow_up_48h --last-touch-date ${campaignDate} --append-note "called first external attempt"
\`\`\`

## Action-Time Confirmation Required

Before I submit any form or place/assist with any call, I need explicit confirmation for that exact action, target, and sender identity.

Execution plan exists: **${executionPlanExists ? "yes" : "no"}**
Contact path report exists: **${gavnat ? "yes" : "no"}**
`;

writeFileSync(paths.markdown, markdown.trimEnd() + "\n");
console.log(`ClaimBrief first attempt packet: ${paths.markdown}`);
console.log(`Status: ${status}`);
if (blockers.length) {
  console.log("Missing identity values:");
  blockers.forEach((blocker) => console.log(`- ${blocker.key}`));
}
