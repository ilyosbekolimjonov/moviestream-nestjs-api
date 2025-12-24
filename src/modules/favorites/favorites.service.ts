import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) { }

  async findAll(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            slug: true,
            posterUrl: true,
            releaseYear: true,
            rating: true,
            subscriptionType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const movies = favorites.map((fav) => ({
      id: fav.movie.id,
      title: fav.movie.title,
      slug: fav.movie.slug,
      poster_url: fav.movie.posterUrl,
      release_year: fav.movie.releaseYear,
      rating: fav.movie.rating,
      subscription_type: fav.movie.subscriptionType,
    }));

    return {
      movies,
      total: movies.length,
    };
  }

  async create(userId: string, createFavoriteDto: CreateFavoriteDto) {
    const { movie_id } = createFavoriteDto;

    const movie = await this.prisma.movie.findUnique({
      where: { id: movie_id },
      select: { id: true, title: true },
    });

    if (!movie) {
      throw new NotFoundException('Kino topilmadi');
    }

    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId: movie_id,
        },
      },
    });

    if (existingFavorite) {
      throw new ConflictException(
        "Bu kino allaqachon sevimlilar ro'yxatida",
      );
    }

    const favorite = await this.prisma.favorite.create({
      data: {
        userId,
        movieId: movie_id,
      },
    });

    return {
      id: favorite.id,
      movie_id: favorite.movieId,
      movie_title: movie.title,
      created_at: favorite.createdAt.toISOString(),
    };
  }

  async remove(userId: string, movieId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException(
        "Bu kino sevimlilar ro'yxatida topilmadi",
      );
    }

    await this.prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });

    return true;
  }

  async isFavorite(userId: string, movieId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    return !!favorite;
  }
}