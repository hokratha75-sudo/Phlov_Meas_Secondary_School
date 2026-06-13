import { useRef, useCallback } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { CardElement } from '@/types/student-id-editor';

interface DragState {
  id: string;
  startClientX: number;
  startClientY: number;
  originX: number;       // element's mm position at drag start
  originY: number;
}

/**
 * Encapsulates all mouse-drag logic for repositioning elements on the canvas.
 *
 * Usage:
 *   const { onMouseDown, onMouseMove, onMouseUp } = useElementDrag({ pxPerMm });
 *   <canvas onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} />
 */
export function useElementDrag(pxPerMm: number) {
  const dragRef = useRef<DragState | null>(null);
  const isDragging = useRef(false);

  const { setElementPosition, selectElement } = useEditorStore(s => ({
    setElementPosition: s.setElementPosition,
    selectElement: s.selectElement,
  }));

  // Retrieve current elements from store (latest ref, no re-render)
  const getElements = useCallback(
    () => useEditorStore.getState().schema[useEditorStore.getState().activeSide].elements,
    []
  );

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const elDiv = target.closest('[data-element-id]') as HTMLElement | null;
    if (!elDiv) return;

    const id = elDiv.dataset.elementId!;
    const elements = getElements();
    const el = elements.find((el: CardElement) => el.id === id);
    if (!el || el.locked) return;

    e.preventDefault();
    selectElement(id);
    isDragging.current = false;

    dragRef.current = {
      id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      originX: el.x,
      originY: el.y,
    };
  }, [getElements, selectElement]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;

    const { id, startClientX, startClientY, originX, originY } = dragRef.current;
    const dxPx = e.clientX - startClientX;
    const dyPx = e.clientY - startClientY;

    // Only start dragging after threshold (prevents accidental micro-moves)
    if (!isDragging.current && Math.abs(dxPx) < 2 && Math.abs(dyPx) < 2) return;
    isDragging.current = true;

    const newX = originX + dxPx / pxPerMm;
    const newY = originY + dyPx / pxPerMm;
    setElementPosition(id, newX, newY);
  }, [pxPerMm, setElementPosition]);

  const onMouseUp = useCallback(() => {
    dragRef.current = null;
    isDragging.current = false;
  }, []);

  const onMouseLeave = useCallback(() => {
    dragRef.current = null;
    isDragging.current = false;
  }, []);

  return { onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
}
