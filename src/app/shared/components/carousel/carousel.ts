import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, signal } from '@angular/core';

@Component({
  selector: 'app-carousel',
  standalone: true,
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
})
export class Carousel implements AfterViewInit, OnDestroy {
  @ViewChild('track') private readonly trackRef!: ElementRef<HTMLElement>;

  protected readonly atStart = signal(true);
  protected readonly atEnd = signal(true);

  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    this.updateEdges();
    // Cobre o caso comum aqui: o track começa vazio/com skeletons e só
    // ganha o scrollWidth real depois que os produtos chegam da API — um
    // simples cálculo no ngAfterViewInit ficaria desatualizado.
    this.resizeObserver = new ResizeObserver(() => this.updateEdges());
    this.resizeObserver.observe(this.trackRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  protected scroll(direction: 1 | -1): void {
    const track = this.trackRef.nativeElement;
    track.scrollBy({ left: track.clientWidth * 0.9 * direction, behavior: 'smooth' });
  }

  protected updateEdges(): void {
    const track = this.trackRef.nativeElement;
    const maxScroll = track.scrollWidth - track.clientWidth;
    this.atStart.set(track.scrollLeft <= 1);
    this.atEnd.set(track.scrollLeft >= maxScroll - 1);
  }
}
