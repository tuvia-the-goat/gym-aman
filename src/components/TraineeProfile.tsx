// src/components/TraineeProfile.tsx - Update to include subDepartment info

import React, { useState, useEffect } from "react";
import { Trainee, Department, MedicalFormScore, SubDepartment } from "../types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Edit2,
  Check,
  X,
  Loader,
  User,
  Phone,
  Building,
  Activity,
  Calendar as CalendarFull,
  Shield,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { format, parseISO, addYears } from "date-fns";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { traineeService } from "../services/api";
import { useAdmin } from "../context/AdminContext";

interface TraineeProfileProps {
  trainee: Trainee;
  departments: Department[];
  onUpdate: (updatedTrainee: Trainee) => void;
  readOnly?: boolean;
  setIsLoading?: (loading: boolean) => void;
}

const TraineeProfile: React.FC<TraineeProfileProps> = ({
  trainee,
  departments,
  onUpdate,
  readOnly = false,
  setIsLoading,
}) => {
  const { toast } = useToast();
  const { subDepartments } = useAdmin(); // Add this line
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [orthopedicCondition, setOrthopedicCondition] = useState(
    trainee.orthopedicCondition
  );
  const [medicalFormScore, setMedicalFormScore] = useState<MedicalFormScore>(
    trainee.medicalFormScore
  );
  const [medicalCertificateProvided, setMedicalCertificateProvided] = useState(
    trainee.medicalCertificateProvided || false
  );
  const [medicalLimitation, setMedicalLimitation] = useState(
    trainee.medicalLimitation || ""
  );

  // Reset form fields when trainee changes
  useEffect(() => {
    setOrthopedicCondition(trainee.orthopedicCondition);
    setMedicalFormScore(trainee.medicalFormScore);
    setMedicalCertificateProvided(trainee.medicalCertificateProvided || false);
    setMedicalLimitation(trainee.medicalLimitation || "");
    setIsEditing(false);
  }, [trainee]);

  // Medical approval calculation
  const shouldAutomaticallyApprove = (
    formScore: MedicalFormScore,
    certificateProvided: boolean
  ) => {
    return (
      formScore === "fullScore" ||
      formScore === "notRequired" ||
      formScore === "reserve" ||
      (formScore === "partialScore" && certificateProvided)
    );
  };

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find((dept) => dept._id === departmentId);
    return department ? department.name : "";
  };

  // Get subDepartment name
  const getSubDepartmentName = (subDepartmentId: string | undefined) => {
    if (!subDepartmentId) return "לא משויך";
    const subDepartment = subDepartments.find(
      (subDept) => subDept._id === subDepartmentId
    );
    return subDepartment ? subDepartment.name : "לא ידוע";
  };

  const getPhoneNumberFormat = (phoneNumberToFormat: string) => {
    return `${phoneNumberToFormat.slice(0, 3)}-${phoneNumberToFormat.slice(
      3,
      10
    )}`;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset form fields to original values
    setOrthopedicCondition(trainee.orthopedicCondition);
    setMedicalFormScore(trainee.medicalFormScore);
    setMedicalCertificateProvided(trainee.medicalCertificateProvided || false);
    setMedicalLimitation(trainee.medicalLimitation || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (setIsLoading) setIsLoading(true);

      // Determine if medical approval should be granted automatically
      const approved = shouldAutomaticallyApprove(
        medicalFormScore,
        medicalCertificateProvided
      );

      // Calculate expiration date (1 year from now if approved)
      const expirationDate = approved
        ? addYears(new Date(), 1).toISOString().split("T")[0]
        : null;

      // Update medical approval
      const updatedTrainee = await traineeService.updateMedicalApproval(
        trainee._id,
        {
          approved,
          expirationDate,
          medicalFormScore,
          medicalCertificateProvided:
            medicalFormScore === "partialScore"
              ? medicalCertificateProvided
              : undefined,
          medicalLimitation,
          orthopedicCondition,
        }
      );

      onUpdate(updatedTrainee);

      toast({
        title: "עדכון הצליח",
        description: "פרטי המתאמן עודכנו בהצלחה",
      });

      setIsEditing(false);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת עדכון הפרטים",
        variant: "destructive",
      });
      console.error("Update error:", error);
    } finally {
      setIsSaving(false);
      if (setIsLoading) setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "תאריך לא תקין";
    }
  };

  const hasExpiredMedicalApproval =
    !trainee.medicalApproval.approved ||
    (trainee.medicalApproval.expirationDate &&
      new Date(trainee.medicalApproval.expirationDate) < new Date());

  return (
    <div className="glass p-6 rounded-xl border border-border/30 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="bg-primary/10 p-2 rounded-full ml-3">
            <User className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">{trainee.fullName}</h2>
        </div>
        {!readOnly && (
          <div>
            {isEditing ? (
              <div className="flex space-x-2">
                <Button
                  onClick={handleSave}
                  size="sm"
                  variant="default"
                  className="flex items-center ml-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader className="h-4 w-4 ml-1 animate-spin" />
                      שומר...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 ml-1" />
                      שמור
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  size="sm"
                  variant="outline"
                  className="flex items-center"
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 ml-1" />
                  בטל
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleEdit}
                size="sm"
                variant="outline"
                className="flex items-center"
              >
                <Edit2 className="h-4 w-4 ml-1" />
                ערוך פרופיל
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-card/50 p-3 rounded-lg flex items-center border border-border/30">
            <FileText className="h-5 w-5 text-muted-foreground ml-3" />
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">
                מספר אישי
              </h3>
              <p className="font-medium">{trainee.personalId}</p>
            </div>
          </div>

          <div className="bg-card/50 p-3 rounded-lg flex items-center border border-border/30">
            <Activity className="h-5 w-5 text-muted-foreground ml-3" />
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">
                פרופיל רפואי
              </h3>
              <p className="font-medium">{trainee.medicalProfile}</p>
            </div>
          </div>

          <div className="bg-card/50 p-3 rounded-lg flex items-center border border-border/30">
            <Building className="h-5 w-5 text-muted-foreground ml-3" />
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">
                מסגרת
              </h3>
              <p className="font-medium">
                {getDepartmentName(trainee.departmentId)}
              </p>
            </div>
          </div>

          {/* Add SubDepartment info */}
          <div className="bg-card/50 p-3 rounded-lg flex items-center border border-border/30">
            <Layers className="h-5 w-5 text-muted-foreground ml-3" />
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">
                תת-מסגרת
              </h3>
              <p className="font-medium">
                {getSubDepartmentName(trainee.subDepartmentId)}
              </p>
            </div>
          </div>

          <div className="bg-card/50 p-3 rounded-lg flex items-center border border-border/30">
            <Phone className="h-5 w-5 text-muted-foreground ml-3" />
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">
                טלפון
              </h3>
              <p className="font-medium direction-ltr">
                {getPhoneNumberFormat(trainee.phoneNumber)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card/50 p-3 rounded-lg flex items-center border border-border/30">
            <User className="h-5 w-5 text-muted-foreground ml-3" />
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">מין</h3>
              <p className="font-medium">
                {trainee.gender === "male" ? "זכר" : "נקבה"}
              </p>
            </div>
          </div>

          <div className="bg-card/50 p-3 rounded-lg flex items-center border border-border/30">
            <CalendarFull className="h-5 w-5 text-muted-foreground ml-3" />
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">
                תאריך לידה
              </h3>
              <p className="font-medium">{formatDate(trainee.birthDate)}</p>
            </div>
          </div>

          <div
            className={`bg-card/50 p-3 rounded-lg flex items-center border ${
              hasExpiredMedicalApproval
                ? "border-destructive/30"
                : "border-green-500/30"
            }`}
          >
            <div
              className={`shrink-0 ml-3 ${
                hasExpiredMedicalApproval
                  ? "text-destructive"
                  : "text-green-600"
              }`}
            >
              {hasExpiredMedicalApproval ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <Shield className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">
                סטטוס אישור רפואי
              </h3>
              <div
                className={`flex items-center ${
                  hasExpiredMedicalApproval
                    ? "text-destructive"
                    : "text-green-600"
                }`}
              >
                <p className="font-medium">
                  {trainee.medicalApproval.approved
                    ? trainee.medicalApproval.expirationDate
                      ? `בתוקף עד ${formatDate(
                          trainee.medicalApproval.expirationDate
                        )}`
                      : "בתוקף"
                    : "לא בתוקף"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border mt-6 pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 ml-2 text-primary" />
          פרטים רפואיים
        </h3>

        <div className="space-y-6">
          {/* Orthopedic Condition */}
          <div className="bg-card/50 p-4 rounded-lg border border-border/30">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              סעיף פרופיל אורטופדי
            </h4>
            {isEditing ? (
              <div className="flex items-center">
                <input
                  id="orthopedicCondition"
                  type="checkbox"
                  checked={orthopedicCondition}
                  onChange={(e) => setOrthopedicCondition(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ml-2"
                  disabled={isSaving}
                />
                <label
                  htmlFor="orthopedicCondition"
                  className="text-sm font-medium"
                >
                  {orthopedicCondition ? "כן" : "לא"}
                </label>
              </div>
            ) : (
              <div className="flex items-center">
                {orthopedicCondition ? (
                  <CheckCircle2 className="h-5 w-5 text-primary ml-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground ml-2" />
                )}
                <p className="font-medium">
                  {orthopedicCondition ? "כן" : "לא"}
                </p>
              </div>
            )}
          </div>

          {/* Medical Form Score */}
          <div className="bg-card/50 p-4 rounded-lg border border-border/30">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              ציון שאלון א"ס
            </h4>
            {isEditing ? (
              <select
                value={medicalFormScore}
                onChange={(e) =>
                  setMedicalFormScore(e.target.value as MedicalFormScore)
                }
                className="input-field w-full px-3 py-2 rounded-md border border-input"
                disabled={isSaving}
              >
                <option value="notRequired">לא נזקק/ה למילוי שאלון</option>
                <option value="fullScore">100 נקודות</option>
                <option value="partialScore">פחות מ-100 נקודות</option>
                <option value="reserve">מיל' או אע"צ, מילא/ה שאלון נפרד</option>
              </select>
            ) : (
              <p className="font-medium">
                {getMedicalFormScoreText(trainee.medicalFormScore)}
              </p>
            )}
          </div>

          {/* Medical Certificate */}
          {(isEditing && medicalFormScore === "partialScore") ||
          (!isEditing && trainee.medicalFormScore === "partialScore") ? (
            <div className="bg-card/50 p-4 rounded-lg border border-border/30">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                הוצג אישור רפואי
              </h4>
              {isEditing ? (
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="flex items-center ml-4">
                    <input
                      type="radio"
                      id="certificateYes"
                      name="medicalCertificate"
                      checked={medicalCertificateProvided}
                      onChange={() => setMedicalCertificateProvided(true)}
                      className="ml-2"
                      disabled={isSaving}
                    />
                    <label htmlFor="certificateYes" className="text-sm">
                      כן
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="certificateNo"
                      name="medicalCertificate"
                      checked={!medicalCertificateProvided}
                      onChange={() => setMedicalCertificateProvided(false)}
                      className="ml-2"
                      disabled={isSaving}
                    />
                    <label htmlFor="certificateNo" className="text-sm">
                      לא
                    </label>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  {trainee.medicalCertificateProvided ? (
                    <CheckCircle2 className="h-5 w-5 text-primary ml-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground ml-2" />
                  )}
                  <p className="font-medium">
                    {trainee.medicalCertificateProvided ? "כן" : "לא"}
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {/* Medical Limitation */}
          <div className="bg-card/50 p-4 rounded-lg border border-border/30">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              מגבלה רפואית
            </h4>
            {isEditing ? (
              <Textarea
                value={medicalLimitation}
                onChange={(e) => setMedicalLimitation(e.target.value)}
                className="min-h-[80px] border border-input"
                placeholder="הזן מגבלות רפואיות אם קיימות"
                disabled={isSaving}
              />
            ) : (
              <p className="font-medium">
                {trainee.medicalLimitation || "אין"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get MedicalFormScore text
function getMedicalFormScoreText(score: MedicalFormScore): string {
  switch (score) {
    case "notRequired":
      return "לא נזקק/ה למילוי שאלון";
    case "fullScore":
      return "100 נקודות";
    case "partialScore":
      return "פחות מ-100 נקודות";
    case "reserve":
      return "מיל' או אע\"צ, מילא/ה שאלון נפרד";
    default:
      return "";
  }
}

export default TraineeProfile;