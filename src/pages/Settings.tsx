import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { 
  baseService, 
  departmentService, 
  subDepartmentService,
  traineeService, 
  adminService 
} from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  AlertCircleIcon,
  CheckIcon,
  XIcon
} from 'lucide-react';
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

const Settings = () => {
  const { admin, bases, setBases, departments, setDepartments, subDepartments, setSubDepartments, trainees, setTrainees } = useAdmin();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('departments');
  
  // Base states
  const [newBaseName, setNewBaseName] = useState('');
  const [newBaseLocation, setNewBaseLocation] = useState('');
  const [editingBaseId, setEditingBaseId] = useState<string | null>(null);
  const [editBaseName, setEditBaseName] = useState('');
  const [editBaseLocation, setEditBaseLocation] = useState('');
  const [deletingBaseId, setDeletingBaseId] = useState<string | null>(null);
  
  // Department states
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [selectedBaseForDepartment, setSelectedBaseForDepartment] = useState('');
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [editDepartmentName, setEditDepartmentName] = useState('');
  const [editDepartmentBaseId, setEditDepartmentBaseId] = useState('');
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<string | null>(null);
  
  // SubDepartment states
  const [newSubDepartmentName, setNewSubDepartmentName] = useState('');
  const [selectedDepartmentForSubDepartment, setSelectedDepartmentForSubDepartment] = useState('');
  const [editingSubDepartmentId, setEditingSubDepartmentId] = useState<string | null>(null);
  const [editSubDepartmentName, setEditSubDepartmentName] = useState('');
  const [editSubDepartmentDepartmentId, setEditSubDepartmentDepartmentId] = useState('');
  const [deletingSubDepartmentId, setDeletingSubDepartmentId] = useState<string | null>(null);
  
  // New states for trainee transfer
  const [transferDepartmentId, setTransferDepartmentId] = useState('');
  const [transferSubDepartmentId, setTransferSubDepartmentId] = useState('');
  const [availableSubDepartments, setAvailableSubDepartments] = useState([]);
  const [traineesInSubDepartment, setTraineesInSubDepartment] = useState([]);
  
  // Admin states
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'generalAdmin' | 'gymAdmin'>('gymAdmin');
  const [selectedBaseForAdmin, setSelectedBaseForAdmin] = useState('');
  
  // Confirm dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState<'base' | 'department' | 'subdepartment'>('base');
  const [deleteItemName, setDeleteItemName] = useState('');

  // Get department and base names
  const getDepartmentName = (id: string) => {
    const department = departments.find(dept => dept._id === id);
    return department ? department.name : '';
  };
  
  const getBaseName = (id: string) => {
    const base = bases.find(base => base._id === id);
    return base ? base.name : '';
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
        location: newBaseLocation
      });
      
      // Update bases state
      setBases([...bases, newBase]);
      
      // Reset form
      setNewBaseName('');
      setNewBaseLocation('');
      
      toast({
        title: "בסיס חדש נוסף",
        description: `בסיס ${newBase.name} נוסף בהצלחה`,
      });
    } catch (error) {
      console.error('Error adding base:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הוספת הבסיס",
        variant: "destructive",
      });
    }
  };

  // Start editing a base
  const startEditBase = (baseId: string) => {
    const baseToEdit = bases.find(base => base._id === baseId);
    if (baseToEdit) {
      setEditingBaseId(baseId);
      setEditBaseName(baseToEdit.name);
      setEditBaseLocation(baseToEdit.location);
    }
  };

  // Cancel editing a base
  const cancelEditBase = () => {
    setEditingBaseId(null);
    setEditBaseName('');
    setEditBaseLocation('');
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
        location: editBaseLocation
      });
      
      const updatedBases = bases.map(base => 
        base._id === baseId ? { ...base, name: editBaseName, location: editBaseLocation } : base
      );
      
      setBases(updatedBases);
      
      // Reset editing state
      setEditingBaseId(null);
      setEditBaseName('');
      setEditBaseLocation('');
      
      toast({
        title: "בסיס עודכן",
        description: `בסיס ${editBaseName} עודכן בהצלחה`,
      });
    } catch (error) {
      console.error('Error updating base:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת עדכון הבסיס",
        variant: "destructive",
      });
    }
  };

  // Open delete confirmation for base
  const confirmDeleteBase = (baseId: string) => {
    const baseToDelete = bases.find(base => base._id === baseId);
    if (baseToDelete) {
      setDeletingBaseId(baseId);
      setDeleteItemType('base');
      setDeleteItemName(baseToDelete.name);
      setShowDeleteConfirm(true);
    }
  };

  // Delete a base
  const deleteBase = async () => {
    if (!deletingBaseId) return;
    
    try {
      await baseService.delete(deletingBaseId);
      
      const updatedBases = bases.filter(base => base._id !== deletingBaseId);
      setBases(updatedBases);
      
      toast({
        title: "בסיס נמחק",
        description: `בסיס ${deleteItemName} נמחק בהצלחה`,
      });
    } catch (error) {
      console.error('Error deleting base:', error);
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
    
    if (!newDepartmentName.trim() || !selectedBaseForDepartment) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create department via API
      const newDepartment = await departmentService.create({
        name: newDepartmentName,
        baseId: selectedBaseForDepartment
      });
      
      // Update departments state
      setDepartments([...departments, newDepartment]);
      
      // Reset form
      setNewDepartmentName('');
      setSelectedBaseForDepartment('');
      
      toast({
        title: "מסגרת חדשה נוספה",
        description: `מסגרת ${newDepartment.name} נוספה בהצלחה`,
      });
    } catch (error) {
      console.error('Error adding department:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הוספת המסגרת",
        variant: "destructive",
      });
    }
  };

  // Start editing a department
  const startEditDepartment = (departmentId: string) => {
    const departmentToEdit = departments.find(dept => dept._id === departmentId);
    if (departmentToEdit) {
      setEditingDepartmentId(departmentId);
      setEditDepartmentName(departmentToEdit.name);
      setEditDepartmentBaseId(departmentToEdit.baseId);
    }
  };

  // Cancel editing a department
  const cancelEditDepartment = () => {
    setEditingDepartmentId(null);
    setEditDepartmentName('');
    setEditDepartmentBaseId('');
  };

  // Save edited department
  const saveEditDepartment = async (departmentId: string) => {
    if (!editDepartmentName.trim() || !editDepartmentBaseId) {
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
        baseId: editDepartmentBaseId
      });
      
      const updatedDepartments = departments.map(dept => 
        dept._id === departmentId ? { ...dept, name: editDepartmentName, baseId: editDepartmentBaseId } : dept
      );
      
      setDepartments(updatedDepartments);
      
      // Reset editing state
      setEditingDepartmentId(null);
      setEditDepartmentName('');
      setEditDepartmentBaseId('');
      
      toast({
        title: "מסגרת עודכנה",
        description: `מסגרת ${editDepartmentName} עודכנה בהצלחה`,
      });
    } catch (error) {
      console.error('Error updating department:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת עדכון המסגרת",
        variant: "destructive",
      });
    }
  };

  // Open delete confirmation for department
  const confirmDeleteDepartment = (departmentId: string) => {
    const departmentToDelete = departments.find(dept => dept._id === departmentId);
    if (departmentToDelete) {
      setDeletingDepartmentId(departmentId);
      setDeleteItemType('department');
      setDeleteItemName(departmentToDelete.name);
      setShowDeleteConfirm(true);
    }
  };

  // Delete a department
  const deleteDepartment = async () => {
    if (!deletingDepartmentId) return;
    
    try {
      await departmentService.delete(deletingDepartmentId);
      
      const updatedDepartments = departments.filter(dept => dept._id !== deletingDepartmentId);
      setDepartments(updatedDepartments);
      
      toast({
        title: "מסגרת נמחקה",
        description: `מסגרת ${deleteItemName} נמחקה בהצלחה`,
      });
    } catch (error) {
      console.error('Error deleting department:', error);
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
    
    if (!newSubDepartmentName.trim() || !selectedDepartmentForSubDepartment) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create subdepartment via API
      const newSubDepartment = await subDepartmentService.create({
        name: newSubDepartmentName,
        departmentId: selectedDepartmentForSubDepartment
      });
      
      // Update subdepartments state
      setSubDepartments([...subDepartments, newSubDepartment]);
      
      // Reset form
      setNewSubDepartmentName('');
      setSelectedDepartmentForSubDepartment('');
      
      toast({
        title: "תת-מסגרת חדשה נוספה",
        description: `תת-מסגרת ${newSubDepartment.name} נוספה בהצלחה`,
      });
    } catch (error) {
      console.error('Error adding subdepartment:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הוספת תת-המסגרת",
        variant: "destructive",
      });
    }
  };

  // Start editing a subdepartment
  const startEditSubDepartment = (subDepartmentId: string) => {
    const subDepartmentToEdit = subDepartments.find(subDept => subDept._id === subDepartmentId);
    if (subDepartmentToEdit) {
      setEditingSubDepartmentId(subDepartmentId);
      setEditSubDepartmentName(subDepartmentToEdit.name);
      setEditSubDepartmentDepartmentId(subDepartmentToEdit.departmentId);
    }
  };

  useEffect(() => {
    if (admin?.role === 'gymAdmin') {
      setSelectedBaseForDepartment(admin?.baseId);
    }
  }, [admin]);
  
  // Cancel editing a subdepartment
  const cancelEditSubDepartment = () => {
    setEditingSubDepartmentId(null);
    setEditSubDepartmentName('');
    setEditSubDepartmentDepartmentId('');
  };

  // Save edited subdepartment
  const saveEditSubDepartment = async (subDepartmentId: string) => {
    if (!editSubDepartmentName.trim() || !editSubDepartmentDepartmentId) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const updatedSubDepartment = await subDepartmentService.update(subDepartmentId, {
        name: editSubDepartmentName,
        departmentId: editSubDepartmentDepartmentId
      });
      
      // For now, update locally
      const updatedSubDepartments = subDepartments.map(subDept => 
        subDept._id === subDepartmentId ? 
        { ...subDept, name: editSubDepartmentName, departmentId: editSubDepartmentDepartmentId } : 
        subDept
      );
      
      setSubDepartments(updatedSubDepartments);
      
      // Reset editing state
      setEditingSubDepartmentId(null);
      setEditSubDepartmentName('');
      setEditSubDepartmentDepartmentId('');
      
      toast({
        title: "תת-מסגרת עודכנה",
        description: `תת-מסגרת ${editSubDepartmentName} עודכנה בהצלחה`,
      });
    } catch (error) {
      console.error('Error updating subdepartment:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת עדכון תת-המסגרת",
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
      setTransferDepartmentId('');
      setTransferSubDepartmentId('');
      setAvailableSubDepartments([]);
      setTraineesInSubDepartment([]);
    }, 300); // 300ms delay
  };

  // Update available subdepartments when transfer department changes
  useEffect(() => {
    if (transferDepartmentId) {
      const filteredSubDepartments = subDepartments.filter(
        subDept => subDept.departmentId === transferDepartmentId
      );
      setAvailableSubDepartments(filteredSubDepartments);
      setTransferSubDepartmentId(''); // Reset subdepartment selection
    } else {
      setAvailableSubDepartments([]);
      setTransferSubDepartmentId('');
    }
  }, [transferDepartmentId, subDepartments]);

  // Open delete confirmation for subdepartment
  const confirmDeleteSubDepartment = async (subDepartmentId: string) => {
    const subDepartmentToDelete = subDepartments.find(subDept => subDept._id === subDepartmentId);
    if (subDepartmentToDelete) {
      setDeletingSubDepartmentId(subDepartmentId);
      setDeleteItemType('subdepartment');
      setDeleteItemName(subDepartmentToDelete.name);
      
      // Reset all transfer-related states
      setTransferDepartmentId('');
      setTransferSubDepartmentId('');
      setAvailableSubDepartments([]);
      setTraineesInSubDepartment([]);
      
      // Fetch trainees in this subdepartment
      try {
        const allTrainees = await traineeService.getAll();
        const traineesInDept = allTrainees.filter(trainee => trainee.subDepartmentId === subDepartmentId);
        setTraineesInSubDepartment(traineesInDept);
      } catch (error) {
        console.error('Error fetching trainees:', error);
        setTraineesInSubDepartment([]);
      }
      
      setShowDeleteConfirm(true);
    }
  };

  // Delete a subdepartment
  const deleteSubDepartment = async () => {
    if (!deletingSubDepartmentId) return;
    
    if (deleteItemType === 'subdepartment' && (!transferDepartmentId || !transferSubDepartmentId)) {
      toast({
        title: "שגיאה",
        description: "יש לבחור מסגרת ותת-מסגרת חדשים להעברת החניכים",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // First, transfer trainees to new subdepartment
      if (deleteItemType === 'subdepartment') {
        await traineeService.transferSubDepartment(deletingSubDepartmentId, transferSubDepartmentId);
        
        // Get the new subdepartment to get its departmentId
        const newSubDepartment = subDepartments.find(subDept => subDept._id === transferSubDepartmentId);
        if (!newSubDepartment) {
          throw new Error('New subdepartment not found');
        }
        
        // Update trainees in context
        const updatedTrainees = trainees.map(trainee => {
          if (trainee.subDepartmentId === deletingSubDepartmentId) {
            return {
              ...trainee,
              subDepartmentId: transferSubDepartmentId,
              departmentId: newSubDepartment.departmentId
            };
          }
          return trainee;
        });
        setTrainees(updatedTrainees);
      }
      
      // Then delete the subdepartment
      await subDepartmentService.delete(deletingSubDepartmentId);
      
      const updatedSubDepartments = subDepartments.filter(subDept => subDept._id !== deletingSubDepartmentId);
      setSubDepartments(updatedSubDepartments);
      
      toast({
        title: "תת-מסגרת נמחקה",
        description: `תת-מסגרת ${deleteItemName} נמחקה בהצלחה והחניכים הועברו לתת-מסגרת חדשה`,
      });
    } catch (error) {
      console.error('Error deleting subdepartment:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת מחיקת תת-המסגרת",
        variant: "destructive",
      });
    } finally {
      setDeletingSubDepartmentId(null);
      setShowDeleteConfirm(false);
      // Reset transfer selections
      setTransferDepartmentId('');
      setTransferSubDepartmentId('');
      setAvailableSubDepartments([]);
      setTraineesInSubDepartment([]);
    }
  };

  // ===== ADMIN OPERATIONS =====
  // Handle adding a new admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdminUsername.trim() || !newAdminPassword.trim() || 
        (newAdminRole === 'gymAdmin' && !selectedBaseForAdmin)) {
      toast({
        title: "שגיאה",
        description: "יש למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create admin via API
      const adminData = {
        username: newAdminUsername,
        password: newAdminPassword,
        role: newAdminRole,
        ...(newAdminRole === 'gymAdmin' && { baseId: selectedBaseForAdmin })
      };
      
      await adminService.create(adminData);
      
      // Reset form
      setNewAdminUsername('');
      setNewAdminPassword('');
      setNewAdminRole('gymAdmin');
      setSelectedBaseForAdmin('');
      
      toast({
        title: "מנהל חדש נוסף",
        description: `מנהל ${newAdminUsername} נוסף בהצלחה`,
      });
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.response?.data?.message || "אירעה שגיאה בעת הוספת המנהל",
        variant: "destructive",
      });
      console.error('Error adding admin:', error);
    }
  };

  // Process delete confirmation
  const handleDeleteConfirm = () => {
    if (deleteItemType === 'base' && deletingBaseId) {
      deleteBase();
    } else if (deleteItemType === 'department' && deletingDepartmentId) {
      deleteDepartment();
    } else if (deleteItemType === 'subdepartment' && deletingSubDepartmentId) {
      deleteSubDepartment();
    }
  };

  return (
    <DashboardLayout activeTab="settings">
      <div className="space-y-6 animate-fade-up">
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
                          {!(deleteItemType === 'department' && subDepartments.filter(subDept => subDept.departmentId === deletingDepartmentId).length > 0) && (
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-end">האם אתה בטוח שברצונך למחוק?</AlertDialogTitle>
              <AlertDialogDescription className="flex items-end text-right">
                אתה עומד למחוק {
                  deleteItemType === 'base' ? `את הבסיס "${deleteItemName}"` :
                  deleteItemType === 'department' ? `את המסגרת "${deleteItemName}"` :
                  `את תת-המסגרת "${deleteItemName}"`
                }. פעולה זו אינה ניתנת לביטול.
              </AlertDialogDescription>
            </AlertDialogHeader>
                          )}
            {deleteItemType === 'department' && (
              <div className="space-y-4 py-4">
                {subDepartments.filter(subDept => subDept.departmentId === deletingDepartmentId).length > 0 && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2" style={{textAlign: "right"}}>
                      לא ניתן למחוק את המסגרת מכיוון שיש לה תת-מסגרות. יש למחוק תחילה את תת-המסגרות הבאות:
                    </p>
                    <ul className="space-y-2" style={{textAlign: "right"}}>
                      {subDepartments.filter(subDept => subDept.departmentId === deletingDepartmentId).slice(0, 3).map(subDept => (
                        <li key={subDept._id} className="flex items-center gap-2">
                          <span>{subDept.name}</span>
                        </li>
                      ))}
                      {subDepartments.filter(subDept => subDept.departmentId === deletingDepartmentId).length > 3 && (
                        <li className="text-muted-foreground text-sm">
                          ועוד {subDepartments.filter(subDept => subDept.departmentId === deletingDepartmentId).length - 3} תת-מסגרות...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {deleteItemType === 'subdepartment' && (
              <div className="space-y-4 py-4">
                {traineesInSubDepartment.length > 0 && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-medium mb-2" style={{textAlign: "right"}}>חניכים בתת-המסגרת:</h4>
                    <ul className="space-y-2" style={{textAlign: "right"}}>
                      {traineesInSubDepartment.slice(0, 3).map(trainee => (
                        <li key={trainee._id} className="flex items-center gap-2">
                          <span>{trainee.fullName}</span>
                          <span className="text-muted-foreground text-sm">({trainee.personalId})</span>
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
                  <label className="block text-sm font-medium mb-1" style={{textAlign: "right"}}>
                    בחר מסגרת חדשה להעברת החניכים
                  </label>
                  <Select
                    value={transferDepartmentId}
                    onValueChange={(value) => setTransferDepartmentId(value)}
                  >
                    <SelectTrigger className="input-field" style={{textAlign: "right"}}>
                      <SelectValue placeholder="בחר מסגרת" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments
                        .filter(dept => {
                          // Get the original department
                          const originalSubDept = subDepartments.find(subDept => subDept._id === deletingSubDepartmentId);
                          if (!originalSubDept) return false;
                          const originalDept = departments.find(d => d._id === originalSubDept.departmentId);
                          if (!originalDept) return false;
                          
                          // Only show departments from the same base
                          return dept.baseId === originalDept.baseId;
                        })
                        .map(dept => (
                          <SelectItem key={dept._id} value={dept._id} className="flex justify-end">
                            {dept.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                {transferDepartmentId && (
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{textAlign: "right"}}>
                      בחר תת-מסגרת חדשה להעברת החניכים
                    </label>
                    <Select
                      value={transferSubDepartmentId}
                      onValueChange={(value) => setTransferSubDepartmentId(value)}
                    >
                      <SelectTrigger className="input-field" style={{textAlign: "right"}}>
                        <SelectValue placeholder="בחר תת-מסגרת" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubDepartments.map(subDept => (
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
                <AlertDialogCancel onClick={handleDeleteCancel}>ביטול</AlertDialogCancel>
            {!(deleteItemType === 'department' && subDepartments.filter(subDept => subDept.departmentId === deletingDepartmentId).length > 0) && (
                <AlertDialogAction 
                  onClick={handleDeleteConfirm}
                  className={`
                    bg-destructive 
                    text-destructive-foreground 
                    ${deleteItemType === 'subdepartment' && (!transferDepartmentId || !transferSubDepartmentId) 
                      ? 'cursor-pointer opacity-50' 
                      : 'cursor-pointer'
                    }
                  `}
                  disabled={deleteItemType === 'subdepartment' && (!transferDepartmentId || !transferSubDepartmentId)}
                >
                  {deleteItemType === 'subdepartment' ? 'עדכן ומחק' : 'מחק'}
                </AlertDialogAction>
            )}
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">הגדרות</h2>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} style={{display: 'flex', flexDirection: "column", justifyContent: "space-around"}}>
          <TabsList>
            {admin?.role === 'generalAdmin' && (
              <>
                <TabsTrigger value="bases">ניהול בסיסים</TabsTrigger>
                <TabsTrigger value="admins">ניהול מנהלים</TabsTrigger>
              </>
            )}
          
            <TabsTrigger value="subdepartments">ניהול תתי-מסגרות</TabsTrigger>
            <TabsTrigger value="departments">ניהול מסגרות</TabsTrigger>
          </TabsList>
          {/* Admins Tab (allBasesAdmin only) */}
          {admin?.role === 'generalAdmin' && (
            <TabsContent value="admins" className="pt-6" style={{display: "flex",justifyContent: "center"}} >
              <div className="bg-card shadow-sm rounded-lg border p-6" style={{direction: "rtl", width:"510px", }}>
                <h3 className="font-semibold text-lg mb-4">הוספת מנהל חדש</h3>
                <form onSubmit={handleAddAdmin} className="space-y-4 max-w-md">
                  <div>
                    <label htmlFor="adminUsername" className="block text-sm font-medium mb-1">
                      שם משתמש
                    </label>
                    <input
                      id="adminUsername"
                      type="text"
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      className="input-field"
                      placeholder="הזן שם משתמש"
                      required
                      autoComplete="off"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="adminPassword" className="block text-sm font-medium mb-1">
                      סיסמה
                    </label>
                    <input
                      id="adminPassword"
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="input-field"
                      placeholder="הזן סיסמה"
                      required
                      autoComplete="off"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="adminRole" className="block text-sm font-medium mb-1">
                      סוג מנהל
                    </label>
                    <Select
  value={newAdminRole}
  onValueChange={(value) => setNewAdminRole(value as 'generalAdmin' | 'gymAdmin')}
>
  <SelectTrigger id="adminRole" className="w-[450px]">
    <SelectValue placeholder="בחר סוג מנהל" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="gymAdmin" className="flex justify-end">מנהל מכון</SelectItem>
    <SelectItem value="generalAdmin" className="flex justify-end">מנהל כללי</SelectItem>
  </SelectContent>
</Select>
                  </div>
                  
                  {newAdminRole === 'gymAdmin' && (
                    <div>
                      <label htmlFor="adminBaseSelect" className="block text-sm font-medium mb-1">
                        בסיס
                      </label>
                      <Select
  value={selectedBaseForAdmin}
  onValueChange={(value) =>value==="BASE_CHOOSE" ? setSelectedBaseForAdmin(""): setSelectedBaseForAdmin(value)}
>
  <SelectTrigger id="adminBaseSelect" className="input-field">
    <SelectValue placeholder="בחר בסיס" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="BASE_CHOOSE" className="flex justify-end">בחר בסיס</SelectItem>
    {bases.map(base => (
      <SelectItem key={base._id} value={base._id} className="flex justify-end">
        {base.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
                    </div>
                  )}
                  
                  <button type="submit" className="btn-primary w-full">
                    הוסף מנהל
                  </button>
                </form>
              </div>
            </TabsContent>
          )}
          
          {/* SubDepartments Tab */}
          <TabsContent value="subdepartments" className="pt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              <div className="bg-card shadow-sm rounded-lg border overflow-hidden">
                <div className="p-4 bg-muted">
                  <h3 className="font-semibold text-lg" style={{textAlign: "right"}}>תתי-מסגרות קיימות</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-center">פעולות</th>
                        {admin?.role === 'generalAdmin'&& <th className="px-4 py-3 text-right">בסיס</th>}
                        <th className="px-4 py-3 text-right">מסגרת</th>
                        <th className="px-4 py-3 text-right">שם תת-המסגרת</th>
                      </tr>
                    </thead>
                    <tbody style={{textAlign: "right"}}>
                      {subDepartments
                        .filter(subDept => {
                          // Get the department for this subDepartment
                          const dept = departments.find(d => d._id === subDept.departmentId);
                          // Filter by base for gym admin
                          return admin?.role === 'generalAdmin' || (dept && dept.baseId === admin?.baseId);
                        })
                        .map((subDept) => {
                          // Get the department for this subDepartment
                          const department = departments.find(d => d._id === subDept.departmentId);
                          const baseId = department ? department.baseId : '';
                          
                          return (
                            <tr key={subDept._id} className="border-t hover:bg-muted/30">
                              <td className="px-4 py-3">
                                <div className="flex justify-center space-x-2 space-x-reverse">
                                  {editingSubDepartmentId === subDept._id ? (
                                    <>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => saveEditSubDepartment(subDept._id)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <CheckIcon className="h-4 w-4 text-green-600" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={cancelEditSubDepartment}
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
                                        onClick={() => startEditSubDepartment(subDept._id)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <PencilIcon className="h-4 w-4 text-blue-600" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => confirmDeleteSubDepartment(subDept._id)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <TrashIcon className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                              {admin?.role === 'generalAdmin'&&<td className="px-4 py-3">{getBaseName(baseId)}</td>}
                              <td className="px-4 py-3">{getDepartmentName(subDept.departmentId)}</td>
                              <td className="px-4 py-3">
                                {editingSubDepartmentId === subDept._id ? (
                                  <Input
                                    value={editSubDepartmentName}
                                    onChange={(e) => setEditSubDepartmentName(e.target.value)}
                                    className="max-w-[200px]"
                                  />
                                ) : (
                                  subDept.name
                                )}
                              </td>
                            </tr>
                          );
                        })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-card shadow-sm rounded-lg border p-6">
                <h3 className="font-semibold text-lg mb-4" style={{textAlign: "right"}}>הוספת תת-מסגרת חדשה</h3>
                <form onSubmit={handleAddSubDepartment} className="space-y-4">
                  <div>
                    <label htmlFor="subDepartmentName" className="block text-sm font-medium mb-1" style={{textAlign: "right"}}>
                      שם תת-המסגרת
                    </label>
                    <input
                      id="subDepartmentName"
                      type="text"
                      value={newSubDepartmentName}
                      onChange={(e) => setNewSubDepartmentName(e.target.value)}
                      className="input-field"
                      placeholder="הזן שם תת-מסגרת"
                      required
                      autoComplete="off"
                      style={{textAlign: "right"}}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="departmentSelect" className="block text-sm font-medium mb-1" style={{textAlign: "right"}}>
                      בחר מסגרת
                    </label>
                    <Select
  value={selectedDepartmentForSubDepartment}
  onValueChange={(value) => setSelectedDepartmentForSubDepartment(value)}
>
  <SelectTrigger id="departmentSelect" className="input-field" style={{textAlign: "right"}}>
    <SelectValue placeholder="בחר מסגרת" />
  </SelectTrigger>
  <SelectContent>
    {departments
      .filter(dept => 
        admin?.role === 'generalAdmin' || dept.baseId === admin?.baseId
      )
      .map(dept => (
        <SelectItem key={dept._id} value={dept._id} className="flex justify-end">
          {dept.name} {admin?.role === 'generalAdmin' && `(${getBaseName(dept.baseId)})`}
        </SelectItem>
      ))
    }
  </SelectContent>
</Select>
                  </div>
                  
                  <button type="submit" className="btn-primary w-full">
                    הוסף תת-מסגרת
                  </button>
                </form>
              </div>
            </div>
          </TabsContent>
          
          {/* Departments Tab */}
          <TabsContent value="departments" className="pt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              <div className="bg-card shadow-sm rounded-lg border overflow-hidden">
                <div className="p-4 bg-muted">
                  <h3 className="font-semibold text-lg" style={{textAlign: "right"}}>מסגרות קיימות</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-center">פעולות</th>
                        {admin?.role === 'generalAdmin'&&<th className="px-4 py-3 text-right">בסיס</th>}
                        <th className="px-4 py-3 text-right">שם המסגרת</th>
                      </tr>
                    </thead>
                    <tbody style={{textAlign: "right"}}>
                      {departments
                        .filter(dept => 
                          admin?.role === 'generalAdmin' || dept.baseId === admin?.baseId
                        )
                        .map((department) => (
                          <tr key={department._id} className="border-t hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <div className="flex justify-center space-x-2 space-x-reverse">
                                {editingDepartmentId === department._id ? (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => saveEditDepartment(department._id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <CheckIcon className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={cancelEditDepartment}
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
                                      onClick={() => startEditDepartment(department._id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <PencilIcon className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => confirmDeleteDepartment(department._id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <TrashIcon className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                            {admin?.role === 'generalAdmin'&& <td className="px-4 py-3">
                                {getBaseName(department.baseId)}
                            </td>}
                            <td className="px-4 py-3">
                              {editingDepartmentId === department._id ? (
                                <Input
                                  value={editDepartmentName}
                                  onChange={(e) => setEditDepartmentName(e.target.value)}
                                  className="max-w-[200px]"
                                />
                              ) : (
                                department.name
                              )}
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-card shadow-sm rounded-lg border p-6">
                <h3 className="font-semibold text-lg mb-4" style={{textAlign: "right"}}>הוספת מסגרת חדשה</h3>
                <form onSubmit={handleAddDepartment} className="space-y-4">
                  <div>
                    <label htmlFor="departmentName" className="block text-sm font-medium mb-1" style={{textAlign: "right"}}>
                      שם המסגרת
                    </label>
                    <input
                      id="departmentName"
                      type="text"
                      value={newDepartmentName}
                      onChange={(e) => setNewDepartmentName(e.target.value)}
                      className="input-field"
                      placeholder="הזן שם מסגרת"
                      required
                      autoComplete="off"
                      style={{textAlign: "right"}}
                    />
                  </div>
                  
                  {admin?.role === 'generalAdmin'&&<div>
                    <label htmlFor="baseSelect" className="block text-sm font-medium mb-1" style={{textAlign: "right"}}>
                      בסיס
                    </label>
                    <Select
                      value={selectedBaseForDepartment}
                      onValueChange={(value) => setSelectedBaseForDepartment(value)}
                    >
                      <SelectTrigger id="baseSelect" className="input-field" style={{textAlign: "right"}}>
                        <SelectValue placeholder="בחר בסיס" />
                      </SelectTrigger>
                      <SelectContent>
                        {bases
                          .filter(base => 
                            admin?.role === 'generalAdmin' || base._id === admin?.baseId
                          )
                          .map(base => (
                            <SelectItem key={base._id} value={base._id} className="flex justify-end">
                              {base.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>}
                  
                  <button type="submit" className="btn-primary w-full">
                    הוסף מסגרת
                  </button>
                </form>
              </div>
            </div>
          </TabsContent>
          
          {/* Bases Tab (allBasesAdmin only) */}
          {admin?.role === 'generalAdmin' && (
            <TabsContent value="bases" className="pt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2" style={{direction: "rtl"}}>
                <div className="bg-card shadow-sm rounded-lg border p-6" style={{direction: "rtl"}}>
                  <h3 className="font-semibold text-lg mb-4">הוספת בסיס חדש</h3>
                  <form onSubmit={handleAddBase} className="space-y-4">
                    <div>
                      <label htmlFor="baseName" className="block text-sm font-medium mb-1">
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
                      <label htmlFor="baseLocation" className="block text-sm font-medium mb-1">
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
                  <div className="p-4 bg-muted" style={{direction: "rtl"}}>
                    <h3 className="font-semibold text-lg" >בסיסים קיימים</h3>
                  </div>
                  <div className="overflow-x-auto" style={{direction: "rtl"}}>
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
                          <tr key={base._id} className="border-t hover:bg-muted/30" >
                            <td className="px-4 py-3">
                              {editingBaseId === base._id ? (
                                <Input
                                  value={editBaseName}
                                  onChange={(e) => setEditBaseName(e.target.value)}
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
                                  onChange={(e) => setEditBaseLocation(e.target.value)}
                                  className="max-w-[200px]"
                                />
                              ) : (
                                base.location
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {departments.filter(dept => dept.baseId === base._id).length}
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
                                      onClick={() => confirmDeleteBase(base._id)}
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