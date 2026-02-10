import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ROLES = [
  { name: 'DEVELOPER', displayName: 'Developer', isAdmin: true },
  { name: 'PROGRAM_OFFICE', displayName: 'Program Office', isAdmin: true },
  { name: 'FACULTY', displayName: 'Faculty', isAdmin: false },
  { name: 'TA', displayName: 'Teaching Assistant', isAdmin: false },
  { name: 'STUDENT', displayName: 'Student', isAdmin: false },
  { name: 'COCO', displayName: 'Classroom Coordinator', isAdmin: false },
  { name: 'SODEXO', displayName: 'Sodexo Team', isAdmin: false },
  { name: 'EXAM_CELL', displayName: 'Examination Cell', isAdmin: false },
];

const PERMISSIONS: Record<string, Array<{ tileKey: string; canAccess: boolean; canWrite: boolean }>> = {
  DEVELOPER: [
    { tileKey: 'onboard_batch', canAccess: true, canWrite: true },
    { tileKey: 'manage_batches', canAccess: true, canWrite: true },
    { tileKey: 'timetable', canAccess: true, canWrite: true },
    { tileKey: 'attendance_hub', canAccess: true, canWrite: true },
    { tileKey: 'materials', canAccess: true, canWrite: true },
    { tileKey: 'concerns', canAccess: true, canWrite: true },
    { tileKey: 'leave_requests', canAccess: true, canWrite: true },
    { tileKey: 'sodexo_support', canAccess: true, canWrite: true },
    { tileKey: 'change_access', canAccess: true, canWrite: true },
  ],
  PROGRAM_OFFICE: [
    { tileKey: 'onboard_batch', canAccess: true, canWrite: true },
    { tileKey: 'manage_batches', canAccess: true, canWrite: true },
    { tileKey: 'timetable', canAccess: true, canWrite: true },
    { tileKey: 'attendance_hub', canAccess: true, canWrite: true },
    { tileKey: 'materials', canAccess: true, canWrite: true },
    { tileKey: 'concerns', canAccess: true, canWrite: true },
    { tileKey: 'leave_requests', canAccess: true, canWrite: true },
    { tileKey: 'sodexo_support', canAccess: true, canWrite: true },
    { tileKey: 'change_access', canAccess: true, canWrite: true },
  ],
  FACULTY: [
    { tileKey: 'timetable', canAccess: true, canWrite: true },
    { tileKey: 'attendance_hub', canAccess: true, canWrite: true },
    { tileKey: 'materials', canAccess: true, canWrite: true },
    { tileKey: 'concerns', canAccess: true, canWrite: false },
    { tileKey: 'sodexo_support', canAccess: true, canWrite: true },
  ],
  TA: [
    { tileKey: 'timetable', canAccess: true, canWrite: false },
    { tileKey: 'attendance_hub', canAccess: true, canWrite: true },
    { tileKey: 'materials', canAccess: true, canWrite: true },
    { tileKey: 'concerns', canAccess: true, canWrite: false },
  ],
  STUDENT: [
    { tileKey: 'timetable', canAccess: true, canWrite: false },
    { tileKey: 'attendance_hub', canAccess: true, canWrite: false },
    { tileKey: 'materials', canAccess: true, canWrite: false },
    { tileKey: 'concerns', canAccess: true, canWrite: true },
    { tileKey: 'leave_requests', canAccess: true, canWrite: true },
  ],
  COCO: [
    { tileKey: 'timetable', canAccess: true, canWrite: true },
    { tileKey: 'attendance_hub', canAccess: true, canWrite: true },
    { tileKey: 'materials', canAccess: true, canWrite: true },
    { tileKey: 'concerns', canAccess: true, canWrite: true },
    { tileKey: 'leave_requests', canAccess: true, canWrite: false },
    { tileKey: 'sodexo_support', canAccess: true, canWrite: true },
  ],
  SODEXO: [
    { tileKey: 'timetable', canAccess: true, canWrite: false },
    { tileKey: 'sodexo_support', canAccess: true, canWrite: true },
  ],
  EXAM_CELL: [
    { tileKey: 'timetable', canAccess: true, canWrite: true },
    { tileKey: 'attendance_hub', canAccess: true, canWrite: false },
  ],
};

const hash = (pw: string) => bcrypt.hashSync(pw, 10);

