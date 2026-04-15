import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { Student, StudentPage } from '../../models/student.model';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  first = true;
  last = true;
  searchTerm = '';
  loading = false;
  errorMessage = '';
  showDeleteModal = false;
  studentToDelete: Student | null = null;

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(page: number = 0): void {
    this.loading = true;
    this.errorMessage = '';
    this.studentService.getStudents(page, this.pageSize, 'id', 'desc', this.searchTerm)
      .subscribe({
        next: (data: StudentPage) => {
          this.students = data.content;
          this.currentPage = data.currentPage;
          this.pageSize = data.pageSize;
          this.totalElements = data.totalElements;
          this.totalPages = data.totalPages;
          this.first = data.first;
          this.last = data.last;
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load students. Please try again.';
          this.loading = false;
          console.error('Error loading students:', err);
        }
      });
  }

  onSearch(): void {
    this.loadStudents(0);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadStudents(0);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.loadStudents(page);
    }
  }

  nextPage(): void {
    if (!this.last) {
      this.loadStudents(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (!this.first) {
      this.loadStudents(this.currentPage - 1);
    }
  }

  confirmDelete(student: Student): void {
    this.studentToDelete = student;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.studentToDelete = null;
  }

  deleteStudent(): void {
    if (this.studentToDelete && this.studentToDelete.id) {
      this.studentService.deleteStudent(this.studentToDelete.id).subscribe({
        next: () => {
          this.showDeleteModal = false;
          this.studentToDelete = null;
          this.loadStudents(this.currentPage);
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete student.';
          console.error('Error deleting student:', err);
          this.showDeleteModal = false;
        }
      });
    }
  }

  getPageNumbers(): number[] {
  getMinIndex(a: number, b: number): number { return Math.min(a, b); }
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);
    
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
