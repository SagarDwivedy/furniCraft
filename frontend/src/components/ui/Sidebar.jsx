import DimensionControls from './DimensionControls.jsx';
import MaterialPicker    from './MaterialPicker.jsx';
import PricePanel        from './PricePanel.jsx';
import SharePanel        from './SharePanel.jsx';
import useConfigStore    from '../../store/useConfigStore.js';

const Sidebar = () => {
  const resetConfig    = useConfigStore((s) => s.resetConfig);
  const modelLoaded    = useConfigStore((s) => s.modelLoaded);
  const screenshotFn   = useConfigStore((s) => s.screenshotFn);

  const handleReset = () => {
    resetConfig();
    window.__resetCamera?.();
  };

  return (
    <aside className="w-[300px] h-full flex-shrink-0 bg-surface border-l border-white/[0.07] flex flex-col overflow-hidden">
      {/* Sticky price at top — always visible */}
      <div className="sticky top-0 z-10 bg-surface border-b border-white/[0.07]">
        <PricePanel />
      </div>
      
      {/* Scrollable controls below */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-white/[0.06]">
        <DimensionControls />
        <MaterialPicker />
        <SharePanel />
      </div>
      <div className="p-3 border-t border-white/[0.07] flex gap-2">
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 py-2 text-xs text-white/50 border border-white/10 rounded-lg hover:border-white/20 hover:text-white/70 transition-all"
        >
          ↺ Reset
        </button>
        {modelLoaded && (
          <button
            type="button"
            onClick={() => screenshotFn?.()()}
            className="flex-1 py-2 text-xs text-white/50 border border-white/10 rounded-lg hover:border-white/20 hover:text-white/70 transition-all"
          >
            📷 Shot
          </button>
        )}
        <button
          type="button"
          onClick={() => window.__exportGLB?.()}
          disabled={!modelLoaded}
          className="flex-1 py-2 text-xs bg-accent text-white rounded-lg hover:opacity-80 transition-all font-medium disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ⬇ Export
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
