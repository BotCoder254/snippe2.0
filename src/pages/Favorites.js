import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Search, Filter, Grid, List, Heart, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFavoriteSnippets } from '../hooks/useSnippets';
import { useSearch } from '../hooks/useSearch';
import SnippetCard from '../components/snippets/SnippetCard';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';

const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState('recent'); // recent, title, stars
  const [viewMode, setViewMode] = useState('grid');

  const { data: favoriteSnippets = [], isLoading, error } = useFavoriteSnippets(user?.$id, true); // Enable real-time
  
  // Use search hook for client-side filtering
  const { filterSnippets } = useSearch();

  const languages = ['All', ...new Set(favoriteSnippets.map(s => s.language))];

  // Apply filters
  let filteredSnippets = favoriteSnippets;
  
  // Apply search query
  if (searchQuery.trim()) {
    filteredSnippets = filterSnippets(filteredSnippets);
  }
  
  // Apply language filter
  if (selectedLanguage !== 'All') {
    filteredSnippets = filteredSnippets.filter(snippet => snippet.language === selectedLanguage);
  }

  const sortedSnippets = [...filteredSnippets].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'stars':
        return (b.starsCount || 0) - (a.starsCount || 0);
      case 'recent':
      default:
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    }
  });

  const handleView = (snippet) => {
    if (snippet.isPublic) {
      navigate(`/s/${snippet.publicId}`);
    } else {
      navigate(`/my-snippets?highlight=${snippet.$id}`);
    }
  };

  const handleEdit = (snippet) => {
    if (snippet.ownerId === user?.$id) {
      navigate(`/snippet/${snippet.$id}/edit`);
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

  if (isLoading) {
    return <Loading fullScreen message="Loading your favorites..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
          Failed to load favorites
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center">
              <Heart className="h-8 w-8 mr-3 text-danger-light dark:text-danger-dark" />
              Your Favorites
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">
              Snippets you've starred and want to keep handy
            </p>
          </div>
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
          { label: 'Total Favorites', value: favoriteSnippets.length, icon: Heart, color: 'danger' },
          { label: 'Languages', value: languages.length - 1, icon: Filter, color: 'primary' },
          { label: 'Public Snippets', value: favoriteSnippets.filter(s => s.isPublic).length, icon: Star, color: 'success' },
          { label: 'Your Snippets', value: favoriteSnippets.filter(s => s.ownerId === user?.$id).length, icon: Plus, color: 'warning' }
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
                placeholder="Search favorites..."
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
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-border-light dark:border-border-dark rounded-xl bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
            >
              <option value="recent">Recently Starred</option>
              <option value="title">Title A-Z</option>
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

      {/* Favorites Grid/List */}
      {sortedSnippets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center py-12"
        >
          <Heart className="h-16 w-16 text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
            {searchQuery || selectedLanguage !== 'All' ? 'No favorites found' : 'No favorites yet'}
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
            {searchQuery || selectedLanguage !== 'All' 
              ? 'Try adjusting your search or filter criteria'
              : 'Star snippets you like to see them here'
            }
          </p>
          {!searchQuery && selectedLanguage === 'All' && (
            <Button onClick={() => navigate('/browse')}>
              <Star className="h-4 w-4 mr-2" />
              Discover Snippets
            </Button>
          )}
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
                showAuthor={snippet.ownerId !== user?.$id}
                onClick={handleView}
                onEdit={handleEdit}
                onShare={handleShare}
                highlightQuery={searchQuery}
                className={viewMode === 'list' ? 'flex-row' : ''}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Favorites;