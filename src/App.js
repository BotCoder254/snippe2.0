import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import DashboardLayout from './layouts/DashboardLayout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Onboard from './pages/Onboard';
import Dashboard from './pages/Dashboard';
import MySnippets from './pages/MySnippets';
import BrowsePublic from './pages/BrowsePublic';
import CreateSnippet from './pages/CreateSnippet';
import Tags from './pages/Tags';
import Favorites from './pages/Favorites';
import Collections from './pages/Collections';
import PublicSnippet from './pages/PublicSnippet';
import SearchResults from './pages/SearchResults';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';
import Loading from './components/ui/Loading';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen message="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return <Navigate to="/onboard" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

const PublicRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen message="Loading..." />;
  }

  if (user && profile) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route 
                  path="/" 
                  element={<Landing />} 
                />
                <Route 
                  path="/auth" 
                  element={
                    <PublicRoute>
                      <Auth />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/forgot-password" 
                  element={
                    <PublicRoute>
                      <ForgotPassword />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/onboard" 
                  element={<Onboard />} 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/my-snippets" 
                  element={
                    <ProtectedRoute>
                      <MySnippets />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/favorites" 
                  element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/collections" 
                  element={
                    <ProtectedRoute>
                      <Collections />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/s/:publicId" 
                  element={<PublicSnippet />} 
                />
                <Route 
                  path="/browse" 
                  element={
                    <ProtectedRoute>
                      <BrowsePublic />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/create" 
                  element={
                    <ProtectedRoute>
                      <CreateSnippet />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tags" 
                  element={
                    <ProtectedRoute>
                      <Tags />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/search" 
                  element={
                    <ProtectedRoute>
                      <SearchResults />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                          Settings
                        </h1>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">
                          Coming soon...
                        </p>
                      </div>
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;