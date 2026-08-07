import { Component, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'success' | 'error' | 'warning';

@Component({
  selector: 'app-badge',
  standalone: true,
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
})
export class Badge {
  tone = input<BadgeTone>('neutral');
}
