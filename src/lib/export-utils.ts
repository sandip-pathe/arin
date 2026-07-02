import type { ChatMessages, Paragraph, Summary, SummaryItem } from "@/types/page";
import { saveAs } from "file-saver";
import React from "react";

export type SummaryExportOptions = {
  workflow?: "legal" | "claim-brief";
  paragraphs?: Paragraph[];
};

const CLAIMBRIEF_DISCLAIMER =
  "ClaimBrief organizes claim documents for professional review. It does not provide legal advice, public adjusting services, claim negotiation, carrier submission, or coverage determinations.";

/**
 * Export summary to Markdown format (instant, no processing)
 */
export const exportToMarkdown = (
  summary: SummaryItem,
  title: string,
  options: SummaryExportOptions = {}
) => {
  const branding = getSummaryExportBranding(title, options);
  const sourceMap = buildSourceMap(options.paragraphs);
  let markdown = branding.isClaimBrief
    ? `# ${branding.title}\n\n**Matter:** ${title}\n\n**Generated:** ${new Date().toLocaleDateString()}\n\n**Use:** Internal claim-document review draft for licensed claim professionals.\n\n> ${CLAIMBRIEF_DISCLAIMER}\n\n---\n\n`
    : `# ${title}\n\n*Generated on ${new Date().toLocaleDateString()}*\n\n---\n\n`;

  if (summary.summary && summary.summary.length > 0) {
    summary.summary.forEach((section) => {
      if (section.text) {
        markdown += `${section.text}\n\n`;
        markdown += formatSourceRefsMarkdown(section, sourceMap);
      }
    });
  }

  markdown += formatOntologyMarkdown(summary);
  markdown += formatSourceAppendixMarkdown(summary, options);

  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const filename = `${sanitizeFilename(branding.filename)}.md`;
  saveAs(blob, filename);
};

/**
 * Export summary to plain text format (instant)
 */
export const exportToText = (
  summary: SummaryItem,
  title: string,
  options: SummaryExportOptions = {}
) => {
  const branding = getSummaryExportBranding(title, options);
  const sourceMap = buildSourceMap(options.paragraphs);
  let text = `${branding.title}\n`;
  text += `${"=".repeat(branding.title.length)}\n\n`;
  if (branding.isClaimBrief) {
    text += `Matter: ${title}\n`;
    text += "Use: Internal claim-document review draft for licensed claim professionals.\n";
  }
  text += `Generated on ${new Date().toLocaleDateString()}\n\n`;
  if (branding.isClaimBrief) {
    text += `Disclaimer: ${CLAIMBRIEF_DISCLAIMER}\n\n`;
  }
  text += "-".repeat(50) + "\n\n";

  if (summary.summary && summary.summary.length > 0) {
    summary.summary.forEach((section) => {
      if (section.text) {
        text += `${section.text}\n\n`;
        text += formatSourceRefsText(section, sourceMap);
      }
    });
  }

  text += formatOntologyText(summary);
  text += formatSourceAppendixText(summary, options);

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const filename = `${sanitizeFilename(branding.filename)}.txt`;
  saveAs(blob, filename);
};

/**
 * Export summary to PDF format (using web worker to prevent freezing)
 */
