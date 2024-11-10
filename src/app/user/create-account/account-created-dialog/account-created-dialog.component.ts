import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-account-created-dialog',
  templateUrl: './account-created-dialog.component.html',
  styleUrls: ['./account-created-dialog.component.css'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule
  ]
})
export class AccountCreatedDialogComponent {
  constructor(private dialogRef: MatDialogRef<AccountCreatedDialogComponent>) {}

  onClose(): void {
    this.dialogRef.close();
  }
}