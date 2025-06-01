import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAdmin } from "../context/AdminContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminsTab from "../components/settings/AdminsTab";
import BasesTab from "../components/settings/BasesTab";
import DepartmentsTab from "../components/settings/DepartmentsTab";

const Settings = () => {
  const {
    admin,
  } = useAdmin();
  const [activeTab, setActiveTab] = useState("departments-with-subdepartments");

  return (
    <DashboardLayout activeTab="settings">
      <div className="space-y-6 animate-fade-up">
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
              <AdminsTab admin={admin} />
            </TabsContent>
          )}

          {/* Bases Tab (allBasesAdmin only) */}
          {admin?.role === "generalAdmin" && (
            <TabsContent value="bases" className="pt-6">
              <BasesTab/>
            </TabsContent>
          )}

          {/* Departments Tab */}
          <TabsContent value="departments-with-subdepartments" className="pt-6">
            <DepartmentsTab
              admin={admin}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
