/**
 * ViewportBar.jsx — Bottom info bar on the 3D viewport
 */
import useConfigStore from '../../store/useConfigStore.js';

const ViewportBar = () => {
  const modelLoaded = useConfigStore((s) => s.modelLoaded);
  const dims        = useConfigStore((s) => s.dims);
  const material    = useConfigStore((s) => s.material);

  if (!modelLoaded) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10
      flex items-center gap-3 px-4 py-2
      bg-surface/80 backdrop-blur-md
      border border-white/[0.07] rounded-full
      text-[10px] font-mono text-white/40
      pointer-events-none whitespace-nowrap">
      <span>W {dims.W}cm</span>
      <Dot />
      <span>H {dims.H}cm</span>
      <Dot />
      <span>D {dims.D}cm</span>
      <Dot />
      <span>T {dims.T}cm</span>
      <Dot />
      <span className="capitalize">{material}</span>
      <Dot />
      <span className="text-white/20">Drag · Scroll · Right-drag</span>
    </div>
  );
};

const Dot = () => <span className="text-white/15">·</span>;

export default ViewportBar;
