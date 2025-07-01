import { useState, useEffect } from "react";

interface PaginatedResult<T> {
  items: T[];
  totalPage: number;
}

interface UsePaginatedDataProps<T> {
  fetchData: (page: number) => Promise<PaginatedResult<T>>;
}

export default function usePaginatedData<T>({
  fetchData,
}: UsePaginatedDataProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPaging, setIsPaging] = useState(false);

  const loadData = async (pageNum = 1, paging = false) => {
    try {
      if (paging) setIsPaging(true);
      else if (pageNum === 1) setIsLoading(true);

      const result = await fetchData(pageNum);

      setHasMore(pageNum < result.totalPage);
      setPage(pageNum);

      const newData = result.items;

      setData((prevData) => {
        const combined = paging ? [...prevData, ...newData] : newData;
        return Array.from(
          new Map(combined.map((item: any) => [item._id, item])).values()
        );
      });
    } catch (err) {
      console.error("Pagination Error:", err);
    } finally {
      setIsLoading(false);
      setIsPaging(false);
      setIsRefreshing(false);
    }
  };

  const refresh = () => {
    setIsRefreshing(true);
    loadData(1, false);
  };

  const loadMore = () => {
    if (!isPaging && !isLoading && hasMore) {
      loadData(page + 1, true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    page,
    isLoading,
    isRefreshing,
    isPaging,
    hasMore,
    refresh,
    loadMore,
    reload: () => loadData(1, false),
    setData,
  };
}
