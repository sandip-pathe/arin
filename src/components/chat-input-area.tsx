'use client'

import { useRef, useState } from 'react';
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Paperclip, Link, Camera, ArrowUp, Settings, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useToast } from '@/hooks/use-toast';
import { extractText } from '@/lib/file-utils';


export function ChatInputArea() {
  const [inputText, setInputText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('indian-law');
  const [selectedResponseType, setSelectedResponseType] = useState('auto');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await extractText(file);
      setInputText(prev => prev ? `${prev}\n\n---\n\n${text}` : text);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error reading file",
        description: error.message,
      });
    } finally {
      // Reset the file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const actionOptions = ['Summarize', 'Info Extract', 'Visualize'];
  const jurisdictionOptions = [
    { value: 'indian-law', label: 'Indian Law' },
    { value: 'us-law', label: 'US Law' },
    { value: 'eu-law', label: 'EU Law' },
    { value: 'trade-law', label: 'Trade Law' },
  ];
  const responseTypeOptions = [
    { value: 'fast', label: 'Fast Answer' },
    { value: 'slow', label: 'Slow Thinking' },
    { value: 'auto', label: 'Auto' },
  ];

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        className="hidden" 
        accept=".pdf,.doc,.docx,.txt,.md,.xlsx"
      />
      <Card className="flex-1 bg-white rounded-2xl border-2 border-gray-400 border-dashed mt-8 shadow-none">
        <CardContent className="p-2 md:p-4">
          <div className="relative pb-8">
            <Textarea
              autoFocus
              placeholder="Paste text, upload a file, or ask a question..."
              className="min-h-[180px] bg-white border-none w-full resize-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{ 
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
            />
            <div className="absolute bottom-0 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground h-10 w-10" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload File</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground h-10 w-10 hover:text-primary">
                        <Link className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add Link</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground h-10 w-10 hover:text-primary">
                        <Camera className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Capture Image</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground h-10 w-10 hover:text-primary"
                        onClick={() => setIsModalOpen(true)}
                      >
                        <Settings className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Customize</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button size="icon" className="rounded-full h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <ArrowUp className="h-5 w-5 text-white" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customization Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Customize Options</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Action Options */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Action Options</h4>
                <div className="flex flex-wrap gap-2">
                  {actionOptions.map((action) => (
                    <Button
                      key={action}
                      variant={selectedAction === action ? "default" : "outline"}
                      className={
                        selectedAction === action 
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0" 
                          : ""
                      }
                      onClick={() => setSelectedAction(action)}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Jurisdiction Options */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Jurisdiction</h4>
                <div className="flex flex-wrap gap-2">
                  {jurisdictionOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedJurisdiction === option.value ? "default" : "outline"}
                      className={
                        selectedJurisdiction === option.value 
                          ? "bg-gradient-to-r from-green-500 to-teal-500 text-white border-0" 
                          : ""
                      }
                      onClick={() => setSelectedJurisdiction(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Response Type Options */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Response Type</h4>
                <div className="flex flex-wrap gap-2">
                  {responseTypeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedResponseType === option.value ? "default" : "outline"}
                      className={
                        selectedResponseType === option.value 
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0" 
                          : ""
                      }
                      onClick={() => setSelectedResponseType(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
