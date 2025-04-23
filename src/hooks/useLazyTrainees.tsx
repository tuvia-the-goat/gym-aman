// src/hooks/useLazyTrainees.tsx
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Trainee } from "../types";
import { traineeService } from "../services/api";
import { isBefore } from "date-fns";

interface UseLazyTraineesProps {
  baseTrainees: Trainee[];
  baseId?: string;
  itemsPerPage?: number;
}

export const useLazyTrainees = ({
  baseTrainees,
  baseId,
  itemsPerPage = 30,
}: UseLazyTraineesProps) => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyExpired, setShowOnlyExpired] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(
    undefined
  );

  // Pagination states
  const [visibleTrainees, setVisibleTrainees] = useState<Trainee[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [totalTrainees, setTotalTrainees] = useState(0);

  // Observer references
  const observer = useRef<IntersectionObserver | null>(null);
  const lastTraineeElementRef = useRef<HTMLLIElement | null>(null);

  // Load trainees method
  const loadMoreTrainees = useCallback(
    async (currentPage = page) => {
      setIsLoading(true);

      try {
        // Format date for API request
        const formattedExpirationDate = expirationDate
          ? expirationDate.toISOString()
          : undefined;

        // Fetch trainees from server with pagination and filters
        const response = await traineeService.getPaginated({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          baseId: baseId,
          showOnlyExpired,
          expirationDate: formattedExpirationDate,
        });

        // If it's the first page, replace the visible trainees
        // Otherwise, append the new trainees to the existing ones
        if (currentPage === 1) {
          setVisibleTrainees(response.trainees);
        } else {
          setVisibleTrainees((prevTrainees) => [
            ...prevTrainees,
            ...response.trainees,
          ]);
        }

        setTotalTrainees(response.pagination.total);
        setHasMore(currentPage < response.pagination.pages);
        setPage(currentPage + 1);
      } catch (error) {
        console.error("Error loading trainees:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [page, searchQuery, showOnlyExpired, expirationDate, baseId, itemsPerPage]
  );

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
    setVisibleTrainees([]);
    setHasMore(true);
    loadMoreTrainees(1);
  }, [searchQuery, showOnlyExpired, expirationDate, baseId]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (isLoading || !hasMore) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreTrainees();
        }
      },
      { threshold: 0.5 }
    );

    if (lastTraineeElementRef.current) {
      observer.current.observe(lastTraineeElementRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [isLoading, hasMore, loadMoreTrainees, visibleTrainees]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setShowOnlyExpired(false);
    setExpirationDate(undefined);
  }, []);

  return {
    // Filtered data
    filteredTraineesCount: totalTrainees,
    visibleTrainees,

    // Loading state
    isLoading,
    hasMore,

    // Filter states and setters
    searchQuery,
    setSearchQuery,
    showOnlyExpired,
    setShowOnlyExpired,
    expirationDate,
    setExpirationDate,

    // Refs for intersection observer
    lastTraineeElementRef,

    // Methods
    clearFilters,
    loadMoreTrainees,
  };
};

export default useLazyTrainees;
