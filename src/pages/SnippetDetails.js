import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Edit, Trash2, Share2, Code2, Calendar, User, Tag, Star, Eye, Lock, ArrowLeft, Heart, Paperclip, Download, Image, File, FileText } from 'lucide-react';
import { useSnippet, useDeleteSnippet, useStarSnippet } from '../hooks/useSnippets';
import { useGeneratePublicLink, useRevokePublicLink } from '../hooks/usePublicSharing';
import { useToggleStar, useIsSnippetStarred } from '../hooks/useStars';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import { parseTags, parseAttachments, formatDate } from '../utils/snippetHelpers';
import { getFilePreview, getFileDownload } from '../hooks/useStorage';

const SnippetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const { data: snippet, isLoading, error } = useSnippet(id);
  const deleteMutation = useDeleteSnippet();
  const starMutation = useStarSnippet();
  const toggleStarMutation = useToggleStar();
  const { data: isStarred = false } = useIsSnippetStarred(user?.$id, id);
  const generateLinkMutation = useGeneratePublicLink();
  const revokeLinkMutation = useRevokePublicLink();

  const isOwner = snippet && user && snippet.ownerId === user.$id;
  const attachments = snippet ? parseAttachments(snippet.attachments) : [];

  const copyToClipboard = async () => {
    if (snippet?.code) {
      try {
        await navigator.clipboard.writeText(snippet.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy code:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      try {
        await deleteMutation.mutateAsync(id);
        navigate('/my-snippets');
      } catch (error) {
        console.error('Failed to delete snippet:', error);
      }
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) return;
    
    try {
      // Toggle star status
      await toggleStarMutation.mutateAsync({
        userId: user.$id,
        snippetId: id,
        isStarred
      });
      
      // Update snippet star count
      await starMutation.mutateAsync({ 
        snippetId: id, 
        increment: !isStarred 
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return Image;
    if (type?.includes('text') || type?.includes('json')) return FileText;
    return File;
  };
  
  const isImage = (type) => type?.startsWith('image/');

  const handleDownloadAttachment = (attachment) => {
    const downloadUrl = getFileDownload(attachment.id);
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const handleGeneratePublicLink = async () => {
    try {
      const result = await generateLinkMutation.mutateAsync({ snippetId: id });
      navigator.clipboard.writeText(result.publicUrl);
      setShowShareModal(false);
      alert('Public link generated and copied to clipboard!');
    } catch (error) {
      console.error('Failed to generate public link:', error);
    }
  };

  const handleRevokePublicLink = async () => {
    try {
      await revokeLinkMutation.mutateAsync({ snippetId: id });
      setShowShareModal(false);
    } catch (error) {
      console.error('Failed to revoke public link:', error);
    }
  };

  if (isLoading) {
    return <Loading fullScreen message="Loading snippet..." />;
  }

  if (error || !snippet) {
    return (
      <div className="text-center py-12">
        <Lock className="h-16 w-16 text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
          Snippet Not Found
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
          This snippet doesn't exist or you don't have permission to view it.
        </p>
        <Button onClick={() => navigate('/my-snippets')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Snippets
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/my-snippets')}
          className="dark:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Snippets
        </Button>
        
        {isOwner && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowShareModal(true)}
              className="dark:text-white"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/edit/${id}`)}
              className="dark:text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleteMutation.isLoading}
              className="dark:text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Snippet Details */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card dark:shadow-cardDark">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
              {snippet.title}
            </h1>
            {snippet.description && (
              <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
                {snippet.description}
              </p>
            )}
            
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(snippet.$createdAt || snippet.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                {snippet.isPublic ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                <span>{snippet.isPublic ? 'Public' : 'Private'}</span>
              </div>
              {snippet.starsCount > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>{snippet.starsCount} stars</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-sm rounded-xl bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark">
              {snippet.language}
            </span>
            {!isOwner && user && (
              <Button
                onClick={handleToggleFavorite}
                variant="outline"
                size="sm"
                disabled={toggleStarMutation.isLoading || starMutation.isLoading}
                className="dark:text-white"
              >
                <Heart className={`h-4 w-4 mr-2 transition-colors ${
                  isStarred 
                    ? 'text-danger-light dark:text-danger-dark fill-current' 
                    : 'text-text-secondary-light dark:text-text-secondary-dark'
                }`} />
                {isStarred ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>
            )}
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="dark:text-white"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Tags */}
        {(() => {
          const tags = parseTags(snippet.tags);
          return tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border-light dark:border-border-dark">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 text-xs rounded-lg bg-secondary-light/10 text-secondary-light dark:bg-secondary-dark/10 dark:text-secondary-dark"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card dark:shadow-cardDark">
          <div className="flex items-center space-x-2 mb-4">
            <Paperclip className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark" />
            <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark">
              Attachments ({attachments.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {attachments.map((attachment, index) => {
              const FileIcon = getFileIcon(attachment.type);
              return (
                <div
                  key={attachment.id || index}
                  className="flex items-center space-x-3 p-3 bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark transition-colors"
                >
                  {isImage(attachment.type) ? (
                    <img
                      src={getFilePreview(attachment.id, 40, 40)}
                      alt={attachment.name}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <FileIcon 
                    className={`w-10 h-10 text-text-secondary-light dark:text-text-secondary-dark flex-shrink-0 ${
                      isImage(attachment.type) ? 'hidden' : 'block'
                    }`} 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      {attachment.type || 'Unknown type'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadAttachment(attachment)}
                    className="flex-shrink-0 dark:text-white"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Code Block */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card dark:shadow-cardDark overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center space-x-2">
            <Code2 className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark" />
            <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
              {snippet.language}
            </span>
          </div>
          <Button
            onClick={copyToClipboard}
            variant="ghost"
            size="sm"
            className="dark:text-white"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? 'Copied!' : 'Copy Code'}
          </Button>
        </div>
        
        <div className="p-6">
          <pre className="bg-background-light dark:bg-background-dark rounded-xl p-4 overflow-x-auto">
            <code className="text-text-primary-light dark:text-text-primary-dark font-mono text-sm whitespace-pre">
              {snippet.code}
            </code>
          </pre>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
              Share Snippet
            </h3>
            
            {snippet.isPublic ? (
              <div className="space-y-4">
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  This snippet is public. Anyone with the link can view it.
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/s/${snippet.publicId}`}
                    readOnly
                    className="flex-1 px-3 py-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/s/${snippet.publicId}`)}
                  >
                    Copy
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRevokePublicLink}
                  disabled={revokeLinkMutation.isLoading}
                  className="w-full"
                >
                  Make Private
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  This snippet is private. Generate a public link to share it.
                </p>
                <Button
                  onClick={handleGeneratePublicLink}
                  disabled={generateLinkMutation.isLoading}
                  className="w-full"
                >
                  Generate Public Link
                </Button>
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowShareModal(false)}
                className="dark:text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SnippetDetails;