import React from 'react';
import { CardProps } from '@/types/student-id';

export const PremiumBackCard: React.FC<CardProps> = ({ student, template, theme }) => {
  const isMidnight = theme.id === 'midnight';
  const isCrimson = theme.id === 'crimson';
  const isJade = theme.id === 'jade';

  // No default stamp or signature - render nothing if empty

  return (
    <svg width="100%" height="100%" viewBox="0 0 220 340" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: '"Battambang", sans-serif' }}>
      <defs>
        <clipPath id="cardClip"><rect x="0" y="0" width="220" height="340" rx="14" /></clipPath>
      </defs>
      {/* ═════════════════ CARD 1: ROYAL MIDNIGHT GOLD ═════════════════ */}
      {isMidnight && (
        <g>
          <rect x="0" y="0" width="220" height="340" rx="14" fill="#0b1a35"/>
          {template.backBg && <image href={template.backBg} x="0" y="0" width="220" height="340" preserveAspectRatio="xMidYMid slice" opacity="0.15" clipPath="url(#cardClip)" />}
          <rect x="0" y="0" width="220" height="340" rx="14" fill="none" stroke="#c9a030" strokeWidth="2.5"/>
          <rect x="6" y="6" width="208" height="328" rx="11" fill="none" stroke="#c9a030" strokeWidth="0.5" opacity="0.3"/>

          <g fill="none" stroke="#c9a030" strokeWidth="1.1">
            <path d="M6,22 Q6,6 22,6"/><path d="M6,30 Q6,6 30,6"/><path d="M10,20 Q10,10 20,10"/>
            <path d="M8,16 Q14,12 12,18 Q10,24 16,22 Q22,20 20,26" strokeWidth="0.8"/>
            <path d="M12,8 Q18,6 16,12 Q14,18 20,16" strokeWidth="0.7" opacity="0.5"/>
            <circle cx="18" cy="18" r="2" fill="#c9a030" opacity="0.4"/>
            <ellipse cx="10" cy="8" rx="2.5" ry="4" fill="#c9a030" opacity="0.2"/>
          </g>
          <g fill="none" stroke="#c9a030" strokeWidth="1.1">
            <path d="M214,22 Q214,6 198,6"/><path d="M214,30 Q214,6 190,6"/><path d="M210,20 Q210,10 200,10"/>
            <path d="M212,16 Q206,12 208,18 Q210,24 204,22 Q198,20 200,26" strokeWidth="0.8"/>
            <circle cx="202" cy="18" r="2" fill="#c9a030" opacity="0.4"/>
            <ellipse cx="210" cy="8" rx="2.5" ry="4" fill="#c9a030" opacity="0.2"/>
          </g>
          <g fill="none" stroke="#c9a030" strokeWidth="1.1">
            <path d="M6,318 Q6,334 22,334"/><path d="M6,310 Q6,334 30,334"/><path d="M10,320 Q10,330 20,330"/>
            <path d="M8,324 Q14,328 12,322 Q10,316 16,318 Q22,320 20,314" strokeWidth="0.8"/>
            <circle cx="18" cy="322" r="2" fill="#c9a030" opacity="0.4"/>
            <ellipse cx="10" cy="332" rx="2.5" ry="4" fill="#c9a030" opacity="0.2"/>
          </g>
          <g fill="none" stroke="#c9a030" strokeWidth="1.1">
            <path d="M214,318 Q214,334 198,334"/><path d="M214,310 Q214,334 190,334"/><path d="M210,320 Q210,330 200,330"/>
            <path d="M212,324 Q206,328 208,322 Q210,316 204,318 Q198,320 200,314" strokeWidth="0.8"/>
            <circle cx="202" cy="322" r="2" fill="#c9a030" opacity="0.4"/>
            <ellipse cx="210" cy="332" rx="2.5" ry="4" fill="#c9a030" opacity="0.2"/>
          </g>

          <rect x="14" y="14" width="192" height="22" rx="3" fill="#c9a030" opacity="0.12"/>
          <line x1="14" y1="36" x2="206" y2="36" stroke="#c9a030" strokeWidth="0.5" opacity="0.5"/>
          <text x="110" y="29" textAnchor="middle" fontFamily='"Khmer OS Muol Light", serif' fontSize="8.5" fontWeight="700" fill="#c9a030">ព័ត៌មានខាងក្រោយ — CARD BACK</text>

          <circle cx="23" cy="52" r="5" fill="#c9a030" opacity="0.9"/>
          <text x="23" y="55" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0b1a35">1</text>
          <text x="33" y="55" fontFamily='"Khmer OS Muol Light", serif' fontSize="9" fontWeight="700" fill="#c9a030">កម្រិតវប្បធម៌ (Grade Level)</text>
          <line x1="14" y1="60" x2="206" y2="60" stroke="#c9a030" strokeWidth="0.4" opacity="0.35"/>

          <rect x="14" y="64" width="192" height="18" rx="3" fill="#c9a030" opacity="0.08"/>
          <rect x="18" y="67" width="4" height="12" rx="1" fill="#c9a030" opacity="0.7"/>
          <text x="28" y="77" fontSize="11" fontWeight="700" fill="#ffffff">{student.grade}</text>

          <circle cx="23" cy="95" r="5" fill="#c9a030" opacity="0.9"/>
          <text x="23" y="98" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0b1a35">2</text>
          <text x="33" y="98" fontFamily='"Khmer OS Muol Light", serif' fontSize="9" fontWeight="700" fill="#c9a030">ព័ត៌មានមាតាបិតា</text>
          <line x1="14" y1="103" x2="206" y2="103" stroke="#c9a030" strokeWidth="0.4" opacity="0.35"/>

          <rect x="14" y="107" width="192" height="56" rx="3" fill="#c9a030" opacity="0.06"/>
          <text x="20" y="119" fontSize="8" fill="#c9a030" opacity="0.7">ឪពុក :</text>
          <text x="58" y="119" fontSize="8.5" fill="#ffffff">{student.fatherName || '.............................'}</text>
          <line x1="18" y1="122" x2="202" y2="122" stroke="#c9a030" strokeWidth="0.3" opacity="0.2"/>
          <text x="20" y="133" fontSize="8" fill="#c9a030" opacity="0.7">ម្តាយ :</text>
          <text x="58" y="133" fontSize="8.5" fill="#ffffff">{student.motherName || '.............................'}</text>
          <line x1="18" y1="136" x2="202" y2="136" stroke="#c9a030" strokeWidth="0.3" opacity="0.2"/>
          <text x="20" y="147" fontSize="8" fill="#c9a030" opacity="0.7">លេខ :</text>
          <text x="58" y="147" fontSize="8.5" fill="#c9a030">{student.parentPhone || '.............................'}</text>
          <line x1="18" y1="150" x2="202" y2="150" stroke="#c9a030" strokeWidth="0.3" opacity="0.2"/>
          <text x="20" y="160" fontSize="8" fill="#c9a030" opacity="0.7">ផ្សេងៗ :</text>
          <text x="58" y="160" fontSize="8" fill="#ffffff">.............................</text>

          <circle cx="23" cy="178" r="5" fill="#c9a030" opacity="0.9"/>
          <text x="23" y="181" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0b1a35">3</text>
          <text x="33" y="181" fontFamily='"Khmer OS Muol Light", serif' fontSize="9" fontWeight="700" fill="#c9a030">ទីលំនៅបច្ចុប្បន្ន (Address)</text>
          <line x1="14" y1="186" x2="206" y2="186" stroke="#c9a030" strokeWidth="0.4" opacity="0.35"/>

          <rect x="14" y="189" width="192" height="18" rx="3" fill="#c9a030" opacity="0.08"/>
          <rect x="18" y="192" width="4" height="12" rx="1" fill="#c9a030" opacity="0.7"/>
          <text x="28" y="202" fontSize="9" fontWeight="700" fill="#ffffff">{student.currentAddress || '...........................................................'}</text>

          <rect x="14" y="215" width="192" height="64" rx="5" fill="#c9a030" opacity="0.07"/>
          <rect x="14" y="215" width="192" height="64" rx="5" fill="none" stroke="#c9a030" strokeWidth="0.6" opacity="0.3"/>
          <circle cx="24" cy="224" r="5" fill="none" stroke="#c9a030" strokeWidth="1"/>
          <path d="M21,224 L23,226 L27,221" fill="none" stroke="#c9a030" strokeWidth="1.2"/>
          <text x="34" y="227" fontFamily='"Khmer OS Muol Light", serif' fontSize="8.5" fontWeight="700" fill="#c9a030">លក្ខខណ្ឌប្រើប្រាស់បណ្ណ</text>
          <line x1="18" y1="231" x2="202" y2="231" stroke="#c9a030" strokeWidth="0.3" opacity="0.3"/>
          <text x="20" y="241" fontSize="7" fill="#ffffff" opacity="0.75">• សិស្សត្រូវពាក់បណ្ណនេះជានិច្ច រៀងរាល់ពេលចូលសាលា</text>
          <text x="20" y="253" fontSize="7" fill="#ffffff" opacity="0.75">• បណ្ណនេះមិនអាចផ្ទេរប្រើប្រាស់ដល់ជនទី៣ឡើយ</text>
          <text x="20" y="265" fontSize="7" fill="#ffffff" opacity="0.75">• ករណីបាត់ ឬខូច ត្រូវរាយការណ៍ជូនការិយាល័យភ្លាម</text>
          <text x="20" y="277" fontSize="7" fill="#ffffff" opacity="0.75">• សិស្សឈប់រៀន ត្រូវត្រឡប់ប័ណ្ណមក ការិយាល័យ</text>

          <line x1="110" y1="286" x2="110" y2="318" stroke="#c9a030" strokeWidth="0.6" opacity="0.35"/>
          <text x="18" y="294" textAnchor="start" fontSize="6.5" fill="#c9a030" opacity="0.6">ហត្ថលេខា</text>
          <text x="100" y="313" textAnchor="end" fontSize="6.5" fill="#c9a030" opacity="0.8">សិស្ស</text>

          <text x="120" y="294" textAnchor="start" fontSize="6.5" fill="#c9a030" opacity="0.6">ហត្ថលេខា</text>
          <text x="202" y="313" textAnchor="end" fontSize="6.5" fill="#c9a030" opacity="0.9">{template.principalName}</text>
          
          {template.stamp && <image href={template.stamp} x="120" y="286" width="30" height="30" opacity="0.4" preserveAspectRatio="xMidYMid meet" />}
          {template.signature && <image href={template.signature} x="110" y="292" width="60" height="35" opacity="0.8" preserveAspectRatio="xMidYMid meet" />}

          <rect x="14" y="322" width="192" height="14" rx="3" fill="#c9a030" opacity="0.12"/>
          <line x1="14" y1="322" x2="206" y2="322" stroke="#c9a030" strokeWidth="0.5" opacity="0.5"/>
          <text x="110" y="332" textAnchor="middle" fontSize="6.5" fill="#c9a030" opacity="0.7">{template.schoolNameKh} · {student.academicYear || '2024–2025'}</text>
        </g>
      )}

      {/* ═════════════════ CARD 2: ANGKOR CRIMSON IVORY ═════════════════ */}
      {isCrimson && (
        <g>
          <rect x="0" y="0" width="220" height="340" rx="14" fill="#f9f3e8"/>
          {template.backBg && <image href={template.backBg} x="0" y="0" width="220" height="340" preserveAspectRatio="xMidYMid slice" opacity="0.15" clipPath="url(#cardClip)" />}
          <rect x="0" y="0" width="220" height="340" rx="14" fill="none" stroke="#8b1c1c" strokeWidth="2.5"/>
          <rect x="7" y="7" width="206" height="326" rx="11" fill="none" stroke="#c9a030" strokeWidth="0.8" opacity="0.5"/>

          <g fill="none" stroke="#8b1c1c" strokeWidth="1.2">
            <path d="M15,7 Q7,7 7,15 L7,28"/><path d="M18,7 Q7,7 7,18"/>
            <path d="M9,12 Q12,8 16,9 Q19,11 16,14 Q13,17 16,20 Q19,23 17,26" strokeWidth="0.9"/>
            <path d="M12,8 Q15,5 18,7 Q21,10 18,13" strokeWidth="0.7" opacity="0.5"/>
            <circle cx="16" cy="16" r="2.5" fill="#8b1c1c" opacity="0.3"/>
          </g>
          <g fill="none" stroke="#8b1c1c" strokeWidth="1.2">
            <path d="M205,7 Q213,7 213,15 L213,28"/><path d="M202,7 Q213,7 213,18"/>
            <path d="M211,12 Q208,8 204,9 Q201,11 204,14 Q207,17 204,20 Q201,23 203,26" strokeWidth="0.9"/>
            <circle cx="204" cy="16" r="2.5" fill="#8b1c1c" opacity="0.3"/>
          </g>
          <g fill="none" stroke="#8b1c1c" strokeWidth="1.2">
            <path d="M15,333 Q7,333 7,325 L7,312"/><path d="M18,333 Q7,333 7,322"/>
            <path d="M9,328 Q12,332 16,331 Q19,329 16,326 Q13,323 16,320 Q19,317 17,314" strokeWidth="0.9"/>
            <circle cx="16" cy="324" r="2.5" fill="#8b1c1c" opacity="0.3"/>
          </g>
          <g fill="none" stroke="#8b1c1c" strokeWidth="1.2">
            <path d="M205,333 Q213,333 213,325 L213,312"/><path d="M202,333 Q213,333 213,322"/>
            <path d="M211,328 Q208,332 204,331 Q201,329 204,326 Q207,323 204,320 Q201,317 203,314" strokeWidth="0.9"/>
            <circle cx="204" cy="324" r="2.5" fill="#8b1c1c" opacity="0.3"/>
          </g>

          <rect x="15" y="15" width="190" height="22" rx="3" fill="#8b1c1c"/>
          <text x="110" y="30" textAnchor="middle" fontFamily='"Khmer OS Muol Light", serif' fontSize="8.5" fontWeight="700" fill="#f9d980">ព័ត៌មានខាងក្រោយ — CARD BACK</text>

          <rect x="17" y="43" width="8" height="8" rx="1" fill="#8b1c1c"/>
          <text x="21" y="50" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff">1</text>
          <text x="30" y="51" fontFamily='"Khmer OS Muol Light", serif' fontSize="9" fontWeight="700" fill="#8b1c1c">កម្រិតវប្បធម៌ (Grade Level)</text>
          <line x1="15" y1="56" x2="205" y2="56" stroke="#c9a030" strokeWidth="0.5" opacity="0.5"/>

          <rect x="15" y="59" width="190" height="18" rx="3" fill="#8b1c1c" opacity="0.07"/>
          <rect x="18" y="62" width="3" height="11" rx="1" fill="#8b1c1c" opacity="0.6"/>
          <text x="28" y="73" fontSize="12" fontWeight="700" fill="#3a0f0f">{student.grade}</text>

          <rect x="17" y="85" width="8" height="8" rx="1" fill="#8b1c1c"/>
          <text x="21" y="92" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff">2</text>
          <text x="30" y="93" fontFamily='"Khmer OS Muol Light", serif' fontSize="9" fontWeight="700" fill="#8b1c1c">ព័ត៌មានមាតាបិតា</text>
          <line x1="15" y1="98" x2="205" y2="98" stroke="#c9a030" strokeWidth="0.5" opacity="0.5"/>

          <rect x="15" y="101" width="190" height="56" rx="3" fill="#8b1c1c" opacity="0.05"/>
          <text x="20" y="113" fontSize="8" fill="#8b1c1c" opacity="0.7">ឪពុក :</text>
          <text x="54" y="113" fontSize="8.5" fill="#3a0f0f">{student.fatherName || '.....................................'}</text>
          <line x1="17" y1="116" x2="203" y2="116" stroke="#c9a030" strokeWidth="0.3" opacity="0.4"/>
          <text x="20" y="126" fontSize="8" fill="#8b1c1c" opacity="0.7">ម្តាយ :</text>
          <text x="54" y="126" fontSize="8.5" fill="#3a0f0f">{student.motherName || '.....................................'}</text>
          <line x1="17" y1="129" x2="203" y2="129" stroke="#c9a030" strokeWidth="0.3" opacity="0.4"/>
          <text x="20" y="139" fontSize="8" fill="#8b1c1c" opacity="0.7">លេខ :</text>
          <text x="54" y="139" fontSize="8.5" fill="#8b1c1c">{student.parentPhone || '.....................................'}</text>
          <line x1="17" y1="142" x2="203" y2="142" stroke="#c9a030" strokeWidth="0.3" opacity="0.4"/>
          <text x="20" y="152" fontSize="8" fill="#8b1c1c" opacity="0.7">ផ្សេងៗ :</text>
          <text x="54" y="152" fontSize="8" fill="#3a0f0f">.....................................</text>

          <rect x="17" y="163" width="8" height="8" rx="1" fill="#8b1c1c"/>
          <text x="21" y="170" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff">3</text>
          <text x="30" y="171" fontFamily='"Khmer OS Muol Light", serif' fontSize="9" fontWeight="700" fill="#8b1c1c">ទីលំនៅបច្ចុប្បន្ន (Address)</text>
          <line x1="15" y1="176" x2="205" y2="176" stroke="#c9a030" strokeWidth="0.5" opacity="0.5"/>

          <rect x="15" y="179" width="190" height="18" rx="3" fill="#8b1c1c" opacity="0.07"/>
          <rect x="18" y="182" width="3" height="11" rx="1" fill="#8b1c1c" opacity="0.6"/>
          <text x="28" y="193" fontSize="9" fontWeight="700" fill="#3a0f0f">{student.currentAddress || '...........................................................'}</text>

          <rect x="15" y="203" width="190" height="66" rx="5" fill="#8b1c1c" opacity="0.05"/>
          <rect x="15" y="203" width="190" height="66" rx="5" fill="none" stroke="#8b1c1c" strokeWidth="0.8" opacity="0.3"/>
          <circle cx="24" cy="212" r="5" fill="none" stroke="#8b1c1c" strokeWidth="1"/>
          <path d="M21,212 L23,214 L27,209" fill="none" stroke="#8b1c1c" strokeWidth="1.2"/>
          <text x="34" y="215" fontFamily='"Khmer OS Muol Light", serif' fontSize="8.5" fontWeight="700" fill="#8b1c1c">លក្ខខណ្ឌប្រើប្រាស់បណ្ណ</text>
          <line x1="18" y1="219" x2="202" y2="219" stroke="#8b1c1c" strokeWidth="0.3" opacity="0.3"/>
          <text x="20" y="229" fontSize="7" fill="#3a0f0f" opacity="0.8">• សិស្សត្រូវពាក់បណ្ណនេះជានិច្ច រៀងរាល់ពេលចូលសាលា</text>
          <text x="20" y="241" fontSize="7" fill="#3a0f0f" opacity="0.8">• បណ្ណនេះមិនអាចផ្ទេរប្រើប្រាស់ដល់ជនទី៣ឡើយ</text>
          <text x="20" y="253" fontSize="7" fill="#3a0f0f" opacity="0.8">• ករណីបាត់ ឬខូច ត្រូវរាយការណ៍ជូនការិយាល័យភ្លាម</text>
          <text x="20" y="265" fontSize="7" fill="#3a0f0f" opacity="0.8">• សិស្សឈប់រៀន ត្រូវត្រឡប់ប័ណ្ណមក ការិយាល័យ</text>

          <line x1="110" y1="276" x2="110" y2="308" stroke="#8b1c1c" strokeWidth="0.7" opacity="0.4"/>
          <text x="19" y="284" textAnchor="start" fontSize="6.5" fill="#8b1c1c" opacity="0.6">ហត្ថលេខា</text>
          <text x="99" y="304" textAnchor="end" fontSize="6.5" fill="#8b1c1c" opacity="0.8">សិស្ស</text>

          <text x="121" y="284" textAnchor="start" fontSize="6.5" fill="#8b1c1c" opacity="0.6">ហត្ថលេខា</text>
          <text x="201" y="304" textAnchor="end" fontSize="6.5" fill="#8b1c1c" opacity="0.9">{template.principalName}</text>

          {template.stamp && <image href={template.stamp} x="122" y="276" width="30" height="30" opacity="0.4" preserveAspectRatio="xMidYMid meet" />}
          {template.signature && <image href={template.signature} x="110" y="282" width="60" height="35" opacity="0.8" preserveAspectRatio="xMidYMid meet" />}

          <rect x="15" y="315" width="190" height="18" rx="3" fill="#8b1c1c"/>
          <text x="110" y="327" textAnchor="middle" fontSize="6.5" fill="#f9d980" opacity="0.85">{template.schoolNameKh} · {student.academicYear || '2024–2025'}</text>
        </g>
      )}

      {/* ═════════════════ CARD 3: DARK JADE & LOTUS ═════════════════ */}
      {isJade && (
        <g>
          <rect x="0" y="0" width="220" height="340" rx="14" fill="#0e1f1a"/>
          {template.backBg && <image href={template.backBg} x="0" y="0" width="220" height="340" preserveAspectRatio="xMidYMid slice" opacity="0.15" clipPath="url(#cardClip)" />}
          <rect x="0" y="0" width="220" height="340" rx="14" fill="none" stroke="#3cb88a" strokeWidth="2"/>
          <rect x="6" y="6" width="208" height="328" rx="11" fill="none" stroke="#3cb88a" strokeWidth="0.4" opacity="0.25"/>

          <g fill="none" stroke="#3cb88a" strokeWidth="1" opacity="0.7">
            <path d="M6,22 Q6,6 22,6"/><path d="M6,30 Q6,6 30,6"/><path d="M10,20 Q10,10 20,10"/>
            <path d="M8,16 Q14,12 12,18 Q10,24 16,22 Q22,20 20,26" strokeWidth="0.8"/>
            <circle cx="18" cy="18" r="2" fill="#3cb88a" opacity="0.4"/>
            <ellipse cx="10" cy="8" rx="2.5" ry="4" fill="#3cb88a" opacity="0.2"/>
          </g>
          <g fill="none" stroke="#3cb88a" strokeWidth="1" opacity="0.7">
            <path d="M214,22 Q214,6 198,6"/><path d="M214,30 Q214,6 190,6"/>
            <path d="M212,16 Q206,12 208,18 Q210,24 204,22 Q198,20 200,26" strokeWidth="0.8"/>
            <circle cx="202" cy="18" r="2" fill="#3cb88a" opacity="0.4"/>
            <ellipse cx="210" cy="8" rx="2.5" ry="4" fill="#3cb88a" opacity="0.2"/>
          </g>
          <g fill="none" stroke="#3cb88a" strokeWidth="1" opacity="0.7">
            <path d="M6,318 Q6,334 22,334"/><path d="M6,310 Q6,334 30,334"/>
            <path d="M8,324 Q14,328 12,322 Q10,316 16,318 Q22,320 20,314" strokeWidth="0.8"/>
            <circle cx="18" cy="322" r="2" fill="#3cb88a" opacity="0.4"/>
            <ellipse cx="10" cy="332" rx="2.5" ry="4" fill="#3cb88a" opacity="0.2"/>
          </g>
          <g fill="none" stroke="#3cb88a" strokeWidth="1" opacity="0.7">
            <path d="M214,318 Q214,334 198,334"/><path d="M214,310 Q214,334 190,334"/>
            <path d="M212,324 Q206,328 208,322 Q210,316 204,318 Q198,320 200,314" strokeWidth="0.8"/>
            <circle cx="202" cy="322" r="2" fill="#3cb88a" opacity="0.4"/>
            <ellipse cx="210" cy="332" rx="2.5" ry="4" fill="#3cb88a" opacity="0.2"/>
          </g>

          <rect x="14" y="14" width="192" height="22" rx="4" fill="#1a3d30"/>
          <rect x="14" y="14" width="192" height="22" rx="4" fill="none" stroke="#3cb88a" strokeWidth="0.7" opacity="0.4"/>
          <text x="110" y="29" textAnchor="middle" fontFamily='"Khmer OS Muol Light", serif' fontSize="8.5" fontWeight="700" fill="#7de8c4">ព័ត៌មានខាងក្រោយ — CARD BACK</text>

          <circle cx="23" cy="49" r="5" fill="#3cb88a" opacity="0.8"/>
          <text x="23" y="52" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0e1f1a">1</text>
          <text x="33" y="52" fontFamily='"Khmer OS Muol Light", serif' fontSize="9" fontWeight="700" fill="#7de8c4">កម្រិតវប្បធម៌ (Grade Level)</text>
          <line x1="14" y1="57" x2="206" y2="57" stroke="#3cb88a" strokeWidth="0.4" opacity="0.3"/>

          <rect x="14" y="60" width="192" height="18" rx="3" fill="#3cb88a" opacity="0.07"/>
          <rect x="18" y="63" width="3" height="11" rx="1" fill="#3cb88a" opacity="0.7"/>
          <text x="28" y="74" fontSize="12" fontWeight="700" fill="#e8f9f4">{student.grade}</text>

          <circle cx="23" cy="90" r="5" fill="#3cb88a" opacity="0.8"/>
          <text x="23" y="93" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0e1f1a">2</text>
          <text x="33" y="93" fontFamily='"Khmer OS Muol Light", serif' fontSize="9" fontWeight="700" fill="#7de8c4">ព័ត៌មានមាតាបិតា</text>
          <line x1="14" y1="98" x2="206" y2="98" stroke="#3cb88a" strokeWidth="0.4" opacity="0.3"/>

          <rect x="14" y="101" width="192" height="56" rx="3" fill="#3cb88a" opacity="0.05"/>
          <text x="20" y="113" fontSize="8" fill="#3cb88a" opacity="0.65">ឪពុក :</text>
          <text x="54" y="113" fontSize="8.5" fill="#e8f9f4">{student.fatherName || '.....................................'}</text>
          <line x1="17" y1="116" x2="203" y2="116" stroke="#3cb88a" strokeWidth="0.3" opacity="0.2"/>
          <text x="20" y="127" fontSize="8" fill="#3cb88a" opacity="0.65">ម្តាយ :</text>
          <text x="54" y="127" fontSize="8.5" fill="#e8f9f4">{student.motherName || '.....................................'}</text>
          <line x1="17" y1="130" x2="203" y2="130" stroke="#3cb88a" strokeWidth="0.3" opacity="0.2"/>
          <text x="20" y="141" fontSize="8" fill="#3cb88a" opacity="0.65">លេខ :</text>
          <text x="54" y="141" fontSize="8.5" fill="#7de8c4">{student.parentPhone || '.....................................'}</text>
          <line x1="17" y1="144" x2="203" y2="144" stroke="#3cb88a" strokeWidth="0.3" opacity="0.2"/>
          <text x="20" y="155" fontSize="8" fill="#3cb88a" opacity="0.65">ផ្សេងៗ :</text>
          <text x="54" y="155" fontSize="8" fill="#e8f9f4">.....................................</text>

          <circle cx="23" cy="172" r="5" fill="#3cb88a" opacity="0.8"/>
          <text x="23" y="175" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0e1f1a">3</text>
          <text x="33" y="175" fontFamily='"Khmer OS Muol Light", serif' fontSize="9" fontWeight="700" fill="#7de8c4">ទីលំនៅបច្ចុប្បន្ន (Address)</text>
          <line x1="14" y1="180" x2="206" y2="180" stroke="#3cb88a" strokeWidth="0.4" opacity="0.3"/>

          <rect x="14" y="183" width="192" height="18" rx="3" fill="#3cb88a" opacity="0.07"/>
          <rect x="18" y="186" width="3" height="11" rx="1" fill="#3cb88a" opacity="0.7"/>
          <text x="28" y="197" fontSize="9" fontWeight="700" fill="#e8f9f4">{student.currentAddress || '...........................................................'}</text>

          <rect x="14" y="208" width="192" height="66" rx="5" fill="#3cb88a" opacity="0.05"/>
          <rect x="14" y="208" width="192" height="66" rx="5" fill="none" stroke="#3cb88a" strokeWidth="0.8" opacity="0.25"/>
          <circle cx="24" cy="217" r="5" fill="none" stroke="#3cb88a" strokeWidth="1"/>
          <path d="M21,217 L23,219 L27,214" fill="none" stroke="#3cb88a" strokeWidth="1.2"/>
          <text x="34" y="220" fontFamily='"Khmer OS Muol Light", serif' fontSize="8.5" fontWeight="700" fill="#7de8c4">លក្ខខណ្ឌប្រើប្រាស់បណ្ណ</text>
          <line x1="18" y1="224" x2="202" y2="224" stroke="#3cb88a" strokeWidth="0.3" opacity="0.3"/>
          <text x="20" y="234" fontSize="7" fill="#e8f9f4" opacity="0.8">• សិស្សត្រូវពាក់បណ្ណនេះជានិច្ច រៀងរាល់ពេលចូលសាលា</text>
          <text x="20" y="246" fontSize="7" fill="#e8f9f4" opacity="0.8">• បណ្ណនេះមិនអាចផ្ទេរប្រើប្រាស់ដល់ជនទី៣ឡើយ</text>
          <text x="20" y="258" fontSize="7" fill="#e8f9f4" opacity="0.8">• ករណីបាត់ ឬខូច ត្រូវរាយការណ៍ជូនការិយាល័យភ្លាម</text>
          <text x="20" y="270" fontSize="7" fill="#e8f9f4" opacity="0.8">• សិស្សឈប់រៀន ត្រូវត្រឡប់ប័ណ្ណមក ការិយាល័យ</text>

          <line x1="110" y1="280" x2="110" y2="312" stroke="#3cb88a" strokeWidth="0.7" opacity="0.4"/>
          <text x="18" y="288" textAnchor="start" fontSize="6.5" fill="#3cb88a" opacity="0.6">ហត្ថលេខា</text>
          <text x="100" y="308" textAnchor="end" fontSize="6.5" fill="#3cb88a" opacity="0.8">សិស្ស</text>

          <text x="120" y="288" textAnchor="start" fontSize="6.5" fill="#3cb88a" opacity="0.6">ហត្ថលេខា</text>
          <text x="202" y="308" textAnchor="end" fontSize="6.5" fill="#3cb88a" opacity="0.9">{template.principalName}</text>
          
          {template.stamp && <image href={template.stamp} x="122" y="280" width="30" height="30" opacity="0.4" preserveAspectRatio="xMidYMid meet" />}
          {template.signature && <image href={template.signature} x="110" y="286" width="60" height="35" opacity="0.8" preserveAspectRatio="xMidYMid meet" />}

          <rect x="14" y="318" width="192" height="18" rx="4" fill="#1a3d30"/>
          <rect x="14" y="318" width="192" height="18" rx="4" fill="none" stroke="#3cb88a" strokeWidth="0.5" opacity="0.4"/>
          <text x="110" y="330" textAnchor="middle" fontSize="6.5" fill="#7de8c4" opacity="0.85">{template.schoolNameKh} · {student.academicYear || '2024–2025'}</text>
        </g>
      )}

    </svg>
  );
};
