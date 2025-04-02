
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { traineeService } from '../services/api';
import { useToast } from '@/components/ui/use-toast';
import { useAdmin } from '../context/AdminContext';
import { cn } from '@/lib/utils';

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
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

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
});

type RegistrationFormData = z.infer<typeof formSchema>;

const Registration = () => {
  const { admin, departments, bases } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form initialization
  const form = useForm<RegistrationFormData>({
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
    },
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle selected profile to determine if profileSection should be displayed
  const watchedProfile = form.watch("medicalProfile");

  // Filter departments by base if the admin is a gym admin
  const availableDepartments = departments.filter(
    (dept) => 
      admin?.role === "generalAdmin" || 
      dept.baseId === (form.getValues().baseId || admin?.baseId)
  );

  // Handle form submission
  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);

    try {
      const traineeData = {
        ...data,
        profileSection: data.medicalProfile === "97" ? "notApplicable" : data.profileSection,
        // Include birthDate in ISO format
        birthDate: data.birthDate.toISOString(),
      };
      
      await traineeService.register(traineeData);
      
      toast({
        title: "הרשמה בוצעה בהצלחה",
        description: "המתאמן נרשם בהצלחה למערכת",
      });
      
      navigate("/dashboard");
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
    <div className="flex min-h-screen flex-col bg-muted/40">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center py-6 px-8 bg-background border-b">
        <h1 className="text-lg font-semibold">הרשמת מתאמן חדש</h1>
        <Button variant="ghost" asChild>
          <Link to="/dashboard" className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            <span>חזרה לדשבורד</span>
          </Link>
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md bg-background rounded-lg border p-6 md:p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שם מלא</FormLabel>
                    <FormControl>
                      <Input placeholder="שם מלא" {...field} />
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
                    <FormLabel>מספר אישי</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="מספר אישי" {...field} />
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
                    <FormLabel>מספר טלפון</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="מספר טלפון" {...field} />
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
                    <FormLabel>מין</FormLabel>
                    <FormControl>
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        className="flex gap-4"
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
                    <FormLabel>תאריך לידה</FormLabel>
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
                    <FormLabel>בסיס</FormLabel>
                    <Select
                      onValueChange={(value) => handleBaseChange(value)}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={admin?.role === "gymAdmin"}
                    >
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>מחלקה</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>פרופיל רפואי</FormLabel>
                    <Select 
                      onValueChange={(value) => handleProfileChange(value)}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
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
                      <FormLabel>סעיף הפרופיל</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
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
                    <FormLabel>ציון שאלון א"ס</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "מתבצעת הרשמה..." : "הרשם"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Registration;
