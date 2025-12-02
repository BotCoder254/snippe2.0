import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Library, Lock, Globe } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { useCreateLibrary } from '../../hooks/useLibraries';

const LibraryModal = ({ isOpen, onClose, userId }) => {
  const [formData, setFormData] = useState({
    name: '',
    isPrivate: true
  });
  const [errors, setErrors] = useState({});
  
  const createLibraryMutation = useCreateLibrary();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Library name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await createLibraryMutation.mutateAsync({
        ownerId: userId,
        name: formData.name.trim(),
        isPrivate: formData.isPrivate
      });
      
      // Reset form and close modal
      setFormData({ name: '', isPrivate: true });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to create library:', error);
      setErrors({ submit: 'Failed to create library. Please try again.' });
    }
  };

  const handleClose = () => {
    setFormData({ name: '', isPrivate: true });
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl max-w-md w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark">
                <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark flex items-center">
                  <Library className="h-5 w-5 mr-2" />
                  Create Library
                </h3>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                >
                  <X className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <Input
                  label="Library Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={errors.name}
                  placeholder="e.g., React Utils, SQL Queries"
                  autoFocus
                />

                {/* Privacy Setting */}
                <div>
                  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
                    Privacy
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="privacy"
                        checked={formData.isPrivate}
                        onChange={() => setFormData({ ...formData, isPrivate: true })}
                        className="h-4 w-4 text-primary-light focus:ring-primary-light border-border-light dark:border-border-dark"
                      />
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
                        <div>
                          <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                            Private
                          </p>
                          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                            Only you can see this library
                          </p>
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="privacy"
                        checked={!formData.isPrivate}
                        onChange={() => setFormData({ ...formData, isPrivate: false })}
                        className="h-4 w-4 text-primary-light focus:ring-primary-light border-border-light dark:border-border-dark"
                      />
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
                        <div>
                          <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                            Public
                          </p>
                          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                            Anyone can discover and view
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {errors.submit && (
                  <p className="text-sm text-danger-light dark:text-danger-dark text-center">
                    {errors.submit}
                  </p>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={createLibraryMutation.isLoading}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Library
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LibraryModal;