import { useQuery, useQueryClient } from '@tanstack/react-query';
import { databases, DATABASE_ID, SNIPPETS_COLLECTION_ID, Query } from '../utils/appwrite';
import { useEffect } from 'react';
import client from '../utils/appwrite';

export const usePopularTags = (limit = 50, enableRealtime = true) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tags', 'popular', limit],
    queryFn: async () => {
      try {
        // Fetch recent public snippets to extract popular tags
        const response = await databases.listDocuments(
          DATABASE_ID,
          SNIPPETS_COLLECTION_ID,
          [
            Query.equal('isPublic', true),
            Query.equal('isFlagged', false),
            Query.limit(300) // Get more snippets to analyze tags
          ]
        );

        // Extract and count tags
        const tagCounts = {};
        response.documents.forEach(snippet => {
          if (snippet.tags && Array.isArray(snippet.tags)) {
            snippet.tags.forEach(tag => {
              const normalizedTag = tag.toLowerCase().trim();
              tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
            });
          }
        });

        // Sort by popularity and return top tags
        const sortedTags = Object.entries(tagCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limit)
          .map(([tag, count]) => ({ name: tag, count }));

        return sortedTags.length > 0 ? sortedTags : getDefaultTags().slice(0, limit).map(tag => ({ name: tag, count: 0 }));
      } catch (error) {
        console.error('Failed to fetch popular tags:', error);
        return getDefaultTags().slice(0, limit).map(tag => ({ name: tag, count: 0 }));
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchInterval: enableRealtime ? 2 * 60 * 1000 : false, // Refetch every 2 minutes
  });

  // Real-time subscription for tag updates
  useEffect(() => {
    if (!enableRealtime) return;

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${SNIPPETS_COLLECTION_ID}.documents`,
      (response) => {
        const { events } = response;
        
        if (events.includes('databases.*.collections.*.documents.*.create') ||
            events.includes('databases.*.collections.*.documents.*.update') ||
            events.includes('databases.*.collections.*.documents.*.delete')) {
          
          // Invalidate tags when snippets change
          queryClient.invalidateQueries(['tags', 'popular']);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [queryClient, enableRealtime]);

  return query;
};

export const useTagSuggestions = () => {
  const { data: popularTags = [] } = usePopularTags();
  
  const suggestions = [
    ...popularTags.map(tag => tag.name),
    ...getDefaultTags()
  ];

  // Remove duplicates and return unique suggestions
  return [...new Set(suggestions)];
};

const getDefaultTags = () => {
  return [
    'javascript', 'typescript', 'react', 'nodejs', 'python', 'django', 'flask',
    'java', 'spring', 'cpp', 'csharp', 'dotnet', 'go', 'rust', 'php', 'laravel',
    'ruby', 'rails', 'swift', 'kotlin', 'html', 'css', 'sass', 'tailwind',
    'bootstrap', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'gatsby',
    'express', 'fastapi', 'mongodb', 'postgresql', 'mysql', 'redis', 'docker',
    'kubernetes', 'aws', 'azure', 'gcp', 'firebase', 'supabase', 'graphql',
    'rest-api', 'websocket', 'jwt', 'oauth', 'authentication', 'authorization',
    'testing', 'jest', 'cypress', 'selenium', 'git', 'github', 'gitlab',
    'ci-cd', 'devops', 'linux', 'bash', 'powershell', 'regex', 'algorithm',
    'data-structure', 'machine-learning', 'ai', 'blockchain', 'web3', 'solidity'
  ];
};