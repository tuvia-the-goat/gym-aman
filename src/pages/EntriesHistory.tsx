// src/pages/EntriesHistory.tsx

import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAdmin } from "../context/AdminContext";
import { Trainee } from "../types";
import { traineeService } from "../services/api";
import { useToast } from "@/components/ui/use-toast";
import { Dialog } from "@/components/ui/dialog";
import { Loader } from "lucide-react";
import EntriesFilter from "../components/EntriesHistory/EntriesFilter";
import EntriesTable from "../components/EntriesHistory/EntriesTable";
import EntriesPagination from "../components/EntriesHistory/EntriesPagination";
import TraineeProfileDialog from "../components/EntriesHistory/TraineeProfileDialog";
import ExportButton from "../components/EntriesHistory/ExportButton";
import { useEntriesFilter } from "../hooks/useEntriesFilter";

const EntriesHistory = () => {
  const { trainees } = useAdmin();
  const { toast } = useToast();

  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    entries,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedDepartment,
    setSelectedDepartment,
    selectedSubDepartment,
    setSelectedSubDepartment,
    selectedBase,
    setSelectedBase,
    selectedProfile,
    setSelectedProfile,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    currentPage,
    totalPages,
    totalEntries,
    entriesPerPage,
    goToPage,
    hasOrthopedicCondition,
    hasMedicalLimitation,
    refreshEntries,
  } = useEntriesFilter();

  const handleTraineeClick = (traineeId: string) => {
    const trainee = trainees.find((t) => t._id === traineeId);
    if (trainee) {
      setSelectedTrainee(trainee);
      setIsDialogOpen(true);
    }
  };

  const updateMedicalApproval = async (approved: boolean) => {
    if (!selectedTrainee) return;
    try {
      const updatedTrainee = await traineeService.updateMedicalApproval(
        selectedTrainee._id,
        {
          approved: approved,
          expirationDate: approved
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : null,
        }
      );
      setSelectedTrainee(updatedTrainee);
      toast({
        title: approved ? "אישור רפואי עודכן" : "אישור רפואי בוטל",
        description: approved
          ? "האישור הרפואי עודכן בהצלחה לשנה"
          : "האישור הרפואי בוטל בהצלחה",
      });
    } catch (error) {
      console.error("Error updating medical approval:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת עדכון האישור הרפואי",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout activeTab="entries">
      <div className="space-y-6 animate-fade-up">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">היסטוריית כניסות</h2>
          <div className="flex gap-2 items-center">
            <ExportButton
              searchTerm={searchTerm}
              selectedDepartment={selectedDepartment}
              selectedSubDepartment={selectedSubDepartment}
              selectedBase={selectedBase}
              selectedProfile={selectedProfile}
              startDate={startDate}
              endDate={endDate}
              isLoading={isLoading}
            />
            <button
              onClick={refreshEntries}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              title="רענן"
            >
              <Loader className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <EntriesFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          selectedSubDepartment={selectedSubDepartment}
          setSelectedSubDepartment={setSelectedSubDepartment}
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
          {error ? (
            <div className="p-6 text-center text-red-500">
              <p>{error}</p>
              <button
                onClick={refreshEntries}
                className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                נסה שוב
              </button>
            </div>
          ) : (
            <>
              <EntriesTable
                displayedEntries={entries}
                hasOrthopedicCondition={hasOrthopedicCondition}
                hasMedicalLimitation={hasMedicalLimitation}
                handleTraineeClick={handleTraineeClick}
                isLoading={isLoading}
              />

              {totalEntries > 0 && (
                <div className="border-t px-4 py-2 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    מציג{" "}
                    {entries.length > 0
                      ? `${(currentPage - 1) * entriesPerPage + 1}-${Math.min(
                          currentPage * entriesPerPage,
                          totalEntries
                        )}`
                      : "0"}{" "}
                    מתוך {totalEntries} רשומות
                  </div>

                  <EntriesPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    goToPage={goToPage}
                  />
                </div>
              )}
            </>
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