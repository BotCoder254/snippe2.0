import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databases, DATABASE_ID, Query } from '../utils/appwrite';
import { useEffect } from 'react';
import client from '../utils/appwrite';

// For MVP, we'll use a simple collection structure
const STARS_COLLECTION_ID = process.env.REACT_APP_APPWRITE_STARS_COLLECTION_ID || 'stars';

export const useUserStars = (userId, enableRealtime = true) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['stars', 'user', userId],
    queryFn: async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          STARS_COLLECTION_ID,
          [
            Query.equal('userId', userId),
            Query.orderDesc('createdAt')
          ]
        );
        return response.documents;
      } catch (error) {
        console.error('Failed to fetch user stars:', error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: enableRealtime ? 60 * 1000 : false,
  });

  // Real-time subscription
  useEffect(() => {
    if (!enableRealtime || !userId) return;

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${STARS_COLLECTION_ID}.documents`,
      (response) => {
        const { payload } = response;
        
        if (payload.userId === userId) {
          queryClient.invalidateQueries(['stars', 'user', userId]);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [queryClient, userId, enableRealtime]);

  return query;
};

export const useIsSnippetStarred = (userId, snippetId, enableRealtime = true) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['star', userId, snippetId],
    queryFn: async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          STARS_COLLECTION_ID,
          [
            Query.equal('userId', userId),
            Query.equal('snippetId', snippetId),
            Query.limit(1)
          ]
        );
        return response.documents.length > 0;
      } catch (error) {
        console.error('Failed to check star status:', error);
        return false;
      }
    },
    enabled: !!(userId && snippetId),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  // Real-time subscription for specific star status
  useEffect(() => {
    if (!enableRealtime || !userId || !snippetId) return;

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${STARS_COLLECTION_ID}.documents`,
      (response) => {
        const { payload } = response;
        
        if (payload.userId === userId && payload.snippetId === snippetId) {
          queryClient.invalidateQueries(['star', userId, snippetId]);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [queryClient, userId, snippetId, enableRealtime]);

  return query;
};

export const useToggleStar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, snippetId, isStarred }) => {
      if (isStarred) {
        // Remove star
        const existingStars = await databases.listDocuments(
          DATABASE_ID,
          STARS_COLLECTION_ID,
          [
            Query.equal('userId', userId),
            Query.equal('snippetId', snippetId),
            Query.limit(1)
          ]
        );
        
        if (existingStars.documents.length > 0) {
          await databases.deleteDocument(
            DATABASE_ID,
            STARS_COLLECTION_ID,
            existingStars.documents[0].$id
          );
        }
        return { action: 'removed', userId, snippetId };
      } else {
        // Add star
        const response = await databases.createDocument(
          DATABASE_ID,
          STARS_COLLECTION_ID,
          'unique()',
          {
            userId,
            snippetId,
            createdAt: new Date().toISOString()
          }
        );
        return { action: 'added', userId, snippetId, star: response };
      }
    },
    onMutate: async ({ userId, snippetId, isStarred }) => {
      // Optimistic update
      await queryClient.cancelQueries(['star', userId, snippetId]);
      
      const previousStarred = queryClient.getQueryData(['star', userId, snippetId]);
      
      // Update star status
      queryClient.setQueryData(['star', userId, snippetId], !isStarred);
      
      // Update user stars list
      queryClient.setQueryData(['stars', 'user', userId], (old = []) => {
        if (isStarred) {
          return old.filter(star => star.snippetId !== snippetId);
        } else {
          return [...old, { userId, snippetId, createdAt: new Date().toISOString() }];
        }
      });
      
      return { previousStarred };
    },
    onError: (err, { userId, snippetId }, context) => {
      // Rollback on error
      queryClient.setQueryData(['star', userId, snippetId], context.previousStarred);
    },
    onSettled: (data, error, { userId, snippetId }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries(['star', userId, snippetId]);
      queryClient.invalidateQueries(['stars', 'user', userId]);
      queryClient.invalidateQueries(['snippets']);
    },
  });
};