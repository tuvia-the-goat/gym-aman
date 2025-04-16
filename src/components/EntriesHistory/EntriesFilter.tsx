
import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface EntriesFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (value: string) => void;
  selectedBase: string;
  setSelectedBase: (value: string) => void;
  selectedProfile: string;
  setSelectedProfile: (value: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
}

const EntriesFilter: React.FC<EntriesFilterProps> = ({
  searchTerm,
  setSearchTerm,
  selectedDepartment,
  setSelectedDepartment,
  selectedBase,
  setSelectedBase,
  selectedProfile,
  setSelectedProfile,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}) => {
  const { admin, departments, bases } = useAdmin();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4 bg-secondary rounded-lg">
      <div>
        <label htmlFor="search" className="block text-sm font-medium mb-1">חיפוש לפי שם</label>
        <input 
          id="search" 
          type="text" 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          placeholder="חפש מתאמן..." 
          className="input-field" 
          autoComplete="off" 
        />
      </div>
      
      <div>
        <label htmlFor="department" className="block text-sm font-medium mb-1">סינון לפי מסגרת</label>
        <select 
          id="department" 
          value={selectedDepartment} 
          onChange={e => setSelectedDepartment(e.target.value)} 
          className="input-field" 
          style={{marginLeft: "20px"}}
        >
          <option value="">כל המסגרות</option>
          {departments.filter(dept => admin?.role === 'generalAdmin' || dept.baseId === admin?.baseId).map(dept => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>
      
      {admin?.role === 'generalAdmin' && (
        <div>
          <label htmlFor="base" className="block text-sm font-medium mb-1">סינון לפי בסיס</label>
          <select 
            id="base" 
            value={selectedBase} 
            onChange={e => setSelectedBase(e.target.value)} 
            className="input-field"
          >
            <option value="">כל הבסיסים</option>
            {bases.map(base => (
              <option key={base._id} value={base._id}>
                {base.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div>
        <label htmlFor="profile" className="block text-sm font-medium mb-1">סינון לפי פרופיל</label>
        <select 
          id="profile" 
          value={selectedProfile} 
          onChange={e => setSelectedProfile(e.target.value)} 
          className="input-field"
        >
          <option value="">כל הפרופילים</option>
          <option value="97">97</option>
          <option value="82">82</option>
          <option value="72">72</option>
          <option value="64">64</option>
          <option value="45">45</option>
          <option value="25">25</option>
        </select>
      </div>
      
      <div className="xl:col-span-2">
        <label className="block text-sm font-medium mb-1">טווח תאריכים</label>
        <div className="flex items-center gap-2">
          <span>מ-</span>
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-[180px] justify-start text-right", !startDate && "text-muted-foreground")}>
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {startDate ? format(startDate, "yyyy-MM-dd") : "תאריך התחלה"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>
          <span>עד</span>
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-[180px] justify-start text-right", !endDate && "text-muted-foreground")}>
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {endDate ? format(endDate, "yyyy-MM-dd") : "תאריך סיום"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntriesFilter;
