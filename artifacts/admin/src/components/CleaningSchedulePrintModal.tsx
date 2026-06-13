import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, X, Settings2, Users, FileSpreadsheet, FileText, Shuffle, Palette } from "lucide-react";
import { useListStudents, useListClassrooms } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";

interface Props {
  onClose: () => void;
}

export default function CleaningSchedulePrintModal({ onClose }: Props) {
  const componentRef = useRef<HTMLDivElement>(null);
  const { user, token } = useAuth();
  
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>();
  const { data: classroomsData } = useListClassrooms({ request: { headers } });
  
  // @ts-ignore - queryKey is injected by the generated hook
  const { data: studentsData } = useListStudents(
    { classId: selectedClassId, limit: 1000 }, 
    { request: { headers }, query: { enabled: !!selectedClassId } as any }
  );

  const availableClassrooms = classroomsData?.data?.filter(c => user?.role === "admin" || c.teacherId === user?.id) || [];
  // Template Metadata State
  const [template, setTemplate] = useState({
    district: "បាត់ដំបង",
    schoolName: "អនុវិទ្យាល័យ ផ្លូវមាស",
    className: "10",
    president: "",
    vice1: "",
    vice2: "",
    teacherName: "",
    principalTitle: "នាយកសាលា",
    locationDate: "សៀមរាប, ថ្ងៃទី.........ខែ...........ឆ្នាំ២០២៤",
    theme: "classic" // 'classic' | 'modern' | 'minimal' | 'elegant' | 'image'
  });

  // Table Data State (10 rows x 6 days)
  const [tableData, setTableData] = useState(() => {
    const data = [];
    for(let r=0; r<10; r++) {
      data.push(["", "", "", "", "", ""]);
    }
    return data;
  });

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...tableData];
    newData[rowIndex][colIndex] = value;
    setTableData(newData);
  };

  const handleRandomize = () => {
    if (!studentsData?.data || studentsData.data.length === 0) {
      alert("មិនមានទិន្នន័យសិស្សនៅក្នុងថ្នាក់នេះទេ ឬមិនទាន់បានជ្រើសរើសថ្នាក់។");
      return;
    }
    
    // We already fetch strictly by classId, so no manual filtering needed
    const availableStudents = [...studentsData.data];

    // Shuffle array
    const shuffled = [...availableStudents].sort(() => 0.5 - Math.random());
    
    // Distribute across 6 days
    const newData = [];
    for(let r=0; r<10; r++) newData.push(["", "", "", "", "", ""]);
    
    const numDays = 6;
    let studentIndex = 0;
    
    // Fill row by row, column by column
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < numDays; c++) {
        if (studentIndex < shuffled.length) {
          newData[r][c] = shuffled[studentIndex].nameKh;
          studentIndex++;
        }
      }
    }
    
    setTableData(newData);
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Cleaning_Schedule_${template.className}`,
  });

  const exportToExcel = () => {
    const tableHeaders = ["ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [tableHeaders, ...tableData].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Cleaning_Schedule_${template.className}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToWord = () => {
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <style>
          body { font-family: 'Khmer OS Battambang', 'Battambang', sans-serif; font-size: 11pt; }
          .moul { font-family: 'Khmer OS Moul Light', 'Moul', cursive; }
          table { width: 100%; border-collapse: collapse; }
          td, th { padding: 5px; }
        </style>
      </head>
      <body>
        
        <!-- Header -->
        <table style="border: none; margin-bottom: 20px;">
          <tr>
            <td style="width: 50%; vertical-align: top; border: none;">
              <p style="margin: 0;">ការិយាល័យ អ.យ.ក ស្រុក <strong>${template.district}</strong></p>
              <p style="margin: 0;">វិទ្យាល័យ <strong>${template.schoolName}</strong></p>
            </td>
            <td style="width: 50%; text-align: center; vertical-align: top; border: none;">
              <p class="moul" style="margin: 0; font-size: 14pt;">ព្រះរាជាណាចក្រកម្ពុជា</p>
              <p class="moul" style="margin: 0; font-size: 12pt;">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
              <p style="margin: 0; font-size: 16pt;">~ ✤ ~</p>
            </td>
          </tr>
        </table>

        <!-- Title -->
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 class="moul" style="color: var(--color-primary); font-size: 16pt; margin: 0;">វេនសម្អាតប្រចាំថ្ងៃ</h1>
          <h2 class="moul" style="color: var(--color-primary); font-size: 14pt; margin: 0;">សម្រាប់ថ្នាក់ទី ${template.className}</h2>
        </div>

        <!-- Main Table -->
        <table border="1" style="text-align: center; margin-bottom: 20px;">
          <tr style="background-color: #4ca1af; color: white;">
            <th class="moul">ចន្ទ</th>
            <th class="moul">អង្គារ</th>
            <th class="moul">ពុធ</th>
            <th class="moul">ព្រហស្បតិ៍</th>
            <th class="moul">សុក្រ</th>
            <th class="moul">សៅរ៍</th>
          </tr>
          ${tableData.map(row => `<tr style="height: 35px;">${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}
        </table>

        <!-- Sub-headers / Officers -->
        <div style="margin-bottom: 30px;">
          <p style="margin: 0;"><strong>បញ្ជាក់៖</strong> ប្រធានថ្នាក់៖ <strong>${template.president}</strong></p>
          <p style="margin: 0; margin-left: 50px;">អនុប្រធានទី១៖ <strong>${template.vice1}</strong></p>
          <p style="margin: 0; margin-left: 50px;">អនុប្រធានទី២៖ <strong>${template.vice2}</strong></p>
        </div>

        <!-- Signatures -->
        <table style="border: none;">
          <tr>
            <td style="width: 50%; text-align: center; vertical-align: bottom; border: none;">
              <p style="margin: 0; font-weight: bold;">បានឃើញ និងឯកភាព</p>
              <p class="moul" style="margin: 0; margin-bottom: 70px;">${template.principalTitle}</p>
            </td>
            <td style="width: 50%; text-align: center; vertical-align: bottom; border: none;">
              <p style="margin: 0; font-size: 10pt;">${template.locationDate}</p>
              <p class="moul" style="margin: 0; margin-bottom: 70px;">គ្រូទទួលបន្ទុកថ្នាក់</p>
              <p style="margin: 0; font-weight: bold;">${template.teacherName}</p>
            </td>
          </tr>
        </table>

      </body>
      </html>
    `;
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
    const link = document.createElement("a");
    link.href = source;
    link.download = `Cleaning_Schedule_${template.className}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getThemeStyles = () => {
    switch (template.theme) {
      case 'modern':
        return {
          border: 'absolute inset-[10mm] border-[6px] border-[#3b82f6] rounded-[40px] pointer-events-none z-10 opacity-90',
          badge: 'bg-[#3b82f6] px-12 py-3 rounded-2xl text-center shadow-lg',
          badgeText: 'text-white',
          tableHeader: 'bg-[#3b82f6] text-white border-[#2563eb]',
          tableCell: 'border-[#bfdbfe]',
          tableBorder: 'border-[#bfdbfe]'
        };
      case 'minimal':
        return {
          border: 'absolute inset-[10mm] border-2 border-gray-800 pointer-events-none z-10',
          badge: 'border-b-[3px] border-gray-800 px-8 py-2 text-center',
          badgeText: 'text-gray-900',
          tableHeader: 'bg-gray-100 text-gray-900 border-gray-800',
          tableCell: 'border-gray-300',
          tableBorder: 'border-gray-800'
        };
      case 'elegant':
        return {
          border: 'absolute inset-[10mm] border-[8px] border-ridge border-yellow-600 pointer-events-none z-10 opacity-90',
          badge: 'border-2 border-yellow-600 bg-yellow-50 px-12 py-4 rounded-full text-center shadow-sm relative',
          badgeText: 'text-yellow-900',
          tableHeader: 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white border-yellow-700',
          tableCell: 'border-yellow-200',
          tableBorder: 'border-yellow-600'
        };
      case 'image':
        return {
          border: 'image',
          badge: 'border-2 border-yellow-500 bg-yellow-50 px-10 py-3 rounded-[30px] text-center shadow-sm relative',
          badgeText: 'text-primary',
          tableHeader: 'bg-[#4ca1af] text-white border-black',
          tableCell: 'border-black',
          tableBorder: 'border-black'
        };
      case 'classic':
      default:
        return {
          border: 'absolute inset-[10mm] border-[4px] border-double border-primary pointer-events-none z-10 opacity-80',
          badge: 'border-2 border-yellow-500 bg-yellow-50 px-10 py-3 rounded-[30px] text-center shadow-sm relative',
          badgeText: 'text-primary',
          tableHeader: 'bg-[#4ca1af] text-white border-black',
          tableCell: 'border-black',
          tableBorder: 'border-black'
        };
    }
  };

  const themeConfig = getThemeStyles();

  return (
    <div className="fixed inset-0 z-[100] bg-[#0d1b33]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[95vh] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <Settings2 size={20} />
            <h2 className="font-bold text-lg">រៀបចំទម្រង់វេនសម្អាតថ្នាក់រៀន (Cleaning Schedule Studio)</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors bg-white/10 rounded-full p-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"><X size={20} /></button>
        </div>

        {/* Studio Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900/50">
          
          {/* Left Panel: Settings */}
          <div className="w-full lg:w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 flex flex-col dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="p-5 space-y-6 flex-1">
              
              {/* Style Settings */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Palette size={14} /> ការរចនាស៊ុម និងទម្រង់ (Theme)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setTemplate({...template, theme: 'classic'})} className={`px-2 py-2.5 text-xs font-bold rounded-lg border-2 transition-all ${template.theme === 'classic' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>បុរាណ (Classic)</button>
                  <button onClick={() => setTemplate({...template, theme: 'elegant'})} className={`px-2 py-2.5 text-xs font-bold rounded-lg border-2 transition-all ${template.theme === 'elegant' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>ប្រណិត (Elegant)</button>
                  <button onClick={() => setTemplate({...template, theme: 'modern'})} className={`px-2 py-2.5 text-xs font-bold rounded-lg border-2 transition-all ${template.theme === 'modern' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>ទំនើប (Modern)</button>
                  <button onClick={() => setTemplate({...template, theme: 'minimal'})} className={`px-2 py-2.5 text-xs font-bold rounded-lg border-2 transition-all ${template.theme === 'minimal' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>សាមញ្ញ (Minimal)</button>
                  <button onClick={() => setTemplate({...template, theme: 'image'})} className={`col-span-2 px-2 py-2.5 text-xs font-bold rounded-lg border-2 transition-all ${template.theme === 'image' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>រូបភាពស៊ុមខាងក្រៅ (Custom Image)</button>
                </div>
              </div>

              {/* Institutional Details */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users size={14} /> ព័ត៌មានទូទៅ
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">ការិយាល័យ អ.យ.ក ស្រុក</label>
                    <input type="text" value={template.district} onChange={e => setTemplate({...template, district: e.target.value})} className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">ឈ្មោះសាលា</label>
                    <input type="text" value={template.schoolName} onChange={e => setTemplate({...template, schoolName: e.target.value})} className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">សម្រាប់ថ្នាក់</label>
                    <select 
                      value={selectedClassId || ""} 
                      onChange={e => {
                        const cid = Number(e.target.value);
                        setSelectedClassId(cid);
                        const selectedClass = availableClassrooms.find(c => c.id === cid);
                        if (selectedClass) {
                          setTemplate({
                            ...template, 
                            className: selectedClass.name,
                            teacherName: selectedClass.teacher?.nameEn || selectedClass.teacher?.nameKh || template.teacherName
                          });
                        }
                      }} 
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    >
                      <option value="" disabled>-- ជ្រើសរើសថ្នាក់ --</option>
                      {availableClassrooms.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Auto Randomize Action */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-800 font-medium mb-2 leading-relaxed">
                  រៀបចំបញ្ជីឈ្មោះសិស្សចូលតារាងដោយស្វ័យប្រវត្តិ (ទាញពី Database)។
                </p>
                <button 
                  onClick={handleRandomize}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95"
                >
                  <Shuffle size={14} /> រៀបចំវេនដោយស្វ័យប្រវត្តិ
                </button>
              </div>

              {/* Personnel Details */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">សមាសភាព</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">ប្រធានថ្នាក់</label>
                    <input type="text" value={template.president} onChange={e => setTemplate({...template, president: e.target.value})} className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" placeholder="ឈ្មោះប្រធាន" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">អនុប្រធានទី១</label>
                      <input type="text" value={template.vice1} onChange={e => setTemplate({...template, vice1: e.target.value})} className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" placeholder="ឈ្មោះអនុ ១" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">អនុប្រធានទី២</label>
                      <input type="text" value={template.vice2} onChange={e => setTemplate({...template, vice2: e.target.value})} className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" placeholder="ឈ្មោះអនុ ២" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">គ្រូទទួលបន្ទុកថ្នាក់</label>
                    <input type="text" value={template.teacherName} onChange={e => setTemplate({...template, teacherName: e.target.value})} className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none" placeholder="ឈ្មោះលោកគ្រូ/អ្នកគ្រូ" />
                  </div>
                </div>
              </div>
            </div>

            {/* Print & Export Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 space-y-2 dark:bg-gray-900/50">
              <button 
                onClick={() => handlePrint()}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white py-3 rounded-xl font-bold shadow-md transition-all active:scale-95"
              >
                <Printer size={18} /> ទាញយក និងព្រីន (A4)
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={exportToExcel}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95 text-sm"
                >
                  <FileSpreadsheet size={16} /> ជា Excel
                </button>
                <button 
                  onClick={exportToWord}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95 text-sm"
                >
                  <FileText size={16} /> ជា Word
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Live Preview (A4 Paper) */}
          <div className="flex-1 overflow-auto bg-[#e5e7eb] p-4 lg:p-8 flex justify-center custom-scrollbar items-start">
            
            {/* A4 Paper Container */}
            <div className="bg-white shadow-2xl relative transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" style={{ width: '210mm', minHeight: '297mm' }}>
              
              {/* Printable Area Wrapper */}
              <div ref={componentRef} className="w-full h-full bg-white relative p-[10mm] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                <style>
                  {`
                    @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&family=Battambang:wght@400;700&display=swap');
                    @media print {
                      @page { size: A4 portrait; margin: 0; }
                      body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                      input { border: none !important; background: transparent !important; box-shadow: none !important; }
                      input::placeholder { color: transparent !important; }
                    }
                    .font-moul { font-family: 'Khmer OS Moul Light', 'Moul', cursive; }
                    .font-siemreap { font-family: 'Khmer OS Siem Reap', 'Siemreap', sans-serif; }
                    .font-battambang { font-family: 'Battambang', cursive; }
                    .print-input { width: 100%; text-align: center; font-family: 'Battambang', cursive; font-size: 13px; padding: 4px; outline: none; background: transparent; }
                    .print-input:focus { background-color: #f0f9ff; }
                  `}
                </style>

                {/* Decorative Border */}
                {themeConfig.border === "image" ? (
                  <img src="/frame.png" alt="Frame" className="absolute inset-0 w-full h-full pointer-events-none z-10" onError={(e) => { e.currentTarget.style.display = 'none'; alert('សូមរក្សាទុករូបភាពស៊ុមឈ្មោះ "frame.png" នៅក្នុងថត public/ ជាមុនសិន។'); }} />
                ) : (
                  <div className={themeConfig.border}></div>
                )}
                
                {/* Watermark Logo */}
                {template.theme !== 'minimal' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] z-0">
                    <img src="/logo_MOEYs.jpg" alt="Watermark" className="w-[150mm] h-[150mm] object-contain grayscale" />
                  </div>
                )}

                {/* Content Container (Inside Border) */}
                <div className="relative z-20 h-full flex flex-col p-6">
                  
                  {/* Top Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="font-battambang font-bold text-sm leading-relaxed">
                      <div>ការិយាល័យ អ.យ.ក ស្រុក <span className="border-b border-dotted border-black inline-block min-w-[100px] text-center font-normal">{template.district}</span></div>
                      <div className="mt-1">វិទ្យាល័យ <span className="border-b border-dotted border-black inline-block min-w-[150px] text-center font-normal">{template.schoolName}</span></div>
                    </div>
                    <div className="text-center">
                      <div className="font-moul text-base mb-1">ព្រះរាជាណាចក្រកម្ពុជា</div>
                      <div className="font-moul text-sm">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                      <div className="text-lg mt-1 font-serif opacity-70">~ ✤ ~</div>
                    </div>
                  </div>

                  {/* Title Badge */}
                  <div className="flex justify-center mb-8 mt-4">
                    <div className={themeConfig.badge}>
                      {template.theme === 'classic' && (
                        <>
                          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 rounded-full"></div>
                          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 rounded-full"></div>
                        </>
                      )}
                      <h1 className={`font-moul text-xl mb-2 ${themeConfig.badgeText}`}>វេនសម្អាតប្រចាំថ្ងៃ</h1>
                      <h2 className={`font-moul text-base ${themeConfig.badgeText}`}>សម្រាប់ថ្នាក់ទី {template.className}</h2>
                    </div>
                  </div>

                  {/* Schedule Table */}
                  <div className="w-full mb-8 font-battambang">
                    <table className={`w-full border-collapse border ${themeConfig.tableBorder} text-sm`}>
                      <thead>
                        <tr className={themeConfig.tableHeader}>
                          <th className={`border ${themeConfig.tableHeader.includes('bg-gray') ? 'border-gray-800' : 'border-black/20'} py-3 font-moul font-normal text-[13px] w-[16%]`}>ចន្ទ</th>
                          <th className={`border ${themeConfig.tableHeader.includes('bg-gray') ? 'border-gray-800' : 'border-black/20'} py-3 font-moul font-normal text-[13px] w-[16%]`}>អង្គារ</th>
                          <th className={`border ${themeConfig.tableHeader.includes('bg-gray') ? 'border-gray-800' : 'border-black/20'} py-3 font-moul font-normal text-[13px] w-[16%]`}>ពុធ</th>
                          <th className={`border ${themeConfig.tableHeader.includes('bg-gray') ? 'border-gray-800' : 'border-black/20'} py-3 font-moul font-normal text-[13px] w-[16%]`}>ព្រហស្បតិ៍</th>
                          <th className={`border ${themeConfig.tableHeader.includes('bg-gray') ? 'border-gray-800' : 'border-black/20'} py-3 font-moul font-normal text-[13px] w-[16%]`}>សុក្រ</th>
                          <th className={`border ${themeConfig.tableHeader.includes('bg-gray') ? 'border-gray-800' : 'border-black/20'} py-3 font-moul font-normal text-[13px] w-[16%]`}>សៅរ៍</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, rIndex) => (
                          <tr key={rIndex}>
                            {row.map((cell, cIndex) => (
                              <td key={cIndex} className={`border ${themeConfig.tableCell} h-[35px] p-0`}>
                                <input 
                                  type="text" 
                                  value={cell}
                                  onChange={(e) => updateCell(rIndex, cIndex, e.target.value)}
                                  className="print-input h-full w-full border-none hover:bg-gray-50 focus:bg-blue-50 transition-colors dark:bg-gray-900/50"
                                  placeholder={rIndex === 0 ? "វាយឈ្មោះ" : ""}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Signatures & Footer Area */}
                  <div className="mt-auto font-battambang text-sm flex flex-col gap-8">
                    
                    {/* Class Officers */}
                    <div className="space-y-2">
                      <div><span className="font-bold text-red-600"> បញ្ជាក់៖</span> ប្រធានថ្នាក់៖ <span className="font-bold text-red-600">ឈ្មោះ ({template.president || "        "}) (ឋ)</span></div>
                      <div className="pl-[85px]">អនុប្រធានទី១៖ <span className="font-bold text-green-700">ឈ្មោះ ({template.vice1 || "        "}) (ឋ)</span></div>
                      <div className="pl-[85px]">អនុប្រធានទី២៖ <span className="font-bold text-green-700">ឈ្មោះ ({template.vice2 || "        "}) (ឋ)</span></div>
                    </div>

                    {/* Signatures */}
                    <div className="flex justify-between items-end pb-8">
                      {/* Left: Principal */}
                      <div className="text-center">
                        <div className="mb-1 font-bold">បានឃើញ និងឯកភាព</div>
                        <div className="font-moul mb-24">{template.principalTitle}</div>
                        <div className="font-bold border-b border-dotted border-black inline-block min-w-[150px]"></div>
                      </div>

                      {/* Right: Homeroom Teacher */}
                      <div className="text-center">
                        <div className="mb-2 text-right text-xs">
                          ថ្ងៃ............................ខែ..................ឆ្នាំ.........................ព.ស................<br/>
                          <span className="inline-block mt-1">{template.locationDate}</span>
                        </div>
                        <div className="font-moul mb-24">គ្រូទទួលបន្ទុកថ្នាក់</div>
                        <div className="font-bold border-b border-dotted border-black inline-block min-w-[150px]">{template.teacherName}</div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
