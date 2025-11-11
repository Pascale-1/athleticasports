import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface SwipeableTabContentProps {
  children: ReactNode;
  activeTab: string;
  tabValue: string;
  swipeOffset: number;
  isSwiping: boolean;
}

export const SwipeableTabContent = ({
  children,
  activeTab,
  tabValue,
  swipeOffset,
  isSwiping,
}: SwipeableTabContentProps) => {
  const isActive = activeTab === tabValue;

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={tabValue}
          initial={{ opacity: 0, x: 50 }}
          animate={{ 
            opacity: 1, 
            x: isSwiping ? swipeOffset * 0.3 : 0 
          }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ 
            duration: isSwiping ? 0 : 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
