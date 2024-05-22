import * as React from 'react';

import Controls from './Controls.tsx';
import Separators from './Separators.tsx';
import { calculateFit, createSeparators } from './utils/appUtils.ts';
import { PresentationMode, Position } from './models.ts';
import Point from './models/Point.ts';
import { clx } from './utils/stringUtils.ts';

interface CanvasProps {
  files: File[];
}

function Canvas({ files }: CanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [pointerDown, setPointerDown] = React.useState<Position | null>(null);
  const [position, setPosition] = React.useState<Position>(Point.of(0, 0));
  const [zoom, setZoom] = React.useState(1.0);
  const [separators, setSeparators] = React.useState<number[]>([]);
  const [images, setImages] = React.useState<Array<OffscreenCanvas>>([]);
  const [mode, setMode] = React.useState<PresentationMode>(PresentationMode.split);
  const filesCache = React.useMemo<WeakMap<File, OffscreenCanvas>>(() => new WeakMap(), []);
  const boundingRectRef = React.useRef<DOMRect | null>(null);

  const setZoomRelative = React.useCallback(
    (value: React.SetStateAction<number>) => {
      const canvas = canvasRef.current;

      if (typeof value !== 'number' || !canvas) {
        setZoom(value);
        return;
      }

      const { width, height } = canvas;
      const center = Point.of(width, height).divide(2);
      const pos = Point.from(position);
      const imageCenter = center.divide(zoom).subtract(pos.divide(zoom));
      const centerNext = imageCenter.add(pos.divide(value)).multiply(value);
      const positionNext = pos.subtract(centerNext.subtract(center));

      setPosition(positionNext);
      setZoom(value);
    },
    [zoom, position, images],
  );

  const render = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!context || !canvas) return;

    const { width, height } = canvas;
    const boundaries = [0, ...separators, 1];
    const isSyncMode = mode === PresentationMode.sync;

    context.clearRect(0, 0, width, height);
    context.imageSmoothingEnabled = false;

    images.forEach((img, index) => {
      const imageWidth = width * (boundaries[index + 1] - boundaries[index]);
      const imageOffset = width * boundaries[index];

      context.drawImage(
        img,
        (-position.x + (isSyncMode ? 0 : imageOffset)) / zoom,
        -position.y / zoom,
        imageWidth / zoom,
        height / zoom,
        imageOffset,
        0,
        imageWidth,
        height,
      );
    });
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const { width, height } = canvas.getBoundingClientRect();

    canvas.width = width;
    canvas.height = height;

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === canvas) {
          canvas.width = entry.contentRect.width;
          canvas.height = entry.contentRect.height;
          boundingRectRef.current = canvas.getBoundingClientRect();
          requestAnimationFrame(render);
        }
      });
    });

    observer.observe(canvas);
    boundingRectRef.current = canvas.getBoundingClientRect();

    return () => {
      observer.unobserve(canvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const imagesSparse: OffscreenCanvas[] = [];

    files.forEach((file, index) => {
      if (filesCache.has(file)) {
        imagesSparse[index] = filesCache.get(file) as OffscreenCanvas;
      }

      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(img.src);

        const canvas = new OffscreenCanvas(img.naturalWidth, img.naturalHeight);
        canvas.getContext('2d')?.drawImage(img, 0, 0);

        filesCache.set(file, canvas);

        setImages((prev) => {
          const next = [...prev];
          next[index] = canvas;
          return next;
        });
      };
      img.src = URL.createObjectURL(file);
    });

    setImages(imagesSparse);
    setSeparators(createSeparators(files.length));
  }, [files]);

  React.useEffect(() => {
    if (!images.length) return;

    setZoom(calculateFit(canvasRef.current, images));
    setPosition({ x: 0, y: 0 });
  }, [images]);

  React.useEffect(() => {
    const handle = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(handle);
    };
  }, [position, zoom, mode, separators]);

  const onPointerDown = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    if (!images.length || !boundingRectRef.current) return;

    const { clientX, clientY } = evt;
    const { left, top } = boundingRectRef.current;

    setPointerDown({ x: clientX - left - position.x, y: clientY - top - position.y });
  };
  const onPointerMove = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointerDown || !boundingRectRef.current) return;

    const { clientX, clientY } = evt;
    const { left, top } = boundingRectRef.current;

    setPosition({
      x: clientX - left - pointerDown.x,
      y: clientY - top - pointerDown.y,
    });
  };
  const onPointerUp = () => {
    if (!pointerDown) return;

    setPointerDown(null);
  };

  return (
    <>
      <Controls
        canvasRef={canvasRef}
        images={images}
        mode={mode}
        setMode={setMode}
        setPosition={setPosition}
        setSeparators={setSeparators}
        setZoom={setZoomRelative}
        zoom={zoom}
      />
      <div className="flex items-start justify-center flex-grow [container-type:size]">
        <div
          className={clx(
            'aspect-video w-full relative',
            '[@container(aspect-ratio_>_16/9)]:w-auto [@container(aspect-ratio_>_16/9)]:h-full',
          )}
        >
          <canvas
            className="w-full h-full border border-gray-300 rounded-lg bg-slate-50 cursor-grab active:cursor-grabbing"
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          />
          <Separators canvasRef={canvasRef} setSeparators={setSeparators} separators={separators} />
        </div>
      </div>
    </>
  );
}

export default Canvas;
