'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';

interface UserRecord {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  role: { id: string; name: string; displayName: string };
}

interface RoleRecord {
  id: string;
  name: string;
  displayName: string;
  _count: { users: number };
}

interface AccessRequest {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  requester: { id: string; name: string; email: string };
  reviewer: { id: string; name: string } | null;
}

export default function ChangeAccessPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'requests'>('users');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ requestedRoleId: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, requestsRes] = await Promise.all([
        fetch('/api/access?type=users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/access?type=roles', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/access?type=requests', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [usersData, rolesData, requestsData] = await Promise.all([
        usersRes.json(),
        rolesRes.json(),
        requestsRes.json(),
      ]);

      if (usersData.success) setUsers(usersData.data);
      if (rolesData.success) setRoles(rolesData.data);
      if (requestsData.success) setRequests(requestsData.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    await fetch('/api/access', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, newRoleId }),
    });
    fetchData();
  };

  const handleRequestAction = async (requestId: string, status: string) => {
    await fetch('/api/access', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ requestId, status }),
    });
    fetchData();
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestForm),
      });
      setDialogOpen(false);
      setRequestForm({ requestedRoleId: '', reason: '' });
      fetchData();
    } catch (err) {
      console.error('Failed to submit request', err);
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors: Record<string, 'default' | 'success' | 'destructive' | 'warning'> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'destructive',
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Change Access</h1>
          <p className="text-slate-500">Manage roles and permissions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Request Access Change</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Role Change</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="space-y-2">
                <Label>Requested Role</Label>
                <Select onValueChange={(val) => setRequestForm({ ...requestForm, requestedRoleId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  required
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{role._count.users}</div>
              <p className="text-xs text-slate-500">{role.displayName}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'users' ? 'default' : 'outline'}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </Button>
        <Button
          variant={activeTab === 'requests' ? 'default' : 'outline'}
          onClick={() => setActiveTab('requests')}
        >
          Access Requests ({requests.filter((r) => r.status === 'PENDING').length})
        </Button>
      </div>

      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>All Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Change Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{u.role.displayName}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? 'success' : 'destructive'}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select onValueChange={(val) => handleRoleChange(u.id, val)}>
                        <SelectTrigger className="w-40 h-8">
                          <SelectValue placeholder="Change role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r.id} value={r.id}>{r.displayName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'requests' && (
        <Card>
          <CardHeader>
            <CardTitle>Access Change Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No access change requests.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requester</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.requester.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{req.reason}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[req.status] || 'default'}>{req.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(req.createdAt)}</TableCell>
                      <TableCell>
                        {req.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => handleRequestAction(req.id, 'APPROVED')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-red-600"
                              onClick={() => handleRequestAction(req.id, 'REJECTED')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
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
