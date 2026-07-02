import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  getClaimBriefIdentityStatus,
  readClaimBriefEnv,
} from "./claimbrief-identity.mjs";
import { campaignDate, generatedDir } from "./claimbrief-today-targets.mjs";

const paths = {
  report: join(generatedDir, `claimbrief-identity-readiness-${campaignDate}.md`),
};

const env = readClaimBriefEnv();
const identity = getClaimBriefIdentityStatus(env);

const rows = identity.checks
  .map(
    (check) =>
      `| ${check.name} | \`${check.key}\` | ${check.ok ? "pass" : "missing"} | ${check.why} |`
  )
  .join("\n");

const missingRows = identity.blockers.length
  ? identity.blockers.map((blocker) => `- \`${blocker.key}\``).join("\n")
  : "- None";

const markdown = `# ClaimBrief Identity Readiness - ${campaignDate}

Status: **${identity.status}**

This report checks whether local sender identity values exist. It does not print secret or personal values.

## Checks

| Item | Env key | Status | Why |
| --- | --- | --- | --- |
${rows}

## Missing

${missingRows}

## Local Setup Template

Add these to \`.env.local\` or export them in the shell before running first-attempt tooling:

\`\`\`bash
CLAIMBRIEF_OPERATOR_FIRST_NAME="Sandy"
CLAIMBRIEF_OPERATOR_LAST_NAME="..."
CLAIMBRIEF_OPERATOR_COMPANY="ClaimBrief"
CLAIMBRIEF_REPLY_EMAIL="..."
CLAIMBRIEF_REPLY_PHONE="..."
\`\`\`

Optional public app contact fallback:

\`\`\`bash
NEXT_PUBLIC_CLAIMBRIEF_CONTACT_EMAIL="..."
\`\`\`

Direct email still separately requires:

\`\`\`bash
CLAIMBRIEF_POSTAL_ADDRESS="..."
\`\`\`

## Next Command

\`\`\`bash
npm run outreach:claimbrief:identity
npm run outreach:claimbrief:first-attempt
\`\`\`
`;

writeFileSync(paths.report, markdown.trimEnd() + "\n");
console.log(`ClaimBrief identity readiness: ${paths.report}`);
console.log(`Status: ${identity.status}`);
if (identity.blockers.length) {
  console.log("Missing identity values:");
  identity.blockers.forEach((blocker) => console.log(`- ${blocker.key}`));
}
