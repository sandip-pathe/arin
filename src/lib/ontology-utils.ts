import { Ontology, SummaryItem } from "@/types/page";

export function mergeOntology(summaries: SummaryItem[]): Ontology {
  // Handle case where summaries might be undefined or not an array
  if (!Array.isArray(summaries)) {
    console.error("mergeOntology: summaries is not an array", summaries);
    return {
      definitions: [],
      obligations: [],
      rights: [],
      conditions: [],
      clauses: [],
      dates: [],
      parties: [],
    };
  }

  return summaries.reduce(
    (acc, summary) => {
      Object.keys(summary.legalOntology).forEach((key) => {
        const k = key as keyof Ontology;
        const uniqueValues = [
          ...new Set([
            ...(acc[k] as string[]),
            ...(summary.legalOntology[k] as string[]),
          ]),
        ];
        acc[k] = uniqueValues as any;
      });
      return acc;
    },
    {
      definitions: [],
      obligations: [],
      rights: [],
      conditions: [],
      clauses: [],
      dates: [],
      parties: [],
    } as Ontology
  );
}
