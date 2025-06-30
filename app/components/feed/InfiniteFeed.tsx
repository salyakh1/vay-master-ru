'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import type { Post, UserRole } from '@/types/user';
import PostCard from './PostCard';
import PostSkeleton from './PostSkeleton';

interface InfiniteFeedProps {
  initialPosts: Post[];
  currentUser: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: UserRole;
    city: string;
  };
  selectedRole?: UserRole;
}

async function fetchPosts(
  page: number,
  userId: string,
  role?: UserRole
): Promise<{ posts: Post[]; hasMore: boolean }> {
  const response = await fetch(
    `/api/posts/feed?page=${page}&userId=${userId}${role ? `&role=${role}` : ''}`
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch posts');
  }
  
  return response.json();
}

export default function InfiniteFeed({
  initialPosts,
  currentUser,
  selectedRole
}: InfiniteFeedProps) {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error
  } = useInfiniteQuery({
    queryKey: ['feed', currentUser.id, selectedRole],
    queryFn: ({ pageParam = 1 }) =>
      fetchPosts(pageParam, currentUser.id, selectedRole),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    initialData: {
      pages: [{ posts: initialPosts, hasMore: initialPosts.length === 10 }],
      pageParams: [1]
    }
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'error' && error instanceof Error) {
    return (
      <div className="text-center text-red-500">
        {error.message || 'Произошла ошибка при загрузке постов'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.pages.map((page, i) => (
        <div key={i} className="space-y-6">
          {page.posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUser={currentUser}
              onLike={async (postId) => {
                const response = await fetch('/api/posts/like', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ postId })
                });
                
                if (!response.ok) {
                  throw new Error('Failed to like post');
                }
              }}
            />
          ))}
        </div>
      ))}

      <div ref={ref} className="h-20">
        {isFetchingNextPage && (
          <div className="space-y-6">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        )}
      </div>
    </div>
  );
} 