import { TestBed } from '@angular/core/testing';
import { SolicitudService } from './solicitud';

describe('Solicitud', () => {
  let service: SolicitudService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolicitudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
