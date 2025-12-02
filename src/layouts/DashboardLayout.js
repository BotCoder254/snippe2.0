import { useState } from 'react';
import { Menu, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import SearchBar from '../components/ui/SearchBar';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleSearchResultSelect = (snippet) => {
    if (snippet.isPublic) {
      navigate(`/s/${snippet.publicId}`);
    } else {
      navigate(`/my-snippets?highlight=${snippet.$id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-background-light dark:hover:bg-background-dark"
              >
                <Menu className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark" />
              </button>
              
              {/* Search Bar */}
              <SearchBar 
                onResultSelect={handleSearchResultSelect}
                className="w-64 md:w-80"
              />
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 rounded-xl hover:bg-background-light dark:hover:bg-background-dark relative">
                <Bell className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-danger-light dark:bg-danger-dark rounded-full"></span>
              </button>

              {/* User Avatar */}
              <div className="h-8 w-8 bg-primary-light dark:bg-primary-dark rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {profile?.displayName?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;