import { TestBed } from '@angular/core/testing';

import { ImgpediaImagesService } from './imgpedia-images.service';

describe('ImgpediaImagesService', () => {
  let service: ImgpediaImagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImgpediaImagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
