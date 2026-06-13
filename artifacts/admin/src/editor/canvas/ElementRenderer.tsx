import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CardElement, TextElement, ImageElement, QRElement, DividerElement } from '@/types/student-id-editor';
import { ExactStudentData, ExactTemplateData } from '@/types/student-id';
import { resolveElementContent, resolveDataKey } from '@/lib/template-engine';

// ─── Context passed to each renderer ──────────────────────────
export interface RenderContext {
  student: ExactStudentData;
  template: ExactTemplateData;
  /** px/mm scale factor */
  scale: number;
  isEditing?: boolean;
}

// ─── Text Renderer ────────────────────────────────────────────
const TextRenderer: React.FC<{ el: TextElement; ctx: RenderContext }> = ({ el, ctx }) => {
  const content = resolveElementContent(el.content, el.dataKey, { student: ctx.student, template: ctx.template });
  const fontClass = el.fontFamily === 'moul' ? 'font-moul' : el.fontFamily === 'khmer' ? 'font-khmer' : '';

  return (
    <div
      className={fontClass}
      style={{
        width: '100%',
        height: '100%',
        fontSize: `${el.fontSize}px`,
        fontWeight: el.fontWeight,
        color: el.color,
        textAlign: el.textAlign,
        lineHeight: el.lineHeight,
        letterSpacing: `${el.letterSpacing}em`,
        fontStyle: el.italic ? 'italic' : 'normal',
        overflow: 'hidden',
        wordBreak: 'break-word',
        userSelect: ctx.isEditing ? 'none' : 'text',
        pointerEvents: 'none',
      }}
    >
      {content || (ctx.isEditing ? <span style={{ color: '#d1d5db', fontStyle: 'italic' }}>Empty text…</span> : null)}
    </div>
  );
};

// ─── Image Renderer ───────────────────────────────────────────
const ImageRenderer: React.FC<{ el: ImageElement; ctx: RenderContext }> = ({ el, ctx }) => {
  const src = el.dataKey
    ? resolveDataKey(el.dataKey, { student: ctx.student, template: ctx.template })
    : el.src;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      borderRadius: `${el.borderRadius}px`,
      border: el.borderWidth > 0 ? `${el.borderWidth}px solid ${el.borderColor}` : 'none',
      overflow: 'hidden',
      boxShadow: el.shadow ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
      background: '#f3f4f6',
      pointerEvents: 'none',
    }}>
      {src ? (
        <img
          src={src}
          style={{ width: '100%', height: '100%', objectFit: el.objectFit, display: 'block' }}
          alt=""
          draggable={false}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#d1d5db', fontSize: `${Math.max(6, el.width * ctx.scale * 0.1)}px`,
          fontWeight: 600, flexDirection: 'column', gap: '2px',
        }}>
          <span>🖼</span>
          {ctx.isEditing && <span style={{ fontSize: '4px' }}>{el.dataKey || 'No source'}</span>}
        </div>
      )}
    </div>
  );
};

// ─── QR Renderer ─────────────────────────────────────────────
const QRRenderer: React.FC<{ el: QRElement; ctx: RenderContext }> = ({ el, ctx }) => {
  const value = resolveDataKey(el.dataKey, { student: ctx.student, template: ctx.template }) || el.dataKey;
  return (
    <div style={{ width: '100%', height: '100%', background: el.bgColor, pointerEvents: 'none' }}>
      <QRCodeSVG
        value={value || 'QR'}
        fgColor={el.fgColor}
        bgColor={el.bgColor}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

// ─── Divider Renderer ────────────────────────────────────────
const DividerRenderer: React.FC<{ el: DividerElement }> = ({ el }) => {
  const isH = el.orientation === 'horizontal';
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div style={{
        width: isH ? '100%' : `${el.thickness}px`,
        height: isH ? `${el.thickness}px` : '100%',
        background: el.color,
        borderStyle: el.style,
      }} />
    </div>
  );
};

// ─── Main Renderer ────────────────────────────────────────────
export const ElementRenderer: React.FC<{
  element: CardElement;
  ctx: RenderContext;
  /** px/mm conversion for positioning */
  pxPerMm: number;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: (id: string) => void;
  onMouseEnter?: (id: string) => void;
  onMouseLeave?: () => void;
}> = ({ element: el, ctx, pxPerMm, isSelected, isHovered, onSelect, onMouseEnter, onMouseLeave }) => {
  if (!el.visible) return null;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${el.x * pxPerMm}px`,
    top: `${el.y * pxPerMm}px`,
    width: `${el.width * pxPerMm}px`,
    height: `${el.height * pxPerMm}px`,
    zIndex: el.zIndex,
    cursor: el.locked ? 'not-allowed' : (ctx.isEditing ? 'move' : 'default'),
    boxSizing: 'border-box',
    // Selection ring
    outline: isSelected
      ? '1.5px solid #3b82f6'
      : isHovered
        ? '1px dashed #93c5fd'
        : 'none',
    outlineOffset: '1px',
    borderRadius: el.type === 'image' ? `${(el as ImageElement).borderRadius}px` : 0,
  };

  return (
    <div
      style={style}
      data-element-id={el.id}
      onClick={(e) => { e.stopPropagation(); onSelect?.(el.id); }}
      onMouseEnter={() => onMouseEnter?.(el.id)}
      onMouseLeave={() => onMouseLeave?.()}
    >
      {el.type === 'text'    && <TextRenderer    el={el as TextElement}    ctx={ctx} />}
      {el.type === 'image'   && <ImageRenderer   el={el as ImageElement}   ctx={ctx} />}
      {el.type === 'qrcode'  && <QRRenderer      el={el as QRElement}      ctx={ctx} />}
      {el.type === 'divider' && <DividerRenderer el={el as DividerElement} />}

      {/* Selection handles (corners) */}
      {isSelected && ctx.isEditing && !el.locked && (
        <>
          {[
            { top: -3, left: -3 }, { top: -3, right: -3 },
            { bottom: -3, left: -3 }, { bottom: -3, right: -3 },
          ].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', width: 6, height: 6,
              background: '#3b82f6', borderRadius: 1,
              border: '1px solid white', ...pos,
            }} />
          ))}
        </>
      )}
    </div>
  );
};
