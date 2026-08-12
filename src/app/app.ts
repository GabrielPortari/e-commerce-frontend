import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';
import { ToastContainer } from './shared/components/toast-container/toast-container';
import { AnnouncementBar } from './shared/components/announcement-bar/announcement-bar';
import { BackToTop } from './shared/components/back-to-top/back-to-top';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, ToastContainer, AnnouncementBar, BackToTop],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);

  // /admin/** tem shell próprio (AdminLayout) — header/footer/announcement-bar
  // públicos (e o container de storefront) não fazem sentido lá.
  protected readonly isAdminRoute = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.startsWith('/admin'))
    ),
    { initialValue: this.router.url.startsWith('/admin') }
  );
}
