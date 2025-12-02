import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSnippet, useUpdateSnippet } from '../hooks/useSnippets';
import SnippetEditor from '../components/snippets/SnippetEditor';
import Loading from '../components/ui/Loading';

const EditSnippet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: snippet, isLoading, error } = useSnippet(id);
  const updateMutation = useUpdateSnippet();

  const handleSave = async (formData) => {
    try {
      const updatedSnippet = await updateMutation.mutateAsync({
        id,
        ...formData
      });
      
      // Navigate back to snippet details
      navigate(`/snippet/${updatedSnippet.$id}`);
    } catch (error) {
      console.error('Failed to update snippet:', error);
    }
  };

  const handleCancel = () => {
    navigate(`/snippet/${id}`);
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading snippet..." />;
  }

  if (error || !snippet) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
          Snippet Not Found
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
          This snippet doesn't exist or you don't have permission to edit it.
        </p>
      </div>
    );
  }

  // Check if user owns the snippet
  if (snippet.ownerId !== user.$id) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
          Access Denied
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
          You don't have permission to edit this snippet.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <SnippetEditor
        snippet={snippet}
        onSave={handleSave}
        onCancel={handleCancel}
        loading={updateMutation.isLoading}
      />
    </motion.div>
  );
};

export default EditSnippet;