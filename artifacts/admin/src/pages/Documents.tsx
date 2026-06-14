import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/axiosConfig";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  FileUp, 
  FileCode,
  Download, 
  Trash2, 
  Plus, 
  Search, 
  X, 
  RefreshCw, 
  AlertCircle, 
  Calendar, 
  BookOpen,
  HelpCircle,
  FileCheck,
  Briefcase,
  Grid,
  List,
  Folder,
  SlidersHorizontal,
  ChevronDown,
  Edit2,
  Trash
} from "lucide-react";

interface SchoolDocument {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string; // "pdf" | "excel" | "word"
  uploadedById: number;
  categoryId: number | null;
  categoryNameEn?: string | null;
  categoryNameKh?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DocumentCategory {
  id: number;
  nameEn: string;
  nameKh: string;
  createdAt: string;
  updatedAt: string;
}

const localized = {
  title: { km: "ឯកសារសាលារៀន", en: "School Documents" },
  subtitle: { km: "បញ្ជីឯកសាររដ្ឋបាលសម្រាប់គ្រូបង្រៀននិងបុគ្គលិក", en: "Administrative documents and templates for teachers and staff" },
  addDoc: { km: "បន្ថែមឯកសារ", en: "Add Document" },
  searchPlace: { km: "ស្វែងរកឯកសារតាមចំណងជើង ឬឈ្មោះឯកសារ...", en: "Search documents by title or file name..." },
  uploadSuccess: { km: "បញ្ចូលឯកសារដោយជោគជ័យ!", en: "Document uploaded successfully!" },
  uploadFailed: { km: "ការបញ្ចូលឯកសារបរាជ័យ!", en: "Failed to upload document!" },
  deleteSuccess: { km: "លុបឯកសារដោយជោគជ័យ!", en: "Document deleted successfully!" },
  deleteFailed: { km: "ការលុបឯកសារបរាជ័យ!", en: "Failed to delete document!" },
  confirmDelete: { km: "តើអ្នកពិតជាចង់លុបឯកសារនេះមែនទេ? ការលុបនេះនឹងលុបឯកសារពិតចេញពីម៉ាស៊ីនបម្រើផងដែរ។", en: "Are you sure you want to delete this document? This will also remove the physical file from the server." },
  totalDocs: { km: "ឯកសារសរុប", en: "Total Documents" },
  pdfDocs: { km: "ឯកសារ PDF", en: "PDF Documents" },
  excelDocs: { km: "ឯកសារ Excel", en: "Excel Sheets" },
  wordDocs: { km: "ឯកសារ Word", en: "Word Documents" },
  download: { km: "ទាញយក", en: "Download" },
  noDocs: { km: "មិនមានឯកសារឡើយ", en: "No documents available" },
  noDocsDesc: { km: "មិនទាន់មានឯកសាររដ្ឋបាលត្រូវបានបង្ហោះនៅឡើយទេ។", en: "There are no administrative documents uploaded yet." },
  modalTitle: { km: "បន្ថែមឯកសារថ្មី", en: "Upload New Document" },
  modalTitleLabel: { km: "ចំណងជើងឯកសារ", en: "Document Title" },
  modalTitlePlace: { km: "ឧ. កាលវិភាគឆមាសទី២", en: "e.g. Semester 2 Schedule" },
  modalDescLabel: { km: "សេចក្តីពិពណ៌នា (មិនបង្ខំ)", en: "Description (Optional)" },
  modalDescPlace: { km: "ឧ. ឯកសារទម្រង់រៀបចំដោយក្រសួង...", en: "e.g. Guidelines issued by the Ministry..." },
  modalFileLabel: { km: "ជ្រើសរើសឯកសារ", en: "Select Document File" },
  modalFileHelp: { km: "គាំទ្រតែ PDF, Word, Excel (អតិបរមា 20MB)", en: "Supports PDF, Word, Excel (Max 20MB)" },
  modalUploading: { km: "កំពុងបញ្ជូនឯកសារ...", en: "Uploading document file..." },
  modalSaving: { km: "កំពុងរក្សាទុកទិន្នន័យ...", en: "Saving database record..." },
  modalSaveBtn: { km: "រក្សាទុកឯកសារ", en: "Save Document" },
  modalCancelBtn: { km: "បោះបង់", en: "Cancel" },
  fileSizeError: { km: "ទំហំឯកសារធំពេក (អតិបរមា 20MB)!", en: "File is too large (Max 20MB)!" },
  fileTypeError: { km: "ប្រភេទឯកសារមិនត្រឹមត្រូវ (PDF, Word, Excel តែប៉ុណ្ណោះ)!", en: "Invalid file type (PDF, Word, Excel only)!" },
  requiredFields: { km: "សូមបំពេញព័ត៌មានដែលចាំបាច់!", en: "Please fill in all required fields!" }
};

export default function DocumentsPage() {
  const { token, user } = useAuth();
  const { lang } = useTranslation();
  const { toast } = useToast();

  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  
  // Custom filter and view states
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [viewLayout, setViewLayout] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Modal & Upload states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUploadCategoryId, setSelectedUploadCategoryId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  
  // Category Form states
  const [newCatNameKh, setNewCatNameKh] = useState("");
  const [newCatNameEn, setNewCatNameEn] = useState("");
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editCatNameKh, setEditCatNameKh] = useState("");
  const [editCatNameEn, setEditCatNameEn] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === "admin";

