import { Component, input } from '@angular/core';

import { Language } from '../core/i18n/dictionary';

/** Flag of each language, drawn in SVG so it needs no image files or icon fonts. */
@Component({
  selector: 'app-flag',
  host: { class: 'flag', 'aria-hidden': 'true' },
  template: `
    @if (language() === 'es') {
      <svg viewBox="0 0 750 500">
        <rect width="750" height="500" fill="#c60b1e" />
        <rect width="750" height="250" y="125" fill="#ffc400" />
      </svg>
    } @else {
      <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice">
        <clipPath id="uk-s"><path d="M0,0 v30 h60 v-30 z" /></clipPath>
        <clipPath id="uk-t">
          <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
        </clipPath>
        <g clip-path="url(#uk-s)">
          <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6" />
          <path
            d="M0,0 L60,30 M60,0 L0,30"
            clip-path="url(#uk-t)"
            stroke="#C8102E"
            stroke-width="4"
          />
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10" />
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6" />
        </g>
      </svg>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      width: 28px;
      height: 19px;
      border-radius: 3px;
      overflow: hidden;
      box-shadow: 0 0 0 1px rgb(0 0 0 / 0.15);
    }
    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  `,
})
export class Flag {
  readonly language = input.required<Language>();
}
