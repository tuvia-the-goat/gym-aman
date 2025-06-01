import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KeyIcon, XIcon, CheckIcon, PencilIcon, TrashIcon } from "lucide-react";
import { adminService, baseService } from "../../services/api";
import { Admin, Base, PopulatedAdmin } from "../../types";

interface AdminsTabProps {
  admin: Admin;
}

const AdminsTab: React.FC<AdminsTabProps> = ({ admin }) => {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<PopulatedAdmin[]>([]);
  const [bases, setBases] = useState<Base[]>([]);
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"generalAdmin" | "gymAdmin">("gymAdmin");
  const [newAdminBaseId, setNewAdminBaseId] = useState("");
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [editAdminUsername, setEditAdminUsername] = useState("");
  const [editAdminRole, setEditAdminRole] = useState<"generalAdmin" | "gymAdmin">("gymAdmin");
  const [editAdminBaseId, setEditAdminBaseId] = useState("");
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItemName, setDeleteItemName] = useState("");
  const [resettingPasswordFor, setResettingPasswordFor] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Fetch admins and bases on component mount
  useEffect(() => {
    fetchAdmins();
    fetchBases();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await adminService.getAll();
      setAdmins(response as unknown as PopulatedAdmin[]);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת טעינת רשימת המנהלים",
        variant: "destructive",
      });
    }
  };

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
        baseId: newAdminBaseId,
      });
      toast({
        title: "הצלחה",
        description: "המנהל נוסף בהצלחה",
      });
      setNewAdminUsername("");
      setNewAdminPassword("");
      setNewAdminRole("gymAdmin");
      setNewAdminBaseId("");
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
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      required
                      style={{ direction: "rtl" }}
                      placeholder="הזן שם משתמש"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">סיסמה (מינימום 6 תווים)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      required
                      minLength={6}
                      style={{ direction: "rtl" }}
                      placeholder="הזן סיסמה"
                    />
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-200 ${newAdminPassword.length < 6 ? 'bg-red-400' : 'bg-green-400'}`}
                        style={{ width: `${Math.min((newAdminPassword.length / 6) * 100, 100)}%` }}
                      />
                    </div>
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
                      <SelectItem value="gymAdmin" className="flex justify-end">
                        מנהל חדר כושר
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newAdminRole === "gymAdmin" && (
                  <div className="space-y-2">
                    <Label htmlFor="baseId">בסיס</Label>
                    <Select
                      value={newAdminBaseId || ""}
                      onValueChange={(value) => setNewAdminBaseId(value)}
                    >
                      <SelectTrigger>
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
                        {admin.role === "generalAdmin" ? "מנהל כללי" : "מנהל חדר כושר"}
                      </TableCell>
                      <TableCell style={{ textAlign: "right" }}>
                        {admin.baseId?.name || "-"}
                      </TableCell>
                      <TableCell style={{ textAlign: "right" }}>
                        {resettingPasswordFor === admin._id ? (
                          <div className="flex items-center gap-2" style={{ direction: "rtl" }}>
                            <div className="flex flex-col gap-1">
                              <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="הזן סיסמה חדשה"
                                className="max-w-[200px]"
                                style={{ direction: "rtl" }}
                              />
                              <div className="h-1 w-[200px] bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-200 ${newPassword.length < 6 ? 'bg-red-400' : 'bg-green-400'}`}
                                  style={{ width: `${Math.min((newPassword.length / 6) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
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
  );
};

export default AdminsTab; 