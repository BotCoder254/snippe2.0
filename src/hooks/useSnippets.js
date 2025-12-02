import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databases, DATABASE_ID, SNIPPETS_COLLECTION_ID, Query } from '../utils/appwrite';
import { useEffect } from 'react';
import client from '../utils/appwrite';

export const usePublicSnippets = (limit = 12, enableRealtime = true) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['snippets', 'public', limit],
    queryFn: async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          SNIPPETS_COLLECTION_ID,
          [
            Query.equal('isPublic', true),
            Query.equal('isFlagged', false),
            Query.limit(limit)
          ]
        );
        return response.documents;
      } catch (error) {
        console.error('Failed to fetch public snippets:', error);
        return [];
      }
    },
    staleTime: 15 * 1000, // 15 seconds for more real-time feel
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: enableRealtime ? 30 * 1000 : false, // Refetch every 30 seconds
  });

  // Real-time subscription
  useEffect(() => {
    if (!enableRealtime) return;

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${SNIPPETS_COLLECTION_ID}.documents`,
      (response) => {
        const { events, payload } = response;
        
        if (events.includes('databases.*.collections.*.documents.*.create') ||
            events.includes('databases.*.collections.*.documents.*.update') ||
            events.includes('databases.*.collections.*.documents.*.delete')) {
          
          // Invalidate and refetch public snippets
          queryClient.invalidateQueries(['snippets', 'public']);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [queryClient, enableRealtime]);

  return query;
};

export const useUserSnippets = (userId, enableRealtime = true) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['snippets', 'user', userId],
    queryFn: async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          SNIPPETS_COLLECTION_ID,
          [
            Query.equal('ownerId', userId)
          ]
        );
        return response.documents;
      } catch (error) {
        console.error('Failed to fetch user snippets:', error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: enableRealtime ? 60 * 1000 : false,
  });

  // Real-time subscription for user's snippets
  useEffect(() => {
    if (!enableRealtime || !userId) return;

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${SNIPPETS_COLLECTION_ID}.documents`,
      (response) => {
        const { events, payload } = response;
        
        if (payload.ownerId === userId) {
          queryClient.invalidateQueries(['snippets', 'user', userId]);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [queryClient, userId, enableRealtime]);

  return query;
};

export const useSnippet = (snippetId) => {
  return useQuery({
    queryKey: ['snippet', snippetId],
    queryFn: async () => {
      try {
        const response = await databases.getDocument(
          DATABASE_ID,
          SNIPPETS_COLLECTION_ID,
          snippetId
        );
        return response;
      } catch (error) {
        console.error('Failed to fetch snippet:', error);
        throw error;
      }
    },
    enabled: !!snippetId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateSnippet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (snippetData) => {
      const publicId = Math.random().toString(36).substring(2, 8);
      const response = await databases.createDocument(
        DATABASE_ID,
        SNIPPETS_COLLECTION_ID,
        'unique()',
        {
          ownerId: snippetData.ownerId,
          title: snippetData.title,
          description: snippetData.description || '',
          language: snippetData.language,
          code: snippetData.code,
          attachments: snippetData.attachments || [],
          tags: snippetData.tags || [],
          isPublic: snippetData.isPublic || false,
          publicId: publicId,
          starsCount: 0,
          isFlagged: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['snippets', 'user', data.ownerId]);
      if (data.isPublic) {
        queryClient.invalidateQueries(['snippets', 'public']);
      }
    },
  });
};

export const useUpdateSnippet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const response = await databases.updateDocument(
        DATABASE_ID,
        SNIPPETS_COLLECTION_ID,
        id,
        {
          ...updateData,
          updatedAt: new Date().toISOString(),
        }
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['snippet', data.$id]);
      queryClient.invalidateQueries(['snippets', 'user', data.ownerId]);
      if (data.isPublic) {
        queryClient.invalidateQueries(['snippets', 'public']);
      }
    },
  });
};

export const useDeleteSnippet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      await databases.deleteDocument(
        DATABASE_ID,
        SNIPPETS_COLLECTION_ID,
        id
      );
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['snippets']);
    },
  });
};

export const useStarSnippet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ snippetId, increment = true }) => {
      const snippet = await databases.getDocument(
        DATABASE_ID,
        SNIPPETS_COLLECTION_ID,
        snippetId
      );
      
      const newStarsCount = Math.max(0, (snippet.starsCount || 0) + (increment ? 1 : -1));
      
      const response = await databases.updateDocument(
        DATABASE_ID,
        SNIPPETS_COLLECTION_ID,
        snippetId,
        {
          starsCount: newStarsCount,
          updatedAt: new Date().toISOString(),
        }
      );
      return response;
    },
    onMutate: async ({ snippetId, increment }) => {
      // Optimistic update for snippet stars count
      await queryClient.cancelQueries(['snippet', snippetId]);
      
      const previousSnippet = queryClient.getQueryData(['snippet', snippetId]);
      
      if (previousSnippet) {
        queryClient.setQueryData(['snippet', snippetId], {
          ...previousSnippet,
          starsCount: Math.max(0, (previousSnippet.starsCount || 0) + (increment ? 1 : -1))
        });
      }
      
      return { previousSnippet };
    },
    onError: (err, { snippetId }, context) => {
      if (context?.previousSnippet) {
        queryClient.setQueryData(['snippet', snippetId], context.previousSnippet);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['snippet', data.$id]);
      queryClient.invalidateQueries(['snippets']);
    },
  });
};

export const useFavoriteSnippets = (userId, enableRealtime = true) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['snippets', 'favorites', userId],
    queryFn: async () => {
      try {
        // Get user's starred snippets
        const starsResponse = await databases.listDocuments(
          DATABASE_ID,
          'stars',
          [
            Query.equal('userId', userId),
            Query.limit(100)
          ]
        );
        
        if (starsResponse.documents.length === 0) {
          return [];
        }
        
        // Get the actual snippets
        const snippetIds = starsResponse.documents.map(star => star.snippetId);
        const snippetsPromises = snippetIds.map(id => 
          databases.getDocument(DATABASE_ID, SNIPPETS_COLLECTION_ID, id)
            .catch(() => null) // Handle deleted snippets
        );
        
        const snippets = await Promise.all(snippetsPromises);
        return snippets.filter(snippet => snippet !== null);
      } catch (error) {
        console.error('Failed to fetch favorite snippets:', error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: enableRealtime ? 60 * 1000 : false,
  });

  // Real-time subscription for stars
  useEffect(() => {
    if (!enableRealtime || !userId) return;

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.stars.documents`,
      (response) => {
        const { payload } = response;
        
        if (payload.userId === userId) {
          queryClient.invalidateQueries(['snippets', 'favorites', userId]);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [queryClient, userId, enableRealtime]);

  return query;
};