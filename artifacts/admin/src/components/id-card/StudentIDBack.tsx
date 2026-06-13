import React from 'react';
import { MapPin, User, ShieldCheck, Phone, Globe } from 'lucide-react';
import { CardProps } from '@/types/student-id';

// ─── Design tokens (same as front card) ───────────────────────
const S = {
  navy: '#0D1B3D',
  gold: '#F4C430',
  red: '#E53935',
  textMuted: '#9ca3af',
  // Column widths (px ≈ mm × 3.78)
  iconCol: 15,      // 4mm — icon circle
  labelCol: 56,     // ≈ 15mm — label text, right-aligned
  colonCol: 8,      // colon separator
  subLabelCol: 30,  // for sub-rows (Name / Phone)
} as const;

// ─── InfoRow — icon + label right-aligned + value left-aligned ─
const InfoRow: React.FC<{
  icon: React.ReactNode;
  khLabel: string;
  enLabel: string;
  children: React.ReactNode;
  iconBg?: string;
}> = ({ icon, khLabel, enLabel, children, iconBg = S.navy }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: '0' }}>
    {/* Icon circle */}
    <div style={{
      width: S.iconCol, height: S.iconCol,
      background: iconBg,
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      marginTop: '1px',
    }}>
      {icon}
    </div>
    {/* Gap between icon and label */}
    <div style={{ width: '4px', flexShrink: 0 }} />
    {/* Label — right-aligned, fixed width */}
    <div style={{ width: S.labelCol, flexShrink: 0, textAlign: 'right' }}>
      <div style={{ fontSize: '5.5px', fontWeight: 700, color: S.navy, lineHeight: 1.6, letterSpacing: '0.005em' }}>
        {khLabel}
      </div>
      <div style={{ fontSize: '3.5px', fontWeight: 400, color: S.textMuted, lineHeight: 1.3, letterSpacing: '0.01em' }}>
        {enLabel}
      </div>
    </div>
    {/* Colon */}
    <div style={{ width: S.colonCol, flexShrink: 0, textAlign: 'center', fontSize: '5px', color: '#6b7280', lineHeight: 1.6, paddingTop: '0.5px' }}>:</div>
    {/* Value */}
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

