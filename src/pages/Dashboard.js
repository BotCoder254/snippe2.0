import { motion } from 'framer-motion';
import { Plus, Code, Clock, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useUserSnippets, useFavoriteSnippets } from '../hooks/useSnippets';
import SnippetCard from '../components/snippets/SnippetCard';

const Dashboard = () => {
  const { profile, user } = useAuth();
  const { data: userSnippets = [] } = useUserSnippets(user?.$id);
  const { data: favoriteSnippets = [] } = useFavoriteSnippets(user?.$id);

  const stats = [
    { name: 'Total Snippets', value: userSnippets.length, icon: Code, color: 'primary' },
    { name: 'Favorites', value: favoriteSnippets.length, icon: Star, color: 'warning' },
    { name: 'Public Snippets', value: userSnippets.filter(s => s.isPublic).length, icon: TrendingUp, color: 'success' },
    { name: 'Total Stars', value: userSnippets.reduce((sum, s) => sum + (s.starsCount || 0), 0), icon: Clock, color: 'info' },
  ];

  const recentSnippets = userSnippets.slice(0, 5); // Show latest 5 snippets

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Welcome back, {profile?.displayName || 'Developer'}!
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">
              Ready to create something amazing today?
            </p>
          </div>
          <Link to="/create">
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              New Snippet
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card dark:shadow-cardDark"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-light/10 dark:bg-${stat.color}-dark/10`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-light dark:text-${stat.color}-dark`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Snippets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card dark:shadow-cardDark"
      >
        <div className="p-6 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
              Recent Snippets
            </h2>
            <Link to="/my-snippets">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </div>
        
        {recentSnippets.length === 0 ? (
          <div className="p-12 text-center">
            <Code className="h-12 w-12 text-text-secondary-light dark:text-text-secondary-dark mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              No snippets yet
            </h3>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
              Create your first snippet to get started
            </p>
            <Link to="/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Snippet
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {recentSnippets.map((snippet, index) => (
              <motion.div
                key={snippet.$id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                className="p-6 hover:bg-background-light dark:hover:bg-background-dark transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                        {snippet.title}
                      </h3>
                      <span className="px-2 py-1 text-xs rounded-xl bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark">
                        {snippet.language}
                      </span>
                      {snippet.isPublic && (
                        <span className="px-2 py-1 text-xs rounded-xl bg-success-light/10 text-success-light dark:bg-success-dark/10 dark:text-success-dark">
                          Public
                        </span>
                      )}
                      {snippet.starsCount > 0 && (
                        <span className="px-2 py-1 text-xs rounded-xl bg-warning-light/10 text-warning-light dark:bg-warning-dark/10 dark:text-warning-dark flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          {snippet.starsCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                      Updated {new Date(snippet.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link to={`/snippet/${snippet.$id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Link to="/create" className="group">
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card dark:shadow-cardDark group-hover:shadow-lg dark:group-hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-primary-light/10 dark:bg-primary-dark/10">
                <Plus className="h-6 w-6 text-primary-light dark:text-primary-dark" />
              </div>
              <div>
                <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                  Create Snippet
                </h3>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Start coding something new
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/browse" className="group">
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card dark:shadow-cardDark group-hover:shadow-lg dark:group-hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-secondary-light/10 dark:bg-secondary-dark/10">
                <TrendingUp className="h-6 w-6 text-secondary-light dark:text-secondary-dark" />
              </div>
              <div>
                <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                  Explore Public
                </h3>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Discover community snippets
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/favorites" className="group">
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-card dark:shadow-cardDark group-hover:shadow-lg dark:group-hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-warning-light/10 dark:bg-warning-dark/10">
                <Star className="h-6 w-6 text-warning-light dark:text-warning-dark" />
              </div>
              <div>
                <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                  Your Favorites
                </h3>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Quick access to saved snippets
                </p>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
};

export default Dashboard;