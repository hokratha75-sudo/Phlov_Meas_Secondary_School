import React, { useRef } from 'react';
import { Save, Download, Upload, ZoomIn, ZoomOut, RotateCcw, FileJson } from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { EditorCanvas } from '../canvas/EditorCanvas';
import { ComponentPalette } from '../panels/ComponentPalette';
import { PropertiesPanel } from '../panels/PropertiesPanel';
import { useEditorShortcuts } from '../hooks';
import { ExactStudentData, ExactTemplateData } from '@/types/student-id';

interface IDCardEditorProps {
  student: ExactStudentData;
  template: ExactTemplateData;
}

export const IDCardEditor: React.FC<IDCardEditorProps> = ({ student, template }) => {
  const {
    activeSide, zoom, isDirty, schema,
    setActiveSide, setZoom, saveToLocalStorage,
    exportJSON, importJSON, resetSchema,
  } = useEditorStore(s => ({
    activeSide: s.activeSide,
    zoom: s.zoom,
    isDirty: s.isDirty,
    schema: s.schema,
    setActiveSide: s.setActiveSide,
    setZoom: s.setZoom,
    saveToLocalStorage: s.saveToLocalStorage,
    exportJSON: s.exportJSON,
    importJSON: s.importJSON,
    resetSchema: s.resetSchema,
  }));

  useEditorShortcuts(true);

  const importRef = useRef<HTMLInputElement>(null);

  // ── Export JSON file ──
  const handleExportJSON = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.name.replace(/\s+/g, '_')}_template.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Import JSON file ──
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      importJSON(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '600px',
      background: '#f9fafb',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>

      {/* ── Top Toolbar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        background: 'white',
        borderBottom: '1px solid #f3f4f6',
        flexWrap: 'wrap',
      }}>
        {/* Template Name */}
        <TemplateNameInput />

        {/* Dirty indicator */}
        {isDirty && (
          <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 700 }}>● Unsaved</span>
        )}

        <div style={{ flex: 1 }} />

        {/* Side Switch */}
        <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '7px', overflow: 'hidden' }}>
          {(['front', 'back'] as const).map(s => (
            <button
              key={s}
              onClick={() => setActiveSide(s)}
              style={{
                padding: '5px 12px',
                fontSize: '11px', fontWeight: 700,
                cursor: 'pointer', border: 'none',
                background: activeSide === s ? '#0D1B3D' : 'white',
                color: activeSide === s ? 'white' : '#6b7280',
                transition: 'all 0.15s',
              }}
            >
              {s === 'front' ? '▶ Front' : '◀ Back'}
            </button>
          ))}
        </div>

        {/* Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ToolBtn icon={<ZoomOut size={13} />} onClick={() => setZoom(zoom - 0.25)} title="Zoom out" />
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#374151', minWidth: '36px', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <ToolBtn icon={<ZoomIn size={13} />} onClick={() => setZoom(zoom + 0.25)} title="Zoom in" />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <ToolBtn icon={<Save size={13} />} label="Save" onClick={saveToLocalStorage} primary={isDirty} title="Save to localStorage" />
          <ToolBtn icon={<FileJson size={13} />} label="Export" onClick={handleExportJSON} title="Export JSON" />
          <label title="Import JSON" style={{ cursor: 'pointer' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px',
              background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px',
              fontSize: '11px', fontWeight: 600, color: '#374151', cursor: 'pointer',
            }}>
              <Upload size={13} /> Import
            </div>
            <input ref={importRef} type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
          </label>
          <ToolBtn icon={<RotateCcw size={13} />} label="Reset" onClick={() => { if (confirm('Reset template? All changes will be lost.')) resetSchema(); }} title="Reset template" />
        </div>
      </div>

      {/* ── Main Layout: Palette | Canvas | Properties ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT — Component Palette */}
        <div style={{
          width: '160px',
          flexShrink: 0,
          borderRight: '1px solid #f3f4f6',
          background: 'white',
          overflowY: 'auto',
          padding: '12px 10px',
        }}>
          <ComponentPalette />
        </div>

        {/* CENTER — Canvas */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f1f5f9',
          overflow: 'auto',
          padding: '40px 20px',
          backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}>
          <EditorCanvas student={student} template={template} />
        </div>

        {/* RIGHT — Properties Panel */}
        <div style={{
          width: '220px',
          flexShrink: 0,
          borderLeft: '1px solid #f3f4f6',
          background: 'white',
          overflowY: 'auto',
          padding: '12px 10px',
        }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Properties
          </div>
          <PropertiesPanel />
        </div>

      </div>

      {/* ── Status Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '4px 16px',
        background: '#f8fafc',
        borderTop: '1px solid #f3f4f6',
        fontSize: '9px', color: '#9ca3af',
      }}>
        <span>Card: 54 × 86 mm</span>
        <span>•</span>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
        <span>•</span>
        <ElementCount />
        <span>•</span>
        <span>Click element to select · Drag to move</span>
      </div>
    </div>
  );
};

// ─── Template Name Input ──────────────────────────────────────
const TemplateNameInput: React.FC = () => {
  const { name, setTemplateName } = useEditorStore(s => ({ name: s.schema.name, setTemplateName: s.setTemplateName }));
  return (
    <input
      type="text"
      value={name}
      onChange={e => setTemplateName(e.target.value)}
      style={{
        fontSize: '13px', fontWeight: 700, color: '#1f2937',
        border: 'none', background: 'transparent', outline: 'none',
        borderBottom: '1.5px dashed #e5e7eb', padding: '2px 4px',
        minWidth: '120px',
      }}
    />
  );
};

// ─── Element Count ────────────────────────────────────────────
const ElementCount: React.FC = () => {
  const count = useEditorStore(s => s.schema[s.activeSide].elements.length);
  return <span>{count} element{count !== 1 ? 's' : ''}</span>;
};

// ─── Tool Button ──────────────────────────────────────────────
const ToolBtn: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  label?: string;
  primary?: boolean;
}> = ({ icon, onClick, title, label, primary }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      display: 'flex', alignItems: 'center', gap: '4px',
      padding: label ? '5px 10px' : '5px 7px',
      background: primary ? '#0D1B3D' : 'white',
      border: `1px solid ${primary ? '#0D1B3D' : '#e5e7eb'}`,
      borderRadius: '6px',
      color: primary ? 'white' : '#374151',
      fontSize: '11px', fontWeight: 600,
      cursor: 'pointer',
    }}
  >
    {icon}
    {label && <span>{label}</span>}
  </button>
);
