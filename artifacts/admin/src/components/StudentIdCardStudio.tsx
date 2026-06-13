import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, Download, FileUp, Users, MapPin, User, ShieldCheck, Phone, Globe, Calendar } from 'lucide-react';
import ExcelJS from 'exceljs';
import { useAuth } from '@/lib/auth';
import api from '@/lib/axiosConfig';
import { useToast } from '@/hooks/use-toast';
import { PremiumFrontCard } from './id-card/PremiumFrontCard';
import { PremiumBackCard } from './id-card/PremiumBackCard';
import { IDCardEditor } from '@/editor/components/IDCardEditor';
import { ExactStudentData, ExactTemplateData, ThemeConfig, CardProps } from '@/types/student-id';
interface StudentIdCardStudioProps {
  students?: any[];
  onClose?: () => void;
  token?: string | null;
}

// ─── Card Themes ───────────────────────────────────────────────
const CARD_THEMES = [
  { id: 'midnight', name: 'ទម្រង់ទី ១ (Royal Midnight Gold)', headerBg: '#0b1a35', textColor: '#ffffff', titleColor: '#c9a030' },
  { id: 'crimson', name: 'ទម្រង់ទី ២ (Angkor Crimson Ivory)', headerBg: '#f9f3e8', textColor: '#8b1c1c', titleColor: '#c9a030' },
  { id: 'jade', name: 'ទម្រង់ទី ៣ (Dark Jade & Lotus)', headerBg: '#0e1f1a', textColor: '#7de8c4', titleColor: '#3cb88a' },
];

const DEFAULT_TEMPLATE: ExactTemplateData = {
  department: 'មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្តបាត់ដំបង',
  schoolNameKh: 'អនុវិទ្យាល័យ ផ្លូវមាស',
  schoolNameEn: 'PHLOV MEAS SECONDARY SCHOOL',
  slogan: 'វិន័យ ចំណេះដឹង សីលធម៌ សុខភាព',
  principalName: 'នាយកសាលា',
  logo: '/logosala.png',
  frontBg: '', backBg: '', stamp: '', signature: '',
  issueDate: '២៥ មិនា ២០២៣',
  expiryDate: '២៥ មិនា ២០២៧',
  khmerDate: 'ថ្ងៃអង្គារ ៦កើត ខែចេត្រ ឆ្នាំរោង ឆស័ក ព.ស. ២៥៦៦',
  issueLocation: 'បាត់ដំបង',
  theme: 'midnight', layout: 'classic',
};

const DEFAULT_STUDENT: ExactStudentData = {
  id: 'S-2024-001', nameKh: 'សុខ សុផាត', gender: 'ប្រុស',
  dob: '១ មករា ២០១០', grade: '១២ A', academicYear: '២០២៤-២០២៥',
  phone: '០៩៥ ៨៨៨ ៧៧៧', photo: '',
  birthPlace: 'ភូមិផ្លូវមាស ឃុំផ្លូវមាស ស្រុករតនមណ្ឌល ខេត្តបាត់ដំបង',
  fatherName: 'សួន មាន', motherName: 'រ៉ា សារិក',
  parentPhone: '០១២ ៣៤៥ ៦៧៨',
  currentAddress: 'ភូមិផ្លូវមាស ឃុំផ្លូវមាស ស្រុករតនមណ្ឌល ខេត្តបាត់ដំបង',
};

// ─── Extracted: FileUploadField ────────────────────────────────
// Moved OUTSIDE the parent component to prevent re-creation on every render
interface FileUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File, setter: (url: string) => void) => void;
}
const FileUploadField: React.FC<FileUploadFieldProps> = ({ label, value, onChange, onUpload }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-500">{label}</label>
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-md cursor-pointer transition-colors text-xs font-bold shrink-0">
        ជ្រើសរើស
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, onChange); }}
        />
      </label>
      <span className="text-xs text-gray-400 truncate max-w-[100px]">
        {value ? <span className="text-green-600 font-medium">✓ បានផ្ទុក</span> : 'គ្មានឯកសារ'}
      </span>
    </div>
  </div>
);

// ─── Front and Back Card Components moved to PremiumFrontCard / PremiumBackCard ───

