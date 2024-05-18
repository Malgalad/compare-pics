import * as React from 'react';

interface FilePreviewProps {
  file: File;
  onRemove: (file: File) => void;
}
function FilePreview({ file, onRemove }: FilePreviewProps) {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const onDoubleClick = React.useCallback(
    (evt: React.MouseEvent<HTMLImageElement>) => {
      evt.preventDefault();
      onRemove(file);
    },
    [onRemove, file],
  );

  React.useEffect(() => {
    const img = imgRef.current;

    if (!img) return;

    img.addEventListener('load', () => {
      URL.revokeObjectURL(img.src);
    });
  }, []);

  return (
    <div className="border border-black rounded-lg w-36 aspect-video" onDoubleClick={onDoubleClick}>
      <img alt="" className="object-cover w-full h-full" src={URL.createObjectURL(file)} ref={imgRef} />
    </div>
  );
}

export default FilePreview;
