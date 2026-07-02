import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { campaignDate, generatedDir, getTodayTargets } from "./claimbrief-today-targets.mjs";

const paths = {
  json: join(generatedDir, `claimbrief-today-contact-paths-${campaignDate}.json`),
  markdown: join(generatedDir, `claimbrief-today-contact-paths-${campaignDate}.md`),
};

const riskFieldPattern =
  /\b(claim|policy|policyholder|carrier|insur|loss|damage|address|date|amount|mortgage|property)\b/i;
const generalFieldPattern = /\b(name|email|phone|message|comment|question|company|subject)\b/i;

const stripTags = (value) =>
  String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const decodeEntities = (value) =>
  String(value ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const markdownEscape = (value) => String(value ?? "").replace(/\|/g, "\\|");

const getAttr = (text, name) => {
  const match = text.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return decodeEntities(match?.[2] || match?.[3] || match?.[4] || "");
};

const extractTitle = (html) =>
  decodeEntities(stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ""));

const extractEmails = (html) =>
  Array.from(
    new Set(
      html
        .match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)
        ?.map((value) => value.toLowerCase())
        .filter((value) => !value.includes("u003e") && !value.includes("x3e")) || []
    )
  ).slice(0, 5);

const extractContactLinks = (html, baseUrl) => {
  const links = [];
  const regex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = regex.exec(html))) {
    const href = getAttr(match[1], "href");
    const text = stripTags(match[2]);
    if (!href) {
      continue;
    }

    const haystack = `${href} ${text}`.toLowerCase();
    if (haystack.includes("skip to main content")) {
      continue;
    }
    if (!haystack.includes("contact") && !haystack.includes("quote") && !haystack.includes("consult")) {
      continue;
    }

    try {
      links.push({
        text: text.slice(0, 80) || href,
        href: new URL(href, baseUrl).toString(),
      });
    } catch {
      links.push({ text: text.slice(0, 80) || href, href });
    }
  }

  return Array.from(new Map(links.map((link) => [link.href, link])).values()).slice(0, 8);
};

const extractForms = (html, baseUrl) => {
  const forms = [];
  const formRegex = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
  let formMatch;

  while ((formMatch = formRegex.exec(html))) {
    const formAttrs = formMatch[1];
    const body = formMatch[2];
    const actionAttr = getAttr(formAttrs, "action");
    const method = getAttr(formAttrs, "method") || "GET/unknown";
    const fields = [];
    const fieldRegex = /<(input|textarea|select)\b([^>]*)>/gi;
    let fieldMatch;

    while ((fieldMatch = fieldRegex.exec(body))) {
      const tag = fieldMatch[1].toLowerCase();
      const attrs = fieldMatch[2];
      const type = (getAttr(attrs, "type") || tag).toLowerCase();
      if (type === "hidden" || type === "submit" || type === "button") {
        continue;
      }

      const label = [
        getAttr(attrs, "aria-label"),
        getAttr(attrs, "placeholder"),
        getAttr(attrs, "name"),
        getAttr(attrs, "id"),
        type,
      ]
        .filter(Boolean)
        .join(" / ");
      fields.push({
        label: decodeEntities(label || tag).slice(0, 100),
        required: /\brequired\b/i.test(attrs),
      });
    }

    const riskyFields = fields.filter((field) => riskFieldPattern.test(field.label));
    const generalFields = fields.filter((field) => generalFieldPattern.test(field.label));
    let action = actionAttr || "(current page)";
    try {
      action = actionAttr ? new URL(actionAttr, baseUrl).toString() : "(current page)";
    } catch {
      action = actionAttr || "(current page)";
    }

    forms.push({
      action,
      method: method.toUpperCase(),
      fieldCount: fields.length,
      requiredFields: fields.filter((field) => field.required).map((field) => field.label),
      riskyFields: riskyFields.map((field) => field.label),
      generalFields: generalFields.map((field) => field.label),
      sampleFields: fields.map((field) => field.label).slice(0, 12),
    });
  }

  return forms;
};

const fetchPage = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent":
          "Mozilla/5.0 (compatible; ClaimBriefReadOnlyChecker/1.0; +https://app.anaya.legal/claimbrief)",
      },
    });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      html: text,
      error: "",
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      finalUrl: url,
      html: "",
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
};

