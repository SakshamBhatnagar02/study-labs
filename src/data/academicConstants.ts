export interface PhysicalConstant {
  name: string;
  symbol: string;
  value: string;
  unit: string;
  description: string;
  category?: 'Quantum & Atomic' | 'Electromagnetism' | 'Thermodynamics' | 'Mechanics & Universal';
}

export const PHYSICAL_CONSTANTS: PhysicalConstant[] = [
  { name: 'Speed of Light in Vacuum', symbol: 'c', value: '2.9979 × 10⁸', unit: 'm·s⁻¹', category: 'Mechanics & Universal', description: 'Universal physical constant fundamental in relativity & electrodynamics.' },
  { name: "Planck's Constant", symbol: 'h', value: '6.6261 × 10⁻³⁴', unit: 'J·s (4.1357 × 10⁻¹⁵ eV·s)', category: 'Quantum & Atomic', description: 'Relates photon energy to its frequency (E = hν).' },
  { name: 'Reduced Planck Constant', symbol: 'ħ', value: '1.0546 × 10⁻³⁴', unit: 'J·s', category: 'Quantum & Atomic', description: 'Angular momentum quantum unit h / (2π).' },
  { name: 'Elementary Charge', symbol: 'e', value: '1.6022 × 10⁻¹⁹', unit: 'C', category: 'Electromagnetism', description: 'Electric charge carried by a single proton/electron.' },
  { name: 'Gravitational Constant', symbol: 'G', value: '6.6743 × 10⁻¹¹', unit: 'N·m²·kg⁻²', category: 'Mechanics & Universal', description: "Newton's law of universal gravitation constant." },
  { name: 'Standard Gravity (Earth)', symbol: 'g', value: '9.80665', unit: 'm·s⁻²', category: 'Mechanics & Universal', description: 'Nominal gravitational acceleration at sea level on Earth.' },
  { name: 'Universal Gas Constant', symbol: 'R', value: '8.3145', unit: 'J·mol⁻¹·K⁻¹ (0.0821 L·atm·mol⁻¹·K⁻¹)', category: 'Thermodynamics', description: 'Ideal gas equation PV = nRT proportionality constant.' },
  { name: "Avogadro's Number", symbol: 'N_A', value: '6.0221 × 10²³', unit: 'mol⁻¹', category: 'Thermodynamics', description: 'Number of constituent particles in one mole of substance.' },
  { name: 'Boltzmann Constant', symbol: 'k_B', value: '1.3806 × 10⁻²³', unit: 'J·K⁻¹', category: 'Thermodynamics', description: 'Relates temperature to particle kinetic energy (k_B = R / N_A).' },
  { name: 'Faraday Constant', symbol: 'F', value: '96485.3', unit: 'C·mol⁻¹', category: 'Electromagnetism', description: 'Magnitude of electric charge carried by one mole of electrons (F = N_A·e).' },
  { name: 'Coulomb Electrostatic Constant', symbol: 'k_e', value: '8.9876 × 10⁹', unit: 'N·m²·C⁻²', category: 'Electromagnetism', description: 'Proportionality constant 1 / (4πε₀) in Coulomb’s Law.' },
  { name: 'Permittivity of Free Space', symbol: 'ε₀', value: '8.8542 × 10⁻¹²', unit: 'F·m⁻¹ (C²·N⁻¹·m⁻²)', category: 'Electromagnetism', description: 'Vacuum electric dielectric permittivity.' },
  { name: 'Permeability of Free Space', symbol: 'μ₀', value: '1.2566 × 10⁻⁶', unit: 'T·m·A⁻¹ (4π × 10⁻⁷)', category: 'Electromagnetism', description: 'Magnetic constant in vacuum.' },
  { name: 'Stefan–Boltzmann Constant', symbol: 'σ', value: '5.6704 × 10⁻⁸', unit: 'W·m⁻²·K⁻⁴', category: 'Thermodynamics', description: 'Blackbody radiant emittance proportionality (j* = σT⁴).' },
  { name: "Wien's Displacement Constant", symbol: 'b', value: '2.8978 × 10⁻³', unit: 'm·K', category: 'Quantum & Atomic', description: 'Peak emission wavelength relation λ_max · T = b.' },
  { name: 'Electron Rest Mass', symbol: 'm_e', value: '9.1094 × 10⁻³¹', unit: 'kg (0.511 MeV/c²)', category: 'Quantum & Atomic', description: 'Rest mass of an electron.' },
  { name: 'Proton Rest Mass', symbol: 'm_p', value: '1.6726 × 10⁻²⁷', unit: 'kg (938.27 MeV/c²)', category: 'Quantum & Atomic', description: 'Rest mass of a proton.' },
  { name: 'Neutron Rest Mass', symbol: 'm_n', value: '1.6749 × 10⁻²⁷', unit: 'kg (939.57 MeV/c²)', category: 'Quantum & Atomic', description: 'Rest mass of a free neutron.' },
  { name: 'Unified Atomic Mass Unit', symbol: 'u', value: '1.6605 × 10⁻²⁷', unit: 'kg (931.5 MeV/c²)', category: 'Quantum & Atomic', description: '1/12th the mass of an unbound carbon-12 atom at rest.' },
  { name: 'Rydberg Constant', symbol: 'R_H', value: '1.09737 × 10⁷', unit: 'm⁻¹', category: 'Quantum & Atomic', description: 'Spectral line wavenumber coefficient in hydrogen-like atoms.' },
  { name: 'Bohr Radius', symbol: 'a₀', value: '5.2918 × 10⁻¹¹', unit: 'm (0.529 Å)', category: 'Quantum & Atomic', description: 'Most probable distance between nucleus and electron in ground-state H.' },
];

