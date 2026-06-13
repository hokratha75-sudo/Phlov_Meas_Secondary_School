import { forwardRef } from "react";

export const KH_MONTHS = [
  "មករា","កុម្ភៈ","មីនា","មេសា","ឧសភា","មិថុនា",
  "កក្កដា","សីហា","កញ្ញា","តុលា","វិច្ឆិកា","ធ្នូ",
];

export function formatKhmerDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `ថ្ងៃទី ${d.getDate()} ខែ${KH_MONTHS[d.getMonth()]} ឆ្នាំ ${d.getFullYear()}`;
}

export const LEAVE_TYPE_LABELS: Record<string, string> = {
  ANNUAL: "ច្បាប់ឈប់ប្រចាំឆ្នាំ",
  SHORT_TERM: "ច្បាប់ឈប់រយៈពេលខ្លី",
  SICK_LEAVE: "ច្បាប់សម្រាកព្យាបាលជំងឺ",
  PERSONAL: "ច្បាប់សម្រាកដោយមានកិច្ចការផ្ទាល់ខ្លួន",
  MATERNITY: "ច្បាប់សម្រាកលំហែមាតុភាព",
};

interface LeaveRequest {
  id: number;
  leaveType: "ANNUAL" | "SHORT_TERM" | "SICK_LEAVE" | "PERSONAL" | "MATERNITY" | string;
  reason: string;
  addressDuringLeave: string;
  totalDays: number;
  startDate: string;
  endDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote?: string | null;
  signatureUrl?: string | null;
  createdAt: string;
  teacher?: {
    id?: number;
    nameKh?: string;
    nameEn?: string;
    subjectKh?: string;
    subjectEn?: string;
    gender?: string;
    phone?: string;
    position?: string;
    officerId?: string;
  } | null;
}

interface Props {
  request: LeaveRequest;
  letterDate?: Date;
}

/* ─── Shared table cell styles ─── */
const cell: React.CSSProperties = {
  border: "1px solid black",
  padding: "4px 6px",
  textAlign: "center",
  fontSize: "10px",
  lineHeight: 1.3,
};
const cellLeft: React.CSSProperties = { ...cell, textAlign: "left" };
const thCell: React.CSSProperties = { ...cell, fontWeight: "bold" };

/* ─── Checkbox component ─── */
const Chk = ({ on }: { on: boolean }) => (
  <span style={{
    width: "14px", height: "14px", border: "1.5px solid black",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontSize: "9px", lineHeight: 1, flexShrink: 0, marginRight: "4px",
    verticalAlign: "middle",
  }}>
    {on ? "✓" : ""}
  </span>
);

/* ─── Dotted underline span ─── */
const Dot = ({ children, w }: { children?: React.ReactNode; w?: string }) => (
  <span style={{
    borderBottom: "1px dotted black",
    display: "inline-block",
    minWidth: w || "100px",
    padding: "0 6px",
    textAlign: "center",
  }}>
    {children || "\u00A0"}
  </span>
);

/**
 * Cambodia Sub-decree No. 217 (អនុក្រឹត្យ ២១៧)
 * Official MoEYS A4 Leave Request Form.
 *
 * Layout strictly follows the reference paper form:
 *  - Kingdom motto centered at top
 *  - School info below left
 *  - Section 5 table full-width
 *  - Section 6 split: approval left, timetable right
 */
