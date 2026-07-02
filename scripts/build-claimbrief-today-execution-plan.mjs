import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { campaignDate, generatedDir, getTodayTargets } from "./claimbrief-today-targets.mjs";

const publicBaseUrl = process.env.CLAIMBRIEF_PUBLIC_BASE_URL || "https://app.anaya.legal";
const oklahomaOfferUrl =
  process.env.CLAIMBRIEF_OKLAHOMA_OFFER_URL || `${publicBaseUrl}/claimbrief/oklahoma-hail`;

const paths = {
  contactPaths: join(generatedDir, `claimbrief-today-contact-paths-${campaignDate}.json`),
  markdown: join(generatedDir, `claimbrief-today-execution-plan-${campaignDate}.md`),
  html: join(generatedDir, `claimbrief-today-execution-plan-${campaignDate}.html`),
};

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
const telHref = (phone) => String(phone || "").replace(/[^0-9+]/g, "");

const contactPathReports = existsSync(paths.contactPaths)
  ? JSON.parse(readFileSync(paths.contactPaths, "utf8")).reports || []
  : [];
const contactPathByCompany = new Map(contactPathReports.map((report) => [report.company, report]));

const compactMessage = (row) => `${row.first_line}

I am testing ClaimBrief for Oklahoma wind/hail, denial, and underpayment files. Send one old closed/redacted packet; I return a cited brief with carrier position, policy language, missing evidence, and a response outline.

No carrier contact or legal advice.

Sample: ${oklahomaOfferUrl}

Could I make one free sample?`;

const phoneOpener = () => `Hi, this is Sandy. I am testing ClaimBrief for public adjusters reviewing Oklahoma wind/hail files.

The simple version: send one old redacted packet, and I return a cited brief with carrier position, policy language, missing evidence, and a response outline.

Who handles carrier-letter or policy-language review in your office?`;

const voicemail = () => `Hi, this is Sandy calling about ClaimBrief for Oklahoma wind and hail claim review. It turns one old redacted packet into a cited brief for a licensed professional to review.

I am not asking for a meeting first. If one free sample would be useful, the page is ${oklahomaOfferUrl}.`;

const trackerCommand = (row, mode) => {
  const modes = {
    form: {
      status: "sent",
      nextAction: "follow_up_48h",
      note: "submitted from today execution plan",
    },
    call: {
      status: "called",
      nextAction: "follow_up_48h",
      note: "called from today execution plan",
    },
    voicemail: {
      status: "called",
      nextAction: "follow_up_48h",
      note: "left voicemail from today execution plan",
    },
    skip: {
      status: "skipped",
      nextAction: "none",
      note: "skipped today execution target because contact path was not usable",
    },
  };
  const config = modes[mode];
  return `npm run outreach:claimbrief:tracker -- --company ${shellQuote(
    row.company
  )} --contact ${shellQuote(row.contact_value)} --status ${
    config.status
  } --next-action ${config.nextAction} --last-touch-date ${campaignDate} --append-note ${shellQuote(config.note)}`;
};

const primaryActionFor = (row, report) => {
  if (!report) {
    return {
      label: row.phone ? "CALL_FIRST_PATH_UNKNOWN" : "REVIEW_FIRST_PATH_UNKNOWN",
      instruction: "Contact-path report is missing. Run npm run outreach:claimbrief:today-paths first.",
    };
  }

  if (report.status === "CALL_FIRST_NO_FORM_FOUND" || report.status === "CALL_FIRST_FETCH_FAILED") {
    return {
      label: "CALL_FIRST",
      instruction: "Call first. No usable static form was found.",
    };
  }

  const riskyFields = report.page?.forms?.flatMap((form) => form.riskyFields || []) || [];
  if (riskyFields.length > 0) {
    return {
      label: "CALL_FIRST_FORM_HAS_RISK_FIELDS",
      instruction: `Call first. Form contains claim/detail-like fields: ${riskyFields.join("; ")}.`,
    };
  }

  return {
    label: "FORM_FIRST_IF_GENERAL_FIELDS_VISIBLE",
    instruction:
      "Try the public form only if visible fields are general contact fields. If a required dropdown or hidden flow asks for claim details, call instead.",
  };
};

const executionRows = getTodayTargets().map((row) => {
  const report = contactPathByCompany.get(row.company);
  return {
    ...row,
    contactPath: report,
    primaryAction: primaryActionFor(row, report),
    compactMessage: compactMessage(row),
    phoneOpener: phoneOpener(row),
    voicemail: voicemail(row),
  };
});

const markdownCards = executionRows
  .map(
    (row, index) => `## ${index + 1}. ${row.company}

- Primary action: ${row.primaryAction.label}
- Why: ${row.primaryAction.instruction}
- Phone: ${row.phone || "not found"}
- Contact page: ${row.contact_value}
- Detected email: ${row.contactPath?.page?.emails?.join(", ") || "none"}
- Contact-path status: ${row.contactPath?.status || "missing"}

Short form message:

\`\`\`text
${row.compactMessage}
\`\`\`

Phone opener:

\`\`\`text
${row.phoneOpener}
\`\`\`

Voicemail:

\`\`\`text
${row.voicemail}
\`\`\`

After form submit:

\`\`\`bash
${trackerCommand(row, "form")}
\`\`\`

After call:

\`\`\`bash
${trackerCommand(row, "call")}
\`\`\`

After voicemail:

\`\`\`bash
${trackerCommand(row, "voicemail")}
\`\`\`

If unusable:

\`\`\`bash
${trackerCommand(row, "skip")}
\`\`\`
`
  )
  .join("\n");

