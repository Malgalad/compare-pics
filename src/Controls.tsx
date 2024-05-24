import * as React from 'react';

import Button from './Button.tsx';
import { calculateFit, createSeparators } from './utils/appUtils.ts';
import { Position, PresentationMode, StretchMode } from './models.ts';

interface ControlsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  images: OffscreenCanvas[];
  mode: PresentationMode;
  rotation: number;
  setMode: React.Dispatch<React.SetStateAction<PresentationMode>>;
  setPosition: React.Dispatch<React.SetStateAction<Position>>;
  setRotation: React.Dispatch<React.SetStateAction<number>>;
  setSeparators: React.Dispatch<React.SetStateAction<number[]>>;
  setStretchMode: React.Dispatch<React.SetStateAction<StretchMode>>;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  stretchMode: StretchMode;
  zoom: number;
}

function Controls(props: ControlsProps) {
  const {
    canvasRef,
    images,
    mode,
    rotation,
    setMode,
    setPosition,
    setRotation,
    setSeparators,
    setStretchMode,
    setZoom,
    stretchMode,
    zoom,
  } = props;

  const handleChangeZoom = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(parseFloat(evt.target.value));
  };
  const handleRotationChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setRotation(parseInt(evt.target.value));
  };
  const setNativeZoom = () => {
    setZoom(1);
  };
  const setFitZoom = () => {
    if (!images.length) return;

    setZoom(calculateFit(canvasRef.current, images, stretchMode));
    setPosition({ x: 0, y: 0 });
  };
  const changeMode = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setMode(parseInt(evt.target.value) as PresentationMode);
  };
  const changeStretchMode = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setStretchMode(parseInt(evt.target.value) as StretchMode);
  };
  const resetSeparators = () => {
    setSeparators(createSeparators(images.length));
    setRotation(0);
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
  const hasVariableImages = images.slice(0, -1).some((img, i) => img.width !== images[i + 1].width);

  return (
    <div className="flex gap-3 justify-center flex-wrap">
      {hasVariableImages && (
        <div className="flex items-center gap-3 border border-gray-300 bg-slate-50 p-3 rounded-lg">
          Fit to:{' '}
          <label>
            Smallest{' '}
            <input
              type="radio"
              name="stretch-mode-switch"
              checked={stretchMode === StretchMode.smallest}
              value={StretchMode.smallest}
              onChange={changeStretchMode}
            />
          </label>
          <label>
            Largest{' '}
            <input
              type="radio"
              name="stretch-mode-switch"
              checked={stretchMode === StretchMode.largest}
              value={StretchMode.largest}
              onChange={changeStretchMode}
            />
          </label>
        </div>
      )}
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
        <input type="range" value={rotation} min="-30" max="30" step="1" onChange={handleRotationChange} />
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
