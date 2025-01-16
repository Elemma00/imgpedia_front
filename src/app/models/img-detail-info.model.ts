export class ImgDetailInfo {
  fileName!: string;
  originalUrl!: string;
  thumbUrl!: string;
  associatedWith: Set<string>;
  appearsIn: Set<string>;
  height!: number;

  constructor() {
    this.associatedWith = new Set<string>();
    this.appearsIn = new Set<string>();
  }
}
