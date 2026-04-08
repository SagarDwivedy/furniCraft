/**
 * App.jsx — Root component
 * - Boots the app
 * - On mount: checks URL for config ID → restores state
 * - Layout: Header + (Viewport + Sidebar)
 */
import { useEffect } from 'react';
import Header        from './components/ui/Header.jsx';
import Sidebar       from './components/ui/Sidebar.jsx';
import ThreeCanvas   from './components/scene/ThreeCanvas.jsx';
import UploadOverlay from './components/ui/UploadOverlay.jsx';
import ViewportBar   from './components/ui/ViewportBar.jsx';
import useConfigStore from './store/useConfigStore.js';
import { loadConfig, getConfigIdFromURL } from './services/configService.js';

const App = () => {
  const loadSnapshot = useConfigStore((s) => s.loadSnapshot);
  const setModelLoaded = useConfigStore((s) => s.setModelLoaded);
  const modelLoaded = useConfigStore((s) => s.modelLoaded);

  // ── On mount: restore config from URL if present ──────────
  useEffect(() => {
    const configId = getConfigIdFromURL();
    
    // If no config in URL, ensure upload overlay shows (reset modelLoaded)
    if (!configId) {
      setModelLoaded(false);
      return;
    }

    // Load shared config from URL
    loadConfig(configId).then((snapshot) => {
      if (snapshot) {
        loadSnapshot(snapshot);
        // Config dimensions/material loaded, but model still needs upload in viewport
      }
    });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-bg text-white font-sans overflow-hidden">

      {/* Top header bar */}
      <Header />

      {/* Main area: viewport + sidebar */}
      <div className="flex flex-1 overflow-hidden">

        {/* 3D Viewport */}
        <div className="flex-1 relative overflow-hidden">
          <ThreeCanvas />
          <UploadOverlay />
          <ViewportBar />
        </div>

        {/* Right sidebar — only show when model is loaded */}
        {modelLoaded && <Sidebar />}
      </div>

    </div>
  );
};

export default App;
