import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

interface InstantSkimDisplayProps {
  skimText: string;
}

const InstantSkimDisplay = ({ skimText }: InstantSkimDisplayProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="p-6 max-w-3xl w-full justify-start space-y-1">
      <Collapsible
        key={"instant-skim-collapsible"}
        open={isOpen}
        onOpenChange={() => setIsOpen(!isOpen)}
        className="border-none bg-white/60 backdrop-blur-sm hover:shadow-md rounded-xl transition-shadow"
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full px-5 py-4">
          <div className="flex items-center select-none gap-1">
            <span className="font-logo text-xl font-bold tracking-tighter text-primary">
              Anaya
            </span>
            <h3 className="font-logo text-xl font-bold tracking-tighter text-gray-500">
              Instant Skim
            </h3>
          </div>
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent className="px-6 pb-5 space-y-2">
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                key="skim-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="py-3 text-gray-500 text-xs sm:text-sm leading-relaxed"
              >
                {skimText}
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default InstantSkimDisplay;
