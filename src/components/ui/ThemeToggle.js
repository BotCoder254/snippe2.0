import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-6 w-11 items-center rounded-full bg-border-light dark:bg-border-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 dark:focus:ring-primary-dark dark:focus:ring-offset-surface-dark"
      aria-label="Toggle theme"
    >
      <motion.span
        className="inline-block h-4 w-4 transform rounded-full bg-surface-light dark:bg-surface-dark shadow-lg flex items-center justify-center"
        animate={{
          x: isDark ? 24 : 4,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        {isDark ? (
          <Moon className="h-2.5 w-2.5 text-text-primary-dark" />
        ) : (
          <Sun className="h-2.5 w-2.5 text-text-primary-light" />
        )}
      </motion.span>
    </button>
  );
};

export default ThemeToggle;