import { TileConfig } from './types';

export const TILE_CONFIGS: TileConfig[] = [
  {
    key: 'onboard_batch',
    title: 'Onboard Batch',
    description: 'Create and manage academic batches',
    href: '/dashboard/onboard-batch',
    icon: 'GraduationCap',
  },
  {
    key: 'manage_batches',
    title: 'Manage Batches',
    description: 'Divisions, specializations, and groups',
    href: '/dashboard/manage-batches',
    icon: 'Users',
  },
  {
    key: 'timetable',
    title: 'Timetable & Workload',
    description: 'Schedule events and monitor workload',
    href: '/dashboard/timetable',
    icon: 'Calendar',
  },
  {
    key: 'attendance_hub',
    title: 'Attendance Hub',
    description: 'View and manage attendance records',
    href: '/dashboard/attendance',
    icon: 'ClipboardCheck',
  },
  {
    key: 'materials',
    title: 'Session Materials',
    description: 'Centralized course material repository',
    href: '/dashboard/materials',
    icon: 'BookOpen',
  },
  {
    key: 'concerns',
    title: 'Student Concerns',
    description: 'Track and resolve student concerns',
    href: '/dashboard/concerns',
    icon: 'MessageSquare',
  },
  {
    key: 'leave_requests',
    title: 'Leave Requests',
    description: 'Manage leave applications',
    href: '/dashboard/leaves',
    icon: 'CalendarOff',
  },
  {
    key: 'sodexo_support',
    title: 'Sodexo Support',
    description: 'Report AV and facility issues',
    href: '/dashboard/sodexo',
    icon: 'Wrench',
  },
  {
    key: 'change_access',
    title: 'Change Access',
    description: 'Manage roles and permissions',
    href: '/dashboard/change-access',
    icon: 'Shield',
  },
];

export const ROLE_NAMES = {
  DEVELOPER: 'DEVELOPER',
  PROGRAM_OFFICE: 'PROGRAM_OFFICE',
  FACULTY: 'FACULTY',
  TA: 'TA',
  STUDENT: 'STUDENT',
  COCO: 'COCO',
  SODEXO: 'SODEXO',
  EXAM_CELL: 'EXAM_CELL',
} as const;

export const DEFAULT_PASSWORD = 'password123';
