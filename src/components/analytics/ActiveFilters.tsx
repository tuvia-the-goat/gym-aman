
import React from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface ActiveFiltersProps {
  startDate?: Date;
  endDate?: Date;
  selectedMainFrameworkIds: string[];
  selectedTrainees: string[];
  clearDateFilters: () => void;
  clearMainFrameworkFilters: () => void;
  clearTraineeFilters: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  startDate,
  endDate,
  selectedMainFrameworkIds,
  selectedTrainees,
  clearDateFilters,
  clearMainFrameworkFilters,
  clearTraineeFilters
}) => {
  const hasActiveFilters = startDate || endDate || selectedMainFrameworkIds.length > 0 || selectedTrainees.length > 0;
  
  if (!hasActiveFilters) return null;

  return (
    <div className="bg-muted p-3 rounded-lg flex flex-wrap gap-2 items-center">
      <span className="font-medium ml-2">סינון פעיל:</span>
      
      {(startDate || endDate) && (
        <div className="bg-background border rounded-md px-2 py-1 flex items-center gap-1 text-sm">
          <span>תאריכים: </span>
          {startDate ? format(startDate, "dd/MM/yyyy") : "כל התאריכים"} 
          {startDate && endDate ? " - " : ""}
          {endDate ? format(endDate, "dd/MM/yyyy") : ""}
          <button onClick={clearDateFilters} className="mr-1 hover:text-destructive">
            <X size={14} />
          </button>
        </div>
      )}
      
      {selectedMainFrameworkIds.length > 0 && (
        <div className="bg-background border rounded-md px-2 py-1 flex items-center gap-1 text-sm">
          <span>מסגרות ראשיות: </span>
          {selectedMainFrameworkIds.length} נבחרו
          <button onClick={clearMainFrameworkFilters} className="mr-1 hover:text-destructive">
            <X size={14} />
          </button>
        </div>
      )}
      
      {selectedTrainees.length > 0 && (
        <div className="bg-background border rounded-md px-2 py-1 flex items-center gap-1 text-sm">
          <span>מתאמנים: </span>
          {selectedTrainees.length} נבחרו
          <button onClick={clearTraineeFilters} className="mr-1 hover:text-destructive">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ActiveFilters;
