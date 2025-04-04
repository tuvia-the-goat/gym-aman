
import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAnalyticsFilters } from '../hooks/useAnalyticsFilters';
import { useAnalyticsData } from '../hooks/useAnalyticsData';

// Import refactored components
import FilterHeader from '../components/analytics/FilterHeader';
import FilterDialog from '../components/analytics/FilterDialog';
import ActiveFilters from '../components/analytics/ActiveFilters';
import SummaryStats from '../components/analytics/SummaryStats';
import WeekdayChart from '../components/analytics/WeekdayChart';
import MonthlyChart from '../components/analytics/MonthlyChart';
import TopTraineesChart from '../components/analytics/TopTraineesChart';
import TopDepartmentsChart from '../components/analytics/TopDepartmentsChart';
import BasesChart from '../components/analytics/BasesChart';
import HourlyDistributionChart from '../components/analytics/HourlyDistributionChart';

const Analytics = () => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedDepartmentIds,
    setSelectedDepartmentIds,
    selectedTrainees,
    setSelectedTrainees,
    showFilterDialog,
    setShowFilterDialog,
    filteredEntries,
    filteredTrainees,
    availableDepartments,
    traineesByDepartment,
    hasSpecificFilters,
    hasActiveFilters,
    clearFilters,
    clearDateFilters,
    clearDepartmentFilters,
    clearTraineeFilters,
    toggleTrainee,
    toggleDepartment
  } = useAnalyticsFilters();
  
  const {
    weekdaysData,
    monthlyData,
    topTraineesData,
    topDepartmentsData,
    basesData,
    avgEntriesPerTrainee,
    isGeneralAdmin,
    getDepartmentName,
    getBaseName
  } = useAnalyticsData(
    filteredEntries,
    filteredTrainees,
    startDate,
    endDate,
    hasSpecificFilters
  );

  return (
    <DashboardLayout activeTab="analytics">
      <div className="space-y-8 animate-fade-up">
        {/* Filter Header */}
        <FilterHeader 
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          openFilterDialog={() => setShowFilterDialog(true)}
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
          selectedTrainees={selectedTrainees}
          setSelectedTrainees={setSelectedTrainees}
          availableDepartments={availableDepartments}
          traineesByDepartment={traineesByDepartment}
          clearFilters={clearFilters}
          toggleDepartment={toggleDepartment}
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
          selectedTrainees={selectedTrainees}
          clearDateFilters={clearDateFilters}
          clearDepartmentFilters={clearDepartmentFilters}
          clearTraineeFilters={clearTraineeFilters}
        />
        
        {/* Summary Stats */}
        <SummaryStats 
          entriesCount={filteredEntries.length}
          traineesCount={filteredTrainees.length}
          avgEntriesPerTrainee={avgEntriesPerTrainee}
        />
        
        {/* New Chart - Hourly Distribution */}
        <HourlyDistributionChart entries={filteredEntries} />
        
        {/* Main Charts - always visible, even with specific filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Entries by Day of Week */}
          <WeekdayChart data={weekdaysData} />
          
          {/* Monthly Entries */}
          <MonthlyChart data={monthlyData} />
        </div>
        
        {/* Top Trainees and Departments - always visible */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Trainees */}
          <TopTraineesChart 
            data={topTraineesData} 
            hasSpecificFilters={hasSpecificFilters}
            showBaseColumn={isGeneralAdmin}
          />
          
          {/* Top Departments - only show if no specific filters active */}
          {!hasSpecificFilters && (
            <TopDepartmentsChart 
              data={topDepartmentsData}
              showBaseColumn={isGeneralAdmin}
            />
          )}
        </div>
        
        {/* Bases Chart (only for allBasesAdmin) and no specific filters */}
        {isGeneralAdmin && !hasSpecificFilters && basesData.length > 0 && (
          <BasesChart data={basesData} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
