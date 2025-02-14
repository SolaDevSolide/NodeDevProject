import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DataPageComponent} from './data-page.component';

describe('DataPageComponent', () => {
  let component: DataPageComponent;
  let fixture: ComponentFixture<DataPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataPageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DataPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
