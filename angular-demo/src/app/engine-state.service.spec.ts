import { TestBed } from '@angular/core/testing';

import { EngineStateService } from './engine-state.service';

describe('EngineStateService', () => {
  let service: EngineStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EngineStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
