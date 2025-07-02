'use client';

import { useState } from 'react';
import { BaseUser, UserRole, SocialLinks, Service, ServiceArea, GalleryImage } from '@/types/user';
import Image from 'next/image';
import ServiceManager from './ServiceManager';
import GalleryManager from './GalleryManager';
import ProductManager from './ProductManager';

interface UserFormProps {
  initialData?: Partial<BaseUser>;
  onSubmit: (data: Partial<BaseUser>) => Promise<void>;
}

type SocialNetwork = keyof SocialLinks;

const SOCIAL_NETWORKS: SocialNetwork[] = ['instagram', 'facebook', 'telegram', 'whatsapp', 'website', 'vk'];

export default function UserForm() { return null; } 