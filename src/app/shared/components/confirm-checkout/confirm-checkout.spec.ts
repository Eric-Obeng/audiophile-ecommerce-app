import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCheckout } from './confirm-checkout';

describe('ConfirmCheckout', () => {
  let component: ConfirmCheckout;
  let fixture: ComponentFixture<ConfirmCheckout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmCheckout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmCheckout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
