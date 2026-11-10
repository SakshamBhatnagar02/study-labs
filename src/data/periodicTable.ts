import type { PeriodicElement, PeriodicGroupInfo } from '../types';

export const PERIODIC_TABLE: PeriodicElement[] = [
  // Period 1
  { number: 1, symbol: 'H', name: 'Hydrogen', mass: 1.008, category: 'nonmetal', group: 1, period: 1, electronConfig: '1s¹' },
  { number: 2, symbol: 'He', name: 'Helium', mass: 4.0026, category: 'noble_gas', group: 18, period: 1, electronConfig: '1s²' },

  // Period 2
  { number: 3, symbol: 'Li', name: 'Lithium', mass: 6.94, category: 'alkali_metal', group: 1, period: 2, electronConfig: '[He] 2s¹' },
  { number: 4, symbol: 'Be', name: 'Beryllium', mass: 9.0122, category: 'alkaline_earth', group: 2, period: 2, electronConfig: '[He] 2s²' },
  { number: 5, symbol: 'B', name: 'Boron', mass: 10.81, category: 'metalloid', group: 13, period: 2, electronConfig: '[He] 2s² 2p¹' },
  { number: 6, symbol: 'C', name: 'Carbon', mass: 12.011, category: 'nonmetal', group: 14, period: 2, electronConfig: '[He] 2s² 2p²' },
  { number: 7, symbol: 'N', name: 'Nitrogen', mass: 14.007, category: 'nonmetal', group: 15, period: 2, electronConfig: '[He] 2s² 2p³' },
  { number: 8, symbol: 'O', name: 'Oxygen', mass: 15.999, category: 'nonmetal', group: 16, period: 2, electronConfig: '[He] 2s² 2p⁴' },
  { number: 9, symbol: 'F', name: 'Fluorine', mass: 18.998, category: 'halogen', group: 17, period: 2, electronConfig: '[He] 2s² 2p⁵' },
  { number: 10, symbol: 'Ne', name: 'Neon', mass: 20.180, category: 'noble_gas', group: 18, period: 2, electronConfig: '[He] 2s² 2p⁶' },

  // Period 3
  { number: 11, symbol: 'Na', name: 'Sodium', mass: 22.990, category: 'alkali_metal', group: 1, period: 3, electronConfig: '[Ne] 3s¹' },
  { number: 12, symbol: 'Mg', name: 'Magnesium', mass: 24.305, category: 'alkaline_earth', group: 2, period: 3, electronConfig: '[Ne] 3s²' },
  { number: 13, symbol: 'Al', name: 'Aluminium', mass: 26.982, category: 'post_transition_metal', group: 13, period: 3, electronConfig: '[Ne] 3s² 3p¹' },
  { number: 14, symbol: 'Si', name: 'Silicon', mass: 28.085, category: 'metalloid', group: 14, period: 3, electronConfig: '[Ne] 3s² 3p²' },
  { number: 15, symbol: 'P', name: 'Phosphorus', mass: 30.974, category: 'nonmetal', group: 15, period: 3, electronConfig: '[Ne] 3s² 3p³' },
  { number: 16, symbol: 'S', name: 'Sulfur', mass: 32.06, category: 'nonmetal', group: 16, period: 3, electronConfig: '[Ne] 3s² 3p⁴' },
  { number: 17, symbol: 'Cl', name: 'Chlorine', mass: 35.45, category: 'halogen', group: 17, period: 3, electronConfig: '[Ne] 3s² 3p⁵' },
  { number: 18, symbol: 'Ar', name: 'Argon', mass: 39.948, category: 'noble_gas', group: 18, period: 3, electronConfig: '[Ne] 3s² 3p⁶' },

  // Period 4
  { number: 19, symbol: 'K', name: 'Potassium', mass: 39.098, category: 'alkali_metal', group: 1, period: 4, electronConfig: '[Ar] 4s¹' },
  { number: 20, symbol: 'Ca', name: 'Calcium', mass: 40.078, category: 'alkaline_earth', group: 2, period: 4, electronConfig: '[Ar] 4s²' },
  { number: 21, symbol: 'Sc', name: 'Scandium', mass: 44.956, category: 'transition_metal', group: 3, period: 4, electronConfig: '[Ar] 3d¹ 4s²' },
  { number: 22, symbol: 'Ti', name: 'Titanium', mass: 47.867, category: 'transition_metal', group: 4, period: 4, electronConfig: '[Ar] 3d² 4s²' },
  { number: 23, symbol: 'V', name: 'Vanadium', mass: 50.942, category: 'transition_metal', group: 5, period: 4, electronConfig: '[Ar] 3d³ 4s²' },
  { number: 24, symbol: 'Cr', name: 'Chromium', mass: 51.996, category: 'transition_metal', group: 6, period: 4, electronConfig: '[Ar] 3d⁵ 4s¹' },
  { number: 25, symbol: 'Mn', name: 'Manganese', mass: 54.938, category: 'transition_metal', group: 7, period: 4, electronConfig: '[Ar] 3d⁵ 4s²' },
  { number: 26, symbol: 'Fe', name: 'Iron', mass: 55.845, category: 'transition_metal', group: 8, period: 4, electronConfig: '[Ar] 3d⁶ 4s²' },
  { number: 27, symbol: 'Co', name: 'Cobalt', mass: 58.933, category: 'transition_metal', group: 9, period: 4, electronConfig: '[Ar] 3d⁷ 4s²' },
  { number: 28, symbol: 'Ni', name: 'Nickel', mass: 58.693, category: 'transition_metal', group: 10, period: 4, electronConfig: '[Ar] 3d⁸ 4s²' },
  { number: 29, symbol: 'Cu', name: 'Copper', mass: 63.546, category: 'transition_metal', group: 11, period: 4, electronConfig: '[Ar] 3d¹⁰ 4s¹' },
  { number: 30, symbol: 'Zn', name: 'Zinc', mass: 65.38, category: 'transition_metal', group: 12, period: 4, electronConfig: '[Ar] 3d¹⁰ 4s²' },
  { number: 31, symbol: 'Ga', name: 'Gallium', mass: 69.723, category: 'post_transition_metal', group: 13, period: 4, electronConfig: '[Ar] 3d¹⁰ 4s² 4p¹' },
  { number: 32, symbol: 'Ge', name: 'Germanium', mass: 72.630, category: 'metalloid', group: 14, period: 4, electronConfig: '[Ar] 3d¹⁰ 4s² 4p²' },
  { number: 33, symbol: 'As', name: 'Arsenic', mass: 74.922, category: 'metalloid', group: 15, period: 4, electronConfig: '[Ar] 3d¹⁰ 4s² 4p³' },
  { number: 34, symbol: 'Se', name: 'Selenium', mass: 78.971, category: 'nonmetal', group: 16, period: 4, electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁴' },
  { number: 35, symbol: 'Br', name: 'Bromine', mass: 79.904, category: 'halogen', group: 17, period: 4, electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁵' },
  { number: 36, symbol: 'Kr', name: 'Krypton', mass: 83.798, category: 'noble_gas', group: 18, period: 4, electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁶' },

  // Period 5
  { number: 37, symbol: 'Rb', name: 'Rubidium', mass: 85.468, category: 'alkali_metal', group: 1, period: 5, electronConfig: '[Kr] 5s¹' },
  { number: 38, symbol: 'Sr', name: 'Strontium', mass: 87.62, category: 'alkaline_earth', group: 2, period: 5, electronConfig: '[Kr] 5s²' },
  { number: 39, symbol: 'Y', name: 'Yttrium', mass: 88.906, category: 'transition_metal', group: 3, period: 5, electronConfig: '[Kr] 4d¹ 5s²' },
  { number: 40, symbol: 'Zr', name: 'Zirconium', mass: 91.224, category: 'transition_metal', group: 4, period: 5, electronConfig: '[Kr] 4d² 5s²' },
  { number: 41, symbol: 'Nb', name: 'Niobium', mass: 92.906, category: 'transition_metal', group: 5, period: 5, electronConfig: '[Kr] 4d⁴ 5s¹' },
  { number: 42, symbol: 'Mo', name: 'Molybdenum', mass: 95.95, category: 'transition_metal', group: 6, period: 5, electronConfig: '[Kr] 4d⁵ 5s¹' },
  { number: 43, symbol: 'Tc', name: 'Technetium', mass: 98, category: 'transition_metal', group: 7, period: 5, electronConfig: '[Kr] 4d⁵ 5s²' },
  { number: 44, symbol: 'Ru', name: 'Ruthenium', mass: 101.07, category: 'transition_metal', group: 8, period: 5, electronConfig: '[Kr] 4d⁷ 5s¹' },
  { number: 45, symbol: 'Rh', name: 'Rhodium', mass: 102.91, category: 'transition_metal', group: 9, period: 5, electronConfig: '[Kr] 4d⁸ 5s¹' },
  { number: 46, symbol: 'Pd', name: 'Palladium', mass: 106.42, category: 'transition_metal', group: 10, period: 5, electronConfig: '[Kr] 4d¹⁰' },
  { number: 47, symbol: 'Ag', name: 'Silver', mass: 107.87, category: 'transition_metal', group: 11, period: 5, electronConfig: '[Kr] 4d¹⁰ 5s¹' },
  { number: 48, symbol: 'Cd', name: 'Cadmium', mass: 112.41, category: 'transition_metal', group: 12, period: 5, electronConfig: '[Kr] 4d¹⁰ 5s²' },
  { number: 49, symbol: 'In', name: 'Indium', mass: 114.82, category: 'post_transition_metal', group: 13, period: 5, electronConfig: '[Kr] 4d¹⁰ 5s² 5p¹' },
  { number: 50, symbol: 'Sn', name: 'Tin', mass: 118.71, category: 'post_transition_metal', group: 14, period: 5, electronConfig: '[Kr] 4d¹⁰ 5s² 5p²' },
  { number: 51, symbol: 'Sb', name: 'Antimony', mass: 121.76, category: 'metalloid', group: 15, period: 5, electronConfig: '[Kr] 4d¹⁰ 5s² 5p³' },
  { number: 52, symbol: 'Te', name: 'Tellurium', mass: 127.60, category: 'metalloid', group: 16, period: 5, electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁴' },
  { number: 53, symbol: 'I', name: 'Iodine', mass: 126.90, category: 'halogen', group: 17, period: 5, electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁵' },
  { number: 54, symbol: 'Xe', name: 'Xenon', mass: 131.29, category: 'noble_gas', group: 18, period: 5, electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁶' },

  // Period 6 (including Lanthanides 57-71)
  { number: 55, symbol: 'Cs', name: 'Cesium', mass: 132.91, category: 'alkali_metal', group: 1, period: 6, electronConfig: '[Xe] 6s¹' },
  { number: 56, symbol: 'Ba', name: 'Barium', mass: 137.33, category: 'alkaline_earth', group: 2, period: 6, electronConfig: '[Xe] 6s²' },
  { number: 57, symbol: 'La', name: 'Lanthanum', mass: 138.91, category: 'lanthanide', group: 3, period: 6, electronConfig: '[Xe] 5d¹ 6s²' },
  { number: 58, symbol: 'Ce', name: 'Cerium', mass: 140.12, category: 'lanthanide', group: 3, period: 6, electronConfig: '[Xe] 4f¹ 5d¹ 6s²' },
  { number: 59, symbol: 'Pr', name: 'Praseodymium', mass: 140.91, category: 'lanthanide', group: 3, period: 6, electronConfig: '[Xe] 4f³ 6s²' },
  { number: 60, symbol: 'Nd', name: 'Neodymium', mass: 144.24, category: 'lanthanide', group: 3, period: 6, electronConfig: '[Xe] 4f⁴ 6s²' },
  { number: 61, symbol: 'Pm', name: 'Promethium', mass: 145, category: 'lanthanide', group: 3, period: 6, electronConfig: '[Xe] 4f⁵ 6s²' },
  { number: 62, symbol: 'Sm', name: 'Samarium', mass: 150.36, category: 'lanthanide', group: 3, period: 6, electronConfig: '[Xe] 4f⁶ 6s²' },
  { number: 63, symbol: 'Eu', name: 'Europium', mass: 151.96, category: 'lanthanide', group: 3, period: 6, electronConfig: '[Xe] 4f⁷ 6s²' },
  { number: 64, symbol: 'Gd', name: 'Gadolinium', mass: 157.25, category: 'lanthanide', group: 3, period: 6, electronConfig: '[Xe] 4f⁷ 5d¹ 6s²' },
  { number: 65, symbol: 'Tb', name: 'Terbium', mass: 158.93, category: 'lanthanide', group: 3, period: 6, electronConfig: '[Xe] 4f⁹ 6s²' },
  { number: 66, symbol: 'Dy', name: 'Dysprosium', mass: 162.50, category: 'lanthanide', group: 3, period: 6, electronConfig: '[Xe] 4f¹⁰ 6s²' },
  { number: 67, symbol: 'Ho', name: 'Holmium', mass: 164.93, category: 'lanthanide', group: 3, period: 6, electronConfig: '[Xe] 4f¹¹ 6s²' },
  { number: 68, symbol: 'Er', name: 'Erbium', mass: 167.26, category: 'lanthanide', group: 3, period: 6, electronConfig: '[Xe] 4f¹² 6s²' },
  { number: 69, symbol: 'Tm', name: 'Thulium', mass: 168.93, category: 'lanthanide', group: 3, period: 6, electronConfig: '[Xe] 4f¹³ 6s²' },
  { number: 70, symbol: 'Yb', name: 'Ytterbium', mass: 173.05, category: 'lanthanide', group: 3, period: 6, electronConfig: '[Xe] 4f¹⁴ 6s²' },
  { number: 71, symbol: 'Lu', name: 'Lutetium', mass: 174.97, category: 'lanthanide', group: 3, period: 6, electronConfig: '[Xe] 4f¹⁴ 5d¹ 6s²' },
  { number: 72, symbol: 'Hf', name: 'Hafnium', mass: 178.49, category: 'transition_metal', group: 4, period: 6, electronConfig: '[Xe] 4f¹⁴ 5d² 6s²' },
  { number: 73, symbol: 'Ta', name: 'Tantalum', mass: 180.95, category: 'transition_metal', group: 5, period: 6, electronConfig: '[Xe] 4f¹⁴ 5d³ 6s²' },
  { number: 74, symbol: 'W', name: 'Tungsten', mass: 183.84, category: 'transition_metal', group: 6, period: 6, electronConfig: '[Xe] 4f¹⁴ 5d⁴ 6s²' },
  { number: 75, symbol: 'Re', name: 'Rhenium', mass: 186.21, category: 'transition_metal', group: 7, period: 6, electronConfig: '[Xe] 4f¹⁴ 5d⁵ 6s²' },
  { number: 76, symbol: 'Os', name: 'Osmium', mass: 190.23, category: 'transition_metal', group: 8, period: 6, electronConfig: '[Xe] 4f¹⁴ 5d⁶ 6s²' },
  { number: 77, symbol: 'Ir', name: 'Iridium', mass: 192.22, category: 'transition_metal', group: 9, period: 6, electronConfig: '[Xe] 4f¹⁴ 5d⁷ 6s²' },
  { number: 78, symbol: 'Pt', name: 'Platinum', mass: 195.08, category: 'transition_metal', group: 10, period: 6, electronConfig: '[Xe] 4f¹⁴ 5d⁹ 6s¹' },
  { number: 79, symbol: 'Au', name: 'Gold', mass: 196.97, category: 'transition_metal', group: 11, period: 6, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹' },
  { number: 80, symbol: 'Hg', name: 'Mercury', mass: 200.59, category: 'transition_metal', group: 12, period: 6, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s²' },
  { number: 81, symbol: 'Tl', name: 'Thallium', mass: 204.38, category: 'post_transition_metal', group: 13, period: 6, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹' },
  { number: 82, symbol: 'Pb', name: 'Lead', mass: 207.2, category: 'post_transition_metal', group: 14, period: 6, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²' },
  { number: 83, symbol: 'Bi', name: 'Bismuth', mass: 208.98, category: 'post_transition_metal', group: 15, period: 6, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³' },
  { number: 84, symbol: 'Po', name: 'Polonium', mass: 209, category: 'post_transition_metal', group: 16, period: 6, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴' },
  { number: 85, symbol: 'At', name: 'Astatine', mass: 210, category: 'halogen', group: 17, period: 6, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵' },
  { number: 86, symbol: 'Rn', name: 'Radon', mass: 222, category: 'noble_gas', group: 18, period: 6, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶' },

  // Period 7 (including Actinides 89-103)
  { number: 87, symbol: 'Fr', name: 'Francium', mass: 223, category: 'alkali_metal', group: 1, period: 7, electronConfig: '[Rn] 7s¹' },
  { number: 88, symbol: 'Ra', name: 'Radium', mass: 226, category: 'alkaline_earth', group: 2, period: 7, electronConfig: '[Rn] 7s²' },
  { number: 89, symbol: 'Ac', name: 'Actinium', mass: 227, category: 'actinide', group: 3, period: 7, electronConfig: '[Rn] 6d¹ 7s²' },
  { number: 90, symbol: 'Th', name: 'Thorium', mass: 232.04, category: 'actinide', group: 3, period: 7, electronConfig: '[Rn] 6d² 7s²' },
  { number: 91, symbol: 'Pa', name: 'Protactinium', mass: 231.04, category: 'actinide', group: 3, period: 7, electronConfig: '[Rn] 5f² 6d¹ 7s²' },
  { number: 92, symbol: 'U', name: 'Uranium', mass: 238.03, category: 'actinide', group: 3, period: 7, electronConfig: '[Rn] 5f³ 6d¹ 7s²' },
  { number: 93, symbol: 'Np', name: 'Neptunium', mass: 237, category: 'actinide', group: 3, period: 7, electronConfig: '[Rn] 5f⁴ 6d¹ 7s²' },
  { number: 94, symbol: 'Pu', name: 'Plutonium', mass: 244, category: 'actinide', group: 3, period: 7, electronConfig: '[Rn] 5f⁶ 7s²' },
  { number: 95, symbol: 'Am', name: 'Americium', mass: 243, category: 'actinide', group: 3, period: 7, electronConfig: '[Rn] 5f⁷ 7s²' },
  { number: 96, symbol: 'Cm', name: 'Curium', mass: 247, category: 'actinide', group: 3, period: 7, electronConfig: '[Rn] 5f⁷ 6d¹ 7s²' },
  { number: 97, symbol: 'Bk', name: 'Berkelium', mass: 247, category: 'actinide', group: 3, period: 7, electronConfig: '[Rn] 5f⁹ 7s²' },
  { number: 98, symbol: 'Cf', name: 'Californium', mass: 251, category: 'actinide', group: 3, period: 7, electronConfig: '[Rn] 5f¹⁰ 7s²' },
  { number: 99, symbol: 'Es', name: 'Einsteinium', mass: 252, category: 'actinide', group: 3, period: 7, electronConfig: '[Rn] 5f¹¹ 7s²' },
  { number: 100, symbol: 'Fm', name: 'Fermium', mass: 257, category: 'actinide', group: 3, period: 7, electronConfig: '[Rn] 5f¹² 7s²' },
  { number: 101, symbol: 'Md', name: 'Mendelevium', mass: 258, category: 'actinide', group: 3, period: 7, electronConfig: '[Rn] 5f¹³ 7s²' },
  { number: 102, symbol: 'No', name: 'Nobelium', mass: 259, category: 'actinide', group: 3, period: 7, electronConfig: '[Rn] 5f¹⁴ 7s²' },
  { number: 103, symbol: 'Lr', name: 'Lawrencium', mass: 266, category: 'actinide', group: 3, period: 7, electronConfig: '[Rn] 5f¹⁴ 7s² 7p¹' },
  { number: 104, symbol: 'Rf', name: 'Rutherfordium', mass: 267, category: 'transition_metal', group: 4, period: 7, electronConfig: '[Rn] 5f¹⁴ 6d² 7s²' },
  { number: 105, symbol: 'Db', name: 'Dubnium', mass: 268, category: 'transition_metal', group: 5, period: 7, electronConfig: '[Rn] 5f¹⁴ 6d³ 7s²' },
  { number: 106, symbol: 'Sg', name: 'Seaborgium', mass: 269, category: 'transition_metal', group: 6, period: 7, electronConfig: '[Rn] 5f¹⁴ 6d⁴ 7s²' },
  { number: 107, symbol: 'Bh', name: 'Bohrium', mass: 270, category: 'transition_metal', group: 7, period: 7, electronConfig: '[Rn] 5f¹⁴ 6d⁵ 7s²' },
  { number: 108, symbol: 'Hs', name: 'Hassium', mass: 277, category: 'transition_metal', group: 8, period: 7, electronConfig: '[Rn] 5f¹⁴ 6d⁶ 7s²' },
  { number: 109, symbol: 'Mt', name: 'Meitnerium', mass: 278, category: 'transition_metal', group: 9, period: 7, electronConfig: '[Rn] 5f¹⁴ 6d⁷ 7s²' },
  { number: 110, symbol: 'Ds', name: 'Darmstadtium', mass: 281, category: 'transition_metal', group: 10, period: 7, electronConfig: '[Rn] 5f¹⁴ 6d⁹ 7s¹' },
  { number: 111, symbol: 'Rg', name: 'Roentgenium', mass: 282, category: 'transition_metal', group: 11, period: 7, electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s¹' },
  { number: 112, symbol: 'Cn', name: 'Copernicium', mass: 285, category: 'transition_metal', group: 12, period: 7, electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s²' },
  { number: 113, symbol: 'Nh', name: 'Nihonium', mass: 286, category: 'post_transition_metal', group: 13, period: 7, electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹' },
  { number: 114, symbol: 'Fl', name: 'Flerovium', mass: 289, category: 'post_transition_metal', group: 14, period: 7, electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²' },
  { number: 115, symbol: 'Mc', name: 'Moscovium', mass: 290, category: 'post_transition_metal', group: 15, period: 7, electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³' },
  { number: 116, symbol: 'Lv', name: 'Livermorium', mass: 293, category: 'post_transition_metal', group: 16, period: 7, electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴' },
  { number: 117, symbol: 'Ts', name: 'Tennessine', mass: 294, category: 'halogen', group: 17, period: 7, electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵' },
  { number: 118, symbol: 'Og', name: 'Oganesson', mass: 294, category: 'noble_gas', group: 18, period: 7, electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶' },
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

export const CATEGORY_LABELS: Record<string, string> = {
  nonmetal: 'Nonmetal',
  noble_gas: 'Noble Gas',
  alkali_metal: 'Alkali Metal',
  alkaline_earth: 'Alkaline Earth',
  metalloid: 'Metalloid',
  halogen: 'Halogen',
  transition_metal: 'Transition Metal',
  post_transition_metal: 'Post-Transition',
  lanthanide: 'Lanthanide',
  actinide: 'Actinide',
};

const ELEMENT_BY_SYMBOL: Record<string, PeriodicElement> = PERIODIC_TABLE.reduce(
  (acc, el) => {
    acc[el.symbol] = el;
    return acc;
  },
  {} as Record<string, PeriodicElement>
);

export interface MolarMassBreakdownItem {
  symbol: string;
  name: string;
  count: number;
  atomicMass: number;
  subtotal: number;
}

export interface MolarMassResult {
  success: boolean;
  formula: string;
  molarMass?: number;
  breakdown?: MolarMassBreakdownItem[];
  error?: string;
}

function parseFormulaSegment(segment: string): Record<string, number> {
  const stack: Array<Record<string, number>> = [{}];
  let i = 0;

  while (i < segment.length) {
    const ch = segment[i];
    if (ch === '(' || ch === '[') {
      stack.push({});
      i++;
    } else if (ch === ')' || ch === ']') {
      if (stack.length <= 1) {
        throw new Error('Unmatched closing bracket in chemical formula');
      }
      i++;
      let multStr = '';
      while (i < segment.length && /[0-9]/.test(segment[i])) {
        multStr += segment[i++];
      }
      const mult = multStr ? parseInt(multStr, 10) : 1;
      const groupCounts = stack.pop()!;
      const top = stack[stack.length - 1];
      for (const [sym, cnt] of Object.entries(groupCounts)) {
        top[sym] = (top[sym] || 0) + cnt * mult;
      }
    } else if (/[A-Z]/.test(ch)) {
      let sym = ch;
      i++;
      while (i < segment.length && /[a-z]/.test(segment[i])) {
        sym += segment[i++];
      }
      if (!ELEMENT_BY_SYMBOL[sym]) {
        throw new Error(`Unknown element symbol "${sym}"`);
      }
      let cntStr = '';
      while (i < segment.length && /[0-9]/.test(segment[i])) {
        cntStr += segment[i++];
      }
      const count = cntStr ? parseInt(cntStr, 10) : 1;
      const top = stack[stack.length - 1];
      top[sym] = (top[sym] || 0) + count;
    } else if (/\s/.test(ch)) {
      i++;
    } else {
      throw new Error(`Unexpected character "${ch}" in formula`);
    }
  }

  if (stack.length !== 1) {
    throw new Error('Unclosed parenthesis in chemical formula');
  }
  return stack[0];
}

/**
 * Computes exact molar mass (g/mol) from a formula like `H2SO4`, `Ca(OH)2`,
 * `Al2(SO4)3`, or hydrates like `CuSO4.5H2O` / `CuSO4·5H2O`.
 */
export function calculateMolarMass(rawFormula: string): MolarMassResult {
  const trimmed = (rawFormula || '').trim();
  if (!trimmed) {
    return { success: false, formula: '', error: 'Enter a chemical formula (e.g. H2SO4, Ca(OH)2)' };
  }

  try {
    const parts = trimmed.split(/[·.*]/).map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) {
      return { success: false, formula: trimmed, error: 'Empty formula' };
    }

    const totalCounts: Record<string, number> = {};
    for (const part of parts) {
      const leadMatch = part.match(/^(\d+)\s*(.+)$/);
      const coeff = leadMatch ? parseInt(leadMatch[1], 10) : 1;
      const segFormula = leadMatch ? leadMatch[2] : part;
      const counts = parseFormulaSegment(segFormula);
      for (const [sym, cnt] of Object.entries(counts)) {
        totalCounts[sym] = (totalCounts[sym] || 0) + cnt * coeff;
      }
    }

    const breakdown: MolarMassBreakdownItem[] = Object.entries(totalCounts).map(([sym, count]) => {
      const el = ELEMENT_BY_SYMBOL[sym];
      const subtotal = parseFloat((el.mass * count).toFixed(4));
      return {
        symbol: sym,
        name: el.name,
        count,
        atomicMass: el.mass,
        subtotal,
      };
    });

    const molarMass = parseFloat(
      breakdown.reduce((sum, item) => sum + item.atomicMass * item.count, 0).toFixed(3)
    );

    return {
      success: true,
      formula: trimmed,
      molarMass,
      breakdown,
    };
  } catch (err: any) {
    return {
      success: false,
      formula: trimmed,
      error: err?.message || 'Invalid chemical formula syntax',
    };
  }
}

export const PERIODIC_GROUPS: Record<number, PeriodicGroupInfo> = {
  1: {
    groupNumber: 1,
    id: 'group_1',
    iupacGroup: 'Group 1',
    casGroup: 'IA',
    familyName: 'Alkali Metals (and Hydrogen)',
    block: 's-block',
    valenceShell: 'ns¹',
    commonOxidationStates: '+1 (H also -1 in hydrides)',
    bondingCharacter: 'Strongly ionic (H is covalent)',
    periodicTrends: 'Atomic radius, reactivity, and reducing power increase sharply from Li to Cs; ionization enthalpy decreases down the group.',
    keyProperties: [
      'Lowest first ionization enthalpy in each period; soft metals cuttable with a knife (Li–Cs).',
      'React vigorously with cold water releasing H₂ gas and strongly alkaline hydroxides (MOH).',
      'Characteristic flame test colors: Li (crimson), Na (golden yellow), K (lilac), Rb (red-violet), Cs (blue).',
    ],
    signatureCompounds: ['NaCl', 'NaOH', 'KOH', 'Li₂CO₃', 'Na₂CO₃·10H₂O'],
  },
  2: {
    groupNumber: 2,
    id: 'group_2',
    iupacGroup: 'Group 2',
    casGroup: 'IIA',
    familyName: 'Alkaline Earth Metals',
    block: 's-block',
    valenceShell: 'ns²',
    commonOxidationStates: '+2',
    bondingCharacter: 'Ionic (Be forms covalent bonds due to high polarizing power)',
    periodicTrends: 'Hydroxide solubility and thermal stability of carbonates/nitrates increase down the group; sulfate solubility decreases from BeSO₄ to BaSO₄.',
    keyProperties: [
      'Higher density, hardness, and melting points than Group 1 counterparts.',
      'Be shows diagonal relationship with Al (BeO and Al₂O₃ are both amphoteric).',
      'Flame colors: Ca (brick red), Sr (crimson red), Ba (apple green); Be & Mg show no flame color.',
    ],
    signatureCompounds: ['CaCO₃', 'Ca(OH)₂', 'MgSO₄·7H₂O', 'BaSO₄', 'CaSO₄·½H₂O'],
  },
  3: {
    groupNumber: 3,
    id: 'group_3',
    iupacGroup: 'Group 3',
    casGroup: 'IIIB',
    familyName: 'Scandium Group & Rare Earths',
    block: 'd-block / f-block',
    valenceShell: '(n-1)d¹ ns²',
    commonOxidationStates: '+3',
    bondingCharacter: 'Predominantly ionic (trivalent M³⁺)',
    periodicTrends: 'Steady decrease in M³⁺ ionic radius across Lanthanides (Lanthanide Contraction) causes Zr/Hf and Nb/Ta pairs to share nearly identical radii.',
    keyProperties: [
      'Gateway group bridging s-block and transition metals; houses the 4f Lanthanide and 5f Actinide series.',
      'All Group 3 members form basic M₂O₃ sesquioxides and paramagnetically active f-block ions.',
    ],
    signatureCompounds: ['Sc₂O₃', 'Y₂O₃', 'LaCl₃', 'YBa₂Cu₃O₇ (YBCO)'],
  },
  4: {
    groupNumber: 4,
    id: 'group_4',
    iupacGroup: 'Group 4',
    casGroup: 'IVB',
    familyName: 'Titanium Group',
    block: 'd-block',
    valenceShell: '(n-1)d² ns²',
    commonOxidationStates: '+4, +3',
    bondingCharacter: 'Covalent in tetrahalides (TiCl₄), ionic in oxides',
    periodicTrends: 'Zr and Hf have almost identical atomic radii (160 pm vs 159 pm) due to poor 4f shielding (lanthanide contraction).',
    keyProperties: [
      'Lightweight, high-strength, corrosion-resistant refractory metals used in aerospace & biomedical implants.',
      'TiO₂ is the premier white pigment and photocatalyst; TiCl₄ is a Ziegler-Natta polymerization co-catalyst.',
    ],
    signatureCompounds: ['TiO₂', 'TiCl₄', 'ZrO₂', 'ZrSiO₄', 'HfO₂'],
  },
  5: {
    groupNumber: 5,
    id: 'group_5',
    iupacGroup: 'Group 5',
    casGroup: 'VB',
    familyName: 'Vanadium Group',
    block: 'd-block',
    valenceShell: '(n-1)d³ ns²',
    commonOxidationStates: '+5, +4, +3, +2',
    bondingCharacter: 'Ionic at low oxidation states; acidic/covalent at +5',
    periodicTrends: 'Stability of the maximum +5 oxidation state increases sharply down the group (V < Nb < Ta).',
    keyProperties: [
      'Aqueous vanadium displays vivid oxidation colors: V²⁺ (violet), V³⁺ (green), VO²⁺ (blue), VO₂⁺ (yellow).',
      'V₂O₅ is an essential heterogeneous catalyst for SO₂ -> SO₃ oxidation in the Contact Process.',
    ],
    signatureCompounds: ['V₂O₅', 'NH₄VO₃', 'Nb₂O₅', 'TaC'],
  },
  6: {
    groupNumber: 6,
    id: 'group_6',
    iupacGroup: 'Group 6',
    casGroup: 'VIB',
    familyName: 'Chromium Group',
    block: 'd-block',
    valenceShell: '(n-1)d⁵ ns¹ (Cr, Mo) / 5d⁴ 6s² (W)',
    commonOxidationStates: '+6, +3, +2',
    bondingCharacter: 'Amphoteric/basic at +3; acidic & strongly oxidizing at +6',
    periodicTrends: 'Cr(VI) in Cr₂O₇²⁻ is a strong oxidizing agent, whereas Mo(VI) and W(VI) are far more stable against reduction.',
    keyProperties: [
      'Half-filled d⁵ configuration in Cr (3d⁵ 4s¹) and Mo (4d⁵ 5s¹) grants extra exchange stability.',
      'Cr₂O₇²⁻ (orange in acid) reversibly converts to CrO₄²⁻ (yellow in base). Tungsten has the highest melting point of all metals (3422 °C).',
    ],
    signatureCompounds: ['K₂Cr₂O₇', 'K₂CrO₄', 'CrO₃', 'MoS₂', 'WC'],
  },
  7: {
    groupNumber: 7,
    id: 'group_7',
    iupacGroup: 'Group 7',
    casGroup: 'VIIB',
    familyName: 'Manganese Group',
    block: 'd-block',
    valenceShell: '(n-1)d⁵ ns²',
    commonOxidationStates: '+7, +6, +4, +2',
    bondingCharacter: 'Ionic (Mn²⁺) to covalently bonded oxoanions (MnO₄⁻)',
    periodicTrends: 'Mn exhibits the widest array of common oxidation states in the 3d series (+2 to +7); +2 is most stable in acid due to d⁵ half-filled subshell.',
    keyProperties: [
      'Permanganate (MnO₄⁻, +7, deep purple) is a powerful oxidizer reducing to Mn²⁺ in acid and MnO₂ in neutral/faintly basic medium.',
      'Technetium (Tc, #43) is the lightest element with no stable isotopes; ⁹⁹ᵐTc is vital in medical imaging.',
    ],
    signatureCompounds: ['KMnO₄', 'MnO₂', 'MnSO₄', 'K₂MnO₄', 'Re₂O₇'],
  },
  8: {
    groupNumber: 8,
    id: 'group_8',
    iupacGroup: 'Group 8',
    casGroup: 'VIIIB',
    familyName: 'Iron Group',
    block: 'd-block',
    valenceShell: '(n-1)d⁶ ns²',
    commonOxidationStates: '+2, +3 (+8 in RuO₄ / OsO₄)',
    bondingCharacter: 'Mixed metallic, ionic, and pi-backbonded organometallic',
    periodicTrends: 'Group maxima reach +8 in RuO₄ and OsO₄, while Iron prefers +2 and +3; Osmium and Iridium are the densest natural elements.',
    keyProperties: [
      'Fe is the biological oxygen carrier in hemoglobin (Fe²⁺) and the industrial catalyst in Haber ammonia synthesis.',
      'OsO₄ achieves the classic cis-dihydroxylation of alkenes (syn diol formation).',
    ],
    signatureCompounds: ['Fe₂O₃', 'Fe₃O₄', 'K₄[Fe(CN)₆]', 'RuCl₃', 'OsO₄'],
  },
  9: {
    groupNumber: 9,
    id: 'group_9',
    iupacGroup: 'Group 9',
    casGroup: 'VIIIB',
    familyName: 'Cobalt Group',
    block: 'd-block',
    valenceShell: '(n-1)d⁷ ns²',
    commonOxidationStates: '+3, +2, +1',
    bondingCharacter: 'Rich Octahedral & Square-Planar Coordination Complexes',
    periodicTrends: 'Heavier congeners Rh and Ir strongly favor noble metallic resistance and catalytic C-H activation/hydrogenation.',
    keyProperties: [
      'Cobalt forms classic Werner coordination complexes ([Co(NH₃)₆]Cl₃) and sits at the core of Vitamin B₁₂.',
      'Wilkinson catalyst RhCl(PPh₃)₃ selectively hydrogenates alkenes under mild conditions.',
    ],
    signatureCompounds: ['CoCl₂·6H₂O', '[Co(NH₃)₆]Cl₃', 'RhCl(PPh₃)₃', 'IrCl₃'],
  },
  10: {
    groupNumber: 10,
    id: 'group_10',
    iupacGroup: 'Group 10',
    casGroup: 'VIIIB',
    familyName: 'Nickel Group',
    block: 'd-block',
    valenceShell: '(n-1)d⁸ ns² (Pd: 4d¹⁰)',
    commonOxidationStates: '+2, +4, 0 (in carbonyls)',
    bondingCharacter: 'Square-planar d⁸ coordination & strong metal-ligand pi-backbonding',
    periodicTrends: 'd⁸ ions of heavier metals (Pd²⁺, Pt²⁺) almost universally form square-planar complexes due to large crystal-field splitting Δ.',
    keyProperties: [
      'Nickel, Palladium, and Platinum are premier catalytic metals for alkene hydrogenation, catalytic converters, and Suzuki/Heck cross-coupling.',
      'Cisplatin cis-[Pt(NH₃)₂Cl₂] is a landmark square-planar chemotherapy agent.',
    ],
    signatureCompounds: ['Ni(CO)₄', '[Ni(DMG)₂]', 'PdCl₂', 'cis-[Pt(NH₃)₂Cl₂]'],
  },
  11: {
    groupNumber: 11,
    id: 'group_11',
    iupacGroup: 'Group 11',
    casGroup: 'IB',
    familyName: 'Coinage Metals',
    block: 'd-block',
    valenceShell: '(n-1)d¹⁰ ns¹',
    commonOxidationStates: '+1, +2 (Cu), +3 (Au)',
    bondingCharacter: 'Soft Lewis acids (Ag⁺, Au⁺) & strong metallic bonding',
    periodicTrends: 'Standard reduction potential becomes strongly positive down the group (Cu²⁺/Cu +0.34 V < Ag⁺/Ag +0.80 V < Au³⁺/Au +1.50 V).',
    keyProperties: [
      'Full d¹⁰ core with single s¹ valence electron gives Silver, Copper, and Gold top electrical & thermal conductivity.',
      'Cu⁺ disproportionates in water (2Cu⁺ -> Cu²⁺ + Cu), making Cu²⁺ (blue hydrated ion) stable in aqueous solution.',
    ],
    signatureCompounds: ['CuSO₄·5H₂O', 'Cu₂O', 'AgNO₃', 'AgCl', 'HAuCl₄'],
  },
  12: {
    groupNumber: 12,
    id: 'group_12',
    iupacGroup: 'Group 12',
    casGroup: 'IIB',
    familyName: 'Zinc Group (Volatile Metals)',
    block: 'd-block (Pseudo-Main Group)',
    valenceShell: '(n-1)d¹⁰ ns²',
    commonOxidationStates: '+2 (+1 in Hg₂²⁺)',
    bondingCharacter: 'Ionic to significantly covalent; Hg²⁺ has strong soft-acid affinity',
    periodicTrends: 'Completely filled d¹⁰ subshell means minimal d-d metallic bonding -> low melting points (Hg is a liquid at STP, -38.8 °C).',
    keyProperties: [
      'Not classified as classic transition elements by IUPAC since neither the neutral atom nor +2 ion has an incomplete d-subshell.',
      'ZnO is amphoteric; Cd²⁺ & Hg²⁺ are heavy metal sulfide precipitants; Hg₂Cl₂ (Calomel) contains a covalent Hg–Hg dimer bond.',
    ],
    signatureCompounds: ['ZnO', 'ZnSO₄', 'CdS', 'HgCl₂', 'Hg₂Cl₂'],
  },
  13: {
    groupNumber: 13,
    id: 'group_13',
    iupacGroup: 'Group 13',
    casGroup: 'IIIA',
    familyName: 'Boron Group (Triels)',
    block: 'p-block',
    valenceShell: 'ns² np¹',
    commonOxidationStates: '+3, +1 (increases down group: Inert Pair Effect)',
    bondingCharacter: 'Electron-deficient covalent (B) -> ionic/metallic (In, Tl)',
    periodicTrends: 'Inert pair effect makes +1 far more stable than +3 for Thallium (Tl⁺ > Tl³⁺). Oxide character turns from acidic (B₂O₃) to amphoteric (Al₂O₃, Ga₂O₃) to basic (Tl₂O).',
    keyProperties: [
      'Trivalent halides like BF₃ and AlCl₃ act as classic electron-pair acceptors (Lewis acids) because they have only 6 valence electrons.',
      'Diborane (B₂H₆) features unique 3-center 2-electron banana bonds.',
    ],
    signatureCompounds: ['BF₃', 'B₂H₆', 'H₃BO₃', 'Na₂B₄O₇·10H₂O', 'Al₂O₃'],
  },
  14: {
    groupNumber: 14,
    id: 'group_14',
    iupacGroup: 'Group 14',
    casGroup: 'IVA',
    familyName: 'Carbon Group (Tetrels)',
    block: 'p-block',
    valenceShell: 'ns² np²',
    commonOxidationStates: '+4, +2 (-4 in carbides)',
    bondingCharacter: 'Catenated covalent networks (C, Si) -> ionic/metallic (Sn, Pb)',
    periodicTrends: 'Catenation decreases rapidly down the group (C >> Si > Ge ≈ Sn >> Pb). Pb(II) dominates over Pb(IV), making PbO₂ a strong oxidant.',
    keyProperties: [
      'Carbon alone forms strong pπ–pπ multiple bonds (C=C, C≡C, C=O) and diverse allotropes (diamond sp³, graphite sp², fullerenes).',
      'Silicon & Germanium are foundational semiconductors; Zeolites and Silicones build Si–O–Si frameworks.',
    ],
    signatureCompounds: ['CO₂', 'CH₄', 'SiO₂', 'SiC', 'Pb₃O₄'],
  },
  15: {
    groupNumber: 15,
    id: 'group_15',
    iupacGroup: 'Group 15',
    casGroup: 'VA',
    familyName: 'Nitrogen Group (Pnictogens)',
    block: 'p-block',
    valenceShell: 'ns² np³',
    commonOxidationStates: '-3, +3, +5 (N displays all -3 to +5)',
    bondingCharacter: 'Covalent molecular (N₂, P₄) -> metalloid/metallic (Sb, Bi)',
    periodicTrends: 'Hydride basicity & thermal stability decrease from NH₃ to BiH₃ while reducing power and acidity increase sharply.',
    keyProperties: [
      'Half-filled np³ shell produces unusually high first ionization enthalpy compared with Group 16 neighbors (N > O, P > S).',
      'N₂ has a triple bond (945 kJ/mol); lacks vacant d-orbitals so Nitrogen cannot form pentahalides like NCl₅, unlike PCl₅.',
    ],
    signatureCompounds: ['NH₃', 'HNO₃', 'P₄O₁₀', 'PCl₅', 'PH₃'],
  },
  16: {
    groupNumber: 16,
    id: 'group_16',
    iupacGroup: 'Group 16',
    casGroup: 'VIA',
    familyName: 'Oxygen Group (Chalcogens)',
    block: 'p-block',
    valenceShell: 'ns² np⁴',
    commonOxidationStates: '-2, +4, +6 (+2 in OF₂)',
    bondingCharacter: 'Ionic oxides/sulfides & covalent oxoacids',
    periodicTrends: 'Note: Sulfur has a MORE negative electron gain enthalpy than Oxygen because of Oxygen’s compact 2p electron-electron repulsion.',
    keyProperties: [
      'Hydrogen bonding causes H₂O to be a liquid with anomalously high boiling point compared to gaseous H₂S, H₂Se, H₂Te.',
      'Dioxygen O₂ is paramagnetic due to two unpaired pi*2p antibonding electrons; Sulfur exists in puckered S₈ crown rings.',
    ],
    signatureCompounds: ['H₂O', 'O₃', 'H₂SO₄', 'SO₂', 'Na₂S₂O₃'],
  },
  17: {
    groupNumber: 17,
    id: 'group_17',
    iupacGroup: 'Group 17',
    casGroup: 'VIIA',
    familyName: 'Halogens',
    block: 'p-block',
    valenceShell: 'ns² np⁵',
    commonOxidationStates: '-1 (Cl, Br, I also +1, +3, +5, +7)',
    bondingCharacter: 'Ionic halide salts (MX) & polar covalent interhalogens',
    periodicTrends: 'Oxidizing power decreases F₂ > Cl₂ > Br₂ > I₂. Electron gain enthalpy peaks at Chlorine (|ΔegH| Cl > F > Br > I). Acid strength of HX in water follows HF << HCl < HBr < HI.',
    keyProperties: [
      'Only group containing all three room-temperature phases: F₂/Cl₂ (gas), Br₂ (red-brown liquid), I₂ (lustrous solid).',
      'Oxoacid acidity increases with oxidation number of halogen: HOCl < HClO₂ < HClO₃ < HClO₄.',
    ],
    signatureCompounds: ['HF', 'HCl', 'NaClO', 'HClO₄', 'IF₇'],
  },
  18: {
    groupNumber: 18,
    id: 'group_18',
    iupacGroup: 'Group 18',
    casGroup: 'VIIIA / 0',
    familyName: 'Noble Gases (Aerogens)',
    block: 'p-block (He: 1s²)',
    valenceShell: 'ns² np⁶ (He: 1s²)',
    commonOxidationStates: '0 (+2, +4, +6, +8 in Xe fluorides/oxides)',
    bondingCharacter: 'Monoatomic dispersion forces; covalent hypervalent Xe–F / Xe–O',
    periodicTrends: 'All elements are monoatomic colorless gases; boiling points and polarizability increase steadily with molar mass down the group (He 4.2 K -> Rn 211 K).',
    keyProperties: [
      'Closed-shell octet gives the highest ionization enthalpies in each respective period and practically zero electron affinity.',
      'Neil Bartlett synthesized the first noble gas compound in 1962 using Xe + PtF₆; XeF₂ (linear), XeF₄ (square planar), and XeF₆ are classic VSEPR targets.',
    ],
    signatureCompounds: ['XeF₂', 'XeF₄', 'XeF₆', 'XeOF₄', 'XeO₃'],
  },
};

export const F_BLOCK_GROUP_INFO: Record<'lanthanide' | 'actinide', PeriodicGroupInfo> = {
  lanthanide: {
    groupNumber: 3,
    id: 'lanthanides',
    iupacGroup: 'Lanthanides (4f Series)',
    casGroup: 'f-block · Period 6 (Z = 57–71)',
    familyName: 'Lanthanoids / Inner-Transition (4f)',
    block: 'f-block',
    valenceShell: '4f¹⁻¹⁴ 5d⁰⁻¹ 6s²',
    commonOxidationStates: '+3 (also Ce⁴⁺ oxidizer, Eu²⁺ / Yb²⁺ reducers)',
    bondingCharacter: 'Strongly ionic hard-acid trivalent complexes',
    periodicTrends: 'Lanthanide contraction smoothly shrinks Ln³⁺ radii from La³⁺ (103 pm) to Lu³⁺ (86 pm), tightening Period 5/6 d-block chemistry.',
    keyProperties: [
      'Sharp magnetic and optical f–f transitions ideal for Nd:YAG lasers, strong NdFeB magnets, and phosphors.',
      'Ce⁴⁺ ([Xe] 4f⁰) acts as a strong single-electron analytical oxidant; Gd³⁺ (4f⁷) is used in MRI contrast agents.',
    ],
    signatureCompounds: ['La₂O₃', 'Ce(SO₄)₂', 'Nd₂Fe₁₄B', 'Gd-DTPA'],
  },
  actinide: {
    groupNumber: 3,
    id: 'actinides',
    iupacGroup: 'Actinides (5f Series)',
    casGroup: 'f-block · Period 7 (Z = 89–103)',
    familyName: 'Actinoids / Radioactive Inner-Transition (5f)',
    block: 'f-block',
    valenceShell: '5f¹⁻¹⁴ 6d⁰⁻² 7s²',
    commonOxidationStates: '+3, +4, +5, +6 (wide early-series range)',
    bondingCharacter: 'Mixed ionic/covalent actinyl ions (e.g. UO₂²⁺)',
    periodicTrends: 'Because 5f, 6d, and 7s energies sit close together, early actinides (Th–Am) exhibit wider oxidation variability (+3 to +7) than lanthanides.',
    keyProperties: [
      'Every actinide is radioactive; only Thorium (#90) and Uranium (#92) occur in large primordial terrestrial quantities.',
      'Elements beyond Uranium (#93 Np – #103 Lr) are synthetic transuranic elements.',
    ],
    signatureCompounds: ['UO₂', 'UF₆', 'ThO₂', 'PuO₂', 'AmO₂'],
  },
};

export function getPeriodicGroupInfo(
  groupNumber: number,
  category?: PeriodicElement['category']
): PeriodicGroupInfo {
  if (category === 'lanthanide') return F_BLOCK_GROUP_INFO.lanthanide;
  if (category === 'actinide') return F_BLOCK_GROUP_INFO.actinide;
  return PERIODIC_GROUPS[groupNumber] || PERIODIC_GROUPS[1];
}

const GAS_ATOMIC_NUMBERS = new Set([1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86]);
const LIQUID_ATOMIC_NUMBERS = new Set([35, 80]);

const PAULING_ELECTRONEGATIVITY: Record<number, number> = {
  1: 2.2, 3: 0.98, 4: 1.57, 5: 2.04, 6: 2.55, 7: 3.04, 8: 3.44, 9: 3.98,
  11: 0.93, 12: 1.31, 13: 1.61, 14: 1.9, 15: 2.19, 16: 2.58, 17: 3.16,
  19: 0.82, 20: 1.0, 21: 1.36, 22: 1.54, 23: 1.63, 24: 1.66, 25: 1.55,
  26: 1.83, 27: 1.88, 28: 1.91, 29: 1.9, 30: 1.65, 31: 1.81, 32: 2.01,
  33: 2.18, 34: 2.55, 35: 2.96, 36: 3.0, 37: 0.82, 38: 0.95, 39: 1.22,
  40: 1.33, 41: 1.6, 42: 2.16, 44: 2.2, 45: 2.28, 46: 2.2, 47: 1.93,
  48: 1.69, 49: 1.78, 50: 1.96, 51: 2.05, 52: 2.1, 53: 2.66, 54: 2.6,
  55: 0.79, 56: 0.89, 57: 1.1, 72: 1.3, 73: 1.5, 74: 2.36, 75: 1.9,
  76: 2.2, 77: 2.2, 78: 2.28, 79: 2.54, 80: 2.0, 81: 1.62, 82: 2.33,
  83: 2.02, 84: 2.0, 85: 2.2, 87: 0.7, 88: 0.9, 90: 1.3, 92: 1.38,
};

const CURATED_OXIDATION_STATES: Record<number, string> = {
  1: '+1, -1',
  6: '-4, +2, +4',
  7: '-3, -2, -1, +1, +2, +3, +4, +5',
  8: '-2, -1, (+2 in OF₂)',
  9: '-1 only',
  15: '-3, +3, +5',
  16: '-2, +2, +4, +6',
  17: '-1, +1, +3, +5, +7',
  24: '+2, +3, +6',
  25: '+2, +3, +4, +6, +7',
  26: '+2, +3',
  29: '+1, +2',
  54: '0, +2, +4, +6, +8',
  79: '+1, +3',
  80: '+1, +2',
  82: '+2, +4',
};

export interface ElementExtendedMeta {
  block: string;
  stateAtStp: 'Solid' | 'Liquid' | 'Gas';
  electronegativity: number | undefined;
  oxidationStates: string;
  groupInfo: PeriodicGroupInfo;
}

export function getElementExtendedMeta(el: PeriodicElement): ElementExtendedMeta {
  const groupInfo = getPeriodicGroupInfo(el.group, el.category);
  const block =
    el.category === 'lanthanide' || el.category === 'actinide'
      ? 'f-block'
      : el.group <= 2 || el.number === 2
      ? 's-block'
      : el.group >= 13
      ? 'p-block'
      : 'd-block';
  const stateAtStp: 'Solid' | 'Liquid' | 'Gas' = GAS_ATOMIC_NUMBERS.has(el.number)
    ? 'Gas'
    : LIQUID_ATOMIC_NUMBERS.has(el.number)
    ? 'Liquid'
    : 'Solid';
  const oxidationStates =
    CURATED_OXIDATION_STATES[el.number] || groupInfo.commonOxidationStates;

  return {
    block,
    stateAtStp,
    electronegativity: PAULING_ELECTRONEGATIVITY[el.number],
    oxidationStates,
    groupInfo,
  };
}
