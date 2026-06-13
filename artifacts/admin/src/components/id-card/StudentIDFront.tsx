import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CardProps } from '@/types/student-id';

// ─── Print Design Tokens ───────────────────────────────────────
// Card: 54mm × 86mm @ ~3.78px/mm on screen
// Base unit: 1U = 3.78px ≈ 1mm
// All spacing follows 1mm / 2mm / 3mm / 4mm rhythm
// ──────────────────────────────────────────────────────────────

const S = {
  // Colors
  navy: '#0D1B3D',
  gold: '#F4C430',
  goldDark: '#b48600',
  red: '#E53935',
  textMuted: '#9ca3af',
  textBody: '#374151',
  // Font sizes (px, assume ~3.78px/mm for screen)
  fs: {
    department: 5.2,
    schoolKh: 8.5,
    schoolEn: 4.5,
    slogan: 3.8,
    ribbonKh: 9,
    ribbonEn: 3.8,
    label: 5.5,
    sublabel: 3.5,
    value: 5.5,
    valueId: 6,
    valueSub: 3.8,
    barTitle: 4.5,
    barSub: 3,
    barValue: 5,
  },
} as const;

// ── 2-Column Grid Row (label right-aligned, value left-aligned) ──
interface RowProps {
  label: string;
  sublabel: string;
  children: React.ReactNode;
}
const Row: React.FC<RowProps> = ({ label, sublabel, children }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
    {/* LABEL COL — 13mm fixed, right-aligned */}
    <div style={{
      width: '49px',           // ≈ 13mm
      flexShrink: 0,
      textAlign: 'right',
      paddingRight: '3px',
    }}>
      <div style={{ fontSize: S.fs.label, fontWeight: 700, color: S.navy, lineHeight: 1.55, letterSpacing: '0.005em' }}>
        {label}
      </div>
      <div style={{ fontSize: S.fs.sublabel, fontWeight: 400, color: S.textMuted, lineHeight: 1.3, letterSpacing: '0.01em' }}>
        {sublabel}
      </div>
    </div>
    {/* COLON — 7px fixed, top-aligned with label */}
    <div style={{
      width: '7px',
      flexShrink: 0,
      textAlign: 'center',
      fontSize: S.fs.label,
      color: '#6b7280',
      lineHeight: 1.55,
      paddingTop: '0px',
    }}>
      :
    </div>
    {/* VALUE COL — flex-1, left-aligned */}
    <div style={{ flex: 1, minWidth: 0, paddingLeft: '1px' }}>
      {children}
    </div>
  </div>
);

