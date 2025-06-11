import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAnalyticsFilters } from '../hooks/useAnalyticsFilters';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { subDays, subWeeks, subMonths } from 'date-fns';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAdmin } from '../context/AdminContext';

// Import refactored components
import FilterHeader from '../components/analytics/FilterHeader';
import FilterDialog from '../components/analytics/FilterDialog';
import ActiveFilters from '../components/analytics/ActiveFilters';
import SummaryStats from '../components/analytics/SummaryStats';
import WeekdayChart from '../components/analytics/WeekdayChart';
import MonthlyChart from '../components/analytics/MonthlyChart';
import TopTraineesChart from '../components/analytics/TopTraineesChart';
import TopDepartmentsChart from '../components/analytics/TopDepartmentsChart';
import TopSubDepartmentsChart from '../components/analytics/TopSubDepartmentsChart';
import BasesChart from '../components/analytics/BasesChart';
import HourlyDistributionChart from '../components/analytics/HourlyDistributionChart';
// Import chart components
import GenderDistributionChart from '../components/analytics/GenderDistributionChart';
import AgeDistributionChart from '../components/analytics/AgeDistributionChart';
import MedicalProfileChart from '../components/analytics/MedicalProfileChart';

const Analytics = () => {
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

  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedDepartmentIds,
    setSelectedDepartmentIds,
    selectedSubDepartmentIds,
    setSelectedSubDepartmentIds,
    selectedTrainees,
    setSelectedTrainees,
    showFilterDialog,
    setShowFilterDialog,
    filteredEntries,
    filteredTrainees,
    availableDepartments,
    availableSubDepartments,
    traineesByDepartment,
    hasSpecificFilters,
    hasActiveFilters,
    clearFilters,
    clearDateFilters,
    clearDepartmentFilters,
    clearTraineeFilters,
    toggleTrainee,
    toggleDepartment,
    toggleSubDepartment
  } = useAnalyticsFilters();
  
  const {
    weekdaysData,
    monthlyData,
    topTraineesData,
    topDepartmentsData,
    topSubDepartmentsData,
    basesData,
    genderDistributionData,
    genderEntriesDistributionData,
    ageDistributionData,
    detailedTraineeAgeData,
    medicalProfileData,
    hourlyDistributionData,
    isGeneralAdmin,
    getDepartmentName,
    getBaseName,
    entries,
    trainees,
    loadingStates,
    fetchHourlyData
  } = useAnalyticsData(
    filteredEntries,
    filteredTrainees,
    startDate,
    endDate,
    hasSpecificFilters,
    selectedDepartmentIds,
    selectedSubDepartmentIds,
    selectedTrainees
  );

  const handleQuickDateSelect = (value: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (value) {
      case "all":
        setStartDate(undefined);
        setEndDate(undefined);
        break;
      case "today":
        setStartDate(today);
        setEndDate(today);
        break;
      case "yesterday":
        const yesterday = subDays(today, 1);
        setStartDate(yesterday);
        setEndDate(yesterday);
        break;
      case "lastWeek":
        const lastWeekStart = subWeeks(today, 1);
        setStartDate(lastWeekStart);
        setEndDate(today);
        break;
      case "lastMonth":
        const lastMonthStart = subMonths(today, 1);
        setStartDate(lastMonthStart);
        setEndDate(today);
        break;
      case "personalized":
        setShowFilterDialog(true);
        break;
    }
  };

  // Function to clear sub-department filters
  const clearSubDepartmentFilters = () => {
    if (setSelectedSubDepartmentIds) {
      setSelectedSubDepartmentIds([]);
    }
  };

  const handleHourlyDayChange = async (day: string) => {
    const selectedDay = day === 'כל הימים' ? undefined : day;
    await fetchHourlyData(selectedDay);
  };


  return (
    <DashboardLayout activeTab="analytics">
      <div className="space-y-8 animate-fade-up">
        {/* Filter Header */}
        <FilterHeader 
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          openFilterDialog={() => setShowFilterDialog(true)}
          onDateSelect={handleQuickDateSelect}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />
        
        {/* Filter Dialog */}
        <FilterDialog 
          open={showFilterDialog}
          onOpenChange={setShowFilterDialog}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          selectedDepartmentIds={selectedDepartmentIds}
          setSelectedDepartmentIds={setSelectedDepartmentIds}
          selectedSubDepartmentIds={selectedSubDepartmentIds}
          setSelectedSubDepartmentIds={setSelectedSubDepartmentIds}
          selectedTrainees={selectedTrainees}
          setSelectedTrainees={setSelectedTrainees}
          availableDepartments={availableDepartments}
          availableSubDepartments={availableSubDepartments}
          traineesByDepartment={traineesByDepartment}
          clearFilters={clearFilters}
          toggleDepartment={toggleDepartment}
          toggleSubDepartment={toggleSubDepartment}
          toggleTrainee={toggleTrainee}
          getDepartmentName={getDepartmentName}
          getBaseName={getBaseName}
          isGeneralAdmin={isGeneralAdmin}
        />
        
        {/* Active Filters Display */}
        <ActiveFilters 
          startDate={startDate}
          endDate={endDate}
          selectedDepartmentIds={selectedDepartmentIds}
          selectedSubDepartmentIds={selectedSubDepartmentIds}
          selectedTrainees={selectedTrainees}
          clearDateFilters={clearDateFilters}
          clearDepartmentFilters={clearDepartmentFilters}
          clearSubDepartmentFilters={clearSubDepartmentFilters}
          clearTraineeFilters={clearTraineeFilters}
        />
        
        {/* Summary Stats */}
          <SummaryStats 
            entriesCount={entries?.count || 0}
            traineesCount={trainees?.count || 0}
            avgEntriesPerTrainee={Number((entries?.count / (trainees?.count || 1)).toFixed(2))}
            isLoadingEntries={loadingStates.entries}
            isLoadingTrainees={loadingStates.trainees}
            isLoadingAvg={loadingStates.entries || loadingStates.trainees}
          />
        
        
        {/* New Chart - Hourly Distribution */}
        <HourlyDistributionChart 
          data={hourlyDistributionData || []} 
          isLoading={loadingStates.hourlyDistribution}
          onDayChange={handleHourlyDayChange}
        />
        
        {/* Main Charts - always visible, even with specific filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Entries by Day of Week */}
          {loadingStates.weekday ? (
            <div className="bg-card shadow-sm rounded-lg p-6 border h-80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <WeekdayChart data={weekdaysData || []} />
          )}
          
          {/* Monthly Entries */}
          {loadingStates.monthly ? (
            <div className="bg-card shadow-sm rounded-lg p-6 border h-80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <MonthlyChart data={monthlyData || []} />
          )}
        </div>
        
        {/* Top Trainees and Departments - always visible */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Trainees */}
          {loadingStates.topPerformers ? (
            <div className="bg-card shadow-sm rounded-lg p-6 border h-80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <TopTraineesChart 
              data={topTraineesData || []} 
              hasSpecificFilters={hasSpecificFilters}
              showBaseColumn={isGeneralAdmin}
            />
          )}
          
          {/* Top Departments - only show if no specific filters active */}
          {
            loadingStates.topPerformers ? (
              <div className="bg-card shadow-sm rounded-lg p-6 border h-80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <TopDepartmentsChart 
                data={topDepartmentsData || []}
                showBaseColumn={isGeneralAdmin}
              />
            )
          }
        </div>

        {/* Top SubDepartments - our new chart */}
        <div className="w-full">
          {loadingStates.topSubDepartments ? (
            <div className="bg-card shadow-sm rounded-lg p-6 border h-80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : topSubDepartmentsData?.length > 0 ? (
            <TopSubDepartmentsChart
              data={topSubDepartmentsData}
              showBaseColumn={isGeneralAdmin}
            />
          ) : (
            <div className="bg-card shadow-sm rounded-lg p-6 border">
              <h3 className="text-lg font-medium mb-4">5 תתי-המסגרות המובילות</h3>
              <div className="h-60 flex items-center justify-center">
                <p className="text-center text-muted-foreground">אין נתונים זמינים על תתי-מסגרות{selectedSubDepartmentIds?.length > 0 ? " עם הסינון הנוכחי" : ""}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Medical Profile Chart */}
        {!startDate && !endDate && (
          loadingStates.medicalProfile ? (
            <div className="bg-card shadow-sm rounded-lg p-6 border h-80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <MedicalProfileChart 
              data={medicalProfileData || []}
            />
          )
        )}

        {/* New Charts - Gender, Age, and Medical Profile Distribution */}
        {!startDate && !endDate && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loadingStates.gender ? (
              <div className="bg-card shadow-sm rounded-lg p-6 border h-80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <GenderDistributionChart 
                data={genderDistributionData || []} 
                entriesData={genderEntriesDistributionData || []} 
              />
            )}
            {loadingStates.age ? (
              <div className="bg-card shadow-sm rounded-lg p-6 border h-80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <AgeDistributionChart 
                data={ageDistributionData || []} 
                traineeDetails={detailedTraineeAgeData || []}
              />
            )}
          </div>
        )}

        {/* Bases Chart (only for allBasesAdmin) and no specific filters */}
        {isGeneralAdmin && !hasSpecificFilters && (
          loadingStates.bases ? (
            <div className="bg-card shadow-sm rounded-lg p-6 border h-80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : basesData?.length > 0 && (
            <BasesChart data={basesData} />
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;