import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, ExternalLink, Code2, Calendar, User, Tag, Star, Eye, Lock } from 'lucide-react';
import { usePublicSnippet } from '../hooks/usePublicSharing';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import Loading from '../components/ui/Loading';

const PublicSnippet = () => {
  const { publicId } = useParams();
  const [copied, setCopied] = useState(false);
  
  const { data: snippet, isLoading, error } = usePublicSnippet(publicId);

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

  if (isLoading) {
    return <Loading fullScreen message="Loading snippet..." />;
  }

  if (error || !snippet) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Lock className="h-16 w-16 text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
            Snippet Not Found
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
            This snippet doesn't exist, has been made private, or the link is invalid.
          </p>
          <Link to="/">
            <Button>
              <Code2 className="h-4 w-4 mr-2" />
              Visit SNIPPE2.0
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
              <Code2 className="h-8 w-8 text-primary-light dark:text-primary-dark" />
              <span className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                SNIPPE2.0
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Snippet Header */}
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
                    <span>{new Date(snippet.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>Public</span>
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
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            {/* Tags */}
            {snippet.tags && snippet.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                {snippet.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 text-xs rounded-lg bg-secondary-light/10 text-secondary-light dark:bg-secondary-dark/10 dark:text-secondary-dark"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

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

          {/* Call to Action */}
          <div className="bg-primary-light dark:bg-primary-dark rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-2">
              Like this snippet?
            </h2>
            <p className="text-white/90 mb-6">
              Join SNIPPE2.0 to create, share, and discover more amazing code snippets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="outline" size="lg" className="bg-white text-primary-light hover:bg-white/90 border-white">
                  Sign Up Free
                </Button>
              </Link>
              <Link to="/browse">
                <Button variant="outline" size="lg" className="bg-transparent text-white border-white hover:bg-white/10">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Explore More
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PublicSnippet;