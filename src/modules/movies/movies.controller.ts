import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { GetMoviesQueryDto } from './dto/get-movies-query.dto';
import {
  PaginatedMoviesResponseDto,
  MovieDetailDto,
} from './dto/movie-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateMovieDto } from './dto/create-movie.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Movies')
@ApiBearerAuth('JWT-auth')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) { }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get paginated list of movies with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'category', required: false, type: String, example: 'action' })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'qasoskorlar' })
  @ApiQuery({
    name: 'subscription_type',
    required: false,
    enum: ['free', 'premium'],
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated movies list',
    schema: {
      example: {
        success: true,
        data: {
          movies: [
            {
              id: '550e8400-e29b-41d4-a716-446655440020',
              title: 'Qasoskorlar: Abadiyat Jangi',
              slug: 'qasoskorlar-abadiyat-jangi',
              poster_url: 'https://example.com/posters/infinity-war.jpg',
              release_year: 2018,
              rating: 8.5,
              subscription_type: 'free',
              categories: ['Action', 'Adventure', 'Sci-Fi'],
            },
          ],
          pagination: { total: 50, page: 1, limit: 20, pages: 3 },
        },
      },
    },
  })
  async findAll(
    @Query(ValidationPipe) query: GetMoviesQueryDto,
    @Req() req: RequestWithUser,
  ) {
    const data = await this.moviesService.findAll(query, req);
    return { success: true, data };
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get movie details by slug' })
  @ApiParam({ name: 'slug', type: String, example: 'qasoskorlar-abadiyat-jangi' })
  @ApiResponse({
    status: 200,
    description: 'Movie details',
    schema: {
      example: {
        success: true,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440020',
          title: 'Qasoskorlar: Abadiyat Jangi',
          slug: 'qasoskorlar-abadiyat-jangi',
          description:
            "Qasoskorlar va ularning ittifoqchilari barcha avvalgi g'alabalaridan keyin ham Yerning eng katta xavfi bilan to'qnashishadi.",
          release_year: 2018,
          duration_minutes: 149,
          poster_url: 'https://example.com/posters/infinity-war.jpg',
          rating: 8.5,
          subscription_type: 'free',
          view_count: 15423,
          is_favorite: true,
          categories: ['Action', 'Adventure', 'Sci-Fi'],
          files: [
            { quality: '480p', language: 'uz', size_mb: 800 },
            { quality: '720p', language: 'uz', size_mb: 1500 },
          ],
          reviews: { average_rating: 4.7, count: 352 },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  async findOne(@Param('slug') slug: string, @Req() req: RequestWithUser) {
    const data = await this.moviesService.findOne(slug, req);
    return { success: true, data };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new movie (Admin/Superadmin only)' })
  @ApiBody({
    schema: {
      example: {
        title: 'Yangi Film',
        description: 'Qiziqarli yangi film',
        releaseYear: 2025,
        durationMinutes: 120,
        posterUrl: 'https://example.com/poster.jpg',
        rating: 8.2,
        subscriptionType: 'premium',
        categoryIds: [
          '550e8400-e29b-41d4-a716-446655440010',
          '550e8400-e29b-41d4-a716-446655440011',
        ],
        files: [
          { fileUrl: 'https://cdn.example.com/movies/720p.mp4', quality: 'p720', language: 'uz' },
        ],
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Movie successfully created',
    schema: {
      example: {
        success: true,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440030',
          title: 'Yangi Film',
          slug: 'yangi-film',
          description: 'Qiziqarli yangi film',
          release_year: 2025,
          duration_minutes: 120,
          poster_url: 'https://example.com/poster.jpg',
          rating: 8.2,
          subscription_type: 'premium',
          view_count: 0,
          is_favorite: false,
          categories: ['Action', 'Drama'],
          files: [
            { quality: '720p', language: 'uz' },
          ],
          reviews: { average_rating: 0, count: 0 },
        },
      },
    },
  })

  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient role' })
  async create(@Body(ValidationPipe) dto: CreateMovieDto, @Req() req: RequestWithUser) {
    const userId = req.user?.id;
    const data = await this.moviesService.create(dto, userId);
    return { success: true, data };
  }
}