'use client';

import Image from 'next/image'
import { useState, useEffect } from 'react';
import { ExtendedUser, SocialLinks, UserRole } from '@/types/user'
import PostCard from '../feed/PostCard'
import { CreatePostModal } from '../posts/CreatePostModal'
import { 
  FaInstagram, 
  FaFacebook, 
  FaTelegram, 
  FaWhatsapp, 
  FaGlobe, 
  FaVk,
  FaPlus,
  FaPhone,
  FaCog,
  FaHeart,
  FaUser,
  FaCommentDots,
  FaUserPlus
} from 'react-icons/fa'
import { toast } from 'react-hot-toast';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProfilePostFeedModal from './ProfilePostFeedModal';
import { Toaster } from 'react-hot-toast';

interface UserProfileProps {
  profile: ExtendedUser;
  currentUser?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: UserRole;
    city: string;
  } | null;
  onFollow?: () => Promise<void>;
  isOwnProfile: boolean;
}

const SocialIcon = ({ network, url }: { network: keyof SocialLinks; url: string }) => {
  const icons = {
    instagram: FaInstagram,
    facebook: FaFacebook,
    telegram: FaTelegram,
    whatsapp: FaWhatsapp,
    website: FaGlobe,
    vk: FaVk
  };

  const Icon = icons[network];
  return Icon ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-600 hover:text-gray-900 transition-colors"
      title={network}
    >
      <Icon className="w-6 h-6" />
    </a>
  ) : null;
};

