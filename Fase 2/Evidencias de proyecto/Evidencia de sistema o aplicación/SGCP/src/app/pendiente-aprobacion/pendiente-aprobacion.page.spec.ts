import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PendienteAprobacionPage } from './pendiente-aprobacion.page';

describe('PendienteAprobacionPage', () => {
  let component: PendienteAprobacionPage;
  let fixture: ComponentFixture<PendienteAprobacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PendienteAprobacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
