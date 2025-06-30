export type UserRole = 'CLIENT' | 'MASTER' | 'SHOP'

export type ShopType = 'HOZMAG' | 'BUILDING' | 'AUTO_PARTS'

export type SocialLinks = {
  instagram?: string
  facebook?: string
  telegram?: string
  whatsapp?: string
  website?: string
  vk?: string
}

export type ServiceCategory = 
  | 'EXTERIOR_FINISH'  // Внешняя отделка
  | 'AUTO_SERVICE'     // Автосервис
  | 'ELECTRICAL'      // Электрика
  | 'PLUMBING'        // Сантехника
  | 'INTERIOR_FINISH' // Внутренняя отделка
  | 'CONSTRUCTION'    // Строительство
  | 'LANDSCAPING'     // Ландшафтный дизайн
  | 'CLEANING'        // Уборка
  | 'OTHER';          // Другое

// Тип для зоны обслуживания в формате GeoJSON
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

// Тип для услуги мастера
export type Service = {
  id: string
  title: string
  category: ServiceCategory
  description?: string
}

export type ProductCategory =
  | 'BUILDING_MATERIALS'  // Стройматериалы
  | 'AUTO_PARTS'         // Автозапчасти
  | 'HOUSEHOLD'          // Хозтовары
  | 'TOOLS'              // Инструменты
  | 'PLUMBING'           // Сантехника
  | 'ELECTRICAL'         // Электротовары
  | 'PAINT'              // Краски и покрытия
  | 'GARDEN'             // Товары для сада
  | 'OTHER';             // Другое

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

// Тип для лайка поста
export type PostLike = {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
};

// Тип для поста
export type Post = {
  id: string;
  images: string[];
  caption?: string;
  createdAt: Date;
  authorId: string;
  author: User;
  likes: PostLike[];
  _count?: {
    likes: number;
  };
};

// Тип для избранного пользователя
export type UserFavorite = {
  id: string
  userId: string
  favoriteUserId: string
  createdAt: Date
  favoriteUser: User
}

// Базовый тип пользователя
export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  description?: string
  city: string
  phone?: string
  socialLinks?: SocialLinks
  rating?: number
  
  // Связи для подписчиков и избранного
  followers?: User[]
  following?: User[]
  favoritedBy?: User[]
  favorites?: UserFavorite[]
  
  // Поля для мастера
  services?: Service[]
  serviceArea?: ServiceArea
  readyToTravel?: boolean
  workGallery?: GalleryImage[]
  
  // Поля для магазина
  shopType?: ShopType
  products?: Product[]
  hasDelivery?: boolean
  address?: string
  posts?: Post[]
  likedPosts?: PostLike[]
  _count?: {
    followers: number
    following: number
    favorites: number
    favoritedBy: number
    posts: number
    likedPosts: number
  }
}

// Расширенный тип пользователя для профиля
export type ExtendedUser = User & {
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  posts: Post[];
}

// Тип для мастера
export type MasterUser = User & {
  role: 'MASTER'
  services: Service[]
  serviceArea: ServiceArea | null
  readyToTravel: boolean
  workGallery: GalleryImage[]
}

// Тип для магазина
export type ShopUser = User & {
  role: 'SHOP'
  shopType: ShopType
  hasDelivery: boolean
  address: string
  products: Product[]
}

// Тип для клиента
export type ClientUser = User & {
  role: 'CLIENT'
}

// Общий тип профиля пользователя
export type UserProfile = {
  user: MasterUser | ShopUser | ClientUser
  posts: Post[]
} 