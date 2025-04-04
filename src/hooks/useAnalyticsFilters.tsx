
import { useState, useMemo } from 'react';
import { isWithinInterval, parseISO } from 'date-fns';
import { useAdmin } from '../context/AdminContext';

export const useAnalyticsFilters = () => {
  const { admin, entries, trainees, primaryFrameworks, secondaryFrameworks } = useAdmin();
  
  // Filtering state
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedPrimaryFrameworkIds, setSelectedPrimaryFrameworkIds] = useState<string[]>([]);
  const [selectedSecondaryFrameworkIds, setSelectedSecondaryFrameworkIds] = useState<string[]>([]);
  const [selectedTrainees, setSelectedTrainees] = useState<string[]>([]);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  
  // Filter data based on admin role and filters
  const filteredEntries = useMemo(() => {
    let filtered = entries;
    
    // Admin role filter
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(entry => entry.baseId === admin.baseId);
    }
    
    // Date range filter
    if (startDate && endDate) {
      filtered = filtered.filter(entry => {
        const entryDate = parseISO(entry.entryDate);
        return isWithinInterval(entryDate, { start: startDate, end: endDate });
      });
    }
    
    // Primary framework filter
    if (selectedPrimaryFrameworkIds.length > 0) {
      filtered = filtered.filter(entry => selectedPrimaryFrameworkIds.includes(entry.primaryFrameworkId));
    }
    
    // Secondary framework filter
    if (selectedSecondaryFrameworkIds.length > 0) {
      filtered = filtered.filter(entry => selectedSecondaryFrameworkIds.includes(entry.secondaryFrameworkId));
    }
    
    // Selected trainees filter
    if (selectedTrainees.length > 0) {
      filtered = filtered.filter(entry => selectedTrainees.includes(entry.traineeId));
    }
    
    return filtered;
  }, [admin, entries, startDate, endDate, selectedPrimaryFrameworkIds, selectedSecondaryFrameworkIds, selectedTrainees]);
  
  const filteredTrainees = useMemo(() => {
    let filtered = trainees;
    
    // Admin role filter
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(trainee => trainee.baseId === admin.baseId);
    }
    
    // Primary framework filter
    if (selectedPrimaryFrameworkIds.length > 0) {
      filtered = filtered.filter(trainee => selectedPrimaryFrameworkIds.includes(trainee.primaryFrameworkId));
    }
    
    // Secondary framework filter
    if (selectedSecondaryFrameworkIds.length > 0) {
      filtered = filtered.filter(trainee => selectedSecondaryFrameworkIds.includes(trainee.secondaryFrameworkId));
    }
    
    // Selected trainees filter
    if (selectedTrainees.length > 0) {
      filtered = filtered.filter(trainee => selectedTrainees.includes(trainee._id));
    }
    
    return filtered;
  }, [admin, trainees, selectedPrimaryFrameworkIds, selectedSecondaryFrameworkIds, selectedTrainees]);
  
  // Get available primary frameworks for filtering
  const availablePrimaryFrameworks = useMemo(() => {
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      return primaryFrameworks.filter(framework => framework.baseId === admin.baseId);
    }
    return primaryFrameworks;
  }, [admin, primaryFrameworks]);
  
  // Get available secondary frameworks for filtering
  const availableSecondaryFrameworks = useMemo(() => {
    let filtered = secondaryFrameworks;
    
    // Admin role filter
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(framework => framework.baseId === admin.baseId);
    }
    
    // Filter by selected primary frameworks
    if (selectedPrimaryFrameworkIds.length > 0) {
      filtered = filtered.filter(framework => 
        selectedPrimaryFrameworkIds.includes(framework.primaryFrameworkId)
      );
    }
    
    return filtered;
  }, [admin, secondaryFrameworks, selectedPrimaryFrameworkIds]);
  
  // Get available trainees for filtering
  const availableTrainees = useMemo(() => {
    let filtered = trainees;
    
    // Admin role filter
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(trainee => trainee.baseId === admin.baseId);
    }
    
    return filtered;
  }, [admin, trainees]);
  
  // Group trainees by primary framework for the UI
  const traineesByPrimaryFramework = useMemo(() => {
    const grouped: Record<string, typeof trainees> = {};
    
    // Filter trainees by selected primary frameworks if any are selected
    let filteredTrainees = availableTrainees;
    
    // Group the trainees by primary framework
    filteredTrainees.forEach(trainee => {
      if (!grouped[trainee.primaryFrameworkId]) {
        grouped[trainee.primaryFrameworkId] = [];
      }
      grouped[trainee.primaryFrameworkId].push(trainee);
    });
    
    return grouped;
  }, [availableTrainees]);

  // Check if specific filters are active
  const hasDateFilters = Boolean(startDate || endDate);
  const hasSpecificFilters = selectedPrimaryFrameworkIds.length > 0 || 
                            selectedSecondaryFrameworkIds.length > 0 || 
                            selectedTrainees.length > 0;
  const hasActiveFilters = hasDateFilters || hasSpecificFilters;
  
  // Clear all filters
  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedPrimaryFrameworkIds([]);
    setSelectedSecondaryFrameworkIds([]);
    setSelectedTrainees([]);
  };
  
  // Clear individual filter groups
  const clearDateFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };
  
  const clearPrimaryFrameworkFilters = () => {
    setSelectedPrimaryFrameworkIds([]);
    // Also clear secondary frameworks as they depend on primary frameworks
    setSelectedSecondaryFrameworkIds([]);
  };
  
  const clearSecondaryFrameworkFilters = () => {
    setSelectedSecondaryFrameworkIds([]);
  };
  
  const clearTraineeFilters = () => {
    setSelectedTrainees([]);
  };
  
  // Handle trainee selection toggle
  const toggleTrainee = (traineeId: string) => {
    setSelectedTrainees(prev => 
      prev.includes(traineeId) 
        ? prev.filter(id => id !== traineeId)
        : [...prev, traineeId]
    );
  };
  
  // Toggle primary framework selection
  const togglePrimaryFramework = (frameworkId: string) => {
    setSelectedPrimaryFrameworkIds(prev => {
      if (prev.includes(frameworkId)) {
        // If framework is already selected, remove it
        return prev.filter(id => id !== frameworkId);
      } else {
        // If framework is not selected, add it
        return [...prev, frameworkId];
      }
    });
    
    // Also update trainee selection based on framework toggle
    const frameworkTrainees = traineesByPrimaryFramework[frameworkId] || [];
    const traineeIds = frameworkTrainees.map(trainee => trainee._id);
    
    if (selectedPrimaryFrameworkIds.includes(frameworkId)) {
      // If framework is already selected, remove all its trainees
      setSelectedTrainees(prev => prev.filter(id => !traineeIds.includes(id)));
    }
    
    // Clear selected secondary frameworks when primary framework selection changes
    setSelectedSecondaryFrameworkIds([]);
  };
  
  // Toggle secondary framework selection
  const toggleSecondaryFramework = (frameworkId: string) => {
    setSelectedSecondaryFrameworkIds(prev => {
      if (prev.includes(frameworkId)) {
        // If framework is already selected, remove it
        return prev.filter(id => id !== frameworkId);
      } else {
        // If framework is not selected, add it
        return [...prev, frameworkId];
      }
    });
  };

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedPrimaryFrameworkIds,
    setSelectedPrimaryFrameworkIds,
    selectedSecondaryFrameworkIds,
    setSelectedSecondaryFrameworkIds,
    selectedTrainees,
    setSelectedTrainees,
    showFilterDialog,
    setShowFilterDialog,
    filteredEntries,
    filteredTrainees,
    availablePrimaryFrameworks,
    availableSecondaryFrameworks,
    availableTrainees,
    traineesByPrimaryFramework,
    hasDateFilters,
    hasSpecificFilters,
    hasActiveFilters,
    clearFilters,
    clearDateFilters,
    clearPrimaryFrameworkFilters,
    clearSecondaryFrameworkFilters,
    clearTraineeFilters,
    toggleTrainee,
    togglePrimaryFramework,
    toggleSecondaryFramework
  };
};
