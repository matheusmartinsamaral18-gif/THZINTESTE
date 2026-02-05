
export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  name?: string; // Para séries
  first_air_date?: string; // Para séries
}

export interface Genre {
  id: number;
  name: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Profile {
  id: string;
  name: string;
  icon: string;
  isKids: boolean;
  deviceId?: string; // ID do aparelho vinculado
}

export interface ContinueWatchingItem extends Movie {
  lastSeason?: number;
  lastEpisode?: number;
  isSeries: boolean;
  watchedAt: number;
}

export interface Subscription {
  planType: string;
  startDate: number;
  expiryDate: number;
  status: 'active' | 'expired';
  paymentId?: string;
  hasUsedFreeTrial?: boolean;
  trialUsageCount?: number;
  lastUsageDate?: string; // Formato YYYY-MM-DD
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  description: string;
}
