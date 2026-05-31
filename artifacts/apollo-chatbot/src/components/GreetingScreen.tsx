import { motion } from "framer-motion";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GreetingScreenProps {
  onNext: () => void;
}

export function GreetingScreen({ onNext }: GreetingScreenProps) {
  return (
    <motion.div 
      className="flex-1 flex flex-col items-center justify-center p-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-8 shadow-lg">
        <GraduationCap className="w-12 h-12 text-secondary" />
      </div>
      <h1 className="text-sm font-bold tracking-widest text-primary uppercase mb-4">
        Apollo University
      </h1>
      <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
        Hi! Welcome to Apollo University Smart Assistant
      </h2>
      <p className="text-muted-foreground text-lg mb-12 max-w-md">
        I can help you with syllabus, academic calendar, exam rules and more!
      </p>
      
      <Button 
        size="lg" 
        onClick={onNext}
        className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all group"
        data-testid="button-get-started"
      >
        Get Started
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Button>
    </motion.div>
  );
}
