import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import { School, Branch } from "@workspace/api-client-react/src/generated/api.schemas";
import { Button } from "@/components/ui/button";

interface ProgrammeSelectionScreenProps {
  school: School;
  onBack: () => void;
  onSelect: (branch: Branch) => void;
}

export function ProgrammeSelectionScreen({ school, onBack, onSelect }: ProgrammeSelectionScreenProps) {
  return (
    <motion.div 
      className="flex-1 flex flex-col p-6 sm:p-8 overflow-y-auto"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="mb-4 -ml-3 text-muted-foreground hover:text-foreground"
          data-testid="button-back-to-schools"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Schools
        </Button>
        <div className="text-sm font-semibold tracking-wider text-primary uppercase mb-1">
          {school.shortName}
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
          Select your programme
        </h2>
      </div>

      <div className="grid gap-3">
        {school.branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => onSelect(branch)}
            className="group flex items-center gap-4 p-4 bg-card hover:bg-primary border border-border hover:border-primary rounded-xl text-left transition-all shadow-sm hover:shadow-md"
            data-testid={`button-branch-${branch.id}`}
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
              <BookOpen className="w-4 h-4 text-primary group-hover:text-primary-foreground" />
            </div>
            <span className="font-medium text-foreground group-hover:text-primary-foreground transition-colors">
              {branch.name}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
