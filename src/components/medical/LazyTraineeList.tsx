// src/components/medical/LazyTraineeList.tsx
import React, { useEffect } from "react";
import { Trainee } from "../../types";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import useLazyTrainees from "../../hooks/useLazyTrainees";
import { useAdmin } from "@/context/AdminContext";

interface LazyTraineeListProps {
  selectedTrainee: Trainee | null;
  onSelectTrainee: (trainee: Trainee) => void;
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
  showOnlyExpired?: boolean;
  setShowOnlyExpired?: (value: boolean) => void;
  expirationDate?: Date;
  setExpirationDate?: (date: Date | undefined) => void;
}

const LazyTraineeList = ({
  selectedTrainee,
  onSelectTrainee,
  // Optional overrides for external state management
  searchQuery: externalSearchQuery,
  setSearchQuery: externalSetSearchQuery,
  showOnlyExpired: externalShowOnlyExpired,
  setShowOnlyExpired: externalSetShowOnlyExpired,
  expirationDate: externalExpirationDate,
  setExpirationDate: externalSetExpirationDate,
}: LazyTraineeListProps) => {
  const { admin } = useAdmin();

  // Use our custom hook for trainee lazy loading
  const {
    filteredTraineesCount,
    visibleTrainees,
    isLoading,
    hasMore,
    searchQuery: hookSearchQuery,
    setSearchQuery: hookSetSearchQuery,
    showOnlyExpired: hookShowOnlyExpired,
    setShowOnlyExpired: hookSetShowOnlyExpired,
    expirationDate: hookExpirationDate,
    setExpirationDate: hookSetExpirationDate,
    lastTraineeElementRef,
  } = useLazyTrainees({
    baseTrainees: [],
    baseId: admin?.baseId,
    itemsPerPage: 20,
  });

  // Use either external or hook state based on props
  const searchQuery =
    externalSearchQuery !== undefined ? externalSearchQuery : hookSearchQuery;
  const setSearchQuery = externalSetSearchQuery || hookSetSearchQuery;
  const showOnlyExpired =
    externalShowOnlyExpired !== undefined
      ? externalShowOnlyExpired
      : hookShowOnlyExpired;
  const expirationDate =
    externalExpirationDate !== undefined
      ? externalExpirationDate
      : hookExpirationDate;

  // Sync external state changes to hook state
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      hookSetSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery, hookSetSearchQuery]);

  useEffect(() => {
    if (externalShowOnlyExpired !== undefined) {
      hookSetShowOnlyExpired(externalShowOnlyExpired);
    }
  }, [externalShowOnlyExpired, hookSetShowOnlyExpired]);

  useEffect(() => {
    if (externalExpirationDate !== undefined) {
      hookSetExpirationDate(externalExpirationDate);
    }
  }, [externalExpirationDate, hookSetExpirationDate]);

  // Get medical status CSS class
  const getMedicalStatusClass = (trainee: Trainee) => {
    if (!trainee.medicalApproval.approved) {
      return "bg-red-100 border-red-300 text-red-800";
    }
    if (
      trainee.medicalApproval.expirationDate &&
      new Date(trainee.medicalApproval.expirationDate) < new Date()
    ) {
      return "bg-red-100 border-red-300 text-red-800";
    }
    return "bg-green-100 border-green-300 text-green-800";
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "לא קיים";
    try {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (error) {
      return "תאריך לא תקין";
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden h-[calc(100vh-250px)] flex flex-col">
      <div className="p-4 bg-muted font-medium border-b">
        <div className="flex justify-between items-center">
          <span>רשימת מתאמנים</span>
          <span className="text-sm text-muted-foreground">
            {filteredTraineesCount} מתאמנים
          </span>
        </div>
      </div>

      <div className="p-3 border-b bg-card/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder='חיפוש מתאמנים לפי מ"א או שם...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
      </div>

      <div className="overflow-y-auto flex-grow">
        {visibleTrainees.length > 0 ? (
          <ul className="divide-y">
            {visibleTrainees.map((trainee, index) => {
              // Reference for the last item
              const isLastItem = index === visibleTrainees.length - 1;

              return (
                <li
                  key={trainee._id}
                  ref={isLastItem ? lastTraineeElementRef : null}
                  onClick={() => onSelectTrainee(trainee)}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedTrainee?._id === trainee._id ? "bg-muted" : ""
                  }`}
                  data-testid={isLastItem ? "last-trainee-item" : undefined}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{trainee.fullName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {trainee.personalId}
                      </p>
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded-full border ${getMedicalStatusClass(
                        trainee
                      )}`}
                    >
                      {trainee.medicalApproval.approved
                        ? `תקף עד ${formatDate(
                            trainee.medicalApproval.expirationDate
                          )}`
                        : "לא תקף"}
                    </div>
                  </div>
                </li>
              );
            })}

            {/* Loading indicator at bottom */}
            {isLoading && (
              <li className="p-4" aria-label="טוען מתאמנים נוספים">
                <div className="flex flex-col space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </li>
            )}

            {/* Invisible sentinel element for intersection observer if we have more data */}
            {hasMore && !isLoading && (
              <li
                ref={lastTraineeElementRef}
                className="h-4 opacity-0"
                aria-hidden="true"
              />
            )}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            {isLoading ? (
              <div className="space-y-3 w-full max-w-xs">
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-48 mx-auto" />
                <div className="space-y-2 mt-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground mb-2">לא נמצאו מתאמנים</p>
                <p className="text-sm text-muted-foreground">
                  נסה לשנות את החיפוש או הסינון
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LazyTraineeList;
