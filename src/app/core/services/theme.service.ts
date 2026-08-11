import { Injectable, computed, effect, signal } from '@angular/core';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly media = window.matchMedia('(prefers-color-scheme: dark)');

  /** null = segue o tema do dispositivo; definido = escolha explícita do usuário (toggle). */
  private readonly explicitTheme = signal<Theme | null>(this.readStoredTheme());
  private readonly systemTheme = signal<Theme>(this.media.matches ? 'dark' : 'light');

  readonly theme = computed<Theme>(() => this.explicitTheme() ?? this.systemTheme());

  constructor() {
    this.media.addEventListener('change', (event) => {
      this.systemTheme.set(event.matches ? 'dark' : 'light');
    });

    effect(() => {
      const explicit = this.explicitTheme();
      if (explicit) {
        document.documentElement.setAttribute('data-theme', explicit);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    });
  }

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.explicitTheme.set(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  private readStoredTheme(): Theme | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  }
}
