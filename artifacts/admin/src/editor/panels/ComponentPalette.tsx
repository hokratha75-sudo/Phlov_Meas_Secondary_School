import React from 'react';
import { useEditorStore } from '@/store/editor-store';
import { ElementType } from '@/types/student-id-editor';

interface PaletteItem {
  type: ElementType;
  icon: string;
  label: string;
  subLabel: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  { type: 'text',    icon: '𝐓',  label: 'Text Block',  subLabel: 'Static or data-bound' },
  { type: 'image',   icon: '🖼',  label: 'Image',       subLabel: 'Photo, logo, stamp'   },
  { type: 'qrcode',  icon: '▦',  label: 'QR Code',     subLabel: 'Linked to student ID'  },
  { type: 'divider', icon: '—',  label: 'Divider',     subLabel: 'Horizontal / vertical' },
];

export const ComponentPalette: React.FC = () => {
  const addElement = useEditorStore(s => s.addElement);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {/* Header */}
      <div style={{
        fontSize: '10px', fontWeight: 700, color: '#6b7280',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        paddingBottom: '6px',
        borderBottom: '1px solid #f3f4f6',
      }}>
        Elements
      </div>

      {/* Palette Items */}
      {PALETTE_ITEMS.map(item => (
        <button
          key={item.type}
          onClick={() => addElement(item.type)}
          title={`Add ${item.label}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 10px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#3b82f6';
            (e.currentTarget as HTMLButtonElement).style.background = '#eff6ff';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
            (e.currentTarget as HTMLButtonElement).style.background = 'white';
          }}
        >
          {/* Icon */}
          <div style={{
            width: '28px', height: '28px',
            background: '#f8faff',
            border: '1px solid #dbeafe',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', flexShrink: 0,
            fontFamily: 'monospace',
          }}>
            {item.icon}
          </div>
          {/* Labels */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1f2937', lineHeight: 1.3 }}>
              {item.label}
            </div>
            <div style={{ fontSize: '9px', color: '#9ca3af', lineHeight: 1.3 }}>
              {item.subLabel}
            </div>
          </div>
        </button>
      ))}

      {/* Background picker */}
      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
          Background
        </div>
        <BackgroundPicker />
      </div>
    </div>
  );
};

const BG_PRESETS = [
  '#ffffff', '#0D1B3D', '#f8faff', '#fefce8', '#fdf4ff',
  '#f0fdf4', '#fff7ed', '#fef2f2',
];

const BackgroundPicker: React.FC = () => {
  const { background, setBackground } = useEditorStore(s => ({
    background: s.schema[s.activeSide].background,
    setBackground: s.setBackground,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {BG_PRESETS.map(c => (
          <button
            key={c}
            onClick={() => setBackground(c)}
            title={c}
            style={{
              width: '20px', height: '20px',
              borderRadius: '4px',
              background: c,
              border: background === c ? '2px solid #3b82f6' : '1px solid #e5e7eb',
              cursor: 'pointer',
              padding: 0,
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <label style={{ fontSize: '9px', color: '#6b7280', flexShrink: 0 }}>Custom:</label>
        <input
          type="color"
          value={background}
          onChange={e => setBackground(e.target.value)}
          style={{ width: '32px', height: '22px', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer', padding: '1px' }}
        />
        <input
          type="text"
          value={background}
          onChange={e => setBackground(e.target.value)}
          style={{ flex: 1, fontSize: '10px', padding: '2px 5px', border: '1px solid #e5e7eb', borderRadius: '4px', fontFamily: 'monospace' }}
        />
      </div>
    </div>
  );
};
