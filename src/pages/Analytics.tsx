
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
// Import new chart components
import GenderDistributionChart from '../components/analytics/GenderDistributionChart';
import AgeDistributionChart from '../components/analytics/AgeDistributionChart';

const Analytics = () => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedMainFrameworkIds,
    setSelectedMainFrameworkIds,
    selectedTrainees,
    setSelectedTrainees,
    showFilterDialog,
    setShowFilterDialog,
    filteredEntries,
    filteredTrainees,
    availableMainFrameworks,
    traineesByMainFramework,
    hasSpecificFilters,
    hasActiveFilters,
    clearFilters,
    clearDateFilters,
    clearMainFrameworkFilters,
    clearTraineeFilters,
    toggleTrainee,
    toggleMainFramework
  } = useAnalyticsFilters();
  
  const {
    weekdaysData,
    monthlyData,
    topTraineesData,
    topDepartmentsData,
    basesData,
    genderDistributionData,
    genderEntriesDistributionData,
    ageDistributionData,
    detailedTraineeAgeData,
    avgEntriesPerTrainee,
    isGeneralAdmin,
    getMainFrameworkName,
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
          selectedMainFrameworkIds={selectedMainFrameworkIds}
          setSelectedMainFrameworkIds={setSelectedMainFrameworkIds}
          selectedTrainees={selectedTrainees}
          setSelectedTrainees={setSelectedTrainees}
          availableMainFrameworks={availableMainFrameworks}
          traineesByMainFramework={traineesByMainFramework}
          clearFilters={clearFilters}
          toggleMainFramework={toggleMainFramework}
          toggleTrainee={toggleTrainee}
          getMainFrameworkName={getMainFrameworkName}
          getBaseName={getBaseName}
          isGeneralAdmin={isGeneralAdmin}
        />
        
        {/* Active Filters Display */}
        <ActiveFilters 
          startDate={startDate}
          endDate={endDate}
          selectedMainFrameworkIds={selectedMainFrameworkIds}
          selectedTrainees={selectedTrainees}
          clearDateFilters={clearDateFilters}
          clearMainFrameworkFilters={clearMainFrameworkFilters}
          clearTraineeFilters={clearTraineeFilters}
        />
        
        {/* Summary Stats */}
        <SummaryStats 
          entriesCount={filteredEntries.length}
          traineesCount={filteredTrainees.length}
          avgEntriesPerTrainee={avgEntriesPerTrainee}
        />
        
        {/* New Charts - Gender and Age Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GenderDistributionChart 
            data={genderDistributionData} 
            entriesData={genderEntriesDistributionData} 
          />
          <AgeDistributionChart 
            data={ageDistributionData} 
            traineeDetails={detailedTraineeAgeData}
          />
        </div>
        
        {/* New Chart - Hourly Distribution */}
        <HourlyDistributionChart entries={filteredEntries} />
        
        {/* Main Charts - always visible, even with specific filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Entries by Day of Week */}
          <WeekdayChart data={weekdaysData} />
          
          {/* Monthly Entries */}
          <MonthlyChart data={monthlyData} />
        </div>
        
        {/* Top Trainees and Main Frameworks - always visible */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Trainees */}
          <TopTraineesChart 
            data={topTraineesData} 
            hasSpecificFilters={hasSpecificFilters}
            showBaseColumn={isGeneralAdmin}
          />
          
          {/* Top Main Frameworks - only show if no specific filters active */}
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
