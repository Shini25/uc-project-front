import { Component, OnInit } from '@angular/core';
import { User_account } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User_account[] = [];
  paginatedUsers: User_account[] = [];
  currentPage: number = 1;
  rowsPerPage: number = 10;
  totalPages: number = 1;
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  expandedRowIndex: number | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe(
      (data: User_account[]) => {
        this.users = data;
        this.updatePagination();
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching users:', error);
        this.errorMessage = 'Failed to load users.';
        this.isLoading = false;
      }
    );
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.users.length / this.rowsPerPage);
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedUsers = this.users.slice(start, end);
  }

  onRowsPerPageChange(event: Event): void {
    this.rowsPerPage = +(event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.updatePagination();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  updateEtat(numero: string, etat: string): void {
    this.userService.updateEtat(numero, etat).subscribe(
      () => {
        this.successMessage = 'User state updated successfully.';
        this.getAllUsers();
      },
      error => {
        this.errorMessage = 'Failed to update user state.';
      }
    );
  }

  toggleRow(index: number): void {
    this.expandedRowIndex = this.expandedRowIndex === index ? null : index;
  }
}
