import React from 'react';
import { Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ExactTemplateData, ExactStudentData } from '@/types/student-id';

export interface CardTemplateProps {
  template: ExactTemplateData;
  student: ExactStudentData;
  currentTheme: any;
  scale?: number;
  isBack?: boolean;
}

// -------------------------------------------------------------
// Layout 1: Classic (The original design)
// -------------------------------------------------------------
export const ClassicCard: React.FC<CardTemplateProps> = ({ template, student, currentTheme, scale = 1, isBack = false }) => {
  const width = '85.6mm';
  const height = '54mm';
  
  if (isBack) {
    return (
      <div className="relative bg-white overflow-hidden flex flex-col dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left', background: template.backBg ? `url(${template.backBg}) center/cover no-repeat` : 'white' }}>
        <div className="flex-1 p-2 flex flex-col gap-1.5 relative z-10">
          <div>
            <div className="flex items-center gap-1 font-bold text-[6px] mb-0.5" style={{ color: currentTheme.headerBg }}><span>📍</span> ទីកន្លែងកំណើតៈ</div>
            <p className="text-[5.5px] font-khmer text-gray-700 pl-2 leading-tight border-l-[1.5px] ml-1" style={{ borderColor: currentTheme.titleColor }}>{student.birthPlace}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 font-bold text-[6px] mb-0.5" style={{ color: currentTheme.headerBg }}><span>👥</span> ព័ត៌មានមាតាបិតាៈ</div>
            <div className="text-[5.5px] font-khmer text-gray-700 pl-2 border-l-[1.5px] ml-1 space-y-0.5" style={{ borderColor: currentTheme.titleColor }}>
              <div className="flex"><span className="w-14">ឪពុកឈ្មោះ</span> <span>: <span className="font-bold">{student.fatherName}</span></span></div>
              <div className="flex"><span className="w-14">ម្តាយឈ្មោះ</span> <span>: <span className="font-bold">{student.motherName}</span></span></div>
              <div className="flex"><span className="w-14">លេខទូរសព្ទ</span> <span>: <span className="font-bold" style={{ color: currentTheme.headerBg }}>{student.parentPhone}</span></span></div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 font-bold text-[6px] mb-0.5" style={{ color: currentTheme.headerBg }}><span>🏠</span> ទីលំនៅបច្ចុប្បន្នៈ</div>
            <p className="text-[5.5px] font-khmer text-gray-700 pl-2 leading-tight border-l-[1.5px] ml-1" style={{ borderColor: currentTheme.titleColor }}>{student.currentAddress}</p>
          </div>
          
          <div className="border rounded bg-purple-50/50 p-1 mt-1 border-purple-100">
            <div className="flex items-center gap-1 font-bold text-[5px] mb-1" style={{ color: currentTheme.headerBg }}>លក្ខខណ្ឌប្រើប្រាស់ប័ណ្ណ</div>
            <ul className="text-[4.5px] font-khmer text-gray-600 list-disc pl-2 space-y-0.5 leading-tight">
              <li>សិស្សត្រូវពាក់ប័ណ្ណនេះជានិច្ច ពេលចូលបរិវេណសាលា។</li>
              <li>ប័ណ្ណនេះសម្រាប់ប្រើប្រាស់ផ្ទាល់ខ្លួន មិនអាចឱ្យអ្នកដទៃខ្ចីបានឡើយ។</li>
              <li>ករណីបាត់ ឬខូច ត្រូវរាយការណ៍ជូនរដ្ឋបាលសាលាជាបន្ទាន់។</li>
            </ul>
          </div>
          
          <div className="mt-auto flex flex-col items-center">
            <p className="text-[4.5px] font-khmer text-gray-600 text-center tracking-tighter leading-tight">{template.khmerDate}</p>
            <p className="text-[4.5px] font-khmer text-gray-600 text-center mt-0.5">{template.issueLocation}, ថ្ងៃទី {template.issueDate.split(' ')[0]} ខែ {template.issueDate.split(' ')[1]} ឆ្នាំ {template.issueDate.split(' ')[2]}</p>
            <p className="text-[7px] font-moul text-red-600 mt-1">{template.principalName}</p>
            <div className="relative w-14 h-7 mt-1 flex justify-center">
              {template.stamp && <img src={template.stamp} className="absolute inset-0 w-full h-full object-contain opacity-70" />}
              {template.signature && <img src={template.signature} className="absolute inset-0 w-full h-full object-contain z-10" />}
            </div>
          </div>
        </div>
        <div className="w-full h-[6mm] flex items-center justify-center relative z-20 shrink-0" style={{ backgroundColor: currentTheme.headerBg }}>
          <span className="text-[4.5px] font-khmer" style={{ color: currentTheme.titleColor }}>🏫 អនុលោមតាម គោលការណ៍ក្រសួងអប់រំ យុវជន និងកីឡា</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left', background: template.frontBg ? `url(${template.frontBg}) center/cover no-repeat` : 'white' }}>
      <div className="h-[28mm] relative flex flex-col items-center pt-2" style={{ backgroundColor: currentTheme.headerBg }}>
        <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 rounded-tl-sm pointer-events-none" style={{ borderColor: currentTheme.titleColor }}></div>
        <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 rounded-tr-sm pointer-events-none" style={{ borderColor: currentTheme.titleColor }}></div>
        
        <div className="flex items-start w-full px-1">
          <div className="w-9 h-9 shrink-0 ml-1 rounded-full overflow-hidden bg-white/10 p-0.5 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            {template.logo && <img src={template.logo} className="w-full h-full object-contain" />}
          </div>
          <div className="flex-1 flex flex-col items-center pr-4">
            <p className="text-[7.5px] font-moul text-center leading-tight whitespace-nowrap" style={{ color: currentTheme.textColor }}>{template.department}</p>
            <p className="text-[10px] font-moul text-center mt-[1px]" style={{ color: currentTheme.textColor }}>{template.schoolNameKh}</p>
            <p className="text-[5.5px] font-bold text-center mt-[1px]" style={{ color: currentTheme.textColor }}>{template.schoolNameEn}</p>
            <p className="text-[5.5px] font-khmer text-center italic mt-[1px]" style={{ color: currentTheme.titleColor }}>"{template.slogan}"</p>
          </div>
        </div>
      </div>

      <div className="absolute top-[24mm] left-1/2 -translate-x-1/2 font-moul text-[9px] px-4 py-1 rounded-full shadow-md z-10 whitespace-nowrap" style={{ backgroundColor: currentTheme.titleColor, color: currentTheme.headerBg }}>
        ប័ណ្ណសម្គាល់ខ្លួនសិស្ស
      </div>

      <div className="absolute top-[34mm] left-1/2 -translate-x-1/2 w-[22mm] h-[28mm] bg-white border-[1.5px] border-blue-200 rounded p-[1px] shadow-sm z-10 overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        {student.photo ? (
          <img src={student.photo} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-xs">4x6</div>
        )}
      </div>

      <div className="absolute top-[63mm] left-2 right-2 font-khmer" style={{ color: currentTheme.headerBg }}>
        <div className="flex flex-col gap-[2px]">
          <div className="flex items-center text-[7px]"><span className="w-11 font-bold">អត្តលេខ</span> <span className="font-bold text-red-600">: {student.id}</span></div>
          <div className="flex items-center text-[7.5px]"><span className="w-11 font-bold">ឈ្មោះសិស្ស</span> <span className="font-moul">: {student.nameKh}</span></div>
          <div className="flex items-center text-[7px]"><span className="w-11 font-bold">ភេទ</span> <span className="font-bold">: {student.gender}</span></div>
          <div className="flex items-center text-[7px]"><span className="w-11 font-bold">ថ្ងៃកំណើត</span> <span className="font-bold">: <span className="tracking-tighter">{student.dob}</span></span></div>
          <div className="flex items-center text-[7px]"><span className="w-11 font-bold">ថ្នាក់ទី</span> <span className="font-bold">: {student.grade}</span></div>
          <div className="flex items-center text-[7px]"><span className="w-11 font-bold">ឆ្នាំសិក្សា</span> <span className="font-bold">: {student.academicYear}</span></div>
          <div className="flex items-center text-[7px]"><span className="w-11 font-bold">លេខទូរសព្ទ</span> <span className="font-bold tracking-tighter">: {student.phone}</span></div>
        </div>
      </div>

      <div className="absolute bottom-[6.5mm] right-1.5 w-[14mm] h-[14mm] bg-white p-[1px] rounded shadow-sm border border-gray-100 z-10 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        {student.qrCodeUrl ? (
          <img src={student.qrCodeUrl} className="w-full h-full object-contain" />
        ) : (
          <QRCodeSVG value={`${student.id}|${student.nameKh}|${student.grade}`} size={256} style={{ width: '100%', height: '100%' }} />
        )}
      </div>

      <div className="absolute bottom-0 w-full h-[6mm] flex items-center justify-between px-2" style={{ backgroundColor: currentTheme.headerBg }}>
        <div className="font-khmer text-[5.5px] flex flex-col" style={{ color: currentTheme.textColor }}>
          <span>ថ្ងៃចេញកាត</span>
          <span className="font-bold" style={{ color: currentTheme.titleColor }}>{template.issueDate}</span>
        </div>
        <div className="font-khmer text-[5.5px] flex flex-col text-right" style={{ color: currentTheme.textColor }}>
          <span>ផុតកំណត់កាត</span>
          <span className="font-bold" style={{ color: currentTheme.titleColor }}>{template.expiryDate}</span>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Layout 2: Modern Split (Left Sidebar)
