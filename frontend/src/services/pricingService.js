/**
 * pricingService.js
 * ─────────────────────────────────────────────────────────────
 * Modular pricing engine. All pricing logic lives here — easy
 * to swap rates without touching UI or 3D code.
 *
 * Pricing model:
 *   Base price = volume (cm³) × material rate per cm³
 *   + fixed craft fee per material
 *   + thickness surcharge
 * Currency: Indian Rupees (₹)
 */

// ── Material rates (₹ per cm³ of volume) — Indian market pricing ───────
const MATERIAL_RATES = {
  oak:    { ratePerCm3: 0.17, craftFee: 2100, label: 'Oak Wood'    },
  walnut: { ratePerCm3: 0.33, craftFee: 3300, label: 'Walnut Wood' },
  pine:   { ratePerCm3: 0.08, craftFee: 1200, label: 'Pine Wood'   },
  white:  { ratePerCm3: 0.12, craftFee: 1700, label: 'White Lacquer'},
  black:  { ratePerCm3: 0.12, craftFee: 1800, label: 'Black Lacquer'},
  metal:  { ratePerCm3: 0.42, craftFee: 5000, label: 'Steel'       },
};

// ── Thickness surcharge tiers (in ₹) ─────────────────────────────────
const THICKNESS_TIERS = [
  { max: 3,  surcharge: 0    },
  { max: 6,  surcharge: 800  },
  { max: 10, surcharge: 1700 },
  { max: 12, surcharge: 2900 },
];

/**
 * calculateVolume(dims) → number (cm³)
 * Approximates table material volume:
 *   - Tabletop slab: W × T × D
 *   - Two side panels: 2 × (T × H × D)
 */
function calculateVolume({ W, H, D, T }) {
  const topVolume    = W * T * D;
  const panelVolume  = 2 * (T * H * D);
  return topVolume + panelVolume;
}

/**
 * getThicknessSurcharge(T) → number (₹)
 */
function getThicknessSurcharge(T) {
  const tier = THICKNESS_TIERS.find((t) => T <= t.max);
  return tier ? tier.surcharge : 2900;
}

/**
 * calculatePrice(config) → PriceBreakdown
 * @param {object} config - { W, H, D, T, material }
 * @returns {{ total, breakdown: { volume, materialCost, craftFee, thicknessSurcharge } }}
 */
export function calculatePrice(config) {
  const { W, H, D, T, material } = config;
  const rates = MATERIAL_RATES[material] || MATERIAL_RATES.oak;

  const volume            = calculateVolume({ W, H, D, T });
  const materialCost      = Math.round(volume * rates.ratePerCm3);
  const craftFee          = rates.craftFee;
  const thicknessSurcharge = getThicknessSurcharge(T);
  const total             = materialCost + craftFee + thicknessSurcharge;

  return {
    total,
    breakdown: {
      materialCost,
      craftFee,
      thicknessSurcharge,
      volume: Math.round(volume),
      materialLabel: rates.label,
    },
  };
}

/**
 * getMaterialRates() → all rate info (for UI display)
 */
export function getMaterialRates() {
  return MATERIAL_RATES;
}
