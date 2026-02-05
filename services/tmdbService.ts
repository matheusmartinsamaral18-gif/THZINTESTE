
import { Movie, Genre } from '../types';

const TMDB_API_KEY = '7fbf72dde2df3009cc613690d316ebd4';
const BASE_URL = 'https://api.themoviedb.org/3';
const LANGUAGE = 'pt-BR';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

export const tmdbService = {
  getTrending: async (page: number = 1): Promise<Movie[]> => {
    const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=${LANGUAGE}&page=${page}`);
    const data = await res.json();
    return (data.results || []).filter((m: any) => m.poster_path);
  },

  getPopular: async (page: number = 1): Promise<Movie[]> => {
    const res = await fetch(`${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=${LANGUAGE}&page=${page}`);
    const data = await res.json();
    return (data.results || []).filter((m: any) => m.poster_path);
  },

  getPosterWall: async (): Promise<string[]> => {
    try {
      const pages = [1, 2, 3];
      const promises = pages.map(page => 
        fetch(`${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=${LANGUAGE}&page=${page}`)
          .then(res => res.json())
      );
      const results = await Promise.all(promises);
      const allPosters = results.flatMap(data => (data.results || []))
        .filter((m: any) => m.poster_path)
        .map((m: any) => `${IMAGE_BASE_URL}${m.poster_path}`);
      return allPosters.sort(() => Math.random() - 0.5);
    } catch (e) {
      console.error("Erro ao carregar parede de posters:", e);
      return [];
    }
  },

  searchMovies: async (query: string, page: number = 1): Promise<Movie[]> => {
    if (!query) return [];
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=${LANGUAGE}&page=${page}&include_adult=false`);
    const data = await res.json();
    return (data.results || []).filter((item: any) => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv'));
  },

  getMovieDetails: async (id: number | string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=${LANGUAGE}`);
    return await res.json();
  },

  getTVDetails: async (id: number | string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=${LANGUAGE}`);
    return await res.json();
  },

  getTVSeason: async (id: number, seasonNumber: number): Promise<any> => {
    const res = await fetch(`${BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${TMDB_API_KEY}&language=${LANGUAGE}`);
    return await res.json();
  },

  getMoviesByGenre: async (genreId: number, page: number = 1): Promise<Movie[]> => {
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&language=${LANGUAGE}&page=${page}&sort_by=popularity.desc`);
    const data = await res.json();
    return (data.results || []).filter((m: any) => m.poster_path);
  },

  getGenres: async (): Promise<Genre[]> => {
    const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=${LANGUAGE}`);
    const data = await res.json();
    return data.genres || [];
  },

  getTVExternalIds: async (id: number | string): Promise<string | null> => {
    const res = await fetch(`${BASE_URL}/tv/${id}/external_ids?api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    return data.imdb_id || null;
  },

  getImdbId: async (id: number | string): Promise<string | null> => {
    const res = await fetch(`${BASE_URL}/movie/${id}/external_ids?api_key=${TMDB_API_KEY}`);
    const data = await res.json();
    return data.imdb_id || null;
  },

  getCollection: async (id: number): Promise<any> => {
    const res = await fetch(`${BASE_URL}/collection/${id}?api_key=${TMDB_API_KEY}&language=${LANGUAGE}`);
    return await res.json();
  }
};
