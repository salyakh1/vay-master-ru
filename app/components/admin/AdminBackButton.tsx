"use client";
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function AdminBackButton() {
  const router = useRouter();
  return (
    <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-600 hover:underline font-medium text-sm">
      <FaArrowLeft /> Назад
    </button>
  );
} 