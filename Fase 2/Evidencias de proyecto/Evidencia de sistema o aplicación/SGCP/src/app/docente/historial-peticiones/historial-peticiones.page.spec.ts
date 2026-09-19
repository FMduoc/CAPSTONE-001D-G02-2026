import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialPeticionesPage } from './historial-peticiones.page';

describe('HistorialPeticionesPage', () => {
  let component: HistorialPeticionesPage;
  let fixture: ComponentFixture<HistorialPeticionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialPeticionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
