/**
 * UploadOverlay.jsx
 * Full-viewport drop zone shown before model is loaded.
 */
import { useState } from 'react';
import useConfigStore from '../../store/useConfigStore.js';

const UploadOverlay = () => {
  const modelLoaded = useConfigStore((s) => s.modelLoaded);
  const isLoading   = useConfigStore((s) => s.isLoading);
  const [dragging, setDragging] = useState(false);

  // Hide once model is loaded
  if (modelLoaded) return null;

  const loadFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) return;
    window.__loadModel?.(URL.createObjectURL(file));
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg">
      {isLoading ? (
        <LoadingState />
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            loadFile(e.dataTransfer.files[0]);
          }}
          onClick={() => document.getElementById('fileInput').click()}
          className={`
            flex flex-col items-center gap-4 px-16 py-14 cursor-pointer
            border-2 border-dashed rounded-2xl transition-all duration-200
            ${dragging
              ? 'border-accent bg-accent/10 scale-105'
              : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
            }
          `}
        >
          {/* Upload icon */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center
            transition-colors ${dragging ? 'bg-accent/20' : 'bg-surface2'}`}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke={dragging ? '#7c6bff' : '#ffffff40'} strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>

          <div className="text-center">
            <p className="text-base font-medium text-white/80 mb-1">
              Drop your GLB file here
            </p>
            <p className="text-xs text-white/30">
              or click to browse · GLB / GLTF supported
            </p>
          </div>

          {/* Demo hint */}
          <p className="text-[10px] text-white/20 border border-white/[0.07]
            px-3 py-1.5 rounded-full">
            Load your table_model.glb to start configuring
          </p>

          <input
            id="fileInput"
            type="file"
            accept=".glb,.gltf"
            className="hidden"
            onChange={(e) => loadFile(e.target.files[0])}
          />
        </div>
      )}
    </div>
  );
};

const LoadingState = () => {
  const progress = useConfigStore((s) => s.loadingProgress);
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-10 h-10 border-2 border-white/10 border-t-accent
        rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-sm text-white/60 mb-3">Loading model…</p>
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-white/30 font-mono mt-2">{progress}%</p>
      </div>
    </div>
  );
};

export default UploadOverlay;
