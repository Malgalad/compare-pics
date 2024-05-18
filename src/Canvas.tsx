import * as React from 'react';

interface CanvasProps {
  files: File[];
}

enum PresentationMode {
  bySide,
  split,
}

type Pointer = {
  x: number;
  y: number;
};

function Canvas({ files }: CanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [pointerDown, setPointerDown] = React.useState<Pointer | null>(null);
  const [dx, setDx] = React.useState(0);
  const [dy, setDy] = React.useState(0);
  const [zoom, setZoom] = React.useState(1.0);
  const [ratio, setRatio] = React.useState(0.5);
  // const [separators, setSeparators] = React.useState<number[]>([]);
  const [images, setImages] = React.useState<OffscreenCanvas[]>([]);
  const [mode, setMode] = React.useState<PresentationMode>(PresentationMode.bySide);

  const render = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!context || !canvas) return;

    const { width, height } = canvas;

    context.clearRect(0, 0, width, height);
    context.imageSmoothingEnabled = false;

    const imageWidth = width / images.length;
    const imageHeight = height;

    images.forEach((img, index) => {
      if (mode === PresentationMode.bySide) {
        context.drawImage(
          img,
          -dx / zoom,
          -dy / zoom,
          imageWidth / zoom,
          imageHeight / zoom,
          imageWidth * index,
          0,
          imageWidth,
          imageHeight,
        );

        return;
      }

      if (images.length === 2) {
        const offset = width * ratio * index;
        const targetWidth = width * Math.abs(index - ratio);

        context.drawImage(
          img,
          (-dx + offset) / zoom,
          -dy / zoom,
          targetWidth / zoom,
          imageHeight / zoom,
          offset,
          0,
          targetWidth,
          imageHeight,
        );

        return;
      }

      const offset = imageWidth * index;

      context.drawImage(
        img,
        (-dx + offset) / zoom,
        -dy / zoom,
        imageWidth / zoom,
        imageHeight / zoom,
        offset,
        0,
        imageWidth,
        imageHeight,
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
          render();
        }
      });
    });

    observer.observe(canvas);

    return () => {
      observer.unobserve(canvas);
    };
  }, []);

  React.useEffect(() => {
    setImages([]);
    setRatio(1 / files.length);
    // setSeparators(files.slice(1).map((_, index) => parseFloat(((index + 1) / files.length).toFixed(2))));

    files.forEach((file, index) => {
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(img.src);

        const canvas = new OffscreenCanvas(img.naturalWidth, img.naturalHeight);
        canvas.getContext('2d')?.drawImage(img, 0, 0);

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
    render();
  }, [images, dx, dy, zoom, mode, ratio]);

  const onPointerDown = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    if (!files.length) return;
    const { clientX, clientY } = evt;
    const { left, top } = (evt.target as HTMLCanvasElement).getBoundingClientRect();

    setPointerDown({ x: clientX - left - dx, y: clientY - top - dy });
  };
  const onPointerMove = (evt: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointerDown) return;
    const { clientX, clientY } = evt;
    const { left, top } = (evt.target as HTMLCanvasElement).getBoundingClientRect();
    setDx(clientX - left - pointerDown.x);
    setDy(clientY - top - pointerDown.y);
  };
  const onPointerUp = () => {
    if (!pointerDown) return;
    setPointerDown(null);
  };
  const changeZoom = (percent: number) => {
    const { width, height } = canvasRef.current as HTMLCanvasElement;
    const center = [width / images.length / 2, height / 2];
    const dc = [center[0] / zoom - center[0] / percent, center[1] / zoom - center[1] / percent];
    setZoom(percent);
    setDx((dx) => (dx / zoom) * percent - dc[0]);
    setDy((dy) => (dy / zoom) * percent - dc[1]);
  };
  const handleChangeZoom = (evt: React.ChangeEvent<HTMLInputElement>) => {
    changeZoom(parseFloat(evt.target.value));
  };
  const setNativeZoom = () => {
    changeZoom(1);
  };
  const setFitZoom = () => {
    const { width } = canvasRef.current as HTMLCanvasElement;
    const naturalWidth = images.map((image) => image.width).reduce((a, b) => (b > a ? b : a), -Infinity);

    changeZoom(parseFloat((width / naturalWidth).toFixed(2)));
    setDx(0);
    setDy(0);
  };
  const changeMode = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setMode(parseInt(evt.target.value) as PresentationMode);
  };
  const changeRatio = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setRatio(parseFloat(evt.target.value));
  };
  const setFiftyFifty = () => {
    setRatio(0.5);
  };
  const saveImage = () => {
    const canvas = canvasRef.current;
    const name = files.map((file) => file.name).join('+');

    if (!canvas) return;

    const link = document.createElement('a');
    link.setAttribute('download', `${name}.png`);
    link.setAttribute('href', canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream'));
    link.click();
  };

  return (
    <>
      <div className="flex gap-3 justify-center">
        <div className="flex items-center gap-3 border border-gray-300 bg-slate-50 p-3 rounded-lg">
          <input type="range" value={zoom} min="0.1" max="3.0" step="0.1" onChange={handleChangeZoom} />
          <output>{Math.round(zoom * 100)}%</output>
          <button className="px-2 py-0.5 border border-gray-400 rounded" type="button" onClick={setNativeZoom}>
            100%
          </button>
          <button className="px-2 py-0.5 border border-gray-400 rounded" type="button" onClick={setFitZoom}>
            Fit
          </button>
        </div>
        <div className="flex items-center gap-3 border border-gray-300 bg-slate-50 p-3 rounded-lg">
          <label>
            By Side{' '}
            <input
              type="radio"
              name="mode-switch"
              checked={mode === PresentationMode.bySide}
              value={PresentationMode.bySide}
              onChange={changeMode}
            />
          </label>
          <label>
            Split{' '}
            <input
              type="radio"
              name="mode-switch"
              checked={mode === PresentationMode.split}
              value={PresentationMode.split}
              onChange={changeMode}
            />
          </label>
        </div>
        <div className="flex items-center gap-3 border border-gray-300 bg-slate-50 p-3 rounded-lg">
          <button className="px-2 py-0.5 border border-gray-400 rounded" type="button" onClick={saveImage}>
            Save Image
          </button>
        </div>
      </div>
      {mode === PresentationMode.split && images.length === 2 && (
        <div className="flex justify-center gap-3 border border-gray-300 bg-slate-50 p-3 rounded-lg self-center">
          <input type="range" min="0" max="1" step="0.01" value={ratio} onChange={changeRatio} />
          <button className="px-2 py-0.5 border border-gray-400 rounded" type="button" onClick={setFiftyFifty}>
            50/50
          </button>
        </div>
      )}
      <div className="flex items-start justify-center flex-grow overflow-hidden [container-type:size]">
        <canvas
          className="aspect-video overflow-auto w-full [@container(aspect-ratio_>_16/9)]:w-auto [@container(aspect-ratio_>_16/9)]:h-full border border-gray-300 rounded-lg bg-slate-50"
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />
      </div>
    </>
  );
}

export default Canvas;
