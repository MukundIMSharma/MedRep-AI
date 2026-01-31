import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, HelpCircle } from "lucide-react";
import ChatMessage, { ChatMessageType } from "@/components/ChatMessage";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const EXAMPLE_QUERIES = [
  "Is paracetamol approved for fever in India?",
  "What are the contraindications for metformin?",
  "Is chemotherapy covered under Ayushman Bharat?",
  "What is the approved dosage for azithromycin?",
];

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your Digital Medical Representative AI. I can help you with:\n\n• **Drug Approvals** - CDSCO labels, indications, dosage\n• **Safety Information** - Contraindications, side effects, warnings\n• **Reimbursement** - Ayushman Bharat coverage, PMJAY eligibility\n\nAll my answers are based on verified Indian sources. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessageType = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await apiClient<{
        answer: string;
        sources: ChatMessageType["sources"];
        classification: ChatMessageType["classification"];
        foundInSources: boolean;
      }>("/rag/chat", {
        method: "POST",
        body: JSON.stringify({ query: userMessage.content }),
      });

      const aiMessage: ChatMessageType = {
        role: "assistant",
        content: response.data.answer,
        sources: response.data.sources,
        classification: response.data.classification,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessageType = {
        role: "assistant",
        content:
          "I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (query: string) => {
    setInput(query);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}

          {loading && (
            <div className="flex gap-4 p-6 animate-fade-in">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center gradient-primary shadow-glow animate-pulse-ring">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching verified sources...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Example Queries - Show only for first message */}
      {messages.length === 1 && (
        <div className="border-t border-border/50 bg-muted/20 py-4 animate-fade-in">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <HelpCircle className="w-4 h-4" />
              <span>Try asking:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(query)}
                  className="text-sm px-3 py-2 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border glass p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about drug approvals, safety info, or reimbursement..."
                className="min-h-[52px] max-h-[200px] resize-none pr-4"
                disabled={loading}
                rows={1}
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              size="icon"
              className="h-[52px] w-[52px] gradient-primary shadow-glow shrink-0"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            MedRep AI provides information from verified sources only. Always consult a healthcare professional.
          </p>
        </form>
      </div>
    </div>
  );
}
