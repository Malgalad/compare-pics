import * as React from 'react';

import Button from './Button.tsx';

import { clx } from './utils/stringUtils.ts';

interface AddFileProps {
  onAddFile: (file: File) => void;
}

function AddFile({ onAddFile }: AddFileProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const addFile = () => {
    fileInputRef.current?.click();
  };
  const importFile = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const files = evt.target.files;

    if (files?.length) {
      const file: File = files[0];

      onAddFile(file);
      evt.target.files = new DataTransfer().files;
    }
  };

  const onDragOver = (evt: React.DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = evt.dataTransfer.items[0]?.type.startsWith('image/') ? 'copy' : 'none';
    evt.currentTarget.classList.add('cursor-grab', 'bg-green-300');
  };

  const onDragLeave = (evt: React.DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    evt.currentTarget.classList.remove('cursor-grab', 'bg-green-300');
  };

  const onDrop = (evt: React.DragEvent<HTMLDivElement>) => {
    onDragLeave(evt);

    const input = fileInputRef.current;

    if (!input) return;

    input.files = evt.dataTransfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.files = new DataTransfer().files;
  };

  return (
    <>
      <Button
        className={clx('w-36 aspect-video', 'flex justify-center items-center')}
        onClick={addFile}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <span className="text-[48px] font-bold">+</span>
      </Button>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={importFile} />
    </>
  );
}

export default AddFile;
