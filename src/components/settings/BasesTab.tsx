import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PencilIcon, TrashIcon, XIcon, CheckIcon } from "lucide-react";
import { baseService } from "../../services/api";
import { Base, Department } from "../../types";

interface BasesTabProps {
}

const BasesTab: React.FC<BasesTabProps> = () => {
  const { toast } = useToast();
  const [bases, setBases] = useState<Base[]>([]);
  const [newBaseName, setNewBaseName] = useState("");
  const [newBaseLocation, setNewBaseLocation] = useState("");
  const [editingBaseId, setEditingBaseId] = useState<string | null>(null);
  const [editBaseName, setEditBaseName] = useState("");
  const [editBaseLocation, setEditBaseLocation] = useState("");
  const [deletingBaseId, setDeletingBaseId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItemName, setDeleteItemName] = useState("");

  // Fetch bases on component mount
  useEffect(() => {
    fetchBases();
  }, []);

  const fetchBases = async () => {
    try {
      const response = await baseService.getAll();
      setBases(response);
    } catch (error) {
      console.error("Error fetching bases:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת טעינת רשימת הבסיסים",
        variant: "destructive",
      });
    }
  };

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
      const newBase = await baseService.create({
        name: newBaseName,
        location: newBaseLocation,
      });

      setBases([...bases, newBase]);
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

  const startEditBase = (baseId: string) => {
    const baseToEdit = bases.find((base) => base._id === baseId);
    if (baseToEdit) {
      setEditingBaseId(baseId);
      setEditBaseName(baseToEdit.name);
      setEditBaseLocation(baseToEdit.location);
    }
  };

  const cancelEditBase = () => {
    setEditingBaseId(null);
    setEditBaseName("");
    setEditBaseLocation("");
  };

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

  const confirmDeleteBase = (baseId: string) => {
    const baseToDelete = bases.find((base) => base._id === baseId);
    if (baseToDelete) {
      setDeletingBaseId(baseId);
      setDeleteItemName(baseToDelete.name);
      setShowDeleteConfirm(true);
    }
  };

  const deleteBase = async () => {
    if (!deletingBaseId) return;

    try {
      await baseService.delete(deletingBaseId);
      try {
        await baseService.getById(deletingBaseId);
        // If we get here, the base still exists
        throw new Error("Base was not deleted successfully");
      } catch (error) {
        // If we get a 404 or similar error, the base was successfully deleted
        const updatedBases = bases.filter((base) => base._id !== deletingBaseId);
        setBases(updatedBases);

        toast({
          title: "בסיס נמחק",
          description: `בסיס ${deleteItemName} נמחק בהצלחה`,
        });
      }
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

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2" style={{ direction: "rtl" }}>
      <div className="bg-card shadow-sm rounded-lg border p-6" style={{ direction: "rtl" }}>
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
                <tr key={base._id} className="border-t hover:bg-muted/30">
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
                    {base.departmentCount || 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center space-x-2 space-x-reverse">
                      {editingBaseId === base._id ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditBase}
                            className="h-8 w-8 p-0"
                          >
                            <XIcon className="h-4 w-4 text-red-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => saveEditBase(base._id)}
                            className="h-8 w-8 p-0"
                          >
                            <CheckIcon className="h-4 w-4 text-green-600" />
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

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">האם אתה בטוח שברצונך למחוק?</h3>
            <p className="text-muted-foreground mb-6">
              אתה עומד למחוק את הבסיס "{deleteItemName}". פעולה זו אינה ניתנת לביטול.
            </p>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                ביטול
              </Button>
              <Button variant="destructive" onClick={deleteBase}>
                מחק
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasesTab; 