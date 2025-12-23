import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetMoviesQueryDto } from './dto/get-movies-query.dto';
import { PaginatedMoviesResponseDto, MovieDetailDto, MovieListItemDto } from './dto/movie-response.dto';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { Prisma } from '@prisma/client';
import { CreateMovieDto } from './dto/create-movie.dto';
import slugify from 'slugify';

@Injectable()
export class MoviesService {
  constructor(private prisma: PrismaService) { }

  async findAll(
    query: GetMoviesQueryDto,
    req: RequestWithUser,
  ): Promise<PaginatedMoviesResponseDto> {
    const { page = 1, limit = 20, category, search, subscription_type } = query;

    const where: Prisma.MovieWhereInput = {
      ...(category && {
        categories: {
          some: {
            category: { slug: category },
          },
        },
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(subscription_type && { subscriptionType: subscription_type }),
    };

    const total = await this.prisma.movie.count({ where });
    const pages = Math.ceil(total / limit);

    const movies = await this.prisma.movie.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        posterUrl: true,
        releaseYear: true,
        rating: true,
        subscriptionType: true,
        categories: {
          select: {
            category: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const userId = req.user?.id;

    const movieList: MovieListItemDto[] = movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      slug: movie.slug,
      poster_url: movie.posterUrl ?? undefined,
      release_year: movie.releaseYear ?? undefined,
      rating: movie.rating ? Number(movie.rating) : undefined,
      subscription_type: movie.subscriptionType,
      categories: movie.categories.map((c) => c.category.name),
    }));

    return {
      movies: movieList,
      pagination: { total, page, limit, pages },
    };
  }

  async findOne(slug: string, req: RequestWithUser): Promise<MovieDetailDto> {
    const userId = req.user?.id;

    const movie = await this.prisma.movie.findUnique({
      where: { slug },
      include: {
        categories: {
          select: {
            category: { select: { name: true } },
          },
        },
        files: {
          select: {
            quality: true,
            language: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
        favorites: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    this.prisma.movie.update({
      where: { id: movie.id },
      data: { viewCount: { increment: 1 } },
    });

    const avgRating = movie.reviews.length
      ? movie.reviews.reduce((sum, r) => sum + r.rating, 0) / movie.reviews.length
      : 0;

    return {
      id: movie.id,
      title: movie.title,
      slug: movie.slug,
      description: movie.description ?? undefined,
      release_year: movie.releaseYear ?? undefined,
      duration_minutes: movie.durationMinutes ?? undefined,
      poster_url: movie.posterUrl ?? undefined,
      rating: movie.rating ? Number(movie.rating) : undefined,
      subscription_type: movie.subscriptionType,
      view_count: movie.viewCount,
      is_favorite: movie.favorites.length > 0,
      categories: movie.categories.map((c) => c.category.name),
      files: movie.files.map((f) => ({
        quality: f.quality,
        language: f.language,
      })),
      reviews: {
        average_rating: Number(avgRating.toFixed(1)),
        count: movie.reviews.length,
      },
    };
  }

  async create(dto: CreateMovieDto, userId: string): Promise<MovieDetailDto> {
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const existingCategories = await this.prisma.category.findMany({
      where: { id: { in: dto.categoryIds } },
      select: { id: true },
    });
    const foundIds = new Set(existingCategories.map((c) => c.id));
    const missing = dto.categoryIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new BadRequestException(`Categories not found: ${missing.join(', ')}`);
    }

    const baseSlug = slugify(dto.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.movie.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const movie = await this.prisma.movie.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description ?? null,
        releaseYear: dto.releaseYear ?? null,
        durationMinutes: dto.durationMinutes ?? null,
        posterUrl: dto.posterUrl ?? null,
        rating: dto.rating ? new Prisma.Decimal(dto.rating) : null,
        subscriptionType: dto.subscriptionType ?? 'free',
        viewCount: 0,
        createdBy: userId,
        categories: {
          create: dto.categoryIds.map((categoryId) => ({
            category: { connect: { id: categoryId } },
          })),
        },
        files: {
          create: dto.files.map((file) => ({
            fileUrl: file.fileUrl,
            quality: file.quality,
            language: file.language ?? 'uz',
          })),
        },
      },
      include: { 
        categories: {
          select: { category: { select: { name: true } } },
        },
        files: {
          select: { quality: true, language: true },
        },
        reviews: {
          select: { rating: true },
        },
        favorites: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    const avgRating = movie.reviews.length
      ? movie.reviews.reduce((sum, r) => sum + r.rating, 0) / movie.reviews.length
      : 0;

    return {
      id: movie.id,
      title: movie.title,
      slug: movie.slug,
      description: movie.description ?? undefined,
      release_year: movie.releaseYear ?? undefined,
      duration_minutes: movie.durationMinutes ?? undefined,
      poster_url: movie.posterUrl ?? undefined,
      rating: movie.rating ? Number(movie.rating) : undefined,
      subscription_type: movie.subscriptionType,
      view_count: movie.viewCount,
      is_favorite: movie.favorites.length > 0,
      categories: movie.categories.map((c) => c.category.name),
      files: movie.files.map((f) => ({
        quality: f.quality,
        language: f.language,
      })),
      reviews: {
        average_rating: Number(avgRating.toFixed(1)),
        count: movie.reviews.length,
      },
    };
  }
}