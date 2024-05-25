export type Position = {
  x: number;
  y: number;
};

export enum PresentationMode {
  sync,
  split,
}

export enum StretchMode {
  smallest,
  largest,
}

export enum ImageTypes {
  jpg = 'image/jpeg',
  png = 'image/png',
}

export interface ImgurImage {
  animated: boolean;
  height: number;
  id: string;
  link: string;
  type: ImageTypes;
  width: number;
}
