export class SimilarInfo {

  private _fileName: string;
  private _thumbUrl!: string;
  private _distance: number;

  constructor(fileName: string, distance: number) {
    this._fileName = 'http:' + fileName.split(':')[1].replace(/ /g, '_');
    this._distance = distance;
  }

  get distance(): number {
    return this._distance;
  }

  get fileNameUrl(): string {
    return this._fileName;
  }
  
  get fileName(): string {
    const s = this._fileName.split('/');
    return s[s.length - 1];
  }

  get thumbUrl(): string {
    return this._thumbUrl;
  }

  set thumbUrl(value: string) {
    this._thumbUrl = value;
  }
}

