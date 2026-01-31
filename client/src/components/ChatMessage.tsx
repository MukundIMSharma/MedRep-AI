import { Bot, User as UserIcon, FileText } from "lucide-react";
import SourceCard from "./SourceCard";

export interface ChatSource {
  sourceNumber: number;
  documentName: string;
  page: number;
  source: string;
  category?: string;
  snippet?: string;
}

export interface ChatClassification {
  categories: string[];
  primaryCategory: string;
  confidence: string;
}

export interface ChatMessageType {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  classification?: ChatClassification;
}

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.role === "assistant";

  return (
    <div
      className={`flex gap-4 p-6 ${isAI ? "bg-muted/30" : "flex-row-reverse"
        } animate-fade-in`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isAI
            ? "gradient-primary shadow-glow"
            : "bg-secondary/20 border border-secondary/30"
          }`}
      >
        {isAI ? (
          <Bot className="w-5 h-5 text-primary-foreground" />
        ) : (
          <UserIcon className="w-5 h-5 text-secondary" />
        )}
      </div>

      <div className={`flex-1 max-w-4xl ${!isAI ? "text-right" : ""}`}>
        <div className="font-medium text-sm text-muted-foreground mb-2">
          {isAI ? "MedRep AI" : "You"}
        </div>
        <div className="text-foreground whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>

        {/* Display sources if available */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>Sources ({message.sources.length})</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {message.sources.map((source, idx) => (
                <SourceCard key={idx} source={source} />
              ))}
            </div>
          </div>
        )}

        {/* Display classification info */}
        {message.classification && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Searched:</span>
            {message.classification.categories.map((cat) => (
              <span
                key={cat}
                className="bg-muted px-2 py-1 rounded-md border border-border"
              >
                {cat}
              </span>
            ))}
            {message.classification.confidence && (
              <span className="text-primary/70 ml-2">
                ({message.classification.confidence} confidence)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
