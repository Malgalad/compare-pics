import * as React from 'react';

import Button from './Button.tsx';

interface FilePreviewProps {
  file: File;
  onRemove: (file: File) => void;
}
function FilePreview({ file, onRemove }: FilePreviewProps) {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const removeFile = () => {
    onRemove(file);
  };

  React.useEffect(() => {
    const img = imgRef.current;

    if (!img) return;

    img.addEventListener('load', () => {
      URL.revokeObjectURL(img.src);
    });
  }, []);

  return (
    <div className="border border-black rounded-lg w-36 aspect-video relative group">
      <img alt="" className="object-cover w-full h-full" src={URL.createObjectURL(file)} ref={imgRef} />
      <Button className="absolute right-1 left-1 bottom-1 hidden group-hover:block" onClick={removeFile}>
        Remove
      </Button>
    </div>
  );
}

export default FilePreview;
