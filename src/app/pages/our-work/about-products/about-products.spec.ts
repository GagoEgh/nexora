import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutProducts } from './about-products';

describe('AboutProducts', () => {
  let component: AboutProducts;
  let fixture: ComponentFixture<AboutProducts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutProducts],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutProducts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
