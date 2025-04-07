
import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, X, ChevronsUpDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { MainFramework, Trainee } from '../types';

interface TraineesByMainFramework {
  [mainFrameworkId: string]: Trainee[];
}

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startDate?: Date;
  endDate?: Date;
  setStartDate: (date?: Date) => void;
  setEndDate: (date?: Date) => void;
  selectedMainFrameworkIds: string[];
  setSelectedMainFrameworkIds: (ids: string[]) => void;
  selectedTrainees: string[];
  setSelectedTrainees: (ids: string[]) => void;
  availableMainFrameworks: MainFramework[];
  traineesByMainFramework: TraineesByMainFramework;
  clearFilters: () => void;
  toggleMainFramework: (mainFrameworkId: string) => void;
  toggleTrainee: (traineeId: string) => void;
  getMainFrameworkName: (id: string) => string;
  getBaseName: (id: string) => string;
  isGeneralAdmin: boolean;
}

const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  onOpenChange,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  selectedMainFrameworkIds,
  setSelectedMainFrameworkIds,
  selectedTrainees,
  setSelectedTrainees,
  availableMainFrameworks,
  traineesByMainFramework,
  clearFilters,
  toggleMainFramework,
  toggleTrainee,
  getMainFrameworkName,
  getBaseName,
  isGeneralAdmin
}) => {
  const [openMainFrameworkCommand, setOpenMainFrameworkCommand] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">סינון אנליטיקות</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <h3 className="font-medium">טווח תאריכים</h3>
            <div className="flex gap-2">
              <div className="w-1/2">
                <p className="text-sm mb-1">מתאריך:</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy") : "בחר תאריך"}
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
              </div>
              <div className="w-1/2">
                <p className="text-sm mb-1">עד תאריך:</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-right",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy") : "בחר תאריך"}
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
            </div>
          </div>
          
          {/* Multiple Main Framework Selection */}
          <div className="space-y-2">
            <h3 className="font-medium">בחירת מסגרות ראשיות</h3>
            <Popover open={openMainFrameworkCommand} onOpenChange={setOpenMainFrameworkCommand}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openMainFrameworkCommand}
                  className="w-full justify-between text-right"
                >
                  {selectedMainFrameworkIds.length > 0
                    ? `${selectedMainFrameworkIds.length} מסגרות ראשיות נבחרו`
                    : "בחר מסגרות ראשיות"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="חפש מסגרת ראשית..." />
                  <CommandList>
                    <CommandEmpty>לא נמצאו מסגרות ראשיות</CommandEmpty>
                    <CommandGroup>
                      {availableMainFrameworks.map((framework) => (
                        <CommandItem
                          key={framework._id}
                          value={framework.name}
                          onSelect={() => {
                            toggleMainFramework(framework._id);
                          }}
                        >
                          <Checkbox
                            checked={selectedMainFrameworkIds.includes(framework._id)}
                            className="ml-2"
                          />
                          <span>{framework.name}</span>
                          {isGeneralAdmin && (
                            <span className="mr-auto text-xs text-muted-foreground">
                              {getBaseName(framework.baseId)}
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            {selectedMainFrameworkIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedMainFrameworkIds.map(frameworkId => (
                  <div key={frameworkId} className="bg-muted text-sm rounded-md px-2 py-1 flex items-center gap-1">
                    {getMainFrameworkName(frameworkId)}
                    <button 
                      onClick={() => toggleMainFramework(frameworkId)} 
                      className="hover:text-destructive"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedMainFrameworkIds([])}
                  className="text-xs"
                >
                  נקה הכל
                </Button>
              </div>
            )}
          </div>
          
          {/* Trainees Selection (organized by main framework) */}
          <div className="space-y-2">
            <h3 className="font-medium">בחירת מתאמנים</h3>
            <div className="max-h-64 overflow-y-auto border rounded-md">
              {Object.keys(traineesByMainFramework).length === 0 ? (
                <p className="text-center py-2 text-muted-foreground">אין מתאמנים זמינים</p>
              ) : (
                <div className="divide-y">
                  {Object.entries(traineesByMainFramework).map(([frameworkId, frameworkTrainees]) => (
                    <div key={frameworkId} className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{getMainFrameworkName(frameworkId)}</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs"
                          onClick={() => {
                            // Get trainee IDs for this main framework
                            const traineeIds = frameworkTrainees.map(t => t._id);
                            
                            // Check if all trainees from this main framework are already selected
                            const allSelected = traineeIds.every(id => selectedTrainees.includes(id));
                            
                            if (allSelected) {
                              // If all are selected, remove all
                              const newSelection = selectedTrainees.filter(id => !traineeIds.includes(id));
                              setSelectedTrainees(newSelection);
                            } else {
                              // If not all are selected, add all
                              const newSelection = [...selectedTrainees];
                              traineeIds.forEach(id => {
                                if (!newSelection.includes(id)) {
                                  newSelection.push(id);
                                }
                              });
                              setSelectedTrainees(newSelection);
                            }
                          }}
                        >
                          {frameworkTrainees.every(t => selectedTrainees.includes(t._id)) 
                            ? "בטל בחירת כולם" 
                            : "בחר הכל"}
                        </Button>
                      </div>
                      
                      <div className="space-y-1 pl-2">
                        {frameworkTrainees.map(trainee => (
                          <div key={trainee._id} className="flex items-center space-x-2 justify-end">
                            <label htmlFor={`trainee-${trainee._id}`} className="text-sm cursor-pointer mr-2 flex-1">
                              {trainee.fullName}
                            </label>
                            <Checkbox 
                              id={`trainee-${trainee._id}`}
                              checked={selectedTrainees.includes(trainee._id)}
                              onCheckedChange={() => toggleTrainee(trainee._id)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {selectedTrainees.length > 0 && (
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedTrainees([])}
                >
                  נקה בחירת מתאמנים
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedTrainees.length} נבחרו
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={clearFilters}>
            נקה הכל
          </Button>
          <DialogClose asChild>
            <Button>אישור</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;
