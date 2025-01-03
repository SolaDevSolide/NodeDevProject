import {TestBed} from '@angular/core/testing';

import {VisualizationDataService} from './visualization-data.service';

describe('VisualizationDataService', () => {
  let service: VisualizationDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisualizationDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
