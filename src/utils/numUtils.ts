export function toFixed(number: number, precision: number): number {
  return parseFloat(number.toFixed(precision));
}

export function deg2rad(degree: number) {
  return Math.PI * (degree / 180);
}

export function findLesser(a: number, b: number) {
  return b > a ? a : b;
}

export function findBigger(a: number, b: number) {
  return b > a ? b : a;
}
