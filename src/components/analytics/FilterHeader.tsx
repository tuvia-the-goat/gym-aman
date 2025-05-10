import React, { useState, useEffect } from 'react';
import { FilterIcon, X, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface FilterHeaderProps {
  hasActiveFilters: boolean;
  clearFilters: () => void;
  openFilterDialog: () => void;
  onDateSelect: (value: string) => void;
  startDate?: Date;
  endDate?: Date;
  setStartDate: (date?: Date) => void;
  setEndDate: (date?: Date) => void;
}

const FilterHeader: React.FC<FilterHeaderProps> = ({
  hasActiveFilters,
  clearFilters,
  openFilterDialog,
  onDateSelect,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) => {
  const [showDateRange, setShowDateRange] = useState(false);
  const [selectedDateOption, setSelectedDateOption] = useState("lastMonth");

  // Update selectedDateOption when dates are cleared
  useEffect(() => {
    if (!startDate && !endDate) {
      setSelectedDateOption("all");
      setShowDateRange(false);
    }
  }, [startDate, endDate]);

  const handleDateSelect = (value: string) => {
    setSelectedDateOption(value);
    if (value === "personalized") {
      setShowDateRange(true);
    } else {
      setShowDateRange(false);
      onDateSelect(value);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={openFilterDialog}
          className="flex items-center gap-2"
        >
          <FilterIcon className="h-4 w-4" />
          סינון
        </Button>
        <Select value={selectedDateOption} onValueChange={handleDateSelect}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="בחר תאריך" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="flex justify-end">
              כל התאריכים
            </SelectItem>
            <SelectItem value="today" className="flex justify-end">
              היום
            </SelectItem>
            <SelectItem value="yesterday" className="flex justify-end">
              אתמול
            </SelectItem>
            <SelectItem value="lastWeek" className="flex justify-end">
              שבוע אחרון
            </SelectItem>
            <SelectItem value="lastMonth" className="flex justify-end">
              חודש אחרון
            </SelectItem>
            <SelectItem value="personalized" className="flex justify-end">
              תאריך מותאם אישית
            </SelectItem>
          </SelectContent>
        </Select>

        {showDateRange && (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-right",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : "מתאריך"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-right",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : "עד תאריך"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          נקה סינון
        </Button>
      )}
    </div>
  );
};

export default FilterHeader;
