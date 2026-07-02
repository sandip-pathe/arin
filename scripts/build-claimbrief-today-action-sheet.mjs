import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { campaignDate, generatedDir, getTodayTargets } from "./claimbrief-today-targets.mjs";

const publicBaseUrl = process.env.CLAIMBRIEF_PUBLIC_BASE_URL || "https://app.anaya.legal";
const oklahomaTargetUrl = `${publicBaseUrl}/claimbrief/oklahoma-hail`;
const oklahomaOfferUrl =
  process.env.CLAIMBRIEF_OKLAHOMA_OFFER_URL || oklahomaTargetUrl;

const paths = {
  markdown: join(generatedDir, `claimbrief-today-action-sheet-${campaignDate}.md`),
  html: join(generatedDir, `claimbrief-today-action-sheet-${campaignDate}.html`),
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

const actionRows = getTodayTargets();

const subjectFor = (row) => row.recommended_subject || "Oklahoma wind/hail claim brief?";

const messageFor = (row) => `${row.first_line}

I am testing ClaimBrief for wind/hail, denial, and underpayment files. It turns a policy, carrier letter, estimates, and correspondence into a cited review brief: carrier position, policy language mentioned, missing evidence, and draft response outline.

No carrier contact, no legal advice, no homeowner-facing promises. Just document review speed for a licensed claim professional.

Live sample/offer page: ${oklahomaOfferUrl}

Could I create one free sample from an old closed or redacted Oklahoma wind/hail packet?`;

const phoneOpenerFor = () => `Hi, this is Sandy. I am calling about ClaimBrief, a document-review tool for public adjusters working wind, hail, denied, or underpaid files.

The simple version is: send one old redacted claim packet, and I return a cited brief with the carrier position, policy language mentioned, missing evidence, and a response outline.

Who reviews carrier letters or policy language before a response goes out?`;

const trackerCommand = (row, mode) => {
  const modes = {
    form: {
      status: "sent",
      nextAction: "follow_up_48h",
      note: "submitted from today Oklahoma action sheet",
    },
    call: {
      status: "called",
      nextAction: "follow_up_48h",
      note: "called from today Oklahoma action sheet",
    },
    skip: {
      status: "skipped",
      nextAction: "none",
      note: "skipped today Oklahoma action target because contact path was not usable",
    },
  };
  const config = modes[mode];
  return `npm run outreach:claimbrief:tracker -- --company ${shellQuote(
    row.company
  )} --contact ${shellQuote(row.contact_value)} --status ${
    config.status
  } --next-action ${config.nextAction} --last-touch-date ${campaignDate} --append-note ${shellQuote(config.note)}`;
};

const contactInstruction = (row) => {
  if (row.contact_channel === "contact_form") {
    return "Open the form. Use only general contact fields. If it asks for policyholder, claim number, carrier, or loss-address details, do not submit it.";
  }
  return "Direct email is blocked until the postal-address gate is clean. Call first using the public phone number.";
};

const markdownCards = actionRows
  .map(
    (row, index) => `## Target ${index + 1}: ${row.company}

- Channel: ${row.contact_channel}
- Contact: ${row.contact_value}
- Phone: ${row.phone || "not found"}
- Why this lead: ${row.evidence_note}
- Operator rule: ${contactInstruction(row)}

Subject:

\`\`\`text
${subjectFor(row)}
\`\`\`

Message:

\`\`\`text
${messageFor(row)}
\`\`\`

Phone opener:

\`\`\`text
${phoneOpenerFor(row)}
\`\`\`

After form submit:

\`\`\`bash
${trackerCommand(row, "form")}
\`\`\`

After call:

\`\`\`bash
${trackerCommand(row, "call")}
\`\`\`

If unusable:

\`\`\`bash
${trackerCommand(row, "skip")}
\`\`\`
`
  )
  .join("\n");

const markdownBody =
  markdownCards ||
  "No unattempted Oklahoma targets found. Run the tracker summary before reopening skipped targets.";

const markdown = `# ClaimBrief Today Action Sheet - ${campaignDate}

Purpose: create one paid conversation from the narrowest current wedge: Oklahoma wind/hail claim packet review for public adjusters.

No outreach is automated. This sheet only gives the operator the next five targets, exact copy, call opener, and tracker commands.

## Pre-Action Gates

Run these before touching any prospect:

\`\`\`bash
npm run outreach:claimbrief:live-check
npm run outreach:claimbrief:check:form-call
\`\`\`

Proceed only if live routes are ready and form/call readiness is \`READY\` or \`READY_WITH_WARNINGS\`.

## Stop Conditions

Stop outreach immediately if someone replies, asks for a sample, offers a packet, or asks pricing. Move to \`docs/outreach/claimbrief-sample-fulfillment-kit.md\`, produce the free sample, then use the $99 starter close.

Do not submit any form that requires claim-specific data. Call instead or mark the target skipped.

Live offer page:

${oklahomaOfferUrl}

${markdownBody}
`.trimEnd() + "\n";

const htmlCards = actionRows
  .map((row, index) => {
    const slug = `${index + 1}-${slugify(row.company)}`;
    const subjectId = `subject-${slug}`;
    const messageId = `message-${slug}`;
    const phoneId = `phone-${slug}`;
    const formCommandId = `form-command-${slug}`;
    const callCommandId = `call-command-${slug}`;
    const skipCommandId = `skip-command-${slug}`;
    const contactButton =
      row.contact_channel === "contact_form"
        ? `<a class="button primary" href="${escapeAttr(row.contact_value)}" target="_blank" rel="noreferrer">Open form</a>`
        : '<span class="button disabled">Email blocked</span>';
    const callButton = row.phone
      ? `<a class="button${row.contact_channel === "email" ? " primary" : ""}" href="tel:${escapeAttr(
          telHref(row.phone)
        )}">Call</a>`
      : "";

    return `<article class="card">
      <div class="card-head">
        <div>
          <p class="eyebrow">Target ${index + 1} of ${actionRows.length}</p>
          <h2>${escapeHtml(row.company)}</h2>
          <p class="muted">${escapeHtml(row.state_focus)} - ${escapeHtml(row.contact_channel)} - ${escapeHtml(row.phone || "phone not found")}</p>
        </div>
        <div class="actions">
          ${contactButton}
          ${callButton}
        </div>
      </div>
      <p><strong>Why this lead:</strong> ${escapeHtml(row.evidence_note)}</p>
      <p class="notice">${escapeHtml(contactInstruction(row))}</p>

      <section>
        <h3>Subject</h3>
        <pre id="${subjectId}">${escapeHtml(subjectFor(row))}</pre>
        <button class="button" data-copy="${subjectId}">Copy subject</button>
      </section>

      <section>
        <h3>Message</h3>
        <pre id="${messageId}">${escapeHtml(messageFor(row))}</pre>
        <button class="button" data-copy="${messageId}">Copy message</button>
      </section>

      <details>
        <summary>Phone opener and tracker commands</summary>
        <div class="command-grid">
          <section>
            <h3>Phone opener</h3>
            <pre id="${phoneId}">${escapeHtml(phoneOpenerFor(row))}</pre>
            <button class="button" data-copy="${phoneId}">Copy phone opener</button>
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
    <title>ClaimBrief Today Action Sheet</title>
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
      .button.disabled { cursor: not-allowed; opacity: .6; }
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
      <h1>ClaimBrief Today Action Sheet</h1>
      <p class="muted">Top ${actionRows.length} Oklahoma wind/hail targets. No messages are sent from this page.</p>
    </header>
    <main>
      <section class="banner">
        Run <code>npm run outreach:claimbrief:live-check</code> and <code>npm run outreach:claimbrief:check:form-call</code> first.
        Stop after the first reply, sample request, packet offer, or pricing question.
        <br />
        Live offer page: <a href="${oklahomaOfferUrl}" target="_blank" rel="noreferrer">${oklahomaOfferUrl}</a>
      </section>
      ${
        htmlCards ||
        '<section class="card"><h2>No unattempted Oklahoma targets found.</h2><p class="muted">Run the tracker summary before reopening skipped targets.</p></section>'
      }
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

writeFileSync(paths.markdown, markdown);
writeFileSync(paths.html, html);
console.log(`ClaimBrief today action sheet: ${paths.html}`);
console.log(`ClaimBrief today action sheet markdown: ${paths.markdown}`);
console.log(`Targets: ${actionRows.length}`);
