import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Code2, Github, Chrome, ArrowRight, Twitter, MessageCircle,
  Filter, Star, Clock, TrendingUp, Hash, Zap, Database, Globe,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import SnippetCard from '../components/snippets/SnippetCard';
import { usePublicSnippets } from '../hooks/useSnippets';
import { usePopularTags } from '../hooks/useTags';

const Landing = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 21;

  // Fetch public snippets for showcase with real-time updates
  const { data: snippets = [], isLoading } = usePublicSnippets(100, true);
  const { data: popularTags = [] } = usePopularTags(20, true);





  // Filter snippets based on selected filters
  const getFilteredSnippets = () => {
    let filtered = [...snippets]; // Use real data only
    
    // Apply language filter
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(snippet => 
        snippet.language.toLowerCase() === selectedLanguage
      );
    }
    
    // Apply sorting based on filter
    switch (selectedFilter) {
      case 'popular':
      case 'starred':
        return filtered.sort((a, b) => (b.starsCount || 0) - (a.starsCount || 0));
      case 'recent':
        return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      default:
        return filtered;
    }
  };
  
  const allFilteredSnippets = getFilteredSnippets();
  const totalPages = Math.ceil(allFilteredSnippets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displaySnippets = allFilteredSnippets.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    if (filterType === 'filter') {
      setSelectedFilter(value);
    } else if (filterType === 'language') {
      setSelectedLanguage(value);
    }
  };

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    };

    return (
      <div className="flex items-center justify-center space-x-2 mt-12">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-light dark:hover:bg-background-dark transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        {getPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === page
                ? 'bg-primary-light dark:bg-primary-dark text-white'
                : 'bg-surface-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background-light dark:hover:bg-background-dark transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Code2 className="h-8 w-8 text-primary-light dark:text-primary-dark" />
              <span className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                SNIPPE2.0
              </span>
            </div>
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

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary-light dark:text-text-primary-dark mb-6"
            >
              Share, Discover, and Organize
              <span className="block text-primary-light dark:text-primary-dark">
                Your Code Snippets
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-text-secondary-light dark:text-text-secondary-dark mb-8 max-w-3xl mx-auto"
            >
              Join the open-source community of developers sharing code snippets. 
              Store your code, discover solutions, and collaborate with developers worldwide.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto">
                  <Github className="h-5 w-5 mr-2" />
                  Sign Up with GitHub
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <Chrome className="h-5 w-5 mr-2" />
                  Sign Up with Google
                </Button>
              </Link>
              <button
                onClick={() => document.getElementById('snippets-showcase').scrollIntoView({ behavior: 'smooth' })}
                className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors flex items-center"
              >
                Explore Snippets
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary-light/10 dark:bg-primary-dark/10 rounded-2xl rotate-12" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-secondary-light/10 dark:bg-secondary-dark/10 rounded-2xl -rotate-12" />
        <div className="absolute top-1/2 right-40 w-16 h-16 bg-success-light/10 dark:bg-success-dark/10 rounded-2xl rotate-45" />
      </section>



      {/* Snippets Showcase */}
      <section id="snippets-showcase" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
              Discover Amazing Code Snippets
            </h2>
            <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto mb-8">
              Explore snippets shared by our community of developers. Find solutions, get inspired, and contribute your own.
            </p>

            {/* Quick Filter Icons */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                { key: 'all', icon: Globe, label: 'All', color: 'primary' },
                { key: 'popular', icon: TrendingUp, label: 'Popular', color: 'warning' },
                { key: 'recent', icon: Clock, label: 'Recent', color: 'success' },
                { key: 'starred', icon: Star, label: 'Most Starred', color: 'info' }
              ].map(filter => {
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.key}
                    onClick={() => handleFilterChange('filter', filter.key)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                      selectedFilter === filter.key
                        ? `bg-${filter.color}-light dark:bg-${filter.color}-dark text-white`
                        : 'bg-surface-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{filter.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Language Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {['all', 'javascript', 'python', 'css', 'html', 'typescript', 'java', 'go'].map(lang => (
                <button
                  key={lang}
                  onClick={() => handleFilterChange('language', lang)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    selectedLanguage === lang
                      ? 'bg-secondary-light dark:bg-secondary-dark text-white'
                      : 'bg-border-light/50 dark:bg-border-dark/50 text-text-secondary-light dark:text-text-secondary-dark hover:bg-border-light dark:hover:bg-border-dark'
                  }`}
                >
                  {lang === 'all' ? 'All Languages' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>

            {/* Popular Tags */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Hash className="h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
                <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                  Popular Tags
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {popularTags.slice(0, 12).map(tag => (
                  <span
                    key={tag.name}
                    className="inline-flex items-center px-3 py-1 text-xs rounded-full bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark border border-primary-light/20 dark:border-primary-dark/20"
                  >
                    #{tag.name}
                    <span className="ml-1 text-text-secondary-light dark:text-text-secondary-dark">
                      {tag.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {[...Array(21)].map((_, i) => (
                <div key={i} className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 animate-pulse break-inside-avoid mb-6" style={{ height: `${200 + Math.random() * 100}px` }}>
                  <div className="h-4 bg-border-light dark:bg-border-dark rounded mb-4"></div>
                  <div className="h-3 bg-border-light dark:bg-border-dark rounded mb-2"></div>
                  <div className="h-20 bg-border-light dark:bg-border-dark rounded mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 w-16 bg-border-light dark:bg-border-dark rounded"></div>
                    <div className="h-6 w-12 bg-border-light dark:bg-border-dark rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : allFilteredSnippets.length === 0 ? (
            <div className="text-center py-16">
              <Code2 className="h-16 w-16 text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                No snippets available
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                Be the first to share a code snippet with the community!
              </p>
              <Link to="/auth">
                <Button>
                  <Github className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {displaySnippets.map((snippet, index) => (
                  <motion.div
                    key={`${snippet.$id}-${currentPage}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="break-inside-avoid mb-6"
                  >
                    <SnippetCard
                      snippet={snippet}
                      showAuthor={true}
                      onClick={(snippet) => {
                        if (snippet.isPublic) {
                          window.open(`/s/${snippet.publicId}`, '_blank');
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </div>
              
              {/* Results Info */}
              <div className="text-center mt-8 mb-4">
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, allFilteredSnippets.length)} of {allFilteredSnippets.length} snippets
                </p>
              </div>
              
              {/* Pagination */}
              <Pagination />
            </>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/auth">
              <Button size="lg">
                View All Snippets
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-light dark:bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Join the Community?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Start sharing your code snippets today. Connect with developers, 
              learn from others, and build something amazing together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="outline" size="lg" className="bg-white text-primary-light hover:bg-white/90 border-white">
                  <Github className="h-5 w-5 mr-2" />
                  Get Started with GitHub
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="bg-white text-primary-light hover:bg-white/90 border-white">
                  <Chrome className="h-5 w-5 mr-2" />
                  Get Started with Google
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Code2 className="h-8 w-8 text-primary-light dark:text-primary-dark" />
                <span className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  SNIPPE2.0
                </span>
              </div>
              <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4 max-w-md">
                The open-source platform for sharing and discovering code snippets. 
                Built by developers, for developers.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors">
                  <MessageCircle className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
                Product
              </h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors">Features</a></li>
                <li><a href="#" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors">Pricing</a></li>
                <li><a href="#" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors">API</a></li>
                <li><a href="#" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
                Community
              </h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors">GitHub</a></li>
                <li><a href="#" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors">Discord</a></li>
                <li><a href="#" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors">Blog</a></li>
                <li><a href="#" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors">Support</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border-light dark:border-border-dark mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              © 2024 SNIPPE2.0. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors text-sm">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;