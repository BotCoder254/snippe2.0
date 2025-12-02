import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Copy, Eye, Heart, Share, MoreHorizontal, Edit, Trash2, Paperclip, Image, File, FileText } from 'lucide-react';
import Button from '../ui/Button';
import ShareModal from '../ui/ShareModal';
import { useStarSnippet } from '../../hooks/useSnippets';
import { useToggleStar, useIsSnippetStarred } from '../../hooks/useStars';
import { useAuth } from '../../contexts/AuthContext';
import { getFilePreview, getFileDownload } from '../../hooks/useStorage';
import { parseTags, parseAttachments, formatDate, getLanguageColor } from '../../utils/snippetHelpers';

const SnippetCard = ({ 
  snippet, 
  showAuthor = true, 
  showActions = true,
  onView, 
  onEdit,
  onDelete,
  onShare,
  onClick,
  highlightQuery = '',
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { user } = useAuth();
  const starMutation = useStarSnippet();
  const toggleStarMutation = useToggleStar();
  const { data: isStarred = false } = useIsSnippetStarred(user?.$id, snippet.$id);
  
  const isOwner = user && snippet.ownerId === user.$id;
  
  // Parse attachments if stored as JSON string
  const attachments = parseAttachments(snippet.attachments);
  
  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return Image;
    if (type?.includes('text') || type?.includes('json')) return FileText;
    return File;
  };
  
  const isImage = (type) => type?.startsWith('image/');

  const copyToClipboard = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleView = () => {
    if (onClick) {
      onClick(snippet);
    } else if (onView) {
      onView(snippet);
    }
  };

  // Highlight matching text
  const highlightText = (text, query) => {
    if (!query.trim() || !text) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-secondary-light/30 dark:bg-secondary-dark/30 px-1 rounded">$1</mark>');
  };

  const handleStar = async (e) => {
    e.stopPropagation();
    if (!user) return;
    
    try {
      // Toggle star status
      await toggleStarMutation.mutateAsync({
        userId: user.$id,
        snippetId: snippet.$id,
        isStarred
      });
      
      // Update snippet star count
      await starMutation.mutateAsync({ 
        snippetId: snippet.$id, 
        increment: !isStarred 
      });
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };
  
  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(snippet);
    }
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(snippet);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    setShowShareModal(true);
  };



  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card dark:shadow-cardDark hover:shadow-lg dark:hover:shadow-xl transition-shadow cursor-pointer group ${className}`}
      onClick={handleView}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 
            className="font-semibold text-text-primary-light dark:text-text-primary-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors truncate"
            dangerouslySetInnerHTML={{ __html: highlightText(snippet.title, highlightQuery) }}
          />
          {snippet.description && (
            <p 
              className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: highlightText(snippet.description, highlightQuery) }}
            />
          )}
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {snippet.starsCount > 0 && (
            <div className="flex items-center space-x-1 text-text-secondary-light dark:text-text-secondary-dark">
              <Star className="h-4 w-4" />
              <span className="text-sm">{snippet.starsCount}</span>
            </div>
          )}
          {isOwner && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
              <button
                onClick={handleEdit}
                className="p-1 rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                title="Edit snippet"
              >
                <Edit className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                title="Delete snippet"
              >
                <Trash2 className="h-4 w-4 text-danger-light dark:text-danger-dark" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tags and Language */}
      <div className="flex items-center space-x-2 mb-4 flex-wrap gap-2">
        <span className={`px-2 py-1 text-xs rounded-xl ${getLanguageColor(snippet.language)}`}>
          {snippet.language}
        </span>
        {(() => {
          const tags = parseTags(snippet.tags);
          return tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-xl bg-border-light/50 text-text-secondary-light dark:bg-border-dark/50 dark:text-text-secondary-dark"
              dangerouslySetInnerHTML={{ __html: highlightText(tag, highlightQuery) }}
            />
          ));
        })()}
        {snippet.isPublic && (
          <span className="px-2 py-1 text-xs rounded-xl bg-success-light/10 text-success-light dark:bg-success-dark/10 dark:text-success-dark">
            Public
          </span>
        )}
      </div>

      {/* Code Preview */}
      <div className="relative mb-4">
        <pre className="bg-background-light dark:bg-background-dark rounded-xl p-4 text-sm overflow-hidden">
          <code className="text-text-primary-light dark:text-text-primary-dark font-mono">
            {snippet.code?.split('\n').slice(0, 6).join('\n')}
            {snippet.code?.split('\n').length > 6 && '\n...'}
          </code>
        </pre>
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 p-2 rounded-lg bg-surface-light/80 dark:bg-surface-dark/80 hover:bg-surface-light dark:hover:bg-surface-dark transition-colors opacity-0 group-hover:opacity-100"
        >
          {copied ? (
            <span className="text-xs text-success-light dark:text-success-dark font-medium">
              Copied!
            </span>
          ) : (
            <Copy className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
          )}
        </button>
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Paperclip className="h-3 w-3 text-text-secondary-light dark:text-text-secondary-dark" />
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {attachments.length} attachment{attachments.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {attachments.slice(0, 3).map((attachment, index) => {
              const FileIcon = getFileIcon(attachment.type);
              return (
                <div
                  key={attachment.id || index}
                  className="flex items-center space-x-2 px-2 py-1 bg-background-light dark:bg-background-dark rounded-lg text-xs"
                >
                  {isImage(attachment.type) ? (
                    <img
                      src={getFilePreview(attachment.id, 20, 20)}
                      alt={attachment.name}
                      className="w-4 h-4 rounded object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <FileIcon 
                    className={`w-3 h-3 text-text-secondary-light dark:text-text-secondary-dark ${
                      isImage(attachment.type) ? 'hidden' : 'block'
                    }`} 
                  />
                  <span className="text-text-secondary-light dark:text-text-secondary-dark truncate max-w-20">
                    {attachment.name}
                  </span>
                </div>
              );
            })}
            {attachments.length > 3 && (
              <div className="px-2 py-1 bg-background-light dark:bg-background-dark rounded-lg text-xs text-text-secondary-light dark:text-text-secondary-dark">
                +{attachments.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showAuthor && (
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-primary-light dark:bg-primary-dark rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {snippet.authorName?.charAt(0) || snippet.ownerName?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                @{snippet.authorHandle || snippet.ownerHandle || 'developer'}
              </span>
            </div>
          )}
          <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            {formatDate(snippet.$createdAt || snippet.createdAt, formatDate(snippet.$updatedAt || snippet.updatedAt, 'Recently'))}
          </span>
        </div>

        {showActions && (
          <div className="flex items-center space-x-2">
            {user && (
              <button
                onClick={handleStar}
                disabled={toggleStarMutation.isLoading || starMutation.isLoading}
                className="p-1 rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors disabled:opacity-50"
                title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={`h-4 w-4 transition-colors ${
                  isStarred 
                    ? 'text-warning-light dark:text-warning-dark fill-current' 
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-warning-light dark:hover:text-warning-dark'
                }`} />
              </button>
            )}
            <button
              onClick={handleShare}
              className="p-1 rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors"
              title="Share snippet"
            >
              <Share className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
            </button>
            <Button variant="ghost" size="sm" onClick={handleView} className="dark:text-white">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        )}
      </div>
      
      {/* Share Modal */}
      <ShareModal
        snippet={snippet}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </motion.div>
  );
};

export default SnippetCard;