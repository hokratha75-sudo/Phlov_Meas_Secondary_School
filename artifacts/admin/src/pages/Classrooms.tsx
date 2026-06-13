import { useState } from "react";
import { Plus, Search, Edit2, Trash2, X, GraduationCap, Users } from "lucide-react";
import { useListClassrooms, useCreateClassroom, useUpdateClassroom, useDeleteClassroom, useListTeachers } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";

import { useTranslation } from "@/lib/i18n";

export default function Classrooms() {
  const { t, lang } = useTranslation();
  const { token } = useAuth();
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Temporary Form State
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    roomNumber: "",
    teacherId: ""
  });

  const { data: classData, refetch, isLoading: classLoading, isError } = useListClassrooms({ request: { headers } });
  const { data: teachersData } = useListTeachers({ request: { headers } });
  const isLoading = classLoading;

  const createMutation = useCreateClassroom({ request: { headers } });
  const updateMutation = useUpdateClassroom({ request: { headers } });
  const deleteMutation = useDeleteClassroom({ request: { headers } });

  const openModal = (classroom?: any) => {
    if (classroom) {
      setEditingId(classroom.id);
      setFormData({
        name: classroom.name,
        grade: classroom.grade,
        roomNumber: classroom.roomNumber || "",
        teacherId: classroom.teacherId?.toString() || ""
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", grade: "", roomNumber: "", teacherId: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      grade: formData.grade,
      roomNumber: formData.roomNumber,
      teacherId: formData.teacherId ? parseInt(formData.teacherId) : null
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
      } else {
        await createMutation.mutateAsync({ data: payload });
      }
      refetch();
      setIsModalOpen(false);
      alert(t("saveSuccess"));
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.error || err?.message || JSON.stringify(err);
      alert(`${t("saveError")}: ${msg}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("confirmDeleteClass"))) {
      try {
        await deleteMutation.mutateAsync({ id });
        refetch();
      } catch (err) {
        console.error(err);
        alert(t("saveError"));
      }
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl mb-2 flex items-center gap-2">
            <GraduationCap className="text-primary" />
            {t("classroomManagement")}
          </h1>
          <p className="text-gray-500">{lang === "km" ? "រៀបចំ និងកំណត់គ្រូបន្ទុកថ្នាក់សម្រាប់ថ្នាក់នីមួយៗ" : "Organize and assign advisors for each classroom"}</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} />
          <span>{t("add")}</span>
        </button>
      </div>

      {/* Stats/Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={t("searchClassName")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600 dark:bg-gray-900/50">
                <th className="px-6 py-4 font-medium">No.</th>
                <th className="px-6 py-4 font-medium">{t("className")}</th>
                <th className="px-6 py-4 font-medium">{t("gradeLevel")}</th>
                <th className="px-6 py-4 font-medium">{t("roomNumber")}</th>
                <th className="px-6 py-4 font-medium">{t("classAdvisor")}</th>
                <th className="px-6 py-4 font-medium">{t("studentCount")}</th>
                <th className="px-6 py-4 font-medium text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="font-battambang">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    កំពុងទាញយកទិន្នន័យ...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-red-500 font-bold">
                    មានបញ្ហាក្នុងការទាញយកទិន្នន័យ (Error Loading Data)
                  </td>
                </tr>
              ) : classData?.data?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <GraduationCap size={48} className="text-gray-300" />
                      <p>មិនមានទិន្នន័យថ្នាក់រៀននៅឡើយទេ</p>
                    </div>
                  </td>
                </tr>
              ) : (
                classData?.data?.map((item: any, index: number) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors dark:bg-gray-900/50">
                    <td className="px-6 py-4 text-gray-500">{(index + 1).toString().padStart(2, '0')}</td>
                    <td className="px-6 py-4 font-medium text-primary">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-blue-600 font-medium bg-blue-50/30 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg inline-block px-3 py-1">
                        {item.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.roomNumber || '-'}</td>
                    <td className="px-6 py-4">
                      {item.teacher ? item.teacher.nameKh : <span className="text-red-400 italic">{t("notSet")}</span>}
                    </td>
                    <td className="px-6 py-4 text-blue-600 font-medium">
                      {item.studentsCount} {t("studentsSuffix")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl text-primary">
                {editingId ? t("editClassroomInfo") : t("createNewClassroom")}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("className")} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={lang === 'km' ? "ឧ. ទី១០ A" : "e.g. 10A"}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("gradeLevel")} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  <option value="">-- {lang === 'km' ? "ជ្រើសរើសកម្រិតថ្នាក់" : "Select Grade"} --</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("roomNumber")}</label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder={lang === 'km' ? "ឧ. បន្ទប់លេខ ០១" : "e.g. Room 01"}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("classAdvisor")}</label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  <option value="">-- {t("notSet")} --</option>
                  {teachersData?.data?.map((teacher: any) => (
                    <option key={teacher.id} value={teacher.id}>
                      {lang === 'km' ? teacher.nameKh : teacher.nameEn} ({lang === 'km' ? teacher.subjectKh : teacher.subjectEn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium dark:bg-gray-900/50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors font-medium shadow-sm"
                >
                  {t("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