const markdown = `# ClaimBrief Today Execution Plan - ${campaignDate}

Purpose: make the first five Oklahoma wind/hail attempts executable without more research.

No outreach is automated. This plan does not submit forms, send email, or make calls.

## Action Order

1. Run \`npm run outreach:claimbrief:live-check\`.
2. Run \`npm run outreach:claimbrief:check:form-call\`.
3. Run \`npm run outreach:claimbrief:today-paths\`.
4. Work the targets below in order.
5. Stop after any reply, sample request, packet offer, or pricing question.

## Decision Rule

- \`FORM_FIRST_IF_GENERAL_FIELDS_VISIBLE\`: form attempt is allowed only with general contact fields.
- \`CALL_FIRST\`: call before form.
- \`CALL_FIRST_FORM_HAS_RISK_FIELDS\`: call before form because the form asks for claim/detail-like data.

Do not invent policyholder, claim number, loss address, carrier, or claim details.

Live offer page: ${oklahomaOfferUrl}

${markdownCards || "No executable today targets found."}
`;

const htmlCards = executionRows
  .map((row, index) => {
    const slug = `${index + 1}-${slugify(row.company)}`;
    const messageId = `message-${slug}`;
    const openerId = `opener-${slug}`;
    const voicemailId = `voicemail-${slug}`;
    const formCommandId = `form-command-${slug}`;
    const callCommandId = `call-command-${slug}`;
    const voicemailCommandId = `voicemail-command-${slug}`;
    const skipCommandId = `skip-command-${slug}`;

    return `<article class="card">
      <div class="card-head">
        <div>
          <p class="eyebrow">Target ${index + 1} of ${executionRows.length}</p>
          <h2>${escapeHtml(row.company)}</h2>
          <p class="muted">${escapeHtml(row.primaryAction.label)} - ${escapeHtml(row.phone || "phone not found")}</p>
        </div>
        <div class="actions">
          <a class="button${row.primaryAction.label.startsWith("FORM") ? " primary" : ""}" href="${escapeAttr(row.contact_value)}" target="_blank" rel="noreferrer">Open page</a>
          ${
            row.phone
              ? `<a class="button${row.primaryAction.label.startsWith("CALL") ? " primary" : ""}" href="tel:${escapeAttr(telHref(row.phone))}">Call</a>`
              : ""
          }
        </div>
      </div>

      <p class="notice">${escapeHtml(row.primaryAction.instruction)}</p>
      <p><strong>Detected email:</strong> ${escapeHtml(row.contactPath?.page?.emails?.join(", ") || "none")}</p>

      <section>
        <h3>Short form message</h3>
        <pre id="${messageId}">${escapeHtml(row.compactMessage)}</pre>
        <button class="button" data-copy="${messageId}">Copy short form message</button>
      </section>

      <section>
        <h3>Phone opener</h3>
        <pre id="${openerId}">${escapeHtml(row.phoneOpener)}</pre>
        <button class="button" data-copy="${openerId}">Copy phone opener</button>
      </section>

      <details>
        <summary>Voicemail and tracker commands</summary>
        <div class="command-grid">
          <section>
            <h3>Voicemail</h3>
            <pre id="${voicemailId}">${escapeHtml(row.voicemail)}</pre>
            <button class="button" data-copy="${voicemailId}">Copy voicemail</button>
          </section>
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
            <h3>After voicemail</h3>
            <pre id="${voicemailCommandId}">${escapeHtml(trackerCommand(row, "voicemail"))}</pre>
            <button class="button" data-copy="${voicemailCommandId}">Copy voicemail tracker command</button>
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
    <title>ClaimBrief Today Execution Plan</title>
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
        width: min(1120px, calc(100% - 32px));
        margin: 24px auto 56px;
        display: grid;
        gap: 18px;
      }

      h1, h2, h3, p { margin-top: 0; }
      h1 { margin-bottom: 8px; font-size: clamp(30px, 4vw, 44px); letter-spacing: 0; }
      h2 { margin-bottom: 4px; font-size: 22px; }
      h3 { margin: 16px 0 8px; font-size: 15px; }
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
      .notice { border-left: 4px solid #f59e0b; background: #fffbeb; padding: 10px 12px; color: #78350f; }
      .command-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 12px; }
      details { margin-top: 14px; }
      summary { cursor: pointer; font-weight: 800; }

      @media (max-width: 820px) {
        main { width: min(100% - 20px, 1120px); }
        .card-head, .actions { flex-direction: column; align-items: stretch; }
        .command-grid { grid-template-columns: 1fr; }
        .button { width: 100%; }
      }
    </style>
  </head>
  <body>
    <header>
      <h1>ClaimBrief Today Execution Plan</h1>
      <p class="muted">Five target submit/call plan. No messages are sent from this page.</p>
    </header>
    <main>
      <section class="banner">
        Work in order. Stop after any reply, sample request, packet offer, or pricing question.
        Do not invent claim-specific details.
        <br />
        Live offer page: <a href="${oklahomaOfferUrl}" target="_blank" rel="noreferrer">${oklahomaOfferUrl}</a>
      </section>
      ${htmlCards || '<section class="card"><h2>No executable targets found.</h2></section>'}
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

writeFileSync(paths.markdown, markdown.trimEnd() + "\n");
writeFileSync(paths.html, html);
console.log(`ClaimBrief today execution plan: ${paths.html}`);
console.log(`ClaimBrief today execution plan markdown: ${paths.markdown}`);
console.log(`Targets: ${executionRows.length}`);
