import { Entry, Trainee } from '@/types';
import { useAdmin } from '../context/AdminContext';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

export const useAnalyticsData = (
  filteredEntries: Entry[],
  filteredTrainees: Trainee[],
  startDate?: Date,
  endDate?: Date,
  hasSpecificFilters = false,
  selectedDepartmentIds: string[] = [],
  selectedSubDepartmentIds: string[] = [],
  selectedTrainees: string[] = []
) => {
  const { admin } = useAdmin();
  const [analyticsData, setAnalyticsData] = useState({
    weekdaysData: [],
    monthlyData: [],
    topTraineesData: [],
    topDepartmentsData: [],
    topSubDepartmentsData: [],
    basesData: [],
    genderDistributionData: [],
    genderEntriesDistributionData: [],
    ageDistributionData: [],
    detailedTraineeAgeData: [],
    medicalProfileData: [],
    hourlyDistributionData: []
  });
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | null>>({});
  const [departmentNames, setDepartmentNames] = useState<Record<string, string>>({});
  const [baseNames, setBaseNames] = useState<Record<string, string>>({});
  const [entries, setEntries] = useState<{ count: number }>({ count: 0 });
  const [trainees, setTrainees] = useState<{ count: number }>({ count: 0 });

  const fetchAnalyticsData = useCallback(async () => {
    // Don't fetch if admin is not yet loaded
    if (!admin) {
      return;
    }

    const params = {
      startDate: startDate?.toISOString().split('T')[0],
      endDate: endDate?.toISOString().split('T')[0],
      baseId: admin.role === 'gymAdmin' ? admin.baseId : undefined,
      departmentIds: selectedDepartmentIds?.length > 0 ? selectedDepartmentIds : undefined,
      subDepartmentIds: selectedSubDepartmentIds?.length > 0 ? selectedSubDepartmentIds : undefined,
      traineeIds: selectedTrainees?.length > 0 ? selectedTrainees : undefined
    };

    // Initialize loading states
    const initialLoadingState = {
      weekday: true,
      monthly: true,
      gender: true,
      age: true,
      topPerformers: true,
      topSubDepartments: true,
      bases: true,
      medicalProfile: true,
      entries: true,
      trainees: true,
      hourlyDistribution: true
    };
    setIsLoading(initialLoadingState);

    // Initialize error states
    const initialErrorState = {
      weekday: null,
      monthly: null,
      gender: null,
      age: null,
      topPerformers: null,
      topSubDepartments: null,
      bases: null,
      medicalProfile: null,
      entries: null,
      trainees: null,
      hourlyDistribution: null
    };
    setError(initialErrorState);

    // Helper function to handle individual requests
    const fetchData = async (endpoint: string, key: string) => {
      try {
        
        const response = await axios.get(`/api/analytics/${endpoint}`, { 
          params,
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        
        // Handle special case for top performers which includes department and base names
        if (endpoint === 'top-performers') {
          const { topTraineesData, topDepartmentsData } = response.data;
          
          setAnalyticsData(prev => {
            const newData = {
              ...prev,
              topTraineesData,
              topDepartmentsData
            };
            return newData;
          });
        } else if (endpoint === 'weekday') {
          setAnalyticsData(prev => {
            const newData = {
              ...prev,
              weekdaysData: response.data
            };
            return newData;
          });
        } else if (endpoint === 'monthly') {
          setAnalyticsData(prev => {
            const newData = {
              ...prev,
              monthlyData: response.data
            };
            return newData;
          });
        } else if (endpoint === 'gender-distribution') {
          const { genderDistributionData, genderEntriesDistributionData } = response.data;
          
          setAnalyticsData(prev => {
            const newData = {
              ...prev,
              genderDistributionData,
              genderEntriesDistributionData
            };
            return newData;
          });
        } else if (endpoint === 'age-distribution') {
          const { ageDistributionData, detailedTraineeAgeData } = response.data;
          
          setAnalyticsData(prev => {
            const newData = {
              ...prev,
              ageDistributionData,
              detailedTraineeAgeData
            };
            return newData;
          });
        } else if (endpoint === 'top-subdepartments') {
          const { topSubDepartmentsData } = response.data;
          
          setAnalyticsData(prev => {
            const newData = {
              ...prev,
              topSubDepartmentsData
            };
            return newData;
          });
        } else if (endpoint === 'bases') {
          const { basesData } = response.data;
          
          setAnalyticsData(prev => {
            const newData = {
              ...prev,
              basesData
            };
            return newData;
          });
        } else if (endpoint === 'medical-profile') {
          const { medicalProfileData } = response.data;
          
          setAnalyticsData(prev => {
            const newData = {
              ...prev,
              medicalProfileData
            };
            return newData;
          });
        } else if (endpoint === 'hourly-distribution') {
          const { hourlyData } = response.data;
          
          setAnalyticsData(prev => {
            const newData = {
              ...prev,
              hourlyDistributionData: hourlyData
            };
            return newData;
          });
        } else {
          setAnalyticsData(prev => {
            const newData = {
              ...prev,
              ...response.data
            };
            return newData;
          });
        }
        
        setIsLoading(prev => ({ ...prev, [key]: false }));
      } catch (err) {
        console.error(`Error fetching ${endpoint} data:`, err);
        setError(prev => ({ ...prev, [key]: `Failed to fetch ${endpoint} data` }));
        setIsLoading(prev => ({ ...prev, [key]: false }));
      }
    };

    // Fetch filtered entries and trainees
    const fetchFilteredData = async () => {
      try {
        // Prepare filter parameters
        const filterParams = {
          ...params
        };

        // Fetch filtered entries
        const entriesResponse = await axios.get('/api/analytics/filtered-entries', {
          params: filterParams,
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        setEntries(entriesResponse.data);

        // Fetch filtered trainees
        const traineesResponse = await axios.get('/api/analytics/filtered-trainees', {
          params: filterParams,
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        setTrainees({ count: traineesResponse.data.count });

        setIsLoading(prev => ({ ...prev, entries: false, trainees: false }));
      } catch (err) {
        console.error('Error fetching filtered data:', err);
        setError(prev => ({ ...prev, entries: 'Failed to fetch filtered entries', trainees: 'Failed to fetch filtered trainees' }));
        setIsLoading(prev => ({ ...prev, entries: false, trainees: false }));
      }
    };

    // Fetch all data concurrently
    try {
      await Promise.all([
        fetchData('weekday', 'weekday'),
        fetchData('monthly', 'monthly'),
        fetchData('gender-distribution', 'gender'),
        fetchData('age-distribution', 'age'),
        fetchData('top-performers', 'topPerformers'),
        fetchData('top-subdepartments', 'topSubDepartments'),
        fetchData('bases', 'bases'),
        fetchData('medical-profile', 'medicalProfile'),
        fetchData('hourly-distribution', 'hourlyDistribution'),
        fetchFilteredData()
      ]);
    } catch (err) {
      console.error('Error in concurrent data fetch:', err);
    }
  }, [admin, startDate, endDate, filteredEntries]);

  const fetchHourlyData = useCallback(async (selectedDay?: string) => {
    if (!admin) return;

    setIsLoading(prev => ({ ...prev, hourlyDistribution: true }));
    setError(prev => ({ ...prev, hourlyDistribution: null }));

    try {
      const params = {
        startDate: startDate?.toISOString().split('T')[0],
        endDate: endDate?.toISOString().split('T')[0],
        baseId: admin.role === 'gymAdmin' ? admin.baseId : undefined,
        selectedDay,
        departmentIds: selectedDepartmentIds?.length > 0 ? selectedDepartmentIds : undefined,
        subDepartmentIds: selectedSubDepartmentIds?.length > 0 ? selectedSubDepartmentIds : undefined,
        traineeIds: selectedTrainees?.length > 0 ? selectedTrainees : undefined
      };

      const response = await axios.get('/api/analytics/hourly-distribution', {
        params,
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      setAnalyticsData(prev => ({
        ...prev,
        hourlyDistributionData: response.data.hourlyData
      }));
    } catch (err) {
      console.error('Error fetching hourly distribution data:', err);
      setError(prev => ({ ...prev, hourlyDistribution: 'Failed to fetch hourly distribution data' }));
    } finally {
      setIsLoading(prev => ({ ...prev, hourlyDistribution: false }));
    }
  }, [admin, startDate, endDate, selectedDepartmentIds, selectedSubDepartmentIds, selectedTrainees]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Check if any data is still loading
  const isAnyLoading = Object.values(isLoading).some(Boolean);
  // Check if any errors occurred
  const hasErrors = Object.values(error).some(Boolean);

  // Helper functions for getting names
  const getDepartmentName = useCallback((id: string) => departmentNames[id] || '-', [departmentNames]);
  const getBaseName = useCallback((id: string) => baseNames[id] || '-', [baseNames]);
  
  return {
    ...analyticsData,
    entries,
    trainees,
    isLoading: isAnyLoading || !admin, // Consider loading if admin is not yet loaded
    error: hasErrors ? Object.values(error).filter(Boolean).join(', ') : null,
    loadingStates: isLoading,
    errors: error,
    getDepartmentName,
    getBaseName,
    isGeneralAdmin: admin?.role === 'generalAdmin',
    refetchAnalyticsData: fetchAnalyticsData,
    fetchHourlyData
  };
};