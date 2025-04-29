// src/components/EntriesHistory/EntriesFilter.tsx

import React, { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { subDepartmentService } from "../../services/api";
import { SubDepartment, Department } from "@/types";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EntriesFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (value: string) => void;
  selectedSubDepartment: string; // Add this line
  setSelectedSubDepartment: (value: string) => void; // Add this line
  selectedBase: string;
  setSelectedBase: (value: string) => void;
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
  selectedSubDepartment,
  setSelectedSubDepartment,
  selectedBase,
  setSelectedBase,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  const { admin, departments, bases, subDepartments } = useAdmin();
  const [filteredSubDepartments, setFilteredSubDepartments] = useState<
    SubDepartment[]
  >([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);

  // Filter departments based on selected base
  useEffect(() => {
    if (selectedBase) {
      const baseDepartments = departments.filter(
        (dept) => dept.baseId === selectedBase
      );
      setFilteredDepartments(baseDepartments);
      // Reset department selection when base changes
      setSelectedDepartment("");
    } else {
      setFilteredDepartments([]);
      setSelectedDepartment("");
    }
  }, [selectedBase, departments]);

  // Filter subDepartments when department changes
  useEffect(() => {
    if (!selectedDepartment) {
      setFilteredSubDepartments([]);
      setSelectedSubDepartment("");
      return;
    }

    const subDepts = subDepartments.filter(
      (subDept) => subDept.departmentId === selectedDepartment
    );
    setFilteredSubDepartments(subDepts);
  }, [selectedDepartment, subDepartments, setSelectedSubDepartment]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4 bg-secondary rounded-lg">
      <div>
        <label
          htmlFor="search"
          className="block text-sm font-medium mb-1 text-black"
        >
          חיפוש לפי שם או מ"א
        </label>
        <Input
          id="search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="חפש מתאמן..."
          className="text-sm text-black"
          autoComplete="off"
        />
      </div>

      {admin?.role === "generalAdmin" && (
        <div>
          <label htmlFor="base" className="block text-sm font-medium mb-1">
            סינון לפי בסיס
          </label>
          <Select
            value={selectedBase}
            onValueChange={(value) => {
              value === "all" ? setSelectedBase("") : setSelectedBase(value);
            }}
          >
            <SelectTrigger className="input-field w-full">
              <SelectValue placeholder="כל הבסיסים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="flex justify-end">
                כל הבסיסים
              </SelectItem>
              {bases.map((base) => (
                <SelectItem
                  key={base._id}
                  value={base._id}
                  className="flex justify-end"
                >
                  {base.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <label htmlFor="department" className="block text-sm font-medium mb-1">
          סינון לפי מסגרת
        </label>
        <Select
          value={selectedDepartment}
          onValueChange={(value) => {
            setSelectedSubDepartment("");
            value === "all"
              ? setSelectedDepartment("")
              : setSelectedDepartment(value);
          }}
          disabled={!selectedBase}
        >
          <SelectTrigger className="input-field w-full">
            <SelectValue placeholder="כל המסגרות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="flex justify-end">
              כל המסגרות
            </SelectItem>
            {filteredDepartments.map((department) => (
              <SelectItem
                key={department._id}
                value={department._id}
                className="flex justify-end"
              >
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Add SubDepartment filter */}
      <div>
        <label
          htmlFor="subDepartment"
          className="block text-sm font-medium mb-1"
        >
          סינון לפי תת-מסגרת
        </label>
        <Select
          value={selectedSubDepartment}
          onValueChange={(value) => {
            value === "all"
              ? setSelectedSubDepartment("")
              : setSelectedSubDepartment(value);
          }}
          disabled={!selectedDepartment}
        >
          <SelectTrigger
            className="input-field w-full"
            style={{ marginLeft: "20px" }}
          >
            <SelectValue placeholder="כל תתי-המסגרות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="flex justify-end">
              כל תתי-המסגרות
            </SelectItem>
            {filteredSubDepartments.map((subDept) => (
              <SelectItem
                key={subDept._id}
                value={subDept._id}
                className="flex justify-end"
              >
                {subDept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="xl:col-span-2">
        <label className="block text-sm font-medium mb-1">טווח תאריכים</label>
        <div className="flex items-center gap-2">
          <span>מ-</span>
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[180px] justify-start text-right",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {startDate ? format(startDate, "yyyy-MM-dd") : "תאריך התחלה"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          <span>עד</span>
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[180px] justify-start text-right",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {endDate ? format(endDate, "yyyy-MM-dd") : "תאריך סיום"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntriesFilter;
