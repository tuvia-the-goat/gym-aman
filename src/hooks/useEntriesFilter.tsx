import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "../context/AdminContext";
import { Entry, Trainee } from "../types";
import { entryService } from "../services/api";
import { socketService } from "../services/socket"; // Import socket service
import { format } from "date-fns";

export const useEntriesFilter = () => {
  const { admin, trainees } = useAdmin();

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSubDepartment, setSelectedSubDepartment] = useState("");
  const [selectedBase, setSelectedBase] = useState("");
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fixed entries per page - no need for user selection
  const entriesPerPage = 20;

  // State for data
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Function to load entries from the API
  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Format dates if they exist
      const formattedStartDate = startDate
        ? format(startDate, "yyyy-MM-dd")
        : undefined;
      const formattedEndDate = endDate
        ? format(endDate, "yyyy-MM-dd")
        : undefined;

      // Only apply the baseId filter for gym admins
      const baseIdParam =
        selectedBase ||
        (admin?.role === "gymAdmin" ? admin?.baseId : undefined);

      // Filter trainees by medical profile if needed

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

      setEntries(result.entries);
      setTotalEntries(result.pagination.total);
      setTotalPages(result.pagination.pages);
    } catch (err) {
      console.error("Error loading entries:", err);
      setError("Failed to load entries. Please try again.");
      setEntries([]);
      setTotalEntries(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    entriesPerPage,
    debouncedSearch,
    selectedDepartment,
    selectedSubDepartment,
    selectedBase,
    startDate,
    endDate,
    admin,
    trainees,
  ]);

  // Load entries when filters change
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

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
    const shouldRefreshForEntry = (entry) => {
      if (!entry) return false;

      // Check if the new entry matches our current filters

      // Base filter check
      if (selectedBase && entry.baseId !== selectedBase) {
        return false;
      }

      // Department filter check
      if (selectedDepartment && entry.departmentId !== selectedDepartment) {
        return false;
      }

      // SubDepartment filter check
      if (
        selectedSubDepartment &&
        entry.subDepartmentId !== selectedSubDepartment
      ) {
        return false;
      }

      // Search term check
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const nameMatch =
          entry.traineeFullName?.toLowerCase()?.includes(searchLower) || false;
        const idMatch =
          entry.traineePersonalId?.toLowerCase()?.includes(searchLower) ||
          false;

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
          // Set the endDate to the end of the day for comparison
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);

          if (entryDate > endOfDay) {
            return false;
          }
        }
      }

      // If all filters pass, refresh
      return true;
    };

    // Listen for new entries
    const cleanup = socketService.onNewEntry((newEntry) => {
      if (shouldRefreshForEntry(newEntry)) {
        // If the entry matches our current filters, reload the data
        loadEntries();
      }
    });

    return cleanup;
  }, [
    loadEntries,
    selectedBase,
    selectedDepartment,
    selectedSubDepartment,
    debouncedSearch,
    startDate,
    endDate,
    trainees,
  ]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const hasOrthopedicCondition = (traineeId: string): boolean => {
    const trainee = trainees.find((t) => t._id === traineeId);
    return trainee ? !!trainee.orthopedicCondition : false;
  };

  const hasMedicalLimitation = (traineeId: string): boolean => {
    const trainee = trainees.find((t) => t._id === traineeId);
    return trainee ? !!trainee.medicalLimitation : false;
  };

  return {
    // Entries data
    entries,
    isLoading,
    error,

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
    totalPages,
    totalEntries,
    entriesPerPage,
    goToPage,

    // Helper functions
    hasOrthopedicCondition,
    hasMedicalLimitation,

    // Refresh function
    refreshEntries: loadEntries,
  };
};
