import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  CardElement,
  TemplateSchema,
  CardSide,
  makeTextElement,
  makeImageElement,
  makeQRElement,
  makeDividerElement,
  ElementType,
} from '@/types/student-id-editor';

// ─── Default starter template ─────────────────────────────────
const defaultSide = (): CardSide => ({
  background: '#ffffff',
  elements: [],
});

const makeDefaultSchema = (): TemplateSchema => ({
  id: `tmpl_${Date.now()}`,
  name: 'New Template',
  version: '1.0',
  front: defaultSide(),
  back: defaultSide(),
  meta: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Admin',
  },
});

// ─── Store interface ──────────────────────────────────────────
export interface EditorState {
  schema: TemplateSchema;
  selectedId: string | null;
  activeSide: 'front' | 'back';
  zoom: number;
  isDirty: boolean;
  hoveredId: string | null;
}

export interface EditorActions {
  // Selection
  selectElement: (id: string | null) => void;
  setHovered: (id: string | null) => void;

  // CRUD
  addElement: (type: ElementType, x?: number, y?: number) => void;
  updateElement: (id: string, patch: Partial<CardElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;

  // Position
  moveElement: (id: string, dx: number, dy: number) => void;
  setElementPosition: (id: string, x: number, y: number) => void;

  // Ordering (z-index)
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;

  // Side / Zoom
  setActiveSide: (side: 'front' | 'back') => void;
  setZoom: (z: number) => void;

  // Template
  loadSchema: (schema: TemplateSchema) => void;
  resetSchema: () => void;
  setBackground: (color: string) => void;
  setTemplateName: (name: string) => void;

  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => TemplateSchema | null;
  exportJSON: () => string;
  importJSON: (json: string) => void;
}

type EditorStore = EditorState & EditorActions;

// ─── Helper: get active side elements ────────────────────────
const getSideElements = (schema: TemplateSchema, side: 'front' | 'back') =>
  schema[side].elements;

// ─── Store ───────────────────────────────────────────────────
export const useEditorStore = create<EditorStore>()(
  immer((set, get) => ({
    // ── Initial State ──
    schema: makeDefaultSchema(),
    selectedId: null,
    activeSide: 'front',
    zoom: 2.5,         // 2.5× = good screen preview size
    isDirty: false,
    hoveredId: null,

    // ── Selection ──
    selectElement: (id) => set((s: EditorStore) => { s.selectedId = id; }),
    setHovered: (id) => set((s: EditorStore) => { s.hoveredId = id; }),

    // ── Add Element ──
    addElement: (type, x = 5, y = 10) => set((s: EditorStore) => {
      let el: CardElement;
      if (type === 'text')    el = makeTextElement(x, y);
      else if (type === 'image')   el = makeImageElement(x, y);
      else if (type === 'qrcode')  el = makeQRElement(x, y);
      else                         el = makeDividerElement(x, y);

      // Assign next z-index
      const els = s.schema[s.activeSide].elements;
      el.zIndex = els.length > 0 ? Math.max(...els.map((e: CardElement) => e.zIndex)) + 1 : 1;

      s.schema[s.activeSide].elements.push(el);
      s.selectedId = el.id;
      s.isDirty = true;
    }),

    // ── Update Element ──
    updateElement: (id, patch) => set((s: EditorStore) => {
      const els = s.schema[s.activeSide].elements;
      const idx = els.findIndex((e: CardElement) => e.id === id);
      if (idx !== -1) {
        Object.assign(els[idx], patch);
        s.schema.meta.updatedAt = new Date().toISOString();
        s.isDirty = true;
      }
    }),

    // ── Delete ──
    deleteElement: (id) => set((s: EditorStore) => {
      const side = s.schema[s.activeSide];
      side.elements = side.elements.filter((e: CardElement) => e.id !== id);
      if (s.selectedId === id) s.selectedId = null;
      s.isDirty = true;
    }),

    // ── Duplicate ──
    duplicateElement: (id) => set((s: EditorStore) => {
      const els = s.schema[s.activeSide].elements;
      const src = els.find((e: CardElement) => e.id === id);
      if (!src) return;
      const clone = JSON.parse(JSON.stringify(src)) as CardElement;
      clone.id = `el_${Date.now()}_dup`;
      clone.x += 3;
      clone.y += 3;
      clone.zIndex = Math.max(...els.map((e: CardElement) => e.zIndex)) + 1;
      els.push(clone);
      s.selectedId = clone.id;
      s.isDirty = true;
    }),

    // ── Move (delta, in mm) ──
    moveElement: (id, dx, dy) => set((s: EditorStore) => {
      const el = s.schema[s.activeSide].elements.find((e: CardElement) => e.id === id);
      if (el && !el.locked) {
        el.x = Math.max(0, Math.min(54 - el.width, el.x + dx));
        el.y = Math.max(0, Math.min(86 - el.height, el.y + dy));
        s.isDirty = true;
      }
    }),

    // ── Set absolute position ──
    setElementPosition: (id, x, y) => set((s: EditorStore) => {
      const el = s.schema[s.activeSide].elements.find((e: CardElement) => e.id === id);
      if (el && !el.locked) {
        el.x = Math.max(0, Math.min(54 - el.width, x));
        el.y = Math.max(0, Math.min(86 - el.height, y));
        s.isDirty = true;
      }
    }),

    // ── Z-ordering ──
    bringForward: (id) => set((s: EditorStore) => {
      const el = s.schema[s.activeSide].elements.find((e: CardElement) => e.id === id);
      if (el) { el.zIndex += 1; s.isDirty = true; }
    }),
    sendBackward: (id) => set((s: EditorStore) => {
      const el = s.schema[s.activeSide].elements.find((e: CardElement) => e.id === id);
      if (el && el.zIndex > 1) { el.zIndex -= 1; s.isDirty = true; }
    }),
    bringToFront: (id) => set((s: EditorStore) => {
      const els = s.schema[s.activeSide].elements;
      const el = els.find((e: CardElement) => e.id === id);
      if (el) { el.zIndex = Math.max(...els.map((e: CardElement) => e.zIndex)) + 1; s.isDirty = true; }
    }),
    sendToBack: (id) => set((s: EditorStore) => {
      const el = s.schema[s.activeSide].elements.find((e: CardElement) => e.id === id);
      if (el) { el.zIndex = 0; s.isDirty = true; }
    }),

    // ── Side / Zoom ──
    setActiveSide: (side) => set((s: EditorStore) => { s.activeSide = side; s.selectedId = null; }),
    setZoom: (z) => set((s: EditorStore) => { s.zoom = Math.max(1, Math.min(4, z)); }),

    // ── Template management ──
    loadSchema: (schema) => set((s: EditorStore) => { s.schema = schema; s.selectedId = null; s.isDirty = false; }),
    resetSchema: () => set((s: EditorStore) => { s.schema = makeDefaultSchema(); s.selectedId = null; s.isDirty = false; }),
    setBackground: (color) => set((s: EditorStore) => { s.schema[s.activeSide].background = color; s.isDirty = true; }),
    setTemplateName: (name) => set((s: EditorStore) => { s.schema.name = name; s.isDirty = true; }),

    // ── Persistence ──
    saveToLocalStorage: () => {
      const { schema } = get();
      schema.meta.updatedAt = new Date().toISOString();
      localStorage.setItem('id_card_template', JSON.stringify(schema));
      set(s => { s.isDirty = false; });
    },
    loadFromLocalStorage: () => {
      try {
        const raw = localStorage.getItem('id_card_template');
        if (!raw) return null;
        const schema = JSON.parse(raw) as TemplateSchema;
        get().loadSchema(schema);
        return schema;
      } catch {
        return null;
      }
    },
    exportJSON: () => JSON.stringify(get().schema, null, 2),
    importJSON: (json) => {
      try {
        const schema = JSON.parse(json) as TemplateSchema;
        get().loadSchema(schema);
      } catch (e) {
        console.error('Invalid template JSON', e);
      }
    },
  }))
);

// ─── Selectors ────────────────────────────────────────────────
export const useActiveElements = () =>
  useEditorStore(s => s.schema[s.activeSide].elements);

export const useSelectedElement = () =>
  useEditorStore(s => {
    if (!s.selectedId) return null;
    return s.schema[s.activeSide].elements.find(e => e.id === s.selectedId) ?? null;
  });

export const useActiveSideBackground = () =>
  useEditorStore(s => s.schema[s.activeSide].background);
