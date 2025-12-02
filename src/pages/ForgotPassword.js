import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Code2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ThemeToggle from '../components/ui/ThemeToggle';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await resetPassword(email);
      setSent(true);
    } catch (error) {
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex">
      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-info-light dark:bg-info-dark relative overflow-hidden">
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
              Don't worry, we'll help you get back to your code snippets
            </p>
          </motion.div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-2xl rotate-12" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-2xl -rotate-12" />
        <div className="absolute top-1/2 right-40 w-16 h-16 bg-white/10 rounded-2xl rotate-45" />
      </div>

      {/* Right Side - Reset Form */}
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
            {!sent ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                    Forgot your password?
                  </h2>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark">
                    Enter your email address and we'll send you a link to reset your password
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={error}
                    placeholder="Enter your email address"
                    icon={Mail}
                  />

                  <Button
                    type="submit"
                    loading={loading}
                    size="lg"
                    className="w-full"
                  >
                    Send Reset Link
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-success-light/10 dark:bg-success-dark/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-8 w-8 text-success-light dark:text-success-dark" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                  Check your email
                </h2>
                <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => {
                      setSent(false);
                      setEmail('');
                      setError('');
                    }}
                    className="text-primary-light dark:text-primary-dark hover:underline"
                  >
                    try again
                  </button>
                </p>
              </div>
            )}

            <div className="mt-8 text-center">
              <Link
                to="/auth"
                className="inline-flex items-center text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;