import { ChevronDown, ChevronUp, FileText, Tag, Link as LinkIcon, ExternalLink } from "lucide-react";
import { useState } from "react";
import { ChatSource } from "./ChatMessage";

interface SourceCardProps {
  source: ChatSource;
}

export default function SourceCard({ source }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getCategoryTheme = (category?: string) => {
    switch (category) {
      case "APPROVAL":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "SAFETY":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "REIMBURSEMENT":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  return (
    <div className={`group border border-white/5 rounded-2xl bg-card/30 overflow-hidden transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-glow ${expanded ? "ring-1 ring-primary/20" : ""}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {source.documentName}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">
                Source Reference
              </span>
              <span className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground">
                p.{source.page}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
          {source.category && (
            <span
              className={`text-[9px] px-2 py-1 rounded-full border font-bold tracking-tighter ${getCategoryTheme(
                source.category
              )}`}
            >
              {source.category}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground transition-transform" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-white/5 bg-black/20 animate-pop-in">
          <div className="flex items-center gap-2 mt-4 mb-3">
            <LinkIcon className="w-3 h-3 text-primary/60" />
            <span className="text-xs font-medium text-muted-foreground/80 break-all">{source.source}</span>
          </div>

          {source.snippet && (
            <div className="bg-background/40 rounded-xl p-4 border border-white/5 relative overflow-hidden group/snippet">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40" />
              <p className="text-[13px] text-muted-foreground italic leading-relaxed">
                "{source.snippet}"
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">
              <span>View Full Record</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
