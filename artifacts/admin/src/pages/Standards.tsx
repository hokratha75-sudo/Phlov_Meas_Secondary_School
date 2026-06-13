import { BookOpen, FileText, CheckCircle2, AlertTriangle } from "lucide-react";

const areas = [
  { titleEn: "Exam Subjects", titleKh: "មុខវិជ្ជាប្រឡង", items: ["Khmer Literature", "Mathematics", "Physics", "Chemistry", "Biology", "History", "Geography", "English"] },
  { titleEn: "Passing Targets", titleKh: "គោលដៅជាប់", items: ["Set target pass rate", "Track distinction rate", "Compare by grade", "Monitor retake cases"] },
  { titleEn: "Preparation Options", titleKh: "ជម្រើសរៀបចំ", items: ["Mock exams", "Revision classes", "Past papers", "Weekend support"] },
];

export default function StandardsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-xl p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-xl text-primary">Bac II Standards</h2>
            <p className="text-sm text-gray-500 mt-1">Track Cambodia grade 12 exam readiness with clear actions and results.</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {areas.map(area => (
          <div key={area.titleEn} className="bg-white border rounded-xl p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <p className="font-semibold text-primary">{area.titleEn}</p>
            <p className="text-xs text-gray-400 mb-3">{area.titleKh}</p>
            <ul className="space-y-2 text-sm text-gray-600">
              {area.items.map(item => <li key={item} className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 text-green-600 shrink-0" />{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <p className="font-semibold text-primary mb-2">Useful options</p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500" />Flag students at risk before exam season</div>
            <div className="flex items-center gap-2"><FileText size={14} className="text-blue-600" />Publish revision notes and mock papers</div>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <p className="font-semibold text-primary mb-2">Suggested data</p>
          <p className="text-sm text-gray-600">Pass rate, distinction count, attendance for prep classes, average score by subject, and retake list.</p>
        </div>
      </div>
    </div>
  );
}