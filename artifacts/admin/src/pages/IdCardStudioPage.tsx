import { useState } from "react";
import { useListStudents, useListClassrooms } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import StudentIdCardStudio from "@/components/StudentIdCardStudio";
import { Users, Filter } from "lucide-react";

export default function IdCardStudioPage() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const headers = { Authorization: `Bearer ${token}` };

  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const { data: classroomsData, isLoading: loadingClasses } = useListClassrooms({ request: { headers } });
  
  // Fetch students based on selected class
  const { data: studentsData, isLoading: loadingStudents } = useListStudents(
    selectedClassId ? { classId: Number(selectedClassId) } : undefined,
    { request: { headers } }
  );

  const classrooms = classroomsData?.data || [];
  const students = studentsData?.data || [];

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <Users className="text-purple-600 dark:text-purple-400" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {t("idCardStudio") || "ID Card Studio"}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-gray-400 dark:text-gray-500" />
          <span className="text-sm font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">ជ្រើសរើសថ្នាក់៖</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full md:w-[250px] border-2 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:border-purple-500 outline-none bg-gray-50 dark:bg-gray-700 dark:text-white font-khmer"
          >
            <option value="">-- {t("allStudents") || "All Students"} --</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.grade})
              </option>
            ))}
          </select>
          {loadingStudents && <span className="text-xs text-purple-600 animate-pulse">Loading...</span>}
        </div>
      </div>

      <div className="-mx-4 md:mx-0">
        <StudentIdCardStudio 
          students={students} 
          token={token} 
        />
      </div>
    </div>
  );
}
