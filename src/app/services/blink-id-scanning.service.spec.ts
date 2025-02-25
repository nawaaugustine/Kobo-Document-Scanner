import { TestBed } from '@angular/core/testing';

import { BlinkIdScanningService } from './blink-id-scanning.service';

describe('BlinkIdScanningService', () => {
  let service: BlinkIdScanningService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlinkIdScanningService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
