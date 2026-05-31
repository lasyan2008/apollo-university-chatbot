import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { useListSchools } from "@workspace/api-client-react";
import { School } from "@workspace/api-client-react/src/generated/api.schemas";

interface SchoolSelectionScreenProps {
  onSelect: (school: School) => void;
}

export function SchoolSelectionScreen({ onSelect }: SchoolSelectionScreenProps) {
  const { data: schools, isLoading, error } = useListSchools();

  return (
    <motion.div 
      className="flex-1 flex flex-col p-6 sm:p-8 overflow-y-auto"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">
          Which school are you interested in?
        </h2>
        <p className="text-muted-foreground">
          Select your school to see available programmes.
        </p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-destructive p-4 bg-destructive/10 rounded-lg">
          Failed to load schools. Please try again.
        </div>
      ) : (
        <div className="grid gap-4">
          {schools?.map((school) => (
            <button
              key={school.id}
              onClick={() => onSelect(school)}
              className="group flex items-start gap-4 p-5 bg-card hover:bg-muted border border-border hover:border-primary/50 rounded-xl text-left transition-all shadow-sm hover:shadow-md"
              data-testid={`button-school-${school.id}`}
            >
              <div className="mt-1 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Building2 className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  {school.shortName}
                </h3>
                <p className="text-sm text-muted-foreground mb-1">{school.name}</p>
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-foreground">
                  {school.branches.length} Programmes
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
