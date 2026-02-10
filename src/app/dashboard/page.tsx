'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TILE_CONFIGS } from '@/lib/constants';
import {
  GraduationCap,
  Users,
  Calendar,
  ClipboardCheck,
  BookOpen,
  MessageSquare,
  CalendarOff,
  Wrench,
  Shield,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  Users,
  Calendar,
  ClipboardCheck,
  BookOpen,
  MessageSquare,
  CalendarOff,
  Wrench,
  Shield,
};

interface AllowedTile {
  tileKey: string;
  canWrite: boolean;
}

export default function DashboardPage() {
  const [allowedTiles, setAllowedTiles] = useState<AllowedTile[]>([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setAllowedTiles(data.data.allowedTiles);
          setUserName(data.data.name);
        }
      } catch (err) {
        console.error('Failed to fetch permissions', err);
      }
    };

    fetchPermissions();
  }, []);

  const visibleTiles = TILE_CONFIGS.filter((tile) =>
    allowedTiles.some((at) => at.tileKey === tile.key)
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome, {userName || 'User'}
        </h1>
        <p className="text-slate-500 mt-1">Select a module to get started</p>
      </div>

      {visibleTiles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No modules available for your role.</p>
          <p className="text-sm text-slate-400 mt-2">
            Contact the Program Office to request access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleTiles.map((tile) => {
            const IconComponent = iconMap[tile.icon];
            return (
              <Link key={tile.key} href={tile.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {IconComponent && (
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <IconComponent className="h-6 w-6 text-slate-700" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{tile.title}</CardTitle>
                        <CardDescription>{tile.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
