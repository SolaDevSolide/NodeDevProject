import {ComponentFixture, TestBed} from '@angular/core/testing';

import {VisualizationLayoutComponent} from './visualization-layout.component';

describe('VisualizationLayoutComponent', () => {
  let component: VisualizationLayoutComponent;
  let fixture: ComponentFixture<VisualizationLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizationLayoutComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VisualizationLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
