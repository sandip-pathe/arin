import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const campaignDate = "2026-07-02";
const generatedDir = join(root, "docs", "outreach", "generated");
const claimBriefUrl = "http://localhost:9002/claimbrief";
const intakeUrl = "http://localhost:9002/claimbrief/intake";
const pilotUrl = "http://localhost:9002/claimbrief/pilot";
const starterUrl = "http://localhost:9002/claimbrief/starter";
const oklahomaUrl = "http://localhost:9002/claimbrief/oklahoma-hail";
const sampleUrl = "http://localhost:9002/samples/claimbrief-sample-review.html";

const paths = {
  prospects: join(root, "docs", "outreach", `claimbrief-prospects-${campaignDate}.csv`),
  tracker: join(root, "docs", "outreach", "claimbrief-pipeline-tracker.csv"),
  mailmerge: join(generatedDir, `claimbrief-direct-email-mailmerge-${campaignDate}.csv`),
  formMessages: join(generatedDir, `claimbrief-contact-form-messages-${campaignDate}.csv`),
  readiness: join(generatedDir, `claimbrief-send-readiness-report-${campaignDate}.md`),
  directEmailReadiness: join(generatedDir, `claimbrief-direct-email-readiness-report-${campaignDate}.md`),
  formCallReadiness: join(generatedDir, `claimbrief-form-call-readiness-report-${campaignDate}.md`),
  liveRoutes: join(generatedDir, `claimbrief-live-routes-${campaignDate}.md`),
  pipeline: join(generatedDir, `claimbrief-pipeline-summary-${campaignDate}.md`),
  dayOne: join(generatedDir, `claimbrief-day-1-send-packet-${campaignDate}.md`),
  sendBoard: join(generatedDir, `claimbrief-send-board-${campaignDate}.html`),
  todayActionSheet: join(generatedDir, `claimbrief-today-action-sheet-${campaignDate}.html`),
  todayContactPaths: join(generatedDir, `claimbrief-today-contact-paths-${campaignDate}.md`),
  todayExecutionPlan: join(generatedDir, `claimbrief-today-execution-plan-${campaignDate}.html`),
  firstAttemptPacket: join(generatedDir, `claimbrief-first-attempt-packet-${campaignDate}.md`),
  formCallSprint: join(generatedDir, `claimbrief-form-call-sprint-${campaignDate}.html`),
  triggerSprint: join(generatedDir, `claimbrief-oklahoma-trigger-sprint-${campaignDate}.html`),
  fulfillmentKit: join(root, "docs", "outreach", "claimbrief-sample-fulfillment-kit.md"),
  sample: join(root, "public", "samples", "claimbrief-sample-review.html"),
  emlDir: join(generatedDir, `claimbrief-direct-email-eml-${campaignDate}`),
  commandCenter: join(generatedDir, `claimbrief-command-center-${campaignDate}.html`),
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

const readCsv = (path) => parseCsv(readFileSync(path, "utf8"));

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const relativeHref = (target) => relative(generatedDir, target).replace(/\\/g, "/");

const markdownList = (text, heading) => {
  const marker = `## ${heading}`;
  const start = text.indexOf(marker);
  if (start < 0) {
    return [];
  }
  const rest = text.slice(start + marker.length);
  const end = rest.indexOf("\n## ");
  const section = end >= 0 ? rest.slice(0, end) : rest;
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2));
};

const readinessText = existsSync(paths.readiness) ? readFileSync(paths.readiness, "utf8") : "";
const statusMatch = readinessText.match(/Status:\s+\*\*(.+?)\*\*/);
const readinessStatus = statusMatch?.[1] || "UNKNOWN";
const blockers = markdownList(readinessText, "Blockers").filter((item) => item !== "None");
const warnings = markdownList(readinessText, "Warnings").filter((item) => item !== "None");
const channelRow = (label) => {
  const match = readinessText
    .split(/\r?\n/)
    .find((line) => line.startsWith(`| ${label} |`))
    ?.match(/^\| [^|]+ \| ([^|]+) \| ([^|]+) \|$/);
  return {
    status: match?.[1]?.trim() || "UNKNOWN",
    reason: match?.[2]?.trim() || "Run readiness check to refresh channel status.",
  };
};
const directEmailReadiness = channelRow("Direct email");
const formCallReadiness = channelRow("Contact forms/calls");

