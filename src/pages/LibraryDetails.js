import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Library, Lock, Globe, Plus, Search, Grid, List, Edit, Trash2, Code, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLibrary, useDeleteLibrary, useRemoveSnippetFromLibrary } from '../hooks/useLibraries';
import SnippetCard from '../components/snippets/SnippetCard';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import { formatDate } from '../utils/snippetHelpers';

const LibraryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const { data: library, isLoading, error } = useLibrary(id);
  const deleteLibraryMutation = useDeleteLibrary();
  const removeSnippetMutation = useRemoveSnippetFromLibrary();

  const isOwner = library && user && library.ownerId === user.$id;

  const filteredSnippets = library?.snippets?.filter(snippet =>
    snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    snippet.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDeleteLibrary = async () => {
    if (window.confirm(`Are you sure you want to delete "${library.name}"?`)) {
      try {
        await deleteLibraryMutation.mutateAsync(id);
        navigate('/collections');
      } catch (error) {
        console.error('Failed to delete library:', error);
      }
    }
  };

  const handleRemoveSnippet = async (snippetId) => {
    if (window.confirm('Remove this snippet from the collection?')) {
      try {
        await removeSnippetMutation.mutateAsync({ libraryId: id, snippetId });
      } catch (error) {
        console.error('Failed to remove snippet:', error);
      }
    }
  };

  const handleSnippetClick = (snippet) => {
    navigate(`/snippet/${snippet.$id}`);
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading library..." />;
  }

  if (error || !library) {
    return (
      <div className="text-center py-12">
        <Library className="h-16 w-16 text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
          Library Not Found
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
          This library doesn't exist or you don't have permission to view it.
        </p>
        <Button onClick={() => navigate('/collections')} className="dark:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/collections')}
            className="dark:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collections
          </Button>
          
          {isOwner && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/library/${id}/edit`)}
                className="dark:text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteLibrary}
                disabled={deleteLibraryMutation.isLoading}
                className="dark:text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Library Info */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card dark:shadow-cardDark">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-primary-light/10 dark:bg-primary-dark/10">
                <Library className="h-8 w-8 text-primary-light dark:text-primary-dark" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                  {library.name}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  <div className="flex items-center space-x-1">
                    {library.isPrivate ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Globe className="h-4 w-4 text-success-light dark:text-success-dark" />
                    )}
                    <span>{library.isPrivate ? 'Private' : 'Public'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Code className="h-4 w-4" />
                    <span>{library.snippets?.length || 0} snippets</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(library.$createdAt || library.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and View Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card dark:shadow-cardDark"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
              <input
                type="text"
                placeholder="Search snippets in this library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark text-text-primary-light dark:text-text-primary-dark"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
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
            
            {isOwner && (
              <Button
                onClick={() => navigate('/create')}
                size="sm"
                className="dark:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Snippet
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Snippets */}
      {filteredSnippets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center py-12"
        >
          <Code className="h-16 w-16 text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
            {searchQuery ? 'No snippets found' : 'No snippets in this library'}
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
            {searchQuery 
              ? 'Try adjusting your search criteria'
              : 'Add some snippets to get started'
            }
          </p>
          {!searchQuery && isOwner && (
            <Button onClick={() => navigate('/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Snippet
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }
        >
          {filteredSnippets.map((snippet, index) => (
            <motion.div
              key={snippet.$id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <SnippetCard
                snippet={snippet}
                onClick={handleSnippetClick}
                highlightQuery={searchQuery}
                showActions={true}
                onDelete={isOwner ? () => handleRemoveSnippet(snippet.$id) : undefined}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default LibraryDetails;