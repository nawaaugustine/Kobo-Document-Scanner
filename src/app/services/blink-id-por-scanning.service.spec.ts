import { TestBed } from '@angular/core/testing';

import { BlinkIdPorScanningService } from './blink-id-por-scanning.service';

describe('BlinkIdPorScanningService', () => {
  let service: BlinkIdPorScanningService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlinkIdPorScanningService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