const prospects = readCsv(paths.prospects);
const trackerRows = readCsv(paths.tracker);
const emailRows = readCsv(paths.mailmerge);
const formRows = readCsv(paths.formMessages);

const countBy = (rows, key) =>
  rows.reduce((counts, row) => {
    const value = row[key] || "blank";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});

const statusCounts = countBy(trackerRows, "status");
const nextActionCounts = countBy(trackerRows, "next_action");
const paymentCounts = countBy(trackerRows, "payment_status");
const isBlocked = readinessStatus === "BLOCKED";

const statCard = (label, value, detail = "") => `<div class="stat">
  <div class="stat-value">${escapeHtml(value)}</div>
  <div class="stat-label">${escapeHtml(label)}</div>
  ${detail ? `<div class="stat-detail">${escapeHtml(detail)}</div>` : ""}
</div>`;

const countRows = (counts) =>
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => `<tr><td>${escapeHtml(label)}</td><td>${count}</td></tr>`)
    .join("");

const emailQueueRows = emailRows
  .slice(0, 35)
  .map((row, index) => {
    const emlName = `claimbrief-${String(index + 1).padStart(3, "0")}-${String(row.company)
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 56)}.eml`;
    return `<tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(row.company)}</td>
      <td>${escapeHtml(row.to)}</td>
      <td>${escapeHtml(row.subject)}</td>
      <td><a href="${relativeHref(join(paths.emlDir, emlName))}">draft</a></td>
    </tr>`;
  })
  .join("");

const formQueueRows = formRows
  .slice(0, 20)
  .map(
    (row, index) => `<tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(row.company)}</td>
      <td><a href="${escapeHtml(row.contact_url)}">${escapeHtml(row.contact_url)}</a></td>
      <td>${escapeHtml(row.phone || "not found")}</td>
    </tr>`
  )
  .join("");

const blockerMarkup = blockers.length
  ? blockers.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
  : "<li>None</li>";
