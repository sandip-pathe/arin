// components/pdf-document.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
  Image,
} from "@react-pdf/renderer";
import { Paragraph, SummaryItem, Ontology } from "@/types/page";

// Register fonts
Font.register({
  family: "Inter",
  src: "/fonts/Inter-Regular.ttf",
});
Font.register({
  family: "Inter-Bold",
  src: "/fonts/Inter-Bold.ttf",
});
Font.register({
  family: "Merriweather-Bold",
  src: "/fonts/Merriweather-Bold.ttf",
});

// Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Inter",
  },
  coverPage: {
    backgroundColor: "#FFFFFF",
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  coverTitle: {
    fontSize: 26,
    fontFamily: "Merriweather-Bold",
    color: "#111827",
    marginBottom: 10,
  },
  coverSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: "1pt solid #E5E7EB",
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    marginBottom: 5,
    color: "#111827",
  },
  metadata: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: "1pt solid #E5E7EB",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    marginBottom: 10,
    color: "#111827",
  },
  summaryText: {
    fontSize: 12,
    fontFamily: "Inter",
    lineHeight: 1.5,
    marginBottom: 8,
    textAlign: "justify",
  },
  citation: {
    fontSize: 8,
    color: "#2563EB",
    verticalAlign: "super",
    marginLeft: 2,
  },
  ontologyItem: {
    marginBottom: 6,
    fontSize: 11,
    padding: 4,
    borderRadius: 3,
  },
  ontologyCategory: {
    fontFamily: "Inter-Bold",
    marginBottom: 5,
    fontSize: 12,
    color: "#374151",
  },
  highlightObligation: { backgroundColor: "#FEF3C7" }, // soft yellow
  highlightRight: { backgroundColor: "#DBEAFE" }, // soft blue
  highlightDefinition: { backgroundColor: "#F3F4F6" }, // light gray
  sourceItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 4,
  },
  sourceId: {
    fontFamily: "Inter-Bold",
    marginBottom: 5,
    fontSize: 11,
    color: "#4B5563",
  },
  sourceText: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 9,
    color: "#9CA3AF",
  },
  banner: {
    marginTop: 20,
    padding: 10,
    borderTop: "1pt solid #E5E7EB",
    textAlign: "center",
    fontSize: 10,
    color: "#6B7280",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  bannerLogo: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
});

interface PDFDocumentProps {
  summary: SummaryItem | null;
  paragraphs: Paragraph[];
  ontology: Ontology;
  options: {
    summary: boolean;
    keyData: boolean;
    sources: boolean;
  };
  citations: Record<string, string>;
}

const PDFDocument: React.FC<PDFDocumentProps> = ({
  summary,
  paragraphs,
  ontology,
  options,
  citations,
}) => {
  const currentDate = new Date().toLocaleDateString();

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverTitle}>
          {summary?.title || "Legal Document Report"}
        </Text>
        <Text style={styles.coverSubtitle}>Generated on {currentDate}</Text>
      </Page>

      {/* Main Content */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {summary?.title || "Legal Document Summary"}
          </Text>
          <Text style={styles.metadata}>Generated on {currentDate}</Text>
        </View>

        {/* Summary Section */}
        {options.summary && summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            {summary.summary.map((part, index) => (
              <Text key={index} style={styles.summaryText}>
                {part.text}
                {part.sourceParagraphs.map((id) => (
                  <Text key={id} style={styles.citation}>
                    [{citations[id] || id}]
                  </Text>
                ))}
              </Text>
            ))}
          </View>
        )}

        {/* Key Data Section */}
        {options.keyData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Legal Information</Text>

            {ontology.definitions.length > 0 && (
              <View>
                <Text style={styles.ontologyCategory}>Definitions</Text>
                {ontology.definitions.map((def, index) => (
                  <Text
                    key={index}
                    style={[styles.ontologyItem, styles.highlightDefinition]}
                  >
                    • {def}
                  </Text>
                ))}
              </View>
            )}

            {ontology.obligations.length > 0 && (
              <View>
                <Text style={styles.ontologyCategory}>Obligations</Text>
                {ontology.obligations.map((obl, index) => (
                  <Text
                    key={index}
                    style={[styles.ontologyItem, styles.highlightObligation]}
                  >
                    • {obl}
                  </Text>
                ))}
              </View>
            )}

            {ontology.rights.length > 0 && (
              <View>
                <Text style={styles.ontologyCategory}>Rights</Text>
                {ontology.rights.map((right, index) => (
                  <Text
                    key={index}
                    style={[styles.ontologyItem, styles.highlightRight]}
                  >
                    • {right}
                  </Text>
                ))}
              </View>
            )}

            {ontology.parties.length > 0 && (
              <View>
                <Text style={styles.ontologyCategory}>Parties</Text>
                {ontology.parties.map((party, index) => (
                  <Text key={index} style={styles.ontologyItem}>
                    • {party}
                  </Text>
                ))}
              </View>
            )}

            {ontology.dates.length > 0 && (
              <View>
                <Text style={styles.ontologyCategory}>Important Dates</Text>
                {ontology.dates.map((date, index) => (
                  <Text key={index} style={styles.ontologyItem}>
                    • {date}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Sources Section */}
        {options.sources && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Source Documents</Text>
            {paragraphs.map((para, index) => (
              <View key={para.id} style={styles.sourceItem} wrap={false}>
                <Text style={styles.sourceId}>
                  [{citations[para.id] || index + 1}]{" "}
                  {para.sectionTitle ? `- ${para.sectionTitle}` : ""}
                </Text>
                <Text style={styles.sourceText}>{para.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Minimal Banner */}
        <View style={styles.banner}>
          <Image src="/logo.png" style={styles.bannerLogo} />
          <Link src="https://ayana.legal">
            <Text>Generated by Ayana Legal Summarizer</Text>
          </Link>
        </View>

        {/* Footer with page numbers */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
};

export default PDFDocument;
