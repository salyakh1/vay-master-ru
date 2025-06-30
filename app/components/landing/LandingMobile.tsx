"use client";
import Link from 'next/link';
import { FaStar, FaStore, FaUserTie, FaRocket, FaCheckCircle, FaBullhorn } from 'react-icons/fa';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import MobileBannerSlider from "./MobileBannerSlider";
import SpecialtiesSlider from "./SpecialtiesSlider";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import MainMobileBanners from "./MainMobileBanners";

export default function LandingMobile() {
  const { data: session } = useSession();
  const city = session?.user?.city;
  const [mobileBanners, setMobileBanners] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/ads?mobileOnly=true")
      .then((res) => res.json())
      .then((data) => setMobileBanners(data));
  }, []);

  // Получаем только мобильный баннер 1 для слайдера
  const banner1 = mobileBanners.find(b => b.position === 6);
  const images = Array.isArray(banner1?.images) ? (banner1.images as string[]) : [];
  const links = Array.isArray((banner1 as any)?.links) ? ((banner1 as any).links as string[]) : [];

  // Получаем только мобильный баннер 2
  const banner2 = mobileBanners.find(b => b.position === 7);

  // Список специальностей
  const specialties = [
    { title: 'Электрик', desc: 'Монтаж и ремонт электропроводки, установка розеток и светильников.' },
    { title: 'Сантехник', desc: 'Устранение протечек, установка сантехники, разводка труб.' },
    { title: 'Плиточник', desc: 'Кладка плитки в ванных, кухнях и других помещениях.' },
    { title: 'Маляр', desc: 'Покраска стен, потолков, фасадов. Подготовка поверхностей.' },
    { title: 'Столяр', desc: 'Изготовление и ремонт мебели, дверей, окон.' },
    { title: 'Сварщик', desc: 'Сварочные работы любой сложности, металлоконструкции.' },
    { title: 'Отделочник', desc: 'Внутренняя и внешняя отделка помещений.' },
    { title: 'Кровельщик', desc: 'Монтаж и ремонт кровли, утепление крыш.' },
    { title: 'Гипсокартонщик', desc: 'Монтаж перегородок, потолков и ниш из ГКЛ.' },
    { title: 'Дизайнер', desc: 'Разработка дизайн-проектов интерьера и экстерьера.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100">
      {/* Приветственный заголовок */}
      <section className="w-full mt-4 mb-2 animate-fade-in">
        <div className="w-full bg-gradient-to-r from-purple-600 via-blue-500 to-blue-400 p-7 flex flex-col items-center rounded-3xl shadow-xl mx-auto max-w-md relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-300/30 rounded-full blur-2xl z-0" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-300/30 rounded-full blur-2xl z-0" />
          <h1 className="text-3xl font-extrabold text-white text-center mb-2 drop-shadow-lg animate-fade-in">Добро пожаловать в Vay Master!</h1>
          <p className="text-base text-white text-center opacity-90 mb-2 animate-fade-in delay-100">Платформа №1 для поиска и заказа услуг мастеров, магазинов и специалистов рядом с вами.</p>
        </div>
      </section>
      {/* Рекламные баннеры (слайдер + статичный) */}
      <MainMobileBanners banners={mobileBanners} />
      {/* Остальные рекламные баннеры */}
      <div className="px-4 py-8 space-y-6">
        {/* Автослайдер мастерских специальностей */}
        <SpecialtiesSlider />
        {/* Баннеры после специализаций убраны по требованию */}
      </div>

      {/* Преимущества платформы */}
      <section className="w-full max-w-md mx-auto mb-6 animate-fade-in delay-300">
        <h2 className="text-xl font-extrabold text-center mb-4 text-blue-700 drop-shadow-lg">Почему выбирают Vay Master?</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3 bg-white/90 rounded-xl shadow-lg p-4 hover:scale-[1.03] transition-transform duration-200">
            <FaRocket className="text-blue-500 text-2xl animate-bounce" />
            <div>
              <div className="font-semibold mb-0.5 text-base">Для мастеров</div>
              <div className="text-gray-600 text-xs">Поток клиентов, личный кабинет, продвижение услуг, честные отзывы.</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/90 rounded-xl shadow-lg p-4 hover:scale-[1.03] transition-transform duration-200">
            <FaStore className="text-blue-500 text-2xl animate-pulse" />
            <div>
              <div className="font-semibold mb-0.5 text-base">Для магазинов</div>
              <div className="text-gray-600 text-xs">Доступ к аудитории, размещение товаров, рост продаж и узнаваемости.</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/90 rounded-xl shadow-lg p-4 hover:scale-[1.03] transition-transform duration-200">
            <FaCheckCircle className="text-blue-500 text-2xl animate-fade-in" />
            <div>
              <div className="font-semibold mb-0.5 text-base">Для клиентов</div>
              <div className="text-gray-600 text-xs">Широкий выбор, быстрый поиск, реальные отзывы, гарантии качества.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Как это работает */}
      <section className="w-full max-w-md mx-auto animate-fade-in delay-400 mb-6">
        <h2 className="text-xl font-extrabold text-center mb-4 text-blue-700 drop-shadow-lg">Как это работает?</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3 bg-white/90 rounded-xl shadow-lg p-4">
            <FaUserTie className="text-blue-400 text-xl" />
            <div>
              <div className="font-semibold mb-0.5 text-base">1. Зарегистрируйтесь</div>
              <div className="text-gray-600 text-xs">Создайте аккаунт клиента, мастера или магазина.</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/90 rounded-xl shadow-lg p-4">
            <FaRocket className="text-blue-400 text-xl" />
            <div>
              <div className="font-semibold mb-0.5 text-base">2. Найдите или предложите услугу</div>
              <div className="text-gray-600 text-xs">Пользуйтесь поиском или размещайте свои предложения.</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/90 rounded-xl shadow-lg p-4">
            <FaCheckCircle className="text-blue-400 text-xl" />
            <div>
              <div className="font-semibold mb-0.5 text-base">3. Оцените результат</div>
              <div className="text-gray-600 text-xs">Оставьте отзыв и помогите другим выбрать лучшего!</div>
            </div>
          </div>
        </div>
      </section>

      {/* Отзывы пользователей */}
      <section className="w-full max-w-md mx-auto animate-fade-in delay-500 mb-8">
        <h2 className="text-xl font-extrabold text-center mb-4 text-blue-700 drop-shadow-lg">Отзывы пользователей</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar snap-x snap-mandatory">
          <div className="min-w-[220px] max-w-[220px] bg-white rounded-2xl shadow-lg p-4 flex-shrink-0 flex flex-col justify-between animate-fade-in">
            <div className="font-semibold mb-1">Анна, клиент</div>
            <div className="text-gray-600 text-xs mb-1">«Нашла отличного мастера по ремонту за 5 минут. Очень удобно!»</div>
            <div className="text-yellow-400">★★★★★</div>
          </div>
          <div className="min-w-[220px] max-w-[220px] bg-white rounded-2xl shadow-lg p-4 flex-shrink-0 flex flex-col justify-between animate-fade-in delay-200">
            <div className="font-semibold mb-1">Иван, мастер</div>
            <div className="text-gray-600 text-xs mb-1">«Получаю заказы без посредников, платформа реально помогает!»</div>
            <div className="text-yellow-400">★★★★★</div>
          </div>
        </div>
      </section>

      {/* Блоки 'Мастера' и 'Магазины' удалены по требованию пользователя */}
    </div>
  );
} 