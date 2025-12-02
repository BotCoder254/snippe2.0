import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X, Code, Tag, User } from 'lucide-react';
import { useSearch, useLanguageOptions } from '../../hooks/useSearch';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBar = ({ onResultSelect, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const languageOptions = useLanguageOptions();

  const {
    query,
    setQuery,
    activeFilters,
    setActiveFilters,
    serverResults,
    isServerLoading,
    highlightText,
    hasQuery
  } = useSearch();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (snippet) => {
    setIsOpen(false);
    setQuery('');
    if (onResultSelect) {
      onResultSelect(snippet);
    } else {
      // Default navigation behavior
      if (snippet.isPublic) {
        navigate(`/s/${snippet.publicId}`);
      } else {
        navigate(`/my-snippets?highlight=${snippet.$id}`);
      }
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams();
      params.set('q', query.trim());
      if (activeFilters.scope !== 'all') params.set('scope', activeFilters.scope);
      if (activeFilters.language !== 'all') params.set('language', activeFilters.language);
      
      navigate(`/search?${params.toString()}`);
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
  };

  const scopeOptions = [
    { value: 'all', label: 'All Snippets', icon: Code },
    { value: 'public', label: 'Public Only', icon: Tag },
    ...(user ? [{ value: 'my', label: 'My Snippets', icon: User }] : [])
  ];

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search snippets..."
          className="w-full pl-10 pr-20 py-2.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-all"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 hover:bg-surface-light dark:hover:bg-surface-dark rounded-lg transition-colors"
            >
              <X className="h-3 w-3 text-text-secondary-light dark:text-text-secondary-dark" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded-lg transition-colors ${
              showFilters || activeFilters.scope !== 'all' || activeFilters.language !== 'all'
                ? 'bg-primary-light dark:bg-primary-dark text-white'
                : 'hover:bg-surface-light dark:hover:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark'
            }`}
          >
            <Filter className="h-3 w-3" />
          </button>
        </div>
      </form>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-lg z-50"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Scope Filter */}
              <div>
                <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  Search Scope
                </label>
                <div className="space-y-1">
                  {scopeOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setActiveFilters(prev => ({ ...prev, scope: option.value }))}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeFilters.scope === option.value
                            ? 'bg-primary-light dark:bg-primary-dark text-white'
                            : 'hover:bg-background-light dark:hover:bg-background-dark text-text-primary-light dark:text-text-primary-dark'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language Filter */}
              <div>
                <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  Language
                </label>
                <select
                  value={activeFilters.language}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                >
                  {languageOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && hasQuery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-lg max-h-96 overflow-y-auto z-50"
          >
            {isServerLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin h-5 w-5 border-2 border-primary-light dark:border-primary-dark border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-2">
                  Searching...
                </p>
              </div>
            ) : serverResults.length > 0 ? (
              <div className="py-2">
                <div className="px-3 py-2 text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark border-b border-border-light dark:border-border-dark flex items-center justify-between">
                  <span>{serverResults.length} result{serverResults.length !== 1 ? 's' : ''} found</span>
                  <button
                    onClick={handleSearchSubmit}
                    className="text-primary-light dark:text-primary-dark hover:underline"
                  >
                    View all
                  </button>
                </div>
                {serverResults.map(snippet => (
                  <button
                    key={snippet.$id}
                    onClick={() => handleResultClick(snippet)}
                    className="w-full px-3 py-3 hover:bg-background-light dark:hover:bg-background-dark transition-colors text-left border-b border-border-light/50 dark:border-border-dark/50 last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 
                          className="font-medium text-text-primary-light dark:text-text-primary-dark truncate"
                          dangerouslySetInnerHTML={{ __html: highlightText(snippet.title, query) }}
                        />
                        {snippet.description && (
                          <p 
                            className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: highlightText(snippet.description, query) }}
                          />
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark">
                            {snippet.language}
                          </span>
                          {snippet.tags?.slice(0, 2).map(tag => (
                            <span 
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-surface-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark"
                              dangerouslySetInnerHTML={{ __html: highlightText(tag, query) }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  No results found for "{query}"
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                  Try different keywords or 
                  <button
                    onClick={handleSearchSubmit}
                    className="text-primary-light dark:text-primary-dark hover:underline ml-1"
                  >
                    search all snippets
                  </button>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;