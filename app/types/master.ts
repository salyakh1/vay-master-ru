import type { User, ServiceCategory } from '@prisma/client';

export interface MasterWithDetails extends User {
  services: {
    id: string;
    title: string;
    category: string;
  }[];
  _count: {
    followers: number;
    reviews: number;
  };
}

export interface MasterSearchProps {
  categories: ServiceCategory[];
  initialMasters: MasterWithDetails[];
} 