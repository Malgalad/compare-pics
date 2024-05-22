import { toFixed } from './numUtils.ts';

export function createSeparators(length: number): number[] {
  return Array.from({ length: length - 1 }, (_, index) => toFixed((index + 1) / length, 2));
}

export function calculateFit(canvas: HTMLCanvasElement | undefined | null, images: OffscreenCanvas[]): number {
  if (!canvas || !images.length) return 1.0;

  const { width } = canvas;
  const imageWidth = images.map((image) => image.width).reduce((a, b) => (b > a ? b : a), -Infinity);

  return toFixed(width / imageWidth, 2);
}
