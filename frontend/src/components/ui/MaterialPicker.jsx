/**
 * MaterialPicker.jsx
 * Grid of material swatches with label and active state.
 */
import useConfigStore from '../../store/useConfigStore.js';
import { MATERIAL_DEFS } from '../../services/materialService.js';
import { SectionTitle } from './DimensionControls.jsx';

const MaterialPicker = () => {
  const material    = useConfigStore((s) => s.material);
  const setMaterial = useConfigStore((s) => s.setMaterial);

  return (
    <section className="p-3 pb-2">
      <SectionTitle icon="◈" title="Material" />
      <div className="mt-1.5 grid grid-cols-3 gap-2">
        {Object.entries(MATERIAL_DEFS).map(([key, def]) => (
          <button
            key={key}
            onClick={() => setMaterial(key)}
            className={`
              flex flex-col items-center gap-1 p-2 rounded-lg
              border transition-all duration-150
              ${material === key
                ? 'border-accent bg-accent/10'
                : 'border-white/[0.07] bg-surface2 hover:border-white/20'
              }
            `}
          >
            <div
              className="w-6 h-6 rounded shadow-inner"
              style={{ background: def.swatch }}
            />
            <span className={`text-[9px] font-medium truncate w-full text-center
              ${material === key ? 'text-accent' : 'text-white/50'}`}>
              {def.label.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default MaterialPicker;
