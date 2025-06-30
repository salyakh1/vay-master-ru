import AdminBackButton from '@/app/components/admin/AdminBackButton';
import dynamic from 'next/dynamic';

const AdminAdsManager = dynamic(() => import('@/app/components/admin/AdminAdsManager'), { ssr: false });

export default function AdminAdsPage() {
  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6 mt-6">
      <div className="flex items-center mb-6 gap-4">
        <AdminBackButton />
        <h2 className="text-2xl font-bold">Реклама</h2>
      </div>
      <AdminAdsManager />
    </div>
  );
} 