import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDocuments } from './list-documents';

describe('ListDocuments', () => {
  let component: ListDocuments;
  let fixture: ComponentFixture<ListDocuments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDocuments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListDocuments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