  const fetchCategories = async () => {
    try {
      const result = await api.get("/document-categories").then(res => res.data);
      setCategories(result.data ?? []);
    } catch (err: any) {
      console.error("Failed to load document categories", err);
    }
  };

  const fetchDocuments = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const result = await api.get("/documents").then(res => res.data);
      setDocuments(result.data ?? []);
      await fetchCategories();
    } catch (err: any) {
      console.error("Failed to load documents", err);
      toast({
        title: lang === "km" ? "បរាជ័យ" : "Error",
        description: lang === "km" ? "មិនអាចទាញយកទិន្នន័យឯកសារបានទេ" : "Failed to load documents list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validation: Size < 20MB
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast({
          title: lang === "km" ? "ទំហំធំពេក" : "File Too Large",
          description: lang === "km" ? localized.fileSizeError.km : localized.fileSizeError.en,
          variant: "destructive",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // Validation: Type PDF, Word, Excel
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();
      const allowedExts = ["pdf", "doc", "docx", "xls", "xlsx"];
      if (!ext || !allowedExts.includes(ext)) {
        toast({
          title: lang === "km" ? "ប្រភេទឯកសារមិនត្រឹមត្រូវ" : "Invalid File Type",
          description: lang === "km" ? localized.fileTypeError.km : localized.fileTypeError.en,
          variant: "destructive",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUploadAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) {
      toast({
        title: lang === "km" ? "ខ្វះព័ត៌មាន" : "Missing Fields",
        description: lang === "km" ? localized.requiredFields.km : localized.requiredFields.en,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const apiBase = import.meta.env.DEV 
      ? "/api" 
      : (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "") + "/api";

    // Use XMLHttpRequest to get accurate progress updates
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${apiBase}/upload-document`, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const uploadResult = JSON.parse(xhr.responseText);
          setUploading(false);
          setSaving(true);

          // Save metadata
          const docPayload = {
            title,
            description: description || null,
            fileUrl: uploadResult.url,
            fileName: uploadResult.fileName,
            fileSize: uploadResult.fileSize,
            fileType: uploadResult.fileType,
            categoryId: selectedUploadCategoryId ? Number(selectedUploadCategoryId) : null
          };

          await api.post("/documents", docPayload).then(res => res.data);

          toast({
            title: lang === "km" ? "ជោគជ័យ" : "Success",
            description: lang === "km" ? localized.uploadSuccess.km : localized.uploadSuccess.en,
          });

          // Reset modal states
          setTitle("");
          setDescription("");
          setSelectedUploadCategoryId("");
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          setIsModalOpen(false);
          
          // Refetch
          fetchDocuments();
        } catch (err: any) {
          console.error("Failed to save metadata", err);
          toast({
            title: lang === "km" ? "បរាជ័យ" : "Upload Failed",
            description: lang === "km" ? localized.uploadFailed.km : localized.uploadFailed.en,
            variant: "destructive",
          });
        } finally {
          setSaving(false);
        }
      } else {
        console.error("Upload server error code:", xhr.status, xhr.responseText);
        setUploading(false);
        toast({
          title: lang === "km" ? "បរាជ័យ" : "Upload Failed",
          description: lang === "km" ? localized.uploadFailed.km : localized.uploadFailed.en,
          variant: "destructive",
        });
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      toast({
        title: lang === "km" ? "បរាជ័យ" : "Network Error",
        description: lang === "km" ? "មានបញ្ហាតំណភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើ" : "Failed to connect to the server",
        variant: "destructive",
      });
    };

    xhr.send(formData);
  };

  const handleDelete = async (id: number) => {
    const kmMsg = localized.confirmDelete.km;
    const enMsg = localized.confirmDelete.en;
    if (confirm(lang === "km" ? kmMsg : enMsg)) {
      try {
        await api.delete(`/documents/${id}`).then(res => res.data);
        toast({
          title: lang === "km" ? "លុបជោគជ័យ" : "Deleted",
          description: lang === "km" ? localized.deleteSuccess.km : localized.deleteSuccess.en,
        });
        fetchDocuments();
      } catch (err: any) {
        console.error("Delete failed", err);
        toast({
          title: lang === "km" ? "បរាជ័យ" : "Delete Failed",
          description: lang === "km" ? localized.deleteFailed.km : localized.deleteFailed.en,
          variant: "destructive",
        });
      }
    }
  };

  // Category CRUD Operations
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameKh || !newCatNameEn) return;
    try {
      await api.post("/document-categories", { nameKh: newCatNameKh, nameEn: newCatNameEn });
      toast({
        title: lang === "km" ? "ជោគជ័យ" : "Success",
        description: lang === "km" ? "បានបង្កើតប្រភេទឯកសារថ្មី!" : "Created new document category!",
      });
      setNewCatNameKh("");
      setNewCatNameEn("");
      fetchCategories();
    } catch (err: any) {
      toast({
        title: lang === "km" ? "បរាជ័យ" : "Error",
        description: err.message || "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatId || !editCatNameKh || !editCatNameEn) return;
    try {
      await api.put(`/document-categories/${editingCatId}`, { nameKh: editCatNameKh, nameEn: editCatNameEn });
      toast({
        title: lang === "km" ? "ជោគជ័យ" : "Success",
        description: lang === "km" ? "បានកែប្រែប្រភេទឯកសារ!" : "Updated document category!",
      });
      setEditingCatId(null);
      setEditCatNameKh("");
      setEditCatNameEn("");
      fetchCategories();
      fetchDocuments(); // refresh document rows to show updated category name
    } catch (err: any) {
      toast({
        title: lang === "km" ? "បរាជ័យ" : "Error",
        description: err.message || "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm(lang === "km" ? "តើអ្នកពិតជាចង់លុបប្រភេទឯកសារនេះមែនទេ? ឯកសារក្នុងប្រភេទនេះនឹងលែងមានប្រភេទទៀតហើយ។" : "Are you sure you want to delete this category? Documents under this category will become uncategorized.")) return;
    try {
      await api.delete(`/document-categories/${id}`).then(res => res.data);
      toast({
        title: lang === "km" ? "លុបជោគជ័យ" : "Deleted",
        description: lang === "km" ? "បានលុបប្រភេទឯកសារដោយជោគជ័យ!" : "Deleted document category successfully!",
      });
      fetchCategories();
      fetchDocuments();
    } catch (err: any) {
      toast({
        title: lang === "km" ? "បរាជ័យ" : "Error",
        description: err.message || "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  // Search & Filtering & Sorting logic
  const filteredDocs = documents.filter(doc => {
    const q = search.toLowerCase();
    const matchesSearch = (
      doc.title.toLowerCase().includes(q) ||
      (doc.description ?? "").toLowerCase().includes(q) ||
      doc.fileName.toLowerCase().includes(q)
    );
    const matchesType = !selectedType || doc.fileType === selectedType;
    const matchesCategory = selectedCategoryId === null || doc.categoryId === selectedCategoryId;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const sortedDocs = [...filteredDocs].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "nameAZ":
        return a.title.localeCompare(b.title, lang === "km" ? "km-KH" : "en-US");
      case "nameZA":
        return b.title.localeCompare(a.title, lang === "km" ? "km-KH" : "en-US");
      case "sizeDesc":
        return b.fileSize - a.fileSize;
      case "sizeAsc":
        return a.fileSize - b.fileSize;
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Category counts
  const totalCount = documents.length;
  const pdfCount = documents.filter(d => d.fileType === "pdf").length;
  const excelCount = documents.filter(d => d.fileType === "excel").length;
  const wordCount = documents.filter(d => d.fileType === "word").length;

  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const getFileStyle = (type: string) => {
    switch (type) {
      case "pdf":
        return {
          bg: "bg-rose-50 hover:bg-rose-100/70 border-rose-100",
          text: "text-rose-600",
          iconBg: "bg-rose-500",
          accentColor: "rose"
        };
      case "excel":
        return {
          bg: "bg-emerald-50 hover:bg-emerald-100/70 border-emerald-100",
          text: "text-emerald-600",
          iconBg: "bg-emerald-500",
          accentColor: "emerald"
        };
      case "word":
        return {
          bg: "bg-blue-50 hover:bg-blue-100/70 border-blue-100",
          text: "text-blue-600",
          iconBg: "bg-blue-500",
          accentColor: "blue"
        };
      default:
        return {
          bg: "bg-slate-50 hover:bg-slate-100/70 border-slate-100",
          text: "text-slate-600",
          iconBg: "bg-slate-500",
          accentColor: "slate"
        };
    }
  };

  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{lang === "km" ? "កំពុងទាញយក..." : "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <FileText size={36} className="text-primary" /> 
            {lang === "km" ? localized.title.km : localized.title.en}
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">
            {lang === "km" ? localized.subtitle.km : localized.subtitle.en}
          </p>
        </div>

        <div className="flex items-center flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
          {/* Refresh Button */}
          <button
            onClick={() => fetchDocuments(true)}
            disabled={refreshing}
            className="p-3 text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 bg-white transition-colors disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            title="Refresh"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          </button>

          {/* Search Input */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white flex-1 md:w-64 shadow-sm focus-within:border-primary transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <Search size={16} className="text-gray-400" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder={lang === "km" ? localized.searchPlace.km : localized.searchPlace.en} 
              className="text-sm outline-none bg-transparent w-full font-medium" 
            />
          </div>

          {/* Manage Categories (Admin only) */}
          {isAdmin && (
            <button
              onClick={() => setIsCatModalOpen(true)}
              className="flex items-center justify-center gap-2 border border-gray-200 hover:border-primary hover:bg-blue-50/30 text-gray-700 px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all text-sm whitespace-nowrap bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            >
              <Folder size={16} className="text-primary" />
              {lang === "km" ? "រៀបចំប្រភេទ" : "Categories"}
            </button>
          )}

          {/* Add Document Button (Admin only) */}
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/10 transition-all hover:-translate-y-[1px] active:translate-y-0 text-sm whitespace-nowrap"
            >
              <Plus size={16} />
              {lang === "km" ? localized.addDoc.km : localized.addDoc.en}
            </button>
          )}
        </div>
      </div>

      {/* ── Stats Bar (Interactive Filters) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div 
          onClick={() => setSelectedType(null)}
          className={`cursor-pointer transition-all duration-300 border rounded-xl p-4 shadow-sm flex items-center gap-4 ${
            selectedType === null
              ? "bg-blue-50/80 border-primary ring-2 ring-primary/10 scale-[1.02]"
              : "bg-white border-gray-100 hover:border-gray-300"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider">{lang === "km" ? localized.totalDocs.km : localized.totalDocs.en}</p>
            <p className="text-2xl font-bold text-gray-800 mt-0.5">{totalCount}</p>
          </div>
        </div>

        {/* PDF Documents */}
        <div 
          onClick={() => setSelectedType(selectedType === "pdf" ? null : "pdf")}
          className={`cursor-pointer transition-all duration-300 border rounded-xl p-4 shadow-sm flex items-center gap-4 ${
            selectedType === "pdf"
              ? "bg-rose-50/80 border-rose-300 ring-2 ring-rose-200/50 scale-[1.02]"
              : "bg-white border-gray-100 hover:border-rose-200"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider">{lang === "km" ? localized.pdfDocs.km : localized.pdfDocs.en}</p>
            <p className="text-2xl font-bold text-gray-800 mt-0.5">{pdfCount}</p>
          </div>
        </div>

        {/* Excel Sheets */}
        <div 
          onClick={() => setSelectedType(selectedType === "excel" ? null : "excel")}
          className={`cursor-pointer transition-all duration-300 border rounded-xl p-4 shadow-sm flex items-center gap-4 ${
            selectedType === "excel"
              ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-200/50 scale-[1.02]"
              : "bg-white border-gray-100 hover:border-emerald-200"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider">{lang === "km" ? localized.excelDocs.km : localized.excelDocs.en}</p>
            <p className="text-2xl font-bold text-gray-800 mt-0.5">{excelCount}</p>
          </div>
        </div>

        {/* Word Templates */}
        <div 
          onClick={() => setSelectedType(selectedType === "word" ? null : "word")}
          className={`cursor-pointer transition-all duration-300 border rounded-xl p-4 shadow-sm flex items-center gap-4 ${
            selectedType === "word"
              ? "bg-blue-50/80 border-blue-300 ring-2 ring-blue-200/50 scale-[1.02]"
              : "bg-white border-gray-100 hover:border-blue-200"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider">{lang === "km" ? localized.wordDocs.km : localized.wordDocs.en}</p>
            <p className="text-2xl font-bold text-gray-800 mt-0.5">{wordCount}</p>
          </div>
        </div>
      </div>

      {/* ── Dynamic Category Pills, Sort & View Controls ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        {/* Left Side: Category Pills Scrollable */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none flex-1 max-w-full">
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider whitespace-nowrap mr-1">
            📂 {lang === "km" ? "ប្រភេទឯកសារ៖" : "Category:"}
          </span>
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
              selectedCategoryId === null
                ? "bg-primary text-white border-transparent shadow-sm shadow-blue-900/10"
                : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
            }`}
          >
            {lang === "km" ? "ទាំងអស់" : "All"}
          </button>
          
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                selectedCategoryId === cat.id
                  ? "bg-primary text-white border-transparent shadow-sm"
                  : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
              }`}
            >
              {lang === "km" ? cat.nameKh : cat.nameEn}
            </button>
          ))}
        </div>

        {/* Right Side: Sorting Selector and Layout Toggle */}
        <div className="flex items-center justify-between lg:justify-end gap-3 flex-wrap sm:flex-nowrap">
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-xs font-bold text-gray-600 outline-none cursor-pointer bg-transparent"
            >
              <option value="newest">{lang === "km" ? "កាលបរិច្ឆេទ: ថ្មីបំផុត" : "Date: Newest"}</option>
              <option value="oldest">{lang === "km" ? "កាលបរិច្ឆេទ: ចាស់បំផុត" : "Date: Oldest"}</option>
              <option value="nameAZ">{lang === "km" ? "ឈ្មោះ: ក - អ" : "Name: A - Z"}</option>
              <option value="nameZA">{lang === "km" ? "ឈ្មោះ: អ - ក" : "Name: Z - A"}</option>
              <option value="sizeDesc">{lang === "km" ? "ទំហំ: ធំ - តូច" : "Size: Large - Small"}</option>
              <option value="sizeAsc">{lang === "km" ? "ទំហំ: តូច - ធំ" : "Size: Small - Large"}</option>
            </select>
          </div>

          {/* Grid/List Layout Buttons */}
          <div className="flex items-center border border-gray-200 rounded-xl p-1 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <button
              onClick={() => setViewLayout("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewLayout === "grid"
                  ? "bg-slate-100 text-primary font-bold"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title={lang === "km" ? "ប្លង់ក្រឡា" : "Grid Layout"}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewLayout("list")}
              className={`p-1.5 rounded-lg transition-all ${
                viewLayout === "list"
                  ? "bg-slate-100 text-primary font-bold"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title={lang === "km" ? "ប្លង់បញ្ជី" : "List Layout"}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Document List / Grid Container ── */}
      {sortedDocs.length > 0 ? (
        viewLayout === "grid" ? (
          /* Grid View Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {sortedDocs.map((doc) => {
              const styles = getFileStyle(doc.fileType);
              const dateStr = new Date(doc.createdAt).toLocaleDateString(lang === "km" ? "km-KH" : "en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
              });

              return (
                <div 
                  key={doc.id}
                  className={`bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 flex flex-col justify-between relative group ${styles.bg}`}
                >
                  <div>
                    {/* File Icon and Badges */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${styles.iconBg} text-white flex items-center justify-center font-extrabold shadow-md shadow-${styles.accentColor}-200`}>
                        <span className="uppercase text-xs tracking-wider font-mono">
                          {doc.fileType === "excel" ? "XLS" : doc.fileType === "word" ? "DOC" : "PDF"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {doc.categoryId && (
                          <span className="text-[10px] font-black uppercase bg-blue-50 text-primary border border-blue-100 px-2.5 py-1 rounded-full shadow-sm">
                            {lang === "km" ? doc.categoryNameKh : doc.categoryNameEn}
                          </span>
                        )}
                        <span className="text-[10px] font-black uppercase bg-white/80 backdrop-blur-sm border px-2.5 py-1 rounded-full text-gray-500 shadow-sm font-mono dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                          {formatBytes(doc.fileSize)}
                        </span>
                      </div>
                    </div>

                    {/* Document Title & Description */}
                    <h3 className="font-bold text-lg text-gray-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {doc.title}
                    </h3>

                    {doc.description ? (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                        {doc.description}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 italic mt-2">
                        {lang === "km" ? "គ្មានសេចក្តីពិពណ៌នា" : "No description provided"}
                      </p>
                    )}
                  </div>

                  {/* Footer Details */}
                  <div className="border-t border-gray-100/80 pt-4 mt-5">
                    {/* Original Filename */}
                    <p className="text-[11px] font-bold font-mono text-gray-400 truncate mb-3" title={doc.fileName}>
                      📂 {doc.fileName}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      {/* Date */}
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Calendar size={12} />
                        {dateStr}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        {/* Download */}
                        <a
                          href={doc.fileUrl}
                          download={doc.fileName}
                          className="flex items-center gap-1 bg-primary hover:opacity-90 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-colors"
                          title={lang === "km" ? localized.download.km : localized.download.en}
                        >
                          <Download size={12} />
                          <span>{lang === "km" ? localized.download.km : localized.download.en}</span>
                        </a>

                        {/* Delete (Admin only) */}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                            title={lang === "km" ? "លុប" : "Delete"}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List/Table View Layout */
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[10%]">
                      {lang === "km" ? "ប្រភេទ" : "Type"}
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[40%]">
                      {lang === "km" ? "ចំណងជើងឯកសារ / ឈ្មោះហ្វាល" : "Document Title / File Name"}
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[20%]">
                      {lang === "km" ? "ប្រភេទឯកសារ" : "Category"}
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[10%]">
                      {lang === "km" ? "ទំហំ" : "Size"}
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[10%]">
                      {lang === "km" ? "ថ្ងៃបង្ហោះ" : "Upload Date"}
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-[10%] text-right">
                      {lang === "km" ? "សកម្មភាព" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedDocs.map((doc) => {
                    const styles = getFileStyle(doc.fileType);
                    const dateStr = new Date(doc.createdAt).toLocaleDateString(lang === "km" ? "km-KH" : "en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    });

                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider font-mono border ${styles.bg} ${styles.text}`}>
                            {doc.fileType === "excel" ? "excel" : doc.fileType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-bold text-gray-800 text-sm leading-snug line-clamp-1">{doc.title}</div>
                            {doc.description && (
                              <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{doc.description}</div>
                            )}
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-sm">📂 {doc.fileName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {doc.categoryId ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-primary border border-blue-100">
                              {lang === "km" ? doc.categoryNameKh : doc.categoryNameEn}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              {lang === "km" ? "គ្មានប្រភេទ" : "Uncategorized"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500 font-bold">
                          {formatBytes(doc.fileSize)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-bold">
                          {dateStr}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={doc.fileUrl}
                              download={doc.fileName}
                              className="p-2 bg-slate-50 hover:bg-primary text-slate-500 hover:text-white rounded-lg transition-colors border border-gray-100"
                              title={lang === "km" ? localized.download.km : localized.download.en}
                            >
                              <Download size={13} />
                            </a>
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(doc.id)}
                                className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 hover:border-rose-100 rounded-lg border border-gray-100 transition-colors"
                                title={lang === "km" ? "លុប" : "Delete"}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm max-w-xl mx-auto mt-10 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <HelpCircle size={48} className="text-gray-300 mx-auto mb-4 animate-bounce" />
          <h3 className="font-bold text-lg text-gray-700">
            {lang === "km" ? localized.noDocs.km : localized.noDocs.en}
          </h3>
          <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
            {lang === "km" ? localized.noDocsDesc.km : localized.noDocsDesc.en}
          </p>
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 bg-primary hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/10 transition-all"
            >
              <Plus size={16} />
              {lang === "km" ? localized.addDoc.km : localized.addDoc.en}
            </button>
          )}
        </div>
      )}

      {/* ── Add Document Modal (Admin only) ── */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            
            {/* Modal Header */}
            <div className="bg-primary text-white px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <FileUp size={20} />
                {lang === "km" ? localized.modalTitle.km : localized.modalTitle.en}
              </h2>
              <button 
                onClick={() => {
                  if (!uploading && !saving) setIsModalOpen(false);
                }}
                disabled={uploading || saving}
                className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors disabled:opacity-30 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUploadAndSave} className="p-6 space-y-4">
              {/* Title input */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  {lang === "km" ? localized.modalTitleLabel.km : localized.modalTitleLabel.en} <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={lang === "km" ? localized.modalTitlePlace.km : localized.modalTitlePlace.en}
                  disabled={uploading || saving}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-primary rounded-xl px-4 py-3 text-sm font-medium outline-none transition-colors disabled:opacity-60"
                />
              </div>

              {/* Category Select Dropdown */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  📂 {lang === "km" ? "ជ្រើសរើសប្រភេទឯកសារ" : "Select Document Category"}
                </label>
                <select
                  value={selectedUploadCategoryId}
                  onChange={e => setSelectedUploadCategoryId(e.target.value)}
                  disabled={uploading || saving}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-primary rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <option value="">-- {lang === "km" ? "គ្មានប្រភេទ" : "No Category"} --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {lang === "km" ? cat.nameKh : cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description input */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  {lang === "km" ? localized.modalDescLabel.km : localized.modalDescLabel.en}
                </label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={lang === "km" ? localized.modalDescPlace.km : localized.modalDescPlace.en}
                  disabled={uploading || saving}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-primary rounded-xl px-4 py-3 text-sm font-medium outline-none transition-colors disabled:opacity-60"
                />
              </div>

              {/* File Input container */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  {lang === "km" ? localized.modalFileLabel.km : localized.modalFileLabel.en} <span className="text-red-500">*</span>
                </label>
                
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors relative group">
                  <input 
                    type="file"
                    required
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    disabled={uploading || saving}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  
                  <div className="space-y-2 pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                      <FileUp size={20} />
                    </div>
                    
                    {file ? (
                      <div className="text-sm font-bold text-gray-800 break-all px-2">
                        📄 {file.name}
                        <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase">
                          {formatBytes(file.size)}
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-gray-700">
                          {lang === "km" ? "ចុចទីនេះ ដើម្បីជ្រើសរើសឯកសារ" : "Click here to choose file"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {lang === "km" ? localized.modalFileHelp.km : localized.modalFileHelp.en}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Uploading progress bar */}
              {uploading && (
                <div className="space-y-1.5 pt-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-600">
                    <span className="flex items-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                      {lang === "km" ? localized.modalUploading.km : localized.modalUploading.en}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-50 rounded-full h-2 overflow-hidden shadow-inner border border-blue-100">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Database saving state indicator */}
              {saving && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 pt-2 animate-in fade-in duration-200">
                  <div className="w-4 h-4 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                  <span>{lang === "km" ? localized.modalSaving.km : localized.modalSaving.en}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={uploading || saving}
                  className="px-5 py-2.5 text-sm border rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 dark:bg-gray-900/50"
                >
                  {lang === "km" ? localized.modalCancelBtn.km : localized.modalCancelBtn.en}
                </button>
                <button
                  type="submit"
                  disabled={uploading || saving || !title || !file}
                  className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-7 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/10 transition-colors disabled:opacity-50"
                >
                  {lang === "km" ? localized.modalSaveBtn.km : localized.modalSaveBtn.en}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Manage Categories Modal (Admin only) ── */}
      {isCatModalOpen && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            
            {/* Modal Header */}
            <div className="bg-primary text-white px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Folder size={20} />
                {lang === "km" ? "គ្រប់គ្រងប្រភេទឯកសារ" : "Manage Document Categories"}
              </h2>
              <button 
                onClick={() => setIsCatModalOpen(false)}
                className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Left Column: Category List (3/5 width) */}
              <div className="lg:col-span-3 space-y-3">
                <h3 className="font-black text-xs text-gray-400 uppercase tracking-wider mb-2">
                  📂 {lang === "km" ? "បញ្ជីប្រភេទបច្ចុប្បន្ន" : "Current Categories List"}
                </h3>
                
                <div className="border border-slate-100 rounded-xl overflow-hidden max-h-[350px] overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
                  {categories.length > 0 ? (
                    categories.map(cat => (
                      <div key={cat.id} className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{cat.nameKh}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{cat.nameEn}</p>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setEditCatNameKh(cat.nameKh);
                              setEditCatNameEn(cat.nameEn);
                            }}
                            className="p-1.5 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                            title={lang === "km" ? "កែសម្រួល" : "Edit"}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title={lang === "km" ? "លុប" : "Delete"}
                          >
                            <Trash size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-gray-400 text-xs italic">
                      {lang === "km" ? "មិនទាន់មានប្រភេទឯកសារនៅឡើយទេ" : "No categories created yet."}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Add or Edit Form (2/5 width) */}
              <div className="lg:col-span-2 bg-slate-50/70 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
                
                {editingCatId ? (
                  /* Edit Form */
                  <form onSubmit={handleUpdateCategory} className="space-y-4">
                    <div>
                      <h4 className="font-black text-primary text-xs uppercase tracking-wider mb-3">
                        ✏️ {lang === "km" ? "កែសម្រួលប្រភេទ" : "Edit Category"}
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 ml-0.5">
                            {lang === "km" ? "ឈ្មោះប្រភេទ (ភាសាខ្មែរ)" : "Category Name (Khmer)"}
                          </label>
                          <input
                            type="text"
                            required
                            value={editCatNameKh}
                            onChange={e => setEditCatNameKh(e.target.value)}
                            placeholder="ឧ. កម្រងសំណួរស្ទង់មតិ"
                            className="w-full bg-white border border-slate-200 focus:border-primary rounded-xl px-3.5 py-2 text-xs font-semibold outline-none transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 ml-0.5">
                            {lang === "km" ? "ឈ្មោះប្រភេទ (English)" : "Category Name (English)"}
                          </label>
                          <input
                            type="text"
                            required
                            value={editCatNameEn}
                            onChange={e => setEditCatNameEn(e.target.value)}
                            placeholder="e.g. Surveys & Questionnaires"
                            className="w-full bg-white border border-slate-200 focus:border-primary rounded-xl px-3.5 py-2 text-xs font-semibold outline-none transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCatId(null);
                          setEditCatNameKh("");
                          setEditCatNameEn("");
                        }}
                        className="px-4 py-2 border bg-white rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors flex-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                      >
                        {lang === "km" ? "បោះបង់" : "Cancel"}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex-1"
                      >
                        {lang === "km" ? "រក្សាទុក" : "Save Changes"}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Create Form */
                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <div>
                      <h4 className="font-black text-primary text-xs uppercase tracking-wider mb-3">
                        ➕ {lang === "km" ? "បន្ថែមប្រភេទថ្មី" : "Add New Category"}
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 ml-0.5">
                            {lang === "km" ? "ឈ្មោះប្រភេទ (ភាសាខ្មែរ)" : "Category Name (Khmer)"}
                          </label>
                          <input
                            type="text"
                            required
                            value={newCatNameKh}
                            onChange={e => setNewCatNameKh(e.target.value)}
                            placeholder="ឧ. កម្រងសំណួរស្ទង់មតិ"
                            className="w-full bg-white border border-slate-200 focus:border-primary rounded-xl px-3.5 py-2 text-xs font-semibold outline-none transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 ml-0.5">
                            {lang === "km" ? "ឈ្មោះប្រភេទ (English)" : "Category Name (English)"}
                          </label>
                          <input
                            type="text"
                            required
                            value={newCatNameEn}
                            onChange={e => setNewCatNameEn(e.target.value)}
                            placeholder="e.g. Surveys & Questionnaires"
                            className="w-full bg-white border border-slate-200 focus:border-primary rounded-xl px-3.5 py-2 text-xs font-semibold outline-none transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full mt-3 px-4 py-2.5 bg-primary hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/5 transition-colors"
                    >
                      {lang === "km" ? "បង្កើតប្រភេទ" : "Create Category"}
                    </button>
                  </form>
                )}
                
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 bg-slate-50/50 border-t flex justify-end">
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl text-xs transition-colors"
              >
                {lang === "km" ? "បិទ" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
