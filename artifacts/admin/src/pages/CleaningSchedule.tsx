import { useState } from "react";
import { Calendar, Plus, Search, CheckCircle, Clock, AlertTriangle, X, Trash2, Pencil, Users, MapPin, Printer } from "lucide-react";
import CleaningSchedulePrintModal from "@/components/CleaningSchedulePrintModal";

// Mock Data
const INITIAL_SCHEDULES = [
  { id: 1, room: "បន្ទប់ 10A", students: "ក្រុមទី១ (រដ្ឋា, សុខា, មេសា)", day: "ថ្ងៃច័ន្ទ", shift: "ព្រឹក", status: "Completed" },
  { id: 2, room: "បន្ទប់ 12B", students: "ក្រុមទី៣ (ចាន់, សៅ, ភក្តី)", day: "ថ្ងៃអង្គារ", shift: "រសៀល", status: "Pending" },
  { id: 3, room: "ទីធ្លាមុខទង់ជាតិ", students: "ក្រុមទី២ (មករា, កក្កដា, សីហា)", day: "ថ្ងៃពុធ", shift: "ព្រឹក", status: "Missed" },
];

export default function CleaningSchedulePage() {
  const [schedules, setSchedules] = useState(INITIAL_SCHEDULES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintStudioOpen, setIsPrintStudioOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);

  const [form, setForm] = useState({
    room: "",
    students: "",
    day: "ថ្ងៃច័ន្ទ",
    shift: "ព្រឹក",
    status: "Pending"
  });

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.room.includes(searchTerm) || schedule.students.includes(searchTerm);
    const matchesStatus = statusFilter === "All" || schedule.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (schedule: any = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setForm(schedule);
    } else {
      setEditingSchedule(null);
      setForm({ room: "", students: "", day: "ថ្ងៃច័ន្ទ", shift: "ព្រឹក", status: "Pending" });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingSchedule) {
      setSchedules(schedules.map(s => s.id === editingSchedule.id ? { ...s, ...form } : s));
    } else {
      setSchedules([{ id: Date.now(), ...form }, ...schedules]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if(confirm("តើអ្នកពិតជាចង់លុបវេនសម្អាតនេះមែនទេ?")) {
      setSchedules(schedules.filter(s => s.id !== id));
    }
  };

  const markAsCompleted = (id: number) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, status: "Completed" } : s));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative dark:bg-gray-900/50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl text-primary flex items-center gap-3">
            <Calendar size={32} className="text-blue-500" />
            បញ្ជីវេនសម្អាត
          </h1>
          <p className="text-gray-500 mt-1">រៀបចំ និងតាមដានវេនសម្អាតតាមថ្នាក់ ឬទីតាំងក្នុងសាលា</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsPrintStudioOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-white text-primary border-2 border-primary rounded-lg font-bold shadow-sm hover:bg-gray-50 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <Printer size={20} /> ទាញយកទម្រង់ (A4)
          </button>
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold shadow-lg hover:shadow-xl hover:opacity-90 transition-all">
            <Plus size={20} /> បន្ថែមវេនថ្មី
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="ស្វែងរកទីតាំង ឬក្រុមសិស្ស..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-primary transition-all font-medium dark:bg-gray-900/50"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {["All", "Pending", "Completed", "Missed"].map(status => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                statusFilter === status 
                  ? "bg-primary text-white shadow-md" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {status === "All" ? "ទាំងអស់" : status === "Pending" ? "រង់ចាំសម្អាត" : status === "Completed" ? "រួចរាល់" : "អវត្តមាន/មិនបានធ្វើ"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 dark:bg-gray-900/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ទីតាំង/បន្ទប់</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ក្រុមទទួលខុសត្រូវ</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ថ្ងៃសម្អាត</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">វេន</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ស្ថានភាព</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSchedules.map(schedule => (
                <tr key={schedule.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-primary flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" /> {schedule.room}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-blue-400" /> {schedule.students}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">{schedule.day}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold">{schedule.shift}</span>
                  </td>
                  <td className="px-6 py-4">
                    {schedule.status === "Completed" && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"><CheckCircle size={14} /> រួចរាល់</span>}
                    {schedule.status === "Pending" && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200"><Clock size={14} /> រង់ចាំសម្អាត</span>}
                    {schedule.status === "Missed" && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200"><AlertTriangle size={14} /> មិនបានធ្វើ</span>}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    {schedule.status !== "Completed" && (
                      <button onClick={() => markAsCompleted(schedule.id)} className="text-sm font-bold text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
                        គូសថារួចរាល់
                      </button>
                    )}
                    <button onClick={() => handleOpenModal(schedule)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={18} /></button>
                    <button onClick={() => handleDelete(schedule.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {filteredSchedules.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                    មិនមានទិន្នន័យ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0d1b33]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="bg-primary px-6 py-4 flex items-center justify-between text-white">
               <h2 className="text-lg">{editingSchedule ? "កែប្រែវេនសម្អាត" : "បន្ថែមវេនថ្មី"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ទីតាំង / បន្ទប់</label>
                <input value={form.room} onChange={e => setForm({...form, room: e.target.value})} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-primary" placeholder="ឧ. បន្ទប់ 10A, ទីធ្លាមុខទង់ជាតិ" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ក្រុមទទួលខុសត្រូវ (សិស្ស)</label>
                <input value={form.students} onChange={e => setForm({...form, students: e.target.value})} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-primary" placeholder="ឧ. ក្រុមទី១ (រដ្ឋា, សុខា, មេសា)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">ថ្ងៃសម្អាត</label>
                  <select value={form.day} onChange={e => setForm({...form, day: e.target.value})} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-primary bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                    <option value="ថ្ងៃច័ន្ទ">ច័ន្ទ</option>
                    <option value="ថ្ងៃអង្គារ">អង្គារ</option>
                    <option value="ថ្ងៃពុធ">ពុធ</option>
                    <option value="ថ្ងៃព្រហស្បតិ៍">ព្រហស្បតិ៍</option>
                    <option value="ថ្ងៃសុក្រ">សុក្រ</option>
                    <option value="ថ្ងៃសៅរ៍">សៅរ៍</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">វេន</label>
                  <select value={form.shift} onChange={e => setForm({...form, shift: e.target.value})} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-primary bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                    <option value="ព្រឹក">ព្រឹក</option>
                    <option value="រសៀល">រសៀល</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ស្ថានភាព</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-primary bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                  <option value="Pending">រង់ចាំសម្អាត</option>
                  <option value="Completed">រួចរាល់</option>
                  <option value="Missed">អវត្តមាន/មិនបានធ្វើ</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 dark:bg-gray-900/50">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 border-2 rounded-lg hover:bg-gray-100">បោះបង់</button>
              <button onClick={handleSave} className="px-6 py-2.5 text-sm font-bold bg-primary text-white rounded-lg shadow-md hover:opacity-90">រក្សាទុក</button>
            </div>
          </div>
        </div>
      )}

      {/* Print Studio Modal */}
      {isPrintStudioOpen && (
        <CleaningSchedulePrintModal onClose={() => setIsPrintStudioOpen(false)} />
      )}
    </div>
  );
}
