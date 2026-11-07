export interface PhysicalConstant {
  name: string;
  symbol: string;
  value: string;
  unit: string;
  description: string;
}

export const PHYSICAL_CONSTANTS: PhysicalConstant[] = [
  { name: 'Speed of Light in Vacuum', symbol: 'c', value: '2.9979 × 10⁸', unit: 'm·s⁻¹', description: 'Universal physical constant fundamental in relativity & electrodynamics.' },
  { name: "Planck's Constant", symbol: 'h', value: '6.626 × 10⁻³⁴', unit: 'J·s (4.1357 × 10⁻¹⁵ eV·s)', description: 'Relates photon energy to its frequency (E = hν).' },
  { name: 'Elementary Charge', symbol: 'e', value: '1.6022 × 10⁻¹⁹', unit: 'C', description: 'Electric charge carried by a single proton/electron.' },
  { name: 'Gravitational Constant', symbol: 'G', value: '6.6743 × 10⁻¹¹', unit: 'N·m²·kg⁻²', description: "Newton's law of universal gravitation constant." },
  { name: 'Universal Gas Constant', symbol: 'R', value: '8.314', unit: 'J·mol⁻¹·K⁻¹ (0.0821 L·atm·mol⁻¹·K⁻¹)', description: 'Ideal gas equation PV = nRT proportionality constant.' },
  { name: "Avogadro's Number", symbol: 'N_A', value: '6.0221 × 10²³', unit: 'mol⁻¹', description: 'Number of constituent particles in one mole of substance.' },
  { name: 'Boltzmann Constant', symbol: 'k_B', value: '1.3806 × 10⁻²³', unit: 'J·K⁻¹', description: 'Relates temperature to particle kinetic energy.' },
  { name: 'Permittivity of Free Space', symbol: 'ε₀', value: '8.8542 × 10⁻¹²', unit: 'F·m⁻¹ (C²·N⁻¹·m⁻²)', description: 'Vacuum electric dielectric permittivity.' },
  { name: 'Permeability of Free Space', symbol: 'μ₀', value: '4π × 10⁻⁷ (1.2566 × 10⁻⁶)', unit: 'T·m·A⁻¹ (H·m⁻¹)', description: 'Magnetic constant in vacuum.' },
  { name: 'Electron Rest Mass', symbol: 'm_e', value: '9.1094 × 10⁻³¹', unit: 'kg (0.511 MeV/c²)', description: 'Rest mass of an electron.' },
  { name: 'Proton Rest Mass', symbol: 'm_p', value: '1.6726 × 10⁻²⁷', unit: 'kg (938.27 MeV/c²)', description: 'Rest mass of a proton.' },
  { name: 'Rydberg Constant', symbol: 'R_H', value: '1.09737 × 10⁷', unit: 'm⁻¹', description: 'Spectral line wavenumber coefficient in hydrogen-like atoms.' },
];

export const REACTIVITY_SERIES = [
  { rank: 1, metal: 'Potassium (K)', reactivity: 'Highest', reactionWithWater: 'Reacts violently with cold water, burns with lilac flame' },
  { rank: 2, metal: 'Sodium (Na)', reactivity: 'Very High', reactionWithWater: 'Reacts vigorously with cold water, melts into silvery ball' },
  { rank: 3, metal: 'Calcium (Ca)', reactivity: 'High', reactionWithWater: 'Reacts readily with cold water; sink and releases H₂' },
  { rank: 4, metal: 'Magnesium (Mg)', reactivity: 'Moderate', reactionWithWater: 'Slow with cold water, rapid with steam' },
  { rank: 5, metal: 'Aluminium (Al)', reactivity: 'Moderate', reactionWithWater: 'Passivated by Al₂O₃ oxide layer; reacts with steam' },
  { rank: 6, metal: 'Zinc (Zn)', reactivity: 'Moderate', reactionWithWater: 'Reacts with steam only upon strong heating' },
  { rank: 7, metal: 'Iron (Fe)', reactivity: 'Low-Moderate', reactionWithWater: 'Reacts slowly with steam forming Fe₃O₄' },
  { rank: 8, metal: 'Lead (Pb)', reactivity: 'Low', reactionWithWater: 'Practically no reaction with water' },
  { rank: 9, metal: '[Hydrogen] (H₂)', reactivity: 'Reference Standard', reactionWithWater: 'Standard redox reference (E° = 0.00 V)' },
  { rank: 10, metal: 'Copper (Cu)', reactivity: 'Very Low', reactionWithWater: 'No reaction with water or dilute non-oxidizing acids' },
  { rank: 11, metal: 'Silver (Ag)', reactivity: 'Noble', reactionWithWater: 'Unreactive with water' },
  { rank: 12, metal: 'Gold (Au)', reactivity: 'Lowest (Noble)', reactionWithWater: 'Completely unreactive; dissolves only in Aqua Regia' },
];

