export function toFixed(number: number, precision: number): number {
  return parseFloat(number.toFixed(precision));
}

export function createSeparators(length: number): number[] {
  return Array.from({ length: length - 1 }, (_, index) => toFixed((index + 1) / length, 2));
}
