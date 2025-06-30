"use client";
import { useState, useEffect } from 'react';
import { specializations } from '@/types/categories';

// Собираем все специализации в один массив
const allSpecs = Object.values(specializations).flat();

export default function SpecialtiesSlider() {
  const [currentSpec, setCurrentSpec] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSpec((prev) => (prev + 1) % allSpecs.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full flex justify-center items-center mb-6 px-2">
      <div className="relative w-full max-w-xl h-32">
        {allSpecs.map((spec, i) => (
          <div
            key={spec.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${i === currentSpec ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0'} pointer-events-none`}
            style={{
              boxShadow: '0 8px 32px 0 rgba(80, 80, 180, 0.18), 0 2px 8px 0 rgba(80,80,180,0.10)',
              borderRadius: '1.5rem',
              background: 'linear-gradient(135deg, #fff 80%, #e0e7ff 100%)',
            }}
          >
            <div className="w-full h-full flex flex-col justify-center items-center p-6">
              <div className="font-bold text-blue-700 text-lg mb-2 text-center drop-shadow">{spec.title}</div>
              {/* Английское название категории скрыто по требованию пользователя */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 