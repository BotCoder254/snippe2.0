import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';

const SearchNotification = ({ 
  show, 
  onRefresh, 
  onDismiss, 
  message = "New results available" 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  const handleRefresh = () => {
    setIsVisible(false);
    onRefresh?.();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-4 right-4 z-50 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-lg p-4 max-w-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-info-light/10 dark:bg-info-dark/10 rounded-lg">
                <RefreshCw className="h-4 w-4 text-info-light dark:text-info-dark" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  {message}
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  Click to refresh and see updates
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2 mt-3">
            <button
              onClick={handleRefresh}
              className="flex-1 px-3 py-2 bg-info-light dark:bg-info-dark text-white text-sm rounded-lg hover:bg-info-light/90 dark:hover:bg-info-dark/90 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark text-sm hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchNotification;