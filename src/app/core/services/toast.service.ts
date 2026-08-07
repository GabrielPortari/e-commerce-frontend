import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'error';

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  private durationMs = 4000;

  success(message: string): void {
    this.push(message, 'success');
  }

  error(message: string): void {
    this.push(message, 'error');
  }

  dismiss(id: number): void {
    this.toastsSignal.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  private push(message: string, tone: ToastTone): void {
    const id = this.nextId++;
    this.toastsSignal.update((toasts) => [...toasts, { id, message, tone }]);
    setTimeout(() => this.dismiss(id), this.durationMs);
  }
}
