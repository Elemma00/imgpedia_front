import { TestBed } from '@angular/core/testing';

import { ImgpediaService } from './imgpedia.service';

describe('ImgpediaService', () => {
  let service: ImgpediaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImgpediaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
