import { createContext, useContext, useEffect, useState } from 'react';
import { account, databases, DATABASE_ID, PROFILES_COLLECTION_ID } from '../utils/appwrite';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
      await fetchProfile(currentUser.$id);
    } catch (error) {
      // Only log error if it's not a guest user (expected)
      if (error.code !== 401) {
        console.error('Auth check error:', error);
      }
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId) => {
    try {
      const userProfile = await databases.getDocument(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        userId
      );
      setProfile(userProfile);
    } catch (error) {
      console.error('Profile fetch error:', error);
      setProfile(null);
    }
  };

  const login = async (email, password) => {
    try {
      await account.createEmailPasswordSession(email, password);
      await checkAuth();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email, password, name) => {
    try {
      await account.create('unique()', email, password, name);
      await account.createEmailPasswordSession(email, password);
      await checkAuth();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await account.createRecovery(email, `${window.location.origin}/reset-password`);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const createProfile = async (profileData) => {
    try {
      // Force refresh authentication state
      let currentUser;
      try {
        currentUser = await account.get();
        setUser(currentUser);
        console.log('Current user:', currentUser);
      } catch (authError) {
        console.error('Auth error:', authError);
        // Don't redirect immediately, let the component handle it
        throw new Error('Please sign in again');
      }

      const profileDoc = {
        userId: currentUser.$id,
        displayName: profileData.displayName.trim(),
        handle: profileData.handle.trim().toLowerCase(),
        bio: profileData.bio?.trim() || '',
        avatarStorageId: profileData.avatarStorageId || '',
        preferredLanguages: JSON.stringify(profileData.preferredLanguages || []),
        role: 'user',
        isPublicProfile: profileData.isPublicProfile || false
      };
      
      const newProfile = await databases.createDocument(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        currentUser.$id,
        profileDoc
      );
      setProfile(newProfile);
      return newProfile;
    } catch (error) {
      console.error('Profile creation error:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    resetPassword,
    logout,
    createProfile,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};