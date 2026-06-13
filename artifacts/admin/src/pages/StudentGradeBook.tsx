import React, { useState, useMemo, useCallback } from "react";
import {
  Printer, BookOpen, RotateCcw, FileText, User, Award, CalendarDays,
  GraduationCap, CheckCircle2, AlertTriangle, XCircle, ChevronRight, Edit3
} from "lucide-react";

// ═══════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════

interface Subject { id: string; nameKh: string; nameEn: string; maxScore: number; }

interface SubjectScores {
  sem1Avg: number | null; sem1Rank: number | null;
  sem2Avg: number | null; sem2Rank: number | null;
  yearlyAvg: number | null; yearlyRank: number | null;
  teacherRemarks: string;
}

interface AcademicHistoryRec {
  year: string; index: string; grade: string; school: string;
  admissionDate: string; leftDate: string; remarks: string;
}

interface MonthlyAttendance {
  withLeave: number; withoutLeave: number;
}

interface YearlyRecord {
  academicYear: string;
  classroomName: string;
  studentCount: string;
  scores: Record<string, SubjectScores>;
  attendance: { s1: MonthlyAttendance, s2: MonthlyAttendance };
  coreValuations: {
    study: { s1: string, s2: string, yr: string },
    morals: { s1: string, s2: string, yr: string },
    labor: { s1: string, s2: string, yr: string },
    health: { s1: string, s2: string, yr: string }
  };
  commendations: {
    bann: { s1: string, s2: string, yr: string },
    likhet: { s1: string, s2: string, yr: string },
    sakkey: { s1: string, s2: string, yr: string }
  };
  finalExamCenter: string;
  finalExamProvince: string;
  finalExamRoom: string;
  finalExamTable: string;
}

const SUBJECTS: Subject[] = [
  { id: "khmer", nameKh: "ភាសាខ្មែរ", nameEn: "Khmer Language", maxScore: 150 },
  { id: "civics", nameKh: "សីលធម៌-ពលរដ្ឋវិទ្យា", nameEn: "Morals-Civics", maxScore: 50 },
  { id: "history", nameKh: "ប្រវត្តិវិទ្យា", nameEn: "History", maxScore: 100 },
  { id: "geography", nameKh: "ភូមិវិទ្យា", nameEn: "Geography", maxScore: 100 },
  { id: "math", nameKh: "គណិតវិទ្យា", nameEn: "Mathematics", maxScore: 150 },
  { id: "physics", nameKh: "រូបវិទ្យា", nameEn: "Physics", maxScore: 100 },
  { id: "chemistry", nameKh: "គីមីវិទ្យា", nameEn: "Chemistry", maxScore: 100 },
  { id: "biology", nameKh: "ជីវវិទ្យា", nameEn: "Biology", maxScore: 100 },
  { id: "earth", nameKh: "ផែនដីវិទ្យា", nameEn: "Earth Science", maxScore: 50 },
  { id: "english", nameKh: "ភាសាអង់គ្លេស", nameEn: "English", maxScore: 50 },
  { id: "tech", nameKh: "បច្ចេកវិទ្យា", nameEn: "ICT", maxScore: 50 },
  { id: "home_ec", nameKh: "គេហវិទ្យា", nameEn: "Home Economics", maxScore: 50 },
  { id: "art", nameKh: "អប់រំសិល្បៈ", nameEn: "Arts", maxScore: 50 },
  { id: "pe", nameKh: "អប់រំកាយ", nameEn: "Physical Education", maxScore: 50 },
];

const GRADES = [7, 8, 9, 10, 11, 12];

const toKhmerNum = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined || num === "") return "";
  const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
  const formatted = typeof num === 'number' ? (Number.isInteger(num) ? String(num) : num.toFixed(2)) : String(num);
  return formatted.replace(/[0-9]/g, (d) => khmerDigits[parseInt(d)]).replace(/\./g, ",");
};

function getClassification(score: number | null, maxScore: number) {
  if (score === null || score === undefined) return { labelKh: "", color: "text-slate-400 dark:text-gray-500", bg: "" };
  if (maxScore === 50) {
    if (score >= 40) return { labelKh: "ល្អ", color: "text-emerald-700", bg: "bg-emerald-50" };
    if (score >= 32.5) return { labelKh: "ល្អបង្គួរ", color: "text-blue-700", bg: "bg-blue-50" };
    if (score >= 25) return { labelKh: "មធ្យម", color: "text-amber-700", bg: "bg-amber-50" };
    return { labelKh: "ខ្សោយ", color: "text-red-600", bg: "bg-red-50" };
  }
  if (maxScore === 100) {
    if (score >= 80) return { labelKh: "ល្អ", color: "text-emerald-700", bg: "bg-emerald-50" };
    if (score >= 64) return { labelKh: "ល្អបង្គួរ", color: "text-blue-700", bg: "bg-blue-50" };
    if (score >= 50) return { labelKh: "មធ្យម", color: "text-amber-700", bg: "bg-amber-50" };
    return { labelKh: "ខ្សោយ", color: "text-red-600", bg: "bg-red-50" };
  }
  if (score >= 120) return { labelKh: "ល្អ", color: "text-emerald-700", bg: "bg-emerald-50" };
  if (score >= 98) return { labelKh: "ល្អបង្គួរ", color: "text-blue-700", bg: "bg-blue-50" };
  if (score >= 75) return { labelKh: "មធ្យម", color: "text-amber-700", bg: "bg-amber-50" };
  return { labelKh: "ខ្សោយ", color: "text-red-600", bg: "bg-red-50" };
}

// ═══════════════════════════════════════════════════════
// PRINT SUB-COMPONENTS
// ═══════════════════════════════════════════════════════

