// ─────────────────────────────────────────────────────────────────
// Template Editor Types
// Card coordinate system: mm units (54mm × 86mm)
// ─────────────────────────────────────────────────────────────────

export type ElementType = 'text' | 'image' | 'qrcode' | 'divider';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;        // mm from card left edge
  y: number;        // mm from card top edge
  width: number;    // mm
  height: number;   // mm
  visible: boolean;
  locked: boolean;
  zIndex: number;
}

// ── Text Element ──────────────────────────────────────────────────
export interface TextElement extends BaseElement {
  type: 'text';
  /** Static text OR token like {{student.nameKh}} */
  content: string;
  /** Data key that auto-fills `content` at runtime */
  dataKey?: string;
  fontFamily: 'khmer' | 'moul' | 'sans' | 'bold';
  fontSize: number;          // px at screen resolution
  fontWeight: 400 | 500 | 600 | 700;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;        // e.g. 1.6
  letterSpacing: number;     // em units, e.g. 0.02
  italic: boolean;
}

// ── Image Element ─────────────────────────────────────────────────
export interface ImageElement extends BaseElement {
  type: 'image';
  /** Static URL or left empty when dataKey is set */
  src: string;
  /** Data key e.g. "student.photo" or "template.logo" */
  dataKey?: string;
  objectFit: 'cover' | 'contain';
  borderRadius: number;      // px
  borderColor: string;
  borderWidth: number;       // px
  shadow: boolean;
}

// ── QR Code Element ───────────────────────────────────────────────
export interface QRElement extends BaseElement {
  type: 'qrcode';
  /** Token e.g. "student.id" */
  dataKey: string;
  fgColor: string;
  bgColor: string;
}

// ── Divider Element ───────────────────────────────────────────────
export interface DividerElement extends BaseElement {
  type: 'divider';
  orientation: 'horizontal' | 'vertical';
  color: string;
  thickness: number;         // px
  style: 'solid' | 'dashed' | 'dotted';
}

export type CardElement = TextElement | ImageElement | QRElement | DividerElement;

// ── Card Side ─────────────────────────────────────────────────────
export interface CardSide {
  background: string;
  elements: CardElement[];
}

// ── Full Template Schema ──────────────────────────────────────────
export interface TemplateSchema {
  id: string;
  name: string;
  version: '1.0';
  front: CardSide;
  back: CardSide;
  meta: {
    createdAt: string;
    updatedAt: string;
    author: string;
  };
}

// ── Available Data Tokens ─────────────────────────────────────────
export const DATA_TOKENS: { token: string; label: string; group: string }[] = [
  // Student
  { token: '{{student.id}}',            label: 'Student ID',        group: 'Student' },
  { token: '{{student.nameKh}}',        label: 'Name (Khmer)',       group: 'Student' },
  { token: '{{student.nameEn}}',        label: 'Name (English)',     group: 'Student' },
  { token: '{{student.gender}}',        label: 'Gender',             group: 'Student' },
  { token: '{{student.dob}}',           label: 'Date of Birth',      group: 'Student' },
  { token: '{{student.grade}}',         label: 'Grade',              group: 'Student' },
  { token: '{{student.academicYear}}',  label: 'Academic Year',      group: 'Student' },
  { token: '{{student.phone}}',         label: 'Phone',              group: 'Student' },
  { token: '{{student.birthPlace}}',    label: 'Place of Birth',     group: 'Student' },
  { token: '{{student.fatherName}}',    label: "Father's Name",      group: 'Student' },
  { token: '{{student.motherName}}',    label: "Mother's Name",      group: 'Student' },
  { token: '{{student.parentPhone}}',   label: 'Parent Phone',       group: 'Student' },
  { token: '{{student.currentAddress}}',label: 'Address',            group: 'Student' },
  { token: '{{student.photo}}',         label: 'Photo URL',          group: 'Student' },
  // School / Template
  { token: '{{template.department}}',   label: 'Department',         group: 'School' },
  { token: '{{template.schoolNameKh}}', label: 'School Name (KH)',   group: 'School' },
  { token: '{{template.schoolNameEn}}', label: 'School Name (EN)',   group: 'School' },
  { token: '{{template.slogan}}',       label: 'Slogan',             group: 'School' },
  { token: '{{template.principalName}}',label: 'Principal Name',     group: 'School' },
  { token: '{{template.logo}}',         label: 'School Logo URL',    group: 'School' },
  { token: '{{template.issueDate}}',    label: 'Issue Date',         group: 'School' },
  { token: '{{template.expiryDate}}',   label: 'Expiry Date',        group: 'School' },
];

// ── Default element factories ─────────────────────────────────────
let _idCounter = 1;
const uid = () => `el_${Date.now()}_${_idCounter++}`;

export const makeTextElement = (x = 5, y = 5): TextElement => ({
  id: uid(), type: 'text', x, y, width: 30, height: 8,
  visible: true, locked: false, zIndex: 1,
  content: 'New Text', dataKey: undefined,
  fontFamily: 'sans', fontSize: 6, fontWeight: 600,
  color: '#0D1B3D', textAlign: 'left', lineHeight: 1.6,
  letterSpacing: 0, italic: false,
});

export const makeImageElement = (x = 5, y = 5): ImageElement => ({
  id: uid(), type: 'image', x, y, width: 15, height: 20,
  visible: true, locked: false, zIndex: 1,
  src: '', dataKey: undefined, objectFit: 'cover',
  borderRadius: 4, borderColor: '#F4C430', borderWidth: 1.5, shadow: true,
});

export const makeQRElement = (x = 5, y = 5): QRElement => ({
  id: uid(), type: 'qrcode', x, y, width: 12, height: 12,
  visible: true, locked: false, zIndex: 1,
  dataKey: 'student.id', fgColor: '#000000', bgColor: '#ffffff',
});

export const makeDividerElement = (x = 2, y = 5): DividerElement => ({
  id: uid(), type: 'divider', x, y, width: 50, height: 0.5,
  visible: true, locked: false, zIndex: 1,
  orientation: 'horizontal', color: '#F4C430', thickness: 1, style: 'solid',
});
