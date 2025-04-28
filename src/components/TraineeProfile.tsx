// src/components/TraineeProfile.tsx - Update to include subDepartment info

import React, { useState, useEffect } from "react";
import { Trainee, Department, MedicalFormScore, SubDepartment, Base } from "../types";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { he } from "date-fns/locale";

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
  const { subDepartments, bases, admin } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMedicalApproval, setShowMedicalApproval] = useState(false);

  // Form fields
  const [personalId, setPersonalId] = useState("");
  const [personalIdError, setPersonalIdError] = useState("");
  const [fullName, setFullName] = useState(trainee.fullName);
  const [medicalProfile, setMedicalProfile] = useState(trainee.medicalProfile);
  const [departmentId, setDepartmentId] = useState(trainee.departmentId);
  const [subDepartmentId, setSubDepartmentId] = useState(trainee.subDepartmentId);
  const [baseId, setBaseId] = useState(trainee.baseId);
  const [gender, setGender] = useState(trainee.gender);
  const [birthDate, setBirthDate] = useState(trainee.birthDate ? parseISO(trainee.birthDate) : undefined);
  const [orthopedicCondition, setOrthopedicCondition] = useState(trainee.orthopedicCondition);
  const [medicalFormScore, setMedicalFormScore] = useState<MedicalFormScore>(trainee.medicalFormScore);
  const [medicalCertificateProvided, setMedicalCertificateProvided] = useState(trainee.medicalCertificateProvided || false);
  const [medicalLimitation, setMedicalLimitation] = useState(trainee.medicalLimitation || "");
  const [medicalApprovalExpiration, setMedicalApprovalExpiration] = useState<Date | undefined>(
    trainee.medicalApproval.expirationDate ? parseISO(trainee.medicalApproval.expirationDate) : undefined
  );

  // Reset form fields when trainee changes
  useEffect(() => {
    setPersonalId(trainee.personalId);
    setFullName(trainee.fullName);
    setMedicalProfile(trainee.medicalProfile);
    setDepartmentId(trainee.departmentId);
    setSubDepartmentId(trainee.subDepartmentId);
    setBaseId(trainee.baseId);
    setGender(trainee.gender);
    setBirthDate(trainee.birthDate ? parseISO(trainee.birthDate) : undefined);
    setOrthopedicCondition(trainee.orthopedicCondition);
    setMedicalFormScore(trainee.medicalFormScore);
    setMedicalCertificateProvided(trainee.medicalCertificateProvided || false);
    setMedicalLimitation(trainee.medicalLimitation || "");
    setMedicalApprovalExpiration(trainee.medicalApproval.expirationDate ? parseISO(trainee.medicalApproval.expirationDate) : undefined);
    setIsEditing(false);
  }, [trainee]);

  const customStyles = `
  .react-datepicker {
    font-family: 'Heebo', sans-serif;
    font-weight: 600;
    color:rgb(0, 0, 0);
  }
  
  .react-datepicker__header {
    background-color:rgb(229, 240, 247);
  }
  
  .react-datepicker__day--selected {
    background-color: #3b82f6; /* Blue color for selected date */
    color: white;
  }
  
  .react-datepicker__day:hover {
    background-color: #dbeafe;
  }
  
  .react-datepicker__day-name, 
  .react-datepicker__day, 
  .react-datepicker__time-name {
    color: #1f2937; /* Dark text for better readability */
  }
  
  .react-datepicker__year-dropdown {
    font-family: 'Heebo', sans-serif;
    background-color: white;
    color: black;
    font-weight: 2000;
  }
  
  .react-datepicker__year-option:hover {
    background-color: #dbeafe;
  }
`;

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
    if (!subDepartmentId || subDepartmentId === "none") return "לא משויך";
    const subDepartment = subDepartments.find(
      (subDept) => subDept._id === subDepartmentId
    );
    return subDepartment ? subDepartment.name : "לא ידוע";
  };

  const getBaseName = (baseId: string) => {
    if (!bases) return "לא ידוע";
    const base = bases.find((base) => base._id === baseId);
    return base ? base.name : "לא ידוע";
  };

  const getPhoneNumberFormat = (phoneNumberToFormat: string) => {
    return `${phoneNumberToFormat.slice(0, 3)}-${phoneNumberToFormat.slice(
      3,
      10
    )}`;
  };

  const handleEdit = () => {
    setShowMedicalApproval(false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset all form fields to original values
    setPersonalId(trainee.personalId);
    setFullName(trainee.fullName);
    setShowMedicalApproval(false);
    setMedicalProfile(trainee.medicalProfile);
    setDepartmentId(trainee.departmentId);
    setSubDepartmentId(trainee.subDepartmentId);
    setBaseId(trainee.baseId);
    setGender(trainee.gender);
    setBirthDate(trainee.birthDate ? parseISO(trainee.birthDate) : undefined);
    setOrthopedicCondition(trainee.orthopedicCondition);
    setMedicalFormScore(trainee.medicalFormScore);
    setMedicalCertificateProvided(trainee.medicalCertificateProvided || false);
    setMedicalLimitation(trainee.medicalLimitation || "");
    setMedicalApprovalExpiration(trainee.medicalApproval.expirationDate ? parseISO(trainee.medicalApproval.expirationDate) : undefined);
    setIsEditing(false);
  };

  const handlePersonalIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 7 digits
    if (/^\d*$/.test(value) && value.length <= 7) {
      setPersonalId(value);
      if (value.length !== 7) {
        setPersonalIdError("מספר אישי חייב להיות בדיוק 7 ספרות");
      } else {
        setPersonalIdError("");
      }
    }
  };

  const handleSave = async () => {
    setShowMedicalApproval(false);

    if (personalId.length !== 7) {
      setPersonalIdError("מספר אישי חייב להיות בדיוק 7 ספרות");
      return;
    }

    // Validate required fields
    if (!baseId) {
      toast({
        title: "שגיאה",
        description: "חובה לבחור בסיס",
        variant: "destructive",
      });
      return;
    }

    if (!departmentId) {
      toast({
        title: "שגיאה",
        description: "חובה לבחור מסגרת",
        variant: "destructive",
      });
      return;
    }

    if (!medicalApprovalExpiration) {
      toast({
        title: "שגיאה",
        description: "חובה לבחור תאריך לתפוקת אישור רפואי",
        variant: "destructive",
      });
      return;
    }

    if (!subDepartmentId || subDepartmentId === "none") {
      toast({
        title: "שגיאה",
        description: "חובה לבחור תת-מסגרת",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      setIsLoading?.(true);

      // Determine if medical approval should be granted automatically
      const approved = shouldAutomaticallyApprove(
        medicalFormScore,
        medicalCertificateProvided
      );
      // Use selected expiration date or calculate one year from now if approved
      const expirationDate = medicalApprovalExpiration 
      ? medicalApprovalExpiration.toISOString().split("T")[0]
      : (approved ? addYears(new Date(), 1).toISOString().split("T")[0] : null);
      
      // Prepare the update data
      const updateData = {
        personalId,
        fullName,
        medicalProfile: medicalProfile as "97" | "82" | "72" | "64" | "45" | "25",
        departmentId,
        subDepartmentId,
        baseId: baseId || trainee.baseId,
        gender: gender as "male" | "female",
        birthDate: birthDate?.toISOString().split("T")[0],
        orthopedicCondition,
        medicalFormScore,
        medicalCertificateProvided: medicalFormScore === "partialScore" ? medicalCertificateProvided : undefined,
        medicalLimitation,
        medicalApproval: {
          approved,
          expirationDate: medicalApprovalExpiration && approved ? medicalApprovalExpiration.toISOString().split("T")[0] : null
        }
      };

      // Update all trainee details
      console.log('updateData', updateData);
      const updatedTrainee = await traineeService.updateProfile(trainee._id, updateData);

      onUpdate(updatedTrainee);

      toast({
        title: "עדכון הצלח",
        description: "פרטי המתאמן עודכנו בהצלחה",
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Update error details:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת עדכון הפרטים",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setIsLoading?.(false);
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
                  onClick={handleCancel}
                  size="sm"
                  variant="outline"
                  className="flex items-center ml-2"
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 ml-1" />
                  בטל
                </Button>
                <Button
                  onClick={handleSave}
                  size="sm"
                  variant="default"
                  className="flex items-center"
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
        {isEditing ? (
          <div className="col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">מספר אישי</label>
                  <Input
                    value={personalId}
                    onChange={handlePersonalIdChange}
                    disabled={isSaving}
                    className={personalIdError ? "border-red-500" : ""}
                  />
                  {personalIdError && (
                    <p className="text-red-500 text-sm mt-1">{personalIdError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">שם מלא</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">מין</label>
                  <Select
                    value={gender}
                    onValueChange={(value) => setGender(value as 'male' | 'female')}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="בחר מין" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male" className="flex justify-end">זכר</SelectItem>
                      <SelectItem value="female" className="flex justify-end">נקבה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">תאריך לידה</label>
                    <style>{customStyles}</style>
                    <DatePicker
                      selected={birthDate}
                      onChange={(date: Date) => setBirthDate(date)}
                      dateFormat="dd/MM/yyyy"
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={80}
                      placeholderText="dd/mm/yyyy"
                      maxDate={new Date()}
                      minDate={new Date('1940-01-01')}
                      locale={he}
                      showPopperArrow={false}
                      className="input-field text-black text-sm font-[300] w-full"
                      popperPlacement="top-end"
                      popperClassName="rtl-datepicker"
                      id="birthDate"
                      calendarClassName="font-medium text-black"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {admin?.role === 'generalAdmin' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">בסיס</label>
                    <Select
                      value={baseId || trainee.baseId}
                      onValueChange={(value) => {
                        console.log('Base selected:', value);
                        setBaseId(value);
                        setDepartmentId(""); // Reset department when base changes
                        setSubDepartmentId("none"); // Reset sub-department when base changes
                      }}
                      disabled={isSaving}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="בחר בסיס" />
                      </SelectTrigger>
                      <SelectContent>
                        {bases?.map((base) => (
                          <SelectItem key={base._id} value={base._id} className="flex justify-end">
                            {base.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">מסגרת</label>
                  <Select
                    value={departmentId}
                    onValueChange={(value) => {
                      setDepartmentId(value);
                      setSubDepartmentId("none"); // Reset sub-department when department changes
                    }}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="בחר מסגרת" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments
                        .filter((dept) => dept.baseId === baseId)
                        .map((dept) => (
                          <SelectItem key={dept._id} value={dept._id} className="flex justify-end">
                            {dept.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">תת-מסגרת</label>
                  <Select
                    value={subDepartmentId}
                    onValueChange={setSubDepartmentId}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="בחר תת-מסגרת" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="flex justify-end">לא משויך</SelectItem>
                      {subDepartments
                        .filter((subDept) => subDept.departmentId === departmentId)
                        .map((subDept) => (
                          <SelectItem key={subDept._id} value={subDept._id} className="flex justify-end">
                            {subDept.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
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

            </div>

            <div className="space-y-4">
              <div className="bg-card/50 p-3 rounded-lg flex items-center border border-border/30">
                <Building className="h-5 w-5 text-muted-foreground ml-3" />
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground">
                    בסיס
                  </h3>
                  <p className="font-medium">
                    {getBaseName(trainee.baseId)}
                  </p>
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
            </div>
          </>
        )}
      </div>

      <div className="border-t border-border mt-6 pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 ml-2 text-primary" />
          פרטים רפואיים
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isEditing ? (
              <div className="bg-card/50 p-4 rounded-lg border border-border/30">
<h3 className="text-xs font-medium text-muted-foreground">
                    פרופיל רפואי
                  </h3>                <Select
                  value={medicalProfile}
                  onValueChange={setMedicalProfile}
                  disabled={isSaving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="בחר פרופיל רפואי" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="97" className="flex justify-end">97</SelectItem>
                    <SelectItem value="82" className="flex justify-end">82</SelectItem>
                    <SelectItem value="72" className="flex justify-end">72</SelectItem>
                    <SelectItem value="64" className="flex justify-end">64</SelectItem>
                    <SelectItem value="45" className="flex justify-end">45</SelectItem>
                    <SelectItem value="25" className="flex justify-end">25</SelectItem>
                  </SelectContent>
                </Select>
              </div>)
        : (<div className="bg-card/50 p-3 rounded-lg flex items-center border border-border/30">
                <Activity className="h-5 w-5 text-muted-foreground ml-3" />
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground">
                    פרופיל רפואי
                  </h3>
                  <p className="font-medium">{trainee.medicalProfile}</p>
                </div>
              </div>)}
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
          <div className={medicalFormScore === "partialScore" ? "bg-card/50 p-4 rounded-lg border border-border/30" : "col-span-2 bg-card/50 p-4 rounded-lg border border-border/30"}>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              ציון שאלון א"ס
            </h4>
            {isEditing ? (
              <div className="space-y-2">
                <Select
                  value={medicalFormScore}
                  onValueChange={(value) => setMedicalFormScore(value as MedicalFormScore)}
                  disabled={isSaving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="בחר ציון" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notRequired" className="flex justify-end">לא נזקק/ה למילוי שאלון</SelectItem>
                    <SelectItem value="fullScore" className="flex justify-end">100 נקודות</SelectItem>
                    <SelectItem value="partialScore" className="flex justify-end">פחות מ-100 נקודות</SelectItem>
                    <SelectItem value="reserve" className="flex justify-end">מיל' או אע"צ, מילא/ה שאלון נפרד</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
          <div className={isEditing && medicalFormScore === "partialScore" && !medicalCertificateProvided ? "col-span-2 bg-card/50 p-4 rounded-lg border border-border/30" : "bg-card/50 p-4 rounded-lg border border-border/30"}>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              מגבלה רפואית
            </h4>
            {isEditing ? (
              <>
              <Textarea
                value={medicalLimitation}
                onChange={(e) => setMedicalLimitation(e.target.value)}
                className="min-h-[80px] border border-input mb-2"
                placeholder="הזן מגבלות רפואיות אם קיימות"
                disabled={isSaving}
                />
            <p className="text-xs text-muted-foreground mb-1">
            <span className="text-red-500">*</span> מידע רפואי הרלוונטי לפעילות הגופנית בלבד (סכרת, אסטמה, יתר לחץ דם...)
          </p>
                </>
            ) : (
              <p className="font-medium">
                {trainee.medicalLimitation || "אין"}
              </p>
            )}
          </div>

          {/* Medical Approval Expiration Date */}
          {isEditing && (medicalFormScore !== "partialScore" || medicalCertificateProvided) && (
            <div className="bg-card/50 p-4 rounded-lg border border-border/30 flex flex-col gap-2 justify-center">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                תאריך פקיעת האישור הרפואי
              </h4>
              <div className="flex flex-col md:flex-row gap-2">
                {!showMedicalApproval ? (
                  <div className="w-full h-24 bg-black/50 rounded-lg flex items-center justify-center text-center cursor-pointer" onClick={() => setShowMedicalApproval(true)}>
                    <p className="text-white p-4">לחץ כדי לערוך את פרטי האישור הרפואי</p>
                  </div>
                ) : (
                  <>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full md:w-[240px] justify-start text-left font-normal"
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {medicalApprovalExpiration ? (
                            format(medicalApprovalExpiration, "dd/MM/yyyy")
                          ) : (
                            <span>בחר תאריך</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={medicalApprovalExpiration}
                          onSelect={setMedicalApprovalExpiration}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Button
                      variant="outline"
                      onClick={() => setMedicalApprovalExpiration(addYears(new Date(), 1))}
                      className="w-full md:w-auto"
                    >
                      שנה מהיום
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

              {!isEditing && (
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
                  <div className="flex-1">
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
              )}
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