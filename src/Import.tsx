import * as React from 'react';

import Button from './Button.tsx';
import { clx } from './utils/stringUtils.ts';
import { ImgurImage } from './models.ts';
import { getQueryParam, getUrl, updateQueryParam } from './utils/urlUtils.ts';
import { CLIENT_ID, ALBUM_ID_QUERY_PARAM } from './constants.ts';

interface ImportProps {
  onAddFile: (file: File) => void;
  onRemoveAll: () => void;
}

interface APIResponse {
  data: unknown;
  status: number;
  success: boolean;
}

function Import({ onAddFile, onRemoveAll }: ImportProps) {
  const importImage = (image: ImgurImage): Promise<File> => {
    return fetch(image.link)
      .then((res) => res.arrayBuffer())
      .then((buffer) => new File([buffer], image.id, { type: image.type }));
  };

  const importAlbum = (id?: string) => {
    const albumId = id ?? window.prompt('Enter album id');
    const url = `https://api.imgur.com/3/album/${albumId}/images`;

    if (!url) return;

    fetch(url, {
      headers: {
        Authorization: `Client-ID ${CLIENT_ID}`,
      },
    })
      .then((res) => res.json())
      .then((response: APIResponse) => {
        const { data, success } = response;

        if (success) {
          onRemoveAll();
          updateQueryParam(getUrl(), ALBUM_ID_QUERY_PARAM, albumId as string);

          return Promise.all((data as ImgurImage[]).filter((img) => !img.animated).map(importImage));
        }

        return [];
      })
      .then((files) => {
        files.map(onAddFile);
      });
  };

  React.useEffect(() => {
    const url = getUrl();
    const albumId = getQueryParam(url, ALBUM_ID_QUERY_PARAM);

    if (albumId) {
      importAlbum(albumId);
    }
  }, []);

  return (
    <Button className={clx('w-36 aspect-video', 'flex justify-center items-center')} onClick={() => importAlbum()}>
      <span className="font-bold">Import album from Imgur</span>
    </Button>
  );
}

export default Import;
