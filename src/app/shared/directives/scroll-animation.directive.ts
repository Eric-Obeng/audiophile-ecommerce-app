import {
  Directive,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  input,
  inject,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appScrollAnimation]',
})
export class ScrollAnimationDirective implements AfterViewInit, OnDestroy {
  animationClass = input<string>('fade-in');
  delay = input<number>(0);
  threshold = input<number>(0.1);

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private observer!: IntersectionObserver;

  ngAfterViewInit() {
    // Set initial state to invisible with a slight delay to ensure styles are applied
    setTimeout(() => {
      this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
      this.renderer.setStyle(
        this.el.nativeElement,
        'transform',
        'translateY(30px)'
      );

      // Create and start observing after initial styles are set
      this.setupObserver();
    }, 0);
  }

  ngOnDestroy() {
    // Clean up observer when directive is destroyed
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupObserver() {
    // Force initial styles to be more explicit
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      'translateY(30px)'
    );

    // Create a more sensitive observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Apply animation with optional delay
            setTimeout(() => {
              // Apply both the animation class and force visibility
              this.renderer.addClass(
                this.el.nativeElement,
                this.animationClass()
              );
              this.renderer.addClass(this.el.nativeElement, 'visible');

              // Ensure visibility with inline styles as a fallback
              this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
              this.renderer.setStyle(
                this.el.nativeElement,
                'transform',
                'translateY(0)'
              );

              // Stop observing once animated
              this.observer.unobserve(this.el.nativeElement);
            }, this.delay());
          }
        });
      },
      {
        threshold: this.threshold(),
        rootMargin: '0px 0px -50px 0px', // Trigger slightly before element enters viewport
      }
    );

    this.observer.observe(this.el.nativeElement);
  }
}
