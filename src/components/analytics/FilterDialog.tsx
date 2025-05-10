import React, { useState, useEffect } from "react";
import { format, subDays, subWeeks, subMonths } from "date-fns";
import { CalendarIcon, X, ChevronsUpDown, Check, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Trainee } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Department {
  _id: string;
  name: string;
  baseId: string;
}

interface SubDepartment {
  _id: string;
  name: string;
  departmentId: string;
}

interface TraineesByDepartment {
  [departmentId: string]: {
    trainees: Trainee[];
    subDepartments: { [subDepartmentId: string]: Trainee[] };
  };
}

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startDate?: Date;
  endDate?: Date;
  setStartDate: (date?: Date) => void;
  setEndDate: (date?: Date) => void;
  selectedDepartmentIds: string[];
  setSelectedDepartmentIds: (ids: string[]) => void;
  selectedSubDepartmentIds?: string[];
  setSelectedSubDepartmentIds?: (ids: string[]) => void;
  selectedTrainees: string[];
  setSelectedTrainees: (ids: string[]) => void;
  availableDepartments: Department[];
  availableSubDepartments?: SubDepartment[];
  traineesByDepartment: TraineesByDepartment;
  clearFilters: () => void;
  toggleDepartment: (departmentId: string) => void;
  toggleSubDepartment?: (subDepartmentId: string) => void;
  toggleTrainee: (traineeId: string) => void;
  getDepartmentName: (id: string) => string;
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
  selectedDepartmentIds,
  setSelectedDepartmentIds,
  selectedSubDepartmentIds = [],
  setSelectedSubDepartmentIds,
  selectedTrainees,
  setSelectedTrainees,
  availableDepartments,
  availableSubDepartments = [],
  traineesByDepartment,
  clearFilters,
  toggleDepartment,
  toggleSubDepartment,
  toggleTrainee,
  getDepartmentName,
  getBaseName,
  isGeneralAdmin,
}) => {
  const [openDepartmentCommand, setOpenDepartmentCommand] = useState(false);
  const [openSubDepartmentCommand, setOpenSubDepartmentCommand] =
    useState(false);
  const [traineeSearch, setTraineeSearch] = useState("");
  const [showDateRange, setShowDateRange] = useState(false);

  // Set default date range to last month on component mount
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastMonthStart = subMonths(today, 1);
    setStartDate(lastMonthStart);
    setEndDate(today);
  }, []);

  // Filter trainees based on search term
  const filterTraineesBySearch = (trainees: Trainee[]) => {
    if (!traineeSearch) return trainees;

    const searchTerm = traineeSearch.toLowerCase();
    return trainees.filter(
      (trainee) =>
        trainee.fullName.toLowerCase().includes(searchTerm) ||
        trainee.personalId.toLowerCase().includes(searchTerm)
    );
  };

  const handleQuickDateSelect = (value: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (value) {
      case "all":
        setStartDate(undefined);
        setEndDate(undefined);
        setShowDateRange(false);
        break;
      case "today":
        setStartDate(today);
        setEndDate(today);
        setShowDateRange(false);
        break;
      case "yesterday":
        const yesterday = subDays(today, 1);
        setStartDate(yesterday);
        setEndDate(yesterday);
        setShowDateRange(false);
        break;
      case "lastWeek":
        const lastWeekStart = subWeeks(today, 1);
        setStartDate(lastWeekStart);
        setEndDate(today);
        setShowDateRange(false);
        break;
      case "lastMonth":
        const lastMonthStart = subMonths(today, 1);
        setStartDate(lastMonthStart);
        setEndDate(today);
        setShowDateRange(false);
        break;
      case "personalized":
        setShowDateRange(true);
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            סינון אנליטיקות
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 flex-1 overflow-y-auto">
          {/* Multiple Department Selection */}
          <div className="space-y-2">
            <h3 className="font-medium">בחירת מסגרות</h3>
            <Popover
              open={openDepartmentCommand}
              onOpenChange={setOpenDepartmentCommand}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openDepartmentCommand}
                  className="w-full justify-between text-right"
                >
                  {selectedDepartmentIds.length > 0
                    ? `${selectedDepartmentIds.length} מסגרות נבחרו`
                    : "בחר מסגרות"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="חפש מסגרת..." />
                  <CommandList>
                    <CommandEmpty>לא נמצאו מסגרות</CommandEmpty>
                    <CommandGroup>
                      {availableDepartments.map((department) => (
                        <CommandItem
                          key={department._id}
                          value={department.name}
                          onSelect={() => {
                            toggleDepartment(department._id);
                          }}
                        >
                          <Checkbox
                            checked={selectedDepartmentIds.includes(
                              department._id
                            )}
                            className="ml-2"
                          />
                          <span>{department.name}</span>
                          {isGeneralAdmin && (
                            <span className="mr-auto text-xs text-muted-foreground">
                              {getBaseName(department.baseId)}
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {selectedDepartmentIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedDepartmentIds.map((deptId) => (
                  <div
                    key={deptId}
                    className="bg-muted text-sm rounded-md px-2 py-1 flex items-center gap-1"
                  >
                    {getDepartmentName(deptId)}
                    <button
                      onClick={() => toggleDepartment(deptId)}
                      className="hover:text-destructive"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDepartmentIds([])}
                  className="text-xs"
                >
                  נקה הכל
                </Button>
              </div>
            )}
          </div>

          {/* SubDepartment Selection */}
          {setSelectedSubDepartmentIds &&
            toggleSubDepartment &&
            availableSubDepartments.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">בחירת תתי-מסגרות</h3>
                <Popover
                  open={openSubDepartmentCommand}
                  onOpenChange={setOpenSubDepartmentCommand}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openSubDepartmentCommand}
                      className="w-full justify-between text-right"
                      disabled={selectedDepartmentIds.length === 0}
                    >
                      {selectedSubDepartmentIds.length > 0
                        ? `${selectedSubDepartmentIds.length} תתי-מסגרות נבחרו`
                        : selectedDepartmentIds.length === 0
                        ? "יש לבחור מסגרות תחילה"
                        : "בחר תתי-מסגרות"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="חפש תת-מסגרת..." />
                      <CommandList>
                        <CommandEmpty>לא נמצאו תתי-מסגרות</CommandEmpty>
                        <CommandGroup>
                          {availableSubDepartments
                            .filter((subDept) =>
                              selectedDepartmentIds.includes(
                                subDept.departmentId
                              )
                            )
                            .map((subDept) => (
                              <CommandItem
                                key={subDept._id}
                                value={subDept.name}
                                onSelect={() => {
                                  toggleSubDepartment(subDept._id);
                                }}
                              >
                                <Checkbox
                                  checked={selectedSubDepartmentIds.includes(
                                    subDept._id
                                  )}
                                  className="ml-2"
                                />
                                <span>{subDept.name}</span>
                                <span className="mr-auto text-xs text-muted-foreground">
                                  {getDepartmentName(subDept.departmentId)}
                                </span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedSubDepartmentIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSubDepartmentIds.map((subDeptId) => {
                      const subDept = availableSubDepartments.find(
                        (sd) => sd._id === subDeptId
                      );
                      return (
                        <div
                          key={subDeptId}
                          className="bg-muted text-sm rounded-md px-2 py-1 flex items-center gap-1"
                        >
                          <Layers className="h-3 w-3 mr-1 text-muted-foreground" />
                          {subDept?.name || "תת-מסגרת"}
                          <button
                            onClick={() => toggleSubDepartment(subDeptId)}
                            className="hover:text-destructive"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSubDepartmentIds([])}
                      className="text-xs"
                    >
                      נקה הכל
                    </Button>
                  </div>
                )}
              </div>
            )}

          {/* Trainees Selection */}
          <div className="space-y-2">
            <h3 className="font-medium">בחירת מתאמנים</h3>

            {/* Add search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="חיפוש לפי שם או מספר אישי..."
                value={traineeSearch}
                onChange={(e) => setTraineeSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-right"
              />
              {traineeSearch && (
                <button
                  onClick={() => setTraineeSearch("")}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto border rounded-md">
              {Object.keys(traineesByDepartment).length === 0 ? (
                <p className="text-center py-2 text-muted-foreground">
                  אין מתאמנים זמינים
                </p>
              ) : (
                <div className="divide-y">
                  {Object.entries(traineesByDepartment)
                    .filter(
                      ([deptId]) =>
                        selectedDepartmentIds.length === 0 ||
                        selectedDepartmentIds.includes(deptId)
                    )
                    .map(([deptId, deptData]) => {
                      // Filter trainees in this department
                      const filteredTrainees = filterTraineesBySearch(
                        deptData.trainees
                      );
                      const filteredSubDepartments = Object.fromEntries(
                        Object.entries(deptData.subDepartments).map(
                          ([subDeptId, trainees]) => [
                            subDeptId,
                            filterTraineesBySearch(trainees),
                          ]
                        )
                      );

                      // Skip department if no trainees match the search
                      if (
                        filteredTrainees.length === 0 &&
                        Object.values(filteredSubDepartments).every(
                          (t) => t.length === 0
                        )
                      ) {
                        return null;
                      }

                      return (
                        <div key={deptId} className="p-2">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">
                              {getDepartmentName(deptId)}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => {
                                const traineeIds = filteredTrainees.map(
                                  (t) => t._id
                                );
                                const allSelected = traineeIds.every((id) =>
                                  selectedTrainees.includes(id)
                                );

                                if (allSelected) {
                                  setSelectedTrainees(
                                    selectedTrainees.filter(
                                      (id) => !traineeIds.includes(id)
                                    )
                                  );
                                } else {
                                  const newSelection = [...selectedTrainees];
                                  traineeIds.forEach((id) => {
                                    if (!newSelection.includes(id)) {
                                      newSelection.push(id);
                                    }
                                  });
                                  setSelectedTrainees(newSelection);
                                }
                              }}
                            >
                              {filteredTrainees.every((t) =>
                                selectedTrainees.includes(t._id)
                              )
                                ? "בטל בחירת כולם"
                                : "בחר הכל"}
                            </Button>
                          </div>

                          {/* Show trainees without subdepartment first */}
                          {filteredTrainees.filter((t) => !t.subDepartmentId)
                            .length > 0 && (
                            <div className="space-y-1 pl-2 mb-2">
                              {filteredTrainees
                                .filter((t) => !t.subDepartmentId)
                                .map((trainee) => (
                                  <div
                                    key={trainee._id}
                                    className="flex items-center space-x-2 justify-end"
                                  >
                                    <label
                                      htmlFor={`trainee-${trainee._id}`}
                                      className="text-sm cursor-pointer mr-2 flex-1"
                                    >
                                      {trainee.fullName}
                                    </label>
                                    <Checkbox
                                      id={`trainee-${trainee._id}`}
                                      checked={selectedTrainees.includes(
                                        trainee._id
                                      )}
                                      onCheckedChange={() =>
                                        toggleTrainee(trainee._id)
                                      }
                                    />
                                  </div>
                                ))}
                            </div>
                          )}

                          {/* Show trainees grouped by subdepartment */}
                          {Object.entries(filteredSubDepartments)
                            .filter(
                              ([subDeptId, trainees]) =>
                                (selectedSubDepartmentIds.length === 0 ||
                                  selectedSubDepartmentIds.includes(
                                    subDeptId
                                  )) &&
                                trainees.length > 0
                            )
                            .map(([subDeptId, subDeptTrainees]) => (
                              <div
                                key={subDeptId}
                                className="space-y-1 pl-4 mb-2"
                              >
                                <div className="flex items-center justify-between">
                                  <h5 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                    <Layers className="h-3 w-3" />
                                    {availableSubDepartments.find(
                                      (sd) => sd._id === subDeptId
                                    )?.name || "תת-מסגרת"}
                                  </h5>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 text-xs"
                                    onClick={() => {
                                      const traineeIds = subDeptTrainees.map(
                                        (t) => t._id
                                      );
                                      const allSelected = traineeIds.every(
                                        (id) => selectedTrainees.includes(id)
                                      );

                                      if (allSelected) {
                                        setSelectedTrainees(
                                          selectedTrainees.filter(
                                            (id) => !traineeIds.includes(id)
                                          )
                                        );
                                      } else {
                                        const newSelection = [
                                          ...selectedTrainees,
                                        ];
                                        traineeIds.forEach((id) => {
                                          if (!newSelection.includes(id)) {
                                            newSelection.push(id);
                                          }
                                        });
                                        setSelectedTrainees(newSelection);
                                      }
                                    }}
                                  >
                                    {subDeptTrainees.every((t) =>
                                      selectedTrainees.includes(t._id)
                                    )
                                      ? "בטל הכל"
                                      : "בחר הכל"}
                                  </Button>
                                </div>
                                {subDeptTrainees.map((trainee) => (
                                  <div
                                    key={trainee._id}
                                    className="flex items-center space-x-2 justify-end"
                                  >
                                    <label
                                      htmlFor={`trainee-${trainee._id}`}
                                      className="text-sm cursor-pointer mr-2 flex-1"
                                    >
                                      {trainee.fullName}
                                    </label>
                                    <Checkbox
                                      id={`trainee-${trainee._id}`}
                                      checked={selectedTrainees.includes(
                                        trainee._id
                                      )}
                                      onCheckedChange={() =>
                                        toggleTrainee(trainee._id)
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                            ))}
                        </div>
                      );
                    })}
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
        <div className="flex justify-end gap-2 mt-2 pt-2 border-t">
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
