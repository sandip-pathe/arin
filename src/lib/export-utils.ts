import { SummaryItem } from "@/types/page";
import { saveAs } from "file-saver";
import React from "react";

/**
 * Export summary to Markdown format (instant, no processing)
 */
export const exportToMarkdown = (summary: SummaryItem, title: string) => {
  let markdown = `# ${title}\n\n`;
  markdown += `*Generated on ${new Date().toLocaleDateString()}*\n\n---\n\n`;

  if (summary.summary && summary.summary.length > 0) {
    summary.summary.forEach((section) => {
      if (section.text) {
        markdown += `${section.text}\n\n`;
      }
    });
  }

  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const filename = `${sanitizeFilename(title)}.md`;
  saveAs(blob, filename);
};

/**
 * Export summary to plain text format (instant)
 */
export const exportToText = (summary: SummaryItem, title: string) => {
  let text = `${title}\n`;
  text += `${"=".repeat(title.length)}\n\n`;
  text += `Generated on ${new Date().toLocaleDateString()}\n\n`;
  text += "-".repeat(50) + "\n\n";

  if (summary.summary && summary.summary.length > 0) {
    summary.summary.forEach((section) => {
      if (section.text) {
        text += `${section.text}\n\n`;
      }
    });
  }

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const filename = `${sanitizeFilename(title)}.txt`;
  saveAs(blob, filename);
};

/**
 * Export summary to PDF format (using web worker to prevent freezing)
 */
export const exportToPDF = async (
  summary: SummaryItem,
  sessionTitle: string
) => {
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
      fontSize: 24,
      marginBottom: 10,
      fontWeight: "bold",
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
  });

  const PDFDocument = () =>
    React.createElement(
      Document,
      null,
      React.createElement(
        Page,
        { size: "A4", style: pdfStyles.page },
        React.createElement(Text, { style: pdfStyles.title }, sessionTitle),
        React.createElement(
          Text,
          { style: pdfStyles.date },
          `Generated on ${new Date().toLocaleDateString()}`
        ),
        React.createElement(View, { style: pdfStyles.divider }),
        summary.summary?.map((section, index) =>
          React.createElement(
            View,
            { key: index },
            section.text &&
              React.createElement(Text, { style: pdfStyles.text }, section.text)
          )
        )
      )
    );

  // Generate PDF blob asynchronously (non-blocking)
  const blob = await pdf(React.createElement(PDFDocument)).toBlob();
  const filename = `${sanitizeFilename(sessionTitle)}.pdf`;
  saveAs(blob, filename);
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
