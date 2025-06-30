// Базовые типы
export type UserRole = 'CLIENT' | 'MASTER' | 'SHOP' | 'ADMIN'

// Импортируем тип ServiceCategory из Prisma
import type { ServiceCategory } from '@prisma/client'
export type { ServiceCategory }

// Общие типы для всех пользователей
export type BaseUserStats = {
  followers: number
  following: number
  posts: number
  likedPosts: number
  favorites: number
  favoritedBy: number
}

export interface SocialLinks {
  instagram?: string
  facebook?: string
  telegram?: string
  whatsapp?: string
  website?: string
  vk?: string
}

// Базовый тип пользователя
export interface BaseUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  banner?: string
  description?: string
  city: string
  phone?: string
  socialLinks?: SocialLinks
  rating?: number
  _count?: BaseUserStats
  firstName?: string
  lastName?: string
}

// Тип для поста
export interface Post {
  id: string
  content: string
  images: string[]
  createdAt: Date
  updatedAt: Date
  authorId: string
  author: {
    id: string
    name: string | null
    avatar: string | null
    role: UserRole
    city: string
  }
  likes: PostLike[]
  isLiked?: boolean
  _count: {
    likes: number
    comments: number
  }
}

// Тип для лайка поста
export type PostLike = {
  id: string
  postId: string
  userId: string
  createdAt: Date
}

// Тип для услуги мастера
export interface Service {
  id: string
  title: string
  category: ServiceCategory
  specializationId: string
  description?: string
}

// Тип для зоны обслуживания
export type ServiceArea = {
  type: 'cities' | 'coordinates'
  data: string[] | {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][]
  }
}

// Тип для изображения в галерее
export type GalleryImage = {
  id: string
  url: string
  title?: string
  description?: string
  createdAt: Date
}

// Тип для товара
export type Product = {
  id: string
  name: string
  image: string
  description?: string
  price?: number
  category?: ProductCategory
  available: boolean
  shopId: string
  createdAt: Date
  updatedAt: Date
}

// Категории
export type ProductCategory =
  | 'BUILDING_MATERIALS'
  | 'AUTO_PARTS'
  | 'HOUSEHOLD'
  | 'TOOLS'
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'PAINT'
  | 'GARDEN'
  | 'OTHER'

// Специфичные типы пользователей
export interface MasterUser extends BaseUser {
  role: 'MASTER'
  services: Service[]
  serviceArea: ServiceArea | null
  readyToTravel: boolean
  workGallery: GalleryImage[]
  posts: Post[]
  firstName?: string
  lastName?: string
}

export interface ShopUser extends BaseUser {
  role: 'SHOP'
  hasDelivery: boolean
  address: string
  products: Product[]
  posts: Post[]
  firstName?: string
  lastName?: string
}

export interface ClientUser extends BaseUser {
  role: 'CLIENT'
  posts: Post[]
  firstName?: string
  lastName?: string
}

// Тип для профиля пользователя (расширенная информация)
export type UserProfile = (MasterUser | ShopUser | ClientUser) & {
  isFollowing?: boolean
  followersCount: number
  followingCount: number
  firstName?: string
  lastName?: string
}

export interface ExtendedUser extends BaseUser {
  services?: Service[]
  posts: Post[]
  followersCount: number
  followingCount: number
  rating?: number
  isFollowing?: boolean
  firstName?: string
  lastName?: string
} 