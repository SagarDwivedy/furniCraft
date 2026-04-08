/**
 * Header.jsx — Top navigation bar
 */
import useConfigStore from '../../store/useConfigStore.js';

const Header = () => {
  const modelLoaded   = useConfigStore((s) => s.modelLoaded);
  const screenshotFn  = useConfigStore((s) => s.screenshotFn);
  const isLoading     = useConfigStore((s) => s.isLoading);
  const loadingProgress = useConfigStore((s) => s.loadingProgress);

  const handleScreenshot = () => screenshotFn?.()();

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between
      px-5 bg-surface border-b border-white/[0.07] z-10">

      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <span className="text-accent text-xl leading-none">⬡</span>
        <span className="text-sm font-semibold tracking-tight">FurniCraft</span>
        <span className="text-[10px] text-white/20 border border-white/10 px-1.5 py-0.5 rounded">
          Configurator
        </span>
      </div>

      {/* Loading progress bar */}
      {isLoading && (
        <div className="flex items-center gap-3">
          <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <span className="text-[10px] text-white/40 font-mono">
            {loadingProgress}%
          </span>
        </div>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {modelLoaded && (
          <button
            onClick={handleScreenshot}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs
              text-white/50 border border-white/10 rounded-lg
              hover:border-white/20 hover:text-white/70 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="12" cy="12" r="4"/>
            </svg>
            Screenshot
          </button>
        )}

        <button
          disabled={!modelLoaded}
          onClick={() => window.__exportGLB?.()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
            bg-accent text-white rounded-lg
            hover:opacity-80 transition-all
            disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export GLB
        </button>
      </div>
    </header>
  );
};

export default Header;