const LeaveRequestDocument = forwardRef<HTMLDivElement, Props>(
  ({ request }, ref) => {
    const t = request.teacher;
    const getSignatureUrl = (url: string | null | undefined) => {
      if (!url) return "";
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      if (url.includes("/uploads/")) {
        const parts = url.split("/uploads/");
        return `${baseUrl}/uploads/${parts[parts.length - 1]}`;
      }
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      return url;
    };
    const nameKh = t?.nameKh || "......................................";
    const gender = t?.gender === "female" ? "ស្រី" : t?.gender === "male" ? "ប្រុស" : "..........";
    const position = t?.position || "គ្រូបង្រៀន";
    const officerId = t?.officerId || "....................";
    const phone = t?.phone || "......................................";

    return (
      <div
        ref={ref}
        className="leave-doc-root"
        style={{
          fontFamily: "'Khmer OS Battambang', 'Khmer OS Siemreap', 'Khmer', sans-serif",
          fontSize: "12px",
          lineHeight: 1.5,
          background: "white",
          color: "#000",
          padding: "10mm 18mm 8mm 18mm",
          boxSizing: "border-box",
          width: "210mm",
          height: "297mm",
          overflow: "hidden",
        }}
      >

        {/* ═══════════════════════════════════════════════════════
            HEADER: Kingdom motto CENTERED on its own rows
            ═══════════════════════════════════════════════════════ */}
        <div style={{ textAlign: "center", marginBottom: "6px" }}>
          <p style={{
            fontFamily: "'Khmer OS Muol Light', 'Khmer OS Muol', serif",
            fontSize: "16px", margin: 0, lineHeight: 1.3,
          }}>ព្រះរាជាណាចក្រកម្ពុជា</p>
          <p style={{
            fontFamily: "'Khmer OS Muol Light', 'Khmer OS Muol', serif",
            fontSize: "14px", margin: "2px 0", lineHeight: 1.3,
          }}>ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "4px" }}>
            <svg viewBox="0 0 200 20" width="160" height="16" style={{ display: "block", color: "black" }}>
              {/* Left Line */}
              <line x1="10" y1="10" x2="80" y2="10" stroke="currentColor" strokeWidth="0.8" />
              {/* Left Dot */}
              <circle cx="85" cy="10" r="1.5" fill="currentColor" />
              {/* Left small diamond */}
              <path d="M 90 10 L 93 7 L 96 10 L 93 13 Z" fill="currentColor" />
              {/* Central Ornament - Flourishes and a diamond in the middle */}
              <path d="M 98 10 C 98 6, 102 6, 102 10 C 102 14, 98 14, 98 10 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <path d="M 102 10 L 105 6 L 108 10 L 105 14 Z" fill="currentColor" />
              <path d="M 112 10 C 112 6, 108 6, 108 10 C 108 14, 112 14, 112 10 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
              {/* Right small diamond */}
              <path d="M 114 10 L 117 7 L 120 10 L 117 13 Z" fill="currentColor" />
              {/* Right Dot */}
              <circle cx="125" cy="10" r="1.5" fill="currentColor" />
              {/* Right Line */}
              <line x1="130" y1="10" x2="190" y2="10" stroke="currentColor" strokeWidth="0.8" />
            </svg>
          </div>
        </div>

        {/* School info — LEFT aligned, below the motto */}
        <div style={{ fontSize: "12px", marginBottom: "4px" }}>
          <p style={{ margin: 0 }}>មន្ទីរអប់រំ យុវជន និងកីឡាខេត្ត..................</p>
          <p style={{ margin: 0, fontWeight: "bold" }}>វិទ្យាល័យ ផ្លូវមាស</p>
          <p style={{ margin: 0 }}>លេខ:........................</p>
        </div>

        {/* ═══════════════════════════════════════════════════════
            TITLE BLOCK — centered
            ═══════════════════════════════════════════════════════ */}
        <div style={{ textAlign: "center", margin: "10px 0 8px" }}>
          <p style={{
            fontFamily: "'Khmer OS Muol Light', 'Khmer OS Muol', serif",
            fontSize: "12px", margin: 0, lineHeight: 1.4,
          }}>
            សំណើច្បាប់ និងការអនុញ្ញាតច្បាប់ឈប់សម្រាកគ្រប់ប្រភេទ<br/>
            របស់មន្ត្រីរាជការស៊ីវិល នៃព្រះរាជាណាចក្រកម្ពុជា
          </p>
          <p style={{ fontSize: "10px", margin: "4px 0 0" }}>
            យោង: អនុក្រឹត្យលេខ ២១៧ អនក្រ.បក ចុះថ្ងៃទី១២ ខែឧសភា ឆ្នាំ២០១៣ ស្ដីពីរបបច្បាប់ឈប់សម្រាករបស់មន្រ្តីរាជការស៊ីវិល នៃព្រះរាជាណាចក្រកម្ពុជា ។
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════
            SECTION 1: Applicant Info
            ═══════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: "6px", fontSize: "12px" }}>
          <p style={{ margin: "0 0 3px" }}>
            ១.គោត្តនាម និងនាម <Dot w="140px">{nameKh}</Dot>
            {" "}ភេទ <Dot w="40px">{gender}</Dot>
            {" "}អត្តលេខ <Dot w="100px">{officerId}</Dot>
            {" "}មុខតំណែង <Dot w="100px">{position}</Dot>
          </p>
          <p style={{ margin: 0 }}>
            អង្គភាព <Dot w="260px">វិទ្យាល័យ ផ្លូវមាស</Dot>
            {" "}លេខទូរស័ព្ទ <Dot w="180px">{phone}</Dot>
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════
            SECTION 2: Leave Type Checkboxes
            ═══════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: "6px", fontSize: "12px" }}>
          <p style={{ margin: "0 0 3px" }}>២.ប្រភេទច្បាប់ឈប់សម្រាកដែលស្នើសុំ៖</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2px 8px", paddingLeft: "16px", fontSize: "11px" }}>
            <label><Chk on={request.leaveType === "ANNUAL"} />ឈប់ប្រចាំឆ្នាំ</label>
            <label><Chk on={request.leaveType === "SHORT_TERM"} />ឈប់រយៈពេលខ្លី</label>
            <label><Chk on={request.leaveType === "MATERNITY"} />ឈប់សម្រាកលំហែមាតុភាព</label>
            <label><Chk on={request.leaveType === "SICK_LEAVE"} />ឈប់សម្រាកព្យាបាលជំងឺ</label>
            <label><Chk on={request.leaveType === "PERSONAL"} />ឈប់សម្រាកដោយមានកិច្ចការផ្ទាល់ខ្លួន</label>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            SECTION 3: Duration & dates
            ═══════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: "4px", fontSize: "12px" }}>
          <p style={{ margin: "0 0 2px" }}>៣.ចំនួនថ្ងៃស្នើសុំឈប់ កាលបរិច្ឆេទចាប់ផ្តើមឈប់ និងកាលបរិច្ឆេទនៃការត្រឡប់មកធ្វើការវិញ</p>
          <ul style={{ listStyle: "disc", margin: "0 0 0 30px", padding: 0, lineHeight: 1.7 }}>
            <li>ចំនួនថ្ងៃស្នើសុំឈប់៖ <Dot w="120px">{request.totalDays} ថ្ងៃ</Dot></li>
            <li>ថ្ងៃ ខែ ឆ្នាំចាប់ផ្ដើមឈប់៖ <Dot w="220px">{formatKhmerDate(request.startDate)}</Dot></li>
            <li>ថ្ងៃ ខែ ឆ្នាំត្រឡប់មកធ្វើការវិញ៖ <Dot w="220px">{formatKhmerDate(request.endDate)}</Dot></li>
          </ul>
        </div>

        {/* ═══════════════════════════════════════════════════════
            SECTION 4: Purpose + 3-column Signature Row
            ═══════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: "6px", fontSize: "12px" }}>
          <p style={{ margin: "0 0 6px" }}>
            ៤.គោលបំណង៖ <span style={{ borderBottom: "1px dotted black", display: "inline-block", minWidth: "400px", padding: "0 6px" }}>{request.reason}</span>
          </p>
        </div>

        {/* Approval row: 3 columns matching the reference */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", fontSize: "10px", marginBottom: "10px", gap: "4px" }}>
          {/* Col 1 */}
          <div>
            <p style={{ margin: "0 0 2px" }}><Chk on={request.status === "APPROVED"} /> អនុញ្ញាត</p>
            <p style={{ margin: "0 0 2px" }}><Chk on={request.status === "REJECTED"} /> មិនអនុញ្ញាត</p>
            <p style={{ margin: 0, fontSize: "9px" }}>ហត្ថលេខាប្រធានអង្គភាព</p>
          </div>
          {/* Col 2 */}
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 2px" }}><Chk on={false} /> អនុញ្ញាត</p>
            <p style={{ margin: "0 0 2px" }}><Chk on={false} /> មិនអនុញ្ញាត</p>
            <p style={{ margin: 0, fontSize: "9px" }}>ហត្ថលេខាមន្រ្តីស្នើសុំ</p>
          </div>
          {/* Col 3 */}
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "0 0 2px" }}>ធ្វើនៅ..............ថ្ងៃទី..........ខែ..........ឆ្នាំ២០..........</p>
            <p style={{ margin: 0 }}>ហត្ថលេខាមន្រ្តីស្នើសុំ</p>
          </div>
        </div>

        {/* Signature dotted lines row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", textAlign: "center", fontSize: "9px", marginBottom: "12px" }}>
          <div>
            <div style={{ borderBottom: "1px dotted black", width: "70%", margin: "0 auto 2px" }}>&nbsp;</div>
            <p style={{ margin: 0 }}>ហត្ថលេខាប្រធានអង្គភាព</p>
          </div>
          <div>
            <div style={{ borderBottom: "1px dotted black", width: "70%", margin: "0 auto 2px" }}>&nbsp;</div>
            <p style={{ margin: 0 }}>ហត្ថលេខាប្រធានការិយាល័យ</p>
          </div>
          <div>
            {request.signatureUrl ? (
              <img src={getSignatureUrl(request.signatureUrl)} alt="Signature" style={{ maxHeight: "30px", objectFit: "contain", margin: "0 auto 2px", display: "block" }} />
            ) : (
              <div style={{ borderBottom: "1px dotted black", width: "70%", margin: "0 auto 2px" }}>&nbsp;</div>
            )}
            <p style={{ margin: 0, fontWeight: "bold" }}>{t?.nameKh}</p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            SECTION 5: Personnel Office Table — FULL WIDTH
            ═══════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: "10px" }}>
          <p style={{ fontWeight: "bold", margin: "0 0 4px", fontSize: "11px" }}>
            ៥.ការិយាល័យបុគ្គលិកដើម្បីប្រកាសព័ត៌មាន និងផ្ទៀងផ្ទាត់
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={{ ...thCell, width: "22%" }}>&nbsp;</th>
                <th style={thCell}>ឈប់ប្រចាំឆ្នាំ</th>
                <th style={thCell}>ឈប់រយៈពេលខ្លី</th>
                <th style={thCell}>ឈប់សម្រាក<br/>លំហែមាតុភាព</th>
                <th style={thCell}>ឈប់សម្រាក<br/>ព្យាបាលជំងឺ</th>
                <th style={thCell}>ឈប់សម្រាកដោយមាន<br/>កិច្ចការផ្ទាល់ខ្លួន</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={cellLeft}>ចំនួនថ្ងៃឈប់សម្រាក</td>
                <td style={cell}>&nbsp;</td>
                <td style={cell}>&nbsp;</td>
                <td style={cell}>&nbsp;</td>
                <td style={cell}>&nbsp;</td>
                <td style={cell}>&nbsp;</td>
              </tr>
              <tr>
                <td style={cellLeft}>ចំនួនថ្ងៃនៅសល់</td>
                <td style={cell}>&nbsp;</td>
                <td style={cell}>&nbsp;</td>
                <td style={cell}>&nbsp;</td>
                <td style={cell}>&nbsp;</td>
                <td style={cell}>&nbsp;</td>
              </tr>
            </tbody>
          </table>
          <p style={{ margin: "6px 0 0", fontSize: "10px" }}>
            ហត្ថលេខា និងកាលបរិច្ឆេទរបស់មន្រ្តីគ្រប់គ្រងបុគ្គលិក
          </p>
          <div style={{ borderBottom: "1px dotted black", width: "60%", marginTop: "24px" }}>&nbsp;</div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            SECTION 6: Approval (left) + Timetable (right)
            Below Section 5, as a separate row
            ═══════════════════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "38% 58%", gap: "4%", alignItems: "start" }}>

          {/* LEFT: Management Approval */}
          <div style={{ fontSize: "11px" }}>
            <p style={{ fontWeight: "bold", margin: "0 0 4px" }}>៦.ការអនុញ្ញាតរបស់ប្រធានអង្គភាព</p>
            <div style={{ paddingLeft: "8px", marginBottom: "4px" }}>
              <p style={{ margin: "0 0 2px" }}><Chk on={request.status === "APPROVED"} /> អនុញ្ញាត</p>
              <p style={{ margin: "0 0 2px" }}><Chk on={request.status === "REJECTED"} /> មិនអនុញ្ញាត</p>
            </div>
            <p style={{ margin: "4px 0", fontSize: "10px" }}>
              យោបល់៖ <span style={{ borderBottom: "1px dotted black", display: "inline-block", minWidth: "160px" }}>{request.adminNote || "\u00A0"}</span>
            </p>
            <p style={{ margin: "6px 0 0", fontSize: "10px" }}>ហត្ថលេខា និងកាលបរិច្ឆេទរបស់ប្រធានសាលា/អង្គភាព</p>
            <div style={{ borderBottom: "1px dotted black", width: "80%", marginTop: "20px" }}>&nbsp;</div>
          </div>

          {/* RIGHT: Teaching Timetable */}
          <div>
            <p style={{ fontWeight: "bold", margin: "0 0 4px", fontSize: "11px" }}>តារាងម៉ោងបង្រៀន</p>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th style={{ ...thCell, width: "14%" }}>ម៉ោង</th>
                  <th style={thCell}>ចន្ទ</th>
                  <th style={thCell}>អង្គារ</th>
                  <th style={thCell}>ពុធ</th>
                  <th style={thCell}>ព្រហ</th>
                  <th style={thCell}>សុក្រ</th>
                  <th style={thCell}>សៅរ៍</th>
                </tr>
              </thead>
              <tbody>
                {["7h-8h", "8h-9h", "9h-10h", "10h-11h", "2h-3h", "3h-4h", "4h-5h"].map(hr => (
                  <tr key={hr}>
                    <td style={cell}>{hr}</td>
                    <td style={cell}>&nbsp;</td>
                    <td style={cell}>&nbsp;</td>
                    <td style={cell}>&nbsp;</td>
                    <td style={cell}>&nbsp;</td>
                    <td style={cell}>&nbsp;</td>
                    <td style={cell}>&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ margin: "6px 0 0", fontSize: "9px", textAlign: "center" }}>
              ហត្ថលេខា និងកាលបរិច្ឆេទរបស់ប្រធានសាលានាសាលា/អង្គភាព
            </p>
            <div style={{ borderBottom: "1px dotted black", width: "80%", margin: "16px auto 0" }}>&nbsp;</div>
          </div>
        </div>

        {/* ══ PRINT STYLES ══ */}
        <style>{`
          @media print {
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            /* Hide everything except the document */
            aside, header, nav, button, .no-print {
              display: none !important;
            }
            body > * { display: none !important; }
            .leave-print-portal { display: block !important; }
            .leave-doc-root {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: auto !important;
              padding: 0 !important;
              margin: 0 !important;
              display: block !important;
              overflow: visible !important;
            }
            @page {
              size: A4 portrait;
              margin: 10mm 18mm 8mm 18mm;
            }
            table { page-break-inside: avoid; }
          }
        `}</style>
      </div>
    );
  }
);

LeaveRequestDocument.displayName = "LeaveRequestDocument";
export default LeaveRequestDocument;
