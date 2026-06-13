import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { 
  Settings, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  BookOpen,
  ArrowLeft,
  ChevronDown,
  FlaskConical,
  Users,
  Layout
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axiosConfig";

interface MergedSubjectConfig {
  id: number;
  nameEn: string;
  nameKh: string;
  code: string;
  maxScore: string | null;
  coefficient: string | null;
}

export default function GradingStandards() {
  const { lang, t } = useTranslation();
  const { token } = useAuth();
  const { toast } = useToast();
  
  const [gradeLevel, setGradeLevel] = useState(10);
  const [isScienceTrack, setIsScienceTrack] = useState(true);
  const [data, setData] = useState<MergedSubjectConfig[]>([]);
  const [configsDraft, setConfigsDraft] = useState<Record<number, { maxScore: string, coefficient: string }>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";


  useEffect(() => {
    fetchMergedData();
  }, [gradeLevel, isScienceTrack]);

  const fetchMergedData = async () => {
    setIsLoading(true);
    try {
      // Diagnostic Ping
      const ping = await api.get(`/subject-configs/test`).catch(() => null);
      if (!ping) {
        console.error("API ROUTE TEST FAILED: /api/subject-configs/test is unreachable.");
      } else {
        console.log("API ROUTE TEST SUCCESS:", ping.data.message);
      }

      const res = await api.get(`/subject-configs?gradeLevel=${gradeLevel}&isScienceTrack=${isScienceTrack}`);
      
      const mergedData: MergedSubjectConfig[] = res.data.data || [];
      setData(mergedData);
      
      // Initialize draft values
      const draft: Record<number, { maxScore: string, coefficient: string }> = {};
      mergedData.forEach(item => {
        draft[item.id] = {
          maxScore: item.maxScore || "50.00",
          coefficient: item.coefficient || "1.00"
        };
      });
      setConfigsDraft(draft);
    } catch (error: any) {
      console.error("Error fetching merged data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch grading standards.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigChange = (subjectId: number, field: 'maxScore' | 'coefficient', value: string) => {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setConfigsDraft(prev => {
      const current = prev[subjectId] || { maxScore: "50.00", coefficient: "1.00" };
      const next = { ...current, [field]: value };
      
      // Auto-calculate logic: if coefficient changes, update maxScore (base 50)
      if (field === 'coefficient' && value !== "") {
        const coeff = parseFloat(value);
        if (!isNaN(coeff)) {
          next.maxScore = (coeff * 50).toFixed(2);
        }
      }
      // If maxScore changes, update coefficient (base 50)
      else if (field === 'maxScore' && value !== "") {
        const score = parseFloat(value);
        if (!isNaN(score)) {
          next.coefficient = (score / 50).toFixed(2);
        }
      }
      
      return { ...prev, [subjectId]: next };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const payload = Object.entries(configsDraft).map(([subjectId, cfg]) => ({
      gradeLevel,
      subjectId: parseInt(subjectId),
      maxScore: cfg.maxScore || "0",
      coefficient: cfg.coefficient || "0",
      isScienceTrack: gradeLevel >= 10 ? isScienceTrack : false
    }));

    try {
      await api.post(`/subject-configs/batch`, { configs: payload });
      
      toast({
        title: lang === 'km' ? "ជោគជ័យ" : "Success",
        description: lang === 'km' ? "រក្សាទុកដោយជោគជ័យ!" : "Saved successfully!",
      });
      
      fetchMergedData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const setAllToValue = (val: string) => {
    const coeff = parseFloat(val) / 50;
    const newDraft: Record<number, { maxScore: string, coefficient: string }> = {};
    data.forEach(item => {
      newDraft[item.id] = {
        maxScore: val,
        coefficient: coeff.toFixed(2)
      };
    });
    setConfigsDraft(newDraft);
    toast({
      title: lang === 'km' ? "បានកំណត់" : "Batch Set",
      description: lang === 'km' ? `បានកំណត់ ${val} គ្រប់មុខវិជ្ជា` : `Set all to ${val}`,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 font-sans relative">
      
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-40 bg-gray-50/80 backdrop-blur-md py-4 -mx-4 px-4 mb-2 flex items-center justify-between border-b border-gray-100 transition-all dark:bg-gray-900/50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary rounded-xl text-white shadow-lg shadow-blue-900/20">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-primary">
              {lang === 'km' ? "កំណត់ស្ដង់ដារពិន្ទុ" : "Grading Standards"}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
               {lang === 'km' ? `ថ្នាក់ទី ${gradeLevel}` : `Grade ${gradeLevel}`} 
               {gradeLevel >= 10 && ` • ${isScienceTrack ? "Science" : "Social"}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-xl shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 hover:bg-[#2a4e8c] min-w-[180px] justify-center"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {lang === 'km' ? "រក្សាទុកការផ្លាស់ប្តូរ" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-gray-100 p-8 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-50 rounded-xl text-primary">
              <Layout size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                {lang === 'km' ? "ការគ្រប់គ្រងមេគុណ" : "Coefficient Management"}
              </h1>
              <p className="text-sm text-gray-400 font-medium mt-1">
                {lang === 'km' ? "កំណត់ពិន្ទុពេញសម្រាប់មុខវិជ្ជាមធ្យមសិក្សា" : "Define maximum possible scores for secondary subjects."}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex flex-col justify-center gap-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <BookOpen size={14} className="text-primary" /> {lang === 'km' ? "កំណត់រហ័ស" : "Bulk Actions"}
          </label>
          <button 
            onClick={() => setAllToValue("50.00")}
            disabled={isLoading || data.length === 0}
            className="w-full text-xs font-bold py-3 px-4 border-2 border-primary text-primary rounded-xl hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-30"
          >
            {lang === 'km' ? "កំណត់ ៥០ ទាំងអស់" : "Set All to 50"}
          </button>
        </div>
      </div>

      {/* Selectors Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm space-y-4 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Settings size={14} className="text-primary" /> {lang === 'km' ? "កម្រិតថ្នាក់" : "Grade Level"}
          </label>
          <div className="relative group">
            <select 
              value={gradeLevel}
              onChange={(e) => setGradeLevel(parseInt(e.target.value))}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold text-primary outline-none appearance-none focus:border-primary focus:ring-4 focus:ring-blue-50 transition-all cursor-pointer dark:bg-gray-900/50"
            >
              {[7, 8, 9, 10, 11, 12].map(lvl => (
                <option key={lvl} value={lvl}>
                  {lang === 'km' ? `ថ្នាក់ទី ${lvl}` : `Grade ${lvl}`}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-primary transition-colors" />
          </div>
        </div>

        {gradeLevel >= 10 && (
          <div className="lg:col-span-3 bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex flex-col sm:flex-row items-center gap-6 animate-in fade-in zoom-in-95 duration-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="flex-1 space-y-4 w-full">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FlaskConical size={14} className="text-primary" /> {lang === 'km' ? "ផ្នែកសិក្សា" : "Track Selection"}
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsScienceTrack(true)}
                  className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold transition-all border-2 ${
                    isScienceTrack 
                    ? "bg-emerald-50 border-emerald-600 text-emerald-700 shadow-sm" 
                    : "bg-white border-gray-100 text-gray-400 hover:border-emerald-200"
                  }`}
                >
                  <FlaskConical size={18} />
                  {lang === 'km' ? "ថ្នាក់វិទ្យាសាស្ត្រពិត" : "Science Track"}
                </button>
                <button
                  onClick={() => setIsScienceTrack(false)}
                  className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold transition-all border-2 ${
                    !isScienceTrack 
                    ? "bg-amber-50 border-amber-600 text-amber-700 shadow-sm" 
                    : "bg-white border-gray-100 text-gray-400 hover:border-amber-200"
                  }`}
                >
                  <Users size={18} />
                  {lang === 'km' ? "ថ្នាក់វិទ្យាសាស្ត្រសង្គម" : "Social Track"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subject List Bento Box */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden min-h-[400px] relative dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
             <BookOpen size={20} className="text-primary" />
             <h3 className="text-sm font-bold text-gray-700">
               {lang === 'km' ? "បញ្ជីមុខវិជ្ជា និងមេគុណពិន្ទុ" : "Subject List & Coefficients"}
             </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-full uppercase tracking-widest">
               {lang === 'km' ? `ថ្នាក់ទី ${gradeLevel}` : `Grade ${gradeLevel}`}
            </span>
            {gradeLevel >= 10 && (
              <span className={`px-3 py-1 text-white text-[10px] font-black rounded-full uppercase tracking-widest ${isScienceTrack ? "bg-emerald-600" : "bg-amber-600"}`}>
                {isScienceTrack ? "Science" : "Social"}
              </span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-4 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="relative">
              <Loader2 size={48} className="animate-spin text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
              </div>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">
              {lang === 'km' ? "កំពុងទាញយកទិន្នន័យ..." : "Fetching Data..."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-20 text-center">ល.រ</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">ឈ្មោះមុខវិជ្ជា</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">កូដ</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">មេគុណ</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">ពិន្ទុពេញ (Max)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-8 py-5 text-center text-xs font-bold text-gray-300 group-hover:text-primary transition-colors">{index + 1}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                          (configsDraft[item.id]?.maxScore && configsDraft[item.id]?.maxScore !== "0.00" && configsDraft[item.id]?.maxScore !== "0") 
                          ? "bg-blue-100 text-primary" 
                          : "bg-gray-100 text-gray-300"
                        }`}>
                          {item.code?.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-700 group-hover:text-primary transition-colors">
                            {lang === 'km' ? item.nameKh : item.nameEn}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium group-hover:text-primary/50 transition-colors">{item.nameEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded group-hover:bg-blue-100 group-hover:text-primary transition-colors">{item.code}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <input 
                        type="text"
                        inputMode="decimal"
                        value={configsDraft[item.id]?.coefficient || ""}
                        onChange={(e) => handleConfigChange(item.id, 'coefficient', e.target.value)}
                        placeholder="1.00"
                        className="w-20 border-2 rounded-lg px-2 py-2 text-sm font-black text-center outline-none transition-all focus:border-primary bg-gray-50/50 dark:bg-gray-900/50"
                      />
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="inline-flex items-center gap-3">
                         <input 
                          type="text"
                          inputMode="decimal"
                          value={configsDraft[item.id]?.maxScore || ""}
                          onChange={(e) => handleConfigChange(item.id, 'maxScore', e.target.value)}
                          placeholder="50"
                          className={`w-32 border-2 rounded-xl px-4 py-3 text-sm font-black text-center outline-none transition-all shadow-inner group-hover:bg-white ${
                            !configsDraft[item.id]?.maxScore || configsDraft[item.id]?.maxScore === "0" || configsDraft[item.id]?.maxScore === "0.00"
                            ? "bg-red-50 border-red-100 text-red-600 focus:border-red-400" 
                            : "bg-gray-50 border-gray-100 text-primary focus:border-primary"
                          }`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="p-6 bg-blue-50 rounded-full mb-6">
                          <AlertCircle size={48} className="text-primary opacity-40" />
                        </div>
                        <h4 className="text-lg font-bold text-primary mb-2">
                          {lang === 'km' ? "មិនទាន់មានមុខវិជ្ជា" : "No Subjects Listed"}
                        </h4>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">
                          {lang === 'km' 
                            ? "សូមជ្រើសរើសកម្រិតថ្នាក់ផ្សេង ឬពិនិត្យមើលការកំណត់មុខវិជ្ជាមេនៅក្នុងប្រព័ន្ធ។" 
                            : "Please select a different grade level or check the master subject configurations in settings."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
