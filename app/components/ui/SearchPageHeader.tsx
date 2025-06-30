import React from 'react';

interface SearchPageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function SearchPageHeader({ title, subtitle }: SearchPageHeaderProps) {
  return (
    <div className="w-full bg-gradient-to-r from-purple-600 to-blue-500 py-12 px-4 md:px-0">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">{title}</h1>
        {subtitle && <p className="text-purple-100 text-lg drop-shadow">{subtitle}</p>}
      </div>
    </div>
  );
} 