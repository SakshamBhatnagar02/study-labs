import { PeriodicElement } from '../types';

export const PERIODIC_TABLE: PeriodicElement[] = [
  { number: 1, symbol: 'H', name: 'Hydrogen', mass: 1.008, category: 'nonmetal', group: 1, period: 1, electronConfig: '1s¹' },
  { number: 2, symbol: 'He', name: 'Helium', mass: 4.0026, category: 'noble_gas', group: 18, period: 1, electronConfig: '1s²' },
  { number: 3, symbol: 'Li', name: 'Lithium', mass: 6.94, category: 'alkali_metal', group: 1, period: 2, electronConfig: '[He] 2s¹' },
  { number: 4, symbol: 'Be', name: 'Beryllium', mass: 9.0122, category: 'alkaline_earth', group: 2, period: 2, electronConfig: '[He] 2s²' },
  { number: 5, symbol: 'B', name: 'Boron', mass: 10.81, category: 'metalloid', group: 13, period: 2, electronConfig: '[He] 2s² 2p¹' },
  { number: 6, symbol: 'C', name: 'Carbon', mass: 12.011, category: 'nonmetal', group: 14, period: 2, electronConfig: '[He] 2s² 2p²' },
  { number: 7, symbol: 'N', name: 'Nitrogen', mass: 14.007, category: 'nonmetal', group: 15, period: 2, electronConfig: '[He] 2s² 2p³' },
  { number: 8, symbol: 'O', name: 'Oxygen', mass: 15.999, category: 'nonmetal', group: 16, period: 2, electronConfig: '[He] 2s² 2p⁴' },
  { number: 9, symbol: 'F', name: 'Fluorine', mass: 18.998, category: 'halogen', group: 17, period: 2, electronConfig: '[He] 2s² 2p⁵' },
  { number: 10, symbol: 'Ne', name: 'Neon', mass: 20.180, category: 'noble_gas', group: 18, period: 2, electronConfig: '[He] 2s² 2p⁶' },
  { number: 11, symbol: 'Na', name: 'Sodium', mass: 22.990, category: 'alkali_metal', group: 1, period: 3, electronConfig: '[Ne] 3s¹' },
  { number: 12, symbol: 'Mg', name: 'Magnesium', mass: 24.305, category: 'alkaline_earth', group: 2, period: 3, electronConfig: '[Ne] 3s²' },
  { number: 13, symbol: 'Al', name: 'Aluminium', mass: 26.982, category: 'post_transition_metal', group: 13, period: 3, electronConfig: '[Ne] 3s² 3p¹' },
  { number: 14, symbol: 'Si', name: 'Silicon', mass: 28.085, category: 'metalloid', group: 14, period: 3, electronConfig: '[Ne] 3s² 3p²' },
  { number: 15, symbol: 'P', name: 'Phosphorus', mass: 30.974, category: 'nonmetal', group: 15, period: 3, electronConfig: '[Ne] 3s² 3p³' },
  { number: 16, symbol: 'S', name: 'Sulfur', mass: 32.06, category: 'nonmetal', group: 16, period: 3, electronConfig: '[Ne] 3s² 3p⁴' },
  { number: 17, symbol: 'Cl', name: 'Chlorine', mass: 35.45, category: 'halogen', group: 17, period: 3, electronConfig: '[Ne] 3s² 3p⁵' },
  { number: 18, symbol: 'Ar', name: 'Argon', mass: 39.948, category: 'noble_gas', group: 18, period: 3, electronConfig: '[Ne] 3s² 3p⁶' },
  { number: 19, symbol: 'K', name: 'Potassium', mass: 39.098, category: 'alkali_metal', group: 1, period: 4, electronConfig: '[Ar] 4s¹' },
  { number: 20, symbol: 'Ca', name: 'Calcium', mass: 40.078, category: 'alkaline_earth', group: 2, period: 4, electronConfig: '[Ar] 4s²' },
  { number: 26, symbol: 'Fe', name: 'Iron', mass: 55.845, category: 'transition_metal', group: 8, period: 4, electronConfig: '[Ar] 3d⁶ 4s²' },
  { number: 29, symbol: 'Cu', name: 'Copper', mass: 63.546, category: 'transition_metal', group: 11, period: 4, electronConfig: '[Ar] 3d¹⁰ 4s¹' },
  { number: 30, symbol: 'Zn', name: 'Zinc', mass: 65.38, category: 'transition_metal', group: 12, period: 4, electronConfig: '[Ar] 3d¹⁰ 4s²' },
  { number: 35, symbol: 'Br', name: 'Bromine', mass: 79.904, category: 'halogen', group: 17, period: 4, electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁵' },
  { number: 47, symbol: 'Ag', name: 'Silver', mass: 107.87, category: 'transition_metal', group: 11, period: 5, electronConfig: '[Kr] 4d¹⁰ 5s¹' },
  { number: 79, symbol: 'Au', name: 'Gold', mass: 196.97, category: 'transition_metal', group: 11, period: 6, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹' },
];

export const CATEGORY_COLORS: Record<string, string> = {
  nonmetal: '#3B82F6',
  noble_gas: '#8B5CF6',
  alkali_metal: '#EF4444',
  alkaline_earth: '#F97316',
  metalloid: '#10B981',
  halogen: '#F59E0B',
  transition_metal: '#06B6D4',
  post_transition_metal: '#6366F1',
  lanthanide: '#EC4899',
  actinide: '#D946EF',
};

