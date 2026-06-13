import React from 'react';
import { useEditorStore, useSelectedElement } from '@/store/editor-store';
import { TextElement, ImageElement, QRElement, DividerElement, DATA_TOKENS } from '@/types/student-id-editor';
import { Trash2, Copy, Lock, Unlock, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';

// ─── Reusable field components ────────────────────────────────
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
    <label style={{ fontSize: '9px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {label}
    </label>
    {children}
  </div>
);

const NumInput: React.FC<{
  value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; unit?: string;
}> = ({ value, onChange, min, max, step = 0.5, unit }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
    <input
      type="number"
      value={Math.round(value * 100) / 100}
      min={min} max={max} step={step}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      style={{ flex: 1, fontSize: '11px', padding: '3px 5px', border: '1px solid #e5e7eb', borderRadius: '4px', width: '100%' }}
    />
    {unit && <span style={{ fontSize: '9px', color: '#9ca3af', flexShrink: 0 }}>{unit}</span>}
  </div>
);

const TextInput: React.FC<{
  value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean;
}> = ({ value, onChange, placeholder, mono }) => (
  <input
    type="text"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      fontSize: '11px', padding: '3px 6px',
      border: '1px solid #e5e7eb', borderRadius: '4px', width: '100%',
      fontFamily: mono ? 'monospace' : 'inherit',
    }}
  />
);

const SelectInput: React.FC<{
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{ fontSize: '11px', padding: '3px 5px', border: '1px solid #e5e7eb', borderRadius: '4px', width: '100%', background: 'white' }}
  >
    {options.map(o => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

const Row2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>{children}</div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: '10px', fontWeight: 700, color: '#374151', marginTop: '10px', marginBottom: '4px', paddingBottom: '3px', borderBottom: '1px solid #f3f4f6' }}>
    {children}
  </div>
);

