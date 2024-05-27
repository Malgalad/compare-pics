import * as React from 'react';

import Controls from './Controls.tsx';
import Separators from './Separators.tsx';
import { calculateFit, createSeparators } from './utils/appUtils.ts';
import { Position, PresentationMode, StretchMode } from './models.ts';
import Point from './models/Point.ts';
import { clx } from './utils/stringUtils.ts';
import { deg2rad, findBigger, findLesser, toFixed } from './utils/numUtils.ts';

interface CanvasProps {
  files: File[];
}

function Canvas({ files }: CanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [pointerDown, setPointerDown] = React.useState<Position | null>(null);
  const [position, setPosition] = React.useState<Position>(Point.of(0, 0));
  const [zoom, setZoom] = React.useState(1.0);
  const [separators, setSeparators] = React.useState<number[]>([]);
  const [rotation, setRotation] = React.useState<number>(0);
  const [images, setImages] = React.useState<Array<OffscreenCanvas>>([]);
  const [mode, setMode] = React.useState<PresentationMode>(PresentationMode.split);
  const [stretchMode, setStretchMode] = React.useState<StretchMode>(StretchMode.smallest);
  const filesCache = React.useMemo<WeakMap<File, OffscreenCanvas>>(() => new WeakMap(), []);
  const boundingRectRef = React.useRef<DOMRect | null>(null);
  const boundaryImageSize = React.useMemo(
    () =>
      images
        .map((img) => img.width)
        .reduce(
          stretchMode === StretchMode.smallest ? findLesser : findBigger,
          stretchMode === StretchMode.smallest ? Infinity : -Infinity,
        ),
    [images, stretchMode],
  );

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
      const start = boundaries[index];
      const end = boundaries[index + 1];
      const skew = Math.sin(deg2rad(rotation)) * height;
      const abs = Math.abs(skew);
      const imageScale = img.width / boundaryImageSize;
      const imageWidth = width * (end - start);
      const offset = width * start;
      const isFirst = index === 0;
      const isLast = index === images.length - 1;

      context.save();

      context.beginPath();
      context.moveTo(isFirst ? 0 : offset + skew, 0);
      context.lineTo(isLast ? width : offset + imageWidth + skew, 0);
      context.lineTo(isLast ? width : offset + imageWidth - skew, height);
      context.lineTo(isFirst ? 0 : offset - skew, height);
      context.closePath();
      context.clip();

      context.drawImage(
        img,
        ((-position.x - abs + (isSyncMode ? 0 : offset)) / zoom) * imageScale,
        (-position.y / zoom) * imageScale,
        ((width + abs * 2) / zoom) * imageScale,
        (height / zoom) * imageScale,
        offset - abs,
        0,
        width + abs * 2,
        height,
      );

      context.restore();
    });
  };

  React.useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') {
        requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', refresh);

    return () => {
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

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
          const next = ([] as OffscreenCanvas[]).concat(prev);
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
    if (images.length) {
      setZoom(calculateFit(canvasRef.current, images, stretchMode));
    } else {
      setZoom(1.0);
    }

    setPosition({ x: 0, y: 0 });
  }, [images]);

  React.useEffect(() => {
    setZoom(calculateFit(canvasRef.current, images, stretchMode));
  }, [stretchMode]);

  React.useEffect(() => {
    const handle = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(handle);
    };
  }, [position, zoom, mode, separators, rotation]);

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
  const onWheel = (evt: React.WheelEvent<HTMLCanvasElement>) => {
    evt.preventDefault();

    const delta = toFixed((evt.deltaY || evt.deltaX) * -(0.001 / devicePixelRatio), 2);

    setZoomRelative(Math.max(0.1, Math.min(3.0, zoom + delta)));
  };

  return (
    <>
      <Controls
        canvasRef={canvasRef}
        images={images}
        mode={mode}
        rotation={rotation}
        setMode={setMode}
        setPosition={setPosition}
        setRotation={setRotation}
        setSeparators={setSeparators}
        setStretchMode={setStretchMode}
        setZoom={setZoomRelative}
        stretchMode={stretchMode}
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
            onWheel={onWheel}
          />
          <Separators canvasRef={canvasRef} setSeparators={setSeparators} separators={separators} />
        </div>
      </div>
    </>
  );
}

export default Canvas;
