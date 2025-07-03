import { BrainCircuit } from 'lucide-react';

export function ChatWelcome() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-headline font-bold mb-4 mt-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Welcome User
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Your AI-powered legal assistant. How can I help you today?
        </p>
      </div>
    </div>
  )
}
