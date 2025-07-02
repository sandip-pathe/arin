import { BrainCircuit } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 p-2">
      <BrainCircuit className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-bold font-headline text-primary group-data-[collapsible=icon]:hidden">
        Arin
      </h1>
    </div>
  );
}
