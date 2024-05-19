import * as React from 'react';

interface SeparatorsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  separators: number[];
  setSeparators: React.Dispatch<React.SetStateAction<number[]>>;
}

function Separators({ canvasRef, separators, setSeparators }: SeparatorsProps) {
  const pointerDownRef = React.useRef<number | null>(null);

  const onChangeSeparator = (index: number, value: number) => {
    setSeparators((prev) => {
      const next = [...prev];

      next[index] = value;

      return next;
    });
  };

  const onPointerDown = (evt: React.PointerEvent<SVGSVGElement>) => {
    const maybeIndex = evt.currentTarget.dataset.index;

    if (!maybeIndex) return;

    pointerDownRef.current = parseInt(maybeIndex);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };
  const onPointerMove = (evt: PointerEvent) => {
    const index = pointerDownRef.current;
    const canvas = canvasRef.current;

    if (index == null || !canvas) return;

    // TODO cache bounding rect
    const { left: referenceLeft, width: referenceWidth } = canvas.getBoundingClientRect();
    const separatorLeft = evt.clientX;
    const minDiff = 0.05; // 5% percent
    const min = (separators[index - 1] ?? 0) + minDiff;
    const max = (separators[index + 1] ?? 1) - minDiff;
    const value = (separatorLeft - referenceLeft) / referenceWidth;
    const clampedValue = Math.max(Math.min(value, max), min);

    onChangeSeparator(index, clampedValue);
  };
  const onPointerUp = () => {
    pointerDownRef.current = null;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
  };

  return separators.map((value, index) => (
    <svg
      className="absolute -top-1 -translate-x-1/2 w-6 h-10 cursor-pointer"
      viewBox="0 0 24 40"
      key={value}
      data-index={index}
      style={{
        left: `${value * 100}%`,
      }}
      onPointerDown={onPointerDown}
    >
      <polygon points="0,0 24,0 12,40" fill="white" stroke="black" strokeWidth="2" />
    </svg>
  ));
}

export default Separators;
