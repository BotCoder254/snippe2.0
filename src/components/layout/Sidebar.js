import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, Home, FileText, Heart, Library, Plus, 
  Search, Tag, HelpCircle, Settings, LogOut, 
  Menu, X, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, profile, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Snippets', href: '/my-snippets', icon: FileText },
    { name: 'Favorites', href: '/favorites', icon: Heart },
    { name: 'Collections', href: '/collections', icon: Library },
  ];

  const secondaryNavigation = [
    { name: 'Browse Public', href: '/browse', icon: Search },
    { name: 'Tags', href: '/tags', icon: Tag },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark">
        <Link to="/dashboard" className="flex items-center space-x-3">
          <Code2 className="h-8 w-8 text-primary-light dark:text-primary-dark" />
          <span className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
            SNIPPE2.0
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 rounded-xl hover:bg-background-light dark:hover:bg-background-dark"
        >
          <X className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark" />
        </button>
      </div>

      {/* Create Button */}
      <div className="p-6">
        <Link to="/create">
          <Button size="lg" className="w-full">
            <Plus className="h-5 w-5 mr-2" />
            New Snippet
          </Button>
        </Link>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors
                ${isActive(item.href)
                  ? 'bg-primary-light text-white dark:bg-primary-dark'
                  : 'text-text-primary-light hover:bg-background-light dark:text-text-primary-dark dark:hover:bg-background-dark'
                }
              `}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}

        <div className="pt-6 border-t border-border-light dark:border-border-dark mt-6">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors
                  ${isActive(item.href)
                    ? 'bg-primary-light text-white dark:bg-primary-dark'
                    : 'text-text-secondary-light hover:bg-background-light dark:text-text-secondary-dark dark:hover:bg-background-dark'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Admin Link */}
        {profile?.role === 'admin' && (
          <div className="pt-4">
            <Link
              to="/admin"
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors
                ${isActive('/admin')
                  ? 'bg-warning-light text-white dark:bg-warning-dark'
                  : 'text-warning-light hover:bg-background-light dark:text-warning-dark dark:hover:bg-background-dark'
                }
              `}
            >
              <Shield className="h-5 w-5 mr-3" />
              Admin Panel
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="p-6 border-t border-border-light dark:border-border-dark space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Theme
          </span>
          <ThemeToggle />
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary-light dark:bg-primary-dark rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {profile?.displayName?.charAt(0) || user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate">
              {profile?.displayName || user?.name}
            </p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">
              @{profile?.handle || 'user'}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Link to="/settings" className="flex-1">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark z-50"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;