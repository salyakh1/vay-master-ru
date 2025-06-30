"use client";
import MobileBannerSlider from "./MobileBannerSlider";
import Image from "next/image";

interface Banner {
  id: string;
  position: number;
  active: boolean;
  images?: string[];
  links?: string[];
  image?: string;
  link?: string;
  title?: string;
}

export default function MainMobileBanners({ banners }: { banners: Banner[] }) {
  // Слайдер баннеров (позиция 6)
  const bannerSlider = banners.find(b => b.position === 6 && b.active && Array.isArray(b.images) && b.images.length > 0);
  // Статичный баннер (позиция 7)
  const bannerStatic = banners.find(b => b.position === 7 && b.active && b.image);

  return (
    <div className="w-full flex flex-col gap-4 px-0 mb-4">
      {/* Слайдер */}
      {bannerSlider && (
        <div className="animate-fade-in delay-150">
          <MobileBannerSlider images={bannerSlider.images!} links={bannerSlider.links || []} />
        </div>
      )}
      {/* Статичный баннер */}
      {bannerStatic && (
        <div className="animate-fade-in delay-200">
          <a
            href={bannerStatic.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="relative h-32 w-full">
              <Image
                src={bannerStatic.image!}
                alt={bannerStatic.title || 'Рекламный баннер'}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              {bannerStatic.title && (
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold drop-shadow-lg">{bannerStatic.title}</h3>
                </div>
              )}
            </div>
          </a>
        </div>
      )}
    </div>
  );
} 