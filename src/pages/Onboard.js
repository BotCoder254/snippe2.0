import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, User, Hash, Globe, Languages } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ThemeToggle from '../components/ui/ThemeToggle';

const LANGUAGE_OPTIONS = [
  'JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'C#', 'Go', 'Rust', 
  'PHP', 'Ruby', 'Swift', 'Kotlin', 'HTML', 'CSS', 'SQL', 'Shell'
];

const Onboard = () => {
  const { createProfile, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.name || '',
    handle: '',
    bio: '',
    preferredLanguages: [],
    isPublicProfile: false
  });
  const [errors, setErrors] = useState({});

  // Update form data when user loads
  useEffect(() => {
    if (user?.name && !formData.displayName) {
      setFormData(prev => ({
        ...prev,
        displayName: user.name
      }));
    }
  }, [user, formData.displayName]);

  // Redirect to auth if no user
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  const handleLanguageToggle = (language) => {
    setFormData(prev => ({
      ...prev,
      preferredLanguages: prev.preferredLanguages.includes(language)
        ? prev.preferredLanguages.filter(l => l !== language)
        : [...prev.preferredLanguages, language]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    
    if (!formData.handle.trim()) {
      newErrors.handle = 'Handle is required';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.handle)) {
      newErrors.handle = 'Handle can only contain letters, numbers, and underscores';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createProfile(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile creation failed:', error);
      setErrors({ submit: error.message || 'Failed to create profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary-light dark:border-primary-dark border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            {authLoading ? 'Loading...' : 'Redirecting to sign in...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary-light dark:bg-secondary-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-8">
              <User className="h-16 w-16 mr-4" />
              <h1 className="text-5xl font-bold">Almost there!</h1>
            </div>
            <p className="text-xl opacity-90 max-w-md">
              Let's set up your profile to get you started with SNIPPE2.0
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Onboarding Form */}
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
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Code2 className="h-8 w-8 mr-2 text-primary-light dark:text-primary-dark" />
            <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              SNIPPE2.0
            </h1>
          </div>

          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-card dark:shadow-cardDark p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                Complete your profile
              </h2>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                Tell us a bit about yourself
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Display Name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                error={errors.displayName}
                placeholder="Your full name"
              />

              <Input
                label="Handle"
                value={formData.handle}
                onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                error={errors.handle}
                placeholder="username"
              />

              <Input
                label="Bio (Optional)"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
              />

              <div>
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
                  Preferred Languages
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGE_OPTIONS.map((language) => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => handleLanguageToggle(language)}
                      className={`
                        px-3 py-2 text-sm rounded-xl border transition-colors
                        ${formData.preferredLanguages.includes(language)
                          ? 'bg-primary-light text-white border-primary-light dark:bg-primary-dark dark:border-primary-dark'
                          : 'bg-surface-light text-text-primary-light border-border-light hover:bg-background-light dark:bg-surface-dark dark:text-text-primary-dark dark:border-border-dark dark:hover:bg-background-dark'
                        }
                      `}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="publicProfile"
                  checked={formData.isPublicProfile}
                  onChange={(e) => setFormData({ ...formData, isPublicProfile: e.target.checked })}
                  className="h-4 w-4 text-primary-light focus:ring-primary-light border-border-light rounded dark:border-border-dark dark:focus:ring-primary-dark"
                />
                <label htmlFor="publicProfile" className="text-sm text-text-primary-light dark:text-text-primary-dark">
                  Make my profile public
                </label>
              </div>

              {errors.submit && (
                <p className="text-sm text-danger-light dark:text-danger-dark text-center">
                  {errors.submit}
                </p>
              )}

              <Button
                type="submit"
                loading={loading}
                size="lg"
                className="w-full"
              >
                Complete Setup
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Onboard;