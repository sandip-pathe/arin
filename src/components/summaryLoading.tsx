import React from "react";
import { Card, CardContent } from "./ui/card";

export default function SummaryLoading() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <Card className="bg-white border-none shadow-none flex-1 min-h-0 overflow-auto">
        <CardContent className="p-4">
          <div className="prose max-w-none dark:prose-invert">
            <div className="space-y-4">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="bg-white rounded-md p-4 max-w-4xl gap-6 grid grid-cols-1 md:grid-cols-2">
        {[...Array(2)].map((_, idx) => (
          <div key={idx} className="w-auto">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <ul className="space-y-1 pl-1">
              {[...Array(3)].map((_, i) => (
                <li key={i}>
                  <span className="inline-block h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
