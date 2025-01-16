export interface ImageInfo {
  url: string;
  descriptionurl: string;
  descriptionshorturl: string;
  thumburl: string;
  thumbwidth: number;
  thumbheight: number;
}

export interface Page {
  pageid: number;
  ns: number;
  title: string;
  imagerepository: string;
  imageinfo: ImageInfo[];
}

export interface Pages {
  pages: Page[];
}

export interface WikiApiConsult {
  query: Pages;
}
