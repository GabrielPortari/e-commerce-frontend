import { Component, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SettingsService } from '../../core/services/settings.service';
import { ToastService } from '../../core/services/toast.service';
import { ApiError } from '../../core/models';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsPage {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);
  private readonly toastService = inject(ToastService);

  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    whatsappNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
  });

  constructor() {
    effect(() => {
      const number = this.settingsService.whatsappNumber();
      if (number) {
        this.form.controls.whatsappNumber.setValue(number);
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.settingsService.update(this.form.getRawValue().whatsappNumber).subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.success('Número do WhatsApp atualizado.');
      },
      error: (err: { error?: ApiError }) => {
        this.saving.set(false);
        this.toastService.error(err.error?.message ?? 'Erro ao salvar configuração.');
      },
    });
  }
}
