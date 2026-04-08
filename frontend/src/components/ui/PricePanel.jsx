/**
 * PricePanel.jsx
 * Live price calculation with itemized breakdown.
 * Reads from store — updates instantly on every slider/material change.
 */
import useConfigStore from '../../store/useConfigStore.js';
import { SectionTitle } from './DimensionControls.jsx';

const PricePanel = () => {
  const price = useConfigStore((s) => s.price);
  const { total, breakdown } = price;

  return (
    <section className="p-3 bg-gradient-to-b from-surface to-surface/80">
      <SectionTitle icon="₹" title="Pricing" />

      {/* Total price — big display */}
      <div className="mt-1.5 p-3 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5
        border border-accent/20 flex items-center justify-between shadow-md">
        <div>
          <p className="text-[9px] text-white/40 uppercase tracking-wide mb-0.5">
            Est. Price
          </p>
          <p className="text-xl font-semibold text-white">
            ₹{total.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="text-2xl opacity-20">⬡</div>
      </div>

      {/* Breakdown */}
      <div className="mt-1.5 space-y-1">
        <BreakdownRow
          label="Material cost"
          sub={`${breakdown.volume} cm³ × rate`}
          value={breakdown.materialCost}
        />
        <BreakdownRow
          label="Craft fee"
          sub={breakdown.materialLabel}
          value={breakdown.craftFee}
        />
        <BreakdownRow
          label="Thickness surcharge"
          sub="panel grade"
          value={breakdown.thicknessSurcharge}
        />
        <div className="border-t border-white/[0.07] pt-1 flex justify-between">
          <span className="text-[10px] font-medium text-white/60">Total</span>
          <span className="text-[10px] font-semibold text-accent font-mono">
            ₹{total.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </section>
  );
};

const BreakdownRow = ({ label, sub, value }) => (
  <div className="flex items-center justify-between py-0.5">
    <div>
      <p className="text-[10px] text-white/60">{label}</p>
      <p className="text-[8px] text-white/25 font-mono">{sub}</p>
    </div>
    <span className="text-[10px] text-white/50 font-mono">₹{value}</span>
  </div>
);

export default PricePanel;
