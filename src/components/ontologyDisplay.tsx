// OntologyDisplay.tsx
import React, { useState } from "react";
import { Ontology } from "@/types/page";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { FaStarOfLife } from "react-icons/fa";

type OntologyDisplayProps = {
  ontology: Ontology;
};

// Define the desired sequence of ontology categories
const ONTOLOGY_SEQUENCE = [
  "parties",
  "obligations",
  "rights",
  "conditions",
  "clauses",
  "definitions",
  "dates",
  "proceduralPosture",
  "courtAndJudges",
  "conflicts",
  "implications",
  "citationsAndPrecedents",
] as const;

export default function OntologyDisplay({ ontology }: OntologyDisplayProps) {
  // Filter and order ontology categories according to sequence
  const orderedOntology = ONTOLOGY_SEQUENCE.filter(
    (key) => ontology[key]?.length > 0
  ).map((key) => ({
    key,
    values: ontology[key],
    title: key.charAt(0).toUpperCase() + key.slice(1),
  }));

  // Track which sections are open (first one open by default)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => {
      const initialOpen: Record<string, boolean> = {};
      if (orderedOntology.length > 0) {
        initialOpen[orderedOntology[0].key] = true;
      }
      return initialOpen;
    }
  );

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (orderedOntology.length === 0) return null;

  return (
    <div className="p-6 max-w-3xl w-full justify-start space-y-1">
      {orderedOntology.map(({ key, values, title }) => (
        <Collapsible
          key={key}
          open={openSections[key]}
          onOpenChange={() => toggleSection(key)}
          className="border-b bg-white/60 backdrop-blur-sm hover:shadow-md rounded-xl transition-shadow"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                <FaStarOfLife className="w-3 h-3 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-gray-900">
                {title}
                <span className="text-sm text-gray-500 ml-2 font-normal">
                  {values.length}
                </span>
              </h3>
            </div>
            {openSections[key] ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </CollapsibleTrigger>

          <CollapsibleContent className="px-6 pb-5 space-y-2">
            {values.map((value, i) => (
              <div key={i} className="text-sm p-2 rounded-xl ...">
                {typeof value === "string" || typeof value === "number" ? (
                  <p className="text-gray-700 leading-relaxed">
                    {String(value)}
                  </p>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(value ?? {}).map(([k, v]) => (
                      <p key={k}>
                        <span className="font-medium capitalize text-gray-800">
                          {k}:
                        </span>{" "}
                        <span className="text-gray-600">{String(v)}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
