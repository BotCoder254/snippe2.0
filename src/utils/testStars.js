// Test file to check stars collection
import { databases, DATABASE_ID, STARS_COLLECTION_ID } from './appwrite';

export const testStarsCollection = async () => {
  try {
    console.log('Testing stars collection...');
    console.log('DATABASE_ID:', DATABASE_ID);
    console.log('STARS_COLLECTION_ID:', STARS_COLLECTION_ID);
    
    // Try to list documents to see if collection exists
    const response = await databases.listDocuments(
      DATABASE_ID,
      STARS_COLLECTION_ID,
      []
    );
    
    console.log('Stars collection exists and is accessible:', response);
    return true;
  } catch (error) {
    console.error('Stars collection test failed:', error);
    return false;
  }
};