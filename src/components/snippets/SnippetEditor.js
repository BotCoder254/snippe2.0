import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Eye, Upload, Tag, Globe, Lock, Paperclip } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TagInput from '../ui/TagInput';
import FileUpload from '../ui/FileUpload';
import { useTagSuggestions } from '../../hooks/useTags';

const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'PHP', 'Ruby', 'Swift', 'Kotlin', 'HTML', 'CSS', 'SQL', 'Shell', 'JSON', 'XML'
];

const SnippetEditor = ({ 
  snippet = null, 
  onSave, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'JavaScript',
    code: '',
    tags: [],
    isPublic: false,
    attachments: []
  });
  const [errors, setErrors] = useState({});
  const tagSuggestions = useTagSuggestions();

  useEffect(() => {
    if (snippet) {
      // Parse attachments if they're stored as JSON string
      let attachments = [];
      try {
        attachments = typeof snippet.attachments === 'string' 
          ? JSON.parse(snippet.attachments) 
          : snippet.attachments || [];
      } catch (e) {
        attachments = [];
      }
      
      setFormData({
        title: snippet.title || '',
        description: snippet.description || '',
        language: snippet.language || 'JavaScript',
        code: snippet.code || '',
        tags: typeof snippet.tags === 'string' ? JSON.parse(snippet.tags) : snippet.tags || [],
        isPublic: snippet.isPublic || false,
        attachments
      });
    }
  }, [snippet]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }
    
    if (!formData.language) {
      newErrors.language = 'Language is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSave(formData);
  };

  const handleTagsChange = (newTags) => {
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }));
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              {snippet ? 'Edit Snippet' : 'Create New Snippet'}
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
              {snippet ? 'Update your code snippet' : 'Share your code with the community'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
              <Save className="h-4 w-4 mr-2" />
              {snippet ? 'Update' : 'Save'} Snippet
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Code Editor */}
          <div className="lg:col-span-2">
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card dark:shadow-cardDark overflow-hidden">
              <div className="border-b border-border-light dark:border-border-dark p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                    Code Editor
                  </h3>
                  <div className="flex items-center space-x-2">
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                      className="px-3 py-1 text-sm border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <textarea
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Paste your code here..."
                  className="w-full h-96 p-4 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl font-mono text-sm text-text-primary-light dark:text-text-primary-dark placeholder-text-secondary-light dark:placeholder-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark resize-none"
                />
                {errors.code && (
                  <p className="text-sm text-danger-light dark:text-danger-dark mt-2">{errors.code}</p>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Panel */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card dark:shadow-cardDark p-6">
              <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-4">
                Snippet Details
              </h3>
              
              <div className="space-y-4">
                <Input
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  error={errors.title}
                  placeholder="Enter snippet title"
                />
                
                <div>
                  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this snippet does..."
                    rows={3}
                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-xl bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark placeholder-text-secondary-light dark:placeholder-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card dark:shadow-cardDark p-6">
              <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-4 flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Tags
              </h3>
              
              <TagInput
                tags={formData.tags}
                onChange={handleTagsChange}
                suggestions={tagSuggestions}
                placeholder="Add tags to help others discover your snippet..."
                maxTags={8}
              />
              
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
                Use relevant tags like language, framework, or feature names
              </p>
            </div>

            {/* Attachments */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card dark:shadow-cardDark p-6">
              <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-4 flex items-center">
                <Paperclip className="h-4 w-4 mr-2" />
                Attachments
              </h3>
              
              <FileUpload
                attachments={formData.attachments}
                onAttachmentsChange={(newAttachments) => 
                  setFormData(prev => ({ ...prev, attachments: newAttachments }))
                }
                maxFiles={5}
                maxFileSize={10 * 1024 * 1024}
              />
            </div>

            {/* Visibility */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card dark:shadow-cardDark p-6">
              <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-4">
                Visibility
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={!formData.isPublic}
                    onChange={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                    className="h-4 w-4 text-primary-light focus:ring-primary-light border-border-light dark:border-border-dark"
                  />
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
                    <div>
                      <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                        Private
                      </p>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        Only you can see this snippet
                      </p>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={formData.isPublic}
                    onChange={() => setFormData(prev => ({ ...prev, isPublic: true }))}
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

            {/* Actions */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card dark:shadow-cardDark p-6">
              <div className="flex flex-col space-y-3">
                <Button 
                  type="submit" 
                  loading={loading}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {snippet ? 'Update' : 'Save'} Snippet
                </Button>
                
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={onCancel}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SnippetEditor;