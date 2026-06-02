import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Sparkles, AlertCircle } from "lucide-react";
import { School, Branch } from "@workspace/api-client-react/src/generated/api.schemas";
import { useSendChatMessage } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Message } from "../App";

interface ChatScreenProps {
  school: School;
  branch: Branch;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onBack: () => void;
}

const SUGGESTIONS: Record<string, string[]> = {
  SOT: [
    'What are the subjects in Semester 1?', 
    'What is the minimum attendance required?', 
    'How is CGPA calculated?', 
    'What are the elective courses available?', 
    'When is Mid Exam 1?', 
    'What are the Programme Outcomes?'
  ],
  SOHS: [
    'What is the course duration?', 
    'What subjects are in first year?', 
    'What is the minimum attendance required?', 
    'What are the career opportunities?', 
    'When are semester exams held?'
  ],
  SOM: [
    'What is the course structure?', 
    'What are the core subjects?', 
    'What is the minimum attendance required?', 
    'What specializations are available?'
  ],
  AIPS: [
    'What is the course duration?', 
    'What are the core pharmacy subjects?', 
    'What is the minimum attendance required?', 
    'What are clinical training requirements?'
  ],
  SOSS: [
    'What is the certificate course about?', 
    'What is the course duration?', 
    'Who can apply?', 
    'What are the learning outcomes?'
  ]
};

export function ChatScreen({ school, branch, messages, setMessages, onBack }: ChatScreenProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { mutate: sendMessage, isPending } = useSendChatMessage();

  const suggestions = SUGGESTIONS[school.shortName] || SUGGESTIONS.SOT;

useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPending]);
  
  const handleSend = (text: string) => {
    if (!text.trim() || isPending) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    sendMessage({
      data: { question: text, branch_id: branch.id, school_id: school.id }
    }, {
      onSuccess: (data) => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: data.answer,
          sources: data.sources
        };
        setMessages((prev) => [...prev, botMessage]);
      },
      onError: () => {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: "Sorry, I encountered an error while trying to fetch the answer. Please try again."
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    });
  };

  const isWarningAnswer = (content: string) => {
    const lower = content.toLowerCase();
    return lower.includes("not available yet") || lower.includes("contact the university");
  };

  return (
    <motion.div 
     className="flex-1 flex flex-col bg-card min-h-0 overflow-hidden"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <header className="flex items-center p-4 border-b border-border bg-card z-10 shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2" data-testid="button-back-to-branches">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Button>
        <div>
          <h2 className="font-bold text-foreground leading-tight">{branch.name}</h2>
          <p className="text-xs text-muted-foreground">{school.name}</p>
        </div>
      </header>

     <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-serif font-bold text-foreground mb-2">How can I help you today?</h3>
            <p className="text-muted-foreground text-sm mb-6">Select a common question below or type your own.</p>
            
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-2 no-scrollbar">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s)}
                  className="shrink-0 max-w-[200px] text-left text-sm px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted transition-colors whitespace-normal"
                  data-testid={`button-suggestion-${i}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-tr-sm" 
                  : isWarningAnswer(msg.content)
                    ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-amber-900 dark:text-amber-200 rounded-tl-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
              }`}
            >
              {msg.role === "bot" && isWarningAnswer(msg.content) && (
                <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Notice</span>
                </div>
              )}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
            </div>
            
            {msg.role === "bot" && msg.sources && msg.sources.length > 0 && (
              <div className="mt-2 text-[11px] text-muted-foreground italic px-2 max-w-[85%]">
                Sources: {msg.sources.join(", ")}
              </div>
            )}
          </motion.div>
        ))}

       {isPending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
            <div className="bg-muted rounded-2xl rounded-tl-sm px-5 py-4 flex gap-1.5 items-center">
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}
      </div>
      <div className="p-4 border-t border-border bg-card shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isPending}
            className="w-full pl-5 pr-14 py-4 rounded-full bg-muted/50 border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm disabled:opacity-50"
            data-testid="input-chat"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!input.trim() || isPending}
            className="absolute right-2 w-10 h-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm disabled:opacity-50 disabled:bg-muted-foreground"
            data-testid="button-send-chat"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
