import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GreetingScreen } from "./components/GreetingScreen";
import { SchoolSelectionScreen } from "./components/SchoolSelectionScreen";
import { ProgrammeSelectionScreen } from "./components/ProgrammeSelectionScreen";
import { ChatScreen } from "./components/ChatScreen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { School, Branch } from "@workspace/api-client-react/src/generated/api.schemas";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient();

export type ScreenState = "greeting" | "schools" | "branches" | "chat";

export interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  sources?: string[];
}

function ChatbotApp() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>("greeting");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-card rounded-2xl shadow-xl overflow-hidden flex flex-col h-[85vh] sm:h-[800px] border border-border">
        <AnimatePresence mode="wait">
          {currentScreen === "greeting" && (
            <GreetingScreen 
              key="greeting" 
              onNext={() => setCurrentScreen("schools")} 
            />
          )}
          {currentScreen === "schools" && (
            <SchoolSelectionScreen 
              key="schools" 
              onSelect={(school) => {
                setSelectedSchool(school);
                setCurrentScreen("branches");
              }} 
            />
          )}
          {currentScreen === "branches" && selectedSchool && (
            <ProgrammeSelectionScreen 
              key="branches"
              school={selectedSchool}
              onBack={() => setCurrentScreen("schools")}
              onSelect={(branch) => {
                setSelectedBranch(branch);
                setCurrentScreen("chat");
              }} 
            />
          )}
          {currentScreen === "chat" && selectedSchool && selectedBranch && (
            <ChatScreen 
              key="chat"
              school={selectedSchool}
              branch={selectedBranch}
              messages={messages}
              setMessages={setMessages}
              onBack={() => setCurrentScreen("branches")}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatbotApp />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
