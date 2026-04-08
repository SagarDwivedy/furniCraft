/**
 * DimensionControls.jsx
 * Sliders for W, H, D, T with live value display.
 */
import useConfigStore from '../../store/useConfigStore.js';

const SLIDERS = [
  { key: 'H', label: 'Height',    min: 40,  max: 120, unit: 'cm' },
  { key: 'W', label: 'Width',     min: 60,  max: 200, unit: 'cm' },
  { key: 'D', label: 'Depth',     min: 30,  max: 120, unit: 'cm' },
  { key: 'T', label: 'Thickness', min: 1,   max: 12,  unit: 'cm', step: 0.5 },
];

const DimensionControls = () => {
  const dims   = useConfigStore((s) => s.dims);
  const setDim = useConfigStore((s) => s.setDim);

  return (
    <section className="p-3 pb-2">
      <SectionTitle icon="⊡" title="Dimensions" />
      <div className="mt-2 space-y-2.5">
        {SLIDERS.map(({ key, label, min, max, unit, step = 1 }) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-white/50">{label}</span>
              <code className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-mono">
                {dims[key]}{unit}
              </code>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={dims[key]}
              onChange={(e) => setDim(key, e.target.value)}
              className="w-full h-[3px] bg-white/10 rounded appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-accent
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-bg
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export const SectionTitle = ({ icon, title }) => (
  <div className="flex items-center gap-2">
    <span className="text-white/30 text-xs">{icon}</span>
    <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">
      {title}
    </span>
  </div>
);

export default DimensionControls;
