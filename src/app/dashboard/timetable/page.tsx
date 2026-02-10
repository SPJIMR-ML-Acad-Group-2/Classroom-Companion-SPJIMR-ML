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
import { formatDate, formatTime } from '@/lib/utils';

interface Batch {
  id: string;
  name: string;
  divisions: Array<{ id: string; name: string }>;
}

interface TimetableEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string | null;
  eventType: string;
  division: { id: string; name: string; batch?: { name: string } };
}

export default function TimetablePage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [events, setEvents] = useState<TimetableEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    divisionId: '',
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    eventType: 'LECTURE',
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
    if (!selectedBatch && !selectedDivision) return;
    const fetchEvents = async () => {
      setLoading(true);
      const param = selectedDivision
        ? `divisionId=${selectedDivision}`
        : `batchId=${selectedBatch}`;
      const res = await fetch(`/api/timetable?${param}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setEvents(data.data);
      setLoading(false);
    };
    fetchEvents();
  }, [selectedBatch, selectedDivision]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentBatch = batches.find((b) => b.id === selectedBatch);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/timetable', {
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
        setForm({ divisionId: '', title: '', date: '', startTime: '', endTime: '', location: '', eventType: 'LECTURE' });
        // Refresh
        if (selectedDivision || selectedBatch) {
          const param = selectedDivision
            ? `divisionId=${selectedDivision}`
            : `batchId=${selectedBatch}`;
          const res2 = await fetch(`/api/timetable?${param}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data2 = await res2.json();
          if (data2.success) setEvents(data2.data);
        }
      }
    } catch (err) {
      console.error('Failed to create event', err);
    } finally {
      setSubmitting(false);
    }
  };

  const eventTypeColors: Record<string, string> = {
    LECTURE: 'default',
    LAB: 'secondary',
    EXAM: 'destructive',
    OTHER: 'outline',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Timetable & Workload</h1>
          <p className="text-slate-500">Schedule events and monitor workload</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Timetable Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Division</Label>
                <Select onValueChange={(val) => setForm({ ...form, divisionId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.flatMap((b) =>
                      (b.divisions || []).map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {b.name} - {d.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g., Marketing Management Lecture"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={form.eventType}
                    onValueChange={(val) => setForm({ ...form, eventType: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LECTURE">Lecture</SelectItem>
                      <SelectItem value="LAB">Lab</SelectItem>
                      <SelectItem value="EXAM">Exam</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="e.g., Room 301"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Event'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
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
              <SelectValue placeholder="All divisions" />
            </SelectTrigger>
            <SelectContent>
              {currentBatch.divisions.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Events</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500 text-center py-8">Loading...</p>
          ) : events.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              {selectedBatch ? 'No events scheduled.' : 'Select a batch to view timetable.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Division</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{formatDate(event.date)}</TableCell>
                    <TableCell>{formatTime(event.startTime)} - {formatTime(event.endTime)}</TableCell>
                    <TableCell>{event.division?.name}</TableCell>
                    <TableCell>{event.location || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={eventTypeColors[event.eventType] as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        {event.eventType}
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
