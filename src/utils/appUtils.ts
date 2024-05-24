import { toFixed, findBigger, findLesser } from './numUtils.ts';
import { StretchMode } from '../models.ts';

export function createSeparators(length: number): number[] {
  return Array.from({ length: length - 1 }, (_, index) => toFixed((index + 1) / length, 2));
}

export function calculateFit(
  canvas: HTMLCanvasElement | undefined | null,
  images: OffscreenCanvas[],
  stretchMode: StretchMode,
): number {
  if (!canvas || !images.length) return 1.0;

  const { width } = canvas;
  const imageWidth = images
    .map((image) => image.width)
    .reduce(
      stretchMode === StretchMode.smallest ? findLesser : findBigger,
      stretchMode === StretchMode.smallest ? Infinity : -Infinity,
    );

  return toFixed(width / imageWidth, 2);
}
