import * as React from 'react';

import Button from './Button.tsx';
import { calculateFit, createSeparators } from './utils/appUtils.ts';
import { Position, PresentationMode } from './models.ts';

interface ControlsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  images: OffscreenCanvas[];
  mode: PresentationMode;
  setMode: React.Dispatch<React.SetStateAction<PresentationMode>>;
  setPosition: React.Dispatch<React.SetStateAction<Position>>;
  setSeparators: React.Dispatch<React.SetStateAction<number[]>>;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  zoom: number;
}

function Controls({ canvasRef, images, mode, setMode, setPosition, setSeparators, setZoom, zoom }: ControlsProps) {
  const handleChangeZoom = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(parseFloat(evt.target.value));
  };
  const setNativeZoom = () => {
    setZoom(1);
  };
  const setFitZoom = () => {
    if (!images.length) return;

    setZoom(calculateFit(canvasRef.current, images));
    setPosition({ x: 0, y: 0 });
  };
  const changeMode = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setMode(parseInt(evt.target.value) as PresentationMode);
  };
  const resetSeparators = () => {
    setSeparators(createSeparators(images.length));
  };
  const saveImage = () => {
    const canvas = canvasRef.current;
    const name = Date.now();

    if (!canvas) return;

    const link = document.createElement('a');
    link.setAttribute('download', `${name}.png`);
    link.setAttribute('href', canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream'));
    link.click();
  };

  return (
    <div className="flex gap-3 justify-center">
      <div className="flex items-center gap-3 border border-gray-300 bg-slate-50 p-3 rounded-lg">
        Zoom: <input type="range" value={zoom} min="0.1" max="3.0" step="0.1" onChange={handleChangeZoom} />
        <output>{Math.round(zoom * 100)}%</output>
        <Button type="button" onClick={setNativeZoom}>
          100%
        </Button>
        <Button type="button" onClick={setFitZoom}>
          Fit
        </Button>
      </div>
      <div className="flex items-center gap-3 border border-gray-300 bg-slate-50 p-3 rounded-lg">
        Split: <Button onClick={resetSeparators}>EQ</Button>
      </div>
      <div className="flex items-center gap-3 border border-gray-300 bg-slate-50 p-3 rounded-lg">
        Mode:{' '}
        <label>
          Sync{' '}
          <input
            type="radio"
            name="mode-switch"
            checked={mode === PresentationMode.sync}
            value={PresentationMode.sync}
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
        <Button type="button" onClick={saveImage}>
          Save Image
        </Button>
      </div>
    </div>
  );
}

export default Controls;
