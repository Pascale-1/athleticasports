import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FABProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}

export const FAB = ({ icon, label, onClick, className }: FABProps) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.5
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={onClick}
        className={cn(
          "fixed bottom-16 right-4 h-12 w-12 rounded-full shadow-lg z-50",
          "bg-primary",
          "md:hidden",
          className
        )}
        size="icon"
        aria-label={label}
      >
        {icon}
      </Button>
    </motion.div>
  );
};
