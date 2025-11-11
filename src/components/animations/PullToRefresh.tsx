import { motion } from "framer-motion";
import { Loader2, ArrowDown } from "lucide-react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { ReactNode, TouchEvent } from "react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const {
    isRefreshing,
    pullDistance,
    pullProgress,
    shouldShowRefreshIndicator,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = usePullToRefresh({ onRefresh });

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull to refresh indicator */}
      {shouldShowRefreshIndicator && (
        <motion.div
          className="absolute top-0 left-0 right-0 flex items-center justify-center z-50"
          initial={{ opacity: 0, y: -40 }}
          animate={{ 
            opacity: pullProgress,
            y: Math.min(pullDistance - 40, 20)
          }}
          transition={{ duration: 0.1 }}
        >
          <div className="bg-background/95 backdrop-blur-sm rounded-full p-3 shadow-lg border">
            {isRefreshing ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <motion.div
                animate={{ 
                  rotate: pullProgress * 180 
                }}
                transition={{ duration: 0.1 }}
              >
                <ArrowDown className="h-5 w-5 text-primary" />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        animate={{
          y: isRefreshing ? 60 : pullDistance * 0.5,
        }}
        transition={{ 
          duration: isRefreshing ? 0.3 : 0,
          ease: "easeOut"
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
