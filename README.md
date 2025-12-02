# SNIPPE2.0 - Modern Code Snippet Platform

A modern, open-source code snippet management platform built with React, Appwrite, and Tailwind CSS. Share, discover, and organize your code snippets with the developer community.

## ✨ Features

### 🔐 Authentication & Onboarding
- **OAuth Integration**: GitHub and Google OAuth login
- **User Profiles**: Complete profile setup with handle, bio, and preferred languages
- **Public/Private Profiles**: Choose your visibility preferences

### 🎨 Modern UI/UX
- **Dark/Light Theme**: Seamless theme switching with system preference detection
- **Responsive Design**: Mobile-first design that works on all devices
- **Smooth Animations**: Tasteful micro-interactions with Framer Motion
- **Accessible**: Keyboard navigation and screen reader support

### 🏗️ Architecture
- **React 19.2.0**: Latest React with concurrent features
- **TanStack Query**: Efficient server state management and caching
- **Appwrite Backend**: Secure, scalable backend-as-a-service
- **Tailwind CSS**: Utility-first CSS with custom design system

### 🚀 Performance
- **Real-time Updates**: Live synchronization with Appwrite Realtime
- **Optimized Caching**: Smart caching strategies for better performance
- **Code Splitting**: Lazy loading for optimal bundle sizes

## 🛠️ Tech Stack

- **Frontend**: React 19.2.0, React Router, Framer Motion
- **Styling**: Tailwind CSS with custom color system
- **Icons**: Lucide React
- **State Management**: TanStack React Query
- **Backend**: Appwrite (Database, Auth, Storage, Realtime)
- **Build Tool**: Create React App
- **Testing**: React Testing Library, Jest

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Appwrite account

### 1. Clone and Install
```bash
git clone <repository-url>
cd snippe2.0
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Fill in your Appwrite credentials in `.env`:
```env
REACT_APP_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
REACT_APP_APPWRITE_PROJECT_ID=your_project_id
REACT_APP_APPWRITE_DATABASE_ID=your_database_id
REACT_APP_APPWRITE_PROFILES_COLLECTION_ID=your_profiles_collection_id
REACT_APP_APPWRITE_SNIPPETS_COLLECTION_ID=your_snippets_collection_id
REACT_APP_APPWRITE_STORAGE_BUCKET_ID=your_storage_bucket_id
```

### 3. Appwrite Setup

#### Create Project
1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Create a new project
3. Note your Project ID

#### Configure Authentication
1. **GitHub OAuth**:
   - Go to Auth → Settings → OAuth2 Providers
   - Enable GitHub provider
   - Add your GitHub OAuth App credentials
   - Set redirect URL: `http://localhost:3000/onboard`

2. **Google OAuth**:
   - Enable Google provider
   - Add your Google OAuth credentials
   - Set redirect URL: `http://localhost:3000/onboard`

#### Create Database and Collections

**Database**: Create database named `snippe-db`

**Profiles Collection**:
```
Collection ID: profiles
Attributes:
- userId (string, required, unique)
- displayName (string, required)
- handle (string, required, unique)
- bio (string, optional)
- avatarStorageId (string, optional)
- preferredLanguages (string array, optional)
- role (string, required, default: "user")
- isPublicProfile (boolean, required, default: false)
- createdAt (datetime, required)
```

**Snippets Collection**:
```
Collection ID: snippets
Attributes:
- ownerId (string, required)
- title (string, required)
- description (string, optional)
- language (string, required)
- code (string, required)
- attachments (string array, optional)
- tags (string array, optional)
- isPublic (boolean, required, default: false)
- publicId (string, required, unique)
- starsCount (integer, default: 0)
- isFlagged (boolean, default: false)
- createdAt (datetime, required)
- updatedAt (datetime, required)
```

**Stars Collection**:
```
Collection ID: stars
Attributes:
- userId (string, required)
- snippetId (string, required)
- createdAt (datetime, required)
```

**Libraries Collection**:
```
Collection ID: libraries
Attributes:
- ownerId (string, required)
- name (string, required)
- snippetIds (string array, optional)
- isPrivate (boolean, required, default: true)
- createdAt (datetime, required)
```

**Storage Bucket**: Create bucket named `avatars` for profile pictures

### 4. Start Development
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Sidebar, etc.)
│   ├── snippets/       # Snippet-related components
│   └── ui/             # Reusable UI components
├── contexts/           # React contexts (Auth, Theme)
├── hooks/              # Custom React hooks
├── layouts/            # Page layouts
├── pages/              # Page components
├── utils/              # Utility functions and configs
└── App.js              # Main app component
```

## 🎨 Design System

### Color Palette
- **Primary**: Purple (#7C3AED) - Main brand color
- **Secondary**: Amber (#FBBF24) - Accent color
- **Success**: Green (#16A34A) - Success states
- **Warning**: Yellow (#EAB308) - Warning states
- **Danger**: Red (#DC2626) - Error states
- **Info**: Cyan (#22D3EE) - Information

### Theme Support
- Automatic dark/light mode detection
- Manual theme toggle
- Consistent color variants for both themes
- Smooth transitions between themes

## 🔧 Available Scripts

```bash
# Development
npm start          # Start development server
npm test           # Run test suite
npm run build      # Build for production

# Linting & Formatting
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

## 🌟 Key Features Implemented

### ✅ Landing Page
- Hero section with clear value proposition
- Public snippets showcase
- Community features highlight
- Responsive design with animations

### ✅ Authentication System
- GitHub OAuth integration
- Google OAuth integration
- Protected routes
- Session management

### ✅ User Onboarding
- Profile creation flow
- Handle selection with validation
- Preferred languages selection
- Public profile toggle

### ✅ Dashboard Layout
- Responsive sidebar navigation
- Search functionality
- User avatar and settings
- Mobile-friendly hamburger menu

### ✅ Theme System
- Dark/light mode toggle
- System preference detection
- Smooth transitions
- Consistent color system

## 🚧 Upcoming Features

- [ ] Snippet creation and editing
- [ ] Syntax highlighting
- [ ] Real-time collaboration
- [ ] Advanced search and filtering
- [ ] Favorites and collections
- [ ] Social features (likes, comments)
- [ ] API documentation
- [ ] Mobile app

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Appwrite](https://appwrite.io/) - Backend platform
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Lucide](https://lucide.dev/) - Icon library
- [TanStack Query](https://tanstack.com/query) - Data fetching library

## 📞 Support

If you have any questions or need help setting up the project, please:

1. Check the [documentation](docs/)
2. Search existing [issues](issues/)
3. Create a new [issue](issues/new) if needed

---

**Built with ❤️ by the developer community**