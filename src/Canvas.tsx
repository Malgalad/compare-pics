import * as React from 'react';

import Controls from './Controls.tsx';
import Separators from './Separators.tsx';
import { clx, createSeparators } from './utils.ts';
import { PresentationMode, Position } from './models.ts';

interface CanvasProps {
  files: File[];
}

function Canvas({ files }: CanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [pointerDown, setPointerDown] = React.useState<Position | null>(null);
  const [position, setPosition] = React.useState<Position>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1.0);
  const [separators, setSeparators] = React.useState<number[]>([]);
  const [images, setImages] = React.useState<OffscreenCanvas[]>([]);
  const [mode, setMode] = React.useState<PresentationMode>(PresentationMode.split);
  const filesCache = React.useMemo(() => new WeakMap(), []);

  // const setZoomRelative = React.useCallback(
  //   (value: React.SetStateAction<number>) => {
  //     const canvas = canvasRef.current;
  //
  //     if (typeof value !== 'number' || !canvas) {
  //       setZoom(value);
  //       return;
  //     }
  //
  //     const { width, height } = canvas;
  //     const center = [width / 2, height / 2];
  //     const dc = [center[0] / zoom - center[0] / value, center[1] / zoom - center[1] / value];
  //
  //     setPosition({
  //       x: (position.x / zoom) * value - dc[0] / zoom,
  //       y: (position.y / zoom) * value - dc[1] / zoom,
  //     });
  //     setZoom(value);
  //   },
  //   [zoom, position],
  // );

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

      if (!img) return;

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
          requestAnimationFrame(render);
        }
      });
    });

    observer.observe(canvas);

    return () => {
      observer.unobserve(canvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    setImages(files.map((file) => (filesCache.has(file) ? filesCache.get(file) : undefined)));
    setSeparators(createSeparators(files.length));

    files.forEach((file, index) => {
      if (filesCache.has(file)) return;

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
  }, [files]);

  React.useEffect(() => {
    const handle = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(handle);
    };
  }, [images, position, zoom, mode, separators]);

  const onPointerDown = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    if (!images.length) return;

    const { clientX, clientY } = evt;
    const { left, top } = evt.currentTarget.getBoundingClientRect();

    setPointerDown({ x: clientX - left - position.x, y: clientY - top - position.y });
  };
  const onPointerMove = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointerDown) return;

    const { clientX, clientY } = evt;
    const { left, top } = evt.currentTarget.getBoundingClientRect();

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
        setZoom={setZoom}
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
