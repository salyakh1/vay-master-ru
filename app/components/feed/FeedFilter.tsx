'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { UserRole } from '@/types/user';

export default function FeedFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRole = searchParams.get('role') as UserRole | null;

  const handleRoleChange = (role: UserRole | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (role) {
      params.set('role', role);
    } else {
      params.delete('role');
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex space-x-4">
      <button
        onClick={() => handleRoleChange(null)}
        className={`btn ${
          !currentRole
            ? 'btn-primary'
            : 'bg-muted text-muted-foreground hover:bg-muted/90'
        }`}
      >
        Все
      </button>
      <button
        onClick={() => handleRoleChange('MASTER')}
        className={`btn ${
          currentRole === 'MASTER'
            ? 'btn-primary'
            : 'bg-muted text-muted-foreground hover:bg-muted/90'
        }`}
      >
        Мастера
      </button>
      <button
        onClick={() => handleRoleChange('SHOP')}
        className={`btn ${
          currentRole === 'SHOP'
            ? 'btn-primary'
            : 'bg-muted text-muted-foreground hover:bg-muted/90'
        }`}
      >
        Магазины
      </button>
    </div>
  );
} 