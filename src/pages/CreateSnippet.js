import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCreateSnippet } from '../hooks/useSnippets';
import SnippetEditor from '../components/snippets/SnippetEditor';

const CreateSnippet = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createMutation = useCreateSnippet();

  const handleSave = async (formData) => {
    try {
      const snippetData = {
        ...formData,
        ownerId: user.$id
      };
      
      const newSnippet = await createMutation.mutateAsync(snippetData);
      
      // Navigate to the snippet details page or public link based on visibility
      if (newSnippet.isPublic && newSnippet.publicId) {
        navigate(`/s/${newSnippet.publicId}`);
      } else {
        navigate(`/snippet/${newSnippet.$id}`);
      }
    } catch (error) {
      console.error('Failed to create snippet:', error);
    }
  };

  const handleCancel = () => {
    navigate('/my-snippets');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <SnippetEditor
        onSave={handleSave}
        onCancel={handleCancel}
        loading={createMutation.isLoading}
      />
    </motion.div>
  );
};

export default CreateSnippet;