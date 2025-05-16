// src/pages/EntriesHistory.tsx

import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAdmin } from "../context/AdminContext";
import { Trainee, Entry } from "../types";
import { traineeService, entryService } from "../services/api";
import { socketService } from "../services/socket"; // Import socket service
import { useToast } from "@/components/ui/use-toast";
import { Dialog } from "@/components/ui/dialog";
import { Loader } from "lucide-react";
import EntriesFilter from "../components/EntriesHistory/EntriesFilter";
import EntriesTable from "../components/EntriesHistory/EntriesTable";
import EntriesPagination from "../components/EntriesHistory/EntriesPagination";
import TraineeProfileDialog from "../components/EntriesHistory/TraineeProfileDialog";
import EntriesRealtimeIndicator from "../components/EntriesHistory/EntriesRealtimeIndicator"; // Import the new component
import ExportButton from "../components/EntriesHistory/ExportButton";
import { useEntriesFilter } from "../hooks/useEntriesFilter";
import { useQuery } from "@tanstack/react-query";
import { log } from "console";

const EntriesHistory = () => {
  // const { trainees, entries, setEntries } = useAdmin();
  const { toast } = useToast();

  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasNewEntries, setHasNewEntries] = useState(false);

  // Query for selected trainee
  const { data: selectedTrainee } = useQuery({
    queryKey: ["trainee", selectedTraineeId],
    queryFn: () => traineeService.getById(selectedTraineeId),
    enabled: !!selectedTraineeId,
  });
  

  const {
    entries: displayedEntries,
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
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    currentPage,
    totalPages,
    totalEntries,
    entriesPerPage,
    goToPage,
    refreshEntries,
  } = useEntriesFilter();
  console.log(selectedDepartment)
  // Set up WebSocket event handler for new entries
  useEffect(() => {
    // Register handler for new entries
    const cleanup = socketService.onNewEntry((newEntry) => {
      setHasNewEntries(true);

      if (newEntry.status === "notAssociated") {
        toast({
          title: "משתמש לא משויך לבסיס",
          description: `לא משוייך לבסיס זה: ${
            newEntry.traineeFullName || newEntry.traineePersonalId
          }`,
          color: "purple",
        });
      }

      // Show toast notification
      toast({
        title: "כניסה חדשה",
        description: `נרשמה כניסה חדשה: ${
          newEntry.traineeFullName || newEntry.traineePersonalId
        }`,
      });
    });

    return cleanup;
  }, [toast]);

  // Auto-refresh when new entries are detected
  useEffect(() => {
    if (hasNewEntries) {
      refreshEntries();
      setHasNewEntries(false);
    }
  }, [hasNewEntries, refreshEntries]);

  const handleTraineeClick = (traineeId) => {    
    setSelectedTraineeId(traineeId._id);
    setIsDialogOpen(true);
  };



  return (
    <DashboardLayout activeTab="entries">
      <div className="space-y-6 animate-fade-up">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">היסטוריית כניסות</h2>
          <div className="flex gap-2 items-center">
            {/* Add real-time indicator */}

            <EntriesRealtimeIndicator />
            <ExportButton
              displayedEntries={displayedEntries}
              searchTerm={searchTerm}
              selectedDepartment={selectedDepartment}
              selectedSubDepartment={selectedSubDepartment}
              selectedBase={selectedBase}
              startDate={startDate}
              endDate={endDate}
              isLoading={isLoading}
            />
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
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              <EntriesTable
                displayedEntries={displayedEntries}
                handleTraineeClick={handleTraineeClick}
                isLoading={isLoading}
              />

              {totalEntries > 0 && (
                <div className="border-t px-4 py-2 flex items-center justify-between sticky bottom-0 bg-card">
                  <div className="text-sm text-muted-foreground">
                    מציג{" "}
                    {displayedEntries.length > 0
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
            </div>
          )}
        </div>
      </div>

      {selectedTrainee && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <TraineeProfileDialog
            trainee={selectedTrainee}
          />
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default EntriesHistory;
