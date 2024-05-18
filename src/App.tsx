import * as React from 'react';

import Canvas from './Canvas.tsx';
import FilePreview from './FilePreview.tsx';
import AddFile from './AddFile.tsx';

function App() {
  const [files, setFiles] = React.useState<File[]>([]);
  const onAddFile = React.useCallback((file: File) => {
    setFiles((prev) => [...prev, file]);
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
        <AddFile onAddFile={onAddFile} />
      </div>

      <Canvas files={files} />
    </div>
  );
}

export default App;
