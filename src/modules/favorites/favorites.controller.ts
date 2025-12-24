import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) { }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Foydalanuvchining barcha sevimli kinolarini olish" })
  @ApiResponse({
    status: 200,
    description: 'Sevimli kinolar muvaffaqiyatli qaytarildi',
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
            },
          ],
          total: 12,
        },
      },
    },
  })
  async findAll(@Request() req) {
    const data = await this.favoritesService.findAll(req.user.id);
    return {
      success: true,
      data,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Yangi kinoni sevimlilarga qo'shish" })
  @ApiResponse({
    status: 201,
    description: "Kino sevimlilar ro'yxatiga qo'shildi",
    schema: {
      example: {
        success: true,
        message: "Kino sevimlilar ro'yxatiga qo'shildi",
        data: {
          id: '550e8400-e29b-41d4-a716-446655440070',
          movie_id: '550e8400-e29b-41d4-a716-446655440021',
          movie_title: "Qasoskorlar: Yakuniy o'yin",
          created_at: '2025-05-12T19:20:15Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Kino topilmadi',
  })
  @ApiResponse({
    status: 409,
    description: "Bu kino allaqachon sevimlilar ro'yxatida",
  })
  async create(@Request() req, @Body() createFavoriteDto: CreateFavoriteDto) {
    const data = await this.favoritesService.create(
      req.user.id,
      createFavoriteDto,
    );
    return {
      success: true,
      message: "Kino sevimlilar ro'yxatiga qo'shildi",
      data,
    };
  }

  @Delete(':movie_id')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kinoni sevimlilardan o\'chirish' })
  @ApiResponse({
    status: 200,
    description: "Kino sevimlilar ro'yxatidan o'chirildi",
    schema: {
      example: {
        success: true,
        message: "Kino sevimlilar ro'yxatidan o'chirildi",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Bu kino sevimlilar ro'yxatida topilmadi",
  })
  async remove(@Request() req, @Param('movie_id') movieId: string) {
    await this.favoritesService.remove(req.user.id, movieId);
    return {
      success: true,
      message: "Kino sevimlilar ro'yxatidan o'chirildi",
    };
  }
}