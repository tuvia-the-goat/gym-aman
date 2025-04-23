import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { Trainee } from "../types";
import DashboardLayout from "../components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Filter, Calendar, X, Loader } from "lucide-react";
import TraineeProfile from "../components/TraineeProfile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, addMonths } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import LazyTraineeList from "../components/medical/LazyTraineeList";

const MedicalApprovals = () => {
  const navigate = useNavigate();
  const { admin, trainees, departments, setTrainees } = useAdmin();
  const { toast } = useToast();

  // State for UI
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [showOnlyExpired, setShowOnlyExpired] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  // Filter trainees by admin's base if admin is gymAdmin
  const baseFilteredTrainees = useMemo(
    () =>
      trainees.filter(
        (trainee) =>
          admin?.role === "generalAdmin" || trainee.baseId === admin?.baseId
      ),
    [admin, trainees]
  );

  // Clear all filters
  const clearFilters = () => {
    setShowOnlyExpired(false);
    setExpirationDate(null);
    setSearchQuery("");
  };

  // Handle trainee selection and update
  const handleTraineeSelect = (trainee: Trainee) => {
    setSelectedTrainee(trainee);
  };

  const handleTraineeUpdate = (updatedTrainee: Trainee) => {
    const updatedTrainees = trainees.map((t) =>
      t._id === updatedTrainee._id ? updatedTrainee : t
    );
    setTrainees(updatedTrainees);
    setSelectedTrainee(updatedTrainee);
  };

  return (
    <DashboardLayout activeTab="medical-approvals">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">ניהול אישורים רפואיים</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={expirationDate ? "default" : "outline"}
                className="w-full md:w-auto"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {expirationDate
                  ? `יפוג עד ${format(expirationDate, "dd/MM/yyyy")}`
                  : "סינון לפי תאריך פקיעה"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3">
                <h3 className="mb-2 font-medium text-right">בחר תאריך פקיעה</h3>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const oneMonth = addMonths(new Date(), 1);
                      setExpirationDate(oneMonth);
                    }}
                    className="justify-start"
                  >
                    יפוג תוך חודש
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const threeMonths = addMonths(new Date(), 3);
                      setExpirationDate(threeMonths);
                    }}
                    className="justify-start"
                  >
                    יפוג תוך 3 חודשים
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const sixMonths = addMonths(new Date(), 6);
                      setExpirationDate(sixMonths);
                    }}
                    className="justify-start"
                  >
                    יפוג תוך 6 חודשים
                  </Button>
                </div>
                <CalendarComponent
                  mode="single"
                  selected={expirationDate}
                  onSelect={setExpirationDate}
                  className="p-3 pointer-events-auto mt-2"
                />
                <div className="flex justify-between mt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setExpirationDate(undefined)}
                    size="sm"
                  >
                    נקה סינון
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant={showOnlyExpired ? "default" : "outline"}
            onClick={() => {
              setShowOnlyExpired(!showOnlyExpired);
              if (expirationDate) setExpirationDate(undefined);
            }}
            className="w-full md:w-auto"
          >
            <Filter className="mr-2 h-4 w-4" />
            {showOnlyExpired ? "הצג את כולם" : "הצג רק פגי תוקף"}
          </Button>

          {(showOnlyExpired || expirationDate || searchQuery) && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="w-full md:w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              נקה סינונים
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <LazyTraineeList
              trainees={baseFilteredTrainees}
              selectedTrainee={selectedTrainee}
              onSelectTrainee={handleTraineeSelect}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showOnlyExpired={showOnlyExpired}
              setShowOnlyExpired={setShowOnlyExpired}
              expirationDate={expirationDate}
              setExpirationDate={setExpirationDate}
            />
          </div>

          <div className="md:col-span-2">
            {isLoading ? (
              <div className="glass p-6 rounded-xl shadow-sm space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <Skeleton className="h-8 w-52" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </div>
            ) : selectedTrainee ? (
              <TraineeProfile
                trainee={selectedTrainee}
                departments={departments}
                onUpdate={handleTraineeUpdate}
                setIsLoading={setIsLoading}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center glass rounded-xl">
                <Calendar className="h-16 w-16 text-primary opacity-40 mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  ניהול אישורים רפואיים
                </h2>
                <p className="text-muted-foreground mb-4">
                  בחר מתאמן מהרשימה כדי לצפות ולעדכן את הפרטים הרפואיים שלו
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MedicalApprovals;