// -------------------------------------------------------------
export const ModernSplitCard: React.FC<CardTemplateProps> = ({ template, student, currentTheme, scale = 1, isBack = false }) => {
  const width = '85.6mm';
  const height = '54mm';
  
  if (isBack) {
    return (
      <div className="relative bg-white overflow-hidden flex flex-row dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left', background: template.backBg ? `url(${template.backBg}) center/cover no-repeat` : 'white' }}>
        <div className="w-[8mm] h-full flex flex-col items-center justify-center py-2" style={{ backgroundColor: currentTheme.headerBg }}>
           <span className="text-[5px] font-khmer -rotate-90 whitespace-nowrap" style={{ color: currentTheme.titleColor }}>🏫 អនុលោមតាម គោលការណ៍ក្រសួងអប់រំ យុវជន និងកីឡា</span>
        </div>
        <div className="flex-1 p-2.5 flex flex-col gap-1.5 relative z-10">
          <div>
            <div className="flex items-center gap-1 font-bold text-[6.5px] mb-0.5" style={{ color: currentTheme.headerBg }}><span>📍</span> ទីកន្លែងកំណើតៈ</div>
            <p className="text-[5.5px] font-khmer text-gray-700 pl-2 leading-tight">{student.birthPlace}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 font-bold text-[6.5px] mb-0.5" style={{ color: currentTheme.headerBg }}><span>👥</span> ព័ត៌មានមាតាបិតាៈ</div>
            <div className="text-[5.5px] font-khmer text-gray-700 pl-2 space-y-0.5">
              <div className="flex"><span className="w-14">ឪពុកឈ្មោះ</span> <span>: <span className="font-bold">{student.fatherName}</span></span></div>
              <div className="flex"><span className="w-14">ម្តាយឈ្មោះ</span> <span>: <span className="font-bold">{student.motherName}</span></span></div>
              <div className="flex"><span className="w-14">លេខទូរសព្ទ</span> <span>: <span className="font-bold" style={{ color: currentTheme.headerBg }}>{student.parentPhone}</span></span></div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 font-bold text-[6.5px] mb-0.5" style={{ color: currentTheme.headerBg }}><span>🏠</span> ទីលំនៅបច្ចុប្បន្នៈ</div>
            <p className="text-[5.5px] font-khmer text-gray-700 pl-2 leading-tight">{student.currentAddress}</p>
          </div>
          
          <div className="mt-auto flex flex-col items-end pr-4">
            <p className="text-[4.5px] font-khmer text-gray-600 text-center tracking-tighter leading-tight">{template.khmerDate}</p>
            <p className="text-[4.5px] font-khmer text-gray-600 text-center mt-0.5">{template.issueLocation}, ថ្ងៃទី {template.issueDate.split(' ')[0]} ខែ {template.issueDate.split(' ')[1]} ឆ្នាំ {template.issueDate.split(' ')[2]}</p>
            <p className="text-[7px] font-moul text-red-600 mt-1">{template.principalName}</p>
            <div className="relative w-14 h-7 mt-1 flex justify-center">
              {template.stamp && <img src={template.stamp} className="absolute inset-0 w-full h-full object-contain opacity-70" />}
              {template.signature && <img src={template.signature} className="absolute inset-0 w-full h-full object-contain z-10" />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white overflow-hidden flex flex-row dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left', background: template.frontBg ? `url(${template.frontBg}) center/cover no-repeat` : 'white' }}>
      
      {/* Left Sidebar */}
      <div className="w-[30%] h-full flex flex-col items-center py-3 relative z-10" style={{ backgroundColor: currentTheme.headerBg }}>
         <div className="w-11 h-11 rounded-full overflow-hidden bg-white/10 p-0.5 mb-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            {template.logo && <img src={template.logo} className="w-full h-full object-contain" />}
         </div>
         <div className="w-[20mm] h-[26mm] bg-white rounded p-[1px] shadow-lg overflow-hidden mb-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            {student.photo ? <img src={student.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100" />}
         </div>
         <div className="w-[14mm] h-[14mm] bg-white p-[1px] rounded shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            {student.qrCodeUrl ? <img src={student.qrCodeUrl} className="w-full h-full object-contain" /> : <QRCodeSVG value={student.id} size={256} style={{ width: '100%', height: '100%' }} />}
         </div>
      </div>

      {/* Right Content */}
      <div className="w-[70%] h-full flex flex-col relative">
        <div className="w-full pt-3 pb-2 px-3 flex flex-col items-center border-b border-gray-100">
            <p className="text-[6.5px] font-moul leading-tight text-gray-500 whitespace-nowrap">{template.department}</p>
            <p className="text-[11px] font-moul mt-1" style={{ color: currentTheme.headerBg }}>{template.schoolNameKh}</p>
            <p className="text-[5.5px] font-bold text-gray-500 mt-0.5">{template.schoolNameEn}</p>
        </div>

        <div className="absolute top-[16mm] right-3 font-moul text-[7px] px-3 py-1 rounded-bl-xl shadow-sm z-10 whitespace-nowrap" style={{ backgroundColor: currentTheme.titleColor, color: currentTheme.headerBg }}>
            ប័ណ្ណសម្គាល់ខ្លួនសិស្ស
        </div>

        <div className="flex-1 px-4 pt-4 font-khmer" style={{ color: currentTheme.headerBg }}>
          <div className="flex flex-col gap-[2.5px]">
            <div className="flex items-center text-[7.5px]"><span className="w-14 font-bold text-gray-500">អត្តលេខ</span> <span className="font-bold text-red-600">: {student.id}</span></div>
            <div className="flex items-center text-[8.5px]"><span className="w-14 font-bold text-gray-500">ឈ្មោះសិស្ស</span> <span className="font-moul text-lg">: {student.nameKh}</span></div>
            <div className="flex items-center text-[7px]"><span className="w-14 font-bold text-gray-500">ភេទ / ថ្ងៃកំណើត</span> <span className="font-bold">: {student.gender} / {student.dob}</span></div>
            <div className="flex items-center text-[7px]"><span className="w-14 font-bold text-gray-500">ថ្នាក់ទី / ឆ្នាំ</span> <span className="font-bold">: {student.grade} ({student.academicYear})</span></div>
            <div className="flex items-center text-[7px]"><span className="w-14 font-bold text-gray-500">លេខទូរសព្ទ</span> <span className="font-bold tracking-tighter">: {student.phone}</span></div>
          </div>
        </div>

        <div className="w-full h-[5mm] flex items-center justify-between px-3 mt-auto mb-1">
          <div className="font-khmer text-[5px] flex gap-2 text-gray-500">
            <span>ចេញកាត: <b style={{ color: currentTheme.headerBg }}>{template.issueDate}</b></span>
            <span>ផុតកំណត់: <b style={{ color: currentTheme.headerBg }}>{template.expiryDate}</b></span>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Layout 3: Vertical Portrait
// -------------------------------------------------------------
export const VerticalPortraitCard: React.FC<CardTemplateProps> = ({ template, student, currentTheme, scale = 1, isBack = false }) => {
  const width = '54mm';
  const height = '85.6mm';
  
  if (isBack) {
    return (
      <div className="relative bg-white overflow-hidden flex flex-col dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left', background: template.backBg ? `url(${template.backBg}) center/cover no-repeat` : 'white' }}>
        <div className="flex-1 p-2.5 flex flex-col gap-2 relative z-10">
          <div>
            <div className="flex items-center gap-1 font-bold text-[6px] mb-0.5" style={{ color: currentTheme.headerBg }}><span>📍</span> ទីកន្លែងកំណើតៈ</div>
            <p className="text-[5.5px] font-khmer text-gray-700 leading-tight">{student.birthPlace}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 font-bold text-[6px] mb-0.5" style={{ color: currentTheme.headerBg }}><span>👥</span> ព័ត៌មានមាតាបិតាៈ</div>
            <div className="text-[5.5px] font-khmer text-gray-700 space-y-0.5">
              <div className="flex"><span className="w-12">ឪពុកឈ្មោះ</span> <span>: <span className="font-bold">{student.fatherName}</span></span></div>
              <div className="flex"><span className="w-12">ម្តាយឈ្មោះ</span> <span>: <span className="font-bold">{student.motherName}</span></span></div>
              <div className="flex"><span className="w-12">លេខទូរសព្ទ</span> <span>: <span className="font-bold" style={{ color: currentTheme.headerBg }}>{student.parentPhone}</span></span></div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 font-bold text-[6px] mb-0.5" style={{ color: currentTheme.headerBg }}><span>🏠</span> ទីលំនៅបច្ចុប្បន្នៈ</div>
            <p className="text-[5.5px] font-khmer text-gray-700 leading-tight">{student.currentAddress}</p>
          </div>
          
          <div className="border border-dashed rounded bg-gray-50 p-1.5 mt-1 dark:bg-gray-900/50">
            <div className="font-bold text-[5px] mb-1 text-center text-red-600">បញ្ជាក់ (Conditions)</div>
            <ul className="text-[4px] font-khmer text-gray-600 list-disc pl-2 space-y-0.5 leading-tight">
              <li>សិស្សត្រូវពាក់ប័ណ្ណនេះជានិច្ច ពេលចូលបរិវេណសាលា។</li>
              <li>មិនអាចឱ្យអ្នកដទៃខ្ចីបានឡើយ។</li>
              <li>ករណីបាត់ ត្រូវរាយការណ៍ជូនសាលា។</li>
            </ul>
          </div>
          
          <div className="mt-auto flex flex-col items-center">
            <p className="text-[4px] font-khmer text-gray-600 text-center mt-0.5">{template.issueLocation}, {template.issueDate}</p>
            <p className="text-[7px] font-moul text-red-600 mt-1">{template.principalName}</p>
            <div className="relative w-12 h-6 mt-1 flex justify-center">
              {template.stamp && <img src={template.stamp} className="absolute inset-0 w-full h-full object-contain opacity-70" />}
              {template.signature && <img src={template.signature} className="absolute inset-0 w-full h-full object-contain z-10" />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white overflow-hidden flex flex-col dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left', background: template.frontBg ? `url(${template.frontBg}) center/cover no-repeat` : 'white' }}>
      
      {/* Top Banner */}
      <div className="h-[35mm] relative flex flex-col items-center pt-2 px-1" style={{ backgroundColor: currentTheme.headerBg, borderBottom: `2px solid ${currentTheme.titleColor}` }}>
         <div className="flex items-center justify-center gap-1 w-full mb-1">
           <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 p-0.5 shrink-0 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
             {template.logo && <img src={template.logo} className="w-full h-full object-contain" />}
           </div>
           <div className="flex flex-col items-center">
             <p className="text-[5.5px] font-moul text-center leading-tight" style={{ color: currentTheme.textColor }}>{template.department}</p>
             <p className="text-[8px] font-moul text-center mt-0.5" style={{ color: currentTheme.titleColor }}>{template.schoolNameKh}</p>
           </div>
         </div>
         <p className="text-[4px] font-bold text-center" style={{ color: currentTheme.textColor }}>{template.schoolNameEn}</p>
         
         <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 font-moul text-[7px] px-3 py-1 rounded-t-lg z-10" style={{ backgroundColor: currentTheme.titleColor, color: currentTheme.headerBg }}>
            ប័ណ្ណសម្គាល់សិស្ស
         </div>
      </div>

      {/* Photo Overlaying Header */}
      <div className="absolute top-[26mm] left-1/2 -translate-x-1/2 w-[24mm] h-[24mm] rounded-full bg-white border-[2px] p-[1.5px] shadow-md z-20 overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" style={{ borderColor: currentTheme.headerBg }}>
        <div className="w-full h-full rounded-full overflow-hidden">
          {student.photo ? <img src={student.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100" />}
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 mt-[16mm] px-3 font-khmer flex flex-col items-center text-center">
        <h2 className="font-moul text-[11px]" style={{ color: currentTheme.headerBg }}>{student.nameKh}</h2>
        <p className="text-[7.5px] font-bold text-red-600 mt-0.5 tracking-wider">ID: {student.id}</p>
        
        <div className="w-full grid grid-cols-2 gap-y-1 mt-2 text-[6.5px] text-left border-t border-gray-100 pt-2" style={{ color: currentTheme.headerBg }}>
          <div><span className="text-gray-500 font-bold">ភេទ:</span> <span className="font-bold">{student.gender}</span></div>
          <div><span className="text-gray-500 font-bold">ថ្នាក់:</span> <span className="font-bold">{student.grade}</span></div>
          <div className="col-span-2"><span className="text-gray-500 font-bold">ថ្ងៃកំណើត:</span> <span className="font-bold">{student.dob}</span></div>
          <div className="col-span-2"><span className="text-gray-500 font-bold">ទូរសព្ទ:</span> <span className="font-bold">{student.phone}</span></div>
        </div>

        <div className="mt-auto mb-1 flex items-end justify-between w-full">
           <div className="w-[12mm] h-[12mm] bg-white p-[1px] border shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
             {student.qrCodeUrl ? <img src={student.qrCodeUrl} className="w-full h-full object-contain" /> : <QRCodeSVG value={student.id} size={256} style={{ width: '100%', height: '100%' }} />}
           </div>
           <div className="text-[4px] text-right font-bold text-gray-500 pb-1">
             <p>ចេញកាត: {template.issueDate}</p>
             <p>ផុតកំណត់: {template.expiryDate}</p>
           </div>
        </div>
      </div>
    </div>
  );
};
