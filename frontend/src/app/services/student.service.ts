import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student, StudentPage } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://localhost:8080/api/students';

  constructor(private http: HttpClient) {}

  getStudents(page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'desc', search?: string): Observable<StudentPage> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<StudentPage>(this.apiUrl, { params });
  }

  getStudentList(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/list`);
  }

  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  createStudent(student: Student): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, student);
  }

  updateStudent(id: number, student: Student): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, student);
  }

  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  searchStudents(term: string, page: number = 0, size: number = 10): Observable<StudentPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('search', term);
    return this.http.get<StudentPage>(this.apiUrl, { params });
  }
}
