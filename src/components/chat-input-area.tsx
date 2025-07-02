'use client'

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Paperclip, Link, Camera, ArrowUp, Sparkles } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

export function ChatInputArea() {
  return (
    <div className="p-4 bg-transparent">
      <Card className="rounded-2xl shadow-2xl shadow-primary/10">
        <CardContent className="p-2 md:p-4">
          <div className="relative">
            <Textarea
              placeholder="Paste text, upload a file, or ask a question..."
              className="min-h-[80px] w-full rounded-xl border-2 border-input bg-background pr-24 pl-12 py-4 resize-none focus-visible:ring-primary"
            />
            <div className="absolute left-3 top-4 flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8 hover:text-primary">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload File</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8 hover:text-primary">
                      <Link className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add Link</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8 hover:text-primary">
                      <Camera className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Capture Image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Button size="icon" className="rounded-full h-10 w-10">
                <ArrowUp className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Summarize</Button>
              <Button variant="outline" size="sm">Info Extract</Button>
              <Button variant="outline" size="sm">Visualize</Button>
            </div>
            <div className="hidden md:flex flex-grow" />
            <Select defaultValue="indian-law">
              <SelectTrigger className="w-full md:w-[150px] text-xs h-9">
                <SelectValue placeholder="Jurisdiction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indian-law">Indian Law</SelectItem>
                <SelectItem value="us-law">US Law</SelectItem>
                <SelectItem value="eu-law">EU Law</SelectItem>
                <SelectItem value="trade-law">Trade Law</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="auto">
              <SelectTrigger className="w-full md:w-[150px] text-xs h-9">
                <Sparkles className="mr-2 h-4 w-4 text-accent" />
                <SelectValue placeholder="Response Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">Fast Answer</SelectItem>
                <SelectItem value="slow">Slow Thinking</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