async function main() {
  console.log('Seeding database...');

  // Create roles
  const roleMap: Record<string, string> = {};
  for (const role of ROLES) {
    const created = await prisma.role.upsert({
      where: { name: role.name },
      update: { displayName: role.displayName, isAdmin: role.isAdmin },
      create: role,
    });
    roleMap[role.name] = created.id;
    console.log(`  Role: ${role.name} (${created.id})`);
  }

  // Create permissions
  for (const [roleName, perms] of Object.entries(PERMISSIONS)) {
    for (const perm of perms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_tileKey: { roleId: roleMap[roleName], tileKey: perm.tileKey },
        },
        update: { canAccess: perm.canAccess, canWrite: perm.canWrite },
        create: {
          roleId: roleMap[roleName],
          tileKey: perm.tileKey,
          canAccess: perm.canAccess,
          canWrite: perm.canWrite,
        },
      });
    }
    console.log(`  Permissions for: ${roleName}`);
  }

  // Create users
  const users = [
    { email: 'dev@spjimr.edu', name: 'Developer Admin', role: 'DEVELOPER' },
    { email: 'admin@spjimr.edu', name: 'Program Office Admin', role: 'PROGRAM_OFFICE' },
    { email: 'faculty@spjimr.edu', name: 'Prof. Sharma', role: 'FACULTY' },
    { email: 'ta@spjimr.edu', name: 'Rahul TA', role: 'TA' },
    { email: 'student1@spjimr.edu', name: 'Aarav Patel', role: 'STUDENT' },
    { email: 'student2@spjimr.edu', name: 'Priya Singh', role: 'STUDENT' },
    { email: 'coco@spjimr.edu', name: 'CoCo Coordinator', role: 'COCO' },
    { email: 'sodexo@spjimr.edu', name: 'Sodexo Operator', role: 'SODEXO' },
  ];

  const userMap: Record<string, string> = {};
  for (const u of users) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, roleId: roleMap[u.role] },
      create: {
        email: u.email,
        name: u.name,
        password: hash('password123'),
        roleId: roleMap[u.role],
      },
    });
    userMap[u.email] = created.id;
    console.log(`  User: ${u.email} (${u.role})`);
  }

  // Create batches
  const batch1 = await prisma.batch.upsert({
    where: { id: 'batch-pgdm-25-27' },
    update: {},
    create: {
      id: 'batch-pgdm-25-27',
      name: 'PGDM 25-27',
      programName: 'PGDM',
      academicYear: '2025-2027',
    },
  });

  const batch2 = await prisma.batch.upsert({
    where: { id: 'batch-pgdm-24-26' },
    update: {},
    create: {
      id: 'batch-pgdm-24-26',
      name: 'PGDM 24-26',
      programName: 'PGDM',
      academicYear: '2024-2026',
    },
  });
  console.log(`  Batches: ${batch1.name}, ${batch2.name}`);

  // Create divisions
  const divA = await prisma.division.upsert({
    where: { id: 'div-a-25-27' },
    update: {},
    create: {
      id: 'div-a-25-27',
      batchId: batch1.id,
      name: 'Division A',
      type: 'CORE',
    },
  });

  const divB = await prisma.division.upsert({
    where: { id: 'div-b-25-27' },
    update: {},
    create: {
      id: 'div-b-25-27',
      batchId: batch1.id,
      name: 'Division B',
      type: 'CORE',
    },
  });

  await prisma.division.upsert({
    where: { id: 'div-mktg-25-27' },
    update: {},
    create: {
      id: 'div-mktg-25-27',
      batchId: batch1.id,
      name: 'Marketing Specialization',
      type: 'SPECIALIZATION',
    },
  });
  console.log('  Divisions created');

  // Create courses
  const course1 = await prisma.course.upsert({
    where: { id: 'course-mm-101' },
    update: {},
    create: {
      id: 'course-mm-101',
      batchId: batch1.id,
      name: 'Marketing Management',
      code: 'MM-101',
      description: 'Introduction to Marketing Management',
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: 'course-fm-101' },
    update: {},
    create: {
      id: 'course-fm-101',
      batchId: batch1.id,
      name: 'Financial Management',
      code: 'FM-101',
      description: 'Introduction to Financial Management',
    },
  });

  const course3 = await prisma.course.upsert({
    where: { id: 'course-ob-101' },
    update: {},
    create: {
      id: 'course-ob-101',
      batchId: batch1.id,
      name: 'Organizational Behavior',
      code: 'OB-101',
      description: 'Introduction to Organizational Behavior',
    },
  });
  console.log(`  Courses: ${course1.code}, ${course2.code}, ${course3.code}`);

  // Create timetable events
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const events = [
    { id: 'event-1', divisionId: divA.id, title: 'Marketing Management Lecture', date: today, startTime: '09:00', endTime: '10:30', location: 'Room 301', eventType: 'LECTURE' },
    { id: 'event-2', divisionId: divA.id, title: 'Financial Management Lecture', date: today, startTime: '11:00', endTime: '12:30', location: 'Room 302', eventType: 'LECTURE' },
    { id: 'event-3', divisionId: divB.id, title: 'Organizational Behavior', date: today, startTime: '14:00', endTime: '15:30', location: 'Room 201', eventType: 'LECTURE' },
    { id: 'event-4', divisionId: divA.id, title: 'Marketing Management Tutorial', date: tomorrow, startTime: '09:00', endTime: '10:30', location: 'Room 301', eventType: 'LAB' },
    { id: 'event-5', divisionId: divB.id, title: 'Financial Management Lecture', date: tomorrow, startTime: '11:00', endTime: '12:30', location: 'Room 302', eventType: 'LECTURE' },
    { id: 'event-6', divisionId: divA.id, title: 'OB Group Discussion', date: dayAfter, startTime: '09:00', endTime: '10:30', location: 'Room 201', eventType: 'OTHER' },
  ];

  for (const event of events) {
    await prisma.timetableEvent.upsert({
      where: { id: event.id },
      update: {},
      create: event,
    });
  }
  console.log('  Timetable events created');

  // Create attendance records
  const attendanceRecords = [
    { userId: userMap['student1@spjimr.edu'], timetableEventId: 'event-1', divisionId: divA.id, status: 'PRESENT', source: 'BIOMETRIC' },
    { userId: userMap['student1@spjimr.edu'], timetableEventId: 'event-2', divisionId: divA.id, status: 'PRESENT', source: 'BIOMETRIC' },
    { userId: userMap['student1@spjimr.edu'], timetableEventId: 'event-4', divisionId: divA.id, status: 'ABSENT', source: 'BIOMETRIC' },
    { userId: userMap['student2@spjimr.edu'], timetableEventId: 'event-3', divisionId: divB.id, status: 'PRESENT', source: 'BIOMETRIC' },
    { userId: userMap['student2@spjimr.edu'], timetableEventId: 'event-5', divisionId: divB.id, status: 'LATE', source: 'MANUAL' },
  ];

  for (const record of attendanceRecords) {
    await prisma.attendanceRecord.upsert({
      where: {
        userId_timetableEventId: {
          userId: record.userId,
          timetableEventId: record.timetableEventId,
        },
      },
      update: {},
      create: record,
    });
  }
  console.log('  Attendance records created');

  // Create sample materials
  const materials = [
    { id: 'mat-1', courseId: course1.id, uploadedById: userMap['faculty@spjimr.edu'], title: 'Session 1 - Introduction to Marketing', category: 'SLIDES', sessionNumber: 1 },
    { id: 'mat-2', courseId: course1.id, uploadedById: userMap['ta@spjimr.edu'], title: 'Marketing Case Study - Amul', category: 'READING', sessionNumber: 2 },
    { id: 'mat-3', courseId: course2.id, uploadedById: userMap['faculty@spjimr.edu'], title: 'Financial Statements Overview', category: 'LECTURE_NOTES', sessionNumber: 1 },
    { id: 'mat-4', courseId: course3.id, uploadedById: userMap['faculty@spjimr.edu'], title: 'OB - Motivation Theories', category: 'SLIDES', sessionNumber: 3 },
  ];

  for (const mat of materials) {
    await prisma.material.upsert({
      where: { id: mat.id },
      update: {},
      create: mat,
    });
  }
  console.log('  Materials created');

  // Create sample concern
  await prisma.concern.upsert({
    where: { id: 'concern-1' },
    update: {},
    create: {
      id: 'concern-1',
      userId: userMap['student1@spjimr.edu'],
      subject: 'AC not working in Room 301',
      body: 'The air conditioning in Room 301 has not been working for the past two days. It is very uncomfortable during the afternoon lectures.',
      category: 'INFRASTRUCTURE',
      status: 'OPEN',
    },
  });
  console.log('  Sample concern created');

  // Create sample leave request
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 2);

  await prisma.leaveRequest.upsert({
    where: { id: 'leave-1' },
    update: {},
    create: {
      id: 'leave-1',
      userId: userMap['student2@spjimr.edu'],
      purpose: 'Family function - sister wedding',
      startDate: nextWeek,
      endDate: nextWeekEnd,
      status: 'PENDING',
    },
  });
  console.log('  Sample leave request created');

  // Create sample sodexo issue
  await prisma.sodexoIssue.upsert({
    where: { id: 'sodexo-1' },
    update: {},
    create: {
      id: 'sodexo-1',
      reportedById: userMap['coco@spjimr.edu'],
      location: 'Room 302',
      description: 'Projector not displaying properly. Colors are distorted.',
      priority: 'HIGH',
      status: 'OPEN',
    },
  });
  console.log('  Sample sodexo issue created');

  console.log('\nSeed completed successfully!');
  console.log('\nTest accounts (password: password123):');
  console.log('  Developer:      dev@spjimr.edu');
  console.log('  Program Office: admin@spjimr.edu');
  console.log('  Faculty:        faculty@spjimr.edu');
  console.log('  TA:             ta@spjimr.edu');
  console.log('  Student 1:      student1@spjimr.edu');
  console.log('  Student 2:      student2@spjimr.edu');
  console.log('  CoCo:           coco@spjimr.edu');
  console.log('  Sodexo:         sodexo@spjimr.edu');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
