import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databases, DATABASE_ID, SNIPPETS_COLLECTION_ID, Query } from '../utils/appwrite';
import { useEffect } from 'react';
import client from '../utils/appwrite';

const LIBRARIES_COLLECTION_ID = process.env.REACT_APP_APPWRITE_LIBRARIES_COLLECTION_ID || 'libraries';

export const useUserLibraries = (userId, enableRealtime = true) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['libraries', 'user', userId],
    queryFn: async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          LIBRARIES_COLLECTION_ID,
          [
            Query.equal('ownerId', userId),
            Query.orderDesc('createdAt')
          ]
        );
        return response.documents;
      } catch (error) {
        console.error('Failed to fetch user libraries:', error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: enableRealtime ? 60 * 1000 : false,
  });

  // Real-time subscription for libraries
  useEffect(() => {
    if (!enableRealtime || !userId) return;

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${LIBRARIES_COLLECTION_ID}.documents`,
      (response) => {
        const { payload } = response;
        
        if (payload.ownerId === userId) {
          queryClient.invalidateQueries(['libraries', 'user', userId]);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [queryClient, userId, enableRealtime]);

  return query;
};

export const useLibrary = (libraryId, enableRealtime = true) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['library', libraryId],
    queryFn: async () => {
      try {
        const library = await databases.getDocument(
          DATABASE_ID,
          LIBRARIES_COLLECTION_ID,
          libraryId
        );
        
        // Fetch snippets in this library
        if (library.snippetIds && library.snippetIds.length > 0) {
          const snippetsPromises = library.snippetIds.map(id => 
            databases.getDocument(DATABASE_ID, SNIPPETS_COLLECTION_ID, id)
              .catch(() => null)
          );
          const snippets = await Promise.all(snippetsPromises);
          library.snippets = snippets.filter(snippet => snippet !== null);
        } else {
          library.snippets = [];
        }
        
        return library;
      } catch (error) {
        console.error('Failed to fetch library:', error);
        throw error;
      }
    },
    enabled: !!libraryId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: enableRealtime ? 60 * 1000 : false,
  });

  // Real-time subscription for specific library
  useEffect(() => {
    if (!enableRealtime || !libraryId) return;

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${LIBRARIES_COLLECTION_ID}.documents.${libraryId}`,
      () => {
        queryClient.invalidateQueries(['library', libraryId]);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [queryClient, libraryId, enableRealtime]);

  return query;
};

export const useCreateLibrary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ownerId, name, isPrivate = true }) => {
      const response = await databases.createDocument(
        DATABASE_ID,
        LIBRARIES_COLLECTION_ID,
        'unique()',
        {
          ownerId,
          name,
          snippetIds: [],
          isPrivate,
          createdAt: new Date().toISOString()
        }
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['libraries', 'user', data.ownerId]);
    },
  });
};

export const useUpdateLibrary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const response = await databases.updateDocument(
        DATABASE_ID,
        LIBRARIES_COLLECTION_ID,
        id,
        updateData
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['library', data.$id]);
      queryClient.invalidateQueries(['libraries', 'user', data.ownerId]);
    },
  });
};

export const useDeleteLibrary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      await databases.deleteDocument(
        DATABASE_ID,
        LIBRARIES_COLLECTION_ID,
        id
      );
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['libraries']);
    },
  });
};

export const useAddSnippetToLibrary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ libraryId, snippetId }) => {
      const library = await databases.getDocument(
        DATABASE_ID,
        LIBRARIES_COLLECTION_ID,
        libraryId
      );
      
      const updatedSnippetIds = [...(library.snippetIds || [])];
      if (!updatedSnippetIds.includes(snippetId)) {
        updatedSnippetIds.push(snippetId);
      }
      
      const response = await databases.updateDocument(
        DATABASE_ID,
        LIBRARIES_COLLECTION_ID,
        libraryId,
        {
          snippetIds: updatedSnippetIds
        }
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['library', data.$id]);
      queryClient.invalidateQueries(['libraries', 'user', data.ownerId]);
    },
  });
};

export const useRemoveSnippetFromLibrary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ libraryId, snippetId }) => {
      const library = await databases.getDocument(
        DATABASE_ID,
        LIBRARIES_COLLECTION_ID,
        libraryId
      );
      
      const updatedSnippetIds = (library.snippetIds || []).filter(id => id !== snippetId);
      
      const response = await databases.updateDocument(
        DATABASE_ID,
        LIBRARIES_COLLECTION_ID,
        libraryId,
        {
          snippetIds: updatedSnippetIds
        }
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['library', data.$id]);
      queryClient.invalidateQueries(['libraries', 'user', data.ownerId]);
    },
  });
};