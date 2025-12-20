import { IsString, IsNumber, IsInt, IsArray, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanDto {
    @ApiProperty({ example: 'Premium' })
    @IsString()
    name: string;

    @ApiProperty({ example: 49.99 })
    @IsNumber()
    price: number;

    @ApiProperty({ example: 30 })
    @IsInt()
    duration_days: number;

    @ApiProperty({ example: ['HD sifatli kinolar', 'Reklamasiz', 'Yangi kinolar'] })
    @IsArray()
    @IsString({ each: true })
    features: string[];

    @ApiProperty({ example: true, required: false })
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}