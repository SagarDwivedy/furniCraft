/**
 * materialService.js
 * ─────────────────────────────────────────────────────────────
 * PBR material definitions with texture support.
 * Uses Three.js TextureLoader for real wood/metal textures.
 * Falls back to color-only if textures fail to load.
 */
import * as THREE from 'three';

// ── Material definitions ──────────────────────────────────────
// textureBase: path to texture folder in /public/textures/
// Each folder should contain: color.jpg, roughness.jpg, normal.jpg
export const MATERIAL_DEFS = {
  oak: {
    label:      'Oak Wood',
    color:      0xc68642,
    roughness:  0.75,
    metalness:  0.0,
    textureBase: '/textures/oak',
    swatch:     '#c68642',
  },
  walnut: {
    label:      'Walnut',
    color:      0x3b1f0e,
    roughness:  0.80,
    metalness:  0.0,
    textureBase: '/textures/walnut',
    swatch:     '#4a2c0a',
  },
  pine: {
    label:      'Pine',
    color:      0xdeb887,
    roughness:  0.70,
    metalness:  0.0,
    textureBase: '/textures/pine',
    swatch:     '#deb887',
  },
  white: {
    label:      'White Lacquer',
    color:      0xf0ede8,
    roughness:  0.30,
    metalness:  0.05,
    textureBase:  null,
    swatch:     '#f0ede8',
  },
  black: {
    label:      'Matte Black',
    color:      0x1c1c1c,
    roughness:  0.80,
    metalness:  0.10,
    textureBase:  null,
    swatch:     '#1c1c1c',
  },
  metal: {
    label:      'Brushed Steel',
    color:      0x8898a8,
    roughness:  0.25,
    metalness:  0.95,
    textureBase: '/textures/metal',
    swatch:     '#8898a8',
  },
};

// ── Texture cache + async queue — avoids duplicate network requests ──
const textureCache = new Map();
const textureLoader = new THREE.TextureLoader();

function loadTextureCached(path, onLoad, onError) {
  if (textureCache.has(path)) {
    onLoad(textureCache.get(path));
    return;
  }

  textureLoader.load(
    path,
    (tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);
      textureCache.set(path, tex);
      onLoad(tex);
    },
    undefined,
    onError
  );
}

/**
 * buildMaterial(materialKey) → THREE.MeshStandardMaterial
 * Creates a PBR material. Loads textures if textureBase is set.
 * Gracefully falls back to solid color if textures are missing.
 */
export function buildMaterial(materialKey) {
  const def = MATERIAL_DEFS[materialKey] || MATERIAL_DEFS.oak;

  const material = new THREE.MeshStandardMaterial({
    color:     def.color,
    roughness: def.roughness,
    metalness: def.metalness,
  });

  // Keep base color always. Apply texture maps only after they really load.
  // This prevents black/dark placeholder shading when texture files are missing.
  if (def.textureBase) {
    loadTextureCached(
      `${def.textureBase}/color.jpg`,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        material.map = tex;
        material.needsUpdate = true;
      },
      () => {
        console.warn(`Color texture not found for ${materialKey}, using color fallback`);
      }
    );

    loadTextureCached(
      `${def.textureBase}/roughness.jpg`,
      (tex) => {
        material.roughnessMap = tex;
        material.needsUpdate = true;
      },
      () => {
        // Optional map, ignore gracefully
      }
    );

    loadTextureCached(
      `${def.textureBase}/normal.jpg`,
      (tex) => {
        material.normalMap = tex;
        material.needsUpdate = true;
      },
      () => {
        // Optional map, ignore gracefully
      }
    );
  }

  return material;
}