export function UserProfile({ profile: initialProfile, onFollow, isOwnProfile }: UserProfileProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(0);

  const handleOpenFeedModal = (index: number) => {
    setSelectedPostIndex(index);
    setIsFeedModalOpen(true);
  };

  const handleCloseFeedModal = () => {
    setIsFeedModalOpen(false);
    setSelectedPostIndex(null);
  };

  const handleFollow = async () => {
    if (!session?.user?.id) {
      toast.error('Необходимо авторизоваться');
      return;
    }

    try {
      const response = await fetch(`/api/profile/${profile.id}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      toast.success(updatedProfile.isFollowing ? 'Вы подписались' : 'Вы отписались');
    } catch (error) {
      console.error('Error following user:', error);
      toast.error(error instanceof Error ? error.message : 'Произошла ошибка при изменении подписки');
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!session?.user?.id) return;

    // Оптимистичное обновление
    const originalPosts = profile.posts;
    const updatedPosts = profile.posts.map(p => {
      if (p.id === postId) {
        const isLiked = p.likes.some(l => l.userId === session.user!.id);
        const likesCount = p._count.likes;
        return {
          ...p,
          likes: isLiked ? p.likes.filter(l => l.userId !== session.user!.id) : [...p.likes, { userId: session.user!.id, postId, id: 'temp-like', createdAt: new Date() }],
          _count: { ...p._count, likes: isLiked ? likesCount - 1 : likesCount + 1 },
        };
      }
      return p;
    });

    setProfile(prev => ({ ...prev, posts: updatedPosts }));

    try {
      const response = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (!response.ok) {
        // Откат в случае ошибки
        setProfile(prev => ({ ...prev, posts: originalPosts }));
        toast.error('Не удалось поставить лайк');
      }
    } catch (error) {
      setProfile(prev => ({ ...prev, posts: originalPosts }));
      toast.error('Ошибка сети');
    }
  };

  const handleDeletePost = async (postId: string) => {
    const originalPosts = profile.posts;
    // Оптимистичное обновление: немедленно убираем пост из UI
    setProfile(prev => ({
      ...prev,
      posts: prev.posts.filter(p => p.id !== postId),
    }));

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      // Успех, если пост удален (200 OK) или уже был удален (404 Not Found)
      if (response.ok || response.status === 404) {
        toast.success('Публикация удалена');
        // Обновляем кэш страницы, чтобы "воскрешения" поста не было
        router.refresh();

        // Проверяем, нужно ли закрыть модальное окно
        if (profile.posts.length === 1) {
          handleCloseFeedModal();
        }
        return;
      }

      // Если сервер вернул другую ошибку
      throw new Error('Не удалось удалить публикацию');

    } catch (error) {
      console.error(error);
      toast.error('Ошибка при удалении публикации');
      // В случае непредвиденной ошибки, возвращаем пост в UI
      setProfile(prev => ({
        ...prev,
        posts: originalPosts,
      }));
      // Пробрасываем ошибку, чтобы дочерний компонент (PostCard) мог остановить загрузку
      throw error;
    }
  };

  const handleStartChat = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: profile.id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось создать чат');
      }
      const chat = await response.json();
      router.push(`/chat?id=${chat.id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePost = async (data: { content: string; images: File[] }) => {
    try {
      const formData = new FormData();
      formData.append('content', data.content);
      data.images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      const response = await fetch('/api/posts/create', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      // Перезагружаем страницу для отображения нового поста
      window.location.reload();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Произошла ошибка при создании публикации');
    }
  };

  const handleFollowToggle = async () => {
    if (!session?.user) {
      toast.error('Необходимо авторизоваться');
      return;
    }

    try {
      const response = await fetch(`/api/profile/${profile.id}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      toast.success(updatedProfile.isFollowing ? 'Вы подписались' : 'Вы отписались');
    } catch (error) {
      console.error('Error following user:', error);
      toast.error(error instanceof Error ? error.message : 'Произошла ошибка при изменении подписки');
    }
  };

  // Закрытие меню при клике вне его
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const menu = document.querySelector('.z-50.animate-fade-in');
      if (menu && !menu.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-2">
      <Toaster position="bottom-center" />

      {isCreatingPost && (
        <CreatePostModal 
          isOpen={isCreatingPost}
          onClose={() => setIsCreatingPost(false)} 
          onSubmit={handleCreatePost} 
        />
      )}

      {/* Модальное окно ленты публикаций */}
      {session?.user && isFeedModalOpen && selectedPostIndex !== null && (
        <ProfilePostFeedModal
          posts={profile.posts || []}
          currentUser={{ ...session.user, name: session.user.name ?? '' }}
          profileName={profile.firstName || profile.lastName ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : profile.name}
          initialPostIndex={selectedPostIndex}
          onClose={handleCloseFeedModal}
          onLike={handleLikePost}
          onDelete={handleDeletePost}
        />
      )}

      {/* Новый layout профиля по шаблону (строго по рисунку) */}
      <div className="w-full max-w-md mx-auto bg-white rounded-b-xl shadow-md overflow-hidden relative mt-1 min-h-[440px] pb-6">
        {/* Имя и шестерёнка */}
        <div className="flex flex-row items-center justify-between px-4 pt-0 pb-2 bg-white z-20 relative">
          <div className="font-bold text-lg text-gray-900 leading-tight">
            {profile.firstName || profile.lastName ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : profile.name}
          </div>
          {isOwnProfile && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow opacity-80"
                title="Настройки"
                type="button"
                style={{ fontSize: '2rem' }}
              >
                <FaCog className="w-8 h-8" />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl bg-white ring-1 ring-black/10 z-50 animate-fade-in p-2 flex flex-col gap-1"
                  tabIndex={-1}
                >
                  <button
                    onClick={() => { setMenuOpen(false); window.location.href = '/profile/edit'; }}
                    className="block w-full text-left px-5 py-3 text-base text-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-colors font-medium"
                  >
                    Редактировать профиль
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); signOut(); }}
                    className="block w-full text-left px-5 py-3 text-base text-gray-900 bg-white rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
                  >
                    Выйти из аккаунта
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Баннер */}
        <div className="w-full h-24 sm:h-32 bg-gray-200 relative">
          {profile.banner && (
            <Image src={profile.banner} alt="Баннер" fill className="object-cover" />
          )}
        </div>
        {/* Аватар и статистика в одной строке */}
        <div className="flex flex-row items-end px-4 -mt-12 relative z-10">
          {/* Аватар */}
          <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 overflow-hidden flex items-center justify-center mr-4 shrink-0">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.name}
                width={96}
                height={96}
                className="object-cover w-24 h-24"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-avatar.png';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                {profile.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          {/* Статистика */}
          <div className="flex-1 flex flex-row items-center justify-around h-full">
            <div className="flex flex-col items-center">
              <span className="font-bold text-base text-gray-900">{profile.posts?.length || 0}</span>
              <span className="text-xs text-gray-500">публикации</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-base text-gray-900">{profile.followersCount}</span>
              <span className="text-xs text-gray-500">подписчики</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-base text-gray-900">{profile.followingCount}</span>
              <span className="text-xs text-gray-500">подписки</span>
            </div>
          </div>
        </div>
        {/* Блок кнопок для чужого профиля */}
        {!isOwnProfile && (
          <div className="flex gap-2 mt-4 px-4">
            <button
              onClick={handleFollow}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-colors ${
                profile.isFollowing
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {profile.isFollowing ? <FaHeart /> : <FaUserPlus />}
              <span>{profile.isFollowing ? 'Отписаться' : 'Подписаться'}</span>
            </button>
            <button
              onClick={handleStartChat}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-colors bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300"
            >
              <FaCommentDots />
              <span>Написать</span>
            </button>
          </div>
        )}
        {/* Контакты, город, специализации */}
        <div className="flex flex-col gap-2 mt-4 mb-4 px-4 text-sm">
          <div className="flex items-center gap-3 flex-wrap">
            {profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                title="Позвонить"
              >
                <FaPhone className="w-5 h-5 mr-1" />
                <span>{profile.phone}</span>
              </a>
            )}
            {profile.socialLinks && profile.socialLinks.whatsapp && (
              <a
                href={`https://wa.me/${profile.socialLinks.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-green-600 hover:text-green-700 transition-colors"
                title="WhatsApp"
              >
                <FaWhatsapp className="w-5 h-5 mr-1" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}
            {profile.city && (
              <span className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-1 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 0c-4 0-7 2.239-7 5v2h14v-2c0-2.761-3-5-7-5z" /></svg>
                <span>{profile.city}</span>
              </span>
            )}
          </div>
          {profile.services && profile.services.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 mt-1">
              <span className="font-medium text-gray-700">Специализации:</span>
              {profile.services.map((service: any, idx: number) => (
                <span key={idx} className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs font-semibold">
                  {service.title}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* Плавающая кнопка + для добавления публикации */}
        {isOwnProfile && (
          <button
            onClick={() => setIsCreatingPost(true)}
            className="absolute bottom-4 right-4 z-30 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors text-3xl"
            title="Добавить публикацию"
            type="button"
          >
            <FaPlus />
          </button>
        )}
      </div>

      {/* Публикации: сетка 3 на 3 как в Instagram */}
      <div className="w-full max-w-md mx-auto grid grid-cols-3 gap-1 mt-4">
        {profile.posts && profile.posts.length > 0 ? (
          profile.posts.map((post: any, index: number) => (
            <button 
              key={post.id} 
              className="aspect-square w-full relative overflow-hidden bg-gray-100 block"
              onClick={() => handleOpenFeedModal(index)}
            >
              {post.images && post.images[0] ? (
                <Image
                  src={post.images[0]}
                  alt="Публикация"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span>Нет изображения</span>
                </div>
              )}
            </button>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-400 py-8">Нет публикаций</div>
        )}
      </div>
    </div>
  )
} 