// src/pages/EntriesHistory.tsx

import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAdmin } from '../context/AdminContext';
import { Trainee } from '../types';
import { traineeService } from '../services/api';
import { useToast } from '@/components/ui/use-toast';
import { Dialog } from "@/components/ui/dialog";
import EntriesFilter from '../components/EntriesHistory/EntriesFilter';
import EntriesTable from '../components/EntriesHistory/EntriesTable';
import EntriesPagination from '../components/EntriesHistory/EntriesPagination';
import TraineeProfileDialog from '../components/EntriesHistory/TraineeProfileDialog';
import { useEntriesFilter } from '../hooks/useEntriesFilter';

const EntriesHistory = () => {
  const { trainees } = useAdmin();
  const { toast } = useToast();
  
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const {
    displayedEntries,
    filteredEntries,
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
  } = useEntriesFilter();

  const handleTraineeClick = (traineeId: string) => {
    const trainee = trainees.find(t => t._id === traineeId);
    if (trainee) {
      setSelectedTrainee(trainee);
      setIsDialogOpen(true);
    }
  };

  const updateMedicalApproval = async (approved: boolean) => {
    if (!selectedTrainee) return;
    try {
      const updatedTrainee = await traineeService.updateMedicalApproval(selectedTrainee._id, {
        approved: approved,
        expirationDate: approved ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined
      });
      setSelectedTrainee(updatedTrainee);
      toast({
        title: approved ? "אישור רפואי עודכן" : "אישור רפואי בוטל",
        description: approved ? "האישור הרפואי עודכן בהצלחה לשנה" : "האישור הרפואי בוטל בהצלחה"
      });
    } catch (error) {
      console.error('Error updating medical approval:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת עדכון האישור הרפואי",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout activeTab="entries">
      <div className="space-y-6 animate-fade-up">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">היסטוריית כניסות</h2>
        </div>

        <EntriesFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          selectedSubDepartment={selectedSubDepartment} // Add this line
          setSelectedSubDepartment={setSelectedSubDepartment} // Add this line
          selectedBase={selectedBase}
          setSelectedBase={setSelectedBase}
          selectedProfile={selectedProfile}
          setSelectedProfile={setSelectedProfile}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />

        <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
          <EntriesTable
            displayedEntries={displayedEntries}
            hasOrthopedicCondition={hasOrthopedicCondition}
            hasMedicalLimitation={hasMedicalLimitation}
            handleTraineeClick={handleTraineeClick}
          />
          
          {filteredEntries.length > 0 && (
            <EntriesPagination
              currentPage={currentPage}
              totalPages={getTotalPages()}
              goToPage={goToPage}
            />
          )}
        </div>
      </div>
      
      {selectedTrainee && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <TraineeProfileDialog 
            trainee={selectedTrainee}
            updateMedicalApproval={updateMedicalApproval}
          />
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default EntriesHistory;