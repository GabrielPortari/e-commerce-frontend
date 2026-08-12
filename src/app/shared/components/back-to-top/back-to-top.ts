import { Component, HostListener, signal } from '@angular/core';

const SHOW_AFTER_PX = 400;

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  templateUrl: './back-to-top.html',
  styleUrl: './back-to-top.scss',
})
export class BackToTop {
  protected readonly visible = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.visible.set(window.scrollY > SHOW_AFTER_PX);
  }

  protected scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
