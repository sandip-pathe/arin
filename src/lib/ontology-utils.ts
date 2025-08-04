import { Ontology, SummaryItem } from "@/types/page";

export function mergeOntology(summaries: SummaryItem[]): Ontology {
  return summaries.reduce(
    (acc, summary) => {
      Object.keys(summary.legalOntology).forEach((key) => {
        const k = key as keyof Ontology;
        const uniqueValues = [
          ...new Set([...acc[k], ...summary.legalOntology[k]]),
        ];
        acc[k] = uniqueValues;
      });
      return acc;
    },
    {
      definitions: [] as string[],
      obligations: [] as string[],
      rights: [] as string[],
      conditions: [] as string[],
      clauses: [] as string[],
      dates: [] as string[],
      parties: [] as string[],
    } as Ontology
  );
}
