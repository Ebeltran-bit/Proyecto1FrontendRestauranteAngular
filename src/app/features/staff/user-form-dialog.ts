import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { UsersApi } from '../../core/api/users-api.service';
import { TranslatePipe } from '../../core/i18n/pipes';
import { Role, User } from '../../core/models';
import { Notifier } from '../../core/ui/notifier.service';

/** Same rules as the API (backend/app/schemas/user.py), so mistakes show before sending. */
const USERNAME_PATTERN = /^[a-z0-9._-]+$/;

@Component({
  selector: 'app-user-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    TranslatePipe,
  ],
  template: `
    <h2 mat-dialog-title>{{ 'staff.formTitle' | t }}</h2>
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <mat-dialog-content class="content">
        <mat-button-toggle-group
          formControlName="role"
          class="roles"
          [hideSingleSelectionIndicator]="true"
        >
          <mat-button-toggle value="waiter"
            ><mat-icon>room_service</mat-icon> {{ 'roles.waiter' | t }}</mat-button-toggle
          >
          <mat-button-toggle value="manager"
            ><mat-icon>shield_person</mat-icon> {{ 'roles.manager' | t }}</mat-button-toggle
          >
        </mat-button-toggle-group>

        <mat-form-field>
          <mat-label>{{ 'staff.fullName' | t }}</mat-label>
          <input matInput formControlName="full_name" maxlength="60" cdkFocusInitial />
          @if (form.controls.full_name.hasError('required')) {
            <mat-error>{{ 'common.required' | t }}</mat-error>
          } @else if (form.controls.full_name.hasError('minlength')) {
            <mat-error>{{ 'common.tooShort' | t: { min: 2 } }}</mat-error>
          }
        </mat-form-field>

        <mat-form-field>
          <mat-label>{{ 'staff.username' | t }}</mat-label>
          <input
            matInput
            formControlName="username"
            maxlength="30"
            autocapitalize="none"
            autocomplete="off"
          />
          <mat-hint>{{ 'staff.usernameHint' | t }}</mat-hint>
          @if (form.controls.username.hasError('required')) {
            <mat-error>{{ 'common.required' | t }}</mat-error>
          } @else if (form.controls.username.hasError('minlength')) {
            <mat-error>{{ 'common.tooShort' | t: { min: 3 } }}</mat-error>
          } @else if (form.controls.username.hasError('pattern')) {
            <mat-error>{{ 'staff.usernameHint' | t }}</mat-error>
          } @else if (form.controls.username.hasError('taken')) {
            <mat-error>{{ 'staff.usernameTaken' | t }}</mat-error>
          }
        </mat-form-field>

        <mat-form-field>
          <mat-label>{{ 'staff.password' | t }}</mat-label>
          <input
            matInput
            type="password"
            formControlName="password"
            maxlength="128"
            autocomplete="new-password"
          />
          <mat-hint>{{ 'staff.passwordHint' | t }}</mat-hint>
          @if (form.controls.password.hasError('required')) {
            <mat-error>{{ 'common.required' | t }}</mat-error>
          } @else if (form.controls.password.hasError('minlength')) {
            <mat-error>{{ 'common.tooShort' | t: { min: 6 } }}</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>{{ 'common.cancel' | t }}</button>
        <button mat-flat-button type="submit" [disabled]="saving()">
          {{ 'common.create' | t }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .content {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: min(420px, 80vw);
    }
    .roles {
      align-self: flex-start;
      margin-bottom: 12px;
    }
    mat-button-toggle mat-icon {
      vertical-align: middle;
      margin-right: 4px;
    }
  `,
})
export class UserFormDialog {
  private readonly api = inject(UsersApi);
  private readonly notifier = inject(Notifier);
  private readonly dialogRef = inject<MatDialogRef<UserFormDialog, User>>(MatDialogRef);

  protected readonly saving = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    role: ['waiter' as Role],
    full_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validators.pattern(USERNAME_PATTERN),
      ],
    ],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]],
  });

  constructor() {
    // Usernames are always lower case: convert while typing instead of rejecting.
    this.form.controls.username.valueChanges.subscribe((value) => {
      const lower = value.toLowerCase();
      if (lower !== value) this.form.controls.username.setValue(lower, { emitEvent: false });
    });
  }

  protected submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saving.set(true);
    this.api.create({ ...value, full_name: value.full_name.trim() }).subscribe({
      next: (user) => this.dialogRef.close(user),
      error: (error: unknown) => {
        this.saving.set(false);
        if (error instanceof HttpErrorResponse && error.status === 409) {
          this.form.controls.username.setErrors({ taken: true });
          this.form.controls.username.markAsTouched();
        } else {
          this.notifier.error(error);
        }
      },
    });
  }
}
