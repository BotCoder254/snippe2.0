import { useState, useRef } from 'react';
import { Upload, X, File, Image, FileText, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUploadFile, useDeleteFile, getFilePreview, getFileDownload } from '../../hooks/useStorage';
import Button from './Button';

const FileUpload = ({ attachments = [], onAttachmentsChange, maxFiles = 5, maxFileSize = 10 * 1024 * 1024 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState({});
  const fileInputRef = useRef(null);
  
  const uploadMutation = useUploadFile();
  const deleteMutation = useDeleteFile();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    if (attachments.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`);
        continue;
      }

      const tempId = Date.now() + Math.random();
      setUploading(prev => ({ ...prev, [tempId]: { name: file.name, progress: 0 } }));

      try {
        const uploadedFile = await uploadMutation.mutateAsync({
          file,
          onProgress: (progress) => {
            setUploading(prev => ({
              ...prev,
              [tempId]: { ...prev[tempId], progress: Math.round((progress.loaded / progress.total) * 100) }
            }));
          }
        });

        const newAttachment = {
          id: uploadedFile.$id,
          name: file.name,
          size: file.size,
          type: file.type,
          url: getFileDownload(uploadedFile.$id)
        };

        onAttachmentsChange([...attachments, newAttachment]);
        setUploading(prev => {
          const { [tempId]: removed, ...rest } = prev;
          return rest;
        });
      } catch (error) {
        console.error('Upload failed:', error);
        setUploading(prev => {
          const { [tempId]: removed, ...rest } = prev;
          return rest;
        });
        alert(`Failed to upload ${file.name}`);
      }
    }
  };

  const handleRemoveAttachment = async (attachment) => {
    try {
      await deleteMutation.mutateAsync(attachment.id);
      onAttachmentsChange(attachments.filter(a => a.id !== attachment.id));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete file');
    }
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return Image;
    if (type.includes('text') || type.includes('json')) return FileText;
    return File;
  };

  const isImage = (type) => type.startsWith('image/');

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 transition-colors ${
          dragActive
            ? 'border-primary-light dark:border-primary-dark bg-primary-light/5 dark:bg-primary-dark/5'
            : 'border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="image/*,.txt,.md,.json,.js,.ts,.py,.java,.cpp,.c,.html,.css,.sql"
        />
        
        <div className="text-center">
          <Upload className="h-8 w-8 text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-4" />
          <p className="text-text-primary-light dark:text-text-primary-dark font-medium mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Max {maxFiles} files, {maxFileSize / (1024 * 1024)}MB each
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      <AnimatePresence>
        {Object.entries(uploading).map(([id, file]) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-3 p-3 bg-surface-light dark:bg-surface-dark rounded-lg"
          >
            <Upload className="h-4 w-4 text-primary-light dark:text-primary-dark animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                {file.name}
              </p>
              <div className="w-full bg-border-light dark:bg-border-dark rounded-full h-2 mt-1">
                <div
                  className="bg-primary-light dark:bg-primary-dark h-2 rounded-full transition-all"
                  style={{ width: `${file.progress}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {file.progress}%
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
            Attachments ({attachments.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attachments.map((attachment) => {
              const FileIcon = getFileIcon(attachment.type);
              return (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-3 p-3 bg-surface-light dark:bg-surface-dark rounded-lg group"
                >
                  {isImage(attachment.type) ? (
                    <img
                      src={getFilePreview(attachment.id, 40, 40)}
                      alt={attachment.name}
                      className="w-10 h-10 rounded object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-10 h-10 rounded bg-primary-light/10 dark:bg-primary-dark/10 flex items-center justify-center ${
                      isImage(attachment.type) ? 'hidden' : 'flex'
                    }`}
                  >
                    <FileIcon className="h-5 w-5 text-primary-light dark:text-primary-dark" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => window.open(attachment.url, '_blank')}
                      className="p-1 hover:bg-background-light dark:hover:bg-background-dark rounded transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
                    </button>
                    <button
                      onClick={() => handleRemoveAttachment(attachment)}
                      className="p-1 hover:bg-background-light dark:hover:bg-background-dark rounded transition-colors"
                      title="Remove"
                    >
                      <X className="h-4 w-4 text-danger-light dark:text-danger-dark" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;