const PrintCoverSpread = ({ p }: { p: any }) => (
  <div className="gradebook-print-spread text-black">
    {/* Page 1 (Left) - Instructions */}
    <div className="gradebook-print-page border-r-2 border-black border-dashed">
      <div className="h-full border-[3px] border-black p-8 flex flex-col items-center">
        <h1 className="font-moul text-xl mb-6 mt-4 underline underline-offset-8">សេចក្ដីណែនាំ</h1>
        <div className="text-[12px] text-justify leading-[1.8] space-y-4 font-bold">
          <p>នៅដើមឆ្នាំសិក្សា (ថ្នាក់ទី៧) នាយកអនុវិទ្យាល័យណែនាំឱ្យបំពេញសេចក្ដីក្នុងសៀវភៅសិក្ខាគារិកបានគ្រប់ចំណុច និងត្រឹមត្រូវល្អ មុខនឹងចុះហត្ថលេខាកាត់រូបថតសិស្ស។ គ្រប់អក្សរពុម្ព ឡាតាំង គ្រូទទួលបន្ទុកថ្នាក់ ឬនាយកអនុវិទ្យាល័យអាចជួយបំពេញបាន។ ឪពុកម្ដាយសិស្សបើសិនជាស្លាប់ក៏ត្រូវបញ្ជាក់នូវមុខរបរពីមុខ។ មន្ទីរអប់រំគួរបោះត្រាកាត់រូបថតសិស្ស នៅក្នុងសៀវភៅសិក្ខាគារិក ហើយបើសិនជាសិស្សសុំផ្ទេរការសិក្សាចេញ គួរបោះត្រាឆ្លងទំព័រមួយ ទៅទំព័រមួយទៀត នៃឆ្នាំសិក្សានីមួយៗផង។</p>
          <p>គ្រូទទួលបន្ទុកថ្នាក់ជាអ្នកទទួលខុសត្រូវ ក្នុងការចុះពិន្ទុសិស្សគ្រប់មុខវិជ្ជា ក្នុងការចុះមូលវិចាររបស់គ្រូដទៃទៀត និងការប្រជុំវាយតម្លៃសិស្ស លើផ្នែកសិក្សា សីលធម៌រស់នៅ ពលកម្ម សុខភាព ហើយបញ្ជាក់ច្បាស់នូវចំណុចសំខាន់ៗ (ឡើងថ្នាក់ ត្រួតថ្នាក់ សរសើរ កែលម្អ...) ត្រង់មូលវិចារគ្រួទទួលបន្ទុក(ចំណុច &lt;&lt;ឃ&gt;&gt;) មុននឹងជូននាយកអនុវិទ្យាល័យចុះមូលវិចារ។</p>
          <p>ចំពោះសិស្សរៀននៅថ្នាក់សិស្សពូកែ (គណិតវិទ្យា-អក្សរសាស្ត្រ) ពិន្ទុនៃមុខវិជ្ជាឯកទេសត្រូវមានពីរផ្នែកសម្រាប់ប្រើប្រាស់ផ្សេងគ្នាគឺៈ<br/>
             ក- ពិន្ទុសម្រាប់វាយតម្លៃការសិក្សា ដើម្បីកំណត់ឱ្យឡើងថ្នាក់ជា ស្វ័យប្រវត្តិ ឬត្រូវប្រឡងឡើងថ្នាក់ សិស្សពូកែ គឺពិន្ទុដែលចុះក្នុងផ្នែក&lt;&lt;ក&gt;&gt; (ខាងលើ) ដោយយក ពិន្ទុ សៀវភៅ សំណួរផ្ទាល់មាត់ សំណួរ ១៥ នាទី និងពិន្ទុប្រឡងឆមាសធម្មតា (វិញ្ញាសារសម្រាប់សិស្សធម្មតាធ្វើឆមាស) បញ្ចូលគ្នា។<br/>
             ខ- ពិន្ទុសម្រាប់ មូលដ្ឋានក្នុង ការជ្រើសរើស ឱ្យចូលរួមប្រឡងប្រណាំង ឬ ប្រឡងឡើង ថ្នាក់សិស្សពូកែ ជាមួយសិស្សដ៏ទៃទៀត គឺពិន្ទុដែលចុះក្នុងផ្នែក &lt;&lt;ខ&gt;&gt; (ខាងក្រោម) ដោយយក ពិន្ទុ សរសេរចាប់ពី ១ ម៉ោងឡើងទៅ និងពិន្ទុប្រឡងឆមាសពិសេស (វិញ្ញាសាសម្រាប់តែសិស្សពូកែ)។</p>
          <p>នៅដំណាច់ឆ្នាំសិក្សា នាយកអនុវិទ្យាល័យចុះមូលវិចារ និងទទួលខុសត្រូវលើការវាយតម្លៃសិស្សគ្រប់ផ្នែក ។ នៅដើមភូមិសិក្សានីមួយៗ ត្រូវមានចុះលទ្ធផលនៃការប្រឡងរបស់សិស្ស សម័យប្រឡង មណ្ឌល លេខបន្ទប់ លេខតុ និងនិទ្ទេសផង។</p>
          <p>នៅក្នុងសៀវភៅសិក្ខាគារិកមិនត្រូវឱ្យមានការកោសលប់ ឬសរសេរត្រួតគ្នាឡើយ។ បើសិនជាមានក្នុងការចាំចាច់ នាយកអនុវិទ្យាល័យកែដោយទឹកខ្មៅក្រហម និងចុះហត្ថលេខាទទួលស្គាល់វា។ នៅពេលឈប់រៀន សិស្សអាចសុំសៀវភៅសិក្ខាគារិកទៅទុកផ្ទាល់ខ្លួនបាន។</p>
        </div>
      </div>
    </div>
    
    {/* Page 2 (Right) - Cover */}
    <div className="gradebook-print-page">
      <div className="h-full border-[3px] border-black p-6 flex flex-col items-center">
        {/* Top Header */}
        <div className="w-full text-center font-moul mb-6 mt-2">
          <div className="text-sm">ព្រះរាជាណាចក្រកម្ពុជា</div>
          <div className="text-sm mt-1">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
          <div className="flex justify-center gap-1 mt-2 text-xs"><span></span><span>*</span><span></span></div>
        </div>
        
        <div className="w-full text-left font-moul text-[15px] mb-8 pl-4">
          ក្រសួងអប់រំ យុវជន និងកីឡា
        </div>

        <div className="w-full text-center font-moul text-3xl leading-relaxed mb-12">
          សៀវភៅសិក្ខាគារិក<br/>
        </div>

        {/* Student Box */}
        <div className="w-full flex justify-between text-sm font-bold leading-8 mb-4">
          <div className="w-[110px] h-[150px] border border-black flex items-center justify-center shrink-0">
            <span className="font-moul text-xl">រូបថត<br/>៤×៦</span>
          </div>
          <div className="flex-1 ml-6 relative top-2">
            <div className="flex"><span className="w-[150px]">នាមត្រកូល និងនាមខ្លួន :</span><span className="border-b border-black border-dotted flex-1 text-center font-moul">{p.studentName}</span><span className="mx-2">ជាអក្សរឡាតាំង</span><span className="border-b border-black border-dotted w-[120px] uppercase font-sans text-center">{p.studentNameEn}</span></div>
            <div className="flex"><span className="w-[150px]">ថ្ងៃ ខែ ឆ្នាំកំណើត</span>: <span className="border-b border-black border-dotted flex-1 pl-4 font-moul">{p.studentDob}</span></div>
            <div className="flex"><span className="w-[150px]">ទីកន្លែងកំណើត</span>: <span className="border-b border-black border-dotted flex-1 pl-4 font-moul">{p.pob}</span></div>
            <div className="flex"><span className="w-[150px]">អាសយដ្ឋានបច្ចុប្បន្ន</span>: <span className="border-b border-black border-dotted flex-1 pl-4 font-moul">{p.address}</span></div>
            <div className="flex"><span className="w-[150px]">ឈ្មោះ និងមុខរបរឪពុក</span>: <span className="border-b border-black border-dotted flex-1 pl-4 font-moul">{p.fatherName}</span><span className="mx-2">មុខរបរ</span><span className="border-b border-black border-dotted flex-1 pl-4 font-moul">{p.fatherJob}</span></div>
            <div className="flex"><span className="w-[150px]">ឈ្មោះ និងមុខរបរម្ដាយ</span>: <span className="border-b border-black border-dotted flex-1 pl-4 font-moul">{p.motherName}</span><span className="mx-2">មុខរបរ</span><span className="border-b border-black border-dotted flex-1 pl-4 font-moul">{p.motherJob}</span></div>
          </div>
        </div>

        {/* Academic History Matrix */}
        <table className="w-full border-collapse border border-black text-[10px] font-bold mt-auto">
          <thead>
            <tr className="bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
              <th className="border border-black py-1 font-moul font-normal">ឆ្នាំសិក្សា</th>
              <th className="border border-black py-1 font-moul font-normal">អត្តលេខ</th>
              <th className="border border-black py-1 font-moul font-normal">ថ្នាក់</th>
              <th className="border border-black py-1 font-moul font-normal">សាលា</th>
              <th className="border border-black py-1 font-moul font-normal">ថ្ងៃ ខែ ឆ្នាំចូលរៀន</th>
              <th className="border border-black py-1 font-moul font-normal">ថ្ងៃ ខែ ឆ្នាំ ចេញ</th>
              <th className="border border-black py-1 font-moul font-normal">សេចក្ដីផ្សេងៗ</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="h-6">
                <td className="border border-black text-center">{toKhmerNum(p.history[i]?.year)}</td>
                <td className="border border-black text-center">{toKhmerNum(p.history[i]?.index)}</td>
                <td className="border border-black text-center">{toKhmerNum(p.history[i]?.grade)}</td>
                <td className="border border-black px-2">{p.history[i]?.school}</td>
                <td className="border border-black text-center">{toKhmerNum(p.history[i]?.admissionDate)}</td>
                <td className="border border-black text-center">{toKhmerNum(p.history[i]?.leftDate)}</td>
                <td className="border border-black px-1">{p.history[i]?.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const PrintGradeSpread = ({ p, data, summary, gradeLabel }: { p: any, data: YearlyRecord, summary: any, gradeLabel: number }) => (
  <div className="gradebook-print-spread text-black">
    {/* Page (Left) - Grades */}
    <div className="gradebook-print-page border-r border-transparent">
      <div className="flex justify-between text-[12px] font-bold mb-1 pl-2">
        <span>នាមត្រកូល និងនាមខ្លួន <span className="border-b border-black border-dotted min-w-[120px] inline-block text-center font-moul">{p.studentName}</span></span>
        <span>ថ្នាក់ទី <span className="border-b border-black border-dotted min-w-[50px] inline-block text-center">{toKhmerNum(data.classroomName || gradeLabel)}</span></span>
        <span>ឆ្នាំសិក្សា <span className="border-b border-black border-dotted min-w-[80px] inline-block text-center">{toKhmerNum(data.academicYear)}</span></span>
      </div>
      
      <div className="border border-black h-[calc(100%-25px)] flex flex-col">
        <div className="font-moul py-1 text-sm border-b border-black pl-2">ក- លទ្ធផលនៃការសិក្សា</div>
        <table className="w-full border-collapse text-[10px] text-center font-bold flex-1">
          <thead>
            <tr className="bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
              <th rowSpan={2} className="border-b border-r border-black w-[110px] font-moul font-normal text-[11px]">មុខវិជ្ជា</th>
              <th colSpan={2} className="border-b border-r border-black font-moul font-normal">ឆមាសទី១</th>
              <th colSpan={2} className="border-b border-r border-black font-moul font-normal">ឆមាសទី២</th>
              <th colSpan={2} className="border-b border-r border-black font-moul font-normal">ប្រចាំឆ្នាំ</th>
              <th rowSpan={2} className="border-b border-black w-[110px] font-moul font-normal">មូលវិចារ ហត្ថលេខា<br/>និងឈ្មោះគ្រូ</th>
            </tr>
            <tr className="bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
              <th className="border-b border-r border-black py-0.5">ម.ភាគ</th><th className="border-b border-r border-black">ចំ.ថ្នាក់</th>
              <th className="border-b border-r border-black">ម.ភាគ</th><th className="border-b border-r border-black">ចំ.ថ្នាក់</th>
              <th className="border-b border-r border-black">ម.ភាគ</th><th className="border-b border-r border-black">ចំ.ថ្នាក់</th>
            </tr>
          </thead>
          <tbody>
            {SUBJECTS.map((sub) => {
              const s = data.scores[sub.id];
              return (
                <tr key={sub.id}>
                  <td className="border-b border-r border-black text-left px-2 font-sans py-0.5 whitespace-nowrap">{sub.nameKh}</td>
                  <td className="border-b border-r border-black">{toKhmerNum(s.sem1Avg)}</td>
                  <td className="border-b border-r border-black">{toKhmerNum(s.sem1Rank)}</td>
                  <td className="border-b border-r border-black">{toKhmerNum(s.sem2Avg)}</td>
                  <td className="border-b border-r border-black">{toKhmerNum(s.sem2Rank)}</td>
                  <td className="border-b border-r border-black">{toKhmerNum(s.yearlyAvg)}</td>
                  <td className="border-b border-r border-black">{toKhmerNum(s.yearlyRank)}</td>
                  <td className="border-b border-black text-[8px] px-1 font-normal">{s.teacherRemarks}</td>
                </tr>
              );
            })}
            <tr>
              <td className="border-b border-r border-black text-left px-2 py-0.5 font-moul font-normal">សរុបពិន្ទុប្រឡងឆមាស</td>
              <td className="border-b border-r border-black" colSpan={2}>{toKhmerNum(summary.totalScoresSem1)}</td>
              <td className="border-b border-r border-black" colSpan={2}>{toKhmerNum(summary.totalScoresSem2)}</td>
              <td className="border-b border-r border-black" colSpan={2}>{toKhmerNum(summary.totalScoresYearly)}</td>
              <td className="border-b border-black"></td>
            </tr>
            <tr>
              <td className="border-b border-r border-black text-left px-2 py-0.5 font-moul font-normal text-[9px]">មធ្យមភាគពិន្ទុប្រឡងឆមាស</td>
              <td className="border-b border-r border-black" colSpan={2}>{toKhmerNum(summary.classAvgSem1)}</td>
              <td className="border-b border-r border-black" colSpan={2}>{toKhmerNum(summary.classAvgSem2)}</td>
              <td className="border-b border-r border-black" colSpan={2}>{toKhmerNum(summary.classAvgYearly)}</td>
              <td className="border-b border-black"></td>
            </tr>
            <tr>
              <td className="border-b border-r border-black text-left px-2 py-0.5 font-moul font-normal text-[9px]">មធ្យមភាគពិន្ទុខែប្រចាំឆមាស</td>
              <td className="border-b border-r border-black" colSpan={2}></td><td className="border-b border-r border-black" colSpan={2}></td><td className="border-b border-r border-black" colSpan={2}></td><td className="border-b border-black"></td>
            </tr>
            <tr>
              <td className="border-r border-black text-left px-2 py-0.5 font-moul font-normal text-[9px]">មធ្យមភាគពិន្ទុប្រចាំឆមាស</td>
              <td className="border-r border-black" colSpan={2}></td><td className="border-r border-black" colSpan={2}></td><td className="border-r border-black" colSpan={2}></td><td className="border-black"></td>
            </tr>
          </tbody>
        </table>
        <div className="border-t border-b border-black font-moul py-1 text-sm bg-white pl-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">ខ- ចំនួនអវត្តមានក្នុងឆ្នាំសិក្សា</div>
        <table className="w-full border-collapse text-[11px] text-center font-bold">
          <thead>
            <tr>
              <th className="border-b border-r border-black font-moul font-normal w-[120px] py-1">អវត្តមាន</th>
              <th className="border-b border-r border-black font-moul font-normal">ឆមាសទី១</th>
              <th className="border-b border-r border-black font-moul font-normal">ឆមាសទី២</th>
              <th className="border-b border-black font-moul font-normal">ប្រចាំឆ្នាំ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-r border-black text-left px-2 py-1">មានច្បាប់</td>
              <td className="border-b border-r border-black">{toKhmerNum(data.attendance.s1.withLeave)}</td>
              <td className="border-b border-r border-black">{toKhmerNum(data.attendance.s2.withLeave)}</td>
              <td className="border-b border-black">{toKhmerNum(data.attendance.s1.withLeave + data.attendance.s2.withLeave)}</td>
            </tr>
            <tr>
              <td className="border-r border-black text-left px-2 py-1">អត់ច្បាប់</td>
              <td className="border-r border-black">{toKhmerNum(data.attendance.s1.withoutLeave)}</td>
              <td className="border-r border-black">{toKhmerNum(data.attendance.s2.withoutLeave)}</td>
              <td className="">{toKhmerNum(data.attendance.s1.withoutLeave + data.attendance.s2.withoutLeave)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    {/* Page (Right) - Attendance & Valuations */}
    <div className="gradebook-print-page">
      <div className="flex justify-between text-[11px] font-moul mb-1">
        <span>អនុវិទ្យាល័យ <span className="border-b border-black border-dotted min-w-[120px] inline-block text-center font-sans">{p.schoolName}</span></span>
        <span>ចំនួនសិស្សក្នុងថ្នាក់ <span className="border-b border-black border-dotted min-w-[50px] inline-block text-center">{toKhmerNum(data.studentCount)}</span>នាក់</span>
      </div>
      <div className="border border-black h-[calc(100%-25px)] flex flex-col">
        <div className="font-moul py-1 text-sm border-b border-black pl-2">គ- ការវាយតម្លៃ</div>
        <table className="w-full border-collapse text-[10px] text-center font-bold">
          <thead>
            <tr>
              <th className="border-b border-r border-black font-moul font-normal w-[120px] py-1 text-left px-2">ផ្នែកទាំង៤</th>
              <th className="border-b border-r border-black font-moul font-normal">ឆមាសទី១</th>
              <th className="border-b border-r border-black font-moul font-normal">ឆមាសទី២</th>
              <th className="border-b border-black font-moul font-normal">ប្រចាំឆ្នាំ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-r border-black text-left px-2 py-1">១- ការសិក្សា</td>
              <td className="border-b border-r border-black">{data.coreValuations.study.s1}</td>
              <td className="border-b border-r border-black">{data.coreValuations.study.s2}</td>
              <td className="border-b border-black">{data.coreValuations.study.yr}</td>
            </tr>
            <tr>
              <td className="border-b border-r border-black text-left px-2 py-1">២- សីលធម៌រស់នៅ</td>
              <td className="border-b border-r border-black">{data.coreValuations.morals.s1}</td>
              <td className="border-b border-r border-black">{data.coreValuations.morals.s2}</td>
              <td className="border-b border-black">{data.coreValuations.morals.yr}</td>
            </tr>
            <tr>
              <td className="border-b border-r border-black text-left px-2 py-1">៣- ពលកម្ម-បង្កបង្កើនផល</td>
              <td className="border-b border-r border-black">{data.coreValuations.labor.s1}</td>
              <td className="border-b border-r border-black">{data.coreValuations.labor.s2}</td>
              <td className="border-b border-black">{data.coreValuations.labor.yr}</td>
            </tr>
            <tr>
              <td className="border-b border-r border-black text-left px-2 py-1">៤- សុខភាព-អនាម័យ</td>
              <td className="border-b border-r border-black">{data.coreValuations.health.s1}</td>
              <td className="border-b border-r border-black">{data.coreValuations.health.s2}</td>
              <td className="border-b border-black">{data.coreValuations.health.yr}</td>
            </tr>
          </tbody>
        </table>

        <div className="border-b border-black font-moul py-1 text-sm bg-white pl-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">ឃ- ការសរសើរ</div>
        <table className="w-full border-collapse text-[10px] text-center font-bold">
          <thead>
            <tr>
              <th className="border-b border-r border-black font-moul font-normal w-[120px] py-1 text-left px-2">បានទទួលការសរសើរ</th>
              <th className="border-b border-r border-black font-moul font-normal">ឆមាសទី១</th>
              <th className="border-b border-r border-black font-moul font-normal">ឆមាសទី២</th>
              <th className="border-b border-black font-moul font-normal">ប្រចាំឆ្នាំ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-r border-black text-left px-2 py-1">- បណ្ណសរសើរចំនួន</td>
              <td className="border-b border-r border-black">{toKhmerNum(data.commendations.bann.s1)}</td>
              <td className="border-b border-r border-black">{toKhmerNum(data.commendations.bann.s2)}</td>
              <td className="border-b border-black">{toKhmerNum(data.commendations.bann.yr)}</td>
            </tr>
            <tr>
              <td className="border-b border-r border-black text-left px-2 py-1">- លិខិតសរសើរចំនួន</td>
              <td className="border-b border-r border-black">{toKhmerNum(data.commendations.likhet.s1)}</td>
              <td className="border-b border-r border-black">{toKhmerNum(data.commendations.likhet.s2)}</td>
              <td className="border-b border-black">{toKhmerNum(data.commendations.likhet.yr)}</td>
            </tr>
            <tr>
              <td className="border-b border-r border-black text-left px-2 py-1">- សក្ខីប័ណ្ណលើកទឹកចិត្ត</td>
              <td className="border-b border-r border-black">{toKhmerNum(data.commendations.sakkey.s1)}</td>
              <td className="border-b border-r border-black">{toKhmerNum(data.commendations.sakkey.s2)}</td>
              <td className="border-b border-black">{toKhmerNum(data.commendations.sakkey.yr)}</td>
            </tr>
          </tbody>
        </table>

        <div className="border-b border-black font-moul py-1 text-[12px] bg-white pl-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">ង- លទ្ធផលនៃការប្រឡងបញ្ចប់ភូមិសិក្សា(ជាប់ ឬ ធ្លាក់)</div>
        <div className="border-b border-black py-2.5 px-2 text-[11px] font-bold leading-6">
          មណ្ឌលប្រឡង <span className="border-b border-black border-dotted inline-block w-[120px] text-center">{data.finalExamCenter}</span> (ខេត្ត <span className="border-b border-black border-dotted inline-block w-[100px] text-center">{data.finalExamProvince}</span>) 
          បន្ទប់ <span className="border-b border-black border-dotted inline-block w-[40px] text-center">{toKhmerNum(data.finalExamRoom)}</span> លេខតុ <span className="border-b border-black border-dotted inline-block w-[40px] text-center">{toKhmerNum(data.finalExamTable)}</span>
        </div>

        <div className="font-moul py-1 text-sm bg-white pl-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">ច- មូលវិចារ គ្រូបន្ទុកថ្នាក់</div>
        <div className="flex-1 px-4 py-2 relative min-h-[140px]">
          <div className="absolute right-6 top-2 text-center text-[10px] font-bold">
            ថ្ងៃទី.............ខែ................ឆ្នាំ២០............
          </div>
          
          <div className="absolute left-0 right-0 top-16 text-center font-moul text-[13px]">
            មូលវិចារ នាយកអនុវិទ្យាល័យ
          </div>

          <div className="absolute right-6 bottom-4 text-center text-[10px] font-bold">
            ថ្ងៃទី.............ខែ................ឆ្នាំ២០............
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════

export default function StudentGradeBook() {
  const [activeGrade, setActiveGrade] = useState(7);
  const [activeTab, setActiveTab] = useState(0);

  // ── Profile State ──
  const [profile, setProfile] = useState({
    nameKh: "ចាន់ សុវណ្ណារ៉ា", nameEn: "CHAN SOVANNARA", dob: "១៥ មករា ២០១០", pob: "ភូមិពោធិ៍ ឃុំពោធិ៍ ស្រុកពោធិ៍ ខេត្តតាកែវ",
    address: "ភូមិពោធិ៍ ឃុំពោធិ៍ ស្រុកពោធិ៍ ខេត្តតាកែវ", fatherName: "ចាន់ មករា", fatherJob: "កសិករ", motherName: "សួស ផល្លា", motherJob: "មេផ្ទះ",
    schoolName: "សង្គមរាស្ត្រនិយម"
  });

  // ── History State ──
  const [history, setHistory] = useState<AcademicHistoryRec[]>(Array(6).fill({
    year: "", index: "", grade: "", school: "", admissionDate: "", leftDate: "", remarks: ""
  }));

  const updateHistory = (index: number, field: keyof AcademicHistoryRec, value: string) => {
    const newHist = [...history];
    newHist[index] = { ...newHist[index], [field]: value };
    setHistory(newHist);
  };

  // ── Sync State ──
  const [studentSyncId, setStudentSyncId] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // ── Multi-Year Data State (Grades 7 to 12) ──
  const [records, setRecords] = useState<Record<number, YearlyRecord>>(() => {
    const init: Record<number, YearlyRecord> = {};
    GRADES.forEach(g => {
      const initScores: Record<string, SubjectScores> = {};
      SUBJECTS.forEach((s) => { initScores[s.id] = { sem1Avg: null, sem1Rank: null, sem2Avg: null, sem2Rank: null, yearlyAvg: null, yearlyRank: null, teacherRemarks: "" }; });
      init[g] = {
        academicYear: g === 7 ? "២០២៤-២០២៥" : "", classroomName: `${g}ក`, studentCount: "៣៥",
        scores: initScores,
        attendance: { s1: { withLeave: 0, withoutLeave: 0 }, s2: { withLeave: 0, withoutLeave: 0 } },
        coreValuations: {
          study: { s1: "", s2: "", yr: "" }, morals: { s1: "", s2: "", yr: "" }, labor: { s1: "", s2: "", yr: "" }, health: { s1: "", s2: "", yr: "" }
        },
        commendations: {
          bann: { s1: "", s2: "", yr: "" }, likhet: { s1: "", s2: "", yr: "" }, sakkey: { s1: "", s2: "", yr: "" }
        },
        finalExamCenter: "", finalExamProvince: "", finalExamRoom: "", finalExamTable: ""
      };
    });
    return init;
  });

  // Helpers to mutate current active grade record
  const curRecord = records[activeGrade];
  
  const updateRecord = (updater: (prev: YearlyRecord) => YearlyRecord) => {
    setRecords(prev => ({ ...prev, [activeGrade]: updater(prev[activeGrade]) }));
  };

  const updateScore = (subjectId: string, field: keyof SubjectScores, value: number | string | null) => {
    updateRecord(prev => ({
      ...prev, scores: { ...prev.scores, [subjectId]: { ...prev.scores[subjectId], [field]: value } }
    }));
  };

  const parseScoreInput = (val: string, max: number): number | null => {
    if (val === "" || val === null) return null;
    const n = parseFloat(val);
    if (isNaN(n)) return null;
    return Math.min(Math.max(0, n), max);
  };

  const computedScores = useMemo(() => {
    const result: Record<string, SubjectScores & { yearlyAvgComputed: number | null }> = {};
    SUBJECTS.forEach((sub) => {
      const s = curRecord.scores[sub.id];
      let yearlyAvg = null;
      if (s.sem1Avg !== null && s.sem2Avg !== null) yearlyAvg = (s.sem1Avg + s.sem2Avg) / 2;
      else if (s.sem1Avg !== null) yearlyAvg = s.sem1Avg;
      else if (s.sem2Avg !== null) yearlyAvg = s.sem2Avg;
      result[sub.id] = { ...s, yearlyAvg: s.yearlyAvg !== null ? s.yearlyAvg : yearlyAvg, yearlyAvgComputed: yearlyAvg };
    });
    return result;
  }, [curRecord.scores]);

  const summary = useMemo(() => {
    let totalSem1 = 0, totalSem2 = 0, totalYearly = 0, countSem1 = 0, countSem2 = 0, countYearly = 0;
    SUBJECTS.forEach((sub) => {
      const s = computedScores[sub.id];
      if (s.sem1Avg !== null) { totalSem1 += s.sem1Avg; countSem1++; }
      if (s.sem2Avg !== null) { totalSem2 += s.sem2Avg; countSem2++; }
      if (s.yearlyAvg !== null) { totalYearly += s.yearlyAvg; countYearly++; }
    });
    return {
      totalScoresSem1: totalSem1, totalScoresSem2: totalSem2, totalScoresYearly: totalYearly,
      classAvgSem1: countSem1 > 0 ? totalSem1 / countSem1 : null,
      classAvgSem2: countSem2 > 0 ? totalSem2 / countSem2 : null,
      classAvgYearly: countYearly > 0 ? totalYearly / countYearly : null,
    };
  }, [computedScores]);

  // Compute summary for ALL grades for print output
  const allComputedSummaries = useMemo(() => {
    const sums: Record<number, any> = {};
    const computedMaps: Record<number, any> = {};
    GRADES.forEach(g => {
      const r = records[g];
      const compMap: any = {};
      let totalSem1 = 0, totalSem2 = 0, totalYearly = 0, countSem1 = 0, countSem2 = 0, countYearly = 0;
      SUBJECTS.forEach(sub => {
        const s = r.scores[sub.id];
        let yearlyAvg = null;
        if (s.sem1Avg !== null && s.sem2Avg !== null) yearlyAvg = (s.sem1Avg + s.sem2Avg) / 2;
        else if (s.sem1Avg !== null) yearlyAvg = s.sem1Avg;
        else if (s.sem2Avg !== null) yearlyAvg = s.sem2Avg;
        compMap[sub.id] = { ...s, yearlyAvg: s.yearlyAvg !== null ? s.yearlyAvg : yearlyAvg };
        
        if (s.sem1Avg !== null) { totalSem1 += s.sem1Avg; countSem1++; }
        if (s.sem2Avg !== null) { totalSem2 += s.sem2Avg; countSem2++; }
        if (yearlyAvg !== null) { totalYearly += yearlyAvg; countYearly++; }
      });
      sums[g] = {
        totalScoresSem1: totalSem1, totalScoresSem2: totalSem2, totalScoresYearly: totalYearly,
        classAvgSem1: countSem1 > 0 ? totalSem1 / countSem1 : null,
        classAvgSem2: countSem2 > 0 ? totalSem2 / countSem2 : null,
        classAvgYearly: countYearly > 0 ? totalYearly / countYearly : null,
      };
      computedMaps[g] = compMap;
    });
    return { sums, computedMaps };
  }, [records]);


  const handlePrint = () => window.print();

  const handleSync = async () => {
    if (!studentSyncId) {
      alert("Please enter a Student ID to sync.");
      return;
    }
    setIsSyncing(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      // We will fetch the full record from the backend
      const res = await fetch(`${baseUrl}/api/students/${studentSyncId}/full-record`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
      });
      if (!res.ok) throw new Error("Failed to fetch student record");
      const data = await res.json();
      
      if (data.profile) setProfile(data.profile);
      if (data.history) setHistory(data.history);
      if (data.records) setRecords(data.records);
      
      alert("Sync completed successfully!");
    } catch (error) {
      console.error("Sync Error:", error);
      alert("Error syncing student data. Ensure the student ID is correct.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <div className="gradebook-print-only">
        {/* Spread 1: Cover */}
        <PrintCoverSpread p={{ ...profile, history }} />
        
        {/* Spreads 2-7: Grades 7 to 12 */}
        {GRADES.map(grade => (
          <PrintGradeSpread 
            key={grade} 
            gradeLabel={grade}
            p={profile} 
            data={{ ...records[grade], scores: allComputedSummaries.computedMaps[grade] }} 
            summary={allComputedSummaries.sums[grade]} 
          />
        ))}
      </div>

      <div className="gradebook-screen-only min-h-screen pb-16 w-full font-sans bg-slate-50 dark:bg-gray-900/50">
        {/* Top Action Bar */}
        <div className="print-hide sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-3 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <div className="flex items-center justify-between max-w-[1400px] mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1B365D] flex items-center justify-center shadow-md">
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-moul text-lg font-normal text-[#1B365D] leading-snug">សៀវភៅសិក្ខាគារិក (៦ឆ្នាំ)</h1>
                <p className="text-[11px] font-bold text-slate-400 dark:text-gray-500 tracking-wide">6-YEAR BOOKLET FORMAT (GRADES 7-12)</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white rounded-lg px-2 border border-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                <input 
                  type="text" 
                  placeholder="Student ID (e.g. STU-001)" 
                  value={studentSyncId}
                  onChange={(e) => setStudentSyncId(e.target.value)}
                  className="px-2 py-2 w-36 outline-none text-sm font-bold bg-transparent"
                />
                <button 
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="p-1.5 hover:bg-slate-100 dark:bg-gray-800/80 rounded-md text-[#1B365D] flex items-center justify-center disabled:opacity-50"
                  title="Sync from System"
                >
                  <RotateCcw size={16} className={isSyncing ? "animate-spin" : ""} />
                </button>
              </div>
              <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B365D] hover:bg-[#142a4a] text-white font-bold text-sm shadow-lg">
                <Printer size={16} /> <span>បោះពុម្ពសៀវភៅ១៤ទំព័រ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Profile Tab (Not tied to a specific grade) */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white rounded-2xl border-2 border-slate-200 dark:border-gray-700 p-6 shadow-sm mb-6 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <h2 className="font-moul text-[#1B365D] mb-4 flex items-center gap-2"><User size={18}/> ប្រវត្តិរូបសិស្ស (ទំព័រក្រប)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-bold text-sm mb-6">
              {Object.entries(profile).map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <label className="text-[11px] text-slate-400 dark:text-gray-500 uppercase tracking-wider">{key}</label>
                  <input type="text" value={val} onChange={(e) => setProfile(p => ({...p, [key]: e.target.value}))}
                    className="w-full px-3 py-2 rounded-lg border-2 border-slate-100 dark:border-gray-700/50 bg-slate-50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 focus:border-[#1B365D] outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
                </div>
              ))}
            </div>
            
            <h3 className="font-moul text-slate-500 dark:text-gray-400 mb-2 text-sm flex items-center gap-2"><GraduationCap size={16}/> ប្រវត្តិការសិក្សា (៦ឆ្នាំ)</h3>
            <div className="overflow-x-auto border-2 border-slate-100 dark:border-gray-700/50 rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 dark:bg-gray-800/80 text-slate-500 dark:text-gray-400 font-moul text-xs">
                  <tr><th className="p-2">ឆ្នាំសិក្សា</th><th className="p-2">អត្តលេខ</th><th className="p-2">ថ្នាក់</th><th className="p-2">សាលា</th><th className="p-2">ថ្ងៃចូលរៀន</th><th className="p-2">ថ្ងៃចេញ</th><th className="p-2">ផ្សេងៗ</th></tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i} className="border-t border-slate-100 dark:border-gray-700/50 hover:bg-slate-50 dark:bg-gray-900/50">
                      {['year', 'index', 'grade', 'school', 'admissionDate', 'leftDate', 'remarks'].map(field => (
                        <td key={field} className="p-1">
                          <input type="text" value={(h as any)[field]} onChange={(e) => updateHistory(i, field as keyof AcademicHistoryRec, e.target.value)}
                            className="w-full px-2 py-1.5 rounded-md border border-transparent bg-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-blue-400 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" placeholder="..." />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grade Selector */}
          <div className="flex items-center gap-4 mb-4">
            <h2 className="font-moul text-slate-500 dark:text-gray-400 text-sm">កត់ត្រាពិន្ទុប្រចាំឆ្នាំ៖</h2>
            <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 dark:border-gray-700 p-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
              {GRADES.map(g => (
                <button key={g} onClick={() => setActiveGrade(g)}
                  className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${activeGrade === g ? 'bg-[#1B365D] text-white shadow-md' : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:bg-gray-800/80'}`}>
                  ថ្នាក់ទី {g}
                </button>
              ))}
            </div>
          </div>

          {/* Grade Specific Content */}
          <div className="bg-white rounded-2xl border-2 border-[#1B365D] shadow-md overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <div className="flex bg-slate-50 dark:bg-gray-900/50 border-b border-slate-200 dark:border-gray-700 font-moul text-sm">
              <button onClick={() => setActiveTab(0)} className={`flex-1 flex items-center justify-center gap-2 py-3 transition-all ${activeTab === 0 ? 'bg-white text-[#1B365D] border-b-2 border-[#1B365D]' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700'}`}><Edit3 size={16}/> ព័ត៌មានឆ្នាំទី {activeGrade}</button>
              <button onClick={() => setActiveTab(1)} className={`flex-1 flex items-center justify-center gap-2 py-3 transition-all ${activeTab === 1 ? 'bg-white text-[#1B365D] border-b-2 border-[#1B365D]' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700'}`}><Award size={16}/> តារាងពិន្ទុ (ថ្នាក់ទី {activeGrade})</button>
              <button onClick={() => setActiveTab(2)} className={`flex-1 flex items-center justify-center gap-2 py-3 transition-all ${activeTab === 2 ? 'bg-white text-[#1B365D] border-b-2 border-[#1B365D]' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700'}`}><CalendarDays size={16}/> អវត្តមាន & វាយតម្លៃ (ថ្នាក់ទី {activeGrade})</button>
            </div>

            <div className="p-6">
              {activeTab === 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-bold text-sm animate-in fade-in">
                  <div className="space-y-1"><label className="text-[11px] text-slate-400 dark:text-gray-500">ឆ្នាំសិក្សា</label><input type="text" value={curRecord.academicYear} onChange={e => updateRecord(p => ({...p, academicYear: e.target.value}))} className="w-full px-3 py-2 rounded-lg border-2 border-slate-100 dark:border-gray-700/50 bg-slate-50 dark:bg-gray-900/50" /></div>
                  <div className="space-y-1"><label className="text-[11px] text-slate-400 dark:text-gray-500">ថ្នាក់</label><input type="text" value={curRecord.classroomName} onChange={e => updateRecord(p => ({...p, classroomName: e.target.value}))} className="w-full px-3 py-2 rounded-lg border-2 border-slate-100 dark:border-gray-700/50 bg-slate-50 dark:bg-gray-900/50" /></div>
                  <div className="space-y-1"><label className="text-[11px] text-slate-400 dark:text-gray-500">ចំនួនសិស្ស</label><input type="text" value={curRecord.studentCount} onChange={e => updateRecord(p => ({...p, studentCount: e.target.value}))} className="w-full px-3 py-2 rounded-lg border-2 border-slate-100 dark:border-gray-700/50 bg-slate-50 dark:bg-gray-900/50" /></div>
                  <div className="col-span-4 mt-4 border-t pt-4">
                    <h4 className="font-moul text-sm text-[#1B365D] mb-4">លទ្ធផលប្រឡងបញ្ចប់ភូមិសិក្សា (សម្រាប់តែថ្នាក់ទី៩ ឬ ១២)</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-1"><label className="text-[11px] text-slate-400 dark:text-gray-500">មណ្ឌល</label><input type="text" value={curRecord.finalExamCenter} onChange={e => updateRecord(p => ({...p, finalExamCenter: e.target.value}))} className="w-full px-3 py-2 rounded-lg border-2 border-slate-100 dark:border-gray-700/50 bg-slate-50 dark:bg-gray-900/50" /></div>
                      <div className="space-y-1"><label className="text-[11px] text-slate-400 dark:text-gray-500">ខេត្ត</label><input type="text" value={curRecord.finalExamProvince} onChange={e => updateRecord(p => ({...p, finalExamProvince: e.target.value}))} className="w-full px-3 py-2 rounded-lg border-2 border-slate-100 dark:border-gray-700/50 bg-slate-50 dark:bg-gray-900/50" /></div>
                      <div className="space-y-1"><label className="text-[11px] text-slate-400 dark:text-gray-500">បន្ទប់</label><input type="text" value={curRecord.finalExamRoom} onChange={e => updateRecord(p => ({...p, finalExamRoom: e.target.value}))} className="w-full px-3 py-2 rounded-lg border-2 border-slate-100 dark:border-gray-700/50 bg-slate-50 dark:bg-gray-900/50" /></div>
                      <div className="space-y-1"><label className="text-[11px] text-slate-400 dark:text-gray-500">លេខតុ</label><input type="text" value={curRecord.finalExamTable} onChange={e => updateRecord(p => ({...p, finalExamTable: e.target.value}))} className="w-full px-3 py-2 rounded-lg border-2 border-slate-100 dark:border-gray-700/50 bg-slate-50 dark:bg-gray-900/50" /></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                <div className="overflow-x-auto border-2 border-slate-100 dark:border-gray-700/50 rounded-xl animate-in fade-in">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#1B365D] text-white">
                        <th rowSpan={2} className="px-3 py-3 border-r border-[#2a4a75] font-moul text-xs w-12">ល.រ</th>
                        <th rowSpan={2} className="px-4 py-3 border-r border-[#2a4a75] font-moul text-xs min-w-[150px]">មុខវិជ្ជា</th>
                        <th rowSpan={2} className="px-2 py-3 border-r border-[#2a4a75] font-bold text-[11px] w-16">ពិន្ទុពេញ</th>
                        <th colSpan={2} className="px-2 py-2 border-r border-[#2a4a75] font-moul text-xs bg-[#1e3f6e]">ឆមាសទី១</th>
                        <th colSpan={2} className="px-2 py-2 border-r border-[#2a4a75] font-moul text-xs bg-[#1e3f6e]">ឆមាសទី២</th>
                        <th colSpan={2} className="px-2 py-2 border-r border-[#2a4a75] font-moul text-xs bg-[#234575]">ប្រចាំឆ្នាំ</th>
                        <th rowSpan={2} className="px-3 py-3 font-moul text-xs min-w-[140px]">មូលវិចារ</th>
                      </tr>
                      <tr className="bg-[#234575] text-white text-[11px]">
                        <th className="px-2 py-2 border-r border-[#2a4a75]">ម.ភាគ</th><th className="px-2 py-2 border-r border-[#2a4a75]">ចំ.ថ្នាក់</th>
                        <th className="px-2 py-2 border-r border-[#2a4a75]">ម.ភាគ</th><th className="px-2 py-2 border-r border-[#2a4a75]">ចំ.ថ្នាក់</th>
                        <th className="px-2 py-2 border-r border-[#2a4a75]">ម.ភាគ</th><th className="px-2 py-2 border-r border-[#2a4a75]">ចំ.ថ្នាក់</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SUBJECTS.map((sub, idx) => {
                        const s = computedScores[sub.id];
                        const yc = s.yearlyAvg !== null ? getClassification(s.yearlyAvg, sub.maxScore) : null;
                        return (
                          <tr key={sub.id} className="border-b border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:bg-gray-900/50">
                            <td className="px-3 py-2 text-center text-slate-400 dark:text-gray-500 font-bold">{toKhmerNum(idx + 1)}</td>
                            <td className="px-4 py-2 font-bold">{sub.nameKh}<div className="text-[10px] text-slate-400 dark:text-gray-500 font-normal uppercase">{sub.nameEn}</div></td>
                            <td className="px-2 py-2 text-center"><span className="bg-slate-100 dark:bg-gray-800/80 px-2 py-0.5 rounded-full font-black text-slate-600">{sub.maxScore}</span></td>
                            <td className="px-1 py-1"><input type="number" step="0.01" max={sub.maxScore} value={s.sem1Avg !== null ? s.sem1Avg : ""} onChange={(e) => updateScore(sub.id, "sem1Avg", parseScoreInput(e.target.value, sub.maxScore))} className="w-[60px] mx-auto block px-2 py-1 rounded border-2 border-transparent bg-blue-50 focus:bg-white dark:focus:bg-gray-800 focus:border-blue-400 outline-none font-bold text-center text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" /></td>
                            <td className="px-1 py-1"><input type="number" value={s.sem1Rank !== null ? s.sem1Rank : ""} onChange={(e) => updateScore(sub.id, "sem1Rank", e.target.value ? parseInt(e.target.value) : null)} className="w-[50px] mx-auto block px-2 py-1 rounded border-2 border-transparent bg-slate-50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 focus:border-slate-400 outline-none font-bold text-center text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" /></td>
                            <td className="px-1 py-1"><input type="number" step="0.01" max={sub.maxScore} value={s.sem2Avg !== null ? s.sem2Avg : ""} onChange={(e) => updateScore(sub.id, "sem2Avg", parseScoreInput(e.target.value, sub.maxScore))} className="w-[60px] mx-auto block px-2 py-1 rounded border-2 border-transparent bg-emerald-50 focus:bg-white dark:focus:bg-gray-800 focus:border-emerald-400 outline-none font-bold text-center text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" /></td>
                            <td className="px-1 py-1"><input type="number" value={s.sem2Rank !== null ? s.sem2Rank : ""} onChange={(e) => updateScore(sub.id, "sem2Rank", e.target.value ? parseInt(e.target.value) : null)} className="w-[50px] mx-auto block px-2 py-1 rounded border-2 border-transparent bg-slate-50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 focus:border-slate-400 outline-none font-bold text-center text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" /></td>
                            <td className={`px-2 py-2 text-center ${yc?.bg}`}><span className={`font-black text-sm ${yc?.color}`}>{s.yearlyAvg !== null ? s.yearlyAvg.toFixed(2) : "—"}</span><div className={`text-[9px] font-bold ${yc?.color}`}>{yc?.labelKh}</div></td>
                            <td className="px-1 py-1"><input type="number" value={s.yearlyRank !== null ? s.yearlyRank : ""} onChange={(e) => updateScore(sub.id, "yearlyRank", e.target.value ? parseInt(e.target.value) : null)} className="w-[50px] mx-auto block px-2 py-1 rounded border-2 border-transparent bg-amber-50 focus:bg-white dark:focus:bg-gray-800 focus:border-amber-400 outline-none font-bold text-center text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" /></td>
                            <td className="px-2 py-1"><input type="text" value={s.teacherRemarks} onChange={(e) => updateScore(sub.id, "teacherRemarks", e.target.value)} className="w-full px-2 py-1 rounded border-2 border-transparent bg-slate-50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 focus:border-slate-300 outline-none text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                  <div className="space-y-6">
                    <div className="border-2 border-slate-100 dark:border-gray-700/50 rounded-xl overflow-hidden">
                      <div className="bg-slate-100 dark:bg-gray-800/80 font-moul text-[#1B365D] py-2 px-4 text-sm">ចំនួនអវត្តមាន</div>
                      <table className="w-full text-center text-sm font-bold">
                        <thead className="bg-slate-50 dark:bg-gray-900/50 text-slate-500 dark:text-gray-400 font-moul text-xs"><tr><th className="p-2">ប្រភេទ</th><th className="p-2">ឆមាសទី១</th><th className="p-2">ឆមាសទី២</th></tr></thead>
                        <tbody>
                          <tr className="border-t border-slate-100 dark:border-gray-700/50">
                            <td className="p-2">មានច្បាប់</td>
                            <td><input type="number" value={curRecord.attendance.s1.withLeave || ""} onChange={e => updateRecord(p => ({...p, attendance: {...p.attendance, s1: {...p.attendance.s1, withLeave: parseInt(e.target.value)||0}}}))} className="w-16 mx-auto px-2 py-1 rounded border border-slate-200 dark:border-gray-700 text-center outline-none" /></td>
                            <td><input type="number" value={curRecord.attendance.s2.withLeave || ""} onChange={e => updateRecord(p => ({...p, attendance: {...p.attendance, s2: {...p.attendance.s2, withLeave: parseInt(e.target.value)||0}}}))} className="w-16 mx-auto px-2 py-1 rounded border border-slate-200 dark:border-gray-700 text-center outline-none" /></td>
                          </tr>
                          <tr className="border-t border-slate-100 dark:border-gray-700/50">
                            <td className="p-2">អត់ច្បាប់</td>
                            <td><input type="number" value={curRecord.attendance.s1.withoutLeave || ""} onChange={e => updateRecord(p => ({...p, attendance: {...p.attendance, s1: {...p.attendance.s1, withoutLeave: parseInt(e.target.value)||0}}}))} className="w-16 mx-auto px-2 py-1 rounded border border-slate-200 dark:border-gray-700 text-center outline-none" /></td>
                            <td><input type="number" value={curRecord.attendance.s2.withoutLeave || ""} onChange={e => updateRecord(p => ({...p, attendance: {...p.attendance, s2: {...p.attendance.s2, withoutLeave: parseInt(e.target.value)||0}}}))} className="w-16 mx-auto px-2 py-1 rounded border border-slate-200 dark:border-gray-700 text-center outline-none" /></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="border-2 border-slate-100 dark:border-gray-700/50 rounded-xl overflow-hidden">
                      <div className="bg-slate-100 dark:bg-gray-800/80 font-moul text-[#1B365D] py-2 px-4 text-sm">ការសរសើរ</div>
                      <table className="w-full text-center text-sm font-bold">
                        <thead className="bg-slate-50 dark:bg-gray-900/50 text-slate-500 dark:text-gray-400 font-moul text-xs"><tr><th className="p-2 text-left">ប្រភេទ</th><th className="p-2">ឆមាស១</th><th className="p-2">ឆមាស២</th><th className="p-2">ប្រចាំឆ្នាំ</th></tr></thead>
                        <tbody>
                          {Object.entries({ 'បណ្ណសរសើរ': 'bann', 'លិខិតសរសើរ': 'likhet', 'សក្ខីប័ណ្ណ': 'sakkey' }).map(([label, key]) => (
                            <tr key={key} className="border-t border-slate-100 dark:border-gray-700/50">
                              <td className="p-2 text-left text-xs">{label}</td>
                              <td><input type="text" value={(curRecord.commendations as any)[key].s1} onChange={e => updateRecord(p => ({...p, commendations: {...p.commendations, [key]: {...(p.commendations as any)[key], s1: e.target.value}}}))} className="w-12 mx-auto px-1 py-1 rounded border border-slate-200 dark:border-gray-700 text-center outline-none" /></td>
                              <td><input type="text" value={(curRecord.commendations as any)[key].s2} onChange={e => updateRecord(p => ({...p, commendations: {...p.commendations, [key]: {...(p.commendations as any)[key], s2: e.target.value}}}))} className="w-12 mx-auto px-1 py-1 rounded border border-slate-200 dark:border-gray-700 text-center outline-none" /></td>
                              <td><input type="text" value={(curRecord.commendations as any)[key].yr} onChange={e => updateRecord(p => ({...p, commendations: {...p.commendations, [key]: {...(p.commendations as any)[key], yr: e.target.value}}}))} className="w-12 mx-auto px-1 py-1 rounded border border-slate-200 dark:border-gray-700 text-center outline-none" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="border-2 border-slate-100 dark:border-gray-700/50 rounded-xl overflow-hidden h-fit">
                    <div className="bg-slate-100 dark:bg-gray-800/80 font-moul text-[#1B365D] py-2 px-4 text-sm">ការវាយតម្លៃផ្នែកទាំង៤</div>
                    <table className="w-full text-center text-sm font-bold">
                      <thead className="bg-slate-50 dark:bg-gray-900/50 text-slate-500 dark:text-gray-400 font-moul text-xs"><tr><th className="p-2 text-left">ផ្នែក</th><th className="p-2">ឆមាស១</th><th className="p-2">ឆមាស២</th><th className="p-2">ប្រចាំឆ្នាំ</th></tr></thead>
                      <tbody>
                        {Object.entries({ 'ការសិក្សា': 'study', 'សីលធម៌': 'morals', 'ពលកម្ម': 'labor', 'សុខភាព': 'health' }).map(([label, key]) => (
                          <tr key={key} className="border-t border-slate-100 dark:border-gray-700/50">
                            <td className="p-2 text-left font-sans text-xs">{label}</td>
                            <td><input type="text" value={(curRecord.coreValuations as any)[key].s1} onChange={e => updateRecord(p => ({...p, coreValuations: {...p.coreValuations, [key]: {...(p.coreValuations as any)[key], s1: e.target.value}}}))} className="w-12 mx-auto px-1 py-1 rounded border border-slate-200 dark:border-gray-700 text-center outline-none" /></td>
                            <td><input type="text" value={(curRecord.coreValuations as any)[key].s2} onChange={e => updateRecord(p => ({...p, coreValuations: {...p.coreValuations, [key]: {...(p.coreValuations as any)[key], s2: e.target.value}}}))} className="w-12 mx-auto px-1 py-1 rounded border border-slate-200 dark:border-gray-700 text-center outline-none" /></td>
                            <td><input type="text" value={(curRecord.coreValuations as any)[key].yr} onChange={e => updateRecord(p => ({...p, coreValuations: {...p.coreValuations, [key]: {...(p.coreValuations as any)[key], yr: e.target.value}}}))} className="w-12 mx-auto px-1 py-1 rounded border border-slate-200 dark:border-gray-700 text-center outline-none" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
