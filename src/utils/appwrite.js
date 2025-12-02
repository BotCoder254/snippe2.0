import { Client, Account, Databases, Storage, Query } from 'appwrite';

const client = new Client();

const endpoint = process.env.REACT_APP_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.REACT_APP_APPWRITE_PROJECT_ID || '692e17f60008b8c4b6d7';

if (endpoint === 'https://cloud.appwrite.io/v1' && projectId === 'your_project_id_here') {
  console.warn('⚠️ Please configure your Appwrite environment variables in .env file');
}

client
  .setEndpoint(endpoint)
  .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = process.env.REACT_APP_APPWRITE_DATABASE_ID || '692e1cc30000ba818e1e';
export const PROFILES_COLLECTION_ID = process.env.REACT_APP_APPWRITE_PROFILES_COLLECTION_ID || 'profiles';
export const SNIPPETS_COLLECTION_ID = process.env.REACT_APP_APPWRITE_SNIPPETS_COLLECTION_ID || 'snippets';
export const STORAGE_BUCKET_ID = process.env.REACT_APP_APPWRITE_STORAGE_BUCKET_ID || '692e3161000264fdf6ae';
export const STARS_COLLECTION_ID = process.env.REACT_APP_APPWRITE_STARS_COLLECTION_ID || 'stars';
export const LIBRARIES_COLLECTION_ID = process.env.REACT_APP_APPWRITE_LIBRARIES_COLLECTION_ID || 'libraries';

export { Query };
export default client;