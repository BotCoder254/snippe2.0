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

  const loginWithGitHub = async () => {
    try {
      await account.createOAuth2Session('github', 
        `${window.location.origin}/dashboard`,
        `${window.location.origin}/auth`
      );
    } catch (error) {
      console.error('GitHub login error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await account.createOAuth2Session('google',
        `${window.location.origin}/dashboard`,
        `${window.location.origin}/auth`
      );
    } catch (error) {
      console.error('Google login error:', error);
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
        preferredLanguages: profileData.preferredLanguages || [],
        role: 'user',
        isPublicProfile: profileData.isPublicProfile || false,
        createdAt: new Date().toISOString()
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
    loginWithGitHub,
    loginWithGoogle,
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