import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '@/lib/api-config';

// APIフェッチ用のカスタムフック
export function useApi<T>(
  endpoint: string,
  options?: {
    immediate?: boolean; // 即座に実行するか
    refreshInterval?: number; // 自動更新間隔（ミリ秒）
    dependencies?: any[]; // 再実行の依存配列
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await ApiClient.get<T>(endpoint);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      console.error('API fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (options?.immediate !== false) {
      fetchData();
    }

    if (options?.refreshInterval) {
      const interval = setInterval(fetchData, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, ...(options?.dependencies || [])]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// POST/PUT/DELETE用のカスタムフック
export function useMutation<TData = any, TVariables = any>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST'
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (variables?: TVariables) => {
      try {
        setLoading(true);
        setError(null);
        
        let result;
        switch (method) {
          case 'POST':
            result = await ApiClient.post<TData>(endpoint, variables);
            break;
          case 'PUT':
            result = await ApiClient.put<TData>(endpoint, variables);
            break;
          case 'DELETE':
            result = await ApiClient.delete<TData>(endpoint);
            break;
        }
        
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
        setError(errorMessage);
        console.error('API mutation error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method]
  );

  return {
    data,
    loading,
    error,
    mutate,
  };
}

// ページネーション付きデータ取得用のフック
export function usePaginatedApi<T>(
  baseEndpoint: string,
  options?: {
    pageSize?: number;
    initialPage?: number;
  }
) {
  const [page, setPage] = useState(options?.initialPage || 1);
  const [pageSize] = useState(options?.pageSize || 20);
  
  const endpoint = `${baseEndpoint}?page=${page}&limit=${pageSize}`;
  const { data, loading, error, refetch } = useApi<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>(endpoint);

  return {
    data: data?.data || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch,
    setPage,
  };
} 