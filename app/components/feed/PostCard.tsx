'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaHeart, FaComment, FaEllipsisV, FaTrash } from 'react-icons/fa';
import type { Post as PostType, UserRole } from '@/types/user';
import { ConfirmationModal } from '../ui/ConfirmationModal';

interface PostCardProps {
  post: PostType & { 
    description?: string | null;
  };
  currentUser: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: UserRole;
    city: string;
  };
  onLike: (postId: string) => Promise<void>;
  onDelete?: (postId: string) => Promise<void>;
}

export default function PostCard({ post, currentUser, onLike, onDelete }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.likes?.some(like => like.userId === currentUser.id));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleLikeClick = async () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
    try {
      await onLike(post.id);
    } catch (error) {
      setIsLiked(!newIsLiked);
      setLikesCount(prev => !newIsLiked ? prev + 1 : prev - 1);
      console.error('Ошибка лайка:', error);
    }
  };

  const handleDeleteRequest = () => {
    if (!onDelete) return;
    setMenuOpen(false);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(post.id);
      setIsConfirmModalOpen(false);
    } catch (error) {
      console.error('Ошибка при удалении в PostCard, родительский компонент должен обработать UI.', error);
      setIsConfirmModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwnPost = post.author.id === currentUser.id;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="p-4 flex items-center justify-between">
          <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3">
            <Image
              src={post.author.avatar || '/default-avatar.png'}
              alt={post.author.name || 'User avatar'}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-sm">{(post.author as any).firstName || post.author.name}</p>
              {post.author.city && <p className="text-xs text-gray-500">{post.author.city}</p>}
            </div>
          </Link>
          {isOwnPost && onDelete && (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-500 hover:text-gray-700">
                <FaEllipsisV />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border">
                  <button
                    onClick={handleDeleteRequest}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FaTrash />
                    Удалить
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {post.images && post.images.length > 0 && (
          <div className="relative w-full aspect-square">
            <Image
              src={post.images[0]}
              alt="Post image"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-center gap-4">
            <button onClick={handleLikeClick} className="flex items-center gap-1 text-gray-700 hover:text-red-500">
              <FaHeart className={isLiked ? 'text-red-500' : 'text-gray-400'} />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>
            <button className="flex items-center gap-1 text-gray-700 hover:text-blue-500">
              <FaComment className="text-gray-400" />
              <span className="text-sm font-medium">{post._count?.comments || 0}</span>
            </button>
          </div>
          {post.description && <p className="mt-3 text-sm text-gray-800">{post.description}</p>}
          <p className="mt-2 text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить публикацию"
        message="Вы уверены, что хотите удалить эту публикацию? Это действие необратимо."
        isConfirming={isDeleting}
        confirmText="Удалить"
      />
    </>
  );
}