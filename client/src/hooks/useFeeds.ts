import { useQuery, useMutation } from "@tanstack/react-query";
import { FeedSource } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export function useFeeds() {
  const { data, isLoading, isError, error, refetch } = useQuery<FeedSource[]>({
    queryKey: ['/api/sources'],
  });

  const addFeed = useMutation({
    mutationFn: async (feedData: Omit<FeedSource, 'id'>) => {
      return await apiRequest('POST', '/api/sources', feedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sources'] });
    }
  });

  const updateFeed = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FeedSource> & { id: number }) => {
      return await apiRequest('PATCH', `/api/sources/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sources'] });
    }
  });

  const deleteFeed = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/sources/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sources'] });
    }
  });

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    addFeed,
    updateFeed,
    deleteFeed
  };
}
