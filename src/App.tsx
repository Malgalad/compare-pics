import * as React from 'react';

import Canvas from './Canvas.tsx';
import FilePreview from './FilePreview.tsx';

function App() {
  const [files, setFiles] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const addFile = () => {
    fileInputRef.current?.click();
  };
  const importFile = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const files = evt.target.files;

    if (files?.length) {
      const file: File = files[0];

      setFiles((prev) => [...prev, file]);
    }
  }, []);
  const onRemoveFile = React.useCallback((file: File) => {
    setFiles((prev) => {
      const next = [...prev];

      next.splice(prev.indexOf(file), 1);

      return next;
    });
  }, []);

  return (
    <div className="flex flex-col gap-3 p-3 w-screen h-screen bg-gray-800">
      <div className="flex gap-3 border border-gray-300 bg-slate-50 p-3 rounded-lg">
        {files.map((file, index) => (
          <FilePreview key={index} file={file} onRemove={onRemoveFile} />
        ))}
        <div
          className="border border-gray-400 rounded-lg w-36 aspect-video flex justify-center items-center cursor-pointer"
          tabIndex={-1}
          onClick={addFile}
          role="button"
        >
          <span className="text-[48px] font-bold">+</span>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={importFile} />
      </div>

      <Canvas files={files} />
    </div>
  );
}

export default App;
