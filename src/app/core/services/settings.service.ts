import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Settings } from '../models';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly api = inject(ApiService);

  private readonly _whatsappNumber = signal<string | null>(null);
  readonly whatsappNumber = this._whatsappNumber.asReadonly();

  constructor() {
    this.api.get<Settings>('/settings').subscribe({
      next: (settings) => this._whatsappNumber.set(settings.whatsappNumber),
    });
  }

  update(whatsappNumber: string): Observable<Settings> {
    return this.api
      .put<Settings>('/settings', { whatsappNumber })
      .pipe(tap((settings) => this._whatsappNumber.set(settings.whatsappNumber)));
  }

  buildWhatsappLink(message: string): string | null {
    const number = this._whatsappNumber();
    if (!number) {
      return null;
    }
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }
}
