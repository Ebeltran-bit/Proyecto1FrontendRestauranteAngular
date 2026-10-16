import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { Notifier } from '../../core/ui/notifier.service';
import { Brand } from '../../layout/brand';
import { LanguageSwitch } from '../../layout/language-switch';
import { ThemeToggle } from '../../layout/theme-toggle';

/** Demo accounts loaded by the API at start-up (backend/app/data/sample_data.py). */
const DEMO_ACCOUNTS = [
  { username: 'manager', password: 'manager123', role: 'roles.manager' as const },
  { username: 'ana', password: 'camarero123', role: 'roles.waiter' as const },
];

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    Brand,
    LanguageSwitch,
    ThemeToggle,
    TranslatePipe,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);

  /** ?expired=1 when the session ended on its own. */
  readonly expired = input<string>();

  protected readonly demoAccounts = DEMO_ACCOUNTS;
  protected readonly loading = signal(false);
  protected readonly wrongCredentials = signal(false);
  protected readonly showPassword = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected fill(account: (typeof DEMO_ACCOUNTS)[number]): void {
    this.form.setValue({ username: account.username, password: account.password });
    this.wrongCredentials.set(false);
  }

  protected submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    const { username, password } = this.form.getRawValue();
    this.loading.set(true);
    this.wrongCredentials.set(false);
    this.auth.login(username.trim(), password).subscribe({
      next: () => void this.router.navigate(['/sala']),
      error: (error: unknown) => {
        this.loading.set(false);
        if (error instanceof HttpErrorResponse && error.status === 401)
          this.wrongCredentials.set(true);
        else this.notifier.error(error);
      },
    });
  }
}
