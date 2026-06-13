import { useTranslation } from "@/lib/i18n";
import { Printer, Download, FileText, CheckCircle2, XCircle } from "lucide-react";

interface YearEndSummaryProps {
  data: any[];
  className?: string;
  onPrint?: () => void;
}

export default function YearEndSummary({ data, className, onPrint }: YearEndSummaryProps) {
  const { lang, t } = useTranslation();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Action Bar */}
      <div className="flex items-center justify-between no-print bg-white p-4 rounded-md border shadow-sm mb-6 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          <span className="text-sm font-bold text-primary">{lang === 'km' ? "របាយការណ៍សង្ខេបប្រចាំឆ្នាំ" : "Year-End Summary Report"}</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onPrint}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:border-primary hover:text-primary px-4 py-2 rounded-md text-xs font-bold transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          >
            <Printer size={14} /> {lang === 'km' ? "បោះពុម្ព" : "Print"}
          </button>
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md text-xs font-bold hover:opacity-90 transition-all">
            <Download size={14} /> {lang === 'km' ? "ទាញយក PDF" : "Download PDF"}
          </button>
        </div>
      </div>

      {/* A4 Report Page */}
      <div className="bg-white p-[1in] border shadow-2xl mx-auto max-w-[8.27in] min-h-[11.69in] rounded-md print:p-0 print:border-0 print:shadow-none font-sans dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        {/* Header */}
        <div className="text-center space-y-2 mb-10 border-b-2 border-gray-900 pb-8">
          <h1 className="text-2xl font-bold text-gray-900">{lang === 'km' ? "ព្រះរាជាណាចក្រកម្ពុជា" : "KINGDOM OF CAMBODIA"}</h1>
          <h2 className="text-xl font-bold text-gray-900">{lang === 'km' ? "ជាតិ សាសនា ព្រះមហាក្សត្រ" : "NATION RELIGION KING"}</h2>
          <div className="pt-4">
            <h3 className="text-2xl font-bold text-primary underline underline-offset-8">
              {lang === 'km' ? "សេចក្តីសង្ខេបលទ្ធផលការសិក្សាប្រចាំឆ្នាំ" : "YEAR-END STUDY RESULT SUMMARY"}
            </h3>
          </div>
        </div>

        {/* Table */}
        <div className="w-full">
          <table className="w-full border-collapse border-2 border-gray-900">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="border-2 border-gray-900 px-2 py-3 text-xs font-bold text-center w-12">{lang === 'km' ? "ល.រ" : "No."}</th>
                <th className="border-2 border-gray-900 px-3 py-3 text-xs font-bold text-left">{lang === 'km' ? "អត្តលេខ" : "Student ID"}</th>
                <th className="border-2 border-gray-900 px-3 py-3 text-xs font-bold text-left">{lang === 'km' ? "ឈ្មោះសិស្ស" : "Student Name"}</th>
                <th className="border-2 border-gray-900 px-2 py-3 text-xs font-bold text-center w-12">{lang === 'km' ? "ភេទ" : "G"}</th>
                <th className="border-2 border-gray-900 px-2 py-3 text-xs font-bold text-center">Avg (S1)</th>
                <th className="border-2 border-gray-900 px-2 py-3 text-xs font-bold text-center">Avg (S2)</th>
                <th className="border-2 border-gray-900 px-2 py-3 text-xs font-bold text-center">Avg (Annual)</th>
                <th className="border-2 border-gray-900 px-2 py-3 text-xs font-bold text-center w-16">{lang === 'km' ? "ចំណាត់ថ្នាក់" : "Rank"}</th>
                <th className="border-2 border-gray-900 px-3 py-3 text-xs font-bold text-center w-20">{lang === 'km' ? "លទ្ធផល" : "Result"}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:bg-gray-900/50">
                  <td className="border-2 border-gray-900 px-2 py-2 text-xs text-center">{idx + 1}</td>
                  <td className="border-2 border-gray-900 px-3 py-2 text-xs font-bold">{item.studentId}</td>
                  <td className="border-2 border-gray-900 px-3 py-2 text-xs font-bold">{lang === 'km' ? item.nameKh : item.nameEn}</td>
                  <td className="border-2 border-gray-900 px-2 py-2 text-xs text-center">{item.gender === 'Male' ? 'ប' : 'ស្រី'}</td>
                  <td className="border-2 border-gray-900 px-2 py-2 text-xs text-center font-mono">{item.avgS1.toFixed(2)}</td>
                  <td className="border-2 border-gray-900 px-2 py-2 text-xs text-center font-mono">{item.avgS2.toFixed(2)}</td>
                  <td className="border-2 border-gray-900 px-2 py-2 text-xs text-center font-bold font-mono">{item.annualAvg.toFixed(2)}</td>
                  <td className="border-2 border-gray-900 px-2 py-2 text-xs text-center font-bold">
                    <span className={`px-2 py-0.5 rounded ${item.rank <= 3 ? "bg-amber-100 text-amber-700" : ""}`}>
                      {item.rank}
                    </span>
                  </td>
                  <td className="border-2 border-gray-900 px-3 py-2 text-[10px] text-center font-black uppercase">
                    <div className="flex items-center justify-center gap-1">
                      {item.result === "Pass" ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={10} className="no-print" /> {lang === 'km' ? "ជាប់" : "PASS"}
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center gap-1">
                          <XCircle size={10} className="no-print" /> {lang === 'km' ? "ធ្លាក់" : "FAIL"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Signatures */}
        <div className="mt-20 grid grid-cols-2 gap-20">
          <div className="text-center space-y-1">
            <p className="text-sm font-bold">{lang === 'km' ? "បានឃើញ និងឯកភាព" : "Seen and Approved"}</p>
            <p className="text-sm font-bold">{lang === 'km' ? "នាយកសាលា" : "School Principal"}</p>
            <div className="h-24"></div>
            <p className="text-sm font-bold text-gray-400">................................................</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm">{lang === 'km' ? "ធ្វើនៅថ្ងៃទី....... ខែ....... ឆ្នាំ ២០២..." : "Done on ....... ....... 202..."}</p>
            <p className="text-sm font-bold">{lang === 'km' ? "គ្រូបន្ទុកថ្នាក់" : "Class Advisor"}</p>
            <div className="h-24"></div>
            <p className="text-sm font-bold text-gray-400">................................................</p>
          </div>
        </div>
      </div>
    </div>
  );
}
