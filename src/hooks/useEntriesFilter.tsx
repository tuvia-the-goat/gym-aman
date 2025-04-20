// src/hooks/useEntriesFilter.tsx

import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Entry, Trainee, EntryStatus } from '../types';
import { isWithinInterval, parseISO } from 'date-fns';

export const useEntriesFilter = () => {
  const { admin, entries, trainees } = useAdmin();
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [displayedEntries, setDisplayedEntries] = useState<Entry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSubDepartment, setSelectedSubDepartment] = useState(''); // Add this line
  const [selectedBase, setSelectedBase] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 20;

  // Filter entries based on admin role
  useEffect(() => {
    let filtered = [...entries];
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(entry => entry.baseId === admin.baseId);
    }
    setFilteredEntries(filtered);
  }, [admin, entries]);

  // Apply search and filters
  useEffect(() => {
    let filtered = [...entries];
    if (admin?.role === 'gymAdmin' && admin.baseId) {
      filtered = filtered.filter(entry => entry.baseId === admin.baseId);
    }
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.traineeFullName && entry.traineeFullName.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    if (selectedDepartment) {
      filtered = filtered.filter(entry => entry.departmentId === selectedDepartment);
    }
    if (selectedSubDepartment) { // Add this condition
      filtered = filtered.filter(entry => entry.subDepartmentId === selectedSubDepartment);
    }
    if (admin?.role === 'generalAdmin' && selectedBase) {
      filtered = filtered.filter(entry => entry.baseId === selectedBase);
    }
    if (selectedProfile) {
      const traineesWithProfile = trainees.filter(trainee => trainee.medicalProfile === selectedProfile).map(trainee => trainee._id);
      filtered = filtered.filter(entry => traineesWithProfile.includes(entry.traineeId));
    }
    if (startDate && endDate) {
      filtered = filtered.filter(entry => {
        const entryDate = parseISO(entry.entryDate);
        return isWithinInterval(entryDate, {
          start: startDate,
          end: endDate
        });
      });
    }
    setFilteredEntries(filtered);
    setCurrentPage(1);
  }, [admin, entries, searchTerm, selectedDepartment, selectedSubDepartment, selectedBase, selectedProfile, startDate, endDate, trainees]);

  // Paginate entries
  useEffect(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    setDisplayedEntries(filteredEntries.slice(startIndex, endIndex));
  }, [filteredEntries, currentPage]);

  const getTotalPages = () => {
    return Math.ceil(filteredEntries.length / entriesPerPage);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const hasOrthopedicCondition = (traineeId: string): boolean => {
    const trainee = trainees.find(t => t._id === traineeId);
    return trainee ? !!trainee.orthopedicCondition : false;
  };

  const hasMedicalLimitation = (traineeId: string): boolean => {
    const trainee = trainees.find(t => t._id === traineeId);
    return trainee ? !!trainee.medicalLimitation : false;
  };

  return {
    filteredEntries,
    displayedEntries,
    searchTerm,
    setSearchTerm,
    selectedDepartment,
    setSelectedDepartment,
    selectedSubDepartment, // Add this line
    setSelectedSubDepartment, // Add this line
    selectedBase,
    setSelectedBase,
    selectedProfile,
    setSelectedProfile,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    currentPage,
    getTotalPages,
    goToPage,
    hasOrthopedicCondition,
    hasMedicalLimitation
  };
};