export const exportToPDF = async (
  summary: SummaryItem,
  sessionTitle: string,
  options: SummaryExportOptions = {}
) => {
  const branding = getSummaryExportBranding(sessionTitle, options);
  const sourceMap = buildSourceMap(options.paragraphs);
  const sourceAppendix = buildSourceAppendix(summary, options.paragraphs);
  const ontologySections = getOntologySections(summary);

  // Dynamic import to code-split the PDF generation
  const { Document, Page, Text, StyleSheet, pdf, View } = await import(
    "@react-pdf/renderer"
  );

  const pdfStyles = StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 12,
      fontFamily: "Helvetica",
    },
    title: {
      fontSize: branding.isClaimBrief ? 26 : 24,
      marginBottom: 8,
      fontWeight: "bold",
      color: branding.isClaimBrief ? "#0f172a" : "#111827",
    },
    subtitle: {
      fontSize: 11,
      color: "#475569",
      marginBottom: 12,
    },
    date: {
      fontSize: 10,
      color: "#666",
      marginBottom: 20,
    },
    divider: {
      borderBottom: "1px solid #333",
      marginVertical: 15,
    },
    sectionHeading: {
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 15,
      marginBottom: 8,
      color: "#1a1a1a",
    },
    text: {
      fontSize: 11,
      lineHeight: 1.6,
      marginBottom: 10,
      textAlign: "justify",
    },
    sourceRefs: {
      fontSize: 9,
      color: "#2563eb",
      marginBottom: 10,
    },
    disclaimer: {
      fontSize: 9,
      lineHeight: 1.5,
      color: "#334155",
      backgroundColor: "#f8fafc",
      border: "1px solid #cbd5e1",
      padding: 10,
      marginBottom: 14,
    },
    appendixHeading: {
      fontSize: 14,
      fontWeight: "bold",
      marginTop: 18,
      marginBottom: 8,
      color: "#0f172a",
    },
    sourceTitle: {
      fontSize: 10,
      fontWeight: "bold",
      marginTop: 8,
      marginBottom: 3,
      color: "#1e293b",
    },
    sourceText: {
      fontSize: 9,
      lineHeight: 1.45,
      marginBottom: 6,
      color: "#475569",
    },
  });

  const PDFDocument = () => {
    const children = [
      React.createElement(Text, { key: "title", style: pdfStyles.title }, branding.title),
      branding.isClaimBrief &&
        React.createElement(
          Text,
          { key: "subtitle", style: pdfStyles.subtitle },
          `Matter: ${sessionTitle} | Internal claim-document review draft`
        ),
      React.createElement(
        Text,
        { key: "date", style: pdfStyles.date },
        `Generated on ${new Date().toLocaleDateString()}`
      ),
      branding.isClaimBrief &&
        React.createElement(
          Text,
          { key: "disclaimer", style: pdfStyles.disclaimer },
          CLAIMBRIEF_DISCLAIMER
        ),
      React.createElement(View, { key: "divider", style: pdfStyles.divider }),
      ...(summary.summary?.map((section, index) =>
        React.createElement(
          View,
          { key: `section-${index}` },
          section.text &&
            React.createElement(Text, { style: pdfStyles.text }, section.text),
          formatSourceRefsLabel(section, sourceMap) &&
            React.createElement(
              Text,
              { style: pdfStyles.sourceRefs },
              formatSourceRefsLabel(section, sourceMap)
            )
        )
      ) ?? []),
      ...formatOntologyPDF(ontologySections, pdfStyles, { View, Text }),
      ...(branding.isClaimBrief && sourceAppendix.length > 0
        ? [
            React.createElement(View, {
              key: "source-divider",
              style: pdfStyles.divider,
            }),
            React.createElement(
              Text,
              { key: "source-heading", style: pdfStyles.appendixHeading },
              "Source Index"
            ),
            ...sourceAppendix.map((source) =>
              React.createElement(
                View,
                { key: `source-${source.label}` },
                React.createElement(
                  Text,
                  { style: pdfStyles.sourceTitle },
                  `[${source.label}] ${source.title}`
                ),
                React.createElement(
                  Text,
                  { style: pdfStyles.sourceText },
                  truncateText(source.text, 700)
                )
              )
            ),
          ]
        : []),
    ].filter(Boolean);

    return React.createElement(
      Document,
      null,
      React.createElement(Page, { size: "A4", style: pdfStyles.page }, children)
    );
  };

  // Generate PDF blob asynchronously (non-blocking)
  const blob = await pdf(React.createElement(PDFDocument)).toBlob();
  const filename = `${sanitizeFilename(branding.filename)}.pdf`;
  saveAs(blob, filename);
};

export const exportChatToMarkdown = (
  messages: ChatMessages[],
  title: string
) => {
  const transcript = buildChatTranscript(messages, title, "markdown");
  const blob = new Blob([transcript], { type: "text/markdown;charset=utf-8" });
  saveAs(blob, `${sanitizeFilename(`${title}_chat`)}.md`);
};

export const exportChatToText = (messages: ChatMessages[], title: string) => {
  const transcript = buildChatTranscript(messages, title, "text");
  const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `${sanitizeFilename(`${title}_chat`)}.txt`);
};

const formatOntologyMarkdown = (summary: SummaryItem) => {
  const sections = getOntologySections(summary);

  if (sections.length === 0) return "";

  let markdown = "\n## Key Data\n\n";
  sections.forEach(([key, value]) => {
    markdown += `### ${toTitle(key)}\n\n`;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        markdown += `- ${formatValue(item)}\n`;
      });
    } else {
      markdown += `${formatValue(value)}\n`;
    }
    markdown += "\n";
  });
  return markdown;
};

const formatOntologyText = (summary: SummaryItem) => {
  const sections = getOntologySections(summary);

  if (sections.length === 0) return "";

  let text = "\nKEY DATA\n";
  text += "-".repeat(50) + "\n\n";
  sections.forEach(([key, value]) => {
    text += `${toTitle(key)}\n`;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        text += `- ${formatValue(item)}\n`;
      });
    } else {
      text += `${formatValue(value)}\n`;
    }
    text += "\n";
  });
  return text;
};

const formatOntologyPDF = (
  sections: Array<[string, unknown]>,
  styles: Record<string, any>,
  components: { View: React.ElementType; Text: React.ElementType }
) => {
  if (sections.length === 0) return [];

  const { View, Text } = components;

  return [
    React.createElement(View, {
      key: "ontology-divider",
      style: styles.divider,
    }),
    React.createElement(
      Text,
      { key: "ontology-heading", style: styles.appendixHeading },
      "Key Data"
    ),
    ...sections.map(([key, value]) =>
      React.createElement(
        View,
        { key: `ontology-${key}` },
        React.createElement(
          Text,
          { style: styles.sourceTitle },
          toTitle(key)
        ),
        React.createElement(
          Text,
          { style: styles.sourceText },
          Array.isArray(value)
            ? value.map((item) => `- ${formatValue(item)}`).join("\n")
            : formatValue(value)
        )
      )
    ),
  ];
};

