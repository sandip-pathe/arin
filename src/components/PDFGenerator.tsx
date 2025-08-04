import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { DocumentChunk, Ontology, SummaryItem } from "@/types/page";
import { DownloadOptions } from "./summaryDisplay";

type PDFGeneratorProps = {
  summaries: SummaryItem[];
  chunks: DocumentChunk[];
  ontology: Ontology;
  options: DownloadOptions;
  citations: Record<string, string>;
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    lineHeight: 1.5,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 10,
    fontWeight: "bold",
    borderBottom: "1px solid #ccc",
    paddingBottom: 5,
  },
  summaryItem: {
    marginBottom: 10,
  },
  citation: {
    fontSize: 10,
    color: "#555",
    marginTop: 5,
    fontStyle: "italic",
  },
  ontologyItem: {
    marginLeft: 10,
    marginBottom: 5,
  },
  ontologyCategory: {
    marginTop: 10,
    fontWeight: "bold",
  },
  sourceItem: {
    marginBottom: 15,
  },
  sourceTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  sourceContent: {
    paddingLeft: 10,
    borderLeft: "2px solid #eee",
    fontSize: 10,
  },
  paragraph: {
    marginBottom: 8,
    textAlign: "justify",
  },
});

export default function PDFGenerator({
  summaries,
  chunks,
  ontology,
  options,
  citations,
}: PDFGeneratorProps) {
  const getChunkById = (id: string) => chunks.find((chunk) => chunk.id === id);

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Document Summary</Text>

        {options.summary && summaries.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Summary</Text>
            {summaries.map((summary, idx) => {
              const chunk = getChunkById(summary.chunkIds);
              const citation = chunk ? citations[chunk.id] : "Unknown Source";

              return (
                <View key={idx} style={styles.summaryItem}>
                  <Text>{summary.summary}</Text>
                  {options.sources && chunk && (
                    <Text style={styles.citation}>{citation}</Text>
                  )}
                </View>
              );
            })}
          </>
        )}

        {options.keyData && (
          <>
            <Text style={styles.sectionTitle}>Key Data</Text>
            {Object.entries(ontology)
              .filter(([_, values]) => values.length > 0)
              .map(([key, values]) => (
                <View key={key}>
                  <Text style={styles.ontologyCategory}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}:
                  </Text>
                  {values.map((value, i) => (
                    <Text key={i} style={styles.ontologyItem}>
                      • {value}
                    </Text>
                  ))}
                </View>
              ))}
          </>
        )}

        {options.sources && chunks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Source Documents</Text>
            <Text style={styles.sectionTitle}>References</Text>
            {chunks.map((chunk, index) => (
              <View key={chunk.id} style={styles.sourceItem} wrap={false}>
                <Text style={styles.sourceTitle}>
                  [{index + 1}] {chunk.documentName || "Untitled Document"}
                </Text>
                {chunk.content.split("\n\n").map((paragraph, pIndex) => (
                  <Text key={pIndex} style={styles.paragraph}>
                    {paragraph}
                  </Text>
                ))}
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}
