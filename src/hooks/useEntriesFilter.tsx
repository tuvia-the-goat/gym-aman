import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "../context/AdminContext";
import { Entry, Trainee } from "../types";
import { entryService } from "../services/api";
import { socketService } from "../services/socket";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useEntriesFilter = () => {
  const { admin } = useAdmin();
  const queryClient = useQueryClient();

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSubDepartment, setSelectedSubDepartment] = useState("");
  const [selectedBase, setSelectedBase] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  // Fixed entries per page
  const entriesPerPage = 20;

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Format dates for API request
  const formattedStartDate = startDate ? format(startDate, "yyyy-MM-dd") : undefined;
  const formattedEndDate = endDate ? format(endDate, "yyyy-MM-dd") : undefined;

  // Apply base filter based on admin role and selected base
  const baseIdParam = admin?.role === "gymAdmin" 
    ? admin.baseId 
    : admin?.role === "generalAdmin" && selectedBase 
      ? selectedBase 
      : undefined;

  // Query for entries
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "entries",
      currentPage,
      entriesPerPage,
      debouncedSearch,
      selectedDepartment,
      selectedSubDepartment,
      baseIdParam,
      formattedStartDate,
      formattedEndDate,
    ],
    queryFn: async () => {
      const result = await entryService.getPaginated({
        page: currentPage,
        limit: entriesPerPage,
        search: debouncedSearch,
        departmentId: selectedDepartment,
        subDepartmentId: selectedSubDepartment,
        baseId: baseIdParam,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
      return result;
    },
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    selectedDepartment,
    selectedSubDepartment,
    selectedBase,
    startDate,
    endDate,
  ]);

  // Listen for new entries via WebSocket and refresh if they match our filters
  useEffect(() => {
    const shouldRefreshForEntry = (entry: Entry) => {
      if (!entry) return false;

      // Base filter check
      if (admin?.role === "gymAdmin") {
        if (entry.baseId !== admin.baseId) {
          return false;
        }
      } else if (admin?.role === "generalAdmin" && selectedBase) {
        if (entry.baseId !== selectedBase) {
          return false;
        }
      }

      // Department filter check
      if (selectedDepartment && entry.departmentId !== selectedDepartment) {
        return false;
      }

      // SubDepartment filter check
      if (selectedSubDepartment && entry.subDepartmentId !== selectedSubDepartment) {
        return false;
      }

      // Search term check
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const nameMatch = entry.traineeFullName?.toLowerCase()?.includes(searchLower) || false;
        const idMatch = entry.traineePersonalId?.toLowerCase()?.includes(searchLower) || false;
///////////////////////////////////////////////////////////////////////////////////////
        if (!nameMatch && !idMatch) {
          return false;
        }
      }

      // Date range check
      if (startDate || endDate) {
        const entryDate = new Date(entry.entryDate);

        if (startDate && entryDate < startDate) {
          return false;
        }

        if (endDate) {
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);

          if (entryDate > endOfDay) {
            return false;
          }
        }
      }

      return true;
    };

    // Listen for new entries
    const cleanup = socketService.onNewEntry((newEntry) => {
      if (shouldRefreshForEntry(newEntry)) {
        // Invalidate the entries query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ["entries"] });
      }
    });

    return cleanup;
  }, [
    queryClient,
    selectedBase,
    selectedDepartment,
    selectedSubDepartment,
    debouncedSearch,
    startDate,
    endDate,
    admin,
  ]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, data?.pagination.pages || 1)));
  };

  return {
    // Entries data
    entries: data?.entries || [],
    isLoading,
    error: error ? "Failed to load entries. Please try again." : null,

    // Filter states
    searchTerm,
    setSearchTerm,
    selectedDepartment,
    setSelectedDepartment,
    selectedSubDepartment,
    setSelectedSubDepartment,
    selectedBase,
    setSelectedBase,
    startDate,
    setStartDate,
    endDate,
    setEndDate,

    // Pagination
    currentPage,
    totalPages: data?.pagination.pages || 1,
    totalEntries: data?.pagination.total || 0,
    entriesPerPage,
    goToPage,


    // Refresh function
    refreshEntries: () => queryClient.invalidateQueries({ queryKey: ["entries"] }),
  };
};
