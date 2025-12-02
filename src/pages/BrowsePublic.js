import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, Code, Star, TrendingUp, Clock, Users } from 'lucide-react';
import { usePublicSnippets } from '../hooks/useSnippets';
import { useSearch } from '../hooks/useSearch';
import SnippetCard from '../components/snippets/SnippetCard';
import Loading from '../components/ui/Loading';

const LANGUAGES = [
  'All', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'PHP', 'Ruby', 'Swift', 'Kotlin', 'HTML', 'CSS', 'SQL', 'Shell'
];

const BrowsePublic = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, popular, stars
  const [viewMode, setViewMode] = useState('grid');

  // Handle URL-based tag filtering
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl) {
      setSelectedTag(tagFromUrl);
    }
  }, [searchParams]);

  const { data: snippets = [], isLoading, error } = usePublicSnippets(50, true); // Enable real-time
  
  // Use search hook for client-side filtering
  const { filterSnippets } = useSearch();

  // Apply filters
  let filteredSnippets = snippets;
  
  // Apply search query
  if (searchQuery.trim()) {
    filteredSnippets = filterSnippets(filteredSnippets);
  }
  
  // Apply language filter
  if (selectedLanguage !== 'All') {
    filteredSnippets = filteredSnippets.filter(snippet => snippet.language === selectedLanguage);
  }
  
  // Apply tag filter
  if (selectedTag) {
    filteredSnippets = filteredSnippets.filter(snippet => 
      snippet.tags?.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
    );
  }

  const sortedSnippets = [...filteredSnippets].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.starsCount || 0) - (a.starsCount || 0);
      case 'stars':
        return (b.starsCount || 0) - (a.starsCount || 0);
      case 'recent':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const handleView = (snippet) => {
    if (snippet.isPublic) {
      navigate(`/s/${snippet.publicId}`);
    } else {
      navigate(`/my-snippets?highlight=${snippet.$id}`);
    }
  };

  const handleShare = (snippet) => {
    if (navigator.share) {
      navigator.share({
        title: snippet.title,
        text: snippet.description,
        url: `${window.location.origin}/snippet/${snippet.$id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/snippet/${snippet.$id}`);
    }
  };

  const stats = {
    total: snippets.length,
    languages: [...new Set(snippets.map(s => s.language))].length,
    totalStars: snippets.reduce((sum, s) => sum + (s.starsCount || 0), 0),
    contributors: [...new Set(snippets.map(s => s.ownerId))].length
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading public snippets..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
          Failed to load snippets
        </h2>
        <p className="text-text-secondary-light dark:text-text-secondary-dark">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Browse Public Snippets
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2 max-w-2xl mx-auto">
            Discover amazing code snippets shared by the community. Find solutions, get inspired, and learn from other developers.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Snippets', value: stats.total, icon: Code, color: 'primary' },
          { label: 'Languages', value: stats.languages, icon: TrendingUp, color: 'success' },
          { label: 'Total Stars', value: stats.totalStars, icon: Star, color: 'warning' },
          { label: 'Contributors', value: stats.contributors, icon: Users, color: 'info' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-card dark:shadow-cardDark"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-xl bg-${stat.color}-light/10 dark:bg-${stat.color}-dark/10`}>
                  <Icon className={`h-5 w-5 text-${stat.color}-light dark:text-${stat.color}-dark`} />
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card dark:shadow-cardDark"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
              <input
                type="text"
                placeholder="Search snippets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-border-light dark:border-border-dark rounded-xl bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-border-light dark:border-border-dark rounded-xl bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="stars">Most Stars</option>
            </select>

            <div className="flex items-center border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-light text-white dark:bg-primary-dark' : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-light text-white dark:bg-primary-dark' : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Active Filters */}
      {(selectedTag || selectedLanguage !== 'All') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-card dark:shadow-cardDark"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
              Active Filters
            </h3>
            <button
              onClick={() => {
                setSelectedLanguage('All');
                setSelectedTag('');
                setSearchParams({});
              }}
              className="text-xs text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTag && (
              <span className="inline-flex items-center px-3 py-1 text-sm rounded-xl bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark border border-primary-light/20 dark:border-primary-dark/20">
                #{selectedTag}
                <button
                  onClick={() => {
                    setSelectedTag('');
                    setSearchParams({});
                  }}
                  className="ml-2 hover:text-danger-light dark:hover:text-danger-dark"
                >
                  ×
                </button>
              </span>
            )}
            {selectedLanguage !== 'All' && (
              <span className="inline-flex items-center px-3 py-1 text-sm rounded-xl bg-secondary-light/10 text-secondary-light dark:bg-secondary-dark/10 dark:text-secondary-dark border border-secondary-light/20 dark:border-secondary-dark/20">
                {selectedLanguage}
                <button
                  onClick={() => setSelectedLanguage('All')}
                  className="ml-2 hover:text-danger-light dark:hover:text-danger-dark"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Language Filter Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap gap-2"
      >
        {LANGUAGES.slice(0, 8).map((language) => (
          <button
            key={language}
            onClick={() => setSelectedLanguage(language)}
            className={`px-3 py-1 text-sm rounded-xl transition-colors ${
              selectedLanguage === language
                ? 'bg-primary-light text-white dark:bg-primary-dark'
                : 'bg-surface-light text-text-secondary-light hover:bg-background-light dark:bg-surface-dark dark:text-text-secondary-dark dark:hover:bg-background-dark'
            }`}
          >
            {language}
          </button>
        ))}
      </motion.div>

      {/* Snippets Grid/List */}
      {sortedSnippets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center py-12"
        >
          <Code className="h-16 w-16 text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
            No snippets found
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }
        >
          {sortedSnippets.map((snippet, index) => (
            <motion.div
              key={snippet.$id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <SnippetCard
                snippet={snippet}
                showAuthor={true}
                onClick={handleView}
                onShare={handleShare}
                highlightQuery={searchQuery}
                className={viewMode === 'list' ? 'flex-row' : ''}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Load More */}
      {sortedSnippets.length > 0 && sortedSnippets.length >= 50 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <button className="px-6 py-3 bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark rounded-xl hover:bg-background-light dark:hover:bg-background-dark transition-colors">
            Load More Snippets
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default BrowsePublic;