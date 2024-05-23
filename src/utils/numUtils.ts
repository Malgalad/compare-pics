export function toFixed(number: number, precision: number): number {
  return parseFloat(number.toFixed(precision));
}

export function deg2rad(degree: number) {
  return Math.PI * (degree / 180);
}
