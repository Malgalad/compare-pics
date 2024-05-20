export function toFixed(number: number, precision: number): number {
  return parseFloat(number.toFixed(precision));
}

export function createSeparators(length: number): number[] {
  return Array.from({ length: length - 1 }, (_, index) => toFixed((index + 1) / length, 2));
}

export function clx(...parts: Array<unknown>): string {
  return parts
    .flatMap((part) => {
      if (!part) return false;
      if (typeof part === 'string') return part;
      if (Array.isArray(part)) return clx(...part);
      if (typeof part === 'object') return Object.entries(part).map(([key, value]) => (value ? key : false));
      return `${part}`;
    })
    .filter(Boolean)
    .map((part) => (part as string).trim())
    .join(' ');
}
