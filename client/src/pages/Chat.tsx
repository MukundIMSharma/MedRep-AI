import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, HelpCircle, ShieldCheck, Search } from "lucide-react";
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
        "Hello! I'm your Digital Medical Representative AI. I can help you navigate through drug approvals, safety clinical data, and healthcare reimbursement schemes.\n\nAll my answers are based on verified Indian sources (CDSCO, NHA, IRDAI). How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    const userMessage: ChatMessageType = { role: "user", content: queryText };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await apiClient<{
        answer: string;
        sources: ChatMessageType["sources"];
        classification: ChatMessageType["classification"];
        suggestedQuestions?: string[];
        foundInSources: boolean;
      }>("/rag/chat", {
        method: "POST",
        body: JSON.stringify({ query: queryText }),
      });

      const aiMessage: ChatMessageType = {
        role: "assistant",
        content: response.data.answer,
        sources: response.data.sources,
        classification: response.data.classification,
        suggestedQuestions: response.data.suggestedQuestions,
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
      setIsTyping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendQuery(input);
    setInput("");
  };

  const handleSuggestedClick = (question: string) => {
    sendQuery(question);
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
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_15%)]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pt-4">
        <div className="max-w-4xl mx-auto px-4">
          {messages.length === 1 && (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-pop-in">
              <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center shadow-glow mb-6 ring-8 ring-primary/5">
                <ShieldCheck className="w-10 h-10 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Welcome, {user?.fullname?.split(' ')[0] || 'Doctor'}
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Your clinical context is ready. Ask about any regulation or scheme in the Indian healthcare landscape.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-4">
                {EXAMPLE_QUERIES.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(query)}
                    className="p-4 rounded-2xl bg-card border border-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all text-left text-sm group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary/60">Case Study 0{index + 1}</span>
                      <Search className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              onSuggestedClick={handleSuggestedClick}
            />
          ))}

          {loading && (
            <div className="flex gap-4 p-6 animate-pop-in">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center gradient-primary shadow-glow ring-4 ring-primary/10 animate-pulse-subtle">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-1.5 h-6">
                  <div className="typing-dot" style={{ animationDelay: '0s' }} />
                  <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
                  <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse">Consulting Verified Sources...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative border-t border-white/5 bg-card/40 backdrop-blur-3xl p-6">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000"></div>

          <form onSubmit={handleSubmit} className="relative flex gap-3 items-end">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask clinical queries (e.g., 'PM-JAY eligibility for oncology')..."
                className="min-h-[56px] max-h-[200px] resize-none pr-4 bg-background/80 border-white/10 focus:border-primary/50 text-[15px] rounded-2xl transition-all"
                disabled={loading}
                rows={1}
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              size="icon"
              className="h-[56px] w-[56px] rounded-2xl gradient-primary shadow-glow shrink-0 hover:scale-105 active:scale-95 transition-all"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>

          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3 text-primary" />
              <span>Regulatory Safety Filter Active</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
              Verified Medical Database v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
