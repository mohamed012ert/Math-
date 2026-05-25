export type Role = 'public' | 'admin' | 'teacher';

export interface Student {
  _row: number;
  Name: string;
  Grade: string;
  Subject: string;
  Absence: number;
  NoHomework: number;
  Points: number;
}

export interface Teacher {
  _row: number;
  'Teacher Name': string;
  'Assigned Subject': string;
  Password: string;
}

export interface Subject {
  _row: number;
  'Subject Name': string;
}

export interface AppData {
  students: Student[];
  subjects: Subject[];
  teachers: Teacher[];
}

export interface TeacherAuth {
  name: string;
  subject: string;
}

export type ToastType = 'success' | 'error' | 'info';
export type ViewId = 'dashboard' | 'students' | 'teachers' | 'subjects' | 'query';
