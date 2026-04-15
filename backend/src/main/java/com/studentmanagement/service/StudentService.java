package com.studentmanagement.service;

import com.studentmanagement.dto.StudentDTO;
import com.studentmanagement.entity.Student;
import com.studentmanagement.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StudentService {
    
    private final StudentRepository studentRepository;
    
    public StudentDTO createStudent(StudentDTO studentDTO) {
        log.info("Creating new student with email: {}", studentDTO.getEmail());
        
        if (studentRepository.existsByEmail(studentDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + studentDTO.getEmail());
        }
        
        Student student = mapToEntity(studentDTO);
        Student savedStudent = studentRepository.save(student);
        log.info("Student created successfully with ID: {}", savedStudent.getId());
        
        return mapToDTO(savedStudent);
    }
    
    @Transactional(readOnly = true)
    public Page<StudentDTO> getAllStudents(Pageable pageable) {
        log.debug("Fetching all students with pagination: page={}, size={}", 
                pageable.getPageNumber(), pageable.getPageSize());
        
        return studentRepository.findAll(pageable)
                .map(this::mapToDTO);
    }
    
    @Transactional(readOnly = true)
    public List<StudentDTO> getAllStudentsList() {
        log.debug("Fetching all students as list");
        
        return studentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public StudentDTO getStudentById(Long id) {
        log.debug("Fetching student by ID: {}", id);
        
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + id));
        
        return mapToDTO(student);
    }
    
    @Transactional(readOnly = true)
    public Optional<Student> findByEmail(String email) {
        log.debug("Fetching student by email: {}", email);
        return studentRepository.findByEmail(email);
    }
    
    public StudentDTO updateStudent(Long id, StudentDTO studentDTO) {
        log.info("Updating student with ID: {}", id);
        
        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + id));
        
        if (studentRepository.existsByEmailAndIdNot(studentDTO.getEmail(), id)) {
            throw new IllegalArgumentException("Email already exists: " + studentDTO.getEmail());
        }
        
        existingStudent.setFirstName(studentDTO.getFirstName());
        existingStudent.setLastName(studentDTO.getLastName());
        existingStudent.setEmail(studentDTO.getEmail());
        existingStudent.setPhone(studentDTO.getPhone());
        existingStudent.setDateOfBirth(studentDTO.getDateOfBirth());
        existingStudent.setAddress(studentDTO.getAddress());
        
        Student updatedStudent = studentRepository.save(existingStudent);
        log.info("Student updated successfully with ID: {}", updatedStudent.getId());
        
        return mapToDTO(updatedStudent);
    }
    
    public void deleteStudent(Long id) {
        log.info("Deleting student with ID: {}", id);
        
        if (!studentRepository.existsById(id)) {
            throw new IllegalArgumentException("Student not found with ID: " + id);
        }
        
        studentRepository.deleteById(id);
        log.info("Student deleted successfully with ID: {}", id);
    }
    
    @Transactional(readOnly = true)
    public Page<StudentDTO> searchStudents(String searchTerm, Pageable pageable) {
        log.debug("Searching students with term: {}", searchTerm);
        
        return studentRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        searchTerm, searchTerm, searchTerm, pageable)
                .map(this::mapToDTO);
    }
    
    private StudentDTO mapToDTO(Student student) {
        return StudentDTO.builder()
                .id(student.getId())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .email(student.getEmail())
                .phone(student.getPhone())
                .dateOfBirth(student.getDateOfBirth())
                .address(student.getAddress())
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }
    
    private Student mapToEntity(StudentDTO studentDTO) {
        return Student.builder()
                .id(studentDTO.getId())
                .firstName(studentDTO.getFirstName())
                .lastName(studentDTO.getLastName())
                .email(studentDTO.getEmail())
                .phone(studentDTO.getPhone())
                .dateOfBirth(studentDTO.getDateOfBirth())
                .address(studentDTO.getAddress())
                .build();
    }
}
