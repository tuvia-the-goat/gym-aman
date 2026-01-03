import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PencilIcon, TrashIcon, PlusIcon, Search, X } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { departmentService, subDepartmentService, traineeService, baseService } from "../../services/api";
import { Department, SubDepartment, Base, Trainee } from "../../types";

interface DepartmentsTabProps {
  admin: any;
}

const DepartmentsTab: React.FC<DepartmentsTabProps> = ({
  admin
}) => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subDepartments, setSubDepartments] = useState<SubDepartment[]>([]);
  const [bases, setBases] = useState<Base[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentNumOfPeople, setNewDepartmentNumOfPeople] = useState(0);
  const [selectedBaseForNewDepartment, setSelectedBaseForNewDepartment] = useState("");
  const [showSubDepartmentsForm, setShowSubDepartmentsForm] = useState(false);
  const [subDepartmentInputs, setSubDepartmentInputs] = useState<{ name: string; numOfPeople: number }[]>([
    { name: "", numOfPeople: 0 },
  ]);
  const [addingSubDepartmentsTo, setAddingSubDepartmentsTo] = useState<string | null>(null);
  const [selectedBaseFilter, setSelectedBaseFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    departments: Department[];
    subDepartments: SubDepartment[];
  } | null>(null);
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedSubDepartments, setLoadedSubDepartments] = useState<{[key: string]: SubDepartment[]}>({});
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });
  const loadingRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationAction, setValidationAction] = useState<(() => void) | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState<"department" | "subdepartment">("department");
  const [deleteItemName, setDeleteItemName] = useState("");
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<string | null>(null);
  const [deletingSubDepartmentId, setDeletingSubDepartmentId] = useState<string | null>(null);
  const [transferDepartmentId, setTransferDepartmentId] = useState("");
  const [transferSubDepartmentId, setTransferSubDepartmentId] = useState("");
  const [availableSubDepartments, setAvailableSubDepartments] = useState<SubDepartment[]>([]);
  const [traineesInSubDepartment, setTraineesInSubDepartment] = useState<any[]>([]);
  const [editingDepartmentWithSubDepartments, setEditingDepartmentWithSubDepartments] = useState<string | null>(null);
  const [editDepartmentWithSubDepartmentsName, setEditDepartmentWithSubDepartmentsName] = useState("");
  const [editDepartmentWithSubDepartmentsNumOfPeople, setEditDepartmentWithSubDepartmentsNumOfPeople] = useState(0);
  const [editDepartmentWithSubDepartmentsSubDepartments, setEditDepartmentWithSubDepartmentsSubDepartments] = useState<{ _id: string; name: string; numOfPeople: number }[]>([]);
  const [showEditSubDepartmentsForm, setShowEditSubDepartmentsForm] = useState(false);
  const [newEditSubDepartmentInputs, setNewEditSubDepartmentInputs] = useState<{ name: string; numOfPeople: number }[]>([
    { name: "", numOfPeople: 0 },
  ]);

  // Fetch bases on component mount
  useEffect(() => {
    const fetchBases = async () => {
      try {
        const basesData = await baseService.getAll();
        setBases(basesData);
      } catch (error) {
        console.error("Error fetching bases:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת הבסיסים",
          variant: "destructive",
        });
      }
    };
    fetchBases();
  }, []);


  // Memoize filtered departments
  const filteredDepartments = useMemo(() => {
    return departments.filter(
      (dept) =>
        (admin?.role === "generalAdmin" || dept.baseId === admin?.baseId) &&
        (selectedBaseFilter === "all" || dept.baseId === selectedBaseFilter)
    );
  }, [departments, admin?.role, admin?.baseId, selectedBaseFilter]);

  // Load departments
  const loadDepartments = async (page: number) => {
    try {
      const result = await departmentService.getPaginated({
        page,
        limit: 10,
        baseId: selectedBaseFilter !== "all" ? selectedBaseFilter : undefined,
      });

      if (page === 1) {
        setDepartments(result.departments);
      } else {
        const existingIds = new Set(departments.map(dept => dept._id));
        const newDepartments = result.departments.filter(dept => !existingIds.has(dept._id));
        setDepartments([...departments, ...newDepartments]);
      }

      setHasMore(result.departments.length > 0 && page < result.pagination.pages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading departments:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת המסגרות",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Initial load effect
  useEffect(() => {
    const initialLoad = async () => {
      try {
        setIsLoading(true);
        await loadDepartments(1);
      } catch (error) {
        console.error("Error in initial load:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initialLoad();
  }, [selectedBaseFilter]); // Reload when base filter changes

  // Load more departments when scrolling
  useEffect(() => {
    const loadMore = async () => {
      if (inView && hasMore && !isLoading && !searchQuery && !loadingRef.current) {
        try {
          loadingRef.current = true;
          setIsLoading(true);
          await loadDepartments(currentPage + 1);
        } catch (error) {
          console.error("Error loading more departments:", error);
          toast({
            title: "שגיאה",
            description: "אירעה שגיאה בטעינת מסגרות נוספות",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
          loadingRef.current = false;
        }
      }
    };
    loadMore();
  }, [inView, hasMore, isLoading, currentPage, searchQuery]);

  // Load subdepartments
  const loadSubDepartments = useCallback(async (departmentId: string) => {
    try {
      const subDepts = await subDepartmentService.getByDepartment(departmentId);
      setLoadedSubDepartments(prev => ({
        ...prev,
        [departmentId]: subDepts
      }));
    } catch (error) {
      console.error("Error loading subdepartments:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת תתי-המסגרות",
        variant: "destructive",
      });
    }
  }, []);

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setHasMore(true);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setSearchResults(null);
      setOpenAccordionItems([]);
      setDepartments([]); // Clear current departments
      setIsLoading(true); // Set loading state
      try {
        await loadDepartments(1);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await departmentService.search(query);
        setSearchResults(results);
        setDepartments(results.departments);

        const departmentsWithMatchingSubdepartments = new Set(
          results.subDepartments.map((subDept) => subDept.departmentId)
        );

        setOpenAccordionItems([...departmentsWithMatchingSubdepartments]);

        const subDeptsByDepartment = results.subDepartments.reduce((acc, subDept) => {
          if (!acc[subDept.departmentId]) {
            acc[subDept.departmentId] = [];
          }
          acc[subDept.departmentId].push(subDept);
          return acc;
        }, {} as { [key: string]: SubDepartment[] });

        setLoadedSubDepartments(prev => ({
          ...prev,
          ...subDeptsByDepartment
        }));
      } catch (error) {
        console.error("Error searching departments:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בעת החיפוש",
          variant: "destructive",
        });
      }
    }, 300);
  }, []);

  // Handle accordion change
  const handleAccordionChange = (value: string[]) => {
    setOpenAccordionItems(value);
    value.forEach(deptId => {
      if (!loadedSubDepartments[deptId]) {
        loadSubDepartments(deptId);
      }
    });
  };

  // Handle creating department with subdepartments
  const handleCreateDepartmentWithSubDepartments = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDepartmentName.trim() || (!selectedBaseForNewDepartment && admin?.role === "generalAdmin")) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    const baseId = admin?.role === "generalAdmin" ? selectedBaseForNewDepartment : admin?.baseId;

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

    const validSubDepartments = subDepartmentInputs.filter(
      (input) => input.name.trim() !== ""
    );

    const totalSubDepartmentsPeople = validSubDepartments.reduce(
      (sum, subDept) => sum + subDept.numOfPeople,
      0
    );

    if (totalSubDepartmentsPeople > newDepartmentNumOfPeople) {
      setValidationAction(() => async () => {
        try {
          const result = await departmentService.createWithSubDepartments({
            name: newDepartmentName,
            baseId,
            subDepartments: validSubDepartments,
            numOfPeople: newDepartmentNumOfPeople,
          });

          setDepartments(prev => [...prev, result.department]);
          setSubDepartments(prev => [...prev, ...result.subDepartments]);

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
      });
      setShowValidationAlert(true);
      return;
    }

    try {
      const result = await departmentService.createWithSubDepartments({
        name: newDepartmentName,
        baseId,
        subDepartments: validSubDepartments,
        numOfPeople: newDepartmentNumOfPeople,
      });

      setDepartments(prev => [...prev, result.department]);
      setSubDepartments(prev => [...prev, ...result.subDepartments]);

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

  // Handle subdepartment input changes
  const handleSubDepartmentInputChange = (index: number, value: string) => {
    const newInputs = [...subDepartmentInputs];
    newInputs[index] = { ...newInputs[index], name: value };
    setSubDepartmentInputs(newInputs);
  };

  const handleSubDepartmentNumOfPeopleChange = (index: number, value: number) => {
    const newInputs = [...subDepartmentInputs];
    newInputs[index] = { ...newInputs[index], numOfPeople: value };
    setSubDepartmentInputs(newInputs);
  };

  const handleAddSubDepartmentInput = () => {
    setSubDepartmentInputs([...subDepartmentInputs, { name: "", numOfPeople: 0 }]);
  };

  // Handle delete confirmation
  const confirmDeleteDepartment = (departmentId: string) => {
    const departmentToDelete = departments.find((dept) => dept._id === departmentId);
    if (departmentToDelete) {
      setDeletingDepartmentId(departmentId);
      setDeleteItemType("department");
      setDeleteItemName(departmentToDelete.name);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDeleteSubDepartment = async (subDepartmentId: string) => {
    const subDepartmentToDelete = subDepartments.find(
      (subDept) => subDept._id === subDepartmentId
    );
    if (subDepartmentToDelete) {
      try {
        const allTrainees = await traineeService.getAll();
        const traineesInDept = allTrainees.filter(
          (trainee) => trainee.subDepartmentId === subDepartmentId
        );

        if (traineesInDept.length === 0) {
          try {
            await subDepartmentService.delete(subDepartmentId);
            
            const updatedSubDepartments = subDepartments.filter(
              (subDept) => subDept._id !== subDepartmentId
            );
            setSubDepartments(updatedSubDepartments);
            
            setLoadedSubDepartments(prev => {
              const newState = { ...prev };
              Object.keys(newState).forEach(deptId => {
                newState[deptId] = newState[deptId].filter(
                  subDept => subDept._id !== subDepartmentId
                );
              });
              return newState;
            });

            toast({
              title: "תת-מסגרת נמחקה",
              description: `תת-מסגרת ${subDepartmentToDelete.name} נמחקה בהצלחה`,
            });
            return;
          } catch (error) {
            console.error("Error deleting subdepartment:", error);
            toast({
              title: "שגיאה",
              description: "אירעה שגיאה בעת מחיקת תת-המסגרת",
              variant: "destructive",
            });
            return;
          }
        }

        setDeletingSubDepartmentId(subDepartmentId);
        setDeleteItemType("subdepartment");
        setDeleteItemName(subDepartmentToDelete.name);
        setTraineesInSubDepartment(traineesInDept);
        setTransferDepartmentId("");
        setTransferSubDepartmentId("");
        setAvailableSubDepartments([]);
        setShowDeleteConfirm(true);
      } catch (error) {
        console.error("Error fetching trainees:", error);
        setTraineesInSubDepartment([]);
      }
    }
  };

  // Handle delete operations
  const deleteDepartment = async () => {
    if (!deletingDepartmentId) return;

    try {
      await departmentService.delete(deletingDepartmentId);
      setDepartments(prev => prev.filter(
        (dept) => dept._id !== deletingDepartmentId
      ));

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

  const deleteSubDepartment = async () => {
    if (!deletingSubDepartmentId) return;

    if (!transferDepartmentId || !transferSubDepartmentId) {
      toast({
        title: "שגיאה",
        description: "יש לבחור מסגרת ותת-מסגרת חדשים להעברת החניכים",
        variant: "destructive",
      });
      return;
    }

    try {
      await traineeService.transferSubDepartment(
        deletingSubDepartmentId,
        transferSubDepartmentId
      );

      const newSubDepartment = subDepartments.find(
        (subDept) => subDept._id === transferSubDepartmentId
      );
      if (!newSubDepartment) {
        throw new Error("New subdepartment not found");
      }

      setTrainees(prev => prev.map((trainee) => {
        if (trainee.subDepartmentId === deletingSubDepartmentId) {
          return {
            ...trainee,
            subDepartmentId: transferSubDepartmentId,
            departmentId: newSubDepartment.departmentId,
          };
        }
        return trainee;
      }));

      await subDepartmentService.delete(deletingSubDepartmentId);

      setSubDepartments(prev => prev.filter(
        (subDept) => subDept._id !== deletingSubDepartmentId
      ));
      
      setLoadedSubDepartments(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(deptId => {
          newState[deptId] = newState[deptId].filter(
            subDept => subDept._id !== deletingSubDepartmentId
          );
        });
        return newState;
      });

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
      setTransferDepartmentId("");
      setTransferSubDepartmentId("");
      setAvailableSubDepartments([]);
      setTraineesInSubDepartment([]);
    }
  };

  // Update available subdepartments when transfer department changes
  useEffect(() => {
    if (transferDepartmentId) {
      const filteredSubDepartments = subDepartments.filter(
        (subDept) => subDept.departmentId === transferDepartmentId
      );
      setAvailableSubDepartments(filteredSubDepartments);
      setTransferSubDepartmentId("");
    } else {
      setAvailableSubDepartments([]);
      setTransferSubDepartmentId("");
    }
  }, [transferDepartmentId, subDepartments]);

  const startEditDepartmentWithSubDepartments = async (departmentId: string) => {
    const department = departments.find((d) => d._id === departmentId);
    if (department) {
      setEditingDepartmentWithSubDepartments(departmentId);
      setEditDepartmentWithSubDepartmentsName(department.name);
      setEditDepartmentWithSubDepartmentsNumOfPeople(department.numOfPeople);

      try {
        // Fetch subdepartments for this department
        const subDepts = await subDepartmentService.getByDepartment(departmentId);
        const formattedSubDepts = subDepts.map((subDept) => ({
          _id: subDept._id,
          name: subDept.name,
          numOfPeople: subDept.numOfPeople,
        }));
        setEditDepartmentWithSubDepartmentsSubDepartments(formattedSubDepts);
      } catch (error) {
        console.error("Error loading subdepartments:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת תתי-המסגרות",
          variant: "destructive",
        });
        setEditDepartmentWithSubDepartmentsSubDepartments([]);
      }
    }
  };

  const saveEditDepartmentWithSubDepartments = async () => {
    if (!editingDepartmentWithSubDepartments) return;

    // Calculate the sum of all subdepartments' numOfPeople
    const totalSubDepartmentsPeople = editDepartmentWithSubDepartmentsSubDepartments.reduce(
      (sum, subDept) => sum + subDept.numOfPeople,
      0
    );

    // Check if the sum exceeds the department's numOfPeople
    if (totalSubDepartmentsPeople > editDepartmentWithSubDepartmentsNumOfPeople) {
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

          // Separate existing and new subdepartments
          const existingSubDepts = editDepartmentWithSubDepartmentsSubDepartments.filter(
            subDept => !subDept._id.startsWith('new-')
          );
          const newSubDepts = editDepartmentWithSubDepartmentsSubDepartments.filter(
            subDept => subDept._id.startsWith('new-')
          );

          // Update existing subdepartments
          const updatedSubDepartments = await Promise.all(
            existingSubDepts.map(async (subDept) => {
              return await subDepartmentService.update(subDept._id, {
                name: subDept.name,
                numOfPeople: subDept.numOfPeople,
                departmentId: editingDepartmentWithSubDepartments,
              });
            })
          );

          // Create new subdepartments
          const createdSubDepartments = await Promise.all(
            newSubDepts.map(async (subDept) => {
              return await subDepartmentService.create({
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

          // Update subdepartments in local state
          const allUpdatedSubDepts = [...updatedSubDepartments, ...createdSubDepartments];
          setSubDepartments(prev => {
            const existingSubDepts = prev.filter(
              subDept => subDept.departmentId !== editingDepartmentWithSubDepartments
            );
            return [...existingSubDepts, ...allUpdatedSubDepts];
          });

          // Update loaded subdepartments
          setLoadedSubDepartments(prev => ({
            ...prev,
            [editingDepartmentWithSubDepartments]: allUpdatedSubDepts
          }));

          // Reset editing state
          setEditingDepartmentWithSubDepartments(null);
          setEditDepartmentWithSubDepartmentsName("");
          setEditDepartmentWithSubDepartmentsNumOfPeople(0);
          setEditDepartmentWithSubDepartmentsSubDepartments([]);
          setShowEditSubDepartmentsForm(false);
          setNewEditSubDepartmentInputs([{ name: "", numOfPeople: 0 }]);

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

      // Separate existing and new subdepartments
      const existingSubDepts = editDepartmentWithSubDepartmentsSubDepartments.filter(
        subDept => !subDept._id.startsWith('new-')
      );
      const newSubDepts = editDepartmentWithSubDepartmentsSubDepartments.filter(
        subDept => subDept._id.startsWith('new-')
      );

      // Update existing subdepartments
      const updatedSubDepartments = await Promise.all(
        existingSubDepts.map(async (subDept) => {
          return await subDepartmentService.update(subDept._id, {
            name: subDept.name,
            numOfPeople: subDept.numOfPeople,
            departmentId: editingDepartmentWithSubDepartments,
          });
        })
      );

      // Create new subdepartments
      const createdSubDepartments = await Promise.all(
        newSubDepts.map(async (subDept) => {
          return await subDepartmentService.create({
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

      // Update subdepartments in local state
      const allUpdatedSubDepts = [...updatedSubDepartments, ...createdSubDepartments];
      setSubDepartments(prev => {
        const existingSubDepts = prev.filter(
          subDept => subDept.departmentId !== editingDepartmentWithSubDepartments
        );
        return [...existingSubDepts, ...allUpdatedSubDepts];
      });

      // Update loaded subdepartments
      setLoadedSubDepartments(prev => ({
        ...prev,
        [editingDepartmentWithSubDepartments]: allUpdatedSubDepts
      }));

      // Reset editing state
      setEditingDepartmentWithSubDepartments(null);
      setEditDepartmentWithSubDepartmentsName("");
      setEditDepartmentWithSubDepartmentsNumOfPeople(0);
      setEditDepartmentWithSubDepartmentsSubDepartments([]);
      setShowEditSubDepartmentsForm(false);
      setNewEditSubDepartmentInputs([{ name: "", numOfPeople: 0 }]);

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

  const cancelEditDepartmentWithSubDepartments = () => {
    setEditingDepartmentWithSubDepartments(null);
    setEditDepartmentWithSubDepartmentsName("");
    setEditDepartmentWithSubDepartmentsNumOfPeople(0);
    setEditDepartmentWithSubDepartmentsSubDepartments([]);
    setShowEditSubDepartmentsForm(false);
    setNewEditSubDepartmentInputs([{ name: "", numOfPeople: 0 }]);
  };

  const handleEditSubDepartmentChange = (
    index: number,
    field: "name" | "numOfPeople",
    value: string | number
  ) => {
    const newSubDepartments = [...editDepartmentWithSubDepartmentsSubDepartments];
    newSubDepartments[index] = {
      ...newSubDepartments[index],
      [field]: value,
    };
    setEditDepartmentWithSubDepartmentsSubDepartments(newSubDepartments);
  };

  const handleNewEditSubDepartmentInputChange = (index: number, value: string) => {
    const newInputs = [...newEditSubDepartmentInputs];
    newInputs[index] = { ...newInputs[index], name: value };
    setNewEditSubDepartmentInputs(newInputs);
  };

  const handleNewEditSubDepartmentNumOfPeopleChange = (index: number, value: number) => {
    const newInputs = [...newEditSubDepartmentInputs];
    newInputs[index] = { ...newInputs[index], numOfPeople: value };
    setNewEditSubDepartmentInputs(newInputs);
  };

  const handleAddNewEditSubDepartmentInput = () => {
    setNewEditSubDepartmentInputs([...newEditSubDepartmentInputs, { name: "", numOfPeople: 0 }]);
  };

  const handleAddNewSubDepartments = () => {
    const validNewSubDepartments = newEditSubDepartmentInputs
      .filter(input => input.name.trim() !== "")
      .map(input => ({
        _id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        name: input.name,
        numOfPeople: input.numOfPeople
      }));

    setEditDepartmentWithSubDepartmentsSubDepartments([
      ...editDepartmentWithSubDepartmentsSubDepartments,
      ...validNewSubDepartments
    ]);
    setNewEditSubDepartmentInputs([{ name: "", numOfPeople: 0 }]);
    setShowEditSubDepartmentsForm(false);
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2" style={{ direction: "rtl" }}>
      <div className="bg-card shadow-sm rounded-lg border p-6 h-fit" style={{ direction: "rtl" }}>
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
                    setEditDepartmentWithSubDepartmentsName(e.target.value)
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
                    setEditDepartmentWithSubDepartmentsNumOfPeople(Number(e.target.value))
                  }
                  className="input-field"
                  placeholder="מספר אנשים"
                />
              </div>

              <div className="space-y-4">
                {editDepartmentWithSubDepartmentsSubDepartments.length > 0 && (
                  <h4 className="font-medium">תתי-מסגרות</h4>
                )}
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

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditSubDepartmentsForm(!showEditSubDepartmentsForm)}
                  className="w-full"
                >
                  {showEditSubDepartmentsForm ? "הסתר תתי-מסגרות חדשות" : "הוספת תתי-מסגרות חדשות"}
                </Button>

                {showEditSubDepartmentsForm && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {newEditSubDepartmentInputs.map((input, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={input.name}
                            onChange={(e) => handleNewEditSubDepartmentInputChange(index, e.target.value)}
                            placeholder="שם תת-מסגרת"
                          />
                          <Input
                            type="number"
                            min="0"
                            value={input.numOfPeople}
                            onChange={(e) => handleNewEditSubDepartmentNumOfPeopleChange(index, Number(e.target.value))}
                            placeholder="מספר אנשים"
                            className="w-24"
                          />
                          {index === newEditSubDepartmentInputs.length - 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={handleAddNewEditSubDepartmentInput}
                            >
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddNewSubDepartments}
                      className="w-full"
                    >
                      הוסף תתי-מסגרות
                    </Button>
                  </div>
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
        ) : (
          <>
            <h3 className="font-semibold text-lg mb-4">יצירת מסגרת חדשה</h3>
            <form onSubmit={handleCreateDepartmentWithSubDepartments} className="space-y-4">
              <div>
                <label htmlFor="newDepartmentName" className="block text-sm font-medium mb-1">
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
                  <label htmlFor="newDepartmentBase" className="block text-sm font-medium mb-1">
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
                <label htmlFor="newDepartmentNumOfPeople" className="block text-sm font-medium mb-1">
                  מספר אנשים
                </label>
                <input
                  id="newDepartmentNumOfPeople"
                  type="number"
                  min="0"
                  value={newDepartmentNumOfPeople}
                  onChange={(e) => setNewDepartmentNumOfPeople(Number(e.target.value))}
                  className="input-field"
                  placeholder="הזן מספר אנשים"
                />
              </div>

              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSubDepartmentsForm(!showSubDepartmentsForm)}
                  className="w-full"
                >
                  {showSubDepartmentsForm ? "הסתר תתי-מסגרות" : "הוספת תתי-מסגרות"}
                </Button>

                {showSubDepartmentsForm && (
                  <div className="space-y-2">
                    {subDepartmentInputs.map((input, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={input.name}
                          onChange={(e) => handleSubDepartmentInputChange(index, e.target.value)}
                          placeholder="שם תת-מסגרת"
                        />
                        <Input
                          type="number"
                          min="0"
                          value={input.numOfPeople}
                          onChange={(e) => handleSubDepartmentNumOfPeopleChange(index, Number(e.target.value))}
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

      <div className="bg-card shadow-sm rounded-lg border p-6" style={{ direction: "rtl" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">מסגרות קיימות</h3>
          {/* {admin?.role === "generalAdmin" && (
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
                  <SelectItem key={base._id} value={base._id} className="flex justify-end">
                    {base.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )} */}
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="חיפוש מסגרות..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-8"
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={async () => {
                  setSearchQuery("");
                  setSearchResults(null);
                  setOpenAccordionItems([]);
                  setCurrentPage(1);
                  setHasMore(true);
                  setDepartments([]); // Clear current departments
                  setIsLoading(true); // Set loading state
                  try {
                    await loadDepartments(1);
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="h-[600px] overflow-y-auto pr-2 relative">
          <Accordion
            type="multiple"
            className="w-full"
            value={openAccordionItems}
            onValueChange={handleAccordionChange}
          >
            {filteredDepartments.length === 0 && searchQuery ? (
              <div className="text-center py-8 text-muted-foreground">
                לא נמצאו מסגרות התואמות לחיפוש
              </div>
            ) : (
              <>
                {filteredDepartments.map((department) => {
                  const departmentSubDepartments = loadedSubDepartments[department._id] || [];

                  return (
                    <AccordionItem key={department._id} value={department._id}>
                      <AccordionTrigger className="flex justify-between">
                        <div className="flex flex-row gap-2 items-center">
                          <span>{department.name}</span>
                          <span className="text-sm text-muted-foreground">
                            ({department.numOfPeople} אנשים)
                          </span>
                          {admin?.role === "generalAdmin" && (
                            <span className="text-sm text-muted-foreground">
                              ({bases.find(b => b._id === department.baseId)?.name || 'לא ידוע'})
                            </span>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {!loadedSubDepartments[department._id] ? (
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                          ) : departmentSubDepartments.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                              אין תתי-מסגרות
                            </div>
                          ) : (
                            departmentSubDepartments.map((subDept) => (
                              <li
                                key={subDept._id}
                                className="flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2">
                                  <span>{subDept.name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    ({subDept.numOfPeople} אנשים)
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => confirmDeleteSubDepartment(subDept._id)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </li>
                            ))
                          )}
                          <li>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                className="flex items-center gap-2 justify-center text-muted-foreground hover:text-foreground"
                                onClick={() => startEditDepartmentWithSubDepartments(department._id)}
                              >
                                <PencilIcon className="h-4 w-4" />
                                <span>עריכה</span>
                              </Button>
                              <Button
                                variant="ghost"
                                className="flex items-center gap-2 justify-center text-muted-foreground hover:text-destructive"
                                onClick={() => confirmDeleteDepartment(department._id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                                <span>מחיקה</span>
                              </Button>
                            </div>
                          </li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
                {hasMore && (
                  <div 
                    ref={loadMoreRef} 
                    className="h-20 flex items-center justify-center py-4"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    ) : (
                      <div className="h-4" />
                    )}
                  </div>
                )}
              </>
            )}
          </Accordion>
        </div>
      </div>

      {/* Validation Alert Dialog */}
      <AlertDialog open={showValidationAlert} onOpenChange={setShowValidationAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-end">אזהרה</AlertDialogTitle>
            <AlertDialogDescription className="flex items-end text-right">
              סכום מספר האנשים בתתי-המסגרות גדול ממספר האנשים במסגרת. האם אתה בטוח שברצונך להמשיך?
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
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-end">
              האם אתה בטוח שברצונך למחוק?
            </AlertDialogTitle>
            <AlertDialogDescription className="flex items-end text-right">
              אתה עומד למחוק{" "}
              {deleteItemType === "department"
                ? `את המסגרת "${deleteItemName}"`
                : `את תת-המסגרת "${deleteItemName}"`}
              . פעולה זו אינה ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteItemType === "subdepartment" && (
            <div className="space-y-4 py-4">
              {traineesInSubDepartment.length > 0 && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-2" style={{ textAlign: "right" }}>
                    חניכים בתת-המסגרת:
                  </h4>
                  <ul className="space-y-2" style={{ textAlign: "right" }}>
                    {traineesInSubDepartment.slice(0, 3).map((trainee) => (
                      <li key={trainee._id} className="flex items-center gap-2">
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
                <label className="block text-sm font-medium mb-1" style={{ textAlign: "right" }}>
                  בחר מסגרת חדשה להעברת החניכים
                </label>
                <Select
                  value={transferDepartmentId}
                  onValueChange={(value) => setTransferDepartmentId(value)}
                >
                  <SelectTrigger className="input-field" style={{ textAlign: "right" }}>
                    <SelectValue placeholder="בחר מסגרת" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments
                      .filter((dept) => {
                        const originalSubDept = subDepartments.find(
                          (subDept) => subDept._id === deletingSubDepartmentId
                        );
                        if (!originalSubDept) return false;
                        const originalDept = departments.find(
                          (d) => d._id === originalSubDept.departmentId
                        );
                        if (!originalDept) return false;
                        return dept.baseId === originalDept.baseId;
                      })
                      .map((dept) => (
                        <SelectItem key={dept._id} value={dept._id} className="flex justify-end">
                          {dept.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {transferDepartmentId && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ textAlign: "right" }}>
                    בחר תת-מסגרת חדשה להעברת החניכים
                  </label>
                  <Select
                    value={transferSubDepartmentId}
                    onValueChange={(value) => setTransferSubDepartmentId(value)}
                  >
                    <SelectTrigger className="input-field" style={{ textAlign: "right" }}>
                      <SelectValue placeholder="בחר תת-מסגרת" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubDepartments.map((subDept) => (
                        <SelectItem key={subDept._id} value={subDept._id} className="flex justify-end">
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
            <AlertDialogCancel onClick={() => {
              setDeletingDepartmentId(null);
              setDeletingSubDepartmentId(null);
              setShowDeleteConfirm(false);
              setTransferDepartmentId("");
              setTransferSubDepartmentId("");
              setAvailableSubDepartments([]);
              setTraineesInSubDepartment([]);
            }}>
              ביטול
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteItemType === "department") {
                  deleteDepartment();
                } else {
                  deleteSubDepartment();
                }
              }}
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
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DepartmentsTab; 