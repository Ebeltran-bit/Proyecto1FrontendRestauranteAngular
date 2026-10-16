import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, switchMap } from 'rxjs';

import { UsersApi } from '../../core/api/users-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { roleKey } from '../../core/i18n/dictionary';
import { TranslatePipe } from '../../core/i18n/pipes';
import { TranslationService } from '../../core/i18n/translation.service';
import { User } from '../../core/models';
import { Notifier } from '../../core/ui/notifier.service';
import { ConfirmData, ConfirmDialog } from '../../shared/confirm-dialog';
import { UserFormDialog } from './user-form-dialog';

/** Manager only: the restaurant's users. Waiters created here can be chosen as a table's waiter. */
@Component({
  selector: 'app-staff-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TranslatePipe,
  ],
  templateUrl: './staff-page.html',
  styleUrl: './staff-page.scss',
})
export class StaffPage implements OnInit {
  private readonly api = inject(UsersApi);
  private readonly dialog = inject(MatDialog);
  private readonly notifier = inject(Notifier);
  private readonly i18n = inject(TranslationService);
  protected readonly auth = inject(AuthService);
  protected readonly roleKey = roleKey;

  protected readonly users = signal<User[]>([]);
  protected readonly loading = signal(true);

  protected readonly groups = computed(() => [
    { title: 'staff.waiters' as const, users: this.users().filter((u) => u.role === 'waiter') },
    { title: 'staff.managers' as const, users: this.users().filter((u) => u.role === 'manager') },
  ]);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.api.list().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.notifier.error(error);
      },
    });
  }

  protected create(): void {
    this.dialog
      .open<UserFormDialog, void, User>(UserFormDialog, { width: '480px', maxWidth: '96vw' })
      .afterClosed()
      .pipe(filter((user): user is User => !!user))
      .subscribe((user) => {
        this.notifier.success(this.i18n.t('staff.created', { name: user.full_name }));
        this.load();
      });
  }

  protected remove(user: User): void {
    this.dialog
      .open<ConfirmDialog, ConfirmData, boolean>(ConfirmDialog, {
        width: '420px',
        data: {
          title: this.i18n.t('staff.deleteTitle'),
          message: this.i18n.t('staff.deleteText', { name: user.full_name }),
          confirmLabel: this.i18n.t('common.delete'),
          danger: true,
        },
      })
      .afterClosed()
      .pipe(
        filter((ok) => ok === true),
        switchMap(() => this.api.delete(user.id)),
      )
      .subscribe({
        next: () => {
          this.users.update((users) => users.filter((u) => u.id !== user.id));
          this.notifier.success(this.i18n.t('staff.deleted', { name: user.full_name }));
        },
        error: (error: unknown) => {
          // From this page the only possible conflict is a waiter with open tables.
          if (error instanceof HttpErrorResponse && error.status === 409) {
            this.notifier.error(this.i18n.t('staff.deleteBusy', { name: user.full_name }));
          } else {
            this.notifier.error(error);
          }
        },
      });
  }

  protected initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }
}
