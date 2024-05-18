import * as React from 'react';

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
    }
  };

  const onDragOver = (evt: React.DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = evt.dataTransfer.items[0]?.type.startsWith('image/') ? 'copy' : 'none';
    evt.currentTarget.classList.add('cursor-grab');
  };

  const onDragLeave = (evt: React.DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    evt.currentTarget.classList.remove('cursor-grab');
  };

  const onDrop = (evt: React.DragEvent<HTMLDivElement>) => {
    onDragLeave(evt);

    const input = fileInputRef.current;

    if (!input) return;

    input.files = evt.dataTransfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  return (
    <>
      <div
        className="border border-gray-400 rounded-lg w-36 aspect-video flex justify-center items-center cursor-pointer"
        role="button"
        tabIndex={-1}
        onClick={addFile}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <span className="text-[48px] font-bold">+</span>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={importFile} />
    </>
  );
}

export default AddFile;
