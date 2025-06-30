'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { FaSearch, FaStar, FaUserTie, FaStore, FaRocket, FaCheckCircle, FaWhatsapp, FaRegSmile, FaRegThumbsUp, FaUsers, FaBriefcase, FaComments, FaQuestionCircle, FaPaperPlane, FaToolbox, FaTelegramPlane, FaInstagram, FaVk, FaHandPointer, FaUserPlus, FaAddressCard, FaListAlt, FaChevronDown, FaChevronLeft, FaChevronRight, FaPlug, FaTools, FaCouch, FaKey, FaTrash, FaWrench, FaUserShield, FaTruck, FaDesktop, FaCar, FaHome, FaBalanceScale, FaLock, FaWater, FaBroom } from 'react-icons/fa';
import { MdLocationOn, MdOutlineHowToReg } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import { User } from '@prisma/client';
import Image from 'next/image';
import { Button } from '@/app/components/ui/Button';
import { specializations } from '@/app/types/categories';

// Анимации для элементов
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface Service {
  id: string;
  title: string;
  category: string;
  specializationId: string;
  description: string | null;
}

interface Master {
  id: string;
  name: string;
  email: string;
  role: string;
  city: string;
  phone: string;
  description: string | null;
  avatar: string | null;
  rating: number;
  services: Service[];
  socialLinks: any;
}

interface LandingPageProps {
  stats: {
    masterCount: number;
    specializationsCount: number;
  };
  feedbacks: any[]; //FeedbackWithUser[];
}

const StatCard = ({ icon, value, label }: { icon: React.ReactNode, value: number, label: string }) => (
  <div className="bg-white p-4 rounded-lg shadow-md text-center">
    <div className="text-4xl text-blue-600 mx-auto mb-2">{icon}</div>
    <div className="text-3xl font-bold">{value}</div>
    <div className="text-gray-500">{label}</div>
  </div>
);

const InfographicStep = ({ icon, title, text, stepNumber }: { icon: React.ReactNode, title: string, text: string, stepNumber: string }) => (
  <div className="flex flex-col items-center text-center relative">
    <div className="relative mb-4">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-600 shadow-md">
        {icon}
      </div>
      <div className="absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm border-4 border-slate-50">
        {stepNumber}
      </div>
    </div>
    <h4 className="text-lg font-semibold text-slate-800 mb-1">{title}</h4>
    <p className="text-slate-500 max-w-xs px-2">{text}</p>
  </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-gray-800"
      >
        <span className="font-semibold">{question}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </span>
      </button>
      {isOpen && (
        <div className="mt-3 text-gray-600">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const AccordionItem = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-5 text-left text-lg font-medium text-gray-800 hover:bg-gray-50 focus:outline-none">
        <span>{title}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && <div className="p-5 text-gray-600">{children}</div>}
    </div>
  );
};

const FeedbackCard = ({ feedback }: { feedback: any /*FeedbackWithUser*/ }) => {
  const authorName = `${feedback.user.firstName || ''} ${feedback.user.lastName || ''}`.trim() || feedback.user.name;
  let roleLabel = 'Пользователь';
  if (feedback.user?.role === 'MASTER') roleLabel = 'Мастер';
  else if (feedback.user?.role === 'CLIENT') roleLabel = 'Клиент';
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
      <div className="relative w-16 h-16 mb-4">
        <Image
          src={feedback.user.avatar || '/default-avatar.png'}
          alt={`Аватар ${authorName}`}
          fill
          className="rounded-full object-cover"
        />
      </div>
      <p className="text-gray-600 italic mb-4">"{feedback.content}"</p>
      <div className="font-bold text-gray-800">- {authorName}</div>
      <div className="text-xs text-gray-500 mt-1">{roleLabel}</div>
    </div>
  );
};

