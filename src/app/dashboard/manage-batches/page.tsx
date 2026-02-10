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

interface Batch {
  id: string;
  name: string;
}

interface Division {
  id: string;
  name: string;
  type: string;
  batch: { id: string; name: string };
}

export default function ManageBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ batchId: '', name: '', type: 'CORE' });
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
    const fetchDivisions = async () => {
      setLoading(true);
      const url = selectedBatch
        ? `/api/divisions?batchId=${selectedBatch}`
        : '/api/divisions';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setDivisions(data.data);
      setLoading(false);
    };
    fetchDivisions();
  }, [selectedBatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/divisions', {
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
        setForm({ batchId: '', name: '', type: 'CORE' });
        // Refresh
        const url = selectedBatch
          ? `/api/divisions?batchId=${selectedBatch}`
          : '/api/divisions';
        const res2 = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data2 = await res2.json();
        if (data2.success) setDivisions(data2.data);
      }
    } catch (err) {
      console.error('Failed to create division', err);
    } finally {
      setSubmitting(false);
    }
  };

  const typeColors: Record<string, string> = {
    CORE: 'default',
    SPECIALIZATION: 'secondary',
    CAD: 'outline',
    OTHER: 'outline',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Batches</h1>
          <p className="text-slate-500">Divisions, specializations, and groups</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Division</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Division</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Batch</Label>
                <Select onValueChange={(val) => setForm({ ...form, batchId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Division Name</Label>
                <Input
                  placeholder="e.g., Division A"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(val) => setForm({ ...form, type: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CORE">Core</SelectItem>
                    <SelectItem value="SPECIALIZATION">Specialization</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Division'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <Select value={selectedBatch} onValueChange={setSelectedBatch}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {batches.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Divisions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500 text-center py-8">Loading...</p>
          ) : divisions.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No divisions found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Division Name</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {divisions.map((div) => (
                  <TableRow key={div.id}>
                    <TableCell className="font-medium">{div.name}</TableCell>
                    <TableCell>{div.batch.name}</TableCell>
                    <TableCell>
                      <Badge variant={typeColors[div.type] as 'default' | 'secondary' | 'outline'}>
                        {div.type}
                      </Badge>
                    </TableCell>
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
