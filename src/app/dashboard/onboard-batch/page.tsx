'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

interface Batch {
  id: string;
  name: string;
  programName: string;
  academicYear: string;
  status: string;
  createdAt: string;
  _count: { divisions: number; courses: number };
}

export default function OnboardBatchPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', programName: '', academicYear: '' });
  const [submitting, setSubmitting] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/batches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setBatches(data.data);
    } catch (err) {
      console.error('Failed to fetch batches', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setDialogOpen(false);
        setForm({ name: '', programName: '', academicYear: '' });
        fetchBatches();
      }
    } catch (err) {
      console.error('Failed to create batch', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-slate-500">Loading batches...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Onboard Batch</h1>
          <p className="text-slate-500">Create and manage academic batches</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Batch</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Batch</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Batch Name</Label>
                <Input
                  placeholder="e.g., PGDM 25-27"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Program Name</Label>
                <Input
                  placeholder="e.g., PGDM"
                  value={form.programName}
                  onChange={(e) => setForm({ ...form, programName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Input
                  placeholder="e.g., 2025-2027"
                  value={form.academicYear}
                  onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Batch'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Batches</CardTitle>
        </CardHeader>
        <CardContent>
          {batches.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No batches yet. Create your first batch.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Divisions</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.name}</TableCell>
                    <TableCell>{batch.programName}</TableCell>
                    <TableCell>{batch.academicYear}</TableCell>
                    <TableCell>{batch._count.divisions}</TableCell>
                    <TableCell>{batch._count.courses}</TableCell>
                    <TableCell>
                      <Badge variant={batch.status === 'ACTIVE' ? 'success' : 'secondary'}>
                        {batch.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(batch.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
