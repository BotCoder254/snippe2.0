import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Chrome, Code2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import Loading from '../components/ui/Loading';

const Auth = () => {
  const { loginWithGitHub, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState({ github: false, google: false });

  const handleGitHubLogin = async () => {
    setLoading({ ...loading, github: true });
    try {
      await loginWithGitHub();
    } catch (error) {
      console.error('GitHub login failed:', error);
    } finally {
      setLoading({ ...loading, github: false });
    }
  };

  const handleGoogleLogin = async () => {
    setLoading({ ...loading, google: true });
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google login failed:', error);
    } finally {
      setLoading({ ...loading, google: false });
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex">
      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-light dark:bg-primary-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-8">
              <Code2 className="h-16 w-16 mr-4" />
              <h1 className="text-5xl font-bold">SNIPPE2.0</h1>
            </div>
            <p className="text-xl opacity-90 max-w-md">
              Store, organize, and share your code snippets with the developer community
            </p>
          </motion.div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-2xl rotate-12" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-2xl -rotate-12" />
        <div className="absolute top-1/2 right-40 w-16 h-16 bg-white/10 rounded-2xl rotate-45" />
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Code2 className="h-8 w-8 mr-2 text-primary-light dark:text-primary-dark" />
            <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              SNIPPE2.0
            </h1>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card dark:shadow-cardDark p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                Welcome back
              </h2>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                Sign in to access your code snippets
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleGitHubLogin}
                loading={loading.github}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <Github className="h-5 w-5 mr-3" />
                Continue with GitHub
              </Button>

              <Button
                onClick={handleGoogleLogin}
                loading={loading.google}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <Chrome className="h-5 w-5 mr-3" />
                Continue with Google
              </Button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                We don't read your code. Your snippets are private by default.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;