import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAdmin } from "../context/AdminContext";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Department, SubDepartment } from "../types";
import Fuse from "fuse.js";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  baseService,
  departmentService,
  subDepartmentService,
  traineeService,
  adminService,
} from "../services/api";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  AlertCircleIcon,
  CheckIcon,
  XIcon,
  KeyIcon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Settings = () => {
  const {
    admin,
    bases,
    setBases,
    departments,
    setDepartments,
    subDepartments,
    setSubDepartments,
    trainees,
    setTrainees,
  } = useAdmin();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("departments-with-subdepartments");

  // Base states
  const [newBaseName, setNewBaseName] = useState("");
  const [newBaseLocation, setNewBaseLocation] = useState("");
  const [editingBaseId, setEditingBaseId] = useState<string | null>(null);
  const [editBaseName, setEditBaseName] = useState("");
  const [editBaseLocation, setEditBaseLocation] = useState("");
  const [deletingBaseId, setDeletingBaseId] = useState<string | null>(null);

  // Department states
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentNumOfPeople, setNewDepartmentNumOfPeople] = useState(0);
  const [selectedBaseForDepartment, setSelectedBaseForDepartment] =
    useState("");
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(
    null
  );
  const [editDepartmentName, setEditDepartmentName] = useState("");
  const [editDepartmentNumOfPeople, setEditDepartmentNumOfPeople] = useState(0);
  const [editDepartmentBaseId, setEditDepartmentBaseId] = useState("");
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<
    string | null
  >(null);

  // SubDepartment states
  const [newSubDepartmentName, setNewSubDepartmentName] = useState("");
  const [newSubDepartmentNumOfPeople, setNewSubDepartmentNumOfPeople] =
    useState(0);
  const [
    selectedDepartmentForSubDepartment,
    setSelectedDepartmentForSubDepartment,
  ] = useState("");
  const [editingSubDepartmentId, setEditingSubDepartmentId] = useState<
    string | null
  >(null);
  const [editSubDepartmentName, setEditSubDepartmentName] = useState("");
  const [editSubDepartmentNumOfPeople, setEditSubDepartmentNumOfPeople] =
    useState(0);
  const [editSubDepartmentDepartmentId, setEditSubDepartmentDepartmentId] =
    useState("");
  const [deletingSubDepartmentId, setDeletingSubDepartmentId] = useState<
    string | null
  >(null);

  // New states for trainee transfer
  const [transferDepartmentId, setTransferDepartmentId] = useState("");
  const [transferSubDepartmentId, setTransferSubDepartmentId] = useState("");
  const [availableSubDepartments, setAvailableSubDepartments] = useState([]);
  const [traineesInSubDepartment, setTraineesInSubDepartment] = useState([]);

  // Admin states
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"generalAdmin" | "gymAdmin">(
    "gymAdmin"
  );
  const [selectedBaseForAdmin, setSelectedBaseForAdmin] = useState("");
  const [admins, setAdmins] = useState([]);
  const [resettingPasswordFor, setResettingPasswordFor] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Confirm dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState<
    "base" | "department" | "subdepartment"
  >("base");
  const [deleteItemName, setDeleteItemName] = useState("");

  // New states for creating departments with subdepartments
  const [showSubDepartmentsForm, setShowSubDepartmentsForm] = useState(false);
  const [subDepartmentInputs, setSubDepartmentInputs] = useState<
    { name: string; numOfPeople: number }[]
  >([{ name: "", numOfPeople: 0 }]);
  const [selectedBaseForNewDepartment, setSelectedBaseForNewDepartment] =
    useState("");
  const [selectedBaseFilter, setSelectedBaseFilter] = useState("all");
  const [addingSubDepartmentsTo, setAddingSubDepartmentsTo] = useState<
    string | null
  >(null);
  const [newSubDepartmentInputs, setNewSubDepartmentInputs] = useState<
    { name: string; numOfPeople: number }[]
  >([{ name: "", numOfPeople: 0 }]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    departments: Department[];
    subDepartments: SubDepartment[];
  } | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);

  // New search states
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<{
    departments: Department[];
    subDepartments: SubDepartment[];
  }>({ departments: [], subDepartments: [] });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize Fuse instances
  const departmentsFuse = new Fuse(departments, {
    keys: ["name"],
    threshold: 0.3,
    includeScore: true,
  });

  const subDepartmentsFuse = new Fuse(subDepartments, {
    keys: ["name"],
    threshold: 0.3,
    includeScore: true,
  });

  // Update Fuse instances when data changes
  useEffect(() => {
    departmentsFuse.setCollection(departments);
    subDepartmentsFuse.setCollection(subDepartments);
  }, [departments, subDepartments]);

  // Enhanced search function
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If query is empty, clear results and open items
    if (!query.trim()) {
      setSearchResults(null);
      setSearchSuggestions({ departments: [], subDepartments: [] });
      setOpenAccordionItems([]);
      return;
    }

    // Set a new timeout for the search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Local fuzzy search for suggestions
        const deptResults = departmentsFuse.search(query);
        const subDeptResults = subDepartmentsFuse.search(query);

        setSearchSuggestions({
          departments: deptResults.map((result) => result.item),
          subDepartments: subDeptResults.map((result) => result.item),
        });

        // API search for full results
        const results = await departmentService.search(query);
        setSearchResults(results);

        // Get unique department IDs that contain matching subdepartments
        const departmentsWithMatchingSubdepartments = new Set(
          results.subDepartments.map((subDept) => subDept.departmentId)
        );

        // Set the open accordion items (only departments with matching subdepartments)
        setOpenAccordionItems([...departmentsWithMatchingSubdepartments]);
      } catch (error) {
        console.error("Error searching departments:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בעת החיפוש",
          variant: "destructive",
        });
      }
    }, 300);
  };

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Get department and base names
  const getDepartmentName = (id: string) => {
    const department = departments.find((dept) => dept._id === id);
    return department ? department.name : "";
  };

  const getBaseName = (id: string) => {
    const base = bases.find((base) => base._id === id);
    return base ? base.name : "";
  };

  // ===== BASE OPERATIONS =====
  // Handle adding a new base
  const handleAddBase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newBaseName.trim() || !newBaseLocation.trim()) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create new base via API
      const newBase = await baseService.create({
        name: newBaseName,
        location: newBaseLocation,
      });

      // Update bases state
      setBases([...bases, newBase]);

      // Reset form
      setNewBaseName("");
      setNewBaseLocation("");

      toast({
        title: "בסיס חדש נוסף",
        description: `בסיס ${newBase.name} נוסף בהצלחה`,
      });
    } catch (error) {
      console.error("Error adding base:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הוספת הבסיס",
        variant: "destructive",
      });
    }
  };

  // Start editing a base
  const startEditBase = (baseId: string) => {
    const baseToEdit = bases.find((base) => base._id === baseId);
    if (baseToEdit) {
      setEditingBaseId(baseId);
      setEditBaseName(baseToEdit.name);
      setEditBaseLocation(baseToEdit.location);
    }
  };

  // Cancel editing a base
  const cancelEditBase = () => {
    setEditingBaseId(null);
    setEditBaseName("");
    setEditBaseLocation("");
  };

  // Save edited base
  const saveEditBase = async (baseId: string) => {
    if (!editBaseName.trim() || !editBaseLocation.trim()) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedBase = await baseService.update(baseId, {
        name: editBaseName,
        location: editBaseLocation,
      });

      const updatedBases = bases.map((base) =>
        base._id === baseId
          ? { ...base, name: editBaseName, location: editBaseLocation }
          : base
      );

      setBases(updatedBases);

      // Reset editing state
      setEditingBaseId(null);
      setEditBaseName("");
      setEditBaseLocation("");

      toast({
        title: "בסיס עודכן",
        description: `בסיס ${editBaseName} עודכן בהצלחה`,
      });
    } catch (error) {
      console.error("Error updating base:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת עדכון הבסיס",
        variant: "destructive",
      });
    }
  };

  // Open delete confirmation for base
  const confirmDeleteBase = (baseId: string) => {
    const baseToDelete = bases.find((base) => base._id === baseId);
    if (baseToDelete) {
      setDeletingBaseId(baseId);
      setDeleteItemType("base");
      setDeleteItemName(baseToDelete.name);
      setShowDeleteConfirm(true);
    }
  };

  // Delete a base
  const deleteBase = async () => {
    if (!deletingBaseId) return;

    try {
      await baseService.delete(deletingBaseId);

      const updatedBases = bases.filter((base) => base._id !== deletingBaseId);
      setBases(updatedBases);

      toast({
        title: "בסיס נמחק",
        description: `בסיס ${deleteItemName} נמחק בהצלחה`,
      });
    } catch (error) {
      console.error("Error deleting base:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת מחיקת הבסיס",
        variant: "destructive",
      });
    } finally {
      setDeletingBaseId(null);
      setShowDeleteConfirm(false);
    }
  };

  // ===== DEPARTMENT OPERATIONS =====
  // Handle adding a new department
  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName || !selectedBaseForDepartment) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    try {
      const newDepartment = await departmentService.create({
        name: newDepartmentName,
        baseId: selectedBaseForDepartment,
        numOfPeople: newDepartmentNumOfPeople,
      });
      setDepartments([...departments, newDepartment]);
      setNewDepartmentName("");
      setNewDepartmentNumOfPeople(0);
      setSelectedBaseForDepartment("");
      toast({
        title: "הצלחה",
        description: "המחלקה נוספה בהצלחה",
      });
    } catch (error) {
      console.error("Error adding department:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הוספת המחלקה",
        variant: "destructive",
      });
    }
  };

  // Start editing a department
  const startEditDepartment = (departmentId: string) => {
    const department = departments.find((d) => d._id === departmentId);
    if (department) {
      setEditingDepartmentId(departmentId);
      setEditDepartmentName(department.name);
      setEditDepartmentNumOfPeople(department.numOfPeople);
      setEditDepartmentBaseId(department.baseId);
    }
  };

  // Cancel editing a department
  const cancelEditDepartment = () => {
    setEditingDepartmentId(null);
    setEditDepartmentName("");
    setEditDepartmentBaseId("");
    setEditDepartmentNumOfPeople(0);
  };

  // Save edited department
  const saveEditDepartment = async (departmentId: string) => {
    if (!editDepartmentName || !editDepartmentBaseId) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedDepartment = await departmentService.update(departmentId, {
        name: editDepartmentName,
        numOfPeople: editDepartmentNumOfPeople,
      });
      setDepartments(
        departments.map((d) => (d._id === departmentId ? updatedDepartment : d))
      );
      setEditingDepartmentId(null);
      toast({
        title: "הצלחה",
        description: "המחלקה עודכנה בהצלחה",
      });
    } catch (error) {
      console.error("Error updating department:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת עדכון המחלקה",
        variant: "destructive",
      });
    }
  };

  // Open delete confirmation for department
  const confirmDeleteDepartment = (departmentId: string) => {
    const departmentToDelete = departments.find(
      (dept) => dept._id === departmentId
    );
    if (departmentToDelete) {
      setDeletingDepartmentId(departmentId);
      setDeleteItemType("department");
      setDeleteItemName(departmentToDelete.name);
      setShowDeleteConfirm(true);
    }
  };

  // Delete a department
  const deleteDepartment = async () => {
    if (!deletingDepartmentId) return;

    try {
      await departmentService.delete(deletingDepartmentId);

      const updatedDepartments = departments.filter(
        (dept) => dept._id !== deletingDepartmentId
      );
      setDepartments(updatedDepartments);

      toast({
        title: "מסגרת נמחקה",
        description: `מסגרת ${deleteItemName} נמחקה בהצלחה`,
      });
    } catch (error) {
      console.error("Error deleting department:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת מחיקת המסגרת",
        variant: "destructive",
      });
    } finally {
      setDeletingDepartmentId(null);
      setShowDeleteConfirm(false);
    }
  };

  // ===== SUBDEPARTMENT OPERATIONS =====
  // Handle adding a new subdepartment
  const handleAddSubDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubDepartmentName || !selectedDepartmentForSubDepartment) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    try {
      const newSubDepartment = await subDepartmentService.create({
        name: newSubDepartmentName,
        departmentId: selectedDepartmentForSubDepartment,
        numOfPeople: newSubDepartmentNumOfPeople,
      });
      setSubDepartments([...subDepartments, newSubDepartment]);
      setNewSubDepartmentName("");
      setNewSubDepartmentNumOfPeople(0);
      setSelectedDepartmentForSubDepartment("");
      toast({
        title: "הצלחה",
        description: "תת-המחלקה נוספה בהצלחה",
      });
    } catch (error) {
      console.error("Error adding subdepartment:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הוספת תת-המחלקה",
        variant: "destructive",
      });
    }
  };

  // Start editing a subdepartment
  const startEditSubDepartment = (subDepartmentId: string) => {
    const subDepartment = subDepartments.find((s) => s._id === subDepartmentId);
    if (subDepartment) {
      setEditingSubDepartmentId(subDepartmentId);
      setEditSubDepartmentName(subDepartment.name);
      setEditSubDepartmentNumOfPeople(subDepartment.numOfPeople);
      setEditSubDepartmentDepartmentId(subDepartment.departmentId);
    }
  };

  // Cancel editing a subdepartment
  const cancelEditSubDepartment = () => {
    setEditingSubDepartmentId(null);
    setEditSubDepartmentName("");
    setEditSubDepartmentDepartmentId("");
    setEditSubDepartmentNumOfPeople(0);
  };

  // Save edited subdepartment
  const saveEditSubDepartment = async (subDepartmentId: string) => {
    if (!editSubDepartmentName || !editSubDepartmentDepartmentId) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedSubDepartment = await subDepartmentService.update(
        subDepartmentId,
        {
          name: editSubDepartmentName,
          departmentId: editSubDepartmentDepartmentId,
          numOfPeople: editSubDepartmentNumOfPeople,
        }
      );
      setSubDepartments(
        subDepartments.map((s) =>
          s._id === subDepartmentId ? updatedSubDepartment : s
        )
      );
      setEditingSubDepartmentId(null);
      toast({
        title: "הצלחה",
        description: "תת-המחלקה עודכנה בהצלחה",
      });
    } catch (error) {
      console.error("Error updating subdepartment:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת עדכון תת-המחלקה",
        variant: "destructive",
      });
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    // Add a small delay before resetting states
    setTimeout(() => {
      setDeletingBaseId(null);
      setDeletingDepartmentId(null);
      setDeletingSubDepartmentId(null);
      setShowDeleteConfirm(false);
      // Reset transfer selections
      setTransferDepartmentId("");
      setTransferSubDepartmentId("");
      setAvailableSubDepartments([]);
      setTraineesInSubDepartment([]);
    }, 300); // 300ms delay
  };

  // Update available subdepartments when transfer department changes
  useEffect(() => {
    if (transferDepartmentId) {
      const filteredSubDepartments = subDepartments.filter(
        (subDept) => subDept.departmentId === transferDepartmentId
      );
      setAvailableSubDepartments(filteredSubDepartments);
      setTransferSubDepartmentId(""); // Reset subdepartment selection
    } else {
      setAvailableSubDepartments([]);
      setTransferSubDepartmentId("");
    }
  }, [transferDepartmentId, subDepartments]);

  // Open delete confirmation for subdepartment
  const confirmDeleteSubDepartment = async (subDepartmentId: string) => {
    const subDepartmentToDelete = subDepartments.find(
      (subDept) => subDept._id === subDepartmentId
    );
    if (subDepartmentToDelete) {
      setDeletingSubDepartmentId(subDepartmentId);
      setDeleteItemType("subdepartment");
      setDeleteItemName(subDepartmentToDelete.name);

      // Reset all transfer-related states
      setTransferDepartmentId("");
      setTransferSubDepartmentId("");
      setAvailableSubDepartments([]);
      setTraineesInSubDepartment([]);

      // Fetch trainees in this subdepartment
      try {
        const allTrainees = await traineeService.getAll();
        const traineesInDept = allTrainees.filter(
          (trainee) => trainee.subDepartmentId === subDepartmentId
        );
        setTraineesInSubDepartment(traineesInDept);
      } catch (error) {
        console.error("Error fetching trainees:", error);
        setTraineesInSubDepartment([]);
      }

      setShowDeleteConfirm(true);
    }
  };

  // Delete a subdepartment
  const deleteSubDepartment = async () => {
    if (!deletingSubDepartmentId) return;

    if (
      deleteItemType === "subdepartment" &&
      (!transferDepartmentId || !transferSubDepartmentId)
    ) {
      toast({
        title: "שגיאה",
        description: "יש לבחור מסגרת ותת-מסגרת חדשים להעברת החניכים",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, transfer trainees to new subdepartment
      if (deleteItemType === "subdepartment") {
        await traineeService.transferSubDepartment(
          deletingSubDepartmentId,
          transferSubDepartmentId
        );

        // Get the new subdepartment to get its departmentId
        const newSubDepartment = subDepartments.find(
          (subDept) => subDept._id === transferSubDepartmentId
        );
        if (!newSubDepartment) {
          throw new Error("New subdepartment not found");
        }

        // Update trainees in context
        const updatedTrainees = trainees.map((trainee) => {
          if (trainee.subDepartmentId === deletingSubDepartmentId) {
            return {
              ...trainee,
              subDepartmentId: transferSubDepartmentId,
              departmentId: newSubDepartment.departmentId,
            };
          }
          return trainee;
        });
        setTrainees(updatedTrainees);
      }

      // Then delete the subdepartment
      await subDepartmentService.delete(deletingSubDepartmentId);

      const updatedSubDepartments = subDepartments.filter(
        (subDept) => subDept._id !== deletingSubDepartmentId
      );
      setSubDepartments(updatedSubDepartments);

      toast({
        title: "תת-מסגרת נמחקה",
        description: `תת-מסגרת ${deleteItemName} נמחקה בהצלחה והחניכים הועברו לתת-מסגרת חדשה`,
      });
    } catch (error) {
      console.error("Error deleting subdepartment:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת מחיקת תת-המסגרת",
        variant: "destructive",
      });
    } finally {
      setDeletingSubDepartmentId(null);
      setShowDeleteConfirm(false);
      // Reset transfer selections
      setTransferDepartmentId("");
      setTransferSubDepartmentId("");
      setAvailableSubDepartments([]);
      setTraineesInSubDepartment([]);
    }
  };

  // ===== ADMIN OPERATIONS =====
  // Handle adding a new admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newAdminPassword.length < 6) {
      toast({
        title: "שגיאה",
        description: "הסיסמה חייבת להכיל לפחות 6 תווים",
        variant: "destructive",
      });
      return;
    }

    try {
      await adminService.create({
        username: newAdminUsername,
        password: newAdminPassword,
        role: newAdminRole,
        baseId: selectedBaseForAdmin,
      });
      toast({
        title: "הצלחה",
        description: "המנהל נוסף בהצלחה",
      });
      setNewAdminUsername("");
      setNewAdminPassword("");
      setNewAdminRole("gymAdmin");
      setSelectedBaseForAdmin("");
      fetchAdmins();
    } catch (error) {
      console.error("Error adding admin:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הוספת המנהל",
        variant: "destructive",
      });
    }
  };

  // Process delete confirmation
  const handleDeleteConfirm = () => {
    if (deleteItemType === "base" && deletingBaseId) {
      deleteBase();
    } else if (deleteItemType === "department" && deletingDepartmentId) {
      deleteDepartment();
    } else if (deleteItemType === "subdepartment" && deletingSubDepartmentId) {
      deleteSubDepartment();
    }
  };

  // Handle adding a new subdepartment input
  const handleAddSubDepartmentInput = () => {
    setSubDepartmentInputs([
      ...subDepartmentInputs,
      { name: "", numOfPeople: 0 },
    ]);
  };

  // Handle subdepartment input change
  const handleSubDepartmentInputChange = (index: number, value: string) => {
    const newInputs = [...subDepartmentInputs];
    newInputs[index] = { ...newInputs[index], name: value };
    setSubDepartmentInputs(newInputs);
  };

  // Handle subdepartment numOfPeople change
  const handleSubDepartmentNumOfPeopleChange = (
    index: number,
    value: number
  ) => {
    const newInputs = [...subDepartmentInputs];
    newInputs[index] = { ...newInputs[index], numOfPeople: value };
    setSubDepartmentInputs(newInputs);
  };

  // Handle creating department with subdepartments
  const handleCreateDepartmentWithSubDepartments = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !newDepartmentName.trim() ||
      (!selectedBaseForNewDepartment && admin?.role === "generalAdmin")
    ) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    // Check if a department with the same name exists in the selected base
    const baseId =
      admin?.role === "generalAdmin"
        ? selectedBaseForNewDepartment
        : admin?.baseId;

    const existingDepartment = departments.find(
      (dept) => dept.name === newDepartmentName.trim() && dept.baseId === baseId
    );

    if (existingDepartment) {
      toast({
        title: "שגיאה",
        description: "כבר קיימת מסגרת עם שם זה בבסיס זה",
        variant: "destructive",
      });
      return;
    }

    // Filter out empty subdepartment names
    const validSubDepartments = subDepartmentInputs.filter(
      (input) => input.name.trim() !== ""
    );

    // Calculate the sum of all subdepartments' numOfPeople
    const totalSubDepartmentsPeople = validSubDepartments.reduce(
      (sum, subDept) => sum + subDept.numOfPeople,
      0
    );

    // Check if the sum exceeds the department's numOfPeople
    if (totalSubDepartmentsPeople > newDepartmentNumOfPeople) {
      setValidationAction(() => async () => {
        try {
          const result = await departmentService.createWithSubDepartments({
            name: newDepartmentName,
            baseId,
            subDepartments: validSubDepartments,
            numOfPeople: newDepartmentNumOfPeople,
          });

          // Update local state
          setDepartments([...departments, result.department]);
          setSubDepartments([...subDepartments, ...result.subDepartments]);

          // Reset form
          setNewDepartmentName("");
          setSelectedBaseForNewDepartment("");
          setNewDepartmentNumOfPeople(0);
          setSubDepartmentInputs([{ name: "", numOfPeople: 0 }]);
          setShowSubDepartmentsForm(false);

          toast({
            title: "מסגרת ותתי-מסגרות נוספו",
            description: `מסגרת ${result.department.name} ותתי-המסגרות שלה נוספו בהצלחה`,
          });
        } catch (error) {
          console.error(
            "Error creating department with subdepartments:",
            error
          );
          toast({
            title: "שגיאה",
            description: "אירעה שגיאה בעת יצירת המסגרת ותתי-המסגרות",
            variant: "destructive",
          });
        }
      });
      setShowValidationAlert(true);
      return;
    }

    // If validation passes, proceed with creation
    try {
      const result = await departmentService.createWithSubDepartments({
        name: newDepartmentName,
        baseId,
        subDepartments: validSubDepartments,
        numOfPeople: newDepartmentNumOfPeople,
      });

      // Update local state
      setDepartments([...departments, result.department]);
      setSubDepartments([...subDepartments, ...result.subDepartments]);

      // Reset form
      setNewDepartmentName("");
      setSelectedBaseForNewDepartment("");
      setNewDepartmentNumOfPeople(0);
      setSubDepartmentInputs([{ name: "", numOfPeople: 0 }]);
      setShowSubDepartmentsForm(false);

      toast({
        title: "מסגרת ותתי-מסגרות נוספו",
        description: `מסגרת ${result.department.name} ותתי-המסגרות שלה נוספו בהצלחה`,
      });
    } catch (error) {
      console.error("Error creating department with subdepartments:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת יצירת המסגרת ותתי-המסגרות",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (searchQuery?.trim() === "") {
      setSearchQuery("");
      setSearchResults(null);
      setSearchSuggestions({
        departments: [],
        subDepartments: [],
      });
      setOpenAccordionItems([]);
    }
  }, [
    searchQuery,
    setSearchQuery,
    setSearchResults,
    setSearchSuggestions,
    setOpenAccordionItems,
  ]);

  // Add new function to handle adding subdepartment inputs
  const handleNewSubDepartmentInput = () => {
    setNewSubDepartmentInputs([
      ...newSubDepartmentInputs,
      { name: "", numOfPeople: 0 },
    ]);
  };

  // Add new function to handle subdepartment input changes
  const handleNewSubDepartmentInputChange = (index: number, value: string) => {
    const newInputs = [...newSubDepartmentInputs];
    newInputs[index] = { ...newInputs[index], name: value };
    setNewSubDepartmentInputs(newInputs);
  };

  // Add new function to handle subdepartment numOfPeople changes
  const handleNewSubDepartmentNumOfPeopleChange = (
    index: number,
    value: number
  ) => {
    const newInputs = [...newSubDepartmentInputs];
    newInputs[index] = { ...newInputs[index], numOfPeople: value };
    setNewSubDepartmentInputs(newInputs);
  };

  // Add new function to handle creating subdepartments

  const handleCreateSubDepartments = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addingSubDepartmentsTo) return;

    // Filter out empty subdepartment names
    const validSubDepartments = newSubDepartmentInputs.filter(
      (input) => input.name.trim() !== ""
    );

    if (validSubDepartments.length === 0) {
      toast({
        title: "שגיאה",
        description: "יש להזין לפחות תת-מסגרת אחת",
        variant: "destructive",
      });
      return;
    }

    // Get the department
    const department = departments.find(
      (dept) => dept._id === addingSubDepartmentsTo
    );
    if (!department) {
      toast({
        title: "שגיאה",
        description: "לא נמצאה המסגרת המבוקשת",
        variant: "destructive",
      });
      return;
    }

    // Calculate total numOfPeople from existing subdepartments
    const existingSubDepartments = subDepartments.filter(
      (subDept) => subDept.departmentId === addingSubDepartmentsTo
    );
    const existingTotalPeople = existingSubDepartments.reduce(
      (sum, subDept) => sum + subDept.numOfPeople,
      0
    );

    // Calculate total numOfPeople from new subdepartments
    const newTotalPeople = validSubDepartments.reduce(
      (sum, subDept) => sum + subDept.numOfPeople,
      0
    );

    // Check if the total sum exceeds the department's numOfPeople
    if (existingTotalPeople + newTotalPeople > department.numOfPeople) {
      setValidationAction(() => async () => {
        try {
          // Create all subdepartments
          const createdSubDepartments = await Promise.all(
            validSubDepartments.map(async (input) => {
              const newSubDepartment = await subDepartmentService.create({
                name: input.name,
                departmentId: addingSubDepartmentsTo,
                numOfPeople: input.numOfPeople,
              });
              return newSubDepartment;
            })
          );

          // Update local state
          setSubDepartments([...subDepartments, ...createdSubDepartments]);

          // Reset form
          setAddingSubDepartmentsTo(null);
          setNewSubDepartmentInputs([{ name: "", numOfPeople: 0 }]);

          toast({
            title: "תתי-מסגרות נוספו",
            description: `${createdSubDepartments.length} תתי-מסגרות נוספו בהצלחה`,
          });
        } catch (error) {
          console.error("Error creating subdepartments:", error);
          toast({
            title: "שגיאה",
            description: "אירעה שגיאה בעת יצירת תתי-המסגרות",
            variant: "destructive",
          });
        }
      });
      setShowValidationAlert(true);
      return;
    }

    // If validation passes, proceed with creation
    try {
      // Create all subdepartments
      const createdSubDepartments = await Promise.all(
        validSubDepartments.map(async (input) => {
          const newSubDepartment = await subDepartmentService.create({
            name: input.name,
            departmentId: addingSubDepartmentsTo,
            numOfPeople: input.numOfPeople,
          });
          return newSubDepartment;
        })
      );

      // Update local state
      setSubDepartments([...subDepartments, ...createdSubDepartments]);

      // Reset form
      setAddingSubDepartmentsTo(null);
      setNewSubDepartmentInputs([{ name: "", numOfPeople: 0 }]);

      toast({
        title: "תתי-מסגרות נוספו",
        description: `${createdSubDepartments.length} תתי-מסגרות נוספו בהצלחה`,
      });
    } catch (error) {
      console.error("Error creating subdepartments:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת יצירת תתי-המסגרות",
        variant: "destructive",
      });
    }
  };

  const [
    editingDepartmentWithSubDepartments,
    setEditingDepartmentWithSubDepartments,
  ] = useState<string | null>(null);
  const [
    editDepartmentWithSubDepartmentsName,
    setEditDepartmentWithSubDepartmentsName,
  ] = useState("");
  const [
    editDepartmentWithSubDepartmentsNumOfPeople,
    setEditDepartmentWithSubDepartmentsNumOfPeople,
  ] = useState(0);
  const [
    editDepartmentWithSubDepartmentsSubDepartments,
    setEditDepartmentWithSubDepartmentsSubDepartments,
  ] = useState<{ _id: string; name: string; numOfPeople: number }[]>([]);

  // Add new function to handle editing department with subdepartments
  const startEditDepartmentWithSubDepartments = (departmentId: string) => {
    const department = departments.find((d) => d._id === departmentId);
    if (department) {
      setEditingDepartmentWithSubDepartments(departmentId);
      setEditDepartmentWithSubDepartmentsName(department.name);
      setEditDepartmentWithSubDepartmentsNumOfPeople(department.numOfPeople);

      // Get all subdepartments for this department
      const departmentSubDepartments = subDepartments
        .filter((subDept) => subDept.departmentId === departmentId)
        .map((subDept) => ({
          _id: subDept._id,
          name: subDept.name,
          numOfPeople: subDept.numOfPeople,
        }));

      setEditDepartmentWithSubDepartmentsSubDepartments(
        departmentSubDepartments
      );
    }
  };

  // Add new function to handle saving edited department with subdepartments
  const saveEditDepartmentWithSubDepartments = async () => {
    if (!editingDepartmentWithSubDepartments) return;

    // Calculate the sum of all subdepartments' numOfPeople
    const totalSubDepartmentsPeople =
      editDepartmentWithSubDepartmentsSubDepartments.reduce(
        (sum, subDept) => sum + subDept.numOfPeople,
        0
      );

    // Check if the sum exceeds the department's numOfPeople
    if (
      totalSubDepartmentsPeople > editDepartmentWithSubDepartmentsNumOfPeople
    ) {
      setValidationAction(() => async () => {
        try {
          // Update department
          const updatedDepartment = await departmentService.update(
            editingDepartmentWithSubDepartments,
            {
              name: editDepartmentWithSubDepartmentsName,
              numOfPeople: editDepartmentWithSubDepartmentsNumOfPeople,
            }
          );

          // Update subdepartments
          const updatedSubDepartments = await Promise.all(
            editDepartmentWithSubDepartmentsSubDepartments.map(
              async (subDept) => {
                return await subDepartmentService.update(subDept._id, {
                  name: subDept.name,
                  numOfPeople: subDept.numOfPeople,
                  departmentId: editingDepartmentWithSubDepartments,
                });
              }
            )
          );

          // Update local state
          setDepartments(
            departments.map((d) =>
              d._id === editingDepartmentWithSubDepartments
                ? updatedDepartment
                : d
            )
          );
          setSubDepartments(
            subDepartments.map((subDept) => {
              const updatedSubDept = updatedSubDepartments.find(
                (usd) => usd._id === subDept._id
              );
              return updatedSubDept || subDept;
            })
          );

          // Reset editing state
          setEditingDepartmentWithSubDepartments(null);
          setEditDepartmentWithSubDepartmentsName("");
          setEditDepartmentWithSubDepartmentsNumOfPeople(0);
          setEditDepartmentWithSubDepartmentsSubDepartments([]);

          toast({
            title: "הצלחה",
            description: "המסגרת ותתי-המסגרות עודכנו בהצלחה",
          });
        } catch (error) {
          console.error(
            "Error updating department with subdepartments:",
            error
          );
          toast({
            title: "שגיאה",
            description: "אירעה שגיאה בעת עדכון המסגרת ותתי-המסגרות",
            variant: "destructive",
          });
        }
      });
      setShowValidationAlert(true);
      return;
    }

    // If validation passes, proceed with update
    try {
      // Update department
      const updatedDepartment = await departmentService.update(
        editingDepartmentWithSubDepartments,
        {
          name: editDepartmentWithSubDepartmentsName,
          numOfPeople: editDepartmentWithSubDepartmentsNumOfPeople,
        }
      );

      // Update subdepartments
      const updatedSubDepartments = await Promise.all(
        editDepartmentWithSubDepartmentsSubDepartments.map(async (subDept) => {
          return await subDepartmentService.update(subDept._id, {
            name: subDept.name,
            numOfPeople: subDept.numOfPeople,
            departmentId: editingDepartmentWithSubDepartments,
          });
        })
      );

      // Update local state
      setDepartments(
        departments.map((d) =>
          d._id === editingDepartmentWithSubDepartments ? updatedDepartment : d
        )
      );
      setSubDepartments(
        subDepartments.map((subDept) => {
          const updatedSubDept = updatedSubDepartments.find(
            (usd) => usd._id === subDept._id
          );
          return updatedSubDept || subDept;
        })
      );

      // Reset editing state
      setEditingDepartmentWithSubDepartments(null);
      setEditDepartmentWithSubDepartmentsName("");
      setEditDepartmentWithSubDepartmentsNumOfPeople(0);
      setEditDepartmentWithSubDepartmentsSubDepartments([]);

      toast({
        title: "הצלחה",
        description: "המסגרת ותתי-המסגרות עודכנו בהצלחה",
      });
    } catch (error) {
      console.error("Error updating department with subdepartments:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת עדכון המסגרת ותתי-המסגרות",
        variant: "destructive",
      });
    }
  };

  // Add new function to handle canceling edit
  const cancelEditDepartmentWithSubDepartments = () => {
    setEditingDepartmentWithSubDepartments(null);
    setEditDepartmentWithSubDepartmentsName("");
    setEditDepartmentWithSubDepartmentsNumOfPeople(0);
    setEditDepartmentWithSubDepartmentsSubDepartments([]);
  };

  // Add new function to handle subdepartment input changes
  const handleEditSubDepartmentChange = (
    index: number,
    field: "name" | "numOfPeople",
    value: string | number
  ) => {
    const newSubDepartments = [
      ...editDepartmentWithSubDepartmentsSubDepartments,
    ];
    newSubDepartments[index] = {
      ...newSubDepartments[index],
      [field]: value,
    };
    setEditDepartmentWithSubDepartmentsSubDepartments(newSubDepartments);
  };

  // Add new state for validation alert
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationAction, setValidationAction] = useState<(() => void) | null>(
    null
  );

  // Add new function to fetch admins
  const fetchAdmins = async () => {
    try {
      const response = await adminService.getAll();
      setAdmins(response);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת טעינת רשימת המנהלים",
        variant: "destructive",
      });
    }
  };

  // Fetch admins on component mount
  useEffect(() => {
    if (admin?.role === "generalAdmin") {
      fetchAdmins();
    }
  }, [admin?.role]);

  // Add new function to handle password reset
  const handlePasswordReset = async (adminId: string) => {
    if (newPassword.length < 6) {
      toast({
        title: "שגיאה",
        description: "הסיסמה חייבת להכיל לפחות 6 תווים",
        variant: "destructive",
      });
      return;
    }

    try {
      await adminService.resetPassword(adminId, newPassword);
      toast({
        title: "הצלחה",
        description: "הסיסמה אופסה בהצלחה",
      });
      setResettingPasswordFor(null);
      setNewPassword("");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת איפוס הסיסמה",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout activeTab="settings">
      <div className="space-y-6 animate-fade-up">
        {/* Validation Alert Dialog */}
        <AlertDialog
          open={showValidationAlert}
          onOpenChange={setShowValidationAlert}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-end">
                אזהרה
              </AlertDialogTitle>
              <AlertDialogDescription className="flex items-end text-right">
                סכום מספר האנשים בתתי-המסגרות גדול ממספר האנשים במסגרת. האם אתה
                בטוח שברצונך להמשיך?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex justify-start w-full gap-5">
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (validationAction) {
                    validationAction();
                  }
                  setShowValidationAlert(false);
                  setValidationAction(null);
                }}
              >
                המשך
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
        >
          <AlertDialogContent>
            {!(
              deleteItemType === "department" &&
              subDepartments.filter(
                (subDept) => subDept.departmentId === deletingDepartmentId
              ).length > 0
            ) && (
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-end">
                  האם אתה בטוח שברצונך למחוק?
                </AlertDialogTitle>
                <AlertDialogDescription className="flex items-end text-right">
                  אתה עומד למחוק{" "}
                  {deleteItemType === "base"
                    ? `את הבסיס "${deleteItemName}"`
                    : deleteItemType === "department"
                    ? `את המסגרת "${deleteItemName}"`
                    : `את תת-המסגרת "${deleteItemName}"`}
                  . פעולה זו אינה ניתנת לביטול.
                </AlertDialogDescription>
              </AlertDialogHeader>
            )}
            {deleteItemType === "department" && (
              <div className="space-y-4 py-4">
                {subDepartments.filter(
                  (subDept) => subDept.departmentId === deletingDepartmentId
                ).length > 0 && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p
                      className="text-sm text-muted-foreground mb-2"
                      style={{ textAlign: "right" }}
                    >
                      לא ניתן למחוק את המסגרת מכיוון שיש לה תת-מסגרות. יש למחוק
                      תחילה את תת-המסגרות הבאות:
                    </p>
                    <ul className="space-y-2" style={{ textAlign: "right" }}>
                      {subDepartments
                        .filter(
                          (subDept) =>
                            subDept.departmentId === deletingDepartmentId
                        )
                        .slice(0, 3)
                        .map((subDept) => (
                          <li
                            key={subDept._id}
                            className="flex items-center gap-2"
                          >
                            <span>{subDept.name}</span>
                          </li>
                        ))}
                      {subDepartments.filter(
                        (subDept) =>
                          subDept.departmentId === deletingDepartmentId
                      ).length > 3 && (
                        <li className="text-muted-foreground text-sm">
                          ועוד{" "}
                          {subDepartments.filter(
                            (subDept) =>
                              subDept.departmentId === deletingDepartmentId
                          ).length - 3}{" "}
                          תת-מסגרות...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {deleteItemType === "subdepartment" && (
              <div className="space-y-4 py-4">
                {traineesInSubDepartment.length > 0 && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4
                      className="font-medium mb-2"
                      style={{ textAlign: "right" }}
                    >
                      חניכים בתת-המסגרת:
                    </h4>
                    <ul className="space-y-2" style={{ textAlign: "right" }}>
                      {traineesInSubDepartment.slice(0, 3).map((trainee) => (
                        <li
                          key={trainee._id}
                          className="flex items-center gap-2"
                        >
                          <span>{trainee.fullName}</span>
                          <span className="text-muted-foreground text-sm">
                            ({trainee.personalId})
                          </span>
                        </li>
                      ))}
                      {traineesInSubDepartment.length > 3 && (
                        <li className="text-muted-foreground text-sm">
                          ועוד {traineesInSubDepartment.length - 3} חניכים...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ textAlign: "right" }}
                  >
                    בחר מסגרת חדשה להעברת החניכים
                  </label>
                  <Select
                    value={transferDepartmentId}
                    onValueChange={(value) => setTransferDepartmentId(value)}
                  >
                    <SelectTrigger
                      className="input-field"
                      style={{ textAlign: "right" }}
                    >
                      <SelectValue placeholder="בחר מסגרת" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments
                        .filter((dept) => {
                          // Get the original department
                          const originalSubDept = subDepartments.find(
                            (subDept) => subDept._id === deletingSubDepartmentId
                          );
                          if (!originalSubDept) return false;
                          const originalDept = departments.find(
                            (d) => d._id === originalSubDept.departmentId
                          );
                          if (!originalDept) return false;

                          // Only show departments from the same base
                          return dept.baseId === originalDept.baseId;
                        })
                        .map((dept) => (
                          <SelectItem
                            key={dept._id}
                            value={dept._id}
                            className="flex justify-end"
                          >
                            {dept.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {transferDepartmentId && (
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ textAlign: "right" }}
                    >
                      בחר תת-מסגרת חדשה להעברת החניכים
                    </label>
                    <Select
                      value={transferSubDepartmentId}
                      onValueChange={(value) =>
                        setTransferSubDepartmentId(value)
                      }
                    >
                      <SelectTrigger
                        className="input-field"
                        style={{ textAlign: "right" }}
                      >
                        <SelectValue placeholder="בחר תת-מסגרת" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubDepartments.map((subDept) => (
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
                )}
              </div>
            )}
            <AlertDialogFooter className="flex justify-start w-full gap-5">
              <AlertDialogCancel onClick={handleDeleteCancel}>
                ביטול
              </AlertDialogCancel>
              {!(
                deleteItemType === "department" &&
                subDepartments.filter(
                  (subDept) => subDept.departmentId === deletingDepartmentId
                ).length > 0
              ) && (
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className={`
                    bg-destructive 
                    text-destructive-foreground 
                    ${
                      deleteItemType === "subdepartment" &&
                      (!transferDepartmentId || !transferSubDepartmentId)
                        ? "cursor-pointer opacity-50"
                        : "cursor-pointer"
                    }
                  `}
                  disabled={
                    deleteItemType === "subdepartment" &&
                    (!transferDepartmentId || !transferSubDepartmentId)
                  }
                >
                  {deleteItemType === "subdepartment" ? "עדכן ומחק" : "מחק"}
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">הגדרות</h2>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
          }}
        >
          <TabsList>
            {admin?.role === "generalAdmin" && (
              <>
                <TabsTrigger value="bases">ניהול בסיסים</TabsTrigger>
                <TabsTrigger value="admins">ניהול מנהלים</TabsTrigger>
              </>
            )}
            <TabsTrigger value="departments-with-subdepartments">
              ניהול מסגרות
            </TabsTrigger>
          </TabsList>

          {/* Admins Tab (allBasesAdmin only) */}
          {admin?.role === "generalAdmin" && (
            <TabsContent value="admins" className="pt-6">
              <div className="space-y-6">
                <div className="flex gap-6" style={{ direction: "rtl" }}>
                  {/* Admin Form */}
                  <div className="w-1/2">
                    <Card>
                      <CardHeader>
                        <h3 className="font-semibold text-lg">הוספת מנהל חדש</h3>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleAddAdmin} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="username">שם משתמש</Label>
                              <Input
                                id="username"
                                value={newAdminUsername}
                                onChange={(e) =>
                                  setNewAdminUsername(e.target.value)
                                }
                                required
                                style={{ direction: "rtl" }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="password">סיסמה (מינימום 6 תווים)</Label>
                              <Input
                                id="password"
                                type="password"
                                value={newAdminPassword}
                                onChange={(e) =>
                                  setNewAdminPassword(e.target.value)
                                }
                                required
                                minLength={6}
                                style={{ direction: "rtl" }}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role">תפקיד</Label>
                            <Select
                              value={newAdminRole}
                              onValueChange={(value: "generalAdmin" | "gymAdmin") =>
                                setNewAdminRole(value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="בחר תפקיד" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="generalAdmin" className="flex justify-end">
                                  מנהל כללי
                                </SelectItem>
                                <SelectItem value="gymAdmin" className="flex justify-end">מנהל חדר כושר</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {newAdminRole === "gymAdmin" && (
                            <div className="space-y-2">
                              <Label htmlFor="baseId">בסיס</Label>
                              <Select
                                value={selectedBaseForAdmin || ""}
                                onValueChange={(value) =>
                                  setSelectedBaseForAdmin(value)
                                }
                              >
                                <SelectTrigger >
                                  <SelectValue placeholder="בחר בסיס" />
                                </SelectTrigger>
                                <SelectContent>
                                  {bases.map((base) => (
                                    <SelectItem key={base._id} value={base._id} className="flex justify-end">
                                      {base.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          <Button type="submit" className="w-full">
                            הוסף מנהל
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Admins Table */}
                  <div className="w-1/2">
                    <Card>
                      <CardHeader>
                        <CardTitle>רשימת מנהלים</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead style={{ textAlign: "right" }}>שם משתמש</TableHead>
                              <TableHead style={{ textAlign: "right" }}>תפקיד</TableHead>
                              <TableHead style={{ textAlign: "right" }}>בסיס</TableHead>
                              <TableHead style={{ textAlign: "right" }}>פעולות</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {admins.map((admin) => (
                              <TableRow key={admin._id}>
                                <TableCell style={{ textAlign: "right" }}>{admin.username}</TableCell>
                                <TableCell style={{ textAlign: "right" }}>
                                  {admin.role === "generalAdmin"
                                    ? "מנהל כללי"
                                    : "מנהל חדר כושר"}
                                </TableCell>
                                <TableCell style={{ textAlign: "right" }}>
                                  {admin.baseId
                                    ? bases.find((b) => b._id === admin.baseId)
                                        ?.name
                                    : "-"}
                                </TableCell>
                                <TableCell style={{ textAlign: "right" }}>
                                  {resettingPasswordFor === admin._id ? (
                                    <div className="flex items-center gap-2" style={{ direction: "rtl" }}>
                                      <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="הזן סיסמה חדשה"
                                        className="max-w-[200px]"
                                        style={{ direction: "rtl" }}
                                      />
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setResettingPasswordFor(null);
                                          setNewPassword("");
                                        }}
                                        className="h-8 w-8 p-0"
                                      >
                                        <XIcon className="h-4 w-4 text-red-600" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handlePasswordReset(admin._id)}
                                        className="h-8 w-8 p-0"
                                        disabled={newPassword.length < 6}
                                      >
                                        <CheckIcon className="h-4 w-4 text-green-600" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setResettingPasswordFor(admin._id)}
                                    >
                                      איפוס סיסמה
                                      <KeyIcon className="h-4 w-4 ml-2" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* New tab for creating departments with subdepartments */}
          <TabsContent value="departments-with-subdepartments" className="pt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2"
                style={{ direction: "rtl" }}>
              <div
                className="bg-card shadow-sm rounded-lg border p-6 h-fit"
                style={{ direction: "rtl" }}
              >
                {editingDepartmentWithSubDepartments ? (
                  <>
                    <h3 className="font-semibold text-lg mb-4">עריכת מסגרת</h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        saveEditDepartmentWithSubDepartments();
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          שם המסגרת
                        </label>
                        <input
                          type="text"
                          value={editDepartmentWithSubDepartmentsName}
                          onChange={(e) =>
                            setEditDepartmentWithSubDepartmentsName(
                              e.target.value
                            )
                          }
                          className="input-field"
                          placeholder="שם המסגרת"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          מספר אנשים
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editDepartmentWithSubDepartmentsNumOfPeople}
                          onChange={(e) =>
                            setEditDepartmentWithSubDepartmentsNumOfPeople(
                              Number(e.target.value)
                            )
                          }
                          className="input-field"
                          placeholder="מספר אנשים"
                        />
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">תתי-מסגרות</h4>
                        {editDepartmentWithSubDepartmentsSubDepartments.map(
                          (subDept, index) => (
                            <div key={subDept._id} className="flex gap-2">
                              <Input
                                value={subDept.name}
                                onChange={(e) =>
                                  handleEditSubDepartmentChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                placeholder="שם תת-מסגרת"
                              />
                              <Input
                                type="number"
                                min="0"
                                value={subDept.numOfPeople}
                                onChange={(e) =>
                                  handleEditSubDepartmentChange(
                                    index,
                                    "numOfPeople",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="מספר אנשים"
                                className="w-24"
                              />
                            </div>
                          )
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                          שמירה
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelEditDepartmentWithSubDepartments}
                        >
                          ביטול
                        </Button>
                      </div>
                    </form>
                  </>
                ) : addingSubDepartmentsTo ? (
                  <>
                    <h3 className="font-semibold text-lg mb-4">
                      הוספת תתי-מסגרות
                    </h3>
                    <form
                      onSubmit={handleCreateSubDepartments}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          מסגרת
                        </label>
                        <input
                          type="text"
                          value={getDepartmentName(addingSubDepartmentsTo)}
                          className="input-field bg-muted/50 cursor-not-allowed opacity-80 hover:bg-muted/50 focus:bg-muted/50 focus:ring-0 focus:outline-none"
                          readOnly
                        />
                      </div>

                      {admin?.role === "generalAdmin" && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            בסיס
                          </label>
                          <input
                            type="text"
                            value={getBaseName(
                              departments.find(
                                (dept) => dept._id === addingSubDepartmentsTo
                              )?.baseId || ""
                            )}
                            className="input-field bg-muted/50 cursor-not-allowed opacity-80 hover:bg-muted/50 focus:bg-muted/50 focus:ring-0 focus:outline-none"
                            readOnly
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        {newSubDepartmentInputs.map((input, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={input.name}
                              onChange={(e) =>
                                handleNewSubDepartmentInputChange(
                                  index,
                                  e.target.value
                                )
                              }
                              placeholder="שם תת-מסגרת"
                            />
                            <Input
                              type="number"
                              min="0"
                              value={input.numOfPeople}
                              onChange={(e) =>
                                handleNewSubDepartmentNumOfPeopleChange(
                                  index,
                                  Number(e.target.value)
                                )
                              }
                              placeholder="מספר אנשים"
                              className="w-24"
                            />
                            {index === newSubDepartmentInputs.length - 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleNewSubDepartmentInput}
                              >
                                <PlusIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                          יצירה
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setAddingSubDepartmentsTo(null);
                            setNewSubDepartmentInputs([
                              { name: "", numOfPeople: 0 },
                            ]);
                          }}
                        >
                          ביטול
                        </Button>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-lg mb-4">
                      יצירת מסגרת חדשה
                    </h3>
                    <form
                      onSubmit={handleCreateDepartmentWithSubDepartments}
                      className="space-y-4"
                    >
                      <div>
                        <label
                          htmlFor="newDepartmentName"
                          className="block text-sm font-medium mb-1"
                        >
                          שם המסגרת
                        </label>
                        <input
                          id="newDepartmentName"
                          type="text"
                          value={newDepartmentName}
                          onChange={(e) => setNewDepartmentName(e.target.value)}
                          className="input-field"
                          placeholder="הזן שם מסגרת"
                          required
                          autoComplete="off"
                        />
                      </div>

                      {admin?.role === "generalAdmin" && (
                        <div>
                          <label
                            htmlFor="newDepartmentBase"
                            className="block text-sm font-medium mb-1"
                          >
                            בסיס
                          </label>
                          <Select
                            value={selectedBaseForNewDepartment}
                            onValueChange={(value) => setSelectedBaseForNewDepartment(value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="בחר בסיס" />
                            </SelectTrigger>
                            <SelectContent>
                              {bases.map((base) => (
                                <SelectItem key={base._id} value={base._id} className="flex justify-end">
                                  {base.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div>
                        <label
                          htmlFor="newDepartmentNumOfPeople"
                          className="block text-sm font-medium mb-1"
                        >
                          מספר אנשים
                        </label>
                        <input
                          id="newDepartmentNumOfPeople"
                          type="number"
                          min="0"
                          value={newDepartmentNumOfPeople}
                          onChange={(e) =>
                            setNewDepartmentNumOfPeople(Number(e.target.value))
                          }
                          className="input-field"
                          placeholder="הזן מספר אנשים"
                        />
                      </div>

                      <div className="space-y-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setShowSubDepartmentsForm(!showSubDepartmentsForm)
                          }
                          className="w-full"
                        >
                          {showSubDepartmentsForm
                            ? "הסתר תתי-מסגרות"
                            : "הוספת תתי-מסגרות"}
                        </Button>

                        {showSubDepartmentsForm && (
                          <div className="space-y-2">
                            {subDepartmentInputs.map((input, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={input.name}
                                  onChange={(e) =>
                                    handleSubDepartmentInputChange(
                                      index,
                                      e.target.value
                                    )
                                  }
                                  placeholder="שם תת-מסגרת"
                                />
                                <Input
                                  type="number"
                                  min="0"
                                  value={input.numOfPeople}
                                  onChange={(e) =>
                                    handleSubDepartmentNumOfPeopleChange(
                                      index,
                                      Number(e.target.value)
                                    )
                                  }
                                  placeholder="מספר אנשים"
                                  className="w-24"
                                />
                                {index === subDepartmentInputs.length - 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleAddSubDepartmentInput}
                                  >
                                    <PlusIcon className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button type="submit" className="w-full">
                        יצירה
                      </Button>
                    </form>
                  </>
                )}
              </div>

              <div
                className="bg-card shadow-sm rounded-lg border p-6"
                style={{ direction: "rtl" }}
              >
                {/* Departments with subdepartments tab */}
                <div style={{ direction: "rtl" }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">מסגרות קיימות</h3>
                    {admin?.role === "generalAdmin" && (
                      <Select
                        value={selectedBaseFilter}
                        onValueChange={(value) => setSelectedBaseFilter(value)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="בחר בסיס" />
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
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="חיפוש מסגרות ותתי-מסגרות..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 pr-8"
                      />
                      {searchQuery && (
                        <button
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setSearchQuery("");
                            setSearchResults(null);
                            setSearchSuggestions({
                              departments: [],
                              subDepartments: [],
                            });
                            setOpenAccordionItems([]);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <Accordion
                    type="multiple"
                    className="w-full"
                    value={openAccordionItems}
                    onValueChange={setOpenAccordionItems}
                  >
                    {(searchResults ? searchResults.departments : departments)
                      .filter(
                        (dept) =>
                          (admin?.role === "generalAdmin" ||
                            dept.baseId === admin?.baseId) &&
                          (selectedBaseFilter === "all" ||
                            dept.baseId === selectedBaseFilter)
                      )
                      .map((department) => {
                        // Get all subdepartments for this department
                        const allDepartmentSubDepartments =
                          subDepartments.filter(
                            (subDept) => subDept.departmentId === department._id
                          );

                        // Get matching subdepartments from search results
                        const matchingSubDepartments = searchResults
                          ? searchResults.subDepartments.filter(
                              (subDept) =>
                                subDept.departmentId === department._id
                            )
                          : [];

                        // Show all departments when not searching
                        if (!searchQuery) {
                          return (
                            <AccordionItem
                              key={department._id}
                              value={department._id}
                            >
                              <AccordionTrigger className="flex justify-between">
                                <div className="flex flex-row gap-2 items-center">
                                  <span>{department.name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    ({department.numOfPeople} אנשים)
                                  </span>
                                  {admin?.role === "generalAdmin" && (
                                    <span className="text-sm text-muted-foreground">
                                      ({getBaseName(department.baseId)})
                                    </span>
                                  )}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <ul className="space-y-2">
                                  {allDepartmentSubDepartments.map(
                                    (subDept) => (
                                      <li
                                        key={subDept._id}
                                        className="flex items-center gap-2"
                                      >
                                        <span>{subDept.name}</span>
                                        <span className="text-sm text-muted-foreground">
                                          ({subDept.numOfPeople} אנשים)
                                        </span>
                                      </li>
                                    )
                                  )}
                                  <li>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        className="flex-1 flex items-center gap-2 justify-center text-muted-foreground hover:text-foreground"
                                        onClick={() => {
                                          setEditingDepartmentWithSubDepartments(null);
                                          setEditDepartmentWithSubDepartmentsName("");
                                          setEditDepartmentWithSubDepartmentsNumOfPeople(0);
                                    
                                          setAddingSubDepartmentsTo(
                                            department._id
                                          );
                                          setNewSubDepartmentInputs([
                                            { name: "", numOfPeople: 0 },
                                          ]);
                                        }}
                                      >
                                        <PlusIcon className="h-4 w-4" />
                                        <span>הוספת תת-מסגרת חדשה</span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        className="flex items-center gap-2 justify-center text-muted-foreground hover:text-foreground"
                                        onClick={() =>
                                          startEditDepartmentWithSubDepartments(
                                            department._id
                                          )
                                        }
                                      >
                                        <PencilIcon className="h-4 w-4" />
                                        <span>עריכה</span>
                                      </Button>
                                    </div>
                                  </li>
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        }

                        // When searching, only show departments that have matching subdepartments or match the search query themselves
                        if (
                          searchResults &&
                          matchingSubDepartments.length === 0 &&
                          !searchResults.departments.find(
                            (d) => d._id === department._id
                          )
                        ) {
                          return null;
                        }

                        return (
                          <AccordionItem
                            key={department._id}
                            value={department._id}
                          >
                            <AccordionTrigger className="flex justify-between">
                              <div className="flex flex-row gap-2 items-center">
                                <span>{department.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  ({department.numOfPeople} אנשים)
                                </span>
                                {admin?.role === "generalAdmin" && (
                                  <span className="text-sm text-muted-foreground">
                                    ({getBaseName(department.baseId)})
                                  </span>
                                )}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2">
                                {allDepartmentSubDepartments.map((subDept) => (
                                  <li
                                    key={subDept._id}
                                    className={`flex items-center gap-2 ${
                                      matchingSubDepartments.some(
                                        (matching) =>
                                          matching._id === subDept._id
                                      )
                                        ? "font-bold"
                                        : ""
                                    }`}
                                  >
                                    <span>{subDept.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                      ({subDept.numOfPeople} אנשים)
                                    </span>
                                  </li>
                                ))}
                                <li>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      className="flex-1 flex items-center gap-2 justify-center text-muted-foreground hover:text-foreground"
                                      onClick={() => {
                                        setAddingSubDepartmentsTo(
                                          department._id
                                        );
                                        setNewSubDepartmentInputs([
                                          { name: "", numOfPeople: 0 },
                                        ]);
                                      }}
                                    >
                                      <PlusIcon className="h-4 w-4" />
                                      <span>הוספת תת-מסגרת חדשה</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      className="flex items-center gap-2 justify-center text-muted-foreground hover:text-foreground"
                                      onClick={() =>
                                        startEditDepartmentWithSubDepartments(
                                          department._id
                                        )
                                      }
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                      <span>עריכה</span>
                                    </Button>
                                  </div>
                                </li>
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                  </Accordion>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Bases Tab (allBasesAdmin only) */}
          {admin?.role === "generalAdmin" && (
            <TabsContent value="bases" className="pt-6">
              <div
                className="grid grid-cols-1 gap-6 md:grid-cols-2"
                style={{ direction: "rtl" }}
              >
                <div
                  className="bg-card shadow-sm rounded-lg border p-6"
                  style={{ direction: "rtl" }}
                >
                  <h3 className="font-semibold text-lg mb-4">הוספת בסיס חדש</h3>
                  <form onSubmit={handleAddBase} className="space-y-4">
                    <div>
                      <label
                        htmlFor="baseName"
                        className="block text-sm font-medium mb-1"
                      >
                        שם הבסיס
                      </label>
                      <input
                        id="baseName"
                        type="text"
                        value={newBaseName}
                        onChange={(e) => setNewBaseName(e.target.value)}
                        className="input-field"
                        placeholder="הזן שם בסיס"
                        required
                        autoComplete="off"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="baseLocation"
                        className="block text-sm font-medium mb-1"
                      >
                        מיקום
                      </label>
                      <input
                        id="baseLocation"
                        type="text"
                        value={newBaseLocation}
                        onChange={(e) => setNewBaseLocation(e.target.value)}
                        className="input-field"
                        placeholder="הזן מיקום"
                        required
                        autoComplete="off"
                      />
                    </div>

                    <button type="submit" className="btn-primary w-full">
                      הוסף בסיס
                    </button>
                  </form>
                </div>

                <div className="bg-card shadow-sm rounded-lg border overflow-hidden">
                  <div className="p-4 bg-muted" style={{ direction: "rtl" }}>
                    <h3 className="font-semibold text-lg">בסיסים קיימים</h3>
                  </div>
                  <div className="overflow-x-auto" style={{ direction: "rtl" }}>
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-right">שם הבסיס</th>
                          <th className="px-4 py-3 text-right">מיקום</th>
                          <th className="px-4 py-3 text-right">מספר מסגרות</th>
                          <th className="px-4 py-3 text-center">פעולות</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bases.map((base) => (
                          <tr
                            key={base._id}
                            className="border-t hover:bg-muted/30"
                          >
                            <td className="px-4 py-3">
                              {editingBaseId === base._id ? (
                                <Input
                                  value={editBaseName}
                                  onChange={(e) =>
                                    setEditBaseName(e.target.value)
                                  }
                                  className="max-w-[200px]"
                                />
                              ) : (
                                base.name
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {editingBaseId === base._id ? (
                                <Input
                                  value={editBaseLocation}
                                  onChange={(e) =>
                                    setEditBaseLocation(e.target.value)
                                  }
                                  className="max-w-[200px]"
                                />
                              ) : (
                                base.location
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {
                                departments.filter(
                                  (dept) => dept.baseId === base._id
                                ).length
                              }
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center space-x-2 space-x-reverse">
                                {editingBaseId === base._id ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => saveEditBase(base._id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <CheckIcon className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={cancelEditBase}
                                      className="h-8 w-8 p-0"
                                    >
                                      <XIcon className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => startEditBase(base._id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <PencilIcon className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        confirmDeleteBase(base._id)
                                      }
                                      className="h-8 w-8 p-0"
                                    >
                                      <TrashIcon className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
