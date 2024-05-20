import * as React from 'react';

interface SeparatorsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  separators: number[];
  setSeparators: React.Dispatch<React.SetStateAction<number[]>>;
}

function Separators({ canvasRef, separators, setSeparators }: SeparatorsProps) {
  const pointerDownRef = React.useRef<number | null>(null);
  const boundingRectRef = React.useRef<DOMRect | null>(null);

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
    const boundingRect = boundingRectRef.current;

    if (index == null || !canvas || !boundingRect) return;

    const { left: referenceLeft, width: referenceWidth } = boundingRect;
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

  React.useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === canvas) {
          boundingRectRef.current = canvas.getBoundingClientRect();
        }
      });
    });

    boundingRectRef.current = canvas.getBoundingClientRect();
    observer.observe(canvas);

    return () => {
      observer.unobserve(canvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef.current]);

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
