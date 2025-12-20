import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsArray, ArrayMinSize, ValidateNested, IsEnum, IsNumber, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionType, VideoQuality } from '@prisma/client';

class CreateMovieFileDto {
    @ApiProperty({ example: 'https://cdn.example.com/movies/movie-720p.mp4' })
    @IsString()
    fileUrl: string;

    @ApiProperty({ enum: VideoQuality, example: VideoQuality.p720 })
    @IsEnum(VideoQuality)
    quality: VideoQuality;

    @ApiPropertyOptional({ example: 'uz' })
    @IsString()
    @IsOptional()
    language?: string = 'uz';
}

export class CreateMovieDto {
    @ApiProperty({ example: 'Yangi Film' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ example: 'Qiziqarli yangi film' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 2025 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    releaseYear?: number;

    @ApiPropertyOptional({ example: 120 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    durationMinutes?: number;

    @ApiPropertyOptional({ example: 'https://example.com/poster.jpg' })
    @IsOptional()
    @IsString()
    posterUrl?: string;

    @ApiPropertyOptional({ example: 8.2, description: 'Rating from 0 to 10' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    @Type(() => Number)
    rating?: number;

    @ApiPropertyOptional({ enum: SubscriptionType })
    @IsEnum(SubscriptionType)
    @IsOptional()
    subscriptionType?: SubscriptionType = 'free';

    @ApiProperty({ example: ['550e8400-e29b-41d4-a716-446655440010'] })
    @IsArray()
    @IsUUID('4', { each: true })
    @ArrayMinSize(1)
    categoryIds: string[];

    @ApiProperty({ type: [CreateMovieFileDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateMovieFileDto)
    @ArrayMinSize(1)
    files: CreateMovieFileDto[];
}