const getOntologySections = (summary: SummaryItem) => {
  if (!summary.legalOntology) return [];

  return Object.entries(summary.legalOntology).filter(([, value]) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  );
};

const getSummaryExportBranding = (
  title: string,
  options: SummaryExportOptions
) => {
  const isClaimBrief = options.workflow === "claim-brief";
  return {
    isClaimBrief,
    title: isClaimBrief ? "ClaimBrief Review Packet" : title,
    filename: isClaimBrief ? `ClaimBrief_${title}` : title,
  };
};

const buildSourceMap = (paragraphs?: Paragraph[]) => {
  const sourceMap = new Map<string, number>();
  paragraphs?.forEach((paragraph, index) => {
    sourceMap.set(paragraph.id, index + 1);
  });
  return sourceMap;
};

const getSourceRefs = (section: Summary, sourceMap: Map<string, number>) => {
  const sourceIds = [...new Set(section.sourceParagraphs || [])];
  return sourceIds
    .map((sourceId) => sourceMap.get(sourceId))
    .filter((sourceNumber): sourceNumber is number => Boolean(sourceNumber))
    .sort((a, b) => a - b);
};

const formatSourceRefsLabel = (
  section: Summary,
  sourceMap: Map<string, number>
) => {
  const refs = getSourceRefs(section, sourceMap);
  if (refs.length === 0) return "";
  return `Source refs: ${refs.map((ref) => `[${ref}]`).join(", ")}`;
};

const formatSourceRefsMarkdown = (
  section: Summary,
  sourceMap: Map<string, number>
) => {
  const label = formatSourceRefsLabel(section, sourceMap);
  return label ? `_${label}_\n\n` : "";
};

const formatSourceRefsText = (
  section: Summary,
  sourceMap: Map<string, number>
) => {
  const label = formatSourceRefsLabel(section, sourceMap);
  return label ? `${label}\n\n` : "";
};

const buildSourceAppendix = (
  summary: SummaryItem,
  paragraphs?: Paragraph[]
) => {
  if (!paragraphs || paragraphs.length === 0) return [];

  const usedSourceIds = new Set(
    summary.summary.flatMap((section) => section.sourceParagraphs || [])
  );

  return paragraphs
    .map((paragraph, index) => ({
      id: paragraph.id,
      label: index + 1,
      title: paragraph.sectionTitle || "Source excerpt",
      text: paragraph.text,
    }))
    .filter((paragraph) => usedSourceIds.has(paragraph.id));
};

const formatSourceAppendixMarkdown = (
  summary: SummaryItem,
  options: SummaryExportOptions
) => {
  if (options.workflow !== "claim-brief") return "";

  const sources = buildSourceAppendix(summary, options.paragraphs);
  if (sources.length === 0) return "";

  let markdown = "\n## Source Index\n\n";
  sources.forEach((source) => {
    markdown += `### [${source.label}] ${source.title}\n\n`;
    markdown += `${truncateText(source.text, 900)}\n\n`;
  });
  return markdown;
};

const formatSourceAppendixText = (
  summary: SummaryItem,
  options: SummaryExportOptions
) => {
  if (options.workflow !== "claim-brief") return "";

  const sources = buildSourceAppendix(summary, options.paragraphs);
  if (sources.length === 0) return "";

  let text = "\nSOURCE INDEX\n";
  text += "-".repeat(50) + "\n\n";
  sources.forEach((source) => {
    text += `[${source.label}] ${source.title}\n`;
    text += `${truncateText(source.text, 900)}\n\n`;
  });
  return text;
};

const buildChatTranscript = (
  messages: ChatMessages[],
  title: string,
  format: "markdown" | "text"
) => {
  const heading = format === "markdown" ? `# ${title} Chat\n\n` : `${title} Chat\n`;
  const underline = format === "markdown" ? "" : `${"=".repeat(title.length + 5)}\n\n`;
  const generated = `Generated on ${new Date().toLocaleDateString()}\n\n`;

  const body = messages
    .map((message) => {
      const role = message.role === "assistant" ? "ANAYA" : "User";
      const timestamp = message.timestamp
        ? new Date(message.timestamp).toLocaleString()
        : "";
      if (format === "markdown") {
        return `## ${role}${timestamp ? ` (${timestamp})` : ""}\n\n${message.content}`;
      }
      return `${role}${timestamp ? ` (${timestamp})` : ""}\n${"-".repeat(
        role.length + timestamp.length + 3
      )}\n${message.content}`;
    })
    .join("\n\n");

  return `${heading}${underline}${generated}${body}\n`;
};

const toTitle = (key: string) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
};

const formatValue = (value: unknown) => {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
};

const truncateText = (value: string, maxLength: number) => {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trim()}...`;
};

/**
 * Sanitize filename to remove invalid characters
 */
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_")
    .substring(0, 100);
};
