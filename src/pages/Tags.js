import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Tag, TrendingUp, Hash, Filter, Grid, List } from 'lucide-react';
import { usePopularTags } from '../hooks/useTags';
import { usePublicSnippets } from '../hooks/useSnippets';
import Loading from '../components/ui/Loading';

const Tags = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // popular, alphabetical, recent
  const [viewMode, setViewMode] = useState('grid');

  const { data: popularTags = [], isLoading: tagsLoading } = usePopularTags(100);
  const { data: snippets = [] } = usePublicSnippets(200);

  // Calculate tag statistics from snippets
  const tagStats = {};
  snippets.forEach(snippet => {
    if (snippet.tags && Array.isArray(snippet.tags)) {
      snippet.tags.forEach(tag => {
        const normalizedTag = tag.toLowerCase().trim();
        if (!tagStats[normalizedTag]) {
          tagStats[normalizedTag] = {
            name: normalizedTag,
            count: 0,
            snippets: [],
            languages: new Set()
          };
        }
        tagStats[normalizedTag].count++;
        tagStats[normalizedTag].snippets.push(snippet);
        tagStats[normalizedTag].languages.add(snippet.language);
      });
    }
  });

  const allTags = Object.values(tagStats);

  const filteredTags = allTags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTags = [...filteredTags].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      case 'recent':
        // Sort by most recent snippet using this tag
        const aLatest = Math.max(...a.snippets.map(s => new Date(s.createdAt).getTime()));
        const bLatest = Math.max(...b.snippets.map(s => new Date(s.createdAt).getTime()));
        return bLatest - aLatest;
      case 'popular':
      default:
        return b.count - a.count;
    }
  });

  const handleTagClick = (tagName) => {
    navigate(`/browse?tag=${encodeURIComponent(tagName)}`);
  };

  const getTagColor = (index) => {
    const colors = [
      'primary', 'secondary', 'success', 'warning', 'info', 'danger'
    ];
    return colors[index % colors.length];
  };

  if (tagsLoading) {
    return <Loading fullScreen message="Loading tags..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Explore Tags
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2 max-w-2xl mx-auto">
            Discover code snippets by tags. Find exactly what you're looking for or explore new technologies and concepts.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Tags', value: allTags.length, icon: Tag, color: 'primary' },
          { label: 'Popular Tags', value: allTags.filter(t => t.count >= 5).length, icon: TrendingUp, color: 'success' },
          { label: 'Languages', value: new Set(snippets.map(s => s.language)).size, icon: Hash, color: 'warning' },
          { label: 'Tagged Snippets', value: snippets.filter(s => s.tags?.length > 0).length, icon: Filter, color: 'info' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-card dark:shadow-cardDark"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-xl bg-${stat.color}-light/10 dark:bg-${stat.color}-dark/10`}>
                  <Icon className={`h-5 w-5 text-${stat.color}-light dark:text-${stat.color}-dark`} />
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card dark:shadow-cardDark"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary-light dark:text-text-secondary-dark" />
              <input
                type="text"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-border-light dark:border-border-dark rounded-xl bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
            >
              <option value="popular">Most Popular</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="recent">Recently Used</option>
            </select>

            <div className="flex items-center border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-light text-white dark:bg-primary-dark' : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-light text-white dark:bg-primary-dark' : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tags Display */}
      {sortedTags.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center py-12"
        >
          <Tag className="h-16 w-16 text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
            No tags found
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Try adjusting your search criteria
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-3'
          }
        >
          {sortedTags.map((tag, index) => {
            const color = getTagColor(index);
            return (
              <motion.button
                key={tag.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.02 }}
                onClick={() => handleTagClick(tag.name)}
                className={`${viewMode === 'grid' 
                  ? 'p-4 rounded-2xl' 
                  : 'p-3 rounded-xl flex items-center justify-between'
                } bg-surface-light dark:bg-surface-dark shadow-card dark:shadow-cardDark hover:shadow-lg dark:hover:shadow-xl transition-all duration-200 text-left group`}
              >
                {viewMode === 'grid' ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg bg-${color}-light/10 dark:bg-${color}-dark/10`}>
                        <Tag className={`h-4 w-4 text-${color}-light dark:text-${color}-dark`} />
                      </div>
                      <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {tag.count} snippets
                      </span>
                    </div>
                    <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
                      #{tag.name}
                    </h3>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                      {Array.from(tag.languages).slice(0, 3).join(', ')}
                      {tag.languages.size > 3 && ` +${tag.languages.size - 3} more`}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-${color}-light/10 dark:bg-${color}-dark/10`}>
                        <Tag className={`h-4 w-4 text-${color}-light dark:text-${color}-dark`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
                          #{tag.name}
                        </h3>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                          {Array.from(tag.languages).slice(0, 2).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                        {tag.count}
                      </span>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        snippets
                      </p>
                    </div>
                  </>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default Tags;