import React from 'react';
import { format } from 'date-fns';
import { X, Layers } from 'lucide-react';

interface ActiveFiltersProps {
  startDate?: Date;
  endDate?: Date;
  selectedDepartmentIds: string[];
  selectedSubDepartmentIds?: string[];
  selectedTrainees: string[];
  clearDateFilters: () => void;
  clearDepartmentFilters: () => void;
  clearSubDepartmentFilters?: () => void;
  clearTraineeFilters: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  startDate,
  endDate,
  selectedDepartmentIds,
  selectedSubDepartmentIds = [],
  selectedTrainees,
  clearDateFilters,
  clearDepartmentFilters,
  clearSubDepartmentFilters,
  clearTraineeFilters
}) => {
  const hasActiveFilters = startDate || endDate || 
    selectedDepartmentIds.length > 0 || 
    selectedSubDepartmentIds.length > 0 || 
    selectedTrainees.length > 0;
  
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
      
      {selectedDepartmentIds.length > 0 && (
        <div className="bg-background border rounded-md px-2 py-1 flex items-center gap-1 text-sm">
          <span>מסגרות: </span>
          {selectedDepartmentIds.length} נבחרו
          <button onClick={clearDepartmentFilters} className="mr-1 hover:text-destructive">
            <X size={14} />
          </button>
        </div>
      )}
      
      {selectedSubDepartmentIds.length > 0 && clearSubDepartmentFilters && (
        <div className="bg-background border rounded-md px-2 py-1 flex items-center gap-1 text-sm">
          <Layers className="h-3 w-3 mr-1" />
          <span>תתי-מסגרות: </span>
          {selectedSubDepartmentIds.length} נבחרו
          <button onClick={clearSubDepartmentFilters} className="mr-1 hover:text-destructive">
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