import Image from 'next/image';
import Link from 'next/link';
import type { MasterUser } from '@/types/user';
import { StarIcon, MapPinIcon } from '@heroicons/react/20/solid';
import { FaPhone, FaWhatsapp } from 'react-icons/fa';

interface MasterCardProps {
  master: MasterUser;
}

export default function MasterCard({ master }: MasterCardProps) {
  const whatsappLink = master.socialLinks?.whatsapp 
    ? `https://wa.me/${master.socialLinks.whatsapp.replace(/\D/g, '')}`
    : '';

  return (
    <Link href={`/profile/${master.id}`} className="block w-full">
      <div className="group relative flex flex-col h-full bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out overflow-hidden border border-gray-200">
        <div className="relative pt-[50%]">
          {/* Banner/Cover Image - assuming master might have one */}
          <Image
            src={master.banner || '/placeholder-banner.jpg'} // Fallback to a generic banner
            alt={`${master.name}'s banner`}
            fill
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20"></div> {/* Overlay */}
        </div>
        
        {/* Avatar */}
        <div className="absolute top-[calc(50%-48px)] left-1/2 -translate-x-1/2 w-24 h-24">
           <div className="relative w-full h-full">
          {master.avatar ? (
            <Image
              src={master.avatar}
              alt={master.name}
              fill
                className="rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-md">
              {(master.name?.[0] || '?').toUpperCase()}
            </div>
          )}
        </div>
        </div>

        <div className="flex flex-col flex-grow p-4 pt-16 text-center"> {/* pt-16 to clear avatar */}
          {/* Name and Rating */}
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-gray-900">{master.name}</h3>
            {master.rating !== undefined && master.rating !== null && (
               <div className="flex items-center justify-center gap-1 mt-1">
                <StarIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-600 font-semibold">{master.rating.toFixed(1)}</span>
      </div>
            )}
             {/* City */}
            {master.city && (
                <div className="flex items-center justify-center gap-1.5 mt-2 text-gray-500">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="text-sm">{master.city}</span>
          </div>
            )}
          </div>
         
          {/* Services */}
        {master.services && master.services.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
            {master.services.slice(0, 3).map(service => (
              <span
                key={service.id}
                  className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-xs font-medium"
              >
                {service.title}
              </span>
            ))}
            {master.services.length > 3 && (
                <span className="bg-gray-200 text-gray-600 rounded-full px-3 py-1 text-xs font-medium">
                +{master.services.length - 3}
              </span>
            )}
          </div>
        )}

        </div>
        
        {/* Contact Icons - positioned at bottom right */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {master.phone && (
            <a
              href={`tel:${master.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-9 h-9 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
              title="Позвонить"
            >
              <FaPhone className="w-4 h-4" />
            </a>
          )}
           {whatsappLink && (
            <a
                    href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-9 h-9 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full text-green-600 hover:bg-green-100 transition-colors"
              title="WhatsApp"
            >
                    <FaWhatsapp className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </Link>
  );
} 
