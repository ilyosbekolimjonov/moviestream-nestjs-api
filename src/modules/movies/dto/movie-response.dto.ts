import { SubscriptionType, VideoQuality } from '@prisma/client';

export class MovieFileDto {
    quality: VideoQuality;
    language: string;
    size_mb?: number;
}

export class MovieListItemDto {
    id: string;
    title: string;
    slug: string;
    poster_url?: string;
    release_year?: number;
    rating?: number;
    subscription_type: SubscriptionType;
    categories: string[];
}

export class MovieDetailDto {
    id: string;
    title: string;
    slug: string;
    description?: string;
    release_year?: number;
    duration_minutes?: number;
    poster_url?: string;
    rating?: number;
    subscription_type: SubscriptionType;
    view_count: number;
    is_favorite: boolean;
    categories: string[];
    files: MovieFileDto[];
    reviews: {
        average_rating: number;
        count: number;
    };
}

export class PaginatedMoviesResponseDto {
    movies: MovieListItemDto[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}