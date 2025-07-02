import { BrainCircuit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ChatWelcome() {
  const suggestions = [
    "Summarize the key points of the attached document.",
    "Compare privacy laws in the US and EU.",
    "Draft a non-disclosure agreement.",
    "Explain 'force majeure' in contract law.",
  ]

  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        <BrainCircuit className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-headline font-bold mb-2">Welcome to Arin</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Your AI-powered legal assistant. How can I help you today?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((text, i) => (
            <Card key={i} className="text-left hover:bg-card/80 cursor-pointer transition-colors shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm font-medium">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
