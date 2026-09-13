/**
 * FlyEclipse Ticket Price Matrix Engine
 * Exact implementation of the specification:
 * Passengers | P1   | P2  | P3  | P4  | P5  | P6
 * 1          | 1500 |     |     |     |     |
 * 2          | 825  | 975 |     |     |     |
 * 3          | 675  | 825 | 975 |     |     |
 * 4          | 525  | 675 | 825 | 975 |     |
 * 5          | 375  | 525 | 675 | 825 | 975 |
 * 6          | 225  | 375 | 525 | 675 | 825 | 975
 */

export const PRICING_MATRIX: Record<number, number[]> = {
  1: [1500],
  2: [825, 975],
  3: [675, 825, 975],
  4: [525, 675, 825, 975],
  5: [375, 525, 675, 825, 975],
  6: [225, 375, 525, 675, 825, 975],
};

export const PET_SUPPLEMENT_GBP = 75; // Per pet handling & climate crate bay

export function calculateFare(passengerCount: number, petCount: number = 0): {
  perSeatPrices: number[];
  baseTotal: number;
  petTotal: number;
  grandTotal: number;
} {
  if (passengerCount <= 0) {
    return { perSeatPrices: [], baseTotal: 0, petTotal: 0, grandTotal: 0 };
  }

  const cappedCount = Math.min(Math.max(passengerCount, 1), 6);
  const matrixRow = PRICING_MATRIX[cappedCount] || [1500];

  // If more than 6, subsequent passengers get the lowest marginal rate (225)
  const perSeatPrices = [...matrixRow];
  for (let i = 6; i < passengerCount; i++) {
    perSeatPrices.push(225);
  }

  const baseTotal = perSeatPrices.reduce((sum, p) => sum + p, 0);
  const petTotal = petCount * PET_SUPPLEMENT_GBP;

  return {
    perSeatPrices,
    baseTotal,
    petTotal,
    grandTotal: baseTotal + petTotal,
  };
}
