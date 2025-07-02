"use client";
import { useState } from 'react';
import PostCard from './PostCard';
import { Heart, LayoutGrid } from 'lucide-react';

export default function FeedClient({ favoriteUsers, favoritePosts, allPosts, currentUser }: { favoriteUsers: any[]; favoritePosts: any[]; allPosts: any[]; currentUser: any }) {
  // mode: 'favorite' (лента подписок) | 'all' (сетка всех)
  const [mode, setMode] = useState<'favorite' | 'all'>('favorite');
  // Индекс публикации, с которой начинать ленту (для режима all)
  const [feedStartIndex, setFeedStartIndex] = useState<number | null>(null);

  // --- Лента только от подписок ---
  if (mode === 'favorite') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Публикации</h1>
          <button
            className={`p-2 rounded-full border-2 shadow-sm hover:scale-110 active:scale-95 transition-all duration-200 bg-white border-blue-100`}
            onClick={() => setMode('all')}
            title="Показать все публикации"
            style={{ minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <LayoutGrid size={26} strokeWidth={2} color={'#23272F'} />
          </button>
        </div>
        <div className="flex flex-col gap-6">
          {favoritePosts.length === 0 ? (
            <div className="text-center text-gray-400 py-12">Нет публикаций от ваших подписок</div>
          ) : (
            favoritePosts.map((post) => (
              <PostCard key={post.id} post={post} currentUser={currentUser} onLike={async (postId: string) => {}} />
            ))
          )}
        </div>
      </div>
    );
  }

  // --- Сетка всех публикаций ---
  if (mode === 'all' && feedStartIndex === null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Публикации</h1>
          <button
            className={`p-2 rounded-full border-2 shadow-sm hover:scale-110 active:scale-95 transition-all duration-200 bg-white border-blue-100`}
            onClick={() => setMode('favorite')}
            title="Показать только подписки"
            style={{ minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Heart size={26} strokeWidth={2} color={'#2563eb'} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {allPosts.map((post, idx) => (
            <button
              key={post.id}
              className="bg-white rounded-xl shadow p-0 overflow-hidden focus:outline-none"
              onClick={() => setFeedStartIndex(idx)}
              style={{ aspectRatio: '1/1' }}
              title="Открыть ленту публикаций"
            >
              {post.images && post.images.length > 0 && (
                <img
                  src={post.images[0]}
                  alt="post"
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- Лента всех публикаций (после клика по фото из сетки) ---
  if (mode === 'all' && feedStartIndex !== null) {
    const orderedPosts = [
      ...allPosts.slice(feedStartIndex),
      ...allPosts.slice(0, feedStartIndex)
    ];
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          onClick={() => setFeedStartIndex(null)}
        >
          Назад к сетке
        </button>
        <div className="flex flex-col gap-6">
          {orderedPosts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={currentUser} onLike={async (postId: string) => {}} />
          ))}
        </div>
      </div>
    );
  }
} 