import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, ExternalLink, Globe, Lock, Check } from 'lucide-react';
import Button from './Button';
import { useGeneratePublicLink, useRevokePublicLink } from '../../hooks/usePublicSharing';
import { parseTags } from '../../utils/snippetHelpers';

const ShareModal = ({ snippet, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const generateLinkMutation = useGeneratePublicLink();
  const revokeLinkMutation = useRevokePublicLink();

  const publicUrl = snippet?.isPublic ? `${window.location.origin}/s/${snippet.publicId}` : null;

  const handleGenerateLink = async () => {
    try {
      await generateLinkMutation.mutateAsync({ snippetId: snippet.$id });
    } catch (error) {
      console.error('Failed to generate public link:', error);
    }
  };

  const handleRevokeLink = async () => {
    try {
      await revokeLinkMutation.mutateAsync({ snippetId: snippet.$id });
    } catch (error) {
      console.error('Failed to revoke public link:', error);
    }
  };

  const handleCopyLink = async () => {
    if (publicUrl) {
      try {
        await navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  const handleOpenInNewWindow = () => {
    if (publicUrl) {
      window.open(publicUrl, '_blank');
    }
  };

  if (!snippet) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[9999]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl max-w-md w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark">
                <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                  Share Snippet
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                >
                  <X className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Snippet Preview */}
                <div className="bg-background-light dark:bg-background-dark rounded-xl p-4">
                  <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                    {snippet.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs rounded-lg bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark">
                      {snippet.language}
                    </span>
                    {parseTags(snippet.tags).slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-lg bg-secondary-light/10 text-secondary-light dark:bg-secondary-dark/10 dark:text-secondary-dark"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Public Link Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {snippet.isPublic ? (
                        <Globe className="h-5 w-5 text-success-light dark:text-success-dark" />
                      ) : (
                        <Lock className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark" />
                      )}
                      <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                        {snippet.isPublic ? 'Public Link' : 'Private Snippet'}
                      </span>
                    </div>
                    
                    {snippet.isPublic ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRevokeLink}
                        loading={revokeLinkMutation.isLoading}
                        className="dark:bg-surface-dark dark:text-white"
                      >
                        Make Private
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleGenerateLink}
                        loading={generateLinkMutation.isLoading}
                        className="dark:bg-primary-dark dark:text-white"
                      >
                        Make Public
                      </Button>
                    )}
                  </div>

                  {snippet.isPublic && publicUrl && (
                    <div className="space-y-3">
                      {/* URL Display */}
                      <div className="flex items-center space-x-2 p-3 bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark">
                        <input
                          type="text"
                          value={publicUrl}
                          readOnly
                          className="flex-1 bg-transparent text-text-primary-light dark:text-text-primary-dark text-sm focus:outline-none"
                        />
                        <button
                          onClick={handleCopyLink}
                          className="p-2 rounded-lg hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
                          title="Copy link"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-success-light dark:text-success-dark" />
                          ) : (
                            <Copy className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
                          )}
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyLink}
                          className="flex-1 dark:bg-surface-dark dark:text-white"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          {copied ? 'Copied!' : 'Copy Link'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleOpenInNewWindow}
                          className="flex-1 dark:bg-surface-dark dark:text-white"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                      </div>
                    </div>
                  )}

                  {!snippet.isPublic && (
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      Generate a public link to share this snippet with anyone, even without an account.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;