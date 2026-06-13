import React, { useRef, useCallback } from 'react';
import { useDndContext } from '@dnd-kit/core';
import { useElementDrag } from '../hooks/useElementDrag';
import { useEditorStore, useActiveElements, useActiveSideBackground } from '@/store/editor-store';
import { ElementRenderer, RenderContext } from './ElementRenderer';
import { ExactStudentData, ExactTemplateData } from '@/types/student-id';

// Card physical dimensions (mm)
const CARD_W_MM = 54;
const CARD_H_MM = 86;

interface EditorCanvasProps {
  student: ExactStudentData;
  template: ExactTemplateData;
  /** Optional: read-only print preview mode */
  readOnly?: boolean;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({ student, template, readOnly = false }) => {
  const { zoom, selectedId, hoveredId, activeSide } = useEditorStore(s => ({
    zoom: s.zoom,
    selectedId: s.selectedId,
    hoveredId: s.hoveredId,
    activeSide: s.activeSide,
  }));

  const { selectElement, setHovered } = useEditorStore(s => ({
    selectElement: s.selectElement,
    setHovered: s.setHovered,
  }));

  const elements = useActiveElements();
  const background = useActiveSideBackground();

  // px per mm at current zoom
  // Browser default: 1mm = 3.78px (96dpi). We apply zoom on top.
  const BASE_PX_MM = 3.7795;
  const pxPerMm = BASE_PX_MM * zoom;

  const canvasW = CARD_W_MM * pxPerMm;
  const canvasH = CARD_H_MM * pxPerMm;

  const { onMouseDown, onMouseMove, onMouseUp, onMouseLeave } = useElementDrag(pxPerMm);
  const canvasRef = useRef<HTMLDivElement>(null);

  const ctx: RenderContext = {
    student,
    template,
    scale: zoom,
    isEditing: !readOnly,
  };

  // Sort by zIndex for rendering order
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        // Drop shadow to delineate card from editor background
        boxShadow: '0 4px 24px rgba(0,0,0,0.22), 0 1px 6px rgba(0,0,0,0.12)',
        borderRadius: `${10 * zoom * 0.5}px`,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* ── Card Canvas ── */}
      <div
        ref={canvasRef}
        style={{
          position: 'relative',
          width: `${canvasW}px`,
          height: `${canvasH}px`,
          background,
          overflow: 'hidden',
          userSelect: 'none',
          // Print ruler grid (subtle dots at 5mm intervals)
          backgroundImage: !readOnly
            ? `radial-gradient(circle, #d1d5db 0.5px, transparent 0.5px)`
            : 'none',
          backgroundSize: !readOnly ? `${5 * pxPerMm}px ${5 * pxPerMm}px` : undefined,
          backgroundPosition: !readOnly ? '0 0' : undefined,
        }}
        onMouseDown={readOnly ? undefined : onMouseDown}
        onMouseMove={readOnly ? undefined : onMouseMove}
        onMouseUp={readOnly ? undefined : onMouseUp}
        onMouseLeave={readOnly ? undefined : onMouseLeave}
        onClick={(e) => {
          // Click on canvas background → deselect
          if ((e.target as HTMLElement) === e.currentTarget) {
            selectElement(null);
          }
        }}
      >
        {/* Render elements */}
        {sorted.map(el => (
          <ElementRenderer
            key={el.id}
            element={el}
            ctx={ctx}
            pxPerMm={pxPerMm}
            isSelected={el.id === selectedId}
            isHovered={el.id === hoveredId}
            onSelect={readOnly ? undefined : selectElement}
            onMouseEnter={readOnly ? undefined : setHovered}
            onMouseLeave={readOnly ? undefined : (() => setHovered(null))}
          />
        ))}

        {/* Empty state */}
        {elements.length === 0 && !readOnly && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: '#d1d5db', pointerEvents: 'none', gap: '4px',
          }}>
            <span style={{ fontSize: `${12 * zoom * 0.4}px` }}>🎨</span>
            <span style={{ fontSize: `${5 * zoom * 0.4}px`, fontWeight: 600 }}>
              Drag elements from the palette
            </span>
          </div>
        )}
      </div>

      {/* Side label */}
      {!readOnly && (
        <div style={{
          position: 'absolute', top: -20, left: 0,
          fontSize: '10px', fontWeight: 700, color: '#6b7280',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          {activeSide === 'front' ? '▶ Front' : '▶ Back'}
        </div>
      )}
    </div>
  );
};
