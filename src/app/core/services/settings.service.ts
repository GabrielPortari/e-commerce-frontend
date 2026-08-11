import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Settings } from '../models';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly api = inject(ApiService);

  private readonly _whatsappNumber = signal<string | null>(null);
  readonly whatsappNumber = this._whatsappNumber.asReadonly();

  private readonly _loaded = signal(false);
  readonly loaded = this._loaded.asReadonly();

  constructor() {
    this.api.get<Settings>('/settings').subscribe({
      next: (settings) => {
        this._whatsappNumber.set(settings.whatsappNumber);
        this._loaded.set(true);
      },
      error: () => this._loaded.set(true),
    });
  }

  update(whatsappNumber: string): Observable<Settings> {
    return this.api
      .put<Settings>('/settings', { whatsappNumber })
      .pipe(tap((settings) => this._whatsappNumber.set(settings.whatsappNumber)));
  }

  /** Abre o WhatsApp com a mensagem informada; retorna false se o número ainda não estiver configurado. */
  openWhatsapp(message: string): boolean {
    const number = this._whatsappNumber();
    if (!number) {
      return false;
    }
    const link = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(link, '_blank', 'noopener');
    return true;
  }
}
