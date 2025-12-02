import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Grid, List, Code, Star, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserSnippets, useDeleteSnippet } from '../hooks/useSnippets';
import { useSearch } from '../hooks/useSearch';
import SnippetCard from '../components/snippets/SnippetCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loading from '../components/ui/Loading';

const MySnippets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, public, private
  const [sortBy, setSortBy] = useState('updated'); // updated, created, title, stars
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [highlightedSnippet, setHighlightedSnippet] = useState(null);
  
  // Handle highlighting from URL params
  useEffect(() => {
    const highlight = searchParams.get('highlight');
    if (highlight) {
      setHighlightedSnippet(highlight);
      // Remove highlight after 3 seconds
      setTimeout(() => setHighlightedSnippet(null), 3000);
    }
  }, [searchParams]);

  const { data: snippets = [], isLoading, error } = useUserSnippets(user?.$id, true); // Enable real-time
  const deleteMutation = useDeleteSnippet();
  
  // Use search hook for client-side filtering
  const { filterSnippets } = useSearch();

  // Apply filters
  let filteredSnippets = snippets;
  
  // Apply search query
  if (searchQuery.trim()) {
    filteredSnippets = filterSnippets(filteredSnippets);
  }
  
  // Apply visibility filter
  if (filterBy !== 'all') {
    filteredSnippets = filteredSnippets.filter(snippet => 
      filterBy === 'public' ? snippet.isPublic : !snippet.isPublic
    );
  }

  const sortedSnippets = [...filteredSnippets].sort((a, b) => {
    switch (sortBy) {
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'stars':
        return (b.starsCount || 0) - (a.starsCount || 0);
      case 'updated':
      default:
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    }
  });

  const handleEdit = (snippet) => {
    navigate(`/snippet/${snippet.$id}/edit`);
  };

  const handleDelete = async (snippet) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      try {
        await deleteMutation.mutateAsync(snippet.$id);
      } catch (error) {
        console.error('Failed to delete snippet:', error);
      }
    }
  };

  const handleView = (snippet) => {
    if (snippet.isPublic) {
      navigate(`/s/${snippet.publicId}`);
    } else {
      // For private snippets, we could create a private view route
      navigate(`/my-snippets?highlight=${snippet.$id}`);
    }
  };

  const stats = {
    total: snippets.length,
    public: snippets.filter(s => s.isPublic).length,
    private: snippets.filter(s => !s.isPublic).length,
    totalStars: snippets.reduce((sum, s) => sum + (s.starsCount || 0), 0)
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading your snippets..." />;
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
              My Snippets
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">
              Manage and organize your code snippets
            </p>
          </div>
          <Link to="/create">
            <Button size="lg" className="mt-4 sm:mt-0">
              <Plus className="h-5 w-5 mr-2" />
              New Snippet
            </Button>
          </Link>
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
          { label: 'Public', value: stats.public, icon: Star, color: 'success' },
          { label: 'Private', value: stats.private, icon: Clock, color: 'warning' },
          { label: 'Total Stars', value: stats.totalStars, icon: Star, color: 'info' }
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
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 border border-border-light dark:border-border-dark rounded-xl bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
            >
              <option value="all">All Snippets</option>
              <option value="public">Public Only</option>
              <option value="private">Private Only</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-border-light dark:border-border-dark rounded-xl bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
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
            {searchQuery || filterBy !== 'all' ? 'No snippets found' : 'No snippets yet'}
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
            {searchQuery || filterBy !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first snippet to get started'
            }
          </p>
          {!searchQuery && filterBy === 'all' && (
            <Link to="/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Snippet
              </Button>
            </Link>
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
                showAuthor={false}
                onClick={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                highlightQuery={searchQuery}
                className={`${viewMode === 'list' ? 'flex-row' : ''} ${
                  highlightedSnippet === snippet.$id ? 'ring-2 ring-primary-light dark:ring-primary-dark' : ''
                }`}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default MySnippets;