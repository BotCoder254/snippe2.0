import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearch, useLanguageOptions } from '../hooks/useSearch';
import { useUserSnippets } from '../hooks/useSnippets';
import { useAuth } from '../contexts/AuthContext';
import SnippetCard from '../components/snippets/SnippetCard';
import SearchNotification from '../components/ui/SearchNotification';
import Loading from '../components/ui/Loading';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showNotification, setShowNotification] = useState(false);
  const [lastResultCount, setLastResultCount] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const languageOptions = useLanguageOptions();

  const initialQuery = searchParams.get('q') || '';
  const initialScope = searchParams.get('scope') || 'all';
  const initialLanguage = searchParams.get('language') || 'all';

  const {
    query,
    setQuery,
    activeFilters,
    setActiveFilters,
    serverResults,
    isServerLoading,
    filterSnippets,
    highlightText,
    hasQuery
  } = useSearch(initialQuery, {
    scope: initialScope,
    language: initialLanguage
  });

  // Get user snippets for client-side filtering
  const { data: userSnippets = [] } = useUserSnippets(user?.$id, true);

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (activeFilters.scope !== 'all') params.set('scope', activeFilters.scope);
    if (activeFilters.language !== 'all') params.set('language', activeFilters.language);
    
    setSearchParams(params);
  }, [query, activeFilters, setSearchParams]);

  // Get filtered results based on scope
  const getFilteredResults = () => {
    if (!hasQuery) return [];

    if (activeFilters.scope === 'my') {
      return filterSnippets(userSnippets);
    } else if (activeFilters.scope === 'public') {
      return serverResults;
    } else {
      // Combine user snippets and server results for 'all'
      const filteredUserSnippets = filterSnippets(userSnippets);
      const combined = [...filteredUserSnippets, ...serverResults];
      
      // Remove duplicates (in case user has public snippets)
      const unique = combined.filter((item, index, self) => 
        index === self.findIndex(t => t.$id === item.$id)
      );
      
      return unique;
    }
  };

  const results = getFilteredResults();
  const isLoading = isServerLoading && activeFilters.scope !== 'my';
  
  // Check for new results and show notification
  useEffect(() => {
    if (results.length > 0 && lastResultCount > 0 && results.length > lastResultCount) {
      setShowNotification(true);
    }
    setLastResultCount(results.length);
  }, [results.length, lastResultCount]);

  const handleSnippetClick = (snippet) => {
    if (snippet.isPublic) {
      navigate(`/s/${snippet.publicId}`);
    } else {
      navigate(`/my-snippets?highlight=${snippet.$id}`);
    }
  };

  const scopeOptions = [
    { value: 'all', label: 'All Snippets' },
    { value: 'public', label: 'Public Only' },
    ...(user ? [{ value: 'my', label: 'My Snippets' }] : [])
  ];

  const handleRefreshResults = () => {
    window.location.reload(); // Simple refresh for MVP
  };

  return (
    <div className="max-w-6xl mx-auto">
      <SearchNotification
        show={showNotification}
        onRefresh={handleRefreshResults}
        onDismiss={() => setShowNotification(false)}
        message="New search results available"
      />
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Search Results
            </h1>
            {hasQuery && (
              <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
                {isLoading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
              </p>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search snippets by title, description, code, or tags..."
            className="w-full pl-12 pr-12 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Scope Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
            <select
              value={activeFilters.scope}
              onChange={(e) => setActiveFilters(prev => ({ ...prev, scope: e.target.value }))}
              className="px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
            >
              {scopeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <select
            value={activeFilters.language}
            onChange={(e) => setActiveFilters(prev => ({ ...prev, language: e.target.value }))}
            className="px-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
          >
            {languageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {!hasQuery ? (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Start searching
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Enter keywords to search through snippets by title, description, code, or tags
          </p>
        </div>
      ) : isLoading ? (
        <Loading />
      ) : results.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {results.map((snippet, index) => (
            <motion.div
              key={snippet.$id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SnippetCard
                snippet={snippet}
                onClick={() => handleSnippetClick(snippet)}
                highlightQuery={query}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-surface-light dark:bg-surface-dark rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Search className="h-8 w-8 text-text-secondary-light dark:text-text-secondary-dark" />
          </div>
          <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            No results found
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
            No snippets match your search for "{query}"
          </p>
          <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            <p>Try:</p>
            <ul className="mt-2 space-y-1">
              <li>• Using different keywords</li>
              <li>• Checking your spelling</li>
              <li>• Using broader search terms</li>
              <li>• Changing the language filter</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;