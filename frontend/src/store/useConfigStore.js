/**
 * useConfigStore.js — Zustand global state
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for the entire configurator.
 * Three.js scene reads from this. UI writes to this.
 * No prop drilling. No context hell.
 */
import { create } from 'zustand';
import { calculatePrice } from '../services/pricingService';

// ── Default configuration ─────────────────────────────────────
export const DEFAULT_CONFIG = {
  W: 100,  // width  cm
  H: 70,   // height cm
  D: 50,   // depth  cm
  T: 3,    // thickness cm
  material: 'oak',
};

// ── Mesh name → role mapping (from YOUR GLB) ──────────────────
export const MESH_MAP = {
  mesh_0: 'top',
  mesh_1: 'left',
  mesh_2: 'right',
};

const useConfigStore = create((set, get) => ({
  // ── Dimensions ────────────────────────────────────────────
  dims: { ...DEFAULT_CONFIG },

  // ── Material ──────────────────────────────────────────────
  material: DEFAULT_CONFIG.material,

  // ── Computed price ────────────────────────────────────────
  price: calculatePrice({ ...DEFAULT_CONFIG }),

  // ── Model state ───────────────────────────────────────────
  modelLoaded:    false,
  isLoading:      false,
  loadingProgress: 0,

  // ── Share state ───────────────────────────────────────────
  shareUrl:  null,
  isSaving:  false,
  saveError: null,

  // ── Screenshot ────────────────────────────────────────────
  screenshotFn: null, // set by ThreeScene after init

  // ── Actions ───────────────────────────────────────────────

  setDim: (key, value) => {
    const newDims = { ...get().dims, [key]: Number(value) };
    set({
      dims:  newDims,
      price: calculatePrice({ ...newDims, material: get().material }),
    });
  },

  setMaterial: (mat) => {
    set({
      material: mat,
      price:    calculatePrice({ ...get().dims, material: mat }),
    });
  },

  setModelLoaded: (val) => set({ modelLoaded: val }),
  setLoading:     (val) => set({ isLoading: val }),
  setProgress:    (val) => set({ loadingProgress: val }),
  setShareUrl:    (url) => set({ shareUrl: url }),
  setIsSaving:    (val) => set({ isSaving: val }),
  setSaveError:   (err) => set({ saveError: err }),
  setScreenshotFn:(fn)  => set({ screenshotFn: fn }),

  resetConfig: () => {
    set({
      dims:     { ...DEFAULT_CONFIG },
      material: DEFAULT_CONFIG.material,
      price:    calculatePrice(DEFAULT_CONFIG),
      shareUrl: null,
    });
  },

  // Returns the full config as a plain object (for saving/sharing)
  getSnapshot: () => ({
    dims:     get().dims,
    material: get().material,
  }),

  // Restores config from a saved snapshot
  loadSnapshot: (snapshot) => {
    const { dims, material } = snapshot;
    set({
      dims,
      material,
      price: calculatePrice({ ...dims, material }),
    });
  },
}));

export default useConfigStore;
