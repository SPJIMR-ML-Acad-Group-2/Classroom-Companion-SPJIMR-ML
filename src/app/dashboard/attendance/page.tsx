'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Batch {
  id: string;
  name: string;
  divisions: Array<{ id: string; name: string }>;
}

interface AttendanceSummary {
  userId: string;
  name: string;
  total: number;
  present: number;
  percentage: number;
}

interface StudentSummary {
  total: number;
  present: number;
  absent: number;
  excused: number;
  percentage: number;
}

export default function AttendancePage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [divisionSummary, setDivisionSummary] = useState<AttendanceSummary[]>([]);
  const [studentSummary, setStudentSummary] = useState<StudentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'division' | 'personal'>('division');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchBatches = async () => {
      const res = await fetch('/api/batches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setBatches(data.data);
    };
    fetchBatches();

    // Fetch personal summary
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      fetch(`/api/attendance?summary=student&userId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setStudentSummary(data.data);
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedDivision) return;
    const fetchDivisionSummary = async () => {
      setLoading(true);
      const res = await fetch(`/api/attendance?summary=division&divisionId=${selectedDivision}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setDivisionSummary(data.data);
      setLoading(false);
    };
    fetchDivisionSummary();
  }, [selectedDivision]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentBatch = batches.find((b) => b.id === selectedBatch);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Attendance Hub</h1>
        <p className="text-slate-500">View and manage attendance records</p>
      </div>

      {/* Personal Summary */}
      {studentSummary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{studentSummary.percentage}%</div>
              <p className="text-xs text-slate-500">Overall Attendance</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{studentSummary.total}</div>
              <p className="text-xs text-slate-500">Total Classes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{studentSummary.present}</div>
              <p className="text-xs text-slate-500">Present</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{studentSummary.absent}</div>
              <p className="text-xs text-slate-500">Absent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{studentSummary.excused}</div>
              <p className="text-xs text-slate-500">Excused</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View mode toggle */}
      <div className="flex gap-4 mb-6">
        <Select value={viewMode} onValueChange={(val) => setViewMode(val as 'division' | 'personal')}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="division">Division View</SelectItem>
            <SelectItem value="personal">Personal View</SelectItem>
          </SelectContent>
        </Select>

        {viewMode === 'division' && (
          <>
            <Select value={selectedBatch} onValueChange={(val) => { setSelectedBatch(val); setSelectedDivision(''); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentBatch && currentBatch.divisions?.length > 0 && (
              <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  {currentBatch.divisions.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </>
        )}
      </div>

      {/* Division Summary */}
      {viewMode === 'division' && (
        <Card>
          <CardHeader>
            <CardTitle>Division Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-slate-500 text-center py-8">Loading...</p>
            ) : !selectedDivision ? (
              <p className="text-slate-500 text-center py-8">Select a batch and division to view attendance.</p>
            ) : divisionSummary.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No attendance records found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Total Classes</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Attendance %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {divisionSummary.map((student) => (
                    <TableRow key={student.userId}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.total}</TableCell>
                      <TableCell>{student.present}</TableCell>
                      <TableCell>{student.percentage}%</TableCell>
                      <TableCell>
                        <Badge variant={student.percentage >= 75 ? 'success' : student.percentage >= 60 ? 'warning' : 'destructive'}>
                          {student.percentage >= 75 ? 'Good' : student.percentage >= 60 ? 'Warning' : 'Critical'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
