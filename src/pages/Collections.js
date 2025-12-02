import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Library, Plus, Search, Grid, List, Lock, Globe, Code, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserLibraries, useDeleteLibrary } from '../hooks/useLibraries';
import Button from '../components/ui/Button';
import LibraryModal from '../components/ui/LibraryModal';
import Loading from '../components/ui/Loading';
import { formatDate } from '../utils/snippetHelpers';

const Collections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: libraries = [], isLoading, error } = useUserLibraries(user?.$id);
  const deleteLibraryMutation = useDeleteLibrary();

  const filteredLibraries = libraries.filter(library =>
    library.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLibraryClick = (library) => {
    navigate(`/library/${library.$id}`);
  };

  const handleDeleteLibrary = async (library, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${library.name}"?`)) {
      try {
        await deleteLibraryMutation.mutateAsync(library.$id);
      } catch (error) {
        console.error('Failed to delete library:', error);
      }
    }
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading your libraries..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
          Failed to load libraries
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
              <Library className="h-8 w-8 mr-3 text-primary-light dark:text-primary-dark" />
              Collections
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">
              Organize your snippets into themed collections
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="lg" className="mt-4 sm:mt-0">
            <Plus className="h-5 w-5 mr-2" />
            New Collection
          </Button>
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
          { label: 'Total Collections', value: libraries.length, icon: Library, color: 'primary' },
          { label: 'Private', value: libraries.filter(l => l.isPrivate).length, icon: Lock, color: 'warning' },
          { label: 'Public', value: libraries.filter(l => !l.isPrivate).length, icon: Globe, color: 'success' },
          { label: 'Total Snippets', value: libraries.reduce((sum, l) => sum + (l.snippetIds?.length || 0), 0), icon: Code, color: 'info' }
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

      {/* Search and View Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card dark:shadow-cardDark"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              />
            </div>
          </div>

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
      </motion.div>

      {/* Collections Grid/List */}
      {filteredLibraries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center py-12"
        >
          <Library className="h-16 w-16 text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
            {searchQuery ? 'No collections found' : 'No collections yet'}
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
            {searchQuery 
              ? 'Try adjusting your search criteria'
              : 'Create your first collection to organize your snippets'
            }
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Collection
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
          {filteredLibraries.map((library, index) => (
            <motion.div
              key={library.$id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => handleLibraryClick(library)}
              className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card dark:shadow-cardDark hover:shadow-lg dark:hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-primary-light/10 dark:bg-primary-dark/10">
                    <Library className="h-5 w-5 text-primary-light dark:text-primary-dark" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
                      {library.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {library.isPrivate ? (
                        <Lock className="h-3 w-3 text-text-secondary-light dark:text-text-secondary-dark" />
                      ) : (
                        <Globe className="h-3 w-3 text-success-light dark:text-success-dark" />
                      )}
                      <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {library.isPrivate ? 'Private' : 'Public'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={(e) => handleDeleteLibrary(library, e)}
                  className="p-1 rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete collection"
                >
                  <Trash2 className="h-4 w-4 text-danger-light dark:text-danger-dark" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    Snippets
                  </span>
                  <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                    {library.snippetIds?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    Created
                  </span>
                  <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {formatDate(library.$createdAt || library.createdAt)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Library Modal */}
      <LibraryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        userId={user?.$id}
      />
    </div>
  );
};

export default Collections;