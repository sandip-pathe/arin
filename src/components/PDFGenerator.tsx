// PDFGenerator.tsx
import React, { Fragment } from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { Paragraph, SummaryItem, Ontology } from "@/types/page";

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 20 },
  title: { fontSize: 20, marginBottom: 10, fontWeight: "bold" },
  subtitle: { fontSize: 16, marginBottom: 8, fontWeight: "bold" },
  text: { fontSize: 12, marginBottom: 5 },
  ontologyItem: { marginBottom: 4, fontSize: 10 },
  reference: { fontSize: 10, marginTop: 3 },
});

type PDFOptions = {
  summary: boolean;
  keyData: boolean;
  sources: boolean;
};

type PDFGeneratorProps = {
  summaries: SummaryItem[];
  paragraphs: Paragraph[];
  ontology: Ontology;
  options: PDFOptions;
  citations: Record<string, string>;
};

export default function PDFGenerator({
  summaries,
  paragraphs,
  ontology,
  options,
  citations,
}: PDFGeneratorProps) {
  const chunkSize = 10;
  const summaryChunks = [];
  for (let i = 0; i < summaries.length; i += chunkSize) {
    summaryChunks.push(summaries.slice(i, i + chunkSize));
  }

  const paragraphChunks = [];
  for (let i = 0; i < paragraphs.length; i += chunkSize) {
    paragraphChunks.push(paragraphs.slice(i, i + chunkSize));
  }

  return (
    <Document>
      {options.summary &&
        summaryChunks.map((chunk, chunkIndex) => (
          <Page key={chunkIndex} style={styles.page}>
            <View style={styles.section}>
              <Text style={styles.title}>Document Summary</Text>
              {chunk.map((summary, idx) => (
                <Fragment key={idx}>
                  <Text style={styles.subtitle}>
                    Part {chunkIndex * chunkSize + idx + 1}
                  </Text>
                  {summary.summary.map((part, partIdx) => (
                    <Text key={partIdx} style={styles.text}>
                      {part.text}
                    </Text>
                  ))}
                </Fragment>
              ))}
            </View>
          </Page>
        ))}

      {options.keyData && (
        <Page style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.title}>Key Data</Text>
            {Object.entries(ontology).map(
              ([key, values]) =>
                values.length > 0 && (
                  <View key={key} style={styles.section}>
                    <Text style={styles.subtitle}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                    {values.map((value, i) => (
                      <Text key={i} style={styles.ontologyItem}>
                        {typeof value === "string"
                          ? value
                          : JSON.stringify(value, null, 2)}
                      </Text>
                    ))}
                  </View>
                )
            )}
          </View>
        </Page>
      )}

      {options.sources &&
        paragraphChunks.map((chunk, chunkIndex) => (
          <Page key={chunkIndex} style={styles.page}>
            <View style={styles.section}>
              <Text style={styles.title}>References</Text>
              {chunk.map((para, idx) => (
                <View key={para.id} style={styles.section}>
                  <Text style={styles.subtitle}>
                    Reference {chunkIndex * chunkSize + idx + 1}
                  </Text>
                  <Text style={styles.text}>{para.text}</Text>
                  <Text style={styles.reference}>
                    {citations[para.id] || "No citation available"}
                  </Text>
                </View>
              ))}
            </View>
          </Page>
        ))}
    </Document>
  );
}