export const StudentIDFront: React.FC<CardProps> = ({ student, template }) => (
  <div style={{
    position: 'relative',
    width: '100%',
    height: '100%',
    background: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    overflow: 'hidden',
  }}>

    {/* ── Navy Background Block (top portion) ── */}
    <div style={{
      position: 'absolute',
      top: 0, left: 0,
      width: '100%',
      height: '113px',   // ≈ 30mm
      background: S.navy,
      zIndex: 0,
    }} />

    {/* ── School Header ── */}
    <div style={{
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: '6px',
      padding: '9px 8px 0 8px',
    }}>
      {/* Logo */}
      <div style={{
        width: '41px', height: '41px',   // ≈ 11mm
        flexShrink: 0,
        background: 'white',
        borderRadius: '5px',
        padding: '2px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {template.logo
          ? <img src={template.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
          : <div style={{ width: '100%', height: '100%', background: '#e5e7eb', borderRadius: '3px' }} />}
      </div>

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '1.5px' }}>
        <div style={{ fontSize: S.fs.department, fontWeight: 400, color: 'white', lineHeight: 1.55, textAlign: 'center', letterSpacing: '0.01em' }}>
          {template.department}
        </div>
        <div className="font-moul" style={{ fontSize: S.fs.schoolKh, color: 'white', lineHeight: 1.3, textAlign: 'center', letterSpacing: '0.005em' }}>
          {template.schoolNameKh}
        </div>
        <div style={{ fontSize: S.fs.schoolEn, fontWeight: 700, color: 'white', lineHeight: 1.3, textAlign: 'center', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {template.schoolNameEn}
        </div>
        <div style={{ fontSize: S.fs.slogan, fontWeight: 400, color: S.gold, lineHeight: 1.5, textAlign: 'center', fontStyle: 'italic' }}>
          "{template.slogan}"
        </div>
      </div>
    </div>

    {/* ── 3D Ribbon Badge ── */}
    <div style={{ position: 'relative', zIndex: 2, alignSelf: 'center', width: '166px', marginTop: '11px', display: 'flex', justifyContent: 'center' }}>
      {/* Left fold */}
      <div style={{ position: 'absolute', left: '-5px', top: '5px', width: 0, height: 0, borderTop: '11px solid #b48600', borderRight: '7px solid #b48600', borderBottom: '7px solid transparent', borderLeft: '7px solid transparent' }} />
      {/* Right fold */}
      <div style={{ position: 'absolute', right: '-5px', top: '5px', width: 0, height: 0, borderTop: '11px solid #b48600', borderLeft: '7px solid #b48600', borderBottom: '7px solid transparent', borderRight: '7px solid transparent' }} />
      {/* Badge */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', background: S.gold, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4px 0', boxShadow: '0 2px 6px rgba(0,0,0,0.18)' }}>
        <span className="font-moul" style={{ fontSize: S.fs.ribbonKh, color: S.navy, lineHeight: 1.2 }}>
          ប័ណ្ណសម្គាល់សិស្ស
        </span>
        <span style={{ fontSize: S.fs.ribbonEn, fontWeight: 700, color: S.navy, letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1, marginTop: '2px' }}>
          Student ID Card
        </span>
      </div>
    </div>

    {/* ── Photo (centered, gold border) ── */}
    <div style={{
      alignSelf: 'center',
      width: '75px', height: '96px',   // ≈ 20mm × 25.4mm (4:6 ratio)
      marginTop: '8px',
      border: '1.5px solid #F4C430',
      borderRadius: '6px',
      overflow: 'hidden',
      background: '#f9fafb',
      boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
      flexShrink: 0,
    }}>
      {student.photo
        ? <img src={student.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: '7px', fontWeight: 700 }}>4×6</div>}
    </div>

    {/* ── Info + QR Row ── */}
    <div style={{ display: 'flex', alignItems: 'flex-start', padding: '0 7px', marginTop: '8px', gap: '4px', flex: 1 }}>

      {/* Left: 4 data rows */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>

        <Row label="លេខសម្គាល់" sublabel="ID Card No.">
          <span style={{ fontSize: S.fs.valueId, fontWeight: 700, color: S.red, lineHeight: 1.55 }}>
            {student.id}
          </span>
        </Row>

        <Row label="ឈ្មោះសិស្ស" sublabel="Student Name">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span className="font-moul" style={{ fontSize: S.fs.value, color: S.navy, lineHeight: 1.5, display: 'block' }}>
              {student.nameKh}
            </span>
            {student.nameEn && (
              <span style={{ fontSize: S.fs.valueSub, fontWeight: 600, color: '#6b7280', letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.3, display: 'block' }}>
                {student.nameEn}
              </span>
            )}
          </div>
        </Row>

        <Row label="ភេទ" sublabel="Gender">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontSize: S.fs.value, fontWeight: 700, color: S.navy, lineHeight: 1.55, display: 'block' }}>
              {student.gender}
            </span>
            <span style={{ fontSize: S.fs.valueSub, fontWeight: 400, color: '#6b7280', lineHeight: 1.3, display: 'block' }}>
              {student.gender === 'ប្រុស' ? 'Male' : 'Female'}
            </span>
          </div>
        </Row>

        <Row label="ថ្នាក់" sublabel="Grade">
          <span style={{ fontSize: S.fs.value, fontWeight: 700, color: S.navy, lineHeight: 1.55 }}>
            {student.grade}
          </span>
        </Row>

      </div>

      {/* Right: QR Code */}
      <div style={{ width: '49px', height: '49px', flexShrink: 0, background: 'white', marginTop: '2px' }}>
        {student.qrCodeUrl
          ? <img src={student.qrCodeUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
          : <QRCodeSVG value={`${student.id}|${student.nameKh}|${student.grade}`} size={256} style={{ width: '100%', height: '100%' }} />}
      </div>
    </div>

    {/* ── Bottom Navy Bar (absolute, always at bottom) ── */}
    <div style={{
      position: 'absolute',
      bottom: 0, left: 0,
      width: '100%',
      height: '42px',   // ≈ 11mm
      background: S.navy,
      zIndex: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 10px',
    }}>
      {/* Academic Year */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <span style={{ fontSize: S.fs.barTitle, fontWeight: 700, color: 'white', lineHeight: 1.3, letterSpacing: '0.01em' }}>ឆ្នាំសិក្សា</span>
          <span style={{ fontSize: S.fs.barSub, color: '#9ca3af', lineHeight: 1.2, letterSpacing: '0.01em' }}>Academic Year</span>
          <span style={{ fontSize: S.fs.barValue, fontWeight: 700, color: S.gold, lineHeight: 1.3 }}>
            {student.academicYear || '2024 - 2025'}
          </span>
        </div>
      </div>

      {/* Principal Signature */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        <span style={{ fontSize: S.fs.barSub, color: '#9ca3af', lineHeight: 1.2, letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
          ហត្ថលេខា / Principal Signature
        </span>
        <div style={{ width: '53px', height: '19px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {template.signature && (
            <img src={template.signature} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'invert(1) brightness(0)' }} alt="" />
          )}
        </div>
      </div>
    </div>

  </div>
);
