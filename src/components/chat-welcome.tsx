import { BrainCircuit } from 'lucide-react';

export function ChatWelcome() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        <BrainCircuit className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-headline font-bold mb-2">Welcome to Arin</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Your AI-powered legal assistant. How can I help you today?
        </p>
      </div>
    </div>
  )
}
