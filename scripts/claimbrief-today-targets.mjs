import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const root = join(__dirname, "..");
export const campaignDate = "2026-07-02";
export const generatedDir = join(root, "docs", "outreach", "generated");
export const targetLimit = Number(process.env.CLAIMBRIEF_TODAY_LIMIT || 5);

export const paths = {
  prospects: join(root, "docs", "outreach", `claimbrief-prospects-${campaignDate}.csv`),
  tracker: join(root, "docs", "outreach", "claimbrief-pipeline-tracker.csv"),
};

export const parseCsv = (text) => {
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

export const readCsv = (path) => (existsSync(path) ? parseCsv(readFileSync(path, "utf8")) : []);

const trackerKey = (company, contact) => `${company}::${contact}`;

const hasOklahomaSignal = (row) => {
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

  return row.state_focus === "OK" || haystack.includes("oklahoma");
};

const isUnattempted = (row, trackerByContact) => {
  const tracker = trackerByContact.get(trackerKey(row.company, row.contact_value));
  return !tracker || tracker.status === "not_sent";
};

const contactPriority = (row) => {
  if (row.contact_channel === "contact_form") {
    return 0;
  }
  if (row.phone) {
    return 1;
  }
  return 2;
};

export const getTodayTargets = () => {
  const prospects = readCsv(paths.prospects);
  const trackerRows = readCsv(paths.tracker);
  const trackerByContact = new Map(
    trackerRows.map((row) => [trackerKey(row.company, row.contact), row])
  );

  return prospects
    .filter(hasOklahomaSignal)
    .filter((row) => isUnattempted(row, trackerByContact))
    .sort(
      (a, b) =>
        contactPriority(a) - contactPriority(b) ||
        (a.state_focus === "OK" ? 0 : 1) - (b.state_focus === "OK" ? 0 : 1) ||
        Number(a.priority) - Number(b.priority)
    )
    .slice(0, targetLimit);
};
