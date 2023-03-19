import { TestBed } from '@angular/core/testing';

import { WebsocketMultiplayerService } from './websocket-multiplayer.service';

describe('WebsocketMultiplayerService', () => {
  let service: WebsocketMultiplayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebsocketMultiplayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
