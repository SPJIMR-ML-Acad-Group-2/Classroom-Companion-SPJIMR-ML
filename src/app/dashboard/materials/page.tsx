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
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/utils';

interface Batch {
  id: string;
  name: string;
  courses: Array<{ id: string; name: string; code: string }>;
}

interface Material {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileName: string | null;
  sessionNumber: number | null;
  createdAt: string;
  course: { id: string; name: string; code: string };
  uploadedBy: { id: string; name: string };
}

export default function MaterialsPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    courseId: '',
    title: '',
    description: '',
    category: 'LECTURE_NOTES',
    fileName: '',
    sessionNumber: '',
  });
  const [submitting, setSubmitting] = useState(false);

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedBatch) return;
    const fetchMaterials = async () => {
      setLoading(true);
      const res = await fetch(`/api/materials?batchId=${selectedBatch}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMaterials(data.data);
      setLoading(false);
    };
    fetchMaterials();
  }, [selectedBatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    const res = await fetch(`/api/materials?search=${encodeURIComponent(searchQuery)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setMaterials(data.data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          sessionNumber: form.sessionNumber ? parseInt(form.sessionNumber) : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDialogOpen(false);
        setForm({ courseId: '', title: '', description: '', category: 'LECTURE_NOTES', fileName: '', sessionNumber: '' });
        if (selectedBatch) {
          const res2 = await fetch(`/api/materials?batchId=${selectedBatch}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data2 = await res2.json();
          if (data2.success) setMaterials(data2.data);
        }
      }
    } catch (err) {
      console.error('Failed to create material', err);
    } finally {
      setSubmitting(false);
    }
  };

  const currentBatch = batches.find((b) => b.id === selectedBatch);

  const categoryLabels: Record<string, string> = {
    LECTURE_NOTES: 'Lecture Notes',
    SLIDES: 'Slides',
    READING: 'Reading',
    ASSIGNMENT: 'Assignment',
    OTHER: 'Other',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Session Materials</h1>
          <p className="text-slate-500">Centralized course material repository</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Upload Material</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Material</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Course</Label>
                <Select onValueChange={(val) => setForm({ ...form, courseId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.flatMap((b) =>
                      (b.courses || []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(val) => setForm({ ...form, category: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LECTURE_NOTES">Lecture Notes</SelectItem>
                      <SelectItem value="SLIDES">Slides</SelectItem>
                      <SelectItem value="READING">Reading</SelectItem>
                      <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Session #</Label>
                  <Input
                    type="number"
                    value={form.sessionNumber}
                    onChange={(e) => setForm({ ...form, sessionNumber: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Uploading...' : 'Upload Material'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={selectedBatch} onValueChange={setSelectedBatch}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select batch" />
          </SelectTrigger>
          <SelectContent>
            {batches.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2 flex-1">
          <Input
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="outline" onClick={handleSearch}>Search</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Materials {currentBatch ? `- ${currentBatch.name}` : ''}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500 text-center py-8">Loading...</p>
          ) : materials.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              {selectedBatch ? 'No materials found.' : 'Select a batch to view materials.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.title}</TableCell>
                    <TableCell>{m.course?.code}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{categoryLabels[m.category] || m.category}</Badge>
                    </TableCell>
                    <TableCell>{m.sessionNumber || '-'}</TableCell>
                    <TableCell>{m.uploadedBy?.name}</TableCell>
                    <TableCell>{formatDate(m.createdAt)}</TableCell>
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
