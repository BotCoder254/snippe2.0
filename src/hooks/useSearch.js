import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { databases, DATABASE_ID, SNIPPETS_COLLECTION_ID, Query } from '../utils/appwrite';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useSearch = (initialQuery = '', filters = {}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilters, setActiveFilters] = useState({
    scope: 'all', // 'my', 'public', 'all'
    language: 'all',
    ...filters
  });

  const debouncedQuery = useDebounce(query, 300);

  // Server-side search for public snippets
  const { data: serverResults = [], isLoading: isServerLoading } = useQuery({
    queryKey: ['search', 'server', debouncedQuery, activeFilters],
    queryFn: async () => {
      if (!debouncedQuery.trim() || activeFilters.scope === 'my') {
        return [];
      }

      try {
        const queries = [
          Query.equal('isPublic', true),
          Query.equal('isFlagged', false),
          Query.orderDesc('updatedAt'),
          Query.limit(50)
        ];

        // Add language filter
        if (activeFilters.language !== 'all') {
          queries.push(Query.equal('language', activeFilters.language));
        }

        // Search by title (contains)
        const titleResults = await databases.listDocuments(
          DATABASE_ID,
          SNIPPETS_COLLECTION_ID,
          [
            ...queries,
            Query.search('title', debouncedQuery)
          ]
        ).catch(() => ({ documents: [] }));

        // Search by tags (exact match for better performance)
        const tagResults = await databases.listDocuments(
          DATABASE_ID,
          SNIPPETS_COLLECTION_ID,
          [
            ...queries,
            Query.contains('tags', debouncedQuery.toLowerCase())
          ]
        ).catch(() => ({ documents: [] }));

        // Combine and deduplicate results
        const combined = [...titleResults.documents, ...tagResults.documents];
        const unique = combined.filter((item, index, self) => 
          index === self.findIndex(t => t.$id === item.$id)
        );

        return unique;
      } catch (error) {
        console.error('Server search failed:', error);
        return [];
      }
    },
    enabled: debouncedQuery.trim().length > 0 && activeFilters.scope !== 'my',
    staleTime: 30 * 1000, // 30 seconds
  });

  // Client-side filtering function
  const filterSnippets = useMemo(() => {
    return (snippets) => {
      if (!debouncedQuery.trim()) return snippets;

      const searchTerm = debouncedQuery.toLowerCase();
      
      return snippets.filter(snippet => {
        // Language filter
        if (activeFilters.language !== 'all' && snippet.language !== activeFilters.language) {
          return false;
        }

        // Text search
        const titleMatch = snippet.title?.toLowerCase().includes(searchTerm);
        const descMatch = snippet.description?.toLowerCase().includes(searchTerm);
        const codeMatch = snippet.code?.toLowerCase().includes(searchTerm.substring(0, 50)); // Limit code search
        const tagMatch = snippet.tags?.some(tag => 
          tag.toLowerCase().includes(searchTerm)
        );

        return titleMatch || descMatch || codeMatch || tagMatch;
      });
    };
  }, [debouncedQuery, activeFilters]);

  // Highlight matching text
  const highlightText = (text, query) => {
    if (!query.trim() || !text) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-secondary-light/30 dark:bg-secondary-dark/30 px-1 rounded">$1</mark>');
  };

  return {
    query,
    setQuery,
    debouncedQuery,
    activeFilters,
    setActiveFilters,
    serverResults,
    isServerLoading,
    filterSnippets,
    highlightText,
    hasQuery: debouncedQuery.trim().length > 0
  };
};

export const useLanguageOptions = () => {
  return [
    { value: 'all', label: 'All Languages' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash' },
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' }
  ];
};