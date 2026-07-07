import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const inputPath = "C:/Users/HP/.codex/attachments/9164e86c-26fa-4180-8c88-c8aaff4159e3/pasted-text.txt";
const outputDir = "D:/s/arin/outputs/lead_scouting_20";

const headers = [
  "Priority",
  "Person",
  "Contact Title",
  "Company",
  "Domain",
  "Region / Timezone",
  "Vertical",
  "Trigger / Timing",
  "Document or Ops Pain",
  "Why This Person",
  "How Sandeep Can Help",
  "Source URLs",
  "Confidence",
  "Vendor / AI Overlap Warning",
  "Email"
];

const replacement = [
  "8",
  "Athan Zhang",
  "Cofounder & CEO",
  "Copperlane",
  "copperlane.ai",
  "US / Pacific",
  "Mortgage origination / loan intake",
  "YC W26; public launch says borrowers upload wrong documents on almost every loan, and Copperlane's Penny handles document checks, borrower follow-up, Letters of Explanation, and loan-officer context.",
  "Bank statements, income docs, borrower clarification loops, missing/conflicting mortgage documents, LOE generation, underwriting handoff, and fair-lending/governance evidence.",
  "Athan is the technical CEO listed by YC; the team is only two founders, has no public jobs open, and is trying to compress a four-hour document review into minutes without losing human control.",
  "Build a 2-3 week doc-verification/evals sprint: source-linked extracted fields, contradiction checks across borrower docs, fail-closed handoffs, and FastAPI/LangGraph review states for LO/underwriter signoff.",
  "https://www.ycombinator.com/companies/copperlane ; https://www.ycombinator.com/launches/Pbl-copperlane-ai-native-mortgage-loan-origination ; https://www.copperlane.ai/blog/copperlane-seed-raise ; https://www.housingwire.com/articles/copperlane-founders-penny-ai/",
  "High",
  "AI-native mortgage product, so pitch contract engineering capacity around evals, source trails, and integrations, not generic mortgage AI.",
  "founders@copperlane.ai"
];

const raw = await fs.readFile(inputPath, "utf8");
const rows = raw
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => line.split("\t"));

const rowsWithoutOldEight = rows.filter((row) => row[0] !== "8");
const finalRows = [...rowsWithoutOldEight, replacement].sort((a, b) => Number(a[0]) - Number(b[0]));

const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const csv = [headers, ...finalRows].map((row) => row.map(csvEscape).join(",")).join("\n");
await fs.writeFile(path.join(outputDir, "new-person-scouting-leads-20-replacement.csv"), csv, "utf8");

const workbook = Workbook.create();
const summary = workbook.worksheets.add("Summary");
const sheet = workbook.worksheets.add("Leads");
summary.showGridLines = false;
sheet.showGridLines = false;

summary.getRange("A1:H1").merge();
summary.getRange("A1").values = [["Email-Enriched Scout List With Row 8 Replacement"]];
summary.getRange("A1").format = {
  fill: "#0F172A",
  font: { bold: true, color: "#FFFFFF", size: 15 },
  horizontalAlignment: "center"
};
summary.getRange("A3:B8").values = [
  ["Rows", finalRows.length],
  ["Replacement row", "8 - Copperlane / Athan Zhang"],
  ["Removed row", "Zynk / Prashanth Swaminathan"],
  ["Reason", "Email/domain was weak; Copperlane has public shared inbox and stronger doc-workflow signal."],
  ["Best next action", "Use Clay for individual founder emails, then send the Copperlane-specific note."],
  ["Public email available", "founders@copperlane.ai"]
];
summary.getRange("A3:A8").format = { fill: "#E2E8F0", font: { bold: true } };
summary.getRange("B3:B8").format = { fill: "#F8FAFC", wrapText: true };
summary.getRange("A3:B8").format.borders = { preset: "all", style: "thin", color: "#CBD5E1" };
summary.getRange("B6").format.columnWidth = 80;

const tableData = [headers, ...finalRows];
sheet.getRangeByIndexes(0, 0, tableData.length, headers.length).values = tableData;
sheet.getRangeByIndexes(0, 0, 1, headers.length).format = {
  fill: "#0F172A",
  font: { bold: true, color: "#FFFFFF" },
  wrapText: true
};
sheet.getRangeByIndexes(1, 0, finalRows.length, headers.length).format = {
  wrapText: true,
  verticalAlignment: "top"
};
sheet.freezePanes.freezeRows(1);
sheet.tables.add(`A1:O${tableData.length}`, true, "ReplacementLeads");

const widths = [9, 22, 25, 22, 22, 18, 28, 58, 60, 50, 62, 70, 13, 48, 28];
for (let i = 0; i < widths.length; i++) {
  sheet.getRangeByIndexes(0, i, tableData.length, 1).format.columnWidth = widths[i];
}
sheet.getRange(`A1:O${tableData.length}`).format.borders = { preset: "inside", style: "thin", color: "#E2E8F0" };
sheet.getRange(`A1:O${tableData.length}`).format.borders = { preset: "outside", style: "thin", color: "#CBD5E1" };
sheet.getRange("M2:M21").conditionalFormats.add("containsText", {
  text: "High",
  format: { fill: "#DCFCE7", font: { color: "#166534", bold: true } }
});
sheet.getRange("M2:M21").conditionalFormats.add("containsText", {
  text: "Medium",
  format: { fill: "#FEF3C7", font: { color: "#92400E", bold: true } }
});
sheet.getRange("A9:O9").format = { fill: "#EFF6FF" };

const inspect = await workbook.inspect({
  kind: "sheet,table",
  maxChars: 2500,
  tableMaxRows: 4,
  tableMaxCols: 6
});
console.log(inspect.ndjson);

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(path.join(outputDir, "new-person-scouting-leads-20-replacement.xlsx"));
