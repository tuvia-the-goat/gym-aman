
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, UserCheck, AlertTriangle } from "lucide-react";
import { traineeService, entryService } from '../services/api';
import { useToast } from '@/components/ui/use-toast';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trainee } from '@/types';

const Registration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [personalId, setPersonalId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [trainee, setTrainee] = useState<Trainee | null>(null);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!personalId || personalId.length < 7) {
      setErrorMessage("יש להזין מספר אישי תקין (לפחות 7 ספרות)");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      // Find trainee by personal ID
      const foundTrainee = await traineeService.getByPersonalId(personalId);
      setTrainee(foundTrainee);
      
      // Check if trainee has valid medical approval
      if (!foundTrainee.medicalApproval.approved) {
        setErrorMessage("אין למתאמן אישור רפואי תקף. כניסה אסורה.");
        return;
      }
      
      // Create entry if trainee exists and has valid medical approval
      await createEntry(foundTrainee);
      
    } catch (error: any) {
      console.error("Error finding trainee:", error);
      setErrorMessage("מתאמן לא נמצא במערכת. נא לפנות למנהל המכון.");
      setTrainee(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const createEntry = async (trainee: Trainee) => {
    try {
      const today = new Date();
      const entryData = {
        traineeId: trainee._id,
        entryDate: today.toISOString().split('T')[0],
        entryTime: today.toTimeString().split(' ')[0],
        traineeFullName: trainee.fullName,
        traineePersonalId: trainee.personalId,
        departmentId: trainee.departmentId,
        baseId: trainee.baseId
      };
      
      await entryService.create(entryData);
      
      toast({
        title: "כניסה נרשמה בהצלחה",
        description: `${trainee.fullName}, כניסתך נרשמה בהצלחה`,
      });
      
      // Reset the form
      setPersonalId("");
      setTrainee(null);
      
    } catch (error: any) {
      console.error("Error creating entry:", error);
      toast({
        title: "שגיאה ברישום כניסה",
        description: error.response?.data?.message || "אירעה שגיאה בעת רישום הכניסה",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center py-6 px-8 bg-background border-b">
        <h1 className="text-lg font-semibold">מערכת כניסה למכון</h1>
        <Button variant="ghost" asChild>
          <Link to="/login" className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            <span>למסך התחברות</span>
          </Link>
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md bg-background rounded-lg border p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-center">רישום כניסה למכון</h2>
          
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="personalId" className="block text-sm font-medium text-right">
                מספר אישי
              </label>
              <Input
                id="personalId"
                type="text"
                value={personalId}
                onChange={(e) => setPersonalId(e.target.value)}
                placeholder="הכנס מספר אישי"
                className="text-right"
                disabled={isLoading}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "מחפש..." : "רישום כניסה"}
            </Button>
          </form>
          
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          
          {trainee && !errorMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
              <UserCheck className="h-5 w-5 flex-shrink-0" />
              <span>ברוך הבא, {trainee.fullName}!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Registration;
