import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleSolicitudPage } from './detalle-solicitud.page';

describe('DetalleSolicitudPage', () => {
  let component: DetalleSolicitudPage;
  let fixture: ComponentFixture<DetalleSolicitudPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleSolicitudPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
