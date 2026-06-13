import React from 'react';
import { CardProps } from '@/types/student-id';
import { QRCodeSVG } from 'qrcode.react';

export const PremiumFrontCard: React.FC<CardProps> = ({ student, template, theme }) => {
  const isMidnight = theme.id === 'midnight';
  const isCrimson = theme.id === 'crimson';
  const isJade = theme.id === 'jade';

  const defaultPhoto = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 95'%3E%3Cpath d='M40,55 C30,55 20,65 10,95 L70,95 C60,65 50,55 40,55 Z M40,50 C50,50 55,40 55,25 C55,10 48,5 40,5 C32,5 25,10 25,25 C25,40 30,50 40,50 Z' fill='%23888' opacity='0.2'/%3E%3C/svg%3E";

  return (
    <svg width="100%" height="100%" viewBox="0 0 220 340" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style={{ fontFamily: '"Battambang", sans-serif' }}>
      <defs>
        <clipPath id="cardClip"><rect x="0" y="0" width="220" height="340" rx="14" /></clipPath>
        <clipPath id="photoClipBox1"><rect x="70" y="150" width="80" height="95" rx="6" /></clipPath>
        <clipPath id="photoClipBox2"><rect x="68" y="153" width="84" height="100" rx="5" /></clipPath>
        <clipPath id="photoClipBox3"><rect x="68" y="153" width="84" height="100" rx="6" /></clipPath>
      </defs>

      {/* ═════════════════ CARD 1: ROYAL MIDNIGHT GOLD ═════════════════ */}
      {isMidnight && (
        <g>
          <rect x="0" y="0" width="220" height="340" rx="14" fill="#0b1a35"/>
          {template.frontBg && <image href={template.frontBg} x="0" y="0" width="220" height="340" preserveAspectRatio="xMidYMid slice" opacity="0.15" clipPath="url(#cardClip)" />}
          <rect x="0" y="0" width="220" height="340" rx="14" fill="none" stroke="#c9a030" strokeWidth="2.5"/>

          {/* kbach corners */}
          <g fill="none" stroke="#c9a030" strokeWidth="1">
            <path d="M14,4 Q8,4 4,8 L4,14" /><path d="M18,4 Q10,4 4,10 L4,18" /><path d="M16,8 Q11,8 8,11 L8,16" />
            <circle cx="14" cy="14" r="3" fill="#c9a030" opacity="0.5" />
            <path d="M4,6 Q6,4 8,5 Q10,6 8,8 Q6,10 8,12" strokeWidth="0.8" /><path d="M6,4 Q8,2 10,3 Q12,5 10,7" strokeWidth="0.8" />
          </g>
          <g fill="none" stroke="#c9a030" strokeWidth="1">
            <path d="M206,4 Q212,4 216,8 L216,14" /><path d="M202,4 Q210,4 216,10 L216,18" /><path d="M204,8 Q209,8 212,11 L212,16" />
            <circle cx="206" cy="14" r="3" fill="#c9a030" opacity="0.5" />
            <path d="M216,6 Q214,4 212,5 Q210,6 212,8 Q214,10 212,12" strokeWidth="0.8" /><path d="M214,4 Q212,2 210,3 Q208,5 210,7" strokeWidth="0.8" />
          </g>
          <g fill="none" stroke="#c9a030" strokeWidth="1">
            <path d="M14,336 Q8,336 4,332 L4,326" /><path d="M18,336 Q10,336 4,330 L4,322" /><path d="M16,332 Q11,332 8,329 L8,324" />
            <circle cx="14" cy="326" r="3" fill="#c9a030" opacity="0.5" />
            <path d="M4,334 Q6,336 8,335 Q10,334 8,332 Q6,330 8,328" strokeWidth="0.8" /><path d="M6,336 Q8,338 10,337 Q12,335 10,333" strokeWidth="0.8" />
          </g>
          <g fill="none" stroke="#c9a030" strokeWidth="1">
            <path d="M206,336 Q212,336 216,332 L216,326" /><path d="M202,336 Q210,336 216,330 L216,322" /><path d="M204,332 Q209,332 212,329 L212,324" />
            <circle cx="206" cy="326" r="3" fill="#c9a030" opacity="0.5" />
            <path d="M216,334 Q214,336 212,335 Q210,334 212,332 Q214,330 212,328" strokeWidth="0.8" /><path d="M214,336 Q212,338 210,337 Q208,335 210,333" strokeWidth="0.8" />
          </g>

          <rect x="8" y="8" width="204" height="22" rx="3" fill="#c9a030" opacity="0.12"/>
          <line x1="8" y1="30" x2="212" y2="30" stroke="#c9a030" strokeWidth="0.5" opacity="0.6"/>
          
          <text x="110" y="24" textAnchor="middle" fontSize="7.5" fill="#c9a030" opacity="0.9">ជាតិ · សាសនា · ព្រះមហាក្សត្រ</text>

          {/* Logo Box */}
          <circle cx="110" cy="62" r="24" fill="#c9a030" opacity="0.15"/>
          <circle cx="110" cy="62" r="24" fill="none" stroke="#c9a030" strokeWidth="1.5"/>
          <circle cx="110" cy="62" r="18" fill="none" stroke="#c9a030" strokeWidth="0.5" opacity="0.5"/>
          {template.logo ? (
            <image href={template.logo} x="86" y="38" width="48" height="48" />
          ) : (
            <g>
              <rect x="101" y="56" width="18" height="14" rx="1" fill="none" stroke="#c9a030" strokeWidth="1.2"/>
              <polygon points="110,46 104,56 116,56" fill="#c9a030" opacity="0.7"/>
              <polygon points="110,49 106,56 114,56" fill="#c9a030" opacity="0.9"/>
            </g>
          )}

          <text x="110" y="97" textAnchor="middle" fontFamily='"Khmer OS Muol Light", serif' fontSize="11" fontWeight="700" fill="#ffffff">{template.schoolNameKh}</text>
          <text x="110" y="106" textAnchor="middle" fontFamily='"Battambang", serif' fontSize="5.5" fill="#c9a030" opacity="0.9">{template.slogan}</text>
          <text x="110" y="114" textAnchor="middle" fontSize="6.5" fill="#c9a030" letterSpacing="1">{template.schoolNameEn}</text>

          <line x1="22" y1="120" x2="88" y2="120" stroke="#c9a030" strokeWidth="0.8"/>
          <circle cx="18" cy="120" r="2.5" fill="#c9a030"/>
          <circle cx="110" cy="120" r="3.5" fill="#c9a030" opacity="0.6"/>
          <circle cx="202" cy="120" r="2.5" fill="#c9a030"/>
          <line x1="132" y1="120" x2="198" y2="120" stroke="#c9a030" strokeWidth="0.8"/>

          <rect x="62" y="126" width="96" height="16" rx="8" fill="#c9a030"/>
          <text x="110" y="137" textAnchor="middle" fontFamily='"Khmer OS Muol Light", serif' fontSize="8" fontWeight="700" fill="#0b1a35">សន្លឹកសម្គាល់សិស្ស</text>

          <rect x="70" y="150" width="80" height="95" rx="6" fill="#162340"/>
          <image href={student.photo || defaultPhoto} x="70" y="150" width="80" height="95" preserveAspectRatio="xMidYMid slice" clipPath="url(#photoClipBox1)" />
          <rect x="70" y="150" width="80" height="95" rx="6" fill="none" stroke="#c9a030" strokeWidth="1.5"/>

          <text x="20" y="267" fontSize="7.5" fill="#c9a030" opacity="0.7">ឈ្មោះ</text>
          <text x="56" y="267" fontFamily='"Khmer OS Muol Light", serif' fontSize="8" fontWeight="700" fill="#ffffff">{student.nameKh}</text>
          <line x1="18" y1="271" x2="202" y2="271" stroke="#c9a030" strokeWidth="0.3" opacity="0.4"/>

          <text x="20" y="281" fontSize="7.5" fill="#c9a030" opacity="0.7">ថ្នាក់</text>
          <text x="56" y="281" fontSize="8" fontWeight="700" fill="#ffffff">{student.grade}</text>
          <line x1="18" y1="285" x2="202" y2="285" stroke="#c9a030" strokeWidth="0.3" opacity="0.4"/>

          <text x="20" y="295" fontSize="7.5" fill="#c9a030" opacity="0.7">លេខសម្គាល់</text>
          <text x="72" y="295" fontSize="8" fontWeight="700" fill="#c9a030">{student.id}</text>
          
          <text x="202" y="299" textAnchor="end" fontFamily='"Khmer OS Muol Light", serif' fontSize="4" fill="#c9a030" opacity="0.9">{template.department}</text>
          <text x="202" y="306" textAnchor="end" fontSize="4" fill="#c9a030" opacity="0.8">{template.khmerDate}</text>
          <text x="202" y="312" textAnchor="end" fontSize="4.5" fill="#c9a030" opacity="0.8">ធ្វើនៅ{template.issueLocation} ថ្ងៃទី{template.issueDate}</text>

          <rect x="8" y="320" width="204" height="14" rx="2" fill="#c9a030" opacity="0.12"/>
          <line x1="8" y1="320" x2="212" y2="320" stroke="#c9a030" strokeWidth="0.5" opacity="0.6"/>
          <text x="110" y="330" textAnchor="middle" fontSize="6" fill="#c9a030" opacity="0.6">{student.academicYear || '2024 – 2025'}</text>
        </g>
      )}

      {/* ═════════════════ CARD 2: ANGKOR CRIMSON IVORY ═════════════════ */}
      {isCrimson && (
        <g>
          <rect x="0" y="0" width="220" height="340" rx="14" fill="#f9f3e8"/>
          {template.frontBg && <image href={template.frontBg} x="0" y="0" width="220" height="340" preserveAspectRatio="xMidYMid slice" opacity="0.15" clipPath="url(#cardClip)" />}
          <rect x="0" y="0" width="220" height="340" rx="14" fill="none" stroke="#8b1c1c" strokeWidth="2.5"/>
          <rect x="7" y="7" width="206" height="326" rx="11" fill="none" stroke="#c9a030" strokeWidth="0.8" opacity="0.6"/>

          <g fill="none" stroke="#8b1c1c" strokeWidth="1.2">
            <path d="M15,7 Q7,7 7,15 L7,28"/><path d="M18,7 Q7,7 7,18"/><path d="M12,10 Q8,10 8,14 L8,20"/>
            <path d="M9,12 Q12,8 16,9 Q19,11 16,14 Q13,17 16,20 Q19,23 17,26" strokeWidth="0.9"/>
            <circle cx="16" cy="16" r="2.5" fill="#8b1c1c" opacity="0.3"/>
          </g>
          <g fill="none" stroke="#8b1c1c" strokeWidth="1.2">
            <path d="M205,7 Q213,7 213,15 L213,28"/><path d="M202,7 Q213,7 213,18"/><path d="M208,10 Q212,10 212,14 L212,20"/>
            <path d="M211,12 Q208,8 204,9 Q201,11 204,14 Q207,17 204,20 Q201,23 203,26" strokeWidth="0.9"/>
            <circle cx="204" cy="16" r="2.5" fill="#8b1c1c" opacity="0.3"/>
          </g>
          <g fill="none" stroke="#8b1c1c" strokeWidth="1.2">
            <path d="M15,333 Q7,333 7,325 L7,312"/><path d="M18,333 Q7,333 7,322"/>
            <path d="M9,328 Q12,332 16,331 Q19,329 16,326 Q13,323 16,320 Q19,317 17,314" strokeWidth="0.9"/>
            <circle cx="16" cy="324" r="2.5" fill="#8b1c1c" opacity="0.3"/>
          </g>
          <g fill="none" stroke="#8b1c1c" strokeWidth="1.2">
            <path d="M205,333 Q213,333 213,325 L213,312"/><path d="M211,328 Q208,332 204,331 Q201,329 204,326 Q207,323 204,320 Q201,317 203,314" strokeWidth="0.9"/>
            <circle cx="204" cy="324" r="2.5" fill="#8b1c1c" opacity="0.3"/>
          </g>

          <rect x="15" y="15" width="190" height="30" rx="3" fill="#8b1c1c"/>
          <text x="110" y="24" textAnchor="middle" fontSize="7" fill="#f9d980">ជាតិ · សាសនា · ព្រះមហាក្សត្រ</text>
          <text x="110" y="36" textAnchor="middle" fontFamily='"Khmer OS Muol Light", serif' fontSize="8" fontWeight="700" fill="#ffffff">{template.schoolNameKh}</text>

          <circle cx="110" cy="78" r="22" fill="#8b1c1c" opacity="0.1"/>
          <circle cx="110" cy="78" r="22" fill="none" stroke="#8b1c1c" strokeWidth="1.5"/>
          <circle cx="110" cy="78" r="17" fill="none" stroke="#c9a030" strokeWidth="0.6" opacity="0.5"/>
          {template.logo ? (
            <image href={template.logo} x="90" y="58" width="40" height="40" />
          ) : (
            <g>
              <rect x="102" y="72" width="16" height="12" rx="1" fill="none" stroke="#8b1c1c" strokeWidth="1.2"/>
              <polygon points="110,63 105,72 115,72" fill="#8b1c1c" opacity="0.6"/>
              <polygon points="110,65 107,72 113,72" fill="#8b1c1c" opacity="0.85"/>
            </g>
          )}

          <text x="110" y="108" textAnchor="middle" fontFamily='"Battambang", serif' fontSize="5.5" fill="#8b1c1c" opacity="0.9">{template.slogan}</text>
          <text x="110" y="116" textAnchor="middle" fontSize="6.5" fill="#8b1c1c" letterSpacing="0.8">{template.schoolNameEn}</text>

          <line x1="20" y1="120" x2="96" y2="120" stroke="#c9a030" strokeWidth="0.8"/>
          <polygon points="110,116 114,120 110,124 106,120" fill="#c9a030"/>
          <line x1="124" y1="120" x2="200" y2="120" stroke="#c9a030" strokeWidth="0.8"/>

          <rect x="35" y="128" width="150" height="17" rx="2" fill="none" stroke="#8b1c1c" strokeWidth="1"/>
          <text x="110" y="139.5" textAnchor="middle" fontFamily='"Khmer OS Muol Light", serif' fontSize="8" fontWeight="700" fill="#8b1c1c">សន្លឹកសម្គាល់សិស្ស</text>

          <rect x="68" y="153" width="84" height="100" rx="5" fill="#ede3cf"/>
          <image href={student.photo || defaultPhoto} x="68" y="153" width="84" height="100" preserveAspectRatio="xMidYMid slice" clipPath="url(#photoClipBox2)" />
          <rect x="68" y="153" width="84" height="100" rx="5" fill="none" stroke="#c9a030" strokeWidth="1.5"/>
          
          <g stroke="#8b1c1c" strokeWidth="1" fill="none" opacity="0.5">
            <path d="M68,162 L68,153 L77,153"/><path d="M152,162 L152,153 L143,153"/>
            <path d="M68,244 L68,253 L77,253"/><path d="M152,244 L152,253 L143,253"/>
          </g>

          <text x="22" y="273" fontSize="7.5" fill="#8b1c1c" opacity="0.6">ឈ្មោះ ·</text>
          <text x="58" y="273" fontFamily='"Khmer OS Muol Light", serif' fontSize="8.5" fontWeight="700" fill="#3a0f0f">{student.nameKh}</text>
          <line x1="18" y1="277" x2="202" y2="277" stroke="#c9a030" strokeWidth="0.4" opacity="0.5"/>

          <text x="22" y="287" fontSize="7.5" fill="#8b1c1c" opacity="0.6">ថ្នាក់ ·</text>
          <text x="58" y="287" fontSize="8" fontWeight="700" fill="#3a0f0f">{student.grade}</text>
          <line x1="18" y1="291" x2="202" y2="291" stroke="#c9a030" strokeWidth="0.4" opacity="0.5"/>

          <text x="22" y="300" fontSize="7.5" fill="#8b1c1c" opacity="0.6">លេខ ·</text>
          <text x="58" y="300" fontSize="8" fontWeight="700" fill="#8b1c1c">{student.id}</text>
          
          <text x="202" y="298" textAnchor="end" fontFamily='"Khmer OS Muol Light", serif' fontSize="4" fill="#8b1c1c" opacity="0.9">{template.department}</text>
          <text x="202" y="304" textAnchor="end" fontSize="4" fill="#8b1c1c" opacity="0.8">{template.khmerDate}</text>
          <text x="202" y="309" textAnchor="end" fontSize="4.5" fill="#8b1c1c" opacity="0.8">ធ្វើនៅ{template.issueLocation} ថ្ងៃទី{template.issueDate}</text>

          <rect x="15" y="313" width="190" height="20" rx="3" fill="#8b1c1c"/>
          <text x="110" y="326" textAnchor="middle" fontSize="6" fill="#f9d980" opacity="0.9">ផុតកំណត់ទី{template.expiryDate}</text>
          <rect x="15" y="312" width="190" height="1" fill="#c9a030" opacity="0.5"/>
        </g>
      )}

      {/* ═════════════════ CARD 3: DARK JADE & LOTUS ═════════════════ */}
      {isJade && (
        <g>
          <rect x="0" y="0" width="220" height="340" rx="14" fill="#0e1f1a"/>
          {template.frontBg && <image href={template.frontBg} x="0" y="0" width="220" height="340" preserveAspectRatio="xMidYMid slice" opacity="0.15" clipPath="url(#cardClip)" />}
          <rect x="0" y="0" width="220" height="340" rx="14" fill="none" stroke="#3cb88a" strokeWidth="2"/>
          <rect x="6" y="6" width="208" height="328" rx="11" fill="none" stroke="#3cb88a" strokeWidth="0.4" opacity="0.3"/>

          <g fill="none" stroke="#3cb88a" strokeWidth="1" opacity="0.7">
            <path d="M6,22 Q6,6 22,6"/><path d="M6,30 Q6,6 30,6"/><path d="M10,20 Q10,10 20,10"/>
            <path d="M8,16 Q14,12 12,18 Q10,24 16,22 Q22,20 20,26" strokeWidth="0.8"/>
            <circle cx="18" cy="18" r="2" fill="#3cb88a" opacity="0.4"/>
          </g>
          <g fill="none" stroke="#3cb88a" strokeWidth="1" opacity="0.7">
            <path d="M214,22 Q214,6 198,6"/><path d="M214,30 Q214,6 190,6"/><path d="M210,20 Q210,10 200,10"/>
            <path d="M212,16 Q206,12 208,18 Q210,24 204,22 Q198,20 200,26" strokeWidth="0.8"/>
            <circle cx="202" cy="18" r="2" fill="#3cb88a" opacity="0.4"/>
          </g>
          <g fill="none" stroke="#3cb88a" strokeWidth="1" opacity="0.7">
            <path d="M6,318 Q6,334 22,334"/><path d="M6,310 Q6,334 30,334"/>
            <path d="M8,324 Q14,328 12,322 Q10,316 16,318 Q22,320 20,314" strokeWidth="0.8"/>
            <circle cx="18" cy="322" r="2" fill="#3cb88a" opacity="0.4"/>
          </g>
          <g fill="none" stroke="#3cb88a" strokeWidth="1" opacity="0.7">
            <path d="M214,318 Q214,334 198,334"/><path d="M214,310 Q214,334 190,334"/>
            <path d="M212,324 Q206,328 208,322 Q210,316 204,318 Q198,320 200,314" strokeWidth="0.8"/>
            <circle cx="202" cy="322" r="2" fill="#3cb88a" opacity="0.4"/>
          </g>

          <rect x="14" y="14" width="192" height="28" rx="4" fill="#1a3d30"/>
          <rect x="14" y="14" width="192" height="28" rx="4" fill="none" stroke="#3cb88a" strokeWidth="0.8" opacity="0.5"/>
          <text x="110" y="24" textAnchor="middle" fontSize="7" fill="#7de8c4">ជាតិ · សាសនា · ព្រះមហាក្សត្រ</text>
          <text x="110" y="34" textAnchor="middle" fontFamily='"Khmer OS Muol Light", serif' fontSize="8.5" fontWeight="700" fill="#ffffff">{template.schoolNameKh}</text>
          <text x="110" y="49" textAnchor="middle" fontFamily='"Battambang", serif' fontSize="5.5" fill="#3cb88a" opacity="0.9">{template.slogan}</text>
          <text x="110" y="58" textAnchor="middle" fontSize="6" fill="#3cb88a" letterSpacing="0.8">{template.schoolNameEn}</text>

          <circle cx="110" cy="88" r="25" fill="#1a3d30"/>
          <circle cx="110" cy="88" r="25" fill="none" stroke="#3cb88a" strokeWidth="1.5"/>
          <circle cx="110" cy="88" r="20" fill="none" stroke="#3cb88a" strokeWidth="0.5" opacity="0.4"/>
          {template.logo ? (
            <image href={template.logo} x="90" y="68" width="40" height="40" />
          ) : (
            <circle cx="110" cy="88" r="7" fill="#3cb88a" opacity="0.5"/>
          )}

          <g fill="none" stroke="#3cb88a" strokeWidth="0.8" opacity="0.5">
            <line x1="20" y1="120" x2="85" y2="120"/>
            <path d="M88,116 Q94,120 88,124 Q82,120 88,116"/>
            <line x1="91" y1="120" x2="129" y2="120"/>
            <path d="M132,116 Q138,120 132,124 Q126,120 132,116"/>
            <line x1="135" y1="120" x2="200" y2="120"/>
          </g>

          <rect x="50" y="128" width="120" height="16" rx="8" fill="#1a3d30" stroke="#3cb88a" strokeWidth="1"/>
          <text x="110" y="139" textAnchor="middle" fontFamily='"Khmer OS Muol Light", serif' fontSize="8" fill="#7de8c4">សន្លឹកសម្គាល់សិស្ស</text>

          <rect x="68" y="153" width="84" height="100" rx="6" fill="#162e25"/>
          <image href={student.photo || defaultPhoto} x="68" y="153" width="84" height="100" preserveAspectRatio="xMidYMid slice" clipPath="url(#photoClipBox3)" />
          <rect x="68" y="153" width="84" height="100" rx="6" fill="none" stroke="#3cb88a" strokeWidth="1.5"/>
          
          <g fill="#3cb88a" opacity="0.5">
            <polygon points="68,158 72,153 76,158 72,163"/>
            <polygon points="152,158 148,153 144,158 148,163"/>
            <polygon points="68,248 72,253 76,248 72,243"/>
            <polygon points="152,248 148,253 144,248 148,243"/>
          </g>

          <text x="20" y="273" fontSize="7.5" fill="#3cb88a" opacity="0.65">ឈ្មោះ ·</text>
          <text x="56" y="273" fontFamily='"Khmer OS Muol Light", serif' fontSize="8.5" fontWeight="700" fill="#e8f9f4">{student.nameKh}</text>
          <line x1="18" y1="277" x2="202" y2="277" stroke="#3cb88a" strokeWidth="0.3" opacity="0.3"/>

          <text x="20" y="287" fontSize="7.5" fill="#3cb88a" opacity="0.65">ថ្នាក់ ·</text>
          <text x="56" y="287" fontSize="8" fontWeight="700" fill="#e8f9f4">{student.grade}</text>
          <line x1="18" y1="291" x2="202" y2="291" stroke="#3cb88a" strokeWidth="0.3" opacity="0.3"/>

          <text x="20" y="300" fontSize="7.5" fill="#3cb88a" opacity="0.65">លេខ ·</text>
          <text x="56" y="300" fontSize="8" fontWeight="700" fill="#7de8c4">{student.id}</text>
          
          <text x="202" y="298" textAnchor="end" fontFamily='"Khmer OS Muol Light", serif' fontSize="4" fill="#3cb88a" opacity="0.9">{template.department}</text>
          <text x="202" y="304" textAnchor="end" fontSize="4" fill="#3cb88a" opacity="0.8">{template.khmerDate}</text>
          <text x="202" y="310" textAnchor="end" fontSize="4.5" fill="#3cb88a" opacity="0.8">ធ្វើនៅ{template.issueLocation} ថ្ងៃទី{template.issueDate}</text>

          <rect x="14" y="316" width="192" height="18" rx="4" fill="#1a3d30"/>
          <rect x="14" y="316" width="192" height="18" rx="4" fill="none" stroke="#3cb88a" strokeWidth="0.5" opacity="0.4"/>
          <text x="110" y="328" textAnchor="middle" fontSize="6" fill="#7de8c4" opacity="0.8">ផុតកំណត់ទី{template.expiryDate}</text>
        </g>
      )}

    </svg>
  );
};
