import React, { useState } from "react";
import { format } from "date-fns";
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

interface Trainee {
  _id: string;
  fullName: string;
  departmentId: string;
  subDepartmentId?: string;
  baseId: string;
}

interface TraineesByDepartment {
  [departmentId: string]: Trainee[];
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
  const [traineeSearchQuery, setTraineeSearchQuery] = useState("");

  // Filter trainees based on search query and selected departments/subdepartments
  const filteredTraineesByDepartment = Object.entries(
    traineesByDepartment
  ).reduce((acc, [deptId, trainees]) => {
    // Skip if department is not selected
    if (
      selectedDepartmentIds.length > 0 &&
      !selectedDepartmentIds.includes(deptId)
    ) {
      return acc;
    }

    const filteredTrainees = trainees.filter((trainee) => {
      // Filter by search query
      const matchesSearch = trainee.fullName
        .toLowerCase()
        .includes(traineeSearchQuery.toLowerCase());

      // Filter by subdepartment if any are selected
      const matchesSubDepartment =
        selectedSubDepartmentIds.length === 0 ||
        (trainee.subDepartmentId &&
          selectedSubDepartmentIds.includes(trainee.subDepartmentId));

      return matchesSearch && matchesSubDepartment;
    });

    if (filteredTrainees.length > 0) {
      acc[deptId] = filteredTrainees;
    }
    return acc;
  }, {} as TraineesByDepartment);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            סינון אנליטיקות
          </DialogTitle>
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
                      {startDate
                        ? format(startDate, "dd/MM/yyyy")
                        : "בחר תאריך"}
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

          {/* Trainees Selection (organized by department) */}
          <div className="space-y-2">
            <h3 className="font-medium">בחירת מתאמנים</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="חפש מתאמן..."
                value={traineeSearchQuery}
                onChange={(e) => setTraineeSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
              {traineeSearchQuery && (
                <button
                  onClick={() => setTraineeSearchQuery("")}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="h-[240px] border rounded-md">
              <div className="h-full overflow-y-auto">
                {Object.keys(filteredTraineesByDepartment).length === 0 ? (
                  <p className="text-center py-2 text-muted-foreground">
                    {traineeSearchQuery
                      ? "לא נמצאו מתאמנים תואמים"
                      : "אין מתאמנים זמינים"}
                  </p>
                ) : (
                  <div className="divide-y">
                    {Object.entries(filteredTraineesByDepartment).map(
                      ([deptId, deptTrainees]) => {
                        // Group trainees by subdepartment
                        const traineesBySubDepartment = deptTrainees.reduce(
                          (acc, trainee) => {
                            const subDeptId =
                              trainee.subDepartmentId || "no-subdepartment";
                            if (!acc[subDeptId]) {
                              acc[subDeptId] = [];
                            }
                            acc[subDeptId].push(trainee);
                            return acc;
                          },
                          {} as { [key: string]: Trainee[] }
                        );

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
                                  const traineeIds = deptTrainees.map(
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
                                    setSelectedTrainees([
                                      ...new Set([
                                        ...selectedTrainees,
                                        ...traineeIds,
                                      ]),
                                    ]);
                                  }
                                }}
                              >
                                {deptTrainees.every((t) =>
                                  selectedTrainees.includes(t._id)
                                )
                                  ? "בטל בחירת כולם"
                                  : "בחר הכל"}
                              </Button>
                            </div>

                            <div className="space-y-2 pl-2">
                              {Object.entries(traineesBySubDepartment).map(
                                ([subDeptId, subDeptTrainees]) => (
                                  <div key={subDeptId} className="space-y-1">
                                    {subDeptId !== "no-subdepartment" && (
                                      <div className="flex items-center justify-between mb-1">
                                        <h5 className="text-xs font-medium text-muted-foreground flex items-center">
                                          <Layers className="h-3 w-3 mr-1" />
                                          {availableSubDepartments.find(
                                            (sd) => sd._id === subDeptId
                                          )?.name || "תת-מסגרת"}
                                        </h5>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-5 text-xs"
                                          onClick={() => {
                                            const traineeIds =
                                              subDeptTrainees.map((t) => t._id);
                                            const allSelected =
                                              traineeIds.every((id) =>
                                                selectedTrainees.includes(id)
                                              );

                                            if (allSelected) {
                                              setSelectedTrainees(
                                                selectedTrainees.filter(
                                                  (id) =>
                                                    !traineeIds.includes(id)
                                                )
                                              );
                                            } else {
                                              setSelectedTrainees([
                                                ...new Set([
                                                  ...selectedTrainees,
                                                  ...traineeIds,
                                                ]),
                                              ]);
                                            }
                                          }}
                                        >
                                          {subDeptTrainees.every((t) =>
                                            selectedTrainees.includes(t._id)
                                          )
                                            ? "בטל בחירה"
                                            : "בחר הכל"}
                                        </Button>
                                      </div>
                                    )}
                                    <div className="space-y-1 pl-2">
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
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
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
