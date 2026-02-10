export type RoleName =
  | 'DEVELOPER'
  | 'PROGRAM_OFFICE'
  | 'FACULTY'
  | 'TA'
  | 'STUDENT'
  | 'COCO'
  | 'SODEXO'
  | 'EXAM_CELL';

export type TileKey =
  | 'onboard_batch'
  | 'manage_batches'
  | 'timetable'
  | 'attendance_hub'
  | 'materials'
  | 'concerns'
  | 'leave_requests'
  | 'sodexo_support'
  | 'change_access';

export interface TileConfig {
  key: TileKey;
  title: string;
  description: string;
  href: string;
  icon: string;
}

export interface UserSession {
  userId: string;
  email: string;
  roleId: string;
  roleName: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
