
import React from 'react';
import { FilterIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterHeaderProps {
  hasActiveFilters: boolean;
  clearFilters: () => void;
  openFilterDialog: () => void;
}

const FilterHeader: React.FC<FilterHeaderProps> = ({ 
  hasActiveFilters, 
  clearFilters, 
  openFilterDialog 
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">אנליטיקות</h2>
      <div className="flex items-center gap-2">
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} className="flex items-center gap-1">
            <X size={16} />
            נקה סינון
          </Button>
        )}
        <Button onClick={openFilterDialog} variant="outline" className="flex items-center gap-1">
          <FilterIcon size={16} />
          סינון
        </Button>
      </div>
    </div>
  );
};

export default FilterHeader;