const classify = (target, page) => {
  if (!page.ok) {
    return target.phone ? "CALL_FIRST_FETCH_FAILED" : "FETCH_FAILED";
  }

  if (page.forms.length === 0) {
    return target.phone ? "CALL_FIRST_NO_FORM_FOUND" : "NO_FORM_FOUND";
  }

  if (page.forms.some((form) => form.riskyFields.length === 0 && form.generalFields.length >= 2)) {
    return "FORM_LIKELY_USABLE";
  }

  return "FORM_REVIEW_NEEDED";
};

const recommendationFor = (status) => {
  if (status === "FORM_LIKELY_USABLE") {
    return "Open form and use general fields only.";
  }
  if (status === "FORM_REVIEW_NEEDED") {
    return "Open form, but call instead if required fields ask for claim-specific details.";
  }
  if (status.startsWith("CALL_FIRST")) {
    return "Call first using the phone opener.";
  }
  return "Manually inspect before attempting outreach.";
};

const targets = getTodayTargets();
const reports = [];

for (const target of targets) {
  const page = await fetchPage(target.contact_value);
  const forms = page.html ? extractForms(page.html, page.finalUrl) : [];
  const analyzed = {
    ok: page.ok,
    statusCode: page.status,
    finalUrl: page.finalUrl,
    title: page.html ? extractTitle(page.html) : "",
    forms,
    contactLinks: page.html ? extractContactLinks(page.html, page.finalUrl) : [],
    emails: page.html ? extractEmails(page.html) : [],
    error: page.error,
  };
  const status = classify(target, analyzed);

  reports.push({
    company: target.company,
    sourceUrl: target.contact_value,
    phone: target.phone,
    status,
    recommendation: recommendationFor(status),
    page: analyzed,
  });
}

const markdownRows = reports
  .map((report, index) => {
    const riskyFields = report.page.forms.flatMap((form) => form.riskyFields);
    return `| ${index + 1} | ${markdownEscape(report.company)} | ${report.status} | ${
      report.page.statusCode || "n/a"
    } | ${report.page.forms.length} | ${markdownEscape(
      riskyFields.length ? riskyFields.join("; ") : "none detected"
    )} | ${markdownEscape(report.recommendation)} |`;
  })
  .join("\n");

const detailSections = reports
  .map((report) => {
    const forms = report.page.forms.length
      ? report.page.forms
          .map(
            (form, index) => `Form ${index + 1}
- Action: ${form.action}
- Method: ${form.method}
- Field count: ${form.fieldCount}
- Required fields: ${form.requiredFields.join(", ") || "none detected"}
- Risk fields: ${form.riskyFields.join(", ") || "none detected"}
- Sample fields: ${form.sampleFields.join(", ") || "none detected"}`
          )
          .join("\n\n")
      : "No forms detected in static HTML.";

    return `## ${report.company}

- Source URL: ${report.sourceUrl}
- Final URL: ${report.page.finalUrl}
- HTTP status: ${report.page.statusCode || "n/a"}
- Page title: ${report.page.title || "not detected"}
- Phone: ${report.phone || "not found"}
- Status: ${report.status}
- Recommendation: ${report.recommendation}
- Emails detected: ${report.page.emails.join(", ") || "none"}
- Contact links detected: ${
      report.page.contactLinks.map((link) => `${link.text} (${link.href})`).join("; ") || "none"
    }
- Fetch error: ${report.page.error || "none"}

\`\`\`text
${forms}
\`\`\``;
  })
  .join("\n\n");

const markdown = `# ClaimBrief Today Contact Path Report - ${campaignDate}

Read-only check for the five targets in the today action sheet. This script only performs HTTP GET requests and static HTML inspection. It does not fill or submit forms.

## Summary

| # | Company | Status | HTTP | Forms | Risk Fields | Recommendation |
| ---: | --- | --- | ---: | ---: | --- | --- |
${markdownRows || "| - | No targets | - | - | - | - | - |"}

## Operator Rule

If a form requires policyholder, claim number, carrier, loss address, loss date, or insurance details, do not submit it. Call instead or mark the target skipped.

## Details

${detailSections || "No targets found."}
`;

writeFileSync(paths.json, `${JSON.stringify({ campaignDate, reports }, null, 2)}\n`);
writeFileSync(paths.markdown, markdown.trimEnd() + "\n");

console.log(`ClaimBrief today contact paths: ${paths.markdown}`);
console.log(`ClaimBrief today contact paths JSON: ${paths.json}`);
reports.forEach((report) => {
  console.log(`${report.status} ${report.company} (${report.page.statusCode || "n/a"})`);
});
