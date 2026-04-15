import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.css']
})
export class StudentFormComponent implements OnInit {
  studentForm!: FormGroup;
  isEditMode = false;
  studentId: number | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.studentId = +params['id'];
        this.loadStudent(this.studentId);
      }
    });
  }

  initForm(): void {
    this.studentForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.maxLength(20)]],
      dateOfBirth: [''],
      address: ['', [Validators.maxLength(255)]]
    });
  }

  loadStudent(id: number): void {
    this.loading = true;
    this.studentService.getStudentById(id).subscribe({
      next: (student: Student) => {
        this.studentForm.patchValue({
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          phone: student.phone || '',
          dateOfBirth: student.dateOfBirth || '',
          address: student.address || ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load student data.';
        this.loading = false;
        console.error('Error loading student:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.markFormGroupTouched(this.studentForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const student: Student = this.studentForm.value;

    if (this.isEditMode && this.studentId) {
      this.studentService.updateStudent(this.studentId, student).subscribe({
        next: () => {
          this.successMessage = 'Student updated successfully!';
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/students']);
          }, 1500);
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Failed to update student.';
          this.loading = false;
          console.error('Error updating student:', err);
        }
      });
    } else {
      this.studentService.createStudent(student).subscribe({
        next: () => {
          this.successMessage = 'Student created successfully!';
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/students']);
          }, 1500);
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Failed to create student. Email may already exist.';
          this.loading = false;
          console.error('Error creating student:', err);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/students']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.studentForm.get(fieldName);
    if (control && control.touched && control.errors) {
      if (control.errors['required']) {
        return `${this.formatFieldName(fieldName)} is required`;
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['maxlength']) {
        const maxLength = control.errors['maxlength'].requiredLength;
        return `${this.formatFieldName(fieldName)} must not exceed ${maxLength} characters`;
      }
    }
    return '';
  }

  private formatFieldName(fieldName: string): string {
    return fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
}
