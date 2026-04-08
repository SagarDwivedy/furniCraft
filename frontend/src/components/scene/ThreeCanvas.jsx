/**
 * ThreeCanvas.jsx
 * ─────────────────────────────────────────────────────────────
 * React component that owns the Three.js canvas.
 * - Mounts SceneManager on first render
 * - Reacts to store state changes via useEffect
 * - Never re-renders (uses refs) — no performance cost
 */
import { useEffect, useRef } from 'react';
import { SceneManager } from '../../three/SceneManager.js';
import useConfigStore from '../../store/useConfigStore.js';

const ThreeCanvas = () => {
  const containerRef  = useRef(null);
  const sceneRef      = useRef(null);

  const dims          = useConfigStore((s) => s.dims);
  const material      = useConfigStore((s) => s.material);
  const setLoading    = useConfigStore((s) => s.setLoading);
  const setProgress   = useConfigStore((s) => s.setProgress);
  const setModelLoaded = useConfigStore((s) => s.setModelLoaded);
  const setScreenshotFn = useConfigStore((s) => s.setScreenshotFn);

  // ── Mount scene once ────────────────────────────────────
  useEffect(() => {
    const sm = new SceneManager(containerRef.current);
    sceneRef.current = sm;

    // Expose screenshot to global store so UI button can call it
    setScreenshotFn(() => sm.screenshot.bind(sm));

    return () => sm.destroy();
  }, []);

  // ── React to dimension changes ──────────────────────────
  useEffect(() => {
    sceneRef.current?.updateDimensions(dims);
  }, [dims]);

  // ── React to material changes ───────────────────────────
  useEffect(() => {
    sceneRef.current?.applyMaterial(material);
  }, [material]);

  // ── Expose loadModel to window so Sidebar can call it ──
  useEffect(() => {
    window.__loadModel = (url) => {
      setLoading(true);
      setProgress(0);
      sceneRef.current?.loadModel(url, {
        onProgress: (pct) => setProgress(pct),
        onLoaded:   (err) => {
          setLoading(false);
          if (!err) {
            setModelLoaded(true);
            // Apply current config to freshly loaded model
            sceneRef.current?.updateDimensions(
              useConfigStore.getState().dims
            );
            sceneRef.current?.applyMaterial(
              useConfigStore.getState().material
            );
          }
        },
      });
    };

    window.__exportGLB    = () => sceneRef.current?.exportGLB();
    window.__resetCamera  = () => sceneRef.current?.resetCamera();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: '#0b0b0f' }}
    />
  );
};

export default ThreeCanvas;
