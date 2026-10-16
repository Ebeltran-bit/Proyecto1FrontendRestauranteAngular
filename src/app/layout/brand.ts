import { Component } from '@angular/core';

import { TranslatePipe } from '../core/i18n/pipes';

@Component({
  selector: 'app-brand',
  imports: [TranslatePipe],
  template: `
    <span class="logo" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path
          d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"
        />
      </svg>
    </span>
    <span class="name">{{ 'app.name' | t }}</span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font: var(--mat-sys-title-large);
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .logo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
    }
    svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
  `,
})
export class Brand {}