const warningMarkup = warnings.length
  ? warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
  : "<li>None</li>";

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ClaimBrief Command Center</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f4f7fb;
        --panel: #fff;
        --ink: #0f172a;
        --muted: #64748b;
        --line: #d8e0ea;
        --danger: #b91c1c;
        --warning: #a16207;
        --ok: #047857;
        --primary: #111827;
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
        width: min(1200px, calc(100% - 32px));
        margin: 24px auto 56px;
        display: grid;
        gap: 20px;
      }

      h1, h2, p { margin-top: 0; }
      h1 { margin-bottom: 8px; font-size: clamp(30px, 4vw, 46px); letter-spacing: 0; }
      h2 { margin-bottom: 12px; font-size: 20px; }
      a { color: #1d4ed8; }
      code, pre { font-family: "SFMono-Regular", Consolas, monospace; }
      pre { overflow-x: auto; border: 1px solid var(--line); border-radius: 8px; background: #f8fafc; padding: 14px; }
      table { width: 100%; border-collapse: collapse; font-size: 14px; }
      th, td { border-bottom: 1px solid var(--line); padding: 10px; text-align: left; vertical-align: top; }
      th { color: var(--muted); font-size: 12px; text-transform: uppercase; }
      .muted { color: var(--muted); }
      .grid { display: grid; gap: 16px; }
      .two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .panel { border: 1px solid var(--line); border-radius: 8px; background: var(--panel); padding: 18px; }
      .status { display: inline-flex; align-items: center; height: 32px; border-radius: 999px; padding: 0 12px; font-size: 13px; font-weight: 800; }
      .status.blocked { background: #fee2e2; color: var(--danger); }
      .status.warning { background: #fef3c7; color: var(--warning); }
      .status.ready { background: #dcfce7; color: var(--ok); }
      .stat { border: 1px solid var(--line); border-radius: 8px; background: var(--panel); padding: 16px; }
      .stat-value { font-size: 30px; font-weight: 800; }
      .stat-label { color: var(--muted); font-size: 13px; }
      .stat-detail { margin-top: 6px; color: var(--muted); font-size: 12px; }
      .button-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
      .button { display: inline-flex; align-items: center; justify-content: center; min-height: 40px; border: 1px solid var(--line); border-radius: 6px; background: white; color: var(--ink); padding: 0 14px; font-weight: 700; text-decoration: none; }
      .button.primary { border-color: var(--primary); background: var(--primary); color: white; }
      .button.disabled { cursor: not-allowed; opacity: .55; }
      .danger-list { border-left: 4px solid var(--danger); padding-left: 18px; }
      .warning-list { border-left: 4px solid var(--warning); padding-left: 18px; }

      @media (max-width: 820px) {
        .two, .three { grid-template-columns: 1fr; }
        table { display: block; overflow-x: auto; }
      }
    </style>
  </head>
  <body>
    <header>
      <div class="status ${
        readinessStatus === "BLOCKED"
          ? "blocked"
          : readinessStatus === "READY_WITH_WARNINGS"
            ? "warning"
            : "ready"
      }">${escapeHtml(readinessStatus)}</div>
      <h1>ClaimBrief Command Center</h1>
      <p class="muted">Local operator dashboard for the ${campaignDate} public-adjuster outreach batch. No messages are sent from this page.</p>
      <div class="button-row">
        <a class="button primary" href="${claimBriefUrl}">Open ClaimBrief page</a>
        <a class="button" href="${intakeUrl}">Packet instructions</a>
        <a class="button" href="${pilotUrl}">Pilot details</a>
        <a class="button" href="${starterUrl}">Starter batch</a>
        <a class="button" href="${oklahomaUrl}">Oklahoma page</a>
        <a class="button" href="${sampleUrl}">Sample packet</a>
        <a class="button primary" href="${relativeHref(paths.firstAttemptPacket)}">First attempt packet</a>
        <a class="button primary" href="${relativeHref(paths.todayExecutionPlan)}">Today execution plan</a>
        <a class="button primary" href="${relativeHref(paths.todayActionSheet)}">Today action sheet</a>
        <a class="button" href="${relativeHref(paths.todayContactPaths)}">Today contact paths</a>
        <a class="button primary" href="${relativeHref(paths.formCallSprint)}">Form/call sprint</a>
        <a class="button primary" href="${relativeHref(paths.triggerSprint)}">Oklahoma trigger sprint</a>
        <a class="button" href="${relativeHref(paths.fulfillmentKit)}">Fulfillment kit</a>
        <a class="button" href="${relativeHref(paths.sendBoard)}">Send board</a>
        <a class="button" href="${relativeHref(paths.dayOne)}">Day 1 packet</a>
        <a class="button" href="${relativeHref(paths.readiness)}">Readiness report</a>
        <a class="button" href="${relativeHref(paths.directEmailReadiness)}">Email readiness</a>
        <a class="button" href="${relativeHref(paths.formCallReadiness)}">Form/call readiness</a>
        <a class="button" href="${relativeHref(paths.liveRoutes)}">Live routes</a>
        <a class="button" href="${relativeHref(paths.pipeline)}">Pipeline summary</a>
      </div>
    </header>

    <main>
      <section class="grid three">
        ${statCard("Prospects", prospects.length, "US public adjuster/property-claim leads")}
        ${statCard("Direct email drafts", emailRows.length, `${directEmailReadiness.status}: ${directEmailReadiness.reason}`)}
        ${statCard("Form/call targets", formRows.length, `${formCallReadiness.status}: ${formCallReadiness.reason}`)}
      </section>

      <section class="grid two">
        <div class="panel">
          <h2>Direct Email</h2>
          <div class="status ${
            directEmailReadiness.status === "BLOCKED"
              ? "blocked"
              : directEmailReadiness.status === "READY_WITH_WARNINGS"
                ? "warning"
                : "ready"
          }">${escapeHtml(directEmailReadiness.status)}</div>
          <p class="muted">${escapeHtml(directEmailReadiness.reason)}</p>
        </div>
        <div class="panel">
          <h2>Forms And Calls</h2>
          <div class="status ${
            formCallReadiness.status === "BLOCKED"
              ? "blocked"
              : formCallReadiness.status === "READY_WITH_WARNINGS"
                ? "warning"
                : "ready"
          }">${escapeHtml(formCallReadiness.status)}</div>
          <p class="muted">${escapeHtml(formCallReadiness.reason)}</p>
        </div>
      </section>

      <section class="grid two">
        <div class="panel">
          <h2>Blockers</h2>
          <ul class="danger-list">${blockerMarkup}</ul>
        </div>
        <div class="panel">
          <h2>Warnings</h2>
          <ul class="warning-list">${warningMarkup}</ul>
        </div>
      </section>

      <section class="panel">
        <h2>Next Commands</h2>
        <pre>set CLAIMBRIEF_POSTAL_ADDRESS and contact inbox
payment links are optional; manual invoice fallback is OK
npm run outreach:claimbrief
npm run outreach:claimbrief:check
npm run outreach:claimbrief:check:form-call
npm run outreach:claimbrief:check:direct-email
npm run outreach:claimbrief:live-check
npm run outreach:claimbrief:today
npm run outreach:claimbrief:today-paths
npm run outreach:claimbrief:today-plan
npm run outreach:claimbrief:first-attempt
npm run outreach:claimbrief:form-call-sprint
npm run outreach:claimbrief:tracker</pre>
        <p class="muted">Direct email needs the postal-address blocker cleared. Start with the today action sheet, then the broader form/call queue. Submit manually only with action-time confirmation.</p>
      </section>

      <section class="grid three">
        <div class="panel">
          <h2>Status Counts</h2>
          <table><tbody>${countRows(statusCounts)}</tbody></table>
        </div>
        <div class="panel">
          <h2>Next Actions</h2>
          <table><tbody>${countRows(nextActionCounts)}</tbody></table>
        </div>
        <div class="panel">
          <h2>Payment Status</h2>
          <table><tbody>${countRows(paymentCounts)}</tbody></table>
        </div>
      </section>

      <section class="panel">
        <h2>Direct Email Queue</h2>
        <p class="muted">${
          isBlocked
            ? "Drafts are reviewable, but do not send until the postal-address blocker is cleared."
            : "Review every draft before sending from the mailbox that should receive replies."
        }</p>
        <table>
          <thead><tr><th>#</th><th>Company</th><th>To</th><th>Subject</th><th>Local Draft</th></tr></thead>
          <tbody>${emailQueueRows}</tbody>
        </table>
      </section>

      <section class="panel">
        <h2>First 20 Form Or Call Targets</h2>
        <p class="muted">Use only general contact fields. Do not invent claim, policyholder, loss-address, or carrier details.</p>
        <table>
          <thead><tr><th>#</th><th>Company</th><th>Contact URL</th><th>Phone</th></tr></thead>
          <tbody>${formQueueRows}</tbody>
        </table>
      </section>

      <section class="panel">
        <h2>Tracker Update Example</h2>
        <pre>npm run outreach:claimbrief:tracker -- --company "Palco Claims" --status sent --next-action follow_up_48h --last-touch-date 2026-07-02 --append-note "sent first email"</pre>
      </section>
    </main>
  </body>
</html>`;

writeFileSync(paths.commandCenter, html);
console.log(`ClaimBrief command center: ${paths.commandCenter}`);
