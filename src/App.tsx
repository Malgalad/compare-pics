import * as React from 'react';

import Canvas from './Canvas.tsx';
import FilePreview from './FilePreview.tsx';
import AddFile from './AddFile.tsx';
import Import from './Import.tsx';
import { getUrl, updateQueryParam } from './utils/urlUtils.ts';
import { ALBUM_ID_QUERY_PARAM } from './constants.ts';

function App() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [selected, setSelected] = React.useState<boolean[]>([]);
  const onAddFile = React.useCallback((file: File, updateURL = true) => {
    if (updateURL) updateQueryParam(getUrl(), ALBUM_ID_QUERY_PARAM, undefined);
    setFiles((prev) => [...prev, file]);
    setSelected((prev) => [...prev, true]);
  }, []);
  const onRemoveFile = React.useCallback(
    (file: File) => {
      const index = files.indexOf(file);

      updateQueryParam(getUrl(), ALBUM_ID_QUERY_PARAM, undefined);
      setFiles((prev) => {
        const next = [...prev];

        next.splice(index, 1);

        return next;
      });
      setSelected((prev) => {
        const next = [...prev];

        next.splice(index, 1);

        return next;
      });
    },
    [files],
  );
  const onRemoveAll = React.useCallback(() => {
    setFiles([]);
    setSelected([]);
  }, []);
  const toggleFile = React.useCallback(
    (file: File) => {
      const index = files.indexOf(file);

      setSelected((prev) => {
        const next = [...prev];

        next[index] = !next[index];

        return next;
      });
    },
    [files],
  );
  const selectedFiles = React.useMemo(() => files.filter((_, index) => selected[index]), [files, selected]);

  return (
    <div className="flex flex-col gap-3 p-3 w-screen h-screen bg-gray-800">
      <div className="flex gap-3 border border-gray-300 bg-slate-50 p-3 rounded-lg">
        {files.map((file, index) => (
          <FilePreview
            key={index}
            file={file}
            isSelected={selected[index]}
            onRemove={onRemoveFile}
            toggleSelected={toggleFile}
          />
        ))}
        <AddFile onAddFile={onAddFile} />
        <Import onAddFile={onAddFile} onRemoveAll={onRemoveAll} />
      </div>

      <Canvas files={selectedFiles} />
    </div>
  );
}

export default App;