const HowItWorksTabs = () => {
  const [activeTab, setActiveTab] = useState('customers');

  const customerSteps = (
    <div className="relative">
      <div className="hidden md:block absolute top-10 left-1/2 -translate-x-1/2 w-2/3 h-px border-t-2 border-dashed border-gray-300"></div>
      <div className="relative grid md:grid-cols-3 gap-y-12 md:gap-x-10">
        <InfographicStep 
            stepNumber="1"
            icon={<FaSearch size={32} />} 
            title="Найдите мастера"
            text="Воспользуйтесь поиском или каталогом, чтобы найти подходящего специалиста."
        />
        <InfographicStep 
            stepNumber="2"
            icon={<FaHandPointer size={32} />} 
            title="Изучите профиль"
            text="Ознакомьтесь с услугами, ценами, примерами работ и отзывами."
        />
        <InfographicStep 
            stepNumber="3"
            icon={<FaComments size={32} />} 
            title="Свяжитесь напрямую"
            text="Напишите в чат или позвоните, чтобы обсудить детали и договориться о работе."
        />
      </div>
    </div>
  );

  const masterSteps = (
    <div className="relative">
      <div className="hidden md:block absolute top-10 left-1/2 -translate-x-1/2 w-2/3 h-px border-t-2 border-dashed border-gray-300"></div>
      <div className="relative grid md:grid-cols-3 gap-y-12 md:gap-x-10">
          <InfographicStep 
              stepNumber="1"
              icon={<FaUserPlus size={32} />} 
              title="Зарегистрируйтесь"
              text="Пройдите быструю регистрацию на платформе, это займет всего пару минут."
          />
          <InfographicStep 
              stepNumber="2"
              icon={<FaAddressCard size={32} />} 
              title="Заполните профиль"
              text="Добавьте информацию, услуги, цены и примеры работ, чтобы привлекать клиентов."
          />
          <InfographicStep 
              stepNumber="3"
              icon={<FaListAlt size={32} />} 
              title="Получайте заказы"
              text="Клиенты смогут находить вас через поиск и напрямую связываться с вами."
          />
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg p-1 shadow-sm border border-blue-200 flex">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-6 py-2 rounded-md text-sm font-semibold border-2 transition-all duration-200 mr-2
              ${activeTab === 'customers'
                ? 'border-blue-600 bg-blue-600 text-white shadow-sm z-10'
                : 'border-blue-400 bg-white text-blue-600 hover:border-blue-500'}
            `}
          >
            Для заказчиков
          </button>
          <button
            onClick={() => setActiveTab('masters')}
            className={`px-6 py-2 rounded-md text-sm font-semibold border-2 transition-all duration-200
              ${activeTab === 'masters'
                ? 'border-blue-600 bg-blue-600 text-white shadow-sm z-10'
                : 'border-blue-400 bg-white text-blue-600 hover:border-blue-500'}
            `}
          >
            Для мастеров
          </button>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="pt-6"
        >
          {activeTab === 'customers' ? customerSteps : masterSteps}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Пример данных отзывов (заменить на реальные из props, если есть)
const sampleFeedbacks = [
  {
    id: '1',
    name: 'Алиса',
    avatar: '/default-avatar.png',
    text: 'Очень удобный сервис! Нашла мастера за 5 минут.'
  },
  {
    id: '2',
    name: 'Магомед',
    avatar: '/default-avatar.png',
    text: 'Спасибо за быструю связь и профессионализм.'
  },
  {
    id: '3',
    name: 'Екатерина',
    avatar: '/default-avatar.png',
    text: 'Платформа помогла найти отличного специалиста!'
  },
  {
    id: '4',
    name: 'Ахмед',
    avatar: '/default-avatar.png',
    text: 'Отличный сервис, рекомендую всем!'
  },
  {
    id: '5',
    name: 'Мария',
    avatar: '/default-avatar.png',
    text: 'Быстро и качественно, спасибо!'
  }
];

export default function LandingPage({ stats, feedbacks: initialFeedbacks }: LandingPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const city = session?.user?.city;
  const sliderRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  // Состояние для отзывов, чтобы обновлять их после отправки
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks || []);

  // --- ДОБАВЛЯЕМ СЕКЦИЮ КАТЕГОРИЙ И СПЕЦИАЛИЗАЦИЙ ---
  const mainCategories = [
    { key: 'ELECTRICAL', label: 'Электрика', icon: <FaPlug className="text-blue-600 text-3xl" /> },
    { key: 'PLUMBING', label: 'Сантехника', icon: <FaWater className="text-blue-600 text-3xl" /> },
    { key: 'CLEANING', label: 'Уборка', icon: <FaBroom className="text-blue-600 text-3xl" /> },
    { key: 'INTERIOR_FINISH', label: 'Ремонт', icon: <FaTools className="text-blue-600 text-3xl" /> },
    { key: 'AUTO_SERVICE', label: 'Ремонт авто', icon: <FaCar className="text-blue-600 text-3xl" /> },
    { key: 'OTHER', label: 'Другое', icon: <FaCheckCircle className="text-blue-600 text-3xl" /> },
  ];

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const response = await fetch('/api/search/masters');
        const data = await response.json();
        setMasters(data);
      } catch (error) {
        console.error('Error fetching masters:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMasters();
  }, []);

  // Слайдер: автоматическая прокрутка
  useEffect(() => {
    if (feedbacks && feedbacks.length > 0) {
      const timer = setInterval(() => {
        setCurrentFeedbackIndex((prevIndex) => (prevIndex + 1) % feedbacks.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [feedbacks]);

  // Получение отзывов с сервера
  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/feedback');
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (error) {
      // Можно добавить обработку ошибки
    }
  };

  // При монтировании страницы всегда подгружаем отзывы
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // После успешной отправки отзыва — подгружаем свежие отзывы
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: feedback })
      });
      if (res.ok) {
        setFeedback('');
        setCurrentFeedbackIndex(0);
        await fetchFeedbacks(); // Подгружаем свежие отзывы
      } else {
        alert('Ошибка при отправке отзыва');
      }
    } catch (error) {
      alert('Ошибка при отправке отзыва');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-extrabold mb-4"
            >
              Найдите своего мастера
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-blue-200 max-w-2xl mx-auto mb-8"
            >
              Платформа №1 для поиска проверенных мастеров для любых задач.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {session ? (
                <Button onClick={() => router.push('/global-chat')} size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Перейти в общий чат
                </Button>
              ) : (
                <div className="flex justify-center gap-4">
                  <Button onClick={() => router.push('/auth/login')} size="lg" className="bg-white text-blue-600 hover:bg-blue-50">Войти</Button>
                  <Button onClick={() => router.push('/auth/register')} size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                    Регистрация
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* --- НОВАЯ СЕКЦИЯ КАТЕГОРИЙ --- */}
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {mainCategories.map(cat => (
                <div key={cat.key} className="flex flex-col items-center w-24 h-24 bg-blue-50 rounded-xl shadow hover:bg-blue-100 transition cursor-pointer justify-center">
                  {cat.icon}
                  <span className="text-xs font-semibold mt-2 text-blue-700 text-center">{cat.label}</span>
                </div>
              ))}
            </div>
            <h3 className="text-lg font-bold mb-4 text-center">Поручите дела специалистам</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(specializations).slice(0, 8).map(([catKey, specs]) =>
                specs.slice(0, 2).map(spec => (
                  null
                ))
              )}
            </div>
          </div>
        </section>

        {/* Компактный современный слайдер отзывов */}
        {feedbacks && feedbacks.length > 0 && (
          <section className="py-6 bg-white" id="user-feedbacks">
            <div className="container mx-auto px-2 md:px-4">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Отзывы пользователей</h2>
              <div className="relative max-w-xl mx-auto">
                {/* Кнопки навигации */}
                <button
                  onClick={() => setCurrentFeedbackIndex((prev) => (prev - 1 + feedbacks.length) % feedbacks.length)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-blue-50 p-2 rounded-full shadow transition-all duration-200 border border-gray-200"
                  aria-label="Предыдущий отзыв"
                >
                  <FaChevronLeft className="text-gray-500 text-lg" />
                </button>
                <button
                  onClick={() => setCurrentFeedbackIndex((prev) => (prev + 1) % feedbacks.length)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-blue-50 p-2 rounded-full shadow transition-all duration-200 border border-gray-200"
                  aria-label="Следующий отзыв"
                >
                  <FaChevronRight className="text-gray-500 text-lg" />
                </button>
                {/* Слайдер */}
                <div className="overflow-hidden rounded-xl shadow-md border border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentFeedbackIndex * 100}%)` }}
                  >
                    {feedbacks.map((fb, index) => (
                      <div key={fb.id} className="w-full flex-shrink-0 p-6 flex flex-col items-center text-center">
                        <div className="relative w-14 h-14 mb-2">
                          <Image
                            src={fb.user?.avatar || '/default-avatar.png'}
                            alt={fb.user?.name || 'Пользователь'}
                            fill
                            className="rounded-full object-cover border-2 border-white shadow"
                          />
                        </div>
                        <blockquote className="text-base md:text-lg text-gray-700 italic mb-2 leading-snug max-w-xs mx-auto">
                          "{fb.content}"
                        </blockquote>
                        <div className="font-semibold text-gray-800 text-sm">— {fb.user?.firstName || ''} {fb.user?.lastName || fb.user?.name || 'Пользователь'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* About Section */}
        <section id="about" className="py-12 bg-white">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-2xl font-bold mb-4">О Платформе</h2>
            <p className="text-base text-gray-600 mb-6 leading-relaxed">
              Vay Master — это инновационная платформа, созданная для того, чтобы
              соединять заказчиков с лучшими мастерами. Мы стремимся сделать
              процесс поиска специалистов максимально простым, быстрым и
              безопасным.
            </p>
          </div>
        </section>

        <section id="stats" className="py-12 bg-gray-50">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl font-bold mb-8">Наша платформа в цифрах</h2>
            <div className="flex justify-center gap-8 md:gap-16">
              <StatCard icon={<FaUsers />} value={stats.masterCount} label="Мастеров" />
              <StatCard icon={<FaToolbox />} value={stats.specializationsCount} label="Специализаций" />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
                Как это работает?
              </h2>
              <p className="text-lg text-slate-500 mt-2">
                Простой и понятный процесс для каждого.
              </p>
            </div>

            <HowItWorksTabs />

          </div>
        </section>

        <section id="feedback" className="py-12 bg-gray-50">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold">Оставьте свой отзыв</h2>
            <p className="text-gray-600 mb-6">Помогите нам стать лучше</p>
            {session ? (
              <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-4">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Ваш отзыв..."
                  rows={4}
                  required
                />
                <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto mx-auto">
                  {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
                </Button>
              </form>
            ) : (
              <p className="text-gray-600">
                <Link href="/auth/login" className="text-blue-600 hover:underline">Войдите</Link>, чтобы оставить отзыв.
              </p>
            )}
          </div>
        </section>
      </main>
      {/* Современный футер */}
      <footer className="w-full bg-white border-t border-gray-200 py-8 mt-8 text-gray-700 text-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row md:justify-between md:items-center gap-8">
          {/* Ссылки */}
          <div className="flex flex-col gap-2 md:gap-3">
            <a href="#about" className="hover:text-blue-600 transition font-medium">О нас</a>
            <a href="#contacts" className="hover:text-blue-600 transition font-medium">Контакты</a>
            <a href="#company" className="hover:text-blue-600 transition font-medium">Компания</a>
          </div>
          {/* Соцсети */}
          <div className="flex flex-col items-center gap-2">
            <div className="font-semibold mb-1">Мы в соцсетях:</div>
            <div className="flex gap-4 text-2xl">
              <a href="https://t.me/vaymaster" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition" title="Telegram"><FaTelegramPlane /></a>
              <a href="https://wa.me/79626586315" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition" title="WhatsApp"><FaWhatsapp /></a>
              <a href="https://vk.com/vaymaster" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition" title="VK"><FaVk /></a>
              <a href="https://instagram.com/vaymaster" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition" title="Instagram"><FaInstagram /></a>
            </div>
          </div>
          {/* Копирайт и email */}
          <div className="flex flex-col items-center md:items-end gap-2 text-gray-500">
            <div>© {new Date().getFullYear()} Vay Master</div>
            <a href="mailto:support@vaymaster.ru" className="hover:text-blue-600 transition">support@vaymaster.ru</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 