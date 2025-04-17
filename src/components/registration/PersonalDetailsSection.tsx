
import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import FormSection from './FormSection';
import { Department } from '../../types';

interface PersonalDetailsSectionProps {
  personalId: string;
  setPersonalId: (id: string) => void;
  fullName: string;
  setFullName: (name: string) => void;
  gender: 'male' | 'female' | '';
  setGender: (gender: 'male' | 'female' | '') => void;
  birthDate: Date | undefined;
  setBirthDate: (date: Date | undefined) => void;
  departmentId: string;
  setDepartmentId: (id: string) => void;
  phoneNumber: string;
  setPhoneNumber: (number: string) => void;
  filteredDepartments: Department[];
}

const PersonalDetailsSection = ({
  personalId,
  setPersonalId,
  fullName,
  setFullName,
  gender,
  setGender,
  birthDate,
  setBirthDate,
  departmentId,
  setDepartmentId,
  phoneNumber,
  setPhoneNumber,
  filteredDepartments,
}: PersonalDetailsSectionProps) => {
  return (
    <FormSection title="פרטים אישיים">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="personalId" className="block text-sm font-medium">
            מספר אישי (7 ספרות)
          </label>
          <input
            id="personalId"
            type="text"
            inputMode="numeric"
            value={personalId}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 7);
              setPersonalId(value);
            }}
            className="input-field"
            placeholder="1234567"
            required
            autoComplete="off"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-medium">
            שם מלא
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input-field"
            placeholder="שם פרטי ומשפחה"
            required
            autoComplete="off"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="gender" className="block text-sm font-medium">
            מין
          </label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value as 'male' | 'female' | '')}
            className="input-field"
            required
          >
            <option value="">בחר מין</option>
            <option value="male">זכר</option>
            <option value="female">נקבה</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="birthDate" className="block text-sm font-medium">
            תאריך לידה
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="birthDate"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-right",
                  !birthDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {birthDate ? format(birthDate, "yyyy-MM-dd") : "בחר תאריך"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={birthDate}
                onSelect={setBirthDate}
                initialFocus
                disabled={(date) => {
                  return date > new Date();
                }}
                className={cn("p-3 pointer-events-auto")}
                fromYear={1940}
                toYear={new Date().getFullYear()}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="department" className="block text-sm font-medium">
            מסגרת
          </label>
          <select
            id="department"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="input-field"
            required
          >
            <option value="">בחר מסגרת</option>
            {filteredDepartments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        
        
        <div className="space-y-2">
          <label htmlFor="phoneNumber" className="block text-sm font-medium">
            מספר טלפון (מתחיל ב-05)
          </label>
          <input
            id="phoneNumber"
            type="text"
            inputMode="numeric"
            value={phoneNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
              setPhoneNumber(value);
            }}
            className="input-field"
            placeholder="05XXXXXXXX"
            required
            autoComplete="off"
          />
        </div>
      </div>
    </FormSection>
  );
};

export default PersonalDetailsSection;
