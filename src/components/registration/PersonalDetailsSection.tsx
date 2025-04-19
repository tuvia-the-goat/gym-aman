
import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import FormSection from './FormSection';
import { Department } from '../../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { he } from 'date-fns/locale'; // Hebrew locale support

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
  <label htmlFor="gender" className="block text-sm font-medium text-black">
    מין
  </label>
  <Select
    value={gender}
    onValueChange={(value) => value==="select_gender"? setGender("") :setGender(value as 'male' | 'female')}
    required
  >
    <SelectTrigger className="input-field w-full text-black">
      <SelectValue placeholder="בחר מין" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="select_gender" className="flex justify-end text-black">בחר מין</SelectItem>
      <SelectItem value="male" className="flex justify-end text-black">זכר</SelectItem>
      <SelectItem value="female" className="flex justify-end text-black">נקבה</SelectItem>
    </SelectContent>
  </Select>
</div>
        
<div className="space-y-2">
  
      <label htmlFor="birthDate" className="block text-sm font-medium text-black">
        תאריך לידה
      </label>
      <style>{customStyles}</style>

      <DatePicker
        selected={birthDate}
        onChange={(date : Date) => setBirthDate(date)}
        dateFormat="dd/MM/yyyy"
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={80}
        placeholderText="בחר תאריך לידה"
        maxDate={new Date()}
        minDate={new Date('1940-01-01')}
        locale={he}
        showPopperArrow={false}
        className="input-field w-full text-black text-sm font-[300]"
        popperPlacement="top-end"
        popperClassName="rtl-datepicker"
        id="birthDate"
        calendarClassName="font-medium text-black"
      />
    </div>
        
        <div className="space-y-2">
  <label htmlFor="department" className="block text-sm font-medium text-black">
    מסגרת
  </label>
  <Select
    value={departmentId}
    onValueChange={(value) => value==="select_department"? setDepartmentId("") :setDepartmentId(value)}
    required
  >
    <SelectTrigger className="input-field w-full text-black">
      <SelectValue placeholder="בחר מסגרת" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="select_department" className="flex justify-end text-black">בחר מסגרת</SelectItem>
      {filteredDepartments.map((dept) => (
        <SelectItem key={dept._id} value={dept._id} className="flex justify-end text-black">
          {dept.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
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
