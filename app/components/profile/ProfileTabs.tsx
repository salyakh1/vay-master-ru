"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserProfile } from '@/types/user';
import { toast } from 'react-hot-toast';

interface ProfileTabsProps {
  profile: UserProfile;
}

export function ProfileTabs({ profile }: ProfileTabsProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('posts');
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFollowers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/profile/${profile.id}/followers`);
      if (!response.ok) throw new Error('Failed to fetch followers');
      const data = await response.json();
      setFollowers(data);
    } catch (error) {
      console.error('Error fetching followers:', error);
      toast.error('Не удалось загрузить подписчиков');
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/profile/${profile.id}/following`);
      if (!response.ok) throw new Error('Failed to fetch following');
      const data = await response.json();
      setFollowing(data);
    } catch (error) {
      console.error('Error fetching following:', error);
      toast.error('Не удалось загрузить подписки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'followers') {
      fetchFollowers();
    } else if (activeTab === 'following') {
      fetchFollowing();
    }
  }, [activeTab, profile.id]);

  const renderUserList = (users: UserProfile[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user) => (
        <div key={user.id} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || ''}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xl">
                  {user.name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.city}</p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mt-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`${
              activeTab === 'posts'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Публикации
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`${
              activeTab === 'followers'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Подписчики ({profile.followersCount})
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`${
              activeTab === 'following'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Подписки ({profile.followingCount})
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {activeTab === 'followers' && renderUserList(followers)}
            {activeTab === 'following' && renderUserList(following)}
          </>
        )}
      </div>
    </div>
  );
} 