import { useEffect, useCallback } from 'react';
import { useEditorStore } from '@/store/editor-store';

/**
 * Keyboard shortcuts for the ID card editor.
 * Only active when `enabled` is true (i.e., editor tab is visible).
 *
 * Shortcuts:
 *   Delete / Backspace   → Delete selected element
 *   Ctrl + D             → Duplicate selected element
 *   Escape               → Deselect
 *   Ctrl + S             → Save to localStorage
 *   Ctrl + [ / ]         → Send backward / Bring forward
 *   Arrow keys           → Nudge selected element (1mm), Shift = 5mm
 */
export function useEditorShortcuts(enabled = true) {
  const {
    selectedId,
    deleteElement,
    duplicateElement,
    selectElement,
    saveToLocalStorage,
    sendBackward,
    bringForward,
    moveElement,
  } = useEditorStore(s => ({
    selectedId: s.selectedId,
    deleteElement: s.deleteElement,
    duplicateElement: s.duplicateElement,
    selectElement: s.selectElement,
    saveToLocalStorage: s.saveToLocalStorage,
    sendBackward: s.sendBackward,
    bringForward: s.bringForward,
    moveElement: s.moveElement,
  }));

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Skip when focus is in an input/textarea
    const tag = (e.target as HTMLElement).tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    const step = e.shiftKey ? 5 : 1; // mm

    if (!selectedId) {
      if (e.key === 'Escape') selectElement(null);
      return;
    }

    switch (true) {
      case e.key === 'Delete' || e.key === 'Backspace':
        e.preventDefault();
        deleteElement(selectedId);
        break;

      case e.key === 'd' && (e.ctrlKey || e.metaKey):
        e.preventDefault();
        duplicateElement(selectedId);
        break;

      case e.key === 'Escape':
        e.preventDefault();
        selectElement(null);
        break;

      case e.key === 's' && (e.ctrlKey || e.metaKey):
        e.preventDefault();
        saveToLocalStorage();
        break;

      case e.key === '[' && (e.ctrlKey || e.metaKey):
        e.preventDefault();
        sendBackward(selectedId);
        break;

      case e.key === ']' && (e.ctrlKey || e.metaKey):
        e.preventDefault();
        bringForward(selectedId);
        break;

      // Arrow key nudge (mm)
      case e.key === 'ArrowLeft':
        e.preventDefault();
        moveElement(selectedId, -step, 0);
        break;
      case e.key === 'ArrowRight':
        e.preventDefault();
        moveElement(selectedId, step, 0);
        break;
      case e.key === 'ArrowUp':
        e.preventDefault();
        moveElement(selectedId, 0, -step);
        break;
      case e.key === 'ArrowDown':
        e.preventDefault();
        moveElement(selectedId, 0, step);
        break;
    }
  }, [enabled, selectedId, deleteElement, duplicateElement, selectElement, saveToLocalStorage, sendBackward, bringForward, moveElement]);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
}
