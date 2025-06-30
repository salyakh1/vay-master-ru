'use client';

import { useEffect, useRef } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import type { Post as PostType, UserRole } from '@/types/user';
import PostCard from '../feed/PostCard';

interface ProfilePostFeedModalProps {
  posts: PostType[];
  currentUser: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: UserRole;
    city: string;
  };
  profileName: string;
  initialPostIndex: number;
  onClose: () => void;
  onLike: (postId: string) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
}

export default function ProfilePostFeedModal({
  posts,
  currentUser,
  profileName,
  initialPostIndex,
  onClose,
  onLike,
  onDelete,
}: ProfilePostFeedModalProps) {
  const postRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    // Прокручиваем до выбранного поста
    const initialPostId = posts[initialPostIndex]?.id;
    if (initialPostId) {
      const node = postRefs.current.get(initialPostId);
      node?.scrollIntoView({
        block: 'center',
      });
    }
  }, [initialPostIndex, posts]);

  // Отключаем прокрутку фона
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-md z-50 flex items-center justify-between px-4 border-b border-white/20">
        <button
          onClick={onClose}
          className="text-white text-2xl p-2 rounded-full hover:bg-white/20 transition-colors"
          title="Назад"
        >
          <FaArrowLeft />
        </button>
        <h2 className="text-lg font-bold text-white">
          {profileName}
        </h2>
        <div className="w-10"></div> {/* Spacer to center the title */}
      </header>

      {/* Scrollable Content */}
      <div className="w-full max-w-lg space-y-4 overflow-y-auto pt-20 pb-4 px-2">
        {posts.map((post) => (
          <div
            key={post.id}
            ref={(node) => {
              if (node) {
                postRefs.current.set(post.id, node);
              } else {
                postRefs.current.delete(post.id);
              }
            }}
          >
            <PostCard 
              post={post} 
              currentUser={currentUser} 
              onLike={onLike}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 