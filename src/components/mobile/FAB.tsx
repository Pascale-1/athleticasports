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
          "fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-50",
          "bg-gradient-to-r from-primary to-primary/90",
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
