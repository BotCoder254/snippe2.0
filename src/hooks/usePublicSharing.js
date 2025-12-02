import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databases, DATABASE_ID, SNIPPETS_COLLECTION_ID, Query } from '../utils/appwrite';

export const usePublicSnippet = (publicId) => {
  return useQuery({
    queryKey: ['snippet', 'public', publicId],
    queryFn: async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          SNIPPETS_COLLECTION_ID,
          [
            Query.equal('publicId', publicId),
            Query.equal('isPublic', true),
            Query.limit(1)
          ]
        );
        
        if (response.documents.length === 0) {
          throw new Error('Snippet not found or not public');
        }
        
        return response.documents[0];
      } catch (error) {
        console.error('Failed to fetch public snippet:', error);
        throw error;
      }
    },
    enabled: !!publicId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGeneratePublicLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ snippetId }) => {
      // Generate a short public ID
      const publicId = Math.random().toString(36).substring(2, 8);
      
      const response = await databases.updateDocument(
        DATABASE_ID,
        SNIPPETS_COLLECTION_ID,
        snippetId,
        {
          isPublic: true,
          publicId: publicId,
          updatedAt: new Date().toISOString()
        }
      );
      
      return {
        ...response,
        publicUrl: `${window.location.origin}/s/${publicId}`
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['snippet', data.$id]);
      queryClient.invalidateQueries(['snippets']);
    },
  });
};

export const useRevokePublicLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ snippetId }) => {
      const response = await databases.updateDocument(
        DATABASE_ID,
        SNIPPETS_COLLECTION_ID,
        snippetId,
        {
          isPublic: false,
          updatedAt: new Date().toISOString()
        }
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['snippet', data.$id]);
      queryClient.invalidateQueries(['snippets']);
    },
  });
};