export interface ReactivityEntry {
  rank: number;
  metal: string;
  symbol: string;
  reactivity: string;
  potentialV: string;
  reactionWithWater: string;
  reactionWithAcid: string;
}

export const REACTIVITY_SERIES: ReactivityEntry[] = [
  { rank: 1, metal: 'Potassium (K)', symbol: 'K', reactivity: 'Highest (Explosive)', potentialV: '-2.93 V', reactionWithWater: 'Reacts violently with cold water, ignites lilac H₂ flame', reactionWithAcid: 'Explosive H₂ evolution' },
  { rank: 2, metal: 'Sodium (Na)', symbol: 'Na', reactivity: 'Very High', potentialV: '-2.71 V', reactionWithWater: 'Reacts vigorously with cold water, melts into silvery sphere', reactionWithAcid: 'Violent H₂ release' },
  { rank: 3, metal: 'Lithium (Li)', symbol: 'Li', reactivity: 'Very High', potentialV: '-3.04 V', reactionWithWater: 'Floats and reacts steadily with cold water evolving H₂', reactionWithAcid: 'Rapid H₂ evolution' },
  { rank: 4, metal: 'Calcium (Ca)', symbol: 'Ca', reactivity: 'High', potentialV: '-2.87 V', reactionWithWater: 'Reacts steadily with cold water forming cloudy Ca(OH)₂', reactionWithAcid: 'Brisk H₂ bubbling' },
  { rank: 5, metal: 'Magnesium (Mg)', symbol: 'Mg', reactivity: 'High-Moderate', potentialV: '-2.37 V', reactionWithWater: 'Very slow with cold water, rapid with hot water / steam', reactionWithAcid: 'Rapid exothermic H₂ gas' },
  { rank: 6, metal: 'Aluminium (Al)', symbol: 'Al', reactivity: 'Moderate', potentialV: '-1.66 V', reactionWithWater: 'Passivated by Al₂O₃ coat; reacts with steam at high T', reactionWithAcid: 'Reacts briskly with HCl after oxide dissolves' },
  { rank: 7, metal: 'Zinc (Zn)', symbol: 'Zn', reactivity: 'Moderate', potentialV: '-0.76 V', reactionWithWater: 'Reacts with steam on strong heating forming ZnO + H₂', reactionWithAcid: 'Steady H₂ evolution with dilute acids' },
  { rank: 8, metal: 'Iron (Fe)', symbol: 'Fe', reactivity: 'Moderate-Low', potentialV: '-0.44 V', reactionWithWater: 'Reacts reversibly with steam forming Fe₃O₄ + H₂', reactionWithAcid: 'Slow bubbling forming Fe²⁺ salts + H₂' },
  { rank: 9, metal: 'Nickel (Ni)', symbol: 'Ni', reactivity: 'Low', potentialV: '-0.25 V', reactionWithWater: 'Inert to cold/hot water', reactionWithAcid: 'Very slow attack by dilute mineral acids' },
  { rank: 10, metal: 'Tin (Sn)', symbol: 'Sn', reactivity: 'Low', potentialV: '-0.14 V', reactionWithWater: 'Practically inert to water', reactionWithAcid: 'Slowly dissolves in warm concentrated HCl' },
  { rank: 11, metal: 'Lead (Pb)', symbol: 'Pb', reactivity: 'Very Low', potentialV: '-0.13 V', reactionWithWater: 'No reaction with pure water', reactionWithAcid: 'Passivated by insoluble PbCl₂ / PbSO₄ film' },
  { rank: 12, metal: '[Hydrogen] (H₂)', symbol: 'H₂', reactivity: 'Reference Standard', potentialV: '0.00 V', reactionWithWater: 'Standard Electrode Reference (SHE)', reactionWithAcid: 'Separates H₂-displacers above from noble metals below' },
  { rank: 13, metal: 'Copper (Cu)', symbol: 'Cu', reactivity: 'Very Low', potentialV: '+0.34 V', reactionWithWater: 'No reaction with water or steam', reactionWithAcid: 'Does not displace H₂; dissolves only in oxidizing HNO₃ / hot H₂SO₄' },
  { rank: 14, metal: 'Mercury (Hg)', symbol: 'Hg', reactivity: 'Noble', potentialV: '+0.85 V', reactionWithWater: 'Unreactive liquid metal', reactionWithAcid: 'Reacts only with oxidizing HNO₃' },
  { rank: 15, metal: 'Silver (Ag)', symbol: 'Ag', reactivity: 'Noble', potentialV: '+0.80 V', reactionWithWater: 'Unreactive with water; tarnishes with H₂S', reactionWithAcid: 'Dissolves only in hot HNO₃ / conc. H₂SO₄' },
  { rank: 16, metal: 'Gold (Au)', symbol: 'Au', reactivity: 'Lowest (Noble)', potentialV: '+1.50 V', reactionWithWater: 'Completely unreactive in water and steam', reactionWithAcid: 'Dissolves only in Aqua Regia (3 HCl : 1 HNO₃)' },
];

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'SGD' | 'AED' | 'JPY' | 'CAD' | 'AUD';