// ─── Extracted: Single Card Pair (front + back) ───────────────
const CardPair: React.FC<CardProps & { frontStyle?: React.CSSProperties; backStyle?: React.CSSProperties }> = ({
  student, template, theme, frontStyle, backStyle
}) => (
  <>
    {/* Front */}
    <div className="relative bg-white overflow-hidden rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" style={{
      width: '54mm', height: '86mm', outline: '1px solid #e5e7eb',
      breakInside: 'avoid', ...frontStyle
    }}>
      <PremiumFrontCard student={student} template={template} theme={theme} />
    </div>
    {/* Back */}
    <div className="relative bg-white overflow-hidden flex flex-col rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" style={{
      width: '54mm', height: '86mm', outline: '1px solid #e5e7eb',
      breakInside: 'avoid', ...backStyle
    }}>
      <PremiumBackCard student={student} template={template} theme={theme} />
    </div>
  </>
);

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
const StudentIdCardStudio: React.FC<StudentIdCardStudioProps> = ({ students: apiStudents = [], onClose, token }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const headers = { Authorization: `Bearer ${token}` };

  const [template, setTemplate] = useState<ExactTemplateData>(DEFAULT_TEMPLATE);
  const [student, setStudent] = useState<ExactStudentData>(DEFAULT_STUDENT);
  // FIX #3: renamed from `students` to `studentList` to avoid shadowing props
  const [studentList, setStudentList] = useState<ExactStudentData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  // Layer 2: Editor mode toggle
  const [mode, setMode] = useState<'preview' | 'editor'>('preview');

  const printRef = useRef<HTMLDivElement>(null);

  const currentTheme = CARD_THEMES.find(t => t.id === template.theme) ?? CARD_THEMES[0];

  // FIX #2: Map API students — preserve real DOB when available (currently not in DB, kept as editable field)
  useEffect(() => {
    if (apiStudents.length === 0) return;
    const mapped: ExactStudentData[] = apiStudents.map(s => {
      let addr = 'បាត់ដំបង';
      try { addr = s.address?.startsWith('{') ? JSON.parse(s.address).province : (s.address || addr); } catch { /* ignore */ }
      return {
        id: s.studentId || String(s.id),
        nameKh: s.nameKh || '',
        gender: s.gender === 'Female' ? 'ស្រី' : 'ប្រុស',
        // NOTE: DB has no dateOfBirth column yet — leave empty so librarian can fill in manually
        dob: s.dateOfBirth || '',
        grade: s.grade || '',
        academicYear: `${s.enrollmentYear}-${(s.enrollmentYear ?? 2024) + 1}`,
        phone: s.phone || '',
        photo: s.photoUrl || '',
        birthPlace: addr,
        fatherName: s.fatherName || '',
        motherName: s.motherName || '',
        parentPhone: s.parentPhone || '',
        currentAddress: addr,
      };
    });
    setStudentList(mapped);
    setStudent(mapped[0]);
    setSelectedIndex(0);
  }, [apiStudents]);

  // FIX #5: useReactToPrint — replaces window.print()
  const handlePrintAll = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'ID_Cards_Batch',
    pageStyle: `
      @page { size: A4 portrait; margin: 10mm; }
      body { background: white !important; }
      .no-print { display: none !important; }
      .print-grid { display: grid; grid-template-columns: repeat(2, 54mm); gap: 10mm 5mm; justify-content: center; }
    `,
  });

  // FIX #4: handleUpload defined OUTSIDE render — stable reference via useCallback
  const handleUpload = useCallback(async (file: File, setter: (url: string) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data', ...headers } });
      setter(res.data?.url ?? URL.createObjectURL(file));
    } catch {
      setter(URL.createObjectURL(file));
    }
  }, [token]);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) return;
      const imported: ExactStudentData[] = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber < 2) return;
        const v = row.values as any[];
        imported.push({
          id: v[1]?.toString() || '', nameKh: v[2]?.toString() || '',
          gender: v[3]?.toString() || '', dob: v[4]?.toString() || '',
          grade: v[5]?.toString() || '', academicYear: v[6]?.toString() || '',
          phone: v[7]?.toString() || '', birthPlace: v[8]?.toString() || '',
          fatherName: v[9]?.toString() || '', motherName: v[10]?.toString() || '',
          parentPhone: v[11]?.toString() || '', currentAddress: v[12]?.toString() || '',
          photo: '',
        });
      });
      setStudentList(imported);
      if (imported.length > 0) { setStudent(imported[0]); setSelectedIndex(0); }
      // FIX #6: replaced alert() with toast
      toast({ description: `នាំចូល ${imported.length} នាក់ ពី Excel បានជោគជ័យ!` });
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadExcelTemplate = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Students');
    ws.columns = [
      { header: 'អត្តលេខ', key: 'id', width: 15 },
      { header: 'ឈ្មោះសិស្ស', key: 'nameKh', width: 20 },
      { header: 'ភេទ', key: 'gender', width: 10 },
      { header: 'ថ្ងៃកំណើត', key: 'dob', width: 15 },
      { header: 'ថ្នាក់ទី', key: 'grade', width: 10 },
      { header: 'ឆ្នាំសិក្សា', key: 'academicYear', width: 15 },
      { header: 'លេខទូរសព្ទសិស្ស', key: 'phone', width: 15 },
      { header: 'ទីកន្លែងកំណើត', key: 'birthPlace', width: 30 },
      { header: 'ឈ្មោះឪពុក', key: 'fatherName', width: 20 },
      { header: 'ឈ្មោះម្តាយ', key: 'motherName', width: 20 },
      { header: 'លេខទូរសព្ទអាណាព្យាបាល', key: 'parentPhone', width: 18 },
      { header: 'ទីលំនៅបច្ចុប្បន្ន', key: 'currentAddress', width: 30 },
    ];
    ws.addRow({ id: 'S-001', nameKh: 'សុខ មករា', gender: 'ប្រុស', dob: '០១ មករា ២០១០', grade: '១២ A', academicYear: '២០២៤-២០២៥', phone: '012345678', birthPlace: 'បាត់ដំបង', fatherName: 'សួន មាន', motherName: 'រ៉ា សារិក', parentPhone: '012111222', currentAddress: 'បាត់ដំបង' });
    const buffer = await wb.xlsx.writeBuffer();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    link.download = 'ID_Card_Batch_Template.xlsx';
    link.click();
  };

  const downloadCardImage = async (side: 'front' | 'back') => {
    const elem = document.getElementById(`preview-${side}`);
    if (!elem) return;
    try {
      const canvas = await html2canvas(elem, { scale: 3, backgroundColor: null });
      const link = document.createElement('a');
      link.download = `${student.id}_${side}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) { console.error(e); }
  };

  const patchTemplate = (patch: Partial<ExactTemplateData>) => setTemplate(prev => ({ ...prev, ...patch }));
  const patchStudent  = (patch: Partial<ExactStudentData>)  => setStudent(prev => ({ ...prev, ...patch }));

  // FIX #7: Student selector handler
  const handleSelectStudent = (idx: number) => {
    setSelectedIndex(idx);
    setStudent(studentList[idx]);
  };

  const batchStudents = studentList.length > 0 ? studentList : [student];

  return (
    <div className={onClose ? 'fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm overflow-y-auto' : 'min-h-screen bg-gray-50 dark:bg-gray-900'}>
      <div className={onClose ? 'min-h-screen p-4 flex justify-center' : ''}>
        <div className={`bg-white dark:bg-gray-800 ${onClose ? 'rounded-xl shadow-2xl w-full max-w-[1600px] my-4' : 'w-full min-h-screen'} flex flex-col`}>

          {/* ── Header ── */}
          <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b dark:border-gray-700 flex items-center justify-between sticky top-0 z-50 print:hidden">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <span className="text-purple-600">🎫</span> Student ID Card Studio
            </h1>

            {/* ── Mode Tab Switcher ── */}
            <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              {(['preview', 'editor'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    padding: '6px 16px', fontSize: '12px', fontWeight: 700,
                    cursor: 'pointer', border: 'none',
                    background: mode === m ? '#0D1B3D' : 'white',
                    color: mode === m ? 'white' : '#6b7280',
                    transition: 'all 0.15s',
                  }}
                >
                  {m === 'preview' ? '👁 Preview' : '✏️ Template Editor'}
                </button>
              ))}
            </div>

            {onClose && (
              <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border">
                បិទ
              </button>
            )}
          </div>

          {/* ── EDITOR MODE (Layer 2) ── */}
          {mode === 'editor' && (
            <div style={{ flex: 1, padding: '16px', minHeight: '600px' }}>
              <IDCardEditor student={student} template={template} />
            </div>
          )}

          {/* ── PREVIEW MODE (existing, unchanged) ── */}
          {mode === 'preview' && (
          <div className="flex flex-col xl:flex-row flex-1 p-6 gap-6">

            {/* ── LEFT: Editor ── */}
            <div className="flex-1 space-y-6 max-w-5xl print:hidden">

              {/* Section 1: School Info */}
              <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-moul text-purple-800 text-sm flex items-center gap-2 mb-4">
                  <span className="bg-purple-100 p-1.5 rounded-lg">🏫</span> ព័ត៌មានសាលា និងរូបភាព
                </h3>

                {/* Theme Picker */}
                <div className="pb-4 border-b border-gray-100">
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">ទម្រង់កាត (Theme)</label>
                  <div className="flex flex-wrap gap-3">
                    {CARD_THEMES.map(t => (
                      <button key={t.id} onClick={() => patchTemplate({ theme: t.id })}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all flex items-center gap-2
                          ${template.theme === t.id ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <span className="w-3 h-3 rounded-full shadow-sm inline-block" style={{ backgroundColor: t.headerBg }} />
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'មន្ទីរអប់រំ / ខេត្ត', key: 'department' as const, cls: 'font-khmer' },
                    { label: 'ឈ្មោះសាលា (ខ្មែរ)', key: 'schoolNameKh' as const, cls: 'font-moul' },
                    { label: 'ឈ្មោះសាលា (English)', key: 'schoolNameEn' as const, cls: 'font-bold' },
                    { label: 'ពាក្យស្លោក', key: 'slogan' as const, cls: 'font-khmer' },
                    { label: 'ឈ្មោះនាយកសាលា', key: 'principalName' as const, cls: 'font-moul' },
                  ].map(({ label, key, cls }) => (
                    <div key={key}>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
                      <input value={template[key]} onChange={e => patchTemplate({ [key]: e.target.value })}
                        className={`w-full border dark:border-gray-600 rounded-md px-3 py-2 text-sm outline-none focus:border-purple-500 bg-white dark:bg-gray-700 dark:text-white ${cls}`} />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                  <FileUploadField label="ឡូហ្គោសាលា" value={template.logo || ''} onChange={url => patchTemplate({ logo: url })} onUpload={handleUpload} />
                  <FileUploadField label="Background មុខ" value={template.frontBg || ''} onChange={url => patchTemplate({ frontBg: url })} onUpload={handleUpload} />
                  <FileUploadField label="Background ក្រោយ" value={template.backBg || ''} onChange={url => patchTemplate({ backBg: url })} onUpload={handleUpload} />
                  <FileUploadField label="ត្រាសាលា" value={template.stamp || ''} onChange={url => patchTemplate({ stamp: url })} onUpload={handleUpload} />
                  <FileUploadField label="ហត្ថលេខា" value={template.signature || ''} onChange={url => patchTemplate({ signature: url })} onUpload={handleUpload} />
                </div>
              </div>

              {/* Section 2: Date & Location */}
              <div className="bg-yellow-50/30 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-xl p-5 shadow-sm">
                <h3 className="font-moul text-primary text-sm flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 p-1.5 rounded-lg text-blue-600">📅</span> កាលបរិច្ឆេទ និងទីកន្លែង
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'ថ្ងៃចេញកាត', key: 'issueDate' as const },
                    { label: 'ថ្ងៃផុតកំណត់', key: 'expiryDate' as const },
                    { label: 'ថ្ងៃ ខែ ឆ្នាំ (ខ្មែរ)', key: 'khmerDate' as const },
                    { label: 'ទីកន្លែងធ្វើកាត', key: 'issueLocation' as const },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
                      <input value={template[key]} onChange={e => patchTemplate({ [key]: e.target.value })}
                        className="w-full border dark:border-gray-600 rounded-md px-3 py-2 text-sm font-khmer outline-none focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Student Info */}
              <div className="bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-5 shadow-sm">
                <h3 className="font-moul text-primary text-sm flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 p-1.5 rounded-lg text-blue-600">🎓</span> ព័ត៌មានសិស្ស
                </h3>

                {/* FIX #7: Student selector dropdown */}
                {studentList.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-blue-100">
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block flex items-center gap-1">
                      <Users size={12} /> ជ្រើសសិស្សសម្រាប់កែប្រែ ({studentList.length} នាក់)
                    </label>
                    <select
                      value={selectedIndex}
                      onChange={e => handleSelectStudent(Number(e.target.value))}
                      className="w-full border-2 border-blue-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-khmer focus:border-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                    >
                      {studentList.map((s, i) => (
                        <option key={i} value={i}>{s.nameKh} — {s.id} ({s.grade})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'អត្តលេខ', key: 'id' as const },
                    { label: 'ឈ្មោះសិស្ស', key: 'nameKh' as const },
                    { label: 'ភេទ', key: 'gender' as const },
                    { label: 'ថ្ងៃកំណើត', key: 'dob' as const },
                    { label: 'ថ្នាក់ទី', key: 'grade' as const },
                    { label: 'ឆ្នាំសិក្សា', key: 'academicYear' as const },
                    { label: 'លេខទូរសព្ទ', key: 'phone' as const },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
                      <input value={student[key]} onChange={e => patchStudent({ [key]: e.target.value })}
                        className="w-full border dark:border-gray-600 rounded-md px-3 py-2 text-sm font-khmer outline-none focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 mt-3 border-t border-blue-100">
                  {[
                    { label: 'ទីកន្លែងកំណើត', key: 'birthPlace' as const, span: 'md:col-span-2' },
                    { label: 'ឈ្មោះឪពុក', key: 'fatherName' as const, span: '' },
                    { label: 'ឈ្មោះម្តាយ', key: 'motherName' as const, span: '' },
                    { label: 'លេខទូរសព្ទអាណាព្យាបាល', key: 'parentPhone' as const, span: '' },
                    { label: 'ទីលំនៅបច្ចុប្បន្ន', key: 'currentAddress' as const, span: 'md:col-span-2' },
                  ].map(({ label, key, span }) => (
                    <div key={key} className={span}>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
                      <input value={student[key]} onChange={e => patchStudent({ [key]: e.target.value })}
                        className="w-full border dark:border-gray-600 rounded-md px-3 py-2 text-sm font-khmer outline-none focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white" />
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-blue-100">
                  <FileUploadField label="រូបថតសិស្ស" value={student.photo || ''} onChange={url => patchStudent({ photo: url })} onUpload={handleUpload} />
                </div>
              </div>

              {/* Section 4: Batch Print */}
              <div className="bg-purple-50/30 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl p-5 shadow-sm no-print">
                <h3 className="font-moul text-purple-800 text-sm flex items-center gap-2 mb-4">
                  <span className="bg-purple-100 p-1.5 rounded-lg">📄</span> បោះពុម្ព / នាំចូលជាក្រុម
                </h3>
                <div className="flex flex-wrap items-center gap-4">
                  <button onClick={downloadExcelTemplate}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-bold shadow-sm hover:bg-purple-700 transition-colors">
                    <Download size={16} /> ទាញយកគំរូ Excel
                  </button>
                  <label className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-md cursor-pointer transition-colors text-sm font-bold dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                    <FileUp size={16} /> នាំចូល Excel
                    <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleExcelUpload} />
                  </label>
                  {studentList.length > 0 && (
                    <span className="text-sm text-green-600 font-medium">✓ {studentList.length} នាក់</span>
                  )}
                  <div className="ml-auto">
                    <button onClick={() => handlePrintAll()}
                      className="flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-md text-sm font-bold shadow-sm hover:bg-rose-600 transition-colors">
                      🖨 បោះពុម្ពទាំងអស់ជា PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Live Preview ── */}
            <div className="w-[300px] xl:w-[380px] shrink-0 sticky top-[80px] h-max bg-gray-100 dark:bg-gray-900 rounded-2xl p-5 border-4 border-gray-200 dark:border-gray-700 shadow-inner flex flex-col items-center gap-5 print:hidden">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Preview</p>

              {/* Front Preview */}
              <div id="preview-front" className="relative bg-white shadow-xl overflow-hidden rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" style={{
                width: '54mm', height: '86mm'
              }}>
                <PremiumFrontCard student={student} template={template} theme={currentTheme} />
              </div>

              {/* Back Preview */}
              <div id="preview-back" className="relative bg-white shadow-xl overflow-hidden flex flex-col rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" style={{
                width: '54mm', height: '86mm'
              }}>
                <PremiumBackCard student={student} template={template} theme={currentTheme} />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full">
                <button onClick={() => setShowPreviewModal(true)}
                  className="flex-1 py-2 text-xs font-bold bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors">
                  🔍 Preview ពេញ
                </button>
                <button onClick={() => downloadCardImage('front')}
                  className="flex-1 py-2 text-[10px] font-bold bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                  ⬇ Front
                </button>
                <button onClick={() => downloadCardImage('back')}
                  className="flex-1 py-2 text-[10px] font-bold bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                  ⬇ Back
                </button>
              </div>
            </div>
          </div>
          )} {/* end mode === 'preview' */}

          {/* ── Hidden Print Grid (react-to-print target) ── */}
          <div ref={printRef} className="hidden print:block print:w-[210mm] print:bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <style>{`
              @media print {
                @page { size: A4 portrait; margin: 10mm; }
                body { background: white !important; margin: 0; }
                .print-grid { display: grid; grid-template-columns: repeat(2, 54mm); gap: 10mm 5mm; justify-content: center; }
                .page-break { page-break-after: always; }
              }
            `}</style>
            {Array.from({ length: Math.ceil(batchStudents.length / 10) }).map((_, pageIdx) => {
              const page = batchStudents.slice(pageIdx * 10, (pageIdx + 1) * 10);
              return (
                <div key={pageIdx} className={`print-grid${pageIdx > 0 ? ' page-break' : ''} mb-8`}>
                  {page.map((s, i) => (
                    <CardPair key={i} student={s} template={template} theme={currentTheme} />
                  ))}
                </div>
              );
            })}
          </div>

          {/* ── Preview Modal ── */}
          {showPreviewModal && (
            <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
              <div className="bg-white rounded-2xl p-6 md:p-10 max-w-5xl w-full flex flex-col items-center relative max-h-[95vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                <button onClick={() => setShowPreviewModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 font-bold text-lg">
                  ✕
                </button>
                <h2 className="text-xl font-bold text-primary mb-8 font-moul">
                  គំរូកាតសិស្ស ( Sample Card Preview )
                </h2>
                <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
                  {/* Big Front (1.58× scale = ID card size scaled up for preview) */}
                  <div className="relative bg-white shadow-2xl overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" style={{ width: '85.6mm', height: '136mm', outline: '1px solid #ddd' }}>
                    <div style={{ transform: 'scale(1.585)', transformOrigin: 'top left', width: '54mm', height: '86mm' }}>
                      <div className="relative overflow-hidden rounded-xl shadow-md" style={{ width: '54mm', height: '86mm', outline: '1px solid #e5e7eb' }}>
                        <PremiumFrontCard student={student} template={template} theme={currentTheme} />
                      </div>
                    </div>
                  </div>
                  {/* Big Back */}
                  <div className="relative bg-white shadow-2xl overflow-hidden flex flex-col dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" style={{ width: '85.6mm', height: '136mm', outline: '1px solid #ddd' }}>
                    <div style={{ transform: 'scale(1.585)', transformOrigin: 'top left', width: '54mm', height: '86mm' }}>
                      <div className="relative overflow-hidden flex flex-col rounded-xl shadow-md" style={{ width: '54mm', height: '86mm', outline: '1px solid #e5e7eb' }}>
                        <PremiumBackCard student={student} template={template} theme={currentTheme} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StudentIdCardStudio;
