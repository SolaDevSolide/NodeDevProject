import {ComponentFixture, TestBed} from '@angular/core/testing';

import {VisualizationChartsComponent} from './visualization-charts.component';

describe('VisualizationChartsComponent', () => {
  let component: VisualizationChartsComponent;
  let fixture: ComponentFixture<VisualizationChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizationChartsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VisualizationChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
