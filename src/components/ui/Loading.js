import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';

const Loading = ({ message = 'Loading...', fullScreen = false }) => {
  const containerClasses = fullScreen 
    ? 'min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block mb-4"
        >
          <Code2 className="h-8 w-8 text-primary-light dark:text-primary-dark" />
        </motion.div>
        <p className="text-text-secondary-light dark:text-text-secondary-dark">
          {message}
        </p>
      </motion.div>
    </div>
  );
};

export default Loading;