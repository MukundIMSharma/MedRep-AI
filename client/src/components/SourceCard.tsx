import { ChevronDown, ChevronUp, FileText, Tag } from "lucide-react";
import { useState } from "react";
import { ChatSource } from "./ChatMessage";

interface SourceCardProps {
  source: ChatSource;
}

export default function SourceCard({ source }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "APPROVAL":
        return "text-primary bg-primary/10 border-primary/20";
      case "SAFETY":
        return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case "REIMBURSEMENT":
        return "text-secondary bg-secondary/10 border-secondary/20";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  return (
    <div className="border border-border rounded-lg bg-card/50 overflow-hidden transition-all hover:border-primary/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary flex-shrink-0">
            <FileText className="w-3 h-3" />
          </div>
          <span className="text-sm font-medium text-foreground truncate">
            {source.documentName}
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            p.{source.page}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {source.category && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded border ${getCategoryColor(
                source.category
              )}`}
            >
              {source.category}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-border/50 bg-muted/20 animate-fade-in">
          <div className="flex items-center gap-2 mt-3 mb-2">
            <Tag className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{source.source}</span>
          </div>
          {source.snippet && (
            <div className="bg-background/50 rounded-md p-3 border border-border/50">
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                "{source.snippet}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