export const CURRENCY_CODES: CurrencyCode[] = [
  'USD',
  'INR',
  'EUR',
  'GBP',
  'SGD',
  'AED',
  'JPY',
  'CAD',
  'AUD',
];

/**
 * Baseline offline FX reference rates relative to 1 USD.
 * Live market FX rates connect in Phase 5 API integration.
 */
export const CURRENCY_RATES_PER_USD: Record<CurrencyCode, number> = {
  USD: 1,
  INR: 84.4,
  EUR: 0.92,
  GBP: 0.78,
  SGD: 1.33,
  AED: 3.6725,
  JPY: 153.5,
  CAD: 1.39,
  AUD: 1.52,
};

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: 'US Dollar ($)',
  INR: 'Indian Rupee (₹)',
  EUR: 'Euro (€)',
  GBP: 'British Pound (£)',
  SGD: 'Singapore Dollar (S$)',
  AED: 'UAE Dirham',
  JPY: 'Japanese Yen (¥)',
  CAD: 'Canadian Dollar (C$)',
  AUD: 'Australian Dollar (A$)',
};

export function convertCurrencyAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (!Number.isFinite(amount)) return 0;
  const fromRate = CURRENCY_RATES_PER_USD[fromCurrency as CurrencyCode] ?? 1;
  const toRate = CURRENCY_RATES_PER_USD[toCurrency as CurrencyCode] ?? 1;
  return (amount / fromRate) * toRate;
}