// ─── Token picker ─────────────────────────────────────────────
const TokenPicker: React.FC<{ value: string | undefined; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const groups = ['Student', 'School'];
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      style={{ fontSize: '10px', padding: '3px 5px', border: '1px solid #e5e7eb', borderRadius: '4px', width: '100%', background: 'white' }}
    >
      <option value="">— None (use static text) —</option>
      {groups.map(g => (
        <optgroup key={g} label={g}>
          {DATA_TOKENS.filter(t => t.group === g).map(t => (
            <option key={t.token} value={t.token.replace(/[{}]/g, '').trim()}>{t.label}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
};

// ─── Main Properties Panel ────────────────────────────────────
export const PropertiesPanel: React.FC = () => {
  const el = useSelectedElement();
  const { updateElement, deleteElement, duplicateElement, bringForward, sendBackward } = useEditorStore(s => ({
    updateElement: s.updateElement,
    deleteElement: s.deleteElement,
    duplicateElement: s.duplicateElement,
    bringForward: s.bringForward,
    sendBackward: s.sendBackward,
  }));

  const up = (patch: Record<string, unknown>) => el && updateElement(el.id, patch as any);

  if (!el) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#d1d5db', gap: '6px', textAlign: 'center' }}>
        <span style={{ fontSize: '24px' }}>↖</span>
        <span style={{ fontSize: '10px', fontWeight: 600 }}>Click an element<br/>to edit its properties</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>

      {/* ── Top toolbar ── */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {/* Element type badge */}
        <span style={{
          fontSize: '9px', fontWeight: 700, padding: '2px 7px',
          background: '#eff6ff', color: '#3b82f6', borderRadius: '4px',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          marginRight: 'auto',
        }}>
          {el.type}
        </span>
        <ActionBtn icon={<ChevronUp size={12} />} title="Bring Forward" onClick={() => bringForward(el.id)} />
        <ActionBtn icon={<ChevronDown size={12} />} title="Send Backward" onClick={() => sendBackward(el.id)} />
        <ActionBtn icon={<Copy size={12} />} title="Duplicate" onClick={() => duplicateElement(el.id)} />
        <ActionBtn
          icon={el.visible ? <Eye size={12} /> : <EyeOff size={12} />}
          title={el.visible ? 'Hide' : 'Show'}
          onClick={() => up({ visible: !el.visible })}
        />
        <ActionBtn
          icon={el.locked ? <Lock size={12} /> : <Unlock size={12} />}
          title={el.locked ? 'Unlock' : 'Lock'}
          onClick={() => up({ locked: !el.locked })}
        />
        <ActionBtn
          icon={<Trash2 size={12} />}
          title="Delete"
          onClick={() => deleteElement(el.id)}
          danger
        />
      </div>

      {/* ── Position & Size ── */}
      <SectionTitle>📐 Position &amp; Size</SectionTitle>
      <Row2>
        <Field label="X (mm)"><NumInput value={el.x} onChange={v => up({ x: v })} min={0} max={54} /></Field>
        <Field label="Y (mm)"><NumInput value={el.y} onChange={v => up({ y: v })} min={0} max={86} /></Field>
      </Row2>
      <Row2>
        <Field label="W (mm)"><NumInput value={el.width} onChange={v => up({ width: v })} min={1} max={54} /></Field>
        <Field label="H (mm)"><NumInput value={el.height} onChange={v => up({ height: v })} min={1} max={86} /></Field>
      </Row2>

      {/* ── Text Properties ── */}
      {el.type === 'text' && <TextProps el={el as TextElement} up={up} />}

      {/* ── Image Properties ── */}
      {el.type === 'image' && <ImageProps el={el as ImageElement} up={up} />}

      {/* ── QR Properties ── */}
      {el.type === 'qrcode' && <QRProps el={el as QRElement} up={up} />}

      {/* ── Divider Properties ── */}
      {el.type === 'divider' && <DividerProps el={el as DividerElement} up={up} />}
    </div>
  );
};

// ─── Action Button ─────────────────────────────────────────────
const ActionBtn: React.FC<{ icon: React.ReactNode; title: string; onClick: () => void; danger?: boolean }> = ({ icon, title, onClick, danger }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: '26px', height: '26px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: danger ? '#fef2f2' : 'white',
      border: `1px solid ${danger ? '#fecaca' : '#e5e7eb'}`,
      borderRadius: '5px', cursor: 'pointer',
      color: danger ? '#ef4444' : '#6b7280',
    }}
  >
    {icon}
  </button>
);

// ─── Text Props Panel ──────────────────────────────────────────
const TextProps: React.FC<{ el: TextElement; up: (p: any) => void }> = ({ el, up }) => (
  <>
    <SectionTitle>🔗 Data Binding</SectionTitle>
    <Field label="Bind to data key">
      <TokenPicker value={el.dataKey} onChange={v => up({ dataKey: v || undefined, content: v ? `{{${v}}}` : el.content })} />
    </Field>

    <SectionTitle>✏️ Typography</SectionTitle>
    <Field label="Content (or {{token}})">
      <textarea
        value={el.content}
        onChange={e => up({ content: e.target.value })}
        rows={2}
        style={{ fontSize: '11px', padding: '3px 6px', border: '1px solid #e5e7eb', borderRadius: '4px', width: '100%', resize: 'vertical', fontFamily: 'monospace' }}
      />
    </Field>
    <Row2>
      <Field label="Font">
        <SelectInput
          value={el.fontFamily}
          onChange={v => up({ fontFamily: v })}
          options={[
            { value: 'sans', label: 'Sans-serif' },
            { value: 'khmer', label: 'Khmer OS' },
            { value: 'moul', label: 'Moul (Bold)' },
            { value: 'bold', label: 'Bold' },
          ]}
        />
      </Field>
      <Field label="Size (px)">
        <NumInput value={el.fontSize} onChange={v => up({ fontSize: v })} min={3} max={24} step={0.5} unit="px" />
      </Field>
    </Row2>
    <Row2>
      <Field label="Weight">
        <SelectInput
          value={String(el.fontWeight)}
          onChange={v => up({ fontWeight: parseInt(v) })}
          options={[
            { value: '400', label: '400 Regular' },
            { value: '500', label: '500 Medium' },
            { value: '600', label: '600 Semi' },
            { value: '700', label: '700 Bold' },
          ]}
        />
      </Field>
      <Field label="Align">
        <SelectInput
          value={el.textAlign}
          onChange={v => up({ textAlign: v })}
          options={[
            { value: 'left', label: '← Left' },
            { value: 'center', label: '↔ Center' },
            { value: 'right', label: '→ Right' },
          ]}
        />
      </Field>
    </Row2>
    <Row2>
      <Field label="Line-height">
        <NumInput value={el.lineHeight} onChange={v => up({ lineHeight: v })} min={1} max={3} step={0.1} />
      </Field>
      <Field label="Letter-sp.">
        <NumInput value={el.letterSpacing} onChange={v => up({ letterSpacing: v })} min={-0.05} max={0.2} step={0.01} unit="em" />
      </Field>
    </Row2>
    <Row2>
      <Field label="Color">
        <div style={{ display: 'flex', gap: '4px' }}>
          <input type="color" value={el.color} onChange={e => up({ color: e.target.value })}
            style={{ width: '28px', height: '26px', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer', padding: '1px' }} />
          <TextInput value={el.color} onChange={v => up({ color: v })} mono />
        </div>
      </Field>
      <Field label="Italic">
        <button
          onClick={() => up({ italic: !el.italic })}
          style={{ fontSize: '11px', padding: '3px 8px', border: '1px solid #e5e7eb', borderRadius: '4px', background: el.italic ? '#eff6ff' : 'white', cursor: 'pointer', fontStyle: el.italic ? 'italic' : 'normal' }}
        >
          {el.italic ? '✓ Italic' : 'Normal'}
        </button>
      </Field>
    </Row2>
  </>
);

// ─── Image Props Panel ────────────────────────────────────────
const ImageProps: React.FC<{ el: ImageElement; up: (p: any) => void }> = ({ el, up }) => (
  <>
    <SectionTitle>🔗 Data Binding</SectionTitle>
    <Field label="Bind to data key">
      <TokenPicker value={el.dataKey} onChange={v => up({ dataKey: v || undefined })} />
    </Field>
    <Field label="Static URL (if no binding)">
      <TextInput value={el.src} onChange={v => up({ src: v })} placeholder="https://..." />
    </Field>

    <SectionTitle>🖼 Image Style</SectionTitle>
    <Row2>
      <Field label="Object fit">
        <SelectInput value={el.objectFit} onChange={v => up({ objectFit: v })} options={[{ value: 'cover', label: 'Cover' }, { value: 'contain', label: 'Contain' }]} />
      </Field>
      <Field label="Radius (px)">
        <NumInput value={el.borderRadius} onChange={v => up({ borderRadius: v })} min={0} max={50} step={1} unit="px" />
      </Field>
    </Row2>
    <Row2>
      <Field label="Border color">
        <div style={{ display: 'flex', gap: '4px' }}>
          <input type="color" value={el.borderColor} onChange={e => up({ borderColor: e.target.value })}
            style={{ width: '28px', height: '26px', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer', padding: '1px' }} />
          <TextInput value={el.borderColor} onChange={v => up({ borderColor: v })} mono />
        </div>
      </Field>
      <Field label="Border W (px)">
        <NumInput value={el.borderWidth} onChange={v => up({ borderWidth: v })} min={0} max={10} step={0.5} />
      </Field>
    </Row2>
    <Field label="Drop shadow">
      <button onClick={() => up({ shadow: !el.shadow })}
        style={{ fontSize: '11px', padding: '3px 8px', border: '1px solid #e5e7eb', borderRadius: '4px', background: el.shadow ? '#eff6ff' : 'white', cursor: 'pointer' }}>
        {el.shadow ? '✓ Enabled' : 'Disabled'}
      </button>
    </Field>
  </>
);

// ─── QR Props Panel ───────────────────────────────────────────
const QRProps: React.FC<{ el: QRElement; up: (p: any) => void }> = ({ el, up }) => (
  <>
    <SectionTitle>🔗 Data Binding</SectionTitle>
    <Field label="QR data key">
      <TokenPicker value={el.dataKey} onChange={v => up({ dataKey: v })} />
    </Field>
    <Row2>
      <Field label="Foreground">
        <div style={{ display: 'flex', gap: '4px' }}>
          <input type="color" value={el.fgColor} onChange={e => up({ fgColor: e.target.value })}
            style={{ width: '28px', height: '26px', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer', padding: '1px' }} />
        </div>
      </Field>
      <Field label="Background">
        <div style={{ display: 'flex', gap: '4px' }}>
          <input type="color" value={el.bgColor} onChange={e => up({ bgColor: e.target.value })}
            style={{ width: '28px', height: '26px', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer', padding: '1px' }} />
        </div>
      </Field>
    </Row2>
  </>
);

// ─── Divider Props Panel ──────────────────────────────────────
const DividerProps: React.FC<{ el: DividerElement; up: (p: any) => void }> = ({ el, up }) => (
  <>
    <SectionTitle>— Divider Style</SectionTitle>
    <Row2>
      <Field label="Orientation">
        <SelectInput value={el.orientation} onChange={v => up({ orientation: v })} options={[{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }]} />
      </Field>
      <Field label="Style">
        <SelectInput value={el.style} onChange={v => up({ style: v })} options={[{ value: 'solid', label: 'Solid' }, { value: 'dashed', label: 'Dashed' }, { value: 'dotted', label: 'Dotted' }]} />
      </Field>
    </Row2>
    <Row2>
      <Field label="Color">
        <div style={{ display: 'flex', gap: '4px' }}>
          <input type="color" value={el.color} onChange={e => up({ color: e.target.value })}
            style={{ width: '28px', height: '26px', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer', padding: '1px' }} />
          <TextInput value={el.color} onChange={v => up({ color: v })} mono />
        </div>
      </Field>
      <Field label="Thickness (px)">
        <NumInput value={el.thickness} onChange={v => up({ thickness: v })} min={0.5} max={10} step={0.5} unit="px" />
      </Field>
    </Row2>
  </>
);
