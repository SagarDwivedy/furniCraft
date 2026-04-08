/**
 * configService.js
 * ─────────────────────────────────────────────────────────────
 * Handles saving and loading configurations.
 * Talks to Express backend at /api/configs
 * Falls back to localStorage if backend is unavailable.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/configs';

/**
 * saveConfig(config) → { id, shareUrl }
 * Posts config JSON to backend, gets back an ID.
 */
export async function saveConfig(config) {
  try {
    const res = await fetch(API_BASE, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(config),
    });

    if (!res.ok) throw new Error('Backend unavailable');

    const data = await res.json();
    const shareUrl = `${window.location.origin}/config/${data.id}`;
    return { id: data.id, shareUrl };

  } catch {
    // Fallback: save to localStorage
    const id = `local_${Date.now()}`;
    localStorage.setItem(`config_${id}`, JSON.stringify(config));
    const shareUrl = `${window.location.origin}?config=${id}`;
    return { id, shareUrl };
  }
}

/**
 * loadConfig(id) → config object | null
 * Fetches config from backend by ID.
 */
export async function loadConfig(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error('Not found');
    return await res.json();
  } catch {
    // Fallback: check localStorage
    const stored = localStorage.getItem(`config_${id}`);
    return stored ? JSON.parse(stored) : null;
  }
}

/**
 * getConfigIdFromURL() → string | null
 * Reads config ID from URL: /config/:id or ?config=id
 */
export function getConfigIdFromURL() {
  const path    = window.location.pathname;
  const match   = path.match(/\/config\/([^/]+)/);
  if (match) return match[1];

  const params = new URLSearchParams(window.location.search);
  return params.get('config');
}
