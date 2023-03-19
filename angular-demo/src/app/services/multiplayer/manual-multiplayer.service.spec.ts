import { TestBed } from '@angular/core/testing';

import { ManualMultiplayerService } from './manual-multiplayer.service';

describe('ManualMultiplayerService', () => {
  let service: ManualMultiplayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManualMultiplayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