// ─── Sub-row for nested data (Guardian Name / Phone) ──────────
const SubRow: React.FC<{ khLabel: string; enLabel: string; children: React.ReactNode }> = ({ khLabel, enLabel, children }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
    {/* Fixed label col aligned to parent colon position */}
    <div style={{ width: S.subLabelCol, flexShrink: 0, textAlign: 'right', paddingRight: '2px' }}>
      <div style={{ fontSize: '5px', fontWeight: 700, color: S.navy, lineHeight: 1.5 }}>{khLabel}</div>
      <div style={{ fontSize: '3.2px', fontWeight: 400, color: S.textMuted, lineHeight: 1.2 }}>{enLabel}</div>
    </div>
    {/* Colon */}
    <div style={{ width: '7px', flexShrink: 0, textAlign: 'center', fontSize: '4.5px', color: '#6b7280', lineHeight: 1.5 }}>:</div>
    {/* Value */}
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

export const StudentIDBack: React.FC<CardProps> = ({ student, template }) => (
  <div style={{
    position: 'relative',
    width: '100%', height: '100%',
    background: 'white',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden', color: S.navy,
  }}>

    {/* ── Main Content ── paddingBottom reserves space for bottom bar */}
    <div style={{
      flex: 1,
      display: 'flex', flexDirection: 'column',
      padding: '7px',
      paddingBottom: '32px',  // ≈ 8.5mm — clears bottom bar
      gap: '5px',
      overflow: 'hidden',
    }}>

      {/* 1. Place of Birth */}
      <InfoRow
        icon={<MapPin size={7} style={{ color: 'white' }} strokeWidth={2.5} />}
        khLabel="ទីកន្លែងកំណើត"
        enLabel="Place of Birth"
      >
        <span style={{ fontSize: '5.5px', fontWeight: 600, color: S.navy, lineHeight: 1.6, display: 'block' }}>
          {student.birthPlace}
        </span>
      </InfoRow>

      {/* 2. Guardian Information */}
      <InfoRow
        icon={<User size={8} style={{ color: 'white' }} strokeWidth={2.5} />}
        khLabel="ព័ត៌មានមាតាបិតា អាណាព្យាបាល"
        enLabel="Guardian Information"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <SubRow khLabel="ឈ្មោះ" enLabel="Name">
            <span style={{ fontSize: '5.5px', fontWeight: 600, color: S.navy, lineHeight: 1.5, display: 'block' }}>
              {student.fatherName || student.motherName || '—'}
            </span>
          </SubRow>
          <SubRow khLabel="ទូរស័ព្ទ" enLabel="Phone">
            <span style={{ fontSize: '5.5px', fontWeight: 700, color: S.navy, lineHeight: 1.5, whiteSpace: 'nowrap', display: 'block' }}>
              {student.parentPhone}
            </span>
          </SubRow>
        </div>
      </InfoRow>

      {/* 3. Address */}
      <InfoRow
        icon={
          <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        }
        khLabel="អាសយដ្ឋាន"
        enLabel="Address"
      >
        <span style={{
          fontSize: '5px', fontWeight: 600, color: S.navy, lineHeight: 1.6,
          overflow: 'hidden',
          ...({
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          } as React.CSSProperties),
        }}>
          {student.currentAddress}
        </span>
      </InfoRow>

      {/* 4. Terms & Conditions Box */}
      <div style={{
        border: '1.2px solid rgba(13,27,61,0.55)',
        borderRadius: '6px',
        padding: '5px 6px',
        display: 'flex', flexDirection: 'column', gap: '4px',
        background: 'white',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={9} style={{ color: S.navy, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '6px', fontWeight: 700, color: S.navy, lineHeight: 1.4, letterSpacing: '0.01em' }}>
              លក្ខខណ្ឌប្រើប្រាស់
            </div>
            <div style={{ fontSize: '3.5px', fontWeight: 400, color: S.textMuted, lineHeight: 1.2, letterSpacing: '0.01em' }}>
              Terms &amp; Conditions
            </div>
          </div>
        </div>

        {/* Khmer bullets — 7px gap between items */}
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            'ប័ណ្ណនេះជាកម្មសិទ្ធិរបស់សាលា',
            'មិនអាចផ្ទេរទៅអ្នកដទៃបាន',
            'បើបាត់សូមប្រគល់ជូនសាលាវិញ',
          ].map(t => (
            <li key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
              <span style={{ color: S.gold, fontSize: '8px', lineHeight: '6px', flexShrink: 0, marginTop: '0.5px' }}>•</span>
              <span style={{ fontSize: '5px', fontWeight: 500, color: S.navy, lineHeight: 1.6 }}>{t}</span>
            </li>
          ))}
        </ul>

        {/* English bullets — 5px gap between items */}
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            'This card is the property of the school.',
            'This card is non-transferable.',
            'If found, please return to the school office.',
          ].map(t => (
            <li key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
              <span style={{ color: S.navy, fontSize: '6px', lineHeight: '5px', flexShrink: 0, marginTop: '0.5px' }}>•</span>
              <span style={{ fontSize: '4px', fontWeight: 400, color: '#6b7280', lineHeight: 1.5 }}>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 5. Emergency Contact — matches InfoRow column widths */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
        {/* Icon */}
        <div style={{
          width: S.iconCol, height: S.iconCol,
          background: S.red,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Phone size={7} style={{ color: 'white' }} fill="white" />
        </div>
        <div style={{ width: '4px', flexShrink: 0 }} />
        {/* Label — same width as InfoRow label col */}
        <div style={{ width: S.labelCol, flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: '5.5px', fontWeight: 700, color: S.navy, lineHeight: 1.5 }}>ទូរស័ព្ទបន្ទាន់</div>
          <div style={{ fontSize: '3.5px', fontWeight: 400, color: S.textMuted, lineHeight: 1.2 }}>Emergency Contact</div>
        </div>
        {/* Colon */}
        <div style={{ width: S.colonCol, flexShrink: 0, textAlign: 'center', fontSize: '5px', color: '#6b7280', lineHeight: 1.5 }}>:</div>
        {/* Value — never wraps */}
        <span style={{ fontSize: '7px', fontWeight: 700, color: S.red, whiteSpace: 'nowrap', lineHeight: 1.3, letterSpacing: '0.02em' }}>
          023 987 654
        </span>
      </div>

      {/* 6. Slogan divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
        <div style={{ flex: 1, height: '0.5px', background: 'linear-gradient(to right, transparent, #F4C430)' }} />
        <div style={{ width: '4px', height: '4px', background: S.gold, transform: 'rotate(45deg)', flexShrink: 0 }} />
        <span style={{
          fontSize: '4px', fontWeight: 700, color: S.gold,
          fontStyle: 'italic', whiteSpace: 'nowrap',
          padding: '0 2px', lineHeight: 1.5,
        }}>
          "{template.slogan}"
        </span>
        <div style={{ width: '4px', height: '4px', background: S.gold, transform: 'rotate(45deg)', flexShrink: 0 }} />
        <div style={{ flex: 1, height: '0.5px', background: 'linear-gradient(to left, transparent, #F4C430)' }} />
      </div>

    </div>

    {/* ── Bottom Bar (absolute, always visible) ── */}
    <div style={{
      position: 'absolute',
      bottom: 0, left: 0,
      width: '100%',
      height: '30px',   // ≈ 8mm
      background: S.navy,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '5px', zIndex: 10,
    }}>
      <Globe size={8} style={{ color: S.gold, flexShrink: 0 }} />
      <span style={{ fontSize: '4.5px', fontWeight: 500, color: 'white', letterSpacing: '0.03em', lineHeight: 1 }}>
        www.phlovmeas.edu.kh
      </span>
    </div>

  </div>
);
