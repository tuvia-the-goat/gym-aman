
import React, { useState } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from '@/components/ui/use-toast';
import { useAdmin } from '../context/AdminContext';
import { cn } from '@/lib/utils';
import { traineeService } from '../services/api';

// UI components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// Define form schema
const formSchema = z.object({
  fullName: z.string().min(2, "חייב להכיל לפחות 2 תווים"),
  personalId: z.string().min(7, "חייב להכיל לפחות 7 מספרים"),
  phoneNumber: z.string().min(10, "מספר טלפון לא תקין"),
  departmentId: z.string().min(1, "יש לבחור מחלקה"),
  baseId: z.string().min(1, "יש לבחור בסיס"),
  medicalProfile: z.string().min(1, "יש לבחור פרופיל"),
  gender: z.enum(["male", "female"]),
  birthDate: z.date(),
  profileSection: z.enum(["orthopedic", "otherMedical", "notSharing", "notApplicable"]).default("notApplicable"),
  physicalQuestionnaireScore: z.enum(["100", "below100", "notNeeded", "otherQuestionnaire"]),
  doctorApprovalPresented: z.boolean().optional(),
  medicalLimitation: z.string().optional(),
});

type TraineeRegistrationFormData = z.infer<typeof formSchema>;

const TraineeRegistration = () => {
  const { admin, departments, bases, trainees, setTrainees } = useAdmin();
  const { toast } = useToast();
  
  // Form initialization
  const form = useForm<TraineeRegistrationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      personalId: "",
      phoneNumber: "",
      departmentId: "",
      baseId: admin?.role === "gymAdmin" ? admin.baseId : "",
      medicalProfile: "97",
      gender: "male",
      birthDate: new Date(),
      profileSection: "notApplicable",
      physicalQuestionnaireScore: "100",
      doctorApprovalPresented: false,
      medicalLimitation: "",
    },
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle selected profile to determine if profileSection should be displayed
  const watchedProfile = form.watch("medicalProfile");
  const watchedQuestionnaire = form.watch("physicalQuestionnaireScore");

  // Filter departments by base if the admin is a gym admin
  const availableDepartments = departments.filter(
    (dept) => 
      admin?.role === "generalAdmin" || 
      dept.baseId === (form.getValues().baseId || admin?.baseId)
  );

  // Handle form submission
  const onSubmit = async (data: TraineeRegistrationFormData) => {
    setIsLoading(true);

    try {
      const traineeData = {
        personalId: data.personalId,
        fullName: data.fullName,
        medicalProfile: data.medicalProfile as "97" | "82" | "72" | "64" | "45" | "25",
        departmentId: data.departmentId,
        phoneNumber: data.phoneNumber,
        baseId: data.baseId,
        gender: data.gender,
        birthDate: data.birthDate.toISOString(),
        profileSection: data.medicalProfile === "97" ? "notApplicable" : data.profileSection,
        physicalQuestionnaireScore: data.physicalQuestionnaireScore,
        doctorApprovalPresented: data.physicalQuestionnaireScore === "below100" ? data.doctorApprovalPresented : undefined,
        medicalLimitation: data.medicalLimitation
      };
      
      const newTrainee = await traineeService.create(traineeData);
      
      // Update trainees state
      setTrainees([...trainees, newTrainee]);
      
      toast({
        title: "הרשמה בוצעה בהצלחה",
        description: "המתאמן נרשם בהצלחה למערכת",
      });
      
      // Reset form
      form.reset();
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "שגיאה בהרשמה",
        description: error.response?.data?.message || "אירעה שגיאה בעת ההרשמה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // On base change, reset department selection
  const handleBaseChange = (baseId: string) => {
    form.setValue("baseId", baseId);
    form.setValue("departmentId", "");
  };

  // On profile change, reset profile section if 97
  const handleProfileChange = (profile: string) => {
    form.setValue("medicalProfile", profile);
    if (profile === "97") {
      form.setValue("profileSection", "notApplicable");
    }
  };

  return (
    <div className="bg-card shadow-sm rounded-lg border p-6">
      <h3 className="font-semibold text-lg mb-4 text-right">הרשמת מתאמן חדש</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">שם מלא</FormLabel>
                <FormControl>
                  <Input placeholder="שם מלא" {...field} className="text-right" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="personalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">מספר אישי</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="מספר אישי" {...field} className="text-right" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">מספר טלפון</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="מספר טלפון" {...field} className="text-right" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Gender field */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">מין</FormLabel>
                <FormControl>
                  <RadioGroup 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    className="flex gap-4 justify-end"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="male" id="male" />
                      <label htmlFor="male">זכר</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="female" id="female" />
                      <label htmlFor="female">נקבה</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Birth Date field */}
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-right block">תאריך לידה</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-right justify-start font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>בחר תאריך</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1950-01-01")
                      }
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Base selection */}
          <FormField
            control={form.control}
            name="baseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">בסיס</FormLabel>
                <Select
                  onValueChange={(value) => handleBaseChange(value)}
                  defaultValue={field.value}
                  value={field.value}
                  disabled={admin?.role === "gymAdmin"}
                >
                  <FormControl>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="בחר בסיס" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bases.map((base) => (
                      <SelectItem key={base._id} value={base._id}>
                        {base.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Department selection */}
          <FormField
            control={form.control}
            name="departmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">מחלקה</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="בחר מחלקה" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableDepartments.map((dept) => (
                      <SelectItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Medical profile */}
          <FormField
            control={form.control}
            name="medicalProfile"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">פרופיל רפואי</FormLabel>
                <Select 
                  onValueChange={(value) => handleProfileChange(value)}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="בחר פרופיל" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="97">97</SelectItem>
                    <SelectItem value="82">82</SelectItem>
                    <SelectItem value="72">72</SelectItem>
                    <SelectItem value="64">64</SelectItem>
                    <SelectItem value="45">45</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Profile section (only if profile != 97) */}
          {watchedProfile !== "97" && (
            <FormField
              control={form.control}
              name="profileSection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right block">סעיף הפרופיל</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="בחר סעיף" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="orthopedic">אורטופדי</SelectItem>
                      <SelectItem value="otherMedical">רפואי אחר</SelectItem>
                      <SelectItem value="notSharing">לא מעוניין לשתף</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* Physical Questionnaire Score */}
          <FormField
            control={form.control}
            name="physicalQuestionnaireScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">ציון שאלון א"ס</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="בחר ציון" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="below100">ציון מתחת ל-100</SelectItem>
                    <SelectItem value="notNeeded">לא זקוק למילוי</SelectItem>
                    <SelectItem value="otherQuestionnaire">נדרש למלא שאלון אחר (מילואים או אע"צ)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Doctor Approval Presented (only if questionnaire score is below100) */}
          {watchedQuestionnaire === "below100" && (
            <FormField
              control={form.control}
              name="doctorApprovalPresented"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right block">האם הוצג אישור רופא?</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={(value) => field.onChange(value === "true")}
                      value={field.value ? "true" : "false"}
                      className="flex gap-4 justify-end"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="true" id="doctorApprovalYes" />
                        <label htmlFor="doctorApprovalYes">כן</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="false" id="doctorApprovalNo" />
                        <label htmlFor="doctorApprovalNo">לא</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* Medical Limitation (optional) */}
          <FormField
            control={form.control}
            name="medicalLimitation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-right block">מגבלה רפואית (לא חובה)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="פירוט המגבלה הרפואית" 
                    className="text-right" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "מתבצעת הרשמה..." : "הרשם"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default TraineeRegistration;
