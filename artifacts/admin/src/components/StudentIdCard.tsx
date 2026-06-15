import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import QRCode from "react-qr-code";
import type { Student } from "@workspace/api-client-react";
import { Printer, X, Settings2, Image as ImageIcon, Type, Palette } from "lucide-react";
import api, { resolveUrl } from "@/lib/axiosConfig";

interface StudentIdCardProps {
  student: Student;
  onClose: () => void;
  token: string | null;
}

export default function StudentIdCardModal({ student, onClose, token }: StudentIdCardProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  
  // Customizable Template State
  const [template, setTemplate] = useState({
    schoolName: "អនុវិទ្យាល័យ ផ្លូវមាស",
    subtitle: "ប័ណ្ណសម្គាល់ខ្លួនសិស្ស",
    principalTitle: "នាយកសាលា",
    address: "អាសយដ្ឋាន៖ ភូមិ សង្កាត់ ក្រុង ខេត្ត បាត់ដំបង",
    headerColor: "#1b5e20",
    footerColor: "#1a237e",
    logoUrl: "/logo_MOEYs.jpg", // Default to public/logo_MOEYs.jpg
    signatureUrl: "", // Principal's signature & stamp image URL
  });

  // Editable Student Data State (allow overrides for printing)
  const [studentData, setStudentData] = useState({
    nameKh: student.nameKh || "",
    gender: student.gender === 'Male' ? 'ប្រុស' : 'ស្រី',
    grade: student.grade.replace('Grade ', 'ទី '),
    studentId: student.studentId || "",
    dob: "០១ មករា ២០១០", // Placeholder, since DOB is not in the model yet
    phone: student.phone || "០១២ ៣៤៥ ៦៧៨",
    academicYear: `${student.enrollmentYear} - ${student.enrollmentYear + 1}`,
    photoUrl: student.photoUrl || ""
  });

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Student_ID_${student.studentId}`,
  });

  return (
    <div className="fixed inset-0 z-[100] bg-[#0d1b33]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[95vh] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <Settings2 size={20} />
            <h2 className="font-bold text-lg">ID Card Studio & Printer</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900/50">
          
          {/* Left Panel: Editor Form */}
          <div className="w-full md:w-[400px] bg-white border-r overflow-y-auto p-6 space-y-8 flex-shrink-0 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            
            {/* Section 1: Template Design */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary border-b pb-2">
                <Palette size={18} />
                <h3 className="font-bold">Card Template Design</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">School Name (Khmer Moul)</label>
                  <input value={template.schoolName} onChange={e => setTemplate({...template, schoolName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none font-moul" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Subtitle</label>
                  <input value={template.subtitle} onChange={e => setTemplate({...template, subtitle: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none font-moul" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Footer Address</label>
                  <textarea value={template.address} onChange={e => setTemplate({...template, address: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none font-siemreap" rows={2} />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Header Color</label>
                    <input type="color" value={template.headerColor} onChange={e => setTemplate({...template, headerColor: e.target.value})} className="w-full h-8 cursor-pointer rounded" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Footer Color</label>
                    <input type="color" value={template.footerColor} onChange={e => setTemplate({...template, footerColor: e.target.value})} className="w-full h-8 cursor-pointer rounded" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Logo URL (Header & Watermark)</label>
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-gray-400" />
                    <input value={template.logoUrl} onChange={e => setTemplate({...template, logoUrl: e.target.value})} className="flex-1 border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" placeholder="/logo.png" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Hint: Save your logo as `logo.png` in the public folder.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Principal's Signature & Stamp (PNG/Transparent)</label>
                  <div className="flex items-center gap-2">
                    <input type="file" className="hidden" id="signature-upload" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append("file", file);
                      try {
                        const res = await api.post("/upload", formData);
                        if (res.data && res.data.url) {
                          setTemplate({...template, signatureUrl: res.data.url});
                        } else {
                          alert(res.data.message || "Upload failed");
                        }
                      } catch (err) {
                        alert("Upload error");
                      }
                    }} />
                    <label htmlFor="signature-upload" className="flex-1 border-2 border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-primary hover:bg-gray-100 hover:border-gray-400 cursor-pointer text-center font-bold transition-all block dark:bg-gray-900/50">
                      {template.signatureUrl ? "Change Signature & Stamp" : "Upload Signature & Stamp"}
                    </label>
                  </div>
                  {template.signatureUrl && (
                    <div className="mt-2 p-2 border rounded-lg inline-block bg-white relative group dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                      <img src={resolveUrl(template.signatureUrl)} alt="Signature Preview" className="h-12 object-contain" />
                      <button onClick={() => setTemplate({...template, signatureUrl: ""})} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600 transition-colors"><X size={10} /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Student Data Override */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary border-b pb-2">
                <Type size={18} />
                <h3 className="font-bold">Student Data (Print Override)</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Student Name</label>
                  <input value={studentData.nameKh} onChange={e => setStudentData({...studentData, nameKh: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm font-bold font-siemreap" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">ID Number</label>
                  <input value={studentData.studentId} onChange={e => setStudentData({...studentData, studentId: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm font-siemreap" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Grade</label>
                  <input value={studentData.grade} onChange={e => setStudentData({...studentData, grade: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm font-siemreap" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Date of Birth</label>
                  <input value={studentData.dob} onChange={e => setStudentData({...studentData, dob: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm font-siemreap" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Phone</label>
                  <input value={studentData.phone} onChange={e => setStudentData({...studentData, phone: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm font-siemreap" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Academic Year</label>
                  <input value={studentData.academicYear} onChange={e => setStudentData({...studentData, academicYear: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm font-siemreap" />
                </div>
              </div>
            </div>

          </div>

          {/* Right Panel: Preview */}
          <div className="flex-1 flex flex-col">
            <div className="bg-gray-200 flex-1 flex items-center justify-center p-8 overflow-auto">
              
              {/* --- ACTUAL PRINT AREA --- */}
              <div className="bg-white shadow-2xl relative border-2 border-dashed border-red-600 box-border overflow-hidden transition-all duration-300 transform scale-100 md:scale-110 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" style={{ width: "210px", height: "330px" }} ref={componentRef}>
                
                <style>
                  {`
                    @import url('https://fonts.googleapis.com/css2?family=Moul&family=Siemreap&display=swap');
                    @media print {
                      @page { size: 54mm 86mm; margin: 0; }
                      body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                    .font-moul { font-family: 'Khmer OS Moul Light', 'Moul', cursive; }
                    .font-siemreap { font-family: 'Khmer OS Siem Reap', 'Siemreap', sans-serif; }
                  `}
                </style>

                {/* Header Area */}
                <div className="relative flex items-center pt-2 px-1 pb-1 min-h-[48px]">
                  <img src={template.logoUrl} alt="Logo" className="w-14 h-14 object-contain absolute -left-0.5 -top-1.5 z-20" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <div className="flex-1 pl-[50px] pr-1 flex flex-col items-center justify-center text-center">
                    <h1 className="text-[13px] font-moul text-black leading-normal whitespace-nowrap py-1">{template.schoolName}</h1>
                  </div>
                </div>

                {/* Sub-header Banner */}
                <div className="w-full py-[1px]" style={{ backgroundColor: template.headerColor }}>
                  <h2 className="text-white text-center text-[10px] font-moul tracking-wide">{template.subtitle}</h2>
                </div>

                {/* Main Body */}
                <div className="relative px-2 pt-2 flex-1 flex flex-col h-[225px]">
                  
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center z-0 opacity-[0.12] pointer-events-none">
                     <img src={template.logoUrl} alt="Watermark" className="w-60 h-60 object-contain" />
                  </div>

                  {/* Flex Layout for Details and Photo */}
                  <div className="flex justify-between z-10 relative">
                    {/* Left Side: Details */}
                    <div className="flex-1 text-[9px] font-siemreap leading-tight space-y-[10px] mt-1 text-gray-900">
                      <div className="flex"><span className="w-[60px] font-bold shrink-0">ឈ្មោះ</span> <span>: <span className="font-bold text-[10px]">{studentData.nameKh}</span></span></div>
                      <div className="flex"><span className="w-[60px] font-bold shrink-0">ភេទ</span> <span>: {studentData.gender}</span></div>
                      <div className="flex"><span className="w-[60px] font-bold shrink-0">ថ្នាក់ទី</span> <span>: {studentData.grade}</span></div>
                      <div className="flex"><span className="w-[60px] font-bold shrink-0">អត្តលេខ</span> <span>: {studentData.studentId}</span></div>
                      <div className="flex"><span className="w-[60px] font-bold shrink-0">ថ្ងៃខែឆ្នាំកំណើត</span> <span>: <span className="tracking-tighter">{studentData.dob}</span></span></div>
                      <div className="flex"><span className="w-[60px] font-bold shrink-0">លេខទូរសព្ទ</span> <span>: <span className="tracking-tighter">{studentData.phone}</span></span></div>
                      <div className="flex"><span className="w-[60px] font-bold shrink-0">ឆ្នាំសិក្សា</span> <span>: {studentData.academicYear}</span></div>
                    </div>

                    {/* Right Side: Photo */}
                    <div className="w-[50px] h-[65px] border border-blue-500 border-dashed rounded bg-gray-50 flex-shrink-0 ml-1 mt-1 overflow-hidden z-10 relative flex items-center justify-center dark:bg-gray-900/50">
                      {studentData.photoUrl ? (
                        <img src={resolveUrl(studentData.photoUrl)} alt="Student" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[8px] text-gray-400 text-center font-siemreap px-1 leading-tight">រូបថត 4x6</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Area: QR and Signature */}
                  <div className="flex justify-between items-end mt-auto pb-1 z-10">
                    <div className="bg-white p-[2px] border border-gray-300 rounded-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                      <QRCode 
                        value={`អត្តលេខ: ${studentData.studentId}\nឈ្មោះ: ${studentData.nameKh}\nភេទ: ${studentData.gender}\nថ្នាក់: ${studentData.grade}\nទូរសព្ទ: ${studentData.phone}`} 
                        size={35} 
                        level="L" 
                      />
                    </div>
                    <div className="text-center font-moul text-[9px] mb-2 mr-2 text-black relative">
                      <div className="h-10 flex items-center justify-center relative">
                        {template.signatureUrl ? (
                          <img src={resolveUrl(template.signatureUrl)} alt="Signature & Stamp" className="absolute bottom-[-10px] right-[-10px] w-20 h-16 object-contain z-30 pointer-events-none" />
                        ) : (
                          <div className="h-full"></div>
                        )}
                      </div>
                      <p className="relative z-10">{template.principalTitle}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Banner */}
                <div className="absolute bottom-0 w-full py-[3px]" style={{ backgroundColor: template.footerColor }}>
                  <p className="text-white text-center text-[6px] font-siemreap tracking-wider">
                    {template.address}
                  </p>
                </div>
              </div>
              {/* --- END ACTUAL PRINT AREA --- */}

            </div>

            {/* Actions Footer */}
            <div className="px-6 py-4 bg-white border-t flex justify-end gap-3 flex-shrink-0 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
              <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 border-2 rounded-xl hover:bg-gray-50 transition-colors dark:bg-gray-900/50">
                Cancel
              </button>
              <button 
                onClick={() => handlePrint()} 
                className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-md hover:shadow-lg"
              >
                <Printer size={18} /> Print Final Card
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
