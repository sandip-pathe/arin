import React from "react";
import { Ontology } from "@/types/page";
import { ONTOLOGY_COLORS } from "@/lib/data";

type OntologyDisplayProps = {
  ontology: Ontology;
};

export default function OntologyDisplay({ ontology }: OntologyDisplayProps) {
  const nonEmptyOntology = Object.entries(ontology)
    .filter(([_, values]) => values.length > 0)
    .map(([key, values]) => ({
      key: key as keyof Ontology,
      values,
      title: key.charAt(0).toUpperCase() + key.slice(1),
      color: ONTOLOGY_COLORS[key as keyof Ontology],
    }));

  const sortedOntology = [...nonEmptyOntology].sort(
    (a, b) => b.values.length - a.values.length
  );

  if (nonEmptyOntology.length === 0) return null;

  return (
    <div className="bg-white rounded-md p-4 max-w-4xl gap-6 grid grid-cols-1 md:grid-cols-2">
      {sortedOntology.map(({ key, values, title, color }) => (
        <div key={key} className="w-auto">
          <h3
            className={`text-lg font-semibold mb-2 flex items-center gap-2 ${
              key === "definitions"
                ? "text-blue-600"
                : key === "obligations"
                ? "text-green-600"
                : key === "rights"
                ? "text-yellow-600"
                : key === "conditions"
                ? "text-purple-600"
                : key === "clauses"
                ? "text-pink-600"
                : key === "dates"
                ? "text-indigo-600"
                : "text-teal-600"
            }`}
          >
            <div className="w-3 h-3 rounded-full bg-current" />
            {title}
          </h3>
          <ul className="space-y-1 pl-1">
            {values.map((value, i) => (
              <li key={i} className="leading-relaxed">
                <span
                  className={`inline-block text-sm rounded-none px-2 bg-opacity-30 ${
                    key === "definitions"
                      ? "bg-blue-200 dark:bg-blue-800"
                      : key === "obligations"
                      ? "bg-green-200 dark:bg-green-800"
                      : key === "rights"
                      ? "bg-yellow-200 dark:bg-yellow-800"
                      : key === "conditions"
                      ? "bg-purple-200 dark:bg-purple-800"
                      : key === "clauses"
                      ? "bg-pink-200 dark:bg-pink-800"
                      : key === "dates"
                      ? "bg-indigo-200 dark:bg-indigo-800"
                      : "bg-teal-200 dark:bg-teal-800"
                  }`}
                >
                  {value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
